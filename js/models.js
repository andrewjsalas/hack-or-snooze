"use strict";

const BASE_URL = "https://hack-or-snooze-v3.herokuapp.com";

class Story {

  // Instance of story from data object 
  constructor({ storyId, title, author, url, username, createdAt }) {
    this.storyId = storyId;
    this.title = title;
    this.author = author;
    this.url = url;
    this.username = username;
    this.createdAt = createdAt;
  }

  // Parse and return host name
  getHostName() {
    return new URL(this.url).host;
  }
}


// Story List Class //
class StoryList {
  constructor(stories) {
    this.stories = stories;
  }

  // Generate stories list 
  static async getStories() {
    const response = await axios({
      url: `${BASE_URL}/stories`,
      method: "GET",
    });

    // Turn story objects from API into instances of Story class
    const stories = response.data.stories.map(story => new Story(story));
    return new StoryList(stories);
  }

  // Add story to API, makes a story instance, and adds it to the stories list.
  async addStory( user, { title, author, url }) {
    const token = user.loginToken;
    const response = await axios({
      method: "POST",
      url: `${BASE_URL}/stories`,
      data: { token, story: { title, author, url } }
    });

    const story = new Story(response.data.story);
    this.stories.unshift(story);
    this.ownStories(story);

    return story;
  }

  // Delete Story
  async removeStory(user, storyId) {
    const token = user.loginToken;
    await axios({
      url: `${BASE_URL}/stories/${storyId}`,
      method: "DELETE",
      data: { token: user.loginToken }
    });

    // Removes story from list by ID
    this.stories = this.stories.filter(story => story.storyID !== storyId);

    // Removes stories list and favorites by ID
    user.ownStories = user.ownStories.filter(s => s.storyId !== storyId);
    user.favorites = user.favorites.filter(s => s.storyId !== storyId);
  }
}


// Current user class
class User {

  // Create instance of User
  constructor({
                username,
                name,
                createdAt,
                favorites = [],
                ownStories = []
              },
              token) {
    this.username = username;
    this.name = name;
    this.createdAt = createdAt;

    // Instantiate Story instances for the user's favorites and ownStories
    this.favorites = favorites.map(s => new Story(s));
    this.ownStories = ownStories.map(s => new Story(s));

    // Store the login token on the user so it's easy to find for API calls.
    this.loginToken = token;
  }

  // Register new user
  static async signup(username, password, name) {
    const response = await axios({
      url: `${BASE_URL}/signup`,
      method: "POST",
      data: { user: { username, password, name } },
    });

    let { user } = response.data

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories
      },
      response.data.token
    );
  }

  // Login user
  static async login(username, password) {
    const response = await axios({
      url: `${BASE_URL}/login`,
      method: "POST",
      data: { user: { username, password } },
    });

    let { user } = response.data;

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories
      },
      response.data.token
    );
  }

  // Logs in user automatically after obtaining and saving log in credentials
  static async loginViaStoredCredentials(token, username) {
    try {
      const response = await axios({
        url: `${BASE_URL}/users/${username}`,
        method: "GET",
        params: { token },
      });

      let { user } = response.data;

      return new User(
        {
          username: user.username,
          name: user.name,
          createdAt: user.createdAt,
          favorites: user.favorites,
          ownStories: user.stories
        },
        token
      );
    } catch (err) {
      console.error("loginViaStoredCredentials failed", err);
      return null;
    }
  }

  // Add story to favorites list
  async addFavorite(story) {
   this.favorites.push(story);
   await this._addOrRemoveFavorite("add", story);
  }

  // Remove story from favorites list
  async removeFavorite(story) {
    this.favorites = this.favorites.filter(s => s.storyId !== story.storyId);
    await this._addOrRemoveFavorite("remove", story);
  }

  // Function for adding or removing story from favorites list
  async _addOrRemoveFavorite(newState, story) {
    const method = newState == "add" ? "POST" : "DELETE";
    const token = this.loginToken;
    await axios({
      url: `${BASE_URL}/users/${this.username}/favorites/${story.storyId}`,
      method: method,
      data: { token },
    });
  }

  // Return true/false if given story instance is a favorite of 'this' user
  isFavorite(story) {
    return this.favorites.some(s => (s.storyId === story.storyId));
  }

}

