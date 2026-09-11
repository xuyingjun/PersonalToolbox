# 上次

记录生活中那些“最后一次”的时刻。

“上次”（英文名 LastTime）是一个独立的个人周期性事务记录 PWA。记录一件事情最后一次发生的时间，并根据历史记录和用户设置的周期，告诉用户下一次大概什么时候需要关注。

在线访问：[LastTime](https://xuyingjun.github.io/PersonalToolbox/)

## 核心概念

```text
Item  = 我关注什么（洗牙、换机油、清理空调……）
Event = 它什么时候真实发生过
Cycle = 我认为多久应该发生一次

LatestEvent / NextDate / Status / Statistics 全部动态计算，不保存到数据库。
```

## 功能

- **需要关注**：首页第一眼展示已过期、今天到期、即将到期的事项
- **今天做了**：一键记录今天发生过，同一天自动去重
- **周期**：每天 / 每周 / 每两周 / 每月 / 每季度 / 每半年 / 每年 / 自定义天数
- **历史记录**：每次发生的日期与备注，可增改删
- **轻量统计**：记录次数、平均/最长/最短间隔（不足两次不显示无意义数据）
- **搜索与排序**：按名称、分类、备注搜索；四种排序
- **数据管理**：JSON 导出 / 校验导入（覆盖模式）、旧“个人工具箱”数据一键迁移
- **分类管理**：默认 8 个分类，可选择图标、增改、排序和删除（被引用的分类不可删除）
- **关注范围**：设置事项提前多少天进入“需要关注”
- **外观**：统一明亮橙色主题

## 设计原则

- Local First：数据全部保存在浏览器 IndexedDB（`LastTimeDB`），无需登录
- 无后端、无 AI、无云同步、无第三方 API
- 移动优先（375 / 390 / 430 宽），最大内容宽度 480px，支持 iPhone Safe Area
- 派生数据（lastDate / nextDate / status / statistics）绝不落库

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
npm test         # 运行全部测试（日期 / 状态 / 服务 / 备份 / 迁移）
npm run lint     # 运行 ESLint
npm run build    # 创建生产构建（prebuild 自动生成 PWA 图标）
npm run preview  # 预览生产构建（含 Service Worker，开发模式下 SW 默认关闭）
```

## 技术栈

- React 19、Vite 7
- React Router（HashRouter）
- Tailwind CSS 4
- Dexie 与 IndexedDB
- 本地 ClassApp 风格 SVG 图标与分类 emoji
- vite-plugin-pwa
- Node.js 内置测试运行器 + fake-indexeddb

## 项目结构

```text
src/
  components/   # 通用组件（ItemCard、StatusBadge、CycleSelector、Sheet/Dialog 等）
  db/           # LastTimeDB：schema、实例、默认分类播种
  hooks/        # useToday、useLiveData（Dexie liveQuery）、useItemViewModels
  pages/        # 首页 / 全部 / 新增编辑 / 详情 / 设置
  services/     # item / event / category / statistics / status / viewModel / backup / migration / settings
  utils/        # 本地自然日工具（唯一日期计算入口）
test/           # Node.js 测试（数据层）
test-helpers/   # 测试基础设施（fake-indexeddb 注入）
scripts/        # 零依赖 PWA 图标生成器
```

架构纪律：

- UI 不直接操作 Dexie：Component → Service → Dexie
- 所有日期计算统一走 `src/utils/date.js`，禁止 `new Date('YYYY-MM-DD')` 业务计算
- 列表页一次读取三表，ViewModel 在内存中推导，无 N+1 查询

## 数据与隐私

所有业务数据只保存在当前浏览器的 IndexedDB 中，不会上传到服务器，也没有账号或云同步功能。

清理浏览器网站数据、卸载 PWA 或系统存储回收都可能删除本机数据。请在“我的 > 数据备份与恢复”中定期导出 JSON 备份，并妥善保管包含私人内容的备份文件。导入采用覆盖模式，确认后会替换当前全部数据。

旧版“个人工具箱”的 `lastTimeRecords` 数据可在“我的 > 数据备份与恢复”中一键迁移（幂等，不删除旧库）。

## 部署

项目通过 GitHub Actions 构建并部署到 GitHub Pages。Vite 使用相对资源路径，页面路由使用 HashRouter，可部署在 GitHub Pages 或其他静态子目录中。

推送到 `main` 分支后，工作流会依次安装依赖、运行测试和 ESLint、构建应用并发布 `dist` 目录。

## 版本

当前版本：1.0.0
