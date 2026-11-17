import { lazy, Suspense, useEffect, useRef, useState, type ClipboardEvent, type ElementType, type FormEvent, type KeyboardEvent as ReactKeyboardEvent, type ReactNode, type SyntheticEvent } from 'react'
import 'bootstrap-icons/font/bootstrap-icons.css'
import type { FlipviewHandle } from 'flipview'
import { checkRemoteAdminAccess, createAdminBook, createAdminChatbotPrompt, createAdminHomepageModule, createAdminMediaAsset, createAdminPaymentMethod, createAdminPromotion, createAdminStoreLocation, createAdminTaxonomyTerm, createAdminDeliveryZone, createRemoteOrder, deleteAdminBook, deleteAdminChatbotPrompt, deleteAdminDeliveryZone, deleteAdminHomepageModule, deleteAdminMediaAsset, deleteAdminPaymentMethod, deleteAdminSiteSetting, deleteAdminStoreLocation, deleteAdminTaxonomyTerm, ensureAdminHomepageModuleBooks, getCachedPublicCatalogProducts, grantAdminUser, loadAdminChatbotPrompts, loadAdminCustomers, loadAdminCreators, loadAdminDashboardSummary, loadAdminDeliveryZones, loadAdminHomepageModules, loadAdminImportBatches, loadAdminInventory, loadAdminMediaAssets, loadAdminMenuItems, loadAdminNewsPosts, loadAdminNotifications, loadAdminOrders, loadAdminPaymentMethods, loadAdminPermissionMatrix, loadAdminPromotions, loadAdminRoles, loadAdminReviews, loadAdminSiteSettings, loadAdminStoreLocations, loadAdminTaxonomy, loadAdminTopBooks, loadAdminUsers, loadMyOrders, loadMyProfile, loadMyTransactions, loadPublicBanners, loadPublicBookSample, loadPublicCatalogProducts, loadPublicCreatorProfiles, loadPublicDeliveryZones, loadPublicMenuItems, loadPublicNewsPosts, loadPublicSiteSettings, loadPublicStoreLocations, loadRemoteCart, loadRemoteWishlist, markAdminNotificationRead, markAllAdminNotificationsRead, revokeAdminUser, saveAdminCreatorImages, saveMyProfile, saveRemoteCartItem, setAdminUserRole, toggleRemoteWishlist, updateAdminChatbotPrompt, updateAdminDeliveryZone, updateAdminHomepageModule, updateAdminMenuItem, updateAdminMediaAsset, updateAdminOrderStatus, updateAdminPaymentMethod, updateAdminPromotionStatus, updateAdminReviewStatus, updateAdminStoreLocation, updateAdminTaxonomyTerm, updateMyPassword, upsertAdminSiteSetting, upsertCreatorProfile, upsertNewsPost, type AccountOrderRow, type AccountProfileRow, type AccountTransactionRow, type AdminAccess, type AdminBookInput, type AdminChatbotPromptRow, type AdminCreatorRow, type AdminCustomerRow, type AdminDashboardSummary, type AdminDeliveryZoneRow, type AdminHomepageModuleRow, type AdminImportBatchRow, type AdminInventoryRow, type AdminMediaAssetRow, type AdminMenuItemRow, type AdminNewsPost, type AdminNotificationRow, type AdminOrderRow, type AdminPaymentMethodRow, type AdminPermissionRow, type AdminPromotionInput, type AdminPromotionRow, type AdminReviewRow, type AdminRoleKey, type AdminRoleRow, type AdminSiteSettingRow, type AdminStoreLocationRow, type AdminTaxonomyKind, type AdminTaxonomyRow, type AdminTopBookRow, type AdminUserRow, type PublicBanner, type PublicCatalogProduct, type PublicCreatorProfile, type PublicDeliveryZone, type PublicMenuItem, type PublicNewsPost, type PublicNewsBlock, type PublicSiteSettings, type PublicStoreLocation } from './lib/supabase-data'
import { adjustAdminInventory } from './lib/supabase-data'
import { supabase } from './lib/supabase'
import { setAdminRolePermission } from './lib/supabase-data'
import { createAdminUser } from './lib/supabase-data'
import hueEmagazine from './data/emagazine-hue.json'
import localCreatorImageMap from './data/creator-image-map.json'

type Product = { id?: string; slug?: string; isbn?: string; image: string; gallery?: string[]; title: string; author: string; translators?: string[]; illustrators?: string[]; price: string; categories: string[]; publisher: string; writerType: 'Authors' | 'Translators'; year?: number; available?: boolean; limited?: boolean; moduleSlugs?: string[]; moduleSortOrders?: Record<string, number>; samplePdfUrl?: string; samplePdfPageCount?: number; sampleFileType?: 'pdf' | 'epub'; description?: string; coverPriceUsd?: number | null; comparePriceVnd?: number | null; pageCount?: number | null; bookSize?: string; publicationDate?: string; weight?: string; format?: string; line?: string; imprint?: string; languages?: string[]; genres?: string[]; topics?: string[] }
type CartItem = { product: Product; quantity: number }
type PaymentMethod = 'vnpay' | 'bank' | 'momo' | 'apple' | 'zalopay'
type FulfillmentMethod = 'pickup' | 'delivery'
type NewsItem = { image: string; title: string; titleVi: string; date: string; kicker: string; slug: string; excerpt: string; excerptVi: string; body: string[]; bodyVi: string[]; byline?: string; blocks?: PublicNewsBlock[]; blocksVi?: PublicNewsBlock[]; contentType?: 'news' | 'emagazine'; seoTitle?: string; seoKeywords?: string[]; seoDescription?: string; showOnHomepage?: boolean; isFeatured?: boolean; isPublished?: boolean; categorySlugs?: string[]; displayFormat?: 'standard' | 'video' }
type View = 'home' | 'authors' | 'all-books' | 'collection' | 'search' | 'author' | 'detail' | 'book-reader' | 'cart' | 'checkout' | 'news' | 'news-detail' | 'login' | 'register' | 'forgot-password' | 'password-reset-sent' | 'reset-password' | 'password-reset-complete' | 'account' | 'admin'
type AccountTab = 'profile' | 'orders' | 'transactions' | 'security'
type WriterDirectoryFilter = 'all' | 'authors' | 'translators' | 'illustrators'
type ProductCardActions = { onOpenDetail: (product: Product) => void; onAddToCart: (product: Product, source?: HTMLElement) => void; onPreview: (product: Product) => void; onPreviewLeave: () => void; onSelectQuickView: (product: Product) => void; quickViewOpen: boolean }
const BOOK_COVER_FALLBACK = '/assets/book-cover-placeholder.svg'
const handleBookCoverError = (event: SyntheticEvent<HTMLImageElement>) => {
  const image = event.currentTarget
  if (image.dataset.fallbackApplied === 'true') return
  image.dataset.fallbackApplied = 'true'
  image.src = BOOK_COVER_FALLBACK
}
type AdminBook = { id?: string; isbn: string; title: string; author: string; quantity: number; unitPrice: number | null; salePrice: number; link: string; format: string; line: string; category: string; cover?: string; coverImages?: string[] }
const adminBookDraftStorageKey = 'linery-admin-book-draft-v1'
type AdminBookCreateValues = { isbn: string; title: string; slug: string; coverPriceUsd: string; salePrice: string; comparePrice: string; pages: string; bookSize: string; author: string[]; translator: string[]; illustrator: string[]; format: string; line: string; category: string[]; genre: string[]; topic: string[]; publisher: string; imprint: string; publicationDate: string; weight: string; language: string[]; link: string; description: string }
const emptyAdminBookCreateValues: AdminBookCreateValues = { isbn: '', title: '', slug: '', coverPriceUsd: '', salePrice: '', comparePrice: '', pages: '', bookSize: '', author: [], translator: [], illustrator: [], format: '', line: '', category: [], genre: [], topic: [], publisher: '', imprint: '', publicationDate: '', weight: '', language: [], link: '', description: '' }
type AdminBookDraftPayload = { values?: Partial<AdminBookCreateValues>; isVisible?: boolean; homeModules?: string[]; samplePageCount?: string }
const readAdminBookDraftPayload = (): AdminBookDraftPayload | null => { if (typeof window === 'undefined') return null; try { return JSON.parse(window.localStorage.getItem(adminBookDraftStorageKey) ?? 'null') as AdminBookDraftPayload | null } catch { return null } }
const adminBookDraftFilesDb = 'linery-admin-book-draft-files-v1'
const saveAdminBookDraftFiles = (coverFiles: File[], sampleFile: File | null) => new Promise<void>((resolve) => {
  if (typeof window === 'undefined' || !window.indexedDB) { resolve(); return }
  const request = window.indexedDB.open(adminBookDraftFilesDb, 1)
  request.onupgradeneeded = () => request.result.createObjectStore('draft')
  request.onsuccess = () => { const transaction = request.result.transaction('draft', 'readwrite'); transaction.objectStore('draft').put({ coverFiles, sampleFile }, 'current'); transaction.oncomplete = () => { request.result.close(); resolve() }; transaction.onerror = () => { request.result.close(); resolve() } }
  request.onerror = () => resolve()
})
const loadAdminBookDraftFiles = () => new Promise<{ coverFiles: File[]; sampleFile: File | null }>((resolve) => {
  if (typeof window === 'undefined' || !window.indexedDB) { resolve({ coverFiles: [], sampleFile: null }); return }
  const request = window.indexedDB.open(adminBookDraftFilesDb, 1)
  request.onupgradeneeded = () => request.result.createObjectStore('draft')
  request.onsuccess = () => { const transaction = request.result.transaction('draft', 'readonly'); const get = transaction.objectStore('draft').get('current'); get.onsuccess = () => { request.result.close(); const value = get.result as { coverFiles?: File[]; sampleFile?: File | null } | undefined; resolve({ coverFiles: value?.coverFiles ?? [], sampleFile: value?.sampleFile ?? null }) }; get.onerror = () => { request.result.close(); resolve({ coverFiles: [], sampleFile: null }) } }
  request.onerror = () => resolve({ coverFiles: [], sampleFile: null })
})
const clearAdminBookDraftFiles = () => new Promise<void>((resolve) => {
  if (typeof window === 'undefined' || !window.indexedDB) { resolve(); return }
  const request = window.indexedDB.open(adminBookDraftFilesDb, 1)
  request.onupgradeneeded = () => request.result.createObjectStore('draft')
  request.onsuccess = () => { const transaction = request.result.transaction('draft', 'readwrite'); transaction.objectStore('draft').delete('current'); transaction.oncomplete = () => { request.result.close(); resolve() }; transaction.onerror = () => { request.result.close(); resolve() } }
  request.onerror = () => resolve()
})
type AdminBookKey = keyof Omit<AdminBook, 'id' | 'cover' | 'coverImages'>
type AdminCatalogBook = { id: string; isbn: string; title: string; author: string; cover: string; coverImages?: string[]; quantity: number; unitPrice: number | null; salePrice: number; comparePrice?: number | null; series: string; format: string; line: string; category: string; link: string; goodreads: string; description: string; status: string; visible?: boolean; homeModules?: string[]; slug?: string; pages?: number | null; bookSize?: string; publisher?: string; imprint?: string; publicationDate?: string; weight?: string; language?: string; authors?: string[]; translators?: string[]; illustrators?: string[]; categories?: string[]; topics?: string[]; languages?: string[] }
const adminCatalogBooksStorageKey = 'linery-admin-catalog-books-v1'
const readAdminCatalogBooks = (): AdminCatalogBook[] => {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(window.localStorage.getItem(adminCatalogBooksStorageKey) ?? '[]') as AdminCatalogBook[] } catch { return [] }
}
const writeAdminCatalogBooks = (books: AdminCatalogBook[]) => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(adminCatalogBooksStorageKey, JSON.stringify(books))
    window.dispatchEvent(new Event('linery-admin-books-changed'))
  }
}
type AdminBookSortKey = AdminBookKey | 'stock'
type ImportIssue = { row: number; field: string; message: string }
type ImportReport = { fileName: string; total: number; valid: number; invalid: number; issues: ImportIssue[] }
type ExcelCell = string | number | boolean | Date | null
type BookManagementView = 'books' | 'categories' | 'formats'
type CategoryKind = 'Danh mục' | 'Chủ đề'
type AdminBookFilters = { author: string; format: string; line: string; category: string; stock: 'all' | 'in-stock' | 'out-of-stock'; minSalePrice: string; maxSalePrice: string; minUnitPrice: string; maxUnitPrice: string }
const emptyAdminBookFilters: AdminBookFilters = { author: '', format: '', line: '', category: '', stock: 'all', minSalePrice: '', maxSalePrice: '', minUnitPrice: '', maxUnitPrice: '' }
type AdminAuthorForm = { name: string; classification: 'Tác giả' | 'Dịch giả' | 'Họa sĩ minh họa' | ''; birthYear: string; deathYear: string; gender: string; representativeWorks: string; format: string; genre: string; topics: string; awards: string; academicTitle: string; bio: string; englishLink: string; imageLink: string }
const emptyAdminAuthorForm: AdminAuthorForm = { name: '', classification: '', birthYear: '', deathYear: '', gender: '', representativeWorks: '', format: '', genre: '', topics: '', awards: '', academicTitle: '', bio: '', englishLink: '', imageLink: '' }
type AdminCatalogFormField = { key: keyof AdminAuthorForm; label: string; input?: 'text' | 'number' | 'url' | 'textarea'; required?: boolean; help?: string }
const adminAuthorFormFields: AdminCatalogFormField[] = [
  { key: 'name', label: 'Tên tác giả', required: true }, { key: 'birthYear', label: 'Năm sinh', input: 'number' }, { key: 'deathYear', label: 'Năm mất', input: 'number', help: 'Để trống nếu tác giả còn sống.' }, { key: 'gender', label: 'Giới tính' }, { key: 'format', label: 'Thể thức' }, { key: 'genre', label: 'Thể loại' }, { key: 'topics', label: 'Chủ đề' }, { key: 'englishLink', label: 'Link giới thiệu tiếng Anh', input: 'url' },
]

const siteName = 'Linery Bookstore'
const siteDescription = 'Linery — hiệu sách tuyển chọn và independent press được xây dựng tại Hà Nội.'
const publicSeoViews: View[] = ['home', 'authors', 'author', 'all-books', 'collection', 'detail', 'news', 'news-detail']
type FloatingNoticeTone = 'success' | 'error'
type FloatingNoticeDetail = { tone: FloatingNoticeTone; message: string }
const floatingNoticeEvent = 'linery:floating-notice'
const floatingNoticeStorageKey = 'linery-floating-notice'
const emitFloatingNotice = (tone: FloatingNoticeTone, message: string) => {
  window.dispatchEvent(new CustomEvent<FloatingNoticeDetail>(floatingNoticeEvent, { detail: { tone, message } }))
}
const queueFloatingNotice = (tone: FloatingNoticeTone, message: string) => {
  try { window.sessionStorage.setItem(floatingNoticeStorageKey, JSON.stringify({ tone, message })) } catch { /* storage may be unavailable */ }
}
const describeSaveError = (reason: unknown, fallback: string) => {
  if (reason && typeof reason === 'object') {
    const error = reason as { message?: unknown; details?: unknown; hint?: unknown; code?: unknown }
    if (error.code === '42501') return 'Tài khoản quản trị chưa được cấp quyền ghi dữ liệu. Hãy áp dụng migration cấp quyền admin trên Supabase rồi đăng nhập lại.'
    const parts = [error.message, error.details, error.hint, error.code].filter((part): part is string => typeof part === 'string' && Boolean(part.trim()))
    if (parts.length) return parts.join(' · ')
  }
  if (reason instanceof Error && reason.message) return reason.message
  return fallback
}

function FloatingNoticeHost() {
  const [notices, setNotices] = useState<Array<FloatingNoticeDetail & { id: number }>>([])
  useEffect(() => {
    try {
      const pending = window.sessionStorage.getItem(floatingNoticeStorageKey)
      if (pending) {
        window.sessionStorage.removeItem(floatingNoticeStorageKey)
        const detail = JSON.parse(pending) as FloatingNoticeDetail
        if (detail.message) window.setTimeout(() => window.dispatchEvent(new CustomEvent<FloatingNoticeDetail>(floatingNoticeEvent, { detail })), 0)
      }
    } catch { /* storage may be unavailable */ }
    const handleNotice = (event: Event) => {
      const detail = (event as CustomEvent<FloatingNoticeDetail>).detail
      if (!detail?.message) return
      const id = Date.now() + Math.random()
      setNotices((current) => [...current, { ...detail, id }].slice(-3))
      window.setTimeout(() => setNotices((current) => current.filter((notice) => notice.id !== id)), 4200)
    }
    window.addEventListener(floatingNoticeEvent, handleNotice)
    return () => window.removeEventListener(floatingNoticeEvent, handleNotice)
  }, [])
  return <div className="floating-notice-region" aria-live="polite" aria-atomic="true">{notices.map((notice) => <div className={`floating-notice is-${notice.tone}`} key={notice.id} role={notice.tone === 'error' ? 'alert' : 'status'}><i className={`bi ${notice.tone === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'}`} aria-hidden="true" /><span>{notice.message}</span><button type="button" aria-label="Đóng thông báo" onClick={() => setNotices((current) => current.filter((item) => item.id !== notice.id))}><i className="bi bi-x" aria-hidden="true" /></button></div>)}</div>
}

const LazyCkEditor = lazy(async () => {
  const [{ CKEditor }, { default: ClassicEditor }] = await Promise.all([
    import('@ckeditor/ckeditor5-react'),
    import('@ckeditor/ckeditor5-build-classic'),
  ])
  return { default: (props: Record<string, unknown>) => <CKEditor {...props} editor={ClassicEditor as any} /> }
})

function SeoHead({ view, product, news, author, language }: { view: View; product: Product | null; news: NewsItem | null; author: string; language: Language }) {
  useEffect(() => {
    const origin = window.location.origin
    const pathname = window.location.pathname === '/' ? '/' : window.location.pathname.replace(/\/$/, '')
    const canonicalUrl = `${origin}${pathname}`
    const isPublic = publicSeoViews.includes(view)
    const title = view === 'detail' && product ? `${product.title} | ${siteName}`
      : view === 'news-detail' && news ? `${language === 'vi' ? news.titleVi : news.title} | ${siteName}`
        : view === 'author' ? `${author} | ${siteName}`
          : view === 'authors' ? `Authors | ${siteName}`
            : view === 'all-books' ? `All books | ${siteName}`
              : view === 'collection' ? `Book collection | ${siteName}`
                : view === 'news' ? `Linery News | ${siteName}`
                  : siteName
    const description = view === 'detail' && product ? `${product.title} by ${product.author}. Discover this carefully selected title at Linery Bookstore.`
      : view === 'news-detail' && news ? (language === 'vi' ? news.excerptVi : news.excerpt)
        : view === 'author' ? `Selected works and profile of ${author} at Linery Bookstore.`
          : siteDescription
    const image = view === 'detail' && product ? product.image : view === 'news-detail' && news ? news.image : '/assets/hero-children.png'
    const setMeta = (key: 'name' | 'property', value: string, content: string) => {
      let element = document.head.querySelector(`meta[${key}="${value}"]`) as HTMLMetaElement | null
      if (!element) { element = document.createElement('meta'); element.setAttribute(key, value); document.head.appendChild(element) }
      element.content = content
    }
    setMeta('name', 'description', description)
    setMeta('name', 'robots', isPublic ? 'index,follow,max-image-preview:large' : 'noindex,nofollow')
    setMeta('property', 'og:type', view === 'detail' ? 'product' : view === 'news-detail' ? 'article' : 'website')
    setMeta('property', 'og:site_name', siteName)
    setMeta('property', 'og:title', title)
    setMeta('property', 'og:description', description)
    setMeta('property', 'og:url', canonicalUrl)
    setMeta('property', 'og:image', `${origin}${image}`)
    setMeta('name', 'twitter:card', 'summary_large_image')
    setMeta('name', 'twitter:title', title)
    setMeta('name', 'twitter:description', description)
    setMeta('name', 'twitter:image', `${origin}${image}`)
    document.title = title
    document.documentElement.lang = language === 'vi' ? 'vi' : 'en'
    let canonical = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical) }
    canonical.href = canonicalUrl
    const price = product ? Number(product.price.replace(/[^0-9]/g, '')) : 0
    const jsonLd: Record<string, unknown>[] = [{ '@context': 'https://schema.org', '@type': 'Organization', name: siteName, url: origin }, { '@context': 'https://schema.org', '@type': 'WebSite', name: siteName, url: origin, description: siteDescription }]
    if (view === 'detail' && product) jsonLd.push({ '@context': 'https://schema.org', '@type': 'Product', name: product.title, image: [`${origin}${product.image}`], description, brand: { '@type': 'Brand', name: siteName }, offers: { '@type': 'Offer', priceCurrency: 'VND', price, availability: product.available === false ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock', url: canonicalUrl } })
    if (view === 'news-detail' && news) jsonLd.push({ '@context': 'https://schema.org', '@type': 'Article', headline: language === 'vi' ? news.titleVi : news.title, description, image: `${origin}${news.image}`, articleSection: news.kicker, publisher: { '@type': 'Organization', name: siteName } })
    if (view === 'author') jsonLd.push({ '@context': 'https://schema.org', '@type': 'Person', name: author, url: canonicalUrl, worksFor: { '@type': 'Organization', name: siteName } })
    let script = document.head.querySelector('#linery-seo-jsonld') as HTMLScriptElement | null
    if (!script) { script = document.createElement('script'); script.id = 'linery-seo-jsonld'; script.type = 'application/ld+json'; document.head.appendChild(script) }
    script.textContent = JSON.stringify(jsonLd)
  }, [author, language, news, product, view])
  return null
}
const adminBookFields: Array<{ key: AdminBookKey; label: string; required: boolean; input: 'text' | 'number' | 'url' }> = [
  { key: 'isbn', label: 'ISBN', required: false, input: 'text' },
  { key: 'title', label: 'Tác phẩm', required: true, input: 'text' },
  { key: 'author', label: 'Tác giả', required: true, input: 'text' },
  { key: 'quantity', label: 'Số lượng', required: true, input: 'number' },
  { key: 'unitPrice', label: 'Đơn giá nhập', required: false, input: 'number' },
  { key: 'salePrice', label: 'Giá bán', required: true, input: 'number' },
  { key: 'link', label: 'Link nguồn', required: false, input: 'url' },
  { key: 'format', label: 'Thể thức', required: true, input: 'text' },
  { key: 'line', label: 'Dòng sách', required: false, input: 'text' },
  { key: 'category', label: 'Thể loại', required: true, input: 'text' },
]
const emptyAdminBookForm: Record<AdminBookKey, string> = { isbn: '', title: '', author: '', quantity: '', unitPrice: '', salePrice: '', link: '', format: '', line: '', category: '' }
const loginSlides = [
  { image: '/assets/login-bookstore.png', quote: 'Find a story that feels like coming home.' },
  { image: '/assets/login-library-reader.png', quote: 'Every shelf holds a doorway to somewhere new.' },
  { image: '/assets/login-library-reader-older.png', quote: 'A quiet page can change the way we see the world.' },
  { image: '/assets/login-library-lamp.png', quote: 'Read slowly. Let the story stay with you.' },
  { image: '/assets/login-library-woman.png', quote: 'Books make room for wonder.' },
]
const isEnhancedVariant = import.meta.env.VITE_LINERY_VARIANT === 'enhanced'
const nghiTtsVoices: Record<'vi-VN' | 'en-US', string[]> = {
  'vi-VN': ['Ngọc Huyền (mới)', 'Ban Mai', 'Chiếu Thành', 'Duy Onyx (mới)', 'Lạc Phi', 'Mai Phương', 'Minh Khang', 'Minh Quang', 'Mạnh Dũng', 'Mỹ Tâm', 'Ngọc Ngạn', 'Phương Trang', 'Thanh Phương Viettel', 'Thiện Tâm', 'Trấn Thành', 'Tài An', 'Việt Thảo'],
  'en-US': ['Libritts_r', 'Mattheo'],
}
const welcomeStorageKey = 'linery-welcome-seen-v3'

function HamburgerIcon() {
  return <svg className="hamburger-icon" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
    <path d="M0 8h32M0 16h32M0 24h32" fill="none" stroke="currentColor" strokeLinecap="butt" strokeWidth="1.5" />
  </svg>
}

function WelcomeScreen({ onSelectLanguage }: { onSelectLanguage: (language: 'en' | 'vi') => void }) {
  return <section className="welcome-screen" aria-label="Welcome to Linery Bookstore">
    <div className="welcome-content">
      <p className="welcome-mark">LINERY</p>
      <h1>LINERY BOOKSTORE</h1>
      <p className="welcome-description">A curated bookstore &amp; independent press, crafted in Hanoi</p>
      <div className="welcome-language" aria-label="Choose language">
        <p>Choose your language</p>
        <div className="welcome-language-options">
          <button type="button" onClick={() => onSelectLanguage('en')}>English</button>
          <button type="button" onClick={() => onSelectLanguage('vi')}>Tiếng Việt</button>
        </div>
      </div>
    </div>
  </section>
}
function RibbonTitle({ title, id, heading = false }: { title: string; id?: string; heading?: boolean }) {
  const Label = (heading ? 'h1' : 'span') as ElementType
  return <div className={`ribbon-title ${heading ? 'ribbon-title-heading' : ''}`}>
    <img className="ribbon ribbon-left" src="/assets/ribbon-left.svg" alt="" aria-hidden="true" />
    <Label className="ribbon-title-label" id={id}>{title}</Label>
    <img className="ribbon ribbon-right" src="/assets/ribbon-right.svg" alt="" aria-hidden="true" />
  </div>
}
// Storefront data is loaded from Supabase. Keep these empty until the backend
// responds so removed demo covers cannot flash or silently become the catalog.
let products: Product[] = []
let artbookProducts: Product[] = []
let limitedProducts: Product[] = []
let catalogProducts: Product[] = []

const adminBooksStorageKey = 'linery-admin-books-v2'
const verifiedIsbnByTitle: Record<string, string> = {
  'Educated': '9780399590528',
  'Memoirs from Beyond the Grave': '9781681379616',
  'The Word of the Speechless': '9781681373232',
  'Valentino and Sagittarius': '9781681374741',
}
const parseDemoPrice = (value: string | number | null | undefined) => {
  const parsed = Number(String(value ?? '').replace(/[^0-9]/g, ''))
  return Number.isFinite(parsed) ? parsed : 0
}
const toLegacyAdminBook = (book: AdminCatalogBook): AdminBook => ({
  id: book.id,
  isbn: book.isbn,
  title: book.title,
  author: book.author,
  quantity: book.quantity,
  unitPrice: book.unitPrice,
  salePrice: book.salePrice,
  link: book.link,
  format: book.format,
  line: book.line,
  category: book.category,
  cover: book.coverImages?.[0] || book.cover,
  coverImages: book.coverImages,
})
const normalizeAdminIsbn = (value: unknown) => {
  const isbn = String(value ?? '').trim()
  return /^\d{13}$/.test(isbn) ? isbn : ''
}
const readAdminBooks = (): AdminBook[] => {
  if (typeof window === 'undefined') return []
  try {
    const stored = JSON.parse(window.localStorage.getItem(adminBooksStorageKey) ?? '[]') as AdminBook[]
    if (Array.isArray(stored) && stored.length) return stored.map((book, index) => ({
      ...book,
      id: book.id ?? `stored-book-${index + 1}`,
      isbn: /^DEMO-\d+$/.test(book.isbn) ? verifiedIsbnByTitle[book.title] ?? '' : normalizeAdminIsbn(book.isbn),
      cover: book.coverImages?.[0] ?? book.cover ?? catalogProducts.find((product) => product.title === book.title)?.image,
      coverImages: book.coverImages,
    }))
    const catalogBooks = readAdminCatalogBooks()
    if (catalogBooks.length) return catalogBooks.map(toLegacyAdminBook)
    return catalogProducts.map((product, index) => ({
      id: `demo-book-${index + 1}`,
      isbn: verifiedIsbnByTitle[product.title] ?? '',
      title: product.title,
      author: product.author,
      quantity: product.available === false ? 0 : 1,
      unitPrice: null,
      salePrice: parseDemoPrice(product.price),
      link: '',
      format: product.format ?? '',
      line: product.publisher,
      category: product.categories[0] ?? '',
      cover: product.image,
    }))
  } catch {
    return catalogProducts.map((product, index) => ({
      id: `demo-book-${index + 1}`,
      isbn: verifiedIsbnByTitle[product.title] ?? '',
      title: product.title,
      author: product.author,
      quantity: product.available === false ? 0 : 1,
      unitPrice: null,
      salePrice: parseDemoPrice(product.price),
      link: '',
      format: product.format ?? '',
      line: product.publisher,
      category: product.categories[0] ?? '',
      cover: product.image,
    }))
  }
}
const writeAdminBooks = (books: AdminBook[]) => {
  if (typeof window !== 'undefined') window.localStorage.setItem(adminBooksStorageKey, JSON.stringify(books))
}

const newsItems: NewsItem[] = [
  {
    image: '/assets/emagazine/hue-heritage/01a13979-fa87-7422-8515-5d06644dd521.png',
    title: hueEmagazine.title,
    titleVi: hueEmagazine.titleVi,
    date: hueEmagazine.date,
    kicker: hueEmagazine.kicker,
    slug: 'di-san-hue-doi-dien-nhieu-thach-thuc',
    excerpt: hueEmagazine.excerpt,
    excerptVi: hueEmagazine.excerpt,
    body: [],
    bodyVi: [],
    byline: hueEmagazine.byline,
    blocks: hueEmagazine.blocks as PublicNewsBlock[],
    blocksVi: hueEmagazine.blocks as PublicNewsBlock[],
    contentType: 'emagazine',
  },
  {
    image: '/assets/news-instagram-01.jpg',
    title: 'Women read about women',
    titleVi: 'Phụ nữ đọc về phụ nữ',
    date: 'Book notes',
    kicker: 'Book notes',
    slug: 'women-read-about-women',
    excerpt: 'A reading list about women, independence, identity, and the many ways literature helps us see ourselves.',
    excerptVi: 'Một danh sách đọc về phụ nữ, sự độc lập, bản sắc và cách văn chương giúp chúng ta nhìn lại chính mình.',
    body: ['There is something fascinating about reading books written about women: the more we read, the more we begin to notice the beliefs and conventions that have shaped everyday life.', 'These books open new ways of seeing the world. They do not offer one definition of womanhood; they make space for each reader to find her own answers, on her own terms.'],
    bodyVi: ['Có điều gì đó thật đặc biệt khi đọc những cuốn sách viết về phụ nữ: càng đọc, ta càng nhận ra những niềm tin và quy ước đã định hình đời sống thường ngày.', 'Những cuốn sách này mở ra nhiều cách nhìn mới về thế giới. Chúng không đưa ra một định nghĩa duy nhất về phụ nữ, mà tạo không gian để mỗi độc giả tự tìm câu trả lời cho mình.'],
  },
  {
    image: '/assets/news-instagram-02.jpg',
    title: 'Toni Morrison: memory and the past',
    titleVi: 'Toni Morrison: ký ức và quá khứ',
    date: 'Book notes',
    kicker: 'Book notes',
    slug: 'toni-morrison-memory-and-the-past',
    excerpt: 'Toni Morrison writes about memory as something that stays with the body, the home, and the people we become.',
    excerptVi: 'Toni Morrison viết về ký ức như một điều ở lại trong cơ thể, mái nhà và con người mà chúng ta trở thành.',
    body: ['In Morrison’s books, the past is never truly still. It returns through a house, a scar, a touch, a fear, or an apparently ordinary act of love.', 'Her characters are difficult to reduce to a line between right and wrong. They carry loss, violence, survival, and the long work of learning how to belong to themselves.'],
    bodyVi: ['Trong sách của Morrison, quá khứ chưa bao giờ thực sự đứng yên. Nó trở lại qua một ngôi nhà, vết sẹo, cái chạm, nỗi sợ hoặc một hành động yêu thương tưởng như bình thường.', 'Các nhân vật của bà không dễ bị phân định đơn giản giữa đúng và sai. Họ mang theo mất mát, bạo lực, sự sinh tồn và hành trình dài để học cách thuộc về chính mình.'],
  },
  {
    image: '/assets/news-instagram-03.jpg',
    title: 'The Temple of Golden Pavilion',
    titleVi: 'Kim Các Tự',
    date: 'From the shelf',
    kicker: 'From the shelf',
    slug: 'the-temple-of-golden-pavilion',
    excerpt: 'Yukio Mishima’s novel follows a young man whose ideal of beauty becomes impossible to live with.',
    excerptVi: 'Cuốn tiểu thuyết của Yukio Mishima kể về một chàng trai không thể sống yên với lý tưởng về cái đẹp của mình.',
    body: ['Mizoguchi grows up loving the Golden Pavilion through his father’s stories before he has ever seen it. When he finally reaches Kyoto, the imagined temple begins to stand between him and ordinary life.', 'Mishima turns a historical event into a study of beauty, obsession, and the distance between an ideal and the world that surrounds it.'],
    bodyVi: ['Mizoguchi lớn lên với tình yêu dành cho Kim Các Tự qua những câu chuyện của cha trước cả khi được nhìn thấy ngôi chùa. Khi đến Kyoto, ngôi chùa trong tưởng tượng bắt đầu đứng giữa cậu và cuộc sống bình thường.', 'Mishima biến một sự kiện lịch sử thành câu chuyện về cái đẹp, sự ám ảnh và khoảng cách giữa lý tưởng với thế giới xung quanh.'],
  },
  {
    image: '/assets/news-instagram-04.jpg',
    title: 'The Sound of Waves',
    titleVi: 'Âm thanh của sóng',
    date: 'From the shelf',
    kicker: 'From the shelf',
    slug: 'the-sound-of-waves',
    excerpt: 'A quiet island love story, told with the tenderness and rhythm of the sea.',
    excerptVi: 'Một câu chuyện tình lặng lẽ trên đảo, được kể bằng sự dịu dàng và nhịp điệu của biển.',
    body: ['Set on the secluded island of Utajima, the novel follows Shinji and Hatsue as their love unfolds among fishing boats, sea winds, and the endless rhythm of the waves.', 'Nature is never merely a backdrop. The island’s isolation gives small gestures meaning and reveals a gentler side of Mishima’s writing.'],
    bodyVi: ['Lấy bối cảnh hòn đảo biệt lập Utajima, tiểu thuyết theo chân Shinji và Hatsue khi tình yêu của họ nảy nở giữa thuyền đánh cá, gió biển và nhịp sóng bất tận.', 'Thiên nhiên không chỉ là phông nền. Sự biệt lập của hòn đảo khiến những cử chỉ nhỏ trở nên có ý nghĩa và cho thấy một mặt dịu dàng hơn trong văn chương Mishima.'],
  },
  {
    image: '/assets/news-instagram-01.jpg', title: 'Giới thiệu LineryBooks', titleVi: 'Giới thiệu LineryBooks', date: 'About us', kicker: 'About us', slug: 'gioi-thieu', excerpt: 'LineryBooks là hiệu sách tuyển chọn và independent press được xây dựng tại Hà Nội.', excerptVi: 'LineryBooks là hiệu sách tuyển chọn và independent press được xây dựng tại Hà Nội.', body: ['LineryBooks tuyển chọn những cuốn sách có giá trị đọc lâu dài, đồng thời tạo không gian cho các tiếng nói văn chương và ý tưởng độc lập.'], bodyVi: ['LineryBooks tuyển chọn những cuốn sách có giá trị đọc lâu dài, đồng thời tạo không gian cho các tiếng nói văn chương và ý tưởng độc lập.'],
  },
  {
    image: '/assets/news-instagram-02.jpg', title: 'Liên hệ LineryBooks', titleVi: 'Liên hệ LineryBooks', date: 'About us', kicker: 'About us', slug: 'lien-he', excerpt: 'Thông tin liên hệ, địa chỉ và các kênh kết nối với LineryBooks.', excerptVi: 'Thông tin liên hệ, địa chỉ và các kênh kết nối với LineryBooks.', body: ['Bạn có thể liên hệ LineryBooks qua email info@linerybooks.vn hoặc ghé Phố Sách 19/12, Cửa Nam, Hà Nội.'], bodyVi: ['Bạn có thể liên hệ LineryBooks qua email info@linerybooks.vn hoặc ghé Phố Sách 19/12, Cửa Nam, Hà Nội.'],
  },
  {
    image: '/assets/news-instagram-03.jpg', title: 'Chính sách LineryBooks', titleVi: 'Chính sách LineryBooks', date: 'Policies', kicker: 'Policies', slug: 'chinh-sach', excerpt: 'Các chính sách mua hàng, giao hàng, đổi trả và bảo mật của LineryBooks.', excerptVi: 'Các chính sách mua hàng, giao hàng, đổi trả và bảo mật của LineryBooks.', body: ['Nội dung chính sách sẽ được cập nhật từ khu vực quản trị và hiển thị thống nhất trên website.'], bodyVi: ['Nội dung chính sách sẽ được cập nhật từ khu vực quản trị và hiển thị thống nhất trên website.'],
  },
  {
    image: '/assets/news-instagram-04.jpg', title: 'Điều khoản sử dụng', titleVi: 'Điều khoản sử dụng', date: 'Policies', kicker: 'Policies', slug: 'dieu-khoan', excerpt: 'Điều khoản sử dụng website và các dịch vụ của LineryBooks.', excerptVi: 'Điều khoản sử dụng website và các dịch vụ của LineryBooks.', body: ['Nội dung điều khoản sẽ được cập nhật từ khu vực quản trị và hiển thị thống nhất trên website.'], bodyVi: ['Nội dung điều khoản sẽ được cập nhật từ khu vực quản trị và hiển thị thống nhất trên website.'],
  },
]
// Enhanced storefront news is backend-only. Keep the classic visual variant
// compatible with its checked-in fixture data, but never flash those fixtures
// into the Supabase-backed storefront while the query is in flight or empty.
let runtimeNewsItems: NewsItem[] = isEnhancedVariant ? [] : [...newsItems]
const getNewsFromPath = (pathname: string) => {
  const slug = pathname.split('/').pop() ?? ''
  const legacySlug = slug === 'ong-troi-ba-troi-trong-tranh-lac-long-quan-au-co'
    ? 'di-san-hue-doi-dien-nhieu-thach-thuc'
    : slug

  return runtimeNewsItems.find((item) => item.slug === legacySlug) ?? null
}
const applyPublicNews = (records: PublicNewsPost[]) => {
  runtimeNewsItems = records.map((record) => ({ ...record }))
}

const authorProfiles: Record<string, { image: string; images?: string[]; born: string; died: string; bornPlace: string; diedPlace: string; awards: number; academicTitle: string; bio: string }> = {
  'Edward W. Said': {
    image: '/assets/author-edward-w-said.png',
    images: ['/assets/author-edward-w-said.png', '/assets/author-edward-w-said-02.jpg', '/assets/author-edward-w-said-03.jpg'],
    born: '1 Nov 1935',
    died: '25 Sep 2003',
    bornPlace: 'Jerusalem, Palestine',
    diedPlace: 'New York, U.S.',
    awards: 7,
    academicTitle: 'PhD · Parr Professor of English and Comparative Literature',
    bio: 'Edward W. Said was a Palestinian-American literary critic, cultural theorist and public intellectual. He earned an AB from Princeton and an AM and PhD from Harvard, then taught at Columbia University, where he became the Parr Professor of English and Comparative Literature. His books Orientalism and Culture and Imperialism reshaped literary and cultural studies, while his writing and public work advocated for Palestinian national rights.',
  },
}

const normalizeProfileList = (value: string[] | string | number | null | undefined): string[] => {
  if (Array.isArray(value)) return value.filter(Boolean).map(String)
  if (typeof value === 'number') return []
  const text = String(value ?? '').trim()
  return text && text !== '—' && text !== '-' ? text.split(/[;\n]+/).map((item) => item.trim()).filter(Boolean) : []
}
const PUBLIC_AUTHOR_AVATAR_FALLBACK = '/assets/author-avatar-placeholder.png'
let runtimeAuthorProfiles: Record<string, PublicCreatorProfile> = {}
const authorSlug = (author: string) => author.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-')
const productSlug = (title: string) => title.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-')
const normalizeProductCategory = (category: string) => category.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
const normalizeProductCategories = (categories: string[]) => {
  const uniqueCategories = [...new Set(categories.map((category) => category.trim()).filter(Boolean))]
  const normalized = new Set(uniqueCategories.map(normalizeProductCategory))
  if (!normalized.has('fiction') || !normalized.has('non fiction')) return uniqueCategories
  const fictionSignals = ['novels', 'short stories', 'poetry drama']
  const nonFictionSignals = ['essays', 'research studies', 'memoir biography']
  const hasFictionSignal = fictionSignals.some((signal) => normalized.has(signal))
  const hasNonFictionSignal = nonFictionSignals.some((signal) => normalized.has(signal))
  const remove = hasFictionSignal && !hasNonFictionSignal ? 'non fiction' : hasNonFictionSignal && !hasFictionSignal ? 'fiction' : 'non fiction'
  return uniqueCategories.filter((category) => normalizeProductCategory(category) !== remove)
}
const getProductFromPath = (pathname: string) => {
  const slug = pathname.startsWith('/books/') ? pathname.split('/')[2] ?? '' : ''
  return catalogProducts.find((product) => productSlug(product.title) === slug) ?? null
}
const getAuthorFromPath = (pathname: string) => {
  const slug = pathname.startsWith('/authors/') || pathname.startsWith('/creators/') ? pathname.split('/').pop() ?? '' : ''
  if (!slug) return ''
  const knownAuthor = catalogProducts.find((product) => authorSlug(product.author) === slug)?.author ?? Object.keys(authorProfiles).find((author) => authorSlug(author) === slug)
  if (knownAuthor) return knownAuthor
  return slug.split('-').map((part) => part ? `${part[0].toUpperCase()}${part.slice(1)}` : '').join(' ')
}
const getViewFromPath = (pathname: string, hash: string): View => {
  if (pathname === '/admin' || pathname.startsWith('/admin/')) return 'admin'
  if (hash === '#login') return 'login'
  if (hash === '#register') return 'register'
  if (hash === '#forgot-password') return 'forgot-password'
  if (hash === '#password-reset-sent') return 'password-reset-sent'
  if (hash === '#reset-password' || hash.startsWith('#reset-password#') || hash.includes('type=recovery')) return 'reset-password'
  if (hash === '#password-reset-complete') return 'password-reset-complete'
  if (hash === '#account') return 'account'
  if (pathname === '/authors' || pathname === '/creators') return 'authors'
  if (pathname === '/all-books') return 'all-books'
  if (pathname.startsWith('/collections/') && getCollectionTitleFromPath(pathname)) return 'collection'
  if (pathname === '/search') return 'search'
  if (pathname === '/cart') return 'cart'
  if (pathname === '/checkout') return 'checkout'
  if (pathname.startsWith('/books/') && pathname.endsWith('/reader') && getProductFromPath(pathname)) return 'book-reader'
  if (pathname === '/news') return 'news'
  if (pathname.startsWith('/news/') && getNewsFromPath(pathname)) return 'news-detail'
  if ((pathname.startsWith('/authors/') || pathname.startsWith('/creators/')) && getAuthorFromPath(pathname)) return 'author'
  if (pathname.startsWith('/books/') && getProductFromPath(pathname)) return 'detail'
  return 'home'
}
const getWriterFilterFromSearch = (search: string): WriterDirectoryFilter => {
  const filter = new URLSearchParams(search).get('type')
  return filter === 'authors' || filter === 'translators' || filter === 'illustrators' ? filter : 'all'
}

let sections = [
  { title: 'NEW & UPCOMING', items: products },
  { title: 'LINERY PRESS', items: products },
  { title: 'LINERY PICKS', items: products },
  { title: 'GRAB & SAVE', items: limitedProducts },
]
let runtimeAuthorColumns: MenuColumn[] = []
let runtimeTranslatorColumns: MenuColumn[] = []
let runtimeIllustratorColumns: MenuColumn[] = []

const applyPublicCatalog = (records: PublicCatalogProduct[]) => {
  const mapped = [...new Map(records.filter((record) => record.id && record.title).map((record) => [record.id, { ...record, categories: normalizeProductCategories(record.categories) }])).values()]
  const makeWriterColumns = (names: string[]): MenuColumn[] => {
    const grouped = new Map<string, string[]>()
    names.sort((first, second) => first.localeCompare(second, undefined, { sensitivity: 'base' })).forEach((name) => {
      const eyebrow = name.trim().charAt(0).toUpperCase() || '#'
      grouped.set(eyebrow, [...(grouped.get(eyebrow) ?? []), name])
    })
    return [...grouped.entries()].map(([eyebrow, links]) => ({ eyebrow, links }))
  }
  const byModule = (slug: string) => {
    const linked = mapped.filter((product) => product.moduleSlugs.includes(slug))
    return [...linked].sort((left, right) => (left.moduleSortOrders?.[slug] ?? Number.MAX_SAFE_INTEGER) - (right.moduleSortOrders?.[slug] ?? Number.MAX_SAFE_INTEGER) || (left.id ?? '').localeCompare(right.id ?? ''))
  }
  products = mapped
  artbookProducts = mapped.filter((product) => product.moduleSlugs.includes('linery-art-books') || product.categories.some((category) => /art|design/i.test(category)))
  limitedProducts = mapped.filter((product) => product.moduleSlugs.includes('grab-save')).map((product) => ({ ...product, limited: true }))
  catalogProducts = [...mapped]
  runtimeAuthorColumns = makeWriterColumns([...new Set(mapped.filter((product) => product.writerType === 'Authors').map((product) => product.author))])
  runtimeTranslatorColumns = makeWriterColumns([...new Set(mapped.flatMap((product) => product.translators))])
  runtimeIllustratorColumns = makeWriterColumns([...new Set(mapped.flatMap((product) => product.illustrators))])
  sections = [
    { title: 'NEW & UPCOMING', items: byModule('new-upcoming') },
    { title: 'LINERY PRESS', items: byModule('linery-press') },
    { title: 'LINERY PICKS', items: byModule('linery-picks') },
    { title: 'GRAB & SAVE', items: limitedProducts.length > 0 ? limitedProducts : byModule('grab-save').map((product) => ({ ...product, limited: true })) },
  ]
}

// Hydrate the storefront synchronously from the last verified catalog snapshot.
// The network refresh below still replaces it with current Supabase data.
const initialCachedCatalog = getCachedPublicCatalogProducts()
if (initialCachedCatalog?.length) applyPublicCatalog(initialCachedCatalog)

const homepageModules = ['New & Upcoming', 'Linery Press', 'Linery Picks', 'Grab & Save']
const collectionTitles = ['New & Upcoming', 'Linery Press', 'Linery Picks', 'Linery Art Books', 'Grab & Save'] as const
const uiText = {
  en: {
    books: 'Books', writers: 'Creators', viewAll: 'View All', newUpcoming: 'New & Upcoming', lineryPress: 'Linery Press', lineryPicks: 'Linery Picks', lineryArtBooks: 'Linery Art Books', allBooks: 'All Books', grabSave: 'Grab & Save', fiction: 'Fiction', nonFiction: 'Non-fiction', searchBooks: 'Search books', filterSort: 'Filter & sort', publishers: 'Publishers', sortBy: 'Sort by', clear: 'Clear', applyFilter: 'Apply filter', default: 'Default', noBooks: 'No books match these filters.'
  },
  vi: {
    books: 'Sách', writers: 'Đội ngũ sáng tạo', viewAll: 'Xem tất cả', newUpcoming: 'Sách mới & sắp ra mắt', lineryPress: 'Linery Press', lineryPicks: 'Linery Picks', lineryArtBooks: 'Sách nghệ thuật Linery', allBooks: 'Tất cả sách', grabSave: 'Ưu đãi giới hạn', fiction: 'Văn học hư cấu', nonFiction: 'Phi hư cấu', searchBooks: 'Tìm sách', filterSort: 'Lọc & sắp xếp', publishers: 'Nhà xuất bản', sortBy: 'Sắp xếp theo', clear: 'Xóa', applyFilter: 'Áp dụng bộ lọc', default: 'Mặc định', noBooks: 'Không tìm thấy sách phù hợp.'
  }
} as const
type Language = keyof typeof uiText
const tx = (language: Language, key: keyof typeof uiText.en) => uiText[language][key]
const translatedCollectionTitle = (title: string, language: Language) => {
  if (language === 'en') return title
  const translations: Record<string, string> = { 'New & Upcoming': uiText.vi.newUpcoming, 'Linery Press': uiText.vi.lineryPress, 'Linery Picks': uiText.vi.lineryPicks, 'Linery Art Books': uiText.vi.lineryArtBooks, 'Grab & Save': uiText.vi.grabSave }
  return translations[title] ?? title
}
const translatedShopLabel = (label: string, language: Language) => {
  if (language === 'en') return label
  const translations: Record<string, string> = {
    Fiction: uiText.vi.fiction,
    'Non-fiction': uiText.vi.nonFiction,
    Novels: 'Tiểu thuyết',
    'Short stories': 'Truyện ngắn',
    'Poetry & Drama': 'Thơ ca & Kịch',
    Essays: 'Bài luận',
    'Research & Studies': 'Nghiên cứu & Khảo sát',
    'Memoir & Biography': 'Hồi ký & Tiểu sử',
  }
  return translations[label] ?? label
}
const translatedWriterGroup = (label: string, language: Language) => {
  if (language === 'en') return label
  const translations: Record<string, string> = { Role: 'Vai trò', Gender: 'Giới tính', 'Cultural Region': 'Khu vực văn hóa', Era: 'Kỷ nguyên' }
  return translations[label] ?? label
}
const translatedWriterLink = (label: string, language: Language) => {
  if (language === 'en') return label
  const translations: Record<string, string> = { Author: 'Tác giả', Translator: 'Dịch giả', Illustrator: 'Họa sĩ minh họa', Male: 'Nam', Female: 'Nữ', Other: 'Khác', Vietnamese: 'Việt Nam', 'East Asian': 'Đông Á', 'Western (US & Europe)': 'Phương Tây (Mỹ & châu Âu)', 'Middle Eastern': 'Trung Đông', 'Latin American': 'Mỹ Latinh', 'Ancient & Medieval': 'Cổ đại & Trung cổ', 'Renaissance & Enlightenment': 'Phục hưng & Khai sáng', '19th-Century Romanticism & Realism': 'Lãng mạn & Hiện thực thế kỷ 19', 'Post-modernism': 'Hậu hiện đại', 'Digital & Contemporary': 'Kỹ thuật số & đương đại' }
  return translations[label] ?? label
}
const collectionSlug = (title: string) => title.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-')
const getCollectionTitleFromPath = (pathname: string) => {
  const slug = pathname.startsWith('/collections/') ? pathname.split('/').pop() ?? '' : ''
  return collectionTitles.find((title) => collectionSlug(title) === slug) ?? null
}

type MenuColumn = { eyebrow: string; links: string[] }
const desktopShopColumns: MenuColumn[] = [
  { eyebrow: '', links: ['All books', 'New & Upcoming', 'Linery Press', 'Linery Picks', 'Linery Art Books'] },
  { eyebrow: 'Fiction', links: ['Novels', 'Short stories', 'Poetry & Drama'] },
  { eyebrow: 'Non-fiction', links: ['Essays', 'Research & Studies', 'Memoir & Biography'] },
]

const authorColumns: MenuColumn[] = [
  { eyebrow: 'A', links: ['Alaa Abd el-Fattah', 'Matthew Aikins', 'Bushra al-Maqtari', 'Svetlana Alexievich', 'Nuar Alsadir', 'Carlos Manuel Álvarez', 'Jon Lee Anderson', 'Mário de Andrade', 'Gina Apostol', 'Ed Atkins', 'Jessica Au', 'Polly Barton', 'Simone de Beauvoir', 'Kirsty Bell', 'Claire-Louise Bennett', 'Hélène Bessette', 'Eula Biss', 'José Henrique Bortoluci', 'Kate Briggs', 'Marianne Brooker', 'Jonathan Buckley'] },
  { eyebrow: 'C', links: ['Elias Canetti', 'Clare Carlisle', 'Javier Cercas', 'Joshua Cohen', 'Jeremy Cooper', 'Peter Cornell', 'Simon Critchley', 'Marie Darrieussecq', 'Moyra Davey', 'Anne de Marcken', 'Sasha Debevec-McKenney', 'Jean-Baptiste Del Amo', 'Virginie Despentes', 'Brian Dillon', 'Claudia Durastanti', 'Ben Eastham', 'Mathias Énard', 'Annie Ernaux', 'Annie Ernaux and Marc Marie', 'Eve Esfandiari-Denné', 'Jacqueline Feldman', 'Jon Fosse', 'Dan Fox', 'Charlie Fox', 'Janet Frame'] },
  { eyebrow: 'G', links: ['Keith Gessen', 'Hélène Giannicchini', 'Phoebe Giannisi', 'Rainald Goetz', 'Witold Gombrowicz', 'Makenna Goodman', 'Maxim Gorky', 'Camilla Grudova', 'Munir Hachemi', 'Mercedes Halfon', 'Alice Hattrick', 'Gregor Hens', 'Christina Hesselholdt', 'Sheila Heti', 'Daisy Hildyard', 'Elfriede Jelinek', 'Mieko Kanai', 'Balsam Karam', 'John Keene', 'Esther Kinsky'] },
  { eyebrow: 'L', links: ['Patrick Langley', 'Vincenzo Latronico', 'Marz̧orata Lebda', 'Sylvia Legris', 'Thea Lenarduzzi', 'Ben Lerner', 'Jonathan Littell and Antoine D’Agata', 'Benoît Loiseau', 'Agustín Fernández Mallo', 'Adam Mars-Jones', 'Laurent Mauvignier', 'Heather McCalden', 'Mary McCarthy', 'Matthew McNaught', 'Kirill Medvedev', 'Fernanda Melchor', 'Clemens Meyer', 'Guadalupe Nettel', 'Jonathan Nunn', 'Oluwaseun Olaiyowola', 'Vanessa Onwuemezi', 'Ian Penman', 'Holly Pester', 'Joanna Pocock', 'Paul B. Preciado'] },
  { eyebrow: 'R', links: ['Matthew Rice', 'Keith Ridgway', 'Jacqueline Rose', 'Mary Ruefle', 'Edward W. Said', 'Ariel Saramandi', 'Giada Scodellaro', 'Diane Seuss', 'Adania Shibli', 'Natasha Soobramanien and Luke Williams', 'Gertude Stein', 'Maria Stepanova', 'Olga Tokarczuk', 'Jean-Philippe Toussaint', 'Dorothy Tse', 'Maria Tumarkin', 'Katharina Volckmer', 'Francesca Wade', 'John A. Williams', 'Samar Yazbek', 'Alejandro Zambra'] },
]

const translatorColumns: MenuColumn[] = [
  { eyebrow: 'B', links: ['Polly Barton', 'Daniel Levin Becker', 'Rahul Bery', 'Kate Briggs', 'Natascha Bruce', 'Thomas Bunstead', 'Jen Calleja', 'Jennifer Croft', 'Katy Derbyshire', 'Katrina Dodson', 'Sasha Dugdale'] },
  { eyebrow: 'F', links: ['Peter Filkins', 'Ian Galbraith', 'Paul Russell Garrett', 'Keith Gessen', 'Chris Hall', 'Elizabeth Harris', 'Rosalind Harvey', 'Gita Honegger', 'Penny Hueston', 'Sophie Hughes', 'Sawad Hussain'] },
  { eyebrow: 'J', links: ['Elisabeth Jaquette', 'Bryan Karetnyk', 'Grethe Kvernæs', 'Tanya Leslie', 'Antonia Lloyd-Jones', 'Charlotte Mandell', 'Megan McDowell', 'Anne McLean', 'Anna Moschovakis'] },
  { eyebrow: 'O', links: ['Patrick O’Brian', 'Leri Price', 'Mira Rosenthal', 'Julia Sanches', 'Caroline Schmidt', 'Damion Searls', 'Bela Shayevich', 'Brian Sneeden', 'Carol Stewart', 'Alison L. Strayer'] },
  { eyebrow: 'V', links: ['Saskia Vogel', 'Francesca Wade', 'Adrian Nathan West', 'Shaun Whiteside', 'Natasha Wimmer', 'Frank Wynne'] },
]

const writerMenuGroups: MenuColumn[] = [
  { eyebrow: 'Role', links: ['Author', 'Translator', 'Illustrator'] },
  { eyebrow: 'Gender', links: ['Male', 'Female', 'Other'] },
  { eyebrow: 'Cultural Region', links: ['Vietnamese', 'East Asian', 'Western (US & Europe)', 'Middle Eastern', 'Latin American'] },
  { eyebrow: 'Era', links: ['Ancient & Medieval', 'Renaissance & Enlightenment', '19th-Century Romanticism & Realism', 'Post-modernism', 'Digital & Contemporary'] },
]

const writerMenuHref = (group: MenuColumn, link: string) => {
  if (link === 'Author') return '/creators?type=authors'
  if (link === 'Translator') return '/creators?type=translators'
  return `/creators?${group.eyebrow.toLowerCase().replaceAll(' ', '-')}=${encodeURIComponent(link)}`
}

function MenuColumns({ columns }: { columns: MenuColumn[] }) {
  return <div className="menu-columns">{columns.map((column) => <div className="menu-column" key={column.eyebrow}><p className="menu-eyebrow">{column.eyebrow}</p>{column.links.map((link) => <a href={`/creators/${authorSlug(link)}`} key={link}>{link}</a>)}</div>)}</div>
}

function ShopMenu({ isOpen, onAllBooks, onCollection, language }: { isOpen: boolean; onAllBooks: () => void; onCollection: (title: string) => void; language: Language }) {
  return <section className={`shop-menu menu-navigation ${isOpen ? 'is-open' : ''}`} aria-label="Books categories" aria-hidden={!isOpen}>
    <div className="shop-menu-inner menu-navigation-inner">
      <div className="shop-menu-columns menu-navigation-list">
        {desktopShopColumns.map((column, columnIndex) => <div className={`shop-menu-column menu-section menu-branch menu-level-${columnIndex === 0 ? 0 : 1}`} key={column.eyebrow || column.links[0]}>
          {column.eyebrow && <p className="menu-eyebrow menu-section-title">{translatedShopLabel(column.eyebrow, language)}</p>}
          {column.links.filter((link) => link !== 'All books').map((link) => {
            const isCollection = collectionTitles.includes(link as typeof collectionTitles[number])
            const categoryHref = `/all-books?category=${encodeURIComponent(link.toLowerCase().replaceAll(' ', '-'))}`
            return <a className="menu-item menu-item-link menu-item-text" href={isCollection ? `/collections/${collectionSlug(link)}` : categoryHref} key={link} onClick={isCollection ? (event) => { event.preventDefault(); onCollection(link) } : undefined}><span>{isCollection ? translatedCollectionTitle(link, language) : translatedShopLabel(link, language)}</span></a>
          })}
          </div>)}
      </div>
    </div>
  </section>
}

function WritersMenu({ isOpen, onAllWriters, onAuthors, onTranslators, language }: { isOpen: boolean; onAllWriters: () => void; onAuthors: () => void; onTranslators: () => void; language: Language }) {
  return <section className={`writers-menu menu-navigation ${isOpen ? 'is-open' : ''}`} aria-label="Writers categories" aria-hidden={!isOpen}>
    <div className="writers-menu-inner menu-navigation-inner">
      <div className="writers-menu-list">
        <div className="writers-menu-grid">
          {writerMenuGroups.map((group) => <div className="writers-menu-group menu-section menu-branch" key={group.eyebrow}>
            <p className="menu-eyebrow menu-section-title">{translatedWriterGroup(group.eyebrow, language)}</p>
            {group.links.map((link) => {
              const isAuthor = link === 'Author'
              const isTranslator = link === 'Translator'
              const href = writerMenuHref(group, link)
              const onClick = isAuthor ? (event: React.MouseEvent<HTMLAnchorElement>) => { event.preventDefault(); onAuthors() } : isTranslator ? (event: React.MouseEvent<HTMLAnchorElement>) => { event.preventDefault(); onTranslators() } : undefined
              return <a className="menu-item menu-item-link menu-item-text" href={href} onClick={onClick} key={link}>{translatedWriterLink(link, language)}</a>
            })}
          </div>)}
        </div>
      </div>
    </div>
  </section>
}

function MobileMenu({ isOpen, onClose, onCategory, onAllBooks, onCollection, onAllWriters, onAuthors, onTranslators, onSearch, language, onSelectLanguage }: { isOpen: boolean; onClose: () => void; onCategory: (category: string) => void; onAllBooks: () => void; onCollection: (title: string) => void; onAllWriters: () => void; onAuthors: () => void; onTranslators: () => void; onSearch: (query: string) => void; language: 'en' | 'vi'; onSelectLanguage: (language: 'en' | 'vi') => void }) {
  const [openBranches, setOpenBranches] = useState<Record<string, boolean>>({ Fiction: true, 'Non-fiction': true, 'Linery Press': true, Role: false, Gender: false, 'Cultural Region': false, Era: false })
  const [query, setQuery] = useState('')
  const swipeStart = useRef<{ x: number; y: number } | null>(null)
  const toggleBranch = (label: string) => setOpenBranches((current) => ({ ...current, [label]: !current[label] }))
  const handlePointerDown = (event: React.PointerEvent<HTMLElement>) => {
    const isMobileViewport = window.matchMedia('(max-width: 1100px)').matches
    if (event.pointerType === 'touch' || (event.pointerType === 'mouse' && isMobileViewport)) swipeStart.current = { x: event.clientX, y: event.clientY }
  }
  const handlePointerUp = (event: React.PointerEvent<HTMLElement>) => {
    const start = swipeStart.current
    swipeStart.current = null
    const isMobileViewport = window.matchMedia('(max-width: 1100px)').matches
    if (!start || (event.pointerType !== 'touch' && !(event.pointerType === 'mouse' && isMobileViewport))) return
    const distanceX = event.clientX - start.x
    const distanceY = event.clientY - start.y
    if (distanceX < -64 && Math.abs(distanceX) > Math.abs(distanceY) * 1.2) onClose()
  }
  const handlePointerMove = (event: React.PointerEvent<HTMLElement>) => {
    const start = swipeStart.current
    if (!start) return
    const distanceX = event.clientX - start.x
    const distanceY = event.clientY - start.y
    if (distanceX < -10 && Math.abs(distanceX) > Math.abs(distanceY) * 1.2) event.preventDefault()
  }

  return <aside className={`mobile-menu menu-navigation ${isOpen ? 'is-open' : ''}`} aria-label="Mobile navigation" aria-hidden={!isOpen} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerCancel={() => { swipeStart.current = null }}>
    <div className="mobile-menu-header">
      <div className="mobile-menu-language-options" aria-label="Choose language">
        <button type="button" className="mobile-menu-language-toggle" role="switch" aria-checked={language === 'vi'} aria-label={`Switch to ${language === 'en' ? 'Vietnamese' : 'English'}`} onClick={() => onSelectLanguage(language === 'en' ? 'vi' : 'en')}>
          <span className={language === 'en' ? 'is-active' : ''}>EN</span><span className={language === 'vi' ? 'is-active' : ''}>VI</span><span className={`mobile-menu-language-thumb ${language === 'vi' ? 'is-vi' : ''}`} aria-hidden="true" />
        </button>
      </div>
      <div className="mobile-menu-quick-actions" aria-label="Account actions">
        <a className="mobile-menu-icon" href="#login" aria-label="Log in"><i className="bi bi-person" aria-hidden="true" /></a>
      </div>
    </div>
    <div className="mobile-menu-tools">
      <form className="mobile-menu-search" onSubmit={(event) => { event.preventDefault(); onSearch(query) }}>
        <img src="/assets/icon-search.svg" alt="" aria-hidden="true" />
        <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={tx(language, 'searchBooks')} aria-label={tx(language, 'searchBooks')} />
      </form>
    </div>
    <section className="mobile-menu-section menu-section" aria-labelledby="mobile-shop-heading">
      <button id="mobile-shop-heading" className="mobile-menu-section-title mobile-menu-section-link menu-section-title" type="button" onClick={onAllBooks}>{tx(language, 'books')}</button>
      <div className="mobile-menu-tree">
        {desktopShopColumns.map((column, columnIndex) => {
          if (columnIndex === 0) {
            return <div className="mobile-menu-column-group" key="shop-links">
              {column.links.filter((link) => link !== 'All books').map((link) => <button className="mobile-menu-item mobile-menu-level-1 menu-item menu-level-1" key={link} onClick={() => onCollection(link)}><span className="mobile-menu-text menu-item-text">{translatedCollectionTitle(link, language)}</span></button>)}
            </div>
          }
          const categoryOpen = openBranches[column.eyebrow] ?? true
          return <div className="mobile-menu-branch menu-branch" key={column.eyebrow}>
            <button className="mobile-menu-item mobile-menu-level-1 menu-item menu-level-1" onClick={() => toggleBranch(column.eyebrow)} aria-expanded={categoryOpen}>
              <span className="mobile-menu-text menu-item-text">{translatedShopLabel(column.eyebrow, language)}</span><span aria-hidden="true">{categoryOpen ? '−' : '+'}</span>
            </button>
            {categoryOpen && <div className="mobile-menu-children menu-children">{column.links.map((link) => <button className="mobile-menu-item mobile-menu-level-2 menu-item menu-level-2" key={link} onClick={() => onCategory(link)}><span className="mobile-menu-text menu-item-text">{translatedShopLabel(link, language)}</span></button>)}</div>}
          </div>
        })}
      </div>
    </section>
    <section className="mobile-menu-section menu-section mobile-menu-authors" aria-labelledby="mobile-authors-heading">
      <button id="mobile-authors-heading" className="mobile-menu-section-title mobile-menu-section-link menu-section-title" type="button" onClick={onAllWriters}>{tx(language, 'writers')}</button>
      {writerMenuGroups.map((group) => {
        const groupOpen = openBranches[group.eyebrow] ?? true
        return <div className="mobile-writer-group" key={group.eyebrow}>
          <button className="mobile-writer-group-toggle" type="button" onClick={() => toggleBranch(group.eyebrow)} aria-expanded={groupOpen}><span>{translatedWriterGroup(group.eyebrow, language)}</span><span aria-hidden="true">{groupOpen ? '−' : '+'}</span></button>
          {groupOpen && <div className="mobile-menu-children menu-children">
            {group.links.map((link) => {
              const onClick = link === 'Author'
                ? (event: React.MouseEvent<HTMLAnchorElement>) => { event.preventDefault(); onAuthors() }
                : link === 'Translator'
                  ? (event: React.MouseEvent<HTMLAnchorElement>) => { event.preventDefault(); onTranslators() }
                  : undefined
              return <a className="mobile-menu-item mobile-menu-level-2 menu-item menu-level-2" href={writerMenuHref(group, link)} onClick={onClick} key={link}><span className="mobile-menu-text menu-item-text">{translatedWriterLink(link, language)}</span></a>
            })}
          </div>}
        </div>
      })}
    </section>
  </aside>
}

function AuthorsDirectory({ filter }: { filter: WriterDirectoryFilter }) {
  const [query, setQuery] = useState('')
  const [activeLetter, setActiveLetter] = useState('all')
  useEffect(() => setActiveLetter('all'), [filter])
  const sourceColumns = filter === 'authors' ? runtimeAuthorColumns : filter === 'translators' ? runtimeTranslatorColumns : filter === 'illustrators' ? runtimeIllustratorColumns : [...runtimeAuthorColumns, ...runtimeTranslatorColumns, ...runtimeIllustratorColumns]
  const names = [...new Set(sourceColumns.flatMap((column) => column.links))].sort((first, second) => first.localeCompare(second, undefined, { sensitivity: 'base' }))
  const getLetter = (name: string) => {
    const letter = name.trim().charAt(0).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase()
    return /^[A-Z]$/.test(letter) ? letter : '#'
  }
  const availableLetters = [...new Set(names.map(getLetter))].sort((first, second) => first === '#' ? -1 : second === '#' ? 1 : first.localeCompare(second))
  const filteredNames = names.filter((name) => name.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())).filter((name) => activeLetter === 'all' || getLetter(name) === activeLetter)
  const groupedNames = availableLetters.filter((letter) => filteredNames.some((name) => getLetter(name) === letter)).map((letter) => ({ letter, names: filteredNames.filter((name) => getLetter(name) === letter) }))
  const pageTitle = filter === 'authors' ? 'AUTHORS' : filter === 'translators' ? 'TRANSLATORS' : filter === 'illustrators' ? 'ILLUSTRATORS' : 'CREATORS'
  const resultLabel = filter === 'authors' ? 'authors' : filter === 'translators' ? 'translators' : filter === 'illustrators' ? 'illustrators' : 'creators'
  return <main className="directory-page">
    <div className="directory-shell">
      <header className="directory-header">
        <div className="directory-heading">
          <p className="directory-kicker">DIRECTORY</p>
          <div className="directory-title-row">
            <h1>{pageTitle}</h1>
            <div className="directory-role-filters" aria-label="Filter creators by role">
              <button className={`directory-role-filter ${filter === 'all' ? 'is-active' : ''}`} type="button" onClick={() => { window.history.pushState({}, '', '/creators'); window.dispatchEvent(new PopStateEvent('popstate')) }}>ALL</button>
              {(['authors', 'translators', 'illustrators'] as const).map((role) => <button className={`directory-role-filter ${filter === role ? 'is-active' : ''}`} type="button" key={role} onClick={() => { window.history.pushState({}, '', `/creators?type=${role}`); window.dispatchEvent(new PopStateEvent('popstate')) }}>{role.toUpperCase()}</button>)}
            </div>
          </div>
        </div>
        <label className="directory-search">
          <span className="sr-only">Search creators</span>
          <i className="bi bi-search" aria-hidden="true" />
          <input value={query} onChange={(event) => { setQuery(event.target.value); setActiveLetter('all') }} placeholder="Search creators" type="search" />
        </label>
      </header>
      <nav className="directory-alphabet" aria-label="Filter creators by alphabet">
        <button className={activeLetter === 'all' ? 'is-active' : ''} type="button" onClick={() => setActiveLetter('all')}>All</button>
        {availableLetters.map((letter) => <button className={activeLetter === letter ? 'is-active' : ''} type="button" key={letter} onClick={() => setActiveLetter(letter)}>{letter}</button>)}
      </nav>
      <section className="directory-results" aria-live="polite">
        <p className="directory-result-count">{filteredNames.length} {resultLabel}</p>
        {groupedNames.length > 0 ? <div className="directory-groups">{groupedNames.map(({ letter, names: letterNames }) => <section className="directory-letter-group" aria-labelledby={`directory-letter-${letter}`} key={letter}>
          <h2 className="directory-letter" id={`directory-letter-${letter}`}>{letter}</h2>
          <div className="directory-name-columns"><div className="directory-name-column">{letterNames.map((name) => <a href={`/creators/${authorSlug(name)}`} key={name}>{name}</a>)}</div></div>
        </section>)}</div> : <p className="directory-empty">No creators match your search.</p>}
      </section>
    </div>
  </main>
}

function AuthorProfile({ author, onBack, ...actions }: { author: string; onBack: () => void } & ProductCardActions) {
  const authorBooks = catalogProducts.filter((product) => product.author === author)
  const [authorFactsOpen, setAuthorFactsOpen] = useState(true)
  const [authorBioOpen, setAuthorBioOpen] = useState(false)
  const [authorWorksPage, setAuthorWorksPage] = useState(0)
  const [activeAuthorImage, setActiveAuthorImage] = useState(0)
  const [authorLightboxOpen, setAuthorLightboxOpen] = useState(false)
  const authorLightboxTrackRef = useRef<HTMLDivElement>(null)
  const liveProfile = runtimeAuthorProfiles[author]
  const localProfile = authorProfiles[author]
  const hostedCreatorImage = localCreatorImageMap[authorSlug(author) as keyof typeof localCreatorImageMap]
  const fallbackImages = localProfile?.images?.length ? localProfile.images : hostedCreatorImage ? [hostedCreatorImage] : []
  const profile = {
    image: liveProfile?.images[0] ?? fallbackImages[0] ?? PUBLIC_AUTHOR_AVATAR_FALLBACK,
    images: liveProfile?.images.length ? liveProfile.images : fallbackImages,
    born: liveProfile?.born || localProfile?.born || '—',
    died: liveProfile?.died || localProfile?.died || '—',
    bornPlace: 'Linery catalogue',
    diedPlace: 'Linery catalogue',
    awards: liveProfile?.awards?.length ? liveProfile.awards : normalizeProfileList(localProfile?.awards),
    academicTitle: liveProfile?.academicTitle?.length ? liveProfile.academicTitle : normalizeProfileList(localProfile?.academicTitle),
    bio: liveProfile?.bio || localProfile?.bio || `${author} is part of the Linery catalogue, a curated selection of literary voices and essential works for curious readers.`,
  }
  const authorImages = profile.images?.length ? profile.images : [profile.image || PUBLIC_AUTHOR_AVATAR_FALLBACK]
  const hasBirthDate = Boolean(profile.born && profile.born !== '—')
  const hasDeathDate = Boolean(profile.died && profile.died !== '—')

  useEffect(() => {
    setActiveAuthorImage(0)
    setAuthorBioOpen(false)
    setAuthorWorksPage(0)
  }, [author])

  useEffect(() => {
    if (authorImages.length < 2 || authorLightboxOpen) return undefined
    const carouselTimer = window.setInterval(() => {
      setActiveAuthorImage((index) => (index + 1) % authorImages.length)
    }, 5000)
    return () => window.clearInterval(carouselTimer)
  }, [author, authorImages.length, authorLightboxOpen])

  useEffect(() => {
    if (!authorLightboxOpen) return undefined
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setAuthorLightboxOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [authorLightboxOpen])

  useEffect(() => {
    if (!authorLightboxOpen || !authorLightboxTrackRef.current) return undefined
    const track = authorLightboxTrackRef.current
    window.requestAnimationFrame(() => track.scrollTo({ left: activeAuthorImage * track.clientWidth, behavior: 'auto' }))
    return undefined
  }, [authorLightboxOpen])

  return <main className="author-page">
    <div className="author-page-content">
      <section className="author-profile-hero" aria-labelledby="author-profile-title">
        <figure className="author-portrait-frame">
          <button className="detail-mobile-back" type="button" aria-label="Back to authors" onClick={onBack}><i className="bi bi-arrow-left" aria-hidden="true" /></button>
          {authorImages[activeAuthorImage] ? <button className="author-portrait-trigger" type="button" aria-label={`Open portrait ${activeAuthorImage + 1} of ${author}`} onClick={() => setAuthorLightboxOpen(true)}><img src={authorImages[activeAuthorImage]} alt={`${author} portrait ${activeAuthorImage + 1}`} className="author-portrait" onError={(event) => { event.currentTarget.src = fallbackImages[0] || PUBLIC_AUTHOR_AVATAR_FALLBACK }} /></button> : <i className="bi bi-person" aria-hidden="true" />}
          {authorImages.length > 1 && <div className="author-portrait-dots" aria-label="Author photos">
            {authorImages.map((image, index) => <button key={image} type="button" className={index === activeAuthorImage ? 'is-active' : ''} aria-label={`Show author photo ${index + 1}`} aria-pressed={index === activeAuthorImage} onClick={() => setActiveAuthorImage(index)} />)}
          </div>}
        </figure>
        <div className="author-profile-copy">
          <nav className="author-breadcrumb" aria-label="Breadcrumb">
            <button className="author-breadcrumb-link" type="button" onClick={onBack}>Authors</button>
            <span className="author-breadcrumb-separator" aria-hidden="true">/</span>
            <span className="author-breadcrumb-current" aria-current="page">{author}</span>
          </nav>
          <h1 id="author-profile-title">{author}</h1>
          {(hasBirthDate || hasDeathDate) && <dl className={`author-life-facts ${hasBirthDate && hasDeathDate ? '' : 'author-life-facts-single'}`} aria-label={`${author} life dates`}>
            {hasBirthDate && <div><dt>Born</dt><dd>{profile.born}</dd></div>}
            {hasDeathDate && <div><dt>Died</dt><dd>{profile.died}</dd></div>}
          </dl>}
          <div className="author-profile-bio-wrap"><p className={`author-profile-bio ${authorBioOpen ? 'is-expanded' : ''}`}>{profile.bio}</p><button className="author-bio-toggle" type="button" aria-expanded={authorBioOpen} onClick={() => setAuthorBioOpen((open) => !open)}>{authorBioOpen ? 'View less' : 'View more'}</button></div>
          <section className="author-collapsible-section author-details-section" aria-labelledby="author-facts-title">
            <button className="author-section-toggle" type="button" aria-expanded={authorFactsOpen} aria-controls="author-facts-content" onClick={() => setAuthorFactsOpen((open) => !open)}>
              <span id="author-facts-title">AWARDS &amp; ACADEMIC TITLE</span>
              <i className={`bi bi-${authorFactsOpen ? 'dash' : 'plus'}-lg`} aria-hidden="true" />
            </button>
            {authorFactsOpen && <dl className="author-profile-facts" id="author-facts-content">
              <div><dt>Awards received</dt><dd>{profile.awards.length ? <ul className="author-fact-list">{profile.awards.map((award) => <li key={award}>{award}</li>)}</ul> : '—'}</dd></div>
              <div><dt>Academic title</dt><dd className="author-academic-title">{profile.academicTitle.length ? <ul className="author-fact-list">{profile.academicTitle.map((title) => <li key={title}>{title}</li>)}</ul> : '—'}</dd></div>
            </dl>}
          </section>
          <section className="author-books" aria-labelledby="author-books-title">
            <h2 id="author-books-title">Selected works</h2>
            <div className="author-books-grid" id="author-works-content">{authorBooks.slice(authorWorksPage * 3, (authorWorksPage + 1) * 3).map((product) => <ProductCard key={product.title} product={product} {...actions} />)}</div>
            {authorBooks.length > 3 && <div className="author-books-controls" aria-label="Selected works carousel controls"><button type="button" aria-label="Previous selected works" onClick={() => setAuthorWorksPage((page) => Math.max(0, page - 1))} disabled={authorWorksPage === 0}><i className="bi bi-chevron-left" aria-hidden="true" /></button><span aria-live="polite">{authorWorksPage + 1} / {Math.ceil(authorBooks.length / 3)}</span><button type="button" aria-label="Next selected works" onClick={() => setAuthorWorksPage((page) => Math.min(Math.ceil(authorBooks.length / 3) - 1, page + 1))} disabled={authorWorksPage >= Math.ceil(authorBooks.length / 3) - 1}><i className="bi bi-chevron-right" aria-hidden="true" /></button></div>}
          </section>
        </div>
      </section>
    </div>
    {authorLightboxOpen && <div className="book-lightbox author-lightbox" role="dialog" aria-modal="true" aria-label={`Image gallery for ${author}`} onClick={() => setAuthorLightboxOpen(false)}>
      <div className="book-lightbox-frame" onClick={(event) => event.stopPropagation()}>
        <div className="author-lightbox-track" ref={authorLightboxTrackRef} aria-label="Author images" onScroll={(event) => {
          const track = event.currentTarget
          const nextIndex = Math.round(track.scrollLeft / track.clientWidth)
          if (nextIndex !== activeAuthorImage) setActiveAuthorImage(nextIndex)
        }}>
          {authorImages.map((image, index) => <figure className="author-lightbox-slide" key={`${image}-${index}`}><img className="book-lightbox-image" src={image} alt={`${author} portrait ${index + 1}`} loading={index === 0 ? 'eager' : 'lazy'} decoding="async" /></figure>)}
        </div>
        <div className="book-lightbox-thumbnails" aria-label="Author image thumbnails">
          {authorImages.map((image, index) => <button key={`${image}-thumb-${index}`} className={`book-lightbox-thumbnail ${index === activeAuthorImage ? 'is-active' : ''}`} type="button" aria-label={`View author image ${index + 1}`} aria-current={index === activeAuthorImage ? 'true' : undefined} onClick={() => {
            setActiveAuthorImage(index)
            authorLightboxTrackRef.current?.scrollTo({ left: index * (authorLightboxTrackRef.current?.clientWidth ?? 0), behavior: 'smooth' })
          }}><img src={image} alt="" loading="lazy" decoding="async" /></button>)}
        </div>
        <button className="book-lightbox-close" type="button" aria-label="Close gallery" onClick={() => setAuthorLightboxOpen(false)}><i className="bi bi-x-lg" aria-hidden="true" /></button>
      </div>
    </div>}
  </main>
}

function FilterMultiSelect({ label, options, value, onChange, groups, searchable = true }: { label: string; options: string[]; value: string[]; onChange: (value: string[]) => void; groups?: Array<{ label: string; children: string[] }>; searchable?: boolean }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const selectRef = useRef<HTMLDivElement | null>(null)
  const visibleOptions = options.filter((option) => option.toLowerCase().includes(query.toLowerCase()))
  const visibleGroups = groups?.map((group) => ({ ...group, children: group.children.filter((child) => child.toLowerCase().includes(query.toLowerCase())) })).filter((group) => group.label.toLowerCase().includes(query.toLowerCase()) || group.children.length > 0)

  useEffect(() => {
    if (!open) return undefined
    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (event.target instanceof Node && !selectRef.current?.contains(event.target)) setOpen(false)
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', closeOnOutsidePointer)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsidePointer)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [open])

  const toggleOption = (option: string) => onChange(value.includes(option) ? value.filter((item) => item !== option) : [...value, option])

  return <div ref={selectRef} className={`filter-select2 ${open ? 'is-open' : ''}`}>
    <span className="filter-select2-label">{label}</span>
    <div className="filter-select2-control" role="button" tabIndex={0} aria-expanded={open} onClick={() => setOpen((current) => !current)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setOpen((current) => !current) } }}>
      <span className="filter-select2-tags">{value.length > 0 ? value.map((item) => <span className="filter-select2-tag" key={item}>{item}<button type="button" aria-label={`Remove ${item}`} onClick={(event) => { event.stopPropagation(); toggleOption(item) }}>×</button></span>) : <span className="filter-select2-placeholder">Select {label.toLowerCase()}</span>}</span>
      <i className="bi bi-chevron-down" aria-hidden="true" />
    </div>
    {open && <div className="filter-select2-dropdown">
      {searchable && <input className="filter-select2-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Search ${label.toLowerCase()}`} aria-label={`Search ${label.toLowerCase()}`} />}
      <div className="filter-select2-options">{groups ? visibleGroups?.map((group) => <div className="filter-select2-group" key={group.label}><label className="filter-select2-option is-parent"><input type="checkbox" checked={value.includes(group.label)} onChange={() => toggleOption(group.label)} /> <span>{group.label}</span></label>{group.children.map((child) => <label className="filter-select2-option is-child" key={child}><input type="checkbox" checked={value.includes(child)} onChange={() => toggleOption(child)} /> <span>{child}</span></label>)}</div>) : visibleOptions.map((option) => <label className="filter-select2-option" key={option}><input type="checkbox" checked={value.includes(option)} onChange={() => toggleOption(option)} /> <span>{option}</span></label>)}</div>
      {((groups && visibleGroups?.length === 0) || (!groups && visibleOptions.length === 0)) && <p className="filter-select2-empty">No matches found.</p>}
    </div>}
  </div>
}

function FilterTextInput({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder: string }) {
  return <label className="filter-text-field">
    <span>{label}</span>
    <input type="search" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} aria-label={label} />
  </label>
}

function HeroBanner({ motionOpen = false, className = '', banners = [] }: { motionOpen?: boolean; className?: string; banners?: PublicBanner[] }) {
  const heroBanners = banners.filter((banner) => banner.positionCode === 'HOME_HERO').sort((first, second) => first.sortOrder - second.sortOrder)
  const baseImage = heroBanners[0]?.publicUrl || '/assets/hero-children.png'
  const hoverImage = heroBanners[1]?.publicUrl || baseImage.replace(/\.png$/i, '-shop-hover.png')
  return <div className={`all-books-hero ${motionOpen ? 'is-hovered' : ''} ${className}`.trim()}>
    <img className="all-books-hero-base" src={baseImage} alt="Các em nhỏ cùng đọc sách" width="1342" height="495" fetchPriority="high" decoding="async" />
    <img className="all-books-hero-hover" src={hoverImage} alt="" aria-hidden="true" width="1342" height="495" decoding="async" />
  </div>
}

function AllBooksPage({ onHome, collectionTitle, heroMotionOpen, publicBanners, ...actions }: { onHome: () => void; collectionTitle?: string; heroMotionOpen: boolean; publicBanners?: PublicBanner[] } & ProductCardActions) {
  const pageTitle = collectionTitle ?? 'ALL BOOKS'
  const normalizedCollectionTitle = collectionTitle?.toLowerCase()
  const sourceProducts = normalizedCollectionTitle === 'linery art books' ? artbookProducts : normalizedCollectionTitle === 'grab & save' ? limitedProducts : products
  const allBooks = Array.from({ length: 28 }, (_, rowIndex) => sourceProducts.map((product, productIndex) => ({
    ...product,
    key: `${rowIndex}-${productIndex}-${product.title}`,
  }))).flat()
  const categoryGroups = [
    { label: 'Fiction', children: ['Novels', 'Short stories', 'Poetry & Drama'] },
    { label: 'Non-fiction', children: ['Essays', 'Research & Studies', 'Memoir & Biography'] },
  ]
  const categoryFromUrl = new URLSearchParams(window.location.search).get('category')
  const initialCategory = [...categoryGroups.flatMap((group) => [group.label, ...group.children])].find((category) => category.toLowerCase().replaceAll(' ', '-') === categoryFromUrl) ?? null
  const publishers = [...new Set(allBooks.map((product) => product.publisher))].sort()
  const [draftCategories, setDraftCategories] = useState<string[]>(initialCategory ? [initialCategory] : [])
  const categoryOptions = categoryGroups.flatMap((group) => [group.label, ...group.children])
  const writers = [...new Set(allBooks.map((product) => product.author))].sort()
  const [draftWriters, setDraftWriters] = useState<string[]>([])
  const [draftPublishers, setDraftPublishers] = useState<string[]>([])
  const [draftSort, setDraftSort] = useState('default')
  const [activeCategories, setActiveCategories] = useState<string[]>(initialCategory ? [initialCategory] : [])
  const [activeWriters, setActiveWriters] = useState<string[]>([])
  const [activePublishers, setActivePublishers] = useState<string[]>([])
  const [activeSort, setActiveSort] = useState('default')
  const [filterOpen, setFilterOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 24
  const matchesCategory = (product: Product, category: string) => {
    const group = categoryGroups.find((item) => item.label === category)
    return product.categories.includes(category) || Boolean(group?.children.some((child) => product.categories.includes(child)))
  }
  const filteredBooks = allBooks
    .filter((product) => activeCategories.length === 0 || activeCategories.some((category) => matchesCategory(product, category)))
    .filter((product) => activeWriters.length === 0 || activeWriters.includes(product.author))
    .filter((product) => activePublishers.length === 0 || activePublishers.includes(product.publisher))
    .sort((first, second) => {
      if (activeSort === 'price-asc' || activeSort === 'price-desc') {
        const firstPrice = Number(first.price.replace(/[^0-9]/g, ''))
        const secondPrice = Number(second.price.replace(/[^0-9]/g, ''))
        return activeSort === 'price-asc' ? firstPrice - secondPrice : secondPrice - firstPrice
      }
      if (activeSort === 'title-asc' || activeSort === 'title-desc') {
        const titleOrder = first.title.localeCompare(second.title, undefined, { sensitivity: 'base' })
        return activeSort === 'title-asc' ? titleOrder : -titleOrder
      }
      return 0
    })
  const pageCount = Math.max(1, Math.ceil(filteredBooks.length / pageSize))
  const visibleBooks = filteredBooks.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  const paginationItems: Array<number | 'ellipsis'> = pageCount <= 4
    ? Array.from({ length: pageCount }, (_, index) => index + 1)
    : currentPage <= 3
      ? [1, 2, 3, 'ellipsis', pageCount]
      : currentPage >= pageCount - 2
        ? [1, 'ellipsis', pageCount - 2, pageCount - 1, pageCount]
        : [1, 'ellipsis', currentPage, 'ellipsis', pageCount]

  return <main className="all-books-page">
    <div className="all-books-content">
      <HeroBanner motionOpen={heroMotionOpen} banners={publicBanners} />
      <div className="all-books-heading-row">
        <nav className="all-books-breadcrumb" aria-label="Breadcrumb"><a href="/#home" onClick={(event) => { event.preventDefault(); onHome() }}>Home</a><span aria-hidden="true">/</span><span>{pageTitle}</span></nav>
        <button className={`all-books-filter-toggle ${filterOpen ? 'is-open' : ''}`} type="button" aria-expanded={filterOpen} onClick={() => setFilterOpen((open) => !open)}><i className="bi bi-sliders2" aria-hidden="true" /> Filter &amp; sort</button>
      </div>
      <form className={`all-books-filter-panel ${filterOpen ? 'is-open' : ''}`} aria-hidden={!filterOpen} onSubmit={(event) => { event.preventDefault(); setActiveCategories(draftCategories); setActiveWriters(draftWriters); setActivePublishers(draftPublishers); setActiveSort(draftSort); setCurrentPage(1) }}>
        <FilterMultiSelect label="Books" options={categoryOptions} value={draftCategories} onChange={setDraftCategories} groups={categoryGroups} searchable={false} />
        <FilterMultiSelect label="Writers" options={writers} value={draftWriters} onChange={setDraftWriters} />
        <FilterMultiSelect label="Publishers" options={publishers} value={draftPublishers} onChange={setDraftPublishers} />
        <label className="all-books-sort-field">Sort by
          <select value={draftSort} onChange={(event) => setDraftSort(event.target.value)}>
            <option value="default">Default</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
            <option value="title-asc">Title: A–Z</option>
            <option value="title-desc">Title: Z–A</option>
          </select>
        </label>
        <div className="all-books-filter-actions"><button type="button" onClick={() => { setDraftCategories([]); setDraftWriters([]); setDraftPublishers([]); setDraftSort('default'); setActiveCategories([]); setActiveWriters([]); setActivePublishers([]); setActiveSort('default'); setCurrentPage(1) }}>Clear</button><button type="submit">Apply filter</button></div>
      </form>
      <section className="all-books-panel" aria-labelledby="all-books-title">
        <RibbonTitle title={pageTitle} id="all-books-title" heading />
        {visibleBooks.length > 0 ? <div className="all-books-grid">{visibleBooks.map((product) => <ProductCard key={product.key} product={product} {...actions} />)}</div> : <p className="all-books-empty">No books match these filters.</p>}
        {pageCount > 1 && <nav className="all-books-pagination" aria-label="All books pages">
          <button type="button" aria-label="Previous page" disabled={currentPage === 1} onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}><i className="bi bi-chevron-left" aria-hidden="true" /></button>
          {paginationItems.map((item, index) => item === 'ellipsis'
            ? <span key={`ellipsis-${index}`} className="all-books-pagination-ellipsis" aria-hidden="true">...</span>
            : <button key={item} type="button" className={item === currentPage ? 'is-current' : ''} aria-current={item === currentPage ? 'page' : undefined} onClick={() => setCurrentPage(item)}>{item}</button>)}
          <button type="button" aria-label="Next page" disabled={currentPage === pageCount} onClick={() => setCurrentPage((page) => Math.min(pageCount, page + 1))}><i className="bi bi-chevron-right" aria-hidden="true" /></button>
        </nav>}
      </section>
    </div>
  </main>
}

const normalizeSearchText = (value: string) => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/đ/g, 'd')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, ' ')
  .trim()

const getEditDistance = (first: string, second: string) => {
  const row = Array.from({ length: second.length + 1 }, (_, index) => index)
  for (let firstIndex = 1; firstIndex <= first.length; firstIndex += 1) {
    let previous = row[0]
    row[0] = firstIndex
    for (let secondIndex = 1; secondIndex <= second.length; secondIndex += 1) {
      const current = row[secondIndex]
      row[secondIndex] = Math.min(
        row[secondIndex] + 1,
        row[secondIndex - 1] + 1,
        previous + (first[firstIndex - 1] === second[secondIndex - 1] ? 0 : 1),
      )
      previous = current
    }
  }
  return row[second.length]
}

const getSearchFieldScore = (value: string, query: string) => {
  const field = normalizeSearchText(value)
  const fieldWords = field.split(' ').filter(Boolean)
  const queryWords = query.split(' ').filter(Boolean)
  if (!field || queryWords.length === 0) return 0

  let score = field.includes(query) ? 120 : 0
  let matchedWords = 0
  queryWords.forEach((queryWord) => {
    if (fieldWords.some((fieldWord) => fieldWord.includes(queryWord))) {
      matchedWords += 1
      score += 32
      return
    }
    const closestDistance = Math.min(...fieldWords.map((fieldWord) => getEditDistance(queryWord, fieldWord)))
    const allowedDistance = Math.max(1, Math.floor(queryWord.length * 0.34))
    if (closestDistance <= allowedDistance) {
      matchedWords += 1
      score += 18
    }
  })

  return matchedWords === 0 ? 0 : score + (matchedWords === queryWords.length ? 20 : 0)
}

const getProductSearchScore = (product: Product, query: string) => {
  if (!query) return 0
  const creatorNames = [...(product.translators ?? []), ...(product.illustrators ?? [])].join(' ')
  return Math.max(
    getSearchFieldScore(product.title, query) * 4,
    getSearchFieldScore(product.author, query) * 3,
    getSearchFieldScore(creatorNames, query) * 3,
    getSearchFieldScore(product.isbn ?? '', query) * 3,
    getSearchFieldScore(product.publisher, query) * 2,
    getSearchFieldScore(product.categories.join(' '), query),
  )
}

function SearchResultsPage({ query, loading, ...actions }: { query: string; loading: boolean } & ProductCardActions) {
  const searchPageSize = 12
  const [visibleCreatorCount, setVisibleCreatorCount] = useState(searchPageSize)
  const [visibleBookCount, setVisibleBookCount] = useState(searchPageSize)
  const [creatorRevealFrom, setCreatorRevealFrom] = useState(0)
  const [bookRevealFrom, setBookRevealFrom] = useState(0)
  const normalizedQuery = normalizeSearchText(query)
  const results = products
    .map((product) => ({ product, score: getProductSearchScore(product, normalizedQuery) }))
    .filter(({ score }) => score > 0)
    .sort((first, second) => second.score - first.score)
    .map(({ product }) => product)
  const creatorResults = [...new Map([
    ...products.map((product) => [product.author, {
      name: product.author,
      slug: authorSlug(product.author),
      roles: ['author'] as PublicCreatorProfile['roles'],
      images: authorProfiles[product.author]?.images ?? (authorProfiles[product.author]?.image ? [authorProfiles[product.author].image] : []),
      born: '',
      died: '',
      awards: [],
      academicTitle: [],
      bio: '',
    } satisfies PublicCreatorProfile] as const),
    ...Object.values(runtimeAuthorProfiles).map((profile) => [profile.name, profile] as const),
  ])].map(([, profile]) => ({
    profile,
    score: getSearchFieldScore(profile.name, normalizedQuery),
  })).filter(({ score }) => score > 0).sort((first, second) => second.score - first.score).map(({ profile }) => profile)
  const hasQuery = normalizedQuery.length > 0
  const hasResults = creatorResults.length > 0 || results.length > 0
  useEffect(() => {
    setVisibleCreatorCount(searchPageSize)
    setVisibleBookCount(searchPageSize)
    setCreatorRevealFrom(0)
    setBookRevealFrom(0)
  }, [normalizedQuery])
  const revealMoreCreators = () => {
    setCreatorRevealFrom(visibleCreatorCount)
    setVisibleCreatorCount((count) => count + searchPageSize)
  }
  const revealMoreBooks = () => {
    setBookRevealFrom(visibleBookCount)
    setVisibleBookCount((count) => count + searchPageSize)
  }

  return <main className="search-page">
    <div className="search-page-content">
      <p className="search-page-kicker">Search</p>
      <h1>Search results for <span>“{query || 'all books'}”</span></h1>
      {loading ? <section className="search-loading" aria-live="polite"><span className="search-loading-spinner" aria-hidden="true" /><p>Loading results…</p></section> : hasQuery && hasResults ? <>
        {creatorResults.length > 0 && <section className="search-results-section" aria-labelledby="search-creators-title">
          <div className="search-results-section-heading"><h2 id="search-creators-title">Creators ({creatorResults.length})</h2></div>
          <div className="search-creators-grid">{creatorResults.slice(0, visibleCreatorCount).map((profile, index) => <a className={`search-creator-card ${index >= creatorRevealFrom && index < visibleCreatorCount ? 'search-result-item-new' : ''}`} href={`/creators/${profile.slug}`} key={profile.slug}>
            <img src={profile.images[0] || PUBLIC_AUTHOR_AVATAR_FALLBACK} alt={profile.name} loading="lazy" decoding="async" onError={(event) => { event.currentTarget.src = PUBLIC_AUTHOR_AVATAR_FALLBACK }} />
            <span className="search-creator-card-copy"><strong>{profile.name}</strong><small>{profile.roles.map((role) => role === 'author' ? 'Author' : role === 'translator' ? 'Translator' : 'Illustrator').join(' · ')}</small></span>
          </a>)}</div>
          {creatorResults.length > visibleCreatorCount && <button className="search-load-more" type="button" onClick={revealMoreCreators}>Xem thêm <i className="search-load-more-icon bi bi-chevron-down" aria-hidden="true" /></button>}
        </section>}
        {results.length > 0 && <section className="search-results-section" aria-labelledby="search-books-title">
          <div className="search-results-section-heading"><h2 id="search-books-title">Books ({results.length})</h2></div>
          <div className="search-results-grid">{results.slice(0, visibleBookCount).map((product, index) => <div className={index >= bookRevealFrom && index < visibleBookCount ? 'search-result-item-new' : ''} key={product.title}><ProductCard product={product} {...actions} /></div>)}</div>
          {results.length > visibleBookCount && <button className="search-load-more" type="button" onClick={revealMoreBooks}>Xem thêm <i className="search-load-more-icon bi bi-chevron-down" aria-hidden="true" /></button>}
        </section>}
      </> : <section className="search-empty" aria-live="polite">
        <img src="/assets/icon-search.svg" alt="" aria-hidden="true" />
        <h2>No books found</h2>
        <p>We couldn’t find a book matching “{query}”.<br />Try another title, author, or category.</p>
      </section>}
    </div>
  </main>
}

function NewsCard({ item, language, onOpen }: { item: NewsItem; language: 'en' | 'vi'; onOpen: (item: NewsItem) => void }) {
  const title = language === 'vi' ? item.titleVi : item.title
  const excerpt = language === 'vi' ? item.excerptVi : item.excerpt
  return <a className="news-card" href={`/news/${item.slug}`} onClick={(event) => { event.preventDefault(); onOpen(item) }}>
    <img className="news-card-image" src={item.image} alt={item.title} loading="lazy" decoding="async" />
    <p className="news-card-kicker">{item.date}</p>
    <h3>{title}</h3>
    <p className="news-card-excerpt">{excerpt}</p>
  </a>
}

function LineryNewsSection({ language, onOpen, onSeeMore }: { language: 'en' | 'vi'; onOpen: (item: NewsItem) => void; onSeeMore: () => void }) {
  const [mobile, setMobile] = useState(() => window.matchMedia('(max-width: 900px)').matches)
  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 900px)')
    const handleChange = () => setMobile(mediaQuery.matches)
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])
  const pageSize = mobile ? 3 : 4
  const visibleItems = runtimeNewsItems.slice(0, pageSize)
  return <section className="news-module" aria-labelledby="linery-news-title">
    <RibbonTitle title="LINERY NEWS" id="linery-news-title" heading />
    <div className="news-grid">{visibleItems.map((item) => <NewsCard key={item.slug} item={item} language={language} onOpen={onOpen} />)}</div>
    <a className="news-see-more" href="/news" onClick={(event) => { event.preventDefault(); onSeeMore() }}>View All</a>
  </section>
}

function NewsPage({ language, onOpen, heroMotionOpen, publicBanners }: { language: 'en' | 'vi'; onOpen: (item: NewsItem) => void; heroMotionOpen: boolean; publicBanners?: PublicBanner[] }) {
  const pageTitle = language === 'vi' ? 'Tin tức & Sự kiện' : 'News & Events'
  return <main className="news-page">
    <div className="news-page-content">
      <HeroBanner motionOpen={heroMotionOpen} className="news-page-hero" banners={publicBanners} />
      <nav className="news-breadcrumb news-page-breadcrumb" aria-label="Breadcrumb"><a href="/#home">Home</a><span aria-hidden="true">/</span><span>{pageTitle}</span></nav>
      <section className="news-page-panel" aria-labelledby="all-news-title">
        <RibbonTitle title={pageTitle.toUpperCase()} id="all-news-title" heading />
        <div className="news-page-grid">{runtimeNewsItems.map((item) => {
          const title = language === 'vi' ? item.titleVi : item.title
          const excerpt = language === 'vi' ? item.excerptVi : item.excerpt
          return <article className="news-page-card" key={item.slug}>
            <button type="button" onClick={() => onOpen(item)}>
              <div className="news-page-image-wrap"><img src={item.image} alt={title} loading={item.slug === runtimeNewsItems[0]?.slug ? 'eager' : 'lazy'} decoding="async" /></div>
              <p>{item.kicker}</p><h2>{title}</h2><span>{excerpt}</span>
            </button>
          </article>
        })}</div>
      </section>
    </div>
  </main>
}

function NewsDetailPage({ item, language, onBack }: { item: NewsItem; language: 'en' | 'vi'; onBack: () => void }) {
  if (item.contentType === 'emagazine') return <EmagazinePage item={item} language={language} onBack={onBack} />
  const title = language === 'vi' ? item.titleVi : item.title
  const excerpt = language === 'vi' ? item.excerptVi : item.excerpt
  const body = language === 'vi' ? item.bodyVi : item.body
  return <main className="news-detail-page">
    <section className="news-detail-card" aria-labelledby="news-detail-title">
      <div className="news-detail-media"><button className="detail-mobile-back" type="button" aria-label="Back to news" onClick={onBack}><i className="bi bi-arrow-left" aria-hidden="true" /></button><img src={item.image} alt={title} /></div>
      <div className="news-detail-copy">
        <nav className="news-breadcrumb" aria-label="Breadcrumb"><button type="button" onClick={onBack}>News</button><span aria-hidden="true">/</span><span>{title}</span></nav>
        <p className="news-detail-kicker">{item.kicker}</p>
        <h1 id="news-detail-title">{title}</h1>
        <p className="news-detail-excerpt">{excerpt}</p>
        <div className="news-detail-rule" />
        <div className="news-detail-body">{body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
        <a className="news-source-link" href="https://www.instagram.com/linery_bookstore/" target="_blank" rel="noreferrer">View the original post <i className="bi bi-arrow-up-right" aria-hidden="true" /></a>
      </div>
    </section>
  </main>
}

function EmagazinePage({ item, language, onBack }: { item: NewsItem; language: 'en' | 'vi'; onBack: () => void }) {
  const shareRef = useRef<HTMLDivElement | null>(null)
  const [shareOpen, setShareOpen] = useState(false)
  const [shareMessage, setShareMessage] = useState('')
  const title = language === 'vi' ? item.titleVi : item.title
  const lead = language === 'vi' ? item.excerptVi : item.excerpt
  const blocks = (language === 'vi' ? item.blocksVi : item.blocks) ?? []
  const fallbackBlocks: PublicNewsBlock[] = (language === 'vi' ? item.bodyVi : item.body).map((content, index) => ({ id: `fallback-${index}`, type: 'paragraph', content, image: '', alt: '', caption: '', fullBleed: false }))
  const articleBlocks = blocks.length > 0 ? blocks : fallbackBlocks
  const shareUrl = typeof window === 'undefined' ? '' : window.location.href

  useEffect(() => {
    if (!shareOpen) return undefined
    const closeOnOutsideShare = (event: PointerEvent) => {
      if (event.target instanceof Node && !shareRef.current?.contains(event.target)) setShareOpen(false)
    }
    document.addEventListener('pointerdown', closeOnOutsideShare)
    return () => document.removeEventListener('pointerdown', closeOnOutsideShare)
  }, [shareOpen])

  const copyShareUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setShareMessage(language === 'vi' ? 'Đã sao chép liên kết' : 'Link copied')
    } catch {
      setShareMessage(language === 'vi' ? 'Hãy sao chép đường dẫn bài viết' : 'Copy the article link to share')
    }
  }

  const handleShareChoice = async (platform: 'instagram' | 'facebook' | 'tiktok' | 'threads' | 'zalo') => {
    if (!shareUrl) return
    const directShareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      zalo: `https://zalo.me/share?url=${encodeURIComponent(shareUrl)}`,
    }
    const platformUrls = {
      instagram: 'https://www.instagram.com/',
      tiktok: 'https://www.tiktok.com/',
      threads: 'https://www.threads.net/',
    }
    if (platform === 'facebook' || platform === 'zalo') {
      window.open(directShareUrls[platform], '_blank', 'noopener,noreferrer')
      setShareOpen(false)
      return
    }
    await copyShareUrl()
    window.open(platformUrls[platform], '_blank', 'noopener,noreferrer')
  }

  const shareOptions = [
    { id: 'instagram' as const, label: 'Instagram', icon: 'bi-instagram' },
    { id: 'facebook' as const, label: 'Facebook', icon: 'bi-facebook' },
    { id: 'tiktok' as const, label: 'TikTok', icon: 'bi-tiktok' },
    { id: 'threads' as const, label: 'Threads', icon: 'bi-threads' },
    { id: 'zalo' as const, label: 'Zalo', icon: 'bi-zalo' },
  ]
  return <main className="emagazine-page">
    <article className="emagazine-story" aria-labelledby="emagazine-title">
      <div className="emagazine-topbar"><button type="button" aria-label="Quay lại" onClick={onBack}><i className="bi bi-arrow-left" aria-hidden="true" /></button><span>eMagazine</span><div className="emagazine-share" ref={shareRef}><button className={`emagazine-share-trigger ${shareOpen ? 'is-open' : ''}`} type="button" aria-label="Chia sẻ" aria-expanded={shareOpen} aria-controls="emagazine-share-menu" onClick={() => { setShareOpen((open) => !open); setShareMessage('') }}><i className="bi bi-share" aria-hidden="true" /></button>{shareOpen && <div className="emagazine-share-menu" id="emagazine-share-menu" role="menu" aria-label={language === 'vi' ? 'Chia sẻ bài viết' : 'Share article'}>{shareOptions.map((option) => <button className="emagazine-share-option" key={option.id} type="button" role="menuitem" onClick={() => void handleShareChoice(option.id)}><span className={`emagazine-share-icon ${option.id === 'zalo' ? 'is-zalo' : ''}`} aria-hidden="true">{option.id === 'zalo' ? <img src="/assets/icon-zalo.svg" alt="" /> : <i className={`bi ${option.icon}`} />}</span><span>{option.label}</span></button>)}{shareMessage && <p className="emagazine-share-message" role="status">{shareMessage}</p>}</div>}</div></div>
      <div className="emagazine-intro">
        <p className="news-detail-kicker">{item.kicker}</p>
        <h1 id="emagazine-title">{title}</h1>
        <p className="emagazine-lead">{lead}</p>
        <p className="emagazine-meta">{item.byline || item.date}</p>
      </div>
      <div className="emagazine-body">
        {articleBlocks.map((block, index) => block.type === 'image' ? <figure className={`emagazine-figure ${block.fullBleed ? 'is-full-bleed' : ''}`} key={block.id || index}><img src={block.image} alt={block.alt || title} width={block.width} height={block.height} loading={index === 0 ? 'eager' : 'lazy'} /><figcaption>{block.caption}</figcaption></figure> : block.type === 'heading' ? <h2 key={block.id || index}>{block.content}</h2> : block.type === 'quote' ? <blockquote className="emagazine-pullquote" key={block.id || index}>{block.content}</blockquote> : <p className={index === 0 ? 'emagazine-dropcap' : ''} key={block.id || index}>{block.content}</p>)}
      </div>
    </article>
  </main>
}

function Header({ cartCount, cartPulse, menuOpen, onMenu, onHome, onLogin, onLogout, onShop, onShopHover, onAllWriters, onAuthors, onTranslators, onAllBooks, onCollection, onSearch, onQuickView, onCart, quickViewOpen, quickViewAvailable, activeView, shopOpen, writersOpen, onWritersHover, onDesktopMenuHover, accountMenuOpen, onAccountMenuToggle, accountTab, onAccountTabChange, accountMenuEnabled, language, menuItems = [] }: { cartCount: number; cartPulse: boolean; menuOpen: boolean; onMenu: () => void; onHome: () => void; onLogin: () => void; onLogout: () => void; onShop: () => void; onShopHover: (open: boolean) => void; onAllWriters: () => void; onAuthors: () => void; onTranslators: () => void; onAllBooks: () => void; onCollection: (title: string) => void; onSearch: (query: string) => void; onQuickView: () => void; onCart: () => void; quickViewOpen: boolean; quickViewAvailable: boolean; activeView: View; shopOpen: boolean; writersOpen: boolean; onWritersHover: (open: boolean) => void; onDesktopMenuHover: (open: boolean) => void; accountMenuOpen: boolean; onAccountMenuToggle: () => void; accountTab: AccountTab; onAccountTabChange: (tab: AccountTab) => void; accountMenuEnabled: boolean; language: Language; menuItems?: PublicMenuItem[] }) {
  const headerRef = useRef<HTMLElement | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [accountHoverOpen, setAccountHoverOpen] = useState(false)

  useEffect(() => {
    if (!searchOpen) return undefined
    const closeOnOutsideHeader = (event: PointerEvent) => {
      if (event.target instanceof Node && !headerRef.current?.contains(event.target)) setSearchOpen(false)
    }
    document.addEventListener('pointerdown', closeOnOutsideHeader)
    return () => document.removeEventListener('pointerdown', closeOnOutsideHeader)
  }, [searchOpen])

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!query.trim()) return
    onSearch(query.trim())
    setSearchOpen(false)
  }
  const headerMenuItems = menuItems.filter((item) => item.menuKey === 'header-main')
  const booksMenuItem = headerMenuItems.find((item) => item.itemType === 'link' && /books|sách/i.test(item.label))
  const creatorsMenuItem = headerMenuItems.find((item) => item.itemType === 'creator' || /creator|writer|sáng tạo/i.test(item.label))

  return <header ref={headerRef} className={`site-header ${menuOpen ? 'is-menu-open' : ''} ${activeView === 'account' ? 'is-account-view' : ''}`} onMouseLeave={() => { onShopHover(false); onWritersHover(false); onDesktopMenuHover(false) }}>
    <div className="header-inner">
      <button className="menu-button" aria-label="Mở menu" onClick={onMenu}><HamburgerIcon /></button>
      <nav className="desktop-nav" aria-label="Điều hướng chính"><a className={`nav-link ${activeView === 'home' ? 'is-active' : ''}`} href="/#home" onMouseEnter={() => { onShopHover(false); onWritersHover(false); onDesktopMenuHover(false) }} onFocus={() => { onShopHover(false); onWritersHover(false); onDesktopMenuHover(false) }} onClick={(event) => { event.preventDefault(); onHome() }}>HOME</a><a className={`nav-link shop-nav-link ${shopOpen ? 'is-open' : ''}`} href={booksMenuItem?.href || '/all-books'} onClick={(event) => { if (!booksMenuItem?.href || booksMenuItem.href === '/all-books') { event.preventDefault(); onAllBooks() } }} onMouseEnter={() => { onShopHover(true); onWritersHover(false); onDesktopMenuHover(true) }} onFocus={() => { onShopHover(true); onWritersHover(false); onDesktopMenuHover(true) }} aria-expanded={shopOpen}>BOOKS<i className="bi bi-chevron-down nav-chevron" aria-hidden="true" /></a><a className={`nav-link ${activeView === 'authors' ? 'is-active' : ''} ${writersOpen ? 'is-open' : ''}`} href={creatorsMenuItem?.href || '/creators'} onMouseEnter={() => { onShopHover(false); onWritersHover(true); onDesktopMenuHover(true) }} onFocus={() => { onShopHover(false); onWritersHover(true); onDesktopMenuHover(true) }} onClick={(event) => { if (!creatorsMenuItem?.href || creatorsMenuItem.href === '/creators') { event.preventDefault(); onAllWriters() } }} aria-expanded={writersOpen}>CREATORS<i className="bi bi-chevron-down nav-chevron" aria-hidden="true" /></a></nav>
      <a className="brand" href="/" aria-label="Linery Bookstore home">LINERY BOOKSTORE</a>
      <div className="header-actions">
        <form className={`search-control desktop-search-control ${searchOpen ? 'is-open' : ''}`} onSubmit={submitSearch}>
          <button className="search-toggle" type="button" aria-label="Tìm kiếm" aria-expanded={searchOpen} onClick={() => setSearchOpen((open) => !open)}><img src="/assets/icon-search.svg" alt="" /></button>
          <input className="search-input" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search books" aria-label="Search books" autoFocus={searchOpen} onKeyDown={(event) => { if (event.key === 'Escape') setSearchOpen(false) }} />
        </form>
        <a className={`icon-button cart-button ${cartPulse ? 'is-pulsing' : ''}`} href="/cart" aria-label={`Giỏ hàng, ${cartCount} sản phẩm`} onClick={(event) => { event.preventDefault(); onCart() }}><img src="/assets/icon-cart.svg" alt="" />{cartCount > 0 && <span>{cartCount}</span>}</a>
        <div className="account-menu-region" onMouseEnter={() => setAccountHoverOpen(true)} onMouseLeave={() => setAccountHoverOpen(false)}>
          <button className="icon-button login-icon" type="button" aria-label={activeView === 'account' ? 'Account menu' : 'Log in'} aria-expanded={accountMenuEnabled && (activeView === 'account' ? accountMenuOpen : accountHoverOpen)} onClick={onLogin}><i className="bi bi-person" aria-hidden="true" /></button>
          {accountMenuEnabled && <div className={`account-header-menu ${accountMenuOpen || accountHoverOpen ? 'is-open' : ''}`} aria-label="Account menu"><button className={accountTab === 'profile' ? 'is-active' : ''} type="button" onClick={() => { onAccountTabChange('profile'); onAccountMenuToggle() }}><i className="bi bi-person" aria-hidden="true" />Profile</button><button className={accountTab === 'orders' ? 'is-active' : ''} type="button" onClick={() => { onAccountTabChange('orders'); onAccountMenuToggle() }}><i className="bi bi-bag" aria-hidden="true" />Order history</button><button className={accountTab === 'transactions' ? 'is-active' : ''} type="button" onClick={() => { onAccountTabChange('transactions'); onAccountMenuToggle() }}><i className="bi bi-receipt" aria-hidden="true" />Transaction history</button><button className={accountTab === 'security' ? 'is-active' : ''} type="button" onClick={() => { onAccountTabChange('security'); onAccountMenuToggle() }}><i className="bi bi-shield-lock" aria-hidden="true" />Security</button><button className="account-header-menu-logout" type="button" onClick={onLogout}><i className="bi bi-box-arrow-right" aria-hidden="true" />Log out</button></div>}
        </div>
      </div>
    </div>
    {activeView !== 'authors' && <ShopMenu isOpen={shopOpen} onAllBooks={onAllBooks} onCollection={onCollection} language={language} />}
    <WritersMenu isOpen={writersOpen} onAllWriters={onAllWriters} onAuthors={onAuthors} onTranslators={onTranslators} language={language} />
  </header>
}

function ProductCard({ product, onOpenDetail, onAddToCart, onPreview, onPreviewLeave, onSelectQuickView, quickViewOpen }: ProductCardActions & { product: Product }) {
  if (!product) return null
  const coverContent = <div className="product-cover-wrap">
    <img src={product.image || BOOK_COVER_FALLBACK} alt={product.title} className="product-cover" loading="lazy" decoding="async" onError={handleBookCoverError} />
    {product.limited && <span className="product-limited-badge" aria-label="20% discount">20%</span>}
  </div>
  const infoContent = <div className="product-info">
    <h3 title={product.title}>{product.title}</h3>
    <p className="product-author">{product.author}</p>
    {product.available !== false && <p className="product-price">{product.price}</p>}
    {product.available === false && <p className="product-stock-status">Out of stock</p>}
  </div>
  const openDetail = (event: React.MouseEvent<HTMLAnchorElement>) => { event.preventDefault(); onOpenDetail(product) }
  const openQuickView = (event: React.MouseEvent<HTMLAnchorElement>) => { event.preventDefault(); onSelectQuickView(product) }

  return <article className="product-card">
    {quickViewOpen ? <div className="product-surface">
      <a className="product-card-link product-cover-link" href="#a" onClick={openQuickView} aria-label={`Quick view ${product.title}`}>{coverContent}</a>
      <a className="product-card-link product-info-link" href="#a" onClick={openDetail} aria-label={`View details for ${product.title}`}>{infoContent}</a>
    </div> : <a className="product-card-link" href="#a" onClick={openDetail} aria-label={`View ${product.title}`}>
      <div className="product-surface">{coverContent}{infoContent}</div>
    </a>}
  </article>
}

function Collection({ title, items, onCollection, quickViewOpen, language = 'en', showViewAll = true, ...actions }: { title: string; items: Product[]; onCollection: (title: string) => void; language?: Language; showViewAll?: boolean } & ProductCardActions) {
  const carouselRef = useRef<HTMLDivElement | null>(null)
  const [trackPosition, setTrackPosition] = useState(0)
  const [isJumping, setIsJumping] = useState(false)
  const [itemsPerSlide, setItemsPerSlide] = useState(6)
  const wheelLock = useRef(false)
  const touchStart = useRef<number | null>(null)
  const isJumpingRef = useRef(false)
  const isTransitioningRef = useRef(false)
  // Keep each book in the carousel sequence once. Repeating the source array
  // to fill a fixed slide count makes the last slide duplicate the first one.
  const uniqueItems = [...new Map(items.map((item) => {
    const identity = item.id?.trim() || item.slug?.trim() || item.isbn?.trim() || productSlug(item.title)
    return [identity, item] as const
  })).values()]
  const carouselItems = uniqueItems.slice(0, itemsPerSlide === 3 ? 12 : 24)
  const slides = Array.from({ length: Math.ceil(carouselItems.length / itemsPerSlide) }, (_, slideIndex) => carouselItems.slice(slideIndex * itemsPerSlide, (slideIndex + 1) * itemsPerSlide))
  const isLooping = slides.length > 1
  const activeSlide = isLooping ? (trackPosition + slides.length - 1) % slides.length : 0
  const renderedSlides = isLooping ? [slides[slides.length - 1], ...slides, slides[0]] : slides

  useEffect(() => {
    const element = carouselRef.current
    if (!element) return undefined
    const syncItemsPerSlide = () => {
      const width = element.getBoundingClientRect().width
      setItemsPerSlide(width >= 1150 ? 6 : width >= 680 ? 4 : 3)
    }
    syncItemsPerSlide()
    const observer = new ResizeObserver(syncItemsPerSlide)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    isJumpingRef.current = isJumping
  }, [isJumping])

  useEffect(() => {
    setTrackPosition(isLooping ? 1 : 0)
    setIsJumping(false)
    isJumpingRef.current = false
    isTransitioningRef.current = false
  }, [isLooping, itemsPerSlide])

  useEffect(() => {
    if (!isLooping) return undefined
    const carouselTimer = window.setInterval(() => {
      moveSlide(1)
    }, 5000)
    return () => window.clearInterval(carouselTimer)
  }, [isLooping, slides.length])

  const moveSlide = (direction: 1 | -1) => {
    if (!isLooping || isJumpingRef.current || isTransitioningRef.current) return
    isTransitioningRef.current = true
    setTrackPosition((current) => current + direction)
  }

  const goToSlide = (index: number) => {
    if (!isLooping || isJumpingRef.current || isTransitioningRef.current) return
    const nextPosition = index + 1
    if (nextPosition === trackPosition) return
    isTransitioningRef.current = true
    setTrackPosition(nextPosition)
  }

  const handleTransitionEnd = (event: React.TransitionEvent<HTMLDivElement>) => {
    if (!isLooping) return
    if (event.target !== event.currentTarget || event.propertyName !== 'transform') return
    if (trackPosition === 0) {
      isJumpingRef.current = true
      setIsJumping(true)
      setTrackPosition(slides.length)
      window.requestAnimationFrame(() => window.requestAnimationFrame(() => {
        isJumpingRef.current = false
        isTransitioningRef.current = false
        setIsJumping(false)
      }))
    }
    if (trackPosition === slides.length + 1) {
      isJumpingRef.current = true
      setIsJumping(true)
      setTrackPosition(1)
      window.requestAnimationFrame(() => window.requestAnimationFrame(() => {
        isJumpingRef.current = false
        isTransitioningRef.current = false
        setIsJumping(false)
      }))
    } else {
      isTransitioningRef.current = false
    }
  }

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    const distance = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY
    if (Math.abs(distance) < 12 || wheelLock.current) return
    event.preventDefault()
    wheelLock.current = true
    moveSlide(distance > 0 ? 1 : -1)
    window.setTimeout(() => { wheelLock.current = false }, 760)
  }

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    touchStart.current = event.changedTouches[0]?.clientX ?? null
  }

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (touchStart.current === null) return
    const distance = (event.changedTouches[0]?.clientX ?? touchStart.current) - touchStart.current
    if (Math.abs(distance) > 36) moveSlide(distance < 0 ? 1 : -1)
    touchStart.current = null
  }

  if (items.length === 0) return null
  const displayTitle = translatedCollectionTitle(title, language)
  return <section className="collection scroll-section" aria-labelledby={title.replaceAll(' ', '-')}>
    <RibbonTitle title={displayTitle} id={title.replaceAll(' ', '-')} />
    <div ref={carouselRef} className="carousel-viewport" onWheel={handleWheel} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} aria-roledescription="carousel" aria-label={`${title} book carousel`}>
      <div className={`carousel-track ${isJumping ? 'is-jumping' : ''}`} data-slide={trackPosition} onTransitionEnd={handleTransitionEnd}>
        {renderedSlides.map((slide, slideIndex) => <div className="carousel-slide" key={`${title}-slide-${slideIndex}-${slideIndex === 0 ? 'clone-start' : slideIndex === renderedSlides.length - 1 ? 'clone-end' : 'real'}`} aria-hidden={slideIndex === 0 || slideIndex === renderedSlides.length - 1 || slideIndex !== trackPosition}>
          <div className="product-grid" data-columns={itemsPerSlide}>{slide.map((product, index) => <ProductCard key={`${title}-${slideIndex}-${index}`} product={product} {...actions} quickViewOpen={quickViewOpen} />)}</div>
        </div>)}
      </div>
    </div>
    <div className="collection-controls"><div className="pagination" aria-label={`${displayTitle} pagination`}>{slides.map((_, index) => <button key={`${title}-dot-${index}`} className={index === activeSlide ? 'active' : ''} aria-label={`Xem slide ${index + 1}`} aria-current={index === activeSlide ? 'true' : undefined} onClick={() => goToSlide(index)} />)}</div>{showViewAll && <a className="news-see-more collection-see-more" href={`/collections/${collectionSlug(title)}`} onClick={(event) => { event.preventDefault(); onCollection(title) }}>{tx(language, 'viewAll')}</a>}</div>
  </section>
}

function RelatedBooksPanel({ items, onOpenDetail }: { items: Product[]; onOpenDetail: (product: Product) => void }) {
  return <section className="book-related-inline" aria-labelledby="book-related-title">
    <div className="book-related-inline-header">
      <div>
        <p className="book-detail-kicker">Related reading</p>
        <h2 id="book-related-title">Books in this subject</h2>
      </div>
      <span>{items.length} titles</span>
    </div>
    <div className="book-related-inline-list">
      {items.map((relatedProduct) => <button className="book-related-inline-card" type="button" key={relatedProduct.title} onClick={() => onOpenDetail(relatedProduct)} aria-label={`View ${relatedProduct.title}`}>
        <span className="book-related-inline-cover"><img src={relatedProduct.image || BOOK_COVER_FALLBACK} alt="" loading="lazy" decoding="async" onError={handleBookCoverError} /></span>
        <span className="book-related-inline-title">{relatedProduct.title}</span>
      </button>)}
    </div>
  </section>
}

function BookReaderPage({ product, onBack }: { product: Product; onBack: () => void }) {
  const silentAudioDataUri = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA='
  const [sample, setSample] = useState<{ url?: string; pageCount?: number; fileType?: 'pdf' | 'epub' } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [speaking, setSpeaking] = useState(false)
  const [hasReadableText, setHasReadableText] = useState(false)
  const [selectedVoiceName, setSelectedVoiceName] = useState('')
  const [speechLanguage, setSpeechLanguage] = useState<'auto' | 'vi-VN' | 'en-US'>('auto')
  const [speechRate, setSpeechRate] = useState(1)
  const [speechNotice, setSpeechNotice] = useState('')
  const speechAudioRef = useRef<HTMLAudioElement | null>(null)
  const speechUnlockAudioRef = useRef<HTMLAudioElement | null>(null)
  const speechAudioUrlRef = useRef('')
  const ttsWorkerRef = useRef<Worker | null>(null)
  const ttsWorkerModelRef = useRef('')
  const [readerBackground, setReaderBackground] = useState<'paper' | 'night' | 'olive'>('paper')
  const readerHostRef = useRef<HTMLDivElement | null>(null)
  const flipviewRef = useRef<FlipviewHandle | null>(null)
  const readerUrl = sample?.url ?? product.samplePdfUrl
  const fileType = sample?.fileType ?? product.sampleFileType ?? (readerUrl?.toLowerCase().includes('.epub') ? 'epub' : 'pdf')
  const getVisibleText = () => {
    if (!readerHostRef.current) return ''
    const pageInput = readerHostRef.current.querySelector<HTMLInputElement>('.fv-page-input')
    const currentPage = Number(pageInput?.value)
    const layers = Array.from(readerHostRef.current.querySelectorAll('.fv-text-layer')).filter((layer) => {
      const page = layer.closest<HTMLElement>('.fv-page')
      if (!page) return false
      const pageLabel = page.getAttribute('aria-label') ?? ''
      const rect = page.getBoundingClientRect()
      const style = window.getComputedStyle(page)
      const isVisible = style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0
      return isVisible && (!currentPage || pageLabel.startsWith(`Page ${currentPage} of`))
    })
    return layers.map((layer) => {
      const fragments = Array.from(layer.querySelectorAll<HTMLElement>('span[role="presentation"]')).map((span) => {
        const rect = span.getBoundingClientRect()
        const fontSize = Number.parseFloat(window.getComputedStyle(span).fontSize) || 8
        return { text: span.textContent?.replace(/\s+/g, ' ').trim() ?? '', top: rect.top, left: rect.left, right: rect.right, fontSize }
      }).filter((fragment) => fragment.text.length > 0).sort((a, b) => a.top - b.top || a.left - b.left)
      const lines: Array<{ top: number; right: number; fontSize: number; text: string }> = []
      fragments.forEach((fragment) => {
        const line = lines[lines.length - 1]
        if (!line || Math.abs(fragment.top - line.top) > Math.max(2, fragment.fontSize * 0.55)) {
          lines.push({ top: fragment.top, right: fragment.right, fontSize: fragment.fontSize, text: fragment.text })
          return
        }
        const gap = fragment.left - line.right
        line.text += `${gap > line.fontSize * 1.05 ? ' ' : ''}${fragment.text}`
        line.right = fragment.right
      })
      return lines.map((line) => line.text).join('\n')
    }).filter((text) => text.length > 1).join('\n').replace(/[�◊]/g, '').replace(/\n{3,}/g, '\n\n').trim()
  }

  const waitForReaderPaint = (timeout = 5000) => new Promise<boolean>((resolve) => {
    const startedAt = performance.now()
    const check = () => {
      const host = readerHostRef.current
      const paintedPage = host ? Array.from(host.querySelectorAll<HTMLElement>('.fv-page.fv-rendered')).some((page) => {
        const rect = page.getBoundingClientRect()
        const canvas = page.querySelector<HTMLCanvasElement>('.fv-page-canvas')
        return rect.width > 0 && rect.height > 0 && Boolean(canvas?.width && canvas?.height)
      }) : false
      if (paintedPage) {
        resolve(true)
        return
      }
      if (performance.now() - startedAt >= timeout) {
        resolve(false)
        return
      }
      window.requestAnimationFrame(check)
    }
    window.requestAnimationFrame(check)
  })

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    loadPublicBookSample(product.id ?? '', product.slug).then((value) => {
      if (!cancelled) {
        setSample(value ? { ...value, fileType: value.fileType ?? (value.url?.toLowerCase().includes('.epub') ? 'epub' : 'pdf') } : null)
        setLoading(false)
      }
    }).catch(() => { if (!cancelled) { setError('Không tải được file đọc thử.'); setLoading(false) } })
    return () => { cancelled = true }
  }, [product.id, product.slug])

  useEffect(() => {
    if (!readerUrl || !readerHostRef.current) return undefined
    let cancelled = false
    setLoading(true)
    setError('')
    void import('./book-reader-runtime').then(({ createEpubSource, createFlipview, createPdfSource, pdfWorkerUrl }) => {
      if (cancelled || !readerHostRef.current) return
      const createSource = fileType === 'epub'
        ? createEpubSource({ url: readerUrl })
        : createPdfSource({ url: readerUrl, workerSrc: pdfWorkerUrl })
      return createSource.then((source) => {
        if (cancelled || !readerHostRef.current) return
        const book = createFlipview(readerHostRef.current, source, {
          mode: 'auto',
          showCover: true,
          hardCovers: false,
          flippingTime: 700,
          textLayer: true,
          search: true,
          panel: true,
          zoom: true,
          keyboard: true,
          deepLink: true,
          downloadUrl: readerUrl,
          share: true,
          onReady: (handle) => {
            flipviewRef.current = handle
            void waitForReaderPaint().then((painted) => {
              if (cancelled) return
              setLoading(false)
              if (!painted) setError(`Không thể vẽ trang của file ${fileType.toUpperCase()}. Hãy tải lại trình đọc.`)
              window.setTimeout(() => setHasReadableText(getVisibleText().length > 1), 120)
            })
          },
          onPageChange: () => { window.setTimeout(() => setHasReadableText(getVisibleText().length > 1), 120) },
          onError: () => { if (!cancelled) setError(`Không thể hiển thị trang của file ${fileType.toUpperCase()}.`) },
        })
        flipviewRef.current = book
        setLoading(false)
      })
    }).catch(() => { if (!cancelled) { setError(`Không thể mở file ${fileType.toUpperCase()} đọc thử.`); setLoading(false) } })
    return () => { cancelled = true; flipviewRef.current?.destroy(); flipviewRef.current = null }
  }, [readerUrl, fileType])

  const activeLanguage = speechLanguage === 'auto' ? 'vi-VN' : speechLanguage
  const voiceOptions = nghiTtsVoices[activeLanguage]
  useEffect(() => {
    if (!voiceOptions.includes(selectedVoiceName)) setSelectedVoiceName(voiceOptions[0])
  }, [selectedVoiceName, voiceOptions])
  const stopSpeech = () => {
    ttsWorkerRef.current?.terminate()
    ttsWorkerRef.current = null
    ttsWorkerModelRef.current = ''
    speechAudioRef.current?.pause()
    speechAudioRef.current = null
    if (speechAudioUrlRef.current) { URL.revokeObjectURL(speechAudioUrlRef.current); speechAudioUrlRef.current = '' }
    setSpeaking(false)
  }
  const unlockAudioPlayback = () => {
    if (!speechUnlockAudioRef.current) {
      const unlockAudio = new Audio(silentAudioDataUri)
      unlockAudio.muted = true
      speechUnlockAudioRef.current = unlockAudio
    }
    void speechUnlockAudioRef.current.play().catch(() => undefined)
  }
  const createTtsWorker = (model: string, language: 'vi-VN' | 'en-US') => {
    ttsWorkerRef.current?.terminate()
    const worker = new Worker(new URL('./tts/workers/tts-worker.js', import.meta.url), { type: 'module' })
    ttsWorkerRef.current = worker
    ttsWorkerModelRef.current = model
    return new Promise<Worker>((resolve, reject) => {
      const onMessage = (event: MessageEvent<{ status?: string; data?: string }>) => {
        if (event.data.status === 'ready') { worker.removeEventListener('message', onMessage); resolve(worker) }
        if (event.data.status === 'error') { worker.removeEventListener('message', onMessage); reject(new Error(event.data.data ?? 'TTS model failed to load.')) }
      }
      worker.addEventListener('message', onMessage)
      worker.addEventListener('error', () => reject(new Error('TTS worker failed to start.')), { once: true })
      worker.postMessage({ type: 'init', model, lang: language })
    })
  }
  const speakWithNghiTts = async (text: string, language: 'vi-VN' | 'en-US') => {
    const options = nghiTtsVoices[language]
    const model = options.includes(selectedVoiceName) ? selectedVoiceName : options[0]
    const worker = ttsWorkerRef.current && ttsWorkerModelRef.current === model ? ttsWorkerRef.current : await createTtsWorker(model, language)
    const audioBlob = await new Promise<Blob>((resolve, reject) => {
      const onMessage = (event: MessageEvent<{ status?: string; audio?: Blob; data?: string }>) => {
        if (event.data.status === 'complete' && event.data.audio) { worker.removeEventListener('message', onMessage); resolve(event.data.audio) }
        if (event.data.status === 'error') { worker.removeEventListener('message', onMessage); reject(new Error(event.data.data ?? 'TTS generation failed.')) }
      }
      worker.addEventListener('message', onMessage)
      worker.postMessage({ type: 'speak', text, speed: speechRate, voice: 0, model, lang: language })
    })
    const audioUrl = URL.createObjectURL(audioBlob)
    speechAudioUrlRef.current = audioUrl
    const audio = new Audio(audioUrl)
    audio.preload = 'auto'
    audio.volume = 1
    speechAudioRef.current = audio
    audio.onended = stopSpeech
    audio.onerror = () => {
      stopSpeech()
      setSpeechNotice('Trình duyệt không phát được audio NGHI-TTS. Hãy kiểm tra âm lượng hoặc tải lại trang.')
    }
    await audio.play()
    setSpeaking(true)
    return true
  }
  const speakBook = async () => {
    if (!readerHostRef.current) return
    if (speaking) { stopSpeech(); return }
    const pageText = getVisibleText()
    if (!pageText) {
      setSpeechNotice('Trang này là ảnh scan nên chưa có lớp chữ để đọc. Hãy bật OCR cho bản đọc thử hoặc chuyển tới trang có văn bản.')
      return
    }
    unlockAudioPlayback()
    const inferredLanguage = speechLanguage === 'auto' ? (/[ăâđêôơưĂÂĐÊÔƠƯ]/.test(pageText) ? 'vi-VN' : 'en-US') : speechLanguage
    setSpeechNotice('')
    setSpeaking(true)
    try { await speakWithNghiTts(pageText, inferredLanguage) } catch (ttsError) { setSpeaking(false); setSpeechNotice(`Không tải được giọng đọc ${inferredLanguage === 'vi-VN' ? 'tiếng Việt' : 'tiếng Anh'}. ${ttsError instanceof Error ? ttsError.message : 'Hãy thử lại.'}`) }
  }
  const closeReader = () => {
    if (window.opener && !window.opener.closed) {
      window.close()
      return
    }
    onBack()
  }

  return <main className={`book-reader-page reader-background-${readerBackground}`}>
    <header className="book-reader-header">
      <button className="book-reader-back" type="button" onClick={closeReader}><i className="bi bi-x-lg" aria-hidden="true" /> Close reader</button>
      <div className="book-reader-heading"><span>Look inside</span><h1>{product.title}</h1><p>{product.author} · {fileType.toUpperCase()} reading sample</p></div>
      <span className="book-reader-format">{fileType.toUpperCase()}</span>
    </header>
    <section className="book-reader-stage" aria-label={`${product.title} book reader`}>
      {loading && <div className="book-reader-status">Loading reading sample…</div>}
      {error && <div className="book-reader-status book-reader-error">{error}</div>}
      {!loading && !error && !readerUrl && <div className="book-reader-status">Reading sample not available yet.</div>}
      {readerUrl && <div className="book-reader-host" ref={readerHostRef} aria-label={`${fileType.toUpperCase()} book reader`} />}
    </section>
    <div className="book-reader-tools">
      <div className="book-reader-background-picker" role="group" aria-label="Reader background">
        <span>Background</span>
        {(['paper', 'night', 'olive'] as const).map((background) => <button key={background} className={`book-reader-background-swatch is-${background}`} type="button" aria-label={`Use ${background} background`} aria-pressed={readerBackground === background} onClick={() => setReaderBackground(background)} />)}
      </div>
      <div className="book-reader-speech-group">
        <div className="book-reader-speech-settings">
          <label className="book-reader-voice-label"><span className="book-reader-select-with-icon"><i className="bi bi-translate" aria-hidden="true" /><select className="book-reader-language" value={speechLanguage} onChange={(event) => setSpeechLanguage(event.target.value as 'auto' | 'vi-VN' | 'en-US')} aria-label="Choose speech language"><option value="auto">Auto</option><option value="vi-VN">VI</option><option value="en-US">EN</option></select></span></label>
          <label className="book-reader-voice-label"><i className="bi bi-person-voice" aria-hidden="true" /><span>Voice</span><select className="book-reader-voice" value={selectedVoiceName} onChange={(event) => setSelectedVoiceName(event.target.value)} aria-label="Choose reading voice">{voiceOptions.map((voiceName) => <option key={voiceName} value={voiceName}>{voiceName}</option>)}</select></label>
          <label className="book-reader-rate-label"><i className="bi bi-speedometer2" aria-hidden="true" /><span className="book-reader-rate-text">Speed</span><select className="book-reader-rate" value={speechRate} onChange={(event) => setSpeechRate(Number(event.target.value))} aria-label={`Reading speed ${speechRate.toFixed(1)}x`}><option value="0.8">0.8×</option><option value="1">1.0×</option><option value="1.2">1.2×</option><option value="1.4">1.4×</option><option value="1.6">1.6×</option><option value="1.8">1.8×</option></select></label>
        </div>
        <button className={`book-reader-speech${speaking ? ' is-speaking' : ''}`} type="button" onClick={speakBook} disabled={!readerUrl || loading || !!error} aria-label={speaking ? 'Stop reading' : 'Read aloud'} title={speaking ? 'Stop reading' : 'Read aloud'}><span>{speaking ? 'Stop reading' : 'Read aloud'}</span> <i className={`bi ${speaking ? 'bi-volume-up' : 'bi-volume-mute'}`} aria-hidden="true" /></button>
      </div>
      {speechNotice && <p className="book-reader-speech-notice" role="status">{speechNotice}</p>}
    </div>
  </main>
}

function BookDetail({ product, onBack, onAuthor, onOpenDetail, onAddToCart, onBuyNow, onPreview, onPreviewLeave, onSelectQuickView, quickViewOpen }: { product: Product; onBack: () => void; onAuthor: (author: string) => void; onOpenDetail: (product: Product) => void; onAddToCart: (product: Product, source?: HTMLElement) => void; onBuyNow: (product: Product) => void; onPreview: (product: Product) => void; onPreviewLeave: () => void; onSelectQuickView: (product: Product) => void; quickViewOpen: boolean }) {
  const galleryImages = product.gallery?.length ? product.gallery : [product.image]
  const normalizedCategories = product.categories.map(normalizeProductCategory)
  const subjectCategories = normalizedCategories.filter((category) => !/^(fiction|non fiction)$/.test(category))
  const categoriesToMatch = subjectCategories.length > 0 ? subjectCategories : normalizedCategories
  const relatedProducts = catalogProducts
    .filter((candidate) => candidate.title !== product.title && candidate.categories.some((category) => categoriesToMatch.includes(normalizeProductCategory(category))))
    .sort((first, second) => {
      const firstMatches = first.categories.filter((category) => categoriesToMatch.includes(normalizeProductCategory(category))).length
      const secondMatches = second.categories.filter((category) => categoriesToMatch.includes(normalizeProductCategory(category))).length
      return secondMatches - firstMatches
    })
    .slice(0, 6)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [activeImage, setActiveImage] = useState(0)
  const [descriptionExpanded, setDescriptionExpanded] = useState(false)
  const [readExcerptOpen, setReadExcerptOpen] = useState(false)
  const [bookSample, setBookSample] = useState<{ url?: string; pageCount?: number; fileType?: 'pdf' | 'epub' } | null>(null)
  const [reviewFormOpen, setReviewFormOpen] = useState(false)
  const [reviewSubmitted, setReviewSubmitted] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const unitPrice = Number(product.price.replace(/[^0-9]/g, ''))
  const totalPrice = `${(unitPrice * quantity).toLocaleString('vi-VN')}₫`
  const isAvailable = product.available !== false
  const hasReadExcerpt = Boolean(product.samplePdfUrl || bookSample?.url)

  useEffect(() => {
    setBookSample(null)
  }, [product.id, product.title])

  useEffect(() => {
    if (!product.id || bookSample?.url) return undefined
    let cancelled = false
    loadPublicBookSample(product.id, product.slug).then((sample) => {
      if (!cancelled && sample) setBookSample(sample)
    }).catch(() => undefined)
    return () => { cancelled = true }
  }, [product.id, bookSample?.url])

  useEffect(() => {
    if (!lightboxOpen) return undefined
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setLightboxOpen(false)
      if (event.key === 'ArrowRight') setActiveImage((current) => (current + 1) % galleryImages.length)
      if (event.key === 'ArrowLeft') setActiveImage((current) => (current - 1 + galleryImages.length) % galleryImages.length)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [lightboxOpen, galleryImages.length])

  return <main className="book-detail-page">
    <section className="book-detail-hero">
      <div className="book-detail-gallery">
        <button className="book-detail-cover-wrap" type="button" aria-label={`Open gallery for ${product.title}`} onClick={() => setLightboxOpen(true)}>
          <span className="detail-mobile-back" role="button" aria-label="Back to books" tabIndex={0} onClick={(event) => { event.stopPropagation(); onBack() }} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); event.stopPropagation(); onBack() } }}><i className="bi bi-arrow-left" aria-hidden="true" /></span>
          <img className="book-detail-cover" src={galleryImages[activeImage] || BOOK_COVER_FALLBACK} alt={product.title} onError={handleBookCoverError} />
          <span className="book-detail-zoom"><i className="bi bi-arrows-fullscreen" aria-hidden="true" /> View full image</span>
        </button>
        {hasReadExcerpt && <div className="book-excerpt-cta"><button className="book-excerpt-button" type="button" aria-pressed={readExcerptOpen} onClick={() => setReadExcerptOpen((open) => !open)}><i className="bi bi-book-half" aria-hidden="true" /> {readExcerptOpen ? 'Close excerpt' : 'Read Excerpt'}</button><button className="book-excerpt-button book-look-inside-button" type="button" onClick={() => { const slug = product.slug || productSlug(product.title); const reader = window.open(`/books/${slug}/reader`, '_blank'); if (!reader) window.location.assign(`/books/${slug}/reader`) }}><i className="bi bi-file-earmark-pdf" aria-hidden="true" /> Look inside</button></div>}
      </div>
      <div className="book-detail-copy">
        <nav className="book-detail-breadcrumb" aria-label="Breadcrumb"><button onClick={onBack}>Books</button><span aria-hidden="true">/</span><span>{product.title}</span></nav>
        <h1>{product.title}</h1>
        <p className="book-detail-author">by <a href={`/authors/${authorSlug(product.author)}`} onClick={(event) => { event.preventDefault(); onAuthor(product.author) }}>{product.author}</a></p>
        <div className="book-detail-rule" />
        <div className="book-detail-category"><div aria-label="Book classifications">{product.categories.map((category) => <a className="book-classification-link" key={category} href={`/all-books?category=${encodeURIComponent(category.toLowerCase().replaceAll(' ', '-'))}`}>{category}</a>)}</div></div>
        <div className="book-detail-purchase">
          <div className="book-detail-price-row">
            {isAvailable && <div className="book-detail-quantity" aria-label="Select quantity">
              <div className="book-detail-quantity-control">
                <button type="button" aria-label="Decrease quantity" onClick={() => setQuantity((current) => Math.max(1, current - 1))}>−</button>
                <output>{quantity}</output>
                <button type="button" aria-label="Increase quantity" onClick={() => setQuantity((current) => current + 1)}>+</button>
              </div>
            </div>}
            <p className="book-detail-price" aria-live="polite">{totalPrice}</p>
          </div>
          <div className="book-detail-actions">
            <button className="book-add-button" type="button" disabled={!isAvailable} aria-disabled={!isAvailable} onClick={(event) => onAddToCart(product, event.currentTarget)}>Add to Cart</button>
            <button className="book-buy-button" type="button" onClick={() => onBuyNow(product)}>{isAvailable ? 'Buy Now' : 'PreOrder'}</button>
          </div>
        </div>
        <section className="book-detail-inline-description" aria-labelledby="book-description-title">
          <h2 id="book-description-title">Description</h2>
          <div id="book-description-copy" className={`book-description-content ${descriptionExpanded ? 'is-expanded' : ''}`}>
            {product.description ? <div dangerouslySetInnerHTML={{ __html: product.description }} /> : <p>Chưa có mô tả cho sách này.</p>}
          </div>
          <button className="book-detail-read-more" type="button" aria-expanded={descriptionExpanded} aria-controls="book-description-copy" onClick={() => setDescriptionExpanded((expanded) => !expanded)}>
            <span>{descriptionExpanded ? 'Read less' : 'Read more'}</span>
            <i className={`bi bi-arrow-${descriptionExpanded ? 'up' : 'down'}`} aria-hidden="true" />
          </button>
        </section>
        <section className="book-details-grid book-detail-inline-details" aria-labelledby="details-title">
          <h2 id="details-title">Details</h2>
          <dl><div><dt>Format</dt><dd>{product.format || '—'}</dd></div><div><dt>ISBN</dt><dd>{product.isbn || '—'}</dd></div><div><dt>Pages</dt><dd>{product.pageCount ? `${product.pageCount} pages` : '—'}</dd></div><div><dt>Language</dt><dd>{product.languages?.join(', ') || '—'}</dd></div><div><dt>Publisher</dt><dd>{product.publisher || '—'}</dd></div>{product.line && <div><dt>Line</dt><dd>{product.line}</dd></div>}{product.imprint && <div><dt>Imprint</dt><dd>{product.imprint}</dd></div>}{product.bookSize && <div><dt>Book size</dt><dd>{product.bookSize}</dd></div>}{product.weight && <div><dt>Weight</dt><dd>{product.weight}</dd></div>}{product.publicationDate && <div><dt>Publication date</dt><dd>{product.publicationDate}</dd></div>}</dl>
        </section>
        {relatedProducts.length > 0 && <RelatedBooksPanel items={relatedProducts} onOpenDetail={onOpenDetail} />}
      </div>
    </section>
    <section className="book-detail-section book-reviews" aria-labelledby="reviews-title">
      <div className="book-reviews-heading">
        <div>
          <h2 id="reviews-title">Book reviews</h2>
          <div className="book-rating-summary"><span className="book-rating-stars" aria-label="4.8 out of 5 stars">★★★★★</span><strong>4.8</strong><span>24 reviews</span></div>
          <a className="book-review-login" href="#login">Please log in to use the commenting feature.</a>
        </div>
        <button className="book-review-button" type="button" aria-expanded={reviewFormOpen} aria-controls="book-review-form" onClick={() => { setReviewFormOpen((open) => !open); setReviewSubmitted(false) }}>{reviewFormOpen ? 'Close review form' : 'Write a review'}</button>
      </div>
      {reviewFormOpen && <form id="book-review-form" className="book-review-form" onSubmit={(event) => { event.preventDefault(); setReviewSubmitted(true) }}>
        <h3>Share your thoughts</h3>
        <div className="book-review-rating-field">
          <span>Your rating</span>
          <div className="book-review-rating-options" role="group" aria-label="Your rating">
            {[1, 2, 3, 4, 5].map((rating) => <label key={rating}><input type="radio" name="rating" value={rating} defaultChecked={rating === 5} /><span aria-hidden="true">★</span><span className="sr-only">{rating} out of 5 stars</span></label>)}
          </div>
        </div>
        <div className="book-review-form-grid">
          <label>Name<input type="text" name="name" autoComplete="name" required /></label>
          <label>Email<input type="email" name="email" autoComplete="email" required /></label>
        </div>
        <label className="book-review-message">Your review<textarea name="review" rows={4} required /></label>
        <button className="book-review-submit" type="submit">Submit review</button>
        {reviewSubmitted && <p className="book-review-success" role="status">Thank you — your review has been received.</p>}
      </form>}
      <div className="book-review-card"><div className="book-rating-stars" aria-label="5 out of 5 stars">★★★★★</div><p className="book-review-title">A thoughtful, beautifully made edition</p><p className="book-review-meta">Linery reader · 2 weeks ago</p><p className="book-review-body">A memorable title with a careful presentation. The kind of book you want to return to and share.</p></div>
    </section>
    {readExcerptOpen && hasReadExcerpt && <div className="book-excerpt-overlay" role="presentation">
      <button className="book-excerpt-backdrop" type="button" aria-label="Close excerpt" onClick={() => setReadExcerptOpen(false)} />
      <aside className="book-excerpt-drawer" role="dialog" aria-modal="true" aria-labelledby="book-excerpt-title">
        <div className="book-excerpt-header"><div><p className="book-detail-kicker">Read excerpt</p><h2 id="book-excerpt-title">A Manual for Cleaning Women</h2><p className="book-excerpt-byline">Lucia Berlin · Edited by Stephen Emerson · Foreword by Lydia Davis</p></div><button className="book-excerpt-close" type="button" onClick={() => setReadExcerptOpen(false)}><i className="bi bi-x-lg" aria-hidden="true" /> Close</button></div>
        <article className="book-excerpt-content"><h3>Angel&apos;s Laundromat</h3><p>A short story set around a laundromat in Albuquerque, where chance encounters, memory and loneliness gather in the everyday rhythm of washing clothes.</p><p className="book-excerpt-quote">“A tall old Indian in faded Levi&apos;s and a fine Zuni belt.”</p><p>Berlin&apos;s story moves through observation and recollection, bringing its characters into focus through small gestures, vivid details and an unexpected intimacy.</p></article>
      </aside>
    </div>}
    {lightboxOpen && <div className="book-lightbox" role="dialog" aria-modal="true" aria-label={`Image gallery for ${product.title}`} onClick={() => setLightboxOpen(false)}>
      <div className="book-lightbox-frame" onClick={(event) => event.stopPropagation()}>
        <img className="book-lightbox-image" src={galleryImages[activeImage] || BOOK_COVER_FALLBACK} alt={product.title} onError={handleBookCoverError} />
        <div className="book-lightbox-thumbnails" aria-label="Book images">
          {galleryImages.map((image, index) => <button key={`${image}-${index}`} className={`book-lightbox-thumbnail ${index === activeImage ? 'is-active' : ''}`} type="button" aria-label={`View image ${index + 1}`} onClick={() => setActiveImage(index)}><img src={image || BOOK_COVER_FALLBACK} alt="" loading="lazy" decoding="async" onError={handleBookCoverError} /></button>)}
        </div>
        <button className="book-lightbox-close" type="button" aria-label="Close gallery" onClick={() => setLightboxOpen(false)}><i className="bi bi-x-lg" aria-hidden="true" /></button>
        {galleryImages.length > 1 && <><button className="book-lightbox-nav book-lightbox-prev" type="button" aria-label="Previous image" onClick={() => setActiveImage((current) => (current - 1 + galleryImages.length) % galleryImages.length)}><i className="bi bi-chevron-left" aria-hidden="true" /></button><button className="book-lightbox-nav book-lightbox-next" type="button" aria-label="Next image" onClick={() => setActiveImage((current) => (current + 1) % galleryImages.length)}><i className="bi bi-chevron-right" aria-hidden="true" /></button></>}
      </div>
    </div>}
  </main>
}

function BookPreview({ product, onClose, onOpenDetail }: { product: Product | null; onClose: () => void; onOpenDetail: (product: Product) => void }) {
  const publisher = product?.publisher ?? 'Linery Books'
  return <aside className={`book-preview ${product ? '' : 'is-empty'}`} aria-label="Quick view">
    <div className="book-preview-header"><p>Quick view</p><button type="button" aria-label="Close quick view" onClick={onClose}>×</button></div>
    {product ? <>
      <img className="book-preview-cover" src={product.image || BOOK_COVER_FALLBACK} alt={product.title} loading="lazy" decoding="async" onError={handleBookCoverError} />
      <div className="book-preview-copy">
        <h2>{product.title}</h2>
        <p className="book-preview-author">{product.author}</p>
        <p className="book-preview-price">{product.price}</p>
      </div>
      <dl className="book-preview-details">
        <div><dt>Publisher</dt><dd>{publisher}</dd></div>
        <div><dt>ISBN</dt><dd>{product.isbn || '—'}</dd></div>
        <div><dt>Format</dt><dd>{product.format || '—'}</dd></div>
        <div><dt>Language</dt><dd>{product.languages?.join(', ') || '—'}</dd></div>
        <div><dt>Pages</dt><dd>{product.pageCount ? `${product.pageCount} pages` : '—'}</dd></div>
      </dl>
      <a className="book-preview-link" href="#a" onClick={(event) => { event.preventDefault(); onOpenDetail(product) }}>View full details <span aria-hidden="true">→</span></a>
    </> : <div className="book-preview-empty">
      <img src="/assets/quick-view-illustration.png" alt="" aria-hidden="true" />
      <p>Hello — I’m here to help you preview book information.</p>
      <span>Choose a book to see its cover and publication details.</span>
    </div>}
  </aside>
}

function UtilityPanel({ product, onClose, onOpenDetail, onAuthor, onAddToCart, onBuyNow, onToggleWishlist, isWishlisted }: { product: Product | null; onClose: () => void; onOpenDetail: (product: Product) => void; onAuthor: (author: string) => void; onAddToCart: (product: Product, source?: HTMLElement) => void; onBuyNow: (product: Product) => void; onToggleWishlist: (product: Product) => void; isWishlisted: (product: Product) => boolean }) {
  const publisher = product?.publisher ?? 'Linery Books'
  const scrollRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0
  }, [product?.title])

  return <div className="utility-panel-layer" role="presentation">
    <aside className="utility-panel" aria-label="Quick view">
      <div className="utility-panel-header">
        {product ? <button className={`utility-panel-wishlist ${isWishlisted(product) ? 'is-active' : ''}`} type="button" aria-label={isWishlisted(product) ? `Remove ${product.title} from wishlist` : `Add ${product.title} to wishlist`} title={isWishlisted(product) ? 'Remove from your wishlist' : 'Add to your wishlist'} aria-pressed={isWishlisted(product)} onClick={() => onToggleWishlist(product)}><i className={`bi ${isWishlisted(product) ? 'bi-heart-fill' : 'bi-heart'}`} aria-hidden="true" /></button> : <span aria-hidden="true" />}
        <button className="utility-panel-close" type="button" aria-label="Close panel" onClick={onClose}>×</button>
      </div>
      {product ? <>
        <div ref={scrollRef} className="utility-panel-scroll">
          <div className="utility-panel-product-transition" key={product.title}>
          <img className="book-preview-cover" src={product.image || BOOK_COVER_FALLBACK} alt={product.title} loading="lazy" decoding="async" onError={handleBookCoverError} />
          <div className="book-preview-copy"><h2>{product.title}</h2><p className="book-preview-author"><a className="book-preview-author-link" href={`/creators/${authorSlug(product.author)}`} onClick={(event) => { event.preventDefault(); onAuthor(product.author) }}>{product.author}</a></p><p className="book-preview-price">{product.price}</p></div>
          <div className="book-preview-section-divider" aria-hidden="true" />
          <dl className="book-preview-details"><div><dt>Publisher</dt><dd>{publisher}</dd></div><div><dt>ISBN</dt><dd>{product.isbn || '—'}</dd></div><div><dt>Format</dt><dd>{product.format || '—'}</dd></div><div><dt>Language</dt><dd>{product.languages?.join(', ') || '—'}</dd></div><div><dt>Pages</dt><dd>{product.pageCount ? `${product.pageCount} pages` : '—'}</dd></div></dl>
          <a className="book-preview-link" href="#a" onClick={(event) => { event.preventDefault(); onOpenDetail(product) }}>View full details <span aria-hidden="true">→</span></a>
          </div>
        </div>
        <div className="utility-panel-footer book-preview-actions"><button className="book-preview-add-button" type="button" disabled={product.available === false} aria-disabled={product.available === false} onClick={(event) => onAddToCart(product, event.currentTarget)}>Add to cart</button><button className="book-preview-buy-button" type="button" onClick={() => onBuyNow(product)}>{product.available === false ? 'PreOrder' : 'Buy Now'}</button></div>
      </> : <div className="utility-panel-empty"><img src="/assets/quick-view-illustration.png" alt="" aria-hidden="true" /><p>Hello — I’m here to help you preview book information.</p><span>Choose a book to see its cover and publication details.</span></div>}
    </aside>
  </div>
}

function Footer({ menuItems = [], siteSettings = {} }: { menuItems?: PublicMenuItem[]; siteSettings?: PublicSiteSettings }) {
  const footerColumns = [
    { title: 'About Us', links: [['About Us', '/news/gioi-thieu'], ['Contact', '/news/lien-he']] },
    { title: 'Policies & Terms', links: [['Policies', '/news/chinh-sach'], ['Terms', '/news/dieu-khoan']] },
  ]
  const footerMenuItems = menuItems.filter((item) => item.menuKey === 'footer-main')
  const resolvedFooterColumns = footerMenuItems.length > 0 ? [
    { title: 'About Us', links: footerMenuItems.slice(0, 2).map((item) => [item.label, item.href] as [string, string]) },
    { title: 'Policies & Terms', links: footerMenuItems.slice(2).map((item) => [item.label, item.href] as [string, string]) },
  ].filter((column) => column.links.length > 0) : footerColumns
  return <footer className="site-footer scroll-section" id="about">
    <div className="footer-copy">
      <h2 className="footer-brand"><img src={String(siteSettings.site_logo?.publicUrl ?? '/assets/linerybooks-favicon-round.svg')} alt="LineryBooks" /> <span>LINERY</span></h2>
      <p className="footer-quote">(pn.) /'lınəri/<br />a curated bookstore &amp; independent press, crafted in Hanoi</p>
      <div className="footer-contact"><i className="bi bi-telephone-fill" aria-hidden="true" /><a href="tel:+840946936039">+84 0946936039</a></div>
      <div className="footer-contact"><i className="bi bi-geo-alt-fill" aria-hidden="true" /><span>Hanoi Book Street, Cua Nam Ward, Hanoi</span></div>
      <div className="footer-contact"><i className="bi bi-envelope-fill" aria-hidden="true" /><a href="mailto:info@linerybooks.vn">info@linerybooks.vn</a></div>
      <p className="follow-label">Follow Us</p>
      <div className="socials">
        <a href="https://www.instagram.com/linery_bookstore/" aria-label="Instagram" target="_blank" rel="noreferrer"><i className="bi bi-instagram" aria-hidden="true" /></a>
        <a href="https://www.facebook.com/profile.php?id=61594396817773" aria-label="Facebook" target="_blank" rel="noreferrer"><i className="bi bi-facebook" aria-hidden="true" /></a>
        <a href="https://www.tiktok.com/@linery.bookstore" aria-label="TikTok" target="_blank" rel="noreferrer"><i className="bi bi-tiktok" aria-hidden="true" /></a>
        <a href="https://www.threads.com/@linery.bookstore?igshid=NTc4MTIwNjQ2YQ%3D%3D&utm_source=ig&utm_medium=social&utm_content=link_in_bio&fbclid=PAZXh0bgNhZW0CMTEAcGRvZgJzcnRjBmFwcF9pZA85MzY2MTk3NDMzOTI0NTkAAadkPgo6TPdGsI8YcRqX6zvx2mf3KyzJLuV1KVQ3CXH-ISflzJSqbMSo8gkpKQ_aem_aGuV0mbR-u7qcscBboQEzQ" aria-label="Threads" target="_blank" rel="noreferrer"><i className="bi bi-threads" aria-hidden="true" /></a>
      </div>
    </div>
    <div className="footer-links">
      {resolvedFooterColumns.map((column) => <nav className="footer-link-column" aria-label={column.title} key={column.title}><h3>{column.title}</h3>{column.links.map(([label, href]) => <a href={href} key={href}>{label}</a>)}</nav>)}
    </div>
  </footer>
}

type ChatAttachment = { name: string; src: string; mimeType: string }
type ChatMessage = { role: 'assistant' | 'user'; text: string; image?: ChatAttachment }
const directGeminiApiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined

const localChatReply = (question: string) => {
  const normalized = question.toLowerCase()
  const matchedBook = catalogProducts.find((product) => normalized.includes(product.title.toLowerCase()) || normalized.includes(product.author.toLowerCase()))
  if (matchedBook) return `${matchedBook.title} — ${matchedBook.author}. Giá hiện tại ${matchedBook.price}${matchedBook.available === false ? '. Sản phẩm hiện đang hết hàng.' : '. Sản phẩm đang có trên catalog Linery.'}`
  if (normalized.includes('find') || normalized.includes('tìm') || normalized.includes('sách') || normalized.includes('book')) {
    return `Bạn có thể bắt đầu với: ${catalogProducts.slice(0, 3).map((product) => `${product.title} (${product.price})`).join('; ')}. Hãy hỏi tên sách, tác giả hoặc thể loại để Linbot lọc tiếp.`
  }
  if (normalized.includes('track') || normalized.includes('đơn') || normalized.includes('order')) return 'Để tra đơn, bạn gửi mã đơn hàng dạng LINERYxxxxxxxx nhé. Linbot sẽ kiểm tra lịch sử đơn của tài khoản đang đăng nhập.'
  return 'Linbot có thể giúp tìm sách theo tên/tác giả, gợi ý sách trong catalog và hướng dẫn tra đơn. Bạn thử hỏi “tìm sách của Haruki Murakami” hoặc gửi mã đơn hàng nhé.'
}

const remoteChatReply = async (question: string) => {
  const normalized = question.toLowerCase()
  if (normalized.includes('track') || normalized.includes('đơn') || normalized.includes('order')) {
    const orderCode = question.match(/LINERY[a-z0-9-]+/i)?.[0]
    const orders = await loadMyOrders()
    const order = orderCode ? orders.find((item) => item.orderNumber.toLowerCase() === orderCode.toLowerCase()) : orders[0]
    if (!order) return orderCode ? `Không tìm thấy đơn ${orderCode} trong tài khoản đang đăng nhập.` : 'Bạn gửi mã đơn hàng hoặc đăng nhập để Linbot kiểm tra đơn gần nhất.'
    return `Đơn ${order.orderNumber}: ${order.status}; ${order.itemCount} cuốn; tổng ${formatPrice(order.totalVnd)}.`
  }
  if (catalogProducts.length) return localChatReply(question)
  const products = await loadPublicCatalogProducts()
  const matchedBook = products?.find((product) => normalized.includes(product.title.toLowerCase()) || normalized.includes(product.author.toLowerCase()))
  if (matchedBook) return `${matchedBook.title} — ${matchedBook.author}. Giá hiện tại ${matchedBook.price}${matchedBook.available ? '. Sản phẩm đang có trên catalog Linery.' : '. Sản phẩm hiện đang hết hàng.'}`
  if (products?.length && (normalized.includes('find') || normalized.includes('tìm') || normalized.includes('sách') || normalized.includes('book'))) return `Bạn có thể bắt đầu với: ${products.slice(0, 3).map((product) => `${product.title} (${product.price})`).join('; ')}. Hãy hỏi tên sách hoặc tác giả để Linbot lọc tiếp.`
  return localChatReply(question)
}

function ChatbotWidget({ embedded = false, adminMode = false }: { embedded?: boolean; adminMode?: boolean } = {}) {
  const [isOpen, setIsOpen] = useState(embedded)
  const [isExpanded, setIsExpanded] = useState(false)
  const [message, setMessage] = useState('')
  const [attachment, setAttachment] = useState<ChatAttachment | null>(null)
  const [isSending, setIsSending] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([{ role: 'assistant', text: adminMode ? 'Xin chào, tôi là Linbot. Tôi có thể hỗ trợ tra cứu sách, tác giả, nội dung và các đầu việc quản trị.' : 'Hi, I’m Linbot. I can help you find books, authors, and order information.' }])

  const sendMessage = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextMessage = message.trim()
    if (!nextMessage && !attachment) return
    const userText = nextMessage || 'Please identify this book cover and check whether it is available online.'
    const attachmentText = attachment ? ` (${attachment.name})` : ''
    const sentAttachment = attachment
    setMessages((current) => [...current, { role: 'user', text: `${userText}${attachmentText}`, image: sentAttachment ?? undefined }])
    setMessage('')
    setAttachment(null)
    setIsSending(true)

    try {
      const imageData = sentAttachment?.src.split(',')[1]
      const requestBody = { message: userText, image: imageData ? { mimeType: sentAttachment.mimeType, data: imageData } : undefined }
      const response = directGeminiApiKey
        ? await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-goog-api-key': directGeminiApiKey },
          body: JSON.stringify({ contents: [{ parts: [{ text: `${adminMode ? 'You are Linbot, an internal bookstore administration assistant. Focus on catalog, creators, orders, content, media, and moderation. Answer in the user\'s language and clearly distinguish demo data from verified data.' : 'You are Linbot, a bookstore support agent. Answer in the user\'s language.'} If an image is provided, identify the book cover as accurately as possible. Do not invent a match. User request: ${userText}` }, ...(imageData ? [{ inline_data: { mime_type: sentAttachment.mimeType, data: imageData } }] : [])] }] }),
        })
        : await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      })
      const result = await response.json() as { text?: string; error?: { message?: string } | string; candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> }
      const directText = result.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('').trim()
      const errorText = typeof result.error === 'string' ? result.error : result.error?.message
      const remoteText = response.ok && (directText || result.text) ? directText || result.text || '' : ''
      const fallback = sentAttachment ? 'Đã nhận ảnh. AI đang tạm thời không khả dụng để nhận diện ảnh, nhưng bạn có thể hỏi theo tên sách hoặc tác giả.' : await remoteChatReply(userText)
      setMessages((current) => [...current, { role: 'assistant', text: remoteText || fallback }])
    } catch {
      void remoteChatReply(userText).then((fallback) => setMessages((current) => [...current, { role: 'assistant', text: sentAttachment ? 'Đã nhận ảnh. AI đang tạm thời không khả dụng để nhận diện ảnh, nhưng bạn có thể hỏi theo tên sách hoặc tác giả.' : fallback }])).catch(() => setMessages((current) => [...current, { role: 'assistant', text: localChatReply(userText) }]))
    } finally {
      setIsSending(false)
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = () => setAttachment({ name: file.name, src: String(reader.result), mimeType: file.type })
    reader.readAsDataURL(file)
    event.target.value = ''
  }

  const askDemoQuestion = (text: string) => {
    setMessages((current) => [...current, { role: 'user', text }])
    void remoteChatReply(text).then((reply) => setMessages((current) => [...current, { role: 'assistant', text: reply }])).catch(() => setMessages((current) => [...current, { role: 'assistant', text: localChatReply(text) }]))
  }

  return <>
    {!embedded && !isOpen && <button className="chatbot-float-button" type="button" aria-label={adminMode ? 'Mở trợ lý quản trị Linery' : 'Open Linery chatbot'} onClick={() => setIsOpen(true)}><img src="/assets/chatbot.svg" alt="" aria-hidden="true" /></button>}
    {isOpen && <section className={`chatbot-panel ${embedded ? 'chatbot-panel-embedded' : ''} ${isExpanded && !embedded ? 'is-expanded' : ''}`} role="dialog" aria-modal="false" aria-label="Linery chatbot">
      <header className="chatbot-header">
        <div className="chatbot-heading"><span className="chatbot-avatar"><img src="/assets/chatbot.svg" alt="" aria-hidden="true" /></span><div><strong>Linbot</strong><span>{adminMode ? 'Trợ lý quản trị' : 'Bookshop support'}</span></div></div>
        <div className="chatbot-header-actions">{!embedded && <button type="button" aria-label={isExpanded ? 'Use compact chat size' : 'Use full chat size'} onClick={() => setIsExpanded((current) => !current)}><i className={`bi ${isExpanded ? 'bi-fullscreen-exit' : 'bi-arrows-fullscreen'}`} aria-hidden="true" /></button>}{!embedded && <button type="button" aria-label="Close chatbot" onClick={() => setIsOpen(false)}><i className="bi bi-x-lg" aria-hidden="true" /></button>}</div>
      </header>
      <div className="chatbot-messages" aria-live="polite">
        {messages.map((item, index) => <div className={`chatbot-message chatbot-message-${item.role}`} key={`${item.role}-${index}`}>{item.image && <img className="chatbot-message-image" src={item.image.src} alt={`Book cover: ${item.image.name}`} />}<p>{item.text}</p></div>)}
        <div className="chatbot-prompts">{adminMode ? <><button type="button" onClick={() => askDemoQuestion('Tìm sách đang thiếu ảnh bìa')}>Tìm sách thiếu ảnh</button><button type="button" onClick={() => askDemoQuestion('Kiểm tra dữ liệu tác giả')}>Kiểm tra tác giả</button></> : <><button type="button" onClick={() => askDemoQuestion('Find a book for me')}>Find a book</button><button type="button" onClick={() => askDemoQuestion('Track my order')}>Track an order</button></>}</div>
      </div>
      <form className="chatbot-composer" onSubmit={sendMessage}>
        {attachment && <div className="chatbot-attachment-preview"><img src={attachment.src} alt={`Selected ${attachment.name}`} /><span>{attachment.name}</span><button type="button" aria-label="Remove selected image" onClick={() => setAttachment(null)}><i className="bi bi-x-lg" aria-hidden="true" /></button></div>}
        <div className="chatbot-composer-row">
          <label className="chatbot-upload-button" aria-label="Upload a book cover image">
            <i className="bi bi-image" aria-hidden="true" />
            <input type="file" accept="image/*" onChange={handleImageUpload} />
          </label>
          <input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Ask about a book..." aria-label="Chat message" />
          <button type="submit" aria-label="Send message" disabled={isSending}><i className={`bi ${isSending ? 'bi-hourglass-split' : 'bi-arrow-up'}`} aria-hidden="true" /></button>
        </div>
      </form>
    </section>}
  </>
}

const getPriceValue = (price: string) => Number(price.replace(/[^0-9]/g, '')) || 0
const formatPrice = (value: number) => `${value.toLocaleString('vi-VN')}₫`
const productKey = (product: Product) => product.id || product.slug || product.title

type StorefrontCustomerRecord = { id: string; name: string; email: string; phone: string; orderCount: number; status: 'Đang hoạt động' | 'Tạm khóa'; createdAt: string }
type StorefrontOrderRecord = { id: string; customerId: string; customerName: string; channel: string; total: number; status: 'Đơn nháp' | 'Chờ thanh toán' | 'Đã xác nhận' | 'Chờ xác nhận' | 'Đang xử lý' | 'Đã giao' | 'Đã hủy' | 'Đã bỏ dở' | 'Hết hạn'; createdAt: string }
const storefrontCustomersKey = 'linery-storefront-customers-v2'
const storefrontOrdersKey = 'linery-storefront-orders-v2'

const demoOrders: StorefrontOrderRecord[] = [
  ['LINERY10246069', 'Khách chưa cung cấp thông tin', 'Website', 434000, 'Đã bỏ dở', '2026-11-08T22:10:44+07:00'],
  ['LINERY82942903', 'Khách chưa cung cấp thông tin', 'Website', 1919000, 'Đơn nháp', '2026-11-08T21:38:58+07:00'],
  ['LINERY55369637', 'Hoàng Đức', 'Website', 951000, 'Chờ thanh toán', '2026-11-06T19:05:41+07:00'],
  ['LINERY58615682', 'Hoàng Đức', 'Website', 1769000, 'Chờ thanh toán', '2026-11-06T19:01:44+07:00'],
  ['LINERY44106281', 'Khách chưa cung cấp thông tin', 'Website', 1278000, 'Đã bỏ dở', '2026-11-06T19:01:08+07:00'],
  ['LINERY89982163', 'Khách chưa cung cấp thông tin', 'Website', 511000, 'Đã bỏ dở', '2026-11-06T18:57:00+07:00'],
  ['LINERY41690875', 'Nguyen Van Test', 'Website', 490000, 'Chờ thanh toán', '2026-11-06T18:19:15+07:00'],
  ['LINERY44133327', 'Khách chưa cung cấp thông tin', 'Website', 903000, 'Đơn nháp', '2026-11-06T01:10:14+07:00'],
  ['LINERY04930441', 'Khách chưa cung cấp thông tin', 'Website', 511000, 'Đã bỏ dở', '2026-11-05T21:37:26+07:00'],
  ['LINERY53441843', 'Khách chưa cung cấp thông tin', 'Website', 1824000, 'Đơn nháp', '2026-11-05T01:24:52+07:00'],
  ['LINERY89088142', 'Khách chưa cung cấp thông tin', 'Website', 535000, 'Đã bỏ dở', '2026-11-03T18:26:02+07:00'],
  ['LINERY02426146', 'Khách chưa cung cấp thông tin', 'Website', 1023000, 'Đã bỏ dở', '2026-11-03T18:15:01+07:00'],
  ['LINERY03589218', 'Khách chưa cung cấp thông tin', 'Website', 511000, 'Đã bỏ dở', '2026-11-03T18:10:45+07:00'],
  ['LINERY39774328', 'Khách chưa cung cấp thông tin', 'Website', 511000, 'Đã bỏ dở', '2026-11-03T17:19:51+07:00'],
  ['LINERY95918166', 'Khách chưa cung cấp thông tin', 'Website', 0, 'Đã bỏ dở', '2026-11-03T17:15:20+07:00'],
  ['LINERY05175602', 'Đức Hải Hoàng', 'Website', 517000, 'Đã xác nhận', '2026-10-29T21:09:07+07:00'],
  ['LINERY58342771', 'Đức Hải Hoàng', 'Website', 491000, 'Hết hạn', '2026-10-29T21:00:38+07:00'],
  ['TSQ-20261029-583C89C9', 'Đức Hải Hoàng', 'Website', 1525000, 'Chờ thanh toán', '2026-10-29T20:55:29+07:00'],
].map((row): StorefrontOrderRecord => {
  const [id, customerName, channel, total, status, createdAt] = row as [string, string, string, number, string, string]
  return { id, customerId: `demo-${customerName}`, customerName, channel, total, status: status as StorefrontOrderRecord['status'], createdAt }
})

const demoCustomers: StorefrontCustomerRecord[] = [
  { id: 'demo-hoang-duc', name: 'Hoàng Đức', email: 'hoang.duc+demo@linerybooks.vn', phone: '09•• ••• 182', orderCount: 2, status: 'Đang hoạt động', createdAt: '2026-10-29T21:09:07+07:00' },
  { id: 'demo-duc-hai-hoang', name: 'Đức Hải Hoàng', email: 'duc.hai+demo@linerybooks.vn', phone: '09•• ••• 291', orderCount: 3, status: 'Đang hoạt động', createdAt: '2026-10-29T20:55:29+07:00' },
  { id: 'demo-nguyen-van-test', name: 'Nguyen Van Test', email: 'nguyen.test+demo@linerybooks.vn', phone: '09•• ••• 875', orderCount: 1, status: 'Đang hoạt động', createdAt: '2026-11-06T18:19:15+07:00' },
  { id: 'demo-guest', name: 'Khách chưa cung cấp thông tin', email: '—', phone: '—', orderCount: 12, status: 'Đang hoạt động', createdAt: '2026-11-03T17:15:20+07:00' },
]

const readStoredRecords = <T,>(key: string): T[] => {
  try {
    const value = JSON.parse(window.localStorage.getItem(key) ?? '[]')
    return Array.isArray(value) ? value as T[] : []
  } catch {
    return []
  }
}

const ensureStorefrontDemoData = () => {
  if (!window.localStorage.getItem(storefrontOrdersKey)) writeStoredRecords(storefrontOrdersKey, demoOrders)
  if (!window.localStorage.getItem(storefrontCustomersKey)) writeStoredRecords(storefrontCustomersKey, demoCustomers)
}

const writeStoredRecords = <T,>(key: string, records: T[]) => {
  window.localStorage.setItem(key, JSON.stringify(records))
  window.dispatchEvent(new CustomEvent('linery-storefront-data-changed'))
}

const upsertStorefrontCustomer = (input: { name: string; email: string; phone?: string }) => {
  const customers = readStoredRecords<StorefrontCustomerRecord>(storefrontCustomersKey)
  const email = input.email.trim().toLowerCase()
  const existing = customers.find((customer) => customer.email.toLowerCase() === email)
  if (existing) {
    const next = customers.map((customer) => customer.id === existing.id ? { ...customer, name: input.name.trim() || customer.name, phone: input.phone?.trim() || customer.phone } : customer)
    writeStoredRecords(storefrontCustomersKey, next)
    return existing
  }
  const customer: StorefrontCustomerRecord = { id: `customer-${Date.now()}`, name: input.name.trim() || 'Khách hàng', email, phone: input.phone?.trim() || '—', orderCount: 0, status: 'Đang hoạt động', createdAt: new Date().toISOString() }
  writeStoredRecords(storefrontCustomersKey, [customer, ...customers])
  return customer
}

const addStorefrontOrder = (input: { name: string; email: string; phone: string; total: number }) => {
  const customer = upsertStorefrontCustomer(input)
  const customers = readStoredRecords<StorefrontCustomerRecord>(storefrontCustomersKey).map((item) => item.id === customer.id ? { ...item, orderCount: item.orderCount + 1 } : item)
  writeStoredRecords(storefrontCustomersKey, customers)
  const order: StorefrontOrderRecord = { id: `LINERY-${Date.now().toString().slice(-8)}`, customerId: customer.id, customerName: customer.name, channel: 'Website', total: input.total, status: 'Chờ xác nhận', createdAt: new Date().toISOString() }
  writeStoredRecords(storefrontOrdersKey, [order, ...readStoredRecords<StorefrontOrderRecord>(storefrontOrdersKey)])
}

function CartItemRow({ item, onRemove, onChangeQuantity }: { item: CartItem; onRemove: () => void; onChangeQuantity: (delta: number) => void }) {
  return <article className="cart-item-row">
    <img className="cart-item-image" src={item.product.image || BOOK_COVER_FALLBACK} alt={`Bìa sách ${item.product.title}`} loading="lazy" decoding="async" onError={handleBookCoverError} />
    <div className="cart-item-copy">
      <h2>{item.product.title}</h2>
      <p>{item.product.author}</p>
      <div className="cart-item-bottom">
        <div className="cart-quantity" aria-label={`Quantity for ${item.product.title}`}>
          <button type="button" aria-label={`Decrease quantity of ${item.product.title}`} onClick={() => onChangeQuantity(-1)}>−</button>
          <span>{item.quantity}</span>
          <button type="button" aria-label={`Increase quantity of ${item.product.title}`} onClick={() => onChangeQuantity(1)}>+</button>
        </div>
        <p className="cart-item-price">{formatPrice(getPriceValue(item.product.price) * item.quantity)}</p>
      </div>
    </div>
    <button className="cart-item-remove" type="button" aria-label={`Remove ${item.product.title} from cart`} onClick={onRemove}><i className="bi bi-trash3" aria-hidden="true" /></button>
  </article>
}

function CartPage({ onHome, onCheckout, items, onRemove, onChangeQuantity }: { onHome: () => void; onCheckout: () => void; items: CartItem[]; onRemove: (key: string) => void; onChangeQuantity: (key: string, delta: number) => void }) {
  const subtotal = items.reduce((sum, item) => sum + getPriceValue(item.product.price) * item.quantity, 0)
  if (items.length > 0) return <main className="cart-page"><div className="cart-layout"><section className="cart-filled-card" aria-labelledby="cart-title"><div className="cart-filled-header"><h1 id="cart-title">My Cart</h1><button className="cart-continue-link" type="button" onClick={onHome}>Continue shopping</button></div><div className="cart-filled-items">{items.map((item) => <CartItemRow key={productKey(item.product)} item={item} onRemove={() => onRemove(productKey(item.product))} onChangeQuantity={(delta) => onChangeQuantity(productKey(item.product), delta)} />)}</div></section><aside className="cart-summary-panel" aria-labelledby="order-summary-title"><h2 id="order-summary-title">Order Summary</h2><div className="cart-summary-line"><span>Subtotal</span><strong>{formatPrice(subtotal)}</strong></div><div className="cart-summary-line"><span>Delivery fee</span><strong>Free</strong></div><div className="cart-summary-total"><span>Total</span><strong>{formatPrice(subtotal)}</strong></div><button className="cart-primary-action" type="button" onClick={onCheckout}>CHECKOUT NOW</button></aside></div></main>
  return <main className="cart-page">
    <section className="cart-empty-card" aria-labelledby="cart-empty-title">
        <i className="bi bi-bag cart-empty-icon" aria-hidden="true" />
      <h1 id="cart-empty-title">Your cart is empty</h1>
      <p className="cart-empty-message">There are no products in your cart.</p>
      <a className="cart-empty-action" href="/#home" onClick={(event) => { event.preventDefault(); onHome() }}>Continue shopping</a>
    </section>
  </main>
}

function BankTransferPayment({ subtotal, onConfirm, onHome, onBackToCart }: { subtotal: number; onConfirm: () => void; onHome: () => void; onBackToCart: () => void }) {
  const [secondsRemaining, setSecondsRemaining] = useState(300)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  useEffect(() => {
    if (secondsRemaining <= 0) return undefined
    const timer = window.setInterval(() => setSecondsRemaining((seconds) => Math.max(0, seconds - 1)), 1000)
    return () => window.clearInterval(timer)
  }, [secondsRemaining])
  const copyValue = async (field: string, value: string) => {
    await navigator.clipboard.writeText(value)
    setCopiedField(field)
    window.setTimeout(() => setCopiedField((current) => current === field ? null : current), 1600)
  }
  const CopyButton = ({ field, value }: { field: string; value: string }) => <button className="checkout-copy-button" type="button" aria-label={`Copy ${field}`} onClick={() => copyValue(field, value)}><i className={`bi bi-${copiedField === field ? 'check2' : 'clipboard'}`} aria-hidden="true" /></button>
  const isExpired = secondsRemaining === 0
  const minutes = String(Math.floor(secondsRemaining / 60)).padStart(2, '0')
  const seconds = String(secondsRemaining % 60).padStart(2, '0')
  return <main className="checkout-page">
    <div className="checkout-bank-layout">
      <section className="checkout-bank-information" aria-labelledby="bank-transfer-title">
        <p className="checkout-kicker">Payment instructions</p>
        <h1 id="bank-transfer-title">Bank transfer information</h1>
        <div className="checkout-bank-qr-row">
          <img src="/assets/bank-transfer-qr.svg" alt="QR code for Linery bank transfer" />
          <div><strong>Scan to pay by QR code</strong><span>Use your banking app to scan the QR code, or transfer manually using the details below.</span><div className={`checkout-bank-countdown ${isExpired ? 'is-expired' : ''}`}><span className="checkout-countdown-progress" aria-label={isExpired ? 'Payment time expired' : `${minutes} minutes ${seconds} seconds remaining`}><span>{isExpired ? '00:00' : `${minutes}:${seconds}`}</span></span><span className="checkout-countdown-copy">{isExpired ? 'Please return to your cart and try the payment again.' : 'Your order will be held for 5 minutes. If payment is not received, please return to your cart and try again.'}</span></div></div>
        </div>
        <div className="checkout-bank-reference"><strong>Transfer content</strong><div className="checkout-copy-field"><code>940347</code><CopyButton field="transfer content" value="940347" /></div><span>Please include this transfer content exactly so we can match your payment.</span></div>
        <dl className="checkout-bank-details"><div><dt>Bank</dt><dd><span>Ngân hàng TMCP Đầu tư và Phát triển Việt Nam (BIDV)</span><img src="/assets/bidv-logo.svg" alt="BIDV" /></dd></div><div><dt>Branch</dt><dd><span>CN Demo</span><CopyButton field="branch" value="CN Demo" /></dd></div><div><dt>Account number</dt><dd><span>120 6161 626</span><CopyButton field="account number" value="120 6161 626" /></dd></div><div><dt>Account holder</dt><dd><span>Linery Books</span><CopyButton field="account holder" value="Linery Books" /></dd></div></dl>
      </section>
      <aside className="checkout-bank-summary" aria-label="Order payment summary">
        <div className="checkout-bank-summary-line"><span>Order code</span><strong>#LINERY-ORDER</strong></div>
        <div className="checkout-bank-summary-line"><span>Subtotal</span><strong>{formatPrice(subtotal)}</strong></div>
        <div className="checkout-bank-summary-line"><span>Discount</span><strong>−0₫</strong></div>
        <div className="checkout-bank-summary-total"><span>Total</span><strong>{formatPrice(subtotal)}</strong></div>
        <p className="checkout-bank-summary-note">By confirming, you agree to the Linery Bookstore order terms.</p>
        <button className="checkout-submit checkout-bank-confirm" type="button" onClick={onConfirm} disabled={isExpired}>I HAVE COMPLETED PAYMENT</button>
        <button className="checkout-bank-back" type="button" onClick={isExpired ? onBackToCart : onHome}>{isExpired ? 'RETURN TO CART' : 'Back to shopping'}</button>
      </aside>
    </div>
  </main>
}

function CheckoutPage({ items, onHome, onBackToCart, onCreateOrder }: { items: CartItem[]; onHome: () => void; onBackToCart: () => void; onCreateOrder: (input: { fulfillmentMethod: FulfillmentMethod; paymentMethod: PaymentMethod; shippingAddress: Record<string, string>; deliveryNotes: string; guestEmail: string; promotionCode?: string }) => Promise<void> }) {
  const [submitted, setSubmitted] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'paid'>('pending')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('vnpay')
  const [fulfillmentMethod, setFulfillmentMethod] = useState<FulfillmentMethod>('delivery')
  const [voucherCode, setVoucherCode] = useState('')
  const [stores, setStores] = useState<PublicStoreLocation[]>([])
  const [deliveryZones, setDeliveryZones] = useState<PublicDeliveryZone[]>([])
  const [locationError, setLocationError] = useState('')
  const [city, setCity] = useState('')
  const subtotal = items.reduce((sum, item) => sum + getPriceValue(item.product.price) * item.quantity, 0)
  const selectedZone = deliveryZones.find((zone) => zone.name.trim().toLocaleLowerCase() === city.trim().toLocaleLowerCase())
  const deliveryFee = fulfillmentMethod === 'delivery' ? (selectedZone?.feeVnd ?? 0) : 0

  useEffect(() => {
    let mounted = true
    void Promise.all([loadPublicStoreLocations(), loadPublicDeliveryZones()]).then(([nextStores, nextZones]) => {
      if (!mounted) return
      setStores(nextStores)
      setDeliveryZones(nextZones)
      setLocationError('')
    }).catch((reason: unknown) => {
      if (mounted) setLocationError(reason instanceof Error ? reason.message : 'Không tải được địa điểm giao nhận từ Supabase.')
    })
    return () => { mounted = false }
  }, [])

  const handleCheckoutSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    try {
      await onCreateOrder({
        fulfillmentMethod,
        paymentMethod,
        guestEmail: String(data.get('email') ?? ''),
        deliveryNotes: String(data.get('deliveryNotes') ?? ''),
        shippingAddress: { name: String(data.get('name') ?? ''), email: String(data.get('email') ?? ''), phone: String(data.get('phone') ?? ''), address: String(data.get('address') ?? ''), city: city.trim(), postalCode: String(data.get('postalCode') ?? '') },
        promotionCode: voucherCode.trim() || undefined,
      })
      setSubmitted(true)
    } catch (error) {
      emitFloatingNotice('error', error instanceof Error ? error.message : 'Không thể tạo đơn hàng.')
    }
  }

  if (submitted && paymentMethod === 'bank' && paymentStatus === 'pending') return <BankTransferPayment subtotal={subtotal} onConfirm={() => setPaymentStatus('paid')} onHome={onHome} onBackToCart={onBackToCart} />
  if (submitted) return <main className="checkout-page"><section className="checkout-success-card" aria-labelledby="checkout-success-title"><i className={`bi ${paymentStatus === 'paid' ? 'bi-check2' : 'bi-clock'}`} aria-hidden="true" /><p className="checkout-kicker">Order received</p><h1 id="checkout-success-title">Thank you for your order.</h1><div className={`checkout-payment-status checkout-payment-status-${paymentStatus}`}><strong>{paymentStatus === 'paid' ? 'Payment confirmed' : 'Payment pending'}</strong><span>{paymentStatus === 'paid' ? 'Your payment has been recorded successfully.' : 'Your order is recorded. Complete payment to update the status.'}</span></div>{paymentStatus === 'pending' && <><div className="checkout-payment-instructions"><strong>{paymentMethod === 'vnpay' ? 'VNPay - Wallet' : paymentMethod === 'bank' ? 'Bank transfer' : paymentMethod === 'momo' ? 'MoMo wallet' : paymentMethod === 'apple' ? 'Apple Pay' : 'ZaloPay'}</strong><span>{paymentMethod === 'vnpay' ? 'Continue in VNPay wallet to complete the payment.' : paymentMethod === 'momo' ? 'Continue in MoMo wallet to complete the payment.' : paymentMethod === 'apple' ? 'Continue in Apple Pay to complete the payment.' : 'Continue in ZaloPay to complete the payment.'}</span>{paymentMethod === 'momo' && <div className="checkout-momo-panel" aria-label="MoMo wallet payment"><img src="/assets/payment-momo.svg" alt="MoMo" /><small>MoMo wallet</small></div>}</div><button className="checkout-submit checkout-confirm-payment" type="button" onClick={() => setPaymentStatus('paid')}>I HAVE COMPLETED PAYMENT</button></>}<button className="cart-primary-action" type="button" onClick={onHome}>CONTINUE SHOPPING</button></section></main>
  if (items.length === 0) return <main className="cart-page"><section className="cart-empty-card" aria-labelledby="checkout-empty-title"><i className="bi bi-bag cart-empty-icon" aria-hidden="true" /><h1 id="checkout-empty-title">Your cart is empty</h1><p className="cart-empty-message">There are no products in your cart.</p><a className="cart-empty-action" href="/#home" onClick={(event) => { event.preventDefault(); onHome() }}>Continue shopping</a></section></main>

  return <main className="checkout-page">
    <div className="checkout-header"><button className="checkout-back" type="button" onClick={onBackToCart}><i className="bi bi-arrow-left" aria-hidden="true" /> Back to cart</button><p>LINERY CHECKOUT</p></div>
    <div className="checkout-layout">
      <section className="checkout-form-card" aria-labelledby="checkout-title">
        <p className="checkout-kicker">Complete your order</p>
        <h1 id="checkout-title">Checkout</h1>
        <form id="checkout-form" className="checkout-form" onSubmit={handleCheckoutSubmit}>
          <fieldset><legend>Contact information</legend><label>Full name<input name="name" type="text" placeholder="Your full name" autoComplete="name" required /></label><div className="checkout-field-grid"><label>Email address<input name="email" type="email" placeholder="you@example.com" autoComplete="email" required /></label><label>Phone number<input name="phone" type="tel" placeholder="Your phone number" autoComplete="tel" required /></label></div></fieldset>
          <fieldset><legend>Payment method</legend><div className="checkout-payment-options"><label className="checkout-payment-option"><input type="radio" name="payment" value="vnpay" checked={paymentMethod === 'vnpay'} onChange={() => setPaymentMethod('vnpay')} /><span><strong>VNPay - Wallet</strong><small>Pay with your VNPay wallet.</small></span><img className="checkout-payment-icon" src="/assets/payment-vnpay.png" alt="VNPay" /></label><label className="checkout-payment-option"><input type="radio" name="payment" value="momo" checked={paymentMethod === 'momo'} onChange={() => setPaymentMethod('momo')} /><span><strong>MoMo wallet</strong><small>Pay securely with your MoMo wallet.</small></span><img className="checkout-payment-icon checkout-payment-icon-momo" src="/assets/payment-momo.svg" alt="MoMo" /></label><label className="checkout-payment-option"><input type="radio" name="payment" value="apple" checked={paymentMethod === 'apple'} onChange={() => setPaymentMethod('apple')} /><span><strong>Apple Pay</strong><small>Pay quickly with Apple Pay.</small></span><img className="checkout-payment-icon checkout-payment-icon-apple" src="/assets/payment-apple-pay.png" alt="Apple Pay" /></label><label className="checkout-payment-option"><input type="radio" name="payment" value="zalopay" checked={paymentMethod === 'zalopay'} onChange={() => setPaymentMethod('zalopay')} /><span><strong>ZaloPay</strong><small>Pay securely with your ZaloPay wallet.</small></span><img className="checkout-payment-icon checkout-payment-icon-zalopay" src="/assets/payment-zalopay.png" alt="ZaloPay" /></label><label className="checkout-payment-option checkout-payment-option-bank"><input type="radio" name="payment" value="bank" checked={paymentMethod === 'bank'} onChange={() => setPaymentMethod('bank')} /><span><strong>Bank transfer</strong><small>Complete the transfer using Linery payment details.</small></span><img className="checkout-payment-icon" src="/assets/payment-bank.png" alt="Bank transfer" /></label></div></fieldset>
          <fieldset><legend>Receiving method</legend><div className="checkout-method-tabs" role="tablist" aria-label="Receiving method"><button className={fulfillmentMethod === 'pickup' ? 'is-active' : ''} type="button" role="tab" aria-selected={fulfillmentMethod === 'pickup'} onClick={() => setFulfillmentMethod('pickup')}><i className={`bi ${fulfillmentMethod === 'pickup' ? 'bi-check-circle-fill' : 'bi-circle'}`} aria-hidden="true" />Pickup at counter</button><button className={fulfillmentMethod === 'delivery' ? 'is-active' : ''} type="button" role="tab" aria-selected={fulfillmentMethod === 'delivery'} onClick={() => setFulfillmentMethod('delivery')}><i className={`bi ${fulfillmentMethod === 'delivery' ? 'bi-check-circle-fill' : 'bi-circle'}`} aria-hidden="true" />Delivery</button></div>{fulfillmentMethod === 'pickup' ? <div className="checkout-tab-panel" role="tabpanel"><label className="checkout-select-field">Choose a store<select name="pickupStore" defaultValue="" required><option value="" disabled>Select a store</option>{stores.map((store) => <option value={store.id} key={store.id}>{store.name}{store.address ? `: ${store.address}` : ''}{store.city ? `, ${store.city}` : ''}</option>)}</select></label>{locationError && <p className="checkout-inline-error" role="alert">{locationError}</p>}{!locationError && stores.length === 0 && <p className="checkout-inline-note">No active pickup locations are available.</p>}</div> : <div className="checkout-tab-panel checkout-delivery-fields" role="tabpanel"><label>Delivery address<input name="address" type="text" placeholder="House number and street" autoComplete="street-address" required /></label><div className="checkout-field-grid"><label>City<input name="city" type="text" placeholder="City" autoComplete="address-level2" value={city} onChange={(event) => setCity(event.target.value)} required /></label><label>Postal code<input name="postalCode" type="text" placeholder="Postal code" autoComplete="postal-code" /></label></div><label>Delivery notes<textarea name="deliveryNotes" placeholder="Add instructions for delivery" rows={3} /></label>{city.trim() && !selectedZone && <p className="checkout-inline-note">Delivery fee will be confirmed when your city is matched to an active delivery zone.</p>}</div>}</fieldset>
        </form>
      </section>
      <aside className="checkout-summary" aria-labelledby="checkout-summary-title"><p className="checkout-kicker">Your order</p><h2 id="checkout-summary-title">Order summary</h2><div className="checkout-summary-items">{items.map((item) => <div className="checkout-summary-item" key={productKey(item.product)}><img src={item.product.image || BOOK_COVER_FALLBACK} alt={`Bìa sách ${item.product.title}`} loading="lazy" decoding="async" onError={handleBookCoverError} /><div><strong>{item.product.title}</strong><span>Qty {item.quantity}</span></div><b>{formatPrice(getPriceValue(item.product.price) * item.quantity)}</b></div>)}</div><form className="checkout-voucher" onSubmit={(event) => event.preventDefault()}><label htmlFor="voucher-code">Voucher / discount code</label><div className="checkout-voucher-row"><div className="checkout-voucher-input"><i className="bi bi-ticket-perforated" aria-hidden="true" /><input id="voucher-code" name="voucherCode" type="text" value={voucherCode} onChange={(event) => setVoucherCode(event.target.value)} placeholder="Enter your code" autoComplete="off" /></div><button type="submit">Apply</button></div></form><div className="cart-summary-line"><span>Subtotal</span><strong>{formatPrice(subtotal)}</strong></div><div className="cart-summary-line"><span>Delivery fee</span><strong>{deliveryFee > 0 ? formatPrice(deliveryFee) : 'Free'}</strong></div><div className="cart-summary-total"><span>Total</span><strong>{formatPrice(subtotal + deliveryFee)}</strong></div><button className="checkout-submit checkout-summary-submit" type="submit" form="checkout-form">CONTINUE TO PAYMENT</button></aside>
    </div>
  </main>
}

function AccountPage({ onHome, onLogout, activeTab, onTabChange }: { onHome: () => void; onLogout: () => void; activeTab: AccountTab; onTabChange: (tab: AccountTab) => void }) {
  const setActiveTab = onTabChange
  const [saved, setSaved] = useState(false)
  const [orders, setOrders] = useState<AccountOrderRow[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [ordersError, setOrdersError] = useState('')
  const [profile, setProfile] = useState<AccountProfileRow | null>(null)
  const [transactions, setTransactions] = useState<AccountTransactionRow[]>([])
  const [accountDataLoading, setAccountDataLoading] = useState(true)
  const [accountDataError, setAccountDataError] = useState('')

  useEffect(() => {
    let mounted = true
    void Promise.all([loadMyProfile(), loadMyTransactions()]).then(([nextProfile, nextTransactions]) => { if (mounted) { setProfile(nextProfile); setTransactions(nextTransactions) } }).catch((reason) => { if (mounted) setAccountDataError(reason instanceof Error ? reason.message : 'Không tải được dữ liệu tài khoản.') }).finally(() => { if (mounted) setAccountDataLoading(false) })
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    if (activeTab !== 'orders') return
    let mounted = true
    setOrdersLoading(true)
    setOrdersError('')
    void loadMyOrders().then((nextOrders) => { if (mounted) setOrders(nextOrders) }).catch((reason) => { if (mounted) setOrdersError(reason instanceof Error ? reason.message : 'Không tải được lịch sử đơn hàng.') }).finally(() => { if (mounted) setOrdersLoading(false) })
    return () => { mounted = false }
  }, [activeTab])

  return <main className="account-page">
    <section className="account-card" aria-labelledby="account-title">
      <div className="account-heading"><div><p className="checkout-kicker">My account</p><h1 id="account-title">Welcome back, Linery reader</h1><p>Manage your personal details, orders and account security in one place.</p></div><button className="account-back" type="button" onClick={onHome}>Continue shopping</button><nav className="account-mobile-header-nav" aria-label="Account sections"><button className={activeTab === 'profile' ? 'is-active' : ''} type="button" onClick={() => setActiveTab('profile')}><i className="bi bi-person" aria-hidden="true" /><span>Profile</span></button><button className={activeTab === 'orders' ? 'is-active' : ''} type="button" onClick={() => setActiveTab('orders')}><i className="bi bi-bag" aria-hidden="true" /><span>Order history</span></button><button className={activeTab === 'transactions' ? 'is-active' : ''} type="button" onClick={() => setActiveTab('transactions')}><i className="bi bi-receipt" aria-hidden="true" /><span>Transaction history</span></button><button className={activeTab === 'security' ? 'is-active' : ''} type="button" onClick={() => setActiveTab('security')}><i className="bi bi-shield-lock" aria-hidden="true" /><span>Security</span></button><button className="account-mobile-header-logout" type="button" onClick={onLogout}><i className="bi bi-box-arrow-right" aria-hidden="true" /><span>Log out</span></button></nav></div>
      <div className="account-layout">
        <nav className="account-nav" aria-label="Account sections"><div className="account-nav-options">
          <button className={activeTab === 'profile' ? 'is-active' : ''} type="button" onClick={() => setActiveTab('profile')}><i className="bi bi-person" aria-hidden="true" />Profile</button>
          <button className={activeTab === 'orders' ? 'is-active' : ''} type="button" onClick={() => setActiveTab('orders')}><i className="bi bi-bag" aria-hidden="true" />Order history</button>
          <button className={activeTab === 'transactions' ? 'is-active' : ''} type="button" onClick={() => setActiveTab('transactions')}><i className="bi bi-receipt" aria-hidden="true" />Transaction history</button>
          <button className={activeTab === 'security' ? 'is-active' : ''} type="button" onClick={() => setActiveTab('security')}><i className="bi bi-shield-lock" aria-hidden="true" />Security</button>
          <button className="account-logout" type="button" onClick={onLogout}><i className="bi bi-box-arrow-right" aria-hidden="true" />Log out</button></div>
        </nav>
        <div className="account-content">
          {activeTab === 'profile' && <form key={profile?.id ?? 'profile'} className="account-form" onSubmit={(event) => { event.preventDefault(); const formData = new FormData(event.currentTarget); void saveMyProfile({ displayName: String(formData.get('name') ?? ''), phone: String(formData.get('phone') ?? '') }).then(() => { setProfile((current) => current ? { ...current, displayName: String(formData.get('name') ?? ''), phone: String(formData.get('phone') ?? '') } : current); setSaved(true) }).catch((reason) => setAccountDataError(reason instanceof Error ? reason.message : 'Không lưu được hồ sơ.')) }}><div className="account-section-heading"><h2>Personal information</h2><span>Keep your contact details up to date.</span></div>{accountDataError && <p className="account-message" role="alert">{accountDataError}</p>}<div className="account-field-grid"><label>Full name<input name="name" defaultValue={profile?.displayName ?? 'Linery Reader'} /></label><label>Email address<input name="email" type="email" defaultValue={profile?.email ?? ''} readOnly /></label><label>Phone number<input name="phone" type="tel" defaultValue={profile?.phone ?? ''} placeholder="Add your phone number" /></label><label>Preferred language<select name="language" defaultValue="en"><option value="en">English</option><option value="vi">Tiếng Việt</option></select></label></div><button className="account-primary" type="submit" disabled={accountDataLoading}>Save changes</button>{saved && <p className="account-message" role="status">Your account details have been saved.</p>}</form>}
          {activeTab === 'orders' && <div className="account-section"><div className="account-section-heading"><h2>Order history</h2><span>Track your recent Linery Books orders.</span></div>{ordersError && <p className="account-message" role="alert">{ordersError}</p>}{ordersLoading ? <div className="account-order-empty"><i className="bi bi-arrow-repeat" aria-hidden="true" /><strong>Loading orders…</strong><span>Your real order history is being loaded from Supabase.</span></div> : orders.length === 0 ? <div className="account-order-empty"><i className="bi bi-journal-bookmark" aria-hidden="true" /><strong>No orders yet</strong><span>Your completed orders will appear here.</span><button className="account-primary" type="button" onClick={onHome}>Browse books</button></div> : <div className="account-order-table-wrap"><table className="account-order-table"><thead><tr><th scope="col">Order code</th><th scope="col">Date</th><th scope="col">Status</th><th scope="col">Books</th><th scope="col">Total</th></tr></thead><tbody>{orders.map((order) => <tr key={order.id}><td>{order.orderNumber}</td><td>{order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : '—'}</td><td><span className={`account-order-status is-${order.status}`}>{order.status}</span></td><td>{order.itemCount} books</td><td>{formatPrice(order.totalVnd)}</td></tr>)}</tbody></table></div>}</div>}
          {activeTab === 'transactions' && <div className="account-section"><div className="account-section-heading"><h2>Transaction history</h2><span>Payment records only. Order details are kept in Order history.</span></div>{accountDataError && <p className="account-message" role="alert">{accountDataError}</p>}{accountDataLoading ? <div className="account-order-empty"><i className="bi bi-arrow-repeat" aria-hidden="true" /><strong>Loading transactions…</strong><span>Your real payment records are being loaded from Supabase.</span></div> : transactions.length === 0 ? <div className="account-order-empty"><i className="bi bi-receipt" aria-hidden="true" /><strong>No transactions yet</strong><span>Payment records will appear here after an order is created.</span></div> : <div className="account-transaction-table-wrap"><table className="account-transaction-table"><thead><tr><th scope="col">Order code</th><th scope="col">Date</th><th scope="col">Transaction ID</th><th scope="col">Payment method</th><th scope="col">Amount</th></tr></thead><tbody>{transactions.map((transaction) => <tr key={transaction.id}><td>{transaction.orderNumber || '—'}</td><td>{transaction.createdAt ? new Date(transaction.createdAt).toLocaleDateString('vi-VN') : '—'}</td><td>{transaction.providerTransactionId}</td><td>{transaction.provider}</td><td className="account-transaction-paid">{formatPrice(transaction.amountVnd)}</td></tr>)}</tbody></table></div>}</div>}
          {activeTab === 'security' && <form className="account-form" onSubmit={(event) => { event.preventDefault(); const form = new FormData(event.currentTarget); const currentPassword = String(form.get('currentPassword') ?? ''); const newPassword = String(form.get('newPassword') ?? ''); const confirmation = String(form.get('confirmation') ?? ''); if (newPassword !== confirmation) { setAccountDataError('Mật khẩu mới và phần xác nhận không trùng nhau.'); return } setAccountDataError(''); void updateMyPassword(currentPassword, newPassword).then(() => setSaved(true)).catch((reason) => setAccountDataError(reason instanceof Error ? reason.message : 'Không đổi được mật khẩu.')) }}><div className="account-section-heading"><h2>Password & security</h2><span>Update your password to keep your account protected.</span></div>{accountDataError && <p className="account-message" role="alert">{accountDataError}</p>}<label>Current password<input name="currentPassword" type="password" autoComplete="current-password" required /></label><label>New password<input name="newPassword" type="password" autoComplete="new-password" minLength={8} required /></label><label>Confirm new password<input name="confirmation" type="password" autoComplete="new-password" minLength={8} required /></label><button className="account-primary" type="submit">Update password</button>{saved && <p className="account-message" role="status">Your password has been updated.</p>}</form>}
        </div>
      </div>
    </section>
  </main>
}

function LoginPage({ onHome, onRegister, onForgotPassword, onLoginSuccess }: { onHome: () => void; onRegister: () => void; onForgotPassword: () => void; onLoginSuccess: (email: string, password: string) => Promise<void> }) {
  const [message, setMessage] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [activeSlide, setActiveSlide] = useState(0)

  useEffect(() => {
    const timer = window.setInterval(() => setActiveSlide((slide) => (slide + 1) % loginSlides.length), 3000)
    return () => window.clearInterval(timer)
  }, [])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    try {
      await onLoginSuccess(String(data.get('email') ?? ''), String(data.get('password') ?? ''))
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to sign in.')
    }
  }

  const handleSso = (provider: string) => {
    setMessage(`${provider} sign-in is ready for OAuth configuration.`)
  }

  return <main className="login-page">
    <div className="login-page-backdrop" aria-hidden="true" />
    <section className="login-layout" aria-label="Sign in">
      <div className={`login-visual login-slide-${activeSlide}`}>
        <button className="login-brand" type="button" onClick={onHome} aria-label="Back to home">LINERY BOOKSTORE</button>
        <div className="login-visual-copy">
          <p>{loginSlides[activeSlide].quote}</p>
          <span>Books selected with care for curious minds.</span>
          <div className="login-visual-dots" aria-label="Login background slides">
            {loginSlides.map((slide, index) => <button key={slide.image} type="button" className={index === activeSlide ? 'is-active' : ''} aria-label={`Show slide ${index + 1}`} aria-pressed={index === activeSlide} onClick={() => setActiveSlide(index)} />)}
          </div>
        </div>
      </div>
      <div className="login-card" aria-label="Log in">
        <button className="login-back" type="button" aria-label="Back to home" onClick={onHome}><i className="bi bi-arrow-left" aria-hidden="true" /></button>
        <div className="login-card-inner">
          <div className="login-signin-heading">
            <p className="login-welcome">Welcome Back</p>
            <p className="login-welcome-subtitle">Sign in to discover your next read.</p>
          </div>
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="login-field login-field-email">
              <label htmlFor="login-email">Email Address <span className="required-mark" aria-hidden="true">*</span></label>
              <input id="login-email" name="email" type="text" placeholder="Enter Email" autoComplete="username" required />
            </div>
            <div className="login-field login-field-password">
              <label htmlFor="login-password">Password <span className="required-mark" aria-hidden="true">*</span></label>
              <div className="login-password-field">
                <input id="login-password" name="password" type={showPassword ? 'text' : 'password'} placeholder="Enter Password" autoComplete="current-password" required />
                <button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((visible) => !visible)}><i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`} aria-hidden="true" /></button>
              </div>
            </div>
            <div className="login-options">
              <label className="login-remember"><input type="checkbox" name="remember" /> <span>Remember me</span></label>
              <a href="#forgot-password" onClick={(event) => { event.preventDefault(); onForgotPassword() }}>Forgot Password</a>
            </div>
            <button className="login-submit" type="submit">Sign in</button>
          </form>
          <p className="login-signup">Don’t have an account? <a href="#register" onClick={(event) => { event.preventDefault(); onRegister() }}>Sign Up here</a></p>
          <div className="login-divider"><span>Or Continue With Account</span></div>
          <div className="login-sso" aria-label="Single sign-on options">
            <button type="button" aria-label="Sign in with Facebook" onClick={() => handleSso('Facebook')}><i className="bi bi-facebook" aria-hidden="true" /></button>
            <button type="button" aria-label="Sign in with Google" onClick={() => handleSso('Google')}><i className="bi bi-google" aria-hidden="true" /></button>
            <button type="button" aria-label="Sign in with Apple" onClick={() => handleSso('Apple')}><i className="bi bi-apple" aria-hidden="true" /></button>
          </div>
          {message && <p className="login-message" role="status">{message}</p>}
        </div>
      </div>
    </section>
  </main>
}

const adminRoutePermissions: Array<[string, string]> = [
  ['/admin/settings/admin-users', 'admin_users.manage'],
  ['/admin/settings/permissions', 'admin_users.manage'],
  ['/admin/books/categories/new', 'taxonomy.manage'],
  ['/admin/books/categories', 'taxonomy.manage'],
  ['/admin/books/new', 'books.create'],
  ['/admin/books/report/', 'books.view'],
  ['/admin/books', 'books.view'],
  ['/admin/import-history', 'imports.manage'],
  ['/admin/collections', 'homepage.manage'],
  ['/admin/orders', 'orders.manage'],
  ['/admin/reports', 'reports.view'],
  ['/admin/customers', 'customers.view'],
  ['/admin/stores', 'locations.manage'],
  ['/admin/locations', 'locations.manage'],
  ['/admin/inventory', 'inventory.manage'],
  ['/admin/promotions', 'promotions.manage'],
  ['/admin/authors', 'authors.manage'],
  ['/admin/publishers', 'taxonomy.manage'],
  ['/admin/news', 'news.manage'],
  ['/admin/reviews', 'reviews.moderate'],
  ['/admin/media', 'media.manage'],
  ['/admin/menus', 'website.manage'],
  ['/admin/website', 'website.manage'],
  ['/admin/locations', 'locations.manage'],
  ['/admin/payments', 'payments.manage'],
  ['/admin/chatbot', 'chatbot.manage'],
  ['/admin/settings/site-data', 'website.manage'],
  ['/admin/settings', 'website.manage'],
  ['/admin', 'dashboard.view'],
]
const getAdminPermissionForPath = (pathname: string) => adminRoutePermissions.find(([prefix]) => pathname === prefix || pathname.startsWith(prefix))?.[1]

function AdminAuthGate({ children, requiredPermission }: { children: ReactNode; requiredPermission?: string }) {
  const [checking, setChecking] = useState(true)
  const [allowed, setAllowed] = useState(false)
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [access, setAccess] = useState<AdminAccess | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const checkAccess = async () => {
    setChecking(true)
    const result = await checkRemoteAdminAccess()
    setAccess(result.access ?? null)
    const hasPermission = !requiredPermission || Boolean(result.access?.permissions.includes(requiredPermission))
    setAllowed(result.allowed && hasPermission)
    setEmail(result.email ?? '')
    setMessage(result.error ?? (result.allowed && !hasPermission ? `Vai trò ${result.access?.roleName ?? 'hiện tại'} chưa được cấp quyền này.` : ''))
    setChecking(false)
  }

  useEffect(() => {
    void checkAccess()
    if (!supabase) return undefined
    const { data: listener } = supabase.auth.onAuthStateChange(() => { void checkAccess() })
    return () => listener.subscription.unsubscribe()
  }, [])

  const signIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!supabase) {
      setMessage('Supabase chưa được cấu hình cho môi trường này.')
      return
    }
    const data = new FormData(event.currentTarget)
    setSubmitting(true)
    setMessage('')
    const { error } = await supabase.auth.signInWithPassword({ email: String(data.get('email') ?? '').trim(), password: String(data.get('password') ?? '') })
    if (error) setMessage(error.message)
    else await checkAccess()
    setSubmitting(false)
  }

  if (checking) return <main className="min-h-screen bg-[#f7f7f2] px-5 py-16 text-[var(--color-ink)]"><section className="mx-auto max-w-lg rounded-2xl border border-[#e6e2d7] bg-white p-8 text-center shadow-[0_10px_30px_rgba(31,42,36,.04)]"><p className="font-body text-sm text-[#74776f]">Đang kiểm tra quyền quản trị…</p></section></main>
  if (allowed) return <>{children}</>

  return <main className="min-h-screen bg-[#f7f7f2] px-5 py-16 text-[var(--color-ink)]"><section className="mx-auto max-w-lg rounded-2xl border border-[#e6e2d7] bg-white p-6 shadow-[0_10px_30px_rgba(31,42,36,.04)] sm:p-8"><div className="mb-8"><p className="font-body text-xs font-semibold uppercase tracking-[.14em] text-[var(--color-olive)]">LINERY QUẢN TRỊ</p><h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">{access && email ? 'Không đủ quyền truy cập' : 'Đăng nhập quản trị'}</h1><p className="mt-2 font-body text-sm leading-6 text-[#74776f]">{access && email ? `Tài khoản ${email} đang là ${access.roleName}. Hãy liên hệ Super Admin để được cấp thêm nghiệp vụ.` : 'Chỉ tài khoản đã được cấp trong bảng admin_users mới có thể mở khu vực này.'}</p></div>{!access && <form className="grid gap-4" onSubmit={signIn}><label className="grid gap-1.5 font-body text-sm font-medium">Email<input className="min-h-11 rounded-xl border border-[#dedbd0] bg-[#fcfbf7] px-3.5 font-body text-sm" name="email" type="email" autoComplete="username" required /></label><label className="grid gap-1.5 font-body text-sm font-medium">Mật khẩu<input className="min-h-11 rounded-xl border border-[#dedbd0] bg-[#fcfbf7] px-3.5 font-body text-sm" name="password" type="password" autoComplete="current-password" required /></label><button className="admin-primary-action inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--color-olive)] px-5 font-body text-sm font-medium text-white disabled:cursor-wait disabled:opacity-60" type="submit" disabled={submitting}>{submitting ? 'Đang xác thực…' : 'Đăng nhập quản trị'}</button></form>}{!access && <a className="mt-4 inline-flex font-body text-sm text-[var(--color-olive-dark)] underline-offset-4 hover:underline" href="/#forgot-password">Quên mật khẩu?</a>}{email && <p className="mt-4 font-body text-xs text-[#74776f]">Tài khoản hiện tại: {email}</p>}{message && <p className="mt-4 rounded-xl bg-[#fff4ec] px-4 py-3 font-body text-sm leading-6 text-[#9a4c2d]" role="alert">{message}</p>}<a className="mt-6 inline-flex font-body text-sm text-[var(--color-olive-dark)] underline-offset-4 hover:underline" href="/#home">← Quay lại website</a></section></main>
}

type RecoveryMode = 'forgot-password' | 'password-reset-sent' | 'reset-password' | 'password-reset-complete'

function PasswordRecoveryPage({ mode, onHome, onLogin, onEmailSent, onComplete }: { mode: RecoveryMode; onHome: () => void; onLogin: () => void; onEmailSent: (email: string) => Promise<void>; onComplete: (password: string) => Promise<void> }) {
  const [activeSlide, setActiveSlide] = useState(0)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const timer = window.setInterval(() => setActiveSlide((slide) => (slide + 1) % loginSlides.length), 3000)
    return () => window.clearInterval(timer)
  }, [])

  const isForgotForm = mode === 'forgot-password'
  const isSent = mode === 'password-reset-sent'
  const isResetForm = mode === 'reset-password'
  const isComplete = mode === 'password-reset-complete'
  const heading = isForgotForm ? 'Forgot password?' : isSent ? 'Email sent successfully' : isResetForm ? 'Create a new password' : 'Password updated'
  const intro = isForgotForm ? 'Enter your email and we’ll send you a link to reset your password.' : isSent ? 'Please check your email to create a new password.' : isResetForm ? 'Choose a strong password to keep your Linery account secure.' : 'Your new password has been created successfully.'

  return <main className="login-page recovery-page">
    <div className="login-page-backdrop" aria-hidden="true" />
    <section className="login-layout" aria-label="Password recovery">
      <div className={`login-visual login-slide-${activeSlide}`}>
        <button className="login-brand" type="button" onClick={onHome} aria-label="Back to home">LINERY BOOKSTORE</button>
        <div className="login-visual-copy"><p>{loginSlides[activeSlide].quote}</p><span>Books selected with care for curious minds.</span><div className="login-visual-dots" aria-label="Password recovery background slides">{loginSlides.map((slide, index) => <button key={slide.image} type="button" className={index === activeSlide ? 'is-active' : ''} aria-label={`Show slide ${index + 1}`} aria-pressed={index === activeSlide} onClick={() => setActiveSlide(index)} />)}</div></div>
      </div>
      <div className="login-card recovery-card" aria-labelledby="recovery-title">
        <button className="login-back" type="button" aria-label="Back to sign in" onClick={onLogin}><i className="bi bi-arrow-left" aria-hidden="true" /></button>
        <div className="login-card-inner">
          <h1 id="recovery-title">{heading}</h1>
          <p className="login-intro">{intro}</p>
          {isForgotForm && <form className="login-form" onSubmit={async (event) => { event.preventDefault(); setSubmitting(true); setMessage(''); try { const data = new FormData(event.currentTarget); await onEmailSent(String(data.get('email') ?? '').trim()) } catch (error) { setMessage(error instanceof Error ? error.message : 'Không gửi được email đặt lại mật khẩu.') } finally { setSubmitting(false) } }}><label htmlFor="recovery-email">Email Address <span className="required-mark" aria-hidden="true">*</span></label><input id="recovery-email" name="email" type="email" placeholder="Enter Email" autoComplete="email" required /><button className="login-submit" type="submit" disabled={submitting}>{submitting ? 'SENDING…' : 'SEND RESET LINK'}</button></form>}
          {isSent && <div className="recovery-status-card" role="status"><i className="bi bi-envelope-check" aria-hidden="true" /><strong>Reset email sent</strong><span>We’ve sent a real password recovery email. Open it in your inbox, then choose a new password.</span></div>}
          {isResetForm && <form className="login-form" onSubmit={async (event) => { event.preventDefault(); const data = new FormData(event.currentTarget); const password = String(data.get('password') ?? ''); const confirmation = String(data.get('confirmPassword') ?? ''); if (password !== confirmation) { setMessage('Mật khẩu xác nhận không trùng nhau.'); return } setSubmitting(true); setMessage(''); try { await onComplete(password) } catch (error) { setMessage(error instanceof Error ? error.message : 'Không cập nhật được mật khẩu.') } finally { setSubmitting(false) } }}><label htmlFor="new-password">New Password <span className="required-mark" aria-hidden="true">*</span></label><div className="login-password-field"><input id="new-password" name="password" type={showPassword ? 'text' : 'password'} placeholder="Enter new password" autoComplete="new-password" minLength={8} required /><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((visible) => !visible)}><i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`} aria-hidden="true" /></button></div><label htmlFor="confirm-new-password">Confirm Password <span className="required-mark" aria-hidden="true">*</span></label><div className="login-password-field"><input id="confirm-new-password" name="confirmPassword" type={showConfirmation ? 'text' : 'password'} placeholder="Confirm new password" autoComplete="new-password" minLength={8} required /><button type="button" aria-label={showConfirmation ? 'Hide confirmation password' : 'Show confirmation password'} onClick={() => setShowConfirmation((visible) => !visible)}><i className={`bi ${showConfirmation ? 'bi-eye-slash' : 'bi-eye'}`} aria-hidden="true" /></button></div><button className="login-submit" type="submit" disabled={submitting}>{submitting ? 'SAVING…' : 'SAVE NEW PASSWORD'}</button></form>}
          {isComplete && <div className="recovery-status-card recovery-complete-card" role="status"><i className="bi bi-check2-circle" aria-hidden="true" /><strong>Password changed</strong><span>You can now sign in with your new password and continue discovering your next read.</span><button className="login-submit" type="button" onClick={onLogin}>BACK TO SIGN IN</button></div>}
          {message && <p className="login-message" role="alert">{message}</p>}
          {!isComplete && <p className="recovery-back-link"><button type="button" onClick={onLogin}>Back to sign in</button></p>}
        </div>
      </div>
    </section>
  </main>
}

function RegisterPage({ onHome, onLogin, onRegisterSuccess, language }: { onHome: () => void; onLogin: () => void; onRegisterSuccess: (email: string, password: string, username: string) => Promise<void>; language: 'en' | 'vi' }) {
  const [message, setMessage] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [activeSlide, setActiveSlide] = useState(0)

  useEffect(() => {
    const timer = window.setInterval(() => setActiveSlide((slide) => (slide + 1) % loginSlides.length), 3000)
    return () => window.clearInterval(timer)
  }, [])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const password = String(data.get('password') ?? '')
    const confirmation = String(data.get('confirmPassword') ?? '')
    if (password !== confirmation) { setMessage('Passwords do not match.'); return }
    try {
      await onRegisterSuccess(String(data.get('email') ?? ''), password, String(data.get('username') ?? ''))
      setMessage('Account created. Check your email if confirmation is required.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to create account.')
    }
  }

  const handleSso = (provider: string) => {
    setMessage(`${provider} sign-up is ready for OAuth configuration.`)
  }

  return <main className="login-page register-page">
    <div className="login-page-backdrop" aria-hidden="true" />
    <section className="login-layout" aria-label="Create account">
      <div className={`login-visual login-slide-${activeSlide}`}>
        <button className="login-brand" type="button" onClick={onHome} aria-label="Back to home">LINERY BOOKSTORE</button>
        <div className="login-visual-copy">
          <p>{loginSlides[activeSlide].quote}</p>
          <span>Books selected with care for curious minds.</span>
          <div className="login-visual-dots" aria-label="Registration background slides">
            {loginSlides.map((slide, index) => <button key={slide.image} type="button" className={index === activeSlide ? 'is-active' : ''} aria-label={`Show slide ${index + 1}`} aria-pressed={index === activeSlide} onClick={() => setActiveSlide(index)} />)}
          </div>
        </div>
      </div>
      <div className="login-card register-card" aria-labelledby="register-title">
        <button className="login-back" type="button" aria-label="Back to home" onClick={onHome}><i className="bi bi-arrow-left" aria-hidden="true" /></button>
        <div className="login-card-inner">
          <h1 id="register-title">Create account</h1>
          <p className="login-intro">Create your account to save books and manage your orders.</p>
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="login-field login-field-username">
              <label htmlFor="register-name">{language === 'vi' ? 'Tên đăng nhập' : 'Username'} <span className="required-mark" aria-hidden="true">*</span></label>
              <input id="register-name" name="username" type="text" placeholder={language === 'vi' ? 'Tên đăng nhập của bạn' : 'Enter Username'} autoComplete="username" required />
            </div>
            <div className="login-field login-field-email">
              <label htmlFor="register-email">Email Address <span className="required-mark" aria-hidden="true">*</span></label>
              <input id="register-email" name="email" type="email" placeholder="Enter Email" autoComplete="email" required />
            </div>
            <div className="login-field login-field-password">
              <label htmlFor="register-password">Password <span className="required-mark" aria-hidden="true">*</span></label>
              <div className="login-password-field">
                <input id="register-password" name="password" type={showPassword ? 'text' : 'password'} placeholder="Enter Password" autoComplete="new-password" required />
                <button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((visible) => !visible)}><i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`} aria-hidden="true" /></button>
              </div>
            </div>
            <div className="login-field login-field-confirm">
              <label htmlFor="register-confirm-password">Confirm Password <span className="required-mark" aria-hidden="true">*</span></label>
              <div className="login-password-field">
                <input id="register-confirm-password" name="confirmPassword" type={showConfirmation ? 'text' : 'password'} placeholder="Enter Password" autoComplete="new-password" required />
                <button type="button" aria-label={showConfirmation ? 'Hide confirmation password' : 'Show confirmation password'} onClick={() => setShowConfirmation((visible) => !visible)}><i className={`bi ${showConfirmation ? 'bi-eye-slash' : 'bi-eye'}`} aria-hidden="true" /></button>
              </div>
            </div>
            <label className="login-remember register-consent"><input type="checkbox" name="terms" required /> <span>{language === 'vi' ? <>Tôi đồng ý với <a className="login-consent-link" href="#terms">các điều khoản</a> và <a className="login-consent-link" href="#privacy-policy">chính sách bảo mật</a></> : <>I agree to the <a className="login-consent-link" href="#terms">terms</a> and <a className="login-consent-link" href="#privacy-policy">privacy policy</a></>}</span></label>
            <button className="login-submit" type="submit">Create account</button>
          </form>
          <p className="login-signup">Already have an account? <a href="#login" onClick={(event) => { event.preventDefault(); onLogin() }}>Sign in</a></p>
          <div className="login-divider"><span>Or Continue With Account</span></div>
          <div className="login-sso" aria-label="Single sign-on options">
            <button type="button" aria-label="Sign up with Facebook" onClick={() => handleSso('Facebook')}><i className="bi bi-facebook" aria-hidden="true" /></button>
            <button type="button" aria-label="Sign up with Google" onClick={() => handleSso('Google')}><i className="bi bi-google" aria-hidden="true" /></button>
            <button type="button" aria-label="Sign up with Apple" onClick={() => handleSso('Apple')}><i className="bi bi-apple" aria-hidden="true" /></button>
          </div>
          {message && <p className="login-message" role="status">{message}</p>}
        </div>
      </div>
    </section>
  </main>
}

const normalizeAdminHeader = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
const adminHeaderMap = new Map(adminBookFields.flatMap((field) => [[normalizeAdminHeader(field.label), field.key], [normalizeAdminHeader(field.key), field.key]] as const))
const parseAdminNumber = (value: string) => {
  const cleaned = value.replace(/[^0-9.-]/g, '')
  if (!cleaned) return null
  const parsed = Number(cleaned)
  return Number.isFinite(parsed) ? parsed : null
}
const validateAdminBook = (values: Record<AdminBookKey, string>, row: number): ImportIssue[] => {
  const issues: ImportIssue[] = []
  adminBookFields.forEach((field) => {
    if (field.required && !String(values[field.key] ?? '').trim()) issues.push({ row, field: field.label, message: 'Đây là trường bắt buộc.' })
  })
  const quantity = parseAdminNumber(values.quantity)
  if (String(values.quantity).trim() && (quantity === null || quantity < 0 || !Number.isInteger(quantity))) issues.push({ row, field: 'Số lượng', message: 'Phải là số nguyên lớn hơn hoặc bằng 0.' })
  const salePrice = parseAdminNumber(values.salePrice)
  if (String(values.salePrice).trim() && (salePrice === null || salePrice < 0)) issues.push({ row, field: 'Giá bán', message: 'Phải là số lớn hơn hoặc bằng 0.' })
  const unitPrice = parseAdminNumber(values.unitPrice)
  if (String(values.unitPrice).trim() && (unitPrice === null || unitPrice < 0)) issues.push({ row, field: 'Đơn giá nhập', message: 'Phải là số lớn hơn hoặc bằng 0.' })
  if (String(values.link).trim() && !/^https?:\/\//i.test(values.link.trim())) issues.push({ row, field: 'Link nguồn', message: 'Phải bắt đầu bằng http:// hoặc https://.' })
  if (String(values.isbn).trim() && !/^\d{13}$/.test(values.isbn.trim())) issues.push({ row, field: 'ISBN', message: 'ISBN phải gồm đúng 13 chữ số.' })
  return issues
}
const toAdminBook = (values: Record<AdminBookKey, string>): AdminBook => ({ isbn: values.isbn.trim(), title: values.title.trim(), author: values.author.trim(), quantity: parseAdminNumber(values.quantity) ?? 0, unitPrice: parseAdminNumber(values.unitPrice), salePrice: parseAdminNumber(values.salePrice) ?? 0, link: values.link.trim(), format: values.format.trim(), line: values.line.trim(), category: values.category.trim() })
const downloadAdminWorkbook = async (report?: ImportReport) => {
  const { default: writeExcelFile } = await import('write-excel-file/browser')
  const headers = adminBookFields.map((field) => field.label)
  const instructionRows = [
    ['HƯỚNG DẪN NHẬP SÁCH', ''],
    ['Trường bắt buộc', 'Tác phẩm, Tác giả, Số lượng, Giá bán, Thể thức, Thể loại'],
    ['Trường không bắt buộc', 'ISBN, Đơn giá nhập, Link nguồn, Dòng sách'],
    ['Quy tắc', 'Số lượng là số nguyên >= 0; Giá bán và Đơn giá nhập là số >= 0; Link nguồn nếu có phải bắt đầu bằng http:// hoặc https://.'],
    ['Lưu ý', 'Không đổi tên cột trong sheet Sách. Mỗi dòng là một cuốn sách.'],
  ]
  const sheets: Array<{ data: ExcelCell[][]; sheet: string }> = [
    { data: [headers], sheet: 'Sách' },
    { data: instructionRows, sheet: 'Hướng dẫn' },
  ]
  if (report) {
    sheets.push({ data: [['Dòng Excel', 'Trường', 'Lỗi'], ...report.issues.map((issue) => [issue.row, issue.field, issue.message])], sheet: 'Báo cáo lỗi' })
  }
  await writeExcelFile(sheets).toFile(report ? 'linery-books-import-report.xlsx' : 'linery-books-template.xlsx')
}

type AdminLookupItem = { id: string; name: string; parentId: string | null; kind?: CategoryKind }
type TaxonomyKind = 'category' | 'topic' | 'format' | 'line' | 'genre' | 'publisher' | 'imprint' | 'language'
type AdminTaxonomyRecord = { id: string; name: string; parentId: string | null; kind: TaxonomyKind }
const adminTaxonomyStorageKey = 'linery-admin-taxonomy-v1'
const adminTaxonomyLabels: Record<TaxonomyKind, string> = { category: 'Danh mục', topic: 'Chủ đề', format: 'Thể thức', line: 'Dòng sách', genre: 'Thể loại', publisher: 'Publisher', imprint: 'Imprint', language: 'Ngôn ngữ' }
const adminTaxonomySeeds: Record<TaxonomyKind, string[]> = {
  category: ['Fiction', 'Novels', 'Short stories', 'Poetry & Drama', 'Non-fiction', 'Essays', 'Research & Studies', 'Memoir & Biography'],
  topic: ['Literary fiction', 'Politics', 'Philosophy', 'History', 'Art & Design', 'Culture', 'Biography'],
  format: ['Paperback', 'Hardcover', 'Digital', 'Audiobook'],
  line: ['Picador', 'Penguin UK', 'Penguin US', 'NYRB'],
  genre: ['Fiction', 'Novels', 'Short stories', 'Poetry & Drama', 'Non-fiction', 'Essays', 'Research & Studies', 'Memoir & Biography'],
  publisher: ['Penguin Books', 'Picador', 'New York Review Books', 'Linery Press'],
  imprint: ['Penguin Classics', 'Picador Classics', 'NYRB Classics', 'Linery Editions'],
  language: ['English', 'Vietnamese', 'French', 'German', 'Spanish'],
}
const readAdminTaxonomy = (): Record<TaxonomyKind, AdminTaxonomyRecord[]> => {
  const seeded = Object.fromEntries((Object.keys(adminTaxonomyLabels) as TaxonomyKind[]).map((kind) => [kind, adminTaxonomySeeds[kind].map((name) => ({ id: `${kind}-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`, name, parentId: null, kind }))])) as Record<TaxonomyKind, AdminTaxonomyRecord[]>
  if (typeof window === 'undefined') return seeded
  try {
    const stored = JSON.parse(window.localStorage.getItem(adminTaxonomyStorageKey) ?? 'null') as Partial<Record<TaxonomyKind, AdminTaxonomyRecord[]>> | null
    return { ...seeded, ...(stored ?? {}) }
  } catch { return seeded }
}
const writeAdminTaxonomy = (records: Record<TaxonomyKind, AdminTaxonomyRecord[]>) => { if (typeof window !== 'undefined') { window.localStorage.setItem(adminTaxonomyStorageKey, JSON.stringify(records)); window.dispatchEvent(new Event('linery-admin-taxonomy-changed')) } }
function useAdminTaxonomy(kind: TaxonomyKind) {
  const [records, setRecords] = useState<AdminTaxonomyRecord[]>(() => readAdminTaxonomy()[kind])
  useEffect(() => { const refresh = () => setRecords(readAdminTaxonomy()[kind]); window.addEventListener('linery-admin-taxonomy-changed', refresh); return () => window.removeEventListener('linery-admin-taxonomy-changed', refresh) }, [kind])
  return records
}

function AdminLookupPanel({ view }: { view: Exclude<BookManagementView, 'books'> }) {
  const isCategory = view === 'categories'
  const [items, setItems] = useState<AdminLookupItem[]>(isCategory
    ? [{ id: 'non-fiction', name: 'Non-fiction', parentId: null }, { id: 'essays', name: 'Essays', parentId: 'non-fiction' }, { id: 'literary-criticism', name: 'Literary Criticism', parentId: 'non-fiction' }, { id: 'philosophy', name: 'Philosophy', parentId: null }]
    : ['11 × 18 cm', '13 × 20 cm', '14 × 20.5 cm', '16 × 24 cm'].map((name) => ({ id: name, name, parentId: null })))
  const [newItem, setNewItem] = useState('')
  const [formatWidth, setFormatWidth] = useState('')
  const [formatHeight, setFormatHeight] = useState('')
  const [newParentId, setNewParentId] = useState<string | null>(null)
  const [sortAscending, setSortAscending] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [editingWidth, setEditingWidth] = useState('')
  const [editingHeight, setEditingHeight] = useState('')
  const [hiddenIds, setHiddenIds] = useState<string[]>([])
  const [pageSize, setPageSize] = useState(10)
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [dropTarget, setDropTarget] = useState<{ id: string; position: 'before' | 'inside' | 'after' } | null>(null)
  const title = isCategory ? 'Quản lý danh mục' : 'Quản lý khổ sách'
  const description = isCategory ? 'Danh mục có thể phân cấp cha–con. Kéo một dòng và thả lên dòng khác để đưa danh mục vào cấp con.' : 'Quản lý kích thước thành phẩm dùng khi thêm sách và chuẩn hóa dữ liệu xuất bản.'
  const fieldLabel = isCategory ? 'Tên danh mục' : 'Tên khổ sách'
  const slugify = (value: string) => value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  const addItem = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const value = isCategory ? newItem.trim() : `${formatWidth.trim()} × ${formatHeight.trim()} cm`
    const width = Number(formatWidth)
    const height = Number(formatHeight)
    if (!isCategory && (!Number.isFinite(width) || width <= 0 || !Number.isFinite(height) || height <= 0)) return
    if (!value || items.some((item) => item.name.toLowerCase() === value.toLowerCase())) return
    setItems((current) => [...current, { id: `${slugify(value)}-${Date.now()}`, name: value, parentId: isCategory ? newParentId : null }])
    setNewItem('')
    setFormatWidth('')
    setFormatHeight('')
    setNewParentId(null)
  }
  const getDepth = (item: AdminLookupItem) => {
    let depth = 0
    let parentId = item.parentId
    while (parentId && depth < 4) {
      depth += 1
      parentId = items.find((candidate) => candidate.id === parentId)?.parentId ?? null
    }
    return depth
  }
  const filteredItems = items
  const sortedItems = isCategory ? [...filteredItems] : [...filteredItems].sort((first, second) => {
    const result = first.name.localeCompare(second.name, 'vi')
    return sortAscending ? result : -result
  })
  const pagedItems = sortedItems.slice(0, pageSize)
  const getCategoryNumber = (itemId: string): string => {
    const item = items.find((candidate) => candidate.id === itemId)
    if (!item) return ''
    const siblings = items.filter((candidate) => candidate.parentId === item.parentId)
    const position = siblings.findIndex((candidate) => candidate.id === itemId) + 1
    if (!item.parentId) return `${position}.`
    const parentNumber = getCategoryNumber(item.parentId).replace(/\.$/, '')
    return `${parentNumber}.${position}`
  }
  const startEdit = (item: AdminLookupItem) => {
    const dimensions = item.name.match(/^(.+?)\s×\s(.+?)\s+cm$/)
    setEditingId(item.id)
    setEditingName(item.name)
    setEditingWidth(dimensions?.[1] ?? '')
    setEditingHeight(dimensions?.[2] ?? '')
  }
  const saveEdit = (itemId: string) => {
    const nextName = isCategory ? editingName.trim() : `${editingWidth.trim()} × ${editingHeight.trim()} cm`
    if (!nextName || (!isCategory && (!Number(editingWidth) || !Number(editingHeight)))) return
    setItems((current) => current.map((item) => item.id === itemId ? { ...item, name: nextName } : item))
    setEditingId(null)
  }
  const handleDrop = (targetId: string) => {
    if (!isCategory || !draggedId || draggedId === targetId || !dropTarget) return
    setItems((current) => {
      const draggedItem = current.find((item) => item.id === draggedId)
      if (!draggedItem) return current
      const descendantIds = new Set<string>()
      const collectDescendants = (parentId: string) => {
        current.filter((item) => item.parentId === parentId).forEach((child) => {
          descendantIds.add(child.id)
          collectDescendants(child.id)
        })
      }
      collectDescendants(draggedId)
      if (descendantIds.has(targetId)) return current
      const movingIds = new Set([draggedId, ...descendantIds])
      const targetItem = current.find((item) => item.id === targetId)
      if (!targetItem) return current
      const nextParentId = dropTarget.position === 'inside' ? targetItem.id : targetItem.parentId
      const movingItems = current.filter((item) => movingIds.has(item.id)).map((item) => item.id === draggedId ? { ...item, parentId: nextParentId } : item)
      const withoutMoving = current.filter((item) => !movingIds.has(item.id))
      const targetIndex = withoutMoving.findIndex((item) => item.id === targetId)
      if (targetIndex < 0) return current
      const insertIndex = dropTarget.position === 'after' || dropTarget.position === 'inside' ? targetIndex + 1 : targetIndex
      withoutMoving.splice(insertIndex, 0, ...movingItems)
      return withoutMoving
    })
    setDraggedId(null)
    setDropTarget(null)
  }
  return <section className="mt-6 rounded-2xl border border-[#e6e2d7] bg-white p-5 shadow-[0_10px_30px_rgba(31,42,36,.04)] sm:p-6">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div><p className="font-body text-sm font-semibold uppercase tracking-[.14em] text-[var(--color-olive)]">Danh mục sách</p><h3 className="mt-2 font-display text-2xl font-semibold tracking-tight">{title}</h3><p className="mt-2 max-w-2xl font-body text-sm leading-6 text-[#74776f]">{description}</p></div><span className="inline-flex min-h-10 items-center rounded-xl bg-[#f6f5ed] px-4 font-body text-sm text-[#62655f]">{items.length} mục</span></div>
    <form className={`mt-6 grid gap-3 ${isCategory ? 'sm:grid-cols-[minmax(0,1fr)_minmax(220px,280px)_auto]' : 'sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]'}`} onSubmit={addItem}>{isCategory ? <label className="min-w-0"><span className="mb-1.5 block font-body text-sm font-medium">{fieldLabel} <span className="text-[var(--color-olive-dark)]">*</span></span><input className="block min-h-11 w-full rounded-xl border border-[#dedbd0] bg-[#fcfbf7] px-3.5 font-body text-sm text-[var(--color-ink)] outline-none transition focus:border-[var(--color-olive)] focus:ring-2 focus:ring-[rgba(155,148,47,.14)]" required value={newItem} onChange={(event) => setNewItem(event.target.value)} placeholder={`Nhập ${fieldLabel.toLowerCase()}`} /></label> : <><label className="min-w-0"><span className="mb-1.5 block font-body text-sm font-medium">Chiều rộng <span className="text-[var(--color-olive-dark)]">*</span></span><div className="relative"><input className="block min-h-11 w-full rounded-xl border border-[#dedbd0] bg-[#fcfbf7] px-3.5 pr-12 font-body text-sm" required min="0.01" step="0.01" type="number" value={formatWidth} onChange={(event) => setFormatWidth(event.target.value)} placeholder="Ví dụ: 13" /><span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 font-body text-sm text-[#74776f]">cm</span></div></label><label className="min-w-0"><span className="mb-1.5 block font-body text-sm font-medium">Chiều cao <span className="text-[var(--color-olive-dark)]">*</span></span><div className="relative"><input className="block min-h-11 w-full rounded-xl border border-[#dedbd0] bg-[#fcfbf7] px-3.5 pr-12 font-body text-sm" required min="0.01" step="0.01" type="number" value={formatHeight} onChange={(event) => setFormatHeight(event.target.value)} placeholder="Ví dụ: 20" /><span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 font-body text-sm text-[#74776f]">cm</span></div></label></>}{isCategory && <label className="min-w-0"><span className="mb-1.5 block font-body text-sm font-medium">Danh mục cha</span><select className="block min-h-11 w-full rounded-xl border border-[#dedbd0] bg-[#fcfbf7] px-3.5 font-body text-sm" value={newParentId ?? ''} onChange={(event) => setNewParentId(event.target.value || null)}><option value="">Không có, cấp cao nhất</option>{items.filter((item) => getDepth(item) < 2).map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label>}<button className="admin-primary-action inline-flex min-h-11 self-end items-center justify-center rounded-xl bg-[var(--color-olive)] px-5 py-2.5 font-body text-sm font-medium text-white transition-colors hover:bg-[var(--color-olive-dark)]" type="submit"><i className="bi bi-plus-lg mr-2" aria-hidden="true" />Thêm mới</button></form>
    {isCategory && <p className="mt-3 font-body text-sm text-[#74776f]"><i className="bi bi-arrows-move mr-2" aria-hidden="true" />Kéo thả danh mục lên một dòng khác để đặt làm danh mục con.</p>}
    <div className="mt-6 overflow-x-auto rounded-xl border border-[#e6e2d7]"><table className="min-w-[760px] w-full text-left"><thead className="bg-[#fcfbf7]"><tr><th className="w-20 px-4 py-3 font-body text-sm font-semibold text-[#74776f]">STT</th><th className="px-4 py-3 font-body text-sm font-semibold"><div className="flex min-w-40 flex-col gap-2"><button className="inline-flex items-center gap-2" type="button" onClick={() => setSortAscending((current) => !current)}>{isCategory ? 'Tên' : 'Khổ sách'} {sortAscending ? '↑' : '↓'}</button></div></th>{isCategory ? <th className="px-4 py-3 font-body text-sm font-semibold">Cấp</th> : <><th className="px-4 py-3 font-body text-sm font-semibold">Chiều rộng</th><th className="px-4 py-3 font-body text-sm font-semibold">Chiều cao</th><th className="px-4 py-3 font-body text-sm font-semibold">Đơn vị</th></>}<th className="px-4 py-3 font-body text-sm font-semibold">Mã định danh</th><th className="px-4 py-3 font-body text-sm font-semibold">Trạng thái</th><th className="w-28 px-4 py-3 text-right font-body text-sm font-semibold">Thao tác</th></tr></thead><tbody>{pagedItems.map((item, index) => { const depth = getDepth(item); const dimensions = item.name.match(/^(.+?)\s×\s(.+?)\s+cm$/); const isDropTarget = dropTarget?.id === item.id; return <tr className={`border-t border-[#eeeae0] ${isDropTarget ? 'bg-[rgba(155,148,47,.1)]' : ''} ${isDropTarget && dropTarget.position === 'before' ? 'border-t-2 border-t-[var(--color-olive)]' : ''} ${isDropTarget && dropTarget.position === 'after' ? 'border-b-2 border-b-[var(--color-olive)]' : ''}`} draggable={isCategory} onDragStart={() => setDraggedId(item.id)} onDragOver={(event) => { if (isCategory && draggedId !== item.id) { event.preventDefault(); const bounds = event.currentTarget.getBoundingClientRect(); setDropTarget({ id: item.id, position: event.clientY < bounds.top + bounds.height / 2 ? 'before' : 'after' }) } }} onDragLeave={() => { if (dropTarget?.id === item.id) setDropTarget(null) }} onDrop={() => handleDrop(item.id)} onDragEnd={() => { setDraggedId(null); setDropTarget(null) }} key={item.id}><td className="px-4 py-3 font-body text-sm text-[#74776f]">{index + 1}</td><td className={`${depth === 0 ? '' : depth === 1 ? 'pl-8' : 'pl-12'} px-4 py-3 font-body text-sm font-medium text-[var(--color-ink)]`}>{editingId === item.id ? <input className="min-h-9 w-full rounded-lg border border-[var(--color-olive)] bg-white px-2.5 font-body text-sm" value={editingName} onChange={(event) => setEditingName(event.target.value)} aria-label={`Sửa ${item.name}`} /> : <><span className="mr-2 inline-block min-w-8 text-[#74776f]">{isCategory ? getCategoryNumber(item.id) : ''}</span><span className="mr-2 text-[#98968c]">{isCategory ? '⋮⋮' : ''}</span>{depth > 0 && <span className="mr-2 text-[#98968c]">↳</span>}{item.name}</>}</td>{isCategory ? <td className="px-4 py-3 font-body text-sm text-[#74776f]">{depth === 0 ? 'Cấp cha' : `Cấp con ${depth}`}</td> : <><td className="px-4 py-3 font-body text-sm">{dimensions?.[1] ?? '—'}</td><td className="px-4 py-3 font-body text-sm">{dimensions?.[2] ?? '—'}</td><td className="px-4 py-3 font-body text-sm">cm</td></>}<td className="px-4 py-3 font-body text-sm text-[#74776f]">{slugify(item.name)}</td><td className="px-4 py-3 font-body text-sm"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${hiddenIds.includes(item.id) ? 'bg-[#f2f1ec] text-[#8b8d86]' : 'bg-[#edf7ef] text-[#39733e]'}`}>{hiddenIds.includes(item.id) ? 'Tạm ẩn' : 'Đang sử dụng'}</span></td><td className="px-4 py-3 text-right"><div className="flex justify-end gap-1"><button className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#74776f] hover:bg-[#f5f3ec] hover:text-[var(--color-ink)]" type="button" aria-label={editingId === item.id ? `Lưu ${item.name}` : `Sửa ${item.name}`} onClick={() => editingId === item.id ? saveEdit(item.id) : startEdit(item)}><i className={`bi ${editingId === item.id ? 'bi-check-lg' : 'bi-pencil'}`} aria-hidden="true" /></button><button className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#74776f] hover:bg-[#f5f3ec] hover:text-[var(--color-ink)]" type="button" aria-label={editingId === item.id ? `Hủy sửa ${item.name}` : (hiddenIds.includes(item.id) ? `Hiện ${item.name}` : `Tạm ẩn ${item.name}`)} onClick={() => editingId === item.id ? setEditingId(null) : setHiddenIds((current) => current.includes(item.id) ? current.filter((id) => id !== item.id) : [...current, item.id])}><i className={`bi ${editingId === item.id ? 'bi-x-lg' : (hiddenIds.includes(item.id) ? 'bi-eye' : 'bi-eye-slash')}`} aria-hidden="true" /></button><button className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#8b8d86] hover:bg-[#f1e8e5] hover:text-[#a33d32]" type="button" aria-label={`Xóa ${item.name}`} onClick={() => setItems((current) => current.filter((currentItem) => currentItem.id !== item.id && currentItem.parentId !== item.id))}><i className="bi bi-trash3" aria-hidden="true" /></button></div></td></tr> })}</tbody><tfoot><tr className="border-t border-[#dedbd0] bg-[#fcfbf7] font-semibold"><td className="px-4 py-3 font-body text-sm text-[#74776f]">Tổng</td><td className="px-4 py-3 font-body text-sm">{items.length} mục</td><td colSpan={isCategory ? 1 : 3} className="px-4 py-3 font-body text-sm">—</td><td className="px-4 py-3 font-body text-sm">—</td><td className="px-4 py-3 font-body text-sm">—</td><td className="px-4 py-3 font-body text-sm">—</td></tr></tfoot></table></div><AdminTableFooter total={sortedItems.length} pageSize={pageSize} onPageSizeChange={setPageSize} />
  </section>
}

const getAdminBookViewFromPath = (pathname: string): BookManagementView => pathname === '/admin/books/categories' ? 'categories' : pathname === '/admin/books/formats' ? 'formats' : 'books'

function AdminBookSubnav({ pathname }: { pathname: string }) {
  const isList = pathname === '/admin/books'
  const isCategories = pathname === '/admin/books/categories'
  const linkClass = (active: boolean, nested = false) => `flex items-center rounded-lg px-3 py-2 font-body text-sm ${nested ? 'ml-3 pl-4' : ''} ${active ? 'bg-[rgba(155,148,47,.12)] font-semibold text-[var(--color-olive-dark)]' : 'text-[#74776f] transition-colors hover:bg-[#f5f3ec] hover:text-[var(--color-ink)]'}`
  return <div className="admin-book-subnav ml-4 border-l border-[#e8e5da] pl-3"><a className={linkClass(isList)} href="/admin/books" aria-current={isList ? 'page' : undefined}>Danh sách sách</a><a className={linkClass(isCategories)} href="/admin/books/categories" aria-current={isCategories ? 'page' : undefined}>Danh mục</a></div>
}

function AdminBookCreatePage() {
  const [values, setValues] = useState<Record<string, string>>({ isbn: '', title: '', author: '', series: '', coverPriceUsd: '', quantity: '', unitPrice: '', salePrice: '', exchangeRate: '', format: '', line: '', genre: '', topic: '', link: '', goodreads: '', coverFile: '' })
  const [coverPreview, setCoverPreview] = useState('')
  const fields = [['isbn', 'ISBN', 'text'], ['title', 'Tác phẩm', 'text'], ['author', 'Tác giả', 'text'], ['series', 'Series', 'text'], ['coverPriceUsd', 'Giá bìa (USD)', 'number'], ['quantity', 'Số lượng (quyển)', 'number'], ['unitPrice', 'Đơn giá nhập (VNĐ)', 'number'], ['salePrice', 'Giá bán (VNĐ)', 'number'], ['exchangeRate', 'Tỷ giá', 'number'], ['format', 'Thể thức', 'text'], ['line', 'Dòng sách', 'text'], ['genre', 'Thể loại', 'text'], ['topic', 'Chủ đề', 'text'], ['link', 'Link sách', 'url'], ['goodreads', 'Đánh giá Goodreads', 'number']] as const
  return <AdminSimpleCreateShell title="Thêm sách" backHref="/admin/books" section="SÁCH" description="Nhập một bản ghi sách theo các trường đã xuất hiện trong các sheet Picador, Penguin UK, Penguin US và NYRB."><form className="grid gap-5" onSubmit={(event) => { event.preventDefault() }}><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{fields.map(([key, label, type]) => <label className="block" key={key}><span className="mb-1.5 block font-body text-sm font-medium">{label}{['title', 'author'].includes(key) && <span className="ml-1 text-[var(--color-olive-dark)]">*</span>}</span><input className="min-h-11 w-full rounded-xl border border-[#dedbd0] bg-[#fcfbf7] px-3.5 font-body text-sm" type={type} required={['title', 'author'].includes(key)} value={values[key]} onChange={(event) => setValues((current) => ({ ...current, [key]: event.target.value }))} /></label>)}</div><label className="block max-w-md"><span className="mb-1.5 block font-body text-sm font-medium">Ảnh bìa</span><input className="block min-h-11 w-full cursor-pointer rounded-xl border border-dashed border-[var(--color-olive)] bg-[rgba(155,148,47,.05)] px-3.5 py-2.5 font-body text-sm" type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => { const file = event.target.files?.[0]; if (!file) return; setValues((current) => ({ ...current, coverFile: file.name })); setCoverPreview(URL.createObjectURL(file)) }} /><span className="mt-1 block font-body text-xs text-[#8b8d86]">Tải JPG, PNG hoặc WebP. Không nhập URL.</span>{coverPreview && <img className="mt-3 h-32 w-24 rounded-xl object-cover" src={coverPreview} alt="Xem trước ảnh bìa" />}</label><div className="rounded-xl bg-[#f6f5ed] p-4 font-body text-sm text-[#62655f]">Thành tiền sẽ được tính tự động từ số lượng × đơn giá nhập. Tác giả, thể thức, dòng sách, thể loại và chủ đề sẽ chuyển thành lựa chọn từ dữ liệu chuẩn khi kết nối database.</div><div className="flex flex-col justify-end gap-3 border-t border-[#eeeae0] pt-5 sm:flex-row"><a className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#dedbd0] px-5 font-body text-sm" href="/admin/books">Hủy</a><button className="admin-primary-action inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--color-olive)] px-5 font-body text-sm font-medium text-white" type="submit">Lưu sách</button></div></form></AdminSimpleCreateShell>
}

function AdminCategoryCreatePage() {
  return <AdminSimpleCreateShell title="Thêm danh mục" backHref="/admin/books/categories" section="DANH MỤC" description="Tạo danh mục từ database, chọn danh mục cha và thứ tự hiển thị."><form className="grid gap-4 sm:grid-cols-2" onSubmit={(event) => event.preventDefault()}><label className="block"><span className="mb-1.5 block font-body text-sm font-medium">Tên danh mục<span className="ml-1 text-[var(--color-olive-dark)]">*</span></span><input className="min-h-11 w-full rounded-xl border border-[#dedbd0] bg-[#fcfbf7] px-3.5 font-body text-sm" required /></label><label className="block"><span className="mb-1.5 block font-body text-sm font-medium">Danh mục cha</span><select className="min-h-11 w-full rounded-xl border border-[#dedbd0] bg-[#fcfbf7] px-3.5 font-body text-sm"><option>Không có, cấp cao nhất</option><option>Fiction</option><option>Non-fiction</option></select></label><label className="block"><span className="mb-1.5 block font-body text-sm font-medium">Thứ tự</span><input className="min-h-11 w-full rounded-xl border border-[#dedbd0] bg-[#fcfbf7] px-3.5 font-body text-sm" type="number" min="1" defaultValue="1" /></label><label className="block"><span className="mb-1.5 block font-body text-sm font-medium">Đường dẫn</span><input className="min-h-11 w-full rounded-xl border border-[#dedbd0] bg-[#fcfbf7] px-3.5 font-body text-sm" /></label><label className="block sm:col-span-2"><span className="mb-1.5 block font-body text-sm font-medium">Mô tả</span><textarea className="min-h-28 w-full rounded-xl border border-[#dedbd0] bg-[#fcfbf7] p-3.5 font-body text-sm" /></label><div className="flex justify-end gap-3 border-t border-[#eeeae0] pt-5 sm:col-span-2"><a className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#dedbd0] px-5 font-body text-sm" href="/admin/books/categories">Hủy</a><button className="admin-primary-action inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--color-olive)] px-5 font-body text-sm font-medium text-white" type="submit">Lưu danh mục</button></div></form></AdminSimpleCreateShell>
}

type AdminModuleConfig = { section: string; title: string; description: string; addLabel: string; columns: string[]; rows: string[][]; empty: string }
const adminPageSizeOptions = [10, 25, 50, 100]

function AdminTableFooter({ total, pageSize, onPageSizeChange, page = 1, onPageChange }: { total: number; pageSize: number; onPageSizeChange: (value: number) => void; page?: number; onPageChange?: (value: number) => void }) {
  const shown = Math.min(total, pageSize)
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1
  const end = total === 0 ? 0 : Math.min(page * pageSize, total)
  return <div className="flex flex-col justify-between gap-3 border-t border-[#eeeae0] px-4 py-3 font-body text-sm text-[#74776f] sm:flex-row sm:items-center"><span>Hiển thị {start}–{end} / {total} bản ghi</span><div className="flex flex-wrap items-center justify-between gap-3 sm:justify-end"><div className="inline-flex items-center gap-1"><button className="inline-flex h-8 items-center justify-center rounded-lg border border-[#dedbd0] px-2.5 text-xs disabled:cursor-not-allowed disabled:opacity-40" type="button" disabled={!onPageChange || page <= 1} onClick={() => onPageChange?.(page - 1)}>Trước</button><span className="min-w-20 text-center text-xs">Trang {page} / {totalPages}</span><button className="inline-flex h-8 items-center justify-center rounded-lg border border-[#dedbd0] px-2.5 text-xs disabled:cursor-not-allowed disabled:opacity-40" type="button" disabled={!onPageChange || page >= totalPages} onClick={() => onPageChange?.(page + 1)}>Sau</button></div><label className="inline-flex items-center gap-2">Số dòng<select className="min-h-9 rounded-lg border border-[#dedbd0] bg-white px-2.5 font-body text-sm text-[var(--color-ink)]" value={pageSize} onChange={(event) => onPageSizeChange(Number(event.target.value))}>{adminPageSizeOptions.map((option) => <option value={option} key={option}>{option}</option>)}</select></label></div></div>
}

type AdminFilterOption = { label: string; value: string }
function AdminTableFilterBar({ query, onQueryChange, queryPlaceholder = 'Tìm kiếm', filters, onClear }: { query: string; onQueryChange: (value: string) => void; queryPlaceholder?: string; filters: Array<{ label: string; value: string; options: AdminFilterOption[]; onChange: (value: string) => void }>; onClear?: () => void }) {
  const hasActiveFilter = Boolean(query.trim()) || filters.some((filter) => filter.value !== 'all')
  return <div className="admin-table-filter-bar flex flex-col gap-3 border-b border-[#eeeae0] bg-[#fcfbf7] p-4 lg:flex-row lg:flex-wrap lg:items-center">
    <label className="relative min-w-0 flex-1 lg:min-w-[280px]"><span className="sr-only">{queryPlaceholder}</span><i className="bi bi-search pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8b8d86]" aria-hidden="true" /><input className="min-h-10 w-full rounded-lg border border-[#dedbd0] bg-white pl-9 pr-3 font-body text-sm" value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder={queryPlaceholder} /></label>
    {filters.map((filter) => <label className="min-w-0 lg:min-w-[180px]" key={filter.label}><span className="sr-only">{filter.label}</span><select className="min-h-10 w-full rounded-lg border border-[#dedbd0] bg-white px-3 font-body text-sm" value={filter.value} onChange={(event) => filter.onChange(event.target.value)} aria-label={filter.label}><option value="all">{filter.label}</option>{filter.options.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}</select></label>)}
    {onClear && <button className="inline-flex min-h-10 items-center justify-center rounded-lg border border-[#dedbd0] px-3.5 font-body text-sm text-[#62655f] transition-colors hover:border-[var(--color-olive)] hover:bg-white disabled:cursor-not-allowed disabled:opacity-40" type="button" onClick={onClear} disabled={!hasActiveFilter}>Xóa lọc</button>}
  </div>
}

const parseAdminSummaryNumber = (value: string) => {
  const normalized = value.replace(/[^0-9.-]/g, '')
  return normalized && Number.isFinite(Number(normalized)) ? Number(normalized) : null
}

function AdminSummaryRow({ rows, numericColumns, columnCount }: { rows: string[][]; numericColumns: number[]; columnCount: number }) {
  return <tr className="border-t border-[#dedbd0] bg-[#fcfbf7] font-semibold"><td className="px-4 py-3 font-body text-sm text-[#74776f]">Tổng</td>{Array.from({ length: columnCount - 1 }, (_, index) => { const columnIndex = index + 1; const total = numericColumns.includes(columnIndex) ? rows.reduce((sum, row) => sum + (parseAdminSummaryNumber(row[row.length === 1 ? 0 : columnIndex] ?? '') ?? 0), 0) : null; return <td className="px-4 py-3 font-body text-sm" key={columnIndex}>{total === null ? '—' : total.toLocaleString('vi-VN')}</td> })}</tr>
}
const adminModuleConfigs: Record<string, AdminModuleConfig> = {
  '/admin/authors': { section: 'NỘI DUNG', title: 'Quản lý tác giả', description: 'Quản lý hồ sơ tác giả, ảnh đại diện, tiểu sử và các sách liên quan.', addLabel: 'Thêm tác giả', columns: ['Tên tác giả', 'Đường dẫn', 'Số sách', 'Trạng thái'], rows: [['Edward W. Said', 'edward-w-said', '4', 'Đang hoạt động'], ['Toni Morrison', 'toni-morrison', '1', 'Đang hoạt động'], ['Yukio Mishima', 'yukio-mishima', '2', 'Đang hoạt động']], empty: 'Chưa có tác giả nào.' },
  '/admin/news': { section: 'NỘI DUNG', title: 'Quản lý tin tức', description: 'Soạn, xem trước và xuất bản bài viết editorial, tin tức và nội dung giới thiệu.', addLabel: 'Tạo bài viết', columns: ['Tiêu đề', 'Đường dẫn', 'Ngày xuất bản', 'Trạng thái'], rows: [['Toni Morrison: memory and the past', 'toni-morrison-memory-and-the-past', '—', 'Bản nháp'], ['Books about Women', 'books-about-women', '—', 'Bản nháp']], empty: 'Chưa có bài viết nào.' },
  '/admin/reviews': { section: 'NỘI DUNG', title: 'Bình luận & đánh giá', description: 'Kiểm duyệt đánh giá của bạn đọc trước khi hiển thị công khai trên trang chi tiết sách.', addLabel: '', columns: ['Bạn đọc', 'Sách', 'Đánh giá', 'Nội dung', 'Ngày gửi', 'Trạng thái'], rows: [['Nguyễn Minh Anh', 'A Manual for Cleaning Women', '★★★★★', 'Một tuyển tập giàu quan sát và rất đáng đọc.', '13/11/2026', 'Chờ duyệt'], ['Linh Trần', 'The Souls of Black Folk', '★★★★☆', 'Phần giới thiệu rõ ràng, giao hàng nhanh.', '12/11/2026', 'Đã duyệt'], ['Hoàng Nam', 'Ethics: A Very Short Introduction', '★★★☆☆', 'Nội dung hữu ích nhưng bản in hơi mỏng.', '10/11/2026', 'Từ chối']], empty: 'Chưa có bình luận hoặc đánh giá nào.' },
  '/admin/orders': { section: 'BÁN HÀNG', title: 'Quản lý đơn hàng', description: 'Theo dõi các đơn hàng được tạo từ cửa hàng người dùng, kênh bán, thanh toán và giao hàng.', addLabel: '', columns: ['Mã đơn', 'Khách hàng', 'Kênh bán', 'Tổng tiền', 'Trạng thái'], rows: [], empty: 'Chưa có đơn hàng từ cửa hàng.' },
  '/admin/customers': { section: 'BÁN HÀNG', title: 'Quản lý khách hàng', description: 'Xem và chỉnh sửa hồ sơ khách hàng được tạo từ đăng ký hoặc đơn hàng trên cửa hàng người dùng.', addLabel: '', columns: ['Khách hàng', 'Email', 'Số điện thoại', 'Đơn hàng', 'Trạng thái'], rows: [], empty: 'Chưa có khách hàng từ cửa hàng.' },
  '/admin/inventory': { section: 'BÁN HÀNG', title: 'Quản lý kho', description: 'Theo dõi tồn thực tế, số lượng đang giữ cho đơn, số lượng có thể bán và cảnh báo hết hàng theo sản phẩm. Dữ liệu mẫu đối chiếu từ màn Kho live: 237 tồn thực tế, 10 đang giữ, 227 có thể bán.', addLabel: '', columns: ['Sản phẩm', 'ISBN', 'Tồn thực tế', 'Đang giữ', 'Có thể bán', 'Trạng thái'], rows: [['A Book of Mediterranean Food', '9781590170038', '1', '0', '1', 'Sắp hết'], ['A Dutiful Boy', '9781529112207', '1', '0', '1', 'Sắp hết'], ['A Farewell to Arms', '9781101908518', '1', '0', '1', 'Sắp hết'], ['A Gentleman in Moscow', '9780143110439', '1', '1', '0', 'Hết hàng bán'], ['Austerlitz', '9780812982619', '11', '0', '11', 'Đủ hàng'], ['Educated', '9780399590528', '1', '1', '0', 'Hết hàng bán'], ['Grief Is for People', '9781250371782', '1', '1', '0', 'Hết hàng bán'], ['Memoirs from Beyond the Grave', '9781681379616', '1', '1', '0', 'Hết hàng bán'], ['The Word of the Speechless', '9781681373232', '1', '1', '0', 'Hết hàng bán'], ['Valentino and Sagittarius', '9781681374741', '1', '1', '0', 'Hết hàng bán']], empty: 'Chưa có dữ liệu tồn kho.' },
  '/admin/promotions': { section: 'BÁN HÀNG', title: 'Chương trình khuyến mãi', description: 'Tạo và kiểm soát chương trình giảm giá theo thời gian, voucher, số lượng lượt dùng và điều kiện khách hàng. Quy tắc chỉ được áp dụng khi đủ điều kiện và còn lượt.', addLabel: 'Tạo chương trình', columns: ['Tên chương trình', 'Thời gian diễn ra', 'Thời hạn', 'Mã voucher', 'Số lượng', 'Mức giảm', 'Điều kiện áp dụng', 'Trạng thái'], rows: [['Ưu đãi IELTS 7.0+', '12/11/2026 – 31/12/2026', '31/12/2026', 'IELTS7', '100', '20%', 'Khách đã xác thực IELTS Overall từ 7.0 trở lên', 'Đang hoạt động'], ['New & Upcoming Launch', '01/12/2026 – 15/12/2026', '15/12/2026', 'NEWUP10', '200', '10%', 'Đơn có sách thuộc mô đun New & Upcoming, tối thiểu 500.000₫', 'Bản nháp']], empty: 'Chưa có chương trình khuyến mãi.' },
  '/admin/stores': { section: 'BÁN HÀNG', title: 'Điểm bán và kho', description: 'Quản lý kênh bán, điểm bán, kho và số lượng tồn theo từng địa điểm.', addLabel: 'Thêm điểm bán', columns: ['Mã điểm', 'Tên điểm bán', 'Loại', 'Địa chỉ', 'Trạng thái'], rows: [['STORE-01', 'Store 1', 'Cửa hàng / kho', 'Phố Sách 19/12, Cửa Nam, Hà Nội', 'Đang hoạt động'], ['STORE-02', 'Store 2', 'Cửa hàng / kho', 'Coming soon', 'Sắp mở'], ['WEB', 'Website Linery', 'Kênh bán', 'Online', 'Đang hoạt động']], empty: 'Chưa có điểm bán.' },
  '/admin/media': { section: 'NỘI DUNG', title: 'Thư viện media', description: 'Quản lý ảnh bìa, ảnh tác giả, banner và metadata dùng chung.', addLabel: 'Tải media', columns: ['Tên file', 'Loại asset', 'Kích thước', 'Alt text', 'Trạng thái'], rows: [], empty: 'Chưa có media asset.' },
  '/admin/collections': { section: 'NỘI DUNG', title: 'Collection hiển thị', description: 'Quản lý các tuyển chọn như New & Upcoming, Linery Press và Linery Picks.', addLabel: 'Thêm collection', columns: ['Tên collection', 'Số sách', 'Thứ tự', 'Trạng thái'], rows: [['New & Upcoming', '0', '1', 'Đang hoạt động'], ['Linery News', '0', '2', 'Đang hoạt động']], empty: 'Chưa có collection.' },
  '/admin/locations': { section: 'HỆ THỐNG', title: 'Địa điểm và khu vực giao hàng', description: 'Quản lý tỉnh thành, quận huyện, phường xã và khu vực giao hàng.', addLabel: 'Thêm khu vực', columns: ['Tên khu vực', 'Cấp địa giới', 'Phí giao hàng', 'Trạng thái'], rows: [['Hà Nội', 'Tỉnh / thành phố', 'Cấu hình riêng', 'Đang hoạt động']], empty: 'Chưa có khu vực.' },
  '/admin/payments': { section: 'HỆ THỐNG', title: 'Thanh toán và tài khoản nhận tiền', description: 'Quản lý phương thức thanh toán, ngân hàng, QR và ví điện tử. Secret chỉ lưu ở backend.', addLabel: 'Thêm phương thức', columns: ['Phương thức', 'Loại', 'Môi trường', 'Thứ tự', 'Trạng thái'], rows: [['Chuyển khoản ngân hàng', 'Bank transfer', 'Production', '1', 'Đang hoạt động'], ['VNPay', 'Gateway', 'Sandbox', '2', 'Đang tắt'], ['MoMo', 'Wallet', 'Sandbox', '3', 'Đang tắt']], empty: 'Chưa có phương thức thanh toán.' },
  '/admin/chatbot': { section: 'HỆ THỐNG', title: 'Cấu hình Gemini chatbot', description: 'Cấu hình hiển thị, prompt, quick prompts, model và giới hạn vận hành. API key không hiển thị ở frontend.', addLabel: 'Thêm quick prompt', columns: ['Quick prompt', 'Ngôn ngữ', 'Thứ tự', 'Trạng thái'], rows: [['Find a book', 'English', '1', 'Đang hoạt động'], ['Tìm sách theo tác giả', 'Tiếng Việt', '2', 'Đang hoạt động']], empty: 'Chưa có quick prompt.' },
  '/admin/settings': { section: 'HỆ THỐNG', title: 'Cấu hình hệ thống', description: 'Cấu hình thương hiệu, hotline, email, footer, social, chính sách và nội dung storefront.', addLabel: 'Thêm cấu hình', columns: ['Nhóm cấu hình', 'Khóa', 'Ngôn ngữ', 'Trạng thái'], rows: [['Thương hiệu', 'site_name', 'Chung', 'Đã cấu hình'], ['Footer', 'footer_hotline', 'Tiếng Việt', 'Đã cấu hình'], ['Social', 'instagram_url', 'Chung', 'Chưa cấu hình']], empty: 'Chưa có cấu hình.' },
  '/admin/import-history': { section: 'SÁCH', title: 'Lịch sử nhập Excel', description: 'Xem lại các batch nhập sách, người thực hiện, kết quả và tải báo cáo lỗi.', addLabel: 'Nhập Excel', columns: ['Tên file', 'Người nhập', 'Tổng dòng', 'Hợp lệ', 'Lỗi', 'Trạng thái'], rows: [], empty: 'Chưa có lịch sử nhập.' },
  '/admin/publishers': { section: 'NỘI DUNG', title: 'Quản lý nhà xuất bản', description: 'Quản lý danh sách nhà xuất bản và liên kết với các đầu sách.', addLabel: 'Thêm nhà xuất bản', columns: ['Nhà xuất bản', 'Đường dẫn', 'Số sách', 'Trạng thái'], rows: [], empty: 'Chưa có nhà xuất bản.' },
  '/admin/website': { section: 'HỆ THỐNG', title: 'Cấu hình website', description: 'Quản lý logo, favicon, banner desktop/mobile, nội dung footer và bản xem trước trước khi xuất bản.', addLabel: 'Thêm content block', columns: ['Nhóm nội dung', 'Khóa', 'Ngôn ngữ', 'Trạng thái'], rows: [['Header', 'header_logo', 'Chung', 'Đã cấu hình'], ['Footer', 'footer_content', 'Tiếng Việt', 'Đã cấu hình'], ['Banner', 'home_banner_01', 'Chung', 'Bản nháp']], empty: 'Chưa có content block.' },
  '/admin/menus': { section: 'HỆ THỐNG', title: 'Quản lý Menu', description: 'Quản lý danh sách menu ngang trên header và menu chân trang. Thứ tự, nhãn, đường dẫn và trạng thái được lưu theo từng menu.', addLabel: 'Thêm mục menu', columns: ['Menu', 'Nhãn hiển thị', 'Đường dẫn', 'Thứ tự', 'Trạng thái'], rows: [['Menu ngang', 'Books', '/all-books', '1', 'Đang hoạt động'], ['Menu ngang', 'Creators', '/creators', '2', 'Đang hoạt động'], ['Menu chân trang', 'About us', '/news/gioi-thieu', '1', 'Đang hoạt động']], empty: 'Chưa có mục menu.' },
}

const getStorefrontAdminRows = (pathname: string, fallback: string[][]) => {
  if (pathname === '/admin/customers') {
    return readStoredRecords<StorefrontCustomerRecord>(storefrontCustomersKey).map((customer) => [customer.name, customer.email, customer.phone, String(customer.orderCount), customer.status])
  }
  if (pathname === '/admin/orders') {
    return readStoredRecords<StorefrontOrderRecord>(storefrontOrdersKey).map((order) => [order.id, order.customerName, order.channel, formatPrice(order.total), order.status])
  }
  return fallback
}

const persistStorefrontAdminRows = (pathname: string, rows: string[][]) => {
  if (pathname === '/admin/customers') {
    const existing = readStoredRecords<StorefrontCustomerRecord>(storefrontCustomersKey)
    writeStoredRecords(storefrontCustomersKey, rows.map((row, index) => ({ ...(existing[index] ?? { id: `customer-${Date.now()}-${index}`, createdAt: new Date().toISOString() }), name: row[0] ?? 'Khách hàng', email: row[1] ?? '—', phone: row[2] ?? '—', orderCount: Number(row[3]) || 0, status: row[4] === 'Tạm khóa' ? 'Tạm khóa' : 'Đang hoạt động' })))
  }
  if (pathname === '/admin/orders') {
    const existing = readStoredRecords<StorefrontOrderRecord>(storefrontOrdersKey)
    writeStoredRecords(storefrontOrdersKey, rows.map((row, index) => ({ ...(existing[index] ?? { id: row[0] ?? `LINERY-${Date.now()}-${index}`, customerId: '', createdAt: new Date().toISOString() }), customerName: row[1] ?? 'Khách hàng', channel: row[2] ?? 'Website', total: Number((row[3] ?? '').replace(/[^0-9]/g, '')) || 0, status: (row[4] as StorefrontOrderRecord['status']) || 'Chờ xác nhận' })))
  }
}

function AdminManagementSidebarBase({ pathname }: { pathname: string }) {
  const [booksOpen, setBooksOpen] = useState(pathname.startsWith('/admin/books'))
  const [securityOpen, setSecurityOpen] = useState(pathname.startsWith('/admin/settings/admin-users') || pathname.startsWith('/admin/settings/permissions'))
  const item = (href: string, label: string, icon: string) => {
    const active = pathname === href
    const link = <a className={`flex items-center gap-3 rounded-xl px-3 py-2.5 font-body text-sm transition-colors ${active ? 'bg-[rgba(155,148,47,.12)] font-semibold text-[var(--color-olive-dark)]' : 'text-[#62655f] hover:bg-[#f5f3ec] hover:text-[var(--color-ink)]'}`} href={href} aria-current={active ? 'page' : undefined}><i className={`bi ${icon}`} aria-hidden="true" />{label}</a>
    if (href !== '/admin/website') return link
    return <>{link}<a className="flex items-center gap-3 rounded-xl px-3 py-2.5 font-body text-sm text-[#62655f] transition-colors hover:bg-[#f5f3ec] hover:text-[var(--color-ink)]" href="/admin/website?tab=banners"><i className="bi bi-images" aria-hidden="true" />Quản trị banner</a></>
  }
  return <nav className="flex-1 space-y-1 overflow-y-auto p-4" aria-label="Điều hướng quản trị"><p className="px-3 pb-2 pt-3 font-body text-xs font-semibold uppercase tracking-[.14em] text-[#98968c]">Khu vực quản trị</p>{item('/admin', 'Tổng quan', 'bi-grid-1x2-fill')}{item('/admin/books/new', 'Thêm sách', 'bi-plus-square')}<div><a className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 font-body text-sm font-semibold text-[var(--color-ink)]" href="/admin/books"><span className="flex items-center gap-3"><i className="bi bi-book" aria-hidden="true" />Quản lý sách</span><i className="bi bi-chevron-down text-xs" aria-hidden="true" /></a><AdminBookSubnav pathname={pathname} />{item('/admin/import-history', 'Lịch sử nhập Excel', 'bi-clock-history')}{item('/admin/collections', 'Mô đun sách trang chủ', 'bi-collection')}</div><p className="px-3 pb-2 pt-7 font-body text-xs font-semibold uppercase tracking-[.14em] text-[#98968c]">Bán hàng</p>{item('/admin/orders', 'Đơn hàng', 'bi-bag')}{item('/admin/reports', 'Báo cáo & thống kê', 'bi-bar-chart-line')}{item('/admin/customers', 'Khách hàng', 'bi-person-lines-fill')}{item('/admin/stores', 'Điểm bán và kho', 'bi-shop')}{item('/admin/inventory', 'Quản lý kho', 'bi-box-seam')}{item('/admin/promotions', 'Chương trình khuyến mãi', 'bi-ticket-perforated')}<p className="px-3 pb-2 pt-7 font-body text-xs font-semibold uppercase tracking-[.14em] text-[#98968c]">Nội dung</p>{item('/admin/authors', 'Creators', 'bi-people')}{item('/admin/publishers', 'Nhà xuất bản', 'bi-building')}{item('/admin/news', 'Tin tức', 'bi-newspaper')}{item('/admin/reviews', 'Bình luận & đánh giá', 'bi-chat-square-text')}{item('/admin/media', 'Media', 'bi-images')}<p className="px-3 pb-2 pt-7 font-body text-xs font-semibold uppercase tracking-[.14em] text-[#98968c]">Hệ thống</p>{item('/admin/menus', 'Quản lý Menu', 'bi-list-nested')}{item('/admin/website', 'Website & footer', 'bi-window')}{item('/admin/locations', 'Địa điểm', 'bi-geo-alt')}{item('/admin/payments', 'Thanh toán', 'bi-credit-card')}{item('/admin/chatbot', 'Gemini chatbot', 'bi-chat-dots')}{item('/admin/settings', 'Cài đặt', 'bi-sliders')}<div><button className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left font-body text-sm font-semibold text-[var(--color-ink)]" type="button" onClick={() => setSecurityOpen((value) => !value)} aria-expanded={securityOpen}><span className="flex items-center gap-3"><i className="bi bi-person-gear" aria-hidden="true" />Quản trị viên &amp; phân quyền</span><i className={`bi ${securityOpen ? 'bi-chevron-down' : 'bi-chevron-right'} text-xs`} aria-hidden="true" /></button>{securityOpen && <div className="ml-4 space-y-1 border-l border-[#e6e2d7] pl-3">{item('/admin/settings/admin-users', 'Quản trị viên', 'bi-person-gear')}{item('/admin/settings/permissions', 'Phân quyền', 'bi-shield-check')}</div>}</div></nav>
}

function AdminManagementSidebar({ pathname }: { pathname: string }) {
  return <><AdminManagementSidebarBase pathname={pathname} /><AdminSidebarFooter /></>
}

type AdminAuthorRecord = { id: string; name: string; slug: string; role: string; books: number; email: string; status: 'Đang hoạt động' | 'Tạm ẩn'; image?: string; bio: string; awards?: string; academicTitle?: string; birthYear?: number | null; deathYear?: number | null }
const creatorRoleLabels: Record<PublicCreatorProfile['roles'][number], string> = { author: 'Tác giả', translator: 'Dịch giả', illustrator: 'Họa sĩ minh họa' }
const formatCreatorRoles = (roles: PublicCreatorProfile['roles']) => roles.map((role) => creatorRoleLabels[role]).filter(Boolean).join(' · ') || 'Nhà sáng tạo'
const adminAuthorRecords: AdminAuthorRecord[] = [
  { id: 'edward-w-said', name: 'Edward W. Said', slug: 'edward-w-said', role: 'Tác giả', books: 4, email: '—', status: 'Đang hoạt động', image: '/assets/author-edward-w-said.png', bio: 'Edward W. Said là một trong những tiếng nói quan trọng của phê bình văn học và nghiên cứu văn hóa hiện đại.' },
  { id: 'toni-morrison', name: 'Toni Morrison', slug: 'toni-morrison', role: 'Tác giả', books: 1, email: '—', status: 'Đang hoạt động', image: '/assets/news-instagram-02.jpg', bio: 'Nhà văn Mỹ đoạt Nobel Văn học, được biết đến với những tác phẩm giàu chiều sâu về ký ức và căn tính.' },
  { id: 'yukio-mishima', name: 'Yukio Mishima', slug: 'yukio-mishima', role: 'Tác giả', books: 2, email: '—', status: 'Đang hoạt động', image: '/assets/news-instagram-04.jpg', bio: 'Nhà văn Nhật Bản với các tác phẩm giàu tính biểu tượng, kỷ luật hình thức và sức gợi văn hóa.' },
  { id: 'natalia-ginzburg', name: 'Natalia Ginzburg', slug: 'natalia-ginzburg', role: 'Tác giả', books: 1, email: '—', status: 'Đang hoạt động', image: '/assets/author-avatar-placeholder.png', bio: '' },
  { id: 'tara-westover', name: 'Tara Westover', slug: 'tara-westover', role: 'Tác giả', books: 1, email: '—', status: 'Đang hoạt động', image: '/assets/author-avatar-placeholder.png', bio: '' },
  { id: 'francois-rene-de-chateaubriand', name: 'François-René de Chateaubriand', slug: 'francois-rene-de-chateaubriand', role: 'Tác giả', books: 1, email: '—', status: 'Đang hoạt động', image: '/assets/author-avatar-placeholder.png', bio: '' },
  { id: 'sloane-crosley', name: 'Sloane Crosley', slug: 'sloane-crosley', role: 'Tác giả', books: 1, email: '—', status: 'Đang hoạt động', image: '/assets/author-avatar-placeholder.png', bio: '' },
  { id: 'julio-ramon-ribeyro', name: 'Julio Ramón Ribeyro', slug: 'julio-ramon-ribeyro', role: 'Tác giả', books: 1, email: '—', status: 'Đang hoạt động', image: '/assets/author-avatar-placeholder.png', bio: '' },
]

function AdminAuthorCreatePage({ pathname }: { pathname: string }) {
  const [form, setForm] = useState<AdminAuthorForm>(emptyAdminAuthorForm)
  const [saved, setSaved] = useState<'draft' | 'saved' | 'error' | ''>('')
  const [authorImages, setAuthorImages] = useState<AdminImageAsset[]>([])
  const update = (key: keyof AdminAuthorForm, value: string) => setForm((current) => ({ ...current, [key]: value }))
  const addAuthorImages = (files: File[], replacePrimary = false) => setAuthorImages((current) => { const assets = files.map((file) => ({ preview: URL.createObjectURL(file), name: file.name, file })); return replacePrimary ? [assets[0], ...current.slice(1)] : [...current, ...assets] })
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const intent = (event.nativeEvent as SubmitEvent).submitter?.getAttribute('value') === 'draft' ? 'draft' : 'saved'
    if (intent === 'draft') { setSaved('draft'); return }
    try {
      const slug = form.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      const roles = form.classification === 'Dịch giả' ? ['translator' as const] : form.classification === 'Họa sĩ minh họa' ? ['illustrator' as const] : ['author' as const]
      const creator = await upsertCreatorProfile({ displayName: form.name, slug, roles, birthYear: form.birthYear ? Number(form.birthYear) : undefined, deathYear: form.deathYear ? Number(form.deathYear) : undefined, awards: form.awards, academicTitle: form.academicTitle, bioHtml: form.bio })
      await saveAdminCreatorImages(creator.id, authorImages.flatMap((asset) => asset.file ? [asset.file] : []))
      setSaved('saved')
    } catch {
      setSaved('error')
    }
  }
  return <AdminSimpleCreateShell title="Thêm nhà sáng tạo nội dung" backHref="/admin/authors" section="NỘI DUNG" description="Nhập hồ sơ nhà sáng tạo nội dung theo dữ liệu Linery đã chuẩn hóa từ Google Sheets." tabs={[{ id: 'creator-profile', label: 'Thông tin hồ sơ' }, { id: 'creator-works', label: 'Tác phẩm và giải thưởng' }, { id: 'creator-bio', label: 'Tiểu sử và liên kết' }]} headerActions={<AdminCreateHeaderActions formId="admin-author-create-form" cancelHref="/admin/authors" saveLabel="Lưu nhà sáng tạo" />}>
    <form id="admin-author-create-form" className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]" onSubmit={submit}>
      <div className="grid min-w-0 gap-4">
        <AdminCreatePanel id="creator-profile" title="Thông tin hồ sơ">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2"><span className="mb-1.5 block font-body text-sm font-medium">Tên nhà sáng tạo<span className="ml-1 text-[var(--color-olive-dark)]">*</span></span><input className="min-h-11 w-full rounded-xl border border-[#dedbd0] bg-[#fcfbf7] px-3.5 font-body text-sm" required value={form.name} onChange={(event) => update('name', event.target.value)} placeholder="Nhập tên hiển thị" /></label>
            <label className="block"><span className="mb-1.5 block font-body text-sm font-medium">Phân loại<span className="ml-1 text-[var(--color-olive-dark)]">*</span></span><select className="min-h-11 w-full rounded-xl border border-[#dedbd0] bg-[#fcfbf7] px-3.5 font-body text-sm" required value={form.classification} onChange={(event) => update('classification', event.target.value as AdminAuthorForm['classification'])}><option value="">Chọn phân loại</option><option value="Tác giả">Tác giả</option><option value="Dịch giả">Dịch giả</option><option value="Họa sĩ minh họa">Họa sĩ minh họa</option></select></label>
            {adminAuthorFormFields.filter((field) => field.key !== 'name' && !['representativeWorks', 'awards', 'academicTitle', 'bio', 'imageLink', 'englishLink'].includes(field.key)).map((field) => <label className="block" key={field.key}><span className="mb-1.5 block font-body text-sm font-medium">{field.label}{field.required && <span className="ml-1 text-[var(--color-olive-dark)]">*</span>}</span><input className="min-h-11 w-full rounded-xl border border-[#dedbd0] bg-[#fcfbf7] px-3.5 font-body text-sm" type={field.input ?? 'text'} required={field.required} value={form[field.key]} onChange={(event) => update(field.key, event.target.value)} />{field.help && <span className="mt-1 block font-body text-xs text-[#8b8d86]">{field.help}</span>}</label>)}
          </div>
        </AdminCreatePanel>
        <AdminCreatePanel id="creator-works" title="Tác phẩm và giải thưởng">
          <div className="grid gap-5"><AdminRichTextEditor label="Tác phẩm tiêu biểu" value={form.representativeWorks} onChange={(value) => update('representativeWorks', value)} placeholder="Nhập các tác phẩm tiêu biểu..." /><label className="block"><span className="mb-1.5 block font-body text-sm font-medium">Awards received</span><textarea className="min-h-28 w-full rounded-xl border border-[#dedbd0] bg-[#fcfbf7] px-3.5 py-3 font-body text-sm" value={form.awards} onChange={(event) => update('awards', event.target.value)} placeholder="Mỗi giải thưởng một dòng, ví dụ: National Book Critics Circle Award (1978)" /><span className="mt-1 block font-body text-xs text-[#8b8d86]">Mỗi dòng là một giải thưởng. Hệ thống sẽ hiển thị thành danh sách trên trang chi tiết.</span></label><label className="block"><span className="mb-1.5 block font-body text-sm font-medium">Academic title</span><textarea className="min-h-24 w-full rounded-xl border border-[#dedbd0] bg-[#fcfbf7] px-3.5 py-3 font-body text-sm" value={form.academicTitle} onChange={(event) => update('academicTitle', event.target.value)} placeholder="Mỗi danh hiệu học thuật một dòng" /><span className="mt-1 block font-body text-xs text-[#8b8d86]">Có thể nhập nhiều dòng nếu hồ sơ có nhiều học hàm hoặc danh hiệu.</span></label></div>
        </AdminCreatePanel>
        <AdminCreatePanel id="creator-bio" title="Tiểu sử và liên kết">
          <div className="grid gap-4"><AdminRichTextEditor label="Giới thiệu nhà sáng tạo nội dung" value={form.bio} onChange={(value) => update('bio', value)} placeholder="Nhập giới thiệu, lĩnh vực hoạt động và ghi chú biên tập..." /><label className="block"><span className="mb-1.5 block font-body text-sm font-medium">Link giới thiệu tiếng Anh</span><input className="min-h-11 w-full rounded-xl border border-[#dedbd0] bg-[#fcfbf7] px-3.5 font-body text-sm" type="url" value={form.englishLink} onChange={(event) => update('englishLink', event.target.value)} placeholder="https://..." /></label></div>
        </AdminCreatePanel>
        {saved && <p className={`rounded-xl border p-3 font-body text-sm ${saved === 'error' ? 'border-[#ebc4bd] bg-[#fff5f2] text-[#a33d32]' : 'border-[#cfe5d1] bg-[#f1f8f1] text-[#39733e]'}`} role="status">{saved === 'draft' ? 'Đã lưu bản nháp nhà sáng tạo nội dung.' : saved === 'error' ? 'Chưa lưu được. Kiểm tra kết nối Supabase và migration creators.' : 'Đã lưu nhà sáng tạo nội dung vào Supabase.'}</p>}
      </div>
      <aside className="admin-create-aside grid content-start gap-4">
        <AdminCreatePanel title="Ảnh đại diện"><AdminImageUploadWithExtras label="Ảnh nhà sáng tạo nội dung" showLabel={false} preview={authorImages[0]?.preview ?? ''} fileName={authorImages[0]?.name} extraItems={authorImages.slice(1)} onPrimaryFileChange={(file) => { update('imageLink', file.name); addAuthorImages([file], true) }} onPrimaryClear={() => { const next = authorImages.slice(1); setAuthorImages(next); update('imageLink', next[0]?.name ?? '') }} onExtraFilesChange={(files) => { if (files[0] && !form.imageLink) update('imageLink', files[0].name); addAuthorImages(files) }} onRemoveExtra={(index) => setAuthorImages((current) => current.filter((_, itemIndex) => itemIndex !== index + 1))} /></AdminCreatePanel>
        <AdminCreatePanel title="Quy tắc hồ sơ"><ul className="list-disc space-y-2 pl-5 font-body text-sm leading-6 text-[#62655f]"><li>Tên hiển thị và phân loại là trường bắt buộc.</li><li>Mỗi giải thưởng nhập thành một dòng để dễ tra soát.</li><li>Ảnh dùng JPG, PNG hoặc WebP, tối đa 5MB.</li></ul></AdminCreatePanel>
      </aside>
      <div className="lg:col-span-2"><AdminFormActions cancelHref="/admin/authors" draftLabel="Lưu nháp" saveLabel="Lưu nhà sáng tạo nội dung" /></div>
    </form>
  </AdminSimpleCreateShell>
}

function AdminCreatePanel({ id, title, children, className = '' }: { id?: string; title: string; children: ReactNode; className?: string }) {
  return <section id={id} className={`admin-create-panel scroll-mt-24 overflow-visible rounded-xl border border-[#e2e5ee] bg-white ${className}`}><div className="border-b border-[#e2e5ee] bg-[#eef0f7] px-4 py-3"><h2 className="font-body text-sm font-semibold text-[var(--color-ink)]">{title}</h2></div><div className="p-4 sm:p-5">{children}</div></section>
}

function AdminCreateTabs({ tabs }: { tabs: Array<{ id: string; label: string }> }) {
  return <nav className="admin-create-tabs flex items-center gap-1 overflow-x-auto border-b border-[#e5e2d7] bg-white px-4 sm:px-5 lg:px-6" aria-label="Các khu vực biểu mẫu">{tabs.map((tab, index) => <a className={`shrink-0 border-b-2 px-4 py-3 font-body text-sm ${index === 0 ? 'border-[var(--color-olive)] font-semibold text-[var(--color-olive-dark)]' : 'border-transparent text-[#74776f] hover:border-[#c9c5a5] hover:text-[var(--color-ink)]'}`} href={`#${tab.id}`} key={tab.id}>{tab.label}</a>)}</nav>
}

function AdminCreateHeaderActions({ formId, cancelHref, draftLabel = 'Lưu nháp', saveLabel, saving = false }: { formId: string; cancelHref: string; draftLabel?: string; saveLabel: string; saving?: boolean }) {
  return <div className="admin-create-header-actions flex flex-nowrap items-center justify-end gap-2"><button className="inline-flex min-h-9 shrink-0 items-center justify-center whitespace-nowrap rounded-lg border border-[var(--color-olive)] px-3.5 font-body text-sm font-medium text-[var(--color-olive-dark)] hover:bg-[rgba(155,148,47,.08)] disabled:cursor-wait disabled:opacity-60" form={formId} name="intent" type="submit" value="draft" disabled={saving}>{saving ? 'Đang lưu…' : draftLabel}</button><button className="admin-primary-action inline-flex min-h-9 shrink-0 items-center justify-center whitespace-nowrap rounded-lg bg-[var(--color-olive)] px-3.5 font-body text-sm font-medium text-white hover:bg-[var(--color-olive-dark)] disabled:cursor-wait disabled:opacity-60" form={formId} name="intent" type="submit" value="saved" disabled={saving}>{saving ? 'Đang lưu…' : saveLabel}</button><a className={`inline-flex min-h-9 shrink-0 items-center justify-center whitespace-nowrap rounded-lg border border-[#dedbd0] px-3.5 font-body text-sm text-[var(--color-ink)] hover:bg-[#f6f5ed] ${saving ? 'pointer-events-none opacity-60' : ''}`} href={cancelHref} aria-disabled={saving}>Hủy</a></div>
}

function AdminBrand({ compact = false }: { compact?: boolean }) {
  return <span className={`admin-brand ${compact ? 'admin-brand-compact' : ''}`}><img src="/assets/linerybooks-logo-pixel-bg.svg" alt="LineryBooks" /><span>LineryBooks</span></span>
}

function AdminSidebarFooter() {
  return <div className="admin-sidebar-footer mt-auto shrink-0 border-t border-[#eeeae0] p-4"><a className="flex items-center gap-3 rounded-xl px-3 py-2.5 font-body text-sm text-[#62655f] transition-colors hover:bg-[#f5f3ec] hover:text-[var(--color-ink)]" href="/#home"><i className="bi bi-arrow-left" aria-hidden="true" />Về cửa hàng</a></div>
}

function AdminNotificationButton() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<AdminNotificationRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const unread = notifications.filter((notification) => !notification.readAt).length
  useEffect(() => {
    let active = true
    setLoading(true)
    void loadAdminNotifications().then((rows) => { if (active) setNotifications(rows) }).catch((reason) => { if (active) setError(reason instanceof Error ? reason.message : 'Chưa tải được thông báo.') }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])
  const markRead = async (id: string) => {
    try { await markAdminNotificationRead(id); setNotifications((rows) => rows.map((row) => row.id === id ? { ...row, readAt: new Date().toISOString() } : row)) } catch (reason) { setError(reason instanceof Error ? reason.message : 'Không đánh dấu được thông báo.') }
  }
  const markAllRead = async () => {
    try { await markAllAdminNotificationsRead(); const now = new Date().toISOString(); setNotifications((rows) => rows.map((row) => ({ ...row, readAt: row.readAt ?? now }))) } catch (reason) { setError(reason instanceof Error ? reason.message : 'Không đánh dấu được thông báo.') }
  }
  return <div className="relative">
    <button className="admin-header-icon inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#dedbd0] bg-white text-[var(--color-ink)] transition-colors hover:border-[var(--color-olive)] hover:bg-[#f5f3ec]" type="button" aria-label="Thông báo" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
      <i className="bi bi-bell" aria-hidden="true" />
      {unread > 0 && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#c45b3a]" aria-label={`${unread} thông báo chưa đọc`} />}
    </button>
    {open && <div className="admin-notification-panel absolute right-0 top-12 z-50 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-[#e6e2d7] bg-white shadow-[0_16px_40px_rgba(31,42,36,.14)]" role="dialog" aria-label="Thông báo quản trị">
      <div className="flex items-center justify-between border-b border-[#eeeae0] px-4 py-3"><div><h2 className="font-body text-sm font-semibold text-[var(--color-ink)]">Thông báo</h2><p className="mt-0.5 font-body text-xs text-[#8b8d86]">Hoạt động mới của hệ thống</p></div><button className="font-body text-xs text-[var(--color-olive-dark)] disabled:cursor-not-allowed disabled:opacity-40" type="button" disabled={unread === 0} onClick={() => void markAllRead()}>Đánh dấu đã đọc</button></div>
      {error && <p className="border-b border-[#eeeae0] bg-[#fff4ec] px-4 py-3 font-body text-xs leading-5 text-[#9a4c2d]">Chưa kết nối dữ liệu thông báo. Hãy chạy migration `admin_notifications` trên Supabase.</p>}
      {loading ? <div className="px-4 py-8 text-center font-body text-sm text-[#8b8d86]">Đang tải thông báo…</div> : notifications.length > 0 ? <div className="max-h-80 divide-y divide-[#eeeae0] overflow-y-auto">{notifications.map((notification) => <button className={`flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-[#faf9f4] ${notification.readAt ? '' : 'bg-[#fcfbf7]'}`} key={notification.id} type="button" onClick={() => void markRead(notification.id)}><span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f5f3ec] text-[var(--color-olive-dark)]"><i className={`bi ${notification.eventType === 'order' ? 'bi-bag' : notification.eventType === 'content' ? 'bi-pencil-square' : 'bi-bell'}`} aria-hidden="true" /></span><span className="min-w-0 flex-1"><strong className="block font-body text-sm font-semibold text-[var(--color-ink)]">{notification.title}</strong><span className="mt-0.5 block font-body text-xs leading-5 text-[#62655f]">{notification.message}</span><small className="mt-1 block font-body text-[11px] text-[#9a9b94]">{notification.createdAt ? new Date(notification.createdAt).toLocaleString('vi-VN') : '—'}</small></span>{!notification.readAt && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#c45b3a]" aria-label="Chưa đọc" />}</button>)}</div> : <div className="px-4 py-8 text-center"><span className="mx-auto inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#f5f3ec] text-[var(--color-olive-dark)]"><i className="bi bi-bell-slash" aria-hidden="true" /></span><p className="mt-3 font-body text-sm font-medium text-[var(--color-ink)]">Chưa có thông báo mới</p><p className="mt-1 font-body text-xs leading-5 text-[#8b8d86]">Thông báo đẩy sẽ xuất hiện ở đây sau khi kết nối OneSignal.</p></div>}
    </div>}
  </div>
}

function AdminShell({ title, section, children, headerActions, tabs = [] }: { title: string; section: string; children: ReactNode; headerActions?: ReactNode; tabs?: Array<{ id: string; label: string }> }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const pathname = window.location.pathname
  return <div className={`admin-shell ${collapsed ? 'admin-sidebar-collapsed' : ''} flex min-h-screen bg-[#f7f7f2] text-[var(--color-ink)]`}><aside className={`admin-sidebar fixed inset-y-0 left-0 z-40 flex w-72 -translate-x-full flex-col border-r border-[#e5e2d7] bg-white transition-[transform,width] duration-300 lg:static lg:translate-x-0 ${sidebarOpen ? 'is-open translate-x-0' : ''}`}><div className="flex h-16 shrink-0 items-center justify-between border-b border-[#eeeae0] px-5"><a className="admin-brand-link" href="/admin" aria-label="LineryBooks - trang quản trị"><AdminBrand /></a><button className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#dedbd0] text-[var(--color-ink)] lg:hidden" type="button" aria-label="Đóng menu quản trị" onClick={() => setSidebarOpen(false)}><i className="bi bi-x-lg" aria-hidden="true" /></button></div><AdminManagementSidebar pathname={pathname} /></aside><button className="admin-sidebar-collapse" type="button" aria-label={collapsed ? 'Mở rộng menu quản trị' : 'Thu gọn menu quản trị'} onClick={() => setCollapsed((value) => !value)}><i className={`bi ${collapsed ? 'bi-chevron-right' : 'bi-chevron-left'}`} aria-hidden="true" /></button>{sidebarOpen && <button className="fixed inset-0 z-30 bg-[rgba(31,42,36,.32)] lg:hidden" type="button" aria-label="Đóng menu quản trị" onClick={() => setSidebarOpen(false)} />}<div className="min-w-0 flex-1"><header className="admin-header flex min-h-16 items-center justify-between gap-3 border-b border-[#e5e2d7] bg-white px-4 sm:px-5 lg:px-6"><div className="flex min-w-0 items-center gap-2"><button className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#dedbd0] text-[var(--color-ink)] lg:hidden" type="button" aria-label="Mở menu quản trị" onClick={() => setSidebarOpen(true)}><i className="bi bi-list" aria-hidden="true" /></button><div className="min-w-0"><p className="admin-header-kicker font-body text-xs text-[#8b8d86]">Quản trị</p><h1 className="truncate font-body text-lg font-semibold tracking-tight">{title}</h1></div></div><div className="flex items-center gap-2">{headerActions}<AdminNotificationButton /><button className="admin-user-avatar inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-olive)] font-body text-sm font-semibold text-white" type="button" aria-label="Thông tin quản trị viên">K</button></div></header>{tabs.length > 0 && <AdminCreateTabs tabs={tabs} />}<main className="w-full p-3 sm:p-4 lg:p-5"><div className="admin-breadcrumb mb-4 flex items-center gap-2 font-body text-sm text-[#8b8d86]"><a className="hover:text-[var(--color-olive-dark)]" href="/admin">Quản trị</a><i className="bi bi-chevron-right text-xs" aria-hidden="true" /><span>{section}</span><i className="bi bi-chevron-right text-xs" aria-hidden="true" /><span className="font-medium text-[var(--color-ink)]">{title}</span></div>{children}</main></div></div>
}

function AdminSimpleCreateShell({ title, section, description: _description, backHref: _backHref, tabs = [], showTabs = true, headerActions, children }: { title: string; section: string; description: string; backHref: string; tabs?: Array<{ id: string; label: string }>; showTabs?: boolean; headerActions?: ReactNode; children: ReactNode }) {
  return <AdminShell title={title} section={section} tabs={showTabs ? tabs : []} headerActions={headerActions}><section className="rounded-2xl border border-[#e6e2d7] bg-white p-3 shadow-[0_8px_24px_rgba(31,42,36,.035)] sm:p-4">{children}</section></AdminShell>
}

function AdminRichTextEditor({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder: string }) {
  const editorRef = useRef<HTMLDivElement | null>(null)
  const runCommand = (command: string, commandValue?: string) => {
    editorRef.current?.focus()
    document.execCommand(command, false, commandValue)
    if (editorRef.current) onChange(editorRef.current.innerHTML)
  }
  return <div className="sm:col-span-2 lg:col-span-3"><span className="mb-1.5 block font-body text-sm font-medium">{label}</span><div className="overflow-hidden rounded-xl border border-[#dedbd0] bg-white focus-within:border-[var(--color-olive)] focus-within:ring-2 focus-within:ring-[rgba(155,148,47,.14)]"><div className="flex flex-wrap gap-1 border-b border-[#eeeae0] bg-[#fcfbf7] p-2" role="toolbar" aria-label={`Thanh công cụ ${label}`}><button className="inline-flex h-8 w-8 items-center justify-center rounded-lg font-body text-sm hover:bg-[#f0eee5]" type="button" aria-label="In đậm" onClick={() => runCommand('bold')}><i className="bi bi-type-bold" aria-hidden="true" /></button><button className="inline-flex h-8 w-8 items-center justify-center rounded-lg font-body text-sm hover:bg-[#f0eee5]" type="button" aria-label="In nghiêng" onClick={() => runCommand('italic')}><i className="bi bi-type-italic" aria-hidden="true" /></button><button className="inline-flex h-8 w-8 items-center justify-center rounded-lg font-body text-sm hover:bg-[#f0eee5]" type="button" aria-label="Danh sách" onClick={() => runCommand('insertUnorderedList')}><i className="bi bi-list-ul" aria-hidden="true" /></button><button className="inline-flex h-8 w-8 items-center justify-center rounded-lg font-body text-sm hover:bg-[#f0eee5]" type="button" aria-label="Danh sách đánh số" onClick={() => runCommand('insertOrderedList')}><i className="bi bi-list-ol" aria-hidden="true" /></button><button className="inline-flex h-8 w-8 items-center justify-center rounded-lg font-body text-sm hover:bg-[#f0eee5]" type="button" aria-label="Trích dẫn" onClick={() => runCommand('formatBlock', 'blockquote')}><i className="bi bi-chat-square-quote" aria-hidden="true" /></button><button className="inline-flex h-8 w-8 items-center justify-center rounded-lg font-body text-sm hover:bg-[#f0eee5]" type="button" aria-label="Xóa định dạng" onClick={() => runCommand('removeFormat')}><i className="bi bi-eraser" aria-hidden="true" /></button></div><div ref={editorRef} className="min-h-40 p-4 font-body text-sm leading-7 outline-none" contentEditable suppressContentEditableWarning data-placeholder={placeholder} onInput={(event) => onChange(event.currentTarget.innerHTML)} role="textbox" aria-multiline="true" aria-label={label} /></div><span className="mt-1 block font-body text-xs text-[#8b8d86]">Có thể định dạng chữ đậm, nghiêng, danh sách và trích dẫn.</span></div>
}

function AdminCkEditor({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder: string }) {
  return <div className="admin-ckeditor sm:col-span-2 lg:col-span-3"><span className="mb-1.5 block font-body text-sm font-medium">{label}</span><div className="overflow-hidden rounded-xl border border-[#dedbd0] bg-white focus-within:border-[var(--color-olive)] focus-within:ring-2 focus-within:ring-[rgba(155,148,47,.14)]"><Suspense fallback={<div className="min-h-[280px] p-4 font-body text-sm text-[#8b8d86]">Đang tải trình soạn thảo…</div>}><LazyCkEditor data={value} config={{ placeholder, toolbar: ['undo', 'redo', '|', 'heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote', 'insertTable'] }} onChange={(_event: unknown, editor: any) => onChange(editor.getData())} /></Suspense></div><span className="mt-1 block font-body text-xs text-[#8b8d86]">CKEditor miễn phí với heading, định dạng chữ, liên kết, danh sách, trích dẫn và bảng.</span></div>
}

function readEditorJsData(value: string) {
  try {
    const parsed = JSON.parse(value) as { blocks?: unknown[] }
    return Array.isArray(parsed.blocks) ? parsed : undefined
  } catch {
    return undefined
  }
}

const publicBlocksToEditorJsData = (value: string) => {
  const parsed = readEditorJsData(value)
  if (!parsed) return undefined
  return {
    ...parsed,
    blocks: (parsed.blocks as Array<Record<string, unknown>>).map((block, index) => {
      if (block.data && typeof block.data === 'object') return block
      const type = String(block.type ?? 'paragraph')
      if (type === 'image') {
        return {
          id: String(block.id ?? `editor-${index}`),
          type: 'image',
          data: {
            file: { url: String(block.image ?? '') },
            caption: String(block.caption ?? ''),
            alt: String(block.alt ?? ''),
          },
        }
      }
      if (type === 'heading') {
        return { id: String(block.id ?? `editor-${index}`), type: 'header', data: { text: String(block.content ?? ''), level: 2 } }
      }
      if (type === 'quote') {
        return { id: String(block.id ?? `editor-${index}`), type: 'quote', data: { text: String(block.content ?? ''), caption: '' } }
      }
      return { id: String(block.id ?? `editor-${index}`), type: 'paragraph', data: { text: String(block.content ?? '') } }
    }),
  }
}

class EditorJsImagePreviewTool {
  private data: { file?: { url?: string }; url?: string; caption?: string; alt?: string }
  private image: HTMLImageElement | null = null
  private urlInput: HTMLInputElement | null = null
  private captionInput: HTMLInputElement | null = null
  private altInput: HTMLInputElement | null = null

  static get toolbox() {
    return { title: 'Ảnh', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9" r="1.3"/><path d="m4 17 4.5-4.5 3.2 3.2 2.4-2.4L20 19"/></svg>' }
  }

  constructor({ data }: { data?: Record<string, unknown> }) {
    const file = data?.file && typeof data.file === 'object' ? data.file as { url?: string } : undefined
    this.data = { file, url: String(data?.url ?? ''), caption: String(data?.caption ?? ''), alt: String(data?.alt ?? '') }
  }

  render() {
    const wrapper = document.createElement('div')
    wrapper.className = 'admin-editorjs-image-tool'
    const preview = document.createElement('div')
    preview.className = 'admin-editorjs-image-preview'
    this.image = document.createElement('img')
    this.image.className = 'admin-editorjs-image-preview-media'
    this.image.alt = this.data.alt ?? ''
    this.image.hidden = true
    this.image.addEventListener('error', () => {
      this.image?.classList.add('is-broken')
      this.image?.removeAttribute('src')
      this.image?.setAttribute('alt', 'Không tải được ảnh')
    })
    preview.append(this.image)
    const empty = document.createElement('span')
    empty.className = 'admin-editorjs-image-empty'
    empty.textContent = 'Nhập đường dẫn ảnh để xem trước'
    preview.append(empty)
    wrapper.append(preview)

    const fields = document.createElement('div')
    fields.className = 'admin-editorjs-image-fields'
    this.urlInput = document.createElement('input')
    this.urlInput.className = 'admin-editorjs-image-input'
    this.urlInput.type = 'url'
    this.urlInput.placeholder = 'Đường dẫn ảnh (URL hoặc /assets/...)'
    this.urlInput.value = this.data.file?.url || this.data.url || ''
    this.captionInput = document.createElement('input')
    this.captionInput.className = 'admin-editorjs-image-input'
    this.captionInput.placeholder = 'Chú thích ảnh (không bắt buộc)'
    this.captionInput.value = this.data.caption ?? ''
    this.altInput = document.createElement('input')
    this.altInput.className = 'admin-editorjs-image-input'
    this.altInput.placeholder = 'Mô tả ảnh cho khả năng truy cập'
    this.altInput.value = this.data.alt ?? ''
    fields.append(this.urlInput, this.captionInput, this.altInput)
    wrapper.append(fields)

    const updatePreview = () => {
      const url = this.urlInput?.value.trim() ?? ''
      if (!this.image || !url) {
        if (this.image) this.image.hidden = true
        empty.hidden = false
        return
      }
      this.image.hidden = false
      this.image.classList.remove('is-broken')
      this.image.src = url
      this.image.alt = this.altInput?.value.trim() ?? ''
      empty.hidden = true
    }
    this.urlInput.addEventListener('input', updatePreview)
    this.altInput.addEventListener('input', updatePreview)
    updatePreview()
    return wrapper
  }

  save() {
    return {
      file: { url: this.urlInput?.value.trim() ?? '' },
      caption: this.captionInput?.value.trim() ?? '',
      alt: this.altInput?.value.trim() ?? '',
    }
  }
}

function AdminEditorJs({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder: string }) {
  const holderId = useRef(`admin-emagazine-${Math.random().toString(36).slice(2)}`).current
  const holderRef = useRef<HTMLDivElement | null>(null)
  const editorRef = useRef<any>(null)
  useEffect(() => {
    let disposed = false
    let editor: any
    Promise.all([
      import('@editorjs/editorjs'),
      import('@editorjs/header'),
      import('@editorjs/list'),
      import('@editorjs/quote'),
      import('@editorjs/delimiter'),
      import('@editorjs/table'),
    ]).then(([editorModule, headerModule, listModule, quoteModule, delimiterModule, tableModule]) => {
      if (disposed) return
      const EditorJS = editorModule.default
      const EditorJsHeader = headerModule.default
      const List = listModule.default
      const Quote = quoteModule.default
      const Delimiter = delimiterModule.default
      const Table = tableModule.default
      editor = new (EditorJS as any)({
        holder: holderRef.current ?? holderId,
        autofocus: false,
        placeholder,
        data: publicBlocksToEditorJsData(value) as any,
        tools: {
          image: { class: EditorJsImagePreviewTool as any },
          header: { class: EditorJsHeader as any, inlineToolbar: true, config: { levels: [2, 3, 4], defaultLevel: 2 } },
          list: { class: List, inlineToolbar: true, config: { defaultStyle: 'unordered' } },
          quote: { class: Quote, inlineToolbar: true },
          delimiter: Delimiter,
          table: { class: Table as any, inlineToolbar: true, config: { rows: 3, cols: 3 } },
        },
        onChange: async () => {
          if (disposed) return
          const saved = await editor.save()
          if (!disposed) onChange(JSON.stringify(saved))
        },
      })
      editorRef.current = editor
    })
    return () => {
      disposed = true
      editorRef.current = null
      if (editor && typeof editor.destroy === 'function') void editor.destroy()
    }
  }, [holderId, placeholder])
  return <div className="admin-editorjs sm:col-span-2 lg:col-span-3"><span className="mb-1.5 block font-body text-sm font-medium">{label}</span><div id={holderId} ref={holderRef} className="admin-editorjs-surface rounded-xl border border-[#dedbd0] bg-white" /><span className="mt-1 block font-body text-xs text-[#8b8d86]">Editor.js lưu nội dung theo block để tạo bài eMagazine longform trực quan.</span></div>
}

function AdminImageUpload({ label, preview, fileName, onFileChange, onClear, showLabel = true }: { label: string; preview: string; fileName?: string; onFileChange: (file: File) => void; onClear: () => void; showLabel?: boolean }) {
  const inputId = `admin-image-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
  const accept = 'image/png,image/jpeg,image/webp'
  const handleFiles = (files: FileList | null) => { const file = files?.[0]; if (file && file.type.startsWith('image/')) onFileChange(file) }
  return <div className="w-full"><>{showLabel && <span className="mb-1.5 block font-body text-sm font-medium">{label}</span>}</><input id={inputId} className="sr-only" type="file" accept={accept} onChange={(event) => { handleFiles(event.currentTarget.files); event.currentTarget.value = '' }} /><label htmlFor={inputId} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); handleFiles(event.dataTransfer.files) }} className={`group relative flex min-h-48 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed px-5 py-7 text-center transition ${preview ? 'border-[var(--color-olive)] bg-[rgba(155,148,47,.05)]' : 'border-[#d8d5c8] bg-[#fcfbf7] hover:border-[var(--color-olive)] hover:bg-[rgba(155,148,47,.05)]'}`}>{preview ? <><img className="absolute inset-0 h-full w-full object-contain" src={preview} alt={`Xem trước ${label.toLowerCase()}`} /><span className="absolute inset-0 bg-[rgba(31,42,36,.42)] opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100" aria-hidden="true" /><span className="relative z-10 inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 font-body text-xs font-semibold text-[var(--color-ink)] opacity-0 shadow-sm transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"><i className="bi bi-arrow-repeat" aria-hidden="true" />Đổi ảnh</span></> : <><span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-xl text-[var(--color-olive)] shadow-sm ring-1 ring-[#e6e2d7]"><i className="bi bi-cloud-arrow-up" aria-hidden="true" /></span><span className="mt-3 font-body text-sm font-semibold text-[var(--color-ink)]">Kéo thả ảnh vào đây</span><span className="mt-1 font-body text-xs text-[#8b8d86]">hoặc bấm để chọn từ máy tính</span><span className="mt-3 rounded-lg border border-[#dedbd0] bg-white px-3 py-1.5 font-body text-xs font-medium text-[#62655f] group-hover:border-[var(--color-olive)]">Chọn ảnh</span></>}</label>{preview && <div className="mt-3 flex items-center gap-3 rounded-xl border border-[#e6e2d7] bg-white p-3"><div className="min-w-0 flex-1"><p className="truncate font-body text-sm font-medium">{fileName || 'Ảnh đã chọn'}</p><p className="mt-0.5 font-body text-xs text-[#8b8d86]">Bấm vào ảnh để đổi · JPG, PNG hoặc WebP</p></div><button className="inline-flex h-9 items-center justify-center rounded-lg border border-[#dedbd0] px-3 font-body text-xs font-medium text-[#62655f] hover:border-[#a33d32] hover:text-[#a33d32]" type="button" onClick={onClear}>Xóa ảnh</button></div>}<p className="mt-2 font-body text-xs text-[#8b8d86]">Tối đa 5MB · Không nhập URL</p></div>
}

function AdminSampleUpload({ fileName, onFileChange, onClear }: { fileName?: string; onFileChange: (file: File) => void; onClear: () => void }) {
  const inputId = 'admin-book-reading-sample'
  const handleFile = (file: File | undefined) => {
    if (!file) return
    const validType = /application\/pdf/i.test(file.type) || /application\/epub\+zip/i.test(file.type) || /\.(pdf|epub)$/i.test(file.name)
    if (validType && file.size <= 50 * 1024 * 1024) onFileChange(file)
  }
  return <div className="w-full"><span className="mb-1.5 block font-body text-sm font-medium">File đọc thử</span><input id={inputId} className="sr-only" type="file" accept="application/pdf,application/epub+zip,.pdf,.epub" onChange={(event) => { handleFile(event.currentTarget.files?.[0]); event.currentTarget.value = '' }} /><label htmlFor={inputId} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); handleFile(event.dataTransfer.files?.[0]) }} className="flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#d8d5c8] bg-[#fcfbf7] px-4 py-5 text-center transition hover:border-[var(--color-olive)] hover:bg-[rgba(155,148,47,.05)]"><span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white text-lg text-[var(--color-olive)] shadow-sm ring-1 ring-[#e6e2d7]"><i className="bi bi-file-earmark-pdf" aria-hidden="true" /></span><span className="mt-2 max-w-full truncate px-2 font-body text-sm font-semibold text-[var(--color-ink)]">{fileName || 'Chọn PDF hoặc EPUB'}</span><span className="mt-1 font-body text-xs text-[#8b8d86]">Kéo thả hoặc bấm để chọn · tối đa 50MB</span></label>{fileName && <button className="mt-2 inline-flex min-h-9 items-center justify-center rounded-lg border border-[#dedbd0] px-3 font-body text-xs font-medium text-[#62655f] hover:border-[#a33d32] hover:text-[#a33d32]" type="button" onClick={onClear}>Xóa file đọc thử</button>}</div>
}

type AdminImageAsset = { preview: string; name: string; dataUrl?: string; file?: File }

function AdminImageGalleryUpload({ label, items, onFilesChange, onRemove, showLabel = true }: { label: string; items: AdminImageAsset[]; onFilesChange: (files: File[]) => void; onRemove: (index: number) => void; showLabel?: boolean }) {
  const inputId = `admin-gallery-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
  const accept = 'image/png,image/jpeg,image/webp'
  const handleFiles = (files: FileList | null) => { const images = Array.from(files ?? []).filter((file) => file.type.startsWith('image/')); if (images.length) onFilesChange(images) }
  return <div className="w-full">{showLabel && <span className="mb-1.5 block font-body text-sm font-medium">{label}</span>}<input id={inputId} className="sr-only" type="file" accept={accept} multiple onChange={(event) => { handleFiles(event.target.files); event.target.value = '' }} /><div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{items.map((item, index) => <div className="group relative aspect-[3/4] overflow-hidden rounded-xl border border-[var(--color-olive)] bg-[#fcfbf7]" key={`${item.name}-${index}`}><img className="h-full w-full object-contain" src={item.preview} alt={`${label} ${index + 1}`} /><button className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-[#a33d32] shadow-sm opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100" type="button" aria-label={`Xóa ${label} ${index + 1}`} onClick={() => onRemove(index)}><i className="bi bi-trash3" aria-hidden="true" /></button><span className="absolute inset-x-0 bottom-0 truncate bg-[rgba(31,42,36,.72)] px-2 py-1.5 font-body text-[11px] text-white">{item.name}</span></div>)}<label htmlFor={inputId} className="group flex aspect-[3/4] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#d8d5c8] bg-[#fcfbf7] px-3 text-center transition hover:border-[var(--color-olive)] hover:bg-[rgba(155,148,47,.05)]"><span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-lg text-[var(--color-olive)] shadow-sm ring-1 ring-[#e6e2d7]"><i className="bi bi-plus-lg" aria-hidden="true" /></span><span className="mt-2 font-body text-xs font-semibold text-[var(--color-ink)]">Thêm ảnh</span><span className="mt-1 font-body text-[11px] text-[#8b8d86]">Có thể chọn nhiều ảnh</span></label></div><p className="mt-2 font-body text-xs text-[#8b8d86]">JPG, PNG hoặc WebP · tối đa 5MB mỗi ảnh · bấm “Thêm ảnh” để upload tiếp</p></div>
}

function AdminImageUploadWithExtras({ label, preview, fileName, extraItems, onPrimaryFileChange, onPrimaryClear, onExtraFilesChange, onRemoveExtra, showLabel = true }: { label: string; preview: string; fileName?: string; extraItems: AdminImageAsset[]; onPrimaryFileChange: (file: File) => void; onPrimaryClear: () => void; onExtraFilesChange: (files: File[]) => void; onRemoveExtra: (index: number) => void; showLabel?: boolean }) {
  const inputId = `admin-extra-images-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
  return <div><AdminImageUpload label={label} preview={preview} fileName={fileName} onFileChange={onPrimaryFileChange} onClear={onPrimaryClear} showLabel={showLabel} /><input id={inputId} className="sr-only" type="file" accept="image/png,image/jpeg,image/webp" multiple onChange={(event) => { onExtraFilesChange(Array.from(event.target.files ?? []).filter((file) => file.type.startsWith('image/'))); event.target.value = '' }} /><div className="mt-3"><label htmlFor={inputId} className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-[var(--color-olive)] px-3.5 font-body text-sm font-medium text-[var(--color-olive-dark)] hover:bg-[rgba(155,148,47,.08)]"><i className="bi bi-plus-lg" aria-hidden="true" />Thêm ảnh</label>{extraItems.length > 0 && <div className="mt-3 grid grid-cols-4 gap-2">{extraItems.map((item, index) => <div className="group relative aspect-[3/4] overflow-hidden rounded-lg border border-[#e6e2d7] bg-[#fcfbf7]" key={`${item.name}-${index}`}><img className="h-full w-full object-contain" src={item.preview} alt={`${label} bổ sung ${index + 1}`} /><button className="absolute right-1 top-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/95 text-[#a33d32] opacity-0 shadow-sm transition-opacity group-hover:opacity-100 focus:opacity-100" type="button" aria-label={`Xóa ${label} bổ sung ${index + 1}`} onClick={() => onRemoveExtra(index)}><i className="bi bi-x" aria-hidden="true" /></button></div>)}</div>}</div></div>
}

function AdminFormActions({ cancelHref, cancelLabel = 'Hủy', draftLabel, saveLabel }: { cancelHref: string; cancelLabel?: string; draftLabel?: string; saveLabel: string }) {
  return <div className="admin-form-actions"><div><a className="inline-flex items-center justify-center border border-[#dedbd0] font-body text-sm text-[var(--color-ink)] hover:bg-[#f6f5ed]" href={cancelHref}>{cancelLabel}</a>{draftLabel && <button className="inline-flex items-center justify-center border border-[var(--color-olive)] font-body text-sm font-medium text-[var(--color-olive-dark)] hover:bg-[rgba(155,148,47,.08)]" type="button">{draftLabel}</button>}<button className="admin-primary-action inline-flex items-center justify-center bg-[var(--color-olive)] font-body text-sm font-medium text-white hover:bg-[var(--color-olive-dark)]" type="submit">{saveLabel}</button></div></div>
}

function AdminAuthorsRestoredPage({ pathname }: { pathname: string }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const authorFromUrl = new URLSearchParams(window.location.search).get('author') ?? (pathname.startsWith('/admin/authors/') ? pathname.split('/').pop() ?? '' : '')
  const [view, setView] = useState<'cards' | 'table' | 'detail'>(authorFromUrl ? 'detail' : 'cards')
  const [query, setQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedId, setSelectedId] = useState(authorFromUrl || 'edward-w-said')
  const [ascending, setAscending] = useState(true)
  const [pageSize, setPageSize] = useState(10)
  const [catalogBooks, setCatalogBooks] = useState<AdminCatalogBook[]>(readAdminCatalogBooks)
  const [publicCatalogProducts, setPublicCatalogProducts] = useState<PublicCatalogProduct[]>([])
  const [bookView, setBookView] = useState<'list' | 'grid'>('list')
  const [creatorProfiles, setCreatorProfiles] = useState<AdminCreatorRow[]>([])
  const [creatorLoading, setCreatorLoading] = useState(true)
  const [creatorError, setCreatorError] = useState('')
  useEffect(() => {
    let cancelled = false
    loadPublicCatalogProducts().then((products) => {
      if (!cancelled && products) setPublicCatalogProducts(products)
    }).catch(() => undefined)
    loadAdminCreators().then((profiles) => {
      if (cancelled) return
      setCreatorProfiles(profiles)
    }).catch((error: unknown) => {
      if (!cancelled) setCreatorError(error instanceof Error ? error.message : 'Không tải được dữ liệu nhà sáng tạo.')
    }).finally(() => { if (!cancelled) setCreatorLoading(false) })
    return () => { cancelled = true }
  }, [])
  useEffect(() => {
    const syncBooks = () => setCatalogBooks(readAdminCatalogBooks())
    window.addEventListener('storage', syncBooks)
    window.addEventListener('linery-admin-books-changed', syncBooks)
    return () => { window.removeEventListener('storage', syncBooks); window.removeEventListener('linery-admin-books-changed', syncBooks) }
  }, [])
  useEffect(() => {
    const sidebar = document.querySelector<HTMLElement>('.admin-shell .admin-sidebar')
    const shell = sidebar?.closest<HTMLElement>('.admin-shell')
    if (!sidebar || !shell || sidebar.querySelector('.admin-sidebar-collapse')) return
    const button = document.createElement('button')
    button.className = 'admin-sidebar-collapse'
    button.type = 'button'
    button.setAttribute('aria-label', 'Thu gọn menu quản trị')
    const icon = document.createElement('i')
    icon.className = 'bi bi-chevron-left'
    icon.setAttribute('aria-hidden', 'true')
    button.append(icon)
    const toggle = () => {
      const collapsed = shell.classList.toggle('admin-sidebar-collapsed')
      icon.className = `bi ${collapsed ? 'bi-chevron-right' : 'bi-chevron-left'}`
      button.setAttribute('aria-label', collapsed ? 'Mở rộng menu quản trị' : 'Thu gọn menu quản trị')
    }
    button.addEventListener('click', toggle)
    sidebar.append(button)
    return () => { button.removeEventListener('click', toggle); button.remove() }
  }, [])
  const sourceAuthors: AdminAuthorRecord[] = creatorProfiles.map((profile) => ({ id: profile.id, name: profile.name, slug: profile.slug, role: formatCreatorRoles(profile.roles), books: publicCatalogProducts.filter((book) => book.author === profile.name || book.translators.includes(profile.name) || book.illustrators.includes(profile.name)).length, email: '—', status: profile.status, image: profile.image || '/assets/author-avatar-placeholder.png', bio: profile.bio, awards: profile.awards, academicTitle: profile.academicTitle, birthYear: profile.birthYear, deathYear: profile.deathYear }))
  const authors = sourceAuthors
    .map((author) => ({ ...author, image: author.image || '/assets/author-edward-w-said.png' }))
    .filter((author) => `${author.name} ${author.slug} ${author.role}`.toLowerCase().includes(query.trim().toLowerCase()))
    .filter((author) => roleFilter === 'all' || author.role.split(' · ').includes(roleFilter))
    .filter((author) => statusFilter === 'all' || author.status === statusFilter)
    .sort((a, b) => ascending ? a.name.localeCompare(b.name, 'vi') : b.name.localeCompare(a.name, 'vi'))
  useEffect(() => {
    const fallback = '/assets/author-avatar-placeholder.png'
    const images = Array.from(document.querySelectorAll<HTMLImageElement>('.admin-shell main > section.mt-6.grid:has(> article) img'))
    const handleError = (event: Event) => {
      const image = event.currentTarget as HTMLImageElement
      if (image.dataset.avatarFallback === 'true') return
      image.dataset.avatarFallback = 'true'
      image.src = fallback
    }
    images.forEach((image) => image.addEventListener('error', handleError))
    return () => images.forEach((image) => image.removeEventListener('error', handleError))
  }, [authors, view])
  const selected = authors.find((author) => author.id === selectedId) ?? authors[0] ?? { id: '', name: 'Chưa chọn nhà sáng tạo', slug: '', role: 'Nhà sáng tạo', books: 0, email: '—', status: 'Đang hoạt động' as const, image: '/assets/author-avatar-placeholder.png', bio: '', awards: '', academicTitle: '', birthYear: null, deathYear: null }
  const selectedProfile = creatorProfiles.find((profile) => profile.id === selected.id)
  const [creatorDraft, setCreatorDraft] = useState({ name: '', slug: '', roles: [] as AdminCreatorRow['roles'], bio: '', awards: '', academicTitle: '', birthYear: '', deathYear: '', isActive: true })
  const [creatorImageFile, setCreatorImageFile] = useState<File | null>(null)
  const [creatorImagePreview, setCreatorImagePreview] = useState('')
  const [creatorSaving, setCreatorSaving] = useState(false)
  const [creatorSaved, setCreatorSaved] = useState('')
  useEffect(() => {
    const profile = creatorProfiles.find((item) => item.id === selected.id)
    if (!profile) return
    setCreatorDraft({ name: profile.name, slug: profile.slug, roles: profile.roles, bio: profile.bio, awards: profile.awards ?? '', academicTitle: profile.academicTitle ?? '', birthYear: profile.birthYear == null ? '' : String(profile.birthYear), deathYear: profile.deathYear == null ? '' : String(profile.deathYear), isActive: profile.status === 'Đang hoạt động' })
    setCreatorImageFile(null)
    setCreatorImagePreview(profile.image || '')
    setCreatorSaved('')
  }, [selected.id, creatorProfiles])
  const saveCreator = async () => {
    if (!selectedProfile || !creatorDraft.name.trim() || !creatorDraft.slug.trim()) return
    setCreatorSaving(true)
    setCreatorSaved('')
    try {
      const saved = await upsertCreatorProfile({ displayName: creatorDraft.name, slug: creatorDraft.slug, roles: creatorDraft.roles, bioHtml: creatorDraft.bio, awards: creatorDraft.awards, academicTitle: creatorDraft.academicTitle, birthYear: creatorDraft.birthYear ? Number(creatorDraft.birthYear) : undefined, deathYear: creatorDraft.deathYear ? Number(creatorDraft.deathYear) : undefined, isActive: creatorDraft.isActive })
      if (creatorImageFile) await saveAdminCreatorImages(saved.id, [creatorImageFile])
      const refreshed = await loadAdminCreators()
      setCreatorProfiles(refreshed)
      setCreatorSaved('Đã lưu hồ sơ nhà sáng tạo vào Supabase.')
    } catch (reason) {
      setCreatorSaved(reason instanceof Error ? reason.message : 'Không lưu được hồ sơ nhà sáng tạo.')
    } finally {
      setCreatorSaving(false)
    }
  }
  const selectedBooks: AdminCatalogBook[] = publicCatalogProducts.filter((book) => book.author === selected.name || book.translators.includes(selected.name) || book.illustrators.includes(selected.name)).map((book) => ({ id: book.id, isbn: book.isbn, title: book.title, author: book.author, cover: book.image, coverImages: book.gallery, quantity: book.inventoryQuantity, unitPrice: null, salePrice: parseDemoPrice(book.price), comparePrice: book.comparePriceVnd, link: `/books/${book.slug}`, format: book.format, line: book.line || book.publisher, category: book.categories[0] ?? '', series: '', goodreads: '', description: book.description, status: book.available ? 'Đang bán' : 'Hết hàng', slug: book.slug, pages: book.pageCount, bookSize: book.bookSize, publisher: book.publisher, imprint: book.imprint, publicationDate: book.publicationDate, weight: book.weight, authors: [book.author], translators: book.translators, illustrators: book.illustrators, categories: book.categories, topics: book.topics, languages: book.languages }))
  const bookCount = (authorName: string) => publicCatalogProducts.filter((book) => book.author === authorName || book.translators.includes(authorName) || book.illustrators.includes(authorName)).length
  const openDetail = (id: string) => { setSelectedId(id); setView('detail') }
  const viewButton = (value: 'cards' | 'table' | 'detail', icon: string, label: string) => (
    <button className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border px-3.5 font-body text-sm transition-colors ${view === value ? 'border-[var(--color-olive)] bg-[rgba(155,148,47,.12)] font-semibold text-[var(--color-olive-dark)]' : 'border-[#dedbd0] text-[#62655f] hover:border-[var(--color-olive)]'}`} type="button" aria-pressed={view === value} onClick={() => setView(value)}>
      <i className={`bi ${icon}`} aria-hidden="true" />{label}
    </button>
  )
  return (
    <div className="admin-shell flex min-h-screen bg-[#f7f7f2] text-[var(--color-ink)]">
       <aside className={`admin-sidebar admin-mobile-drawer fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-[#e5e2d7] bg-white transition-transform duration-300 lg:static ${sidebarOpen ? 'is-open' : ''}`}>
         <div className="flex h-16 items-center justify-between border-b border-[#eeeae0] px-5"><a className="admin-brand-link" href="/#home" aria-label="LineryBooks"><AdminBrand /></a><button className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#dedbd0] lg:hidden" type="button" aria-label="Đóng menu quản trị" onClick={() => setSidebarOpen(false)}><i className="bi bi-x-lg" aria-hidden="true" /></button></div>
        <AdminManagementSidebar pathname={pathname} />
      </aside>
       {sidebarOpen && <button className="fixed inset-0 z-30 bg-[rgba(31,42,36,.32)] lg:hidden" type="button" aria-label="Đóng menu quản trị" onClick={() => setSidebarOpen(false)} />}
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-[#e5e2d7] bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
           <div className="flex items-center gap-3"><button className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#dedbd0] lg:hidden" type="button" aria-label="Mở menu quản trị" onClick={() => setSidebarOpen(true)}><i className="bi bi-list" aria-hidden="true" /></button><div><p className="font-body text-sm text-[#8b8d86]">Nội dung</p><h1 className="font-display text-xl font-semibold tracking-tight sm:text-2xl">Hồ sơ tác giả</h1></div></div>
          <button className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-olive)] font-display text-sm text-white" type="button" aria-label="Hồ sơ quản trị">K</button>
        </header>
        <main className="mx-auto w-full max-w-[1440px] p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div><p className="mb-2 font-body text-sm font-semibold uppercase tracking-[.14em] text-[var(--color-olive)]">NỘI DUNG</p><h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">Hồ sơ tác giả</h2><p className="mt-2 max-w-2xl font-body text-sm leading-6 text-[#74776f]">Quản lý thông tin, hình ảnh và các tác phẩm được liên kết với từng nhà sáng tạo.</p></div>
          </div>
          <section className="mt-6 rounded-2xl border border-[#e6e2d7] bg-white p-4 shadow-[0_10px_30px_rgba(31,42,36,.04)] sm:p-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap gap-2" role="group" aria-label="Chế độ xem">{viewButton('cards', 'bi-grid-3x3-gap', 'Thẻ')}{viewButton('table', 'bi-list-ul', 'Bảng')}</div>
              <div className="flex flex-col gap-2 sm:flex-row"><button className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[#dedbd0] px-3.5 font-body text-sm text-[#62655f] hover:border-[var(--color-olive)]" type="button" onClick={() => setAscending((value) => !value)}><i className="bi bi-sort-alpha-down" aria-hidden="true" />Tên {ascending ? 'A–Z' : 'Z–A'}</button><a className="admin-primary-action inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[var(--color-olive)] px-3.5 font-body text-sm font-medium text-white hover:bg-[var(--color-olive-dark)]" href="/admin/authors/new"><i className="bi bi-plus-lg" aria-hidden="true" />Thêm nhà sáng tạo</a></div>
            </div>
            <AdminTableFilterBar query={query} onQueryChange={setQuery} queryPlaceholder="Tìm tên, đường dẫn hoặc loại nhà sáng tạo" filters={[{ label: 'Tất cả vai trò', value: roleFilter, onChange: setRoleFilter, options: [{ label: 'Tác giả', value: 'Tác giả' }, { label: 'Dịch giả', value: 'Dịch giả' }, { label: 'Họa sĩ minh họa', value: 'Họa sĩ minh họa' }] }, { label: 'Tất cả trạng thái', value: statusFilter, onChange: setStatusFilter, options: [{ label: 'Đang hoạt động', value: 'Đang hoạt động' }, { label: 'Tạm ẩn', value: 'Tạm ẩn' }] }]} onClear={() => { setQuery(''); setRoleFilter('all'); setStatusFilter('all') }} />
          </section>
            {creatorLoading && <p className="mt-6 rounded-2xl border border-[#e6e2d7] bg-white p-5 font-body text-sm text-[#74776f]" role="status">Đang tải dữ liệu nhà sáng tạo từ Supabase...</p>}
            {creatorError && <p className="mt-6 rounded-2xl border border-[#ebc4bd] bg-[#fff5f2] p-5 font-body text-sm text-[#a33d32]" role="alert">{creatorError}</p>}

            {view === 'cards' && <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">{authors.map((author) => <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-[#e6e2d7] bg-white" key={author.id}><div className="flex items-center justify-between border-b border-[#eeeae0] px-3 py-2.5"><span className="font-body text-xs text-[#8b8d86]">{author.role}</span><div className="flex gap-1"><button className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#dedbd0] text-[#74776f] hover:bg-[#f5f3ec]" type="button" aria-label={`Sửa ${author.name}`} onClick={() => openDetail(author.id)}><i className="bi bi-pencil" aria-hidden="true" /></button><button className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#dedbd0] text-[#74776f] hover:bg-[#f5f3ec]" type="button" aria-label={`Tạm ẩn ${author.name}`}><i className="bi bi-eye-slash" aria-hidden="true" /></button></div></div><img className="aspect-[2/3] w-full object-cover object-top" src={author.image} alt={author.name} onError={(event) => { event.currentTarget.src = '/assets/author-avatar-placeholder.png' }} /><div className="flex flex-1 flex-col space-y-3 p-4"><button className="text-left font-display text-xl font-bold hover:text-[var(--color-olive-dark)]" type="button" onClick={() => openDetail(author.id)}>{author.name}</button><dl className="space-y-2 font-body text-sm"><div className="flex justify-between gap-3"><dt className="font-semibold">Số sách</dt><dd className="text-[#74776f]">{bookCount(author.name)}</dd></div><div className="flex justify-between gap-3"><dt className="font-semibold">Trạng thái</dt><dd className="font-semibold text-[#39733e]">{author.status}</dd></div></dl><button className="mt-auto inline-flex min-h-10 w-full items-center justify-center rounded-xl bg-[var(--color-olive)] px-3 font-body text-sm font-medium text-white hover:bg-[var(--color-olive-dark)]" type="button" onClick={() => openDetail(author.id)}>Xem hồ sơ</button></div></article>)}</section>}
            {view === 'table' && <section className="mt-6 overflow-hidden rounded-2xl border border-[#e6e2d7] bg-white"><div className="overflow-x-auto"><table className="min-w-[820px] w-full text-left"><thead className="bg-[#fcfbf7]"><tr><th className="px-4 py-3 font-body text-sm font-semibold">STT</th><th className="px-4 py-3 font-body text-sm font-semibold">Tên nhà sáng tạo</th><th className="px-4 py-3 font-body text-sm font-semibold">Đường dẫn</th><th className="px-4 py-3 font-body text-sm font-semibold">Phân loại</th><th className="px-4 py-3 font-body text-sm font-semibold">Số sách</th><th className="px-4 py-3 font-body text-sm font-semibold">Trạng thái</th><th className="px-4 py-3 text-right font-body text-sm font-semibold">Thao tác</th></tr></thead><tbody>{authors.slice(0, pageSize).map((author, index) => <tr className="border-t border-[#eeeae0]" key={author.id}><td className="px-4 py-3 font-body text-sm text-[#74776f]">{index + 1}</td><td className="px-4 py-3 font-body text-sm font-medium"><button type="button" onClick={() => openDetail(author.id)}>{author.name}</button></td><td className="px-4 py-3 font-body text-sm text-[#74776f]">{author.slug}</td><td className="px-4 py-3 font-body text-sm">{author.role}</td><td className="px-4 py-3 font-body text-sm">{author.books}</td><td className="px-4 py-3 font-body text-sm"><span className="rounded-full bg-[#edf7ef] px-2.5 py-1 text-xs font-semibold text-[#39733e]">{author.status}</span></td><td className="px-4 py-3 text-right"><button className="mr-1 inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#dedbd0] text-[#74776f] hover:bg-[#f5f3ec]" type="button" aria-label={`Sửa ${author.name}`} onClick={() => openDetail(author.id)}><i className="bi bi-pencil" aria-hidden="true" /></button><button className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#dedbd0] text-[#74776f] hover:bg-[#f5f3ec]" type="button" aria-label={`Tạm ẩn ${author.name}`}><i className="bi bi-eye-slash" aria-hidden="true" /></button></td></tr>)}</tbody></table></div><AdminTableFooter total={authors.length} pageSize={pageSize} onPageSizeChange={setPageSize} /></section>}
            {view === 'detail' && selectedProfile && <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(420px,.9fr)]"><AdminCreatorEditForm profile={selectedProfile} draft={creatorDraft} setDraft={setCreatorDraft} imagePreview={creatorImagePreview} setImageFile={(file) => { setCreatorImageFile(file); setCreatorImagePreview(file ? URL.createObjectURL(file) : selectedProfile.image) }} saving={creatorSaving} savedMessage={creatorSaved} onSave={() => void saveCreator()} /><aside className="rounded-2xl border border-[#e6e2d7] bg-white p-5 sm:p-6"><div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#eeeae0] pb-4"><div><h3 className="font-display text-xl font-semibold">Tác phẩm liên quan</h3><p className="mt-1 font-body text-sm text-[#74776f]">{selectedBooks.length} cuốn sách được liên kết với tác giả này.</p></div><div className="flex gap-2" role="group" aria-label="Kiểu hiển thị sách"><button className={`inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border px-3 font-body text-xs ${bookView === 'list' ? 'border-[var(--color-olive)] bg-[rgba(155,148,47,.12)] font-semibold text-[var(--color-olive-dark)]' : 'border-[#dedbd0] text-[#62655f]'}`} type="button" aria-pressed={bookView === 'list'} onClick={() => setBookView('list')}><i className="bi bi-list-ul" aria-hidden="true" />Danh sách</button><button className={`inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border px-3 font-body text-xs ${bookView === 'grid' ? 'border-[var(--color-olive)] bg-[rgba(155,148,47,.12)] font-semibold text-[var(--color-olive-dark)]' : 'border-[#dedbd0] text-[#62655f]'}`} type="button" aria-pressed={bookView === 'grid'} onClick={() => setBookView('grid')}><i className="bi bi-grid-3x3-gap" aria-hidden="true" />Lưới</button></div></div>{selectedBooks.length === 0 ? <p className="mt-5 rounded-xl border border-dashed border-[#d9d6c8] bg-[#fcfbf7] p-5 font-body text-sm leading-6 text-[#74776f]">Chưa có sách được liên kết. Khi tạo sách và chọn tác giả này, sách sẽ xuất hiện tại đây.</p> : bookView === 'list' ? <div className="mt-5 space-y-3">{selectedBooks.map((book, index) => <a className="flex items-center gap-3 rounded-xl border border-[#e6e2d7] bg-[#fcfbf7] p-3 transition hover:border-[var(--color-olive)]" href={`/admin/books/report/${book.id}`} key={book.id}><span className="w-7 shrink-0 font-body text-sm font-semibold text-[var(--color-olive-dark)]">{index + 1}</span><img className="h-16 w-11 shrink-0 rounded-md object-cover" src={book.cover || BOOK_COVER_FALLBACK} alt="" onError={handleBookCoverError} /><span className="min-w-0 flex-1 font-body text-sm font-semibold text-[var(--color-ink)]">{book.title}</span><i className="bi bi-arrow-up-right shrink-0 text-[#8b8d86]" aria-hidden="true" /></a>)}</div> : <div className="mt-5 grid grid-cols-2 gap-3">{selectedBooks.map((book, index) => <a className="rounded-xl border border-[#e6e2d7] bg-[#fcfbf7] p-3 transition hover:border-[var(--color-olive)]" href={`/admin/books/report/${book.id}`} key={book.id}><div className="relative"><img className="aspect-[2/3] w-full rounded-lg object-cover" src={book.cover || BOOK_COVER_FALLBACK} alt="" onError={handleBookCoverError} /><span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 font-body text-xs font-semibold text-[var(--color-olive-dark)]">{index + 1}</span></div><span className="mt-2 block font-body text-sm font-semibold leading-5 text-[var(--color-ink)]">{book.title}</span></a>)}</div>}</aside></section>}
        </main>
      </div>
    </div>
  )
}

function AdminCreatorEditForm({ profile, draft, setDraft, imagePreview, setImageFile, saving, savedMessage, onSave }: { profile: AdminCreatorRow; draft: { name: string; slug: string; roles: AdminCreatorRow['roles']; bio: string; awards: string; academicTitle: string; birthYear: string; deathYear: string; isActive: boolean }; setDraft: React.Dispatch<React.SetStateAction<typeof draft>>; imagePreview: string; setImageFile: (file: File | null) => void; saving: boolean; savedMessage: string; onSave: () => void }) {
  return <section className="mt-6 rounded-2xl border border-[var(--color-olive)] bg-white p-5 shadow-[0_10px_30px_rgba(31,42,36,.04)] sm:p-6"><div className="flex flex-col justify-between gap-3 border-b border-[#eeeae0] pb-4 sm:flex-row sm:items-center"><div><p className="font-body text-sm text-[#8b8d86]">Dữ liệu thật từ Supabase</p><h3 className="font-display text-2xl font-semibold">Chỉnh sửa hồ sơ nhà sáng tạo</h3></div><button className="inline-flex min-h-10 items-center justify-center rounded-xl bg-[var(--color-olive)] px-4 font-body text-sm font-medium text-white disabled:opacity-50" type="button" disabled={saving} onClick={onSave}>{saving ? 'Đang lưu…' : 'Lưu thay đổi'}</button></div><div className="mt-5 grid gap-5 lg:grid-cols-[180px_minmax(0,1fr)]"><div><img className="h-56 w-full rounded-xl object-cover object-top" src={imagePreview || profile.image} alt={draft.name} onError={(event) => { event.currentTarget.src = '/assets/author-avatar-placeholder.png' }} /><label className="mt-3 block"><span className="mb-1.5 block font-body text-sm font-medium">Ảnh đại diện</span><input className="block min-h-10 w-full cursor-pointer rounded-lg border border-dashed border-[var(--color-olive)] bg-[#fcfbf7] px-2 py-2 font-body text-xs" type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => setImageFile(event.target.files?.[0] ?? null)} /></label></div><div className="grid gap-4 sm:grid-cols-2"><label className="block sm:col-span-2"><span className="mb-1.5 block font-body text-sm font-medium">Tên hiển thị</span><input className="min-h-11 w-full rounded-xl border border-[#dedbd0] bg-[#fcfbf7] px-3.5 font-body text-sm" value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} /></label><label className="block"><span className="mb-1.5 block font-body text-sm font-medium">Đường dẫn</span><input className="min-h-11 w-full rounded-xl border border-[#dedbd0] bg-[#fcfbf7] px-3.5 font-body text-sm" value={draft.slug} onChange={(event) => setDraft((current) => ({ ...current, slug: event.target.value }))} /></label><label className="inline-flex items-center gap-2 self-end pb-2 font-body text-sm"><input className="h-4 w-4 accent-[var(--color-olive)]" type="checkbox" checked={draft.isActive} onChange={(event) => setDraft((current) => ({ ...current, isActive: event.target.checked }))} />Hiển thị trên website</label><fieldset className="sm:col-span-2"><legend className="mb-1.5 block font-body text-sm font-medium">Phân loại</legend><div className="flex flex-wrap gap-3">{([['author', 'Tác giả'], ['translator', 'Dịch giả'], ['illustrator', 'Họa sĩ minh họa']] as const).map(([role, label]) => <label className="inline-flex items-center gap-2 font-body text-sm" key={role}><input className="h-4 w-4 accent-[var(--color-olive)]" type="checkbox" checked={draft.roles.includes(role)} onChange={(event) => setDraft((current) => ({ ...current, roles: event.target.checked ? [...new Set([...current.roles, role])] : current.roles.filter((item) => item !== role) }))} />{label}</label>)}</div></fieldset></div></div><div className="mt-5 grid gap-4 sm:grid-cols-2"><label className="block"><span className="mb-1.5 block font-body text-sm font-medium">Năm sinh</span><input className="min-h-11 w-full rounded-xl border border-[#dedbd0] bg-[#fcfbf7] px-3.5 font-body text-sm" type="number" value={draft.birthYear} onChange={(event) => setDraft((current) => ({ ...current, birthYear: event.target.value }))} /></label><label className="block"><span className="mb-1.5 block font-body text-sm font-medium">Năm mất</span><input className="min-h-11 w-full rounded-xl border border-[#dedbd0] bg-[#fcfbf7] px-3.5 font-body text-sm" type="number" value={draft.deathYear} onChange={(event) => setDraft((current) => ({ ...current, deathYear: event.target.value }))} /></label><label className="block"><span className="mb-1.5 block font-body text-sm font-medium">Awards received</span><textarea className="min-h-28 w-full rounded-xl border border-[#dedbd0] bg-[#fcfbf7] p-3.5 font-body text-sm" value={draft.awards} onChange={(event) => setDraft((current) => ({ ...current, awards: event.target.value }))} placeholder="Mỗi giải thưởng một dòng" /></label><label className="block"><span className="mb-1.5 block font-body text-sm font-medium">Academic title</span><textarea className="min-h-28 w-full rounded-xl border border-[#dedbd0] bg-[#fcfbf7] p-3.5 font-body text-sm" value={draft.academicTitle} onChange={(event) => setDraft((current) => ({ ...current, academicTitle: event.target.value }))} placeholder="Mỗi danh hiệu một dòng" /></label></div><label className="mt-4 block"><span className="mb-1.5 block font-body text-sm font-medium">Tiểu sử</span><textarea className="min-h-32 w-full rounded-xl border border-[#dedbd0] bg-[#fcfbf7] p-3.5 font-body text-sm" value={draft.bio} onChange={(event) => setDraft((current) => ({ ...current, bio: event.target.value }))} /></label>{savedMessage && <p className="mt-4 rounded-xl border border-[#cfe5d1] bg-[#f1f8f1] p-3 font-body text-sm text-[#39733e]" role="status">{savedMessage}</p>}</section>
}

function AdminAuthorsLegacyPage({ pathname }: { pathname: string }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [view, setView] = useState<'cards' | 'table' | 'detail'>('cards')
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState('edward-w-said')
  const [sortAscending, setSortAscending] = useState(true)
  const [pageSize, setPageSize] = useState(10)
  const authors = adminAuthorRecords.filter((author) => `${author.name} ${author.slug} ${author.role}`.toLowerCase().includes(query.trim().toLowerCase())).sort((first, second) => sortAscending ? first.name.localeCompare(second.name, 'vi') : second.name.localeCompare(first.name, 'vi'))
  const pagedAuthors = authors.slice(0, pageSize)
  const selected = adminAuthorRecords.find((author) => author.id === selectedId) ?? adminAuthorRecords[0]
  const openDetail = (id: string) => { setSelectedId(id); setView('detail') }
  const viewButton = (nextView: 'cards' | 'table' | 'detail', icon: string, label: string) => <button className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border px-3.5 font-body text-sm transition-colors ${view === nextView ? 'border-[var(--color-olive)] bg-[rgba(155,148,47,.12)] font-semibold text-[var(--color-olive-dark)]' : 'border-[#dedbd0] text-[#62655f] hover:border-[var(--color-olive)]'}`} type="button" aria-pressed={view === nextView} onClick={() => setView(nextView)}><i className={`bi ${icon}`} aria-hidden="true" />{label}</button>
  return <div className="admin-shell flex min-h-screen bg-[#f7f7f2] text-[var(--color-ink)]"><aside className={`admin-sidebar fixed inset-y-0 left-0 z-40 flex w-72 -translate-x-full flex-col border-r border-[#e5e2d7] bg-white transition-transform duration-300 lg:static lg:translate-x-0 ${sidebarOpen ? 'is-open translate-x-0' : ''}`}><div className="flex h-20 items-center justify-between border-b border-[#eeeae0] px-6"><a className="font-display text-lg font-semibold tracking-[.08em] text-[var(--color-ink)]" href="/#home">LINERY <span className="font-body text-xs font-normal tracking-[.18em] text-[var(--color-olive)]">QUẢN TRỊ</span></a><button className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#dedbd0] lg:hidden" type="button" aria-label="Đóng menu quản trị" onClick={() => setSidebarOpen(false)}><i className="bi bi-x-lg" aria-hidden="true" /></button></div><AdminManagementSidebar pathname={pathname} /><div className="border-t border-[#eeeae0] p-4"><a className="flex items-center gap-3 rounded-xl px-3 py-2.5 font-body text-sm text-[#62655f] hover:bg-[#f5f3ec]" href="/#home"><i className="bi bi-arrow-left" aria-hidden="true" />Về cửa hàng</a></div></aside>{sidebarOpen && <button className="fixed inset-0 z-30 bg-[rgba(31,42,36,.32)] lg:hidden" type="button" aria-label="Đóng menu quản trị" onClick={() => setSidebarOpen(false)} />}<div className="min-w-0 flex-1"><header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-[#e5e2d7] bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8"><div className="flex items-center gap-3"><button className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#dedbd0] lg:hidden" type="button" aria-label="Mở menu quản trị" onClick={() => setSidebarOpen(true)}><i className="bi bi-list" aria-hidden="true" /></button><div><p className="font-body text-sm text-[#8b8d86]">Nội dung</p><h1 className="font-display text-xl font-semibold tracking-tight sm:text-2xl">Hồ sơ tác giả</h1></div></div><button className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-olive)] font-display text-sm text-white" type="button" aria-label="Hồ sơ quản trị">K</button></header><main className="mx-auto w-full max-w-[1440px] p-4 sm:p-6 lg:p-8"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="mb-2 font-body text-sm font-semibold uppercase tracking-[.14em] text-[var(--color-olive)]">NỘI DUNG</p><h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">Hồ sơ tác giả</h2><p className="mt-2 max-w-2xl font-body text-sm leading-6 text-[#74776f]">Quản lý thông tin, hình ảnh và các tác phẩm được liên kết với từng tác giả.</p></div><button className="admin-primary-action inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--color-olive)] px-5 font-body text-sm font-medium text-white hover:bg-[var(--color-olive-dark)]" type="button"><i className="bi bi-plus-lg mr-2" aria-hidden="true" />Thêm tác giả</button></div><section className="mt-6 rounded-2xl border border-[#e6e2d7] bg-white p-4 shadow-[0_10px_30px_rgba(31,42,36,.04)] sm:p-5"><div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"><div className="flex flex-wrap gap-2">{viewButton('cards', 'bi-grid-3x3-gap', 'Thẻ')}{viewButton('table', 'bi-list-ul', 'Bảng')}{viewButton('detail', 'bi-person-vcard', 'Chi tiết')}</div><div className="flex flex-col gap-2 sm:flex-row"><button className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[#dedbd0] px-3.5 font-body text-sm text-[#62655f] hover:border-[var(--color-olive)]" type="button" onClick={() => setSortAscending((current) => !current)}><i className="bi bi-sort-alpha-down" aria-hidden="true" />Tên {sortAscending ? 'A–Z' : 'Z–A'}</button><label className="relative sm:w-72"><span className="sr-only">Tìm tác giả</span><i className="bi bi-search pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8b8d86]" aria-hidden="true" /><input className="min-h-10 w-full rounded-xl border border-[#dedbd0] bg-[#fcfbf7] pl-9 pr-3 font-body text-sm" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm tác giả" /></label></div></div></section>{view === 'cards' && <section className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{authors.map((author) => <article className="overflow-hidden rounded-2xl border border-[#e6e2d7] bg-white" key={author.id}><div className="flex items-center justify-between border-b border-[#eeeae0] px-4 py-3"><span className="font-body text-xs text-[#8b8d86]">{author.role}</span><div className="flex gap-1"><button className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#74776f] hover:bg-[#f5f3ec]" type="button" aria-label={`Sửa ${author.name}`}><i className="bi bi-pencil" aria-hidden="true" /></button><button className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#74776f] hover:bg-[#f5f3ec]" type="button" aria-label={`Tạm ẩn ${author.name}`}><i className="bi bi-eye-slash" aria-hidden="true" /></button></div></div><img className="h-64 w-full object-cover object-top" src={author.image} alt={author.name} /><div className="space-y-3 p-5"><button className="font-display text-xl font-semibold hover:text-[var(--color-olive-dark)]" type="button" onClick={() => openDetail(author.id)}>{author.name}</button><dl className="space-y-2 font-body text-sm"><div className="flex justify-between gap-4"><dt className="font-semibold">Đường dẫn</dt><dd className="text-[#74776f]">{author.slug}</dd></div><div className="flex justify-between gap-4"><dt className="font-semibold">Số sách</dt><dd className="text-[#74776f]">{author.books}</dd></div><div className="flex justify-between gap-4"><dt className="font-semibold">Trạng thái</dt><dd className="font-semibold text-[#39733e]">{author.status}</dd></div></dl><button className="inline-flex min-h-10 w-full items-center justify-center rounded-xl bg-[var(--color-olive)] px-4 font-body text-sm font-medium text-white hover:bg-[var(--color-olive-dark)]" type="button" onClick={() => openDetail(author.id)}>Xem hồ sơ</button></div></article>)}</section>}{view === 'table' && <section className="mt-6 overflow-hidden rounded-2xl border border-[#e6e2d7] bg-white"><div className="overflow-x-auto"><table className="min-w-[820px] w-full text-left"><thead className="bg-[#fcfbf7]"><tr><th className="px-4 py-3 font-body text-sm font-semibold">STT</th><th className="px-4 py-3 font-body text-sm font-semibold">Tên tác giả</th><th className="px-4 py-3 font-body text-sm font-semibold">Đường dẫn</th><th className="px-4 py-3 font-body text-sm font-semibold">Vai trò</th><th className="px-4 py-3 font-body text-sm font-semibold">Số sách</th><th className="px-4 py-3 font-body text-sm font-semibold">Trạng thái</th><th className="px-4 py-3 text-right font-body text-sm font-semibold">Thao tác</th></tr></thead><tbody>{pagedAuthors.map((author, index) => <tr className="border-t border-[#eeeae0]" key={author.id}><td className="px-4 py-3 font-body text-sm text-[#74776f]">{index + 1}</td><td className="px-4 py-3 font-body text-sm font-medium"><button type="button" onClick={() => openDetail(author.id)}>{author.name}</button></td><td className="px-4 py-3 font-body text-sm text-[#74776f]">{author.slug}</td><td className="px-4 py-3 font-body text-sm">{author.role}</td><td className="px-4 py-3 font-body text-sm">{author.books}</td><td className="px-4 py-3 font-body text-sm"><span className="rounded-full bg-[#edf7ef] px-2.5 py-1 text-xs font-semibold text-[#39733e]">{author.status}</span></td><td className="px-4 py-3 text-right"><button className="mr-1 inline-flex h-8 w-8 items-center justify-center rounded-full text-[#74776f] hover:bg-[#f5f3ec]" type="button" aria-label={`Sửa ${author.name}`}><i className="bi bi-pencil" aria-hidden="true" /></button><button className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#74776f] hover:bg-[#f5f3ec]" type="button" aria-label={`Tạm ẩn ${author.name}`}><i className="bi bi-eye-slash" aria-hidden="true" /></button></td></tr>)}</tbody><tfoot><AdminSummaryRow rows={authors.map((author) => [String(author.books)])} numericColumns={[1]} columnCount={7} /></tfoot></table></div><AdminTableFooter total={authors.length} pageSize={pageSize} onPageSizeChange={setPageSize} /></section>}{view === 'detail' && <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(360px,.8fr)]"><article className="rounded-2xl border border-[#e6e2d7] bg-white p-5 sm:p-6"><div className="flex items-center justify-between border-b border-[#eeeae0] pb-4"><div><p className="font-body text-sm text-[#8b8d86]">Hồ sơ tác giả</p><h3 className="mt-1 font-display text-2xl font-semibold">{selected.name}</h3></div><div className="flex gap-2"><button className="inline-flex min-h-10 rounded-xl bg-[var(--color-olive)] px-4 font-body text-sm font-medium text-white" type="button">Lưu</button><button className="inline-flex min-h-10 rounded-xl border border-[#dedbd0] px-4 font-body text-sm" type="button" onClick={() => setView('cards')}>Hủy</button></div></div><div className="mt-5 grid gap-5 sm:grid-cols-[180px_minmax(0,1fr)]"><img className="h-56 w-full rounded-xl object-cover object-top" src={selected.image} alt={selected.name} /><div className="space-y-4"><label className="block"><span className="mb-1.5 block font-body text-sm font-medium">Tên hiển thị</span><input className="min-h-11 w-full rounded-xl border border-[#dedbd0] bg-[#fcfbf7] px-3.5 font-body text-sm" defaultValue={selected.name} /></label><label className="block"><span className="mb-1.5 block font-body text-sm font-medium">Đường dẫn</span><input className="min-h-11 w-full rounded-xl border border-[#dedbd0] bg-[#fcfbf7] px-3.5 font-body text-sm" defaultValue={selected.slug} /></label><label className="block"><span className="mb-1.5 block font-body text-sm font-medium">Vai trò</span><select className="min-h-11 w-full rounded-xl border border-[#dedbd0] bg-[#fcfbf7] px-3.5 font-body text-sm" defaultValue={selected.role}><option>Author</option><option>Translator</option></select></label></div></div><label className="mt-5 block"><span className="mb-1.5 block font-body text-sm font-medium">Tiểu sử</span><textarea className="min-h-32 w-full rounded-xl border border-[#dedbd0] bg-[#fcfbf7] p-3.5 font-body text-sm" defaultValue={selected.bio} /></label></article><aside className="rounded-2xl border border-[#e6e2d7] bg-white p-5 sm:p-6"><div className="border-b border-[#eeeae0] pb-4"><h3 className="font-display text-xl font-semibold">Tác phẩm liên quan</h3><p className="mt-1 font-body text-sm text-[#74776f]">{selected.books} bản ghi được liên kết với tác giả này.</p></div><div className="mt-5 space-y-3">{Array.from({ length: selected.books }, (_, index) => <div className="flex items-center justify-between gap-3 rounded-xl border border-[#e6e2d7] bg-[#fcfbf7] p-3" key={index}><span className="font-body text-sm">Tác phẩm liên kết {index + 1}</span><i className="bi bi-arrow-up-right text-[#8b8d86]" aria-hidden="true" /></div>)}</div></aside></section>}{authors.length === 0 && <section className="mt-6 rounded-2xl border border-[#e6e2d7] bg-white p-10 text-center"><i className="bi bi-people text-3xl text-[var(--color-olive)]" aria-hidden="true" /><h3 className="mt-3 font-display text-lg font-semibold">Chưa có tác giả</h3><p className="mt-2 font-body text-sm text-[#74776f]">Không tìm thấy tác giả phù hợp.</p></section>}</main></div></div>
}

function AdminModulePage({ pathname, config }: { pathname: string; config: AdminModuleConfig }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [rows, setRows] = useState(config.rows)
  const [sort, setSort] = useState({ index: 0, ascending: true })
  const [formOpen, setFormOpen] = useState(false)
  const [draft, setDraft] = useState('')
  const [pageSize, setPageSize] = useState(10)
  const filteredRows = rows.filter((row) => row.join(' ').toLowerCase().includes(query.trim().toLowerCase()))
  const sortedRows = [...filteredRows].sort((first, second) => {
    const result = (first[sort.index] ?? '').localeCompare(second[sort.index] ?? '', 'vi', { numeric: true })
    return sort.ascending ? result : -result
  })
  const pagedRows = sortedRows.slice(0, pageSize)
  const numericModuleColumns = config.columns.map((column, index) => /Số|Hợp lệ|Lỗi|Thứ tự|Đơn hàng/.test(column) ? index + 1 : -1).filter((index) => index >= 0)
  const addRow = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const value = draft.trim()
    if (!value) return
    setRows((current) => [[value, ...config.columns.slice(1).map((column) => column === 'Trạng thái' ? 'Bản nháp' : '—')], ...current])
    setDraft('')
    setFormOpen(false)
  }
  return <div className="admin-shell flex min-h-screen bg-[#f7f7f2] text-[var(--color-ink)]"><aside className={`admin-sidebar fixed inset-y-0 left-0 z-40 flex w-72 -translate-x-full flex-col border-r border-[#e5e2d7] bg-white transition-transform duration-300 lg:static lg:translate-x-0 ${sidebarOpen ? 'is-open translate-x-0' : ''}`}><div className="flex h-20 items-center justify-between border-b border-[#eeeae0] px-6"><a className="font-display text-lg font-semibold tracking-[.08em] text-[var(--color-ink)]" href="/#home">LINERY <span className="font-body text-xs font-normal tracking-[.18em] text-[var(--color-olive)]">QUẢN TRỊ</span></a><button className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#dedbd0] text-[var(--color-ink)] lg:hidden" type="button" aria-label="Đóng menu quản trị" onClick={() => setSidebarOpen(false)}><i className="bi bi-x-lg" aria-hidden="true" /></button></div><AdminManagementSidebar pathname={pathname} /><div className="border-t border-[#eeeae0] p-4"><a className="flex items-center gap-3 rounded-xl px-3 py-2.5 font-body text-sm text-[#62655f] hover:bg-[#f5f3ec]" href="/#home"><i className="bi bi-arrow-left" aria-hidden="true" />Về cửa hàng</a></div></aside>{sidebarOpen && <button className="fixed inset-0 z-30 bg-[rgba(31,42,36,.32)] lg:hidden" type="button" aria-label="Đóng menu quản trị" onClick={() => setSidebarOpen(false)} />}<div className="min-w-0 flex-1"><header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-[#e5e2d7] bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8"><div className="flex items-center gap-3"><button className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#dedbd0] lg:hidden" type="button" aria-label="Mở menu quản trị" onClick={() => setSidebarOpen(true)}><i className="bi bi-list" aria-hidden="true" /></button><div><p className="font-body text-sm text-[#8b8d86]">Quản trị</p><h1 className="font-display text-xl font-semibold tracking-tight sm:text-2xl">{config.title}</h1></div></div><button className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-olive)] font-display text-sm text-white" type="button" aria-label="Hồ sơ quản trị">K</button></header><main className="mx-auto w-full max-w-[1440px] p-4 sm:p-6 lg:p-8"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="mb-2 font-body text-sm font-semibold uppercase tracking-[.14em] text-[var(--color-olive)]">{config.section}</p><h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">{config.title}</h2><p className="mt-2 max-w-3xl font-body text-sm leading-6 text-[#74776f]">{config.description}</p></div><button className="admin-primary-action inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--color-olive)] px-5 font-body text-sm font-medium text-white hover:bg-[var(--color-olive-dark)]" type="button" onClick={() => setFormOpen((current) => !current)}><i className="bi bi-plus-lg mr-2" aria-hidden="true" />{config.addLabel}</button></div>{formOpen && <form className="mt-6 rounded-2xl border border-[#e6e2d7] bg-white p-5" onSubmit={addRow}><label className="block max-w-xl"><span className="mb-1.5 block font-body text-sm font-medium">{config.columns[0]}</span><input className="block min-h-11 w-full rounded-xl border border-[#dedbd0] bg-[#fcfbf7] px-3.5 font-body text-sm" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={`Nhập ${config.columns[0].toLowerCase()}`} /></label><div className="mt-4 flex gap-3"><button className="admin-primary-action inline-flex min-h-10 rounded-xl bg-[var(--color-olive)] px-5 font-body text-sm font-medium text-white" type="submit">Lưu</button><button className="inline-flex min-h-10 rounded-xl border border-[#dedbd0] px-5 font-body text-sm" type="button" onClick={() => setFormOpen(false)}>Hủy</button></div></form>}<section className="mt-6 overflow-hidden rounded-2xl border border-[#e6e2d7] bg-white"><div className="flex flex-col gap-3 border-b border-[#eeeae0] p-5 sm:flex-row sm:items-center sm:justify-between"><div><h3 className="font-display text-lg font-semibold">Danh sách dữ liệu</h3><p className="mt-1 font-body text-sm text-[#74776f]">{sortedRows.length} bản ghi hiển thị.</p></div><label className="relative min-w-0 sm:w-80"><span className="sr-only">Tìm kiếm</span><i className="bi bi-search pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8b8d86]" aria-hidden="true" /><input className="min-h-10 w-full rounded-xl border border-[#dedbd0] bg-[#fcfbf7] pl-10 pr-3 font-body text-sm" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm trong danh sách" /></label></div>{sortedRows.length ? <><div className="overflow-x-auto"><table className="min-w-[760px] w-full text-left"><thead className="bg-[#fcfbf7]"><tr><th className="px-4 py-3 font-body text-sm font-semibold">STT</th>{config.columns.map((column, index) => <th className="px-4 py-3 font-body text-sm font-semibold" key={column}><button className="inline-flex items-center gap-1.5" type="button" onClick={() => setSort((current) => ({ index, ascending: current.index === index ? !current.ascending : true }))}>{column}<span className="text-xs text-[#98968c]">{sort.index === index ? (sort.ascending ? '↑' : '↓') : '↕'}</span></button></th>)}<th className="px-4 py-3 text-right font-body text-sm font-semibold">Thao tác</th></tr></thead><tbody>{pagedRows.map((row, rowIndex) => <tr className="border-t border-[#eeeae0]" key={`${row.join('-')}-${rowIndex}`}><td className="px-4 py-3 font-body text-sm text-[#74776f]">{rowIndex + 1}</td>{row.map((value, cellIndex) => <td className="px-4 py-3 font-body text-sm" key={`${cellIndex}-${value}`}>{cellIndex === row.length - 1 ? <span className="inline-flex rounded-full bg-[#edf7ef] px-2.5 py-1 text-xs font-semibold text-[#39733e]">{value}</span> : value}</td>)}<td className="px-4 py-3 text-right"><button className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#8b8d86] hover:bg-[#f1e8e5] hover:text-[#a33d32]" type="button" aria-label={`Xóa ${row[0]}`} onClick={() => setRows((current) => current.filter((_, index) => index !== rowIndex))}><i className="bi bi-trash3" aria-hidden="true" /></button></td></tr>)}</tbody><tfoot><AdminSummaryRow rows={filteredRows} numericColumns={numericModuleColumns} columnCount={config.columns.length + 2} /></tfoot></table></div><AdminTableFooter total={sortedRows.length} pageSize={pageSize} onPageSizeChange={setPageSize} /></> : <div className="px-5 py-14 text-center"><i className="bi bi-inbox text-3xl text-[var(--color-olive)]" aria-hidden="true" /><h3 className="mt-3 font-display text-lg font-semibold">{config.empty}</h3><p className="mt-2 font-body text-sm text-[#74776f]">Dữ liệu sẽ xuất hiện tại đây sau khi kết nối backend.</p></div>}</section></main></div></div>
}

function AdminModulePageV2({ pathname, config }: { pathname: string; config: AdminModuleConfig }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [rows, setRows] = useState(() => getStorefrontAdminRows(pathname, config.rows))
  const [hiddenRows, setHiddenRows] = useState<number[]>([])
  const [sort, setSort] = useState({ index: 0, ascending: true })
  const [formOpen, setFormOpen] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [draft, setDraft] = useState<string[]>(() => config.columns.map(() => ''))
  const [pageSize, setPageSize] = useState(10)
  const canCreate = Boolean(config.addLabel) && pathname !== '/admin/orders' && pathname !== '/admin/customers' && pathname !== '/admin/inventory'
  useEffect(() => {
    document.body.dataset.adminModule = pathname
    const syncStorefrontData = () => setRows(getStorefrontAdminRows(pathname, config.rows))
    window.addEventListener('linery-storefront-data-changed', syncStorefrontData)
    return () => { delete document.body.dataset.adminModule; window.removeEventListener('linery-storefront-data-changed', syncStorefrontData) }
  }, [pathname])
  const filteredRows = rows.map((row, index) => ({ row, index })).filter(({ row }) => row.join(' ').toLowerCase().includes(query.trim().toLowerCase()))
  const sortedRows = [...filteredRows].sort((first, second) => {
    const result = (first.row[sort.index] ?? '').localeCompare(second.row[sort.index] ?? '', 'vi', { numeric: true })
    return sort.ascending ? result : -result
  })
  const pagedRows = sortedRows.slice(0, pageSize)
  const numericModuleColumns = config.columns.map((column, index) => /Số|Hợp lệ|Lỗi|Thứ tự|Đơn hàng/.test(column) ? index + 1 : -1).filter((index) => index >= 0)
  const resetForm = () => { setDraft(config.columns.map(() => '')); setEditingIndex(null); setFormOpen(false) }
  const openAdd = () => { if (!canCreate) return; setDraft(config.columns.map(() => '')); setEditingIndex(null); setFormOpen(true) }
  const openEdit = (index: number) => { setDraft([...rows[index]]); setEditingIndex(index); setFormOpen(true) }
  const saveRow = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextRow = draft.map((value, index) => value.trim() || (index === config.columns.length - 1 ? 'Bản nháp' : '—'))
    if (!nextRow[0] || nextRow[0] === '—') return
    if (editingIndex === null && !canCreate) return
    setRows((current) => {
      const nextRows = editingIndex === null ? [nextRow, ...current] : current.map((row, index) => index === editingIndex ? nextRow : row)
      if (pathname === '/admin/customers' || pathname === '/admin/orders') persistStorefrontAdminRows(pathname, nextRows)
      return nextRows
    })
    resetForm()
  }
  const removeRow = (index: number) => setRows((current) => {
    const nextRows = current.filter((_, rowIndex) => rowIndex !== index)
    if (pathname === '/admin/customers' || pathname === '/admin/orders') persistStorefrontAdminRows(pathname, nextRows)
    return nextRows
  })
  const toggleHidden = (index: number) => setHiddenRows((current) => current.includes(index) ? current.filter((rowIndex) => rowIndex !== index) : [...current, index])
  const item = (href: string, label: string, icon: string) => <a className={`flex items-center gap-3 rounded-xl px-3 py-2.5 font-body text-sm transition-colors ${pathname === href ? 'bg-[rgba(155,148,47,.12)] font-semibold text-[var(--color-olive-dark)]' : 'text-[#62655f] hover:bg-[#f5f3ec] hover:text-[var(--color-ink)]'}`} href={href} aria-current={pathname === href ? 'page' : undefined}><i className={`bi ${icon}`} aria-hidden="true" />{label}</a>
  return <div className="admin-shell flex min-h-screen bg-[#f7f7f2] text-[var(--color-ink)]"><aside className={`admin-sidebar fixed inset-y-0 left-0 z-40 flex w-72 -translate-x-full flex-col border-r border-[#e5e2d7] bg-white transition-transform duration-300 lg:static lg:translate-x-0 ${sidebarOpen ? 'is-open translate-x-0' : ''}`}><div className="flex h-20 items-center justify-between border-b border-[#eeeae0] px-6"><a className="font-display text-lg font-semibold tracking-[.08em] text-[var(--color-ink)]" href="/#home">LINERY <span className="font-body text-xs font-normal tracking-[.18em] text-[var(--color-olive)]">QUẢN TRỊ</span></a><button className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#dedbd0] lg:hidden" type="button" aria-label="Đóng menu quản trị" onClick={() => setSidebarOpen(false)}><i className="bi bi-x-lg" aria-hidden="true" /></button></div><nav className="flex-1 space-y-1 overflow-y-auto p-4" aria-label="Điều hướng quản trị"><p className="px-3 pb-2 pt-3 font-body text-xs font-semibold uppercase tracking-[.14em] text-[#98968c]">Khu vực quản trị</p>{item('/admin', 'Tổng quan', 'bi-grid-1x2-fill')}<AdminBookSubnav pathname={pathname} /><p className="px-3 pb-2 pt-7 font-body text-xs font-semibold uppercase tracking-[.14em] text-[#98968c]">Bán hàng</p>{item('/admin/orders', 'Đơn hàng', 'bi-bag')}{item('/admin/customers', 'Khách hàng', 'bi-person-lines-fill')}{item('/admin/stores', 'Điểm bán và kho', 'bi-shop')}{item('/admin/inventory', 'Quản lý kho', 'bi-box-seam')}{item('/admin/promotions', 'Chương trình khuyến mãi', 'bi-ticket-perforated')}<p className="px-3 pb-2 pt-7 font-body text-xs font-semibold uppercase tracking-[.14em] text-[#98968c]">Nội dung</p>{item('/admin/authors', 'Tác giả', 'bi-people')}{item('/admin/publishers', 'Nhà xuất bản', 'bi-building')}{item('/admin/news', 'Tin tức', 'bi-newspaper')}{item('/admin/media', 'Media', 'bi-images')}{item('/admin/collections', 'Collection', 'bi-collection')}<p className="px-3 pb-2 pt-7 font-body text-xs font-semibold uppercase tracking-[.14em] text-[#98968c]">Hệ thống</p>{item('/admin/website', 'Website & footer', 'bi-window')}{item('/admin/locations', 'Địa điểm', 'bi-geo-alt')}{item('/admin/payments', 'Thanh toán', 'bi-credit-card')}{item('/admin/chatbot', 'Gemini chatbot', 'bi-chat-dots')}{item('/admin/settings', 'Cài đặt', 'bi-sliders')}</nav><div className="border-t border-[#eeeae0] p-4"><a className="flex items-center gap-3 rounded-xl px-3 py-2.5 font-body text-sm text-[#62655f] hover:bg-[#f5f3ec]" href="/#home"><i className="bi bi-arrow-left" aria-hidden="true" />Về cửa hàng</a></div></aside>{sidebarOpen && <button className="fixed inset-0 z-30 bg-[rgba(31,42,36,.32)] lg:hidden" type="button" aria-label="Đóng menu quản trị" onClick={() => setSidebarOpen(false)} />}<div className="min-w-0 flex-1"><header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-[#e5e2d7] bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8"><div className="flex items-center gap-3"><button className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#dedbd0] lg:hidden" type="button" aria-label="Mở menu quản trị" onClick={() => setSidebarOpen(true)}><i className="bi bi-list" aria-hidden="true" /></button><div><p className="font-body text-sm text-[#8b8d86]">Quản trị</p><h1 className="font-display text-xl font-semibold tracking-tight sm:text-2xl">{config.title}</h1></div></div><button className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-olive)] font-display text-sm text-white" type="button" aria-label="Hồ sơ quản trị">K</button></header><main className="mx-auto w-full max-w-[1440px] p-4 sm:p-6 lg:p-8"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="mb-2 font-body text-sm font-semibold uppercase tracking-[.14em] text-[var(--color-olive)]">{config.section}</p><h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">{config.title}</h2><p className="mt-2 max-w-3xl font-body text-sm leading-6 text-[#74776f]">{config.description}</p></div><button className="admin-primary-action inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--color-olive)] px-5 font-body text-sm font-medium text-white hover:bg-[var(--color-olive-dark)]" type="button" onClick={openAdd}><i className="bi bi-plus-lg mr-2" aria-hidden="true" />{config.addLabel}</button></div>{formOpen && <form className="mt-6 rounded-2xl border border-[#e6e2d7] bg-white p-5" onSubmit={saveRow}><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{config.columns.map((column, index) => <label className="block" key={column}><span className="mb-1.5 block font-body text-sm font-medium">{column}{index === 0 && <span className="ml-1 text-[var(--color-olive-dark)]">*</span>}</span>{index === config.columns.length - 1 ? <select className="min-h-11 w-full rounded-xl border border-[#dedbd0] bg-[#fcfbf7] px-3.5 font-body text-sm" value={draft[index]} onChange={(event) => setDraft((current) => current.map((value, valueIndex) => valueIndex === index ? event.target.value : value))}><option value="">Chọn trạng thái</option><option>Đang hoạt động</option><option>Bản nháp</option><option>Đã cấu hình</option><option>Tạm ẩn</option><option>Đang tắt</option></select> : <input className="min-h-11 w-full rounded-xl border border-[#dedbd0] bg-[#fcfbf7] px-3.5 font-body text-sm" value={draft[index]} onChange={(event) => setDraft((current) => current.map((value, valueIndex) => valueIndex === index ? event.target.value : value))} placeholder={`Nhập ${column.toLowerCase()}`} />}</label>)}</div><div className="mt-5 flex justify-end gap-3"><button className="inline-flex min-h-10 rounded-xl border border-[#dedbd0] px-5 font-body text-sm" type="button" onClick={resetForm}>Hủy</button><button className="admin-primary-action inline-flex min-h-10 rounded-xl bg-[var(--color-olive)] px-5 font-body text-sm font-medium text-white" type="submit">{editingIndex === null ? 'Thêm mới' : 'Lưu thay đổi'}</button></div></form>}<section className="mt-6 overflow-hidden rounded-2xl border border-[#e6e2d7] bg-white"><div className="flex flex-col gap-3 border-b border-[#eeeae0] p-5 sm:flex-row sm:items-center sm:justify-between"><div><h3 className="font-display text-lg font-semibold">Danh sách dữ liệu</h3><p className="mt-1 font-body text-sm text-[#74776f]">{sortedRows.length} bản ghi phù hợp.</p></div><label className="relative min-w-0 sm:w-80"><span className="sr-only">Tìm kiếm</span><i className="bi bi-search pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8b8d86]" aria-hidden="true" /><input className="min-h-10 w-full rounded-xl border border-[#dedbd0] bg-[#fcfbf7] pl-10 pr-3 font-body text-sm" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Tìm trong ${config.title.toLowerCase()}`} /></label></div>{sortedRows.length ? <><div className="overflow-x-auto"><table className="min-w-[900px] w-full text-left"><thead className="bg-[#fcfbf7]"><tr><th className="w-16 px-4 py-3 font-body text-sm font-semibold">STT</th>{config.columns.map((column, index) => <th className="px-4 py-3 font-body text-sm font-semibold" key={column}><button className="inline-flex items-center gap-1.5" type="button" onClick={() => setSort((current) => ({ index, ascending: current.index === index ? !current.ascending : true }))}>{column}<span className="text-xs text-[#98968c]">{sort.index === index ? (sort.ascending ? '↑' : '↓') : '↕'}</span></button></th>)}<th className="w-36 px-4 py-3 text-right font-body text-sm font-semibold">Thao tác</th></tr></thead><tbody>{pagedRows.map(({ row, index }, rowIndex) => <tr className={`border-t border-[#eeeae0] ${hiddenRows.includes(index) ? 'bg-[#faf9f5] text-[#98968c]' : ''}`} key={`${index}-${row.join('-')}`}><td className="px-4 py-3 font-body text-sm text-[#74776f]">{rowIndex + 1}</td>{row.map((value, cellIndex) => <td className="px-4 py-3 font-body text-sm" key={`${cellIndex}-${value}`}>{cellIndex === row.length - 1 ? <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${hiddenRows.includes(index) ? 'bg-[#f2f1ec] text-[#8b8d86]' : 'bg-[#edf7ef] text-[#39733e]'}`}>{hiddenRows.includes(index) ? 'Tạm ẩn' : value}</span> : value}</td>)}<td className="px-4 py-3 text-right"><div className="flex justify-end gap-1"><button className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#74776f] hover:bg-[#f5f3ec]" type="button" aria-label={`Sửa ${row[0]}`} onClick={() => openEdit(index)}><i className="bi bi-pencil" aria-hidden="true" /></button><button className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#74776f] hover:bg-[#f5f3ec]" type="button" aria-label={hiddenRows.includes(index) ? `Hiện ${row[0]}` : `Tạm ẩn ${row[0]}`} onClick={() => toggleHidden(index)}><i className={`bi ${hiddenRows.includes(index) ? 'bi-eye' : 'bi-eye-slash'}`} aria-hidden="true" /></button><button className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#8b8d86] hover:bg-[#f1e8e5] hover:text-[#a33d32]" type="button" aria-label={`Xóa ${row[0]}`} onClick={() => removeRow(index)}><i className="bi bi-trash3" aria-hidden="true" /></button></div></td></tr>)}</tbody><tfoot><AdminSummaryRow rows={rows} numericColumns={numericModuleColumns} columnCount={config.columns.length + 2} /></tfoot></table></div><AdminTableFooter total={sortedRows.length} pageSize={pageSize} onPageSizeChange={setPageSize} /></> : <div className="px-5 py-14 text-center"><i className="bi bi-inbox text-3xl text-[var(--color-olive)]" aria-hidden="true" /><h3 className="mt-3 font-display text-lg font-semibold">{config.empty}</h3><p className="mt-2 font-body text-sm text-[#74776f]">Dữ liệu sẽ xuất hiện tại đây sau khi kết nối backend.</p></div>}</section></main></div></div>
}


type FooterArticleLink = { label: string; articleSlug: string; status: string }
type BannerPositionRecord = { code: string; name: string; display: string; status: string }
type BannerRecord = { id?: string; name: string; position: string; image: string; order: string; status: string; mediaAssetId?: string }

function AdminWebsiteConfigPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const requestedTab = new URLSearchParams(window.location.search).get('tab')
  const initialTab = requestedTab === 'positions' || requestedTab === 'banners' ? requestedTab : 'footer'
  const [tab, setTab] = useState<'footer' | 'positions' | 'banners'>(initialTab)
  const [footerLinks, setFooterLinks] = useState<Record<string, FooterArticleLink[]>>({
    'About Us': [{ label: 'Giới thiệu', articleSlug: 'gioi-thieu', status: 'Đã gán' }, { label: 'Liên hệ', articleSlug: 'lien-he', status: 'Đã gán' }],
    'Chính sách - điều khoản': [{ label: 'Chính sách', articleSlug: 'chinh-sach', status: 'Đã gán' }, { label: 'Điều khoản', articleSlug: 'dieu-khoan', status: 'Đã gán' }],
  })
  const [positions, setPositions] = useState<BannerPositionRecord[]>([
    { code: 'HOME_HERO', name: 'Trang chủ - Hero', display: 'Desktop / mobile', status: 'Đang hoạt động' },
    { code: 'HOME_PROMO', name: 'Trang chủ - Khuyến mãi', display: 'Desktop / mobile', status: 'Đang hoạt động' },
  ])
  const [banners, setBanners] = useState<BannerRecord[]>([
    { name: 'Hero LineryBooks 01', position: 'HOME_HERO', image: '/assets/hero-children.png', order: '1', status: 'Đang hoạt động' },
    { name: 'Hero LineryBooks 02', position: 'HOME_HERO', image: '/assets/hero-children.png', order: '2', status: 'Đang hoạt động' },
    { name: 'New & Upcoming', position: 'HOME_PROMO', image: '/assets/hero-children.png', order: '1', status: 'Bản nháp' },
  ])
  const [positionDraft, setPositionDraft] = useState({ code: '', name: '', display: 'Desktop / mobile' })
  const [bannerDraft, setBannerDraft] = useState<{ name: string; position: string; order: string; image: string; file: File | null }>({ name: '', position: 'HOME_HERO', order: '1', image: '', file: null })
  const [saved, setSaved] = useState('')
  const [uploading, setUploading] = useState(false)
  useEffect(() => {
    let cancelled = false
    if (!supabase) return undefined
    supabase.from('site_banners').select('id,name,position_code,media_asset_id,sort_order,status,site_media_assets(public_url)').order('position_code').order('sort_order').then(({ data, error }) => {
      if (cancelled || error || !data?.length) return
      setBanners((data as Array<Record<string, unknown>>).map((row) => {
        const asset = Array.isArray(row.site_media_assets) ? row.site_media_assets[0] as Record<string, unknown> | undefined : row.site_media_assets as Record<string, unknown> | null
        return { id: String(row.id), name: String(row.name), position: String(row.position_code), image: String(asset?.public_url ?? ''), order: String(row.sort_order ?? 1), status: String(row.status) === 'published' ? 'Đang hoạt động' : 'Bản nháp', mediaAssetId: String(row.media_asset_id) }
      }))
    })
    return () => { cancelled = true }
  }, [])
  const item = (href: string, label: string, icon: string) => <a className={`flex items-center gap-3 rounded-xl px-3 py-2.5 font-body text-sm transition-colors ${window.location.pathname === href ? 'bg-[rgba(155,148,47,.12)] font-semibold text-[var(--color-olive-dark)]' : 'text-[#62655f] hover:bg-[#f5f3ec] hover:text-[var(--color-ink)]'}`} href={href}><i className={`bi ${icon}`} aria-hidden="true" />{label}</a>
  const saveFooter = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!supabase) { setSaved('Chưa cấu hình kết nối Supabase.'); return }
    try {
      const menuItems = await loadAdminMenuItems()
      const footerLinksByLabel = Object.values(footerLinks).flat().reduce<Record<string, string>>((result, link) => ({ ...result, [link.label]: `/news/${link.articleSlug}` }), {})
      await Promise.all(menuItems.filter((item) => item.menuKey === 'footer-main' && footerLinksByLabel[item.label]).map((item) => updateAdminMenuItem({ ...item, href: footerLinksByLabel[item.label] })))
      setSaved('Đã lưu cấu hình footer vào Supabase.')
    } catch (error) {
      setSaved(`Không thể lưu footer: ${error instanceof Error ? error.message : 'lỗi không xác định'}`)
    }
  }
  const addPosition = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); if (!positionDraft.code.trim() || !positionDraft.name.trim()) return; setPositions((current) => [...current, { ...positionDraft, code: positionDraft.code.trim().toUpperCase(), status: 'Đang hoạt động' }]); setPositionDraft({ code: '', name: '', display: 'Desktop / mobile' }); setSaved('Đã thêm vị trí banner.') }
  const addBanner = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const file = document.querySelector<HTMLInputElement>('input[type="file"][accept="image/png,image/jpeg,image/webp"]')?.files?.[0] ?? null
    if (!bannerDraft.name.trim() || !file || !supabase) { setSaved('Vui lòng chọn ảnh và kiểm tra kết nối database.'); return }
    setUploading(true)
    setSaved('')
    try {
      const safeName = file.name.toLowerCase().replace(/[^a-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '')
      const storagePath = `banners/${Date.now()}-${safeName || 'banner'}`
      const upload = await supabase.storage.from('site-media').upload(storagePath, file, { contentType: file.type, upsert: false })
      if (upload.error) throw upload.error
      const publicUrl = supabase.storage.from('site-media').getPublicUrl(storagePath).data.publicUrl
      const media = await supabase.from('site_media_assets').insert({ storage_path: storagePath, public_url: publicUrl, file_name: file.name, mime_type: file.type, size_bytes: file.size, asset_type: 'banner', alt_text: bannerDraft.name.trim() }).select('id').single()
      if (media.error) throw media.error
      const banner = await supabase.from('site_banners').insert({ name: bannerDraft.name.trim(), position_code: bannerDraft.position, media_asset_id: media.data.id, sort_order: Number(bannerDraft.order) || 1, status: 'draft' }).select('id').single()
      if (banner.error) throw banner.error
      setBanners((current) => [...current, { id: banner.data.id, name: bannerDraft.name.trim(), position: bannerDraft.position, image: publicUrl, order: String(Number(bannerDraft.order) || 1), status: 'Bản nháp', mediaAssetId: media.data.id }])
      setBannerDraft({ name: '', position: positions[0]?.code ?? 'HOME_HERO', order: '1', image: '', file: null })
      setSaved('Đã tải banner lên kho media và lưu metadata vào database.')
    } catch (error) {
      setSaved(`Không thể tải banner: ${error instanceof Error ? error.message : 'lỗi không xác định'}`)
    } finally { setUploading(false) }
  }
  const toggleBannerStatus = async (banner: BannerRecord) => {
    if (!banner.id || !supabase) return
    const nextStatus = banner.status === 'Đang hoạt động' ? 'draft' : 'published'
    const { error } = await supabase.from('site_banners').update({ status: nextStatus, updated_at: new Date().toISOString() }).eq('id', banner.id)
    if (error) { setSaved(`Không thể cập nhật banner: ${error.message}`); return }
    setBanners((current) => current.map((item) => item.id === banner.id ? { ...item, status: nextStatus === 'published' ? 'Đang hoạt động' : 'Bản nháp' } : item))
    setSaved(nextStatus === 'published' ? 'Đã xuất bản banner ra website.' : 'Đã chuyển banner về bản nháp.')
  }
  const groupedCount = (code: string) => banners.filter((banner) => banner.position === code).length
  return <div className="admin-shell flex min-h-screen bg-[#f7f7f2] text-[var(--color-ink)]"><aside className={`admin-sidebar fixed inset-y-0 left-0 z-40 flex w-72 -translate-x-full flex-col border-r border-[#e5e2d7] bg-white transition-transform duration-300 lg:static lg:translate-x-0 ${sidebarOpen ? 'is-open translate-x-0' : ''}`}><div className="flex h-16 items-center justify-between border-b border-[#eeeae0] px-5"><a className="admin-brand-link" href="/#home" aria-label="LineryBooks"><AdminBrand /></a><button className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#dedbd0] lg:hidden" type="button" aria-label="Đóng menu quản trị" onClick={() => setSidebarOpen(false)}><i className="bi bi-x-lg" aria-hidden="true" /></button></div><AdminManagementSidebar pathname="/admin/website" /></aside>{sidebarOpen && <button className="fixed inset-0 z-30 bg-[rgba(31,42,36,.32)] lg:hidden" type="button" aria-label="Đóng menu quản trị" onClick={() => setSidebarOpen(false)} />}<div className="min-w-0 flex-1"><header className="flex min-h-16 items-center justify-between border-b border-[#e5e2d7] bg-white px-4 sm:px-5 lg:px-6"><div className="flex items-center gap-2"><button className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#dedbd0] lg:hidden" type="button" aria-label="Mở menu quản trị" onClick={() => setSidebarOpen(true)}><i className="bi bi-list" aria-hidden="true" /></button><h1 className="font-body text-lg font-semibold tracking-tight">Cấu hình website</h1></div><button className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-olive)] font-body text-sm text-white" type="button" aria-label="Hồ sơ quản trị">K</button></header><main className="w-full p-3 sm:p-4 lg:p-5"><div className="admin-page-toolbar mb-4 flex min-h-10 items-center justify-between gap-3"><div className="admin-breadcrumb flex min-w-0 items-center gap-2 font-body text-sm text-[#8b8d86]"><a href="/admin">Quản trị</a><i className="bi bi-chevron-right text-xs" aria-hidden="true" /><span>HỆ THỐNG</span><i className="bi bi-chevron-right text-xs" aria-hidden="true" /><span className="font-medium text-[var(--color-ink)]">Cấu hình website</span></div></div><nav className="mb-4 flex flex-wrap gap-1 border-b border-[#e6e2d7]" aria-label="Cấu hình website">{[['footer','Footer'],['positions','Vị trí banner'],['banners','Quản lý banner']].map(([value, label]) => <button className={`border-b-2 px-4 py-3 font-body text-sm ${tab === value ? 'border-[var(--color-olive)] font-semibold text-[var(--color-olive-dark)]' : 'border-transparent text-[#74776f]'}`} type="button" key={value} onClick={() => setTab(value as typeof tab)}>{label}</button>)}</nav>{saved && <p className="mb-4 rounded-xl border border-[#cfe5d1] bg-[#f1f8f1] p-3 font-body text-sm text-[#39733e]" role="status">{saved}</p>}{tab === 'footer' && <form onSubmit={saveFooter} className="grid gap-4 xl:grid-cols-2"><section className="rounded-xl border border-[#e6e2d7] bg-white p-4"><div className="border-b border-[#eeeae0] pb-3"><h2 className="font-display text-lg font-semibold">Footer người dùng</h2><p className="mt-1 font-body text-sm text-[#74776f]">Mỗi mục hiển thị ở footer phải liên kết tới một bài viết trong quản lý Tin tức.</p></div><div className="mt-4 space-y-5">{Object.entries(footerLinks).map(([column, links]) => <fieldset key={column}><legend className="font-body text-sm font-semibold">{column}</legend><div className="mt-2 space-y-3">{links.map((link, index) => <div className="grid gap-2 sm:grid-cols-[140px_minmax(0,1fr)]" key={link.label}><label className="flex items-center font-body text-sm text-[#62655f]">{link.label}</label><select className="min-h-10 w-full rounded-lg border border-[#dedbd0] bg-[#fcfbf7] px-3 font-body text-sm" value={link.articleSlug} onChange={(event) => setFooterLinks((current) => ({ ...current, [column]: current[column].map((item, itemIndex) => itemIndex === index ? { ...item, articleSlug: event.target.value, status: 'Đã gán' } : item) }))}><option value="gioi-thieu">Giới thiệu — bài viết Tin tức</option><option value="lien-he">Liên hệ — bài viết Tin tức</option><option value="chinh-sach">Chính sách — bài viết Tin tức</option><option value="dieu-khoan">Điều khoản — bài viết Tin tức</option></select></div>)}</div></fieldset>)}</div><button className="mt-5 inline-flex min-h-10 items-center justify-center rounded-lg bg-[var(--color-olive)] px-4 font-body text-sm font-medium text-white" type="submit">Lưu cấu hình footer</button></section><aside className="rounded-xl border border-[#e6e2d7] bg-[#fcfbf7] p-4"><h2 className="font-display text-lg font-semibold">Quy tắc nhập liệu</h2><ul className="mt-3 list-disc space-y-2 pl-5 font-body text-sm leading-6 text-[#62655f]"><li>Không nhập URL thủ công; chỉ chọn bài viết đã tạo trong Tin tức.</li><li>Bài viết nên có tiêu đề, đường dẫn, nội dung, trạng thái xuất bản và SEO.</li><li>Chỉ bài viết đã xuất bản mới được hiển thị ngoài website.</li><li>Có thể thay bài viết đích mà không cần sửa code footer.</li></ul></aside></form>}{tab === 'positions' && <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]"><section className="overflow-hidden rounded-xl border border-[#e6e2d7] bg-white"><div className="border-b border-[#eeeae0] p-4"><h2 className="font-display text-lg font-semibold">Vị trí banner</h2><p className="mt-1 font-body text-sm text-[#74776f]">Mỗi vị trí có mã ổn định để gán banner ở frontend.</p></div><div className="overflow-x-auto"><table className="min-w-[720px] w-full text-left"><thead className="bg-[#fcfbf7]"><tr>{['Mã vị trí','Tên vị trí','Hiển thị','Số banner','Trạng thái'].map((heading) => <th className="px-4 py-3 font-body text-sm font-semibold" key={heading}>{heading}</th>)}</tr></thead><tbody>{positions.map((position) => <tr className="border-t border-[#eeeae0]" key={position.code}><td className="px-4 py-3 font-body text-sm font-semibold text-[var(--color-olive-dark)]">{position.code}</td><td className="px-4 py-3 font-body text-sm">{position.name}</td><td className="px-4 py-3 font-body text-sm">{position.display}</td><td className="px-4 py-3 font-body text-sm">{groupedCount(position.code)}{groupedCount(position.code) > 1 && <span className="ml-2 rounded-full bg-[#eef6ff] px-2 py-1 text-xs font-semibold text-[#2680d9]">Carousel tự động</span>}</td><td className="px-4 py-3 font-body text-sm"><span className="rounded-full bg-[#edf7ef] px-2.5 py-1 text-xs font-semibold text-[#39733e]">{position.status}</span></td></tr>)}</tbody></table></div></section><form className="rounded-xl border border-[#e6e2d7] bg-white p-4" onSubmit={addPosition}><h2 className="font-display text-lg font-semibold">Tạo vị trí</h2><div className="mt-4 space-y-3"><label className="block"><span className="mb-1.5 block font-body text-sm font-medium">Mã vị trí *</span><input className="min-h-10 w-full rounded-lg border border-[#dedbd0] bg-[#fcfbf7] px-3 font-body text-sm" value={positionDraft.code} onChange={(event) => setPositionDraft((current) => ({ ...current, code: event.target.value }))} placeholder="HOME_HERO" required /></label><label className="block"><span className="mb-1.5 block font-body text-sm font-medium">Tên vị trí *</span><input className="min-h-10 w-full rounded-lg border border-[#dedbd0] bg-[#fcfbf7] px-3 font-body text-sm" value={positionDraft.name} onChange={(event) => setPositionDraft((current) => ({ ...current, name: event.target.value }))} placeholder="Trang chủ - Hero" required /></label><label className="block"><span className="mb-1.5 block font-body text-sm font-medium">Thiết bị hiển thị</span><select className="min-h-10 w-full rounded-lg border border-[#dedbd0] bg-[#fcfbf7] px-3 font-body text-sm" value={positionDraft.display} onChange={(event) => setPositionDraft((current) => ({ ...current, display: event.target.value }))}><option>Desktop / mobile</option><option>Chỉ desktop</option><option>Chỉ mobile</option></select></label></div><button className="mt-4 inline-flex min-h-10 items-center justify-center rounded-lg bg-[var(--color-olive)] px-4 font-body text-sm font-medium text-white" type="submit">Thêm vị trí</button></form></div>}{tab === 'banners' && <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]"><section className="overflow-hidden rounded-xl border border-[#e6e2d7] bg-white"><div className="border-b border-[#eeeae0] p-4"><h2 className="font-display text-lg font-semibold">Quản lý banner</h2><p className="mt-1 font-body text-sm text-[#74776f]">Banner cùng mã vị trí sẽ hiển thị theo thứ tự; từ 2 ảnh trở lên sẽ tự chạy carousel.</p></div><div className="overflow-x-auto"><table className="min-w-[820px] w-full text-left"><thead className="bg-[#fcfbf7]"><tr>{['Banner','Vị trí','Thứ tự','Trạng thái'].map((heading) => <th className="px-4 py-3 font-body text-sm font-semibold" key={heading}>{heading}</th>)}</tr></thead><tbody>{banners.sort((a, b) => a.position.localeCompare(b.position) || Number(a.order) - Number(b.order)).map((banner) => <tr className="border-t border-[#eeeae0]" key={`${banner.position}-${banner.order}-${banner.name}`}><td className="px-4 py-3 font-body text-sm"><div className="flex items-center gap-3"><img className="h-12 w-20 rounded-lg object-cover" src={banner.image} alt="" loading="lazy" /><span>{banner.name}</span></div></td><td className="px-4 py-3 font-body text-sm">{banner.position}</td><td className="px-4 py-3 font-body text-sm">{banner.order}</td><td className="px-4 py-3 font-body text-sm"><div className="flex items-center justify-between gap-3"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${banner.status === 'Đang hoạt động' ? 'bg-[#edf7ef] text-[#39733e]' : 'bg-[#f5f3ec] text-[#74776f]'}`}>{banner.status}</span>{banner.id && <button className="font-body text-xs text-[var(--color-olive-dark)] underline-offset-2 hover:underline" type="button" onClick={() => void toggleBannerStatus(banner)}>{banner.status === 'Đang hoạt động' ? 'Ẩn' : 'Xuất bản'}</button>}</div></td></tr>)}</tbody></table></div></section><form className="rounded-xl border border-[#e6e2d7] bg-white p-4" onSubmit={addBanner}><h2 className="font-display text-lg font-semibold">Upload banner</h2><div className="mt-4 space-y-3"><label className="block"><span className="mb-1.5 block font-body text-sm font-medium">Tên banner *</span><input className="min-h-10 w-full rounded-lg border border-[#dedbd0] bg-[#fcfbf7] px-3 font-body text-sm" value={bannerDraft.name} onChange={(event) => setBannerDraft((current) => ({ ...current, name: event.target.value }))} placeholder="Hero LineryBooks" required /></label><label className="block"><span className="mb-1.5 block font-body text-sm font-medium">Vị trí *</span><select className="min-h-10 w-full rounded-lg border border-[#dedbd0] bg-[#fcfbf7] px-3 font-body text-sm" value={bannerDraft.position} onChange={(event) => setBannerDraft((current) => ({ ...current, position: event.target.value }))}>{positions.map((position) => <option value={position.code} key={position.code}>{position.name} ({position.code})</option>)}</select></label><label className="block"><span className="mb-1.5 block font-body text-sm font-medium">Thứ tự *</span><input className="min-h-10 w-full rounded-lg border border-[#dedbd0] bg-[#fcfbf7] px-3 font-body text-sm" type="number" min="1" value={bannerDraft.order} onChange={(event) => setBannerDraft((current) => ({ ...current, order: event.target.value }))} required /></label><label className="block"><span className="mb-1.5 block font-body text-sm font-medium">Ảnh banner *</span><input className="block min-h-10 w-full cursor-pointer rounded-lg border border-dashed border-[var(--color-olive)] bg-[#fcfbf7] px-3 py-2 font-body text-sm" type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => { const file = event.target.files?.[0]; if (file) setBannerDraft((current) => ({ ...current, image: URL.createObjectURL(file) })) }} required={!bannerDraft.image} /><p className="mt-1 font-body text-xs text-[#8b8d86]">Upload file JPG, PNG hoặc WebP; không nhập URL.</p></label></div><button className="mt-4 inline-flex min-h-10 items-center justify-center rounded-lg bg-[var(--color-olive)] px-4 font-body text-sm font-medium text-white" type="submit">Thêm banner</button></form></div>}</main></div></div>
}

function adminStatusTone(status: string) {
  const value = status.toLowerCase()
  if (/(hủy|bỏ dở|hết hạn|tạm khóa|hết hàng|lỗi)/u.test(value)) return 'is-danger'
  if (/(chờ|nháp|tạm ẩn|pending|processing)/u.test(value)) return 'is-warning'
  if (/(xác nhận|đang hoạt động|đang sử dụng|còn hàng|đã giao|hoàn tất|published|paid)/u.test(value)) return 'is-success'
  return 'is-info'
}

function AdminModulePageV3({ pathname, config }: { pathname: string; config: AdminModuleConfig }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [columnFilters, setColumnFilters] = useState<Record<number, string>>({})
  const [rows, setRows] = useState(() => getStorefrontAdminRows(pathname, config.rows))
  const [sort, setSort] = useState({ index: 0, ascending: true })
  const [pageSize, setPageSize] = useState(10)
  const [page, setPage] = useState(1)
  const [formOpen, setFormOpen] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [draft, setDraft] = useState<string[]>(() => config.columns.map(() => ''))
  const canCreate = pathname !== '/admin/orders' && pathname !== '/admin/customers' && pathname !== '/admin/inventory'
  const isStorefrontData = pathname === '/admin/orders' || pathname === '/admin/customers'

  useEffect(() => {
    document.body.dataset.adminModule = pathname
    const syncStorefrontData = () => setRows(getStorefrontAdminRows(pathname, config.rows))
    window.addEventListener('linery-storefront-data-changed', syncStorefrontData)
    return () => { delete document.body.dataset.adminModule; window.removeEventListener('linery-storefront-data-changed', syncStorefrontData) }
  }, [pathname, config.rows])

  const filteredRows = rows.map((row, index) => ({ row, index })).filter(({ row }) => {
    const matchesQuery = row.join(' ').toLowerCase().includes(query.trim().toLowerCase())
    const matchesStatus = statusFilter === 'all' || row[row.length - 1] === statusFilter
    const matchesColumns = Object.entries(columnFilters).every(([columnIndex, value]) => value === 'all' || row[Number(columnIndex)] === value)
    return matchesQuery && matchesStatus && matchesColumns
  })
  const sortedRows = [...filteredRows].sort((first, second) => {
    const result = (first.row[sort.index] ?? '').localeCompare(second.row[sort.index] ?? '', 'vi', { numeric: true })
    return sort.ascending ? result : -result
  })
  const pagedRows = sortedRows.slice((page - 1) * pageSize, page * pageSize)
  const numericColumns = config.columns.map((column, index) => /Số|Hợp lệ|Lỗi|Thứ tự|Đơn hàng/.test(column) ? index + 1 : -1).filter((index) => index >= 0)
  const statusOptions = Array.from(new Set(rows.map((row) => row[row.length - 1]).filter(Boolean)))
  const filterableColumns = config.columns.map((column, index) => ({ column, index })).filter(({ column, index }) => index < config.columns.length - 1 && /(phân loại|kênh|loại|hiển thị|danh mục|chủ đề|nhà xuất bản)/iu.test(column) && new Set(rows.map((row) => row[index]).filter(Boolean)).size > 1).map(({ column, index }) => ({ column, label: `Tất cả ${column.toLowerCase()}`, index, options: Array.from(new Set(rows.map((row) => row[index]).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'vi')).map((value) => ({ label: value, value })) }))
  useEffect(() => { setPage(1) }, [query, statusFilter, columnFilters, sort.index, sort.ascending, pageSize])
  useEffect(() => {
    document.querySelectorAll<HTMLElement>('.admin-shell table tbody tr').forEach((row) => {
      const cells = Array.from(row.querySelectorAll<HTMLElement>(':scope > td'))
      const statusCell = cells[cells.length - 2]
      const badge = statusCell?.querySelector<HTMLElement>('span')
      if (!badge || !badge.textContent) return
      badge.classList.add('admin-status-badge', adminStatusTone(badge.textContent.trim()))
    })
  }, [pagedRows])
  const saveRows = (nextRows: string[][]) => {
    setRows(nextRows)
    if (isStorefrontData) persistStorefrontAdminRows(pathname, nextRows)
  }
  const resetForm = () => { setFormOpen(false); setEditingIndex(null); setDraft(config.columns.map(() => '')) }
  const saveRow = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (editingIndex === null && !canCreate) return
    const nextRow = draft.map((value, index) => value.trim() || (index === config.columns.length - 1 ? 'Bản nháp' : '—'))
    if (!nextRow[0] || nextRow[0] === '—') return
    const nextRows = editingIndex === null ? [nextRow, ...rows] : rows.map((row, index) => index === editingIndex ? nextRow : row)
    saveRows(nextRows)
    resetForm()
  }
  const removeRow = (index: number) => saveRows(rows.filter((_, rowIndex) => rowIndex !== index))
  const openEdit = (index: number) => { setDraft([...rows[index]]); setEditingIndex(index); setFormOpen(true) }
  const item = (href: string, label: string, icon: string) => <a className={`flex items-center gap-3 rounded-xl px-3 py-2.5 font-body text-sm transition-colors ${pathname === href ? 'bg-[rgba(155,148,47,.12)] font-semibold text-[var(--color-olive-dark)]' : 'text-[#62655f] hover:bg-[#f5f3ec] hover:text-[var(--color-ink)]'}`} href={href} aria-current={pathname === href ? 'page' : undefined}><i className={`bi ${icon}`} aria-hidden="true" />{label}</a>
  return <div className="admin-shell flex min-h-screen bg-[#f7f7f2] text-[var(--color-ink)]">
    <aside className={`admin-sidebar fixed inset-y-0 left-0 z-40 flex w-72 -translate-x-full flex-col border-r border-[#e5e2d7] bg-white transition-transform duration-300 lg:static lg:translate-x-0 ${sidebarOpen ? 'is-open translate-x-0' : ''}`}>
      <div className="flex h-20 items-center justify-between border-b border-[#eeeae0] px-6"><a className="admin-brand-link" href="/#home" aria-label="LineryBooks"><AdminBrand /></a><button className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#dedbd0] lg:hidden" type="button" aria-label="Đóng menu quản trị" onClick={() => setSidebarOpen(false)}><i className="bi bi-x-lg" aria-hidden="true" /></button></div>
      <AdminManagementSidebar pathname={pathname} />
      <div className="border-t border-[#eeeae0] p-4">{item('/#home', 'Về cửa hàng', 'bi-arrow-left')}</div>
    </aside>
    {sidebarOpen && <button className="fixed inset-0 z-30 bg-[rgba(31,42,36,.32)] lg:hidden" type="button" aria-label="Đóng menu quản trị" onClick={() => setSidebarOpen(false)} />}
    <div className="min-w-0 flex-1">
      <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-[#e5e2d7] bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8"><div className="flex items-center gap-3"><button className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#dedbd0] lg:hidden" type="button" aria-label="Mở menu quản trị" onClick={() => setSidebarOpen(true)}><i className="bi bi-list" aria-hidden="true" /></button><h1 className="font-body text-xl font-semibold tracking-tight sm:text-2xl">{config.title}</h1></div><button className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-olive)] font-display text-sm text-white" type="button" aria-label="Hồ sơ quản trị">K</button></header>
      <main className="mx-auto w-full max-w-[1440px] p-4 sm:p-6 lg:p-8">
        <div className="admin-page-toolbar mb-4 flex min-h-10 flex-wrap items-center justify-between gap-3"><div className="admin-breadcrumb flex min-w-0 items-center gap-2 font-body text-sm text-[#8b8d86]"><a className="shrink-0 hover:text-[var(--color-olive-dark)]" href="/admin">Quản trị</a><i className="bi bi-chevron-right shrink-0 text-xs" aria-hidden="true" /><span className="shrink-0">{config.section}</span><i className="bi bi-chevron-right shrink-0 text-xs" aria-hidden="true" /><span className="min-w-0 truncate font-medium text-[var(--color-ink)]">{config.title}</span></div>{canCreate && <button className="admin-primary-action inline-flex min-h-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-olive)] px-4 font-body text-sm font-medium text-white hover:bg-[var(--color-olive-dark)]" type="button" onClick={() => { setEditingIndex(null); setDraft(config.columns.map(() => '')); setFormOpen(true) }}><i className="bi bi-plus-lg mr-2" aria-hidden="true" />{config.addLabel}</button>}</div>
        {pathname === '/admin/chatbot' && <section className="admin-chatbot-console mb-4 grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(260px,.8fr)]">
          <div className="min-w-0 rounded-2xl border border-[#e6e2d7] bg-white p-3 shadow-[0_8px_24px_rgba(31,42,36,.035)] sm:p-4"><div className="mb-3 flex items-center justify-between gap-3"><div><h2 className="font-display text-lg font-semibold">Thử chatbot trong quản trị</h2><p className="mt-1 font-body text-sm text-[#74776f]">Dùng cùng luồng AI, nhận diện ảnh bìa và hỏi đáp catalog như phía người dùng.</p></div><span className="inline-flex items-center gap-1.5 rounded-full bg-[#edf7ef] px-2.5 py-1 font-body text-xs font-semibold text-[#39733e]"><i className="bi bi-shield-check" aria-hidden="true" />Đã nối endpoint</span></div><ChatbotWidget embedded /></div>
          <aside className="rounded-2xl border border-[#e6e2d7] bg-[#fcfbf7] p-5"><h2 className="font-display text-lg font-semibold">Vận hành</h2><dl className="mt-4 space-y-4 font-body text-sm"><div><dt className="text-[#8b8d86]">Endpoint</dt><dd className="mt-1 font-medium">/api/chat</dd></div><div><dt className="text-[#8b8d86]">Model</dt><dd className="mt-1 font-medium">Gemini Flash Lite</dd></div><div><dt className="text-[#8b8d86]">API key</dt><dd className="mt-1 font-medium text-[var(--color-olive-dark)]">Cloudflare Secret, không hiển thị</dd></div><div><dt className="text-[#8b8d86]">Đầu vào</dt><dd className="mt-1 font-medium">Văn bản và ảnh bìa</dd></div></dl><p className="mt-5 border-t border-[#e6e2d7] pt-4 font-body text-xs leading-5 text-[#74776f]">Trang này là khu vực kiểm thử cho Dev. Quick prompt và cấu hình bên dưới vẫn giữ để quản lý nội dung vận hành.</p></aside>
        </section>}
        {formOpen && <form className="mb-4 rounded-xl border border-[#e6e2d7] bg-white p-4" onSubmit={saveRow}><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{config.columns.map((column, index) => <label className="block" key={column}><span className="mb-1.5 block font-body text-sm font-medium">{column}{index === 0 && <span className="ml-1 text-[var(--color-olive-dark)]">*</span>}</span>{index === config.columns.length - 1 ? <select className="min-h-10 w-full rounded-lg border border-[#dedbd0] bg-[#fcfbf7] px-3 font-body text-sm" value={draft[index]} onChange={(event) => setDraft((current) => current.map((value, valueIndex) => valueIndex === index ? event.target.value : value))}><option value="">Chọn trạng thái</option><option>Đang hoạt động</option><option>Bản nháp</option><option>Đã cấu hình</option><option>Tạm ẩn</option><option>Đang tắt</option></select> : <input className="min-h-10 w-full rounded-lg border border-[#dedbd0] bg-[#fcfbf7] px-3 font-body text-sm" value={draft[index]} onChange={(event) => setDraft((current) => current.map((value, valueIndex) => valueIndex === index ? event.target.value : value))} placeholder={`Nhập ${column.toLowerCase()}`} />}</label>)}</div><div className="mt-4 flex justify-end gap-2"><button className="inline-flex min-h-9 rounded-lg border border-[#dedbd0] px-4 font-body text-sm" type="button" onClick={resetForm}>Hủy</button><button className="admin-primary-action inline-flex min-h-9 rounded-lg bg-[var(--color-olive)] px-4 font-body text-sm font-medium text-white" type="submit">{editingIndex === null ? 'Thêm mới' : 'Lưu thay đổi'}</button></div></form>}
        <section className="overflow-hidden rounded-xl border border-[#e6e2d7] bg-white">
          <div className="flex flex-col gap-3 border-b border-[#eeeae0] p-3 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-2"><button className={`rounded-lg px-3 py-2 font-body text-sm ${statusFilter === 'all' ? 'bg-[#f5f3ec] font-medium text-[var(--color-ink)]' : 'text-[#74776f]'}`} type="button" onClick={() => setStatusFilter('all')}>Tất cả</button><button className={`rounded-lg px-3 py-2 font-body text-sm ${statusFilter === 'Đang hoạt động' ? 'bg-[#f5f3ec] font-medium text-[var(--color-ink)]' : 'text-[#74776f]'}`} type="button" onClick={() => setStatusFilter('Đang hoạt động')}>Đang hoạt động</button></div><div className="flex flex-wrap items-center gap-2"><label className="relative min-w-0 sm:w-64"><span className="sr-only">Tìm kiếm</span><i className="bi bi-search pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8b8d86]" aria-hidden="true" /><input className="min-h-9 w-full rounded-lg border border-[#dedbd0] bg-[#fcfbf7] pl-9 pr-3 font-body text-sm" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm kiếm" /></label><select className="min-h-9 rounded-lg border border-[#dedbd0] bg-white px-3 font-body text-sm" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Lọc theo trạng thái"><option value="all">Lọc trạng thái</option>{statusOptions.map((status) => <option key={status}>{status}</option>)}</select>{filterableColumns.map((filter) => <select className="min-h-9 rounded-lg border border-[#dedbd0] bg-white px-3 font-body text-sm" value={columnFilters[filter.index] ?? 'all'} onChange={(event) => setColumnFilters((current) => ({ ...current, [filter.index]: event.target.value }))} aria-label={`Lọc theo ${filter.column}`} key={filter.column}><option value="all">{filter.label}</option>{filter.options.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}</select>)}<select className="min-h-9 rounded-lg border border-[#dedbd0] bg-white px-3 font-body text-sm" value={sort.index} onChange={(event) => setSort({ index: Number(event.target.value), ascending: true })} aria-label="Sắp xếp theo"><option value={sort.index}>Sắp xếp</option>{config.columns.map((column, index) => <option value={index} key={column}>{column}</option>)}</select><button className="min-h-9 rounded-lg border border-[#dedbd0] px-3 font-body text-sm text-[#62655f] hover:bg-[#f5f3ec]" type="button" onClick={() => { setQuery(''); setStatusFilter('all'); setColumnFilters({}) }}>Xóa lọc</button></div></div>
          {sortedRows.length ? <><div className="overflow-x-auto"><table className="min-w-[900px] w-full text-left"><thead className="bg-[#fcfbf7]"><tr><th className="w-16 px-4 py-3 font-body text-sm font-semibold">STT</th>{config.columns.map((column, index) => <th className="px-4 py-3 font-body text-sm font-semibold" key={column}><button className="inline-flex items-center gap-1.5" type="button" onClick={() => setSort((current) => ({ index, ascending: current.index === index ? !current.ascending : true }))}>{column}<span className="text-xs text-[#98968c]">{sort.index === index ? (sort.ascending ? '↑' : '↓') : '↕'}</span></button></th>)}<th className="w-32 px-4 py-3 text-right font-body text-sm font-semibold">Thao tác</th></tr></thead><tbody>{pagedRows.map(({ row, index }, rowIndex) => <tr className="border-t border-[#eeeae0]" key={`${index}-${row.join('-')}`}><td className="px-4 py-3 font-body text-sm text-[#74776f]">{(page - 1) * pageSize + rowIndex + 1}</td>{row.map((value, cellIndex) => <td className="px-4 py-3 font-body text-sm" key={`${cellIndex}-${value}`}>{cellIndex === row.length - 1 ? <span className="inline-flex rounded-full bg-[#edf7ef] px-2.5 py-1 text-xs font-semibold text-[#39733e]">{value}</span> : value}</td>)}<td className="px-4 py-3 text-right"><div className="flex justify-end gap-1"><button className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#74776f] hover:bg-[#f5f3ec]" type="button" aria-label={`Sửa ${row[0]}`} onClick={() => openEdit(index)}><i className="bi bi-pencil" aria-hidden="true" /></button><button className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#8b8d86] hover:bg-[#f1e8e5] hover:text-[#a33d32]" type="button" aria-label={`Xóa ${row[0]}`} onClick={() => removeRow(index)}><i className="bi bi-trash3" aria-hidden="true" /></button></div></td></tr>)}</tbody><tfoot><AdminSummaryRow rows={rows} numericColumns={numericColumns} columnCount={config.columns.length + 2} /></tfoot></table></div><AdminTableFooter total={sortedRows.length} pageSize={pageSize} page={page} onPageChange={setPage} onPageSizeChange={setPageSize} /></> : <div className="px-5 py-14 text-center"><i className="bi bi-inbox text-3xl text-[var(--color-olive)]" aria-hidden="true" /><h2 className="mt-3 font-display text-lg font-semibold">{config.empty}</h2><p className="mt-2 font-body text-sm text-[#74776f]">Dữ liệu sẽ xuất hiện tại đây sau khi kết nối backend.</p></div>}
        </section>
      </main>
    </div>
  </div>
}

function AdminBooksLegacyPage({ managementView }: { managementView: BookManagementView }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [formValues, setFormValues] = useState<Record<AdminBookKey, string>>(emptyAdminBookForm)
  const [formIssues, setFormIssues] = useState<ImportIssue[]>([])
  const [books, setBooks] = useState<AdminBook[]>(readAdminBooks)
  const [importReport, setImportReport] = useState<ImportReport | null>(null)
  const [importing, setImporting] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [filters, setFilters] = useState<AdminBookFilters>(emptyAdminBookFilters)
  const [bookSort, setBookSort] = useState<{ key: AdminBookSortKey; ascending: boolean }>({ key: 'title', ascending: true })
  const [hiddenBookKeys, setHiddenBookKeys] = useState<string[]>([])
  const [editingBookKey, setEditingBookKey] = useState<string | null>(null)
  const [editingBook, setEditingBook] = useState<AdminBook | null>(null)
  const [pageSize, setPageSize] = useState(10)
  const [issuePageSize, setIssuePageSize] = useState(10)
  useEffect(() => { writeAdminBooks(books) }, [books])
  const visibleBooks = books.filter((book) => {
    const searchable = `${book.title} ${book.author} ${book.isbn}`.toLowerCase()
    const minSalePrice = parseAdminNumber(filters.minSalePrice)
    const maxSalePrice = parseAdminNumber(filters.maxSalePrice)
    const minUnitPrice = parseAdminNumber(filters.minUnitPrice)
    const maxUnitPrice = parseAdminNumber(filters.maxUnitPrice)
    return searchable.includes(query.trim().toLowerCase()) &&
      (!filters.author || book.author === filters.author) &&
      (!filters.format || book.format === filters.format) &&
      (!filters.line || book.line === filters.line) &&
      (!filters.category || book.category === filters.category) &&
      (filters.stock === 'all' || (filters.stock === 'in-stock' ? book.quantity > 0 : book.quantity === 0)) &&
      (minSalePrice === null || book.salePrice >= minSalePrice) &&
      (maxSalePrice === null || book.salePrice <= maxSalePrice) &&
      (minUnitPrice === null || (book.unitPrice !== null && book.unitPrice >= minUnitPrice)) &&
      (maxUnitPrice === null || (book.unitPrice !== null && book.unitPrice <= maxUnitPrice))
  })
  const filterOptions = {
    authors: [...new Set(books.map((book) => book.author).filter(Boolean))],
    formats: [...new Set(books.map((book) => book.format).filter(Boolean))],
    lines: [...new Set(books.map((book) => book.line).filter(Boolean))],
    categories: [...new Set(books.map((book) => book.category).filter(Boolean))],
  }
  const sortedVisibleBooks = [...visibleBooks].sort((first, second) => {
    const firstValue = bookSort.key === 'stock' ? first.quantity : first[bookSort.key]
    const secondValue = bookSort.key === 'stock' ? second.quantity : second[bookSort.key]
    const result = typeof firstValue === 'number' && typeof secondValue === 'number'
      ? firstValue - secondValue
      : String(firstValue ?? '').localeCompare(String(secondValue ?? ''), 'vi', { numeric: true })
    return bookSort.ascending ? result : -result
  })
  const pagedVisibleBooks = sortedVisibleBooks.slice(0, pageSize)
  const pagedImportIssues = (importReport?.issues ?? []).slice(0, issuePageSize)
  const bookColumns: Array<[string, AdminBookSortKey]> = [['ISBN', 'isbn'], ['Tên sách', 'title'], ['Tác giả', 'author'], ['Số lượng', 'quantity'], ['Đơn giá nhập', 'unitPrice'], ['Giá bán', 'salePrice'], ['Thể thức', 'format'], ['Dòng sách', 'line'], ['Thể loại', 'category'], ['Tồn kho', 'stock']]
  const renderBookSortButton = (label: string, key: AdminBookSortKey) => <button className="inline-flex items-center gap-1.5 whitespace-nowrap" type="button" onClick={() => setBookSort((current) => ({ key, ascending: current.key === key ? !current.ascending : true }))}>{label}<span className="text-xs text-[#98968c]">{bookSort.key === key ? (bookSort.ascending ? '↑' : '↓') : '↕'}</span></button>
  const getBookKey = (book: AdminBook) => `${book.isbn}-${book.title}`
  const saveEditedBook = () => {
    if (!editingBook || !editingBookKey) return
    setBooks((current) => current.map((book) => getBookKey(book) === editingBookKey ? editingBook : book))
    setEditingBook(null)
    setEditingBookKey(null)
  }
  const submitSingleBook = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const issues = validateAdminBook(formValues, 2)
    setFormIssues(issues)
    if (issues.length) return
    setBooks((current) => [...current, toAdminBook(formValues)])
    setFormValues(emptyAdminBookForm)
    setFormOpen(false)
  }
  const importBooksFile = async (file: File) => {
    setImporting(true)
    try {
      const { readSheet } = await import('read-excel-file/browser')
      const rows = await readSheet(file, 'Sách') as unknown[][]
      const headerRow = (rows[0] ?? []).map((value) => String(value ?? '').trim())
      const mappedHeaders = headerRow.map((header) => adminHeaderMap.get(normalizeAdminHeader(header)) ?? null)
      const missingHeaders = adminBookFields.filter((field) => field.required && !mappedHeaders.includes(field.key))
      const issues: ImportIssue[] = missingHeaders.map((field) => ({ row: 1, field: field.label, message: 'Thiếu cột bắt buộc trong file Excel.' }))
      const validRows: AdminBook[] = []
      rows.slice(1).forEach((row, index) => {
        const values = { ...emptyAdminBookForm }
        mappedHeaders.forEach((key, columnIndex) => { if (key) values[key] = String(row[columnIndex] ?? '').trim() })
        if (!Object.values(values).some(Boolean)) return
        const rowIssues = validateAdminBook(values, index + 2)
        issues.push(...rowIssues)
        if (!rowIssues.length) validRows.push(toAdminBook(values))
      })
      setBooks((current) => [...current, ...validRows])
      setImportReport({ fileName: file.name, total: rows.length > 1 ? rows.slice(1).filter((row) => row.some((value) => String(value ?? '').trim())).length : 0, valid: validRows.length, invalid: new Set(issues.map((issue) => issue.row)).size, issues })
    } catch {
      setImportReport({ fileName: file.name, total: 0, valid: 0, invalid: 1, issues: [{ row: 0, field: 'File', message: 'Không thể đọc file. Hãy dùng file .xlsx, .xls hoặc .csv theo mẫu của hệ thống.' }] })
    } finally {
      setImporting(false)
    }
  }

  return <div className="admin-shell flex min-h-screen bg-[#f7f7f2] text-[var(--color-ink)]">
    <aside className={`admin-sidebar fixed inset-y-0 left-0 z-40 flex w-72 -translate-x-full flex-col border-r border-[#e5e2d7] bg-white transition-transform duration-300 lg:static lg:translate-x-0 ${sidebarOpen ? 'is-open translate-x-0' : ''}`}>
      <div className="flex h-20 items-center justify-between border-b border-[#eeeae0] px-6"><a className="admin-brand-link" href="/#home" aria-label="LineryBooks"><AdminBrand /></a><button className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#dedbd0] text-[var(--color-ink)] lg:hidden" type="button" aria-label="Đóng menu quản trị" onClick={() => setSidebarOpen(false)}><i className="bi bi-x-lg" aria-hidden="true" /></button></div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-4" aria-label="Điều hướng quản trị"><p className="px-3 pb-2 pt-3 font-body text-xs font-semibold uppercase tracking-[.14em] text-[#98968c]">Khu vực quản trị</p><a className="flex items-center gap-3 rounded-xl px-3 py-2.5 font-body text-sm text-[#62655f] transition-colors hover:bg-[#f5f3ec] hover:text-[var(--color-ink)]" href="/admin"><i className="bi bi-grid-1x2-fill" aria-hidden="true" />Tổng quan</a><div><a className="flex items-center justify-between gap-3 rounded-xl bg-[rgba(155,148,47,.12)] px-3 py-2.5 font-body text-sm font-semibold text-[var(--color-olive-dark)]" href="/admin/books" aria-current="page"><span className="flex items-center gap-3"><i className="bi bi-book" aria-hidden="true" />Quản lý sách</span><i className="bi bi-chevron-down text-xs" aria-hidden="true" /></a><AdminBookSubnav pathname={window.location.pathname} /></div><a className="flex items-center gap-3 rounded-xl px-3 py-2.5 font-body text-sm text-[#62655f] transition-colors hover:bg-[#f5f3ec] hover:text-[var(--color-ink)]" href="/admin/orders"><i className="bi bi-bag" aria-hidden="true" />Đơn hàng</a><a className="flex items-center gap-3 rounded-xl px-3 py-2.5 font-body text-sm text-[#62655f] transition-colors hover:bg-[#f5f3ec] hover:text-[var(--color-ink)]" href="/admin/authors"><i className="bi bi-people" aria-hidden="true" />Tác giả</a><a className="flex items-center gap-3 rounded-xl px-3 py-2.5 font-body text-sm text-[#62655f] transition-colors hover:bg-[#f5f3ec] hover:text-[var(--color-ink)]" href="/admin/news"><i className="bi bi-newspaper" aria-hidden="true" />Tin tức</a><p className="px-3 pb-2 pt-7 font-body text-xs font-semibold uppercase tracking-[.14em] text-[#98968c]">Hệ thống</p><a className="flex items-center gap-3 rounded-xl px-3 py-2.5 font-body text-sm text-[#62655f] transition-colors hover:bg-[#f5f3ec] hover:text-[var(--color-ink)]" href="/admin/settings"><i className="bi bi-sliders" aria-hidden="true" />Cài đặt</a></nav>
      <div className="border-t border-[#eeeae0] p-4"><a className="flex items-center gap-3 rounded-xl px-3 py-2.5 font-body text-sm text-[#62655f] transition-colors hover:bg-[#f5f3ec] hover:text-[var(--color-ink)]" href="/#home"><i className="bi bi-arrow-left" aria-hidden="true" />Về cửa hàng</a></div>
    </aside>
    {sidebarOpen && <button className="fixed inset-0 z-30 bg-[rgba(31,42,36,.32)] lg:hidden" type="button" aria-label="Đóng menu quản trị" onClick={() => setSidebarOpen(false)} />}
    <div className="min-w-0 flex-1"><header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-[#e5e2d7] bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8"><div className="flex items-center gap-3"><button className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#dedbd0] text-[var(--color-ink)] lg:hidden" type="button" aria-label="Mở menu quản trị" onClick={() => setSidebarOpen(true)}><i className="bi bi-list" aria-hidden="true" /></button><div><p className="font-body text-sm text-[#8b8d86]">Quản trị</p><h1 className="font-display text-xl font-semibold tracking-tight sm:text-2xl">Sách</h1></div></div><button className="admin-primary-icon inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-olive)] font-display text-sm text-white" type="button" aria-label="Hồ sơ quản trị">K</button></header>
      <main className="mx-auto w-full max-w-[1440px] p-4 sm:p-6 lg:p-8">{managementView === 'books' && <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="mb-2 font-body text-sm font-semibold uppercase tracking-[.14em] text-[var(--color-olive)]">Danh mục</p><h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">{managementView === 'books' ? 'Quản lý sách' : managementView === 'categories' ? 'Quản lý danh mục' : 'Quản lý khổ sách'}</h2><p className="mt-2 max-w-2xl font-body text-sm leading-6 text-[#74776f]">Quản lý dữ liệu catalog của Linery theo từng nhóm nghiệp vụ.</p></div><div className="flex flex-col gap-2 sm:flex-row"><button className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[var(--color-olive)] px-5 font-body text-sm font-medium text-[var(--color-olive)] transition-colors hover:bg-[rgba(155,148,47,.1)]" type="button" onClick={() => { setFormOpen(!formOpen); setImportOpen(false) }}><i className="bi bi-plus-lg mr-2" aria-hidden="true" />Thêm sách</button><button className="admin-primary-action inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--color-olive)] px-5 font-body text-sm font-medium text-white transition-colors hover:bg-[var(--color-olive-dark)]" type="button" onClick={() => { setImportOpen(!importOpen); setFormOpen(false) }}><i className="bi bi-file-earmark-spreadsheet mr-2" aria-hidden="true" />Nhập Excel</button></div></div>}
        {managementView !== 'books' ? <AdminLookupPanel view={managementView} /> : <>
        <section className="mt-6 rounded-2xl border border-[#e6e2d7] bg-white p-4 shadow-[0_10px_30px_rgba(31,42,36,.04)] sm:p-5" aria-label="Công cụ tìm kiếm sách"><div className="flex flex-col gap-3 lg:flex-row lg:items-center"><label className="relative min-w-0 flex-1"><span className="sr-only">Tìm kiếm sách</span><i className="bi bi-search pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8b8d86]" aria-hidden="true" /><input className="block min-h-11 w-full rounded-xl border border-[#dedbd0] bg-[#fcfbf7] py-2.5 pl-11 pr-4 font-body text-sm text-[var(--color-ink)] outline-none transition focus:border-[var(--color-olive)] focus:ring-2 focus:ring-[rgba(155,148,47,.14)]" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm theo tên sách, ISBN hoặc tác giả" /></label><button className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-4 font-body text-sm transition-colors ${filtersOpen ? 'border-[var(--color-olive)] bg-[rgba(155,148,47,.08)] text-[var(--color-olive-dark)]' : 'border-[#dedbd0] text-[var(--color-ink)] hover:border-[var(--color-olive)] hover:bg-[rgba(155,148,47,.08)]'}`} type="button" aria-expanded={filtersOpen} onClick={() => setFiltersOpen((open) => !open)}><i className="bi bi-funnel" aria-hidden="true" />Bộ lọc</button></div></section>
        {filtersOpen && <section className="mt-3 rounded-2xl border border-[#e6e2d7] bg-white p-4 sm:p-5" aria-label="Bộ lọc chi tiết"><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><label className="block"><span className="mb-1.5 block font-body text-sm font-medium">Tác giả</span><select className="block min-h-11 w-full rounded-xl border border-[#dedbd0] bg-[#fcfbf7] px-3.5 font-body text-sm" value={filters.author} onChange={(event) => setFilters((current) => ({ ...current, author: event.target.value }))}><option value="">Tất cả tác giả</option>{filterOptions.authors.map((option) => <option value={option} key={option}>{option}</option>)}</select></label><label className="block"><span className="mb-1.5 block font-body text-sm font-medium">Thể thức</span><select className="block min-h-11 w-full rounded-xl border border-[#dedbd0] bg-[#fcfbf7] px-3.5 font-body text-sm" value={filters.format} onChange={(event) => setFilters((current) => ({ ...current, format: event.target.value }))}><option value="">Tất cả thể thức</option>{filterOptions.formats.map((option) => <option value={option} key={option}>{option}</option>)}</select></label><label className="block"><span className="mb-1.5 block font-body text-sm font-medium">Dòng sách</span><select className="block min-h-11 w-full rounded-xl border border-[#dedbd0] bg-[#fcfbf7] px-3.5 font-body text-sm" value={filters.line} onChange={(event) => setFilters((current) => ({ ...current, line: event.target.value }))}><option value="">Tất cả dòng sách</option>{filterOptions.lines.map((option) => <option value={option} key={option}>{option}</option>)}</select></label><label className="block"><span className="mb-1.5 block font-body text-sm font-medium">Thể loại</span><select className="block min-h-11 w-full rounded-xl border border-[#dedbd0] bg-[#fcfbf7] px-3.5 font-body text-sm" value={filters.category} onChange={(event) => setFilters((current) => ({ ...current, category: event.target.value }))}><option value="">Tất cả thể loại</option>{filterOptions.categories.map((option) => <option value={option} key={option}>{option}</option>)}</select></label><label className="block"><span className="mb-1.5 block font-body text-sm font-medium">Tồn kho</span><select className="block min-h-11 w-full rounded-xl border border-[#dedbd0] bg-[#fcfbf7] px-3.5 font-body text-sm" value={filters.stock} onChange={(event) => setFilters((current) => ({ ...current, stock: event.target.value as AdminBookFilters['stock'] }))}><option value="all">Tất cả trạng thái</option><option value="in-stock">Còn hàng</option><option value="out-of-stock">Hết hàng</option></select></label><div><span className="mb-1.5 block font-body text-sm font-medium">Giá bán</span><div className="grid grid-cols-2 gap-2"><input className="block min-h-11 w-full rounded-xl border border-[#dedbd0] bg-[#fcfbf7] px-3 font-body text-sm" type="number" min="0" placeholder="Từ" value={filters.minSalePrice} onChange={(event) => setFilters((current) => ({ ...current, minSalePrice: event.target.value }))} /><input className="block min-h-11 w-full rounded-xl border border-[#dedbd0] bg-[#fcfbf7] px-3 font-body text-sm" type="number" min="0" placeholder="Đến" value={filters.maxSalePrice} onChange={(event) => setFilters((current) => ({ ...current, maxSalePrice: event.target.value }))} /></div></div><div><span className="mb-1.5 block font-body text-sm font-medium">Đơn giá nhập</span><div className="grid grid-cols-2 gap-2"><input className="block min-h-11 w-full rounded-xl border border-[#dedbd0] bg-[#fcfbf7] px-3 font-body text-sm" type="number" min="0" placeholder="Từ" value={filters.minUnitPrice} onChange={(event) => setFilters((current) => ({ ...current, minUnitPrice: event.target.value }))} /><input className="block min-h-11 w-full rounded-xl border border-[#dedbd0] bg-[#fcfbf7] px-3 font-body text-sm" type="number" min="0" placeholder="Đến" value={filters.maxUnitPrice} onChange={(event) => setFilters((current) => ({ ...current, maxUnitPrice: event.target.value }))} /></div></div></div><div className="mt-4 flex justify-between gap-3 border-t border-[#eeeae0] pt-4"><p className="font-body text-sm text-[#74776f]">Hiển thị {visibleBooks.length}/{books.length} sách</p><button className="font-body text-sm font-medium text-[var(--color-olive-dark)]" type="button" onClick={() => { setFilters(emptyAdminBookFilters); setQuery('') }}>Xóa bộ lọc</button></div></section>}
        {formOpen && <section className="mt-6 rounded-2xl border border-[#e6e2d7] bg-white p-5 sm:p-6"><div className="flex items-start justify-between gap-4"><div><h3 className="font-display text-lg font-semibold">Thêm một cuốn sách</h3><p className="mt-1 font-body text-sm text-[#74776f]">Các trường có dấu <span className="font-semibold text-[var(--color-olive-dark)]">*</span> là bắt buộc.</p></div><button className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#dedbd0] text-[var(--color-ink)]" type="button" aria-label="Đóng form thêm sách" onClick={() => setFormOpen(false)}><i className="bi bi-x-lg" aria-hidden="true" /></button></div><form className="mt-5" onSubmit={submitSingleBook}><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{adminBookFields.map((field) => <label className="block" key={field.key}><span className="mb-1.5 block font-body text-sm font-medium text-[var(--color-ink)]">{field.label}{field.required && <span className="ml-1 text-[var(--color-olive-dark)]">*</span>}</span><input className="block min-h-11 w-full rounded-xl border border-[#dedbd0] bg-[#fcfbf7] px-3.5 font-body text-sm text-[var(--color-ink)] outline-none transition focus:border-[var(--color-olive)] focus:ring-2 focus:ring-[rgba(155,148,47,.14)]" type={field.input} min={field.input === 'number' ? '0' : undefined} value={formValues[field.key]} onChange={(event) => setFormValues((current) => ({ ...current, [field.key]: event.target.value }))} placeholder={field.required ? `Nhập ${field.label.toLowerCase()}` : 'Không bắt buộc'} />{!field.required && <span className="mt-1 block font-body text-xs text-[#8b8d86]">Không bắt buộc</span>}</label>)}</div>{formIssues.length > 0 && <div className="mt-4 rounded-xl border border-[#d9a6a0] bg-[#fff6f4] p-4"><p className="font-body text-sm font-semibold text-[#a33d32]">Chưa thể thêm sách</p><ul className="mt-2 space-y-1 font-body text-sm text-[#8c4038]">{formIssues.map((issue, index) => <li key={`${issue.field}-${index}`}>{issue.field}: {issue.message}</li>)}</ul></div>}<div className="mt-5 flex flex-col justify-end gap-3 sm:flex-row"><button className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#dedbd0] px-5 font-body text-sm text-[var(--color-ink)]" type="button" onClick={() => setFormOpen(false)}>Hủy</button><button className="admin-primary-action inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--color-olive)] px-5 font-body text-sm font-medium text-white transition-colors hover:bg-[var(--color-olive-dark)]" type="submit">Lưu sách</button></div></form></section>}
        {importOpen && <section className="mt-6 rounded-2xl border border-[#e6e2d7] bg-white p-5 sm:p-6"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div><h3 className="font-display text-lg font-semibold">Nhập sách hàng loạt từ Excel</h3><p className="mt-1 max-w-2xl font-body text-sm leading-6 text-[#74776f]">Tải mẫu, điền dữ liệu trong sheet Sách rồi tải lại file. Dòng đúng sẽ được giữ lại; dòng lỗi sẽ được báo riêng để sửa.</p></div><button className="inline-flex min-h-10 items-center justify-center rounded-xl border border-[var(--color-olive)] px-4 font-body text-sm font-medium text-[var(--color-olive)]" type="button" onClick={() => downloadAdminWorkbook()}><i className="bi bi-download mr-2" aria-hidden="true" />Tải file mẫu Excel</button></div><label className="mt-5 flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[var(--color-olive)] bg-[rgba(155,148,47,.06)] px-4 text-center transition-colors hover:bg-[rgba(155,148,47,.12)]"><i className="bi bi-cloud-arrow-up text-2xl text-[var(--color-olive)]" aria-hidden="true" /><span className="mt-2 font-body text-sm font-medium text-[var(--color-ink)]">{importing ? 'Đang kiểm tra file...' : 'Chọn file Excel để kiểm tra'}</span><span className="mt-1 font-body text-xs text-[#74776f]">.xlsx, .xls hoặc .csv</span><input className="sr-only" type="file" accept=".xlsx,.xls,.csv" disabled={importing} onChange={(event) => { const file = event.currentTarget.files?.[0]; if (file) void importBooksFile(file); event.currentTarget.value = '' }} /></label></section>}
        {importReport && <section className="mt-6 rounded-2xl border border-[#e6e2d7] bg-white p-5 sm:p-6"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div><h3 className="font-display text-lg font-semibold">Báo cáo nhập file</h3><p className="mt-1 font-body text-sm text-[#74776f]">{importReport.fileName}</p></div><button className="inline-flex min-h-10 items-center justify-center rounded-xl border border-[var(--color-olive)] px-4 font-body text-sm font-medium text-[var(--color-olive)]" type="button" onClick={() => downloadAdminWorkbook(importReport)}><i className="bi bi-download mr-2" aria-hidden="true" />Tải báo cáo lỗi</button></div><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-xl bg-[#f6f5ed] p-4"><p className="font-body text-sm text-[#74776f]">Tổng dòng</p><p className="mt-1 font-display text-2xl font-semibold">{importReport.total}</p></div><div className="rounded-xl bg-[#f1f8f1] p-4"><p className="font-body text-sm text-[#39733e]">Hợp lệ</p><p className="mt-1 font-display text-2xl font-semibold text-[#39733e]">{importReport.valid}</p></div><div className="rounded-xl bg-[#fff4f2] p-4"><p className="font-body text-sm text-[#a33d32]">Có lỗi</p><p className="mt-1 font-display text-2xl font-semibold text-[#a33d32]">{importReport.invalid}</p></div></div>{importReport.issues.length > 0 && <><div className="mt-5 overflow-x-auto rounded-xl border border-[#ead7d3]"><table className="min-w-full text-left"><thead className="bg-[#fff8f6]"><tr><th className="px-4 py-3 font-body text-sm font-semibold">STT</th><th className="px-4 py-3 font-body text-sm font-semibold">Dòng</th><th className="px-4 py-3 font-body text-sm font-semibold">Trường</th><th className="px-4 py-3 font-body text-sm font-semibold">Lỗi cần sửa</th></tr></thead><tbody>{pagedImportIssues.map((issue, index) => <tr className="border-t border-[#f0e1de]" key={index}><td className="px-4 py-3 font-body text-sm">{index + 1}</td><td className="px-4 py-3 font-body text-sm">{issue.row || '—'}</td><td className="px-4 py-3 font-body text-sm">{issue.field}</td><td className="px-4 py-3 font-body text-sm text-[#8c4038]">{issue.message}</td></tr>)}</tbody><tfoot><tr className="border-t border-[#ead7d3] bg-[#fff8f6] font-semibold"><td className="px-4 py-3 font-body text-sm text-[#74776f]">Tổng</td><td className="px-4 py-3 font-body text-sm">{importReport.issues.length} lỗi</td><td className="px-4 py-3 font-body text-sm">—</td><td className="px-4 py-3 font-body text-sm">—</td></tr></tfoot></table></div><AdminTableFooter total={importReport.issues.length} pageSize={issuePageSize} onPageSizeChange={setIssuePageSize} /></>}{importReport.issues.length === 0 && <p className="mt-5 font-body text-sm font-medium text-[#39733e]">Tất cả dòng dữ liệu đều hợp lệ.</p>}</section>}
        {visibleBooks.length > 0 ? <section className="mt-6 overflow-hidden rounded-2xl border border-[#e6e2d7] bg-white"><div className="flex items-center justify-between gap-4 border-b border-[#eeeae0] p-5"><div><h3 className="font-display text-lg font-semibold">Sách đã nhập</h3><p className="mt-1 font-body text-sm text-[#74776f]">{visibleBooks.length} bản ghi trong phiên làm việc này. Bấm tên cột để sắp xếp.</p></div></div><div className="overflow-x-auto"><table className="min-w-[1500px] w-full text-left"><thead className="bg-[#fcfbf7]"><tr><th className="px-4 py-3 font-body text-sm font-semibold">STT</th>{bookColumns.map(([label, key]) => <th className="px-4 py-3 font-body text-sm font-semibold" key={key}>{renderBookSortButton(label, key)}{key === 'title' && <input className="mt-2 min-h-8 w-36 rounded-lg border border-[#dedbd0] bg-white px-2.5 font-body text-xs font-normal" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm nhanh" aria-label="Tìm nhanh theo tên sách" />}</th>)}<th className="px-4 py-3 font-body text-sm font-semibold">Liên kết</th><th className="px-4 py-3 text-right font-body text-sm font-semibold">Thao tác</th></tr></thead><tbody>{pagedVisibleBooks.map((book, index) => { const bookKey = getBookKey(book); const isEditing = editingBookKey === bookKey; const isHidden = hiddenBookKeys.includes(bookKey); return <tr className={`border-t border-[#eeeae0] ${isHidden ? 'bg-[#faf9f5] text-[#98968c]' : ''}`} key={`${bookKey}-${index}`}><td className="px-4 py-3 font-body text-sm text-[#74776f]">{index + 1}</td><td className="px-4 py-3 font-body text-sm">{book.isbn || '—'}</td><td className="max-w-[260px] px-4 py-3 font-body text-sm font-medium">{isEditing ? <input className="min-h-9 w-full rounded-lg border border-[var(--color-olive)] px-2.5 font-body text-sm" value={editingBook?.title ?? ''} onChange={(event) => setEditingBook((current) => current ? { ...current, title: event.target.value } : current)} /> : book.title}</td><td className="px-4 py-3 font-body text-sm">{isEditing ? <input className="min-h-9 w-40 rounded-lg border border-[var(--color-olive)] px-2.5 font-body text-sm" value={editingBook?.author ?? ''} onChange={(event) => setEditingBook((current) => current ? { ...current, author: event.target.value } : current)} /> : book.author}</td><td className="px-4 py-3 font-body text-sm">{isEditing ? <input className="min-h-9 w-24 rounded-lg border border-[var(--color-olive)] px-2.5 font-body text-sm" type="number" min="0" value={editingBook?.quantity ?? 0} onChange={(event) => setEditingBook((current) => current ? { ...current, quantity: Number(event.target.value) } : current)} /> : book.quantity}</td><td className="px-4 py-3 font-body text-sm">{book.unitPrice === null ? '—' : `${book.unitPrice.toLocaleString('vi-VN')}₫`}</td><td className="px-4 py-3 font-body text-sm">{isEditing ? <input className="min-h-9 w-28 rounded-lg border border-[var(--color-olive)] px-2.5 font-body text-sm" type="number" min="0" value={editingBook?.salePrice ?? 0} onChange={(event) => setEditingBook((current) => current ? { ...current, salePrice: Number(event.target.value) } : current)} /> : `${book.salePrice.toLocaleString('vi-VN')}₫`}</td><td className="px-4 py-3 font-body text-sm">{book.format || '—'}</td><td className="px-4 py-3 font-body text-sm">{book.line || '—'}</td><td className="px-4 py-3 font-body text-sm">{book.category || '—'}</td><td className="px-4 py-3 font-body text-sm"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${book.quantity > 0 ? 'bg-[#edf7ef] text-[#39733e]' : 'bg-[#fff4f2] text-[#a33d32]'}`}>{book.quantity > 0 ? 'Còn hàng' : 'Hết hàng'}</span>{isHidden && <span className="ml-2 inline-flex rounded-full bg-[#f2f1ec] px-2.5 py-1 text-xs font-semibold text-[#8b8d86]">Tạm ẩn</span>}</td><td className="px-4 py-3 font-body text-sm">{book.link ? <a className="text-[var(--color-olive-dark)] underline" href={book.link} target="_blank" rel="noreferrer">Mở link</a> : '—'}</td><td className="px-4 py-3 text-right"><div className="flex justify-end gap-1">{isEditing ? <><button className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#39733e] hover:bg-[#edf7ef]" type="button" aria-label={`Lưu ${book.title}`} onClick={saveEditedBook}><i className="bi bi-check-lg" aria-hidden="true" /></button><button className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#8b8d86] hover:bg-[#f5f3ec]" type="button" aria-label={`Hủy sửa ${book.title}`} onClick={() => { setEditingBook(null); setEditingBookKey(null) }}><i className="bi bi-x-lg" aria-hidden="true" /></button></> : <><button className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#74776f] hover:bg-[#f5f3ec]" type="button" aria-label={`Sửa ${book.title}`} onClick={() => { setEditingBookKey(bookKey); setEditingBook({ ...book }) }}><i className="bi bi-pencil" aria-hidden="true" /></button><button className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#74776f] hover:bg-[#f5f3ec]" type="button" aria-label={isHidden ? `Hiện ${book.title}` : `Tạm ẩn ${book.title}`} onClick={() => setHiddenBookKeys((current) => current.includes(bookKey) ? current.filter((key) => key !== bookKey) : [...current, bookKey])}><i className={`bi ${isHidden ? 'bi-eye' : 'bi-eye-slash'}`} aria-hidden="true" /></button><button className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#8b8d86] hover:bg-[#f1e8e5] hover:text-[#a33d32]" type="button" aria-label={`Xóa ${book.title}`} onClick={() => setBooks((current) => current.filter((currentBook) => getBookKey(currentBook) !== bookKey))}><i className="bi bi-trash3" aria-hidden="true" /></button></>}</div></td></tr> })}</tbody><tfoot><AdminSummaryRow rows={visibleBooks.map((book) => ["", book.isbn, book.title, book.author, String(book.quantity), book.unitPrice === null ? "" : String(book.unitPrice), String(book.salePrice), book.format, book.line, book.category, book.quantity > 0 ? "" : "", book.link, ""])} numericColumns={[4]} columnCount={13} /></tfoot></table></div><AdminTableFooter total={sortedVisibleBooks.length} pageSize={pageSize} onPageSizeChange={setPageSize} /></section> : !formOpen && !importOpen && <section className="mt-6 rounded-2xl border border-[#e6e2d7] bg-white p-5 sm:p-8"><div className="mx-auto max-w-xl text-center"><span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[rgba(155,148,47,.12)] text-2xl text-[var(--color-olive)]"><i className="bi bi-book" aria-hidden="true" /></span><h3 className="mt-5 font-display text-lg font-semibold">Chưa có dữ liệu sách</h3><p className="mt-2 font-body text-sm leading-6 text-[#74776f]">Các trường sẽ được quản lý theo bảng dữ liệu: ISBN, tác phẩm, tác giả, số lượng, đơn giá, giá bán, link, thể thức, dòng sách và thể loại.</p><div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row"><button className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[var(--color-olive)] px-5 font-body text-sm font-medium text-[var(--color-olive)] transition-colors hover:bg-[var(--color-olive)] hover:text-white" type="button" onClick={() => { setImportOpen(true); setFormOpen(false) }}><i className="bi bi-cloud-arrow-up mr-2" aria-hidden="true" />Nhập dữ liệu</button><button className="admin-primary-action inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--color-olive)] px-5 font-body text-sm font-medium text-white transition-colors hover:bg-[var(--color-olive-dark)]" type="button" onClick={() => setFormOpen(true)}><i className="bi bi-plus-lg mr-2" aria-hidden="true" />Thêm một cuốn sách</button></div></div></section>}
        </>}
      </main></div>
  </div>
}

const adminSelectOptions = {
  authors: ['Edward W. Said', 'Toni Morrison', 'Yukio Mishima', 'Antoine de Saint-Exupéry', 'Amy Tan'],
  series: ['Oxford Very Short Introductions', 'Penguin Modern Classics', 'Linery Editions'],
  formats: ['Paperback', 'Hardcover', 'Digital', 'Audiobook'],
  lines: ['Picador', 'Penguin UK', 'Penguin US', 'NYRB'],
  categories: ['Fiction', 'Novels', 'Short stories', 'Poetry & Drama', 'Non-fiction', 'Essays', 'Research & Studies', 'Memoir & Biography'],
  genres: ['Fiction', 'Non-fiction', 'Short stories', 'Poetry & Drama', 'Essays', 'Memoir & Biography'],
  topics: ['Literary fiction', 'Politics', 'Philosophy', 'History', 'Art & Design', 'Culture', 'Biography'],
  publishers: ['Penguin Books', 'Picador', 'New York Review Books', 'Linery Press'],
  imprints: ['Penguin Classics', 'Picador Classics', 'NYRB Classics', 'Linery Editions'],
  languages: ['English', 'Vietnamese', 'French', 'German', 'Spanish'],
}

function AdminSelect2({ label, value, options, onChange, placeholder, multiple = false, required = false }: { label: string; value: string | string[]; options: string[]; onChange: (value: string | string[]) => void; placeholder: string; multiple?: boolean; required?: boolean }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [placement, setPlacement] = useState<'top' | 'bottom'>('bottom')
  const anchorRef = useRef<HTMLLabelElement | null>(null)
  const selected = multiple ? (value as string[]) : (value as string ? [value as string] : [])
  const filtered = options.filter((option) => option.toLowerCase().includes(query.trim().toLowerCase()))
  const updatePlacement = () => {
    const rect = anchorRef.current?.getBoundingClientRect()
    if (!rect) return
    const estimatedHeight = Math.min(224, Math.max(56, filtered.length * 40 + 12))
    const spaceBelow = window.innerHeight - rect.bottom - 12
    const spaceAbove = rect.top - 12
    setPlacement(spaceBelow < estimatedHeight && spaceAbove > spaceBelow ? 'top' : 'bottom')
  }
  useEffect(() => {
    if (!open) return undefined
    updatePlacement()
    const handleViewportChange = () => updatePlacement()
    const handleDocumentPointerDown = (event: PointerEvent) => {
      if (!anchorRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const handleDocumentKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('resize', handleViewportChange)
    window.addEventListener('scroll', handleViewportChange, true)
    document.addEventListener('pointerdown', handleDocumentPointerDown, true)
    document.addEventListener('keydown', handleDocumentKeyDown)
    return () => {
      window.removeEventListener('resize', handleViewportChange)
      window.removeEventListener('scroll', handleViewportChange, true)
      document.removeEventListener('pointerdown', handleDocumentPointerDown, true)
      document.removeEventListener('keydown', handleDocumentKeyDown)
    }
  }, [open, filtered.length])
  const choose = (option: string) => {
    if (multiple) {
      const next = selected.includes(option) ? selected.filter((item) => item !== option) : [...selected, option]
      onChange(next)
    } else {
      onChange(option)
      setQuery('')
      setOpen(false)
    }
  }
  const remove = (option: string) => { onChange(multiple ? selected.filter((item) => item !== option) : ''); setQuery(''); setOpen(false) }
  return <div className={`relative ${open ? 'z-40' : 'z-0'}`}>
    <label ref={anchorRef} className="relative block"><span className="mb-1.5 block font-body text-sm font-medium">{label}{required && <span className="ml-1 text-[var(--color-olive-dark)]" aria-hidden="true">*</span>}</span><input className="min-h-11 w-full rounded-xl border border-[#dedbd0] bg-[#fcfbf7] px-3.5 font-body text-sm outline-none transition focus:border-[var(--color-olive)] focus:ring-2 focus:ring-[rgba(155,148,47,.14)]" value={query} onFocus={() => setOpen(true)} onChange={(event) => { setQuery(event.target.value); setOpen(true) }} placeholder={selected.length ? selected.join(', ') : placeholder} aria-expanded={open} aria-autocomplete="list" aria-required={required} />{open && <div className={`absolute left-0 z-30 max-h-[18rem] w-full overflow-auto rounded-xl border border-[#dedbd0] bg-white p-1.5 shadow-lg ${placement === 'top' ? 'bottom-full mb-2' : 'mt-2'}`}>{filtered.length ? filtered.map((option) => <button className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left font-body text-sm hover:bg-[#f5f3ec] ${selected.includes(option) ? 'bg-[rgba(155,148,47,.1)] font-semibold text-[var(--color-olive-dark)]' : ''}`} type="button" key={option} onClick={() => choose(option)}>{option}{selected.includes(option) && <i className="bi bi-check2" aria-hidden="true" />}</button>) : <p className="px-3 py-2 font-body text-sm text-[#8b8d86]">Không tìm thấy dữ liệu đã tạo.</p>}</div>}</label>
    {selected.length > 0 && <div className="admin-select2-tags mt-2 flex flex-wrap gap-2">{selected.map((item) => <span className="inline-flex items-center gap-1.5 rounded-full bg-[rgba(155,148,47,.12)] px-2.5 py-1 font-body text-xs text-[var(--color-olive-dark)]" key={item}>{item}<button type="button" aria-label={`Bỏ ${item}`} onClick={() => remove(item)}><i className="bi bi-x" aria-hidden="true" /></button></span>)}</div>}
  </div>
}

function AdminBookReportPage({ bookId }: { bookId: string }) {
  const [book, setBook] = useState<AdminCatalogBook | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useEffect(() => {
    let active = true
    void loadPublicCatalogProducts().then((products) => {
      if (!active) return
      const product = products?.find((item) => item.id === bookId || item.slug === bookId)
      if (!product) {
        setError(products ? 'Bản ghi sách không tồn tại trong Supabase.' : 'Không đọc được bản ghi sách từ Supabase.')
        return
      }
      const numericPrice = Number(product.price.replace(/[^0-9]/g, '')) || 0
      setBook({ id: product.id, isbn: product.isbn, title: product.title, author: product.author, cover: product.image || BOOK_COVER_FALLBACK, coverImages: product.gallery, quantity: product.inventoryQuantity, unitPrice: null, salePrice: numericPrice, series: '', format: product.format, line: product.line, category: product.categories.join(', '), link: `/books/${product.slug}`, goodreads: '', description: product.description, status: product.available ? 'Đang hoạt động' : 'Hết hàng', slug: product.slug, pages: product.pageCount, bookSize: product.bookSize, publisher: product.publisher, imprint: product.imprint, publicationDate: product.publicationDate, weight: product.weight, language: product.languages.join(', '), authors: product.author ? [product.author] : [], translators: product.translators, illustrators: product.illustrators, categories: product.categories, topics: product.topics, languages: product.languages })
    }).catch((reason) => { if (active) setError(reason instanceof Error ? reason.message : 'Không đọc được sách từ Supabase.') }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [bookId])
  if (loading) return <AdminSimpleCreateShell title="Đang tải báo cáo sách" backHref="/admin/books" section="SÁCH" description="Đang đọc bản ghi thật từ Supabase."><div className="rounded-2xl border border-[#e6e2d7] bg-white p-8 text-center font-body text-sm text-[#74776f]">Đang tải dữ liệu sách…</div></AdminSimpleCreateShell>
  if (error || !book) return <AdminSimpleCreateShell title="Không tìm thấy sách" backHref="/admin/books" section="SÁCH" description="Báo cáo chỉ hiển thị bản ghi thật từ Supabase."><div className="rounded-2xl border border-dashed border-[#d9d6c8] bg-white p-8 text-center font-body text-sm text-[#74776f]"><p role="alert">{error || 'Bản ghi sách không tồn tại trong Supabase.'}</p><a className="mt-4 inline-flex font-semibold text-[var(--color-olive-dark)]" href="/admin/books">Quay lại danh sách sách</a></div></AdminSimpleCreateShell>
  const fields: Array<[string, string]> = [['ISBN', book.isbn], ['Tác giả', book.author], ['Số lượng', `${book.quantity} quyển`], ['Giá bán', `${book.salePrice.toLocaleString('vi-VN')} VNĐ`], ['Thể thức', book.format], ['Dòng sách', book.line], ['Thể loại / danh mục', book.category], ['Chủ đề', book.topics?.join(', ') ?? ''], ['Ngôn ngữ', book.languages?.join(', ') ?? book.language ?? ''], ['Publisher', book.publisher ?? ''], ['Imprint', book.imprint ?? ''], ['Số trang', book.pages == null ? '' : String(book.pages)], ['Khổ sách', book.bookSize ?? ''], ['Ngày xuất bản', book.publicationDate ?? ''], ['Trọng lượng', book.weight ?? ''], ['Trạng thái bản ghi', book.status]]
  return <AdminSimpleCreateShell title="Báo cáo chi tiết sách" backHref="/admin/books" section="SÁCH" description="Thông tin chi tiết của bản ghi được đọc trực tiếp từ catalog Supabase."><div className="grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)]"><aside className="rounded-2xl border border-[#e6e2d7] bg-white p-4"><img className="aspect-[2/3] w-full rounded-xl object-cover" src={book.cover || BOOK_COVER_FALLBACK} alt={book.title} onError={handleBookCoverError} /><a className="mt-4 inline-flex min-h-10 w-full items-center justify-center rounded-xl border border-[#dedbd0] font-body text-sm font-medium" href={`/admin/books`}>Về quản lý sách</a></aside><article className="rounded-2xl border border-[#e6e2d7] bg-white p-5 sm:p-6"><div className="border-b border-[#eeeae0] pb-5"><p className="font-body text-sm text-[#8b8d86]">Báo cáo sách</p><h2 className="mt-1 font-display text-2xl font-bold sm:text-3xl">{book.title}</h2></div><dl className="mt-5 grid gap-4 sm:grid-cols-2">{fields.map(([label, value]) => <div className="rounded-xl bg-[#fcfbf7] p-3" key={label}><dt className="font-body text-xs text-[#8b8d86]">{label}</dt><dd className="mt-1 font-body text-sm font-semibold">{value || '—'}</dd></div>)}</dl>{book.description && <div className="mt-5 border-t border-[#eeeae0] pt-5"><h3 className="font-display text-lg font-semibold">Mô tả sách</h3><div className="mt-2 font-body text-sm leading-6 text-[#62655f]" dangerouslySetInnerHTML={{ __html: book.description }} /></div>}</article></div></AdminSimpleCreateShell>
}

function AdminInfoTooltip({ label, text }: { label: string; text: string }) {
  return <span className="admin-info-tooltip"><button className="admin-info-tooltip-trigger" type="button" aria-label={label}><i className="bi bi-info-lg" aria-hidden="true" /></button><span className="admin-info-tooltip-content" role="tooltip">{text}</span></span>
}

type QuickCreatorRole = 'author' | 'translator' | 'illustrator'

function AdminQuickCreatorModal({ role, existingNames, onSaved, onClose }: { role: QuickCreatorRole; existingNames: string[]; onSaved: (name: string) => void; onClose: () => void }) {
  const [name, setName] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const roleLabel = role === 'author' ? 'tác giả' : role === 'translator' ? 'dịch giả' : 'họa sĩ minh họa'
  const slugify = (value: string) => value.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  const chooseImage = (file: File) => {
    if (file.size > 5 * 1024 * 1024) { setError('Ảnh không được vượt quá 5MB.'); return }
    setError('')
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }
  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const cleanName = name.trim()
    if (!cleanName) { setError(`Vui lòng nhập tên ${roleLabel}.`); return }
    if (existingNames.some((item) => item.trim().toLocaleLowerCase() === cleanName.toLocaleLowerCase())) { setError('Nhà sáng tạo này đã tồn tại trong danh sách.'); return }
    const slug = slugify(cleanName)
    if (!slug) { setError('Tên không tạo được đường dẫn hợp lệ.'); return }
    setSaving(true)
    setError('')
    try {
      const creator = await upsertCreatorProfile({ displayName: cleanName, slug, roles: [role] })
      if (imageFile) await saveAdminCreatorImages(creator.id, [imageFile])
      emitFloatingNotice('success', `Đã thêm ${roleLabel} “${cleanName}”.`)
      onSaved(cleanName)
    } catch (reason) {
      const message = describeSaveError(reason, `Không thể thêm ${roleLabel}.`)
      setError(message)
      emitFloatingNotice('error', `Không thể thêm ${roleLabel}: ${message}`)
    } finally {
      setSaving(false)
    }
  }
  return <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[rgba(31,42,36,.42)] p-4" role="presentation">
    <button className="absolute inset-0 cursor-default" type="button" aria-label="Đóng cửa sổ thêm nhanh" onClick={onClose} />
    <section className="relative z-10 max-h-[calc(100vh-2rem)] w-full max-w-xl overflow-y-auto rounded-2xl border border-[#e6e2d7] bg-white p-5 shadow-2xl sm:p-6" role="dialog" aria-modal="true" aria-labelledby="quick-creator-title">
      <div className="flex items-start justify-between gap-4 border-b border-[#eeeae0] pb-4"><div><p className="font-body text-xs font-semibold uppercase tracking-[.14em] text-[var(--color-olive-dark)]">Thêm nhanh</p><h2 id="quick-creator-title" className="mt-1 font-display text-2xl font-semibold">Thêm {roleLabel}</h2><p className="mt-1 font-body text-sm text-[#74776f]">Tên là bắt buộc; ảnh chân dung có thể bổ sung ngay hoặc cập nhật sau.</p></div><button className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#dedbd0] text-[#62655f] hover:bg-[#f5f3ec]" type="button" aria-label="Đóng" onClick={onClose}><i className="bi bi-x-lg" aria-hidden="true" /></button></div>
      <form className="mt-5 grid gap-4" onSubmit={(event) => void save(event)}>
        <label className="block"><span className="mb-1.5 block font-body text-sm font-medium">Tên {roleLabel}<span className="ml-1 text-[var(--color-olive-dark)]">*</span></span><input className="min-h-11 w-full rounded-xl border border-[#dedbd0] bg-[#fcfbf7] px-3.5 font-body text-sm outline-none transition focus:border-[var(--color-olive)] focus:ring-2 focus:ring-[rgba(155,148,47,.14)]" autoFocus required value={name} onChange={(event) => setName(event.target.value)} placeholder={`Nhập tên ${roleLabel}`} /></label>
        <AdminImageUpload label={`Ảnh ${roleLabel} (không bắt buộc)`} preview={imagePreview} fileName={imageFile?.name} onFileChange={chooseImage} onClear={() => { setImageFile(null); setImagePreview('') }} />
        {error && <p className="rounded-xl border border-[#ebc4bd] bg-[#fff5f2] px-4 py-3 font-body text-sm leading-6 text-[#a33d32]" role="alert">{error}</p>}
        <div className="flex justify-end gap-3 border-t border-[#eeeae0] pt-4"><button className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#dedbd0] px-5 font-body text-sm" type="button" onClick={onClose}>Hủy</button><button className="admin-primary-action inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--color-olive)] px-5 font-body text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={saving}>{saving ? 'Đang lưu…' : 'Lưu nhà sáng tạo'}</button></div>
      </form>
    </section>
  </div>
}

function AdminBookCreatePageV2() {
  const [values, setValues] = useState<AdminBookCreateValues>(() => {
    const payload = readAdminBookDraftPayload()
    return payload?.values ? { ...emptyAdminBookCreateValues, ...payload.values } : emptyAdminBookCreateValues
  })
  const [coverImages, setCoverImages] = useState<AdminImageAsset[]>([])
  const [sampleFile, setSampleFile] = useState<File | null>(null)
  const [samplePageCount, setSamplePageCount] = useState(() => readAdminBookDraftPayload()?.samplePageCount ?? '')
  const [isVisible, setIsVisible] = useState(() => readAdminBookDraftPayload()?.isVisible ?? true)
  const [homeModules, setHomeModules] = useState<string[]>(() => readAdminBookDraftPayload()?.homeModules ?? [])
  const [bookOptions, setBookOptions] = useState(adminSelectOptions)
  const [bookModuleOptions, setBookModuleOptions] = useState(homepageModules)
  const [saveError, setSaveError] = useState('')
  const [saving, setSaving] = useState(false)
  const [optionsError, setOptionsError] = useState('')
  const [fieldWarnings, setFieldWarnings] = useState<Partial<Record<keyof typeof values, string>>>({})
  const [quickCreatorRole, setQuickCreatorRole] = useState<QuickCreatorRole | null>(null)
  const [draftFilesLoaded, setDraftFilesLoaded] = useState(false)
  useEffect(() => {
    try { window.localStorage.setItem(adminBookDraftStorageKey, JSON.stringify({ values, isVisible, homeModules, samplePageCount })) } catch { /* draft persistence is best effort */ }
  }, [values, isVisible, homeModules, samplePageCount])
  useEffect(() => {
    void loadAdminBookDraftFiles().then(({ coverFiles, sampleFile: draftSampleFile }) => {
      if (coverFiles.length) setCoverImages((current) => current.length ? current : coverFiles.map((file) => ({ preview: URL.createObjectURL(file), name: file.name, file })))
      if (draftSampleFile) setSampleFile((current) => current ?? draftSampleFile)
    }).finally(() => setDraftFilesLoaded(true))
  }, [])
  useEffect(() => {
    if (!draftFilesLoaded) return
    void saveAdminBookDraftFiles(coverImages.map((image) => image.file).filter((file): file is File => Boolean(file)), sampleFile)
  }, [coverImages, sampleFile, draftFilesLoaded])
  useEffect(() => {
    let active = true
    void Promise.all([loadAdminCreators(), loadAdminTaxonomy(), loadAdminHomepageModules()]).then(([creators, taxonomy, modules]) => {
      if (!active) return
      const creatorNames = creators.map((creator) => creator.name).filter(Boolean).sort((left, right) => left.localeCompare(right, 'vi'))
      const namesFor = (kinds: AdminTaxonomyKind[]) => taxonomy.filter((term) => kinds.includes(term.kind) && term.isActive).map((term) => term.name).filter(Boolean)
      const unique = (items: string[]) => [...new Set(items)]
      setBookOptions({
        ...adminSelectOptions,
        authors: creatorNames,
        formats: unique(namesFor(['format'])),
        lines: unique(namesFor(['line'])),
        categories: unique(namesFor(['category'])),
        genres: unique(namesFor(['genre'])),
        topics: unique(namesFor(['topic'])),
        publishers: unique(namesFor(['publisher'])),
        imprints: unique(namesFor(['imprint'])),
        languages: unique(namesFor(['language'])),
      })
      setBookModuleOptions(modules.filter((module) => module.isActive).map((module) => module.name))
    }).catch((reason: unknown) => setOptionsError(reason instanceof Error ? reason.message : 'Không tải được dữ liệu danh mục từ Supabase.'))
    return () => { active = false }
  }, [])
  const setValue = (key: keyof typeof values, value: string | string[]) => setValues((current) => ({ ...current, [key]: value }))
  const priceKeys = ['coverPriceUsd', 'salePrice', 'comparePrice'] as const
  const isPriceKey = (key: keyof typeof values): key is typeof priceKeys[number] => priceKeys.includes(key as typeof priceKeys[number])
  const formatNumericValue = (value: string, key: keyof typeof values) => {
    if (!value) return ''
    const amount = Number(value)
    if (!Number.isFinite(amount)) return ''
    if (key === 'coverPriceUsd') {
      const fractionDigits = value.includes('.') ? Math.min(2, value.split('.')[1]?.length ?? 0) : 0
      return amount.toLocaleString('en-US', { minimumFractionDigits: fractionDigits, maximumFractionDigits: 2 })
    }
    return amount.toLocaleString('vi-VN')
  }
  const normalizePriceInput = (rawValue: string, key: keyof typeof values) => {
    const allowDecimal = key === 'coverPriceUsd'
    const invalidCharacters = rawValue.replace(/[\d.,\s]/g, '')
    if (!allowDecimal) return { value: rawValue.replace(/\D/g, ''), invalidCharacters }
    const compact = rawValue.replace(/\s/g, '')
    const separators = [...compact].flatMap((character, index) => character === '.' || character === ',' ? [{ character, index }] : [])
    if (!separators.length) return { value: compact.replace(/\D/g, ''), invalidCharacters }
    const lastSeparator = separators[separators.length - 1]
    const fractionCandidate = compact.slice(lastSeparator.index + 1).replace(/\D/g, '')
    const useDecimal = separators.length > 1 || fractionCandidate.length <= 2
    if (!useDecimal) return { value: compact.replace(/\D/g, ''), invalidCharacters }
    const integerPart = compact.slice(0, lastSeparator.index).replace(/\D/g, '') || '0'
    const fractionPart = fractionCandidate.slice(0, 2)
    return { value: fractionPart ? `${integerPart}.${fractionPart}` : integerPart, invalidCharacters }
  }
  const handleTextFieldChange = (key: keyof typeof values, rawValue: string) => {
    if (key === 'isbn') {
      const digits = rawValue.replace(/\D/g, '').slice(0, 13)
      setValue(key, digits)
      setFieldWarnings((current) => ({ ...current, [key]: rawValue !== digits ? 'Dấu gạch ngang và ký tự khác sẽ được tự động loại bỏ.' : '' }))
      return
    }
    if (isPriceKey(key)) {
      const normalized = normalizePriceInput(rawValue, key)
      setValue(key, normalized.value)
      setFieldWarnings((current) => ({ ...current, [key]: normalized.invalidCharacters ? 'Chỉ được nhập số. Ký tự khác đã được loại bỏ.' : '' }))
      return
    }
    setValue(key, rawValue)
  }
  const preventNonDigitKey = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.ctrlKey || event.metaKey || event.altKey) return
    if (['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'Tab', 'Enter'].includes(event.key)) return
    if (!/^\d$/.test(event.key)) event.preventDefault()
  }
  const pasteDigitsOnly = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault()
    const input = event.currentTarget
    const pastedDigits = event.clipboardData.getData('text').replace(/\D/g, '')
    const start = input.selectionStart ?? input.value.length
    const end = input.selectionEnd ?? input.value.length
    handleTextFieldChange('isbn', `${input.value.slice(0, start)}${pastedDigits}${input.value.slice(end)}`)
  }
  const defaultBookSlug = values.title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  const defaultBookPath = defaultBookSlug ? `/books/${defaultBookSlug}` : ''
  const textFields: Array<[keyof typeof values, string, string]> = [['title', 'Tên sách', 'text'], ['isbn', 'ISBN', 'text'], ['slug', 'Đường dẫn', 'text'], ['coverPriceUsd', 'Giá bìa (USD)', 'number'], ['salePrice', 'Giá bán (VNĐ)', 'number'], ['comparePrice', 'Giá so sánh (VNĐ)', 'number'], ['pages', 'Số trang', 'number'], ['bookSize', 'Khổ sách', 'text'], ['publicationDate', 'Ngày xuất bản', 'date'], ['weight', 'Trọng lượng', 'text']]
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (saving) return
    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null
    const published = submitter?.value !== 'draft' && isVisible
    setSaveError('')
    if (!values.title.trim()) {
      const message = 'Vui lòng nhập tên sách trước khi lưu.'
      setSaveError(message)
      emitFloatingNotice('error', message)
      return
    }
    if (!/^\d{13}$/.test(values.isbn.trim())) {
      const message = 'ISBN phải gồm đúng 13 chữ số trước khi lưu.'
      setSaveError(message)
      emitFloatingNotice('error', message)
      return
    }
    if (optionsError) {
      const message = 'Dữ liệu danh mục chưa tải được từ Supabase. Vui lòng tải lại trang rồi chọn lại trước khi lưu.'
      setSaveError(message)
      emitFloatingNotice('error', message)
      return
    }
    if (published && !values.author.length) {
      const message = 'Vui lòng nhập ít nhất một tác giả trước khi lưu sách.'
      setSaveError(message)
      emitFloatingNotice('error', message)
      return
    }
    const slug = (values.slug.trim() || defaultBookSlug).replace(/^\/books\//, '')
    const input: AdminBookInput = { isbn: normalizeAdminIsbn(values.isbn), title: values.title.trim() || 'Sách chưa đặt tên', slug, descriptionHtml: values.description.trim(), coverPriceUsd: values.coverPriceUsd ? Number(values.coverPriceUsd) : null, salePriceVnd: Number(values.salePrice) || 0, comparePriceVnd: values.comparePrice ? Number(values.comparePrice) : null, pageCount: values.pages ? Number(values.pages) : null, bookSize: values.bookSize.trim(), publicationDate: values.publicationDate, weight: values.weight.trim(), isVisibleWebsite: published, authors: values.author, translators: values.translator, illustrators: values.illustrator, categories: values.category, genres: values.genre, topics: values.topic, formats: values.format ? [values.format] : [], lines: values.line ? [values.line] : [], publishers: values.publisher ? [values.publisher] : [], imprints: values.imprint ? [values.imprint] : [], languages: values.language, homepageModules: published ? homeModules : [], sampleFile, samplePageCount: samplePageCount ? Number(samplePageCount) : null }
    setSaving(true)
    try {
      await createAdminBook(input, coverImages.map((image) => image.file).filter((file): file is File => Boolean(file)))
      window.localStorage.removeItem(adminBookDraftStorageKey)
      void clearAdminBookDraftFiles()
      queueFloatingNotice('success', 'Đã lưu sách và các liên kết vào Supabase.')
      window.location.replace('/admin/books')
      window.setTimeout(() => {
        if (window.location.pathname !== '/admin/books') window.location.href = '/admin/books'
      }, 1200)
    } catch (reason) {
      const message = describeSaveError(reason, 'Không lưu được sách vào Supabase.')
      setSaveError(message)
      emitFloatingNotice('error', `Không thể lưu sách: ${message}`)
      setSaving(false)
    }
  }
  const readCoverFile = (file: File, replacePrimary = false) => { const asset = { preview: URL.createObjectURL(file), name: file.name, file }; setCoverImages((current) => replacePrimary ? [asset, ...current.slice(1)] : [...current, asset]) }
  return <AdminSimpleCreateShell title="Thêm sách" backHref="/admin/books" section="SÁCH" description="Tạo sách từ các trường đã chuẩn hóa theo bốn sheet Picador, Penguin UK, Penguin US và NYRB. Tồn kho được nhập và điều chỉnh riêng tại Quản lý kho." showTabs={false} headerActions={<AdminCreateHeaderActions formId="admin-book-create-form" cancelHref="/admin/books" saveLabel="Lưu sách" saving={saving} />}>
    <form id="admin-book-create-form" noValidate className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]" onSubmit={(event) => { void submit(event) }}>
      {saveError && <p className="rounded-xl bg-[#fff4ec] px-4 py-3 font-body text-sm leading-6 text-[#9a4c2d] lg:col-span-2" role="alert">{saveError}</p>}
      <div className="min-w-0 space-y-5">
        {optionsError && <p className="rounded-xl border border-[#ebc4bd] bg-[#fff5f2] px-4 py-3 font-body text-sm leading-6 text-[#a33d32]" role="alert">Không tải được danh mục thật từ Supabase: {optionsError}. Hãy tải lại trang trước khi lưu để tránh ghi sai dữ liệu.</p>}
        <AdminCreatePanel id="book-information" title="Thông tin sách">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{textFields.map(([key, label, type]) => { const formattedValue = isPriceKey(key) ? formatNumericValue(values[key] as string, key) : key === 'slug' ? values.slug || defaultBookPath : values[key] as string; return <label className="block" key={key}><span className="mb-1.5 flex items-center font-body text-sm font-medium">{label}{['title', 'isbn'].includes(key) && <span className="ml-1 text-[var(--color-olive-dark)]">*</span>}{key === 'slug' && <AdminInfoTooltip label="Thông tin đường dẫn sách" text="Nếu bỏ trống, hệ thống sẽ tự tạo đường dẫn từ tên sách." />}</span><input className="min-h-11 w-full rounded-lg border border-[#dedbd0] bg-[#fcfbf7] px-3.5 font-body text-sm" type={isPriceKey(key) ? 'text' : type} min={isPriceKey(key) ? undefined : type === 'number' ? '0' : undefined} inputMode={key === 'isbn' || isPriceKey(key) ? 'numeric' : undefined} pattern={key === 'isbn' ? '[0-9]{13}' : undefined} maxLength={key === 'isbn' ? 13 : undefined} title={key === 'isbn' ? 'ISBN chỉ gồm đúng 13 chữ số.' : undefined} required={['title', 'isbn'].includes(key)} value={formattedValue} onKeyDown={key === 'isbn' ? preventNonDigitKey : undefined} onPaste={key === 'isbn' ? pasteDigitsOnly : undefined} onChange={(event) => handleTextFieldChange(key, event.target.value)} placeholder={key === 'slug' ? 'tu-dong-sinh-tu-ten-sach' : undefined} />{fieldWarnings[key] && <span className="mt-1 block font-body text-xs text-[#a33d32]" role="status">{fieldWarnings[key]}</span>}</label> })}<AdminSelect2 label="Imprint" value={values.imprint} options={bookOptions.imprints} onChange={(value) => setValue('imprint', value as string)} placeholder="Tìm và chọn imprint" /><AdminSelect2 label="Ngôn ngữ" value={values.language} options={bookOptions.languages} multiple onChange={(value) => setValue('language', value as string[])} placeholder="Tìm và chọn một hoặc nhiều ngôn ngữ" /></div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3"><div className="grid min-w-0 grid-cols-[minmax(0,1fr)_2.75rem] items-end gap-2"><AdminSelect2 label="Tác giả" value={values.author} options={bookOptions.authors} multiple required onChange={(value) => setValue('author', value as string[])} placeholder="Tìm và chọn một hoặc nhiều tác giả" /><button className="mb-0 inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--color-olive)] text-lg text-[var(--color-olive-dark)] transition-colors hover:bg-[var(--color-olive)] hover:text-white" type="button" aria-label="Thêm nhanh tác giả" title="Thêm nhanh tác giả" onClick={() => setQuickCreatorRole('author')}><i className="bi bi-plus-lg" aria-hidden="true" /></button></div><div className="grid min-w-0 grid-cols-[minmax(0,1fr)_2.75rem] items-end gap-2"><AdminSelect2 label="Dịch giả" value={values.translator} options={bookOptions.authors} multiple onChange={(value) => setValue('translator', value as string[])} placeholder="Tìm và chọn một hoặc nhiều dịch giả" /><button className="mb-0 inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--color-olive)] text-lg text-[var(--color-olive-dark)] transition-colors hover:bg-[var(--color-olive)] hover:text-white" type="button" aria-label="Thêm nhanh dịch giả" title="Thêm nhanh dịch giả" onClick={() => setQuickCreatorRole('translator')}><i className="bi bi-plus-lg" aria-hidden="true" /></button></div><div className="grid min-w-0 grid-cols-[minmax(0,1fr)_2.75rem] items-end gap-2"><AdminSelect2 label="Họa sĩ minh họa" value={values.illustrator} options={bookOptions.authors} multiple onChange={(value) => setValue('illustrator', value as string[])} placeholder="Tìm và chọn một hoặc nhiều họa sĩ" /><button className="mb-0 inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--color-olive)] text-lg text-[var(--color-olive-dark)] transition-colors hover:bg-[var(--color-olive)] hover:text-white" type="button" aria-label="Thêm nhanh họa sĩ minh họa" title="Thêm nhanh họa sĩ minh họa" onClick={() => setQuickCreatorRole('illustrator')}><i className="bi bi-plus-lg" aria-hidden="true" /></button></div><AdminSelect2 label="Thể thức" value={values.format} options={bookOptions.formats} onChange={(value) => setValue('format', value as string)} placeholder="Tìm và chọn thể thức" /><AdminSelect2 label="Dòng sách" value={values.line} options={bookOptions.lines} onChange={(value) => setValue('line', value as string)} placeholder="Tìm và chọn dòng sách" /><AdminSelect2 label="Danh mục" value={values.category} options={bookOptions.categories} multiple onChange={(value) => setValue('category', value as string[])} placeholder="Tìm và chọn một hoặc nhiều danh mục" /><AdminSelect2 label="Thể loại" value={values.genre} options={bookOptions.genres} multiple onChange={(value) => setValue('genre', value as string[])} placeholder="Tìm và chọn một hoặc nhiều thể loại" /><AdminSelect2 label="Chủ đề" value={values.topic} options={bookOptions.topics} multiple onChange={(value) => setValue('topic', value as string[])} placeholder="Tìm và chọn một hoặc nhiều chủ đề" /><AdminSelect2 label="Publisher" value={values.publisher} options={bookOptions.publishers} onChange={(value) => setValue('publisher', value as string)} placeholder="Tìm và chọn publisher" /></div>
        </AdminCreatePanel>
        <div id="book-description" className="scroll-mt-24"><AdminCreatePanel title="Mô tả sách"><AdminRichTextEditor label="Nội dung mô tả" value={values.description} onChange={(value) => setValue('description', value)} placeholder="Nhập mô tả, nội dung giới thiệu và ghi chú biên tập cho sách..." /></AdminCreatePanel></div>
      </div>
      <aside className="admin-create-aside min-w-0 space-y-5">
        <div id="book-cover" className="scroll-mt-24"><AdminCreatePanel title="Ảnh bìa"><AdminImageUploadWithExtras label="Ảnh bìa" showLabel={false} preview={coverImages[0]?.preview ?? ''} fileName={coverImages[0]?.name} extraItems={coverImages.slice(1)} onPrimaryFileChange={(file) => readCoverFile(file, true)} onPrimaryClear={() => setCoverImages((current) => current.slice(1))} onExtraFilesChange={(files) => files.forEach((file) => readCoverFile(file))} onRemoveExtra={(index) => setCoverImages((current) => current.filter((_, itemIndex) => itemIndex !== index + 1))} /></AdminCreatePanel></div>
        <AdminCreatePanel title="File đọc thử"><AdminSampleUpload fileName={sampleFile?.name} onFileChange={setSampleFile} onClear={() => { setSampleFile(null); setSamplePageCount('') }} /><label className="mt-3 block"><span className="mb-1.5 block font-body text-sm font-medium">Số trang đọc thử (không bắt buộc)</span><input className="min-h-11 w-full rounded-lg border border-[#dedbd0] bg-[#fcfbf7] px-3.5 font-body text-sm" type="number" min="1" value={samplePageCount} onChange={(event) => setSamplePageCount(event.target.value)} placeholder="Ví dụ: 4" /></label></AdminCreatePanel>
        <AdminCreatePanel title="Hiển thị"><label className="flex cursor-pointer items-center gap-3 p-1"><span className="relative inline-flex h-6 w-11 shrink-0 items-center"><input className="peer sr-only" type="checkbox" role="switch" aria-label="Hiển thị website" checked={isVisible} onChange={(event) => setIsVisible(event.target.checked)} /><span className="absolute inset-0 rounded-full bg-[#d8d5c8] transition-colors peer-checked:bg-[var(--color-olive)] peer-focus-visible:ring-2 peer-focus-visible:ring-[rgba(155,148,47,.25)]" aria-hidden="true" /><span className="pointer-events-none relative ml-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" aria-hidden="true" /></span><span className="flex min-w-0 items-center font-body text-sm font-semibold text-[var(--color-ink)]">Hiển thị website <AdminInfoTooltip label="Giải thích hiển thị website" text="Nếu tắt, sách không hiển thị ở bất kỳ vị trí nào trên web." /></span></label><div className="mt-5 border-t border-[#eeeae0] pt-4"><p className="flex items-center gap-2 font-body text-sm font-semibold text-[var(--color-ink)]">Hiển thị mô đun trang chủ <AdminInfoTooltip label="Giải thích mô đun trang chủ" text="Chọn một hoặc nhiều mô đun đã tạo trên trang chủ để đưa sách vào đó." /></p><div className="space-y-1.5">{bookModuleOptions.map((module) => <label className={`flex cursor-pointer items-center gap-3 px-1 py-2 transition-colors ${!isVisible ? 'cursor-not-allowed opacity-55' : 'hover:text-[var(--color-olive-dark)]'}`} key={module}><input className="h-4 w-4 shrink-0 accent-[var(--color-olive)]" type="checkbox" disabled={!isVisible} checked={homeModules.includes(module)} onChange={(event) => setHomeModules((current) => event.target.checked ? [...current, module] : current.filter((item) => item !== module))} /><span className="font-body text-sm text-[var(--color-ink)]">{module}</span></label>)}</div>{!isVisible && <p className="mt-3 font-body text-xs text-[#8b8d86]">Bật “Hiển thị website” để chọn mô đun trang chủ.</p>}</div></AdminCreatePanel>
      </aside>
    </form>{quickCreatorRole && <AdminQuickCreatorModal role={quickCreatorRole} existingNames={bookOptions.authors} onClose={() => setQuickCreatorRole(null)} onSaved={(name) => { setBookOptions((current) => ({ ...current, authors: [...current.authors, name].sort((left, right) => left.localeCompare(right, 'vi')) })); const key = quickCreatorRole === 'author' ? 'author' : quickCreatorRole === 'translator' ? 'translator' : 'illustrator'; setValues((current) => ({ ...current, [key]: [...current[key], name] })); setQuickCreatorRole(null) }} />}
  </AdminSimpleCreateShell>
}

function AdminCategoryCreatePageV3() {
  const [name, setName] = useState('')
  const [kind, setKind] = useState<CategoryKind>('Danh mục')
  const [parentId, setParentId] = useState('')
  const [manualSlug, setManualSlug] = useState(false)
  const [slugOverride, setSlugOverride] = useState('')
  const slugify = (value: string) => value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  const autoSlug = slugify(name)
  const parentOptions = adminCategoryRecords.filter((item) => (item.kind ?? 'Danh mục') === kind)
  return <AdminSimpleCreateShell title="Thêm danh mục sách" backHref="/admin/books/categories" section="SÁCH" description="Tạo danh mục hoặc chủ đề, sau đó sắp xếp thành cây cha–con trong danh sách."><form className="grid gap-5" onSubmit={(event) => event.preventDefault()}><div className="grid gap-4 sm:grid-cols-2"><label className="block"><span className="mb-1.5 block font-body text-sm font-medium">Loại dữ liệu<span className="ml-1 text-[var(--color-olive-dark)]">*</span></span><select className="min-h-11 w-full rounded-xl border border-[#dedbd0] bg-[#fcfbf7] px-3.5 font-body text-sm" required value={kind} onChange={(event) => { setKind(event.target.value as CategoryKind); setParentId('') }}><option value="Danh mục">Danh mục</option><option value="Chủ đề">Chủ đề</option></select><span className="mt-1 block font-body text-xs text-[#8b8d86]">Dùng để tách các cây dữ liệu độc lập trong catalog.</span></label><label className="block"><span className="mb-1.5 block font-body text-sm font-medium">Danh mục cha</span><select className="min-h-11 w-full rounded-xl border border-[#dedbd0] bg-[#fcfbf7] px-3.5 font-body text-sm" value={parentId} onChange={(event) => setParentId(event.target.value)}><option value="">Không có, cấp cao nhất</option>{parentOptions.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select><span className="mt-1 block font-body text-xs text-[#8b8d86]">Chỉ hiển thị mục cha cùng loại dữ liệu.</span></label><label className="block sm:col-span-2"><span className="mb-1.5 block font-body text-sm font-medium">Tên {kind.toLowerCase()}<span className="ml-1 text-[var(--color-olive-dark)]">*</span></span><input className="min-h-11 w-full rounded-xl border border-[#dedbd0] bg-[#fcfbf7] px-3.5 font-body text-sm" required value={name} onChange={(event) => setName(event.target.value)} placeholder={`Nhập tên ${kind.toLowerCase()}`} /></label><div className="sm:col-span-2"><label className="flex items-center gap-2 font-body text-sm font-medium"><input className="h-4 w-4 accent-[var(--color-olive)]" type="checkbox" checked={manualSlug} onChange={(event) => setManualSlug(event.target.checked)} />Tự nhập đường dẫn</label><div className="mt-2 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"><input className="min-h-11 w-full rounded-xl border border-[#dedbd0] bg-[#fcfbf7] px-3.5 font-body text-sm disabled:cursor-not-allowed disabled:bg-[#f4f3ed]" value={manualSlug ? slugOverride : autoSlug} onChange={(event) => setSlugOverride(event.target.value)} disabled={!manualSlug} placeholder="ten-danh-muc" aria-label="Đường dẫn" /><span className="font-body text-xs text-[#8b8d86]">{manualSlug ? 'Đường dẫn tự nhập theo ý đồ.' : 'Tự sinh từ tên, bỏ dấu và dùng gạch ngang.'}</span></div></div><label className="block sm:col-span-2"><span className="mb-1.5 block font-body text-sm font-medium">Mô tả</span><textarea className="min-h-28 w-full rounded-xl border border-[#dedbd0] bg-[#fcfbf7] p-3.5 font-body text-sm" placeholder="Mô tả ngắn để quản trị dễ nhận biết nhóm dữ liệu này." /></label></div><div className="flex justify-end gap-3 border-t border-[#eeeae0] pt-5"><a className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#dedbd0] px-5 font-body text-sm" href="/admin/books/categories">Hủy</a><button className="admin-primary-action inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--color-olive)] px-5 font-body text-sm font-medium text-white" type="submit">Lưu {kind.toLowerCase()}</button></div></form></AdminSimpleCreateShell>
}

function AdminCategoryCreatePageV2() {
  const [parent, setParent] = useState('')
  return <AdminSimpleCreateShell title="Thêm danh mục" backHref="/admin/books/categories" section="DANH MỤC" description="Tạo danh mục trong database để các màn tạo sách có thể tìm và chọn lại."><form className="grid gap-4 sm:grid-cols-2" onSubmit={(event) => event.preventDefault()}><label className="block"><span className="mb-1.5 block font-body text-sm font-medium">Tên danh mục<span className="ml-1 text-[var(--color-olive-dark)]">*</span></span><input className="min-h-11 w-full rounded-xl border border-[#dedbd0] bg-[#fcfbf7] px-3.5 font-body text-sm" required /></label><AdminSelect2 label="Danh mục cha" value={parent} options={['Fiction', 'Non-fiction']} onChange={(value) => setParent(value as string)} placeholder="Tìm và chọn danh mục cha" /><label className="block"><span className="mb-1.5 block font-body text-sm font-medium">Thứ tự</span><input className="min-h-11 w-full rounded-xl border border-[#dedbd0] bg-[#fcfbf7] px-3.5 font-body text-sm" type="number" min="1" defaultValue="1" /></label><label className="block"><span className="mb-1.5 block font-body text-sm font-medium">Đường dẫn</span><input className="min-h-11 w-full rounded-xl border border-[#dedbd0] bg-[#fcfbf7] px-3.5 font-body text-sm" /></label><label className="block sm:col-span-2"><span className="mb-1.5 block font-body text-sm font-medium">Mô tả</span><textarea className="min-h-28 w-full rounded-xl border border-[#dedbd0] bg-[#fcfbf7] p-3.5 font-body text-sm" /></label><AdminFormActions cancelHref="/admin/books/categories" saveLabel="Lưu danh mục" /></form></AdminSimpleCreateShell>
}

function AdminListShell({ title, section, description: _description, createHref, createLabel, children }: { title: string; section: string; description: string; createHref: string; createLabel: string; children: ReactNode }) {
  return <AdminShell title={title} section={section} headerActions={<a className="admin-primary-action inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-[var(--color-olive)] px-4 font-body text-sm font-medium text-white" href={createHref}><i className="bi bi-plus-lg" aria-hidden="true" />{createLabel}</a>}>{children}</AdminShell>
}

function AdminAuthorsPageV3() {
  const [query, setQuery] = useState('')
  const [creators, setCreators] = useState<AdminCreatorRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useEffect(() => {
    let mounted = true
    void loadAdminCreators().then((rows) => { if (mounted) { setCreators(rows); setError('') } }).catch((reason: unknown) => { if (mounted) setError(reason instanceof Error ? reason.message : 'Không tải được danh sách creators từ Supabase.') }).finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [])
  const filteredCreators = creators.filter((creator) => `${creator.name} ${creator.slug} ${creator.roles.join(' ')}`.toLowerCase().includes(query.trim().toLowerCase()))
  const roleLabel = (roles: AdminCreatorRow['roles']) => roles.map((role) => creatorRoleLabels[role]).join(' · ') || 'Nhà sáng tạo'
  return <AdminListShell title="Nhà sáng tạo nội dung" section="NỘI DUNG" description="Quản lý tác giả, dịch giả và họa sĩ minh họa trong cùng một danh mục hồ sơ." createHref="/admin/authors/new" createLabel="Thêm nhà sáng tạo"><section className="overflow-hidden rounded-2xl border border-[#e6e2d7] bg-white"><div className="flex flex-col justify-between gap-3 border-b border-[#eeeae0] p-5 sm:flex-row sm:items-center"><div><h3 className="font-display text-lg font-semibold">Danh sách nhà sáng tạo nội dung</h3><p className="mt-1 font-body text-sm text-[#74776f]">{loading ? 'Đang tải dữ liệu thật từ Supabase…' : `${filteredCreators.length} hồ sơ`}</p></div><input className="min-h-10 rounded-xl border border-[#dedbd0] bg-[#fcfbf7] px-3.5 font-body text-sm sm:w-80" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm tên nhà sáng tạo" /></div>{error && <p className="m-5 rounded-xl border border-[#ebc4bd] bg-[#fff5f2] p-4 font-body text-sm text-[#a33d32]" role="alert">{error}</p>}<div className="overflow-x-auto"><table className="min-w-[900px] w-full text-left"><thead className="bg-[#fcfbf7]"><tr>{['Tên hiển thị', 'Phân loại', 'Đường dẫn', 'Số sách', 'Trạng thái', 'Thao tác'].map((heading) => <th className="px-4 py-3 font-body text-sm font-semibold" key={heading}>{heading}</th>)}</tr></thead><tbody>{filteredCreators.map((creator) => <tr className="border-t border-[#eeeae0]" key={creator.id}><td className="px-4 py-3 font-body text-sm font-medium"><div className="flex items-center gap-3"><img className="h-9 w-9 rounded-full object-cover" src={creator.image} alt="" onError={(event) => { event.currentTarget.src = '/assets/author-avatar-placeholder.png' }} /><span>{creator.name}</span></div></td><td className="px-4 py-3 font-body text-sm">{roleLabel(creator.roles)}</td><td className="px-4 py-3 font-body text-sm text-[#74776f]">{creator.slug}</td><td className="px-4 py-3 font-body text-sm">{creator.bookCount}</td><td className="px-4 py-3 font-body text-sm">{creator.status}</td><td className="px-4 py-3 text-right"><a className="font-body text-sm text-[var(--color-olive-dark)]" href={`/admin/authors/${creator.id}`}>Xem / sửa</a></td></tr>)}</tbody></table></div>{!loading && !filteredCreators.length && <div className="p-10 text-center font-body text-sm text-[#74776f]">Chưa có creator phù hợp trong Supabase.</div>}</section></AdminListShell>
}

function AdminAuthorsPageV2() {
  const [query, setQuery] = useState('')
  const authors = adminAuthorRecords.filter((author) => author.name.toLowerCase().includes(query.toLowerCase()))
  return <AdminListShell title="Quản lý tác giả" section="NỘI DUNG" description="Danh sách tác giả là màn riêng. Bấm Thêm tác giả để mở đúng màn tạo mới." createHref="/admin/authors/new" createLabel="Thêm tác giả"><section className="overflow-hidden rounded-2xl border border-[#e6e2d7] bg-white"><div className="flex flex-col justify-between gap-3 border-b border-[#eeeae0] p-5 sm:flex-row sm:items-center"><div><h3 className="font-display text-lg font-semibold">Danh sách tác giả</h3><p className="mt-1 font-body text-sm text-[#74776f]">{authors.length} tác giả</p></div><input className="min-h-10 rounded-xl border border-[#dedbd0] bg-[#fcfbf7] px-3.5 font-body text-sm sm:w-80" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm tên tác giả" /></div><div className="overflow-x-auto"><table className="min-w-[760px] w-full text-left"><thead className="bg-[#fcfbf7]"><tr>{['Tên tác giả', 'Đường dẫn', 'Số sách', 'Trạng thái', 'Thao tác'].map((heading) => <th className="px-4 py-3 font-body text-sm font-semibold" key={heading}>{heading}</th>)}</tr></thead><tbody>{authors.map((author) => <tr className="border-t border-[#eeeae0]" key={author.id}><td className="px-4 py-3 font-body text-sm font-medium">{author.name}</td><td className="px-4 py-3 font-body text-sm text-[#74776f]">{author.slug}</td><td className="px-4 py-3 font-body text-sm">{author.books}</td><td className="px-4 py-3 font-body text-sm">{author.status}</td><td className="px-4 py-3 text-right"><a className="font-body text-sm text-[var(--color-olive-dark)]" href={`/admin/authors/${author.id}`}>Xem / sửa</a></td></tr>)}</tbody></table></div></section></AdminListShell>
}

const adminCategoryRecords: AdminLookupItem[] = [{ id: 'fiction', name: 'Fiction', parentId: null }, { id: 'novels', name: 'Novels', parentId: 'fiction' }, { id: 'short-stories', name: 'Short stories', parentId: 'fiction' }, { id: 'poetry-drama', name: 'Poetry & Drama', parentId: 'fiction' }, { id: 'non-fiction', name: 'Non-fiction', parentId: null }, { id: 'essays', name: 'Essays', parentId: 'non-fiction' }, { id: 'research', name: 'Research & Studies', parentId: 'non-fiction' }, { id: 'memoir', name: 'Memoir & Biography', parentId: 'non-fiction' }]

function AdminCategoriesPageV2() {
  const numberFor = (id: string): string => { const item = adminCategoryRecords.find((entry) => entry.id === id); if (!item) return ''; const siblings = adminCategoryRecords.filter((entry) => entry.parentId === item.parentId); const position = siblings.findIndex((entry) => entry.id === id) + 1; return item.parentId ? `${numberFor(item.parentId).replace(/\.$/, '')}.${position}` : `${position}.` }
  return <AdminListShell title="Danh mục sách" section="SÁCH" description="Danh mục được quản lý trong database; sách chỉ chọn các danh mục đã tạo. Thứ tự hiển thị hỗ trợ cấp 1, 1.1, 1.2 theo quan hệ cha–con." createHref="/admin/books/categories/new" createLabel="Thêm danh mục"><section className="overflow-hidden rounded-2xl border border-[#e6e2d7] bg-white"><div className="border-b border-[#eeeae0] p-5"><h3 className="font-display text-lg font-semibold">Danh sách danh mục</h3><p className="mt-1 font-body text-sm text-[#74776f]">{adminCategoryRecords.length} danh mục đã tạo</p></div><div className="overflow-x-auto"><table className="min-w-[720px] w-full text-left"><thead className="bg-[#fcfbf7]"><tr><th className="px-4 py-3 font-body text-sm font-semibold">Thứ tự</th><th className="px-4 py-3 font-body text-sm font-semibold">Tên danh mục</th><th className="px-4 py-3 font-body text-sm font-semibold">Cấp cha</th><th className="px-4 py-3 text-right font-body text-sm font-semibold">Thao tác</th></tr></thead><tbody>{adminCategoryRecords.map((category) => <tr className="border-t border-[#eeeae0]" key={category.id}><td className="px-4 py-3 font-body text-sm font-semibold text-[var(--color-olive-dark)]">{numberFor(category.id)}</td><td className={`px-4 py-3 font-body text-sm ${category.parentId ? 'pl-10' : ''}`}>{category.name}</td><td className="px-4 py-3 font-body text-sm text-[#74776f]">{category.parentId ? adminCategoryRecords.find((item) => item.id === category.parentId)?.name : 'Cấp cao nhất'}</td><td className="px-4 py-3 text-right"><a className="font-body text-sm text-[var(--color-olive-dark)]" href={`/admin/books/categories/${category.id}`}>Xem / sửa</a></td></tr>)}</tbody></table></div></section></AdminListShell>
}

function AdminCategoriesPageV3() {
  const [categories, setCategories] = useState<AdminLookupItem[]>(adminCategoryRecords)
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [dropTarget, setDropTarget] = useState<{ id: string; position: 'before' | 'inside' | 'after' } | null>(null)
  const getDepth = (id: string): number => { const item = categories.find((entry) => entry.id === id); return item?.parentId ? getDepth(item.parentId) + 1 : 0 }
  const numberFor = (id: string): string => { const item = categories.find((entry) => entry.id === id); if (!item) return ''; const siblings = categories.filter((entry) => entry.parentId === item.parentId); const position = siblings.findIndex((entry) => entry.id === id) + 1; return item.parentId ? `${numberFor(item.parentId).replace(/\.$/, '')}.${position}` : `${position}.` }
  const moveCategory = (targetId: string) => {
    if (!draggedId || !dropTarget || draggedId === targetId) return
    setCategories((current) => {
      const target = current.find((entry) => entry.id === targetId)
      if (!target) return current
      const descendants = new Set<string>()
      const collect = (parentId: string) => current.filter((entry) => entry.parentId === parentId).forEach((entry) => { descendants.add(entry.id); collect(entry.id) })
      collect(draggedId)
      if (descendants.has(targetId)) return current
      const movingIds = new Set([draggedId, ...descendants])
      const nextParentId = dropTarget.position === 'inside' ? target.id : target.parentId
      const moving = current.filter((entry) => movingIds.has(entry.id)).map((entry) => entry.id === draggedId ? { ...entry, parentId: nextParentId } : entry)
      const remaining = current.filter((entry) => !movingIds.has(entry.id))
      const targetIndex = remaining.findIndex((entry) => entry.id === targetId)
      if (targetIndex < 0) return current
      const insertIndex = dropTarget.position === 'before' ? targetIndex : targetIndex + 1
      remaining.splice(insertIndex, 0, ...moving)
      return remaining
    })
    setDraggedId(null)
    setDropTarget(null)
  }
  return <AdminListShell title="Danh mục sách" section="SÁCH" description="Kéo thả danh mục để đổi thứ tự hoặc thả vào một danh mục khác để chuyển thành cấp con. Ví dụ: 1 → 1.1 → 1.1.1." createHref="/admin/books/categories/new" createLabel="Thêm danh mục"><section className="overflow-hidden rounded-2xl border border-[#e6e2d7] bg-white"><div className="flex flex-col justify-between gap-3 border-b border-[#eeeae0] p-5 sm:flex-row sm:items-center"><div><h3 className="font-display text-lg font-semibold">Danh sách danh mục</h3><p className="mt-1 font-body text-sm text-[#74776f]">Kéo biểu tượng ở đầu dòng để sắp xếp hoặc phân cấp.</p></div><span className="inline-flex min-h-9 items-center rounded-lg bg-[#f6f5ed] px-3 font-body text-xs text-[#62655f]">{categories.length} danh mục</span></div><div className="divide-y divide-[#eeeae0]">{categories.map((category) => { const depth = getDepth(category.id); const targetPosition = dropTarget?.id === category.id ? dropTarget.position : null; return <div className={`flex items-center gap-3 px-5 py-3 transition ${targetPosition === 'inside' ? 'bg-[rgba(155,148,47,.12)]' : ''} ${targetPosition === 'before' ? 'border-t-2 border-[var(--color-olive)]' : ''} ${targetPosition === 'after' ? 'border-b-2 border-[var(--color-olive)]' : ''}`} key={category.id} draggable onDragStart={() => setDraggedId(category.id)} onDragEnd={() => { setDraggedId(null); setDropTarget(null) }} onDragOver={(event) => { event.preventDefault(); const rect = event.currentTarget.getBoundingClientRect(); const ratio = (event.clientY - rect.top) / rect.height; setDropTarget({ id: category.id, position: ratio < 0.28 ? 'before' : ratio > 0.72 ? 'after' : 'inside' }) }} onDrop={(event) => { event.preventDefault(); moveCategory(category.id) }}><button className="inline-flex h-9 w-9 flex-none cursor-grab items-center justify-center rounded-lg text-[#8b8d86] hover:bg-[#f5f3ec] active:cursor-grabbing" type="button" aria-label={`Kéo ${category.name}`}><i className="bi bi-grip-vertical" aria-hidden="true" /></button><span className="w-12 flex-none font-body text-sm font-semibold text-[var(--color-olive-dark)]">{numberFor(category.id)}</span><div className={`min-w-0 flex-1 font-body text-sm ${depth > 0 ? 'pl-6' : ''}`}><p className="font-medium">{category.name}</p><p className="mt-0.5 text-xs text-[#8b8d86]">{category.parentId ? `Con của ${categories.find((entry) => entry.id === category.parentId)?.name}` : 'Cấp cao nhất'}</p></div><span className="hidden rounded-full bg-[#f6f5ed] px-2.5 py-1 font-body text-xs text-[#74776f] sm:inline-flex">{targetPosition === 'inside' ? 'Thả để làm cấp con' : 'Kéo để sắp xếp'}</span><a className="font-body text-sm text-[var(--color-olive-dark)]" href={`/admin/books/categories/${category.id}`}>Xem / sửa</a></div> })}</div></section></AdminListShell>
}

function AdminCategoriesPageV4() {
  const [categories, setCategories] = useState<AdminLookupItem[]>(adminCategoryRecords)
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [dropTarget, setDropTarget] = useState<{ id: string; position: 'before' | 'inside' | 'after' } | null>(null)
  const getDepth = (id: string): number => { const item = categories.find((entry) => entry.id === id); return item?.parentId ? getDepth(item.parentId) + 1 : 0 }
  const getRootId = (id: string): string => { const item = categories.find((entry) => entry.id === id); return item?.parentId ? getRootId(item.parentId) : id }
  const numberFor = (id: string): string => { const item = categories.find((entry) => entry.id === id); if (!item) return ''; const siblings = categories.filter((entry) => entry.parentId === item.parentId); const position = siblings.findIndex((entry) => entry.id === id) + 1; return item.parentId ? `${numberFor(item.parentId).replace(/\.$/, '')}.${position}` : `${position}.` }
  const rootIndexFor = (id: string) => categories.filter((entry) => entry.parentId === null).findIndex((entry) => entry.id === getRootId(id))
  const moveCategory = () => {
    if (!draggedId || !dropTarget || draggedId === dropTarget.id) return
    setCategories((current) => {
      const target = current.find((entry) => entry.id === dropTarget.id)
      if (!target) return current
      const descendants = new Set<string>()
      const collect = (parentId: string) => current.filter((entry) => entry.parentId === parentId).forEach((entry) => { descendants.add(entry.id); collect(entry.id) })
      collect(draggedId)
      if (descendants.has(target.id)) return current
      const movingIds = new Set([draggedId, ...descendants])
      const nextParentId = dropTarget.position === 'inside' ? target.id : target.parentId
      const moving = current.filter((entry) => movingIds.has(entry.id)).map((entry) => entry.id === draggedId ? { ...entry, parentId: nextParentId } : entry)
      const remaining = current.filter((entry) => !movingIds.has(entry.id))
      const targetIndex = remaining.findIndex((entry) => entry.id === target.id)
      if (targetIndex < 0) return current
      remaining.splice(dropTarget.position === 'before' ? targetIndex : targetIndex + 1, 0, ...moving)
      return remaining
    })
    setDraggedId(null)
    setDropTarget(null)
  }
  const targetLabel = dropTarget ? categories.find((entry) => entry.id === dropTarget.id)?.name : ''
  const dropMessage = dropTarget?.position === 'inside' ? `Thả vào giữa dòng để đưa vào “${targetLabel}”` : dropTarget?.position === 'before' ? `Thả lên trên “${targetLabel}”` : dropTarget ? `Thả xuống dưới “${targetLabel}”` : 'Di chuyển lên/xuống để sắp xếp'
  return <AdminListShell title="Danh mục sách" section="SÁCH" description="Quản lý các cây Danh mục và Chủ đề. Kéo một dòng để sắp xếp; vùng giữa dòng là đưa vào cấp con." createHref="/admin/books/categories/new" createLabel="Thêm danh mục"><section className="overflow-hidden rounded-2xl border border-[#e6e2d7] bg-white"><div className="border-b border-[#eeeae0] p-5"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start"><div><h3 className="font-display text-lg font-semibold">Cây danh mục và chủ đề</h3><p className="mt-1 max-w-2xl font-body text-sm leading-6 text-[#74776f]">Mỗi nhóm cấp cao nhất dùng một màu nền xen kẽ. Khi rê chuột, đường màu cho biết chính xác vị trí sẽ thả.</p></div><span className="inline-flex min-h-9 items-center rounded-lg bg-[#f6f5ed] px-3 font-body text-xs text-[#62655f]">{categories.length} mục</span></div>{draggedId && <p className="mt-4 rounded-lg border border-[var(--color-olive)] bg-[rgba(155,148,47,.08)] px-3 py-2 font-body text-sm font-medium text-[var(--color-olive-dark)]" role="status"><i className="bi bi-arrows-move mr-2" aria-hidden="true" />{dropMessage}</p>}</div><div className="divide-y divide-[#e6e2d7]">{categories.map((category) => { const depth = getDepth(category.id); const rootIndex = rootIndexFor(category.id); const targetPosition = dropTarget?.id === category.id ? dropTarget.position : null; const groupClass = rootIndex % 2 === 0 ? 'bg-[#fcfbf7]' : 'bg-[#f3f3e8]'; const depthClass = depth === 1 ? 'pl-6' : depth === 2 ? 'pl-12' : depth > 2 ? 'pl-16' : ''; return <div className={`relative flex items-center gap-3 px-4 py-3 transition sm:px-5 ${groupClass} ${draggedId === category.id ? 'opacity-45' : ''} ${targetPosition === 'inside' ? 'ring-2 ring-inset ring-[var(--color-olive)]' : ''} ${targetPosition === 'before' ? 'border-t-2 border-t-[var(--color-olive)]' : ''} ${targetPosition === 'after' ? 'border-b-2 border-b-[var(--color-olive)]' : ''}`} data-category-id={category.id} key={category.id} draggable onDragStart={(event) => { setDraggedId(category.id); event.dataTransfer.effectAllowed = 'move'; event.dataTransfer.setData('text/plain', category.id) }} onDragEnd={() => { setDraggedId(null); setDropTarget(null) }} onDragOver={(event) => { event.preventDefault(); if (draggedId === category.id) return; const rect = event.currentTarget.getBoundingClientRect(); const ratio = (event.clientY - rect.top) / rect.height; setDropTarget({ id: category.id, position: ratio < .3 ? 'before' : ratio > .7 ? 'after' : 'inside' }); event.dataTransfer.dropEffect = 'move' }} onDrop={(event) => { event.preventDefault(); moveCategory() }}><button className="inline-flex h-9 w-9 flex-none cursor-grab items-center justify-center rounded-lg border border-transparent text-[#74776f] hover:border-[var(--color-olive)] hover:bg-white active:cursor-grabbing" type="button" aria-label={`Kéo ${category.name}`}><i className="bi bi-grip-vertical" aria-hidden="true" /></button><span className="w-12 flex-none font-body text-sm font-semibold text-[var(--color-olive-dark)]">{numberFor(category.id)}</span><div className={`min-w-0 flex-1 font-body text-sm ${depthClass}`}><div className="flex flex-wrap items-center gap-2"><span className="inline-flex w-5 shrink-0 items-center justify-center">{depth > 0 && <i className="bi bi-arrow-return-right text-[var(--color-olive-dark)]" aria-hidden="true" />}</span><span className="font-medium">{category.name}</span><span className="rounded-full border border-[#d9d6c8] bg-white/70 px-2 py-0.5 font-body text-[11px] text-[#74776f]">{category.kind ?? 'Danh mục'}</span></div><p className="mt-0.5 text-xs text-[#74776f]">{category.parentId ? `Con của ${categories.find((entry) => entry.id === category.parentId)?.name}` : 'Cấp cao nhất · kéo vào vùng giữa để nhận cấp con'}</p></div><span className={`hidden rounded-full px-2.5 py-1 font-body text-xs sm:inline-flex ${targetPosition ? 'bg-white font-semibold text-[var(--color-olive-dark)]' : 'bg-white/60 text-[#74776f]'}`}>{targetPosition === 'inside' ? 'Vào cấp con' : targetPosition === 'before' ? 'Đặt lên trên' : targetPosition === 'after' ? 'Đặt xuống dưới' : 'Kéo để sắp xếp'}</span><a className="font-body text-sm text-[var(--color-olive-dark)]" href={`/admin/books/categories/${category.id}`}>Xem / sửa</a></div> })}</div><div className="border-t border-[#e6e2d7] bg-[#fcfbf7] px-5 py-3 font-body text-sm text-[#74776f]">Mẹo: thả ở 1/3 trên = đặt trước, vùng giữa = làm cấp con, 1/3 dưới = đặt sau. Số thứ tự 1., 1.1, 2.1… sẽ tự cập nhật theo cây.</div></section></AdminListShell>
}

const taxonomyKindLabel: Record<AdminTaxonomyKind, string> = { category: 'Danh mục', topic: 'Chủ đề', format: 'Thể thức', line: 'Dòng sách', genre: 'Thể loại', publisher: 'Nhà xuất bản', imprint: 'Imprint', language: 'Ngôn ngữ' }
const taxonomyKindFromLabel = (label: string): AdminTaxonomyKind => label === 'Chủ đề' ? 'topic' : 'category'

function AdminCategoriesPageRemote() {
  const [categories, setCategories] = useState<AdminTaxonomyRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [dropTarget, setDropTarget] = useState<{ id: string; position: 'before' | 'inside' | 'after' } | null>(null)
  const refresh = () => { setLoading(true); void loadAdminTaxonomy().then((rows) => { setCategories(rows); setError('') }).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Không tải được dữ liệu phân loại từ Supabase.')).finally(() => setLoading(false)) }
  useEffect(() => { refresh() }, [])
  const getDepth = (id: string, seen = new Set<string>()): number => { if (seen.has(id)) return 0; const item = categories.find((entry) => entry.id === id); if (!item?.parentId) return 0; seen.add(id); return getDepth(item.parentId, seen) + 1 }
  const numberFor = (id: string, seen = new Set<string>()): string => { if (seen.has(id)) return ''; seen.add(id); const item = categories.find((entry) => entry.id === id); if (!item) return ''; const siblings = categories.filter((entry) => entry.parentId === item.parentId).sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, 'vi')); const position = siblings.findIndex((entry) => entry.id === id) + 1; return item.parentId ? `${numberFor(item.parentId, seen).replace(/\.$/, '')}.${position}` : `${position}.` }
  const rootIndexFor = (id: string) => {
    let current = categories.find((entry) => entry.id === id)
    while (current?.parentId) current = categories.find((entry) => entry.id === current?.parentId)
    return current ? categories.filter((entry) => !entry.parentId).sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, 'vi')).findIndex((entry) => entry.id === current?.id) : 0
  }
  const moveCategory = async () => {
    if (!draggedId || !dropTarget || draggedId === dropTarget.id) return
    const moving = categories.find((entry) => entry.id === draggedId)
    const target = categories.find((entry) => entry.id === dropTarget.id)
    if (!moving || !target || moving.kind !== target.kind) return
    const descendants = new Set<string>()
    const collect = (parentId: string) => categories.filter((entry) => entry.parentId === parentId).forEach((entry) => { descendants.add(entry.id); collect(entry.id) })
    collect(draggedId)
    if (descendants.has(target.id)) return
    const nextParentId = dropTarget.position === 'inside' ? target.id : target.parentId
    const oldSiblings = categories.filter((entry) => entry.kind === moving.kind && entry.parentId === moving.parentId && entry.id !== moving.id).sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, 'vi'))
    const nextSiblings = categories.filter((entry) => entry.kind === moving.kind && entry.parentId === nextParentId && entry.id !== moving.id).sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, 'vi'))
    const targetIndex = nextSiblings.findIndex((entry) => entry.id === target.id)
    const insertIndex = dropTarget.position === 'inside' ? nextSiblings.length : Math.max(0, targetIndex + (dropTarget.position === 'after' ? 1 : 0))
    nextSiblings.splice(insertIndex, 0, moving)
    try {
      const updatesById = new Map<string, Promise<unknown>>()
      oldSiblings.forEach((entry, index) => updatesById.set(entry.id, updateAdminTaxonomyTerm(entry.id, { sortOrder: index })))
      nextSiblings.forEach((entry, index) => updatesById.set(entry.id, updateAdminTaxonomyTerm(entry.id, { parentId: entry.id === moving.id ? nextParentId : entry.parentId, sortOrder: index })))
      const updates = [...updatesById.values()]
      await Promise.all(updates)
      setDraggedId(null)
      setDropTarget(null)
      refresh()
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Không cập nhật được vị trí trong cây.') }
  }
  const remove = async (item: AdminTaxonomyRow) => { if (!window.confirm(`Xóa “${item.name}” khỏi Supabase?`)) return; try { await deleteAdminTaxonomyTerm(item.id); refresh() } catch (reason) { setError(reason instanceof Error ? reason.message : 'Không xóa được danh mục.') } }
  const orderedCategories = (() => {
    const childrenByParent = new Map<string | null, AdminTaxonomyRow[]>()
    categories.forEach((item) => { const siblings = childrenByParent.get(item.parentId) ?? []; siblings.push(item); childrenByParent.set(item.parentId, siblings) })
    const visit = (parentId: string | null): AdminTaxonomyRow[] => [...(childrenByParent.get(parentId) ?? [])].sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, 'vi')).flatMap((item) => [item, ...visit(item.id)])
    return visit(null)
  })()
  const targetLabel = dropTarget ? categories.find((entry) => entry.id === dropTarget.id)?.name : ''
  const dropMessage = dropTarget?.position === 'inside' ? `Thả vào giữa dòng để đưa vào “${targetLabel}”` : dropTarget?.position === 'before' ? `Thả lên trên “${targetLabel}”` : dropTarget ? `Thả xuống dưới “${targetLabel}”` : 'Kéo biểu tượng để sắp xếp hoặc phân cấp'
  return <AdminListShell title="Danh mục sách" section="SÁCH" description="Cây danh mục và chủ đề được đọc, tạo, sửa và xóa trực tiếp trong Supabase." createHref="/admin/books/categories/new" createLabel="Thêm danh mục"><section className="overflow-hidden rounded-2xl border border-[#e6e2d7] bg-white"><div className="border-b border-[#e6e2d7] p-5"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start"><div><h3 className="font-display text-lg font-semibold">Cây danh mục và chủ đề</h3><p className="mt-1 max-w-2xl font-body text-sm leading-6 text-[#74776f]">{loading ? 'Đang tải dữ liệu thật từ Supabase…' : `${categories.length} mục đang hoạt động`} · Kéo một dòng để đổi thứ tự; vùng giữa dòng là đưa vào cấp con.</p></div></div>{error && <p className="mt-4 rounded-xl border border-[#ebc4bd] bg-[#fff5f2] p-4 font-body text-sm text-[#a33d32]" role="alert">{error}</p>}{draggedId && <p className="mt-4 rounded-lg border border-[var(--color-olive)] bg-[rgba(155,148,47,.08)] px-3 py-2 font-body text-sm font-medium text-[var(--color-olive-dark)]" role="status"><i className="bi bi-arrows-move mr-2" aria-hidden="true" />{dropMessage}</p>}</div><div className="divide-y divide-[#e6e2d7]">{orderedCategories.map((item) => { const depth = getDepth(item.id); const targetPosition = dropTarget?.id === item.id ? dropTarget.position : null; const depthClass = depth === 1 ? 'pl-6' : depth === 2 ? 'pl-12' : depth > 2 ? 'pl-16' : ''; const groupClass = rootIndexFor(item.id) % 2 === 0 ? 'bg-[#fcfbf7]' : 'bg-[#f3f3e8]'; return <div className={`relative flex items-center gap-3 px-4 py-3 transition sm:px-5 ${groupClass} ${draggedId === item.id ? 'opacity-45' : ''} ${targetPosition === 'inside' ? 'ring-2 ring-inset ring-[var(--color-olive)]' : ''} ${targetPosition === 'before' ? 'border-t-2 border-t-[var(--color-olive)]' : ''} ${targetPosition === 'after' ? 'border-b-2 border-b-[var(--color-olive)]' : ''}`} data-category-id={item.id} key={item.id} draggable onDragStart={(event) => { setDraggedId(item.id); event.dataTransfer.effectAllowed = 'move'; event.dataTransfer.setData('text/plain', item.id) }} onDragEnd={() => { setDraggedId(null); setDropTarget(null) }} onDragOver={(event) => { event.preventDefault(); if (draggedId === item.id) return; const rect = event.currentTarget.getBoundingClientRect(); const ratio = (event.clientY - rect.top) / rect.height; setDropTarget({ id: item.id, position: ratio < .3 ? 'before' : ratio > .7 ? 'after' : 'inside' }); event.dataTransfer.dropEffect = 'move' }} onDrop={(event) => { event.preventDefault(); void moveCategory() }}><button className="inline-flex h-9 w-9 flex-none cursor-grab items-center justify-center rounded-lg border border-transparent text-[#74776f] hover:border-[var(--color-olive)] hover:bg-white active:cursor-grabbing" type="button" aria-label={`Kéo ${item.name}`}><i className="bi bi-grip-vertical" aria-hidden="true" /></button><span className="w-12 flex-none font-body text-sm font-semibold text-[var(--color-olive-dark)]">{numberFor(item.id)}</span><div className={`min-w-0 flex-1 font-body text-sm ${depthClass}`}><div className="flex flex-wrap items-center gap-2"><span className="inline-flex w-5 shrink-0 items-center justify-center">{depth > 0 && <i className="bi bi-arrow-return-right text-[var(--color-olive-dark)]" aria-hidden="true" />}</span><span className="font-medium">{item.name}</span><span className="rounded-full border border-[#d9d6c8] bg-white/70 px-2 py-0.5 font-body text-[11px] text-[#74776f]">{taxonomyKindLabel[item.kind]}</span></div><p className="mt-0.5 text-xs text-[#74776f]">{item.parentId ? `Con của ${categories.find((parent) => parent.id === item.parentId)?.name ?? 'mục khác'}` : 'Cấp cao nhất'}</p></div><span className={`hidden rounded-full px-2.5 py-1 font-body text-xs sm:inline-flex ${targetPosition ? 'bg-white font-semibold text-[var(--color-olive-dark)]' : 'bg-white/60 text-[#74776f]'}`}>{targetPosition === 'inside' ? 'Vào cấp con' : targetPosition === 'before' ? 'Đặt lên trên' : targetPosition === 'after' ? 'Đặt xuống dưới' : 'Kéo để sắp xếp'}</span><a className="font-body text-sm text-[var(--color-olive-dark)]" href={`/admin/books/categories/${item.id}`}>Xem / sửa</a><button className="inline-flex h-8 w-8 flex-none items-center justify-center rounded-full text-[#a33d32] hover:bg-[#fff0ed]" type="button" aria-label={`Xóa ${item.name}`} onClick={() => void remove(item)}><i className="bi bi-trash3" aria-hidden="true" /></button></div> })}</div>{!loading && !categories.length && <div className="p-10 text-center font-body text-sm text-[#74776f]">Chưa có danh mục thật trong Supabase.</div>}<div className="border-t border-[#e6e2d7] bg-[#fcfbf7] px-5 py-3 font-body text-sm text-[#74776f]">Mẹo: thả ở 1/3 trên = đặt trước, vùng giữa = làm cấp con, 1/3 dưới = đặt sau.</div></section></AdminListShell>
}

function AdminCategoryCreatePageRemote() {
  const [name, setName] = useState('')
  const [kind, setKind] = useState<AdminTaxonomyKind>('category')
  const [parentId, setParentId] = useState('')
  const [parents, setParents] = useState<AdminTaxonomyRow[]>([])
  const [message, setMessage] = useState('')
  useEffect(() => { void loadAdminTaxonomy().then(setParents).catch((reason: unknown) => setMessage(reason instanceof Error ? reason.message : 'Không tải được dữ liệu phân loại cha.')) }, [])
  const slugify = (value: string) => value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  const submit = async (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); const cleanName = name.trim(); const slug = slugify(cleanName); if (!cleanName || !slug) { setMessage('Vui lòng nhập tên hợp lệ để tạo dữ liệu phân loại.'); return } try { await createAdminTaxonomyTerm({ name: cleanName, slug, kind, parentId: ['category', 'topic'].includes(kind) ? (parentId || null) : null, sortOrder: parents.filter((item) => item.kind === kind).length }); window.location.href = '/admin/books/categories' } catch (reason) { setMessage(reason instanceof Error ? reason.message : 'Không tạo được dữ liệu phân loại.') } }
  return <AdminSimpleCreateShell title="Thêm dữ liệu phân loại sách" backHref="/admin/books/categories" section="SÁCH" description="Tạo dữ liệu phân loại thật trong Supabase để form thêm sách có thể tìm và liên kết đúng loại."><form className="grid gap-4 rounded-2xl border border-[#e6e2d7] bg-white p-5" onSubmit={submit}><label className="block"><span className="mb-1.5 block font-body text-sm font-medium">Loại dữ liệu</span><select className="min-h-11 w-full rounded-xl border border-[#dedbd0] bg-[#fcfbf7] px-3.5 font-body text-sm" value={kind} onChange={(event) => { setKind(event.target.value as AdminTaxonomyKind); setParentId('') }}><option value="category">Danh mục</option><option value="genre">Thể loại</option><option value="topic">Chủ đề</option><option value="format">Thể thức</option><option value="line">Dòng sách</option><option value="publisher">Nhà xuất bản</option><option value="imprint">Imprint</option><option value="language">Ngôn ngữ</option></select></label><label className="block"><span className="mb-1.5 block font-body text-sm font-medium">Danh mục cha</span><select className="min-h-11 w-full rounded-xl border border-[#dedbd0] bg-[#fcfbf7] px-3.5 font-body text-sm" value={parentId} onChange={(event) => setParentId(event.target.value)} disabled={!['category', 'topic'].includes(kind)}><option value="">Không có</option>{parents.filter((item) => item.kind === kind).map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label><label className="block"><span className="mb-1.5 block font-body text-sm font-medium">Tên</span><input className="min-h-11 w-full rounded-xl border border-[#dedbd0] bg-[#fcfbf7] px-3.5 font-body text-sm" required value={name} onChange={(event) => setName(event.target.value)} /></label>{message && <p className="rounded-xl border border-[#ebc4bd] bg-[#fff5f2] p-3 font-body text-sm text-[#a33d32]" role="alert">{message}</p>}<div className="flex justify-end gap-3"><a className="inline-flex min-h-11 items-center rounded-xl border border-[#dedbd0] px-5 font-body text-sm" href="/admin/books/categories">Hủy</a><button className="admin-primary-action inline-flex min-h-11 items-center rounded-xl bg-[var(--color-olive)] px-5 font-body text-sm font-medium text-white" type="submit">Lưu dữ liệu</button></div></form></AdminSimpleCreateShell>
}

function AdminTaxonomyEditPageRemote({ id }: { id: string }) {
  const [item, setItem] = useState<AdminTaxonomyRow | null>(null)
  const [parents, setParents] = useState<AdminTaxonomyRow[]>([])
  const [name, setName] = useState('')
  const [parentId, setParentId] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  useEffect(() => {
    void loadAdminTaxonomy().then((rows) => {
      const found = rows.find((row) => row.id === id) ?? null
      setItem(found)
      setParents(rows)
      if (found) { setName(found.name); setParentId(found.parentId ?? ''); setIsActive(found.isActive) }
      else setMessage('Không tìm thấy mục này trong Supabase.')
    }).catch((reason: unknown) => setMessage(reason instanceof Error ? reason.message : 'Không tải được dữ liệu danh mục.')).finally(() => setLoading(false))
  }, [id])
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!item) return
    setSaving(true)
    setMessage('')
      const slug = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    try {
      await updateAdminTaxonomyTerm(item.id, { name: name.trim(), slug, parentId: parentId || null, isActive })
      window.location.href = '/admin/books/categories'
    } catch (reason) { setMessage(reason instanceof Error ? reason.message : 'Không lưu được danh mục.') } finally { setSaving(false) }
  }
  const isDescendant = (candidateId: string) => {
    let current = parents.find((parent) => parent.id === candidateId)
    while (current?.parentId) {
      if (current.parentId === id) return true
      current = parents.find((parent) => parent.id === current?.parentId)
    }
    return false
  }
  const possibleParents = parents.filter((parent) => parent.kind === item?.kind && parent.id !== id && !isDescendant(parent.id))
  return <AdminSimpleCreateShell title={loading ? 'Đang tải danh mục' : `Sửa ${taxonomyKindLabel[item?.kind ?? 'category'].toLowerCase()}`} backHref="/admin/books/categories" section="SÁCH" description="Chỉnh sửa đúng bản ghi danh mục hoặc chủ đề trong Supabase."><form className="grid gap-4 rounded-2xl border border-[#e6e2d7] bg-white p-5" onSubmit={submit}><label className="block"><span className="mb-1.5 block font-body text-sm font-medium">Loại dữ liệu</span><input className="min-h-11 w-full rounded-xl border border-[#dedbd0] bg-[#f4f3ed] px-3.5 font-body text-sm" value={item ? taxonomyKindLabel[item.kind] : ''} readOnly /></label><label className="block"><span className="mb-1.5 block font-body text-sm font-medium">Mục cha</span><select className="min-h-11 w-full rounded-xl border border-[#dedbd0] bg-[#fcfbf7] px-3.5 font-body text-sm" value={parentId} onChange={(event) => setParentId(event.target.value)} disabled={!item}><option value="">Không có, cấp cao nhất</option>{possibleParents.map((parent) => <option value={parent.id} key={parent.id}>{parent.name}</option>)}</select></label><label className="block"><span className="mb-1.5 block font-body text-sm font-medium">Tên</span><input className="min-h-11 w-full rounded-xl border border-[#dedbd0] bg-[#fcfbf7] px-3.5 font-body text-sm" required value={name} onChange={(event) => setName(event.target.value)} disabled={!item} /></label><label className="flex items-center gap-2 font-body text-sm"><input className="h-4 w-4 accent-[var(--color-olive)]" type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} disabled={!item} />Đang hoạt động</label>{message && <p className="rounded-xl border border-[#ebc4bd] bg-[#fff5f2] p-3 font-body text-sm text-[#a33d32]" role="alert">{message}</p>}<div className="flex justify-end gap-3"><a className="inline-flex min-h-11 items-center rounded-xl border border-[#dedbd0] px-5 font-body text-sm" href="/admin/books/categories">Hủy</a><button className="admin-primary-action inline-flex min-h-11 items-center rounded-xl bg-[var(--color-olive)] px-5 font-body text-sm font-medium text-white disabled:cursor-wait disabled:opacity-60" type="submit" disabled={!item || saving}>{saving ? 'Đang lưu…' : 'Lưu thay đổi'}</button></div></form></AdminSimpleCreateShell>
}

function AdminTaxonomyEntityPage({ kind, title, description }: { kind: AdminTaxonomyKind; title: string; description: string }) {
  const [rows, setRows] = useState<AdminTaxonomyRow[]>([])
  const [name, setName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [error, setError] = useState('')
  const refresh = () => { void loadAdminTaxonomy([kind]).then(setRows).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Không tải được dữ liệu từ Supabase.')) }
  useEffect(() => { refresh() }, [kind])
  const slugify = (value: string) => value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  const add = async (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); try { await createAdminTaxonomyTerm({ name, slug: slugify(name), kind, sortOrder: rows.length }); setName(''); refresh() } catch (reason) { setError(reason instanceof Error ? reason.message : 'Không tạo được dữ liệu.') } }
  const save = async (row: AdminTaxonomyRow) => { try { await updateAdminTaxonomyTerm(row.id, { name: editingName, slug: slugify(editingName) }); setEditingId(null); refresh() } catch (reason) { setError(reason instanceof Error ? reason.message : 'Không lưu được dữ liệu.') } }
  const remove = async (row: AdminTaxonomyRow) => { if (!window.confirm(`Xóa “${row.name}” khỏi Supabase?`)) return; try { await deleteAdminTaxonomyTerm(row.id); refresh() } catch (reason) { setError(reason instanceof Error ? reason.message : 'Không xóa được dữ liệu.') } }
  return <AdminListShell title={title} section="NỘI DUNG" description={description} createHref="/admin/publishers" createLabel="Thêm mới"><section className="overflow-hidden rounded-2xl border border-[#e6e2d7] bg-white"><div className="border-b border-[#e6e2d7] p-5"><h3 className="font-display text-lg font-semibold">Danh sách {title.toLowerCase()}</h3><p className="mt-1 font-body text-sm text-[#74776f]">{rows.length} bản ghi thật từ Supabase.</p></div><form className="flex flex-col gap-3 border-b border-[#eeeae0] p-5 sm:flex-row" onSubmit={add}><input className="min-h-11 min-w-0 flex-1 rounded-xl border border-[#dedbd0] bg-[#fcfbf7] px-3.5 font-body text-sm" required value={name} onChange={(event) => setName(event.target.value)} placeholder={`Nhập ${title.toLowerCase()}`} /><button className="admin-primary-action inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--color-olive)] px-5 font-body text-sm font-medium text-white" type="submit"><i className="bi bi-plus-lg mr-2" aria-hidden="true" />Thêm mới</button></form>{error && <p className="m-5 rounded-xl border border-[#ebc4bd] bg-[#fff5f2] p-4 font-body text-sm text-[#a33d32]" role="alert">{error}</p>}<div className="overflow-x-auto"><table className="min-w-[680px] w-full text-left"><thead className="bg-[#fcfbf7]"><tr><th className="px-4 py-3 font-body text-sm font-semibold">Tên</th><th className="px-4 py-3 font-body text-sm font-semibold">Đường dẫn</th><th className="px-4 py-3 font-body text-sm font-semibold">Trạng thái</th><th className="px-4 py-3 text-right font-body text-sm font-semibold">Thao tác</th></tr></thead><tbody>{rows.map((row) => <tr className="border-t border-[#eeeae0]" key={row.id}><td className="px-4 py-3 font-body text-sm">{editingId === row.id ? <input className="min-h-9 rounded-lg border border-[var(--color-olive)] px-2.5 font-body text-sm" value={editingName} onChange={(event) => setEditingName(event.target.value)} /> : row.name}</td><td className="px-4 py-3 font-body text-sm text-[#74776f]">{row.slug}</td><td className="px-4 py-3 font-body text-sm">{row.isActive ? 'Đang hoạt động' : 'Tạm ẩn'}</td><td className="px-4 py-3 text-right"><button className="mr-2 font-body text-sm text-[var(--color-olive-dark)]" type="button" onClick={() => editingId === row.id ? void save(row) : (setEditingId(row.id), setEditingName(row.name))}>{editingId === row.id ? 'Lưu' : 'Sửa'}</button><button className="font-body text-sm text-[#a33d32]" type="button" onClick={() => void remove(row)}>Xóa</button></td></tr>)}</tbody></table></div>{!rows.length && <div className="p-10 text-center font-body text-sm text-[#74776f]">Chưa có dữ liệu thật.</div>}</section></AdminListShell>
}

function AdminHomepageModulesPage() {
  const [rows, setRows] = useState<AdminHomepageModuleRow[]>([])
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const refresh = () => { void (async () => { try { await ensureAdminHomepageModuleBooks(); setError('') } catch (reason) { setError(reason instanceof Error ? reason.message : 'Không tự động bổ sung được sách cho mô đun.') } try { setRows(await loadAdminHomepageModules()) } catch (reason) { setError(reason instanceof Error ? reason.message : 'Không tải được mô đun từ Supabase.') } })() }
  useEffect(() => { refresh() }, [])
  const slugify = (value: string) => value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  const add = async (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); try { await createAdminHomepageModule({ name, slug: slugify(name), sortOrder: rows.length }); setName(''); refresh() } catch (reason) { setError(reason instanceof Error ? reason.message : 'Không tạo được mô đun.') } }
  const toggle = async (row: AdminHomepageModuleRow) => { try { await updateAdminHomepageModule(row.id, { isActive: !row.isActive }); refresh() } catch (reason) { setError(reason instanceof Error ? reason.message : 'Không cập nhật được mô đun.') } }
  const remove = async (row: AdminHomepageModuleRow) => { if (!window.confirm(`Xóa mô đun “${row.name}” khỏi Supabase?`)) return; try { await deleteAdminHomepageModule(row.id); refresh() } catch (reason) { setError(reason instanceof Error ? reason.message : 'Không xóa được mô đun.') } }
  return <AdminListShell title="Mô đun sách trang chủ" section="NỘI DUNG" description="Quản lý các nhóm sách hiển thị trên trang chủ bằng dữ liệu thật trong homepage_modules của Supabase." createHref="/admin/collections" createLabel="Thêm mô đun"><section className="overflow-hidden rounded-2xl border border-[#e6e2d7] bg-white"><div className="border-b border-[#e6e2d7] p-5"><h3 className="font-display text-lg font-semibold">Danh sách mô đun</h3><p className="mt-1 font-body text-sm text-[#74776f]">{rows.length} mô đun · số sách lấy từ quan hệ book_homepage_modules.</p></div><form className="flex flex-col gap-3 border-b border-[#eeeae0] p-5 sm:flex-row" onSubmit={add}><input className="min-h-11 min-w-0 flex-1 rounded-xl border border-[#dedbd0] bg-[#fcfbf7] px-3.5 font-body text-sm" required value={name} onChange={(event) => setName(event.target.value)} placeholder="Nhập tên mô đun" /><button className="admin-primary-action inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--color-olive)] px-5 font-body text-sm font-medium text-white" type="submit"><i className="bi bi-plus-lg mr-2" aria-hidden="true" />Thêm mô đun</button></form>{error && <p className="m-5 rounded-xl border border-[#ebc4bd] bg-[#fff5f2] p-4 font-body text-sm text-[#a33d32]" role="alert">{error}</p>}<div className="overflow-x-auto"><table className="min-w-[760px] w-full text-left"><thead className="bg-[#fcfbf7]"><tr><th className="px-4 py-3 font-body text-sm font-semibold">Mô đun</th><th className="px-4 py-3 font-body text-sm font-semibold">Đường dẫn</th><th className="px-4 py-3 font-body text-sm font-semibold">Số sách</th><th className="px-4 py-3 font-body text-sm font-semibold">Thứ tự</th><th className="px-4 py-3 font-body text-sm font-semibold">Trạng thái</th><th className="px-4 py-3 text-right font-body text-sm font-semibold">Thao tác</th></tr></thead><tbody>{rows.map((row) => <tr className="border-t border-[#eeeae0]" key={row.id}><td className="px-4 py-3 font-body text-sm font-medium">{row.name}</td><td className="px-4 py-3 font-body text-sm text-[#74776f]">{row.slug}</td><td className="px-4 py-3 font-body text-sm">{row.bookCount}</td><td className="px-4 py-3 font-body text-sm">{row.sortOrder}</td><td className="px-4 py-3 font-body text-sm">{row.isActive ? 'Đang hoạt động' : 'Tạm ẩn'}</td><td className="px-4 py-3 text-right"><button className="mr-3 font-body text-sm text-[var(--color-olive-dark)]" type="button" onClick={() => void toggle(row)}>{row.isActive ? 'Tạm ẩn' : 'Hiện lại'}</button><button className="font-body text-sm text-[#a33d32]" type="button" onClick={() => void remove(row)}>Xóa</button></td></tr>)}</tbody></table></div>{!rows.length && <div className="p-10 text-center font-body text-sm text-[#74776f]">Chưa có mô đun thật.</div>}</section></AdminListShell>
}

function AdminPaymentMethodsPage() {
  const [rows, setRows] = useState<AdminPaymentMethodRow[]>([])
  const [formOpen, setFormOpen] = useState(false)
  const [draft, setDraft] = useState({ code: '', name: '', provider: '', description: '', sortOrder: '0' })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [error, setError] = useState('')
  const refresh = () => { void loadAdminPaymentMethods().then((nextRows) => { setRows(nextRows); setError('') }).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Không tải được phương thức thanh toán từ Supabase.')) }
  useEffect(() => { refresh() }, [])
  const add = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      await createAdminPaymentMethod({ code: draft.code, name: draft.name, provider: draft.provider, description: draft.description, sortOrder: Number(draft.sortOrder) || 0 })
      setDraft({ code: '', name: '', provider: '', description: '', sortOrder: '0' })
      setFormOpen(false)
      refresh()
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Không tạo được phương thức thanh toán.') }
  }
  const toggle = async (row: AdminPaymentMethodRow) => { try { await updateAdminPaymentMethod(row.id, { isActive: !row.isActive }); refresh() } catch (reason) { setError(reason instanceof Error ? reason.message : 'Không cập nhật được trạng thái.') } }
  const saveName = async (row: AdminPaymentMethodRow) => { try { await updateAdminPaymentMethod(row.id, { name: editingName }); setEditingId(null); refresh() } catch (reason) { setError(reason instanceof Error ? reason.message : 'Không lưu được phương thức thanh toán.') } }
  const remove = async (row: AdminPaymentMethodRow) => { if (!window.confirm(`Xóa “${row.name}” khỏi Supabase?`)) return; try { await deleteAdminPaymentMethod(row.id); refresh() } catch (reason) { setError(reason instanceof Error ? reason.message : 'Không xóa được phương thức thanh toán.') } }
  return <AdminListShell title="Thanh toán và tài khoản nhận tiền" section="HỆ THỐNG" description="Quản lý các phương thức thanh toán thật trong Supabase; thông tin bí mật của cổng thanh toán không lưu ở giao diện này." createHref="/admin/payments" createLabel="Thêm phương thức"><section className="overflow-hidden rounded-2xl border border-[#e6e2d7] bg-white"><div className="flex flex-col gap-3 border-b border-[#e6e2d7] p-5 sm:flex-row sm:items-center sm:justify-between"><div><h3 className="font-display text-lg font-semibold">Danh sách phương thức</h3><p className="mt-1 font-body text-sm text-[#74776f]">{rows.length} bản ghi thật từ Supabase.</p></div><button className="admin-primary-action inline-flex min-h-10 items-center justify-center rounded-xl bg-[var(--color-olive)] px-4 font-body text-sm font-medium text-white" type="button" onClick={() => setFormOpen((value) => !value)}><i className="bi bi-plus-lg mr-2" aria-hidden="true" />{formOpen ? 'Đóng form' : 'Thêm phương thức'}</button></div>{formOpen && <form className="grid gap-3 border-b border-[#eeeae0] bg-[#fcfbf7] p-5 sm:grid-cols-2" onSubmit={add}><label className="block"><span className="mb-1.5 block font-body text-sm font-medium">Mã phương thức *</span><input className="min-h-11 w-full rounded-xl border border-[#dedbd0] bg-white px-3.5 font-body text-sm" required value={draft.code} onChange={(event) => setDraft((current) => ({ ...current, code: event.target.value }))} placeholder="bank-transfer" /></label><label className="block"><span className="mb-1.5 block font-body text-sm font-medium">Tên hiển thị *</span><input className="min-h-11 w-full rounded-xl border border-[#dedbd0] bg-white px-3.5 font-body text-sm" required value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} placeholder="Chuyển khoản ngân hàng" /></label><label className="block"><span className="mb-1.5 block font-body text-sm font-medium">Nhà cung cấp</span><input className="min-h-11 w-full rounded-xl border border-[#dedbd0] bg-white px-3.5 font-body text-sm" value={draft.provider} onChange={(event) => setDraft((current) => ({ ...current, provider: event.target.value }))} placeholder="bank" /></label><label className="block"><span className="mb-1.5 block font-body text-sm font-medium">Thứ tự</span><input className="min-h-11 w-full rounded-xl border border-[#dedbd0] bg-white px-3.5 font-body text-sm" type="number" value={draft.sortOrder} onChange={(event) => setDraft((current) => ({ ...current, sortOrder: event.target.value }))} /></label><label className="block sm:col-span-2"><span className="mb-1.5 block font-body text-sm font-medium">Mô tả</span><textarea className="min-h-20 w-full rounded-xl border border-[#dedbd0] bg-white px-3.5 py-3 font-body text-sm" value={draft.description} onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))} /></label><div className="sm:col-span-2"><button className="admin-primary-action inline-flex min-h-10 items-center justify-center rounded-xl bg-[var(--color-olive)] px-4 font-body text-sm font-medium text-white" type="submit">Lưu vào Supabase</button></div></form>}{error && <p className="m-5 rounded-xl border border-[#ebc4bd] bg-[#fff5f2] p-4 font-body text-sm text-[#a33d32]" role="alert">{error}</p>}<div className="overflow-x-auto"><table className="min-w-[820px] w-full text-left"><thead className="bg-[#fcfbf7]"><tr><th className="px-4 py-3 font-body text-sm font-semibold">Phương thức</th><th className="px-4 py-3 font-body text-sm font-semibold">Mã</th><th className="px-4 py-3 font-body text-sm font-semibold">Nhà cung cấp</th><th className="px-4 py-3 font-body text-sm font-semibold">Thứ tự</th><th className="px-4 py-3 font-body text-sm font-semibold">Trạng thái</th><th className="px-4 py-3 text-right font-body text-sm font-semibold">Thao tác</th></tr></thead><tbody>{rows.map((row) => <tr className="border-t border-[#eeeae0]" key={row.id}><td className="px-4 py-3 font-body text-sm">{editingId === row.id ? <input className="min-h-9 rounded-lg border border-[var(--color-olive)] px-2.5 font-body text-sm" value={editingName} onChange={(event) => setEditingName(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') void saveName(row) }} /> : <><span className="font-medium">{row.name}</span>{row.description && <p className="mt-1 text-xs text-[#74776f]">{row.description}</p>}</>}</td><td className="px-4 py-3 font-body text-sm text-[#74776f]">{row.code}</td><td className="px-4 py-3 font-body text-sm">{row.provider || '—'}</td><td className="px-4 py-3 font-body text-sm">{row.sortOrder}</td><td className="px-4 py-3 font-body text-sm">{row.isActive ? 'Đang hoạt động' : 'Đang tắt'}</td><td className="px-4 py-3 text-right"><button className="mr-3 font-body text-sm text-[var(--color-olive-dark)]" type="button" onClick={() => void toggle(row)}>{row.isActive ? 'Tắt' : 'Bật'}</button><button className="mr-3 font-body text-sm text-[var(--color-olive-dark)]" type="button" onClick={() => editingId === row.id ? void saveName(row) : (setEditingId(row.id), setEditingName(row.name))}>{editingId === row.id ? 'Lưu' : 'Sửa tên'}</button><button className="font-body text-sm text-[#a33d32]" type="button" onClick={() => void remove(row)}>Xóa</button></td></tr>)}</tbody></table></div>{!rows.length && <div className="p-10 text-center font-body text-sm text-[#74776f]">Chưa có phương thức thật trong Supabase.</div>}</section></AdminListShell>
}

function AdminAdminUsersPage() {
  const [rows, setRows] = useState<AdminUserRow[]>([])
  const [roles, setRoles] = useState<AdminRoleRow[]>([])
  const [matrix, setMatrix] = useState<AdminPermissionRow[]>([])
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<AdminRoleKey>('editor')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const refresh = () => { void Promise.all([loadAdminUsers(), loadAdminRoles(), loadAdminPermissionMatrix()]).then(([nextRows, nextRoles, nextMatrix]) => { setRows(nextRows); setRoles(nextRoles); setMatrix(nextMatrix); setError('') }).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Không tải được dữ liệu phân quyền.')) }
  useEffect(() => { refresh() }, [])
  const add = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    try { await grantAdminUser(email, role); setEmail(''); setRole('editor'); refresh() } catch (reason) { setError(reason instanceof Error ? reason.message : 'Không cấp được quyền quản trị.') } finally { setBusy(false) }
  }
  const changeRole = async (row: AdminUserRow, nextRole: AdminRoleKey) => { setBusy(true); setError(''); try { await setAdminUserRole(row.userId, nextRole); refresh() } catch (reason) { setError(reason instanceof Error ? reason.message : 'Không đổi được vai trò.') } finally { setBusy(false) } }
  const remove = async (row: AdminUserRow) => {
    if (!window.confirm(`Gỡ quyền quản trị của ${row.email}?`)) return
    try { await revokeAdminUser(row.userId); refresh() } catch (reason) { setError(reason instanceof Error ? reason.message : 'Không gỡ được quyền quản trị.') }
  }
  const roleName = (roleKey: AdminRoleKey) => roles.find((item) => item.roleKey === roleKey)?.name ?? roleKey
  const permissionsFor = (roleKey: AdminRoleKey) => matrix.filter((item) => item.roleKey === roleKey)
  return <AdminListShell title="Quản trị viên & phân quyền" section="HỆ THỐNG" description="Tạo tài khoản quản trị bằng cách gán một user Supabase vào vai trò mặc định. Ma trận nghiệp vụ bên dưới là nguồn quyền dùng chung cho frontend và backend." createHref="/admin/settings" createLabel="Về cài đặt">
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="overflow-hidden rounded-2xl border border-[#e6e2d7] bg-white">
        <div className="border-b border-[#e6e2d7] p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-display text-lg font-semibold">Danh sách quản trị viên</h3><p className="mt-1 font-body text-sm leading-6 text-[#74776f]">Tài khoản phải được đăng ký trước trong Supabase Auth; mật khẩu không lưu ở bảng public.</p></div><span className="inline-flex min-h-8 items-center rounded-full bg-[#edf7ef] px-3 font-body text-xs font-semibold text-[#39733e]">{rows.length} tài khoản</span></div></div>
        <form className="grid gap-3 border-b border-[#eeeae0] bg-[#fcfbf7] p-5 sm:grid-cols-[minmax(0,1fr)_230px_auto] sm:items-end" onSubmit={add}><label className="block"><span className="mb-1.5 block font-body text-sm font-medium">Email user Supabase *</span><input className="min-h-11 w-full rounded-xl border border-[#dedbd0] bg-white px-3.5 font-body text-sm" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="user@example.com" /></label><label className="block"><span className="mb-1.5 block font-body text-sm font-medium">Vai trò mặc định</span><select className="min-h-11 w-full rounded-xl border border-[#dedbd0] bg-white px-3.5 font-body text-sm" value={role} onChange={(event) => setRole(event.target.value as AdminRoleKey)}>{roles.map((item) => <option value={item.roleKey} key={item.roleKey}>{item.name}</option>)}</select></label><button className="admin-primary-action inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--color-olive)] px-5 font-body text-sm font-medium text-white disabled:cursor-wait disabled:opacity-60" type="submit" disabled={busy}>{busy ? 'Đang lưu…' : 'Gán quyền'}</button></form>
        {error && <p className="m-5 rounded-xl border border-[#ebc4bd] bg-[#fff5f2] p-4 font-body text-sm text-[#a33d32]" role="alert">{error}</p>}
        {rows.length ? <div className="overflow-x-auto"><table className="min-w-[720px] w-full text-left"><thead className="bg-[#fcfbf7]"><tr><th className="px-5 py-3 font-body text-sm font-semibold">Email</th><th className="px-5 py-3 font-body text-sm font-semibold">Vai trò</th><th className="px-5 py-3 font-body text-sm font-semibold">Ngày cấp</th><th className="px-5 py-3 text-right font-body text-sm font-semibold">Thao tác</th></tr></thead><tbody>{rows.map((row) => <tr className="border-t border-[#eeeae0]" key={row.userId}><td className="px-5 py-3 font-body text-sm font-medium">{row.email}</td><td className="px-5 py-3"><select className="min-h-9 rounded-lg border border-[#dedbd0] bg-white px-2.5 font-body text-sm" value={row.role} disabled={busy} onChange={(event) => void changeRole(row, event.target.value as AdminRoleKey)}>{roles.map((item) => <option value={item.roleKey} key={item.roleKey}>{item.name}</option>)}</select></td><td className="px-5 py-3 font-body text-sm text-[#74776f]">{row.createdAt ? new Date(row.createdAt).toLocaleString('vi-VN') : '—'}</td><td className="px-5 py-3 text-right"><button className="font-body text-sm text-[#a33d32]" type="button" onClick={() => void remove(row)}>Gỡ quyền</button></td></tr>)}</tbody></table></div> : <div className="p-10 text-center font-body text-sm text-[#74776f]">Chưa có tài khoản quản trị.</div>}
      </section>
      <aside className="rounded-2xl border border-[#e6e2d7] bg-white p-5"><div className="border-b border-[#eeeae0] pb-4"><p className="font-body text-xs font-semibold uppercase tracking-[.14em] text-[var(--color-olive)]">Mặc định hệ thống</p><h3 className="mt-1 font-display text-xl font-semibold">4 vai trò chuẩn</h3><p className="mt-2 font-body text-sm leading-6 text-[#74776f]">Chỉ cần chọn vai trò khi gán user; quyền chi tiết đã được setup sẵn.</p></div><div className="mt-4 space-y-3">{roles.map((item) => <article className="rounded-xl border border-[#eeeae0] bg-[#fcfbf7] p-3" key={item.roleKey}><div className="flex items-start justify-between gap-3"><strong className="font-body text-sm">{item.name}</strong><span className="rounded-full bg-[rgba(155,148,47,.12)] px-2 py-1 font-body text-xs font-semibold text-[var(--color-olive-dark)]">{permissionsFor(item.roleKey).length} quyền</span></div><p className="mt-1 font-body text-xs leading-5 text-[#74776f]">{item.description}</p></article>)}</div></aside>
    </div>
    <section className="mt-5 overflow-hidden rounded-2xl border border-[#e6e2d7] bg-white"><div className="border-b border-[#e6e2d7] p-5"><h3 className="font-display text-lg font-semibold">Ma trận nghiệp vụ</h3><p className="mt-1 font-body text-sm leading-6 text-[#74776f]">Dấu ✓ là quyền đã được cấp cho vai trò. Backend kiểm tra cùng mã quyền trước khi cho truy cập khu vực quản trị.</p></div><div className="overflow-x-auto"><table className="min-w-[980px] w-full text-left"><thead className="bg-[#fcfbf7]"><tr><th className="w-[30%] px-5 py-3 font-body text-sm font-semibold">Nghiệp vụ</th>{roles.map((item) => <th className="px-3 py-3 text-center font-body text-sm font-semibold" key={item.roleKey}>{item.name}</th>)}</tr></thead><tbody>{Array.from(new Map(matrix.map((item) => [item.permissionKey, item])).values()).sort((a, b) => a.sortOrder - b.sortOrder).map((permission) => <tr className="border-t border-[#eeeae0]" key={permission.permissionKey}><td className="px-5 py-3"><strong className="block font-body text-sm">{permission.permissionName}</strong><span className="font-body text-xs text-[#8b8d86]">{permission.description}</span></td>{roles.map((item) => <td className="px-3 py-3 text-center" key={item.roleKey}>{permissionsFor(item.roleKey).some((row) => row.permissionKey === permission.permissionKey) ? <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#edf7ef] font-semibold text-[#39733e]" aria-label={`${roleName(item.roleKey)} có quyền ${permission.permissionName}`}>✓</span> : <span className="text-[#c6c4bb]" aria-label={`${roleName(item.roleKey)} chưa có quyền ${permission.permissionName}`}>—</span>}</td>)}</tr>)}</tbody></table></div></section>
  </AdminListShell>
}

function AdminAdminUsersPageSeparated() {
  const [rows, setRows] = useState<AdminUserRow[]>([])
  const [roles, setRoles] = useState<AdminRoleRow[]>([])
  const [form, setForm] = useState({ email: '', password: '', role: 'editor' as AdminRoleKey })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const refresh = () => { void Promise.all([loadAdminUsers(), loadAdminRoles()]).then(([nextRows, nextRoles]) => { setRows(nextRows); setRoles(nextRoles); setError('') }).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Không tải được tài khoản quản trị.')) }
  useEffect(() => { refresh() }, [])
  const add = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setBusy(true); setError('')
    try { await createAdminUser(form.email, form.password, form.role); setForm({ email: '', password: '', role: 'editor' }); refresh() } catch (reason) { setError(reason instanceof Error ? reason.message : 'Không tạo được tài khoản quản trị.') } finally { setBusy(false) }
  }
  const changeRole = async (row: AdminUserRow, nextRole: AdminRoleKey) => { setBusy(true); setError(''); try { await setAdminUserRole(row.userId, nextRole); refresh() } catch (reason) { setError(reason instanceof Error ? reason.message : 'Không đổi được vai trò.') } finally { setBusy(false) } }
  const remove = async (row: AdminUserRow) => { if (!window.confirm(`Gỡ quyền quản trị của ${row.email}?`)) return; try { await revokeAdminUser(row.userId); refresh() } catch (reason) { setError(reason instanceof Error ? reason.message : 'Không gỡ được quyền quản trị.') } }
  return <AdminListShell title="Quản trị viên" section="HỆ THỐNG" description="Tạo tài khoản quản trị mới, gán vai trò và quản lý trạng thái truy cập. Màn này chỉ dành cho user quản trị, không phải khách hàng." createHref="/admin/settings" createLabel="Về cài đặt">
    <section className="overflow-hidden rounded-2xl border border-[#e6e2d7] bg-white">
      <div className="border-b border-[#e6e2d7] p-5"><h3 className="font-display text-lg font-semibold">Tạo tài khoản quản trị</h3><p className="mt-1 font-body text-sm leading-6 text-[#74776f]">Mật khẩu được gửi trực tiếp tới Supabase Auth (xác thực tài khoản), không lưu ở bảng dữ liệu công khai.</p></div>
      <form className="grid gap-3 border-b border-[#eeeae0] bg-[#fcfbf7] p-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_230px_auto] sm:items-end" onSubmit={add}><label className="block"><span className="mb-1.5 block font-body text-sm font-medium">Email *</span><input className="min-h-11 w-full rounded-xl border border-[#dedbd0] bg-white px-3.5 font-body text-sm" type="email" required value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} placeholder="admin@example.com" /></label><label className="block"><span className="mb-1.5 block font-body text-sm font-medium">Mật khẩu *</span><input className="min-h-11 w-full rounded-xl border border-[#dedbd0] bg-white px-3.5 font-body text-sm" type="password" minLength={8} required value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} placeholder="Tối thiểu 8 ký tự" /></label><label className="block"><span className="mb-1.5 block font-body text-sm font-medium">Vai trò mặc định</span><select className="min-h-11 w-full rounded-xl border border-[#dedbd0] bg-white px-3.5 font-body text-sm" value={form.role} onChange={(event) => setForm((current) => ({ ...current, role: event.target.value as AdminRoleKey }))}>{roles.map((item) => <option value={item.roleKey} key={item.roleKey}>{item.name}</option>)}</select></label><button className="admin-primary-action inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--color-olive)] px-5 font-body text-sm font-medium text-white disabled:cursor-wait disabled:opacity-60" type="submit" disabled={busy}>{busy ? 'Đang tạo…' : 'Tạo quản trị viên'}</button></form>
      {error && <p className="m-5 rounded-xl border border-[#ebc4bd] bg-[#fff5f2] p-4 font-body text-sm text-[#a33d32]" role="alert">{error}</p>}
      <div className="border-b border-[#e6e2d7] p-5"><h3 className="font-display text-lg font-semibold">Danh sách quản trị viên</h3><p className="mt-1 font-body text-sm text-[#74776f]">{rows.length} tài khoản thật từ Supabase Auth.</p></div>
      {rows.length ? <div className="overflow-x-auto"><table className="min-w-[720px] w-full text-left"><thead className="bg-[#fcfbf7]"><tr><th className="px-5 py-3 font-body text-sm font-semibold">Email</th><th className="px-5 py-3 font-body text-sm font-semibold">Vai trò</th><th className="px-5 py-3 font-body text-sm font-semibold">Ngày cấp</th><th className="px-5 py-3 text-right font-body text-sm font-semibold">Thao tác</th></tr></thead><tbody>{rows.map((row) => <tr className="border-t border-[#eeeae0]" key={row.userId}><td className="px-5 py-3 font-body text-sm font-medium">{row.email}</td><td className="px-5 py-3"><select className="min-h-9 rounded-lg border border-[#dedbd0] bg-white px-2.5 font-body text-sm" value={row.role} disabled={busy} onChange={(event) => void changeRole(row, event.target.value as AdminRoleKey)}>{roles.map((item) => <option value={item.roleKey} key={item.roleKey}>{item.name}</option>)}</select></td><td className="px-5 py-3 font-body text-sm text-[#74776f]">{row.createdAt ? new Date(row.createdAt).toLocaleString('vi-VN') : '—'}</td><td className="px-5 py-3 text-right"><button className="font-body text-sm text-[#a33d32]" type="button" onClick={() => void remove(row)}>Gỡ quyền</button></td></tr>)}</tbody></table></div> : <div className="p-10 text-center font-body text-sm text-[#74776f]">Chưa có tài khoản quản trị.</div>}
    </section>
  </AdminListShell>
}

function AdminPermissionsPage() {
  const [roles, setRoles] = useState<AdminRoleRow[]>([])
  const [matrix, setMatrix] = useState<AdminPermissionRow[]>([])
  const [error, setError] = useState('')
  const [busyKey, setBusyKey] = useState('')
  const refresh = () => { void Promise.all([loadAdminRoles(), loadAdminPermissionMatrix()]).then(([nextRoles, nextMatrix]) => { setRoles(nextRoles); setMatrix(nextMatrix); setError('') }).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Không tải được ma trận phân quyền.')) }
  useEffect(() => { refresh() }, [])
  const toggle = async (role: AdminRoleKey, permissionKey: string) => { const key = `${role}:${permissionKey}`; const enabled = matrix.some((item) => item.roleKey === role && item.permissionKey === permissionKey); setBusyKey(key); setError(''); try { await setAdminRolePermission(role, permissionKey, !enabled); refresh() } catch (reason) { setError(reason instanceof Error ? reason.message : 'Không cập nhật được quyền.') } finally { setBusyKey('') } }
  const permissions = Array.from(new Map(matrix.map((item) => [item.permissionKey, item])).values()).sort((a, b) => a.sortOrder - b.sortOrder)
  return <AdminListShell title="Phân quyền" section="HỆ THỐNG" description="Thiết lập vai trò và bật/tắt từng quyền nghiệp vụ. Thay đổi được lưu vào Supabase và được backend kiểm tra khi truy cập." createHref="/admin/settings/admin-users" createLabel="Quản trị viên">
    <section className="overflow-hidden rounded-2xl border border-[#e6e2d7] bg-white"><div className="border-b border-[#e6e2d7] p-5"><h3 className="font-display text-lg font-semibold">Ma trận quyền nghiệp vụ</h3><p className="mt-1 font-body text-sm leading-6 text-[#74776f]">Bấm vào ô quyền để cấp hoặc gỡ quyền cho vai trò. Super Admin mặc định có toàn quyền.</p></div>{error && <p className="m-5 rounded-xl border border-[#ebc4bd] bg-[#fff5f2] p-4 font-body text-sm text-[#a33d32]" role="alert">{error}</p>}<div className="overflow-x-auto"><table className="min-w-[980px] w-full text-left"><thead className="bg-[#fcfbf7]"><tr><th className="w-[30%] px-5 py-3 font-body text-sm font-semibold">Nghiệp vụ</th>{roles.map((item) => <th className="px-3 py-3 text-center font-body text-sm font-semibold" key={item.roleKey}>{item.name}</th>)}</tr></thead><tbody>{permissions.map((permission) => <tr className="border-t border-[#eeeae0]" key={permission.permissionKey}><td className="px-5 py-3"><strong className="block font-body text-sm">{permission.permissionName}</strong><span className="font-body text-xs text-[#8b8d86]">{permission.groupName} · {permission.description}</span></td>{roles.map((role) => { const enabled = matrix.some((item) => item.roleKey === role.roleKey && item.permissionKey === permission.permissionKey); const busy = busyKey === `${role.roleKey}:${permission.permissionKey}`; return <td className="px-3 py-3 text-center" key={role.roleKey}><button className={`inline-flex h-8 w-8 items-center justify-center rounded-full border font-semibold transition ${enabled ? 'border-[#39733e] bg-[#edf7ef] text-[#39733e]' : 'border-[#dedbd0] bg-white text-[#c6c4bb] hover:border-[var(--color-olive)]'} disabled:cursor-wait disabled:opacity-50`} type="button" disabled={busy || role.roleKey === 'super_admin'} onClick={() => void toggle(role.roleKey, permission.permissionKey)} aria-label={`${enabled ? 'Gỡ' : 'Cấp'} quyền ${permission.permissionName} cho ${role.name}`}>{enabled ? '✓' : '—'}</button></td> })}</tr>)}</tbody></table></div></section>
  </AdminListShell>
}

function AdminSiteSettingsDataPage() {
  const [rows, setRows] = useState<AdminSiteSettingRow[]>([])
  const [draft, setDraft] = useState({ settingKey: '', language: 'all' as AdminSiteSettingRow['language'], valueJson: '{}', isPublic: false })
  const [formOpen, setFormOpen] = useState(false)
  const [error, setError] = useState('')
  const refresh = () => { void loadAdminSiteSettings().then((nextRows) => { setRows(nextRows); setError('') }).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Không tải được cấu hình từ Supabase.')) }
  useEffect(() => { refresh() }, [])
  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      const valueJson = JSON.parse(draft.valueJson) as Record<string, unknown>
      await upsertAdminSiteSetting({ settingKey: draft.settingKey, language: draft.language, valueJson, isPublic: draft.isPublic })
      setDraft({ settingKey: '', language: 'all', valueJson: '{}', isPublic: false })
      setFormOpen(false)
      refresh()
    } catch (reason) { setError(reason instanceof SyntaxError ? 'value_json phải là JSON hợp lệ.' : reason instanceof Error ? reason.message : 'Không lưu được cấu hình.') }
  }
  const edit = (row: AdminSiteSettingRow) => { setDraft({ settingKey: row.settingKey, language: row.language, valueJson: JSON.stringify(row.valueJson, null, 2), isPublic: row.isPublic }); setFormOpen(true) }
  const remove = async (row: AdminSiteSettingRow) => { if (!window.confirm(`Xóa cấu hình “${row.settingKey}” khỏi Supabase?`)) return; try { await deleteAdminSiteSetting(row.id); refresh() } catch (reason) { setError(reason instanceof Error ? reason.message : 'Không xóa được cấu hình.') } }
  return <AdminListShell title="Cấu hình hệ thống" section="HỆ THỐNG" description="Lưu cấu hình website dạng JSON trong site_settings của Supabase; nội dung công khai mới được phép đọc ở phía người dùng." createHref="/admin/settings" createLabel="Thêm cấu hình"><section className="overflow-hidden rounded-2xl border border-[#e6e2d7] bg-white"><div className="flex flex-col gap-3 border-b border-[#e6e2d7] p-5 sm:flex-row sm:items-center sm:justify-between"><div><h3 className="font-display text-lg font-semibold">Danh sách cấu hình</h3><p className="mt-1 font-body text-sm text-[#74776f]">{rows.length} bản ghi thật từ Supabase.</p></div><button className="admin-primary-action inline-flex min-h-10 items-center justify-center rounded-xl bg-[var(--color-olive)] px-4 font-body text-sm font-medium text-white" type="button" onClick={() => setFormOpen((value) => !value)}><i className="bi bi-plus-lg mr-2" aria-hidden="true" />{formOpen ? 'Đóng form' : 'Thêm cấu hình'}</button></div>{formOpen && <form className="grid gap-3 border-b border-[#eeeae0] bg-[#fcfbf7] p-5" onSubmit={save}><div className="grid gap-3 sm:grid-cols-2"><label className="block"><span className="mb-1.5 block font-body text-sm font-medium">Khóa cấu hình *</span><input className="min-h-11 w-full rounded-xl border border-[#dedbd0] bg-white px-3.5 font-body text-sm" required value={draft.settingKey} onChange={(event) => setDraft((current) => ({ ...current, settingKey: event.target.value }))} placeholder="site_name" /></label><label className="block"><span className="mb-1.5 block font-body text-sm font-medium">Ngôn ngữ</span><select className="min-h-11 w-full rounded-xl border border-[#dedbd0] bg-white px-3.5 font-body text-sm" value={draft.language} onChange={(event) => setDraft((current) => ({ ...current, language: event.target.value as AdminSiteSettingRow['language'] }))}><option value="all">Chung</option><option value="vi">Tiếng Việt</option><option value="en">English</option></select></label></div><label className="block"><span className="mb-1.5 block font-body text-sm font-medium">Giá trị JSON *</span><textarea className="min-h-32 w-full rounded-xl border border-[#dedbd0] bg-white px-3.5 py-3 font-mono text-sm" required value={draft.valueJson} onChange={(event) => setDraft((current) => ({ ...current, valueJson: event.target.value }))} placeholder={'{\n  "value": "LineryBooks"\n}'} /></label><label className="flex items-center gap-2 font-body text-sm"><input type="checkbox" checked={draft.isPublic} onChange={(event) => setDraft((current) => ({ ...current, isPublic: event.target.checked }))} />Cho phép website người dùng đọc cấu hình này</label><div><button className="admin-primary-action inline-flex min-h-10 items-center justify-center rounded-xl bg-[var(--color-olive)] px-4 font-body text-sm font-medium text-white" type="submit">Lưu vào Supabase</button></div></form>}{error && <p className="m-5 rounded-xl border border-[#ebc4bd] bg-[#fff5f2] p-4 font-body text-sm text-[#a33d32]" role="alert">{error}</p>}<div className="overflow-x-auto"><table className="min-w-[780px] w-full text-left"><thead className="bg-[#fcfbf7]"><tr><th className="px-4 py-3 font-body text-sm font-semibold">Khóa</th><th className="px-4 py-3 font-body text-sm font-semibold">Ngôn ngữ</th><th className="px-4 py-3 font-body text-sm font-semibold">Giá trị</th><th className="px-4 py-3 font-body text-sm font-semibold">Công khai</th><th className="px-4 py-3 text-right font-body text-sm font-semibold">Thao tác</th></tr></thead><tbody>{rows.map((row) => <tr className="border-t border-[#eeeae0]" key={row.id}><td className="px-4 py-3 font-body text-sm font-medium">{row.settingKey}</td><td className="px-4 py-3 font-body text-sm">{row.language === 'all' ? 'Chung' : row.language === 'vi' ? 'Tiếng Việt' : 'English'}</td><td className="max-w-[360px] px-4 py-3 font-mono text-xs text-[#62655f]"><pre className="whitespace-pre-wrap">{JSON.stringify(row.valueJson)}</pre></td><td className="px-4 py-3 font-body text-sm">{row.isPublic ? 'Có' : 'Không'}</td><td className="px-4 py-3 text-right"><button className="mr-3 font-body text-sm text-[var(--color-olive-dark)]" type="button" onClick={() => edit(row)}>Sửa</button><button className="font-body text-sm text-[#a33d32]" type="button" onClick={() => void remove(row)}>Xóa</button></td></tr>)}</tbody></table></div>{!rows.length && <div className="p-10 text-center font-body text-sm text-[#74776f]">Chưa có cấu hình thật trong Supabase.</div>}</section></AdminListShell>
}

function AdminSiteSettingsPage() {
  return <AdminShell title="Cấu hình hệ thống" section="HỆ THỐNG"><div className="grid gap-5 md:grid-cols-2"><a className="group rounded-2xl border border-[#e6e2d7] bg-white p-6 transition-colors hover:border-[var(--color-olive)]" href="/admin/settings/site-data"><span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[rgba(155,148,47,.12)] text-xl text-[var(--color-olive-dark)]"><i className="bi bi-sliders" aria-hidden="true" /></span><h2 className="mt-5 font-display text-xl font-semibold group-hover:text-[var(--color-olive-dark)]">Cấu hình website</h2><p className="mt-2 font-body text-sm leading-6 text-[#74776f]">Quản lý thương hiệu, footer, mạng xã hội, chính sách và các giá trị công khai.</p></a><a className="group rounded-2xl border border-[#e6e2d7] bg-white p-6 transition-colors hover:border-[var(--color-olive)]" href="/admin/settings/admin-users"><span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[rgba(155,148,47,.12)] text-xl text-[var(--color-olive-dark)]"><i className="bi bi-person-gear" aria-hidden="true" /></span><h2 className="mt-5 font-display text-xl font-semibold group-hover:text-[var(--color-olive-dark)]">Quản trị viên &amp; phân quyền</h2><p className="mt-2 font-body text-sm leading-6 text-[#74776f]">Quản lý tài khoản quản trị, vai trò và ma trận quyền nghiệp vụ. Đây là khu vực riêng, không phải danh sách khách hàng.</p></a></div></AdminShell>
}

function AdminMediaLibraryPage() {
  const [rows, setRows] = useState<AdminMediaAssetRow[]>([])
  const [assetType, setAssetType] = useState('other')
  const [altText, setAltText] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const refresh = () => { void loadAdminMediaAssets().then((nextRows) => { setRows(nextRows); setError('') }).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Không tải được thư viện media từ Supabase.')) }
  useEffect(() => { refresh() }, [])
  const upload = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const file = event.currentTarget.elements.namedItem('media-file') as HTMLInputElement | null
    const selected = file?.files?.[0]
    if (!selected) { setError('Vui lòng chọn một tệp ảnh.'); return }
    setBusy(true)
    try { await createAdminMediaAsset(selected, assetType, altText); setAltText(''); setFormOpen(false); event.currentTarget.reset(); refresh() } catch (reason) { setError(reason instanceof Error ? reason.message : 'Không tải được tệp lên Storage.') } finally { setBusy(false) }
  }
  const toggle = async (row: AdminMediaAssetRow) => { try { await updateAdminMediaAsset(row.id, { isActive: !row.isActive }); refresh() } catch (reason) { setError(reason instanceof Error ? reason.message : 'Không cập nhật được media.') } }
  const remove = async (row: AdminMediaAssetRow) => { if (!window.confirm(`Xóa “${row.fileName}” khỏi Storage và Supabase?`)) return; try { await deleteAdminMediaAsset(row); refresh() } catch (reason) { setError(reason instanceof Error ? reason.message : 'Không xóa được media.') } }
  return <AdminListShell title="Thư viện media" section="NỘI DUNG" description="Quản lý ảnh bìa, ảnh tác giả, banner và tệp dùng chung trong Storage (kho lưu trữ tệp) của Supabase." createHref="/admin/media" createLabel="Tải media"><section className="overflow-hidden rounded-2xl border border-[#e6e2d7] bg-white"><div className="flex flex-col gap-3 border-b border-[#e6e2d7] p-5 sm:flex-row sm:items-center sm:justify-between"><div><h3 className="font-display text-lg font-semibold">Danh sách tệp</h3><p className="mt-1 font-body text-sm text-[#74776f]">{rows.length} tệp thật từ Storage và bảng site_media_assets.</p></div><button className="admin-primary-action inline-flex min-h-10 items-center justify-center rounded-xl bg-[var(--color-olive)] px-4 font-body text-sm font-medium text-white" type="button" onClick={() => setFormOpen((value) => !value)}><i className="bi bi-upload mr-2" aria-hidden="true" />{formOpen ? 'Đóng form' : 'Tải media'}</button></div>{formOpen && <form className="grid gap-3 border-b border-[#eeeae0] bg-[#fcfbf7] p-5 sm:grid-cols-2" onSubmit={upload}><label className="block"><span className="mb-1.5 block font-body text-sm font-medium">Tệp ảnh *</span><input className="block min-h-11 w-full rounded-xl border border-dashed border-[var(--color-olive)] bg-white px-3 py-2 font-body text-sm" name="media-file" type="file" accept="image/png,image/jpeg,image/webp,image/gif" required /></label><label className="block"><span className="mb-1.5 block font-body text-sm font-medium">Loại asset</span><select className="min-h-11 w-full rounded-xl border border-[#dedbd0] bg-white px-3.5 font-body text-sm" value={assetType} onChange={(event) => setAssetType(event.target.value)}><option value="book-cover">Bìa sách</option><option value="creator">Ảnh creator</option><option value="banner">Banner</option><option value="emagazine">eMagazine</option><option value="other">Khác</option></select></label><label className="block sm:col-span-2"><span className="mb-1.5 block font-body text-sm font-medium">Alt text (mô tả ảnh)</span><input className="min-h-11 w-full rounded-xl border border-[#dedbd0] bg-white px-3.5 font-body text-sm" value={altText} onChange={(event) => setAltText(event.target.value)} placeholder="Mô tả nội dung ảnh" /></label><div className="sm:col-span-2"><button className="admin-primary-action inline-flex min-h-10 items-center justify-center rounded-xl bg-[var(--color-olive)] px-4 font-body text-sm font-medium text-white disabled:opacity-50" type="submit" disabled={busy}>{busy ? 'Đang tải…' : 'Lưu vào Storage'}</button></div></form>}{error && <p className="m-5 rounded-xl border border-[#ebc4bd] bg-[#fff5f2] p-4 font-body text-sm text-[#a33d32]" role="alert">{error}</p>}<div className="overflow-x-auto"><table className="min-w-[920px] w-full text-left"><thead className="bg-[#fcfbf7]"><tr><th className="px-4 py-3 font-body text-sm font-semibold">Ảnh</th><th className="px-4 py-3 font-body text-sm font-semibold">Tên tệp</th><th className="px-4 py-3 font-body text-sm font-semibold">Loại</th><th className="px-4 py-3 font-body text-sm font-semibold">Dung lượng</th><th className="px-4 py-3 font-body text-sm font-semibold">Trạng thái</th><th className="px-4 py-3 text-right font-body text-sm font-semibold">Thao tác</th></tr></thead><tbody>{rows.map((row) => <tr className="border-t border-[#eeeae0]" key={row.id}><td className="px-4 py-3"><img className="h-14 w-20 rounded-lg border border-[#e6e2d7] object-cover" src={row.publicUrl} alt={row.altText} loading="lazy" /></td><td className="px-4 py-3 font-body text-sm"><span className="font-medium">{row.fileName}</span>{row.altText && <p className="mt-1 text-xs text-[#74776f]">{row.altText}</p>}</td><td className="px-4 py-3 font-body text-sm">{row.assetType}</td><td className="px-4 py-3 font-body text-sm">{Math.max(1, Math.round(row.sizeBytes / 1024))} KB</td><td className="px-4 py-3 font-body text-sm">{row.isActive ? 'Đang hoạt động' : 'Tạm ẩn'}</td><td className="px-4 py-3 text-right"><button className="mr-3 font-body text-sm text-[var(--color-olive-dark)]" type="button" onClick={() => void toggle(row)}>{row.isActive ? 'Ẩn' : 'Hiện'}</button><button className="font-body text-sm text-[#a33d32]" type="button" onClick={() => void remove(row)}>Xóa</button></td></tr>)}</tbody></table></div>{!rows.length && <div className="p-10 text-center font-body text-sm text-[#74776f]">Chưa có media thật trong Supabase.</div>}</section></AdminListShell>
}

function AdminLocationsPage() {
  const [locations, setLocations] = useState<AdminStoreLocationRow[]>([])
  const [zones, setZones] = useState<AdminDeliveryZoneRow[]>([])
  const [tab, setTab] = useState<'locations' | 'zones'>('locations')
  const [draft, setDraft] = useState({ code: '', name: '', type: 'store', address: '', city: 'Hà Nội', level: 'city', fee: '0' })
  const [formOpen, setFormOpen] = useState(false)
  const [error, setError] = useState('')
  const refresh = () => { void Promise.all([loadAdminStoreLocations(), loadAdminDeliveryZones()]).then(([nextLocations, nextZones]) => { setLocations(nextLocations); setZones(nextZones); setError('') }).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Không tải được địa điểm từ Supabase.')) }
  useEffect(() => { refresh() }, [])
  const add = async (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); try { if (tab === 'locations') await createAdminStoreLocation({ code: draft.code, name: draft.name, locationType: draft.type, address: draft.address, city: draft.city, sortOrder: locations.length }); else await createAdminDeliveryZone({ name: draft.name, level: draft.level, feeVnd: Number(draft.fee) || 0, sortOrder: zones.length }); setDraft({ code: '', name: '', type: 'store', address: '', city: 'Hà Nội', level: 'city', fee: '0' }); setFormOpen(false); refresh() } catch (reason) { setError(reason instanceof Error ? reason.message : 'Không tạo được dữ liệu địa điểm.') } }
  const toggleLocation = async (row: AdminStoreLocationRow) => { try { await updateAdminStoreLocation(row.id, { isActive: !row.isActive }); refresh() } catch (reason) { setError(reason instanceof Error ? reason.message : 'Không cập nhật được địa điểm.') } }
  const toggleZone = async (row: AdminDeliveryZoneRow) => { try { await updateAdminDeliveryZone(row.id, { isActive: !row.isActive }); refresh() } catch (reason) { setError(reason instanceof Error ? reason.message : 'Không cập nhật được khu vực.') } }
  const removeLocation = async (row: AdminStoreLocationRow) => { if (!window.confirm(`Xóa “${row.name}” khỏi Supabase?`)) return; try { await deleteAdminStoreLocation(row.id); refresh() } catch (reason) { setError(reason instanceof Error ? reason.message : 'Không xóa được địa điểm.') } }
  const removeZone = async (row: AdminDeliveryZoneRow) => { if (!window.confirm(`Xóa “${row.name}” khỏi Supabase?`)) return; try { await deleteAdminDeliveryZone(row.id); refresh() } catch (reason) { setError(reason instanceof Error ? reason.message : 'Không xóa được khu vực.') } }
  return <AdminListShell title="Địa điểm và khu vực giao hàng" section="HỆ THỐNG" description="Quản lý điểm bán, kho và khu vực giao hàng bằng dữ liệu thật trong Supabase." createHref="/admin/locations" createLabel="Thêm mới"><section className="overflow-hidden rounded-2xl border border-[#e6e2d7] bg-white"><div className="flex flex-col gap-3 border-b border-[#e6e2d7] p-5 sm:flex-row sm:items-center sm:justify-between"><div><h3 className="font-display text-lg font-semibold">{tab === 'locations' ? 'Điểm bán và kho' : 'Khu vực giao hàng'}</h3><p className="mt-1 font-body text-sm text-[#74776f]">{tab === 'locations' ? `${locations.length} điểm bán thật.` : `${zones.length} khu vực thật.`}</p></div><button className="admin-primary-action inline-flex min-h-10 items-center justify-center rounded-xl bg-[var(--color-olive)] px-4 font-body text-sm font-medium text-white" type="button" onClick={() => setFormOpen((value) => !value)}><i className="bi bi-plus-lg mr-2" aria-hidden="true" />{formOpen ? 'Đóng form' : 'Thêm mới'}</button></div><div className="flex gap-1 border-b border-[#eeeae0] px-5"><button className={`border-b-2 px-3 py-3 font-body text-sm ${tab === 'locations' ? 'border-[var(--color-olive)] font-semibold text-[var(--color-olive-dark)]' : 'border-transparent text-[#74776f]'}`} type="button" onClick={() => { setTab('locations'); setFormOpen(false) }}>Điểm bán và kho</button><button className={`border-b-2 px-3 py-3 font-body text-sm ${tab === 'zones' ? 'border-[var(--color-olive)] font-semibold text-[var(--color-olive-dark)]' : 'border-transparent text-[#74776f]'}`} type="button" onClick={() => { setTab('zones'); setFormOpen(false) }}>Khu vực giao hàng</button></div>{formOpen && <form className="grid gap-3 border-b border-[#eeeae0] bg-[#fcfbf7] p-5 sm:grid-cols-2" onSubmit={add}>{tab === 'locations' ? <><label className="block"><span className="mb-1.5 block font-body text-sm font-medium">Mã *</span><input className="min-h-11 w-full rounded-xl border border-[#dedbd0] bg-white px-3.5 font-body text-sm" required value={draft.code} onChange={(event) => setDraft((current) => ({ ...current, code: event.target.value }))} placeholder="STORE-01" /></label><label className="block"><span className="mb-1.5 block font-body text-sm font-medium">Tên *</span><input className="min-h-11 w-full rounded-xl border border-[#dedbd0] bg-white px-3.5 font-body text-sm" required value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} placeholder="Cửa hàng Linery" /></label><label className="block"><span className="mb-1.5 block font-body text-sm font-medium">Loại</span><select className="min-h-11 w-full rounded-xl border border-[#dedbd0] bg-white px-3.5 font-body text-sm" value={draft.type} onChange={(event) => setDraft((current) => ({ ...current, type: event.target.value }))}><option value="store">Cửa hàng</option><option value="warehouse">Kho</option><option value="online">Kênh online</option></select></label><label className="block"><span className="mb-1.5 block font-body text-sm font-medium">Thành phố</span><input className="min-h-11 w-full rounded-xl border border-[#dedbd0] bg-white px-3.5 font-body text-sm" value={draft.city} onChange={(event) => setDraft((current) => ({ ...current, city: event.target.value }))} /></label><label className="block sm:col-span-2"><span className="mb-1.5 block font-body text-sm font-medium">Địa chỉ</span><input className="min-h-11 w-full rounded-xl border border-[#dedbd0] bg-white px-3.5 font-body text-sm" value={draft.address} onChange={(event) => setDraft((current) => ({ ...current, address: event.target.value }))} /></label></> : <><label className="block"><span className="mb-1.5 block font-body text-sm font-medium">Tên khu vực *</span><input className="min-h-11 w-full rounded-xl border border-[#dedbd0] bg-white px-3.5 font-body text-sm" required value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} placeholder="Hà Nội" /></label><label className="block"><span className="mb-1.5 block font-body text-sm font-medium">Cấp</span><select className="min-h-11 w-full rounded-xl border border-[#dedbd0] bg-white px-3.5 font-body text-sm" value={draft.level} onChange={(event) => setDraft((current) => ({ ...current, level: event.target.value }))}><option value="city">Tỉnh / thành phố</option><option value="district">Quận / huyện</option><option value="ward">Phường / xã</option></select></label><label className="block"><span className="mb-1.5 block font-body text-sm font-medium">Phí giao hàng</span><input className="min-h-11 w-full rounded-xl border border-[#dedbd0] bg-white px-3.5 font-body text-sm" type="number" min="0" value={draft.fee} onChange={(event) => setDraft((current) => ({ ...current, fee: event.target.value }))} /></label></>}<div className="sm:col-span-2"><button className="admin-primary-action inline-flex min-h-10 items-center justify-center rounded-xl bg-[var(--color-olive)] px-4 font-body text-sm font-medium text-white" type="submit">Lưu vào Supabase</button></div></form>}{error && <p className="m-5 rounded-xl border border-[#ebc4bd] bg-[#fff5f2] p-4 font-body text-sm text-[#a33d32]" role="alert">{error}</p>}{tab === 'locations' ? <div className="overflow-x-auto"><table className="min-w-[780px] w-full text-left"><thead className="bg-[#fcfbf7]"><tr><th className="px-4 py-3 font-body text-sm font-semibold">Mã</th><th className="px-4 py-3 font-body text-sm font-semibold">Tên</th><th className="px-4 py-3 font-body text-sm font-semibold">Loại</th><th className="px-4 py-3 font-body text-sm font-semibold">Địa chỉ</th><th className="px-4 py-3 font-body text-sm font-semibold">Trạng thái</th><th className="px-4 py-3 text-right font-body text-sm font-semibold">Thao tác</th></tr></thead><tbody>{locations.map((row) => <tr className="border-t border-[#eeeae0]" key={row.id}><td className="px-4 py-3 font-body text-sm font-semibold">{row.code}</td><td className="px-4 py-3 font-body text-sm">{row.name}</td><td className="px-4 py-3 font-body text-sm">{row.locationType}</td><td className="px-4 py-3 font-body text-sm">{[row.address, row.city].filter(Boolean).join(', ') || '—'}</td><td className="px-4 py-3 font-body text-sm">{row.isActive ? 'Đang hoạt động' : 'Tạm ẩn'}</td><td className="px-4 py-3 text-right"><button className="mr-3 font-body text-sm text-[var(--color-olive-dark)]" type="button" onClick={() => void toggleLocation(row)}>{row.isActive ? 'Tắt' : 'Bật'}</button><button className="font-body text-sm text-[#a33d32]" type="button" onClick={() => void removeLocation(row)}>Xóa</button></td></tr>)}</tbody></table></div> : <div className="overflow-x-auto"><table className="min-w-[680px] w-full text-left"><thead className="bg-[#fcfbf7]"><tr><th className="px-4 py-3 font-body text-sm font-semibold">Tên khu vực</th><th className="px-4 py-3 font-body text-sm font-semibold">Cấp</th><th className="px-4 py-3 font-body text-sm font-semibold">Phí giao hàng</th><th className="px-4 py-3 font-body text-sm font-semibold">Trạng thái</th><th className="px-4 py-3 text-right font-body text-sm font-semibold">Thao tác</th></tr></thead><tbody>{zones.map((row) => <tr className="border-t border-[#eeeae0]" key={row.id}><td className="px-4 py-3 font-body text-sm">{row.name}</td><td className="px-4 py-3 font-body text-sm">{row.level}</td><td className="px-4 py-3 font-body text-sm">{row.feeVnd.toLocaleString('vi-VN')}₫</td><td className="px-4 py-3 font-body text-sm">{row.isActive ? 'Đang hoạt động' : 'Tạm ẩn'}</td><td className="px-4 py-3 text-right"><button className="mr-3 font-body text-sm text-[var(--color-olive-dark)]" type="button" onClick={() => void toggleZone(row)}>{row.isActive ? 'Tắt' : 'Bật'}</button><button className="font-body text-sm text-[#a33d32]" type="button" onClick={() => void removeZone(row)}>Xóa</button></td></tr>)}</tbody></table></div>}{((tab === 'locations' && !locations.length) || (tab === 'zones' && !zones.length)) && <div className="p-10 text-center font-body text-sm text-[#74776f]">Chưa có dữ liệu thật trong Supabase.</div>}</section></AdminListShell>
}

function AdminChatbotPromptsPage() {
  const [rows, setRows] = useState<AdminChatbotPromptRow[]>([])
  const [prompt, setPrompt] = useState('')
  const [language, setLanguage] = useState<AdminChatbotPromptRow['language']>('vi')
  const [error, setError] = useState('')
  const refresh = () => { void loadAdminChatbotPrompts().then(setRows).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Không tải được quick prompt từ Supabase.')) }
  useEffect(() => { refresh() }, [])
  const add = async (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); try { await createAdminChatbotPrompt({ prompt, language, sortOrder: rows.length }); setPrompt(''); refresh() } catch (reason) { setError(reason instanceof Error ? reason.message : 'Không tạo được quick prompt.') } }
  const toggle = async (row: AdminChatbotPromptRow) => { try { await updateAdminChatbotPrompt(row.id, { isActive: !row.isActive }); refresh() } catch (reason) { setError(reason instanceof Error ? reason.message : 'Không cập nhật được quick prompt.') } }
  const remove = async (row: AdminChatbotPromptRow) => { if (!window.confirm(`Xóa quick prompt “${row.prompt}”?`)) return; try { await deleteAdminChatbotPrompt(row.id); refresh() } catch (reason) { setError(reason instanceof Error ? reason.message : 'Không xóa được quick prompt.') } }
  return <AdminListShell title="Cấu hình chatbot" section="HỆ THỐNG" description="Quản lý quick prompt (gợi ý hỏi nhanh) dùng cho Linbot; không lưu khóa bí mật ở frontend." createHref="/admin/chatbot" createLabel="Thêm quick prompt"><section className="overflow-hidden rounded-2xl border border-[#e6e2d7] bg-white"><form className="flex flex-col gap-3 border-b border-[#eeeae0] bg-[#fcfbf7] p-5 sm:flex-row" onSubmit={add}><input className="min-h-11 min-w-0 flex-1 rounded-xl border border-[#dedbd0] bg-white px-3.5 font-body text-sm" required value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder="Tìm sách theo tác giả" /><select className="min-h-11 rounded-xl border border-[#dedbd0] bg-white px-3.5 font-body text-sm" value={language} onChange={(event) => setLanguage(event.target.value as AdminChatbotPromptRow['language'])}><option value="vi">Tiếng Việt</option><option value="en">English</option></select><button className="admin-primary-action inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--color-olive)] px-5 font-body text-sm font-medium text-white" type="submit">Thêm</button></form>{error && <p className="m-5 rounded-xl border border-[#ebc4bd] bg-[#fff5f2] p-4 font-body text-sm text-[#a33d32]" role="alert">{error}</p>}<div className="overflow-x-auto"><table className="min-w-[680px] w-full text-left"><thead className="bg-[#fcfbf7]"><tr><th className="px-4 py-3 font-body text-sm font-semibold">Quick prompt</th><th className="px-4 py-3 font-body text-sm font-semibold">Ngôn ngữ</th><th className="px-4 py-3 font-body text-sm font-semibold">Thứ tự</th><th className="px-4 py-3 font-body text-sm font-semibold">Trạng thái</th><th className="px-4 py-3 text-right font-body text-sm font-semibold">Thao tác</th></tr></thead><tbody>{rows.map((row) => <tr className="border-t border-[#eeeae0]" key={row.id}><td className="px-4 py-3 font-body text-sm">{row.prompt}</td><td className="px-4 py-3 font-body text-sm">{row.language === 'vi' ? 'Tiếng Việt' : 'English'}</td><td className="px-4 py-3 font-body text-sm">{row.sortOrder + 1}</td><td className="px-4 py-3 font-body text-sm">{row.isActive ? 'Đang hoạt động' : 'Tạm ẩn'}</td><td className="px-4 py-3 text-right"><button className="mr-3 font-body text-sm text-[var(--color-olive-dark)]" type="button" onClick={() => void toggle(row)}>{row.isActive ? 'Tắt' : 'Bật'}</button><button className="font-body text-sm text-[#a33d32]" type="button" onClick={() => void remove(row)}>Xóa</button></td></tr>)}</tbody></table></div>{!rows.length && <div className="p-10 text-center font-body text-sm text-[#74776f]">Chưa có quick prompt thật.</div>}</section></AdminListShell>
}

function AdminImportHistoryPage() {
  const [rows, setRows] = useState<AdminImportBatchRow[]>([])
  const [error, setError] = useState('')
  useEffect(() => { void loadAdminImportBatches().then(setRows).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Không tải được lịch sử nhập từ Supabase.')) }, [])
  return <AdminListShell title="Lịch sử nhập Excel" section="SÁCH" description="Lịch sử các lần nhập sách được ghi lại trong book_import_batches của Supabase." createHref="/admin/books" createLabel="Về quản lý sách"><section className="overflow-hidden rounded-2xl border border-[#e6e2d7] bg-white"><div className="border-b border-[#e6e2d7] p-5"><h3 className="font-display text-lg font-semibold">Các lần nhập dữ liệu</h3><p className="mt-1 font-body text-sm text-[#74776f]">{rows.length} bản ghi thật từ Supabase.</p></div>{error && <p className="m-5 rounded-xl border border-[#ebc4bd] bg-[#fff5f2] p-4 font-body text-sm text-[#a33d32]" role="alert">{error}</p>}<div className="overflow-x-auto"><table className="min-w-[820px] w-full text-left"><thead className="bg-[#fcfbf7]"><tr><th className="px-4 py-3 font-body text-sm font-semibold">Tên file</th><th className="px-4 py-3 font-body text-sm font-semibold">Tổng dòng</th><th className="px-4 py-3 font-body text-sm font-semibold">Hợp lệ</th><th className="px-4 py-3 font-body text-sm font-semibold">Lỗi</th><th className="px-4 py-3 font-body text-sm font-semibold">Trạng thái</th><th className="px-4 py-3 font-body text-sm font-semibold">Ngày nhập</th></tr></thead><tbody>{rows.map((row) => <tr className="border-t border-[#eeeae0]" key={row.id}><td className="px-4 py-3 font-body text-sm">{row.fileName}</td><td className="px-4 py-3 font-body text-sm">{row.totalRows}</td><td className="px-4 py-3 font-body text-sm">{row.validRows}</td><td className="px-4 py-3 font-body text-sm">{row.errorRows}</td><td className="px-4 py-3 font-body text-sm">{row.status}</td><td className="px-4 py-3 font-body text-sm">{row.createdAt ? new Date(row.createdAt).toLocaleString('vi-VN') : '—'}</td></tr>)}</tbody></table></div>{!rows.length && <div className="p-10 text-center font-body text-sm text-[#74776f]">Chưa có lịch sử nhập thật trong Supabase.</div>}</section></AdminListShell>
}

function AdminBooksPageV2({ managementView }: { managementView: BookManagementView }) {
  const [books, setBooks] = useState<AdminBook[]>([])
  const [catalogLoaded, setCatalogLoaded] = useState(false)
  const [catalogError, setCatalogError] = useState('')
  const [saveNotice, setSaveNotice] = useState('')
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [authorFilter, setAuthorFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [publisherFilter, setPublisherFilter] = useState('all')
  const [bookPage, setBookPage] = useState(1)
  const [bookPageSize, setBookPageSize] = useState(10)
  useEffect(() => {
    const handleNotice = (event: Event) => {
      const detail = (event as CustomEvent<FloatingNoticeDetail>).detail
      if (detail?.tone !== 'success' || !detail.message) return
      setSaveNotice(detail.message)
      window.setTimeout(() => setSaveNotice(''), 7000)
    }
    window.addEventListener(floatingNoticeEvent, handleNotice)
    return () => window.removeEventListener(floatingNoticeEvent, handleNotice)
  }, [])
  useEffect(() => {
    let cancelled = false
    loadPublicCatalogProducts().then((products) => {
      if (cancelled || !products?.length) return
      const mapped: AdminBook[] = products.map((product) => ({
        id: product.id,
        isbn: product.isbn,
        title: product.title,
        author: product.author,
        quantity: product.inventoryQuantity,
        unitPrice: null,
        salePrice: Number(product.price.replace(/[^0-9]/g, '')) || 0,
        link: '',
        format: product.format,
        line: product.line || product.publisher,
        category: product.categories.join(', '),
        cover: product.image,
        coverImages: product.gallery,
      }))
      setBooks(mapped)
      setCatalogLoaded(true)
    }).catch(() => {
      if (!cancelled) { setCatalogLoaded(false); setCatalogError('Không tải được danh sách sách từ Supabase.') }
    })
    return () => { cancelled = true }
  }, [])
  const authorHref = (authorName: string) => {
    const author = adminAuthorRecords.find((item) => item.name.toLowerCase() === authorName.toLowerCase())
    return author ? `/admin/authors?author=${encodeURIComponent(author.id)}` : '/admin/authors'
  }
  const reportHref = (book: AdminBook) => `/admin/books/report/${book.id ?? encodeURIComponent(book.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'))}`
  const authorOptions = [...new Set(books.map((book) => book.author).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'vi'))
  const categoryOptions = [...new Set(books.flatMap((book) => (book.category || '').split(',').map((value) => value.trim()).filter(Boolean)))].sort((a, b) => a.localeCompare(b, 'vi'))
  const publisherOptions = [...new Set(books.map((book) => book.line).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'vi'))
  const filteredBooks = books.filter((book) => {
    const haystack = `${book.title} ${book.isbn} ${book.author} ${book.category}`.toLocaleLowerCase('vi')
    const matchesQuery = haystack.includes(query.trim().toLocaleLowerCase('vi'))
    const matchesStatus = statusFilter === 'all' || (statusFilter === 'in-stock' ? book.quantity > 0 : book.quantity === 0)
    const matchesAuthor = authorFilter === 'all' || book.author === authorFilter
    const matchesCategory = categoryFilter === 'all' || (book.category || '').split(',').map((value) => value.trim()).includes(categoryFilter)
    const matchesPublisher = publisherFilter === 'all' || book.line === publisherFilter
    return matchesQuery && matchesStatus && matchesAuthor && matchesCategory && matchesPublisher
  })
  const totalBookPages = Math.max(1, Math.ceil(filteredBooks.length / bookPageSize))
  const pagedBooks = filteredBooks.slice((bookPage - 1) * bookPageSize, bookPage * bookPageSize)
  useEffect(() => {
    setBookPage(1)
  }, [query, statusFilter, authorFilter, categoryFilter, publisherFilter, bookPageSize])
  useEffect(() => {
    setBookPage((current) => Math.min(current, totalBookPages))
  }, [totalBookPages])
  if (managementView === 'categories') return <AdminCategoriesPageRemote />
  return <AdminListShell title="Quản lý sách" section="SÁCH" description="Danh sách sách được đọc trực tiếp từ catalog Supabase. Bấm Thêm sách để tạo bản ghi thật và tải ảnh lên storage." createHref="/admin/books/new" createLabel="Thêm sách"><section className="overflow-hidden rounded-2xl border border-[#e6e2d7] bg-white"><div className="flex items-center justify-between gap-4 border-b border-[#eeeae0] p-5"><div><h3 className="font-display text-lg font-semibold">Danh sách sách</h3><p className="mt-1 font-body text-sm text-[#74776f]">{filteredBooks.length} / {books.length} bản ghi {catalogLoaded ? 'từ Supabase' : 'đang tải dữ liệu thật…'}.</p></div><span className="inline-flex min-h-9 items-center rounded-lg bg-[#f6f5ed] px-3 font-body text-xs text-[#62655f]">Supabase catalog</span></div>{saveNotice && <p className="m-5 rounded-xl border border-[#b9ddc0] bg-[#edf7ef] px-4 py-3 font-body text-sm leading-6 text-[#39733e]" role="status"><i className="bi bi-check-circle-fill mr-2" aria-hidden="true" />{saveNotice}</p>}{catalogError && <p className="m-5 rounded-xl bg-[#fff4ec] px-4 py-3 font-body text-sm leading-6 text-[#9a4c2d]" role="alert">{catalogError}</p>}<AdminTableFilterBar query={query} onQueryChange={setQuery} queryPlaceholder="Tìm theo tên sách, ISBN hoặc tác giả" filters={[{ label: 'Tất cả trạng thái', value: statusFilter, onChange: setStatusFilter, options: [{ label: 'Còn hàng', value: 'in-stock' }, { label: 'Hết hàng', value: 'out-of-stock' }] }, { label: 'Tất cả danh mục / chủ đề', value: categoryFilter, onChange: setCategoryFilter, options: categoryOptions.map((category) => ({ label: category, value: category })) }, { label: 'Tất cả tác giả', value: authorFilter, onChange: setAuthorFilter, options: authorOptions.map((author) => ({ label: author, value: author })) }, { label: 'Tất cả nhà xuất bản', value: publisherFilter, onChange: setPublisherFilter, options: publisherOptions.map((publisher) => ({ label: publisher, value: publisher })) }]} onClear={() => { setQuery(''); setStatusFilter('all'); setCategoryFilter('all'); setAuthorFilter('all'); setPublisherFilter('all') }} /><div className="overflow-x-auto"><table className="min-w-[860px] w-full text-left"><thead className="bg-[#fcfbf7]"><tr>{['STT', 'Ảnh bìa', 'ISBN', 'Tên sách', 'Tác giả', 'Số lượng', 'Giá bán', 'Trạng thái'].map((heading) => <th className="px-4 py-3 font-body text-sm font-semibold" key={heading}>{heading}</th>)}<th className="px-4 py-3 text-right font-body text-sm font-semibold">Thao tác</th></tr></thead><tbody>{pagedBooks.map((book, index) => <tr className="border-t border-[#eeeae0]" key={`${book.isbn}-${book.title}`}><td className="px-4 py-3 font-body text-sm text-[#74776f]">{(bookPage - 1) * bookPageSize + index + 1}</td><td className="px-4 py-3"><img className="h-16 w-11 object-cover" src={book.cover || BOOK_COVER_FALLBACK} alt={`Bìa ${book.title}`} onError={(event) => { event.currentTarget.src = BOOK_COVER_FALLBACK }} /></td><td className="px-4 py-3 font-body text-sm">{book.isbn || '—'}</td><td className="max-w-[280px] px-4 py-3 font-body text-sm font-medium"><a className="admin-data-link" href={reportHref(book)}>{book.title}</a></td><td className="px-4 py-3 font-body text-sm">{book.author ? <a className="text-[var(--color-olive-dark)] underline-offset-2 hover:underline" href={authorHref(book.author)}>{book.author}</a> : '—'}</td><td className="px-4 py-3 font-body text-sm">{book.quantity}</td><td className="px-4 py-3 font-body text-sm">{book.salePrice.toLocaleString('vi-VN')}₫</td><td className="px-4 py-3 font-body text-sm"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${book.quantity > 0 ? 'bg-[#eaf7ef] text-[#39733e]' : 'bg-[#fff0ed] text-[#a33d32]'}`}>{book.quantity > 0 ? 'Còn hàng' : 'Hết hàng'}</span></td><td className="px-4 py-3 text-right"><div className="flex justify-end gap-1"><a className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#74776f] hover:bg-[#f5f3ec]" href={reportHref(book)} aria-label={`Xem ${book.title}`} title="Xem"><i className="bi bi-eye" aria-hidden="true" /></a><a className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#74776f] hover:bg-[#f5f3ec]" href={reportHref(book)} aria-label={`Sửa ${book.title}`} title="Sửa"><i className="bi bi-pencil" aria-hidden="true" /></a><button className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#74776f] hover:bg-[#fff0ed] hover:text-[#a33d32]" type="button" aria-label={`Xóa ${book.title}`} title="Xóa" onClick={() => { if (!book.id || !window.confirm(`Xóa sách “${book.title}” khỏi Supabase?`)) return; void deleteAdminBook(book.id).then(() => setBooks((current) => current.filter((item) => item.id !== book.id))).catch((reason) => setCatalogError(reason instanceof Error ? reason.message : 'Không xóa được sách.')) }}><i className="bi bi-trash3" aria-hidden="true" /></button></div></td></tr>)}</tbody></table></div><AdminTableFooter total={filteredBooks.length} pageSize={bookPageSize} onPageSizeChange={setBookPageSize} page={bookPage} onPageChange={setBookPage} /></section></AdminListShell>
}

function AdminNewsPageV2() {
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [sortFilter, setSortFilter] = useState('newest')
  const [items, setItems] = useState<NewsItem[]>(runtimeNewsItems)
  const [adminItems, setAdminItems] = useState<AdminNewsPost[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    let active = true
    loadAdminNewsPosts().then((records) => {
      if (!active) return
      setAdminItems(records)
      applyPublicNews(records)
      setItems([...runtimeNewsItems])
    }).catch(() => undefined).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])
  const filteredItems = [...adminItems].filter((item) => `${item.titleVi || item.title} ${item.slug} ${item.excerptVi || item.excerpt}`.toLowerCase().includes(query.trim().toLowerCase())).filter((item) => typeFilter === 'all' || item.contentType === typeFilter).sort((a, b) => sortFilter === 'oldest' ? (a.date || '').localeCompare(b.date || '') : (b.date || '').localeCompare(a.date || ''))
  return <AdminListShell title="Quản lý tin tức" section="NỘI DUNG" description="Danh sách tin tức và eMagazine đã xuất bản; nội dung chi tiết được nhập bằng trình soạn thảo ở màn tạo mới." createHref="/admin/news/new" createLabel="Tạo bài viết"><section className="overflow-hidden rounded-2xl border border-[#e6e2d7] bg-white"><div className="border-b border-[#eeeae0] p-5"><h3 className="font-display text-lg font-semibold">Danh sách bài viết</h3><p className="mt-1 font-body text-sm text-[#74776f]">{loading ? 'Đang tải dữ liệu thật từ Supabase…' : `${filteredItems.length} / ${items.length} bài đang hiển thị từ Supabase`}</p></div><AdminTableFilterBar query={query} onQueryChange={setQuery} queryPlaceholder="Tìm theo tiêu đề, đường dẫn hoặc mô tả" filters={[{ label: 'Tất cả loại bài', value: typeFilter, onChange: setTypeFilter, options: [{ label: 'Tin tức', value: 'news' }, { label: 'eMagazine', value: 'emagazine' }] }, { label: 'Sắp xếp ngày', value: sortFilter, onChange: setSortFilter, options: [{ label: 'Mới nhất', value: 'newest' }, { label: 'Cũ nhất', value: 'oldest' }] }]} onClear={() => { setQuery(''); setTypeFilter('all'); setSortFilter('newest') }} /><div className="admin-news-table-scroll overflow-x-auto"><table className="admin-news-table min-w-[900px] w-full text-left"><thead className="bg-[#fcfbf7]"><tr>{['Tiêu đề', 'Đường dẫn', 'Ngày xuất bản', 'Trạng thái', 'Thao tác'].map((heading) => <th className="px-4 py-3 font-body text-sm font-semibold" key={heading}>{heading}</th>)}</tr></thead><tbody>{filteredItems.map((item) => <tr className="border-t border-[#eeeae0]" key={item.slug}><td className="px-4 py-3 font-body text-sm font-medium">{item.titleVi || item.title}</td><td className="px-4 py-3 font-body text-sm text-[#74776f]">{item.slug}</td><td className="px-4 py-3 font-body text-sm">{item.date || '—'}</td><td className="px-4 py-3 font-body text-sm"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${item.contentType === 'emagazine' ? 'bg-[#fff3e8] text-[#b55b2f]' : 'bg-[#edf7ef] text-[#39733e]'}`}>{item.contentType === 'emagazine' ? 'Đã xuất bản · eMagazine' : 'Đã xuất bản · Tin tức'}</span></td><td className="px-4 py-3"><div className="flex justify-end gap-1"><a className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#dedbd0] text-[#62655f] hover:border-[var(--color-olive)] hover:bg-[#f6f5ed]" href={`/admin/news/${item.slug}`} aria-label={`Xem ${item.titleVi || item.title}`} title="Xem"><i className="bi bi-eye" aria-hidden="true" /></a><a className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#dedbd0] text-[#62655f] hover:border-[var(--color-olive)] hover:bg-[#f6f5ed]" href={`/admin/news/edit/${item.slug}`} aria-label={`Sửa ${item.titleVi || item.title}`} title="Sửa nội dung"><i className="bi bi-pencil" aria-hidden="true" /></a></div></td></tr>)}</tbody></table></div></section></AdminListShell>
}

function AdminNewsPreviewPage({ slug }: { slug: string }) {
  const [item, setItem] = useState<NewsItem | undefined>(() => runtimeNewsItems.find((entry) => entry.slug === slug))
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    let active = true
    loadAdminNewsPosts().then((records) => {
      if (!active) return
      applyPublicNews(records)
      setItem(runtimeNewsItems.find((entry) => entry.slug === slug))
    }).catch(() => undefined).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [slug])
  if (loading) return <AdminSimpleCreateShell title="Đang tải bài viết" backHref="/admin/news" section="NỘI DUNG" description="Đang đọc nội dung thật từ Supabase…"><div className="rounded-xl border border-[#e6e2d7] bg-white p-6 font-body text-sm text-[#74776f]">Đang tải dữ liệu bài viết…</div></AdminSimpleCreateShell>
  if (!item) return <AdminListShell title="Bài viết không tồn tại" section="NỘI DUNG" description="Không tìm thấy bài viết với đường dẫn này." createHref="/admin/news/new" createLabel="Tạo bài viết"><p className="font-body text-sm text-[#74776f]">Kiểm tra lại đường dẫn hoặc quay về danh sách bài viết.</p></AdminListShell>
  const paragraphs = item.bodyVi?.length ? item.bodyVi : item.body
  return <AdminSimpleCreateShell title="Xem bài viết" backHref="/admin/news" section="NỘI DUNG" description="Xem trước nội dung đã xuất bản." headerActions={<a className="admin-primary-action inline-flex min-h-10 items-center justify-center rounded-lg bg-[var(--color-olive)] px-4 font-body text-sm font-medium text-white hover:bg-[var(--color-olive-dark)]" href={`/admin/news/edit/${item.slug}`}><i className="bi bi-pencil mr-2" aria-hidden="true" />Sửa nội dung</a>}><article className="mx-auto max-w-4xl"><div className="flex flex-wrap items-center gap-2 font-body text-sm text-[#74776f]"><span className="rounded-full bg-[#f6f5ed] px-2.5 py-1">{item.contentType === 'emagazine' ? 'eMagazine' : 'Tin tức'}</span><span>{item.date}</span></div><h2 className="mt-4 font-display text-3xl font-semibold tracking-tight">{item.titleVi || item.title}</h2><p className="mt-3 font-body text-base leading-7 text-[#62655f]">{item.excerptVi || item.excerpt}</p><img className="mt-6 max-h-[28rem] w-full rounded-2xl object-cover" src={item.image} alt={item.titleVi || item.title} onError={(event) => { event.currentTarget.src = '/assets/news-instagram-01.jpg' }} />{item.contentType === 'emagazine' ? <div className="admin-news-preview-content mt-8 space-y-5">{(item.blocksVi ?? item.blocks ?? []).map((block, index) => block.type === 'heading' ? <h3 className="font-display text-2xl font-semibold" key={block.id || index}>{block.content}</h3> : block.type === 'quote' ? <blockquote className="border-l-2 border-[var(--color-olive)] pl-4 font-display text-xl italic text-[#62655f]" key={block.id || index}>{block.content}</blockquote> : block.type === 'image' ? <figure className="admin-news-preview-figure" key={block.id || index}><img src={block.image} alt={block.alt || block.caption || ''} loading="lazy" onError={(event) => { event.currentTarget.hidden = true }} />{block.caption && <figcaption>{block.caption}</figcaption>}</figure> : <p className="font-body text-base leading-8 text-[#303832]" key={block.id || index}>{block.content}</p>)}</div> : <div className="mt-8 space-y-5">{paragraphs.map((paragraph, index) => <p className="font-body text-base leading-8 text-[#303832]" key={index}>{paragraph}</p>)}</div>}</article></AdminSimpleCreateShell>
}

const stripEditorMarkup = (value: string) => value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
const editorHtmlToParagraphs = (value: string) => {
  const paragraphs = [...value.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)].map((match) => stripEditorMarkup(match[1])).filter(Boolean)
  return paragraphs.length ? paragraphs : [stripEditorMarkup(value)].filter(Boolean)
}
const editorJsToBlocks = (value: string): PublicNewsBlock[] => {
  try {
    const parsed = JSON.parse(value) as { blocks?: Array<{ type?: string; data?: Record<string, unknown> }> }
    return (parsed.blocks ?? []).map((block, index) => {
      const data = block.data ?? {}
      const type = block.type === 'header' ? 'heading' : block.type === 'quote' ? 'quote' : block.type === 'image' ? 'image' : 'paragraph'
      const content = String(data.text ?? data.caption ?? data.message ?? '')
      const image = typeof data.file === 'object' && data.file ? String((data.file as { url?: unknown }).url ?? '') : String(data.url ?? '')
      return { id: `editor-${index}`, type: type as PublicNewsBlock['type'], content: stripEditorMarkup(content), image, alt: String(data.alt ?? ''), caption: String(data.caption ?? ''), fullBleed: false }
    }).filter((block) => block.content || block.image)
  } catch {
    return []
  }
}

function AdminNewsCreatePageV2({ editSlug }: { editSlug?: string }) {
  const [items, setItems] = useState<NewsItem[]>(runtimeNewsItems)
  const [loading, setLoading] = useState(Boolean(editSlug))
  useEffect(() => {
    let active = true
    loadAdminNewsPosts().then((records) => {
      if (!active) return
      applyPublicNews(records)
      setItems([...runtimeNewsItems])
    }).catch(() => undefined).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])
  const editingItem = editSlug ? items.find((item) => item.slug === editSlug) : undefined
  const [content, setContent] = useState(() => editingItem?.contentType === 'emagazine' ? JSON.stringify({ blocks: editingItem.blocksVi ?? editingItem.blocks ?? [] }) : editingItem?.bodyVi?.map((paragraph) => `<p>${paragraph}</p>`).join('') ?? '')
  const [contentType, setContentType] = useState<'news' | 'emagazine'>(() => editingItem?.contentType ?? 'news')
  const [saved, setSaved] = useState(false)
  const [coverPreview, setCoverPreview] = useState('')
  const [coverFileName, setCoverFileName] = useState('')
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [title, setTitle] = useState(editingItem?.titleVi || editingItem?.title || '')
  const [slug, setSlug] = useState(editingItem?.slug || '')
  const [excerpt, setExcerpt] = useState(editingItem?.excerptVi || editingItem?.excerpt || '')
  const [seoTitle, setSeoTitle] = useState(editingItem?.seoTitle || '')
  const [seoKeywords, setSeoKeywords] = useState(editingItem?.seoKeywords?.join(', ') || '')
  const [seoDescription, setSeoDescription] = useState(editingItem?.seoDescription || '')
  const [isPublished, setIsPublished] = useState(editingItem?.isPublished ?? true)
  const [showOnHomepage, setShowOnHomepage] = useState(editingItem?.showOnHomepage ?? true)
  const [isFeatured, setIsFeatured] = useState(editingItem?.isFeatured ?? false)
  const [categorySlugs, setCategorySlugs] = useState<string[]>(editingItem?.categorySlugs ?? [])
  const [displayFormat, setDisplayFormat] = useState<'standard' | 'video'>(editingItem?.displayFormat ?? 'standard')
  useEffect(() => {
    if (!editingItem) return
    setTitle(editingItem.titleVi || editingItem.title)
    setSlug(editingItem.slug)
    setExcerpt(editingItem.excerptVi || editingItem.excerpt)
    setContent(editingItem.contentType === 'emagazine' ? JSON.stringify({ blocks: editingItem.blocksVi ?? editingItem.blocks ?? [] }) : editingItem.bodyVi?.map((paragraph) => `<p>${paragraph}</p>`).join('') ?? '')
    setContentType(editingItem.contentType ?? 'news')
    setSeoTitle(editingItem.seoTitle ?? '')
    setSeoKeywords(editingItem.seoKeywords?.join(', ') ?? '')
    setSeoDescription(editingItem.seoDescription ?? '')
    setIsPublished(editingItem.isPublished ?? true)
    setShowOnHomepage(editingItem.showOnHomepage ?? true)
    setIsFeatured(editingItem.isFeatured ?? false)
    setCategorySlugs(editingItem.categorySlugs ?? [])
    setDisplayFormat(editingItem.displayFormat ?? 'standard')
  }, [editingItem?.slug])
  const saveNews = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextSlug = slug.trim() || editingItem?.slug || `bai-viet-${Date.now()}`
    const isEmagazine = contentType === 'emagazine'
    const parsedBlocks = isEmagazine ? editorJsToBlocks(content) : []
    const paragraphs = isEmagazine ? parsedBlocks.filter((block) => block.type === 'paragraph').map((block) => block.content) : editorHtmlToParagraphs(content)
    const nextItem: NewsItem = {
      ...(editingItem ?? { image: '/assets/news-instagram-01.jpg', date: new Date().toLocaleDateString('en-GB'), kicker: contentType === 'emagazine' ? 'eMagazine' : 'News', body: [], bodyVi: [], byline: '' }),
      title: title.trim() || editingItem?.title || 'Untitled article',
      titleVi: title.trim() || editingItem?.titleVi || 'Bài viết mới',
      slug: nextSlug,
      excerpt: excerpt.trim(),
      excerptVi: excerpt.trim(),
      contentType,
      body: paragraphs,
      bodyVi: paragraphs,
      blocks: parsedBlocks,
      blocksVi: parsedBlocks,
      seoTitle,
      seoKeywords: seoKeywords.split(',').map((value) => value.trim()).filter(Boolean),
      seoDescription,
      showOnHomepage,
      isFeatured,
      isPublished,
      categorySlugs,
      displayFormat,
    }
    try {
      const uploadedCover = coverFile ? await createAdminMediaAsset(coverFile, 'news-cover', nextItem.titleVi || nextItem.title) : null
      const savedItem = uploadedCover ? { ...nextItem, image: uploadedCover.publicUrl } : nextItem
      await upsertNewsPost({ slug: savedItem.slug, contentType: savedItem.contentType ?? 'news', title: savedItem.title, titleVi: savedItem.titleVi, kicker: savedItem.kicker, kickerVi: savedItem.kicker, excerpt: savedItem.excerpt, excerptVi: savedItem.excerptVi, body: savedItem.body, bodyVi: savedItem.bodyVi, image: savedItem.image, byline: savedItem.byline, blocks: parsedBlocks.map(({ id: _id, ...block }) => block), blocksVi: parsedBlocks.map(({ id: _id, ...block }) => block), seoTitle: savedItem.seoTitle, seoKeywords: savedItem.seoKeywords, seoDescription: savedItem.seoDescription, showOnHomepage: savedItem.showOnHomepage, isFeatured: savedItem.isFeatured, isPublished: savedItem.isPublished, categorySlugs: savedItem.categorySlugs, displayFormat: savedItem.displayFormat })
      runtimeNewsItems = [savedItem, ...runtimeNewsItems.filter((item) => item.slug !== savedItem.slug)]
      setSaved(true)
      emitFloatingNotice('success', 'Đã lưu bài viết vào Supabase.')
    } catch (error) {
      setSaved(false)
      emitFloatingNotice('error', `Không thể lưu bài vào Supabase: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`)
    }
  }
  if (loading) return <AdminSimpleCreateShell title="Đang tải bài viết" backHref="/admin/news" section="NỘI DUNG" description="Đang đọc nội dung thật từ Supabase…"><div className="rounded-xl border border-[#e6e2d7] bg-white p-6 font-body text-sm text-[#74776f]">Đang tải dữ liệu bài viết…</div></AdminSimpleCreateShell>
  return <AdminSimpleCreateShell title={editingItem ? 'Sửa nội dung bài viết' : 'Tin mới'} backHref="/admin/news" section="NỘI DUNG" description="Soạn nội dung và lưu trực tiếp vào Supabase để trang người dùng đọc cùng một bản ghi thật." tabs={[{ id: 'news-content', label: 'Nội dung' }, { id: 'news-seo', label: 'Tối ưu hóa tìm kiếm Google' }, { id: 'news-history', label: 'Lịch sử thao tác' }]} headerActions={<AdminCreateHeaderActions formId="admin-news-create-form" cancelHref="/admin/news" saveLabel={editingItem ? 'Lưu thay đổi' : 'Xuất bản'} />}>
     <form id="admin-news-create-form" className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]" onSubmit={saveNews}>
      <div className="min-w-0 space-y-5">
        <AdminCreatePanel id="news-content" title="Nội dung tin bài">
          <div className="space-y-4"><div className="admin-news-type-tabs" role="tablist" aria-label="Loại nội dung"><button className={`admin-news-type-tab ${contentType === 'news' ? 'is-active' : ''}`} type="button" role="tab" aria-selected={contentType === 'news'} onClick={() => { setContentType('news'); setSaved(false) }}>Tin tức</button><button className={`admin-news-type-tab ${contentType === 'emagazine' ? 'is-active' : ''}`} type="button" role="tab" aria-selected={contentType === 'emagazine'} onClick={() => { setContentType('emagazine'); setSaved(false) }}>eMagazine</button></div><p className="admin-news-type-note">{contentType === 'news' ? 'Bài viết tin tức tiêu chuẩn với nội dung biên tập theo dạng bài.' : 'Bài longform trực quan, chia thành các block nội dung để dễ dàn trang và đọc trên web.'}</p><label className="block"><span className="mb-1.5 block font-body text-sm font-medium">Tiêu đề bài viết<span className="ml-1 text-[var(--color-olive-dark)]">*</span></span><input className="min-h-11 w-full rounded-lg border border-[#dedbd0] bg-[#fcfbf7] px-3.5 font-body text-sm" required value={title} onChange={(event) => setTitle(event.target.value)} placeholder={contentType === 'emagazine' ? 'Nhập tiêu đề eMagazine' : 'Nhập tiêu đề bài viết'} /></label><label className="block"><span className="mb-1.5 block font-body text-sm font-medium">Đường dẫn</span><input className="min-h-11 w-full rounded-lg border border-[#dedbd0] bg-[#fcfbf7] px-3.5 font-body text-sm" value={slug} onChange={(event) => setSlug(event.target.value)} placeholder="tu-dong-sinh-tu-tieu-de" /></label><label className="block"><span className="mb-1.5 block font-body text-sm font-medium">Mô tả ngắn</span><textarea className="min-h-24 w-full rounded-lg border border-[#dedbd0] bg-[#fcfbf7] p-3.5 font-body text-sm" value={excerpt} onChange={(event) => setExcerpt(event.target.value)} placeholder="Mô tả ngắn hiển thị ở thẻ tin và khi chia sẻ..." /> </label>{contentType === 'news' ? <AdminCkEditor key="news-editor" label="Nội dung bài viết" value={content} onChange={setContent} placeholder="Nhập nội dung tin tức..." /> : <AdminEditorJs key="emagazine-editor" label="Nội dung eMagazine longform" value={content} onChange={setContent} placeholder="Bắt đầu viết eMagazine..." />}{saved && <p className="rounded-lg bg-[#edf7ef] px-3 py-2 font-body text-sm text-[#39733e]" role="status">Đã lưu bài viết thật vào Supabase. Trang người dùng sẽ đọc cùng bản ghi này.</p>}</div>
        </AdminCreatePanel>
        <AdminCreatePanel id="news-seo" title="Tối ưu hóa tìm kiếm Google"><div className="grid gap-4 sm:grid-cols-2"><label className="block"><span className="mb-1.5 block font-body text-sm font-medium">SEO Title</span><input className="min-h-11 w-full rounded-lg border border-[#dedbd0] bg-[#fcfbf7] px-3.5 font-body text-sm" value={seoTitle} onChange={(event) => setSeoTitle(event.target.value)} placeholder="Tiêu đề hiển thị trên Google" /></label><label className="block"><span className="mb-1.5 block font-body text-sm font-medium">SEO Keywords</span><input className="min-h-11 w-full rounded-lg border border-[#dedbd0] bg-[#fcfbf7] px-3.5 font-body text-sm" value={seoKeywords} onChange={(event) => setSeoKeywords(event.target.value)} placeholder="Từ khóa" /></label><label className="block sm:col-span-2"><span className="mb-1.5 block font-body text-sm font-medium">SEO Description</span><textarea className="min-h-20 w-full rounded-lg border border-[#dedbd0] bg-[#fcfbf7] p-3.5 font-body text-sm" value={seoDescription} onChange={(event) => setSeoDescription(event.target.value)} placeholder="Mô tả kết quả tìm kiếm" /></label></div></AdminCreatePanel>
        <AdminCreatePanel id="news-history" title="Lịch sử thao tác"><div className="overflow-x-auto"><table className="min-w-full text-left font-body text-sm"><thead className="bg-[#f7f8fb]"><tr><th className="px-3 py-2 font-semibold">Thời gian</th><th className="px-3 py-2 font-semibold">Hành động</th><th className="px-3 py-2 font-semibold">Người thực hiện</th></tr></thead><tbody><tr className="border-t border-[#e2e5ee]"><td className="px-3 py-3 text-[#74776f]">—</td><td className="px-3 py-3">Chưa có thao tác</td><td className="px-3 py-3 text-[#74776f]">—</td></tr></tbody></table></div></AdminCreatePanel>
      </div>
      <aside className="admin-create-aside min-w-0 space-y-5">
        <AdminCreatePanel title="Ảnh đại diện"><AdminImageUpload label="Ảnh đại diện" showLabel={false} preview={coverPreview} fileName={coverFileName} onFileChange={(file) => { setCoverFile(file); setCoverFileName(file.name); setCoverPreview(URL.createObjectURL(file)) }} onClear={() => { setCoverFile(null); setCoverFileName(''); setCoverPreview('') }} /></AdminCreatePanel>
        <AdminCreatePanel title="Hiển thị"><div className="space-y-2"><label className="flex items-center gap-2 rounded-lg border border-[#e2e5ee] px-3 py-2.5 font-body text-sm"><input className="h-4 w-4 accent-[var(--color-olive)]" type="checkbox" checked={isPublished} onChange={(event) => setIsPublished(event.target.checked)} />Hiển thị trên website</label><label className="flex items-center gap-2 rounded-lg border border-[#e2e5ee] px-3 py-2.5 font-body text-sm"><input className="h-4 w-4 accent-[var(--color-olive)]" type="checkbox" checked={showOnHomepage} onChange={(event) => setShowOnHomepage(event.target.checked)} />Hiển thị trên trang chủ</label><label className="flex items-center gap-2 rounded-lg border border-[#e2e5ee] px-3 py-2.5 font-body text-sm"><input className="h-4 w-4 accent-[var(--color-olive)]" type="checkbox" checked={isFeatured} onChange={(event) => setIsFeatured(event.target.checked)} />Tin nổi bật</label></div></AdminCreatePanel>
        <AdminCreatePanel title="Chọn danh mục tin"><div className="space-y-2">{[['book-notes', 'Book notes'], ['from-the-shelf', 'From the shelf'], ['reading-list', 'Reading list']].map(([value, label]) => <label className="flex items-center gap-2 rounded-lg border border-[#e2e5ee] px-3 py-2.5 font-body text-sm" key={value}><input className="h-4 w-4 accent-[var(--color-olive)]" type="checkbox" checked={categorySlugs.includes(value)} onChange={(event) => setCategorySlugs((current) => event.target.checked ? [...new Set([...current, value])] : current.filter((item) => item !== value))} />{label}</label>)}</div><button className="mt-3 inline-flex min-h-9 items-center justify-center rounded-lg border border-[var(--color-olive)] px-3 font-body text-sm text-[var(--color-olive-dark)] hover:bg-[rgba(155,148,47,.08)]" type="button"><i className="bi bi-plus-lg mr-1.5" aria-hidden="true" />Thêm danh mục</button></AdminCreatePanel>
        <AdminCreatePanel title="Định dạng"><div className="space-y-2"><label className="flex items-center gap-2 rounded-lg border border-[#e2e5ee] px-3 py-2.5 font-body text-sm"><input className="h-4 w-4 accent-[var(--color-olive)]" type="radio" name="news-format" value="standard" checked={displayFormat === 'standard'} onChange={() => setDisplayFormat('standard')} />Chuẩn</label><label className="flex items-center gap-2 rounded-lg border border-[#e2e5ee] px-3 py-2.5 font-body text-sm"><input className="h-4 w-4 accent-[var(--color-olive)]" type="radio" name="news-format" value="video" checked={displayFormat === 'video'} onChange={() => setDisplayFormat('video')} />Video</label></div></AdminCreatePanel>
      </aside>
    </form>
  </AdminSimpleCreateShell>
}

function AdminReportsPage() {
  const [analyticsUrl, setAnalyticsUrl] = useState('')
  const [saved, setSaved] = useState('')
  const [settingsError, setSettingsError] = useState('')
  const [savingSettings, setSavingSettings] = useState(false)
  const [orders, setOrders] = useState<AdminOrderRow[]>([])
  const [ordersError, setOrdersError] = useState('')
  useEffect(() => { void loadAdminOrders().then(setOrders).catch((reason: unknown) => setOrdersError(reason instanceof Error ? reason.message : 'Không tải được số liệu đơn hàng từ Supabase.')) }, [])
  useEffect(() => {
    let active = true
    void loadAdminSiteSettings().then((rows) => {
      if (!active) return
      const setting = rows.find((row) => row.settingKey === 'analytics_embed_url' && row.language === 'all')
      const url = setting?.valueJson?.url
      setAnalyticsUrl(typeof url === 'string' ? url : '')
    }).catch((reason: unknown) => {
      if (active) setSettingsError(reason instanceof Error ? reason.message : 'Không tải được cấu hình Analytics từ Supabase.')
    })
    return () => { active = false }
  }, [])
  const saveAnalyticsSettings = async () => {
    const url = analyticsUrl.trim()
    if (url && !/^https:\/\//i.test(url)) {
      setSettingsError('URL nhúng phải bắt đầu bằng https:// để bảo đảm an toàn.')
      setSaved('')
      return
    }
    setSavingSettings(true)
    setSaved('')
    setSettingsError('')
    try {
      await upsertAdminSiteSetting({ settingKey: 'analytics_embed_url', language: 'all', valueJson: { url }, isPublic: false })
      setSaved('Đã lưu cấu hình Analytics vào Supabase.')
    } catch (reason) {
      setSettingsError(reason instanceof Error ? reason.message : 'Không lưu được cấu hình Analytics vào Supabase.')
    } finally {
      setSavingSettings(false)
    }
  }
  const revenue = orders.reduce((sum, order) => sum + order.totalVnd, 0)
  const metrics = [
    ['Lượt truy cập', '—', 'Cần kết nối Analytics', 'bi-eye'],
    ['Người dùng', '—', 'Cần kết nối Analytics', 'bi-people'],
    ['Đơn hàng', orders.length.toLocaleString('vi-VN'), 'Dữ liệu Supabase', 'bi-bag'],
    ['Doanh thu', `${revenue.toLocaleString('vi-VN')}₫`, 'Dữ liệu Supabase', 'bi-graph-up-arrow'],
  ]
  return <div className="admin-shell flex min-h-screen bg-[#f7f7f2] text-[var(--color-ink)]"><aside className="admin-sidebar fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-[#e5e2d7] bg-white lg:static"><div className="flex h-16 items-center border-b border-[#eeeae0] px-5"><a className="font-display text-lg font-semibold tracking-[.08em] text-[var(--color-ink)]" href="/#home">LINERY <span className="font-body text-xs font-normal tracking-[.18em] text-[var(--color-olive)]">QUẢN TRỊ</span></a></div><AdminManagementSidebar pathname="/admin/reports" /></aside><div className="min-w-0 flex-1"><header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[#e5e2d7] bg-white/95 px-4 backdrop-blur sm:px-5 lg:px-6"><h1 className="font-body text-lg font-semibold tracking-tight">Báo cáo & thống kê</h1><button className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-olive)] font-body text-sm text-white" type="button" aria-label="Hồ sơ quản trị">K</button></header><main className="w-full p-3 sm:p-4 lg:p-5"><div className="admin-breadcrumb mb-4 flex items-center gap-2 font-body text-sm text-[#8b8d86]"><a className="hover:text-[var(--color-olive-dark)]" href="/admin">Quản trị</a><i className="bi bi-chevron-right text-xs" aria-hidden="true" /><span className="font-medium text-[var(--color-ink)]">Báo cáo & thống kê</span></div><div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p className="mb-1 font-body text-xs font-semibold uppercase tracking-[.14em] text-[var(--color-olive)]">TỔNG QUAN</p><h2 className="font-body text-2xl font-semibold tracking-tight">Hiệu quả cửa hàng</h2><p className="mt-1 font-body text-sm text-[#74776f]">Theo dõi hoạt động bán hàng, nội dung và hành vi truy cập trên website.</p></div><button className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-[#dedbd0] bg-white px-3.5 font-body text-sm text-[#62655f] hover:border-[var(--color-olive)]" type="button"><i className="bi bi-download" aria-hidden="true" />Xuất báo cáo</button></div><section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{metrics.map(([label, value, change, icon]) => <article className="rounded-xl border border-[#e6e2d7] bg-white p-4" key={label}><div className="flex items-center justify-between"><p className="font-body text-sm text-[#74776f]">{label}</p><span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#f6f5ed] text-[var(--color-olive-dark)]"><i className={`bi ${icon}`} aria-hidden="true" /></span></div><p className="mt-3 font-body text-2xl font-semibold">{value}</p><p className="mt-1 font-body text-xs font-semibold text-[#39733e]">{change === 'Dữ liệu Supabase' ? change : 'Chưa có dữ liệu Analytics'}</p></article>)}</section><div className="mt-4 grid gap-4 xl:grid-cols-2"><section className="rounded-xl border border-[#e6e2d7] bg-white p-4 sm:p-5"><h3 className="font-body text-base font-semibold">Lượt truy cập</h3><p className="mt-1 font-body text-sm text-[#74776f]">Chưa có bảng Analytics thật được kết nối.</p><div className="mt-6 flex min-h-48 items-center justify-center rounded-lg border border-dashed border-[#d8d5c8] bg-[#fcfbf7] px-5 text-center"><p className="max-w-md font-body text-sm leading-6 text-[#74776f]"><i className="bi bi-bar-chart-line mr-2 text-[var(--color-olive)]" aria-hidden="true" />Không hiển thị biểu đồ ước đoán. Khi kết nối Google Analytics/Looker Studio, dữ liệu truy cập thật sẽ xuất hiện tại đây.</p></div></section><section className="rounded-xl border border-[#e6e2d7] bg-white p-4 sm:p-5"><h3 className="font-body text-base font-semibold">Nguồn truy cập</h3><p className="mt-1 font-body text-sm text-[#74776f]">Chưa có dữ liệu nguồn truy cập thật.</p><div className="mt-6 flex min-h-48 items-center justify-center rounded-lg border border-dashed border-[#d8d5c8] bg-[#fcfbf7] px-5 text-center"><p className="max-w-md font-body text-sm leading-6 text-[#74776f]"><i className="bi bi-diagram-3 mr-2 text-[var(--color-olive)]" aria-hidden="true" />Số liệu nguồn truy cập sẽ chỉ hiển thị sau khi backend Analytics được cấu hình.</p></div></section></div><section className="mt-4 rounded-xl border border-[#e6e2d7] bg-white p-4 sm:p-5"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start"><div><p className="font-body text-xs font-semibold uppercase tracking-[.14em] text-[var(--color-olive)]">TÍCH HỢP</p><h3 className="mt-1 font-body text-base font-semibold">Google Analytics</h3><p className="mt-1 max-w-2xl font-body text-sm text-[#74776f]">Nhúng báo cáo Analytics/Looker Studio vào khu vực quản trị. URL nhúng sẽ được lưu trong cấu hình hệ thống khi kết nối backend.</p></div><a className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-[#dedbd0] px-3.5 font-body text-sm text-[#62655f] hover:border-[var(--color-olive)]" href="https://analytics.google.com/" target="_blank" rel="noreferrer"><i className="bi bi-box-arrow-up-right" aria-hidden="true" />Mở Google Analytics</a></div><div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end"><label className="block"><span className="mb-1.5 block font-body text-sm font-medium">URL báo cáo nhúng</span><input className="min-h-10 w-full rounded-lg border border-[#dedbd0] bg-[#fcfbf7] px-3 font-body text-sm" value={analyticsUrl} onChange={(event) => { setAnalyticsUrl(event.target.value); setSaved(''); setSettingsError('') }} placeholder="https://lookerstudio.google.com/embed/reporting/..." /></label><button className="inline-flex min-h-10 items-center justify-center rounded-lg bg-[var(--color-olive)] px-4 font-body text-sm font-medium text-white hover:bg-[var(--color-olive-dark)]" type="button" onClick={() => void saveAnalyticsSettings()} disabled={savingSettings}>{savingSettings ? 'Đang lưu...' : 'Lưu cấu hình'}</button></div>{settingsError && <p className="mt-2 font-body text-sm font-medium text-[#a33d32]" role="alert">{settingsError}</p>}{saved && <p className="mt-2 font-body text-sm font-medium text-[#39733e]" role="status">{saved}</p>}{analyticsUrl ? <div className="mt-4 aspect-[16/7] overflow-hidden rounded-lg border border-[#e6e2d7] bg-[#fcfbf7]"><iframe className="h-full w-full border-0" title="Báo cáo Google Analytics" src={analyticsUrl} /></div> : <div className="mt-4 flex min-h-32 items-center justify-center rounded-lg border border-dashed border-[#d8d5c8] bg-[#fcfbf7] px-5 text-center"><p className="max-w-xl font-body text-sm text-[#74776f]"><i className="bi bi-bar-chart-line mr-2 text-[var(--color-olive)]" aria-hidden="true" />Chưa có URL báo cáo nhúng. Khi backend kết nối Google Analytics, khu vực này sẽ hiển thị báo cáo truy cập thật.</p></div>}</section></main></div></div>
}

function AdminSalesDashboardRemote() {
  const [dashboardSummary, setDashboardSummary] = useState<AdminDashboardSummary | null>(null)
  const [topBooks, setTopBooks] = useState<AdminTopBookRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useEffect(() => {
    let active = true
    void Promise.all([loadAdminDashboardSummary(), loadAdminTopBooks()]).then(([summary, books]) => { if (active) { setDashboardSummary(summary); setTopBooks(books) } }).catch((reason) => { if (active) setError(reason instanceof Error ? reason.message : 'Không tải được dữ liệu Tổng quan từ Supabase.') }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])
  const orders = dashboardSummary?.recentOrders ?? []
  const cards = [['Tổng số sách', dashboardSummary?.bookCount.toLocaleString('vi-VN') ?? '…', 'Đọc từ Supabase', 'bi-book'], ['Tổng đơn hàng', dashboardSummary?.orderCount.toLocaleString('vi-VN') ?? '…', 'Đọc từ Supabase', 'bi-bag'], ['Tác giả', dashboardSummary?.creatorCount.toLocaleString('vi-VN') ?? '…', 'Đọc từ Supabase', 'bi-people'], ['Bài viết tin tức', dashboardSummary?.newsCount.toLocaleString('vi-VN') ?? '…', 'Đọc từ Supabase', 'bi-newspaper']]
  return <div className="admin-shell flex min-h-screen bg-[#f7f7f2] text-[var(--color-ink)]"><aside className="admin-sidebar fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-[#e5e2d7] bg-white lg:static"><div className="flex h-16 items-center border-b border-[#eeeae0] px-5"><a className="admin-brand-link" href="/#home" aria-label="LineryBooks"><AdminBrand /></a></div><AdminManagementSidebar pathname="/admin" /></aside><div className="min-w-0 flex-1"><header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[#e5e2d7] bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8"><div><p className="font-body text-xs text-[#8b8d86]">Quản trị</p><h1 className="font-body text-lg font-semibold tracking-tight">Tổng quan vận hành</h1></div><a className="inline-flex min-h-9 items-center rounded-lg border border-[#dedbd0] px-3 font-body text-sm text-[#62655f] hover:border-[var(--color-olive)]" href="/admin/orders">Quản lý đơn hàng</a></header><main className="mx-auto w-full max-w-[1440px] p-4 sm:p-6 lg:p-8"><div className="mb-5"><p className="mb-1 font-body text-xs font-semibold uppercase tracking-[.14em] text-[var(--color-olive)]">BÁN HÀNG</p><h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">Báo cáo từ dữ liệu thật</h2><p className="mt-1 max-w-2xl font-body text-sm leading-6 text-[#74776f]">Các chỉ số dưới đây được tính từ bảng đơn hàng Supabase, không dùng dữ liệu mẫu trong trình duyệt.</p></div>{error && <p className="mb-5 rounded-xl border border-[#ebc4bd] bg-[#fff5f2] p-4 font-body text-sm text-[#a33d32]" role="alert">{error}</p>}<section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(([label, value, meta, icon]) => <article className="rounded-2xl border border-[#e6e2d7] bg-white p-5" key={label}><div className="flex items-start justify-between gap-3"><div><p className="font-body text-sm text-[#74776f]">{label}</p><p className="mt-3 font-display text-2xl font-semibold tracking-tight">{loading ? '…' : value}</p></div><span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[rgba(155,148,47,.12)] text-lg text-[var(--color-olive)]"><i className={`bi ${icon}`} aria-hidden="true" /></span></div><p className="mt-4 font-body text-sm text-[#74776f]">{meta}</p></article>)}</section><section className="mt-6 overflow-hidden rounded-2xl border border-[#e6e2d7] bg-white"><div className="flex flex-col justify-between gap-3 border-b border-[#eeeae0] p-5 sm:flex-row sm:items-center"><div><h3 className="font-display text-lg font-semibold">Đơn hàng gần đây</h3><p className="mt-1 font-body text-sm text-[#8b8d86]">Bản ghi mới nhất từ Supabase.</p></div><a className="font-body text-sm font-medium text-[var(--color-olive-dark)]" href="/admin/orders">Xem tất cả</a></div>{!loading && !orders.length ? <div className="p-12 text-center font-body text-sm text-[#74776f]">Chưa có đơn hàng thật trong Supabase.</div> : <div className="overflow-x-auto"><table className="min-w-[820px] w-full text-left"><thead className="bg-[#fcfbf7]"><tr>{['Mã đơn', 'Khách hàng', 'Số sách', 'Tổng tiền', 'Trạng thái', 'Ngày tạo'].map((heading) => <th className="px-4 py-3 font-body text-sm font-semibold" key={heading}>{heading}</th>)}</tr></thead><tbody>{orders.slice(0, 10).map((order) => <tr className="border-t border-[#eeeae0]" key={order.id}><td className="px-4 py-3 font-body text-sm font-semibold">{order.orderNumber}</td><td className="px-4 py-3 font-body text-sm">{order.customer}</td><td className="px-4 py-3 font-body text-sm">{order.itemCount}</td><td className="px-4 py-3 font-body text-sm">{formatPrice(order.totalVnd)}</td><td className="px-4 py-3 font-body text-sm">{order.status}</td><td className="px-4 py-3 font-body text-sm text-[#74776f]">{order.createdAt ? new Date(order.createdAt).toLocaleString('vi-VN') : '—'}</td></tr>)}</tbody></table></div>}</section><section className="mt-6 grid gap-6 lg:grid-cols-2"><article className="rounded-2xl border border-[#e6e2d7] bg-white p-5"><h3 className="font-display text-lg font-semibold">Lượt truy cập</h3><p className="mt-2 font-body text-sm leading-6 text-[#74776f]">Chưa có kết nối Analytics (phân tích dữ liệu truy cập). Không hiển thị số liệu ước đoán.</p></article><article className="rounded-2xl border border-[#e6e2d7] bg-white p-5"><h3 className="font-display text-lg font-semibold">Sản phẩm bán chạy</h3>{!loading && !topBooks.length ? <p className="mt-2 font-body text-sm leading-6 text-[#74776f]">Chưa có dữ liệu sản phẩm trong đơn hàng.</p> : <ol className="mt-4 space-y-3">{topBooks.map((book, index) => <li className="flex items-center justify-between gap-3 border-b border-[#eeeae0] pb-3 font-body text-sm last:border-0 last:pb-0" key={book.title}><span className="min-w-0 truncate"><strong className="mr-2 text-[var(--color-olive-dark)]">{index + 1}.</strong>{book.title}</span><span className="shrink-0 text-right text-[#62655f]">{book.quantity} cuốn<br /><strong>{formatPrice(book.revenueVnd)}</strong></span></li>)}</ol>}</article></section></main></div></div>
}

function AdminSalesDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [period, setPeriod] = useState('Tháng trước')
  const [chartMode, setChartMode] = useState<'day' | 'hour' | 'week'>('day')
  const [recentOrdersExpanded, setRecentOrdersExpanded] = useState(false)
  useEffect(() => {
    const aside = document.querySelector<HTMLElement>('.admin-sales-dashboard main aside')
    const toggle = aside?.querySelector<HTMLAnchorElement>('a[href="/admin/orders"]')
    const rows = aside ? Array.from(aside.querySelectorAll<HTMLElement>('.divide-y > a')) : []
    if (!aside || !toggle) return
    const smallScreen = window.matchMedia('(max-width: 1023px)').matches
    rows.forEach((row, index) => { row.hidden = smallScreen && !recentOrdersExpanded && index >= 5 })
    toggle.textContent = smallScreen ? (recentOrdersExpanded ? 'Thu gọn' : 'Xem thêm') : 'Xem tất cả'
    toggle.setAttribute('aria-expanded', smallScreen ? String(recentOrdersExpanded) : 'false')
    const onClick = (event: MouseEvent) => { if (window.matchMedia('(max-width: 1023px)').matches) { event.preventDefault(); setRecentOrdersExpanded((expanded) => !expanded) } }
    toggle.addEventListener('click', onClick)
    return () => toggle.removeEventListener('click', onClick)
  }, [recentOrdersExpanded])
  useEffect(() => {
    const sidebar = document.querySelector<HTMLElement>('.admin-sales-dashboard .admin-sidebar')
    const shell = sidebar?.closest<HTMLElement>('.admin-shell')
    if (!sidebar || !shell || sidebar.querySelector('.admin-sidebar-collapse')) return
    const button = document.createElement('button')
    button.className = 'admin-sidebar-collapse'
    button.type = 'button'
    button.setAttribute('aria-label', 'Thu gọn menu quản trị')
    const icon = document.createElement('i')
    icon.className = 'bi bi-chevron-left'
    icon.setAttribute('aria-hidden', 'true')
    button.append(icon)
    const toggle = () => { const collapsed = shell.classList.toggle('admin-sidebar-collapsed'); icon.className = `bi ${collapsed ? 'bi-chevron-right' : 'bi-chevron-left'}`; button.setAttribute('aria-label', collapsed ? 'Mở rộng menu quản trị' : 'Thu gọn menu quản trị') }
    button.addEventListener('click', toggle)
    sidebar.append(button)
    return () => { button.removeEventListener('click', toggle); button.remove() }
  }, [])
    useEffect(() => {
      const brand = document.querySelector<HTMLAnchorElement>('.admin-sales-dashboard .admin-sidebar > div:first-child > a.font-display')
      if (!brand || brand.classList.contains('admin-brand-link')) return
      brand.className = 'admin-brand-link'
      brand.setAttribute('aria-label', 'LineryBooks')
      brand.textContent = ''
      const content = document.createElement('span')
      content.className = 'admin-brand'
      const logo = document.createElement('img')
      logo.src = '/assets/linerybooks-logo-pixel-bg.svg'
      logo.alt = 'LineryBooks'
      const label = document.createElement('span')
      label.textContent = 'LineryBooks'
      content.append(logo, label)
      brand.append(content)
    }, [])
  const revenueBars = ['h-[55%]', 'h-[68%]', 'h-[72%]', 'h-[88%]', 'h-[12%]', 'h-[26%]', 'h-[20%]', 'h-[15%]', 'h-[22%]', 'h-[32%]', 'h-[38%]', 'h-[14%]', 'h-[8%]', 'h-[24%]', 'h-[11%]', 'h-[26%]', 'h-[24%]', 'h-[16%]', 'h-[42%]', 'h-[18%]']
  const recentOrders = [['Bình', '564.000₫', 'một giờ trước'], ['Bình', '350.000₫', 'một giờ trước'], ['Bình', '564.000₫', '5 giờ trước'], ['Bình', '110.000₫', '5 giờ trước'], ['Bình', '581.000₫', '6 giờ trước'], ['Bình', '387.000₫', '6 giờ trước'], ['Bình', '196.000₫', '7 giờ trước'], ['Bình', '75.000₫', '8 giờ trước'], ['Bình', '100.000₫', '10 giờ trước']]
  const topBooks = [['Dumb luck (quyển)', '2,8 tr', 'w-[88%]'], ['Treasury of Vietnamese Folktales (quyển)', '2,2 tr', 'w-[70%]'], ['Last Night I Dreamed of Peace', '1,7 tr', 'w-[54%]'], ['The Pre-Raphaelites (quyển)', '775,8k', 'w-[30%]'], ['The Bell Jar (xanh than) (quyển)', '620k', 'w-[24%]']]
  const metricCards = [['Doanh thu', '3.955.000₫', '13 hóa đơn', 'bi-currency-dollar'], ['Trả hàng', '0', 'Không có phát sinh', 'bi-arrow-return-left'], ['Doanh thu thuần', '37,61%', 'So với hôm qua', 'bi-arrow-up'], ['Doanh thu thuần', '-75,08%', 'So với cùng kỳ tháng trước', 'bi-arrow-down']]
  return <div className="admin-shell admin-sales-dashboard flex min-h-screen bg-[#f7f7f2] text-[var(--color-ink)]"><aside className={`admin-sidebar admin-mobile-drawer fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-[#e5e2d7] bg-white transition-transform duration-300 lg:static ${sidebarOpen ? 'is-open' : ''}`}><div className="flex h-20 items-center justify-between border-b border-[#eeeae0] px-6"><a className="font-display text-lg font-semibold tracking-[.08em] text-[var(--color-ink)]" href="/#home">LINERY <span className="font-body text-xs font-normal tracking-[.18em] text-[var(--color-olive)]">QUẢN TRỊ</span></a><button className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#dedbd0] lg:hidden" type="button" aria-label="Đóng menu quản trị" onClick={() => setSidebarOpen(false)}><i className="bi bi-x-lg" aria-hidden="true" /></button></div><AdminManagementSidebar pathname="/admin" /></aside>{sidebarOpen && <button className="fixed inset-0 z-30 bg-[rgba(31,42,36,.32)] lg:hidden" type="button" aria-label="Đóng menu quản trị" onClick={() => setSidebarOpen(false)} />}<div className="min-w-0 flex-1"><header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-[#e5e2d7] bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8"><div className="flex items-center gap-3"><button className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#dedbd0] lg:hidden" type="button" aria-label="Mở menu quản trị" onClick={() => setSidebarOpen(true)}><i className="bi bi-list" aria-hidden="true" /></button><div><p className="font-body text-xs text-[#8b8d86]">Quản trị</p><h1 className="font-display text-xl font-semibold tracking-tight sm:text-2xl">Tổng quan</h1></div></div><button className="admin-primary-icon inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-olive)] font-display text-sm text-white" type="button" aria-label="Hồ sơ quản trị">K</button></header><main className="mx-auto w-full max-w-[1440px] p-4 sm:p-6 lg:p-8"><div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p className="mb-1 font-body text-xs font-semibold uppercase tracking-[.14em] text-[var(--color-olive)]">BÁN HÀNG</p><h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">Báo cáo doanh thu ngày</h2><p className="mt-1 font-body text-sm text-[#74776f]">Theo dõi doanh thu, đơn hàng và sản phẩm bán chạy trong ngày.</p></div><button className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[#dedbd0] bg-white px-4 font-body text-sm text-[#62655f] hover:border-[var(--color-olive)]" type="button"><i className="bi bi-download" aria-hidden="true" />Xuất báo cáo</button></div><div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]"><div className="min-w-0 space-y-6"><section className="rounded-2xl border border-[#e6e2d7] bg-white p-5 shadow-[0_10px_30px_rgba(31,42,36,.04)] sm:p-6"><h3 className="font-display text-lg font-semibold">Kết quả bán hàng hôm nay</h3><div className="mt-6 grid gap-5 sm:grid-cols-2">{metricCards.map(([label, value, meta, icon], index) => <div className={`flex items-start gap-3 ${index % 2 === 1 ? 'sm:border-l sm:border-[#eeeae0] sm:pl-6' : ''}`} key={`${label}-${index}`}><span className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${index === 2 ? 'bg-[#e9f8ef] text-[#1fa85b]' : index === 3 ? 'bg-[#fff0ee] text-[#df3e3e]' : 'bg-[#eef6ff] text-[#2680d9]'}`}><i className={`bi ${icon}`} aria-hidden="true" /></span><div><p className="font-body text-sm text-[#62655f]">{label}</p><p className="mt-1 font-display text-2xl font-semibold tracking-tight">{value}</p><p className="mt-0.5 font-body text-xs text-[#8b8d86]">{meta}</p></div></div>)}</div></section><section className="rounded-2xl border border-[#e6e2d7] bg-white p-5 shadow-[0_10px_30px_rgba(31,42,36,.04)] sm:p-6"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start"><div><div className="flex flex-wrap items-center gap-2"><h3 className="font-display text-lg font-semibold">Doanh thu thuần</h3><span className="rounded-lg bg-[#eef6ff] px-2.5 py-1 font-body text-lg font-semibold text-[#2680d9]">188.374.626₫</span></div><div className="mt-4 flex flex-wrap gap-5 border-b border-[#eeeae0]" role="tablist" aria-label="Kiểu biểu đồ doanh thu">{[['day','Theo ngày'],['hour','Theo giờ'],['week','Theo thứ']].map(([value,label]) => <button className={`border-b-2 px-0 pb-3 font-body text-sm ${chartMode === value ? 'border-[#2680d9] font-semibold text-[#2680d9]' : 'border-transparent text-[#74776f]'}`} type="button" role="tab" aria-selected={chartMode === value} onClick={() => setChartMode(value as 'day' | 'hour' | 'week')} key={value}>{label}</button>)}</div></div><select className="min-h-10 rounded-xl border border-[#dedbd0] bg-white px-3 font-body text-sm" value={period} onChange={(event) => setPeriod(event.target.value)} aria-label="Khoảng thời gian"><option>Tháng trước</option><option>Tháng này</option><option>7 ngày gần nhất</option></select></div><div className="mt-6 overflow-x-auto"><div className="min-w-[620px]"><div className="flex h-64 items-end gap-2 border-b border-[#d9dfe7] bg-[repeating-linear-gradient(to_bottom,transparent_0,transparent_51px,#e9edf2_52px)] px-2 sm:gap-3">{revenueBars.map((height, index) => <div className="flex h-full flex-1 flex-col justify-end gap-2" key={index}><div className={`w-full rounded-t-sm bg-[#1477df] ${height}`} title={`${String(index + 1).padStart(2, '0')}: doanh thu`} /><span className="font-body text-center text-[11px] text-[#8b8d86]">{String(index + 1).padStart(2, '0')}</span></div>)}</div></div></div></section><section className="rounded-2xl border border-[#e6e2d7] bg-white p-5 shadow-[0_10px_30px_rgba(31,42,36,.04)] sm:p-6"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><h3 className="font-display text-lg font-semibold">Top 10 hàng bán chạy</h3><div className="flex gap-2"><select className="min-h-9 rounded-lg border border-[#dedbd0] bg-white px-2.5 font-body text-xs" aria-label="Tiêu chí xếp hạng"><option>Theo doanh thu thuần</option><option>Theo số lượng</option></select><select className="min-h-9 rounded-lg border border-[#dedbd0] bg-white px-2.5 font-body text-xs" aria-label="Thời gian xếp hạng"><option>Tháng này</option><option>Tháng trước</option></select></div></div><div className="mt-5 space-y-4">{topBooks.map(([title,value,width], index) => <div key={title}><div className="mb-1 flex justify-between gap-3 font-body text-sm"><span className="min-w-0 truncate">{index + 1}. {title}</span><span className="shrink-0 font-semibold text-[#62655f]">{value}</span></div><div className="h-3 rounded-full bg-[#eef1f5]"><div className={`h-3 rounded-full bg-[#1477df] ${width}`} /></div></div>)}</div></section></div><aside className="rounded-2xl border border-[#e6e2d7] bg-white p-5 shadow-[0_10px_30px_rgba(31,42,36,.04)] sm:p-6 xl:sticky xl:top-24 xl:self-start"><div className="flex items-center justify-between border-b border-[#eeeae0] pb-4"><div><h3 className="font-display text-lg font-semibold">Đơn hàng gần đây</h3><p className="mt-1 font-body text-sm text-[#8b8d86]">Các đơn cập nhật mới nhất</p></div><a className="font-body text-sm font-medium text-[#2680d9]" href="/admin/orders">Xem tất cả</a></div><div className="mt-4 divide-y divide-[#eeeae0]">{recentOrders.map(([customer,total,time], index) => <a className="flex gap-3 py-4 first:pt-0 last:pb-0" href="/admin/orders" key={`${customer}-${total}-${index}`}><span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f1f4f8] text-[#7f8995]"><i className="bi bi-bag" aria-hidden="true" /></span><span className="min-w-0 flex-1 font-body text-sm"><span className="block leading-5"><strong className="font-semibold text-[#2680d9]">{customer}</strong> vừa bán đơn hàng với giá trị</span><strong className="block text-base">{total}</strong><small className="mt-1 block text-xs text-[#9a9fa6]">{time}</small></span></a>)}</div></aside></div></main></div></div>
}

function AdminCustomersPage() {
  const [rows, setRows] = useState<AdminCustomerRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useEffect(() => {
    let mounted = true
    void loadAdminCustomers().then((customers) => { if (mounted) setRows(customers) }).catch((reason) => { if (mounted) setError(reason instanceof Error ? reason.message : 'Không tải được khách hàng từ Supabase.') }).finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [])
  return <AdminListShell title="Quản lý khách hàng" section="BÁN HÀNG" description="Hồ sơ khách hàng và số đơn được đọc trực tiếp từ Supabase, không dùng dữ liệu mẫu trên trình duyệt." createHref="/admin" createLabel="Tổng quan"><section className="overflow-hidden rounded-2xl border border-[#e6e2d7] bg-white"><div className="border-b border-[#eeeae0] p-5"><h3 className="font-display text-lg font-semibold">Danh sách khách hàng</h3><p className="mt-1 font-body text-sm text-[#74776f]">{loading ? 'Đang tải dữ liệu thật…' : `${rows.length} khách hàng từ database`}</p></div>{error && <p className="m-5 rounded-xl bg-[#fff4ec] px-4 py-3 font-body text-sm leading-6 text-[#9a4c2d]" role="alert">{error}</p>}{!loading && rows.length === 0 ? <p className="px-5 py-14 text-center font-body text-sm text-[#74776f]">Chưa có hồ sơ khách hàng thật.</p> : <div className="overflow-x-auto"><table className="min-w-[760px] w-full text-left"><thead className="bg-[#fcfbf7]"><tr>{['Tên khách hàng', 'Email', 'Điện thoại', 'Số đơn', 'Ngày tạo'].map((heading) => <th className="px-4 py-3 font-body text-sm font-semibold" key={heading}>{heading}</th>)}</tr></thead><tbody>{rows.map((row) => <tr className="border-t border-[#eeeae0]" key={row.id}><td className="px-4 py-3 font-body text-sm font-medium">{row.name}</td><td className="px-4 py-3 font-body text-sm">{row.email}</td><td className="px-4 py-3 font-body text-sm">{row.phone}</td><td className="px-4 py-3 font-body text-sm">{row.orderCount}</td><td className="px-4 py-3 font-body text-sm text-[#74776f]">{row.createdAt ? new Date(row.createdAt).toLocaleString('vi-VN') : '—'}</td></tr>)}</tbody></table></div>}</section></AdminListShell>
}

function AdminInventoryPage() {
  const [rows, setRows] = useState<AdminInventoryRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useEffect(() => {
    let mounted = true
    void loadAdminInventory().then((inventory) => { if (mounted) setRows(inventory) }).catch((reason) => { if (mounted) setError(reason instanceof Error ? reason.message : 'Không tải được tồn kho từ Supabase.') }).finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [])
  return <AdminListShell title="Quản lý kho" section="BÁN HÀNG" description="Tồn thực tế, số lượng đang giữ và số lượng có thể bán lấy từ catalog thật trong Supabase." createHref="/admin" createLabel="Tổng quan"><section className="overflow-hidden rounded-2xl border border-[#e6e2d7] bg-white"><div className="border-b border-[#eeeae0] p-5"><h3 className="font-display text-lg font-semibold">Tồn kho hiện tại</h3><p className="mt-1 font-body text-sm text-[#74776f]">{loading ? 'Đang tải dữ liệu thật…' : `${rows.length} đầu sách từ database`}</p></div>{error && <p className="m-5 rounded-xl bg-[#fff4ec] px-4 py-3 font-body text-sm leading-6 text-[#9a4c2d]" role="alert">{error}</p>}{!loading && rows.length === 0 ? <p className="px-5 py-14 text-center font-body text-sm text-[#74776f]">Chưa có dữ liệu sách thật.</p> : <div className="overflow-x-auto"><table className="min-w-[900px] w-full text-left"><thead className="bg-[#fcfbf7]"><tr>{['Sản phẩm', 'ISBN', 'Tồn thực tế', 'Đang giữ', 'Có thể bán', 'Giá bán', 'Trạng thái'].map((heading) => <th className="px-4 py-3 font-body text-sm font-semibold" key={heading}>{heading}</th>)}</tr></thead><tbody>{rows.map((row) => <tr className="border-t border-[#eeeae0]" key={row.id}><td className="max-w-[280px] px-4 py-3 font-body text-sm font-medium">{row.title}</td><td className="px-4 py-3 font-body text-sm">{row.isbn || '—'}</td><td className="px-4 py-3 font-body text-sm">{row.inventoryQuantity}</td><td className="px-4 py-3 font-body text-sm">{row.reservedQuantity}</td><td className="px-4 py-3 font-body text-sm font-semibold">{row.availableQuantity}</td><td className="px-4 py-3 font-body text-sm">{formatPrice(row.salePriceVnd)}</td><td className="px-4 py-3 font-body text-sm"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${row.availableQuantity > 0 ? 'bg-[#edf7ef] text-[#39733e]' : 'bg-[#fff0ed] text-[#a33d32]'}`}>{row.availableQuantity > 0 ? 'Còn hàng' : 'Hết hàng'}</span></td></tr>)}</tbody></table></div>}</section></AdminListShell>
}

function AdminOrdersPage() {
  const [rows, setRows] = useState<AdminOrderRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    void loadAdminOrders().then((orders) => {
      if (mounted) setRows(orders)
    }).catch((reason) => {
      if (mounted) setError(reason instanceof Error ? reason.message : 'Không tải được đơn hàng từ Supabase.')
    }).finally(() => {
      if (mounted) setLoading(false)
    })
    return () => { mounted = false }
  }, [])

  const changeStatus = async (row: AdminOrderRow, nextStatus: string) => {
    setUpdatingId(row.id)
    setError('')
    try {
      await updateAdminOrderStatus(row.id, nextStatus)
      setRows((current) => current.map((item) => item.id === row.id ? { ...item, status: nextStatus } : item))
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Không cập nhật được trạng thái đơn hàng.')
    } finally {
      setUpdatingId(null)
    }
  }

  return <AdminListShell title="Quản lý đơn hàng" section="BÁN HÀNG" description="Đơn hàng được đọc từ Supabase; mọi thay đổi trạng thái đi qua RPC có kiểm tra quyền và cập nhật tồn kho." createHref="/admin" createLabel="Tổng quan"><section className="overflow-hidden rounded-2xl border border-[#e6e2d7] bg-white"><div className="border-b border-[#eeeae0] p-5"><h3 className="font-display text-lg font-semibold">Danh sách đơn hàng</h3><p className="mt-1 font-body text-sm text-[#74776f]">{loading ? 'Đang tải dữ liệu thật…' : `${rows.length} đơn hàng từ database`}</p></div>{error && <p className="m-5 rounded-xl bg-[#fff4ec] px-4 py-3 font-body text-sm leading-6 text-[#9a4c2d]" role="alert">{error}</p>}{!loading && rows.length === 0 ? <p className="px-5 py-14 text-center font-body text-sm text-[#74776f]">Chưa có đơn hàng thật trong Supabase.</p> : <div className="overflow-x-auto"><table className="min-w-[900px] w-full text-left"><thead className="bg-[#fcfbf7]"><tr>{['Mã đơn', 'Khách hàng', 'Số sách', 'Tổng tiền', 'Thanh toán', 'Trạng thái', 'Ngày tạo'].map((heading) => <th className="px-4 py-3 font-body text-sm font-semibold" key={heading}>{heading}</th>)}</tr></thead><tbody>{rows.map((row) => <tr className="border-t border-[#eeeae0]" key={row.id}><td className="px-4 py-3 font-body text-sm font-semibold">{row.orderNumber}</td><td className="px-4 py-3 font-body text-sm">{row.customer}</td><td className="px-4 py-3 font-body text-sm">{row.itemCount}</td><td className="px-4 py-3 font-body text-sm">{formatPrice(row.totalVnd)}</td><td className="px-4 py-3 font-body text-sm">{row.paymentStatus}</td><td className="px-4 py-3"><select className="min-h-9 rounded-lg border border-[#dedbd0] bg-white px-2.5 font-body text-sm" value={row.status} disabled={updatingId === row.id} onChange={(event) => void changeStatus(row, event.target.value)} aria-label={`Trạng thái ${row.orderNumber}`}><option value="pending">Chờ xử lý</option><option value="confirmed">Đã xác nhận</option><option value="processing">Đang xử lý</option><option value="shipped">Đã gửi</option><option value="delivered">Đã giao</option><option value="cancelled">Đã hủy</option><option value="refunded">Đã hoàn tiền</option></select></td><td className="px-4 py-3 font-body text-sm text-[#74776f]">{row.createdAt ? new Date(row.createdAt).toLocaleString('vi-VN') : '—'}</td></tr>)}</tbody></table></div>}</section></AdminListShell>
}

function AdminMenusPage() {
  const [rows, setRows] = useState<AdminMenuItemRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [savedId, setSavedId] = useState<string | null>(null)
  const [savingId, setSavingId] = useState<string | null>(null)
  useEffect(() => {
    let mounted = true
    void loadAdminMenuItems().then((items) => { if (mounted) setRows(items) }).catch((reason) => { if (mounted) setError(reason instanceof Error ? reason.message : 'Không tải được menu từ Supabase.') }).finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [])
  const updateRow = (id: string, patch: Partial<AdminMenuItemRow>) => setRows((current) => current.map((row) => row.id === id ? { ...row, ...patch } : row))
  const saveRow = async (row: AdminMenuItemRow) => {
    setSavingId(row.id)
    setSavedId(null)
    setError('')
    try {
      await updateAdminMenuItem(row)
      setSavedId(row.id)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Không lưu được menu.')
    } finally {
      setSavingId(null)
    }
  }
  const menuName = (key: string) => key === 'footer-main' ? 'Menu chân trang' : 'Menu ngang'
  return <AdminListShell title="Quản lý Menu" section="HỆ THỐNG" description="Menu ngang và menu chân trang được đọc/ghi trực tiếp trong Supabase; thay đổi sẽ áp dụng cho website sau lần tải dữ liệu kế tiếp." createHref="/admin" createLabel="Tổng quan"><section className="overflow-hidden rounded-2xl border border-[#e6e2d7] bg-white"><div className="border-b border-[#eeeae0] p-5"><h3 className="font-display text-lg font-semibold">Danh sách mục menu</h3><p className="mt-1 font-body text-sm text-[#74776f]">{loading ? 'Đang tải dữ liệu thật…' : `${rows.length} mục menu từ database`}</p></div>{error && <p className="m-5 rounded-xl bg-[#fff4ec] px-4 py-3 font-body text-sm leading-6 text-[#9a4c2d]" role="alert">{error}</p>}{!loading && rows.length === 0 ? <p className="px-5 py-14 text-center font-body text-sm text-[#74776f]">Chưa có mục menu trong Supabase.</p> : <div className="overflow-x-auto"><table className="min-w-[980px] w-full text-left"><thead className="bg-[#fcfbf7]"><tr>{['Menu', 'Nhãn', 'Đường dẫn', 'Thứ tự', 'Hiển thị', 'Lưu'].map((heading) => <th className="px-4 py-3 font-body text-sm font-semibold" key={heading}>{heading}</th>)}</tr></thead><tbody>{rows.map((row) => <tr className="border-t border-[#eeeae0]" key={row.id}><td className="px-4 py-3 font-body text-sm">{menuName(row.menuKey)}</td><td className="px-4 py-3"><input className="min-h-9 w-40 rounded-lg border border-[#dedbd0] bg-[#fcfbf7] px-2.5 font-body text-sm" value={row.label} onChange={(event) => updateRow(row.id, { label: event.target.value })} /></td><td className="px-4 py-3"><input className="min-h-9 w-64 rounded-lg border border-[#dedbd0] bg-[#fcfbf7] px-2.5 font-body text-sm" value={row.href} onChange={(event) => updateRow(row.id, { href: event.target.value })} /></td><td className="px-4 py-3"><input className="min-h-9 w-20 rounded-lg border border-[#dedbd0] bg-[#fcfbf7] px-2.5 font-body text-sm" type="number" min="0" value={row.sortOrder} onChange={(event) => updateRow(row.id, { sortOrder: Number(event.target.value) })} /></td><td className="px-4 py-3"><input className="h-4 w-4 accent-[var(--color-olive)]" type="checkbox" checked={row.isActive} onChange={(event) => updateRow(row.id, { isActive: event.target.checked })} aria-label={`Hiển thị ${row.label}`} /></td><td className="px-4 py-3"><button className="inline-flex min-h-9 items-center justify-center rounded-lg bg-[var(--color-olive)] px-3 font-body text-sm font-medium text-white disabled:opacity-50" type="button" disabled={savingId === row.id} onClick={() => void saveRow(row)}>{savingId === row.id ? 'Đang lưu…' : savedId === row.id ? 'Đã lưu' : 'Lưu'}</button></td></tr>)}</tbody></table></div>}</section></AdminListShell>
}

function AdminPromotionsPage() {
  const [rows, setRows] = useState<AdminPromotionRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [form, setForm] = useState<AdminPromotionInput>({ code: '', name: '', description: '', discountType: 'percent', discountValue: 10, minimumOrderValue: 0, startsAt: '', endsAt: '', usageLimit: null, isActive: false })

  useEffect(() => {
    let mounted = true
    void loadAdminPromotions().then((promotions) => { if (mounted) setRows(promotions) }).catch((reason) => { if (mounted) setError(reason instanceof Error ? reason.message : 'Không tải được khuyến mãi từ Supabase.') }).finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [])

  const updateForm = <K extends keyof AdminPromotionInput>(key: K, value: AdminPromotionInput[K]) => setForm((current) => ({ ...current, [key]: value }))
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      const created = await createAdminPromotion({ ...form, code: form.code.trim().toUpperCase(), discountValue: Number(form.discountValue), minimumOrderValue: Number(form.minimumOrderValue ?? 0), startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : '', endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : '', usageLimit: form.usageLimit == null || Number.isNaN(Number(form.usageLimit)) ? null : Number(form.usageLimit) })
      setRows((current) => [created, ...current])
      setForm({ code: '', name: '', description: '', discountType: 'percent', discountValue: 10, minimumOrderValue: 0, startsAt: '', endsAt: '', usageLimit: null, isActive: false })
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Không tạo được chương trình khuyến mãi.')
    } finally {
      setSaving(false)
    }
  }
  const toggleActive = async (row: AdminPromotionRow) => {
    setUpdatingId(row.id)
    setError('')
    try {
      await updateAdminPromotionStatus(row.id, !row.isActive)
      setRows((current) => current.map((item) => item.id === row.id ? { ...item, isActive: !item.isActive } : item))
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Không cập nhật được trạng thái khuyến mãi.')
    } finally {
      setUpdatingId(null)
    }
  }
  const formatPromotionValue = (row: AdminPromotionRow) => row.discountType === 'percent' ? `${row.discountValue}%` : formatPrice(row.discountValue)
  const formatDate = (value: string) => value ? new Date(value).toLocaleDateString('vi-VN') : 'Không giới hạn'
  return <AdminListShell title="Chương trình khuyến mãi" section="BÁN HÀNG" description="Mã giảm giá được đọc và ghi trực tiếp trong Supabase; khi áp dụng đơn hàng, RPC (hàm xử lý phía database) sẽ kiểm tra điều kiện và giới hạn lượt dùng." createHref="/admin" createLabel="Tổng quan">
    <section className="rounded-2xl border border-[#e6e2d7] bg-white p-5 shadow-[0_10px_30px_rgba(31,42,36,.04)] sm:p-6">
      <div className="border-b border-[#eeeae0] pb-4"><h3 className="font-display text-lg font-semibold">Tạo chương trình mới</h3><p className="mt-1 font-body text-sm text-[#74776f]">Dữ liệu này sẽ được dùng để kiểm tra voucher ở bước tạo đơn hàng.</p></div>
      <form className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4" onSubmit={submit}>
        <label className="font-body text-sm font-medium">Mã voucher<input className="mt-2 min-h-10 w-full rounded-xl border border-[#dedbd0] bg-[#fcfbf7] px-3 font-body text-sm uppercase" required value={form.code} onChange={(event) => updateForm('code', event.target.value)} placeholder="VD: NEWUP10" /></label>
        <label className="font-body text-sm font-medium">Tên chương trình<input className="mt-2 min-h-10 w-full rounded-xl border border-[#dedbd0] bg-[#fcfbf7] px-3 font-body text-sm" required value={form.name} onChange={(event) => updateForm('name', event.target.value)} placeholder="New & Upcoming" /></label>
        <label className="font-body text-sm font-medium">Loại giảm<select className="mt-2 min-h-10 w-full rounded-xl border border-[#dedbd0] bg-[#fcfbf7] px-3 font-body text-sm" value={form.discountType} onChange={(event) => updateForm('discountType', event.target.value as AdminPromotionInput['discountType'])}><option value="percent">Phần trăm (%)</option><option value="fixed">Số tiền (₫)</option></select></label>
        <label className="font-body text-sm font-medium">Mức giảm<input className="mt-2 min-h-10 w-full rounded-xl border border-[#dedbd0] bg-[#fcfbf7] px-3 font-body text-sm" required min="1" type="number" value={form.discountValue} onChange={(event) => updateForm('discountValue', Number(event.target.value))} /></label>
        <label className="font-body text-sm font-medium">Đơn tối thiểu<input className="mt-2 min-h-10 w-full rounded-xl border border-[#dedbd0] bg-[#fcfbf7] px-3 font-body text-sm" min="0" type="number" value={form.minimumOrderValue ?? 0} onChange={(event) => updateForm('minimumOrderValue', Number(event.target.value))} /></label>
        <label className="font-body text-sm font-medium">Giới hạn lượt dùng<input className="mt-2 min-h-10 w-full rounded-xl border border-[#dedbd0] bg-[#fcfbf7] px-3 font-body text-sm" min="1" type="number" value={form.usageLimit ?? ''} onChange={(event) => updateForm('usageLimit', event.target.value ? Number(event.target.value) : null)} placeholder="Không giới hạn" /></label>
        <label className="font-body text-sm font-medium">Bắt đầu<input className="mt-2 min-h-10 w-full rounded-xl border border-[#dedbd0] bg-[#fcfbf7] px-3 font-body text-sm" type="datetime-local" value={form.startsAt} onChange={(event) => updateForm('startsAt', event.target.value)} /></label>
        <label className="font-body text-sm font-medium">Kết thúc<input className="mt-2 min-h-10 w-full rounded-xl border border-[#dedbd0] bg-[#fcfbf7] px-3 font-body text-sm" type="datetime-local" value={form.endsAt} onChange={(event) => updateForm('endsAt', event.target.value)} /></label>
        <label className="font-body text-sm font-medium md:col-span-2 xl:col-span-3">Mô tả<textarea className="mt-2 min-h-10 w-full rounded-xl border border-[#dedbd0] bg-[#fcfbf7] px-3 py-2 font-body text-sm" rows={2} value={form.description} onChange={(event) => updateForm('description', event.target.value)} placeholder="Điều kiện áp dụng và ghi chú cho quản trị viên" /></label>
        <div className="flex items-end justify-between gap-3"><label className="flex items-center gap-2 pb-2 font-body text-sm"><input className="h-4 w-4 accent-[var(--color-olive)]" type="checkbox" checked={form.isActive} onChange={(event) => updateForm('isActive', event.target.checked)} />Kích hoạt ngay</label><button className="inline-flex min-h-10 items-center justify-center rounded-xl bg-[var(--color-olive)] px-4 font-body text-sm font-medium text-white disabled:opacity-50" type="submit" disabled={saving}>{saving ? 'Đang lưu…' : 'Tạo chương trình'}</button></div>
      </form>
    </section>
    <section className="mt-6 overflow-hidden rounded-2xl border border-[#e6e2d7] bg-white">
      <div className="border-b border-[#eeeae0] p-5"><h3 className="font-display text-lg font-semibold">Danh sách chương trình</h3><p className="mt-1 font-body text-sm text-[#74776f]">{loading ? 'Đang tải dữ liệu thật…' : `${rows.length} chương trình từ database`}</p></div>
      {error && <p className="m-5 rounded-xl bg-[#fff4ec] px-4 py-3 font-body text-sm leading-6 text-[#9a4c2d]" role="alert">{error}</p>}
      {!loading && rows.length === 0 ? <p className="px-5 py-14 text-center font-body text-sm text-[#74776f]">Chưa có chương trình khuyến mãi thật trong Supabase.</p> : <div className="overflow-x-auto"><table className="min-w-[1040px] w-full text-left"><thead className="bg-[#fcfbf7]"><tr>{['Mã', 'Tên chương trình', 'Mức giảm', 'Đơn tối thiểu', 'Thời hạn', 'Đã dùng / giới hạn', 'Trạng thái', 'Thao tác'].map((heading) => <th className="px-4 py-3 font-body text-sm font-semibold" key={heading}>{heading}</th>)}</tr></thead><tbody>{rows.map((row) => <tr className="border-t border-[#eeeae0]" key={row.id}><td className="px-4 py-3 font-body text-sm font-semibold">{row.code}</td><td className="max-w-[240px] px-4 py-3 font-body text-sm"><strong className="block font-medium">{row.name}</strong><span className="text-[#74776f]">{row.description || '—'}</span></td><td className="px-4 py-3 font-body text-sm">{formatPromotionValue(row)}</td><td className="px-4 py-3 font-body text-sm">{formatPrice(row.minimumOrderValue)}</td><td className="px-4 py-3 font-body text-sm text-[#74776f]">{formatDate(row.startsAt)} → {formatDate(row.endsAt)}</td><td className="px-4 py-3 font-body text-sm">{row.usageCount} / {row.usageLimit ?? '∞'}</td><td className="px-4 py-3 font-body text-sm"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${row.isActive ? 'bg-[#edf7ef] text-[#39733e]' : 'bg-[#f1f1ee] text-[#74776f]'}`}>{row.isActive ? 'Đang hoạt động' : 'Đang tắt'}</span></td><td className="px-4 py-3"><button className="inline-flex min-h-8 items-center justify-center rounded-lg border border-[var(--color-olive)] px-2.5 font-body text-xs text-[var(--color-olive-dark)] disabled:opacity-50" type="button" disabled={updatingId === row.id} onClick={() => void toggleActive(row)}>{row.isActive ? 'Tắt' : 'Bật'}</button></td></tr>)}</tbody></table></div>}
    </section>
  </AdminListShell>
}

function AdminReviewsPage() {
  const [status, setStatus] = useState('all')
  const [rows, setRows] = useState<AdminReviewRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  useEffect(() => {
    let mounted = true
    void loadAdminReviews().then((reviews) => { if (mounted) setRows(reviews) }).catch((reason) => { if (mounted) setError(reason instanceof Error ? reason.message : 'Không tải được đánh giá từ Supabase.') }).finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [])
  const filteredRows = status === 'all' ? rows : rows.filter((row) => row.status === status)
  const updateStatus = async (row: AdminReviewRow, nextStatus: 'approved' | 'rejected') => {
    setUpdatingId(row.id)
    setError('')
    try {
      await updateAdminReviewStatus(row.id, nextStatus)
      setRows((current) => current.map((item) => item.id === row.id ? { ...item, status: nextStatus } : item))
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Không cập nhật được đánh giá.')
    } finally {
      setUpdatingId(null)
    }
  }
  const statusLabel = (value: AdminReviewRow['status']) => value === 'approved' ? 'Đã duyệt' : value === 'rejected' ? 'Từ chối' : 'Chờ duyệt'
  return <AdminListShell title="Bình luận & đánh giá" section="NỘI DUNG" description="Kiểm duyệt đánh giá của bạn đọc trước khi hiển thị công khai trên trang chi tiết sách." createHref="/admin" createLabel="Quản trị"><section className="overflow-hidden rounded-2xl border border-[#e6e2d7] bg-white"><div className="flex flex-col justify-between gap-3 border-b border-[#eeeae0] p-5 sm:flex-row sm:items-center"><div><h3 className="font-display text-lg font-semibold">Danh sách đánh giá</h3><p className="mt-1 font-body text-sm text-[#74776f]">{loading ? 'Đang tải dữ liệu thật…' : `${filteredRows.length} / ${rows.length} bản ghi từ database`}</p></div><select className="min-h-10 rounded-xl border border-[#dedbd0] bg-[#fcfbf7] px-3.5 font-body text-sm" value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Lọc trạng thái đánh giá"><option value="all">Tất cả trạng thái</option><option value="pending">Chờ duyệt</option><option value="approved">Đã duyệt</option><option value="rejected">Từ chối</option></select></div>{error && <p className="m-5 rounded-xl bg-[#fff4ec] px-4 py-3 font-body text-sm leading-6 text-[#9a4c2d]" role="alert">{error}</p>}<div className="overflow-x-auto"><table className="min-w-[980px] w-full text-left"><thead className="bg-[#fcfbf7]"><tr>{['Bạn đọc', 'Sách', 'Đánh giá', 'Nội dung', 'Ngày gửi', 'Trạng thái', 'Thao tác'].map((heading) => <th className="px-4 py-3 font-body text-sm font-semibold" key={heading}>{heading}</th>)}</tr></thead><tbody>{filteredRows.map((row) => <tr className="border-t border-[#eeeae0]" key={row.id}><td className="px-4 py-3 font-body text-sm font-medium">{row.reader}</td><td className="px-4 py-3 font-body text-sm">{row.book}</td><td className="px-4 py-3 font-body text-sm tracking-wide text-[var(--color-olive-dark)]">{'★'.repeat(Math.max(0, Math.min(row.rating, 5)))}</td><td className="max-w-[320px] px-4 py-3 font-body text-sm text-[#62655f]"><strong className="block font-medium text-[var(--color-ink)]">{row.title || '—'}</strong><span>{row.body}</span></td><td className="px-4 py-3 font-body text-sm text-[#74776f]">{row.date ? new Date(row.date).toLocaleString('vi-VN') : '—'}</td><td className="px-4 py-3 font-body text-sm"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${row.status === 'approved' ? 'bg-[#edf7ef] text-[#39733e]' : row.status === 'rejected' ? 'bg-[#fff0ed] text-[#a33d32]' : 'bg-[#fff5e8] text-[#a45b16]'}`}>{statusLabel(row.status)}</span></td><td className="px-4 py-3"><div className="flex flex-wrap gap-2"><button className="inline-flex min-h-8 items-center justify-center rounded-lg border border-[#39733e] px-2.5 font-body text-xs text-[#39733e] hover:bg-[#edf7ef] disabled:opacity-50" type="button" disabled={updatingId === row.id} onClick={() => void updateStatus(row, 'approved')}>Duyệt</button><button className="inline-flex min-h-8 items-center justify-center rounded-lg border border-[#a33d32] px-2.5 font-body text-xs text-[#a33d32] hover:bg-[#fff0ed] disabled:opacity-50" type="button" disabled={updatingId === row.id} onClick={() => void updateStatus(row, 'rejected')}>Từ chối</button></div></td></tr>)}</tbody></table></div>{!loading && filteredRows.length === 0 && <p className="px-5 py-12 text-center font-body text-sm text-[#74776f]">Chưa có bản ghi trong trạng thái này.</p>}</section></AdminListShell>
}

function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [dashboardSummary, setDashboardSummary] = useState<AdminDashboardSummary | null>(null)
  const [dashboardError, setDashboardError] = useState('')
  useEffect(() => {
    let active = true
    void loadAdminDashboardSummary().then((summary) => { if (active) setDashboardSummary(summary) }).catch((reason: unknown) => { if (active) setDashboardError(reason instanceof Error ? reason.message : 'Không tải được số liệu Tổng quan từ Supabase.') })
    return () => { active = false }
  }, [])
  useEffect(() => {
    document.body.dataset.adminModule = window.location.pathname
    return () => { delete document.body.dataset.adminModule }
  }, [])
  useEffect(() => {
    if (window.location.pathname === '/admin/website') return
    const sidebar = document.querySelector<HTMLElement>('.admin-sidebar')
    const shell = sidebar?.closest<HTMLElement>('.admin-shell')
    if (!sidebar || !shell || sidebar.querySelector('.admin-sidebar-collapse')) return
    const button = document.createElement('button')
    button.className = 'admin-sidebar-collapse'
    button.type = 'button'
    button.setAttribute('aria-label', 'Thu gọn menu quản trị')
    const icon = document.createElement('i')
    icon.className = 'bi bi-chevron-left'
    icon.setAttribute('aria-hidden', 'true')
    button.append(icon)
    const toggle = () => { const collapsed = shell.classList.toggle('admin-sidebar-collapsed'); icon.className = `bi ${collapsed ? 'bi-chevron-right' : 'bi-chevron-left'}`; button.setAttribute('aria-label', collapsed ? 'Mở rộng menu quản trị' : 'Thu gọn menu quản trị') }
    button.addEventListener('click', toggle)
    sidebar.append(button)
    return () => { button.removeEventListener('click', toggle); button.remove() }
  }, [])

  if (window.location.pathname === '/admin/books/new') return <AdminBookCreatePageV2 />
  if (window.location.pathname.startsWith('/admin/books/report/')) return <AdminBookReportPage bookId={window.location.pathname.split('/').pop() ?? ''} />
  if (window.location.pathname === '/admin/books/categories/new') return <AdminCategoryCreatePageRemote />
  if (window.location.pathname.startsWith('/admin/books/categories/')) return <AdminTaxonomyEditPageRemote id={window.location.pathname.split('/').pop() ?? ''} />
  if (window.location.pathname.startsWith('/admin/books')) return <AdminBooksPageV2 managementView={getAdminBookViewFromPath(window.location.pathname)} />
  if (window.location.pathname === '/admin/customers') return <AdminCustomersPage />
  if (window.location.pathname === '/admin/inventory') return <AdminInventoryPage />
  if (window.location.pathname === '/admin/authors/new') return <AdminAuthorCreatePage pathname={window.location.pathname} />
  if (window.location.pathname === '/admin/authors' || window.location.pathname.startsWith('/admin/authors/')) return <AdminAuthorsRestoredPage pathname={window.location.pathname} />
  if (window.location.pathname === '/admin/reports') return <AdminReportsPage />
  if (window.location.pathname === '/admin/orders') return <AdminOrdersPage />
  if (window.location.pathname === '/admin/promotions') return <AdminPromotionsPage />
  if (window.location.pathname === '/admin/publishers') return <AdminTaxonomyEntityPage kind="publisher" title="Nhà xuất bản" description="Danh sách nhà xuất bản được quản lý trực tiếp trong taxonomy_terms của Supabase." />
  if (window.location.pathname === '/admin/payments') return <AdminPaymentMethodsPage />
  if (window.location.pathname === '/admin/settings/site-data') return <AdminSiteSettingsDataPage />
  if (window.location.pathname === '/admin/settings/admin-users') return <AdminAdminUsersPageSeparated />
  if (window.location.pathname === '/admin/settings/permissions') return <AdminPermissionsPage />
  if (window.location.pathname === '/admin/settings') return <AdminSiteSettingsPage />
  if (window.location.pathname === '/admin/media') return <AdminMediaLibraryPage />
  if (window.location.pathname === '/admin/stores') return <AdminLocationsPage />
  if (window.location.pathname === '/admin/locations') return <AdminLocationsPage />
  if (window.location.pathname === '/admin/chatbot') return <AdminChatbotPromptsPage />
  if (window.location.pathname === '/admin/import-history') return <AdminImportHistoryPage />
  if (window.location.pathname === '/admin/collections') return <AdminHomepageModulesPage />
  if (window.location.pathname === '/admin/news/new') return <AdminNewsCreatePageV2 />
  if (window.location.pathname.startsWith('/admin/news/edit/')) return <AdminNewsCreatePageV2 editSlug={window.location.pathname.split('/').pop() ?? ''} />
  if (window.location.pathname.startsWith('/admin/news/')) return <AdminNewsPreviewPage slug={window.location.pathname.split('/').pop() ?? ''} />
  if (window.location.pathname === '/admin/news') return <AdminNewsPageV2 />
  if (window.location.pathname === '/admin/reviews') return <AdminReviewsPage />
  if (window.location.pathname === '/admin/menus') return <AdminMenusPage />
  if (window.location.pathname === '/admin/website') return <AdminWebsiteConfigPage />
  const moduleConfig = adminModuleConfigs[window.location.pathname]
  if (moduleConfig) return <AdminModulePageV3 pathname={window.location.pathname} config={moduleConfig} />

  return <div className="admin-shell flex min-h-screen bg-[#f7f7f2] text-[var(--color-ink)]">
    <aside id="admin-sidebar" className={`admin-sidebar fixed inset-y-0 left-0 z-40 flex w-72 -translate-x-full flex-col border-r border-[#e5e2d7] bg-white transition-transform duration-300 lg:static lg:translate-x-0 ${sidebarOpen ? 'is-open translate-x-0' : ''}`}>
      <div className="flex h-20 items-center justify-between border-b border-[#eeeae0] px-6">
        <a className="admin-brand-link" href="/#home" aria-label="LineryBooks"><AdminBrand /></a>
        <button className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#dedbd0] text-[var(--color-ink)] lg:hidden" type="button" aria-label="Close admin navigation" onClick={() => setSidebarOpen(false)}><i className="bi bi-x-lg" aria-hidden="true" /></button>
      </div>
      <AdminManagementSidebar pathname={window.location.pathname} />
      <div className="border-t border-[#eeeae0] p-4">
        <a className="flex items-center gap-3 rounded-xl px-3 py-2.5 font-body text-sm text-[#62655f] transition-colors hover:bg-[#f5f3ec] hover:text-[var(--color-ink)]" href="/#home"><i className="bi bi-arrow-left" aria-hidden="true" />Về cửa hàng</a>
      </div>
    </aside>
    {sidebarOpen && <button className="fixed inset-0 z-30 bg-[rgba(31,42,36,.32)] lg:hidden" type="button" aria-label="Close admin navigation" onClick={() => setSidebarOpen(false)} />}
    <div className="min-w-0 flex-1">
      <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-[#e5e2d7] bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#dedbd0] text-[var(--color-ink)] lg:hidden" type="button" aria-label="Open admin navigation" onClick={() => setSidebarOpen(true)}><i className="bi bi-list" aria-hidden="true" /></button>
          <div><p className="font-body text-xs text-[#8b8d86]">Quản trị</p><h1 className="font-display text-xl font-semibold tracking-tight sm:text-2xl">Tổng quan</h1></div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <AdminNotificationButton />
          <button className="hidden h-10 items-center gap-2 rounded-xl border border-[#dedbd0] px-3 font-body text-sm text-[#62655f] sm:inline-flex" type="button"><i className="bi bi-question-circle" aria-hidden="true" />Trợ giúp</button>
          <button className="admin-primary-icon inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-olive)] font-display text-sm text-white" type="button" aria-label="Hồ sơ quản trị">K</button>
        </div>
      </header>
      <main className="mx-auto w-full max-w-[1440px] p-4 sm:p-6 lg:p-8">
        <section className="mb-6 rounded-2xl border border-[#e6e2d7] bg-white p-5 shadow-[0_10px_30px_rgba(31,42,36,.04)] sm:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
            <div><p className="mb-2 font-body text-xs font-semibold uppercase tracking-[.14em] text-[var(--color-olive)]">Linery Books</p><h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">Chào buổi sáng, Kim</h2><p className="mt-2 max-w-xl font-body text-sm leading-6 text-[#74776f]">Không gian quản trị đã sẵn sàng. Kết nối Supabase để bắt đầu quản lý danh mục sách, đơn hàng, tác giả và nội dung biên tập.</p></div>
          <a className="admin-primary-action inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--color-olive)] px-5 font-body text-sm font-medium text-white transition-colors hover:bg-[var(--color-olive-dark)]" href="/admin/books"><i className="bi bi-plus-lg mr-2" aria-hidden="true" />Thêm cuốn sách đầu tiên</a>
          </div>
        </section>
        {dashboardError && <p className="mb-6 rounded-xl border border-[#ebc4bd] bg-[#fff5f2] px-4 py-3 font-body text-sm text-[#a33d32]" role="alert">{dashboardError}</p>}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Số liệu cửa hàng từ Supabase">
          {[
            ['Tổng số sách', dashboardSummary ? String(dashboardSummary.bookCount) : '…', 'Bản ghi trong Supabase', 'bi-book', 'books'],
            ['Đơn hàng', dashboardSummary ? String(dashboardSummary.orderCount) : '…', 'Bản ghi trong Supabase', 'bi-bag', 'orders'],
            ['Tác giả', dashboardSummary ? String(dashboardSummary.creatorCount) : '…', 'Bản ghi trong Supabase', 'bi-people', 'creators'],
            ['Bài viết tin tức', dashboardSummary ? String(dashboardSummary.newsCount) : '…', 'Bản ghi trong Supabase', 'bi-newspaper', 'news'],
          ].map(([label,value,meta,icon,tone]) => <article className="rounded-2xl border border-[#e6e2d7] bg-white p-5" key={label}><div className="flex items-start justify-between"><div><p className={`font-body text-sm ${label === 'Đơn hàng' ? 'font-semibold text-[var(--color-ink)]' : 'text-[#74776f]'}`}>{label}</p><p className="mt-3 font-display text-2xl font-semibold tracking-tight">{value}</p></div><span className={`admin-dashboard-metric-icon is-${tone}`}><i className={`bi ${icon}`} aria-hidden="true" /></span></div><p className="admin-metric-meta mt-4 font-body text-sm text-[#74776f]">{meta}</p></article>)}
        </section>
        <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(300px,.85fr)]">
          <article className="rounded-2xl border border-[#e6e2d7] bg-white p-5 sm:p-6"><div className="flex items-center justify-between gap-4"><div><h2 className="font-display text-lg font-semibold">Đơn hàng gần đây</h2><p className="mt-1 font-body text-sm text-[#8b8d86]">Bản ghi mới nhất từ Supabase.</p></div><a className="font-body text-sm text-[var(--color-olive)]" href="/admin/orders">Xem tất cả</a></div>{!dashboardSummary ? <p className="mt-6 rounded-xl border border-dashed border-[#d9d6c9] bg-[#fcfbf7] px-5 py-10 text-center font-body text-sm text-[#85877f]">Đang tải dữ liệu thật…</p> : dashboardSummary.recentOrders.length === 0 ? <div className="mt-6 rounded-xl border border-dashed border-[#d9d6c9] bg-[#fcfbf7] px-5 py-10 text-center"><i className="bi bi-inbox text-3xl text-[var(--color-olive)]" aria-hidden="true" /><h3 className="mt-3 font-display text-lg font-semibold">Chưa có đơn hàng thật</h3><p className="mx-auto mt-2 max-w-sm font-body text-sm leading-6 text-[#85877f]">Khi khách đặt hàng, thông tin sẽ được hiển thị tại đây.</p></div> : <div className="mt-6 overflow-x-auto"><table className="min-w-[700px] w-full text-left"><thead className="bg-[#fcfbf7]"><tr>{['Mã đơn','Khách hàng','Số sách','Tổng tiền','Trạng thái','Ngày tạo'].map((heading) => <th className="px-3 py-2 font-body text-xs font-semibold" key={heading}>{heading}</th>)}</tr></thead><tbody>{dashboardSummary.recentOrders.slice(0, 8).map((order) => <tr className="border-t border-[#eeeae0]" key={order.id}><td className="px-3 py-3 font-body text-sm font-semibold">{order.orderNumber}</td><td className="px-3 py-3 font-body text-sm">{order.customer}</td><td className="px-3 py-3 font-body text-sm">{order.itemCount}</td><td className="px-3 py-3 font-body text-sm">{formatPrice(order.totalVnd)}</td><td className="px-3 py-3 font-body text-sm">{order.status}</td><td className="px-3 py-3 font-body text-xs text-[#74776f]">{order.createdAt ? new Date(order.createdAt).toLocaleString('vi-VN') : '—'}</td></tr>)}</tbody></table></div>}</article>
          <article className="rounded-2xl border border-[#e6e2d7] bg-white p-5 sm:p-6"><h2 className="font-display text-lg font-semibold">Bắt đầu thiết lập</h2><p className="mt-1 font-body text-sm text-[#8b8d86]">Thiết lập cửa hàng theo từng bước.</p><ol className="mt-6 space-y-4">{[['01','Tạo danh mục sách','Thêm sách, bìa, giá và các phân loại.','/admin/books'],['02','Thêm tác giả','Tạo trang tác giả và kết nối các tác phẩm đã chọn.','/admin/authors'],['03','Đăng bài viết tin tức','Chia sẻ ghi chú biên tập và gợi ý đọc sách.','/admin/news']].map(([number,title,description,href]) => <li className="flex gap-3" key={number}><span className="inline-flex h-8 w-8 flex-none items-center justify-center rounded-full bg-[var(--color-olive)] font-body text-xs font-semibold text-white">{number}</span><div className="min-w-0"><a className="font-display text-sm font-semibold hover:text-[var(--color-olive)]" href={href}>{title}</a><p className="mt-1 font-body text-sm leading-5 text-[#85877f]">{description}</p></div></li>)}</ol></article>
        </section>
      </main>
    </div>
  </div>
}

export function App() {
  const [welcomeOpen, setWelcomeOpen] = useState(() => isEnhancedVariant && window.localStorage.getItem(welcomeStorageKey) !== 'true')
  const [language, setLanguage] = useState<'en' | 'vi'>(() => window.localStorage.getItem('linery-language') === 'vi' ? 'vi' : 'en')
  const [menuOpen, setMenuOpen] = useState(false)
  const [view, setView] = useState<View>(() => getViewFromPath(window.location.pathname, window.location.hash))
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [accountTab, setAccountTab] = useState<AccountTab>('profile')
  const [accountMenuOpen, setAccountMenuOpen] = useState(false)
  const [writerFilter, setWriterFilter] = useState<WriterDirectoryFilter>(() => getWriterFilterFromSearch(window.location.search))
  const [searchQuery, setSearchQuery] = useState(() => new URLSearchParams(window.location.search).get('query') ?? '')
  const [selectedAuthor, setSelectedAuthor] = useState(() => getAuthorFromPath(window.location.pathname))
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(() => getNewsFromPath(window.location.pathname))
  const [shopOpen, setShopOpen] = useState(false)
  const [writersOpen, setWritersOpen] = useState(false)
  const [heroMotionOpen, setHeroMotionOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(() => getProductFromPath(window.location.pathname))
  const [selectedCollection, setSelectedCollection] = useState<string | null>(() => getCollectionTitleFromPath(window.location.pathname))
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [cartPulse, setCartPulse] = useState(false)
  const [wishlistTitles, setWishlistTitles] = useState<string[]>(() => {
    try { return JSON.parse(window.localStorage.getItem('linery-wishlist') ?? '[]') as string[] } catch { return [] }
  })
  const [quickViewOpen, setQuickViewOpen] = useState(false)
  const [quickViewAvailable, setQuickViewAvailable] = useState(() => window.matchMedia('(min-width: 1101px)').matches)
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [catalogLoading, setCatalogLoading] = useState(true)
  const [catalogError, setCatalogError] = useState<string | null>(null)
  const [catalogVersion, refreshPublicCatalog] = useState(0)
  const [publicMenuItems, setPublicMenuItems] = useState<PublicMenuItem[]>([])
  const [publicBanners, setPublicBanners] = useState<PublicBanner[]>([])
  const [publicSiteSettings, setPublicSiteSettings] = useState<PublicSiteSettings>({})
  const previewCloseTimer = useRef<number | null>(null)
  const cartPulseTimer = useRef<number | null>(null)
  const edgeSwipeStart = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    let active = true
    void loadPublicMenuItems().then((items) => { if (active && items) setPublicMenuItems(items) }).catch(() => undefined)
    return () => { active = false }
  }, [])

  useEffect(() => {
    let active = true
    void loadPublicBanners().then((banners) => { if (active && banners) setPublicBanners(banners) }).catch(() => undefined)
    return () => { active = false }
  }, [])

  useEffect(() => {
    let active = true
    void loadPublicSiteSettings().then((settings) => { if (active && settings) setPublicSiteSettings(settings) }).catch(() => undefined)
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (!supabase) return undefined
    let mounted = true
    void supabase.auth.getSession().then(({ data }) => {
      if (mounted) setIsAuthenticated(Boolean(data.session?.user))
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) setIsAuthenticated(Boolean(session?.user))
    })
    return () => { mounted = false; listener.subscription.unsubscribe() }
  }, [])

  useEffect(() => {
    if (!supabase || !isAuthenticated) return undefined
    let cancelled = false
    void loadRemoteCart().then((remoteItems) => {
      if (cancelled || !remoteItems) return
      const byId = new Map(products.map((product) => [product.id, product]))
      const restored = remoteItems.flatMap((item) => {
        const product = byId.get(item.bookId)
        return product ? [{ product, quantity: item.quantity }] : []
      })
      // The remote cart is authoritative for signed-in customers, including
      // the empty state after the last item was removed on another device.
      setCartItems(restored)
    }).catch((error) => console.warn('Supabase cart unavailable.', error))
    return () => { cancelled = true }
  }, [catalogVersion, isAuthenticated])

  useEffect(() => {
    if (!supabase || !isAuthenticated) return undefined
    let cancelled = false
    void loadRemoteWishlist().then((bookIds) => {
      if (cancelled || !bookIds) return
      const titleById = new Map(products.map((product) => [product.id, product.title]))
      const titles = bookIds.map((bookId) => titleById.get(bookId)).filter((title): title is string => Boolean(title))
      setWishlistTitles(titles)
      window.localStorage.setItem('linery-wishlist', JSON.stringify(titles))
    }).catch((error) => console.warn('Supabase wishlist unavailable.', error))
    return () => { cancelled = true }
  }, [catalogVersion, isAuthenticated])

  useEffect(() => {
    let cancelled = false
    const path = window.location.pathname
    const isAdminPath = path.startsWith('/admin')
    const catalogNotNeeded = ['/login', '/register', '/forgot-password', '/password-reset-sent', '/reset-password', '/password-reset-complete', '/account'].includes(path)
    if (isAdminPath || catalogNotNeeded) {
      setCatalogLoading(false)
      return () => { cancelled = true }
    }

    products = []
    artbookProducts = []
    limitedProducts = []
    catalogProducts = []
    setCatalogError(null)
    const cachedCatalog = getCachedPublicCatalogProducts()
    if (cachedCatalog?.length) {
      applyPublicCatalog(cachedCatalog)
      setSelectedProduct(getProductFromPath(window.location.pathname))
      setSelectedAuthor(getAuthorFromPath(window.location.pathname))
      setSelectedNews(getNewsFromPath(window.location.pathname))
      setCatalogLoading(false)
      refreshPublicCatalog((value) => value + 1)
    }
    const loadFullCatalog = () => loadPublicCatalogProducts().then((records) => {
      if (cancelled) return
      if (!records?.length) {
        setCatalogError('Chưa có dữ liệu sách từ backend để hiển thị.')
      } else {
        applyPublicCatalog(records)
      }
      setSelectedProduct(getProductFromPath(window.location.pathname))
      setSelectedAuthor(getAuthorFromPath(window.location.pathname))
      setSelectedNews(getNewsFromPath(window.location.pathname))
      setView(getViewFromPath(window.location.pathname, window.location.hash))
      setCatalogLoading(false)
      refreshPublicCatalog((value) => value + 1)
    }).catch((error) => {
      console.warn('Supabase catalog unavailable.', error)
      products = []
      artbookProducts = []
      limitedProducts = []
      catalogProducts = []
      if (!cancelled) {
        setCatalogError('Không tải được dữ liệu sách từ backend.')
        setCatalogLoading(false)
        refreshPublicCatalog((value) => value + 1)
      }
    })

    // The complete catalog already contains homepage module assignments. One
    // request path avoids the previous homepage-then-catalog waterfall.
    void loadFullCatalog().catch(() => undefined)

    const needsCreators = path === '/search' || path === '/authors' || path.startsWith('/authors/') || path === '/creators' || path.startsWith('/creators/')
    if (needsCreators) loadPublicCreatorProfiles().then((profiles) => {
      if (cancelled || !profiles) return
      runtimeAuthorProfiles = Object.fromEntries(profiles.map((profile) => [profile.name, profile]))
      const makeWriterColumns = (names: string[]): MenuColumn[] => {
        const grouped = new Map<string, string[]>()
        names.filter(Boolean).sort((first, second) => first.localeCompare(second, undefined, { sensitivity: 'base' })).forEach((name) => {
          const eyebrow = name.trim().charAt(0).toUpperCase() || '#'
          grouped.set(eyebrow, [...(grouped.get(eyebrow) ?? []), name])
        })
        return [...grouped.entries()].map(([eyebrow, links]) => ({ eyebrow, links }))
      }
      runtimeAuthorColumns = makeWriterColumns(profiles.filter((profile) => profile.roles.includes('author')).map((profile) => profile.name))
      runtimeTranslatorColumns = makeWriterColumns(profiles.filter((profile) => profile.roles.includes('translator')).map((profile) => profile.name))
      runtimeIllustratorColumns = makeWriterColumns(profiles.filter((profile) => profile.roles.includes('illustrator')).map((profile) => profile.name))
      if (path.startsWith('/authors/') || path.startsWith('/creators/')) {
        const slug = path.split('/').pop() ?? ''
        const matchedProfile = profiles.find((profile) => profile.slug === slug)
        if (matchedProfile) setSelectedAuthor(matchedProfile.name)
      }
      refreshPublicCatalog((value) => value + 1)
    }).catch(() => undefined)

    const needsNews = path === '/' || path === '/news' || path.startsWith('/news/')
    if (needsNews) loadPublicNewsPosts().then((news) => {
      if (cancelled || !news) return
      applyPublicNews(news)
      if (path.startsWith('/news/')) setSelectedNews(getNewsFromPath(path))
      refreshPublicCatalog((value) => value + 1)
    }).catch(() => undefined)
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    const syncRoute = () => {
      setSearchQuery(new URLSearchParams(window.location.search).get('query') ?? '')
      setWriterFilter(getWriterFilterFromSearch(window.location.search))
      setSelectedAuthor(getAuthorFromPath(window.location.pathname))
      setSelectedNews(getNewsFromPath(window.location.pathname))
      setSelectedProduct(getProductFromPath(window.location.pathname))
      setSelectedCollection(getCollectionTitleFromPath(window.location.pathname))
      setView(getViewFromPath(window.location.pathname, window.location.hash))
    }
    window.addEventListener('popstate', syncRoute)
    window.addEventListener('hashchange', syncRoute)
    return () => {
      window.removeEventListener('popstate', syncRoute)
      window.removeEventListener('hashchange', syncRoute)
    }
  }, [])

  useEffect(() => {
    document.body.classList.toggle('menu-open', menuOpen)
    return () => document.body.classList.remove('menu-open')
  }, [menuOpen])

  const handleEdgePointerDown = (event: React.PointerEvent<HTMLSpanElement>) => {
    const isMobileViewport = window.matchMedia('(max-width: 1100px)').matches
    if (event.pointerType === 'touch' || (event.pointerType === 'mouse' && isMobileViewport)) edgeSwipeStart.current = { x: event.clientX, y: event.clientY }
  }
  const handleEdgePointerMove = (event: React.PointerEvent<HTMLSpanElement>) => {
    const start = edgeSwipeStart.current
    if (!start) return
    const distanceX = event.clientX - start.x
    const distanceY = event.clientY - start.y
    if (distanceX > 10 && Math.abs(distanceX) > Math.abs(distanceY) * 1.2) event.preventDefault()
  }
  const handleEdgePointerUp = (event: React.PointerEvent<HTMLSpanElement>) => {
    const start = edgeSwipeStart.current
    edgeSwipeStart.current = null
    if (!start) return
    const distanceX = event.clientX - start.x
    const distanceY = event.clientY - start.y
    if (distanceX > 64 && Math.abs(distanceX) > Math.abs(distanceY) * 1.2) setMenuOpen(true)
  }

  useEffect(() => {
    document.body.classList.toggle('linery-enhanced', isEnhancedVariant)
    document.body.classList.toggle('linery-classic', !isEnhancedVariant)
    return () => {
      document.body.classList.remove('linery-enhanced')
      document.body.classList.remove('linery-classic')
    }
  }, [])

  useEffect(() => {
    document.body.classList.toggle('welcome-open', welcomeOpen)
    return () => document.body.classList.remove('welcome-open')
  }, [welcomeOpen])

  useEffect(() => {
    document.body.classList.toggle('login-open', view === 'login' || view === 'register' || view === 'forgot-password' || view === 'password-reset-sent' || view === 'reset-password' || view === 'password-reset-complete')
    return () => document.body.classList.remove('login-open')
  }, [view])

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1101px)')
    const syncQuickViewAvailability = () => setQuickViewAvailable(mediaQuery.matches)
    syncQuickViewAvailability()
    mediaQuery.addEventListener('change', syncQuickViewAvailability)
    return () => mediaQuery.removeEventListener('change', syncQuickViewAvailability)
  }, [])

  useEffect(() => {
    if (!quickViewAvailable && quickViewOpen) {
      setPreviewProduct(null)
      setQuickViewOpen(false)
    }
  }, [quickViewAvailable, quickViewOpen])

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 420)
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const selectLanguage = (language: 'en' | 'vi') => {
    window.localStorage.setItem('linery-language', language)
    window.localStorage.setItem(welcomeStorageKey, 'true')
    setLanguage(language)
    setWelcomeOpen(false)
  }

  const navigateTo = (path: string) => {
    if (`${window.location.pathname}${window.location.search}` !== path) window.history.pushState({}, '', path)
  }

  const showShop = () => {
    navigateTo('/#home')
    setView('home')
    setShopOpen(true)
    setWritersOpen(false)
    setHeroMotionOpen(true)
    setMenuOpen(false)
  }

  const showHome = () => {
    navigateTo('/#home')
    setView('home')
    setShopOpen(false)
    setWritersOpen(false)
    setHeroMotionOpen(false)
    setMenuOpen(false)
  }

  const showCollection = (title: string) => {
    navigateTo(`/collections/${collectionSlug(title)}`)
    setSelectedCollection(title)
    setView('collection')
    setShopOpen(false)
    setMenuOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const showLogin = () => {
    navigateTo('/#login')
    setView('login')
  }

  const showAccount = () => {
    navigateTo('/#account')
    setView('account')
    setMenuOpen(false)
  }

  const completeLogin = async (email: string, password: string) => {
    if (!supabase) throw new Error('Supabase chưa được cấu hình cho môi trường này.')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw new Error(error.message)
    setIsAuthenticated(true)
    showAccount()
  }

  const completeRegister = async (email: string, password: string, username: string) => {
    if (!supabase) throw new Error('Supabase chưa được cấu hình cho môi trường này.')
    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { username, display_name: username } } })
    if (error) throw new Error(error.message)
    if (data.session) { setIsAuthenticated(true); showAccount(); return }
    throw new Error('Đăng ký đã tạo tài khoản nhưng chưa có phiên đăng nhập. Hãy kiểm tra email xác nhận rồi đăng nhập lại.')
  }

  const logout = () => {
    void supabase?.auth.signOut()
    setIsAuthenticated(false)
    showHome()
  }

  const showRegister = () => {
    navigateTo('/#register')
    setView('register')
  }

  const showForgotPassword = () => {
    navigateTo('/#forgot-password')
    setView('forgot-password')
  }

  const showPasswordResetSent = () => {
    navigateTo('/#password-reset-sent')
    setView('password-reset-sent')
  }

  const sendPasswordReset = async (email: string) => {
    if (!supabase) throw new Error('Supabase chưa được cấu hình cho môi trường này.')
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/#reset-password` })
    if (error) throw new Error(error.message)
    showPasswordResetSent()
  }

  const showResetPassword = () => {
    navigateTo('/#reset-password')
    setView('reset-password')
  }

  const showPasswordResetComplete = () => {
    navigateTo('/#password-reset-complete')
    setView('password-reset-complete')
  }

  const completePasswordReset = async (password: string) => {
    if (!supabase) throw new Error('Supabase chưa được cấu hình cho môi trường này.')
    const { error } = await supabase.auth.updateUser({ password })
    if (error) throw new Error(error.message)
    showPasswordResetComplete()
  }

  const showAuthors = (filter: WriterDirectoryFilter = 'all') => {
    navigateTo(filter === 'all' ? '/creators' : `/creators?type=${filter}`)
    setWriterFilter(filter)
    setView('authors')
    setShopOpen(false)
    setWritersOpen(false)
    setMenuOpen(false)
  }

  const showAllBooks = () => {
    navigateTo('/all-books')
    setView('all-books')
    setShopOpen(false)
    setMenuOpen(false)
  }

  const showCategory = (category: string) => {
    navigateTo(`/all-books?category=${encodeURIComponent(category.toLowerCase().replaceAll(' ', '-'))}`)
    setView('all-books')
    setShopOpen(false)
    setMenuOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const showCart = () => {
    navigateTo('/cart')
    setView('cart')
    setShopOpen(false)
    setMenuOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const showCheckout = () => {
    navigateTo('/checkout')
    setView('checkout')
    setShopOpen(false)
    setMenuOpen(false)
    setQuickViewOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const showSearch = (query: string) => {
    const trimmedQuery = query.trim()
    if (!trimmedQuery) return
    navigateTo(`/search?query=${encodeURIComponent(trimmedQuery)}`)
    setSearchQuery(trimmedQuery)
    setView('search')
    setShopOpen(false)
    setMenuOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const showNews = () => {
    navigateTo('/news')
    setSelectedNews(null)
    setView('news')
    setShopOpen(false)
    setMenuOpen(false)
  }

  const showNewsDetail = (item: NewsItem) => {
    navigateTo(`/news/${item.slug}`)
    setSelectedNews(item)
    setView('news-detail')
    setShopOpen(false)
    setMenuOpen(false)
  }

  const showAuthor = (author: string) => {
    navigateTo(`/creators/${authorSlug(author)}`)
    setSelectedAuthor(author)
    setView('author')
    setShopOpen(false)
    setMenuOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const showDetail = (product: Product) => {
    if (previewCloseTimer.current !== null) window.clearTimeout(previewCloseTimer.current)
    setPreviewProduct(null)
    setQuickViewOpen(false)
    navigateTo(`/books/${productSlug(product.title)}`)
    setSelectedProduct(product)
    setView('detail')
    setShopOpen(false)
    setMenuOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const animateProductToCart = (product: Product, source?: HTMLElement) => {
    const target = document.querySelector('.cart-button') as HTMLElement | null
    if (!target || !source) return
    const sourceRect = source.getBoundingClientRect()
    const targetRect = target.getBoundingClientRect()
    const flyer = document.createElement('img')
    flyer.className = 'cart-flyer'
    flyer.src = product.image
    flyer.alt = ''
    flyer.setAttribute('aria-hidden', 'true')
    document.body.appendChild(flyer)
    const startX = sourceRect.left + (sourceRect.width - 64) / 2
    const startY = sourceRect.top + (sourceRect.height - 96) / 2
    const targetX = targetRect.left + targetRect.width / 2 - 32
    const targetY = targetRect.top + targetRect.height / 2 - 48
    const animation = flyer.animate([
      { transform: `translate(${startX}px, ${startY}px) scale(1)`, opacity: 1 },
      { transform: `translate(${targetX}px, ${targetY}px) scale(.18)`, opacity: .25 },
    ], { duration: 720, easing: 'cubic-bezier(.22,.61,.36,1)', fill: 'forwards' })
    animation.finished.then(() => flyer.remove()).catch(() => flyer.remove())
    setCartPulse(true)
    if (cartPulseTimer.current !== null) window.clearTimeout(cartPulseTimer.current)
    cartPulseTimer.current = window.setTimeout(() => setCartPulse(false), 560)
  }

  const addToCart = (product: Product, source?: HTMLElement) => {
    if (product.available === false) { emitFloatingNotice('error', 'Sách hiện đã hết hàng.'); return }
    setCartItems((items) => {
      const key = productKey(product)
      const existing = items.find((item) => productKey(item.product) === key)
      const quantity = (existing?.quantity ?? 0) + 1
      if (isAuthenticated && product.id) void saveRemoteCartItem(product.id, quantity, getPriceValue(product.price)).catch((error) => emitFloatingNotice('error', error instanceof Error ? error.message : 'Không đồng bộ được giỏ hàng.'))
      return existing ? items.map((item) => productKey(item.product) === key ? { ...item, quantity } : item) : [...items, { product, quantity: 1 }]
    })
    animateProductToCart(product, source)
    emitFloatingNotice('success', `Đã thêm “${product.title}” vào giỏ hàng.`)
  }
  const toggleWishlist = (product: Product) => {
    setWishlistTitles((titles) => {
      const nextTitles = titles.includes(product.title) ? titles.filter((title) => title !== product.title) : [...titles, product.title]
      window.localStorage.setItem('linery-wishlist', JSON.stringify(nextTitles))
      if (product.id && isAuthenticated) void toggleRemoteWishlist(product.id).catch((error) => console.warn('Could not save wishlist item.', error))
      return nextTitles
    })
  }
  const isWishlisted = (product: Product) => wishlistTitles.includes(product.title)
  const removeFromCart = (key: string) => setCartItems((items) => {
    const item = items.find((entry) => productKey(entry.product) === key)
    if (isAuthenticated && item?.product.id) void saveRemoteCartItem(item.product.id, 0, getPriceValue(item.product.price)).catch((error) => emitFloatingNotice('error', error instanceof Error ? error.message : 'Không xóa được sách khỏi giỏ hàng.'))
    return items.filter((entry) => productKey(entry.product) !== key)
  })
  const changeCartQuantity = (key: string, delta: number) => setCartItems((items) => items.map((item) => {
    if (productKey(item.product) !== key) return item
    const quantity = Math.max(1, item.quantity + delta)
    if (isAuthenticated && item.product.id) void saveRemoteCartItem(item.product.id, quantity, getPriceValue(item.product.price)).catch((error) => emitFloatingNotice('error', error instanceof Error ? error.message : 'Không cập nhật được giỏ hàng.'))
    return { ...item, quantity }
  }))
  const createOrder = async (input: { fulfillmentMethod: FulfillmentMethod; paymentMethod: PaymentMethod; shippingAddress: Record<string, string>; deliveryNotes: string; guestEmail: string; promotionCode?: string }) => {
    if (!supabase) throw new Error('Hệ thống đặt hàng chưa kết nối Supabase. Vui lòng thử lại sau khi backend sẵn sàng.')
    const { data } = await supabase.auth.getSession()
    if (!data.session?.user) throw new Error('Vui lòng đăng nhập trước khi đặt hàng.')
    const result = await createRemoteOrder(input)
    if (!result) throw new Error('Dịch vụ đặt hàng chưa được cấu hình.')
    setCartItems([])
    emitFloatingNotice('success', 'Đặt hàng thành công. Cảm ơn bạn đã mua sách.')
  }
  const buyNow = (product: Product) => {
    if (product.available === false) return
    addToCart(product)
    setQuickViewOpen(false)
    showCheckout()
  }
  const toggleQuickView = () => {
    if (quickViewOpen) {
      if (previewCloseTimer.current !== null) window.clearTimeout(previewCloseTimer.current)
      setPreviewProduct(null)
      setQuickViewOpen(false)
      return
    }
    setPreviewProduct(null)
    setQuickViewOpen(true)
  }
  const openPreview = (product: Product) => {
    if (previewCloseTimer.current !== null) window.clearTimeout(previewCloseTimer.current)
    setQuickViewOpen(true)
    setPreviewProduct(product)
  }
  const schedulePreviewClose = () => undefined
  const selectQuickView = (product: Product) => {
    setQuickViewOpen(true)
    setPreviewProduct(product)
  }
  const closePreview = () => {
    if (previewCloseTimer.current !== null) window.clearTimeout(previewCloseTimer.current)
    setPreviewProduct(null)
    setQuickViewOpen(false)
  }

  const isEmagazineView = view === 'news-detail' && selectedNews?.contentType === 'emagazine'

  if (view === 'admin') return <><FloatingNoticeHost /><SeoHead view={view} product={selectedProduct} news={selectedNews} author={selectedAuthor || 'Edward W. Said'} language={language} /><AdminAuthGate requiredPermission={getAdminPermissionForPath(window.location.pathname)}>{window.location.pathname === '/admin' ? <AdminSalesDashboardRemote /> : <AdminDashboard />}{window.location.pathname !== '/admin/chatbot' && <ChatbotWidget adminMode />}</AdminAuthGate></>

  if (view === 'book-reader') {
    return <>
      <SeoHead view={view} product={selectedProduct} news={selectedNews} author={selectedAuthor || 'Edward W. Said'} language={language} />
      <BookReaderPage product={selectedProduct ?? products[0]} onBack={() => window.location.assign(`/books/${selectedProduct?.slug || productSlug(selectedProduct?.title || products[0]?.title || '')}`)} />
    </>
  }

  return <>
    <FloatingNoticeHost />
    <SeoHead view={view} product={selectedProduct} news={selectedNews} author={selectedAuthor || 'Edward W. Said'} language={language} />
    {isEnhancedVariant && welcomeOpen && <WelcomeScreen onSelectLanguage={selectLanguage} />}
    <div id="top" className={`page-shell ${quickViewAvailable && quickViewOpen ? 'utility-panel-active' : ''}`}>
    {catalogError && !['login', 'register', 'forgot-password', 'password-reset-sent', 'reset-password', 'password-reset-complete'].includes(view) && <div className="catalog-backend-notice" role="status">{catalogError}</div>}
    {!isEmagazineView && <Header cartCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)} cartPulse={cartPulse} menuOpen={menuOpen} onMenu={() => setMenuOpen(!menuOpen)} onHome={showHome} onLogin={view === 'account' || isAuthenticated ? () => { showAccount(); setAccountMenuOpen((open) => !open) } : showLogin} onLogout={logout} onShop={showShop} onShopHover={(open) => setShopOpen(open)} onAllWriters={() => showAuthors('all')} onAuthors={() => showAuthors('authors')} onTranslators={() => showAuthors('translators')} onAllBooks={showAllBooks} onCollection={showCollection} onSearch={showSearch} onQuickView={toggleQuickView} onCart={showCart} quickViewOpen={quickViewOpen} quickViewAvailable={quickViewAvailable} activeView={view} shopOpen={shopOpen} writersOpen={writersOpen} onWritersHover={(open) => setWritersOpen(open)} onDesktopMenuHover={(open) => setHeroMotionOpen(open)} accountMenuOpen={accountMenuOpen} onAccountMenuToggle={() => setAccountMenuOpen(false)} accountTab={accountTab} onAccountTabChange={(tab) => { setAccountTab(tab); showAccount() }} accountMenuEnabled={isAuthenticated || view === 'account'} language={language} menuItems={publicMenuItems} />}
    {!isEmagazineView && <><button className={`mobile-backdrop ${menuOpen ? 'is-open' : ''}`} aria-label="Close menu" aria-hidden={!menuOpen} onClick={() => setMenuOpen(false)} />{!menuOpen && <span className="mobile-menu-edge-swipe" aria-hidden="true" onPointerDown={handleEdgePointerDown} onPointerMove={handleEdgePointerMove} onPointerUp={handleEdgePointerUp} onPointerCancel={() => { edgeSwipeStart.current = null }} />}<MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} onCategory={showCategory} onAllBooks={showAllBooks} onCollection={showCollection} onAllWriters={() => showAuthors('all')} onAuthors={() => showAuthors('authors')} onTranslators={() => showAuthors('translators')} onSearch={showSearch} language={language} onSelectLanguage={selectLanguage} /></>}
     {view === 'account' ? <AccountPage onHome={showHome} onLogout={logout} activeTab={accountTab} onTabChange={(tab) => { setAccountTab(tab); setAccountMenuOpen(false) }} /> : view === 'authors' ? <AuthorsDirectory filter={writerFilter} /> : view === 'all-books' ? <AllBooksPage heroMotionOpen={heroMotionOpen} publicBanners={publicBanners} onHome={showHome} onOpenDetail={showDetail} onAddToCart={addToCart} onPreview={openPreview} onPreviewLeave={schedulePreviewClose} onSelectQuickView={selectQuickView} quickViewOpen={quickViewAvailable} /> : view === 'collection' ? <AllBooksPage heroMotionOpen={heroMotionOpen} publicBanners={publicBanners} collectionTitle={selectedCollection ?? collectionTitles[0]} onHome={showHome} onOpenDetail={showDetail} onAddToCart={addToCart} onPreview={openPreview} onPreviewLeave={schedulePreviewClose} onSelectQuickView={selectQuickView} quickViewOpen={quickViewAvailable} /> : view === 'search' ? <SearchResultsPage query={searchQuery} loading={catalogLoading} onOpenDetail={showDetail} onAddToCart={addToCart} onPreview={openPreview} onPreviewLeave={schedulePreviewClose} onSelectQuickView={selectQuickView} quickViewOpen={quickViewAvailable} /> : view === 'author' ? <AuthorProfile author={selectedAuthor || 'Edward W. Said'} onBack={showAuthors} onOpenDetail={showDetail} onAddToCart={addToCart} onPreview={openPreview} onPreviewLeave={schedulePreviewClose} onSelectQuickView={selectQuickView} quickViewOpen={quickViewAvailable} /> : view === 'detail' ? <BookDetail product={selectedProduct ?? products[0]} onBack={showHome} onAuthor={showAuthor} onOpenDetail={showDetail} onAddToCart={addToCart} onBuyNow={buyNow} onPreview={openPreview} onPreviewLeave={schedulePreviewClose} onSelectQuickView={selectQuickView} quickViewOpen={quickViewAvailable} /> : view === 'cart' ? <CartPage onHome={showHome} onCheckout={showCheckout} items={cartItems} onRemove={removeFromCart} onChangeQuantity={changeCartQuantity} /> : view === 'checkout' ? <CheckoutPage items={cartItems} onHome={showHome} onBackToCart={showCart} onCreateOrder={createOrder} /> : view === 'news' ? <NewsPage language={language} onOpen={showNewsDetail} heroMotionOpen={heroMotionOpen} publicBanners={publicBanners} /> : view === 'news-detail' ? (selectedNews ? <NewsDetailPage item={selectedNews} language={language} onBack={showNews} /> : <NewsPage language={language} onOpen={showNewsDetail} heroMotionOpen={heroMotionOpen} publicBanners={publicBanners} />) : <main>
     <section className={`hero scroll-section ${heroMotionOpen ? 'is-shop-open' : ''}`} aria-label="Linery bookstore illustration"><HeroBanner motionOpen={heroMotionOpen} banners={publicBanners} /></section>
      <div id="shop" className="collections">{sections.map(section => <Collection key={section.title} {...section} language={language} onCollection={showCollection} onOpenDetail={showDetail} onAddToCart={addToCart} onPreview={openPreview} onPreviewLeave={schedulePreviewClose} onSelectQuickView={selectQuickView} quickViewOpen={quickViewAvailable} />)}</div>
    <LineryNewsSection language={language} onOpen={showNewsDetail} onSeeMore={showNews} />
    </main>}
    {!isEmagazineView && <Footer menuItems={publicMenuItems} siteSettings={publicSiteSettings} />}
    {!isEmagazineView && <ChatbotWidget />}
    {!isEmagazineView && <button className={`scroll-to-top ${showScrollTop ? 'is-visible' : ''}`} type="button" aria-label="Scroll to top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} tabIndex={showScrollTop ? 0 : -1}>
      <i className="bi bi-arrow-up" aria-hidden="true" />
    </button>}
    </div>
    {view === 'login' && <LoginPage onHome={showHome} onRegister={showRegister} onForgotPassword={showForgotPassword} onLoginSuccess={completeLogin} />}
    {view === 'register' && <RegisterPage onHome={showHome} onLogin={showLogin} onRegisterSuccess={completeRegister} language={language} />}
    {(view === 'forgot-password' || view === 'password-reset-sent' || view === 'reset-password' || view === 'password-reset-complete') && <PasswordRecoveryPage mode={view} onHome={showHome} onLogin={showLogin} onEmailSent={sendPasswordReset} onComplete={completePasswordReset} />}
    {quickViewAvailable && quickViewOpen && <UtilityPanel product={previewProduct} onClose={closePreview} onOpenDetail={showDetail} onAuthor={showAuthor} onAddToCart={addToCart} onBuyNow={buyNow} onToggleWishlist={toggleWishlist} isWishlisted={isWishlisted} />}
  </>
}

