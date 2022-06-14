import axios from "axios";

//sending images to server

export const storeImage = async (files) => {
  try {
    const response = await axios.post(`http://localhost:8000/comments`, {
      files,
    });
    return response;
  } catch (error) {
    console.log(error);
  }
};
