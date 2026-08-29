// i18n.js - tiny runtime loader
const I18N = (function(){
  let translations = {};
  let lang = 'en';

  async function load(langCode){
    lang = langCode;
    try {
      const resp = await fetch(`translations/${lang}.json`);
      if (!resp.ok) throw new Error('Translation load failed');
      translations = await resp.json();
    } catch (e) {
      console.warn('Could not load translations for', lang, e);
      translations = {};
    }
    applyTranslations();
  }

  function t(key, vars){
    let s = translations[key] || key;
    if (!vars) return s;
    for (const k in vars) s = s.replace(`{${k}}`, vars[k]);
    return s;
  }

  function applyTranslations(root = document){
    // Replace elements with data-i18n (textContent)
    root.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      // special-case title element
      if (el.tagName.toLowerCase() === 'title'){
        document.title = t(key);
      } else {
        el.textContent = t(key);
      }
    });
    // Replace attributes like placeholder, title, aria-label
    root.querySelectorAll('[data-i18n-attr]').forEach(el => {
      // format: data-i18n-attr="attrName:key;attrName2:key2"
      const mappings = el.getAttribute('data-i18n-attr').split(';');
      mappings.forEach(map => {
        const parts = map.split(':');
        const attr = parts[0] && parts[0].trim();
        const key = parts[1] && parts[1].trim();
        if (attr && key) el.setAttribute(attr, t(key));
      });
    });
    // update html lang attribute
    document.documentElement.lang = lang;

    // update any lang-specific selects (if present)
    const sel = document.getElementById('lang-select');
    if (sel) sel.value = lang;
  }

  function detect(){
    const url = new URL(window.location);
    const q = url.searchParams.get('lang');
    if (q) return q;
    const stored = localStorage.getItem('site_lang');
    if (stored) return stored;
    const nav = navigator.language || navigator.userLanguage || 'en';
    return nav.split('-')[0]; // 'de', 'en', ...
  }

  function setLang(newLang){
    localStorage.setItem('site_lang', newLang);
    load(newLang);
  }

  return { load, t, detect, setLang, current: () => lang, applyTranslations };
})();
