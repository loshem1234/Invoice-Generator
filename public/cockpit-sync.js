/* Sends saved invoices and estimates to the LuxCraft Cockpit.
   The connection key lives only in this browser (never in the code). Every save syncs a few seconds later. */
(function () {
  const KEY = 'luxcraft.cockpit.v1';
  const WATCH = ['luxcraft.invoices.v1', 'luxcraft.estimates.v1'];
  const read = (k) => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } };
  const cfg = () => read(KEY) || {};
  const saveCfg = (c) => { try { _setItem.call(localStorage, KEY, JSON.stringify(c)); } catch (e) {} };

  let timer = null;
  let busy = false;
  async function push() {
    const c = cfg();
    if (!c.url || !c.token) return { skipped: true };
    if (busy) { schedule(); return { skipped: true }; }
    busy = true;
    const inv = read(WATCH[0]) || {}; const est = read(WATCH[1]) || {};
    try {
      const res = await fetch(c.url.replace(/\/+$/, '') + '/api/integrations/invoice-app', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + c.token },
        body: JSON.stringify({ invoices: inv.invoices || [], estimates: est.estimates || [] }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || ('HTTP ' + res.status));
      saveCfg({ ...cfg(), lastSync: new Date().toISOString(), lastError: null });
      status();
      return data;
    } catch (e) {
      saveCfg({ ...cfg(), lastError: e.message || 'Network error' });
      status();
      return { error: e.message };
    } finally { busy = false; }
  }
  function schedule() { clearTimeout(timer); timer = setTimeout(push, 2500); }

  // Watch saves to the invoice/estimate stores without touching the app's own code.
  const _setItem = Storage.prototype.setItem;
  Storage.prototype.setItem = function (k, v) {
    _setItem.call(this, k, v);
    if (this === localStorage && WATCH.includes(k)) schedule();
  };

  // A small "Cockpit" box in Settings.
  function status() {
    const el = document.getElementById('ck_status'); if (!el) return;
    const c = cfg();
    if (!c.url || !c.token) { el.className = 'msg'; el.textContent = 'Not connected.'; return; }
    if (c.lastError) { el.className = 'msg err'; el.textContent = "Couldn't sync: " + c.lastError; return; }
    el.className = 'msg ok';
    el.textContent = c.lastSync ? 'Connected · last synced ' + new Date(c.lastSync).toLocaleString() : 'Connected · waiting for first sync';
  }
  function mount() {
    const box = document.querySelector('#view-settings .settings');
    if (!box || document.getElementById('ck_box')) return;
    const c = cfg();
    const fs = document.createElement('fieldset');
    fs.id = 'ck_box';
    fs.innerHTML = '<legend>LuxCraft Cockpit</legend>' +
      '<p class="note">Sends every saved invoice and estimate to your Cockpit, where payments, jobs and taxes update automatically. Create the connection key in the Cockpit under Settings → Connections. Enter it once on each device you use.</p>' +
      '<div class="row"><label>Cockpit address<input id="ck_url" placeholder="https://your-cockpit.up.railway.app"></label>' +
      '<label>Connection key<input id="ck_token" type="password" autocomplete="off" placeholder="lct_…"></label></div>' +
      '<div class="compile"><button type="button" class="btn primary" id="ck_save">Save & sync now</button>' +
      '<button type="button" class="btn" id="ck_off">Disconnect</button><span class="msg" id="ck_status"></span></div>';
    box.insertBefore(fs, box.lastElementChild);
    document.getElementById('ck_url').value = c.url || '';
    document.getElementById('ck_token').value = c.token ? '••••••••' : '';
    document.getElementById('ck_save').addEventListener('click', async () => {
      const url = document.getElementById('ck_url').value.trim();
      const tokIn = document.getElementById('ck_token').value.trim();
      const token = tokIn && !tokIn.startsWith('•') ? tokIn : cfg().token;
      if (!/^https:\/\/|^http:\/\/localhost/.test(url)) { const s = document.getElementById('ck_status'); s.className = 'msg err'; s.textContent = 'Enter the Cockpit address starting with https://'; return; }
      if (!token) { const s = document.getElementById('ck_status'); s.className = 'msg err'; s.textContent = 'Paste the connection key.'; return; }
      saveCfg({ url, token });
      document.getElementById('ck_token').value = '••••••••';
      const s = document.getElementById('ck_status'); s.className = 'msg'; s.textContent = 'Syncing…';
      const r = await push();
      if (r && !r.error && !r.skipped) { s.className = 'msg ok'; s.textContent = 'Synced ' + r.invoices + ' invoices and ' + r.estimates + ' estimates.'; }
    });
    document.getElementById('ck_off').addEventListener('click', () => { saveCfg({}); document.getElementById('ck_url').value = ''; document.getElementById('ck_token').value = ''; status(); });
    status();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
  // Catch up on anything saved while offline.
  setTimeout(() => { if (cfg().url && cfg().token) push(); }, 3000);
  window.CockpitSync = { push };
})();
