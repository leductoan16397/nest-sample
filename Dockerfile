FROM node:lts-alpine3.18
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
WORKDIR /var/www/app
COPY package*.json ./
COPY pm2.json ./
COPY node_modules ./node_modules
COPY dist ./dist
RUN npm install pm2@latest -g
RUN ls -al
EXPOSE 1321