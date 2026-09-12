import Modal from './ui/Modal.jsx'

// 导入前确认：覆盖当前数据。
export default function ImportConfirmDialog({ backup, busy = false, onConfirm, onExport, onClose }) {
  const exportedAt = new Intl.DateTimeFormat('zh-CN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(backup.exportedAt))

  return (
    <Modal title="导入数据" dismissible={!busy} onClose={onClose}>
      <p className="dialog-message">导入后将覆盖当前“拾光”数据，请确认文件内容。</p>
      <dl className="import-summary">
        <div><dt>备份时间</dt><dd>{exportedAt}</dd></div>
        <div><dt>事项</dt><dd>{backup.items.length} 项</dd></div>
        <div><dt>记录</dt><dd>{backup.events.length} 条</dd></div>
        <div><dt>分类</dt><dd>{backup.categories.length} 个</dd></div>
      </dl>
      <div className="action-stack">
        <button className="secondary-button" type="button" disabled={busy} onClick={onExport}>先备份当前数据</button>
        <button className="danger-button" type="button" disabled={busy} onClick={onConfirm}>
          {busy ? '导入中…' : '确认导入'}
        </button>
        <button className="secondary-button" type="button" disabled={busy} onClick={onClose}>取消</button>
      </div>
    </Modal>
  )
}
