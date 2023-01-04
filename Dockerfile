FROM --platform=$BUILDPLATFORM node:19-alpine AS build
WORKDIR /build
ENV HUSKY=0
COPY package.json ./
COPY package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:19-alpine as stage
WORKDIR /app
ENV NODE_ENV=production
ENV HUSKY=0
COPY --from=build /build/dist ./app
COPY package.json ./
COPY package-lock.json ./
RUN npm ci --omit=dev
RUN mkdir /data
RUN mkdir /config
CMD ["node", "index.js"]
