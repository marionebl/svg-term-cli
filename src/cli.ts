#!/usr/bin/env node
import * as fs from 'fs';
import * as path from 'path';
import * as meow from 'meow';
import * as parsers from 'term-schemes';
import {TermSchemes, TermScheme} from 'term-schemes';

const fetch = require('node-fetch');
const getStdin = require('get-stdin');
const {render} = require('svg-term');
const sander = require('@marionebl/sander');

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
    --out, -o       output file, emits to stdout if omitted
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
      return new TypeError(`${name} expected to be number, received "${val}"`);
    }
  });

  if (malformed.length > 0) {
    throw error(`svg-term: ${malformed.map(m => m.message).join('\n')}`);
  }

  if (('term' in cli.flags) || ('profile' in cli.flags)) {
    const unsatisfied = ['term', 'profile'].filter(n => typeof cli.flags[n] !== 'string');
    if (unsatisfied.length > 0) {
      throw error(`svg-term: --term and --profile must be used together, ${unsatisfied.join(', ')} missing`);
    }
  }

  const unknown = ensure(['term'], cli.flags, (name, val) => {
    if (!(name in cli.flags)) {
      return;
    }
    if (!(cli.flags.term in TermSchemes)) {
      return new TypeError(`${name} expected to be one of ${Object.keys(TermSchemes).join(', ')}, received "${val}"`);
    }
  });

  if (unknown.length > 0) {
    throw error(`svg-term: ${unknown.map(m => m.message).join('\n')}`);
  }

  if ('profile' in cli.flags) {
    const missing = !fs.existsSync(path.join(process.cwd(), cli.flags.profile));
    if (missing) {
      throw error(`svg-term: ${cli.flags.profile} must be readable file but was not found`);
    }
  }

  const theme = (('term' in cli.flags) && ('profile' in cli.flags)) 
    ? parse(cli.flags.term, cli.flags.profile) 
    : null;

  const svg = render(input, {
    height: toNumber(cli.flags.height),
    theme,
    width: toNumber(cli.flags.width),
    window: Boolean(cli.flags.frame)
  });

  if ('out' in cli.flags) {
    sander.writeFile(cli.flags.out, Buffer.from(svg));
  } else {
    process.stdout.write(svg);
  }
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

function getParser(term: string) {
  switch(term) {
    case TermSchemes.iterm2:
      return parsers.iterm2;
    case TermSchemes.konsole:
      return parsers.konsole;
    case TermSchemes.remmina:
      return parsers.remmina;
    case TermSchemes.terminal:
      return parsers.terminal;
    case TermSchemes.terminator:
      return parsers.terminator;
    case TermSchemes.termite:
      return parsers.termite;
    case TermSchemes.tilda:
      return parsers.tilda;
    case TermSchemes.xcfe:
      return parsers.xfce;
    case TermSchemes.xresources:
      return parsers.xresources;
    case TermSchemes.xterm:
      return parsers.xterm;
    default:
      throw new Error(`unknown term parser: ${term}`);
  }
}

function parse(term: string, input: string): TermScheme {
  const parser = getParser(term);
  return parser(String(fs.readFileSync(input)));
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