package database

import (
	"context"
	"fmt"
	"log"
	"strings"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Adapter struct {
	mongoURI               string
	client                 *mongo.Client
	notificationCollection *mongo.Collection
	DBName                 string
}

func NewAdapter(uri, dbName string) *Adapter {
	return &Adapter{mongoURI: uri, DBName: dbName}
}

func (A *Adapter) MakeConnection() {
	client, err := mongo.Connect(context.TODO(), options.Client().ApplyURI(A.mongoURI))
	if err != nil {
		panic(err)
	}
	A.client = client

	A.notificationCollection = A.client.Database(A.DBName).Collection("LibraryNotification")
}

func askDeleteDB() bool {
	var input string

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)

	go func() {
		defer cancel()
		fmt.Printf("\nDo you want to Delete the DB [y/n]?:")
		fmt.Scanf("%s", &input)
	}()
	<-ctx.Done()
	if input == "" {
		input = "n"
	}

	log.Printf("\nYour input is %s", input)
	switch strings.ToLower(input) {
	case "y":
		return true
	case "n":
		return false
	}
	fmt.Println("invalid keypress, it does not match a boolean")
	return false
}

func (A *Adapter) CloseConnection() {
	log.Println("Closing MongoDB Connection")
	if t := askDeleteDB(); t {
		log.Println("Deleting DB")
		A.client.Database("BookAppNotification").Collection("LibraryNotification").Drop(context.Background())
	}
	if err := A.client.Disconnect(context.TODO()); err != nil {
		panic(err)
	}
}
