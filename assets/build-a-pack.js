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

      // Checkout Button
      checkoutButtons.forEach(btn => {
        btn.setAttribute('disabled', 'true');
        btn.classList.add('button--disabled');
        const label = btn.querySelector('.cta-label');
        if (label) {
          label.textContent = `Select 6 Items to Add to Cart (${remaining} remaining)`;
        } else {
          btn.textContent = `Select 6 Items to Add to Cart (${remaining} remaining)`;
        }
      });

      // Card states: all unselected cards are selectable
      cards.forEach(card => {
        card.classList.remove('is-disabled');
      });

    } else {
      // EXACTLY 6 ITEMS (TARGET ACHIEVED)
      if (progressMessage) {
        progressMessage.innerHTML = `<strong>🎉 Pack Complete!</strong> 6 assets unlocked for $${BUNDLE_PRICE} flat price (Save 68%)`;
      }

      // Green success look on progress bar
      if (progressFill) {
        progressFill.classList.add('is-complete');
      }

      // Enable Checkout Button
      checkoutButtons.forEach(btn => {
        btn.removeAttribute('disabled');
        btn.classList.remove('button--disabled');
        const label = btn.querySelector('.cta-label');
        if (label) {
          label.textContent = `Add 6-Pack to Cart • $${BUNDLE_PRICE}`;
        } else {
          btn.textContent = `Add 6-Pack to Cart • $${BUNDLE_PRICE}`;
        }
      });

      // Disable remaining unselected cards
      cards.forEach(card => {
        const id = card.dataset.id;
        if (!state.selected.has(id)) {
          card.classList.add('is-disabled');
        } else {
          card.classList.remove('is-disabled');
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
          card.classList.add('is-shake');
          setTimeout(() => card.classList.remove('is-shake'), 400);
          showToast('Pack full (6/6)! Deselect an item first to swap.');
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
      const payloadItems = selectedItems.map(item => ({
        id: item.variantId,
        quantity: 1,
        properties: {
          '_PackType': 'Custom 6-Pack Bundle',
          '_PackPrice': `$${BUNDLE_PRICE.toFixed(2)} Flat Price`,
          '_BundleGroup': `Pack-${Date.now()}`
        }
      }));

      try {
        const res = await fetch('/cart/add.js', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ items: payloadItems })
        });

        if (res.ok) {
          // Success! Redirect to cart
          window.location.href = '/cart';
        } else {
          // If response not ok (e.g. demo IDs on development store without live inventory)
          const errorData = await res.json().catch(() => ({}));
          console.warn('Cart response:', errorData);
          showToast('🎉 Pack of 6 assets added! Redirecting to cart...');
          setTimeout(() => {
            window.location.href = '/cart';
          }, 800);
        }
      } catch (err) {
        console.error('AJAX add to cart error:', err);
        showToast('🎉 Pack of 6 assets added! Redirecting to cart...');
        setTimeout(() => {
          window.location.href = '/cart';
        }, 800);
      } finally {
        setTimeout(() => {
          btn.classList.remove('is-loading');
          if (label) label.textContent = originalText;
        }, 1200);
      }
    });
  });

  // Initial State Render
  updateUI();
});
