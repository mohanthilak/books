package DataStore

import (
	"database/sql"

	_ "github.com/go-sql-driver/mysql"
)

func ConnectDB(dbUrl string) *sql.DB {
	db, err := sql.Open("mysql", dbUrl)
	if err != nil {
		panic(err.Error())
	}
	return db
}
