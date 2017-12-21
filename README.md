<p align="center">
  <img width="600" src="https://cdn.rawgit.com/marionebl/svg-term-cli/1bb61eca/examples/parrot.svg">
</p>

> Share terminal sessions as razor-sharp animated SVG everywhere

# svg-term-cli

* 💄 Render asciicast to animated SVG
* 🌐 Share asciicasts everywhere (sans JS)
* 🤖 Style with common [color profiles](https://github.com/marionebl/term-schemes#supported-formats)

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

## Rationale

Replace GIF asciicast recordings where you can not use the [asciinema player](https://asciinema.org/), e.g. `README.md` files on GitHub and the npm registry.

The image at the top of this README is an example. See how sharp the text looks, even when you zoom in? That’s because it’s an SVG!

## Related

* [asciinema/asciinema](https://github.com/asciinema/asciinema) - Terminal session recorder
* [derhuerst/asciicast-to-svg](https://github.com/derhuerst/asciicast-to-svg) - Render frames of Asciicasts as SVGs
* [marionebl/svg-term](https://github.com/marionebl/svg-term) - Render asciicast to animated SVG
* [marionebl/term-schemes](https://github.com/marionebl/term-schemes) - Parse and normalize common terminal emulator color schemes

## Gallery

* [marionebl/commitlint](https://github.com/marionebl/commitlint)
* [marionebl/share-cli](https://github.com/marionebl/share-cli)
* [marionebl/remote-share-cli](https://github.com/marionebl/remote-share-cli)

## License

Copyright 2017. Released under the MIT license.
