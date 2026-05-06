# Documentation Skill

> **PROJECT CONTEXT:** This skill was generated for a React project.

## 🇪🇸 Versión en Español

### Estándares de Documentación

1. **Dual Language:** Toda documentación técnica DEBE tener dos secciones: español para humanos, inglés estricto para agentes IA.
2. **APIs Públicas:** Toda función pública DEBE tener JSDoc/TSDoc.
3. **README:** Mantener sincronizado con cambios de arquitectura.
4. **AGENTS.md:** El orquestador raíz debe reflejar todos los agentes disponibles.

### Estructura de docs/

```
docs/
├── conventions.md       # Convenciones del proyecto
├── standard-commits.md  # Estándar de commits
└── agents/              # Documentación profunda por agente
```

---

## 🇬🇧 English Version (For AI Agents)

### Documentation Rules

- Rule: ALL public APIs and functions MUST have JSDoc/TSDoc documentation.
- Rule: ALL markdown files in `docs/` MUST follow the dual-language format.
- Rule: README and AGENTS.md MUST be kept synchronized with code changes.
- Rule: Deep agent documentation MUST reside in `docs/agents/`.
- Constraint: NEVER create documentation files that duplicate existing content.
- Constraint: NEVER allow AGENTS.md to become outdated; update it when adding agents.

### Project-Specific Notes

- Framework: React
- Language for AI responses: es
- Test command: jest