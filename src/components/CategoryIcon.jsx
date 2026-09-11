import { BriefcaseBusiness, CarFront, CircleEllipsis, GraduationCap, HeartPulse, House, Laptop, Tag, Utensils } from 'lucide-react'

const CATEGORY_ICONS = {
  生活: Utensils,
  家庭: House,
  健康: HeartPulse,
  汽车: CarFront,
  工作: BriefcaseBusiness,
  学习: GraduationCap,
  数码: Laptop,
  其他: CircleEllipsis,
}

export default function CategoryIcon({ name, size = 18 }) {
  const Icon = CATEGORY_ICONS[name] ?? Tag
  return <Icon aria-hidden="true" size={size} strokeWidth={1.9} />
}