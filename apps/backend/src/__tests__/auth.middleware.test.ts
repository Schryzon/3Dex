import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { Request, Response, NextFunction } from 'express';
import { require_auth, optional_auth, Auth_Request } from '../middlewares/auth.middleware';
import * as jwtConfig from '../utils/jwt';

jest.mock('../utils/jwt');

describe('Auth Middleware', () => {
    let mockReq: Partial<Auth_Request>;
    let mockRes: Partial<Response>;
    let nextFunction: NextFunction;

    beforeEach(() => {
        mockReq = {
            cookies: {},
        };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        } as unknown as Response;
        nextFunction = jest.fn();
        jest.clearAllMocks();
    });

    describe('require_auth', () => {
        it('should return 401 if no token is present', () => {
            require_auth(mockReq as Auth_Request, mockRes as Response, nextFunction);

            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'Missing token!' });
            expect(nextFunction).not.toHaveBeenCalled();
        });

        it('should return 401 if token is invalid', () => {
            mockReq.cookies = { '3dex_session': 'invalid_token' };
            (jwtConfig.verify_token as jest.Mock).mockImplementation(() => {
                throw new Error('Invalid token');
            });

            require_auth(mockReq as Auth_Request, mockRes as Response, nextFunction);

            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'Invalid token!' });
            expect(nextFunction).not.toHaveBeenCalled();
        });

        it('should call next() and set req.user if token is valid', () => {
            mockReq.cookies = { '3dex_session': 'valid_token' };
            const payload = { userId: 1, role: 'USER' };
            (jwtConfig.verify_token as jest.Mock).mockReturnValue(payload);

            require_auth(mockReq as Auth_Request, mockRes as Response, nextFunction);

            expect(mockReq.user).toEqual(payload);
            expect(nextFunction).toHaveBeenCalled();
        });
    });

    describe('optional_auth', () => {
        it('should call next() without setting req.user if no token', () => {
            optional_auth(mockReq as Request, mockRes as Response, nextFunction);
            
            expect((mockReq as any).user).toBeUndefined();
            expect(nextFunction).toHaveBeenCalled();
        });

        it('should call next() without setting req.user if token is invalid', () => {
            mockReq.cookies = { '3dex_session': 'invalid_token' };
            (jwtConfig.verify_token as jest.Mock).mockImplementation(() => {
                throw new Error('Invalid token');
            });

            optional_auth(mockReq as Request, mockRes as Response, nextFunction);

            expect((mockReq as any).user).toBeUndefined();
            expect(nextFunction).toHaveBeenCalled();
        });

        it('should call next() and set req.user if token is valid', () => {
            mockReq.cookies = { '3dex_session': 'valid_token' };
            const payload = { userId: 1, role: 'USER' };
            (jwtConfig.verify_token as jest.Mock).mockReturnValue(payload);

            optional_auth(mockReq as Request, mockRes as Response, nextFunction);

            expect((mockReq as any).user).toEqual(payload);
            expect(nextFunction).toHaveBeenCalled();
        });
    });
});
