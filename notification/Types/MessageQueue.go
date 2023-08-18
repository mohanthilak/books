package Types

type RelatedUsersStruct struct {
	User      string `json:"user"`
	TimeStamp int64  `json:"timestamp"`
}

type DataMessageStruct struct {
	Data         string               `json:"data"`
	RelatedUsers []RelatedUsersStruct `json:"relatedUsers"`
}

type DataStruct struct {
	Type    string            `json:"type"`
	Message DataMessageStruct `json:"message"`
}

type MessageQueueStruct struct {
	FromService string     `json:"fromService"`
	Operation   string     `json:"operation"`
	Data        DataStruct `json:"data"`
}
