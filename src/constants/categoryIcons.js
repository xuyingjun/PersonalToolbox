export const DEFAULT_CATEGORY_ICONS = {
  生活: '🍽️',
  家庭: '🏠',
  健康: '❤️',
  汽车: '🚗',
  工作: '💼',
  学习: '📖',
  数码: '💻',
  其他: '📌',
}

// 🏷️ 是服务层与 UI 的默认图标（见 categoryService.createCategory 的默认参数），必须包含在合法选项中
export const CATEGORY_ICON_OPTIONS = ['🏷️', '🍽️', '🏠', '❤️', '🚗', '💼', '📖', '💻', '📌', '🧹', '🩺', '✈️', '🎯']

export function getCategoryIcon(name, icon) {
  return icon || DEFAULT_CATEGORY_ICONS[name] || '🏷️'
}
