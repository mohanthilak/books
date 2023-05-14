package api

func inappNotificationRoutes(ah *ApiHandler) {
	ah.r.HandleFunc("/inapptrial", ah.app.CreateNotification).Methods("GET")
}
