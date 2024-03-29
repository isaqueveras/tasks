import { verify } from 'jsonwebtoken';
import AppError from '../error/AppError';
import { NextFunction, Request, Response } from 'express';

async function authenticate(
	request: Request,
	response: Response,
	next: NextFunction,
) {
	const authHeader = request.headers.authorization;

	if (!authHeader) {
		throw new AppError('JWT token is missing', 401);
	}

	const [, token] = authHeader.split(' ');

	try {
		verify(token, String(process.env.APP_SECRET));

		next();
	} catch (err) {
		throw new AppError('Invalid JWT token', 401);
	}
}

export default authenticate;
