package main

import (
	"flag"
	"log"

	httpserver "Notifications/internal/adapters/frameworks/left/httpServer"
	MessageQueue "Notifications/internal/adapters/frameworks/left/messageQueue"
	"Notifications/internal/adapters/frameworks/right/database"
	"Notifications/internal/adapters/frameworks/right/websocket"
	applicationAPI "Notifications/internal/application/API"

	"github.com/gorilla/mux"
	"github.com/spf13/viper"
)

func main() {
	// Setting Up Environment variables
	viper.SetConfigFile(".env")
	err := viper.ReadInConfig()
	if err != nil {
		log.Fatal("Unable to read ENV File", err)
	}
	RabbitMQ_URL := viper.Get("RABBITMQ_URL").(string)
	DefaultPort := viper.Get("PORT").(string)
	MongoURI := viper.Get("MONGO_URI").(string)

	// Fetching the PORT NUMBER from the CLI
	listenAddr := flag.String("port", DefaultPort, "the server address")
	flag.Parse()

	router := mux.NewRouter()
	socketServerAdapter := websocket.NewAdapter(router)
	socketServerAdapter.Start()

	//MongoDB
	MongoAdapter := database.NewAdapter(MongoURI)
	MongoAdapter.MakeConnection()

	app := applicationAPI.New(socketServerAdapter, MongoAdapter)
	messageQueueAdapter := MessageQueue.NewAdapter(RabbitMQ_URL, app)
	go messageQueueAdapter.MakeConnection()

	httpServerAdapter := httpserver.NewAdapter(router, *listenAddr)
	httpServerAdapter.Start(messageQueueAdapter.CloseConnection, MongoAdapter.CloseConnection)
}
