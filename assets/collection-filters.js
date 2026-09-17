/**
 * Digvolly Collection Multi-Facet Filtering & View Toggle
 */
document.addEventListener('DOMContentLoaded', function() {
  const collectionWrapper = document.querySelector('.collection-wrapper');
  if (!collectionWrapper) return;

  const cards = collectionWrapper.querySelectorAll('.js-collection-item');
  const filterCheckboxes = collectionWrapper.querySelectorAll('.js-filter-checkbox');
  const clearFiltersBtn = collectionWrapper.querySelector('.js-clear-filters');
  const activeCountEl = collectionWrapper.querySelector('.js-active-filter-count');
  const resultsCountEl = collectionWrapper.querySelector('.js-results-count');
  const viewGridBtn = collectionWrapper.querySelector('.js-view-grid');
  const viewMasonryBtn = collectionWrapper.querySelector('.js-view-masonry');
  const productsContainer = collectionWrapper.querySelector('.js-products-container');

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

    if (activeCountEl) {
      activeCountEl.textContent = totalActive > 0 ? `(${totalActive})` : '';
    }

    if (clearFiltersBtn) {
      clearFiltersBtn.style.display = totalActive > 0 ? 'inline-block' : 'none';
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

  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener('click', function(e) {
      e.preventDefault();
      filterCheckboxes.forEach(cb => cb.checked = false);
      applyFilters();
    });
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

  applyFilters();
});
