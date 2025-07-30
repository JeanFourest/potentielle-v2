Start all services defined in docker-compose.yml
docker-compose up

Start services in background (detached mode)
docker-compose up -d

Stop all services
docker-compose down

Stop and remove containers, networks, and volumes
docker-compose down -v
Build or rebuild services
docker-compose build

Start services and rebuild if needed
docker-compose up --build

Force rebuild without cache
docker-compose build --no-cache

docker exec -it potentielle-db psql -U postgres -d potentielle_v2
\dt -- Check if news table exists
\d news -- Check news table structure