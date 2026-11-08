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
  test('22-car labels stay separated and bounded while markers retain exact gaps '+gaps[0],()=>{
    const drivers=gaps.map((gap,i)=>({id:String(i),gap})),labels=circleLabels(drivers,80);
    assert.equal(labels.length,22);
    for(const l of labels){assert.deepEqual(l.pos,circlePoint(drivers[Number(l.id)].gap,80));assert.ok(l.y>=45&&l.y<=395);}
    for(const side of ['left','right']){const ys=labels.filter(l=>l.side===side).map(l=>l.y).sort((a,b)=>a-b);for(let i=1;i<ys.length;i++)assert.ok(ys[i]-ys[i-1]>=16);}
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
