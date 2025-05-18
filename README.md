# API-assignment

Notification Service

A simple notification microservice that sends **email**, **SMS**, and **in-app** notifications using a Kafka queue and MongoDB for persistence.

## Features

- REST API to send and fetch notifications
- Notification types: `email`, `sms`, `inapp`
- Kafka-backed queue for processing notifications
- Retry mechanism for failed deliveries (up to 3 attempts)
- MongoDB storage with notification status tracking

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/your-username/notification-service.git
cd notification-service
```

### 2. Install dependencies

```bash
npm install
```

### 3. Ensure MongoDB and Kafka are running

#### MongoDB

You can run MongoDB locally or via Docker:

```bash
docker run -d -p 27017:27017 --name mongo mongo
```

The service connects to MongoDB at:

```bash
mongodb://localhost:27017/notifications
```

You can change this URI in `server.js` if your MongoDB setup is different.

#### Kafka

You can run Kafka and Zookeeper using Docker Compose:
Create a file named `docker-compose.yml` with the following content:

```yaml
version: "2"
services:
  zookeeper:
    image: wurstmeister/zookeeper
    ports:
      - "2181:2181"

  kafka:
    image: wurstmeister/kafka
    ports:
      - "9092:9092"
    environment:
      KAFKA_ADVERTISED_HOST_NAME: localhost
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
```

Then start Kafka:

```bash
docker-compose up -d
```

This will start Kafka and Zookeeper locally. Ensure Kafka is accessible at `localhost:9092`.

### 4. Manually Create Kafka Topic (Optional)

Kafka will auto-create the `notifications` topic when used, but to create manually:

```bash
docker exec -it <kafka-container-id> bash
kafka-topics.sh --create --topic notifications --bootstrap-server localhost:9092 --partitions 1 --replication-factor 1
```

### 5. Start the Server

Once MongoDB and Kafka are up, run:

```bash
node server.js
```

You should see:

```bash
Connected to DB
Listening to port 3000
```

## Usage

### 1. Send a Notification

**POST** `/notifications`

Request Body:

```json
{
  "userId": "user123",
  "type": "email",
  "message": "Test notification message"
}
```

### 2. Get Notifications

**GET** `/users/user123/notifications`

---

## Notes

- The notification delivery success is simulated using random chance.
- Only valid types are `email`, `sms`, `inapp`.
- The service retries failed deliveries up to 3 times.
- Notification status can be: `pending`, `successful`, or `failed`.
