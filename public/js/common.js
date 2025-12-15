// Load shared header/footer and initialize dropdowns
(async function(){
  console.log('[common.js] Starting...');
  
  // Load header
  try {
    const headerRes = await fetch('/partials/header.html');
    if (headerRes.ok) {
      const headerHtml = await headerRes.text();
      const headerEl = document.getElementById('site-header');
      if (headerEl) {
        headerEl.innerHTML = headerHtml;
        console.log('[common.js] Header loaded');
      }
    }
  } catch (e) {
    console.error('[common.js] Failed to load header:', e);
  }

  // Load footer
  try {
    const footerRes = await fetch('/partials/footer.html');
    if (footerRes.ok) {
      const footerHtml = await footerRes.text();
      const footerEl = document.getElementById('site-footer');
      if (footerEl) {
        footerEl.innerHTML = footerHtml;
        console.log('[common.js] Footer loaded');
      }
    }
  } catch (e) {
    console.error('[common.js] Failed to load footer:', e);
  }

  // Function to initialize dropdowns
  function initAllDropdowns() {
    console.log('[common.js] Attempting to init dropdowns...');
    if (!window.bootstrap || !window.bootstrap.Dropdown) {
      console.warn('[common.js] Bootstrap not available, retrying...');
      setTimeout(initAllDropdowns, 100);
      return;
    }
    
    const dropdowns = document.querySelectorAll('[data-bs-toggle="dropdown"]');
    console.log('[common.js] Found ' + dropdowns.length + ' dropdown(s)');
    
    dropdowns.forEach((el, idx) => {
      try {
        const existing = bootstrap.Dropdown.getInstance(el);
        if (!existing) {
          const newDropdown = new bootstrap.Dropdown(el);
          console.log('[common.js] Initialized dropdown #' + idx + ': ' + el.id);
        } else {
          console.log('[common.js] Dropdown #' + idx + ' already initialized');
        }
      } catch (e) {
        console.error('[common.js] Dropdown init error at #' + idx + ':', e);
      }
    });
  }
  
  // Initialize dropdowns immediately and also after a delay
  initAllDropdowns();
  setTimeout(initAllDropdowns, 200);
  setTimeout(initAllDropdowns, 500);

  // Refresh account UI (if app.js defines it)
  setTimeout(() => {
    if (typeof refreshAccountUI === 'function') {
      try {
        refreshAccountUI();
        console.log('[common.js] refreshAccountUI called');
      } catch (e) {
        console.error('[common.js] refreshAccountUI error:', e);
      }
    }
    // Register account action handlers if provided by app.js
    if (typeof window.registerAccountActions === 'function') {
      try {
        window.registerAccountActions();
        console.log('[common.js] registerAccountActions called');
      } catch (e) {
        console.error('[common.js] registerAccountActions error:', e);
      }
    }
    // On auth pages (login/signup/reset) ensure logout is hidden even if session exists
    try {
      const p = window.location.pathname || '';
      const short = p.split('/').pop();
      if (['login.html','signup.html','reset.html'].includes(short)) {
        const acctLogoutEl = document.getElementById('acctLogout');
        const acctLoginEl = document.getElementById('acctLogin');
        const acctSignupEl = document.getElementById('acctSignup');
        if (acctLogoutEl) acctLogoutEl.style.display = 'none';
        if (acctLoginEl) acctLoginEl.style.display = '';
        if (acctSignupEl) acctSignupEl.style.display = '';
        console.log('[common.js] auth page override: hid acctLogout');
      }
    } catch (e) { console.error('[common.js] auth page override error', e); }
  }, 300);

  // Google Translate widget initialization
  const translateContainer = document.getElementById('google_translate_element');
  if (translateContainer) {
    console.log('[common.js] Initializing Google Translate...');
    
    window.googleTranslateElementInit = function() {
      try {
        new google.translate.TranslateElement({
          pageLanguage: 'ko',
          includedLanguages: 'ko,en,ja,zh-CN,zh-TW,fr,es',
          layout: google.translate.TranslateElement.InlineLayout.SIMPLE
        }, 'google_translate_element');
        console.log('[common.js] Google Translate initialized');
      } catch (e) {
        console.error('[common.js] Google Translate init error:', e);
      }
    };

    const script = document.createElement('script');
    script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.onerror = () => console.error('[common.js] Failed to load Google Translate');
    document.head.appendChild(script);
  }
})();
