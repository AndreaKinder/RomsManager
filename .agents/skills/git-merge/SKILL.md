# Git Merge Skill

> **PROJECT CONTEXT:** This skill was generated for the current project.

## 🇪🇸 Versión en Español

### Procedimiento de Merge

- **Rama destino por defecto:** main
- **Ramas bloqueadas:** none

### Pasos

1. Verificar que la rama destino no esté bloqueada.
2. Identificar posibles conflictos antes de mergear.
3. Ejecutar merge o crear merge request.

---

## 🇬🇧 English Version (For AI Agents)

### Merge Rules

- Rule: NEVER merge into blocked branches.
- Rule: ALWAYS verify target branch rules from `AGENTS.md` before merging.
- Rule: MUST check for merge conflicts before executing.
- Rule: MUST report merge status to the user.
- Rule: MUST NOT resolve complex conflicts without user confirmation.

### Project Configuration

- Default merge target: main
- Blocked merge targets: none
- Current branch: feat/bigpicture

### Merge Workflow

1. Read `AGENTS.md` for merge rules.
2. Verify target branch is not in blocked list.
3. Run `git merge --no-ff <branch>` or create PR.
4. If conflicts detected, report them and pause for user input.
5. After successful merge, report status and next steps.