package main

import (
	"flag"

	httpserver "Notifications/internal/adapters/frameworks/left/httpServer"
	MessageQueue "Notifications/internal/adapters/frameworks/left/messageQueue"
	"Notifications/internal/adapters/frameworks/right/websocket"
	applicationAPI "Notifications/internal/application/API"
	HttpServerPort "Notifications/internal/ports/httpserver"
	websokcetserver "Notifications/internal/ports/websocketserver"

	"github.com/gorilla/mux"
)

func main() {
	var httpServerAdapter HttpServerPort.HttpServerInterface
	var socketServerAdapter websokcetserver.WebSocketServerInterface

	listenAddr := flag.String("listenaddr", ":8000", "the server address")
	flag.Parse()
	router := mux.NewRouter()

	socketServerAdapter = websocket.NewAdapter(router)
	socketServerAdapter.Start()

	app := applicationAPI.New(socketServerAdapter)
	messageQueueAdapter := MessageQueue.NewAdapter("amqps://xpzfimfo:r9awQJBvXonsgv7YtXAgolBly1BrlwIf@puffin.rmq2.cloudamqp.com/xpzfimfo", app)
	go messageQueueAdapter.MakeConnection()

	httpServerAdapter = httpserver.NewAdapter(router, *listenAddr)
	httpServerAdapter.Start()
}

// queue := MessageQueue.NewMessageQueue()
// go queue.ConsumeMessage()

// NotificationController := Controller.NewNotificationController()
// server := API.NewServer(*listenAddr, NotificationController)
// server.Start()
