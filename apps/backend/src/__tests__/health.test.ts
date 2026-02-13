import request from 'supertest';
import express from 'express';

const app = express();

app.get('/', (req, res) => {
    res.status(200).json({ message: 'OK' });
});

describe('Health Check', () => {
    it('should return 200 OK', async () => {
        const res = await request(app).get('/');
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ message: 'OK' });
    });
});
