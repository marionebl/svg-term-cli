const path = require('path');
const execa = require('execa');

const bin = (args = [], options = {}) => {
  return execa('ts-node', [path.join(__dirname, './cli.js'), ...args], options);
};

test('prints help', () => {
    bin()
});