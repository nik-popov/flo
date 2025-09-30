# syntax=docker/dockerfile:1

FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json ./
RUN npm install

COPY . ./

# Allow the API base URL to be customized at build time
ARG VITE_API_BASE_URL="https://flo-363950012349.us-east4.run.app/api"
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

RUN npm run build

FROM nginx:1.27-alpine AS runtime
ENV NODE_ENV=production

# Copy compiled assets from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Replace the default Nginx site configuration so we listen on port 8080
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
