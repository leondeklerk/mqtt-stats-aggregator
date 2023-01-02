FROM node:latest
RUN apt-get update && apt-get -y install python
WORKDIR /app
COPY package.json ./
COPY package-lock.json ./
ENV NODE_ENV=production
RUN npm install
COPY . .
RUN npm run build
CMD ["npm", "run", "start"]



