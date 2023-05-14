package main

import (
	"context"
	"log"
	"net/http"
	"notificationService/api"
	"notificationService/infrastructure/DataStore"
	"notificationService/infrastructure/MessageQueue"
	"notificationService/internals/app"
	"notificationService/internals/repository"
	"notificationService/internals/service"

	"os"
	"os/signal"
	"time"

	"github.com/gorilla/mux"
)

func main() {
	sm := mux.NewRouter()

	MessageQueue.ConnectMessageQueue("amqps://mrefwkxt:7a63eI5iVqdd5HRtOEwH6V7ZKE3HvvrU@puffin.rmq2.cloudamqp.com/mrefwkxt")
	db := DataStore.ConnectDB("root:miawallace@tcp(127.0.0.1:3306)/notification_service")

	dao := repository.NewDao(db)
	inAppNotificationService := service.NewInAppNotificationService(dao)

	services := service.AggregateServices(inAppNotificationService)
	controllers := app.NewController(services)

	api.AssignAPItools(controllers, sm)

	server := http.Server{
		Addr:         "127.0.0.1:8000",
		Handler:      sm,
		ReadTimeout:  5 * time.Second,
		WriteTimeout: 10 * time.Second,
		IdleTimeout:  120 * time.Second,
	}

	//Starting the server
	go func() {
		log.Println("Starting the Server on Port: 8000")
		err := server.ListenAndServe()
		if err != nil {
			log.Panicf("Error starting server: %s\nGracefully Ending the Server \n ", err)
			os.Exit(1)
		}

	}()

	//for graceful shutdown
	//trap sigterm or interupt and gracefully shutdown the server
	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt)
	signal.Notify(c, os.Kill)

	//Block until a signal is received
	sig := <-c
	log.Println("Got Signal", sig)

	//gracefully shutdown the server, waiting max 300 second for current operations to complete
	ctx, _ := context.WithTimeout(context.Background(), 30*time.Second)
	server.Shutdown(ctx)
}
