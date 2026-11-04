const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];

function toast(msg) {
  const t = $('#toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toast.t);
  toast.t = setTimeout(() => t.classList.remove('show'), 3500);
}

/* header, menu, back-to-top */
const header = $('#header'), toTop = $('#toTop');
addEventListener('scroll', () => {
  header?.classList.toggle('stuck', scrollY > 10);
  toTop?.classList.toggle('show', scrollY > 500);
});
toTop?.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));
const burger = $('#burger'), menu = $('#menu');
const setMenu = open => {
  menu?.classList.toggle('open', open);
  burger?.classList.toggle('open', open);
  burger?.setAttribute('aria-expanded', open);
};
burger?.addEventListener('click', e => { e.stopPropagation(); setMenu(!menu.classList.contains('open')); });
$$('#menu a').forEach(a => a.addEventListener('click', () => setMenu(false)));
document.addEventListener('click', e => { if (menu && !menu.contains(e.target)) setMenu(false); });
addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
addEventListener('resize', () => { if (innerWidth > 860) setMenu(false); });

/* scroll fade-in + counters */
$$('.cat,.step,.ben,.testi,.post,.pickup,.app-feats>div,.stat-grid>div').forEach(el => el.classList.add('fade'));
const io = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  e.target.classList.add('in');
  const b = $('b[data-count]', e.target);
  if (b) countUp(b);
  io.unobserve(e.target);
}), { threshold: .12 });
$$('.fade').forEach((el, i) => { el.style.transitionDelay = (i % 4) * 70 + 'ms'; io.observe(el); });

function countUp(el) {
  const end = +el.dataset.count, suf = el.dataset.suf || '', t0 = performance.now();
  (function tick(t) {
    const p = Math.min((t - t0) / 1500, 1);
    el.textContent = Math.floor(end * (1 - Math.pow(1 - p, 3))).toLocaleString('en-IN') + (p === 1 ? suf : '');
    if (p < 1) requestAnimationFrame(tick);
  })(t0);
}

/* FAQ accordion */
$$('.q').forEach(q => $('button', q).addEventListener('click', () => {
  const a = $('.a', q), open = q.classList.contains('open');
  $$('.q.open').forEach(o => { o.classList.remove('open'); $('.a', o).style.maxHeight = 0; });
  if (!open) { q.classList.add('open'); a.style.maxHeight = a.scrollHeight + 'px'; }
}));

/* rate list + calculator (pricing page) */
const rates = [
  ['Newspaper', 'paper', 14], ['Office Paper / Books', 'paper', 12], ['Cardboard / Cartons', 'paper', 8], ['Magazines', 'paper', 10],
  ['PET Bottles', 'plastic', 12], ['Hard Plastic', 'plastic', 15], ['Plastic Containers', 'plastic', 10],
  ['Iron', 'metal', 28], ['Steel', 'metal', 32], ['Aluminum', 'metal', 105], ['Copper', 'metal', 620], ['Brass', 'metal', 380],
  ['Old Laptop', 'ewaste', 250], ['Old Mobile Phone', 'ewaste', 180], ['Cables & Wires', 'ewaste', 60], ['Inverter Battery', 'ewaste', 85]
];
const body = $('#rateBody'), sel = $('#calcItem');
if (body && sel) {
  const label = { paper: 'Paper', plastic: 'Plastic', metal: 'Metal', ewaste: 'E-Waste' };
  const render = (f = 'all') => body.innerHTML = rates.filter(r => f === 'all' || r[1] === f)
    .map(r => `<tr><td>${r[0]}</td><td>${label[r[1]]}</td><td>₹${r[2]}</td></tr>`).join('');
  render();
  sel.innerHTML = rates.map((r, i) => `<option value="${i}">${r[0]} – ₹${r[2]}/kg</option>`).join('');
  $$('#rateTabs button').forEach(b => b.addEventListener('click', () => {
    $$('#rateTabs button').forEach(x => x.classList.remove('active'));
    b.classList.add('active'); render(b.dataset.t);
  }));
  const calc = () => {
    const q = Math.max(0, parseFloat($('#calcQty').value) || 0);
    $('#calcOut').textContent = '₹' + Math.round(q * rates[sel.value][2]).toLocaleString('en-IN');
  };
  sel.addEventListener('change', calc); $('#calcQty').addEventListener('input', calc); calc();
}

/* pickup form */
const w = $('#whenInput');
if (w) w.min = new Date(Date.now() - new Date().getTimezoneOffset() * 6e4).toISOString().slice(0, 16);
$('#pickupForm')?.addEventListener('submit', e => {
  e.preventDefault();
  const f = e.target, err = $('#formErr'), v = n => f.elements[n].value.trim();
  if (v('name').length < 2) return err.textContent = 'Please enter your name.';
  if (!/^[6-9]\d{9}$/.test(v('phone'))) return err.textContent = 'Enter a valid 10-digit phone number.';
  if (!v('type')) return err.textContent = 'Please select a scrap type.';
  if (v('address').length < 8) return err.textContent = 'Please enter your full pickup address.';
  if (!v('when')) return err.textContent = 'Please choose a preferred date & time.';
  err.textContent = '';
  toast(`✅ Thank you ${v('name')}! Your pickup is booked. We will call you shortly.`);
  f.reset();
});

/* contact form */
$('#contactForm')?.addEventListener('submit', e => {
  e.preventDefault();
  const f = e.target, err = $('#contactErr'), v = n => f.elements[n].value.trim();
  if (v('name').length < 2) return err.textContent = 'Please enter your name.';
  if (!/^[6-9]\d{9}$/.test(v('phone'))) return err.textContent = 'Enter a valid 10-digit phone number.';
  if (!/^\S+@\S+\.\S+$/.test(v('email'))) return err.textContent = 'Enter a valid email address.';
  if (v('msg').length < 5) return err.textContent = 'Please write your message.';
  err.textContent = '';
  toast(`✅ Thanks ${v('name')}! We will get back to you soon.`);
  f.reset();
});

/* newsletter */
$('#newsForm')?.addEventListener('submit', e => {
  e.preventDefault();
  toast('📩 Subscribed! Thanks for joining.');
  e.target.reset();
});
