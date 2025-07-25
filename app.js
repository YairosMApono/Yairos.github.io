// FamilienHub JavaScript Application

class FamilienHub {
    constructor() {
        this.currentModule = 'dashboard';
        this.data = {
            events: [
                {
                    id: 1,
                    title: 'Zahnarzttermin - Anna',
                    date: '2025-07-17',
                    time: '14:00',
                    member: '3',
                    description: 'Routinekontrolle'
                },
                {
                    id: 2,
                    title: 'Elternabend Schule',
                    date: '2025-07-17',
                    time: '18:30',
                    member: '',
                    description: 'Klassenpflegschaftssitzung'
                },
                {
                    id: 3,
                    title: 'Kinderarzt - Max',
                    date: '2025-07-20',
                    time: '10:00',
                    member: '3',
                    description: 'Impfung'
                }
            ],
            meals: [
                {
                    id: 1,
                    date: '2025-07-17',
                    type: 'dinner',
                    meal: 'Spaghetti Bolognese',
                    recipe: 'Klassische italienische Bolognese'
                },
                {
                    id: 2,
                    date: '2025-07-18',
                    type: 'lunch',
                    meal: 'Schnitzel mit Kartoffeln',
                    recipe: 'Wiener Schnitzel'
                }
            ],
            recipes: [
                {
                    id: 1,
                    name: 'Spaghetti Bolognese',
                    description: 'Klassische italienische Bolognese',
                    ingredients: ['Spaghetti', 'Hackfleisch', 'Tomaten', 'Zwiebeln', 'Knoblauch', 'Karotten', 'Sellerie', 'Rotwein', 'Olivenöl', 'Salz', 'Pfeffer'],
                    instructions: 'Zwiebeln, Knoblauch, Karotten und Sellerie fein hacken und in Olivenöl anbraten. Hackfleisch dazugeben und krümelig braten. Mit Rotwein ablöschen, Tomaten zugeben und ca. 1 Stunde köcheln lassen. Mit Salz und Pfeffer abschmecken. Mit Spaghetti servieren.'
                },
                {
                    id: 2,
                    name: 'Wiener Schnitzel',
                    description: 'Klassisches Wiener Schnitzel mit Kartoffeln',
                    ingredients: ['Kalbsschnitzel', 'Mehl', 'Eier', 'Paniermehl', 'Butterschmalz', 'Salz', 'Pfeffer', 'Kartoffeln'],
                    instructions: 'Schnitzel plattieren, salzen, pfeffern, in Mehl, Ei und Paniermehl wenden. In Butterschmalz goldgelb ausbacken. Mit gekochten Kartoffeln servieren.'
                }
            ],
            shopping: [
                {
                    id: 1,
                    store: 'Supermarkt',
                    items: [
                        { id: 1, name: 'Milch', quantity: '1 Liter', completed: true },
                        { id: 2, name: 'Brot', quantity: '1 Stück', completed: false },
                        { id: 3, name: 'Äpfel', quantity: '1 kg', completed: false },
                        { id: 4, name: 'Nudeln', quantity: '500g', completed: false }
                    ]
                },
                {
                    id: 2,
                    store: 'Bäcker',
                    items: [
                        { id: 5, name: 'Brötchen', quantity: '6 Stück', completed: false },
                        { id: 6, name: 'Kuchen', quantity: '1 Stück', completed: false }
                    ]
                }
            ],
            tasks: [
                {
                    id: 1,
                    title: 'Wäsche waschen',
                    completed: true,
                    dueDate: '2025-07-17',
                    priority: 'Mittel',
                    assignedTo: '1'
                },
                {
                    id: 2,
                    title: 'Zimmer aufräumen',
                    completed: false,
                    dueDate: '2025-07-17',
                    priority: 'Niedrig',
                    assignedTo: '3'
                },
                {
                    id: 3,
                    title: 'Hausaufgaben prüfen',
                    completed: false,
                    dueDate: '2025-07-17',
                    priority: 'Hoch',
                    assignedTo: '2'
                }
            ],
            familyMembers: [
                {
                    id: 1,
                    name: 'Elternteil 1',
                    role: 'adult',
                    color: '#4285f4',
                    avatar: '',
                    permissions: ['admin']
                },
                {
                    id: 2,
                    name: 'Elternteil 2',
                    role: 'adult',
                    color: '#ea4335',
                    avatar: '',
                    permissions: ['admin']
                },
                {
                    id: 3,
                    name: 'Kind 1',
                    role: 'child',
                    color: '#34a853',
                    avatar: '',
                    permissions: ['limited']
                }
            ],
            settings: {
                theme: 'light',
                language: 'de',
                notifications: true,
                autoSave: true,
                backupInterval: 24
            }
        };
        
        this.currentDate = new Date();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderDashboard();
        this.renderCalendar();
        this.renderMeals();
        this.renderShopping();
        this.renderSettings();
        this.renderRecipes();
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const module = e.currentTarget.dataset.module;
                this.switchModule(module);
            });
        });

        // Sidebar toggle
        document.getElementById('sidebarToggle').addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('active');
        });

        // Calendar navigation
        document.getElementById('prevMonth').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            this.renderCalendar();
        });

        document.getElementById('nextMonth').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            this.renderCalendar();
        });

        // Modal handling
        document.getElementById('addEventBtn').addEventListener('click', () => {
            this.openEventModal('new');
        });

        document.getElementById('closeEventModal').addEventListener('click', () => {
            this.closeModal('eventModal');
        });

        document.getElementById('cancelEventBtn').addEventListener('click', () => {
            this.closeModal('eventModal');
        });

        document.getElementById('saveEventBtn').addEventListener('click', () => {
            this.saveEvent();
        });
        document.getElementById('deleteEventBtn').addEventListener('click', () => {
            this.deleteEvent();
        });
        // Umschalten von Ansicht zu Bearbeiten im Modal
        document.getElementById('eventForm').addEventListener('dblclick', (e) => {
            const form = e.currentTarget;
            if (form.getAttribute('data-event-id')) {
                this.openEventModal('edit', parseInt(form.getAttribute('data-event-id')));
            }
        });

        // Settings
        document.getElementById('themeSelect').addEventListener('change', (e) => {
            this.updateSetting('theme', e.target.value);
        });

        document.getElementById('languageSelect').addEventListener('change', (e) => {
            this.updateSetting('language', e.target.value);
        });

        // Close modal when clicking outside
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal(e.target.id);
            }
        });


        document.addEventListener('dragover', (e) => {
            if (e.target.classList.contains('meal-slot')) {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'copy';
                e.target.classList.add('drag-over');
            }
        });
        document.addEventListener('dragleave', (e) => {
            if (e.target.classList.contains('meal-slot')) {
                e.target.classList.remove('drag-over');
            }
        });
        document.addEventListener('drop', (e) => {
            if (e.target.classList.contains('meal-slot')) {
                e.preventDefault();
                e.target.classList.remove('drag-over');
                const recipeId = parseInt(e.dataTransfer.getData('recipeId'));
                if (!recipeId) return;
                const recipe = this.data.recipes.find(r => r.id === recipeId);
                if (!recipe) return;
                // Slot-Infos aus data-Attributen holen
                const date = e.target.dataset.date;
                const mealType = e.target.dataset.mealType;
                if (!date || !mealType) return;
                this.data.meals.push({
                    id: this.generateId(),
                    date,
                    type: mealType,
                    meal: recipe.name,
                    recipe: recipe.description
                });
                this.renderMeals();
                this.renderDashboard();
                this.showToast('Rezept zum Essensplan hinzugefügt!','success');
            }
        });
        // Drag & Drop für Mahlzeiten im Plan verschieben
        document.addEventListener('dragstart', (e) => {
            if (e.target.classList.contains('meal-slot') && e.target.classList.contains('has-meal')) {
                const date = e.target.dataset.date;
                const mealType = e.target.dataset.mealType;
                e.dataTransfer.setData('moveMeal', JSON.stringify({date, mealType}));
                e.dataTransfer.effectAllowed = 'move';
            }
        });
        document.addEventListener('drop', (e) => {
            if (e.target.classList.contains('meal-slot')) {
                // ... bestehende Rezept-Drop-Logik ...
                const moveMeal = e.dataTransfer.getData('moveMeal');
                if (moveMeal) {
                    const {date: fromDate, mealType: fromType} = JSON.parse(moveMeal);
                    const toDate = e.target.dataset.date;
                    const toType = e.target.dataset.mealType;
                    if (!fromDate || !fromType || !toDate || !toType) return;
                    // Finde und verschiebe die Mahlzeit
                    const mealIdx = this.data.meals.findIndex(m => m.date === fromDate && m.type === fromType);
                    if (mealIdx === -1) return;
                    const meal = this.data.meals[mealIdx];
                    // Ziel-Slot ggf. überschreiben
                    const targetIdx = this.data.meals.findIndex(m => m.date === toDate && m.type === toType);
                    if (targetIdx !== -1) this.data.meals.splice(targetIdx, 1);
                    this.data.meals[mealIdx] = {...meal, date: toDate, type: toType};
                    this.renderMeals();
                    this.renderDashboard();
                    this.showToast('Mahlzeit verschoben!','success');

        // Kalender-Event-Klick-Handler (Delegation)
        document.getElementById('calendarGrid').addEventListener('click', (e) => {
            const eventEl = e.target.closest('.calendar-event');
            if (eventEl) {
                const eventId = eventEl.dataset.id;
                if (eventId) {
                    this.openEventModal('view', parseInt(eventId));
                }
            }
        });
    }

    switchModule(module) {
        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-module="${module}"]`).classList.add('active');

        // Update page title
        const titles = {
            dashboard: 'Dashboard',
            calendar: 'Kalender',
            meals: 'Essensplan',
            recipes: 'Rezeptbuch',
            shopping: 'Einkaufsliste',
            vacation: 'Urlaubsplaner',
            contacts: 'Kontakte',
            budget: 'Budget',
            tasks: 'Aufgaben',
            chat: 'Chat',
            media: 'Mediathek',
            health: 'Gesundheit',
            settings: 'Einstellungen'
        };
        document.getElementById('pageTitle').textContent = titles[module] || 'FamilienHub';

        // Show/hide modules
        document.querySelectorAll('.module').forEach(mod => {
            mod.classList.add('hidden');
        });
        document.getElementById(`${module}-module`).classList.remove('hidden');

        this.currentModule = module;

        // Close sidebar on mobile
        if (window.innerWidth <= 768) {
            document.getElementById('sidebar').classList.remove('active');
        }
    }

    renderDashboard() {
        // Update upcoming events
        const upcomingEventsContainer = document.getElementById('upcomingEvents');
        const today = new Date();
        const todayEvents = this.data.events.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate.toDateString() === today.toDateString();
        });

        upcomingEventsContainer.innerHTML = todayEvents.map(event => `
            <div class="event-item">
                <div class="event-time">${event.time}</div>
                <div class="event-title">${event.title}</div>
            </div>
        `).join('');

        // Update shopping preview
        const shoppingPreview = document.getElementById('shoppingPreview');
        const allItems = this.data.shopping.flatMap(list => list.items);
        const recentItems = allItems.slice(0, 3);

        shoppingPreview.innerHTML = recentItems.map(item => `
            <div class="shopping-item">
                <i class="fas ${item.completed ? 'fa-check-circle' : 'fa-circle'}"></i>
                <span>${item.name}</span>
            </div>
        `).join('');

        // Update task preview
        const taskPreview = document.getElementById('taskPreview');
        const todayTasks = this.data.tasks.filter(task => {
            const taskDate = new Date(task.dueDate);
            return taskDate.toDateString() === today.toDateString();
        });

        taskPreview.innerHTML = todayTasks.map(task => `
            <div class="task-item">
                <input type="checkbox" ${task.completed ? 'checked' : ''}>
                <span class="${task.completed ? 'completed' : ''}">${task.title}</span>
            </div>
        `).join('');

        // Update meal preview
        const mealPreview = document.getElementById('mealPreview');
        const todayMeals = this.data.meals.filter(meal => {
            const mealDate = new Date(meal.date);
            return mealDate.toDateString() === today.toDateString();
        });

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowMeals = this.data.meals.filter(meal => {
            const mealDate = new Date(meal.date);
            return mealDate.toDateString() === tomorrow.toDateString();
        });

        const mealItems = [];
        if (todayMeals.length > 0) {
            mealItems.push(`<div class="meal-item"><strong>Heute Abend:</strong> ${todayMeals[0].meal}</div>`);
        }
        if (tomorrowMeals.length > 0) {
            mealItems.push(`<div class="meal-item"><strong>Morgen:</strong> ${tomorrowMeals[0].meal}</div>`);
        }

        mealPreview.innerHTML = mealItems.join('');
    }

    renderCalendar() {
        const calendarGrid = document.getElementById('calendarGrid');
        const currentMonth = document.getElementById('currentMonth');
        
        // Update month display
        const monthNames = [
            'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
            'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
        ];
        currentMonth.textContent = `${monthNames[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;

        // Generate calendar days
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        const days = [];
        const today = new Date();
        
        // Add day headers
        const dayHeaders = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
        dayHeaders.forEach(day => {
            days.push(`<div class="calendar-day-header">${day}</div>`);
        });

        // Add calendar days
        for (let i = 0; i < 42; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            
            const isToday = date.toDateString() === today.toDateString();
            const isOtherMonth = date.getMonth() !== month;
            const dateStr = date.toISOString().split('T')[0];
            
            const dayEvents = this.data.events.filter(event => event.date === dateStr);
            
            let dayClass = 'calendar-day';
            if (isToday) dayClass += ' today';
            if (isOtherMonth) dayClass += ' other-month';
            
            const eventsHtml = dayEvents.map(event => 
                `<div class="calendar-event" data-id="${event.id}" title="${event.title}">${event.title}</div>`
            ).join('');
            
            days.push(`
                <div class="${dayClass}">
                    <div class="calendar-day-number">${date.getDate()}</div>
                    ${eventsHtml}
                </div>
            `);
        }

        calendarGrid.innerHTML = days.join('');

        // Interaktivität: Klick auf Kalendertag für neuen Termin
        calendarGrid.querySelectorAll('.calendar-day').forEach(dayEl => {
            dayEl.addEventListener('click', (e) => {
                // Nur auslösen, wenn nicht auf ein Event geklickt wurde
                if (e.target.classList.contains('calendar-event')) return;
                // Datum extrahieren
                const dayNumber = dayEl.querySelector('.calendar-day-number').textContent;
                const month = this.currentDate.getMonth();
                const year = this.currentDate.getFullYear();
                // Prüfen, ob Tag zu anderem Monat gehört
                let date = new Date(year, month, dayNumber);
                if (dayEl.classList.contains('other-month')) {
                    if (parseInt(dayNumber) > 15) {
                        // Vorheriger Monat
                        date = new Date(year, month - 1, dayNumber);
                    } else {
                        // Nächster Monat
                        date = new Date(year, month + 1, dayNumber);
                    }
                }
                // Datum ins Formular eintragen
                document.getElementById('eventDate').value = date.toISOString().split('T')[0];
                this.openModal('eventModal');
            });
        });

        // Klick auf Event: Details anzeigen (Modal mit Infos)
        calendarGrid.querySelectorAll('.calendar-event').forEach(eventEl => {
            eventEl.addEventListener('click', (e) => {
                e.stopPropagation();
                const eventTitle = eventEl.getAttribute('title');
                const event = this.data.events.find(ev => ev.title === eventTitle);
                if (event) {
                    // Felder im Modal ausfüllen
                    document.getElementById('eventTitle').value = event.title;
                    document.getElementById('eventDate').value = event.date;
                    document.getElementById('eventTime').value = event.time;
                    document.getElementById('eventMember').value = event.member;
                    document.getElementById('eventDescription').value = event.description;
                    this.openModal('eventModal');
                }
            });
        });
    }

    renderMeals() {
        const mealWeek = document.getElementById('mealWeek');
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());

        const weekDays = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
        const mealTypes = ['Frühstück', 'Mittagessen', 'Abendessen'];
        
        let html = '<div class="meal-time"></div>';
        
        // Add day headers
        for (let i = 0; i < 7; i++) {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);
            html += `<div class="meal-day-header">${weekDays[i]} ${date.getDate()}.${date.getMonth() + 1}</div>`;
        }

        // Add meal slots
        mealTypes.forEach(mealType => {
            html += `<div class="meal-time">${mealType}</div>`;
            
            for (let i = 0; i < 7; i++) {
                const date = new Date(startOfWeek);
                date.setDate(startOfWeek.getDate() + i);
                const dateStr = date.toISOString().split('T')[0];
                
                const meal = this.data.meals.find(m => 
                    m.date === dateStr && 
                    ((mealType === 'Frühstück' && m.type === 'breakfast') ||
                     (mealType === 'Mittagessen' && m.type === 'lunch') ||
                     (mealType === 'Abendessen' && m.type === 'dinner'))
                );
                
                const mealClass = meal ? 'meal-slot has-meal' : 'meal-slot';
                const mealContent = meal ? meal.meal : 'Klicken zum Hinzufügen';
                // data-Attribute für Drag & Drop
                html += `<div class="${mealClass}" data-date="${dateStr}" data-meal-type="${mealType === 'Frühstück' ? 'breakfast' : mealType === 'Mittagessen' ? 'lunch' : 'dinner'}" draggable="${meal ? 'true' : 'false'}">${mealContent}</div>`;
            }
        });

        mealWeek.innerHTML = html;
    }

    renderShopping() {
        const shoppingLists = document.getElementById('shoppingLists');
        
        const html = this.data.shopping.map(list => `
            <div class="shopping-list">
                <div class="shopping-list-header">
                    <h3>${list.store}</h3>
                </div>
                <div class="shopping-list-items">
                    ${list.items.map(item => `
                        <div class="shopping-list-item">
                            <input type="checkbox" ${item.completed ? 'checked' : ''} 
                                   onchange="app.toggleShoppingItem(${list.id}, ${item.id})">
                            <span class="${item.completed ? 'completed' : ''}">${item.name}</span>
                            <div class="quantity">${item.quantity}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');

        shoppingLists.innerHTML = html;
    }

    renderSettings() {
        const familyMembers = document.getElementById('familyMembers');
        const themeSelect = document.getElementById('themeSelect');
        const languageSelect = document.getElementById('languageSelect');

        // Render family members
        const membersHtml = this.data.familyMembers.map(member => `
            <div class="family-member">
                <div class="member-avatar" style="background-color: ${member.color}">
                    ${member.name.charAt(0)}
                </div>
                <div class="member-info">
                    <div class="member-name">${member.name}</div>
                    <div class="member-role">${member.role === 'adult' ? 'Erwachsener' : 'Kind'}</div>
                </div>
            </div>
        `).join('');

        familyMembers.innerHTML = membersHtml;

        // Set current settings
        themeSelect.value = this.data.settings.theme;
        languageSelect.value = this.data.settings.language;
    }

    openModal(modalId) {
        document.getElementById(modalId).classList.add('active');
    }

    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('active');
        if (modalId === 'eventModal') {
            document.getElementById('eventForm').reset();
        }
    }

    openEventModal(mode, eventId = null) {
        // mode: 'new', 'edit', 'view'
        const modal = document.getElementById('eventModal');
        const form = document.getElementById('eventForm');
        const titleEl = document.getElementById('eventTitle');
        const dateEl = document.getElementById('eventDate');
        const timeEl = document.getElementById('eventTime');
        const memberEl = document.getElementById('eventMember');
        const descEl = document.getElementById('eventDescription');
        const saveBtn = document.getElementById('saveEventBtn');
        const delBtn = document.getElementById('deleteEventBtn');
        const modalTitle = modal.querySelector('.modal-header h3');
        form.reset();
        if (mode === 'new') {
            modalTitle.textContent = 'Neuer Termin';
            saveBtn.textContent = 'Speichern';
            saveBtn.style.display = '';
            if (delBtn) delBtn.style.display = 'none';
            form.removeAttribute('data-event-id');
            titleEl.readOnly = false;
            dateEl.readOnly = false;
            timeEl.readOnly = false;
            memberEl.disabled = false;
            descEl.readOnly = false;
        } else {
            const event = this.data.events.find(ev => ev.id === eventId);
            if (!event) return;
            titleEl.value = event.title;
            dateEl.value = event.date;
            timeEl.value = event.time;
            memberEl.value = event.member;
            descEl.value = event.description;
            form.setAttribute('data-event-id', event.id);
            if (mode === 'view') {
                modalTitle.textContent = 'Termin anzeigen';
                saveBtn.style.display = 'none';
                if (delBtn) delBtn.style.display = '';
                titleEl.readOnly = true;
                dateEl.readOnly = true;
                timeEl.readOnly = true;
                memberEl.disabled = true;
                descEl.readOnly = true;
            } else if (mode === 'edit') {
                modalTitle.textContent = 'Termin bearbeiten';
                saveBtn.textContent = 'Änderungen speichern';
                saveBtn.style.display = '';
                if (delBtn) delBtn.style.display = '';
                titleEl.readOnly = false;
                dateEl.readOnly = false;
                timeEl.readOnly = false;
                memberEl.disabled = false;
                descEl.readOnly = false;
            }
        }
        this.openModal('eventModal');
    }

    saveEvent() {
        const form = document.getElementById('eventForm');
        const eventId = form.getAttribute('data-event-id');
        const title = document.getElementById('eventTitle').value;
        const date = document.getElementById('eventDate').value;
        const time = document.getElementById('eventTime').value;
        const member = document.getElementById('eventMember').value;
        const description = document.getElementById('eventDescription').value;
        if (!title || !date) {
            this.showToast('Bitte füllen Sie alle Pflichtfelder aus!', 'error');
            return;
        }
        if (eventId) {
            // Update bestehendes Event
            const event = this.data.events.find(ev => ev.id == eventId);
            if (event) {
                event.title = title;
                event.date = date;
                event.time = time;
                event.member = member;
                event.description = description;
                this.showToast('Termin aktualisiert!', 'success');
            }
        } else {
            // Neues Event
            const newEvent = {
                id: Date.now(),
                title,
                date,
                time,
                member,
                description
            };
            this.data.events.push(newEvent);
            this.showToast('Termin erfolgreich hinzugefügt!', 'success');
        }
        this.closeModal('eventModal');
        this.renderCalendar();
        this.renderDashboard();
    }

    deleteEvent() {
        const form = document.getElementById('eventForm');
        const eventId = form.getAttribute('data-event-id');
        if (eventId) {
            this.data.events = this.data.events.filter(ev => ev.id != eventId);
            this.showToast('Termin gelöscht!', 'success');
            this.closeModal('eventModal');
            this.renderCalendar();
            this.renderDashboard();
        }
    }

    toggleShoppingItem(listId, itemId) {
        const list = this.data.shopping.find(l => l.id === listId);
        const item = list.items.find(i => i.id === itemId);
        item.completed = !item.completed;
        this.renderShopping();
        this.renderDashboard();
    }

    updateSetting(key, value) {
        this.data.settings[key] = value;
        this.showToast('Einstellung gespeichert!', 'success');
        
        if (key === 'theme') {
            this.applyTheme(value);
        }
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-color-scheme', theme);
    }

    showToast(message, type = 'info') {
        const toastContainer = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        
        toast.innerHTML = `
            <i class="fas ${icons[type]} toast-icon"></i>
            <div class="toast-message">${message}</div>
            <button class="toast-close">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        toastContainer.appendChild(toast);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            toast.remove();
        }, 5000);
        
        // Remove on click
        toast.querySelector('.toast-close').addEventListener('click', () => {
            toast.remove();
        });
    }

    // Utility functions
    formatDate(date) {
        return new Date(date).toLocaleDateString('de-DE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    formatTime(time) {
        return time ? new Date(`2000-01-01T${time}`).toLocaleTimeString('de-DE', {
            hour: '2-digit',
            minute: '2-digit'
        }) : '';
    }

    generateId() {
        return Date.now() + Math.random();
    }

    // Data persistence simulation (since localStorage is not available)
    saveData() {
        // In a real application, this would save to localStorage
        console.log('Daten gespeichert:', this.data);
    }

    loadData() {
        // In a real application, this would load from localStorage
        console.log('Daten geladen:', this.data);
    }

    renderRecipes() {
        const recipesModule = document.getElementById('recipes-module');
        if (!recipesModule) return;
        const comingSoon = recipesModule.querySelector('.coming-soon');
        if (comingSoon) comingSoon.remove();
        let html = '<div class="recipes-list">';
        this.data.recipes.forEach(recipe => {
            html += `<div class="recipe-card" draggable="true" data-recipe-id="${recipe.id}">
                <div class="recipe-title">${recipe.name}</div>
                <div class="recipe-desc">${recipe.description}</div>
                <button class="btn btn--secondary add-to-mealplan-btn" data-recipe-id="${recipe.id}">Zum Essensplan hinzufügen</button>
            </div>`;
        });
        html += '</div>';
        recipesModule.insertAdjacentHTML('beforeend', html);
    }

    openAddMealModal(recipeId) {
        // Einfaches Prompt für Tag und Mahlzeit (später Modal)
        const recipe = this.data.recipes.find(r => r.id === recipeId);
        if (!recipe) return;
        const date = prompt('Für welches Datum (YYYY-MM-DD) soll das Rezept eingeplant werden?');
        if (!date) return;
        const mealType = prompt('Für welche Mahlzeit? (breakfast, lunch, dinner)');
        if (!['breakfast','lunch','dinner'].includes(mealType)) return;
        this.data.meals.push({
            id: this.generateId(),
            date,
            type: mealType,
            meal: recipe.name,
            recipe: recipe.description
        });
        this.renderMeals();
        this.renderDashboard();
        this.showToast('Rezept zum Essensplan hinzugefügt!','success');
    }
}

// Initialize the application
const app = new FamilienHub();

// Global functions for event handlers
window.app = app;

// Handle responsive design
window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
        document.getElementById('sidebar').classList.remove('active');
    }
});

// Service Worker for PWA functionality (if needed)
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(err => {
        console.log('Service Worker registration failed:', err);
    });
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
            case '1':
                e.preventDefault();
                app.switchModule('dashboard');
                break;
            case '2':
                e.preventDefault();
                app.switchModule('calendar');
                break;
            case '3':
                e.preventDefault();
                app.switchModule('meals');
                break;
            case '4':
                e.preventDefault();
                app.switchModule('shopping');
                break;
        }
    }
    
    // Escape key to close modals
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal.active').forEach(modal => {
            modal.classList.remove('active');
        });
    }
});

// Auto-save functionality
setInterval(() => {
    app.saveData();
}, 30000); // Save every 30 seconds

// Show welcome message
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        app.showToast('Willkommen im FamilienHub!', 'success');
    }, 1000);
});

// Handle offline/online status
window.addEventListener('online', () => {
    app.showToast('Verbindung wiederhergestellt!', 'success');
});

window.addEventListener('offline', () => {
    app.showToast('Offline-Modus aktiv', 'warning');
});

// Handle beforeunload for data saving
window.addEventListener('beforeunload', () => {
    app.saveData();
});

// Additional utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Search functionality (placeholder)
function searchContent(query) {
    const results = [];
    // Search through events, meals, tasks, etc.
    app.data.events.forEach(event => {
        if (event.title.toLowerCase().includes(query.toLowerCase())) {
            results.push({ type: 'event', data: event });
        }
    });
    return results;
}

// Export functionality (placeholder)
function exportData() {
    const dataStr = JSON.stringify(app.data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'familienhub-backup.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

// Import functionality (placeholder)
function importData(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            app.data = importedData;
            app.renderDashboard();
            app.renderCalendar();
            app.renderMeals();
            app.renderShopping();
            app.renderSettings();
            app.showToast('Daten erfolgreich importiert!', 'success');
        } catch (error) {
            app.showToast('Fehler beim Importieren der Daten!', 'error');
        }
    };
    reader.readAsText(file);
}