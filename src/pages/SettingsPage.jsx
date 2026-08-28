import { Database, Info, MonitorSmartphone, Palette } from 'lucide-react'

const groups = [
  { icon: Palette, title: '外观', detail: '跟随系统' },
  { icon: Database, title: '数据', detail: '导入、导出与清空' },
  { icon: MonitorSmartphone, title: '应用', detail: 'PWA 安装状态' },
  { icon: Info, title: '关于', detail: '版本 0.1.0' },
]

export default function SettingsPage() {
  return (
    <div className="page simple-page">
      <header className="page-header">
        <p>本机优先</p>
        <h1>设置</h1>
      </header>
      <div className="settings-list">
        {groups.map(({ icon: Icon, title, detail }) => (
          <section className="settings-row" key={title}>
            <span className="settings-icon" aria-hidden="true"><Icon size={20} /></span>
            <div>
              <h2>{title}</h2>
              <p>{detail}</p>
            </div>
            <span className="phase-badge">待接入</span>
          </section>
        ))}
      </div>
      <p className="storage-note">数据将仅保存在此设备。重要内容需要定期导出备份。</p>
    </div>
  )
}
