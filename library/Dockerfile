FROM node:alpine

WORKDIR /app/library

COPY package*.json .

RUN npm ci

COPY . .

EXPOSE 4002

CMD ["npm", "run", "dev"]