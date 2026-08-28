# 个人工具箱 PWA v0.1 开发任务

你是一名资深前端工程师，请帮助我从零开发一个“个人工具箱”PWA。

## 一、项目目标

这是一个手机优先的个人工具箱。

它不是传统 Todo App，也不是复杂 Dashboard。

核心理念：

> 用户可以把生活、工作、学习中各种高频的小问题做成独立的小工具，并通过统一的工具箱入口访问。

第一版只服务我自己，因此：

- 不需要登录
- 不需要用户系统
- 不需要后端
- 不需要云数据库
- 不需要 AI
- 所有数据默认保存在本地 IndexedDB
- 必须支持数据导入和导出
- 必须支持 PWA
- 必须支持 GitHub Pages 部署

---

## 二、技术栈

必须使用：

- React
- Vite
- Tailwind CSS
- React Router
- Dexie
- IndexedDB
- Lucide React
- vite-plugin-pwa

不要引入不必要的大型依赖。

---

## 三、项目名称

项目名称：

我的个人工具箱

英文名称：

Personal Toolbox

GitHub Repository：

personal-toolbox

---

## 四、手机优先

UI 首先针对手机设计。

重点适配：

- 375 × 667
- 390 × 844
- 430 × 932

桌面端仅作为辅助预览。

移动端页面最大宽度建议 480px。

所有按钮必须适合手指点击。

避免过小的点击区域。

---

## 五、整体设计风格

设计关键词：

- 简洁
- 工具感
- 现代
- 清晰
- 高可读性
- 手机优先
- 少动画
- 少装饰

禁止：

- 复杂 Dashboard
- 过度渐变
- 复杂玻璃拟态
- 大量动画
- 不必要的图表

首页重点是：

> 打开以后马上找到工具。

---

## 六、页面结构

应用包含：

1. 首页
2. 收藏
3. 设置
4. 各个独立工具页面

底部导航：

首页 / 收藏 / 设置

---

## 七、首页

首页包含：

### 顶部

显示：

🧰 我的工具箱

副标题：

我的个人效率中心

### 搜索

提供工具搜索：

搜索工具名称、描述、分类。

### 最近使用

自动记录最近使用的工具。

最多显示 4 个。

### 工具分类

第一版包含：

生活

工作

学习

### 工具卡片

每个工具卡片显示：

- 图标
- 名称
- 简短描述
- 收藏按钮

点击卡片进入工具。

---

## 八、Tool Registry

必须建立统一的工具注册机制。

创建：

src/app/toolRegistry.js

工具对象结构：

{
  id,
  name,
  description,
  icon,
  category,
  path,
  enabled
}

首页不要手动写死工具卡片。

首页必须根据 Tool Registry 自动生成工具。

以后新增工具时，只需要：

1. 创建工具目录
2. 创建工具页面
3. 注册到 Tool Registry
4. 注册路由

不要修改首页核心代码。

---

## 九、工具目录规范

所有工具必须放：

src/tools/

例如：

src/tools/last-time/

包含：

index.jsx
components/
service.js
README.md

每个工具尽可能独立。

不要让工具之间产生强耦合。

---

# 十、第一个工具：最后一次

工具 ID：

last-time

名称：

最后一次

描述：

记录生活中各种事情最后一次发生的时间。

功能：

- 新增事项
- 修改事项
- 删除事项
- 记录今天完成
- 查看上次时间
- 自动计算已经过去多少天
- 搜索
- 排序

默认页面：

← 最后一次

搜索框

事项列表：

洗车
3天前

理发
25天前

换牙刷
43天前

清洗净水器
72天前

右下角提供：

＋

点击事项：

显示：

事项名称

上一次时间

已经过去多少天

备注

按钮：

今天做了
编辑
删除

点击“今天做了”：

自动把 lastDate 更新为今天。

---

# 十一、第二个工具：倒计时

工具 ID：

countdown

名称：

倒计时

功能：

- 新增倒计时
- 编辑
- 删除
- 自动计算剩余天数

示例：

孩子生日
还有 36 天

项目截止
还有 12 天

旅行
还有 83 天

---

# 十二、第三个工具：灵感记录

工具 ID：

inspiration

名称：

灵感记录

目标：

让用户可以在 3 秒内记录一个突然想到的想法。

功能：

- 快速输入
- 保存
- 编辑
- 删除
- 标签
- 搜索
- 按时间排序

页面：

标题：

灵感记录

输入框：

今天想到……

标签：

#公众号
#机器人
#控制理论

按钮：

保存

---

# 十三、数据层

使用 Dexie + IndexedDB。

创建：

src/db/database.js

数据库：

PersonalToolbox

至少建立：

lastTimeRecords
countdowns
inspirations
favorites

数据必须完全本地保存。

不要把数据写死在 React state 中。

页面刷新以后数据必须保留。

---

# 十四、公共 Storage Service

不要让每个工具直接操作 IndexedDB。

建立统一的数据访问层。

例如：

src/services/storage.js

提供：

save
get
getAll
update
delete
clear

工具通过 service 操作数据库。

---

# 十五、收藏

工具可以收藏。

收藏数据：

toolId

首页可以显示最近收藏工具。

收藏页面显示：

⭐ 我的收藏

点击工具直接进入。

---

# 十六、最近使用

每次打开工具：

更新：

lastUsedAt

首页显示最近使用的工具。

最多显示 4 个。

---

# 十七、搜索

首页搜索工具。

支持：

名称
描述
分类

例如输入：

停车

可以找到：

停车位置

输入：

时间

可以找到：

时间记录

搜索必须实时过滤。

---

# 十八、设置

设置页面：

外观：

跟随系统
浅色
深色

数据：

导出数据
导入数据
清空所有数据

应用：

PWA 安装提示

关于：

我的个人工具箱
版本 0.1.0

---

# 十九、数据导出

提供：

导出数据

生成：

personal-toolbox-backup.json

结构包含：

version
exportedAt
lastTimeRecords
countdowns
inspirations
favorites

---

# 二十、数据导入

允许用户选择 JSON 文件。

导入前提示：

是否覆盖当前数据？

导入成功：

显示：

数据恢复成功。

---

# 二十一、PWA

必须配置：

vite-plugin-pwa

提供：

manifest

service worker

192x192 icon

512x512 icon

display：

standalone

GitHub Pages 项目路径：

/personal-toolbox/

必须正确处理 Vite base path。

---

# 二十二、GitHub Pages

项目最终部署：

GitHub Pages

GitHub Repository：

personal-toolbox

使用：

GitHub Actions

创建：

.github/workflows/deploy.yml

流程：

checkout
setup node
npm install
npm run build
deploy GitHub Pages

不要依赖 Cloudflare。

---

# 二十三、React Router

因为部署到 GitHub Pages：

第一版优先使用 HashRouter。

例如：

/#/tools/last-time

不要因为刷新导致 GitHub Pages 404。

---

# 二十四、代码质量

要求：

- 组件模块化
- 工具模块化
- 数据层独立
- 避免重复代码
- 避免超大组件
- 使用清晰的命名
- 所有核心函数添加必要注释
- 不要为了功能引入不必要依赖

---

# 二十五、开发方式

不要一次生成所有代码。

请分阶段实施：

Phase 1：

搭建 React/Vite/Tailwind/PWA 基础项目。

Phase 2：

实现 App Shell：

首页
底部导航
工具卡片
Tool Registry
路由

Phase 3：

实现 IndexedDB/Dexie 数据层。

Phase 4：

实现“最后一次”。

Phase 5：

实现“倒计时”。

Phase 6：

实现“灵感记录”。

Phase 7：

实现搜索、收藏、最近使用。

Phase 8：

实现设置、数据导入导出。

Phase 9：

配置 GitHub Actions。

Phase 10：

本地完整测试并修复问题。

---

# 二十六、重要开发原则

不要擅自增加：

- 登录
- 后端
- 数据库服务器
- AI
- 云同步
- 用户系统
- 支付
- 广告

第一版只完成上述需求。

如果发现需求存在多个实现方案：

优先选择：

> 最简单、最稳定、最容易维护的方案。

---

# 二十七、完成标准

最终运行：

npm run dev

应该可以正常使用。

运行：

npm run build

必须成功。

部署到 GitHub Pages 后：

首页正常。

所有工具正常。

刷新页面正常。

PWA 可以安装。

数据刷新后仍然存在。

导出和导入正常。

手机端布局正常。

---

# 二十八、现在开始

请不要一次输出所有代码。

首先：

1. 创建项目
2. 安装依赖
3. 建立目录结构
4. 配置 Tailwind
5. 配置 PWA
6. 配置 HashRouter
7. 创建基础 App Shell
8. 创建 Tool Registry
9. 创建 GitHub Actions

完成后告诉我：

“基础框架已完成，请继续实现 IndexedDB 数据层。”



# 请在现有“个人工具箱 PWA”项目中增加一个新的独立工具：

工具名称：
【填写名称】

工具 ID：
【填写 ID】

所属分类：
【生活 / 工作 / 学习】

工具目的：
【描述我要解决的问题】

核心功能：

1. 【功能1】
2. 【功能2】
3. 【功能3】

要求：

1. 工具必须放在 src/tools/ 下。
2. 创建独立目录。
3. 不修改其他工具的核心逻辑。
4. 使用现有 Dexie/IndexedDB 数据层。
5. 使用现有 UI 组件。
6. 注册到 toolRegistry。
7. 注册路由。
8. 自动支持最近使用。
9. 自动支持收藏。
10. 遵循现有手机端 UI 规范。
11. 不新增不必要的依赖。
12. 不引入后端。
13. 不引入 AI。
14. 完成后执行 npm run build。
15. 修复所有编译错误。

请先分析现有项目结构，然后直接实现，不要重新设计整个项目。
