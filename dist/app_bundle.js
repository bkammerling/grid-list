/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.l = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };

/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};

/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};

/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var options = {
  valueNames: ['id', 'country', 'details'],
  item: '<li><img class="close-img" src="../img/close.png" /><span style="display:none" class="id"></span><h3 class="country" contenteditable="false"></h3><p class="details" contenteditable="false"></p></li>'
};

var countryList, countryData;
var editMode = false;

var editButton = document.getElementById('main-edit');
editButton.addEventListener('click', editModeToggle);
var addButton = document.getElementById('main-add');
addButton.addEventListener('click', addItem);

request('GET', '../js/countries.json').done(function (res) {
  countryData = JSON.parse(res.getBody());
  setListData(countryData);
});

function setListData(listData) {
  countryList = new List('dataArea', options, listData);
  countryList.sort('country', { order: "asc" });
}

function saveCountryData(json) {
  request('POST', '../js/jsonsave.php', { 'body': JSON.stringify(json) }).done(function (res) {
    console.log(res);
    return res.getBody();
  });
}

function editModeToggle() {
  editMode = !editMode;
  document.body.className = editMode ? " editmode" : "";
  editButton.innerHTML = editMode ? 'Finish' : 'Edit';
  editMode ? enableTextEditing() : disableTextEditing();
}

function enableTextEditing() {
  var countryTitleElements = document.getElementsByClassName("country");
  Array.from(countryTitleElements).forEach(function (element) {
    element.contentEditable = true;
    element.addEventListener('blur', endEdit);
  });
  var detailElements = document.getElementsByClassName("details");
  Array.from(detailElements).forEach(function (element) {
    element.contentEditable = true;
    element.addEventListener('blur', endEdit);
  });
  var removeButtons = document.getElementsByClassName('close-img');
  Array.from(removeButtons).forEach(function (element) {
    element.addEventListener('click', removeItem);
  });
}

function disableTextEditing() {
  var countryTitleElements = document.getElementsByClassName("country");
  Array.from(countryTitleElements).forEach(function (element) {
    element.contentEditable = false;
    //element.removeEventListener('click', titleBeginEdit);
  });
  var detailElements = document.getElementsByClassName("details");
  Array.from(detailElements).forEach(function (element) {
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
  var countryIndex = countryData.findIndex(findById, idElement.innerHTML);
  console.log(countryData);
  countryData[countryIndex] = {
    "id": idElement.innerHTML,
    "country": titleElement.innerHTML,
    "details": detailsElement.innerHTML
  };
  console.log(countryData);
  saveCountryData(countryData);
}

function findById(country) {
  return country.id == this;
}

function addItem() {
  var newItem = {
    "id": Math.floor(Math.random() * 12000),
    "country": "New Title",
    "details": "Some details"
  };
  countryData.unshift(newItem);
  var itemHTML = document.createElement('LI');
  itemHTML.innerHTML = '<img class="close-img" src="../img/close.png" /><span style="display:none" class="id">' + newItem.id + '</span><h3 class="country" contenteditable="true">New Item</h3><p class="details" contenteditable="true">Some details</p>';
  var listElement = document.getElementById('main-list');
  listElement.insertBefore(itemHTML, listElement.childNodes[0]);
  countryList.reIndex();
  enableTextEditing();
  console.log(countryData);
}

function removeItem(event) {
  var siblings = event.target.parentElement.children;
  var idElement = siblings[1];
  console.log(idElement.innerHTML);
  countryList.remove('id', idElement.innerHTML);
  var countryIndex = countryData.findIndex(findById, idElement.innerHTML);
  countryData.splice(countryIndex, 1);
  saveCountryData(countryData);
}

/***/ })
/******/ ]);