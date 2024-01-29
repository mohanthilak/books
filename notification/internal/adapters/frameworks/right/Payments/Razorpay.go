package payments

import (
	razorpay "github.com/razorpay/razorpay-go"
)

type Adapter struct {
	client *razorpay.Client
}

func NewAdapter(RAZORPAY_KEY, RAZORPAY_SECRET string) *Adapter {
	return &Adapter{
		client: razorpay.NewClient(RAZORPAY_KEY, RAZORPAY_SECRET),
	}
}

func (A *Adapter) CreateOrder(amount int32, receipt string) (map[string]interface{}, error) {
	data := map[string]interface{}{
		"amount":   4000,
		"currency": "INR",
		"receipt":  receipt,
	}
	return A.client.Order.Create(data, nil)
}
