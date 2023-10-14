package ports

type ApplicationInterface interface {
	NotifyLender(NotifyLenderStruct) error
}
