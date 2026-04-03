/**
 * Store search: same keywords Salla's search page expects (?q=).
 * Uses salla.url.get when available, otherwise /search?q=
 */

import { selectDisplayText } from './vehicle-dropdowns';

/**
 * @param {string} keyword space-separated keywords (make model year, or VIN, etc.)
 * @returns {boolean} true if navigation started
 */
export function navigateToStoreSearch(keyword) {
  const q = String(keyword ?? '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!q) {
    return false;
  }

  if (typeof salla !== 'undefined' && salla.url && typeof salla.url.get === 'function') {
    const keys = ['search', 'product.index.search', 'products.search'];
    for (let i = 0; i < keys.length; i++) {
      try {
        const href = salla.url.get(keys[i]);
        if (href && typeof href === 'string') {
          let pathOnly = href.split('?')[0];
          if (!pathOnly.startsWith('http') && !pathOnly.startsWith('/')) {
            pathOnly = `/${pathOnly}`;
          }
          const u = pathOnly.startsWith('http')
            ? new URL(pathOnly)
            : new URL(pathOnly, window.location.origin);
          u.searchParams.set('q', q);
          window.location.assign(u.toString());
          return true;
        }
      } catch (e) {
        /* try next key */
      }
    }
  }

  window.location.assign(`/search?q=${encodeURIComponent(q)}`);
  return true;
}

function bindOnce(el, event, handler) {
  if (!el || el.dataset.sallaVehicleSearchBound === '1') {
    return;
  }
  el.dataset.sallaVehicleSearchBound = '1';
  el.addEventListener(event, handler);
}

/**
 * Hero banner: combined make/model/year or VIN-only (runs on all pages that include the markup).
 */
export function initHeroVehicleSearchForm() {
  const searchBtn = document.getElementById('vehicle-search-btn');
  const vinInput = document.getElementById('vehicle-vin');
  const vinBtn = document.getElementById('vehicle-vin-search-btn');

  if (!searchBtn && !vinBtn && !vinInput) {
    return;
  }

  const onSelectSearch = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const parts = [
      selectDisplayText(document.getElementById('vehicle-brand')),
      selectDisplayText(document.getElementById('vehicle-model')),
      selectDisplayText(document.getElementById('vehicle-year')),
    ].filter((v) => v && v.trim() !== '');
    if (parts.length === 0) {
      return;
    }
    navigateToStoreSearch(parts.join(' '));
  };

  const onVinSearch = (e) => {
    e.preventDefault();
    const vin = document.getElementById('vehicle-vin')?.value || '';
    const t = vin.replace(/\s+/g, ' ').trim();
    if (!t) {
      return;
    }
    navigateToStoreSearch(t);
  };

  bindOnce(searchBtn, 'click', onSelectSearch);
  bindOnce(vinBtn, 'click', onVinSearch);
  if (vinInput && vinInput.dataset.sallaVehicleSearchEnter !== '1') {
    vinInput.dataset.sallaVehicleSearchEnter = '1';
    vinInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        onVinSearch(e);
      }
    });
  }
}

/**
 * Modal vehicle filter (header): same behavior + Enter on VIN.
 */
export function wireModalVehicleSearch(closeModal) {
  const searchBtn = document.getElementById('vehicle-filter-search-btn');
  const vinInput = document.getElementById('vehicle-filter-vin');
  const vinSearchBtn = document.getElementById('vehicle-filter-vin-search-btn');

  const onSelectSearch = (e) => {
    e.preventDefault();
    const parts = [
      selectDisplayText(document.getElementById('vehicle-filter-brand')),
      selectDisplayText(document.getElementById('vehicle-filter-model')),
      selectDisplayText(document.getElementById('vehicle-filter-year')),
    ].filter((v) => v && v.trim() !== '');
    if (parts.length === 0) {
      return;
    }
    if (typeof closeModal === 'function') {
      closeModal();
    }
    navigateToStoreSearch(parts.join(' '));
  };

  const onVinSearch = (e) => {
    e.preventDefault();
    const t = (document.getElementById('vehicle-filter-vin')?.value || '')
      .replace(/\s+/g, ' ')
      .trim();
    if (!t) {
      return;
    }
    if (typeof closeModal === 'function') {
      closeModal();
    }
    navigateToStoreSearch(t);
  };

  bindOnce(searchBtn, 'click', onSelectSearch);
  bindOnce(vinSearchBtn, 'click', onVinSearch);
  if (vinInput && vinInput.dataset.sallaVehicleSearchEnter !== '1') {
    vinInput.dataset.sallaVehicleSearchEnter = '1';
    vinInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        onVinSearch(e);
      }
    });
  }
}
