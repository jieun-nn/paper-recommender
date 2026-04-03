import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// 현재 유저 인증 확인 (anon key 클라이언트로)
async function getAuthUser(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) return null
  const token = authHeader.slice(7)

  const anonClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data: { user }, error } = await anonClient.auth.getUser(token)
  if (error || !user) return null
  return user
}

// GET /api/user/profile — 내 프로필 조회
export async function GET(req: NextRequest) {
  const user = await getAuthUser(req)
  if (!user) return NextResponse.json({ data: null }, { status: 401 })

  const { data, error } = await getServiceClient()
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

// POST /api/user/profile — 프로필 생성/업데이트 (upsert)
export async function POST(req: NextRequest) {
  const user = await getAuthUser(req)
  if (!user) return NextResponse.json({ data: null }, { status: 401 })

  const body = await req.json()
  const { degree_level, department, sub_field, field_label, use_dept_recs, onboarding_done } = body

  const { data, error } = await getServiceClient()
    .from('user_profiles')
    .upsert({
      id: user.id,
      degree_level,
      department,
      sub_field: sub_field ?? null,
      field_label: field_label ?? null,
      use_dept_recs: use_dept_recs ?? false,
      onboarding_done: onboarding_done ?? false,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}
