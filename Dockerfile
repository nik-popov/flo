# syntax=docker/dockerfile:1

FROM node:20-alpine AS base
WORKDIR /app

# Install production dependencies
COPY server/package.json ./package.json
RUN npm install --omit=dev

# Copy application source
COPY server ./

ENV NODE_ENV=production
ENV PORT=4000
EXPOSE 4000

CMD ["node", "index.js"]
