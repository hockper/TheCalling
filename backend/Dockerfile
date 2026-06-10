FROM golang:1.26-alpine AS base
WORKDIR /app
COPY go.mod go.sum* ./
RUN go mod tidy && go mod download
COPY . .

FROM base AS tester
# tests are optional to run during docker build since they might require docker socket
# docker build --target tester ...
CMD ["go", "test", "-v", "./..."]

FROM base AS builder
RUN CGO_ENABLED=0 GOOS=linux go build -o server ./cmd/server/main.go

FROM alpine:3.20 AS runner
WORKDIR /app
COPY --from=builder /app/server .
EXPOSE 8080
CMD ["./server"]
