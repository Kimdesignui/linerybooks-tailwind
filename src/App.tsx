import { createContext, useContext, useEffect, useRef, useState, type ElementType, type FormEvent } from 'react'
import { Menu } from 'lucide-react'
import 'bootstrap-icons/font/bootstrap-icons.css'

type Product = { image: string; title: string; author: string; price: string; categories: string[] }
type View = 'home' | 'authors' | 'all-books' | 'news' | 'news-detail' | 'search' | 'author' | 'detail'
type ProductCardActions = { onOpenDetail: (product: Product) => void; onAddToCart: (product: Product) => void; onPreview: (product: Product) => void; onPreviewLeave: () => void; onSelectQuickView: (product: Product) => void; quickViewOpen: boolean }
const isEnhancedVariant = import.meta.env.VITE_LINERY_VARIANT === 'enhanced'
type Language = 'en' | 'vi'
const translations = {
  en: { shop: 'Shop', authors: 'Authors', allBooks: 'View all books', news: 'News & Events', quickView: 'Quick view', search: 'Search books', login: 'Log in', wishlist: 'Wishlist', menu: 'Menu', close: 'Close', readArticle: 'Read article', viewAllNews: 'View all news', home: 'Home', chooseLanguage: 'Choose your language', followUs: 'Follow Us', originalPost: 'View the original post', fromShelf: 'From the shelf', bookNotes: 'Book notes', cart: 'Cart' },
  vi: { shop: 'Cửa hàng', authors: 'Tác giả', allBooks: 'Xem tất cả sách', news: 'Tin tức & Sự kiện', quickView: 'Xem nhanh', search: 'Tìm sách', login: 'Đăng nhập', wishlist: 'Yêu thích', menu: 'Menu', close: 'Đóng', readArticle: 'Đọc bài viết', viewAllNews: 'Xem tất cả tin', home: 'Trang chủ', chooseLanguage: 'Chọn ngôn ngữ', followUs: 'Theo dõi chúng tôi', originalPost: 'Xem bài viết gốc', fromShelf: 'Từ kệ sách', bookNotes: 'Ghi chú sách', cart: 'Giỏ hàng' },
} as const
type TranslationSet = typeof translations.en | typeof translations.vi
const LanguageContext = createContext<{ language: Language; setLanguage: (language: Language) => void; t: TranslationSet }>({ language: 'en', setLanguage: () => undefined, t: translations.en })
const useLanguage = () => useContext(LanguageContext)

function WelcomeScreen({ onSelectLanguage }: { onSelectLanguage: (language: 'en' | 'vi') => void }) {
  const { t } = useLanguage()
  return <section className="welcome-screen" aria-label="Welcome to Linery Bookstore">
    <div className="welcome-backdrop" aria-hidden="true" />
    <div className="welcome-panel">
      <div className="welcome-content">
        <p className="welcome-mark">LINERY</p>
        <h1>LINERY BOOKSTORE</h1>
        <p className="welcome-description">A curated bookstore &amp; independent press, crafted in Hanoi</p>
        <div className="welcome-language" aria-label="Choose language">
          <p>{t.chooseLanguage}</p>
          <div className="welcome-language-options">
            <button type="button" onClick={() => onSelectLanguage('en')}>English</button>
            <button type="button" onClick={() => onSelectLanguage('vi')}>Tiếng Việt</button>
          </div>
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

const authorSlug = (author: string) => author.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-')
const AUTHOR_DEMO_NAME = 'Edward W. Said'
const getImageTone = (imageSrc: string) => new Promise<string>((resolve) => {
  const image = new Image()
  image.onload = () => {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d', { willReadFrequently: true })
    if (!context) { resolve('#7b8d92'); return }
    canvas.width = 24
    canvas.height = 24
    context.drawImage(image, 0, 0, canvas.width, canvas.height)
    const { data } = context.getImageData(0, 0, canvas.width, canvas.height)
    let red = 0
    let green = 0
    let blue = 0
    let count = 0
    for (let index = 0; index < data.length; index += 16) {
      red += data[index]
      green += data[index + 1]
      blue += data[index + 2]
      count += 1
    }
    const tone = (value: number) => Math.round(value / count)
    const r = Math.round(tone(red) * .46 + 28)
    const g = Math.round(tone(green) * .46 + 36)
    const b = Math.round(tone(blue) * .46 + 42)
    resolve(`rgb(${r}, ${g}, ${b})`)
  }
  image.onerror = () => resolve('#7b8d92')
  image.src = imageSrc
})
type NewsItem = { image: string; title: string; titleVi: string; date: string; slug: string; excerpt: string; excerptVi: string; body: string[]; bodyVi: string[] }
const newsItems: NewsItem[] = [
  { image: '/assets/news-instagram-01.jpg', title: 'Women read about women', titleVi: 'Phụ nữ đọc về phụ nữ', date: 'Book notes', slug: 'women-read-about-women', excerpt: 'A reading list about women, independence, identity, and the many ways literature helps us see ourselves.', excerptVi: 'Một danh sách đọc về phụ nữ, sự độc lập, bản sắc và cách văn chương giúp chúng ta nhìn lại chính mình.', body: ['There is something fascinating about reading books written about women: the more we read, the more we begin to notice the beliefs and conventions that have shaped everyday life.', 'These books open new ways of seeing the world. They do not offer one definition of womanhood; they make space for each reader to find her own answers, on her own terms.'], bodyVi: ['Có điều gì đó thật đặc biệt khi đọc những cuốn sách viết về phụ nữ: càng đọc, ta càng nhận ra những niềm tin và quy ước đã định hình đời sống thường ngày.', 'Những cuốn sách này mở ra nhiều cách nhìn mới về thế giới. Chúng không đưa ra một định nghĩa duy nhất về phụ nữ, mà tạo không gian để mỗi độc giả tự tìm câu trả lời cho mình.'] },
  { image: '/assets/news-instagram-02.jpg', title: 'Toni Morrison: memory and the past', titleVi: 'Toni Morrison: ký ức và quá khứ', date: 'Book notes', slug: 'toni-morrison-memory-and-the-past', excerpt: 'Toni Morrison writes about memory as something that stays with the body, the home, and the people we become.', excerptVi: 'Toni Morrison viết về ký ức như một điều ở lại trong cơ thể, mái nhà và con người mà chúng ta trở thành.', body: ['In Morrison’s books, the past is never truly still. It returns through a house, a scar, a touch, a fear, or an apparently ordinary act of love.', 'Her characters are difficult to reduce to a line between right and wrong. They carry loss, violence, survival, and the long work of learning how to belong to themselves.'], bodyVi: ['Trong sách của Morrison, quá khứ chưa bao giờ thực sự đứng yên. Nó trở lại qua một ngôi nhà, vết sẹo, cái chạm, nỗi sợ hoặc một hành động yêu thương tưởng như bình thường.', 'Các nhân vật của bà không dễ bị phân định đơn giản giữa đúng và sai. Họ mang theo mất mát, bạo lực, sự sinh tồn và hành trình dài để học cách thuộc về chính mình.'] },
  { image: '/assets/news-instagram-03.jpg', title: 'The Temple of Golden Pavilion', titleVi: 'Kim Các Tự', date: 'From the shelf', slug: 'the-temple-of-golden-pavilion', excerpt: 'Yukio Mishima’s novel follows a young man whose ideal of beauty becomes impossible to live with.', excerptVi: 'Cuốn tiểu thuyết của Yukio Mishima kể về một chàng trai không thể sống yên với lý tưởng về cái đẹp của mình.', body: ['Mizoguchi grows up loving the Golden Pavilion through his father’s stories before he has ever seen it. When he finally reaches Kyoto, the imagined temple begins to stand between him and ordinary life.', 'Mishima turns a historical event into a study of beauty, obsession, and the distance between an ideal and the world that surrounds it.'], bodyVi: ['Mizoguchi lớn lên với tình yêu dành cho Kim Các Tự qua những câu chuyện của cha trước cả khi được nhìn thấy ngôi chùa. Khi đến Kyoto, ngôi chùa trong tưởng tượng bắt đầu đứng giữa cậu và cuộc sống bình thường.', 'Mishima biến một sự kiện lịch sử thành câu chuyện về cái đẹp, sự ám ảnh và khoảng cách giữa lý tưởng với thế giới xung quanh.'] },
  { image: '/assets/news-instagram-04.jpg', title: 'The Sound of Waves', titleVi: 'Âm thanh của sóng', date: 'From the shelf', slug: 'the-sound-of-waves', excerpt: 'A quiet island love story, told with the tenderness and rhythm of the sea.', excerptVi: 'Một câu chuyện tình lặng lẽ trên đảo, được kể bằng sự dịu dàng và nhịp điệu của biển.', body: ['Set on the secluded island of Utajima, the novel follows Shinji and Hatsue as their love unfolds among fishing boats, sea winds, and the endless rhythm of the waves.', 'Nature is never merely a backdrop. The island’s isolation gives small gestures meaning and reveals a gentler side of Mishima’s writing.'], bodyVi: ['Lấy bối cảnh hòn đảo biệt lập Utajima, tiểu thuyết theo chân Shinji và Hatsue khi tình yêu của họ nảy nở giữa thuyền đánh cá, gió biển và nhịp sóng bất tận.', 'Thiên nhiên không chỉ là phông nền. Sự biệt lập của hòn đảo khiến những cử chỉ nhỏ trở nên có ý nghĩa và cho thấy một mặt dịu dàng hơn trong văn chương Mishima.'] },
]
const localizeNews = (item: NewsItem, language: Language) => language === 'vi' ? { title: item.titleVi, excerpt: item.excerptVi, body: item.bodyVi } : { title: item.title, excerpt: item.excerpt, body: item.body }
const getAuthorFromPath = (pathname: string) => {
  const slug = pathname.startsWith('/authors/') ? pathname.split('/').pop() ?? '' : ''
  return products.find((product) => authorSlug(product.author) === slug)?.author ?? ''
}
const getNewsFromPath = (pathname: string) => newsItems.find((item) => pathname === `/news/${item.slug}`) ?? null

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
  { label: 'Publishers' },
  { label: 'Linery Press', children: [{ label: 'Our Publications' }, { label: 'News & Events' }] },
  { label: 'About us' },
]
const shopOnlyCategories = shopCategories.filter((category) => category.label !== 'Authors')
const desktopShopColumns: MenuColumn[] = [
  { eyebrow: 'Books', links: ['All books'] },
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
  return <div className="menu-columns">{columns.map((column) => <div className="menu-column" key={column.eyebrow}><p className="menu-eyebrow">{column.eyebrow}</p>{column.links.map((link) => <a href="#directory" key={link}>{link}</a>)}</div>)}</div>
}

function ShopMenu({ onAllBooks }: { onAllBooks: () => void }) {
  return <section className="shop-menu" aria-label="Shop categories">
    <div className="shop-menu-inner">
      <div className="shop-menu-columns">
        {desktopShopColumns.map((column) => <div className="shop-menu-column" key={column.eyebrow}>
          <p className="menu-eyebrow">{column.eyebrow}</p>
          {column.links.map((link) => <a href={link === 'All books' ? '/all-books' : `#${link.toLowerCase().replaceAll(' ', '-')}`} key={link} onClick={link === 'All books' ? (event) => { event.preventDefault(); onAllBooks() } : undefined}>{link}</a>)}
          </div>)}
      </div>
    </div>
  </section>
}

function MobileMenu({ isOpen, onShop, onAllBooks, onAuthors, onSearch, onClose }: { isOpen: boolean; onShop: () => void; onAllBooks: () => void; onAuthors: () => void; onSearch: (query: string) => void; onClose: () => void }) {
  const { t, language, setLanguage } = useLanguage()
  const [openBranches, setOpenBranches] = useState<Record<string, boolean>>({ Books: true, Fiction: true, 'Non-fiction': true, 'Linery Press': true })
  const [query, setQuery] = useState('')
  const toggleBranch = (label: string) => setOpenBranches((current) => ({ ...current, [label]: !current[label] }))

  return <aside className={`mobile-menu ${isOpen ? 'is-open' : ''}`} aria-label="Mobile navigation" aria-hidden={!isOpen}>
    <div className="mobile-menu-header">
      <p className="mobile-menu-title">{t.menu}</p>
      <button className="mobile-menu-close" aria-label={t.close} onClick={onClose}>×</button>
    </div>
    <div className="mobile-menu-tools">
      <form className="mobile-menu-search" onSubmit={(event) => { event.preventDefault(); onSearch(query) }}>
        <img src="/assets/icon-search.svg" alt="" aria-hidden="true" />
        <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t.search} aria-label={t.search} />
      </form>
      <div className="mobile-menu-quick-actions" aria-label="Account actions">
        <a className="mobile-menu-icon" href="#login" aria-label={t.login}><i className="bi bi-person" aria-hidden="true" /></a>
        <a className="mobile-menu-icon" href="#wishlist" aria-label={t.wishlist}><i className="bi bi-heart" aria-hidden="true" /></a>
      </div>
    </div>
    <div className="language-toggle mobile-language-toggle" aria-label="Language switcher"><button type="button" className={language === 'en' ? 'is-active' : ''} onClick={() => setLanguage('en')}>EN</button><span>/</span><button type="button" className={language === 'vi' ? 'is-active' : ''} onClick={() => setLanguage('vi')}>VI</button></div>
    <section className="mobile-menu-section" aria-labelledby="mobile-shop-heading">
      <h2 id="mobile-shop-heading" className="mobile-menu-section-title">{t.shop}</h2>
      <button className="mobile-menu-item mobile-menu-level-0" onClick={onAllBooks}><span className="mobile-menu-text">{t.allBooks}</span></button>
      <div className="mobile-menu-tree">
        {shopOnlyCategories.map((category) => {
          const categoryOpen = openBranches[category.label] ?? true
          return <div className="mobile-menu-branch" key={category.label}>
            <button className="mobile-menu-item mobile-menu-level-0" onClick={() => category.children ? toggleBranch(category.label) : onShop()} aria-expanded={category.children ? categoryOpen : undefined}>
              <span className="mobile-menu-text">{category.label}</span>{category.children && <span aria-hidden="true">{categoryOpen ? '−' : '+'}</span>}
            </button>
            {category.children && categoryOpen && <div className="mobile-menu-children">{category.children.map((child) => {
              const childOpen = openBranches[child.label] ?? true
              return <div className="mobile-menu-branch" key={child.label}>
                <button className="mobile-menu-item mobile-menu-level-1" onClick={() => child.children ? toggleBranch(child.label) : onShop()} aria-expanded={child.children ? childOpen : undefined}>
                  <span className="mobile-menu-text">{child.label}</span>{child.children && <span aria-hidden="true">{childOpen ? '−' : '+'}</span>}
                </button>
                {child.children && childOpen && <div className="mobile-menu-children">{child.children.map((leaf) => <button className="mobile-menu-item mobile-menu-level-2" key={leaf.label} onClick={onShop}><span className="mobile-menu-text">{leaf.label}</span></button>)}</div>}
              </div>
            })}</div>}
          </div>
        })}
      </div>
    </section>
    <section className="mobile-menu-section mobile-menu-authors" aria-labelledby="mobile-authors-heading">
      <h2 id="mobile-authors-heading" className="mobile-menu-section-title">{t.authors}</h2>
      <button className="mobile-menu-item mobile-menu-level-0" onClick={onAuthors}><span className="mobile-menu-text">Browse all authors</span><span aria-hidden="true">→</span></button>
    </section>
  </aside>
}

function Breadcrumb({ label, current, onNavigate, className = '' }: { label: string; current: string; onNavigate: () => void; className?: string }) {
  return <nav className={`page-breadcrumb ${className}`.trim()} aria-label="Breadcrumb">
    <button type="button" onClick={onNavigate}>{label}</button>
    <span aria-hidden="true">/</span>
    <span>{current}</span>
  </nav>
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
  const authorBooks = author === AUTHOR_DEMO_NAME ? products : products.filter((product) => product.author === author)
  const profile = author === AUTHOR_DEMO_NAME
    ? { portrait: '/assets/author-edward-said.png', born: '1 Nov 1935', died: '25 Sep 2003', place: 'Jerusalem, Palestine' }
    : { portrait: authorBooks[0]?.image ?? '/assets/cover-edward.png', born: '—', died: '—', place: 'Linery catalogue' }
  const booksTrack = useRef<HTMLDivElement | null>(null)
  const scrollBooks = (direction: 1 | -1) => booksTrack.current?.scrollBy({ left: direction * 220, behavior: 'smooth' })

  useEffect(() => {
    let active = true
    getImageTone(profile.portrait).then((tone) => {
      if (active) document.documentElement.style.setProperty('--author-tone', tone)
    })
    return () => {
      active = false
      document.documentElement.style.removeProperty('--author-tone')
    }
  }, [profile.portrait])

  return <main className={`author-page author-page-${authorSlug(author)}`}>
    <div className="author-page-content">
      <div className="author-profile-backdrop" aria-hidden="true"><img src={profile.portrait} alt="" /></div>
      <Breadcrumb className="author-page-breadcrumb" label="Authors" current={author} onNavigate={onBack} />
      <section className="author-profile-hero" aria-labelledby="author-profile-title">
        <div className="author-profile-copy">
          <p className="author-page-kicker">Author</p>
          <h1 id="author-profile-title">{author}</h1>
          <div className="author-profile-facts" aria-label={`Life dates for ${author}`}>
            <div><span>Born</span><strong>{profile.born}</strong></div>
            <div><span>Died</span><strong>{profile.died}</strong></div>
            <p>{profile.place}</p>
          </div>
          <p className="author-profile-bio">{author} is part of the Linery catalogue, a curated selection of literary voices and essential works for curious readers.</p>
        </div>
        <section className="author-books" aria-labelledby="author-books-title">
          <div className="author-books-heading"><p>Selected works</p><h2 id="author-books-title">Books by {author}</h2></div>
          <div className="author-books-carousel">
            <button className="author-books-control" type="button" aria-label="Previous books" onClick={() => scrollBooks(-1)}><i className="bi bi-chevron-left" aria-hidden="true" /></button>
            <div className="author-books-grid" ref={booksTrack} onWheel={(event) => { const track = event.currentTarget; if (track.scrollWidth <= track.clientWidth) return; if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) { event.preventDefault(); track.scrollLeft += event.deltaY } }}>{authorBooks.map((product) => <ProductCard key={product.title} product={product} {...actions} />)}</div>
            <button className="author-books-control" type="button" aria-label="Next books" onClick={() => scrollBooks(1)}><i className="bi bi-chevron-right" aria-hidden="true" /></button>
          </div>
        </section>
      </section>
    </div>
  </main>
}

function AllBooksPage({ onHome, ...actions }: { onHome: () => void } & ProductCardActions) {
  const allBooks = Array.from({ length: 5 }, (_, rowIndex) => products.map((product, productIndex) => ({
    ...product,
    key: `${rowIndex}-${productIndex}-${product.title}`,
  }))).flat()
  const [isCompactListing, setIsCompactListing] = useState(() => window.matchMedia('(max-width: 900px)').matches)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 900px)')
    const handleMediaChange = () => {
      setIsCompactListing(mediaQuery.matches)
      setCurrentPage(1)
    }
    handleMediaChange()
    mediaQuery.addEventListener('change', handleMediaChange)
    return () => mediaQuery.removeEventListener('change', handleMediaChange)
  }, [])

  const pageSize = isCompactListing ? 16 : allBooks.length
  const pageCount = Math.ceil(allBooks.length / pageSize)
  const visibleBooks = allBooks.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  const paginationItems: Array<number | 'ellipsis'> = pageCount > 5 ? [1, 2, 3, 'ellipsis', pageCount] : Array.from({ length: pageCount }, (_, index) => index + 1)

  return <main className="all-books-page">
    <div className="all-books-content">
      <div className="all-books-hero"><picture><source srcSet="/assets/all-books-hero.webp" type="image/webp" /><img src="/assets/all-books-hero.png" alt="Children exploring a garden together" width="2560" height="866" fetchPriority="high" decoding="async" /></picture></div>
      <Breadcrumb className="all-books-breadcrumb" label="Home" current="All Books" onNavigate={onHome} />
      <section className="all-books-panel" aria-labelledby="all-books-title">
        <RibbonTitle title="ALL BOOKS" id="all-books-title" heading />
        <div className="all-books-grid">{visibleBooks.map((product) => <ProductCard key={product.key} product={product} {...actions} />)}</div>
        <nav className="all-books-pagination" aria-label="All books pages">
          <button type="button" aria-label="Previous page" disabled={currentPage === 1} onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}><i className="bi bi-chevron-left" aria-hidden="true" /></button>
          {paginationItems.map((item, index) => item === 'ellipsis' ? <span className="all-books-pagination-ellipsis" key={`ellipsis-${index}`} aria-hidden="true">...</span> : <button key={item} type="button" className={item === currentPage ? 'is-current' : ''} aria-current={item === currentPage ? 'page' : undefined} onClick={() => setCurrentPage(item)}>{item}</button>)}
          <button type="button" aria-label="Next page" disabled={currentPage === pageCount} onClick={() => setCurrentPage((page) => Math.min(pageCount, page + 1))}><i className="bi bi-chevron-right" aria-hidden="true" /></button>
        </nav>
      </section>
    </div>
  </main>
}

function SearchResultsPage({ query, ...actions }: { query: string } & ProductCardActions) {
  const normalizedQuery = query.trim().toLowerCase()
  const results = products.filter((product) => [product.title, product.author, ...product.categories].some((value) => value.toLowerCase().includes(normalizedQuery)))
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

function Header({ cartCount, onMenu, onShop, onShopHover, onAuthors, onAllBooks, onSearch, onQuickView, quickViewOpen, activeView, shopOpen }: { cartCount: number; onMenu: () => void; onShop: () => void; onShopHover: (open: boolean) => void; onAuthors: () => void; onAllBooks: () => void; onSearch: (query: string) => void; onQuickView: () => void; quickViewOpen: boolean; activeView: View; shopOpen: boolean }) {
  const { t, language, setLanguage } = useLanguage()
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

  return <header ref={headerRef} className="site-header" onMouseLeave={() => onShopHover(false)}>
    <div className="header-inner">
      <button className="menu-button" aria-label="Mở menu" onClick={onMenu}><Menu /></button>
      <nav className="desktop-nav" aria-label="Điều hướng chính"><button className={`nav-link ${activeView !== 'authors' ? 'is-active' : ''}`} onClick={onShop} onMouseEnter={() => onShopHover(true)} onFocus={() => onShopHover(true)} aria-current={activeView !== 'authors' ? 'page' : undefined} aria-expanded={shopOpen}>{t.shop}</button><button className={`nav-link ${activeView === 'authors' ? 'is-active' : ''}`} onClick={onAuthors}>{t.authors}</button><div className="language-toggle header-language-toggle" aria-label="Language switcher"><button type="button" className={language === 'en' ? 'is-active' : ''} onClick={() => setLanguage('en')}>EN</button><span>|</span><button type="button" className={language === 'vi' ? 'is-active' : ''} onClick={() => setLanguage('vi')}>VI</button></div></nav>
      <a className="brand" href="/">LINERY BOOKSTORE</a>
      <div className="header-actions">
        <form className={`search-control ${searchOpen ? 'is-open' : ''}`} onSubmit={submitSearch}>
          <button className="search-toggle" type="button" aria-label={t.search} aria-expanded={searchOpen} onClick={() => setSearchOpen((open) => !open)}><img src="/assets/icon-search.svg" alt="" /></button>
          <input className="search-input" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t.search} aria-label={t.search} autoFocus={searchOpen} onKeyDown={(event) => { if (event.key === 'Escape') setSearchOpen(false) }} />
        </form>
        <button className={`quick-view-button ${quickViewOpen ? 'is-active' : ''}`} type="button" onClick={onQuickView} aria-expanded={quickViewOpen}>{t.quickView}</button>
        <a className="icon-button account-button" href="#login" aria-label={t.login}><i className="bi bi-person" aria-hidden="true" /></a>
        <a className="icon-button cart-button" href="#cart" aria-label={`${t.cart}, ${cartCount} sản phẩm`}><img src="/assets/icon-cart.svg" alt="" /><span>{cartCount}</span></a>
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
              <button className={`product-wishlist ${isWishlisted ? 'is-active' : ''}`} type="button" aria-label={isWishlisted ? `Remove ${product.title} from wishlist` : `Add ${product.title} to wishlist`} aria-pressed={isWishlisted} onClick={toggleWishlist}>Wishlist</button>
              <button type="button" onClick={(event) => { event.preventDefault(); event.stopPropagation(); onAddToCart(product) }}>Add to cart</button>
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

  useEffect(() => {
    const autoplay = window.setInterval(() => setTrackPosition((current) => current + 1), 5000)
    return () => window.clearInterval(autoplay)
  }, [])

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

function NewsSection({ onOpenNews, onOpenAllNews }: { onOpenNews: (item: NewsItem) => void; onOpenAllNews: () => void }) {
  const { t, language } = useLanguage()

  return <section id="news" className="news-section" aria-labelledby="news-title">
    <RibbonTitle title="NEWS" id="news-title" />
    <div className="news-track" aria-label="Linery news">
      {newsItems.map((item) => { const copy = localizeNews(item, language); return <article className="news-card" key={item.title}>
        <button className="news-card-link" type="button" onClick={() => onOpenNews(item)}>
          <div className="news-card-image-wrap"><img className="news-card-image" src={item.image} alt={copy.title} loading="lazy" decoding="async" /></div>
          <div className="news-card-copy"><p>{item.date === 'Book notes' ? t.bookNotes : t.fromShelf}</p><h3>{copy.title}</h3></div>
        </button>
      </article> })}
    </div>
    <button className="news-view-all" type="button" onClick={onOpenAllNews}>{t.viewAllNews}</button>
  </section>
}

function AllNewsPage({ onHome, onOpenNews }: { onHome: () => void; onOpenNews: (item: NewsItem) => void }) {
  const { t, language } = useLanguage()
  return <main className="news-page">
    <div className="news-page-content">
      <div className="all-books-hero news-page-hero"><picture><source srcSet="/assets/all-books-hero.webp" type="image/webp" /><img src="/assets/all-books-hero.png" alt="Children exploring a garden together" width="2560" height="866" fetchPriority="high" decoding="async" /></picture></div>
      <Breadcrumb className="news-page-breadcrumb" label={t.home} current={t.news} onNavigate={onHome} />
      <section className="news-page-panel" aria-labelledby="all-news-title">
        <RibbonTitle title="NEWS & EVENTS" id="all-news-title" heading />
        <div className="news-page-grid">{newsItems.map((item) => { const copy = localizeNews(item, language); return <article className="news-page-card" key={item.slug}>
          <button type="button" onClick={() => onOpenNews(item)}>
            <div className="news-page-image-wrap"><img src={item.image} alt={copy.title} loading="lazy" decoding="async" /></div>
            <p>{item.date === 'Book notes' ? t.bookNotes : t.fromShelf}</p><h2>{copy.title}</h2><span>{copy.excerpt}</span>
          </button>
        </article> })}</div>
      </section>
    </div>
  </main>
}

function NewsDetailPage({ item, onBack }: { item: NewsItem; onBack: () => void }) {
  const { t, language } = useLanguage()
  const copy = localizeNews(item, language)
  return <main className="news-detail-page">
    <div className="news-detail-content">
      <Breadcrumb className="news-page-breadcrumb" label={t.news} current={item.title} onNavigate={onBack} />
      <article className="news-detail-card">
        <div className="news-detail-image-wrap"><img src={item.image} alt={copy.title} /></div>
        <div className="news-detail-copy"><p className="news-detail-kicker">{item.date === 'Book notes' ? t.bookNotes : t.fromShelf}</p><h1>{copy.title}</h1><p className="news-detail-intro">{copy.excerpt}</p><div className="news-detail-body">{copy.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div><a className="news-source-link" href="https://www.instagram.com/linery_bookstore/" target="_blank" rel="noreferrer">{t.originalPost} <i className="bi bi-arrow-up-right" aria-hidden="true" /></a></div>
      </article>
    </div>
  </main>
}

function BookDetail({ product, onBack, onAuthor }: { product: Product; onBack: () => void; onAuthor: (author: string) => void }) {
  const galleryImages = [product.image]
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [activeImage, setActiveImage] = useState(0)
  const [descriptionExpanded, setDescriptionExpanded] = useState(false)
  const [reviewFormOpen, setReviewFormOpen] = useState(false)
  const [reviewSubmitted, setReviewSubmitted] = useState(false)

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
    <nav className="book-detail-breadcrumb" aria-label="Breadcrumb"><button onClick={onBack}>Shop</button><span aria-hidden="true">/</span><span>{product.title}</span></nav>
    <section className="book-detail-hero">
      <div className="book-detail-gallery">
        <button className="book-detail-cover-wrap" type="button" aria-label={`Open gallery for ${product.title}`} onClick={() => setLightboxOpen(true)}>
          <img className="book-detail-cover" src={galleryImages[activeImage]} alt={product.title} />
          <span className="book-detail-zoom"><i className="bi bi-arrows-fullscreen" aria-hidden="true" /> View full image</span>
        </button>
        <div className="book-detail-thumbnails" aria-label="Book images">
          {galleryImages.map((image, index) => <button key={image} className={`book-detail-thumbnail ${index === activeImage ? 'is-active' : ''}`} type="button" aria-label={`View image ${index + 1}`} onClick={() => setActiveImage(index)}><img src={image} alt="" loading="lazy" decoding="async" /></button>)}
        </div>
      </div>
      <div className="book-detail-copy">
        <p className="book-detail-kicker">Linery Books</p>
        <h1>{product.title}</h1>
        <p className="book-detail-author">by <a href={`/authors/${authorSlug(product.author)}`} onClick={(event) => { event.preventDefault(); onAuthor(product.author) }}>{product.author}</a></p>
        <div className="book-detail-rule" />
        <h2>Format</h2>
        <div className="book-formats"><button className="is-selected">Paperback</button><button>Digital</button></div>
        <div className="book-detail-category"><span>Category</span><div>{product.categories.map((category) => <a key={category} href={`/all-books?category=${encodeURIComponent(category.toLowerCase().replaceAll(' ', '-'))}`}>{category}<i className="bi bi-arrow-up-right" aria-hidden="true" /></a>)}</div></div>
        <div className="book-detail-purchase">
          <p className="book-detail-price">{product.price}</p>
          <button className="book-add-button" type="button">Add to basket</button>
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
      </div>
    </section>
    <section className="book-detail-section book-author-section">
      <div className="book-author-profile">
        <button className="book-author-avatar" type="button" aria-label={`View ${product.author} author page`} onClick={() => onAuthor(product.author)}><i className="bi bi-person-circle" aria-hidden="true" /></button>
        <div><h2>About <a href={`/authors/${product.author.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-')}`} onClick={(event) => { event.preventDefault(); onAuthor(product.author) }}>{product.author}</a></h2><p>{product.author} is part of the Linery catalogue, a curated selection of literary voices and essential works for curious readers.</p></div>
      </div>
    </section>
    <section className="book-detail-section book-reviews" aria-labelledby="reviews-title">
      <div className="book-reviews-heading">
        <div>
          <h2 id="reviews-title">Book reviews</h2>
          <div className="book-rating-summary"><span className="book-rating-stars" aria-label="4.8 out of 5 stars">★★★★★</span><strong>4.8</strong><span>24 reviews</span></div>
        </div>
        <button className="book-review-button" type="button" aria-expanded={reviewFormOpen} aria-controls="book-review-form" onClick={() => { setReviewFormOpen((open) => !open); setReviewSubmitted(false) }}>{reviewFormOpen ? 'Close review form' : 'Write a review'}</button>
      </div>
      {reviewFormOpen && <form id="book-review-form" className="book-review-form" onSubmit={(event) => { event.preventDefault(); setReviewSubmitted(true) }}>
        <h3>Share your thoughts</h3>
        <div className="book-review-rating-field">
          <span>Your rating</span>
          <div className="book-review-rating-options" role="group" aria-label="Your rating">
            {[5, 4, 3, 2, 1].map((rating) => <label key={rating}><input type="radio" name="rating" value={rating} defaultChecked={rating === 5} /><span aria-hidden="true">{'★'.repeat(rating)}</span><span className="sr-only">{rating} out of 5 stars</span></label>)}
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
    <section className="book-detail-section book-details-grid">
      <h2>Details</h2>
      <dl><div><dt>Publisher</dt><dd>Linery Books</dd></div><div><dt>Published</dt><dd>2026</dd></div><div><dt>ISBN</dt><dd>9780000000000</dd></div><div><dt>Pages</dt><dd>320 pages</dd></div><div><dt>Language</dt><dd>English</dd></div><div><dt>Price</dt><dd>{product.price}</dd></div></dl>
    </section>
    {lightboxOpen && <div className="book-lightbox" role="dialog" aria-modal="true" aria-label={`Image gallery for ${product.title}`} onClick={() => setLightboxOpen(false)}>
      <div className="book-lightbox-frame" onClick={(event) => event.stopPropagation()}>
        <img className="book-lightbox-image" src={galleryImages[activeImage]} alt={product.title} />
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
  const { t, language } = useLanguage()
  return <footer className="site-footer scroll-section" id="about">
    <div className="footer-copy">
      <h2>LINERY</h2>
      <p className="footer-quote">(pn.) /'lıməri/<br />{language === 'vi' ? 'hiệu sách tuyển chọn &amp; nhà xuất bản độc lập, được tạo nên tại Hà Nội' : 'a curated bookstore &amp; independent press, crafted in Hanoi'}</p>
      <div className="footer-contact"><i className="bi bi-telephone-fill" aria-hidden="true" /><a href="tel:+840946936039">+84 0946936039</a></div>
      <div className="footer-contact"><i className="bi bi-geo-alt-fill" aria-hidden="true" /><span>Hanoi Book Street, Cua Nam Ward, Hanoi</span></div>
      <div className="footer-contact"><i className="bi bi-envelope-fill" aria-hidden="true" /><a href="mailto:info@linerybooks.vn">info@linerybooks.vn</a></div>
      <p className="follow-label">{t.followUs}</p>
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

export function App() {
  const [language, setLanguage] = useState<Language>(() => window.localStorage.getItem('linery-language') === 'vi' ? 'vi' : 'en')
  const [welcomeOpen, setWelcomeOpen] = useState(() => window.localStorage.getItem('linery-welcome-seen') !== 'true')
  const [menuOpen, setMenuOpen] = useState(false)
  const [view, setView] = useState<View>(() => window.location.pathname === '/all-books' ? 'all-books' : window.location.pathname === '/news' ? 'news' : window.location.pathname.startsWith('/news/') ? 'news-detail' : window.location.pathname === '/search' ? 'search' : window.location.pathname.startsWith('/authors/') ? 'author' : 'home')
  const [searchQuery, setSearchQuery] = useState(() => new URLSearchParams(window.location.search).get('query') ?? '')
  const [selectedAuthor, setSelectedAuthor] = useState(() => getAuthorFromPath(window.location.pathname))
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(() => getNewsFromPath(window.location.pathname))
  const [shopOpen, setShopOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [cartCount, setCartCount] = useState(13)
  const [quickViewOpen, setQuickViewOpen] = useState(false)
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null)
  const previewCloseTimer = useRef<number | null>(null)

  useEffect(() => {
    const syncRoute = () => {
      setSearchQuery(new URLSearchParams(window.location.search).get('query') ?? '')
      setSelectedAuthor(getAuthorFromPath(window.location.pathname))
      setSelectedNews(getNewsFromPath(window.location.pathname))
      setView(window.location.pathname === '/all-books' ? 'all-books' : window.location.pathname === '/news' ? 'news' : window.location.pathname.startsWith('/news/') ? 'news-detail' : window.location.pathname === '/search' ? 'search' : window.location.pathname.startsWith('/authors/') ? 'author' : 'home')
    }
    window.addEventListener('popstate', syncRoute)
    return () => window.removeEventListener('popstate', syncRoute)
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

  const selectLanguage = (language: 'en' | 'vi') => {
    changeLanguage(language)
    window.localStorage.setItem('linery-welcome-seen', 'true')
    setWelcomeOpen(false)
  }

  const changeLanguage = (nextLanguage: Language) => {
    window.localStorage.setItem('linery-language', nextLanguage)
    setLanguage(nextLanguage)
  }

  const navigateTo = (path: string) => {
    if (`${window.location.pathname}${window.location.search}` !== path) window.history.pushState({}, '', path)
  }

  const showShop = () => {
    navigateTo('/#home')
    setView('home')
    setShopOpen(true)
    setMenuOpen(false)
  }

  const showHome = () => {
    navigateTo('/#home')
    setView('home')
    setShopOpen(false)
    setMenuOpen(false)
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

  const showAllNews = () => {
    navigateTo('/news')
    setSelectedNews(null)
    setView('news')
    setShopOpen(false)
    setMenuOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const showNewsDetail = (item: NewsItem) => {
    navigateTo(`/news/${item.slug}`)
    setSelectedNews(item)
    setView('news-detail')
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

  const showAuthor = (author: string) => {
    navigateTo(`/authors/${authorSlug(AUTHOR_DEMO_NAME)}`)
    setSelectedAuthor(AUTHOR_DEMO_NAME)
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

  return <LanguageContext.Provider value={{ language, setLanguage: changeLanguage, t: translations[language] }}>
    {welcomeOpen && <WelcomeScreen onSelectLanguage={selectLanguage} />}
    <div id="top" className={`page-shell ${quickViewOpen ? 'quick-view-active' : ''}`}>
    <Header cartCount={cartCount} onMenu={() => setMenuOpen(!menuOpen)} onShop={showShop} onShopHover={(open) => { if (view !== 'authors') setShopOpen(open) }} onAuthors={showAuthors} onAllBooks={showAllBooks} onSearch={showSearch} onQuickView={toggleQuickView} quickViewOpen={quickViewOpen} activeView={view} shopOpen={shopOpen} />
    <button className={`mobile-backdrop ${menuOpen ? 'is-open' : ''}`} aria-label="Close menu" aria-hidden={!menuOpen} onClick={() => setMenuOpen(false)} />
    <MobileMenu isOpen={menuOpen} onShop={showHome} onAllBooks={showAllBooks} onAuthors={showAuthors} onSearch={showSearch} onClose={() => setMenuOpen(false)} />
    {view === 'authors' ? <AuthorsDirectory /> : view === 'all-books' ? <AllBooksPage onHome={showHome} onOpenDetail={showDetail} onAddToCart={addToCart} onPreview={openPreview} onPreviewLeave={schedulePreviewClose} onSelectQuickView={selectQuickView} quickViewOpen={quickViewOpen} /> : view === 'news' ? <AllNewsPage onHome={showHome} onOpenNews={showNewsDetail} /> : view === 'news-detail' ? <NewsDetailPage item={selectedNews ?? newsItems[0]} onBack={showAllNews} /> : view === 'search' ? <SearchResultsPage query={searchQuery} onOpenDetail={showDetail} onAddToCart={addToCart} onPreview={openPreview} onPreviewLeave={schedulePreviewClose} onSelectQuickView={selectQuickView} quickViewOpen={quickViewOpen} /> : view === 'author' ? <AuthorProfile author={selectedAuthor || 'Edward W. Said'} onBack={showAuthors} onOpenDetail={showDetail} onAddToCart={addToCart} onPreview={openPreview} onPreviewLeave={schedulePreviewClose} onSelectQuickView={selectQuickView} quickViewOpen={quickViewOpen} /> : view === 'detail' ? <BookDetail product={selectedProduct ?? products[0]} onBack={showHome} onAuthor={showAuthor} /> : <main>
      <section className="hero scroll-section" aria-label="Linery bookstore illustration"><img src="/assets/hero-children.png" alt="Các em nhỏ cùng đọc sách trên nền đỏ" /></section>
      <div id="shop" className="collections">{sections.map(section => <Collection key={section.title} {...section} onOpenDetail={showDetail} onAddToCart={addToCart} onPreview={openPreview} onPreviewLeave={schedulePreviewClose} onSelectQuickView={selectQuickView} quickViewOpen={quickViewOpen} />)}<NewsSection onOpenNews={showNewsDetail} onOpenAllNews={showAllNews} /></div>
    </main>}
    <Footer />
    </div>
    {quickViewOpen && <BookPreview product={previewProduct} onClose={closePreview} onOpenDetail={showDetail} />}
  </LanguageContext.Provider>
}
