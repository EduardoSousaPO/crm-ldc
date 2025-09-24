'use client'

import { useContext } from 'react'
import { AdminDashboard } from '@/components/AdminDashboard'
import { ConsultorDashboard } from '@/components/ConsultorDashboard'
import { DashboardContext } from './layout'

export default function DashboardPage() {
  const { userProfile } = useContext(DashboardContext)

  return (
    <div className="px-6 py-6">
      {userProfile?.role === 'admin' ? (
        <AdminDashboard currentUser={userProfile} />
      ) : userProfile ? (
        <ConsultorDashboard currentUser={userProfile} />
      ) : null}
    </div>
  )
}