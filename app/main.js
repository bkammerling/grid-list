var config = {
  apiKey: "AIzaSyA_0zTo845L0-w-tMfOb8Yp1kUKjQeQKIY",
  databaseURL: "https://knowledge-database-87320.firebaseio.com",
  projectId: "knowledge-database-87320",
  storageBucket: "knowledge-database-87320.appspot.com",
};
firebase.initializeApp(config);

var database = firebase.database();

var countryData;
firebase.database().ref('/masterSheet/').once('value').then(function(snapshot){
  var fbData = snapshot.val();
  var dataArray = Object.keys(fbData).map(function(key) { return fbData[key] });
  createList(dataArray);
  setupFooter(dataArray);
  countryData = dataArray;
});

var editMode = false;
const listArea = document.getElementById('main-list');

const gridButton = document.getElementById('view-grid');
gridButton.addEventListener('click', viewGrid);
const listButton = document.getElementById('view-list');
const sortButton = document.getElementById('sort-list');

const editButton = document.getElementById('main-edit');
//editButton.addEventListener('click', editModeToggle);
const addButton = document.getElementById('add-button');
addButton.addEventListener('click', addItem);

holmes({
  input: '.searchbar', // default: input[type=search]
  find: 'ul.list li', // querySelectorAll that matches each of the results individually
  dynamic: true
});


function createList(data) {
  var dataInCategories = splitIntoCategories(data);
  dataInCategories.map(function(categoryArray) {
    listArea.innerHTML = makeUL(categoryArray);
    var items = document.getElementsByClassName('list-item');
    Array.from(items).forEach(function(element) {
      element.addEventListener('click', clickItem, false);
    });

  })
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

function makeUL(array) {
    var countries = { 'countryList': array };
    var template =
    '<div class="list-container"> \
      <h3 class="list-heading"> {{countryList.0.category}} </h3> \
      <ul class="list">{{#countryList}} \
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
  if(this) {
    var id = this.id;
  } else {
    id = 'AL';
  }
  //get data using id
  var thisCountry;
  countryData.map(function(item) {
    if(item.code==id) thisCountry = item;
  })
  var html = modalTemplate(thisCountry);

  // instanciate new modal
  var modal = new tingle.modal({
      footer: true,
      stickyFooter: false,
      closeMethods: ['overlay', 'button', 'escape'],
      closeLabel: "Close",
      cssClass: ['custom-class-1', 'custom-class-2'],
      beforeClose: function() {
          // here's goes some logic
          // e.g. save content before closing the modal
          return true; // close the modal
      	return false; // nothing happens
      }
  });

  // set content
  modal.setContent(html);

  // open modal
  modal.open();

}

function modalTemplate(country) {
  var moustacheSections = { 'sections' : [], 'name': country.name, 'code': country.code };
  for (var prop in country){
    if (country.hasOwnProperty(prop) && country[prop].length > 1 && prop!='name' && prop!='code' && prop!='category'){
      var sectionObject = {};
      sectionObject.value = country[prop];
      if(!isNaN(prop)) prop = '';
      sectionObject.key = prop;
      moustacheSections['sections'].push(sectionObject);
    }
  }
  console.log(moustacheSections);

  var template =
  '<h3><span class="code-badge">{{code}}</span>{{name}}</h3> \
  <div class="country-info"> \
    {{#sections}} \
    <div class="section clearfix"> \
      <dt class="section-title">{{key}}</dt> \
      <dd class="section-content">{{value}}</dd> \
    </div> \
    {{/sections}} \
  </div>';
  var html = Mustache.to_html(template, moustacheSections);

  return html;

}


function viewGrid() {
  countryData.sort(byName);

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
