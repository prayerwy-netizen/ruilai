/**
 * 睿来智能体官网 - 首页脚本
 * Reliable Agent - Index Page Scripts
 */

document.addEventListener('DOMContentLoaded', () => {
  // Hero区视频/图片懒加载优化
  initHeroBackground();

  // AI识别框动画
  initDetectionBoxes();

  // 数据统计动画已在common.js中处理

  // 产品卡片交互增强
  enhanceProductCards();

  // 核心能力卡片翻转
  initCapabilityCardFlip();

  // Hero区轮播图
  initHeroCarousel();

  // 视频弹窗
  initVideoModal();
});

/**
 * 初始化Hero背景
 */
function initHeroBackground() {
  const heroSection = document.querySelector('.hero');
  if (!heroSection) return;

  // 为移动端降级为静态图片
  if (window.innerWidth < 768) {
    const video = heroSection.querySelector('video');
    if (video) {
      const poster = video.getAttribute('poster');
      if (poster) {
        const img = document.createElement('img');
        img.src = poster;
        img.alt = '矿山智能化场景';
        img.className = 'hero-bg-image';
        video.parentNode.replaceChild(img, video);
      }
    }
  }
}

/**
 * 初始化AI识别框动画
 */
function initDetectionBoxes() {
  const boxes = document.querySelectorAll('.detection-box');
  if (boxes.length === 0) return;

  // 随机位置（可选增强）
  boxes.forEach((box, index) => {
    // 可以添加更多交互效果
    box.style.animationDelay = `${index}s`;
  });
}

/**
 * 增强产品卡片交互
 */
function enhanceProductCards() {
  const productCards = document.querySelectorAll('.product-card');

  productCards.forEach(card => {
    // 鼠标移动视差效果
    card.addEventListener('mousemove', (e) => {
      if (window.innerWidth < 768) return; // 移动端禁用

      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = (y - centerY) / 20;
      const rotateY = (centerX - x) / 20;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

/**
 * 初始化核心能力卡片翻转效果
 */
function initCapabilityCardFlip() {
  const capabilityCards = document.querySelectorAll('.capability-card');

  capabilityCards.forEach(card => {
    card.addEventListener('click', () => {
      // 切换翻转状态
      card.classList.toggle('flipped');
    });

    // 可选：添加键盘支持
    card.setAttribute('tabindex', '0');
    card.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.classList.toggle('flipped');
      }
    });
  });
}

/**
 * 初始化Hero区轮播图
 */
function initHeroCarousel() {
  const slides = document.querySelectorAll('.carousel-slide');
  const indicators = document.querySelectorAll('.indicator');

  if (slides.length === 0) return;

  let currentSlide = 0;
  let autoplayInterval;

  // 切换到指定幻灯片
  function goToSlide(index) {
    // 移除所有active状态
    slides.forEach(slide => slide.classList.remove('active'));
    indicators.forEach(indicator => {
      indicator.classList.remove('active');
      indicator.setAttribute('aria-selected', 'false');
    });

    // 添加新的active状态
    slides[index].classList.add('active');
    indicators[index].classList.add('active');
    indicators[index].setAttribute('aria-selected', 'true');

    currentSlide = index;
  }

  // 下一张
  function nextSlide() {
    const next = (currentSlide + 1) % slides.length;
    goToSlide(next);
  }

  // 上一张
  function prevSlide() {
    const prev = (currentSlide - 1 + slides.length) % slides.length;
    goToSlide(prev);
  }

  // 启动自动播放
  function startAutoplay() {
    autoplayInterval = setInterval(nextSlide, 5000); // 每5秒切换
  }

  // 停止自动播放
  function stopAutoplay() {
    clearInterval(autoplayInterval);
  }

  // 指示器点击事件
  indicators.forEach((indicator, index) => {
    indicator.addEventListener('click', () => {
      goToSlide(index);
      stopAutoplay();
      startAutoplay(); // 重新启动自动播放
    });
  });

  // 鼠标悬停时暂停自动播放
  const heroCarousel = document.querySelector('.hero-carousel');
  if (heroCarousel) {
    heroCarousel.addEventListener('mouseenter', stopAutoplay);
    heroCarousel.addEventListener('mouseleave', startAutoplay);
  }

  // 键盘控制
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      prevSlide();
      stopAutoplay();
      startAutoplay();
    } else if (e.key === 'ArrowRight') {
      nextSlide();
      stopAutoplay();
      startAutoplay();
    }
  });

  // 启动自动播放
  startAutoplay();
}

/**
 * 初始化视频弹窗（包含焦点管理和焦点陷阱）
 */
function initVideoModal() {
  const videoModal = document.getElementById('videoModal');
  const videoIframe = document.getElementById('videoIframe');
  const videoPlayBtn = document.querySelector('.video-play-btn');
  const closeBtn = document.querySelector('.video-modal-close');
  const overlay = document.querySelector('.video-modal-overlay');

  if (!videoModal || !videoIframe || !videoPlayBtn) return;

  let lastFocusedElement;  // 保存触发元素
  let focusableElements;   // 可聚焦元素列表

  // 打开视频弹窗
  function openVideoModal() {
    const videoUrl = videoPlayBtn.getAttribute('data-video-url');
    const autoplayUrl = videoUrl + (videoUrl.includes('?') ? '&' : '?') + 'autoplay=1';

    // 1. 保存当前焦点元素
    lastFocusedElement = document.activeElement;

    // 显示弹窗和loading状态
    videoModal.classList.add('active');
    videoModal.classList.remove('loaded');  // 显示loading
    videoModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // 设置iframe
    videoIframe.src = autoplayUrl;

    // iframe加载完成后隐藏loading
    videoIframe.onload = () => {
      setTimeout(() => {
        videoModal.classList.add('loaded');
      }, 500);
    };

    // 2. 获取弹窗内所有可聚焦元素
    setTimeout(() => {
      focusableElements = videoModal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      // 3. 将焦点设置到关闭按钮
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      }
    }, 100);
  }

  // 关闭视频弹窗
  function closeVideoModal() {
    videoModal.classList.remove('active');
    videoModal.setAttribute('aria-hidden', 'true');

    // 延迟清空iframe，等待动画结束
    setTimeout(() => {
      videoIframe.src = '';
    }, 400);

    // 恢复页面滚动
    document.body.style.overflow = '';

    // 4. 恢复焦点到触发按钮
    if (lastFocusedElement) {
      lastFocusedElement.focus();
    }
  }

  // 5. 焦点陷阱处理
  videoModal.addEventListener('keydown', (e) => {
    if (!videoModal.classList.contains('active')) return;

    if (e.key === 'Escape') {
      closeVideoModal();
      return;
    }

    if (e.key === 'Tab' && focusableElements && focusableElements.length > 0) {
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {  // Shift+Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {  // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    }
  });

  // 播放按钮点击事件
  videoPlayBtn.addEventListener('click', openVideoModal);

  // 关闭按钮点击事件
  if (closeBtn) {
    closeBtn.addEventListener('click', closeVideoModal);
  }

  // 点击遮罩层关闭
  if (overlay) {
    overlay.addEventListener('click', closeVideoModal);
  }
}
