/**
 * Logs product list payloads and per-product image-related fields to the browser console.
 * Helps verify whether Salla sends multiple images for list cards before building in-card galleries.
 */

const LOG_PREFIX = '[Mobex ProductList]';

function pickImageRelated(product) {
  if (!product || typeof product !== 'object') {
    return {};
  }
  const out = {};
  const keys = Object.keys(product);
  for (const k of keys) {
    const lower = k.toLowerCase();
    if (
      /^(image|images|thumbnail|thumbnails|gallery|cover|media|photos|pictures|files)$/i.test(k) ||
      lower.includes('image') ||
      lower.includes('thumb') ||
      lower.includes('gallery') ||
      lower.includes('photo')
    ) {
      try {
        out[k] = product[k];
      } catch (e) {
        out[k] = '[unreadable]';
      }
    }
  }
  return out;
}

function normalizeProducts(payload) {
  if (!payload) {
    return [];
  }
  if (Array.isArray(payload)) {
    return payload;
  }
  const candidates = [
    payload.products,
    payload.data?.products,
    payload.data?.data,
    payload.data,
    payload.items,
    payload.result,
  ];
  for (const c of candidates) {
    if (Array.isArray(c)) {
      return c;
    }
  }
  return [];
}

function imageSummary(product) {
  const related = pickImageRelated(product);
  let extraCount = 0;
  const images = product?.images ?? product?.gallery ?? product?.media;
  if (Array.isArray(images)) {
    extraCount = images.length;
  }
  return {
    hasMainImage: !!(product?.image?.url || product?.thumbnail || product?.image),
    imagesArrayLength: Array.isArray(images) ? images.length : null,
    imageRelatedKeys: Object.keys(related),
    imageRelated: related,
  };
}

function logDomCustomCards() {
  const customCards = document.querySelectorAll('custom-salla-product-card[product]');
  if (!customCards.length) {
    console.info(
      `${LOG_PREFIX} No <custom-salla-product-card product="..."> in DOM — list may use default Salla cards (data only in fetch event above).`
    );
    return;
  }

  console.groupCollapsed(`${LOG_PREFIX} Parsed product="" on custom-salla-product-card (${customCards.length} cards)`);
  customCards.forEach((el, index) => {
    try {
      const raw = el.getAttribute('product');
      const p = JSON.parse(raw);
      const row = {
        index: index + 1,
        id: p.id,
        name: p.name,
        topLevelKeys: Object.keys(p).sort().join(', '),
        ...imageSummary(p),
      };
      console.log(`${LOG_PREFIX} Card #${index + 1}`, row);
      if (index === 0) {
        console.log(`${LOG_PREFIX} Card #1 — full JSON object:`, p);
      }
    } catch (err) {
      console.warn(`${LOG_PREFIX} Card #${index + 1} — invalid JSON in product attribute`, err);
    }
  });
  console.groupEnd();
}

export function initProductListPayloadLogging() {
  if (typeof salla === 'undefined' || !salla.event || typeof salla.event.on !== 'function') {
    console.warn(`${LOG_PREFIX} salla.event.on not available; skipping product list logging.`);
    return;
  }

  salla.event.on('salla-products-list::products.fetched', (payload) => {
    console.groupCollapsed(`${LOG_PREFIX} salla-products-list::products.fetched`);
    console.log(`${LOG_PREFIX} typeof payload:`, typeof payload);
    if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
      console.log(`${LOG_PREFIX} payload top-level keys:`, Object.keys(payload).sort());
    }
    console.log(`${LOG_PREFIX} raw payload (expand in DevTools):`, payload);

    const products = normalizeProducts(payload);
    console.log(`${LOG_PREFIX} normalized products[] length:`, products.length);

    if (products.length) {
      const tableRows = products.map((p, i) => ({
        '#': i + 1,
        id: p?.id,
        name: (p?.name || '').slice(0, 40),
        imagesLen: Array.isArray(p?.images) ? p.images.length : '—',
        galleryLen: Array.isArray(p?.gallery) ? p.gallery.length : '—',
        hasImageObj: !!p?.image,
        imageRelatedKeyCount: Object.keys(pickImageRelated(p)).length,
      }));
      console.log(`${LOG_PREFIX} summary table:`);
      console.table(tableRows);

      products.forEach((product, index) => {
        const brief = {
          id: product?.id,
          name: product?.name,
          sku: product?.sku,
          ...imageSummary(product),
        };
        console.log(`${LOG_PREFIX} product #${index + 1} summary`, brief);
      });

      console.log(`${LOG_PREFIX} first product — full object:`, products[0]);
    } else {
      console.warn(
        `${LOG_PREFIX} Could not find a products array on the payload. Inspect "raw payload" above for the real shape.`
      );
    }

    console.groupEnd();

    requestAnimationFrame(() => {
      setTimeout(logDomCustomCards, 0);
    });
  });

  console.info(
    `${LOG_PREFIX} Listening for salla-products-list::products.fetched — open the shop page and expand the console groups.`
  );
}
