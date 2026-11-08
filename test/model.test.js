import test from 'node:test';
import assert from 'node:assert/strict';
import { seconds, validateConfig, buildModel, referenceLap, project, lapDeficit, trafficNeighbors } from '../src/model.js';

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
test('lap deficits are not converted to seconds',()=>{const s=data();s['sensor.timing'].attributes.drivers[5].gap_to_leader='+1 LAP';assert.equal(model(s).reason,'gaps');});
test('inconsistent timing and duplicate identity are rejected',()=>{const s=data();s['sensor.timing'].attributes.drivers[2].gap_to_leader='+1';assert.equal(model(s).reason,'order');s['sensor.timing'].attributes.drivers[2].racing_number='1';assert.equal(model(s).reason,'order');});
test('pit activity pauses changing order',()=>{const s=data();s['sensor.timing'].attributes.drivers[3].in_pit=true;assert.equal(model(s).reason,'pit');});
test('missing sensors and empty fields have explicit waiting states',()=>{assert.equal(model({}).reason,'configuration');const s=data();s['sensor.timing'].attributes.drivers=[];assert.equal(model(s).reason,'empty');});
test('requires two recent laps and ignores unavailable times',()=>{assert.equal(referenceLap({laps:{1:'1:12.000'}}),null);assert.equal(referenceLap({laps:{1:'1:12',2:'1:14',3:null}}),73);});
test('crossing a reference lap boundary preserves race position',()=>{const m=model(data(),'6',{...config,pit_loss:40});assert.equal(m.ready,true);assert.equal(m.prediction.rank,6);assert.equal(m.prediction.target,72);});
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

test('leader lap counter is not a lap deficit and cannot pause the field',()=>{
  for(const value of ['Lap 12','LAP 12','Lap 1','Runde 12']){
    const s=data();s['sensor.timing'].attributes.drivers[0].gap_to_leader=value;
    const m=model(s);assert.equal(m.ready,true,value);assert.equal(m.selected.gap,0);assert.equal(m.prediction.rank,4);
  }
});
test('lap deficit labels alone never fabricate timing',()=>{
  for(const value of ['+1 LAP','1 Lap','+2 LAPS','2 Runden','1 L','+2L']){
    const s=data();s['sensor.timing'].attributes.drivers[5].gap_to_leader=value;
    assert.equal(model(s).reason,'gaps',value);assert.ok(lapDeficit(value)>0);
  }
  for(const value of ['Lap 12','no lap data','0 LAPS']){
    const s=data();s['sensor.timing'].attributes.drivers[5].gap_to_leader=value;
    assert.equal(model(s).reason,'gaps',value);
  }
});

test('observed race gaps put the leader behind six rivals, with no self double-count',()=>{
  const codes=['ANT','NOR','RUS','HAD','VER','LAW','PIA','HUL','ALB'];
  const drivers=[0,6.6,9.1,11.2,16.2,17.7,18.5,24.1,27.2].map((gap,i)=>({id:codes[i],gap,position:i+1}));
  const p=project(drivers,drivers[0],21.83,2);
  assert.equal(p.rank,7); assert.equal(p.ahead.id,'PIA'); assert.equal(p.behind.id,'HUL');
  assert.deepEqual(p.order.map(d=>d.id),['NOR','RUS','HAD','VER','LAW','PIA','ANT','HUL','ALB']);
  assert.equal(p.order.find(d=>d.selected).projectedPosition,p.rank);
  assert.ok(Math.abs(p.aheadGap-3.33)<1e-8); assert.ok(Math.abs(p.behindGap-2.27)<1e-8);
});
test('millisecond ties use the same conservative order in rank and neighbors',()=>{
  const drivers=[{id:'A',gap:0},{id:'B',gap:22.0005},{id:'C',gap:24}];
  const p=project(drivers,drivers[0],22,2);
  assert.equal(p.rank,2);assert.equal(p.ahead.id,'B');assert.equal(p.behind.id,'C');
  assert.equal(p.aheadGap,0);assert.deepEqual(p.order.map(d=>d.id),['B','A','C']);
});

function lappedData(){
 const s=data();
 s['sensor.timing'].attributes.drivers=[0,17,65.951,'1 L','1 L','2 L'].map((gap,i)=>({racing_number:String(i+1),tla:`D${i+1}`,current_position:i+1,gap_to_leader:gap,interval_to_position_ahead:[null,17,48.951,20.508,12,78][i],laps:{32:'1:18',33:'1:18',34:'1:18'}}));
 return s;
}
test('one and two laps down resolve through numeric intervals without inventing lap seconds',()=>{
 const m=model(lappedData());assert.equal(m.ready,true);assert.equal(m.recovered,3);
 const gaps=m.drivers.map(d=>d.gap);assert.ok(Math.abs(gaps[3]-86.459)<1e-8);assert.ok(Math.abs(gaps[5]-176.459)<1e-8);
 assert.equal(m.drivers[5].lapsBehind,2);assert.equal(m.prediction.rank,2);
 // Race order puts D3 behind, but lapped D5 is just ahead on the wrapped circle.
 assert.equal(m.prediction.behind.id,'3');assert.equal(m.traffic.ahead.id,'5');
 assert.ok(Math.abs(m.traffic.aheadGap-1.541)<1e-8);
});
test('selected lapped driver is ranked on total gap, not its modulo angle',()=>{
 const m=model(lappedData(),'4');assert.equal(m.ready,true);assert.equal(m.prediction.rank,5);
 assert.ok(Math.abs(m.prediction.target-108.459)<1e-8);assert.equal(m.prediction.ahead.id,'5');
});
test('reference lap changes traffic scale but cannot change recovered gaps or race order',()=>{
 const a=model(lappedData()),b=model(lappedData(),'1',{...config,reference_lap_seconds:65});
 assert.deepEqual(a.drivers.map(d=>d.gap),b.drivers.map(d=>d.gap));assert.equal(a.prediction.rank,b.prediction.rank);
});
test('incomplete interval chains stop safely, even when later intervals are numeric',()=>{
 const s=lappedData();s['sensor.timing'].attributes.drivers[3].interval_to_position_ahead='1 L';
 const m=model(s);assert.equal(m.reason,'gaps');assert.equal(m.drivers[4].gap,null);
});
test('a valid direct gap remains authoritative over asynchronous intervals',()=>{
 const s=lappedData();s['sensor.timing'].attributes.drivers[2].interval_to_position_ahead=1;
 assert.equal(model(s).drivers[2].gap,65.951);
});
test('missing intermediate classified driver cannot be silently skipped by interval recovery',()=>{
 const s=lappedData();s['sensor.timing'].attributes.drivers.splice(2,1);
 assert.equal(model(s).reason,'order');
});
test('lapped VSC estimate uses active loss and still respects freshness',()=>{
 const s=lappedData();s['sensor.track'].state='VSC';const m=model(s,'4');
 assert.equal(m.ready,true);assert.equal(m.settings.mode,'vsc');assert.ok(Math.abs(m.prediction.target-(86.459+m.settings.loss))<1e-8);
 s['sensor.timing'].last_updated=new Date(now-91000).toISOString();assert.equal(model(s).reason,'stale');
});
test('circular traffic wraps ahead and behind across twelve oclock',()=>{
 const ds=[{id:'A',gap:0,position:1},{id:'B',gap:77,position:2},{id:'C',gap:83,position:3}];
 const p=trafficNeighbors(ds,ds[0],1,80);assert.equal(p.ahead.id,'B');assert.equal(p.aheadGap,4);assert.equal(p.behind.id,'C');assert.equal(p.behindGap,2);
 const tie=trafficNeighbors(ds,ds[0],3,80);assert.equal(tie.aheadGap,0);assert.equal(tie.behindGap,0);
});
