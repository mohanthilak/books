package main

import (
	"flag"
	"log"
	"os"

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
	environment := os.Getenv("ENVIRONMENT")
	log.Println("Environment: ", environment)

	if environment == "dev" {
		viper.SetConfigFile(".env")
	} else if environment == "dockerDev" {
		viper.SetConfigFile("dev.docker.env")
	}

	var RabbitMQ_URL, DefaultPort, MongoURI, DBName string
	if environment == "github" {
		RabbitMQ_URL = os.Getenv("RabbitMQ_URL")
		DefaultPort = os.Getenv("DefaultPort")
		MongoURI = os.Getenv("MongoURI")
		DBName = os.Getenv("DBName")
	} else {
		err := viper.ReadInConfig()
		if err != nil {
			log.Fatal("Unable to read ENV File", err)
		}

		RabbitMQ_URL = viper.Get("RABBITMQ_URL").(string)
		DefaultPort = viper.Get("PORT").(string)
		MongoURI = viper.Get("MONGO_URI").(string)
		DBName = viper.Get("DB_NAME").(string)
	}
	// RazorpayAPIKey := viper.Get("RAZORPAY_API_KEY").(string)
	// RazorpayKeySecret := viper.Get("RAZORPAY_KEY_SECRET").(string)

	log.Println("queue:", RabbitMQ_URL, " mongo:", MongoURI)

	// Fetching the PORT NUMBER from the CLI
	listenAddr := flag.String("port", DefaultPort, "the server address")
	flag.Parse()

	router := mux.NewRouter()
	socketServerAdapter := websocket.NewAdapter(router)
	socketServerAdapter.Start()

	//MongoDB
	MongoAdapter := database.NewAdapter(MongoURI, DBName)
	MongoAdapter.MakeConnection()

	//Payments
	PaymentsAdapter := payments.NewAdapter("RazorpayAPIKey", "RazorpayKeySecret")

	app := applicationAPI.New(socketServerAdapter, MongoAdapter, PaymentsAdapter)
	messageQueueAdapter := MessageQueue.NewAdapter(RabbitMQ_URL, app)
	go messageQueueAdapter.MakeConnection()

	httpServerAdapter := httpserver.NewAdapter(router, *listenAddr, app)
	httpServerAdapter.Start(messageQueueAdapter.CloseConnection, MongoAdapter.CloseConnection)
}
