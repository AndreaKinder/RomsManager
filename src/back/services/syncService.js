import fs from "fs";
import path from "path";
import syncConfig from "../data/sync.json";

export function syncRoms(systemId, drivePath, roms) {
    const systemConfig = syncConfig.systems.find((s) => s.id === systemId);
    if (!systemConfig) {
        throw new Error(`System configuration not found for ID: ${systemId}`);
    }

    if (!fs.existsSync(drivePath)) {
        throw new Error(`Drive path does not exist: ${drivePath}`);
    }

    let copiedCount = 0;
    let errors = [];

    roms.forEach((rom) => {
        try {
            if (!rom.file_path || !fs.existsSync(rom.file_path)) {
                errors.push(`File not found: ${rom.file_name}`);
                return;
            }

            const consoleKey = rom.console;
            if (!consoleKey) {
                errors.push(`Console key not found for ROM: ${rom.file_name}`);
                return;
            }

            const targetDir = path.join(drivePath, "Roms", consoleKey);

            if (!fs.existsSync(targetDir)) {
                fs.mkdirSync(targetDir, { recursive: true });
            }

            const destPath = path.join(targetDir, rom.file_name);

            if (!fs.existsSync(destPath)) {
                fs.copyFileSync(rom.file_path, destPath);
                copiedCount++;
            } else {
                const srcStat = fs.statSync(rom.file_path);
                const destStat = fs.statSync(destPath);
                if (srcStat.size !== destStat.size) {
                    fs.copyFileSync(rom.file_path, destPath);
                    copiedCount++;
                }
            }

        } catch (err) {
            errors.push(`Failed to copy ${rom.file_name}: ${err.message}`);
        }
    });

    return {
        success: true,
        copied: copiedCount,
        errors: errors,
    };
}
