# Simple base dockerfile to simplify its usage without need to have node locally.
FROM node:alpine

RUN npm install -g svg-term-cli

ENTRYPOINT [ "svg-term" ]
