import { useEffect, useId, useRef } from 'react'
import { X } from './AppIcon.jsx'

export default function Modal({ title, onClose, children, dismissible = true }) {
  const dialogRef = useRef(null)
  const onCloseRef = useRef(onClose)
  const dismissibleRef = useRef(dismissible)
  const titleId = useId()

  useEffect(() => {
    onCloseRef.current = onClose
    dismissibleRef.current = dismissible
  }, [dismissible, onClose])

  useEffect(() => {
    const previousFocus = document.activeElement
    const previousOverflow = document.body.style.overflow
    const dialog = dialogRef.current
    document.body.style.overflow = 'hidden'
    dialog?.querySelector('input, textarea, select, button, a[href]')?.focus()

    function handleKeyDown(event) {
      if (event.key === 'Escape' && dismissibleRef.current) onCloseRef.current()
      if (event.key !== 'Tab' || !dialog) return
      const focusable = [...dialog.querySelectorAll('input, textarea, select, button, a[href]')]
        .filter((element) => !element.disabled)
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      previousFocus?.focus()
    }
  }, [])

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={dismissible ? onClose : undefined}>
      <section
        ref={dialogRef}
        className="modal-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="modal-header">
          <h2 id={titleId}>{title}</h2>
          <button className="icon-button" type="button" disabled={!dismissible} onClick={onClose} aria-label="关闭">
            <X size={21} />
          </button>
        </header>
        <div className="modal-content">{children}</div>
      </section>
    </div>
  )
}
