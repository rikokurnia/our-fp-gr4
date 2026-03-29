const categoryLabelMap = {
  all: 'Semua',
  fashion: 'Fashion',
  home: 'Kebutuhan Rumah',
  beauty: 'Perawatan Diri'
};

let allProducts = [];
let activeCategory = 'all';

const tabsEl = document.getElementById('category-tabs');
const gridEl = document.getElementById('product-grid');
const resultEl = document.getElementById('result-text');
const summaryEl = document.getElementById('summary-cards');
const searchInput = document.getElementById('search-input');

function parseCategoryFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const queryCategory = (params.get('category') || 'all').toLowerCase();
  return categoryLabelMap[queryCategory] ? queryCategory : 'all';
}

function categoryList() {
  const fromData = [...new Set(allProducts.map((item) => item.category))].sort();
  return ['all', ...fromData];
}

function createSummaryCards() {
  const categories = categoryList().filter((key) => key !== 'all');
  summaryEl.innerHTML = categories.map((key) => {
    const count = allProducts.filter((item) => item.category === key).length;
    return `
      <article class="rounded-2xl bg-card border border-[#dfe7d4] p-4 shadow-sm">
        <p class="text-xs uppercase tracking-widest text-secondary font-bold">${categoryLabelMap[key] || key}</p>
        <p class="mt-2 text-3xl font-extrabold text-primary font-headline">${count}</p>
        <p class="text-sm text-secondary">produk tersedia</p>
      </article>
    `;
  }).join('');
}

function createTabs() {
  tabsEl.innerHTML = categoryList().map((key) => {
    const activeClass = key === activeCategory ? 'bg-primary text-white' : 'bg-[#edf3e3] text-secondary hover:bg-[#dce8c8]';
    return `<button data-category="${key}" class="category-tab px-4 py-2 rounded-full text-sm font-bold transition-colors ${activeClass}">${categoryLabelMap[key] || key}</button>`;
  }).join('');

  document.querySelectorAll('.category-tab').forEach((button) => {
    button.addEventListener('click', () => {
      activeCategory = button.dataset.category;
      createTabs();
      renderProducts();
    });
  });
}

function filteredProducts() {
  const keyword = (searchInput.value || '').toLowerCase().trim();
  return allProducts.filter((item) => {
    const matchCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchSearch = !keyword || item.name.toLowerCase().includes(keyword) || item.description.toLowerCase().includes(keyword);
    return matchCategory && matchSearch;
  });
}

function renderProducts() {
  const items = filteredProducts();
  const activeLabel = categoryLabelMap[activeCategory] || activeCategory;
  resultEl.textContent = `${items.length} produk ditemukan di kategori ${activeLabel}.`;

  if (!items.length) {
    gridEl.innerHTML = '<div class="col-span-full rounded-2xl bg-[#fff5f2] border border-[#ffd8c9] p-6 text-[#8b3e1b] font-semibold">Tidak ada produk yang cocok. Coba kata kunci lain.</div>';
    return;
  }

  gridEl.innerHTML = items.map((item) => `
    <article class="bg-surface-container-low rounded-2xl overflow-hidden group hover:shadow-xl transition-shadow duration-300 flex flex-col border border-outline-variant/30">
      <div class="relative aspect-square overflow-hidden bg-surface-container">
        <img src="${item.image}" alt="${item.name}" loading="lazy" decoding="async" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        <div class="absolute top-3 left-3 flex gap-2">
          <span class="bg-secondary-container text-on-secondary-container text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-sm border border-secondary/10">
            <span class="material-symbols-outlined text-[12px]" style="font-variation-settings: 'FILL' 1;">eco</span> ${item.eco ? 'Ramah Lingkungan' : 'Reguler'}
          </span>
        </div>
        <button class="absolute top-3 right-3 w-8 h-8 bg-white/80 backdrop-blur rounded-full flex items-center justify-center text-error opacity-0 group-hover:opacity-100 transition-opacity">
          <span class="material-symbols-outlined text-sm">favorite</span>
        </button>
      </div>
      <div class="p-4 space-y-2 flex flex-col flex-1">
        <p class="text-[10px] font-bold text-secondary uppercase tracking-tighter">${categoryLabelMap[item.category] || item.category}</p>
        <h3 class="text-on-background font-bold text-sm line-clamp-2 leading-snug flex-1">${item.name}</h3>
        <div class="flex items-baseline gap-1 mt-auto">
          <span class="text-xs text-on-surface-variant font-medium">Rp</span>
          <span class="text-lg font-extrabold text-primary">${item.price.toLocaleString('id-ID')}</span>
        </div>
        <a href="dashboard.html" class="w-full bg-[#925100] text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 mt-2 hover:bg-[#703d00] transition-colors active:scale-95 shadow-sm">
          <span class="material-symbols-outlined text-sm">storefront</span>
          Lihat di Katalog
        </a>
      </div>
    </article>
  `).join('');
}

async function init() {
  activeCategory = parseCategoryFromUrl();

  try {
    const response = await fetch('/data/products.json');
    if (!response.ok) throw new Error('Gagal memuat data produk');
    const payload = await response.json();
    allProducts = payload.products || [];
    createSummaryCards();
    createTabs();
    renderProducts();
  } catch (_error) {
    gridEl.innerHTML = '<div class="col-span-full rounded-2xl bg-[#fff5f2] border border-[#ffd8c9] p-6 text-[#8b3e1b] font-semibold">Data produk gagal dimuat. Coba reload halaman.</div>';
  }
}

searchInput.addEventListener('input', renderProducts);
init();
