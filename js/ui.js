/**
 * Empire Builder – UI-Rendering und Event-Handler
 */

let currentModalHelp = '';

function showHelp(key) {
    document.getElementById('helpTitle').textContent = 'Hilfe';
    document.getElementById('helpText').textContent = HELP_TEXTS[key] || 'Keine Hilfe verfügbar.';
    document.getElementById('helpModal').classList.add('show');
}

function showModalHelp() {
    if (!currentModalHelp) return;
    document.getElementById('helpTitle').textContent = 'Erklärung';
    document.getElementById('helpText').textContent = currentModalHelp;
    document.getElementById('helpModal').classList.add('show');
}

function updateUI() {
    const prod = production();
    const cons = consume();
    const store = storage();

    document.getElementById('resWood').textContent = Math.floor(game.resources.wood);
    document.getElementById('resClay').textContent = Math.floor(game.resources.clay);
    document.getElementById('resIron').textContent = Math.floor(game.resources.iron);
    document.getElementById('resCrop').textContent = Math.floor(game.resources.crop);
    document.getElementById('rateWood').textContent = `+${prod.wood}/h`;
    document.getElementById('rateClay').textContent = `+${prod.clay}/h`;
    document.getElementById('rateIron').textContent = `+${prod.iron}/h`;
    const cropNet = prod.crop - cons;
    const rateCropEl = document.getElementById('rateCrop');
    rateCropEl.textContent = `${cropNet >= 0 ? '+' : ''}${cropNet}/h`;
    rateCropEl.style.color = cropNet < 0 ? 'var(--danger)' : 'var(--success)';
    document.getElementById('storeWood').textContent = `/${store.wood}`;
    document.getElementById('storeClay').textContent = `/${store.clay}`;
    document.getElementById('storeIron').textContent = `/${store.iron}`;
    document.getElementById('storeCrop').textContent = `/${store.crop}`;
    document.getElementById('gameTime').textContent = `Tag ${game.day}`;

    const queueContainer = document.getElementById('queueContainer');
    const queueList = document.getElementById('queueList');
    if (game.queue.length > 0) {
        queueContainer.style.display = 'block';
        const items = game.queue.slice(0, maxQueueSlots());
        queueList.innerHTML = items.map(q => {
            const total = q.total || q.remaining;
            const pct = Math.max(0, (1 - q.remaining / total) * 100);
            return `<div class="queue-item"><span>${q.icon || '🔨'} ${q.name}</span><div class="progress"><div class="progress-fill" style="width:${pct}%"></div></div><span>${Math.ceil(q.remaining / 1000)}s</span></div>`;
        }).join('');
    } else {
        queueContainer.style.display = 'none';
    }

    save();
}

function renderMap() {
    const grid = document.getElementById('mapGrid');
    grid.innerHTML = '';
    const villageIndex = 24;
    for (let i = 0; i < 49; i++) {
        const t = document.createElement('div');
        t.className = 'map-tile' + (i === villageIndex ? ' village' : ' empty');
        t.onclick = () => {
            if (i === villageIndex) switchTab('village');
        };
        grid.appendChild(t);
    }
}

function openBuildingModal(id) {
    const b = BUILDINGS[id];
    const lvl = game.buildings[id] || 0;
    const cost = getCost(b.base, lvl);
    const time = getBuildTime(b.time, lvl);
    const reqOk = canBuild(id);
    const can = reqOk && Object.entries(cost).every(([k, v]) => game.resources[k] >= v);
    const queueFull = game.queue.length >= maxQueueSlots();

    currentModalHelp = b.help || '';
    const helpBtn = document.getElementById('modalHelpBtn');
    helpBtn.style.display = currentModalHelp ? 'flex' : 'none';

    document.getElementById('modalTitle').textContent = b.name + (lvl ? ` (Stufe ${lvl + 1})` : ' (Stufe 1)');
    document.getElementById('modalDesc').textContent = reqOk
        ? b.desc
        : 'Voraussetzungen: ' + (BUILD_REQS[id]
            ? Object.entries(BUILD_REQS[id]).map(([x, y]) => `${BUILDINGS[x]?.name} St.${y}`).join(', ')
            : '');
    document.getElementById('modalCosts').innerHTML = Object.entries(cost).map(([k, v]) => {
        const ok = game.resources[k] >= v;
        return `<span class="cost ${ok ? 'can' : 'cannot'}">${RESOURCE_ICONS[k]} ${Math.floor(v)}</span>`;
    }).join('');
    document.getElementById('modalTime').textContent = `⏱️ Bauzeit: ${Math.ceil(time / 1000)} Sekunden`;
    const buildBtn = document.getElementById('modalBuild');
    buildBtn.disabled = !can || queueFull;
    buildBtn.onclick = () => {
        if (!can || queueFull) return;
        Object.entries(cost).forEach(([k, v]) => { game.resources[k] -= v; });
        game.queue.push({
            type: 'building',
            id,
            name: `${b.name} St.${lvl + 1}`,
            icon: b.icon,
            remaining: time,
            total: time
        });
        document.getElementById('buildingModal').classList.remove('show');
        addReport(`Bau: ${b.name} Stufe ${lvl + 1}`);
    };
    document.getElementById('buildingModal').classList.add('show');
}

function openFieldModal(idx) {
    const f = game.fields[idx];
    const type = FIELDS.find(x => x.type === f.type);
    const cost = getCost(type.base, f.level);
    const time = getBuildTime(6000, f.level);
    const can = Object.entries(cost).every(([k, v]) => game.resources[k] >= v);
    const queueFull = game.queue.length >= maxQueueSlots();

    currentModalHelp = type.help || '';
    const helpBtn = document.getElementById('modalHelpBtn');
    helpBtn.style.display = currentModalHelp ? 'flex' : 'none';

    const prodAtLevel = Math.floor(type.prodBase * Math.pow(type.prodFactor, f.level));
    document.getElementById('modalTitle').textContent = `${type.name} (Stufe ${f.level + 1})`;
    document.getElementById('modalDesc').textContent = `Produziert ${RESOURCE_NAMES[type.type]}. Stufe ${f.level + 1}: +${prodAtLevel}/h`;
    document.getElementById('modalCosts').innerHTML = Object.entries(cost).map(([k, v]) => {
        const ok = game.resources[k] >= v;
        return `<span class="cost ${ok ? 'can' : 'cannot'}">${RESOURCE_ICONS[k]} ${Math.floor(v)}</span>`;
    }).join('');
    document.getElementById('modalTime').textContent = `⏱️ Bauzeit: ${Math.ceil(time / 1000)} Sekunden`;
    const buildBtn = document.getElementById('modalBuild');
    buildBtn.disabled = !can || queueFull;
    buildBtn.onclick = () => {
        if (!can || queueFull) return;
        Object.entries(cost).forEach(([k, v]) => { game.resources[k] -= v; });
        game.queue.push({
            type: 'field',
            id: idx,
            name: `${type.name} St.${f.level + 1}`,
            icon: type.icon,
            remaining: time,
            total: time
        });
        document.getElementById('buildingModal').classList.remove('show');
        addReport(`Ausbau: ${type.name} Stufe ${f.level + 1}`);
    };
    document.getElementById('buildingModal').classList.add('show');
}

function renderVillage() {
    const layout = document.getElementById('villageLayout');
    const slots = ['main', 'barracks', 'warehouse', 'granary', 'wall', 'rally'];
    layout.innerHTML = slots.map(id => {
        const b = BUILDINGS[id];
        const lvl = game.buildings[id] || 0;
        return `<div class="building-slot ${lvl ? '' : 'empty'}" data-id="${id}"><span class="icon">${b.icon}</span><span class="name">${b.name}</span><span class="level">${lvl ? 'Stufe ' + lvl : 'Leer'}</span></div>`;
    }).join('');
    layout.querySelectorAll('.building-slot').forEach(el => {
        el.onclick = () => openBuildingModal(el.dataset.id);
    });

    const fields = document.getElementById('resourceFields');
    fields.innerHTML = game.fields.map((f, i) => {
        const type = FIELDS.find(x => x.type === f.type);
        return `<div class="field" data-id="${i}"><span class="icon">${type.icon}</span><span class="name">${type.name}</span><span class="lvl">St. ${f.level}</span></div>`;
    }).join('');
    fields.querySelectorAll('.field').forEach(el => {
        el.onclick = () => openFieldModal(parseInt(el.dataset.id, 10));
    });
}

function renderTroops() {
    const grid = document.getElementById('troopsGrid');
    const canTrain = game.buildings.barracks > 0;
    const queueFull = game.queue.length >= maxQueueSlots();
    grid.innerHTML = TROOPS.map(t => {
        const count = game.troops[t.id] || 0;
        const can = Object.entries(t.cost).every(([k, v]) => game.resources[k] >= v);
        const trainHtml = canTrain
            ? `<input type="number" id="train${t.id}" min="1" value="1" max="99"><div class="troop-actions"><button class="btn btn-sm" onclick="trainTroop('${t.id}')" ${!can || queueFull ? 'disabled' : ''}>Rekrutieren</button><button class="btn btn-sm btn-max" onclick="trainMax('${t.id}')" ${!can || queueFull ? 'disabled' : ''}>Max</button></div>`
            : '<p class="troop-hint">Kaserne bauen</p>';
        return `<div class="troop-card"><div class="icon">${t.icon}</div><div class="name">${t.name}</div><div class="count">${count} Einheiten</div><small class="troop-consume">${t.consume} Getr./h</small>${trainHtml}</div>`;
    }).join('');
}

function trainMax(id) {
    const t = TROOPS.find(x => x.id === id);
    if (!t) return;
    let max = 99;
    for (const [k, v] of Object.entries(t.cost)) {
        if (v > 0) max = Math.min(max, Math.floor(game.resources[k] / v));
    }
    max = Math.max(0, max);
    const input = document.getElementById('train' + id);
    if (input) input.value = max > 0 ? max : 1;
    if (max > 0) trainTroop(id);
}

function trainTroop(id) {
    const t = TROOPS.find(x => x.id === id);
    const input = document.getElementById('train' + id);
    const count = Math.min(99, Math.max(1, parseInt(input?.value || 1, 10)));
    const cost = Object.fromEntries(Object.entries(t.cost).map(([k, v]) => [k, v * count]));
    const can = Object.entries(cost).every(([k, v]) => game.resources[k] >= v);
    const queueFull = game.queue.length >= maxQueueSlots();
    if (!can || queueFull) return;

    const cons = consume();
    const prod = production();
    if (prod.crop - cons < t.consume * count && (game.troops[id] || 0) + count > 0) {
        addReport(`Warnung: Nicht genug Getreide-Produktion für ${count}x ${t.name}!`);
    }
    Object.entries(cost).forEach(([k, v]) => { game.resources[k] -= v; });
    const time = t.time * count * 1000
        / (1 + (game.buildings.main || 0) * 0.05)
        / (1 + (game.buildings.barracks || 0) * 0.1);
    game.queue.push({
        type: 'troop',
        id,
        count,
        name: `${count}x ${t.name}`,
        icon: t.icon,
        remaining: time,
        total: time
    });
    addReport(`Rekrutierung: ${count}x ${t.name}`);
}

function renderReports() {
    const list = document.getElementById('reportList');
    list.innerHTML = game.reports.length
        ? game.reports.slice().reverse().map(r =>
            `<div class="report"><div class="time">${r.time}</div>${r.text}</div>`
        ).join('')
        : '<p class="report-empty">Noch keine Berichte</p>';
}

function switchTab(name) {
    document.querySelectorAll('.tab').forEach(t => {
        t.classList.toggle('active', t.dataset.tab === name);
        t.setAttribute('aria-selected', t.dataset.tab === name);
    });
    document.querySelectorAll('.village-view').forEach(v => v.classList.remove('active'));
    document.getElementById(name + 'Tab').classList.add('active');
    if (name === 'village') renderVillage();
    if (name === 'troops') renderTroops();
    if (name === 'reports') renderReports();
}

function initUI() {
    document.getElementById('modalCancel').onclick = () => {
        document.getElementById('buildingModal').classList.remove('show');
    };
    document.querySelectorAll('.tab').forEach(t => {
        t.addEventListener('click', () => switchTab(t.dataset.tab));
    });
}
