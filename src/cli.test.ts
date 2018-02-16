import * as execa from "execa";
import * as path from "path";

const {DOMParser} = require('xmldom');

const parser = new DOMParser();
const pkg = require("../package");

const bin = async (args: string[] = [], options = {}) => {
  try {
    return await execa(
      "ts-node",
      [path.join(__dirname, "./cli.ts"), ...args],
      options
    );
  } catch (err) {
    return err;
  }
};

test("prints help with non-zero exit code", async () => {
  const result = await bin([], { input: "" });
  expect(result.code).not.toBe(0);
  expect(result.stderr).toContain(
    "svg-term: either stdin, --cast, --command or --in are required"
  );
});

test("prints help with zero exit code for --help", async () => {
  const result = await bin(["--help"], { input: "" });
  expect(result.code).toBe(0);
  expect(result.stdout).toContain("print this help");
});

test("prints version with zero exit code for --version", async () => {
  const result = await bin(["--version"], { input: "" });
  expect(result.code).toBe(0);
  expect(result.stdout).toBe(pkg.version);
});

test("works for minimal stdin input", async () => {
  const result = await bin([], {
    input: '[{"version": 2, "width": 1, "height": 1}, [1, "o", "foo"]]'
  });
  expect(result.code).toBe(0);
});

test("is silent on stderr for minimal stdin input", async () => {
  const result = await bin([], {
    input: '[{"version": 2, "width": 1, "height": 1}, [1, "o", "foo"]]'
  });
  expect(result.stderr).toBe("");
  expect(result.code).toBe(0);
});

test("emits svg for minimal stdin input", async () => {
  const result = await bin([], {
    input: '[{"version": 2, "width": 1, "height": 1}, [1, "o", "foo"]]'
  });

  const doc = parser.parseFromString(result.stdout, 'image/svg+xml');
  expect(doc.documentElement.tagName).toBe('svg');
});

test("fails for faulty stdin input", async () => {
  const result = await bin([], {
    input: '{}'
  });
  expect(result.code).toBe(1);
});

test("emits error on stderr for faulty stdin input", async () => {
  const result = await bin([], {
    input: '{}'
  });
  expect(result.stderr).toContain("only asciicast v1 and v2 formats can be opened");
});

test("is silent on stdout for faulty stdin input", async () => {
  const result = await bin([], {
    input: '{}'
  });
  expect(result.stdout).toBe("");
});