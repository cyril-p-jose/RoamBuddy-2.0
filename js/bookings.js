// bookings.js — Bookings Panel
(function() {
    let bookingsData = null;

    async function loadBookings() {
        if (bookingsData) return bookingsData;
        try {
            const res = await fetch('data/bookings.json');
            bookingsData = await res.json();
        } catch(e) {
            bookingsData = { flights: [], trains: [], hotels: [] };
        }
        return bookingsData;
    }

    async function openBookings() {
        const modal = document.getElementById('bookings-modal');
        const content = document.getElementById('bookings-content');
        if (!modal || !content) return;

        content.innerHTML = '<p class="text-muted" style="text-align:center;padding:2rem">Loading bookings...</p>';
        modal.classList.add('active');

        const data = await loadBookings();
        renderBookings(data, content);
    }

    function renderBookings(data, container) {
        let html = '<div class="bookings-tabs">';
        html += '<button class="bookings-tab active" onclick="rbBookings.showTab(\'flights\', this)">✈️ Flights</button>';
        html += '<button class="bookings-tab" onclick="rbBookings.showTab(\'trains\', this)">🚆 Trains</button>';
        html += '<button class="bookings-tab" onclick="rbBookings.showTab(\'hotels\', this)">🏨 Hotels</button>';
        html += '</div>';

        // FLIGHTS
        html += '<div id="bookings-tab-flights" class="bookings-tab-pane">';
        if (data.flights.length === 0) {
            html += '<p class="text-muted">No flight bookings found.</p>';
        } else {
            html += data.flights.map(f => `
                <div class="booking-card">
                    <div class="booking-card-header">
                        <span class="booking-icon">✈️</span>
                        <div>
                            <strong>${f.airline}</strong>
                            <span class="booking-status status-${f.status.toLowerCase()}">${f.status}</span>
                        </div>
                        <span class="booking-pnr">PNR: ${f.pnr}</span>
                    </div>
                    <div class="booking-route">
                        <div class="booking-point">
                            <span class="booking-time">${f.departure}</span>
                            <span class="booking-place">${f.from}</span>
                        </div>
                        <div class="booking-duration">${f.duration}<br><span class="booking-line">————</span></div>
                        <div class="booking-point">
                            <span class="booking-time">${f.arrival}</span>
                            <span class="booking-place">${f.to}</span>
                        </div>
                    </div>
                    <div class="booking-meta">
                        <span>📅 ${f.date}</span>
                        <span>💺 ${f.class} · Seat ${f.seat}</span>
                    </div>
                </div>
            `).join('');
        }
        html += '</div>';

        // TRAINS
        html += '<div id="bookings-tab-trains" class="bookings-tab-pane" style="display:none">';
        html += data.trains.map(t => `
            <div class="booking-card">
                <div class="booking-card-header">
                    <span class="booking-icon">🚆</span>
                    <div>
                        <strong>${t.trainName}</strong> <span class="text-muted">#${t.trainNo}</span>
                        <span class="booking-status ${t.status === 'Confirmed' ? 'status-confirmed' : 'status-rac'}">${t.status}</span>
                    </div>
                    <span class="booking-pnr">PNR: ${t.pnr}</span>
                </div>
                <div class="booking-route">
                    <div class="booking-point">
                        <span class="booking-time">${t.departure}</span>
                        <span class="booking-place">${t.from}</span>
                    </div>
                    <div class="booking-duration">${t.duration}<br><span class="booking-line">————</span></div>
                    <div class="booking-point">
                        <span class="booking-time">${t.arrival}</span>
                        <span class="booking-place">${t.to}</span>
                    </div>
                </div>
                <div class="booking-meta">
                    <span>📅 ${t.date}</span>
                    <span>💺 ${t.class} · Coach ${t.coach} · Seat ${t.seat}</span>
                </div>
            </div>
        `).join('');
        html += '</div>';

        // HOTELS
        html += '<div id="bookings-tab-hotels" class="bookings-tab-pane" style="display:none">';
        html += data.hotels.map(h => `
            <div class="booking-card">
                <div class="booking-card-header">
                    <span class="booking-icon">🏨</span>
                    <div>
                        <strong>${h.name}</strong>
                        <span class="booking-status status-confirmed">${h.status}</span>
                    </div>
                    <span class="booking-pnr">#${h.bookingId}</span>
                </div>
                <div class="booking-meta">
                    <span>📍 ${h.destination}</span>
                    <span>🛏️ ${h.roomType}</span>
                </div>
                <div class="booking-meta" style="margin-top:0.5rem">
                    <span>📅 Check-in: ${h.checkIn}</span>
                    <span>📅 Check-out: ${h.checkOut} (${h.nights} nights)</span>
                </div>
                <div class="booking-total">Total: ${h.totalAmount}</div>
            </div>
        `).join('');
        html += '</div>';

        container.innerHTML = html;
    }

    function showTab(tabName, btn) {
        document.querySelectorAll('.bookings-tab-pane').forEach(p => p.style.display = 'none');
        document.querySelectorAll('.bookings-tab').forEach(t => t.classList.remove('active'));
        const pane = document.getElementById(`bookings-tab-${tabName}`);
        if (pane) pane.style.display = 'block';
        if (btn) btn.classList.add('active');
    }

    function closeBookings() {
        const modal = document.getElementById('bookings-modal');
        if (modal) modal.classList.remove('active');
    }

    window.rbBookings = { openBookings, closeBookings, showTab };
})();
