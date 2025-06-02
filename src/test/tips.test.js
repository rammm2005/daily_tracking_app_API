const request = require('supertest');
const express = require('express');
const router = require('../routes/tips');

const Tip = require('../model/tip');

jest.mock('../model/tip.js');

jest.mock('../config/uploadToCloudynary.js', () => ({
    uploadToCloudinary: jest.fn(),
}));

const { uploadToCloudinary } = require('../config/uploadToCloudynary');

const app = express();
app.use(express.json());
app.use('/tips', router);

describe('Tips API', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /tips/:userId', () => {
        it('should return tips for given userId', async () => {
            const fakeTips = [{ title: 'Tip 1', userId: 'user1' }];
            Tip.find.mockResolvedValue(fakeTips);

            const res = await request(app).get('/tips/user1');

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.tips).toEqual(fakeTips);
            expect(Tip.find).toHaveBeenCalledWith({ userId: 'user1' });
        });

        it('should return 500 on error', async () => {
            Tip.find.mockRejectedValue(new Error('DB error'));

            const res = await request(app).get('/tips/user1');

            expect(res.status).toBe(500);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe('DB error');
        });
    });

    describe('GET /tips/all/data', () => {
        it('should return all tips', async () => {
            const allTips = [{ title: 'Tip A' }, { title: 'Tip B' }];
            Tip.find.mockResolvedValue(allTips);

            const res = await request(app).get('/tips/all/data');

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.tips).toEqual(allTips);
            expect(Tip.find).toHaveBeenCalledWith();
        });
    });

    describe('POST /tips', () => {
        it('should return 400 if required fields missing', async () => {
            const res = await request(app)
                .post('/tips')
                .field('title', '')
                .field('content', '')
                .field('userId', '')
                .field('type', '');

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe('Missing required fields');
        });

        it('should create new tip and return 201', async () => {
            uploadToCloudinary.mockResolvedValue({ secure_url: 'http://cloudinary.com/fake.jpg' });

            // Mock instance Tip dengan properti title dll supaya res.body.newTip.title muncul
            const saveMock = jest.fn().mockImplementation(function () {
                this._id = 'someid';
                this.title = 'My Tip';
                this.content = 'Content here';
                this.userId = 'user123';
                this.type = 'general';
                this.images = ['http://cloudinary.com/fake.jpg'];
                return Promise.resolve(this);
            });

            Tip.mockImplementation(() => ({
                save: saveMock,
            }));

            const res = await request(app)
                .post('/tips')
                .field('title', 'My Tip')
                .field('content', 'Content here')
                .field('userId', 'user123')
                .field('type', 'general');

            expect(saveMock).toHaveBeenCalled();
            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.newTip.title).toBe('My Tip');
        });
    });

    describe('PUT /tips/:id', () => {
        it('should update tip and return updated tip', async () => {
            const fakeTip = { _id: 'id123', title: 'Old Tip', save: jest.fn() };
            Tip.findById.mockResolvedValue(fakeTip);
            uploadToCloudinary.mockResolvedValue({ secure_url: 'http://cloudinary.com/updated.jpg' });
            Tip.findByIdAndUpdate.mockResolvedValue({ _id: 'id123', title: 'Updated Tip', images: ['http://cloudinary.com/updated.jpg'] });

            const res = await request(app)
                .put('/tips/id123')
                .field('title', 'Updated Tip')
                .attach('images', Buffer.from('fakeimage'), 'test.jpg');

            expect(Tip.findById).toHaveBeenCalledWith('id123');
            expect(uploadToCloudinary).toHaveBeenCalled();
            expect(Tip.findByIdAndUpdate).toHaveBeenCalled();
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.updatedTip.title).toBe('Updated Tip');
        });

        it('should return 404 if tip not found', async () => {
            Tip.findById.mockResolvedValue(null);

            const res = await request(app)
                .put('/tips/id123')
                .field('title', 'Updated Tip');

            expect(res.status).toBe(404);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe('Tip not found');
        });
    });

    describe('DELETE /tips/:id', () => {
        it('should delete tip successfully', async () => {
            Tip.findByIdAndDelete.mockResolvedValue({ _id: 'id123' });

            const res = await request(app).delete('/tips/id123');

            expect(Tip.findByIdAndDelete).toHaveBeenCalledWith('id123');
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toBe('Tip deleted');
        });

        it('should return 404 if tip not found', async () => {
            Tip.findByIdAndDelete.mockResolvedValue(null);

            const res = await request(app).delete('/tips/id123');

            expect(res.status).toBe(404);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe('Tip not found');
        });
    });

});
