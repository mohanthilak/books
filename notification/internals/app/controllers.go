package app

import (
	"net/http"
	"notificationService/internals/service"
)

type ControllerInterface interface {
	CreateNotification(rw http.ResponseWriter, r *http.Request)
}

type ControllerStruct struct {
	Services *service.ServicesStruct
}

func NewController(services *service.ServicesStruct) *ControllerStruct {
	return &ControllerStruct{Services: services}
}
