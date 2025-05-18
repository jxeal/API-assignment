import { Kafka } from 'kafkajs';
import Notification from './notificationSchema.js';

const kafka = new Kafka({
    clientId: 'notif-service',
    brokers: ['localhost:9092']
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: 'notif-group' });

export async function initKafka() {
    await producer.connect();
    await consumer.connect();
    await consumer.subscribe({ topic: 'notifications', fromBeginning: false });

    await consumer.run({
        eachMessage: async ({ message }) => {
            const payload = JSON.parse(message.value.toString());
            const { _id } = payload;

            try {
                const notif = await Notification.findById(_id);
                if (!notif || notif.status === 'delivered') return;

                const isSuccess = Math.random() > 0.3; // simulate delivery

                if (isSuccess) {
                    notif.status = 'delivered';
                } else {
                    notif.retries += 1;
                    if (notif.retries >= 3) {
                        notif.status = 'failed';
                    }
                }

                await notif.save();
                console.log(`Notification ${notif._id}: ${notif.status} (retries: ${notif.retries})`);

                if (notif.status === 'pending') {
                    await producer.send({
                        topic: 'notifications',
                        messages: [{ value: JSON.stringify({ _id: notif._id }) }]
                    });
                }
            } catch (err) {
                console.error('Kafka processing error:', err);
            }
        }
    });
}

export async function queueNotification(notificationId) {
    await producer.send({
        topic: 'notifications',
        messages: [{ value: JSON.stringify({ _id: notificationId }) }]
    });
}
