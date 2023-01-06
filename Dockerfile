FROM node:19-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package.json ./
COPY package-lock.json ./
COPY dist ./
COPY scripts ./scripts/
RUN node -v
RUN npm -v
RUN npm ci --omit=dev
RUN mkdir /data
RUN mkdir /config
CMD ["node", "index.js"]