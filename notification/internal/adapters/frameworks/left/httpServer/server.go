package httpserver

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"os/signal"
	"time"

	"Notifications/internal/ports"
	"Notifications/internal/ports/httpserver"

	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
)

type RouteHandlerType func(w http.ResponseWriter, r *http.Request) error

type Adapter struct {
	addr               string
	router             *mux.Router
	razorPayRouter     *mux.Router
	notificationRouter *mux.Router
	app                ports.ApplicationInterface
}

func NewAdapter(router *mux.Router, addr string, app ports.ApplicationInterface) httpserver.HttpServerInterface {
	return &Adapter{
		router: router,
		addr:   addr,
		app:    app,
	}
}

func (adpt *Adapter) initiateRoutes() {

	//Testing Route
	adpt.router.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusAccepted)
		w.Header().Add("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]bool{"success": true})
	})

	adpt.razorPayRouter = adpt.router.PathPrefix("/razorpay").Subrouter()
	adpt.razorPayRouter.HandleFunc("/initiate-transaction", adpt.CreateHandler(adpt.InitiateTransaction)).Methods("POST")

	adpt.notificationRouter = adpt.router.PathPrefix("/notification").Subrouter()
	adpt.notificationRouter.HandleFunc("/{uid}", adpt.CreateHandler(adpt.GetUserNotifications)).Methods("GET")

}

func (adpt *Adapter) Start(rabbitMQCloseFunc func(), mongoDBCloseFunc func()) {
	adpt.initiateRoutes()

	server := http.Server{
		Addr:         "0.0.0.0:" + adpt.addr,
		Handler:      handlers.CORS(handlers.AllowedMethods([]string{"GET", "HEAD", "POST", "PUT", "OPTIONS"}), handlers.AllowCredentials(), handlers.AllowedHeaders([]string{"X-Requested-With", "Authorization", "Content-Type"}), handlers.AllowedOrigins([]string{"http://localhost:3000", "http://localhost:4000", "http://localhost:4001"}))(adpt.router),
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
			log.Panicf("Error running server: %s\nGracefully Ending the Server \n ", err)
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

	rabbitMQCloseFunc()
	mongoDBCloseFunc()

	//gracefully shutdown the server, waiting max 300 second for current operations to complete
	ctx, _ := context.WithTimeout(context.Background(), 30*time.Second)
	server.Shutdown(ctx)
}

func (A *Adapter) CreateHandler(controller RouteHandlerType) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		//call the controller
		if err := controller(w, r); err != nil {
			log.Println(err)
			clientError, ok := err.(*HttpErrorStruct)
			if !ok {
				A.WriteJSONResponse(w, 500, "server-error", nil)
				return
			}
			body := clientError.ResponseBody() // Try to get response body of ClientError.

			status, _ := clientError.ResponseHeaders() // Get http status code and headers.
			// for k, v := range headers {
			// 	w.Header().Set(k, v)
			// }
			log.Printf("body: %+v", body)
			A.WriteJSONResponse(w, status, body, nil)
		}
	}
}

func (A Adapter) WriteJSONResponse(w http.ResponseWriter, status int, v any, headers map[string]string) {

	if headers == nil {
		w.Header().Add("Content-Type", "application/json")
	} else {
		for k, v := range headers {
			w.Header().Set(k, v)
		}
	}

	w.WriteHeader(status)

	if v != nil {
		if err := json.NewEncoder(w).Encode(v); err != nil {
			log.Println("error while encoding json to the response:", err)
		}
	}

}
