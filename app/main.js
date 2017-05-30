
var countryData;
var editMode = false;

const editButton = document.getElementById('main-edit');
//editButton.addEventListener('click', editModeToggle);
const addButton = document.getElementById('add-button');
addButton.addEventListener('click', addItem);

holmes({
  input: '.searchbar', // default: input[type=search]
  find: 'ul.list li', // querySelectorAll that matches each of the results individually
  dynamic: true
});

request('GET', '../js/countries.json').done(function (res) {
  countryData = JSON.parse(res.getBody());
  // Add the contents of data to dom
  createList(countryData);
});

function createList(data) {
  var listArea = document.getElementById('main-list');
  var dataInCategories = splitIntoCategories(data);
  dataInCategories.map(function(categoryArray) {
    listArea.appendChild(makeUL(categoryArray));
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
    // Create a div for the list and heading
    var container = document.createElement('div');
    container.className = "list-container";

    // Create the list element:
    var list = document.createElement('ul');
    list.className = "list";

    var heading = document.createElement('h3');
    heading.className = "list-heading";
    heading.appendChild(document.createTextNode(array[0].category));
    container.appendChild(heading);

    for(var i = 0; i < array.length; i++) {
        // Create the list item:
        var item = document.createElement('li');
        item.className = "list-item";
        // Set its contents:
        var title = document.createTextNode(array[i].name);
        var code = array[i].code;
        item.id = code;
        // create country code badge
        var codeBadge = document.createElement('span');
        codeBadge.appendChild(document.createTextNode(code));
        codeBadge.className = "code-badge"
        // add badge and country name to our li item
        item.appendChild(codeBadge);
        item.appendChild(title);

        item.onclick = function() {
          clickItem(this.id);
        }
        // Add it to the list:
        list.appendChild(item);
    }

    container.appendChild(list);
    // Finally, return the constructed list:
    return container;
}


function clickItem(id, elem) {
  //get data using id
  var thisCountry;
  countryData.map(function(item) {
    if(item.code==id) thisCountry = item;
  })
  console.log(thisCountry);
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

  var title = '<h3><span class="code-badge">'+ thisCountry.code+'</span>'+ thisCountry.name +'</h3>';

  // set content
  modal.setContent(title);

  // open modal
  modal.open();

}

function saveCountryData(json) {
  request('POST', '../js/jsonsave.php', { 'body':JSON.stringify(json) }).done(function (res) {
    console.log(res);
    return res.getBody();
  });
}

function viewGrid() {

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
