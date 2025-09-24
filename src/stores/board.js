import { defineStore } from "pinia";
import axios from "axios";
//import wordpressApi from "../services/wordpressApi";
export const useBoardStore = defineStore("board", {
  state: () => ({
    lists: [],
    posts: [],
    comments: [],
    loading: false,
    error: null,
  }),
  getters: {
    getPostsByListId: (state) => (listId) => {
      return state.posts.filter(
        (post) => post.categories && post.categories.includes(listId)
      );
    },
    getCommentsByPostId: (state) => (postId) => {
      return state.comments.filter((comment) => comment.post === postId);
    },
    listHasPosts: (state) => (listId) => {
      return state.posts.some(
        (post) => post.categories && post.categories.includes(listId)
      );
    },
  },
  actions: {
    handleError(error) {
      console.error("Store Error:", error);
      if (
        error.message?.includes("connecté") ||
        error.message?.includes("permissions")
      ) {
        this.error = error.message;
      } else {
        this.error = error.message || "Une erreur est survenue";
      }

      this.loading = false;
    },
    clearError() {
      this.error = null;
    },
    async fetchLists() {
      this.loading = true;
      this.clearError();

      try {
        //const lists = await wordpressApi.getCategories();
        const lists = await axios.get(
          "http://localhost:10004/wp-json/wp/v2/categories"
        );
        this.lists = lists.data;
        console.log("Listes récupérées:", lists.length, "listes");
      } catch (error) {
        this.handleError(error);
      } finally {
        this.loading = false;
      }
    },

    async createList(listData) {
      this.loading = true;
      this.clearError();

      try {
        console.log("Création de liste:", listData);
        await axios.post(
          "https://twp.coding-academy.website/wp-json/wp/v2/categories",
          listData
        );
        /*const newList = await wordpressApi.createCategory({
          name: listData.name,
          description: listData.description || "",
          slug:
            listData.slug || listData.name.toLowerCase().replace(/\s+/g, "-"),
        });*/
        //this.lists.push(newList);
        console.log("Liste créée:", newList.name);
        return newList;
      } catch (error) {
        console.error("Erreur création liste:", error);
        this.handleError(error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateList(listId, listData) {
      this.loading = true;
      this.clearError();

      try {
        console.log("Mise à jour liste:", listId, listData);
        const updatedList = await wordpressApi.updateCategory(listId, listData);
        const index = this.lists.findIndex((list) => list.id === listId);
        if (index !== -1) {
          this.lists[index] = updatedList;
        }
        console.log("Liste mise à jour:", updatedList.name);
        return updatedList;
      } catch (error) {
        console.error("Erreur mise à jour liste:", error);
        this.handleError(error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    async deleteList(listId) {
      this.loading = true;
      this.clearError();

      try {
        console.log("Suppression liste:", listId);
        await wordpressApi.deleteCategory(listId);
        this.lists = this.lists.filter((list) => list.id !== listId);
        this.posts = this.posts.filter(
          (post) => !post.categories || !post.categories.includes(listId)
        );
        console.log("Liste supprimée");
      } catch (error) {
        console.error("Erreur suppression liste:", error);
        this.handleError(error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    async fetchPosts() {
      this.loading = true;
      this.clearError();
      try {
        //const posts = await wordpressApi.getPosts();
        const posts = await axios.get(
          "https://twp.coding-academy.website/wp-json/wp/v2/posts"
        );
        this.posts = posts.data;
        console.log("Posts récupérés:", posts.length, "posts");
      } catch (error) {
        this.handleError(error);
      } finally {
        this.loading = false;
      }
    },
  },
  async createPost(postData) {
    this.loading = true;
    this.clearError();

    try {
      console.log("Création post:", postData);
      /*const newPost = await wordpressApi.createPost({
        title: postData.title,
        content: postData.content || "",
        status: "publish",
        categories: postData.categories || [],
      });*/
      const reponse = await axios.post(
        "https://twp.coding-academy.website/wp-json/wp/v2/posts",
        {
          title: postData.title,
          content: postData.content || "",
          status: "publish",
          categories: postData.categories || [],
        }
      );
      console.log(reponse.data);
      //this.posts.push(newPost);
      console.log("Post créé:", newPost.title?.rendered);
      return newPost;
    } catch (error) {
      console.error("Erreur création post:", error);
      this.handleError(error);
      throw error;
    } finally {
      this.loading = false;
    }
  },
  async updatePost(postId, postData) {
    this.loading = true;
    this.clearError();

    try {
      console.log("Mise à jour post:", postId, postData);
      const updatedPost = await wordpressApi.updatePost(postId, postData);
      const index = this.posts.findIndex((post) => post.id === postId);
      if (index !== -1) {
        this.posts[index] = updatedPost;
      }
      console.log("Post mis à jour:", updatedPost.title?.rendered);
      return updatedPost;
    } catch (error) {
      console.error("Erreur mise à jour post:", error);
      this.handleError(error);
      throw error;
    } finally {
      this.loading = false;
    }
  },

  async deletePost(postId) {
    this.loading = true;
    this.clearError();

    try {
      console.log("Suppression post:", postId);
      await wordpressApi.deletePost(postId);
      this.posts = this.posts.filter((post) => post.id !== postId);
      this.comments = this.comments.filter(
        (comment) => comment.post !== postId
      );
      console.log("Post supprimé");
    } catch (error) {
      console.error("Erreur suppression post:", error);
      this.handleError(error);
      throw error;
    } finally {
      this.loading = false;
    }
  },
  async fetchComments(postId) {
    try {
      //const comments = await wordpressApi.getComments(postId);
      const comments = axios.get(
        "https://twp.coding-academy.website/wp-json/wp/v2/comments?post=1"
      );
      const existingComments = this.comments.filter((c) => c.post !== postId);
      this.comments = [...existingComments, ...comments];
      console.log(
        "Commentaires récupérés:",
        comments.length,
        "commentaires pour le post",
        postId
      );
    } catch (error) {
      console.error("Erreur chargement commentaires:", error);
    }
  },

  async createComment(commentData) {
    this.loading = true;
    this.clearError();

    try {
      console.log("Création commentaire:", commentData);
      const newComment = await wordpressApi.createComment({
        post: commentData.postId,
        content: commentData.content,
        author_name: commentData.authorName || "Anonymous",
        author_email: commentData.authorEmail || "anonymous@example.com",
      });
      this.comments.push(newComment);
      console.log("Commentaire créé");
      return newComment;
    } catch (error) {
      console.error("Erreur création commentaire:", error);
      this.handleError(error);
      throw error;
    } finally {
      this.loading = false;
    }
  },

  async deleteComment(commentId) {
    this.loading = true;
    this.clearError();

    try {
      console.log("Suppression commentaire:", commentId);
      await wordpressApi.deleteComment(commentId);
      this.comments = this.comments.filter(
        (comment) => comment.id !== commentId
      );
      console.log("Commentaire supprimé");
    } catch (error) {
      console.error("Erreur suppression commentaire:", error);
      this.handleError(error);
      throw error;
    } finally {
      this.loading = false;
    }
  },

  async initializeBoard() {
    console.log("Initialisation du board...");
    await Promise.all([this.fetchLists(), this.fetchPosts()]);

    console.log("Board initialisé");
    console.log(
      `Résumé: ${this.lists.length} listes, ${this.posts.length} posts`
    );
  },
});
