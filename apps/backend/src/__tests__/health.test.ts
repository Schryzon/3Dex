import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import request from 'supertest';
import app from '../app';

describe('Health & Global Handlers', () => {
    it('should return 200 OK on /health', async () => {
        const res = await request(app).get('/health');
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ status: 'OK' });
    });

    it('should return 404 for an unknown route', async () => {
        const res = await request(app).get('/this-route-does-not-exist');
        expect(res.status).toBe(404);
        expect(res.body).toHaveProperty('error', 'Not Found');
    });
});
