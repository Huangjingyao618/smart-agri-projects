$(document).ready(function() {
    initGallery();
    initAnimations();
});

function initGallery() {
    const images = ['image/beiwei/0.png', 'image/beiwei/1.png', 'image/beiwei/2.png', 'image/beiwei/3.png'];
    const texts = [
        '北魏时期的农业背景：北魏统一北方后，农业生产逐步恢复。由于长期战乱，土地荒芜，粮食产量不足，亟需一套科学的农业技术体系来指导生产。',
        '贾思勰的农业实践：贾思勰曾任高阳太守，在任期内关注农业生产，注重实践。他广泛收集民间经验，亲自耕种试验，积累了丰富的农业知识。',
        '《齐民要术》的成书过程：贾思勰结合历代农学著作和自己的实践经验，系统总结了北方农业生产的各项技术，撰写成《齐民要术》一书。',
        '《齐民要术》的历史地位：该书被誉为"中国古代农业百科全书"，内容涵盖耕作、栽培、养殖、加工等诸多方面，对后世农学发展影响深远。'
    ];

    const img = document.getElementById('galleryImg');
    const text = document.getElementById('galleryText');
    const overlay = document.getElementById('galleryOverlay');
    const controls = document.getElementById('galleryControls');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    if (!img || !controls) return;

    let currentIndex = 0;
    let timer = null;

    images.forEach((_, i) => {
        const btn = document.createElement('button');
        btn.className = 'gallery-btn' + (i === 0 ? ' active' : '');
        btn.addEventListener('click', () => {
            currentIndex = i;
            update();
            restartAutoPlay();
        });
        controls.appendChild(btn);
    });

    function update() {
        img.style.opacity = '0';
        setTimeout(() => {
            img.src = images[currentIndex];
            text.textContent = texts[currentIndex];
            img.style.opacity = '1';

            const buttons = controls.querySelectorAll('.gallery-btn');
            buttons.forEach((btn, i) => {
                btn.classList.toggle('active', i === currentIndex);
            });
        }, 300);
    }

    function next() {
        currentIndex = (currentIndex + 1) % images.length;
        update();
    }

    function prev() {
        currentIndex = (currentIndex - 1 + images.length) % images.length;
        update();
    }

    function startAutoPlay() {
        timer = setInterval(next, 3500);
    }

    function stopAutoPlay() {
        if (timer) clearInterval(timer);
    }

    function restartAutoPlay() {
        stopAutoPlay();
        startAutoPlay();
    }

    prevBtn.addEventListener('click', () => { prev(); restartAutoPlay(); });
    nextBtn.addEventListener('click', () => { next(); restartAutoPlay(); });

    overlay.addEventListener('mouseenter', stopAutoPlay);
    overlay.addEventListener('mouseleave', startAutoPlay);

    startAutoPlay();
}

function initAnimations() {
    const cards = document.querySelectorAll('.tech-card, .book-stat-item, .nav-card');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        observer.observe(card);
    });
}