package service

type ServicesStruct struct {
	InappNotificationSerivce InappNotificationService
}

func AggregateServices(
	InAppNotifcation InappNotificationService,
) *ServicesStruct {
	return &ServicesStruct{
		InappNotificationSerivce: InAppNotifcation,
	}
}
