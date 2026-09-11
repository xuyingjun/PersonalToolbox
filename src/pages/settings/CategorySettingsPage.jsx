import { useState } from 'react'
import CategoryIcon from '../../components/CategoryIcon.jsx'
import DeleteConfirmDialog from '../../components/DeleteConfirmDialog.jsx'
import PageHeader from '../../components/layout/PageHeader.jsx'
import { ArrowDown, ArrowUp, Check, Plus, Trash2 } from '../../components/ui/AppIcon.jsx'
import { CATEGORY_ICON_OPTIONS, getCategoryIcon } from '../../constants/categoryIcons.js'
import { useLiveData } from '../../hooks/useLiveData.js'
import {
  createCategory,
  deleteCategory,
  getAllCategories,
  getCategoryUsageCounts,
  moveCategory,
  updateCategory,
} from '../../services/categoryService.js'

export default function CategorySettingsPage() {
  const { data: categories, error: categoriesError } = useLiveData(() => getAllCategories(), null, [])
  const { data: usageCounts, error: usageError } = useLiveData(() => getCategoryUsageCounts(), null, {})
  const [newCategory, setNewCategory] = useState('')
  const [newIcon, setNewIcon] = useState('🏷️')
  const [editingId, setEditingId] = useState(null)
  const [editingName, setEditingName] = useState('')
  const [editingIcon, setEditingIcon] = useState('🏷️')
  const [deletingCategory, setDeletingCategory] = useState(null)
  const [message, setMessage] = useState('')

  async function handleAddCategory() {
    try {
      await createCategory(newCategory, newIcon)
      setNewCategory('')
      setNewIcon('🏷️')
      setMessage('分类已添加。')
    } catch (error) {
      setMessage(error.message)
    }
  }

  async function handleSaveCategory(id) {
    try {
      await updateCategory(id, editingName, editingIcon)
      setEditingId(null)
      setMessage('分类已更新。')
    } catch (error) {
      setMessage(error.message)
    }
  }

  async function handleDeleteCategory() {
    try {
      await deleteCategory(deletingCategory.id)
      setDeletingCategory(null)
      setMessage('分类已删除。')
    } catch (error) {
      setMessage(error.message)
      setDeletingCategory(null)
    }
  }

  async function handleMove(id, direction) {
    try {
      await moveCategory(id, direction)
    } catch (error) {
      setMessage(error.message || '排序失败，请重试。')
    }
  }

  return (
    <div className="settings-subpage">
      <PageHeader title="分类管理" />
      <main className="settings-subpage-content">
        {(categoriesError || usageError) && <p className="settings-message" role="alert">分类数据读取失败，请重新打开页面。</p>}
        <div className="category-list settings-list-card">
          {categories.map((category, index) => (
            <div className="category-row category-manage-row" key={category.id}>
              {editingId === category.id ? (
                <select className="category-icon-select" value={editingIcon} aria-label="分类图标" onChange={(event) => setEditingIcon(event.target.value)}>
                  {CATEGORY_ICON_OPTIONS.map((icon) => <option value={icon} key={icon}>{icon}</option>)}
                </select>
              ) : (
                <span className="category-icon"><CategoryIcon name={category.name} icon={category.icon} /></span>
              )}
              {editingId === category.id ? (
                <>
                  <input type="text" value={editingName} maxLength={20} onChange={(event) => setEditingName(event.target.value)} />
                  <button className="icon-button" type="button" aria-label="保存分类名" onClick={() => handleSaveCategory(category.id)}><Check size={18} /></button>
                </>
              ) : (
                <>
                  <button className="category-copy" type="button" onClick={() => { setEditingId(category.id); setEditingName(category.name); setEditingIcon(getCategoryIcon(category.name, category.icon)) }}>
                    <strong>{category.name}</strong>
                    <small>{usageCounts[category.id] ? `使用中 · ${usageCounts[category.id]} 个事项` : '未使用'}</small>
                  </button>
                  <div className="category-actions">
                    <button className="icon-button" type="button" disabled={index === 0} aria-label={`${category.name} 上移`} onClick={() => handleMove(category.id, 'up')}><ArrowUp size={18} /></button>
                    <button className="icon-button" type="button" disabled={index === categories.length - 1} aria-label={`${category.name} 下移`} onClick={() => handleMove(category.id, 'down')}><ArrowDown size={18} /></button>
                    <button className="icon-button" type="button" aria-label={`删除 ${category.name}`} onClick={() => setDeletingCategory(category)}><Trash2 size={18} /></button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        <div className="add-category settings-list-card">
          <select className="category-icon-select" value={newIcon} aria-label="新分类图标" onChange={(event) => setNewIcon(event.target.value)}>
            {CATEGORY_ICON_OPTIONS.map((icon) => <option value={icon} key={icon}>{icon}</option>)}
          </select>
          <input type="text" value={newCategory} maxLength={20} placeholder="新分类名称" onChange={(event) => setNewCategory(event.target.value)} />
          <button className="secondary-button" type="button" onClick={handleAddCategory}><Plus size={17} />添加</button>
        </div>
        <p className="settings-footnote">点击分类名称可编辑；修改后相关事项会自动更新。使用中的分类不能删除。</p>
        {message && <p className="settings-message" role="status">{message}</p>}
      </main>

      {deletingCategory && (
        <DeleteConfirmDialog title="删除分类" message={`确定删除分类“${deletingCategory.name}”吗？`} onConfirm={handleDeleteCategory} onClose={() => setDeletingCategory(null)} />
      )}
    </div>
  )
}