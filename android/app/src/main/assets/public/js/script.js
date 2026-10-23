/* ===================== DADOS ===================== */
const BOOKS = [
  { title: "A Hora da Estrela", author: "Clarice Lispector", price: "38,90", tag: "Ficção BR", color: "#5C3A28", image: "img/A Hora da Estrela.png" },
  { title: "Torto Arado", author: "Itamar Vieira Jr.", price: "54,90", tag: "Ficção BR", color: "#63432E", image: "img/Torto Arado.png" },
  { title: "O Príncipe Cruel", author: "Holly Black", price: "62,00", tag: "Fantasia", color: "#8B5E3C", image: "img/O principe cruel.png" },
  { title: "Vidas Secas", author: "Graciliano Ramos", price: "34,50", tag: "Clássico", color: "#3A281D", image: "img/Vidas secas.png" },
  { title: "O Avesso da Pele", author: "Jeferson Tenório", price: "49,90", tag: "Ficção BR", color: "#4E3626", image: "img/O Avesso da Pele.png" },
  { title: "Quarto de Despejo", author: "Carolina Maria de Jesus", price: "41,00", tag: "Testemunho", color: "#63432E", image: "img/Quarto de Despejo.png" },
  { title: "Grande Sertão: Veredas", author: "Guimarães Rosa", price: "68,90", tag: "Clássico", color: "#5C3A28", image: "img/Grande Sertão Veredas.png" },
  { title: "Água Viva", author: "Clarice Lispector", price: "39,90", tag: "Ficção BR", color: "#8B5E3C", image: "img/água viva.png" },
];

const SECTIONS = {
  "Ficção": ["A Hora da Estrela — Clarice Lispector", "Torto Arado — Itamar Vieira Jr.", "O Avesso da Pele — Jeferson Tenório", "Água Viva — Clarice Lispector"],
  "Poesia": ["O Príncipe Cruel — Holly Black", "A Rosa do Povo — Carlos Drummond de Andrade", "Cantares — Cora Coralina"],
  "Ensaio": ["Pequeno Manual Antirracista — Djamila Ribeiro", "Feminismo para os 99% — Nancy Fraser", "Educação como Prática da Liberdade — Paulo Freire"],
  "Infantil": ["Menina Bonita do Laço de Fita — Ana Maria Machado", "O Menino Marrom — Ziraldo", "Bisa Bia, Bisa Bel — Ana Maria Machado"],
};

/* ===================== PRATELEIRA (HERO) ===================== */
const shelf = document.getElementById('spine-shelf');
const caption = document.getElementById('spine-caption');
const heights = [72, 88, 64, 95, 78, 60, 90, 70, 84, 66];

BOOKS.forEach((b, i) => {
  const wrap = document.createElement('div');
  wrap.className = 'relative flex-1 h-full overflow-hidden';

  const spine = document.createElement('div');
  spine.className = 'spine w-full rounded-t-[3px] flex items-center justify-center text-paper-50/90 text-[11px] font-body tracking-wide';
  spine.style.height = heights[i % heights.length] + '%';
  spine.style.background = b.color;
  spine.textContent = b.title.length > 22 ? b.title.slice(0, 20) + '…' : b.title;
  spine.setAttribute('tabindex', '0');
  spine.setAttribute('role', 'button');
  spine.setAttribute('aria-label', `${b.title}, ${b.author}`);

  spine.addEventListener('mouseenter', () => caption.textContent = `${b.title} — ${b.author}, R$ ${b.price}`);
  spine.addEventListener('focus', () => caption.textContent = `${b.title} — ${b.author}, R$ ${b.price}`);
  spine.addEventListener('click', () => addToCart(b.title));
  spine.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); addToCart(b.title); } });

  wrap.appendChild(spine);
  shelf.appendChild(wrap);
});

/* ===================== GRID DE LIVROS ===================== */
const grid = document.getElementById('book-grid');
BOOKS.forEach((b) => {
  const card = document.createElement('article');
  card.className = 'fade-up group';
  card.innerHTML = `
    <div class="relative aspect-[3/4] rounded-md overflow-hidden mb-4 bg-coffee-950">
      ${b.image ? `<img src="${b.image}" alt="Capa de ${b.title}" class="absolute inset-0 h-full w-full object-cover" loading="lazy" decoding="async">` : ''}
      <div class="absolute inset-0 bg-coffee-950/30"></div>
      <div class="absolute inset-0 flex items-end p-4">
        <span class="font-display text-paper-50 text-base leading-snug">${b.title}</span>
      </div>
      <span class="absolute top-3 left-3 font-mono text-[10px] uppercase tracking-widest bg-coffee-950/70 text-tan-300 px-2 py-1 rounded-full">${b.tag}</span>
      <button aria-label="Adicionar ${b.title} à sacola" class="add-btn absolute bottom-3 right-3 w-9 h-9 rounded-full bg-paper-50 text-coffee-950 grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
      </button>
    </div>
    <h3 class="font-body font-medium text-sm text-paper-100">${b.title}</h3>
    <p class="text-xs text-paper-500 mt-0.5">${b.author}</p>
    <p class="font-mono text-sm text-tan-400 mt-2">R$ ${b.price}</p>
  `;
  card.querySelector('.add-btn').addEventListener('click', () => addToCart(b.title));
  grid.appendChild(card);
});

/* ===================== CATÁLOGO / SEÇÕES ===================== */
const tabsEl = document.getElementById('catalog-tabs');
const listEl = document.getElementById('catalog-list');
const sectionNames = Object.keys(SECTIONS);

function renderCatalog(name) {
  listEl.innerHTML = '';
  SECTIONS[name].forEach((item, i) => {
    const row = document.createElement('div');
    row.className = 'bg-paper-100 p-6 flex items-center justify-between gap-4 hover:bg-paper-50 transition-colors';
    row.innerHTML = `
      <div class="flex items-center gap-4">
        <span class="font-mono text-xs text-bark/60">${String(i + 1).padStart(2, '0')}</span>
        <span class="text-sm text-coffee-900">${item}</span>
      </div>
      <span class="font-mono text-[10px] uppercase tracking-widest text-bark/70 border border-bark/20 rounded-full px-2 py-1">${name}</span>
    `;
    listEl.appendChild(row);
  });
}

sectionNames.forEach((name, i) => {
  const tab = document.createElement('button');
  tab.className = 'catalog-tab px-4 py-2 rounded-full border border-coffee-800/20 text-coffee-800 hover:border-coffee-800/50 transition-colors' + (i === 0 ? ' active' : '');
  tab.textContent = name;
  tab.addEventListener('click', () => {
    document.querySelectorAll('.catalog-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    renderCatalog(name);
  });
  tabsEl.appendChild(tab);
});
renderCatalog(sectionNames[0]);

/* ===================== SACOLA (simulada) ===================== */
const cart = [];
const cartCountEl = document.getElementById('cart-count');
const cartBtn = document.getElementById('cart-btn');
const cartPanel = document.getElementById('cart-panel');
const cartClose = document.getElementById('cart-close');
const cartItemsEl = document.getElementById('cart-items');
const cartSummary = document.getElementById('cart-summary');
const cartTotalEl = document.getElementById('cart-total');
const cartMsg = document.getElementById('cart-msg');

function parsePrice(value) {
  return typeof value === 'number' ? value : Number(String(value).replace(',', '.'));
}

function formatPrice(value) {
  return `R$ ${value.toFixed(2).replace('.', ',')}`;
}

function updateCartUI() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.quantity * item.price, 0);

  cartCountEl.textContent = totalItems;
  cartSummary.textContent = totalItems
    ? `${totalItems} item${totalItems > 1 ? 's' : ''} no carrinho`
    : 'Nenhum item adicionado.';
  cartTotalEl.textContent = formatPrice(totalPrice);
  cartItemsEl.innerHTML = '';

  if (cart.length === 0) {
    cartItemsEl.innerHTML = '<p class="px-5 py-6 text-sm text-paper-400">Seu carrinho está vazio.</p>';
    return;
  }

  cart.forEach((item) => {
    const row = document.createElement('div');
    row.className = 'flex items-center justify-between gap-4 px-5 py-4';
    row.innerHTML = `
      <div>
        <p class="text-sm text-paper-100">${item.title}</p>
        <p class="text-xs text-paper-400">${item.quantity} × ${formatPrice(item.price)}</p>
      </div>
      <span class="text-sm font-mono text-tan-300">${formatPrice(item.quantity * item.price)}</span>
    `;
    cartItemsEl.appendChild(row);
  });
}

function openCart() {
  cartPanel.classList.remove('hidden');
  cartMsg.textContent = '';
}

function closeCart() {
  cartPanel.classList.add('hidden');
}

cartBtn.addEventListener('click', () => {
  updateCartUI();
  openCart();
});
cartClose.addEventListener('click', closeCart);

function addToCart(title) {
  const book = BOOKS.find((b) => b.title === title);
  if (!book) return;

  const price = parsePrice(book.price);
  const existing = cart.find((item) => item.title === title);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ title, price, quantity: 1 });
  }

  updateCartUI();
  caption.textContent = `Adicionado à sacola: ${title}`;
  openCart();
}

document.getElementById('checkout-btn').addEventListener('click', () => {
  if (cart.length === 0) {
    cartMsg.textContent = 'Seu carrinho ainda está vazio.';
    return;
  }

  cartMsg.textContent = 'Compra finalizada! Obrigado pela preferência.';
  cart.length = 0;
  updateCartUI();
});

/* ===================== NEWSLETTER ===================== */
document.getElementById('newsletter-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  document.getElementById('newsletter-msg').textContent = `Prontinho — a carta de leitura vai chegar em ${email}.`;
  e.target.reset();
});

/* ===================== MENU MOBILE ===================== */
const menuBtn = document.getElementById('menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
menuBtn.addEventListener('click', () => mobileMenu.classList.toggle('hidden'));
mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mobileMenu.classList.add('hidden')));

/* ===================== FADE-UP ON SCROLL ===================== */
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));
