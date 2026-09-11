import Modal from './ui/Modal.jsx'

// 统一删除确认弹窗。
export default function DeleteConfirmDialog({ title = '删除确认', message, confirmLabel = '删除', busy = false, onConfirm, onClose }) {
  return (
    <Modal title={title} dismissible={!busy} onClose={onClose}>
      <p className="dialog-message">{message}</p>
      <div className="action-stack">
        <button className="danger-button" type="button" disabled={busy} onClick={onConfirm}>
          {busy ? '处理中…' : confirmLabel}
        </button>
        <button className="secondary-button" type="button" disabled={busy} onClick={onClose}>取消</button>
      </div>
    </Modal>
  )
}
