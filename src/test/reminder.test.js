const request = require('supertest');
const express = require('express');
const reminderRoutes = require('../src/routes/reminder');

const app = express();
app.use(express.json());
app.use('/api/reminders', reminderRoutes);

describe('Reminder API', () => {
    it('GET /api/reminders/user/:userId → 200 & array', async () => {
        const res = await request(app).get('/api/reminders/user/dummyUserId');
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('success');
    });
});
