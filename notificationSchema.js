import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    type: { type: String, enum: ['email', 'sms', 'inapp'], required: true },
    message: { type: String, required: true },
    status: { type: String, enum: ['pending', 'successful', 'failed'], default: 'pending' },
    retries: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;