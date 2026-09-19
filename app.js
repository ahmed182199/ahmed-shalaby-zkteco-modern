const defaultZones = [
  { city: 'Cairo', zone: 'Africa/Cairo', label: 'Egypt' },
  { city: 'London', zone: 'Europe/London', label: 'United Kingdom' },
  { city: 'New York', zone: 'America/New_York', label: 'United States' },
  { city: 'Dubai', zone: 'Asia/Dubai', label: 'United Arab Emirates' },
  { city: 'Tokyo', zone: 'Asia/Tokyo', label: 'Japan' },
  { city: 'Sydney', zone: 'Australia/Sydney', label: 'Australia' },
  { city: 'Singapore', zone: 'Asia/Singapore', label: 'Singapore' },
  { city: 'Paris', zone: 'Europe/Paris', label: 'France' },
  { city: 'São Paulo', zone: 'America/Sao_Paulo', label: 'Brazil' },
  { city: 'Los Angeles', zone: 'America/Los_Angeles', label: 'United States' },
  { city: 'Mumbai', zone: 'Asia/Kolkata', label: 'India' },
  { city: 'Johannesburg', zone: 'Africa/Johannesburg', label: 'South Africa' }
];
const storageKey = 'world-clock-zones';
let selectedZones = loadZones();
let query = '';
const $ = (id) => document.getElementById(id);

function loadZones() {
  try { return JSON.parse(localStorage.getItem(storageKey)) || defaultZones.slice(0, 6); }
  catch { return defaultZones.slice(0, 6); }
}
function saveZones() { localStorage.setItem(storageKey, JSON.stringify(selectedZones)); }
function formatTime(zone) { return new Intl.DateTimeFormat(undefined, { timeZone: zone, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(new Date()); }
function formatDate(zone) { return new Intl.DateTimeFormat(undefined, { timeZone: zone, weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' }).format(new Date()); }
function getOffset(zone) { const parts = new Intl.DateTimeFormat('en-US', { timeZone: zone, timeZoneName: 'longOffset' }).formatToParts(new Date()); return parts.find(p => p.type === 'timeZoneName')?.value.replace('GMT', 'UTC') || zone; }
function renderClocks() {
  const visible = selectedZones.filter(z => `${z.city} ${z.zone} ${z.label}`.toLowerCase().includes(query.toLowerCase()));
  $('emptyState').hidden = visible.length > 0;
  $('clockGrid').innerHTML = visible.map((z, index) => `<article class="clock-card" style="animation-delay:${index * 45}ms">
    <header><div><h2 class="city">${escapeHtml(z.city)}</h2><div class="zone">${escapeHtml(z.label)} · ${escapeHtml(z.zone)}</div></div>
    <button class="remove-button" data-remove="${escapeHtml(z.zone)}" aria-label="Remove ${escapeHtml(z.city)}">×</button></header>
    <div class="time">${formatTime(z.zone)}</div><div class="date">${formatDate(z.zone)}</div><div class="offset">${getOffset(z.zone)}</div>
  </article>`).join('');
  document.querySelectorAll('[data-remove]').forEach(btn => btn.addEventListener('click', () => { selectedZones = selectedZones.filter(z => z.zone !== btn.dataset.remove); saveZones(); renderClocks(); renderOptions(); }));
  $('localInfo').textContent = `Your local time: ${new Intl.DateTimeFormat(undefined, { timeZoneName: 'short' }).format(new Date())}`;
}
function renderOptions() {
  const available = defaultZones.filter(z => !selectedZones.some(s => s.zone === z.zone) && `${z.city} ${z.zone} ${z.label}`.toLowerCase().includes($('dialogSearch').value.toLowerCase()));
  $('zoneOptions').innerHTML = available.length ? available.map(z => `<button class="zone-option" data-zone="${escapeHtml(z.zone)}"><span><b>${escapeHtml(z.city)}</b><br><small>${escapeHtml(z.label)}</small></span><span>＋</span></button>`).join('') : '<p class="empty-state">No time zones available.</p>';
  document.querySelectorAll('[data-zone]').forEach(btn => btn.addEventListener('click', () => { selectedZones.push(defaultZones.find(z => z.zone === btn.dataset.zone)); saveZones(); renderClocks(); renderOptions(); }));
}
function escapeHtml(value) { return String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]); }
$('zoneSearch').addEventListener('input', e => { query = e.target.value; renderClocks(); });
$('addClock').addEventListener('click', () => { $('dialogSearch').value = ''; renderOptions(); $('zoneDialog').showModal(); });
$('dialogSearch').addEventListener('input', renderOptions);
$('themeToggle').addEventListener('click', () => { document.documentElement.classList.toggle('light'); $('themeToggle').textContent = document.documentElement.classList.contains('light') ? '🌙' : '☀️'; });
renderClocks();
setInterval(renderClocks, 1000);
