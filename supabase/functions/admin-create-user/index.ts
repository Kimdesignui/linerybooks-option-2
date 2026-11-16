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
  if (!callerAdmin) return json({ error: 'PERMISSION_REQUIRED:admin_users.manage' }, 403)
  const { data: callerPermission } = await serviceClient.from('admin_role_permissions').select('permission_key').eq('role_key', callerAdmin.role).eq('permission_key', 'admin_users.manage').maybeSingle()
  if (!callerPermission) return json({ error: 'PERMISSION_REQUIRED:admin_users.manage' }, 403)

  const body = await request.json().catch(() => ({})) as { email?: string; password?: string; role?: string }
  const email = String(body.email ?? '').trim().toLowerCase()
  const password = String(body.password ?? '')
  const role = String(body.role ?? 'editor').trim().toLowerCase()
  if (!email || !email.includes('@')) return json({ error: 'EMAIL_REQUIRED' }, 400)
  if (password.length < 8) return json({ error: 'PASSWORD_TOO_SHORT' }, 400)
  if (!['super_admin', 'system_admin', 'sales_staff', 'editor'].includes(role)) return json({ error: 'INVALID_ADMIN_ROLE' }, 400)
  if (role === 'super_admin' && callerAdmin.role !== 'super_admin') return json({ error: 'SUPER_ADMIN_REQUIRED' }, 403)

  const { data: created, error: createError } = await serviceClient.auth.admin.createUser({ email, password, email_confirm: true })
  if (createError || !created.user) return json({ error: createError?.message ?? 'AUTH_USER_CREATE_FAILED' }, 400)

  const { data: adminRow, error: grantError } = await serviceClient.from('admin_users').insert({ user_id: created.user.id, role }).select('user_id, role, created_at').single()
  if (grantError || !adminRow) {
    await serviceClient.auth.admin.deleteUser(created.user.id)
    return json({ error: grantError?.message ?? 'ADMIN_GRANT_FAILED' }, 400)
  }
  const { data: roleRow } = await serviceClient.from('admin_roles').select('name').eq('role_key', role).single()
  return json({ user: { user_id: adminRow.user_id, email, role: adminRow.role, role_name: roleRow?.name ?? role, created_at: adminRow.created_at } })
})
