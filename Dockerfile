# syntax=docker/dockerfile:1

FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM deps AS dev
COPY . .
EXPOSE 8080
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "8080"]

FROM deps AS build
COPY . .
ARG VITE_API_URL=http://localhost:8000
ARG VITE_APP_NAME=Universitet Navigatsiya Tizimi
ARG VITE_ENV=production
ARG VITE_ENABLE_DEBUG=false
ARG VITE_STORAGE_KEY=change-this-to-random-string-in-production
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_APP_NAME=${VITE_APP_NAME}
ENV VITE_ENV=${VITE_ENV}
ENV VITE_ENABLE_DEBUG=${VITE_ENABLE_DEBUG}
ENV VITE_STORAGE_KEY=${VITE_STORAGE_KEY}
RUN npm run build

FROM nginx:1.27-alpine AS prod
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
