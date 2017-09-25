
const config = {
  apiKey: "AIzaSyA_0zTo845L0-w-tMfOb8Yp1kUKjQeQKIY",
  authDomain: "knowledge-database-87320.firebaseapp.com",
  databaseURL: "https://knowledge-database-87320.firebaseio.com",
  projectId: "knowledge-database-87320",
  storageBucket: "knowledge-database-87320.appspot.com",
};
var brandData, countryData, currentData, properties, editMode;
const brand = getURLParameter('brand') || "monster";
brand = brand.toLowerCase();
document.getElementById("logo-"+brand).classList.add('active');
document.getElementById("current-brand").innerHTML = brand;
document.getElementById("current-brand").addEventListener('click',getBrandData,false);
var page = getURLParameter('page') || null;

/* Initialize TESTING Firebase
var config = {
  apiKey: "AIzaSyCOnG9vQhWLjHc1ghnCVZB4SlX_ecS7Z3w",
  authDomain: "kdb-test.firebaseapp.com",
  databaseURL: "https://kdb-test.firebaseio.com",
  projectId: "kdb-test",
  storageBucket: "kdb-test.appspot.com",
};
*/

firebase.initializeApp(config);

/**
 * Function called when clicking the Login/Logout button.
 */
// [START buttoncallback]
function toggleSignIn() {
  if (!firebase.auth().currentUser) {
    // [START createprovider]
    var provider = new firebase.auth.GoogleAuthProvider();
    // [END createprovider]
    provider.addScope('profile');
    provider.addScope('email');
    // [START signin]
    firebase.auth().signInWithPopup(provider).then(function(result) {
      // This gives you a Google Access Token. You can use it to access the Google API.
      var token = result.credential.accessToken;
      // The signed-in user info.
      var user = result.user;

    }).catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      // The email of the user's account used.
      var email = error.email;
      // The firebase.auth.AuthCredential type that was used.
      var credential = error.credential;
      if (errorCode === 'auth/account-exists-with-different-credential') {
        alert('You have already signed up with a different auth provider for that email.');
        // If you are using multiple auth providers on your app you should handle linking
        // the user's accounts here.
      } else {
        console.error(error);
      }
    });
    // [END signin]
  } else {
    firebase.auth().signOut();
    brandData = null;
    listArea.innerHTML = "";
    footerArea.innerHTML = "";
  }
}

/**
 * initApp handles setting up UI event listeners and registering Firebase auth listeners:
 *  - firebase.auth().onAuthStateChanged: This listener is called when the user is signed in or
 *    out, and that is where we update the UI.
 */
function initApp() {
  // Listening for auth state changes.
  firebase.auth().onAuthStateChanged(function(user) {
    document.getElementsByTagName("BODY")[0].classList.remove('loading');
    if (user) {
      // User is signed in.
      var displayName = user.displayName;
      var email = user.email;
      var photoURL = user.photoURL;
      var uid = user.uid;
      var providerData = user.providerData;
      document.getElementById('signin-name').textContent = displayName;
      document.getElementById('signin-email').textContent = email;
      document.getElementsByTagName("BODY")[0].classList.remove('signed-out');
      getFirebaseData();
    } else {
      // User is signed out.
      document.getElementsByTagName("BODY")[0].classList.add('signed-out');
    }
  });
  document.getElementById('google-sign-in').addEventListener('click', toggleSignIn, false);
  document.getElementById('sign-out').addEventListener('click', toggleSignIn, false);
}

window.onload = function() {
  initApp();
};

window.addEventListener('popstate', function(e) {
  // e.state is equal to the data-attribute of the last image we clicked
  console.log('state:', e.state);
  goToPage(e.state.brand, e.state.page);
});



//now we can set up and get our data
const database = firebase.database();
const storage = firebase.storage();

function getFirebaseData() {
  document.getElementById('loading-spinner').classList.remove('hidden');
  document.getElementById('breadcrumbs').classList.add('hidden');
  database.ref('/'+brand+'/').once('value').then(function(snapshot){
    document.getElementById('loading-spinner').classList.add('hidden');
    document.getElementById('breadcrumbs').classList.remove('hidden');
    brandData = snapshot.val();
    countryData = brandData['market info'];
    currentData = brandData;
    // remove ordering object at position [0]
    //countryData.shift();
    if(page) goToPage(brand, page);
    createList(currentData);
    //console.log(brandData);
  }, function(error) {
    // The Promise was rejected.
    if(error.toString().indexOf('permission') != -1) {
      var text = "Permission denied. You must use a @goodhumans.co.uk email.";
    } else {
      text = "Yikes - couldn't connect to database."
    }
    document.getElementById('loading-spinner').innerHTML = text;
  });
}

const listArea = document.getElementById('main-list');
const footerArea = document.getElementById('footerData');

const modal = null;

const gridButton = document.getElementById('view-grid');
gridButton.addEventListener('click', viewGrid);
const listButton = document.getElementById('view-list');
listButton.addEventListener('click', viewList);
const sortButton = document.getElementById('sort-list');
sortButton.addEventListener('click', sortList);

const editButton = document.getElementById('edit-button');
editButton.addEventListener('change', function() {
  editMode = !editMode;
  editModeToggle();
});
const addButton = document.getElementById('add-button');
//addButton.addEventListener('click', addItem);


holmes({
  input: '.searchbar', // default: input[type=search]
  find: 'ul.list li, ul.list h3', // querySelectorAll that matches each of the results individually
  dynamic: true
});

/* add class to list headings when search bar has a value */
document.getElementById('main-search').addEventListener("keyup", inputKeyUp);
function inputKeyUp(e) {
  if(e.target.value.length >= 2) return;
  var items = document.getElementsByClassName('list-heading');
  if(e.target.value != "") {
    Array.from(items).forEach(function(element) {
      element.classList.add('hide');
    });
  } else {
    Array.from(items).forEach(function(element) {
      element.classList.remove('hide');
    });
  }
}


function createList(data) {
  listArea.innerHTML = makeUL(data);
  var items = document.getElementsByClassName('list-item');
  Array.from(items).forEach(function(element) {
    element.addEventListener('click', clickItem, false);
  });
}

function makeUL(dataObject) {
  var moustacheSections = [];
  for (var key in dataObject) {
    var name = key == 'market info' ? 'Market Info' : dataObject[key].name;
    var tmpObject = {
      'name':name,
      'cleanName':cleanString(name),
      'key':key
    }
    if(dataObject[key].code) tmpObject.code = dataObject[key].code
    moustacheSections.push(tmpObject);
  }
  var moustacheObject = { 'brandList': moustacheSections };
  var template =
  '<div class="list-container"> \
    <ul class="list" id="item-list">{{#brandList}} \
      <li class="list-item" id="{{cleanName}}" data-title="{{key}}"> \
        {{#code}}<span class="code-badge">{{code}}</span>{{/code}} \
        <span class="list-item-title">{{name}}</span> \
      </li> \
      {{/brandList}} \
    </ul> \
  </div>';
  var html = Mustache.to_html(template, moustacheObject);
  setupFooter(moustacheObject);
  return html;
}


function setupFooter(dataObject) {
  footerArea.innerHTML = buildFooter(dataObject);
  var items = document.getElementsByClassName('footer-item');
  Array.from(items).forEach(function(element) {
    element.addEventListener('click', clickItem, false);
  });
}

function buildFooter(dataObject) {
  var moustacheObject = dataObject;
  var template =
    '<ul class="footer-list">{{#brandList}} \
      <li class="footer-item" id="{{cleanName}}" data-title="{{name}}"> \
        <span class="list-item-title">{{name}}</span> \
      </li> \
      {{/brandList}} \
    </ul> \
  </div>';
  var html = Mustache.to_html(template, moustacheObject);
  return html;
}


function clickItem(e) {
  // list item is clicked
  if(this) {
    var title = this.dataset.title;
  } else {
    title = 'market info';
  }
  //get data using id
  var infoObject = getObjectBy('name',title);
  // market info is list of countries so need to make new country list
  if(title=='market info') {
    getCountryData();
    return;
  }

  // get html using mustache.js template
  var html = modalTemplate(infoObject);

  // instanciate new modal
  if(modal==null) {
    modal = new tingle.modal({
        footer: true,
        stickyFooter: false,
        closeMethods: ['overlay', 'button', 'escape'],
        closeLabel: "Close",
        cssClass: ['country-modal']
    });
  }
  // set content
  modal.setContent(html);
  // open modal
  modal.open();
  // dom is loaded, set up event listeners etc.
  finalModalSetup(infoObject);

}


/*
* -----
*  MODAL TEMPLATING AND SETUP
* ------
*/

function modalTemplate(data) {
  console.log(data);
  var dataObject = JSON.parse(JSON.stringify(data));
  var moustacheSections = { 'sections' : [], 'name': dataObject.name };
  //dataObject is a country
  if(dataObject.hasOwnProperty('code'))  {
    moustacheSections['code'] = dataObject.code;
    moustacheSections['isCountry'] = true;
    delete dataObject.code;
  }
  moustacheSections['id'] = dataObject.id || dataObject.name;
  delete dataObject.id;
  delete dataObject.name;
  // if 1 image it will be string, otherwise it's an object
  // either way we gotta clean it up
  if(typeof dataObject.images == 'object') {
    dataObject.images = cleanArray(dataObject.images);
    moustacheSections['images'] = [];
    for(var key in dataObject.images) {
      var imageObj = { 'key': key, 'src': dataObject.images[key] };
      moustacheSections['images'].push(imageObj);
    }
  } else if (typeof dataObject.images == 'string') {
    moustacheSections['images'] = [{ 'key':0, 'src':dataObject.images}];
  }

  for (var prop in dataObject){
    if (dataObject.hasOwnProperty(prop) &&
        dataObject[prop].length > 1 &&
        prop!='images') {
      var sectionObject = {};
      // if any links in there, lets create the anchor tag
      sectionObject.value = replaceURLWithHTMLLinks(dataObject[prop]);
      sectionObject.key = prop;
      //if(!isNaN(prop)) prop = '';
      moustacheSections['sections'].push(sectionObject);
    }
  }

  console.log(moustacheSections);

  var template =
  '<h3 id="card-title" data-fbid="{{id}}">{{#isCountry}}<span class="code-badge editable"  id="country-code">{{code}}</span>{{/isCountry}} \
  <span id="current-item" class="editable">{{name}}</span> <a class="btn btn-default" id="add-section">+</a> <a class="btn btn-success"><i class="icon-ok"></i> Done</a> <a class="btn btn-danger" id="remove-card"><i class="icon-trash-empty"></i> Delete</a></h3> \
  \
  <div class="country-info"> \
    {{#sections}} \
    <div class="section clearfix"> \
      <dt class="section-title editable">{{key}} </dt> \
      <dd class="section-content editable">{{{value}}}</dd> \
    </div> \
    {{/sections}} \
  </div> \
  <div class="images" id="images-container" > \
    {{#images}} <div class="image-container"> \
    <img src="{{src}}" alt="image for {{name}}" id="{{key}}" class="modal-image"> <span class="remove-cross">x<span></div> {{/images}} \
  </div> \
  <label class="custom-file-upload button" id="upload-container"><input type="file" id="file-upload" name="files[]" accept="image/x-png,image/gif,image/jpeg" />  Upload Image </label> <span id="upload-text"></span>\
  <span id="card-info-text"></span>';
  var html = Mustache.to_html(template, moustacheSections);
  return html;

}

function finalModalSetup(infoObject) {
  // once dom has updated with modal, finalModalSetup runs
  var removeCrossItems = document.getElementsByClassName('remove-cross');
  // add event listeners for remove icons
  Array.from(removeCrossItems).forEach(function(element) {
    element.addEventListener('click', removeImage, false);
  });
  // add error listener for images
  var imageItems = document.getElementsByClassName('modal-image');
  Array.from(imageItems).forEach(function(element) {
    element.addEventListener('error', imgError, false);
  });
  if(editMode) {
    makeTextEditable();
    setupEditButtons();
  }
  // setup upload button + images
  document.getElementById('file-upload').addEventListener('change', uploadFile);
  // if 2 images already, hide upload button
  if(typeof infoObject.images == 'object') {
    if(infoObject.images.length >=2) document.getElementById('upload-container').classList.add('hidden');
  }
}

function setupEditButtons() {
  var removeButton = document.getElementById('remove-card');
  removeButton.addEventListener('click', removeCard, false);
  var addSectionBtn = document.getElementById('add-section');
  addSectionBtn.addEventListener('click', addSection, false);
}

function removeCard() {
  if (confirm('Are you sure you want to remove this card from the database?')) {
    var currentItem = document.getElementById('card-title').dataset.fbid;
    var infoObject = getObjectBy('name', currentItem);
    var ref = getfbRef(infoObject);

    var fbRef = database.ref('/'+brand+'/'+ref);
    fbRef.remove().then(function() {
      delete currentData[currentItem];
      modal.close();
      // reset the list with our new database
      createList(currentData);
    });
  }

}

function addSection() {
  var currentItem = document.getElementById('card-title').dataset.fbid;
  currentData[currentItem]['Section name'] = 'Section description';
  var html = modalTemplate(currentData[currentItem]);
  modal.setContent(html);
  finalModalSetup(currentData[currentItem]);
}


/*
* -----
*  IMAGE UPLOADING AND STORING
* ------
*/

function uploadFile() {

  var file = document.getElementById("file-upload").files[0];
  var currentItem = document.getElementById("current-item").innerHTML;
  var infoObject = getObjectBy('name',currentItem);
  var uploadText = document.getElementById('upload-text');
  var fileName = brand + "-" + currentItem +  "-" + file.name;

  var storageRef = storage.ref();

  //dynamically set reference to the file name
  var imageRef = storageRef.child('images/'+ fileName);
  imageRef.getDownloadURL().then(function(url) {
    if(infoObject.images.includes(url)) {
      uploadText.innerHTML = 'File already exists in storage';
    } else {
      addUrlToDB(url, currentItem);
    }
    return;
  }).catch(function(error) {
    //continue as normal
    //put request upload file to firebase storage
    var uploadTask = imageRef.put(file);
    uploadTask.on('state_changed', function(snapshot){
      // Observe state change events such as progress, pause, and resume
      // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
      var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      uploadText.innerHTML = 'Uploading file: '+file.name;
      switch (snapshot.state) {
        case firebase.storage.TaskState.PAUSED: // or 'paused'
          uploadText.innerHTML = 'Upload is paused';
          break;
        case firebase.storage.TaskState.RUNNING: // or 'running'
          console.log('Upload is running');
          break;
      }
    }, function(error) {
      // Handle unsuccessful uploads
      uploadText.innerHTML = 'There was an error in the upload.';
    }, function() {
      // Handle successful uploads on complete
      uploadText.innerHTML = '';
      var downloadURL = uploadTask.snapshot.downloadURL;
      addUrlToDB(downloadURL,currentItem);
    });
  });

}

function addUrlToDB(url,currentItem) {
  console.log(currentItem);
  // get the current country object to add the images
  var infoObject = getObjectBy('name',currentItem);
  console.log(infoObject);
  var ref = getfbRef(infoObject);
  // if no images currently, create the array
  infoObject.images = infoObject.images || [];
  if(!Array.isArray(infoObject.images)) {
    infoObject.images = [infoObject.images]
  }
  console.log("images: ",infoObject.images);
  infoObject.images.push(url);
  // update database with new image
  var fbRef = database.ref('/'+brand+'/'+ref);
  fbRef.update(infoObject).then(function() {
    console.log('fb database update complete');
    document.getElementById('card-info-text').innerHTML = "Saved. You're up to date."
    //syncData(countryIndex);
  });
  // reset the modal with our new content
  var html = modalTemplate(infoObject);
  modal.setContent(html);
  finalModalSetup(infoObject);
}


function removeImage(e) {
  var imageId = e.target.previousElementSibling.id;
  var imageSrc = e.target.previousElementSibling.src;

  var currentItem = document.getElementById('current-item').innerHTML;
  var infoObject = getObjectBy('name',currentItem);

  var ref = getfbRef(infoObject);

  var imageReference = storage.refFromURL(imageSrc);
  imageReference.delete().then(function() {
    // File deleted successfully
    infoObject.images.splice(imageId,1);

    var fbRef = database.ref('/'+brand+'/'+ref);
    fbRef.update(infoObject).then(function() {
      //syncData(countryIndex);
    });

    // reset the modal with our new content
    var html = modalTemplate(infoObject);
    modal.setContent(html);
    finalModalSetup(infoObject);
  }).catch(function(error) {
    console.log(error);
    // Uh-oh, an error occurred!
    alert("Couldn't delete image, sorry.");
  });

}

/*
*  END OF IMAGE SCRIPTS
*/


function viewGrid() {
  createList(currentData);
  listArea.classList.remove('list-view');
  listArea.classList.add('grid-view');
  listButton.classList.remove('active');
  gridButton.classList.add('active');
}

function viewList() {
  createList(currentData);
  listArea.classList.add('list-view');
  listArea.classList.remove('grid-view');
  gridButton.classList.remove('active');
  listButton.classList.add('active');
}

function sortList() {

}

function getCountryData() {
  history.pushState({'brand': brand,'page':'marketinfo'}, null, '?brand='+brand+'&page=marketinfo');
  document.getElementById("second-level").innerHTML = " > Market Info";
  currentData = countryData;
  createList(currentData);
}
function getBrandData() {
  history.pushState({'brand': brand, 'page':null}, null, '?brand='+brand);
  document.getElementById("second-level").innerHTML = '';
  currentData = brandData;
  createList(currentData);
}


function syncData(cid) {
  console.log("cid: ",cid," sheet: ",brand);
  // just trigger the sheet to get new data for the 1 record
  //request('GET', 'https://script.google.com/macros/s/AKfycbzG2biCtXYdTxt5sLhfh1V5lE95V1ZhFVbkdcrR-Bua21zTihCa/exec?cid='+cid+'&sheet='+brand).done(function (res) {
    //brandData = JSON.parse(res.getBody());
    //setListData(brandData);
    //console.log(res.getBody());
  //});
}


/*
* -----
*  EDITTING MODE AND DB UPDATING
* ------
*/


function editModeToggle() {
  if(editMode) {
    document.body.classList.add('editmode');
    addNewItemButton();
    makeTextEditable();
  } else {
    document.body.classList.remove('editmode');
    // remove new item button from list
    removeNewItemButton();
  }
}

function addNewItemButton() {
  //clone an item in the list and add it to the end as a new item button
  const mainList = document.getElementById('item-list');
  const listItems = document.getElementsByClassName('list-item');
  const singleItem = listItems[0];
  var itemClone = singleItem.cloneNode(true);
  itemClone.id = "";
  itemClone.dataset.title = "";
  itemClone.children[0].innerHTML = "+";
  itemClone.classList.add('new-list-item');
  itemClone.onclick = addNewItem;
  // Append the cloned <li> element to <ul>
  mainList.appendChild(itemClone);
  itemClone.style.opacity = 1;
}
function removeNewItemButton() {
  const newItems = document.getElementsByClassName('new-list-item');
  Array.from(newItems).forEach(function(element) {
    var parent = element.parentElement;
    parent.removeChild(element);
  });
}

function makeTextEditable() {
  var editableElements = document.getElementsByClassName("editable");
  Array.from(editableElements).forEach(function(element) {
    element.contentEditable = true;
    element.addEventListener('blur', endEdit);
    element.addEventListener('keydown', function(e) {
      var key = e.keyCode || e.charCode;
      if(key == 13 && !e.shiftKey) { // if enter key is pressed and shift is not pressed
          e.target.blur();  // lose focus
      } else {
          document.getElementById('card-info-text').innerHTML = "Waiting for you to finish.";
      }
    });
  });
}

function addNewItem() {
  var newItem = {
      'name':'New Title',
      'Section name': 'Section description'
  };
  if(currentData==brandData) {
    var newItemRef = database.ref('/'+brand+'/').push();
    brandData[newItemRef.key] = newItem;
  } else {
    newItem.code = 'XX';
    countryData.push(newItem);
    newItemRef = database.ref('/'+brand+'/market info/').push();
  }
  newItem.id = newItemRef.key;
  newItemRef.set(newItem).then(function() {
    createList(currentData);
    addNewItemButton();
  })
  .catch(function(error) {
    console.log('Synchronization failed');
    alert('Problem adding item to database')
  });
}


function endEdit(event) {
  console.log('in endEdit');
  var infoText = document.getElementById('card-info-text');
  infoText.innerHTML = "Saving...";
  var infoID = document.getElementById('card-title').dataset.fbid;
  var newObject = { 'id': infoID };
  // get new title
  newObject.name = document.getElementById('current-item').innerHTML;
  if(document.getElementById('country-code')) newObject.code = document.getElementById('country-code').innerHTML;
  // get text from sections
  var cardSections = document.getElementsByClassName("section");
  Array.from(cardSections).forEach(function(element) {
    var key = element.firstElementChild.innerHTML;
    var prop = element.lastElementChild.innerHTML;
    newObject[key] = prop;
  });

  var oldObject = getObjectBy('name',infoID);
  if(oldObject.images) newObject.images = oldObject.images;
  var ref = getfbRef(oldObject);
  // now we can update the Firebase Database
  var fbRef = database.ref('/'+brand+'/'+ref);
  fbRef.set(newObject).then(function() {
    currentData[infoID] = newObject;
    createList(currentData);
    addNewItemButton();
    infoText.innerHTML = "Saved. You're up to date."
    console.log('fb db update complete')
  });

}

/*
function openNewItemModal() {
  console.log('new item modal opening');
  // get html using mustache.js template
  var html = newModalTemplate();
  // instanciate new modal
  if(modal==null) {
    modal = new tingle.modal({
        footer: true,
        stickyFooter: false,
        closeMethods: ['overlay', 'button', 'escape'],
        closeLabel: "Close",
        cssClass: ['country-modal'],
        beforeClose: function() {
            saveModalData();
            return true; // close the modal
        }
    });
  }
  // set content
  modal.setContent(html);
  // open modal
  modal.open();
  // dom is loaded, set up event listeners etc.
  finalModalSetup({});
}

function newModalTemplate() {
  var moustacheSections = { 'isCountry': false }
  var template =
  '<h3>{{#isCountry}}<span class="code-badge"  id="country-code">XX</span>{{/isCountry}}<span id="current-item" contenteditable="true" >New Title</span></h3> \
  <div class="country-info"> \
    <div class="section clearfix"> \
      <dt class="section-title" contenteditable="true"> Section name </dt> \
      <dd class="section-content" contenteditable="true"> Section content </dd> \
    </div> \
  </div> \
  <div class="images" id="images-container" > \
    {{#images}} <div class="image-container"> \
    <img src="{{src}}" alt="image for {{name}}" id="{{key}}" class="modal-image"> <span class="remove-cross">x<span></div> {{/images}} \
  </div> \
  <label class="custom-file-upload button" id="upload-container"><input type="file" id="file-upload" name="files[]" accept="image/x-png,image/gif,image/jpeg" />  Upload Image </label> <span id="upload-text"></span>';
  var html = Mustache.to_html(template, moustacheSections);
  return html;
}


function saveModalData() {
  console.log(currentData);
  var newItem = {};
}
*/


/*
function enableTextEditing() {
  var countryTitleElements = document.getElementsByClassName("country");
  Array.from(countryTitleElements).forEach(function(element) {
    element.contentEditable = true;
    element.addEventListener('blur', endEdit);
  });
  var detailElements = document.getElementsByClassName("details");
  Array.from(detailElements).forEach(function(element) {
    element.contentEditable = true;
    element.addEventListener('blur', endEdit);
  });
  var removeButtons = document.getElementsByClassName('close-img');
  Array.from(removeButtons).forEach(function(element) {
    element.addEventListener('click', removeItem);
  });
}

function disableTextEditing() {
  var countryTitleElements = document.getElementsByClassName("country");
  Array.from(countryTitleElements).forEach(function(element) {
    element.contentEditable = false;
    //element.removeEventListener('click', titleBeginEdit);
  });
  var detailElements = document.getElementsByClassName("details");
  Array.from(detailElements).forEach(function(element) {
    element.contentEditable = false;
    //element.removeEventListener('click', detailBeginEdit);
  });
}


function endEdit(event) {
  var siblings = event.target.parentElement.children;
  var idElement = siblings[1],
      titleElement = siblings[2],
      detailsElement = siblings[3];
  var item = countryList.get('id', idElement.innerHTML)[0];
  var countryIndex = brandData.findIndex(findById,idElement.innerHTML);
  console.log(brandData);
  brandData[countryIndex] = {
    "id":idElement.innerHTML,
    "country":titleElement.innerHTML,
    "details":detailsElement.innerHTML
  };
  console.log(brandData);
  //savebrandData(brandData);
}

function findById(country) {
  return country.id == this;
}


function addItem() {

  /*
  var newItem = {
    "id": Math.floor(Math.random()*12000),
    "country": "New Title",
    "category": "Some details"
  };
}

function removeItem(event) {
  var siblings = event.target.parentElement.children;
  var idElement = siblings[1];
  console.log(idElement.innerHTML);
  countryList.remove('id', idElement.innerHTML);
  var countryIndex = brandData.findIndex(findById,idElement.innerHTML);
  brandData.splice(countryIndex, 1);
  savebrandData(brandData);
}
*/


/* ==========================================================================
   HELPER FUNCTIONS
   ========================================================================== */

function getObjectBy(property,id) {
  //get data using id
  if(currentData[id]) return currentData[id];
  console.log('getObjectBy: ',property,id);
  for (var key in currentData) {
    if(currentData[key][property]==id) return currentData[key];
  }
 }

function getfbRef(dataObject) {
  var currentItem = dataObject.id || dataObject;
  if(dataObject.hasOwnProperty('code')) { // its a country object
    var ref = "market info/"+dataObject.name
  } else {
    ref = currentItem;
  }
  console.log(ref);
  return ref;
}

function byCategory(a,b) {
  if (a.category < b.category) {
   return -1;
 } else if (a.category > b.category) {
   return 1;
 } else {
   return (a.name < b.name) ? -1 : (a.name > b.name) ? 1 : 0;
 }

}
function byName(a,b) {
  if (a.name < b.name)
   return -1;
  if (a.name > b.name)
   return 1;
  return 0;
}

function goToPage(brand, page) {
  switch (page) {
    case 'marketinfo':
      getCountryData();
      break;
    default:
      getBrandData();
  }

}

function replaceURLWithHTMLLinks(text) {
  var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
  return text.replace(exp,"<a href='$1' target='_blank'>$1</a>");
}

function cleanString(string) {
  string.replace(/ /g,'');
  return string;
}

function cleanArray(actual) {
  var newArray = new Array();
  for (var i = 0; i < actual.length; i++) {
    if (actual[i]) {
      newArray.push(actual[i]);
    }
  }
  return newArray;
}

function getURLParameter(name) {
  return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [null, ''])[1].replace(/\+/g, '%20')) || null;
}

function imgError(e) {
  var image = e.target;
  var currentItem = document.getElementById('current-item').innerHTML;
  var infoObject = getObjectBy('name',currentItem);
  var ref = getfbRef(infoObject);

  infoObject.images.splice(image.id,1);
  var fbRef = database.ref('/'+brand+'/'+ref);
  fbRef.update(infoObject).then(function() {
    //syncData(countryIndex);
  });
  image.parentNode.outerHTML = "";
  finalModalSetup(infoObject);
}


function splitIntoCategories(data) {
  //first make list of categories
  var categoryList = [];
  data.map(function(item){
   if(categoryList.indexOf(item.category)==-1) {
     // new category, so make new list
     categoryList.push(item.category);
   }
  });
  var dataInCategories = [];
  categoryList.map(function(category){
   var itemsInCategory = [];
   data.map(function(item) {
       if(item.category==category){
         itemsInCategory.push(item);
       }
   })
   dataInCategories.push(itemsInCategory);
   //document.getElementById('main-list').appendChild(makeUL(itemsInCategory));
  })
  return dataInCategories;
}
