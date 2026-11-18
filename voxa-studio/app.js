(() => {
  'use strict';

  const API = 'https://api.github.com';
  const PUBLIC_URL = 'https://munnamihir.github.io/voxa-studio/';
  const MAX_REPOS = 100;
  const colors = ['#61efd1', '#57cfff', '#a695ff', '#ffcb7c', '#ff82ac', '#7194ff', '#a5dc89'];
  const contexts = {
    all: { label: 'All public engineering activity', info: 'All sampled public, non-fork, non-archived repositories appear here. No quality or credibility conclusion is calculated.', pattern: null },
    security: { label: 'Security & cryptography', info: 'Repository names, descriptions, and topics are searched for security-related keywords. Results are only discovery leads.', pattern: /crypt|secur|auth|encrypt|privacy|cipher|pqc|key|vuln|post.quantum|identity|zero.trust|cbom/i },
    ai: { label: 'AI & automation', info: 'A keyword filter for AI, machine learning, agents, and automation. It does not evaluate model quality or developer expertise.', pattern: /\b(ai|ml|llm|rag)\b|agent|intelligen|neural|machine.learn|automat|inferen|model|embedding/i },
    reliability: { label: 'Reliability & safety', info: 'A keyword filter for reliability, safety, testing, simulation, and resilience. Matches are not safety certifications.', pattern: /reliab|safety|test|validat|fault|monitor|fleet|vehicle|simulat|observab|bench|assur|recover/i },
    platforms: { label: 'Systems & infrastructure', info: 'A keyword filter for platforms, protocols, databases, distributed systems, and infrastructure. It is not a performance benchmark.', pattern: /system|infra|cloud|database|db|distributed|protocol|runtime|network|api|platform|pipeline|docker|kafka/i }
  };

  const $ = id => document.getElementById(id);
  let snapshot = null;
  let currentContext = 'all';
  const svgEscape = str => String(str ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
  const short = (value, max) => { const s = String(value || ''); return s.length > max ? s.slice(0, max - 1) + '…' : s; };
  const number = x => new Intl.NumberFormat('en-US').format(x);
  const iso = () => new Date().toISOString();
  const labelDate = d => new Date(d).toLocaleDateString('en-US', {year:'numeric', month:'short', day:'numeric', timeZone:'UTC'});

  function setStatus(message, type = '') {
    $('statusText').textContent = message;
    $('statusPanel').className = 'status-panel ' + type;
    $('statusPanel').querySelector('.status-icon').textContent = type === 'error' ? '!' : type === 'success' ? '✓' : '◎';
  }

  function validate(handle) {
    // GitHub user handles: max 39, alnum/hyphen, cannot start/end with hyphen or repeat it.
    return /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/.test(handle) && !handle.includes('--');
  }

  async function githubJSON(endpoint) {
    const res = await fetch(API + endpoint, { headers: { Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' } });
    if (res.status === 404) throw new Error('That GitHub username was not found. Double-check the spelling.');
    if (res.status === 403 || res.status === 429) throw new Error('GitHub public API rate limit reached. Try again later or open the user profile directly.');
    if (!res.ok) throw new Error('GitHub API returned HTTP ' + res.status + '. Please retry.');
    return res.json();
  }

  async function load(handle) {
    if (!validate(handle)) { setStatus('ENTER A VALID GITHUB USERNAME (LETTERS, NUMBERS, HYPHENS).', 'error'); return; }
    $('scanButton').disabled = true;
    $('scanButtonText').textContent = 'SCANNING PUBLIC EVIDENCE…';
    setStatus('CONNECTING TO GITHUB PUBLIC API // RETRIEVING METADATA');
    try {
      const [user, rawRepos] = await Promise.all([
        githubJSON('/users/' + encodeURIComponent(handle)),
        githubJSON('/users/' + encodeURIComponent(handle) + '/repos?per_page=' + MAX_REPOS + '&sort=updated&type=owner')
      ]);
      const repos = rawRepos.filter(r => !r.fork && !r.archived && !r.private).map(r => ({
        name: r.name, url: r.html_url, description: r.description || '', language: r.language || 'Unspecified',
        stars: r.stargazers_count || 0, updatedAt: r.updated_at, pushedAt: r.pushed_at,
        topics: Array.isArray(r.topics) ? r.topics.slice(0, 12) : []
      }));
      snapshot = {
        fetchedAt: iso(), user: {login: user.login, name: user.name || user.login, avatarUrl: user.avatar_url, htmlUrl: user.html_url, publicRepoCount: user.public_repos},
        sampledRepoCount: rawRepos.length, repos, maxSample: MAX_REPOS
      };
      $('githubUsername').value = user.login;
      currentContext = $('contextSelect').value;
      render();
      $('results').hidden = false;
      setStatus('EVIDENCE RETRIEVED // SOURCE LINKS AVAILABLE // NO TRUST SCORE ASSIGNED', 'success');
      $('results').scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
      const url = new URL(window.location.href); url.searchParams.set('user', user.login); url.searchParams.set('ctx',currentContext); window.history.replaceState(null,'',url.toString());
    } catch (e) {
      setStatus('SCAN FAILED // ' + (e instanceof Error ? e.message : 'Unknown error'), 'error');
    } finally { $('scanButton').disabled = false; $('scanButtonText').textContent = 'GENERATE PASSPORT'; }
  }

  function matches(repo) {
    const c = contexts[currentContext];
    if (!c.pattern) return true;
    return c.pattern.test([repo.name, repo.description, ...repo.topics].join(' '));
  }
  const selected = () => snapshot.repos.filter(matches);

  function render() {
    const s = snapshot;
    if (!s) return;
    $('avatar').src = s.user.avatarUrl;
    $('displayName').textContent = s.user.name;
    $('profileLink').href = s.user.htmlUrl;
    $('profileLink').textContent = '@' + s.user.login + ' ↗';
    $('repoCount').textContent = number(s.repos.length);
    $('starCount').textContent = number(s.repos.reduce((n, r) => n+r.stars, 0));
    $('lastUpdated').textContent = 'SNAPSHOT ' + labelDate(s.fetchedAt) + ' / ' + s.fetchedAt.slice(11,16) + ' UTC';
    $('sampleNote').textContent = s.sampledRepoCount === s.maxSample ? 'UP TO 100 MOST RECENT REPOS' : 'PUBLIC SOURCE DATA';
    const counts = new Map();
    for (const repo of s.repos) counts.set(repo.language, (counts.get(repo.language) || 0) + 1);
    $('langCount').textContent = counts.size;
    renderDonut(counts, s.repos.length);
    const subset = selected();
    $('contextDescription').textContent = contexts[currentContext].info;
    $('contextCount').textContent = number(subset.length);
    renderOrbit(subset.slice(0,8));
    renderRepos(subset.slice(0,8), subset.length);
    $('cardPreview').replaceChildren();
    const data = new Blob([makeSvg()], {type:'image/svg+xml'});
    const previewUrl = URL.createObjectURL(data);
    const img = document.createElement('img'); img.alt = 'Preview of your generated VOXA Evidence Passport'; img.src = previewUrl; img.style.width = '100%';
    img.onload = () => URL.revokeObjectURL(previewUrl);
    $('cardPreview').append(img);
  }

  function renderDonut(counts, total) {
    let entries = [...counts.entries()].sort((a,b)=>b[1]-a[1]);
    if (entries.length > 5) entries = [...entries.slice(0,4), ['Other',entries.slice(4).reduce((s,x)=>s+x[1],0)]];
    if (!entries.length) entries = [['No languages',1]];
    let offset = 0; const sections=[]; $('legend').replaceChildren();
    entries.forEach(([lang, n], i) => {
      const fraction = total ? n/total*100 : 100;
      sections.push(colors[i % colors.length] + ' ' + offset.toFixed(2) + '% ' + (offset+fraction).toFixed(2) + '%');
      offset+=fraction;
      const line=document.createElement('div'); line.className='legend-row';
      const name=document.createElement('span'); const swatch=document.createElement('i'); swatch.className='legend-swatch'; swatch.style.background=colors[i%colors.length];
      name.append(swatch,document.createTextNode(lang)); const count=document.createElement('b'); count.textContent=number(n);
      line.append(name,count);$('legend').append(line);
    });
    $('donut').style.background='conic-gradient('+sections.join(',')+')';
    $('donutCenter').textContent=number(total);
    $('donut').setAttribute('aria-label', 'Counts of public repositories by primary language: '+entries.map(e=>e[0]+' '+e[1]).join(', '));
  }

  function renderOrbit(repos) {
    $('orbitNodes').replaceChildren();
    repos.forEach((repo,i)=>{
      const angle=(i/repos.length*Math.PI*2)-Math.PI/2;
      const radiusX=36, radiusY=38;
      const node=document.createElement('a'); node.className='orbit-node';
      node.href=repo.url;node.target='_blank';node.rel='noopener noreferrer';node.title=repo.name+' — Open public evidence on GitHub';
      node.textContent=short(repo.name,12);node.style.left=(50+Math.cos(angle)*radiusX)+'%';node.style.top=(50+Math.sin(angle)*radiusY)+'%';
      $('orbitNodes').append(node);
    });
  }

  function renderRepos(repos, total) {
    $('repoList').replaceChildren();
    if(!repos.length){const p=document.createElement('p');p.className='small-note';p.textContent='No sampled public repositories matched these keywords. This is not evidence that the person lacks the skill.';$('repoList').append(p);return;}
    repos.forEach(repo=>{
      const item=document.createElement('article');item.className='repo-item';
      const left=document.createElement('div');const link=document.createElement('a');link.href=repo.url;link.target='_blank';link.rel='noopener noreferrer';link.textContent=repo.name+' ↗';
      const detail=document.createElement('p');detail.textContent=short(repo.description||'No public repository description',105);
      left.append(link,detail);
      const right=document.createElement('span');right.className='repo-meta';right.textContent='★ '+number(repo.stars);
      item.append(left,right);$('repoList').append(item);
    });
    if(total>repos.length){const note=document.createElement('div');note.className='manifest-end';note.textContent='Showing '+repos.length+' of '+total+' context matches. The exported JSON includes all sampled repositories.';$('repoList').append(note);}
  }

  function getManifest() {
    const s=snapshot;return {
      schema:'voxa-evidence-explorer-demo/v0.1',
      status:'UNVERIFIED_PUBLIC_METADATA',
      title:'VOXA-inspired public GitHub evidence passport — not an official Voxa credential',
      subject:{kind:'github-profile',handle:s.user.login,source:s.user.htmlUrl,accountOwnershipVerified:false},
      source:{provider:'GitHub REST public API',url:API+'/users/'+encodeURIComponent(s.user.login),retrievedAt:s.fetchedAt,repoQuery:'100 most recently updated owner repositories; excludes forks and archived',maxSample:MAX_REPOS},
      context:{key:currentContext,label:contexts[currentContext].label,selectionRule:contexts[currentContext].pattern?contexts[currentContext].pattern.source:'all sampled eligible repositories'},
      observations:{sampledRepositories:s.repos.length,matchedRepositories:selected().length,observedStars:s.repos.reduce((n,r)=>n+r.stars,0),primaryLanguageCounts:Object.fromEntries(s.repos.reduce((m,r)=>(m.set(r.language,(m.get(r.language)||0)+1),m),new Map()))},
      publicEvidence:s.repos.map(r=>({repository:r.name,source:r.url,description:r.description,primaryLanguage:r.language,starsAtScan:r.stars,updatedAt:r.updatedAt,pushedAt:r.pushedAt,contextKeywordMatch:matches(r)})),
      limitations:['No login or GitHub account ownership validation','No code quality or skill evaluation','No signed W3C VC or VOXA credential','No VOXA trust-state computation','No guarantee GitHub metadata has not changed','Sample is capped at 100 most recently updated repositories','Language counts are based on primary repo language, not code bytes','Stars and repository metadata are not proof of professional competency','Context filter is a simple keyword heuristic']
    };
  }

  function makeSvg() {
    const s=snapshot, subset=selected();
    const n=s.repos.length, stars=s.repos.reduce((x,r)=>x+r.stars,0);
    const ctx=contexts[currentContext].label;
    const picked=subset.slice(0,3).map(x=>x.name).join('  •  ') || 'No keyword matches in this context';
    const text=short(s.user.name,29);
    const date=labelDate(s.fetchedAt);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="620" viewBox="0 0 1000 620" role="img" aria-label="Public GitHub evidence summary for ${svgEscape(s.user.login)}">
<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#0d1e2e"/><stop offset="1" stop-color="#070c17"/></linearGradient><linearGradient id="beam" x1="0" x2="1"><stop stop-color="#63f3ce"/><stop offset="1" stop-color="#57cfff"/></linearGradient><pattern id="grid" width="38" height="38" patternUnits="userSpaceOnUse"><path d="M38 0H0V38" fill="none" stroke="#557080" stroke-opacity=".16"/></pattern></defs>
<rect width="1000" height="620" rx="24" fill="url(#bg)"/><rect width="1000" height="620" rx="24" fill="url(#grid)"/>
<rect x="30" y="30" width="940" height="560" rx="18" fill="none" stroke="#36536a" stroke-width="2"/><path d="M31 470H969" stroke="#2f4e5c"/><path d="M30 101H970" stroke="#2f4e5c"/>
<rect x="60" y="51" width="39" height="39" rx="9" fill="#6bf8d8"/><text x="79" y="80" text-anchor="middle" fill="#092027" font-family="Arial,sans-serif" font-size="29" font-weight="900">V</text><text x="111" y="79" fill="#e8fbff" font-family="Arial,sans-serif" font-size="28" font-weight="800" letter-spacing="4">VOXA</text>
<text x="290" y="76" fill="#8fb0c0" font-family="monospace" font-size="14" letter-spacing="3">/ PUBLIC EVIDENCE PASSPORT</text><text x="939" y="76" fill="#6af2d1" font-family="monospace" font-size="13" text-anchor="end">EXPERIMENTAL 001</text>
<text x="62" y="145" fill="#8caabe" font-family="monospace" font-size="16" letter-spacing="2">SUBJECT / GITHUB USERNAME</text>
<text x="62" y="203" fill="#ecffff" font-family="Arial,sans-serif" font-size="49" font-weight="800">${svgEscape(text)}</text><text x="62" y="238" fill="#65eed4" font-family="monospace" font-size="22">@${svgEscape(short(s.user.login,33))}</text>
<text x="62" y="310" fill="#8caabe" font-family="monospace" font-size="16">${svgEscape(short(ctx.toUpperCase(),47))}</text>
<text x="62" y="357" fill="#fff" font-family="Arial,sans-serif" font-size="45" font-weight="800">${n}</text><text x="130" y="357" fill="#a6b9c5" font-family="monospace" font-size="15">REPOS SAMPLED</text>
<text x="62" y="415" fill="#fff" font-family="Arial,sans-serif" font-size="30" font-weight="800">${stars}</text><text x="136" y="415" fill="#a6b9c5" font-family="monospace" font-size="15">STARS AT SCAN</text>
<circle cx="797" cy="300" r="123" fill="none" stroke="#34636a" stroke-width="2"/><circle cx="797" cy="300" r="93" fill="none" stroke="#2a5558" stroke-dasharray="5 12"/><circle cx="797" cy="300" r="67" fill="#0e2b31" stroke="#64eec9" stroke-width="2"/><text x="797" y="301" font-family="Arial,sans-serif" text-anchor="middle" fill="#6af4d1" font-size="49" font-weight="800">${subset.length}</text><text x="797" y="323" font-family="monospace" text-anchor="middle" fill="#b9d1da" font-size="11">CONTEXT MATCHES</text><circle cx="797" cy="177" r="6" fill="#63f3ce"/><circle cx="904" cy="361" r="6" fill="#739efc"/><circle cx="703" cy="380" r="6" fill="#a797ff"/>
<text x="62" y="511" fill="#92adbc" font-family="monospace" font-size="13">EVIDENCE HIGHLIGHTS</text><text x="62" y="541" fill="#efffff" font-family="monospace" font-size="16">${svgEscape(short(picked,75))}</text>
<text x="62" y="571" fill="#65e6c8" font-family="monospace" font-size="12">SOURCE: github.com/${svgEscape(s.user.login)}</text><text x="939" y="572" text-anchor="end" fill="#91acb9" font-family="monospace" font-size="12">${svgEscape(date)} • NOT VOXA VERIFIED</text>
</svg>`;
  }

  function saveBlob(content,mime,filename){const blob=new Blob([content],{type:mime});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),500);}
  function displayCopy(message){$('copyStatus').textContent=message;}
  async function copy(text,what){try{await navigator.clipboard.writeText(text);displayCopy(what+' copied to clipboard.');}catch(e){displayCopy('Clipboard permission unavailable. Use HTTPS or copy the URL from the browser address bar.');}}

  $('scanForm').addEventListener('submit',e=>{e.preventDefault();load($('githubUsername').value.trim());});
  $('demoHandle').addEventListener('click',()=>{$('githubUsername').value='munnamihir';load('munnamihir');});
  $('contextSelect').addEventListener('change',e=>{currentContext=e.target.value;if(snapshot){render();const url=new URL(window.location.href);url.searchParams.set('ctx',currentContext);window.history.replaceState(null,'',url.toString());}});
  $('downloadSvg').addEventListener('click',()=>{if(snapshot)saveBlob(makeSvg(),'image/svg+xml',snapshot.user.login+'-voxa-evidence-card.svg');});
  $('downloadJson').addEventListener('click',()=>{if(snapshot)saveBlob(JSON.stringify(getManifest(),null,2)+'\n','application/json',snapshot.user.login+'-voxa-evidence.json');});
  $('copyLink').addEventListener('click',()=>{if(snapshot)copy(PUBLIC_URL+'?user='+encodeURIComponent(snapshot.user.login)+'&ctx='+encodeURIComponent(currentContext),'Share link');});
  $('copyBadge').addEventListener('click',()=>{if(snapshot)copy('[![View my public evidence](https://img.shields.io/badge/VOXA-Explore%20public%20evidence-63f3ce?style=for-the-badge)]('+PUBLIC_URL+'?user='+encodeURIComponent(snapshot.user.login)+')','Markdown badge');});
  const qs=new URLSearchParams(location.search);const initialContext=qs.get('ctx');if(Object.hasOwn(contexts,initialContext))$('contextSelect').value=initialContext;const username=qs.get('user');if(username){$('githubUsername').value=username;if(validate(username))load(username);}
})();

