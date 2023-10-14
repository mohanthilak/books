package websocket

import (
	"errors"
	"sync"
)

type manager struct {
	Clients ClientList
	sync.RWMutex
	handlers map[string]EventHandler
}

func MakeManager() *manager {
	m := &manager{
		Clients:  make(ClientList),
		handlers: make(map[string]EventHandler),
	}
	m.SetUpHandlers()
	return m
}

func (M *manager) SetUpHandlers() {
}

func (M *manager) RouteEvents(event Event, client *Client) error {
	if handler, ok := M.handlers[event.Type]; ok {
		if err := handler(event, client); err != nil {
			return err
		}
		return nil
	} else {
		return errors.New("no such route handler")
	}
}

func (M *manager) AddClient(c *Client) {
	M.Lock()
	defer M.Unlock()

	M.Clients[c.clientID] = c
}

func (M *manager) RemoveClient(c *Client) {
	M.Lock()
	defer M.Unlock()

	if _, ok := M.Clients[c.clientID]; ok {
		c.conn.Close()
		delete(M.Clients, c.clientID)
	}
}
