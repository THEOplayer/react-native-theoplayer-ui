const fs = require('node:fs');
const path = require('node:path');

for (const workspace of require('../package.json').workspaces) {
    const changelogPath = path.join(__dirname, '..', workspace, 'CHANGELOG.md');
    if (!fs.existsSync(changelogPath)) continue;
    let changelog = fs.readFileSync(changelogPath, 'utf8');
    changelog = changelog
        .replace(/^### Major Changes/gm, '### 💥 Breaking Changes')
        .replace(/^### Minor Changes/gm, '### ✨ Features')
        .replace(/^### Patch Changes/gm, '### 🐛 Issues')
        // Remove empty sections
        .replace(/\n### ([^\n]+)\n\n###/g, '\n###');
    fs.writeFileSync(changelogPath, changelog);
}
