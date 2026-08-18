import * as userService from "../services/user.service.js";

export const getAllUser = async (req, res) => {
  try {
    const users = await userService.getAllUser();

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to read users data" });
  }
};

export const getUserById = async (req, res) => {
  const userId = req.params.id;

  try {
    const users = await userService.getAllUser();
    const user = users.find((u) => u.id === parseInt(userId));

    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to read users data" });
  }
};
