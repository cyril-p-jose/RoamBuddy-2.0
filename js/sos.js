// sos.js — SOS Emergency Modal
(function() {
    const SOS_LOCATION = 'New Delhi, India';
    const MAPS_LINK = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(SOS_LOCATION)}`;

    function buildEmailBody(msg) {
        return encodeURIComponent(
            `EMERGENCY HELP NEEDED\n\n${msg}\n\nLocation: ${SOS_LOCATION}\nMaps: ${MAPS_LINK}\n\nPlease help as soon as possible.`
        );
    }

    function getEmergencyMessage() {
        const dest = window.currentState?.tripData?.destination || SOS_LOCATION;
        return `I am a traveller currently at ${dest}. I need immediate assistance. Please contact me urgently.`;
    }

    function openSOS() {
        const msg = getEmergencyMessage();
        const modal = document.getElementById('sos-modal');
        if (!modal) return;
        
        const textElement = document.getElementById('sos-message-text');
        const mapsLink = document.getElementById('sos-maps-link');
        const emailLink = document.getElementById('sos-email-link');

        if (textElement) textElement.value = msg;
        if (mapsLink) mapsLink.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(window.currentState?.tripData?.destination || SOS_LOCATION)}`;
        if (emailLink) emailLink.href = `mailto:support@roambuddy.com?subject=EMERGENCY HELP NEEDED&body=${buildEmailBody(msg)}`;
        
        modal.classList.add('active');
    }

    function closeSOS() {
        const modal = document.getElementById('sos-modal');
        if (modal) modal.classList.remove('active');
    }

    function copySOSMessage() {
        const text = document.getElementById('sos-message-text').value;
        navigator.clipboard.writeText(text).then(() => {
            const btn = document.getElementById('sos-copy-btn');
            btn.textContent = '✓ Copied!';
            setTimeout(() => btn.textContent = '📋 Copy Message', 2000);
        });
    }

    window.rbSOS = { openSOS, closeSOS, copySOSMessage };
})();
