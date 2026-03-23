// devtoolbar.js — Developer Demo Toolbar (visible only with #dev in URL)
(function() {
    function init() {
        if (!location.hash.includes('#dev')) return;
        const toolbar = document.getElementById('dev-toolbar');
        if (toolbar) toolbar.style.display = 'flex';
    }

    function loadSampleTrip() {
        const sample = {
            destination: 'Munnar, Kerala',
            days: 3,
            type: 'Local',
            travelers: 'Couple',
            budget: 'Standard',
            food: 'Both',
            accommodation: 'Resort',
            transport: 'Car',
            departureTime: '08:00'
        };
        localStorage.setItem('rb_tripData', JSON.stringify(sample));
        if (window.currentState) {
            window.currentState.tripData = sample;
        }
        showDevNotice('✅ Sample trip loaded! Click "Plan Trip" to see it.');
    }

    function simulateDelay() {
        if (window.handleDelay) window.handleDelay();
        showDevNotice('⏱️ Delay simulated (+30min) on current day.');
    }

    function clearStorage() {
        if (confirm('Clear all RoamBuddy localStorage data?')) {
            ['rb_tripData','rb_itinerary','rb_completion','rb_delay_undo','rb_votes','rb_theme'].forEach(k => localStorage.removeItem(k));
            showDevNotice('🗑️ localStorage cleared.');
        }
    }

    function resetDemo() {
        clearStorage();
        if (window.currentState) {
            window.currentState.tripData = {
                destination: '', days: 3, type: 'Local', travelers: 'Solo',
                budget: 'Medium', food: 'Both', accommodation: 'Hotel',
                transport: 'Car', departureTime: '08:00'
            };
            window.currentState.itinerary = [];
            window.currentState.currentDayView = 1;
        }
        if (window.showScreen) window.showScreen('landing');
        showDevNotice('🔄 Demo reset complete.');
    }

    function showDevNotice(msg) {
        let notice = document.getElementById('dev-notice');
        if (!notice) {
            notice = document.createElement('div');
            notice.id = 'dev-notice';
            notice.className = 'dev-notice';
            document.body.appendChild(notice);
        }
        notice.textContent = msg;
        notice.classList.add('visible');
        setTimeout(() => notice.classList.remove('visible'), 3000);
    }

    window.addEventListener('hashchange', init);
    document.addEventListener('DOMContentLoaded', init);

    window.rbDev = { loadSampleTrip, simulateDelay, clearStorage, resetDemo };
})();
