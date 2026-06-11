import { api } from './client'
import type { ApiResponse, FitnessPlan, FoodLog, ProgressPhoto, GymMember, RetentionStats, LeaderboardEntry, UzbekFood } from '@/types'

export const authApi = {
  login: (email: string, password: string) =>
    api.post<ApiResponse<{access_token:string;refresh_token:string;user_id:string}>>('/auth/login',{email,password}),
  register: (data:{email:string;password:string;full_name:string;role:string}) =>
    api.post<ApiResponse<null>>('/auth/register', data),
}
export const userApi = {
  me:     () => api.get<ApiResponse<{id:string;full_name:string;role:string;gym_id:string}>>('/users/me'),
  update: (data: Record<string,string>) => api.put<ApiResponse<null>>('/users/me', data),
}
export const planApi = {
  current:  () => api.get<ApiResponse<FitnessPlan>>('/plans/current'),
  history:  () => api.get<ApiResponse<FitnessPlan[]>>('/plans/history'),
  generate: () => api.post<ApiResponse<FitnessPlan>>('/plans/generate', {}),
}
export const foodApi = {
  log:    (data: Partial<FoodLog>) => api.post<ApiResponse<{id:string}>>('/food/log', data),
  getDay: (date?: string) => api.get<ApiResponse<FoodLog[]>>(`/food/log${date?`?date=${date}`:''}`),
  search: (q: string) => api.get<ApiResponse<UzbekFood[]>>(`/food/search?q=${encodeURIComponent(q)}`),
  parse:  (text: string) => api.post<ApiResponse<{food_name:string;quantity_g:number;calories?:number}>>('/food/parse',{text}),
}
export const photoApi = {
  history: () => api.get<ApiResponse<ProgressPhoto[]>>('/photos/history'),
  upload: async (file: File, photo_type = 'front') => {
    const fd = new FormData(); fd.append('file',file); fd.append('photo_type',photo_type)
    const token = typeof window!=='undefined' ? localStorage.getItem('vf_token') : ''
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/photos/upload`,{
      method:'POST', headers:{Authorization:`Bearer ${token}`}, body: fd
    })
    return res.json()
  },
}
export const gymApi = {
  members:   () => api.get<ApiResponse<GymMember[]>>('/gym/members'),
  retention: () => api.get<ApiResponse<RetentionStats>>('/gym/analytics/retention'),
  churnRisk: () => api.get<ApiResponse<{user:GymMember;streak:any}[]>>('/gym/analytics/churn-risk'),
}
export const leaderboardApi = {
  gym: () => api.get<ApiResponse<LeaderboardEntry[]>>('/leaderboard/gym'),
}
export async function* streamChat(messages:{role:string;content:string}[], token: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai/chat`,{
    method:'POST',
    headers:{'Content-Type':'application/json', Authorization:`Bearer ${token}`},
    body: JSON.stringify({messages}),
  })
  const reader = res.body!.getReader(); const decoder = new TextDecoder()
  while(true) {
    const {done,value} = await reader.read(); if(done) break
    for(const line of decoder.decode(value).split('\n').filter(l=>l.startsWith('data: '))) {
      const d = line.slice(6); if(d==='[DONE]') return
      try { const p=JSON.parse(d); if(p.text) yield p.text as string } catch {}
    }
  }
}
