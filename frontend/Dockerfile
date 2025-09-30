# syntax=docker/dockerfile:1

FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . ./

# Allow the API base URL to be customized at build time
ARG VITE_API_BASE_URL="https://flo-363950012349.us-east4.run.app"
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /app

RUN apk add --no-cache gettext \
	&& npm install -g serve@14.2.1

# Copy compiled assets from the builder stage
COPY --from=builder /app/dist /app

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ARG VITE_API_BASE_URL="https://flo-363950012349.us-east4.run.app"
ENV NODE_ENV=production
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV PORT=8080

EXPOSE 8080

ENTRYPOINT ["/entrypoint.sh"]
