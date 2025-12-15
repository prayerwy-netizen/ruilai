<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 睿来智能体 (Reliable Agent)

基于 Gemini AI 的智能煤矿管理系统 - AI-powered Coal Mine Management System

## 功能特性

- 🤖 **智能对话**: 基于 Gemini AI 的智能问答系统
- 🕸️ **知识图谱**: 可视化实体关系图谱，支持拖拽、连线、编辑等交互
- 📊 **数据时空对齐**: 多源异构数据接入与管理
- 📈 **数据大屏**: 煤矿生产全景驾驶舱，实时监控

## 在线演示

View your app in AI Studio: https://ai.studio/apps/drive/1VSl8IjI_jMLnDx44GMLLHhYv1Jt0FWeT

## 本地运行

**前置要求**: Node.js

1. 安装依赖:
   ```bash
   npm install
   ```

2. 配置 Gemini API Key:
   - 复制 `.env.example` 为 `.env.local`
   - 在 `.env.local` 中设置您的 `VITE_GEMINI_API_KEY`
   - 或在应用运行后，在界面右上角配置 API Key

3. 运行应用:
   ```bash
   npm run dev
   ```

4. 在浏览器中打开: http://localhost:3000/ruilai/

## API Key 安全说明

本项目已做 API Key 保护:
- ✅ `.env.local` 文件已加入 `.gitignore`，不会被提交到 Git
- ✅ 支持运行时在浏览器中配置 API Key（存储在 localStorage）
- ✅ 包含 `.env.example` 示例配置文件

获取免费 Gemini API Key: https://aistudio.google.com/apikey

## 技术栈

- React 19
- TypeScript
- Vite
- D3.js (知识图谱可视化)
- Recharts (数据可视化)
- Gemini AI API
- Tailwind CSS

## 最近更新

- 修复知识图谱拖拽节点复位问题
- 修复连线模式下画布空白问题
- 修复数据大屏滚动条显示问题
- 菜单项"数据治理"更名为"数据时空对齐"

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)
