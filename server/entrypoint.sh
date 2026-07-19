# server/entrypoint.sh
#!/bin/sh
set -e

echo "Generating Prisma Client..."
npx prisma generate

echo "Waiting for database to be ready..."
npx prisma migrate deploy

echo "Migrations applied. Starting server..."
exec "$@"