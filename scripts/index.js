document.addEventListener("DOMContentLoaded", function () {

    /* ================================
    1. Reveal On Scroll + Single-Trigger Map
    ================================ */
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add the standard reveal class
                entry.target.classList.add('active');

                // Handle the Map Animation Trigger
                if (entry.target.id === 'location') {
                    const mapAnim = document.getElementById('mapAnimationTrigger');
                    if (mapAnim) {
                        mapAnim.beginElement();
                    }
                    
                    // IMPORTANT: This line makes it happen ONLY ONCE
                    observer.unobserve(entry.target);
                }
            }
        });
    }, { threshold: 0.2 });

    // Observe your elements
    document.querySelectorAll('.reveal, #location').forEach((el) => {
        observer.observe(el);
    });

    /* ================================
    2. Unified Avatar Logic
    ================================ */
    const box3d = document.getElementById('box-3d');
    const shadow = document.getElementById("ground-shadow");
    const pupils = document.querySelectorAll('.pupil');
    const lids = document.querySelectorAll('.lid');
    const mouthPath = document.getElementById('mouth-path');
    const eyeRow = document.getElementById('eye-row');
    const inquiryBtn = document.getElementById('inquiry-btn');

    // State Variables
    let currentEmotion = "neutral";
    const friction = 0.08; 
    const lookRange = 600; 

    // Animation variables
    let targetX = 0, targetY = 0;
    let curX = 0, curY = 0;
    let mouseX = 0, mouseY = 0;
    let time = 0; // NEW: Tracks time for the breathing cycle

    /* --- Emotion System --- */
    function setEmotion(type) {
        if (currentEmotion === type) return;
        currentEmotion = type;

        if (type === "happy") {
            mouthPath.setAttribute("d", "M15 20 Q50 45 85 20");
            eyeRow.style.transform = "scaleY(1)";
        } else {
            mouthPath.setAttribute("d", "M30 25 Q50 45 70 25 Q50 5 30 25");
            eyeRow.style.transform = "scaleY(1.2)";
        }
    }

    /* --- Input Tracking --- */
    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        const rect = box3d.getBoundingClientRect();
        const avatarCenterX = rect.left + rect.width / 2;
        const avatarCenterY = rect.top + rect.height / 2;

        const deltaX = mouseX - avatarCenterX;
        const deltaY = mouseY - avatarCenterY;

        targetX = Math.max(-1, Math.min(1, deltaX / lookRange));
        targetY = Math.max(-1, Math.min(1, deltaY / lookRange));

        const btnRect = inquiryBtn.getBoundingClientRect();
        const btnCenterX = btnRect.left + btnRect.width / 2;
        const btnCenterY = btnRect.top + btnRect.height / 2;

        const dist = Math.sqrt(
            Math.pow(mouseX - btnCenterX, 2) +
            Math.pow(mouseY - btnCenterY, 2)
        );

        if (dist < 400) {
            setEmotion("happy");
        } else {
            setEmotion("default");
        }
    });

    /* --- Main Animation Loop --- */
    function animate() {
        // 1. Increment Time (Change 0.03 to 0.05 for faster breathing)
        time += 0.01;

        // 2. Calculate the "Breath" pulse using Sine
        // This oscillates between ~0.98 and ~1.02
        const breath = 1 + Math.sin(time) * 0.02;

        // Smoothing for mouse movement
        curX += (targetX - curX) * friction;
        curY += (targetY - curY) * friction;

        // 3. Apply Rotation + Breathing Scale
        box3d.style.transform = `
            rotateY(${curX * 22}deg)
            rotateX(${-curY * 22}deg)
            scale(${breath})
        `;

        // 4. Update Pupils
        pupils.forEach(pupil => {
            pupil.style.transform = `translate(${curX * 14}px, ${curY * 14}px)`;
        });

        // 5. Update Shadow (Sync with breath)
        // The shadow gets slightly larger/fainter as the box "inhales"
        shadow.style.transform = `
            translateX(${-curX * 40}px)
            scale(${breath * (1 + Math.abs(curY) * 0.2)})
        `;
        shadow.style.opacity = 0.3 + (Math.sin(time) * 0.05);

        requestAnimationFrame(animate);
    }

    animate();

    /* --- Random Blinking --- */
    function blink() {
        lids.forEach(lid => lid.style.transform = 'translateY(0%)');
        setTimeout(() => {
            lids.forEach(lid => lid.style.transform = 'translateY(-100%)');
        }, 120);
        setTimeout(blink, Math.random() * 4000 + 2500);
    }

    blink();

    const productParent = document.getElementById('product-flex-container');

    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', () => {
            const isAlreadyActive = card.classList.contains('active');

            // Reset all cards to equal width and hide all details
            document.querySelectorAll('.product-card').forEach(c => {
                c.classList.remove('active');
                c.style.transform = "scale(1)";
                c.style.flex = "1";
                c.style.height = "10vh";
                productParent.classList.remove("w-full");
                productParent.classList.add("w-1/2");
            });
            
            // If the clicked card wasn't active, expand it
            if (!isAlreadyActive) {
                card.classList.add('active');
                card.style.flex = "3";
                card.style.transfrom = "scale(2)"; // Expand ratio
                card.style.height = "100%";
                productParent.classList.remove("w-1/2");
                productParent.classList.add("w-full");
                
                // Set other siblings to shrink
                document.querySelectorAll('.product-card:not(.active)').forEach(c => {
                    c.style.transform = "scale(0.5)";
                });
            }
        });
    });




    const input = document.querySelector("#phone");
    window.intlTelInput(input, {
    initialCountry: "auto",
    geoIpLookup: callback => {
        fetch("https://ipapi.co/json")
        .then(res => res.json())
        .then(data => callback(data.country_code))
        .catch(() => callback("us"));
    },
    utilsScript: "https://cdn.jsdelivr.net/npm/intl-tel-input@24.5.0/build/js/utils.js",
    });



    // Tailwind config
tailwind.config = {
    theme: {
        extend: {
            animation: {
                'carousel-scroll': 'carousel-scroll 30s linear infinite',
            },
            keyframes: {
                'carousel-scroll': {
                    from: { transform: 'translateX(0)' },
                    to:   { transform: 'translateX(-50%)' }, // -50% because we duplicate the list
                }
            }
        }
    }
}

const showcaseItems = [
    { image: "./resources/structuralArchieve/one.jpeg", category: "RIGID SYSTEM",  title: "Luxury Electronics Packaging" },
    { image: "./resources/structuralArchieve/two.jpeg", category: "MONOCARTON",    title: "Retail Precision Cartons" },
    { image: "./resources/structuralArchieve/three.jpeg", category: "PAPERBOARD",    title: "Premium Retail Bags" },
    { image: "./resources/structuralArchieve/six.jpeg", category: "COLLAPSIBLE",   title: "Space Efficient Rigid Box" },
    { image: "./resources/structuralArchieve/five.jpeg", category: "COLLAPSIBLE",   title: "Space Efficient Rigid Box" },
    { image: "./resources/structuralArchieve/seven.jpeg", category: "COLLAPSIBLE",   title: "Space Efficient Rigid Box" },
];

window.addEventListener("load", () => {
    const track = document.getElementById("carousel-track");
    if (!track) return;

    function buildCards() {
        return showcaseItems.map(item => {
            const li = document.createElement("li");
            li.className = "flex-shrink-0 w-[520px] border border-white/10 flex flex-col group cursor-pointer";
            li.innerHTML = `
                <img src="${item.image}" class="h-[420px] object-cover w-full transition-transform duration-700 group-hover:scale-[1.03]" />
                <div class="p-8 border-t border-white/10 bg-[#0b0f14]">
                    <p class="text-[10px] font-black uppercase tracking-[0.5em] text-orange-500 mb-4">${item.category}</p>
                    <h3 class="text-2xl font-black uppercase">${item.title}</h3>
                </div>
            `;
            return li;
        });
    }

    // Build original set
    buildCards().forEach(card => track.appendChild(card));

    // Duplicate for seamless loop — same trick as the logo scroller
    buildCards().forEach(card => {
        card.setAttribute("aria-hidden", "true");
        track.appendChild(card);
    });

    // Pause on hover
    track.addEventListener("mouseenter", () => track.style.animationPlayState = "paused");
    track.addEventListener("mouseleave", () => track.style.animationPlayState = "running");
});



// Call after DOM is loaded
window.addEventListener('load', initInfiniteCarousel);
});




const cube = document.querySelector('#cursor-cube');
let mouseX = 0, mouseY = 0;
let cubeX = 0, cubeY = 0;

window.addEventListener('mousemove', (e) => {
    // Use pageX/pageY so scroll position is respected
    mouseX = e.pageX;
    mouseY = e.pageY;

    cube.style.opacity = "1";
});

function animate() {
    cubeX += (mouseX - cubeX) * 0.1;
    cubeY += (mouseY - cubeY) * 0.1;

    // Subtract half cube size (10px) so it centers on cursor
    cube.style.transform = `translate3d(${cubeX - 10}px, ${cubeY - 10}px, 0)`;

    requestAnimationFrame(animate);
}

animate();