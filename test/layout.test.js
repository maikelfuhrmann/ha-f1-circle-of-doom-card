import test from 'node:test';
import assert from 'node:assert/strict';
import { circlePoint, circleLabels, circleArc } from '../src/layout.js';

test('time scale places the leader at twelve and larger gaps clockwise',()=>{
  assert.deepEqual(circlePoint(0,80),[220,95]);
  assert.deepEqual(circlePoint(20,80),[345,220]);
  assert.deepEqual(circlePoint(40,80),[220,345]);
  assert.equal(circlePoint(60,80)[0],95);
});
for(const gaps of [Array.from({length:22},(_,i)=>10+i*.01),Array.from({length:22},(_,i)=>i*3),Array(22).fill(40)]){
  test('compact labels keep exact marker positions and prioritize the selected driver '+gaps[0],()=>{
    const drivers=gaps.map((gap,i)=>({id:String(i),gap})),labels=circleLabels(drivers,80,'21');
    assert.equal(labels.length,22);assert.equal(labels.find(l=>l.id==='21').hidden,false);
    for(const l of labels){assert.deepEqual(l.pos,circlePoint(drivers[Number(l.id)].gap,80));assert.equal(l.x,l.pos[0]);assert.ok(l.pos[1]-l.y>=14&&l.pos[1]-l.y<=42);}
    const visible=labels.filter(l=>!l.hidden);
    for(let i=0;i<visible.length;i++)for(let j=i+1;j<visible.length;j++)assert.ok(Math.abs(visible[i].x-visible[j].x)>=34||Math.abs(visible[i].y-visible[j].y)>=13);
  });
}

test('multiple lap offsets wrap to exactly the same circle point',()=>{
 assert.deepEqual(circlePoint(5,80),circlePoint(165,80));
 assert.deepEqual(circlePoint(0,80),circlePoint(160,80));
});
test('arcs split complete revolutions and retain crossings over twelve oclock',()=>{
 const crossing=circleArc(77,83,80);assert.ok(crossing.startsWith('M '+circlePoint(77,80).join(' ')));assert.ok(crossing.endsWith(circlePoint(83,80).join(' ')));
 assert.equal((circleArc(0,80,80).match(/ A /g)||[]).length,2);
 assert.equal((circleArc(10,210,80).match(/ A /g)||[]).length,2);
 assert.ok(!circleArc(0,80,80).includes('NaN'));
});
