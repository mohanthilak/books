package MessageQueue

import (
	"Notifications/internal/ports"
	"encoding/json"
	"log"
)

func trialHandler(body json.RawMessage, app ports.ApplicationInterface) (bool, error) {
	log.Println(string(body))
	return true, nil
}

func notifyLenderHandler(body json.RawMessage, app ports.ApplicationInterface) (bool, error) {
	var data ports.NotifyLenderStruct
	if err := json.Unmarshal(body, &data); err != nil {
		log.Println("Error while converting queue data from json")
	}

	if err := app.NotifyLender(data); err != nil {
		return false, err
	}
	return true, nil
}
