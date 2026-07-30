// 氾胜之书页面脚本
$(document).ready(function() {
    initGallery();
    initAnimations();
});

// 图片轮播
function initGallery() {
    const images = ['image/xihan/0.png', 'image/xihan/1.png', 'image/xihan/2.png', 'image/xihan/3.png'];
    const texts = [
        '春秋战国至汉初的农业发展：春秋战国时期，铁器和牛耕的推广推动了农业生产力，汉武帝时期，耦犁发明并推广，铁犁牛耕在黄河流域普及。',
        '关中地区的农业核心地位：商鞅变法后，秦国推行耕战政策，郑国渠的修建增强了经济实力。汉朝建都关中，兴建水利工程，推广先进农具和技术。',
        '黄河流域的农业挑战：黄河流域自战国后进入大规模开发阶段，干旱成为主要威胁。关中地区降水少且不均，需充分利用天然降水。',
        '西汉中期的社会问题与《氾胜之书》的成书：西汉中期后，人口增加，土地兼并加剧，流民问题严重。《氾胜之书》正是对这一时期农业科技经验的总结。'
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
    
    // 创建指示器
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

// 卡片动画
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
