# VOXA Signal Lab — GitHub Pages mini experience

Self-contained static app at `voxa-studio/` that visitors can open from the GitHub profile README.

It uses only public GitHub API metadata and has **no backend, API keys, sign-up, cookies, analytics, or database**. It does **not** issue VOXA credentials, authenticate GitHub ownership, or create a trust score. GitHub public API rate limits apply.

## Publish

1. Open the existing public repository `munnamihir/munnamihir.github.io`.
2. Copy the **`voxa-studio/` folder** (index.html, styles.css, app.js) to its default branch, keeping the folder name.
3. In GitHub **Settings → Pages**, select **Deploy from a branch**, default branch `main` and folder `/(root)`, then save.
4. After Pages deploys, verify `https://munnamihir.github.io/voxa-studio/` loads and the GitHub username scan works.
5. Copy the `profile-repo/` directory contents into `munnamihir/munnamihir` to publish the updated profile README and banner. (Or publish your profile package separately.)

If Pages is already configured with a different source, do not overwrite it; merge this folder into its configured source instead. Links in the README remain dead until Pages is deployed.

## Local test

From the `pages-repo` folder, run `python3 -m http.server 8000`, then visit `http://localhost:8000/voxa-studio/`. The API works only with an internet connection and subject to GitHub's unauthenticated API limits.

## How the exploration works

- Enter a public GitHub username.
- The page requests `/users/{name}` and up to 100 most recently updated `/users/{name}/repos`, filtering out forked and archived repositories.
- Donut shows primary repository languages by *repository count*, not code-byte proportions.
- Context selector uses disclosed regex keyword matching of name, description, and topics.
- Orbit shows hyperlinks to repositories, **not** a trust graph.
- Export a standalone SVG summary or a JSON evidence manifest with provenance and limitations.
- Copy a share URL or Markdown badge linking to this app with the username prefilled.

**Important:** Sharing this card is not proof that the sharer controls the displayed GitHub handle. No VOXA trust score, signed vouch, credential, or professional endorsement is produced.

