package API

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"time"

	"Notifications/API/Controller"

	socketio "github.com/googollee/go-socket.io"
	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
)

type Server struct {
	listenAddr string
	Handler    *mux.Router
	Controller Controller.INotificationController
}

func NewServer(listenAddr string, Controller Controller.INotificationController) *Server {
	return &Server{
		listenAddr: "127.0.0.1" + listenAddr,
		Handler:    mux.NewRouter(),
		Controller: Controller,
	}
}

func (s *Server) Start() {
	ser := socketio.NewServer(nil)

	ser.OnConnect("/", func(s socketio.Conn) error {
		log.Println("lkjadslfjlajflasdkjfdklasjflakfjlkasfjalksfjalkfjalkj")
		s.SetContext("")
		log.Println("connected:", s.ID())
		s.Emit("connection", "connected")
		return nil
	})
	ser.OnEvent("hi", "hello", func(s socketio.Conn, msg string) {
		fmt.Println("notice:", msg)
		s.Emit("reply", "have "+msg)
	})
	ser.OnDisconnect("/", func(s socketio.Conn, reason string) {
		log.Println("closed", reason, s.Context())
	})
	go func() {
		log.Println("yeyeyeyeyyeyeyeyeyhuhuhuhu")
		err := ser.Serve()
		if err != nil {
			log.Fatal("ERRRORRRR!!!!", err)
		}
	}()
	defer ser.Close()
	// defer ser.Close()

	s.Handler.Handle("/socket.io/", ser)
	s.Handler.HandleFunc("/trial", s.Controller.Trial)
	server := http.Server{
		Addr:         s.listenAddr,
		Handler:      handlers.CORS(handlers.AllowCredentials(), handlers.AllowedOrigins([]string{"*"}))(s.Handler),
		ReadTimeout:  5 * time.Second,
		WriteTimeout: 10 * time.Second,
		IdleTimeout:  120 * time.Second,
	}

	//Starting the server
	go func() {
		log.Println("Starting the Server on Port " + s.listenAddr)
		err := server.ListenAndServe()
		// http.ListenAndServe(":8000", handlers.CORS(handlers.AllowedOrigins([]string{"*"}))(s.Handler))
		if err != nil {
			log.Panicf("Error starting server: %s\nGracefully Ending the Server \n ", err)
			os.Exit(1)
		}

	}()

	//for graceful shutdown
	//trap sigterm or interupt and gracefully shutdown the server
	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt)
	signal.Notify(c, os.Kill)

	//Block until a signal is received
	sig := <-c
	log.Println("Got Signal", sig)

	//gracefully shutdown the server, waiting max 300 second for current operations to complete
	ctx, _ := context.WithTimeout(context.Background(), 30*time.Second)
	server.Shutdown(ctx)
}
