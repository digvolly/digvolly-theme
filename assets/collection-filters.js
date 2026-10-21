/**
 * Digvolly Collection Navigation, Mobile Drawer & View Toggle
 */
function initCollectionFilters() {
  const collectionWrapper = document.querySelector('.collection-wrapper');
  if (!collectionWrapper) return;

  const filterCheckboxes = collectionWrapper.querySelectorAll('.js-filter-checkbox');
  const clearFiltersBtns = collectionWrapper.querySelectorAll('.js-clear-filters');
  const viewGridBtn = collectionWrapper.querySelector('.js-view-grid');
  const viewMasonryBtn = collectionWrapper.querySelector('.js-view-masonry');
  const productsContainer = collectionWrapper.querySelector('.js-products-container');

  // Mobile Bottom Sheet Elements
  const filterDrawer = collectionWrapper.querySelector('.js-collection-sidebar');
  const openDrawerBtn = collectionWrapper.querySelector('.js-open-filter-drawer');
  const closeDrawerBtns = collectionWrapper.querySelectorAll('.js-close-filter-drawer');
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

  const currentPath = window.location.pathname.replace(/\/+$/, '');
  const isAllCollection = collectionWrapper.dataset.isAll === 'true' || 
                          collectionWrapper.dataset.collectionHandle === 'all' || 
                          currentPath.endsWith('/collections/all') || 
                          currentPath.endsWith('/collections') ||
                          currentPath.indexOf('/collections/all') !== -1 ||
                          currentPath === '/collections/all' || 
                          currentPath === '/collections';

  // Category Checkbox Navigation:
  // On both specific collection pages and /collections/all, selecting a category
  // redirects the browser to that category's real collection URL (e.g. /collections/menus).
  filterCheckboxes.forEach(cb => {
    const isCurrent = cb.dataset.current === 'true' || (!isAllCollection && cb.disabled);

    if (isCurrent) {
      // Locked in checked state for the current category page
      cb.checked = true;
      cb.addEventListener('click', function(e) {
        e.preventDefault();
        return false;
      });
      cb.addEventListener('change', function(e) {
        this.checked = true;
        e.preventDefault();
        return false;
      });
    } else {
      // Unchecked by default on /collections/all and non-current category pages
      cb.checked = false;
      if (cb.removeAttribute) cb.removeAttribute('checked');

      cb.addEventListener('click', function(e) {
        const targetUrl = this.dataset.url;
        if (targetUrl) {
          e.preventDefault();
          window.location.href = targetUrl;
        }
      });

      cb.addEventListener('change', function() {
        const targetUrl = this.dataset.url;
        if (targetUrl) {
          window.location.href = targetUrl;
        }
      });
    }
  });

  // Attach to non-current category labels so clicking text navigates smoothly
  const nonCurrentLabels = collectionWrapper.querySelectorAll('.filter-checkbox-label:not(.is-current)');
  nonCurrentLabels.forEach(label => {
    label.addEventListener('click', function(e) {
      if (e.target && e.target.tagName.toLowerCase() === 'input') return;
      const input = this.querySelector('.js-filter-checkbox');
      if (input && input.dataset.url && input.dataset.current !== 'true') {
        e.preventDefault();
        window.location.href = input.dataset.url;
      }
    });
  });

  // Clear filters button redirects to the full catalog (/collections/all)
  clearFiltersBtns.forEach(btn => {
    if (!isAllCollection && btn.classList.contains('clear-filters-btn')) {
      btn.style.display = 'inline-block';
    } else if (isAllCollection && btn.classList.contains('clear-filters-btn')) {
      btn.style.display = 'none';
    }

    btn.addEventListener('click', function(e) {
      e.preventDefault();
      window.location.href = '/collections/all';
    });
  });

  // On /collections/all: ensure all checkboxes stay unchecked on load and back/forward cache
  if (isAllCollection) {
    function resetAllCheckboxes() {
      filterCheckboxes.forEach(cb => {
        cb.checked = false;
        if (cb.removeAttribute) cb.removeAttribute('checked');
      });
    }

    resetAllCheckboxes();
    window.addEventListener('pageshow', resetAllCheckboxes);
    window.addEventListener('load', resetAllCheckboxes);
  }

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
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCollectionFilters);
} else {
  initCollectionFilters();
}
