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
            // userNameElement.textContent = p; // userNameElement.textContent = userName;


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

        // fetch data every time login status changes
        fetchGroup();

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
        groupName.innerText = 'Loading...';

        if (userNameElement) {
            userNameElement.setAttribute('hidden', 'true');
            userPicElement.setAttribute('hidden', 'true');
        }

        // fetch data every time login status changes
        fetchGroup()
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
},
    u = get(window.location.href) ? get(window.location.href).p[0] : null,
    gData,
    fetchGroup = async () => {
        // console.log(`Loading ${u}`)
        if (!u) { generateFetchedUI_NOT_FOUND('Invalid Refrence'); return }
        const snap = firebase.firestore().collection('chatRoom').doc(u).get();
        snap.then((doc) => {
            if (doc.exists) // console.log('data exist')
                generateFetchedUI(doc.data(),u)
            else // console.log('data do not exist')
                generateFetchedUI_NOT_FOUND()
        }).catch((e) => { // console.log('Error: ' + e)
            generateFetchedUI_NOT_FOUND(e)
        })
        // console.log(snap?snap.data():'Data Not Exist');
    },
    generateFetchedUI = (p,u) => {
        // console.log(p);
        groupName.innerText = `'${p.name}'`;
        if (!isUserSignedIn()) return false;

        gData = p
        fetchData.classList.add('dsp-none')
        dispData.classList.remove('dsp-none')

        dispData.innerHTML = FETCHED_UI

        joinBtn = document.getElementById('join')
        userNameElement = document.getElementById('user-name');
        userPicElement = document.getElementById('user-pic');
        members = document.getElementById('members');

        joinBtn.setAttribute('disabled', true);
        // console.log(`You Are Admin`)
        if (p.admin.includes(getUserId()))
            joinBtn.previousElementSibling.innerText = `You Are Admin of this group`
        // console.log(`You Are already a Member`)
        else if (p.members.includes(getUserId()))
            joinBtn.previousElementSibling.innerText = `You Are already a Member of this group`
        // console.log(`Able to Join`)
        else {
            joinBtn.removeAttribute('disabled');
            joinBtn.addEventListener('click', () => joinGroup(u))
        }


        userNameElement.innerText = p.name
        userPicElement.style.backgroundImage = 'url(' + addSizeToGoogleProfilePic(p.profilePicUrl) + ')';
        members.innerText = `Members: ${p.members.length}`
    },
    generateFetchedUI_NOT_FOUND = p => {
        let e = p ? p : ''

        fetchData.classList.add('dsp-none')
        dispData.classList.remove('dsp-none')

        let h1 = document.createElement('h1')
        h1.classList.add('p12')
        h1.innerText = `Group Not Found`

        let h3 = document.createElement('h3')
        h3.classList.add('p12')
        h3.innerText = `${e}`

        dispData.appendChild(h1)
        dispData.appendChild(h3)
    },
    joinGroup = u => {
        //console.log(`add new user in db`)
        firebase.firestore().collection('chatRoom').doc(u).update({ 
            members: firebase.firestore.FieldValue.arrayUnion(getUserId())
        }).then(()=>{ //console.log(`data added`)
            joinBtn.previousElementSibling.innerText = `Successfully joined Group`
            joinBtn.setAttribute('disabled', true);
        }).catch((e)=>{ //console.log(`Error: ${e}`)
            joinBtn.previousElementSibling.innerText = `Error joining Group: ${e}`
            joinBtn.setAttribute('disabled', true);
        })
    },
    USER_TEMPLATE =
        '<div class="msg-container fl w100">' +
        '<div class="pic"></div>' +
        '<div class="data fl-d-cl">' +
        '<div class="name-cont fl-j-sb w100">' +
        '<div class="name"></div>' +
        '<div class="date">nil</div>' +
        '</div>' +
        '<div class="sub-msg">Select User and Start Chat with.</div>' +
        '</div>' +
        '</div>',
    FETCHED_UI =
        '<div class="fl-c fl-d-cl p12">' +
        '<div class="fl-c">' +
        '<div class="pic" id="user-pic" style="width: 65px;height: 65px;"></div>' +
        '<div class="fl-d-cl">' +
        '<h1 id="user-name" class="name"></h1>' +
        '<h3 id="members" style="font-weight: normal;"></h3>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '<span></span>' +
        '<button id="join" class="s-btn p12 cp" disabled>Join Group</button>',
    signInButtonElement = document.getElementById('sign-in'),
    userPicElement,
    userNameElement,
    groupName = document.getElementById('groupName'),
    members,
    joinBtn,
    fetchData = document.getElementById('fetchData'),
    dispData = document.getElementById('dispData')

initFirebaseAuth();