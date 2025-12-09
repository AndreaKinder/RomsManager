/**
 * Logger Service
 * Provides a centralized logging interface with different log levels
 */

const LogLevel = {
  ERROR: "ERROR",
  WARN: "WARN",
  INFO: "INFO",
  DEBUG: "DEBUG",
};

class Logger {
  constructor(enableDebug = false) {
    this.enableDebug = enableDebug;
  }

  _log(level, message, ...args) {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level}]`;

    switch (level) {
      case LogLevel.ERROR:
        console.error(prefix, message, ...args);
        break;
      case LogLevel.WARN:
        console.warn(prefix, message, ...args);
        break;
      case LogLevel.DEBUG:
        if (this.enableDebug) {
          console.log(prefix, message, ...args);
        }
        break;
      case LogLevel.INFO:
      default:
        console.log(prefix, message, ...args);
        break;
    }
  }

  error(message, ...args) {
    this._log(LogLevel.ERROR, message, ...args);
  }

  warn(message, ...args) {
    this._log(LogLevel.WARN, message, ...args);
  }

  info(message, ...args) {
    this._log(LogLevel.INFO, message, ...args);
  }

  debug(message, ...args) {
    this._log(LogLevel.DEBUG, message, ...args);
  }

  // Utility methods for common log patterns
  syncStart(location) {
    this.info(`Starting ROM sync from: ${location}`);
  }

  syncComplete() {
    this.info("✓ Sync completed!");
  }

  exportStart(location) {
    this.info(`Starting ROM export to: ${location}`);
  }

  exportComplete() {
    this.info("✓ Export completed!");
  }

  processingSystem(systemName) {
    this.info(`\nProcessing system: ${systemName}`);
  }

  lookingInDirectory(path) {
    this.info(`  Looking in: ${path}`);
  }

  directoryNotFound() {
    this.info("  Directory not found, skipping...");
  }

  noFilesFound() {
    this.info("  No files found");
  }

  skippingFile(fileName, reason = "non-ROM file") {
    this.info(`Skipping ${reason}: ${fileName}`);
  }

  syncingRom(romName, system) {
    this.info(`Syncing ROM: ${romName} -> System: ${system}`);
  }

  copiedTo(path) {
    this.info(`  Copied to: ${path}`);
  }

  systemsFound(systems) {
    this.info(`Systems found: ${systems.join(", ")}`);
  }
}

// Create singleton instance
const logger = new Logger(process.env.DEBUG === "true");

export default logger;
