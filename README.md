> Share terminal sessions as razor-sharp animated SVG everywhere

<p align="center">
  <img width="600" src="https://cdn.rawgit.com/marionebl/svg-term-cli/1250f9c1/examples/parrot.svg">
</p>

> Example generated with `svg-term --cast 113643 --out examples/parrot.svg --window --no-cursor --from=4500`

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
svg-term --cast=113643 --out examples/parrot.svg --window
```

## Interface

```
$ svg-term --help

  Share terminal sessions as razor-sharp animated SVG everywhere

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
