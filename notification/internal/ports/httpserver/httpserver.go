package httpserver

type HttpServerInterface interface {
	Start(func(), func())
}
