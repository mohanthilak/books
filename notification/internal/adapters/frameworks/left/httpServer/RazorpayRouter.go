package httpserver

import (
	"encoding/json"
	"errors"
	"log"
	"net/http"
)

type CreateTransactionRequestStruct struct {
	Receipt string `json:"receipt"`
	Amount  int32  `json:"amount"`
}

func (A Adapter) InitiateTransaction(w http.ResponseWriter, r *http.Request) error {
	var TransactionDetails CreateTransactionRequestStruct

	if err := json.NewDecoder((r.Body)).Decode(&TransactionDetails); err != nil {
		return err
	}

	transaction, err := A.app.InitiateTransaction(50000, "123321")
	if err != nil {
		log.Println("error caught at api layer:", err)
		return newClientHTTPError(500, errors.New("server-error"))
	}

	responseData := map[string]interface{}{
		"success": true,
		"data":    transaction,
		"error":   nil,
	}

	A.WriteJSONResponse(w, http.StatusOK, responseData, map[string]string{"Access-Control-Allow-Credentials": "true"})
	return nil
}
