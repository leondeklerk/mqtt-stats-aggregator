FROM node:lts
RUN apk add --no-cache tzdata
ENV TZ=Europe/Amsterdam
WORKDIR /app
ENV NODE_ENV=production
COPY package.json ./
COPY dist ./
COPY scripts ./scripts/
RUN npm i
RUN mkdir /data
RUN mkdir /config
CMD ["node", "index.js"]