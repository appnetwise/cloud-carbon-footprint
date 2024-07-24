FROM node:18-alpine as build
WORKDIR /app
ARG NPM_PAT_TOKEN
ENV NPM_PAT_TOKEN=${NPM_PAT_TOKEN}
COPY ./package.json ./package.json
COPY ./build /app/build
COPY .npmrc /app/.npmrc
COPY ./entrypoint.sh /app/entrypoint.sh

RUN yarn install --immutable

FROM nginx:1.26

WORKDIR /var/www/

COPY --from=build /app/build /var/www
COPY --from=build /app/entrypoint.sh /opt/entrypoint.sh

RUN chmod +777 /var/www

ENTRYPOINT ["sh", "/opt/entrypoint.sh"]

CMD ["nginx-fe"]
