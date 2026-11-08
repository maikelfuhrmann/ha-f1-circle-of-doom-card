import { pitSettings } from './presets.js';

/** Pure timing model. All inputs are HA entity snapshots; no network access. */
export function seconds(value) {
  if (typeof value === 'number') return Number.isFinite(value) && value >= 0 ? value : null;
  if (typeof value !== 'string') return null;
  const s = value.trim().replace(',', '.');
  if (/^\+?\d+(\.\d+)?$/.test(s)) return Number(s.replace('+', ''));
  const match = s.match(/^(\d+):([0-5]\d(?:\.\d+)?)$/);
  return match ? Number(match[1]) * 60 + Number(match[2]) : null;
}

export function normaliseDrivers(input) {
  if (!Array.isArray(input)) return [];
  return input.filter(d => d && typeof d === 'object').map(d => ({
    id: String(d.racing_number ?? d.tla ?? ''),
    code: String(d.tla ?? d.racing_number ?? '?'),
    name: String(d.name ?? d.tla ?? '?'),
    color: typeof d.team_color === 'string' && /^#?[0-9a-f]{6}$/i.test(d.team_color) ? `#${d.team_color.replace('#', '')}` : '#94a3b8',
    position: Number(d.current_position),
    gap: Number(d.current_position) === 1 ? 0 : seconds(d.gap_to_leader),
    gapLabel: String(d.gap_to_leader ?? ''),
    lapped: /lap|runde/i.test(String(d.gap_to_leader ?? '')),
    retired: d.retired === true || d.status === 'out',
    inPit: d.in_pit === true || d.pit_out === true || ['pit_in', 'pit_out'].includes(d.status),
    stopped: d.stopped === true,
    laps: d.laps && typeof d.laps === 'object' ? d.laps : {},
  })).sort((a, b) => a.position - b.position);
}

export function referenceLap(driver, override) {
  if (override != null) return seconds(override);
  const recent = Object.entries(driver?.laps ?? {})
    .filter(([lap]) => /^\d+$/.test(lap))
    .sort((a, b) => Number(b[0]) - Number(a[0])).slice(0, 3)
    .map(([, time]) => seconds(time)).filter(t => t !== null && t >= 35 && t <= 240);
  if (recent.length < 2) return null;
  recent.sort((a, b) => a - b);
  return recent.length % 2 ? recent[Math.floor(recent.length / 2)] : (recent[0] + recent[1]) / 2;
}

export function timestamp(entity) {
  const raw = entity?.last_reported ?? entity?.last_updated;
  const value = Date.parse(raw ?? '');
  return Number.isFinite(value) ? value : null;
}

export function validateConfig(config) {
  if (!config || !config.entity) throw new Error('Missing timing entity: entity: sensor.f1_driver_positions');
  for (const key of ['entity', 'session_entity', 'session_status_entity', 'track_status_entity']) {
    if (typeof config[key] !== 'string' || !/^sensor\.[a-z0-9_]+$/.test(config[key])) {
      throw new Error(`${key}: Please provide a valid sensor entity.`);
    }
  }
  const c = { title: 'Circle of Doom', auto_pit_loss: true, pit_loss: 22, vsc_pit_loss: 14.3, uncertainty: 2, stale_after: 90, ...config };
  if (typeof c.auto_pit_loss !== 'boolean') throw new Error('auto_pit_loss must be true or false.');
  for (const key of ['circuit', 'storage_key']) if (c[key] != null && (typeof c[key] !== 'string' || !c[key].trim())) throw new Error(`${key} must be a non-empty string.`);
  for (const [key, min, max] of [['pit_loss', 1, 120], ['vsc_pit_loss', 1, 120], ['uncertainty', 0, 30], ['stale_after', 15, 600]]) {
    if (typeof c[key] !== 'number' || !Number.isFinite(c[key]) || c[key] < min || c[key] > max) {
      throw new Error(`${key} must be a number between ${min} and ${max}.`);
    }
  }
  if (c.uncertainty >= c.pit_loss) throw new Error('uncertainty must be less than pit_loss.');
  if (c.reference_lap_seconds != null && (typeof c.reference_lap_seconds !== 'number' || !Number.isFinite(c.reference_lap_seconds) || c.reference_lap_seconds < 35 || c.reference_lap_seconds > 240)) {
    throw new Error('reference_lap_seconds must be between 35 and 240.');
  }
  return c;
}

export function project(drivers, selected, loss, uncertainty) {
  const others = drivers.filter(d => d.id !== selected.id);
  // Equal gaps are deliberately counted ahead: no promise of a safe release at a tie.
  const rank = delta => 1 + others.filter(d => d.gap <= selected.gap + delta + 0.001).length;
  const target = selected.gap + loss;
  const ahead = others.filter(d => d.gap <= target).at(-1);
  const behind = others.find(d => d.gap > target);
  return {
    rank: rank(loss), best: rank(Math.max(0, loss - uncertainty)), worst: rank(loss + uncertainty),
    target, ahead, behind,
    aheadGap: ahead ? target - ahead.gap : null,
    behindGap: behind ? behind.gap - target : null,
  };
}

export function buildModel(states, config, selectedId, now = Date.now(), overrides = {}) {
  const timing = states?.[config.entity];
  const session = states?.[config.session_entity];
  const status = states?.[config.session_status_entity];
  const track = states?.[config.track_status_entity];
  const drivers = normaliseDrivers(timing?.attributes?.drivers).filter(d => !d.retired);
  const selected = drivers.find(d => d.id === String(selectedId ?? config.driver ?? '')) ?? drivers[0];
  const settings = pitSettings(states, config, overrides);
  const base = { drivers, selected, settings, ready: false, lap: null, prediction: null,
    updated: timestamp(timing), track: track?.state ?? 'unknown', session: session?.state ?? 'unknown' };
  const stop = (reason, message) => ({ ...base, reason, message });
  if (!timing || !session || !status || !track) return stop('configuration', 'Assign the timing, session and track status sensors, and enable them in F1 Sensor.');
  if (status.state !== 'live') return stop('idle', 'Waiting for a live race or sprint.');
  if (!['Race', 'Sprint'].includes(session.state)) return stop('session', 'The pit window is only available during races and sprints.');
  if (!['CLEAR', 'VSC'].includes(track.state)) return stop('track', ['SC', 'RED', 'YELLOW'].includes(track.state)
    ? `Prediction paused: ${track.state}. Gaps and pit loss are unreliable in these conditions.`
    : 'Track status is unavailable. No prediction possible.');
  if (session.attributes?.active === false || ['unknown', 'unavailable'].includes(timing.state)) return stop('idle', 'No current timing data available.');
  if (config.uncertainty >= settings.loss) return stop('settings', 'Uncertainty must be less than the active pit loss. Adjust the values above.');
  // Timing changes continuously. Stable status entities can legitimately have old last_updated.
  const updated = timestamp(timing);
  if (updated === null || now - updated > config.stale_after * 1000 || updated > now + 10000) return stop('stale', 'Timing data is stale or has no valid timestamp. Prediction paused.');
  if (drivers.length < 2) return stop('empty', 'Waiting for driver gaps.');
  if (drivers.some((d, i) => !d.id || d.position !== i + 1) || new Set(drivers.map(d => d.id)).size !== drivers.length) return stop('order', 'The running order is incomplete. Prediction paused.');
  if (drivers.some(d => d.lapped)) return stop('lapped', 'Lapped cars in the field: A reliable rejoin prediction requires precise lap tracking.');
  if (drivers.some(d => d.gap === null)) return stop('gaps', 'Time gaps are missing. Prediction paused until all active drivers can be placed.');
  if (drivers.some((d, i) => i > 0 && d.gap < drivers[i - 1].gap)) return stop('order', 'Time gaps and running order are not yet in sync.');
  if (drivers.some(d => d.inPit || d.stopped)) return stop('pit', 'A driver is in the pits, exiting the pits or stopped. Waiting for the running order to settle.');
  base.lap = referenceLap(drivers[0], config.reference_lap_seconds);
  if (base.lap === null) return stop('pace', 'Waiting for at least two usable lap times from the leader.');
  if (drivers.some(d => d.gap >= base.lap) || selected.gap + settings.loss + config.uncertainty >= base.lap) return stop('lap_boundary', 'The window exceeds one reference lap. Prediction paused due to possible lapping.');
  return { ...base, ready: true, reason: 'estimate', message: settings.mode === 'vsc' ? 'VSC scenario · assumes VSC stays active for the entire stop.' : 'Estimate from time gaps · not GPS',
    prediction: project(drivers, selected, settings.loss, config.uncertainty) };
}
