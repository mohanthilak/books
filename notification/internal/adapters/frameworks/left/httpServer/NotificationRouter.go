package httpserver

import (
	"errors"
	"net/http"

	"github.com/gorilla/mux"
)

func (A Adapter) GetUserNotifications(w http.ResponseWriter, r *http.Request) error {
	uid := mux.Vars(r)["uid"]
	notifications, err := A.app.GetUserDisplayNotificationsWithUserID(uid)
	if err != nil {
		return newClientHTTPError(500, errors.New("server-error"))
	}
	data := map[string]interface{}{
		"success": true,
		"data":    notifications,
		"error":   nil,
	}

	A.WriteJSONResponse(w, http.StatusOK, data, map[string]string{"Access-Control-Allow-Credentials": "true"})
	return nil
}
