package database

import (
	"Notifications/internal/ports"
	"context"
	"testing"
)

var mongoAdapter = NewAdapter("mongodb://127.0.0.1:27017/test-books-Notification", "test-books-Notification")
var notificationObject = &ports.NotifyLenderStruct{
	Type:        "in-app",
	Operation:   "notify-lender",
	FromService: "user-service",
	Message:     "you have a borrow request",
	Recipient:   "123",
	RelatedUser: "321",
	RequestID:   "4312",
	Timestamp:   123321,
	Display:     true,
}

func TestA_InsertBorrowReturnRequest(t *testing.T) {
	t.Log("testing get insert request")

	mongoAdapter.MakeConnection()
	err := mongoAdapter.InsertBorrowReturnRequest(notificationObject)
	if err != nil {
		t.Fatal("failed to insert notification object into the db: ", err)
	}

	if notificationObject.ID == "" {
		t.Error("failed to appened id after insertion:", err)
	}
}

func TestA_GetUserDisplayNotifications(t *testing.T) {
	t.Cleanup(func() {
		if err := mongoAdapter.notificationCollection.Drop(context.TODO()); err != nil {
			t.Log("could not drop the DB", err)
		}
	})
	mongoAdapter.MakeConnection()

	t.Log("testing get request")

	notifications, err := mongoAdapter.GetUserDisplayNotifications(notificationObject.Recipient)
	if err != nil {
		t.Fatal("failed to query the db: ", err)
	}

	if len(notifications) == 0 {
		t.Error("gave an empty slice of notification while it should have 1 notification")
	}

	if len(notifications) > 1 {
		t.Error("gave more than 1 notification while it should have only 1")
	}

	if notifications[0].Type != notificationObject.Type || notifications[0].Operation != notificationObject.Operation || notifications[0].FromService != notificationObject.FromService || notifications[0].Message != notificationObject.Message || notifications[0].Recipient != notificationObject.Recipient || notifications[0].RelatedUser != notificationObject.RelatedUser || notifications[0].RequestID != notificationObject.RequestID || notifications[0].Timestamp != notificationObject.Timestamp || notifications[0].Display != notificationObject.Display {
		t.Error("original document and stored document do not match: ", notificationObject, "  ", notifications[0])
	}
}
