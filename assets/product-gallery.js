/**
 * Digvolly Product Gallery Carousel & License Modal
 */
document.addEventListener('DOMContentLoaded', function() {
  // Gallery Carousel
  const gallery = document.querySelector('.js-product-gallery');
  if (gallery) {
    const mainImg = gallery.querySelector('.js-gallery-main-img');
    const thumbnails = gallery.querySelectorAll('.js-gallery-thumb');

    thumbnails.forEach(thumb => {
      thumb.addEventListener('click', function() {
        thumbnails.forEach(t => t.classList.remove('is-active'));
        this.classList.add('is-active');

        const newSrc = this.dataset.fullSrc;
        const newAlt = this.dataset.alt || '';

        if (mainImg && newSrc) {
          mainImg.style.opacity = '0';
          setTimeout(() => {
            mainImg.src = newSrc;
            mainImg.alt = newAlt;
            mainImg.style.opacity = '1';
          }, 150);
        }
      });
    });
  }

  // License Modal
  const licenseTriggers = document.querySelectorAll('.js-license-modal-trigger');
  const licenseModal = document.querySelector('.js-license-modal');
  const licenseCloses = document.querySelectorAll('.js-license-modal-close');

  licenseTriggers.forEach(trig => {
    trig.addEventListener('click', function(e) {
      e.preventDefault();
      if (licenseModal) {
        licenseModal.classList.add('is-open');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  licenseCloses.forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      if (licenseModal) {
        licenseModal.classList.remove('is-open');
        document.body.style.overflow = '';
      }
    });
  });

  if (licenseModal) {
    licenseModal.addEventListener('click', function(e) {
      if (e.target === licenseModal) {
        licenseModal.classList.remove('is-open');
        document.body.style.overflow = '';
      }
    });
  }
});
