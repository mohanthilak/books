package ports

type PaymentsInterface interface {
	CreateOrder(int32, string) (map[string]interface{}, error)
}
