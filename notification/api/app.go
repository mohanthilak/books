package api

import (
	"notificationService/internals/app"

	"github.com/gorilla/mux"
)

type ApiHandler struct {
	app *app.ControllerStruct
	r   *mux.Router
}

var ah ApiHandler

func AssignAPItools(app *app.ControllerStruct, r *mux.Router) {
	ah.app = app
	ah.r = r
	inappNotificationRoutes(&ah)
}
