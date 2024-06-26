#!/bin/sh

set -ex

replace_var() {
    # $1 var name
    # $2 file name
    eval "value=\$$1"
    if [ -z "$value" ]; then
        echo "WARN: Undefined variable $1"
        sed -i "s,%$1%,,g" $2
    else
        echo "Setting variable $1"
        sed -i "s,%$1%,$value,g" $2
    fi
}

if [ "$@" = 'nginx-fe' ]; then

    # go through all JS files and replace %VAR_NAME% with VAR_NAME value from env variables

    find /var/www/ -type f -name "*main.*.js" | while read filename; do
        replace_var REACT_APP_MSAL_AUTHORITY $filename
        replace_var REACT_APP_MSAL_CLIENT_ID $filename
        replace_var REACT_APP_MSAL_REDIRECT_URI $filename
    done

    exec nginx -g "daemon off;"
fi