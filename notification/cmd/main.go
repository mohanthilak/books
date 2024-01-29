package main

import (
	"flag"
	"log"

	httpserver "Notifications/internal/adapters/frameworks/left/httpServer"
	MessageQueue "Notifications/internal/adapters/frameworks/left/messageQueue"
	payments "Notifications/internal/adapters/frameworks/right/Payments"
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
	RazorpayAPIKey := viper.Get("RAZORPAY_API_KEY").(string)
	RazorpayKeySecret := viper.Get("RAZORPAY_KEY_SECRET").(string)

	// Fetching the PORT NUMBER from the CLI
	listenAddr := flag.String("port", DefaultPort, "the server address")
	flag.Parse()

	router := mux.NewRouter()
	socketServerAdapter := websocket.NewAdapter(router)
	socketServerAdapter.Start()

	//MongoDB
	MongoAdapter := database.NewAdapter(MongoURI)
	MongoAdapter.MakeConnection()

	//Payments
	PaymentsAdapter := payments.NewAdapter(RazorpayAPIKey, RazorpayKeySecret)

	app := applicationAPI.New(socketServerAdapter, MongoAdapter, PaymentsAdapter)
	messageQueueAdapter := MessageQueue.NewAdapter(RabbitMQ_URL, app)
	go messageQueueAdapter.MakeConnection()

	httpServerAdapter := httpserver.NewAdapter(router, *listenAddr, app)
	httpServerAdapter.Start(messageQueueAdapter.CloseConnection, MongoAdapter.CloseConnection)
}
