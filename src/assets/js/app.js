import MobileMenu from 'mmenu-light';
import Swal from 'sweetalert2';
import Anime from './partials/anime';
import initTootTip from './partials/tooltip';
import AppHelpers from "./app-helpers";
import { initVehicleDropdowns, selectDisplayText } from './partials/vehicle-dropdowns';

class App extends AppHelpers {
  constructor() {
    super();
    window.app = this;
  }

  loadTheApp() {
    this.commonThings();
    this.initiateNotifier();
    this.initiateMobileMenu();
    if (header_is_sticky) {
      this.initiateStickyMenu();
    }
    this.initAddToCart();
    this.initiateDropdowns();
    this.initiateModals();
    this.initiateCollapse();
    this.initAttachWishlistListeners();
    this.initVehicleFilterModal();
    initVehicleDropdowns();
    this.initHeroSlider();
    setTimeout(() => this.initHeroSlider(), 500);
    this.initHeaderCategorySelect();

    // Ensure #more-menu-dropdown exists before running changeMenuDirection
    const menuDirInterval = setInterval(() => {
      if (document.querySelector('#more-menu-dropdown')) {
        this.changeMenuDirection();
        clearInterval(menuDirInterval);
      }
    }, 100);

    initTootTip();
    this.loadModalImgOnclick();

    salla.comment.event.onAdded(() => window.location.reload());

    this.status = 'ready';
    document.dispatchEvent(new CustomEvent('theme::ready'));
    this.log('Theme Loaded 🎉');
  }

  log(message) {
    salla.log(`ThemeApp(Mobex)::${message}`);
    return this;
  }

    changeMenuDirection() {
      setTimeout(() => {
        app.all('.root-level.has-children', item => {
          if (item.classList.contains('change-menu-dir')) return;
          app.on('mouseover', item, () => {
            let allSubMenus = item.querySelectorAll('.sub-menu');
            allSubMenus.forEach((submenu, idx) => {
              if (idx === 0) return;
              let rect = submenu.getBoundingClientRect();
              if (rect.left < 10 || rect.right > window.innerWidth - 10) {
                app.addClass(item, 'change-menu-dir');
              }
            });
          });
        });
      }, 1000);
    }

  loadModalImgOnclick(){
    document.querySelectorAll('.load-img-onclick').forEach(link => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        let modal = document.querySelector('#' + link.dataset.modalId),
          img = modal.querySelector('img'),
          imgSrc = img.dataset.src;
        modal.open();

        if (img.classList.contains('loaded')) return;

        img.src = imgSrc;
        img.classList.add('loaded');
      })
    })
  }

  commonThings() {
    this.cleanContentArticles('.content-entry');
  }

  cleanContentArticles(elementsSelector) {
    let articleElements = document.querySelectorAll(elementsSelector);

    if (articleElements.length) {
      articleElements.forEach(article => {
        article.innerHTML = article.innerHTML.replace(/\&nbsp;/g, ' ')
      })
    }
  }

isElementLoaded(selector){
  return new Promise((resolve=>{
    const interval=setInterval(()=>{
    if(document.querySelector(selector)){
      clearInterval(interval)
      return resolve(document.querySelector(selector))
    }
   },160)
}))

  
  };

  copyToClipboard(event) {
    event.preventDefault();
    let aux = document.createElement("input"),
    btn = event.currentTarget;
    aux.setAttribute("value", btn.dataset.content);
    document.body.appendChild(aux);
    aux.select();
    document.execCommand("copy");
    document.body.removeChild(aux);
    this.toggleElementClassIf(btn, 'copied', 'code-to-copy', () => true);
    setTimeout(() => {
      this.toggleElementClassIf(btn, 'code-to-copy', 'copied', () => true)
    }, 1000);
  }

  initiateNotifier() {
    salla.notify.setNotifier(function (message, type, data) {
      if (window.enable_add_product_toast && data?.data?.googleTags?.event === "addToCart") {
        return;
      }
      if (typeof message == 'object') {
        return Swal.fire(message).then(type);
      }

      return Swal.mixin({
        toast: true,
        position: salla.config.get('theme.is_rtl') ? 'top-start' : 'top-end',
        showConfirmButton: false,
        timer: 2000,
        didOpen: (toast) => {
          toast.addEventListener('mouseenter', Swal.stopTimer)
          toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
      }).fire({
        icon: type,
        title: message,
        showCloseButton: true,
        timerProgressBar: true
      })
    });
  }


  initiateMobileMenu() {

  this.isElementLoaded('#mobile-menu').then((menu) => {

 
  const mobileMenu = new MobileMenu(menu, "(max-width: 1024px)", "( slidingSubmenus: false)");

  salla.lang.onLoaded(() => {
    mobileMenu.navigation({ title: salla.lang.get('blocks.header.main_menu') });
  });
  const drawer = mobileMenu.offcanvas({ position: salla.config.get('theme.is_rtl') ? "right" : 'left' });

  this.onClick("a[href='#mobile-menu']", event => {
    document.body.classList.add('menu-opened');
    event.preventDefault() || drawer.close() || drawer.open()
    
  });
  this.onClick(".close-mobile-menu", event => {
    document.body.classList.remove('menu-opened');
    event.preventDefault() || drawer.close()
  });
  });

  }
 initAttachWishlistListeners() {
    let isListenerAttached = false;
  
    function toggleFavoriteIcon(id, isAdded = true) {
      document.querySelectorAll('.s-product-card-wishlist-btn[data-id="' + id + '"]').forEach(btn => {
        app.toggleElementClassIf(btn, 's-product-card-wishlist-added', 'not-added', () => isAdded);
        app.toggleElementClassIf(btn, 'pulse-anime', 'un-favorited', () => isAdded);
      });
    }
  
    if (!isListenerAttached) {
      salla.wishlist.event.onAdded((event, id) => toggleFavoriteIcon(id));
      salla.wishlist.event.onRemoved((event, id) => toggleFavoriteIcon(id, false));
      isListenerAttached = true; // Mark the listener as attached
    }
  }

  initiateStickyMenu() {
    let header = this.element('#mainnav'),
      navRow2 = this.element('.main-nav-row-2');
    //when it's landing page, there is no header
    if (!header || !navRow2) {
      return;
    }

    window.addEventListener('load', () => setTimeout(() => this.setHeaderHeight(), 500))
    window.addEventListener('resize', () => this.setHeaderHeight())

    window.addEventListener('scroll', () => {
      // Only make row 2 (navigation menu) sticky, not the entire header
      if (window.scrollY >= 200) {
        navRow2.classList.add('sticky-nav-row');
        navRow2.style.position = 'fixed';
        navRow2.style.top = '0';
        navRow2.style.left = '0';
        navRow2.style.right = '0';
        navRow2.style.zIndex = '30';
        navRow2.style.backgroundColor = ''; // Keep same color (transparent)
        navRow2.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
      } else {
        navRow2.classList.remove('sticky-nav-row');
        navRow2.style.position = '';
        navRow2.style.top = '';
        navRow2.style.left = '';
        navRow2.style.right = '';
        navRow2.style.zIndex = '';
        navRow2.style.backgroundColor = '';
        navRow2.style.boxShadow = '';
      }
    }, { passive: true });
  }

  setHeaderHeight() {
    let height = this.element('#mainnav .inner').clientHeight,
      header = this.element('#mainnav');
    header.style.height = height + 'px';
  }

  initiateDropdowns() {
    this.onClick('.dropdown__trigger', ({ target: btn }) => {
      btn.parentElement.classList.toggle('is-opened');
      document.body.classList.toggle('dropdown--is-opened');
      // Click Outside || Click on close btn
      window.addEventListener('click', ({ target: element }) => {
        if (!element.closest('.dropdown__menu') && element !== btn || element.classList.contains('dropdown__close')) {
          btn.parentElement.classList.remove('is-opened');
          document.body.classList.remove('dropdown--is-opened');
        }
      });
    });
  }

  initiateModals() {
    this.onClick('[data-modal-trigger]', e => {
      let id = '#' + e.target.dataset.modalTrigger;
      this.removeClass(id, 'hidden');
      setTimeout(() => this.toggleModal(id, true)); //small amont of time to running toggle After adding hidden
    });
    salla.event.document.onClick("[data-close-modal]", e => this.toggleModal('#' + e.target.dataset.closeModal, false));
  }

  toggleModal(id, isOpen) {
    this.toggleClassIf(`${id} .s-salla-modal-overlay`, 'ease-out duration-300 opacity-100', 'opacity-0', () => isOpen)
      .toggleClassIf(`${id} .s-salla-modal-body`,
        'ease-out duration-300 opacity-100 translate-y-0 sm:scale-100', //add these classes
        'opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95', //remove these classes
        () => isOpen)
      .toggleElementClassIf(document.body, 'modal-is-open', 'modal-is-closed', () => isOpen);
    if (!isOpen) {
      setTimeout(() => this.addClass(id, 'hidden'), 350);
    }
  }

  initiateCollapse() {
    document.querySelectorAll('.btn--collapse')
      .forEach((trigger) => {
        const content = document.querySelector('#' + trigger.dataset.show);
        if (!content) return;

        const state = { isOpen: false }

        const toggleState = (isOpen) => {
          state.isOpen = !isOpen;
          this.toggleElementClassIf([content, trigger], 'is-closed', 'is-opened', () => isOpen);
        }

        trigger.addEventListener('click', () => {
          const { isOpen } = state;
          toggleState(isOpen);
        });
      });
  }


  /**
   * Workaround for seeking to simplify & clean, There are three ways to use this method:
   * 1- direct call: `this.anime('.my-selector')` - will use default values
   * 2- direct call with overriding defaults: `this.anime('.my-selector', {duration:3000})`
   * 3- return object to play it letter: `this.anime('.my-selector', false).duration(3000).play()` - will not play animation unless calling play method.
   * @param {string|HTMLElement} selector
   * @param {object|undefined|null|null} options - in case there is need to set attributes one by one set it `false`;
   * @return {Anime|*}
   */
  anime(selector, options = null) {
    let anime = new Anime(selector, options);
    return options === false ? anime : anime.play();
  }

  /**
   * These actions are responsible for pressing "add to cart" button,
   * they can be from any page, especially when mega-menu is enabled
   */
  initAddToCart() {
    salla.cart.event.onUpdated(summary => {
      document.querySelectorAll('[data-cart-total]').forEach(el => el.innerHTML = salla.money(summary.total));
      document.querySelectorAll('[data-cart-count]').forEach(el => el.innerText = salla.helpers.number(summary.count));
    });

    salla.cart.event.onItemAdded((response, prodId) => {
      app.element('salla-cart-summary').animateToCart(app.element(`#product-${prodId} img`));
    });
  }

  initVehicleFilterModal() {
    // Wait for DOM to be ready
    const initModal = () => {
      const toggleBtn = document.getElementById('vehicle-filter-toggle-btn');
      const modal = document.getElementById('vehicle-filter-modal');
      const closeBtn = document.getElementById('vehicle-filter-close-btn');
      const searchBtn = document.getElementById('vehicle-filter-search-btn');
      const vinSearchBtn = document.getElementById('vehicle-filter-vin-search-btn');

      if (!toggleBtn || !modal) {
        return;
      }

      // Open modal
      toggleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
      });

      // Close modal
      const closeModal = () => {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
      };

    if (closeBtn) {
      closeBtn.addEventListener('click', closeModal);
    }

    // Close on backdrop click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });

    // Close on ESC key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeModal();
      }
    });

    // Handle search button click (sync with main form if exists)
    if (searchBtn) {
      searchBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const brandEl = document.getElementById('vehicle-filter-brand');
        const modelEl = document.getElementById('vehicle-filter-model');
        const yearEl = document.getElementById('vehicle-filter-year');
        const values = [
          selectDisplayText(brandEl),
          selectDisplayText(modelEl),
          selectDisplayText(yearEl),
        ].filter((v) => v && v.trim() !== '');
        if (values.length === 0) return;

        const searchQuery = values.join(' ');
        const encodedQuery = encodeURIComponent(searchQuery);
        window.location.href = `/search?q=${encodedQuery}`;
      });
    }

    // Handle VIN search button click
    if (vinSearchBtn) {
      vinSearchBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const vin = document.getElementById('vehicle-filter-vin')?.value || '';
        if (!vin.trim()) return;

        const encodedQuery = encodeURIComponent(vin);
        window.location.href = `/search?q=${encodedQuery}`;
      });
    }
    };

    // Initialize immediately if DOM is ready, otherwise wait
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initModal);
    } else {
      // DOM is already ready, but wait a bit for Salla components
      setTimeout(initModal, 100);
    }
  }

  /**
   * Desktop header: category <select> — store menus first, then /categories API (same sources as all-categories dropdown).
   */
  initHeaderCategorySelect() {
    const select = document.getElementById('header-category-select');
    if (!select || select.dataset.bound === '1') {
      return;
    }
    select.dataset.bound = '1';

    const safeHref = (u) => {
      if (!u || typeof u !== 'string') {
        return '';
      }
      try {
        return new URL(u, window.location.origin).href;
      } catch {
        return '';
      }
    };

    const appendOptions = (items, labelKey, urlKey) => {
      const seen = new Set();
      items.forEach((item) => {
        const url = safeHref(item[urlKey] || item.url || item.full_url || item.link);
        const label = item[labelKey] || item.name || item.title;
        if (!url || !label || seen.has(url)) {
          return;
        }
        seen.add(url);
        const opt = document.createElement('option');
        opt.value = url;
        opt.textContent = label;
        select.appendChild(opt);
      });
    };

    const fillFromMenus = (menus) => {
      if (!Array.isArray(menus) || menus.length === 0) {
        return false;
      }
      appendOptions(menus.slice(0, 40), 'title', 'url');
      return select.options.length > 1;
    };

    const fillFromCategories = (data) => {
      const list = Array.isArray(data) ? data : [];
      appendOptions(list.slice(0, 40), 'name', 'url');
      return select.options.length > 1;
    };

    const tryLoad = async () => {
      if (select.dataset.populated === '1') {
        return;
      }

      if (typeof salla === 'undefined') {
        return;
      }

      while (select.options.length > 1) {
        select.remove(1);
      }

      // 1) Header menu (same as custom-main-menu)
      if (salla.api?.component?.getMenus) {
        try {
          const res = await salla.api.component.getMenus();
          if (fillFromMenus(res?.data)) {
            select.dataset.populated = '1';
            return;
          }
        } catch {
          /* continue */
        }
      }

      const menuEl = document.querySelector('custom-main-menu');
      if (menuEl?.menus?.length && fillFromMenus(menuEl.menus)) {
        select.dataset.populated = '1';
        return;
      }

      // 2) Categories API
      if (salla.api?.get) {
        try {
          const res = await salla.api.get('/categories', { limit: 50 });
          const data = res?.data !== undefined ? res.data : res;
          if (fillFromCategories(data)) {
            select.dataset.populated = '1';
            return;
          }
        } catch {
          /* continue */
        }
      }
    };

    select.addEventListener('change', () => {
      const v = select.value;
      if (v) {
        window.location.href = v;
      }
      select.selectedIndex = 0;
    });

    const schedule = () => {
      tryLoad().then(() => {
        if (select.dataset.populated === '1') {
          return;
        }
        setTimeout(() => tryLoad(), 1200);
        setTimeout(() => tryLoad(), 2500);
      });
    };

    if (salla.onReady) {
      salla.onReady().then(schedule).catch(schedule);
    } else {
      setTimeout(schedule, 500);
    }
  }

  /**
   * Hero dots: sync desktop + mobile slides (runs on any page with markup;
   * Home class only loads for slug "index", but Salla home may use another slug).
   */
  initHeroSlider() {
    if (document.querySelector('.mobex-hero-slider')) {
      return;
    }

    const section = document.querySelector('section.hero-section');
    if (!section || section.dataset.heroSliderBound === '1') {
      return;
    }

    const dots = section.querySelectorAll('.slider-dots .dot');
    const desktopSlides = section.querySelectorAll('.hero-slider .hero-slide');
    const mobileSlides = section.querySelectorAll('.hero-mobile-slides .hero-mobile-slide');

    if (!dots.length || !desktopSlides.length) {
      return;
    }

    section.dataset.heroSliderBound = '1';

    let count = Math.min(dots.length, desktopSlides.length);
    if (mobileSlides.length > 0) {
      count = Math.min(count, mobileSlides.length);
    }

    const goTo = (index) => {
      if (index < 0 || index >= count) {
        return;
      }

      desktopSlides.forEach((el, i) => el.classList.toggle('active', i === index));
      if (mobileSlides.length > 0) {
        mobileSlides.forEach((el, i) => el.classList.toggle('active', i === index));
      }
      dots.forEach((el, i) => {
        el.classList.toggle('active', i === index);
        el.setAttribute('aria-selected', i === index ? 'true' : 'false');
      });
    };

    dots.forEach((dot, i) => {
      if (i >= count) {
        return;
      }
      dot.addEventListener('click', (e) => {
        e.preventDefault();
        goTo(i);
      });
    });
  }
}

salla.onReady(() => (new App).loadTheApp());
