# 我的个人工具箱

一个面向 iPhone、数据保存在本机的个人工具 PWA。它提供统一的工具入口、搜索、收藏和最近使用记录，也可以安装到主屏幕并在离线状态下打开。

在线访问：[Personal Toolbox](https://xuyingjun.github.io/PersonalToolbox/)

## 功能

### 最后一次

- 记录某件事上一次发生的日期和备注
- 显示已经过去的本地自然日天数
- 支持新增、编辑、删除、搜索和排序
- 可通过“今天做了”快速更新日期

### 倒计时

- 记录重要日期和备注
- 显示剩余天数、当天状态或逾期天数
- 支持新增、编辑和删除
- 按目标日期从近到远排列

### 灵感记录

- 快速保存想法和多个标签
- 支持编辑、删除、内容与标签搜索
- 可按创建时间或更新时间排序

### 公共能力

- 工具搜索、收藏和最近使用
- 跟随系统、浅色、深色三种外观模式
- 使用 IndexedDB 在浏览器本机持久化数据
- 导出 JSON 备份、校验并覆盖恢复数据
- PWA 离线访问和新版本更新提示
- iPhone 安全区域与移动端布局适配

## iPhone 安装

1. 使用 Safari 打开[在线版本](https://xuyingjun.github.io/PersonalToolbox/)。
2. 点击 Safari 的“分享”按钮。
3. 选择“添加到主屏幕”。

iOS 不提供网页可直接触发的通用安装弹窗，因此需要通过 Safari 分享菜单完成安装。

## 本地开发

需要 Node.js 20.19 或更高版本。

```bash
git clone https://github.com/xuyingjun/PersonalToolbox.git
cd PersonalToolbox
npm install
npm run dev
```

常用命令：

```bash
npm run dev      # 启动开发服务器
npm test         # 运行日期规则测试
npm run lint     # 运行 ESLint
npm run build    # 创建生产构建
npm run preview  # 预览生产构建
```

## 技术栈

- React 19、Vite 7
- React Router（HashRouter）
- Tailwind CSS 4
- Dexie 与 IndexedDB
- Lucide React
- vite-plugin-pwa

## 项目结构

```text
src/
  app/          # 工具注册表
  components/   # 公共布局与 UI
  db/           # Dexie 数据库和 schema
  hooks/        # 实时数据和日期刷新 hooks
  pages/        # 首页、收藏、设置
  services/     # 备份、收藏、设置、最近使用
  tools/        # 最后一次、倒计时、灵感记录
  utils/        # 本地自然日工具
test/           # Node.js 测试
```

工具展示信息集中在 `src/app/toolRegistry.js`。新增工具时，需要创建独立工具模块，并在注册表和应用路由中注册。

## 数据与隐私

所有业务数据默认只保存在当前浏览器的 IndexedDB 中，不会上传到服务器，也没有账号或云同步功能。

清理浏览器网站数据、卸载 PWA 或系统存储回收都可能删除本机数据。请在“设置 > 数据”中定期导出 JSON 备份，并妥善保管包含私人内容的备份文件。导入采用覆盖模式，确认后会替换当前全部数据。

## 部署

项目通过 GitHub Actions 构建并部署到 GitHub Pages。Vite 生产基础路径为 `/PersonalToolbox/`，页面路由使用 HashRouter，避免刷新工具页面时出现 404。

推送到 `main` 分支后，工作流会依次安装依赖、运行测试和 ESLint、构建应用并发布 `dist` 目录。

## 版本

当前版本：0.1.0