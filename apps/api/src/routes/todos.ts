import { Router } from 'express';

import TodoController from '../controller/TodoController';
import authenticate from '../middlewares/auth';

const todoController = new TodoController();
const todoRoutes = Router();

todoRoutes.use(authenticate);

todoRoutes.get('/:userId', todoController.index);
todoRoutes.post('/:userId', todoController.create);
todoRoutes.put('/:id', todoController.update);
todoRoutes.delete('/:id', todoController.delete);

export default todoRoutes;
