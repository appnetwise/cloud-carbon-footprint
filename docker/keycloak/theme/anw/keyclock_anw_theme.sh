#!/bin/bash

# Set variables
KEYCLOAK_CONTAINER_NAME="keycloak-keycloak_demo_using_postgres-1"
KEYCLOAK_DIR="/opt/keycloak"
CUSTOM_THEME_NAME="anw"

# Function to execute Docker commands
docker_exec() {
    docker exec $KEYCLOAK_CONTAINER_NAME sh -c "$*"
}

# Check if the Keycloak directory exists
if ! docker_exec "[ -d $KEYCLOAK_DIR ]"; then
    echo "Error: $KEYCLOAK_DIR does not exist in the container."
    exit 1
fi

# Create directory structure
docker_exec "mkdir -p $KEYCLOAK_DIR/themes/$CUSTOM_THEME_NAME/{account,admin,login}/{resources/{css,img},messages}"

# Function to copy local file to container
copy_to_container() {
    local src=$1
    local dest=$2
    if [ -f "$src" ]; then
        docker cp "$src" "$KEYCLOAK_CONTAINER_NAME:$dest"
    else
        echo "Warning: $src not found. Skipping."
    fi
}

# Copy custom resources
copy_to_container "logo.svg" "$KEYCLOAK_DIR/themes/$CUSTOM_THEME_NAME/account/resources/logo.svg"
copy_to_container "favicon.ico" "$KEYCLOAK_DIR/themes/$CUSTOM_THEME_NAME/account/resources/favicon.ico"
copy_to_container "./logo.svg" "$KEYCLOAK_DIR/themes/$CUSTOM_THEME_NAME/admin/resources/logo.svg"
copy_to_container "./favicon.ico" "$KEYCLOAK_DIR/themes/$CUSTOM_THEME_NAME/admin/resources/favicon.ico"
copy_to_container "./favicon.ico" "$KEYCLOAK_DIR/themes/$CUSTOM_THEME_NAME/login/resources/img/favicon.ico"
#copy_to_container "./keycloak-bg.png" "$KEYCLOAK_DIR/themes/$CUSTOM_THEME_NAME/login/resources/img/keycloak-bg.png"
copy_to_container "./keycloak-logo-text.svg" "$KEYCLOAK_DIR/themes/$CUSTOM_THEME_NAME/login/resources/img/keycloak-logo-text.svg"

# Create custom CSS files
for theme in account admin login; do
    docker_exec "cat << EOF > $KEYCLOAK_DIR/themes/$CUSTOM_THEME_NAME/$theme/resources/css/styles.css
body {
    background: #f5f5f5;
}
.login-pf body {
    background: #f5f5f5;
}
div#kc-header {
    margin-bottom: 20px;
}
div#kc-header-wrapper {
    padding: 20px;
}
#kc-header-wrapper {
    background-image: url(../img/keycloak-logo-text.svg);
    background-repeat: no-repeat;
    background-position: center;
    background-size: contain;
    height: 100px;
    width: 300px;
    margin: 0 auto;
    color: #f5f5f5;
}
#kc-header-wrapper span {
    display: none;
    color: #fff;
}
#kc-content {
    background-color: #fff;
    border-radius: 4px;
    padding: 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.btn-primary {
    background-color: #0c7264;
    border-color: #0c7264;
}
.btn-primary:hover {
    background-color: #1565c0;
    border-color: #1565c0;
}
.form-group {
    margin-bottom: 20px;
}
.form-control {
    height: 40px;
}

.pf-c-button {
    border-radius: 4px;
}

.card-pf {
    border-color: "#0c7264";
}

#kc-login {
    background-color:#0c7264 ;
}
.pf-c-form-control:focus {
    border-color: #0c7264;
}
.pf-c-form-control {
    border-color: #0c7264;
}
.pf-c-button.pf-m-control {
    border-color: #0c7264;
}
.pf-c-button.pf-m-control:hover {
  --pf-c-button--m-control--after--BorderBottomColor: #0c7264;
}
.pf-c-button.pf-m-control:focus {
  --pf-c-button--m-control--after--BorderBottomColor: #0c7264;
}
.pf-c-button.pf-m-control:hover {
  --pf-c-button--m-control--after--BorderBottomColor: #0c7264;
}
.pf-c-button.pf-m-primary {
  --pf-c-button--m-primary--Color: #fff;
  --pf-c-button--m-primary--BackgroundColor: #0c7264;
  --pf-c-button--m-primary--BorderColor: #0c7264;
}
.pf-c-button.pf-m-primary:hover {
  --pf-c-button--m-primary--Color: #fff;
  --pf-c-button--m-primary--BackgroundColor: #0c7264;
  --pf-c-button--m-primary--BorderColor: #0c7264;
}

#kc-info-wrapper {
    background-color: #0c7264;
    color: #fff;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
#kc-registration > span >a {
     color: #fff;
} 

EOF"
done

# Create theme.properties files
for theme in account admin login; do
    docker_exec "cat << EOF > $KEYCLOAK_DIR/themes/$CUSTOM_THEME_NAME/$theme/theme.properties
parent=keycloak
import=common/keycloak
styles=css/login.css css/styles.css

EOF"
done

# Create messages_en.properties file
docker_exec "cat << EOF > $KEYCLOAK_DIR/themes/$CUSTOM_THEME_NAME/login/messages/messages_en.properties
loginAccountTitle=Let us go
EOF"

# Find kcadm.sh location
KCADM_PATH="$KEYCLOAK_DIR/bin/kcadm.sh"
if ! docker_exec "[ -f $KCADM_PATH ]"; then
    echo "Error: Unable to find kcadm.sh at $KCADM_PATH"
    exit 1
fi

# Print environment variables for debugging
docker_exec "env"


# Update Keycloak configuration

docker_exec "\"$KCADM_PATH\" config credentials --server 'https://localhost:8443' --realm master --user admin --password admin --truststore '/opt/keycloak/conf/truststore.jks'"

docker_exec "\"$KCADM_PATH\" update realms/master -s loginTheme=$CUSTOM_THEME_NAME -s accountTheme=$CUSTOM_THEME_NAME -s adminTheme=$CUSTOM_THEME_NAME --truststore '/opt/keycloak/conf/truststore.jks'"



# Restart Keycloak container
docker restart $KEYCLOAK_CONTAINER_NAME

echo "Keycloak theme update completed. Please check your Keycloak instance."