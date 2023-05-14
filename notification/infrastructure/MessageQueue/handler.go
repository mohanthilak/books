package MessageQueue

import (
	"encoding/json"
	"log"
)

type dataStruct struct {
	UserId      string `json:"userId"`
	Time_issued string `json:"timeIssued"`
	Priority    string `json:"priority"`
	Operation   string `json:"operation"`
	Message     string `json:"message"`
}

type MessageStruct struct {
	FromService        string     `json:"fromService"`
	TypeOfNotification string     `json:"typeOfNotification"`
	Body               dataStruct `json:"body"`
}

func (ms *MessageStruct) convertFromJSON(msg []byte) {
	err := json.Unmarshal(msg, &ms)
	FailOnError(err, "Error while unmarshaling JSON")
	log.Println(ms)
	log.Println(ms.FromService)
}
func (MS *MessageStruct) ReceiveMessage(msg []byte) {
	MS.convertFromJSON(msg)

}
