import { useState } from 'react'
import { CYCLE_LABELS, CYCLE_TYPES } from '../db/schema.js'
import Modal from './ui/Modal.jsx'

const CUSTOM_MAX = 3650

// 周期选择 Bottom Sheet：预设点击即选中关闭；自定义展开天数输入。
export default function CycleSelector({ value = 'none', customValue = null, onSelect, onClose }) {
  const [showCustom, setShowCustom] = useState(value === 'custom')
  const [customDays, setCustomDays] = useState(customValue ?? '')
  const [customError, setCustomError] = useState('')

  function handlePreset(type) {
    if (type === 'custom') {
      setShowCustom(true)
      return
    }
    onSelect({ cycleType: type, cycleValue: null })
  }

  function confirmCustom() {
    const days = Number(customDays)
    if (!Number.isInteger(days) || days <= 0 || days > CUSTOM_MAX) {
      setCustomError(`请输入 1–${CUSTOM_MAX} 之间的天数。`)
      return
    }
    onSelect({ cycleType: 'custom', cycleValue: days })
  }

  return (
    <Modal title="周期" onClose={onClose}>
      <div className="cycle-options">
        {CYCLE_TYPES.map((type) => (
          <button
            className={`cycle-option${value === type && !showCustom ? ' is-selected' : ''}`}
            key={type}
            type="button"
            onClick={() => handlePreset(type)}
          >
            <span>{CYCLE_LABELS[type]}</span>
          </button>
        ))}
        {showCustom && (
          <div className="cycle-custom">
            <label>
              周期天数
              <input
                type="number"
                inputMode="numeric"
                min="1"
                max={CUSTOM_MAX}
                value={customDays}
                placeholder="例如：30"
                onChange={(event) => {
                  setCustomDays(event.target.value)
                  setCustomError('')
                }}
              />
            </label>
            {customError && <p className="form-error">{customError}</p>}
            <button className="primary-button" type="button" onClick={confirmCustom}>确定</button>
          </div>
        )}
      </div>
    </Modal>
  )
}
