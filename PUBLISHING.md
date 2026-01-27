# Publishing Guide for Zakat Calculations Package

This guide walks you through setting up and publishing the `zakat-calculations` package to NPM.

## Prerequisites

1. **NPM Account**: Create one at [npmjs.com](https://npmjs.com)
2. **GitHub Repository**: Your repo at https://github.com/ibrahim-lahribli/zakat-calculations
3. **Node.js**: Version 14 or higher installed locally
4. **Git**: Configured with your GitHub credentials

## Step 1: Setup Local Development

### 1.1 Clone and Install

```bash
git clone https://github.com/ibrahim-lahribli/zakat-calculations.git
cd zakat-calculations
npm install
```

### 1.2 Verify Everything Works

```bash
# Build the package
npm run build

# Run tests
npm test

# Check build output
ls dist/
```

## Step 2: Configure NPM Publishing

### 2.1 Login to NPM Locally

```bash
npm login
```

When prompted:
- **Username**: Your NPM username
- **Password**: Your NPM password
- **Email**: Your email address

Verify login:
```bash
npm whoami
```

### 2.2 Verify Package Name is Available

```bash
npm search zakat-calculations
```

Your package is published as `zakat-calculations` (no scoping needed).

## Step 3: Setup GitHub Secrets for Automated Publishing

### 3.1 Generate NPM Access Token

1. Go to https://npmjs.com/settings/tokens
2. Click "Generate New Token"
3. Select "Automation" type (for CI/CD)
4. Copy the token

### 3.2 Add Token to GitHub Secrets

1. Go to your GitHub repo: https://github.com/ibrahim-lahribli/zakat-calculations
2. Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. **Name**: `NPM_TOKEN`
5. **Value**: Paste your NPM token
6. Click "Add secret"

## Step 4: Publishing Methods

### Option A: Manual Publishing (For Testing)

```bash
# Ensure everything is clean and built
npm run build
npm test

# Bump the version
npm version patch   # 0.1.0 → 0.1.1 (bug fixes)
npm version minor   # 0.1.0 → 0.2.0 (new features)
npm version major   # 0.1.0 → 1.0.0 (breaking changes)

# This creates a git tag automatically

# Push changes and tag to GitHub
git push origin main --tags

# Publish to NPM
npm publish
```

### Option B: Automated Publishing with GitHub Actions (Recommended)

The repository includes `.github/workflows/publish.yml` which automatically publishes when you create a release.

**Steps:**

1. **Update version in package.json**:
```bash
npm version patch
```

2. **Push to GitHub**:
```bash
git push origin main --tags
```

3. **GitHub Actions will automatically**:
   - Build the package
   - Run all tests
   - Publish to NPM
   - (All done via the workflow!)

**Or create a release in GitHub UI:**

1. Go to https://github.com/ibrahim-lahribli/zakat-calculations/releases
2. Click "Create a new release"
3. Tag version: `v0.2.0`
4. Title: `Release v0.2.0`
5. Publish release
6. GitHub Actions runs automatically

## Step 5: Verify Publication

After publishing:

```bash
# Check NPM registry
npm view zakat-calculations

# Install in a test project
mkdir test-zakat
cd test-zakat
npm init -y
npm install zakat-calculations

# Test in Node
node -e "const pkg = require('zakat-calculations'); console.log(pkg)"
```

## Version Management

### Semantic Versioning

- **MAJOR** (X.0.0): Breaking changes to API
- **MINOR** (0.X.0): New features, backward compatible
- **PATCH** (0.0.X): Bug fixes, backward compatible

### Examples

```bash
# Bug fix: 0.1.0 → 0.1.1
npm version patch

# New feature: 0.1.1 → 0.2.0
npm version minor

# Breaking change: 0.2.0 → 1.0.0
npm version major
```

## Common Issues

### "npm ERR! 403 Forbidden"

**Cause**: Authentication issue or username mismatch

**Solution**:
```bash
npm logout
npm login
npm publish
```

### "npm ERR! 409 Conflict"

**Cause**: Version already published

**Solution**: Bump version and republish
```bash
npm version patch
npm publish
```

### "npm ERR! No repository field"

**Cause**: Missing repository in package.json

**Solution**: Already configured ✓
```json
"repository": {
  "type": "git",
  "url": "https://github.com/ibrahim-lahribli/zakat-calculations.git"
}
```

### "npm ERR! publishConfig in package.json"

**Note**: Our setup publishes to public NPM registry by default. If you want to restrict access later, add:
```json
"publishConfig": {
  "access": "restricted"
}
```

## Maintenance & Updates

### Creating Release Notes

When publishing, include changelog in GitHub releases:

```markdown
## v0.2.0 (2024-02-01)

### New Features
- Added solar year calculation support
- Improved livestock zakat tables

### Bug Fixes
- Fixed nisab threshold validation
- Corrected commerce category deduction

### Documentation
- Added API documentation
- Updated README with examples

### Breaking Changes
None in this release.
```

### Updating Dependents

After publishing, update your main apps to use the package:

```bash
# In your main app
npm install zakat-calculations

# Or update to latest
npm update zakat-calculations
```

## Best Practices

1. **Always test before publishing**
   ```bash
   npm run build && npm test
   ```

2. **Keep CHANGELOG.md updated**
   ```markdown
   # Changelog

   ## v0.2.0
   - New features
   - Bug fixes
   ```

3. **Use meaningful commit messages**
   ```
   fix: correct nisab calculation for cash category
   feat: add solar year support
   docs: update API documentation
   ```

4. **Tag releases in Git**
   ```bash
   git tag -a v0.2.0 -m "Release v0.2.0"
   ```

5. **Monitor package health**
   - View stats at https://npmjs.com/package/zakat-calculations
   - Check download trends
   - Review open issues

## Advanced: Private Scoped Package

If you want to publish under your username scope (e.g., `@ibrahim-lahribli/zakat-calculations`):

1. Rename in package.json:
```json
"name": "@ibrahim-lahribli/zakat-calculations"
```

2. Update publish config:
```json
"publishConfig": {
  "access": "public"
}
```

3. Publish with scope:
```bash
npm publish
```

Users install with:
```bash
npm install @ibrahim-lahribli/zakat-calculations
```

## Additional Resources

- [NPM Publishing Docs](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)
- [Semantic Versioning](https://semver.org/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [NPM Token Security](https://docs.npmjs.com/about-access-tokens)

---

**Questions?** Check the main [README.md](./README.md) or create an issue on GitHub.
