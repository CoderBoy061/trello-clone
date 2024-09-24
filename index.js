import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from "cookie-parser";
import connection from './database/connection.js';
import userRoutes from "./routes/user-route.js"
import taskRoutes from "./routes/task-route.js"
import columnRoute from "./routes/column-route.js"
dotenv.config();
connection();

const PORT = process.env.PORT || 5000;

const app = express();
app.use(
    cors({
      origin: ["https://mern-task-management.netlify.app/","http://localhost:5173","http://localhost:3000"],
      methods: ["GET", "POST", "PATCH", "DELETE"],
      credentials: true,
    })
  );

app.use(cookieParser());
app.use(express.json());

app.use('/api/v1/user', userRoutes);
app.use('/api/v1/task', taskRoutes);
app.use("/api/v1/column",columnRoute)



app.listen (PORT,()=>{
    console.log(`Server is running on port ${PORT}`)
})