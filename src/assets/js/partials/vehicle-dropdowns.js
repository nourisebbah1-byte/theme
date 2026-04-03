/**
 * Cascading Make → Model → Year from dropdown_data.json.
 * Option values use make_val / model_val / year_val; Salla search uses visible labels.
 */

let rowsCache = null;
let loadPromise = null;

function assetUrl(filename) {
  if (typeof salla !== 'undefined' && salla.url && typeof salla.url.asset === 'function') {
    return salla.url.asset(filename);
  }
  return `/${filename}`;
}

function loadRows() {
  if (rowsCache) {
    return Promise.resolve(rowsCache);
  }
  if (loadPromise) {
    return loadPromise;
  }
  loadPromise = fetch(assetUrl('dropdown_data.json'))
    .then((r) => {
      if (!r.ok) {
        throw new Error('dropdown_data');
      }
      return r.json();
    })
    .then((data) => {
      rowsCache = Array.isArray(data) ? data : [];
      return rowsCache;
    })
    .catch(() => {
      rowsCache = [];
      return rowsCache;
    });
  return loadPromise;
}

function uniqueBy(rows, keyText, keyVal) {
  const m = new Map();
  rows.forEach((row) => {
    const v = row[keyVal];
    if (v == null || v === '') {
      return;
    }
    const key = String(v);
    if (!m.has(key)) {
      m.set(key, {
        text: String(row[keyText] ?? ''),
        value: key,
      });
    }
  });
  return [...m.values()].sort((a, b) =>
    a.text.localeCompare(b.text, undefined, { sensitivity: 'base' })
  );
}

function sortYearOptions(items) {
  return [...items].sort((a, b) => {
    const na = parseInt(a.text, 10);
    const nb = parseInt(b.text, 10);
    if (!Number.isNaN(na) && !Number.isNaN(nb)) {
      return nb - na;
    }
    return b.text.localeCompare(a.text);
  });
}

function refillSelect(select, items, { disabled } = {}) {
  if (!select) {
    return;
  }
  const ph = select.querySelector('option[value=""]');
  const phText = ph ? ph.textContent : '';
  select.innerHTML = '';
  const o0 = document.createElement('option');
  o0.value = '';
  o0.textContent = phText;
  select.appendChild(o0);
  items.forEach((item) => {
    const o = document.createElement('option');
    o.value = item.value;
    o.textContent = item.text;
    select.appendChild(o);
  });
  select.disabled = !!disabled;
  select.value = '';
}

function bindTriple(rows, makeSel, modelSel, yearSel) {
  if (!makeSel || !modelSel || !yearSel) {
    return;
  }

  const makes = uniqueBy(rows, 'make', 'make_val');
  refillSelect(makeSel, makes, { disabled: false });
  refillSelect(modelSel, [], { disabled: true });
  refillSelect(yearSel, [], { disabled: true });

  makeSel.addEventListener('change', () => {
    const mv = makeSel.value;
    if (!mv) {
      refillSelect(modelSel, [], { disabled: true });
      refillSelect(yearSel, [], { disabled: true });
      return;
    }
    const models = uniqueBy(
      rows.filter((r) => String(r.make_val) === mv),
      'model',
      'model_val'
    );
    refillSelect(modelSel, models, { disabled: false });
    refillSelect(yearSel, [], { disabled: true });
  });

  modelSel.addEventListener('change', () => {
    const mv = makeSel.value;
    const mdv = modelSel.value;
    if (!mv || !mdv) {
      refillSelect(yearSel, [], { disabled: true });
      return;
    }
    const years = sortYearOptions(
      uniqueBy(
        rows.filter(
          (r) => String(r.make_val) === mv && String(r.model_val) === mdv
        ),
        'year',
        'year_val'
      )
    );
    refillSelect(yearSel, years, { disabled: false });
  });
}

export function selectDisplayText(selectEl) {
  if (!selectEl || selectEl.value === '') {
    return '';
  }
  const opt = selectEl.selectedOptions[0];
  if (!opt || opt.value === '') {
    return '';
  }
  return opt.textContent.trim();
}

export function initVehicleDropdowns() {
  const heroMake = document.getElementById('vehicle-brand');
  const heroModel = document.getElementById('vehicle-model');
  const heroYear = document.getElementById('vehicle-year');
  const modalMake = document.getElementById('vehicle-filter-brand');
  const modalModel = document.getElementById('vehicle-filter-model');
  const modalYear = document.getElementById('vehicle-filter-year');

  if (!heroMake && !modalMake) {
    return;
  }
  if (typeof window !== 'undefined' && window.__vehicleDropdownsBound) {
    return;
  }
  if (typeof window !== 'undefined') {
    window.__vehicleDropdownsBound = true;
  }

  loadRows().then((rows) => {
    if (!rows.length) {
      return;
    }
    if (heroMake && heroModel && heroYear) {
      bindTriple(rows, heroMake, heroModel, heroYear);
    }
    if (modalMake && modalModel && modalYear) {
      bindTriple(rows, modalMake, modalModel, modalYear);
    }
  });
}
