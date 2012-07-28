// record template: fullname=<fullname>&email=<email>&username=<username>&password=<password>&tweets=<tweet1>;<tweet2>;&following=<userKey1>;<userKey2>&followers=<userKey1>;<userKey2>
var historyStack = [];
var lastPage = "SignIn.html";
var recordID = getLastRecordID();
var logedInUser = getLogedInUser();


function getLogedInUser() {
	var user = "";
	try {
		user = localStorage.getItem('TWITTER_LOGED_IN_USER');
	} catch (e) {
		return "";
	}
	return user;
}

function setLogedInUser(userName) {
	try {
		localStorage.setItem('TWITTER_LOGED_IN_USER', userName);
	} catch (e) {
		if(e == QUOTA_EXCEEDED_ERR) {
			alert('Quota exceeded!');
		}
	}
}

function getLastRecordID() {
	var maxID = 0;
	for(var i = 0; i < localStorage.length; i++) {
		var itemKey = localStorage.key(i);
		if(itemKey.slice(0, "TWITTER_USER_".length) == "TWITTER_USER_") {
			var id = itemKey.slice("TWITTER_USER_".length, itemKey.length);
			id = parseInt(id);
			if(id > maxID) {
				maxID = id;
			}
		}
	}
	return maxID;
}

function addRecord(theRecord) {
	try {
		recordID++;
		var recordKey = "TWITTER_USER_" + recordID;
		theRecord += '&tweets=&following=&followers=';
		localStorage.setItem(recordKey, theRecord);
		logedInUser = recordKey;
		setLogedInUser(recordKey);
	} catch (e) {
		if(e == QUOTA_EXCEEDED_ERR) {
			alert('Quota exceeded!');
		}
	}
}

function changeRecord(theRecord) {
	try {
		var recordKey = getLogedInUser();
		localStorage.setItem(recordKey, theRecord);
	} catch (e) {
		if(e == QUOTA_EXCEEDED_ERR) {
			alert('Quota exceeded!');
		}
	}
}

//Sign in user
function doSignIn(inputVals) {
	var inValues = inputVals.split("&")
	var inUserName = inValues[0].split("=")[1];
	for(var i = 0; i < localStorage.length; i++) {
		var itemKey = localStorage.key(i);
		if(itemKey.indexOf("TWITTER_USER_") == 0) {
			var values = localStorage.getItem(itemKey);
			var userName = values.split("&")[2].split("=")[1];
			if(inUserName == userName) {
				setLogedInUser(itemKey);
				return true;
			}
		}
	}
	return false;
}

function loadingWindowON() {
	$('#loading_info').remove();
	$('body').append('<div class="loading_window" id="loading_info" ><img src="images/loading.gif" style="width:24px" /><div>Loading...</div></div>');
}

function loadingWindowOFF() {
	$('#loading_info').remove();
}

//Handle form submission
function handleSubmitEvent(event) {
	var values = $("form").serialize();
	if ($("#signin-form").length) {
		var signedIn = doSignIn(values);
		if(!signedIn) {
			alert("User does not exist!");
			return false;
		}
		return true;
	}
	//update profile
	var result = 'Submission Form Does Not Exist!';
	if(lastPage.toLowerCase() == "profile.html") {
		result = validateUpdate(values);
		if (result == 'OK') {
			{
				var map = localStorage.getItem(getLogedInUser()).split('&');
				changeRecord(values + "&" + map[4] + "&" + map[5] + "&" + map[6]);
				return true;
			}
		}
	}
	//create profile
	if(lastPage == "signup.html") {
		result = validate(values);
		if(result == 'OK') {	
			addRecord(values);
			return true;
		}
	}
	alert(result);
	return false;
}

//Validate if new user's data is legitimate
function validate(inValues) {
	var result = 'OK';
	var map = inValues.split("&");
	//create an array of the values
	var fullName = map[0].split("=")[1];
	var email = map[1].split("=")[1];
	var userName = map[2].split("=")[1];
	var password = map[3].split("=")[1];
	if(fullName == "" || email == "" || userName == "" || password == "") {
		result = 'Blank values are not allowed!';
	}
	if(userName != password) {
		result = 'Username and password must match!';
	}
	if(usernameAlreadyExists(userName)) {
		result = 'Username already exist';
	}
	return result;
}

//Validate if user data update is legitimate
function validateUpdate(inValues) {
	var result = 'OK';
	var map = inValues.split("&");
	//create an array of the values
	var fullName = map[0].split("=")[1];
	var email = map[1].split("=")[1];
	var userName = map[2].split("=")[1];
	var password = map[3].split("=")[1];
	if(fullName == "" || email == "" || userName == "" || password == "") {
		result = 'Blank values are not allowed!';
	}
	if(userName != password) {
		result = 'Username and password must match!';
	}
	return result;
}

//Check username against user list
function usernameAlreadyExists(inUserName) {
	for(var i = 0; i < localStorage.length; i++) {
		var itemKey = localStorage.key(i);
		if(itemKey.indexOf("TWITTER_USER_") == 0) {
			var values = localStorage.getItem(itemKey);
			values = values.split("&");
			if(values) {
				var userName = values[2].split("=")[1];
				if(userName) {
					if(userName == inUserName) {
						return true;
					}
				}
			}
		}
	}
	return false;
}


//Apply content to page
function loadContent(url, intoTag) {
	try {
		url = url.toLowerCase();
		// Create the request object
		ajaxRequest = new XMLHttpRequest();

		// Register event handler
		ajaxRequest.onreadystatechange = function stateChange() {
			if(ajaxRequest.readyState == 4 && ajaxRequest.status == 200) {
				document.getElementById(intoTag).innerHTML = ajaxRequest.responseText;
				// less than one second
				setTimeout("loadingWindowOFF();", 150);
				// We now process the page
				processPage(url);
			}
		};
		// Set request parameters
		ajaxRequest.open('GET', url + "?tt=" + Math.random(), true);

		// Execute it
		ajaxRequest.send();
		
		//Store last page in localStorage
		if (url!='#') {
			localStorage.setItem("TWITTER_LAST_PAGE", url.toLowerCase());
		}
	} catch ( exception ) {
		alert('Ajax Error');
	}
}

//Special page processes
function processPage(thePage) {
	if(thePage == "me.html") {
		processMe();
	}
	if(thePage == "profile.html") {
		processProfile();
	}
	if(thePage == "tweets.html") {
		processTweets();
	}
	if(thePage == "search.html") {
		processSearch();
	}
}

//Filter user list according to search field
function processSearch() {
	var users = getAllUsers();
	for(var i = 0; i < users.length; i++) {
		var user = users[i];
		if(user != getLogedInUser()) {
			var userName = getUserName(user);
			var fullName = getFullName(user);
			if (userName.toLowerCase().indexOf($("#user-search-box").val().toLowerCase()) != -1 || fullName.toLowerCase().indexOf($("#user-search-box").val().toLowerCase()) != -1)
			{
				if (isFollowed(user))
				{
					var li = '<li class="selectable ac-match userselect"><img src="images/following.png" class="twitter-follow-button" onclick="removeFollowing(\'' + user + '\')"><img src="images/larrybird.png" class="search-avatar"><span class="ac-item"><b class="ac-screenname">@' + userName + '</b><em class="ac-fullname">&nbsp' + fullName + '</em></span></li>';
				}
				else
				{
					var li = '<li class="selectable ac-match userselect"><img src="images/follow.png" class="twitter-follow-button" onclick="addFollowing(\'' + user + '\')"><img src="images/larrybird.png" class="search-avatar"><span class="ac-item"><b class="ac-screenname">@' + userName + '</b><em class="ac-fullname">&nbsp' + fullName + '</em></span></li>';
				}
				$('.autocomplete-container').append(li);
			}
		}
	}

}

var geoLocArray;

function processTweets() {
	var users = getAllUsers();
	for(var i = 0; i < users.length; i++) {
		var userKey = users[i];
		var tweets = getTweets(userKey);
		for(var j = 0; j < tweets.length; j++) {
			if (tweets[j] != "") {
				addTweet(userKey, tweets[j]);
			}
		}
	}
	// start tweets page with following tweets
	showFollowingTweets();
}

function getTweetsCount(userKey) {
	var tweets = getTweets(userKey);
	return tweets.length - 1;
}

function getFollowingCount(userKey) {
	var res = getFollowing(userKey);
	return res.length - 1;
}

function getFollowersCount(userKey) {
	var res = getFollowers(userKey);
	return res.length - 1;
}

//Returns a user's full name from key
function getFullName(userKey) {
	var values = localStorage.getItem(userKey);
	return unescape(values.split('&')[0].split('=')[1]).replace('+', ' ');
}

//Returns a user's username from key
function getUserName(userKey) {
	var values = localStorage.getItem(userKey);
	return values.split('&')[2].split('=')[1];
}

//shows geo loc map image in Tweet
function showImage(rawText)
{
	var tweet = unescape(rawText).split(';')[0];
	var geoLoc = unescape(rawText).split(';')[1];
	var imageurl = "http://maps.google.com/maps/api/staticmap?sensor=true&center=" + geoLoc.split(',')[0] + "," + 
		geoLoc.split(',')[1] + "&zoom=14&size=300x400&language=iw&markers=color:red|label:X|" +  
		geoLoc.split(',')[0] + "," +  geoLoc.split(',')[1];	
	document.getElementById(rawText + 'img').innerHTML = '<br>Google Map Location:<br><img align="left" width="240" height="300" src="' + imageurl + '" >';
	
}

//Hide map image
function hideImage(rawText)
{
	document.getElementById(rawText + 'img').innerHTML = "";
}

//Displays a single tweet as <li>
function addTweet(userKey, rawText) {
	var fullName = getFullName(userKey);
	var userName = getUserName(userKey);
	var tweetText = unescape(rawText).split(';')[0];
	var tweetGeoLoc = unescape(rawText).split(';')[1];
	var tweetGeoLocText = unescape(rawText).split(';')[2];
	if (tweetGeoLoc != null)
	{ 
		var newListItem = '<li  class="stream-item stream-tweet" userKey="' + userKey + '" onmouseout="hideImage(\'' + rawText + '\')" onclick="showImage(\'' + rawText + '\')">'+
			'<div class="stream-item-wrapper"><i class="tweet-dogear"></i><div class="profile-link tweet-image">' +
			'<img class="mini-avatar" src="images/larrybird.png"></div><div class="tweet-content""><div class="tweet-row"><div class="user-name"><span class="full-name">'
			+ fullName + '&nbsp;</span><span class="screen-name"><s>@</s>' + userName +
			'</span></div></div><div class="tweet-text"><div>' + unescape(tweetText).replace("&semcol",";").replace("&apos","'") + '</div></div><div id="' + rawText + 'img"></div><div class="geo-loc-text" align="right">'
			+ tweetGeoLocText + '</div></div></div></li>';
			$('.stream-items').append(newListItem);
	}
	else
	{
		var newListItem = '<li class="stream-item stream-tweet" userKey="' + userKey +
			'"><div class="stream-item-wrapper"><i class="tweet-dogear"></i><div class="profile-link tweet-image">' +
			'<img class="mini-avatar" src="images/larrybird.png"></div><div class="tweet-content"><div class="tweet-row"><div class="user-name"><span class="full-name">' +
			fullName + '&nbsp;</span><span class="screen-name"><s>@</s>' + userName + '</span></div></div><div class="tweet-text"><div>' +
			unescape(tweetText).replace("&semcol",";").replace("&apos","'") + '</div></div></div></div></li>';
			$('.stream-items').append(newListItem);
	}
}

//Filters tweets to show only followings' tweets
function showFollowingTweets() {
	// handle buttons
	$('.active').removeClass('active');
	$('.follwing').addClass('active');
	// hide all shown tweets
	$('li.stream-item').removeClass('show-tweet hide-tweet').addClass('hide-tweet');

	// show only the relevant tweets
	var users = getFollowing(getLogedInUser());
	for(var i = 0; i < users.length; i++) {
		$('li[userKey*="' + users[i] + '"]').removeClass('hide-tweet').addClass('show-tweet');
	}
}

//Filters tweets to show only followers' tweets
function showFollowersTweets() {
	// handle buttons
	$('.active').removeClass('active');
	$('.followers').addClass('active');
	// hide all shown tweets
	$('li.stream-item').removeClass('show-tweet hide-tweet').addClass('hide-tweet');

	// show only the relevant tweets
	var users = getFollowers(getLogedInUser());
	for(var i = 0; i < users.length; i++) {
		$('li[userKey*="' + users[i] + '"]').removeClass('hide-tweet').addClass('show-tweet');
	}
}

//Filters tweets to show only my tweets
function showMyTweets() {
	// handle buttons
	$('.active').removeClass('active');
	$('.me').addClass('active');
	// hide all shown tweets
	$('li.stream-item').removeClass('show-tweet hide-tweet').addClass('hide-tweet');

	// show only the relevant tweets
	var user = getLogedInUser();
	$('li[userKey*="' + user + '"]').removeClass('hide-tweet').addClass('show-tweet');
}

//Processes profile of logged in user
function processProfile() {
	var user = getLogedInUser();
	if(user != null && user != "") {
		var values = localStorage.getItem(user);
		var map = values.split("&");
		var fullName = getFullName(user);
		var email = map[1].split("=")[1];
		var userName = map[2].split("=")[1];
		var password = map[3].split("=")[1];
		$('#fullname').val(fullName);
		$('#email').val(unescape(email));
		$('#username').val(unescape(userName));
	} else {
		alert('You must log on first!');
		logout();
	}
}

//Process "Me" (my tweets)
function processMe() {
	var user = getLogedInUser();
	if(user != null && user != "") {
		var values = localStorage.getItem(user);
		var map = values.split("&");
		var fullName = map[0].split("=")[1].replace('+', ' ');
		$('#me-fullname').html(fullName);
		$('#me-tweets-count').html(getTweetsCount(user));
		$('#me-following-count').html(getFollowersCount(user));
		$('#me-followers-count').html(getFollowingCount(user));
		
	} else {
		alert('You must log on first!');
		logout();
	}
}

//Saves tweet
function saveTweet() {
	var userKey = getLogedInUser();
	if(userKey != null && userKey != "") {
		var values = localStorage.getItem(userKey);
		var tweets = values.split('&')[4].split('=')[1];
		var geoLocationText = $("#geo-location-coord").val();
		var geoLocationValue = $("#geo-location-text").text();
		//Touch to Add Location
		var tweetText = $('.tweet-box-textarea').val();
		if (tweetText.length > 140)
		{
			alert('Tweet is too long!');
			return false;
		}
		
		//Some minor input sanitzation
		tweetText = tweetText.replace("&","&amp");
		tweetText = tweetText.replace("<","&lt");
		tweetText = tweetText.replace(">","&gt");
		tweetText = tweetText.replace('"',"&quot");
		tweetText = tweetText.replace(";","&semcol");// This is not HTML encode, replaced 
													 // back when Tweet is reflected for
													 // parsing
		
		if ($("#geo-location-text").hasClass("geoLoc-on"))
		{
			tweetText += ";" + geoLocationText + ";" + geoLocationValue;
		}

		tweetText = escape(tweetText);
		
		if(tweetText != "") {
			tweets += tweetText + ';';
		}
		var newValues = "";
		var map = values.split('&');
		for(var i = 0; i < map.length; i++) {
			if(i == 4) {
				newValues += 'tweets=' + tweets + '&';
			} else if(i == map.length - 1) {
				newValues += map[i];
			} else {
				newValues += map[i] + '&';
			}
		}
		localStorage.setItem(userKey, newValues);
	} else {
		alert('You must log on first!');
		logout();
	}
	return true;
}

//Refreshes search field 
function refreshSearch() {
	$('.autocomplete-container').html("");
	processSearch();
}

//Add Following
function addFollowing(user) {
	var userKey = getLogedInUser();
	if(userKey != null && userKey != "") {
		var values = localStorage.getItem(userKey);
		var following = values.split('&')[5].split('=')[1];
		var newValues = "";
		var map = values.split('&');
		for(var i = 0; i < map.length; i++) {
			if(i == 5) {
				if (following == "")
				{
					var addValue = "following=" + user + "&";
				}
				else
				{
					var addValue = "following=" + following + ";" + user + "&";
				}
				newValues += addValue;
			} else if(i == map.length - 1) {
				newValues += map[i];
			} else {
				newValues += map[i] + '&';
			}
		}
		localStorage.setItem(userKey, newValues);
		addFollower(user, getLogedInUser());
		refreshSearch();
	} else {
		alert('You must log on first!');
		logout();
	}
}

//Adds follower
function addFollower(user, follower)
{
	var values = localStorage.getItem(user);
	var followers = values.split('&')[6].split('=')[1];
	var newValues = "";
	var map = values.split('&');
	for(var i = 0; i < map.length; i++) {
		if(i == 6) {
			if (followers == "")
			{
				var addValue = "followers=" + follower;
			}
			else
			{
				var addValue = "followers=" + followers + ";" + follower;
			}
			newValues += addValue;
		} else 
		{
			newValues += map[i] + '&';
		}
	}
	localStorage.setItem(user, newValues);
}

//Removes following from current user's following list
function removeFollowing(following) {
	var userKey = getLogedInUser();
	if(userKey != null && userKey != "") {
		var values = localStorage.getItem(userKey);
		var following = values.split('&')[5].split('=')[1].split(';');
		var newValues = "";
		var map = values.split('&');
		for(var i = 0; i < map.length; i++) {
			if(i == 5) {
				var addValue = "";
				for (var j = 0; j < following.length; j++)
				{
					if (following[j] != following)
					{
						if (addValue == "") {
							addValue += following[j];
						}
						else
						{
							addValue+= ";" + following[j];
						}
					}
				}
				newValues += "following=" + addValue + '&';
			} else if(i == map.length - 1) {
				newValues += map[i];
			} else {
				newValues += map[i] + '&';
			}
		}
		localStorage.setItem(userKey, newValues);
		removeFollower(following, getLogedInUser());
	} else {
		alert('You must log on first!');
		logout();
	}
}

//Removes follower from user's follower list
function removeFollower(user, follower) {
	var values = localStorage.getItem(user);
	var followers = values.split('&')[6].split('=')[1].split(';');
	var newValues = "";
	var map = values.split('&');
	for(var i = 0; i < map.length; i++) {
		if(i == 6) {
			var addValue = "";
			for (var j = 0; j < followers.length; j++)
			{
				if (followers[j] != follower)
				{
					if (addValue == "") {
						addValue += followers[j];
					}
					else
					{
						addValue+= ";" + followers[j];
					}
				}
			}
			newValues += "following=" + addValue;
		} else
		{
			newValues += map[i] + '&';
		}
	}
	localStorage.setItem(user, newValues);
	refreshSearch();
}

//Returns array of user's tweets
function getTweets(user) {
	var tweets = [];
	if(user != null && user != "") {
		var values = localStorage.getItem(user);
		var map = values.split("&");
		if(map[4]) {
			tweets = map[4].split("=")[1].split(";")
			return tweets;
		}
	} else {
		alert('You must log on first!');
		logout();
	}
}

//Returns array of user's following
function getFollowing(user) {
	var following = [];
	if(user != null && user != "") {
		var values = localStorage.getItem(user);
		var map = values.split("&");
		if(map[5]) {
			following = map[5].split("=")[1].split(";");
			return following;
		}
	} else {
		alert('You must log on first!');
		logout();
	}
}

//Returns array of user's followers
function getFollowers(user) {
	var followers = [];
	var values = localStorage.getItem(user);
	var map = values.split("&");
	if(map[6]) {
		followers = map[6].split("=")[1].split(";");
		return followers;
	}
	return followers;
}

//Check if user is in list of following users
function isFollowed(user) {
	var following = getFollowing(getLogedInUser());
	if($.inArray(user, following) >= 0) {
			return true;
		}
	return false;
}

//Returns array of all users from local storage
function getAllUsers() {
	var users = [];
	for(var i = 0; i < localStorage.length; i++) {
		var itemKey = localStorage.key(i);
		if(itemKey.indexOf("TWITTER_USER_") == 0) {
			users.push(itemKey);
		}
	}
	return users;
}

function handleClickEvent(event) {
	var targetPage = $(event.target).attr("href").toLowerCase();
	if($(event.target).hasClass('submit')) {
		var ok = handleSubmitEvent(event);
		if(!ok) {
			event.preventDefault();
			return false;
			// stop processing
		}
	}
	if($(event.target).hasClass('backbutton')) {
		if(historyStack.length == 0) {
			lastPage = "signin.html";
		} else {
			targetPage = historyStack.pop();
		}

	} else {
		historyStack.push(lastPage);
		lastPage = targetPage;
	}
	lastPage = lastPage.toLowerCase();
	
	if($(event.target).hasClass('tweet-button')) {
		var tweetSaved = saveTweet();
		if (!tweetSaved)
		{
			historyStack.pop();
			targetPage="newtweet.html"; //Stay in same page if tweet failed
		}
	}

	$(event.target).css({
		'background-color' : '#194fdb',
		'color' : '#ffffff'
	});
	loadingWindowON();

	if($(event.target).attr("target") != "_blank") {
		event.preventDefault();

		$('#nextpage').bind('webkitAnimationEnd', function() {
			$(this).removeClass('slideleftIn');
			$(this).removeClass('nextpage');
			$(this).addClass('currentpage');
		});

		$('#currentpage').bind('webkitAnimationEnd', function() {
			$(this).removeClass('slideleftOut');
			$(this).removeClass('currentpage');
			$(this).addClass('nextpage');

			// switch id's
			$(this).attr("id", "tempID");
			$('#nextpage').attr("id", "currentpage");
			$('#tempID').attr("id", "nextpage");
			nextpageelement = document.getElementById("nextpage");
			if(nextpageelement) {
				nextpageelement.parentNode.removeChild(nextpageelement);
			}
			$("body").append("<div id='nextpage' class='nextpage'></div>");

		});

		$("#nextpage").addClass('slideleftIn');
		$("#currentpage").addClass('slideleftOut');

		loadContent(targetPage, "nextpage");
	}
}


//Update length of tweet in new tweet window
function updateLength()
	{
		var tweetLength = $("#new-tweet").val().length;
		$("#tweet-chars-left").text(140 - tweetLength);
	}

//Logout user
function logout() {
	setLogedInUser("");
	window.location = "index.html";
}

//Loads last page from local storage, and fires the 'click' event on it
function loadLastPage()	{
	var lastVisitedPage = localStorage.getItem("TWITTER_LAST_PAGE");
	if (lastVisitedPage != null && lastVisitedPage != "" && lastVisitedPage != "undefined") 
	{
		var element = document.getElementById("instaload");
		$("#currentpage").html($("#currentpage").html() + "<a id='instaload' href='" + lastVisitedPage + "'></a>");
		$("#instaload").trigger('click');
	}
}


var watchID=null;
//Geolocation auxilliary timeout function
function stopWatchLocation() {  
	if (watchID!= null)  {  
		navigator.geolocation.clearWatch(watchID);  
		watchID= null;  
	}
}

//Start or disable GeoLocation in the newTweet tab
function startGeolocation() {
	//If already displaying Geo-Location, second touch will disable it
	if ($("#geo-location-text").hasClass("geoLoc-on"))
	{
		$("#geo-location-text").text("Touch to Add Location");
		$("#geo-location-text").removeClass("geoLoc-on");
	}
	else
	{
		$("#geo-location-text").text("Retrieving Location...");
		setTimeout('stopWatchLocation()', 15000);		
		navigator.geolocation.watchPosition(positionInfo,errorInfo,{ enableHighAccuracy: true, timeout: 30000, maximumAge: 0 });  
	}
}  

//Geolocation error reporting
function errorInfo(error)  
{  
	switch(error.code)  
	{  
		case error.PERMISSION_DENIED: 
		alert("user did not share geolocation data");  
		break;  

		case error.POSITION_UNAVAILABLE: 
		alert("could not detect current position");  
		break;  

		case error.TIMEOUT: 
		alert("retrieving position timed out");  
		break;  

		default: 
		alert("unknown error");  
		break;  
	}
}  

//Turns coordinates into string and place
function positionInfo(position){ 
	var Location = position.coords.latitude + ',' + position.coords.longitude;
	$("#geo-location-coord").val(Location);
	$("#geo-location-text").text(reverseGeoLocForNewTweet(Location)); 
	$("#geo-location-text").addClass("geoLoc-on");
}  

var geocoder;
var init = false;

function initializeGeoLoc() {
	geocoder = new google.maps.Geocoder();
	init = true;
}

//Performs reverse GeoLoc (for New Tweet Screen)
function reverseGeoLocForNewTweet(position) {
	if (!init) {
		initializeGeoLoc();
	}
	var lat = position.split(',')[0];
	var lng = position.split(',')[1];
    var latlng = new google.maps.LatLng(lat, lng);
    geocoder.geocode({'latLng': latlng}, function(results, status) {
		var pos = "geo-location-text";
		if (status == google.maps.GeocoderStatus.OK) {
		console.log(results)
			if (results[1] && document.getElementById(pos) != null) {
			 //formatted address
			 document.getElementById(pos).innerHTML = results[0].formatted_address;
			} else {
			  document.getElementById(pos).innerHTML = "Couldn't find Address.<br>Position: " + position;
			}
		} else {
			document.getElementById(pos).innerHTML = "Geolocation failed due to: " + status;
		}
    });
  }


$(document).ready(function() {
	$("a").live("click", handleClickEvent);
	//If we can find the last logged in user, we'll try to send him back to his old session's page
	if (localStorage.getItem("TWITTER_LOGED_IN_USER") != null && localStorage.getItem("TWITTER_LOGED_IN_USER") != "")
	{
		loadLastPage();
	}
	$.valHooks.textarea = {
		get : function(elem) {
			return elem.value.replace(/\r?\n/g, "\r\n");
		}
	};
});


