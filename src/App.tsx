import { useEffect, useRef, useState, type ElementType, type FormEvent } from 'react'
import { Menu } from 'lucide-react'
import 'bootstrap-icons/font/bootstrap-icons.css'

type Product = { image: string; gallery?: string[]; title: string; author: string; price: string; categories: string[]; publisher: string; writerType: 'Authors' | 'Translators'; year?: number; available?: boolean }
type CartItem = { product: Product; quantity: number }
type PaymentMethod = 'vnpay' | 'bank' | 'momo' | 'apple' | 'zalopay'
type FulfillmentMethod = 'pickup' | 'delivery'
type NewsItem = { image: string; title: string; titleVi: string; date: string; kicker: string; slug: string; excerpt: string; excerptVi: string; body: string[]; bodyVi: string[] }
type View = 'home' | 'authors' | 'all-books' | 'collection' | 'search' | 'author' | 'detail' | 'cart' | 'checkout' | 'news' | 'news-detail' | 'login' | 'register' | 'forgot-password' | 'password-reset-sent' | 'reset-password' | 'password-reset-complete' | 'account'
type AccountTab = 'profile' | 'orders' | 'orders-demo' | 'order-detail' | 'transactions' | 'transaction-detail' | 'security'
type WriterDirectoryFilter = 'all' | 'authors' | 'translators'
type ProductCardActions = { onOpenDetail: (product: Product) => void; onAddToCart: (product: Product) => void; onPreview: (product: Product) => void; onPreviewLeave: () => void; onSelectQuickView: (product: Product) => void; quickViewOpen: boolean }
const loginSlides = [
  { image: '/assets/linery-login-artwork.png', quote: 'A quiet page can change the way we see the world.' },
]
const isEnhancedVariant = import.meta.env.VITE_LINERY_VARIANT === 'enhanced'
const welcomeStorageKey = 'linery-welcome-seen-v3'

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

const products: Product[] = [
  { image: '/assets/cover-edward.png', title: 'Power, Politics, and Culture: Interviews with Edward W. Said', author: 'Edward W. Said', price: '460.000₫', categories: ['Non-fiction', 'Essays'], publisher: 'Penguin Random House', writerType: 'Authors', year: 2004 },
  { image: '/assets/cover-ethics.png', title: 'Ethics: A Very Short Introduction', author: 'Simon Blackburn', price: '460.000₫', categories: ['Non-fiction', 'Research & Studies'], publisher: 'Oxford University Press', writerType: 'Authors', year: 2001, available: false },
  { image: '/assets/cover-existentialism.png', title: 'Existentialism: A Very Short Introduction', author: 'Thomas R. Flynn', price: '460.000₫', categories: ['Non-fiction', 'Research & Studies'], publisher: 'Oxford University Press', writerType: 'Authors', year: 2006 },
  { image: '/assets/cover-jung.png', title: 'Jung: A Very Short Introduction', author: 'Anthony Stevens', price: '460.000₫', categories: ['Non-fiction', 'Memoir & Biography'], publisher: 'HarperCollins', writerType: 'Authors', year: 1999 },
  { image: '/assets/cover-derrida.png', title: 'Derrida: A Very Short Introduction', author: 'Simon Glendinning', price: '280.000₫', categories: ['Non-fiction', 'Research & Studies'], publisher: 'Simon & Schuster', writerType: 'Authors', year: 2011 },
  { image: '/assets/cover-black-folk.png', title: 'The Souls of Black Folk', author: 'W. E. B. Du Bois', price: '310.000₫', categories: ['Non-fiction', 'Essays'], publisher: 'Macmillan Publishers', writerType: 'Authors', year: 1903 },
]

const newsItems: NewsItem[] = [
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
]
const getNewsFromPath = (pathname: string) => newsItems.find((item) => item.slug === pathname.split('/').pop()) ?? null

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

const authorSlug = (author: string) => author.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-')
const productSlug = (title: string) => title.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-')
const getProductFromPath = (pathname: string) => {
  const slug = pathname.startsWith('/books/') ? pathname.split('/').pop() ?? '' : ''
  return products.find((product) => productSlug(product.title) === slug) ?? null
}
const getAuthorFromPath = (pathname: string) => {
  const slug = pathname.startsWith('/authors/') ? pathname.split('/').pop() ?? '' : ''
  if (!slug) return ''
  const knownAuthor = products.find((product) => authorSlug(product.author) === slug)?.author ?? Object.keys(authorProfiles).find((author) => authorSlug(author) === slug)
  if (knownAuthor) return knownAuthor
  return slug.split('-').map((part) => part ? `${part[0].toUpperCase()}${part.slice(1)}` : '').join(' ')
}
const getViewFromPath = (pathname: string, hash: string): View => {
  if (hash === '#login') return 'login'
  if (hash === '#register') return 'register'
  if (hash === '#forgot-password') return 'forgot-password'
  if (hash === '#password-reset-sent') return 'password-reset-sent'
  if (hash === '#reset-password') return 'reset-password'
  if (hash === '#password-reset-complete') return 'password-reset-complete'
  if (hash === '#account') return 'account'
  if (pathname === '/authors') return 'authors'
  if (pathname === '/all-books') return 'all-books'
  if (pathname.startsWith('/collections/') && getCollectionTitleFromPath(pathname)) return 'collection'
  if (pathname === '/search') return 'search'
  if (pathname === '/cart') return 'cart'
  if (pathname === '/checkout') return 'checkout'
  if (pathname === '/news') return 'news'
  if (pathname.startsWith('/news/') && getNewsFromPath(pathname)) return 'news-detail'
  if (pathname.startsWith('/authors/') && getAuthorFromPath(pathname)) return 'author'
  if (pathname.startsWith('/books/') && getProductFromPath(pathname)) return 'detail'
  return 'home'
}
const getWriterFilterFromSearch = (search: string): WriterDirectoryFilter => {
  const filter = new URLSearchParams(search).get('type')
  return filter === 'authors' || filter === 'translators' ? filter : 'all'
}

const sections = [
  { title: 'NEW & UPCOMING', items: products },
  { title: 'LINERY PRESS', items: products },
  { title: 'LINERY PICKS', items: products },
]
const collectionTitles = ['NEW & UPCOMING', 'LINERY PRESS', 'LINERY PICKS'] as const
const collectionSlug = (title: string) => title.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-')
const getCollectionTitleFromPath = (pathname: string) => {
  const slug = pathname.startsWith('/collections/') ? pathname.split('/').pop() ?? '' : ''
  return collectionTitles.find((title) => collectionSlug(title) === slug) ?? null
}

type MenuColumn = { eyebrow: string; links: string[] }
type ShopCategory = { label: string; children?: ShopCategory[] }

const shopCategories: ShopCategory[] = [
  { label: 'Books', children: [
    { label: 'Fiction', children: [{ label: 'Novels' }, { label: 'Short stories' }, { label: 'Poetry & Drama' }] },
    { label: 'Non-fiction', children: [{ label: 'Essays' }, { label: 'Research & Studies' }, { label: 'Memoir & Biography' }] },
  ] },
  { label: 'Authors' },
]
const shopOnlyCategories = shopCategories
  .flatMap((category) => category.label === 'Books' ? (category.children ?? []) : [category])
  .filter((category) => category.label !== 'Authors')
const desktopShopColumns: MenuColumn[] = [
  { eyebrow: '', links: ['All books', 'NEW & UPCOMING', 'LINERY PRESS', 'LINERY PICKS'] },
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

function MenuColumns({ columns }: { columns: MenuColumn[] }) {
  return <div className="menu-columns">{columns.map((column) => <div className="menu-column" key={column.eyebrow}><p className="menu-eyebrow">{column.eyebrow}</p>{column.links.map((link) => <a href={`/authors/${authorSlug(link)}`} key={link}>{link}</a>)}</div>)}</div>
}

function ShopMenu({ onAllBooks, onCollection }: { onAllBooks: () => void; onCollection: (title: string) => void }) {
  return <section className="shop-menu menu-navigation" aria-label="Books categories">
    <div className="shop-menu-inner menu-navigation-inner">
      <div className="shop-menu-columns menu-navigation-list">
        {desktopShopColumns.map((column, columnIndex) => <div className={`shop-menu-column menu-section menu-branch menu-level-${columnIndex === 0 ? 0 : 1}`} key={column.eyebrow || column.links[0]}>
          {column.eyebrow && <p className="menu-eyebrow menu-section-title">{column.eyebrow}</p>}
          {column.links.map((link) => {
            const isCollection = collectionTitles.includes(link as typeof collectionTitles[number])
            return <a className="menu-item menu-item-link menu-item-text" href={link === 'All books' ? '/all-books' : isCollection ? `/collections/${collectionSlug(link)}` : `#${link.toLowerCase().replaceAll(' ', '-')}`} key={link} onClick={link === 'All books' ? (event) => { event.preventDefault(); onAllBooks() } : isCollection ? (event) => { event.preventDefault(); onCollection(link) } : undefined}>{link}</a>
          })}
          </div>)}
      </div>
    </div>
  </section>
}

function WritersMenu({ onAllWriters, onAuthors, onTranslators }: { onAllWriters: () => void; onAuthors: () => void; onTranslators: () => void }) {
  return <section className="writers-menu menu-navigation" aria-label="Writers categories">
    <div className="writers-menu-inner menu-navigation-inner">
      <div className="writers-menu-list">
        <a className="menu-item menu-item-link menu-item-text" href="/authors" onClick={(event) => { event.preventDefault(); onAllWriters() }}>View All</a>
        <a className="menu-item menu-item-link menu-item-text" href="/authors?type=authors" onClick={(event) => { event.preventDefault(); onAuthors() }}>Authors</a>
        <a className="menu-item menu-item-link menu-item-text" href="/authors?type=translators" onClick={(event) => { event.preventDefault(); onTranslators() }}>Translators</a>
      </div>
    </div>
  </section>
}

function MobileMenu({ isOpen, onShop, onAllBooks, onCollection, onAllWriters, onAuthors, onTranslators, onSearch, language, onSelectLanguage }: { isOpen: boolean; onShop: () => void; onAllBooks: () => void; onCollection: (title: string) => void; onAllWriters: () => void; onAuthors: () => void; onTranslators: () => void; onSearch: (query: string) => void; language: 'en' | 'vi'; onSelectLanguage: (language: 'en' | 'vi') => void }) {
  const [openBranches, setOpenBranches] = useState<Record<string, boolean>>({ Fiction: true, 'Non-fiction': true, 'Linery Press': true })
  const [query, setQuery] = useState('')
  const toggleBranch = (label: string) => setOpenBranches((current) => ({ ...current, [label]: !current[label] }))

  return <aside className={`mobile-menu menu-navigation ${isOpen ? 'is-open' : ''}`} aria-label="Mobile navigation" aria-hidden={!isOpen}>
    <div className="mobile-menu-header">
      <div className="mobile-menu-language-options" aria-label="Choose language">
        <button type="button" className={language === 'en' ? 'is-active' : ''} aria-pressed={language === 'en'} onClick={() => onSelectLanguage('en')}>EN</button>
        <button type="button" className={language === 'vi' ? 'is-active' : ''} aria-pressed={language === 'vi'} onClick={() => onSelectLanguage('vi')}>VI</button>
      </div>
      <div className="mobile-menu-quick-actions" aria-label="Account actions">
        <a className="mobile-menu-icon" href="#login" aria-label="Log in"><i className="bi bi-person" aria-hidden="true" /></a>
      </div>
    </div>
    <div className="mobile-menu-tools">
      <form className="mobile-menu-search" onSubmit={(event) => { event.preventDefault(); onSearch(query) }}>
        <img src="/assets/icon-search.svg" alt="" aria-hidden="true" />
        <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search books" aria-label="Search books" />
      </form>
    </div>
    <section className="mobile-menu-section menu-section" aria-labelledby="mobile-shop-heading">
      <h2 id="mobile-shop-heading" className="mobile-menu-section-title menu-section-title">Books</h2>
      <button className="mobile-menu-item mobile-menu-level-0 menu-item menu-level-0" onClick={onAllBooks}><span className="mobile-menu-text menu-item-text">View All</span></button>
      {['NEW & UPCOMING', 'LINERY PRESS', 'LINERY PICKS'].map((title) => <button className="mobile-menu-item mobile-menu-level-0 menu-item menu-level-0" key={title} onClick={() => onCollection(title)}><span className="mobile-menu-text menu-item-text">{title}</span></button>)}
      <div className="mobile-menu-tree">
        {shopOnlyCategories.map((category) => {
          const categoryOpen = openBranches[category.label] ?? true
          return <div className="mobile-menu-branch menu-branch" key={category.label}>
            <button className="mobile-menu-item mobile-menu-level-0 menu-item menu-level-0" onClick={() => category.children ? toggleBranch(category.label) : onShop()} aria-expanded={category.children ? categoryOpen : undefined}>
              <span className="mobile-menu-text menu-item-text">{category.label}</span>{category.children && <span aria-hidden="true">{categoryOpen ? '−' : '+'}</span>}
            </button>
            {category.children && categoryOpen && <div className="mobile-menu-children menu-children">{category.children.map((child) => {
              const childOpen = openBranches[child.label] ?? true
              return <div className="mobile-menu-branch menu-branch" key={child.label}>
                <button className="mobile-menu-item mobile-menu-level-1 menu-item menu-level-1" onClick={() => child.children ? toggleBranch(child.label) : onShop()} aria-expanded={child.children ? childOpen : undefined}>
                  <span className="mobile-menu-text menu-item-text">{child.label}</span>{child.children && <span aria-hidden="true">{childOpen ? '−' : '+'}</span>}
                </button>
                {child.children && childOpen && <div className="mobile-menu-children menu-children">{child.children.map((leaf) => <button className="mobile-menu-item mobile-menu-level-2 menu-item menu-level-2" key={leaf.label} onClick={onShop}><span className="mobile-menu-text menu-item-text">{leaf.label}</span></button>)}</div>}
              </div>
            })}</div>}
          </div>
        })}
      </div>
    </section>
    <section className="mobile-menu-section menu-section mobile-menu-authors" aria-labelledby="mobile-authors-heading">
      <h2 id="mobile-authors-heading" className="mobile-menu-section-title menu-section-title">WRITERS</h2>
      <div className="mobile-menu-children menu-children">
        <button className="mobile-menu-item mobile-menu-level-1 menu-item menu-level-1" onClick={onAllWriters}><span className="mobile-menu-text menu-item-text">View All</span><span aria-hidden="true">→</span></button>
        <button className="mobile-menu-item mobile-menu-level-1 menu-item menu-level-1" onClick={onAuthors}><span className="mobile-menu-text menu-item-text">Authors</span></button>
        <button className="mobile-menu-item mobile-menu-level-1 menu-item menu-level-1" onClick={onTranslators}><span className="mobile-menu-text menu-item-text">Translators</span></button>
      </div>
    </section>
  </aside>
}

function AuthorsDirectory({ filter }: { filter: WriterDirectoryFilter }) {
  return <main className="directory-page">
    {(filter === 'all' || filter === 'authors') && <section className="directory-section" aria-labelledby="authors-title">
      <p className="directory-kicker" id="authors-title">Authors</p>
      <div className="directory-grid"><MenuColumns columns={authorColumns} /></div>
    </section>}
    {(filter === 'all' || filter === 'translators') && <section className="directory-section translators" aria-labelledby="translators-title">
      <p className="directory-kicker" id="translators-title">Translators</p>
      <div className="directory-grid"><MenuColumns columns={translatorColumns} /></div>
    </section>}
  </main>
}

function AuthorProfile({ author, onBack, ...actions }: { author: string; onBack: () => void } & ProductCardActions) {
  const authorBooks = products.filter((product) => product.author === author)
  const [authorFactsOpen, setAuthorFactsOpen] = useState(true)
  const [authorBioOpen, setAuthorBioOpen] = useState(false)
  const [authorWorksPage, setAuthorWorksPage] = useState(0)
  const [activeAuthorImage, setActiveAuthorImage] = useState(0)
  const [authorLightboxOpen, setAuthorLightboxOpen] = useState(false)
  const authorLightboxTrackRef = useRef<HTMLDivElement>(null)
  const profile = authorProfiles[author] ?? {
    image: '',
    born: '—',
    died: '—',
    bornPlace: 'Linery catalogue',
    diedPlace: 'Linery catalogue',
    awards: 0,
    academicTitle: '—',
    bio: `${author} is part of the Linery catalogue, a curated selection of literary voices and essential works for curious readers.`,
  }
  const authorImages = profile.images ?? [profile.image]
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
          {authorImages[activeAuthorImage] ? <button className="author-portrait-trigger" type="button" aria-label={`Open portrait ${activeAuthorImage + 1} of ${author}`} onClick={() => setAuthorLightboxOpen(true)}><img src={authorImages[activeAuthorImage]} alt={`${author} portrait ${activeAuthorImage + 1}`} className="author-portrait" /></button> : <i className="bi bi-person" aria-hidden="true" />}
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
              <span id="author-facts-title">AWARD</span>
              <i className={`bi bi-${authorFactsOpen ? 'dash' : 'plus'}-lg`} aria-hidden="true" />
            </button>
            {authorFactsOpen && <dl className="author-profile-facts" id="author-facts-content">
              <div><dt>Awards received</dt><dd>{profile.awards} {profile.awards === 1 ? 'award' : 'awards'}</dd></div>
              <div><dt>Academic title</dt><dd className="author-academic-title">{profile.academicTitle}</dd></div>
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

function FilterMultiSelect({ label, options, value, onChange }: { label: string; options: string[]; value: string[]; onChange: (value: string[]) => void }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const visibleOptions = options.filter((option) => option.toLowerCase().includes(query.toLowerCase()))

  const toggleOption = (option: string) => onChange(value.includes(option) ? value.filter((item) => item !== option) : [...value, option])

  return <div className={`filter-select2 ${open ? 'is-open' : ''}`}>
    <span className="filter-select2-label">{label}</span>
    <div className="filter-select2-control" role="button" tabIndex={0} aria-expanded={open} onClick={() => setOpen((current) => !current)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setOpen((current) => !current) } }}>
      <span className="filter-select2-tags">{value.length > 0 ? value.map((item) => <span className="filter-select2-tag" key={item}>{item}<button type="button" aria-label={`Remove ${item}`} onClick={(event) => { event.stopPropagation(); toggleOption(item) }}>×</button></span>) : <span className="filter-select2-placeholder">Select {label.toLowerCase()}</span>}</span>
      <i className="bi bi-chevron-down" aria-hidden="true" />
    </div>
    {open && <div className="filter-select2-dropdown">
      <input className="filter-select2-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Search ${label.toLowerCase()}`} aria-label={`Search ${label.toLowerCase()}`} />
      <div className="filter-select2-options">{visibleOptions.map((option) => <label key={option}><input type="checkbox" checked={value.includes(option)} onChange={() => toggleOption(option)} /> <span>{option}</span></label>)}</div>
      {visibleOptions.length === 0 && <p className="filter-select2-empty">No matches found.</p>}
    </div>}
  </div>
}

function FilterTextInput({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder: string }) {
  return <label className="filter-text-field">
    <span>{label}</span>
    <input type="search" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} aria-label={label} />
  </label>
}

function AllBooksPage({ onHome, collectionTitle, ...actions }: { onHome: () => void; collectionTitle?: string } & ProductCardActions) {
  const pageTitle = collectionTitle ?? 'ALL BOOKS'
  const allBooks = Array.from({ length: 28 }, (_, rowIndex) => products.map((product, productIndex) => ({
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
  const [draftWriterQuery, setDraftWriterQuery] = useState('')
  const [draftPublishers, setDraftPublishers] = useState<string[]>([])
  const [draftSort, setDraftSort] = useState('default')
  const [activeCategories, setActiveCategories] = useState<string[]>(initialCategory ? [initialCategory] : [])
  const [activeWriterQuery, setActiveWriterQuery] = useState('')
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
    .filter((product) => activeWriterQuery.length === 0 || product.author.toLowerCase().includes(activeWriterQuery.toLowerCase()))
    .filter((product) => activePublishers.length === 0 || activePublishers.includes(product.publisher))
    .sort((first, second) => {
      if (activeSort === 'price-asc' || activeSort === 'price-desc') {
        const firstPrice = Number(first.price.replace(/[^0-9]/g, ''))
        const secondPrice = Number(second.price.replace(/[^0-9]/g, ''))
        return activeSort === 'price-asc' ? firstPrice - secondPrice : secondPrice - firstPrice
      }
      if (activeSort === 'year-asc' || activeSort === 'year-desc') {
        return activeSort === 'year-asc' ? (first.year ?? 0) - (second.year ?? 0) : (second.year ?? 0) - (first.year ?? 0)
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
      <div className="all-books-hero"><picture><source srcSet="/assets/all-books-hero.webp" type="image/webp" /><img src="/assets/all-books-hero.png" alt="Children exploring a garden together" width="2560" height="866" fetchPriority="high" decoding="async" /></picture></div>
      <div className="all-books-heading-row">
        <nav className="all-books-breadcrumb" aria-label="Breadcrumb"><a href="/#home" onClick={(event) => { event.preventDefault(); onHome() }}>Home</a><span aria-hidden="true">/</span><span>{pageTitle}</span></nav>
        <button className={`all-books-filter-toggle ${filterOpen ? 'is-open' : ''}`} type="button" aria-expanded={filterOpen} onClick={() => setFilterOpen((open) => !open)}><i className="bi bi-sliders2" aria-hidden="true" /> Filter &amp; sort</button>
      </div>
      <form className={`all-books-filter-panel ${filterOpen ? 'is-open' : ''}`} aria-hidden={!filterOpen} onSubmit={(event) => { event.preventDefault(); setActiveCategories(draftCategories); setActiveWriterQuery(draftWriterQuery.trim()); setActivePublishers(draftPublishers); setActiveSort(draftSort); setCurrentPage(1) }}>
        <fieldset>
          <legend>Books</legend>
          <div className="all-books-filter-category-groups">{categoryGroups.map((group) => <div className="all-books-filter-category-group" key={group.label}>
            <label className="all-books-filter-parent"><input type="checkbox" checked={draftCategories.includes(group.label)} onChange={(event) => setDraftCategories((current) => event.target.checked ? [...current, group.label] : current.filter((item) => item !== group.label))} /> <span>{group.label}</span></label>
            {group.children.map((category) => <label className="all-books-filter-child" key={category}><input type="checkbox" checked={draftCategories.includes(category)} onChange={(event) => setDraftCategories((current) => event.target.checked ? [...current, category] : current.filter((item) => item !== category))} /> <span>{category}</span></label>)}
          </div>)}</div>
        </fieldset>
        <FilterTextInput label="Writers" value={draftWriterQuery} onChange={setDraftWriterQuery} placeholder="Enter writer name" />
        <FilterMultiSelect label="Publishers" options={publishers} value={draftPublishers} onChange={setDraftPublishers} />
        <label className="all-books-sort-field">Sort by
          <select value={draftSort} onChange={(event) => setDraftSort(event.target.value)}>
            <option value="default">Default</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
            <option value="year-asc">Publication year: old to new</option>
            <option value="year-desc">Publication year: new to old</option>
          </select>
        </label>
        <div className="all-books-filter-actions"><button type="button" onClick={() => { setDraftCategories([]); setDraftWriterQuery(''); setDraftPublishers([]); setDraftSort('default'); setActiveCategories([]); setActiveWriterQuery(''); setActivePublishers([]); setActiveSort('default'); setCurrentPage(1) }}>Clear</button><button type="submit">Apply filter</button></div>
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
  return Math.max(
    getSearchFieldScore(product.title, query) * 4,
    getSearchFieldScore(product.author, query) * 3,
    getSearchFieldScore(product.publisher, query) * 2,
    getSearchFieldScore(product.categories.join(' '), query),
  )
}

function SearchResultsPage({ query, ...actions }: { query: string } & ProductCardActions) {
  const normalizedQuery = normalizeSearchText(query)
  const results = products
    .map((product) => ({ product, score: getProductSearchScore(product, normalizedQuery) }))
    .filter(({ score }) => score > 0)
    .sort((first, second) => second.score - first.score)
    .map(({ product }) => product)
  const hasQuery = normalizedQuery.length > 0

  return <main className="search-page">
    <div className="search-page-content">
      <p className="search-page-kicker">Search</p>
      <h1>Search results for <span>“{query || 'all books'}”</span></h1>
      {hasQuery && results.length > 0 ? <>
        <p className="search-page-summary">{results.length} {results.length === 1 ? 'book' : 'books'} found</p>
        <div className="search-results-grid">{results.map((product) => <ProductCard key={product.title} product={product} {...actions} />)}</div>
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
    <img className="news-card-image" src={item.image} alt="" />
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
  const visibleItems = newsItems.slice(0, pageSize)
  return <section className="news-module" aria-labelledby="linery-news-title">
    <RibbonTitle title="LINERY NEWS" id="linery-news-title" heading />
    <div className="news-grid">{visibleItems.map((item) => <NewsCard key={item.slug} item={item} language={language} onOpen={onOpen} />)}</div>
    <a className="news-see-more" href="/news" onClick={(event) => { event.preventDefault(); onSeeMore() }}>View All</a>
  </section>
}

function NewsPage({ language, onOpen }: { language: 'en' | 'vi'; onOpen: (item: NewsItem) => void }) {
  const pageTitle = language === 'vi' ? 'Tin tức & Sự kiện' : 'News & Events'
  return <main className="news-page">
    <div className="news-page-content">
      <div className="all-books-hero news-page-hero"><img src="/assets/all-books-hero.png" alt="Children exploring a garden together" width="2560" height="866" fetchPriority="high" decoding="async" /></div>
      <nav className="news-breadcrumb news-page-breadcrumb" aria-label="Breadcrumb"><a href="/#home">Home</a><span aria-hidden="true">/</span><span>{pageTitle}</span></nav>
      <section className="news-page-panel" aria-labelledby="all-news-title">
        <RibbonTitle title={pageTitle.toUpperCase()} id="all-news-title" heading />
        <div className="news-page-grid">{newsItems.map((item) => {
          const title = language === 'vi' ? item.titleVi : item.title
          const excerpt = language === 'vi' ? item.excerptVi : item.excerpt
          return <article className="news-page-card" key={item.slug}>
            <button type="button" onClick={() => onOpen(item)}>
              <div className="news-page-image-wrap"><img src={item.image} alt={title} loading="lazy" decoding="async" /></div>
              <p>{item.kicker}</p><h2>{title}</h2><span>{excerpt}</span>
            </button>
          </article>
        })}</div>
      </section>
    </div>
  </main>
}

function NewsDetailPage({ item, language, onBack }: { item: NewsItem; language: 'en' | 'vi'; onBack: () => void }) {
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

function Header({ cartCount, menuOpen, onMenu, onHome, onLogin, onLogout, onShop, onShopHover, onAllWriters, onAuthors, onTranslators, onAllBooks, onCollection, onSearch, onQuickView, onCart, quickViewOpen, quickViewAvailable, activeView, shopOpen, writersOpen, onWritersHover, onDesktopMenuHover, accountMenuOpen, onAccountMenuToggle, accountTab, onAccountTabChange, accountMenuEnabled }: { cartCount: number; menuOpen: boolean; onMenu: () => void; onHome: () => void; onLogin: () => void; onLogout: () => void; onShop: () => void; onShopHover: (open: boolean) => void; onAllWriters: () => void; onAuthors: () => void; onTranslators: () => void; onAllBooks: () => void; onCollection: (title: string) => void; onSearch: (query: string) => void; onQuickView: () => void; onCart: () => void; quickViewOpen: boolean; quickViewAvailable: boolean; activeView: View; shopOpen: boolean; writersOpen: boolean; onWritersHover: (open: boolean) => void; onDesktopMenuHover: (open: boolean) => void; accountMenuOpen: boolean; onAccountMenuToggle: () => void; accountTab: AccountTab; onAccountTabChange: (tab: AccountTab) => void; accountMenuEnabled: boolean }) {
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

  return <header ref={headerRef} className={`site-header ${menuOpen ? 'is-menu-open' : ''} ${activeView === 'account' ? 'is-account-view' : ''}`} onMouseLeave={() => onDesktopMenuHover(false)}>
    <div className="header-inner">
      <button className="menu-button" aria-label="Mở menu" onClick={onMenu}><Menu /></button>
      <nav className="desktop-nav" aria-label="Điều hướng chính" onMouseEnter={() => onDesktopMenuHover(true)}><a className={`nav-link ${activeView === 'home' ? 'is-active' : ''}`} href="/#home" onMouseEnter={() => { onShopHover(false); onWritersHover(false) }} onFocus={() => { onShopHover(false); onWritersHover(false) }} onClick={(event) => { event.preventDefault(); onHome() }}>Home</a><button className={`nav-link shop-nav-link ${shopOpen ? 'is-open' : ''}`} onClick={onShop} onMouseEnter={() => { onShopHover(true); onWritersHover(false) }} onFocus={() => { onShopHover(true); onWritersHover(false) }} aria-expanded={shopOpen}>Books<i className="bi bi-chevron-down nav-chevron" aria-hidden="true" /></button><button className={`nav-link ${activeView === 'authors' ? 'is-active' : ''} ${writersOpen ? 'is-open' : ''}`} onMouseEnter={() => { onShopHover(false); onWritersHover(true) }} onFocus={() => { onShopHover(false); onWritersHover(true) }} onClick={onAllWriters} aria-expanded={writersOpen}>Writes<i className="bi bi-chevron-down nav-chevron" aria-hidden="true" /></button></nav>
      <a className="brand" href="/" aria-label="Linery Bookstore home">LINERY BOOKSTORE</a>
      <div className="header-actions">
        <form className={`search-control desktop-search-control ${searchOpen ? 'is-open' : ''}`} onSubmit={submitSearch}>
          <button className="search-toggle" type="button" aria-label="Tìm kiếm" aria-expanded={searchOpen} onClick={() => setSearchOpen((open) => !open)}><img src="/assets/icon-search.svg" alt="" /></button>
          <input className="search-input" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search books" aria-label="Search books" autoFocus={searchOpen} onKeyDown={(event) => { if (event.key === 'Escape') setSearchOpen(false) }} />
        </form>
        {quickViewAvailable && <button className={`quick-view-button quick-view-icon-button ${quickViewOpen ? 'is-active' : ''}`} type="button" onClick={onQuickView} aria-label="Quick view" aria-expanded={quickViewOpen}><i className="bi bi-lightning-charge-fill" aria-hidden="true" /></button>}
        <a className="icon-button cart-button" href="/cart" aria-label={`Giỏ hàng, ${cartCount} sản phẩm`} onClick={(event) => { event.preventDefault(); onCart() }}><img src="/assets/icon-cart.svg" alt="" />{cartCount > 0 && <span>{cartCount}</span>}</a>
        <div className="account-menu-region" onMouseEnter={() => setAccountHoverOpen(true)} onMouseLeave={() => setAccountHoverOpen(false)}>
          <button className="icon-button login-icon" type="button" aria-label={activeView === 'account' ? 'Account menu' : 'Log in'} aria-expanded={accountMenuEnabled && (activeView === 'account' ? accountMenuOpen : accountHoverOpen)} onClick={onLogin}><i className="bi bi-person" aria-hidden="true" /></button>
          {accountMenuEnabled && <div className={`account-header-menu ${accountMenuOpen || accountHoverOpen ? 'is-open' : ''}`} aria-label="Account menu"><button className={accountTab === 'profile' ? 'is-active' : ''} type="button" onClick={() => { onAccountTabChange('profile'); onAccountMenuToggle() }}><i className="bi bi-person" aria-hidden="true" />Profile</button><button className={accountTab === 'orders' ? 'is-active' : ''} type="button" onClick={() => { onAccountTabChange('orders'); onAccountMenuToggle() }}><i className="bi bi-bag" aria-hidden="true" />Order history</button><button className={accountTab === 'orders-demo' ? 'is-active' : ''} type="button" onClick={() => { onAccountTabChange('orders-demo'); onAccountMenuToggle() }}><i className="bi bi-bag-check" aria-hidden="true" />Order history demo</button><button className={accountTab === 'transactions' ? 'is-active' : ''} type="button" onClick={() => { onAccountTabChange('transactions'); onAccountMenuToggle() }}><i className="bi bi-receipt" aria-hidden="true" />Transaction history</button><button className={accountTab === 'security' ? 'is-active' : ''} type="button" onClick={() => { onAccountTabChange('security'); onAccountMenuToggle() }}><i className="bi bi-shield-lock" aria-hidden="true" />Security</button><button className="account-header-menu-logout" type="button" onClick={onLogout}><i className="bi bi-box-arrow-right" aria-hidden="true" />Log out</button></div>}
        </div>
      </div>
    </div>
    {shopOpen && activeView !== 'authors' && <ShopMenu onAllBooks={onAllBooks} onCollection={onCollection} />}
    {writersOpen && <WritersMenu onAllWriters={onAllWriters} onAuthors={onAuthors} onTranslators={onTranslators} />}
  </header>
}

function ProductCard({ product, onOpenDetail, onAddToCart, onPreview, onPreviewLeave, onSelectQuickView, quickViewOpen }: ProductCardActions & { product: Product }) {
  const [isWishlisted, setIsWishlisted] = useState(() => {
    try {
      return JSON.parse(window.localStorage.getItem('linery-wishlist') ?? '[]').includes(product.title)
    } catch {
      return false
    }
  })

  const toggleWishlist = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()
    try {
      const wishlist = JSON.parse(window.localStorage.getItem('linery-wishlist') ?? '[]') as string[]
      const nextWishlist = isWishlisted ? wishlist.filter((title) => title !== product.title) : [...new Set([...wishlist, product.title])]
      window.localStorage.setItem('linery-wishlist', JSON.stringify(nextWishlist))
      setIsWishlisted(!isWishlisted)
    } catch {
      setIsWishlisted(!isWishlisted)
    }
  }

  return <article className="product-card" onMouseEnter={() => onPreview(product)} onMouseLeave={onPreviewLeave} onFocus={() => onPreview(product)}>
    <a className="product-card-link" href="#a" onClick={(event) => { event.preventDefault(); quickViewOpen ? onSelectQuickView(product) : onOpenDetail(product) }}>
      <div className="product-surface">
        <div className="product-cover-wrap">
          <img src={product.image} alt={product.title} className="product-cover" loading="lazy" decoding="async" />
          <div className="product-overlay">
            <div className="product-overlay-copy"><strong>{product.title}</strong><span>{product.author}</span></div>
            <div className="product-overlay-actions">
              <button className={`product-wishlist ${isWishlisted ? 'is-active' : ''}`} type="button" aria-label={isWishlisted ? `Remove ${product.title} from wishlist` : `Add ${product.title} to wishlist`} aria-pressed={isWishlisted} onClick={toggleWishlist}><i className="bi bi-heart product-action-icon" aria-hidden="true" /><span className="product-action-label">Wishlist</span></button>
              <button className="product-cart" type="button" aria-label={`Add ${product.title} to Cart`} onClick={(event) => { event.preventDefault(); event.stopPropagation(); onAddToCart(product) }}><i className="bi bi-cart3 product-action-icon" aria-hidden="true" /><span className="product-action-label">Add to Cart</span></button>
            </div>
            <span className="product-overlay-cta">Read more...</span>
          </div>
        </div>
        <div className="product-info">
          <h3>{product.title}</h3>
          <p className="product-author">{product.author}</p>
          {product.available !== false && <p className="product-price">{product.price}</p>}
          {product.available === false && <p className="product-stock-status">Out of stock</p>}
        </div>
      </div>
    </a>
  </article>
}

function Collection({ title, items, onCollection, ...actions }: { title: string; items: Product[]; onCollection: (title: string) => void } & ProductCardActions) {
  const [trackPosition, setTrackPosition] = useState(1)
  const [isJumping, setIsJumping] = useState(false)
  const wheelLock = useRef(false)
  const touchStart = useRef<number | null>(null)
  const slides = Array.from({ length: 4 }, (_, slideIndex) => items.map((_, index) => items[(index + slideIndex) % items.length]))
  const activeSlide = (trackPosition + slides.length - 1) % slides.length
  const renderedSlides = [slides[slides.length - 1], ...slides, slides[0]]

  useEffect(() => {
    if (trackPosition !== 0 && trackPosition !== slides.length + 1) return undefined
    const resetTimer = window.setTimeout(() => {
      setIsJumping(true)
      setTrackPosition(trackPosition === 0 ? slides.length : 1)
      window.setTimeout(() => setIsJumping(false), 16)
    }, 760)
    return () => window.clearTimeout(resetTimer)
  }, [trackPosition, slides.length])

  const moveSlide = (direction: 1 | -1) => {
    setTrackPosition((current) => current + direction)
  }

  const goToSlide = (index: number) => setTrackPosition(index + 1)

  const handleTransitionEnd = (event: React.TransitionEvent<HTMLDivElement>) => {
    if (event.propertyName !== 'transform') return
    if (trackPosition === 0) {
      setIsJumping(true)
      setTrackPosition(slides.length)
      window.setTimeout(() => setIsJumping(false), 0)
    }
    if (trackPosition === slides.length + 1) {
      setIsJumping(true)
      setTrackPosition(1)
      window.setTimeout(() => setIsJumping(false), 0)
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

  return <section className="collection scroll-section" aria-labelledby={title.replaceAll(' ', '-')}>
    <RibbonTitle title={title} id={title.replaceAll(' ', '-')} />
    <div className="carousel-viewport" onWheel={handleWheel} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} aria-roledescription="carousel" aria-label={`${title} book carousel`}>
      <div className={`carousel-track ${isJumping ? 'is-jumping' : ''}`} data-slide={trackPosition} onTransitionEnd={handleTransitionEnd}>
        {renderedSlides.map((slide, slideIndex) => <div className="carousel-slide" key={`${title}-slide-${slideIndex}-${slideIndex === 0 ? 'clone-start' : slideIndex === renderedSlides.length - 1 ? 'clone-end' : 'real'}`} aria-hidden={slideIndex === 0 || slideIndex === renderedSlides.length - 1 || slideIndex !== trackPosition}>
          <div className="product-grid">{slide.map((product, index) => <ProductCard key={`${title}-${slideIndex}-${index}`} product={product} {...actions} />)}</div>
        </div>)}
      </div>
    </div>
    <div className="collection-controls"><div className="pagination" aria-label={`${title} pagination`}>{slides.map((_, index) => <button key={`${title}-dot-${index}`} className={index === activeSlide ? 'active' : ''} aria-label={`Xem slide ${index + 1}`} aria-current={index === activeSlide ? 'true' : undefined} onClick={() => goToSlide(index)} />)}</div><a className="news-see-more collection-see-more" href={`/collections/${collectionSlug(title)}`} onClick={(event) => { event.preventDefault(); onCollection(title) }}>View All</a></div>
  </section>
}

function BookDetail({ product, onBack, onAuthor, onAddToCart, onBuyNow }: { product: Product; onBack: () => void; onAuthor: (author: string) => void; onAddToCart: (product: Product) => void; onBuyNow: (product: Product) => void }) {
  const galleryImages = [product.image]
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [activeImage, setActiveImage] = useState(0)
  const [descriptionExpanded, setDescriptionExpanded] = useState(false)
  const [reviewFormOpen, setReviewFormOpen] = useState(false)
  const [reviewSubmitted, setReviewSubmitted] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const unitPrice = Number(product.price.replace(/[^0-9]/g, ''))
  const totalPrice = `${(unitPrice * quantity).toLocaleString('vi-VN')}₫`
  const isAvailable = product.available !== false

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
    <nav className="book-detail-breadcrumb" aria-label="Breadcrumb"><button onClick={onBack}>Books</button><span aria-hidden="true">/</span><span>{product.title}</span></nav>
    <section className="book-detail-hero">
      <div className="book-detail-gallery">
        <button className="book-detail-cover-wrap" type="button" aria-label={`Open gallery for ${product.title}`} onClick={() => setLightboxOpen(true)}>
          <span className="detail-mobile-back" role="button" aria-label="Back to books" tabIndex={0} onClick={(event) => { event.stopPropagation(); onBack() }} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); event.stopPropagation(); onBack() } }}><i className="bi bi-arrow-left" aria-hidden="true" /></span>
          <img className="book-detail-cover" src={galleryImages[activeImage]} alt={product.title} />
          <span className="book-detail-zoom"><i className="bi bi-arrows-fullscreen" aria-hidden="true" /> View full image</span>
        </button>
      </div>
      <div className="book-detail-copy">
        <h1>{product.title}</h1>
        <p className="book-detail-author">by <a href={`/authors/${authorSlug(product.author)}`} onClick={(event) => { event.preventDefault(); onAuthor(product.author) }}>{product.author}</a></p>
        <div className="book-detail-rule" />
        <div className="book-detail-category"><span>Classification</span><div>{product.categories.map((category) => <a className="book-classification-link" key={category} href={`/all-books?category=${encodeURIComponent(category.toLowerCase().replaceAll(' ', '-'))}`}>{category}</a>)}</div></div>
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
            {isAvailable ? <>
              <button className="book-add-button" type="button" onClick={() => onAddToCart(product)}>Add to Cart</button>
              <button className="book-buy-button" type="button" onClick={() => onBuyNow(product)}>Buy Now</button>
            </> : <button className="book-out-of-stock-button" type="button" disabled>Out of stock</button>}
          </div>
        </div>
        <p className={`book-detail-note ${isAvailable ? '' : 'book-detail-note-unavailable'}`}>{isAvailable ? 'Available from Linery Bookstore' : 'This title is currently unavailable.'}</p>
        <section className="book-detail-inline-description" aria-labelledby="book-description-title">
          <h2 id="book-description-title">Description</h2>
          <div id="book-description-copy" className={`book-description-content ${descriptionExpanded ? 'is-expanded' : ''}`}>
            <p>Explore a carefully selected title from the Linery collection, where thoughtful writing, distinctive voices and beautifully made books meet. This temporary product page follows the editorial structure of the reference bookstore layout.</p>
            <p>Discover the ideas, stories and conversations inside this edition, and return to the shop to explore more books from our independent collection.</p>
          </div>
          <button className="book-detail-read-more" type="button" aria-expanded={descriptionExpanded} aria-controls="book-description-copy" onClick={() => setDescriptionExpanded((expanded) => !expanded)}>
            <span>{descriptionExpanded ? 'Read less' : 'Read more'}</span>
            <i className={`bi bi-arrow-${descriptionExpanded ? 'up' : 'down'}`} aria-hidden="true" />
          </button>
        </section>
        <section className="book-details-grid book-detail-inline-details" aria-labelledby="details-title">
          <h2 id="details-title">Details</h2>
          <dl><div><dt>Publisher</dt><dd>{product.publisher}</dd></div><div><dt>ISBN</dt><dd>9780000000000</dd></div><div><dt>Pages</dt><dd>320 pages</dd></div><div><dt>Language</dt><dd>English</dd></div><div><dt>Format</dt><dd>Paperback</dd></div></dl>
        </section>
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
    {lightboxOpen && <div className="book-lightbox" role="dialog" aria-modal="true" aria-label={`Image gallery for ${product.title}`} onClick={() => setLightboxOpen(false)}>
      <div className="book-lightbox-frame" onClick={(event) => event.stopPropagation()}>
        <img className="book-lightbox-image" src={galleryImages[activeImage]} alt={product.title} />
        <div className="book-lightbox-thumbnails" aria-label="Book images">
          {galleryImages.map((image, index) => <button key={`${image}-${index}`} className={`book-lightbox-thumbnail ${index === activeImage ? 'is-active' : ''}`} type="button" aria-label={`View image ${index + 1}`} onClick={() => setActiveImage(index)}><img src={image} alt="" loading="lazy" decoding="async" /></button>)}
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
      <img className="book-preview-cover" src={product.image} alt={product.title} loading="lazy" decoding="async" />
      <div className="book-preview-copy">
        <h2>{product.title}</h2>
        <p className="book-preview-author">{product.author}</p>
        <p className="book-preview-price">{product.price}</p>
      </div>
      <dl className="book-preview-details">
        <div><dt>Publisher</dt><dd>{publisher}</dd></div>
        <div><dt>ISBN</dt><dd>978-0-00-000000-0</dd></div>
        <div><dt>Format</dt><dd>Paperback</dd></div>
        <div><dt>Language</dt><dd>English</dd></div>
        <div><dt>Pages</dt><dd>320 pages</dd></div>
      </dl>
      <a className="book-preview-link" href="#a" onClick={(event) => { event.preventDefault(); onOpenDetail(product) }}>View full details <span aria-hidden="true">→</span></a>
    </> : <div className="book-preview-empty">
      <img src="/assets/quick-view-illustration.png" alt="" aria-hidden="true" />
      <p>Hello — I’m here to help you preview book information.</p>
      <span>Choose a book to see its cover and publication details.</span>
    </div>}
  </aside>
}

function UtilityPanel({ activeTab, items, product, onTabChange, onClose, onRemove, onChangeQuantity, onViewCart, onCheckout, onOpenDetail, onAddToCart, onBuyNow }: { activeTab: 'cart' | 'quickview'; items: CartItem[]; product: Product | null; onTabChange: (tab: 'cart' | 'quickview') => void; onClose: () => void; onRemove: (title: string) => void; onChangeQuantity: (title: string, delta: number) => void; onViewCart: () => void; onCheckout: () => void; onOpenDetail: (product: Product) => void; onAddToCart: (product: Product) => void; onBuyNow: (product: Product) => void }) {
  const subtotal = items.reduce((sum, item) => sum + getPriceValue(item.product.price) * item.quantity, 0)
  const publisher = product?.publisher ?? 'Linery Books'
  return <div className="utility-panel-layer" role="presentation">
    <aside className="utility-panel" aria-label="Flash cart and quick view">
      <div className="utility-panel-header">
        <div className="utility-panel-tabs" role="tablist" aria-label="Shopping tools">
          <button className={activeTab === 'cart' ? 'is-active' : ''} type="button" role="tab" aria-selected={activeTab === 'cart'} onClick={() => onTabChange('cart')}>Flash cart</button>
          <button className={activeTab === 'quickview' ? 'is-active' : ''} type="button" role="tab" aria-selected={activeTab === 'quickview'} onClick={() => onTabChange('quickview')}>Quick view</button>
        </div>
        <button className="utility-panel-close" type="button" aria-label="Close panel" onClick={onClose}>×</button>
      </div>
      {activeTab === 'cart' ? items.length > 0 ? <>
        <div className="utility-panel-items">{items.map((item) => <CartItemRow key={item.product.title} item={item} onRemove={() => onRemove(item.product.title)} onChangeQuantity={(delta) => onChangeQuantity(item.product.title, delta)} />)}</div>
        <div className="utility-panel-footer">
          <div className="cart-subtotal"><span>Subtotal</span><strong>{formatPrice(subtotal)}</strong></div>
          <div className="cart-drawer-actions"><button className="cart-secondary-action" type="button" onClick={onViewCart}>VIEW CART</button><button className="cart-primary-action" type="button" onClick={onCheckout}>CHECKOUT NOW</button></div>
        </div>
      </> : <div className="utility-panel-empty"><i className="bi bi-bag" aria-hidden="true" /><p>Your cart is empty.</p><button type="button" onClick={onClose}>Continue shopping</button></div> : product ? <>
        <div className="utility-panel-scroll">
          <img className="book-preview-cover" src={product.image} alt={product.title} loading="lazy" decoding="async" />
          <div className="book-preview-copy"><h2>{product.title}</h2><p className="book-preview-author">{product.author}</p><p className="book-preview-price">{product.price}</p></div>
          <dl className="book-preview-details"><div><dt>Publisher</dt><dd>{publisher}</dd></div><div><dt>ISBN</dt><dd>978-0-00-000000-0</dd></div><div><dt>Format</dt><dd>Paperback</dd></div><div><dt>Language</dt><dd>English</dd></div><div><dt>Pages</dt><dd>320 pages</dd></div></dl>
          <a className="book-preview-link" href="#a" onClick={(event) => { event.preventDefault(); onOpenDetail(product) }}>View full details <span aria-hidden="true">→</span></a>
        </div>
        <div className="utility-panel-footer book-preview-actions"><button className="book-preview-add-button" type="button" onClick={() => onAddToCart(product)}>Add to cart</button><button className="book-preview-buy-button" type="button" onClick={() => onBuyNow(product)}>Buy Now</button></div>
      </> : <div className="utility-panel-empty"><img src="/assets/quick-view-illustration.png" alt="" aria-hidden="true" /><p>Hello — I’m here to help you preview book information.</p><span>Choose a book to see its cover and publication details.</span></div>}
    </aside>
  </div>
}

function Footer() {
  return <footer className="site-footer scroll-section" id="about">
    <div className="footer-copy">
      <h2>LINERY</h2>
      <p className="footer-quote">(pn.) /'lıməri/<br />a curated bookstore &amp; independent press, crafted in Hanoi</p>
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
    <div className="footer-art-frame">
      <img className="footer-art" src="/assets/footer-children-bright.png" alt="Ba bạn nhỏ đang đọc sách" loading="lazy" decoding="async" />
    </div>
  </footer>
}

const getPriceValue = (price: string) => Number(price.replace(/[^0-9]/g, '')) || 0
const formatPrice = (value: number) => `${value.toLocaleString('vi-VN')}₫`

function CartItemRow({ item, onRemove, onChangeQuantity }: { item: CartItem; onRemove: () => void; onChangeQuantity: (delta: number) => void }) {
  return <article className="cart-item-row">
    <img className="cart-item-image" src={item.product.image} alt="" />
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

function CartDrawer({ items, onClose, onRemove, onChangeQuantity, onViewCart, onCheckout }: { items: CartItem[]; onClose: () => void; onRemove: (title: string) => void; onChangeQuantity: (title: string, delta: number) => void; onViewCart: () => void; onCheckout: () => void }) {
  const subtotal = items.reduce((sum, item) => sum + getPriceValue(item.product.price) * item.quantity, 0)
  return <div className="cart-drawer-layer" role="presentation">
    <button className="cart-drawer-backdrop" type="button" aria-label="Close cart" onClick={onClose} />
    <aside className="cart-drawer" aria-label="Shopping cart">
      <div className="cart-drawer-header">
        <h1>My Cart</h1>
        <button className="cart-drawer-close" type="button" aria-label="Close cart" onClick={onClose}>×</button>
      </div>
      {items.length > 0 ? <>
        <div className="cart-drawer-items">{items.map((item) => <CartItemRow key={item.product.title} item={item} onRemove={() => onRemove(item.product.title)} onChangeQuantity={(delta) => onChangeQuantity(item.product.title, delta)} />)}</div>
        <div className="cart-drawer-footer">
          <div className="cart-subtotal"><span>Subtotal</span><strong>{formatPrice(subtotal)}</strong></div>
          <div className="cart-drawer-actions"><button className="cart-secondary-action" type="button" onClick={onViewCart}>VIEW CART</button><button className="cart-primary-action" type="button" onClick={onCheckout}>CHECKOUT NOW</button></div>
        </div>
      </> : <div className="cart-drawer-empty"><i className="bi bi-bag" aria-hidden="true" /><p>Your cart is empty.</p><button type="button" onClick={onClose}>Continue shopping</button></div>}
    </aside>
  </div>
}

function CartPage({ onHome, onCheckout, items, onRemove, onChangeQuantity }: { onHome: () => void; onCheckout: () => void; items: CartItem[]; onRemove: (title: string) => void; onChangeQuantity: (title: string, delta: number) => void }) {
  const subtotal = items.reduce((sum, item) => sum + getPriceValue(item.product.price) * item.quantity, 0)
  if (items.length > 0) return <main className="cart-page"><div className="cart-layout"><section className="cart-filled-card" aria-labelledby="cart-title"><div className="cart-filled-header"><h1 id="cart-title">My Cart</h1><button className="cart-continue-link" type="button" onClick={onHome}>Continue shopping</button></div><div className="cart-filled-items">{items.map((item) => <CartItemRow key={item.product.title} item={item} onRemove={() => onRemove(item.product.title)} onChangeQuantity={(delta) => onChangeQuantity(item.product.title, delta)} />)}</div></section><aside className="cart-summary-panel" aria-labelledby="order-summary-title"><h2 id="order-summary-title">Order Summary</h2><div className="cart-summary-line"><span>Subtotal</span><strong>{formatPrice(subtotal)}</strong></div><div className="cart-summary-line"><span>Delivery fee</span><strong>Free</strong></div><div className="cart-summary-total"><span>Total</span><strong>{formatPrice(subtotal)}</strong></div><button className="cart-primary-action" type="button" onClick={onCheckout}>CHECKOUT NOW</button></aside></div></main>
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

function CheckoutPage({ items, onHome, onBackToCart }: { items: CartItem[]; onHome: () => void; onBackToCart: () => void }) {
  const [submitted, setSubmitted] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'paid'>('pending')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('vnpay')
  const [fulfillmentMethod, setFulfillmentMethod] = useState<FulfillmentMethod>('delivery')
  const [voucherCode, setVoucherCode] = useState('')
  const subtotal = items.reduce((sum, item) => sum + getPriceValue(item.product.price) * item.quantity, 0)

  if (submitted && paymentMethod === 'bank' && paymentStatus === 'pending') return <BankTransferPayment subtotal={subtotal} onConfirm={() => setPaymentStatus('paid')} onHome={onHome} onBackToCart={onBackToCart} />
  if (submitted) return <main className="checkout-page"><section className="checkout-success-card" aria-labelledby="checkout-success-title"><i className={`bi ${paymentStatus === 'paid' ? 'bi-check2' : 'bi-clock'}`} aria-hidden="true" /><p className="checkout-kicker">Order received</p><h1 id="checkout-success-title">Thank you for your order.</h1><div className={`checkout-payment-status checkout-payment-status-${paymentStatus}`}><strong>{paymentStatus === 'paid' ? 'Payment confirmed' : 'Payment pending'}</strong><span>{paymentStatus === 'paid' ? 'Your payment has been recorded successfully.' : 'Your order is recorded. Complete payment to update the status.'}</span></div>{paymentStatus === 'pending' && <><div className="checkout-payment-instructions"><strong>{paymentMethod === 'vnpay' ? 'VNPay - Wallet' : paymentMethod === 'bank' ? 'Bank transfer' : paymentMethod === 'momo' ? 'MoMo wallet' : paymentMethod === 'apple' ? 'Apple Pay' : 'ZaloPay'}</strong><span>{paymentMethod === 'vnpay' ? 'Continue in VNPay wallet to complete the payment.' : paymentMethod === 'momo' ? 'Continue in MoMo wallet to complete the payment.' : paymentMethod === 'apple' ? 'Continue in Apple Pay to complete the payment.' : 'Continue in ZaloPay to complete the payment.'}</span>{paymentMethod === 'momo' && <div className="checkout-momo-panel" aria-label="MoMo wallet payment"><img src="/assets/payment-momo.svg" alt="MoMo" /><small>MoMo wallet</small></div>}</div><button className="checkout-submit checkout-confirm-payment" type="button" onClick={() => setPaymentStatus('paid')}>I HAVE COMPLETED PAYMENT</button></>}<button className="cart-primary-action" type="button" onClick={onHome}>CONTINUE SHOPPING</button></section></main>
  if (items.length === 0) return <main className="cart-page"><section className="cart-empty-card" aria-labelledby="checkout-empty-title"><i className="bi bi-bag cart-empty-icon" aria-hidden="true" /><h1 id="checkout-empty-title">Your cart is empty</h1><p className="cart-empty-message">There are no products in your cart.</p><a className="cart-empty-action" href="/#home" onClick={(event) => { event.preventDefault(); onHome() }}>Continue shopping</a></section></main>

  return <main className="checkout-page">
    <div className="checkout-header"><button className="checkout-back" type="button" onClick={onBackToCart}><i className="bi bi-arrow-left" aria-hidden="true" /> Back to cart</button><p>LINERY CHECKOUT</p></div>
    <div className="checkout-layout">
      <section className="checkout-form-card" aria-labelledby="checkout-title">
        <p className="checkout-kicker">Complete your order</p>
        <h1 id="checkout-title">Checkout</h1>
        <form className="checkout-form" onSubmit={(event) => { event.preventDefault(); setSubmitted(true) }}>
          <fieldset><legend>Contact information</legend><label>Full name<input name="name" type="text" placeholder="Your full name" autoComplete="name" required /></label><div className="checkout-field-grid"><label>Email address<input name="email" type="email" placeholder="you@example.com" autoComplete="email" required /></label><label>Phone number<input name="phone" type="tel" placeholder="Your phone number" autoComplete="tel" required /></label></div></fieldset>
          <fieldset><legend>Payment method</legend><div className="checkout-payment-options"><label className="checkout-payment-option"><input type="radio" name="payment" value="vnpay" checked={paymentMethod === 'vnpay'} onChange={() => setPaymentMethod('vnpay')} /><span><strong>VNPay - Wallet</strong><small>Pay with your VNPay wallet.</small></span><img className="checkout-payment-icon" src="/assets/payment-vnpay.png" alt="VNPay" /></label><label className="checkout-payment-option"><input type="radio" name="payment" value="momo" checked={paymentMethod === 'momo'} onChange={() => setPaymentMethod('momo')} /><span><strong>MoMo wallet</strong><small>Pay securely with your MoMo wallet.</small></span><img className="checkout-payment-icon checkout-payment-icon-momo" src="/assets/payment-momo.svg" alt="MoMo" /></label><label className="checkout-payment-option"><input type="radio" name="payment" value="apple" checked={paymentMethod === 'apple'} onChange={() => setPaymentMethod('apple')} /><span><strong>Apple Pay</strong><small>Pay quickly with Apple Pay.</small></span><img className="checkout-payment-icon checkout-payment-icon-apple" src="/assets/payment-apple-pay.png" alt="Apple Pay" /></label><label className="checkout-payment-option"><input type="radio" name="payment" value="zalopay" checked={paymentMethod === 'zalopay'} onChange={() => setPaymentMethod('zalopay')} /><span><strong>ZaloPay</strong><small>Pay securely with your ZaloPay wallet.</small></span><img className="checkout-payment-icon checkout-payment-icon-zalopay" src="/assets/payment-zalopay.png" alt="ZaloPay" /></label><label className="checkout-payment-option checkout-payment-option-bank"><input type="radio" name="payment" value="bank" checked={paymentMethod === 'bank'} onChange={() => setPaymentMethod('bank')} /><span><strong>Bank transfer</strong><small>Complete the transfer using Linery payment details.</small></span><img className="checkout-payment-icon" src="/assets/payment-bank.png" alt="Bank transfer" /></label></div></fieldset>
          <fieldset><legend>Receiving method</legend><div className="checkout-method-tabs" role="tablist" aria-label="Receiving method"><button className={fulfillmentMethod === 'pickup' ? 'is-active' : ''} type="button" role="tab" aria-selected={fulfillmentMethod === 'pickup'} onClick={() => setFulfillmentMethod('pickup')}><i className={`bi ${fulfillmentMethod === 'pickup' ? 'bi-check-circle-fill' : 'bi-circle'}`} aria-hidden="true" />Pickup at counter</button><button className={fulfillmentMethod === 'delivery' ? 'is-active' : ''} type="button" role="tab" aria-selected={fulfillmentMethod === 'delivery'} onClick={() => setFulfillmentMethod('delivery')}><i className={`bi ${fulfillmentMethod === 'delivery' ? 'bi-check-circle-fill' : 'bi-circle'}`} aria-hidden="true" />Delivery</button></div>{fulfillmentMethod === 'pickup' ? <div className="checkout-tab-panel" role="tabpanel"><label className="checkout-select-field">Choose a store<select name="pickupStore" defaultValue="" required><option value="" disabled>Select a store</option><option value="store-1">Store 1: Hanoi Book Street, Cua Nam Ward, Hanoi</option><option value="store-2">Comming soon</option></select></label></div> : <div className="checkout-tab-panel checkout-delivery-fields" role="tabpanel"><label>Delivery address<input name="address" type="text" placeholder="House number and street" autoComplete="street-address" required /></label><div className="checkout-field-grid"><label>City<input name="city" type="text" placeholder="City" autoComplete="address-level2" required /></label><label>Postal code<input name="postalCode" type="text" placeholder="Postal code" autoComplete="postal-code" /></label></div><label>Delivery notes<textarea name="deliveryNotes" placeholder="Add instructions for delivery" rows={3} /></label></div>}</fieldset>
          <button className="checkout-submit" type="submit">CONTINUE TO PAYMENT</button>
        </form>
      </section>
      <aside className="checkout-summary" aria-labelledby="checkout-summary-title"><p className="checkout-kicker">Your order</p><h2 id="checkout-summary-title">Order summary</h2><div className="checkout-summary-items">{items.map((item) => <div className="checkout-summary-item" key={item.product.title}><img src={item.product.image} alt="" /><div><strong>{item.product.title}</strong><span>Qty {item.quantity}</span></div><b>{formatPrice(getPriceValue(item.product.price) * item.quantity)}</b></div>)}</div><form className="checkout-voucher" onSubmit={(event) => event.preventDefault()}><label htmlFor="voucher-code">Voucher / discount code</label><div className="checkout-voucher-row"><div className="checkout-voucher-input"><i className="bi bi-ticket-perforated" aria-hidden="true" /><input id="voucher-code" name="voucherCode" type="text" value={voucherCode} onChange={(event) => setVoucherCode(event.target.value)} placeholder="Enter your code" autoComplete="off" /></div><button type="submit">Apply</button></div></form><div className="cart-summary-line"><span>Subtotal</span><strong>{formatPrice(subtotal)}</strong></div><div className="cart-summary-line"><span>Delivery fee</span><strong>Free</strong></div><div className="cart-summary-total"><span>Total</span><strong>{formatPrice(subtotal)}</strong></div></aside>
    </div>
  </main>
}

function AccountPage({ onHome, onLogout, activeTab, onTabChange }: { onHome: () => void; onLogout: () => void; activeTab: AccountTab; onTabChange: (tab: AccountTab) => void }) {
  const setActiveTab = onTabChange
  const [saved, setSaved] = useState(false)

  return <main className="account-page">
    <section className="account-card" aria-labelledby="account-title">
      <div className="account-heading"><div><p className="checkout-kicker">My account</p><h1 id="account-title">Welcome back, Linery reader</h1><p>Manage your personal details, orders and account security in one place.</p></div><button className="account-back" type="button" onClick={onHome}>Continue shopping</button><nav className="account-mobile-header-nav" aria-label="Account sections"><button className={activeTab === 'profile' ? 'is-active' : ''} type="button" onClick={() => setActiveTab('profile')}><i className="bi bi-person" aria-hidden="true" /><span>Profile</span></button><button className={activeTab === 'orders' ? 'is-active' : ''} type="button" onClick={() => setActiveTab('orders')}><i className="bi bi-bag" aria-hidden="true" /><span>Order history</span></button><button className={activeTab === 'orders-demo' ? 'is-active' : ''} type="button" onClick={() => setActiveTab('orders-demo')}><i className="bi bi-bag-check" aria-hidden="true" /><span>Order history demo</span></button><button className={activeTab === 'transactions' ? 'is-active' : ''} type="button" onClick={() => setActiveTab('transactions')}><i className="bi bi-receipt" aria-hidden="true" /><span>Transaction history</span></button><button className={activeTab === 'security' ? 'is-active' : ''} type="button" onClick={() => setActiveTab('security')}><i className="bi bi-shield-lock" aria-hidden="true" /><span>Security</span></button><button className="account-mobile-header-logout" type="button" onClick={onLogout}><i className="bi bi-box-arrow-right" aria-hidden="true" /><span>Log out</span></button></nav></div>
      <div className="account-layout">
        <nav className="account-nav" aria-label="Account sections"><div className="account-nav-options">
          <button className={activeTab === 'profile' ? 'is-active' : ''} type="button" onClick={() => setActiveTab('profile')}><i className="bi bi-person" aria-hidden="true" />Profile</button>
          <button className={activeTab === 'orders' ? 'is-active' : ''} type="button" onClick={() => setActiveTab('orders')}><i className="bi bi-bag" aria-hidden="true" />Order history</button>
          <button className={`account-order-nav ${activeTab === 'orders-demo' ? 'is-active' : ''}`} type="button" onClick={() => setActiveTab('orders-demo')}><i className="bi bi-bag-check" aria-hidden="true" /><span>Order history demo</span><span className="account-nav-info" tabIndex={0} aria-label="Demo order history"><i className="bi bi-info-circle" aria-hidden="true" /><span className="account-nav-tooltip" role="tooltip">Đây là màn hình demo lịch sử đơn hàng, dùng dữ liệu mẫu để Dev ghép API đơn hàng thực tế.</span></span></button>
          <button className={activeTab === 'transactions' ? 'is-active' : ''} type="button" onClick={() => setActiveTab('transactions')}><i className="bi bi-receipt" aria-hidden="true" />Transaction history</button>
          <button className={activeTab === 'security' ? 'is-active' : ''} type="button" onClick={() => setActiveTab('security')}><i className="bi bi-shield-lock" aria-hidden="true" />Security</button>
          <button className="account-logout" type="button" onClick={onLogout}><i className="bi bi-box-arrow-right" aria-hidden="true" />Log out</button></div>
        </nav>
        <div className="account-content">
          {activeTab === 'profile' && <form className="account-form" onSubmit={(event) => { event.preventDefault(); setSaved(true) }}><div className="account-section-heading"><h2>Personal information</h2><span>Keep your contact details up to date.</span></div><div className="account-field-grid"><label>Full name<input name="name" defaultValue="Linery Reader" /></label><label>Email address<input name="email" type="email" defaultValue="reader@example.com" /></label><label>Phone number<input name="phone" type="tel" placeholder="Add your phone number" /></label><label>Preferred language<select name="language" defaultValue="en"><option value="en">English</option><option value="vi">Tiếng Việt</option></select></label></div><button className="account-primary" type="submit">Save changes</button>{saved && <p className="account-message" role="status">Your account details have been saved.</p>}</form>}
          {activeTab === 'orders' && <div className="account-section"><div className="account-section-heading"><h2>Order history</h2><span>Track your recent Linery Books orders.</span></div><div className="account-order-empty"><i className="bi bi-journal-bookmark" aria-hidden="true" /><strong>No orders yet</strong><span>Your completed orders will appear here.</span><button className="account-primary" type="button" onClick={onHome}>Browse books</button></div></div>}
          {activeTab === 'orders-demo' && <div className="account-section"><div className="account-section-heading"><h2>Order history demo</h2><span>Sample order history for Dev integration.</span></div><div className="account-order-table-wrap"><table className="account-order-table"><thead><tr><th scope="col">Order code</th><th scope="col">Date</th><th scope="col">Status</th><th scope="col">Books</th><th scope="col">Total</th><th scope="col">Action</th></tr></thead><tbody><tr><td>#LINERY-20261027-001</td><td>27 Oct 2026</td><td><span className="account-order-status is-delivered">Delivered</span></td><td>3 books</td><td>1.200.000₫</td><td><button className="account-order-detail" type="button" onClick={() => setActiveTab('order-detail')}>View details <i className="bi bi-arrow-right" aria-hidden="true" /></button></td></tr><tr><td>#LINERY-20261012-008</td><td>12 Oct 2026</td><td><span className="account-order-status is-processing">Processing</span></td><td>2 books</td><td>740.000₫</td><td><button className="account-order-detail" type="button" onClick={() => setActiveTab('order-detail')}>View details <i className="bi bi-arrow-right" aria-hidden="true" /></button></td></tr></tbody></table></div><div className="account-order-list account-order-mobile-list"><article className="account-order-card"><div className="account-order-card-heading"><div><span className="account-order-code">#LINERY-20261027-001</span><strong>27 Oct 2026</strong></div><span className="account-order-status is-delivered">Delivered</span></div><div className="account-order-card-body"><span>3 books</span><strong>1.200.000₫</strong></div><button className="account-order-detail" type="button" onClick={() => setActiveTab('order-detail')}>View order details <i className="bi bi-arrow-right" aria-hidden="true" /></button></article><article className="account-order-card"><div className="account-order-card-heading"><div><span className="account-order-code">#LINERY-20261012-008</span><strong>12 Oct 2026</strong></div><span className="account-order-status is-processing">Processing</span></div><div className="account-order-card-body"><span>2 books</span><strong>740.000₫</strong></div><button className="account-order-detail" type="button" onClick={() => setActiveTab('order-detail')}>View order details <i className="bi bi-arrow-right" aria-hidden="true" /></button></article></div></div>}
          {activeTab === 'order-detail' && <div className="account-section"><button className="account-inline-back" type="button" onClick={() => setActiveTab('orders-demo')}><i className="bi bi-arrow-left" aria-hidden="true" /> Back to order history demo</button><div className="account-section-heading"><h2>Order details</h2><span>#LINERY-20261027-001 · 27 Oct 2026</span></div><div className="account-detail-status"><span>Delivered</span><small>Your order has been completed.</small></div><div className="account-detail-payment"><div><span>Payment method</span><strong>Bank transfer</strong></div><div><span>Transaction ID</span><strong>TRX-LINERY-001</strong></div><div><span>Payment status</span><strong className="is-paid">Paid</strong></div></div><div className="account-detail-items"><div><span>Power, Politics, and Culture</span><small>Qty 1</small><strong>460.000₫</strong></div><div><span>Ethics: A Very Short Introduction</span><small>Qty 1</small><strong>460.000₫</strong></div><div><span>Existentialism: A Very Short Introduction</span><small>Qty 1</small><strong>280.000₫</strong></div></div><div className="account-detail-summary"><div><span>Subtotal</span><strong>1.200.000₫</strong></div><div><span>Discount</span><strong>−0₫</strong></div><div><span>Delivery fee</span><strong>Free</strong></div><div className="account-detail-total"><span>Total paid</span><strong>1.200.000₫</strong></div></div></div>}
          {activeTab === 'transactions' && <div className="account-section"><div className="account-section-heading"><h2>Transaction history</h2><span>Payment records only. Order details are kept in Order history.</span></div><div className="account-transaction-table-wrap"><table className="account-transaction-table"><thead><tr><th scope="col">Order code</th><th scope="col">Date</th><th scope="col">Transaction ID</th><th scope="col">Payment method</th><th scope="col">Amount</th></tr></thead><tbody><tr><td><button className="account-transaction-order" type="button" onClick={() => setActiveTab('transaction-detail')}>#LINERY-20261027-001</button><span className="account-transaction-mobile-meta">27 Oct 2026 · TRX-LINERY-001</span></td><td>27 Oct 2026</td><td>TRX-LINERY-001</td><td>Bank transfer</td><td className="account-transaction-paid">+1.200.000₫</td></tr><tr><td><button className="account-transaction-order" type="button" onClick={() => setActiveTab('transaction-detail')}>#LINERY-20261012-008</button><span className="account-transaction-mobile-meta">12 Oct 2026 · TRX-LINERY-008</span></td><td>12 Oct 2026</td><td>TRX-LINERY-008</td><td>VNPay - Wallet</td><td className="account-transaction-paid">+740.000₫</td></tr></tbody></table></div></div>}
          {activeTab === 'transaction-detail' && <div className="account-section"><button className="account-inline-back" type="button" onClick={() => setActiveTab('transactions')}><i className="bi bi-arrow-left" aria-hidden="true" /> Back to transaction history</button><div className="account-section-heading"><h2>Transaction details</h2><span>TRX-LINERY-001 · 27 Oct 2026</span></div><div className="account-transaction-detail-card"><div><span>Transaction ID</span><strong>TRX-LINERY-001</strong></div><div><span>Order code</span><button type="button" onClick={() => setActiveTab('order-detail')}>#LINERY-20261027-001 <i className="bi bi-arrow-up-right" aria-hidden="true" /></button></div><div><span>Payment method</span><strong>Bank transfer</strong></div><div><span>Payment status</span><strong className="is-paid">Paid</strong></div><div><span>Amount</span><strong className="account-transaction-detail-amount">1.200.000₫</strong></div></div></div>}
          {activeTab === 'security' && <form className="account-form" onSubmit={(event) => { event.preventDefault(); setSaved(true) }}><div className="account-section-heading"><h2>Password & security</h2><span>Update your password to keep your account protected.</span></div><label>Current password<input type="password" autoComplete="current-password" required /></label><label>New password<input type="password" autoComplete="new-password" required /></label><label>Confirm new password<input type="password" autoComplete="new-password" required /></label><button className="account-primary" type="submit">Update password</button>{saved && <p className="account-message" role="status">Your password has been updated.</p>}</form>}
        </div>
      </div>
    </section>
  </main>
}

function LoginPage({ onHome, onRegister, onForgotPassword, onLoginSuccess }: { onHome: () => void; onRegister: () => void; onForgotPassword: () => void; onLoginSuccess: () => void }) {
  const [message, setMessage] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [activeSlide, setActiveSlide] = useState(0)

  useEffect(() => {
    const timer = window.setInterval(() => setActiveSlide((slide) => (slide + 1) % loginSlides.length), 3000)
    return () => window.clearInterval(timer)
  }, [])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onLoginSuccess()
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
            <label htmlFor="login-email">Email Address <span className="required-mark" aria-hidden="true">*</span></label>
            <input id="login-email" name="email" type="text" placeholder="Enter Email" autoComplete="username" required />
            <label htmlFor="login-password">Password <span className="required-mark" aria-hidden="true">*</span></label>
            <div className="login-password-field">
              <input id="login-password" name="password" type={showPassword ? 'text' : 'password'} placeholder="Enter Password" autoComplete="current-password" required />
              <button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((visible) => !visible)}><i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`} aria-hidden="true" /></button>
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

type RecoveryMode = 'forgot-password' | 'password-reset-sent' | 'reset-password' | 'password-reset-complete'

function PasswordRecoveryPage({ mode, onHome, onLogin, onEmailSent, onResetPassword, onComplete }: { mode: RecoveryMode; onHome: () => void; onLogin: () => void; onEmailSent: () => void; onResetPassword: () => void; onComplete: () => void }) {
  const [activeSlide, setActiveSlide] = useState(0)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)

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
          {isForgotForm && <form className="login-form" onSubmit={(event) => { event.preventDefault(); onEmailSent() }}><label htmlFor="recovery-email">Email Address <span className="required-mark" aria-hidden="true">*</span></label><input id="recovery-email" name="email" type="email" placeholder="Enter Email" autoComplete="email" required /><button className="login-submit" type="submit">SEND RESET LINK</button></form>}
          {isSent && <div className="recovery-status-card" role="status"><i className="bi bi-envelope-check" aria-hidden="true" /><strong>Reset email sent</strong><span>We’ve sent the password recovery email successfully. Please check your inbox and follow the link to create a new password.</span><button className="login-submit" type="button" onClick={onResetPassword}>OPEN RESET LINK</button></div>}
          {isResetForm && <form className="login-form" onSubmit={(event) => { event.preventDefault(); onComplete() }}><label htmlFor="new-password">New Password <span className="required-mark" aria-hidden="true">*</span></label><div className="login-password-field"><input id="new-password" name="password" type={showPassword ? 'text' : 'password'} placeholder="Enter new password" autoComplete="new-password" required /><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((visible) => !visible)}><i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`} aria-hidden="true" /></button></div><label htmlFor="confirm-new-password">Confirm Password <span className="required-mark" aria-hidden="true">*</span></label><div className="login-password-field"><input id="confirm-new-password" name="confirmPassword" type={showConfirmation ? 'text' : 'password'} placeholder="Confirm new password" autoComplete="new-password" required /><button type="button" aria-label={showConfirmation ? 'Hide confirmation password' : 'Show confirmation password'} onClick={() => setShowConfirmation((visible) => !visible)}><i className={`bi ${showConfirmation ? 'bi-eye-slash' : 'bi-eye'}`} aria-hidden="true" /></button></div><button className="login-submit" type="submit">SAVE NEW PASSWORD</button></form>}
          {isComplete && <div className="recovery-status-card recovery-complete-card" role="status"><i className="bi bi-check2-circle" aria-hidden="true" /><strong>Password changed</strong><span>You can now sign in with your new password and continue discovering your next read.</span><button className="login-submit" type="button" onClick={onLogin}>BACK TO SIGN IN</button></div>}
          {!isComplete && <p className="recovery-back-link"><button type="button" onClick={onLogin}>Back to sign in</button></p>}
        </div>
      </div>
    </section>
  </main>
}

function RegisterPage({ onHome, onLogin, language }: { onHome: () => void; onLogin: () => void; language: 'en' | 'vi' }) {
  const [message, setMessage] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [activeSlide, setActiveSlide] = useState(0)

  useEffect(() => {
    const timer = window.setInterval(() => setActiveSlide((slide) => (slide + 1) % loginSlides.length), 3000)
    return () => window.clearInterval(timer)
  }, [])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMessage('Account creation is ready for connection to your account service.')
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
            <label htmlFor="register-name">{language === 'vi' ? 'Tên đăng nhập' : 'Username'} <span className="required-mark" aria-hidden="true">*</span></label>
            <input id="register-name" name="username" type="text" placeholder={language === 'vi' ? 'Tên đăng nhập của bạn' : 'Enter Username'} autoComplete="username" required />
            <label htmlFor="register-email">Email Address <span className="required-mark" aria-hidden="true">*</span></label>
            <input id="register-email" name="email" type="email" placeholder="Enter Email" autoComplete="email" required />
            <label htmlFor="register-password">Password <span className="required-mark" aria-hidden="true">*</span></label>
            <div className="login-password-field">
              <input id="register-password" name="password" type={showPassword ? 'text' : 'password'} placeholder="Enter Password" autoComplete="new-password" required />
              <button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((visible) => !visible)}><i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`} aria-hidden="true" /></button>
            </div>
            <label htmlFor="register-confirm-password">Confirm Password <span className="required-mark" aria-hidden="true">*</span></label>
            <div className="login-password-field">
              <input id="register-confirm-password" name="confirmPassword" type={showConfirmation ? 'text' : 'password'} placeholder="Enter Password" autoComplete="new-password" required />
              <button type="button" aria-label={showConfirmation ? 'Hide confirmation password' : 'Show confirmation password'} onClick={() => setShowConfirmation((visible) => !visible)}><i className={`bi ${showConfirmation ? 'bi-eye-slash' : 'bi-eye'}`} aria-hidden="true" /></button>
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
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false)
  const [quickViewOpen, setQuickViewOpen] = useState(false)
  const [utilityPanelTab, setUtilityPanelTab] = useState<'cart' | 'quickview'>('cart')
  const [quickViewAvailable, setQuickViewAvailable] = useState(() => window.matchMedia('(min-width: 1101px)').matches)
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const previewCloseTimer = useRef<number | null>(null)

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
    document.body.classList.toggle('cart-drawer-open', cartDrawerOpen)
    return () => document.body.classList.remove('cart-drawer-open')
  }, [cartDrawerOpen])

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

  const completeLogin = () => {
    setIsAuthenticated(true)
    showAccount()
  }

  const logout = () => {
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

  const showResetPassword = () => {
    navigateTo('/#reset-password')
    setView('reset-password')
  }

  const showPasswordResetComplete = () => {
    navigateTo('/#password-reset-complete')
    setView('password-reset-complete')
  }

  const showAuthors = (filter: WriterDirectoryFilter = 'all') => {
    navigateTo(filter === 'all' ? '/authors' : `/authors?type=${filter}`)
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
    setCartDrawerOpen(false)
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
    navigateTo(`/authors/${authorSlug(author)}`)
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

  const addToCart = (product: Product) => {
    if (product.available === false) return
    setCartItems((items) => {
      const existing = items.find((item) => item.product.title === product.title)
      return existing ? items.map((item) => item.product.title === product.title ? { ...item, quantity: item.quantity + 1 } : item) : [...items, { product, quantity: 1 }]
    })
    setUtilityPanelTab('cart')
    setQuickViewOpen(false)
    setCartDrawerOpen(true)
  }
  const removeFromCart = (title: string) => setCartItems((items) => items.filter((item) => item.product.title !== title))
  const changeCartQuantity = (title: string, delta: number) => setCartItems((items) => items.map((item) => item.product.title === title ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item))
  const closeCartDrawer = () => setCartDrawerOpen(false)
  const openCartDrawer = () => {
    setUtilityPanelTab('cart')
    setQuickViewOpen(false)
    setCartDrawerOpen(true)
  }
  const checkout = () => showCheckout()
  const buyNow = (product: Product) => {
    if (product.available === false) return
    addToCart(product)
    setCartDrawerOpen(false)
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
    setUtilityPanelTab('quickview')
    setCartDrawerOpen(false)
    setPreviewProduct(null)
    setQuickViewOpen(true)
  }
  const openPreview = (product: Product) => {
    if (!quickViewOpen) return
    if (previewCloseTimer.current !== null) window.clearTimeout(previewCloseTimer.current)
    setPreviewProduct(product)
  }
  const schedulePreviewClose = () => undefined
  const selectQuickView = (product: Product) => {
    setUtilityPanelTab('quickview')
    setCartDrawerOpen(false)
    setQuickViewOpen(true)
    setPreviewProduct(product)
  }
  const closePreview = () => {
    if (previewCloseTimer.current !== null) window.clearTimeout(previewCloseTimer.current)
    setPreviewProduct(null)
    setQuickViewOpen(false)
  }

  const changeUtilityPanelTab = (tab: 'cart' | 'quickview') => {
    setUtilityPanelTab(tab)
    if (tab === 'cart') {
      setQuickViewOpen(false)
      setCartDrawerOpen(true)
    } else {
      setCartDrawerOpen(false)
      setQuickViewOpen(true)
    }
  }

  return <>
    {isEnhancedVariant && welcomeOpen && <WelcomeScreen onSelectLanguage={selectLanguage} />}
    <div id="top" className={`page-shell ${(quickViewAvailable && quickViewOpen) || cartDrawerOpen ? 'utility-panel-active' : ''}`}>
    <Header cartCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)} menuOpen={menuOpen} onMenu={() => setMenuOpen(!menuOpen)} onHome={showHome} onLogin={view === 'account' || isAuthenticated ? () => { showAccount(); setAccountMenuOpen((open) => !open) } : showLogin} onLogout={logout} onShop={showShop} onShopHover={(open) => setShopOpen(open)} onAllWriters={() => showAuthors('all')} onAuthors={() => showAuthors('authors')} onTranslators={() => showAuthors('translators')} onAllBooks={showAllBooks} onCollection={showCollection} onSearch={showSearch} onQuickView={toggleQuickView} onCart={showCart} quickViewOpen={quickViewOpen} quickViewAvailable={quickViewAvailable} activeView={view} shopOpen={shopOpen} writersOpen={writersOpen} onWritersHover={(open) => setWritersOpen(open)} onDesktopMenuHover={(open) => { setHeroMotionOpen(open); if (!open) { setShopOpen(false); setWritersOpen(false) } }} accountMenuOpen={accountMenuOpen} onAccountMenuToggle={() => setAccountMenuOpen(false)} accountTab={accountTab} onAccountTabChange={(tab) => { setAccountTab(tab); showAccount() }} accountMenuEnabled={isAuthenticated || view === 'account'} />
    <button className={`mobile-backdrop ${menuOpen ? 'is-open' : ''}`} aria-label="Close menu" aria-hidden={!menuOpen} onClick={() => setMenuOpen(false)} />
    <MobileMenu isOpen={menuOpen} onShop={showHome} onAllBooks={showAllBooks} onCollection={showCollection} onAllWriters={() => showAuthors('all')} onAuthors={() => showAuthors('authors')} onTranslators={() => showAuthors('translators')} onSearch={showSearch} language={language} onSelectLanguage={selectLanguage} />
     {view === 'account' ? <AccountPage onHome={showHome} onLogout={logout} activeTab={accountTab} onTabChange={(tab) => { setAccountTab(tab); setAccountMenuOpen(false) }} /> : view === 'authors' ? <AuthorsDirectory filter={writerFilter} /> : view === 'all-books' ? <AllBooksPage onHome={showHome} onOpenDetail={showDetail} onAddToCart={addToCart} onPreview={openPreview} onPreviewLeave={schedulePreviewClose} onSelectQuickView={selectQuickView} quickViewOpen={quickViewAvailable && quickViewOpen} /> : view === 'collection' ? <AllBooksPage collectionTitle={selectedCollection ?? collectionTitles[0]} onHome={showHome} onOpenDetail={showDetail} onAddToCart={addToCart} onPreview={openPreview} onPreviewLeave={schedulePreviewClose} onSelectQuickView={selectQuickView} quickViewOpen={quickViewAvailable && quickViewOpen} /> : view === 'search' ? <SearchResultsPage query={searchQuery} onOpenDetail={showDetail} onAddToCart={addToCart} onPreview={openPreview} onPreviewLeave={schedulePreviewClose} onSelectQuickView={selectQuickView} quickViewOpen={quickViewAvailable && quickViewOpen} /> : view === 'author' ? <AuthorProfile author={selectedAuthor || 'Edward W. Said'} onBack={showAuthors} onOpenDetail={showDetail} onAddToCart={addToCart} onPreview={openPreview} onPreviewLeave={schedulePreviewClose} onSelectQuickView={selectQuickView} quickViewOpen={quickViewAvailable && quickViewOpen} /> : view === 'detail' ? <BookDetail product={selectedProduct ?? products[0]} onBack={showHome} onAuthor={showAuthor} onAddToCart={addToCart} onBuyNow={buyNow} /> : view === 'cart' ? <CartPage onHome={showHome} onCheckout={showCheckout} items={cartItems} onRemove={removeFromCart} onChangeQuantity={changeCartQuantity} /> : view === 'checkout' ? <CheckoutPage items={cartItems} onHome={showHome} onBackToCart={showCart} /> : view === 'news' ? <NewsPage language={language} onOpen={showNewsDetail} /> : view === 'news-detail' ? (selectedNews ? <NewsDetailPage item={selectedNews} language={language} onBack={showNews} /> : <NewsPage language={language} onOpen={showNewsDetail} />) : <main>
      <section className={`hero scroll-section ${heroMotionOpen ? 'is-shop-open' : ''}`} aria-label="Linery bookstore illustration">
        <div className="hero-art">
          <img className="hero-art-base" src="/assets/hero-children.png" alt="Các em nhỏ cùng đọc sách trên nền đỏ" />
          <img className="hero-art-hover" src="/assets/hero-children-shop-hover.webp" alt="" aria-hidden="true" />
        </div>
      </section>
      <div id="shop" className="collections">{sections.map(section => <Collection key={section.title} {...section} onCollection={showCollection} onOpenDetail={showDetail} onAddToCart={addToCart} onPreview={openPreview} onPreviewLeave={schedulePreviewClose} onSelectQuickView={selectQuickView} quickViewOpen={quickViewAvailable && quickViewOpen} />)}</div>
    <LineryNewsSection language={language} onOpen={showNewsDetail} onSeeMore={showNews} />
    </main>}
    <Footer />
    <button className={`scroll-to-top ${showScrollTop ? 'is-visible' : ''}`} type="button" aria-label="Scroll to top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} tabIndex={showScrollTop ? 0 : -1}>
      <i className="bi bi-arrow-up" aria-hidden="true" />
    </button>
    </div>
    {view === 'login' && <LoginPage onHome={showHome} onRegister={showRegister} onForgotPassword={showForgotPassword} onLoginSuccess={completeLogin} />}
    {view === 'register' && <RegisterPage onHome={showHome} onLogin={showLogin} language={language} />}
    {(view === 'forgot-password' || view === 'password-reset-sent' || view === 'reset-password' || view === 'password-reset-complete') && <PasswordRecoveryPage mode={view} onHome={showHome} onLogin={showLogin} onEmailSent={showPasswordResetSent} onResetPassword={showResetPassword} onComplete={showPasswordResetComplete} />}
    {((quickViewAvailable && quickViewOpen) || cartDrawerOpen) && <UtilityPanel activeTab={utilityPanelTab} items={cartItems} product={previewProduct} onTabChange={changeUtilityPanelTab} onClose={utilityPanelTab === 'cart' ? closeCartDrawer : closePreview} onRemove={removeFromCart} onChangeQuantity={changeCartQuantity} onViewCart={() => { closeCartDrawer(); showCart() }} onCheckout={checkout} onOpenDetail={showDetail} onAddToCart={addToCart} onBuyNow={buyNow} />}
  </>
}
