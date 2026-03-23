// share.js — URL-based trip sharing and group planning preview
(function() {
    const STORAGE_KEY = 'rb_votes';

    function encodeTrip(tripData, itinerary) {
        try {
            const payload = JSON.stringify({ tripData, itinerary });
            return btoa(unescape(encodeURIComponent(payload)));
        } catch(e) { return null; }
    }

    function decodeTrip(encoded) {
        try {
            const json = decodeURIComponent(escape(atob(encoded)));
            return JSON.parse(json);
        } catch(e) { return null; }
    }

    function generateShareURL() {
        if (!window.currentState || !window.currentState.tripData) {
            alert('Please generate a trip first!');
            return;
        }
        const encoded = encodeTrip(window.currentState.tripData, window.currentState.itinerary);
        if (!encoded) { alert('Could not encode trip data.'); return; }
        const url = `${location.origin}${location.pathname}?trip=${encoded}`;
        navigator.clipboard.writeText(url).then(() => {
            showShareToast('🔗 Share link copied to clipboard!');
        }).catch(() => {
            prompt('Copy this link:', url);
        });
    }

    function showShareToast(msg) {
        if (window.rbUI && window.rbUI.showNotice) {
            window.rbUI.showNotice(msg);
        } else {
            alert(msg);
        }
    }

    function checkSharedLink() {
        const params = new URLSearchParams(location.search);
        const tripEncoded = params.get('trip');
        if (!tripEncoded) return false;

        const decoded = decodeTrip(tripEncoded);
        if (!decoded) return false;

        // Restore into currentState
        if (window.currentState) {
            window.currentState.tripData = decoded.tripData;
            window.currentState.itinerary = decoded.itinerary;
            window.currentState.currentDayView = 1;
        }

        // Show group preview banner
        setTimeout(() => showGroupPreview(decoded.tripData), 500);
        return true;
    }

    const FAKE_PARTICIPANTS = [
        { name: 'Riya S.', avatar: '👩', color: '#f472b6' },
        { name: 'Aman V.', avatar: '👨', color: '#60a5fa' },
        { name: 'Priya N.', avatar: '🧑', color: '#34d399' }
    ];

    function showGroupPreview(tripData) {
        const votes = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        const existing = document.getElementById('group-preview-banner');
        if (existing) existing.remove();

        const banner = document.createElement('div');
        banner.id = 'group-preview-banner';
        banner.className = 'group-preview-banner';
        banner.innerHTML = `
            <div class="group-preview-inner">
                <div class="group-preview-header">
                    <span class="group-badge">👥 Group Trip</span>
                    <h3>${tripData.destination} — Shared Itinerary</h3>
                    <p class="text-muted">Friends planning together · ${FAKE_PARTICIPANTS.length} participants</p>
                </div>
                <div class="participant-list">
                    ${FAKE_PARTICIPANTS.map(p => `
                        <div class="participant-chip" style="border-color:${p.color}">
                            <span>${p.avatar}</span>
                            <span>${p.name}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="vote-section">
                    <p class="vote-label">Vote on activities:</p>
                    <div class="vote-options">
                        ${['Morning Trek', 'Beach Day', 'City Tour', 'Food Walk'].map(act => `
                            <button class="vote-btn ${votes[act] ? 'voted' : ''}" data-activity="${act}" onclick="rbShare.vote('${act}', this)">
                                ${act} <span class="vote-count">${votes[act] || 0}</span>👍
                            </button>
                        `).join('')}
                    </div>
                </div>
                <button class="group-close-btn" onclick="document.getElementById('group-preview-banner').remove()">✕ Close</button>
            </div>
        `;
        document.body.prepend(banner);
    }

    function vote(activity, btn) {
        const votes = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        if (votes[activity]) {
            votes[activity] = 0;
            btn.classList.remove('voted');
        } else {
            votes[activity] = (votes[activity] || 0) + 1;
            btn.classList.add('voted');
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(votes));
        btn.querySelector('.vote-count').textContent = votes[activity] || 0;
    }

    window.rbShare = { generateShareURL, checkSharedLink, vote };
})();
