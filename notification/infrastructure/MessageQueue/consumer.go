package MessageQueue

import (
	"log"

	"github.com/streadway/amqp"
)

func (mb *MessageBroker) Consumer() {
	conn, err := amqp.Dial("amqps://mrefwkxt:7a63eI5iVqdd5HRtOEwH6V7ZKE3HvvrU@puffin.rmq2.cloudamqp.com/mrefwkxt")
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

	q, err := ch.QueueDeclare(
		"NOTIFY_QUEUE", // name
		true,           // durable
		false,          // delete when unused
		false,          // exclusive
		false,          // no-wait
		nil,            // arguments
	)
	FailOnError(err, "Failed to declare a queue")

	err = ch.QueueBind(
		q.Name,                  // queue name
		"NOTIFICATION",          // routing key
		"NOTIFICATION_EXCHANGE", // exchange
		false,
		nil)
	FailOnError(err, "Failed to bind a queue")

	msgs, err := ch.Consume(
		q.Name,                 // queue
		"NOTIFICATION_SERVICE", // consumer
		false,                  // auto ack
		false,                  // exclusive
		false,                  // no local
		false,                  // no wait
		nil,                    // args
	)
	FailOnError(err, "Failed to register a consumer")

	var forever chan struct{}

	go func() {
		for d := range msgs {
			log.Printf(" [x] %s", d.Body)
			ms := MessageStruct{}
			ms.ReceiveMessage(d.Body)
			d.Ack(false)
		}
	}()

	log.Printf(" [*] Waiting for logs. To exit press CTRL+C")
	<-forever
}
