/* Cedar Chiropractic — light interactions */

/* ---------- Form spam guard (used by the contact form and the text widget) ----------
   Fetches a signed load-time token for the server's time trap and renders a
   Cloudflare Turnstile check into the given slot. The server (api/_guard.js) does
   the real enforcement; this only collects what it needs. */
window.CedarGuard = (function () {
  var SITE_KEY = '0x4AAAAAAFsSBElEKIA58WdN';
  var apiReady = null;

  function loadTurnstile() {
    if (!apiReady) {
      apiReady = new Promise(function (resolve, reject) {
        if (window.turnstile) return resolve(window.turnstile);
        var s = document.createElement('script');
        s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
        s.async = true;
        s.onload = function () { resolve(window.turnstile); };
        s.onerror = reject;
        document.head.appendChild(s);
      });
    }
    return apiReady;
  }

  function fetchToken() {
    return fetch('/api/form-token', { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : {}; })
      .then(function (d) { return d.t || ''; })
      .catch(function () { return ''; });
  }

  function protect(slot) {
    var token = fetchToken();
    var widgetId = null;
    var answer = '';
    var waiting = [];

    function settle(value) {
      answer = value || '';
      waiting.splice(0).forEach(function (fn) { fn(answer); });
    }

    loadTurnstile().then(function (ts) {
      widgetId = ts.render(slot, {
        sitekey: SITE_KEY,
        size: 'flexible',
        appearance: 'interaction-only',
        callback: settle,
        'expired-callback': function () { answer = ''; },
        'error-callback': function () { settle(''); }
      });
    }).catch(function () { settle(''); });

    // Resolves once Turnstile has answered, or after 10s so a blocked script
    // can't hang the form (the server then rejects and the visitor is told to call).
    function turnstileAnswer() {
      if (answer) return Promise.resolve(answer);
      return new Promise(function (resolve) {
        waiting.push(resolve);
        setTimeout(function () { resolve(answer); }, 10000);
      });
    }

    return {
      fields: function () {
        return Promise.all([token, turnstileAnswer()]).then(function (v) {
          return { ft: v[0], 'cf-turnstile-response': v[1] };
        });
      },
      reset: function () {
        token = fetchToken();
        answer = '';
        if (window.turnstile && widgetId !== null) window.turnstile.reset(widgetId);
      }
    };
  }

  return { protect: protect };
})();

(function () {
  // Mobile nav toggle
  var toggle = document.getElementById('navToggle');
  var links = document.getElementById('navLinks');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    links.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') { links.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); }
    });
  }

  // Reveal-on-scroll
  var els = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    els.forEach(function (el, i) { el.style.transitionDelay = (Math.min(i % 3, 2) * 90) + 'ms'; io.observe(el); });
    // Safety net: immediately reveal anything already in the viewport on load
    // (IntersectionObserver's initial callback can miss above-the-fold elements).
    requestAnimationFrame(function () {
      els.forEach(function (el) {
        if (el.getBoundingClientRect().top < (window.innerHeight || document.documentElement.clientHeight)) {
          el.classList.add('in'); io.unobserve(el);
        }
      });
    });
  } else {
    els.forEach(function (el) { el.classList.add('in'); });
  }

  // Lead forms (progressive enhancement over the Resend endpoint). The contact page's
  // appointment form and the attorneys page's office form both post to /api/lead
  // through the same spam guard; formType tells the server which one it is.
  wireLeadForm('leadForm', 'formStatus', 'leadTurnstile',
    'Thank you! We received your request and will call to confirm your appointment shortly.');
  wireLeadForm('attorneyForm', 'attorneyStatus', 'attorneyTurnstile',
    'Thank you. Your request reached our front desk, and we will follow up with your office.');

  function wireLeadForm(formId, statusId, slotId, okText) {
    var form = document.getElementById(formId);
    if (!form) return;
    var status = document.getElementById(statusId);
    var guard = window.CedarGuard.protect(document.getElementById(slotId));
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = form.querySelector('button[type=submit]');
      var original = btn ? btn.textContent : '';
      if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }
      status.className = 'form-status';
      var data = Object.fromEntries(new FormData(form).entries());
      guard.fields().then(function (extra) {
        Object.assign(data, extra);
        return fetch('/api/lead', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
      }).then(function (r) {
        if (!r.ok) throw new Error('bad response');
        form.reset();
        guard.reset();
        status.className = 'form-status ok';
        status.textContent = okText;
      }).catch(function () {
        guard.reset();                  // Turnstile answers are single-use
        status.className = 'form-status err';
        status.innerHTML = 'Sorry — something went wrong. Please call us at <a href="tel:+15036532232">(503) 653-2232</a>.';
      }).finally(function () {
        if (btn) { btn.disabled = false; btn.textContent = original; }
      });
    });
  }
})();

/* ---------- Hero headline word rotator ---------- */
(function () {
  var el = document.getElementById('rotator');
  var cursor = document.getElementById('rotatorCursor');
  var data = document.getElementById('rotatorWords');
  if (!el || !data) return;

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) { if (cursor) cursor.style.display = 'none'; return; }

  var words;
  try { words = JSON.parse(data.textContent); } catch (e) { return; }
  if (!Array.isArray(words) || words.length < 2) return;

  var i = 0, pos = words[0].length, deleting = true;

  function tick() {
    var word = words[i];
    if (deleting) {
      pos--;
      if (pos <= 0) { deleting = false; i = (i + 1) % words.length; }
    } else {
      pos++;
      if (pos >= word.length) {
        pos = word.length;
        deleting = true;
        el.textContent = word;
        setTimeout(tick, 2200);
        return;
      }
    }
    el.textContent = words[i].slice(0, pos);
    setTimeout(tick, deleting ? 45 : 85);
  }

  setTimeout(tick, 2200);

  if (cursor) {
    setInterval(function () {
      cursor.style.opacity = cursor.style.opacity === '0' ? '1' : '0';
    }, 550);
  }
})();
