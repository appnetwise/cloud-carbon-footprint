#!/bin/bash

# Keycloak configuration
KEYCLOAK_URL="https://localhost:8443"
REALM_NAME="ccf1"
REALM_DISPLAY_NAME="Cloud Carbon Footprint"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="admin"
FRONTEND_URL="https://localhost:8443"
LOGIN_THEME="anw"

# Function to get access token
get_access_token() {
    curl -s -X POST "${KEYCLOAK_URL}/realms/master/protocol/openid-connect/token" \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "username=${ADMIN_USERNAME}" \
    -d "password=${ADMIN_PASSWORD}" \
    -d "grant_type=password" \
    -d "client_id=admin-cli" | jq -r '.access_token'
}

# Export variables and functions
export KEYCLOAK_URL REALM_NAME REALM_DISPLAY_NAME ADMIN_USERNAME ADMIN_PASSWORD FRONTEND_URL LOGIN_THEME