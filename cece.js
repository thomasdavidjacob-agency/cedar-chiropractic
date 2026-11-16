/* =========================================================
   CeCe: Cedar Chiropractic's 24/7 patient assistant

   Scripted, not generative: every answer below is written out word for word,
   using only facts already published on this site. Nothing typed here leaves
   the visitor's browser (no network calls, no storage), so no health
   information is ever collected or kept.

   Phase 1: answers common questions and points to the next step.
   Phase 2: "Help me book" asks two short questions, then opens Jane on the
   exact appointment type with Dr. Fred, where the patient picks a time.

   Rules (see TDJ-Vault, Cedar - Scope Amendment 1): no diagnosis, no medical
   advice, no outcome promises, PIP stays hedged, emergencies go to 911.
   To change an answer, edit the ANSWERS list. To add an appointment type,
   copy its id from https://cedarchiro.janeapp.com/api/v2/treatments.
   ========================================================= */
(function () {
  'use strict';

  var PHONE_DISPLAY = '(503) 653-2232';
  var PHONE_TEL = '+15036532232';
  var JANE = 'https://cedarchiro.janeapp.com/';
  var JANE_BOOK = 'https://cedarchiro.janeapp.com/locations/cedar-chiropractic-physicians-llc/book#/staff_member/1/treatment/';
  var MAPS = 'https://www.google.com/maps/place/?q=place_id:ChIJZ73nkjt1lVQRPp-jUIGLud8';

  // Jane appointment types that can be booked online (treatment ids from Jane).
  var VISIT = {
    newPatient: { id: 1, name: 'New Patient' },
    newPip: { id: 51, name: 'New Patient Examination – Post MVA/PIP' },
    adjustment: { id: 3, name: 'Chiropractic Adjustment' },
    reexam: { id: 4, name: 'Re-examination' },
    maintenance: { id: 5, name: 'Maintenance Care' }
  };

  var reduceMotion = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  var call = '<a href="tel:' + PHONE_TEL + '">' + PHONE_DISPLAY + '</a>';

  /* ---------------------------------------------------------
     Answers. `k` = words that point to this answer when typed.
     --------------------------------------------------------- */
  var ANSWERS = [
    { id: 'hours', topic: 'visit', q: 'What are your hours?',
      k: 'hours hour open opening close closed closing time today tomorrow monday tuesday wednesday thursday friday saturday sunday weekend',
      a: 'Monday, Wednesday and Thursday: 10am to 6pm.<br>Tuesday: 10am to 1pm.<br>Saturday: by appointment.<br>Friday and Sunday: closed.' },
    { id: 'where', topic: 'visit', q: 'Where are you located?',
      k: 'where address location located directions map find parking park milwaukie street harrison wheelchair accessible',
      a: '4141 SE Harrison St, Milwaukie, OR 97222. Free parking on-site, and the office is wheelchair accessible.',
      links: [{ label: 'Get directions', href: MAPS, ext: true }] },
    { id: 'contact', topic: 'visit', q: 'How do I reach the front desk?',
      k: 'phone call number contact reach talk person human someone staff front desk text message',
      a: 'Call us at ' + call + ' during office hours, or send a text to the front desk and we\'ll text you back.',
      text: true },

    { id: 'accepting', topic: 'new', q: 'Are you accepting new patients?',
      k: 'new patient patients accepting taking first time',
      a: 'Yes, new patients are always welcome. You can book online, or call ' + call + '.',
      book: true },
    { id: 'referral', topic: 'new', q: 'Do I need a referral?',
      k: 'referral refer doctor primary physician pcp',
      a: 'No referral needed. You can book directly with us. If your insurance plan has specific requirements, we\'ll help you sort them out.' },
    { id: 'soon', topic: 'new', q: 'How soon can I be seen?',
      k: 'soon soonest earliest available availability opening openings wait week asap quickly',
      a: 'We do our best to see new patients as soon as possible, often within the same week. Online booking shows Dr. Fred\'s open times, or call and we\'ll find the earliest opening that works for you.',
      book: true },
    { id: 'first', topic: 'new', q: 'What happens at the first visit?',
      k: 'first visit expect exam examination consultation happen appointment intake',
      a: '1. Fill out your intake forms ahead of time in the secure patient portal.<br>2. Dr. Fred reviews your history, listens to your concerns, and does a thorough physical and orthopedic exam.<br>3. He explains what he found in plain language and lays out a plan. Many patients begin treatment the same day.',
      links: [{ label: 'New patient page', href: 'new-patients.html' }] },
    { id: 'forms', topic: 'new', q: 'Where are the intake forms?',
      k: 'forms form paperwork intake portal login sign account records',
      a: 'Intake and health-history forms are in the secure patient portal, along with your appointments, visit history and online payment. If you have trouble signing in, call ' + call + ' and we\'ll walk you through it.',
      links: [{ label: 'Open the patient portal', href: JANE, ext: true }] },

    { id: 'plans', topic: 'pay', q: 'What insurance do you take?',
      k: 'insurance insurer plan plans accept take aetna blue cross bcbs cigna devoted geha health net hma kaiser oregon health plan ohp medicaid moda pacificsource providence united unitedhealthcare uhc ashn american specialty medicare coverage covered',
      a: 'We bill these plans directly: Aetna, American Specialty Health (ASHN), Blue Cross Blue Shield, Cigna, Devoted, GEHA, Health Net, HMA, Kaiser Permanente, Oregon Health Plan (OHP), Moda, PacificSource, Providence and UnitedHealthcare. We also handle auto-accident (PIP) and workers\' compensation claims.<br><br>Plan participation can change, so please call ' + call + ' to confirm your plan. We\'ll check your benefits for free.',
      links: [{ label: 'Insurance page', href: 'insurance.html' }] },
    { id: 'cost', topic: 'pay', q: 'How much will it cost?',
      k: 'cost costs price prices pricing much pay fee fees charge copay estimate expensive afford',
      a: 'Your cost depends on your insurance and the care you need. We check your benefits for free and tell you your share before care begins. Call ' + call + ' for an estimate.' },
    { id: 'selfpay', topic: 'pay', q: 'What if I don\'t have insurance?',
      k: 'uninsured self pay cash hsa fsa without no insurance',
      a: 'No problem. We offer transparent self-pay rates and accept HSA and FSA, and we\'ll walk you through your options before any care begins.' },
    { id: 'workcomp', topic: 'pay', q: 'Do you take workers\' comp?',
      k: 'workers comp compensation work job injury injured employer hurt work',
      a: 'Yes. We care for on-the-job injuries, document them for your employer and carrier, and bill workers\' compensation claims directly. Call ' + call + ' or text the front desk to set up your first visit.',
      text: true },

    { id: 'pipwhat', topic: 'auto', q: 'I was in a car accident. What do I do?',
      k: 'car accident crash collision wreck rear ended rearended mva motor vehicle hit auto whiplash neck back injury injured hurt',
      a: '1. If anything is urgent (severe head injury, loss of consciousness, chest pain, a possible fracture, or numbness that isn\'t going away), go to an emergency room first.<br>2. Call your own auto insurer, tell them you were in a collision, and open a PIP claim. They\'ll give you a claim number.<br>3. Book an injury evaluation with Dr. Fred. Bring your insurance card, the claim number and any imaging you already have. No claim number yet? Come in anyway and we\'ll help you start it.',
      bookPip: true },
    { id: 'pipbill', topic: 'auto', q: 'Do you bill my auto insurance (PIP)?',
      k: 'pip bill billing billed medpay med pay personal injury protection auto insurance pocket',
      a: 'Yes. We bill PIP directly, so many patients pay nothing out of pocket. Your policy governs, and we check your coverage before your first visit.',
      links: [{ label: 'How auto injury billing works', href: 'auto-injury.html' }] },
    { id: 'piprates', topic: 'auto', q: 'Will using PIP raise my rates?',
      k: 'rates rate premium premiums raise go up fault at-fault',
      a: 'Oregon requires Personal Injury Protection on every auto policy. It\'s no-fault coverage, so a PIP claim isn\'t treated as an at-fault claim against you. Your own policy governs, and your insurer or agent can confirm how it handles claims. This is general information, not legal advice.' },
    { id: 'piplimit', topic: 'auto', q: 'How much does Oregon PIP cover?',
      k: 'limit limits much cover covers coverage long deadline two years lost wages 15000',
      a: 'Every Oregon auto policy carries at least $15,000 in PIP medical benefits per person, for reasonable and necessary treatment within two years of the accident. Many drivers carry more. Your policy governs, so bring your claim number and we\'ll check yours. This is general information, not legal advice.',
      links: [{ label: 'PIP and MedPay guide', href: 'auto-injury-pip-medpay-oregon.html' }] },
    { id: 'pipfine', topic: 'auto', q: 'I feel fine. Should I still get checked?',
      k: 'fine feel okay ok later delayed sore days weeks ago months',
      a: 'Feeling fine right after a crash is common, and soreness often shows up a day or a few days later. Only an exam can tell what\'s going on, so it helps not to wait. If your accident was weeks or months ago, it\'s still worth calling. We\'ll tell you honestly where you stand.',
      bookPip: true },
    { id: 'attorney', topic: 'auto', q: 'I have an attorney, or need records.',
      k: 'attorney lawyer law firm records record report reports lien legal claim adjuster',
      a: 'We coordinate with your attorney and insurer and keep the documentation your claim needs. For records requests or attorney questions, call ' + call + ' or text the front desk.',
      text: true },

    { id: 'services', topic: 'care', q: 'What services do you offer?',
      k: 'services service offer treatments treatment therapies therapy do you do provide',
      a: 'Spinal adjustments, spinal decompression, cervical and lumbar traction, therapeutic ultrasound and e-stim, auto-accident injury care, rehab and corrective exercises, prenatal and pediatric care, work-injury care, and wellness and maintenance visits.',
      links: [{ label: 'All services', href: 'services.html' }] },
    { id: 'fit', topic: 'care', q: 'Can Dr. Fred help with my problem?',
      k: 'help treat treats problem condition issue pain back neck sciatica disc herniated shoulder headache migraine hip knee',
      a: 'Dr. Fred cares for a wide range of concerns, including back and neck pain, sciatica, auto-accident and work injuries, and general wellness. I can\'t tell you what\'s going on or what will help. That takes an exam. If you\'re not sure we\'re the right fit, call ' + call + '. We\'ll give you an honest answer and point you in the right direction if we\'re not.',
      book: true },
    { id: 'adjust', topic: 'care', q: 'What is a spinal adjustment?',
      k: 'adjustment adjustments manipulation crack cracking safe',
      a: 'An adjustment is a precise, gentle spinal manipulation that aims to restore natural movement. Dr. Fred explains what he recommends and why before any treatment.',
      links: [{ label: 'About spinal adjustments', href: 'spinal-adjustments.html' }, { label: 'Are adjustments safe?', href: 'are-chiropractic-adjustments-safe.html' }] },
    { id: 'decomp', topic: 'care', q: 'Do you offer spinal decompression?',
      k: 'decompression traction cervical lumbar stretch',
      a: 'Yes. Spinal decompression and cervical and lumbar traction are non-surgical, drug-free therapies that gently stretch the spine. Whether they fit your situation is something Dr. Fred decides at your exam.',
      links: [{ label: 'About spinal decompression', href: 'spinal-decompression.html' }] },
    { id: 'prenatal', topic: 'care', q: 'Do you see kids or pregnant patients?',
      k: 'prenatal pregnant pregnancy pediatric kids child children baby',
      a: 'Yes. Dr. Fred uses comfortable, low-force techniques for expecting mothers and for children. Call ' + call + ' with any questions before you book.' },
    { id: 'drfred', topic: 'care', q: 'Who is Dr. Fred?',
      k: 'who fred seater doctor dr chiropractor about',
      a: 'Dr. Fred Seater, DC, is Cedar Chiropractic\'s chiropractor. You can read his story on our About page.',
      links: [{ label: 'About Dr. Fred', href: 'about.html' }] }
  ];

  var TOPICS = [
    { id: 'book', label: 'Book an appointment' },
    { id: 'visit', label: 'Hours, location and contact' },
    { id: 'new', label: 'New patients and first visit' },
    { id: 'pay', label: 'Insurance and cost' },
    { id: 'auto', label: 'Car accident and PIP' },
    { id: 'care', label: 'Services' }
  ];

  /* ---------------------------------------------------------
     Matching typed questions (all in the browser)
     --------------------------------------------------------- */
  var EMERGENCY = /\b(911|emergency|chest pain|heart attack|can'?t breathe|cannot breathe|trouble breathing|short(ness)? of breath|unconscious|passed out|pass(ing)? out|faint(ed|ing)?|stroke|seizure|bleeding|can'?t move|cannot move|paraly[sz]ed|lost control of (my )?(bladder|bowel)|severe (head|headache)|hit my head|concussion|broken bone|fracture)\b/i;
  var CRISIS = /\b(suicid\w*|kill myself|end my life|hurt myself|self[- ]harm|overdose)\b/i;
  var STOP = ' a an the i im me my we our you your is are am do does did can could would should will to of in on for at it its this that and or with be have has how what when where who why which about any there get got just'.split(' ');
  var STOPSET = {};
  STOP.forEach(function (w) { if (w) STOPSET[w] = 1; });
  function words(s) {
    return (s.toLowerCase().replace(/['’]/g, '').match(/[a-z0-9]+/g) || [])
      .filter(function (w) { return !STOPSET[w]; })
      .map(function (w) { return w.length > 4 ? w.replace(/(ing|ed|es|s)$/, '') : w; });
  }
  ANSWERS.forEach(function (x) { x.keys = words(x.k + ' ' + x.q); });
  function match(text) {
    var w = words(text);
    if (!w.length) return null;
    var best = null, bestScore = 0;
    ANSWERS.forEach(function (x) {
      var score = 0;
      w.forEach(function (t) { if (x.keys.indexOf(t) !== -1) score += t.length > 3 ? 2 : 1; });
      if (score > bestScore) { best = x; bestScore = score; }
    });
    return bestScore >= 2 ? best : null;
  }

  /* ---------------------------------------------------------
     UI
     --------------------------------------------------------- */
  function el(html) { var d = document.createElement('div'); d.innerHTML = html.trim(); return d.firstChild; }

  var launcher = el(
    '<button class="cc-launch" type="button" aria-expanded="false" aria-controls="ccPanel">' +
      '<img class="cc-avatar cc-avatar--sm" src="images/cece/cece.webp" alt="" width="42" height="42"><span>Ask CeCe</span>' +
    '</button>'
  );
  var panel = el(
    '<div class="cc-panel" id="ccPanel" role="dialog" aria-modal="false" aria-labelledby="ccTitle" hidden>' +
      '<div class="cc-head">' +
        '<img class="cc-avatar" src="images/cece/cece.webp" alt="" width="42" height="42">' +
        '<div><strong id="ccTitle">CeCe</strong><small>Cedar Chiropractic\'s patient assistant</small></div>' +
        '<button class="cc-close" type="button" aria-label="Close">&times;</button>' +
      '</div>' +
      '<div class="cc-log" role="log" aria-live="polite"></div>' +
      '<form class="cc-input">' +
        '<label class="cc-sr" for="ccText">Ask CeCe a question</label>' +
        '<input id="ccText" type="text" maxlength="200" autocomplete="off" placeholder="Ask about hours, insurance, booking…">' +
        '<button type="submit" class="cc-send" aria-label="Send">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
        '</button>' +
      '</form>' +
      '<p class="cc-foot">CeCe is an automated helper, not a medical provider. Please don\'t share medical details here. Nothing you type is sent or saved. Emergency? Call 911.</p>' +
    '</div>'
  );
  document.body.appendChild(launcher);
  document.body.appendChild(panel);

  var log = panel.querySelector('.cc-log');
  var form = panel.querySelector('.cc-input');
  var input = panel.querySelector('#ccText');
  var started = false, isOpen = false;

  function scroll() { log.scrollTop = log.scrollHeight; }
  function say(html, who) {
    var b = el('<div class="cc-msg cc-msg--' + (who || 'bot') + '">' + html + '</div>');
    log.appendChild(b);
    scroll();
    return b;
  }
  function chips(items) {
    var row = el('<div class="cc-chips"></div>');
    items.forEach(function (c) {
      var b = el('<button type="button" class="cc-chip">' + esc(c.label) + '</button>');
      b.addEventListener('click', function () {
        row.remove();
        if (c.echo !== false) say(esc(c.label), 'me');
        c.go();
      });
      row.appendChild(b);
    });
    log.appendChild(row);
    scroll();
  }
  function actions(list) {
    var row = el('<div class="cc-actions"></div>');
    list.forEach(function (a) { row.appendChild(a); });
    log.lastElementChild.appendChild(row);
    scroll();
  }
  function linkBtn(label, href, ext, primary) {
    return el('<a class="cc-btn' + (primary ? ' cc-btn--primary' : '') + '" href="' + esc(href) + '"' +
      (ext ? ' target="_blank" rel="noopener"' : '') + '>' + esc(label) + (ext ? ' <span aria-hidden="true">↗</span>' : '') + '</a>');
  }
  function textBtn() {
    var b = el('<button type="button" class="cc-btn">Text the front desk</button>');
    b.addEventListener('click', function () {
      close(false);
      var t = document.getElementById('txLaunch');
      if (t) t.click();
    });
    return b;
  }
  function callBtn() { return linkBtn('Call ' + PHONE_DISPLAY, 'tel:' + PHONE_TEL, false); }
  function bookBtn(v) { return linkBtn('Book: ' + v.name, JANE_BOOK + v.id, true, true); }

  function menu(prompt) {
    say(prompt || 'What can I help with?');
    chips(TOPICS.map(function (t) {
      return { label: t.label, go: function () { t.id === 'book' ? bookStart() : topic(t.id); } };
    }));
  }
  function topic(id) {
    var list = ANSWERS.filter(function (x) { return x.topic === id; });
    say('Pick a question, or type your own below.');
    chips(list.map(function (x) { return { label: x.q, go: function () { answer(x); } }; })
      .concat([{ label: 'Back to the menu', go: function () { menu(); } }]));
  }
  function answer(x) {
    say(x.a);
    var acts = (x.links || []).map(function (l) { return linkBtn(l.label, l.href, l.ext); });
    if (x.text) acts.push(textBtn());
    if (acts.length) actions(acts);
    var next = [];
    if (x.bookPip) next.push({ label: 'Book an injury evaluation', go: function () { bookFor(VISIT.newPip, true); } });
    else if (x.book) next.push({ label: 'Help me book', go: bookStart });
    next.push({ label: 'Ask something else', go: function () { menu(); } });
    chips(next);
  }

  /* Phase 2: guided booking into Jane */
  function bookStart() {
    say('Happy to help. Have you been to Cedar Chiropractic before?');
    chips([
      { label: 'This is my first visit', go: function () {
        say('Is this visit about a car accident, a work injury, or something else?');
        chips([
          { label: 'A car accident', go: function () { bookFor(VISIT.newPip, true); } },
          { label: 'A work injury', go: workInjury },
          { label: 'Something else', go: function () { bookFor(VISIT.newPatient, true); } }
        ]);
      } },
      { label: 'I\'ve been before', go: function () {
        say('What kind of visit do you need?');
        chips([
          { label: 'An adjustment', go: function () { bookFor(VISIT.adjustment); } },
          { label: 'A re-examination', go: function () { bookFor(VISIT.reexam); } },
          { label: 'A maintenance visit', go: function () { bookFor(VISIT.maintenance); } },
          { label: 'I\'m not sure', go: notSure }
        ]);
      } }
    ]);
  }
  function bookFor(v, isNew) {
    var extra = v === VISIT.newPip
      ? ' Bring your insurance card, your PIP claim number if you have one, and any imaging you already have.'
      : isNew ? ' Bring your insurance card. You can fill out your intake forms ahead of time in the patient portal.' : '';
    say('The right visit is <strong>' + esc(v.name) + '</strong> with Dr. Fred. The button below opens our online booking with that visit already picked, so you just choose a time.' + extra);
    actions([bookBtn(v), callBtn()]);
    chips([{ label: 'Ask something else', go: function () { menu(); } }]);
  }
  function workInjury() {
    say('Work injuries need a few details from the front desk before the first visit. Call ' + call + ' or send a text, and we\'ll get you scheduled.');
    actions([callBtn(), textBtn()]);
    chips([{ label: 'Ask something else', go: function () { menu(); } }]);
  }
  function notSure() {
    say('No problem. The front desk can tell you which visit Dr. Fred wants next. Call ' + call + ' or send a text.');
    actions([callBtn(), textBtn()]);
    chips([{ label: 'Ask something else', go: function () { menu(); } }]);
  }

  function typed(text) {
    say(esc(text), 'me');
    if (CRISIS.test(text)) {
      say('If you are thinking about hurting yourself, please call or text <a href="tel:988">988</a> (Suicide and Crisis Lifeline) now, any time. If you are in immediate danger, call <a href="tel:911">911</a>.');
      return;
    }
    if (EMERGENCY.test(text)) {
      say('<strong>If this is an emergency, call <a href="tel:911">911</a> now.</strong> A severe head injury, loss of consciousness, chest pain, a possible fracture, or numbness that isn\'t going away belongs in an emergency room first. Chiropractic care comes after those are ruled out.');
      chips([{ label: 'Ask something else', go: function () { menu(); } }]);
      return;
    }
    if (/\b(book|schedule|appointment|appt|reschedule|cancel)\b/i.test(text)) {
      if (/\b(reschedule|cancel)\b/i.test(text)) {
        say('You can reschedule or cancel in the patient portal, or call ' + call + '.');
        actions([linkBtn('Open the patient portal', JANE, true), callBtn()]);
        chips([{ label: 'Ask something else', go: function () { menu(); } }]);
        return;
      }
      bookStart();
      return;
    }
    var x = match(text);
    if (x) { answer(x); return; }
    say('I can only answer general questions about the office, and I can\'t give medical advice. For anything else, the front desk is happy to help: call ' + call + ' or send a text.');
    actions([callBtn(), textBtn()]);
    chips([{ label: 'Show me the menu', go: function () { menu(); } }]);
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var t = input.value.trim().slice(0, 200);
    if (!t) return;
    input.value = '';
    typed(t);
  });

  function open() {
    if (isOpen) return;
    isOpen = true;
    if (!started) {
      started = true;
      say('Hi, I\'m CeCe. I can answer common questions about Cedar Chiropractic and help you book with Dr. Fred, any time of day.');
      menu('What can I help with?');
    }
    panel.hidden = false;
    launcher.hidden = true;
    launcher.setAttribute('aria-expanded', 'true');
    requestAnimationFrame(function () { panel.classList.add('is-open'); });
    var first = log.querySelector('.cc-chip') || input;
    first.focus({ preventScroll: true });
  }
  function close(refocus) {
    if (!isOpen) return;
    isOpen = false;
    panel.classList.remove('is-open');
    launcher.setAttribute('aria-expanded', 'false');
    var done = function () { panel.hidden = true; launcher.hidden = false; if (refocus !== false) launcher.focus(); };
    if (reduceMotion) done(); else window.setTimeout(done, 240);
  }
  launcher.addEventListener('click', open);
  panel.querySelector('.cc-close').addEventListener('click', function () { close(); });
  panel.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  // Any element with data-cece opens CeCe (page CTAs).
  document.addEventListener('click', function (e) {
    var t = e.target.closest ? e.target.closest('[data-cece]') : null;
    if (t) { e.preventDefault(); open(); }
  });
  // Keep CeCe out of the way while the texting panel is open.
  var tx = document.getElementById('txLaunch');
  if (tx && window.MutationObserver) {
    new MutationObserver(function () { launcher.classList.toggle('is-tucked', tx.hidden); })
      .observe(tx, { attributes: true, attributeFilter: ['hidden'] });
  }
})();
