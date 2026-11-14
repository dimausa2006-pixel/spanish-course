// Español 2027: reads words.txt, then shows the lesson for the current day.

// words.txt format:
//   @1|Topic        a new week
//   +es=en          a phrase (five per week)
//   !text           the weekend speaking task
//   es=en;es=en;... one line per day, 10 words
function parseWords(text) {
  var weeks = [], w = null;
  text.split(/\r?\n/).forEach(function (line) {
    if (!line.trim()) return;
    var c = line.charAt(0), i;
    if (c === '@') { w = { t: line.split('|')[1].trim(), p: [], k: '', d: [] }; weeks.push(w); }
    else if (c === '+') { i = line.indexOf('='); w.p.push([line.slice(1, i).trim(), line.slice(i + 1).trim()]); }
    else if (c === '!') { w.k = line.slice(1).trim(); }
    else {
      w.d.push(line.split(';').map(function (pair) {
        var j = pair.indexOf('=');
        return [pair.slice(0, j).trim(), pair.slice(j + 1).trim()];
      }));
    }
  });
  return weeks;
}

function start(D) {
  var START = new Date(2026, 10, 16), TOTAL = 294;
  var DOW = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  var MON = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var PH = [
    { to: 6, name: 'Sonidos', listen: 'Language Transfer, Complete Spanish: one or two tracks. Answer out loud before the student does.', long: 'Dreaming Spanish superbeginner videos, one after another.' },
    { to: 14, name: 'Frases', listen: 'Language Transfer until track 90 is done, then a Dreaming Spanish beginner video.', long: 'Extra en español episodes, or Dreaming Spanish beginner videos.' },
    { to: 24, name: 'Historias', listen: 'A learner podcast: Español con Juan, Hoy Hablamos or Chill Spanish Listening Practice.', long: 'Dreaming Spanish intermediate videos, or two or three podcast episodes in a row.' },
    { to: 34, name: 'Opiniones', listen: 'One Easy Spanish street interview, with Spanish subtitles.', long: 'Two episodes of a series you like, with Spanish audio and Spanish subtitles.' },
    { to: 42, name: 'Sin subtítulos', listen: 'A native podcast on a topic you know, like Radio Ambulante.', long: 'A film or two episodes with the subtitles off.' }
  ];
  function $(id) { return document.getElementById(id); }
  function phaseOf(w) { for (var i = 0; i < PH.length; i++) if (w <= PH[i].to) return PH[i]; return PH[4]; }
  function dateOf(day) { var d = new Date(2026, 10, 16); d.setDate(d.getDate() + day - 1); return d; }
  function fmt(d) { return DOW[(d.getDay() + 6) % 7] + ' ' + d.getDate() + ' ' + MON[d.getMonth()]; }
  function shortDate(d) { return d.getDate() + ' ' + MON[d.getMonth()].slice(0, 3); }
  function realDay() { var t = new Date(); var mid = new Date(t.getFullYear(), t.getMonth(), t.getDate()); return Math.round((mid - START) / 864e5) + 1; }
  function clamp(n) { return Math.min(TOTAL, Math.max(1, n)); }
  var store = {
    get: function () { try { var a = JSON.parse(localStorage.getItem('es27-done') || '[]'); return Array.isArray(a) ? a : []; } catch (e) { return []; } },
    set: function (a) { try { localStorage.setItem('es27-done', JSON.stringify(a)); } catch (e) {} }
  };
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function wordList(words) {
    var box = el('div', 'words');
    words.forEach(function (p) {
      var b = el('button', 'word'); b.type = 'button';
      b.appendChild(el('span', 'es', p[0])); b.appendChild(el('span', 'en', p[1]));
      b.addEventListener('click', function () { b.classList.toggle('shown'); });
      box.appendChild(b);
    });
    return box;
  }
  function phraseEl(p) { var d = el('div', 'phrase'); d.appendChild(el('b', null, p[0])); d.appendChild(el('span', null, p[1])); return d; }
  function taskEl(k) { var d = el('div', 'task'); d.appendChild(el('span', 'label', 'Speaking task of the week')); d.appendChild(el('span', null, k)); return d; }
  function step(mins, title, body) {
    var li = el('li', 'step'), h = el('div', 'step-head'), b = el('div', 'step-body');
    h.appendChild(el('h3', null, title)); h.appendChild(el('span', 'mins', mins));
    body.forEach(function (x) { b.appendChild(typeof x === 'string' ? el('p', null, x) : x); });
    li.appendChild(h); li.appendChild(b); return li;
  }

  var cur = 1;
  function render(day) {
    cur = clamp(day);
    var w = Math.ceil(cur / 7), di = (cur - 1) % 7, wk = D[w - 1], ph = phaseOf(w), date = dateOf(cur);
    $('t-meta').textContent = 'Day ' + cur + ' of 294 · Week ' + w + ' · ' + ph.name;
    $('t-date').textContent = fmt(date) + ' ' + date.getFullYear();
    $('t-topic').textContent = wk.t;
    var steps = $('t-steps'); steps.textContent = '';
    var list = wordList(wk.d[di]);
    var test = el('button', null, 'Test me: hide the English'); test.type = 'button';
    test.addEventListener('click', function () {
      var on = list.classList.toggle('testing');
      Array.prototype.forEach.call(list.children, function (c) { c.classList.remove('shown'); });
      test.textContent = on ? 'Show the English' : 'Test me: hide the English';
    });
    var words = ['Read each word out loud. Then hide the English, say each meaning, and tap the word to check. Finish with your Anki reviews.', list, test];
    steps.appendChild(step('10 min', 'Words', words));
    if (di < 5) {
      steps.appendChild(step('15 min', 'Listen', [ph.listen, 'No pausing to look things up. If you follow less than about 70%, pick something easier.']));
      steps.appendChild(step('5 min', 'Speak', [phraseEl(wk.p[di]), "Hear it on YouGlish or Forvo and copy the speaker five times. Then say two sentences of your own with it, using today's words."]));
    } else if (di === 5) {
      steps.appendChild(step('45 to 60 min', 'Long listening', [ph.long]));
      steps.appendChild(step('30 min', 'Conversation', [taskEl(wk.k), w < 7 ? 'Until week 7, do it alone, out loud, and record it.' : 'Do it with your tutor or exchange partner. Write down every word you were missing.']));
    } else {
      steps.appendChild(step('15 min', 'Record yourself', [taskEl(wk.k), 'Record 2 to 3 minutes and keep the file. If you have a recording from a month ago, play it first.']));
      steps.appendChild(step('10 min', 'Review the week', ["Open this week in the list below, hide the English and go through all 70 words. Add the ones you missed on Saturday's conversation to Anki."]));
      steps.appendChild(step('30 to 60 min', 'More listening', [ph.long]));
    }
    var done = store.get();
    $('t-done').checked = done.indexOf(cur) >= 0;
    $('t-progress').textContent = done.length + ' of 294 days ticked';
    $('prev').disabled = cur === 1; $('next').disabled = cur === TOTAL;
  }

  function renderWeek(n) {
    var wk = D[n - 1], body = $('wk-body'); body.textContent = ''; body.classList.remove('testing');
    $('wk-test').textContent = 'Hide the English';
    var head = el('div'); head.style.display = 'flex'; head.style.flexDirection = 'column'; head.style.gap = '4px';
    head.appendChild(el('h3', null, 'Week ' + n + ': ' + wk.t));
    head.appendChild(el('p', 'muted', fmt(dateOf((n - 1) * 7 + 1)) + ' to ' + fmt(dateOf(n * 7)) + ' · ' + phaseOf(n).name));
    body.appendChild(head);
    var pl = el('div', 'phrases'); wk.p.forEach(function (p) { pl.appendChild(phraseEl(p)); }); body.appendChild(pl);
    body.appendChild(taskEl(wk.k));
    var grid = el('div', 'days');
    wk.d.forEach(function (words, i) {
      var day = (n - 1) * 7 + i + 1, box = el('div', 'day');
      var lab = el('button', 'day-label', DOW[i].slice(0, 3) + ' ' + shortDate(dateOf(day))); lab.type = 'button';
      lab.addEventListener('click', function () {
        render(day);
        var calm = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        $('today').scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'start' });
      });
      box.appendChild(lab); box.appendChild(wordList(words)); grid.appendChild(box);
    });
    body.appendChild(grid);
  }

  function tsv(from, to) {
    var out = [];
    for (var n = from; n <= to; n++) D[n - 1].d.forEach(function (day) {
      day.forEach(function (p) { out.push(p[0] + '\t' + p[1] + '\tweek' + (n < 10 ? '0' : '') + n); });
    });
    return out.join('\n');
  }
  function copy(txt, btn) {
    var label = btn.dataset.label || (btn.dataset.label = btn.textContent), area = $('copy-area');
    function ok() { btn.textContent = 'Copied'; setTimeout(function () { btn.textContent = label; }, 2000); }
    function fail() { area.hidden = false; area.value = txt; area.focus(); area.select(); btn.textContent = 'Press Ctrl+C to copy'; setTimeout(function () { btn.textContent = label; }, 4000); }
    try { navigator.clipboard.writeText(txt).then(ok, fail); } catch (e) { fail(); }
  }

  var sel = $('wk');
  D.forEach(function (wk, i) {
    var o = el('option', null, 'Week ' + (i + 1) + ' · ' + shortDate(dateOf(i * 7 + 1)) + ' · ' + wk.t); o.value = i + 1; sel.appendChild(o);
  });
  sel.addEventListener('change', function () { renderWeek(+sel.value); });
  $('wk-test').addEventListener('click', function () {
    var body = $('wk-body'), on = body.classList.toggle('testing');
    Array.prototype.forEach.call(body.querySelectorAll('.word.shown'), function (c) { c.classList.remove('shown'); });
    $('wk-test').textContent = on ? 'Show the English' : 'Hide the English';
  });
  $('copy-week').addEventListener('click', function () { copy(tsv(+sel.value, +sel.value), this); });
  $('copy-all').addEventListener('click', function () { copy(tsv(1, 42), this); });
  $('prev').addEventListener('click', function () { render(cur - 1); });
  $('next').addEventListener('click', function () { render(cur + 1); });
  $('go-today').addEventListener('click', function () { render(realDay()); });
  $('t-done').addEventListener('change', function () {
    var done = store.get(), i = done.indexOf(cur);
    if (this.checked && i < 0) done.push(cur); else if (!this.checked && i >= 0) done.splice(i, 1);
    store.set(done); $('t-progress').textContent = done.length + ' of 294 days ticked';
  });

  var today = realDay(), now = $('now');
  if (today < 1) now.textContent = 'Day 1 is Monday 16 November 2026, ' + (1 - today) + (1 - today === 1 ? ' day' : ' days') + ' from now. This is a preview of it.';
  else if (today > TOTAL) now.textContent = 'The 294 days are done';
  else now.textContent = 'Today is day ' + today + ' of 294';
  render(today);
  sel.value = Math.ceil(clamp(today) / 7); renderWeek(+sel.value);

  var t = new Date();
  Array.prototype.forEach.call(document.querySelectorAll('.phase'), function (p) {
    var s = new Date(p.dataset.start + 'T00:00'), e = new Date(p.dataset.end + 'T23:59');
    if (t >= s && t <= e) {
      p.classList.add('current');
      p.querySelector('.phase-head').appendChild(el('span', 'here', 'You are here'));
    }
  });
}

if (typeof document === 'undefined') module.exports = { parseWords: parseWords };
else fetch('words.txt')
  .then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); })
  .then(function (text) { start(parseWords(text)); })
  .catch(function () { document.getElementById('now').textContent = 'The word list did not load. Refresh the page.'; });
