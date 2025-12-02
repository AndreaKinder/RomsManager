# Release Process

This document describes the process for creating new releases of ROM Manager.

## Version Naming Convention

ROM Manager follows [Semantic Versioning](https://semver.org/):

- **MAJOR.MINOR.PATCH**
  - MAJOR: Breaking changes
  - MINOR: New features (backwards compatible)
  - PATCH: Bug fixes (backwards compatible)

### Pre-release Suffixes

- **alpha**: Early development, unstable (0.x.x-alpha)
- **beta**: Feature complete, testing phase (0.x.x-beta, 1.x.x-beta)
- **rc**: Release candidate (1.x.x-rc.1, 1.x.x-rc.2)

## Release Checklist

### 1. Update Version Numbers

Update the version in these files:

- [ ] `package.json` - Update `version` field
- [ ] `VERSION` - Update version number
- [ ] `src/renderer/components/layout/AppFooter.jsx` - Update `APP_VERSION` constant

### 2. Update Documentation

- [ ] Update `CHANGELOG.md` with new changes
  - Move items from `[Unreleased]` to new version section
  - Add release date
  - List all features, fixes, and breaking changes
- [ ] Update `README.md` if needed

### 3. Commit Changes

```bash
git add .
git commit -m "chore: bump version to v0.1.0-alpha"
git push origin main
```

### 4. Create Git Tag

```bash
# Create annotated tag
git tag -a v0.1.0-alpha -m "Release v0.1.0-alpha"

# Push tag to GitHub
git push origin v0.1.0-alpha
```

### 5. GitHub Actions

Once you push the tag, GitHub Actions will automatically:
- Build the application for Windows, macOS, and Linux
- Create a GitHub Release
- Upload build artifacts
- Mark as pre-release if version contains alpha/beta/rc

### 6. Verify Release

- [ ] Check GitHub Actions workflow completed successfully
- [ ] Verify release was created on GitHub
- [ ] Download and test builds from each platform
- [ ] Update release notes if needed

## Manual Release (Alternative)

If you need to create a release manually:

### Windows

```bash
npm run make
```

Executables will be in `out/make/squirrel.windows/x64/`

### Linux

```bash
npm run make
```

Packages will be in `out/make/deb/x64/` and `out/make/rpm/x64/`

### macOS

```bash
npm run make
```

Application will be in `out/make/zip/darwin/x64/`

## Example Release Flow

### Alpha Release (0.1.0-alpha)

```bash
# Update versions
npm version 0.1.0-alpha --no-git-tag-version

# Update CHANGELOG.md
# Update AppFooter.jsx

# Commit
git add .
git commit -m "chore: bump version to v0.1.0-alpha"
git push origin main

# Tag and push
git tag -a v0.1.0-alpha -m "Release v0.1.0-alpha"
git push origin v0.1.0-alpha
```

### Beta Release (0.2.0-beta)

```bash
npm version 0.2.0-beta --no-git-tag-version
# Follow same steps as alpha
```

### Release Candidate (1.0.0-rc.1)

```bash
npm version 1.0.0-rc.1 --no-git-tag-version
# Follow same steps as alpha
```

### Stable Release (1.0.0)

```bash
npm version 1.0.0 --no-git-tag-version
# Follow same steps as alpha
```

## Hotfix Release

For urgent bug fixes on stable releases:

```bash
# Create hotfix branch
git checkout -b hotfix/1.0.1 v1.0.0

# Make fixes
# Update version to 1.0.1
# Update CHANGELOG.md

# Commit and tag
git commit -m "fix: critical bug"
git tag -a v1.0.1 -m "Hotfix v1.0.1"

# Merge back to main
git checkout main
git merge hotfix/1.0.1
git push origin main
git push origin v1.0.1
```

## Troubleshooting

### Build Fails on Windows

See `BUILD.md` for Windows-specific build issues and workarounds.

### Tag Already Exists

```bash
# Delete local tag
git tag -d v0.1.0-alpha

# Delete remote tag
git push origin :refs/tags/v0.1.0-alpha

# Create new tag
git tag -a v0.1.0-alpha -m "Release v0.1.0-alpha"
git push origin v0.1.0-alpha
```

### Release Not Created

Check GitHub Actions logs in the "Actions" tab of your repository.

## Resources

- [Semantic Versioning](https://semver.org/)
- [Keep a Changelog](https://keepachangelog.com/)
- [Electron Forge Documentation](https://www.electronforge.io/)
