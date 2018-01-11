#!/usr/bin/env node
import * as fs from "fs";
import chalk from "chalk";
import { GuessedTerminal, guessTerminal } from "guess-terminal";
import * as macosAppConfig from "macos-app-config";
import * as os from "os";
import * as path from "path";
import * as parsers from "term-schemes";

const meow = require("meow");
const plist = require("plist");
const fetch = require("node-fetch");
const getStdin = require("get-stdin");
const { render } = require("svg-term");
const sander = require("@marionebl/sander");
const SVGO = require("svgo");

interface Guesses {
  [key: string]: string | null;
}

interface SvgTermCli {
  flags: { [name: string]: any };
  help: string;
  input: string[];
}

interface SvgTermError extends Error {
  help(): string;
}

withCli(
  main,
  `
  Usage
    $ svg-term [options]

  Options
    --at            timestamp of frame to render in ms [number]
    --cast          asciinema cast id to download [string], required if no stdin provided [string]
    --from          lower range of timeline to render in ms [number]
    --height        height in lines [number]
    --help          print this help [boolean]
    --in            json file to use as input [string]
    --no-cursor     disable cursor rendering [boolean]
    --no-optimize   disable svgo optimization [boolean]
    --out           output file, emits to stdout if omitted, [string]
    --padding       distance between text and image bounds, [number]
    --padding-x     distance between text and image bounds on x axis [number]
    --padding-y     distance between text and image bounds on y axis [number]
    --profile       terminal profile file to use, requires --term [string]
    --term          terminal profile format [iterm2, xrdb, xresources, terminator, konsole, terminal, remmina, termite, tilda, xcfe], requires --profile [string]
    --to            upper range of timeline to render in ms [number]
    --width         width in columns [number]
    --window        render with window decorations [boolean]

  Examples
    $ cat rec.json | svg-term
    $ svg-term --cast 113643
    $ svg-term --cast 113643 --out examples/parrot.svg
`, {
  boolean: ['cursor', 'help', 'optimize', 'version', 'window'],
  string: ['at', 'cast', 'from', 'height', 'in', 'out', 'padding', 'padding-x', 'padding-y', 'profile', 'term', 'to', 'width'],
  default: {
    cursor: true,
    optimize: true,
    window: false
  }
});

async function main(cli: SvgTermCli) {
  const input = await getInput(cli);
  const error = cliError(cli);

  if (!input) {
    throw error(`svg-term: either stdin, --cast or --in are required`);
  }

  const malformed = ensure(["height", "width"], cli.flags, (name, val) => {
    if (!(name in cli.flags)) {
      return null;
    }

    const candidate = parseInt(val, 10);
    if (isNaN(candidate)) {
      return new TypeError(`${name} expected to be number, received "${val}"`);
    }

    return null;
  });

  if (malformed.length > 0) {
    throw error(`svg-term: ${malformed.map(m => m.message).join("\n")}`);
  }

  const missingValue = ensure(
    ["cast", "out", "profile"],
    cli.flags,
    (name, val) => {
      if (!(name in cli.flags)) {
        return null;
      }
      if (name === "cast" && typeof val === "number") {
        return null;
      }
      if (typeof val === "string") {
        return null;
      }

      return new TypeError(`${name} expected to be string, received "${val}"`);
    }
  );

  if (missingValue.length > 0) {
    throw error(`svg-term: ${missingValue.map(m => m.message).join("\n")}`);
  }

  const shadowed = ensure(["at", "from", "to"], cli.flags, (name, val) => {
    if (!(name in cli.flags)) {
      return null;
    }

    const v = typeof(val) === "number" ? val : parseInt(val, 10);

    if (isNaN(v)) {
      return new TypeError(`${name} expected to be number, received "${val}"`);
    }
  
    if (name !== "at" && ! isNaN(parseInt(cli.flags.at, 10))) {
      return new TypeError(`--at flag disallows --${name}`);
    }

    return null;
  });

  if (shadowed.length > 0) {
    throw error(`svg-term: ${shadowed.map(m => m.message).join("\n")}`);
  }

  const term = guessTerminal() || cli.flags.term;
  const profile = term
    ? guessProfile(term) || cli.flags.profile
    : cli.flags.profile;

  const guess: Guesses = {
    term,
    profile
  };

  if ("term" in cli.flags || "profile" in cli.flags) {
    const unsatisfied = ["term", "profile"].filter(n => !Boolean(guess[n]));

    if (unsatisfied.length > 0) {
      throw error(
        `svg-term: --term and --profile must be used together, ${unsatisfied.join(
          ", "
        )} missing`
      );
    }
  }

  const unknown = ensure(["term"], cli.flags, (name, val) => {
    if (!(name in cli.flags)) {
      return null;
    }

    if (!(cli.flags.term in parsers.TermSchemes)) {
      return null;
    }

    return new TypeError(
      `${name} expected to be one of ${Object.keys(parsers.TermSchemes).join(
        ", "
      )}, received "${val}"`
    );
  });

  if (unknown.length > 0) {
    throw error(`svg-term: ${unknown.map(m => m.message).join("\n")}`);
  }

  const p = guess.profile || "";
  const isFileProfile = ["~", "/", "."].indexOf(p.charAt(0)) > -1;

  if (isFileProfile && "profile" in cli.flags) {
    const missing = !fs.existsSync(path.join(process.cwd(), cli.flags.profile));
    if (missing) {
      throw error(
        `svg-term: ${cli.flags.profile} must be readable file but was not found`
      );
    }
  }

  const theme = getTheme(guess);

  const svg = render(input, {
    at: toNumber(cli.flags.at),
    cursor: toBoolean(cli.flags.cursor, true),
    from: toNumber(cli.flags.from),
    paddingX: toNumber(cli.flags.paddingX || cli.flags.padding),
    paddingY: toNumber(cli.flags.paddingY || cli.flags.padding),
    to: toNumber(cli.flags.to),
    height: toNumber(cli.flags.height),
    theme,
    width: toNumber(cli.flags.width),
    window: toBoolean(cli.flags.window, false)
  });

  const svgo = new SVGO({
    plugins: [{ collapseGroups: false }]
  });

  const optimized = toBoolean(cli.flags.optimize, true)
    ? await svgo.optimize(svg)
    : {data: svg};

  if (typeof cli.flags.out === "string") {
    sander.writeFile(cli.flags.out, Buffer.from(optimized.data));
  } else {
    process.stdout.write(optimized.data);
  }
}

function ensure(
  names: string[],
  flags: SvgTermCli["flags"],
  predicate: (name: string, val: any) => Error | null
): Error[] {
  return names
    .map(name => predicate(name, flags[name]))
    .filter(e => e instanceof Error)
    .map(e => e as Error);
}

function cliError(cli: SvgTermCli): (message: string) => SvgTermError {
  return message => {
    const err: any = new Error(message);
    err.help = () => cli.help;

    return err;
  };
}

function getConfig(term: GuessedTerminal): any {
  switch (term) {
    case GuessedTerminal.terminal: {
      return macosAppConfig.sync(term)[0];
    }
    case GuessedTerminal.iterm2: {
      return macosAppConfig.sync(term)[0];
    }
    default:
      return null;
  }
}

function getPresets(term: GuessedTerminal): any {
  const config = getConfig(term);

  switch (term) {
    case GuessedTerminal.terminal: {
      return config["Window Settings"];
    }
    case GuessedTerminal.iterm2: {
      return config["Custom Color Presets"];
    }
    default:
      return null;
  }
}

function guessProfile(term: GuessedTerminal): string | null {
  if (os.platform() !== "darwin") {
    return null;
  }

  const config = getConfig(term);

  if (!config) {
    return null;
  }

  switch (term) {
    case GuessedTerminal.terminal: {
      return config["Default Window Settings"];
    }
    case GuessedTerminal.iterm2: {
      return null;
    }
    default:
      return null;
  }
}

async function getInput(cli: SvgTermCli) {
  if (cli.flags.in) {
    return String(await sander.readFile(cli.flags.in));
  }

  if (cli.flags.cast) {
    const response = await fetch(
      `https://asciinema.org/a/${cli.flags.cast}.cast?dl=true`
    );

    return response.text();
  }

  return getStdin();
}

function getParser(term: string) {
  switch (term) {
    case parsers.TermSchemes.iterm2:
      return parsers.iterm2;
    case parsers.TermSchemes.konsole:
      return parsers.konsole;
    case parsers.TermSchemes.remmina:
      return parsers.remmina;
    case parsers.TermSchemes.terminal:
      return parsers.terminal;
    case parsers.TermSchemes.terminator:
      return parsers.terminator;
    case parsers.TermSchemes.termite:
      return parsers.termite;
    case parsers.TermSchemes.tilda:
      return parsers.tilda;
    case parsers.TermSchemes.xcfe:
      return parsers.xfce;
    case parsers.TermSchemes.xresources:
      return parsers.xresources;
    case parsers.TermSchemes.xterm:
      return parsers.xterm;
    default:
      throw new Error(`unknown term parser: ${term}`);
  }
}

function getTheme(guess: Guesses): parsers.TermScheme | null {
  if (guess.term === null || guess.profile === null) {
    return null;
  }

  const p = guess.profile || "";
  const isFileProfile = ["~", "/", "."].indexOf(p.charAt(0)) > -1;

  return isFileProfile
    ? parseTheme(guess.term as string, guess.profile as string)
    : extractTheme(guess.term as string, guess.profile as string);
}

function parseTheme(term: string, input: string): parsers.TermScheme {
  const parser = getParser(term);

  return parser(String(fs.readFileSync(input)));
}

function extractTheme(term: string, name: string): parsers.TermScheme | null {
  if (!(term in GuessedTerminal)) {
    return null;
  }

  if (os.platform() !== "darwin") {
    return null;
  }

  if (term === GuessedTerminal.hyper) {
    const filename = path.resolve(os.homedir(), ".hyper.js");

    return parsers.hyper(String(fs.readFileSync(filename)), {
      filename
    });
  }

  const presets = getPresets(term as GuessedTerminal);

  if (!presets) {
    return null;
  }

  const theme = presets[name];
  const parser = getParser(term);

  if (!theme) {
    return null;
  }

  switch (term) {
    case GuessedTerminal.iterm2: {
      return parser(plist.build(theme));
    }
    case GuessedTerminal.terminal:
      return parser(plist.build(theme));
    default:
      return null;
  }
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

function toBoolean(input: any, fb: boolean): boolean {
  if (input === undefined) {
    return fb;
  }
  if (input === "false") {
    return false;
  }
  if (input === "true") {
    return true;
  }

  return input === true;
}

function withCli(
  fn: (cli: SvgTermCli) => Promise<void>,
  help: string = "",
  options = {}
): void {
  const unknown: string[] = [];
  const cli = meow(help, {
    ...options,
    unknown: (arg: string) => {
      unknown.push(arg);

      return false;
    }
  });

  if (unknown.length > 0) {
    console.log(cli.help);
    console.log("\n", chalk.red(`svg-term: remove unknown flags ${unknown.join(', ')}`));
    process.exit(1);
  }

  fn(cli).catch(err => {
    setTimeout(() => {
      if (typeof err.help === "function") {
        console.log(err.help());
        console.log("\n", chalk.red(err.message));
        process.exit(1);
      }
      throw err;
    }, 0);
  });
}
