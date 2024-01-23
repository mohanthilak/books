package ports

type RelatedUserStruct struct {
	User      string `json:"user"`
	Timestamp int64  `json:"timestamp"`
	RequestID string `json:"_id"`
}

type NotifyLenderMessageStruct struct {
	Data        string            `json:"data"`
	RelatedUser RelatedUserStruct `json:"relatedUser"`
	Lender      string            `json:"lender"`
}

type RequestNotifyLenderStruct struct {
	Type    string                    `json:"type"`
	Message NotifyLenderMessageStruct `json:"message"`
}

type NotifyLenderStruct struct {
	ID          string `json:"_id,omitempty" bson:"_id,omitempty"`
	Type        string `json:"type,omitempty" bson:"type,omitempty"`
	Operation   string `json:"operation,omitempty" bson:"operation,omitempty"`
	FromService string `json:"fromService,omitempty" bson:"fromService,omitempty"`
	Message     string `json:"message,omitempty" bson:"message,omitempty"`
	Recipient   string `json:"lender,omitempty" bson:"recipient,omitempty"`
	RelatedUser string `json:"relatedUser,omitempty" bson:"relatedUser,omitempty"`
	RequestID   string `json:"requestID,omitempty" bson:"requestID,omitempty"`
	Timestamp   int32  `json:"timestamp,omitempty" bson:"timestamp,omitempty"`
	Display     bool   `json:"display,omitempty" bson:"display,omitempty"`
}
