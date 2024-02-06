package database

import (
	"Notifications/internal/ports"
	"context"
	"log"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func (A *Adapter) InsertBorrowReturnRequest(obj *ports.NotifyLenderStruct) error {
	result, err := A.notificationCollection.InsertOne(context.TODO(), obj)
	if err != nil {
		log.Fatal("Error while inserting document to Notification collection", err)
		return err
	}
	id := result.InsertedID.(primitive.ObjectID).Hex()
	obj.ID = id
	return nil
}

func (A *Adapter) GetUserDisplayNotifications(userID string) ([]ports.NotifyLenderStruct, error) {
	filter := bson.D{{"recipient", userID}, {"display", true}}
	cursor, err := A.notificationCollection.Find(context.TODO(), filter)
	if err != nil {
		log.Println("error while fetching user notifications form the DB", err)
	}
	var result []ports.NotifyLenderStruct
	if err = cursor.All(context.TODO(), &result); err != nil {
		log.Println("error while converting mongo notifications cursor to struct array elements", err)
		return nil, nil
	}
	return result, nil
}
