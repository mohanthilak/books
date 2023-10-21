package database

import (
	"context"
	"fmt"
	"log"
	"strings"
	"time"

	"Notifications/internal/ports"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Adapter struct {
	mongoURI string
	client   *mongo.Client
}

func NewAdapter(uri string) *Adapter {
	return &Adapter{mongoURI: uri}
}

func (A *Adapter) MakeConnection() {
	client, err := mongo.Connect(context.TODO(), options.Client().ApplyURI(A.mongoURI))
	if err != nil {
		panic(err)
	}
	A.client = client
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

func (A *Adapter) InsertBorrowReturnRequest(obj *ports.NotifyLenderStruct) error {
	coll := A.client.Database("BookAppNotification").Collection("LibraryNotification")
	result, err := coll.InsertOne(context.TODO(), obj)
	if err != nil {
		log.Fatal("Error while inserting document to Notification collection", err)
		return err
	}
	id := result.InsertedID.(primitive.ObjectID).Hex()
	obj.ID = id
	return nil
}
