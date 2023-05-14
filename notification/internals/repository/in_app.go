package repository

type InappNotificationQuery interface {
	CreateNotification() (int, error)
}

type inappNotificationQuery struct{}

func (s *inappNotificationQuery) CreateNotification() (int, error) {
	return 1, nil
}
