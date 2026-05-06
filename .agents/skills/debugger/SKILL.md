# Debugger Skill

> **PROJECT CONTEXT:** This skill was generated for a React project.

## 🇪🇸 Versión en Español

### Procedimiento de Diagnóstico

1. Recolectar mensajes de error y stack traces.
2. Identificar archivos relevantes en el contexto del error.
3. Revisar logs del framework si están disponibles.
4. Analizar estado y props (para frameworks de componentes).
5. Formular hipótesis y verificarlas con tests o logs.

---

## 🇬🇧 English Version (For AI Agents)

### Diagnostic Rules

- Rule: ALWAYS gather full error messages and stack traces before analysis.
- Rule: NEVER modify code during diagnosis; strictly read-only.
- Rule: ALWAYS check for recent changes in git history related to the error.
- Rule: Formulate hypotheses and verify them systematically.
- Constraint: MUST NOT create commits or branches during diagnosis.
- Constraint: MUST report findings in es.

### Project Context

- Framework: React
- Test command: jest
- Current branch: feat/bigpicture

### Framework-Specific Debugging

- Check React DevTools for component hierarchy and props.
- Review hooks dependencies and execution order.
- Check Redux/Zustand store state if applicable.

### Common Commands

- Run tests: `jest`
- Check git log: `git log --oneline -10`
- Check status: `git status`