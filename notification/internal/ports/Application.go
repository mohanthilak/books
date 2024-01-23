package ports

type ApplicationInterface interface {
	NotifyLender(NotifyLenderStruct) error
	GetUserDisplayNotificationsWithUserID(string) ([]NotifyLenderStruct, error)
}
