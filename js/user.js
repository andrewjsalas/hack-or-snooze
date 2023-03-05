"use strict";

let currentUser;

// User login/signup form submission logic
async function login(evt) {
  console.debug("login", evt);
  evt.preventDefault();

  // Grab the username and password
  const username = $("#login-username").val();
  const password = $("#login-password").val();

  currentUser = await User.login(username, password);
  $loginForm.trigger("reset");

  saveUserCredentialsInLocalStorage();
  updateUIOnUserLogin();
}

$loginForm.on("submit", login);

// Signup form submission logic
async function signup(evt) {
  console.debug("signup", evt);
  evt.preventDefault();

  const name = $("#signup-name").val();
  const username = $("#signup-username").val();
  const password = $("#signup-password").val();

  currentUser = await User.signup(username, password, name);

  saveUserCredentialsInLocalStorage();
  updateUIOnUserLogin();

  $signupForm.trigger("reset");
}

$signupForm.on("submit", signup);

// Logout button logic
function logout(evt) {
  console.debug("logout", evt);
  localStorage.clear();
  location.reload();
}

$navLogOut.on("click", logout);


// Store and recall previously logged-in user information 
async function checkForRememberedUser() {
  console.debug("checkForRememberedUser");
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");
  if (!token || !username) return false;

  // Try to log in with these credentials (will be null if login failed)
  currentUser = await User.loginViaStoredCredentials(token, username);
}

// Sync current user information to localStorage
function saveUserCredentialsInLocalStorage() {
  console.debug("saveUserCredentialsInLocalStorage");
  if (currentUser) {
    localStorage.setItem("token", currentUser.loginToken);
    localStorage.setItem("username", currentUser.username);
  }
}


function updateUIOnUserLogin() {
  console.debug("updateUIOnUserLogin");

  putStoriesOnPage();
  $allStoriesList.show();

  updateNavOnLogin();
  generateUserProfile();
}

// Show user profile
function generateUserProfile() {
  console.debug("generateUserProfile");
  $("#profile-name").text(currentUser.name);
  $("#profile-username").text(currentUser.username);
  $("#profile-account-date").text(currentUser.createdAt.slice(0, 10));
}


