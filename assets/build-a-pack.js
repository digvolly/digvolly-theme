/**
 * Digvolly Build-a-Pack Interactive Engine (Rule of 6)
 */
document.addEventListener('DOMContentLoaded', function() {
  const packWrapper = document.querySelector('.build-a-pack-wrapper');
  if (!packWrapper) return;

  const TARGET_COUNT = 6;

  function parseItemPrice(card) {
    if (!card) return 15.00;
    if (card.dataset.priceCents) {
      const cents = parseInt(card.dataset.priceCents, 10);
      if (!isNaN(cents) && cents > 0) return cents / 100;
    }
    const raw = card.dataset.price || '';
    const num = parseFloat(raw.replace(/[^0-9.]/g, ''));
    return (!isNaN(num) && num > 0) ? num : 15.00;
  }

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

  // Dynamically compute category counts from rendered cards
  const categoryCounts = {
    all: cards.length,
    eBooks: 0,
    'Presentation Templates': 0,
    Patterns: 0
  };
  cards.forEach(card => {
    const cat = card.dataset.category || '';
    if (categoryCounts[cat] !== undefined) {
      categoryCounts[cat]++;
    } else if (cat.toLowerCase().includes('ebook')) {
      categoryCounts.eBooks++;
    } else if (cat.toLowerCase().startsWith('pa')) {
      categoryCounts.Patterns++;
    }
  });
  packWrapper.querySelectorAll('.js-pack-tab-count').forEach(badge => {
    const f = badge.dataset.filter;
    if (categoryCounts[f] !== undefined) {
      badge.textContent = categoryCounts[f];
    }
  });

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

    // Calculate sum of selected item prices
    let totalOriginalVal = 0;
    state.selected.forEach(item => {
      totalOriginalVal += item.price;
    });
    const discountedPackPrice = totalOriginalVal * 0.5;

    // Update Counter Badges
    countDisplays.forEach(el => el.textContent = count);

    // Update Price Comparison Displays
    originalValDisplays.forEach(el => {
      if (count === 0) {
        el.textContent = '$0.00 value';
      } else if (count === TARGET_COUNT) {
        el.innerHTML = `<s>$${totalOriginalVal.toFixed(2)} value</s>`;
      } else {
        el.textContent = `$${totalOriginalVal.toFixed(2)} value`;
      }
    });

    finalPriceDisplays.forEach(el => {
      if (count === 0) {
        el.textContent = '$0.00 Pack Price';
      } else {
        el.textContent = `$${discountedPackPrice.toFixed(2)} Pack Price`;
      }
    });

    // Update Progress Bar
    if (progressFill) {
      progressFill.style.width = `${percent}%`;
    }
    if (progressTrack) {
      progressTrack.setAttribute('aria-valuenow', count);
    }

    // Dynamic CTA Price Label
    let ctaPriceText = '$0.00';
    if (count > 0) {
      ctaPriceText = `$${discountedPackPrice.toFixed(2)}`;
    }
    const CTA_TEXT = `Add Pack to Cart — ${ctaPriceText}`;

    // Under 6 items state vs Exactly 6 items state
    if (count < TARGET_COUNT) {
      // Progress message
      if (progressMessage) {
        progressMessage.textContent = `Select ${remaining} more asset${remaining === 1 ? '' : 's'} to unlock 50% bundle savings`;
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
        progressMessage.innerHTML = `<strong>🎉 Pack Complete!</strong> 6 assets unlocked for $${discountedPackPrice.toFixed(2)} (Save 50%)`;
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
      const title = card.dataset.title || '';
      const price = parseItemPrice(card);

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

      const filter = (this.dataset.filter || '').toLowerCase();
      state.activeFilter = filter;

      cards.forEach(card => {
        const category = (card.dataset.category || '').toLowerCase();
        let match = false;
        if (filter === 'all') {
          match = true;
        } else if (category === filter) {
          match = true;
        } else if (filter === 'ebooks' && category.includes('ebook')) {
          match = true;
        } else if (filter === 'patterns' && category.startsWith('pa')) {
          match = true;
        }
        card.style.display = match ? '' : 'none';
      });
    });
  });

  // AJAX Add 6-Pack to Cart (Option A: 6 separate line items with shared _BundleGroup)
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
      const bundleGroupId = `Pack-${Date.now()}`;

      const payload = {
        items: selectedItems.map((item, index) => ({
          id: item.variantId,
          quantity: 1,
          properties: {
            '_BundleGroup': bundleGroupId,
            '_PackType': 'Custom 6-Asset Pack',
            '_PackIndex': `${index + 1} of 6`,
            'Bundle': 'Custom 6-Asset Pack (50% Off)'
          }
        }))
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
          showToast(errorData.description || 'Could not add pack to cart. Please try again.');
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
