<p align="center">
  <img width="600" height="370" src="https://cdn.rawgit.com/marionebl/svg-term-cli/1bb61eca/examples/parrot.svg">
</p>

# svg-term-cli

* 💄 Render asciicast to animated SVG
* 🌐 Use asciicast from disk or asciinema.com
* 🤖 Pick up iterm2 and Terminal color scheme automatically

## Install

```
npm install -g svg-term-cli
```

## Usage

Generate the `parrot.svg` example from [asciicast](https://asciinema.org/a/113643)

```
svg-term --cast=113643 --out examples/parrot.svg --frame
```

## Interface

```
$ svg-term --help

Usage
    $ svg-term [options]

  Options
    --cast          asciinema cast id to download [string], required if no stdin provided
    --out           output file, emits to stdout if omitted
    --profile       terminal profile file to use [file], requires --term
    --term          terminal profile format, requires [iterm2, xrdb, xresources, terminator, konsole, terminal, remmina, termite, tilda, xcfe] --profile
    --frame         wether to frame the result with an application window [boolean]
    --width         width in columns [number]
    --height        height in lines [number]
    --help          print this help [boolean]

  Examples
    $ echo rec.json | svg-term
    $ svg-term --cast 113643
```

## Why?

The case is to use SVGs in READMEs instead of GIFs. The image above at the top of this README is an example. See how sharp the text looks, even when you zoom in? That’s because it’s an SVG!

## License

Copyright 2017. Released under the MIT license.
