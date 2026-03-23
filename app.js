// app.js — Premium Controller for RoamBuddy
// --------------------------------------------------

// --- Application State ---
let currentState = {
    screen: 'landing',
    wizardStep: 1,
    user: null,
    tripData: {
        destination: '',
        days: 3,
        type: 'Local',
        travelers: 'Solo',
        budget: 'Medium',
        food: 'Both',
        accommodation: 'Hotel',
        transport: 'Car',
        departureTime: '08:00'
    },
    itinerary: [],
    currentDayView: 1,
    delayUndoStack: []
};

// --- Initialization ---
document.addEventListener('DOMContentLoaded', async () => {
    // Initial Icon Render
    if (window.lucide) lucide.createIcons();
    
    // 1. Load State
    loadState();
    
    // 2. Image Global Fallback System
    document.addEventListener('error', (e) => {
        if (e.target.tagName === 'IMG') {
            e.target.src = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80'; // High-quality default
            e.target.classList.add('img-fallback-triggered');
        }
    }, true);
    
    // 3. Routing / Link Checks
    if (window.rbShare && window.rbShare.checkSharedLink()) {
        showScreen('dashboard');
    } else {
        updateAuthDisplay();
    }
    
    // 4. Gallery Logic
    if (window.rbGallery) window.rbGallery.renderGallery();
    
    // 5. Dev Mode Check
    if (window.location.hash === '#dev') {
        const devT = document.getElementById('dev-toolbar');
        if (devT) devT.style.display = 'flex';
    }
});

function loadState() {
    const savedTrip = localStorage.getItem('rb_tripData');
    if (savedTrip) currentState.tripData = JSON.parse(savedTrip);
    
    const savedItin = localStorage.getItem('rb_itinerary');
    if (savedItin) currentState.itinerary = JSON.parse(savedItin);

    const savedUser = localStorage.getItem('rb_user');
    if (savedUser) currentState.user = JSON.parse(savedUser);
}

function saveState() {
    localStorage.setItem('rb_tripData', JSON.stringify(currentState.tripData));
    localStorage.setItem('rb_itinerary', JSON.stringify(currentState.itinerary));
}

// --- Navigation & Core UI ---
function showScreen(screenId) {
    currentState.screen = screenId;
    const screens = document.querySelectorAll('.screen');
    
    screens.forEach(s => {
        s.classList.remove('active');
        s.style.display = 'none';
    });
    
    const target = document.getElementById(`${screenId}-screen`);
    if (target) {
        target.style.display = 'block';
        // Tiny timeout to allow display:block to register for transition
        setTimeout(() => {
            target.classList.add('active');
            if (screenId === 'landing' && window.rbGallery) {
                window.rbGallery.renderGallery();
            }
        }, 10);
    }
    
    if (screenId === 'dashboard') renderDashboard();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.toggle('active');
}

// --- Wizard Engine ---
const totalSteps = 9;

function startWizard() {
    currentState.wizardStep = 1;
    showScreen('wizard');
    renderWizardStep();
}

function renderWizardStep() {
    const container = document.getElementById('wizard-steps');
    const step = currentState.wizardStep;
    
    // UI Progress Sync
    const fill = document.getElementById('progress-fill');
    const counter = document.getElementById('step-counter');
    const percent = document.getElementById('percent-label');
    const nextBtn = document.getElementById('next-btn');

    const progress = (step / totalSteps) * 100;
    if (fill) fill.style.width = `${progress}%`;
    if (counter) counter.innerText = `Step ${step} of ${totalSteps}`;
    if (percent) percent.innerText = `${Math.round(progress)}%`;
    if (nextBtn) nextBtn.innerHTML = step === totalSteps ? 'Finalize Plan <i data-lucide="check"></i>' : 'Continue <i data-lucide="arrow-right"></i>';

    let html = '<div class="wizard-step-ui animate-in">';
    
    switch(step) {
        case 1:
            html += `<h2 class="wizard-step-title">Where are we going?</h2>
                    <div class="form-group" style="max-width: 500px; margin: 0 auto;">
                        <input type="text" id="dest-input" placeholder="e.g. Kyoto, Japan" style="text-align:center; height: 80px; font-size: 1.8rem;" value="${currentState.tripData.destination}" oninput="updateTripData('destination', this.value)">
                    </div>`;
            break;
        case 2:
            html += `<h2 class="wizard-step-title">Duration</h2>
                    <div class="counter-ui" style="display: flex; align-items: center; justify-content: center; gap: 40px; font-size: 3rem;">
                        <button class="btn btn-outline" style="width: 80px; height: 80px; border-radius: 50%; font-size: 2rem;" onclick="changeDays(-1)">-</button>
                        <span id="days-val" style="font-weight: 800; min-width: 100px; text-align:center;">${currentState.tripData.days} Days</span>
                        <button class="btn btn-outline" style="width: 80px; height: 80px; border-radius: 50%; font-size: 2rem;" onclick="changeDays(1)">+</button>
                    </div>`;
            break;
        case 3:
            html += `<h2 class="wizard-step-title">Trip Style</h2>
                    <div class="options-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                        ${renderOptions('type', ['Adventure', 'Relaxing', 'Cultural', 'Business'])}
                    </div>`;
            break;
        case 4:
            html += `<h2 class="wizard-step-title">Group Size</h2>
                    <div class="options-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                        ${renderOptions('travelers', ['Solo Traveler', 'Couple', 'Family', 'Large Group'])}
                    </div>`;
            break;
        case 9:
            html += `<h2 class="wizard-step-title">Departure Time</h2>
                    <p style="text-align:center; color: var(--text-muted); margin-bottom: 24px;">What time do you plan to start your journey?</p>
                    <div class="form-group" style="max-width: 300px; margin: 0 auto;">
                        <input type="time" id="time-input" style="text-align:center; height: 80px; font-size: 2rem;" value="${currentState.tripData.departureTime}" oninput="updateTripData('departureTime', this.value)">
                    </div>`;
            break;
        default:
            const keys = [null, null, null, null, 'budget', 'food', 'accommodation', 'transport'];
            const labels = {
                budget: 'What is your budget?',
                food: 'Food Preferences',
                accommodation: 'Preferred Stay',
                transport: 'Main Transport'
            };
            const options = {
                budget: ['Economy', 'Standard', 'Luxury'],
                food: ['Vegetarian', 'Non-Veg', 'Both'],
                accommodation: ['Hotel', 'Hostel', 'Resort', 'Airbnb'],
                transport: ['Car Rental', 'Train', 'Bus', 'Flight']
            };
            const currentKey = keys[step - 1];
            html += `<h2 class="wizard-step-title">${labels[currentKey]}</h2>
                    <div class="options-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                        ${renderOptions(currentKey, options[currentKey])}
                    </div>`;
            break;
    }
    
    html += '</div>';
    if (container) container.innerHTML = html;
    if (window.lucide) lucide.createIcons();
}

function renderOptions(key, options) {
    return options.map(opt => `
        <button class="btn btn-outline ${currentState.tripData[key] === opt ? 'active' : ''}" style="justify-content: center; height: 70px; border-width: 2px;" onclick="updateTripData('${key}', '${opt}'); nextStep()">
            ${opt}
        </button>
    `).join('');
}

function updateTripData(key, val) {
    currentState.tripData[key] = val;
}

function changeDays(delta) {
    currentState.tripData.days = Math.max(1, Math.min(30, currentState.tripData.days + delta));
    const label = document.getElementById('days-val');
    if (label) label.innerText = `${currentState.tripData.days} Days`;
}

function nextStep() {
    if (currentState.wizardStep === 1 && !currentState.tripData.destination) return alert("Please set a destination first.");
    if (currentState.wizardStep < totalSteps) {
        const container = document.getElementById('wizard-steps');
        if (container) {
            container.style.opacity = '0';
            setTimeout(() => {
                currentState.wizardStep++;
                renderWizardStep();
                container.style.opacity = '1';
            }, 300);
        } else {
            currentState.wizardStep++;
            renderWizardStep();
        }
    } else {
        generateItinerary();
    }
}

function prevStep() {
    if (currentState.wizardStep > 1) {
        const container = document.getElementById('wizard-steps');
        if (container) {
            container.style.opacity = '0';
            setTimeout(() => {
                currentState.wizardStep--;
                renderWizardStep();
                container.style.opacity = '1';
            }, 300);
        } else {
            currentState.wizardStep--;
            renderWizardStep();
        }
    }
}

// --- Itinerary Logic ---
async function generateItinerary() {
    if (!window.rbItinerary) return;
    
    const container = document.getElementById('wizard-steps');
    container.innerHTML = '<div class="flex-center" style="height: 300px; flex-direction: column; gap: 20px;">' +
                          '<div class="logo-icon animate-pulse" style="width: 80px; height: 80px;"><i data-lucide="loader" class="animate-spin"></i></div>' +
                          '<h2 class="wizard-step-title">Crafting Perfection...</h2></div>';
    if (window.lucide) lucide.createIcons();

    const plan = await window.rbItinerary.generateSmartItinerary(currentState.tripData);
    currentState.itinerary = plan;
    currentState.currentDayView = 1;
    
    saveState();
    showScreen('dashboard');
    showNotice("Trip Created & Saved Successfully! ✨");
}

function renderDashboard() {
    const data = currentState.tripData;
    const itin = currentState.itinerary;
    
    const title = document.getElementById('dash-dest-title');
    const meta = document.getElementById('dash-meta');
    if (title) title.innerText = data.destination || 'My Trip';
    if (meta) meta.innerText = `${data.days} Day ${data.type} Trip • ${data.travelers}`;
    
    // Day Tabs
    const tabContainer = document.getElementById('day-tabs');
    if (tabContainer) {
        tabContainer.innerHTML = Array.from({length: data.days}, (_, i) => i+1).map(d => `
            <button class="btn ${currentState.currentDayView === d ? 'btn-primary' : 'btn-outline'}" style="padding: 10px 20px;" onclick="setDayView(${d})">Day ${d}</button>
        `).join('');
    }

    // Itinerary Items
    const list = document.getElementById('itinerary-list');
    const filtered = itin.filter(i => i.day === currentState.currentDayView);
    
    if (list) {
        if (filtered.length === 0) {
            list.innerHTML = `<div class="flex-center" style="padding: 100px; text-align:center; color: var(--text-muted);">
                                <i data-lucide="calendar-off" size="48" style="margin-bottom: 20px;"></i>
                                <p>No activities planned for this day.</p>
                              </div>`;
        } else {
            list.innerHTML = filtered.map((item, idx) => `
                <div class="itinerary-item animate-in" style="animation-delay: ${idx * 0.1}s; display: flex; gap: 24px; padding: 32px; background: var(--white); border-radius: 20px; border: 1px solid var(--border); margin-bottom: 24px; position: relative;">
                    <div class="item-time" style="min-width: 80px; font-weight: 800; color: var(--primary); font-family: 'Outfit';">
                        ${item.time}
                    </div>
                    <div style="flex: 1;">
                        <h3 style="margin-bottom: 8px;">${item.activity}</h3>
                        <p style="color: var(--text-muted); font-size: 0.95rem; margin-bottom: 20px;">${item.location}</p>
                        <div style="display: flex; gap: 16px;">
                            <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.location + ' ' + data.destination)}" target="_blank" class="btn-link" style="color: var(--primary); text-decoration:none; font-weight: 700; font-size: 0.85rem; display: flex; align-items: center; gap: 8px;">
                                <i data-lucide="map-pin" size="16"></i> View Map
                            </a>
                        </div>
                    </div>
                    <button class="btn-check ${item.completed ? 'active' : ''}" onclick="toggleTask(${item.id})" style="width: 44px; height: 44px; border-radius: 12px; border: 2px solid var(--border); background: ${item.completed ? 'var(--primary)' : 'transparent'}; color: ${item.completed ? 'white' : 'transparent'}; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s ease;">
                        <i data-lucide="check"></i>
                    </button>
                </div>
            `).join('');
        }
    }

    // Intelligence Summary
    const summary = document.getElementById('summary-details');
    if (summary) {
        summary.innerHTML = `
            <li style="margin-bottom: 12px; display: flex; justify-content: space-between;"><span>Budget</span> <strong>${data.budget}</strong></li>
            <li style="margin-bottom: 12px; display: flex; justify-content: space-between;"><span>Lodging</span> <strong>${data.accommodation}</strong></li>
            <li style="margin-bottom: 12px; display: flex; justify-content: space-between;"><span>Food</span> <strong>${data.food}</strong></li>
            <li style="margin-bottom: 12px; display: flex; justify-content: space-between;"><span>Transport</span> <strong>${data.transport}</strong></li>
        `;
    }

    const nextText = document.getElementById('next-stop-text');
    const nextItem = itin.find(i => !i.completed);
    if (nextText) nextText.innerText = nextItem ? nextItem.activity : "Journey Complete! 🎯";
    
    if (window.lucide) lucide.createIcons();
}

function setDayView(day) {
    currentState.currentDayView = day;
    renderDashboard();
}

function toggleTask(id) {
    const item = currentState.itinerary.find(i => i.id === id);
    if (item) {
        item.completed = !item.completed;
        saveState();
        renderDashboard();
    }
}

// --- Auth Handling Redesign ---
let authMode = 'login';
function toggleAuthMode() {
    authMode = authMode === 'login' ? 'signup' : 'login';
    const title = document.getElementById('auth-title');
    const subtitle = document.getElementById('auth-subtitle');
    const submitBtn = document.getElementById('auth-submit-btn');
    const footerText = document.getElementById('auth-footer-text');
    const nameGroup = document.getElementById('name-group');

    if (authMode === 'login') {
        title.innerText = 'Welcome Back';
        subtitle.innerText = 'Please enter your details to login.';
        submitBtn.innerText = 'Login to Account';
        footerText.innerHTML = "New here? <strong>Create an account</strong>";
        if (nameGroup) nameGroup.style.display = 'none';
    } else {
        title.innerText = 'Create Account';
        subtitle.innerText = 'Join our premium travel community.';
        submitBtn.innerText = 'Register Now';
        footerText.innerHTML = "Already a member? <strong>Login</strong>";
        if (nameGroup) nameGroup.style.display = 'block';
    }
}

async function handleAuth(e) {
    e.preventDefault();
    const email = document.getElementById('auth-email').value;
    const name = document.getElementById('auth-name') ? document.getElementById('auth-name').value : '';
    
    currentState.user = { name: name || email.split('@')[0], email };
    localStorage.setItem('rb_user', JSON.stringify(currentState.user));
    
    updateAuthDisplay();
    toggleModal('auth-modal');
    showNotice(`Welcome, ${currentState.user.name}!`);
}

function updateAuthDisplay() {
    const section = document.getElementById('auth-section');
    if (section && currentState.user) {
        section.innerHTML = `<div style="display: flex; align-items: center; gap: 12px;">
                                <div style="width: 32px; height: 32px; background: var(--primary-light); color: var(--primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.8rem;">
                                    ${currentState.user.name.charAt(0).toUpperCase()}
                                </div>
                                <span style="font-weight: 600; font-size: 0.9rem;">${currentState.user.name}</span>
                             </div>`;
    }
}

// --- Misc Utils ---
function showNotice(msg) {
    const toast = document.createElement('div');
    toast.className = 'share-toast visible';
    toast.style.background = 'var(--primary)';
    toast.style.color = 'white';
    toast.innerText = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function handleDelay() {
    currentState.itinerary = currentState.itinerary.map(item => {
        if (item.day === currentState.currentDayView && !item.completed) {
            return { ...item, time: `+30m ${item.time}`, shifted: true };
        }
        return item;
    });
    saveState();
    renderDashboard();
    showNotice("Schedule adjusted successfully.");
}

// --- Global API ---
window.showScreen = showScreen;
window.toggleModal = toggleModal;
window.startWizard = startWizard;
window.prevStep = prevStep;
window.nextStep = nextStep;
window.changeDays = changeDays;
window.updateTripData = updateTripData;
window.toggleTask = toggleTask;
window.handleAuth = handleAuth;
window.toggleAuthMode = toggleAuthMode;
window.setDayView = setDayView;
window.handleDelay = handleDelay;
window.rbUI = {
    showNotice(msg) {
        showNotice(msg); // Bridge local showNotice for global modules
    },
    showHelp() {
        toggleModal('help-modal');
    },
    hideHelp() {
        toggleModal('help-modal');
    },
    saveTripPlan() {
        saveState();
        showNotice("Trip Plan Saved Successfully! 💾");
    },
    async showServiceModal(type) {
        const modal = document.getElementById('service-modal');
        const content = document.getElementById('service-modal-content');
        if (!modal || !content) return;

        const fallbackData = {
            places: [
                { name: 'Kyoto Temples', image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80', rating: 4.9, description: 'Ancient spiritual heart of Japan.' },
                { name: 'Swiss Alps', image: 'https://images.unsplash.com/photo-1531219432768-9f540ce91ef3?w=800&q=80', rating: 4.8, description: 'Breathtaking mountain vistas.' }
            ],
            restaurants: [
                { name: 'Gion Karyo', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80', rating: 4.7, description: 'Traditional Kaiseki excellence.' },
                { name: 'La Sponda', image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80', rating: 4.9, description: 'Michelin-starred Italian views.' }
            ],
            hotels: [
                { name: 'Ritz Paris', image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80', rating: 5.0, description: 'The pinnacle of luxury living.' },
                { name: 'Aman Tokyo', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80', rating: 4.9, description: 'Sleek modern sanctuary.' }
            ]
        };

        content.innerHTML = '<div class="flex-center" style="height: 200px;"><i data-lucide="loader" class="animate-spin"></i></div>';
        modal.classList.add('active');
        if (window.lucide) lucide.createIcons();

        try {
            const files = { places: 'places.json', restaurants: 'restaurants.json', hotels: 'hotels.json' };
            const res = await fetch(`data/${files[type]}`);
            if (!res.ok) throw new Error();
            const data = await res.json();
            renderModalContent(data);
        } catch (e) {
            console.warn(`Falling back to local data for ${type}`);
            renderModalContent(fallbackData[type]);
        }

        function renderModalContent(data) {
            content.innerHTML = `
                <div class="professional-service-view">
                    <h2 style="font-size: 2.5rem; margin-bottom: 32px;">${type.charAt(0).toUpperCase() + type.slice(1)} Highlights</h2>
                    <div class="service-details-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 24px;">
                        ${data.map(item => `
                            <div class="service-detail-card" style="display: flex; gap: 20px; background: var(--bg-muted); padding: 20px; border-radius: 20px;">
                                <img src="${item.image}" alt="${item.name}" style="width: 120px; height: 120px; border-radius: 12px; object-fit: cover;">
                                <div>
                                    <h4 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 8px;">${item.name}</h4>
                                    <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 12px; line-height: 1.3;">${item.description || item.cuisine || 'Premium selection.'}</p>
                                    <span class="rating" style="background: var(--bg); padding: 4px 12px;">⭐ ${item.rating}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
            if (window.lucide) lucide.createIcons();
        }
    }
};
