/**
 * 睿来智能体官网 - 公共脚本
 * Reliable Agent Official Website - Common Scripts
 */

// ========== 工具函数 ==========
const Utils = {
  /**
   * 防抖函数
   * @param {Function} fn - 需要防抖的函数
   * @param {Number} delay - 延迟时间（毫秒）
   */
  debounce(fn, delay = 300) {
    let timer = null;
    return function(...args) {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        fn.apply(this, args);
      }, delay);
    };
  },

  /**
   * 节流函数
   * @param {Function} fn - 需要节流的函数
   * @param {Number} delay - 延迟时间（毫秒）
   */
  throttle(fn, delay = 300) {
    let lastTime = 0;
    return function(...args) {
      const now = Date.now();
      if (now - lastTime >= delay) {
        fn.apply(this, args);
        lastTime = now;
      }
    };
  },

  /**
   * 格式化数字（添加千分位分隔符）
   * @param {Number} num - 数字
   */
  formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  },

  /**
   * 平滑滚动到指定元素
   * @param {String} selector - 元素选择器
   * @param {Number} offset - 偏移量
   */
  scrollToElement(selector, offset = 80) {
    const element = document.querySelector(selector);
    if (element) {
      const top = element.offsetTop - offset;
      window.scrollTo({
        top: top,
        behavior: 'smooth'
      });
    }
  }
};

// ========== 滚动监听 ==========
class ScrollObserver {
  constructor() {
    this.init();
  }

  init() {
    // 监听页面滚动 - 添加header滚动效果
    this.handleHeaderScroll();

    // 监听元素进入视口 - 添加动画效果
    this.observeElements();

    // 监听滚动事件 - 更新导航激活状态
    this.updateActiveNav();
  }

  handleHeaderScroll() {
    const header = document.querySelector('.header');
    if (!header) return;

    window.addEventListener('scroll', Utils.throttle(() => {
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }, 100));
  }

  observeElements() {
    const elements = document.querySelectorAll('.scroll-animate');
    if (elements.length === 0) return;

    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          // 添加延迟，实现错峰动画效果
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, index * 100);
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    elements.forEach(element => {
      observer.observe(element);
    });
  }

  updateActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.header-nav a[href^="#"]');

    if (sections.length === 0 || navLinks.length === 0) return;

    window.addEventListener('scroll', Utils.throttle(() => {
      let current = '';
      sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (window.scrollY >= sectionTop - 100) {
          current = section.getAttribute('id');
        }
      });

      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
          link.classList.add('active');
        }
      });
    }, 100));
  }
}

// ========== Toast 通知 ==========
class Toast {
  /**
   * 显示Toast通知
   * @param {String} message - 消息内容
   * @param {String} type - 类型：success, error, warning
   * @param {Number} duration - 显示时长（毫秒）
   */
  static show(message, type = 'success', duration = 3000) {
    // 移除已存在的toast
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
      existingToast.remove();
    }

    // 创建toast元素
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    // 图标SVG
    const icons = {
      success: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M16.667 5L7.5 14.167 3.333 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      error: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M15 5L5 15M5 5l10 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      warning: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 6v4m0 4h.01M10 18a8 8 0 100-16 8 8 0 000 16z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    };

    toast.innerHTML = `
      <span style="color: var(--color-${type})">${icons[type]}</span>
      <span>${message}</span>
    `;

    document.body.appendChild(toast);

    // 自动移除
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translate(-50%, -20px)';
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, duration);
  }
}

// ========== 表单验证 ==========
class FormValidator {
  constructor(formElement) {
    this.form = formElement;
    this.init();
  }

  init() {
    if (!this.form) return;

    // 表单提交验证
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (this.validate()) {
        this.handleSubmit();
      }
    });

    // 实时验证（失焦时）
    const inputs = this.form.querySelectorAll('input, textarea');
    inputs.forEach(input => {
      input.addEventListener('blur', () => {
        this.validateField(input);
      });
    });
  }

  validateField(field) {
    const inputGroup = field.closest('.input-group');
    const errorElement = inputGroup.querySelector('.input-error');

    // 移除已存在的错误提示
    if (errorElement) {
      errorElement.remove();
    }
    inputGroup.classList.remove('error');

    // 验证规则
    const rules = {
      required: field.hasAttribute('required') && !field.value.trim(),
      email: field.type === 'email' && field.value && !this.isValidEmail(field.value),
      phone: field.type === 'tel' && field.value && !this.isValidPhone(field.value)
    };

    // 错误消息
    const messages = {
      required: '此字段为必填项',
      email: '请输入有效的邮箱地址',
      phone: '请输入有效的手机号码'
    };

    // 检查验证
    for (const [rule, failed] of Object.entries(rules)) {
      if (failed) {
        this.showError(inputGroup, messages[rule]);
        return false;
      }
    }

    return true;
  }

  validate() {
    const inputs = this.form.querySelectorAll('input, textarea');
    let isValid = true;

    inputs.forEach(input => {
      if (!this.validateField(input)) {
        isValid = false;
      }
    });

    return isValid;
  }

  showError(inputGroup, message) {
    inputGroup.classList.add('error');
    const errorElement = document.createElement('div');
    errorElement.className = 'input-error';
    errorElement.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
      </svg>
      <span>${message}</span>
    `;
    inputGroup.appendChild(errorElement);
  }

  isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  isValidPhone(phone) {
    const re = /^1[3-9]\d{9}$/;
    return re.test(phone.replace(/\s+/g, ''));
  }

  handleSubmit() {
    const formData = new FormData(this.form);
    const data = Object.fromEntries(formData);

    // 显示加载状态
    const submitButton = this.form.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.innerHTML = `
      <div class="spinner" style="width: 20px; height: 20px; border-width: 2px;"></div>
      <span>提交中...</span>
    `;

    // 模拟提交（实际项目中应该调用API）
    setTimeout(() => {
      console.log('表单数据：', data);

      // 恢复按钮状态
      submitButton.disabled = false;
      submitButton.textContent = originalText;

      // 显示成功提示
      Toast.show('提交成功！我们会尽快与您联系。', 'success');

      // 重置表单
      this.form.reset();
    }, 2000);
  }
}

// ========== 数字滚动动画 ==========
class CountUp {
  constructor(element, target, duration = 2000) {
    this.element = element;
    this.target = target;
    this.duration = duration;
    this.startTime = null;
    this.startValue = 0;
  }

  start() {
    const animate = (currentTime) => {
      if (!this.startTime) this.startTime = currentTime;
      const progress = Math.min((currentTime - this.startTime) / this.duration, 1);

      const currentValue = Math.floor(progress * (this.target - this.startValue) + this.startValue);
      this.element.textContent = Utils.formatNumber(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.element.textContent = Utils.formatNumber(this.target);
      }
    };

    requestAnimationFrame(animate);
  }

  static observe(selector) {
    const elements = document.querySelectorAll(selector);
    if (elements.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = parseInt(entry.target.getAttribute('data-target'));
          const counter = new CountUp(entry.target, target);
          counter.start();
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    elements.forEach(element => observer.observe(element));
  }
}

// ========== 图片懒加载 ==========
class LazyLoad {
  static init() {
    const images = document.querySelectorAll('img[data-src]');
    if (images.length === 0) return;

    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.getAttribute('data-src');
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
        }
      });
    });

    images.forEach(img => imageObserver.observe(img));
  }
}

// ========== 页面初始化 ==========
document.addEventListener('DOMContentLoaded', () => {
  // 初始化滚动观察器
  new ScrollObserver();

  // 初始化图片懒加载
  LazyLoad.init();

  // 初始化数字滚动动画
  CountUp.observe('.count-up');

  // 平滑滚动锚点链接
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#') return;

      e.preventDefault();
      Utils.scrollToElement(href);
    });
  });

  // 返回顶部按钮
  const backToTop = document.getElementById('back-to-top');
  if (backToTop) {
    window.addEventListener('scroll', Utils.throttle(() => {
      if (window.scrollY > 500) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    }, 100));

    backToTop.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
});

// 导出到全局
window.Utils = Utils;
window.Toast = Toast;
window.FormValidator = FormValidator;
window.CountUp = CountUp;
