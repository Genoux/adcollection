import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const VALID = {
  FRAMEIO_CLIENT_ID: "client-id",
  FRAMEIO_CLIENT_SECRET: "client-secret",
};

// Fresh instance per case so the import-time assertion below is meaningful.
const loadConfig = async () => {
  vi.resetModules();
  return import("./config");
};

beforeEach(() => {
  for (const key of [...Object.keys(VALID), "FRAMEIO_MAX_VIDEO_MB", "NEXT_PUBLIC_SITE_URL"]) {
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
  });

  it("rejects a Frame.io developer token pasted in place of the Adobe client secret", async () => {
    vi.stubEnv("FRAMEIO_CLIENT_ID", VALID.FRAMEIO_CLIENT_ID);
    vi.stubEnv("FRAMEIO_CLIENT_SECRET", "fio-u-abc123");

    const { frameioConfig } = await loadConfig();
    expect(() => frameioConfig()).toThrow(/Frame.io developer token, not the Adobe client secret/);
  });

  it("picks up credentials changed after the first read, as next dev does on env reload", async () => {
    for (const [key, value] of Object.entries(VALID)) vi.stubEnv(key, value);
    const { frameioConfig } = await loadConfig();
    expect(frameioConfig().FRAMEIO_CLIENT_SECRET).toBe("client-secret");

    vi.stubEnv("FRAMEIO_CLIENT_SECRET", "p8e-rotated");
    expect(frameioConfig().FRAMEIO_CLIENT_SECRET).toBe("p8e-rotated");
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

describe("redirectUri", () => {
  it("appends the callback path to the site url", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://adcollection.co");

    const { redirectUri } = await loadConfig();
    expect(redirectUri()).toBe("https://adcollection.co/api/frameio/callback");
  });

  it("does not double up the slash when the site url has a trailing one", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://adcollection.co/");

    const { redirectUri } = await loadConfig();
    expect(redirectUri()).toBe("https://adcollection.co/api/frameio/callback");
  });

  it("keeps the port, which the registered adobe redirect uri includes", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://local.adcollection.co:3000");

    const { redirectUri } = await loadConfig();
    expect(redirectUri()).toBe("https://local.adcollection.co:3000/api/frameio/callback");
  });

  // Adobe rejects the credential outright rather than failing at redirect time,
  // so this needs to surface as a configuration error rather than a 400 from IMS.
  it("rejects plain http, which adobe will not accept even on localhost", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "http://localhost:3000");

    const { redirectUri } = await loadConfig();
    expect(() => redirectUri()).toThrow(/https/);
  });

  it("fails clearly when the site url is missing entirely", async () => {
    const { redirectUri } = await loadConfig();
    expect(() => redirectUri()).toThrow(/https/);
  });
});
