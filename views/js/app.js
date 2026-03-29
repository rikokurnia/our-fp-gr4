// FORMATTER
const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(number);
};

// GLOBAL STATE
let products = [];
let cart = JSON.parse(localStorage.getItem('hijaulokal_cart')) || [];
let shippingCost = 0;

// DOM ELEMENTS
const productGrid = document.getElementById('product-grid');
const cartBtn = document.getElementById('cart-btn');
const mobileCartBtn = document.getElementById('mobile-cart-btn');
const closeCartBtn = document.getElementById('close-cart-btn');
const cartDrawer = document.getElementById('cart-drawer');
const cartOverlay = document.getElementById('cart-overlay');
const cartItemsContainer = document.getElementById('cart-items');
const cartBadge = document.getElementById('cart-badge');
const mobileCartBadge = document.getElementById('mobile-cart-badge');
const cartSubtotalEl = document.getElementById('cart-subtotal');
const cartShippingEl = document.getElementById('cart-shipping');
const cartTotalEl = document.getElementById('cart-total');
const shippingCitySelect = document.getElementById('shipping-city');
const calcShippingBtn = document.getElementById('calc-shipping-btn');
const shippingCostDisplay = document.getElementById('shipping-cost-display');

function notify(message, type = 'info') {
    if (typeof window.showToast === 'function') {
        window.showToast(message, type);
        return;
    }
    alert(message);
}

// INIT
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    updateCartUI();
    
    // Event Listeners for Cart Drawer
    cartBtn?.addEventListener('click', toggleCart);
    mobileCartBtn?.addEventListener('click', toggleCart);
    closeCartBtn?.addEventListener('click', toggleCart);
    cartOverlay?.addEventListener('click', toggleCart);

    // Delegate cart item interactions to avoid brittle inline handlers
    productGrid?.addEventListener('click', handleProductGridClick);
    cartItemsContainer?.addEventListener('click', handleCartItemsClick);
    
    // Event Listener for Shipping calc
    calcShippingBtn?.addEventListener('click', handleShippingCalc);
});

// Compatibility fallback for any existing inline usage
window.toggleCart = toggleCart;

/* ================================
   1. PRODUCTS FETCH API (Point 1&3)
================================ */
async function loadProducts() {
    try {
        // Asynchronously fetch from local JSON
        const response = await fetch('/data/products.json');
        if (!response.ok) throw new Error("HTTP error " + response.status);
        const data = await response.json();
        products = data.products || data;
        renderProducts(products);
    } catch (error) {
        console.error("Gagal memuat produk:", error);
        if (productGrid) {
            productGrid.innerHTML = `
                <div class="col-span-full p-8 text-center bg-error-container text-on-error-container rounded-2xl">
                    <span class="material-symbols-outlined text-4xl mb-2">cloud_off</span>
                    <p class="font-bold">Gagal memuat katalog produk.</p>
                    <p class="text-sm">Pastikan Anda menjalankan aplikasi menggunakan Local Server (mis. npx serve .)</p>
                </div>
            `;
        }
    }
}

function renderProducts(items) {
    if (!productGrid) return;
    productGrid.innerHTML = '';
    
    items.forEach(product => {
        const card = document.createElement('article');
        card.className = "bg-surface-container-low rounded-2xl overflow-hidden group hover:shadow-xl transition-shadow duration-300 flex flex-col";
        
        card.innerHTML = `
            <div class="relative aspect-square overflow-hidden bg-surface-container">
                <img src="${product.image}" alt="${product.name}" loading="lazy" decoding="async" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500">
                <div class="absolute top-3 left-3 flex gap-2">
                    <span class="bg-secondary-container text-on-secondary-container text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-sm border border-secondary/10">
                        <span class="material-symbols-outlined text-[12px]" style="font-variation-settings: 'FILL' 1;">eco</span> ${product.eco ? 'Ramah Lingkungan' : 'Reguler'}
                    </span>
                </div>
                <button class="absolute top-3 right-3 w-8 h-8 bg-white/80 backdrop-blur rounded-full flex items-center justify-center text-error opacity-0 group-hover:opacity-100 transition-opacity">
                    <span class="material-symbols-outlined text-sm">favorite</span>
                </button>
            </div>
            <div class="p-4 space-y-2 flex flex-col flex-1">
                <p class="text-[10px] font-bold text-secondary uppercase tracking-tighter">${product.category}</p>
                <h3 class="text-on-background font-bold text-sm line-clamp-2 leading-snug flex-1">${product.name}</h3>
                <div class="flex items-baseline gap-1 mt-auto">
                    <span class="text-xs text-outline font-medium">Rp</span>
                    <span class="text-lg font-extrabold text-primary">${product.price.toLocaleString('id-ID')}</span>
                </div>
                <button data-action="add-to-cart" data-product-id="${product.id}" class="w-full bg-[#925100] text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 mt-2 hover:bg-[#703d00] transition-colors active:scale-95 shadow-sm">
                    <span class="material-symbols-outlined text-sm">shopping_basket</span>
                    Tambah ke Keranjang
                </button>
            </div>
        `;
        productGrid.appendChild(card);
    });
}

/* ================================
   2. SHOPPING CART LOGIC (Point 2)
================================ */
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    
    saveCart();
    updateCartUI();
    
    // Automatically open drawer when adding an item for wow factor
    if(cartDrawer && cartDrawer.classList.contains('translate-x-full')) {
        toggleCart();
    }
}

function updateQty(productId, delta) {
    const item = cart.find(i => i.id === productId);
    if (!item) return;
    
    item.quantity += delta;
    if (item.quantity <= 0) {
        cart = cart.filter(i => i.id !== productId);
    }
    
    saveCart();
    updateCartUI();
}

function removeFromCart(productId) {
    cart = cart.filter(i => i.id !== productId);
    saveCart();
    updateCartUI();
}

function saveCart() {
    localStorage.setItem('hijaulokal_cart', JSON.stringify(cart));
}

function updateCartUI() {
    // Badges update
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (totalItems > 0) {
        if (cartBadge) {
            cartBadge.classList.remove('hidden');
            cartBadge.textContent = String(totalItems);
        }

        if (mobileCartBadge) {
            mobileCartBadge.classList.remove('hidden');
            mobileCartBadge.textContent = String(totalItems);
        }
    } else {
        cartBadge?.classList.add('hidden');
        mobileCartBadge?.classList.add('hidden');
    }

    // Render Cart Items
    if (!cartItemsContainer) return;
    cartItemsContainer.innerHTML = '';
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="flex flex-col items-center justify-center h-full text-center opacity-50 space-y-4 pt-10">
                <span class="material-symbols-outlined text-6xl">production_quantity_limits</span>
                <p class="font-medium text-sm">Keranjang belanja Anda masih kosong.</p>
                <button data-action="close-cart-empty" class="text-primary text-xs font-bold border border-primary px-4 py-1.5 rounded-full hover:bg-primary/5">Pilih Produk</button>
            </div>
        `;
    } else {
        cart.forEach(item => {
            const el = document.createElement('div');
            el.className = "flex gap-4 p-3 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-sm hover:shadow-md transition-shadow";
            el.innerHTML = `
                <div class="w-20 h-20 rounded-xl overflow-hidden bg-surface flex-shrink-0 border border-outline-variant/10">
                    <img src="${item.image}" loading="lazy" decoding="async" class="w-full h-full object-cover">
                </div>
                <div class="flex-1 flex flex-col justify-between overflow-hidden">
                    <div class="pr-6 relative">
                        <h4 class="text-xs font-bold text-on-surface line-clamp-2 leading-tight">${item.name}</h4>
                        <p class="text-[9px] text-secondary font-bold mt-1 uppercase">${item.weight}kg • ${item.eco ? 'ECO-FRIENDLY' : 'REGULER'}</p>
                        <button data-action="remove-item" data-product-id="${item.id}" class="absolute -top-1 -right-1 text-error opacity-50 hover:opacity-100 transition-opacity p-1">
                            <span class="material-symbols-outlined text-[16px]">close</span>
                        </button>
                    </div>
                    <div class="flex justify-between items-center mt-2">
                        <p class="font-extrabold text-primary text-sm">${formatRupiah(item.price)}</p>
                        <div class="flex items-center gap-2 bg-surface-container rounded-lg p-1">
                            <button data-action="decrease-qty" data-product-id="${item.id}" class="w-6 h-6 flex items-center justify-center rounded-md bg-surface-container-lowest hover:bg-white shadow-sm text-on-surface-variant active:scale-95">
                                <span class="material-symbols-outlined text-[10px]">remove</span>
                            </button>
                            <span class="text-xs font-bold w-4 text-center text-on-surface">${item.quantity}</span>
                            <button data-action="increase-qty" data-product-id="${item.id}" class="w-6 h-6 flex items-center justify-center rounded-md bg-surface-container-lowest hover:bg-white shadow-sm text-on-surface-variant active:scale-95">
                                <span class="material-symbols-outlined text-[10px]">add</span>
                            </button>
                        </div>
                    </div>
                </div>
            `;
            cartItemsContainer.appendChild(el);
        });
    }

    calculateTotals();
}

function handleProductGridClick(event) {
    const button = event.target.closest('[data-action="add-to-cart"]');
    if (!button) return;

    const productId = Number(button.dataset.productId);
    if (!Number.isFinite(productId)) return;
    addToCart(productId);
}

function handleCartItemsClick(event) {
    const button = event.target.closest('button[data-action]');
    if (!button) return;

    const action = button.dataset.action;
    const productId = Number(button.dataset.productId);

    if (action === 'close-cart-empty') {
        toggleCart();
        return;
    }

    if (!Number.isFinite(productId)) return;

    if (action === 'remove-item') {
        removeFromCart(productId);
        return;
    }

    if (action === 'decrease-qty') {
        updateQty(productId, -1);
        return;
    }

    if (action === 'increase-qty') {
        updateQty(productId, 1);
    }
}

function toggleCart() {
    if (!cartDrawer || !cartOverlay) return;
    
    if (cartDrawer.classList.contains('translate-x-full')) {
        cartDrawer.classList.remove('translate-x-full');
        cartDrawer.classList.add('translate-x-0');
        cartOverlay.classList.remove('opacity-0', 'pointer-events-none');
        cartOverlay.classList.add('opacity-100');
    } else {
        cartDrawer.classList.add('translate-x-full');
        cartDrawer.classList.remove('translate-x-0');
        cartOverlay.classList.remove('opacity-100');
        cartOverlay.classList.add('opacity-0', 'pointer-events-none');
    }
}

/* ================================
   3. SHIPPING API SIMULATION (Point 4)
================================ */
async function handleShippingCalc() {
    const city = shippingCitySelect?.value;
    if (!city) {
        notify("Pilih kota tujuan pengiriman!", 'error');
        return;
    }
    
    if (cart.length === 0) {
        notify("Keranjang masih kosong.", 'error');
        return;
    }
    
    // UI Loading state
    if(calcShippingBtn) {
        calcShippingBtn.textContent = '...';
        calcShippingBtn.disabled = true;
    }

    try {
        // SIMULASI FETCH KE PUBLIC API (Misal: RajaOngkir, Bindbyte, dll)
        // const apiResponse = await fetch('https://api.example.com/ongkir', { ... });
        // Menggunakan Timeout untuk simulasi network request latency
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock data response based on city (Rp/kg)
        const mockApiRates = {
            'jakarta': 15000,
            'bandung': 25000,
            'surabaya': 45000,
            'medan': 65000,
            'makassar': 85000
        };
        
        // Calculate Total Weight (kg)
        const totalWeightKg = cart.reduce((sum, item) => sum + (item.weight * item.quantity), 0);
        const weightKg = Math.ceil(totalWeightKg) || 1; // Minimal 1 Kg
        
        // Simulate API response calculation
        shippingCost = mockApiRates[city] * weightKg;
        
        // Update UI View
        if(shippingCostDisplay) {
            shippingCostDisplay.textContent = formatRupiah(shippingCost);
            shippingCostDisplay.classList.add('text-[#FF9100]');
        }
        
        calculateTotals();
        
    } catch (e) {
        console.error("Gagal Request API Ongkir:", e);
        notify("Gagal memuat harga pengiriman dari server API.", 'error');
    } finally {
        if(calcShippingBtn) {
            calcShippingBtn.textContent = 'Cek';
            calcShippingBtn.disabled = false;
        }
    }
}

function calculateTotals() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    if(cartSubtotalEl) cartSubtotalEl.textContent = formatRupiah(subtotal);
    if(cartShippingEl) cartShippingEl.textContent = formatRupiah(shippingCost);
    if(cartTotalEl) cartTotalEl.textContent = formatRupiah(subtotal + shippingCost);
    
    // Reset if exactly empty
    if(cart.length === 0) {
        shippingCost = 0;
        if(shippingCitySelect) shippingCitySelect.value = '';
        if(shippingCostDisplay) {
            shippingCostDisplay.textContent = 'Rp 0';
            shippingCostDisplay.classList.remove('text-[#FF9100]');
        }
        if(cartShippingEl) cartShippingEl.textContent = 'Rp 0';
        if(cartTotalEl) cartTotalEl.textContent = 'Rp 0';
    }
}
