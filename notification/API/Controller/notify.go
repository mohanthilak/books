package Controller

import (
	"log"
	"net/http"
)

type INotificationController interface {
	Trial(w http.ResponseWriter, r *http.Request)
	// SetNotification(w http.ResponseWriter, r *http.Request)
	// GetNotificationByID(w http.ResponseWriter, r *http.Request)
	// GetUserUnreadNotifications(w http.ResponseWriter, r *http.Request)
	// GetUserReadNotifications(w http.ResponseWriter, r *http.Request)
}

type NotificationController struct{}

func NewNotificationController() *NotificationController {
	return &NotificationController{}
}

func (NC *NotificationController) Trial(w http.ResponseWriter, r *http.Request) {
	log.Println(r.URL.Path)
	WriteJSON(w, http.StatusOK, "Request Reached mf")
}
