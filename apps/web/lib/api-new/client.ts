const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/v1'

class ApiClient {
  private token: string | null = null
  setToken(t: string) { this.token = t; if(typeof window!=='undefined') localStorage.setItem('vf_token',t) }
  clearToken() { this.token = null; if(typeof window!=='undefined') localStorage.removeItem('vf_token') }
  loadToken() { if(typeof window!=='undefined') this.token = localStorage.getItem('vf_token') }

  private async request<T>(path: string, opts: RequestInit = {}): Promise<T> {
    this.loadToken()
    const headers: Record<string,string> = {
      'Content-Type': 'application/json',
      ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
      ...(opts.headers as Record<string,string> || {}),
    }
    const res = await fetch(`${BASE}${path}`, { ...opts, headers })
    const json = await res.json()
    if (!res.ok) throw new Error(json?.error?.message || 'Xatolik yuz berdi')
    return json
  }

  get  = <T>(path: string) => this.request<T>(path)
  post = <T>(path: string, body: unknown) => this.request<T>(path, { method:'POST', body: JSON.stringify(body) })
  put  = <T>(path: string, body: unknown) => this.request<T>(path, { method:'PUT',  body: JSON.stringify(body) })
}

export const api = new ApiClient()
