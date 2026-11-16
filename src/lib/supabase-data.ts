import { supabase, supabaseConfig } from './supabase'
import localCreatorImageMap from '../data/creator-image-map.json'

export type SupabaseCatalogSnapshot = {
  books: number
  creators: number
  taxonomyTerms: number
  homepageModules: number
}

export type PublicCatalogProduct = {
  id: string
  isbn: string
  slug: string
  title: string
  image: string
  gallery: string[]
  author: string
  translators: string[]
  illustrators: string[]
  price: string
  categories: string[]
  publisher: string
  writerType: 'Authors' | 'Translators'
  year?: number
  available: boolean
  inventoryQuantity: number
  reservedInventoryQuantity: number
  moduleSlugs: string[]
  moduleSortOrders?: Record<string, number>
  samplePdfUrl?: string
  samplePdfPageCount?: number
  description: string
  coverPriceUsd: number | null
  comparePriceVnd: number | null
  pageCount: number | null
  bookSize: string
  publicationDate: string
  weight: string
  format: string
  line: string
  imprint: string
  languages: string[]
  genres: string[]
  topics: string[]
}

export type PublicCreatorProfile = {
  name: string
  slug: string
  roles: Array<'author' | 'translator' | 'illustrator'>
  images: string[]
  born: string
  died: string
  awards: string[]
  academicTitle: string[]
  bio: string
}

export type PublicNewsPost = {
  image: string
  title: string
  titleVi: string
  date: string
  kicker: string
  slug: string
  excerpt: string
  excerptVi: string
  body: string[]
  bodyVi: string[]
  contentType: 'news' | 'emagazine'
  byline: string
  blocks: PublicNewsBlock[]
  blocksVi: PublicNewsBlock[]
  isFeatured?: boolean
  showOnHomepage?: boolean
  isPublished?: boolean
  displayFormat?: 'standard' | 'video'
  seoTitle?: string
  seoTitleVi?: string
  seoDescription?: string
  seoDescriptionVi?: string
  seoKeywords?: string[]
  categorySlugs?: string[]
}

export type AdminNewsPost = PublicNewsPost & {
  id: string
  status: string
}

export type PublicNewsBlock = {
  id: string
  type: 'paragraph' | 'heading' | 'image' | 'quote'
  content: string
  image: string
  alt: string
  caption: string
  fullBleed: boolean
  width?: number
  height?: number
}

export type NewsPostWritePayload = {
  slug: string
  contentType: 'news' | 'emagazine'
  title: string
  titleVi: string
  kicker?: string
  kickerVi?: string
  excerpt?: string
  excerptVi?: string
  body?: string[]
  bodyVi?: string[]
  image?: string
  byline?: string
  blocks?: Array<Omit<PublicNewsBlock, 'id'>>
  blocksVi?: Array<Omit<PublicNewsBlock, 'id'>>
  seoTitle?: string
  seoTitleVi?: string
  seoDescription?: string
  seoDescriptionVi?: string
  seoKeywords?: string[]
  categorySlugs?: string[]
  isFeatured?: boolean
  showOnHomepage?: boolean
  displayFormat?: 'standard' | 'video'
  isPublished?: boolean
}

export type CreatorWritePayload = {
  displayName: string
  slug: string
  roles?: Array<'author' | 'translator' | 'illustrator'>
  birthYear?: number
  deathYear?: number
  awards?: string
  academicTitle?: string
  bioHtml?: string
  isActive?: boolean
}

export type RemoteCartItem = {
  id: string
  bookId: string
  quantity: number
  unitPriceVnd: number
}

export type RemoteOrderInput = {
  fulfillmentMethod: 'pickup' | 'delivery'
  paymentMethod: string
  shippingAddress: Record<string, string>
  deliveryNotes?: string
  guestEmail?: string
  promotionCode?: string
}

export type PublicMenuItem = {
  id: string
  menuKey: string
  parentId: string | null
  label: string
  href: string
  itemType: string
  sortOrder: number
}

export type PublicBanner = {
  id: string
  name: string
  positionCode: string
  publicUrl: string
  sortOrder: number
  displayMode: string
}

export type PublicSiteSettings = Record<string, Record<string, unknown>>

export type PublicStoreLocation = { id: string; code: string; name: string; address: string; city: string }
export type PublicDeliveryZone = { id: string; name: string; feeVnd: number }

export type AdminOrderRow = {
  id: string
  orderNumber: string
  status: string
  paymentStatus: string
  totalVnd: number
  createdAt: string
  customer: string
  itemCount: number
}

export type AdminTopBookRow = { title: string; quantity: number; revenueVnd: number }

export type AdminDashboardSummary = {
  bookCount: number
  orderCount: number
  creatorCount: number
  newsCount: number
  recentOrders: AdminOrderRow[]
}

export type AdminCustomerRow = {
  id: string
  name: string
  email: string
  phone: string
  orderCount: number
  createdAt: string
}

export type AdminCreatorRow = {
  id: string
  name: string
  slug: string
  roles: Array<'author' | 'translator' | 'illustrator'>
  bookCount: number
  status: 'Đang hoạt động' | 'Tạm ẩn'
  image: string
  bio: string
  awards?: string
  academicTitle?: string
  birthYear?: number | null
  deathYear?: number | null
}

export type AdminInventoryRow = {
  id: string
  title: string
  isbn: string
  inventoryQuantity: number
  reservedQuantity: number
  availableQuantity: number
  salePriceVnd: number
}

export type AdminReviewRow = {
  id: string
  reader: string
  book: string
  rating: number
  title: string
  body: string
  date: string
  status: 'pending' | 'approved' | 'rejected'
}

export type AdminMenuItemRow = {
  id: string
  menuKey: string
  label: string
  href: string
  sortOrder: number
  isActive: boolean
}

export type AdminPromotionRow = {
  id: string
  code: string
  name: string
  description: string
  discountType: 'percent' | 'fixed'
  discountValue: number
  minimumOrderValue: number
  startsAt: string
  endsAt: string
  usageLimit: number | null
  usageCount: number
  isActive: boolean
}

export type AccountOrderItemRow = {
  title: string
  quantity: number
  lineTotalVnd: number
}

export type AccountOrderRow = {
  id: string
  orderNumber: string
  status: string
  paymentStatus: string
  totalVnd: number
  subtotalVnd: number
  discountVnd: number
  deliveryFeeVnd: number
  createdAt: string
  itemCount: number
  items: AccountOrderItemRow[]
}

export type AccountProfileRow = {
  id: string
  displayName: string
  email: string
  phone: string
  defaultAddress: Record<string, string>
}

export type AccountTransactionRow = {
  id: string
  orderNumber: string
  provider: string
  providerTransactionId: string
  amountVnd: number
  status: string
  paidAt: string
  createdAt: string
}

export type AdminBookInput = {
  isbn: string
  title: string
  slug: string
  descriptionHtml?: string
  coverPriceUsd?: number | null
  salePriceVnd: number
  comparePriceVnd?: number | null
  pageCount?: number | null
  bookSize?: string
  publicationDate?: string
  weight?: string
  inventoryQuantity?: number
  isVisibleWebsite: boolean
  authors?: string[]
  translators?: string[]
  illustrators?: string[]
  categories?: string[]
  genres?: string[]
  topics?: string[]
  formats?: string[]
  lines?: string[]
  publishers?: string[]
  imprints?: string[]
  languages?: string[]
  homepageModules?: string[]
  sampleFile?: File | null
  samplePageCount?: number | null
}

export type AdminTaxonomyKind = 'category' | 'topic' | 'format' | 'line' | 'genre' | 'publisher' | 'imprint' | 'language'
export type AdminTaxonomyRow = { id: string; name: string; slug: string; kind: AdminTaxonomyKind; parentId: string | null; sortOrder: number; isActive: boolean }
export type AdminHomepageModuleRow = { id: string; name: string; slug: string; sortOrder: number; isActive: boolean; bookCount: number }
export type AdminPaymentMethodRow = { id: string; code: string; name: string; description: string; provider: string; logoStoragePath: string; sortOrder: number; isActive: boolean }
export type AdminSiteSettingRow = { id: string; settingKey: string; language: 'en' | 'vi' | 'all'; valueJson: Record<string, unknown>; isPublic: boolean; updatedAt: string }
export type AdminRoleKey = 'super_admin' | 'system_admin' | 'sales_staff' | 'editor'
export type AdminUserRow = { userId: string; email: string; role: AdminRoleKey; roleName: string; createdAt: string }
export type AdminRoleRow = { roleKey: AdminRoleKey; name: string; description: string; sortOrder: number }
export type AdminPermissionRow = { roleKey: AdminRoleKey; roleName: string; permissionKey: string; permissionName: string; groupName: string; description: string; sortOrder: number }
export type AdminAccess = { roleKey: AdminRoleKey; roleName: string; permissions: string[] }
export type AdminMediaAssetRow = { id: string; storagePath: string; publicUrl: string; fileName: string; mimeType: string; sizeBytes: number; altText: string; assetType: string; isActive: boolean; createdAt: string }
export type AdminStoreLocationRow = { id: string; code: string; name: string; locationType: string; address: string; city: string; sortOrder: number; isActive: boolean }
export type AdminDeliveryZoneRow = { id: string; name: string; level: string; feeVnd: number; sortOrder: number; isActive: boolean }
export type AdminChatbotPromptRow = { id: string; prompt: string; language: 'en' | 'vi'; sortOrder: number; isActive: boolean }
export type AdminImportBatchRow = { id: string; fileName: string; importedBy: string; totalRows: number; validRows: number; errorRows: number; status: string; createdAt: string }
export type AdminNotificationRow = { id: string; title: string; message: string; eventType: string; actionHref: string; readAt: string | null; createdAt: string }

const mapAdminTaxonomyRow = (row: Record<string, unknown>): AdminTaxonomyRow => ({
  id: String(row.id),
  name: String(row.name ?? ''),
  slug: String(row.slug ?? ''),
  kind: String(row.kind ?? 'category') as AdminTaxonomyKind,
  parentId: row.parent_id ? String(row.parent_id) : null,
  sortOrder: Number(row.sort_order ?? 0),
  isActive: Boolean(row.is_active),
})

export async function loadAdminTaxonomy(kinds?: AdminTaxonomyKind[]): Promise<AdminTaxonomyRow[]> {
  if (!supabase) return []
  let request = supabase.from('taxonomy_terms').select('id,name,slug,kind,parent_id,sort_order,is_active').order('sort_order', { ascending: true }).order('name', { ascending: true })
  if (kinds?.length) request = request.in('kind', kinds)
  const { data, error } = await request
  if (error) throw error
  return ((data ?? []) as Array<Record<string, unknown>>).map(mapAdminTaxonomyRow)
}

export async function createAdminTaxonomyTerm(input: { name: string; slug: string; kind: AdminTaxonomyKind; parentId?: string | null; sortOrder?: number }): Promise<AdminTaxonomyRow> {
  if (!supabase) throw new Error('Supabase chưa được cấu hình.')
  const name = input.name.trim()
  const slug = input.slug.trim()
  if (!name || !slug) throw new Error('Tên và đường dẫn dữ liệu phân loại không được để trống.')
  const { data, error } = await supabase.from('taxonomy_terms').insert({ name, slug, kind: input.kind, parent_id: input.parentId || null, sort_order: input.sortOrder ?? 0, is_active: true }).select('id,name,slug,kind,parent_id,sort_order,is_active').single()
  if (error) throw error
  return mapAdminTaxonomyRow(data as Record<string, unknown>)
}

export async function updateAdminTaxonomyTerm(id: string, input: { name?: string; slug?: string; parentId?: string | null; sortOrder?: number; isActive?: boolean }): Promise<void> {
  if (!supabase) throw new Error('Supabase chưa được cấu hình.')
  const { error } = await supabase.from('taxonomy_terms').update({ ...(input.name === undefined ? {} : { name: input.name.trim() }), ...(input.slug === undefined ? {} : { slug: input.slug.trim() }), ...(input.parentId === undefined ? {} : { parent_id: input.parentId }), ...(input.sortOrder === undefined ? {} : { sort_order: input.sortOrder }), ...(input.isActive === undefined ? {} : { is_active: input.isActive }) }).eq('id', id)
  if (error) throw error
}

export async function deleteAdminTaxonomyTerm(id: string): Promise<void> {
  if (!supabase) throw new Error('Supabase chưa được cấu hình.')
  const { error } = await supabase.from('taxonomy_terms').delete().eq('id', id)
  if (error) throw error
}

const mapAdminHomepageModuleRow = (row: Record<string, unknown>): AdminHomepageModuleRow => ({
  id: String(row.id),
  name: String(row.name ?? ''),
  slug: String(row.slug ?? ''),
  sortOrder: Number(row.sort_order ?? 0),
  isActive: Boolean(row.is_active),
  bookCount: Array.isArray(row.book_homepage_modules) ? row.book_homepage_modules.length : Number(row.book_count ?? 0),
})

export async function loadAdminHomepageModules(): Promise<AdminHomepageModuleRow[]> {
  if (!supabase) return []
  const { data, error } = await supabase.from('homepage_modules').select('id,name,slug,sort_order,is_active,book_homepage_modules(book_id)').order('sort_order', { ascending: true })
  if (error) throw error
  return ((data ?? []) as Array<Record<string, unknown>>).map(mapAdminHomepageModuleRow)
}

export async function ensureAdminHomepageModuleBooks(limit = 24): Promise<void> {
  if (!supabase) throw new Error('Supabase chưa được cấu hình.')
  const client = supabase
  const [modules, books, links] = await Promise.all([
    client.from('homepage_modules').select('id,slug').eq('is_active', true).order('sort_order', { ascending: true }),
    client.from('books').select('id,created_at,publication_date,sale_price_vnd,inventory_quantity,reserved_inventory_quantity').eq('status', 'active').eq('is_visible_website', true).order('created_at', { ascending: false }),
    client.from('book_homepage_modules').select('book_id,module_id'),
  ])
  const readError = modules.error ?? books.error ?? links.error
  if (readError) throw readError
  const moduleRows = (modules.data ?? []) as Array<{ id: string; slug: string }>
  const bookRows = (books.data ?? []) as Array<{ id: string; created_at: string; publication_date: string | null; sale_price_vnd: number | null; inventory_quantity: number | null; reserved_inventory_quantity: number | null }>
  const existing = new Set(((links.data ?? []) as Array<{ book_id: string; module_id: string }>).map((row) => `${row.book_id}:${row.module_id}`))
  const missing: Array<{ book_id: string; module_id: string; sort_order: number }> = []
  for (const module of moduleRows) {
    const ordered = [...bookRows].sort((left, right) => {
      const leftAvailable = Number(left.inventory_quantity ?? 0) > Number(left.reserved_inventory_quantity ?? 0) ? 0 : 1
      const rightAvailable = Number(right.inventory_quantity ?? 0) > Number(right.reserved_inventory_quantity ?? 0) ? 0 : 1
      if (module.slug === 'grab-save' && leftAvailable !== rightAvailable) return leftAvailable - rightAvailable
      if (module.slug === 'new-upcoming') {
        const publicationDifference = (right.publication_date ? Date.parse(right.publication_date) : 0) - (left.publication_date ? Date.parse(left.publication_date) : 0)
        if (publicationDifference !== 0) return publicationDifference
      }
      if (module.slug === 'grab-save') {
        const priceDifference = Number(left.sale_price_vnd ?? 0) - Number(right.sale_price_vnd ?? 0)
        if (priceDifference !== 0) return priceDifference
      }
      return Date.parse(right.created_at) - Date.parse(left.created_at) || left.id.localeCompare(right.id)
    }).slice(0, limit)
    ordered.forEach((book, index) => {
      const key = `${book.id}:${module.id}`
      if (!existing.has(key)) missing.push({ book_id: book.id, module_id: module.id, sort_order: index + 1 })
    })
  }
  const { error: rpcError } = await client.rpc('admin_assign_homepage_module_books', { p_limit: limit })
  if (!rpcError) return
  if (missing.length) {
    const { error } = await client.from('book_homepage_modules').upsert(missing, { onConflict: 'book_id,module_id', ignoreDuplicates: true })
    if (error) throw error
  }

  // Fallback (phương án dự phòng): keeps the admin flow usable while an older
  // project still has the previous RPC definition. The SQL migration remains
  // the authoritative atomic backend path; this only repairs the same rows
  // through the admin RLS policy when the RPC is unavailable.
  const { data: currentLinks, error: currentLinksError } = await client.from('book_homepage_modules').select('book_id,module_id,sort_order')
  if (currentLinksError) throw currentLinksError
  const linksByModule = new Map<string, Array<{ book_id: string; module_id: string; sort_order: number }>>()
  for (const row of (currentLinks ?? []) as Array<{ book_id: string; module_id: string; sort_order: number }>) {
    const rows = linksByModule.get(row.module_id) ?? []
    rows.push({ ...row, sort_order: Number(row.sort_order ?? 0) })
    linksByModule.set(row.module_id, rows)
  }
  for (const module of moduleRows) {
    const orderedLinks = (linksByModule.get(module.id) ?? []).sort((left, right) => left.sort_order - right.sort_order || left.book_id.localeCompare(right.book_id))
    const retained = orderedLinks.slice(0, limit)
    const removed = orderedLinks.slice(limit)
    const deleteResults = await Promise.all(removed.map((row) => client.from('book_homepage_modules').delete().eq('book_id', row.book_id).eq('module_id', row.module_id)))
    const deleteError = deleteResults.find((result) => result.error)?.error
    if (deleteError) throw deleteError
    const temporaryResults = await Promise.all(retained.map((row, index) => client.from('book_homepage_modules').update({ sort_order: 1000000 + index + 1 }).eq('book_id', row.book_id).eq('module_id', row.module_id)))
    const temporaryError = temporaryResults.find((result) => result.error)?.error
    if (temporaryError) throw temporaryError
    const finalResults = await Promise.all(retained.map((row, index) => client.from('book_homepage_modules').update({ sort_order: index + 1 }).eq('book_id', row.book_id).eq('module_id', row.module_id)))
    const finalError = finalResults.find((result) => result.error)?.error
    if (finalError) throw finalError
  }
}

export async function createAdminHomepageModule(input: { name: string; slug: string; sortOrder?: number }): Promise<AdminHomepageModuleRow> {
  if (!supabase) throw new Error('Supabase chưa được cấu hình.')
  const { data, error } = await supabase.from('homepage_modules').insert({ name: input.name.trim(), slug: input.slug.trim(), sort_order: input.sortOrder ?? 0, is_active: true }).select('id,name,slug,sort_order,is_active').single()
  if (error) throw error
  return mapAdminHomepageModuleRow(data as Record<string, unknown>)
}

export async function updateAdminHomepageModule(id: string, input: { name?: string; slug?: string; sortOrder?: number; isActive?: boolean }): Promise<void> {
  if (!supabase) throw new Error('Supabase chưa được cấu hình.')
  const { error } = await supabase.from('homepage_modules').update({ ...(input.name === undefined ? {} : { name: input.name.trim() }), ...(input.slug === undefined ? {} : { slug: input.slug.trim() }), ...(input.sortOrder === undefined ? {} : { sort_order: input.sortOrder }), ...(input.isActive === undefined ? {} : { is_active: input.isActive }) }).eq('id', id)
  if (error) throw error
}

export async function deleteAdminHomepageModule(id: string): Promise<void> {
  if (!supabase) throw new Error('Supabase chưa được cấu hình.')
  const { error } = await supabase.from('homepage_modules').delete().eq('id', id)
  if (error) throw error
}

const mapAdminPaymentMethodRow = (row: Record<string, unknown>): AdminPaymentMethodRow => ({
  id: String(row.id),
  code: String(row.code ?? ''),
  name: String(row.name ?? ''),
  description: String(row.description ?? ''),
  provider: String(row.provider ?? ''),
  logoStoragePath: String(row.logo_storage_path ?? ''),
  sortOrder: Number(row.sort_order ?? 0),
  isActive: Boolean(row.is_active),
})

export async function loadAdminPaymentMethods(): Promise<AdminPaymentMethodRow[]> {
  if (!supabase) return []
  const { data, error } = await supabase.from('payment_methods').select('id,code,name,description,provider,logo_storage_path,sort_order,is_active').order('sort_order', { ascending: true }).order('name', { ascending: true })
  if (error) throw error
  return ((data ?? []) as Array<Record<string, unknown>>).map(mapAdminPaymentMethodRow)
}

export async function createAdminPaymentMethod(input: { code: string; name: string; description?: string; provider?: string; sortOrder?: number; isActive?: boolean }): Promise<AdminPaymentMethodRow> {
  if (!supabase) throw new Error('Supabase chưa được cấu hình.')
  const { data, error } = await supabase.from('payment_methods').insert({ code: input.code.trim().toLowerCase(), name: input.name.trim(), description: input.description?.trim() || null, provider: input.provider?.trim() || null, sort_order: input.sortOrder ?? 0, is_active: input.isActive ?? false }).select('id,code,name,description,provider,logo_storage_path,sort_order,is_active').single()
  if (error) throw error
  return mapAdminPaymentMethodRow(data as Record<string, unknown>)
}

export async function updateAdminPaymentMethod(id: string, input: { name?: string; description?: string; provider?: string; sortOrder?: number; isActive?: boolean }): Promise<void> {
  if (!supabase) throw new Error('Supabase chưa được cấu hình.')
  const { error } = await supabase.from('payment_methods').update({ ...(input.name === undefined ? {} : { name: input.name.trim() }), ...(input.description === undefined ? {} : { description: input.description.trim() || null }), ...(input.provider === undefined ? {} : { provider: input.provider.trim() || null }), ...(input.sortOrder === undefined ? {} : { sort_order: input.sortOrder }), ...(input.isActive === undefined ? {} : { is_active: input.isActive }) }).eq('id', id)
  if (error) throw error
}

export async function deleteAdminPaymentMethod(id: string): Promise<void> {
  if (!supabase) throw new Error('Supabase chưa được cấu hình.')
  const { error } = await supabase.from('payment_methods').delete().eq('id', id)
  if (error) throw error
}

const mapAdminSiteSettingRow = (row: Record<string, unknown>): AdminSiteSettingRow => ({
  id: String(row.id),
  settingKey: String(row.setting_key ?? ''),
  language: String(row.language ?? 'all') as AdminSiteSettingRow['language'],
  valueJson: row.value_json && typeof row.value_json === 'object' ? row.value_json as Record<string, unknown> : {},
  isPublic: Boolean(row.is_public),
  updatedAt: String(row.updated_at ?? ''),
})

export async function loadAdminSiteSettings(): Promise<AdminSiteSettingRow[]> {
  if (!supabase) return []
  const { data, error } = await supabase.from('site_settings').select('id,setting_key,language,value_json,is_public,updated_at').order('setting_key', { ascending: true }).order('language', { ascending: true })
  if (error) throw error
  return ((data ?? []) as Array<Record<string, unknown>>).map(mapAdminSiteSettingRow)
}

export async function upsertAdminSiteSetting(input: { settingKey: string; language: AdminSiteSettingRow['language']; valueJson: Record<string, unknown>; isPublic: boolean }): Promise<void> {
  if (!supabase) throw new Error('Supabase chưa được cấu hình.')
  const { error } = await supabase.from('site_settings').upsert({ setting_key: input.settingKey.trim(), language: input.language, value_json: input.valueJson, is_public: input.isPublic, updated_at: new Date().toISOString() }, { onConflict: 'setting_key,language' })
  if (error) throw error
}

export async function deleteAdminSiteSetting(id: string): Promise<void> {
  if (!supabase) throw new Error('Supabase chưa được cấu hình.')
  const { error } = await supabase.from('site_settings').delete().eq('id', id)
  if (error) throw error
}

const mapAdminUserRow = (row: Record<string, unknown>): AdminUserRow => ({
  userId: String(row.user_id ?? ''),
  email: String(row.email ?? ''),
  role: String(row.role ?? 'editor') as AdminRoleKey,
  roleName: String(row.role_name ?? row.role ?? 'editor'),
  createdAt: String(row.created_at ?? ''),
})

const mapAdminRoleRow = (row: Record<string, unknown>): AdminRoleRow => ({
  roleKey: String(row.role_key ?? 'editor') as AdminRoleKey,
  name: String(row.name ?? ''),
  description: String(row.description ?? ''),
  sortOrder: Number(row.sort_order ?? 0),
})

const mapAdminPermissionRow = (row: Record<string, unknown>): AdminPermissionRow => ({
  roleKey: String(row.role_key ?? 'editor') as AdminRoleKey,
  roleName: String(row.role_name ?? ''),
  permissionKey: String(row.permission_key ?? ''),
  permissionName: String(row.permission_name ?? ''),
  groupName: String(row.group_name ?? ''),
  description: String(row.permission_description ?? ''),
  sortOrder: Number(row.sort_order ?? 0),
})

export async function loadAdminUsers(): Promise<AdminUserRow[]> {
  if (!supabase) return []
  const { data, error } = await supabase.rpc('admin_list_admin_users')
  if (error) throw error
  return ((data ?? []) as Array<Record<string, unknown>>).map(mapAdminUserRow)
}

export async function loadAdminRoles(): Promise<AdminRoleRow[]> {
  if (!supabase) return []
  const { data, error } = await supabase.rpc('admin_list_admin_roles')
  if (error) throw error
  return ((data ?? []) as Array<Record<string, unknown>>).map(mapAdminRoleRow)
}

export async function loadAdminPermissionMatrix(): Promise<AdminPermissionRow[]> {
  if (!supabase) return []
  const { data, error } = await supabase.rpc('admin_list_role_permissions')
  if (error) throw error
  return ((data ?? []) as Array<Record<string, unknown>>).map(mapAdminPermissionRow)
}

export async function setAdminRolePermission(role: AdminRoleKey, permissionKey: string, enabled: boolean): Promise<void> {
  if (!supabase) throw new Error('Supabase chưa được cấu hình.')
  const { error } = await supabase.rpc('admin_set_role_permission', { p_role: role, p_permission_key: permissionKey, p_enabled: enabled })
  if (error) throw error
}

export async function createAdminUser(email: string, password: string, role: AdminRoleKey): Promise<AdminUserRow> {
  if (!supabase) throw new Error('Supabase chưa được cấu hình.')
  const { data, error } = await supabase.functions.invoke('admin-create-user', { body: { email: email.trim(), password, role } })
  if (error) throw error
  if (!data?.user) throw new Error('Không nhận được tài khoản quản trị sau khi tạo.')
  return mapAdminUserRow(data.user as Record<string, unknown>)
}

export async function loadMyAdminAccess(): Promise<AdminAccess | null> {
  if (!supabase) return null
  const { data, error } = await supabase.rpc('admin_get_my_access')
  if (error) throw error
  const row = Array.isArray(data) ? data[0] : data
  if (!row) return null
  const record = row as Record<string, unknown>
  return { roleKey: String(record.role_key ?? 'editor') as AdminRoleKey, roleName: String(record.role_name ?? ''), permissions: Array.isArray(record.permissions) ? record.permissions.map(String) : [] }
}

export async function grantAdminUser(email: string, role: AdminRoleKey): Promise<AdminUserRow> {
  if (!supabase) throw new Error('Supabase chưa được cấu hình.')
  const { data, error } = await supabase.rpc('admin_grant_admin', { p_email: email.trim(), p_role: role })
  if (error) throw error
  const row = Array.isArray(data) ? data[0] : data
  if (!row) throw new Error('Không nhận được bản ghi quản trị viên sau khi cấp quyền.')
  return mapAdminUserRow(row as Record<string, unknown>)
}

export async function setAdminUserRole(userId: string, role: AdminRoleKey): Promise<AdminUserRow> {
  if (!supabase) throw new Error('Supabase chưa được cấu hình.')
  const { data, error } = await supabase.rpc('admin_set_admin_role', { p_user_id: userId, p_role: role })
  if (error) throw error
  const row = Array.isArray(data) ? data[0] : data
  if (!row) throw new Error('Không nhận được bản ghi sau khi đổi vai trò.')
  return mapAdminUserRow(row as Record<string, unknown>)
}

export async function revokeAdminUser(userId: string): Promise<void> {
  if (!supabase) throw new Error('Supabase chưa được cấu hình.')
  const { error } = await supabase.rpc('admin_revoke_admin', { p_user_id: userId })
  if (error) throw error
}

const mapAdminMediaAssetRow = (row: Record<string, unknown>): AdminMediaAssetRow => ({
  id: String(row.id),
  storagePath: String(row.storage_path ?? ''),
  publicUrl: String(row.public_url ?? ''),
  fileName: String(row.file_name ?? ''),
  mimeType: String(row.mime_type ?? ''),
  sizeBytes: Number(row.size_bytes ?? 0),
  altText: String(row.alt_text ?? ''),
  assetType: String(row.asset_type ?? 'other'),
  isActive: Boolean(row.is_active),
  createdAt: String(row.created_at ?? ''),
})

export async function loadAdminMediaAssets(): Promise<AdminMediaAssetRow[]> {
  if (!supabase) return []
  const { data, error } = await supabase.from('site_media_assets').select('id,storage_path,public_url,file_name,mime_type,size_bytes,alt_text,asset_type,is_active,created_at').order('created_at', { ascending: false })
  if (error) throw error
  return ((data ?? []) as Array<Record<string, unknown>>).map(mapAdminMediaAssetRow)
}

export async function createAdminMediaAsset(file: File, assetType: string, altText: string): Promise<AdminMediaAssetRow> {
  if (!supabase) throw new Error('Supabase chưa được cấu hình.')
  const safeName = file.name.toLowerCase().replace(/[^a-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '') || 'asset'
  const storagePath = `media/${Date.now()}-${safeName}`
  const upload = await supabase.storage.from('site-media').upload(storagePath, file, { contentType: file.type, upsert: false })
  if (upload.error) throw upload.error
  const publicUrl = supabase.storage.from('site-media').getPublicUrl(storagePath).data.publicUrl
  const { data, error } = await supabase.from('site_media_assets').insert({ storage_path: storagePath, public_url: publicUrl, file_name: file.name, mime_type: file.type, size_bytes: file.size, alt_text: altText.trim() || null, asset_type: assetType.trim() || 'other', is_active: true }).select('id,storage_path,public_url,file_name,mime_type,size_bytes,alt_text,asset_type,is_active,created_at').single()
  if (error) {
    await supabase.storage.from('site-media').remove([storagePath])
    throw error
  }
  return mapAdminMediaAssetRow(data as Record<string, unknown>)
}

export async function updateAdminMediaAsset(id: string, input: { altText?: string; assetType?: string; isActive?: boolean }): Promise<void> {
  if (!supabase) throw new Error('Supabase chưa được cấu hình.')
  const { error } = await supabase.from('site_media_assets').update({ ...(input.altText === undefined ? {} : { alt_text: input.altText.trim() || null }), ...(input.assetType === undefined ? {} : { asset_type: input.assetType.trim() || 'other' }), ...(input.isActive === undefined ? {} : { is_active: input.isActive }) }).eq('id', id)
  if (error) throw error
}

export async function deleteAdminMediaAsset(row: AdminMediaAssetRow): Promise<void> {
  if (!supabase) throw new Error('Supabase chưa được cấu hình.')
  const storage = await supabase.storage.from('site-media').remove([row.storagePath])
  if (storage.error) throw storage.error
  const { error } = await supabase.from('site_media_assets').delete().eq('id', row.id)
  if (error) throw error
}

const mapAdminStoreLocationRow = (row: Record<string, unknown>): AdminStoreLocationRow => ({ id: String(row.id), code: String(row.code ?? ''), name: String(row.name ?? ''), locationType: String(row.location_type ?? 'store'), address: String(row.address ?? ''), city: String(row.city ?? ''), sortOrder: Number(row.sort_order ?? 0), isActive: Boolean(row.is_active) })
export async function loadAdminStoreLocations(): Promise<AdminStoreLocationRow[]> { if (!supabase) return []; const { data, error } = await supabase.from('store_locations').select('id,code,name,location_type,address,city,sort_order,is_active').order('sort_order'); if (error) throw error; return ((data ?? []) as Array<Record<string, unknown>>).map(mapAdminStoreLocationRow) }
export async function createAdminStoreLocation(input: { code: string; name: string; locationType: string; address: string; city: string; sortOrder?: number }): Promise<void> { if (!supabase) throw new Error('Supabase chưa được cấu hình.'); const { error } = await supabase.from('store_locations').insert({ code: input.code.trim().toUpperCase(), name: input.name.trim(), location_type: input.locationType.trim() || 'store', address: input.address.trim() || null, city: input.city.trim() || null, sort_order: input.sortOrder ?? 0, is_active: true }); if (error) throw error }
export async function updateAdminStoreLocation(id: string, input: { name?: string; locationType?: string; address?: string; city?: string; sortOrder?: number; isActive?: boolean }): Promise<void> { if (!supabase) throw new Error('Supabase chưa được cấu hình.'); const { error } = await supabase.from('store_locations').update({ ...(input.name === undefined ? {} : { name: input.name.trim() }), ...(input.locationType === undefined ? {} : { location_type: input.locationType.trim() }), ...(input.address === undefined ? {} : { address: input.address.trim() || null }), ...(input.city === undefined ? {} : { city: input.city.trim() || null }), ...(input.sortOrder === undefined ? {} : { sort_order: input.sortOrder }), ...(input.isActive === undefined ? {} : { is_active: input.isActive }) }).eq('id', id); if (error) throw error }
export async function deleteAdminStoreLocation(id: string): Promise<void> { if (!supabase) throw new Error('Supabase chưa được cấu hình.'); const { error } = await supabase.from('store_locations').delete().eq('id', id); if (error) throw error }

const mapAdminDeliveryZoneRow = (row: Record<string, unknown>): AdminDeliveryZoneRow => ({ id: String(row.id), name: String(row.name ?? ''), level: String(row.level ?? 'city'), feeVnd: Number(row.fee_vnd ?? 0), sortOrder: Number(row.sort_order ?? 0), isActive: Boolean(row.is_active) })
export async function loadAdminDeliveryZones(): Promise<AdminDeliveryZoneRow[]> { if (!supabase) return []; const { data, error } = await supabase.from('delivery_zones').select('id,name,level,fee_vnd,sort_order,is_active').order('sort_order'); if (error) throw error; return ((data ?? []) as Array<Record<string, unknown>>).map(mapAdminDeliveryZoneRow) }
export async function loadPublicStoreLocations(): Promise<PublicStoreLocation[]> { if (!supabase) return []; const { data, error } = await supabase.from('store_locations').select('id,code,name,address,city').eq('is_active', true).order('sort_order'); if (error) throw error; return ((data ?? []) as Array<Record<string, unknown>>).map((row) => ({ id: String(row.id), code: String(row.code ?? ''), name: String(row.name ?? ''), address: String(row.address ?? ''), city: String(row.city ?? '') })) }
export async function loadPublicDeliveryZones(): Promise<PublicDeliveryZone[]> { if (!supabase) return []; const { data, error } = await supabase.from('delivery_zones').select('id,name,fee_vnd').eq('is_active', true).order('sort_order'); if (error) throw error; return ((data ?? []) as Array<Record<string, unknown>>).map((row) => ({ id: String(row.id), name: String(row.name ?? ''), feeVnd: Number(row.fee_vnd ?? 0) })) }
export async function createAdminDeliveryZone(input: { name: string; level: string; feeVnd?: number; sortOrder?: number }): Promise<void> { if (!supabase) throw new Error('Supabase chưa được cấu hình.'); const { error } = await supabase.from('delivery_zones').insert({ name: input.name.trim(), level: input.level.trim() || 'city', fee_vnd: input.feeVnd ?? 0, sort_order: input.sortOrder ?? 0, is_active: true }); if (error) throw error }
export async function updateAdminDeliveryZone(id: string, input: { name?: string; level?: string; feeVnd?: number; sortOrder?: number; isActive?: boolean }): Promise<void> { if (!supabase) throw new Error('Supabase chưa được cấu hình.'); const { error } = await supabase.from('delivery_zones').update({ ...(input.name === undefined ? {} : { name: input.name.trim() }), ...(input.level === undefined ? {} : { level: input.level.trim() }), ...(input.feeVnd === undefined ? {} : { fee_vnd: input.feeVnd }), ...(input.sortOrder === undefined ? {} : { sort_order: input.sortOrder }), ...(input.isActive === undefined ? {} : { is_active: input.isActive }) }).eq('id', id); if (error) throw error }
export async function deleteAdminDeliveryZone(id: string): Promise<void> { if (!supabase) throw new Error('Supabase chưa được cấu hình.'); const { error } = await supabase.from('delivery_zones').delete().eq('id', id); if (error) throw error }

const mapAdminChatbotPromptRow = (row: Record<string, unknown>): AdminChatbotPromptRow => ({ id: String(row.id), prompt: String(row.prompt ?? ''), language: String(row.language ?? 'en') as AdminChatbotPromptRow['language'], sortOrder: Number(row.sort_order ?? 0), isActive: Boolean(row.is_active) })
export async function loadAdminChatbotPrompts(): Promise<AdminChatbotPromptRow[]> { if (!supabase) return []; const { data, error } = await supabase.from('chatbot_quick_prompts').select('id,prompt,language,sort_order,is_active').order('sort_order'); if (error) throw error; return ((data ?? []) as Array<Record<string, unknown>>).map(mapAdminChatbotPromptRow) }
export async function createAdminChatbotPrompt(input: { prompt: string; language: AdminChatbotPromptRow['language']; sortOrder?: number }): Promise<void> { if (!supabase) throw new Error('Supabase chưa được cấu hình.'); const { error } = await supabase.from('chatbot_quick_prompts').insert({ prompt: input.prompt.trim(), language: input.language, sort_order: input.sortOrder ?? 0, is_active: true }); if (error) throw error }
export async function updateAdminChatbotPrompt(id: string, input: { prompt?: string; language?: AdminChatbotPromptRow['language']; sortOrder?: number; isActive?: boolean }): Promise<void> { if (!supabase) throw new Error('Supabase chưa được cấu hình.'); const { error } = await supabase.from('chatbot_quick_prompts').update({ ...(input.prompt === undefined ? {} : { prompt: input.prompt.trim() }), ...(input.language === undefined ? {} : { language: input.language }), ...(input.sortOrder === undefined ? {} : { sort_order: input.sortOrder }), ...(input.isActive === undefined ? {} : { is_active: input.isActive }) }).eq('id', id); if (error) throw error }
export async function deleteAdminChatbotPrompt(id: string): Promise<void> { if (!supabase) throw new Error('Supabase chưa được cấu hình.'); const { error } = await supabase.from('chatbot_quick_prompts').delete().eq('id', id); if (error) throw error }

export async function loadAdminImportBatches(): Promise<AdminImportBatchRow[]> { if (!supabase) return []; const { data, error } = await supabase.from('book_import_batches').select('id,file_name,imported_by,total_rows,valid_rows,error_rows,status,created_at').order('created_at', { ascending: false }); if (error) throw error; return ((data ?? []) as Array<Record<string, unknown>>).map((row) => ({ id: String(row.id), fileName: String(row.file_name ?? ''), importedBy: String(row.imported_by ?? '—'), totalRows: Number(row.total_rows ?? 0), validRows: Number(row.valid_rows ?? 0), errorRows: Number(row.error_rows ?? 0), status: String(row.status ?? 'pending'), createdAt: String(row.created_at ?? '') })) }

const mapAdminNotificationRow = (row: Record<string, unknown>): AdminNotificationRow => ({ id: String(row.id), title: String(row.title ?? ''), message: String(row.message ?? ''), eventType: String(row.event_type ?? 'system'), actionHref: String(row.action_href ?? ''), readAt: row.read_at ? String(row.read_at) : null, createdAt: String(row.created_at ?? '') })
export async function loadAdminNotifications(): Promise<AdminNotificationRow[]> { if (!supabase) return []; const { data, error } = await supabase.from('admin_notifications').select('id,title,message,event_type,action_href,read_at,created_at').order('created_at', { ascending: false }).limit(30); if (error) throw error; return ((data ?? []) as Array<Record<string, unknown>>).map(mapAdminNotificationRow) }
export async function markAdminNotificationRead(id: string): Promise<void> { if (!supabase) throw new Error('Supabase chưa được cấu hình.'); const { error } = await supabase.from('admin_notifications').update({ read_at: new Date().toISOString() }).eq('id', id); if (error) throw error }
export async function markAllAdminNotificationsRead(): Promise<void> { if (!supabase) throw new Error('Supabase chưa được cấu hình.'); const { error } = await supabase.from('admin_notifications').update({ read_at: new Date().toISOString() }).is('read_at', null); if (error) throw error }

export async function checkRemoteAdminAccess(): Promise<{ allowed: boolean; email?: string; access?: AdminAccess | null; error?: string }> {
  if (!supabase) return { allowed: false, error: `Supabase chưa được cấu hình cho môi trường “${supabaseConfig.mode}”. Hãy chạy “npm run dev” để dùng môi trường enhanced (bản có dữ liệu thật) trên cổng 5174.` }
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
  if (sessionError) return { allowed: false, error: sessionError.message }
  const user = sessionData.session?.user
  if (!user) return { allowed: false, error: 'Vui lòng đăng nhập tài khoản quản trị.' }
  const { data, error } = await supabase.rpc('admin_get_my_access')
  if (error) return { allowed: false, email: user.email ?? undefined, error: error.message }
  const row = Array.isArray(data) ? data[0] : data
  if (!row) return { allowed: false, email: user.email ?? undefined, error: 'Tài khoản này chưa được cấp quyền quản trị.' }
  const record = row as Record<string, unknown>
  const access = { roleKey: String(record.role_key ?? 'editor') as AdminRoleKey, roleName: String(record.role_name ?? ''), permissions: Array.isArray(record.permissions) ? record.permissions.map(String) : [] }
  return { allowed: true, email: user.email ?? undefined, access }
}

export async function loadAdminOrders(): Promise<AdminOrderRow[]> {
  if (!supabase) return []
  const { data, error } = await supabase.from('orders').select('id,order_number,status,payment_status,total_vnd,created_at,guest_email,user_id,order_items(quantity)').order('created_at', { ascending: false })
  if (error) throw error
  return ((data ?? []) as Array<Record<string, unknown>>).map((row) => {
    const items = Array.isArray(row.order_items) ? row.order_items as Array<{ quantity?: number }> : []
    return {
      id: String(row.id),
      orderNumber: String(row.order_number ?? ''),
      status: String(row.status ?? 'pending'),
      paymentStatus: String(row.payment_status ?? 'unpaid'),
      totalVnd: Number(row.total_vnd ?? 0),
      createdAt: String(row.created_at ?? ''),
      customer: String(row.guest_email ?? row.user_id ?? 'Khách hàng'),
      itemCount: items.reduce((sum, item) => sum + Number(item.quantity ?? 0), 0),
    }
  })
}

export async function loadAdminDashboardSummary(): Promise<AdminDashboardSummary> {
  if (!supabase) throw new Error('Supabase chưa được cấu hình.')
  const [books, orders, creators, news, recentOrders] = await Promise.all([
    supabase.from('books').select('id', { count: 'exact', head: true }),
    supabase.from('orders').select('id', { count: 'exact', head: true }),
    supabase.from('creators').select('id', { count: 'exact', head: true }),
    supabase.from('news_posts').select('id', { count: 'exact', head: true }),
    loadAdminOrders(),
  ])
  const error = books.error ?? orders.error ?? creators.error ?? news.error
  if (error) throw error
  return {
    bookCount: books.count ?? 0,
    orderCount: orders.count ?? 0,
    creatorCount: creators.count ?? 0,
    newsCount: news.count ?? 0,
    recentOrders,
  }
}

export async function loadAdminTopBooks(): Promise<AdminTopBookRow[]> {
  if (!supabase) return []
  const { data, error } = await supabase.from('order_items').select('title_snapshot,quantity,line_total_vnd')
  if (error) throw error
  const totals = new Map<string, AdminTopBookRow>()
  for (const row of (data ?? []) as Array<Record<string, unknown>>) {
    const title = String(row.title_snapshot ?? 'Sách chưa có tên')
    const previous = totals.get(title) ?? { title, quantity: 0, revenueVnd: 0 }
    previous.quantity += Number(row.quantity ?? 0)
    previous.revenueVnd += Number(row.line_total_vnd ?? 0)
    totals.set(title, previous)
  }
  return [...totals.values()].sort((first, second) => second.quantity - first.quantity || second.revenueVnd - first.revenueVnd).slice(0, 10)
}

export async function updateAdminOrderStatus(orderId: string, status: string, paymentStatus?: string): Promise<void> {
  if (!supabase) throw new Error('Supabase chưa được cấu hình.')
  const { error } = await supabase.rpc('admin_set_order_status', { p_order_id: orderId, p_status: status, p_payment_status: paymentStatus ?? null, p_note: null })
  if (error) throw error
}

export async function loadAdminCustomers(): Promise<AdminCustomerRow[]> {
  if (!supabase) return []
  const { data, error } = await supabase.rpc('admin_list_customers')
  if (error) throw error
  return ((data ?? []) as Array<Record<string, unknown>>).map((customer) => ({
    id: String(customer.user_id),
    name: String(customer.display_name ?? 'Khách hàng'),
    email: String(customer.email ?? '—'),
    phone: String(customer.phone ?? '—'),
    orderCount: Number(customer.order_count ?? 0),
    createdAt: String(customer.created_at ?? ''),
  }))
}

export async function loadAdminCreators(): Promise<AdminCreatorRow[]> {
  if (!supabase) return []
  const [creators, roles, links, images] = await Promise.all([
    // `*` keeps this reader compatible with older Supabase projects while still
    // exposing academic_title automatically after its migration is applied.
    supabase.from('creators').select('*').order('display_name', { ascending: true }),
    supabase.from('creator_roles').select('creator_id,role'),
    supabase.from('book_creators').select('creator_id,book_id'),
    supabase.from('creator_images').select('creator_id,storage_path,sort_order,is_primary').order('sort_order', { ascending: true }),
  ])
  const error = creators.error ?? roles.error ?? links.error ?? images.error
  if (error) throw error
  const roleMap = new Map<string, AdminCreatorRow['roles']>()
  for (const row of (roles.data ?? []) as Array<Record<string, unknown>>) {
    const role = String(row.role ?? '') as AdminCreatorRow['roles'][number]
    if (!['author', 'translator', 'illustrator'].includes(role)) continue
    const current = roleMap.get(String(row.creator_id)) ?? []
    roleMap.set(String(row.creator_id), [...current, role])
  }
  const bookCountMap = new Map<string, number>()
  for (const row of (links.data ?? []) as Array<Record<string, unknown>>) {
    const creatorId = String(row.creator_id)
    bookCountMap.set(creatorId, (bookCountMap.get(creatorId) ?? 0) + 1)
  }
  const imageMap = new Map<string, string>()
  for (const row of (images.data ?? []) as Array<Record<string, unknown>>) {
    const creatorId = String(row.creator_id)
    if (!imageMap.has(creatorId)) imageMap.set(creatorId, publicMediaUrl(String(row.storage_path ?? '')))
  }
  return ((creators.data ?? []) as Array<Record<string, unknown>>).map((row) => {
    const id = String(row.id)
    return {
      id,
      name: String(row.display_name ?? ''),
      slug: String(row.slug ?? ''),
      roles: [...new Set(roleMap.get(id) ?? [])],
      bookCount: bookCountMap.get(id) ?? 0,
      status: row.is_active === false ? 'Tạm ẩn' : 'Đang hoạt động',
      image: imageMap.get(id) || '/assets/author-avatar-placeholder.png',
      bio: String(row.bio_html ?? ''),
      awards: String(row.awards ?? ''),
      academicTitle: String(row.academic_title ?? ''),
      birthYear: row.birth_year == null ? null : Number(row.birth_year),
      deathYear: row.death_year == null ? null : Number(row.death_year),
    }
  })
}

export async function loadAdminInventory(): Promise<AdminInventoryRow[]> {
  if (!supabase) return []
  const { data, error } = await supabase.from('books').select('id,title,isbn,inventory_quantity,reserved_inventory_quantity,sale_price_vnd').order('title', { ascending: true })
  if (error) throw error
  return ((data ?? []) as Array<Record<string, unknown>>).map((book) => {
    const inventoryQuantity = Number(book.inventory_quantity ?? 0)
    const reservedQuantity = Number(book.reserved_inventory_quantity ?? 0)
    return { id: String(book.id), title: String(book.title ?? ''), isbn: String(book.isbn ?? ''), inventoryQuantity, reservedQuantity, availableQuantity: Math.max(inventoryQuantity - reservedQuantity, 0), salePriceVnd: Number(book.sale_price_vnd ?? 0) }
  })
}

export async function loadAdminReviews(): Promise<AdminReviewRow[]> {
  if (!supabase) return []
  const { data, error } = await supabase.from('book_reviews').select('id,guest_name,rating,title,body,status,created_at,books(title)').order('created_at', { ascending: false })
  if (error) throw error
  return ((data ?? []) as Array<Record<string, unknown>>).map((review) => {
    const book = review.books as { title?: string } | Array<{ title?: string }> | null
    const bookTitle = Array.isArray(book) ? book[0]?.title : book?.title
    return { id: String(review.id), reader: String(review.guest_name ?? 'Bạn đọc đã đăng nhập'), book: String(bookTitle ?? 'Sách không xác định'), rating: Number(review.rating ?? 0), title: String(review.title ?? ''), body: String(review.body ?? ''), date: String(review.created_at ?? ''), status: review.status === 'approved' || review.status === 'rejected' ? review.status : 'pending' }
  })
}

export async function updateAdminReviewStatus(reviewId: string, status: 'approved' | 'rejected'): Promise<void> {
  if (!supabase) throw new Error('Supabase chưa được cấu hình.')
  const { error } = await supabase.rpc('admin_set_review_status', { p_review_id: reviewId, p_status: status })
  if (error) throw error
}

export async function loadAdminMenuItems(): Promise<AdminMenuItemRow[]> {
  if (!supabase) return []
  const { data, error } = await supabase.from('site_menu_items').select('id,label,href,sort_order,is_active,site_menus!inner(menu_key)').order('sort_order', { ascending: true })
  if (error) throw error
  return ((data ?? []) as Array<Record<string, unknown>>).map((item) => {
    const menu = item.site_menus as { menu_key?: string } | Array<{ menu_key?: string }> | null
    return { id: String(item.id), menuKey: String(Array.isArray(menu) ? menu[0]?.menu_key : menu?.menu_key ?? ''), label: String(item.label ?? ''), href: String(item.href ?? ''), sortOrder: Number(item.sort_order ?? 0), isActive: Boolean(item.is_active) }
  })
}

export async function updateAdminMenuItem(item: AdminMenuItemRow): Promise<void> {
  if (!supabase) throw new Error('Supabase chưa được cấu hình.')
  const { error } = await supabase.from('site_menu_items').update({ label: item.label.trim(), href: item.href.trim(), sort_order: item.sortOrder, is_active: item.isActive, updated_at: new Date().toISOString() }).eq('id', item.id)
  if (error) throw error
}

const mapPromotionRow = (row: Record<string, unknown>): AdminPromotionRow => ({
  id: String(row.id),
  code: String(row.code ?? ''),
  name: String(row.name ?? ''),
  description: String(row.description ?? ''),
  discountType: row.discount_type === 'fixed' ? 'fixed' : 'percent',
  discountValue: Number(row.discount_value ?? 0),
  minimumOrderValue: Number(row.minimum_order_value ?? 0),
  startsAt: String(row.starts_at ?? ''),
  endsAt: String(row.ends_at ?? ''),
  usageLimit: row.usage_limit == null ? null : Number(row.usage_limit),
  usageCount: Number(row.usage_count ?? 0),
  isActive: Boolean(row.is_active),
})

export async function loadAdminPromotions(): Promise<AdminPromotionRow[]> {
  if (!supabase) return []
  const { data, error } = await supabase.from('promotions').select('id,code,name,description,discount_type,discount_value,minimum_order_value,starts_at,ends_at,usage_limit,usage_count,is_active').order('created_at', { ascending: false })
  if (error) throw error
  return ((data ?? []) as Array<Record<string, unknown>>).map(mapPromotionRow)
}

export type AdminPromotionInput = {
  code: string
  name: string
  description?: string
  discountType: 'percent' | 'fixed'
  discountValue: number
  minimumOrderValue?: number
  startsAt?: string
  endsAt?: string
  usageLimit?: number | null
  isActive: boolean
}

export async function createAdminPromotion(input: AdminPromotionInput): Promise<AdminPromotionRow> {
  if (!supabase) throw new Error('Supabase chưa được cấu hình.')
  const { data, error } = await supabase.from('promotions').insert({
    code: input.code.trim().toUpperCase(),
    name: input.name.trim(),
    description: input.description?.trim() || null,
    discount_type: input.discountType,
    discount_value: input.discountValue,
    minimum_order_value: input.minimumOrderValue ?? 0,
    starts_at: input.startsAt || null,
    ends_at: input.endsAt || null,
    usage_limit: input.usageLimit ?? null,
    is_active: input.isActive,
  }).select('id,code,name,description,discount_type,discount_value,minimum_order_value,starts_at,ends_at,usage_limit,usage_count,is_active').single()
  if (error) throw error
  return mapPromotionRow(data as Record<string, unknown>)
}

export async function updateAdminPromotionStatus(id: string, isActive: boolean): Promise<void> {
  if (!supabase) throw new Error('Supabase chưa được cấu hình.')
  const { error } = await supabase.from('promotions').update({ is_active: isActive, updated_at: new Date().toISOString() }).eq('id', id)
  if (error) throw error
}

export async function loadMyOrders(): Promise<AccountOrderRow[]> {
  if (!supabase) return []
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
  if (sessionError) throw sessionError
  if (!sessionData.session?.user) return []
  const { data, error } = await supabase.from('orders').select('id,order_number,status,payment_status,total_vnd,subtotal_vnd,discount_vnd,delivery_fee_vnd,created_at,order_items(title_snapshot,quantity,line_total_vnd)').order('created_at', { ascending: false })
  if (error) throw error
  return ((data ?? []) as Array<Record<string, unknown>>).map((row) => {
    const rawItems = Array.isArray(row.order_items) ? row.order_items as Array<Record<string, unknown>> : []
    const items = rawItems.map((item) => ({ title: String(item.title_snapshot ?? 'Sách'), quantity: Number(item.quantity ?? 0), lineTotalVnd: Number(item.line_total_vnd ?? 0) }))
    return { id: String(row.id), orderNumber: String(row.order_number ?? ''), status: String(row.status ?? 'pending'), paymentStatus: String(row.payment_status ?? 'unpaid'), totalVnd: Number(row.total_vnd ?? 0), subtotalVnd: Number(row.subtotal_vnd ?? 0), discountVnd: Number(row.discount_vnd ?? 0), deliveryFeeVnd: Number(row.delivery_fee_vnd ?? 0), createdAt: String(row.created_at ?? ''), itemCount: items.reduce((sum, item) => sum + item.quantity, 0), items }
  })
}

export async function loadMyProfile(): Promise<AccountProfileRow | null> {
  if (!supabase) return null
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
  if (sessionError) throw sessionError
  const user = sessionData.session?.user
  if (!user) return null
  const { data, error } = await supabase.from('customer_profiles').select('id,display_name,phone,default_address').eq('id', user.id).maybeSingle()
  if (error) throw error
  return { id: user.id, displayName: String(data?.display_name ?? user.user_metadata?.display_name ?? user.email?.split('@')[0] ?? 'Linery Reader'), email: user.email ?? '', phone: String(data?.phone ?? ''), defaultAddress: (data?.default_address ?? {}) as Record<string, string> }
}

export async function saveMyProfile(input: { displayName: string; phone: string; defaultAddress?: Record<string, string> }): Promise<void> {
  if (!supabase) throw new Error('Supabase chưa được cấu hình.')
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
  if (sessionError) throw sessionError
  const user = sessionData.session?.user
  if (!user) throw new Error('Vui lòng đăng nhập để lưu hồ sơ.')
  const { error } = await supabase.from('customer_profiles').upsert({ id: user.id, display_name: input.displayName.trim(), phone: input.phone.trim(), default_address: input.defaultAddress ?? {}, updated_at: new Date().toISOString() }, { onConflict: 'id' })
  if (error) throw error
}

export async function updateMyPassword(currentPassword: string, newPassword: string): Promise<void> {
  if (!supabase) throw new Error('Supabase chưa được cấu hình.')
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
  if (sessionError) throw sessionError
  const email = sessionData.session?.user.email
  if (!email) throw new Error('Vui lòng đăng nhập lại để đổi mật khẩu.')
  const { error: verifyError } = await supabase.auth.signInWithPassword({ email, password: currentPassword })
  if (verifyError) throw new Error('Mật khẩu hiện tại không đúng.')
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) throw error
}

export async function loadMyTransactions(): Promise<AccountTransactionRow[]> {
  if (!supabase) return []
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
  if (sessionError) throw sessionError
  const user = sessionData.session?.user
  if (!user) return []
  const { data, error } = await supabase.from('order_payments').select('id,provider,provider_transaction_id,amount_vnd,status,paid_at,created_at,orders!inner(order_number,user_id)').eq('orders.user_id', user.id).order('created_at', { ascending: false })
  if (error) throw error
  return ((data ?? []) as Array<Record<string, unknown>>).map((row) => {
    const order = row.orders as { order_number?: string } | Array<{ order_number?: string }> | null
    return { id: String(row.id), orderNumber: String(Array.isArray(order) ? order[0]?.order_number : order?.order_number ?? ''), provider: String(row.provider ?? ''), providerTransactionId: String(row.provider_transaction_id ?? '—'), amountVnd: Number(row.amount_vnd ?? 0), status: String(row.status ?? 'pending'), paidAt: String(row.paid_at ?? ''), createdAt: String(row.created_at ?? '') }
  })
}

export async function createAdminBook(input: AdminBookInput, coverFiles: File[] = []): Promise<string> {
  if (!supabase) throw new Error('Supabase chưa được cấu hình.')
  const requestedCreatorNames = [...new Set([...(input.authors ?? []), ...(input.translators ?? []), ...(input.illustrators ?? [])].map((value) => value.trim()).filter(Boolean))]
  const requestedTaxonomyInputs: Array<{ kind: string; names: string[] }> = [
    { kind: 'category', names: input.categories ?? [] }, { kind: 'genre', names: input.genres ?? [] }, { kind: 'topic', names: input.topics ?? [] }, { kind: 'format', names: input.formats ?? [] }, { kind: 'line', names: input.lines ?? [] }, { kind: 'publisher', names: input.publishers ?? [] }, { kind: 'imprint', names: input.imprints ?? [] }, { kind: 'language', names: input.languages ?? [] },
  ]
  const requestedTaxonomyNames = [...new Set(requestedTaxonomyInputs.flatMap((entry) => entry.names.map((name) => name.trim()).filter(Boolean)))]
  const requestedModuleNames = [...new Set((input.homepageModules ?? []).map((name) => name.trim()).filter(Boolean))]
  const [creatorCheck, taxonomyCheck, moduleCheck] = await Promise.all([
    requestedCreatorNames.length ? supabase.from('creators').select('display_name').in('display_name', requestedCreatorNames) : Promise.resolve({ data: [], error: null }),
    requestedTaxonomyNames.length ? supabase.from('taxonomy_terms').select('kind,name').in('name', requestedTaxonomyNames) : Promise.resolve({ data: [], error: null }),
    requestedModuleNames.length ? supabase.from('homepage_modules').select('name').in('name', requestedModuleNames) : Promise.resolve({ data: [], error: null }),
  ])
  if (creatorCheck.error) throw creatorCheck.error
  if (taxonomyCheck.error) throw taxonomyCheck.error
  if (moduleCheck.error) throw moduleCheck.error
  const existingCreators = new Set((creatorCheck.data ?? []).map((row) => String((row as { display_name?: unknown }).display_name ?? '')))
  const missingCreators = requestedCreatorNames.filter((name) => !existingCreators.has(name))
  if (missingCreators.length) throw new Error(`Không tìm thấy tác giả/người tham gia trong Supabase: ${missingCreators.join(', ')}.`)
  const existingTerms = (taxonomyCheck.data ?? []) as Array<{ kind: string; name: string }>
  const missingTerms = requestedTaxonomyInputs.flatMap((entry) => entry.names.map((name) => ({ kind: entry.kind, name: name.trim() }))).filter((requested) => requested.name && !existingTerms.some((term) => term.kind === requested.kind && term.name === requested.name))
  if (missingTerms.length) throw new Error(`Không tìm thấy dữ liệu phân loại trong Supabase: ${missingTerms.map((term) => `${term.kind}=${term.name}`).join(', ')}.`)
  const existingModules = new Set((moduleCheck.data ?? []).map((row) => String((row as { name?: unknown }).name ?? '')))
  const missingModules = requestedModuleNames.filter((name) => !existingModules.has(name))
  if (missingModules.length) throw new Error(`Không tìm thấy mô đun trang chủ trong Supabase: ${missingModules.join(', ')}.`)
  const sampleFile = input.sampleFile ?? null
  if (sampleFile && !(/application\/pdf/i.test(sampleFile.type) || /\.pdf$/i.test(sampleFile.name) || /application\/epub\+zip/i.test(sampleFile.type) || /\.epub$/i.test(sampleFile.name))) throw new Error('File đọc thử phải là PDF hoặc EPUB.')
  const sampleStoragePath = sampleFile ? `books/${crypto.randomUUID()}-${sampleFile.name.toLowerCase().replace(/[^a-z0-9._-]+/g, '-')}` : null
  if (sampleFile && sampleStoragePath) {
    const { error } = await supabase.storage.from('book-samples').upload(sampleStoragePath, sampleFile, { contentType: sampleFile.type || (sampleFile.name.toLowerCase().endsWith('.epub') ? 'application/epub+zip' : 'application/pdf'), upsert: false })
    if (error) throw error
  }
  const uploadedPaths: string[] = []
  const normalizedBookIsbn = input.isbn.replace(/\D/g, '')
  for (const file of coverFiles) {
    const isbnHints = [...file.name.matchAll(/(?:^|[^0-9])(97\d{11})(?:[^0-9]|$)/g)].map((match) => match[1])
    const conflictingIsbn = isbnHints.find((isbnHint) => normalizedBookIsbn && isbnHint !== normalizedBookIsbn)
    if (conflictingIsbn) {
      throw new Error(`Ảnh bìa "${file.name}" mang ISBN ${conflictingIsbn}, không khớp ISBN sách ${normalizedBookIsbn}. Vui lòng chọn đúng ảnh.`)
    }
    const safeName = file.name.toLowerCase().replace(/[^a-z0-9._-]+/g, '-')
    const storagePath = `books/${crypto.randomUUID()}-${safeName}`
    const { error } = await supabase.storage.from('site-media').upload(storagePath, file, { contentType: file.type, upsert: false })
    if (error) throw error
    uploadedPaths.push(storagePath)
  }
  const { data: book, error: bookError } = await supabase.from('books').insert({ isbn: input.isbn.trim() || null, title: input.title.trim(), slug: input.slug.trim(), path: `/books/${input.slug.trim()}`, description_html: input.descriptionHtml?.trim() || null, cover_price_usd: input.coverPriceUsd ?? null, sale_price_vnd: input.salePriceVnd, compare_price_vnd: input.comparePriceVnd ?? null, page_count: input.pageCount ?? null, book_size: input.bookSize?.trim() || null, publication_date: input.publicationDate || null, weight: input.weight?.trim() || null, cover_storage_path: uploadedPaths[0] ?? null, sample_pdf_storage_path: sampleStoragePath, sample_pdf_page_count: sampleFile ? input.samplePageCount ?? null : null, sample_pdf_enabled: Boolean(sampleStoragePath), sample_file_type: sampleFile && (/\.epub$/i.test(sampleFile.name) || /epub/i.test(sampleFile.type)) ? 'epub' : 'pdf', status: input.isVisibleWebsite ? 'active' : 'draft', is_visible_website: input.isVisibleWebsite, inventory_quantity: input.inventoryQuantity ?? 0 }).select('id').single()
  if (bookError) {
    if (sampleStoragePath) await supabase.storage.from('book-samples').remove([sampleStoragePath])
    if (uploadedPaths.length) await supabase.storage.from('site-media').remove(uploadedPaths)
    throw bookError
  }
  const bookId = String(book.id)
  const client = supabase
  const rollbackBook = async () => {
    await client.from('books').delete().eq('id', bookId)
    if (sampleStoragePath) await client.storage.from('book-samples').remove([sampleStoragePath])
    if (uploadedPaths.length) await client.storage.from('site-media').remove(uploadedPaths)
  }
  if (uploadedPaths.length) {
    const { error } = await supabase.from('book_images').insert(uploadedPaths.map((storagePath, index) => ({ book_id: bookId, storage_path: storagePath, sort_order: index, is_primary: index === 0 })))
    if (error) { await rollbackBook(); throw error }
  }
  const creatorNames = [...new Set([...(input.authors ?? []), ...(input.translators ?? []), ...(input.illustrators ?? [])].map((value) => value.trim()).filter(Boolean))]
  if (creatorNames.length) {
    const { data: creators, error } = await supabase.from('creators').select('id,display_name').in('display_name', creatorNames)
    if (error) { await rollbackBook(); throw error }
    const creatorRows = (creators ?? []) as Array<{ id: string; display_name: string }>
    const creatorLinks = creatorRows.flatMap((creator) => [
      ...(input.authors ?? []).includes(creator.display_name) ? [{ book_id: bookId, creator_id: creator.id, role: 'author' as const, sort_order: 0 }] : [],
      ...(input.translators ?? []).includes(creator.display_name) ? [{ book_id: bookId, creator_id: creator.id, role: 'translator' as const, sort_order: 0 }] : [],
      ...(input.illustrators ?? []).includes(creator.display_name) ? [{ book_id: bookId, creator_id: creator.id, role: 'illustrator' as const, sort_order: 0 }] : [],
    ])
    if (creatorLinks.length) {
      const { error: linkError } = await supabase.from('book_creators').insert(creatorLinks)
      if (linkError) { await rollbackBook(); throw linkError }
    }
  }
  const taxonomyInputs: Array<{ kind: string; names: string[] }> = [
    { kind: 'category', names: input.categories ?? [] }, { kind: 'genre', names: input.genres ?? [] }, { kind: 'topic', names: input.topics ?? [] }, { kind: 'format', names: input.formats ?? [] }, { kind: 'line', names: input.lines ?? [] }, { kind: 'publisher', names: input.publishers ?? [] }, { kind: 'imprint', names: input.imprints ?? [] }, { kind: 'language', names: input.languages ?? [] },
  ]
  const taxonomyNames = [...new Set(taxonomyInputs.flatMap((entry) => entry.names.map((name) => name.trim()).filter(Boolean)))]
  if (taxonomyNames.length) {
    const { data: terms, error } = await supabase.from('taxonomy_terms').select('id,kind,name').in('name', taxonomyNames)
    if (error) { await rollbackBook(); throw error }
    const termRows = (terms ?? []) as Array<{ id: string; kind: string; name: string }>
    const missingTerms = taxonomyInputs.flatMap((entry) => entry.names.map((name) => ({ kind: entry.kind, name: name.trim() }))).filter((requested) => requested.name && !termRows.some((term) => term.kind === requested.kind && term.name === requested.name))
    if (missingTerms.length) { await rollbackBook(); throw new Error(`Không tìm thấy dữ liệu phân loại trong Supabase: ${missingTerms.map((term) => `${term.kind}=${term.name}`).join(', ')}.`) }
    const termLinks = [...new Map(taxonomyInputs.flatMap((entry) => entry.names.flatMap((name) => termRows.filter((term) => term.kind === entry.kind && term.name === name.trim()).map((term) => [`${bookId}:${term.id}`, { book_id: bookId, term_id: term.id }] as const))).map(([key, link]) => [key, link])).values()]
    if (termLinks.length) {
      const { error: linkError } = await supabase.from('book_taxonomy_terms').insert(termLinks)
      if (linkError) { await rollbackBook(); throw linkError }
    }
  }
  if ((input.homepageModules ?? []).length) {
    const moduleNames = input.homepageModules ?? []
    const { data: modules, error } = await supabase.from('homepage_modules').select('id,name').in('name', moduleNames)
    if (error) { await rollbackBook(); throw error }
    const moduleRows = (modules ?? []) as Array<{ id: string; name: string }>
    const missingModulesAfterInsert = moduleNames.filter((name) => !moduleRows.some((module) => module.name === name))
    if (missingModulesAfterInsert.length) { await rollbackBook(); throw new Error(`Không tìm thấy mô đun trang chủ trong Supabase: ${missingModulesAfterInsert.join(', ')}.`) }
    const moduleIds = moduleRows.map((module) => module.id)
    const { data: existingModuleLinks, error: existingLinksError } = await supabase.from('book_homepage_modules').select('module_id,sort_order').in('module_id', moduleIds)
    if (existingLinksError) { await rollbackBook(); throw existingLinksError }
    const nextSortByModule = new Map<string, number>()
    for (const row of (existingModuleLinks ?? []) as Array<{ module_id: string; sort_order?: number | null }>) {
      const current = nextSortByModule.get(row.module_id) ?? 0
      nextSortByModule.set(row.module_id, Math.max(current, Number(row.sort_order ?? 0)))
    }
    const moduleLinks = moduleRows.map((module) => {
      const nextSort = (nextSortByModule.get(module.id) ?? 0) + 1
      nextSortByModule.set(module.id, nextSort)
      return { book_id: bookId, module_id: module.id, sort_order: nextSort }
    })
    if (moduleLinks.length) {
      const { error: linkError } = await supabase.from('book_homepage_modules').insert(moduleLinks)
      if (linkError) { await rollbackBook(); throw linkError }
    }
  }
  return bookId
}

export async function deleteAdminBook(id: string): Promise<void> {
  if (!supabase) throw new Error('Supabase chưa được cấu hình.')
  const { error } = await supabase.from('books').delete().eq('id', id)
  if (error) throw error
}

const publicMediaUrl = (storagePath: string) => {
  const legacyHostedAsset = storagePath.match(/\/media\/assets\/([^/?#]+)$/i)
  if (legacyHostedAsset) return `/assets/catalog-covers/${legacyHostedAsset[1]}`
  if (/^https?:\/\//i.test(storagePath)) {
    const isSupabaseStorageUrl = Boolean(supabaseConfig.url) && storagePath.startsWith(`${supabaseConfig.url}/storage/v1/object/public/`)
    return isSupabaseStorageUrl ? storagePath : '/assets/media-placeholder.svg'
  }
  if (storagePath.startsWith('/assets/')) return storagePath
  if (supabase && storagePath) return supabase.storage.from('site-media').getPublicUrl(storagePath).data.publicUrl
  if (/^[^/]+\.(?:avif|jpe?g|png|webp)$/i.test(storagePath)) return `/assets/catalog-covers/${storagePath}`
  return '/assets/media-placeholder.svg'
}

const coverPathMatchesIsbn = (storagePath: string, isbn: string) => {
  const normalizedIsbn = isbn.replace(/\D/g, '')
  if (!normalizedIsbn) return true
  const hints = [...storagePath.matchAll(/(?:^|[^0-9])(97\d{11})(?:[^0-9]|$)/g)].map((match) => match[1])
  return hints.length === 0 || hints.every((hint) => hint === normalizedIsbn)
}

const publicBookImageUrl = (storagePath: string, isbn: string) => coverPathMatchesIsbn(storagePath, isbn) ? publicMediaUrl(storagePath) : '/assets/media-placeholder.svg'

const publicBookSampleUrl = (storagePath: string) => {
  if (storagePath.startsWith('/assets/')) return storagePath
  if (/^https?:\/\//i.test(storagePath)) return storagePath
  if (supabase && storagePath) return supabase.storage.from('book-samples').getPublicUrl(storagePath).data.publicUrl
  return ''
}

const unique = (values: string[]) => [...new Set(values.filter(Boolean))]
const asArray = <T,>(value: T | T[] | null | undefined): T[] => value == null ? [] : Array.isArray(value) ? value : [value]
const parseTextList = (value: unknown): string[] => {
  if (Array.isArray(value)) return unique(value.flatMap((item) => parseTextList(item)))
  const text = String(value ?? '').replace(/<\/?(?:p|div|li|br\s*\/?)>/gi, '\n').replace(/<[^>]+>/g, '').trim()
  if (!text || text === '-') return []
  return unique(text.split(/[;\n]+/).map((item) => item.replace(/^[-•*]\s*/, '').trim()).filter(Boolean))
}

let publicCatalogPromise: Promise<PublicCatalogProduct[] | null> | null = null
let publicBookSamplePromise = new Map<string, Promise<{ url?: string; pageCount?: number; fileType?: 'pdf' | 'epub' } | null>>()
let publicCreatorsPromise: Promise<PublicCreatorProfile[] | null> | null = null
let publicNewsPromise: Promise<PublicNewsPost[] | null> | null = null

const publicCatalogCacheKey = 'linery-public-catalog-v2'

export function getCachedPublicCatalogProducts(): PublicCatalogProduct[] | null {
  if (typeof window === 'undefined') return null
  try {
    const cached = JSON.parse(window.localStorage.getItem(publicCatalogCacheKey) ?? 'null')
    if (!Array.isArray(cached) || cached.length === 0) return null
    return (cached as PublicCatalogProduct[]).map((product) => ({
      ...product,
      image: publicBookImageUrl(String(product.image ?? ''), product.isbn),
      gallery: (product.gallery ?? []).filter((image) => coverPathMatchesIsbn(String(image), product.isbn)).map((image) => publicMediaUrl(String(image))),
    }))
  } catch {
    return null
  }
}

export async function loadPublicHomepageProducts(): Promise<PublicCatalogProduct[] | null> {
  const products = await loadPublicCatalogProducts()
  return products?.filter((product) => product.moduleSlugs.length > 0) ?? null
}

export async function loadPublicCatalogProducts(): Promise<PublicCatalogProduct[] | null> {
  if (!supabase) return null
  if (publicCatalogPromise) return publicCatalogPromise
  publicCatalogPromise = (async () => {
    const books = await supabase.from('books').select('id,isbn,title,slug,description_html,cover_price_usd,sale_price_vnd,compare_price_vnd,page_count,book_size,publication_date,weight,inventory_quantity,reserved_inventory_quantity,cover_storage_path').eq('status', 'active').eq('is_visible_website', true).order('created_at', { ascending: false })
    const error = books.error
    if (error) throw error
    const bookIds = ((books.data ?? []) as Array<{ id: string }>).map((book) => book.id)
    if (!bookIds.length) return []
    const [images, creators, terms, modules] = await Promise.all([
      supabase.from('book_images').select('book_id,storage_path,sort_order,is_primary').in('book_id', bookIds).order('sort_order', { ascending: true }),
      supabase.from('book_creators').select('book_id,creator_id,role,sort_order,creators(display_name,slug)').in('book_id', bookIds).order('sort_order', { ascending: true }),
      supabase.from('book_taxonomy_terms').select('book_id,term_id,taxonomy_terms(kind,name,slug)').in('book_id', bookIds).order('term_id', { ascending: true }),
      supabase.from('book_homepage_modules').select('book_id,module_id,sort_order,homepage_modules(name,slug)').in('book_id', bookIds).order('sort_order', { ascending: true }),
    ])
    const relatedError = images.error ?? creators.error ?? terms.error ?? modules.error
    if (relatedError) throw relatedError

  const imageRows = (images.data ?? []) as Array<{ book_id: string; storage_path: string; sort_order: number; is_primary: boolean }>
  const creatorRows = (creators.data ?? []) as Array<{ book_id: string; role: 'author' | 'translator' | 'illustrator'; sort_order: number; creators: Array<{ display_name: string }> | null }>
  const termRows = (terms.data ?? []) as Array<{ book_id: string; taxonomy_terms: Array<{ kind: string; name: string; slug: string }> | null }>
  const moduleRows = (modules.data ?? []) as Array<{ book_id: string; sort_order: number; homepage_modules: Array<{ name: string; slug: string }> | null }>
  const imagesByBook = new Map<string, typeof imageRows>()
  const creatorsByBook = new Map<string, typeof creatorRows>()
  const termsByBook = new Map<string, typeof termRows>()
  const modulesByBook = new Map<string, typeof moduleRows>()
  for (const row of imageRows) imagesByBook.set(row.book_id, [...(imagesByBook.get(row.book_id) ?? []), row])
  for (const row of creatorRows) creatorsByBook.set(row.book_id, [...(creatorsByBook.get(row.book_id) ?? []), row])
  for (const row of termRows) termsByBook.set(row.book_id, [...(termsByBook.get(row.book_id) ?? []), row])
  for (const row of moduleRows) modulesByBook.set(row.book_id, [...(modulesByBook.get(row.book_id) ?? []), row])

    return ((books.data ?? []) as Array<Record<string, unknown>>).map((book) => {
    const id = String(book.id)
    const isbn = String(book.isbn ?? '')
    // book_images.book_id is the authoritative relationship. Once an asset is
    // linked to this book, do not reject it merely because an old filename
    // contains a stale/different ISBN. New uploads are still validated before
    // they are stored, but existing relational data must remain visible.
    const bookImages = (imagesByBook.get(id) ?? []).sort((a, b) => Number(b.is_primary) - Number(a.is_primary) || a.sort_order - b.sort_order).map((row) => publicMediaUrl(row.storage_path))
    const bookCreators = creatorsByBook.get(id) ?? []
    const linkedModules = modulesByBook.get(id) ?? []
    const moduleSortOrders = Object.fromEntries((moduleRows.filter((row) => row.book_id === id)).flatMap((row) => asArray(row.homepage_modules).map((module) => [module.slug, Number(row.sort_order)])))
    const authors = bookCreators.filter((row) => row.role === 'author').flatMap((row) => asArray(row.creators).map((creator) => creator.display_name))
    const translators = bookCreators.filter((row) => row.role === 'translator').flatMap((row) => asArray(row.creators).map((creator) => creator.display_name))
    const illustrators = bookCreators.filter((row) => row.role === 'illustrator').flatMap((row) => asArray(row.creators).map((creator) => creator.display_name))
    const bookTerms = (termsByBook.get(id) ?? []).flatMap((row) => asArray(row.taxonomy_terms))
    const categories = unique(bookTerms.filter((term) => ['category', 'genre', 'topic'].includes(term.kind)).map((term) => term.name))
    const genres = unique(bookTerms.filter((term) => term.kind === 'genre').map((term) => term.name))
    const topics = unique(bookTerms.filter((term) => term.kind === 'topic').map((term) => term.name))
    const formats = unique(bookTerms.filter((term) => term.kind === 'format').map((term) => term.name))
    const lines = unique(bookTerms.filter((term) => term.kind === 'line').map((term) => term.name))
    const imprints = unique(bookTerms.filter((term) => term.kind === 'imprint').map((term) => term.name))
    const languages = unique(bookTerms.filter((term) => term.kind === 'language').map((term) => term.name))
    const publisher = bookTerms.find((term) => term.kind === 'publisher')?.name ?? 'Linery Books'
    const price = Number(book.sale_price_vnd ?? 0).toLocaleString('vi-VN') + '₫'
    const inventory = Number(book.inventory_quantity ?? 0)
    const reserved = Number(book.reserved_inventory_quantity ?? 0)
    const image = bookImages[0] ?? publicBookImageUrl(String(book.cover_storage_path ?? ''), isbn)
    return {
      id,
      isbn,
      slug: String(book.slug ?? ''),
      title: String(book.title ?? ''),
      image,
      gallery: bookImages,
      author: authors[0] ?? translators[0] ?? 'Linery Books',
      translators: unique(translators),
      illustrators: unique(illustrators),
      price,
      categories,
      publisher,
      writerType: authors.length > 0 ? 'Authors' : 'Translators',
      year: book.publication_date ? Number(String(book.publication_date).slice(0, 4)) : undefined,
      available: inventory > reserved,
      inventoryQuantity: inventory,
      reservedInventoryQuantity: reserved,
      moduleSlugs: unique(linkedModules.flatMap((row) => asArray(row.homepage_modules).map((module) => module.slug))),
      moduleSortOrders,
      description: String(book.description_html ?? ''),
      coverPriceUsd: book.cover_price_usd == null ? null : Number(book.cover_price_usd),
      comparePriceVnd: book.compare_price_vnd == null ? null : Number(book.compare_price_vnd),
      pageCount: book.page_count == null ? null : Number(book.page_count),
      bookSize: String(book.book_size ?? ''),
      publicationDate: String(book.publication_date ?? ''),
      weight: String(book.weight ?? ''),
      format: formats[0] ?? '',
      line: lines[0] ?? '',
      imprint: imprints[0] ?? '',
      languages,
      genres,
      topics,
    } satisfies PublicCatalogProduct
    }).filter((book) => book.title)
  })()
  publicCatalogPromise.then((records) => {
    if (typeof window !== 'undefined' && records?.length) {
      try { window.localStorage.setItem(publicCatalogCacheKey, JSON.stringify(records)) } catch { /* cache is best effort */ }
    }
  }).catch(() => undefined)
  publicCatalogPromise.catch(() => { publicCatalogPromise = null })
  return publicCatalogPromise
}

export async function loadPublicBookSample(bookId: string, bookSlug?: string): Promise<{ url?: string; pageCount?: number; fileType?: 'pdf' | 'epub' } | null> {
  const bundledDemoSample = bookSlug === 'a-manual-for-cleaning-women'
    ? { url: '/assets/book-samples/a-manual-for-cleaning-women.pdf', pageCount: 4, fileType: 'pdf' as const }
    : null
  if (!supabase || !bookId) return bundledDemoSample
  const cached = publicBookSamplePromise.get(bookId)
  if (cached) return cached
  const request = (async () => {
    // Read the full row so older databases without the optional sample columns
    // return a normal record instead of a noisy 400 response. The migrated
    // columns are still consumed automatically when they exist.
    const { data, error } = await supabase.from('books').select('*').eq('id', bookId).maybeSingle()
    if (error) {
      return bundledDemoSample
    }
    const row = data as { sample_pdf_storage_path?: string | null; sample_pdf_page_count?: number | null; sample_pdf_enabled?: boolean | null; sample_file_type?: 'pdf' | 'epub' | null } | null
    if (!row?.sample_pdf_enabled || !row.sample_pdf_storage_path) {
      return bundledDemoSample
    }
    const fileType: 'pdf' | 'epub' = row.sample_file_type === 'epub' || /\.epub(?:$|\?)/i.test(row.sample_pdf_storage_path) ? 'epub' : 'pdf'
    return { url: publicBookSampleUrl(row.sample_pdf_storage_path), pageCount: row.sample_pdf_page_count ? Number(row.sample_pdf_page_count) : undefined, fileType }
  })()
  publicBookSamplePromise.set(bookId, request)
  return request
}

export async function loadPublicCreatorProfiles(): Promise<PublicCreatorProfile[] | null> {
  if (!supabase) return null
  if (publicCreatorsPromise) return publicCreatorsPromise
  publicCreatorsPromise = (async () => {
    // `*` keeps public creator loading compatible before/after the optional
    // academic_title migration without creating a noisy 400 fallback request.
    const creators = await supabase.from('creators').select('*').eq('is_active', true).order('sort_order', { ascending: true })
    const [images, creatorRoles] = await Promise.all([
    supabase.from('creator_images').select('creator_id,storage_path,sort_order,is_primary').order('sort_order', { ascending: true }),
    supabase.from('creator_roles').select('creator_id,role'),
    ])
    const error = creators.error ?? images.error ?? creatorRoles.error
    if (error) throw error
  const imageRows = (images.data ?? []) as Array<{ creator_id: string; storage_path: string; sort_order: number; is_primary: boolean }>
    const roleRows = (creatorRoles.data ?? []) as Array<{ creator_id: string; role: 'author' | 'translator' | 'illustrator'; sort_order: number }>
    const rolesByCreator = new Map<string, Array<'author' | 'translator' | 'illustrator'>>()
    for (const row of roleRows) {
      if (!rolesByCreator.has(row.creator_id)) rolesByCreator.set(row.creator_id, [])
      const roles = rolesByCreator.get(row.creator_id) ?? []
      if (!roles.includes(row.role)) roles.push(row.role)
    }
    return ((creators.data ?? []) as Array<Record<string, unknown>>).map((creator) => {
    const id = String(creator.id)
    const slug = String(creator.slug ?? '')
    const creatorImages = imageRows
      .filter((row) => row.creator_id === id)
      .sort((a, b) => Number(b.is_primary) - Number(a.is_primary) || a.sort_order - b.sort_order)
      .map((row) => publicMediaUrl(row.storage_path))
    const hostedCreatorImage = localCreatorImageMap[slug as keyof typeof localCreatorImageMap]
    const resolvedCreatorImages = hostedCreatorImage
      ? [hostedCreatorImage]
      : creatorImages.filter((image) => image.startsWith('/assets/') || image.includes('.supabase.co/'))
    const birthYear = creator.birth_year == null ? '' : String(creator.birth_year)
    const deathYear = creator.death_year == null ? '' : String(creator.death_year)
    return {
      name: String(creator.display_name ?? ''),
      slug,
      roles: rolesByCreator.get(id) ?? [],
      images: resolvedCreatorImages,
      born: birthYear,
      died: deathYear,
      awards: parseTextList(creator.awards),
      academicTitle: parseTextList(creator.academic_title),
      bio: String(creator.bio_html ?? '').trim(),
    }
    }).filter((creator) => creator.name)
  })()
  publicCreatorsPromise.catch(() => { publicCreatorsPromise = null })
  return publicCreatorsPromise
}

export async function loadPublicNewsPosts(): Promise<PublicNewsPost[] | null> {
  if (!supabase) return null
  if (publicNewsPromise) return publicNewsPromise
  publicNewsPromise = (async () => {
    const [{ data, error }, { data: blockData, error: blockError }] = await Promise.all([
    loadNewsPostRows(false),
    supabase.from('news_post_blocks').select('id,news_post_id,language,block_type,sort_order,content,image_storage_path,image_alt,caption,is_full_bleed,image_width,image_height').order('sort_order', { ascending: true }),
    ])
    if (error) throw error
    if (blockError) throw blockError
  const blocksByPost = new Map<string, { en: PublicNewsBlock[]; vi: PublicNewsBlock[] }>()
  for (const row of (blockData ?? []) as Array<Record<string, unknown>>) {
    const postId = String(row.news_post_id ?? '')
    if (!postId) continue
    const grouped = blocksByPost.get(postId) ?? { en: [], vi: [] }
    const block: PublicNewsBlock = {
      id: String(row.id ?? `${postId}-${row.sort_order}`),
      type: (['paragraph', 'heading', 'image', 'quote'].includes(String(row.block_type)) ? String(row.block_type) : 'paragraph') as PublicNewsBlock['type'],
      content: String(row.content ?? ''),
      image: publicMediaUrl(String(row.image_storage_path ?? '')),
      alt: String(row.image_alt ?? ''),
      caption: String(row.caption ?? ''),
      fullBleed: Boolean(row.is_full_bleed),
      width: row.image_width == null ? undefined : Number(row.image_width),
      height: row.image_height == null ? undefined : Number(row.image_height),
    }
    grouped[String(row.language) === 'vi' ? 'vi' : 'en'].push(block)
    blocksByPost.set(postId, grouped)
  }
    return ((data ?? []) as Array<Record<string, unknown>>).map((post) => {
    const grouped = blocksByPost.get(String(post.id)) ?? { en: [], vi: [] }
    return {
    image: publicMediaUrl(String(post.image_storage_path ?? '')),
    title: String(post.title_en ?? ''),
    titleVi: String(post.title_vi ?? ''),
    date: post.published_at ? new Date(String(post.published_at)).toLocaleDateString('en-GB') : '',
    kicker: String(post.kicker_en ?? ''),
    slug: String(post.slug ?? ''),
    excerpt: String(post.excerpt_en ?? ''),
    excerptVi: String(post.excerpt_vi ?? ''),
    body: asArray(post.body_en).map(String),
    bodyVi: asArray(post.body_vi).map(String),
    contentType: (post.content_type === 'emagazine' ? 'emagazine' : 'news') as PublicNewsPost['contentType'],
    byline: String(post.byline ?? ''),
    blocks: grouped.en.length > 0 ? grouped.en : grouped.vi,
    blocksVi: grouped.vi.length > 0 ? grouped.vi : grouped.en,
    seoTitle: String(post.seo_title_en ?? ''),
    seoTitleVi: String(post.seo_title_vi ?? ''),
    seoDescription: String(post.seo_description_en ?? ''),
    seoDescriptionVi: String(post.seo_description_vi ?? ''),
    seoKeywords: Array.isArray(post.seo_keywords) ? post.seo_keywords.map(String) : [],
    categorySlugs: Array.isArray(post.category_slugs) ? post.category_slugs.map(String) : [],
    isFeatured: Boolean(post.is_featured),
    showOnHomepage: Boolean(post.show_on_homepage),
    isPublished: true,
    displayFormat: (post.display_format === 'video' ? 'video' : 'standard') as PublicNewsPost['displayFormat'],
  }
    }).filter((post) => post.slug && post.title)
  })()
  publicNewsPromise?.catch(() => { publicNewsPromise = null })
  return publicNewsPromise
}

export async function loadAdminNewsPosts(): Promise<AdminNewsPost[]> {
  const client = supabase
  if (!client) return []
  const [{ data, error }, { data: blockData, error: blockError }] = await Promise.all([
    loadNewsPostRows(true),
    client.from('news_post_blocks').select('id,news_post_id,language,block_type,sort_order,content,image_storage_path,image_alt,caption,is_full_bleed,image_width,image_height').order('sort_order', { ascending: true }),
  ])
  if (error) throw error
  if (blockError) throw blockError
  const blocksByPost = new Map<string, { en: PublicNewsBlock[]; vi: PublicNewsBlock[] }>()
  for (const row of (blockData ?? []) as Array<Record<string, unknown>>) {
    const postId = String(row.news_post_id ?? '')
    if (!postId) continue
    const grouped = blocksByPost.get(postId) ?? { en: [], vi: [] }
    const block: PublicNewsBlock = {
      id: String(row.id ?? `${postId}-${row.sort_order}`),
      type: (['paragraph', 'heading', 'image', 'quote'].includes(String(row.block_type)) ? String(row.block_type) : 'paragraph') as PublicNewsBlock['type'],
      content: String(row.content ?? ''),
      image: publicMediaUrl(String(row.image_storage_path ?? '')),
      alt: String(row.image_alt ?? ''),
      caption: String(row.caption ?? ''),
      fullBleed: Boolean(row.is_full_bleed),
      width: row.image_width == null ? undefined : Number(row.image_width),
      height: row.image_height == null ? undefined : Number(row.image_height),
    }
    grouped[String(row.language) === 'vi' ? 'vi' : 'en'].push(block)
    blocksByPost.set(postId, grouped)
  }
  return ((data ?? []) as Array<Record<string, unknown>>).map((post) => {
    const id = String(post.id ?? '')
    const grouped = blocksByPost.get(id) ?? { en: [], vi: [] }
    return {
      id,
      status: String(post.status ?? 'draft'),
      image: publicMediaUrl(String(post.image_storage_path ?? '')),
      title: String(post.title_en ?? ''),
      titleVi: String(post.title_vi ?? ''),
      date: post.published_at ? new Date(String(post.published_at)).toLocaleDateString('en-GB') : '',
      kicker: String(post.kicker_en ?? ''),
      slug: String(post.slug ?? ''),
      excerpt: String(post.excerpt_en ?? ''),
      excerptVi: String(post.excerpt_vi ?? ''),
      body: asArray(post.body_en).map(String),
      bodyVi: asArray(post.body_vi).map(String),
      contentType: (post.content_type === 'emagazine' ? 'emagazine' : 'news') as PublicNewsPost['contentType'],
      byline: String(post.byline ?? ''),
      blocks: grouped.en.length > 0 ? grouped.en : grouped.vi,
      blocksVi: grouped.vi.length > 0 ? grouped.vi : grouped.en,
      seoTitle: String(post.seo_title_en ?? ''),
      seoTitleVi: String(post.seo_title_vi ?? ''),
      seoDescription: String(post.seo_description_en ?? ''),
      seoDescriptionVi: String(post.seo_description_vi ?? ''),
      seoKeywords: Array.isArray(post.seo_keywords) ? post.seo_keywords.map(String) : [],
      categorySlugs: Array.isArray(post.category_slugs) ? post.category_slugs.map(String) : [],
      isFeatured: Boolean(post.is_featured),
      showOnHomepage: Boolean(post.show_on_homepage),
      isPublished: String(post.status ?? 'draft') === 'active',
      displayFormat: (post.display_format === 'video' ? 'video' : 'standard') as PublicNewsPost['displayFormat'],
    }
  }).filter((post) => post.slug && post.title)
}

const newsWriteRow = (payload: NewsPostWritePayload) => ({
  slug: payload.slug,
  content_type: payload.contentType,
  status: payload.isPublished === false ? 'draft' : 'active',
  published_at: payload.isPublished === false ? null : new Date().toISOString(),
  image_storage_path: payload.image ?? '/assets/news-instagram-01.jpg',
  title_en: payload.title,
  title_vi: payload.titleVi,
  kicker_en: payload.kicker ?? (payload.contentType === 'emagazine' ? 'eMagazine' : 'News'),
  kicker_vi: payload.kickerVi ?? (payload.contentType === 'emagazine' ? 'eMagazine' : 'Tin tức'),
  excerpt_en: payload.excerpt ?? '',
  excerpt_vi: payload.excerptVi ?? payload.excerpt ?? '',
  body_en: payload.body ?? [],
  body_vi: payload.bodyVi ?? payload.body ?? [],
  byline: payload.byline ?? '',
  seo_title_en: payload.seoTitle ?? payload.title,
  seo_title_vi: payload.seoTitleVi ?? payload.titleVi,
  seo_description_en: payload.seoDescription ?? payload.excerpt ?? '',
  seo_description_vi: payload.seoDescriptionVi ?? payload.excerptVi ?? payload.excerpt ?? '',
  seo_keywords: payload.seoKeywords ?? [],
  category_slugs: payload.categorySlugs ?? [],
  is_featured: Boolean(payload.isFeatured),
  show_on_homepage: Boolean(payload.showOnHomepage),
  display_format: payload.displayFormat ?? 'standard',
})

const newsPostLegacyFields = 'id,slug,content_type,status,published_at,image_storage_path,title_en,title_vi,kicker_en,kicker_vi,excerpt_en,excerpt_vi,body_en,body_vi,byline'
const newsPostMetadataFields = `${newsPostLegacyFields},seo_title_en,seo_title_vi,seo_description_en,seo_description_vi,seo_keywords,category_slugs,is_featured,show_on_homepage,display_format`

const loadNewsPostRows = async (admin: boolean) => {
  const client = supabase
  if (!client) return { data: [], error: null }
  const load = (fields: string) => {
    const query = client.from('news_posts').select(fields).order(admin ? 'created_at' : 'published_at', { ascending: false, nullsFirst: false })
    return admin ? query : query.eq('status', 'active')
  }
  let result = await load(newsPostMetadataFields)
  if (result.error && /column|schema cache|could not find/i.test(result.error.message ?? '')) result = await load(newsPostLegacyFields)
  return result
}

export async function upsertNewsPost(payload: NewsPostWritePayload): Promise<{ id: string; slug: string }> {
  const client = supabase
  if (!client) throw new Error('Supabase chưa được cấu hình.')
  const fullRow = newsWriteRow(payload)
  let { data, error } = await client.from('news_posts').upsert(fullRow, { onConflict: 'slug' }).select('id,slug').single()
  if (error && /column|schema cache|could not find/i.test(error.message ?? '')) {
    const { seo_title_en: _seoTitleEn, seo_title_vi: _seoTitleVi, seo_description_en: _seoDescriptionEn, seo_description_vi: _seoDescriptionVi, seo_keywords: _seoKeywords, category_slugs: _categorySlugs, is_featured: _isFeatured, show_on_homepage: _showOnHomepage, display_format: _displayFormat, ...legacyRow } = fullRow
    const legacyResult = await client.from('news_posts').upsert(legacyRow, { onConflict: 'slug' }).select('id,slug').single()
    data = legacyResult.data
    error = legacyResult.error
  }
  if (error) throw error
  const post = data as { id: string; slug: string }
  const saveBlocks = async (language: 'en' | 'vi', blocks: Array<Omit<PublicNewsBlock, 'id'>>) => {
    if (!blocks.length) return
    const rows = blocks.map((block, index) => ({
      news_post_id: post.id,
      language,
      block_type: block.type,
      sort_order: index,
      content: block.content ?? '',
      image_storage_path: block.image || null,
      image_alt: block.alt ?? '',
      caption: block.caption ?? '',
      is_full_bleed: Boolean(block.fullBleed),
      image_width: block.width ?? null,
      image_height: block.height ?? null,
    }))
    const { error: blockError } = await client.from('news_post_blocks').upsert(rows, { onConflict: 'news_post_id,language,sort_order' })
    if (blockError) throw blockError
  }
  const enBlocks = payload.blocks ?? []
  const viBlocks = payload.blocksVi ?? enBlocks
  const { error: deleteError } = await client.from('news_post_blocks').delete().eq('news_post_id', post.id)
  if (deleteError) throw deleteError
  await saveBlocks('en', enBlocks)
  await saveBlocks('vi', viBlocks)
  const { data: userData } = await client.auth.getUser()
  const { error: historyError } = await client.from('news_post_history').insert({
    news_post_id: post.id,
    action: 'updated',
    performed_by: userData.user?.id ?? null,
    snapshot: newsWriteRow(payload),
  })
  if (historyError && !/relation .*news_post_history.*does not exist|schema cache/i.test(historyError.message ?? '')) throw historyError
  publicNewsPromise = null
  return post
}

export async function upsertCreatorProfile(payload: CreatorWritePayload): Promise<{ id: string; slug: string }> {
  const client = supabase
  if (!client) throw new Error('Supabase chưa được cấu hình.')
  const creatorRow = {
    display_name: payload.displayName.trim(),
    slug: payload.slug,
    birth_year: payload.birthYear ?? null,
    death_year: payload.deathYear ?? null,
    awards: payload.awards?.trim() || null,
    bio_html: payload.bioHtml?.trim() || null,
    is_active: payload.isActive ?? true,
  }
  const withAcademicTitle = await client.from('creators').upsert({
    ...creatorRow,
    academic_title: payload.academicTitle?.trim() || null,
  }, { onConflict: 'slug' }).select('id,slug').single()
  const legacyWrite = withAcademicTitle.error && /academic_title|column/i.test(withAcademicTitle.error.message ?? '')
    ? await client.from('creators').upsert(creatorRow, { onConflict: 'slug' }).select('id,slug').single()
    : withAcademicTitle
  const { data, error } = legacyWrite
  if (error) throw error
  if (payload.roles) {
    const creatorId = String((data as { id: string }).id)
    const { error: deleteRoleError } = await client.from('creator_roles').delete().eq('creator_id', creatorId)
    if (deleteRoleError) throw deleteRoleError
    const roles = [...new Set(payload.roles)]
    if (roles.length) {
      const { error: roleError } = await client.from('creator_roles').insert(roles.map((role) => ({ creator_id: creatorId, role })))
      if (roleError) throw roleError
    }
  }
  publicCreatorsPromise = null
  return data as { id: string; slug: string }
}

export async function saveAdminCreatorImages(creatorId: string, files: File[]): Promise<void> {
  if (!supabase) throw new Error('Supabase chưa được cấu hình.')
  if (!creatorId || !files.length) return
  const uploadedRows: Array<{ creator_id: string; storage_path: string; sort_order: number; is_primary: boolean }> = []
  for (const [index, file] of files.entries()) {
    const safeName = file.name.toLowerCase().replace(/[^a-z0-9._-]+/g, '-')
    const storagePath = `creators/${creatorId}/${crypto.randomUUID()}-${safeName}`
    const { error } = await supabase.storage.from('site-media').upload(storagePath, file, { contentType: file.type, upsert: false })
    if (error) throw error
    uploadedRows.push({ creator_id: creatorId, storage_path: storagePath, sort_order: index, is_primary: index === 0 })
  }
  const { error } = await supabase.from('creator_images').insert(uploadedRows)
  if (error) throw error
  publicCreatorsPromise = null
}

export async function loadPublicMenuItems(): Promise<PublicMenuItem[] | null> {
  if (!supabase) return null
  const { data, error } = await supabase.from('site_menu_items').select('id,parent_id,label,href,item_type,sort_order,site_menus!inner(menu_key)').eq('is_active', true).eq('site_menus.is_active', true).order('sort_order', { ascending: true })
  if (error) throw error
  return ((data ?? []) as Array<Record<string, unknown>>).map((row) => {
    const menu = row.site_menus as { menu_key?: string } | { menu_key?: string }[] | null
    const menuKey = Array.isArray(menu) ? menu[0]?.menu_key : menu?.menu_key
    return { id: String(row.id), menuKey: String(menuKey ?? ''), parentId: row.parent_id ? String(row.parent_id) : null, label: String(row.label ?? ''), href: String(row.href ?? ''), itemType: String(row.item_type ?? 'link'), sortOrder: Number(row.sort_order ?? 0) }
  }).filter((item) => item.menuKey && item.label)
}

export async function loadPublicBanners(): Promise<PublicBanner[] | null> {
  if (!supabase) return null
  const { data, error } = await supabase.from('site_banners').select('id,name,position_code,sort_order,display_mode,site_media_assets!inner(public_url,is_active)').eq('status', 'published').eq('site_media_assets.is_active', true).order('position_code').order('sort_order')
  if (error) throw error
  return ((data ?? []) as Array<Record<string, unknown>>).flatMap((row) => {
    const asset = Array.isArray(row.site_media_assets) ? row.site_media_assets[0] as Record<string, unknown> | undefined : row.site_media_assets as Record<string, unknown> | null
    const publicUrl = String(asset?.public_url ?? '')
    return publicUrl ? [{ id: String(row.id), name: String(row.name ?? ''), positionCode: String(row.position_code ?? ''), publicUrl, sortOrder: Number(row.sort_order ?? 0), displayMode: String(row.display_mode ?? 'desktop-mobile') }] : []
  })
}

export async function loadPublicSiteSettings(): Promise<PublicSiteSettings | null> {
  if (!supabase) return null
  const { data, error } = await supabase.from('site_settings').select('setting_key,language,value_json').eq('is_public', true)
  if (error) throw error
  return ((data ?? []) as Array<Record<string, unknown>>).reduce<PublicSiteSettings>((settings, row) => {
    const key = String(row.setting_key ?? '')
    if (key) settings[key] = row.value_json && typeof row.value_json === 'object' ? row.value_json as Record<string, unknown> : {}
    return settings
  }, {})
}

export async function loadRemoteCart(): Promise<RemoteCartItem[] | null> {
  if (!supabase) return null
  const { data: session } = await supabase.auth.getSession()
  if (!session.session?.user) return null
  const { data: cart, error: cartError } = await supabase.from('carts').select('id').eq('user_id', session.session.user.id).maybeSingle()
  if (cartError) throw cartError
  if (!cart) return []
  const { data, error } = await supabase.from('cart_items').select('id,book_id,quantity,unit_price_vnd').eq('cart_id', cart.id).order('created_at', { ascending: true })
  if (error) throw error
  return ((data ?? []) as Array<Record<string, unknown>>).map((row) => ({ id: String(row.id), bookId: String(row.book_id), quantity: Number(row.quantity), unitPriceVnd: Number(row.unit_price_vnd) }))
}

export async function saveRemoteCartItem(bookId: string, quantity: number, unitPriceVnd = 0): Promise<void> {
  if (!supabase) return
  const { data: session } = await supabase.auth.getSession()
  const userId = session.session?.user?.id
  if (!userId) return
  const { data: cart, error: cartError } = await supabase.from('carts').upsert({ user_id: userId }, { onConflict: 'user_id' }).select('id').single()
  if (cartError) throw cartError
  if (quantity <= 0) {
    const { error } = await supabase.from('cart_items').delete().eq('cart_id', cart.id).eq('book_id', bookId)
    if (error) throw error
    return
  }
  const { error } = await supabase.from('cart_items').upsert({ cart_id: cart.id, book_id: bookId, quantity, unit_price_vnd: Math.max(0, Math.round(unitPriceVnd)) }, { onConflict: 'cart_id,book_id' })
  if (error) throw error
}

export async function createRemoteOrder(input: RemoteOrderInput): Promise<{ orderId: string; orderNumber: string } | null> {
  if (!supabase) return null
  const { data, error } = await supabase.rpc('create_order_from_cart', { p_fulfillment_method: input.fulfillmentMethod, p_payment_method: input.paymentMethod, p_shipping_address: input.shippingAddress, p_delivery_notes: input.deliveryNotes ?? '', p_guest_email: input.guestEmail ?? null, p_promotion_code: input.promotionCode ?? null })
  if (error) throw error
  const result = (Array.isArray(data) ? data[0] : data) as { order_id?: string; order_number?: string } | null
  return result?.order_id ? { orderId: result.order_id, orderNumber: result.order_number ?? '' } : null
}

export async function toggleRemoteWishlist(bookId: string): Promise<void> {
  if (!supabase) return
  const { data: session } = await supabase.auth.getSession()
  const userId = session.session?.user?.id
  if (!userId) throw new Error('Vui lòng đăng nhập để lưu sách vào wishlist.')
  const { data: wishlist, error: wishlistError } = await supabase.from('wishlists').upsert({ user_id: userId, name: 'My wishlist' }, { onConflict: 'user_id,name' }).select('id').single()
  if (wishlistError) throw wishlistError
  const { data: existing, error: existingError } = await supabase.from('wishlist_items').select('book_id').eq('wishlist_id', wishlist.id).eq('book_id', bookId).maybeSingle()
  if (existingError) throw existingError
  const result = existing
    ? await supabase.from('wishlist_items').delete().eq('wishlist_id', wishlist.id).eq('book_id', bookId)
    : await supabase.from('wishlist_items').insert({ wishlist_id: wishlist.id, book_id: bookId })
  if (result.error) throw result.error
}

export async function loadRemoteWishlist(): Promise<string[] | null> {
  if (!supabase) return null
  const { data: session } = await supabase.auth.getSession()
  const userId = session.session?.user?.id
  if (!userId) return null
  const { data: wishlist, error: wishlistError } = await supabase.from('wishlists').select('id').eq('user_id', userId).eq('name', 'My wishlist').maybeSingle()
  if (wishlistError) throw wishlistError
  if (!wishlist) return []
  const { data, error } = await supabase.from('wishlist_items').select('book_id').eq('wishlist_id', wishlist.id).order('created_at', { ascending: true })
  if (error) throw error
  return ((data ?? []) as Array<Record<string, unknown>>).map((row) => String(row.book_id)).filter(Boolean)
}

export async function loadSupabaseCatalogSnapshot(): Promise<SupabaseCatalogSnapshot | null> {
  if (!supabase) return null
  const [books, creators, taxonomyTerms, homepageModules] = await Promise.all([
    supabase.from('books').select('id', { count: 'exact', head: true }),
    supabase.from('creators').select('id', { count: 'exact', head: true }),
    supabase.from('taxonomy_terms').select('id', { count: 'exact', head: true }),
    supabase.from('homepage_modules').select('id', { count: 'exact', head: true }),
  ])
  const error = books.error ?? creators.error ?? taxonomyTerms.error ?? homepageModules.error
  if (error) throw error
  return {
    books: books.count ?? 0,
    creators: creators.count ?? 0,
    taxonomyTerms: taxonomyTerms.count ?? 0,
    homepageModules: homepageModules.count ?? 0,
  }
}
