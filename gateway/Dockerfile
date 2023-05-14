FROM node:alpine

WORKDIR /app/gateway

COPY package*.json .

RUN npm ci

COPY . .

EXPOSE 4000

CMD ["npm", "run", "start"]