package ports

type RelatedUsersStruct struct {
	User      string `json:"user"`
	Timestamp int64  `json:"timestamp"`
}

type NotifyLenderMessageStruct struct {
	Data         string             `json:"data"`
	RelatedUsers RelatedUsersStruct `json:"relatedUser"`
}

type NotifyLenderStruct struct {
	Type    string                    `json:"type"`
	Message NotifyLenderMessageStruct `json:"message"`
}
