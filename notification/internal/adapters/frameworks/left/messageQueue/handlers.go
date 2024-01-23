package MessageQueue

import (
	"Notifications/internal/ports"
	"encoding/json"
	"log"
)

func trialHandler(body message, app ports.ApplicationInterface) bool {
	log.Println(body)
	return true
}

func notifyLenderHandler(body message, app ports.ApplicationInterface) bool {
	var data ports.RequestNotifyLenderStruct
	if err := json.Unmarshal(body.Data, &data); err != nil {
		log.Println("Error while converting queue data from json")
	}
	notifyLenderMessageData := *&ports.NotifyLenderStruct{
		Type:        data.Type,
		Operation:   body.Operation,
		FromService: body.FromService,
		Message:     data.Message.Data,
		Recipient:   data.Message.Lender,
		RelatedUser: data.Message.RelatedUser.User,
		RequestID:   data.Message.RelatedUser.RequestID,
		Timestamp:   int32(data.Message.RelatedUser.Timestamp),
		Display:     true,
	}
	if err := app.NotifyLender(notifyLenderMessageData); err != nil {
		log.Fatal("error at notify lender handler", err)
		return false
	}
	return true
}
