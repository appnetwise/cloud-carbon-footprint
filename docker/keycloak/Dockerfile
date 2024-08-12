FROM alpine:latest
WORKDIR /keycloak
RUN apk add --no-cache bash
COPY ./theme /keycloak
COPY ./theme/anw/keyclock_anw_theme.sh /keycloak/keyclock_anw_theme.sh
RUN chmod +x /keycloak/keyclock_anw_theme.sh


ENTRYPOINT ["/bin/bash", "/keycloak/keyclock_anw_theme.sh"]
