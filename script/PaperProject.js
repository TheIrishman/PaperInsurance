"use strict";

var user = {
  accountId: "M. Bird",
  avatar: "avatar_mbird.jpg"
}

var searchEl, blogTitleEl, blogContentEl, popupEl, popupSaveEl, popupCloseEl, popupTextEl;

var thread = null;
var selectedThread = 0;

function setEvent(evnt, el, func) {
  if(el.addEventListener) el.addEventListener(evnt, func, false);
  else if(el.attachEvent) el.attachEvent('on'+evnt, func);
}

function setupPage() {
  searchEl      = document.getElementById("searchText");
  blogTitleEl   = document.getElementById("blogTitle");
  blogContentEl = document.getElementById("blogContainer");
  popupEl       = document.getElementById("overlay");
  popupSaveEl   = document.getElementById("saveComment");
  popupCloseEl  = document.getElementById("closeComment");
  popupTextEl   = document.getElementById("postCommentsText");
  
  
  setEvent("keyup", searchEl, searchKey);
  
  setEvent("click", blogContentEl, togglePost);
  
  setEvent("click", popupSaveEl, saveComment);
  setEvent("click", popupCloseEl, cancelComment);
  
  //get json data using rest call and then process blog
  thread = JSONdata.threads[selectedThread];
  processBlog()
}

function processBlog() {
  var i, j, post, posts, postCount, postComment, postComments, postCommentCount;
  //get and set thread title
  //clear old blog
  blogContentEl.innerHTML = "";
  blogTitleEl.innerHTML = thread.title;
  //for each post add section
  posts = thread.posts;
  postCount = posts.length;
  for(i=0; i<postCount; i++) {
    post = posts[i];
    postComments = post.comments;
    postCommentCount = postComments.length;
    
    var section = document.createElement("div"); 
    section.className = "postSection postClosed";
    
    var avatar  = document.createElement("img"); 
    avatar.className = "postAvatar";
    avatar.src = "img/"+post.avatar;
    section.appendChild(avatar);

    var title   = document.createElement("span"); 
    title.className = "postTitle";
    title.innerHTML = post.title;
    section.appendChild(title);
    
    var author  = document.createElement("span"); 
    author.className = "postAuthor";
    author.innerHTML = post.author + " (" + post.date + ")";
    section.appendChild(author);
    
    var postBody = document.createElement("div"); 
    postBody.className = "postBody";
    postBody.innerHTML = post.post;
    section.appendChild(postBody);
    
    var comments = document.createElement("div"); 
    comments.className = "postComments";

    var commentHead = document.createElement("div"); 
    commentHead.className = "postCommentHead";
    commentHead.innerHTML = "Comments:";
    comments.appendChild(commentHead);

    var commentAdd = document.createElement("button"); 
    commentAdd.className = "postCommentAdd";
    commentAdd.setAttribute("data", i);
    commentAdd.innerHTML = "Add";
    setEvent("click", commentAdd, addComment); 
    comments.appendChild(commentHead);


    for(j=0; j<postCommentCount; j++) {
      //create each comment...
      postComment = postComments[j];
      
      var commentSection  = document.createElement("div"); 
      commentSection.className = "commentSection";
      comments.appendChild(commentSection);


      var commAvatar  = document.createElement("img"); 
      commAvatar.className = "commAvatar";
      commAvatar.src = "img/"+postComment.avatar;
      commentSection.appendChild(commAvatar);

      var commText    = document.createElement("span"); 
      commText.className = "commText";
      commText.innerHTML = postComment.text;
      commentSection.appendChild(commText);

      var commAuthor    = document.createElement("span"); 
      commAuthor.className = "commAuthor";
      commAuthor.innerHTML = postComment.author;
      commentSection.appendChild(commAuthor);

    }
    comments.appendChild(commentAdd);

    postBody.appendChild(comments);
    blogContentEl.appendChild(section);
  }
 
}

function togglePost(e) {
  if(!e) return;
  var trgt = e.target;
  try {
    while(trgt.className.indexOf("postSection") == -1) trgt=trgt.parentNode;
    if(trgt.className.indexOf("postClosed") == -1) trgt.className = "postSection postClosed"
    else trgt.className = "postSection postOpen"
  }
  catch(e) {
  }
}

var selectedPost = null;

function addComment(e) {
  //save selectedpost
  var trgt = e.target;
  selectedPost = trgt.getAttribute("data");
  //open popup
  popupTextEl.value = ""; //clear old text
  popupEl.style.display = "block";
  e.stopPropagation();
}

function saveComment(e) {
  var newComment = {
    text: popupTextEl.value,
    author: user.accountId,
    avatar: user.avatar
  }
  thread.posts[selectedPost].comments.push(newComment);  
  //here we would save the comment via another REST call
  popupEl.style.display = "none";
  processBlog()
}

function cancelComment(e) {
  popupEl.style.display = "none";
}

function searchKey(e) {
  var trgt = e.target;
  var searchTxt = trgt.value;
  if(e.keyCode==13) doSearch(searchTxt);
}

var searchResults = [];

function doSearch(searchTxt) {
  var i, j, posts, postCount, thispost, comments, commentCount, thisComment;
  searchResults = [];
  searchResults.push("Searching for: "+searchTxt+"...");
  searchTxt = searchTxt.toUpperCase();
  posts = thread.posts;
  postCount = posts.length;
  for(i=0; i<postCount; i++) {
    thispost = posts[i];
    if(thispost.title.toUpperCase().indexOf(searchTxt) != -1) addRes("Title", i, thispost.title);
    if(thispost.post.toUpperCase().indexOf(searchTxt) != -1) addRes("Body", i, thispost.post);
    comments = thispost.comments;
    commentCount = comments.length;
    for(j=0; j<commentCount; j++) {
      thisComment = comments[j]
      if(thisComment.text.toUpperCase().indexOf(searchTxt) != -1) addRes("Comments", i, thisComment.text);
    }
  }
  alert(searchResults.join("\n"));
}

function addRes(title, indx, text) {
  searchResults.push("Text found in post["+indx+"], "+title+": "+text);
}

window.onload=setupPage;