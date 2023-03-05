"use strict";
const $body = $("body");

const $storiesLoadingMsg = $("#stories-loading-msg");
const $allStoriesList = $("#all-stories-list");
const $favoritedStories = $("#favorited-stories");
const $ownStories = $("#my-stories");
const $storiesList = $(".stories-list");
const $loginForm = $("#login-form");
const $signupForm = $("#signup-form");
const $submitForm = $("#submit-form");
const $navSubmitStory = $("#nav-submit-story");
const $navLogin = $("#nav-login");
const $navUserProfile = $("#nav-user-profile");
const $navLogOut = $("#nav-logout");
const $userProfile = $("#user-profile");

// Hide all components until specific components are called
function hidePageComponents() {
  const components = [
    $allStoriesList,
    $submitForm,
    $loginForm,
    $signupForm,
    $userProfile
  ];
  components.forEach(c => c.hide());
}

// Function to start the app
async function start() {
  console.debug("start");

  await checkForRememberedUser();
  await getAndShowStoriesOnStart();

  if (currentUser) updateUIOnUserLogin();
}

// Start the app
$(start);
