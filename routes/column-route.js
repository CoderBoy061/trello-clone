import express from 'express';
import {isAuthenticated} from "../middleware/isAuthenticated.js";
import { getAllComunsAndTasks } from '../controllers/column-controller.js';

const router = express.Router();

router.route("/getAll").get(isAuthenticated,getAllComunsAndTasks);




export default router;