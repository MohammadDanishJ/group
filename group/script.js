// Adds a size to Google Profile pics URLs.
function addSizeToGoogleProfilePic(url) {
    if (url.indexOf('googleusercontent.com') !== -1 && url.indexOf('?') === -1) {
        return url + '?sz=150';
    }
    return url;
}

// Signs-in Friendly Chat.
function signIn() {
    // Sign into Firebase using popup auth & Google as the identity provider.
    var provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider);
}

// Signs-out of Friendly Chat.
function signOut() {
    // Sign out of Firebase.
    firebase.auth().signOut();
}

// Initiate Firebase Auth.
function initFirebaseAuth() {
    // Listen to auth state changes.
    firebase.auth().onAuthStateChanged(authStateObserver);
}

// Returns the signed-in user's profile pic URL.
function getProfilePicUrl() {
    return firebase.auth().currentUser.photoURL || '../images/profile_placeholder.png';
}

// Returns the signed-in user's display name.
function getUserName() {
    return firebase.auth().currentUser.displayName;
}

function getUserId() {
    return firebase.auth().currentUser.uid;
}

// Returns true if a user is signed-in.
function isUserSignedIn() {
    return !!firebase.auth().currentUser;
}

// Triggers when the auth state change for instance when the user signs-in or signs-out.
function authStateObserver(user) {
    // console.log('Logged In')
    // console.log(user);

    // clear all creds when login
    //when re-login (logout and then login again), it clears all previous data
    // userListElement.innerHTML = '';
    // groupListElement.innerHTML = '';
    // messageListElement.innerHTML = '';

    if (user) { // User is signed in!
        // Get the signed-in user's profile pic and name.
        // document.getElementById('app').classList.add('visible');
        document.getElementById('init').classList.add('dsp-none-strict');
        document.getElementById('auth').classList.remove('visible');

        // console.log('user logged in');

        var profilePicUrl = getProfilePicUrl();
        var userName = getUserName();

        // Set the user's profile pic and name.
        if (userPicElement)
            userPicElement.style.backgroundImage = 'url(' + addSizeToGoogleProfilePic(profilePicUrl) + ')';
        if (userNameElement)
            userNameElement.textContent = p; // userNameElement.textContent = userName;

        
        // signOutButtonElement.removeAttribute('hidden');
        // Hide sign-in button.
        signInButtonElement.setAttribute('hidden', 'true');


        // Show user's profile and sign-out button.
        if (userNameElement) {
            userNameElement.removeAttribute('hidden');
            userPicElement.removeAttribute('hidden');
        }

        //save users data
        // saveUsersData();

        // We save the Firebase Messaging Device token and enable notifications.
        // saveMessagingDeviceToken();

        // load chats
        // loadUsers();

        // load all users
        // loadAllUsers();

        // load all Groups
        // loadGroups();

    } else { // User is signed out!
        // Hide user's profile and sign-out button.
        console.log('user not logged in');

        // document.getElementById('app').classList.remove('visible');
        document.getElementById('init').classList.add('dsp-none-strict');
        document.getElementById('auth').classList.add('visible');

        // signOutButtonElement.setAttribute('hidden', 'true');

        // Show sign-in button.
        signInButtonElement.removeAttribute('hidden');
        signInButtonElement.addEventListener('click', signIn);
        groupName.innerText = 'My Group';

        if (userNameElement) {
            userNameElement.setAttribute('hidden', 'true');
            userPicElement.setAttribute('hidden', 'true');
        }
    }
}

// https://stackoverflow.com/a/814628
let get = url => {
    var queryStart = url.indexOf("?") + 1,
        queryEnd = url.indexOf("#") + 1 || url.length + 1,
        query = url.slice(queryStart, queryEnd - 1),
        pairs = query.replace(/\+/g, " ").split("&"),
        parms = {}, i, n, v, nv;

    if (query === url || query === "") return;

    for (i = 0; i < pairs.length; i++) {
        nv = pairs[i].split("=", 2);
        n = decodeURIComponent(nv[0]);
        v = decodeURIComponent(nv[1]);

        if (!parms.hasOwnProperty(n)) parms[n] = [];
        parms[n].push(nv.length === 2 ? v : null);
    }
    return parms;
}

let p = get(window.location.href).p ? get(window.location.href).p[0] : null;

let joinGroup = () => {
    console.log(`joining ${p}`)
}

initFirebaseAuth();

var USER_TEMPLATE =
    '<div class="msg-container fl w100">' +
    '<div class="pic"></div>' +
    '<div class="data fl-d-cl">' +
    '<div class="name-cont fl-j-sb w100">' +
    '<div class="name"></div>' +
    '<div class="date">nil</div>' +
    '</div>' +
    '<div class="sub-msg">Select User and Start Chat with.</div>' +
    '</div>' +
    '</div>';

var signInButtonElement = document.getElementById('sign-in');
var userPicElement = document.getElementById('user-pic');
var userNameElement = document.getElementById('user-name');
var groupName = document.getElementById('groupName');
var joinBtn = document.getElementById('join')
joinBtn.addEventListener('click', joinGroup);