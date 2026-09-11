# LastTime v1.0 Vibe Coding 完整开发指令集

> **项目名称：** LastTime / 最后一次\
> **版本：** v1.0\
> **开发方式：** Vibe Coding\
> **适用工具：** Cursor / Claude Code / ChatGPT Coding

***

## 1. 项目定位

LastTime 是一个独立的个人周期性事务记录 PWA。

产品核心价值：

> 记录一件事情最后一次发生的时间，并根据历史记录和用户设置的周期，告诉用户下一次大概什么时候需要关注。

核心原则：

1. Local First
2. 数据全部保存在浏览器 IndexedDB
3. 不需要登录
4. 不需要后端
5. 不接入 AI
6. 不接入云同步
7. 不接入第三方 API
8. 优先支持 iPhone Safari / iOS PWA
9. 同时兼容桌面浏览器
10. 使用 GitHub Pages 部署

***

## 2. 技术栈

技术栈固定：

- React
- Vite
- JavaScript / JSX
- Tailwind CSS
- React Router
- Dexie
- IndexedDB
- Lucide React
- vite-plugin-pwa
- HashRouter
- GitHub Pages

明确不使用：

- TypeScript
- Redux / Zustand 等额外状态管理库
- 后端
- AI
- 云同步
- 登录/账号系统
- 第三方 API

***

# Prompt 01：项目初始化

## 目标

建立 LastTime v1.0 基础工程，不实现具体业务功能。

## 可直接复制给 Cursor / Claude Code

```text
你现在是一名资深前端工程师，请帮我从零创建一个名为：

LastTime

的个人周期性事务记录 PWA。

这是一个从原“个人工具箱”中独立出来的产品。

产品定位：

“记录一件事情最后一次发生的时间，并根据历史记录和用户设置的周期，告诉用户下一次大概什么时候需要关注。”

核心原则：

1. Local First
2. 数据全部保存在浏览器 IndexedDB
3. 不需要登录
4. 不需要后端
5. 不接入 AI
6. 不接入云同步
7. 不接入第三方 API
8. 优先支持 iPhone Safari / iOS PWA
9. 同时兼容桌面浏览器
10. 使用 GitHub Pages 部署

技术栈固定：

- React
- Vite
- JavaScript / JSX
- Tailwind CSS
- React Router
- Dexie
- Lucide React
- vite-plugin-pwa
- HashRouter

请完成：

1. 初始化 Vite + React 项目
2. 配置 Tailwind CSS
3. 安装并配置 Dexie
4. 安装 Lucide React
5. 配置 React Router
6. 配置 vite-plugin-pwa
7. 使用 HashRouter
8. 配置 GitHub Pages 所需的 base 路径
9. 建立合理的 src 目录结构
10. 建立基础 App Shell
11. 建立全局 CSS
12. 建立响应式布局基础

建议目录：

src/
├── app/
├── components/
├── db/
├── services/
├── utils/
├── pages/
├── styles/
├── App.jsx
└── main.jsx

要求：

- 不实现业务逻辑
- 不创建假的数据库数据
- 不加入不必要依赖
- 不加入 TypeScript
- 不加入 Redux/Zustand 等状态管理库
- 不加入后端
- 不加入 AI

完成后：

1. 检查 npm install
2. 检查 npm run build
3. 确保 npm run dev 可以正常启动
4. 如果发现问题自动修复

最后告诉我：
- 创建了哪些文件
- 每个文件作用
- 如何启动项目
- 如何执行 build
```

***

# Prompt 02：Dexie 数据库 Schema

## 目标

建立整个 LastTime 的数据基础。

```text
现在开始实现 LastTime v1.0 数据库层。

严格按照以下最终 Schema 实现，不允许自行增加字段。

数据库使用：

Dexie + IndexedDB

数据库名称：

LastTimeDB

需要建立 5 张表：

1. items
2. events
3. categories
4. settings
5. meta

====================
items
====================

字段：

id
name
categoryId
cycleType
cycleValue
note
createdAt
updatedAt

说明：

Item 表示“用户关注的一件事情”。

例如：

洗牙
换机油
给孩子剪头发
清理空调
发布公众号文章

禁止增加：

lastDate
nextDate
status
statistics

这些全部必须动态计算。

====================
events
====================

字段：

id
itemId
eventDate
note
createdAt
updatedAt

Event 表示：

“这件事情真实发生过一次”。

例如：

洗牙
2026-08-01

洗牙
2025-08-01

====================
categories
====================

字段：

id
name
sortOrder
createdAt
updatedAt

默认分类：

生活
家庭
健康
汽车
工作
学习
数码
其他

====================
settings
====================

字段：

key
value

用于保存应用设置。

====================
meta
====================

字段：

key
value

用于保存：

schemaVersion
migrationVersion
appVersion
等元数据。

====================

Dexie schema：

items:
id, name, categoryId, cycleType, createdAt, updatedAt

events:
id, itemId, eventDate, createdAt, updatedAt

categories:
id, name, sortOrder

settings:
key

meta:
key

要求：

1. 建立 db.js
2. 建立数据库初始化逻辑
3. 建立默认分类初始化
4. 使用 crypto.randomUUID() 生成 ID
5. createdAt / updatedAt 使用 ISO 8601
6. eventDate 使用本地 YYYY-MM-DD
7. 不允许使用 new Date('YYYY-MM-DD') 直接进行日期业务计算
8. 数据库必须支持事务
9. 为未来 Schema migration 留出空间

同时建立：

src/db/
├── db.js
├── schema.js
└── seed.js

请完成后：

- 检查数据库可以正常创建
- 检查默认分类是否初始化
- 检查 npm run build
- 不创建任何 UI
```

***

# Prompt 03：日期工具 Date Service

## 目标

统一处理所有业务日期，避免时区和自然日计算错误。

```text
现在实现 LastTime v1.0 的日期工具。

建立：

src/utils/date.js

所有业务日期计算必须经过这个文件。

核心规则：

1. 使用“自然日”而不是 24 小时
2. 今天 = 0 天
3. 昨天 = 1 天
4. 明天 = -1 天
5. 未来日期必须按照本地日历计算
6. 不允许使用 UTC 日期逻辑代替本地日期
7. 禁止直接使用 new Date('YYYY-MM-DD') 进行业务日期计算

实现：

formatLocalDate(date)

getTodayString()

parseLocalDate(dateString)

differenceInCalendarDays(dateA, dateB)

getElapsedDays(eventDate)

addDays(dateString, days)

addCycle(dateString, cycleType, cycleValue)

isToday(dateString)

isFuture(dateString)

isPast(dateString)

formatDate(dateString)

formatRelativeDays(dateString)

formatNextDate(dateString)

要求支持：

cycleType：

none
daily
weekly
biweekly
monthly
quarterly
halfYear
yearly
custom

其中：

custom 使用 cycleValue 表示天数。

例如：

custom + 30

表示每 30 天。

相对日期显示：

今天
昨天
前天
3天前
7天前

未来：

明天
还有 3 天
还有 7 天

注意：

“还有 N 天”表示目标日期在未来。

“已过去 N 天”表示目标日期在过去。

所有日期行为必须经过单元测试。

请建立：

src/utils/date.js
src/utils/date.test.js

至少测试：

今天
昨天
明天
跨月
跨年
闰年
月底
未来日期
过去日期
```

***

# Prompt 04：Service 数据服务层

## 目标

UI 不直接操作 Dexie，所有数据库操作通过 Service。

```text
现在实现 LastTime v1.0 Service 层。

原则：

React UI 不允许直接调用 Dexie。

所有数据库操作必须经过 Service。

建立：

src/services/itemService.js
src/services/eventService.js
src/services/categoryService.js
src/services/statisticsService.js
src/services/viewModelService.js

====================
itemService
====================

实现：

createItem(data)

updateItem(id, data)

deleteItem(id)

getItem(id)

getAllItems()

searchItems(keyword)

====================
eventService
====================

实现：

createEvent(data)

updateEvent(id, data)

deleteEvent(id)

getEventsByItemId(itemId)

getLatestEvent(itemId)

recordToday(itemId)

====================

recordToday(itemId) 必须：

1. 获取今天 YYYY-MM-DD
2. 检查该 Item 今天是否已有 Event
3. 如果已有，禁止重复创建
4. 如果没有，创建 Event
5. 更新 Item.updatedAt

====================
categoryService
====================

实现：

getAllCategories()

createCategory()

updateCategory()

deleteCategory()

====================
statisticsService
====================

实现：

calculateItemStatistics(itemId)

统计：

eventCount
averageInterval
minimumInterval
maximumInterval

如果不足两个 Event：

averageInterval = null

====================
viewModelService
====================

建立：

getItemViewModel(itemId)

getAllItemViewModels()

ViewModel 必须动态生成：

id
name
category
note
latestEvent
elapsedDays
cycle
nextDate
status
statistics

禁止把：

nextDate
status
statistics

写入数据库。

====================

Service 层必须处理：

Item 不存在
Event 不存在
非法日期
重复 Event
删除 Item 时删除关联 Events
事务失败

完成后编写基础测试。
```

***

# Prompt 05：ViewModel + Status 状态系统

```text
现在实现 LastTime v1.0 的核心状态计算系统。

Status 不允许保存到数据库。

必须动态计算。

状态：

NO_RECORD
NO_CYCLE
NORMAL
UPCOMING
DUE_TODAY
OVERDUE

规则：

NO_RECORD：

Item 没有任何 Event。

NO_CYCLE：

Item 有 Event，但 cycleType = none。

DUE_TODAY：

nextDate = today

OVERDUE：

nextDate < today

UPCOMING：

nextDate > today

并且距离 today <= 7 天。

NORMAL：

nextDate > today + 7 天。

默认 upcomingThreshold：

7 天。

建立：

src/services/statusService.js

实现：

calculateStatus(item, latestEvent)

calculateNextDate(item, latestEvent)

calculateElapsedDays(latestEvent)

calculateAttentionLevel(status)

Attention 排序：

OVERDUE
DUE_TODAY
UPCOMING

没有周期的 Item 不进入“需要关注”。

没有 Event 的 Item 也不进入“需要关注”。

建立完整测试：

- 无记录
- 无周期
- 今天到期
- 已过期
- 7天内
- 7天以后
```

***

# Prompt 06：App Shell + Bottom Navigation

```text
现在开始实现 LastTime v1.0 UI。

设计原则：

产品应该像一个成熟的 iPhone 原生工具，而不是后台管理系统。

视觉：

- 简洁
- 大留白
- 信息层级清晰
- 卡片适度
- 不堆统计
- 不使用复杂渐变
- 不使用过度动画

移动优先。

目标：

375 × 667
390 × 844
430 × 932

最大内容宽度：

480px

底部导航：

首页
全部
设置

建立：

AppShell
BottomNavigation

页面：

HomePage
ItemListPage
SettingsPage

底部导航固定。

要求：

- iPhone Safe Area
- touch target >= 44px
- 不依赖 hover
- 支持深色模式
- 支持浅色模式
- 页面滚动区域不能被 BottomNavigation 遮挡

Lucide React 用于图标。

完成：

1. 页面路由
2. BottomNavigation
3. 基础 Header
4. 页面容器
5. FAB 基础组件

暂时不实现具体业务数据。
```

***

# Prompt 07：首页 HomePage

```text
现在实现 LastTime 首页。

首页定位：

“打开 App 后，用户第一眼就知道哪些事情需要关注。”

结构：

顶部：

LastTime

副标题：

记录生活中那些“最后一次”的时刻。

然后：

搜索框

然后：

“需要关注”

然后：

“最近记录”

然后：

FAB：

+

====================

需要关注：

只显示：

OVERDUE
DUE_TODAY
UPCOMING

排序：

1. OVERDUE
2. DUE_TODAY
3. UPCOMING

UPCOMING 按距离到期时间排序。

卡片显示：

事项名称
状态
最后一次
下一次
快捷按钮：今天做了

例如：

洗牙

已过期 12 天

最后一次：2026-01-05
下一次：2026-07-05

[今天做了]

点击卡片：

进入 Detail。

点击：

今天做了

直接创建 Event。

成功后：

立即刷新 ViewModel。

如果今天已经记录：

按钮显示：

今天已记录

并禁止重复。

====================

最近记录

显示最近发生过 Event 的 Item。

默认显示最近 5 个。

====================

空状态

如果没有任何数据：

显示：

“还没有记录”

说明：

“记录一件事情最后一次发生的时间，LastTime 会帮你记住下一次。”

提供：

“添加第一件事”

====================

要求：

首页不要设计复杂 Dashboard。

不要增加：

饼图
柱状图
趋势图
数据大屏
复杂统计卡片

首页重点永远是：

“我现在需要关注什么？”
```

***

# Prompt 08：全部事项 + 搜索 + 排序

```text
现在实现 ItemListPage。

标题：

全部

功能：

搜索
排序

搜索范围：

name
note
category

排序选项：

1. 最需要关注
2. 最近记录
3. 最久没记录
4. 最近修改

默认：

最需要关注

排序逻辑：

最需要关注：

OVERDUE
DUE_TODAY
UPCOMING
NORMAL
NO_CYCLE
NO_RECORD

然后：

最近记录

按照 latestEvent.eventDate DESC。

最久没记录：

按照 latestEvent.eventDate ASC。

最近修改：

updatedAt DESC。

每个 Item Card：

名称
分类
最后一次
已过去多少天
下一次
状态
今天做了

点击卡片进入详情。

右下角 FAB：

+

点击：

进入新增页面。
```

***

# Prompt 09：新增 / 编辑 Item

```text
现在实现 ItemEditPage。

页面同时支持：

新增
编辑

表单：

1. 名称
2. 分类
3. 上一次
4. 周期
5. 备注

====================

名称

必填。

不能为空。

====================

分类

默认：

生活

可选择：

生活
家庭
健康
汽车
工作
学习
数码
其他

====================

上一次

三个选择：

今天
选择日期
暂不记录

如果选择：

今天

创建 Item 后自动创建 Event。

如果选择：

选择日期

创建 Item + Event。

如果选择：

暂不记录

只创建 Item。

====================

周期

选项：

不设置
每天
每周
每两周
每月
每季度
每半年
每年
自定义

自定义：

输入天数。

例如：

30 天

====================

备注

可选。

====================

编辑 Item：

允许修改：

名称
分类
周期
备注

“上一次”不要作为普通 Item 字段修改。

如果用户需要修改历史记录：

进入历史记录。

====================

保存：

新增：

创建 Item

必要时创建 Event

编辑：

updateItem

保存后：

返回 Detail 或 List。

要求：

表单必须适合手机操作。

输入框不能被键盘遮挡。
```

***

# Prompt 10：Detail + History

```text
现在实现 ItemDetailPage。

详情页结构固定：

1. 名称
2. 分类
3. 最后一次
4. 状态
5. 今天做了
6. 下一次
7. 周期
8. 历史记录
9. 统计
10. 备注
11. 编辑
12. 删除

====================

最后一次

显示 latestEvent。

如果没有：

“还没有记录”

====================

今天做了

核心按钮。

点击：

recordToday()

如果已经记录：

“今天已记录”

====================

下一次

如果有周期：

显示 nextDate。

没有周期：

“不设置”

====================

历史记录

按日期倒序。

每条：

日期
备注

点击可以：

编辑
删除

历史记录使用 Bottom Sheet。

====================

统计

只显示轻量数据：

记录次数
平均间隔
最长间隔
最短间隔

如果数据不足：

不要显示无意义的数据。

====================

删除

必须弹出确认：

“确定删除这个事项吗？”

同时说明：

“删除后，该事项的历史记录也会被删除。”

删除使用事务。

====================

编辑按钮：

进入 ItemEditPage。

====================

页面顶部：

返回
编辑

不要堆放太多按钮。
```

***

# Prompt 11：Cycle Selector + Event Sheet + Dialog

```text
现在实现 LastTime v1.0 的通用交互组件。

建立：

src/components/

CycleSelector.jsx
AddEventSheet.jsx
DeleteConfirmDialog.jsx
ImportConfirmDialog.jsx
ItemCard.jsx
StatusBadge.jsx
EmptyState.jsx
SearchBar.jsx
Fab.jsx

====================

CycleSelector

Bottom Sheet。

选项：

不设置
每天
每周
每两周
每月
每季度
每半年
每年
自定义

自定义显示：

周期天数输入。

====================

AddEventSheet

用于添加历史 Event。

字段：

发生日期
备注

日期：

不能晚于今天。

====================

DeleteConfirmDialog

统一删除确认组件。

====================

StatusBadge

根据：

NO_RECORD
NO_CYCLE
NORMAL
UPCOMING
DUE_TODAY
OVERDUE

显示对应文字。

不要依赖颜色表达唯一含义。

====================

ItemCard

统一 Item 展示。

所有列表使用同一个 ItemCard。

要求：

组件保持纯展示。

数据库操作放 Service。
```

***

# Prompt 12：备份 / 恢复

```text
现在实现 LastTime v1.0 数据备份。

原则：

所有数据属于用户。

必须支持：

导出
导入

导出格式：

JSON。

格式：

{
  "app": "LastTime",
  "version": "1.0",
  "exportedAt": "...",
  "items": [],
  "events": [],
  "categories": [],
  "settings": []
}

====================

导出

生成：

LastTime-backup-YYYY-MM-DD.json

下载。

====================

导入

用户选择 JSON。

执行：

1. JSON 格式验证
2. version 验证
3. 数据结构验证
4. ID 唯一性检查
5. itemId / categoryId 外键检查
6. 日期格式检查
7. transaction

导入策略：

覆盖当前数据。

导入前必须确认：

“导入后将覆盖当前 LastTime 数据。”

如果失败：

整个事务 rollback。

====================

不要：

自动上传云端
自动同步
调用第三方服务

所有操作本地完成。
```

***

# Prompt 13：从旧"个人工具箱"迁移

```text
现在实现 LastTime v1.0 的旧数据迁移。

旧版本数据结构：

lastTimeRecords

字段：

id
name
lastDate
note
createdAt
updatedAt

旧数据来源：

原个人工具箱 PWA。

新结构：

items
events

====================

迁移规则：

每一条旧 lastTimeRecords：

转换为：

1 个 Item

以及：

如果 lastDate 存在：

1 个 Event。

====================

Item：

id：

可以沿用旧 id，但必须保证唯一。

name：

旧 name

categoryId：

默认：

其他

cycleType：

none

cycleValue：

null

note：

旧 note

createdAt：

旧 createdAt

updatedAt：

旧 updatedAt

====================

Event：

id：

生成新的 UUID

itemId：

对应 Item id

eventDate：

旧 lastDate

note：

旧 note

createdAt：

旧 updatedAt

updatedAt：

旧 updatedAt

====================

严禁：

根据 lastDate 推测周期。

严禁：

伪造历史记录。

严禁：

自动创建多个 Event。

====================

迁移流程：

检测旧表是否存在。

如果存在：

读取全部 lastTimeRecords。

转换。

开启 Dexie transaction。

写入：

items
events

迁移成功后：

写入 meta：

migrationVersion = 1

不要立即删除旧表。

====================

迁移必须具备：

幂等性。

如果 migrationVersion >= 1：

不要再次迁移。

====================

迁移完成后进行验证：

旧记录数量
=
新 Item 数量

有 lastDate 的旧记录数量
=
新 Event 数量

如果不一致：

rollback。

====================

建立：

src/services/migrationService.js

以及：

migrationService.test.js
```

***

# Prompt 14：PWA + GitHub Pages + 最终测试

```text
现在进行 LastTime v1.0 最终工程化。

====================
PWA
====================

配置：

vite-plugin-pwa

要求：

App Name：

LastTime

Short Name：

LastTime

Description：

个人周期性事务记录工具

支持：

离线访问
安装到 iPhone 主屏幕
Service Worker
Web App Manifest

====================
GitHub Pages
====================

项目：

last-time

使用：

HashRouter

确保：

https://用户名.github.io/last-time/

能够正常运行。

配置：

base：

/last-time/

====================
iPhone
====================

重点测试：

375 × 667
390 × 844
430 × 932

检查：

Safe Area
底部导航
FAB
键盘
Bottom Sheet
页面滚动
弹窗
日期选择
输入框
深色模式

====================
功能测试
====================

新增 Item
编辑 Item
删除 Item

创建 Event
修改 Event
删除 Event

今天做了
重复点击今天做了

周期计算：

每天
每周
每两周
每月
每季度
每半年
每年
自定义

Status：

NO_RECORD
NO_CYCLE
NORMAL
UPCOMING
DUE_TODAY
OVERDUE

搜索：

名称
分类
备注

排序：

最需要关注
最近记录
最久没记录
最近修改

备份：

导出
导入

旧数据：

迁移

====================
最终要求
====================

运行：

npm run build

必须成功。

检查：

没有 console error
没有 React warning
没有 broken route
没有 undefined 数据
没有重复 Event

====================
性能要求
====================

首页不要一次性进行大量重复 IndexedDB 查询。

尽可能：

一次读取
Service 层计算 ViewModel
React 渲染 ViewModel。

====================
最终输出
====================

1. 项目目录树
2. 所有核心模块说明
3. 数据库 Schema
4. 路由表
5. Service API
6. PWA 配置
7. GitHub Pages 部署方法
8. 测试结果
9. 当前已知问题
10. 后续可扩展功能

注意：

不要在 v1.0 中偷偷加入：

AI
云同步
账号
登录
社交
标签
系统通知
日历同步
后端
第三方 API
复杂统计
```

***

# 3. 推荐开发顺序

不要把 14 个 Prompt 一次性全部交给 Cursor。

推荐：

```text
Prompt 01
项目初始化
    ↓
Prompt 02
Dexie Schema
    ↓
Prompt 03
日期工具
    ↓
Prompt 04
Service
    ↓
Prompt 05
ViewModel + Status
    ↓
Prompt 06
App Shell
    ↓
Prompt 07
首页
    ↓
Prompt 08
全部
    ↓
Prompt 09
新增/编辑
    ↓
Prompt 10
详情/历史
    ↓
Prompt 11
通用组件
    ↓
Prompt 12
备份恢复
    ↓
Prompt 13
数据迁移
    ↓
Prompt 14
PWA + 测试 + GitHub Pages
```

***

# 4. 每个阶段的验收原则

## 第一阶段：数据层

完成 Prompt 01～05 后，应达到：

```text
数据库
  ↓
Item
  ↓
Event
  ↓
Latest Event
  ↓
Cycle
  ↓
Next Date
  ↓
Status
```

这条链路完整可运行。

重点检查：

- IndexedDB 正常
- 日期计算正确
- Event 可以新增/修改/删除
- 今天不能重复记录
- NextDate 动态计算
- Status 动态计算
- UI 尚未与数据库耦合

***

## 第二阶段：UI

完成 Prompt 06～11 后，应达到：

```text
首页
├── 搜索
├── 需要关注
├── 最近记录
└── FAB

全部
├── 搜索
├── 排序
└── Item List

详情
├── 最后一次
├── 状态
├── 今天做了
├── 下一次
├── 周期
├── 历史
└── 统计

设置
└── 数据管理
```

核心操作形成闭环：

```text
打开 App
   ↓
发现需要关注
   ↓
点击“今天做了”
   ↓
生成 Event
   ↓
更新 LatestEvent
   ↓
重新计算 NextDate
   ↓
重新计算 Status
```

***

## 第三阶段：工程化

完成 Prompt 12～14 后：

```text
LastTime v1.0
      │
      ├── 本地数据库
      ├── 数据备份
      ├── 数据恢复
      ├── 旧数据迁移
      ├── PWA
      ├── 离线
      └── GitHub Pages
```

***

# 5. 最重要的数据库设计原则

整个项目必须坚持：

```text
Item = 我关注什么

Event = 它什么时候真实发生过

Cycle = 我认为多久应该发生一次

LatestEvent = 最近一次真实发生

NextDate = 根据 LatestEvent + Cycle 推导

Status = 根据 NextDate + Today 推导

Statistics = 根据 Events 推导
```

因此数据库中**永远不要保存**：

```text
lastDate
nextDate
status
statistics
```

正确的数据关系：

```text
Category
    │
    └── 1 : N
          │
        Item
          │
          └── 1 : N
                │
              Event
```

***

# 6. 为什么采用 Item + Event 模型

旧版本：

```text
Item
 └── lastDate
```

只能回答：

> 上一次是什么时候？

v1.0：

```text
Item
 ├── Cycle
 └── Events
      ├── Event 1
      ├── Event 2
      ├── Event 3
      └── Event N
```

因此可以进一步回答：

- 上一次是什么时候？
- 一共记录过多少次？
- 平均多久发生一次？
- 最长间隔是多少？
- 最短间隔是多少？
- 下一次什么时候可能发生？
- 当前是否已经过期？
- 用户真实习惯周期是什么？

这也是 LastTime 后续扩展能力的基础。

***

# 7. v1.0 明确不做什么

为了避免 Vibe Coding 过程中产品不断膨胀，v1.0 明确不实现：

- AI
- 云同步
- 登录
- 用户账号
- 社交
- 协作
- 标签系统
- 系统级推送通知
- 日历同步
- 后端
- 第三方 API
- 复杂统计
- 数据大屏
- 多设备实时同步

这些功能可以作为 v2.0 或后续版本规划。

***

# 8. 核心开发纪律

在整个开发过程中，必须遵守：

### 原则 1：先数据，后 UI

```text
Schema
→ Service
→ ViewModel
→ UI
```

### 原则 2：UI 不直接操作数据库

错误：

```text
Component
   ↓
Dexie
```

正确：

```text
Component
   ↓
Service
   ↓
Dexie
```

### 原则 3：派生数据不落库

错误：

```text
Item.lastDate
Item.nextDate
Item.status
```

正确：

```text
Events
  ↓
ViewModel
  ↓
lastDate
nextDate
status
```

### 原则 4：日期统一处理

所有日期逻辑统一进入：

```text
src/utils/date.js
```

禁止各个组件自行计算日期。

### 原则 5：先保证功能正确，再优化视觉

第一阶段重点：

```text
正确
稳定
可迁移
可恢复
```

第二阶段才是：

```text
动画
视觉
细节
```

***

# 9. 最终产品核心闭环

LastTime v1.0 最终应该形成一个非常简单的使用循环：

```text
        ┌──────────────┐
        │   打开 LastTime │
        └──────┬───────┘
               ↓
        ┌──────────────┐
        │ 需要关注什么？ │
        └──────┬───────┘
               ↓
        ┌──────────────┐
        │ 选择一个事项   │
        └──────┬───────┘
               ↓
        ┌──────────────┐
        │  今天做了     │
        └──────┬───────┘
               ↓
        ┌──────────────┐
        │ 创建 Event    │
        └──────┬───────┘
               ↓
        ┌──────────────┐
        │重新计算周期    │
        └──────┬───────┘
               ↓
        ┌──────────────┐
        │重新计算状态    │
        └──────┬───────┘
               ↓
        ┌──────────────┐
        │等待下一次关注  │
        └──────────────┘
```

***

# 10. V1.0 完成标准

当以下条件全部满足时，可以认为 LastTime v1.0 基本完成：

- [ ] 项目可以正常启动
- [ ] Dexie 数据库正常
- [ ] 默认分类正常
- [ ] Item CRUD 正常
- [ ] Event CRUD 正常
- [ ] 今天做了正常
- [ ] 同一天不能重复 Event
- [ ] 日期计算正确
- [ ] 周期计算正确
- [ ] Status 正确
- [ ] 首页需要关注正常
- [ ] 全部列表正常
- [ ] 搜索正常
- [ ] 排序正常
- [ ] 详情页正常
- [ ] 历史记录正常
- [ ] 统计正常
- [ ] 删除事务正常
- [ ] JSON 导出正常
- [ ] JSON 导入正常
- [ ] 旧数据迁移正常
- [ ] PWA 正常
- [ ] iPhone Safari 正常
- [ ] GitHub Pages 正常
- [ ] `npm run build` 成功
- [ ] 无明显 Console Error
- [ ] 无明显 React Warning

***

## 11. 后续版本方向

完成 v1.0 后，再考虑：

### v1.1

- 更智能的周期推荐
- 更好的历史统计
- 批量操作
- 更丰富的排序
- 更完善的设置

### v2.0

- 智能周期
- 自然语言快速记录
- AI 辅助分类
- AI 周期建议
- 日历集成
- 系统提醒

### 更长期

```text
Local First
    ↓
可选云同步
    ↓
多设备
    ↓
智能助手
```

但这些都不应该影响 v1.0 的核心架构。

***

# 12. 最终开发建议

不要一次性把整个项目交给 AI。

推荐实际操作：

```text
Cursor
  ↓
Prompt 01
  ↓
检查
  ↓
Prompt 02
  ↓
检查
  ↓
Prompt 03
  ↓
测试
  ↓
Prompt 04
  ↓
测试
  ↓
……
  ↓
Prompt 14
  ↓
最终验收
```

尤其是第一阶段：

> **Prompt 01 → Prompt 05**

必须先把：

**数据库 → 日期 → Service → ViewModel → Status**

跑通。

然后再：

**Prompt 06 → Prompt 11**

完成 UI。

最后：

**Prompt 12 → Prompt 14**

完成备份、迁移、PWA 和 GitHub Pages。

***

## LastTime v1.0 一句话架构

> **用 Event 记录事实，用 Cycle 描述习惯，用 ViewModel 推导状态，用 PWA
> 提供随时可用的个人工具。**

