// app/dashboard/page.tsx
import UserDashboardClient from './UserDashboardClient'

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Dein Dashboard</h1>
      <UserDashboardClient />
    </div>
  )
}
