/**
 * Digvolly Build-a-Pack Interactive Engine (Rule of 6)
 */
document.addEventListener('DOMContentLoaded', function() {
  const packWrapper = document.querySelector('.build-a-pack-wrapper');
  if (!packWrapper) return;

  const TARGET_COUNT = 6;
  const UNIT_PRICE = 15.00;
  const BUNDLE_PRICE = 29.00;

  const state = {
    selected: new Map(),
    activeFilter: 'all'
  };

  const cards = packWrapper.querySelectorAll('.pack-item-card');
  const countDisplays = packWrapper.querySelectorAll('.js-pack-count');
  const originalValDisplays = packWrapper.querySelectorAll('.js-pack-original-val');
  const finalPriceDisplays = packWrapper.querySelectorAll('.js-pack-final-price');
  const progressFill = packWrapper.querySelector('.js-progress-fill');
  const progressMessage = packWrapper.querySelector('.js-progress-message');
  const progressTrack = packWrapper.querySelector('.pack-progress-track');
  const checkoutButtons = packWrapper.querySelectorAll('.js-pack-checkout-btn');
  const filterButtons = packWrapper.querySelectorAll('.js-pack-filter');
  const toastNotification = packWrapper.querySelector('.js-pack-toast');

  let toastTimer = null;
  function showToast(message) {
    if (!toastNotification) return;
    if (message) {
      const span = toastNotification.querySelector('span');
      if (span) span.textContent = message;
    }
    toastNotification.removeAttribute('hidden');
    toastNotification.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastNotification.classList.remove('is-visible');
      setTimeout(() => toastNotification.setAttribute('hidden', 'true'), 300);
    }, 3200);
  }

  function updateUI() {
    const count = state.selected.size;
    const remaining = TARGET_COUNT - count;
    const percent = Math.min(100, Math.round((count / TARGET_COUNT) * 100));

    // Update Counter Badges
    countDisplays.forEach(el => el.textContent = count);

    // Update Price Comparison
    const totalOriginalVal = count * UNIT_PRICE;
    originalValDisplays.forEach(el => {
      el.textContent = count > 0 ? `$${totalOriginalVal.toFixed(2)} value` : '$0 value';
      if (count === TARGET_COUNT) {
        el.innerHTML = `<s>$${totalOriginalVal.toFixed(2)} value</s>`;
      }
    });

    finalPriceDisplays.forEach(el => {
      el.textContent = `$${BUNDLE_PRICE.toFixed(2)} Pack Price`;
    });

    // Update Progress Bar
    if (progressFill) {
      progressFill.style.width = `${percent}%`;
    }
    if (progressTrack) {
      progressTrack.setAttribute('aria-valuenow', count);
    }

    const CTA_TEXT = `Add Pack to Cart — $${BUNDLE_PRICE.toFixed(2)}`;

    // State: Under 6 items vs Exactly 6 items
    if (count < TARGET_COUNT) {
      // Progress message
      if (progressMessage) {
        progressMessage.textContent = `Select ${remaining} more asset${remaining === 1 ? '' : 's'} to unlock your $${BUNDLE_PRICE} pack price`;
      }

      // Progress bar styling
      if (progressFill) {
        progressFill.classList.remove('is-complete');
      }

      // Checkout Buttons: disabled & grayed out
      checkoutButtons.forEach(btn => {
        btn.setAttribute('disabled', 'true');
        btn.classList.add('button--disabled');
        const label = btn.querySelector('.cta-label');
        if (label) {
          label.textContent = CTA_TEXT;
        } else {
          btn.textContent = CTA_TEXT;
        }
      });

      // Card states: all unselected cards are selectable (not dimmed)
      cards.forEach(card => {
        card.classList.remove('is-disabled');
        card.removeAttribute('aria-disabled');
        const selectBtn = card.querySelector('.pack-item-card__select-btn');
        if (selectBtn) {
          selectBtn.classList.remove('is-disabled');
          selectBtn.removeAttribute('aria-disabled');
        }
      });

    } else {
      // EXACTLY 6 ITEMS (TARGET ACHIEVED)
      if (progressMessage) {
        progressMessage.innerHTML = `<strong>🎉 Pack Complete!</strong> 6 assets unlocked for $${BUNDLE_PRICE.toFixed(2)} flat price (Save 68%)`;
      }

      // Green success look on progress bar
      if (progressFill) {
        progressFill.classList.add('is-complete');
      }

      // Enable Checkout Buttons: fully active brand indigo
      checkoutButtons.forEach(btn => {
        btn.removeAttribute('disabled');
        btn.classList.remove('button--disabled');
        const label = btn.querySelector('.cta-label');
        if (label) {
          label.textContent = CTA_TEXT;
        } else {
          btn.textContent = CTA_TEXT;
        }
      });

      // Disable remaining unselected cards: visually dim (opacity: 0.52, not-allowed)
      cards.forEach(card => {
        const id = card.dataset.id;
        const selectBtn = card.querySelector('.pack-item-card__select-btn');
        if (!state.selected.has(id)) {
          card.classList.add('is-disabled');
          card.setAttribute('aria-disabled', 'true');
          if (selectBtn) {
            selectBtn.classList.add('is-disabled');
            selectBtn.setAttribute('aria-disabled', 'true');
          }
        } else {
          card.classList.remove('is-disabled');
          card.removeAttribute('aria-disabled');
          if (selectBtn) {
            selectBtn.classList.remove('is-disabled');
            selectBtn.removeAttribute('aria-disabled');
          }
        }
      });
    }
  }

  // Handle Card Click & Selection
  cards.forEach(card => {
    function toggleCard() {
      const id = card.dataset.id;
      const variantId = card.dataset.variantId || id;
      const title = card.dataset.title;
      const price = card.dataset.price;

      if (state.selected.has(id)) {
        // Deselect item
        state.selected.delete(id);
        card.classList.remove('is-selected');
        card.setAttribute('aria-checked', 'false');
        updateUI();
      } else {
        // Attempt to select item
        if (state.selected.size >= TARGET_COUNT) {
          // Prevent selecting more than 6!
          card.classList.remove('is-shake');
          void card.offsetWidth; // force reflow for smooth re-trigger
          card.classList.add('is-shake');
          setTimeout(() => card.classList.remove('is-shake'), 450);
          showToast('Pack full (6/6 selected)! Deselect an item first to swap.');
          return;
        }

        // Add item
        state.selected.set(id, { id, variantId, title, price });
        card.classList.add('is-selected');
        card.setAttribute('aria-checked', 'true');
        updateUI();
      }
    }

    card.addEventListener('click', function(e) {
      // If clicking button or card body
      toggleCard();
    });

    card.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleCard();
      }
    });

    const selectBtn = card.querySelector('.pack-item-card__select-btn');
    if (selectBtn) {
      selectBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleCard();
      });
    }
  });

  // Category Filtering
  filterButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      filterButtons.forEach(b => {
        b.classList.remove('is-active');
        b.setAttribute('aria-selected', 'false');
      });
      this.classList.add('is-active');
      this.setAttribute('aria-selected', 'true');

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

  // AJAX Add Pack to Cart
  checkoutButtons.forEach(btn => {
    btn.addEventListener('click', async function(e) {
      e.preventDefault();
      if (state.selected.size !== TARGET_COUNT) {
        showToast(`Please select exactly 6 items (${TARGET_COUNT - state.selected.size} remaining).`);
        return;
      }

      btn.classList.add('is-loading');
      btn.setAttribute('disabled', 'true');
      const label = btn.querySelector('.cta-label');
      const originalText = label ? label.textContent : btn.textContent;
      if (label) label.textContent = 'Adding 6-Pack to Cart...';

      const selectedItems = Array.from(state.selected.values());
      const bundleVariantId = packWrapper.dataset.bundleVariantId || '55438049608022';

      const properties = {
        'Tier': 'Custom 6-Asset Pack',
        'Asset 1': selectedItems[0]?.title || '',
        'Asset 2': selectedItems[1]?.title || '',
        'Asset 3': selectedItems[2]?.title || '',
        'Asset 4': selectedItems[3]?.title || '',
        'Asset 5': selectedItems[4]?.title || '',
        'Asset 6': selectedItems[5]?.title || '',
        '_BundleGroup': `Pack-${Date.now()}`,
        '_SelectedVariants': selectedItems.map(i => i.variantId).join(','),
        '_SelectedIDs': selectedItems.map(i => i.id).join(',')
      };

      const payload = {
        items: [{
          id: bundleVariantId,
          quantity: 1,
          properties: properties
        }]
      };

      try {
        const res = await fetch('/cart/add.js', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          // Success! Redirect to cart
          window.location.href = '/cart';
        } else {
          const errorData = await res.json().catch(() => ({}));
          console.error('Cart add error:', errorData);
          if (errorData.description && errorData.description.includes('variant')) {
            showToast('Bundle setup: Please publish "Custom 6-Asset Pack" to Online Store in Shopify Admin.');
          } else {
            showToast(errorData.description || 'Could not add pack to cart. Please try again.');
          }
        }
      } catch (err) {
        console.error('AJAX add to cart error:', err);
        showToast('Network error while adding pack to cart. Please try again.');
      } finally {
        setTimeout(() => {
          btn.classList.remove('is-loading');
          btn.removeAttribute('disabled');
          if (label) label.textContent = originalText;
        }, 1200);
      }
    });
  });

  // Initial State Render
  updateUI();
});
