package MessageQueue

import (
	"context"
	"log"
	"time"

	amqp "github.com/rabbitmq/amqp091-go"
)

func (mb *MessageBroker) Producer() {
	conn, err := amqp.Dial("amqps://xpzfimfo:r9awQJBvXonsgv7YtXAgolBly1BrlwIf@puffin.rmq2.cloudamqp.com/xpzfimfo")
	FailOnError(err, "Failed to connect to RabbitMQ")
	defer conn.Close()

	ch, err := conn.Channel()
	FailOnError(err, "Failed to open a channel")
	defer ch.Close()

	err = ch.ExchangeDeclare(
		"NOTIFICATION_EXCHANGE", // name
		"direct",                // type
		true,                    // durable
		false,                   // auto-deleted
		false,                   // internal
		false,                   // no-wait
		nil,                     // arguments
	)
	FailOnError(err, "Failed to declare an exchange")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	body := "now: " + time.Now().String()
	err = ch.PublishWithContext(ctx,
		"NOTIFICATION_EXCHANGE", // exchange
		"NOTIFICATION",          // routing key
		false,                   // mandatory
		false,                   // immediate
		amqp.Publishing{
			DeliveryMode: amqp.Persistent,
			ContentType:  "text/plain",
			Body:         []byte(body),
		})
	FailOnError(err, "Failed to publish a message")

	log.Printf(" [x] Sent %s", body)
}
