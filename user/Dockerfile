FROM node:alpine

WORKDIR /app/user

COPY package*.json .

RUN npm ci

COPY . .

EXPOSE 4001

CMD ["npm", "run", "dev"]