import axios from "axios";

export const getTextToSpeech = async (text, filename) => {
  try {
    const response = axios.post("http://localhost:8000/tts", {
      text,
      filename,
    });
    return response;
  } catch (error) {
    return error;
  }
};
