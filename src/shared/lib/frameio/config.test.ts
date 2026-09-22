import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const VALID = {
  FRAMEIO_CLIENT_ID: "client-id",
  FRAMEIO_CLIENT_SECRET: "client-secret",
  FRAMEIO_ACCOUNT_ID: "ff30697e-c521-4702-8e3a-6dbc505e422a",
};

// The module memoises its parse, so each case needs a fresh instance.
const loadConfig = async () => {
  vi.resetModules();
  return import("./config");
};

beforeEach(() => {
  for (const key of [...Object.keys(VALID), "FRAMEIO_MAX_VIDEO_MB"]) {
    vi.stubEnv(key, undefined);
  }
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("frameioConfig", () => {
  it("does not throw at import time when Frame.io is unconfigured", async () => {
    await expect(loadConfig()).resolves.toBeDefined();
  });

  it("throws only once it is actually called", async () => {
    const { frameioConfig } = await loadConfig();
    expect(() => frameioConfig()).toThrow(/Frame.io is not configured/);
  });

  it("names every missing variable so the operator can fix them in one pass", async () => {
    const { frameioConfig } = await loadConfig();
    expect(() => frameioConfig()).toThrow(/FRAMEIO_CLIENT_ID/);
    expect(() => frameioConfig()).toThrow(/FRAMEIO_CLIENT_SECRET/);
    expect(() => frameioConfig()).toThrow(/FRAMEIO_ACCOUNT_ID/);
  });

  it("rejects an account id that is not a uuid", async () => {
    for (const [key, value] of Object.entries(VALID)) vi.stubEnv(key, value);
    vi.stubEnv("FRAMEIO_ACCOUNT_ID", "not-a-uuid");

    const { frameioConfig } = await loadConfig();
    expect(() => frameioConfig()).toThrow(/FRAMEIO_ACCOUNT_ID/);
  });

  it("defaults the video cap to 100MB when unset", async () => {
    for (const [key, value] of Object.entries(VALID)) vi.stubEnv(key, value);

    const { maxVideoBytes } = await loadConfig();
    expect(maxVideoBytes()).toBe(100 * 1024 * 1024);
  });

  it("honours an explicit video cap", async () => {
    for (const [key, value] of Object.entries(VALID)) vi.stubEnv(key, value);
    vi.stubEnv("FRAMEIO_MAX_VIDEO_MB", "250");

    const { maxVideoBytes } = await loadConfig();
    expect(maxVideoBytes()).toBe(250 * 1024 * 1024);
  });
});
