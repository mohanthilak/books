package MessageQueue

import (
	"Notifications/internal/ports"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"time"

	amqp "github.com/rabbitmq/amqp091-go"
)

type Adapter struct {
	connectionURL string
	connection    *amqp.Connection
	channel       *amqp.Channel
	queue         amqp.Queue
	handlers      map[string]messageHandler
	API           ports.ApplicationInterface
}

func NewAdapter(url string, api ports.ApplicationInterface) *Adapter {
	adpt := &Adapter{connectionURL: url, API: api, handlers: make(map[string]messageHandler)}
	adpt.setUpHandlers()
	return adpt
}

func (adpt *Adapter) setUpHandlers() {
	adpt.handlers["Trial"] = trialHandler
	adpt.handlers["Notify-lender-borrow"] = notifyLenderHandler
}

func (adpt *Adapter) CloseConnection() {
	log.Println("Closing RabbitMQ Connection")
	if err := adpt.connection.Close(); err != nil {
		log.Fatal("Cloud not close RabbitMQ Connection", err)
	}
}

func (adpt *Adapter) MakeConnection() {
	log.Println("connectionURL:", adpt.connectionURL)
	connection, err := amqp.Dial(adpt.connectionURL)
	if err != nil {
		log.Println("Couldn't connect to message queue", err)
	}
	adpt.connection = connection
	adpt.createChannel()
	adpt.declareExchnage()
	go adpt.consumeMessage()
}

func (adpt *Adapter) createChannel() {
	ch, err := adpt.connection.Channel()
	if err != nil {
		log.Println(err, "Failed to open a channel")
	}
	ch.Qos(5, 0, false)
	adpt.channel = ch
}

func (adpt Adapter) declareExchnage() {
	err := adpt.channel.ExchangeDeclare(
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
}

func (adpt *Adapter) PublishMessage(exchange, routingKey, data string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	err := adpt.channel.PublishWithContext(ctx,
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

func (adpt *Adapter) declareQueue() {
	args := make(amqp.Table)
	args["x-max-priority"] = int64(3)
	q, err := adpt.channel.QueueDeclare(
		"NOTIFICATION_QUEUE", // name
		true,                 // durable
		false,                // delete when unused
		false,                // exclusive
		false,                // no-wait
		args,                 // arguments
	)
	if err != nil {
		log.Fatal("Failed to declare a queue", err)
	}
	adpt.queue = q
}

func (adpt *Adapter) bindQueue() {
	err := adpt.channel.QueueBind(
		adpt.queue.Name,         // queue name
		"NOTIFICATION",          // routing key
		"NOTIFICATION_EXCHANGE", // exchange
		false,
		nil)

	if err != nil {
		log.Fatal("error while binding queue", err)
	}
}

func (adpt *Adapter) consumeMessage() error {
	adpt.declareQueue()
	adpt.bindQueue()

	args := make(amqp.Table)
	args["x-max-priority"] = int64(3)

	msgs, err := adpt.channel.Consume(
		adpt.queue.Name,        // queue
		"NOTIFICATION_SERVICE", // consumer
		false,                  // auto ack
		false,                  // exclusive
		false,                  // no local
		false,                  // no wait
		args,                   // args
	)
	if err != nil {
		log.Fatal("error while consuming messages", err)
	}

	forever := make(chan bool)

	go func() {
		pool := NewPool(10, adpt)
		for d := range msgs {
			pool.IngressChan <- d
		}
	}()

	fmt.Println("Successfully Connected to our RabbitMQ Instance")
	fmt.Println(" [*] - Waiting for messages")
	<-forever
	return nil
}

func (adpt Adapter) routeMessages(body []byte) (bool, error) {
	var mes message
	if err := json.Unmarshal(body, &mes); err != nil {
		log.Println("unable to unmarshal message", err)
		return false, err
	}
	if handler, ok := adpt.handlers[mes.Operation]; ok {
		acknowledge := handler(mes, adpt.API)
		if !acknowledge {
			return false, errors.New("handler error")
		} else {
			return true, nil
		}
	} else {
		return false, errors.New("no such operation found")
	}
}
