import { getCategoryIcon } from '../constants/categoryIcons.js'

export default function CategoryIcon({ name, icon }) {
  return <span className="category-emoji" aria-hidden="true">{getCategoryIcon(name, icon)}</span>
}