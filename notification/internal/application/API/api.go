package applicationAPI

import (
	"Notifications/internal/ports"
	websokcetserver "Notifications/internal/ports/websocketserver"
	"encoding/json"
	"log"
)

type Application struct {
	socket websokcetserver.WebSocketServerInterface
}

// func Newwwww() *Application {
// 	return &Application{}
// }

func New(socket websokcetserver.WebSocketServerInterface) *Application {
	return &Application{
		socket: socket,
	}
}

func (app *Application) NotifyLender(data ports.NotifyLenderStruct) error {

	type responseStruct struct {
		Message   string
		TimeStamp int64
	}
	response := responseStruct{
		Message:   data.Message.Data,
		TimeStamp: data.Message.RelatedUsers.Timestamp,
	}
	jsonResponse, err := json.Marshal(response)
	if err != nil {
		return err
	}
	log.Println("data:", data)
	return app.socket.SendMessage("123", "Notification", jsonResponse)
}
