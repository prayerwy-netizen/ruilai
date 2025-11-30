# 睿来智能体官网 (Reliable Agent Official Website)

## 项目简介

睿来智能体官方网站 - 矿山AI智能体解决方案提供商的品牌展示与获客转化平台。基于HTML5 + CSS3 + JavaScript构建的静态多页应用,采用Palantir风格的深色主题设计,专注于专业感与科技感的视觉呈现。

## 技术栈

- **HTML5**: 语义化标签,SEO优化
- **CSS3**:
  - CSS变量系统
  - Flexbox & Grid布局
  - 玻璃拟态(Glassmorphism)效果
  - 响应式设计(移动端优先)
  - 动画与过渡效果
- **JavaScript (原生)**:
  - ES6+语法
  - 模块化设计
  - 事件处理与交互
  - 表单验证
  - 滚动动画

## 项目结构

```
project/
├── index.html                 # 首页
├── products.html              # 产品与解决方案
├── demo.html                  # 产品体验区
├── news.html                  # 新闻中心
├── about.html                 # 关于我们
├── careers.html               # 加入我们
├── contact.html               # 联系/试用
├── css/
│   ├── common.css             # 公共样式(CSS重置、变量、工具类)
│   ├── components.css         # 组件样式(Header、Footer、Card等)
│   ├── index.css              # 首页专属样式
│   ├── products.css           # 产品页专属样式
│   ├── demo.css               # 体验区专属样式
│   ├── news.css               # 新闻页专属样式
│   ├── about.css              # 关于页专属样式
│   ├── careers.css            # 招聘页专属样式
│   └── contact.css            # 联系页专属样式
├── js/
│   ├── common.js              # 公共脚本(工具函数、滚动动画)
│   ├── components.js          # 组件交互(菜单、模态框、Tab等)
│   ├── index.js               # 首页交互
│   ├── products.js            # 产品页交互
│   └── demo.js                # 体验区交互
└── README.md                  # 项目文档
```

## 功能特性

### 核心功能

1. **响应式设计**
   - 桌面端(≥1200px)
   - 平板端(768px-1199px)
   - 移动端(<768px)

2. **滚动动画**
   - Intersection Observer实现
   - 元素进入视口自动触发动画
   - 错峰动画效果

3. **表单验证**
   - 实时验证(失焦触发)
   - 提交前全局校验
   - 友好的错误提示

4. **交互组件**
   - 移动端汉堡菜单
   - Tab切换
   - 模态框
   - Toast通知
   - 返回顶部按钮

### 页面功能

| 页面 | 核心功能 | 说明 |
|:-----|:--------|:-----|
| **首页** | 品牌展示、价值主张、产品矩阵、技术亮点 | 30秒传达核心价值,驱动转化 |
| **产品页** | 产品详情、Tab切换、场景展示 | 深度展示产品能力 |
| **体验区** | Demo演示、ROI计算器 | 降低决策门槛,直观感受产品 |
| **新闻页** | 文章列表、分类筛选 | 展示公司动态与行业洞察 |
| **关于页** | 团队介绍、使命愿景 | 建立团队信任 |
| **招聘页** | 职位列表、投递入口 | 吸引技术人才 |
| **联系页** | 表单提交、联系信息 | 获客转化入口 |

## 使用方式

### 本地运行

1. **直接打开**
   ```bash
   # 进入项目目录
   cd /path/to/project

   # 直接在浏览器中打开index.html
   open index.html  # macOS
   start index.html # Windows
   xdg-open index.html # Linux
   ```

2. **本地服务器(推荐)**
   ```bash
   # 使用Python内置服务器
   python -m http.server 8000
   # 或者使用Node.js
   npx serve

   # 然后在浏览器访问 http://localhost:8000
   ```

### 部署上线

支持任意静态网站托管服务:

- **GitHub Pages**: 免费,适合开源项目
- **Vercel**: 自动部署,CDN加速
- **Netlify**: 持续集成,表单处理
- **阿里云OSS**: 国内访问速度快
- **腾讯云COS**: 国内CDN加速

## 设计规范

### 色彩系统

```css
/* 品牌色 */
--color-primary: #8B5CF6;           /* 睿来紫 */
--color-primary-light: #A78BFA;     /* 浅紫 */
--color-primary-dark: #6D28D9;      /* 深紫 */

/* 背景色 */
--color-bg-deep: #0F172A;           /* 深空蓝 */
--color-bg-dark: #1E293B;           /* 次级背景 */
--color-bg-hover: #334155;          /* 悬浮背景 */

/* 文字色 */
--color-text-white: #FFFFFF;        /* 主标题 */
--color-text-primary: #F1F5F9;      /* 正文 */
--color-text-secondary: #94A3B8;    /* 辅助文字 */
```

### 字号层级

- Hero Title: 64px
- H1: 48px
- H2: 36px
- H3: 24px
- 正文: 16px
- 小字: 14px

### 间距系统(8px基准)

- xxs: 4px
- xs: 8px
- sm: 16px
- md: 24px
- lg: 32px
- xl: 48px
- xxl: 64px
- xxxl: 96px

## 浏览器兼容性

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+
- 移动端浏览器: iOS Safari 13+, Android Chrome 80+

## 开发维护

### 添加新页面

1. 在根目录创建`newpage.html`
2. 在`css/`目录创建`newpage.css`
3. 在`js/`目录创建`newpage.js`(如需)
4. 更新所有页面的导航链接

### 修改样式

- **全局样式**: 修改`css/common.css`中的CSS变量
- **组件样式**: 修改`css/components.css`
- **页面样式**: 修改对应的页面CSS文件

### 图片资源

当前使用Unsplash外部图片链接,生产环境建议:

1. 下载图片到本地`images/`目录
2. 使用WebP格式优化体积
3. 提供2x分辨率(Retina屏幕)
4. 实现懒加载(已集成)

## 性能优化

- [x] CSS/JS文件模块化
- [x] 图片懒加载
- [x] 滚动事件节流
- [x] 移动端降级(视频→图片)
- [ ] CSS/JS压缩(生产环境)
- [ ] 图片WebP格式
- [ ] CDN加速
- [ ] Gzip压缩

## SEO优化

- [x] 语义化HTML标签
- [x] Meta标签完整
- [x] 图片alt属性
- [x] 清晰的URL结构
- [ ] sitemap.xml
- [ ] robots.txt
- [ ] 结构化数据(Schema.org)

## 许可证

© 2025 北京睿来智能体技术有限公司 版权所有

---

## 联系方式

- 邮箱: contact@reliableagent.cn
- 网站: [睿来智能体官网](index.html)

---

**生成日期**: 2025-01-28
**开发工具**: Claude Code (AI辅助开发)
