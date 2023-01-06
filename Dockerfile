FROM node:lts-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package.json ./
COPY package-lock.json ./
COPY dist ./
COPY scripts ./scripts/
RUN npm ci --omit=dev
RUN mkdir /data
RUN mkdir /config
CMD ["node", "index.js"]