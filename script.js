// Wealth tax simulator script with region-specific models for Zurich and Mallorca.
// Models implemented from official sources (see SOURCES.md). Mallorca brackets are the Balearic autonomous scale (2024).
// Zurich model uses the cantonal tariff (progressive promille bands) and applies the 2024 Staatssteuerfuss and Stadt Zürich Gemeindesteuerfuss.

const models = {
  zurich: {
    name: "Canton/City Zürich (example)",
    currency: "CHF",
    exemption: 77000,
    brackets: [
      { upTo: 80000, ratePromille: 0 },
      { upTo: 318000, ratePromille: 0.5 },
      { upTo: 717000, ratePromille: 1 },
      { upTo: 1353000, ratePromille: 1.5 },
      { upTo: 2309000, ratePromille: 2 },
      { upTo: 3262000, ratePromille: 2.5 },
      { upTo: null, ratePromille: 3 }
    ],
    staatssteuerfuss: 0.98,
    gemeindesteuerfuss: 1.19,
    note: "Cantonal progressive tariff (promille) from Zürich Wegleitung 2024. Final tax applies Staatssteuerfuss and Gemeindesteuerfuss for the municipality (example uses Stadt Zürich 119%). See SOURCES.md for references."
  },

  mallorca: {
    name: "Balearic Islands (Mallorca) — Impuesto sobre el Patrimonio (2024)",
    currency: "EUR",
    exemption: 3000000,
    brackets: [
      { upTo: 170472.04, rate: 0.0028 },
      { upTo: 340937.04, rate: 0.0041 },
      { upTo: 681869.75, rate: 0.0069 },
      { upTo: 1336739.51, rate: 0.0124 },
      { upTo: 2727479.00, rate: 0.0179 },
      { upTo: 5454958.00, rate: 0.0235 },
      { upTo: 10909951.99, rate: 0.0290 },
      { upTo: null, rate: 0.0345 }
    ],
    note: "Balearic autonomous scale (Mallorca) 2024. Mínimo exento 3,000,000 EUR. See SOURCES.md for official ATIB/AEAT references."
  }
};

function computeProgressiveTax(wealth, model, isPromille=false){
  const taxable = Math.max(0, wealth - (model.exemption || 0));
  if (taxable <= 0) return 0;

  let remaining = taxable;
  let prev = 0;
  let tax = 0;

  for (const b of model.brackets){
    const upTo = b.upTo === null ? Infinity : b.upTo;
    const sliceMax = Math.max(0, upTo - prev);
    const slice = Math.min(remaining, sliceMax);
    const rate = isPromille ? (b.ratePromille/1000) : (b.rate || 0);
    tax += slice * rate;
    remaining -= slice;
    prev = upTo === Infinity ? prev : upTo;
    if (remaining <= 0) break;
  }
  return tax;
}

function localeForLang(lang){
  // map language to a reasonable locale for Intl formatting
  const map = { en: 'en-US', de: 'de-CH' };
  return map[lang] || 'en-US';
}

function formatCurrency(amount, currency){
  try{
    const locale = (typeof I18N !== 'undefined') ? localeForLang(I18N.current()) : 'en-US';
    return new Intl.NumberFormat(locale, { style: "currency", currency }).format(amount);
  }catch(e){
    return amount.toFixed(2) + ' ' + currency;
  }
}

function updateHints(modelKey){
  const model = models[modelKey];
  const hints = document.getElementById('hints');
  let html = `<strong>Model notes:</strong> ${model.note || ''}<br/>`;
  html += `<strong>Exemption:</strong> ${formatCurrency(model.exemption||0, model.currency)}<br/>`;
  if (modelKey === 'zurich'){
    html += `<strong>Staatssteuerfuss:</strong> ${(model.staatssteuerfuss*100).toFixed(2)}% (applied to cantonal base tax)<br/>`;
    html += `<strong>Gemeindesteuerfuss (Stadt Zürich used here):</strong> ${(model.gemeindesteuerfuss*100).toFixed(2)}%<br/>`;
  }
  html += `<strong>Brackets:</strong><ul>`;
  let prev = modelKey === 'zurich' ? 0 : 0;
  for (const b of model.brackets){
    const upTo = b.upTo === null ? '∞' : (model.currency === 'CHF' ? b.upTo.toLocaleString('de-CH') : b.upTo.toLocaleString());
    if (modelKey === 'zurich'){
      html += `<li>${prev === 0 ? '' : prev.toLocaleString()} – ${upTo}: ${((b.ratePromille||0)).toFixed(2)} ‰</li>`;
      prev = b.upTo === null ? prev : b.upTo;
    } else {
      const pct = ((b.rate||0)*100).toFixed(2) + '%';
      html += `<li>${prev === 0 ? '' : formatCurrency(prev, model.currency)} – ${b.upTo === null ? '∞' : formatCurrency(b.upTo, model.currency)}: ${pct}</li>`;
      prev = b.upTo === null ? prev : b.upTo;
    }
  }
  html += `</ul>`;
  html += `<p><a href="SOURCES.md">View sources</a></p>`;
  hints.innerHTML = html;
}

function calculate(){
  const wealthInput = parseFloat(document.getElementById('wealth').value || 0);
  const currency = document.getElementById('currency').value;
  const modelKey = document.getElementById('model').value;
  const model = models[modelKey];

  if (isNaN(wealthInput) || wealthInput < 0){
    if (typeof I18N !== 'undefined') alert(I18N.t('invalid_wealth'));
    else alert('Please enter a valid wealth amount (>= 0).');
    return;
  }

  const isPromille = modelKey === 'zurich';
  let tax = computeProgressiveTax(wealthInput, model, isPromille);

  if (modelKey === 'zurich'){
    tax = tax * (model.staatssteuerfuss || 1) * (model.gemeindesteuerfuss || 1);
  }

  const relative = wealthInput > 0 ? (tax / wealthInput) * 100 : 0;

  const displayCurrency = model.currency;
  document.getElementById('tax-absolute').textContent = formatCurrency(tax, displayCurrency);
  const pctText = (typeof I18N !== 'undefined') ? I18N.t('relative_format', { pct: relative.toFixed(4) }) : relative.toFixed(4) + '% of total wealth per year';
  document.getElementById('tax-relative').textContent = pctText;
  document.getElementById('results').classList.remove('hidden');

  updateHints(modelKey);
}

function resetForm(){
  document.getElementById('wealth').value = 1000000;
  document.getElementById('currency').value = 'EUR';
  document.getElementById('model').value = 'zurich';
  document.getElementById('results').classList.add('hidden');
}

document.getElementById('calculate').addEventListener('click', calculate);
document.getElementById('reset').addEventListener('click', resetForm);
