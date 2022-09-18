FROM node

WORKDIR /app/user

COPY package.json .

RUN npm install

COPY . .

EXPOSE 4001

CMD ["npm", "run", "dev"]