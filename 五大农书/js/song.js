$(document).ready(function() {
    initGallery();
    initAnimations();
});

function initGallery() {
    const images = ['image/song/0.png', 'image/song/1.png', 'image/song/2.png', 'image/song/3.png'];
    const texts = [
        '南宋江南农业的发展：宋室南渡后，江南地区成为全国经济中心。随着人口激增和耕地紧张，提高单位面积产量成为迫切需求，推动了水田耕作技术的创新。',
        '陈旉的隐居与耕作：陈旉是南宋著名的农业专家，隐居扬州，毕生躬耕陇亩。他注重实践，反对空谈农事，积累了丰富的水稻种植经验。',
        '《陈旉农书》的创作：陈旉在75岁高龄时，将毕生所学系统整理，写成《陈旉农书》。该书是中国第一部系统论述南方水田农业的专著。',
        '《陈旉农书》的影响：该书虽仅万余字，但内容精炼实用，成为后世江南农业发展的理论基石，对明清时期的农业技术发展产生了深远影响。'
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