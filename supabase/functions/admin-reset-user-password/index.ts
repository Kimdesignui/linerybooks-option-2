import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const json = (body: Record<string, unknown>, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (request.method !== 'POST') return json({ error: 'METHOD_NOT_ALLOWED' }, 405)

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  const authorization = request.headers.get('Authorization')
  if (!supabaseUrl || !anonKey || !serviceRoleKey || !authorization) return json({ error: 'UNAUTHORIZED' }, 401)

  const callerClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authorization } } })
  const serviceClient = createClient(supabaseUrl, serviceRoleKey)
  const { data: authData, error: authError } = await callerClient.auth.getUser()
  if (authError || !authData.user) return json({ error: 'UNAUTHORIZED' }, 401)

  const { data: callerAdmin } = await serviceClient.from('admin_users').select('user_id, role').eq('user_id', authData.user.id).maybeSingle()
  if (!callerAdmin || callerAdmin.role !== 'super_admin') return json({ error: 'SUPER_ADMIN_REQUIRED' }, 403)

  const body = await request.json().catch(() => ({})) as { userId?: string; password?: string }
  const userId = String(body.userId ?? '').trim()
  const password = String(body.password ?? '')
  if (!/^[0-9a-f-]{36}$/i.test(userId)) return json({ error: 'USER_ID_INVALID' }, 400)
  if (password.length < 8) return json({ error: 'PASSWORD_TOO_SHORT' }, 400)
  const { data: targetAdmin } = await serviceClient.from('admin_users').select('user_id').eq('user_id', userId).maybeSingle()
  if (!targetAdmin) return json({ error: 'ADMIN_USER_NOT_FOUND' }, 404)
  const { error: updateError } = await serviceClient.auth.admin.updateUserById(userId, { password })
  if (updateError) return json({ error: updateError.message }, 400)
  return json({ success: true })
})
