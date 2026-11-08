import { buildModel, validateConfig } from './model.js';

const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const fixed = value => Number(value).toFixed(1);
const point = (seconds, lap, radius = 137) => {
  const angle = seconds / lap * Math.PI * 2 - Math.PI / 2;
  return [200 + radius * Math.cos(angle), 200 + radius * Math.sin(angle)];
};
const arc = (start, end, lap) => {
  const a = point(start, lap), b = point(end, lap);
  return `M ${a.join(' ')} A 137 137 0 ${end - start > lap / 2 ? 1 : 0} 1 ${b.join(' ')}`;
};

class F1CircleOfDoomCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.addEventListener('input', event => {
      const target = event.target;
      if (!['loss', 'uncertainty'].includes(target.id)) return;
      const key = target.id === 'loss' ? 'pit_loss' : 'uncertainty';
      try {
        this._config = validateConfig({ ...this._config, [key]: target.value === '' ? NaN : Number(target.value) });
        target.setCustomValidity('');
      } catch (error) { target.setCustomValidity(error.message); }
    });
    this.shadowRoot.addEventListener('change', event => {
      const target = event.target;
      if (target.id === 'driver') this._selected = target.value;
      if (['loss', 'uncertainty'].includes(target.id)) {
        const key = target.id === 'loss' ? 'pit_loss' : 'uncertainty';
        try { this._config = validateConfig({ ...this._config, [key]: Number(target.value) }); }
        catch (error) { target.setCustomValidity(error.message); target.reportValidity(); return; }
      }
      this._render();
    });
    this.shadowRoot.addEventListener('click', event => {
      const button = event.target.closest('[data-driver]');
      if (button) { this._selected = button.dataset.driver; this._render(); }
    });
    this.shadowRoot.addEventListener('keydown', event => {
      if (['Enter', ' '].includes(event.key) && event.target.matches('[data-driver]')) {
        event.preventDefault(); this._selected = event.target.dataset.driver; this._render();
      }
    });
  }
  setConfig(config) { this._config = validateConfig(config); this._selected = config.driver; this._render(); }
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
    return { entity: 'sensor.f1_driver_positions', session_entity: 'sensor.f1_current_session', session_status_entity: 'sensor.f1_session_status', track_status_entity: 'sensor.f1_track_status', pit_loss: 22, uncertainty: 2 };
  }
  _render() {
    if (!this._config || !this._hass || !this.isConnected) return;
    const c = this._config, m = buildModel(this._hass.states, c, this._selected);
    // Preserve input while typing, but invalidate unsafe/stale predictions immediately.
    if (m.ready && this._model?.ready && this._renderingInput && ['INPUT', 'SELECT'].includes(this.shadowRoot.activeElement?.tagName)) return;
    this._model = m;
    const p = m.prediction;
    const option = d => `<option value="${escapeHtml(d.id)}" ${d.id === m.selected?.id ? 'selected' : ''}>P${d.position} · ${escapeHtml(d.code)} — ${escapeHtml(d.name)}</option>`;
    const stamp = m.updated ? new Date(m.updated).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '—';
    this.shadowRoot.innerHTML = `<style>${STYLES}</style>
      <ha-card>
        <header><div><div class="eyebrow">F1 · STRATEGIE</div><h2>${escapeHtml(c.title)}</h2></div><span class="badge ${m.ready ? 'active' : ''}">${m.ready ? 'SCHÄTZUNG' : 'PAUSIERT'}</span></header>
        <div class="controls"><label>Fahrer<select id="driver" ${m.drivers.length ? '' : 'disabled'}>${m.drivers.length ? m.drivers.map(option).join('') : '<option>Wartet auf Fahrer</option>'}</select></label>
          <label>Boxenstoppverlust <span>(s)</span><input id="loss" type="number" min="1" max="120" step="0.5" value="${c.pit_loss}" aria-label="Boxenstoppverlust in Sekunden"></label>
          <label>Spielraum <span>(± s)</span><input id="uncertainty" type="number" min="0" max="30" step="0.5" value="${c.uncertainty}" aria-label="Spielraum in Sekunden"></label></div>
        <div class="layout">
          <div class="visual">${this._circle(m, c)}<div class="legend"><span><i class="dot"></i>Fahrer</span><span><i class="window"></i>Boxenfenster</span><span><i class="ghost"></i>Nach Stopp</span></div></div>
          <section class="insights" aria-label="Rückkehrprognose">
            <div class="eyebrow">VORAUSSICHTLICH NACH DEM STOPP</div>
            <div class="result">${p ? `P${p.rank}` : '—'}<span>${p ? `P${p.best}–P${p.worst} mit Spielraum` : 'Noch keine Prognose'}</span></div>
            ${p ? `<div class="neighbors"><div><small>DAVOR</small><strong>${p.ahead ? escapeHtml(p.ahead.code) : 'Freie Strecke'}</strong><span>${p.ahead ? `${fixed(p.aheadGap)} s Abstand` : 'Niemand voraus'}</span></div><div><small>DAHINTER</small><strong>${p.behind ? escapeHtml(p.behind.code) : 'Feldende'}</strong><span>${p.behind ? `${fixed(p.behindGap)} s Abstand` : 'Niemand dahinter'}</span></div></div>` : ''}
            <p class="notice ${m.ready ? '' : 'waiting'}" role="status">${escapeHtml(m.message)}</p>
            <p class="assumption">Annahme: ${fixed(c.pit_loss)} ± ${fixed(c.uncertainty)} s gesamter Zeitverlust gegenüber einer normalen Runde, inklusive Boxengasse und Reifenwechsel. An die Strecke anpassen.</p>
          </section>
        </div>
        ${m.ready ? `<details><summary>Fahrer und Abstände</summary><div class="driver-grid">${m.drivers.map(d => `<button data-driver="${escapeHtml(d.id)}" class="driver-row ${d.id === m.selected.id ? 'selected' : ''}" style="--team:${d.color}"><b>P${d.position} ${escapeHtml(d.code)}</b><span>${d.position === 1 ? 'Leader' : `+${fixed(d.gap)} s`}</span></button>`).join('')}</div></details>` : ''}
        <footer><span>Zeitabstands-Kreis · kein GPS</span><span>${m.lap ? `Referenzrunde ${fixed(m.lap)} s · ` : ''}Daten ${stamp}</span></footer>
      </ha-card>`;
    // Keep editable controls stable during unrelated HA changes and defer updates while typing.
    for (const input of this.shadowRoot.querySelectorAll('input,select')) {
      input.addEventListener('focus', () => { this._renderingInput = true; });
      input.addEventListener('blur', () => { this._renderingInput = false; this._render(); }, { once: true });
      input.addEventListener('change', () => { this._renderingInput = false; });
    }
  }
  _circle(m, c) {
    const ticks = Array.from({ length: 12 }, (_, i) => {
      const a = point(i, 12, 123), b = point(i, 12, 129);
      return `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="#334155"/>`;
    }).join('');
    const shell = `<circle cx="200" cy="200" r="137" fill="none" stroke="#243044" stroke-width="16"/><circle cx="200" cy="200" r="111" fill="none" stroke="#273246" stroke-dasharray="2 7"/>${ticks}`;
    if (!m.ready) return `<svg viewBox="0 0 400 400" role="img" aria-label="Circle of Doom wartet auf verlässliche Renndaten">${shell}<text x="200" y="195" text-anchor="middle" class="center-code">—</text><text x="200" y="226" text-anchor="middle" class="center-label">WARTET AUF DATEN</text></svg>`;
    const start = m.selected.gap + c.pit_loss - c.uncertainty, end = m.selected.gap + c.pit_loss + c.uncertainty;
    const ghost = point(m.prediction.target, m.lap);
    // Spread labels over concentric lanes when gaps cluster; timing markers stay exact.
    const occupied = [];
    const markers = m.drivers.map(d => {
      const pos = point(d.gap, m.lap), a = d.gap / m.lap * 360;
      let lane = 0;
      while (lane < 3 && occupied.some(o => o.lane === lane && Math.min(Math.abs(a - o.angle), 360 - Math.abs(a - o.angle)) < 11)) lane++;
      occupied.push({ lane, angle: a });
      const label = point(d.gap, m.lap, 158 + lane * 12);
      return `<g data-driver="${escapeHtml(d.id)}" role="button" tabindex="0" aria-label="${escapeHtml(d.code)}, Position ${d.position}, ${fixed(d.gap)} Sekunden Rückstand" class="marker"><line x1="${pos[0]}" y1="${pos[1]}" x2="${label[0]}" y2="${label[1]}" stroke="${d.color}" opacity=".4"/><circle cx="${pos[0]}" cy="${pos[1]}" r="${d.id === m.selected.id ? 8 : 5}" fill="${d.color}" stroke="${d.id === m.selected.id ? '#fff' : '#111722'}" stroke-width="2"/><text x="${label[0]}" y="${label[1]}" dy=".35em" text-anchor="middle" fill="${d.id === m.selected.id ? '#fff' : d.color}" class="code">${escapeHtml(d.code)}</text></g>`;
    }).join('');
    return `<svg viewBox="0 0 400 400" role="group" aria-label="Zeitabstände im Kreis, Führender bei zwölf Uhr; wachsender Rückstand im Uhrzeigersinn">${shell}<path d="${arc(start, end, m.lap)}" fill="none" stroke="#ff453a" stroke-width="22" opacity=".8"/><path d="${arc(m.selected.gap, m.prediction.target, m.lap)}" fill="none" stroke="#ff8a82" stroke-width="2" stroke-dasharray="3 5"/>${markers}<rect x="${ghost[0] - 5}" y="${ghost[1] - 5}" width="10" height="10" fill="#fff" stroke="#ff453a" stroke-width="2" transform="rotate(45 ${ghost[0]} ${ghost[1]})"/><text x="200" y="176" text-anchor="middle" class="center-label">FOKUS</text><text x="200" y="213" text-anchor="middle" class="center-code">${escapeHtml(m.selected.code)}</text><text x="200" y="240" text-anchor="middle" class="center-label">P${m.selected.position} → ~ P${m.prediction.rank}</text></svg>`;
  }
}

const STYLES = `
  :host{display:block;container-type:inline-size;color:#eef2f7;font-family:var(--primary-font-family,system-ui,sans-serif)}
  *{box-sizing:border-box}ha-card{display:block;background:#111722;border:1px solid #253044;border-top:3px solid #ff453a;border-radius:20px;padding:22px;box-shadow:0 12px 32px #0002;color:#eef2f7}
  header{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:20px}h2{font-size:22px;letter-spacing:-.5px;margin:5px 0 0;font-weight:700}.eyebrow{font-size:10px;letter-spacing:1.8px;color:#9caec4;font-weight:700}.badge{font-size:9px;font-weight:800;letter-spacing:1px;border:1px solid #43516a;border-radius:20px;padding:7px 10px;color:#adbbcc}.badge.active{color:#ffaba5;border-color:#7a3838;background:#ff453a12}
  .controls{display:grid;grid-template-columns:1.8fr 1fr 1fr;gap:12px}label{font-size:11px;color:#bdcadb;font-weight:600}label>span{color:#8291a7}input,select{display:block;width:100%;margin-top:7px;border:1px solid #354158;border-radius:9px;background:#192232;color:#f2f5f9;padding:10px;font:inherit;font-size:13px;min-width:0;color-scheme:dark}input:focus,select:focus{outline:2px solid #ff756d;outline-offset:2px}select:disabled{opacity:.6}
  .layout{display:grid;grid-template-columns:minmax(0,1.12fr) minmax(0,1fr);gap:22px;align-items:center;margin-top:10px}.visual svg{width:100%;display:block;overflow:visible}.code{font-size:10px;font-weight:750}.center-code{fill:#fff;font-size:40px;font-weight:800;letter-spacing:-1px}.center-label{fill:#9caec4;font-size:10px;letter-spacing:1px}.marker{cursor:pointer}.marker:focus{outline:none}.marker:focus circle{stroke:white;stroke-width:4px}
  .legend{display:flex;justify-content:center;flex-wrap:wrap;gap:13px;font-size:10px;color:#a9b8cc}.legend span{display:flex;align-items:center;gap:5px}.dot{width:7px;height:7px;border-radius:50%;background:#a9b8cc}.window{width:14px;height:5px;background:#ff453a;border-radius:2px}.ghost{width:7px;height:7px;background:white;transform:rotate(45deg)}
  .insights{padding:20px 0}.result{font-size:68px;font-weight:800;line-height:1.1;letter-spacing:-3px;margin:12px 0 19px}.result>span{display:block;font-size:12px;letter-spacing:0;color:#b5c3d5;font-weight:500;margin-top:7px}.neighbors{display:grid;grid-template-columns:1fr 1fr;border-top:1px solid #293449;border-bottom:1px solid #293449;padding:15px 0;gap:10px}.neighbors div{display:flex;flex-direction:column;gap:5px}.neighbors small{font-size:9px;letter-spacing:1.5px;color:#9caec4}.neighbors strong{font-size:19px}.neighbors span{font-size:11px;color:#adbbcd}.notice{font-size:12px;line-height:1.6;color:#a7e3c2}.notice.waiting{border-left:2px solid #e9b65b;padding-left:12px;color:#e7cb9b}.assumption{font-size:11px;line-height:1.6;color:#98a9bf;margin:10px 0 0}
  details{margin-top:16px;border-top:1px solid #293449;padding-top:14px;font-size:12px}summary{cursor:pointer;color:#b7c5d8}.driver-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;margin-top:12px}.driver-row{display:flex;justify-content:space-between;gap:8px;background:#182131;border:1px solid #29364c;border-left:3px solid var(--team);border-radius:6px;padding:8px;color:#c8d5e6;font-size:11px;cursor:pointer}.driver-row.selected{background:#2d3445;border-color:#8292aa}.driver-row span{white-space:nowrap}.driver-row:focus-visible{outline:2px solid white}
  footer{display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;margin-top:20px;padding-top:13px;border-top:1px solid #293449;font-size:9px;color:#889bb4}
  @container(max-width:580px){ha-card{padding:18px}.layout{grid-template-columns:1fr;gap:0}.visual{max-width:390px;width:100%;margin:auto}.insights{padding:22px 0 0}.result{font-size:55px;margin:10px 0 15px}.controls{grid-template-columns:1fr 1fr;gap:10px}.controls label:first-child{grid-column:1/-1}.neighbors{padding:12px 0}h2{font-size:21px}.driver-grid{grid-template-columns:1fr 1fr}}
  @container(max-width:330px){ha-card{padding:12px}.badge{padding:5px;font-size:8px}h2{font-size:18px}.driver-grid{grid-template-columns:1fr}}
`;
if (!customElements.get('f1-circle-of-doom-card')) customElements.define('f1-circle-of-doom-card', F1CircleOfDoomCard);
window.customCards = window.customCards || [];
if (!window.customCards.some(card => card.type === 'f1-circle-of-doom-card')) window.customCards.push({ type: 'f1-circle-of-doom-card', name: 'F1 Circle of Doom', description: 'Geschätztes Boxenstoppfenster aus öffentlichem F1-Timing, ohne F1TV.', preview: false });
