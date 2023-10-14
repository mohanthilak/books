package websokcetserver

type WebSocketServerInterface interface {
	Start()
	SendMessage(string, string, []byte) error
}
