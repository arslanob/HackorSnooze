"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);

  // if a user is logged in, show favorite/not-favorite star
  const showStar = Boolean(currentUser);

  const hostName = story.getHostName();
  return $(`
      <li id="${story.storyId}">
        ${showStar ? getStarHTML(story, currentUser) : ""}
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        ${getEditBtnHTML(currentUser, story.storyId)}
        ${getDeleteBtnHTML(currentUser, story.storyId)}
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>

      </li>
    `);
}

function getStarHTML(story, user) {
  const isFavorite = user.isFavorite(story);
  const starType = isFavorite ? "fas" : "far";
  return `
      <span class="star">
        <i class="${starType} fa-star"></i>
      </span>`;
}

function getDeleteBtnHTML(currentUser, storyId) {
  if (currentUser && currentUser.ownStories.some(s=> s.storyId === storyId)) {
  return `
      <span class="trash-can">
        <i class="fas fa-trash-alt"></i>
      </span>`
  }
  else {
    return ""
  }
}

function getEditBtnHTML(currentUser, storyId) {
  if (
    currentUser &&
    currentUser.ownStories.some((s) => s.storyId === storyId)
  ) {
    return `
      <span class="edit-btn">
      <i class="fas fa-edit"></i>
      </span>`;
  } else {
    return "";
  }
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);

    $allStoriesList.append($story);
  }
  $allStoriesList.show();
}



async function post_story(evt) {
  console.debug("add_story", evt);
  evt.preventDefault();

  // grab the title, author and url
  const title = $("#story-title").val();
  const author = $("#story-author").val();
  const url = $("#story-url").val();

  //adding story information to storylist.
  await storyList.addStory(currentUser,
    {title: title, author: author, url: url});

  $storyForm.trigger("reset");
  alert('Your story is posted!')
}
$storyForm.on("submit", post_story);

async function delete_story(evt) {
  console.debug("delete_story")
  evt.preventDefault();
  const trash_story_id = $(evt.target).closest("li").attr("id")

  await storyList.removeStory(currentUser, trash_story_id);

  // re-generate story list
  start();
}

$allStoriesList.on('click', ".trash-can", delete_story)
$ownStories.on('click', ".trash-can", delete_story)


// Edit a story by current user
async function submitEditStoryForm(evt) {
  console.debug("submitEditStoryForm");
  evt.preventDefault();
  console.log(evt.target);
  // grab the new title, author and url
  const storyId = $("#story-edit-id").val();
  const title = $("#story-edit-title").val();
  const author = $("#story-edit-author").val();
  const url = $("#story-edit-url").val();

  await storyList.editStory(currentUser, {
    storyId,
    title,
    author,
    url,
  });

  // re-generate story list
  start();
}

$storyEditForm.on("submit", submitEditStoryForm);

  //** Open edit story form to edit clicked story. */
function editStoryFormClick(evt) {
  console.debug("editStoryFormClick", evt);
  hidePageComponents();
  $storyEditForm.trigger("reset");

  const storyId = $(evt.target).closest("li").attr("id");
  const story = storyList.stories.find((s) => s.storyId === storyId);

  $storyEditId.attr("value", storyId);
  $storyEditTitle.attr("value", story.title);
  $storyEditAuthor.attr("value", story.author);
  $storyEditURL.attr("value", story.url);

  $storyEditForm.show();
}

$allStoriesList.on("click", ".edit-btn", editStoryFormClick);
$favoritedStories.on("click", ".edit-btn", editStoryFormClick);
$ownStories.on("click", ".edit-btn", editStoryFormClick);

/******************************************************************************
 * Functionality for favorites list and starr/un-starr a story
 */

/** Put favorites list on page. */

function putFavoritesListOnPage() {
  console.debug("putFavoritesListOnPage");

  $favoritedStories.empty();

  if (currentUser.favorites.length === 0) {
    $favoritedStories.append("<h5>No favorites added!</h5>");
  } else {
    // loop through all of users favorites and generate HTML for them
    for (let story of currentUser.favorites) {
      const $story = generateStoryMarkup(story);
      $favoritedStories.append($story);
    }
  }

  $favoritedStories.show();
}

/** Put user stories list on page. */
function putUserStoriesOnPage(){
  console.debug("putUserStoriesOnPage");

  $ownStories.empty();
  if (currentUser.ownStories.length === 0) {
    $ownStories.append("<h5>No stories added by user yet!</h5>");
  } else {
    // loop through all of users stories and generate HTML for them
    for (let story of currentUser.ownStories) {
      let $story = generateStoryMarkup(story);
      $ownStories.append($story);
    }
  }

  $ownStories.show();
}

/** Handle favorite/un-favorite a story */

async function toggleStoryFavorite(evt) {
  console.debug("toggleStoryFavorite");

  const $tgt = $(evt.target);
  const $closestLi = $tgt.closest("li");
  const storyId = $closestLi.attr("id");
  const story = storyList.stories.find(s => s.storyId === storyId);

  // see if the item is already favorited (checking by presence of star)
  if ($tgt.hasClass("fas")) {
    // currently a favorite: remove from user's fav list and change star
    await currentUser.removeFavorite(story);
    $tgt.closest("i").toggleClass("fas far");
  } else {
    // currently not a favorite: do the opposite
    await currentUser.addFavorite(story);
    $tgt.closest("i").toggleClass("fas far");
  }
}

$storiesLists.on("click", ".star", toggleStoryFavorite);

