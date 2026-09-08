FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM deps AS test
COPY tsconfig.json vitest.config.mts ./
COPY src ./src
RUN npm test
CMD ["npm", "test"]

FROM test AS build
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/dist ./dist
COPY migrate-mongo-config.js ./
EXPOSE 4000
CMD ["node", "dist/server.js"]
