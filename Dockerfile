FROM node:lts-alpine

WORKDIR /usr/app
COPY . .
RUN yarn
RUN yarn build

ENTRYPOINT ["/usr/app/scripts/server.sh"]