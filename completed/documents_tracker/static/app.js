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

  function load(){
    try { items = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
    catch(e){ items = []; }
    render();
  }

  function save(){
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
    // remove old and set form submit to replace
    items.splice(idx,1);
    save(); render();
  }

  form.addEventListener('submit', e =>{
    e.preventDefault();
    const section = el('field-section').value.trim();
    const desc = el('field-desc').value.trim();
    const urls = parseUrls(el('field-urls').value);
    const notes = el('field-notes').value.trim();
    items.unshift({section, desc, urls, notes, created: Date.now()});
    save(); render();
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
      // merge
      items = json.concat(items);
      save(); render();
      alert('Imported ' + json.length + ' items');
    } catch(e){ alert('Import failed: ' + e.message); }
    fileImport.value = '';
  });

  clearBtn.addEventListener('click', ()=>{ if(confirm('Remove all saved items?')){ items=[]; save(); render(); }});

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
