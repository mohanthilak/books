FROM node:alpine

WORKDIR /usr/app

COPY package*.json .

RUN --mount=type=cache,target=/usr/app/.npm \
    npm set cache /usr/app/.npm && \
    npm ci 

COPY . .

EXPOSE 4000

CMD ["npm", "run", "start"]