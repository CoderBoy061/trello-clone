import express from 'express';
import { isAuthenticated } from "../middleware/isAuthenticated.js";
import { changeTaskStatus, createTask, deleteTask, updateTask } from '../controllers/task-controller.js';

const router = express.Router();

router.route("/add").post(isAuthenticated, createTask);
router.route("/update/:id").patch(isAuthenticated, updateTask);
router.route("/delete/:id").delete(isAuthenticated, deleteTask);
router.route("/status/update").patch(isAuthenticated, changeTaskStatus);



export default router;