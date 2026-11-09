import { useEffect, useRef, useState, type ElementType, type FormEvent, type ReactNode } from 'react'
import 'bootstrap-icons/font/bootstrap-icons.css'

type Product = { image: string; gallery?: string[]; title: string; author: string; price: string; categories: string[]; publisher: string; writerType: 'Authors' | 'Translators'; year?: number; available?: boolean; limited?: boolean }
type CartItem = { product: Product; quantity: number }
type PaymentMethod = 'vnpay' | 'bank' | 'momo' | 'apple' | 'zalopay'
type FulfillmentMethod = 'pickup' | 'delivery'
type NewsItem = { image: string; title: string; titleVi: string; date: string; kicker: string; slug: string; excerpt: string; excerptVi: string; body: string[]; bodyVi: string[] }
type View = 'home' | 'authors' | 'all-books' | 'collection' | 'search' | 'author' | 'detail' | 'cart' | 'checkout' | 'news' | 'news-detail' | 'login' | 'register' | 'forgot-password' | 'password-reset-sent' | 'reset-password' | 'password-reset-complete' | 'account' | 'admin'
type AccountTab = 'profile' | 'orders' | 'orders-demo' | 'order-detail' | 'transactions' | 'transaction-detail' | 'security'
type WriterDirectoryFilter = 'all' | 'authors' | 'translators'
type ProductCardActions = { onOpenDetail: (product: Product) => void; onAddToCart: (product: Product, source?: HTMLElement) => void; onPreview: (product: Product) => void; onPreviewLeave: () => void; onSelectQuickView: (product: Product) => void; quickViewOpen: boolean }
type AdminBook = { isbn: string; title: string; author: string; quantity: number; unitPrice: number | null; salePrice: number; link: string; format: string; line: string; category: string }
type AdminBookKey = keyof AdminBook
type AdminCatalogBook = { id: string; isbn: string; title: string; author: string; cover: string; quantity: number; unitPrice: number | null; salePrice: number; series: string; format: string; line: string; category: string; link: string; goodreads: string; description: string; status: string }
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
type AdminAuthorForm = { name: string; classification: 'Tác giả' | 'Dịch giả' | 'Họa sĩ minh họa' | ''; birthYear: string; deathYear: string; gender: string; representativeWorks: string; format: string; genre: string; topics: string; awards: string; bio: string; englishLink: string; imageLink: string }
const emptyAdminAuthorForm: AdminAuthorForm = { name: '', classification: '', birthYear: '', deathYear: '', gender: '', representativeWorks: '', format: '', genre: '', topics: '', awards: '', bio: '', englishLink: '', imageLink: '' }
type AdminCatalogFormField = { key: keyof AdminAuthorForm; label: string; input?: 'text' | 'number' | 'url' | 'textarea'; required?: boolean; help?: string }
const adminAuthorFormFields: AdminCatalogFormField[] = [
  { key: 'name', label: 'Tên tác giả', required: true }, { key: 'birthYear', label: 'Năm sinh', input: 'number' }, { key: 'deathYear', label: 'Năm mất', input: 'number', help: 'Để trống nếu tác giả còn sống.' }, { key: 'gender', label: 'Giới tính' }, { key: 'format', label: 'Thể thức' }, { key: 'genre', label: 'Thể loại' }, { key: 'topics', label: 'Chủ đề' }, { key: 'englishLink', label: 'Link giới thiệu tiếng Anh', input: 'url' },
]

const siteName = 'Linery Bookstore'
const siteDescription = 'Linery — hiệu sách tuyển chọn và independent press được xây dựng tại Hà Nội.'
const publicSeoViews: View[] = ['home', 'authors', 'author', 'all-books', 'collection', 'detail', 'news', 'news-detail']

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
const products: Product[] = [
  { image: '/assets/cover-edward.png', title: 'Power, Politics, and Culture: Interviews with Edward W. Said', author: 'Edward W. Said', price: '460.000₫', categories: ['Non-fiction', 'Essays'], publisher: 'Penguin Random House', writerType: 'Authors', year: 2004 },
  { image: '/assets/cover-ethics.png', title: 'Ethics: A Very Short Introduction', author: 'Simon Blackburn', price: '460.000₫', categories: ['Non-fiction', 'Research & Studies'], publisher: 'Oxford University Press', writerType: 'Authors', year: 2001, available: false },
  { image: '/assets/cover-existentialism.png', title: 'Existentialism: A Very Short Introduction', author: 'Thomas R. Flynn', price: '460.000₫', categories: ['Non-fiction', 'Research & Studies'], publisher: 'Oxford University Press', writerType: 'Authors', year: 2006 },
  { image: '/assets/cover-jung.png', title: 'Jung: A Very Short Introduction', author: 'Anthony Stevens', price: '460.000₫', categories: ['Non-fiction', 'Memoir & Biography'], publisher: 'HarperCollins', writerType: 'Authors', year: 1999 },
  { image: '/assets/cover-derrida.png', title: 'Derrida: A Very Short Introduction', author: 'Simon Glendinning', price: '280.000₫', categories: ['Non-fiction', 'Research & Studies'], publisher: 'Simon & Schuster', writerType: 'Authors', year: 2011 },
  { image: '/assets/cover-black-folk.png', title: 'The Souls of Black Folk', author: 'W. E. B. Du Bois', price: '310.000₫', categories: ['Non-fiction', 'Essays'], publisher: 'Macmillan Publishers', writerType: 'Authors', year: 1903 },
]

const artbookProducts: Product[] = [
  { image: '/assets/cover-art-thief.jpg', title: 'The Art Thief', author: 'Michael Finkel', price: '520.000₫', categories: ['Non-fiction', 'Art & Design'], publisher: 'Vintage', writerType: 'Authors', year: 2024 },
  { image: '/assets/cover-art-artist.jpg', title: 'How to Be an Artist', author: 'Jerry Saltz', price: '460.000₫', categories: ['Non-fiction', 'Art & Design'], publisher: 'Riverhead Books', writerType: 'Authors', year: 2020 },
  { image: '/assets/cover-art-futures.jpg', title: 'Futures in the Making', author: 'Theo Reeves-Evison', price: '780.000₫', categories: ['Non-fiction', 'Art & Design'], publisher: 'The MIT Press', writerType: 'Authors', year: 2026 },
  { image: '/assets/cover-art-lady-in-gold.jpg', title: 'The Lady in Gold', author: "Anne-Marie O'Connor", price: '580.000₫', categories: ['Non-fiction', 'Art & Design'], publisher: 'Vintage', writerType: 'Authors', year: 2015 },
  { image: '/assets/cover-art-chasers.jpg', title: 'Chasers of the Light', author: 'Tyler Knott Gregson', price: '390.000₫', categories: ['Non-fiction', 'Poetry & Drama'], publisher: 'Tarcher', writerType: 'Authors', year: 2014 },
  { image: '/assets/cover-art-white-papers.jpg', title: 'White Papers on Dissent', author: 'Barbara Cueto', price: '820.000₫', categories: ['Non-fiction', 'Art & Design'], publisher: 'The MIT Press', writerType: 'Authors', year: 2026 },
]

const limitedProducts: Product[] = products.slice(0, 6).map((product) => ({ ...product, limited: true }))
const catalogProducts = [...products, ...artbookProducts]

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
  return catalogProducts.find((product) => productSlug(product.title) === slug) ?? null
}
const getAuthorFromPath = (pathname: string) => {
  const slug = pathname.startsWith('/authors/') ? pathname.split('/').pop() ?? '' : ''
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
  { title: 'GRAB & SAVE', items: limitedProducts },
]
const collectionTitles = ['New & Upcoming', 'Linery Press', 'Linery Picks', 'Linery Art Books', 'Grab & Save'] as const
const uiText = {
  en: {
    books: 'Books', writers: 'Writers', viewAll: 'View All', newUpcoming: 'New & Upcoming', lineryPress: 'Linery Press', lineryPicks: 'Linery Picks', lineryArtBooks: 'Linery Art Books', allBooks: 'All Books', grabSave: 'Grab & Save', fiction: 'Fiction', nonFiction: 'Non-fiction', searchBooks: 'Search books', filterSort: 'Filter & sort', publishers: 'Publishers', sortBy: 'Sort by', clear: 'Clear', applyFilter: 'Apply filter', default: 'Default', noBooks: 'No books match these filters.'
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

function MenuColumns({ columns }: { columns: MenuColumn[] }) {
  return <div className="menu-columns">{columns.map((column) => <div className="menu-column" key={column.eyebrow}><p className="menu-eyebrow">{column.eyebrow}</p>{column.links.map((link) => <a href={`/authors/${authorSlug(link)}`} key={link}>{link}</a>)}</div>)}</div>
}

function ShopMenu({ isOpen, onAllBooks, onCollection, language }: { isOpen: boolean; onAllBooks: () => void; onCollection: (title: string) => void; language: Language }) {
  return <section className={`shop-menu menu-navigation ${isOpen ? 'is-open' : ''}`} aria-label="Books categories" aria-hidden={!isOpen}>
    <div className="shop-menu-inner menu-navigation-inner">
      <div className="shop-menu-columns menu-navigation-list">
        {desktopShopColumns.map((column, columnIndex) => <div className={`shop-menu-column menu-section menu-branch menu-level-${columnIndex === 0 ? 0 : 1}`} key={column.eyebrow || column.links[0]}>
          {column.eyebrow && <p className="menu-eyebrow menu-section-title">{column.eyebrow}</p>}
          {column.links.map((link) => {
            const isCollection = collectionTitles.includes(link as typeof collectionTitles[number])
            const isAllBooks = link === 'All books'
            return <a className={`menu-item menu-item-link menu-item-text${isAllBooks ? ' shop-menu-view-all' : ''}`} href={isAllBooks ? '/all-books' : isCollection ? `/collections/${collectionSlug(link)}` : `#${link.toLowerCase().replaceAll(' ', '-')}`} key={link} onClick={isAllBooks ? (event) => { event.preventDefault(); onAllBooks() } : isCollection ? (event) => { event.preventDefault(); onCollection(link) } : undefined}><span>{isAllBooks ? tx(language, 'viewAll') : translatedCollectionTitle(link, language)}</span>{isAllBooks && <span aria-hidden="true">→</span>}</a>
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
        <a className="writers-menu-view-all menu-item menu-item-link menu-item-text" href="/authors" onClick={(event) => { event.preventDefault(); onAllWriters() }}>{tx(language, 'viewAll')}</a>
        <div className="writers-menu-grid">
          {writerMenuGroups.map((group) => <div className="writers-menu-group menu-section menu-branch" key={group.eyebrow}>
            <p className="menu-eyebrow menu-section-title">{group.eyebrow}</p>
            {group.links.map((link) => {
              const isAuthor = link === 'Author'
              const isTranslator = link === 'Translator'
              const href = isAuthor ? '/authors?type=authors' : isTranslator ? '/authors?type=translators' : `#writers-${link.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-')}`
              const onClick = isAuthor ? (event: React.MouseEvent<HTMLAnchorElement>) => { event.preventDefault(); onAuthors() } : isTranslator ? (event: React.MouseEvent<HTMLAnchorElement>) => { event.preventDefault(); onTranslators() } : undefined
              return <a className="menu-item menu-item-link menu-item-text" href={href} onClick={onClick} key={link}>{link}</a>
            })}
          </div>)}
        </div>
      </div>
    </div>
  </section>
}

function MobileMenu({ isOpen, onShop, onAllBooks, onCollection, onAllWriters, onAuthors, onTranslators, onSearch, language, onSelectLanguage }: { isOpen: boolean; onShop: () => void; onAllBooks: () => void; onCollection: (title: string) => void; onAllWriters: () => void; onAuthors: () => void; onTranslators: () => void; onSearch: (query: string) => void; language: 'en' | 'vi'; onSelectLanguage: (language: 'en' | 'vi') => void }) {
  const [openBranches, setOpenBranches] = useState<Record<string, boolean>>({ Fiction: true, 'Non-fiction': true, 'Linery Press': true, Role: false, Gender: false, 'Cultural Region': false, Era: false })
  const [query, setQuery] = useState('')
  const toggleBranch = (label: string) => setOpenBranches((current) => ({ ...current, [label]: !current[label] }))

  return <aside className={`mobile-menu menu-navigation ${isOpen ? 'is-open' : ''}`} aria-label="Mobile navigation" aria-hidden={!isOpen}>
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
        <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search books" aria-label="Search books" />
      </form>
    </div>
    <section className="mobile-menu-section menu-section" aria-labelledby="mobile-shop-heading">
      <h2 id="mobile-shop-heading" className="mobile-menu-section-title menu-section-title">{tx(language, 'books')}</h2>
      <button className="mobile-menu-item mobile-menu-level-1 menu-item menu-level-1" onClick={onAllBooks}><span className="mobile-menu-text menu-item-text">{tx(language, 'viewAll')}</span><span aria-hidden="true">→</span></button>
      {['New & Upcoming', 'Linery Press', 'Linery Picks', 'Linery Art Books'].map((title) => <button className="mobile-menu-item mobile-menu-level-1 menu-item menu-level-1" key={title} onClick={() => onCollection(title)}><span className="mobile-menu-text menu-item-text">{translatedCollectionTitle(title, language)}</span></button>)}
      <div className="mobile-menu-tree">
        {shopOnlyCategories.map((category) => {
          const categoryOpen = openBranches[category.label] ?? true
          return <div className="mobile-menu-branch menu-branch" key={category.label}>
            <button className="mobile-menu-item mobile-menu-level-1 menu-item menu-level-1" onClick={() => category.children ? toggleBranch(category.label) : onShop()} aria-expanded={category.children ? categoryOpen : undefined}>
              <span className="mobile-menu-text menu-item-text">{language === 'vi' && category.label === 'Fiction' ? tx(language, 'fiction') : language === 'vi' && category.label === 'Non-fiction' ? tx(language, 'nonFiction') : category.label}</span>{category.children && <span aria-hidden="true">{categoryOpen ? '−' : '+'}</span>}
            </button>
            {category.children && categoryOpen && <div className="mobile-menu-children menu-children">{category.children.map((child) => {
              const childOpen = openBranches[child.label] ?? true
              return <div className="mobile-menu-branch menu-branch" key={child.label}>
                <button className="mobile-menu-item mobile-menu-level-2 menu-item menu-level-2" onClick={() => child.children ? toggleBranch(child.label) : onShop()} aria-expanded={child.children ? childOpen : undefined}>
                  <span className="mobile-menu-text menu-item-text">{child.label}</span>{child.children && <span aria-hidden="true">{childOpen ? '−' : '+'}</span>}
                </button>
                {child.children && childOpen && <div className="mobile-menu-children menu-children">{child.children.map((leaf) => <button className="mobile-menu-item mobile-menu-level-3 menu-item menu-level-3" key={leaf.label} onClick={onShop}><span className="mobile-menu-text menu-item-text">{leaf.label}</span></button>)}</div>}
              </div>
            })}</div>}
          </div>
        })}
      </div>
    </section>
    <section className="mobile-menu-section menu-section mobile-menu-authors" aria-labelledby="mobile-authors-heading">
      <h2 id="mobile-authors-heading" className="mobile-menu-section-title menu-section-title">WRITERS</h2>
      <button className="mobile-menu-item mobile-menu-level-1 menu-item menu-level-1" onClick={onAllWriters}><span className="mobile-menu-text menu-item-text">{tx(language, 'viewAll')}</span><span aria-hidden="true">→</span></button>
      {writerMenuGroups.map((group) => {
        const groupOpen = openBranches[group.eyebrow] ?? true
        return <div className="mobile-writer-group" key={group.eyebrow}>
          <button className="mobile-writer-group-toggle" type="button" onClick={() => toggleBranch(group.eyebrow)} aria-expanded={groupOpen}><span>{group.eyebrow}</span><span aria-hidden="true">{groupOpen ? '−' : '+'}</span></button>
          {groupOpen && <div className="mobile-menu-children menu-children">
            {group.links.map((link) => <button className="mobile-menu-item mobile-menu-level-2 menu-item menu-level-2" key={link} onClick={link === 'Author' ? onAuthors : link === 'Translator' ? onTranslators : onAllWriters}><span className="mobile-menu-text menu-item-text">{link}</span></button>)}
          </div>}
        </div>
      })}
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
  const authorBooks = catalogProducts.filter((product) => product.author === author)
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

function HeroBanner() {
  return <div className="hero-banner">
    <img className="hero-banner-base" src="/assets/hero-children.png" alt="Các em nhỏ cùng đọc sách" width="1342" height="495" fetchPriority="high" decoding="async" />
  </div>
}

function AllBooksPage({ onHome, collectionTitle, ...actions }: { onHome: () => void; collectionTitle?: string } & ProductCardActions) {
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
      <HeroBanner />
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
      <HeroBanner />
      <nav className="news-breadcrumb news-page-breadcrumb" aria-label="Breadcrumb"><a href="/#home">Home</a><span aria-hidden="true">/</span><span>{pageTitle}</span></nav>
      <section className="news-page-panel" aria-labelledby="all-news-title">
        <RibbonTitle title={pageTitle.toUpperCase()} id="all-news-title" heading />
        <div className="news-page-grid">{newsItems.map((item) => {
          const title = language === 'vi' ? item.titleVi : item.title
          const excerpt = language === 'vi' ? item.excerptVi : item.excerpt
          return <article className="news-page-card" key={item.slug}>
            <button type="button" onClick={() => onOpen(item)}>
              <div className="news-page-image-wrap"><img src={item.image} alt={title} loading="eager" decoding="async" /></div>
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

function Header({ cartCount, cartPulse, menuOpen, onMenu, onHome, onLogin, onLogout, onShop, onShopHover, onAllWriters, onAuthors, onTranslators, onAllBooks, onCollection, onSearch, onQuickView, onCart, quickViewOpen, quickViewAvailable, activeView, shopOpen, writersOpen, onWritersHover, accountMenuOpen, onAccountMenuToggle, accountTab, onAccountTabChange, accountMenuEnabled, language }: { cartCount: number; cartPulse: boolean; menuOpen: boolean; onMenu: () => void; onHome: () => void; onLogin: () => void; onLogout: () => void; onShop: () => void; onShopHover: (open: boolean) => void; onAllWriters: () => void; onAuthors: () => void; onTranslators: () => void; onAllBooks: () => void; onCollection: (title: string) => void; onSearch: (query: string) => void; onQuickView: () => void; onCart: () => void; quickViewOpen: boolean; quickViewAvailable: boolean; activeView: View; shopOpen: boolean; writersOpen: boolean; onWritersHover: (open: boolean) => void; accountMenuOpen: boolean; onAccountMenuToggle: () => void; accountTab: AccountTab; onAccountTabChange: (tab: AccountTab) => void; accountMenuEnabled: boolean; language: Language }) {
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

  return <header ref={headerRef} className={`site-header ${menuOpen ? 'is-menu-open' : ''} ${activeView === 'account' ? 'is-account-view' : ''}`} onMouseLeave={() => { onShopHover(false); onWritersHover(false) }}>
    <div className="header-inner">
      <button className="menu-button" aria-label="Mở menu" onClick={onMenu}><HamburgerIcon /></button>
      <nav className="desktop-nav" aria-label="Điều hướng chính"><a className={`nav-link ${activeView === 'home' ? 'is-active' : ''}`} href="/#home" onMouseEnter={() => { onShopHover(false); onWritersHover(false) }} onFocus={() => { onShopHover(false); onWritersHover(false) }} onClick={(event) => { event.preventDefault(); onHome() }}>Home</a><button className={`nav-link shop-nav-link ${shopOpen ? 'is-open' : ''}`} onClick={onShop} onMouseEnter={() => { onShopHover(true); onWritersHover(false) }} onFocus={() => { onShopHover(true); onWritersHover(false) }} aria-expanded={shopOpen}>Books<i className="bi bi-chevron-down nav-chevron" aria-hidden="true" /></button><button className={`nav-link ${activeView === 'authors' ? 'is-active' : ''} ${writersOpen ? 'is-open' : ''}`} onMouseEnter={() => { onShopHover(false); onWritersHover(true) }} onFocus={() => { onShopHover(false); onWritersHover(true) }} onClick={(event) => { event.preventDefault(); onWritersHover(!writersOpen); onShopHover(false) }} aria-expanded={writersOpen}>Writers<i className="bi bi-chevron-down nav-chevron" aria-hidden="true" /></button></nav>
      <a className="brand" href="/" aria-label="Linery Bookstore home">LINERY BOOKSTORE</a>
      <div className="header-actions">
        <form className={`search-control desktop-search-control ${searchOpen ? 'is-open' : ''}`} onSubmit={submitSearch}>
          <button className="search-toggle" type="button" aria-label="Tìm kiếm" aria-expanded={searchOpen} onClick={() => setSearchOpen((open) => !open)}><img src="/assets/icon-search.svg" alt="" /></button>
          <input className="search-input" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search books" aria-label="Search books" autoFocus={searchOpen} onKeyDown={(event) => { if (event.key === 'Escape') setSearchOpen(false) }} />
        </form>
        <a className={`icon-button cart-button ${cartPulse ? 'is-pulsing' : ''}`} href="/cart" aria-label={`Giỏ hàng, ${cartCount} sản phẩm`} onClick={(event) => { event.preventDefault(); onCart() }}><img src="/assets/icon-cart.svg" alt="" />{cartCount > 0 && <span>{cartCount}</span>}</a>
        <div className="account-menu-region" onMouseEnter={() => setAccountHoverOpen(true)} onMouseLeave={() => setAccountHoverOpen(false)}>
          <button className="icon-button login-icon" type="button" aria-label={activeView === 'account' ? 'Account menu' : 'Log in'} aria-expanded={accountMenuEnabled && (activeView === 'account' ? accountMenuOpen : accountHoverOpen)} onClick={onLogin}><i className="bi bi-person" aria-hidden="true" /></button>
          {accountMenuEnabled && <div className={`account-header-menu ${accountMenuOpen || accountHoverOpen ? 'is-open' : ''}`} aria-label="Account menu"><button className={accountTab === 'profile' ? 'is-active' : ''} type="button" onClick={() => { onAccountTabChange('profile'); onAccountMenuToggle() }}><i className="bi bi-person" aria-hidden="true" />Profile</button><button className={accountTab === 'orders' ? 'is-active' : ''} type="button" onClick={() => { onAccountTabChange('orders'); onAccountMenuToggle() }}><i className="bi bi-bag" aria-hidden="true" />Order history</button><button className={accountTab === 'orders-demo' ? 'is-active' : ''} type="button" onClick={() => { onAccountTabChange('orders-demo'); onAccountMenuToggle() }}><i className="bi bi-bag-check" aria-hidden="true" />Order history demo</button><button className={accountTab === 'transactions' ? 'is-active' : ''} type="button" onClick={() => { onAccountTabChange('transactions'); onAccountMenuToggle() }}><i className="bi bi-receipt" aria-hidden="true" />Transaction history</button><button className={accountTab === 'security' ? 'is-active' : ''} type="button" onClick={() => { onAccountTabChange('security'); onAccountMenuToggle() }}><i className="bi bi-shield-lock" aria-hidden="true" />Security</button><button className="account-header-menu-logout" type="button" onClick={onLogout}><i className="bi bi-box-arrow-right" aria-hidden="true" />Log out</button></div>}
        </div>
      </div>
    </div>
    {activeView !== 'authors' && <ShopMenu isOpen={shopOpen} onAllBooks={onAllBooks} onCollection={onCollection} language={language} />}
    <WritersMenu isOpen={writersOpen} onAllWriters={onAllWriters} onAuthors={onAuthors} onTranslators={onTranslators} language={language} />
  </header>
}

function ProductCard({ product, onOpenDetail, onAddToCart, onPreview, onPreviewLeave, onSelectQuickView, quickViewOpen }: ProductCardActions & { product: Product }) {
  const coverContent = <div className="product-cover-wrap">
    <img src={product.image} alt={product.title} className="product-cover" loading="eager" decoding="async" />
    {product.limited && <span className="product-limited-badge" aria-label="Limited edition">Limited</span>}
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

function Collection({ title, items, onCollection, quickViewOpen, language = 'en', ...actions }: { title: string; items: Product[]; onCollection: (title: string) => void; language?: Language } & ProductCardActions) {
  const carouselRef = useRef<HTMLDivElement | null>(null)
  const [trackPosition, setTrackPosition] = useState(1)
  const [isJumping, setIsJumping] = useState(false)
  const [itemsPerSlide, setItemsPerSlide] = useState(6)
  const wheelLock = useRef(false)
  const touchStart = useRef<number | null>(null)
  const carouselItems = Array.from({ length: itemsPerSlide === 3 ? 12 : 24 }, (_, index) => items[index % items.length])
  const slides = Array.from({ length: Math.ceil(carouselItems.length / itemsPerSlide) }, (_, slideIndex) => carouselItems.slice(slideIndex * itemsPerSlide, (slideIndex + 1) * itemsPerSlide))
  const activeSlide = (trackPosition + slides.length - 1) % slides.length
  const renderedSlides = [slides[slides.length - 1], ...slides, slides[0]]

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
    setTrackPosition(1)
  }, [itemsPerSlide])

  useEffect(() => {
    if (slides.length < 2) return undefined
    const carouselTimer = window.setInterval(() => {
      setTrackPosition((current) => current + 1)
    }, 5000)
    return () => window.clearInterval(carouselTimer)
  }, [slides.length])

  const moveSlide = (direction: 1 | -1) => {
    setTrackPosition((current) => current + direction)
  }

  const goToSlide = (index: number) => setTrackPosition(index + 1)

  const handleTransitionEnd = (event: React.TransitionEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget || event.propertyName !== 'transform') return
    if (trackPosition === 0) {
      setIsJumping(true)
      setTrackPosition(slides.length)
      window.requestAnimationFrame(() => window.requestAnimationFrame(() => setIsJumping(false)))
    }
    if (trackPosition === slides.length + 1) {
      setIsJumping(true)
      setTrackPosition(1)
      window.requestAnimationFrame(() => window.requestAnimationFrame(() => setIsJumping(false)))
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
    <div className="collection-controls"><div className="pagination" aria-label={`${displayTitle} pagination`}>{slides.map((_, index) => <button key={`${title}-dot-${index}`} className={index === activeSlide ? 'active' : ''} aria-label={`Xem slide ${index + 1}`} aria-current={index === activeSlide ? 'true' : undefined} onClick={() => goToSlide(index)} />)}</div><a className="news-see-more collection-see-more" href={`/collections/${collectionSlug(title)}`} onClick={(event) => { event.preventDefault(); onCollection(title) }}>{tx(language, 'viewAll')}</a></div>
  </section>
}

function BookDetail({ product, onBack, onAuthor, onAddToCart, onBuyNow }: { product: Product; onBack: () => void; onAuthor: (author: string) => void; onAddToCart: (product: Product, source?: HTMLElement) => void; onBuyNow: (product: Product) => void }) {
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
              <button className="book-add-button" type="button" onClick={(event) => onAddToCart(product, event.currentTarget)}>Add to Cart</button>
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

function UtilityPanel({ product, onClose, onOpenDetail, onAddToCart, onBuyNow, onToggleWishlist, isWishlisted }: { product: Product | null; onClose: () => void; onOpenDetail: (product: Product) => void; onAddToCart: (product: Product, source?: HTMLElement) => void; onBuyNow: (product: Product) => void; onToggleWishlist: (product: Product) => void; isWishlisted: (product: Product) => boolean }) {
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
          <img className="book-preview-cover" src={product.image} alt={product.title} loading="lazy" decoding="async" />
          <div className="book-preview-copy"><h2>{product.title}</h2><p className="book-preview-author">{product.author}</p><p className="book-preview-price">{product.price}</p></div>
          <div className="book-preview-section-divider" aria-hidden="true" />
          <dl className="book-preview-details"><div><dt>Publisher</dt><dd>{publisher}</dd></div><div><dt>ISBN</dt><dd>978-0-00-000000-0</dd></div><div><dt>Format</dt><dd>Paperback</dd></div><div><dt>Language</dt><dd>English</dd></div><div><dt>Pages</dt><dd>320 pages</dd></div></dl>
          <a className="book-preview-link" href="#a" onClick={(event) => { event.preventDefault(); onOpenDetail(product) }}>View full details <span aria-hidden="true">→</span></a>
          </div>
        </div>
        <div className="utility-panel-footer book-preview-actions">{product.available === false ? <button className="book-out-of-stock-button book-preview-out-of-stock" type="button" disabled>Out of stock</button> : <><button className="book-preview-add-button" type="button" onClick={(event) => onAddToCart(product, event.currentTarget)}>Add to cart</button><button className="book-preview-buy-button" type="button" onClick={() => onBuyNow(product)}>Buy Now</button></>}</div>
      </> : <div className="utility-panel-empty"><img src="/assets/quick-view-illustration.png" alt="" aria-hidden="true" /><p>Hello — I’m here to help you preview book information.</p><span>Choose a book to see its cover and publication details.</span></div>}
    </aside>
  </div>
}

function Footer() {
  return <footer className="site-footer scroll-section" id="about">
    <div className="footer-copy">
      <h2>LINERY</h2>
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
  </footer>
}

type ChatAttachment = { name: string; src: string; mimeType: string }
type ChatMessage = { role: 'assistant' | 'user'; text: string; image?: ChatAttachment }
const directGeminiApiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined

function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [message, setMessage] = useState('')
  const [attachment, setAttachment] = useState<ChatAttachment | null>(null)
  const [isSending, setIsSending] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([{ role: 'assistant', text: 'Hi, I’m Linbot. I can help you find books, authors, and order information.' }])

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
          body: JSON.stringify({ contents: [{ parts: [{ text: `You are Linbot, a bookstore support agent. Answer in the user's language. If an image is provided, identify the book cover as accurately as possible. Do not invent a match. User request: ${userText}` }, ...(imageData ? [{ inline_data: { mime_type: sentAttachment.mimeType, data: imageData } }] : [])] }] }),
        })
        : await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      })
      const result = await response.json() as { text?: string; error?: { message?: string } | string; candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> }
      const directText = result.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('').trim()
      const errorText = typeof result.error === 'string' ? result.error : result.error?.message
      setMessages((current) => [...current, { role: 'assistant', text: response.ok && (directText || result.text) ? directText || result.text || '' : errorText || 'Sorry, I could not reach the book search service right now.' }])
    } catch {
      setMessages((current) => [...current, { role: 'assistant', text: 'Sorry, I could not reach the book search service right now.' }])
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
    setMessages((current) => [...current, { role: 'user', text }, { role: 'assistant', text: 'I’ll look that up for you once the chatbot is connected to the catalog.' }])
  }

  return <>
    {!isOpen && <button className="chatbot-float-button" type="button" aria-label="Open Linery chatbot" onClick={() => setIsOpen(true)}><img src="/assets/chatbot.svg" alt="" aria-hidden="true" /></button>}
    {isOpen && <section className={`chatbot-panel ${isExpanded ? 'is-expanded' : ''}`} role="dialog" aria-modal="false" aria-label="Linery chatbot">
      <header className="chatbot-header">
        <div className="chatbot-heading"><span className="chatbot-avatar"><img src="/assets/chatbot.svg" alt="" aria-hidden="true" /></span><div><strong>Linbot</strong><span>Bookshop support</span></div></div>
        <div className="chatbot-header-actions"><button type="button" aria-label={isExpanded ? 'Use compact chat size' : 'Use full chat size'} onClick={() => setIsExpanded((current) => !current)}><i className={`bi ${isExpanded ? 'bi-fullscreen-exit' : 'bi-arrows-fullscreen'}`} aria-hidden="true" /></button><button type="button" aria-label="Close chatbot" onClick={() => setIsOpen(false)}><i className="bi bi-x-lg" aria-hidden="true" /></button></div>
      </header>
      <div className="chatbot-messages" aria-live="polite">
        {messages.map((item, index) => <div className={`chatbot-message chatbot-message-${item.role}`} key={`${item.role}-${index}`}>{item.image && <img className="chatbot-message-image" src={item.image.src} alt={`Book cover: ${item.image.name}`} />}<p>{item.text}</p></div>)}
        <div className="chatbot-prompts"><button type="button" onClick={() => askDemoQuestion('Find a book for me')}>Find a book</button><button type="button" onClick={() => askDemoQuestion('Track my order')}>Track an order</button></div>
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

type StorefrontCustomerRecord = { id: string; name: string; email: string; phone: string; orderCount: number; status: 'Đang hoạt động' | 'Tạm khóa'; createdAt: string }
type StorefrontOrderRecord = { id: string; customerId: string; customerName: string; channel: string; total: number; status: 'Chờ xác nhận' | 'Đang xử lý' | 'Đã giao' | 'Đã hủy'; createdAt: string }
const storefrontCustomersKey = 'linery-storefront-customers'
const storefrontOrdersKey = 'linery-storefront-orders'

const readStoredRecords = <T,>(key: string): T[] => {
  try {
    const value = JSON.parse(window.localStorage.getItem(key) ?? '[]')
    return Array.isArray(value) ? value as T[] : []
  } catch {
    return []
  }
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
    <img className="cart-item-image" src={item.product.image} alt={`Bìa sách ${item.product.title}`} loading="lazy" decoding="async" />
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
  const handleCheckoutSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    addStorefrontOrder({ name: String(data.get('name') ?? ''), email: String(data.get('email') ?? ''), phone: String(data.get('phone') ?? ''), total: subtotal })
    setSubmitted(true)
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
          <fieldset><legend>Receiving method</legend><div className="checkout-method-tabs" role="tablist" aria-label="Receiving method"><button className={fulfillmentMethod === 'pickup' ? 'is-active' : ''} type="button" role="tab" aria-selected={fulfillmentMethod === 'pickup'} onClick={() => setFulfillmentMethod('pickup')}><i className={`bi ${fulfillmentMethod === 'pickup' ? 'bi-check-circle-fill' : 'bi-circle'}`} aria-hidden="true" />Pickup at counter</button><button className={fulfillmentMethod === 'delivery' ? 'is-active' : ''} type="button" role="tab" aria-selected={fulfillmentMethod === 'delivery'} onClick={() => setFulfillmentMethod('delivery')}><i className={`bi ${fulfillmentMethod === 'delivery' ? 'bi-check-circle-fill' : 'bi-circle'}`} aria-hidden="true" />Delivery</button></div>{fulfillmentMethod === 'pickup' ? <div className="checkout-tab-panel" role="tabpanel"><label className="checkout-select-field">Choose a store<select name="pickupStore" defaultValue="" required><option value="" disabled>Select a store</option><option value="store-1">Store 1: Hanoi Book Street, Cua Nam Ward, Hanoi</option><option value="store-2">Comming soon</option></select></label></div> : <div className="checkout-tab-panel checkout-delivery-fields" role="tabpanel"><label>Delivery address<input name="address" type="text" placeholder="House number and street" autoComplete="street-address" required /></label><div className="checkout-field-grid"><label>City<input name="city" type="text" placeholder="City" autoComplete="address-level2" required /></label><label>Postal code<input name="postalCode" type="text" placeholder="Postal code" autoComplete="postal-code" /></label></div><label>Delivery notes<textarea name="deliveryNotes" placeholder="Add instructions for delivery" rows={3} /></label></div>}</fieldset>
        </form>
      </section>
      <aside className="checkout-summary" aria-labelledby="checkout-summary-title"><p className="checkout-kicker">Your order</p><h2 id="checkout-summary-title">Order summary</h2><div className="checkout-summary-items">{items.map((item) => <div className="checkout-summary-item" key={item.product.title}><img src={item.product.image} alt={`Bìa sách ${item.product.title}`} loading="lazy" decoding="async" /><div><strong>{item.product.title}</strong><span>Qty {item.quantity}</span></div><b>{formatPrice(getPriceValue(item.product.price) * item.quantity)}</b></div>)}</div><form className="checkout-voucher" onSubmit={(event) => event.preventDefault()}><label htmlFor="voucher-code">Voucher / discount code</label><div className="checkout-voucher-row"><div className="checkout-voucher-input"><i className="bi bi-ticket-perforated" aria-hidden="true" /><input id="voucher-code" name="voucherCode" type="text" value={voucherCode} onChange={(event) => setVoucherCode(event.target.value)} placeholder="Enter your code" autoComplete="off" /></div><button type="submit">Apply</button></div></form><div className="cart-summary-line"><span>Subtotal</span><strong>{formatPrice(subtotal)}</strong></div><div className="cart-summary-line"><span>Delivery fee</span><strong>Free</strong></div><div className="cart-summary-total"><span>Total</span><strong>{formatPrice(subtotal)}</strong></div><button className="checkout-submit checkout-summary-submit" type="submit" form="checkout-form">CONTINUE TO PAYMENT</button></aside>
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
    const data = new FormData(event.currentTarget)
    upsertStorefrontCustomer({ name: String(data.get('username') ?? ''), email: String(data.get('email') ?? '') })
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
  const isCreate = pathname === '/admin/books/new'
  const isCategories = pathname === '/admin/books/categories'
  const isFormats = pathname === '/admin/books/formats'
  const linkClass = (active: boolean, nested = false) => `flex items-center rounded-lg px-3 py-2 font-body text-sm ${nested ? 'ml-3 pl-4' : ''} ${active ? 'bg-[rgba(155,148,47,.12)] font-semibold text-[var(--color-olive-dark)]' : 'text-[#74776f] transition-colors hover:bg-[#f5f3ec] hover:text-[var(--color-ink)]'}`
  return <div className="ml-4 border-l border-[#e8e5da] pl-3"><a className={linkClass(isList)} href="/admin/books" aria-current={isList ? 'page' : undefined}>Danh sách sách</a><div className="ml-3 border-l border-[#eeeae0] pl-2"><a className={linkClass(isCreate, true)} href="/admin/books/new" aria-current={isCreate ? 'page' : undefined}>Thêm sách</a></div><a className={linkClass(isCategories)} href="/admin/books/categories" aria-current={isCategories ? 'page' : undefined}>Danh mục</a><a className={linkClass(isFormats)} href="/admin/books/formats" aria-current={isFormats ? 'page' : undefined}>Khổ sách</a></div>
}

function AdminBookCreatePage() {
  const [values, setValues] = useState<Record<string, string>>({ isbn: '', title: '', author: '', series: '', coverPriceUsd: '', quantity: '', unitPrice: '', salePrice: '', exchangeRate: '', format: '', line: '', genre: '', topic: '', link: '', goodreads: '', coverFile: '' })
  const [coverPreview, setCoverPreview] = useState('')
  const fields = [['isbn', 'ISBN', 'text'], ['title', 'Tác phẩm', 'text'], ['author', 'Tác giả', 'text'], ['series', 'Series', 'text'], ['coverPriceUsd', 'Giá bìa (USD)', 'number'], ['quantity', 'Số lượng (quyển)', 'number'], ['unitPrice', 'Đơn giá nhập (VNĐ)', 'number'], ['salePrice', 'Giá bán (VNĐ)', 'number'], ['exchangeRate', 'Tỷ giá', 'number'], ['format', 'Thể thức', 'text'], ['line', 'Dòng sách', 'text'], ['genre', 'Thể loại', 'text'], ['topic', 'Chủ đề', 'text'], ['link', 'Link sách', 'url'], ['goodreads', 'Đánh giá Goodreads', 'number']] as const
  return <AdminSimpleCreateShell title="Thêm sách" backHref="/admin/books" section="SÁCH" description="Nhập một bản ghi sách theo các trường đã xuất hiện trong các sheet Picador, Penguin UK, Penguin US và NYRB."><form className="grid gap-5" onSubmit={(event) => { event.preventDefault() }}><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{fields.map(([key, label, type]) => <label className="block" key={key}><span className="mb-1.5 block font-body text-sm font-medium">{label}{['title', 'author'].includes(key) && <span className="ml-1 text-[var(--color-olive-dark)]">*</span>}</span><input className="min-h-11 w-full rounded-xl border border-[#dedbd0] bg-[#fcfbf7] px-3.5 font-body text-sm" type={type} required={['title', 'author'].includes(key)} value={values[key]} onChange={(event) => setValues((current) => ({ ...current, [key]: event.target.value }))} /></label>)}</div><label className="block max-w-md"><span className="mb-1.5 block font-body text-sm font-medium">Ảnh bìa</span><input className="block min-h-11 w-full cursor-pointer rounded-xl border border-dashed border-[var(--color-olive)] bg-[rgba(155,148,47,.05)] px-3.5 py-2.5 font-body text-sm" type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => { const file = event.target.files?.[0]; if (!file) return; setValues((current) => ({ ...current, coverFile: file.name })); setCoverPreview(URL.createObjectURL(file)) }} /><span className="mt-1 block font-body text-xs text-[#8b8d86]">Tải JPG, PNG hoặc WebP. Không nhập URL.</span>{coverPreview && <img className="mt-3 h-32 w-24 rounded-xl object-cover" src={coverPreview} alt="Xem trước ảnh bìa" />}</label><div className="rounded-xl bg-[#f6f5ed] p-4 font-body text-sm text-[#62655f]">Thành tiền sẽ được tính tự động từ số lượng × đơn giá nhập. Tác giả, thể thức, dòng sách, thể loại và chủ đề sẽ chuyển thành lựa chọn từ dữ liệu chuẩn khi kết nối database.</div><div className="flex flex-col justify-end gap-3 border-t border-[#eeeae0] pt-5 sm:flex-row"><a className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#dedbd0] px-5 font-body text-sm" href="/admin/books">Hủy</a><button className="admin-primary-action inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--color-olive)] px-5 font-body text-sm font-medium text-white" type="submit">Lưu sách</button></div></form></AdminSimpleCreateShell>
}

function AdminCategoryCreatePage() {
  return <AdminSimpleCreateShell title="Thêm danh mục" backHref="/admin/books/categories" section="DANH MỤC" description="Tạo danh mục từ database, chọn danh mục cha và thứ tự hiển thị."><form className="grid gap-4 sm:grid-cols-2" onSubmit={(event) => event.preventDefault()}><label className="block"><span className="mb-1.5 block font-body text-sm font-medium">Tên danh mục<span className="ml-1 text-[var(--color-olive-dark)]">*</span></span><input className="min-h-11 w-full rounded-xl border border-[#dedbd0] bg-[#fcfbf7] px-3.5 font-body text-sm" required /></label><label className="block"><span className="mb-1.5 block font-body text-sm font-medium">Danh mục cha</span><select className="min-h-11 w-full rounded-xl border border-[#dedbd0] bg-[#fcfbf7] px-3.5 font-body text-sm"><option>Không có, cấp cao nhất</option><option>Fiction</option><option>Non-fiction</option></select></label><label className="block"><span className="mb-1.5 block font-body text-sm font-medium">Thứ tự</span><input className="min-h-11 w-full rounded-xl border border-[#dedbd0] bg-[#fcfbf7] px-3.5 font-body text-sm" type="number" min="1" defaultValue="1" /></label><label className="block"><span className="mb-1.5 block font-body text-sm font-medium">Slug</span><input className="min-h-11 w-full rounded-xl border border-[#dedbd0] bg-[#fcfbf7] px-3.5 font-body text-sm" /></label><label className="block sm:col-span-2"><span className="mb-1.5 block font-body text-sm font-medium">Mô tả</span><textarea className="min-h-28 w-full rounded-xl border border-[#dedbd0] bg-[#fcfbf7] p-3.5 font-body text-sm" /></label><div className="flex justify-end gap-3 border-t border-[#eeeae0] pt-5 sm:col-span-2"><a className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#dedbd0] px-5 font-body text-sm" href="/admin/books/categories">Hủy</a><button className="admin-primary-action inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--color-olive)] px-5 font-body text-sm font-medium text-white" type="submit">Lưu danh mục</button></div></form></AdminSimpleCreateShell>
}

type AdminModuleConfig = { section: string; title: string; description: string; addLabel: string; columns: string[]; rows: string[][]; empty: string }
const adminPageSizeOptions = [10, 25, 50, 100]

function AdminTableFooter({ total, pageSize, onPageSizeChange }: { total: number; pageSize: number; onPageSizeChange: (value: number) => void }) {
  const shown = Math.min(total, pageSize)
  return <div className="flex flex-col justify-between gap-3 border-t border-[#eeeae0] px-4 py-3 font-body text-sm text-[#74776f] sm:flex-row sm:items-center"><span>Hiển thị {total === 0 ? 0 : 1}–{shown} / {total} bản ghi</span><label className="inline-flex items-center gap-2">Số dòng hiển thị<select className="min-h-9 rounded-lg border border-[#dedbd0] bg-white px-2.5 font-body text-sm text-[var(--color-ink)]" value={pageSize} onChange={(event) => onPageSizeChange(Number(event.target.value))}>{adminPageSizeOptions.map((option) => <option value={option} key={option}>{option}</option>)}</select></label></div>
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
  '/admin/orders': { section: 'BÁN HÀNG', title: 'Quản lý đơn hàng', description: 'Theo dõi các đơn hàng được tạo từ cửa hàng người dùng, kênh bán, thanh toán và giao hàng.', addLabel: '', columns: ['Mã đơn', 'Khách hàng', 'Kênh bán', 'Tổng tiền', 'Trạng thái'], rows: [], empty: 'Chưa có đơn hàng từ cửa hàng.' },
  '/admin/customers': { section: 'BÁN HÀNG', title: 'Quản lý khách hàng', description: 'Xem và chỉnh sửa hồ sơ khách hàng được tạo từ đăng ký hoặc đơn hàng trên cửa hàng người dùng.', addLabel: '', columns: ['Khách hàng', 'Email', 'Số điện thoại', 'Đơn hàng', 'Trạng thái'], rows: [], empty: 'Chưa có khách hàng từ cửa hàng.' },
  '/admin/stores': { section: 'BÁN HÀNG', title: 'Điểm bán và kho', description: 'Quản lý kênh bán, điểm bán, kho và số lượng tồn theo từng địa điểm.', addLabel: 'Thêm điểm bán', columns: ['Mã điểm', 'Tên điểm bán', 'Loại', 'Địa chỉ', 'Trạng thái'], rows: [['WEB', 'Website Linery', 'Kênh bán', 'Online', 'Đang hoạt động']], empty: 'Chưa có điểm bán.' },
  '/admin/media': { section: 'NỘI DUNG', title: 'Thư viện media', description: 'Quản lý ảnh bìa, ảnh tác giả, banner và metadata dùng chung.', addLabel: 'Tải media', columns: ['Tên file', 'Loại asset', 'Kích thước', 'Alt text', 'Trạng thái'], rows: [], empty: 'Chưa có media asset.' },
  '/admin/collections': { section: 'NỘI DUNG', title: 'Collection hiển thị', description: 'Quản lý các tuyển chọn như New & Upcoming, Linery Press và Linery Picks.', addLabel: 'Thêm collection', columns: ['Tên collection', 'Số sách', 'Thứ tự', 'Trạng thái'], rows: [['New & Upcoming', '0', '1', 'Đang hoạt động'], ['Linery News', '0', '2', 'Đang hoạt động']], empty: 'Chưa có collection.' },
  '/admin/locations': { section: 'HỆ THỐNG', title: 'Địa điểm và khu vực giao hàng', description: 'Quản lý tỉnh thành, quận huyện, phường xã và khu vực giao hàng.', addLabel: 'Thêm khu vực', columns: ['Tên khu vực', 'Cấp địa giới', 'Phí giao hàng', 'Trạng thái'], rows: [['Hà Nội', 'Tỉnh / thành phố', 'Cấu hình riêng', 'Đang hoạt động']], empty: 'Chưa có khu vực.' },
  '/admin/payments': { section: 'HỆ THỐNG', title: 'Thanh toán và tài khoản nhận tiền', description: 'Quản lý phương thức thanh toán, ngân hàng, QR và ví điện tử. Secret chỉ lưu ở backend.', addLabel: 'Thêm phương thức', columns: ['Phương thức', 'Loại', 'Môi trường', 'Thứ tự', 'Trạng thái'], rows: [['Chuyển khoản ngân hàng', 'Bank transfer', 'Production', '1', 'Đang hoạt động'], ['VNPay', 'Gateway', 'Sandbox', '2', 'Đang tắt'], ['MoMo', 'Wallet', 'Sandbox', '3', 'Đang tắt']], empty: 'Chưa có phương thức thanh toán.' },
  '/admin/chatbot': { section: 'HỆ THỐNG', title: 'Cấu hình Gemini chatbot', description: 'Cấu hình hiển thị, prompt, quick prompts, model và giới hạn vận hành. API key không hiển thị ở frontend.', addLabel: 'Thêm quick prompt', columns: ['Quick prompt', 'Ngôn ngữ', 'Thứ tự', 'Trạng thái'], rows: [['Find a book', 'English', '1', 'Đang hoạt động'], ['Tìm sách theo tác giả', 'Tiếng Việt', '2', 'Đang hoạt động']], empty: 'Chưa có quick prompt.' },
  '/admin/settings': { section: 'HỆ THỐNG', title: 'Cấu hình hệ thống', description: 'Cấu hình thương hiệu, hotline, email, footer, social, chính sách và nội dung storefront.', addLabel: 'Thêm cấu hình', columns: ['Nhóm cấu hình', 'Khóa', 'Ngôn ngữ', 'Trạng thái'], rows: [['Thương hiệu', 'site_name', 'Chung', 'Đã cấu hình'], ['Footer', 'footer_hotline', 'Tiếng Việt', 'Đã cấu hình'], ['Social', 'instagram_url', 'Chung', 'Chưa cấu hình']], empty: 'Chưa có cấu hình.' },
  '/admin/import-history': { section: 'SÁCH', title: 'Lịch sử nhập Excel', description: 'Xem lại các batch nhập sách, người thực hiện, kết quả và tải báo cáo lỗi.', addLabel: 'Nhập Excel', columns: ['Tên file', 'Người nhập', 'Tổng dòng', 'Hợp lệ', 'Lỗi', 'Trạng thái'], rows: [], empty: 'Chưa có lịch sử nhập.' },
  '/admin/publishers': { section: 'NỘI DUNG', title: 'Quản lý nhà xuất bản', description: 'Quản lý danh sách nhà xuất bản và liên kết với các đầu sách.', addLabel: 'Thêm nhà xuất bản', columns: ['Nhà xuất bản', 'Đường dẫn', 'Số sách', 'Trạng thái'], rows: [], empty: 'Chưa có nhà xuất bản.' },
  '/admin/website': { section: 'HỆ THỐNG', title: 'Cấu hình website', description: 'Quản lý logo, favicon, banner desktop/mobile, nội dung footer và bản xem trước trước khi xuất bản.', addLabel: 'Thêm content block', columns: ['Nhóm nội dung', 'Khóa', 'Ngôn ngữ', 'Trạng thái'], rows: [['Header', 'header_logo', 'Chung', 'Đã cấu hình'], ['Footer', 'footer_content', 'Tiếng Việt', 'Đã cấu hình'], ['Banner', 'home_banner_01', 'Chung', 'Bản nháp']], empty: 'Chưa có content block.' },
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
  const item = (href: string, label: string, icon: string) => <a className={`flex items-center gap-3 rounded-xl px-3 py-2.5 font-body text-sm transition-colors ${pathname === href ? 'bg-[rgba(155,148,47,.12)] font-semibold text-[var(--color-olive-dark)]' : 'text-[#62655f] hover:bg-[#f5f3ec] hover:text-[var(--color-ink)]'}`} href={href} aria-current={pathname === href ? 'page' : undefined}><i className={`bi ${icon}`} aria-hidden="true" />{label}</a>
  return <nav className="flex-1 space-y-1 overflow-y-auto p-4" aria-label="Điều hướng quản trị"><p className="px-3 pb-2 pt-3 font-body text-xs font-semibold uppercase tracking-[.14em] text-[#98968c]">Khu vực quản trị</p>{item('/admin', 'Tổng quan', 'bi-grid-1x2-fill')}<div><a className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 font-body text-sm font-semibold text-[var(--color-ink)]" href="/admin/books"><span className="flex items-center gap-3"><i className="bi bi-book" aria-hidden="true" />Quản lý sách</span><i className="bi bi-chevron-down text-xs" aria-hidden="true" /></a><AdminBookSubnav pathname={pathname} />{item('/admin/import-history', 'Lịch sử nhập Excel', 'bi-clock-history')}{item('/admin/collections', 'Mô đun sách trang chủ', 'bi-collection')}</div><p className="px-3 pb-2 pt-7 font-body text-xs font-semibold uppercase tracking-[.14em] text-[#98968c]">Bán hàng</p>{item('/admin/orders', 'Đơn hàng', 'bi-bag')}{item('/admin/reports', 'Báo cáo & thống kê', 'bi-bar-chart-line')}{item('/admin/customers', 'Khách hàng', 'bi-person-lines-fill')}{item('/admin/stores', 'Điểm bán và kho', 'bi-shop')}<p className="px-3 pb-2 pt-7 font-body text-xs font-semibold uppercase tracking-[.14em] text-[#98968c]">Nội dung</p>{item('/admin/authors', 'Nhà sáng tạo nội dung', 'bi-people')}{item('/admin/publishers', 'Nhà xuất bản', 'bi-building')}{item('/admin/news', 'Tin tức', 'bi-newspaper')}{item('/admin/media', 'Media', 'bi-images')}<p className="px-3 pb-2 pt-7 font-body text-xs font-semibold uppercase tracking-[.14em] text-[#98968c]">Hệ thống</p>{item('/admin/website', 'Website & footer', 'bi-window')}{item('/admin/locations', 'Địa điểm', 'bi-geo-alt')}{item('/admin/payments', 'Thanh toán', 'bi-credit-card')}{item('/admin/chatbot', 'Gemini chatbot', 'bi-chat-dots')}{item('/admin/settings', 'Cài đặt', 'bi-sliders')}</nav>
}

function AdminManagementSidebar({ pathname }: { pathname: string }) {
  return <AdminManagementSidebarBase pathname={pathname} />
}

type AdminAuthorRecord = { id: string; name: string; slug: string; role: string; books: number; email: string; status: 'Đang hoạt động' | 'Tạm ẩn'; image: string; bio: string }
const adminAuthorRecords: AdminAuthorRecord[] = [
  { id: 'edward-w-said', name: 'Edward W. Said', slug: 'edward-w-said', role: 'Tác giả', books: 4, email: '—', status: 'Đang hoạt động', image: '/assets/author-edward-w-said.png', bio: 'Edward W. Said là một trong những tiếng nói quan trọng của phê bình văn học và nghiên cứu văn hóa hiện đại.' },
  { id: 'toni-morrison', name: 'Toni Morrison', slug: 'toni-morrison', role: 'Tác giả', books: 1, email: '—', status: 'Đang hoạt động', image: '/assets/news-instagram-02.jpg', bio: 'Nhà văn Mỹ đoạt Nobel Văn học, được biết đến với những tác phẩm giàu chiều sâu về ký ức và căn tính.' },
  { id: 'yukio-mishima', name: 'Yukio Mishima', slug: 'yukio-mishima', role: 'Tác giả', books: 2, email: '—', status: 'Đang hoạt động', image: '/assets/news-instagram-04.jpg', bio: 'Nhà văn Nhật Bản với các tác phẩm giàu tính biểu tượng, kỷ luật hình thức và sức gợi văn hóa.' },
]

function AdminAuthorCreatePage({ pathname }: { pathname: string }) {
  const [form, setForm] = useState<AdminAuthorForm>(emptyAdminAuthorForm)
  const [saved, setSaved] = useState<'draft' | 'saved' | ''>('')
  const [imagePreview, setImagePreview] = useState('')
  const update = (key: keyof AdminAuthorForm, value: string) => setForm((current) => ({ ...current, [key]: value }))
  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const intent = (event.nativeEvent as SubmitEvent).submitter?.getAttribute('value') === 'draft' ? 'draft' : 'saved'
    setSaved(intent)
  }
  return <AdminSimpleCreateShell title="Thêm nhà sáng tạo nội dung" backHref="/admin/authors" section="NỘI DUNG" description="Nhập hồ sơ nhà sáng tạo nội dung theo dữ liệu Linery đã chuẩn hóa từ Google Sheets." tabs={[{ id: 'creator-profile', label: 'Thông tin hồ sơ' }, { id: 'creator-works', label: 'Tác phẩm và giải thưởng' }, { id: 'creator-bio', label: 'Tiểu sử và liên kết' }]} headerActions={<AdminCreateHeaderActions formId="admin-author-create-form" cancelHref="/admin/authors" saveLabel="Lưu nhà sáng tạo" />}>
    <form id="admin-author-create-form" className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]" onSubmit={submit}>
      <div className="grid min-w-0 gap-4">
        <AdminCreatePanel id="creator-profile" title="Thông tin hồ sơ">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2"><span className="mb-1.5 block font-body text-sm font-medium">Tên nhà sáng tạo<span className="ml-1 text-[var(--color-olive-dark)]">*</span></span><input className="min-h-11 w-full rounded-xl border border-[#dedbd0] bg-[#fcfbf7] px-3.5 font-body text-sm" required value={form.name} onChange={(event) => update('name', event.target.value)} placeholder="Nhập tên hiển thị" /></label>
            <label className="block"><span className="mb-1.5 block font-body text-sm font-medium">Phân loại<span className="ml-1 text-[var(--color-olive-dark)]">*</span></span><select className="min-h-11 w-full rounded-xl border border-[#dedbd0] bg-[#fcfbf7] px-3.5 font-body text-sm" required value={form.classification} onChange={(event) => update('classification', event.target.value as AdminAuthorForm['classification'])}><option value="">Chọn phân loại</option><option value="Tác giả">Tác giả</option><option value="Dịch giả">Dịch giả</option><option value="Họa sĩ minh họa">Họa sĩ minh họa</option></select></label>
            {adminAuthorFormFields.filter((field) => field.key !== 'name' && !['representativeWorks', 'awards', 'bio', 'imageLink', 'englishLink'].includes(field.key)).map((field) => <label className="block" key={field.key}><span className="mb-1.5 block font-body text-sm font-medium">{field.label}{field.required && <span className="ml-1 text-[var(--color-olive-dark)]">*</span>}</span><input className="min-h-11 w-full rounded-xl border border-[#dedbd0] bg-[#fcfbf7] px-3.5 font-body text-sm" type={field.input ?? 'text'} required={field.required} value={form[field.key]} onChange={(event) => update(field.key, event.target.value)} />{field.help && <span className="mt-1 block font-body text-xs text-[#8b8d86]">{field.help}</span>}</label>)}
          </div>
        </AdminCreatePanel>
        <AdminCreatePanel id="creator-works" title="Tác phẩm và giải thưởng">
          <div className="grid gap-5"><AdminRichTextEditor label="Tác phẩm tiêu biểu" value={form.representativeWorks} onChange={(value) => update('representativeWorks', value)} placeholder="Nhập các tác phẩm tiêu biểu..." /><AdminRichTextEditor label="Giải thưởng / danh hiệu" value={form.awards} onChange={(value) => update('awards', value)} placeholder="Nhập tên từng giải thưởng, năm và đơn vị trao giải..." /></div>
        </AdminCreatePanel>
        <AdminCreatePanel id="creator-bio" title="Tiểu sử và liên kết">
          <div className="grid gap-4"><AdminRichTextEditor label="Giới thiệu nhà sáng tạo nội dung" value={form.bio} onChange={(value) => update('bio', value)} placeholder="Nhập giới thiệu, lĩnh vực hoạt động và ghi chú biên tập..." /><label className="block"><span className="mb-1.5 block font-body text-sm font-medium">Link giới thiệu tiếng Anh</span><input className="min-h-11 w-full rounded-xl border border-[#dedbd0] bg-[#fcfbf7] px-3.5 font-body text-sm" type="url" value={form.englishLink} onChange={(event) => update('englishLink', event.target.value)} placeholder="https://..." /></label></div>
        </AdminCreatePanel>
        {saved && <p className="rounded-xl border border-[#cfe5d1] bg-[#f1f8f1] p-3 font-body text-sm text-[#39733e]" role="status">{saved === 'draft' ? 'Đã lưu bản nháp nhà sáng tạo nội dung.' : 'Đã lưu nhà sáng tạo nội dung.'} Bản ghi sẽ được đồng bộ vào danh mục khi kết nối backend.</p>}
      </div>
      <aside className="admin-create-aside grid content-start gap-4">
        <AdminCreatePanel title="Ảnh đại diện"><AdminImageUpload label="Ảnh nhà sáng tạo nội dung" showLabel={false} preview={imagePreview} fileName={form.imageLink} onFileChange={(file) => { update('imageLink', file.name); setImagePreview(URL.createObjectURL(file)) }} onClear={() => { update('imageLink', ''); setImagePreview('') }} /></AdminCreatePanel>
        <AdminCreatePanel title="Quy tắc hồ sơ"><ul className="list-disc space-y-2 pl-5 font-body text-sm leading-6 text-[#62655f]"><li>Tên hiển thị và phân loại là trường bắt buộc.</li><li>Mỗi giải thưởng nhập thành một dòng để dễ tra soát.</li><li>Ảnh dùng JPG, PNG hoặc WebP, tối đa 5MB.</li></ul></AdminCreatePanel>
      </aside>
      <div className="lg:col-span-2"><AdminFormActions cancelHref="/admin/authors" draftLabel="Lưu nháp" saveLabel="Lưu nhà sáng tạo nội dung" /></div>
    </form>
  </AdminSimpleCreateShell>
}

function AdminCreatePanel({ id, title, children, className = '' }: { id?: string; title: string; children: ReactNode; className?: string }) {
  return <section id={id} className={`admin-create-panel scroll-mt-24 overflow-hidden rounded-xl border border-[#e2e5ee] bg-white ${className}`}><div className="border-b border-[#e2e5ee] bg-[#eef0f7] px-4 py-3"><h2 className="font-body text-sm font-semibold text-[var(--color-ink)]">{title}</h2></div><div className="p-4 sm:p-5">{children}</div></section>
}

function AdminCreateTabs({ tabs }: { tabs: Array<{ id: string; label: string }> }) {
  return <nav className="admin-create-tabs flex items-center gap-1 overflow-x-auto border-b border-[#e5e2d7] bg-white px-4 sm:px-5 lg:px-6" aria-label="Các khu vực biểu mẫu">{tabs.map((tab, index) => <a className={`shrink-0 border-b-2 px-4 py-3 font-body text-sm ${index === 0 ? 'border-[var(--color-olive)] font-semibold text-[var(--color-olive-dark)]' : 'border-transparent text-[#74776f] hover:border-[#c9c5a5] hover:text-[var(--color-ink)]'}`} href={`#${tab.id}`} key={tab.id}>{tab.label}</a>)}</nav>
}

function AdminCreateHeaderActions({ formId, cancelHref, draftLabel = 'Lưu nháp', saveLabel }: { formId: string; cancelHref: string; draftLabel?: string; saveLabel: string }) {
  return <div className="admin-create-header-actions flex flex-nowrap items-center justify-end gap-2"><button className="inline-flex min-h-9 shrink-0 items-center justify-center whitespace-nowrap rounded-lg border border-[var(--color-olive)] px-3.5 font-body text-sm font-medium text-[var(--color-olive-dark)] hover:bg-[rgba(155,148,47,.08)]" form={formId} name="intent" type="submit" value="draft">{draftLabel}</button><button className="admin-primary-action inline-flex min-h-9 shrink-0 items-center justify-center whitespace-nowrap rounded-lg bg-[var(--color-olive)] px-3.5 font-body text-sm font-medium text-white hover:bg-[var(--color-olive-dark)]" form={formId} name="intent" type="submit" value="saved">{saveLabel}</button><a className="inline-flex min-h-9 shrink-0 items-center justify-center whitespace-nowrap rounded-lg border border-[#dedbd0] px-3.5 font-body text-sm text-[var(--color-ink)] hover:bg-[#f6f5ed]" href={cancelHref}>Hủy</a></div>
}

function AdminSimpleCreateShell({ title, section, description: _description, backHref, tabs = [], headerActions, children }: { title: string; section: string; description: string; backHref: string; tabs?: Array<{ id: string; label: string }>; headerActions?: ReactNode; children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  useEffect(() => {
    document.body.dataset.adminCreate = 'true'
    return () => { delete document.body.dataset.adminCreate }
  }, [])
  return <div className="admin-shell flex min-h-screen bg-[#f7f7f2] text-[var(--color-ink)]"><aside className={`admin-sidebar admin-create-sidebar fixed inset-y-0 left-0 z-40 flex w-72 -translate-x-full flex-col border-r border-[#e5e2d7] bg-white transition-transform duration-300 lg:static lg:translate-x-0 ${sidebarOpen ? 'is-open translate-x-0' : ''}`}><div className="flex h-16 items-center justify-between border-b border-[#eeeae0] px-5"><a className="font-display text-lg font-semibold tracking-[.08em] text-[var(--color-ink)]" href="/#home">LINERY <span className="font-body text-xs font-normal tracking-[.18em] text-[var(--color-olive)]">QUẢN TRỊ</span></a><button className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#dedbd0] text-[var(--color-ink)] lg:hidden" type="button" aria-label="Đóng menu quản trị" onClick={() => setSidebarOpen(false)}><i className="bi bi-x-lg" aria-hidden="true" /></button></div><AdminManagementSidebar pathname={window.location.pathname} /></aside>{sidebarOpen && <button className="fixed inset-0 z-30 bg-[rgba(31,42,36,.32)] lg:hidden" type="button" aria-label="Đóng menu quản trị" onClick={() => setSidebarOpen(false)} />}<div className="min-w-0 flex-1"><header className="admin-create-header sticky top-0 z-20 flex min-h-16 items-center justify-between gap-3 border-b border-[#e5e2d7] bg-white/95 px-4 backdrop-blur sm:px-5 lg:px-6"><div className="flex min-w-0 items-center gap-2"><button className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#dedbd0] text-[var(--color-ink)] lg:hidden" type="button" aria-label="Mở menu quản trị" onClick={() => setSidebarOpen(true)}><i className="bi bi-list" aria-hidden="true" /></button><a className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#dedbd0] text-[var(--color-ink)] hover:border-[var(--color-olive)] hover:text-[var(--color-olive-dark)]" href={backHref} aria-label="Quay lại danh sách"><i className="bi bi-arrow-left" aria-hidden="true" /></a><h1 className="truncate font-body text-lg font-semibold tracking-tight">{title}</h1></div>{headerActions}</header>{tabs.length > 0 && <AdminCreateTabs tabs={tabs} />}<main className="w-full p-3 sm:p-4 lg:p-5"><div className="admin-breadcrumb mb-4 flex items-center gap-2 font-body text-sm text-[#8b8d86]"><a className="hover:text-[var(--color-olive-dark)]" href="/admin">Quản trị</a><i className="bi bi-chevron-right text-xs" aria-hidden="true" /><span>{section}</span><i className="bi bi-chevron-right text-xs" aria-hidden="true" /><span className="font-medium text-[var(--color-ink)]">{title}</span></div><section className="rounded-2xl border border-[#e6e2d7] bg-white p-3 shadow-[0_8px_24px_rgba(31,42,36,.035)] sm:p-4">{children}</section></main></div></div>
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

function AdminImageUpload({ label, preview, fileName, onFileChange, onClear, showLabel = true }: { label: string; preview: string; fileName?: string; onFileChange: (file: File) => void; onClear: () => void; showLabel?: boolean }) {
  const inputId = `admin-image-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
  const accept = 'image/png,image/jpeg,image/webp'
  const handleFiles = (files: FileList | null) => { const file = files?.[0]; if (file && file.type.startsWith('image/')) onFileChange(file) }
  return <div className="w-full"><>{showLabel && <span className="mb-1.5 block font-body text-sm font-medium">{label}</span>}</><input id={inputId} className="sr-only" type="file" accept={accept} onChange={(event) => handleFiles(event.target.files)} /><label htmlFor={inputId} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); handleFiles(event.dataTransfer.files) }} className={`group flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-5 py-7 text-center transition ${preview ? 'border-[var(--color-olive)] bg-[rgba(155,148,47,.05)]' : 'border-[#d8d5c8] bg-[#fcfbf7] hover:border-[var(--color-olive)] hover:bg-[rgba(155,148,47,.05)]'}`}><span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-xl text-[var(--color-olive)] shadow-sm ring-1 ring-[#e6e2d7]"><i className={`bi ${preview ? 'bi-check2' : 'bi-cloud-arrow-up'}`} aria-hidden="true" /></span><span className="mt-3 font-body text-sm font-semibold text-[var(--color-ink)]">{preview ? 'Đã chọn ảnh' : 'Kéo thả ảnh vào đây'}</span><span className="mt-1 font-body text-xs text-[#8b8d86]">hoặc bấm để chọn từ máy tính</span><span className="mt-3 rounded-lg border border-[#dedbd0] bg-white px-3 py-1.5 font-body text-xs font-medium text-[#62655f] group-hover:border-[var(--color-olive)]">Chọn ảnh</span></label>{preview && <div className="mt-3 flex items-center gap-3 rounded-xl border border-[#e6e2d7] bg-white p-3"><img className="h-16 w-14 rounded-lg object-cover" src={preview} alt={`Xem trước ${label.toLowerCase()}`} /><div className="min-w-0 flex-1"><p className="truncate font-body text-sm font-medium">{fileName || 'Ảnh đã chọn'}</p><p className="mt-0.5 font-body text-xs text-[#8b8d86]">JPG, PNG hoặc WebP</p></div><button className="inline-flex h-9 items-center justify-center rounded-lg border border-[#dedbd0] px-3 font-body text-xs font-medium text-[#62655f] hover:border-[#a33d32] hover:text-[#a33d32]" type="button" onClick={onClear}>Xóa ảnh</button></div>}<p className="mt-2 font-body text-xs text-[#8b8d86]">Tối đa 5MB · Không nhập URL</p></div>
}

function AdminFormActions({ cancelHref, cancelLabel = 'Hủy', draftLabel, saveLabel }: { cancelHref: string; cancelLabel?: string; draftLabel?: string; saveLabel: string }) {
  return <div className="admin-form-actions"><div><a className="inline-flex items-center justify-center border border-[#dedbd0] font-body text-sm text-[var(--color-ink)] hover:bg-[#f6f5ed]" href={cancelHref}>{cancelLabel}</a>{draftLabel && <button className="inline-flex items-center justify-center border border-[var(--color-olive)] font-body text-sm font-medium text-[var(--color-olive-dark)] hover:bg-[rgba(155,148,47,.08)]" type="button">{draftLabel}</button>}<button className="admin-primary-action inline-flex items-center justify-center bg-[var(--color-olive)] font-body text-sm font-medium text-white hover:bg-[var(--color-olive-dark)]" type="submit">{saveLabel}</button></div></div>
}

function AdminAuthorsRestoredPage({ pathname }: { pathname: string }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [view, setView] = useState<'cards' | 'table' | 'detail'>('cards')
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState('edward-w-said')
  const [ascending, setAscending] = useState(true)
  const [pageSize, setPageSize] = useState(10)
  const [catalogBooks, setCatalogBooks] = useState<AdminCatalogBook[]>(readAdminCatalogBooks)
  const [bookView, setBookView] = useState<'list' | 'grid'>('list')
  useEffect(() => {
    const syncBooks = () => setCatalogBooks(readAdminCatalogBooks())
    window.addEventListener('storage', syncBooks)
    window.addEventListener('linery-admin-books-changed', syncBooks)
    return () => { window.removeEventListener('storage', syncBooks); window.removeEventListener('linery-admin-books-changed', syncBooks) }
  }, [])
  const authors = adminAuthorRecords
    .filter((author) => `${author.name} ${author.slug} ${author.role}`.toLowerCase().includes(query.trim().toLowerCase()))
    .sort((a, b) => ascending ? a.name.localeCompare(b.name, 'vi') : b.name.localeCompare(a.name, 'vi'))
  const selected = adminAuthorRecords.find((author) => author.id === selectedId) ?? adminAuthorRecords[0]
  const selectedBooks = catalogBooks.filter((book) => book.author === selected.name)
  const bookCount = (authorName: string) => catalogBooks.filter((book) => book.author === authorName).length
  const openDetail = (id: string) => { setSelectedId(id); setView('detail') }
  const viewButton = (value: 'cards' | 'table' | 'detail', icon: string, label: string) => (
    <button className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border px-3.5 font-body text-sm transition-colors ${view === value ? 'border-[var(--color-olive)] bg-[rgba(155,148,47,.12)] font-semibold text-[var(--color-olive-dark)]' : 'border-[#dedbd0] text-[#62655f] hover:border-[var(--color-olive)]'}`} type="button" aria-pressed={view === value} onClick={() => setView(value)}>
      <i className={`bi ${icon}`} aria-hidden="true" />{label}
    </button>
  )
  return (
    <div className="admin-shell flex min-h-screen bg-[#f7f7f2] text-[var(--color-ink)]">
       <aside className={`admin-sidebar admin-mobile-drawer fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-[#e5e2d7] bg-white transition-transform duration-300 lg:static ${sidebarOpen ? 'is-open' : ''}`}>
         <div className="flex h-16 items-center justify-between border-b border-[#eeeae0] px-5"><a className="font-display text-lg font-semibold tracking-[.08em] text-[var(--color-ink)]" href="/#home">LINERY <span className="font-body text-xs font-normal tracking-[.18em] text-[var(--color-olive)]">QUẢN TRỊ</span></a><button className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#dedbd0] lg:hidden" type="button" aria-label="Đóng menu quản trị" onClick={() => setSidebarOpen(false)}><i className="bi bi-x-lg" aria-hidden="true" /></button></div>
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
              <div className="flex flex-col gap-2 sm:flex-row"><button className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[#dedbd0] px-3.5 font-body text-sm text-[#62655f] hover:border-[var(--color-olive)]" type="button" onClick={() => setAscending((value) => !value)}><i className="bi bi-sort-alpha-down" aria-hidden="true" />Tên {ascending ? 'A–Z' : 'Z–A'}</button><label className="relative sm:w-72"><span className="sr-only">Tìm tác giả</span><i className="bi bi-search pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8b8d86]" aria-hidden="true" /><input className="min-h-10 w-full rounded-xl border border-[#dedbd0] bg-[#fcfbf7] pl-9 pr-3 font-body text-sm" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm tác giả" /></label><a className="admin-primary-action inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[var(--color-olive)] px-3.5 font-body text-sm font-medium text-white hover:bg-[var(--color-olive-dark)]" href="/admin/authors/new"><i className="bi bi-plus-lg" aria-hidden="true" />Thêm nhà sáng tạo</a></div>
            </div>
          </section>
           {view === 'cards' && <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">{authors.map((author) => <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-[#e6e2d7] bg-white" key={author.id}><div className="flex items-center justify-between border-b border-[#eeeae0] px-3 py-2.5"><span className="font-body text-xs text-[#8b8d86]">{author.role}</span><div className="flex gap-1"><button className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#74776f] hover:bg-[#f5f3ec]" type="button" aria-label={`Sửa ${author.name}`}><i className="bi bi-pencil" aria-hidden="true" /></button><button className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#74776f] hover:bg-[#f5f3ec]" type="button" aria-label={`Tạm ẩn ${author.name}`}><i className="bi bi-eye-slash" aria-hidden="true" /></button></div></div><img className="aspect-[2/3] w-full object-cover object-top" src={author.image} alt={author.name} /><div className="flex flex-1 flex-col space-y-3 p-4"><button className="text-left font-display text-xl font-bold hover:text-[var(--color-olive-dark)]" type="button" onClick={() => openDetail(author.id)}>{author.name}</button><dl className="space-y-2 font-body text-sm"><div className="flex justify-between gap-3"><dt className="font-semibold">Số sách</dt><dd className="text-[#74776f]">{bookCount(author.name)}</dd></div><div className="flex justify-between gap-3"><dt className="font-semibold">Trạng thái</dt><dd className="font-semibold text-[#39733e]">{author.status}</dd></div></dl><button className="mt-auto inline-flex min-h-10 w-full items-center justify-center rounded-xl bg-[var(--color-olive)] px-3 font-body text-sm font-medium text-white hover:bg-[var(--color-olive-dark)]" type="button" onClick={() => openDetail(author.id)}>Xem hồ sơ</button></div></article>)}</section>}
          {view === 'table' && <section className="mt-6 overflow-hidden rounded-2xl border border-[#e6e2d7] bg-white"><div className="overflow-x-auto"><table className="min-w-[820px] w-full text-left"><thead className="bg-[#fcfbf7]"><tr><th className="px-4 py-3 font-body text-sm font-semibold">STT</th><th className="px-4 py-3 font-body text-sm font-semibold">Tên nhà sáng tạo</th><th className="px-4 py-3 font-body text-sm font-semibold">Slug</th><th className="px-4 py-3 font-body text-sm font-semibold">Phân loại</th><th className="px-4 py-3 font-body text-sm font-semibold">Số sách</th><th className="px-4 py-3 font-body text-sm font-semibold">Trạng thái</th><th className="px-4 py-3 text-right font-body text-sm font-semibold">Thao tác</th></tr></thead><tbody>{authors.slice(0, pageSize).map((author, index) => <tr className="border-t border-[#eeeae0]" key={author.id}><td className="px-4 py-3 font-body text-sm text-[#74776f]">{index + 1}</td><td className="px-4 py-3 font-body text-sm font-medium"><button type="button" onClick={() => openDetail(author.id)}>{author.name}</button></td><td className="px-4 py-3 font-body text-sm text-[#74776f]">{author.slug}</td><td className="px-4 py-3 font-body text-sm">{author.role}</td><td className="px-4 py-3 font-body text-sm">{author.books}</td><td className="px-4 py-3 font-body text-sm"><span className="rounded-full bg-[#edf7ef] px-2.5 py-1 text-xs font-semibold text-[#39733e]">{author.status}</span></td><td className="px-4 py-3 text-right"><button className="mr-1 inline-flex h-8 w-8 items-center justify-center rounded-full text-[#74776f] hover:bg-[#f5f3ec]" type="button" aria-label={`Sửa ${author.name}`}><i className="bi bi-pencil" aria-hidden="true" /></button><button className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#74776f] hover:bg-[#f5f3ec]" type="button" aria-label={`Tạm ẩn ${author.name}`}><i className="bi bi-eye-slash" aria-hidden="true" /></button></td></tr>)}</tbody></table></div><AdminTableFooter total={authors.length} pageSize={pageSize} onPageSizeChange={setPageSize} /></section>}
           {view === 'detail' && <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(420px,.9fr)]"><article className="rounded-2xl border border-[#e6e2d7] bg-white p-5 sm:p-6"><div className="flex items-center justify-between border-b border-[#eeeae0] pb-4"><div><p className="font-body text-sm text-[#8b8d86]">Hồ sơ nhà sáng tạo</p><h3 className="mt-1 font-display text-2xl font-semibold">{selected.name}</h3></div><div className="flex gap-2"><button className="inline-flex min-h-10 rounded-xl bg-[var(--color-olive)] px-4 font-body text-sm font-medium text-white" type="button">Lưu</button><button className="inline-flex min-h-10 rounded-xl border border-[#dedbd0] px-4 font-body text-sm" type="button" onClick={() => setView('cards')}>Hủy</button></div></div><div className="mt-5 grid gap-5 sm:grid-cols-[180px_minmax(0,1fr)]"><img className="h-56 w-full rounded-xl object-cover object-top" src={selected.image} alt={selected.name} /><div className="space-y-4"><label className="block"><span className="mb-1.5 block font-body text-sm font-medium">Tên hiển thị</span><input className="min-h-11 w-full rounded-xl border border-[#dedbd0] bg-[#fcfbf7] px-3.5 font-body text-sm" defaultValue={selected.name} /></label><label className="block"><span className="mb-1.5 block font-body text-sm font-medium">Đường dẫn</span><input className="min-h-11 w-full rounded-xl border border-[#dedbd0] bg-[#fcfbf7] px-3.5 font-body text-sm" defaultValue={selected.slug} /></label><label className="block"><span className="mb-1.5 block font-body text-sm font-medium">Phân loại</span><select className="min-h-11 w-full rounded-xl border border-[#dedbd0] bg-[#fcfbf7] px-3.5 font-body text-sm" defaultValue={selected.role}><option>Tác giả</option><option>Dịch giả</option><option>Họa sĩ minh họa</option></select></label></div></div><label className="mt-5 block"><span className="mb-1.5 block font-body text-sm font-medium">Tiểu sử</span><textarea className="min-h-32 w-full rounded-xl border border-[#dedbd0] bg-[#fcfbf7] p-3.5 font-body text-sm" defaultValue={selected.bio} /></label></article><aside className="rounded-2xl border border-[#e6e2d7] bg-white p-5 sm:p-6"><div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#eeeae0] pb-4"><div><h3 className="font-display text-xl font-semibold">Tác phẩm liên quan</h3><p className="mt-1 font-body text-sm text-[#74776f]">{selectedBooks.length} cuốn sách được liên kết với tác giả này.</p></div><div className="flex gap-2" role="group" aria-label="Kiểu hiển thị sách"><button className={`inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border px-3 font-body text-xs ${bookView === 'list' ? 'border-[var(--color-olive)] bg-[rgba(155,148,47,.12)] font-semibold text-[var(--color-olive-dark)]' : 'border-[#dedbd0] text-[#62655f]'}`} type="button" aria-pressed={bookView === 'list'} onClick={() => setBookView('list')}><i className="bi bi-list-ul" aria-hidden="true" />Danh sách</button><button className={`inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border px-3 font-body text-xs ${bookView === 'grid' ? 'border-[var(--color-olive)] bg-[rgba(155,148,47,.12)] font-semibold text-[var(--color-olive-dark)]' : 'border-[#dedbd0] text-[#62655f]'}`} type="button" aria-pressed={bookView === 'grid'} onClick={() => setBookView('grid')}><i className="bi bi-grid-3x3-gap" aria-hidden="true" />Lưới</button></div></div>{selectedBooks.length === 0 ? <p className="mt-5 rounded-xl border border-dashed border-[#d9d6c8] bg-[#fcfbf7] p-5 font-body text-sm leading-6 text-[#74776f]">Chưa có sách được liên kết. Khi tạo sách và chọn tác giả này, sách sẽ xuất hiện tại đây.</p> : bookView === 'list' ? <div className="mt-5 space-y-3">{selectedBooks.map((book, index) => <a className="flex items-center gap-3 rounded-xl border border-[#e6e2d7] bg-[#fcfbf7] p-3 transition hover:border-[var(--color-olive)]" href={`/admin/books/report/${book.id}`} key={book.id}><span className="w-7 shrink-0 font-body text-sm font-semibold text-[var(--color-olive-dark)]">{index + 1}</span><img className="h-16 w-11 shrink-0 rounded-md object-cover" src={book.cover} alt="" /><span className="min-w-0 flex-1 font-body text-sm font-semibold text-[var(--color-ink)]">{book.title}</span><i className="bi bi-arrow-up-right shrink-0 text-[#8b8d86]" aria-hidden="true" /></a>)}</div> : <div className="mt-5 grid grid-cols-2 gap-3">{selectedBooks.map((book, index) => <a className="rounded-xl border border-[#e6e2d7] bg-[#fcfbf7] p-3 transition hover:border-[var(--color-olive)]" href={`/admin/books/report/${book.id}`} key={book.id}><div className="relative"><img className="aspect-[2/3] w-full rounded-lg object-cover" src={book.cover} alt="" /><span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 font-body text-xs font-semibold text-[var(--color-olive-dark)]">{index + 1}</span></div><span className="mt-2 block font-body text-sm font-semibold leading-5 text-[var(--color-ink)]">{book.title}</span></a>)}</div>}</aside></section>}
        </main>
      </div>
    </div>
  )
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
  return <div className="admin-shell flex min-h-screen bg-[#f7f7f2] text-[var(--color-ink)]"><aside className={`admin-sidebar fixed inset-y-0 left-0 z-40 flex w-72 -translate-x-full flex-col border-r border-[#e5e2d7] bg-white transition-transform duration-300 lg:static lg:translate-x-0 ${sidebarOpen ? 'is-open translate-x-0' : ''}`}><div className="flex h-20 items-center justify-between border-b border-[#eeeae0] px-6"><a className="font-display text-lg font-semibold tracking-[.08em] text-[var(--color-ink)]" href="/#home">LINERY <span className="font-body text-xs font-normal tracking-[.18em] text-[var(--color-olive)]">QUẢN TRỊ</span></a><button className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#dedbd0] lg:hidden" type="button" aria-label="Đóng menu quản trị" onClick={() => setSidebarOpen(false)}><i className="bi bi-x-lg" aria-hidden="true" /></button></div><AdminManagementSidebar pathname={pathname} /><div className="border-t border-[#eeeae0] p-4"><a className="flex items-center gap-3 rounded-xl px-3 py-2.5 font-body text-sm text-[#62655f] hover:bg-[#f5f3ec]" href="/#home"><i className="bi bi-arrow-left" aria-hidden="true" />Về cửa hàng</a></div></aside>{sidebarOpen && <button className="fixed inset-0 z-30 bg-[rgba(31,42,36,.32)] lg:hidden" type="button" aria-label="Đóng menu quản trị" onClick={() => setSidebarOpen(false)} />}<div className="min-w-0 flex-1"><header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-[#e5e2d7] bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8"><div className="flex items-center gap-3"><button className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#dedbd0] lg:hidden" type="button" aria-label="Mở menu quản trị" onClick={() => setSidebarOpen(true)}><i className="bi bi-list" aria-hidden="true" /></button><div><p className="font-body text-sm text-[#8b8d86]">Nội dung</p><h1 className="font-display text-xl font-semibold tracking-tight sm:text-2xl">Hồ sơ tác giả</h1></div></div><button className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-olive)] font-display text-sm text-white" type="button" aria-label="Hồ sơ quản trị">K</button></header><main className="mx-auto w-full max-w-[1440px] p-4 sm:p-6 lg:p-8"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="mb-2 font-body text-sm font-semibold uppercase tracking-[.14em] text-[var(--color-olive)]">NỘI DUNG</p><h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">Hồ sơ tác giả</h2><p className="mt-2 max-w-2xl font-body text-sm leading-6 text-[#74776f]">Quản lý thông tin, hình ảnh và các tác phẩm được liên kết với từng tác giả.</p></div><button className="admin-primary-action inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--color-olive)] px-5 font-body text-sm font-medium text-white hover:bg-[var(--color-olive-dark)]" type="button"><i className="bi bi-plus-lg mr-2" aria-hidden="true" />Thêm tác giả</button></div><section className="mt-6 rounded-2xl border border-[#e6e2d7] bg-white p-4 shadow-[0_10px_30px_rgba(31,42,36,.04)] sm:p-5"><div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"><div className="flex flex-wrap gap-2">{viewButton('cards', 'bi-grid-3x3-gap', 'Thẻ')}{viewButton('table', 'bi-list-ul', 'Bảng')}{viewButton('detail', 'bi-person-vcard', 'Chi tiết')}</div><div className="flex flex-col gap-2 sm:flex-row"><button className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[#dedbd0] px-3.5 font-body text-sm text-[#62655f] hover:border-[var(--color-olive)]" type="button" onClick={() => setSortAscending((current) => !current)}><i className="bi bi-sort-alpha-down" aria-hidden="true" />Tên {sortAscending ? 'A–Z' : 'Z–A'}</button><label className="relative sm:w-72"><span className="sr-only">Tìm tác giả</span><i className="bi bi-search pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8b8d86]" aria-hidden="true" /><input className="min-h-10 w-full rounded-xl border border-[#dedbd0] bg-[#fcfbf7] pl-9 pr-3 font-body text-sm" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm tác giả" /></label></div></div></section>{view === 'cards' && <section className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{authors.map((author) => <article className="overflow-hidden rounded-2xl border border-[#e6e2d7] bg-white" key={author.id}><div className="flex items-center justify-between border-b border-[#eeeae0] px-4 py-3"><span className="font-body text-xs text-[#8b8d86]">{author.role}</span><div className="flex gap-1"><button className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#74776f] hover:bg-[#f5f3ec]" type="button" aria-label={`Sửa ${author.name}`}><i className="bi bi-pencil" aria-hidden="true" /></button><button className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#74776f] hover:bg-[#f5f3ec]" type="button" aria-label={`Tạm ẩn ${author.name}`}><i className="bi bi-eye-slash" aria-hidden="true" /></button></div></div><img className="h-64 w-full object-cover object-top" src={author.image} alt={author.name} /><div className="space-y-3 p-5"><button className="font-display text-xl font-semibold hover:text-[var(--color-olive-dark)]" type="button" onClick={() => openDetail(author.id)}>{author.name}</button><dl className="space-y-2 font-body text-sm"><div className="flex justify-between gap-4"><dt className="font-semibold">Slug</dt><dd className="text-[#74776f]">{author.slug}</dd></div><div className="flex justify-between gap-4"><dt className="font-semibold">Số sách</dt><dd className="text-[#74776f]">{author.books}</dd></div><div className="flex justify-between gap-4"><dt className="font-semibold">Trạng thái</dt><dd className="font-semibold text-[#39733e]">{author.status}</dd></div></dl><button className="inline-flex min-h-10 w-full items-center justify-center rounded-xl bg-[var(--color-olive)] px-4 font-body text-sm font-medium text-white hover:bg-[var(--color-olive-dark)]" type="button" onClick={() => openDetail(author.id)}>Xem hồ sơ</button></div></article>)}</section>}{view === 'table' && <section className="mt-6 overflow-hidden rounded-2xl border border-[#e6e2d7] bg-white"><div className="overflow-x-auto"><table className="min-w-[820px] w-full text-left"><thead className="bg-[#fcfbf7]"><tr><th className="px-4 py-3 font-body text-sm font-semibold">STT</th><th className="px-4 py-3 font-body text-sm font-semibold">Tên tác giả</th><th className="px-4 py-3 font-body text-sm font-semibold">Slug</th><th className="px-4 py-3 font-body text-sm font-semibold">Vai trò</th><th className="px-4 py-3 font-body text-sm font-semibold">Số sách</th><th className="px-4 py-3 font-body text-sm font-semibold">Trạng thái</th><th className="px-4 py-3 text-right font-body text-sm font-semibold">Thao tác</th></tr></thead><tbody>{pagedAuthors.map((author, index) => <tr className="border-t border-[#eeeae0]" key={author.id}><td className="px-4 py-3 font-body text-sm text-[#74776f]">{index + 1}</td><td className="px-4 py-3 font-body text-sm font-medium"><button type="button" onClick={() => openDetail(author.id)}>{author.name}</button></td><td className="px-4 py-3 font-body text-sm text-[#74776f]">{author.slug}</td><td className="px-4 py-3 font-body text-sm">{author.role}</td><td className="px-4 py-3 font-body text-sm">{author.books}</td><td className="px-4 py-3 font-body text-sm"><span className="rounded-full bg-[#edf7ef] px-2.5 py-1 text-xs font-semibold text-[#39733e]">{author.status}</span></td><td className="px-4 py-3 text-right"><button className="mr-1 inline-flex h-8 w-8 items-center justify-center rounded-full text-[#74776f] hover:bg-[#f5f3ec]" type="button" aria-label={`Sửa ${author.name}`}><i className="bi bi-pencil" aria-hidden="true" /></button><button className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#74776f] hover:bg-[#f5f3ec]" type="button" aria-label={`Tạm ẩn ${author.name}`}><i className="bi bi-eye-slash" aria-hidden="true" /></button></td></tr>)}</tbody><tfoot><AdminSummaryRow rows={authors.map((author) => [String(author.books)])} numericColumns={[1]} columnCount={7} /></tfoot></table></div><AdminTableFooter total={authors.length} pageSize={pageSize} onPageSizeChange={setPageSize} /></section>}{view === 'detail' && <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(360px,.8fr)]"><article className="rounded-2xl border border-[#e6e2d7] bg-white p-5 sm:p-6"><div className="flex items-center justify-between border-b border-[#eeeae0] pb-4"><div><p className="font-body text-sm text-[#8b8d86]">Hồ sơ tác giả</p><h3 className="mt-1 font-display text-2xl font-semibold">{selected.name}</h3></div><div className="flex gap-2"><button className="inline-flex min-h-10 rounded-xl bg-[var(--color-olive)] px-4 font-body text-sm font-medium text-white" type="button">Lưu</button><button className="inline-flex min-h-10 rounded-xl border border-[#dedbd0] px-4 font-body text-sm" type="button" onClick={() => setView('cards')}>Hủy</button></div></div><div className="mt-5 grid gap-5 sm:grid-cols-[180px_minmax(0,1fr)]"><img className="h-56 w-full rounded-xl object-cover object-top" src={selected.image} alt={selected.name} /><div className="space-y-4"><label className="block"><span className="mb-1.5 block font-body text-sm font-medium">Tên hiển thị</span><input className="min-h-11 w-full rounded-xl border border-[#dedbd0] bg-[#fcfbf7] px-3.5 font-body text-sm" defaultValue={selected.name} /></label><label className="block"><span className="mb-1.5 block font-body text-sm font-medium">Slug</span><input className="min-h-11 w-full rounded-xl border border-[#dedbd0] bg-[#fcfbf7] px-3.5 font-body text-sm" defaultValue={selected.slug} /></label><label className="block"><span className="mb-1.5 block font-body text-sm font-medium">Vai trò</span><select className="min-h-11 w-full rounded-xl border border-[#dedbd0] bg-[#fcfbf7] px-3.5 font-body text-sm" defaultValue={selected.role}><option>Author</option><option>Translator</option></select></label></div></div><label className="mt-5 block"><span className="mb-1.5 block font-body text-sm font-medium">Tiểu sử</span><textarea className="min-h-32 w-full rounded-xl border border-[#dedbd0] bg-[#fcfbf7] p-3.5 font-body text-sm" defaultValue={selected.bio} /></label></article><aside className="rounded-2xl border border-[#e6e2d7] bg-white p-5 sm:p-6"><div className="border-b border-[#eeeae0] pb-4"><h3 className="font-display text-xl font-semibold">Tác phẩm liên quan</h3><p className="mt-1 font-body text-sm text-[#74776f]">{selected.books} bản ghi được liên kết với tác giả này.</p></div><div className="mt-5 space-y-3">{Array.from({ length: selected.books }, (_, index) => <div className="flex items-center justify-between gap-3 rounded-xl border border-[#e6e2d7] bg-[#fcfbf7] p-3" key={index}><span className="font-body text-sm">Tác phẩm liên kết {index + 1}</span><i className="bi bi-arrow-up-right text-[#8b8d86]" aria-hidden="true" /></div>)}</div></aside></section>}{authors.length === 0 && <section className="mt-6 rounded-2xl border border-[#e6e2d7] bg-white p-10 text-center"><i className="bi bi-people text-3xl text-[var(--color-olive)]" aria-hidden="true" /><h3 className="mt-3 font-display text-lg font-semibold">Chưa có tác giả</h3><p className="mt-2 font-body text-sm text-[#74776f]">Không tìm thấy tác giả phù hợp.</p></section>}</main></div></div>
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
  const canCreate = pathname !== '/admin/orders' && pathname !== '/admin/customers'
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
  return <div className="admin-shell flex min-h-screen bg-[#f7f7f2] text-[var(--color-ink)]"><aside className={`admin-sidebar fixed inset-y-0 left-0 z-40 flex w-72 -translate-x-full flex-col border-r border-[#e5e2d7] bg-white transition-transform duration-300 lg:static lg:translate-x-0 ${sidebarOpen ? 'is-open translate-x-0' : ''}`}><div className="flex h-20 items-center justify-between border-b border-[#eeeae0] px-6"><a className="font-display text-lg font-semibold tracking-[.08em] text-[var(--color-ink)]" href="/#home">LINERY <span className="font-body text-xs font-normal tracking-[.18em] text-[var(--color-olive)]">QUẢN TRỊ</span></a><button className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#dedbd0] lg:hidden" type="button" aria-label="Đóng menu quản trị" onClick={() => setSidebarOpen(false)}><i className="bi bi-x-lg" aria-hidden="true" /></button></div><nav className="flex-1 space-y-1 overflow-y-auto p-4" aria-label="Điều hướng quản trị"><p className="px-3 pb-2 pt-3 font-body text-xs font-semibold uppercase tracking-[.14em] text-[#98968c]">Khu vực quản trị</p>{item('/admin', 'Tổng quan', 'bi-grid-1x2-fill')}<AdminBookSubnav pathname={pathname} /><p className="px-3 pb-2 pt-7 font-body text-xs font-semibold uppercase tracking-[.14em] text-[#98968c]">Bán hàng</p>{item('/admin/orders', 'Đơn hàng', 'bi-bag')}{item('/admin/customers', 'Khách hàng', 'bi-person-lines-fill')}{item('/admin/stores', 'Điểm bán và kho', 'bi-shop')}<p className="px-3 pb-2 pt-7 font-body text-xs font-semibold uppercase tracking-[.14em] text-[#98968c]">Nội dung</p>{item('/admin/authors', 'Tác giả', 'bi-people')}{item('/admin/publishers', 'Nhà xuất bản', 'bi-building')}{item('/admin/news', 'Tin tức', 'bi-newspaper')}{item('/admin/media', 'Media', 'bi-images')}{item('/admin/collections', 'Collection', 'bi-collection')}<p className="px-3 pb-2 pt-7 font-body text-xs font-semibold uppercase tracking-[.14em] text-[#98968c]">Hệ thống</p>{item('/admin/website', 'Website & footer', 'bi-window')}{item('/admin/locations', 'Địa điểm', 'bi-geo-alt')}{item('/admin/payments', 'Thanh toán', 'bi-credit-card')}{item('/admin/chatbot', 'Gemini chatbot', 'bi-chat-dots')}{item('/admin/settings', 'Cài đặt', 'bi-sliders')}</nav><div className="border-t border-[#eeeae0] p-4"><a className="flex items-center gap-3 rounded-xl px-3 py-2.5 font-body text-sm text-[#62655f] hover:bg-[#f5f3ec]" href="/#home"><i className="bi bi-arrow-left" aria-hidden="true" />Về cửa hàng</a></div></aside>{sidebarOpen && <button className="fixed inset-0 z-30 bg-[rgba(31,42,36,.32)] lg:hidden" type="button" aria-label="Đóng menu quản trị" onClick={() => setSidebarOpen(false)} />}<div className="min-w-0 flex-1"><header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-[#e5e2d7] bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8"><div className="flex items-center gap-3"><button className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#dedbd0] lg:hidden" type="button" aria-label="Mở menu quản trị" onClick={() => setSidebarOpen(true)}><i className="bi bi-list" aria-hidden="true" /></button><div><p className="font-body text-sm text-[#8b8d86]">Quản trị</p><h1 className="font-display text-xl font-semibold tracking-tight sm:text-2xl">{config.title}</h1></div></div><button className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-olive)] font-display text-sm text-white" type="button" aria-label="Hồ sơ quản trị">K</button></header><main className="mx-auto w-full max-w-[1440px] p-4 sm:p-6 lg:p-8"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="mb-2 font-body text-sm font-semibold uppercase tracking-[.14em] text-[var(--color-olive)]">{config.section}</p><h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">{config.title}</h2><p className="mt-2 max-w-3xl font-body text-sm leading-6 text-[#74776f]">{config.description}</p></div><button className="admin-primary-action inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--color-olive)] px-5 font-body text-sm font-medium text-white hover:bg-[var(--color-olive-dark)]" type="button" onClick={openAdd}><i className="bi bi-plus-lg mr-2" aria-hidden="true" />{config.addLabel}</button></div>{formOpen && <form className="mt-6 rounded-2xl border border-[#e6e2d7] bg-white p-5" onSubmit={saveRow}><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{config.columns.map((column, index) => <label className="block" key={column}><span className="mb-1.5 block font-body text-sm font-medium">{column}{index === 0 && <span className="ml-1 text-[var(--color-olive-dark)]">*</span>}</span>{index === config.columns.length - 1 ? <select className="min-h-11 w-full rounded-xl border border-[#dedbd0] bg-[#fcfbf7] px-3.5 font-body text-sm" value={draft[index]} onChange={(event) => setDraft((current) => current.map((value, valueIndex) => valueIndex === index ? event.target.value : value))}><option value="">Chọn trạng thái</option><option>Đang hoạt động</option><option>Bản nháp</option><option>Đã cấu hình</option><option>Tạm ẩn</option><option>Đang tắt</option></select> : <input className="min-h-11 w-full rounded-xl border border-[#dedbd0] bg-[#fcfbf7] px-3.5 font-body text-sm" value={draft[index]} onChange={(event) => setDraft((current) => current.map((value, valueIndex) => valueIndex === index ? event.target.value : value))} placeholder={`Nhập ${column.toLowerCase()}`} />}</label>)}</div><div className="mt-5 flex justify-end gap-3"><button className="inline-flex min-h-10 rounded-xl border border-[#dedbd0] px-5 font-body text-sm" type="button" onClick={resetForm}>Hủy</button><button className="admin-primary-action inline-flex min-h-10 rounded-xl bg-[var(--color-olive)] px-5 font-body text-sm font-medium text-white" type="submit">{editingIndex === null ? 'Thêm mới' : 'Lưu thay đổi'}</button></div></form>}<section className="mt-6 overflow-hidden rounded-2xl border border-[#e6e2d7] bg-white"><div className="flex flex-col gap-3 border-b border-[#eeeae0] p-5 sm:flex-row sm:items-center sm:justify-between"><div><h3 className="font-display text-lg font-semibold">Danh sách dữ liệu</h3><p className="mt-1 font-body text-sm text-[#74776f]">{sortedRows.length} bản ghi phù hợp.</p></div><label className="relative min-w-0 sm:w-80"><span className="sr-only">Tìm kiếm</span><i className="bi bi-search pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8b8d86]" aria-hidden="true" /><input className="min-h-10 w-full rounded-xl border border-[#dedbd0] bg-[#fcfbf7] pl-10 pr-3 font-body text-sm" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Tìm trong ${config.title.toLowerCase()}`} /></label></div>{sortedRows.length ? <><div className="overflow-x-auto"><table className="min-w-[900px] w-full text-left"><thead className="bg-[#fcfbf7]"><tr><th className="w-16 px-4 py-3 font-body text-sm font-semibold">STT</th>{config.columns.map((column, index) => <th className="px-4 py-3 font-body text-sm font-semibold" key={column}><button className="inline-flex items-center gap-1.5" type="button" onClick={() => setSort((current) => ({ index, ascending: current.index === index ? !current.ascending : true }))}>{column}<span className="text-xs text-[#98968c]">{sort.index === index ? (sort.ascending ? '↑' : '↓') : '↕'}</span></button></th>)}<th className="w-36 px-4 py-3 text-right font-body text-sm font-semibold">Thao tác</th></tr></thead><tbody>{pagedRows.map(({ row, index }, rowIndex) => <tr className={`border-t border-[#eeeae0] ${hiddenRows.includes(index) ? 'bg-[#faf9f5] text-[#98968c]' : ''}`} key={`${index}-${row.join('-')}`}><td className="px-4 py-3 font-body text-sm text-[#74776f]">{rowIndex + 1}</td>{row.map((value, cellIndex) => <td className="px-4 py-3 font-body text-sm" key={`${cellIndex}-${value}`}>{cellIndex === row.length - 1 ? <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${hiddenRows.includes(index) ? 'bg-[#f2f1ec] text-[#8b8d86]' : 'bg-[#edf7ef] text-[#39733e]'}`}>{hiddenRows.includes(index) ? 'Tạm ẩn' : value}</span> : value}</td>)}<td className="px-4 py-3 text-right"><div className="flex justify-end gap-1"><button className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#74776f] hover:bg-[#f5f3ec]" type="button" aria-label={`Sửa ${row[0]}`} onClick={() => openEdit(index)}><i className="bi bi-pencil" aria-hidden="true" /></button><button className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#74776f] hover:bg-[#f5f3ec]" type="button" aria-label={hiddenRows.includes(index) ? `Hiện ${row[0]}` : `Tạm ẩn ${row[0]}`} onClick={() => toggleHidden(index)}><i className={`bi ${hiddenRows.includes(index) ? 'bi-eye' : 'bi-eye-slash'}`} aria-hidden="true" /></button><button className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#8b8d86] hover:bg-[#f1e8e5] hover:text-[#a33d32]" type="button" aria-label={`Xóa ${row[0]}`} onClick={() => removeRow(index)}><i className="bi bi-trash3" aria-hidden="true" /></button></div></td></tr>)}</tbody><tfoot><AdminSummaryRow rows={rows} numericColumns={numericModuleColumns} columnCount={config.columns.length + 2} /></tfoot></table></div><AdminTableFooter total={sortedRows.length} pageSize={pageSize} onPageSizeChange={setPageSize} /></> : <div className="px-5 py-14 text-center"><i className="bi bi-inbox text-3xl text-[var(--color-olive)]" aria-hidden="true" /><h3 className="mt-3 font-display text-lg font-semibold">{config.empty}</h3><p className="mt-2 font-body text-sm text-[#74776f]">Dữ liệu sẽ xuất hiện tại đây sau khi kết nối backend.</p></div>}</section></main></div></div>
}


function AdminModulePageV3({ pathname, config }: { pathname: string; config: AdminModuleConfig }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [rows, setRows] = useState(() => getStorefrontAdminRows(pathname, config.rows))
  const [sort, setSort] = useState({ index: 0, ascending: true })
  const [pageSize, setPageSize] = useState(10)
  const [formOpen, setFormOpen] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [draft, setDraft] = useState<string[]>(() => config.columns.map(() => ''))
  const canCreate = pathname !== '/admin/orders' && pathname !== '/admin/customers'
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
    return matchesQuery && matchesStatus
  })
  const sortedRows = [...filteredRows].sort((first, second) => {
    const result = (first.row[sort.index] ?? '').localeCompare(second.row[sort.index] ?? '', 'vi', { numeric: true })
    return sort.ascending ? result : -result
  })
  const pagedRows = sortedRows.slice(0, pageSize)
  const numericColumns = config.columns.map((column, index) => /Số|Hợp lệ|Lỗi|Thứ tự|Đơn hàng/.test(column) ? index + 1 : -1).filter((index) => index >= 0)
  const statusOptions = Array.from(new Set(rows.map((row) => row[row.length - 1]).filter(Boolean)))
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
      <div className="flex h-20 items-center justify-between border-b border-[#eeeae0] px-6"><a className="font-display text-lg font-semibold tracking-[.08em] text-[var(--color-ink)]" href="/#home">LINERY <span className="font-body text-xs font-normal tracking-[.18em] text-[var(--color-olive)]">QUẢN TRỊ</span></a><button className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#dedbd0] lg:hidden" type="button" aria-label="Đóng menu quản trị" onClick={() => setSidebarOpen(false)}><i className="bi bi-x-lg" aria-hidden="true" /></button></div>
      <AdminManagementSidebar pathname={pathname} />
      <div className="border-t border-[#eeeae0] p-4">{item('/#home', 'Về cửa hàng', 'bi-arrow-left')}</div>
    </aside>
    {sidebarOpen && <button className="fixed inset-0 z-30 bg-[rgba(31,42,36,.32)] lg:hidden" type="button" aria-label="Đóng menu quản trị" onClick={() => setSidebarOpen(false)} />}
    <div className="min-w-0 flex-1">
      <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-[#e5e2d7] bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8"><div className="flex items-center gap-3"><button className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#dedbd0] lg:hidden" type="button" aria-label="Mở menu quản trị" onClick={() => setSidebarOpen(true)}><i className="bi bi-list" aria-hidden="true" /></button><h1 className="font-body text-xl font-semibold tracking-tight sm:text-2xl">{config.title}</h1></div><button className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-olive)] font-display text-sm text-white" type="button" aria-label="Hồ sơ quản trị">K</button></header>
      <main className="mx-auto w-full max-w-[1440px] p-4 sm:p-6 lg:p-8">
        <div className="admin-page-toolbar mb-4 flex min-h-10 flex-wrap items-center justify-between gap-3"><div className="admin-breadcrumb flex min-w-0 items-center gap-2 font-body text-sm text-[#8b8d86]"><a className="shrink-0 hover:text-[var(--color-olive-dark)]" href="/admin">Quản trị</a><i className="bi bi-chevron-right shrink-0 text-xs" aria-hidden="true" /><span className="shrink-0">{config.section}</span><i className="bi bi-chevron-right shrink-0 text-xs" aria-hidden="true" /><span className="min-w-0 truncate font-medium text-[var(--color-ink)]">{config.title}</span></div>{canCreate && <button className="admin-primary-action inline-flex min-h-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-olive)] px-4 font-body text-sm font-medium text-white hover:bg-[var(--color-olive-dark)]" type="button" onClick={() => { setEditingIndex(null); setDraft(config.columns.map(() => '')); setFormOpen(true) }}><i className="bi bi-plus-lg mr-2" aria-hidden="true" />{config.addLabel}</button>}</div>
        {formOpen && <form className="mb-4 rounded-xl border border-[#e6e2d7] bg-white p-4" onSubmit={saveRow}><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{config.columns.map((column, index) => <label className="block" key={column}><span className="mb-1.5 block font-body text-sm font-medium">{column}{index === 0 && <span className="ml-1 text-[var(--color-olive-dark)]">*</span>}</span>{index === config.columns.length - 1 ? <select className="min-h-10 w-full rounded-lg border border-[#dedbd0] bg-[#fcfbf7] px-3 font-body text-sm" value={draft[index]} onChange={(event) => setDraft((current) => current.map((value, valueIndex) => valueIndex === index ? event.target.value : value))}><option value="">Chọn trạng thái</option><option>Đang hoạt động</option><option>Bản nháp</option><option>Đã cấu hình</option><option>Tạm ẩn</option><option>Đang tắt</option></select> : <input className="min-h-10 w-full rounded-lg border border-[#dedbd0] bg-[#fcfbf7] px-3 font-body text-sm" value={draft[index]} onChange={(event) => setDraft((current) => current.map((value, valueIndex) => valueIndex === index ? event.target.value : value))} placeholder={`Nhập ${column.toLowerCase()}`} />}</label>)}</div><div className="mt-4 flex justify-end gap-2"><button className="inline-flex min-h-9 rounded-lg border border-[#dedbd0] px-4 font-body text-sm" type="button" onClick={resetForm}>Hủy</button><button className="admin-primary-action inline-flex min-h-9 rounded-lg bg-[var(--color-olive)] px-4 font-body text-sm font-medium text-white" type="submit">{editingIndex === null ? 'Thêm mới' : 'Lưu thay đổi'}</button></div></form>}
        <section className="overflow-hidden rounded-xl border border-[#e6e2d7] bg-white">
          <div className="flex flex-col gap-3 border-b border-[#eeeae0] p-3 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-2"><button className={`rounded-lg px-3 py-2 font-body text-sm ${statusFilter === 'all' ? 'bg-[#f5f3ec] font-medium text-[var(--color-ink)]' : 'text-[#74776f]'}`} type="button" onClick={() => setStatusFilter('all')}>Tất cả</button><button className={`rounded-lg px-3 py-2 font-body text-sm ${statusFilter === 'Đang hoạt động' ? 'bg-[#f5f3ec] font-medium text-[var(--color-ink)]' : 'text-[#74776f]'}`} type="button" onClick={() => setStatusFilter('Đang hoạt động')}>Đang hoạt động</button></div><div className="flex flex-wrap items-center gap-2"><label className="relative min-w-0 sm:w-64"><span className="sr-only">Tìm kiếm</span><i className="bi bi-search pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8b8d86]" aria-hidden="true" /><input className="min-h-9 w-full rounded-lg border border-[#dedbd0] bg-[#fcfbf7] pl-9 pr-3 font-body text-sm" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm kiếm" /></label><select className="min-h-9 rounded-lg border border-[#dedbd0] bg-white px-3 font-body text-sm" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Lọc theo trạng thái"><option value="all">Lọc trạng thái</option>{statusOptions.map((status) => <option key={status}>{status}</option>)}</select><select className="min-h-9 rounded-lg border border-[#dedbd0] bg-white px-3 font-body text-sm" value={sort.index} onChange={(event) => setSort({ index: Number(event.target.value), ascending: true })} aria-label="Sắp xếp theo"><option value={sort.index}>Sắp xếp</option>{config.columns.map((column, index) => <option value={index} key={column}>{column}</option>)}</select></div></div>
          {sortedRows.length ? <><div className="overflow-x-auto"><table className="min-w-[900px] w-full text-left"><thead className="bg-[#fcfbf7]"><tr><th className="w-16 px-4 py-3 font-body text-sm font-semibold">STT</th>{config.columns.map((column, index) => <th className="px-4 py-3 font-body text-sm font-semibold" key={column}><button className="inline-flex items-center gap-1.5" type="button" onClick={() => setSort((current) => ({ index, ascending: current.index === index ? !current.ascending : true }))}>{column}<span className="text-xs text-[#98968c]">{sort.index === index ? (sort.ascending ? '↑' : '↓') : '↕'}</span></button></th>)}<th className="w-32 px-4 py-3 text-right font-body text-sm font-semibold">Thao tác</th></tr></thead><tbody>{pagedRows.map(({ row, index }, rowIndex) => <tr className="border-t border-[#eeeae0]" key={`${index}-${row.join('-')}`}><td className="px-4 py-3 font-body text-sm text-[#74776f]">{rowIndex + 1}</td>{row.map((value, cellIndex) => <td className="px-4 py-3 font-body text-sm" key={`${cellIndex}-${value}`}>{cellIndex === row.length - 1 ? <span className="inline-flex rounded-full bg-[#edf7ef] px-2.5 py-1 text-xs font-semibold text-[#39733e]">{value}</span> : value}</td>)}<td className="px-4 py-3 text-right"><div className="flex justify-end gap-1"><button className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#74776f] hover:bg-[#f5f3ec]" type="button" aria-label={`Sửa ${row[0]}`} onClick={() => openEdit(index)}><i className="bi bi-pencil" aria-hidden="true" /></button><button className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#8b8d86] hover:bg-[#f1e8e5] hover:text-[#a33d32]" type="button" aria-label={`Xóa ${row[0]}`} onClick={() => removeRow(index)}><i className="bi bi-trash3" aria-hidden="true" /></button></div></td></tr>)}</tbody><tfoot><AdminSummaryRow rows={rows} numericColumns={numericColumns} columnCount={config.columns.length + 2} /></tfoot></table></div><AdminTableFooter total={sortedRows.length} pageSize={pageSize} onPageSizeChange={setPageSize} /></> : <div className="px-5 py-14 text-center"><i className="bi bi-inbox text-3xl text-[var(--color-olive)]" aria-hidden="true" /><h2 className="mt-3 font-display text-lg font-semibold">{config.empty}</h2><p className="mt-2 font-body text-sm text-[#74776f]">Dữ liệu sẽ xuất hiện tại đây sau khi kết nối backend.</p></div>}
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
  const [books, setBooks] = useState<AdminBook[]>([])
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
      <div className="flex h-20 items-center justify-between border-b border-[#eeeae0] px-6"><a className="font-display text-lg font-semibold tracking-[.08em] text-[var(--color-ink)]" href="/#home">LINERY <span className="font-body text-xs font-normal tracking-[.18em] text-[var(--color-olive)]">QUẢN TRỊ</span></a><button className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#dedbd0] text-[var(--color-ink)] lg:hidden" type="button" aria-label="Đóng menu quản trị" onClick={() => setSidebarOpen(false)}><i className="bi bi-x-lg" aria-hidden="true" /></button></div>
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
  formats: ['Paperback', 'Hardcover', 'Digital', 'Audiobook'],
  lines: ['Picador', 'Penguin UK', 'Penguin US', 'NYRB'],
  categories: ['Fiction', 'Novels', 'Short stories', 'Poetry & Drama', 'Non-fiction', 'Essays', 'Research & Studies', 'Memoir & Biography'],
  topics: ['Literary fiction', 'Politics', 'Philosophy', 'History', 'Art & Design', 'Culture', 'Biography'],
}

function AdminSelect2({ label, value, options, onChange, placeholder, multiple = false }: { label: string; value: string | string[]; options: string[]; onChange: (value: string | string[]) => void; placeholder: string; multiple?: boolean }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const selected = multiple ? (value as string[]) : (value as string ? [value as string] : [])
  const filtered = options.filter((option) => option.toLowerCase().includes(query.trim().toLowerCase()))
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
  return <div className="relative">
    <label className="block"><span className="mb-1.5 block font-body text-sm font-medium">{label}</span><input className="min-h-11 w-full rounded-xl border border-[#dedbd0] bg-[#fcfbf7] px-3.5 font-body text-sm outline-none transition focus:border-[var(--color-olive)] focus:ring-2 focus:ring-[rgba(155,148,47,.14)]" value={query} onFocus={() => setOpen(true)} onChange={(event) => { setQuery(event.target.value); setOpen(true) }} placeholder={selected.length ? selected.join(', ') : placeholder} aria-expanded={open} aria-autocomplete="list" /></label>
    {selected.length > 0 && <div className="mt-2 flex flex-wrap gap-2">{selected.map((item) => <span className="inline-flex items-center gap-1.5 rounded-full bg-[rgba(155,148,47,.12)] px-2.5 py-1 font-body text-xs text-[var(--color-olive-dark)]" key={item}>{item}<button type="button" aria-label={`Bỏ ${item}`} onClick={() => choose(item)}><i className="bi bi-x" aria-hidden="true" /></button></span>)}</div>}
    {open && <><button className="fixed inset-0 z-20 cursor-default" type="button" aria-label="Đóng lựa chọn" onClick={() => setOpen(false)} /><div className="absolute z-30 mt-2 max-h-56 w-full overflow-auto rounded-xl border border-[#dedbd0] bg-white p-1.5 shadow-lg">{filtered.length ? filtered.map((option) => <button className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left font-body text-sm hover:bg-[#f5f3ec] ${selected.includes(option) ? 'bg-[rgba(155,148,47,.1)] font-semibold text-[var(--color-olive-dark)]' : ''}`} type="button" key={option} onClick={() => choose(option)}>{option}{selected.includes(option) && <i className="bi bi-check2" aria-hidden="true" />}</button>) : <p className="px-3 py-2 font-body text-sm text-[#8b8d86]">Không tìm thấy dữ liệu đã tạo.</p>}</div></>}
  </div>
}

function AdminBookReportPage({ bookId }: { bookId: string }) {
  const book = readAdminCatalogBooks().find((item) => item.id === bookId)
  if (!book) return <AdminSimpleCreateShell title="Không tìm thấy sách" backHref="/admin/authors" section="SÁCH" description="Bản ghi sách không tồn tại hoặc đã bị xóa."><div className="rounded-2xl border border-dashed border-[#d9d6c8] bg-white p-8 text-center font-body text-sm text-[#74776f]"><a className="font-semibold text-[var(--color-olive-dark)]" href="/admin/books">Quay lại danh sách sách</a></div></AdminSimpleCreateShell>
  const fields: Array<[string, string]> = [['ISBN', book.isbn], ['Tác giả', book.author], ['Series', book.series], ['Số lượng', `${book.quantity} quyển`], ['Đơn giá nhập', book.unitPrice === null ? '—' : `${book.unitPrice.toLocaleString('vi-VN')} VNĐ`], ['Giá bán', `${book.salePrice.toLocaleString('vi-VN')} VNĐ`], ['Thể thức', book.format], ['Dòng sách', book.line], ['Thể loại', book.category], ['Trạng thái bản ghi', book.status]]
  return <AdminSimpleCreateShell title="Báo cáo chi tiết sách" backHref="/admin/authors" section="SÁCH" description="Thông tin chi tiết của bản ghi được liên kết từ hồ sơ tác giả."><div className="grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)]"><aside className="rounded-2xl border border-[#e6e2d7] bg-white p-4"><img className="aspect-[2/3] w-full rounded-xl object-cover" src={book.cover} alt={book.title} /><a className="mt-4 inline-flex min-h-10 w-full items-center justify-center rounded-xl border border-[#dedbd0] font-body text-sm font-medium" href={`/admin/authors`}>Về hồ sơ tác giả</a></aside><article className="rounded-2xl border border-[#e6e2d7] bg-white p-5 sm:p-6"><div className="border-b border-[#eeeae0] pb-5"><p className="font-body text-sm text-[#8b8d86]">Báo cáo sách</p><h2 className="mt-1 font-display text-2xl font-bold sm:text-3xl">{book.title}</h2></div><dl className="mt-5 grid gap-4 sm:grid-cols-2">{fields.map(([label, value]) => <div className="rounded-xl bg-[#fcfbf7] p-3" key={label}><dt className="font-body text-xs text-[#8b8d86]">{label}</dt><dd className="mt-1 font-body text-sm font-semibold">{value || '—'}</dd></div>)}</dl>{book.description && <div className="mt-5 border-t border-[#eeeae0] pt-5"><h3 className="font-display text-lg font-semibold">Mô tả sách</h3><p className="mt-2 whitespace-pre-wrap font-body text-sm leading-6 text-[#62655f]">{book.description}</p></div>}</article></div></AdminSimpleCreateShell>
}

function AdminBookCreatePageV2() {
  const [values, setValues] = useState({ isbn: '', title: '', author: '', series: '', coverPriceUsd: '', quantity: '', unitPrice: '', salePrice: '', exchangeRate: '', format: '', line: '', genre: '', topic: '', link: '', goodreads: '', description: '' })
  const [coverPreview, setCoverPreview] = useState('')
  const [coverFileName, setCoverFileName] = useState('')
  const [coverDataUrl, setCoverDataUrl] = useState('')
  const setValue = (key: keyof typeof values, value: string) => setValues((current) => ({ ...current, [key]: value }))
  const textFields: Array<[keyof typeof values, string, string]> = [['isbn', 'ISBN', 'text'], ['title', 'Tên tác phẩm', 'text'], ['series', 'Series', 'text'], ['coverPriceUsd', 'Giá bìa (USD)', 'number'], ['quantity', 'Số lượng (quyển)', 'number'], ['unitPrice', 'Đơn giá nhập (VNĐ)', 'number'], ['salePrice', 'Giá bán (VNĐ)', 'number'], ['exchangeRate', 'Tỷ giá', 'number'], ['link', 'Link nguồn', 'url'], ['goodreads', 'Đánh giá Goodreads', 'text']]
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null
    const book: AdminCatalogBook = { id: `book-${Date.now()}`, isbn: values.isbn.trim(), title: values.title.trim() || 'Sách chưa đặt tên', author: values.author.trim(), cover: coverDataUrl || '/assets/cover-edward.png', quantity: Number(values.quantity) || 0, unitPrice: values.unitPrice ? Number(values.unitPrice) : null, salePrice: Number(values.salePrice) || 0, series: values.series.trim(), format: values.format.trim(), line: values.line.trim(), category: values.genre.trim(), link: values.link.trim(), goodreads: values.goodreads.trim(), description: values.description.trim(), status: submitter?.value === 'draft' ? 'Bản nháp' : 'Đang hoạt động' }
    writeAdminCatalogBooks([...readAdminCatalogBooks(), book])
    window.location.assign(`/admin/books/report/${book.id}`)
  }
  return <AdminSimpleCreateShell title="Thêm sách" backHref="/admin/books" section="SÁCH" description="Tạo sách từ các trường đã chuẩn hóa theo bốn sheet Picador, Penguin UK, Penguin US và NYRB." tabs={[{ id: 'book-information', label: 'Thông tin sách' }, { id: 'book-cover', label: 'Ảnh bìa' }, { id: 'book-description', label: 'Mô tả' }]} headerActions={<AdminCreateHeaderActions formId="admin-book-create-form" cancelHref="/admin/books" saveLabel="Lưu sách" />}>
    <form id="admin-book-create-form" className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]" onSubmit={submit}>
      <div className="min-w-0 space-y-5">
        <AdminCreatePanel id="book-information" title="Thông tin sách">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{textFields.map(([key, label, type]) => <label className="block" key={key}><span className="mb-1.5 block font-body text-sm font-medium">{label}{['title', 'isbn'].includes(key) && <span className="ml-1 text-[var(--color-olive-dark)]">*</span>}</span><input className="min-h-11 w-full rounded-lg border border-[#dedbd0] bg-[#fcfbf7] px-3.5 font-body text-sm" type={type} required={['title', 'isbn'].includes(key)} value={values[key]} onChange={(event) => setValue(key, event.target.value)} /></label>)}</div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3"><AdminSelect2 label="Tác giả" value={values.author} options={adminSelectOptions.authors} onChange={(value) => setValue('author', value as string)} placeholder="Tìm và chọn tác giả đã tạo" /><AdminSelect2 label="Thể thức" value={values.format} options={adminSelectOptions.formats} onChange={(value) => setValue('format', value as string)} placeholder="Tìm và chọn thể thức" /><AdminSelect2 label="Dòng sách" value={values.line} options={adminSelectOptions.lines} onChange={(value) => setValue('line', value as string)} placeholder="Tìm và chọn dòng sách" /><AdminSelect2 label="Thể loại" value={values.genre} options={adminSelectOptions.categories} onChange={(value) => setValue('genre', value as string)} placeholder="Tìm và chọn thể loại" /><AdminSelect2 label="Chủ đề" value={values.topic} options={adminSelectOptions.topics} onChange={(value) => setValue('topic', value as string)} placeholder="Tìm và chọn chủ đề" /></div>
        </AdminCreatePanel>
        <div id="book-description" className="scroll-mt-24"><AdminCreatePanel title="Mô tả sách"><AdminRichTextEditor label="Nội dung mô tả" value={values.description} onChange={(value) => setValue('description', value)} placeholder="Nhập mô tả, nội dung giới thiệu và ghi chú biên tập cho sách..." /></AdminCreatePanel></div>
      </div>
      <aside className="admin-create-aside min-w-0 space-y-5">
        <div id="book-cover" className="scroll-mt-24"><AdminCreatePanel title="Ảnh bìa"><AdminImageUpload label="Ảnh bìa" showLabel={false} preview={coverPreview} fileName={coverFileName} onFileChange={(file) => { setCoverFileName(file.name); setCoverPreview(URL.createObjectURL(file)); const reader = new FileReader(); reader.onload = () => setCoverDataUrl(typeof reader.result === 'string' ? reader.result : ''); reader.readAsDataURL(file) }} onClear={() => { setCoverFileName(''); setCoverPreview(''); setCoverDataUrl('') }} /></AdminCreatePanel></div>
        <AdminCreatePanel title="Trạng thái bản ghi"><select className="min-h-11 w-full rounded-lg border border-[#dedbd0] bg-[#fcfbf7] px-3.5 font-body text-sm" aria-label="Trạng thái bản ghi"><option>Bản nháp</option><option>Đang hoạt động</option><option>Tạm ẩn</option></select></AdminCreatePanel>
      </aside>
    </form>
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
  return <AdminSimpleCreateShell title="Thêm danh mục" backHref="/admin/books/categories" section="DANH MỤC" description="Tạo danh mục trong database để các màn tạo sách có thể tìm và chọn lại."><form className="grid gap-4 sm:grid-cols-2" onSubmit={(event) => event.preventDefault()}><label className="block"><span className="mb-1.5 block font-body text-sm font-medium">Tên danh mục<span className="ml-1 text-[var(--color-olive-dark)]">*</span></span><input className="min-h-11 w-full rounded-xl border border-[#dedbd0] bg-[#fcfbf7] px-3.5 font-body text-sm" required /></label><AdminSelect2 label="Danh mục cha" value={parent} options={['Fiction', 'Non-fiction']} onChange={(value) => setParent(value as string)} placeholder="Tìm và chọn danh mục cha" /><label className="block"><span className="mb-1.5 block font-body text-sm font-medium">Thứ tự</span><input className="min-h-11 w-full rounded-xl border border-[#dedbd0] bg-[#fcfbf7] px-3.5 font-body text-sm" type="number" min="1" defaultValue="1" /></label><label className="block"><span className="mb-1.5 block font-body text-sm font-medium">Slug</span><input className="min-h-11 w-full rounded-xl border border-[#dedbd0] bg-[#fcfbf7] px-3.5 font-body text-sm" /></label><label className="block sm:col-span-2"><span className="mb-1.5 block font-body text-sm font-medium">Mô tả</span><textarea className="min-h-28 w-full rounded-xl border border-[#dedbd0] bg-[#fcfbf7] p-3.5 font-body text-sm" /></label><AdminFormActions cancelHref="/admin/books/categories" saveLabel="Lưu danh mục" /></form></AdminSimpleCreateShell>
}

function AdminListShell({ title, section, description: _description, createHref, createLabel, children }: { title: string; section: string; description: string; createHref: string; createLabel: string; children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  return <div className="admin-shell flex min-h-screen bg-[#f7f7f2] text-[var(--color-ink)]"><aside className={`admin-sidebar fixed inset-y-0 left-0 z-40 flex w-72 -translate-x-full flex-col border-r border-[#e5e2d7] bg-white transition-transform duration-300 lg:static lg:translate-x-0 ${sidebarOpen ? 'is-open translate-x-0' : ''}`}><div className="flex h-16 items-center justify-between border-b border-[#eeeae0] px-5"><a className="font-display text-lg font-semibold tracking-[.08em]" href="/#home">LINERY <span className="font-body text-xs font-normal tracking-[.18em] text-[var(--color-olive)]">QUẢN TRỊ</span></a><button className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#dedbd0] lg:hidden" type="button" aria-label="Đóng menu quản trị" onClick={() => setSidebarOpen(false)}><i className="bi bi-x-lg" aria-hidden="true" /></button></div><AdminManagementSidebar pathname={window.location.pathname} /></aside>{sidebarOpen && <button className="fixed inset-0 z-30 bg-[rgba(31,42,36,.32)] lg:hidden" type="button" aria-label="Đóng menu quản trị" onClick={() => setSidebarOpen(false)} />}<div className="min-w-0 flex-1"><header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[#e5e2d7] bg-white/95 px-4 backdrop-blur sm:px-5 lg:px-6"><div className="flex items-center gap-2"><button className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#dedbd0] text-[var(--color-ink)] lg:hidden" type="button" aria-label="Mở menu quản trị" onClick={() => setSidebarOpen(true)}><i className="bi bi-list" aria-hidden="true" /></button><h1 className="font-body text-lg font-semibold tracking-tight">{title}</h1></div><a className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-olive)] font-body text-sm text-white" href={createHref} aria-label={createLabel}>K</a></header><main className="w-full p-3 sm:p-4 lg:p-5"><div className="admin-page-toolbar mb-4 flex min-h-10 flex-wrap items-center justify-between gap-3"><div className="admin-breadcrumb flex min-w-0 items-center gap-2 font-body text-sm text-[#8b8d86]"><a className="shrink-0 hover:text-[var(--color-olive-dark)]" href="/admin">Quản trị</a><i className="bi bi-chevron-right shrink-0 text-xs" aria-hidden="true" /><span className="shrink-0">{section}</span><i className="bi bi-chevron-right shrink-0 text-xs" aria-hidden="true" /><span className="min-w-0 truncate font-medium text-[var(--color-ink)]">{title}</span></div><a className="admin-primary-action inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-[var(--color-olive)] px-4 font-body text-sm font-medium text-white" href={createHref}><i className="bi bi-plus-lg" aria-hidden="true" />{createLabel}</a></div>{children}</main></div></div>
}

function AdminAuthorsPageV3() {
  const [query, setQuery] = useState('')
  const creators = adminAuthorRecords.filter((creator) => creator.name.toLowerCase().includes(query.toLowerCase()))
  return <AdminListShell title="Nhà sáng tạo nội dung" section="NỘI DUNG" description="Quản lý tác giả, dịch giả và họa sĩ minh họa trong cùng một danh mục hồ sơ." createHref="/admin/authors/new" createLabel="Thêm nhà sáng tạo"><section className="overflow-hidden rounded-2xl border border-[#e6e2d7] bg-white"><div className="flex flex-col justify-between gap-3 border-b border-[#eeeae0] p-5 sm:flex-row sm:items-center"><div><h3 className="font-display text-lg font-semibold">Danh sách nhà sáng tạo nội dung</h3><p className="mt-1 font-body text-sm text-[#74776f]">{creators.length} hồ sơ</p></div><input className="min-h-10 rounded-xl border border-[#dedbd0] bg-[#fcfbf7] px-3.5 font-body text-sm sm:w-80" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm tên nhà sáng tạo" /></div><div className="overflow-x-auto"><table className="min-w-[900px] w-full text-left"><thead className="bg-[#fcfbf7]"><tr>{['Tên hiển thị', 'Phân loại', 'Slug', 'Số sách', 'Trạng thái', 'Thao tác'].map((heading) => <th className="px-4 py-3 font-body text-sm font-semibold" key={heading}>{heading}</th>)}</tr></thead><tbody>{creators.map((creator) => <tr className="border-t border-[#eeeae0]" key={creator.id}><td className="px-4 py-3 font-body text-sm font-medium">{creator.name}</td><td className="px-4 py-3 font-body text-sm">{creator.role}</td><td className="px-4 py-3 font-body text-sm text-[#74776f]">{creator.slug}</td><td className="px-4 py-3 font-body text-sm">{creator.books}</td><td className="px-4 py-3 font-body text-sm">{creator.status}</td><td className="px-4 py-3 text-right"><a className="font-body text-sm text-[var(--color-olive-dark)]" href={`/admin/authors/${creator.id}`}>Xem / sửa</a></td></tr>)}</tbody></table></div></section></AdminListShell>
}

function AdminAuthorsPageV2() {
  const [query, setQuery] = useState('')
  const authors = adminAuthorRecords.filter((author) => author.name.toLowerCase().includes(query.toLowerCase()))
  return <AdminListShell title="Quản lý tác giả" section="NỘI DUNG" description="Danh sách tác giả là màn riêng. Bấm Thêm tác giả để mở đúng màn tạo mới." createHref="/admin/authors/new" createLabel="Thêm tác giả"><section className="overflow-hidden rounded-2xl border border-[#e6e2d7] bg-white"><div className="flex flex-col justify-between gap-3 border-b border-[#eeeae0] p-5 sm:flex-row sm:items-center"><div><h3 className="font-display text-lg font-semibold">Danh sách tác giả</h3><p className="mt-1 font-body text-sm text-[#74776f]">{authors.length} tác giả</p></div><input className="min-h-10 rounded-xl border border-[#dedbd0] bg-[#fcfbf7] px-3.5 font-body text-sm sm:w-80" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm tên tác giả" /></div><div className="overflow-x-auto"><table className="min-w-[760px] w-full text-left"><thead className="bg-[#fcfbf7]"><tr>{['Tên tác giả', 'Slug', 'Số sách', 'Trạng thái', 'Thao tác'].map((heading) => <th className="px-4 py-3 font-body text-sm font-semibold" key={heading}>{heading}</th>)}</tr></thead><tbody>{authors.map((author) => <tr className="border-t border-[#eeeae0]" key={author.id}><td className="px-4 py-3 font-body text-sm font-medium">{author.name}</td><td className="px-4 py-3 font-body text-sm text-[#74776f]">{author.slug}</td><td className="px-4 py-3 font-body text-sm">{author.books}</td><td className="px-4 py-3 font-body text-sm">{author.status}</td><td className="px-4 py-3 text-right"><a className="font-body text-sm text-[var(--color-olive-dark)]" href={`/admin/authors/${author.id}`}>Xem / sửa</a></td></tr>)}</tbody></table></div></section></AdminListShell>
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

function AdminBooksPageV2({ managementView }: { managementView: BookManagementView }) {
  if (managementView === 'categories') return <AdminCategoriesPageV4 />
  return <AdminListShell title="Quản lý sách" section="SÁCH" description="Danh sách sách là màn riêng. Bấm Thêm sách để mở màn tạo mới; các trường quan hệ sẽ chọn từ dữ liệu chuẩn đã tạo." createHref="/admin/books/new" createLabel="Thêm sách"><section className="rounded-2xl border border-[#e6e2d7] bg-white p-8 text-center"><i className="bi bi-book text-3xl text-[var(--color-olive)]" aria-hidden="true" /><h3 className="mt-3 font-display text-lg font-semibold">Chưa có sách trong danh sách</h3><p className="mx-auto mt-2 max-w-lg font-body text-sm leading-6 text-[#74776f]">Thêm sách từ màn tạo mới hoặc nhập Excel. Tác giả, thể thức, dòng sách, thể loại và chủ đề sẽ được chọn bằng ô tìm kiếm thay vì nhập URL hay tên tự do.</p><a className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--color-olive)] px-5 font-body text-sm font-medium text-white" href="/admin/books/new">Mở màn tạo sách</a></section></AdminListShell>
}

function AdminNewsPageV2() {
  return <AdminListShell title="Quản lý tin tức" section="NỘI DUNG" description="Danh sách tin tức là màn riêng; nội dung chi tiết được nhập bằng trình soạn thảo ở màn tạo mới." createHref="/admin/news/new" createLabel="Tạo bài viết"><section className="overflow-hidden rounded-2xl border border-[#e6e2d7] bg-white"><div className="border-b border-[#eeeae0] p-5"><h3 className="font-display text-lg font-semibold">Danh sách bài viết</h3><p className="mt-1 font-body text-sm text-[#74776f]">2 bản nháp mẫu</p></div><div className="overflow-x-auto"><table className="min-w-[760px] w-full text-left"><thead className="bg-[#fcfbf7]"><tr>{['Tiêu đề', 'Slug', 'Ngày xuất bản', 'Trạng thái', 'Thao tác'].map((heading) => <th className="px-4 py-3 font-body text-sm font-semibold" key={heading}>{heading}</th>)}</tr></thead><tbody>{[['Toni Morrison: memory and the past', 'toni-morrison-memory-and-the-past', '—', 'Bản nháp'], ['Books about Women', 'books-about-women', '—', 'Bản nháp']].map((row) => <tr className="border-t border-[#eeeae0]" key={row[1]}>{row.map((value) => <td className="px-4 py-3 font-body text-sm" key={value}>{value}</td>)}<td className="px-4 py-3 text-right"><a className="font-body text-sm text-[var(--color-olive-dark)]" href="/admin/news/new">Xem / sửa</a></td></tr>)}</tbody></table></div></section></AdminListShell>
}

function AdminNewsCreatePageV2() {
  const [content, setContent] = useState('')
  const [coverPreview, setCoverPreview] = useState('')
  const [coverFileName, setCoverFileName] = useState('')
  return <AdminSimpleCreateShell title="Tin mới" backHref="/admin/news" section="NỘI DUNG" description="Soạn nội dung tin tức bằng trình soạn thảo rich text, sau đó lưu thành bản nháp hoặc xuất bản khi kết nối backend." tabs={[{ id: 'news-content', label: 'Nội dung' }, { id: 'news-seo', label: 'Tối ưu hóa tìm kiếm Google' }, { id: 'news-history', label: 'Lịch sử thao tác' }]} headerActions={<AdminCreateHeaderActions formId="admin-news-create-form" cancelHref="/admin/news" saveLabel="Xuất bản" />}>
    <form id="admin-news-create-form" className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]" onSubmit={(event) => event.preventDefault()}>
      <div className="min-w-0 space-y-5">
        <AdminCreatePanel id="news-content" title="Nội dung tin bài">
          <div className="space-y-4"><label className="block"><span className="mb-1.5 block font-body text-sm font-medium">Tiêu đề bài viết<span className="ml-1 text-[var(--color-olive-dark)]">*</span></span><input className="min-h-11 w-full rounded-lg border border-[#dedbd0] bg-[#fcfbf7] px-3.5 font-body text-sm" required placeholder="Nhập tiêu đề bài viết" /></label><label className="block"><span className="mb-1.5 block font-body text-sm font-medium">Slug</span><input className="min-h-11 w-full rounded-lg border border-[#dedbd0] bg-[#fcfbf7] px-3.5 font-body text-sm" placeholder="tu-dong-sinh-tu-tieu-de" /></label><label className="block"><span className="mb-1.5 block font-body text-sm font-medium">Mô tả ngắn</span><textarea className="min-h-24 w-full rounded-lg border border-[#dedbd0] bg-[#fcfbf7] p-3.5 font-body text-sm" placeholder="Mô tả ngắn hiển thị ở thẻ tin và khi chia sẻ..." /></label><AdminRichTextEditor label="Nội dung bài viết" value={content} onChange={setContent} placeholder="Nhập nội dung tin tức..." /></div>
        </AdminCreatePanel>
        <AdminCreatePanel id="news-seo" title="Tối ưu hóa tìm kiếm Google"><div className="grid gap-4 sm:grid-cols-2"><label className="block"><span className="mb-1.5 block font-body text-sm font-medium">SEO Title</span><input className="min-h-11 w-full rounded-lg border border-[#dedbd0] bg-[#fcfbf7] px-3.5 font-body text-sm" placeholder="Tiêu đề hiển thị trên Google" /></label><label className="block"><span className="mb-1.5 block font-body text-sm font-medium">SEO Keywords</span><input className="min-h-11 w-full rounded-lg border border-[#dedbd0] bg-[#fcfbf7] px-3.5 font-body text-sm" placeholder="Từ khóa" /></label><label className="block sm:col-span-2"><span className="mb-1.5 block font-body text-sm font-medium">SEO Description</span><textarea className="min-h-20 w-full rounded-lg border border-[#dedbd0] bg-[#fcfbf7] p-3.5 font-body text-sm" placeholder="Mô tả kết quả tìm kiếm" /></label></div></AdminCreatePanel>
        <AdminCreatePanel id="news-history" title="Lịch sử thao tác"><div className="overflow-x-auto"><table className="min-w-full text-left font-body text-sm"><thead className="bg-[#f7f8fb]"><tr><th className="px-3 py-2 font-semibold">Thời gian</th><th className="px-3 py-2 font-semibold">Hành động</th><th className="px-3 py-2 font-semibold">Người thực hiện</th></tr></thead><tbody><tr className="border-t border-[#e2e5ee]"><td className="px-3 py-3 text-[#74776f]">—</td><td className="px-3 py-3">Chưa có thao tác</td><td className="px-3 py-3 text-[#74776f]">—</td></tr></tbody></table></div></AdminCreatePanel>
      </div>
      <aside className="admin-create-aside min-w-0 space-y-5">
        <AdminCreatePanel title="Ảnh đại diện"><AdminImageUpload label="Ảnh đại diện" showLabel={false} preview={coverPreview} fileName={coverFileName} onFileChange={(file) => { setCoverFileName(file.name); setCoverPreview(URL.createObjectURL(file)) }} onClear={() => { setCoverFileName(''); setCoverPreview('') }} /></AdminCreatePanel>
        <AdminCreatePanel title="Hiển thị"><div className="space-y-2"><label className="flex items-center gap-2 rounded-lg border border-[#e2e5ee] px-3 py-2.5 font-body text-sm"><input className="h-4 w-4 accent-[var(--color-olive)]" type="checkbox" defaultChecked />Hiển thị trên website</label><label className="flex items-center gap-2 rounded-lg border border-[#e2e5ee] px-3 py-2.5 font-body text-sm"><input className="h-4 w-4 accent-[var(--color-olive)]" type="checkbox" defaultChecked />Hiển thị trên trang chủ</label><label className="flex items-center gap-2 rounded-lg border border-[#e2e5ee] px-3 py-2.5 font-body text-sm"><input className="h-4 w-4 accent-[var(--color-olive)]" type="checkbox" />Tin nổi bật</label></div></AdminCreatePanel>
        <AdminCreatePanel title="Chọn danh mục tin"><div className="space-y-2"><label className="flex items-center gap-2 rounded-lg border border-[#e2e5ee] px-3 py-2.5 font-body text-sm"><input className="h-4 w-4 accent-[var(--color-olive)]" type="checkbox" />Book notes</label><label className="flex items-center gap-2 rounded-lg border border-[#e2e5ee] px-3 py-2.5 font-body text-sm"><input className="h-4 w-4 accent-[var(--color-olive)]" type="checkbox" />From the shelf</label><label className="flex items-center gap-2 rounded-lg border border-[#e2e5ee] px-3 py-2.5 font-body text-sm"><input className="h-4 w-4 accent-[var(--color-olive)]" type="checkbox" />Reading list</label></div><button className="mt-3 inline-flex min-h-9 items-center justify-center rounded-lg border border-[var(--color-olive)] px-3 font-body text-sm text-[var(--color-olive-dark)] hover:bg-[rgba(155,148,47,.08)]" type="button"><i className="bi bi-plus-lg mr-1.5" aria-hidden="true" />Thêm danh mục</button></AdminCreatePanel>
        <AdminCreatePanel title="Định dạng"><div className="space-y-2"><label className="flex items-center gap-2 rounded-lg border border-[#e2e5ee] px-3 py-2.5 font-body text-sm"><input className="h-4 w-4 accent-[var(--color-olive)]" type="radio" name="news-format" defaultChecked />Chuẩn</label><label className="flex items-center gap-2 rounded-lg border border-[#e2e5ee] px-3 py-2.5 font-body text-sm"><input className="h-4 w-4 accent-[var(--color-olive)]" type="radio" name="news-format" />Video</label></div></AdminCreatePanel>
      </aside>
    </form>
  </AdminSimpleCreateShell>
}

function AdminReportsPage() {
  const [analyticsUrl, setAnalyticsUrl] = useState('')
  const [saved, setSaved] = useState(false)
  const metrics = [
    ['Lượt truy cập', '12.480', '+18,4%', 'bi-eye'],
    ['Người dùng', '8.216', '+12,1%', 'bi-people'],
    ['Đơn hàng', '186', '+8,7%', 'bi-bag'],
    ['Doanh thu', '84.620.000₫', '+14,2%', 'bi-graph-up-arrow'],
  ]
  const traffic = [
    ['T2', 'h-[52%]'], ['T3', 'h-[68%]'], ['T4', 'h-[61%]'], ['T5', 'h-[79%]'], ['T6', 'h-[72%]'], ['T7', 'h-[91%]'], ['CN', 'h-[84%]'],
  ]
  const sources = [['Tìm kiếm tự nhiên', '46%', 'w-[46%]'], ['Trực tiếp', '28%', 'w-[28%]'], ['Mạng xã hội', '16%', 'w-[16%]'], ['Giới thiệu', '10%', 'w-[10%]']]
  return <div className="admin-shell flex min-h-screen bg-[#f7f7f2] text-[var(--color-ink)]"><aside className="admin-sidebar fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-[#e5e2d7] bg-white lg:static"><div className="flex h-16 items-center border-b border-[#eeeae0] px-5"><a className="font-display text-lg font-semibold tracking-[.08em] text-[var(--color-ink)]" href="/#home">LINERY <span className="font-body text-xs font-normal tracking-[.18em] text-[var(--color-olive)]">QUẢN TRỊ</span></a></div><AdminManagementSidebar pathname="/admin/reports" /></aside><div className="min-w-0 flex-1"><header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[#e5e2d7] bg-white/95 px-4 backdrop-blur sm:px-5 lg:px-6"><h1 className="font-body text-lg font-semibold tracking-tight">Báo cáo & thống kê</h1><button className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-olive)] font-body text-sm text-white" type="button" aria-label="Hồ sơ quản trị">K</button></header><main className="w-full p-3 sm:p-4 lg:p-5"><div className="admin-breadcrumb mb-4 flex items-center gap-2 font-body text-sm text-[#8b8d86]"><a className="hover:text-[var(--color-olive-dark)]" href="/admin">Quản trị</a><i className="bi bi-chevron-right text-xs" aria-hidden="true" /><span className="font-medium text-[var(--color-ink)]">Báo cáo & thống kê</span></div><div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p className="mb-1 font-body text-xs font-semibold uppercase tracking-[.14em] text-[var(--color-olive)]">TỔNG QUAN</p><h2 className="font-body text-2xl font-semibold tracking-tight">Hiệu quả cửa hàng</h2><p className="mt-1 font-body text-sm text-[#74776f]">Theo dõi hoạt động bán hàng, nội dung và hành vi truy cập trên website.</p></div><button className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-[#dedbd0] bg-white px-3.5 font-body text-sm text-[#62655f] hover:border-[var(--color-olive)]" type="button"><i className="bi bi-download" aria-hidden="true" />Xuất báo cáo</button></div><section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{metrics.map(([label, value, change, icon]) => <article className="rounded-xl border border-[#e6e2d7] bg-white p-4" key={label}><div className="flex items-center justify-between"><p className="font-body text-sm text-[#74776f]">{label}</p><span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#f6f5ed] text-[var(--color-olive-dark)]"><i className={`bi ${icon}`} aria-hidden="true" /></span></div><p className="mt-3 font-body text-2xl font-semibold">{value}</p><p className="mt-1 font-body text-xs font-semibold text-[#39733e]">{change} so với kỳ trước</p></article>)}</section><div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,.8fr)]"><section className="rounded-xl border border-[#e6e2d7] bg-white p-4 sm:p-5"><div className="flex items-center justify-between"><div><h3 className="font-body text-base font-semibold">Lượt truy cập</h3><p className="mt-1 font-body text-sm text-[#74776f]">7 ngày gần nhất</p></div><span className="rounded-lg bg-[#f6f5ed] px-2.5 py-1 font-body text-xs text-[#62655f]">Website</span></div><div className="mt-6 flex h-48 items-end gap-2 border-b border-[#eeeae0] pb-0 sm:gap-4">{traffic.map(([day, width]) => <div className="flex h-full flex-1 flex-col justify-end gap-2" key={day}><div className="flex h-full items-end"><div className={`w-full rounded-t-md bg-[var(--color-olive)] ${width}`} title={`${day}: lượt truy cập`} /></div><span className="text-center font-body text-xs text-[#8b8d86]">{day}</span></div>)}</div></section><section className="rounded-xl border border-[#e6e2d7] bg-white p-4 sm:p-5"><h3 className="font-body text-base font-semibold">Nguồn truy cập</h3><p className="mt-1 font-body text-sm text-[#74776f]">Tỷ trọng theo kênh</p><div className="mt-6 space-y-4">{sources.map(([label, value, width]) => <div key={label}><div className="mb-1 flex justify-between gap-3 font-body text-sm"><span>{label}</span><span className="font-semibold">{value}</span></div><div className="h-2 rounded-full bg-[#f0efe8]"><div className={`h-2 rounded-full bg-[var(--color-olive)] ${width}`} /></div></div>)}</div></section></div><section className="mt-4 rounded-xl border border-[#e6e2d7] bg-white p-4 sm:p-5"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start"><div><p className="font-body text-xs font-semibold uppercase tracking-[.14em] text-[var(--color-olive)]">TÍCH HỢP</p><h3 className="mt-1 font-body text-base font-semibold">Google Analytics</h3><p className="mt-1 max-w-2xl font-body text-sm text-[#74776f]">Nhúng báo cáo Analytics/Looker Studio vào khu vực quản trị. URL nhúng sẽ được lưu trong cấu hình hệ thống khi kết nối backend.</p></div><a className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-[#dedbd0] px-3.5 font-body text-sm text-[#62655f] hover:border-[var(--color-olive)]" href="https://analytics.google.com/" target="_blank" rel="noreferrer"><i className="bi bi-box-arrow-up-right" aria-hidden="true" />Mở Google Analytics</a></div><div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end"><label className="block"><span className="mb-1.5 block font-body text-sm font-medium">URL báo cáo nhúng</span><input className="min-h-10 w-full rounded-lg border border-[#dedbd0] bg-[#fcfbf7] px-3 font-body text-sm" value={analyticsUrl} onChange={(event) => { setAnalyticsUrl(event.target.value); setSaved(false) }} placeholder="https://lookerstudio.google.com/embed/reporting/..." /></label><button className="inline-flex min-h-10 items-center justify-center rounded-lg bg-[var(--color-olive)] px-4 font-body text-sm font-medium text-white hover:bg-[var(--color-olive-dark)]" type="button" onClick={() => setSaved(true)}>Lưu cấu hình</button></div>{saved && <p className="mt-2 font-body text-sm font-medium text-[#39733e]" role="status">Đã lưu tạm cấu hình nhúng trên màn hình này.</p>}{analyticsUrl ? <div className="mt-4 aspect-[16/7] overflow-hidden rounded-lg border border-[#e6e2d7] bg-[#fcfbf7]"><iframe className="h-full w-full border-0" title="Báo cáo Google Analytics" src={analyticsUrl} /></div> : <div className="mt-4 flex min-h-32 items-center justify-center rounded-lg border border-dashed border-[#d8d5c8] bg-[#fcfbf7] px-5 text-center"><p className="max-w-xl font-body text-sm text-[#74776f]"><i className="bi bi-bar-chart-line mr-2 text-[var(--color-olive)]" aria-hidden="true" />Chưa có URL báo cáo nhúng. Khi backend kết nối Google Analytics, khu vực này sẽ hiển thị báo cáo truy cập thật.</p></div>}</section></main></div></div>
}

function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  useEffect(() => {
    document.body.dataset.adminModule = window.location.pathname
    return () => { delete document.body.dataset.adminModule }
  }, [])
  useEffect(() => {
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
    const toggle = () => {
      const collapsed = shell.classList.toggle('admin-sidebar-collapsed')
      icon.className = `bi ${collapsed ? 'bi-chevron-right' : 'bi-chevron-left'}`
      button.setAttribute('aria-label', collapsed ? 'Mở rộng menu quản trị' : 'Thu gọn menu quản trị')
    }
    button.addEventListener('click', toggle)
    sidebar.append(button)
    return () => { button.removeEventListener('click', toggle); button.remove() }
  }, [])

  if (window.location.pathname === '/admin/books/new') return <AdminBookCreatePageV2 />
  if (window.location.pathname.startsWith('/admin/books/report/')) return <AdminBookReportPage bookId={window.location.pathname.split('/').pop() ?? ''} />
  if (window.location.pathname === '/admin/books/categories/new') return <AdminCategoryCreatePageV3 />
  if (window.location.pathname.startsWith('/admin/books')) return <AdminBooksPageV2 managementView={getAdminBookViewFromPath(window.location.pathname)} />
  if (window.location.pathname === '/admin/authors/new') return <AdminAuthorCreatePage pathname={window.location.pathname} />
  if (window.location.pathname === '/admin/authors') return <AdminAuthorsRestoredPage pathname={window.location.pathname} />
  if (window.location.pathname === '/admin/reports') return <AdminReportsPage />
  if (window.location.pathname === '/admin/news/new') return <AdminNewsCreatePageV2 />
  if (window.location.pathname === '/admin/news') return <AdminNewsPageV2 />
  const moduleConfig = adminModuleConfigs[window.location.pathname]
  if (moduleConfig) return <AdminModulePageV3 pathname={window.location.pathname} config={moduleConfig} />

  return <div className="admin-shell flex min-h-screen bg-[#f7f7f2] text-[var(--color-ink)]">
    <aside id="admin-sidebar" className={`admin-sidebar fixed inset-y-0 left-0 z-40 flex w-72 -translate-x-full flex-col border-r border-[#e5e2d7] bg-white transition-transform duration-300 lg:static lg:translate-x-0 ${sidebarOpen ? 'is-open translate-x-0' : ''}`}>
      <div className="flex h-20 items-center justify-between border-b border-[#eeeae0] px-6">
        <a className="font-display text-lg font-semibold tracking-[.08em] text-[var(--color-ink)]" href="/#home">LINERY <span className="font-body text-[10px] font-normal tracking-[.18em] text-[var(--color-olive)]">QUẢN TRỊ</span></a>
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
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Store metrics">
          {[['Tổng số sách','0','Thêm dữ liệu sách','bi-book'],['Đơn hàng','0','Chưa có đơn hàng','bi-bag'],['Tác giả','0','Thêm hồ sơ tác giả','bi-people'],['Bài viết tin tức','0','Tạo nội dung biên tập','bi-newspaper']].map(([label,value,meta,icon]) => <article className="rounded-2xl border border-[#e6e2d7] bg-white p-5" key={label}><div className="flex items-start justify-between"><div><p className={`font-body text-sm ${label === 'Đơn hàng' ? 'font-semibold text-[var(--color-ink)]' : 'text-[#74776f]'}`}>{label}</p><p className="mt-3 font-display text-2xl font-semibold tracking-tight">{value}</p></div><span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[rgba(155,148,47,.12)] text-lg text-[var(--color-olive)]"><i className={`bi ${icon}`} aria-hidden="true" /></span></div><p className="admin-metric-meta mt-4 font-body text-sm text-[#74776f]">{meta}</p></article>)}
        </section>
        <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(300px,.85fr)]">
          <article className="rounded-2xl border border-[#e6e2d7] bg-white p-5 sm:p-6"><div className="flex items-center justify-between gap-4"><div><h2 className="font-display text-lg font-semibold">Đơn hàng gần đây</h2><p className="mt-1 font-body text-sm text-[#8b8d86]">Đơn hàng sẽ xuất hiện tại đây sau khi kết nối Supabase.</p></div><button className="font-body text-sm text-[var(--color-olive)]" type="button">Xem tất cả</button></div><div className="mt-6 rounded-xl border border-dashed border-[#d9d6c9] bg-[#fcfbf7] px-5 py-10 text-center"><i className="bi bi-inbox text-3xl text-[var(--color-olive)]" aria-hidden="true" /><h3 className="mt-3 font-display text-lg font-semibold">Chưa có đơn hàng</h3><p className="mx-auto mt-2 max-w-sm font-body text-sm leading-6 text-[#85877f]">Khi khách đặt hàng, thông tin thanh toán, giao nhận và khách hàng sẽ được hiển thị tại đây.</p></div></article>
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
  const previewCloseTimer = useRef<number | null>(null)
  const cartPulseTimer = useRef<number | null>(null)

  if (view === 'admin') return <><SeoHead view={view} product={selectedProduct} news={selectedNews} author={selectedAuthor || 'Edward W. Said'} language={language} /><AdminDashboard /></>

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
    flyer.style.left = `${sourceRect.left + (sourceRect.width - 64) / 2}px`
    flyer.style.top = `${sourceRect.top + (sourceRect.height - 96) / 2}px`
    document.body.appendChild(flyer)
    const deltaX = targetRect.left + targetRect.width / 2 - (sourceRect.left + sourceRect.width / 2)
    const deltaY = targetRect.top + targetRect.height / 2 - (sourceRect.top + sourceRect.height / 2)
    const animation = flyer.animate([
      { transform: 'translate(0, 0) scale(1)', opacity: 1 },
      { transform: `translate(${deltaX}px, ${deltaY}px) scale(.18)`, opacity: .25 },
    ], { duration: 720, easing: 'cubic-bezier(.22,.61,.36,1)', fill: 'forwards' })
    animation.finished.then(() => flyer.remove()).catch(() => flyer.remove())
    setCartPulse(true)
    if (cartPulseTimer.current !== null) window.clearTimeout(cartPulseTimer.current)
    cartPulseTimer.current = window.setTimeout(() => setCartPulse(false), 560)
  }

  const addToCart = (product: Product, source?: HTMLElement) => {
    if (product.available === false) return
    setCartItems((items) => {
      const existing = items.find((item) => item.product.title === product.title)
      return existing ? items.map((item) => item.product.title === product.title ? { ...item, quantity: item.quantity + 1 } : item) : [...items, { product, quantity: 1 }]
    })
    animateProductToCart(product, source)
  }
  const toggleWishlist = (product: Product) => {
    setWishlistTitles((titles) => {
      const nextTitles = titles.includes(product.title) ? titles.filter((title) => title !== product.title) : [...titles, product.title]
      window.localStorage.setItem('linery-wishlist', JSON.stringify(nextTitles))
      return nextTitles
    })
  }
  const isWishlisted = (product: Product) => wishlistTitles.includes(product.title)
  const removeFromCart = (title: string) => setCartItems((items) => items.filter((item) => item.product.title !== title))
  const changeCartQuantity = (title: string, delta: number) => setCartItems((items) => items.map((item) => item.product.title === title ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item))
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

  return <>
    <SeoHead view={view} product={selectedProduct} news={selectedNews} author={selectedAuthor || 'Edward W. Said'} language={language} />
    {isEnhancedVariant && welcomeOpen && <WelcomeScreen onSelectLanguage={selectLanguage} />}
    <div id="top" className={`page-shell ${quickViewAvailable && quickViewOpen ? 'utility-panel-active' : ''}`}>
    <Header cartCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)} cartPulse={cartPulse} menuOpen={menuOpen} onMenu={() => setMenuOpen(!menuOpen)} onHome={showHome} onLogin={view === 'account' || isAuthenticated ? () => { showAccount(); setAccountMenuOpen((open) => !open) } : showLogin} onLogout={logout} onShop={showShop} onShopHover={(open) => setShopOpen(open)} onAllWriters={() => showAuthors('all')} onAuthors={() => showAuthors('authors')} onTranslators={() => showAuthors('translators')} onAllBooks={showAllBooks} onCollection={showCollection} onSearch={showSearch} onQuickView={toggleQuickView} onCart={showCart} quickViewOpen={quickViewOpen} quickViewAvailable={quickViewAvailable} activeView={view} shopOpen={shopOpen} writersOpen={writersOpen} onWritersHover={(open) => setWritersOpen(open)} accountMenuOpen={accountMenuOpen} onAccountMenuToggle={() => setAccountMenuOpen(false)} accountTab={accountTab} onAccountTabChange={(tab) => { setAccountTab(tab); showAccount() }} accountMenuEnabled={isAuthenticated || view === 'account'} language={language} />
    <button className={`mobile-backdrop ${menuOpen ? 'is-open' : ''}`} aria-label="Close menu" aria-hidden={!menuOpen} onClick={() => setMenuOpen(false)} />
    <MobileMenu isOpen={menuOpen} onShop={showHome} onAllBooks={showAllBooks} onCollection={showCollection} onAllWriters={() => showAuthors('all')} onAuthors={() => showAuthors('authors')} onTranslators={() => showAuthors('translators')} onSearch={showSearch} language={language} onSelectLanguage={selectLanguage} />
     {view === 'account' ? <AccountPage onHome={showHome} onLogout={logout} activeTab={accountTab} onTabChange={(tab) => { setAccountTab(tab); setAccountMenuOpen(false) }} /> : view === 'authors' ? <AuthorsDirectory filter={writerFilter} /> : view === 'all-books' ? <AllBooksPage onHome={showHome} onOpenDetail={showDetail} onAddToCart={addToCart} onPreview={openPreview} onPreviewLeave={schedulePreviewClose} onSelectQuickView={selectQuickView} quickViewOpen={quickViewAvailable} /> : view === 'collection' ? <AllBooksPage collectionTitle={selectedCollection ?? collectionTitles[0]} onHome={showHome} onOpenDetail={showDetail} onAddToCart={addToCart} onPreview={openPreview} onPreviewLeave={schedulePreviewClose} onSelectQuickView={selectQuickView} quickViewOpen={quickViewAvailable} /> : view === 'search' ? <SearchResultsPage query={searchQuery} onOpenDetail={showDetail} onAddToCart={addToCart} onPreview={openPreview} onPreviewLeave={schedulePreviewClose} onSelectQuickView={selectQuickView} quickViewOpen={quickViewAvailable} /> : view === 'author' ? <AuthorProfile author={selectedAuthor || 'Edward W. Said'} onBack={showAuthors} onOpenDetail={showDetail} onAddToCart={addToCart} onPreview={openPreview} onPreviewLeave={schedulePreviewClose} onSelectQuickView={selectQuickView} quickViewOpen={quickViewAvailable} /> : view === 'detail' ? <BookDetail product={selectedProduct ?? products[0]} onBack={showHome} onAuthor={showAuthor} onAddToCart={addToCart} onBuyNow={buyNow} /> : view === 'cart' ? <CartPage onHome={showHome} onCheckout={showCheckout} items={cartItems} onRemove={removeFromCart} onChangeQuantity={changeCartQuantity} /> : view === 'checkout' ? <CheckoutPage items={cartItems} onHome={showHome} onBackToCart={showCart} /> : view === 'news' ? <NewsPage language={language} onOpen={showNewsDetail} /> : view === 'news-detail' ? (selectedNews ? <NewsDetailPage item={selectedNews} language={language} onBack={showNews} /> : <NewsPage language={language} onOpen={showNewsDetail} />) : <main>
     <section className="hero scroll-section" aria-label="Linery bookstore illustration"><HeroBanner /></section>
      <div id="shop" className="collections">{sections.map(section => <Collection key={section.title} {...section} language={language} onCollection={showCollection} onOpenDetail={showDetail} onAddToCart={addToCart} onPreview={openPreview} onPreviewLeave={schedulePreviewClose} onSelectQuickView={selectQuickView} quickViewOpen={quickViewAvailable} />)}</div>
    <LineryNewsSection language={language} onOpen={showNewsDetail} onSeeMore={showNews} />
    </main>}
    <Footer />
    <ChatbotWidget />
    <button className={`scroll-to-top ${showScrollTop ? 'is-visible' : ''}`} type="button" aria-label="Scroll to top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} tabIndex={showScrollTop ? 0 : -1}>
      <i className="bi bi-arrow-up" aria-hidden="true" />
    </button>
    </div>
    {view === 'login' && <LoginPage onHome={showHome} onRegister={showRegister} onForgotPassword={showForgotPassword} onLoginSuccess={completeLogin} />}
    {view === 'register' && <RegisterPage onHome={showHome} onLogin={showLogin} language={language} />}
    {(view === 'forgot-password' || view === 'password-reset-sent' || view === 'reset-password' || view === 'password-reset-complete') && <PasswordRecoveryPage mode={view} onHome={showHome} onLogin={showLogin} onEmailSent={showPasswordResetSent} onResetPassword={showResetPassword} onComplete={showPasswordResetComplete} />}
    {quickViewAvailable && quickViewOpen && <UtilityPanel product={previewProduct} onClose={closePreview} onOpenDetail={showDetail} onAddToCart={addToCart} onBuyNow={buyNow} onToggleWishlist={toggleWishlist} isWishlisted={isWishlisted} />}
  </>
}

