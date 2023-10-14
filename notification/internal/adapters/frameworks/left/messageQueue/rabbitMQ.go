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

type Adapater struct {
	connectionURL string
	connection    *amqp.Connection
	channel       *amqp.Channel
	queue         amqp.Queue
	handlers      map[string]messageHandler
	API           ports.ApplicationInterface
}

func NewAdapter(url string, api ports.ApplicationInterface) *Adapater {
	adpt := &Adapater{connectionURL: url, API: api, handlers: make(map[string]messageHandler)}
	adpt.setUpHandlers()
	return adpt
}

func (adpt *Adapater) setUpHandlers() {
	adpt.handlers["Trial"] = trialHandler
	adpt.handlers["Notify-lender"] = notifyLenderHandler
}

func (adpt *Adapater) MakeConnection() {
	connection, err := amqp.Dial(adpt.connectionURL)
	if err != nil {
		log.Fatal("Couldn't connect to message queue", err)
	}
	adpt.connection = connection
	adpt.createChannel()
	adpt.declareExchnage()
	go adpt.consumeMessage()
}

func (adpt *Adapater) createChannel() {
	ch, err := adpt.connection.Channel()
	if err != nil {
		log.Println(err, "Failed to open a channel")
	}
	adpt.channel = ch
}

func (adpt Adapater) declareExchnage() {
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

func (adpt *Adapater) PublishMessage(exchange, routingKey, data string) error {
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

func (adpt *Adapater) declareQueue() {
	q, err := adpt.channel.QueueDeclare(
		"NOTIFICATION_QUEUE", // name
		true,                 // durable
		false,                // delete when unused
		false,                // exclusive
		false,                // no-wait
		nil,                  // arguments
	)
	if err != nil {
		log.Fatal("Failed to declare a queue", err)
	}
	adpt.queue = q
}

func (adpt *Adapater) bindQueue() {
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

func (adpt *Adapater) consumeMessage() error {
	adpt.declareQueue()
	adpt.bindQueue()

	msgs, err := adpt.channel.Consume(
		adpt.queue.Name,        // queue
		"NOTIFICATION_SERVICE", // consumer
		false,                  // auto ack
		false,                  // exclusive
		false,                  // no local
		false,                  // no wait
		nil,                    // args
	)
	if err != nil {
		log.Fatal("error while consuming messages", err)
	}
	forever := make(chan bool)
	go func() {
		for d := range msgs {
			fmt.Printf("\nRecieved Message: %s\n", d.Body)
			if ans, err := adpt.routeMessages(d.Body); !ans {
				log.Println("unable to handle message", err)
				err := d.Ack(false)
				log.Println("Error!!", err)
			} else {
				err := d.Ack(false)
				log.Println("Error!!", err)
			}
		}
	}()

	fmt.Println("Successfully Connected to our RabbitMQ Instance")
	fmt.Println(" [*] - Waiting for messages")
	<-forever
	return nil
}

func (adpt Adapater) routeMessages(body []byte) (bool, error) {
	var mes message
	if err := json.Unmarshal(body, &mes); err != nil {
		log.Println("unable to unmarshal message", err)
		return false, err
	}
	if handler, ok := adpt.handlers[mes.Operation]; ok {
		return handler(mes.Data, adpt.API)
	} else {
		return false, errors.New("no such operation found")
	}
}
