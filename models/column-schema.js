import mongoose from "mongoose";

const columnSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  taskIds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
  ],
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

const Column = mongoose.model("Column", columnSchema);

export default Column;
