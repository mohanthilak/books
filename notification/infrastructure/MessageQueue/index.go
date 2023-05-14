package MessageQueue

import "log"

type MessageBroker struct {
	Url string
}

func FailOnError(err error, msg string) {
	if err != nil {
		log.Panicf("%s: %s", msg, err)
	}
}

func ConnectMessageQueue(messageBrokerUrl string) {
	MB := MessageBroker{Url: messageBrokerUrl}
	go MB.Consumer()
}
