/**
 * 睿来智能体官网 - 组件交互脚本
 * Reliable Agent Official Website - Component Scripts
 */

// ========== 移动端菜单 ==========
class MobileMenu {
  constructor() {
    this.menuToggle = document.querySelector('.menu-toggle');
    this.headerNav = document.querySelector('.header-nav');
    this.navLinks = document.querySelectorAll('.header-nav a');
    this.init();
  }

  init() {
    if (!this.menuToggle || !this.headerNav) return;

    // 切换菜单
    this.menuToggle.addEventListener('click', () => {
      this.toggle();
    });

    // 点击链接后关闭菜单
    this.navLinks.forEach(link => {
      link.addEventListener('click', () => {
        this.close();
      });
    });

    // 点击外部区域关闭菜单
    document.addEventListener('click', (e) => {
      if (this.headerNav.classList.contains('active') &&
          !this.headerNav.contains(e.target) &&
          !this.menuToggle.contains(e.target)) {
        this.close();
      }
    });
  }

  toggle() {
    this.menuToggle.classList.toggle('active');
    this.headerNav.classList.toggle('active');
    document.body.style.overflow = this.headerNav.classList.contains('active') ? 'hidden' : '';
  }

  close() {
    this.menuToggle.classList.remove('active');
    this.headerNav.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// ========== 模态框 ==========
class Modal {
  constructor(modalId) {
    this.modal = document.getElementById(modalId);
    this.closeBtn = this.modal?.querySelector('.modal-close');
    this.init();
  }

  init() {
    if (!this.modal) return;

    // 关闭按钮
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => {
        this.close();
      });
    }

    // 点击背景关闭
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.close();
      }
    });

    // ESC键关闭
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal.classList.contains('active')) {
        this.close();
      }
    });
  }

  open() {
    this.modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  close() {
    this.modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  static show(modalId) {
    const modal = new Modal(modalId);
    modal.open();
  }
}

// ========== Tab 切换 ==========
class TabControl {
  constructor(containerSelector) {
    this.container = document.querySelector(containerSelector);
    this.tabs = this.container?.querySelectorAll('.tab-item');
    this.contents = this.container?.querySelectorAll('.tab-content');
    this.init();
  }

  init() {
    if (!this.container || !this.tabs || !this.contents) return;

    this.tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => {
        this.switchTab(index);
      });
    });
  }

  switchTab(index) {
    // 移除所有激活状态
    this.tabs.forEach(tab => tab.classList.remove('active'));
    this.contents.forEach(content => {
      content.classList.remove('active');
      content.style.display = 'none';
    });

    // 添加当前激活状态
    this.tabs[index].classList.add('active');
    this.contents[index].classList.add('active');
    this.contents[index].style.display = 'block';

    // 添加淡入动画
    this.contents[index].style.animation = 'fadeIn 400ms ease-out';
  }
}

// ========== 手风琴 ==========
class Accordion {
  constructor(containerSelector) {
    this.container = document.querySelector(containerSelector);
    this.items = this.container?.querySelectorAll('.accordion-item');
    this.init();
  }

  init() {
    if (!this.container || !this.items) return;

    this.items.forEach(item => {
      const header = item.querySelector('.accordion-header');
      const content = item.querySelector('.accordion-content');

      if (!header || !content) return;

      header.addEventListener('click', () => {
        const isActive = item.classList.contains('active');

        // 关闭所有项
        this.items.forEach(i => {
          i.classList.remove('active');
          const c = i.querySelector('.accordion-content');
          if (c) c.style.maxHeight = '0';
        });

        // 切换当前项
        if (!isActive) {
          item.classList.add('active');
          content.style.maxHeight = content.scrollHeight + 'px';
        }
      });
    });
  }
}

// ========== 轮播图 ==========
class Carousel {
  constructor(containerSelector, options = {}) {
    this.container = document.querySelector(containerSelector);
    this.track = this.container?.querySelector('.carousel-track');
    this.slides = this.container?.querySelectorAll('.carousel-slide');
    this.prevBtn = this.container?.querySelector('.carousel-prev');
    this.nextBtn = this.container?.querySelector('.carousel-next');
    this.indicators = this.container?.querySelector('.carousel-indicators');

    this.currentIndex = 0;
    this.autoplay = options.autoplay ?? true;
    this.interval = options.interval ?? 5000;
    this.timer = null;

    this.init();
  }

  init() {
    if (!this.container || !this.track || !this.slides) return;

    // 创建指示器
    if (this.indicators) {
      this.createIndicators();
    }

    // 上一张
    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', () => {
        this.prev();
      });
    }

    // 下一张
    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => {
        this.next();
      });
    }

    // 自动播放
    if (this.autoplay) {
      this.startAutoplay();

      // 鼠标悬停时暂停
      this.container.addEventListener('mouseenter', () => {
        this.stopAutoplay();
      });

      this.container.addEventListener('mouseleave', () => {
        this.startAutoplay();
      });
    }

    // 触摸滑动
    this.initSwipe();
  }

  createIndicators() {
    this.indicators.innerHTML = '';
    this.slides.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.className = 'indicator-dot';
      if (index === 0) dot.classList.add('active');
      dot.addEventListener('click', () => {
        this.goTo(index);
      });
      this.indicators.appendChild(dot);
    });
  }

  goTo(index) {
    this.currentIndex = index;
    const offset = -index * 100;
    this.track.style.transform = `translateX(${offset}%)`;

    // 更新指示器
    const dots = this.indicators?.querySelectorAll('.indicator-dot');
    if (dots) {
      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
      });
    }
  }

  next() {
    this.currentIndex = (this.currentIndex + 1) % this.slides.length;
    this.goTo(this.currentIndex);
  }

  prev() {
    this.currentIndex = (this.currentIndex - 1 + this.slides.length) % this.slides.length;
    this.goTo(this.currentIndex);
  }

  startAutoplay() {
    this.timer = setInterval(() => {
      this.next();
    }, this.interval);
  }

  stopAutoplay() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  initSwipe() {
    let startX = 0;
    let isDragging = false;

    this.container.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      isDragging = true;
    });

    this.container.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
    });

    this.container.addEventListener('touchend', (e) => {
      if (!isDragging) return;
      isDragging = false;

      const endX = e.changedTouches[0].clientX;
      const diff = startX - endX;

      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          this.next();
        } else {
          this.prev();
        }
      }
    });
  }
}

// ========== 视频播放器控制 ==========
class VideoPlayer {
  constructor(videoSelector) {
    this.video = document.querySelector(videoSelector);
    this.playBtn = document.querySelector(`${videoSelector}-play`);
    this.init();
  }

  init() {
    if (!this.video) return;

    // 自动静音播放
    this.video.muted = true;

    // 播放/暂停控制
    if (this.playBtn) {
      this.playBtn.addEventListener('click', () => {
        this.toggle();
      });
    }

    // 点击视频切换播放状态
    this.video.addEventListener('click', () => {
      this.toggle();
    });

    // 视频结束时重新播放
    this.video.addEventListener('ended', () => {
      this.video.currentTime = 0;
      this.video.play();
    });
  }

  play() {
    this.video.play();
    if (this.playBtn) {
      this.playBtn.classList.add('playing');
    }
  }

  pause() {
    this.video.pause();
    if (this.playBtn) {
      this.playBtn.classList.remove('playing');
    }
  }

  toggle() {
    if (this.video.paused) {
      this.play();
    } else {
      this.pause();
    }
  }
}

// ========== 下拉菜单 ==========
class Dropdown {
  constructor(containerSelector) {
    this.container = document.querySelector(containerSelector);
    this.trigger = this.container?.querySelector('.dropdown-trigger');
    this.menu = this.container?.querySelector('.dropdown-menu');
    this.init();
  }

  init() {
    if (!this.container || !this.trigger || !this.menu) return;

    // 点击触发器
    this.trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggle();
    });

    // 点击外部区域关闭
    document.addEventListener('click', () => {
      this.close();
    });

    // 阻止菜单内部点击事件冒泡
    this.menu.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }

  toggle() {
    this.container.classList.toggle('active');
  }

  close() {
    this.container.classList.remove('active');
  }
}

// ========== 返回顶部按钮 ==========
class BackToTop {
  constructor() {
    this.button = this.createButton();
    this.init();
  }

  createButton() {
    const button = document.createElement('button');
    button.id = 'back-to-top';
    button.className = 'back-to-top';
    button.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 19V5M5 12l7-7 7 7"/>
      </svg>
    `;
    button.style.cssText = `
      position: fixed;
      bottom: 32px;
      right: 32px;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: var(--gradient-purple);
      color: white;
      box-shadow: var(--shadow-lg);
      opacity: 0;
      visibility: hidden;
      transition: all 300ms ease;
      z-index: 999;
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    document.body.appendChild(button);
    return button;
  }

  init() {
    window.addEventListener('scroll', Utils.throttle(() => {
      if (window.scrollY > 500) {
        this.show();
      } else {
        this.hide();
      }
    }, 100));

    this.button.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  show() {
    this.button.style.opacity = '1';
    this.button.style.visibility = 'visible';
  }

  hide() {
    this.button.style.opacity = '0';
    this.button.style.visibility = 'hidden';
  }
}

// ========== 页面初始化 ==========
document.addEventListener('DOMContentLoaded', () => {
  // 初始化移动端菜单
  new MobileMenu();

  // 初始化返回顶部按钮
  new BackToTop();

  // 初始化所有Tab组件
  document.querySelectorAll('.tab-container').forEach(container => {
    new TabControl(`#${container.id}`);
  });

  // 初始化所有手风琴组件
  document.querySelectorAll('.accordion').forEach(accordion => {
    new Accordion(`#${accordion.id}`);
  });

  // 初始化所有轮播图
  document.querySelectorAll('.carousel').forEach(carousel => {
    new Carousel(`#${carousel.id}`);
  });
});

// 导出到全局
window.Modal = Modal;
window.TabControl = TabControl;
window.Accordion = Accordion;
window.Carousel = Carousel;
window.VideoPlayer = VideoPlayer;
window.Dropdown = Dropdown;
