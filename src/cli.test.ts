import * as path from 'path';
import * as execa from 'execa';

const pkg = require('../package');

const bin = async (args: string[] = [], options = {}) => {
  try {
    return await execa('ts-node', [path.join(__dirname, './cli.ts'), ...args], options);
  } catch (err) {
    return err;
  }
};

test('prints help with non-zero exit code', async () => {
  const result = await bin([], {input: ''});
  expect(result.code).not.toBe(0);
  expect(result.stdout).toContain('svg-term: either stdin or --cast are required');
});

test('prints help with zero exit code for --help', async () => {
  const result = await bin(['--help'], {input: ''});
  expect(result.code).toBe(0);
  expect(result.stdout).toContain('print this help');
});

test('prints version with zero exit code for --version', async () => {
  const result = await bin(['--version'], {input: ''});
  expect(result.code).toBe(0);
  expect(result.stdout).toBe(pkg.version);
});