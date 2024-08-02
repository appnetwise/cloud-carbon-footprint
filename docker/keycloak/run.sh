# Description: Run Keycloak with docker-compose
docker-compose down
docker-compose up -d

echo "Keycloak is running on http://localhost:8080"