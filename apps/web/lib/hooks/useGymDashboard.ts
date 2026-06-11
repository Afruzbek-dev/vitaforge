import { useQuery } from '@tanstack/react-query'
import { gymApi, leaderboardApi } from '../api/endpoints'

export function useGymDashboard() {
  const members   = useQuery({ queryKey: ['gym','members'],   queryFn: () => gymApi.members(),   staleTime: 60_000 })
  const retention = useQuery({ queryKey: ['gym','retention'], queryFn: () => gymApi.retention(), staleTime: 300_000 })
  const churnRisk = useQuery({ queryKey: ['gym','churn'],     queryFn: () => gymApi.churnRisk(), staleTime: 300_000 })
  const leaderboard = useQuery({ queryKey: ['leaderboard'],   queryFn: () => leaderboardApi.gym(), staleTime: 60_000 })
  return { members, retention, churnRisk, leaderboard }
}
