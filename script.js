/* VINCI STARS — behaviour. Vanilla JS, no backend, nothing stored or sent by this site. */

/* ===== EDIT HERE ===== */
const CONFIG = {
  starPrice: 500,                       // naira per Star (whole number)
  maxStars: 10000,                      // upper limit for a custom quantity
  quickOptions: [1, 3, 5, 7, 10, 20],
  defaultStars: 3,
  bank: 'PalmPay',
  accountNumber: '8085861456',
  accountName: 'David Oluwasegun Johnson',
  whatsappNumber: '2348085861456',      // international format, digits only
  wishMaxLength: 280,
  birthdayLabel: '23 October'            // shown in the hero and nav; change if the date ever needs updating
};
/* ===================== */

/* ---------- Pure helpers (kept free of the DOM so they can be tested) ---------- */
function formatNaira(n) {
  try {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(n);
  } catch (e) {
    return '₦' + String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
}

/* Returns { value } for a valid whole number of Stars, or { error } with a human message. */
function parseStars(raw, max) {
  const s = String(raw == null ? '' : raw).trim();
  if (s === '') return { empty: true };
  if (/^-/.test(s)) return { error: 'Stars can\'t be negative. Enter 1 or more.' };
  if (/^\d+[.,]\d+$/.test(s) && !/^\d{1,3}(,\d{3})+$/.test(s)) return { error: 'Whole numbers only. A Star can\'t be split.' };
  if (!/^\d+$/.test(s)) return { error: 'Numbers only, please.' };
  const n = Number(s);
  if (!Number.isSafeInteger(n) || n < 1) return { error: 'Enter 1 or more Stars.' };
  if (n > max) return { error: 'The most you can enter here is ' + max.toLocaleString('en-NG') + ' Stars.' };
  return { value: n };
}

/* Parses an amount the visitor typed, e.g. "2500", "2,500", "₦2,500". Whole naira only. */
function parseAmount(raw) {
  const s = String(raw == null ? '' : raw).trim().replace(/[₦\s]|NGN/gi, '');
  if (s === '') return { empty: true };
  if (/^-/.test(s)) return { error: 'The amount can\'t be negative.' };
  if (/^\d{1,3}(,\d{3})+$/.test(s) || /^\d+$/.test(s)) {
    const n = Number(s.replace(/,/g, ''));
    if (!Number.isSafeInteger(n) || n < 1) return { error: 'Enter an amount above ₦0.' };
    return { value: n };
  }
  if (/^\d+[.,]\d+$/.test(s)) return { error: 'Please enter whole naira, without kobo or decimals.' };
  return { error: 'Numbers only, please. For example 2,500.' };
}

function starsLabel(n) { return n + (n === 1 ? ' Star' : ' Stars'); }
function totalFor(stars) { return stars * CONFIG.starPrice; }
function waLink(message) { return 'https://wa.me/' + CONFIG.whatsappNumber + '?text=' + encodeURIComponent(message); }

function buildConfirmMessage(d) {
  const lines = [
    'Hi! Sending my Stars for Davinci\'s birthday 🎂',
    '',
    '*' + starsLabel(d.stars) + '* (' + formatNaira(totalFor(d.stars)) + ')',
    'Amount sent: *' + formatNaira(d.amount) + '*',
    'Name on transfer: ' + d.payerName
  ];
  if (d.amount !== totalFor(d.stars)) lines.push('Note: what I sent is different from my Stars total.');
  if (d.displayName) lines.push('Show me as: ' + d.displayName);
  if (d.reference) lines.push('Ref: ' + d.reference);
  if (d.wish) { lines.push(''); lines.push('Birthday wish: ' + d.wish); }
  lines.push('');
  lines.push('Please confirm once you\'ve checked the ' + CONFIG.bank + ' transfer. Thank you 🙏');
  return lines.join('\n');
}

function buildWishMessage(name, wish) {
  return 'Happy birthday, Davinci! 🎂\n\n' + wish + (name ? '\n\n— ' + name : '');
}

if (typeof module !== 'undefined') {
  module.exports = { CONFIG, formatNaira, parseStars, parseAmount, totalFor, waLink, buildConfirmMessage, buildWishMessage, starsLabel };
}

/* ---------- DOM ---------- */
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', function () {
    const $ = (id) => document.getElementById(id);
    let stars = CONFIG.defaultStars;
    const mismatch = $('mismatch');
    let pendingData = null;
    function hideMismatch() { mismatch.hidden = true; pendingData = null; }

    /* Fill editable values */
    document.querySelectorAll('[data-price]').forEach((el) => { el.textContent = formatNaira(CONFIG.starPrice); });
    $('acct-bank').textContent = CONFIG.bank;
    $('acct-num').textContent = CONFIG.accountNumber;
    $('acct-name').textContent = CONFIG.accountName;
    if (CONFIG.birthdayLabel) {
      document.querySelectorAll('[data-birthday-label],[data-birthday-tag]').forEach((el) => { el.textContent = CONFIG.birthdayLabel; });
    }

    /* Quick chips */
    const chips = $('chips');
    CONFIG.quickOptions.forEach((n) => {
      const wrap = document.createElement('div'); wrap.className = 'chip';
      wrap.innerHTML = '<input type="radio" name="stars" id="q' + n + '" value="' + n + '"><label for="q' + n + '"><span class="n">' + n + '</span><span class="u">' + (n === 1 ? 'Star' : 'Stars') + '</span></label>';
      chips.appendChild(wrap);
    });
    const customInput = $('custom-qty'), customMsg = $('custom-msg');

    function render() {
      const valid = stars != null;
      $('sel-label').textContent = valid ? starsLabel(stars) : 'No quantity selected';
      $('total-value').textContent = valid ? formatNaira(totalFor(stars)) : '—';
      $('total-formula').textContent = valid ? stars + ' × ' + formatNaira(CONFIG.starPrice) : 'Total = Number of Stars × ' + formatNaira(CONFIG.starPrice);
      $('acct-amount').textContent = valid ? formatNaira(totalFor(stars)) : '—';
      $('recap').textContent = valid ? 'Selected: ' + starsLabel(stars) + ' · ' + formatNaira(totalFor(stars)) : 'No Stars selected yet. Choose a quantity above.';
      $('use-total').hidden = !valid;
      if (valid) $('use-total').textContent = 'Use ' + formatNaira(totalFor(stars)) + ' (selected total)';
      hideMismatch();
    }

    chips.addEventListener('change', function (e) {
      if (e.target.name !== 'stars') return;
      stars = Number(e.target.value);
      customInput.value = ''; customMsg.textContent = '';
      customInput.setAttribute('aria-invalid', 'false');
      customInput.parentElement.classList.remove('has-value');
      render();
    });

    customInput.addEventListener('input', function () {
      const r = parseStars(customInput.value, CONFIG.maxStars);
      chips.querySelectorAll('input').forEach((i) => { i.checked = false; });
      customInput.parentElement.classList.toggle('has-value', !r.empty);
      if (r.empty) { stars = null; customMsg.textContent = ''; customInput.setAttribute('aria-invalid', 'false'); }
      else if (r.error) { stars = null; customMsg.textContent = r.error; customInput.setAttribute('aria-invalid', 'true'); }
      else { stars = r.value; customMsg.textContent = ''; customInput.setAttribute('aria-invalid', 'false'); }
      render();
    });

    const def = $('q' + CONFIG.defaultStars);
    if (def) def.checked = true; else stars = null;
    render();

    /* Copy account number */
    const copyStatus = $('copy-status');
    $('copy-btn').addEventListener('click', async function () {
      copyStatus.classList.remove('err');
      let ok = false;
      try {
        if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(CONFIG.accountNumber); ok = true; }
      } catch (e) { ok = false; }
      if (!ok) {
        try {
          const r = document.createRange(); r.selectNodeContents($('acct-num'));
          const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(r);
          ok = document.execCommand('copy');
        } catch (e) { ok = false; }
      }
      if (ok) copyStatus.textContent = 'Account number copied.';
      else {
        const r = document.createRange(); r.selectNodeContents($('acct-num'));
        const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(r);
        copyStatus.classList.add('err');
        copyStatus.textContent = 'Couldn\'t copy automatically. The number is selected, so press and hold to copy.';
      }
      clearTimeout(copyStatus._t);
      if (ok) copyStatus._t = setTimeout(() => { copyStatus.textContent = ''; }, 3500);
    });

    /* Character counters */
    function counter(textareaId, countId) {
      const t = $(textareaId), c = $(countId);
      const upd = () => { c.textContent = t.value.length + ' / ' + CONFIG.wishMaxLength; };
      t.maxLength = CONFIG.wishMaxLength; t.addEventListener('input', upd); upd();
    }
    counter('wish-confirm', 'wish-confirm-count');
    counter('wish-text', 'wish-text-count');

    function setErr(inputId, errId, msg) {
      const i = $(inputId), e = $(errId);
      e.textContent = msg || '';
      if (msg) i.setAttribute('aria-invalid', 'true'); else i.removeAttribute('aria-invalid');
    }

    function afterOpen(el, url, text) {
      el.hidden = false;
      el.innerHTML = '';
      const p = document.createElement('span'); p.textContent = text + ' ';
      const a = document.createElement('a'); a.href = url; a.target = '_blank'; a.rel = 'noopener noreferrer'; a.textContent = 'Didn\'t open? Tap here to open WhatsApp.';
      el.appendChild(p); el.appendChild(a);
    }
    function openWA(url) { window.open(url, '_blank', 'noopener'); }

    /* Confirmation form */
    const form = $('confirm-form');
    $('amount').addEventListener('input', hideMismatch);

    $('use-total').addEventListener('click', function () {
      if (stars == null) return;
      $('amount').value = String(totalFor(stars)); setErr('amount', 'amount-err', ''); hideMismatch();
    });

    function finishConfirm(d) {
      const url = waLink(buildConfirmMessage(d));
      openWA(url);
      afterOpen($('wa-after'), url, 'WhatsApp should now be open with your message ready. Nothing has been sent until you press send, and your transfer is not confirmed until a person has checked it.');
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      $('form-error').textContent = '';
      $('wa-after').hidden = true;
      let bad = null;

      const payerName = $('payer-name').value.trim();
      if (payerName.length < 2) { setErr('payer-name', 'payer-name-err', 'Enter the name that appears on your transfer.'); bad = bad || 'payer-name'; }
      else setErr('payer-name', 'payer-name-err', '');

      const a = parseAmount($('amount').value);
      if (a.empty) { setErr('amount', 'amount-err', 'Enter the amount you transferred.'); bad = bad || 'amount'; }
      else if (a.error) { setErr('amount', 'amount-err', a.error); bad = bad || 'amount'; }
      else setErr('amount', 'amount-err', '');

      if (stars == null) { $('form-error').textContent = 'Choose how many Stars first, in the selector above.'; bad = bad || 'form-error'; }

      if (bad) { const el = $(bad); if (el && el.focus) el.focus(); return; }

      const d = {
        payerName, stars, amount: a.value,
        displayName: $('display-name').value.trim(),
        reference: $('reference').value.trim(),
        wish: $('wish-confirm').value.trim()
      };

      const expected = totalFor(stars);
      if (d.amount !== expected) {
        pendingData = d;
        $('mismatch-text').textContent = 'You selected ' + starsLabel(stars) + ' (' + formatNaira(expected) + '), but entered ' + formatNaira(d.amount) + ' as the amount transferred. Please check which one is right. If you did send ' + formatNaira(d.amount) + ', that\'s fine, and the difference will be shown in your message.';
        $('mismatch-fix').textContent = 'Change amount to ' + formatNaira(expected);
        mismatch.hidden = false;
        mismatch.scrollIntoView({ block: 'center', behavior: 'smooth' });
        return;
      }
      finishConfirm(d);
    });

    $('mismatch-fix').addEventListener('click', function () {
      if (stars == null) return;
      $('amount').value = String(totalFor(stars)); hideMismatch(); $('amount').focus();
    });
    $('mismatch-keep').addEventListener('click', function () {
      if (!pendingData) return;
      const d = pendingData; hideMismatch(); finishConfirm(d);
    });

    /* Independent birthday-wish flow (no payment) */
    $('wish-form').addEventListener('submit', function (e) {
      e.preventDefault();
      $('wish-after').hidden = true;
      const wish = $('wish-text').value.trim();
      if (!wish) { setErr('wish-text', 'wish-text-err', 'Write a short wish first.'); $('wish-text').focus(); return; }
      if (wish.length > CONFIG.wishMaxLength) { setErr('wish-text', 'wish-text-err', 'Please keep it under ' + CONFIG.wishMaxLength + ' characters.'); return; }
      setErr('wish-text', 'wish-text-err', '');
      const url = waLink(buildWishMessage($('wish-name').value.trim(), wish));
      openWA(url);
      afterOpen($('wish-after'), url, 'WhatsApp should now be open with your wish ready. It is only delivered once you press send.');
    });
    $('wish-text').addEventListener('input', function () { if ($('wish-text').value.trim()) setErr('wish-text', 'wish-text-err', ''); });

    /* Gentle reveals (skipped when reduced motion is preferred or IntersectionObserver is missing) */
    const els = document.querySelectorAll('.reveal');
    const calm = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (calm || !('IntersectionObserver' in window)) { els.forEach((el) => el.classList.add('in')); }
    else {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
      }, { threshold: 0.12 });
      els.forEach((el) => io.observe(el));
    }
  });
}
