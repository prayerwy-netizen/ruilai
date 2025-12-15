# API Key 配置说明

本项目支持两种配置 API Key 的方式，确保开发便捷的同时保证安全性。

## 方式一：本地开发（推荐给开发者）

### 步骤：

1. **复制示例文件**
   ```bash
   cp .env.example .env.local
   ```

2. **编辑 `.env.local` 文件**
   ```bash
   # 使用你喜欢的编辑器打开
   nano .env.local
   # 或
   code .env.local
   ```

3. **填入你的 API Key**
   ```env
   VITE_GEMINI_API_KEY=你的实际API_Key
   ```

4. **启动开发服务器**
   ```bash
   npm run dev
   ```

### 优点：
- ✅ 本地开发时无需每次在浏览器中输入
- ✅ `.env.local` 已在 `.gitignore` 中，**绝不会**被提交到 Git
- ✅ 多个开发者可以使用各自的 API Key

### 注意事项：
- ⚠️ **永远不要**将 `.env.local` 提交到 Git
- ⚠️ **永远不要**将 `.env.local` 改名为 `.env` 并提交
- ⚠️ 确认 `.gitignore` 包含了环境变量文件的规则

---

## 方式二：浏览器配置（推荐给最终用户）

### 步骤：

1. **打开应用**
   访问部署后的应用 URL

2. **点击"配置 API Key"按钮**
   右上角会有一个黄色/琥珀色的按钮

3. **输入 API Key**
   在弹出的对话框中输入从 [Google AI Studio](https://aistudio.google.com/apikey) 获取的 API Key

4. **保存**
   API Key 会安全地存储在浏览器的 localStorage 中

### 优点：
- ✅ 适合不懂技术的用户
- ✅ 数据仅存储在用户自己的浏览器中
- ✅ 无需任何配置文件

### 注意事项：
- ⚠️ 清除浏览器数据会删除已保存的 API Key
- ⚠️ 每个浏览器需要单独配置

---

## API Key 加载优先级

代码会按以下顺序查找 API Key：

1. **localStorage**（浏览器中配置的）- 最高优先级
2. **环境变量** (`VITE_GEMINI_API_KEY`) - 本地开发备用
3. **无 API Key** - 提示用户配置

---

## 如何获取 Gemini API Key

1. 访问 [Google AI Studio](https://aistudio.google.com/apikey)
2. 使用 Google 账号登录
3. 点击 "Create API Key" 或"创建 API 密钥"
4. 复制生成的 API Key
5. 按照上述方式一或方式二进行配置

---

## 安全检查清单

在提交代码到 GitHub 之前，请确认：

- [ ] `.env.local` 在 `.gitignore` 中
- [ ] 没有硬编码的 API Key 在源代码中
- [ ] 运行 `git status` 看不到 `.env.local` 文件
- [ ] 运行 `git log -p` 检查历史提交中没有 API Key

验证命令：
```bash
# 确认 .env.local 被忽略
git check-ignore -v .env.local

# 应该输出类似：
# .gitignore:15:.env.local    .env.local
```

---

## 常见问题

### Q: 为什么环境变量要以 `VITE_` 开头？
A: Vite 出于安全考虑，只有以 `VITE_` 开头的环境变量才会被暴露给客户端代码。

### Q: 生产环境会暴露 API Key 吗？
A: 不会。在生产构建（`npm run build`）时，如果 `.env.local` 不存在，环境变量会是空字符串。用户需要在浏览器中自行配置。

### Q: 我不小心提交了 `.env.local` 怎么办？
A: 参考 `SECURITY_FIX.md` 文档进行补救。

---

## 开发 vs 生产

| 环境 | API Key 来源 | 配置方式 |
|------|-------------|---------|
| **本地开发** | `.env.local` 文件 | 创建 `.env.local` 并填入 API Key |
| **生产部署** | 用户浏览器 localStorage | 用户在 UI 中配置 |
| **GitHub Pages** | 用户浏览器 localStorage | 用户在 UI 中配置 |

这样既方便了本地开发，又保证了生产环境的安全性！
