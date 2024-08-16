#!/bin/bash

# Include configuration
. ./keycloak_config.sh

# Get access token
TOKEN=$(get_access_token)

# Function to create realm
create_realm() {
    response=$(curl -s -X POST "${KEYCLOAK_URL}/admin/realms" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Content-Type: application/json" \
    -d '{
        "realm": "'"${REALM_NAME}"'",
        "enabled": true,
        "displayName": "'"${REALM_DISPLAY_NAME}"'",
        "frontendUrl": "'"${FRONTEND_URL}"'",
        "loginTheme": "'"${LOGIN_THEME}"'",
        "sslRequired": "external",
        "registrationAllowed": true,
        "rememberMe":true,
        "verifyEmail":true,
        "loginWithEmailAllowed":true,
        "resetCredentialsAllowed":true
    }')
    echo "Realm creation response: ${response}"
}

# Main execution
create_realm

echo "Setup complete."