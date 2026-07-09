FROM node:24-alpine

WORKDIR /app

# Copy only manifest files first so npm install is cached
# as a separate layer — it only re-runs when dependencies change,
# not on every source code edit.
COPY package.json package-lock.json ./

RUN npm install

# Now copy the rest of the source. Changes here won't invalidate
# the npm install layer above.
COPY ..

EXPOSE 3000

CMD ["npm", "run", "dev"]