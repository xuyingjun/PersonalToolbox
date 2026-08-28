export default function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="empty-state">
      <span className="empty-icon" aria-hidden="true">
        <Icon size={24} strokeWidth={1.8} />
      </span>
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  )
}
