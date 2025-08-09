# Build Stage
FROM node:20 AS build

WORKDIR /app 

COPY package.json package-lock.json ./


RUN npm install

RUN npm run build


COPY . .

# Production Stage
FROM nginx:stable-alpine

COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]