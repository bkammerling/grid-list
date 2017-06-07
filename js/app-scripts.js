//Add in your database secret
var secret = 'n35BEKLCSbZ2byImSGBfS0KY3eT3ekhjqBROWSGp';
var firebaseURL = 'https://knowledge-database-87320.firebaseio.com/'
var spreadsheetId='1i3kmPg9XTaeFZN6pCbqYEUm_A9G23wg3nWlmZFX6eEQ';


function syncMasterSheet(excelData) {
  var base = FirebaseApp.getDatabaseByUrl(firebaseURL, secret);
  base.setData("masterSheet", excelData);
}

function startSync() {
  //Get the currently active sheet
  var sheet = SpreadsheetApp.getActiveSheet();
  //Get the number of rows and columns which contain some content
  var [rows, columns] = [sheet.getLastRow(), sheet.getLastColumn()];
  //Get the data contained in those rows and columns as a 2 dimensional array
  var data = sheet.getRange(1, 1, rows, columns).getValues();
  Logger.log(data);
  var dataObject = {};
  //Loop through the rows creating a new object for eachone
  for(var i=1; i < data.length; i++) {
    var dataRow = data[i];
    var name = dataRow[0];
    var code = dataRow[1];
    dataObject[code + '-' + name] = {
      name:name,
      code:code,
      category:dataRow[2]
    };
    //Loop through the column of each row, adding the key-values to the dataObject
    for(var j=3; j<dataRow.length; j++) {
      var dataCell = dataRow[j].toString();
      if(dataCell.indexOf(': ')!=-1) {
        var property = dataCell.split(':',2)[0];
        var value = dataCell.split(':',2)[1];
        value = value.trim();
        dataObject[code + '-' + name][property] = value;
      } else {
        dataObject[code + '-' + name][j] = dataCell;
      }
    }

  }

  //Use the syncMasterSheet function defined before to push this data to the "masterSheet" key in the firebase database
  syncMasterSheet(dataObject);
}

function onEdit(e) {

}

function onOpen(e) {

  getAllData();

}

function getAllData() {
  var sheet = SpreadsheetApp.getActiveSheet();
  var sheetObject = [];
  var base = FirebaseApp.getDatabaseByUrl(firebaseURL, secret);
  var data = base.getData("masterSheet");
  for(var i in data) {
    //sheetObject
  }
}

function doPost(e) {
  // Access your spreadsheet and its data:
  var kdbSheet = SpreadsheetApp.openById(spreadsheetId);
  var dataSheet = kdbSheet.getSheets()[0];
  var [rows, columns] = [dataSheet.getLastRow(), dataSheet.getLastColumn()];
  var data = dataSheet.getRange(1, 1, rows, columns).getValues();
  Logger.log(data);

}

function doGet(e){
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

    var sheet = SpreadsheetApp.getActiveSheet();
    var sheetObject = [];
    var base = FirebaseApp.getDatabaseByUrl(firebaseURL, secret);
    var data = base.getData("masterSheet/" + e.parameter.cid + "/");
    for(var i in data) {
      //sheetObject
    }

    return ContentService.createTextOutput(JSON.stringify({"result":e.parameter.cid})).setMimeType(ContentService.MimeType.JAVASCRIPT);


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
