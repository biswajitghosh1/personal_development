/* Minimal Document URL Tracker
   - Add entries with section, description, urls, notes
   - Persist in localStorage
   - Export/Import JSON
*/

(function(){
  const STORAGE_KEY = 'doctrack.items.v1';

  const q = sel => document.querySelector(sel);
  const el = id => document.getElementById(id);

  const form = el('add-form');
  const itemsWrap = el('items');
  const exportBtn = el('export-btn');
  const importBtn = el('import-btn');
  const clearBtn = el('clear-btn');
  const fileImport = el('file-import');
  const search = el('search');
  const filterSection = el('filter-section');

  let items = [];
  let useApi = false;
  let editId = null; // when editing an API-backed item

  // detect API availability (simple ping)
  async function detectApi(){
    try{
      const res = await fetch('/api/ping');
      if(res.ok){ useApi = true; }
    }catch(e){ useApi = false; }
  }

  async function load(){
    await detectApi();
    if(useApi){
      try{
        const res = await fetch('/api/items');
        items = await res.json();
      }catch(e){ console.warn('API load failed, falling back to localStorage', e); items = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
    }else{
      try { items = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
      catch(e){ items = []; }
    }
    render();
  }

  function save(){
    // local persistence only — API saves happen per-request
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }

  function parseUrls(text){
    if(!text) return [];
    return text.split(/\s*[\n,]+\s*/).map(s=>s.trim()).filter(Boolean);
  }

  function render(){
    itemsWrap.innerHTML = '';
    const sections = new Set();
    const qStr = (search && search.value && search.value.trim().toLowerCase()) || '';

    const list = items.filter(it => {
      if(!qStr) return true;
      const hay = (it.section + ' ' + it.desc + ' ' + it.notes).toLowerCase();
      return hay.includes(qStr);
    });

    list.forEach((it, idx) =>{
      sections.add(it.section);
      const container = document.createElement('div');
      container.className='item';

      const h = document.createElement('h3'); h.textContent = it.desc || '(no title)';
      const m = document.createElement('div'); m.className='meta'; m.textContent = `Section: ${it.section || '—'}`;
      const links = document.createElement('div'); links.className='links';
      (it.urls || []).forEach(u => {
        const a = document.createElement('a'); a.className='link'; a.href=u; a.target='_blank'; a.rel='noopener noreferrer'; a.textContent = u.replace(/^https?:\/\//,'').slice(0,60);
        links.appendChild(a);
      });
      const notes = document.createElement('div'); notes.className='notes'; notes.textContent = it.notes || '';

      const actions = document.createElement('div'); actions.style.marginTop='8px';
      const edit = document.createElement('button'); edit.className='btn'; edit.textContent='Edit';
      const del = document.createElement('button'); del.className='btn danger'; del.textContent='Delete';
      edit.onclick = ()=> editItem(idx);
      del.onclick = ()=> { if(confirm('Delete this item?')){ items.splice(idx,1); save(); render(); }};
      actions.appendChild(edit); actions.appendChild(del);

      container.appendChild(h); container.appendChild(m); container.appendChild(links); container.appendChild(notes); container.appendChild(actions);
      itemsWrap.appendChild(container);
    });

    // repopulate sections filter
    filterSection.innerHTML = '<option value="">All sections</option>' + [...sections].map(s=>`<option value="${s}">${s}</option>`).join('');
  }

  function editItem(idx){
    const it = items[idx];
    el('field-section').value = it.section || '';
    el('field-desc').value = it.desc || '';
    el('field-urls').value = (it.urls||[]).join('\n');
    el('field-notes').value = it.notes || '';
    // if this item has an id (API mode), set editId so submit will update
    editId = it.id || null;
    // remove local copy so form behaves like replace
    items.splice(idx,1);
    save(); render();
  }

  form.addEventListener('submit', async e =>{
    e.preventDefault();
    const section = el('field-section').value.trim();
    const desc = el('field-desc').value.trim();
    const urls = parseUrls(el('field-urls').value);
    const notes = el('field-notes').value.trim();

    if(useApi && editId){
      // update via API
      try{
        const res = await fetch('/api/items/' + editId, {method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({section, desc, urls, notes})});
        const updated = await res.json();
        items.unshift(updated);
      }catch(e){ alert('Update failed: ' + e.message); }
      editId = null;
    } else if(useApi){
      try{
        const res = await fetch('/api/items', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({section, desc, urls, notes})});
        const created = await res.json();
        items.unshift(created);
      }catch(e){ alert('Create failed: ' + e.message); }
    } else {
      items.unshift({section, desc, urls, notes, created: Date.now()});
      save();
    }

    render();
    form.reset();
  });

  exportBtn.addEventListener('click', ()=>{
    const blob = new Blob([JSON.stringify(items, null, 2)], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href=url; a.download='doctrack_export.json'; document.body.appendChild(a); a.click(); a.remove();
  });

  importBtn.addEventListener('click', ()=> fileImport.click());
  fileImport.addEventListener('change', async (ev)=>{
    const f = ev.target.files && ev.target.files[0]; if(!f) return;
    try {
      const txt = await f.text(); const json = JSON.parse(txt);
      if(!Array.isArray(json)) throw new Error('Invalid JSON');
      if(useApi){
        // post to API import endpoint
        const res = await fetch('/api/import', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(json)});
        const created = await res.json();
        items = created.concat(items);
      } else {
        items = json.concat(items);
        save();
      }
      render();
      alert('Imported ' + json.length + ' items');
    } catch(e){ alert('Import failed: ' + e.message); }
    fileImport.value = '';
  });

  clearBtn.addEventListener('click', async ()=>{
    if(!confirm('Remove all saved items?')) return;
    if(useApi){
      // naive: delete items individually
      try{
        const ids = items.map(i=>i.id).filter(Boolean);
        for(const id of ids){ await fetch('/api/items/' + id, {method:'DELETE'}); }
        items = [];
      }catch(e){ alert('Failed to clear via API: ' + e.message); }
    } else {
      items = [];
      save();
    }
    render();
  });

  search && search.addEventListener('input', ()=> render());
  filterSection && filterSection.addEventListener('change', ()=>{
    const v = filterSection.value;
    if(!v) return load();
    // simple filter
    itemsWrap.innerHTML='';
    items.filter(it=>it.section===v).forEach((it, idx)=>{/* render minimal */});
    render();
  });

  // initial
  load();

})();
