FROM --platform=$BUILDPLATFORM node:19-alpine AS build
WORKDIR /build
COPY package.json ./
COPY package-lock.json ./
RUN npm ci --ignore-scripts
COPY . .
RUN npm run build-only

FROM node:19-alpine as stage
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /build/dist ./app
COPY --from=build /build/node_modules ./app
RUN mkdir /data
RUN mkdir /config
CMD ["node", "index.js"]
