(function () {
  'use strict';

  let h = [];

  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyCoLvpr3O3zuAhOE-eoFODYrkorVPSdCbY",
    authDomain: "group-e2bf6.firebaseapp.com",
    projectId: "group-e2bf6",
    storageBucket: "group-e2bf6.appspot.com",
    messagingSenderId: "342122930159",
    appId: "1:342122930159:web:6bb92fe5771158a5fc201a",
    measurementId: "G-4K73VFZV53"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  firebase.analytics();

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
    return firebase.auth().currentUser.photoURL || '/images/profile_placeholder.png';
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


  // Saves a new message to your Cloud Firestore database.
  function saveMessage(messageText, e) {
    // Add a new message entry to the database.
    return firebase.firestore().collection('message').doc(currentChatRoom).collection('messages').add({
      uid: getUserId(),
      name: getUserName(),
      text: messageText,
      profilePicUrl: getProfilePicUrl(),
      receiver: currentChatId,
      chatRoom: currentChatRoom,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    }).then(function () {
      updateChatRoom(messageText);
    }).catch(function (error) {
      console.error('Error writing new message to database', error);
    });
  }



  // Saves a new message containing an image in Firebase.
  // This first saves the image in Firebase storage.
  function saveImageMessage(file) {
    // console.log('inside save');
    // console.log(file);
    // 1 - We add a message with a loading icon that will get updated with the shared image.
    firebase.firestore().collection('message').doc(currentChatRoom).collection('messages').add({
      uid: getUserId(),
      name: getUserName(),
      imageUrl: LOADING_IMAGE_URL,
      profilePicUrl: getProfilePicUrl(),
      receiver: currentChatId,
      chatRoom: currentChatRoom,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    }).then(function (messageRef) {
      // console.log(messageRef.id);
      // 2 - Upload the image to Cloud Storage.
      var filePath = firebase.auth().currentUser.uid + '/' + messageRef.id + '/' + file.name;
      var storageRef = firebase.storage().ref(filePath);
      var task = storageRef.put(file);

      task.on('state_changed',
        (snapshot) => {
          var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log('Upload is ' + progress + '% done');
        });
      return task.then(function (fileSnapshot) {
        // console.log(fileSnapshot.getBytesTransferres())
        // 3 - Generate a public URL for the file.
        return fileSnapshot.ref.getDownloadURL().then((url) => {
          // 4 - Update the chat message placeholder with the image's URL.
          return messageRef.update({
            imageUrl: url,
            storageUri: fileSnapshot.metadata.fullPath
          });
        });
      });
    }).catch(function (error) {
      console.error('There was an error uploading a file to Cloud Storage:', error);
    });

    // var storageRef = firebase.storage.ref(filePath);
    // var fileUpload = document.getElementById("fileUpload");
    // fileUpload.on('change', function (evt) {
    //     var firstFile = evt.target.file[0]; // get the first file uploaded
    //     var uploadTask = storageRef.put(firstFile);
    //     uploadTask.on('state_changed', function progress(snapshot) {
    //         console.log(snapshot.totalBytesTransferred); // progress of upload
    //     });
    // });
  }
  function searchUser(e) {
    // Add a new message entry to the database.
    // return firebase.firestore()
    //   .collection('message')
    //   .where('email', '==', messageText)
    //   .get()/*.then((snapshot) => {
    //       snapshot.forEach((doc) => {
    //         const data = doc.data()
    //         data.id = doc.id;
    //         // console.log(data);
    //         displayAllUsers(data);
    //       });
    //     })*/
    //   .catch((error) => {
    //     console.log("Error getting documents: ", error);
    //   });

    const snapshot = firebase.firestore().collection('users').where("email", "==", e).get();
    return snapshot;
  }

  function updateChatRoom(e) {
    firebase.firestore().collection('chatRoom')
      .doc(currentChatRoom)
      .update({
        recentMessage: {
          messageText: e,
          sendAt: firebase.firestore.FieldValue.serverTimestamp()
        }
      })
      .then(function (docRef) { })
      .catch(function (error) {
        // eslint-disable-next-line no-console
        console.error('Error writing document: ', error)
      })

  }
  let u = [];
  let z = {};
  function loadUsers() {
    // Create the query to load the last 12 messages and listen for new ones.
    // console.log(firebase.auth().currentUser.uid);
    var queryU = firebase.firestore()
      .collection('chatRoom')
      .where('members', 'array-contains', getUserId())
      .where('group', '==', false)
      .orderBy('recentMessage.sendAt', 'desc');
    // .orderBy('timestamp', 'desc');
    // .startAfter(lastId || 0)
    // .limit(12);

    // Start listening to the query.
    // queryU.onSnapshot(function (snapshot) {
    //     snapshot.docChanges().forEach(function (change) {
    //         if (change.type === 'removed') {
    //             // deleteMessage(change.doc.id);
    //         } else {
    //             var message = change.doc.data();
    //             console.log(message);

    //             displayUsers(change.doc.id, message.uid, message.name, message.profilePicUrl, message.timestamp);

    //             // lastId = snapshot.docs[snapshot.docs.length - 1];
    //             // next = firebase.firestore().collection('messages')
    //             //     .orderBy('timestamp', 'desc')
    //             //     .startAfter(lastId)
    //             //     .limit(6);

    //         }
    //     });
    // });
    queryU.onSnapshot(function (snapshot) {
      // console.log(snapshot);
      if (!snapshot.empty) {
        snapshot.docChanges().forEach(function (change) {
          if (change.type === 'removed') {
            deleteMessage(change.doc.id);
          } else {
            // const doc = change;
            const data = change.doc.data()
            data.id = change.doc.id
            // console.log(data.recentMessage.sendAt.toDate());
            displayUsers(data);
          }
          //   if (data.recentMessage) console.log(data);
        })
      } else {
        // console.log('no users found');
        userListElement.innerHTML = '';
        userListElement.innerHTML = NO_USER_TEMPLATE;
      }

    })
  }



  //display all users exist 
  function loadGroups() {
    var queryU = firebase.firestore()
      .collection('chatRoom')
      .where('members', 'array-contains', getUserId())
      .where('group', '==', true)
      .orderBy('recentMessage.sendAt', 'desc');

    // queryU.get()
    //   .then((snapshot) => {
    //     snapshot.forEach((doc) => {
    //       const data = doc.data()
    //       data.id = doc.id;
    //       console.log(data);
    //       displayAllUsers(data);
    //     });
    //   })
    //   .catch((error) => {
    //     console.log("Error getting documents: ", error);
    //   });
    queryU.onSnapshot(function (snapshot) {
      // console.log(snapshot);
      if (!snapshot.empty) {
        snapshot.docChanges().forEach(function (change) {
          if (change.type === 'removed') {
            deleteMessage(change.doc.id);
          } else {
            // const doc = change;
            const data = change.doc.data()
            data.id = change.doc.id
            // console.log(data.recentMessage.sendAt.toDate());
            // displayUsers(data);
            displayAllUsers(data);
          }
          //   if (data.recentMessage) console.log(data);
        })
      } else {
        // console.log('no users found');
        groupListElement.innerHTML = '';
        groupListElement.innerHTML = NO_GROUP_TEMPLATE;
      }
    })
  }


  let lastId = null, next;
  let currentChatId = null, currentChatRoom = 'NULL', currentChatType = null;
  // Loads chat messages history and listens for upcoming ones.
  function loadMessages() {
    // console.log('load message called');
    // console.log(currentChatId);
    // console.log(currentChatRoom);
    // Create the query to load the last 12 messages and listen for new ones.
    var query = firebase.firestore()
      .collection('message')
      .doc(currentChatRoom)
      .collection('messages')
      // .where('receiver', '==', currentChatId)
      .where('chatRoom', '==', currentChatRoom)
      .orderBy('timestamp', 'desc')
      // .startAfter(lastId || 0)
      .limit(12);
    // console.log(query);
    // Start listening to the query.
    query.onSnapshot(function (snapshot) {
      if (!snapshot.empty) {
        // console.log('not empty');
        snapshot.docChanges().forEach(function (change) {
          if (change.type === 'removed') {
            deleteMessage(change.doc.id);
          } else {
            var message = change.doc.data();
            // console.log(message.text + '  ' + message.timestamp.toMillis());
            displayMessage(change.doc.id, message.uid, message.timestamp, message.name,
              message.text, message.profilePicUrl, message.imageUrl, message.fileUrl, 'new');

            // lastId = snapshot.docs[snapshot.docs.length - 1];
            // next = firebase.firestore().collection('messages')
            //   .orderBy('timestamp', 'desc')
            //   .startAfter(lastId)
            //   .limit(6);

          }
        });
      } else {
        // console.log('empty: no messages');
      }
    });
  }

  function loadGroupMessages() {
    // console.log('load message called');
    // console.log(currentChatId);
    // console.log(currentChatRoom);
    // Create the query to load the last 12 messages and listen for new ones.
    var query = firebase.firestore()
      .collection('message')
      .doc(currentChatRoom)
      .collection('messages')
      // .where('receiver', '==', currentChatId)
      .where('chatRoom', '==', currentChatRoom)
      .orderBy('timestamp', 'desc')
      // .startAfter(lastId || 0)
      .limit(12);
    // console.log(query);
    // Start listening to the query.
    query.onSnapshot(function (snapshot) {
      snapshot.docChanges().forEach(function (change) {
        if (change.type === 'removed') {
          deleteMessage(change.doc.id);
        } else {
          var message = change.doc.data();
          // console.log(message.text + '  ' + message.timestamp.toMillis());
          displayMessage(change.doc.id, message.uid, message.timestamp, message.name,
            message.text, message.profilePicUrl, message.imageUrl, message.fileUrl, 'new');

          lastId = snapshot.docs[snapshot.docs.length - 1];
          next = firebase.firestore().collection('messages')
            .orderBy('timestamp', 'desc')
            .startAfter(lastId)
            .limit(6);

        }
      });
    });
  }

  // Loads chat messages history and listens for upcoming ones.
  function loadPreviousMessages(e) {
    // Create the query to load the last 12 messages and listen for new ones.

    next.get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          var message = doc.data();
          displayMessage(doc.id, message.uid, message.timestamp, message.name,
            message.text, message.profilePicUrl, message.imageUrl, message.fileUrl, 'reload');

          lastId = snapshot.docs[snapshot.docs.length - 1];
          next = firebase.firestore().collection('messages')
            .orderBy('timestamp', 'desc')
            .startAfter(lastId)
            .limit(6);
        });
      })
      .catch((error) => {
        console.log("Error getting documents: ", error);
      });

  }

  // Saves a new message containing an image in Firebase.
  // This first saves the image in Firebase storage.
  function saveFileMessage(file) {
    // 1 - We add a message with a loading icon that will get updated with the shared image.
    firebase.firestore().collection('messages').add({
      uid: getUserId(),
      name: getUserName(),
      fileUrl: LOADING_IMAGE_URL,
      profilePicUrl: getProfilePicUrl(),
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    }).then(function (messageRef) {
      // 2 - Upload the image to Cloud Storage.
      var filePath = firebase.auth().currentUser.uid + '/' + messageRef.id + '/' + file.name;
      return firebase.storage().ref(filePath).put(file).then(function (fileSnapshot) {
        // 3 - Generate a public URL for the file.
        return fileSnapshot.ref.getDownloadURL().then((url) => {
          // 4 - Update the chat message placeholder with the image's URL.
          return messageRef.update({
            fileUrl: url,
            storageUri: fileSnapshot.metadata.fullPath
          });
        });
      });
    }).catch(function (error) {
      console.error('There was an error uploading a file to Cloud Storage:', error);
    });
  }
  // Saves the messaging device token to the datastore.
  function saveMessagingDeviceToken() {
    firebase.messaging().getToken().then(function (currentToken) {
      if (currentToken) {
        // console.log('Got FCM device token:', currentToken);
        // Saving the Device Token to the datastore.
        firebase.firestore().collection('fcmTokens').doc(currentToken)
          .set({ uid: firebase.auth().currentUser.uid });
      } else {
        // Need to request permissions to show notifications.
        requestNotificationsPermissions();
      }
    }).catch(function (error) {
      console.error('Unable to get messaging token.', error);
    });
  }

  // Saves the users data.
  function saveUsersData() {
    // Saving the Device Token to the datastore.
    firebase.firestore().collection('users').doc(getUserId())
      .set({
        uid: firebase.auth().currentUser.uid,
        email: firebase.auth().currentUser.email,
        name: firebase.auth().currentUser.displayName,
        profilePicUrl: firebase.auth().currentUser.photoURL,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      });
  }


  // Requests permission to show notifications.
  function requestNotificationsPermissions() {
    // console.log('Requesting notifications permission...');
    firebase.messaging().requestPermission().then(function () {
      // Notification permission granted.
      saveMessagingDeviceToken();
    }).catch(function (error) {
      console.error('Unable to get permission to notify.', error);
    });
  }

  // Triggered when a file is selected via the media picker.
  async function onMediaImageSelected(event) {

    event.preventDefault();
    // console.log(event.target.files.length);
    // event.target.files.forEach(element => {
    //     console.log(element);
    // });
    let i = 0;
    while (i < event.target.files.length) {
      var file = event.target.files[i];
      // Check if the file is an image.
      if (!file.type.match('image.*')) {
        var data = {
          message: 'You can only share images',
          timeout: 2000
        };
        signInSnackbarElement.MaterialSnackbar.showSnackbar(data);
        return;
      }
      // Check if the user is signed-in
      if (checkSignedInWithMessage()) {
        // compress image before uploading
        // wait for compressed image
        const compressedImage = await compressImg(file);
        saveImageMessage(compressedImage);
      }
      i++;
    }
    // Clear the selection in the file picker input.
    // imageFormElement.reset(); //this comment should be removed
  }
  // Triggered when a file is selected via the media picker.
  async function onMediaFileSelected(event) {
    event.preventDefault();
    var file = event.target.files[0];

    // Clear the selection in the file picker input.
    imageFormElement.reset();

    // Check if the file is an image.
    //  if (!file.type.match('image.*')) {
    //      var data = {
    //          message: 'You can only share images',
    //          timeout: 2000
    //      };
    //      signInSnackbarElement.MaterialSnackbar.showSnackbar(data);
    //      return;
    //  }
    // Check if the user is signed-in
    if (checkSignedInWithMessage()) {
      if (file.type.match('image.*')) {
        // const compressedImage = await compressImg(file);
        // when sending from file send...original data of image is retained
        const nonCompressedImage = file;
        saveImageMessage(nonCompressedImage);
      }
      else
        saveFileMessage(file);
    }
  }
  // Triggered when the send new message form is submitted.
  function onMessageFormSubmit(e) {
    e.preventDefault();
    // Check that the user entered a message and is signed in.
    if (messageInputElement.textContent.length > 0 && checkSignedInWithMessage()) {
      saveMessage(messageInputElement.textContent).then(function () {
        // Clear message text field and re-enable the SEND button.
        resetMaterialTextfield(messageInputElement);
        toggleButton();

        // focus input field
        messageInputElement.focus();
      });
    }
  }

  function onSearchFormSubmit(e) {
    e.preventDefault();
    // Check that the user entered a message and is signed in.
    if (searchInputElement.textContent.length > 0 && checkSignedInWithMessage()) {
      // console.log('search start');
      searchUser(searchInputElement.textContent)
        .then(function (e) {
          let snapshot = e;
          if (!snapshot.empty) {
            snapshot.forEach((doc) => {
              const data = doc.data()
              // data.id = doc.id;
              // console.log(data.email);
              // alert('User Found: ' + data.email);
              let pDiv = document.createElement('div');
              pDiv.classList.add('popup', 'pfx', 'w100', 'h100', 'tnf-c', 'visible');
              let iDiv = document.createElement('div');
              iDiv.classList.add('card', 'w100', 'h100', 'p12', 'fl-c');
              iDiv.innerHTML = USER_TEMPLATE;

              let div = iDiv.firstChild;
              div.setAttribute('id', data.uid);
              div.addEventListener('click', newUserClicked);

              div.querySelector('.name').textContent = data.name;
              div.querySelector('.sub-msg').textContent = 'Click to start chat with this user';
              div.querySelector('.date').style.display = "none";
              div.querySelector('.pic').style.backgroundImage = 'url(' + addSizeToGoogleProfilePic(data.profilePicUrl) + ')';
              pDiv.appendChild(iDiv);
              popupFallback.innerHTML = '';
              insertAfter(popupFallback, pDiv);
              popupFallback.classList.add('visible');
              popupFallback.addEventListener('click', toggleMenu);

              popupFallback.classList.contains('active') ? h.pop() : h.push(popupFallback);
              // fallback.classList.add('visible');
            });

            // Clear message text field and re-enable the SEND button.
            resetMaterialTextfield(searchInputElement);
            toggleSearchButton();
          } else {
            // console.log('data not found');
          }
        });
    }
  }

  function insertAfter(referenceNode, newNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
  }

  // Triggers when the auth state change for instance when the user signs-in or signs-out.
  function authStateObserver(user) {
    // console.log(user);

    // clear all creds when login
    //when re-login (logout and then login again), it clears all previous data
    userListElement.innerHTML = '';
    groupListElement.innerHTML = '';
    messageListElement.innerHTML = '';

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
        userNameElement.textContent = userName;

      signOutButtonElement.removeAttribute('hidden');
      // Hide sign-in button.
      signInButtonElement.setAttribute('hidden', 'true');


      // Show user's profile and sign-out button.
      if (userNameElement) {
        userNameElement.removeAttribute('hidden');
        userPicElement.removeAttribute('hidden');

      }

      //save users data
      saveUsersData();

      // We save the Firebase Messaging Device token and enable notifications.
      saveMessagingDeviceToken();

      // load chats
      loadUsers();

      // load all users
      // loadAllUsers();

      // load all Groups
      loadGroups();

    } else { // User is signed out!
      // Hide user's profile and sign-out button.
      // console.log('user not logged in');

      // document.getElementById('app').classList.remove('visible');
      document.getElementById('init').classList.add('dsp-none-strict');
      document.getElementById('auth').classList.add('visible');

      signOutButtonElement.setAttribute('hidden', 'true');

      // Show sign-in button.
      signInButtonElement.removeAttribute('hidden');

      if (userNameElement) {
        userNameElement.setAttribute('hidden', 'true');
        userPicElement.setAttribute('hidden', 'true');
      }
    }
  }

  // Returns true if user is signed-in. Otherwise false and displays a message.
  function checkSignedInWithMessage() {
    // Return true if the user is signed in Firebase
    if (isUserSignedIn()) {
      return true;
    }

    // Display a message to the user using a Toast.
    var data = {
      message: 'You must sign-in first',
      timeout: 2000
    };
    signInSnackbarElement.MaterialSnackbar.showSnackbar(data);
    return false;
  }

  // Resets the given MaterialTextField.
  function resetMaterialTextfield(element) {
    element.textContent = '';
    element.blur();
    // element.parentNode.MaterialTextfield.boundUpdateClassesHandler();

  }

  // Template for messages.
  var MESSAGE_TEMPLATE =
    '<div class="msg fl-d-cl w100">' +
    '<div class="spacing"><div class="pic"></div></div>' +
    '<div class="msgbody message"></div>' +
    '<div class="name"></div>'
  '</div>';

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

  var NO_USER_TEMPLATE =
    '<div class="no-user w100 h100 fl-c lhinit">' +
    '<h1 class="p12 text-center"' +
    'onclick="burger.click();nav.children[1].children[1].firstElementChild.click()">' +
    'Click here to&nbsp;<span style="color:#6e00ff">Start</span>&nbsp;Chat' +
    '</h1>'
  '</div>';
  var NO_MESSAGE_TEMPLATE =
    '<div class="no-user w100 h100 fl-c lhinit">' +
    '<h1 class="p12 text-center"' +
    'onclick="burger.click();nav.children[1].children[1].firstElementChild.click()">' +
    'Click here to&nbsp;<span style="color:#6e00ff">Start</span>&nbsp;Chat' +
    '</h1>'
  '</div>';
  var NO_GROUP_TEMPLATE =
    '<div class="no-user w100 h100 fl-c fl-d-cl lhinit">' +
    // '<h1 class="p12 text-center"' +
    // 'onclick="burger.click();nav.children[1].children[1].firstElementChild.click()">' +
    // 'Click here to&nbsp;<span style="color:#6e00ff">Create</span>&nbsp;Group' +
    // '</h1>'
    // '<h1 class="p12 text-center">Groups will be&nbsp;<span style="color:#6e00ff">Available</span>&nbsp;Soon</h1>'
    '<h1 class="p12 text-center">Groups are now&nbsp;<span style="color:#6e00ff">Available</span>&nbsp;</h1>' +
    '<h3 class="p12 text-center">Ask&nbsp;<span style="color:#6e00ff">Admin</span>&nbsp;for Joining URL</h3>' +
    '</div>';

  // Adds a size to Google Profile pics URLs.
  function addSizeToGoogleProfilePic(url) {
    if (url.indexOf('googleusercontent.com') !== -1 && url.indexOf('?') === -1) {
      return url + '?sz=150';
    }
    return url;
  }

  // A loading image URL.
  var LOADING_IMAGE_URL = 'https://www.google.com/images/spin-32.gif?a';

  // Delete a Message from the UI.
  function deleteMessage(id) {
    var div = document.getElementById(id);
    // If an element for that message exists we delete it.
    if (div) {
      div.parentNode.removeChild(div);
    }
  }

  function createAndInsertMessage(id, uid, timestamp) {
    // console.log('createAndInsertMessage called');
    // if (document.getElementById('chatRoom_' + currentChatRoom)) console.log('chatroom exists'); else console.log('chatroom not exist');
    var messageListElement = document.getElementById('chatRoom_' + currentChatRoom);
    const container = document.createElement('div');
    container.innerHTML = MESSAGE_TEMPLATE;
    const div = container.firstChild;
    div.setAttribute('id', id);
    if (uid === getUserId()) div.classList.add('msg-out');

    // If timestamp is null, assume we've gotten a brand new message.
    // https://stackoverflow.com/a/47781432/4816918
    // console.log(timestamp.toMillis());
    timestamp = timestamp ? timestamp.toMillis() : Date.now();
    div.setAttribute('timestamp', timestamp);

    // figure out where to insert new message
    const existingMessages = messageListElement.children;
    if (existingMessages.length === 0) {
      messageListElement.appendChild(div);
    } else {
      let messageListNode = existingMessages[0];

      while (messageListNode) {
        const messageListNodeTime = messageListNode.getAttribute('timestamp');

        if (!messageListNodeTime) {
          throw new Error(
            `Child ${messageListNode.id} has no 'timestamp' attribute`
          );
        }

        if (messageListNodeTime > timestamp) {
          break;
        }

        messageListNode = messageListNode.nextSibling;
      }

      messageListElement.insertBefore(div, messageListNode);
    }

    return div;
  }

  function createAndInsertUser(id, timestamp, group) {
    //if sorting for group, use groupListElement
    let userElement = group ? groupListElement : userListElement;
    if (!document.getElementById(id)) {
      // const container = document.createElement('div');
      // container.innerHTML = USER_TEMPLATE;
      // const div = container.firstChild;
      // div.setAttribute('id', id);

      const container = document.createElement('div');
      container.innerHTML = USER_TEMPLATE;
      const div = container.firstChild;
      div.setAttribute('id', id);
      div.setAttribute('data-type', group ? 1 : 0);
      div.addEventListener('click', userClicked);
      // userListElement.appendChild(div);

      // if (uid === getUserId()) div.classList.add('message-out');

      // If timestamp is null, assume we've gotten a brand new message.
      // https://stackoverflow.com/a/47781432/4816918

      timestamp = timestamp ? timestamp.toMillis() : Date.now();
      div.setAttribute('timestamp', timestamp);

      // figure out where to insert new message
      const existingMessages = userElement.children;
      // console.log(existingMessages[0]);

      existingMessages.length != 0 ? existingMessages[0].classList.contains('no-user') ? userElement.innerHTML = '' : '' : '';
      if (existingMessages.length === 0) {
        userElement.appendChild(div);
      } else {
        let messageListNode = existingMessages[1];

        while (messageListNode) {
          const messageListNodeTime = messageListNode.getAttribute('timestamp');

          if (!messageListNodeTime) {
            throw new Error(
              `Child ${messageListNode.id} has no 'timestamp' attribute`
            );
          }

          if (messageListNodeTime > timestamp) {
            break;
          }

          messageListNode = messageListNode.nextSibling;
        }
        div.addEventListener('click', userClicked);
        userElement.insertBefore(div, messageListNode);

      }
      return div;
    } else {
      let div = document.getElementById(id);
      const existingMessages = userElement.children;
      let messageListNode = existingMessages[0];

      while (messageListNode) {
        const messageListNodeTime = messageListNode.getAttribute('timestamp');

        if (!messageListNodeTime) {
          throw new Error(
            `Child ${messageListNode.id} has no 'timestamp' attribute`
          );
        }

        if (messageListNodeTime > timestamp) {
          break;
        }

        messageListNode = messageListNode.nextSibling;
      }

      div.addEventListener('click', userClicked);
      userElement.insertBefore(div, messageListNode);
      return div;
    }
  }
  function userClicked() {
    // console.log('user clicked');
    // console.log(this);

    // console.log(document.querySelector('div.msg-cont-head div.pic'));
    document.querySelector('div.msg-cont-head div.pic').setAttribute('style', this.firstChild.getAttribute('style'));
    document.querySelector('div.msg-cont-head div.name-cont').textContent = this.lastElementChild.firstChild.firstChild.textContent;



    currentChatId = this.getAttribute('id');
    document.getElementById('chatRoom_' + currentChatRoom).classList.remove('visible');
    currentChatRoom = this.getAttribute('id');

    let group = this.dataset.type == 1 ? true : false;
    if (group) {
      groupUrlContainer.style.display = "flex";
      groupUrlContainer.children[0].innerText = "Group URL";
      groupUrlContainer.children[1].innerText = "https://groupworkflow.netlify.app/join?" + currentChatRoom;
    } else {
      groupUrlContainer.style.display = "flex";
      groupUrlContainer.children[0].innerText = "E-Mail";
      let user = z[currentChatRoom].members[0] == getUserId() ? z[currentChatRoom].members[1] : z[currentChatRoom].members[0];
      groupUrlContainer.children[1].innerText = u[user].email;

    }

    checkAndCreateChatRoom(this.getAttribute('id'));

    document.getElementById('chatRoom_' + currentChatRoom).classList.add('visible');

    startChat();
    loadMessages();
  }

  async function getMarker(e) {
    const snapshot = await firebase.firestore().collection('chatRoom').where("members", "array-contains", e).get();
    return snapshot.docs.map(doc => doc.data());
  }

  async function newUserClicked() {
    // console.log('newuserclicked');
    // console.log(this.getAttribute('id'));
    // currentChatId = this.getAttribute('id');
    // console.log('current chat room     ' + currentChatRoom);
    let e = this.getAttribute('id');
    // console.log(e);

    if (e == getUserId()) return false; //you cannot start chat with yourself :)

    document.getElementById('chatRoom_' + currentChatRoom).classList.remove('visible');
    if (this.dataset.id != 'user-card') currentChatRoom = this.getAttribute('id');
    // console.log('currrrrrrrrrrrrrrrrrrrrrrrr ' + currentChatRoom);


    // console.log('eeeeeeeeeeeeee' + e);
    var query = firebase.firestore()
      .collection('chatRoom')
      //         .doc(currentChatRoom)
      //         .collection('messages')
      .where("members", "array-contains", e);
    // .whereField("vitamins."+getUserId(), isEqualTo: true);//  .orderBy('timestamp', 'desc')
    //         .limit(12);
    // console.log(query);
    // console.log(getMarker(e));
    await query.get()
      .then((querySnapshot) => {
        if (!querySnapshot.empty) {
          // console.log('data found');
          // console.log(querySnapshot.data());
          querySnapshot.forEach((doc) => {
            // console.log('searching');
            // doc.data() is never undefined for query doc snapshots
            // console.log(doc.id, " => ", doc.data());
            // console.log(doc.data().members);
            let message = doc.data();
            if ((message.members[0] == e && message.members[1] == getUserId()) || (message.members[1] == e && message.members[0] == getUserId())) {
              // console.log('search found');
              // console.log('8888888888888 \n99999999999999999999\n' + doc.id);
              currentChatRoom = doc.id;
              currentChatId = doc.id;
              // document.getElementById('chatRoom_' + currentChatRoom).classList.add('visible');
              // console.log(currentChatRoom);
              return false;
            } else {
              // console.log('search not found');
              currentChatRoom = 'NULL';
              currentChatId = null;
              // console.log(currentChatRoom);
              return true;
            }
          });
        } else {
          // console.log('data does not exist');
          currentChatRoom = 'NULL';
          currentChatId = null;
        }
      })
    // console.log('md    ' + currentChatRoom);
    if (currentChatRoom == e || currentChatRoom == 'NULL') {
      query = firebase.firestore().collection('chatRoom');
      await query.add({
        group: false,
        members: [
          e,
          getUserId()
        ],
        recentMessage: {
          messageText: 'Select User to Start Chat with.',
          sendAt: null
        },
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      }).then(function (docRef) {
        // console.log('data inserted    '+docRef.id);
        currentChatRoom = docRef.id;
        currentChatId = currentChatRoom;
        currentChatType = 'p2p';
      }).catch(function (error) {
        console.error('Error writing new message to database', error);
      });
    }

    document.querySelector('div.msg-cont-head div.pic').setAttribute('style', this.firstChild.getAttribute('style'));
    document.querySelector('div.msg-cont-head div.name-cont').textContent = this.lastElementChild.firstChild.firstChild.textContent;
    checkAndCreateChatRoom(currentChatRoom);
    // console.log('checked');
    document.getElementById('chatRoom_' + currentChatRoom).classList.add('visible');

    // console.log(this.parentNode.parentNode.classList);
    if (this.parentNode.parentNode.classList.contains('popup')) {
      toggleMenu();
      nav.children[1].firstElementChild.firstElementChild.click();
      burgerMenu.classList.remove("is-active");
      burgerMenu.classList.remove("active");
      nav.classList.remove("active");
      fallback.classList.remove("visible");
    }
    startChat();
    loadMessages();
  }

  function checkAndCreateChatRoom(e) {
    // console.log(e);
    if (!document.getElementById('chatRoom_' + currentChatRoom)) {
      // console.log('creating chat room');
      const chatRoomDiv = document.createElement('div');
      chatRoomDiv.classList.add('chatRoomContainer', 'fl-d-cl');
      chatRoomDiv.setAttribute('id', 'chatRoom_' + e);
      messageListElement.appendChild(chatRoomDiv);
    }
  }

  // Displays a Message in the UI.
  function displayMessage(id, uid, timestamp, name, text, picUrl, imageUrl, fileUrl, status) {
    //  console.log(timestamp);
    var div = document.getElementById(id) || createAndInsertMessage(id, uid, timestamp);

    // profile picture
    if (picUrl) {
      div.querySelector('.pic').style.backgroundImage = 'url(' + addSizeToGoogleProfilePic(picUrl) + ')';
    }

    div.querySelector('.name').textContent = name + ' | ' + ((timestamp != null) ? timestamp.toDate().toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }) : Date.now());
    var messageElement = div.querySelector('.message');

    if (text) { // If the message is text.
      messageElement.textContent = text;
      // Replace all line breaks by <br>.
      messageElement.innerHTML = messageElement.innerHTML.replace(/\n/g, '<br>');
    } else if (imageUrl) { // If the message is an image.
      var image = document.createElement('img');
      image.addEventListener('load', function () {
        messageListElement.scrollTop = (status == 'reload') ? null : messageListElement.scrollHeight;
      });
      image.src = imageUrl + '&' + new Date().getTime();
      messageElement.innerHTML = '';
      messageElement.appendChild(image);
    } else if (fileUrl) { // If the message is file.
      var file = document.createElement('iframe');
      file.addEventListener('load', function () {
        messageListElement.scrollTop = (status == 'reload') ? null : messageListElement.scrollHeight;
      });
      file.src = fileUrl + '&' + new Date().getTime();
      messageElement.innerHTML = '';
      messageElement.appendChild(file);
    }
    // Show the card fading-in and scroll to view the new message.
    setTimeout(function () { div.classList.add('visible') }, 1);
    messageListElement.scrollTop = (status == 'reload') ? null : messageListElement.scrollHeight;
    // if()
    // (status != 'reload') ?(window.innerWidth >= 768) ? messageInputElement.focus() : messageInputElement.blur(): messageInputElement.blur();
  }

  // Displays a Message in the UI.
  function displayUsers(data) {
    // console.log('display users');
    if (isUserSignedIn()) {
      // console.log(user);
      let freind = null;
      data.members.forEach(element => {
        // console.log(element);

        // freind = element != getUserId() ? element : null;
        // console.log('fre '+freind);

        if (element != getUserId() /* && !document.getElementById(data.id) */) {
          freind = element;
          // console.log('freind = ' + freind);
          // const container = document.createElement('div');
          // container.innerHTML = USER_TEMPLATE;
          // const div = container.firstChild;
          // div.setAttribute('id', data.id);
          // div.addEventListener('click', userClicked);
          // userListElement.appendChild(div);

          // console.log(data.recentMessage.sendAt.toDate());
          var id = data.id, timestamp = data.recentMessage.sendAt, group = data.group;
          var div = /*document.getElementById(id) ||*/ createAndInsertUser(id, timestamp, group);

          var queryU = firebase.firestore()
            .collection('users')
            .where('uid', '==', element);

          var recentMessage = data.recentMessage ? data.recentMessage.messageText : 'Click User and start chat with.';
          div.querySelector('.sub-msg').textContent = recentMessage;
          var recentMessageDate = data.recentMessage ? data.recentMessage.sendAt : null;
          div.querySelector('.date').textContent = recentMessageDate ? recentMessageDate.toDate().toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }) : '';
          queryU.get()
            .then((querySnapshot) => {
              querySnapshot.forEach((doc) => {
                // doc.data() is never undefined for query doc snapshots
                // console.log(doc.id, " => ", doc.data());
                // console.log(data.recentMessage);
                div.querySelector('.name').textContent = doc.data().name;
                div.querySelector('.pic').style.backgroundImage = 'url(' + addSizeToGoogleProfilePic(doc.data().profilePicUrl) + ')';
                z[data.id] = data;
                u[doc.id] = doc.data();
              });
            })
            .catch((error) => {
              // console.log("Error getting documents: ", error);
            });

        }
      });
    }
  }

  // Displays All USers in UI.
  function displayAllUsers(data) {
    // console.log("displayAllUsers");
    // console.log(data);
    // const container = document.createElement('div');
    // container.innerHTML = USER_TEMPLATE;
    // const div = container.firstChild;
    // div.setAttribute('id', data.id);
    // div.setAttribute('data-id', 'user-card');


    var div = /*document.getElementById(id) ||*/ createAndInsertUser(data.id, data.timestamp, data.group/*, 'group'*/);
    var recentMessage = data.recentMessage ? data.recentMessage.messageText : 'Click User and start chat with.';
    div.querySelector('.sub-msg').textContent = recentMessage;
    var recentMessageDate = data.recentMessage ? data.recentMessage.sendAt : null;
    div.querySelector('.date').textContent = recentMessageDate ? recentMessageDate.toDate().toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }) : '';

    div.querySelector('.name').textContent = data.name;
    div.querySelector('.pic').style.backgroundImage = 'url(' + addSizeToGoogleProfilePic(data.profilePicUrl) + ')';
    // groupListElement.appendChild(div);
  }

  // Enables or disables the submit button depending on the values of the input
  // fields.
  function toggleButton() {
    if (messageInputElement.textContent.length > 0) {
      submitButtonElement.removeAttribute('disabled');
    } else {
      submitButtonElement.setAttribute('disabled', 'true');
      // messageInputElement.blur();
    }
  }

  function toggleSearchButton() {
    if (searchInputElement.textContent.length > 0) {
      searchButtonElement.removeAttribute('disabled');
    } else {
      searchButtonElement.setAttribute('disabled', 'true');
      // searchInputElement.blur();
    }
  }

  // Checks that the Firebase SDK has been correctly setup and configured.
  function checkSetup() {
    if (!window.firebase || !(firebase.app instanceof Function) || !firebase.app().options) {
      window.alert('You have not configured and imported the Firebase SDK. ' +
        'Make sure you go through the codelab setup instructions and make ' +
        'sure you are running the codelab using `firebase serve`');
    }
  }

  //detects top
  function reachedTop() {
    if (this.scrollTop == 0)
      loadPreviousMessages(lastId);
  }

  function startChat() {
    // console.log('startChat clicked');
    // messagesContainer.classList.toggle('activeOrder');
    messagesContainer.classList.contains('active') ? h.pop() : h.push(msgBack);
    messagesContainer.classList.toggle('active');

    // input focus control
    // focus on screen size greater than 768 (usually tablet or PC)
    (window.innerWidth >= 768) ? messageInputElement.focus() : messageInputElement.blur();
  }

  function tabSwitch() {
    // console.log(document.getElementById(tab).classList);
    document.getElementById(tab).classList.remove('visible');
    tab = this.dataset.id;
    document.getElementById(tab).classList.add('visible');
    // console.log(tab);
  }

  function switchMenu() {
    // console.log('switchmenu ');
    let e = this, control = e.dataset.control;
    window.innerWidth < 768 ? (burgerMenu.classList.contains('active') ? toggleMenu() : '') : '';
    // console.log('control ' + control);
    // console.log(h);
    // burgerMenu.classList.contains('active') ? h.pop() : h.push(toggle);
    // console.log(document.getElementById('page' + control).classList.contains('active') && control != 1);
    // console.log(h);
    // document.getElementById('page' + control).classList.contains('active') ? h.pop() : (control == 1 && !document.getElementById('page1').classList.contains('active') ? h.pop() : (control == 2 ? h.push(e.parentNode.previousElementSibling.firstElementChild) : (control == 3 ? h.push(e.parentNode.previousElementSibling.previousElementSibling.firstElementChild) : '')));

    switch (control) {
      case '1':
        // console.log('case1 '+control);
        // console.log(burgerMenu.classList);
        h.pop();
        break;
      case '2':
        // console.log('case2 '+control);
        h[h.length - 1] != e.parentNode.previousElementSibling.firstElementChild ? h.push(e.parentNode.previousElementSibling.firstElementChild) : '';
        break;
      case '3':
        // console.log('case3 '+control);
        h[h.length - 1] != e.parentNode.previousElementSibling.previousElementSibling.firstElementChild ? h.push(e.parentNode.previousElementSibling.previousElementSibling.firstElementChild) : '';
        break;
      default:
        // console.log('default '+control);
        break;
    }

    // console.log(h);
    control != 1 ? document.querySelector('div.tabs').classList.add('dsp-none') : document.querySelector('div.tabs').classList.remove('dsp-none');
    document.querySelector('div.curr-page').classList.remove(/*'visible',*/ 'curr-page');
    document.getElementById('page' + control).classList.add(/*'visible',*/ 'curr-page');
    document.querySelector('div.curr-menu').classList.remove('active', 'curr-menu');
    e.parentNode.classList.add('active', 'curr-menu');
    // console.log(document.getElementById('page' + control).classList.contains('active') && control != 1);

    setCardHeightOnMobileScreen();
  }
  // Checks that Firebase has been imported.
  checkSetup();

  // Shortcuts to DOM Elements.
  var messageListElement = document.getElementById('messages');
  var messageFormElement = document.getElementById('message-form');
  var searchFormElement = document.getElementById('search-form');
  var messageInputElement = document.getElementById('message-input');
  var searchInputElement = document.getElementById('user-search');
  var submitButtonElement = document.getElementById('submit');
  var searchButtonElement = document.getElementById('search-user');
  var imageButtonElement = document.getElementById('submitImage');
  var imageFileButtonElement = document.getElementById('submitFileImage');
  // var imageFormElement = document.getElementById('image-form');
  var mediaCaptureElement = document.getElementById('mediaCapture');
  var mediaFileCaptureElement = document.getElementById('mediaFileCapture');
  var userPicElement = document.getElementById('user-pic');
  var userNameElement = document.getElementById('user-name');
  var signInButtonElement = document.getElementById('sign-in');
  var signOutButtonElement = document.getElementById('sign-out');
  var signInSnackbarElement = document.getElementById('must-signin-snackbar');
  var loadMore = document.getElementById("load-more");
  var userListElement = document.getElementById("chat");
  var groupListElement = document.getElementById("user");
  var chatList = document.getElementById('chatList');
  var userList = document.getElementById('userList');
  var tab = 'chat';
  var msgContainer = document.querySelectorAll('div.group-sub-container div.msg-container');
  var control = document.querySelectorAll('div.control');
  var createGroupButton = document.getElementById('createGroup');
  var profileHeader = document.querySelector("div.msg-cont-head");
  var groupUrlContainer = document.getElementById('groupUrl');

  control.forEach(e => {
    e.addEventListener('click', switchMenu);
  });

  if (chatList)
    chatList.addEventListener('click', tabSwitch);
  if (userList)
    userList.addEventListener('click', tabSwitch);
  // var msg = document.getElementById("messages");

  // Saves message on form submit.
  messageFormElement.addEventListener('submit', onMessageFormSubmit);
  searchFormElement.addEventListener('submit', onSearchFormSubmit);

  if (signInButtonElement)
    signOutButtonElement.addEventListener('click', signOut);
  if (signInButtonElement)
    signInButtonElement.addEventListener('click', signIn);

  // Toggle for the button.
  messageInputElement.addEventListener('keyup', toggleButton);
  messageInputElement.addEventListener('change', toggleButton);
  searchInputElement.addEventListener('keyup', toggleSearchButton);
  searchInputElement.addEventListener('change', toggleSearchButton);

  // submitButtonElement2 = addEventListener("click", onMessageFormSubmit);

  // Events for image upload.
  if (imageButtonElement)
    imageButtonElement.addEventListener('click', function (e) {
      e.preventDefault();
      mediaCaptureElement.click();
    });

  if (mediaCaptureElement)
    mediaCaptureElement.addEventListener('change', onMediaImageSelected);

  // Events for image upload.

  if (imageFileButtonElement)
    imageFileButtonElement.addEventListener('click', function (e) {
      e.preventDefault();
      mediaFileCaptureElement.click();
    });

  if (mediaFileCaptureElement)
    mediaFileCaptureElement.addEventListener('change', onMediaFileSelected);

  // messageListElement.addEventListener("scroll", reachedTop);
  if (loadMore)
    loadMore.addEventListener("click", loadPreviousMessages);

  // initialize Firebase
  initFirebaseAuth();

  // TODO: Initialize Firebase Performance Monitoring.
  //  firebase.performance();

  // We load currently existing chat messages and listen to new ones.
  // loadMessages();

  //load all users


  // history control
  function back_Button() {
    history.pushState(null, null);
    window.addEventListener('popstate', () => {
      // console.log(h);
      if (h.length >= 1) {
        // console.log('h exists ');
        // console.log(h);
        let x = h[h.length - 1];
        x.click();
        history.pushState(null, null);
      } else {
        // console.log('h does not exists '+h);
        window.history.back();
      }
    });
  }
  back_Button();
  // history control

  // test compressor

  // lossy image compression
  // https://github.com/MohammadDanishJ/Image-Compressor.git
  async function compressImg(file) {
    // Resolve the promise when you get compressed image blog
    return new Promise((resolve, reject) => {
      // console.log("Compressing image");
      const MAX_WIDTH = 768;
      const MAX_HEIGHT = 1024;
      const MIME_TYPE = "image/jpeg";
      const QUALITY = 0.7;

      const blobURL = URL.createObjectURL(file);
      const img = new Image();

      img.src = blobURL;
      img.onerror = function () {
        URL.revokeObjectURL(this.src);
        toastr["error"]("Cannot load image", "Error");
        // console.log("Cannot load image");
      };

      img.onload = function () {
        URL.revokeObjectURL(this.src);
        const [newWidth, newHeight] = calcSize(img, MAX_WIDTH, MAX_HEIGHT);
        const canvas = document.createElement("canvas");
        canvas.width = newWidth;
        canvas.height = newHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, newWidth, newHeight);
        canvas.toBlob(
          (blob) => {
            // console.log("Blob");
            var theBlob = blob;
            theBlob.lastModifiedDate = new Date();
            theBlob.name = file.name;
            // console.log("returning output");
            return resolve(theBlob); // <-- resolving promise
          },
          MIME_TYPE,
          QUALITY
        );
      };
    })
  }

  function calcSize(img, maxWidth, maxHeight) {
    let width = img.width;
    let height = img.height;

    // calculate the width and height, constraining the proportions
    if (width > height) {
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
    } else {
      if (height > maxHeight) {
        width = Math.round((width * maxHeight) / height);
        height = maxHeight;
      }
    }
    return [width, height];
  }
  // test compressor


  // create group
  createGroupButton.addEventListener('click', createGroup);
  async function createGroup() {
    // console.log(this);
    const UI_Param = await createGroupFormUI();
    UI_Param.button.addEventListener('click', () => {
      uploadNewGroupData(UI_Param.input.value, this);
    });
  }

  async function uploadNewGroupData(e, j) {
    let n = e, c = getUserName(), i = getUserId();
    // console.log('upload data to firebase');
    // console.log('Group Name: ' + n);
    // console.log('Group Creator: ' + c);
    // console.log('timestamp: ' + new Date);

    document.getElementById('chatRoom_' + currentChatRoom).classList.remove('visible');
    // upload new group creds to firebase
    let query = firebase.firestore().collection('chatRoom');
    await query.add({
      name: n,
      creator: c,
      profilePicUrl: getProfilePicUrl(),
      admin: [
        c
      ],
      members: [
        i
      ],
      recentMessage: {
        messageText: 'Select Group to Engage with.',
        sendAt: null
      },
      group: true,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    }).then(function (docRef) {
      // console.log(docRef.data);
      currentChatRoom = docRef.id;
      currentChatId = currentChatRoom;

      currentChatType = 'm2m';
      // console.log(docRef.profilePicUrl);
      document.querySelector('div.msg-cont-head div.pic').style.backgroundImage = 'url(' + addSizeToGoogleProfilePic(getProfilePicUrl()) + ')';
      // document.querySelector('div.msg-cont-head div.pic').setAttribute('style', this.firstChild.getAttribute('style'));
      document.querySelector('div.msg-cont-head div.name-cont').textContent = n;
    }).catch(function (error) {
      console.error('Error writing new message to database', error);
    });
    // console.log(currentChatRoom);
    await checkAndCreateChatRoom(currentChatRoom);
    document.getElementById('chatRoom_' + currentChatRoom).classList.add('visible');

    // console.log(j.parentNode.parentNode.previousElementSibling);
    if (j.parentNode.parentNode.previousElementSibling.classList.contains('popup')) {
      toggleMenu();
      nav.children[1].firstElementChild.firstElementChild.click();
      burgerMenu.classList.remove("is-active");
      burgerMenu.classList.remove("active");
      nav.classList.remove("active");
      fallback.classList.remove("visible");
    }
    startChat();
    loadGroupMessages();

  }
  function createGroupFormUI() {
    let pDiv = document.createElement('div');
    pDiv.classList.add('popup', 'pfx', 'w100', 'h100', 'tnf-c', 'visible');

    let iDiv = document.createElement('div');
    iDiv.classList.add('card', 'w100', 'h100', /*'p12',*/ 'fl-c', 'fl-d-cl');
    iDiv.style.paddingTop = '1.5rem';
    iDiv.style.paddingBottom = '1.5rem';

    let heading = document.createElement('h1');
    heading.classList.add('p12');
    heading.innerHTML = 'Create <span style="color: #6e00ff;">Group</span>';
    iDiv.appendChild(heading);

    let inputContainer = document.createElement('div');
    inputContainer.classList.add('w100', 'p12', 'fl-c', 'fl-d-cl');

    let input = document.createElement('input');
    input.setAttribute('type', 'text');
    input.setAttribute('placeholder', 'Enter Group Name');
    input.setAttribute('id', 'CG_Input');
    input.classList.add('w100', 'material-input');
    inputContainer.appendChild(input);

    let button = document.createElement('button');
    button.setAttribute('type', 'submit');
    button.setAttribute('id', 'CG_Submit');
    button.classList.add('s-btn', 'p12', 'cp');
    button.innerText = 'Create Group';
    inputContainer.appendChild(button);

    iDiv.appendChild(inputContainer);

    pDiv.appendChild(iDiv);
    popupFallback.innerHTML = '';
    insertAfter(popupFallback, pDiv);
    popupFallback.classList.add('visible');
    popupFallback.addEventListener('click', toggleMenu);

    popupFallback.classList.contains('active') ? h.pop() : h.push(popupFallback);

    return { 'input': input, 'button': button };
  }
  // create group

  // expandable profile
  profileHeader.addEventListener('click', function () {
    let target = this.nextElementSibling.nextElementSibling.nextElementSibling;
    target.classList.add('active');
    h.push(target.firstElementChild);
    target.children[1].children[0].style.backgroundImage = this.children[0].children[0].style.backgroundImage;
    target.children[1].children[1].innerText = this.children[0].children[1].children[0].innerText;
    // groupUrlContainer.lastElementChild.innerText = "NULL";
    target.firstElementChild.addEventListener('click', function () {
      target.classList.remove('active');
      h.pop();
    });
  });
  // expandable profile


  // styling of chat || index
  let msgBack = document.getElementById('msg-back'),
    sliderHead = document.querySelectorAll('div.sliderHead'),
    sliderLine = document.querySelector('div.sliderLine'),
    messagesContainer = document.querySelector('div.messages-container'),
    groupContainer = document.querySelector('div.groups-container'),
    popupFallback = document.getElementById('popupFallback'),
    burgerMenu = document.getElementById("burger"),
    toggle = document.getElementById("toggle"),
    nav = document.getElementById('nav'),
    fallback = document.getElementById('fallback');

  toggle.addEventListener("click", toggleMenu);
  fallback.addEventListener('click', toggleMenu);
  // popupFallback.addEventListener('click', toggleFallback);
  msgBack.addEventListener('click', startChat);

  // function toggleFallback(){
  //     popupFallback.classList.remove('visible');
  //     fallback.classList.remove('visible');
  // }

  function toggleMenu() {
    // console.log('toggleMenu');
    // console.log(h);
    if (!popupFallback.classList.contains('visible')) {
      burgerMenu.classList.contains('active') ? (h[h.length - 1] == toggle ? h.pop() : '') : h.push(toggle);
      burgerMenu.classList.toggle("is-active");
      burgerMenu.classList.toggle("active");
      nav.classList.toggle("active");
      fallback.classList.toggle('visible');
    } else {
      // console.log('else fired');
      popupFallback.classList.contains('visible') ? h.pop() : h.push(popupFallback);
      document.querySelector('.popup').classList.remove('visible');
      popupFallback.classList.remove('visible');
      fallback.classList.remove('visible');
    }
  }


  sliderHead.forEach(div => {
    div.addEventListener('click', slide);
  });

  function slide() {
    groupContainer.classList.contains('active') ? h.pop() : h.push(sliderHead[0]);
    sliderLine.classList.toggle('active');
    groupContainer.classList.toggle('active');
  }

  // styling of chat || index
}());