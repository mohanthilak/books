package httpserver

type HttpErrorStruct struct {
	Status int
	Body   error
}

func newClientHTTPError(statusCode int, err error) error {
	return &HttpErrorStruct{
		Status: statusCode,
		Body:   err,
	}
}

func (e HttpErrorStruct) Error() string {
	return e.Body.Error()
}

func (e *HttpErrorStruct) ResponseBody() map[string]interface{} {
	return map[string]interface{}{"error": e.Error()}
}

func (e *HttpErrorStruct) ResponseHeaders() (int, map[string]string) {
	return e.Status, map[string]string{
		"Content-Type": "application/json; charset=utf-8",
	}
}
