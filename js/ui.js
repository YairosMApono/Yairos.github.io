/**
 * Empire Builder - UI-Controller
 * Rendering, Modals, Tabs und DOM-Interaktionen
 */
import {
    BUILDINGS, FIELDS, TROOPS, HELP_TEXTS, BUILD_REQS,
    COST_ICONS, RESOURCE_NAMES, BUILDING_SLOTS, MAX_LEVEL, COST_TO_RES
} from './config.js';

export default class GameUI {
    constructor(engine) {
        this.engine = engine;
        this.currentTab = 'map';
        this._modalHelp = '';
    }

    init() {
        this._bindTabs();
        this._bindModals();
        this._bindReset();
        this._bindHelp();
        this.renderMap();
        this.renderVillage();
        this.renderTroops();
        this.renderReports();
        this.engine.onChange(() => this.updateDisplay());
    }

    // --- Event Binding ---

    _bindTabs() {
        document.querySelectorAll('.tab').forEach(t =>
            t.addEventListener('click', () => this.switchTab(t.dataset.tab))
        );
    }

    _bindModals() {
        document.getElementById('modalCancel').addEventListener('click', () =>
            this._closeModal('buildingModal')
        );
        document.getElementById('helpClose').addEventListener('click', () =>
            this._closeModal('helpModal')
        );
        document.getElementById('modalHelpBtn').addEventListener('click', () =>
            this._showModalHelp()
        );
    }

    _bindReset() {
        document.getElementById('resetBtn').addEventListener('click', () => {
            if (confirm('Neues Spiel starten? Dein Fortschritt geht verloren.')) {
                this.engine.reset();
                location.reload();
            }
        });
    }

    _bindHelp() {
        document.querySelectorAll('[data-help]').forEach(btn =>
            btn.addEventListener('click', () => this.showHelp(btn.dataset.help))
        );
    }

    // --- Tab Navigation ---

    switchTab(name) {
        this.currentTab = name;
        document.querySelectorAll('.tab').forEach(t =>
            t.classList.toggle('active', t.dataset.tab === name)
        );
        document.querySelectorAll('.tab-panel').forEach(v =>
            v.classList.remove('active')
        );
        const panel = document.getElementById(name + 'Tab');
        if (panel) panel.classList.add('active');

        if (name === 'village') this.renderVillage();
        if (name === 'troops') this.renderTroops();
        if (name === 'reports') this.renderReports();
    }

    // --- Help System ---

    showHelp(key) {
        document.getElementById('helpTitle').textContent = 'Hilfe';
        document.getElementById('helpText').textContent = HELP_TEXTS[key] || 'Keine Hilfe verfügbar.';
        this._openModal('helpModal');
    }

    _showModalHelp() {
        if (!this._modalHelp) return;
        document.getElementById('helpTitle').textContent = 'Erklärung';
        document.getElementById('helpText').textContent = this._modalHelp;
        this._openModal('helpModal');
    }

    // --- Modals ---

    _openModal(id) { document.getElementById(id).classList.add('show'); }
    _closeModal(id) { document.getElementById(id).classList.remove('show'); }

    // --- Toast Notifications ---

    showToast(text, type = 'success') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = text;
        container.appendChild(toast);
        requestAnimationFrame(() => toast.classList.add('show'));
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400);
        }, 3500);
    }

    // --- Formatting ---

    _formatTime(ms) {
        const sec = Math.ceil(ms / 1000);
        if (sec < 60) return `${sec}s`;
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    }

    // --- Display Update (called every tick) ---

    updateDisplay() {
        const { state } = this.engine;
        const prod = this.engine.getProduction();
        const cons = this.engine.getConsumption();
        const store = this.engine.getStorage();

        const resKeys = ['Wood', 'Clay', 'Iron', 'Crop'];
        const resMap = ['wood', 'clay', 'iron', 'crop'];

        resKeys.forEach((key, i) => {
            const res = resMap[i];
            const val = Math.floor(state.resources[res]);
            const max = store[res];
            const pct = Math.min(100, (val / max) * 100);

            document.getElementById(`res${key}`).textContent = val.toLocaleString('de-DE');
            document.getElementById(`store${key}`).textContent = `/ ${max.toLocaleString('de-DE')}`;

            const fill = document.getElementById(`fill${key}`);
            if (fill) {
                fill.style.width = `${pct}%`;
                fill.classList.toggle('warning', pct >= 85);
                fill.classList.toggle('full', pct >= 95);
            }
        });

        document.getElementById('rateWood').textContent = `+${prod.wood}/h`;
        document.getElementById('rateClay').textContent = `+${prod.clay}/h`;
        document.getElementById('rateIron').textContent = `+${prod.iron}/h`;

        const cropNet = prod.crop - cons;
        const rateCrop = document.getElementById('rateCrop');
        rateCrop.textContent = `${cropNet >= 0 ? '+' : ''}${cropNet}/h`;
        rateCrop.classList.toggle('negative', cropNet < 0);

        document.getElementById('gameTime').textContent = `Tag ${state.day}`;
        document.getElementById('gameScore').textContent = this.engine.getScore().toLocaleString('de-DE');

        this._renderQueue();
    }

    _renderQueue() {
        const { state } = this.engine;
        const container = document.getElementById('queueContainer');

        if (state.queue.length === 0) {
            container.style.display = 'none';
            return;
        }
        container.style.display = 'block';
        const items = state.queue.slice(0, this.engine.getMaxQueueSlots());
        document.getElementById('queueList').innerHTML = items.map(q => {
            const total = q.total || q.remaining;
            const pct = Math.max(0, (1 - q.remaining / total) * 100);
            return `<div class="queue-item">
                <span class="queue-label">${q.icon || '🔨'} ${q.name}</span>
                <div class="progress"><div class="progress-fill" style="width:${pct}%"></div></div>
                <span class="queue-time">${this._formatTime(q.remaining)}</span>
            </div>`;
        }).join('');
    }

    // --- Map ---

    renderMap() {
        const grid = document.getElementById('mapGrid');
        grid.innerHTML = '';
        for (let i = 0; i < 49; i++) {
            const tile = document.createElement('div');
            tile.className = `map-tile${i === 24 ? ' village' : ' empty'}`;
            if (i === 24) tile.addEventListener('click', () => this.switchTab('village'));
            grid.appendChild(tile);
        }
    }

    // --- Village ---

    renderVillage() {
        const layout = document.getElementById('villageLayout');
        layout.innerHTML = BUILDING_SLOTS.map(id => {
            const b = BUILDINGS[id];
            const lvl = this.engine.state.buildings[id] || 0;
            const maxed = lvl >= MAX_LEVEL;
            return `<div class="building-slot ${lvl ? '' : 'empty'} ${maxed ? 'maxed' : ''}" data-id="${id}">
                <span class="icon">${b.icon}</span>
                <span class="name">${b.name}</span>
                <span class="level">${maxed ? '★ MAX' : lvl ? `Stufe ${lvl}` : 'Leer'}</span>
            </div>`;
        }).join('');

        layout.querySelectorAll('.building-slot').forEach(el =>
            el.addEventListener('click', () => this.openBuildingModal(el.dataset.id))
        );

        const fields = document.getElementById('resourceFields');
        fields.innerHTML = this.engine.state.fields.map((f, i) => {
            const def = FIELDS.find(x => x.type === f.type);
            const maxed = f.level >= MAX_LEVEL;
            return `<div class="field ${maxed ? 'maxed' : ''}" data-id="${i}">
                <span class="icon">${def.icon}</span>
                <span class="name">${def.name}</span>
                <span class="lvl">${maxed ? '★' : `St. ${f.level}`}</span>
            </div>`;
        }).join('');

        fields.querySelectorAll('.field').forEach(el =>
            el.addEventListener('click', () => this.openFieldModal(parseInt(el.dataset.id)))
        );
    }

    // --- Building Modal ---

    openBuildingModal(id) {
        const b = BUILDINGS[id];
        const lvl = this.engine.state.buildings[id] || 0;

        if (lvl >= MAX_LEVEL) {
            this.showToast(`${b.name} ist auf maximaler Stufe!`, 'info');
            return;
        }

        const cost = this.engine.getCost(b.base, lvl);
        const time = this.engine.getBuildTime(b.time, lvl);
        const reqOk = this.engine.canBuild(id);
        const afford = this.engine.canAfford(cost);
        const full = this.engine.isQueueFull();

        this._modalHelp = b.help || '';
        document.getElementById('modalHelpBtn').style.display = this._modalHelp ? 'flex' : 'none';
        document.getElementById('modalTitle').textContent = `${b.name} (Stufe ${lvl + 1})`;

        if (!reqOk) {
            const reqs = Object.entries(BUILD_REQS[id] || {})
                .map(([x, y]) => `${BUILDINGS[x]?.name} St.${y}`)
                .join(', ');
            document.getElementById('modalDesc').textContent = `Voraussetzungen: ${reqs}`;
        } else {
            document.getElementById('modalDesc').textContent = b.desc;
        }

        this._renderCosts(cost);
        document.getElementById('modalTime').textContent = `⏱️ Bauzeit: ${this._formatTime(time)}`;

        const btn = document.getElementById('modalBuild');
        btn.disabled = !afford || !reqOk || full;
        btn.textContent = full ? 'Queue voll' : 'Ausbauen';
        btn.onclick = () => {
            if (this.engine.startBuilding(id)) {
                this._closeModal('buildingModal');
                this.renderVillage();
            }
        };

        this._openModal('buildingModal');
    }

    openFieldModal(idx) {
        const field = this.engine.state.fields[idx];
        const def = FIELDS.find(x => x.type === field.type);

        if (field.level >= MAX_LEVEL) {
            this.showToast(`${def.name} ist auf maximaler Stufe!`, 'info');
            return;
        }

        const cost = this.engine.getCost(def.base, field.level);
        const time = this.engine.getBuildTime(6000, field.level);
        const afford = this.engine.canAfford(cost);
        const full = this.engine.isQueueFull();
        const nextProd = Math.floor(def.prodBase * Math.pow(def.prodFactor, field.level));

        this._modalHelp = def.help || '';
        document.getElementById('modalHelpBtn').style.display = this._modalHelp ? 'flex' : 'none';
        document.getElementById('modalTitle').textContent = `${def.name} (Stufe ${field.level + 1})`;
        document.getElementById('modalDesc').textContent =
            `Produziert ${RESOURCE_NAMES[def.type]}. Nächste Stufe: +${nextProd}/h`;

        this._renderCosts(cost);
        document.getElementById('modalTime').textContent = `⏱️ Bauzeit: ${this._formatTime(time)}`;

        const btn = document.getElementById('modalBuild');
        btn.disabled = !afford || full;
        btn.textContent = full ? 'Queue voll' : 'Ausbauen';
        btn.onclick = () => {
            if (this.engine.startField(idx)) {
                this._closeModal('buildingModal');
                this.renderVillage();
            }
        };

        this._openModal('buildingModal');
    }

    _renderCosts(cost) {
        document.getElementById('modalCosts').innerHTML = Object.entries(cost).map(([k, v]) => {
            const resKey = COST_TO_RES[k];
            const ok = this.engine.state.resources[resKey] >= v;
            return `<span class="cost ${ok ? 'can' : 'cannot'}">${COST_ICONS[k]} ${Math.floor(v).toLocaleString('de-DE')}</span>`;
        }).join('');
    }

    // --- Troops ---

    renderTroops() {
        const grid = document.getElementById('troopsGrid');
        const canTrain = this.engine.state.buildings.barracks > 0;
        const full = this.engine.isQueueFull();

        const totalTroops = this.engine.getTotalTroops();
        const atkPower = this.engine.getAttackPower();
        const defPower = this.engine.getDefensePower();

        const summaryEl = document.getElementById('troopsSummary');
        if (summaryEl) {
            summaryEl.innerHTML = `
                <div class="summary-stat"><span class="summary-label">Truppen</span><span class="summary-value">${totalTroops}</span></div>
                <div class="summary-stat"><span class="summary-label">⚔️ Angriff</span><span class="summary-value">${atkPower.toLocaleString('de-DE')}</span></div>
                <div class="summary-stat"><span class="summary-label">🛡️ Verteidigung</span><span class="summary-value">${defPower.toLocaleString('de-DE')}</span></div>
            `;
        }

        grid.innerHTML = TROOPS.map(t => {
            const count = this.engine.state.troops[t.id] || 0;
            const afford = this.engine.canAfford(t.cost);
            return `<div class="troop-card">
                <div class="troop-header">
                    <span class="icon">${t.icon}</span>
                    <div>
                        <div class="name">${t.name}</div>
                        <div class="count">${count} Einheiten</div>
                    </div>
                </div>
                <div class="troop-stats">
                    <span class="stat atk" title="Angriff">⚔️ ${t.attack}</span>
                    <span class="stat def" title="Verteidigung">🛡️ ${t.defInf}</span>
                    <span class="stat consume" title="Verbrauch">🌾 ${t.consume}/h</span>
                </div>
                <div class="troop-cost">
                    ${Object.entries(t.cost).map(([k, v]) => `<span>${COST_ICONS[k]}${v}</span>`).join('')}
                </div>
                ${canTrain ? `
                    <div class="troop-controls">
                        <input type="number" id="train${t.id}" min="1" value="1" max="99" class="train-input">
                        <button class="btn btn-sm btn-train" data-troop="${t.id}" ${!afford || full ? 'disabled' : ''}>
                            Rekrutieren
                        </button>
                    </div>
                ` : '<p class="troop-locked">⚔️ Kaserne benötigt</p>'}
            </div>`;
        }).join('');

        grid.querySelectorAll('[data-troop]').forEach(btn =>
            btn.addEventListener('click', () => {
                const id = btn.dataset.troop;
                const input = document.getElementById('train' + id);
                const count = parseInt(input?.value || '1');
                if (this.engine.trainTroops(id, count)) {
                    this.renderTroops();
                }
            })
        );
    }

    // --- Reports ---

    renderReports() {
        const list = document.getElementById('reportList');
        const reports = this.engine.state.reports;

        if (reports.length === 0) {
            list.innerHTML = '<p class="no-reports">Noch keine Berichte vorhanden</p>';
            return;
        }

        list.innerHTML = reports.slice().reverse().map(r =>
            `<div class="report">
                <span class="report-time">${r.time}</span>
                <span class="report-text">${r.text}</span>
            </div>`
        ).join('');
    }

    // --- Tick Result Handler ---

    handleTickResult(result) {
        if (!result) return;
        if (result.completed?.length > 0) {
            result.completed.forEach(q => this.showToast(`✅ ${q.name} abgeschlossen!`));
            if (this.currentTab === 'village') this.renderVillage();
            if (this.currentTab === 'troops') this.renderTroops();
        }
        if (result.milestone) {
            this.showToast(result.milestone.text, 'milestone');
        }
    }
}
