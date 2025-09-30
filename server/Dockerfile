# syntax=docker/dockerfile:1

FROM node:20-alpine AS base
WORKDIR /app

# Install only production dependencies
COPY package.json ./package.json
RUN npm install --omit=dev

# Copy the rest of the API source
COPY . ./

ENV NODE_ENV=production
ENV PORT=4000
EXPOSE 4000

CMD ["node", "index.js"]
