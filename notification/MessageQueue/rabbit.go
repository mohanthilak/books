package MessageQueue

import (
	"context"
	"fmt"
	"log"
	"time"

	amqp "github.com/rabbitmq/amqp091-go"
)

type MessageQueueStruct struct {
	channel *amqp.Channel
}

func NewMessageQueue() *MessageQueueStruct {
	conn, err := amqp.Dial("amqps://xpzfimfo:r9awQJBvXonsgv7YtXAgolBly1BrlwIf@puffin.rmq2.cloudamqp.com/xpzfimfo")
	if err != nil {
		log.Println(err, "Failed to connect to RabbitMQ")
	}
	ch, err := conn.Channel()
	if err != nil {
		log.Println(err, "Failed to open a channel")
	}
	err = ch.ExchangeDeclare(
		"NOTIFICATION_EXCHANGE", // name
		"direct",                // type
		true,                    // durable
		false,                   // auto-deleted
		false,                   // internal
		false,                   // no-wait
		nil,                     // arguments
	)
	if err != nil {
		log.Println(err, "Failed to declare an Exchange")
	}
	return &MessageQueueStruct{
		channel: ch,
	}
}

func (mq *MessageQueueStruct) PublishMessage(exchange, routingKey, data string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	err := mq.channel.PublishWithContext(ctx,
		exchange,   // exchange
		routingKey, // routing key
		false,      // mandatory
		false,      // immediate
		amqp.Publishing{
			ContentType: "text/plain",
			Body:        []byte(data),
		})
	log.Println(err, "Failed to publish a message")
	return err
}

func (mq *MessageQueueStruct) ConsumeMessage() error {
	q, err := mq.channel.QueueDeclare(
		"NOTIFICATION_QUEUE", // name
		true,                 // durable
		false,                // delete when unused
		true,                 // exclusive
		false,                // no-wait
		nil,                  // arguments
	)
	if err != nil {
		log.Fatal("Failed to declare a queue", err)
		return err
	}
	err = mq.channel.QueueBind(
		q.Name,                  // queue name
		"NOTIFICATION",          // routing key
		"NOTIFICATION_EXCHANGE", // exchange
		false,
		nil)

	if err != nil {
		log.Fatal("error while binding queue", err)
		return err
	}
	msgs, err := mq.channel.Consume(
		q.Name,                 // queue
		"NOTIFICATION_SERVICE", // consumer
		false,                  // auto ack
		false,                  // exclusive
		false,                  // no local
		false,                  // no wait
		nil,                    // args
	)
	if err != nil {
		log.Fatal("error while consuming messages", err)
		return err
	}
	forever := make(chan bool)
	go func() {
		for d := range msgs {
			fmt.Printf("Recieved Message: %s\n", d.Body)
			HandleMessageFromQueue(d.Body)
			d.Ack(true)
		}
	}()

	fmt.Println("Successfully Connected to our RabbitMQ Instance")
	fmt.Println(" [*] - Waiting for messages")
	<-forever
	return nil
}
