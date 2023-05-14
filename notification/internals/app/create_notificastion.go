package app

import (
	"log"
	"net/http"
)

func (c ControllerStruct) CreateNotification(rw http.ResponseWriter, r *http.Request) {
	// s.
	log.Println("hahaha its finally working!")
	rw.WriteHeader(http.StatusOK)
	rw.Write([]byte("all good"))
}
