import Task from "../models/task-schema.js";
import Column from "../models/column-schema.js";

export const createTask = async (req, res) => {
  const { title, description, status } = req.body;
  const userId = req.user._id;
  try {
    if (title.trim() === "" || !description.trim() === "" || !status === null) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide all the fields" });
    }
    const task = await Task.findOne({ title, userId });
    if (task) {
      return res
        .status(400)
        .json({ success: false, message: "Task already exists" });
    }
    const newTask = new Task({ title, description, status, userId });
    await newTask.save();

    switch (status) {
      case 0:
        await Column.updateOne(
          { userId, title: "TO DO" },
          { $push: { taskIds: newTask._id } }
        );
        break;
      case 1:
        await Column.updateOne(
          { userId, title: "IN PROGRESS" },
          { $push: { taskIds: newTask._id } }
        );
        break;
      case 2:
        await Column.updateOne(
          { userId, title: "DONE" },
          { $push: { taskIds: newTask._id } }
        );
        break;
      default:
        return res
          .status(400)
          .json({ success: false, message: "Please provide all the fields" });
    }

    return res
      .status(201)
      .json({ success: true, message: "Task created successfully" });
  } catch (error) {
    console.log(error);

    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const changeTaskStatus = async (req, res) => {
  try {
    const { id, status } = req.body;
    if (status === null) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide all the fields" });
    }
    const userId = req.user._id;
    const task = await Task.findById({ _id: id, userId });
    if (!task) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    }
    const oldStatus = task.status;
    // await Task.findByIdAndUpdate({ _id: id }, { status: status });
    // Update the task status
    task.status = status;
    await task.save();
    // Create a map for status to column title
    const statusToColumnMap = {
      0: "TO DO",
      1: "IN PROGRESS",
      2: "DONE",
    };
    // Remove task from the old column
    await Column.updateOne(
      { userId, title: statusToColumnMap[oldStatus] },
      { $pull: { taskIds: id } }
    );

    // Add task to the new column
    await Column.updateOne(
      { userId, title: statusToColumnMap[status] },
      { $push: { taskIds: id } }
    );
    return res
      .status(200)
      .json({ success: true, message: "Task status updated successfully" });
  } catch (error) {
    console.log(error);

    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
export const updateTask = async (req, res) => {
  const { title, description, status } = req.body;
  const userId = req.user._id;
  const taskId = req.params.id;
  try {
    if (title.trim() === "" || !description.trim() === "" || !status === null) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide all the fields" });
    }
    const task = await Task.findOne({ _id: taskId, userId });
    if (!task) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    }

    const statusToColumnMap = {
      0: "TO DO",
      1: "IN PROGRESS",
      2: "DONE",
    };

    // Capture the old status before updating the task
    const oldStatus = task.status;

    // Remove task from the old column using the old status
    await Column.updateOne(
      { userId, title: statusToColumnMap[oldStatus] },
      { $pull: { taskIds: taskId } }
    );

    // Update the task's fields
    await Task.updateOne({ _id: taskId }, { title, description, status });

    // Add the task to the new column using the new status
    await Column.updateOne(
      { userId, title: statusToColumnMap[status] },
      { $push: { taskIds: taskId } }
    );

    return res
      .status(200)
      .json({ success: true, message: "Task updated successfully" });

    return res
      .status(200)
      .json({ success: true, message: "Task updated successfully" });
  } catch (error) {
    console.log(error);

    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const deleteTask = async (req, res) => {
  const userId = req.user._id;
  const taskId = req.params.id;
  try {
    const task = await Task.findOne({ _id: taskId, userId });
    if (!task) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    }
    await Task.deleteOne({ _id: taskId });
    return res
      .status(200)
      .json({ success: true, message: "Task deleted successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
