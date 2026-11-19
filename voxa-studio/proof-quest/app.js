/* VOXA Proof Quest | Accessible client-side game controller. No data is transmitted. */
(function () {
  'use strict';
  const engine = window.VOXAQuest;
  if (!engine) throw new Error('VOXA Proof Quest engine failed to load');
  const $ = id => document.getElementById(id);
  const today = new Date().toISOString().slice(0,10); // UTC daily rotation.
  const qs = new URLSearchParams(window.location.search);
  const initialMode = Object.prototype.hasOwnProperty.call(engine.MODES, qs.get('mode')) ? qs.get('mode') : 'classic';
  const dateParam = qs.get('date');
  const initialDate = engine.validDate(dateParam) && dateParam <= today ? dateParam : today;
  const state = {mode:initialMode,date:initialDate,cases:engine.getCases(initialMode,initialDate),index:0,score:0,results:[],opened:new Set(),selected:'',hintUsed:false,submitted:false,recorded:false};
  const current = () => state.cases[state.index];
  let total = state.cases.length;
  const historyKey = 'voxa-proof-quest-history-v2';
  function getHistory(){
    try{const records=JSON.parse(localStorage.getItem(historyKey)||'[]');return Array.isArray(records)?records.filter(x=>x&&typeof x.score==='number'&&typeof x.max==='number').slice(-30):[];}
    catch(_){return [];}
  }
  function saveRun(){
    if(state.recorded)return;state.recorded=true;
    const records=getHistory();
    records.push({mode:state.mode,date:state.date,score:state.score,max:total*25,completed:new Date().toISOString()});
    try{localStorage.setItem(historyKey,JSON.stringify(records.slice(-30)))}catch(_){}
  }
  function showModes(){
    document.querySelectorAll('[data-mode]').forEach(btn=>{const active=btn.dataset.mode===state.mode;btn.setAttribute('aria-pressed',String(active));btn.classList.toggle('is-active',active);});
    $('metricCases').textContent=String(total).padStart(2,'0');
    $('metricEvidence').textContent=String(total*3).padStart(2,'0');
    $('metricMax').textContent=String(total*25);
    $('scoreMax').textContent='/ '+(total*25);
    $('modeStatus').textContent=state.mode==='daily'
      ? 'DAILY DROP // '+state.date+' UTC // '+engine.challengeCode(state.date)+(state.date<today?' · ARCHIVED':'')
      : engine.MODES[state.mode].label.toUpperCase()+' // '+total+' CASES READY';
    const history=getHistory(),relevant=history.filter(x=>x.mode===state.mode&&(state.mode!=='daily'||x.date===state.date));
    const best=relevant.length?Math.max(...relevant.map(x=>Math.round(100*x.score/x.max))):null;
    $('localRecord').textContent='LOCAL RUNS: '+history.length+(best===null?' · NO BEST YET':' · MODE BEST: '+best+'%');
  }
  function resetProgress(){
    state.index=0;state.score=0;state.results=[];state.opened=new Set();state.selected='';state.hintUsed=false;state.submitted=false;state.recorded=false;
    $('aliasInput').value='';$('debriefList').replaceChildren();
  }
  function selectMode(mode){
    if(!Object.prototype.hasOwnProperty.call(engine.MODES,mode))return;
    if(state.results.length&&state.index<total&&!window.confirm('Switch mode and discard this unfinished investigation?'))return;
    state.mode=mode;state.date=today;state.cases=engine.getCases(mode,today);total=state.cases.length;resetProgress();
    const url=new URL(window.location.href);url.search='';url.searchParams.set('mode',mode);if(mode==='daily')url.searchParams.set('date',today);
    window.history.replaceState(null,'',url.href);
    renderCase();$('play').scrollIntoView({behavior:'auto',block:'start'});
  }


  function escapeHtml(value) {
    return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function missionLabels() {
    $('missionList').replaceChildren();
    state.cases.forEach((c, index) => {
      const li = document.createElement('li');
      li.className = index < state.index ? 'complete' : index === state.index ? 'current' : 'pending';
      li.innerHTML = `<span class="mission-number">${index < state.index ? '✓' : String(index + 1).padStart(2, '0')}</span><span><strong>${escapeHtml(c.title)}</strong><small>${escapeHtml(c.domain)}</small></span><span class="mission-state">${index < state.index ? 'DONE' : index === state.index ? 'LIVE' : 'LOCK'}</span>`;
      if (index === state.index) li.setAttribute('aria-current', 'step');
      $('missionList').append(li);
    });
    $('progressCode').textContent = `${String(Math.min(state.index + 1, total)).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;
    $('progressFill').style.width = `${100 * state.results.length / total}%`;
    $('scoreNumber').textContent = String(state.score).padStart(3, '0');
  }
  function verdictMarkup() {
    $('verdictOptions').innerHTML = engine.VERDICTS.map(v => `<label class="verdict-choice"><input type="radio" name="verdict" value="${v.id}" ${state.submitted ? 'disabled' : ''} ${state.selected === v.id ? 'checked' : ''} /><span><strong>${escapeHtml(v.label)}</strong><small>${escapeHtml(v.description)}</small></span><span class="select-circle" aria-hidden="true"></span></label>`).join('');
  }
  function renderEvidence() {
    $('evidenceGrid').innerHTML = current().evidence.map((item, index) => {
      const opened = state.opened.has(item.id);
      return `<article class="evidence-card ${opened ? 'is-open' : ''}"><button type="button" data-evidence="${item.id}" class="evidence-toggle" aria-expanded="${opened}" ${state.submitted ? 'disabled' : ''}><div class="evidence-top"><span>0${index + 1} / ${escapeHtml(item.tag)}</span><span>${opened ? '✓ INSPECTED' : '+ OPEN FILE'}</span></div><h4>${escapeHtml(item.title)}</h4><div class="evidence-source">${escapeHtml(item.source)}</div></button>${opened ? `<div class="evidence-detail"><p>${escapeHtml(item.detail)}</p><div class="evidence-cue">↳ ${escapeHtml(item.cue)}</div></div>` : ''}</article>`;
    }).join('');
    $('evidenceReadout').textContent = `${state.opened.size} / ${current().evidence.length} REVIEWED`;
    const unlocked = state.opened.size === current().evidence.length;
    $('submitButton').disabled = state.submitted || !unlocked || !state.selected;
    $('gateMessage').textContent = state.submitted ? 'Verdict submitted. Advance to the next case.' : !unlocked ? `Inspect ${current().evidence.length - state.opened.size} more artifact${current().evidence.length - state.opened.size === 1 ? '' : 's'} to unlock your verdict.` : !state.selected ? 'All artifacts inspected. Choose a verdict to continue.' : 'Evidence inspected. Your verdict is ready.';
  }
  function renderCase() {
    showModes();
    if (state.index >= total) { renderComplete(); return; }
    const c = current();
    $('gameScreen').hidden = false;
    $('completeScreen').hidden = true;
    $('caseCode').textContent = `CASE ${c.code}`;
    $('caseDomain').textContent = c.domain;
    $('caseDifficulty').textContent = c.difficulty;
    $('caseTitle').textContent = c.title;
    $('caseKicker').textContent = c.kicker;
    $('caseContext').textContent = c.context;
    $('caseClaim').textContent = c.claim;
    $('hintButton').disabled = state.hintUsed;
    $('hintButton').textContent = state.hintUsed ? '⌁ HINT USED · −5 POINTS' : '⌁ REQUEST HINT (−5 IF CORRECT)';
    $('hintText').hidden = !state.hintUsed;
    $('hintText').textContent = state.hintUsed ? `Analyst guidance: ${c.evidence[0].cue}` : '';
    $('feedback').hidden = true;
    verdictMarkup();
    renderEvidence();
    missionLabels();
  }
  function submitVerdict() {
    if (state.submitted || state.opened.size !== current().evidence.length || !state.selected) return;
    const c = current();
    const result = engine.evaluate(c.id, state.selected, state.hintUsed);
    state.results.push({ id: c.id, selected: state.selected, result });
    state.score += result.points;
    state.submitted = true;
    $('feedback').hidden = false;
    $('feedback').className = `feedback ${result.correct ? 'feedback-correct' : 'feedback-missed'}`;
    $('feedbackLabel').textContent = result.correct ? `VERDICT ALIGNED • +${result.points} POINTS` : 'REVIEW THE EVIDENCE • +0 POINTS';
    $('feedbackTitle').textContent = result.correct ? 'Well traced, investigator.' : `Better supported verdict: ${engine.VERDICTS.find(v => v.id === result.answer).label}`;
    $('feedbackReason').textContent = result.rationale;
    $('feedbackLesson').textContent = result.lesson;
    $('nextButton').textContent = state.results.length === total ? 'VIEW INVESTIGATION REPORT →' : 'NEXT CASE →';
    $('hintButton').disabled = true;
    verdictMarkup();
    renderEvidence();
    missionLabels();
    $('feedback').focus({ preventScroll: true });
    $('feedback').scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'nearest' });
  }
  function nextCase() {
    if (!state.submitted) return;
    state.index++;
    state.opened = new Set();
    state.selected = '';
    state.hintUsed = false;
    state.submitted = false;
    renderCase();
    $('play').scrollIntoView({ behavior: 'instant', block: 'start' });
  }
  function renderComplete() {
    $('gameScreen').hidden = true;
    $('completeScreen').hidden = false;
    $('progressCode').textContent = String(total).padStart(2,'0')+' / '+String(total).padStart(2,'0');
    $('progressFill').style.width = '100%';
    missionLabels();
    saveRun();
    const level = engine.rank(state.score,total*25);
    $('completeSummary').textContent = `You reviewed ${total * 3} fictional artifacts across ${total} cases. ${state.results.filter(x => x.result.correct).length} of ${total} verdicts aligned with the scenario evidence.`;
    $('finalScore').textContent = String(state.score).padStart(3, '0');
    $('finalMax').textContent=' / '+(total*25);
    $('rankLabel').textContent = `${level.code} // ${level.title.toUpperCase()}`;
    $('rankDescription').textContent = level.description;
    $('completionMode').textContent = state.mode==='daily'
       ? 'DAILY DROP / '+engine.challengeCode(state.date)+' · '+state.date+' UTC'
       : engine.MODES[state.mode].label.toUpperCase()+' / '+total+' CASES';
    $('debriefList').innerHTML=state.results.map(rec=>{
      const item=engine.ALL_CASES.find(c=>c.id===rec.id);
      const chosen=engine.VERDICTS.find(v=>v.id===rec.selected).label,expected=engine.VERDICTS.find(v=>v.id===rec.result.answer).label;
      return '<li><strong>'+escapeHtml(item.title)+'</strong><span>YOUR VERDICT: '+escapeHtml(chosen)+' · EVIDENCE-SUPPORTED: '+escapeHtml(expected)+'</span><p>'+escapeHtml(item.lesson)+'</p></li>';
    }).join('');
    showModes();
    $('copyStatus').textContent = '';
    $('completeScreen').focus({ preventScroll: true });
    $('completeScreen').scrollIntoView({ behavior: 'instant', block: 'start' });
  }
  function downloadBadge() {
    const svg = engine.badgeSvg($('aliasInput').value,state.score,total*25,engine.MODES[state.mode].label+(state.mode==='daily'?' '+state.date:''));
    const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `voxa-proof-quest-${state.mode}-${state.score}.svg`;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1200);
  }
  async function share() {
    const url = new URL('./',window.location.href);
    url.searchParams.set('mode',state.mode);
    if(state.mode==='daily')url.searchParams.set('date',state.date);
    const code=state.mode==='daily'?' / '+engine.challengeCode(state.date):'';
    const message='I completed VOXA Proof Quest'+code+' ('+state.score+'/'+(total*25)+'). Can you trace the same evidence? '+url.href+' · Self-reported game achievement, not verification.';
    try { await navigator.clipboard.writeText(message); $('copyStatus').textContent = 'Challenge link copied. Your score is self-reported, not verified.'; }
    catch (_) { $('copyStatus').textContent = 'Copy unavailable in this browser. Share this link: ' + url; }
  }
  function restart() {
    resetProgress();
    renderCase();
    $('play').scrollIntoView({ behavior: 'instant', block: 'start' });
  }
  document.querySelectorAll('[data-mode]').forEach(btn=>btn.addEventListener('click',()=>selectMode(btn.dataset.mode)));
  $('evidenceGrid').addEventListener('click', event => {
    const button = event.target.closest('[data-evidence]');
    if (!button || state.submitted) return;
    state.opened.add(button.dataset.evidence);
    renderEvidence();
  });
  $('verdictOptions').addEventListener('change', event => {
    if (event.target.name !== 'verdict' || state.submitted) return;
    state.selected = event.target.value;
    renderEvidence();
  });
  $('hintButton').addEventListener('click', () => {
    if (state.hintUsed || state.submitted) return;
    state.hintUsed = true;
    $('hintText').hidden = false;
    $('hintText').textContent = `Analyst guidance: ${current().evidence[0].cue}`;
    $('hintButton').disabled = true;
    $('hintButton').textContent = '⌁ HINT USED · −5 POINTS';
  });
  $('submitButton').addEventListener('click', submitVerdict);
  $('nextButton').addEventListener('click', nextCase);
  $('downloadBadge').addEventListener('click', downloadBadge);
  $('shareResult').addEventListener('click', share);
  $('restartButton').addEventListener('click', restart);
  renderCase();
})();