// Labels are spread independently of the timing markers. Markers never move off
// their true time-gap angle, even when several cars have nearly identical gaps.
export function circlePoint(seconds, lap, radius = 125) {
  const angle = ((seconds % lap) + lap) % lap / lap * Math.PI * 2 - Math.PI / 2;
  return [220 + radius * Math.cos(angle), 220 + radius * Math.sin(angle)];
}

export function circleLabels(drivers, lap) {
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
