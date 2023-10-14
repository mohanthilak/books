package WebSocket

import (
	"log"

	socketio "github.com/googollee/go-socket.io"
)

func NewSocketSever() *socketio.Server {
	server := socketio.NewServer(nil)
	server.OnConnect("/", func(s socketio.Conn) error {
		s.SetContext("")
		log.Println("connected:", s.ID())
		return nil
	})

	server.OnEvent("/", "notice", func(s socketio.Conn, msg string) {
		log.Println("notice:", msg)
		s.Emit("reply", "have "+msg)
	})

	go server.Serve()
	return server
}
