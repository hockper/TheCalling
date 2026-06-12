FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps

FROM deps AS builder
COPY . .
RUN npm run build

FROM builder AS tester
# Tester stage contains all dev dependencies, ideal for running tests
CMD ["npm", "run", "test"]

FROM builder AS production-deps
RUN npm prune --omit=dev

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apk upgrade --no-cache
COPY --from=production-deps /app/package.json ./
COPY --from=production-deps /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
# Remove global npm and npx to eliminate container vulnerabilities in the base image's global npm dependencies
RUN rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx
EXPOSE 3000
CMD ["node_modules/.bin/next", "start"]
