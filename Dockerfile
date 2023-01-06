FROM node:alpine
RUN set -eux; apk add --no-cache curl;
WORKDIR /app
ENV NODE_ENV=production
COPY package.json ./
COPY package-lock.json ./
COPY dist ./
COPY scripts ./scripts/
RUN npm -v
RUN npm i
RUN mkdir /data
RUN mkdir /config
CMD ["node", "index.js"]