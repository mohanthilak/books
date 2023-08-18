package API

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"time"

	"Notifications/API/Controller"

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
	s.Handler.HandleFunc("/trial", s.Controller.Trial)
	server := http.Server{
		Addr:         s.listenAddr,
		Handler:      s.Handler,
		ReadTimeout:  5 * time.Second,
		WriteTimeout: 10 * time.Second,
		IdleTimeout:  120 * time.Second,
	}

	//Starting the server
	go func() {
		log.Println("Starting the Server on Port " + s.listenAddr)
		err := server.ListenAndServe()
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
