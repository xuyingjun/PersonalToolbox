import { Search, X } from './ui/AppIcon.jsx'

export default function SearchBar({ value, onChange, placeholder = '搜索名称、分类或备注', ariaLabel = '搜索事项' }) {
  return (
    <label className="search-box">
      <Search aria-hidden="true" size={20} />
      <span className="sr-only">{ariaLabel}</span>
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
      {value && (
        <button type="button" aria-label="清除搜索" onClick={() => onChange('')}>
          <X size={18} />
        </button>
      )}
    </label>
  )
}
