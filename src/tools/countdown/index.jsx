import { CalendarClock } from 'lucide-react'
import ToolPage from '../../components/layout/ToolPage.jsx'

export default function CountdownTool() {
  return <ToolPage name="倒计时" description="记住重要日期与剩余天数。" icon={CalendarClock} />
}
