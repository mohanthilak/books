package ports

type ApplicationInterface interface {
	NotifyLender(NotifyLenderStruct) error
	GetUserDisplayNotificationsWithUserID(string) ([]NotifyLenderStruct, error)
	InitiateTransaction(int32, string) (map[string]interface{}, error)
}
