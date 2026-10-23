import { useEffect, useRef, useState, type ElementType } from 'react'
import { Menu } from 'lucide-react'
import 'bootstrap-icons/font/bootstrap-icons.css'

type Product = { image: string; title: string; author: string; price: string; categories: string[] }
type View = 'home' | 'authors' | 'all-books' | 'detail'

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

function MobileMenu({ isOpen, onShop, onAllBooks, onAuthors, onClose }: { isOpen: boolean; onShop: () => void; onAllBooks: () => void; onAuthors: () => void; onClose: () => void }) {
  const [openBranches, setOpenBranches] = useState<Record<string, boolean>>({ Books: true, Fiction: true, 'Non-fiction': true, 'Linery Press': true })
  const toggleBranch = (label: string) => setOpenBranches((current) => ({ ...current, [label]: !current[label] }))

  return <aside className={`mobile-menu ${isOpen ? 'is-open' : ''}`} aria-label="Mobile navigation" aria-hidden={!isOpen}>
    <div className="mobile-menu-header">
      <p className="mobile-menu-title">Menu</p>
      <button className="mobile-menu-close" aria-label="Close menu" onClick={onClose}>×</button>
    </div>
    <label className="mobile-menu-search">
      <img src="/assets/icon-search.svg" alt="" aria-hidden="true" />
      <input type="search" placeholder="Search books" aria-label="Search books" />
    </label>
    <section className="mobile-menu-section" aria-labelledby="mobile-shop-heading">
      <h2 id="mobile-shop-heading" className="mobile-menu-section-title">Shop</h2>
      <button className="mobile-menu-item mobile-menu-level-0" onClick={onAllBooks}><span className="mobile-menu-text">View all books</span></button>
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
      <h2 id="mobile-authors-heading" className="mobile-menu-section-title">Authors</h2>
      <button className="mobile-menu-item mobile-menu-level-0" onClick={onAuthors}><span className="mobile-menu-text">Browse all authors</span><span aria-hidden="true">→</span></button>
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

function AllBooksPage({ onHome, onOpenDetail, onAddToCart, onPreview, onPreviewLeave }: { onHome: () => void; onOpenDetail: (product: Product) => void; onAddToCart: (product: Product) => void; onPreview: (product: Product) => void; onPreviewLeave: () => void }) {
  const rows = Array.from({ length: 5 }, (_, rowIndex) => products.map((product, productIndex) => ({
    ...product,
    title: rowIndex === 0 ? product.title : product.title,
    image: product.image,
    key: `${rowIndex}-${productIndex}-${product.title}`,
  })))

  return <main className="all-books-page">
    <div className="all-books-content">
      <div className="all-books-hero"><img src="/assets/all-books-hero.png" alt="Children exploring a garden together" /></div>
      <nav className="all-books-breadcrumb" aria-label="Breadcrumb"><a href="/#home" onClick={(event) => { event.preventDefault(); onHome() }}>Home</a><span aria-hidden="true">/</span><span>All Books</span></nav>
      <section className="all-books-panel" aria-labelledby="all-books-title">
        <RibbonTitle title="ALL BOOKS" id="all-books-title" heading />
        <div className="all-books-grid">{rows.flat().map((product) => <ProductCard key={product.key} product={product} onOpenDetail={onOpenDetail} onAddToCart={onAddToCart} onPreview={onPreview} onPreviewLeave={onPreviewLeave} />)}</div>
        <nav className="all-books-pagination" aria-label="All books pages">
          <button type="button" aria-label="Previous page" disabled><i className="bi bi-chevron-left" aria-hidden="true" /></button>
          <button type="button" className="is-current" aria-current="page">1</button>
          <button type="button">2</button>
          <button type="button">3</button>
          <button type="button" aria-label="More pages">…</button>
          <button type="button">7</button>
          <button type="button" aria-label="Next page"><i className="bi bi-chevron-right" aria-hidden="true" /></button>
        </nav>
      </section>
    </div>
  </main>
}

function Header({ cartCount, onMenu, onShop, onShopHover, onAuthors, onAllBooks, activeView, shopOpen }: { cartCount: number; onMenu: () => void; onShop: () => void; onShopHover: (open: boolean) => void; onAuthors: () => void; onAllBooks: () => void; activeView: View; shopOpen: boolean }) {
  const [searchOpen, setSearchOpen] = useState(false)

  return <header className="site-header" onMouseLeave={() => onShopHover(false)}>
    <div className="header-inner">
      <button className="menu-button" aria-label="Mở menu" onClick={onMenu}><Menu /></button>
      <nav className="desktop-nav" aria-label="Điều hướng chính"><button className={`nav-link ${activeView !== 'authors' ? 'is-active' : ''}`} onClick={onShop} onMouseEnter={() => onShopHover(true)} onFocus={() => onShopHover(true)} aria-current={activeView !== 'authors' ? 'page' : undefined} aria-expanded={shopOpen}>Shop</button><button className={`nav-link ${activeView === 'authors' ? 'is-active' : ''}`} onClick={onAuthors}>Authors</button></nav>
      <a className="brand" href="#top">LINERY BOOKSTORE</a>
      <div className="header-actions">
        <div className={`search-control ${searchOpen ? 'is-open' : ''}`}>
          <button className="search-toggle" type="button" aria-label="Tìm kiếm" aria-expanded={searchOpen} onClick={() => setSearchOpen((open) => !open)}><img src="/assets/icon-search.svg" alt="" /></button>
          <input className="search-input" type="search" placeholder="Search books" aria-label="Search books" autoFocus={searchOpen} onKeyDown={(event) => { if (event.key === 'Escape') setSearchOpen(false) }} />
        </div>
        <a className="icon-button cart-button" href="#cart" aria-label={`Giỏ hàng, ${cartCount} sản phẩm`}><img src="/assets/icon-cart.svg" alt="" /><span>{cartCount}</span></a>
      </div>
    </div>
    {shopOpen && activeView !== 'authors' && <ShopMenu onAllBooks={onAllBooks} />}
  </header>
}

function ProductCard({ product, onOpenDetail, onAddToCart, onPreview, onPreviewLeave }: { product: Product; onOpenDetail: (product: Product) => void; onAddToCart: (product: Product) => void; onPreview: (product: Product) => void; onPreviewLeave: () => void }) {
  return <article className="product-card" onMouseEnter={() => onPreview(product)} onMouseLeave={onPreviewLeave} onFocus={() => onPreview(product)}>
    <a className="product-card-link" href="#a" onClick={(event) => { event.preventDefault(); onOpenDetail(product) }}>
      <div className="product-surface">
        <div className="product-cover-wrap">
          <img src={product.image} alt={product.title} className="product-cover" loading="lazy" decoding="async" />
          <div className="product-overlay">
            <div className="product-overlay-copy"><strong>{product.title}</strong><span>{product.author}</span><b>{product.price}</b></div>
            <div className="product-overlay-actions">
              <span className="product-overlay-cta">Read more</span>
              <button type="button" onClick={(event) => { event.preventDefault(); event.stopPropagation(); onAddToCart(product) }}>Add to basket</button>
            </div>
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

function Collection({ title, items, onOpenDetail, onAddToCart, onPreview, onPreviewLeave }: { title: string; items: Product[]; onOpenDetail: (product: Product) => void; onAddToCart: (product: Product) => void; onPreview: (product: Product) => void; onPreviewLeave: () => void }) {
  const [activeSlide, setActiveSlide] = useState(0)
  const wheelLock = useRef(false)
  const touchStart = useRef<number | null>(null)
  const slides = Array.from({ length: 4 }, (_, slideIndex) => items.map((_, index) => items[(index + slideIndex) % items.length]))

  const moveSlide = (direction: 1 | -1) => {
    setActiveSlide((current) => (current + direction + slides.length) % slides.length)
  }

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    if (Math.abs(event.deltaY) < 12 || wheelLock.current) return
    event.preventDefault()
    wheelLock.current = true
    moveSlide(event.deltaY > 0 ? 1 : -1)
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
      <div className="carousel-track" data-slide={activeSlide}>
        {slides.map((slide, slideIndex) => <div className="carousel-slide" key={`${title}-slide-${slideIndex}`} aria-hidden={activeSlide !== slideIndex}>
          <div className="product-grid">{slide.map((product, index) => <ProductCard key={`${title}-${slideIndex}-${index}`} product={product} onOpenDetail={onOpenDetail} onAddToCart={onAddToCart} onPreview={onPreview} onPreviewLeave={onPreviewLeave} />)}</div>
        </div>)}
      </div>
    </div>
    <div className="pagination" aria-label={`${title} pagination`}>{slides.map((_, index) => <button key={`${title}-dot-${index}`} className={index === activeSlide ? 'active' : ''} aria-label={`Xem slide ${index + 1}`} aria-current={index === activeSlide ? 'true' : undefined} onClick={() => setActiveSlide(index)} />)}</div>
  </section>
}

function BookDetail({ product, onBack }: { product: Product; onBack: () => void }) {
  const galleryImages = [product.image]
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [activeImage, setActiveImage] = useState(0)
  const [descriptionExpanded, setDescriptionExpanded] = useState(false)

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
        <p className="book-detail-author">by <a href="#authors">{product.author}</a></p>
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
      <h2>About {product.author}</h2>
      <p>{product.author} is part of the Linery catalogue, a curated selection of literary voices and essential works for curious readers.</p>
    </section>
    <section className="book-detail-section book-reviews" aria-labelledby="reviews-title">
      <div className="book-reviews-heading">
        <div>
          <h2 id="reviews-title">Book reviews</h2>
          <div className="book-rating-summary"><span className="book-rating-stars" aria-label="4.8 out of 5 stars">★★★★★</span><strong>4.8</strong><span>24 reviews</span></div>
        </div>
        <button className="book-review-button" type="button">Write a review</button>
      </div>
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

function BookPreview({ product, onClose, onKeepOpen, onLeave, onOpenDetail }: { product: Product; onClose: () => void; onKeepOpen: () => void; onLeave: () => void; onOpenDetail: (product: Product) => void }) {
  const publisher = product.title.includes('Very Short') ? 'Oxford University Press' : 'Linery Books'
  return <aside className="book-preview" aria-label={`Quick preview: ${product.title}`} onMouseEnter={onKeepOpen} onMouseLeave={onLeave}>
    <div className="book-preview-header"><p>Quick preview</p><button type="button" aria-label="Close preview" onClick={onClose}>×</button></div>
      <img className="book-preview-cover" src={product.image} alt={product.title} loading="lazy" decoding="async" />
    <div className="book-preview-copy">
      <p className="book-preview-kicker">Linery Books</p>
      <h2>{product.title}</h2>
      <p className="book-preview-author">{product.author}</p>
      <p className="book-preview-price">{product.price}</p>
    </div>
    <dl className="book-preview-details">
      <div><dt>Publisher</dt><dd>{publisher}</dd></div>
      <div><dt>Published</dt><dd>2024</dd></div>
      <div><dt>ISBN</dt><dd>978-0-00-000000-0</dd></div>
      <div><dt>Format</dt><dd>Paperback</dd></div>
      <div><dt>Language</dt><dd>English</dd></div>
      <div><dt>Pages</dt><dd>320 pages</dd></div>
    </dl>
    <a className="book-preview-link" href="#a" onClick={(event) => { event.preventDefault(); onOpenDetail(product) }}>View full details <span aria-hidden="true">→</span></a>
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

export function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [view, setView] = useState<View>(() => window.location.pathname === '/all-books' ? 'all-books' : 'home')
  const [shopOpen, setShopOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [cartCount, setCartCount] = useState(13)
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null)
  const previewCloseTimer = useRef<number | null>(null)
  const sectionScrollLock = useRef(false)
  const sectionScrollUnlockTimer = useRef<number | null>(null)
  const touchStart = useRef<{ x: number; y: number; excluded: boolean } | null>(null)

  useEffect(() => {
    const syncRoute = () => setView(window.location.pathname === '/all-books' ? 'all-books' : 'home')
    window.addEventListener('popstate', syncRoute)
    return () => window.removeEventListener('popstate', syncRoute)
  }, [])

  useEffect(() => {
    document.body.classList.toggle('menu-open', menuOpen)
    return () => document.body.classList.remove('menu-open')
  }, [menuOpen])

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('home-page-scroll', view === 'home')
    if (view !== 'home') return () => root.classList.remove('home-page-scroll')

    const isExcludedTarget = (target: EventTarget | null) => target instanceof Element && Boolean(target.closest('.carousel-viewport, .mobile-menu, .shop-menu, .book-preview, .book-lightbox'))
    const getSectionPositions = () => {
      const headerHeight = Number.parseFloat(getComputedStyle(root).getPropertyValue('--header-height')) || 0
      return [...document.querySelectorAll<HTMLElement>('.scroll-section')].map((section) => Math.max(0, window.scrollY + section.getBoundingClientRect().top - headerHeight))
    }
    const scrollToSection = (direction: 1 | -1) => {
      if (sectionScrollLock.current || menuOpen || shopOpen || previewProduct) return false
      const positions = getSectionPositions()
      if (positions.length < 2) return false
      const currentIndex = positions.reduce((index, position, sectionIndex) => position <= window.scrollY + 8 ? sectionIndex : index, 0)
      const nextIndex = Math.min(positions.length - 1, Math.max(0, currentIndex + direction))
      if (nextIndex === currentIndex) return false
      sectionScrollLock.current = true
      if (sectionScrollUnlockTimer.current !== null) window.clearTimeout(sectionScrollUnlockTimer.current)
      sectionScrollUnlockTimer.current = window.setTimeout(() => { sectionScrollLock.current = false }, 780)
      window.scrollTo({ top: positions[nextIndex], behavior: 'smooth' })
      return true
    }
    const handleWheel = (event: WheelEvent) => {
      if (isExcludedTarget(event.target) || Math.abs(event.deltaY) < Math.abs(event.deltaX) || Math.abs(event.deltaY) < 8) return
      if (scrollToSection(event.deltaY > 0 ? 1 : -1)) event.preventDefault()
    }
    const handleTouchStart = (event: TouchEvent) => {
      const touch = event.changedTouches[0]
      if (!touch) return
      touchStart.current = { x: touch.clientX, y: touch.clientY, excluded: isExcludedTarget(event.target) }
    }
    const handleTouchMove = (event: TouchEvent) => {
      if (!touchStart.current || touchStart.current.excluded) return
      const touch = event.changedTouches[0]
      if (!touch) return
      const deltaX = touch.clientX - touchStart.current.x
      const deltaY = touch.clientY - touchStart.current.y
      if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 12) event.preventDefault()
    }
    const handleTouchEnd = (event: TouchEvent) => {
      const start = touchStart.current
      if (!start || start.excluded) {
        touchStart.current = null
        return
      }
      const touch = event.changedTouches[0]
      if (!touch) return
      const distance = touch.clientY - start.y
      const horizontalDistance = touch.clientX - start.x
      touchStart.current = null
      if (Math.abs(distance) < 44 || Math.abs(distance) < Math.abs(horizontalDistance)) return
      if (scrollToSection(distance < 0 ? 1 : -1)) event.preventDefault()
    }

    window.addEventListener('wheel', handleWheel, { passive: false })
    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchmove', handleTouchMove, { passive: false })
    window.addEventListener('touchend', handleTouchEnd, { passive: false })
    return () => {
      window.removeEventListener('wheel', handleWheel)
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
      if (sectionScrollUnlockTimer.current !== null) window.clearTimeout(sectionScrollUnlockTimer.current)
      sectionScrollLock.current = false
      touchStart.current = null
      root.classList.remove('home-page-scroll')
    }
  }, [menuOpen, previewProduct, shopOpen, view])

  const navigateTo = (path: string) => {
    if (window.location.pathname !== path) window.history.pushState({}, '', path)
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

  const showDetail = (product: Product) => {
    if (previewCloseTimer.current !== null) window.clearTimeout(previewCloseTimer.current)
    setPreviewProduct(null)
    setSelectedProduct(product)
    setView('detail')
    setShopOpen(false)
    setMenuOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const addToCart = (_product: Product) => setCartCount((count) => count + 1)
  const openPreview = (product: Product) => {
    if (previewCloseTimer.current !== null) window.clearTimeout(previewCloseTimer.current)
    setPreviewProduct(product)
  }
  const schedulePreviewClose = () => {
    if (previewCloseTimer.current !== null) window.clearTimeout(previewCloseTimer.current)
    previewCloseTimer.current = window.setTimeout(() => setPreviewProduct(null), 220)
  }
  const closePreview = () => {
    if (previewCloseTimer.current !== null) window.clearTimeout(previewCloseTimer.current)
    setPreviewProduct(null)
  }

  return <div id="top" className="page-shell">
    <Header cartCount={cartCount} onMenu={() => setMenuOpen(!menuOpen)} onShop={showShop} onShopHover={(open) => { if (view !== 'authors') setShopOpen(open) }} onAuthors={showAuthors} onAllBooks={showAllBooks} activeView={view} shopOpen={shopOpen} />
    <button className={`mobile-backdrop ${menuOpen ? 'is-open' : ''}`} aria-label="Close menu" aria-hidden={!menuOpen} onClick={() => setMenuOpen(false)} />
    <MobileMenu isOpen={menuOpen} onShop={showHome} onAllBooks={showAllBooks} onAuthors={showAuthors} onClose={() => setMenuOpen(false)} />
    {previewProduct && <BookPreview product={previewProduct} onClose={closePreview} onKeepOpen={() => openPreview(previewProduct)} onLeave={schedulePreviewClose} onOpenDetail={showDetail} />}
    {view === 'authors' ? <AuthorsDirectory /> : view === 'all-books' ? <AllBooksPage onHome={showHome} onOpenDetail={showDetail} onAddToCart={addToCart} onPreview={openPreview} onPreviewLeave={schedulePreviewClose} /> : view === 'detail' ? <BookDetail product={selectedProduct ?? products[0]} onBack={showHome} /> : <main>
      <section className="hero scroll-section" aria-label="Linery bookstore illustration"><img src="/assets/hero-children.png" alt="Các em nhỏ cùng đọc sách trên nền đỏ" /></section>
      <div id="shop" className="collections">{sections.map(section => <Collection key={section.title} {...section} onOpenDetail={showDetail} onAddToCart={addToCart} onPreview={openPreview} onPreviewLeave={schedulePreviewClose} />)}</div>
    </main>}
    <Footer />
  </div>
}
