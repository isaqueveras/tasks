import { Request, Response } from 'express';
import { prismaClient } from '../database/prismaClient';
import CreateTodoService from '../services/CreateTodoService';
import DeleteTodoService from '../services/DeleteTodoService';
import UpdateTodoService from '../services/UpdateTodoService';
import TodoRepository from '../repositories/TodoRepository';

class TodoController {
	async index(req: Request, res: Response) {
		const { userId } = req.params;

		const todos = await prismaClient.todo.findMany({
			where: {
				userId,
			},
		});
		res.send(todos);
	}

	async create(req: Request, res: Response) {
		const { title, description } = req.body;
		const { userId } = req.params;

		const todoRepository = new TodoRepository();

		const createTodoService = new CreateTodoService(todoRepository);
		const todo = await createTodoService.execute({
			title,
			description,
			userId,
		});

		res.send(todo);
	}

	async update(req: Request, res: Response) {
		const { title, description } = req.body;
		const { id } = req.params;

		const todoRepository = new TodoRepository();

		const updateTodoService = new UpdateTodoService(todoRepository);
		const todo = await updateTodoService.execute(id, { title, description });

		res.send(todo);
	}

	async delete(req: Request, res: Response) {
		const { id } = req.params;

		const todoRepository = new TodoRepository();

		const deleteTodoService = new DeleteTodoService(todoRepository);
		await deleteTodoService.execute(id);

		res.status(200).send({ message: 'Todo deleted successfully' });
	}
}

export default TodoController;
