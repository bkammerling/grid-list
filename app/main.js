
const config = {
  apiKey: "AIzaSyA_0zTo845L0-w-tMfOb8Yp1kUKjQeQKIY",
  authDomain: "knowledge-database-87320.firebaseapp.com",
  databaseURL: "https://knowledge-database-87320.firebaseio.com",
  projectId: "knowledge-database-87320",
  storageBucket: "knowledge-database-87320.appspot.com",
};
var brandData, countryData, currentData, properties, editMode, allBrands;
const brand = getURLParameter('brand') || "monster";
brand = brand.toLowerCase();
document.getElementById("current-brand").innerHTML = brand;
document.getElementById("current-brand").addEventListener('click',getBrandData,false);
document.getElementById("new-brand").addEventListener('click',editBrand,false);
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
  // Get the brand selection we have on the db
  // first line supposedly speeds up data retrieval
  //database.ref('/brands/').on('value',function() {});
  database.ref('/brands/').once('value').then(function(snapshot){
    allBrands = snapshot.val();
    createBrandList(allBrands);
  });
  // Get the specific brand info we need
  database.ref('brand_data/'+brand+'/').once('value').then(function(snapshot){
    document.getElementById('loading-spinner').classList.add('hidden');
    document.getElementById('breadcrumbs').classList.remove('hidden');
    brandData = snapshot.val();
    countryData = brandData['market info'];
    currentData = brandData;
    //page is the url ?page=parameter !
    if(page) goToPage(brand, page);
    createList(currentData);
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
  if(editMode) addNewItemButton();
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
  moustacheSections.sort(byName);
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
  var infoObject = getObjectBy('id',title);
  // market info is list of countries so need to make new country list
  if(title.toLowerCase()=='market info') {
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
    var infoObject = getObjectBy('id', currentItem);
    var ref = getfbRef(infoObject);

    var fbRef = database.ref('brand_data/'+brand+'/'+ref);
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
  var objectID = document.getElementById('card-title').dataset.fbid;
  var infoObject = getObjectBy('id',objectID);
  var uploadText = document.getElementById('upload-text');
  var fileName = brand + "-" + infoObject.name +  "-" + file.name;

  var storageRef = storage.ref();

  //dynamically set reference to the file name
  var imageRef = storageRef.child('images/'+ fileName);
  imageRef.getDownloadURL().then(function(url) {
    if(infoObject.images.includes(url)) {
      //we already have the url in the object
      uploadText.innerHTML = 'File already exists in storage';
    } else {
      // add the url to the DB if the file exists but its not on the object
      addUrlToDB(url, objectID);
    }
    return;
  }).catch(function(error) {
    //continue as normal - file should be uploaded and url added to object
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
      addUrlToDB(downloadURL,objectID);
    });
  });

}

function addUrlToDB(url,currentItem) {
  // get the current country object to add the images
  var infoObject = getObjectBy('id',currentItem);
  var ref = getfbRef(infoObject);
  // if no images currently, create the array
  infoObject.images = infoObject.images || [];
  if(!Array.isArray(infoObject.images)) {
    infoObject.images = [infoObject.images]
  }
  infoObject.images.push(url);
  // update database with new image
  var fbRef = database.ref('brand_data/'+brand+'/'+ref);
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

  var objectID = document.getElementById('card-title').dataset.fbid;
  var infoObject = getObjectBy('id',objectID);

  var ref = getfbRef(infoObject);

  var imageReference = storage.refFromURL(imageSrc);
  imageReference.delete().then(function() {
    // File deleted successfully
    infoObject.images.splice(imageId,1);

    var fbRef = database.ref('brand_data/'+brand+'/'+ref);
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


function createBrandList(brandData) {
  const brandArea = document.getElementById('brand-list');
  var moustacheSections = [];
  for (var key in brandData) {
    brandData[key]['cleanname'] = brandData[key].name.toLowerCase();
    moustacheSections.push(brandData[key]);
  }
  var moustacheObject = { 'allBrands': moustacheSections };
  var template =
  ' {{#allBrands}} \
    <a class="brand-logo" href="?brand={{cleanname}}" id="logo-{{cleanname}}" data-fbid="{{name}}"> \
      <img src="{{img}}" alt="{{name}} logo"/> \
    </a> \
  {{/allBrands}}';
  var html = Mustache.to_html(template, moustacheObject);
  brandArea.innerHTML = html;
  document.getElementById("logo-"+brand).classList.add('active');
  if(editMode) toggleBrandEdit();
}

function editBrand(e) {
  e.preventDefault();
  var currentBrand = this.dataset.fbid ? allBrands[this.dataset.fbid.toLowerCase()] : { 'name':false,'img':false };
  console.log(allBrands, currentBrand, this.dataset.fbid);
  var template =
  '<h3 id="card-title" data-fbid="{{#name}}{{name}}{{/name}}"> \
  <span id="current-item" contentEditable>{{#name}}{{name}}{{/name}}{{^name}}Brand Name: Edit Me{{/name}}</span> <a class="btn btn-success" id="brand-done"><i class="icon-ok"></i> Done</a> <a class="btn btn-danger" id="cancel-brandedit">Cancel</a></h3> \
    <div class="image-container"> \
    <img src="{{#img}}{{img}}{{/img}}{{^img}}https://unsplash.it/100/100/?random{{/img}}" id="brand-image" alt="image for {{name}}" class="modal-image"> </div>  \
  <label class="custom-file-upload button" id="upload-container"><input type="file" id="file-upload" name="files[]" accept="image/x-png,image/gif,image/jpeg" />  Change Image </label> <span id="upload-text"></span>\
  <span id="card-info-text"></span>';
  var html = Mustache.to_html(template, currentBrand);
  // instanciate new modal
  if(modal==null) {
    modal = new tingle.modal({
        footer: true,
        stickyFooter: false,
        closeMethods: ['overlay', 'button', 'escape'],
        closeLabel: "Close",
        cssClass: ['brand-modal']
    });
  }
  // set content
  modal.setContent(html);
  // open modal
  modal.open();
  newBrandModalSetup();
}

function newBrandModalSetup() {
  // once dom has updated with modal, newBrandModalSetup runs
  // add error listener for images
  var imageItems = document.getElementsByClassName('modal-image');
  Array.from(imageItems).forEach(function(element) {
    element.addEventListener('error', imgError, false);
  });
  var cancelButton = document.getElementById('cancel-brandedit');
  cancelButton.addEventListener('click', function() { modal.close(); }, false);
  var doneButton = document.getElementById('brand-done');
  doneButton.addEventListener('click', saveBrand, false);
  // setup upload button
  document.getElementById('file-upload').addEventListener('change', uploadBrandImage);
}

function uploadBrandImage() {
  //upload the image for a new brand / editting brand
  var file = document.getElementById("file-upload").files[0];
  var fileName = "brandimage-"+file.name;
  var uploadText = document.getElementById('upload-text');

  var storageRef = storage.ref();

  //dynamically set reference to the file name
  var imageRef = storageRef.child('images/brand-logos/'+ fileName);
  imageRef.getDownloadURL().then(function(url) {
    // the file exists in storage, no point in uploading again
    document.getElementById("brand-image").src = url;
    return;
  }).catch(function(error) {
    //continue as normal - file should be uploaded and url added to object
    var uploadTask = imageRef.put(file);
    uploadTask.on('state_changed', function(snapshot){
      var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      uploadText.innerHTML = 'Uploading file: '+file.name;
    }, function(error) {
      // Handle unsuccessful uploads
      uploadText.innerHTML = 'There was an error in the upload.';
    }, function() {
      // Handle successful uploads on complete
      uploadText.innerHTML = '';
      var downloadURL = uploadTask.snapshot.downloadURL;
      document.getElementById("brand-image").src = downloadURL;
    });
  });

}

function saveBrand(e) {
  var fbID = document.getElementById("card-title").dataset.fbid.toLowerCase();

  var newName = document.getElementById("current-item").innerHTML.toLowerCase();
  var img = document.getElementById("brand-image").src;
  var brandObject = {
    'name': newName,
    'img': img
  }

  var infoText = document.getElementById('card-info-text');
  infoText.innerHTML = "Saving...";
  console.log('Saving Brand: ',fbID, brandObject);

  if(fbID) { // brand already exists
    updateBrand(fbID,brandObject);
  } else { // save a new brand
    // now we can update the Firebase Database
    var brandName = brandObject.name;
    var fbRef = database.ref('/brands/'+brandName);
    fbRef.set(brandObject).then(function() {
      modal.close();
      console.log('fb db update complete')
    });
    var brandRef = database.ref('brand_data/'+brandName);
    var newBrandData = {
      "-KvWnS6__VlfsY6qptaa" : {
        "Hello world " : "Hello description",
        "id" : "-KvWnS6__VlfsY6qptaa",
        "name" : "Main Info"
      },
      "market info" : {
        "-Kvkdb290512" : {
          "Language" : "English",
          "code" : "XX",
          "id" : "-Kvkdb290512",
          "name" : "Country"
        }
      }
    }
    brandRef.set(newBrandData);
  }
  allBrands[brandName] = brandObject;
  if(allBrands[fbID]) delete allBrands[fbID];
  if(brand = fbID) brand = newName;
  createBrandList(allBrands);
}

function updateBrand(fbID,brandObject) {
  var brandRef = database.ref('/brands');
  // first update the brands table (json)
  var brandUpdate = {};
  brandUpdate[fbID] = null;
  brandUpdate[brandObject.name] = brandObject;
  brandRef.update(brandUpdate);
  // now we update the single brand_data table json
  var tableRef = database.ref('brand_data/')
  tableRef.child(fbID).once('value').then(function(snap) {
    var data = snap.val();
    console.log(data);
    var tableUpdate = {};
    tableUpdate[fbID] = null
    tableUpdate[brandObject.name] = data
    tableRef.update(tableUpdate);
    modal.close();
  });
}

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



/*
* -----
*  EDITTING MODE AND DB UPDATING
* ------
*/


function editModeToggle() {
  toggleBrandEdit();
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
  itemClone.id = "add-btn";
  itemClone.dataset.title = "";
  itemClone.children[0].innerHTML = "+";
  if(itemClone.children[1]) itemClone.children[1].innerHTML = "";
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

function toggleBrandEdit() {
  var brands = document.getElementsByClassName("brand-logo");
  Array.from(brands).forEach(function(element) {
    editMode ? element.addEventListener('click',editBrand,false) : element.removeEventListener('click',editBrand,false);
  });

}

function addNewItem() {
  var newItem = {
      'name':'| New Title',
      'Section name': 'Section description'
  };
  if(currentData==brandData) {
    var newItemRef = database.ref('brand_data/'+brand+'/').push();
    currentData[newItemRef.key] = newItem;
  } else {
    newItem.code = 'XX';
    newItemRef = database.ref('brand_data/'+brand+'/market info/').push();
    currentData[newItemRef.key] = newItem;
  }
  newItem.id = newItemRef.key;
  document.getElementById('add-btn').disabled = true;
  newItemRef.set(newItem).then(function() {
    createList(currentData);
    document.getElementById('add-btn').disabled = false;
  })
  .catch(function(error) {
    console.log('Synchronization failed');
    alert('Problem adding item to database')
  });
}


function endEdit(event) {
  console.log('in endEdit');
  if(event.target.innerHTML=="" && confirm('You left something blank. Do you want to remove this section?')) {
    var editableElement = event.target;
    editableElement.parentElement.parentElement.removeChild(editableElement.parentElement);
  } else if(event.target.innerHTML=="") {
    //focus on section
    event.target.innerHTML = "&nbsp;";
  }
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

  var oldObject = getObjectBy('id',infoID);
  if(oldObject.images) newObject.images = oldObject.images;
  var ref = getfbRef(oldObject);
  // now we can update the Firebase Database
  var fbRef = database.ref('brand_data/'+brand+'/'+ref);
  fbRef.set(newObject).then(function() {
    currentData[infoID] = newObject;
    createList(currentData);
    infoText.innerHTML = "Saved. You're up to date."
    console.log('fb db update complete')
  });

}



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
  var fbKey = dataObject.id || dataObject.name;
  if(dataObject.hasOwnProperty('code')) { // its a country object
    var ref = "market info/"+fbKey
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
  if (a.name.toLowerCase() < b.name.toLowerCase())
   return -1;
  if (a.name.toLowerCase() > b.name.toLowerCase())
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
  var objectID = document.getElementById('card-title').dataset.fbid;
  var infoObject = getObjectBy('id',objectID);
  var ref = getfbRef(infoObject);

  infoObject.images.splice(image.id,1);
  var fbRef = database.ref('brand_data/'+brand+'/'+ref);
  fbRef.update(infoObject).then(function() {
    //syncData(countryIndex);
  });
  image.parentNode.outerHTML = "";
  finalModalSetup(infoObject);
}
