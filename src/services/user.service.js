import { readData } from "../../utils/readData.js";

export const getAllUser = async () => {
  try {
    const data = await readData();
    const users = data.users;
    return users;
  } catch (error) {
    console.error("Error reading users data:", error);
    throw error;
  }
};

export const getUserById = async (userId) => {
  try {
    const data = await readData();
    const users = data.users;
    const user = users.find((u) => u.id === parseInt(userId));
    return user;
  } catch (error) {
    console.error("Error reading users data:", error);
    throw error;
  }
};
