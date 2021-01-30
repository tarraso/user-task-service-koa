import { BaseContext } from "koa";
import { getManager, Repository, Not, Equal, Like } from "typeorm";
import { validate, ValidationError } from "class-validator";
import { request, summary, path, body, responsesAll, tagsAll } from "koa-swagger-decorator";
import { Task, taskSchema} from "../entity/task";
import { User } from "../entity/user";


@responsesAll({ 200: { description: "success"}, 400: { description: "bad request"}, 401: { description: "unauthorized, missing/wrong jwt token"}})
@tagsAll(["Task"])
export default class TaskController {

    @request("get", "/tasks")
    @summary("Find all tasks")
    public static async getTasks
    (ctx: BaseContext): Promise<void> {

        // get a task repository to perform operations with task
        const taskRepository: Repository<Task> = getManager().getRepository(Task);

        // load all tasks
        const tasks: Task[] = await taskRepository.find();

        // return OK status code and loaded tasks array
        ctx.status = 200;
        ctx.body = tasks;
    }

    @request("get", "/tasks/{id}")
    @summary("Find task by id")
    @path({
        id: { type: "number", required: true, description: "id of task" }
    })
    public static async getTask(ctx: BaseContext): Promise<void> {

        // get a task repository to perform operations with task
        const taskRepository: Repository<Task> = getManager().getRepository(Task);

        // load task by id
        const task: Task | undefined = await taskRepository.findOne(+ctx.params.id || 0);

        if (task) {
            // return OK status code and loaded task object
            ctx.status = 200;
            ctx.body = task;
        } else {
            // return a BAD REQUEST status code and error message
            ctx.status = 400;
            ctx.body = "The task you are trying to retrieve doesn't exist in the db";
        }

    }

    @request("post", "/tasks")
    @summary("Create a task")
    @body(taskSchema)
    public static async createTask(ctx: BaseContext): Promise<void> {

        // get a task repository to perform operations with task
        const taskRepository: Repository<Task> = getManager().getRepository(Task);
        const userRepository: Repository<User> = getManager().getRepository(User);

        // build up entity task to be saved
        const taskToBeSaved: Task = new Task();
        taskToBeSaved.name = ctx.request.body.name;
        taskToBeSaved.description = ctx.request.body.description;
        const user = await userRepository.findOne(ctx.request.body.user.id);
        taskToBeSaved.user = user;
        // validate task entity
        const errors: ValidationError[] = await validate(taskToBeSaved); // errors is an array of validation errors

        if (errors.length > 0) {
            // return BAD REQUEST status code and errors array
            ctx.status = 400;
            ctx.body = errors;
        } else {
            // save the task contained in the POST body
            const task = await taskRepository.save(taskToBeSaved);
            // return CREATED status code and updated task
            ctx.status = 201;
            ctx.body = task;
        }
    }

    @request("put", "/tasks/{id}")
    @summary("Update a task")
    @path({
        id: { type: "number", required: true, description: "id of task" }
    })
    @body(taskSchema)
    public static async updateTask(ctx: BaseContext): Promise<void> {

        // get a task repository to perform operations with task
        const taskRepository: Repository<Task> = getManager().getRepository(Task);
        const userRepository: Repository<User> = getManager().getRepository(User);

        // update the task by specified id
        // build up entity task to be updated
        const taskToBeUpdated: Task = new Task();
        taskToBeUpdated.id = +ctx.params.id || 0; // will always have a number, this will avoid errors
        taskToBeUpdated.name = ctx.request.body.name;
        taskToBeUpdated.description = ctx.request.body.description;
        const user = await userRepository.findOne(ctx.request.body.user.id);
        taskToBeUpdated.user = user;

        // validate task entity
        const errors: ValidationError[] = await validate(taskToBeUpdated); // errors is an array of validation errors

        if (errors.length > 0) {
            // return BAD REQUEST status code and errors array
            ctx.status = 400;
            ctx.body = errors;
        } else if (!await taskRepository.findOne(taskToBeUpdated.id)) {
            // check if a task with the specified id exists
            // return a BAD REQUEST status code and error message
            ctx.status = 400;
            ctx.body = "The task you are trying to update doesn't exist in the db";
        } else {
            // save the task contained in the PUT body
            const task = await taskRepository.save(taskToBeUpdated);
            // return CREATED status code and updated task
            ctx.status = 201;
            ctx.body = task;
        }

    }

    @request("delete", "/tasks/{id}")
    @summary("Delete task by id")
    @path({
        id: { type: "number", required: true, description: "id of task" }
    })
    public static async deleteTask(ctx: BaseContext): Promise<void> {

        // get a task repository to perform operations with task
        const taskRepository = getManager().getRepository(Task);

        // find the task by specified id
        const taskToRemove: Task | undefined = await taskRepository.findOne(+ctx.params.id || 0);
        if (!taskToRemove) {
            // return a BAD REQUEST status code and error message
            ctx.status = 400;
            ctx.body = "The task you are trying to delete doesn't exist in the db";
        } else {
            // the task is there so can be removed
            await taskRepository.remove(taskToRemove);
            // return a NO CONTENT status code
            ctx.status = 204;
        }

    }
}
