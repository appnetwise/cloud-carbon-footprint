# Keycloak setup

## Prerequisite

Setup the TLS on localhost for keycloak. 

$ cd ./docker/keycloak 
$ mkdir certs
$ cd certs
$ openssl genpkey -algorithm RSA -out localhostkey.pem -pkeyopt rsa_keygen_bits:2048
$ openssl req -new -x509 -key localhostkey.pem -out localhostcert.pem -days 365

## setup the keycloak
$ cd ..
$ ./run.sh