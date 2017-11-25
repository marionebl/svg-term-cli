#!/usr/bin/env node
import * as meow from 'meow';

const fetch = require('node-fetch');
const getStdin = require('get-stdin');

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

  Examples
    $ echo rec.json | svg-term
    $ svg-term --cast 113643
    $ svg-term --cast 113643
`);

async function main(cli: SvgTermCli) {
  const input = await getStdin(cli);
  const error = cliError(cli);

  if (!input) {
    throw error(`svg-term: either stdin or --cast are required`);
  }
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
    const id = cli.input[0];
    const response = await fetch(`https://asciinema.org/a/${id}.cast?dl=true`);
    return response.text();
  }

  return await getStdin();  
}

function withCli(fn: (cli: SvgTermCli) => Promise<void>, help: string = ''): Promise<void> {
  return main(meow(help))
    .catch(err => {
      if (typeof err.help === 'function') {
        console.log(err.help());
        console.log('\n', err.message);
        process.exit(1);
      }
      throw err;
    });
}