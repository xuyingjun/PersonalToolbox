import { db } from '../db/db.js'
import {
  MAX_UPCOMING_THRESHOLD,
  MIN_UPCOMING_THRESHOLD,
  THEME_KEY,
  UPCOMING_THRESHOLD_KEY,
  VALID_THEMES,
} from '../constants/settings.js'

export {
  DEFAULT_THEME,
  DEFAULT_UPCOMING_THRESHOLD,
  MAX_UPCOMING_THRESHOLD,
  MIN_UPCOMING_THRESHOLD,
  THEME_KEY,
  UPCOMING_THRESHOLD_KEY,
  VALID_THEMES,
} from '../constants/settings.js'

export function validateSetting(key, value) {
  if (key === THEME_KEY) {
    if (!VALID_THEMES.includes(value)) throw new Error('主题设置格式不正确。')
    return value
  }
  if (key === UPCOMING_THRESHOLD_KEY) {
    if (!Number.isInteger(value) || value < MIN_UPCOMING_THRESHOLD || value > MAX_UPCOMING_THRESHOLD) {
      throw new Error(`关注范围必须是 ${MIN_UPCOMING_THRESHOLD}–${MAX_UPCOMING_THRESHOLD} 天。`)
    }
    return value
  }
  throw new Error('不支持的设置项。')
}

export async function getSetting(key, fallbackValue = null) {
  const setting = await db.settings.get(key)
  if (!setting) return fallbackValue
  try {
    return validateSetting(key, setting.value)
  } catch {
    return fallbackValue
  }
}

export async function setSetting(key, value) {
  const validated = validateSetting(key, value)
  await db.settings.put({ key, value: validated })
  return validated
}
