import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import fs from "fs";
import path from "path";
import os from "os";

describe("database.js module initialization", () => {
  let tmpDir;

  beforeEach(() => {
    vi.resetModules();
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "oqm-db-test-"));
  });

  afterEach(() => {
    if (fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it("creates directory when DB_PATH directory does not exist (covers line 19)", async () => {
    const nonExistentDir = path.join(tmpDir, "sub-dir");
    const testDbPath = path.join(nonExistentDir, "test.sqlite");
    process.env.DB_PATH = testDbPath;

    expect(fs.existsSync(nonExistentDir)).toBe(false);

    const dbModule = await import("#src/database/database.js");
    expect(fs.existsSync(nonExistentDir)).toBe(true);
    expect(dbModule.default).toBeDefined();

    dbModule.default.close();
  });

  it("handles schema execution error gracefully (covers lines 33-34)", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const readFileSyncSpy = vi.spyOn(fs, "readFileSync").mockImplementation(() => {
      throw new Error("Simulated schema read error");
    });

    process.env.DB_PATH = ":memory:";
    const dbModule = await import("#src/database/database.js");

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("Failed to create database: Simulated schema read error")
    );

    readFileSyncSpy.mockRestore();
    consoleSpy.mockRestore();
    dbModule.default.close();
  });

  it("handles non-Error objects in catch (covers line 33 String(error))", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const readFileSyncSpy = vi.spyOn(fs, "readFileSync").mockImplementation(() => {
      throw "Custom string error";
    });

    process.env.DB_PATH = ":memory:";
    const dbModule = await import("#src/database/database.js");

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("Failed to create database: Custom string error")
    );

    readFileSyncSpy.mockRestore();
    consoleSpy.mockRestore();
    dbModule.default.close();
  });

  it("falls back to default DB_PATH when process.env.DB_PATH is not set (covers line 7 fallback)", async () => {
    delete process.env.DB_PATH;
    const dbModule = await import("#src/database/database.js");
    expect(dbModule.default).toBeDefined();
    dbModule.default.close();
  });
});
