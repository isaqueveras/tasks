import { User } from '@prisma/client';
import request from 'supertest';
import { createUser, loginUser } from '../../.jest/session';
import { app } from '../index';

const req = request(app);
const endpoint = `${process.env.API_PREFIX}/todos`;

describe('/todos', () => {
	let session: {
		token: string;
		user: User;
	};

	beforeAll(async () => {
		await createUser();
		session = await loginUser();
	});

	describe('GET /todos ', () => {
		it('should return todo by userId', async () => {
			const { body } = await req
				.post(`${endpoint}/${session.user.id}`)
				.set('Authorization', `Bearer ${session.token}`)
				.send({ title: 'todo title', description: 'todo description' });

			const response = await req
				.get(`${endpoint}/${session.user.id}`)
				.set('Authorization', `Bearer ${session.token}`);

			expect(response.status).toBe(200);
			expect(response.body).toStrictEqual([
				{
					...body,
				},
			]);
		});
	});

	describe('POST /todos', () => {
		it('should create todo', async () => {
			const response = await req
				.post(`${endpoint}/${session.user.id}`)
				.set('Authorization', `Bearer ${session.token}`)
				.send({ title: 'todo title', description: 'todo description' });

			expect(response.status).toEqual(200);
			expect(response.body).toEqual({
				id: expect.any(String),
				title: 'todo title',
				description: 'todo description',
				userId: session.user.id,
				createdAt: expect.any(String),
			});
		});

		it('should not create todo with invalid title', async () => {
			const response = await req
				.post(`${endpoint}/${session.user.id}`)
				.set('Authorization', `Bearer ${session.token}`)
				.send({ title: '', description: 'todo description' });

			expect(response.status).toEqual(400);
			expect(response.body).toEqual({
				message: 'Title and description are required',
				status: 400,
			});
		});

		it('should not create todo with invalid description', async () => {
			const response = await req
				.post(`${endpoint}/${session.user.id}`)
				.set('Authorization', `Bearer ${session.token}`)
				.send({ title: 'title', description: '' });

			expect(response.status).toEqual(400);
			expect(response.body).toEqual({
				message: 'Title and description are required',
				status: 400,
			});
		});

		it('should not create todo with title length greater than 45 characters', async () => {
			const response = await req
				.post(`${endpoint}/${session.user.id}`)
				.set('Authorization', `Bearer ${session.token}`)
				.send({ title: 't'.repeat(46), description: 'description' });

			expect(response.status).toEqual(400);
			expect(response.body).toEqual({
				message: 'title should be less than 45 characters',
				status: 400,
			});
		});

		it('should not create todo with description length greater than 150 characters', async () => {
			const response = await req
				.post(`${endpoint}/${session.user.id}`)
				.set('Authorization', `Bearer ${session.token}`)
				.send({ title: 'title', description: 'd'.repeat(151) });

			expect(response.status).toEqual(400);
			expect(response.body).toEqual({
				message: 'description should be less than 150 characters',
				status: 400,
			});
		});
	});

	describe('UPDATE /todos', () => {
		it('should update todo', async () => {
			const { body } = await req
				.post(`${endpoint}/${session.user.id}`)
				.send({ title: 'todo title', description: 'todo description' })
				.set('Authorization', `Bearer ${session.token}`);

			const response = await req
				.put(`${endpoint}/${body.id}`)
				.set('Authorization', `Bearer ${session.token}`)
				.send({ title: 'updated title', description: 'updated description' });

			expect(response.status).toEqual(200);
			expect(response.body).toEqual({
				id: body.id,
				title: 'updated title',
				description: 'updated description',
				createdAt: body.createdAt,
				userId: session.user.id,
			});
		});

		it('should return 404 if todo is not found', async () => {
			const response = await req
				.put(`${endpoint}/1321312s`)
				.set('Authorization', `Bearer ${session.token}`)
				.send({ title: 'title', description: 'updated description' });

			expect(response.status).toEqual(404);
			expect(response.body).toEqual({
				message: 'Todo not found',
				status: 404,
			});
		});

		it('should not update todo with invalid title', async () => {
			const { body } = await req
				.post(`${endpoint}/${session.user.id}`)
				.send({ title: 'todo title', description: 'todo description' });

			const response = await req
				.put(`/api/v1/todos/${body.id}`)
				.set('Authorization', `Bearer ${session.token}`)
				.send({ title: '', description: 'updated description' });

			expect(response.status).toEqual(400);
			expect(response.body).toEqual({
				message: 'Title and description are required',
				status: 400,
			});
		});

		it('should not update todo with invalid description', async () => {
			const createdTodo = await req
				.post(`${endpoint}/${session.user.id}`)
				.send({ title: 'todo title', description: 'todo description' });

			const response = await req
				.put(`/api/v1/todos/${createdTodo.body.id}`)
				.set('Authorization', `Bearer ${session.token}`)
				.send({ title: 'title', description: '' });

			expect(response.status).toEqual(400);
			expect(response.body).toEqual({
				message: 'Title and description are required',
				status: 400,
			});
		});

		it('should not update todo with title length greater than 45 characters', async () => {
			const { body } = await req
				.post(`${endpoint}/${session.user.id}`)
				.send({ title: 'todo title', description: 'todo description' });

			const response = await req
				.put(`/api/v1/todos/${body.id}`)
				.set('Authorization', `Bearer ${session.token}`)
				.send({ title: 't'.repeat(46), description: 'description' });

			expect(response.status).toEqual(400);
			expect(response.body).toEqual({
				message: 'title should be less than 45 characters',
				status: 400,
			});
		});

		it('should not update todo with description length greater than 150 characters', async () => {
			const { body } = await req
				.post(`${endpoint}/${session.user.id}`)
				.send({ title: 'todo title', description: 'todo description' });

			const response = await req
				.put(`/api/v1/todos/${body.id}`)
				.set('Authorization', `Bearer ${session.token}`)
				.send({ title: 'title', description: 'd'.repeat(151) });

			expect(response.status).toEqual(400);
			expect(response.body).toEqual({
				message: 'description should be less than 150 characters',
				status: 400,
			});
		});
	});

	describe('DELETE /todos', () => {
		it('should delete todo', async () => {
			const { body } = await req
				.post(`${endpoint}/${session.user.id}`)
				.set('Authorization', `Bearer ${session.token}`)
				.send({ title: 'todo title', description: 'todo description' });

			const response = await req
				.delete(`${endpoint}/${body.id}`)
				.set('Authorization', `Bearer ${session.token}`);

			expect(response.status).toEqual(200);
			expect(response.body).toEqual({
				message: 'Todo deleted successfully',
			});
		});

		it('should return 404 if todo is not found', async () => {
			const response = await req
				.delete(`${endpoint}/42`)
				.set('Authorization', `Bearer ${session.token}`);
			expect(response.status).toEqual(404);
			expect(response.body).toEqual({
				message: 'Todo not found',
				status: 404,
			});
		});
	});
});
