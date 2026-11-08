/* F1 Circle of Doom Card v0.3.0 | MIT | maikelfuhrmann */
/** Green defaults: Formula1.com race previews. VSC: heuristic 65% of green,
 * rounded to 0.1s; not measured VSC data. See docs/presets.md. */
const CIRCUITS = [
  {
    "id": "albert-park",
    "name": "Albert Park",
    "aliases": [
      "Melbourne",
      "Albert Park Grand Prix Circuit"
    ],
    "green": 19.3,
    "vsc": 12.5,
    "year": 2026,
    "source": "https://www.formula1.com/en/latest/article/need-to-know-the-most-important-facts-stats-and-trivia-ahead-of-the-2026.7gyyqNLcwuCPZdXvgGwhCM.7gyyqNLcwuCPZdXvgGwhCM"
  },
  {
    "id": "shanghai",
    "name": "Shanghai",
    "aliases": [
      "Shanghai International Circuit"
    ],
    "green": 23.67,
    "vsc": 15.4,
    "year": 2026,
    "source": "https://www.formula1.com/en/latest/article/need-to-know-the-most-important-facts-stats-and-trivia-ahead-of-the-2026-chinese-grand-prix.2KbEu5okNlIMtVgklEpGJT.2KbEu5okNlIMtVgklEpGJT"
  },
  {
    "id": "suzuka",
    "name": "Suzuka",
    "aliases": [
      "Suzuka International Racing Course"
    ],
    "green": 23.75,
    "vsc": 15.4,
    "year": 2026,
    "source": "https://www.formula1.com/en/latest/article/need-to-know-the-most-important-facts-stats-and-trivia-ahead-of-the-2026-japanese-grand-prix.59xoCL07qjNCWPVzBJOmK2.59xoCL07qjNCWPVzBJOmK2"
  },
  {
    "id": "sakhir",
    "name": "Sakhir",
    "aliases": [
      "Bahrain International Circuit",
      "Bahrain"
    ],
    "green": 22.9,
    "vsc": 14.9,
    "year": 2025,
    "source": "https://www.formula1.com/en/latest/article/need-to-know-the-most-important-facts-stats-and-trivia-ahead-of-the-2025-bahrain-grand-prix.2UBRH78pLhBrYbZoChAvHZ"
  },
  {
    "id": "jeddah",
    "name": "Jeddah",
    "aliases": [
      "Jeddah Corniche Circuit"
    ],
    "green": 19.2,
    "vsc": 12.5,
    "year": 2025,
    "source": "https://www.formula1.com/en/latest/article/need-to-know-the-most-crucial-facts-stats-and-trivia-ahead-of-the-2025-saudi-arabian-grand-prix.6A0OrkHOtZDMRyFg16hMbY"
  },
  {
    "id": "miami",
    "name": "Miami",
    "aliases": [
      "Miami International Autodrome"
    ],
    "green": 18.76,
    "vsc": 12.2,
    "year": 2026,
    "source": "https://www.formula1.com/en/latest/article/need-to-know-the-most-important-facts-stats-and-trivia-ahead-of-the-2026-miami-grand-prix.6CaXXUBmgXIxzTWv26Qc6b"
  },
  {
    "id": "imola",
    "name": "Imola",
    "aliases": [
      "Autodromo Enzo e Dino Ferrari"
    ],
    "green": 28.2,
    "vsc": 18.3,
    "year": 2025,
    "source": "https://www.formula1.com/en/latest/article/need-to-know-the-most-important-facts-stats-and-trivia-ahead-of-the-2025-emilia-romagna-grand-prix.7tIS2Cfdc8PVE1gUCVqJHI"
  },
  {
    "id": "monaco",
    "name": "Monaco",
    "aliases": [
      "Monte Carlo",
      "Circuit de Monaco"
    ],
    "green": 19.92,
    "vsc": 12.9,
    "year": 2026,
    "source": "https://www.formula1.com/en/latest/article/need-to-know-the-most-important-facts-stats-and-trivia-ahead-of-the-2026-monaco-grand-prix.1dphiN7qz6fiI4sm4MaC4V"
  },
  {
    "id": "barcelona",
    "name": "Barcelona-Catalunya",
    "aliases": [
      "Barcelona",
      "Catalunya",
      "Circuit de Barcelona Catalunya",
      "Montmelo"
    ],
    "green": 22.96,
    "vsc": 14.9,
    "year": 2026,
    "source": "https://www.formula1.com/en/latest/article/need-to-know-the-most-important-facts-stats-and-trivia-ahead-of-the-2026-barcelona-catalunya-grand-prix.51RmTAVS0jveoGWnBr9Ul"
  },
  {
    "id": "montreal",
    "name": "Montreal",
    "aliases": [
      "Montréal",
      "Circuit Gilles Villeneuve"
    ],
    "green": 18.25,
    "vsc": 11.9,
    "year": 2026,
    "source": "https://www.formula1.com/en/latest/article/need-to-know-the-most-important-facts-stats-and-trivia-ahead-of-2026-canadian-grand-prix.5mxhs5HB0dFrvjaz7sbBGR"
  },
  {
    "id": "spielberg",
    "name": "Red Bull Ring",
    "aliases": [
      "Spielberg"
    ],
    "green": 20.02,
    "vsc": 13,
    "year": 2026,
    "source": "https://www.formula1.com/en/latest/article/need-to-know-the-most-important-facts-stats-and-trivia-ahead-of-the-2026-austrian-grand-prix.5c3It3dAheBaaNuzedrXPx"
  },
  {
    "id": "silverstone",
    "name": "Silverstone",
    "aliases": [
      "Silverstone Circuit"
    ],
    "green": 20,
    "vsc": 13,
    "year": 2026,
    "source": "https://www.formula1.com/en/latest/article/need-to-know-the-most-important-facts-stats-and-trivia-ahead-of-the-2026-british-grand-prix.6zB1eKpKSqJjdYtLxye7eG"
  },
  {
    "id": "spa",
    "name": "Spa-Francorchamps",
    "aliases": [
      "Spa",
      "Circuit de Spa Francorchamps"
    ],
    "green": 18.5,
    "vsc": 12,
    "year": 2026,
    "source": "https://www.formula1.com/en/latest/article/need-to-know-the-most-important-facts-stats-and-trivia-ahead-of-the-2026-belgian-grand-prix.79EYKMXkm1MLXnciMgrPyY.79EYKMXkm1MLXnciMgrPyY"
  },
  {
    "id": "hungaroring",
    "name": "Hungaroring",
    "aliases": [
      "Budapest",
      "Mogyorod"
    ],
    "green": 20.56,
    "vsc": 13.4,
    "year": 2026,
    "source": "https://www.formula1.com/en/latest/article/need-to-know-the-most-important-facts-stats-and-trivia-ahead-of-the-2026-hungarian-grand-prix.5Zhle8vMBDwzt2OSoCgk4d"
  },
  {
    "id": "zandvoort",
    "name": "Zandvoort",
    "aliases": [
      "Circuit Zandvoort"
    ],
    "green": 18.09,
    "vsc": 11.8,
    "year": 2026,
    "source": "https://www.formula1.com/en/latest/article/need-to-know-the-most-important-facts-stats-and-trivia-ahead-of-the-2026-dutch-gp.7rXg1scAXG5IMsHc9k74g4"
  },
  {
    "id": "monza",
    "name": "Monza",
    "aliases": [
      "Autodromo Nazionale Monza"
    ],
    "green": 24.14,
    "vsc": 15.7,
    "year": 2026,
    "source": "https://www.formula1.com/en/latest/article/need-to-know-the-most-important-facts-stats-and-trivia-ahead-of-the-2026-italian-grand-prix.3R2slU8oSHdeOc5lidJDGy"
  },
  {
    "id": "baku",
    "name": "Baku",
    "aliases": [
      "Baku City Circuit"
    ],
    "green": 19.27,
    "vsc": 12.5,
    "year": 2026,
    "source": "https://www.formula1.com/en/latest/article/need-to-know-the-most-important-facts-stats-and-trivia-ahead-of-the-2026-azerbaijan-grand-prix.3PkKCxoeboOkSc18pCB2z.3PkKCxoeboOkSc18pCB2z"
  },
  {
    "id": "marina-bay",
    "name": "Marina Bay",
    "aliases": [
      "Singapore",
      "Marina Bay Street Circuit"
    ],
    "green": 22.44,
    "vsc": 14.6,
    "year": 2026,
    "source": "https://www.formula1.com/en/latest/article/need-to-know-the-most-important-facts-stats-and-trivia-ahead-of-the-2026-singapore-grand-prix.2yF5JZuQTWUoUmbDH4niHv"
  },
  {
    "id": "austin",
    "name": "Circuit of the Americas",
    "aliases": [
      "Austin",
      "COTA"
    ],
    "green": 19.9,
    "vsc": 12.9,
    "year": 2026,
    "source": "https://www.formula1.com/en/latest/article/need-to-know-the-most-important-facts-stats-and-trivia-ahead-of-the-2026-united-states-grand-prix.3yCUtnzlXLwOvhVtmsdVRK"
  },
  {
    "id": "mexico-city",
    "name": "Mexico City",
    "aliases": [
      "Mexico",
      "Autodromo Hermanos Rodriguez"
    ],
    "green": 21.78,
    "vsc": 14.2,
    "year": 2026,
    "source": "https://www.formula1.com/en/latest/article/need-to-know-the-most-important-facts-stats-and-trivia-ahead-of-the-2026-mexico-city-grand-prix.7n5BnpkqmEkgJR61h8yqGv"
  },
  {
    "id": "interlagos",
    "name": "Interlagos",
    "aliases": [
      "Sao Paulo",
      "São Paulo",
      "Autodromo Jose Carlos Pace"
    ],
    "green": 21.83,
    "vsc": 14.2,
    "year": 2026,
    "source": "https://www.formula1.com/en/latest/article/need-to-know-the-most-important-facts-stats-and-trivia-ahead-of-the-2026-sao-paulo-grand-prix.3w1LZutz0yrGfP2Iz38vd8"
  },
  {
    "id": "las-vegas",
    "name": "Las Vegas",
    "aliases": [
      "Las Vegas Strip Circuit"
    ],
    "green": 20,
    "vsc": 13,
    "year": 2025,
    "source": "https://www.formula1.com/en/latest/article/need-to-know-the-most-important-facts-stats-and-trivia-ahead-of-the-2025-las.2I0688JAOAFKCPbDIZGPZo"
  },
  {
    "id": "lusail",
    "name": "Lusail",
    "aliases": [
      "Losail",
      "Lusail International Circuit"
    ],
    "green": 26.3,
    "vsc": 17.1,
    "year": 2025,
    "source": "https://www.formula1.com/en/latest/article/need-to-know-the-most-important-facts-stats-and-trivia-ahead-of-the-2025-qatar-grand-prix.6DxCdCUowmWJJQMOTOPZI7.6DxCdCUowmWJJQMOTOPZI7"
  },
  {
    "id": "yas-marina",
    "name": "Yas Marina",
    "aliases": [
      "Yas Marina Circuit",
      "Abu Dhabi"
    ],
    "green": 21,
    "vsc": 13.7,
    "year": 2025,
    "source": "https://www.formula1.com/en/latest/article/need-to-know-the-most-important-facts-stats-and-trivia-ahead-of-the-2025-abu.5pGXiI5uO3um15txovxKwc"
  },
  {
    "id": "sepang",
    "name": "Sepang",
    "aliases": [
      "Sepang International Circuit",
      "Kuala Lumpur"
    ],
    "green": 23.7,
    "vsc": 15.4,
    "year": 2026,
    "source": "https://www.formula1.com/en/latest/article/need-to-know-the-most-important-facts-stats-and-trivia-ahead-of-the-2026-bahrain-grand-prix-in-malaysia.7q5fTKLLQ5TrEcsNerl406.7q5fTKLLQ5TrEcsNerl406"
  }
];

const circuitKey = value => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
const validName = value => typeof value === 'string' && value.trim() && !['unknown', 'unavailable'].includes(value.toLowerCase());
function circuitContext(states, config) {
  const current = states?.[config.session_entity]?.attributes ?? {};
  const status = states?.[config.session_status_entity]?.attributes ?? {};
  const fields = ['circuit_short_name', 'meeting_location'];
  const attrs = fields.some(k => validName(current[k])) ? current : status;
  const names = config.circuit ? [config.circuit] : fields.map(k => attrs[k]).filter(validName);
  const preset = names.map(name => CIRCUITS.find(c => [c.id, c.name, ...c.aliases].some(a => circuitKey(a) === circuitKey(name)))).find(Boolean);
  return { preset, id: preset?.id ?? `unknown:${circuitKey(names[0]) || 'unavailable'}`, name: preset?.name ?? names[0] ?? 'Circuit unavailable' };
}

function pitSettings(states, config, overrides = {}) {
  const circuit = circuitContext(states, config);
  const baseline = config.auto_pit_loss && circuit.preset;
  const defaults = { green: baseline ? baseline.green : config.pit_loss, vsc: baseline ? baseline.vsc : config.vsc_pit_loss };
  const saved = overrides?.[circuit.id];
  const value = mode => typeof saved?.[mode] === 'number' && Number.isFinite(saved[mode]) && saved[mode] >= 1 && saved[mode] <= 120 ? saved[mode] : defaults[mode];
  const session = states?.[config.session_entity];
  const live = states?.[config.session_status_entity]?.state === 'live' && ['Race', 'Sprint'].includes(session?.state) && session?.attributes?.active !== false;
  const mode = live && states?.[config.track_status_entity]?.state === 'VSC' ? 'vsc' : 'green';
  return { ...circuit, defaults, green: value('green'), vsc: value('vsc'), mode, loss: value(mode),
    custom: { green: value('green') !== defaults.green, vsc: value('vsc') !== defaults.vsc },
    source: baseline ? 'Circuit preset' : config.auto_pit_loss ? 'Generic fallback · no circuit preset' : 'YAML defaults' };
}


/** Pure timing model. All inputs are HA entity snapshots; no network access. */
function seconds(value) {
  if (typeof value === 'number') return Number.isFinite(value) && value >= 0 ? value : null;
  if (typeof value !== 'string') return null;
  const s = value.trim().replace(',', '.');
  if (/^\+?\d+(\.\d+)?$/.test(s)) return Number(s.replace('+', ''));
  const match = s.match(/^(\d+):([0-5]\d(?:\.\d+)?)$/);
  return match ? Number(match[1]) * 60 + Number(match[2]) : null;
}

function lapDeficit(value) {
  const match = String(value ?? '').trim().match(/^\+?\s*([1-9]\d*)\s*(?:l|laps?|runden?)$/i);
  return match ? Number(match[1]) : 0;
}

// Keep classification gaps unwrapped. Only a numeric interval can recover a
// missing gap; a lap label alone is never converted using an assumed lap time.
function resolveGaps(drivers) {
  return drivers.reduce((resolved, driver) => {
    const previous = resolved.at(-1);
    const chained = driver.gap === null && previous?.gap != null &&
      driver.position === previous.position + 1 && Number.isFinite(driver.interval);
    resolved.push({ ...driver, gap: chained ? previous.gap + driver.interval : driver.gap,
      gapSource: chained ? 'intervals' : driver.gap === null ? 'missing' : 'timing' });
    return resolved;
  }, []);
}

function normaliseDrivers(input) {
  if (!Array.isArray(input)) return [];
  return input.filter(d => d && typeof d === 'object').map(d => ({
    id: String(d.racing_number ?? d.tla ?? ''),
    code: String(d.tla ?? d.racing_number ?? '?'),
    name: String(d.name ?? d.tla ?? '?'),
    color: typeof d.team_color === 'string' && /^#?[0-9a-f]{6}$/i.test(d.team_color) ? `#${d.team_color.replace('#', '')}` : '#94a3b8',
    position: Number(d.current_position),
    gap: Number(d.current_position) === 1 ? 0 : seconds(d.gap_to_leader),
    gapLabel: String(d.gap_to_leader ?? ''),
    // "Lap 12" is the leader's current lap, whereas "+1 LAP" is a deficit.
    // Unknown text remains a missing gap; never interpret a lap counter as lapping.
    lapped: lapDeficit(d.gap_to_leader) > 0,
    lapsBehind: lapDeficit(d.gap_to_leader),
    interval: seconds(d.interval_to_position_ahead),
    retired: d.retired === true || d.status === 'out',
    inPit: d.in_pit === true || d.pit_out === true || ['pit_in', 'pit_out'].includes(d.status),
    stopped: d.stopped === true,
    laps: d.laps && typeof d.laps === 'object' ? d.laps : {},
  })).sort((a, b) => a.position - b.position);
}

function referenceLap(driver, override) {
  if (override != null) return seconds(override);
  const recent = Object.entries(driver?.laps ?? {})
    .filter(([lap]) => /^\d+$/.test(lap))
    .sort((a, b) => Number(b[0]) - Number(a[0])).slice(0, 3)
    .map(([, time]) => seconds(time)).filter(t => t !== null && t >= 35 && t <= 240);
  if (recent.length < 2) return null;
  recent.sort((a, b) => a - b);
  return recent.length % 2 ? recent[Math.floor(recent.length / 2)] : (recent[0] + recent[1]) / 2;
}

function timestamp(entity) {
  const raw = entity?.last_reported ?? entity?.last_updated;
  const value = Date.parse(raw ?? '');
  return Number.isFinite(value) ? value : null;
}

function validateConfig(config) {
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

function project(drivers, selected, loss, uncertainty) {
  const others = drivers.filter(d => d.id !== selected.id);
  // Equal gaps are deliberately counted ahead: no promise of a safe release at a tie.
  const rank = delta => 1 + others.filter(d => d.gap <= selected.gap + delta + 0.001).length;
  const target = selected.gap + loss;
  const before = others.filter(d => d.gap <= target + 0.001);
  const after = others.filter(d => d.gap > target + 0.001);
  const ahead = before.at(-1), behind = after[0];
  const order = [...before, { ...selected, gap: target }, ...after]
    .map((d, i) => ({ ...d, projectedPosition: i + 1, selected: d.id === selected.id }));
  return {
    rank: rank(loss), best: rank(Math.max(0, loss - uncertainty)), worst: rank(loss + uncertainty),
    target, ahead, behind, order,
    aheadGap: ahead ? Math.max(0, target - ahead.gap) : null,
    behindGap: behind ? behind.gap - target : null,
  };
}

function trafficNeighbors(drivers, selected, target, lap) {
  const wrap = value => ((value % lap) + lap) % lap;
  const traffic = drivers.filter(d => d.id !== selected.id).map(driver => {
    const offset = wrap(target - driver.gap);
    const tied = offset < 0.001 || lap - offset < 0.001;
    return { driver, aheadGap: tied ? 0 : offset, behindGap: tied ? 0 : lap - offset };
  });
  const nearest = key => [...traffic].sort((a,b) => Math.abs(a[key]-b[key]) < 0.001 ? a.driver.position-b.driver.position : a[key]-b[key])[0];
  const ahead = nearest('aheadGap'), behind = nearest('behindGap');
  return { ahead: ahead?.driver, behind: behind?.driver, aheadGap: ahead?.aheadGap, behindGap: behind?.behindGap };
}

function buildModel(states, config, selectedId, now = Date.now(), overrides = {}) {
  const timing = states?.[config.entity];
  const session = states?.[config.session_entity];
  const status = states?.[config.session_status_entity];
  const track = states?.[config.track_status_entity];
  const drivers = resolveGaps(normaliseDrivers(timing?.attributes?.drivers)).filter(d => !d.retired);
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
  if (drivers.some(d => d.gap === null)) return stop('gaps', 'A time gap or numeric interval is missing. Lap labels alone cannot locate traffic. Waiting for complete timing.');
  if (drivers.some((d, i) => i > 0 && d.gap < drivers[i - 1].gap)) return stop('order', 'Time gaps and running order are not yet in sync.');
  if (drivers.some(d => d.inPit || d.stopped)) return stop('pit', 'A driver is in the pits, exiting the pits or stopped. Waiting for the running order to settle.');
  base.lap = referenceLap(drivers[0], config.reference_lap_seconds);
  if (base.lap === null) return stop('pace', 'Waiting for at least two usable lap times from the leader.');
  return { ...base, ready: true, reason: 'estimate', message: settings.mode === 'vsc' ? 'VSC scenario · assumes VSC stays active for the entire stop.' : 'Estimate from time gaps · not GPS',
    prediction: project(drivers, selected, settings.loss, config.uncertainty),
    traffic: trafficNeighbors(drivers, selected, selected.gap + settings.loss, base.lap),
    recovered: drivers.filter(d => d.gapSource === 'intervals').length };
}

// Labels are spread independently of the timing markers. Markers never move off
// their true time-gap angle, even when several cars have nearly identical gaps.
function circlePoint(seconds, lap, radius = 125) {
  const angle = ((seconds % lap) + lap) % lap / lap * Math.PI * 2 - Math.PI / 2;
  return [220 + radius * Math.cos(angle), 220 + radius * Math.sin(angle)];
}

function circleLabels(drivers, lap) {
  const items = drivers.map(d => {
    const pos = circlePoint(d.gap, lap);
    return { id: d.id, pos, side: pos[0] < 220 ? 'left' : 'right', y: pos[1] };
  });
  for (const side of ['left', 'right']) {
    const rows = items.filter(d => d.side === side).sort((a, b) => a.y - b.y);
    const spacing = Math.min(17, 350 / Math.max(1, rows.length - 1));
    let previous = 45 - spacing;
    for (const row of rows) { row.y = Math.max(45, row.y, previous + spacing); previous = row.y; }
    let next = 395 + spacing;
    for (const row of rows.toReversed()) { row.y = Math.min(row.y, next - spacing); next = row.y; }
    for (const row of rows) { row.y = Math.max(45, Math.min(395, row.y)); row.x = side === 'left' ? 51 : 389; row.elbow = side === 'left' ? 76 : 364; }
  }
  return items;
}

// Split at half-circle lengths, including a complete revolution and windows
// crossing twelve o'clock. SVG's single arc cannot represent a full circle.
function circleArc(start, end, lap, radius = 125) {
  const span = Math.min(Math.max(0, end - start), lap);
  const count = Math.max(1, Math.ceil(span / (lap / 2)));
  let path = `M ${circlePoint(start, lap, radius).join(' ')}`;
  for (let i = 1; i <= count; i++) {
    const p = circlePoint(start + span * i / count, lap, radius);
    path += ` A ${radius} ${radius} 0 0 1 ${p.join(' ')}`;
  }
  return path;
}


const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const fixed = value => Number(value).toFixed(1);
const point = circlePoint;
const arc = circleArc;

class F1CircleOfDoomCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._overrides = {};
    this.shadowRoot.addEventListener('input', event => {
      if (['loss', 'uncertainty'].includes(event.target.id)) this._edit(event.target, false);
    });
    this.shadowRoot.addEventListener('change', event => {
      const target = event.target;
      if (target.id === 'driver') this._selected = target.value;
      if (['loss', 'uncertainty'].includes(target.id) && !this._edit(target, true)) return;
      this._renderingInput = false;
      this._render();
    });
    this.shadowRoot.addEventListener('click', event => {
      if (event.target.closest('#reset')) {
        const { id, mode } = this._model.settings;
        if (this._overrides[id]) delete this._overrides[id][mode];
        this._save(); this._render();
      }
      const button = event.target.closest('[data-driver]');
      if (button) { this._selected = button.dataset.driver; this._render(); }
    });
    this.shadowRoot.addEventListener('keydown', event => {
      if (['Enter', ' '].includes(event.key) && event.target.matches('[data-driver]')) {
        event.preventDefault(); this._selected = event.target.dataset.driver; this._render();
      }
    });
  }
  _edit(target, commit) {
    const value = target.value === '' ? NaN : Number(target.value);
    const { id, mode, loss } = this._model.settings;
    if (target.id === 'loss' && (target.dataset.circuit !== id || target.dataset.mode !== mode)) return false;
    const max = target.id === 'loss' ? 120 : 30, min = target.id === 'loss' ? 1 : 0;
    const message = !Number.isFinite(value) || value < min || value > max
      ? `Enter a number between ${min} and ${max}.`
      : (target.id === 'loss' ? value <= this._config.uncertainty : value >= loss)
        ? 'Uncertainty must be less than pit loss.' : '';
    target.setCustomValidity(message);
    if (message) { if (commit) target.reportValidity(); return false; }
    if (commit) {
      if (target.id === 'loss') {
        this._overrides[id] = { ...this._overrides[id], [mode]: value };
        this._save();
      } else {
        try { this._config = validateConfig({ ...this._config, uncertainty: value }); }
        catch (error) { target.setCustomValidity(error.message); target.reportValidity(); return false; }
      }
    }
    return true;
  }
  _save() {
    try { localStorage.setItem(this._storageKey, JSON.stringify(this._overrides)); this._storageFailed = false; }
    catch { this._storageFailed = true; }
  }
  setConfig(config) {
    this._config = validateConfig(config);
    this._selected = config.driver;
    this._storageKey = `f1-circle-of-doom:pit-loss:v1:${config.storage_key ?? [config.entity, config.session_entity, config.session_status_entity, config.track_status_entity].join(':')}`;
    try {
      const saved = JSON.parse(localStorage.getItem(this._storageKey) ?? '{}');
      this._overrides = saved && typeof saved === 'object' && !Array.isArray(saved) ? saved : {};
      this._storageFailed = false;
    } catch { this._overrides = {}; this._storageFailed = true; }
    this._render();
  }
  set hass(value) {
    const previous = this._hass;
    this._hass = value;
    if (!this._config) return;
    const keys = ['entity', 'session_entity', 'session_status_entity', 'track_status_entity'];
    if (keys.some(k => previous?.states?.[this._config[k]] !== value.states?.[this._config[k]])) this._render();
  }
  connectedCallback() {
    this._timer = setInterval(() => {
      if (this._model?.ready && this._model.updated && Date.now() - this._model.updated > this._config.stale_after * 1000) this._render();
    }, 5000);
    this._render();
  }
  disconnectedCallback() { clearInterval(this._timer); }
  getCardSize() { return 9; }
  getGridOptions() { return { columns: 12, rows: 'auto', min_columns: 6 }; }
  static getStubConfig() {
    return { entity: 'sensor.f1_driver_positions', session_entity: 'sensor.f1_current_session', session_status_entity: 'sensor.f1_session_status', track_status_entity: 'sensor.f1_track_status', auto_pit_loss: true, uncertainty: 2 };
  }
  _render() {
    if (!this._config || !this._hass || !this.isConnected) return;
    const m = buildModel(this._hass.states, this._config, this._selected, Date.now(), this._overrides);
    const settings = m.settings, c = { ...this._config, pit_loss: settings.loss };
    // Preserve input while typing, but invalidate unsafe/stale predictions immediately.
    if (m.ready && this._model?.ready && settings.id === this._model.settings.id && settings.mode === this._model.settings.mode && this._renderingInput && ['INPUT', 'SELECT'].includes(this.shadowRoot.activeElement?.tagName)) return;
    this._model = m;
    const p = m.prediction, traffic = m.traffic;
    const option = d => `<option value="${escapeHtml(d.id)}" ${d.id === m.selected?.id ? 'selected' : ''}>P${d.position} · ${escapeHtml(d.code)} — ${escapeHtml(d.name)}</option>`;
    const stamp = m.updated ? new Date(m.updated).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '—';
    this.shadowRoot.innerHTML = `<style>${STYLES}</style>
      <ha-card lang="en">
        <header><div><div class="eyebrow">F1 · STRATEGY</div><h2>${escapeHtml(c.title)}</h2></div><span class="badge ${m.ready ? 'active' : ''}">${m.ready ? (settings.mode === 'vsc' ? 'VSC ESTIMATE' : 'ESTIMATE') : 'PAUSED'}</span></header>
        <div class="controls"><label>Driver<select id="driver" ${m.drivers.length ? '' : 'disabled'}>${m.drivers.length ? m.drivers.map(option).join('') : '<option>Waiting for drivers</option>'}</select></label>
          <label>${settings.mode === 'vsc' ? 'VSC pit loss' : 'Pit loss'} <span>(s)</span><input id="loss" data-circuit="${escapeHtml(settings.id)}" data-mode="${settings.mode}" type="number" min="1" max="120" step="0.01" value="${c.pit_loss}" aria-label="${settings.mode === 'vsc' ? 'VSC pit loss' : 'Pit loss'} in seconds"></label>
          <label>Uncertainty <span>(± s)</span><input id="uncertainty" type="number" min="0" max="30" step="0.5" value="${c.uncertainty}" aria-label="Uncertainty in seconds"></label></div>
        <div class="preset"><div><strong>${escapeHtml(settings.name)}</strong><span>${settings.custom[settings.mode] ? 'Your setting' : escapeHtml(settings.source)} · ${settings.mode === 'vsc' ? 'VSC active' : 'Green-flag baseline'}</span></div><button id="reset" ${settings.custom[settings.mode] ? '' : 'disabled'}>Reset to default</button></div>
        ${settings.mode === 'vsc' && !settings.custom.vsc && settings.source === 'Circuit preset' ? '<p class="preset-note">VSC default: approximate 65% of the green-flag baseline. Adjust for current conditions.</p>' : ''}
        ${this._storageFailed ? '<p class="preset-note">Browser storage unavailable. Changes last until this card is reloaded.</p>' : ''}
        <div class="layout">
          <div class="visual">${this._circle(m, c)}<div class="legend"><span><i class="dot"></i>Drivers</span><span><i class="window"></i>Pit window</span><span><i class="ghost"></i>After stop</span></div></div>
          <section class="insights" aria-label="Rejoin estimate">
            <div class="eyebrow">ESTIMATED AFTER THE STOP</div>
            <div class="result">${p ? `~P${p.rank}` : '—'}<span>${p ? `P${p.best}–P${p.worst} with uncertainty` : 'No prediction yet'}</span></div>
            ${p ? `<div class="calculation"><div><span>Current gap</span><b>${fixed(m.selected.gap)} s</b></div><div><span>+ Pit loss</span><b>${fixed(c.pit_loss)} s</b></div><div><span>= Rejoin offset</span><b>${fixed(p.target)} s</b></div><small>Relative to the current leader · ${p.rank - 1} ${p.rank === 2 ? 'car' : 'cars'} ahead after this stop</small></div><div class="order-heading">Estimated traffic at rejoin · wrapped timing</div><div class="neighbors"><div><small>AHEAD ON CIRCLE</small><strong>${traffic.ahead ? escapeHtml(traffic.ahead.code)+' · P'+traffic.ahead.position : 'Clear track'}</strong><span>${traffic.ahead ? `${fixed(traffic.aheadGap)} s gap` : 'Nobody ahead'}</span></div><div><small>BEHIND ON CIRCLE</small><strong>${traffic.behind ? escapeHtml(traffic.behind.code)+' · P'+traffic.behind.position : 'Back of field'}</strong><span>${traffic.behind ? `${fixed(traffic.behindGap)} s gap` : 'Nobody behind'}</span></div></div>` : ''}
            ${p ? `<div class="order-heading">Estimated race order after stop</div><ol class="rejoin-order" aria-label="Estimated order after the stop">${p.order.filter(d => Math.abs(d.projectedPosition-p.rank)<=2).map(d=>`<li class="${d.selected?'focus':''}"><b>P${d.projectedPosition}</b><span>${escapeHtml(d.code)}${d.selected?' · after stop':''}</span><small>now P${d.position}</small></li>`).join('')}</ol>` : ''}
            <p class="notice ${m.ready ? '' : 'waiting'}" role="status">${escapeHtml(m.message)}</p>${m.recovered ? `<p class="assumption">${m.recovered} gap${m.recovered===1?'':'s'} recovered from numeric intervals. Circular traffic uses the reference lap and may differ from actual track spacing.</p>` : ''}
            <p class="assumption">Assumed total loss: ${fixed(c.pit_loss)} ± ${fixed(c.uncertainty)} s relative to staying on track, including pit lane and tyre service. ${settings.mode === 'vsc' ? 'VSC transitions can invalidate this scenario.' : 'Adjust to current conditions.'}</p>
          </section>
        </div>
        ${m.ready ? `<details><summary>Drivers and gaps</summary><div class="driver-grid">${m.drivers.map(d => `<button data-driver="${escapeHtml(d.id)}" class="driver-row ${d.id === m.selected.id ? 'selected' : ''}" style="--team:${d.color}"><b>P${d.position} ${escapeHtml(d.code)}</b><span>${d.position === 1 ? 'Leader' : `+${fixed(d.gap)} s${d.lapsBehind ? ' · +'+d.lapsBehind+'L' : ''}${d.gapSource==='intervals'?' ≈':''}`}</span></button>`).join('')}</div></details>` : ''}
        <footer><span>Time-gap circle · not GPS</span><span>${m.lap ? `Reference lap ${fixed(m.lap)} s · ` : ''}Updated ${stamp}</span></footer>
      </ha-card>`;
    // Keep editable controls stable during unrelated HA changes and defer updates while typing.
    for (const input of this.shadowRoot.querySelectorAll('input,select')) {
      input.addEventListener('focus', () => { this._renderingInput = true; });
      input.addEventListener('blur', () => {
        // Some webviews dispatch change after blur: commit before replacing the input.
        if (['loss', 'uncertainty'].includes(input.id)) this._edit(input, true);
        this._renderingInput = false; this._render();
      }, { once: true });
      input.addEventListener('change', () => { this._renderingInput = false; });
    }
  }
  _circle(m, c) {
    const ticks = Array.from({ length: 12 }, (_, i) => {
      const a = point(i, 12, 113), b = point(i, 12, 119);
      return `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="#526077"/>`;
    }).join('');
    const shell = `<circle cx="220" cy="220" r="125" fill="none" stroke="#243044" stroke-width="16"/><circle cx="220" cy="220" r="103" fill="none" stroke="#273246" stroke-dasharray="2 7"/>${ticks}`;
    if (!m.ready) return `<svg viewBox="0 0 440 440" role="img" aria-label="Circle of Doom waiting for reliable race data">${shell}<text x="220" y="215" text-anchor="middle" class="center-code">—</text><text x="220" y="246" text-anchor="middle" class="center-label">WAITING FOR DATA</text></svg>`;
    const start = m.selected.gap + c.pit_loss - c.uncertainty, end = m.selected.gap + c.pit_loss + c.uncertainty;
    const ghost = point(m.prediction.target, m.lap);
    const labels = new Map(circleLabels(m.drivers, m.lap).map(l => [l.id, l]));
    const markers = m.drivers.map(d => {
      const l = labels.get(d.id), selected = d.id === m.selected.id;
      return `<g data-driver="${escapeHtml(d.id)}" role="button" tabindex="0" aria-label="${escapeHtml(d.code)}, Position ${d.position}, ${fixed(d.gap)} seconds behind" class="marker"><title>P${d.position} ${escapeHtml(d.code)} · +${fixed(d.gap)} s</title><polyline points="${l.pos.join(',')} ${l.elbow},${l.y} ${l.x},${l.y}" fill="none" stroke="${d.color}" opacity="${selected ? '.8' : '.35'}"/><circle cx="${l.pos[0]}" cy="${l.pos[1]}" r="${selected ? 8 : 5}" fill="${d.color}" stroke="${selected ? '#fff' : '#111722'}" stroke-width="2"/><rect x="${l.x - 34}" y="${l.y - 8}" width="68" height="17" rx="4" fill="#111722"/><text x="${l.x}" y="${l.y}" dy=".35em" text-anchor="middle" fill="${selected ? '#fff' : d.color}" class="code ${d.lapped?'lapped':''}">${escapeHtml(d.code)}${d.lapsBehind?' +'+d.lapsBehind+'L':''}</text></g>`;
    }).join('');
    const scale = [0,1,2,3].map(i => {const p=point(i,4,94);return `<text x="${p[0]}" y="${p[1]}" dy=".35em" text-anchor="middle" class="scale">${i?'+'+fixed(m.lap*i/4)+' s':'0 s'}</text>`;}).join('');
    return `<svg viewBox="0 0 440 440" role="group" aria-label="Time gaps on a circle, leader at twelve o’clock; gaps increase clockwise">${shell}${scale}<path d="${arc(start, end, m.lap)}" fill="none" stroke="#ff453a" stroke-width="22" opacity=".8"/><path d="${arc(m.selected.gap, m.prediction.target, m.lap)}" fill="none" stroke="#ff8a82" stroke-width="2" stroke-dasharray="3 5"/>${markers}<rect x="${ghost[0] - 6}" y="${ghost[1] - 6}" width="12" height="12" fill="#fff" stroke="#ff453a" stroke-width="2" transform="rotate(45 ${ghost[0]} ${ghost[1]})"/><text x="220" y="195" text-anchor="middle" class="center-label">SELECTED</text><text x="220" y="230" text-anchor="middle" class="center-code">${escapeHtml(m.selected.code)}</text><text x="220" y="255" text-anchor="middle" class="center-label">NOW P${m.selected.position} → ~P${m.prediction.rank}</text></svg><p class="circle-caption">Leader at 12 o’clock · larger gaps run clockwise ↻<br>One full circle = ${fixed(m.lap)} s · gaps wrap across laps<br>+1L / +2L = reported lap deficit · time gaps, not track positions</p>`;
  }
}

const STYLES = `
  :host{display:block;container-type:inline-size;color:#eef2f7;font-family:var(--primary-font-family,system-ui,sans-serif)}
  *{box-sizing:border-box}ha-card{display:block;background:#111722;border:1px solid #253044;border-top:3px solid #ff453a;border-radius:20px;padding:22px;box-shadow:0 12px 32px #0002;color:#eef2f7}
  header{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:20px}h2{font-size:22px;letter-spacing:-.5px;margin:5px 0 0;font-weight:700}.eyebrow{font-size:10px;letter-spacing:1.8px;color:#9caec4;font-weight:700}.badge{font-size:9px;font-weight:800;letter-spacing:1px;border:1px solid #43516a;border-radius:20px;padding:7px 10px;color:#adbbcc}.badge.active{color:#ffaba5;border-color:#7a3838;background:#ff453a12}
  .controls{display:grid;grid-template-columns:1.8fr 1fr 1fr;gap:12px}label{font-size:11px;color:#bdcadb;font-weight:600}label>span{color:#8291a7}input,select{display:block;width:100%;margin-top:7px;border:1px solid #354158;border-radius:9px;background:#192232;color:#f2f5f9;padding:10px;font:inherit;font-size:13px;min-width:0;color-scheme:dark}input:focus,select:focus{outline:2px solid #ff756d;outline-offset:2px}select:disabled{opacity:.6}
  .preset{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-top:14px;padding:12px;border:1px solid #29364c;border-radius:10px;background:#151e2c}.preset strong{font-size:13px;display:block}.preset span{display:block;font-size:10px;color:#9caec4;margin-top:4px}.preset button{font:inherit;font-size:10px;flex-shrink:0;cursor:pointer;color:#dbe5f4;background:#253249;border:1px solid #40516b;border-radius:7px;padding:8px}.preset button:disabled{opacity:.4;cursor:default}.preset button:focus-visible{outline:2px solid #ff756d}.preset-note{font-size:11px;color:#dcb977;line-height:1.5;margin:8px 0 0}
  .layout{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(0,1fr);gap:22px;align-items:center;margin-top:10px}.visual svg{width:100%;display:block;overflow:visible}.code{font-size:14px;font-weight:750}.code.lapped{font-size:11px}.center-code{fill:#fff;font-size:40px;font-weight:800;letter-spacing:-1px}.center-label{fill:#9caec4;font-size:10px;letter-spacing:1px}.marker{cursor:pointer}.marker:focus{outline:none}.marker:focus circle{stroke:white;stroke-width:4px}
  .legend{display:flex;justify-content:center;flex-wrap:wrap;gap:13px;font-size:10px;color:#a9b8cc}.legend span{display:flex;align-items:center;gap:5px}.dot{width:7px;height:7px;border-radius:50%;background:#a9b8cc}.window{width:14px;height:5px;background:#ff453a;border-radius:2px}.ghost{width:7px;height:7px;background:white;transform:rotate(45deg)}
  .insights{padding:20px 0}.result{font-size:68px;font-weight:800;line-height:1.1;letter-spacing:-3px;margin:12px 0 19px}.result>span{display:block;font-size:12px;letter-spacing:0;color:#b5c3d5;font-weight:500;margin-top:7px}.neighbors{display:grid;grid-template-columns:1fr 1fr;border-top:1px solid #293449;border-bottom:1px solid #293449;padding:15px 0;gap:10px}.neighbors div{display:flex;flex-direction:column;gap:5px}.neighbors small{font-size:9px;letter-spacing:1.5px;color:#9caec4}.neighbors strong{font-size:19px}.neighbors span{font-size:11px;color:#adbbcd}.notice{font-size:12px;line-height:1.6;color:#a7e3c2}.notice.waiting{border-left:2px solid #e9b65b;padding-left:12px;color:#e7cb9b}.assumption{font-size:11px;line-height:1.6;color:#98a9bf;margin:10px 0 0}
  details{margin-top:16px;border-top:1px solid #293449;padding-top:14px;font-size:12px}summary{cursor:pointer;color:#b7c5d8}.driver-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;margin-top:12px}.driver-row{display:flex;justify-content:space-between;gap:8px;background:#182131;border:1px solid #29364c;border-left:3px solid var(--team);border-radius:6px;padding:8px;color:#c8d5e6;font-size:11px;cursor:pointer}.driver-row.selected{background:#2d3445;border-color:#8292aa}.driver-row span{white-space:nowrap}.driver-row:focus-visible{outline:2px solid white}
  footer{display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;margin-top:20px;padding-top:13px;border-top:1px solid #293449;font-size:9px;color:#889bb4}
  .scale{fill:#91a1b8;font-size:10px}.circle-caption{text-align:center;color:#9caec4;font-size:11px;line-height:1.6;margin:-5px 0 15px}.calculation{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;border:1px solid #344257;border-radius:9px;padding:12px;margin-bottom:15px;background:#192232}.calculation div{display:flex;flex-direction:column;gap:7px}.calculation span{font-size:10px;color:#a9b8cc}.calculation b{font-size:16px}.calculation small{grid-column:1/-1;color:#a9b8cc;font-size:10px;line-height:1.6}.order-heading{font-size:11px;color:#b7c5d8;margin-top:16px}.rejoin-order{list-style:none;margin:16px 0;padding:0}.rejoin-order li{display:grid;grid-template-columns:35px 1fr auto;gap:8px;padding:8px;font-size:11px;border-bottom:1px solid #293449}.rejoin-order .focus{background:#ff453a18;border-left:3px solid #ff453a}.rejoin-order small{color:#9caec4}.visual{min-width:0}
  @container(max-width:850px){.layout{grid-template-columns:1fr;gap:0}.visual{max-width:520px;width:100%;margin:auto}.insights{padding:22px 0 0}}
  @container(max-width:580px){ha-card{padding:18px}.layout{grid-template-columns:1fr;gap:0}.visual{max-width:390px;width:100%;margin:auto}.insights{padding:22px 0 0}.result{font-size:55px;margin:10px 0 15px}.controls{grid-template-columns:1fr 1fr;gap:10px}.controls label:first-child{grid-column:1/-1}.neighbors{padding:12px 0}h2{font-size:21px}.driver-grid{grid-template-columns:1fr 1fr}}
  @container(max-width:330px){ha-card{padding:12px}.badge{padding:5px;font-size:8px}h2{font-size:18px}.driver-grid{grid-template-columns:1fr}}
`;
if (!customElements.get('f1-circle-of-doom-card')) customElements.define('f1-circle-of-doom-card', F1CircleOfDoomCard);
window.customCards = window.customCards || [];
if (!window.customCards.some(card => card.type === 'f1-circle-of-doom-card')) window.customCards.push({ type: 'f1-circle-of-doom-card', name: 'F1 Circle of Doom', description: 'Estimated pit window from public F1 timing, without F1TV.', preview: false });
