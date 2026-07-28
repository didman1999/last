/* ============================================
   STORE PREMIUM — Complete Application JS
   All buttons, filters, cart, wishlist, checkout,
   search, modal — fully functional
   ============================================ */

class StoreApp {
  constructor() {
    this.products = [];
    this.wishlist = JSON.parse(localStorage.getItem('sp_wishlist') || '[]');
    this.cart = JSON.parse(localStorage.getItem('sp_cart') || '[]');
    this.currentLang = localStorage.getItem('sp_lang') || 'ar';
    this.currentPage = this.detectPage();
    this.filteredProducts = [];
    this.activeFilters = { gender: [], scent: [], price: [], category: null };
    this.sortOrder = 'featured';
    this.currentProductId = null;
    this.selectedVariant = null;

    this.init();
  }

  detectPage() {
    const path = window.location.pathname;
    if (path.includes('collection')) return 'collection';
    if (path.includes('product')) return 'product';
    return 'home';
  }

  async init() {
    // Global fallback for broken images
    window.addEventListener('error', function(e) {
      if (e.target.tagName && e.target.tagName.toLowerCase() === 'img') {
        e.target.src = 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=400';
      }
    }, true);

    await this.fetchProducts();
    this.applyLang(this.currentLang);
    this.setupHeader();
    this.setupCart();
    this.setupSearch();
    this.setupWishlist();
    this.setupModals();

    if (this.currentPage === 'home') this.initHomePage();
    if (this.currentPage === 'collection') this.initCollectionPage();
    if (this.currentPage === 'product') this.initProductPage();

    this.renderCartBadge();
    this.setupNewsletterForm();
    this.setupContactBtn();
    this.setupFAQAccordions();
    this.setupAnimations();
    this.setupStoryBtn();
    this.setupCollectionCards();

    // Check if we need to auto-open checkout
    if (window.location.search.includes('checkout=true')) {
      setTimeout(() => this.openCheckout(), 500);
    }
  }

  /* ─────────────────────────────────────────────
     DATA FETCHING
  ───────────────────────────────────────────── */
  async fetchProducts() {
    try {
      const r = await fetch('/data/products.json?v=' + Date.now(), { cache: 'no-store' });
      this.products = await r.json();
      window.productsData = this.products;
      this.filteredProducts = [...this.products];
    } catch (e) {
      console.error('Could not load products:', e);
      this.products = [];
    }
  }

  /* ─────────────────────────────────────────────
     LANGUAGE / i18n
  ───────────────────────────────────────────── */
  get t() {
    return window._translations?.[this.currentLang] || {};
  }

  tr(key) {
    return this.t[key] || window._translations?.en?.[key] || key;
  }

  applyLang(lang) {
    this.currentLang = lang;
    localStorage.setItem('sp_lang', lang);
    const isRtl = lang === 'ar';
    document.documentElement.lang = lang;
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('data-lang', lang);

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      const val = this.tr(key);
      if (val && val !== key) el.textContent = val;
    });

    // Update placeholder attrs
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.dataset.i18nPlaceholder;
      const val = this.tr(key);
      if (val) el.placeholder = val;
    });

    // Sync lang buttons
    document.querySelectorAll('[data-lang]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });

    document.dispatchEvent(new CustomEvent('langChanged', { detail: { lang } }));
  }

  /* ─────────────────────────────────────────────
     HEADER — mobile menu, lang toggle, nav
  ───────────────────────────────────────────── */
  setupHeader() {
    // Language toggle
    document.querySelectorAll('[data-lang]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.applyLang(btn.dataset.lang);
        if (this.currentPage === 'home') {
          this.renderBestsellers();
          this.renderNewArrivals();
          this.renderHimSection();
          this.renderHerSection();
        }
        if (this.currentPage === 'collection') this.renderCollectionGrid();
        if (this.currentPage === 'product') this.renderProductPage(this.products.find(p => p.id === this.currentProductId));
        this.renderCartDrawer();
      });
    });

    // Mobile menu toggle
    const toggle = document.querySelector('.mobile-menu-toggle');
    const mobileMenu = document.getElementById('mobileMenu');
    if (toggle && mobileMenu) {
      toggle.addEventListener('click', () => {
        toggle.classList.toggle('active');
        mobileMenu.classList.toggle('active');
      });
      // Close on link click
      mobileMenu.querySelectorAll('a, button').forEach(el => {
        el.addEventListener('click', () => {
          toggle.classList.remove('active');
          mobileMenu.classList.remove('active');
        });
      });
    }

    // Hero CTA
    const heroCta = document.getElementById('heroCta');
    if (heroCta) {
      heroCta.addEventListener('click', () => {
        const bestsellers = document.getElementById('bestsellers');
        if (bestsellers) bestsellers.scrollIntoView({ behavior: 'smooth' });
      });
    }

    // Scroll-based header styling
    const header = document.querySelector('.site-header');
    if (header) {
      window.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', window.scrollY > 50);
      });
    }

    // Nav active link
    document.querySelectorAll('.header-nav__link, .mobile-menu__link').forEach(link => {
      link.addEventListener('click', function () {
        document.querySelectorAll('.header-nav__link, .mobile-menu__link').forEach(l => l.classList.remove('active'));
        this.classList.add('active');
      });
    });

    // View All / Shop Now buttons
    document.querySelectorAll('[data-goto]').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.goto;
        if (target === 'collection') {
          window.location.href = 'collection.html';
        } else if (target === 'him') {
          window.location.href = 'collection.html?gender=him';
        } else if (target === 'her') {
          window.location.href = 'collection.html?gender=her';
        } else {
          const el = document.getElementById(target);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  setupStoryBtn() {
    document.querySelectorAll('[data-action="open-story"]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.showNotification(
          this.currentLang === 'ar'
            ? 'نحن نعمل على إنشاء صفحة القصة الكاملة قريباً!'
            : 'Our full story page is coming soon!',
          'info'
        );
      });
    });
  }

  setupCollectionCards() {
    document.querySelectorAll('.collection-card[data-filter]').forEach(card => {
      card.addEventListener('click', () => {
        const filter = card.dataset.filter;
        window.location.href = `collection.html?scent=${filter}`;
      });
    });
  }

  /* ─────────────────────────────────────────────
     CART
  ───────────────────────────────────────────── */
  setupCart() {
    // Open cart buttons
    document.addEventListener('click', e => {
      if (e.target.closest('[data-action="open-cart"]')) {
        e.preventDefault();
        this.openCart();
      }
      if (e.target.closest('[data-action="close-cart"]') || e.id === 'cartOverlay') {
        this.closeCart();
      }
      if (e.target.closest('[data-action="add-to-cart"]')) {
        const btn = e.target.closest('[data-action="add-to-cart"]');
        const productId = btn.dataset.id;
        this.addToCart(productId);
      }
      if (e.target.closest('[data-action="checkout"]')) {
        this.openCheckout();
      }
    });

    const overlay = document.getElementById('cartOverlay');
    if (overlay) overlay.addEventListener('click', () => this.closeCart());

    const closeBtn = document.getElementById('cartCloseBtn');
    if (closeBtn) closeBtn.addEventListener('click', () => this.closeCart());

    // Cart item interactions (qty/remove) delegated
    const cartItemsEl = document.getElementById('cartItems');
    if (cartItemsEl) {
      cartItemsEl.addEventListener('click', e => {
        const removeBtn = e.target.closest('.cart-item__remove');
        if (removeBtn) this.removeFromCart(removeBtn.dataset.id);

        const plusBtn = e.target.closest('.qty-selector__btn--plus');
        if (plusBtn) this.updateCartQty(plusBtn.dataset.id, 1);

        const minusBtn = e.target.closest('.qty-selector__btn--minus');
        if (minusBtn) this.updateCartQty(minusBtn.dataset.id, -1);
      });
    }

    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) checkoutBtn.addEventListener('click', () => this.openCheckout());
  }

  openCart() {
    document.getElementById('cartDrawer')?.classList.add('active');
    document.getElementById('cartOverlay')?.classList.add('active');
    document.body.style.overflow = 'hidden';
    this.renderCartDrawer();
  }

  closeCart() {
    document.getElementById('cartDrawer')?.classList.remove('active');
    document.getElementById('cartOverlay')?.classList.remove('active');
    document.body.style.overflow = '';
  }

  addToCart(productId, variantId = null, quantity = 1) {
    const product = this.products.find(p => p.id === productId);
    if (!product) return;

    let variant = null;
    if (variantId) {
      variant = product.variants?.find(v => v.id === variantId);
    } else if (product.variants?.length) {
      variant = product.variants[0];
    }

    const price = variant ? variant.price : product.price;
    const vId = variant ? variant.id : null;
    const vLabel = variant ? `${variant.size} ${variant.concentration}` : null;

    const existing = this.cart.find(item => item.productId === productId && item.variantId === vId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      this.cart.push({ productId, variantId: vId, variantLabel: vLabel, price, quantity, name: product.name, image: product.image });
    }

    this.saveCart();
    this.renderCartBadge();
    this.showNotification(
      this.currentLang === 'ar' ? '✓ تمت الإضافة إلى السلة' : '✓ Added to cart',
      'success'
    );
    this.openCart();
  }

  removeFromCart(productId) {
    this.cart = this.cart.filter(item => item.productId !== productId || item.variantId !== productId);
    // Find by cartItemKey
    const key = productId;
    this.cart = this.cart.filter(item => item._key !== key);
    this.saveCart();
    this.renderCartDrawer();
    this.renderCartBadge();
  }

  removeCartItem(index) {
    this.cart.splice(index, 1);
    this.saveCart();
    this.renderCartDrawer();
    this.renderCartBadge();
  }

  updateCartQty(index, delta) {
    const idx = parseInt(index);
    if (this.cart[idx]) {
      this.cart[idx].quantity += delta;
      if (this.cart[idx].quantity <= 0) this.cart.splice(idx, 1);
      this.saveCart();
      this.renderCartDrawer();
      this.renderCartBadge();
    }
  }

  getCartTotal() {
    return this.cart.reduce((t, i) => t + i.price * i.quantity, 0);
  }

  getCartCount() {
    return this.cart.reduce((t, i) => t + i.quantity, 0);
  }

  saveCart() {
    localStorage.setItem('sp_cart', JSON.stringify(this.cart));
  }

  renderCartBadge() {
    const badge = document.getElementById('cartCountBadge');
    const count = this.getCartCount();
    if (badge) {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    }
  }

  renderCartDrawer() {
    const lang = this.currentLang;
    const itemsEl = document.getElementById('cartItems');
    const emptyEl = document.getElementById('cartEmptyState');
    const footerEl = document.getElementById('cartFooter');
    const subtotalEl = document.getElementById('cartSubtotal');
    const shippingFill = document.getElementById('cartShippingFill');
    const shippingText = document.getElementById('cartShippingText');

    if (!itemsEl) return;

    const count = this.getCartCount();
    const subtotal = this.getCartTotal();
    const threshold = 2000;

    if (count === 0) {
      emptyEl && (emptyEl.style.display = 'flex');
      itemsEl.style.display = 'none';
      footerEl && (footerEl.style.display = 'none');
    } else {
      emptyEl && (emptyEl.style.display = 'none');
      itemsEl.style.display = 'block';
      footerEl && (footerEl.style.display = 'block');

      itemsEl.innerHTML = this.cart.map((item, idx) => `
        <div class="cart-item">
          <img src="${item.image}" alt="${item.name?.[lang] || item.name || 'Product'}" class="cart-item__image" onerror="this.src='https://images.unsplash.com/photo-1619994121345-b61cd610c5a6?w=100'" style="cursor:pointer" onclick="window.location.href='product.html?id=${item.productId}'">
          <div class="cart-item__details">
            <h4 class="cart-item__name" style="cursor:pointer" onclick="window.location.href='product.html?id=${item.productId}'">${item.name?.[lang] || item.name || 'Product'}</h4>
            ${item.variantLabel ? `<div style="font-size:0.75rem;color:var(--text-muted)">${item.variantLabel}</div>` : ''}
            <div class="cart-item__price">EGP ${item.price.toLocaleString()}</div>
            <div class="cart-item__controls">
              <div class="qty-selector" style="height:34px">
                <button class="qty-selector__btn qty-selector__btn--minus" data-id="${idx}">-</button>
                <div class="qty-selector__value">${item.quantity}</div>
                <button class="qty-selector__btn qty-selector__btn--plus" data-id="${idx}">+</button>
              </div>
              <button class="cart-item__remove" data-id="${idx}" onclick="app.removeCartItem(${idx})">
                ${lang === 'ar' ? 'إزالة' : 'Remove'}
              </button>
            </div>
          </div>
        </div>
      `).join('');
    }

    if (subtotalEl) subtotalEl.textContent = `EGP ${subtotal.toLocaleString()}`;

    // Shipping bar
    const pct = Math.min((subtotal / threshold) * 100, 100);
    if (shippingFill) shippingFill.style.width = pct + '%';
    if (shippingText) {
      const rem = threshold - subtotal;
      if (subtotal >= threshold) {
        shippingText.innerHTML = lang === 'ar' ? '🎉 حصلت على شحن مجاني!' : '🎉 You unlocked free shipping!';
      } else {
        shippingText.innerHTML = lang === 'ar'
          ? `أضف <span>EGP ${rem.toLocaleString()}</span> للشحن المجاني`
          : `Add <span>EGP ${rem.toLocaleString()}</span> for free shipping`;
      }
    }

    // Re-bind new cart items
    document.getElementById('cartItems')?.querySelectorAll('.qty-selector__btn--minus, .qty-selector__btn--plus').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = btn.dataset.id;
        const delta = btn.classList.contains('qty-selector__btn--plus') ? 1 : -1;
        this.updateCartQty(idx, delta);
      });
    });
  }

  openCheckout() {
    if (this.cart.length === 0) {
      this.showNotification(this.currentLang === 'ar' ? 'سلتك فارغة!' : 'Your cart is empty!', 'error');
      return;
    }
    this.closeCart();
    this.showCheckoutModal();
  }

  /* ─────────────────────────────────────────────
     WISHLIST
  ───────────────────────────────────────────── */
  setupWishlist() {
    document.addEventListener('click', e => {
      const btn = e.target.closest('[data-action="toggle-wishlist"]');
      if (btn) {
        const id = btn.dataset.id;
        this.toggleWishlist(id, btn);
      }
    });
  }

  toggleWishlist(productId, btn) {
    const idx = this.wishlist.indexOf(productId);
    if (idx === -1) {
      this.wishlist.push(productId);
      if (btn) btn.classList.add('active');
      this.showNotification(
        this.currentLang === 'ar' ? '❤ تمت الإضافة للمفضلة' : '❤ Added to wishlist',
        'success'
      );
    } else {
      this.wishlist.splice(idx, 1);
      if (btn) btn.classList.remove('active');
    }
    localStorage.setItem('sp_wishlist', JSON.stringify(this.wishlist));
    // Update all buttons for this product
    document.querySelectorAll(`[data-action="toggle-wishlist"][data-id="${productId}"]`).forEach(b => {
      b.classList.toggle('active', this.wishlist.includes(productId));
    });
  }

  isWishlisted(id) {
    return this.wishlist.includes(id);
  }

  /* ─────────────────────────────────────────────
     SEARCH
  ───────────────────────────────────────────── */
  setupSearch() {
    document.querySelectorAll('[data-action="open-search"]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.preventDefault();
        document.getElementById('searchOverlay')?.classList.add('active');
        document.getElementById('searchInput')?.focus();
        document.body.style.overflow = 'hidden';
      });
    });

    const overlay = document.getElementById('searchOverlay');
    if (overlay) {
      overlay.addEventListener('click', e => {
        if (e.target === overlay) {
          overlay.classList.remove('active');
          document.body.style.overflow = '';
        }
      });
    }

    document.getElementById('searchCloseBtn')?.addEventListener('click', () => {
      document.getElementById('searchOverlay')?.classList.remove('active');
      document.body.style.overflow = '';
    });

    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    if (!searchInput || !searchResults) return;

    let debounce;
    searchInput.addEventListener('input', () => {
      clearTimeout(debounce);
      debounce = setTimeout(() => {
        const term = searchInput.value.trim().toLowerCase();
        if (term.length < 2) { searchResults.innerHTML = ''; return; }
        const lang = this.currentLang;
        const results = this.products.filter(p =>
          p.name.en.toLowerCase().includes(term) ||
          p.name.ar.includes(term) ||
          p.brand.en.toLowerCase().includes(term) ||
          p.brand.ar.includes(term) ||
          p.description.en.toLowerCase().includes(term)
        ).slice(0, 8);

        if (results.length === 0) {
          searchResults.innerHTML = `<div style="padding:24px;text-align:center;color:var(--text-muted)">${lang === 'ar' ? 'لا توجد نتائج' : 'No results found'}</div>`;
          return;
        }
        searchResults.innerHTML = results.map(p => `
          <div class="search-result-item" onclick="window.location.href='product.html?id=${p.id}'">
            <img src="${p.image}" alt="${p.name[lang]}" class="search-result-item__image" onerror="this.src='https://via.placeholder.com/60'">
            <div class="search-result-item__info">
              <div class="search-result-item__name">${p.name[lang]}</div>
              <div style="font-size:0.75rem;color:var(--text-muted)">${p.brand[lang]}</div>
              <div class="search-result-item__price">EGP ${p.price.toLocaleString()}</div>
            </div>
            <button class="btn btn-primary" style="padding:8px 16px;font-size:0.75rem" onclick="event.stopPropagation();app.addToCart('${p.id}')">
              ${lang === 'ar' ? 'أضف' : 'Add'}
            </button>
          </div>
        `).join('');
      }, 300);
    });

    // Close on Escape
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        document.getElementById('searchOverlay')?.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }

  /* ─────────────────────────────────────────────
     PRODUCT CARD GENERATOR
  ───────────────────────────────────────────── */
  generateProductCard(product, extraClass = '') {
    const lang = this.currentLang;
    const isWished = this.isWishlisted(product.id);
    const badges = [];
    if (product.isNew) badges.push(`<span class="product-card__badge badge-new">${lang === 'ar' ? 'جديد' : 'NEW'}</span>`);
    if (product.isBestseller && !product.isNew) badges.push(`<span class="product-card__badge badge-bestseller">${lang === 'ar' ? 'الأكثر مبيعاً' : 'BESTSELLER'}</span>`);
    if (product.oldPrice) badges.push(`<span class="product-card__badge badge-sale">${lang === 'ar' ? 'تخفيض' : 'SALE'}</span>`);

    const oldPrice = product.oldPrice ? `<span class="product-card__price-old">EGP ${product.oldPrice.toLocaleString()}</span>` : '';
    const stars = '★'.repeat(Math.floor(product.rating)) + (product.rating % 1 >= 0.5 ? '½' : '');
    const stockStatus = product.stock <= 3
      ? `<span style="color:#ef4444;font-size:0.75rem">${lang === 'ar' ? `متبقي ${product.stock} فقط` : `Only ${product.stock} left`}</span>`
      : '';

    return `
      <div class="product-card ${extraClass}" data-id="${product.id}">
        <div class="product-card__image-wrapper">
          <div class="product-card__badges">${badges.join('')}</div>
          <img src="${product.image}" alt="${product.name[lang]}" class="product-card__image" loading="lazy"
            onerror="this.src='https://images.unsplash.com/photo-1619994121345-b61cd610c5a6?w=400'">
          <div class="product-card__actions">
            <button class="product-card__action-btn ${isWished ? 'active' : ''}" data-action="toggle-wishlist" data-id="${product.id}" title="${lang === 'ar' ? 'المفضلة' : 'Wishlist'}">
              <svg width="18" height="18" fill="${isWished ? 'currentColor' : 'none'}" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
            </button>
            <button class="product-card__action-btn" onclick="window.location.href='product.html?id=${product.id}'" title="${lang === 'ar' ? 'عرض سريع' : 'Quick View'}">
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
            </button>
          </div>
        </div>
        <a href="product.html?id=${product.id}" class="product-card__info" style="text-decoration:none;display:block">
          <div class="product-card__brand">${product.brand[lang]}</div>
          <h3 class="product-card__name">${product.name[lang]}</h3>
          <div class="product-card__rating">
            <span class="stars" style="color:var(--gold-primary)">${stars}</span>
            <span>(${product.reviewsCount})</span>
          </div>
          ${stockStatus}
          <div class="product-card__meta">
            <div class="product-card__price">EGP ${product.price.toLocaleString()} ${oldPrice}</div>
          </div>
        </a>
        <button class="product-card__add-btn" data-action="add-to-cart" data-id="${product.id}">
          ${lang === 'ar' ? 'أضف للسلة' : 'Add to Cart'}
        </button>
      </div>
    `;
  }

  /* ─────────────────────────────────────────────
     HOME PAGE
  ───────────────────────────────────────────── */
  initHomePage() {
    this.renderBestsellers();
    this.renderNewArrivals();
    this.renderHimSection();
    this.renderHerSection();
    this.revealAll();

    document.addEventListener('langChanged', () => {
      this.renderBestsellers();
      this.renderNewArrivals();
      this.renderHimSection();
      this.renderHerSection();
      this.revealAll();
    });
  }

  revealAll() {
    // Force all reveal elements visible immediately
    document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach(el => {
      el.classList.add('visible');
    });
  }

  renderBestsellers() {
    const el = document.getElementById('bestsellersGrid');
    if (!el) return;
    const items = this.products.filter(p => p.isBestseller).slice(0, 8);
    el.innerHTML = items.map(p => this.generateProductCard(p)).join('');
  }

  renderNewArrivals() {
    const el = document.getElementById('newArrivalsGrid');
    if (!el) return;
    const items = this.products.filter(p => p.isNew).slice(0, 8);
    el.innerHTML = items.map(p => this.generateProductCard(p)).join('');
  }

  renderHimSection() {
    const el = document.getElementById('himGrid');
    if (!el) return;
    const items = this.products.filter(p => p.gender === 'him').slice(0, 4);
    el.innerHTML = items.map(p => this.generateProductCard(p)).join('');
  }

  renderHerSection() {
    const el = document.getElementById('herGrid');
    if (!el) return;
    const items = this.products.filter(p => p.gender === 'her').slice(0, 4);
    el.innerHTML = items.map(p => this.generateProductCard(p)).join('');
  }

  /* ─────────────────────────────────────────────
     COLLECTION PAGE
  ───────────────────────────────────────────── */
  initCollectionPage() {
    // Read URL params for initial filter
    const params = new URLSearchParams(window.location.search);
    if (params.get('gender')) this.activeFilters.gender = [params.get('gender')];
    if (params.get('scent')) this.activeFilters.scent = [params.get('scent')];
    if (params.get('category')) this.activeFilters.category = params.get('category');

    this.applyFilters();
    this.renderCollectionGrid();
    this.setupFilterPanel();
    this.setupSortDropdown();
    this.setupFilterToggleMobile();
    this.updateCollectionHeader();

    document.addEventListener('langChanged', () => {
      this.renderCollectionGrid();
      this.updateCollectionHeader();
    });
  }

  applyFilters() {
    this.filteredProducts = this.products.filter(p => {
      if (this.activeFilters.gender.length && !this.activeFilters.gender.includes(p.gender)) return false;
      if (this.activeFilters.scent.length && !this.activeFilters.scent.includes(p.scent)) return false;
      if (this.activeFilters.category && !p.category.includes(this.activeFilters.category)) return false;
      if (this.activeFilters.price.length) {
        const inRange = this.activeFilters.price.some(range => {
          if (range === 'under-750') return p.price < 750;
          if (range === '750-1000') return p.price >= 750 && p.price <= 1000;
          if (range === 'over-1000') return p.price > 1000;
          return true;
        });
        if (!inRange) return false;
      }
      return true;
    });

    // Sort
    if (this.sortOrder === 'low') this.filteredProducts.sort((a, b) => a.price - b.price);
    else if (this.sortOrder === 'high') this.filteredProducts.sort((a, b) => b.price - a.price);
    else if (this.sortOrder === 'rating') this.filteredProducts.sort((a, b) => b.rating - a.rating);
    else if (this.sortOrder === 'newest') this.filteredProducts = this.filteredProducts.filter(p => p.isNew).concat(this.filteredProducts.filter(p => !p.isNew));
    else if (this.sortOrder === 'best') this.filteredProducts = this.filteredProducts.filter(p => p.isBestseller).concat(this.filteredProducts.filter(p => !p.isBestseller));
  }

  renderCollectionGrid() {
    const el = document.getElementById('collectionGrid');
    if (!el) return;

    const count = document.getElementById('productsCount');
    if (count) count.textContent = this.currentLang === 'ar'
      ? `${this.filteredProducts.length} منتج`
      : `${this.filteredProducts.length} products`;

    if (this.filteredProducts.length === 0) {
      el.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:var(--text-muted)">
        <div style="font-size:3rem;margin-bottom:16px">🔍</div>
        <p>${this.currentLang === 'ar' ? 'لا توجد منتجات تطابق الفلاتر المختارة' : 'No products match your selected filters.'}</p>
        <button class="btn btn-secondary" style="margin-top:16px" onclick="app.clearAllFilters()">
          ${this.currentLang === 'ar' ? 'مسح الفلاتر' : 'Clear Filters'}
        </button>
      </div>`;
    } else {
      el.innerHTML = this.filteredProducts.map(p => this.generateProductCard(p)).join('');
    }
  }

  updateCollectionHeader() {
    const title = document.getElementById('collectionTitle');
    const desc = document.getElementById('collectionDesc');
    if (!title) return;
    const lang = this.currentLang;
    const gender = this.activeFilters.gender[0];

    const titles = {
      him: { en: 'For Him', ar: 'للرجال' },
      her: { en: 'For Her', ar: 'للنساء' },
      unisex: { en: 'Unisex', ar: 'للجنسين' },
    };
    if (gender && titles[gender]) {
      title.textContent = titles[gender][lang];
    } else {
      title.textContent = lang === 'ar' ? 'جميع العطور' : 'All Fragrances';
    }
    if (desc) {
      desc.textContent = lang === 'ar'
        ? 'استكشف مجموعتنا الكاملة من العطور الفاخرة المستوحاة من أشهر العطور في العالم'
        : 'Explore our complete collection of luxury fragrances inspired by the world\'s most iconic scents';
    }
  }

  setupFilterPanel() {
    // Filter checkboxes
    document.querySelectorAll('[data-filter-type]').forEach(input => {
      input.addEventListener('change', () => {
        const type = input.dataset.filterType;
        const value = input.dataset.filterValue;

        if (!this.activeFilters[type]) this.activeFilters[type] = [];
        if (input.checked) {
          if (!this.activeFilters[type].includes(value)) this.activeFilters[type].push(value);
        } else {
          this.activeFilters[type] = this.activeFilters[type].filter(v => v !== value);
        }

        this.applyFilters();
        this.renderCollectionGrid();
        this.updateActiveFilterCount();
      });
    });

    // Apply filters button
    document.getElementById('applyFiltersBtn')?.addEventListener('click', () => {
      this.applyFilters();
      this.renderCollectionGrid();
      // Close mobile filter
      document.getElementById('filterPanel')?.classList.remove('active');
      document.getElementById('filterOverlay')?.classList.remove('active');
      document.body.style.overflow = '';
    });

    // Clear filters button
    document.getElementById('clearFiltersBtn')?.addEventListener('click', () => this.clearAllFilters());
  }

  clearAllFilters() {
    this.activeFilters = { gender: [], scent: [], price: [], category: null };
    document.querySelectorAll('[data-filter-type]').forEach(i => i.checked = false);
    this.applyFilters();
    this.renderCollectionGrid();
    this.updateActiveFilterCount();
  }

  updateActiveFilterCount() {
    const total = this.activeFilters.gender.length + this.activeFilters.scent.length + this.activeFilters.price.length;
    const badge = document.getElementById('filterCount');
    if (badge) {
      badge.textContent = total;
      badge.style.display = total > 0 ? 'flex' : 'none';
    }
  }

  setupSortDropdown() {
    const select = document.getElementById('sortSelect');
    if (!select) return;
    select.addEventListener('change', () => {
      this.sortOrder = select.value;
      this.applyFilters();
      this.renderCollectionGrid();
    });
  }

  setupFilterToggleMobile() {
    const toggleBtn = document.getElementById('filterToggleBtn');
    const filterPanel = document.getElementById('filterPanel');
    const filterOverlay = document.getElementById('filterOverlay');

    if (toggleBtn && filterPanel) {
      toggleBtn.addEventListener('click', () => {
        filterPanel.classList.toggle('active');
        filterOverlay?.classList.toggle('active');
        document.body.style.overflow = filterPanel.classList.contains('active') ? 'hidden' : '';
      });
    }

    filterOverlay?.addEventListener('click', () => {
      filterPanel?.classList.remove('active');
      filterOverlay.classList.remove('active');
      document.body.style.overflow = '';
    });
  }

  /* ─────────────────────────────────────────────
     PRODUCT PAGE
  ───────────────────────────────────────────── */
  initProductPage() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id') || 'p-001';
    this.currentProductId = id;
    const product = this.products.find(p => p.id === id) || this.products[0];
    if (product) {
      this.renderProductPage(product);
      this.renderRelatedProducts(product);
      // Immediately make the product layout visible (don't wait for IntersectionObserver)
      setTimeout(() => {
        document.querySelectorAll('.product-layout, .product-layout .reveal, .product-layout .reveal-scale').forEach(el => {
          el.classList.add('visible');
        });
        document.querySelector('.product-layout')?.classList.add('visible');
        document.querySelectorAll('section.reveal').forEach(el => el.classList.add('visible'));
      }, 50);
    }

    document.addEventListener('langChanged', () => {
      const p = this.products.find(p => p.id === this.currentProductId);
      if (p) {
        this.renderProductPage(p);
        this.renderRelatedProducts(p);
      }
    });
  }


  renderProductPage(product) {
    if (!product) return;
    const lang = this.currentLang;

    // Title & meta
    document.title = `${product.name[lang]} | Store Premium`;

    // Brand, name, description
    const brandEl = document.getElementById('productBrand');
    const nameEl = document.getElementById('productName');
    const descEl = document.getElementById('productDesc');
    if (brandEl) brandEl.textContent = product.brand[lang];
    if (nameEl) nameEl.textContent = product.name[lang];
    if (descEl) descEl.textContent = product.description[lang];

    // Rating
    const ratingEl = document.getElementById('productRating');
    const ratingCount = document.getElementById('productRatingCount');
    if (ratingEl) ratingEl.textContent = '★'.repeat(Math.floor(product.rating));
    if (ratingCount) ratingCount.textContent = `${product.rating} (${product.reviewsCount} ${lang === 'ar' ? 'تقييم' : 'reviews'})`;

    // Notes
    const topEl = document.getElementById('noteTop');
    const midEl = document.getElementById('noteMiddle');
    const baseEl = document.getElementById('noteBase');
    if (topEl) topEl.textContent = product.notes?.top?.[lang] || '';
    if (midEl) midEl.textContent = product.notes?.middle?.[lang] || '';
    if (baseEl) baseEl.textContent = product.notes?.base?.[lang] || '';

    // Main image
    const mainImg = document.getElementById('productMainImage');
    if (mainImg) {
      mainImg.src = product.image;
      mainImg.alt = product.name[lang];
      mainImg.onerror = () => mainImg.src = 'https://images.unsplash.com/photo-1619994121345-b61cd610c5a6?w=600';
    }

    // Thumbnail gallery
    const gallery = document.getElementById('productGallery');
    if (gallery && product.images) {
      gallery.innerHTML = product.images.map((img, i) => `
        <img src="${img}" class="gallery-thumb ${i === 0 ? 'active' : ''}" 
          onclick="document.getElementById('productMainImage').src='${img}';document.querySelectorAll('.gallery-thumb').forEach(t=>t.classList.remove('active'));this.classList.add('active')"
          onerror="this.style.display='none'" style="cursor:pointer">
      `).join('');
    }

    // Variants
    this.renderVariants(product);

    // Stock status
    const stockEl = document.getElementById('productStock');
    if (stockEl) {
      if (product.stock <= 3) {
        stockEl.textContent = lang === 'ar' ? `متبقي ${product.stock} قطع فقط!` : `Only ${product.stock} left in stock!`;
        stockEl.style.color = '#ef4444';
      } else if (product.stock === 0) {
        stockEl.textContent = lang === 'ar' ? 'نفذ المخزون' : 'Out of Stock';
        stockEl.style.color = '#ef4444';
      } else {
        stockEl.textContent = lang === 'ar' ? '✓ متوفر في المخزون' : '✓ In Stock';
        stockEl.style.color = '#22c55e';
      }
    }

    // Wishlist button state
    const wishBtn = document.getElementById('wishlistBtn');
    if (wishBtn) {
      wishBtn.classList.toggle('active', this.isWishlisted(product.id));
      wishBtn.setAttribute('data-id', product.id);
    }

    // Add to cart button
    const addBtn = document.getElementById('addToCartBtn');
    if (addBtn) {
      addBtn.setAttribute('data-id', product.id);
      addBtn.textContent = lang === 'ar' ? 'أضف للسلة' : 'Add to Cart';
      addBtn.onclick = () => {
        const variant = this.selectedVariant;
        this.addToCart(product.id, variant?.id);
      };
    }

    // Qty selector
    const qtyInput = document.getElementById('qtyInput');
    const qtyPlus = document.getElementById('qtyPlus');
    const qtyMinus = document.getElementById('qtyMinus');
    if (qtyInput && qtyPlus && qtyMinus) {
      qtyPlus.onclick = () => { qtyInput.value = Math.min(parseInt(qtyInput.value) + 1, 10); };
      qtyMinus.onclick = () => { qtyInput.value = Math.max(parseInt(qtyInput.value) - 1, 1); };
    }
  }

  renderVariants(product) {
    const container = document.getElementById('variantSelector');
    if (!container || !product.variants) return;
    const lang = this.currentLang;

    this.selectedVariant = product.variants[0];

    container.innerHTML = `
      <div style="margin-bottom:12px;font-size:0.875rem;color:var(--text-muted)">
        ${lang === 'ar' ? 'الحجم والتركيز:' : 'Size & Concentration:'}
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:8px">
        ${product.variants.map((v, i) => `
          <button class="variant-btn ${i === 0 ? 'active' : ''}" data-variant-id="${v.id}" 
            onclick="app.selectVariant('${product.id}', '${v.id}', this)">
            ${v.size} ${v.concentration}
            ${v.stock <= 3 && v.stock > 0 ? `<span style="color:#ef4444;font-size:0.65rem;display:block">${lang === 'ar' ? 'آخر قطع' : 'Last few'}</span>` : ''}
            ${v.stock === 0 ? `<span style="color:#6b7280;font-size:0.65rem;display:block">${lang === 'ar' ? 'نفذ' : 'OOS'}</span>` : ''}
          </button>
        `).join('')}
      </div>
    `;

    // Update price
    this.updateVariantPrice(product, product.variants[0]);
  }

  selectVariant(productId, variantId, btn) {
    const product = this.products.find(p => p.id === productId);
    if (!product) return;
    const variant = product.variants.find(v => v.id === variantId);
    if (!variant) return;

    this.selectedVariant = variant;

    // Update active state
    document.querySelectorAll('.variant-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    this.updateVariantPrice(product, variant);

    // Update stock for this variant
    const stockEl = document.getElementById('productStock');
    if (stockEl) {
      const lang = this.currentLang;
      if (variant.stock === 0) {
        stockEl.textContent = lang === 'ar' ? 'نفذ المخزون' : 'Out of Stock';
        stockEl.style.color = '#ef4444';
      } else if (variant.stock <= 3) {
        stockEl.textContent = lang === 'ar' ? `متبقي ${variant.stock} فقط!` : `Only ${variant.stock} left!`;
        stockEl.style.color = '#ef4444';
      } else {
        stockEl.textContent = lang === 'ar' ? '✓ متوفر' : '✓ In Stock';
        stockEl.style.color = '#22c55e';
      }
    }
  }

  updateVariantPrice(product, variant) {
    const priceEl = document.getElementById('productPrice');
    const oldPriceEl = document.getElementById('productOldPrice');
    if (priceEl) priceEl.textContent = `EGP ${variant.price.toLocaleString()}`;
    if (oldPriceEl) {
      if (product.oldPrice) {
        oldPriceEl.textContent = `EGP ${product.oldPrice.toLocaleString()}`;
        oldPriceEl.style.display = 'inline';
      } else {
        oldPriceEl.style.display = 'none';
      }
    }
  }

  renderRelatedProducts(product) {
    const el = document.getElementById('relatedGrid');
    if (!el) return;
    const related = this.products
      .filter(p => p.id !== product.id && (p.gender === product.gender || p.scent === product.scent))
      .slice(0, 4);
    el.innerHTML = related.map(p => this.generateProductCard(p)).join('');
  }

  /* ─────────────────────────────────────────────
     MODALS — Login, Register, Checkout, Contact
  ───────────────────────────────────────────── */
  setupModals() {
    // Generic modal close on overlay click
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', e => {
        if (e.target === overlay) overlay.classList.remove('active');
      });
    });

    // Login/Register tabs
    document.getElementById('loginTab')?.addEventListener('click', () => this.switchAuthTab('login'));
    document.getElementById('registerTab')?.addEventListener('click', () => this.switchAuthTab('register'));

    // Auth form submit
    document.getElementById('loginForm')?.addEventListener('submit', e => {
      e.preventDefault();
      this.handleLogin(e.target);
    });
    document.getElementById('registerForm')?.addEventListener('submit', e => {
      e.preventDefault();
      this.handleRegister(e.target);
    });

    // Open login via header
    document.querySelectorAll('[data-action="open-login"]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.getElementById('authModal')?.classList.add('active');
      });
    });

    // Close buttons
    document.querySelectorAll('[data-close-modal]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.getElementById(btn.dataset.closeModal)?.classList.remove('active');
      });
    });
  }

  switchAuthTab(tab) {
    document.getElementById('loginTab')?.classList.toggle('active', tab === 'login');
    document.getElementById('registerTab')?.classList.toggle('active', tab === 'register');
    document.getElementById('loginForm')?.classList.toggle('hidden', tab !== 'login');
    document.getElementById('registerForm')?.classList.toggle('hidden', tab !== 'register');
  }

  handleLogin(form) {
    const email = form.querySelector('[name="email"]').value;
    const pass = form.querySelector('[name="password"]').value;
    if (!email || !pass) {
      this.showNotification(this.currentLang === 'ar' ? 'يرجى ملء جميع الحقول' : 'Please fill all fields', 'error');
      return;
    }
    // Simulate login
    this.showNotification(this.currentLang === 'ar' ? '✓ تم تسجيل الدخول بنجاح!' : '✓ Logged in successfully!', 'success');
    document.getElementById('authModal')?.classList.remove('active');
  }

  handleRegister(form) {
    const name = form.querySelector('[name="name"]').value;
    const email = form.querySelector('[name="email"]').value;
    const pass = form.querySelector('[name="password"]').value;
    if (!name || !email || !pass) {
      this.showNotification(this.currentLang === 'ar' ? 'يرجى ملء جميع الحقول' : 'Please fill all fields', 'error');
      return;
    }
    this.showNotification(this.currentLang === 'ar' ? '✓ تم إنشاء الحساب بنجاح!' : '✓ Account created successfully!', 'success');
    document.getElementById('authModal')?.classList.remove('active');
  }

  showCheckoutModal() {
    const modal = document.getElementById('checkoutModal');
    if (!modal) {
      // If modal is not in DOM (e.g. collection/product page), redirect to index checkout
      window.location.href = 'index.html?checkout=true';
      return;
    }
    const lang = this.currentLang;
    const total = this.getCartTotal();
    const shipping = total >= 2000 ? 0 : 100;
    const grand = total + shipping;

    const orderSummary = document.getElementById('checkoutOrderSummary');
    if (orderSummary) {
      orderSummary.innerHTML = `
        ${this.cart.map(item => `
          <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border-subtle)">
            <div>
              <div style="font-weight:600">${item.name[lang]}</div>
              <div style="font-size:0.75rem;color:var(--text-muted)">${item.variantLabel || ''} × ${item.quantity}</div>
            </div>
            <div style="color:var(--gold-primary)">EGP ${(item.price * item.quantity).toLocaleString()}</div>
          </div>
        `).join('')}
        <div style="display:flex;justify-content:space-between;padding:8px 0">
          <span>${lang === 'ar' ? 'المجموع الفرعي' : 'Subtotal'}</span>
          <span>EGP ${total.toLocaleString()}</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding:8px 0">
          <span>${lang === 'ar' ? 'الشحن' : 'Shipping'}</span>
          <span>${shipping === 0 ? (lang === 'ar' ? 'مجاني' : 'FREE') : `EGP ${shipping}`}</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding:12px 0;font-weight:700;font-size:1.1rem;border-top:1px solid var(--border-subtle);color:var(--gold-primary)">
          <span>${lang === 'ar' ? 'الإجمالي' : 'Total'}</span>
          <span>EGP ${grand.toLocaleString()}</span>
        </div>
      `;
    }

    modal.classList.add('active');

    const form = document.getElementById('checkoutForm');
    if (form) {
      form.onsubmit = (e) => {
        e.preventDefault();
        this.processCheckout(form);
      };
    }
  }

  processCheckout(form) {
    const requiredFields = form.querySelectorAll('[required]');
    let valid = true;
    requiredFields.forEach(f => {
      if (!f.value.trim()) {
        f.style.borderColor = '#ef4444';
        valid = false;
      } else {
        f.style.borderColor = '';
      }
    });

    if (!valid) {
      this.showNotification(this.currentLang === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields', 'error');
      return;
    }

    // Simulate order placement
    const orderNum = Math.floor(Math.random() * 90000) + 10000;
    this.cart = [];
    this.saveCart();
    this.renderCartBadge();
    document.getElementById('checkoutModal')?.classList.remove('active');
    this.showOrderConfirmation(orderNum);
  }

  showOrderConfirmation(orderNum) {
    const lang = this.currentLang;
    const msg = lang === 'ar'
      ? `✓ تم تأكيد طلبك! رقم الطلب: #${orderNum}\nسيصلك بريد إلكتروني بتأكيد الطلب`
      : `✓ Order confirmed! Order #${orderNum}\nA confirmation email will be sent to you`;
    this.showNotification(msg, 'success', 6000);
  }

  /* ─────────────────────────────────────────────
     CONTACT & SUPPORT
  ───────────────────────────────────────────── */
  setupContactBtn() {
    document.querySelectorAll('[data-action="open-contact"]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.getElementById('contactModal')?.classList.add('active');
      });
    });

    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
      contactForm.addEventListener('submit', e => {
        e.preventDefault();
        this.showNotification(
          this.currentLang === 'ar'
            ? '✓ تم إرسال رسالتك! سنرد عليك خلال 24 ساعة'
            : '✓ Message sent! We\'ll reply within 24 hours',
          'success'
        );
        contactForm.reset();
        document.getElementById('contactModal')?.classList.remove('active');
      });
    }
  }

  /* ─────────────────────────────────────────────
     NEWSLETTER
  ───────────────────────────────────────────── */
  setupNewsletterForm() {
    document.querySelectorAll('.newsletter-form').forEach(form => {
      form.addEventListener('submit', e => {
        e.preventDefault();
        const emailInput = form.querySelector('input[type="email"]');
        if (!emailInput?.value) {
          this.showNotification(this.currentLang === 'ar' ? 'يرجى إدخال البريد الإلكتروني' : 'Please enter your email', 'error');
          return;
        }
        this.showNotification(
          this.currentLang === 'ar' ? '✓ تم الاشتراك! شكراً لك' : '✓ Subscribed! Thank you',
          'success'
        );
        emailInput.value = '';
      });
    });

    // Also standalone newsletter buttons
    document.querySelectorAll('[data-action="subscribe"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const input = btn.previousElementSibling;
        if (!input?.value) {
          this.showNotification(this.currentLang === 'ar' ? 'أدخل بريدك الإلكتروني' : 'Enter your email', 'error');
          return;
        }
        this.showNotification(this.currentLang === 'ar' ? '✓ تم الاشتراك!' : '✓ Subscribed!', 'success');
        input.value = '';
      });
    });
  }

  /* ─────────────────────────────────────────────
     FAQ ACCORDIONS
  ───────────────────────────────────────────── */
  setupFAQAccordions() {
    document.querySelectorAll('.accordion-item').forEach(item => {
      const header = item.querySelector('.accordion-header');
      const content = item.querySelector('.accordion-content');
      if (!header || !content) return;

      header.addEventListener('click', () => {
        const isOpen = item.classList.contains('active');
        // Close all others in same parent
        item.closest('.accordion-group, section')?.querySelectorAll('.accordion-item').forEach(other => {
          other.classList.remove('active');
          const c = other.querySelector('.accordion-content');
          if (c) c.style.maxHeight = '0';
        });
        if (!isOpen) {
          item.classList.add('active');
          content.style.maxHeight = content.scrollHeight + 'px';
        }
      });
    });
  }

  /* ─────────────────────────────────────────────
     SCROLL ANIMATIONS
  ───────────────────────────────────────────── */
  setupAnimations() {
    const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -50px 0px' });

    revealEls.forEach(el => observer.observe(el));

    // Fallback: if elements are already in the viewport (e.g. product page top sections),
    // force them visible after a short delay in case the observer missed them.
    // Force all reveal elements visible after a delay
    // This covers elements already in viewport that IntersectionObserver may miss
    setTimeout(() => {
      document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach(el => {
        el.classList.add('visible');
      });
    }, 100);
    // Also run at 600ms to catch any late-rendered dynamic content
    setTimeout(() => this.revealAll?.(), 600);
  }

  /* ─────────────────────────────────────────────
     NOTIFICATION TOAST
  ───────────────────────────────────────────── */
  showNotification(message, type = 'success', duration = 3000) {
    const container = document.getElementById('notifications') || (() => {
      const el = document.createElement('div');
      el.id = 'notifications';
      el.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:99999;display:flex;flex-direction:column;gap:8px;align-items:center;width:min(90vw,400px)';
      document.body.appendChild(el);
      return el;
    })();

    const toast = document.createElement('div');
    const colors = { success: '#22c55e', error: '#ef4444', info: '#3b82f6' };
    toast.style.cssText = `
      background: var(--bg-elevated);
      border: 1px solid ${colors[type] || colors.success};
      border-left: 4px solid ${colors[type] || colors.success};
      color: var(--text-primary);
      padding: 14px 20px;
      border-radius: 10px;
      font-size: 0.9rem;
      box-shadow: 0 8px 32px rgba(0,0,0,0.4);
      transform: translateY(20px);
      opacity: 0;
      transition: all 0.3s ease;
      width: 100%;
      white-space: pre-line;
    `;
    toast.textContent = message;
    container.appendChild(toast);

    requestAnimationFrame(() => {
      toast.style.transform = 'translateY(0)';
      toast.style.opacity = '1';
    });

    setTimeout(() => {
      toast.style.transform = 'translateY(20px)';
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }
}

// Boot
window.app = new StoreApp();
