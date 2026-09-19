/**
 * Digvolly Collection Multi-Facet Filtering, Mobile Drawer & View Toggle
 */
document.addEventListener('DOMContentLoaded', function() {
  const collectionWrapper = document.querySelector('.collection-wrapper');
  if (!collectionWrapper) return;

  const cards = collectionWrapper.querySelectorAll('.js-collection-item');
  const filterCheckboxes = collectionWrapper.querySelectorAll('.js-filter-checkbox');
  const clearFiltersBtns = collectionWrapper.querySelectorAll('.js-clear-filters');
  const activeCountEl = collectionWrapper.querySelector('.js-active-filter-count');
  const resultsCountEl = collectionWrapper.querySelector('.js-results-count');
  const viewGridBtn = collectionWrapper.querySelector('.js-view-grid');
  const viewMasonryBtn = collectionWrapper.querySelector('.js-view-masonry');
  const productsContainer = collectionWrapper.querySelector('.js-products-container');

  // Mobile Bottom Sheet Elements
  const filterDrawer = collectionWrapper.querySelector('.js-collection-sidebar');
  const openDrawerBtn = collectionWrapper.querySelector('.js-open-filter-drawer');
  const closeDrawerBtns = collectionWrapper.querySelectorAll('.js-close-filter-drawer');
  const mobileFilterBadge = collectionWrapper.querySelector('.js-mobile-filter-count');
  const sheetActivePill = collectionWrapper.querySelector('.js-sheet-active-pill');
  const accordionToggles = collectionWrapper.querySelectorAll('.js-filter-accordion-toggle');

  function openDrawer() {
    if (!filterDrawer) return;
    filterDrawer.style.display = 'block';
    requestAnimationFrame(() => {
      filterDrawer.classList.add('is-open');
      document.body.classList.add('mobile-filter-open');
      if (openDrawerBtn) openDrawerBtn.setAttribute('aria-expanded', 'true');
    });
  }

  function closeDrawer() {
    if (!filterDrawer) return;
    filterDrawer.classList.remove('is-open');
    document.body.classList.remove('mobile-filter-open');
    if (openDrawerBtn) openDrawerBtn.setAttribute('aria-expanded', 'false');
    setTimeout(() => {
      if (!filterDrawer.classList.contains('is-open')) {
        filterDrawer.style.display = '';
      }
    }, 320);
  }

  if (openDrawerBtn) {
    openDrawerBtn.addEventListener('click', function(e) {
      e.preventDefault();
      openDrawer();
    });
  }

  closeDrawerBtns.forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      closeDrawer();
    });
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && filterDrawer && filterDrawer.classList.contains('is-open')) {
      closeDrawer();
    }
  });

  // Collapsible Accordion Groups
  accordionToggles.forEach(toggle => {
    toggle.addEventListener('click', function(e) {
      e.preventDefault();
      const group = this.closest('.js-filter-accordion');
      if (!group) return;
      const willOpen = !group.classList.contains('is-open');
      group.classList.toggle('is-open', willOpen);
      this.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
    });
  });

  function getActiveFilters() {
    const active = {
      category: [],
      style: [],
      format: []
    };

    filterCheckboxes.forEach(cb => {
      if (cb.checked) {
        const group = cb.dataset.group;
        const val = cb.value.toLowerCase();
        if (active[group]) {
          active[group].push(val);
        }
      }
    });

    return active;
  }

  function applyFilters() {
    const filters = getActiveFilters();
    const totalActive = filters.category.length + filters.style.length + filters.format.length;

    // Desktop clear button text
    if (activeCountEl) {
      activeCountEl.textContent = totalActive > 0 ? `(${totalActive})` : '';
    }

    clearFiltersBtns.forEach(btn => {
      if (btn.classList.contains('clear-filters-btn')) {
        btn.style.display = totalActive > 0 ? 'inline-block' : 'none';
      }
    });

    // Mobile trigger button count badge
    if (mobileFilterBadge) {
      if (totalActive > 0) {
        mobileFilterBadge.textContent = `(${totalActive})`;
        mobileFilterBadge.style.display = 'inline-flex';
        if (openDrawerBtn) {
          openDrawerBtn.classList.add('has-active');
          openDrawerBtn.setAttribute('aria-label', `Filters (${totalActive} active)`);
        }
      } else {
        mobileFilterBadge.textContent = '';
        mobileFilterBadge.style.display = 'none';
        if (openDrawerBtn) {
          openDrawerBtn.classList.remove('has-active');
          openDrawerBtn.setAttribute('aria-label', 'Open filter options');
        }
      }
    }

    // Mobile sheet active pill
    if (sheetActivePill) {
      if (totalActive > 0) {
        sheetActivePill.textContent = `${totalActive} active`;
        sheetActivePill.style.display = 'inline-block';
      } else {
        sheetActivePill.style.display = 'none';
      }
    }

    let visibleCount = 0;

    cards.forEach(card => {
      const cardCategory = (card.dataset.category || '').toLowerCase();
      const cardStyle = (card.dataset.style || '').toLowerCase();
      const cardFormats = (card.dataset.formats || '').toLowerCase();

      const matchCategory = filters.category.length === 0 || filters.category.includes(cardCategory);
      const matchStyle = filters.style.length === 0 || filters.style.some(s => cardStyle.includes(s));
      const matchFormat = filters.format.length === 0 || filters.format.some(f => cardFormats.includes(f));

      if (matchCategory && matchStyle && matchFormat) {
        card.style.display = '';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    if (resultsCountEl) {
      resultsCountEl.textContent = `${visibleCount} asset${visibleCount === 1 ? '' : 's'} found`;
    }
  }

  filterCheckboxes.forEach(cb => {
    cb.addEventListener('change', applyFilters);
  });

  clearFiltersBtns.forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      filterCheckboxes.forEach(cb => cb.checked = false);
      applyFilters();
    });
  });

  // Layout View Switcher: Grid vs Masonry
  if (viewGridBtn && viewMasonryBtn && productsContainer) {
    viewGridBtn.addEventListener('click', function() {
      viewGridBtn.classList.add('is-active');
      viewMasonryBtn.classList.remove('is-active');
      productsContainer.classList.remove('products-container--masonry');
      productsContainer.classList.add('products-container--grid');
    });

    viewMasonryBtn.addEventListener('click', function() {
      viewMasonryBtn.classList.add('is-active');
      viewGridBtn.classList.remove('is-active');
      productsContainer.classList.remove('products-container--grid');
      productsContainer.classList.add('products-container--masonry');
    });
  }

  applyFilters();
});
