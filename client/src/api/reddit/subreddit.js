import axios from "axios";

//get random post from subreddit
export const getPost = async ({ subreddit, type }) => {
  try {
    const response = await axios.get(
      `https://www.reddit.com/r/${subreddit}/${type}.json`
    );
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

//get comments of a post
export const getComments = async (postId) => {
  try {
    const response = await axios.get(
      `http://localhost:8000/post/comment?id=${postId}`
    );
    return response;
  } catch (error) {}
};
