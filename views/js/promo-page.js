const promoGrid = document.getElementById('promo-grid');
const promoStats = document.getElementById('promo-stats');
const countdownEl = document.getElementById('countdown');

const categoryLabelMap = {
  fashion: 'Fashion',
  home: 'Kebutuhan Rumah',
  beauty: 'Perawatan Diri'
};

const discountByCategory = {
  fashion: 20,
  home: 15,
  beauty: 30
};

function rupiah(value) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
}

function promoDeadline() {
  const now = new Date();
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  end.setDate(now.getDate() + ((7 - now.getDay()) % 7 || 7));
  return end;
}

function startCountdown() {
  const endTime = promoDeadline().getTime();

  function tick() {
    const remaining = Math.max(0, endTime - Date.now());
    const hours = String(Math.floor(remaining / (1000 * 60 * 60))).padStart(2, '0');
    const minutes = String(Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
    const seconds = String(Math.floor((remaining % (1000 * 60)) / 1000)).padStart(2, '0');
    countdownEl.textContent = `${hours}:${minutes}:${seconds}`;
  }

  tick();
  setInterval(tick, 1000);
}

function renderStats(promos) {
  const maxDiscount = promos.reduce((max, item) => Math.max(max, item.discount), 0);
  const totalSave = promos.reduce((sum, item) => sum + item.saveAmount, 0);

  const stats = [
    { label: 'Produk Promo', value: promos.length, suffix: 'item' },
    { label: 'Diskon Tertinggi', value: maxDiscount, suffix: '%' },
    { label: 'Total Hemat', value: rupiah(totalSave), suffix: '' },
    { label: 'Kategori Aktif', value: new Set(promos.map((item) => item.category)).size, suffix: 'kategori' }
  ];

  promoStats.innerHTML = stats.map((item) => `
    <article class="rounded-2xl bg-card border border-[#dfe7d4] p-4 shadow-sm">
      <p class="text-xs uppercase tracking-widest text-secondary font-bold">${item.label}</p>
      <p class="mt-2 text-3xl font-extrabold text-primary font-headline">${item.value}</p>
      <p class="text-sm text-secondary">${item.suffix}</p>
    </article>
  `).join('');
}

function renderPromoProducts(promos) {
  promoGrid.innerHTML = promos.map((item) => `
    <article class="bg-surface-container-low rounded-2xl overflow-hidden group hover:shadow-xl transition-shadow duration-300 flex flex-col border border-outline-variant/30">
      <div class="relative aspect-square overflow-hidden bg-surface-container">
        <img src="${item.image}" alt="${item.name}" loading="lazy" decoding="async" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        <div class="absolute top-3 left-3 flex gap-2">
          <span class="bg-[#b71c1c] text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide">Diskon ${item.discount}%</span>
        </div>
        <div class="absolute top-3 right-3 w-8 h-8 bg-white/85 backdrop-blur rounded-full flex items-center justify-center text-error">
          <span class="material-symbols-outlined text-sm">local_offer</span>
        </div>
      </div>
      <div class="p-4 space-y-2 flex flex-col flex-1">
        <p class="text-[10px] font-bold text-secondary uppercase tracking-tighter">${categoryLabelMap[item.category] || item.category}</p>
        <h3 class="text-[#1d1c10] font-bold text-sm line-clamp-2 leading-snug flex-1">${item.name}</h3>
        <div class="flex items-center gap-2 mt-auto">
          <span class="text-lg font-extrabold text-primary">${rupiah(item.promoPrice)}</span>
          <span class="text-xs text-gray-500 line-through">${rupiah(item.price)}</span>
        </div>
        <p class="text-xs text-[#7f3f00] font-semibold">Hemat ${rupiah(item.saveAmount)}</p>
        <a href="dashboard.html" class="w-full bg-[#925100] text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 mt-2 hover:bg-[#703d00] transition-colors active:scale-95 shadow-sm">
          <span class="material-symbols-outlined text-sm">shopping_bag</span>
          Ambil Promo
        </a>
      </div>
    </article>
  `).join('');
}

async function initPromoPage() {
  startCountdown();

  try {
    const response = await fetch('/data/products.json');
    if (!response.ok) throw new Error('Gagal memuat data produk.');

    const payload = await response.json();
    const products = payload.products || [];

    const promos = products.slice(0, 9).map((item) => {
      const discount = discountByCategory[item.category] || 10;
      const promoPrice = Math.round(item.price * (1 - discount / 100));

      return {
        ...item,
        discount,
        promoPrice,
        saveAmount: item.price - promoPrice
      };
    });

    renderStats(promos);
    renderPromoProducts(promos);
  } catch (_error) {
    promoGrid.innerHTML = '<div class="col-span-full rounded-2xl bg-[#fff5f2] border border-[#ffd8c9] p-6 text-[#8b3e1b] font-semibold">Data promo gagal dimuat. Coba reload halaman.</div>';
  }
}

initPromoPage();
