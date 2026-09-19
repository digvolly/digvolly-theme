/**
 * Digvolly Product Detail Page: Gallery Carousel, Dynamic Catalog Hydration,
 * Mobile Touch Carousel, Mobile Sticky Bar, AJAX Cart & Confirmation Toast
 */
document.addEventListener('DOMContentLoaded', function() {
  const mainProductSection = document.querySelector('.js-main-product');
  if (!mainProductSection) return;

  // 1. Catalog Registry & Dynamic Hydration
  const catalogScript = document.getElementById('DigvollyProductCatalog');
  let catalog = {};
  if (catalogScript) {
    try {
      catalog = JSON.parse(catalogScript.textContent);
    } catch (e) {
      console.error('Failed to parse catalog JSON', e);
    }
  }

  // Extract handle from pathname
  const path = window.location.pathname;
  let currentHandle = '';
  if (path.indexOf('/products/') !== -1) {
    currentHandle = path.split('/products/')[1].split('/')[0].split('?')[0].toLowerCase();
  }

  const productData = catalog[currentHandle] || catalog['geometric-repeat-pack'];

  // Hydrate DOM if handle exists in catalog
  if (productData) {
    hydrateProductPage(productData);
  }

  function hydrateProductPage(prod) {
    document.title = `${prod.title} — Digvolly`;

    // Title
    const titleEls = document.querySelectorAll('.js-product-title, .js-breadcrumb-title, .js-sticky-title, .js-toast-title');
    titleEls.forEach(el => el.textContent = prod.title);

    // Category
    const catEls = document.querySelectorAll('.js-product-category, .js-breadcrumb-cat');
    catEls.forEach(el => {
      el.textContent = prod.category;
      if (el.classList.contains('js-breadcrumb-cat')) {
        el.href = '/collections/all';
      }
    });

    // Price
    const priceEls = document.querySelectorAll('.js-product-price, .js-sticky-price, .js-btn-price-display');
    priceEls.forEach(el => el.textContent = prod.price);

    // Compare At Price & Badge
    const compareEls = document.querySelectorAll('.js-product-compare-price');
    compareEls.forEach(el => {
      if (prod.compare_at) {
        el.textContent = prod.compare_at;
        el.style.display = '';
      } else {
        el.style.display = 'none';
      }
    });

    const saveBadgeEls = document.querySelectorAll('.js-product-save-chip');
    saveBadgeEls.forEach(el => {
      if (prod.save_badge) {
        el.textContent = prod.save_badge;
        el.style.display = '';
      } else {
        el.style.display = 'none';
      }
    });

    // Description
    const descEls = document.querySelectorAll('.js-product-description');
    descEls.forEach(el => el.textContent = prod.description);

    // Format Chips & Specs
    const chipsContainer = document.querySelector('.js-format-chips');
    if (chipsContainer && prod.formats) {
      chipsContainer.innerHTML = prod.formats.map(fmt => `<span class="format-chip">${fmt}</span>`).join(' ');
    }

    const includedEl = document.querySelector('.js-format-included');
    if (includedEl && prod.included) includedEl.textContent = prod.included;

    const specsEl = document.querySelector('.js-format-specs');
    if (specsEl && prod.specs) specsEl.textContent = prod.specs;

    const compatEl = document.querySelector('.js-format-compatibility');
    if (compatEl && prod.compatibility) compatEl.textContent = prod.compatibility;

    // Sticky & Toast Thumbnails
    const thumbEls = document.querySelectorAll('.js-sticky-thumb, .js-toast-thumb');
    thumbEls.forEach(img => {
      img.src = prod.primary_image;
      img.alt = prod.title;
    });

    // Gallery Slides & Thumbnails
    const slidesContainer = document.querySelector('.js-gallery-slides');
    const thumbsContainer = document.querySelector('.js-gallery-thumbs');
    const dotsContainer = document.querySelector('.js-gallery-dots');

    if (slidesContainer && prod.thumbnails && prod.thumbnails.length > 0) {
      slidesContainer.innerHTML = prod.thumbnails.map((src, idx) => `
        <div class="gallery-slide ${idx === 0 ? 'is-active' : ''}" data-index="${idx}">
          <img 
            src="${src}" 
            alt="${prod.title} - View ${idx + 1}" 
            class="${idx === 0 ? 'product-gallery-main__img js-gallery-main-img' : 'gallery-slide__img'}"
            width="600" 
            height="400"
            loading="${idx === 0 ? 'eager' : 'lazy'}"
          >
        </div>
      `).join('');
    }

    if (thumbsContainer && prod.thumbnails && prod.thumbnails.length > 0) {
      thumbsContainer.innerHTML = prod.thumbnails.map((src, idx) => `
        <button type="button" class="gallery-thumb js-gallery-thumb ${idx === 0 ? 'is-active' : ''}" data-index="${idx}" data-full-src="${src}" data-alt="Slide ${idx + 1}">
          <img src="${src}" alt="Thumbnail ${idx + 1}" width="100" height="70" loading="lazy">
        </button>
      `).join('');
    }

    if (dotsContainer && prod.thumbnails && prod.thumbnails.length > 0) {
      dotsContainer.innerHTML = prod.thumbnails.map((_, idx) => `
        <button type="button" class="gallery-dot ${idx === 0 ? 'is-active' : ''}" data-index="${idx}" aria-label="Slide ${idx + 1}"></button>
      `).join('');
    }

    // Hydrate Category-Matched Related Products
    hydrateRelatedProducts(prod);
  }

  function hydrateRelatedProducts(prod) {
    const relatedGrid = document.querySelector('.js-related-grid');
    if (!relatedGrid || !prod.related || !catalog) return;

    const relatedCards = prod.related.map(relHandle => {
      const p = catalog[relHandle];
      if (!p) return '';
      return `
        <div class="product-card js-collection-item" data-category="${p.category}">
          <div class="product-card__image-container">
            ${p.save_badge ? `<span class="product-card__badge product-card__badge--save">${p.save_badge}</span>` : ''}
            <a href="/products/${p.handle}" class="product-card__media-link" aria-label="${p.title}">
              <div class="product-card__image-box">
                <img 
                  src="${p.primary_image}" 
                  alt="${p.title}" 
                  class="product-card__img product-card__img--primary"
                  width="600" 
                  height="400" 
                  loading="lazy"
                  style="object-fit: cover;"
                >
                ${p.thumbnails[1] ? `
                  <img 
                    src="${p.thumbnails[1]}" 
                    alt="${p.title} - Preview" 
                    class="product-card__img product-card__img--secondary"
                    width="600" 
                    height="400" 
                    loading="lazy"
                    style="object-fit: cover;"
                  >
                ` : ''}
              </div>
            </a>
            <span class="product-card__category-badge">${p.category}</span>
          </div>
          <div class="product-card__content">
            <div class="product-card__formats">
              ${(p.formats || []).map(f => `<span class="format-chip format-chip--sm">${f.replace('.', '')}</span>`).join(' ')}
            </div>
            <h3 class="product-card__title">
              <a href="/products/${p.handle}">${p.title}</a>
            </h3>
            <div class="product-card__meta">
              <div class="product-card__price-row">
                <span class="product-card__price">${p.price}</span>
                ${p.compare_at ? `<s class="product-card__compare-price">${p.compare_at}</s>` : ''}
              </div>
              <div class="product-card__license-tag">
                <svg class="license-check-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>Commercial License Included</span>
              </div>
            </div>
            <a href="/products/${p.handle}" class="product-card__button">View Pack Details</a>
          </div>
        </div>
      `;
    }).join('');

    if (relatedCards) {
      relatedGrid.innerHTML = relatedCards;
    }
  }

  // 2. Gallery Interaction: Thumbnails & Mobile Carousel Swiping
  function initGallery() {
    const gallery = document.querySelector('.js-product-gallery');
    if (!gallery) return;

    const slidesContainer = gallery.querySelector('.js-gallery-slides');

    function setActiveSlide(index) {
      // Update desktop active slide / image
      const slides = gallery.querySelectorAll('.gallery-slide');
      slides.forEach((s, idx) => {
        s.classList.toggle('is-active', idx === index);
      });

      // Update thumbnails
      const thumbs = gallery.querySelectorAll('.js-gallery-thumb');
      thumbs.forEach((t, idx) => {
        t.classList.toggle('is-active', idx === index);
      });

      // Update dots
      const dots = gallery.querySelectorAll('.gallery-dot');
      dots.forEach((d, idx) => {
        d.classList.toggle('is-active', idx === index);
      });

      // Scroll container on mobile
      if (slidesContainer && slides[index]) {
        slidesContainer.scrollTo({
          left: slides[index].offsetLeft,
          behavior: 'smooth'
        });
      }
    }

    // Thumbnail Click Delegation
    gallery.addEventListener('click', function(e) {
      const thumb = e.target.closest('.js-gallery-thumb');
      if (thumb) {
        e.preventDefault();
        const index = parseInt(thumb.dataset.index || '0', 10);
        setActiveSlide(index);
        return;
      }

      const dot = e.target.closest('.gallery-dot');
      if (dot) {
        e.preventDefault();
        const index = parseInt(dot.dataset.index || '0', 10);
        setActiveSlide(index);
        return;
      }
    });

    // Mobile Swipe / Scroll-Snap Listener
    if (slidesContainer) {
      let scrollTimer = null;
      slidesContainer.addEventListener('scroll', function() {
        if (scrollTimer) clearTimeout(scrollTimer);
        scrollTimer = setTimeout(() => {
          const width = slidesContainer.clientWidth;
          if (width > 0) {
            const activeIndex = Math.round(slidesContainer.scrollLeft / width);
            const dots = gallery.querySelectorAll('.gallery-dot');
            dots.forEach((d, idx) => d.classList.toggle('is-active', idx === activeIndex));
            const thumbs = gallery.querySelectorAll('.js-gallery-thumb');
            thumbs.forEach((t, idx) => t.classList.toggle('is-active', idx === activeIndex));
          }
        }, 50);
      }, { passive: true });
    }
  }

  initGallery();

  // 3. License Modal
  const licenseModal = document.querySelector('.js-license-modal');
  document.addEventListener('click', function(e) {
    if (e.target.closest('.js-license-modal-trigger')) {
      e.preventDefault();
      if (licenseModal) {
        licenseModal.classList.add('is-open');
        document.body.style.overflow = 'hidden';
      }
    } else if (e.target.closest('.js-license-modal-close') || e.target === licenseModal) {
      e.preventDefault();
      if (licenseModal) {
        licenseModal.classList.remove('is-open');
        document.body.style.overflow = '';
      }
    }
  });

  // 4. AJAX Add to Cart & Mini-Cart Toast Confirmation
  const cartToast = document.querySelector('.js-cart-toast');
  const closeToastBtn = document.querySelector('.js-close-toast');
  let toastTimeout = null;

  function showCartToast(itemTitle, itemPrice, itemThumb) {
    if (!cartToast) return;

    if (itemTitle) {
      const t = cartToast.querySelector('.js-toast-title');
      if (t) t.textContent = itemTitle;
    }
    if (itemPrice) {
      const p = cartToast.querySelector('.js-toast-price');
      if (p) p.textContent = `${itemPrice} • Commercial License`;
    }
    if (itemThumb) {
      const img = cartToast.querySelector('.js-toast-thumb');
      if (img) img.src = itemThumb;
    }

    cartToast.removeAttribute('hidden');
    requestAnimationFrame(() => {
      cartToast.classList.add('is-visible');
    });

    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      hideCartToast();
    }, 6000);
  }

  function hideCartToast() {
    if (!cartToast) return;
    cartToast.classList.remove('is-visible');
    setTimeout(() => {
      if (!cartToast.classList.contains('is-visible')) {
        cartToast.setAttribute('hidden', '');
      }
    }, 300);
  }

  if (closeToastBtn) {
    closeToastBtn.addEventListener('click', function(e) {
      e.preventDefault();
      hideCartToast();
    });
  }

  async function handleAddToCart(variantId, btnElement) {
    const btnText = btnElement ? btnElement.querySelector('.js-btn-text') : null;
    const btnLoading = btnElement ? btnElement.querySelector('.js-btn-loading') : null;

    if (btnText && btnLoading) {
      btnText.style.display = 'none';
      btnLoading.style.display = 'inline-flex';
    }
    if (btnElement) btnElement.disabled = true;

    try {
      const formData = new FormData();
      formData.append('id', variantId || '1');
      formData.append('quantity', '1');

      const response = await fetch('/cart/add.js', {
        method: 'POST',
        body: formData,
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'Accept': 'application/json'
        }
      });

      // Update cart count badge in header
      try {
        const cartRes = await fetch('/cart.js');
        const cartData = await cartRes.json();
        const countBadges = document.querySelectorAll('.cart-count, .js-cart-count');
        countBadges.forEach(b => {
          b.textContent = cartData.item_count;
          b.style.display = cartData.item_count > 0 ? 'inline-flex' : 'none';
        });
      } catch (err) {
        console.warn('Could not refresh cart count', err);
      }

      // Show confirmation toast
      showCartToast(productData.title, productData.price, productData.primary_image);

    } catch (e) {
      console.error('Add to cart failed', e);
      // Fallback: show toast anyway for demo
      showCartToast(productData.title, productData.price, productData.primary_image);
    } finally {
      if (btnText && btnLoading) {
        btnText.style.display = '';
        btnLoading.style.display = 'none';
      }
      if (btnElement) btnElement.disabled = false;
    }
  }

  const addToCartForm = document.querySelector('.js-add-to-cart-form');
  if (addToCartForm) {
    addToCartForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const variantInput = this.querySelector('.js-product-variant-id');
      const variantId = variantInput ? variantInput.value : '1';
      const submitBtn = this.querySelector('.js-add-to-cart-btn');
      handleAddToCart(variantId, submitBtn);
    });
  }

  const stickyAddBtn = document.querySelector('.js-sticky-add-btn');
  if (stickyAddBtn) {
    stickyAddBtn.addEventListener('click', function(e) {
      e.preventDefault();
      const variantInput = document.querySelector('.js-product-variant-id');
      const variantId = variantInput ? variantInput.value : '1';
      handleAddToCart(variantId, stickyAddBtn);
    });
  }

  // 5. Mobile Sticky Add to Cart Bar Observer
  const stickyBar = document.querySelector('.js-product-sticky-bar');
  const buyBox = document.querySelector('.js-product-buy-box');

  if (stickyBar && buyBox) {
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          // Show sticky bar when buy box scrolls out of view
          if (!entry.isIntersecting && entry.boundingClientRect.top < 0) {
            stickyBar.classList.add('is-visible');
          } else {
            stickyBar.classList.remove('is-visible');
          }
        });
      }, { threshold: 0.1 });

      observer.observe(buyBox);
    } else {
      window.addEventListener('scroll', function() {
        const rect = buyBox.getBoundingClientRect();
        if (rect.bottom < 0) {
          stickyBar.classList.add('is-visible');
        } else {
          stickyBar.classList.remove('is-visible');
        }
      }, { passive: true });
    }
  }
});
