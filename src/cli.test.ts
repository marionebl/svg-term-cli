import * as execa from "execa";
import * as path from "path";

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
  expect(result.stdout).toContain(
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
