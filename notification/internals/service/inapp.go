package service

import (
	"notificationService/internals/dto"
	"notificationService/internals/repository"
)

type InappNotificationService interface {
	CreateNotification(inAppNotification dto.InAppNotification) (int, error)
}

type inappNotificationService struct {
	dao repository.DAO
}

func NewInAppNotificationService(dao repository.DAO) InappNotificationService {
	return &inappNotificationService{dao: dao}
}

func (in *inappNotificationService) CreateNotification(inAppNotification dto.InAppNotification) (int, error) {

	return in.dao.NewInAppNotificationQuery().CreateNotification()
}
