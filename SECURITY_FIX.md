# API Key 泄露修复指南

## 问题说明
之前的 API Key 被意外提交到了 GitHub 仓库,存在安全风险。

## 已完成的修复

### 1. 代码修复 ✅
- 更新了 `.gitignore`,添加了 `.env*` 文件的忽略规则
- 修改了 `vite.config.ts`,移除了将 API Key 打包到代码的逻辑
- 修改了 `services/geminiService.ts`,从 localStorage 读取 API Key
- 更新了 `components/Header.tsx`,添加了 API Key 配置界面
- 创建了 `.env.example` 示例文件

### 2. 使用新的 API Key 配置方式 ✅
现在用户可以在浏览器中安全地配置 API Key:
1. 打开应用
2. 点击右上角的 "配置 API Key" 按钮
3. 输入从 [Google AI Studio](https://aistudio.google.com/apikey) 获取的 API Key
4. API Key 仅存储在浏览器的 localStorage 中,不会被提交到代码仓库

## 需要手动完成的操作

### 3. 清理 GitHub 仓库历史记录 ⚠️

**重要:** 已泄露的 API Key 仍然存在于 Git 历史记录中,需要清理。

#### 方法一: 使用 BFG Repo-Cleaner (推荐)

```bash
# 1. 安装 BFG (Mac 用户)
brew install bfg

# 2. 克隆仓库的镜像
git clone --mirror git@github.com:YOUR_USERNAME/YOUR_REPO.git

# 3. 使用 BFG 删除包含 API Key 的文件
cd YOUR_REPO.git
bfg --delete-files .env.local
bfg --replace-text ../passwords.txt  # 创建一个包含 API Key 的文件

# 4. 清理和推送
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push --force
```

#### 方法二: 使用 git filter-branch

```bash
# 从 Git 历史中删除 .env.local 文件
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env.local" \
  --prune-empty --tag-name-filter cat -- --all

# 强制推送到远程仓库
git push origin --force --all
```

#### 方法三: 删除仓库重新创建 (最简单但会丢失历史)

如果这是一个新项目,最简单的方法是:
1. 删除 GitHub 上的仓库
2. 删除本地的 `.git` 目录
3. 重新初始化 git 并推送

```bash
# 删除本地 git 历史
rm -rf .git

# 重新初始化
git init
git add .
git commit -m "Initial commit (cleaned)"

# 创建新的 GitHub 仓库后推送
git remote add origin git@github.com:YOUR_USERNAME/NEW_REPO.git
git push -u origin main
```

### 4. 撤销泄露的 API Key ⚠️

**立即执行以下操作:**

1. 访问 [Google AI Studio API Keys](https://aistudio.google.com/apikey)
2. 找到泄露的 API Key: `AIzaSyAT9ZAL2fMd6MiG5L72DOkobfY7iuYRJLE`
3. 删除该 API Key
4. 创建一个新的 API Key
5. 在应用中配置新的 API Key

## 防止未来泄露的最佳实践

1. **永远不要提交 `.env` 文件** - 已添加到 `.gitignore`
2. **使用 git hooks** - 可以使用 pre-commit hook 检测敏感信息
3. **定期审查提交** - 提交前检查是否包含敏感信息
4. **使用环境变量管理工具** - 对于生产环境,考虑使用 Vercel/Netlify 的环境变量功能

## 验证修复

提交修复后,运行以下命令确认 `.env.local` 不会被追踪:

```bash
git status
# 应该看不到 .env.local 文件

git check-ignore -v .env.local
# 应该显示被 .gitignore 忽略
```

## 需要帮助?

如果在清理仓库历史时遇到问题,可以参考:
- [GitHub 官方文档: 从仓库中删除敏感数据](https://docs.github.com/cn/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)
- [BFG Repo-Cleaner 官方网站](https://rtyley.github.io/bfg-repo-cleaner/)
