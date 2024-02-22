package MessageQueue

import (
	"log"
	"time"

	amqp "github.com/rabbitmq/amqp091-go"
)

type ThreadPool struct {
	IngressChan chan amqp.Delivery
	adpt        *Adapter
}

func (tp *ThreadPool) worker() {
	for {
		select {
		case d := <-tp.IngressChan:
			{
				log.Printf("Recieved Message: %s\n", d.Body)
				time.Sleep(2 * time.Second)
				d.Ack(false)
				log.Printf("Finished Processing\n")

				// if ans, err := tp.adpt.routeMessages(d.Body); !ans {
				// 	log.Println("unable to handle message", err)
				// 	if err := d.Ack(false); err != nil {
				// 		log.Println("Unable to Acknowledge Messages from RabbitMQ", err)
				// 	}
				// } else {
				// 	err := d.Ack(true)
				// 	if err != nil {
				// 		log.Println("Unable to Acknowledge Messages from RabbitMQ", err)
				// 	}
				// }
			}
		}
	}
}

func NewPool(size int, adpt *Adapter) *ThreadPool {
	pool := &ThreadPool{
		adpt:        adpt,
		IngressChan: make(chan amqp.Delivery, size),
	}

	// Number of workers are currently set to the size of the channel, this is just for trial purpose
	for i := 0; i < size; i++ {
		go pool.worker()
	}

	return pool
}
