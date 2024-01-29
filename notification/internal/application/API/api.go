package applicationAPI

import (
	"Notifications/internal/ports"
	websokcetserver "Notifications/internal/ports/websocketserver"
	"encoding/json"
	"log"
)

type Application struct {
	socket   websokcetserver.WebSocketServerInterface
	DB       ports.DBInterface
	payments ports.PaymentsInterface
}

func New(socket websokcetserver.WebSocketServerInterface, DB ports.DBInterface, payments ports.PaymentsInterface) *Application {
	return &Application{
		socket:   socket,
		DB:       DB,
		payments: payments,
	}
}

func (app *Application) NotifyLender(data ports.NotifyLenderStruct) error {
	app.DB.InsertBorrowReturnRequest(&data)

	//Sending Message to Lender
	JSONData, err := json.Marshal(data)
	if err != nil {
		log.Println("Error while Marshalling JSON", err)
	} else {
		if err = app.socket.SendMessage(data.Recipient, "Notification", JSONData); err != nil {
			log.Println("could not send notification")
		}
	}

	return nil
}

func (app *Application) GetUserDisplayNotificationsWithUserID(uid string) ([]ports.NotifyLenderStruct, error) {
	return app.DB.GetUserDisplayNotifications(uid)
}

func (app *Application) InitiateTransaction(amount int32, receipt string) (map[string]interface{}, error) {
	return app.payments.CreateOrder(50000, "123321")
}
