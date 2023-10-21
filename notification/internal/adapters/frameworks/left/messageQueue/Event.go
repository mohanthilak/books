package MessageQueue

import (
	"Notifications/internal/ports"
	"encoding/json"
)

type message struct {
	Operation   string          `json:"operation"`
	FromService string          `json:"fromService"`
	Data        json.RawMessage `json:"data"`
}

type messageHandler func(message, ports.ApplicationInterface) bool
