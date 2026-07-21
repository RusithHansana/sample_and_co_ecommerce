# server/entrypoint.sh
#!/bin/sh
set -e

echo "Generating Prisma Client..."
npx prisma generate

echo "Waiting for database to be ready..."
until nc -z db 5432; do
  sleep 1
done

npx prisma migrate deploy

echo "Migrations applied. Starting server..."
exec "$@"