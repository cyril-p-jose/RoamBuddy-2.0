// gallery.js — Premium Media Gallery with Fallback handling
(function() {
    let placesData = null;

    const FALLBACK_PLACES = [
        { name: 'Kyoto Temples', image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80', category: 'Culture' },
        { name: 'Swiss Alps', image: 'https://images.unsplash.com/photo-1531219432768-9f540ce91ef3?w=800&q=80', category: 'Adventure' },
        { name: 'Santorini Sunset', image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&q=80', category: 'Relaxing' },
        { name: 'Bali Beaches', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80', category: 'Nature' },
        { name: 'Paris Streets', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80', category: 'City' },
        { name: 'Iceland Lights', image: 'https://images.unsplash.com/photo-1529963183134-61a90db47eaf?w=800&q=80', category: 'Adventure' }
    ];

    async function loadPlaces() {
        if (placesData) return placesData;
        try {
            const res = await fetch('data/places.json');
            if (!res.ok) throw new Error();
            placesData = await res.json();
        } catch(e) { 
            console.warn("Using fallback gallery data due to file protocol/CORS limitations.");
            placesData = FALLBACK_PLACES; 
        }
        return placesData;
    }

    async function renderGallery() {
        const container = document.getElementById('gallery-grid');
        if (!container) return;

        const places = await loadPlaces();
        
        container.innerHTML = places.map((p, idx) => `
            <div class="service-card animate-in" style="animation-delay: ${idx * 0.1}s">
                <div class="img-wrapper" style="height: 350px; overflow: hidden; position: relative; background: var(--bg-muted);">
                    <img
                        data-src="${p.image}"
                        alt="${p.name}"
                        class="card-img lazy-img"
                        loading="lazy"
                        onerror="this.src='https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80'"
                        src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f1f5f9'/%3E%3C/svg%3E"
                        style="width: 100%; height: 100%; object-fit: cover; transition: opacity 0.5s ease; opacity: 0;"
                    />
                </div>
                <div class="card-content" style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(to top, rgba(0,0,0,0.8), transparent); color: white; padding: 32px; pointer-events: none; z-index: 2;">
                    <span class="card-tag" style="color: rgba(255,255,255,0.8); font-size: 0.75rem; font-weight: 800; text-transform: uppercase;">${p.category || 'Destinations'}</span>
                    <h3 style="color: white; margin: 0; font-size: 1.5rem;">${p.name}</h3>
                </div>
            </div>
        `).join('');

        initLazyLoad();
    }

    function initLazyLoad() {
        const obsOptions = { rootMargin: '100px', threshold: 0.1 };
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    const src = img.getAttribute('data-src');
                    if (src) {
                        img.src = src;
                        if (img.complete) {
                            img.style.opacity = '1';
                        } else {
                            img.onload = () => img.style.opacity = '1';
                        }
                        observer.unobserve(img);
                    }
                }
            });
        }, obsOptions);

        document.querySelectorAll('.lazy-img').forEach(img => {
            observer.observe(img);
        });
    }

    window.rbGallery = { renderGallery };
})();
