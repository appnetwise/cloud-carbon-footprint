FROM node:18-alpine
WORKDIR /usr/src/app
COPY ./dist ./dist
COPY ./.yarn ./
COPY ./.yarnrc.yml ./
COPY ./package.json .
RUN yarn install --immutable
RUN rm -rf core

CMD [ "yarn", "start:webprod"]
