import { useEffect, useRef, useState } from 'react'

// Pointer Events 实现的拖拽排序（零依赖；iOS Safari 通过 pointer capture + touch-action:none 支持）。
// count：列表长度（钳制目标下标）
// disabled：禁止开始新拖拽（例如上一次拖拽的持久化尚未完成时）
// onReorder(id, targetIndex)：拖动过程中实时调整本地顺序（视觉反馈）
// onDrop(id, targetIndex)：松手时持久化（targetIndex 相对拖动开始前的原始顺序）
export function useDragReorder({ count, onReorder, onDrop, disabled = false }) {
  const [draggingId, setDraggingId] = useState(null)
  const dragRef = useRef(null)

  // 拖动期间禁用文本选择，防止长按/拖拽触发系统选择菜单
  useEffect(() => {
    document.body.classList.toggle('is-drag-sorting', draggingId !== null)
    return () => document.body.classList.remove('is-drag-sorting')
  }, [draggingId])

  function finishDrag(event) {
    const drag = dragRef.current
    if (!drag || event.pointerId !== drag.pointerId) return
    try { event.currentTarget.releasePointerCapture(event.pointerId) } catch { /* 已释放 */ }
    const { id, startIndex, currentIndex } = drag
    dragRef.current = null
    setDraggingId(null)
    if (currentIndex !== startIndex) onDrop?.(id, currentIndex)
  }

  function getHandleProps(index, id) {
    return {
      className: `drag-handle${draggingId === id ? ' is-dragging' : ''}`,
      type: 'button',
      tabIndex: 0,
      'aria-label': '拖动调整顺序',
      onPointerDown: (event) => {
        if (disabled || dragRef.current) return
        if (event.pointerType === 'mouse' && event.button !== 0) return
        const row = event.currentTarget.closest('.category-row')
        if (!row) return
        event.currentTarget.setPointerCapture(event.pointerId)
        // 用相邻行 offsetTop 差值估算步长，行间距也计入（offsetParent 同为列表容器）
        const nextRow = row.nextElementSibling
        dragRef.current = {
          pointerId: event.pointerId,
          startY: event.clientY,
          startIndex: index,
          currentIndex: index,
          step: nextRow ? nextRow.offsetTop - row.offsetTop : row.getBoundingClientRect().height,
          id,
        }
        setDraggingId(id)
      },
      onPointerMove: (event) => {
        const drag = dragRef.current
        if (!drag || event.pointerId !== drag.pointerId) return
        const delta = event.clientY - drag.startY
        const target = Math.max(0, Math.min(drag.startIndex + Math.round(delta / drag.step), count - 1))
        if (target !== drag.currentIndex) {
          drag.currentIndex = target
          onReorder?.(drag.id, target)
        }
      },
      onPointerUp: finishDrag,
      onPointerCancel: finishDrag,
    }
  }

  return { draggingId, getHandleProps }
}
