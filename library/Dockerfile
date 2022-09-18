FROM node

WORKDIR /app/library

COPY package.json .

RUN npm install

COPY . .

EXPOSE 4002

CMD ["npm", "run", "dev"]