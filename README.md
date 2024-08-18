# README

## About

Jade is a UI for a Crossword Board Game analyzer. It is hoped it can be plugged into
other analyzers, but for now it will be compatible with Macondo (https://github.com/domino14/macondo).

### UCGI

See https://github.com/woogles-io/open-protocols/tree/main/ucgi - this is the protocol
via which Jade talks to other engines.

## Live Development

To run in live development mode, run `wails dev` in the project directory. This will run a Vite development
server that will provide very fast hot reload of your frontend changes. If you want to develop in a browser
and have access to your Go methods, there is also a dev server that runs on http://localhost:34115. Connect
to this in your browser, and you can call your Go code from devtools.

## Building

To build a redistributable, production mode package, use `wails build`.

## License, etc

Code is AGPLv3. Ideally it would be just plain GPLv3, but the frontend uses a bunch of files from https://github.com/woogles-io/liwords (which is AGPLv3) copied almost verbatim, so we don't have to reinvent the wheel.

If one wishes to make an analyzer that is NOT GPL or AGPL licensed, it is still possible to use Jade as a frontend, as the communication method between the two would just be stdin/stdout and they will be two separate programs. Note that the UCGI protocol description itself is MIT licensed.

