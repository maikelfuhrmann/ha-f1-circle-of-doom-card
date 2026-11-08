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
    color: /^#?[0-9a-f]{6}$/i.test(d.team_color ?? '') ? `#${d.team_color.replace('#', '')}` : '#94a3b8',
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
  if (!config || !config.entity) throw new Error('Timing-Entity fehlt: entity: sensor.f1_driver_positions');
  for (const key of ['entity', 'session_entity', 'session_status_entity', 'track_status_entity']) {
    if (typeof config[key] !== 'string' || !/^sensor\.[a-z0-9_]+$/.test(config[key])) {
      throw new Error(`${key}: Bitte eine passende Sensor-Entity angeben.`);
    }
  }
  const c = { title: 'Circle of Doom', pit_loss: 22, uncertainty: 2, stale_after: 90, ...config };
  for (const [key, min, max] of [['pit_loss', 1, 120], ['uncertainty', 0, 30], ['stale_after', 15, 600]]) {
    if (typeof c[key] !== 'number' || !Number.isFinite(c[key]) || c[key] < min || c[key] > max) {
      throw new Error(`${key} muss eine Zahl zwischen ${min} und ${max} sein.`);
    }
  }
  if (c.uncertainty >= c.pit_loss) throw new Error('uncertainty muss kleiner als pit_loss sein.');
  if (c.reference_lap_seconds != null && (typeof c.reference_lap_seconds !== 'number' || !Number.isFinite(c.reference_lap_seconds) || c.reference_lap_seconds < 35 || c.reference_lap_seconds > 240)) {
    throw new Error('reference_lap_seconds muss zwischen 35 und 240 liegen.');
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

export function buildModel(states, config, selectedId, now = Date.now()) {
  const timing = states?.[config.entity];
  const session = states?.[config.session_entity];
  const status = states?.[config.session_status_entity];
  const track = states?.[config.track_status_entity];
  const drivers = normaliseDrivers(timing?.attributes?.drivers).filter(d => !d.retired);
  const selected = drivers.find(d => d.id === String(selectedId ?? config.driver ?? '')) ?? drivers[0];
  const base = { drivers, selected, ready: false, lap: null, prediction: null,
    updated: timestamp(timing), track: track?.state ?? 'unknown', session: session?.state ?? 'unknown' };
  const stop = (reason, message) => ({ ...base, reason, message });
  if (!timing || !session || !status || !track) return stop('configuration', 'Timing-, Session- und Streckenstatus-Sensoren zuordnen und in F1 Sensor aktivieren.');
  if (status.state !== 'live') return stop('idle', 'Wartet auf ein laufendes Rennen oder einen Sprint.');
  if (!['Race', 'Sprint'].includes(session.state)) return stop('session', 'Das Boxenstoppfenster ist nur für Rennen und Sprint verfügbar.');
  if (track.state !== 'CLEAR') return stop('track', ['SC', 'VSC', 'RED', 'YELLOW'].includes(track.state)
    ? `Prognose pausiert: ${track.state}. Die Abstände und der Boxenstoppverlust sind unter diesen Bedingungen nicht verlässlich.`
    : 'Streckenstatus fehlt. Keine Prognose möglich.');
  if (session.attributes?.active === false || ['unknown', 'unavailable'].includes(timing.state)) return stop('idle', 'Keine aktuellen Timing-Daten verfügbar.');
  // Timing changes continuously. Stable status entities can legitimately have old last_updated.
  const updated = timestamp(timing);
  if (updated === null || now - updated > config.stale_after * 1000 || updated > now + 10000) return stop('stale', 'Timing-Daten sind veraltet oder ohne gültigen Zeitstempel. Prognose pausiert.');
  if (drivers.length < 2) return stop('empty', 'Wartet auf die Abstände der Fahrer.');
  if (drivers.some((d, i) => !d.id || d.position !== i + 1) || new Set(drivers.map(d => d.id)).size !== drivers.length) return stop('order', 'Die Fahrerreihenfolge ist unvollständig. Prognose pausiert.');
  if (drivers.some(d => d.lapped)) return stop('lapped', 'Überrundete Fahrer im Feld: Ohne genaue Rundenzuordnung ist keine sichere Rückkehrprognose möglich.');
  if (drivers.some(d => d.gap === null)) return stop('gaps', 'Zeitabstände fehlen. Prognose pausiert, bis alle aktiven Fahrer zugeordnet werden können.');
  if (drivers.some((d, i) => i > 0 && d.gap < drivers[i - 1].gap)) return stop('order', 'Zeitabstände und Reihenfolge sind noch nicht synchron.');
  if (drivers.some(d => d.inPit || d.stopped)) return stop('pit', 'Ein Fahrer ist in der Box, auf der Ausfahrt oder angehalten. Das Feld muss sich zuerst neu sortieren.');
  base.lap = referenceLap(drivers[0], config.reference_lap_seconds);
  if (base.lap === null) return stop('pace', 'Wartet auf mindestens zwei verwertbare Rundenzeiten des Führenden.');
  if (drivers.some(d => d.gap >= base.lap) || selected.gap + config.pit_loss + config.uncertainty >= base.lap) return stop('lap_boundary', 'Das Fenster überschreitet eine Referenzrunde. Prognose wegen möglicher Überrundung pausiert.');
  return { ...base, ready: true, reason: 'estimate', message: 'Schätzung aus Zeitabständen · kein GPS',
    prediction: project(drivers, selected, config.pit_loss, config.uncertainty) };
}
