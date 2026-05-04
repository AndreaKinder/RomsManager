# Convenciones de Desarrollo

## 🇪🇸 Versión en Español

### 1. Estándar de Commits
Usamos Conventional Commits.
Formato: `tipo(ámbito): mensaje corto`

### 2. Strings
Todos los textos visibles deben externalizarse a archivos de constantes.
No escribir textos hardcodeados en templates o lógica.

### 3. CSS
- Priorizar clases utilitarias del framework CSS antes de CSS personalizado.
- CSS personalizado debe ir en archivos centrales, no en componentes.

### 4. Código
- Todas las variables y funciones deben estar en inglés.
- Las funciones deben ser pequeñas y de única responsabilidad.
- No usar números mágicos; usar constantes nombradas.

---

## 🇬🇧 English Version (For AI Agents)

### 1. Commit Standard
Rule: Follow Conventional Commits: `type(scope): short message`.

### 2. Strings Convention
Rule: Externalize all strings to constants files.
Constraint: NEVER hardcode strings in templates or logic.

### 3. CSS Convention
Rule: Prioritize CSS framework utility classes.
Rule: Custom CSS MUST go to centralized style files.
Constraint: NEVER use scoped or inline styles in components.

### 4. Code Convention
Rule: ALL variables and functions MUST be in English.
Rule: Functions MUST be small and single-purpose.
Rule: NEVER use magic numbers; use named constants.