# VOXA Proof Quest

A privacy-conscious, standalone, accessible four-case evidence investigation game for the VOXA Signal Lab. Fictional scenarios teach claim assessment, source provenance, temporal context, and the difference between technical verification and warranted trust.

- **Site:** https://munnamihir.github.io/voxa-studio/proof-quest/
- **Parent:** https://munnamihir.github.io/voxa-studio/
- **Dependencies:** None; pure HTML, CSS, and browser JavaScript.
- **Data:** No account, tracking, telemetry, or persistent storage. Badge SVGs are generated locally. Scores are not issued as credentials and are not independently verifiable.

## Local verification

```sh
node --test test/quest-core.test.js  # from repository root if test copied there
node --check voxa-studio/proof-quest/quest-core.js
node --check voxa-studio/proof-quest/app.js
python3 -m http.server 8765        # then visit /voxa-studio/proof-quest/
```

## Game rules

Open all three evidence cards, select whether the claim is **Supported**, **Not established**, or **Contradicted**. Correct answers earn 25 points, or 20 if a hint was used. First submission is final per case. Four investigations, 100 points possible.

All described identities, security advisories, build artifacts, and performance reports in the game are *fictional exercise data*, not actual real-world evidence. The downloadable badge is an amusement-only game achievement, never a verified professional trust credential.