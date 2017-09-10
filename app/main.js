/*
var config = {
  apiKey: "AIzaSyA_0zTo845L0-w-tMfOb8Yp1kUKjQeQKIY",
  databaseURL: "https://knowledge-database-87320.firebaseio.com",
  projectId: "knowledge-database-87320",
  storageBucket: "knowledge-database-87320.appspot.com",
};*/
// Initialize TESTING Firebase
var config = {
  apiKey: "AIzaSyCOnG9vQhWLjHc1ghnCVZB4SlX_ecS7Z3w",
  authDomain: "kdb-test.firebaseapp.com",
  databaseURL: "https://kdb-test.firebaseio.com",
  projectId: "kdb-test",
  storageBucket: "kdb-test.appspot.com",
};
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
    // [START addscopes]
    provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
    // [END addscopes]
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
    countryData = null;
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
      //document.getElementById('user-signed-in').classList.remove('hidden');
      //document.getElementById('google-sign-in').classList.add('hidden');
      getFirebaseData();
    } else {
      // User is signed out.
      document.getElementsByTagName("BODY")[0].classList.add('signed-out');
      //document.getElementById('user-signed-in').classList.add('hidden');
      //document.getElementById('google-sign-in').classList.remove('hidden');
    }
  });
  document.getElementById('google-sign-in').addEventListener('click', toggleSignIn, false);
  document.getElementById('sign-out').addEventListener('click', toggleSignIn, false);
}

window.onload = function() {
  initApp();
};


//now we can set up and get our data
var database = firebase.database();
var storage = firebase.storage();

var countryData, properties;
var brand = getURLParameter('brand') || "monster";
brand = brand.toLowerCase();
document.getElementById("logo-"+brand).classList.add('active');

function getFirebaseData() {
  document.getElementById('loading-spinner').classList.remove('hidden');
  database.ref('/'+brand+'/').once('value').then(function(snapshot){
    document.getElementById('loading-spinner').classList.add('hidden');
    countryData = snapshot.val();
    // remove ordering object at position [0]
    properties = countryData.shift();
    console.log(countryData);
    createList(countryData.sort(byCategory));
    setupFooter(countryData.sort(byName));
    //console.log(countryData);
  }, function(error) {
    // The Promise was rejected.
    console.error(error);
    document.getElementById('loading-spinner').innerHTML = "Yikes - can't connect to database. RETREAT!"
  });
}

var editMode = false;
const listArea = document.getElementById('main-list');
const footerArea = document.getElementById('footerData');

const modal = null;

const gridButton = document.getElementById('view-grid');
gridButton.addEventListener('click', viewGrid);
const listButton = document.getElementById('view-list');
listButton.addEventListener('click', viewList);
const sortButton = document.getElementById('sort-list');
sortButton.addEventListener('click', sortList);

const editButton = document.getElementById('main-edit');
//editButton.addEventListener('click', editModeToggle);
const addButton = document.getElementById('add-button');
//addButton.addEventListener('click', addItem);

/* to work OFFLINE
function Get(yourUrl){
    var Httpreq = new XMLHttpRequest(); // a new request
    Httpreq.open("GET",yourUrl,false);
    Httpreq.send(null);
    return Httpreq.responseText;
}
var json_obj = JSON.parse(Get('/js/kdb250817.json'));
countryData = json_obj.masterSheet;
document.getElementById('loading-spinner').classList.add('hidden');
var dataArray = Object.keys(countryData).map(function(key) { return countryData[key] });
createList(dataArray.sort(byCategory));
setupFooter(dataArray.sort(byName));
countryData = dataArray;
console.log(countryData);
/* to work Offline  ends here  */


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

function makeUL(array) {
    var ulArray = array.map(function(item, index, array){
      var tempItem = JSON.parse(JSON.stringify(item))
      if(index>=1) {
        tempItem.sameCategory = (item.category == array[index-1].category);
      } else {
        tempItem.sameCategory = false;
      }
      return tempItem;
    })
    var countries = { 'countryList': ulArray };
    var template =
    '<div class="list-container"> \
      <ul class="list">{{#countryList}} \
      {{^sameCategory}}<h3 class="list-heading"> {{category}} </h3> {{/sameCategory}}\
        <li class="list-item cat-{{category}}" id="{{code}}"> \
          <span class="code-badge">{{code}}</span> \
          <span class="list-item-title">{{name}}</span> \
        </li> \
        {{/countryList}} \
      </ul> \
    </div>';
    var html = Mustache.to_html(template, countries);
    return html;
}


function setupFooter(array) {
  footerArea.innerHTML = buildFooter(array);
  var items = document.getElementsByClassName('footer-item');
  Array.from(items).forEach(function(element) {
    element.addEventListener('click', clickItem, false);
  });
}

function buildFooter(array) {
  var countries = { 'countryList': array };
  var template =
    '<ul class="footer-list">{{#countryList}} \
      <li class="footer-item" id="{{code}}"> \
        <span class="list-item-title">{{name}}</span> \
      </li> \
      {{/countryList}} \
    </ul> \
  </div>';
  var html = Mustache.to_html(template, countries);
  return html;
}


function clickItem(e) {
  // list item is clicked
  if(this) {
    var id = this.id;
  } else {
    id = 'AL';
  }
  //get data using id
  var thisCountry = getCountryBy('code',id);
  // get html using mustache.js template
  var html = modalTemplate(thisCountry);

  // instanciate new modal
  if(modal==null) {
    modal = new tingle.modal({
        footer: true,
        stickyFooter: false,
        closeMethods: ['overlay', 'button', 'escape'],
        closeLabel: "Close",
        cssClass: ['country-modal'],
        beforeClose: function() {
            // here's goes some logic
            // e.g. save content before closing the modal
            return true; // close the modal
        	return false; // nothing happens
        }
    });
  }

  // set content
  modal.setContent(html);

  // open modal
  modal.open();

  // dom is loaded, set up event listeners etc.
  finalModalSetup(thisCountry);

}

function modalTemplate(countryObject) {
  var country = JSON.parse(JSON.stringify(countryObject));
  var moustacheSections = { 'sections' : [], 'name': country.name, 'code': country.code };
  delete country.name;
  delete country.code;
  delete country.category;
  // if 1 image it will be string, otherwise it's an object
  // either way we gotta clean it up
  if(typeof country.images == 'object') {
    country.images = cleanArray(country.images);
    moustacheSections['images'] = [];
    for(var key in country.images) {
      var imageObj = { 'key': key, 'src': country.images[key] };
      moustacheSections['images'].push(imageObj);
    }
  } else if (typeof country.images == 'string') {
    moustacheSections['images'] = [{ 'key':0, 'src':country.images}];
  }

  for (var key in properties){
    var prop = properties[key];
    if (country.hasOwnProperty(prop) &&
        country[prop].length > 1 &&
        prop!='images') {
      var sectionObject = {};
      // if any links in there, lets create the anchor tag
      sectionObject.value = replaceURLWithHTMLLinks(country[prop]);
      sectionObject.key = prop;
      //if(!isNaN(prop)) prop = '';
      moustacheSections['sections'].push(sectionObject);
    }
  }

  console.log(moustacheSections);

  var template =
  '<h3><span class="code-badge" id="country-code">{{code}}</span><span id="current-country">{{name}}</span></h3> \
  <div class="country-info"> \
    {{#sections}} \
    <div class="section clearfix"> \
      <dt class="section-title">{{key}} </dt> \
      <dd class="section-content">{{{value}}}</dd> \
    </div> \
    {{/sections}} \
  </div> \
  <div class="images" id="images-container" > \
    {{#images}} <div class="image-container"> \
    <img src="{{src}}" alt="image for {{name}}" id="{{key}}" class="modal-image"> <span class="remove-cross">x<span></div> {{/images}} \
  </div> \
  <label class="custom-file-upload button" id="upload-container"><input type="file" id="file-upload" name="files[]" accept="image/x-png,image/gif,image/jpeg" />  Upload Image </label> <span id="upload-text"></span>';
  var html = Mustache.to_html(template, moustacheSections);
  return html;

}


//function to save file
function uploadFile() {

  var file = document.getElementById("file-upload").files[0];
  var currentCountry = document.getElementById("current-country").innerHTML;
  var countryObject = getCountryBy('name',currentCountry);
  var uploadText = document.getElementById('upload-text');
  var fileName = currentCountry +  "-" + file.name;

  var storageRef = storage.ref();

  //dynamically set reference to the file name
  var imageRef = storageRef.child('images/'+ fileName);
  imageRef.getDownloadURL().then(function(url) {
    if(countryObject.images.includes(url)) {
      uploadText.innerHTML = 'File already exists in storage';
    } else {
      uploadText.innerHTML = 'File already exists in storage, want to add it to this card? <a onclick="addUrlToDB('+url+','+currentCountry+')"> YES </a>';
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
      addUrlToDB(downloadURL,currentCountry);
    });
  });

}

function addUrlToDB(url,currentCountry) {
  // get the current country object to add the images
  var countryObject = getCountryBy('name',currentCountry);

  var countryIndex = countryData.findIndex(x => x.name == currentCountry);
  countryIndex++; //to compensate for the element we shift()ed at the beginning
  console.log("index: ",countryIndex)
  // if no images currently, create the array
  countryObject.images = countryObject.images || [];
  if(!Array.isArray(countryObject.images)) {
    countryObject.images = [countryObject.images]
  }
  console.log("images: ",countryObject.images);
  countryObject.images.push(url);
  // update database with new image
  var countryRef = database.ref('/'+brand+'/'+countryIndex);
  countryRef.update(countryObject).then(function() {
    syncData(countryIndex);
  });
  // reset the modal with our new content
  var html = modalTemplate(countryObject);
  modal.setContent(html);
  finalModalSetup(countryObject);
}

function finalModalSetup(countryObject) {
  // once dom has updated with modal, finalModalSetup runs
  var items = document.getElementsByClassName('remove-cross');
  Array.from(items).forEach(function(element) {
    element.addEventListener('click', removeImage, false);
  });
  document.getElementById('file-upload').addEventListener('change', uploadFile);
  // if 2 images already, hide upload button
  if(typeof countryObject.images == 'object') {
    if(countryObject.images.length >=2) document.getElementById('upload-container').classList.add('hidden');
  }
}


function removeImage(e) {
  var imageId = e.target.previousElementSibling.id;
  var imageSrc = e.target.previousElementSibling.src;
  var countryCode = document.getElementById('country-code').innerHTML;
  var countryObject = getCountryBy('code',countryCode);
  var countryIndex = countryData.findIndex(x => x.code == countryCode);
  countryIndex++;
  console.log(countryIndex);

  var imageReference = storage.refFromURL(imageSrc);
  imageReference.delete().then(function() {
    // File deleted successfully
    countryObject.images.splice(imageId,1);
    var countryRef = database.ref('/'+brand+'/'+countryIndex);
    countryRef.update(countryObject).then(function() {
      syncData(countryIndex);
    });

    // reset the modal with our new content
    var html = modalTemplate(countryObject);
    modal.setContent(html);
    finalModalSetup(countryObject);
  }).catch(function(error) {
    // Uh-oh, an error occurred!
    alert("Couldn't delete image, sorry.");
  });

}

function viewGrid() {
  createList(countryData.sort(byCategory));
  listArea.classList.remove('list-view');
  listArea.classList.add('grid-view');
  listButton.classList.remove('active');
  gridButton.classList.add('active');
}

function viewList() {
  createList(countryData.sort(byName));
  listArea.classList.add('list-view');
  listArea.classList.remove('grid-view');
  gridButton.classList.remove('active');
  listButton.classList.add('active');
}

function sortList() {

}


function syncData(cid) {
  console.log("cid: ",cid," sheet: ",brand);
  // just trigger the sheet to get new data for the 1 record
  request('GET', 'https://script.google.com/macros/s/AKfycbzsL5z6_mHIn_hUFCzJpGy-0rt6wI8Y85sOS7uWw4aXnzAtYVY/exec?cid='+cid+'&sheet='+brand).done(function (res) {
    //countryData = JSON.parse(res.getBody());
    //setListData(countryData);
    console.log(res.getBody());
  });
}

/*
function editModeToggle() {
  editMode = !editMode;
  document.body.className = editMode ? " editmode" : "";
  editButton.innerHTML = editMode ? 'Finish' : 'Edit';
  editMode ? enableTextEditing() : disableTextEditing();
}

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
*/

function endEdit(event) {
  var siblings = event.target.parentElement.children;
  var idElement = siblings[1],
      titleElement = siblings[2],
      detailsElement = siblings[3];
  var item = countryList.get('id', idElement.innerHTML)[0];
  var countryIndex = countryData.findIndex(findById,idElement.innerHTML);
  console.log(countryData);
  countryData[countryIndex] = {
    "id":idElement.innerHTML,
    "country":titleElement.innerHTML,
    "details":detailsElement.innerHTML
  };
  console.log(countryData);
  saveCountryData(countryData);
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
  };*/
}

function removeItem(event) {
  var siblings = event.target.parentElement.children;
  var idElement = siblings[1];
  console.log(idElement.innerHTML);
  countryList.remove('id', idElement.innerHTML);
  var countryIndex = countryData.findIndex(findById,idElement.innerHTML);
  countryData.splice(countryIndex, 1);
  saveCountryData(countryData);
}


/* ==========================================================================
   HELPER FUNCTIONS
   ========================================================================== */

function getCountryBy(property,id) {
  //get data using id
  var thisCountry;
  countryData.map(function(item) {
    if(item[property]==id) thisCountry = item;
  });
  return thisCountry;
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

function replaceURLWithHTMLLinks(text) {
  var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
  return text.replace(exp,"<a href='$1'>$1</a>");
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
