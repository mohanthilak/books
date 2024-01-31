FROM golang:latest as build

WORKDIR /app

COPY go.mod go.sum ./

RUN --mount=type=cache,target=go/pkg/mod \
    --mount=type=cache,target=/root/.cache/go-build \
    go mod download

COPY . .

RUN go build \
    -ldflags="-linkmode external -extldflags -static" \
    -tags netgo \
    -o notification-service


FROM scratch

COPY --from=build /etc/ssl/certs /etc/ssl/certs

COPY --from=build /app/notification-service notification-service

COPY dev.docker.env dev.docker.env

EXPOSE 8000

CMD [ "/notification-service" ]