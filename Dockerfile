FROM node:19-alpine
WORKDIR /app
COPY package.json ./
COPY package-lock.json ./
RUN npm pkg delete scripts.prepare
RUN npm ci
COPY . .
RUN npm run build

FROM node:19-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package.json ./
COPY package-lock.json ./
RUN npm pkg delete scripts.prepare
RUN npm ci
COPY --from=0 /app/dist .
CMD ["node", "index.js"]
