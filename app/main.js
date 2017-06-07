var config = {
  apiKey: "AIzaSyA_0zTo845L0-w-tMfOb8Yp1kUKjQeQKIY",
  databaseURL: "https://knowledge-database-87320.firebaseio.com",
  projectId: "knowledge-database-87320",
  storageBucket: "knowledge-database-87320.appspot.com",
};
firebase.initializeApp(config);

var database = firebase.database();
var storage = firebase.storage();

var countryData;
database.ref('/masterSheet/').once('value').then(function(snapshot){
  document.getElementById('loading-spinner').classList.add('hidden');
  var fbData = snapshot.val();
  var dataArray = Object.keys(fbData).map(function(key) { return fbData[key] });
  createList(dataArray.sort(byCategory));
  setupFooter(dataArray.sort(byName));
  countryData = dataArray;
}, function(error) {
  // The Promise was rejected.
  console.error(error);
  document.getElementById('loading-spinner').innerHTML = "Yikes - can't connect to database. RETREAT!"
});

var editMode = false;
const listArea = document.getElementById('main-list');

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
addButton.addEventListener('click', addItem);

holmes({
  input: '.searchbar', // default: input[type=search]
  find: 'ul.list li, ul.list h3', // querySelectorAll that matches each of the results individually
  dynamic: true
});

/* add class to list headings when search bar has a value */
document.getElementById('main-search').addEventListener("keydown", inputKeyDown);
function inputKeyDown(e) {
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
        <li class="list-item" id="{{code}}"> \
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
  const footerArea = document.getElementById('footerData');
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

function modalTemplate(country) {
  var moustacheSections = { 'sections' : [], 'name': country.name, 'code': country.code };
  if(typeof country.images !== 'undefined') {
    moustacheSections['images'] = [];
    for(var key in country.images) {
      var imageObj = { 'key': key, 'src': country.images[key] };
      moustacheSections['images'].push(imageObj);
    }
  }
  for (var prop in country){
    if (country.hasOwnProperty(prop) &&
        country[prop].length > 1 &&
        prop!='name' &&
        prop!='code' &&
        prop!='category' &&
        prop!='images') {
      var sectionObject = {};
      sectionObject.value = country[prop];
      if(!isNaN(prop)) prop = '';
      sectionObject.key = prop;
      moustacheSections['sections'].push(sectionObject);
    }
  }

  var template =
  '<h3><span class="code-badge" id="country-code">{{code}}</span><span id="current-country">{{name}}</span></h3> \
  <div class="country-info"> \
    {{#sections}} \
    <div class="section clearfix"> \
      <dt class="section-title">{{key}}</dt> \
      <dd class="section-content">{{value}}</dd> \
    </div> \
    {{/sections}} \
  </div> \
  <div class="images" id="images-container" > \
    {{#images}} <div class="image-container"> \
    <img src="{{src}}" alt="image for {{name}}" id="{{key}}"> <span class="remove-cross">x<span></div> {{/images}} \
  </div> \
  <input type="file" id="file-upload" name="files[]"  /> <span id="upload-text"></span>';
  var html = Mustache.to_html(template, moustacheSections);
  return html;

}


//function to save file
function uploadFile() {

  var file = document.getElementById("file-upload").files[0];
  var currentCountry = document.getElementById("current-country").innerHTML;
  var uploadText = document.getElementById('upload-text');
  var fileName = currentCountry +  "-" + file.name;

  var storageRef = storage.ref();

  //dynamically set reference to the file name
  var imageRef = storageRef.child('images/'+ fileName);

  //put request upload file to firebase storage
  var uploadTask = imageRef.put(file);
  uploadTask.on('state_changed', function(snapshot){
    // Observe state change events such as progress, pause, and resume
    // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
    var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
    uploadText.innerHTML = 'Uploading...';
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

}

function addUrlToDB(url,currentCountry) {
  // get the current country object to add the images
  var countryObject = getCountryBy('name',currentCountry);
  var countryId = countryObject.code+"-"+countryObject.name;
  // if no images currently, create the array
  countryObject.images = countryObject.images || [];
  countryObject.images.push(url);
  // update database with new image
  var countryRef = database.ref('/masterSheet/'+countryId);
  countryRef.update(countryObject).then(function() {
    syncData(countryId);
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
  if(typeof countryObject.images !== 'undefined') {
    if(countryObject.images.length >=2) document.getElementById('file-upload').classList.add('hidden');
  }
}


function removeImage(e) {
  var imageId = e.target.previousElementSibling.id;
  var imageSrc = e.target.previousElementSibling.src;
  var countryCode = document.getElementById('country-code').innerHTML;
  var countryObject = getCountryBy('code',countryCode);
  var countryId = countryObject.code+'-'+countryObject.name;
  console.log(imageSrc);

  var imageReference = storage.refFromURL(imageSrc);
  imageReference.delete().then(function() {
    // File deleted successfully
    var countryRef = database.ref('/masterSheet/'+countryId+'/images/'+imageId);
    countryRef.set(null).then(function() {
      syncData(countryId);
    });
    countryObject.images.splice(imageId,1);
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
  document.getElementById("main-list").classList.remove('list-view');
  document.getElementById("main-list").classList.add('grid-view');
}

function viewList() {
  createList(countryData.sort(byName));
  document.getElementById("main-list").classList.add('list-view');
  document.getElementById("main-list").classList.remove('grid-view');
}

function sortList() {

}


function syncData(cid) {
  request('GET', 'https://script.google.com/macros/s/AKfycbzG2biCtXYdTxt5sLhfh1V5lE95V1ZhFVbkdcrR-Bua21zTihCa/exec?cid='+cid).done(function (res) {
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
  if (a.category < b.category)
   return -1;
  if (a.category > b.category)
   return 1;
  return 0;
}
function byName(a,b) {
  if (a.name < b.name)
   return -1;
  if (a.name > b.name)
   return 1;
  return 0;
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
