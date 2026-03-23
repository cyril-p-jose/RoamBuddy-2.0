// itinerary.js — Mock Itinerary Generator using local JSON data
(function() {
    let placesData = null;
    let restaurantsData = null;
    let hotelsData = null;

    async function loadAllData() {
        if (placesData && restaurantsData && hotelsData) return;
        try {
            const [pRes, rRes, hRes] = await Promise.all([
                fetch('data/places.json'),
                fetch('data/restaurants.json'),
                fetch('data/hotels.json')
            ]);
            placesData = await pRes.json();
            restaurantsData = await rRes.json();
            hotelsData = await hRes.json();
        } catch (e) {
            console.error("Failed to load itinerary data:", e);
            // Fallbacks to empty arrays to prevent crash
            placesData = placesData || [];
            restaurantsData = restaurantsData || [];
            hotelsData = hotelsData || [];
        }
    }

    async function generateSmartItinerary(tripData) {
        await loadAllData();
        
        const { destination, days, budget, transport, food, departureTime } = tripData;
        const normalizedDest = destination.split(',')[0].trim().toLowerCase();
        
        // Filter data for this destination
        const destPlaces = placesData.filter(p => p.name.toLowerCase().includes(normalizedDest) || p.state.toLowerCase().includes(normalizedDest));
        const destRestaurants = restaurantsData.filter(r => r.destination.toLowerCase().includes(normalizedDest));
        const destHotel = hotelsData.find(h => h.destination.toLowerCase().includes(normalizedDest)) || hotelsData[0];

        let itinerary = [];
        let idCounter = 1;

        for (let d = 1; d <= days; d++) {
            // Morning Slot
            if (d === 1) {
                itinerary.push({
                    id: idCounter++,
                    day: d,
                    time: departureTime || "08:00",
                    activity: `Travel to ${destination} via ${transport}`,
                    location: "Point of Origin",
                    duration: "3-4h",
                    completed: false
                });
                itinerary.push({
                    id: idCounter++,
                    day: d,
                    time: "12:30 PM",
                    activity: "Hotel Check-in",
                    location: destHotel ? destHotel.name : "Local Hotel",
                    duration: "1h",
                    completed: false
                });
            } else {
                itinerary.push({
                    id: idCounter++,
                    day: d,
                    time: "08:30 AM",
                    activity: "Breakfast",
                    location: destHotel ? `${destHotel.name} Cafe` : "Local Cafe",
                    duration: "1h",
                    completed: false
                });
                
                const morningPlace = destPlaces[(d * 2) % destPlaces.length] || destPlaces[0];
                itinerary.push({
                    id: idCounter++,
                    day: d,
                    time: "10:00 AM",
                    activity: morningPlace ? morningPlace.activities[0] : "Sightseeing",
                    location: morningPlace ? morningPlace.name : "Local Attraction",
                    duration: "3h",
                    completed: false
                });
            }

            // Lunch
            const lunchSpot = destRestaurants[d % destRestaurants.length] || destRestaurants[0];
            itinerary.push({
                id: idCounter++,
                day: d,
                time: "01:30 PM",
                activity: "Lunch",
                location: lunchSpot ? lunchSpot.name : "Local Restaurant",
                duration: "1.5h",
                completed: false
            });

            // Afternoon Slot
            const afternoonPlace = destPlaces[(d * 3) % destPlaces.length] || destPlaces[1 % destPlaces.length];
            itinerary.push({
                id: idCounter++,
                day: d,
                time: "03:30 PM",
                activity: afternoonPlace ? afternoonPlace.activities[1] || afternoonPlace.activities[0] : "Exploration",
                location: afternoonPlace ? afternoonPlace.name : "City Center",
                duration: "3h",
                completed: false
            });

            // Evening/Dinner
            itinerary.push({
                id: idCounter++,
                day: d,
                time: "07:30 PM",
                activity: d === days ? "Departure Prep" : "Dinner & Evening Walk",
                location: "Local Area",
                duration: "2h",
                completed: false
            });
        }

        return itinerary;
    }

    window.rbItinerary = { generateSmartItinerary };
})();
