import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { planApi, foodApi, photoApi } from '../api/endpoints'

export function useMemberDashboard() {
  const qc = useQueryClient()
  const plan    = useQuery({ queryKey: ['plan','current'],  queryFn: () => planApi.current(),  staleTime: 600_000, retry: false })
  const today   = useQuery({ queryKey: ['food','today'],    queryFn: () => foodApi.getDay(),   staleTime: 30_000 })
  const photos  = useQuery({ queryKey: ['photos'],          queryFn: () => photoApi.history(), staleTime: 300_000 })

  const generatePlan = useMutation({
    mutationFn: () => planApi.generate(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['plan'] }),
  })
  const logFood = useMutation({
    mutationFn: foodApi.log,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['food'] }),
  })
  return { plan, today, photos, generatePlan, logFood }
}
