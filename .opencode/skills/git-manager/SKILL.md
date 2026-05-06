# Git Manager Skill

> **PROJECT CONTEXT:** This skill was generated for the current project.

## 🇪🇸 Versión en Español

### Gestión de Git

- **Rama por defecto:** main
- **Ramas bloqueadas:** none
- **Comando pre-push:** jest

### Flujo de Trabajo

1. Verificar rama actual y estado del working directory.
2. Leer reglas del proyecto antes de cualquier operación.
3. Ejecutar verificación pre-push si está configurada.

---

## 🇬🇧 English Version (For AI Agents)

### Git Operation Rules

- Rule: ALWAYS read branch rules from `AGENTS.md` before operating.
- Rule: NEVER create commits unless explicitly instructed by the user.
- Rule: NEVER force-push to main/master branches.
- Rule: MUST run pre-push verification when configured.
- Rule: MUST document breaking changes explicitly.

### Project Configuration

- Default branch: main
- Blocked branches: none
- Pre-push test command: jest
- Current branch: feat/bigpicture

### Pre-Push Verification

If pushing and TEST_COMMAND is defined:
1. Run: `jest`
2. If exit code != 0: ABORT push and report errors.
3. If exit code == 0: Continue with push.

### Version Control

- Follow semantic versioning for APIs.
- Maintain CHANGELOG.md for version history.
- Coordinate with `@git-merge` for version tags.