FROM node:24-alpine

WORKDIR /app

# Copy only manifest files first so npm install is cached
# as a separate layer — it only re-runs when dependencies change,
# not on every source code edit.
COPY package.json package-lock.json ./

# Copying the prisma schema and config ealier
# so when `npx prisma generate` runs for the first time
# it can access the schema and config
COPY prisma ./prisma
COPY prisma.config.ts ./

RUN npm install

# Generate the prisma client
RUN npx prisma generate

# Now copy the rest of the source. Changes here won't invalidate
# the npm install layer above.
COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]