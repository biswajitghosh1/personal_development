/* Password generator logic
   - words: comma or space separated. If "Treat words as whole tokens" is checked, words are used as tokens (passphrase style).
   - numbers/symbols: treated as string of characters to include (leave blank for sensible defaults)
   - length: target length of final password
*/

function qs(id){return document.getElementById(id)}

const lettersEl = qs('letters');
const numbersEl = qs('numbers');
const symbolsEl = qs('symbols');
const lengthEl = qs('length');
const generateBtn = qs('generate');
const resultEl = qs('result');
const copyBtn = qs('copy');
const regenBtn = qs('regen');
const msgEl = qs('msg');

const DEFAULT_NUMBERS = '0123456789';
const DEFAULT_SYMBOLS = '!@#$%&*()-_=+[]{};:,.<>?';

function randInt(max){return Math.floor(Math.random()*max)}

function pickRandom(arr){return arr[randInt(arr.length)]}

function normalizeLetters(raw){
  if(!raw) return [];
  // remove commas and whitespace then split into characters
  return raw.replace(/[,\s]+/g,'').split('').map(s=>s.trim()).filter(Boolean);
}

function buildPassword(){
  msgEl.textContent='';
  const len = parseInt(lengthEl.value,10) || 16;
  if(len < 4){ msgEl.textContent='Choose a length of at least 4'; return ''; }

  const letters = normalizeLetters(lettersEl.value);
  const numbers = (numbersEl.value && numbersEl.value.trim()) || DEFAULT_NUMBERS;
  const symbols = (symbolsEl.value && symbolsEl.value.trim()) || DEFAULT_SYMBOLS;

  if(!letters.length && !numbers && !symbols){ msgEl.textContent='Provide at least one source: letters, numbers or symbols'; return ''; }

  // character pool: letters plus numbers and symbols
  let charPool = numbers + symbols + letters.join('');
  // remove duplicates to have a smaller pool? keep duplicates for character frequency
  if(!charPool) return '';

  let out='';
  for(let i=0;i<len;i++) out += charPool[randInt(charPool.length)];
  return out;
}

function generateAndShow(){
  const pw = buildPassword();
  if(!pw) return;
  resultEl.value = pw;
}

generateBtn.addEventListener('click', ()=>{
  generateAndShow();
});

regenBtn.addEventListener('click', ()=>{
  generateAndShow();
});

copyBtn.addEventListener('click', async ()=>{
  const val = resultEl.value;
  if(!val) return;
  try{
    await navigator.clipboard.writeText(val);
    msgEl.textContent = 'Password copied to clipboard.';
  }catch(e){
    // fallback
    resultEl.select();
    document.execCommand('copy');
    msgEl.textContent = 'Password copied (fallback).';
  }
  setTimeout(()=>msgEl.textContent='',2500);
});

// generate an initial password on load
window.addEventListener('load', ()=>generateAndShow());
