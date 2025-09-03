// js/verificar.js
// Asegurar que CONFIG esté disponible solo si no existe
if (typeof CONFIG === 'undefined') {
    var CONFIG = { API_BASE_URL: window.location.origin };
  }
  
  window.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('verifyFormElement');
    const msg = document.getElementById('verifyMessage');
    const maskedEmailSpan = document.getElementById('maskedEmail');
  
    // Inputs
    const usernameInput = document.getElementById('username'); // <input id="username" ...>
    const codeInput = document.getElementById('verifyCode');   // <input id="verifyCode" ...>
  
    // Email enmascarado (fijo para mostrar)
    if (maskedEmailSpan) maskedEmailSpan.textContent = 'hernan*****@gmail.com';
  
    // Prefill si llega ?username=... o ?u=...
    const qp = new URLSearchParams(location.search);
    const qpUser = qp.get('username') || qp.get('u');
    if (qpUser && usernameInput) usernameInput.value = qpUser;
  
    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
  
             const username = (usernameInput?.value || '').trim();
       const codigo = (codeInput?.value || '').trim();
       
       console.log('[verify] Form data:', { username, codigo });
  
      if (!username || !codigo) {
        return showMessage(msg, 'Complete usuario y código.', 'error');
      }
  
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verificando...';
  
      try {
        const url = `${CONFIG.API_BASE_URL}/api/usuarios/verificar`;
        console.log('[verify] POST', url, { username, codigo });
  
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, codigo })
        });
  
        const ct = res.headers.get('content-type') || '';
        const payload = ct.includes('application/json') ? await res.json() : await res.text();
        const bodyText = typeof payload === 'string' ? payload : (payload.message || payload.error || JSON.stringify(payload));
        console.log('[verify] response', res.status, res.statusText, bodyText);
  
        if (res.ok) {
          showMessage(msg, '¡Usuario verificado! Redirigiendo al login...', 'success');
          setTimeout(() => { window.location.href = 'login.html'; }, 1500);
          return;
        }
  
        showMessage(msg, bodyText || `No se pudo verificar (HTTP ${res.status}).`, 'error');
      } catch (err) {
        console.error('[verify] network error', err, 'API_BASE_URL:', CONFIG.API_BASE_URL, 'page:', location.href);
        const mixed = (location.protocol === 'http:' && CONFIG.API_BASE_URL.startsWith('https:'))
          ? ' Puede ser contenido mixto (HTTP→HTTPS). Abre la URL de la API en el navegador y acepta el certificado si lo pide.'
          : '';
        showMessage(msg, 'Error de conexión.' + mixed, 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
    });
  
    function showMessage(el, text, type) {
      if (!el) return;
      el.textContent = text;
      el.className = `message ${type}`;
      el.style.display = 'block';
      if (type === 'success') setTimeout(() => { el.style.display = 'none'; }, 5000);
    }
  });
  