/* Cedar Chiropractic — light interactions */
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

  // Lead / appointment form (progressive enhancement over Resend endpoint)
  var form = document.getElementById('leadForm');
  if (form) {
    var status = document.getElementById('formStatus');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = form.querySelector('button[type=submit]');
      var original = btn ? btn.textContent : '';
      if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }
      status.className = 'form-status';
      var data = Object.fromEntries(new FormData(form).entries());
      fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(function (r) {
        if (!r.ok) throw new Error('bad response');
        form.reset();
        status.className = 'form-status ok';
        status.textContent = 'Thank you! We received your request and will call to confirm your appointment shortly.';
      }).catch(function () {
        status.className = 'form-status err';
        status.innerHTML = 'Sorry — something went wrong. Please call us at <a href="tel:+15035550142">(503) 555-0142</a>.';
      }).finally(function () {
        if (btn) { btn.disabled = false; btn.textContent = original; }
      });
    });
  }
})();
