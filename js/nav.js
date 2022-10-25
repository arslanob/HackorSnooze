"use strict";

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */

function navAllStories(evt) {
  console.debug("navAllStories", evt);
  hidePageComponents();
  putStoriesOnPage();
}

$body.on("click", "#nav-all", navAllStories);

/** Show login/signup on click on "login" */

function navLoginClick(evt) {
  console.debug("navLoginClick", evt);
  hidePageComponents();
  $loginForm.show();
  $signupForm.show();
}

$navLogin.on("click", navLoginClick);


/** Show favorite stories on click on "favorites" */

function navFavoritesClick(evt) {
  console.debug("navFavoritesClick", evt);
  hidePageComponents();
  putFavoritesListOnPage();
}

$body.on("click", "#nav-favorites", navFavoritesClick);


/** Show user stories on click on "my stories" */

function navMystoriesClick(evt) {
  console.debug("navMystoriesClick", evt);
  hidePageComponents();
  putUserStoriesOnPage();
}

$body.on("click", "#nav-mystories", navMystoriesClick);


/** Show user profile on click on username */

function navUserProfileClick(evt) {
  console.debug("UserprofileClick", evt);
  hidePageComponents();
  $welcomeUser.text(` Welcome ${currentUser.username}!`)
  $userForm.show();
  $navUserProfile.text(`${currentUser.username}`).show()
}

$body.on("click", "#nav-user-profile", navUserProfileClick);


/** When a user first logins in, update the navbar to reflect that. */

function updateNavOnLogin() {
  console.debug("updateNavOnLogin");
  $(".main-nav-links").show();
  $navLogin.hide();
  $navLogOut.show();
  $navSubmit.show();
  $navFavorites.show();
  $navMystories.show();

  $navUserProfile.text(`${currentUser.username}`).show();
}

/** Open Post a story page */
function submitStoryClick(evt) {
  console.debug("submitStoryClick", evt);
  hidePageComponents();
  $storyForm.show();
}

$navSubmit.on("click", submitStoryClick);