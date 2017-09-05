//Add in your database
var firebaseURL = 'https://kdb-test.firebaseio.com/'
var spreadsheetId='15OW-QLUUy5R7MtXS1OFD1qXl_K8764XnHY9IyUR626o';

var alphabet = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];

function importFBData() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.toast("Getting latest data from Knowledge Database");

  var kdbDoc = SpreadsheetApp.openById(spreadsheetId);
  var sheetname = "Sheet1"
  var base = FirebaseApp.getDatabaseByUrl(firebaseURL);
  var data = base.getData("testerSheet");
  // clean ordered object properties from 'aName', 'bCountry' etc to name, country etc.
  data.shift();
  Logger.log(data);
  var doc = SpreadsheetApp.getActiveSpreadsheet();
  var temp = doc.getSheetByName("TMP");

  if (!doc.getSheetByName(sheetname)){
    var sheet = doc.insertSheet(sheetname, {template:temp});
  } else {
    var sheet = doc.getSheetByName(sheetname);
    sheet.getRange(2, 1, sheet.getLastRow(), sheet.getMaxColumns()).clear({contentsOnly:true});
  }
  insertData(sheet,data);
}

function insertData(sheet, data){
  Logger.log('in insertData');
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (data.length>0){
    ss.toast("Found "+data.length+" rows");
    sheet.insertRowsAfter(1, data.length);
    setRowsData(sheet, data);
  } else {
    Logger.log('no data');
    ss.toast("All done");
  }
}


// setRowsData fills in one row of data per object defined in the objects Array.
// For every Column, it checks if data objects define a value for it.
// Arguments:
//   - sheet: the Sheet Object where the data will be written
//   - objects: an Array of Objects, each of which contains data for a row
//   - optHeadersRange: a Range of cells where the column headers are defined. This
//     defaults to the entire first row in sheet.
//   - optFirstDataRowIndex: index of the first row where data should be written. This
//     defaults to the row immediately below the headers.
function setRowsData(sheet, objects, optHeadersRange, optFirstDataRowIndex) {
  Logger.log('in setRowsData');

  var headersRange = optHeadersRange || sheet.getRange(1, 1, 1, sheet.getMaxColumns());
  var firstDataRowIndex = optFirstDataRowIndex || headersRange.getRowIndex() + 1;
  var headers = headersRange.getValues()[0]; //normalizeHeaders(headersRange.getValues()[0]);

  var data = [];
  for (var i = 0; i < objects.length; ++i) {
    var values = []
    for (j = 0; j < headers.length; ++j) {
      var header = headers[j];
      //if(header == 'name' || header == 'code' || header == 'category') header = normalizeHeader(header);
      if(header == 'images') {
        values.push(header.length > 0 && objects[i][header] ? objects[i][header].toString() : "");
      } else {
        values.push(header.length > 0 && objects[i][header] ? objects[i][header] : "");
      }
    }
    data.push(values);
  }
  var destinationRange = sheet.getRange(firstDataRowIndex, headersRange.getColumnIndex(),
                                        objects.length, headers.length);
  destinationRange.setValues(data);
}

// getRowsData iterates row by row in the input range and returns an array of objects.
// Each object contains all the data for a given row, indexed by its normalized column name.
// Arguments:
//   - sheet: the sheet object that contains the data to be processed
//   - range: the exact range of cells where the data is stored
//   - columnHeadersRowIndex: specifies the row number where the column names are stored.
//       This argument is optional and it defaults to the row immediately above range;
// Returns an Array of objects.
function getRowsData(sheet, range, columnHeadersRowIndex) {
  Logger.log('in getRowsData');

  columnHeadersRowIndex = columnHeadersRowIndex || range.getRowIndex() - 1;
  var numColumns = range.getEndColumn() - range.getColumn() + 1;
  var headersRange = sheet.getRange(columnHeadersRowIndex, range.getColumn(), 1, numColumns);
  var headers = headersRange.getValues()[0];
  return getObjects(range.getValues(), headers);
}

function sendData() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getActiveSheet();
  var sheetData = ss.getDataRange();
  var dataObject = getRowsData(sheet, sheetData, 1);
  syncMasterSheet(dataObject);
}

// For every row of data in data, generates an object that contains the data. Names of
// object fields are defined in keys.
// Arguments:
//   - data: JavaScript 2d array
//   - keys: Array of Strings that define the property names for the objects to create
function getObjects(data, keys) {
  var objects = [];
  // start from 1 to skip the header row, or from 0 to include it
  for (var i = 0; i < data.length; ++i) {
    var object = {};
    var hasData = false;
    // i is the rows
    for (var j = 0; j < data[i].length; ++j) {
      //j is the columns
      var cellData = data[i][j];
      if (isCellEmpty(cellData)) {
        continue;
      }
      if(keys[j]=='images') {
        cellData = cellData.split(",");
      }
      if(i == 0) {
        //add headers as 0,1,2 for ordering on K.DB
        object[j] = cellData;
      } else {
        object[keys[j]] = cellData;
      }
      //object[alphabet[j]+keys[j]] = cellData;
      hasData = true;
    }
    if (hasData) {
      objects.push(object);
    }
  }
  return objects;
}


// Returns true if the cell where cellData was read from is empty.
// Arguments:
//   - cellData: string
function isCellEmpty(cellData) {
  return typeof(cellData) == "string" && cellData == "";
}

// Returns true if the character char is alphabetical, false otherwise.
function isAlnum(char) {
  return char >= 'A' && char <= 'Z' ||
    char >= 'a' && char <= 'z' ||
    isDigit(char);
}

// Returns true if the character char is a digit, false otherwise.
function isDigit(char) {
  return char >= '0' && char <= '9';
}
// http://jsfromhell.com/array/chunk
function chunk(a, s){
    for(var x, i = 0, c = -1, l = a.length, n = []; i < l; i++)
        (x = i % s) ? n[c][x] = a[i] : n[++c] = [a[i]];
    return n;
}

function cleanProps(item) {
  // as object uses the first character to order it, slice this from
  // each key in each item of the object. aName -> Name.
  for (var key in item) {
    if (item.hasOwnProperty(key)) {
      item[key.slice(1)] = item[key];
      // create new element in object with renamed key. Then delete old element.
      delete item[key];
    }
  }
  return item;
}


function syncMasterSheet(dataObject) {
  var base = FirebaseApp.getDatabaseByUrl(firebaseURL);
  base.setData("testerSheet", dataObject);
}


function doGet(e){
  // this is called after Firebase write to update individual records

  // this prevents concurrent access overwritting data
  // [1] http://googleappsdeveloper.blogspot.co.uk/2011/10/concurrency-and-google-apps-script.html
  // we want a public lock, one that locks for all invocations
  var lock = LockService.getPublicLock();
  var success = lock.tryLock(10000);
  if (!success) {
    Logger.log('Could not obtain lock after 10 seconds.');
    return ContentService
      .createTextOutput(JSON.stringify({"result":"lockerror", "error": e}))
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }


  try {
    var kdbSheet = SpreadsheetApp.openById(spreadsheetId);
    var sheet = kdbSheet.getSheets()[0];

    var base = FirebaseApp.getDatabaseByUrl(firebaseURL);
    var fbData = base.getData("testerSheet/" + e.parameter.cid + "/");
    //var fbData = base.getData("testerSheet/17/");
    //Logger.log(fbData);
    var countryObject = fbData;

    // find the right row with fbData.name
    var sheetData = sheet.getDataRange().getValues();
    var countryName = countryObject.name;
    Logger.log(countryName);
    var rowNumber = null;
    for(var i = 0; i<sheetData.length; i++){
      if(sheetData[i][0] == countryName){ //[0] because column A
        Logger.log((i+1))
        rowNumber = i+1;
      }
    }

    // setRowsData function needs the sheet, an array of data, headers will be found
    // in function so undefined here and finally our row number.
    if(rowNumber) setRowsData(sheet, [countryObject], undefined, rowNumber);

    // Let web service know it was a success with the return
    return ContentService.createTextOutput(JSON.stringify({"result":countryName,"rowNumber":rowNumber})).setMimeType(ContentService.MimeType.JAVASCRIPT);


  } catch(e) {
    //Logger.error('deGet() yielded an error: ' + e);
    // if error return this
    return ContentService
          .createTextOutput(JSON.stringify({"result":"error", "error": e}))
          .setMimeType(ContentService.MimeType.JAVASCRIPT);
  } finally { //release lock
    lock.releaseLock();
  }


 }
