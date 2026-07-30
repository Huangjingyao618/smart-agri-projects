$(document).ready(function() {
    initGallery();
    initAnimations();
});

function initGallery() {
    const images = ['image/xihan/0.png', 'image/xihan/1.png', 'image/xihan/2.png', 'image/xihan/3.png'];
    const texts = [
        '明代农业的发展背景：明朝建立后，统治者重视农业生产，推行了一系列恢复和发展农业的政策。徐光启生活的时代，农业技术已相当成熟。',
        '徐光启的农学研究：徐光启是明代著名的科学家、政治家，他关注农业生产，广泛收集历代农学著作和民间经验，进行了大量的研究和整理工作。',
        '《农政全书》的编纂：徐光启历时数十年，系统总结了前代农学成果，结合自己的研究心得，编纂成《农政全书》。该书是中国古代农学最完备的总结性著作。',
        '《农政全书》的历史意义：该书涵盖农业政策、水利规划、荒政措施、作物栽培、畜牧兽医等诸多方面，是研究中国古代农业的重要文献，对后世农学发展影响深远。'
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