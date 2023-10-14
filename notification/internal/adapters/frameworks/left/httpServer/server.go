package httpserver

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"os/signal"
	"time"

	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
)

type Adapter struct {
	router *mux.Router
	addr   string
}

func NewAdapter(router *mux.Router, addr string) *Adapter {
	return &Adapter{
		router: router,
		addr:   addr,
	}
}

func (adpt *Adapter) initiateRoutes() {
	adpt.router.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusAccepted)
		w.Header().Add("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]bool{"success": true})
	})
}

func (adpt Adapter) Start() {
	adpt.initiateRoutes()
	server := http.Server{
		Addr:         "127.0.0.1:8000",
		Handler:      handlers.CORS(handlers.AllowCredentials(), handlers.AllowedOrigins([]string{"*"}))(adpt.router),
		ReadTimeout:  5 * time.Second,
		WriteTimeout: 10 * time.Second,
		IdleTimeout:  120 * time.Second,
	}

	//Starting the server
	go func() {
		log.Println("Starting the Server on Port " + adpt.addr)
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
