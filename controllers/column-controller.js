import Column from "../models/column-schema.js";



export const getAllComunsAndTasks = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch columns and tasks
    const columns = await Column.find({ userId }).populate("taskIds");

    if (!columns) {
      return res
        .status(404)
        .json({ success: false, message: "Columns not found" });
    }

  
    return res.status(200).json({ success: true, columns });
  } catch (error) {
    console.log(error);

    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
