/* Wynajem obiektów AWF Warszawa – katalog, kalkulator, sale, zapytanie. Dane: data.js, tłumaczenia: i18n.js. */
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const round2 = n => Math.round(n * 100) / 100;

  /* ---------- Język ---------- */
  let lang = 'pl';
  try { const s = localStorage.getItem('awf-lang'); if (s === 'en' || s === 'pl') lang = s; } catch (e) {}
  const t = (k, v = {}) => (UI[lang][k] ?? UI.pl[k] ?? k).replace(/\{(\w+)\}/g, (_, x) => v[x] ?? '');
  const d = s => {
    if (lang === 'pl' || s == null) return s;
    if (EN_DATA[s]) return EN_DATA[s];
    for (const [re, rep] of EN_PATTERNS) if (re.test(s)) return s.replace(re, rep);
    return s;
  };
  const locale = () => lang === 'pl' ? 'pl-PL' : 'en-GB';
  const zl = n => new Intl.NumberFormat(locale(), { style: 'currency', currency: 'PLN' }).format(n);
  const zl0 = n => lang === 'pl' ? new Intl.NumberFormat('pl-PL', { maximumFractionDigits: 0 }).format(n) + ' zł' : 'PLN ' + new Intl.NumberFormat('en-GB').format(n);
  const num = n => new Intl.NumberFormat(locale(), { maximumFractionDigits: 2 }).format(n);
  const hrs = h => `${num(h)} h`;
  const plural = (n, key) => {
    const f = PLURALS[lang][key];
    if (lang === 'en') return `${num(n)} ${n === 1 ? f[0] : f[1]}`;
    const n10 = n % 10, n100 = n % 100;
    const i = n === 1 ? 0 : (n10 >= 2 && n10 <= 4 && (n100 < 12 || n100 > 14)) ? 1 : 2;
    return `${num(n)} ${f[i]}`;
  };

  /* ---------- Daty i święta ---------- */
  const pad = n => String(n).padStart(2, '0');
  const iso = dt => `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
  const parse = s => { const [y, m, dd] = s.split('-').map(Number); return new Date(y, m - 1, dd); };
  const addDays = (dt, n) => new Date(dt.getFullYear(), dt.getMonth(), dt.getDate() + n);
  const fmtDate = s => {
    const dt = parse(s);
    return lang === 'pl' ? `${pad(dt.getDate())}.${pad(dt.getMonth() + 1)}.${dt.getFullYear()}` : dt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };
  const holidayCache = {};
  function holidays(y) {
    if (holidayCache[y]) return holidayCache[y];
    const a = y % 19, b = Math.floor(y / 100), c = y % 100, dd = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3),
      h = (19 * a + b - dd - g + 15) % 30, i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451),
      month = Math.floor((h + l - 7 * m + 114) / 31), day = ((h + l - 7 * m + 114) % 31) + 1;
    const easter = new Date(y, month - 1, day);
    const map = {
      [`${y}-01-01`]: 'ny', [`${y}-01-06`]: 'epi', [iso(easter)]: 'eas', [iso(addDays(easter, 1))]: 'em', [`${y}-05-01`]: 'may1', [`${y}-05-03`]: 'may3',
      [iso(addDays(easter, 49))]: 'pen', [iso(addDays(easter, 60))]: 'cc', [`${y}-08-15`]: 'aug15', [`${y}-11-01`]: 'nov1', [`${y}-11-11`]: 'nov11',
      [`${y}-12-24`]: 'dec24', [`${y}-12-25`]: 'dec25', [`${y}-12-26`]: 'dec26'
    };
    return (holidayCache[y] = map);
  }
  const holidayOf = s => holidays(+s.slice(0, 4))[s];
  const holidayName = s => HOLIDAY_NAMES[lang][holidayOf(s)];
  const toMin = s => { const [h, m] = (s || '0:0').split(':').map(Number); return h * 60 + m; };

  /* ---------- Stan ---------- */
  const today = new Date();
  const nextMon = addDays(today, ((8 - today.getDay()) % 7) || 7);
  const nextSat = addDays(today, ((6 - today.getDay() + 7) % 7) || 7);
  const state = {
    client: 'klub', purpose: 'trening', facility: 'hala-gier', option: 'tr',
    qty: 1, minCap: 0, extras: {},
    /* zajęcia godzinowe */
    mode: 'weekly', hFrom: '18:00', hTo: '20:00', wFrom: iso(nextMon), wTo: iso(addDays(nextMon, 83)), weekdays: [2], skipHol: false,
    single: iso(addDays(nextMon, 1)), hours: 2, sessions: 10,
    /* wydarzenia */
    evFrom: iso(nextSat), evTo: iso(nextSat), bFrom: '09:00', bTo: '17:00', setup: 0, tier: 0
  };
  const LIMITS = { qty: [1, 6, 1], hours: [0.5, 15, 0.5], sessions: [1, 300, 1], setup: [0, 10, 1] };

  const byId = id => FACILITIES.find(f => f.id === id);
  const roomById = id => ROOMS.find(r => r.id === id);
  const capMin = c => c == null ? Infinity : typeof c === 'number' ? c : parseInt(String(c), 10);
  const capMax = c => typeof c === 'string' ? parseInt(c.split('–')[1], 10) : c;

  function currentOptions() {
    if (state.purpose === 'konferencja') {
      const r = roomById(state.facility);
      if (!r) return [];
      const o = [{ id: 'h', purpose: 'konferencja', kind: 'hour', label: 'Najem na godziny', rate: r.rate }];
      if (r.day) o.push({ id: 'd', purpose: 'konferencja', kind: 'day', label: 'Najem na cały dzień (8 h)', rate: r.day });
      return o;
    }
    const f = byId(state.facility);
    return f ? f.options.filter(o => o.purpose === state.purpose) : [];
  }
  const currentOption = () => currentOptions().find(o => o.id === state.option) || currentOptions()[0];
  const facilitiesFor = p => FACILITIES.filter(f => f.options.some(o => o.purpose === p));
  const roomsFor = min => ROOMS.filter(r => r.cap == null || capMax(r.cap) >= min);
  const currentName = () => state.purpose === 'konferencja' ? d(roomById(state.facility)?.name) : d(byId(state.facility)?.name);
  const currentPlace = () => state.purpose === 'konferencja' ? d(roomById(state.facility)?.building) : d(byId(state.facility)?.place);

  /* ---------- Harmonogram: z dat i godzin wylicza terminy oraz godziny ---------- */
  function dateRange(from, to) {
    if (!from || !to) return { err: t('errDates') };
    const a = parse(from), b = parse(to);
    if (b < a) return { err: t('errDates') };
    if ((b - a) / 864e5 > 366) return { err: t('errRange') };
    const out = [];
    for (let x = a; x <= b; x = addDays(x, 1)) out.push(x);
    return { dates: out };
  }

  function schedule() {
    const o = currentOption();
    const s = { kind: o?.kind, warns: [], dates: [], skipped: [] };
    if (!o) return s;

    if (o.kind === 'hour') {
      if (state.mode === 'manual') {
        s.hours = state.hours; s.sessions = state.sessions;
      } else {
        const a = toMin(state.hFrom), b = toMin(state.hTo);
        if (b <= a) return { ...s, err: t('errTime') };
        s.hours = (b - a) / 60;
        if (a < 420 || b > 1320) s.warns.push(t('warnOpen'));
        if (state.mode === 'single') {
          if (!state.single) return { ...s, err: t('errDates') };
          s.dates = [state.single];
          if (holidayOf(state.single)) s.warns.push(t('warnHoliday', { d: fmtDate(state.single), h: holidayName(state.single) }));
        } else {
          const r = dateRange(state.wFrom, state.wTo);
          if (r.err) return { ...s, err: r.err };
          for (const x of r.dates) {
            if (!state.weekdays.includes(x.getDay())) continue;
            const k = iso(x);
            if (state.skipHol && holidayOf(k)) s.skipped.push(k); else s.dates.push(k);
          }
          if (!s.dates.length) return { ...s, err: t('errNoDays') };
        }
        s.sessions = s.dates.length;
      }
      s.total = s.hours * s.sessions;
      s.days = s.sessions;
      return s;
    }

    const r = dateRange(state.evFrom, state.evTo);
    if (r.err) return { ...s, err: r.err };
    s.dates = r.dates.map(iso);
    s.days = s.dates.length;

    if (o.kind === 'block') {
      const a = toMin(state.bFrom);
      let b = toMin(state.bTo);
      if (b === a) return { ...s, err: t('errTime') };
      if (b < a) b += 1440; /* koniec po północy */
      let day = 0, night = 0;
      for (let m = a; m < b; m += 15) { const mm = m % 1440; (mm >= 360 && mm < 1320) ? day += 15 : night += 15; }
      s.dayH = day / 60; s.nightH = night / 60;
      s.pkg = s.dayH > 5 ? 12 : 5;
      if (a < 420 || b > 1320) s.warns.push(t('warnOpen'));
      if (s.nightH > 0 && !o.night) s.warns.push(t('warnNightNoRate'));
      if (s.dayH > 12) s.warns.push(t('over12'));
    }
    return s;
  }

  /* ---------- Wyliczenie kosztów ---------- */
  function compute() {
    const o = currentOption();
    const s = schedule();
    const lines = [];
    if (!o || s.err) return { lines, net: 0, indiv: false, sch: s };
    const days = s.days;

    if (o.kind === 'hour') {
      const q = o.qty ? state.qty : 1;
      lines.push({
        label: d(o.label) + (o.qty ? ` · ${d(o.qty.label)}: ${q}` : ''),
        detail: `${plural(s.sessions, 'session')} × ${hrs(s.hours)}${q > 1 ? ` × ${q}` : ''} × ${zl(o.rate)}/h`,
        amount: o.rate * s.hours * s.sessions * q
      });
    }
    if (o.kind === 'block') {
      const price = s.pkg === 12 ? o.p12 : o.p5;
      lines.push({ label: t('lPackage', { o: d(o.label), p: s.pkg }), detail: `${plural(days, 'day')} × ${zl(price)}`, amount: price * days });
      if (s.dayH > 12) lines.push({ label: t('lOver12'), detail: `${hrs(s.dayH - 12)} × ${plural(days, 'day')}`, amount: null });
      if (s.nightH > 0) {
        if (o.night) {
          const hourly = o.p5 / 5;
          lines.push({ label: t('lNight', { n: Math.round(o.night * 100) }), detail: `${hrs(s.nightH)} × ${plural(days, 'day')} × ${zl(hourly * o.night)}`, amount: s.nightH * days * hourly * o.night });
        } else lines.push({ label: t('lNightIndiv'), detail: `${hrs(s.nightH)} × ${plural(days, 'day')}`, amount: null });
      }
      if (o.setup && state.setup > 0) lines.push({ label: t('lSetup'), detail: `${state.setup} × ${zl(o.p12 / 2)}`, amount: state.setup * o.p12 / 2 });
    }
    if (o.kind === 'tier') {
      const tier = o.tiers[state.tier];
      if (!tier) lines.push({ label: `${d(o.label)} · ${t('over4000')}`, detail: t('lIndiv'), amount: null });
      else {
        lines.push({ label: `${d(o.label)} · ${t('upToPeople', { n: num(tier[0]) })}`, detail: `${plural(days, 'day')} × ${zl(tier[1])}`, amount: tier[1] * days });
        if (state.setup > 0) {
          const f = state.setup > 3 ? 0.25 : 0.5;
          lines.push({ label: t('lSetupTier', { f: f === 0.5 ? '½' : '¼' }), detail: `${plural(state.setup, 'day')} × ${zl(tier[1] * f)}`, amount: state.setup * tier[1] * f });
        }
      }
    }
    if (o.kind === 'day') lines.push({ label: d(o.label), detail: `${plural(days, 'day')} × ${zl(o.rate)}`, amount: o.rate * days });

    const avail = extrasAvailable();
    for (const [id, q] of Object.entries(state.extras)) {
      const e = avail.find(x => x.id === id);
      if (!q || !e) continue;
      if (e.price == null) { lines.push({ label: d(e.label), detail: d(e.unit), amount: null }); continue; }
      let amount, detail;
      if (e.per === 'lump') { const p = days >= 4 ? e.price4 : e.price; amount = p; detail = t('lLump', { d: plural(days, 'day') }); }
      else if (e.per === 'once') { amount = e.price * q; detail = `${q} × ${zl(e.price)}`; }
      else {
        const qq = e.flag ? 1 : q;
        amount = e.price * qq * days;
        detail = `${e.flag ? '' : `${qq} ${d(e.qtyLabel)} × `}${plural(days, 'day')} × ${zl(e.price)}`;
      }
      lines.push({ label: d(e.label), detail, amount });
    }
    const net = round2(lines.reduce((x, l) => x + (l.amount || 0), 0));
    return { lines, net, indiv: lines.some(l => l.amount == null), sch: s };
  }

  /* ---------- Krok 1–3 ---------- */
  function renderClients() {
    $('#clients').innerHTML = CLIENTS.map(c => `<button type="button" class="chip" data-client="${c.id}" aria-pressed="${c.id === state.client}">${esc(d(c.label))}</button>`).join('');
  }
  function renderPurposes() {
    $('#purposes').innerHTML = Object.entries(PURPOSES).map(([id, p]) =>
      `<button type="button" class="pcard" data-purpose="${id}" aria-pressed="${id === state.purpose}"><b>${esc(d(p.label))}</b><span>${esc(d(p.hint))}</span></button>`).join('');
  }
  function renderFacilitySelect() {
    const sel = $('#facility');
    $('#roomFilters').hidden = state.purpose !== 'konferencja';
    if (state.purpose === 'konferencja') {
      $('#objHint').textContent = t('s3HintRooms');
      const rooms = roomsFor(state.minCap);
      if (!rooms.some(r => r.id === state.facility)) state.facility = rooms[0]?.id;
      const groups = {};
      rooms.forEach(r => (groups[r.building] ||= []).push(r));
      sel.innerHTML = Object.entries(groups).map(([b, rs]) =>
        `<optgroup label="${esc(d(b))}">${rs.map(r => `<option value="${r.id}" ${r.id === state.facility ? 'selected' : ''}>${esc(d(r.name))}${r.cap ? ` – ${r.cap} ${lang === 'pl' ? 'os.' : 'ppl'}` : ''} – ${zl0(r.rate)}/h</option>`).join('')}</optgroup>`).join('');
    } else {
      $('#objHint').textContent = t('s3Hint');
      const list = facilitiesFor(state.purpose);
      if (!list.some(f => f.id === state.facility)) state.facility = list[0].id;
      const opt = f => `<option value="${f.id}" ${f.id === state.facility ? 'selected' : ''}>${esc(d(f.name))}</option>`;
      const ind = list.filter(f => f.type === 'indoor'), out = list.filter(f => f.type === 'outdoor');
      sel.innerHTML = (ind.length ? `<optgroup label="${t('indoorGroup')}">${ind.map(opt).join('')}</optgroup>` : '') +
                      (out.length ? `<optgroup label="${t('outdoorGroup')}">${out.map(opt).join('')}</optgroup>` : '');
    }
    if (!currentOptions().some(o => o.id === state.option)) state.option = currentOptions()[0]?.id;
  }
  function priceLabel(o) {
    if (o.kind === 'hour') return `${zl0(o.rate)}<small>${t('perH')}${o.qty ? ' / ' + t(o.qty.label === 'Liczba torów' ? 'perUnitLane' : 'perUnitCourt') : ''}</small>`;
    if (o.kind === 'block') return `${zl0(o.p5)} / ${zl0(o.p12)}<small>${t('blockPrice')}</small>`;
    if (o.kind === 'tier') return `${t('from')} ${zl0(o.tiers[0][1])}<small>${t('perDay')}</small>`;
    if (o.kind === 'day') return `${zl0(o.rate)}<small>${t('perDay')}</small>`;
    return '';
  }
  function renderOptions() {
    $('#options').innerHTML = currentOptions().map(o => `
      <label class="opt"><input type="radio" name="opt" value="${o.id}" ${o.id === state.option ? 'checked' : ''}>
        <span class="lbl">${esc(d(o.label))}</span><span class="pr">${priceLabel(o)}</span></label>`).join('');
    const o = currentOption(), n = $('#optNote');
    n.hidden = !o?.note; n.textContent = d(o?.note) || '';
  }

  /* ---------- Krok 4 ---------- */
  const stepper = (id, label, value, sub = '') => `
    <label class="field">${esc(label)}${sub ? ` <small>${esc(sub)}</small>` : ''}
      <span class="stepper">
        <button type="button" data-step="${id}" data-d="-1" aria-label="${t('less')}">−</button>
        <input id="${id}" data-num="${id}" type="number" inputmode="decimal" min="${LIMITS[id][0]}" max="${LIMITS[id][1]}" step="${LIMITS[id][2]}" value="${value}">
        <button type="button" data-step="${id}" data-d="1" aria-label="${t('more')}">+</button>
      </span></label>`;
  const dateField = (key, label) => `<label class="field">${esc(label)}<input type="date" data-k="${key}" value="${state[key]}"></label>`;
  const timeField = (key, label) => `<label class="field">${esc(label)}<input type="time" step="900" data-k="${key}" value="${state[key]}"></label>`;

  function renderTime() {
    const o = currentOption();
    const f = $('#timeFields');
    if (!o) { f.innerHTML = ''; return renderSummary(); }
    let h = '';
    if (o.kind === 'hour') {
      $('#timeHint').textContent = state.mode === 'manual' ? t('hintManual') : t('hintHour');
      h += `<div class="seg mode" role="group" aria-label="${t('modeAria')}">${['weekly', 'single', 'manual'].map(m =>
        `<button type="button" data-mode="${m}" aria-pressed="${state.mode === m}">${t('mode' + m[0].toUpperCase() + m.slice(1))}</button>`).join('')}</div>`;
      if (o.qty) { LIMITS.qty[1] = o.qty.max; state.qty = Math.min(state.qty, o.qty.max); }
      if (state.mode === 'manual') {
        h += `<div class="row">${o.qty ? stepper('qty', d(o.qty.label), state.qty) : ''}${stepper('hours', t('hoursPer'), state.hours)}${stepper('sessions', t('sessions'), state.sessions)}</div>`;
      } else {
        h += `<div class="row">${state.mode === 'single' ? dateField('single', t('date')) : ''}${timeField('hFrom', t('timeFrom'))}${timeField('hTo', t('timeTo'))}${o.qty ? stepper('qty', d(o.qty.label), state.qty) : ''}</div>`;
        if (state.mode === 'weekly') {
          h += `<div class="row" style="margin-top:12px">${dateField('wFrom', t('dateFrom'))}${dateField('wTo', t('dateTo'))}</div>`;
          h += `<div class="fieldset"><span>${t('weekdays')}</span><div class="wd">${[1, 2, 3, 4, 5, 6, 0].map(i =>
            `<label><input type="checkbox" data-wd="${i}" ${state.weekdays.includes(i) ? 'checked' : ''}><span>${WEEKDAYS[lang][i]}</span></label>`).join('')}</div></div>`;
          h += `<label class="toggle" style="margin-top:12px"><input type="checkbox" data-k="skipHol" ${state.skipHol ? 'checked' : ''}> ${t('skipHol')}</label>`;
        }
      }
    } else {
      $('#timeHint').textContent = t({ block: 'hintBlock', tier: 'hintTier', day: 'hintDay' }[o.kind]);
      h += `<div class="row">${dateField('evFrom', t('dateFrom'))}${dateField('evTo', t('dateTo'))}</div>`;
      if (o.kind === 'block') {
        h += `<div class="row" style="margin-top:12px">${timeField('bFrom', t('timeFrom'))}${timeField('bTo', t('timeTo'))}${o.setup ? stepper('setup', t('setupDays'), state.setup, t('setupHint')) : ''}</div>`;
      }
      if (o.kind === 'tier') {
        h += `<div class="row" style="margin-top:12px"><label class="field">${t('participants')}<select id="tier">${o.tiers.map((x, i) =>
          `<option value="${i}" ${i === state.tier ? 'selected' : ''}>${t('upToPeople', { n: num(x[0]) })} – ${zl0(x[1])}</option>`).join('')}
          <option value="${o.tiers.length}" ${state.tier === o.tiers.length ? 'selected' : ''}>${t('over4000')}</option></select></label>
          ${stepper('setup', t('setupTier'), state.setup, t('setupTierHint'))}</div>`;
      }
    }
    f.innerHTML = h;
    renderSummary();
  }

  function renderSummary() {
    const s = schedule(), box = $('#timeSummary');
    if (!s.kind) { box.innerHTML = ''; return; }
    if (s.err) { box.innerHTML = `<div class="sum err" role="alert">${esc(s.err)}</div>`; return; }
    let main = '', sub = [];
    if (s.kind === 'hour') {
      main = `${plural(s.sessions, 'session')} × ${hrs(s.hours)} = ${hrs(s.total)}`;
      if (s.dates.length > 1) sub.push(`${fmtDate(s.dates[0])} – ${fmtDate(s.dates[s.dates.length - 1])}`);
      if (s.skipped.length) sub.push(t('skipped', { x: s.skipped.map(k => `${fmtDate(k)} (${holidayName(k)})`).join(', ') }));
    } else if (s.kind === 'block') {
      main = `${plural(s.days, 'day')} × ${hrs(s.dayH + s.nightH)}`;
      sub.push(t('sumBlock', { d: plural(s.days, 'day'), h: hrs(s.dayH), n: s.nightH ? t('sumBlockNight', { n: num(s.nightH) }) : '', p: s.pkg }));
    } else {
      main = plural(s.days, 'day');
    }
    box.innerHTML = `<div class="sum"><b>${esc(main)}</b>${sub.map(x => `<small>${esc(x)}</small>`).join('')}</div>` +
      (s.warns.length ? `<div class="warns">${s.warns.map(w => `<p>${esc(w)}</p>`).join('')}</div>` : '');
  }

  /* ---------- Krok 5 ---------- */
  function extrasAvailable() {
    const own = state.purpose === 'konferencja' ? [] : (byId(state.facility)?.extras || []);
    return EXTRAS.filter(e => e.group === 'own' ? own.includes(e.id) : state.purpose !== 'trening' || e.group === 'gear');
  }
  const openGroups = new Set(['own']);
  function renderExtras() {
    const groups = {};
    extrasAvailable().forEach(e => (groups[e.group] ||= []).push(e));
    $('#extras').innerHTML = Object.keys(EXTRA_GROUPS).filter(g => groups[g]).map(g => {
      const n = groups[g].filter(e => state.extras[e.id]).length;
      return `<details class="ex" data-group="${g}" ${openGroups.has(g) ? 'open' : ''}>
        <summary>${esc(d(EXTRA_GROUPS[g]))}<span class="n">${n ? t('selected', { n }) : t('items', { n: groups[g].length })}</span></summary>
        <div class="ex-list">${groups[g].map(e => {
          const on = !!state.extras[e.id];
          const unit = d(e.unit).replace(/^(zł|PLN) ?/, '');
          const qty = e.flag ? '' : `<input type="number" min="1" max="${e.max || 999}" value="${state.extras[e.id] || (e.per === 'hourday' ? 2 : 10)}" data-exq="${e.id}" aria-label="${t('qty')}: ${esc(d(e.label))}" ${on ? '' : 'disabled'}>`;
          return `<label class="ex-item"><input type="checkbox" data-ex="${e.id}" ${on ? 'checked' : ''}>
            <span>${esc(d(e.label))}<span class="u">${e.price != null ? zl0(e.price) + ' ' : ''}${esc(unit)}${e.qtyLabel ? ` · ${t('qty')}: ${esc(d(e.qtyLabel))}` : ''}</span></span>${qty}</label>`;
        }).join('')}</div></details>`;
    }).join('') || `<p class="note">${t('noExtras')}</p>`;
  }

  /* ---------- Kosztorys ---------- */
  function renderReceipt() {
    const r = compute();
    $('#rTitle').textContent = currentName();
    $('#rSub').textContent = `${currentPlace()} · ${d(PURPOSES[state.purpose].label)} · ${d(CLIENTS.find(c => c.id === state.client).label)}`;
    $('#lines').innerHTML = r.lines.map(l => `<li class="${l.amount == null ? 'ind' : ''}"><span>${esc(l.label)}</span><span class="amt">${l.amount == null ? t('indivShort') : zl(l.amount)}</span><small>${esc(l.detail)}</small></li>`).join('');
    const vat = round2(r.net * VAT_RATE);
    $('#tNet').textContent = zl(r.net); $('#tVat').textContent = zl(vat); $('#tGross').textContent = zl(r.net + vat);
    $('#indivNote').hidden = !r.indiv;
    return r;
  }
  function renderCalc() { renderClients(); renderPurposes(); renderFacilitySelect(); renderOptions(); renderTime(); renderExtras(); renderReceipt(); }
  const refresh = () => { renderSummary(); renderReceipt(); };

  /* ---------- Zdarzenia kalkulatora ---------- */
  $('#clients').addEventListener('click', e => {
    const b = e.target.closest('[data-client]'); if (!b) return;
    const was = state.purpose;
    state.client = b.dataset.client;
    state.purpose = CLIENTS.find(c => c.id === state.client).purpose;
    if (state.purpose === 'konferencja' && was !== 'konferencja') state.facility = ROOMS[0].id;
    renderCalc();
  });
  $('#purposes').addEventListener('click', e => {
    const b = e.target.closest('[data-purpose]'); if (!b) return;
    const was = state.purpose;
    state.purpose = b.dataset.purpose;
    if (state.purpose === 'konferencja' && was !== 'konferencja') state.facility = ROOMS[0].id;
    if (was === 'konferencja' && state.purpose !== 'konferencja') state.facility = facilitiesFor(state.purpose)[0].id;
    renderCalc();
  });
  $('#facility').addEventListener('change', e => { state.facility = e.target.value; state.option = null; renderCalc(); });
  $('#minCap').addEventListener('input', e => { state.minCap = Math.max(0, +e.target.value || 0); renderFacilitySelect(); renderOptions(); renderTime(); renderReceipt(); });
  $('#options').addEventListener('change', e => { if (e.target.name === 'opt') { state.option = e.target.value; renderOptions(); renderTime(); renderReceipt(); } });

  const setNum = (id, v) => { const [min, max] = LIMITS[id]; state[id] = Math.min(max, Math.max(min, v)); };
  const tf = $('#timeFields');
  tf.addEventListener('click', e => {
    const m = e.target.closest('[data-mode]');
    if (m) { state.mode = m.dataset.mode; renderTime(); renderReceipt(); return; }
    const b = e.target.closest('[data-step]'); if (!b) return;
    const id = b.dataset.step;
    setNum(id, state[id] + LIMITS[id][2] * +b.dataset.d);
    $('#' + id).value = state[id];
    refresh();
  });
  tf.addEventListener('change', e => {
    const el = e.target;
    if (el.id === 'tier') state.tier = +el.value;
    else if (el.dataset.wd != null) {
      const i = +el.dataset.wd;
      state.weekdays = el.checked ? [...new Set([...state.weekdays, i])] : state.weekdays.filter(x => x !== i);
    } else if (el.dataset.k === 'skipHol') state.skipHol = el.checked;
    else if (el.dataset.k) state[el.dataset.k] = el.value;
    else if (el.dataset.num) { setNum(el.dataset.num, parseFloat(el.value) || 0); el.value = state[el.dataset.num]; }
    refresh();
  });
  tf.addEventListener('input', e => {
    const el = e.target;
    if (el.dataset.num && el.value !== '') { setNum(el.dataset.num, parseFloat(el.value) || 0); refresh(); }
  });
  $('#extras').addEventListener('change', e => {
    const cb = e.target.closest('[data-ex]');
    if (cb) {
      const ex = EXTRAS.find(x => x.id === cb.dataset.ex);
      const qi = $(`[data-exq="${ex.id}"]`);
      state.extras[ex.id] = cb.checked ? (ex.flag ? 1 : Math.max(1, +(qi?.value) || 1)) : 0;
      renderExtras(); renderReceipt(); return;
    }
    const q = e.target.closest('[data-exq]');
    if (q) { const ex = EXTRAS.find(x => x.id === q.dataset.exq); const v = Math.min(ex.max || 999, Math.max(1, +q.value || 1)); q.value = v; state.extras[ex.id] = v; renderReceipt(); }
  });
  $('#extras').addEventListener('toggle', e => {
    const dd = e.target.closest('details[data-group]'); if (!dd) return;
    dd.open ? openGroups.add(dd.dataset.group) : openGroups.delete(dd.dataset.group);
  }, true);

  function calcFor(id, purpose) {
    if (purpose === 'konferencja') { state.purpose = 'konferencja'; state.client = 'szkolenie'; state.minCap = 0; $('#minCap').value = 0; }
    else {
      const ps = [...new Set(byId(id).options.map(o => o.purpose))];
      if (!ps.includes(state.purpose)) state.purpose = ps[0];
      if (CLIENTS.find(c => c.id === state.client).purpose !== state.purpose) state.client = CLIENTS.find(c => c.purpose === state.purpose).id;
    }
    state.facility = id; state.option = null;
    renderCalc();
    $('#kalkulator').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }

  /* ---------- Katalog ---------- */
  const ui = { type: 'all', tag: null, q: '' };
  const allTags = [...new Set(FACILITIES.flatMap(f => f.tags))];
  function photo(f, i = 0) {
    if (f.photos?.[i]) {
      const alt = PHOTO_ALT[f.photos[i]]?.[lang === 'en' ? 1 : 0] || d(f.name);
      return `<img src="img/${f.photos[i]}" alt="${esc(alt)}" loading="lazy">`;
    }
    return `<div class="nophoto"><span>${esc(d(f.short || f.name))}<small>${esc(d(f.place))} · ${t('noPhoto')}</small></span></div>`;
  }
  function fromPrice(f) {
    const hourly = f.options.filter(o => o.kind === 'hour');
    if (hourly.length) return { v: Math.min(...hourly.map(o => o.rate)), u: t('perH') };
    return { v: Math.min(...f.options.filter(o => o.kind === 'block').map(o => o.p5)), u: t('per5') };
  }
  function specs(f) {
    const s = [];
    if (f.area) s.push(`<span><b>${num(f.area)}</b> m²</span>`);
    if (f.seats) s.push(`<span><b>${num(f.seats)}</b> ${t('seats')}</span>`);
    if (f.capacity) s.push(`<span><b>${esc(d(f.capacity))}</b></span>`);
    return s.join('');
  }
  function renderChips() {
    const tags = [...allTags].sort((a, b) => d(a).localeCompare(d(b), locale()));
    $('#tagChips').innerHTML = `<button type="button" class="chip" data-tag="" aria-pressed="${!ui.tag}">${t('allSports')}</button>` +
      tags.map(x => `<button type="button" class="chip" data-tag="${esc(x)}" aria-pressed="${ui.tag === x}">${esc(d(x))}</button>`).join('');
  }
  function renderGrid() {
    const q = ui.q.trim().toLowerCase();
    const list = FACILITIES.filter(f => (ui.type === 'all' || f.type === ui.type) && (!ui.tag || f.tags.includes(ui.tag)) &&
      (!q || [f.name, f.place, ...f.tags, ...f.features].flatMap(x => [x, d(x)]).join(' ').toLowerCase().includes(q)));
    $('#count').textContent = t('countOf', { n: list.length, m: FACILITIES.length });
    $('#grid').innerHTML = list.map(f => {
      const p = fromPrice(f);
      return `<article class="card">
        <div class="ph">${photo(f)}<span class="badge">${f.type === 'indoor' ? t('badgeIndoor') : t('badgeOutdoor')}</span></div>
        <div class="body">
          <div><h3>${esc(d(f.name))}</h3><div class="place">${esc(d(f.place))}</div></div>
          <div class="specs">${specs(f)}</div>
          <div class="tags">${f.tags.map(x => `<span class="tag">${esc(d(x))}</span>`).join('')}</div>
          <div class="foot">
            <div class="price-from">${t('from')}<b>${zl0(p.v)}</b>${p.u}</div>
            <div class="btns"><button class="btn small ghost" type="button" data-detail="${f.id}">${t('btnDetails')}</button>
              <button class="btn small" type="button" data-calc="${f.id}">${t('btnCalc')}</button></div>
          </div>
        </div></article>`;
    }).join('') || `<p class="note">${t('noResults')}</p>`;
  }
  $('#typeSeg').addEventListener('click', e => {
    const b = e.target.closest('[data-type]'); if (!b) return;
    ui.type = b.dataset.type; $$('#typeSeg button').forEach(x => x.setAttribute('aria-pressed', x === b)); renderGrid();
  });
  $('#tagChips').addEventListener('click', e => { const b = e.target.closest('[data-tag]'); if (!b) return; ui.tag = b.dataset.tag || null; renderChips(); renderGrid(); });
  $('#q').addEventListener('input', e => { ui.q = e.target.value; renderGrid(); });
  document.addEventListener('click', e => {
    const c = e.target.closest('[data-calc]');
    if (c) { if ($('#detail').open) $('#detail').close(); calcFor(c.dataset.calc, c.dataset.purpose); }
    const dd = e.target.closest('[data-detail]'); if (dd) openDetail(dd.dataset.detail);
    const x = e.target.closest('[data-close]'); if (x) x.closest('dialog').close();
    const l = e.target.closest('[data-lang]'); if (l) setLang(l.dataset.lang);
  });

  /* ---------- Szczegóły obiektu ---------- */
  function optPrice(o) {
    if (o.kind === 'hour') return `${zl0(o.rate)} / h`;
    if (o.kind === 'block') return `${zl0(o.p5)} ${t('upTo5')}<br>${zl0(o.p12)} ${t('upTo12')}`;
    if (o.kind === 'tier') return o.tiers.map(x => `${t('upToPeopleShort', { n: num(x[0]) })}: ${zl0(x[1])}`).join('<br>');
    return '';
  }
  function openDetail(id) {
    const f = byId(id), dlg = $('#detail');
    const byP = Object.keys(PURPOSES).map(p => [p, f.options.filter(o => o.purpose === p)]).filter(([, o]) => o.length);
    dlg.innerHTML = `
      <div class="dlg-h"><div><span class="eyebrow">${esc(d(f.place))}</span><h2 id="dTitle" style="font-size:32px">${esc(d(f.name))}</h2></div>
        <button class="x" type="button" data-close aria-label="${t('close')}">×</button></div>
      <div class="gal" style="margin-top:14px"><div class="main" id="galMain">${photo(f)}</div>
        ${f.photos.length > 1 ? `<div class="thumbs">${f.photos.map((p, i) => `<button type="button" data-ph="${i}" aria-current="${i === 0}" aria-label="${t('photoN', { i: i + 1, n: f.photos.length })}"><img src="img/${p}" alt=""></button>`).join('')}</div>` : ''}</div>
      <div class="dlg-b">
        <div class="specs">${specs(f)}</div>
        <div class="tags">${f.tags.map(x => `<span class="tag">${esc(d(x))}</span>`).join('')}</div>
        <ul class="feat">${f.features.map(x => `<li>${esc(d(x))}</li>`).join('')}</ul>
        <table class="ptable">${byP.map(([p, os]) => `<tr><th colspan="2">${esc(t('detailPrices', { p: d(PURPOSES[p].label) }))}</th></tr>` +
          os.map(o => `<tr><td>${esc(d(o.label))}${o.night ? `<br><small style="color:var(--muted)">${t('nightRate', { n: Math.round(o.night * 100) })}</small>` : ''}${o.setup ? `<br><small style="color:var(--muted)">${t('setupRate')}</small>` : ''}</td><td>${optPrice(o)}</td></tr>`).join('')).join('')}</table>
        <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn" type="button" data-calc="${f.id}">${t('detailCalc')}</button>
          ${f.url ? `<a class="btn ghost" href="${f.url}" target="_blank" rel="noopener">${t('detailWeb')}</a>` : ''}</div>
      </div>`;
    if (!dlg.open) dlg.showModal();
    dlg.querySelectorAll('[data-ph]').forEach(b => b.addEventListener('click', () => {
      $('#galMain', dlg).innerHTML = photo(f, +b.dataset.ph);
      dlg.querySelectorAll('[data-ph]').forEach(x => x.setAttribute('aria-current', x === b));
    }));
    dlg.dataset.id = id;
  }
  $$('dialog').forEach(dl => dl.addEventListener('click', e => { if (e.target === dl) dl.close(); }));

  /* ---------- Sale ---------- */
  const rf = { cap: 0, bld: '', proj: false };
  const blds = [...new Set(ROOMS.map(r => r.building))];
  function renderBldSelect() {
    $('#roomBld').innerHTML = `<option value="">${t('typeAll')}</option>` + blds.map(b => `<option value="${esc(b)}" ${rf.bld === b ? 'selected' : ''}>${esc(d(b))}</option>`).join('');
  }
  function renderRooms() {
    const rows = ROOMS.filter(r => (r.cap == null ? rf.cap === 0 : capMax(r.cap) >= rf.cap) && (!rf.bld || r.building === rf.bld) && (!rf.proj || /[pm]/.test(r.eq)));
    let last = '', h = '';
    rows.forEach(r => {
      if (r.building !== last) { h += `<tr class="bld"><td colspan="6">${esc(d(r.building))}</td></tr>`; last = r.building; }
      h += `<tr><td>${esc(d(r.name))}</td><td class="n">${r.cap ?? '–'}</td>
        <td><span class="eq">${r.eq ? [...r.eq].map(c => `<span>${t('eq_' + c)}</span>`).join('') : `<span>${t('eqNone')}</span>`}</span></td>
        <td class="n">${zl0(r.rate)}</td><td class="n">${r.day ? zl0(r.day) : '–'}</td>
        <td><button class="linkbtn" type="button" data-calc="${r.id}" data-purpose="konferencja">${t('btnCalc')}</button></td></tr>`;
    });
    $('#roomRows').innerHTML = h || `<tr><td colspan="6">${t('roomsNone')}</td></tr>`;
  }
  $('#roomCap').addEventListener('input', e => { rf.cap = Math.max(0, +e.target.value || 0); renderRooms(); });
  $('#roomBld').addEventListener('change', e => { rf.bld = e.target.value; renderRooms(); });
  $('#roomProj').addEventListener('change', e => { rf.proj = e.target.checked; renderRooms(); });

  /* ---------- Zapytanie ---------- */
  function describeSchedule(s) {
    const o = currentOption(), L = [];
    if (s.kind === 'hour') {
      const tr = `${state.hFrom}–${state.hTo}`;
      if (state.mode === 'manual') L.push(t('dManual', { s: plural(s.sessions, 'session'), h: hrs(s.hours), all: hrs(s.total) }));
      else if (state.mode === 'single') L.push(t('dSingle', { a: fmtDate(s.dates[0]), t: tr, h: hrs(s.hours) }));
      else {
        const wd = [1, 2, 3, 4, 5, 6, 0].filter(i => state.weekdays.includes(i)).map(i => WEEKDAYS[lang][i]).join(', ');
        L.push(t('dWeekly', { w: wd, t: tr, a: fmtDate(state.wFrom), b: fmtDate(state.wTo), s: plural(s.sessions, 'session'), h: hrs(s.hours), all: hrs(s.total) }));
        L.push(t('qList', { x: s.dates.map(fmtDate).join(', ') }));
        if (s.skipped.length) L.push(t('skipped', { x: s.skipped.map(k => `${fmtDate(k)} (${holidayName(k)})`).join(', ') }));
      }
    } else if (s.kind === 'block') {
      L.push(t('dBlock', { a: fmtDate(state.evFrom), b: fmtDate(state.evTo), d: plural(s.days, 'day'), t: `${state.bFrom}–${state.bTo}` }));
      L.push(t('sumBlock', { d: plural(s.days, 'day'), h: hrs(s.dayH), n: s.nightH ? t('sumBlockNight', { n: num(s.nightH) }) : '', p: s.pkg }));
      if (o.setup && state.setup) L.push(t('dSetup', { n: state.setup }));
    } else {
      L.push(t('dRange', { a: fmtDate(state.evFrom), b: fmtDate(state.evTo), d: plural(s.days, 'day') }));
      if (s.kind === 'tier' && state.setup) L.push(t('dSetup', { n: state.setup }));
    }
    s.warns.forEach(w => L.push('! ' + w));
    return L;
  }
  function inquiryText() {
    const r = compute(), o = currentOption();
    const vat = round2(r.net * VAT_RATE);
    const client = CLIENTS.find(c => c.id === state.client);
    const v = id => $('#' + id).value.trim();
    const L = [t('qTitle', { x: `${currentName()} (${currentPlace()})` }), ''];
    L.push(`${t('qTenant')}: ${v('aName')} (${d(client.label)})`);
    L.push(`${t('qPerson')}: ${v('aPerson')}`);
    L.push(`${t('qContact')}: ${[v('aEmail'), v('aPhone')].filter(Boolean).join(', ')}`);
    if (v('aNip')) L.push(`${t('qNip')}: ${v('aNip')}`);
    L.push(`${t('qPurpose')}: ${d(PURPOSES[state.purpose].label)}`);
    L.push(`${t('qVenue')}: ${currentName()} – ${d(o.label)}`);
    L.push('', `${t('qDates')}:`, ...describeSchedule(r.sch).map(x => '  ' + x));
    L.push('', t('qCost'));
    r.lines.forEach(l => L.push(`- ${l.label}: ${l.amount == null ? t('indivShort') : zl(l.amount)} (${l.detail})`));
    L.push(t('qTotals', { n: zl(r.net), v: zl(vat), g: zl(r.net + vat) }));
    if (v('aNotes')) L.push('', t('qNotes'), v('aNotes'));
    L.push('', t('disclaimer'));
    return L.join('\n');
  }
  $('#askBtn').addEventListener('click', () => {
    if (schedule().err) { $('#timeSummary').scrollIntoView({ block: 'center' }); return; }
    $('#askOut').hidden = true; $('#ask').showModal();
  });
  $('#askForm').addEventListener('submit', e => {
    e.preventDefault();
    const txt = inquiryText();
    $('#askText').textContent = txt;
    $('#mailBtn').href = `mailto:${SITE.enquiryEmail}?subject=${encodeURIComponent(t('qSubject', { x: currentName() }))}&body=${encodeURIComponent(txt)}`;
    $('#askOut').hidden = false;
  });
  $('#copyBtn').addEventListener('click', () => {
    const txt = $('#askText').textContent;
    const fallback = () => { const rg = document.createRange(); rg.selectNodeContents($('#askText')); const s = getSelection(); s.removeAllRanges(); s.addRange(rg); toast(t('selectedText')); };
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(txt).then(() => toast(t('copied')), fallback); else fallback();
  });
  function toast(msg) {
    const el = document.createElement('div'); el.className = 'toast'; el.textContent = msg; el.setAttribute('role', 'status');
    document.body.append(el); setTimeout(() => el.remove(), 2400);
  }

  /* ---------- Teksty stałe i przełączanie języka ---------- */
  function applyStatic() {
    document.documentElement.lang = lang;
    $('#conceptBar').hidden = !SITE.concept;
    document.title = lang === 'pl' ? 'Wynajem obiektów AWF Warszawa' : 'AWF Warsaw Venue Hire';
    $$('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
    $$('[data-i18n-html]').forEach(el => { el.innerHTML = t(el.dataset.i18nHtml); });
    $$('[data-i18n-ph]').forEach(el => { el.placeholder = t(el.dataset.i18nPh); });
    $$('[data-i18n-aria]').forEach(el => { el.setAttribute('aria-label', t(el.dataset.i18nAria)); });
    $$('[data-lang]').forEach(b => b.setAttribute('aria-pressed', b.dataset.lang === lang));
    $('#kontakt').innerHTML = CONTACTS.map(c => `<div class="contact"><b>${esc(c.name)}</b><div>${esc(c.email)}</div><div>tel. ${esc(c.phone)}</div><div class="muted">${t('contactRole')}</div></div>`).join('');
    $('#srcBase').textContent = t('srcBase', { x: PRICING_SOURCE.base });
    $('#srcChange').textContent = t('srcChange', { x: PRICING_SOURCE.change });
    $('#bipLink').href = PRICING_SOURCE.bipUrl;
    $('#a11yHref').href = lang === 'en' ? 'deklaracja-dostepnosci-en.html' : 'deklaracja-dostepnosci.html';
    $('#fact-fac').textContent = FACILITIES.length;
    $('#fact-rooms').textContent = ROOMS.filter(r => r.building !== 'Pozostałe' && !r.day).length + 4;
  }
  function setLang(l) {
    lang = l;
    try { localStorage.setItem('awf-lang', l); } catch (e) {}
    applyStatic(); renderChips(); renderGrid(); renderBldSelect(); renderRooms(); renderCalc();
    const dl = $('#detail'); if (dl.open && dl.dataset.id) openDetail(dl.dataset.id);
  }
  setLang(lang);
})();
