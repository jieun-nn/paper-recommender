import { createClient, SupabaseClient } from '@supabase/supabase-js'

function getUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
}

function getAnonKey() {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
}

let _client: SupabaseClient | null = null

/** 클라이언트 사이드 / API Routes에서 사용 (읽기 전용) — 호출 시점에 초기화 */
export function getSupabaseClient(): SupabaseClient {
  if (!_client) {
    _client = createClient(getUrl(), getAnonKey())
  }
  return _client
}

/** API Routes에서 supabase.from(...) 형태로 사용할 수 있는 proxy */
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseClient()
    const value = client[prop as keyof SupabaseClient]
    return typeof value === 'function' ? (value as Function).bind(client) : value
  },
})

/** 서버 사이드 전용 (쓰기 작업: 논문 저장, 요약 저장) */
export function getServiceClient(): SupabaseClient {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set')
  return createClient(getUrl(), serviceKey, {
    auth: { persistSession: false },
  })
}
