// 首页脚本
$(document).ready(function () {
    initPage();
});

function initPage() {
    // 平滑滚动
    initSmoothScroll();
    
    // 导航栏滚动效果
    initNavScroll();
    
    // 卡片显示动画
    initCardAnimation();
    
    // 时钟标签循环切换
    initClockLabel();
}

// 平滑滚动
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#' || href === '') return;
            
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// 导航栏滚动效果
function initNavScroll() {
    const nav = document.querySelector('nav');
    let lastScroll = 0;
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
            nav.style.background = 'rgba(255, 248, 231, 0.98)';
            nav.style.boxShadow = '0 4px 20px rgba(74, 55, 40, 0.15)';
        } else {
            nav.style.background = 'rgba(255, 248, 231, 0.95)';
            nav.style.boxShadow = '0 4px 16px rgba(74, 55, 40, 0.2)';
        }
        
        lastScroll = currentScroll;
    });
}

// 卡片显示动画
function initCardAnimation() {
    const cards = document.querySelectorAll('.book-card, .feature-card, .timeline-item');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 100);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
}

// 时钟标签循环切换
function initClockLabel() {
    const labels = ['西汉', '北魏', '南宋', '元朝', '明朝'];
    const labelElement = document.getElementById('clockLabel');
    const hourElement = document.getElementById('clockHour');
    let index = 0;
    
    setInterval(() => {
        if (labelElement && hourElement) {
            index = (index + 1) % labels.length;
            
            // 添加过渡效果
            labelElement.style.opacity = '0';
            hourElement.style.opacity = '0';
            
            setTimeout(() => {
                labelElement.textContent = labels[index];
                hourElement.textContent = labels[index];
                labelElement.style.opacity = '1';
                hourElement.style.opacity = '1';
            }, 300);
        }
    }, 3000);
}
