/* VOXA Quantum Crypto Escape | pure challenge and report logic. Fictional educational scenario. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.VOXACryptoEscape = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const ROOMS = Object.freeze([
    {
      id:'inventory', code:'01', stage:'DISCOVERY', title:'The Invisible Inventory', subtitle:'Find the true migration targets.',
      scene:'A fictional archival service has just generated a Cryptographic Bill of Materials. A migration meeting starts in six minutes. Which finding deserves the most urgent post-quantum plan?',
      objective:'Examine the scanner evidence and identify the quantum-vulnerable public-key dependencies.',
      evidence:[
        {tag:'CBOM / 01', title:'Transport handshake', body:'The client negotiates ECDHE over an elliptic-curve group for session key establishment. Captured session traffic may retain long-term sensitivity.'},
        {tag:'CBOM / 02', title:'At-rest encryption', body:'Stored documents use AES-256-GCM with unique nonces, authenticated metadata, and managed keys.'},
        {tag:'CBOM / 03', title:'Release signatures', body:'Application manifests are currently signed with RSA-2048, verified before the deploy stage.'}
      ],
      options:[
        {id:'a',name:'Rotate AES-256-GCM to AES-128-GCM',desc:'Reduce key size to simplify deployment.'},
        {id:'b',name:'Prioritize ECDHE and RSA public-key migration',desc:'Plan quantum-resistant key establishment and signatures.'},
        {id:'c',name:'Replace SHA-256 with a custom hash',desc:'A proprietary primitive avoids standards risk.'},
        {id:'d',name:'Disable all TLS immediately',desc:'Remove cryptography until the migration is done.'}
      ],
      answer:'b', hint:'Look for asymmetric algorithms: a large quantum computer threatens RSA and elliptic-curve cryptography, not AES-256-GCM in the same way.',
      rationale:'ECDHE and RSA are public-key mechanisms vulnerable to sufficiently capable quantum attacks. AES-256-GCM remains a sensible authenticated-encryption component when properly implemented. Discovery should precede replacement.',
      learned:'Inventory public-key dependencies and data lifetimes before deciding migration order.', fix:'Inventory ECDHE and RSA dependencies; assess exposure and retention requirements.',risk:24,progress:'DEPENDENCIES TRIAGED'
    },
    {
      id:'handshake',code:'02',stage:'KEY ESTABLISHMENT', title:'Harvest Now, Decrypt Later',subtitle:'Secure the key exchange without inventing a protocol.',
      scene:'A partner connects to the archive using a long-lived encrypted channel. An adversary can record ciphertext today. You need a migration path for establishing new shared secrets.',
      objective:'Choose a standards-oriented, interoperability-aware key-establishment plan.',
      evidence:[
        {tag:'WIRE / 01', title:'Current channel',body:'The TLS setup uses elliptic-curve Diffie–Hellman for key establishment and AES-256-GCM for record encryption.'},
        {tag:'STANDARD / 02',title:'Available primitive',body:'NIST FIPS 203 standardizes ML-KEM for post-quantum key encapsulation. Protocol integration requires a vetted, interoperable design.'},
        {tag:'OPERATIONS / 03',title:'Compatibility matrix',body:'Different clients and servers are on staggered upgrade schedules. Rollback, version negotiation, and test coverage are mandatory.'}
      ],
      options:[
        {id:'a',name:'Add ML-KEM through a vetted hybrid protocol where supported',desc:'Test interoperability, version negotiation, and staged rollout.'},
        {id:'b',name:'Increase ECDHE key size indefinitely',desc:'Assume more classical bits eliminate quantum risk.'},
        {id:'c',name:'Replace TLS with handwritten ML-KEM messages',desc:'No third-party protocol code to maintain.'},
        {id:'d',name:'Switch AES-256-GCM to plaintext transport',desc:'Rely only on authentication.'}
      ],
      answer:'a',hint:'A KEM is a primitive, not a complete transport protocol. Standards-based integration and controlled rollout matter.',
      rationale:'ML-KEM (FIPS 203) provides standardized post-quantum key encapsulation. Use vetted protocol implementations, with hybrid deployment where appropriate and supported; test both ends rather than hand-building a transport.',
      learned:'Post-quantum key establishment needs protocol integration, not just an algorithm name.',fix:'Plan vetted ML-KEM-capable key establishment and staged interoperability tests.',risk:26,progress:'CHANNEL PATH HARDENED'
    },
    {
      id:'signature',code:'03',stage:'PROVENANCE',title:'The Authentic Update',subtitle:'A signed artifact is not automatically trustworthy.',
      scene:'The build pipeline signs release manifests. A future-capable attacker could forge some classical signatures. Your task: establish a defensible signing migration.',
      objective:'Select a post-quantum signature approach that keeps provenance controls intact.',
      evidence:[
        {tag:'RELEASE / 01',title:'Signature gate',body:'Current deploy policy accepts only RSA-2048 signatures on release manifests, with a trusted-key directory.'},
        {tag:'STANDARD / 02',title:'Signing options',body:'NIST FIPS 204 standardizes ML-DSA. FIPS 205 standardizes SLH-DSA; both are post-quantum signature standards.'},
        {tag:'SUPPLY CHAIN / 03',title:'What signatures prove',body:'A valid signature attests that an authorized key signed the exact bits; it does not prove the build is free of malicious code.'}
      ],
      options:[
        {id:'a',name:'Keep RSA and add a stronger SHA-256 digest',desc:'Assume a stronger hash makes RSA quantum-safe.'},
        {id:'b',name:'Remove the signature gate',desc:'Checksums are sufficient to prove who signed.'},
        {id:'c',name:'Adopt a vetted ML-DSA signing path with rotation and audit',desc:'Verify provenance, trust anchors, and artifact policy.'},
        {id:'d',name:'Publish the private signing key',desc:'Make signature checking transparent.'}
      ],
      answer:'c',hint:'Choose a standardized signature primitive while preserving key management, issuer trust, and release controls.',
      rationale:'ML-DSA (FIPS 204) is a standardized post-quantum digital-signature algorithm. Keep verification, authorization, revocation/rotation and auditable provenance. A valid signature alone never guarantees software safety.',
      learned:'Cryptographic authenticity and operational trust are separate layers.',fix:'Design ML-DSA-aware signing, protected keys, verification and audit.',risk:27,progress:'PROVENANCE GATE REPAIRED'
    },
    {
      id:'rollout',code:'04',stage:'CUTOVER',title:'The Last Safe Deploy',subtitle:'Ship the migration without breaking the archive.',
      scene:'The crypto inventory and design are ready. Product asks you to flip every endpoint tonight. Some legacy clients are still in use. Which path minimizes avoidable failure?',
      objective:'Choose a migration strategy that is testable, observable and reversible.',
      evidence:[
        {tag:'SLO / 01',title:'Legacy compatibility',body:'A subset of users cannot yet negotiate the upgraded handshake. Their clients have a published upgrade window.'},
        {tag:'RISK / 02',title:'Long-lived records',body:'Archived records have multi-year confidentiality requirements. High-value long-lived information is prioritized for protection.'},
        {tag:'CHECKLIST / 03',title:'Release criteria',body:'Interoperability test plans, algorithm inventory, canary metrics, audit logs and an owner-approved rollback plan are available.'}
      ],
      options:[
        {id:'a',name:'Disable monitoring until the migration completes',desc:'Avoid noisy alerts during the cutover.'},
        {id:'b',name:'Upgrade everything without a compatibility test',desc:'Fastest path to a single algorithm.'},
        {id:'c',name:'Freeze all security patches until the quantum transition',desc:'Reduce change-related risk.'},
        {id:'d',name:'Canary, monitor, audit, then phase in by risk and support',desc:'Protect high-priority flows first; document exceptions.'}
      ],
      answer:'d',hint:'Look for observability, compatibility, exception management and reversible rollout steps.',
      rationale:'A phased migration addresses confidentiality risk while managing operational exposure. Validate interoperable implementations, prioritize sensitive long-lived data, log exceptions and monitor canaries. A simulator cannot certify a production deployment.',
      learned:'Crypto agility is an operational program, not a one-night algorithm swap.',fix:'Release a tested, monitored, phased migration with documented exceptions.',risk:23,progress:'MIGRATION PLAN UNLOCKED'
    }
  ]);
  const MAX=100;
  function getRoom(index){return ROOMS[index]??null;}
  function evaluate(index, optionId, hintUsed=false) {
    const room=getRoom(index);if(!room) throw new RangeError('Unknown room');
    if(!room.options.some(o=>o.id===optionId)) throw new RangeError('Unknown option');
    const correct=room.answer===optionId;
    return {correct,points:correct?(hintUsed?20:25):0,answer:room.answer,rationale:room.rationale,learned:room.learned,fix:room.fix};
  }
  function score(results){return results.reduce((sum,r)=>sum+(Number.isFinite(r.points)?r.points:0),0);}
  function rank(points){return points===100?{code:'OMEGA',title:'Crypto Architect',desc:'All four assessments aligned with the evidence, without hints.'}:points>=75?{code:'ALPHA',title:'Migration Strategist',desc:'Strong judgement across the simulated migration.'}:points>=50?{code:'BETA',title:'Signal Analyst',desc:'Good instincts; revisit the migration notes.'}:{code:'DELTA',title:'Crypto Explorer',desc:'You have a starting map. Replay to challenge your assumptions.'};}
  function progress(results){return Math.min(100,results.filter(r=>r.correct).reduce((sum,r)=>sum+getRoom(r.index).risk,0));}
  function safeAlias(v){return String(v??'').trim().slice(0,32).replace(/[^\p{L}\p{N} ._-]/gu,'') || 'Anonymous Investigator';}
  function xml(v){return String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;');}
  function badgeSvg(alias,points){const level=rank(points);const name=xml(safeAlias(alias));return `<svg xmlns="http://www.w3.org/2000/svg" width="980" height="570" viewBox="0 0 980 570" role="img" aria-label="VOXA educational game achievement card"><defs><linearGradient id="b" x1="0" x2="1" y2="1"><stop stop-color="#06141e"/><stop offset="1" stop-color="#131831"/></linearGradient><linearGradient id="g" x1="0" x2="1"><stop stop-color="#62f7d8"/><stop offset="1" stop-color="#9e85ff"/></linearGradient></defs><rect width="980" height="570" rx="30" fill="url(#b)"/><rect x="28" y="28" width="924" height="514" rx="20" fill="none" stroke="#37576a"/><g stroke="#2a4d60" opacity=".5">${Array.from({length:14},(_,i)=>`<path d="M${i*78} 28V542"/>`).join('')}</g><circle cx="765" cy="274" r="145" fill="none" stroke="#356775" stroke-width="2"/><circle cx="765" cy="274" r="104" fill="none" stroke="#65f7da" stroke-dasharray="7 13"/><circle cx="765" cy="274" r="67" fill="#0d3136" stroke="#65f7da"/><text x="765" y="286" text-anchor="middle" font-family="Arial" font-size="50" fill="#80ffea">V</text><text x="62" y="84" font-family="monospace" font-size="22" fill="#74f5df" letter-spacing="5">VOXA // CRYPTO ESCAPE</text><text x="62" y="157" font-family="Arial" font-weight="bold" font-size="45" fill="#f0ffff">${name}</text><text x="62" y="208" font-family="monospace" font-size="19" fill="#9db7c9">SIMULATED MIGRATION / GAME RESULT</text><text x="62" y="310" font-family="Arial" font-size="88" font-weight="bold" fill="url(#g)">${points}<tspan font-size="32" fill="#8aa8b8"> / ${MAX}</tspan></text><text x="62" y="366" font-family="monospace" font-size="22" fill="#ecfbff">${xml(level.code)} // ${xml(level.title.toUpperCase())}</text><path d="M62 430H919" stroke="#416276"/><text x="62" y="472" font-family="monospace" font-size="16" fill="#b4c6d5">4 FICTIONAL ROOMS • NOT A CERTIFICATION OR CREDENTIAL</text><text x="62" y="507" font-family="monospace" font-size="16" fill="#6eeaca">munnamihir.github.io/voxa-studio/crypto-escape/</text></svg>`;}
  function report(results,alias){return {kind:'VOXA_EDUCATIONAL_CRYPTO_MIGRATION_REPORT',version:1,fictional:true,disclaimer:'Simulated training output; not a certification, security audit, verified identity or production migration plan.',participant:safeAlias(alias),score:score(results),maxScore:MAX,rank:rank(score(results)).title,simulationRiskReduction:progress(results),items:ROOMS.map((room,index)=>{const r=results.find(r=>r.index===index);return {stage:room.stage,claim:room.objective,selected:r?room.options.find(o=>o.id===r.selected)?.name:null,correct:r?.correct??false,recommended:room.options.find(o=>o.id===room.answer).name,engineeringNote:room.rationale}}),references:[{label:'NIST PQC',url:'https://csrc.nist.gov/projects/post-quantum-cryptography'},{label:'NIST NCCoE Migration',url:'https://pages.nist.gov/nccoe-migration-post-quantum-cryptography/'}]};}
  return Object.freeze({ROOMS,MAX,getRoom,evaluate,score,rank,progress,safeAlias,xml,badgeSvg,report});
});