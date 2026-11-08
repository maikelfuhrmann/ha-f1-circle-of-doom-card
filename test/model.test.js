import test from 'node:test';
import assert from 'node:assert/strict';
import { seconds, validateConfig, buildModel, referenceLap } from '../src/model.js';

const now = Date.parse('2026-11-08T18:20:00Z');
const config = validateConfig({ entity:'sensor.timing', session_entity:'sensor.session', session_status_entity:'sensor.status', track_status_entity:'sensor.track', pit_loss:22, uncertainty:2 });
function data() {
  return {
    'sensor.timing': { state:'12', last_updated:new Date(now).toISOString(), attributes:{drivers:[0,4,11,22,25,32].map((gap,i)=>({racing_number:String(i+1),tla:`D${i+1}`,current_position:String(i+1),gap_to_leader:i?`+${gap}`:'',laps:{10:'1:12.000',11:'1:13.000',12:'1:11.000'}}))}},
    'sensor.session': {state:'Race',attributes:{active:true}}, 'sensor.status':{state:'live'}, 'sensor.track':{state:'CLEAR'},
  };
}
const model = (s, driver='1', c=config) => buildModel(s,c,driver,now);
test('strict time parser rejects missing, laps, infinities and malformed seconds',()=>{
  for(const v of [null,undefined,'','—','+1 LAP','NaN',Infinity,-1,'1:99.000','abc2']) assert.equal(seconds(v),null);
  assert.equal(seconds('+12.350'),12.35); assert.equal(seconds('1:12.345'),72.345); assert.equal(seconds('2,5'),2.5); assert.equal(seconds(0),0);
});
test('leader projection excludes self and counts equal-gap competitor ahead',()=>{
  const m=model(data()); assert.equal(m.ready,true); assert.equal(m.prediction.rank,4); assert.equal(m.prediction.best,3); assert.equal(m.prediction.worst,4); assert.equal(m.prediction.behind.id,'5');
});
test('other selected driver uses its own gap and counts only competitors',()=>{ const m=model(data(),'2'); assert.equal(m.prediction.rank,5); assert.equal(m.prediction.target,26); });
test('window can keep a driver in first when gap is sufficient',()=>{const s=data();s['sensor.timing'].attributes.drivers=s['sensor.timing'].attributes.drivers.slice(0,2);s['sensor.timing'].attributes.drivers[1].gap_to_leader='+30';assert.equal(model(s).prediction.rank,1);});
for(const track of ['SC','RED','YELLOW','unavailable']) test(`no prediction for ${track}`,()=>{const s=data();s['sensor.track'].state=track;assert.equal(model(s).reason,'track');assert.equal(model(s).prediction,null);});
for(const state of ['pre','finished','ended','suspended','unknown']) test(`no prediction when session ${state}`,()=>{const s=data();s['sensor.status'].state=state;assert.equal(model(s).ready,false);});
test('qualifying is not a race; sprint is supported',()=>{const s=data();s['sensor.session'].state='Qualifying';assert.equal(model(s).reason,'session');s['sensor.session'].state='Sprint';assert.equal(model(s).ready,true);});
test('stale data and future clocks suppress prediction; old stable status is valid',()=>{
  const s=data();s['sensor.status'].last_updated='2000-01-01';assert.equal(model(s).ready,true);
  s['sensor.timing'].last_updated=new Date(now-91000).toISOString();assert.equal(model(s).reason,'stale');
  s['sensor.timing'].last_updated=new Date(now+20000).toISOString();assert.equal(model(s).reason,'stale');
});
test('missing gap never becomes zero',()=>{const s=data();s['sensor.timing'].attributes.drivers[2].gap_to_leader=null;assert.equal(model(s).reason,'gaps');});
test('lap deficits are not converted to seconds',()=>{const s=data();s['sensor.timing'].attributes.drivers[5].gap_to_leader='+1 LAP';assert.equal(model(s).reason,'lapped');});
test('inconsistent timing and duplicate identity are rejected',()=>{const s=data();s['sensor.timing'].attributes.drivers[2].gap_to_leader='+1';assert.equal(model(s).reason,'order');s['sensor.timing'].attributes.drivers[2].racing_number='1';assert.equal(model(s).reason,'order');});
test('pit activity pauses changing order',()=>{const s=data();s['sensor.timing'].attributes.drivers[3].in_pit=true;assert.equal(model(s).reason,'pit');});
test('missing sensors and empty fields have explicit waiting states',()=>{assert.equal(model({}).reason,'configuration');const s=data();s['sensor.timing'].attributes.drivers=[];assert.equal(model(s).reason,'empty');});
test('requires two recent laps and ignores unavailable times',()=>{assert.equal(referenceLap({laps:{1:'1:12.000'}}),null);assert.equal(referenceLap({laps:{1:'1:12',2:'1:14',3:null}}),73);});
test('crossing reference lap boundary blocks misleading rejoin estimate',()=>{const s=data();assert.equal(model(s,'6',{...config,pit_loss:40}).reason,'lap_boundary');});
test('config rejects bad numbers and non-sensor entities',()=>{for(const c of [{pit_loss:NaN},{pit_loss:-2},{uncertainty:22},{stale_after:0},{entity:'light.test'},{reference_lap_seconds:'70'}]) assert.throws(()=>validateConfig({...config,...c}));});
test('unavailable entity cannot retain a seemingly live projection',()=>{const s=data();s['sensor.timing'].state='unavailable';assert.equal(model(s).ready,false);});

test('active VSC uses its own pit loss and returns to green without changing normal settings',()=>{
  const s=data();s['sensor.session'].attributes.circuit_short_name='Interlagos';
  const overrides={interlagos:{green:23,vsc:12}};
  let m=buildModel(s,config,'1',now,overrides);assert.equal(m.prediction.target,23);
  s['sensor.track'].state='VSC';m=buildModel(s,config,'1',now,overrides);
  assert.equal(m.ready,true);assert.equal(m.settings.mode,'vsc');assert.equal(m.prediction.target,12);assert.match(m.message,/entire stop/);
  s['sensor.track'].state='CLEAR';m=buildModel(s,config,'1',now,overrides);assert.equal(m.prediction.target,23);
});
test('VSC retains stale-data, pit-activity and session guards',()=>{
  const s=data();s['sensor.track'].state='VSC';s['sensor.timing'].last_updated=new Date(now-91000).toISOString();assert.equal(model(s).reason,'stale');
  s['sensor.timing'].last_updated=new Date(now).toISOString();s['sensor.timing'].attributes.drivers[1].in_pit=true;assert.equal(model(s).reason,'pit');
  s['sensor.status'].state='ended';assert.equal(model(s).ready,false);
});
test('uncertainty beyond active circuit loss blocks projection',()=>{
  const s=data();s['sensor.track'].state='VSC';assert.equal(model(s,'1',{...config,uncertainty:15}).reason,'settings');
});
