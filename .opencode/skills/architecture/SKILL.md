# Architecture Skill

> **PROJECT CONTEXT:** This skill was generated for a React project.

## 🇪🇸 Versión en Español

### Principios Arquitectónicos

1. **Separación de responsabilidades:** Cada módulo debe tener una única responsabilidad.
2. **Dependencias explícitas:** Evitar dependencias circulares.
3. **Configuración centralizada:** Usar archivos de configuración para valores variables.

### Estructura Recomendada

La estructura de carpetas debe adaptarse al framework detectado.

---

## 🇬🇧 English Version (For AI Agents)

### Architectural Rules

- Rule: Each module MUST have a single, well-defined responsibility.
- Rule: Circular dependencies MUST be avoided.
- Rule: Configuration MUST be centralized (no hardcoded values).
- Rule: Public APIs MUST be documented and versioned.
- Constraint: NEVER assume specific paths without checking project structure.
- Constraint: MUST respect directories listed in No Touch Rule.

### Project Configuration

- Framework: React
- CSS Framework: nes.css
- Frontend: true

### Recommended Folder Structure

```
src/
├── assets/         # Static files
├── components/     # Reusable UI components
├── hooks/          # Custom React hooks
├── pages/          # Page components
├── store/          # State management (NO TOUCH if protected)
├── utils/          # Utility functions
└── services/       # API services
```

### No Touch Directories

(none defined yet - user will decide on the fly)

### CSS Architecture

- Rule: Use nes.css classes and components.
- Rule: Custom overrides MUST respect the retro design system.