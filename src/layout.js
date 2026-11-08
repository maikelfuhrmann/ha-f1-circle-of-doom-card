// Timing markers stay at the exact gap angle; compact labels sit just above them.
export function circlePoint(seconds, lap, radius = 125) {
  const angle = ((seconds % lap) + lap) % lap / lap * Math.PI * 2 - Math.PI / 2;
  return [220 + radius * Math.cos(angle), 220 + radius * Math.sin(angle)];
}

export function circleLabels(drivers, lap, selectedId) {
  const placed=[];
  const items=drivers.map(d=>({id:d.id,pos:circlePoint(d.gap,lap),position:d.position||999}));
  const priority=[...items].sort((a,b)=>(b.id===selectedId)-(a.id===selectedId)||a.position-b.position||String(a.id).localeCompare(String(b.id)));
  for(const item of priority){
    item.x=item.pos[0];item.y=item.pos[1]-14;item.hidden=true;
    for(let lane=0;lane<3;lane++){
      const y=item.pos[1]-14-lane*14;
      if(!placed.some(other=>Math.abs(other.x-item.x)<34&&Math.abs(other.y-y)<13)){
        item.y=y;item.hidden=false;placed.push(item);break;
      }
    }
  }
  return items;
}

// Split at half-circle lengths, including a complete revolution and windows
// crossing twelve o'clock. SVG's single arc cannot represent a full circle.
export function circleArc(start, end, lap, radius = 125) {
  const span = Math.min(Math.max(0, end - start), lap);
  const count = Math.max(1, Math.ceil(span / (lap / 2)));
  let path = `M ${circlePoint(start, lap, radius).join(' ')}`;
  for (let i = 1; i <= count; i++) {
    const p = circlePoint(start + span * i / count, lap, radius);
    path += ` A ${radius} ${radius} 0 0 1 ${p.join(' ')}`;
  }
  return path;
}
