import 'lite-youtube-embed';
import BasePage from './base-page';
import Fslightbox from 'fslightbox';
window.fslightbox = Fslightbox;
import { zoom } from './partials/image-zoom';

class Product extends BasePage {
    onReady() {
        app.watchElements({
            totalPrice: '.total-price',
            productWeight: '.product-weight',
            beforePrice: '.before-price',
            startingPriceTitle: '.starting-price-title',
        });

        this.initProductOptionValidations();

        if (typeof imageZoom !== 'undefined' && imageZoom) {
            this.initImagesZooming();
            window.addEventListener('resize', () => this.initImagesZooming());
        }

        this.initMobexPdp();
    }

    /**
     * Mobex PDP: mobile section tabs, accordions, image lightbox.
     */
    initMobexPdp() {
        const host = document.querySelector('.mobex-pdp-panel-host');
        if (!host) {
            return;
        }

        const MOBILE_PDP_MQ = '(max-width: 1023px)';
        const isMobilePdpTabs = () => window.matchMedia(MOBILE_PDP_MQ).matches;

        const tabButtons = document.querySelectorAll('.mobex-pdp-nav-tab[data-mobex-pdp-tab]');
        const panels = document.querySelectorAll('.mobex-pdp-panel[data-mobex-pdp-panel]');

        const setTab = (name, opts = {}) => {
            host.setAttribute('data-mobex-pdp-active', name);
            tabButtons.forEach((btn) => {
                const on = btn.getAttribute('data-mobex-pdp-tab') === name;
                btn.classList.toggle('is-active', on);
                btn.setAttribute('aria-selected', on ? 'true' : 'false');
            });
            panels.forEach((p) => {
                p.classList.toggle('is-active', p.getAttribute('data-mobex-pdp-panel') === name);
            });
            if (isMobilePdpTabs() && opts.scroll !== false) {
                document.getElementById(`mobex-pdp-panel-${name}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        };

        tabButtons.forEach((btn) => {
            btn.addEventListener('click', () => setTab(btn.getAttribute('data-mobex-pdp-tab')));
        });

        setTab(host.getAttribute('data-mobex-pdp-active') || 'image', { scroll: false });

        let resizeT;
        window.addEventListener('resize', () => {
            clearTimeout(resizeT);
            resizeT = setTimeout(() => {
                setTab(host.getAttribute('data-mobex-pdp-active') || 'image', { scroll: false });
            }, 120);
        });

        document.querySelectorAll('.mobex-pdp-summary-accordion .accordion-title').forEach((title) => {
            title.addEventListener('click', () => {
                title.classList.toggle('active');
                title.setAttribute('aria-expanded', title.classList.contains('active') ? 'true' : 'false');
            });
            title.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    title.click();
                }
            });
        });

        document.querySelectorAll('[data-mobex-pdp-goto-reviews]').forEach((a) => {
            a.addEventListener('click', (e) => {
                e.preventDefault();
                if (isMobilePdpTabs()) {
                    setTab('reviews', { scroll: false });
                }
                document.getElementById('mobex-pdp-panel-reviews')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        });

        this.initMobexPdpLightbox();
    }

    initMobexPdpLightbox() {
        const root = document.getElementById('mobex-pdp-lightbox');
        const zoomBtn = document.querySelector('.mobex-pdp-zoom-btn');
        if (!root || !zoomBtn) {
            return;
        }

        const imgEl = root.querySelector('.mobex-pdp-lightbox-img');
        const btnClose = root.querySelector('.mobex-pdp-lightbox-close');
        const btnBack = root.querySelector('.mobex-pdp-lightbox-backdrop');
        const btnPrev = root.querySelector('.mobex-pdp-lightbox-prev');
        const btnNext = root.querySelector('.mobex-pdp-lightbox-next');

        const collectItems = () => {
            const out = [];
            document.querySelectorAll('.mobex-pdp-gallery a[data-fslightbox]').forEach((a) => {
                const type = a.getAttribute('data-type') || 'image';
                if (type !== 'image') {
                    return;
                }
                const href = a.getAttribute('href');
                const im = a.querySelector('img');
                if (!href) {
                    return;
                }
                out.push({ src: href, alt: (im && im.getAttribute('alt')) || '' });
            });
            return out;
        };

        let items = [];
        let idx = 0;

        const showAt = (i) => {
            if (!items.length || !imgEl) {
                return;
            }
            idx = ((i % items.length) + items.length) % items.length;
            imgEl.src = items[idx].src;
            imgEl.alt = items[idx].alt || '';
        };

        const openAt = (i) => {
            items = collectItems();
            if (!items.length) {
                return;
            }
            showAt(typeof i === 'number' ? i : 0);
            root.classList.add('is-open');
            root.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
        };

        const closeLb = () => {
            root.classList.remove('is-open');
            root.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        };

        zoomBtn.addEventListener('click', (e) => {
            e.preventDefault();
            let start = 0;
            const slider = document.querySelector('salla-slider.mobex-pdp-slider');
            if (slider) {
                const swEl = slider.querySelector('.swiper');
                const inst = swEl && swEl.swiper;
                if (inst && typeof inst.activeIndex === 'number') {
                    start = inst.activeIndex;
                }
            }
            openAt(start);
        });

        btnClose?.addEventListener('click', closeLb);
        btnBack?.addEventListener('click', closeLb);
        btnPrev?.addEventListener('click', () => showAt(idx - 1));
        btnNext?.addEventListener('click', () => showAt(idx + 1));

        document.addEventListener('keydown', (e) => {
            if (!root.classList.contains('is-open')) {
                return;
            }
            if (e.key === 'Escape') {
                closeLb();
            }
            if (e.key === 'ArrowLeft') {
                showAt(idx - 1);
            }
            if (e.key === 'ArrowRight') {
                showAt(idx + 1);
            }
        });
    }

    initProductOptionValidations() {
      document.querySelector('.product-form')?.addEventListener('change', function(){
        this.reportValidity() && salla.product.getPrice(new FormData(this));
      });
    }

    initImagesZooming() {
      // skip if the screen is not desktop or if glass magnifier
      // is already crated for the image before
      const imageZoom = document.querySelector('.image-slider .magnify-wrapper.swiper-slide-active .img-magnifier-glass');
      if (window.innerWidth  < 1024 || imageZoom) return;
      setTimeout(() => {
          // set delay after the resizing is done, start creating the glass
          // to create the glass in the proper position
          const image = document.querySelector('.image-slider .swiper-slide-active img');
          zoom(image?.id, 2);
      }, 250);
  

      document.querySelector('salla-slider.details-slider')?.addEventListener('slideChange', () => {
          setTimeout(() => {
              const glass = document.querySelector('.image-slider .swiper-slide-active .img-magnifier-glass');
              if (window.innerWidth < 1024 || glass) {
                  return;
              }
              const image = document.querySelector('.image-slider .magnify-wrapper.swiper-slide-active img');
              zoom(image?.id, 2);
          }, 250);
      });
    }

    registerEvents() {
      salla.event.on('product::price.updated.failed',()=>{
        document.querySelector('.price-wrapper')?.classList.add('hidden');
        const outOfStock = document.querySelector('.out-of-stock');
        if (!outOfStock) {
            return;
        }
        outOfStock.classList.remove('hidden');
        outOfStock.classList.remove('scale-pulse');
        void outOfStock.offsetWidth; // trigger reflow
        outOfStock.classList.add('scale-pulse');
      })
      salla.product.event.onPriceUpdated((res) => {

        document.querySelector('.out-of-stock')?.classList.add('hidden');
        document.querySelector('.price-wrapper')?.classList.remove('hidden');

        let data = res.data,
            is_on_sale = data.has_sale_price && data.regular_price > data.price;

        app.startingPriceTitle?.classList.add('hidden');

        app.productWeight.forEach((el) => {el.innerHTML = data.weight || ''});
        app.totalPrice.forEach((el) => {el.innerHTML = salla.money(data.price)});
        app.beforePrice.forEach((el) => {el.innerHTML = salla.money(data.regular_price)});

        app.toggleClassIf('.price_is_on_sale','showed','hidden', ()=> is_on_sale)
        app.toggleClassIf('.starting-or-normal-price','hidden','showed', ()=> is_on_sale)

        document.querySelectorAll('.total-price, .product-weight').forEach(el => {
          el.classList.remove('scale-pulse');
          void el.offsetWidth; // trigger reflow
          el.classList.add('scale-pulse');
        });
      });

      app.onClick('#btn-show-more', e => app.all('#more-content', div => {
        e.target.classList.add('is-expanded');
        div.style = `max-height:${div.scrollHeight}px`;
      }) || e.target.remove());
    }
}

Product.initiateWhenReady(['product.single']);
