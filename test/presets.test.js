import test from 'node:test';
import assert from 'node:assert/strict';
import { CIRCUITS, circuitContext, pitSettings } from '../src/presets.js';
import { validateConfig } from '../src/model.js';
const c = validateConfig({ entity: 'sensor.timing', session_entity: 'sensor.session', session_status_entity: 'sensor.status', track_status_entity: 'sensor.track' });
const states = (name, track = 'CLEAR') => ({ 'sensor.session': { state: 'Race', attributes: { circuit_short_name: name } }, 'sensor.status': { state: 'live' }, 'sensor.track': { state: track } });

test('circuit aliases match accents and punctuation without ambiguous country guesses', () => {
  assert.equal(circuitContext(states('São Paulo'), c).id, 'interlagos');
  assert.equal(circuitContext(states('Circuit de Spa-Francorchamps'), c).id, 'spa');
  assert.equal(circuitContext(states('Spain'), c).preset, undefined);
  assert.notEqual(circuitContext(states('Madrid'), c).id, 'barcelona');
});
test('current circuit wins over old status metadata, with a fallback when absent', () => {
  const s = states('Monza'); s['sensor.status'] = { attributes: { circuit_short_name: 'Interlagos' } };
  assert.equal(circuitContext(s, c).id, 'monza');
  s['sensor.session'].attributes = {}; assert.equal(circuitContext(s, c).id, 'interlagos');
  s['sensor.session'].attributes = { circuit_short_name: 'Madring' }; assert.equal(circuitContext(s,c).preset,undefined);
});
test('circuit changes switch presets, keeping user overrides separate by condition and track', () => {
  const saved = JSON.parse(JSON.stringify({ interlagos: { green: 24, vsc: 12 } }));
  assert.equal(pitSettings(states('Interlagos'), c, saved).loss, 24);
  assert.equal(pitSettings(states('Interlagos','VSC'), c, saved).loss, 12);
  assert.equal(pitSettings(states('Monza'), c, saved).loss, 24.14);
  delete saved.interlagos.vsc;
  assert.equal(pitSettings(states('Interlagos','VSC'), c, saved).loss, 14.2);
  assert.equal(pitSettings(states('Interlagos'), c, saved).loss, 24);
});
test('unknown circuit uses a labelled fallback and isolates its saved values', () => {
  const saved = { 'unknown:madring': { green: 25 } };
  assert.equal(pitSettings(states('Madring'),c,saved).loss,25);
  const s = pitSettings(states('Another track'),c,saved);
  assert.equal(s.loss,22); assert.match(s.source,/fallback/);
  assert.equal(pitSettings(states('unavailable'),c,saved).loss,22);
});
test('a retained VSC status between sessions never activates the VSC field', () => {
  const s = states('Interlagos','VSC'); s['sensor.status'].state='ended';
  assert.equal(pitSettings(s,c).mode,'green');
});
test('corrupt saved values cannot poison a prediction', () => {
  for (const v of [null, '20', 0, -1, 121, Infinity, NaN, {}]) assert.equal(pitSettings(states('Monza'), c, {monza:{green:v}}).loss,24.14);
});
test('explicit circuit and YAML-only settings remain available', () => {
  assert.equal(pitSettings(states('Monza'), {...c,circuit:'Silverstone'}).loss,20);
  assert.equal(pitSettings(states('Monza'), {...c,auto_pit_loss:false,pit_loss:25}).loss,25);
  assert.throws(()=>validateConfig({...c,auto_pit_loss:'true'}));
  assert.throws(()=>validateConfig({...c,vsc_pit_loss:0}));
});
test('all presets have unique identities, useful bounds and source provenance', () => {
  assert.equal(new Set(CIRCUITS.map(x=>x.id)).size,CIRCUITS.length);
  for (const p of CIRCUITS) { assert.ok(p.green>10&&p.green<40); assert.ok(p.vsc>2&&p.vsc<p.green); assert.match(p.source,/^https:\/\/www\.formula1\.com\//); }
});
