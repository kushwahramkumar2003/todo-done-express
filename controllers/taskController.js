const Task = require("../models/Task");
const { taskSchema } = require("../utils/validate");
const mongoose = require("mongoose");

const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });
    return res.json(tasks);
  } catch (error) {
    console.error("Error in getTasks:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

const createTask = async (req, res) => {
  try {
    const validatedData = taskSchema.parse(req.body);
    const task = new Task({
      ...validatedData,
      userId: req.user._id,
    });
    await task.save();
    return res.status(201).json(task);
  } catch (error) {
    if (error.name === "ZodError") {
      return res
        .status(400)
        .json({ message: "Invalid data", errors: error.errors });
    }
    console.error("Error in createTask:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

const updateTask = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    const validatedData = taskSchema.parse(req.body);
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Only update allowed fields
    const allowedUpdates = [
      "title",
      "description",
      "status",
      "priority",
      "dueDate",
    ];
    allowedUpdates.forEach((update) => {
      if (validatedData[update] !== undefined) {
        task[update] = validatedData[update];
      }
    });

    await task.save();
    return res.json(task);
  } catch (error) {
    if (error.name === "ZodError") {
      return res
        .status(400)
        .json({ message: "Invalid data", errors: error.errors });
    }
    console.error("Error in updateTask:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

const deleteTask = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    await task.deleteOne();
    return res.json({ message: "Task removed" });
  } catch (error) {
    console.error("Error in deleteTask:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getTasks, createTask, updateTask, deleteTask };
