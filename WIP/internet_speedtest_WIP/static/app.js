
// filepath: static/app.js
// Improved discovery with timeout + manual server input + clearer logging.
// Centered UI expects server input if automatic discovery fails.

(function(){
  const serverInfoEl = document.getElementById('server-info');
  const discoverBtn = document.getElementById('discover-btn');
  const runTestBtn = document.getElementById('run-test-btn');
  const notesEl = document.getElementById('notes');
  const logEl = document.getElementById('log');
  const serverInput = document.getElementById('server-input');
  const setServerBtn = document.getElementById('set-server-btn');

  const setMetric = (id, text) => {
    const el = document.getElementById(id);
    if(el) el.textContent = text;
  };

  const log = (msg) => {
    const time = new Date().toLocaleTimeString();
    logEl.textContent = `[${time}] ${msg}\n` + logEl.textContent;
    console.debug('[speedtest]', msg);
  };

  // More discovery endpoints and variants (best-effort).
  const NS_ENDPOINTS = [
    'https://mlab-ns.measurementlab.net/ndt?format=json',
    'https://mlab-ns.measurementlab.net/ndt/v1?format=json',
    'https://mlab-ns.appspot.com/ndt?format=json',
    'https://mlab-ns.appspot.com/ndt/v1?format=json'
  ];

  // fetch with timeout helper
  function fetchWithTimeout(url, opts = {}, timeout = 5000){
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('timeout')), timeout);
      fetch(url, Object.assign({cache:'no-store', mode:'cors'}, opts)).then(resp => {
        clearTimeout(timer);
        resolve(resp);
      }).catch(err => {
        clearTimeout(timer);
        reject(err);
      });
    });
  }

  async function discoverNearestServer(){
    serverInfoEl.innerHTML = `<p class="muted">Discovering nearest server…</p>`;
    notesEl.textContent = '';
    for(const url of NS_ENDPOINTS){
      try {
        log(`Trying nameserver: ${url}`);
        const resp = await fetchWithTimeout(url, {}, 5000);
        if(!resp.ok){
          log(`Nameserver ${url} returned ${resp.status} ${resp.statusText}`);
          continue;
        }
        const json = await resp.json();
        let server = null;
        if(Array.isArray(json) && json.length>0){
          server = json[0];
        } else if(json.servers && Array.isArray(json.servers) && json.servers.length>0){
          server = json.servers[0];
        } else if(json.items && Array.isArray(json.items) && json.items.length>0){
          server = json.items[0];
        } else if(json.server || json.hostname || json.host){
          server = json;
        }
        if(server){
          displayServer(server, url);
          setMetric('download','—');
          setMetric('upload','—');
          return server;
        } else {
          log(`Nameserver ${url} returned JSON but no recognizable server entry.`);
        }
      } catch (err){
        // Common cause: CORS blocked the request; fetch throws a TypeError or network error.
        log(`Nameserver ${url} error: ${err.message}`);
        if(err.message === 'timeout') log('Request timed out (server slow or blocked).');
      }
    }
    serverInfoEl.innerHTML = `<p class="muted">Could not discover M-Lab server automatically.</p>`;
    notesEl.textContent = 'Discovery failed — this is often due to CORS or network restrictions. Use the manual server input below (hostname or full URL) or run a small proxy.';
    return null;
  }

  function displayServer(server, sourceUrl){
    const hostname = server.hostname || server.Server || server.fqdn || server.name || server.host || server.server;
    const ip = server.ip || server.IP || server.addr;
    const city = server.city || server.location?.city || server.geolocation?.city;
    const country = server.country || server.location?.country || server.geolocation?.country;
    const coords = server.location?.coordinates || server.coordinates || (server.geolocation ? [server.geolocation.lon, server.geolocation.lat] : undefined);
    const transport = server.transport || server.protocol || '';

    let html = `<table><tbody>`;
    if(hostname) html += `<tr><td><strong>Host</strong></td><td>${hostname}</td></tr>`;
    if(ip) html += `<tr><td><strong>IP</strong></td><td>${ip}</td></tr>`;
    if(city || country) html += `<tr><td><strong>Location</strong></td><td>${[city,country].filter(Boolean).join(', ')}</td></tr>`;
    if(coords) html += `<tr><td><strong>Coordinates</strong></td><td>${coords}</td></tr>`;
    if(transport) html += `<tr><td><strong>Transport</strong></td><td>${transport}</td></tr>`;
    html += `<tr><td><strong>Discovery</strong></td><td><small class="muted">${sourceUrl}</small></td></tr>`;
    html += `</tbody></table>`;

    serverInfoEl.innerHTML = html;
    notesEl.textContent = 'Tip: If automatic discovery fails, paste a hostname or full server URL into the manual input and click "Use server".';
    log(`Discovered server: ${hostname || ip || 'unknown'}`);
  }

  // Lightweight ping using image loads to avoid CORS.
  async function measurePingJitter(hostname, tries = 8, timeoutMs = 5000){
    setMetric('ping', 'measuring…');
    setMetric('jitter', 'measuring…');
    const results = [];
    for(let i=0;i<tries;i++){
      try {
        const stamp = Date.now();
        await loadImagePing(hostname, stamp, timeoutMs);
        const rtt = Date.now() - stamp;
        results.push(rtt);
        log(`ping #${i+1}: ${rtt} ms`);
        await new Promise(r => setTimeout(r, 120));
      } catch (err){
        log(`ping #${i+1} failed: ${err.message}`);
      }
    }
    if(results.length === 0){
      setMetric('ping','—');
      setMetric('jitter','—');
      log('Ping measurement failed (no successful requests).');
      return;
    }
    const mean = results.reduce((a,b)=>a+b,0)/results.length;
    const variance = results.reduce((a,b)=>a + Math.pow(b-mean,2),0)/results.length;
    const stddev = Math.sqrt(variance);
    setMetric('ping', `${Math.round(mean)} ms`);
    setMetric('jitter', `${Math.round(stddev)} ms`);
    log(`Ping mean=${Math.round(mean)} ms jitter=${Math.round(stddev)} ms`);
  }

  function loadImagePing(hostname, stamp, timeoutMs){
    return new Promise((resolve, reject) => {
      const candidates = [
        `https://${hostname}/favicon.ico?_=${stamp}`,
        `https://${hostname}/?_=${stamp}`
      ];
      let used = false;
      let timer = setTimeout(() => {
        if(!used){ used = true; reject(new Error('timeout')); }
      }, timeoutMs);

      function tryUrl(i){
        if(i >= candidates.length){
          if(!used){ used = true; clearTimeout(timer); reject(new Error('all failed')); }
          return;
        }
        const url = candidates[i];
        const img = new Image();
        img.onload = () => {
          if(used) return;
          used = true;
          clearTimeout(timer);
          resolve();
        };
        img.onerror = () => {
          if(used) return;
          tryUrl(i+1);
        };
        img.src = url;
      }
      tryUrl(0);
    });
  }

  // Run ndt7 test (best-effort, depends on loaded ndt7 library and server support)
  async function runNdt7Test(serverCandidate){
    setMetric('download','running…');
    setMetric('upload','running…');
    setMetric('ping','running…');
    setMetric('jitter','running…');

    let serverUrl = null;
    if(!serverCandidate){
      log('No discovered server — cannot run ndt7 test automatically.');
      notesEl.textContent = 'No server discovered. Paste a server into the manual input and press "Use server".';
      return;
    }

    const host = serverCandidate.hostname || serverCandidate.host || serverCandidate.server || serverCandidate.name || serverCandidate.ip;
    serverUrl = serverCandidate.url || serverCandidate.urls?.[0] || serverCandidate.server_url || null;
    if(!serverUrl && typeof host === 'string'){
      serverUrl = `wss://${host}${serverCandidate.port ? (':' + serverCandidate.port) : ''}/ndt/v7`;
    }

    log(`Attempting ndt7 client test against ${serverUrl || host || 'unknown'}`);

    if(typeof window.ndt7 !== 'undefined'){
      log('ndt7 client found on window.ndt7 — trying to use it.');
      try {
        if(typeof window.ndt7.start === 'function'){
          log('Using ndt7.start API');
          await window.ndt7.start(serverUrl, {
            onMeasurement: (m) => { log(`measurement: ${JSON.stringify(m)}`); },
            onComplete: (results) => {
              log('ndt7 complete: ' + JSON.stringify(results));
              if(results && results.download) setMetric('download', formatBits(results.download));
              if(results && results.upload) setMetric('upload', formatBits(results.upload));
              if(results && results.ping) setMetric('ping', `${Math.round(results.ping)} ms`);
              if(results && results.jitter) setMetric('jitter', `${Math.round(results.jitter)} ms`);
            },
            onError: (e) => {
              log('ndt7 error: ' + String(e));
              notesEl.textContent = 'ndt7 client reported an error — check console for details.';
            }
          });
          return;
        }

        if(window.ndt7 && typeof window.ndt7.NDT7Client === 'function'){
          log('Using ndt7.NDT7Client API (attempt).');
          try {
            const client = new window.ndt7.NDT7Client({ server: serverUrl });
            if(typeof client.on === 'function'){
              client.on('test:measurement', (m) => { log('measurement: ' + JSON.stringify(m)); });
              client.on('test:state:complete', (results) => { log('ndt7 complete: ' + JSON.stringify(results)); });
              client.on('test:state:error', (e) => { log('ndt7 error: ' + String(e)); });
            }
            if(typeof client.start === 'function'){
              await client.start();
              log('ndt7 start returned/completed (check logged events).');
            } else {
              log('ndt7 client created but no start() found.');
            }
            return;
          } catch(e){
            log('ndt7 NDT7Client invocation failed: ' + e.message);
          }
        }

        log('ndt7 library present but no recognized API found. If you want, tell me the ndt7 version and I can adapt the code.');
        notesEl.textContent = 'ndt7 library loaded, but UI does not recognize its API. Inspect `window.ndt7` in console.';
      } catch(e){
        log('Error while trying to use ndt7: ' + e.message);
        notesEl.textContent = 'ndt7 invocation failed — check console for details.';
      }
    } else {
      log('ndt7 client not found on page. Falling back to ping/jitter and leaving download/upload blank.');
      notesEl.textContent = 'ndt7 client not loaded from CDN or exposed differently. Use manual server input or pin a specific ndt7 version.';
      const hostForPing = host || (serverCandidate.ip && serverCandidate.ip.toString()) || null;
      if(hostForPing){
        await measurePingJitter(hostForPing, 8);
        setMetric('download','— (ndt7 required)');
        setMetric('upload','— (ndt7 required)');
      } else {
        setMetric('download','—');
        setMetric('upload','—');
        setMetric('ping','—');
        setMetric('jitter','—');
        log('No host available for ping fallback.');
      }
    }
  }

  function formatBits(bytesPerSec){
    if(!bytesPerSec && bytesPerSec !== 0) return '—';
    const bps = Number(bytesPerSec);
    if(!isFinite(bps)) return '—';
    const units = ['bps','Kbps','Mbps','Gbps'];
    let value = bps;
    let i = 0;
    while(value >= 1000 && i < units.length-1){
      value /= 1000;
      i++;
    }
    return `${value.toFixed(2)} ${units[i]}`;
  }

  // manual server handling
  let lastServer = null;
  setServerBtn.addEventListener('click', () => {
    const v = serverInput.value && serverInput.value.trim();
    if(!v) {
      log('Manual server input empty.');
      return;
    }
    // If looks like JSON url or wss/ws/https, create a small serverCandidate to use
    let candidate = {};
    if(v.startsWith('wss://') || v.startsWith('ws://') || v.startsWith('https://') || v.startsWith('http://')){
      candidate = { url: v, hostname: v };
    } else {
      candidate = { hostname: v };
    }
    lastServer = candidate;
    displayServer(candidate, 'manual');
    log(`Manual server set: ${v}`);
  });

  discoverBtn.addEventListener('click', async () => {
    lastServer = await discoverNearestServer();
  });

  runTestBtn.addEventListener('click', async () => {
    if(!lastServer){
      lastServer = await discoverNearestServer();
      if(!lastServer){
        log('No server discovered; aborting test run.');
        return;
      }
    }
    await runNdt7Test(lastServer);
  });

  // initial discover
  (async ()=>{
    lastServer = await discoverNearestServer();
    if(lastServer){
      const host = lastServer.hostname || lastServer.server || lastServer.host || lastServer.name || lastServer.ip;
      if(host){
        measurePingJitter(host, 6).catch(e => log('Ping fallback error: ' + e.message));
      }
    }
  })();

})();
