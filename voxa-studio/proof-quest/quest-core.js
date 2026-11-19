/* VOXA Proof Quest | Pure, dependency-free scenario and scoring engine. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.VOXAQuest = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const VERDICTS = Object.freeze([
    { id: 'supported', label: 'Supported', description: 'The evidence directly substantiates the specific claim.' },
    { id: 'insufficient', label: 'Not established', description: 'The evidence is incomplete or cannot justify the claim.' },
    { id: 'contradicted', label: 'Contradicted', description: 'The evidence conflicts with the claim.' }
  ]);
  const CASES = Object.freeze([
    {
      id: 'model', code: 'Q-01', domain: 'AI / EVALUATION', difficulty: 'SIGNAL 01',
      title: 'The 99% Mirage', kicker: 'An impressive benchmark. An enormous promise.',
      claim: '“Our detection model catches 99% of real production incidents.”',
      context: 'A vendor showcases a model performance slide. You are reviewing the wording before a production rollout.',
      evidence: [
        { id: 'a', tag: 'BENCHMARK', source: 'Experiment note · synthetic set', title: '99/100 simulated incidents detected', detail: 'A test report shows 99 successes out of 100 synthetic examples generated using the training simulator. No real incident sample is described.', cue: 'Same-generator evaluation can overestimate real-world performance.' },
        { id: 'b', tag: 'DATA LINEAGE', source: 'Dataset manifest · v0.4', title: 'Production incidents not included', detail: 'The manifest lists simulated log streams only. It provides no evidence about deployment distributions or incident prevalence.', cue: 'A missing production dataset limits generalization.' },
        { id: 'c', tag: 'OPERATIONS', source: 'Rollout plan · draft', title: 'No live precision or recall report', detail: 'The production evaluation is scheduled for next quarter, with alerts and false positives not yet recorded.', cue: 'A plan for measurement is not a measurement.' }
      ],
      answer: 'insufficient',
      rationale: '99/100 synthetic detections support a result on that synthetic set, not a 99% production detection claim. The evaluation population, label process, precision, and deployment evidence are missing.',
      lesson: 'A performance number without population and methodology is a statement, not transferable evidence.'
    },
    {
      id: 'release', code: 'Q-02', domain: 'SOFTWARE / PROVENANCE', difficulty: 'SIGNAL 02',
      title: 'Artifact Zero', kicker: 'A release you can independently trace.',
      claim: '“The downloaded package matches the artifact built from our signed v2.1 tag.”',
      context: 'A public release includes a signed tag, a build attestation, and a published archive. Decide only this narrow provenance claim.',
      evidence: [
        { id: 'a', tag: 'SOURCE', source: 'Tag verification · v2.1', title: 'Signature checked against a pinned public key', detail: 'The signed Git tag points to commit C. Verification succeeds using the maintainer key recorded in the release policy.', cue: 'Signature verification anchors the tag to a known key.' },
        { id: 'b', tag: 'BUILD', source: 'Build attestation · job 284', title: 'Attestation connects commit C to digest D', detail: 'The build record identifies the source commit, builder identity, and SHA-256 digest D of the generated archive. The provenance record is authenticated.', cue: 'A source-to-artifact link is explicitly documented.' },
        { id: 'c', tag: 'ARTIFACT', source: 'Independent download · hash check', title: 'Downloaded archive computes to digest D', detail: 'A separate SHA-256 calculation on the downloaded archive returns the same digest as the attestation.', cue: 'The downloaded bytes match the attested artifact.' }
      ],
      answer: 'supported',
      rationale: 'The signed source tag, authenticated build provenance, and independent digest comparison directly support this narrowly scoped source-to-artifact claim. They do not prove the package is free from vulnerabilities.',
      lesson: 'Verification always has a scope: provenance is not the same as safety or quality.'
    },
    {
      id: 'dependency', code: 'Q-03', domain: 'SECURITY / DEPENDENCIES', difficulty: 'SIGNAL 03',
      title: 'The Green Build', kicker: 'A passing badge that remembers yesterday.',
      claim: '“Our current release contains no known vulnerable dependencies.”',
      context: 'The README displays a green security badge. You trace the release inputs rather than trust the color.',
      evidence: [
        { id: 'a', tag: 'SCAN', source: 'CI report · Monday 09:00', title: 'Dependency scan: zero findings', detail: 'The security scan passed on commit A. The current release is built from commit B, created after the scan.', cue: 'Timestamp and commit identity change the meaning of a badge.' },
        { id: 'b', tag: 'LOCKFILE', source: 'Release commit B · dependency diff', title: 'New package pinned to version 4.2.0', detail: 'Commit B adds a dependency to the release lockfile. The scanner did not run on commit B.', cue: 'A change after the scan creates an untested release state.' },
        { id: 'c', tag: 'ADVISORY', source: 'Advisory record · scenario snapshot', title: 'Version 4.2.0 is listed as affected', detail: 'The scenario advisory specifically identifies version 4.2.0 as vulnerable. This is fictional exercise data, not a real package advisory.', cue: 'The release dependency matches an affected version.' }
      ],
      answer: 'contradicted',
      rationale: 'In this fictional case, the current release adds an explicitly affected dependency after the passing scan. The claim of no known vulnerable dependencies conflicts with the release lockfile and advisory.',
      lesson: 'Freshness, target revision, and supply-chain scope matter more than a green badge.'
    },
    {
      id: 'vouches', code: 'Q-04', domain: 'VOXA / CONTEXTUAL TRUST', difficulty: 'SIGNAL 04',
      title: 'The Trust Loop', kicker: 'Four strong endorsements. Zero independent context.',
      claim: '“Four mutual endorsements independently establish this developer’s security expertise.”',
      context: 'An evaluation panel sees a tightly connected group of professional vouches and asks whether they constitute independent corroboration.',
      evidence: [
        { id: 'a', tag: 'GRAPH', source: 'Endorsement network · local sample', title: 'Every endorser endorses each other', detail: 'The four endorsers form a reciprocal cluster. The relationships are visible, but the reasons for each endorsement are not.', cue: 'Reciprocity is context, not automatic proof of collusion.' },
        { id: 'b', tag: 'PROVENANCE', source: 'Endorsement records · excerpt', title: 'No linked projects or observed work', detail: 'Statements describe security expertise but provide no work samples, joint projects, review logs, or independently checkable outcomes.', cue: 'Assertions without inspectable sources have limited evidentiary weight.' },
        { id: 'c', tag: 'TIMELINE', source: 'Recorded events · same day', title: 'All four endorsements were issued together', detail: 'The records share a day and network cluster. The data cannot establish whether the relationships are legitimate or manipulated.', cue: 'Timing suggests a question, not a verdict about intent.' }
      ],
      answer: 'insufficient',
      rationale: 'Reciprocal endorsements may be genuine, but without independent work evidence or issuer context, they cannot by themselves establish independently corroborated expertise. The available data does not prove collusion either.',
      lesson: 'Evidence → policy and context → trust state. A universal trust score is not a substitute.'
    }
  ]);

  // Additional fictional case files for the Daily Drop and Expert Protocol.
  const ADVANCED_CASES = Object.freeze([
    {
      id:'authorization',code:'X-05',domain:'API / AUTHORIZATION',difficulty:'EXPERT / ACCESS',
      title:'The 200 OK Trap',kicker:'A valid login is not a resource permission.',
      claim:'“Our JWT validation guarantees that no customer can access another customer’s invoices.”',
      context:'Inspect a fictional multi-tenant API before a security review.',
      evidence:[
        {id:'a',tag:'IDENTITY',source:'Middleware trace',title:'JWT signature and expiry pass',detail:'A token belonging to tenant A is correctly authenticated. The middleware never checks the requested invoice tenant.',cue:'Identity checks do not enforce resource ownership.'},
        {id:'b',tag:'QUERY',source:'Endpoint handler',title:'Invoice lookup uses only its ID',detail:'The database query filters on invoice number but does not include the token’s tenant identifier.',cue:'Tenant scoping is missing from the resource query.'},
        {id:'c',tag:'TEST',source:'Cross-tenant test',title:'A reads B’s invoice',detail:'A synthetic test returns 200 and the body of tenant B’s invoice using tenant A’s valid JWT.',cue:'The observed access directly conflicts with the claimed isolation.'}
      ],answer:'contradicted',
      rationale:'A valid JWT proves authentication, but a missing tenant predicate and a successful cross-tenant test demonstrate an authorization failure.',
      lesson:'Authorize each requested resource, not merely the session.'
    },
    {
      id:'replication',code:'X-06',domain:'AI / REPRODUCIBILITY',difficulty:'EXPERT / REPLAY',
      title:'The Reproducible Run',kicker:'An impressive chart without an independent run.',
      claim:'“Outside researchers have reproduced our 3× inference speedup.”',
      context:'Review a fictional performance study before repeating its headline.',
      evidence:[
        {id:'a',tag:'BENCHMARK',source:'Internal report',title:'Speedup measured on one in-house GPU',detail:'The research group reports a 3× result from its own benchmark. Workload and baseline are documented.',cue:'Internal results do not establish external replication.'},
        {id:'b',tag:'CODE',source:'Open-source release',title:'External team downloaded scripts',detail:'An outside lab has confirmed it can download the code but has not published results.',cue:'Access to the code is not execution of the code.'},
        {id:'c',tag:'SCHEDULE',source:'Research tracker',title:'Independent run planned for next month',detail:'The outside evaluation is scheduled, but no external hardware configuration, logs, or measurements exist yet.',cue:'A future test is not evidence of a past result.'}
      ],answer:'insufficient',
      rationale:'The available records support only an internal measurement and a planned outside evaluation. Independent reproduction has not been shown.',
      lesson:'Distinguish reproducible methods, internal results, and independently reproduced results.'
    },
    {
      id:'signed-report',code:'X-07',domain:'CRYPTO / ASSURANCE',difficulty:'EXPERT / SIGNATURE',
      title:'The Signed Falsehood',kicker:'Authenticity is not factual accuracy.',
      claim:'“The valid signature proves this incident report’s timeline is correct.”',
      context:'Examine a fictional signed incident report and independent logs.',
      evidence:[
        {id:'a',tag:'PROOF',source:'Signature verification',title:'The report signature is valid',detail:'The report bytes verify with a recognized organizational key, showing integrity since signing.',cue:'Signatures provide attribution and integrity under key-trust assumptions.'},
        {id:'b',tag:'LOGS',source:'Independent telemetry',title:'Sensor timestamp disagrees',detail:'System logs record the event at 10:03 while the signed report asserts 10:20.',cue:'An authenticated statement may still be mistaken.'},
        {id:'c',tag:'REVISION',source:'Author correction',title:'Signer confirms a transcription error',detail:'The report author acknowledges the incorrect timestamp and requests a corrected release.',cue:'Source authenticity does not override conflicting facts.'}
      ],answer:'contradicted',
      rationale:'The signature binds an author to unchanged bytes; it does not make every assertion true. Independent logs and the author’s correction contradict the timeline.',
      lesson:'Treat provenance, factual verification, and contextual reliance as distinct questions.'
    },
    {
      id:'canary',code:'X-08',domain:'RELIABILITY / RELEASE',difficulty:'EXPERT / CONTROL',
      title:'The Canary Gate',kicker:'A narrow safety control that is demonstrable.',
      claim:'“Our rollout controller can pause the canary when its error rate crosses the agreed threshold.”',
      context:'Verify this specific rollout-control claim, not whether the whole release is safe.',
      evidence:[
        {id:'a',tag:'POLICY',source:'Release policy',title:'The gate has a measured threshold',detail:'The approved canary policy specifies a 2% error-rate threshold over five minutes and a hold action.',cue:'A threshold makes the behavior falsifiable.'},
        {id:'b',tag:'SIGNAL',source:'Integration test',title:'Metrics feed the controller',detail:'A controlled test causes the error rate to exceed 2%, and the controller records the threshold crossing.',cue:'The measurement reaches the decision mechanism.'},
        {id:'c',tag:'ACTION',source:'Deployment record',title:'Future stages are paused',detail:'The controlled test shows the controller blocking further canary rollout and notifying an operator.',cue:'Observed enforcement supports the narrow capability.'}
      ],answer:'supported',
      rationale:'The policy, metrics integration, and a demonstrated hold support the particular pause capability. They do not guarantee zero production defects.',
      lesson:'Make narrowly scoped operational claims tied to observable controls.'
    }
  ]);
  const ALL_CASES=Object.freeze([...CASES,...ADVANCED_CASES]);
  const MODES=Object.freeze({classic:{label:'Core Protocol'},daily:{label:'Daily Drop'},expert:{label:'Expert Protocol'}});
  function validDate(date) {
    if(typeof date!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
    const t=Date.parse(date+'T00:00:00Z');
    return Number.isFinite(t)&&new Date(t).toISOString().slice(0,10)===date;
  }
  function hash(t){let h=2166136261;for(let i=0;i<t.length;i++){h=Math.imul(h^t.charCodeAt(i),16777619)}return h>>>0;}
  function getCases(mode='classic',date='2026-11-19'){
    if(!Object.prototype.hasOwnProperty.call(MODES,mode)) throw new Error('Unknown challenge mode');
    if(mode==='classic')return CASES.slice();
    if(mode==='expert')return [CASES[1],ADVANCED_CASES[0],ADVANCED_CASES[1],CASES[3],ADVANCED_CASES[2],ADVANCED_CASES[3]];
    if(!validDate(date))throw new Error('Invalid challenge date');
    const pool=ALL_CASES.slice();let seed=hash('VOXA-DAILY-V1:'+date);
    for(let i=pool.length-1;i>0;i--){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;const j=(seed>>>0)%(i+1);[pool[i],pool[j]]=[pool[j],pool[i]];}
    return pool.slice(0,3);
  }
  function challengeCode(date){if(!validDate(date))throw new Error('Invalid date');return 'VX-'+date.replaceAll('-','')+'-'+hash('VOXA-DAILY-V1:'+date).toString(16).padStart(8,'0').slice(0,6).toUpperCase();}

  const MAX_POINTS = CASES.length * 25;
  function evaluate(caseId, verdictId, hintUsed) {
    const item = ALL_CASES.find(c => c.id === caseId);
    if (!item) throw new Error('Unknown case');
    if (!VERDICTS.some(v => v.id === verdictId)) throw new Error('Invalid verdict');
    const correct = item.answer === verdictId;
    return { correct, points: correct ? (hintUsed ? 20 : 25) : 0, answer: item.answer, rationale: item.rationale, lesson: item.lesson };
  }
  function rank(score, maxPoints = MAX_POINTS) {
    if (!Number.isFinite(score) || score < 0 || score > maxPoints || !Number.isFinite(maxPoints) || maxPoints <= 0) throw new Error('Invalid score');
    const percent = score / maxPoints * 100;
    if (percent >= 90) return { title: 'Signal Architect', code: 'SNR-01', description: 'Exceptional distinction between claims, contexts, and proof.' };
    if (percent >= 65) return { title: 'Trace Operator', code: 'SNR-02', description: 'Strong evidence instincts, with room to sharpen the edge cases.' };
    return { title: 'Evidence Cadet', code: 'SNR-03', description: 'You started looking under the hood. Keep tracing the source.' };
  }
  function cleanAlias(value) {
    return String(value || 'Anonymous Investigator').replace(/[<>"'&\\\n\r\t]/g, '').replace(/\s+/g, ' ').trim().slice(0, 32) || 'Anonymous Investigator';
  }
  function escapeXml(value) {
    return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
  }
  function badgeSvg(alias, score, maxPoints = MAX_POINTS, modeName = 'Core Protocol') {
    const person = escapeXml(cleanAlias(alias));
    const level = rank(score, maxPoints);
    const safeMode = escapeXml(String(modeName).slice(0, 50).toUpperCase());
    const safeScore = Math.round(score);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="540" viewBox="0 0 960 540" role="img" aria-label="VOXA Proof Quest game achievement">
<defs><linearGradient id="back" x2="1" y2="1"><stop stop-color="#081525"/><stop offset="1" stop-color="#15112e"/></linearGradient><linearGradient id="accent"><stop stop-color="#71f4d9"/><stop offset="1" stop-color="#a48dff"/></linearGradient></defs>
<rect width="960" height="540" rx="26" fill="url(#back)"/><g opacity=".18" stroke="#6ae8d4">${Array.from({length:20},(_,i)=>`<path d="M ${i*52} 0 V 540"/>`).join('')}${Array.from({length:12},(_,i)=>`<path d="M 0 ${i*52} H 960"/>`).join('')}</g>
<rect x="28" y="28" width="904" height="484" rx="16" fill="none" stroke="#4f9d9f" stroke-width="2"/><text x="74" y="100" fill="#70ecd7" font-family="monospace" font-size="26" letter-spacing="3">VOXA // PROOF QUEST</text><text x="74" y="161" fill="#93adbd" font-family="monospace" font-size="19">${safeMode} • SCENARIO INVESTIGATION</text><text x="74" y="240" fill="white" font-family="system-ui,sans-serif" font-weight="700" font-size="47">${person}</text><text x="74" y="302" fill="url(#accent)" font-family="system-ui,sans-serif" font-size="30" font-weight="700">${escapeXml(level.title)}</text><text x="74" y="386" fill="white" font-family="monospace" font-size="68" font-weight="800">${safeScore}<tspan font-size="27" fill="#91aebf"> / ${Math.round(maxPoints)}</tspan></text><text x="74" y="454" fill="#9db5ca" font-family="monospace" font-size="17">FICTIONAL CASES • GAME RESULT • NOT IDENTITY OR SKILL VERIFICATION</text><circle cx="805" cy="269" r="80" fill="none" stroke="#70ead7" stroke-width="3"/><circle cx="805" cy="269" r="58" fill="#153945"/><path d="M773 267 L797 292 L840 241" fill="none" stroke="#81f6df" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  }
  return Object.freeze({ VERDICTS, CASES, ADVANCED_CASES, ALL_CASES, MODES, MAX_POINTS, validDate, getCases, challengeCode, evaluate, rank, cleanAlias, escapeXml, badgeSvg });
});