// Vice City Trophy Atlas — offline tracker: search, filters, checklist, roadmap.
// Loads only its own data/trophies.json; no network calls, no external assets.
const KEY = 'gta6-trophy-atlas-v1';
const POINTS = { platinum: 300, gold: 90, silver: 30, bronze: 15 };
const GRADE_ORDER = { platinum: 0, gold: 1, silver: 2, bronze: 3 };
const KIND_LABELS = { platinum: 'Platinum', story: 'Story', side: 'Side', collectible: 'Collectible', combat: 'Combat', driving: 'Driving' };
const PHASES = [
  { n: 1, title: 'Phase 1 — Story', hours: '60–80 hours', text: 'Play the five chapters in order. Do the Chapter 1 meditation the first time it is offered, grab the partner trophies while Jason and Lucia are together, and keep a manual save at the start of every chapter — there is no mission replay.' },
  { n: 2, title: 'Phase 2 — Side & activities', hours: '~10 hours', text: 'Stranger strands, character quests, shooting ranges, drone races, fishing, arcade, bowling, hunting and the one-off secret moments. Most of it stays open after the story, so clear it in map order.' },
  { n: 3, title: 'Phase 3 — Collectibles & world', hours: '10–15 hours', text: 'Cards, WAiNK spots, vehicle discovery, all 52 areas of Leonida, garage properties, Scooter Bros registrations, bank vaults and one robbery per gang. Sweep region by region so nothing is counted twice.' },
  { n: 4, title: 'Phase 4 — Cleanup & Platinum', hours: '~100 hours', text: 'The 100% Completion checklist (200 of 277 vehicles, 100 of 255 animals, 70 of 80 challenges, 300 stunts), 250 stunts, 50 challenges, laundering and spending — then the Platinum pops.' },
];

const doc = await (await fetch('data/trophies.json')).json();
const trophies = doc.trophies;
const totalPoints = trophies.reduce((s, t) => s + POINTS[t.grade], 0);
let earned = new Set(JSON.parse(localStorage.getItem(KEY) ?? '[]').filter((id) => trophies.some((t) => t.id === id)));

const $ = (id) => document.getElementById(id);
const grid = $('grid');
const searchEl = $('search'), gradeEl = $('grade'), kindEl = $('kind'), earnedEl = $('earned'),
  sortEl = $('sort'), missableEl = $('missableOnly'), spoilerEl = $('spoilerToggle');

function gradeIcon(grade) {
  const colors = { platinum: '#22d3ee', gold: '#ffd166', silver: '#c7d0e0', bronze: '#e08a4c' };
  const c = colors[grade];
  return `<svg class="grade-icon" viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="15" fill="${c}" opacity="0.18"/><path d="M10 7h12v4a6 6 0 0 1-12 0V7z" fill="${c}"/><path d="M10 9H6a3 3 0 0 0 3 4M22 9h4a3 3 0 0 1-3 4" fill="none" stroke="${c}" stroke-width="2"/><rect x="14" y="17" width="4" height="5" fill="${c}"/><rect x="10" y="22" width="12" height="3" rx="1" fill="${c}"/></svg>`;
}

function save() { localStorage.setItem(KEY, JSON.stringify([...earned].sort((a, b) => a - b))); }

function updateProgress() {
  const n = earned.size, pct = Math.round((n / trophies.length) * 100);
  $('ringCount').textContent = `${n}/${trophies.length}`;
  $('ringPct').textContent = `${pct}%`;
  $('ringFg').style.strokeDashoffset = String(326.7 * (1 - n / trophies.length));
  const pts = trophies.filter((t) => earned.has(t.id)).reduce((s, t) => s + POINTS[t.grade], 0);
  $('pointsLine').textContent = `${pts.toLocaleString()} / ${totalPoints.toLocaleString()} trophy points`;
  $('platinumSub').textContent = earned.has(1)
    ? 'Platinum earned — you are a Leonida Legend'
    : `Platinum — earn the other 54 · ${trophies.length - n} to go`;
  const bars = $('categoryBars');
  bars.replaceChildren();
  for (const kind of ['platinum', 'story', 'side', 'collectible', 'combat', 'driving']) {
    const list = trophies.filter((t) => t.kind === kind);
    const got = list.filter((t) => earned.has(t.id)).length;
    const row = document.createElement('div');
    row.className = 'catbar';
    row.innerHTML = `<span>${KIND_LABELS[kind]} (${list.length})</span><span class="bar"><i style="width:${list.length ? (got / list.length) * 100 : 0}%"></i></span><span class="pct">${got}/${list.length}</span>`;
    bars.append(row);
  }
}

function filtered() {
  const q = searchEl.value.trim().toLowerCase();
  let list = trophies.filter((t) => {
    if (gradeEl.value !== 'all' && t.grade !== gradeEl.value) return false;
    if (kindEl.value !== 'all' && t.kind !== kindEl.value) return false;
    if (missableEl.checked && !t.missable) return false;
    if (earnedEl.value === 'earned' && !earned.has(t.id)) return false;
    if (earnedEl.value === 'unearned' && earned.has(t.id)) return false;
    if (q && !(t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))) return false;
    return true;
  });
  const byRoadmap = (a, b) => (a.phase - b.phase) || (a.order - b.order);
  if (sortEl.value === 'grade') list.sort((a, b) => (GRADE_ORDER[a.grade] - GRADE_ORDER[b.grade]) || byRoadmap(a, b));
  else if (sortEl.value === 'difficulty') list.sort((a, b) => (b.difficulty - a.difficulty) || byRoadmap(a, b));
  else if (sortEl.value === 'name') list.sort((a, b) => a.name.localeCompare(b.name));
  else list.sort(byRoadmap);
  return list;
}

function spoilerHidden(t) { return spoilerEl.checked && t.spoiler && !earned.has(t.id); }

function renderGrid() {
  const list = filtered();
  grid.replaceChildren();
  for (const t of list) {
    const card = document.createElement('article');
    card.className = `card grade-${t.grade}${earned.has(t.id) ? ' earned' : ''}${spoilerHidden(t) ? ' spoiler-hidden' : ''}`;
    const badges = [
      t.missable ? '<span class="badge missable">Missable</span>' : '',
      t.spoiler ? '<span class="badge spoiler">Story spoiler</span>' : '',
      t.unconfirmed ? '<span class="badge unconfirmed">Unconfirmed</span>' : '',
      `<span class="badge">${KIND_LABELS[t.kind]}</span>`,
    ].join('');
    card.innerHTML = `
      <div class="card-top">${gradeIcon(t.grade)}<span class="grade-label">${t.grade}</span></div>
      <h3>${t.name}</h3>
      <p class="desc">${t.description}</p>
      <p class="badges">${badges}</p>
      <p class="card-meta">Difficulty ${'★'.repeat(t.difficulty)}${'☆'.repeat(5 - t.difficulty)} · ${t.time} · Phase ${t.phase}</p>
      <div class="card-actions">
        <button type="button" class="tick">${earned.has(t.id) ? '✓ Earned' : 'Mark earned'}</button>
        <button type="button" class="guide">Guide →</button>
      </div>`;
    card.querySelector('.tick').addEventListener('click', () => {
      if (earned.has(t.id)) earned.delete(t.id); else earned.add(t.id);
      save(); updateProgress(); renderGrid();
    });
    card.querySelector('.guide').addEventListener('click', () => openDetail(t.id));
    grid.append(card);
  }
  $('resultCount').textContent = `Showing ${list.length} of ${trophies.length} trophies · ${earned.size} earned`;
  const q = searchEl.value.trim();
  $('gridHeading').textContent =
    q ? `Results for "${q}"`
    : gradeEl.value !== 'all' ? `${gradeEl.value[0].toUpperCase() + gradeEl.value.slice(1)} trophies`
    : kindEl.value !== 'all' ? `${KIND_LABELS[kindEl.value]} trophies`
    : missableEl.checked ? 'Missable trophies'
    : 'All 55 trophies';
}

function openDetail(id) {
  const t = trophies.find((x) => x.id === id);
  if (!t) return;
  const hidden = spoilerHidden(t);
  $('detailGradeIcon').innerHTML = gradeIcon(t.grade);
  $('detailGrade').textContent = t.grade;
  $('detailKind').textContent = KIND_LABELS[t.kind];
  $('detailPhase').textContent = `Phase ${t.phase} · Roadmap #${t.order}`;
  $('detailName').textContent = hidden ? 'Story trophy — hidden until earned' : t.name;
  $('detailDesc').textContent = hidden ? 'Its name and description are hidden by the spoiler setting. Earn it in-game (or switch the spoiler toggle off) to reveal them.' : t.description;
  $('detailBadges').innerHTML = [
    t.missable ? '<span class="badge missable">Missable</span>' : '',
    t.spoiler ? '<span class="badge spoiler">Story spoiler</span>' : '',
    t.unconfirmed ? '<span class="badge unconfirmed">Unconfirmed — exact trigger not yet pinned down</span>' : '',
  ].join('');
  $('detailDiff').textContent = `Difficulty ${'★'.repeat(t.difficulty)}${'☆'.repeat(5 - t.difficulty)} (${t.difficulty}/5)`;
  $('detailTime').textContent = `Time: ${t.time}`;
  const steps = $('detailSteps');
  steps.replaceChildren();
  for (const s of t.steps) { const li = document.createElement('li'); li.textContent = s; steps.append(li); }
  $('detailTip').textContent = `Tip: ${t.tip}`;
  const miss = $('detailMissable');
  if (t.missable) { miss.hidden = false; miss.textContent = `⚠ MISSABLE — ${t.missable_note}`; } else miss.hidden = true;
  const srcs = $('detailSources');
  srcs.replaceChildren();
  for (const key of t.sources) {
    const s = doc.sources[key];
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = s.url; a.textContent = s.name; a.target = '_blank'; a.rel = 'noopener';
    li.append(a);
    srcs.append(li);
  }
  const tick = $('detailTick');
  tick.textContent = earned.has(t.id) ? '✓ Earned — tap to unmark' : 'Mark earned';
  tick.onclick = () => {
    if (earned.has(t.id)) earned.delete(t.id); else earned.add(t.id);
    save(); updateProgress(); renderGrid(); openDetail(id);
  };
  $('detail').hidden = false;
  history.replaceState(null, '', `#trophy=${t.id}`);
}

function closeDetail() { $('detail').hidden = true; history.replaceState(null, '', location.pathname); }

function renderRoadmap() {
  const ol = $('phases');
  ol.replaceChildren();
  for (const p of PHASES) {
    const li = document.createElement('li');
    const members = trophies.filter((t) => t.phase === p.n).sort((a, b) => a.order - b.order);
    li.innerHTML = `<h3>${p.title} · ${p.hours}</h3><p>${p.text}</p>
      <p class="chips">${members.map((t) => `<span class="chip${t.missable ? ' missable' : ''}">${t.missable ? '⚠ ' : ''}${t.name}</span>`).join('')}</p>`;
    ol.append(li);
  }
}

function renderMissableWall() {
  const box = $('missableList');
  box.replaceChildren();
  const missable = trophies.filter((t) => t.missable);
  for (const t of missable) {
    const div = document.createElement('div');
    div.className = 'missable-card';
    div.innerHTML = `<h3>⚠ ${t.name} — ${t.grade} — missable ${t.missable_note ? 'before the end of Chapter 1' : ''}</h3>
      <p><em>${t.description}</em></p><p>${t.missable_note}</p>
      <p>${t.steps.join(' ')}</p><p class="muted">Sources: ${t.sources.map((k) => doc.sources[k].name).join(' · ')}</p>`;
    box.append(div);
  }
  const p = document.createElement('p');
  p.innerHTML = `That is the whole wall: <strong>1 of 55</strong>. Every other trophy stays earnable in free roam after the story, and every story trophy pops by playing. Sources: PowerPyx and GTABase.`;
  box.append(p);
}

function renderSources() {
  const ul = $('sourceList');
  ul.replaceChildren();
  for (const s of Object.values(doc.sources)) {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = s.url; a.textContent = s.name; a.target = '_blank'; a.rel = 'noopener';
    li.append(a);
    ul.append(li);
  }
}

$('detailClose').addEventListener('click', closeDetail);
$('detail').addEventListener('click', (e) => { if (e.target === $('detail')) closeDetail(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeDetail(); });
for (const el of [searchEl, gradeEl, kindEl, earnedEl, sortEl, missableEl, spoilerEl]) {
  el.addEventListener('input', renderGrid);
  el.addEventListener('change', renderGrid);
}
$('exportBtn').addEventListener('click', () => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify({ game: 'GTA 6', earned: [...earned].sort((x, y) => x - y), exportedAt: new Date().toISOString() }, null, 2)], { type: 'application/json' }));
  a.download = 'gta6-trophy-progress.json';
  a.click();
});
$('importFile').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    const ids = Array.isArray(data) ? data : data.earned;
    earned = new Set(ids.filter((id) => trophies.some((t) => t.id === id)));
    save(); updateProgress(); renderGrid();
  } catch { alert('That file is not valid progress JSON.'); }
  e.target.value = '';
});
$('resetBtn').addEventListener('click', () => {
  if (!confirm('Clear all earned ticks?')) return;
  earned = new Set(); save(); updateProgress(); renderGrid();
});

updateProgress();
renderGrid();
renderRoadmap();
renderMissableWall();
renderSources();
const hash = new URLSearchParams(location.hash.slice(1));
if (hash.get('trophy')) openDetail(Number(hash.get('trophy')));
window.addEventListener('hashchange', () => {
  const h = new URLSearchParams(location.hash.slice(1));
  if (h.get('trophy')) openDetail(Number(h.get('trophy')));
});
