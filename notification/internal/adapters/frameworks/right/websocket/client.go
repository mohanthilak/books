package websocket

import (
	"encoding/json"
	"log"
	"time"

	"github.com/gorilla/websocket"
)

var (
	PongWaitTime = 10 * time.Second
	PingInterval = PongWaitTime * 9 / 10
)

type ClientList map[string]*Client

type Client struct {
	clientID string
	conn     *websocket.Conn
	manager  *manager
	engres   chan Event
}

func newClient(conn *websocket.Conn, manager *manager, uid string) *Client {
	return &Client{
		conn:     conn,
		clientID: uid,
		manager:  manager,
		engres:   make(chan Event),
	}
}

func (c *Client) ReadMessage() {
	defer func() {
		c.manager.RemoveClient(c)
	}()

	if err := c.conn.SetReadDeadline(time.Now().Add(PongWaitTime)); err != nil {
		log.Println("Error while setting read deadling", err)
		return
	}

	c.conn.SetPongHandler(c.ClientPongHandler)
	c.conn.SetReadLimit(512)
	for {
		messageType, payload, err := c.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Println("Error while reading message", err)
			}
			break
		}
		log.Println(messageType, string(payload))

		// c.manager.Clients.
		var request Event
		if err := json.Unmarshal(payload, &request); err != nil {
			log.Println("Error while unmarshalling event", err)
		}

		c.manager.RouteEvents(request, c)
	}
}

func (c *Client) WriteMessage() {
	defer func() {
		c.manager.RemoveClient(c)
	}()

	tick := time.NewTicker(PingInterval)

	for {
		select {
		case message, ok := <-c.engres:
			{
				if !ok {
					if err := c.conn.WriteMessage(websocket.CloseMessage, nil); err != nil {
						log.Println("Connection already closed", err)
					}
					return
				}

				data, err := json.Marshal(message)
				if err != nil {
					log.Fatal("error while marshalling the Event")
				}
				if err := c.conn.WriteMessage(websocket.TextMessage, data); err != nil {
					log.Println("Failed to send the message", err)
				}
				log.Println("Message sent")
			}
		case <-tick.C:
			{
				log.Println("Ping")
				if err := c.conn.WriteMessage(websocket.PingMessage, []byte(``)); err != nil {
					log.Println("Unable to send Ping Message. Hence Closing the connection")
					return
				}
			}
		}
	}
}

func (c *Client) ClientPongHandler(s string) error {
	log.Println("Pong")
	return c.conn.SetReadDeadline(time.Now().Add(PongWaitTime))
}
