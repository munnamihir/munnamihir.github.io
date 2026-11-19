# VOXA Quantum Crypto Escape Room

A four-room, **fictional**, interactive post-quantum migration game. Independent browser demo launched from [VOXA Signal Lab](../) and the [GitHub profile](https://github.com/munnamihir).

**Live URL:** https://munnamihir.github.io/voxa-studio/crypto-escape/

### Gameplay

- Inspect three artifacts in each room; pick one of four migration actions.
- Learn about quantum-vulnerable public-key dependencies, ML-KEM (FIPS 203), ML-DSA (FIPS 204), signatures versus provenance, and staged rollout.
- Correct choice: 25 points. Correct with clue: 20 points. Other choice: 0 points.
- Export a **game-only achievement SVG** and **fictional migration JSON report** after all four rooms.
- No login, analytics, tracking, real cryptographic keys, or API calls.

### Checks

From the GitHub Pages repository root:

```sh
node --test test/crypto-core.test.js
node --check voxa-studio/crypto-escape/core.js
node --check voxa-studio/crypto-escape/app.js
python3 -m http.server 8000  # then visit /voxa-studio/crypto-escape/
```

### Important caveat

This is an education-only simulator. Exported artifacts are not evidence of professional skill, VOXA verifiable credentials, certifications, security audits, production migration blueprints, or cryptographic guarantees.

### Further reading

- [NIST PQC project](https://csrc.nist.gov/projects/post-quantum-cryptography)
- [NIST NCCoE migration guidance](https://pages.nist.gov/nccoe-migration-post-quantum-cryptography/)
- [cryptoscan-pqc](https://github.com/munnamihir/cryptoscan-pqc)
