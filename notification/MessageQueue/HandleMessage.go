package MessageQueue

import (
	"Notifications/Types"
	"encoding/json"
	"log"
)

func HandleMessageFromQueue(queueData []byte) bool {
	var extractedData Types.MessageQueueStruct
	err := json.Unmarshal(queueData, &extractedData)

	if err != nil {
		log.Println("Can;t unmarshal the byte array")
		return false
	}

	log.Println(extractedData.FromService)
	log.Println(extractedData.Operation)
	log.Println(extractedData.Data.Type)
	return true
}
