package main

import (
	"flag"

	"Notifications/API"
	"Notifications/API/Controller"
	"Notifications/MessageQueue"
)

func main() {
	listenAddr := flag.String("listenaddr", ":8000", "the server address")
	flag.Parse()

	queue := MessageQueue.NewMessageQueue()
	queue.ConsumeMessage()

	NotificationController := Controller.NewNotificationController()
	server := API.NewServer(*listenAddr, NotificationController)
	server.Start()
}
