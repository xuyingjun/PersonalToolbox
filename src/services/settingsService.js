import { db } from '../db/db.js'

export const THEME_KEY = 'theme'
export const DEFAULT_THEME = 'system'
export const VALID_THEMES = ['system', 'light', 'dark']

export const UPCOMING_THRESHOLD_KEY = 'upcomingThreshold'

export async function getSetting(key, fallbackValue = null) {
  const setting = await db.settings.get(key)
  return setting?.value ?? fallbackValue
}

export async function setSetting(key, value) {
  await db.settings.put({ key, value })
  return value
}
