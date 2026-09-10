/* =========================================================
   Cedar Chiropractic — front-desk texting widget + delayed PIP notice

   Both UIs are injected here rather than duplicated into every page, so
   the copy and behaviour stay in one place. Markup mirrors the classes
   defined under "TEXT-US WIDGET" and "DELAYED PIP MODAL" in style.css.
   ========================================================= */
(function () {
  'use strict';

  var PHONE_DISPLAY = '(503) 653-2232';
  var PHONE_TEL = '+15036532232';
  var FRONT_DESK = 'Bobbie';

  var POPUP_KEY = 'cedar_pip_notice_seen';
  var POPUP_QUIET_DAYS = 7;      // don't re-show to the same visitor for a week
  var POPUP_DELAY_MS = 18000;    // ~18s, or earlier if they scroll halfway
  var POPUP_SCROLL_PCT = 0.5;
  var POPUP_MIN_DWELL_MS = 7000; // floor before the scroll trigger may fire

  // Utility pages where an insurance pop-up would just be in the way.
  var POPUP_SKIP = ['privacy.html', 'review.html', 'portal.html'];

  var reduceMotion = window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  function el(html) {
    var d = document.createElement('div');
    d.innerHTML = html.trim();
    return d.firstChild;
  }

  // localStorage throws in some privacy modes — never let that break the page.
  function storeGet(k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } }
  function storeSet(k, v) { try { window.localStorage.setItem(k, v); } catch (e) { /* no-op */ } }

  /* ---------------------------------------------------------
     Shared dialog helpers: focus trap, ESC, focus restore
     --------------------------------------------------------- */
  var FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),textarea:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';

  function trapFocus(container, e) {
    if (e.key !== 'Tab') return;
    var items = container.querySelectorAll(FOCUSABLE);
    if (!items.length) return;
    var first = items[0];
    var last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  /* =========================================================
     1. Front-desk texting widget
     ========================================================= */
  var launcher = el(
    '<button class="tx-launch" id="txLaunch" type="button" aria-expanded="false" aria-controls="txPanel">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" aria-hidden="true">' +
        '<path d="M21 11.5a8.4 8.4 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.4 8.4 0 01-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.4 8.4 0 013.8-.9h.5a8.5 8.5 0 018 8v.5z" stroke-linecap="round" stroke-linejoin="round"/>' +
      '</svg>' +
      '<span>Text us</span>' +
      '<span class="tx-launch__dot" aria-hidden="true"></span>' +
    '</button>'
  );

  var panel = el(
    '<div class="tx-panel" id="txPanel" role="dialog" aria-modal="false" aria-labelledby="txTitle" hidden>' +
      '<div class="tx-head">' +
        '<span class="tx-head__avatar" aria-hidden="true">B</span>' +
        '<div>' +
          '<strong id="txTitle">Text our front desk</strong>' +
          '<small>' + FRONT_DESK + ' answers during office hours</small>' +
        '</div>' +
        '<button class="tx-head__close" id="txClose" type="button" aria-label="Close">&times;</button>' +
      '</div>' +
      '<div class="tx-body" id="txBody">' +
        '<div class="tx-bubble">' +
          '<p>Hi — send us a message and we\'ll text you right back on your phone. ' +
          'If you were hurt in an accident, tell us when it happened and we\'ll get you in quickly.</p>' +
        '</div>' +
        '<form class="tx-form" id="txForm" novalidate>' +
          '<div class="tx-row">' +
            '<div><label for="txName">Your name</label>' +
            '<input id="txName" name="name" type="text" autocomplete="name" required></div>' +
            '<div><label for="txPhone">Mobile number</label>' +
            '<input id="txPhone" name="phone" type="tel" autocomplete="tel" inputmode="tel" required></div>' +
          '</div>' +
          '<div><label for="txMessage">How can we help?</label>' +
          '<textarea id="txMessage" name="message" required placeholder="I was rear-ended on Tuesday and my neck is stiff…"></textarea></div>' +
          '<div class="tx-hp" aria-hidden="true"><label for="txCompany">Company</label>' +
          '<input id="txCompany" name="company" type="text" tabindex="-1" autocomplete="off"></div>' +
          '<div class="tx-status" id="txStatus" role="status" aria-live="polite"></div>' +
          '<button type="submit" class="btn btn--primary">Send text</button>' +
          '<p class="tx-note">By sending, you agree to receive text messages from us about your ' +
          'inquiry. Message and data rates may apply. Please don\'t include sensitive medical ' +
          'details — text isn\'t a secure channel, and we\'ll gather your history privately at ' +
          'your visit. See our <a href="privacy.html">Privacy Policy</a>.</p>' +
        '</form>' +
        '<p class="tx-alt">Rather talk now? Call <a href="tel:' + PHONE_TEL + '">' + PHONE_DISPLAY + '</a></p>' +
      '</div>' +
    '</div>'
  );

  document.body.appendChild(launcher);
  document.body.appendChild(panel);

  var txClose = panel.querySelector('#txClose');
  var txForm = panel.querySelector('#txForm');
  var txStatus = panel.querySelector('#txStatus');
  var txBody = panel.querySelector('#txBody');
  var panelOpen = false;

  function openPanel() {
    if (panelOpen) return;
    panelOpen = true;
    closeModal();                       // never stack the pop-up over the widget
    panel.hidden = false;
    launcher.hidden = true;
    launcher.setAttribute('aria-expanded', 'true');
    // next frame so the transition actually runs
    requestAnimationFrame(function () { panel.classList.add('is-open'); });
    var firstField = panel.querySelector('#txName');
    if (firstField) firstField.focus();
  }

  function closePanel() {
    if (!panelOpen) return;
    panelOpen = false;
    panel.classList.remove('is-open');
    launcher.setAttribute('aria-expanded', 'false');
    var done = function () { panel.hidden = true; launcher.hidden = false; launcher.focus(); };
    if (reduceMotion) done(); else window.setTimeout(done, 240);
  }

  launcher.addEventListener('click', openPanel);
  txClose.addEventListener('click', closePanel);

  // Escape closes. No focus trap here on purpose — the panel is non-modal, so a
  // keyboard user must be able to Tab straight back out into the page.
  panel.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { e.stopPropagation(); closePanel(); }
  });

  // Any element with data-text-us opens the widget (used by the pop-up and page CTAs).
  document.addEventListener('click', function (e) {
    var trigger = e.target.closest ? e.target.closest('[data-text-us]') : null;
    if (trigger) { e.preventDefault(); openPanel(); }
  });

  txForm.addEventListener('submit', function (e) {
    e.preventDefault();

    var btn = txForm.querySelector('button[type=submit]');
    // Addressed by id, not form.<name> — `form.name` resolves to the form's own
    // name property rather than the field, which would blow up here.
    var payload = {
      name: panel.querySelector('#txName').value.trim(),
      phone: panel.querySelector('#txPhone').value.trim(),
      message: panel.querySelector('#txMessage').value.trim(),
      company: panel.querySelector('#txCompany').value,  // honeypot: real people leave this empty
      page: window.location.pathname
    };

    if (!payload.name || !payload.phone || !payload.message) {
      txStatus.className = 'tx-status is-err';
      txStatus.textContent = 'Please add your name, mobile number, and a short message.';
      return;
    }
    // 10 digits for a US number, allowing a leading 1.
    var digits = payload.phone.replace(/\D/g, '');
    if (digits.length < 10 || digits.length > 11) {
      txStatus.className = 'tx-status is-err';
      txStatus.textContent = 'Please enter a 10-digit mobile number so we can text you back.';
      return;
    }

    txStatus.className = 'tx-status';
    txStatus.textContent = '';
    if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }

    fetch('/api/text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function (r) {
      if (!r.ok) throw new Error('bad response');
      showSent(payload.name);
    }).catch(function () {
      txStatus.className = 'tx-status is-err';
      txStatus.innerHTML = 'That didn\'t go through. Please call us at <a href="tel:' +
        PHONE_TEL + '">' + PHONE_DISPLAY + '</a> and we\'ll take care of you.';
      if (btn) { btn.disabled = false; btn.textContent = 'Send text'; }
    });
  });

  function showSent(name) {
    var first = (name || '').split(' ')[0];
    txBody.innerHTML =
      '<div class="tx-sent">' +
        '<div class="tx-sent__ring">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">' +
            '<path d="M20 6 9 17l-5-5" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
        '</div>' +
        '<h3>Message sent' + (first ? ', ' + escapeHtml(first) : '') + '</h3>' +
        '<p>It just landed on our front-desk phone. ' + FRONT_DESK + ' will text you back at the ' +
        'number you gave us — usually within a few minutes during office hours.</p>' +
        '<p class="tx-note">Office hours: Mon, Wed, Thu 10am–6pm · Tue 10am–1pm · Sat by appointment. ' +
        'Outside those hours we\'ll reply first thing the next business day. ' +
        'If this is an emergency, please call 911.</p>' +
        '<p class="tx-alt" style="border-top:0;padding-top:6px">Need us now? Call ' +
        '<a href="tel:' + PHONE_TEL + '">' + PHONE_DISPLAY + '</a></p>' +
      '</div>';
    var closeBtn = panel.querySelector('#txClose');
    if (closeBtn) closeBtn.focus();
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* =========================================================
     2. Delayed PIP notice
     ========================================================= */
  var here = window.location.pathname.split('/').pop() || 'index.html';
  var skipPopup = POPUP_SKIP.indexOf(here) !== -1;

  var seenAt = Number(storeGet(POPUP_KEY) || 0);
  var quietUntil = seenAt + POPUP_QUIET_DAYS * 24 * 60 * 60 * 1000;
  if (seenAt && Date.now() < quietUntil) skipPopup = true;

  var modal = null;
  var modalOpen = false;
  var lastFocus = null;

  function buildModal() {
    return el(
      '<div class="modal" id="pipModal" role="dialog" aria-modal="true" aria-labelledby="pipTitle" hidden>' +
        '<div class="modal__card">' +
          '<button class="modal__close" id="pipClose" type="button" aria-label="Close">&times;</button>' +
          '<div class="modal__band">' +
            '<span class="eyebrow" id="pipEyebrow">Hurt in a car accident?</span>' +
            '<h2 id="pipTitle">Using your PIP benefits will not raise your rates</h2>' +
          '</div>' +
          '<div class="modal__body">' +
            '<p>Many people put off treatment after a crash because they\'re worried a claim will ' +
            'cost them later. In Oregon it works differently: Personal Injury Protection (PIP) is ' +
            'no-fault coverage already built into your auto policy, and it exists to pay for your ' +
            'care right away.</p>' +
            '<ul class="checklist">' +
              '<li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6 9 17l-5-5" stroke-linecap="round" stroke-linejoin="round"/></svg> ' +
                '<span><strong>Your premium doesn\'t go up</strong> for using the PIP benefits you already pay for.</span></li>' +
              '<li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6 9 17l-5-5" stroke-linecap="round" stroke-linejoin="round"/></svg> ' +
                '<span><strong>Fault doesn\'t matter.</strong> PIP pays your treatment either way.</span></li>' +
              '<li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6 9 17l-5-5" stroke-linecap="round" stroke-linejoin="round"/></svg> ' +
                '<span><strong>At least $15,000</strong> in medical benefits sits on every Oregon auto policy.</span></li>' +
              '<li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6 9 17l-5-5" stroke-linecap="round" stroke-linejoin="round"/></svg> ' +
                '<span><strong>We bill your PIP carrier directly</strong> — most patients start care with nothing out of pocket.</span></li>' +
            '</ul>' +
            '<div class="modal__actions">' +
              '<button type="button" class="btn btn--primary" data-text-us>Text our front desk</button>' +
              '<a class="btn btn--ghost" href="auto-injury.html">Auto injury care</a>' +
            '</div>' +
            '<p class="modal__fine">Oregon auto policies are required to carry PIP, and benefits are ' +
            'paid on a no-fault basis — so a PIP claim isn\'t treated as an at-fault claim against ' +
            'you. Your own limits and terms are set by your policy; your insurer or agent can ' +
            'confirm the specifics, and we\'re glad to review your benefits with you at no charge. ' +
            'This is general information, not legal or insurance advice.</p>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }

  function openModal() {
    if (modalOpen || panelOpen) return;
    modal = buildModal();
    document.body.appendChild(modal);
    modalOpen = true;
    lastFocus = document.activeElement;
    modal.hidden = false;
    document.body.classList.add('has-dialog');
    requestAnimationFrame(function () { modal.classList.add('is-open'); });

    storeSet(POPUP_KEY, String(Date.now()));

    modal.querySelector('#pipClose').focus();
    modal.querySelector('#pipClose').addEventListener('click', closeModal);
    modal.addEventListener('click', function (e) {
      if (e.target === modal) closeModal();      // backdrop click
    });
    modal.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeModal();
      else trapFocus(modal, e);
    });
  }

  function closeModal() {
    if (!modalOpen || !modal) return;
    modalOpen = false;
    document.body.classList.remove('has-dialog');
    modal.classList.remove('is-open');
    var node = modal;
    modal = null;
    var done = function () {
      if (node.parentNode) node.parentNode.removeChild(node);
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    };
    if (reduceMotion) done(); else window.setTimeout(done, 280);
  }

  if (!skipPopup) {
    var arrived = Date.now();
    var fired = false;
    var fire = function () {
      if (fired) return;
      fired = true;
      window.removeEventListener('scroll', onScroll);
      openModal();
    };
    var onScroll = function () {
      // Short pages hit 50% on the first flick of the wheel, which reads as an
      // instant pop-up. Give the visitor a few seconds to actually be reading.
      if (Date.now() - arrived < POPUP_MIN_DWELL_MS) return;
      var doc = document.documentElement;
      var scrolled = (window.pageYOffset || doc.scrollTop) + window.innerHeight;
      if (scrolled >= doc.scrollHeight * POPUP_SCROLL_PCT) fire();
    };
    window.setTimeout(fire, POPUP_DELAY_MS);
    window.addEventListener('scroll', onScroll, { passive: true });
  }
})();
