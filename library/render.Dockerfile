FROM node:19.6-alpine as build

WORKDIR /usr/app

COPY package*.json .

RUN --mount=type=cache,target=/usr/app/.npm \
    npm set cache /usr/app/.npm && \
    npm ci --omit=dev

COPY . .

RUN npm run build



FROM node:18-alpine

WORKDIR /usr/app

COPY package*.json .

RUN npm ci --omit=dev

COPY --from=build /usr/app/build /usr/app/build

COPY render.env /usr/app/

ENV NODE_ENV render

EXPOSE 10000

CMD ["npm", "run", "start"]
