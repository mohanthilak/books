package dto

type InAppNotification struct {
	UserID         string `json:"userId"`
	Time_issued    string `json:"timeIssued"`
	Priority       string `json:"priority"`
	Operation      string `json:"operation"`
	NotificationID string `json:"notificationId"`
	TimeReceived   string `json:"timeReceived"`
	Message        string `json:"message"`
}
