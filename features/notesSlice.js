import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { API_STATUS } from "../constants";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";

const initialState = {
  posts: [],
  status: API_STATUS.idle,
  error: null,
};

export const fetchPosts = createAsyncThunk("notes/fetchPosts", async () => {
  const querySnapshot = await getDocs(collection(db, "notes"));
  const notes = querySnapshot.docs.map((doc) => {
    // return { id: ' sUzDhXjaE8J26lIuWzI7', title: 'Firestore Redux' , content: 'World'}
    return { id: doc.id, ...doc.data() };
  });
  return notes;
});

export const addNewPost = createAsyncThunk(
  "notes/addNewPost",
  async (newPost) => {
    await setDoc(doc(db, "notes", newPost.id), newPost);
    return newPost;
  }
);

export const updatePostThunk = createAsyncThunk(
  "notes/updatePost",
  async (updatedPost) => {
    await updateDoc(doc(db, "notes", updatedPost.id), updatedPost);
    return updatedPost;
  }
);

export const deletePostThunk = createAsyncThunk(
  "posts/deletePost",
  async (id) => {
    await deleteDoc(doc(db, "notes", id));
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

        const { id } = action.payload;
        // const id = action.payload.id
        const posts = state.posts;
        const post = posts.find((post) => post.id === id);
        // const post = {id: "12dsafsd", ....}
        const postIndex = posts.indexOf(post);
        // const postIndex = 1
        // if we have an index of the post, lets update the whole post
        if (~postIndex) posts[postIndex] = action.payload;
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
