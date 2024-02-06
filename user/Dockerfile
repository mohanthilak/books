FROM node:19.6-alpine

WORKDIR /usr/app

COPY package*.json .

RUN --mount=type=cache,target=/usr/app/.npm \
    npm set cache /usr/app/.npm && \
    npm ci 

USER node

COPY --chown=node:node ./src .

EXPOSE 4001

CMD ["npm", "run", "dev"]