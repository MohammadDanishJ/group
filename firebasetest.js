const auth = firebase.auth();

function signInWithGoogleAuthentication() {
  const provider = new firebase.auth.GoogleAuthProvider();
  return new Promise((resolve, reject) => {
    auth
      .signInWithPopup(provider)
      .then(function (result) {
        resolve(result.user)
      })
      .catch(function (error) {
        reject(error)
      })
    })
}

const db = firebase.firestore();

function saveUserToFirestore(user) {
  const userRef = db.collection('user');
  userRef.doc(user.uid).set({
    uid: user.uid,
    displayName: user.displayName,
    photoURL: user.photoURL,
    email: user.email,
  })
}

function fetchGroupByUserID(uid) {
  const vm = this;
  return new Promise((resolve, reject) => {
    const groupRef = db.collection('group');
    groupRef
     .where('members', 'array-contains', uid)
     .onSnapshot((querySnapshot) => {
       const allGroups = []
       querySnapshot.forEach((doc) => {
         const data = doc.data()
         data.id = doc.id
         if (data.recentMessage) allGroups.push(data)
       })
       vm.groups = allGroups
     })
   })
}


function filterGroup(userArray) {
  const vm = this;
  vm.groups = []
  return new Promise((resolve, reject) => {
    let groupRef = db.collection('group')
    userArray.forEach((userId) => {
      groupRef = groupRef.where('members', '==', userId)
    })
    groupRef
      .get()
      .then(function (querySnapshot) {
        const allGroups = []
        querySnapshot.forEach((doc) => {
          const data = doc.data()
          data.id = doc.id
          allGroups.push(data)
       })
       if (allGroups.length > 0) {
         resolve(allGroups[0])
       } else {
         resolve(null)
       }
    })
    .catch(function (error) {
      reject(error)
    })
  })
}

function fetchMessagesByGroupId(groupId) {
  const vm = this
  db.collection('message')
    .doc(groupId.trim())
    .collection('messages')
    .orderBy('sentAt')
    .onSnapshot((querySnapshot) => {
      const allMessages = []
      querySnapshot.forEach((doc) => {
        if (doc) allMessages.push(doc.data());
      })
      vm.messages = allMessages;
    })
}

function saveMessage(messageText, sentAt, currentGroupId) {
  if (messageText.trim()) {
  const message = {
    messageText,
    sentAt,
    sentBy: this.user.uid,
  }
  return new Promise((resolve, reject) => {
    db.collection('message')
      .doc(currentGroupId)
      .collection('messages')
      .add(message)
      .then(function (docRef) {
        resolve(message);
      })
      .catch(function (error) {
        reject(error);
      })
    })
  }
}
