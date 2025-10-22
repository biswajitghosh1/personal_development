let vault=[]; let masterKey=null; let editIndex=null;

// Encryption helpers (PBKDF2 -> AES-GCM)
async function getKeyFromPassword(password){
  const enc=new TextEncoder();
  const keyMaterial=await crypto.subtle.importKey('raw',enc.encode(password),'PBKDF2',false,['deriveKey']);
  return crypto.subtle.deriveKey({name:'PBKDF2',salt:enc.encode('vault_salt'),iterations:200000,hash:'SHA-256'},keyMaterial,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);
}
async function encryptData(key,data){
  const enc=new TextEncoder(); const iv=crypto.getRandomValues(new Uint8Array(12));
  const ct=await crypto.subtle.encrypt({name:'AES-GCM',iv},key,enc.encode(JSON.stringify(data)));
  return {iv:Array.from(iv),ct:Array.from(new Uint8Array(ct))};
}
async function decryptData(key,encObj){
  try{ const iv=new Uint8Array(encObj.iv); const ct=new Uint8Array(encObj.ct);
    const plain=await crypto.subtle.decrypt({name:'AES-GCM',iv},key,ct); return JSON.parse(new TextDecoder().decode(plain));
  }catch(e){ return null; }
}

// storage
function saveVault(){ encryptData(masterKey,vault).then(obj=>localStorage.setItem('vault',JSON.stringify(obj))); }
async function loadVault(password){ masterKey=await getKeyFromPassword(password); const s=localStorage.getItem('vault'); if(!s) return []; const dec=await decryptData(masterKey,JSON.parse(s)); return dec||[]; }

// UI refs
const loginBtn=document.getElementById('login-btn'); const setupBtn=document.getElementById('setup-btn');
const addBtn=document.getElementById('add-entry-btn'); const saveBtn=document.getElementById('save-entry-btn');
const cancelBtn=document.getElementById('cancel-btn'); const searchInput=document.getElementById('search');
const csvImport=document.getElementById('csv-import'); const excelImport=document.getElementById('excel-import');
const modal=document.getElementById('entry-modal');

// login/setup
loginBtn.onclick=async()=>{ const pw=document.getElementById('master-password').value; try{ const data=await loadVault(pw); if(data===null){ alert('Invalid password or corrupted vault.'); return; } vault=data; masterKey=await getKeyFromPassword(pw); document.getElementById('login-screen').classList.add('hidden'); document.getElementById('vault-screen').classList.remove('hidden'); renderList(); }catch(e){ alert('Failed to load vault: '+e.message); } };
setupBtn.onclick=async()=>{ const pw=document.getElementById('master-password').value; masterKey=await getKeyFromPassword(pw); vault=[]; saveVault(); document.getElementById('login-screen').classList.add('hidden'); document.getElementById('vault-screen').classList.remove('hidden'); renderList(); };

// render
function renderList(){ const tbody=document.querySelector('#vault-table tbody'); tbody.innerHTML=''; const q=searchInput.value.trim().toLowerCase(); const shown=vault.filter(e=> (e.site||'').toLowerCase().includes(q) || (e.username||'').toLowerCase().includes(q)); if(shown.length===0){ tbody.innerHTML='<tr><td colspan="5" style="color:#6b7280">No entries</td></tr>'; return; } shown.forEach((e,i)=>{ const tr=document.createElement('tr'); tr.innerHTML=`<td>${highlight(e.site,q)}</td><td>${highlight(e.username,q)}</td><td><input type='password' value='${e.password||''}' readonly></td><td>${e.notes||''}</td><td><button onclick='editEntry(${i})'>Edit</button> <button onclick='deleteEntry(${i})'>Delete</button></td>`; tbody.appendChild(tr); }); }
function highlight(text,q){ if(!q) return text; try{ const re=new RegExp(q.replace(/[.*+?^${}()|[\\]\\\\]/g,'\\\\$&'),'ig'); return text.replace(re,m=>`<span class='highlight'>${m}</span>`); }catch(e){ return text; } }
searchInput.oninput=renderList;

// modal
addBtn.onclick=()=>{ editIndex=null; openModal(); };
function openModal(){ modal.classList.remove('hidden'); }
function closeModal(){ modal.classList.add('hidden'); document.getElementById('site').value=''; document.getElementById('username').value=''; document.getElementById('password').value=''; document.getElementById('notes').value=''; }
cancelBtn.onclick=closeModal;
modal.onclick=(ev)=>{ if(ev.target===modal) closeModal(); };

// save entry
saveBtn.onclick=async()=>{ const site=document.getElementById('site').value.trim(); const username=document.getElementById('username').value.trim(); const password=document.getElementById('password').value; const notes=document.getElementById('notes').value; if(!site){ alert('Please enter site/name'); return; } if(editIndex!==null){ vault[editIndex]={site,username,password,notes,updated:Date.now()}; }else{ vault.push({site,username,password,notes,created:Date.now(),updated:Date.now()}); } saveVault(); closeModal(); renderList(); };

// edit/delete
window.editEntry=(i)=>{ editIndex=i; const e=vault[i]; document.getElementById('site').value=e.site||''; document.getElementById('username').value=e.username||''; document.getElementById('password').value=e.password||''; document.getElementById('notes').value=e.notes||''; openModal(); }
window.deleteEntry=async(i)=>{ if(!confirm('Delete this entry?')) return; vault=vault.filter((_,idx)=>idx!==i); saveVault(); renderList(); }

// CSV import (simple)
csvImport.onchange=(ev)=>{ const f=ev.target.files[0]; if(!f) return; const r=new FileReader(); r.onload=()=>{ const text=r.result; const lines=text.split("\\n").map(l=>l.split(",")); const headers=lines.shift().map(h=>h.toLowerCase().trim()); lines.forEach(row=>{ if(row.join("").trim()==="") return; const obj={}; headers.forEach((h,idx)=> obj[h]=row[idx]||""); const site=obj.site||obj.name||obj.title||""; const username=obj.username||obj.email||""; const password=obj.password||""; const notes=obj.notes||""; if(site||username||password) vault.push({site,username,password,notes,created:Date.now(),updated:Date.now()}); }); saveVault(); renderList(); }; r.readAsText(f); };

// Excel import using SheetJS (if present)
excelImport.onchange=(ev)=>{ const f=ev.target.files[0]; if(!f) return; if(typeof XLSX==='undefined'){ alert('SheetJS not found. Run download_xlsx.sh or place xlsx.full.min.js in this folder.'); return; } const r=new FileReader(); r.onload=()=>{ const data=new Uint8Array(r.result); const wb=XLSX.read(data,{type:'array'}); const sheet=wb.Sheets[wb.SheetNames[0]]; const rows=XLSX.utils.sheet_to_json(sheet,{defval:''}); const sample=rows[0]||{}; const mapping=detectColumns(sample); let added=0; rows.forEach(row=>{ const site=row[mapping.site]||row[mapping.name]||row[mapping.title]||''; const username=row[mapping.username]||row[mapping.email]||''; const password=row[mapping.password]||''; const notes=row[mapping.notes]||''; if(site||username||password){ vault.push({site,username,password,notes,created:Date.now(),updated:Date.now()}); added++; } }); saveVault(); renderList(); alert('Imported '+added+' entries (if any).'); }; r.readAsArrayBuffer(f); };

function detectColumns(sample){ const keys=Object.keys(sample||{}).map(k=>k.toLowerCase().trim()); const kmap={}; keys.forEach(k=>{ if(/site|name|title|website|host/.test(k)) kmap.site=k; if(/user|username|login|email|id/.test(k)) kmap.username=kmap.username||k; if(/pass|password/.test(k)) kmap.password=k; if(/note|notes|remark/.test(k)) kmap.notes=k; }); return {site:kmap.site||keys[0]||'', username:kmap.username||keys[1]||'', password:kmap.password||keys[2]||'', notes:kmap.notes||keys[3]||''}; }

// helper to export encrypted blob (optional)
window.exportEncrypted=()=>{ const blob=localStorage.getItem('vault'); if(!blob){ alert('No vault to export'); return; } const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([blob],{type:'application/json'})); a.download='vault_encrypted.json'; a.click(); };
