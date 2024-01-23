package websocket

import (
	"errors"
	"log"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

type Adapter struct {
	router  *mux.Router
	manager *manager
}

func NewAdapter(router *mux.Router) *Adapter {
	return &Adapter{
		router:  router,
		manager: MakeManager(),
	}
}

func (adpt *Adapter) Start() {
	adpt.router.HandleFunc("/ws/{uid}", adpt.handleSocketRoute)
	// adpt.router.HandleFunc("/trial", func(w http.ResponseWriter, r *http.Request) {
	// 	log.Println("New Connection")

	// 	w.WriteHeader(http.StatusOK)
	// 	w.Header().Add("Content-Type", "application/json")
	// 	json.NewEncoder(w).Encode(map[string]any{"success": true, "data": "Message Received", "error": nil})

	// })
}

func (adpt Adapter) handleSocketRoute(w http.ResponseWriter, r *http.Request) {
	log.Println("New Connection")

	// Currently it's set to all origin, need to fetch the domain from the request and move forward accordingly
	upgrader.CheckOrigin = func(r *http.Request) bool {
		return true
	}

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("failed to upgrade connection to full duplex")
	}

	// Currently uid is hardcoded to "123", need to fetch the userID from the requeset.
	client := newClient(conn, adpt.manager, "123")
	adpt.manager.AddClient(client)

	go client.ReadMessage()
	go client.WriteMessage()
}

func (adpt Adapter) CheckAvailable(clinetID string) bool {
	if _, ok := adpt.manager.Clients[clinetID]; ok {
		return true
	}
	return false
}

func (adpt *Adapter) SendMessage(clientID, msgType string, mes []byte) error {
	if isOnline := adpt.CheckAvailable(clientID); !isOnline {
		log.Printf("User: %s Offline", clientID)
		return errors.New("user offline")
	}
	event := Event{
		Type:    msgType,
		Payload: mes,
	}
	log.Printf("%+v", adpt.manager)
	adpt.manager.Clients["123"].engres <- event
	return nil
}
