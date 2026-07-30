$(document).ready(function() {
    initGallery();
    initAnimations();
});

function initGallery() {
    const images = ['image/xihan/0.png', 'image/xihan/1.png', 'image/xihan/2.png', 'image/xihan/3.png'];
    const texts = [
        '元朝统一与农业发展：元朝统一全国后，重视农业生产，设立司农司管理农业事务。南北农业技术的交流与融合成为这一时期的重要特点。',
        '王祯的农学研究：王祯是元代著名的农学家，曾任旌德县尹、永丰县尹，在任期间关注农业生产，积累了丰富的实践经验。',
        '《王桢农书》的编写：王祯结合南北农业技术，系统总结了农具创新、作物栽培、蚕桑养殖等方面的知识，撰写成《王桢农书》。',
        '《王桢农书》的学术价值：该书附有大量农具图谱，图文并茂，被誉为"中国古代农业科技百科"，对研究元代农业发展具有重要价值。'
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