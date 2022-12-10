import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { API, API_CREATE, API_POSTS, API_STATUS } from "../constants";

const initialState = {
  posts: [],
  status: API_STATUS.idle,
  error: null,
};

export const fetchPosts = createAsyncThunk("notes/fetchPosts", async () => {
  const token = await AsyncStorage.getItem("token");
  const response = await axios.get(API + API_POSTS, {
    headers: { Authorization: `JWT ${token}` },
  });
  return response.data;
});

export const addNewPost = createAsyncThunk(
  "notes/addNewPost",
  async (newPost) => {
    // newpost = {id: "2", title: "good", content: "night"}
    const token = await AsyncStorage.getItem("token");
    const response = await axios.post(API + API_CREATE, newPost, {
      headers: { Authorization: `JWT ${token}` },
    });
    return response.data;
    // respone.data = [
    // {id:"1", title: "helloo", content: "world"},
    // {id:"2", title: "good", content: "night"},
    // ]
  }
);

export const updatePostThunk = createAsyncThunk(
  "posts/updatePost",
  async (updatedPost) => {
    // updatePost = {id: "2", title: "good", content: "night"}
    const token = await AsyncStorage.getItem("token");
    const response = await axios.put(
      // url.com/posts/2
      API + API_POSTS + "/" + updatedPost.id,
      updatedPost,
      {
        headers: { Authorization: `JWT ${token}` },
      }
    );
    return response.data;
  }
);

export const deletePostThunk = createAsyncThunk(
  "posts/deletePost",
  async (id) => {
    const token = await AsyncStorage.getItem("token");
    await axios.delete(API + API_POSTS + `/${id}`, {
      headers: { Authorization: `JWT ${token}` },
    });
    return id;
  }
);

const notesSlice = createSlice({
  name: "notes",
  initialState,
  // extra reducers is used with async thunk function
  // builder is basically a way to add your different api status
  extraReducers(builder) {
    // addCase is like "what happens when there is a case of"
    // addCase(fetchPosts.Pending)
    // "what happens when there is a case of fetchPosts is pending/loading"
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.status = API_STATUS.pending;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.status = API_STATUS.fulfilled;
        // state.posts = [ {id: "1", title: "hello", content: "world"}]
        // action.payload = [ {id: "2", title: "good", content: "night"}]
        // concat is to merge 2 arrays
        state.posts = state.posts.concat(action.payload);
        // state.posts = [
        // {id: "1", title: "hello", content: "world"}
        // {id: "2", title: "good", content: "night"}
        // ]
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.status = API_STATUS.rejected;
        state.error = action.error.message;
        // this state.error is for internal system use to show what is the error message
        console.log("Failed to fetch posts. Error:", action.error.message);
      })
      .addCase(addNewPost.fulfilled, (state, action) => {
        // state.posts = [ {id: "1", title: "hello", content: "world"}]
        // action.payload = [ {id: "2", title: "good", content: "night"}]

        state.posts.push(action.payload);
        // state.posts = [
        // {id: "1", title: "hello", content: "world"}
        // {id: "2", title: "good", content: "night"}
        // ]
      })
      .addCase(updatePostThunk.fulfilled, (state, action) => {
        // action.payload = {id: "2", title: "good", content: "night"}
        // const title = action.payload.title
        // const content = action.payload.content

        const { id, title, content } = action.payload;
        const existingPost = state.posts.find((post) => post.id === id);
        if (existingPost) {
          existingPost.title = title;
          existingPost.content = content;
        }
      })

      .addCase(deletePostThunk.fulfilled, (state, action) => {
        const id = action.payload;
        const updatedPosts = state.posts.filter((item) => item.id !== id);
        state.posts = updatedPosts;
      });
  },
});

export const { noteAdded } = notesSlice.actions;

export default notesSlice.reducer;
