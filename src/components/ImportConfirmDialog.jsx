import Modal from './ui/Modal.jsx'

// 导入前确认：覆盖当前数据。
export default function ImportConfirmDialog({ busy = false, onConfirm, onClose }) {
  return (
    <Modal title="导入数据" onClose={onClose}>
      <p className="dialog-message">导入后将覆盖当前 LastTime 数据。</p>
      <div className="action-stack">
        <button className="danger-button" type="button" disabled={busy} onClick={onConfirm}>
          {busy ? '导入中…' : '确认导入'}
        </button>
        <button className="secondary-button" type="button" onClick={onClose}>取消</button>
      </div>
    </Modal>
  )
}
