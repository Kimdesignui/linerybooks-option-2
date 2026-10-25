import { useEffect, useRef, useState, type ElementType, type FormEvent } from 'react'
import { Menu } from 'lucide-react'
import 'bootstrap-icons/font/bootstrap-icons.css'

type Product = { image: string; gallery?: string[]; title: string; author: string; price: string; categories: string[]; available?: boolean }
type NewsItem = { image: string; title: string; titleVi: string; date: string; kicker: string; slug: string; excerpt: string; excerptVi: string; body: string[]; bodyVi: string[] }
type View = 'home' | 'authors' | 'all-books' | 'search' | 'author' | 'detail' | 'cart' | 'news' | 'news-detail' | 'login' | 'register'
type ProductCardActions = { onOpenDetail: (product: Product) => void; onAddToCart: (product: Product) => void; onPreview: (product: Product) => void; onPreviewLeave: () => void; onSelectQuickView: (product: Product) => void; quickViewOpen: boolean }
const loginSlides = [
  { image: '/assets/login-bookstore.png', quote: 'Find a story that feels like coming home.' },
  { image: '/assets/login-library-reader.png', quote: 'Every shelf holds a doorway to somewhere new.' },
  { image: '/assets/login-library-reader-older.png', quote: 'A quiet page can change the way we see the world.' },
  { image: '/assets/login-library-lamp.png', quote: 'Read slowly. Let the story stay with you.' },
  { image: '/assets/login-library-woman.png', quote: 'Books make room for wonder.' },
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
  { image: '/assets/cover-edward.png', title: 'Power, Politics, and Culture: Interviews with Edward W. Said', author: 'Edward W. Said', price: '460.000₫', categories: ['Essays', 'Literary Criticism'] },
  { image: '/assets/cover-ethics.png', title: 'Ethics: A Very Short Introduction', author: 'Simon Blackburn', price: '460.000₫', categories: ['Non-fiction', 'Philosophy'] },
  { image: '/assets/cover-existentialism.png', title: 'Existentialism: A Very Short Introduction', author: 'Thomas R. Flynn', price: '460.000₫', categories: ['Non-fiction', 'Philosophy'] },
  { image: '/assets/cover-jung.png', title: 'Jung: A Very Short Introduction', author: 'Anthony Stevens', price: '460.000₫', categories: ['Non-fiction', 'Psychology'] },
  { image: '/assets/cover-derrida.png', title: 'Derrida: A Very Short Introduction', author: 'Simon Glendinning', price: '280.000₫', categories: ['Non-fiction', 'Literary Criticism'] },
  { image: '/assets/cover-black-folk.png', title: 'The Souls of Black Folk', author: 'W. E. B. Du Bois', price: '310.000₫', categories: ['Essays', 'History'] },
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

const authorProfiles: Record<string, { image: string; images?: string[]; born: string; died: string; bornPlace: string; diedPlace: string; bio: string }> = {
  'Edward W. Said': {
    image: '/assets/author-edward-w-said.png',
    images: ['/assets/author-edward-w-said.png', '/assets/author-edward-w-said-02.jpg', '/assets/author-edward-w-said-03.jpg'],
    born: '1 Nov 1935',
    died: '25 Sep 2003',
    bornPlace: 'Jerusalem, Palestine',
    diedPlace: 'New York, U.S.',
    bio: 'Edward W. Said was a literary theorist, cultural critic and public intellectual whose writing connected literature, politics and the lived experience of displacement. His work remains essential reading for understanding culture, representation and power.',
  },
}

const authorSlug = (author: string) => author.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-')
const getAuthorFromPath = (pathname: string) => {
  const slug = pathname.startsWith('/authors/') ? pathname.split('/').pop() ?? '' : ''
  return products.find((product) => authorSlug(product.author) === slug)?.author ?? ''
}

const sections = [
  { title: 'NEW & UPCOMING', items: products },
  { title: 'LINERY PRESS', items: products },
  { title: 'LINERY PICKS', items: products },
]

type MenuColumn = { eyebrow: string; links: string[] }
type ShopCategory = { label: string; children?: ShopCategory[] }

const shopCategories: ShopCategory[] = [
  { label: 'Books', children: [
    { label: 'Fiction', children: [{ label: 'Novels' }, { label: 'Short stories' }, { label: 'Poetry & Drama' }] },
    { label: 'Non-fiction', children: [{ label: 'Essays' }, { label: 'Research & Studies' }, { label: 'Memoir & Biography' }] },
  ] },
  { label: 'Authors' },
  { label: 'LINERY PRESS' },
  { label: 'LINERY JOURNAL' },
]
const shopOnlyCategories = shopCategories.filter((category) => category.label !== 'Authors')
const desktopShopColumns: MenuColumn[] = [
  { eyebrow: '', links: ['All books'] },
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

function ShopMenu({ onAllBooks }: { onAllBooks: () => void }) {
  return <section className="shop-menu menu-navigation" aria-label="Books categories">
    <div className="shop-menu-inner menu-navigation-inner">
      <div className="shop-menu-columns menu-navigation-list">
        {desktopShopColumns.map((column, columnIndex) => <div className={`shop-menu-column menu-section menu-branch menu-level-${columnIndex === 0 ? 0 : 1}`} key={column.eyebrow || column.links[0]}>
          {column.eyebrow && <p className="menu-eyebrow menu-section-title">{column.eyebrow}</p>}
          {column.links.map((link) => <a className="menu-item menu-item-link menu-item-text" href={link === 'All books' ? '/all-books' : `#${link.toLowerCase().replaceAll(' ', '-')}`} key={link} onClick={link === 'All books' ? (event) => { event.preventDefault(); onAllBooks() } : undefined}>{link}</a>)}
          </div>)}
      </div>
    </div>
  </section>
}

function MobileMenu({ isOpen, onShop, onAllBooks, onAuthors, onSearch, language, onSelectLanguage }: { isOpen: boolean; onShop: () => void; onAllBooks: () => void; onAuthors: () => void; onSearch: (query: string) => void; language: 'en' | 'vi'; onSelectLanguage: (language: 'en' | 'vi') => void }) {
  const [openBranches, setOpenBranches] = useState<Record<string, boolean>>({ Books: true, Fiction: true, 'Non-fiction': true, 'Linery Press': true })
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
        <a className="mobile-menu-icon" href="#wishlist" aria-label="Wishlist"><i className="bi bi-heart" aria-hidden="true" /></a>
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
        <button className="mobile-menu-item mobile-menu-level-1 menu-item menu-level-1" onClick={onAuthors}><span className="mobile-menu-text menu-item-text">View All</span><span aria-hidden="true">→</span></button>
        <button className="mobile-menu-item mobile-menu-level-1 menu-item menu-level-1" onClick={onAuthors}><span className="mobile-menu-text menu-item-text">Authors</span></button>
        <button className="mobile-menu-item mobile-menu-level-1 menu-item menu-level-1" onClick={onAuthors}><span className="mobile-menu-text menu-item-text">Translators</span></button>
      </div>
    </section>
  </aside>
}

function AuthorsDirectory() {
  return <main className="directory-page">
    <section className="directory-section" aria-labelledby="authors-title">
      <p className="directory-kicker" id="authors-title">Authors</p>
      <div className="directory-grid"><MenuColumns columns={authorColumns} /></div>
    </section>
    <section className="directory-section translators" aria-labelledby="translators-title">
      <p className="directory-kicker" id="translators-title">Translators</p>
      <div className="directory-grid"><MenuColumns columns={translatorColumns} /></div>
    </section>
  </main>
}

function AuthorProfile({ author, onBack, ...actions }: { author: string; onBack: () => void } & ProductCardActions) {
  const authorBooks = products.filter((product) => product.author === author)
  const [authorFactsOpen, setAuthorFactsOpen] = useState(true)
  const [authorWorksOpen, setAuthorWorksOpen] = useState(false)
  const [activeAuthorImage, setActiveAuthorImage] = useState(0)
  const [authorLightboxOpen, setAuthorLightboxOpen] = useState(false)
  const authorLightboxTrackRef = useRef<HTMLDivElement>(null)
  const profile = authorProfiles[author] ?? {
    image: '',
    born: '—',
    died: '—',
    bornPlace: 'Linery catalogue',
    diedPlace: 'Linery catalogue',
    bio: `${author} is part of the Linery catalogue, a curated selection of literary voices and essential works for curious readers.`,
  }
  const authorImages = profile.images ?? [profile.image]

  useEffect(() => {
    setActiveAuthorImage(0)
  }, [author])

  useEffect(() => {
    if (!authorLightboxOpen) return undefined
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setAuthorLightboxOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [authorLightboxOpen])

  useEffect(() => {
    if (!authorLightboxOpen || !authorLightboxTrackRef.current) return undefined
    const track = authorLightboxTrackRef.current
    window.requestAnimationFrame(() => track.scrollTo({ left: activeAuthorImage * track.clientWidth, behavior: 'auto' }))
    return undefined
  }, [authorLightboxOpen, activeAuthorImage])

  return <main className="author-page">
    <div className="author-page-content">
      <section className="author-profile-hero" aria-labelledby="author-profile-title">
        <div className="author-profile-media">
          <figure className="author-portrait-frame">
            <button className="detail-mobile-back" type="button" aria-label="Back to authors" onClick={onBack}><i className="bi bi-arrow-left" aria-hidden="true" /></button>
            {authorImages[activeAuthorImage] ? <button className="author-portrait-trigger" type="button" aria-label={`Open portrait ${activeAuthorImage + 1} of ${author}`} onClick={() => setAuthorLightboxOpen(true)}><img src={authorImages[activeAuthorImage]} alt={`${author} portrait ${activeAuthorImage + 1}`} className="author-portrait" /></button> : <i className="bi bi-person" aria-hidden="true" />}
            {authorImages.length > 1 && <div className="author-portrait-dots" aria-label="Author photos">
              {authorImages.map((image, index) => <button key={image} type="button" className={index === activeAuthorImage ? 'is-active' : ''} aria-label={`Show author photo ${index + 1}`} aria-pressed={index === activeAuthorImage} onClick={() => setActiveAuthorImage(index)} />)}
            </div>}
          </figure>
        </div>
        <div className="author-profile-copy">
          <nav className="author-breadcrumb" aria-label="Breadcrumb">
            <button className="author-breadcrumb-link" type="button" onClick={onBack}>Authors</button>
            <span className="author-breadcrumb-separator" aria-hidden="true">/</span>
            <span className="author-breadcrumb-current" aria-current="page">{author}</span>
          </nav>
          <h1 id="author-profile-title">{author}</h1>
          <dl className="author-life-facts" aria-label={`${author} life dates`}>
            <div><dt>Born</dt><dd>{profile.born}</dd></div>
            <div><dt>Died</dt><dd>{profile.died}</dd></div>
          </dl>
          <p className="author-profile-bio">{profile.bio}</p>
          <section className="author-collapsible-section author-details-section" aria-labelledby="author-facts-title">
            <button className="author-section-toggle" type="button" aria-expanded={authorFactsOpen} aria-controls="author-facts-content" onClick={() => setAuthorFactsOpen((open) => !open)}>
              <span id="author-facts-title">Author details</span>
              <i className={`bi bi-${authorFactsOpen ? 'dash' : 'plus'}-lg`} aria-hidden="true" />
            </button>
            {authorFactsOpen && <dl className="author-profile-facts" id="author-facts-content">
              <div><dt>Catalogue</dt><dd>Linery Books</dd></div>
              <div><dt>Selected works</dt><dd>{authorBooks.length} {authorBooks.length === 1 ? 'title' : 'titles'}</dd></div>
            </dl>}
          </section>
          <section className="author-books" aria-labelledby="author-books-title">
            <h2 id="author-books-title">Selected works</h2>
            <div className="author-books-grid" id="author-works-content">
              {(authorWorksOpen ? authorBooks : authorBooks.slice(0, 3)).map((product) => <ProductCard key={product.title} product={product} {...actions} />)}
              {!authorWorksOpen && authorBooks.length > 3 && <button className="author-books-expand" type="button" aria-label="Show all selected works" aria-expanded="false" aria-controls="author-works-content" onClick={() => setAuthorWorksOpen(true)}><i className="bi bi-chevron-down" aria-hidden="true" /></button>}
            </div>
          </section>
        </div>
      </section>
    </div>
    {authorLightboxOpen && <div className="book-lightbox" role="dialog" aria-modal="true" aria-label={`Image gallery for ${author}`} onClick={() => setAuthorLightboxOpen(false)}>
      <div className="book-lightbox-frame" onClick={(event) => event.stopPropagation()}>
        <div className="author-lightbox-track" ref={authorLightboxTrackRef} aria-label="Author images" onScroll={(event) => {
          const track = event.currentTarget
          const nextIndex = Math.round(track.scrollLeft / track.clientWidth)
          if (nextIndex !== activeAuthorImage) setActiveAuthorImage(nextIndex)
        }}>
          {authorImages.map((image, index) => <figure className="author-lightbox-slide" key={`${image}-${index}`}><img className="book-lightbox-image" src={image} alt={`${author} portrait ${index + 1}`} loading={index === 0 ? 'eager' : 'lazy'} decoding="async" /></figure>)}
        </div>
        <button className="book-lightbox-close" type="button" aria-label="Close gallery" onClick={() => setAuthorLightboxOpen(false)}><i className="bi bi-x-lg" aria-hidden="true" /></button>
      </div>
    </div>}
  </main>
}

function AllBooksPage({ onHome, ...actions }: { onHome: () => void } & ProductCardActions) {
  const allBooks = Array.from({ length: 28 }, (_, rowIndex) => products.map((product, productIndex) => ({
    ...product,
    key: `${rowIndex}-${productIndex}-${product.title}`,
  }))).flat()
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 24
  const pageCount = Math.ceil(allBooks.length / pageSize)
  const visibleBooks = allBooks.slice((currentPage - 1) * pageSize, currentPage * pageSize)
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
      <nav className="all-books-breadcrumb" aria-label="Breadcrumb"><a href="/#home" onClick={(event) => { event.preventDefault(); onHome() }}>Home</a><span aria-hidden="true">/</span><span>All Books</span></nav>
      <section className="all-books-panel" aria-labelledby="all-books-title">
        <RibbonTitle title="ALL BOOKS" id="all-books-title" heading />
        <div className="all-books-grid">{visibleBooks.map((product) => <ProductCard key={product.key} product={product} {...actions} />)}</div>
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
        <p>We couldn’t find a book matching “{query}”. Try another title, author, or category.</p>
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

function Header({ cartCount, onMenu, onShop, onShopHover, onAuthors, onAllBooks, onSearch, onQuickView, onCart, quickViewOpen, quickViewAvailable, activeView, shopOpen, onDesktopMenuHover }: { cartCount: number; onMenu: () => void; onShop: () => void; onShopHover: (open: boolean) => void; onAuthors: () => void; onAllBooks: () => void; onSearch: (query: string) => void; onQuickView: () => void; onCart: () => void; quickViewOpen: boolean; quickViewAvailable: boolean; activeView: View; shopOpen: boolean; onDesktopMenuHover: (open: boolean) => void }) {
  const headerRef = useRef<HTMLElement | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')

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

  return <header ref={headerRef} className="site-header" onMouseLeave={() => onDesktopMenuHover(false)}>
    <div className="header-inner">
      <button className="menu-button" aria-label="Mở menu" onClick={onMenu}><Menu /></button>
      <nav className="desktop-nav" aria-label="Điều hướng chính" onMouseEnter={() => onDesktopMenuHover(true)}><button className="nav-link shop-nav-link" onClick={onShop} onMouseEnter={() => onShopHover(true)} onFocus={() => onShopHover(true)} aria-expanded={shopOpen}>Books</button><button className={`nav-link ${activeView === 'authors' ? 'is-active' : ''}`} onClick={onAuthors}>Authors</button><a className="nav-link nav-action-link" href="#wishlist">Wishlist</a><a className="nav-link nav-action-link" href="#login">Login</a></nav>
      <a className="brand" href="/" aria-label="Linery Bookstore home">LINERY BOOKSTORE</a>
      <div className="header-actions">
        <form className={`search-control ${searchOpen ? 'is-open' : ''}`} onSubmit={submitSearch}>
          <button className="search-toggle" type="button" aria-label="Tìm kiếm" aria-expanded={searchOpen} onClick={() => setSearchOpen((open) => !open)}><img src="/assets/icon-search.svg" alt="" /></button>
          <input className="search-input" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search books" aria-label="Search books" autoFocus={searchOpen} onKeyDown={(event) => { if (event.key === 'Escape') setSearchOpen(false) }} />
        </form>
        {quickViewAvailable && <button className={`quick-view-button ${quickViewOpen ? 'is-active' : ''}`} type="button" onClick={onQuickView} aria-expanded={quickViewOpen}>Quick view</button>}
        <a className="icon-button cart-button" href="/cart" aria-label={`Giỏ hàng, ${cartCount} sản phẩm`} onClick={(event) => { event.preventDefault(); onCart() }}><img src="/assets/icon-cart.svg" alt="" />{cartCount > 0 && <span>{cartCount}</span>}</a>
      </div>
    </div>
    {shopOpen && activeView !== 'authors' && <ShopMenu onAllBooks={onAllBooks} />}
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
              <button className="product-cart" type="button" aria-label={`Add ${product.title} to cart`} onClick={(event) => { event.preventDefault(); event.stopPropagation(); onAddToCart(product) }}><i className="bi bi-cart3 product-action-icon" aria-hidden="true" /><span className="product-action-label">Add to cart</span></button>
            </div>
            <span className="product-overlay-cta">Read more...</span>
          </div>
        </div>
        <div className="product-info">
          <h3>{product.title}</h3>
          <p className="product-author">{product.author}</p>
          <p className="product-price">{product.price}</p>
        </div>
      </div>
    </a>
  </article>
}

function Collection({ title, items, ...actions }: { title: string; items: Product[] } & ProductCardActions) {
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
    <div className="pagination" aria-label={`${title} pagination`}>{slides.map((_, index) => <button key={`${title}-dot-${index}`} className={index === activeSlide ? 'active' : ''} aria-label={`Xem slide ${index + 1}`} aria-current={index === activeSlide ? 'true' : undefined} onClick={() => goToSlide(index)} />)}</div>
  </section>
}

function BookDetail({ product, onBack, onAuthor }: { product: Product; onBack: () => void; onAuthor: (author: string) => void }) {
  const galleryImages = [product.image]
  const demoAuthorPath = '/authors/edward-w-said'
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [activeImage, setActiveImage] = useState(0)
  const [descriptionExpanded, setDescriptionExpanded] = useState(false)
  const [reviewFormOpen, setReviewFormOpen] = useState(false)
  const [reviewSubmitted, setReviewSubmitted] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const unitPrice = Number(product.price.replace(/[^0-9]/g, ''))
  const totalPrice = `${(unitPrice * quantity).toLocaleString('vi-VN')}₫`

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
        <p className="book-detail-author">by <a href={demoAuthorPath} onClick={(event) => { event.preventDefault(); onAuthor('Edward W. Said') }}>{product.author}</a></p>
        <div className="book-detail-rule" />
        <div className="book-detail-category"><span>Classification</span><div>{product.categories.map((category) => <a className="book-classification-link" key={category} href={`/all-books?category=${encodeURIComponent(category.toLowerCase().replaceAll(' ', '-'))}`}>{category}</a>)}</div></div>
        <div className="book-detail-purchase">
          <div className="book-detail-price-row">
            <div className="book-detail-quantity" aria-label="Quantity">
              <span>Quantity</span>
              <div className="book-detail-quantity-control">
                <button type="button" aria-label="Decrease quantity" onClick={() => setQuantity((current) => Math.max(1, current - 1))}>−</button>
                <output>{quantity}</output>
                <button type="button" aria-label="Increase quantity" onClick={() => setQuantity((current) => current + 1)}>+</button>
              </div>
            </div>
            <p className="book-detail-price" aria-live="polite">{totalPrice}</p>
          </div>
          <div className="book-detail-actions">
            <button className="book-add-button" type="button">Add to basket</button>
            <button className="book-buy-button" type="button">Buy Now</button>
          </div>
        </div>
        <p className="book-detail-note">Available from Linery Bookstore</p>
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
          <dl><div><dt>Publisher</dt><dd>Linery Books</dd></div><div><dt>Published</dt><dd>2026</dd></div><div><dt>ISBN</dt><dd>9780000000000</dd></div><div><dt>Pages</dt><dd>320 pages</dd></div><div><dt>Language</dt><dd>English</dd></div><div><dt>Format</dt><dd>Paperback</dd></div><div><dt>Price</dt><dd>{product.price}</dd></div></dl>
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
  const publisher = product?.title.includes('Very Short') ? 'Oxford University Press' : 'Linery Books'
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
      <img className="footer-art" src="/assets/footer-children.png" alt="Ba bạn nhỏ đang đọc sách" loading="lazy" decoding="async" />
    </div>
  </footer>
}

function CartPage({ onHome }: { onHome: () => void }) {
  return <main className="cart-page">
    <section className="cart-empty-card" aria-labelledby="cart-empty-title">
      <p className="cart-kicker">Your basket</p>
        <img className="cart-empty-illustration" src="/assets/cart-empty-blue.png" alt="Empty shopping cart" />
      <h1 id="cart-empty-title">Your cart is empty</h1>
      <p className="cart-empty-message">There are no products in your cart.</p>
      <a className="cart-empty-action" href="/#home" onClick={(event) => { event.preventDefault(); onHome() }}>Continue shopping</a>
    </section>
  </main>
}

function LoginPage({ onHome, onRegister }: { onHome: () => void; onRegister: () => void }) {
  const [message, setMessage] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [activeSlide, setActiveSlide] = useState(0)

  useEffect(() => {
    const timer = window.setInterval(() => setActiveSlide((slide) => (slide + 1) % loginSlides.length), 3000)
    return () => window.clearInterval(timer)
  }, [])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMessage('Sign-in is ready for connection to your account service.')
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
      <div className="login-card" aria-labelledby="login-title">
        <button className="login-back" type="button" aria-label="Back to home" onClick={onHome}><i className="bi bi-arrow-left" aria-hidden="true" /></button>
        <div className="login-card-inner">
          <h1 id="login-title">Log in</h1>
          <p className="login-intro">Enter your email and password to securely access your account and manage your services.</p>
          <form className="login-form" onSubmit={handleSubmit}>
            <label htmlFor="login-email">Email Address / Username <span className="required-mark" aria-hidden="true">*</span></label>
            <input id="login-email" name="email" type="text" placeholder="Your Email Address / Username" autoComplete="username" required />
            <label htmlFor="login-password">Password <span className="required-mark" aria-hidden="true">*</span></label>
            <div className="login-password-field">
              <input id="login-password" name="password" type={showPassword ? 'text' : 'password'} placeholder="Your Password" autoComplete="current-password" required />
              <button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((visible) => !visible)}><i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`} aria-hidden="true" /></button>
            </div>
            <div className="login-options">
              <label className="login-remember"><input type="checkbox" name="remember" /> <span>Remember me</span></label>
              <a href="#login" onClick={(event) => event.preventDefault()}>Forgot Password</a>
            </div>
            <button className="login-submit" type="submit">Login</button>
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
            <input id="register-name" name="username" type="text" placeholder={language === 'vi' ? 'Tên đăng nhập của bạn' : 'Your Username'} autoComplete="username" required />
            <label htmlFor="register-email">Email Address <span className="required-mark" aria-hidden="true">*</span></label>
            <input id="register-email" name="email" type="email" placeholder="Your Email Address" autoComplete="email" required />
            <label htmlFor="register-password">Password <span className="required-mark" aria-hidden="true">*</span></label>
            <div className="login-password-field">
              <input id="register-password" name="password" type={showPassword ? 'text' : 'password'} placeholder="Your Password" autoComplete="new-password" required />
              <button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((visible) => !visible)}><i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`} aria-hidden="true" /></button>
            </div>
            <label htmlFor="register-confirm-password">Confirm Password <span className="required-mark" aria-hidden="true">*</span></label>
            <div className="login-password-field">
              <input id="register-confirm-password" name="confirmPassword" type={showConfirmation ? 'text' : 'password'} placeholder="Confirm Your Password" autoComplete="new-password" required />
              <button type="button" aria-label={showConfirmation ? 'Hide confirmation password' : 'Show confirmation password'} onClick={() => setShowConfirmation((visible) => !visible)}><i className={`bi ${showConfirmation ? 'bi-eye-slash' : 'bi-eye'}`} aria-hidden="true" /></button>
            </div>
            <label className="login-remember register-consent"><input type="checkbox" name="terms" required /> <span>{language === 'vi' ? <>Tôi đồng ý với <a className="login-consent-link" href="#terms">các điều khoản</a> và <a className="login-consent-link" href="#privacy-policy">chính sách bảo mật</a></> : <>I agree to the <a className="login-consent-link" href="#terms">terms</a> and <a className="login-consent-link" href="#privacy-policy">privacy policy</a></>}</span></label>
            <button className="login-submit" type="submit">Create account</button>
          </form>
          <p className="login-signup">Already have an account? <a href="#login" onClick={(event) => { event.preventDefault(); onLogin() }}>Log in</a></p>
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
  const [view, setView] = useState<View>(() => window.location.hash === '#login' ? 'login' : window.location.hash === '#register' ? 'register' : window.location.pathname === '/all-books' ? 'all-books' : window.location.pathname === '/search' ? 'search' : window.location.pathname === '/cart' ? 'cart' : window.location.pathname === '/news' ? 'news' : window.location.pathname.startsWith('/news/') ? 'news-detail' : window.location.pathname.startsWith('/authors/') ? 'author' : 'home')
  const [searchQuery, setSearchQuery] = useState(() => new URLSearchParams(window.location.search).get('query') ?? '')
  const [selectedAuthor, setSelectedAuthor] = useState(() => getAuthorFromPath(window.location.pathname))
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(() => getNewsFromPath(window.location.pathname))
  const [shopOpen, setShopOpen] = useState(false)
  const [heroMotionOpen, setHeroMotionOpen] = useState(false)
  const [heroMotionKey, setHeroMotionKey] = useState(0)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [cartCount, setCartCount] = useState(0)
  const [quickViewOpen, setQuickViewOpen] = useState(false)
  const [quickViewAvailable, setQuickViewAvailable] = useState(() => window.matchMedia('(min-width: 1101px)').matches)
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const previewCloseTimer = useRef<number | null>(null)

  useEffect(() => {
    const syncRoute = () => {
      setSearchQuery(new URLSearchParams(window.location.search).get('query') ?? '')
      setSelectedAuthor(getAuthorFromPath(window.location.pathname))
      setSelectedNews(getNewsFromPath(window.location.pathname))
      setView(window.location.hash === '#login' ? 'login' : window.location.hash === '#register' ? 'register' : window.location.pathname === '/all-books' ? 'all-books' : window.location.pathname === '/search' ? 'search' : window.location.pathname === '/cart' ? 'cart' : window.location.pathname === '/news' ? 'news' : window.location.pathname.startsWith('/news/') ? 'news-detail' : window.location.pathname.startsWith('/authors/') ? 'author' : 'home')
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
    document.body.classList.toggle('login-open', view === 'login' || view === 'register')
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
    setHeroMotionOpen(true)
    setHeroMotionKey((key) => key + 1)
    setMenuOpen(false)
  }

  const showHome = () => {
    navigateTo('/#home')
    setView('home')
    setShopOpen(false)
    setMenuOpen(false)
  }

  const showLogin = () => {
    window.location.hash = 'login'
    setView('login')
  }

  const showRegister = () => {
    window.location.hash = 'register'
    setView('register')
  }

  const showAuthors = () => {
    setView('authors')
    setShopOpen(false)
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
    setSelectedProduct(product)
    setView('detail')
    setShopOpen(false)
    setMenuOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const addToCart = (_product: Product) => setCartCount((count) => count + 1)
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
    if (!quickViewOpen) return
    if (previewCloseTimer.current !== null) window.clearTimeout(previewCloseTimer.current)
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

  return <>
    {isEnhancedVariant && welcomeOpen && <WelcomeScreen onSelectLanguage={selectLanguage} />}
    <div id="top" className={`page-shell ${quickViewAvailable && quickViewOpen ? 'quick-view-active' : ''}`}>
    <Header cartCount={cartCount} onMenu={() => setMenuOpen(!menuOpen)} onShop={showShop} onShopHover={(open) => setShopOpen(open)} onAuthors={showAuthors} onAllBooks={showAllBooks} onSearch={showSearch} onQuickView={toggleQuickView} onCart={showCart} quickViewOpen={quickViewOpen} quickViewAvailable={quickViewAvailable} activeView={view} shopOpen={shopOpen} onDesktopMenuHover={(open) => { setHeroMotionOpen(open); if (open) setHeroMotionKey((key) => key + 1); else setShopOpen(false) }} />
    <button className={`mobile-backdrop ${menuOpen ? 'is-open' : ''}`} aria-label="Close menu" aria-hidden={!menuOpen} onClick={() => setMenuOpen(false)} />
    <MobileMenu isOpen={menuOpen} onShop={showHome} onAllBooks={showAllBooks} onAuthors={showAuthors} onSearch={showSearch} language={language} onSelectLanguage={selectLanguage} />
    {view === 'authors' ? <AuthorsDirectory /> : view === 'all-books' ? <AllBooksPage onHome={showHome} onOpenDetail={showDetail} onAddToCart={addToCart} onPreview={openPreview} onPreviewLeave={schedulePreviewClose} onSelectQuickView={selectQuickView} quickViewOpen={quickViewAvailable && quickViewOpen} /> : view === 'search' ? <SearchResultsPage query={searchQuery} onOpenDetail={showDetail} onAddToCart={addToCart} onPreview={openPreview} onPreviewLeave={schedulePreviewClose} onSelectQuickView={selectQuickView} quickViewOpen={quickViewAvailable && quickViewOpen} /> : view === 'author' ? <AuthorProfile author={selectedAuthor || 'Edward W. Said'} onBack={showAuthors} onOpenDetail={showDetail} onAddToCart={addToCart} onPreview={openPreview} onPreviewLeave={schedulePreviewClose} onSelectQuickView={selectQuickView} quickViewOpen={quickViewAvailable && quickViewOpen} /> : view === 'detail' ? <BookDetail product={selectedProduct ?? products[0]} onBack={showHome} onAuthor={showAuthor} /> : view === 'cart' ? <CartPage onHome={showHome} /> : view === 'news' ? <NewsPage language={language} onOpen={showNewsDetail} /> : view === 'news-detail' ? (selectedNews ? <NewsDetailPage item={selectedNews} language={language} onBack={showNews} /> : <NewsPage language={language} onOpen={showNewsDetail} />) : <main>
      <section className={`hero scroll-section ${heroMotionOpen ? 'is-shop-open' : ''}`} aria-label="Linery bookstore illustration">
        <div className="hero-art">
          <img className="hero-art-base" src="/assets/hero-children.png" alt="Các em nhỏ cùng đọc sách trên nền đỏ" />
          <img key={heroMotionKey} className="hero-art-hover" src="/assets/hero-children-shop-hover.webp" alt="" aria-hidden="true" />
        </div>
      </section>
      <div id="shop" className="collections">{sections.map(section => <Collection key={section.title} {...section} onOpenDetail={showDetail} onAddToCart={addToCart} onPreview={openPreview} onPreviewLeave={schedulePreviewClose} onSelectQuickView={selectQuickView} quickViewOpen={quickViewAvailable && quickViewOpen} />)}</div>
    <LineryNewsSection language={language} onOpen={showNewsDetail} onSeeMore={showNews} />
    </main>}
    <Footer />
    <button className={`scroll-to-top ${showScrollTop ? 'is-visible' : ''}`} type="button" aria-label="Scroll to top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} tabIndex={showScrollTop ? 0 : -1}>
      <i className="bi bi-arrow-up" aria-hidden="true" />
    </button>
    </div>
    {view === 'login' && <LoginPage onHome={showHome} onRegister={showRegister} />}
    {view === 'register' && <RegisterPage onHome={showHome} onLogin={showLogin} language={language} />}
    {quickViewAvailable && quickViewOpen && <BookPreview product={previewProduct} onClose={closePreview} onOpenDetail={showDetail} />}
  </>
}
