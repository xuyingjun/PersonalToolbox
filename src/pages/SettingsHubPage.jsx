import { Link } from 'react-router-dom'
import { Bell, ChevronRight, DatabaseBackup, Info, Tags } from '../components/ui/AppIcon.jsx'
import { useLiveData } from '../hooks/useLiveData.js'
import { getSettingsOverview } from '../services/settingsOverviewService.js'

const menuGroups = [
  {
    title: '基础管理',
    items: [
      { to: '/settings/categories', icon: Tags, label: '分类管理', description: '名称、图标与排序', countKey: 'categoryCount', unit: '个分类' },
      { to: '/settings/reminders', icon: Bell, label: '关注范围', description: '设置提前关注的天数' },
    ],
  },
  {
    title: '数据与系统',
    items: [
      { to: '/settings/backup', icon: DatabaseBackup, label: '数据备份与恢复', description: '导出、导入与旧版迁移' },
      { to: '/settings/about', icon: Info, label: '关于拾光', description: '版本、安装与资源更新' },
    ],
  },
]

export default function SettingsHubPage() {
  const { data: overview, error } = useLiveData(getSettingsOverview, null, {
    itemCount: 0,
    eventCount: 0,
    categoryCount: 0,
  })

  return (
    <div className="page settings-page settings-hub">
      <h1 className="settings-heading">我的</h1>

      <section className="settings-hero">
        <img src={`${import.meta.env.BASE_URL}pwa-192x192.png`} alt="拾光应用图标" />
        <div className="settings-hero-copy">
          <h2>拾光</h2>
          <p>拾起每一次，记得下一次。</p>
        </div>
        <div className="settings-summary" aria-label="数据概览">
          <div><strong>{overview.itemCount}</strong><span>事项</span></div>
          <div><strong>{overview.eventCount}</strong><span>记录</span></div>
          <div><strong>{overview.categoryCount}</strong><span>分类</span></div>
        </div>
      </section>

      {error && <p className="settings-message" role="alert">数据概览读取失败，请重新打开应用。</p>}

      {menuGroups.map((group) => (
        <section className="settings-group" key={group.title}>
          <h2>{group.title}</h2>
          <div className="settings-menu">
            {group.items.map(({ to, icon: Icon, label, description, countKey, unit }) => (
              <Link className="settings-menu-row" to={to} key={to}>
                <span className="settings-menu-icon"><Icon size={20} /></span>
                <span className="settings-menu-copy">
                  <strong>{label}</strong>
                  <small>{countKey ? `${overview[countKey]} ${unit}` : description}</small>
                </span>
                <ChevronRight aria-hidden="true" size={18} />
              </Link>
            ))}
          </div>
        </section>
      ))}

      <p className="settings-footnote">所有数据仅保存在当前设备。</p>
    </div>
  )
}