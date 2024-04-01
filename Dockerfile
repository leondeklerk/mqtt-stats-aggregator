FROM oven/bun
ENV TZ=Europe/Amsterdam
WORKDIR /app
ENV NODE_ENV=production
COPY package.json ./
COPY dist ./
COPY scripts ./scripts/
RUN bun install
RUN mkdir /data
RUN mkdir /config
CMD ["bun", "run", "index.js"]