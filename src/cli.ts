#!/usr/bin/env node
import * as meow from 'meow';

const fetch = require('node-fetch');
const getStdin = require('get-stdin');
const {render} = require('svg-term');

interface SvgTermCli {
  flags: { [name: string]: any };
  help: string;
  input: string[];
}

interface SvgTermError extends Error {
  help: () => string;
}

withCli(main, `
  Usage
    $ svg-term [options]

  Options
    --cast, -c      asciinema cast id to download [string], required if no stdin provided
    --profile, -p   terminal profile file to use [file], requires --term
    --term, -t      terminal profile format, requires [iterm2, xrdb, xresources, terminator, konsole, terminal, remmina, termite, tilda, xcfe] --profile
    --frame, -f     wether to frame the result with an application window [boolean]
    --width, -w     width in columns [number]
    --height, -h    height in lines [number]
    --help          print this help [boolean]

  Examples
    $ echo rec.json | svg-term
    $ svg-term --cast 113643
    $ svg-term --cast 113643
`);

async function main(cli: SvgTermCli) {
  const input = await getInput(cli);
  const error = cliError(cli);

  if (!input) {
    throw error(`svg-term: either stdin or --cast are required`);
  }

  const malformed = ensure(['height', 'width'], cli.flags, (name, val) => {
    if (!(name in cli.flags)) {
      return;
    }
    const candidate = parseInt(val, 10);
    if (isNaN(candidate)) {
      return new TypeError(`${name} was expected to be number, received "${val}"`);
    }
  });

  if (malformed.length > 0) {
    throw error(`svg-term: ${malformed.map(m => m.message).join('\n')}`);
  }

  const svg = render(input, {
    height: toNumber(cli.flags.height),
    width: toNumber(cli.flags.width),
    window: Boolean(cli.flags.frame)
  });

  console.log(svg);
}

function ensure(names: string[], flags: SvgTermCli['flags'], predicate: (name: string, val: any) => Error | null): Error[] {
  return names.map(name => predicate(name, flags[name])).filter(e => e instanceof Error);
}

function cliError(cli: SvgTermCli): (message: string) => SvgTermError {
  return (message: string): SvgTermError => {
    const err: any = new Error(message);
    err.help = () => cli.help; 
    return err;
  };
}

async function getInput(cli: SvgTermCli) {
  if (cli.flags.cast) {
    const response = await fetch(`https://asciinema.org/a/${cli.flags.cast}.cast?dl=true`);
    return response.text();
  }

  return await getStdin();  
}

function toNumber(input: string | null): number | null {
  if (!input) {
    return null;
  }
  const candidate = parseInt(input, 10);
  if (isNaN(candidate)) {
    return null;
  }
  return candidate;
}

function withCli(fn: (cli: SvgTermCli) => Promise<void>, help: string = ''): Promise<void> {
  return main(meow(help))
    .catch(err => {
      setTimeout(() => {
        if (typeof err.help === 'function') {
          console.log(err.help());
          console.log('\n', err.message);
          process.exit(1);
        }
        throw err;
      }, 0);
    });
}