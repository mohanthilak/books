package ports

type DBInterface interface {
	MakeConnection()
	CloseConnection()
	InsertBorrowReturnRequest(*NotifyLenderStruct) error
}
