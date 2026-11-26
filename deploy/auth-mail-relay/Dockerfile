FROM node:22-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force
COPY relay.mjs server.mjs ./
USER node
EXPOSE 2525
CMD ["node", "server.mjs"]
