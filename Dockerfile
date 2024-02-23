FROM node:lts
ENV TZ=Europe/Amsterdam
WORKDIR /app
ENV NODE_ENV=production
COPY package.json ./
COPY dist ./
RUN npm i
RUN mkdir /data
RUN mkdir /config
CMD ["node", "index.js"]