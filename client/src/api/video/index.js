import axios from "axios";

//sending url to download and convert youtube video
export const convertVideo = async (url, duration) => {
  try {
    const response = await axios.get(
      `http://localhost:8000/yt?url=${url}&duration=${duration}`
    );
    return response;
  } catch (error) {
    console.log(error);
  }
};

//get the video from server
export const getFile = async (fileName) => {
  try {
    const response = await axios.get(
      `http://localhost:8000/assets/videos/${fileName}.mp4`
    );
    return response;
  } catch (error) {
    console.log(error);
  }
};
