/**
 * Logs product list payloads with focus on Salla ProductDetails.images[] (OpenAPI).
 * List endpoints often use "light" format → only `image` + `thumbnail`, no `images` gallery.
 * When missing, optionally hits storefront APIs to log full `images` for debugging.
 */

const LOG_PREFIX = '[Mobex ProductList]';
/** Max products to hit extra API for (avoid hammering) */
const MAX_ENRICH_FETCH = 6;

/**
 * Normalize one image entry to { id, url, main, type, sort, alt } per Merchant API ProductDetails.images[]
 */
function normalizeImageEntry(entry) {
  if (!entry) {
    return null;
  }
  if (typeof entry === 'string') {
    return { url: entry, main: false, type: 'image' };
  }
  if (typeof entry === 'object') {
    const url = entry.url || entry.main_image || entry.video_url || '';
    return {
      id: entry.id,
      url,
      main: entry.main === true || entry.main === 1,
      type: entry.type || 'image',
      sort: entry.sort,
      alt: entry.alt,
      three_d_image_url: entry.three_d_image_url,
    };
  }
  return null;
}

/**
 * Split ProductDetails.images[] into primary vs additional (non-primary gallery).
 */
function parseProductImages(product) {
  if (!product || typeof product !== 'object') {
    return { raw: [], primary: null, additional: [], hasImagesArray: false };
  }

  const rawList = product.images;
  const hasImagesArray = Array.isArray(rawList);
  const normalized = hasImagesArray
    ? rawList.map(normalizeImageEntry).filter(Boolean)
    : [];

  let primary =
    normalized.find((img) => img.main) ||
    normalized[0] ||
    null;

  const singleImageUrl = product.image?.url || product.image;
  const thumb = product.thumbnail;

  if (!primary && (singleImageUrl || thumb)) {
    primary = {
      url: singleImageUrl || thumb,
      main: true,
      type: 'image',
      source: 'light_format_image_or_thumbnail',
    };
  }

  const additional = normalized.filter((img) => {
    if (img.main) {
      return false;
    }
    const pUrl = primary?.url;
    if (pUrl && img.url === pUrl) {
      return false;
    }
    return true;
  });

  return {
    raw: normalized,
    primary,
    additional,
    hasImagesArray,
    thumbnailOnly: !!thumb && !hasImagesArray,
  };
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

function pickImageRelated(product) {
  if (!product || typeof product !== 'object') {
    return {};
  }
  const out = {};
  for (const k of Object.keys(product)) {
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

async function tryFetchProductImagesFromStorefront(productId) {
  const id = String(productId);
  if (!id || id === 'undefined') {
    return null;
  }

  if (typeof salla !== 'undefined' && salla.api && typeof salla.api.get === 'function') {
    const paths = [`/products/${id}`, `/product/${id}`, `products/${id}`];
    for (const path of paths) {
      try {
        const res = await salla.api.get(path);
        const data = res?.data ?? res;
        const images = data?.images;
        if (Array.isArray(images) && images.length) {
          return { source: `salla.api.get(${path})`, images, data };
        }
      } catch (e) {
        /* try next */
      }
    }
  }

  try {
    const response = await fetch(`/api/products/${id}`, {
      headers: { Accept: 'application/json' },
      credentials: 'same-origin',
    });
    if (response.ok) {
      const json = await response.json();
      const data = json.data ?? json;
      const images = data?.images;
      if (Array.isArray(images) && images.length) {
        return { source: 'fetch /api/products/:id', images, data };
      }
    }
  } catch (e) {
    /* ignore */
  }

  return null;
}

function logDomCustomCards() {
  const customCards = document.querySelectorAll('custom-salla-product-card[product]');
  if (!customCards.length) {
    console.info(
      `${LOG_PREFIX} No <custom-salla-product-card product="..."> — theme may use default Salla cards.`
    );
    return;
  }

  console.groupCollapsed(`${LOG_PREFIX} custom-salla-product-card — images breakdown`);
  customCards.forEach((el, index) => {
    try {
      const p = JSON.parse(el.getAttribute('product'));
      const parsed = parseProductImages(p);
      console.log(`${LOG_PREFIX} card #${index + 1} id=${p.id}`, {
        name: p.name,
        hasImagesArray: parsed.hasImagesArray,
        imagesArrayLength: parsed.raw.length,
        primaryUrl: parsed.primary?.url || null,
        additionalCount: parsed.additional.length,
        additionalUrls: parsed.additional.map((i) => i.url).filter(Boolean),
        fullImagesArray: parsed.hasImagesArray ? p.images : '(not in JSON — likely list/light payload)',
      });
      if (index === 0) {
        console.log(`${LOG_PREFIX} card #1 full product JSON:`, p);
      }
    } catch (err) {
      console.warn(`${LOG_PREFIX} card #${index + 1} parse error`, err);
    }
  });
  console.groupEnd();
}

function logLatestSectionHint() {
  const latest = document.querySelector('.s-block--latest-products');
  if (latest) {
    console.info(
      `${LOG_PREFIX} ".s-block--latest-products" found on page — enrichment below applies to list cards in this section when gallery is missing from payload.`
    );
  }
}

async function enrichAndLogFetchedImages(products) {
  const needFetch = products.filter((p) => {
    const { hasImagesArray, additional } = parseProductImages(p);
    return !hasImagesArray || additional.length === 0;
  });

  if (!needFetch.length) {
    return;
  }

  console.groupCollapsed(
    `${LOG_PREFIX} Storefront fetch — trying to load full product.images[] (list often omits gallery; OpenAPI full ProductDetails has images[])`
  );
  console.info(
    `${LOG_PREFIX} Merchant List Products with format=light only returns thumbnail + single image — see OpenAPI ListProductsLightFormat. Full gallery is on ProductDetails.images[].`
  );

  const slice = needFetch.slice(0, MAX_ENRICH_FETCH);
  for (const p of slice) {
    const id = p?.id;
    const result = await tryFetchProductImagesFromStorefront(id);
    if (!result) {
      console.warn(`${LOG_PREFIX} product id=${id} — could not load images via salla.api or /api/products/:id`);
      continue;
    }

    const parsed = parseProductImages({ ...p, images: result.images });
    console.log(`${LOG_PREFIX} product id=${id} (${result.source})`, {
      imagesCount: result.images.length,
      allImageUrls: result.images.map((img) => (typeof img === 'string' ? img : img?.url)).filter(Boolean),
      nonPrimaryGallery: parsed.additional.map((i) => i.url).filter(Boolean),
      rawImages: result.images,
    });
  }

  if (needFetch.length > MAX_ENRICH_FETCH) {
    console.info(
      `${LOG_PREFIX} Only first ${MAX_ENRICH_FETCH} products were fetched; raise MAX_ENRICH_FETCH in product-list-debug.js if needed.`
    );
  }
  console.groupEnd();
}

export function initProductListPayloadLogging() {
  if (typeof salla === 'undefined' || !salla.event || typeof salla.event.on !== 'function') {
    console.warn(`${LOG_PREFIX} salla.event.on not available; skipping.`);
    return;
  }

  salla.event.on('salla-products-list::products.fetched', (payload) => {
    console.groupCollapsed(`${LOG_PREFIX} salla-products-list::products.fetched`);
    console.log(`${LOG_PREFIX} typeof payload:`, typeof payload);
    if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
      console.log(`${LOG_PREFIX} payload top-level keys:`, Object.keys(payload).sort());
    }
    console.log(`${LOG_PREFIX} raw payload:`, payload);

    const products = normalizeProducts(payload);
    console.log(`${LOG_PREFIX} normalized products[] length:`, products.length);

    if (!products.length) {
      console.warn(`${LOG_PREFIX} No products[] found — inspect raw payload shape above.`);
      console.groupEnd();
      requestAnimationFrame(() => setTimeout(logDomCustomCards, 0));
      return;
    }

    const tableRows = products.map((p, i) => {
      const parsed = parseProductImages(p);
      return {
        '#': i + 1,
        id: p?.id,
        name: (p?.name || '').slice(0, 36),
        hasImagesArray: parsed.hasImagesArray,
        totalImages: parsed.raw.length,
        extraNonPrimary: parsed.additional.length,
        primary: (parsed.primary?.url || '').slice(0, 48),
      };
    });
    console.log(`${LOG_PREFIX} images overview (OpenAPI field: product.images[])`);
    console.table(tableRows);

    console.groupCollapsed(`${LOG_PREFIX} Non-primary / gallery URLs only (excludes main image)`);
    products.forEach((p, index) => {
      const parsed = parseProductImages(p);
      const row = {
        id: p.id,
        name: p.name,
        has_images_array: parsed.hasImagesArray,
        gallery_urls: parsed.additional.map((i) => i.url).filter(Boolean),
        note: !parsed.hasImagesArray
          ? 'No images[] on this payload — typical for list/light API (only image.url + thumbnail).'
          : parsed.additional.length === 0
            ? 'images[] exists but only main image (or duplicates) — no extra gallery entries.'
            : '',
      };
      console.log(`${LOG_PREFIX} #${index + 1}`, row);
      if (parsed.hasImagesArray && Array.isArray(p.images) && p.images.length) {
        console.log(`${LOG_PREFIX} #${index + 1} full images[] (id, url, main, type, sort):`, p.images);
      }
    });
    console.groupEnd();

    console.groupCollapsed(`${LOG_PREFIX} First product — image-related keys only`);
    console.log(pickImageRelated(products[0]));
    console.log(`${LOG_PREFIX} first product full object:`, products[0]);
    console.groupEnd();

    logLatestSectionHint();

    console.groupEnd();

    requestAnimationFrame(() => {
      setTimeout(logDomCustomCards, 0);
      setTimeout(() => enrichAndLogFetchedImages(products), 100);
    });
  });

  console.info(
    `${LOG_PREFIX} Listening for salla-products-list::products.fetched — expand groups; non-primary images logged under "Non-primary / gallery URLs".`
  );
}
