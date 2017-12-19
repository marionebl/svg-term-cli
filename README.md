# svg-term-cli

* Render asciicast to animated SVG
* Use asciicast from disk or asciinema.com
* Pick up iterm2 and Terminal color scheme automatically

<p align="center">
  <img width="460" src="https://cdn.rawgit.com/marionebl/svg-term-cli/1bb61eca/examples/parrot.svg">
</p>

## Usage

Generate the `parrot.svg` example from [asciicast](https://asciinema.org/a/113643)

```
svg-term --cast=113643 --out examples/parrot.svg --frame
```

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
