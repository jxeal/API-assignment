import express from 'express';
import mongoose from 'mongoose';
import Notification from './notificationSchema';
import { initKafka, queueNotification } from './kafka.js';

const app = express();
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/notifications', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => { console.log("Connected to DB"); })
    .catch((err) => { console.log("Connection error:", err); });

initKafka();

app.post('/notifications', async (req, res) => {
    const { userId, type, message } = req.body;
    if (!userId || !type || !message) {
        return res.status(400).json({ error: "Missing data" });
    }

    try {
        const notification = new Notification({ userId, type, message });
        await notification.save();
        await queueNotification(notification._id);
        res.json({ status: 'queued', notificationID: notification._id });
    }
    catch (err) {
        res.status(500).json({ error: "Failed to queue notifications" });
    }

})

app.get('/users/:id/notifications', async (req, res) => {
    try {
        const notification = await Notification.find({ userId: req.params.id });
        if (!notification.length) {
            return res.status(404).json({ message: "No notifications found" });
        }
        res.status(200).json(notification);
    } catch (err) {
        res.status(500).json({ error: "Failed to retrieve notification" });
    }
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Listening to port ${PORT}`);
})