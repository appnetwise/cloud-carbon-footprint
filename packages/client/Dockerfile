FROM node:18-alpine as build
WORKDIR /app
COPY ./package.json ./package.json
COPY ./build /app/build
COPY ./scripts/entrypoint.sh /opt/entrypoint.sh

RUN yarn install --immutable

FROM nginxinc/nginx-unprivileged:1.26
COPY --from=build /app/build /var/www
ENTRYPOINT ["sh", "/opt/entrypoint.sh"]
CMD ["nginx-fe"]
