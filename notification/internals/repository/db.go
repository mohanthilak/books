package repository

import (
	"database/sql"
)

var DB *sql.DB

type dao struct{}

type DAO interface {
	NewInAppNotificationQuery() InappNotificationQuery
}

func NewDao(db *sql.DB) DAO {
	DB = db
	return &dao{}
}

func (d *dao) NewInAppNotificationQuery() InappNotificationQuery {
	return &inappNotificationQuery{}
}
