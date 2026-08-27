import { readData } from "../repository/readData.js";
import { writeData } from "../repository/writeData.js";

export const getAllUser = async () => {
  const data = await readData();
  return data.users;
};

export const getUserById = async (userId) => {
  const data = await readData();
  const users = data.users;
  const user = users.find((u) => u.id === parseInt(userId));
  return user;
};

export const addUser = async (userData) => {
  try {
    const data = await readData();
    const nextId =
      data.users.reduce(
        (maxId, user) => Math.max(maxId, Number(user.id) || 0),
        0,
      ) + 1;

    const newUser = {
      ...userData,
      id: nextId,
    };
    data.users.push(newUser);
    await writeData(data);
    console.log("data after adding user:", data);
    return newUser;
  } catch (err) {
    console.log("Error creating users:", err);
    throw err;
  }
};

export const updateUser = async (userId, updatedData) => {
  const data = await readData();
  const userIndex = data.users.findIndex((u) => u.id === parseInt(userId));
  if (userIndex === -1) {
    return null;
  }
  data.users[userIndex] = { ...data.users[userIndex], ...updatedData };
  await writeData(data);
  return data.users[userIndex];
};

export const deleteUser = async (userId) => {
  const data = await readData();
  const userIndex = data.users.findIndex((u) => u.id === parseInt(userId));
  if (userIndex === -1) {
    return null;
  }

  const deletedUser = data.users[userIndex];

  data.users.splice(userIndex, 1);

  await writeData(data);
  return deletedUser;
};
