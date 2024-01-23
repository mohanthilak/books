package ports

type DBInterface interface {
	MakeConnection()
	CloseConnection()
	InsertBorrowReturnRequest(*NotifyLenderStruct) error
	GetUserDisplayNotifications(string) ([]NotifyLenderStruct, error)
}
