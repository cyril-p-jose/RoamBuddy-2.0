// pnr.js — PNR Train Status Checker
(function() {
    let pnrData = null;

    async function loadPNRData() {
        if (pnrData) return pnrData;
        try {
            const res = await fetch('data/pnr.json');
            pnrData = await res.json();
        } catch(e) {
            pnrData = [];
        }
        return pnrData;
    }

    async function checkPNR() {
        const input = document.getElementById('pnr-input');
        const resultBox = document.getElementById('pnr-result');
        if (!input || !resultBox) return;

        const pnr = input.value.trim();
        if (!pnr) {
            resultBox.innerHTML = '<p class="pnr-error">Please enter a PNR number.</p>';
            return;
        }

        resultBox.innerHTML = '<p class="text-muted">Checking status...</p>';

        const data = await loadPNRData();
        const record = data.find(r => r.pnr === pnr);

        if (!record) {
            resultBox.innerHTML = `
                <div class="pnr-not-found">
                    <span>🚫</span>
                    <p>No record found for PNR <strong>${pnr}</strong>.</p>
                    <p class="text-muted">Try: 4251896370, 6384720154, 8192734051, 3047816523, 7654321098</p>
                </div>`;
            return;
        }

        resultBox.innerHTML = `
            <div class="pnr-card">
                <div class="pnr-header">
                    <div>
                        <h4>${record.trainName}</h4>
                        <p class="text-muted">Train No: ${record.trainNo}</p>
                    </div>
                    <span class="pnr-badge">PNR: ${record.pnr}</span>
                </div>
                <div class="pnr-journey">
                    <div class="pnr-station">
                        <strong>${record.departure}</strong>
                        <span>${record.from}</span>
                    </div>
                    <div class="pnr-arrow">→</div>
                    <div class="pnr-station">
                        <strong>${record.arrival}</strong>
                        <span>${record.to}</span>
                    </div>
                </div>
                <p class="pnr-date">📅 ${new Date(record.date).toLocaleDateString('en-IN', {weekday:'long', day:'2-digit', month:'long', year:'numeric'})}</p>
                <div class="pnr-passengers">
                    <h5>Passenger Details</h5>
                    ${record.passengers.map(p => `
                        <div class="pnr-passenger-row">
                            <div>
                                <strong>${p.name}</strong>
                                <span class="text-muted"> · Age ${p.age}</span>
                            </div>
                            <div class="pnr-seat-info">
                                <span class="pnr-coach">Coach ${p.coach} · Seat ${p.seat}${p.berth && p.berth !== '—' ? ` (${p.berth})` : ''}</span>
                                <span class="pnr-status ${getStatusClass(p.status)}">${p.status}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>`;
    }

    function getStatusClass(status) {
        if (status === 'CNF') return 'status-confirmed';
        if (status.startsWith('RAC')) return 'status-rac';
        if (status.startsWith('WL')) return 'status-waiting';
        return '';
    }

    function openPNRModal() {
        const modal = document.getElementById('pnr-modal');
        if (modal) {
            modal.classList.add('active');
            document.getElementById('pnr-input').value = '';
            document.getElementById('pnr-result').innerHTML = '';
        }
    }

    function closePNRModal() {
        const modal = document.getElementById('pnr-modal');
        if (modal) modal.classList.remove('active');
    }

    window.rbPNR = { checkPNR, openPNRModal, closePNRModal };
})();
