# Instrucciones para Generar Ejecutable de Windows

## Problema Conocido

Existe un problema con Electron Forge en Windows relacionado con permisos de archivos durante el build (`EPERM: operation not permitted`). Esto es un bug conocido de Electron Forge.

## Solución Alternativa

### Opción 1: Usar WSL (Recomendado)

Si tienes WSL instalado:

```bash
# Desde WSL
cd /mnt/c/Users/andre/Proyectos/RomsManager
npm run make
```

### Opción 2: Build Manual con electron-packager

1. **Instalar electron-packager globalmente:**
```bash
npm install -g electron-packager
```

2. **Limpiar directorios de build:**
```bash
rmdir /s /q .webpack
rmdir /s /q out
```

3. **Compilar con Webpack:**
```bash
npm run package
```

Si falla, ejecutar webpack manualmente:
```bash
npx webpack --config webpack.main.config.js --mode production
npx webpack --config webpack.renderer.config.js --mode production
```

4. **Empaquetar la aplicación:**
```bash
electron-packager . ROMManager --platform=win32 --arch=x64 --out=dist --overwrite --icon=path/to/icon.ico
```

### Opción 3: Reiniciar el PC

A veces el problema se debe a archivos bloqueados en memoria:

1. Cerrar TODAS las instancias de:
   - Electron
   - Node.js
   - VS Code (si está abierto en este proyecto)
   - Terminal/PowerShell

2. Reiniciar el PC

3. Ejecutar:
```bash
npm run make
```

### Opción 4: Usar PowerShell como Administrador

1. Abrir PowerShell como Administrador
2. Navegar al proyecto:
```powershell
cd C:\Users\andre\Proyectos\RomsManager
```

3. Limpiar y ejecutar:
```powershell
Remove-Item -Path .webpack -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path out -Recurse -Force -ErrorAction SilentlyContinue
npm run make
```

### Opción 5: Deshabilitar Antivirus Temporalmente

Algunos antivirus bloquean operaciones de renombrado durante el build:

1. Deshabilitar temporalmente Windows Defender o antivirus
2. Ejecutar `npm run make`
3. Reactivar antivirus

### Opción 6: Usar electron-builder en lugar de Electron Forge

1. **Instalar electron-builder:**
```bash
npm install --save-dev electron-builder
```

2. **Agregar script en package.json:**
```json
{
  "scripts": {
    "dist": "electron-builder"
  },
  "build": {
    "appId": "com.romsmanager.app",
    "productName": "ROM Manager",
    "win": {
      "target": "nsis"
    }
  }
}
```

3. **Ejecutar:**
```bash
npm run dist
```

## Ejecutable ya Generado

Si el build fue exitoso, el ejecutable se encuentra en:

```
out/romsmanager-win32-x64/romsmanager.exe
```

O en el caso de electron-builder:

```
dist/ROM Manager Setup.exe
```

## Ejecutar en Modo Desarrollo

Mientras tanto, puedes ejecutar la aplicación en modo desarrollo:

```bash
npm start
```

## Notas

- El problema de permisos es específico de Windows y Electron Forge
- Se ha reportado en: https://github.com/electron/forge/issues
- La alternativa más confiable es usar WSL o electron-builder
- El ejecutable resultante funcionará normalmente una vez generado

## Distribución

Para distribuir la aplicación a otros usuarios:

1. Compartir la carpeta completa `out/romsmanager-win32-x64/`
2. O crear un instalador con NSIS/Squirrel
3. O usar electron-builder que genera instaladores automáticamente
