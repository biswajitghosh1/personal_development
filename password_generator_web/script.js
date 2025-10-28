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
const meterFill = qs('meter-fill');
const meterLabel = qs('meter-label');
const a11yEl = qs('a11y');

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
  updateStrength(pw);
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

// Strength calculation (entropy estimate)
function uniqueCount(str){
  const s = new Set();
  for(const ch of str) s.add(ch);
  return s.size;
}

function estimateEntropy(password, poolSize){
  if(!password || poolSize <= 0) return 0;
  // approximate entropy = length * log2(poolSize)
  return password.length * Math.log2(poolSize || 1);
}

function mapEntropyToScore(entropy){
  // Map entropy (bits) to 0..100 — assume 0..128 bits useful range
  const pct = Math.max(0, Math.min(100, Math.round((entropy / 128) * 100)));
  return pct;
}

function entropyLabel(entropy){
  if(entropy < 28) return 'Very weak';
  if(entropy < 36) return 'Weak';
  if(entropy < 60) return 'Fair';
  if(entropy < 80) return 'Good';
  if(entropy < 100) return 'Strong';
  return 'Very strong';
}

function updateStrength(password){
  // build pool from current field values (letters + numbers + symbols)
  const letters = normalizeLetters(lettersEl.value).join('');
  const numbers = (numbersEl.value && numbersEl.value.trim()) || DEFAULT_NUMBERS;
  const symbols = (symbolsEl.value && symbolsEl.value.trim()) || DEFAULT_SYMBOLS;
  const pool = (letters + numbers + symbols);
  const poolSize = uniqueCount(pool);
  const entropy = estimateEntropy(password, poolSize);
  // analyze common patterns and produce penalty bits
  const analysis = analyzePatterns(password);
  const penalty = analysis.penalty || 0;
  const adjustedEntropy = Math.max(0, entropy - penalty);
  const score = mapEntropyToScore(adjustedEntropy);

  meterFill.style.width = score + '%';
  // reset classes
  meterFill.className = 'meter-fill';
  if(score < 20) meterFill.classList.add('weak');
  else if(score < 40) meterFill.classList.add('fair');
  else if(score < 65) meterFill.classList.add('good');
  else if(score < 85) meterFill.classList.add('strong');
  else meterFill.classList.add('very-strong');

  let label = `${adjustedEntropy.toFixed(1)} bits — ${entropyLabel(adjustedEntropy)}`;
  if(analysis.reasons && analysis.reasons.length){
    label += ` (warnings: ${analysis.reasons.slice(0,3).join('; ')})`;
  }
  meterLabel.textContent = `Strength: ${label}`;

  // Announce concise accessibility information
  if(a11yEl){
    const announce = `Password strength ${entropyLabel(adjustedEntropy)}. ${analysis.reasons.length? 'Warnings: ' + analysis.reasons.join(', '): 'No warnings.'}`;
    a11yEl.textContent = announce;
  }
}

function analyzePatterns(pw){
  const reasons = [];
  let penalty = 0;
  if(!pw) return {penalty, reasons};
  const lower = pw.toLowerCase();

  // common weak words / passwords
  const common = ['password','123456','qwerty','letmein','admin','welcome','monkey','iloveyou','secret','dragon','sunshine','iloveyou','football','baseball','password1'];
  for(const w of common){
    if(lower.includes(w)){
      reasons.push(`contains common word ${w}`);
      penalty += 24;
    }
  }

  // leet substitution check: map common leet back and check
  const leetMap = { '4':'a','@':'a','3':'e','1':'i','0':'o','5':'s','7':'t','$':'s'};
  let deleet = '';
  for(const ch of lower){
    deleet += (leetMap[ch] || ch);
  }
  for(const w of common){
    if(deleet.includes(w) && !lower.includes(w)){
      reasons.push(`common word via leet ${w}`);
      penalty += 18;
    }
  }

  // repeated characters (aaaa)
  if(/(.)\1{3,}/.test(pw)){
    reasons.push('repeated characters');
    penalty += 14;
  }

  // sequential chars (abcd, 1234)
  function hasSequential(s, minLen=4){
    const n = s.length;
    for(let i=0;i<=n-minLen;i++){
      // check ascending
      let asc = true, desc = true;
      for(let j=1;j<minLen;j++){
        if(s.charCodeAt(i+j) !== s.charCodeAt(i+j-1) + 1) asc = false;
        if(s.charCodeAt(i+j) !== s.charCodeAt(i+j-1) - 1) desc = false;
      }
      if(asc || desc) return true;
    }
    return false;
  }
  if(hasSequential(lower,4) || hasSequential(pw,4)){
    reasons.push('sequential characters');
    penalty += 16;
  }

  // only digits or only letters
  if(/^\d+$/.test(pw)){
    reasons.push('digits only');
    penalty += 16;
  }
  if(/^[A-Za-z]+$/.test(pw)){
    reasons.push('letters only');
    penalty += 8;
  }

  // very short password penalty
  if(pw.length < 8){
    reasons.push('short password');
    penalty += Math.max(0, 12 - (pw.length - 1) * 2);
  }

  // cap total penalty
  penalty = Math.min(penalty, 120);
  return {penalty, reasons};
}

// Update strength live when inputs change (preview based on current result)
lettersEl.addEventListener('input', ()=>{ if(resultEl.value) updateStrength(resultEl.value); });
numbersEl.addEventListener('input', ()=>{ if(resultEl.value) updateStrength(resultEl.value); });
symbolsEl.addEventListener('input', ()=>{ if(resultEl.value) updateStrength(resultEl.value); });
lengthEl.addEventListener('input', ()=>{ if(resultEl.value) updateStrength(resultEl.value); });
