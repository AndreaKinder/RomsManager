# Agentes del Proyecto

## 🇪🇸 Índice de Agentes

Este proyecto utiliza el ecosistema **OpenCode** con agentes especializados para tareas específicas. Los agentes se dividen en dos categorías:

### Agentes Globales (Symlinked)

Ubicación: `.opencode/agents/` (symlinks a `~/.dotfiles/editors/opencode/agents/`)

| Agente | Archivo | Propósito | Cómo invocar |
|--------|---------|-----------|--------------|
| `@clean-js` | `.opencode/agents/clean-js.md` | Reglas de clean code y anti-hardcoding | Mencionar `@clean-js` |
| `@git-manager` | `.opencode/agents/git-manager.md` | Operaciones de Git (commits, branches, status) | Mencionar `@git-manager` |
| `@git-merge` | `.opencode/agents/git-merge.md` | Merge de ramas con validaciones | Mencionar `@git-merge` |
| `@project-setup` | `.opencode/agents/project-setup.md` | Setup y reconfiguración del proyecto | Mencionar `@project-setup` |

### Agentes Locales (Generados para este proyecto)

Ubicación: `.opencode/agents/`

| Agente | Archivo | Propósito | Cómo invocar |
|--------|---------|-----------|--------------|
| `@docs` | `.opencode/agents/docs.md` | Documentación y estándares del proyecto | Mencionar `@docs` |
| `@testing` | `.opencode/agents/testing.md` | Testing, QA, y cobertura | Mencionar `@testing` |
| `@debugger` | `.opencode/agents/debugger.md` | Diagnóstico de errores y debugging | Mencionar `@debugger` |
| `@architecture` | `.opencode/agents/architecture.md` | Decisiones de arquitectura y revisión | Mencionar `@architecture` |

## Cómo Funcionan

Cada agente es un archivo markdown con instrucciones mínimas que carga un **skill** local desde `.opencode/skills/`. Los skills contienen las reglas detalladas y el contexto específico del proyecto.

### Ejemplo de Flujo

1. El usuario menciona `@docs` en su mensaje.
2. El agente carga `.opencode/skills/docs/SKILL.md`.
3. El agente aplica las reglas de documentación del skill a la tarea actual.

### Skills Disponibles

| Skill | Ubicación | Descripción |
|-------|-----------|-------------|
| `docs` | `.opencode/skills/docs/SKILL.md` | Estándares de documentación (dual-language, JSDoc, README sync) |
| `testing` | `.opencode/skills/testing/SKILL.md` | Estándares de testing y QA |
| `debugger` | `.opencode/skills/debugger/SKILL.md` | Diagnóstico de errores |
| `architecture` | `.opencode/skills/architecture/SKILL.md` | Decisiones de arquitectura |
| `clean-js` | `.opencode/skills/clean-js/SKILL.md` | Clean code y anti-hardcoding |
| `git-manager` | `.opencode/skills/git-manager/SKILL.md` | Operaciones Git |
| `git-merge` | `.opencode/skills/git-merge/SKILL.md` | Merge de ramas |
| `frontend-design` | `.opencode/skills/frontend-design/SKILL.md` | Patrones de diseño frontend |

## Reglas del Orquestador Raíz

El archivo [`AGENTS.md`](../AGENTS.md) en la raíz del proyecto es el **orquestador raíz**. Define:

1. **Idioma de comunicación**: Español para humanos, inglés para agentes IA.
2. **Idioma del código**: TODAS las variables, funciones, y implementaciones técnicas en inglés.
3. **Regla de commits**: SOLO el agente `@git-manager` puede crear commits.
4. **Regla de protección**: Ningún directorio está protegido actualmente; el usuario los define on-the-fly.

## Convenciones Relacionadas

- **Commits**: Ver `docs/standard-commits.md` (Conventional Commits)
- **Código**: Ver `docs/conventions.md` (strings externalizados, CSS centralizado, funciones pequeñas)

---

## 🇬🇧 English Version (For AI Agents)

### Agent Ecosystem

ROM Manager uses the OpenCode agent ecosystem. Agents are markdown files with minimal instructions that load local skills from `.opencode/skills/`.

### Global Agents (Symlinked)

| Agent | File | Purpose | Invoke |
|-------|------|---------|--------|
| `@clean-js` | `.opencode/agents/clean-js.md` | Clean code & anti-hardcoding | Mention `@clean-js` |
| `@git-manager` | `.opencode/agents/git-manager.md` | Git operations | Mention `@git-manager` |
| `@git-merge` | `.opencode/agents/git-merge.md` | Branch merging | Mention `@git-merge` |
| `@project-setup` | `.opencode/agents/project-setup.md` | Project setup/reconfiguration | Mention `@project-setup` |

### Local Agents (Project-specific)

| Agent | File | Purpose | Invoke |
|-------|------|---------|--------|
| `@docs` | `.opencode/agents/docs.md` | Documentation standards | Mention `@docs` |
| `@testing` | `.opencode/agents/testing.md` | Testing & QA | Mention `@testing` |
| `@debugger` | `.opencode/agents/debugger.md` | Error diagnostics | Mention `@debugger` |
| `@architecture` | `.opencode/agents/architecture.md` | Architecture decisions | Mention `@architecture` |

### Rules from Root Orchestrator (`AGENTS.md`)

1. Communication language: **es** (Spanish)
2. Code language: **en** (English) for all variables, functions, implementations
3. Only `@git-manager` can create Git commits
4. No protected directories (user defines them on-the-fly)
5. Framework: React, CSS: nes.css, Test Runner: Jest

### Related Docs

- `docs/standard-commits.md` — Conventional Commits standard
- `docs/conventions.md` — Code conventions (externalized strings, centralized CSS, small functions)
