FROM node:24-alpine

WORKDIR /app

# Copy only manifest files first so npm install is cached
# as a separate layer — it only re-runs when dependencies change,
# not on every source code edit.
COPY package.json package-lock.json ./

RUN npm install

# Copying the prisma schema and config ealier
# so when `npx prisma generate` runs for the first time
# it can access the schema and config
COPY prisma ./prisma
COPY prisma.config.ts ./

# dummy value so prisma generate actually builds client without any errors
ARG DATABASE_URL=postgresql://user:pass@localhost:5432/db
ENV DATABASE_URL=$DATABASE_URL

# Now copy the rest of the source. Changes here won't invalidate
# the npm install layer above.
COPY . .

COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["sh", "/app/entrypoint.sh"]
CMD ["npm", "run", "dev"]