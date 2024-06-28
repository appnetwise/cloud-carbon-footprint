FROM node:18-alpine
WORKDIR /usr/src/app
ENV YARN_ENABLE_IMMUTABLE_INSTALLS=false
COPY ./dist ./dist
COPY ./.yarn ./.yarn
COPY ./.yarnrc.yml ./.yarnrc.yml
COPY ./package.json .
RUN yarn install --immutable
RUN rm -rf core

CMD [ "yarn", "start:webprod"]
