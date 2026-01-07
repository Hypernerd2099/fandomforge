/**
 * FandomForge NYC - Unified Production Logic
 * Version: 2.1 (Filtered Material Map & Supabase Integration)
 */


// 1. Initialize Supabase (Global Context)
const supabaseUrl = 'https://dxryqhybieztvhhzlypy.supabase.co';
const supabaseKey = 'sb_publishable_qcoOAFtpHHjm7r4xFHn4CQ_v3MKwkXG';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);


document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Global Selectors ---
    const searchBar = document.getElementById('searchBar');
    const calendarGrid = document.getElementById('calendarGrid');
    const eventDetails = document.getElementById('eventDetails');
    const submitBtn = document.getElementById('submitPostBtn');


    // --- 2. Comprehensive Shop Database ---
    const shopLocations = [
        { name: "Mood Fabrics", borough: "Manhattan", type: "Fabric", coords: [40.7541, -73.9898], rating: 4.8, hours: "9AM - 6PM", desc: "Iconic selection" },
        { name: "M&J Trimming", borough: "Manhattan", type: "Trims", coords: [40.7524, -73.9878], rating: 4.6, hours: "10AM - 6PM", desc: "Ribbons & Buttons" },
        { name: "Metro Textiles", borough: "Manhattan", type: "Fabric", coords: [40.7538, -73.9892], rating: 4.7, hours: "9AM - 5PM", desc: "Curated selection" },
        { name: "Sil Thread Inc", borough: "Manhattan", type: "Supplies", coords: [40.7531, -73.9895], rating: 4.9, hours: "9AM - 5PM", desc: "Specialty thread" },
        { name: "Brooklyn General", borough: "Brooklyn", type: "Fabric", coords: [40.6815, -73.9955], rating: 4.7, hours: "11AM - 7PM", desc: "Creative crafts" },
        { name: "FABSCRAP", borough: "Brooklyn", type: "Specialty", coords: [40.6450, -74.0130], rating: 4.9, hours: "By Appt", desc: "Textile reuse" },
        { name: "Fabric City", borough: "Queens", type: "Fabric", coords: [40.7480, -73.8620], rating: 4.3, hours: "10AM - 8PM", desc: "Corona staple" },
        { name: "Fabrics USA Inc", borough: "Bronx", type: "Fabric", coords: [40.8500, -73.8900], rating: 4.5, hours: "9AM - 7PM", desc: "Bronx hub" }
    ];


    // --- 3. Supabase Post Functionality ---
    const handleCreatePost = async () => {
        const titleInput = document.getElementById('newPostTitle');
        const contentInput = document.getElementById('newPostContent');


        if (!titleInput || !contentInput) return;


        const title = titleInput.value.trim();
        const content = contentInput.value.trim();


        if (!title || !content) {
            alert("Please provide both a title and build details.");
            return;
        }


        const { error } = await supabaseClient
            .from('posts')
            .insert([{ 
                title: title, 
                content: content, 
                user_handle: 'u/MandalorianNYC' 
            }]);


        if (error) {
            console.error('Supabase Error:', error);
            alert("Error posting to the Forge.");
        } else {
            alert("Build posted successfully!");
            titleInput.value = '';
            contentInput.value = '';
            location.reload(); 
        }
    };


    if (submitBtn) submitBtn.addEventListener('click', handleCreatePost);


    // --- 4. Material Map (Leaflet.js) ---
    const initForgeMap = () => {
        const container = document.getElementById('meetupMap');
        if (!container) return null;


        const map = L.map('meetupMap').setView([40.7306, -73.9352], 11);


        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; CartoDB'
        }).addTo(map);


        let markerLayer = L.layerGroup().addTo(map);


        // Filter Logic
        window.updateMapFilters = () => {
            const bVal = document.getElementById('boroughFilter')?.value || 'all';
            const tVal = document.getElementById('typeFilter')?.value || 'all';
            
            markerLayer.clearLayers();


            shopLocations.forEach(shop => {
                const bMatch = bVal === 'all' || shop.borough === bVal;
                const tMatch = tVal === 'all' || (shop.type === tVal || (tVal === 'Supplies' && shop.type === 'Trims'));


                if (bMatch && tMatch) {
                    const stars = "★".repeat(Math.floor(shop.rating));
                    const popup = `
                        <div style="color:black; font-family: sans-serif; line-height: 1.4;">
                            <b style="font-size: 1rem;">${shop.name}</b><br>
                            <span style="color:#f39c12;">${stars} ${shop.rating}</span><br>
                            <small style="color:#666;">🕒 ${shop.hours}</small>
                            <p style="margin:5px 0 0; font-size:0.85rem;">${shop.desc}</p>
                        </div>`;
                    L.marker(shop.coords).addTo(markerLayer).bindPopup(popup);
                }
            });
        };


        window.updateMapFilters();
        return map;
    };


    // --- 5. Interactive Event Calendar ---
    const initCalendar = () => {
        if (!calendarGrid) return;
        
        const events = { 
            12: "Sci-Fi Photo Shoot", 
            24: "Anime Winter Meet",
            28: "Armor Painting Class"
        };


        calendarGrid.innerHTML = ''; 


        for (let i = 1; i <= 31; i++) {
            const day = document.createElement('div');
            day.className = `calendar-day ${events[i] ? 'has-event' : ''}`;
            day.innerText = i;
            
            day.onclick = () => {
                eventDetails.innerHTML = events[i] 
                    ? `<div class="animate-fade-in"><b>Jan ${i}: ${events[i]}</b></div>` 
                    : `<div class="animate-fade-in"><small>No events scheduled</small></div>`;
            };
            calendarGrid.appendChild(day);
        }
    };


    // --- 6. Search Functionality ---
    if (searchBar) {
        searchBar.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const posts = document.querySelectorAll('#mainFeed .post');
            
            posts.forEach(post => {
                const text = post.innerText.toLowerCase();
                post.style.display = text.includes(term) ? 'flex' : 'none';
            });
        });
    }


    // --- 7. Launch Sequence ---
    setTimeout(() => {
        const mapInstance = initForgeMap();
        initCalendar();
        
        if (mapInstance) {
            setTimeout(() => mapInstance.invalidateSize(), 200);
        }
    }, 500);
});