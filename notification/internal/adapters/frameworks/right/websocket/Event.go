package websocket

import "encoding/json"

type Event struct {
	// TYpe is for checking whether it is a notification or a chat message
	Type    string          `json:"type"`
	Payload json.RawMessage `json:"payload"`
}

type EventHandler func(event Event, c *Client) error
