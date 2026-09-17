/**
 * Digvolly Build-a-Pack Interactive Tiered Engine
 */
document.addEventListener('DOMContentLoaded', function() {
  const packContainer = document.querySelector('.build-a-pack-wrapper');
  if (!packContainer) return;

  const TIERS = [
    { count: 5, price: 19.00, label: '$19' },
    { count: 10, price: 29.00, label: '$29' },
    { count: 20, price: 49.00, label: '$49' }
  ];

  const state = {
    selected: new Map(),
    activeFilter: 'all'
  };

  const cards = packContainer.querySelectorAll('.pack-item-card');
  const countDisplay = packContainer.querySelectorAll('.js-pack-count');
  const priceDisplay = packContainer.querySelectorAll('.js-pack-price');
  const progressFill = packContainer.querySelector('.js-progress-fill');
  const progressMessage = packContainer.querySelector('.js-progress-message');
  const checkoutButtons = packContainer.querySelectorAll('.js-pack-checkout-btn');
  const filterButtons = packContainer.querySelectorAll('.js-pack-filter');

  function calculateTier(count) {
    if (count < 5) {
      return {
        currentPrice: 0,
        nextTier: TIERS[0],
        needed: 5 - count,
        percent: (count / 5) * 33.3,
        unlocked: false,
        message: `Select ${5 - count} more item${5 - count === 1 ? '' : 's'} to unlock 5 for $19`
      };
    } else if (count < 10) {
      return {
        currentPrice: 19.00,
        nextTier: TIERS[1],
        needed: 10 - count,
        percent: 33.3 + ((count - 5) / 5) * 33.3,
        unlocked: true,
        message: `${count} items selected — unlock 10 for $29 (add ${10 - count} more)`
      };
    } else if (count < 20) {
      return {
        currentPrice: 29.00,
        nextTier: TIERS[2],
        needed: 20 - count,
        percent: 66.6 + ((count - 10) / 10) * 33.4,
        unlocked: true,
        message: `Awesome! 10 items unlocked for $29 — unlock 20 for $49 (add ${20 - count} more)`
      };
    } else {
      return {
        currentPrice: 49.00,
        nextTier: null,
        needed: 0,
        percent: 100,
        unlocked: true,
        message: `Maximum Tier Unlocked! ${count} items for just $49`
      };
    }
  }

  function updateUI() {
    const totalCount = state.selected.size;
    const tier = calculateTier(totalCount);

    countDisplay.forEach(el => el.textContent = totalCount);
    
    priceDisplay.forEach(el => {
      if (totalCount === 0) {
        el.textContent = '$0.00';
      } else {
        el.textContent = `$${tier.currentPrice.toFixed(2)}`;
      }
    });

    if (progressFill) {
      progressFill.style.width = `${Math.min(100, Math.max(0, tier.percent))}%`;
    }

    if (progressMessage) {
      progressMessage.textContent = tier.message;
    }

    checkoutButtons.forEach(btn => {
      if (totalCount >= 5) {
        btn.removeAttribute('disabled');
        btn.classList.remove('button--disabled');
        btn.textContent = `Checkout Custom Pack &bull; $${tier.currentPrice.toFixed(2)}`;
      } else {
        btn.setAttribute('disabled', 'true');
        btn.classList.add('button--disabled');
        btn.textContent = `Select at least 5 items ($${(5 - totalCount)} left)`;
      }
    });
  }

  // Card click selection
  cards.forEach(card => {
    card.addEventListener('click', function(e) {
      // Avoid firing twice if clicking checkbox directly
      if (e.target.tagName.toLowerCase() === 'input') return;

      const id = card.dataset.id;
      const title = card.dataset.title;
      const checkbox = card.querySelector('input[type="checkbox"]');

      if (state.selected.has(id)) {
        state.selected.delete(id);
        card.classList.remove('is-selected');
        if (checkbox) checkbox.checked = false;
      } else {
        state.selected.set(id, { id, title });
        card.classList.add('is-selected');
        if (checkbox) checkbox.checked = true;
      }

      updateUI();
    });

    const checkbox = card.querySelector('input[type="checkbox"]');
    if (checkbox) {
      checkbox.addEventListener('change', function(e) {
        const id = card.dataset.id;
        const title = card.dataset.title;

        if (this.checked) {
          state.selected.set(id, { id, title });
          card.classList.add('is-selected');
        } else {
          state.selected.delete(id);
          card.classList.remove('is-selected');
        }
        updateUI();
      });
    }
  });

  // Filter Pills
  filterButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      filterButtons.forEach(b => b.classList.remove('is-active'));
      this.classList.add('is-active');

      const filter = this.dataset.filter;
      state.activeFilter = filter;

      cards.forEach(card => {
        const category = card.dataset.category;
        if (filter === 'all' || category === filter) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // AJAX Checkout execution
  checkoutButtons.forEach(btn => {
    btn.addEventListener('click', async function(e) {
      e.preventDefault();
      if (state.selected.size < 5) return;

      btn.classList.add('is-loading');
      const originalText = btn.innerHTML;
      btn.innerHTML = 'Adding Pack to Cart...';

      const tier = calculateTier(state.selected.size);
      const items = Array.from(state.selected.values()).map(item => ({
        id: item.id,
        quantity: 1,
        properties: {
          '_PackBundle': 'Custom Pack',
          '_PackTier': `$${tier.currentPrice.toFixed(2)} Tier`
        }
      }));

      try {
        const res = await fetch(window.routes?.cart_add_url || '/cart/add.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: items })
        });

        if (res.ok) {
          window.location.href = window.routes?.cart_url || '/cart';
        } else {
          // Fallback redirect to cart
          window.location.href = window.routes?.cart_url || '/cart';
        }
      } catch (err) {
        console.error('Error adding pack to cart', err);
        window.location.href = window.routes?.cart_url || '/cart';
      } finally {
        btn.classList.remove('is-loading');
        btn.innerHTML = originalText;
      }
    });
  });

  updateUI();
});
