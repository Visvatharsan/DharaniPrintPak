/* ================================
1. Reveal On Scroll
================================ */
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

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