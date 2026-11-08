import { buildModel, validateConfig } from './model.js';
import { circlePoint, circleLabels, circleArc } from './layout.js';

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
