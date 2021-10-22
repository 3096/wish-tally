var sheetSourceId = '1mTeEQs1nOViQ-_BVHkDSZgfKGsYiLATe1mFQxypZQWA';
var nameOfWishHistorys = ["Character Event Wish History", "Permanent Wish History", "Weapon Event Wish History", "Novice Wish History"];

function onOpen( ){
  var ui = SpreadsheetApp.getUi();
  
  ui.createMenu('Wish Tally')
  .addSeparator()
  .addSubMenu(ui.createMenu('Character Event Wish History')
             .addItem('Sort Range', 'sortCharacterEventWishHistory')
             .addItem('Refresh Formula', 'addFormulaCharacterEventWishHistory'))
  .addSubMenu(ui.createMenu('Permanent Wish History')
             .addItem('Sort Range', 'sortPermanentWishHistory')
             .addItem('Refresh Formula', 'addFormulaPermanentWishHistory'))
  .addSubMenu(ui.createMenu('Weapon Event Wish History')
             .addItem('Sort Range', 'sortWeaponEventWishHistory')
             .addItem('Refresh Formula', 'addFormulaWeaponEventWishHistory'))
  .addSubMenu(ui.createMenu('Novice Wish History')
             .addItem('Sort Range', 'sortNoviceWishHistory')
             .addItem('Refresh Formula', 'addFormulaNoviceWishHistory'))
  .addSeparator()
  .addSubMenu(ui.createMenu('AutoHotkey')
             .addItem('Clear', 'clearAHK')
             .addItem('Convert', 'convertAHK')
             .addItem('Import', 'importAHK')
             .addSeparator()
             .addItem('Generate', 'generateAHK'))
  .addSeparator()
  .addItem('Update Items', 'updateItemsList')
  .addItem('Get Latest README', 'displayReadme')
  .addItem('About', 'displayAbout')
  .addToUi();
}

/**
 * Return the id of the sheet. (by name)
 *
 * @return The ID of the sheet
 * @customfunction
 */
function GET_SHEET_ID(sheetName) {
    var sheetId = SpreadsheetApp.getActive().getSheetByName(sheetName).getSheetId();
    return sheetId;
}

function displayAbout() {
  var sheetSource = SpreadsheetApp.openById(sheetSourceId);
  if (sheetSource) {
    var aboutSource = sheetSource.getSheetByName('About');
    var titleString = aboutSource.getRange("B1").getValue();
    var htmlString = aboutSource.getRange("B2").getValue();
    var widthSize = aboutSource.getRange("B3").getValue();
    var heightSize = aboutSource.getRange("B4").getValue();
    
    
    var htmlOutput = HtmlService
    .createHtmlOutput(htmlString)
    .setWidth(widthSize) //optional
    .setHeight(heightSize); //optional
    SpreadsheetApp.getUi().showModalDialog(htmlOutput, titleString);
  } else {
    var message = 'Unable to connect to source';
    var title = 'Error';
    SpreadsheetApp.getActiveSpreadsheet().toast(message, title);
  }
}

function displayReadme() {
  var sheetSource = SpreadsheetApp.openById(sheetSourceId);
  if (sheetSource) {
    // Avoid Exception: You can't remove all the sheets in a document.Details
    var placeHolderSheet = null;
    if (SpreadsheetApp.getActive().getSheets().length == 1) {
      placeHolderSheet = SpreadsheetApp.getActive().insertSheet();
    }
    var sheetToRemove = SpreadsheetApp.getActive().getSheetByName('README');
      if(sheetToRemove) {
        // If exist remove from spreadsheet
        SpreadsheetApp.getActiveSpreadsheet().deleteSheet(sheetToRemove);
      }
    var sheetREADMESource;

    // Add Language
    var settingsSheet = SpreadsheetApp.getActive().getSheetByName("Settings");
    if (settingsSheet) {
      var languageFound = settingsSheet.getRange(2, 2).getValue();
      sheetREADMESource = sheetSource.getSheetByName("README"+"-"+languageFound);
    }
    if (sheetREADMESource) {
      // Found language
    } else {
      // Default
      sheetREADMESource = sheetSource.getSheetByName("README");
    }

    sheetREADMESource.copyTo(SpreadsheetApp.getActiveSpreadsheet()).setName('README');

    // Remove placeholder if available
    if(placeHolderSheet) {
      // If exist remove from spreadsheet
      SpreadsheetApp.getActiveSpreadsheet().deleteSheet(placeHolderSheet);
    }
    var sheetREADME = SpreadsheetApp.getActive().getSheetByName('README');
    // Refresh Contents Links
    var contentsAvailable = sheetREADME.getRange(13, 1).getValue();
    var contentsStartIndex = 15;
    
    for (var i = 0; i < contentsAvailable; i++) {
      var valueRange = sheetREADME.getRange(contentsStartIndex+i, 1).getValue();
      var formulaRange = sheetREADME.getRange(contentsStartIndex+i, 1).getFormula();
      // Display for user, doesn't do anything
      sheetREADME.getRange(contentsStartIndex+i, 1).setFormula(formulaRange);
 
      // Grab URL RichTextValue from Source
      const range = sheetREADMESource.getRange(contentsStartIndex+i, 1);
      const RichTextValue = range.getRichTextValue().getRuns();
      const res = RichTextValue.reduce((ar, e) => {
        const url = e.getLinkUrl();
        if (url) ar.push(url);
          return ar;
        }, []);
      //  Convert to string
      var resString = res+ "";
      var arrayString = resString.split("=");
      if (arrayString.length > 1) {
        var text = arrayString[2];
        const richText = SpreadsheetApp.newRichTextValue()
          .setText(valueRange)
          .setLinkUrl(["#gid="+GET_SHEET_ID("README")+'range='+text])
          .build();
        sheetREADME.getRange(contentsStartIndex+i, 1).setRichTextValue(richText);
      }
    }
 
    SpreadsheetApp.getActive().setActiveSheet(sheetREADME);
  } else {
    var message = 'Unable to connect to source';
    var title = 'Error';
    SpreadsheetApp.getActiveSpreadsheet().toast(message, title);
  }
}

/**
* Add Formula Character Event Wish History
*/
function addFormulaCharacterEventWishHistory() {
  addFormulaByWishHistoryName('Character Event Wish History');
}
/**
* Add Formula Permanent Wish History History
*/
function addFormulaPermanentWishHistory() {
  addFormulaByWishHistoryName('Permanent Wish History');
}
/**
* Add Formula Weapon Event Wish History
*/
function addFormulaWeaponEventWishHistory() {
  addFormulaByWishHistoryName('Weapon Event Wish History');
}
/**
* Add Formula Novice Wish History
*/
function addFormulaNoviceWishHistory() {
  addFormulaByWishHistoryName('Novice Wish History');
}

/**
* Add Formula for selected Wish History sheet
*/
function addFormulaWishHistory() {
  var sheetActive = SpreadsheetApp.getActiveSpreadsheet();
  var wishHistoryName = sheetActive.getSheetName();
  if (nameOfWishHistorys.indexOf(wishHistoryName) != -1) {
    addFormulaByWishHistoryName(wishHistoryName);
  } else {
    var message = 'Sheet must be called "Character Event Wish History" or "Permanent Wish History" or "Weapon Event Wish History" or "Novice Wish History"';
    var title = 'Invalid Sheet Name';
    SpreadsheetApp.getActiveSpreadsheet().toast(message, title);
  }
}

function addFormulaByWishHistoryName(name) {
  var sheetSource = SpreadsheetApp.openById(sheetSourceId);
  if (sheetSource) {
    // Add Language
    var wishHistorySource;
    var settingsSheet = SpreadsheetApp.getActive().getSheetByName("Settings");
    if (settingsSheet) {
      var languageFound = settingsSheet.getRange(2, 2).getValue();
      wishHistorySource = sheetSource.getSheetByName("Wish History"+"-"+languageFound);
    }
    if (wishHistorySource) {
      // Found language
    } else {
      // Default
      wishHistorySource = sheetSource.getSheetByName("Wish History");
    }
    var sheet = findWishHistoryByName(name,sheetSource);

    var wishHistorySourceNumberOfColumn = wishHistorySource.getLastColumn();
    // Reduce two column due to paste and override
    var wishHistorySourceNumberOfColumnWithFormulas = wishHistorySourceNumberOfColumn - 2;

    var lastRowWithoutTitle = sheet.getMaxRows() - 1;

    var currentOverrideTitleCell = sheet.getRange(1, 2).getValue();
    var sourceOverrideTitleCell = wishHistorySource.getRange(1, 2).getValue();
    if (currentOverrideTitleCell != sourceOverrideTitleCell) {
      // If override column don't exist, populate from source
      var overrideCells = wishHistorySource.getRange(2, 2).getFormula();
      sheet.getRange(2, 2, lastRowWithoutTitle, 1).setValue(overrideCells);
      sheet.getRange(1, 2).setValue(sourceOverrideTitleCell);
      sheet.setColumnWidth(2, wishHistorySource.getColumnWidth(2));
    }
    
    // Get second row formula columns and set current sheet
    var formulaCells = wishHistorySource.getRange(2, 3, 1, wishHistorySourceNumberOfColumnWithFormulas).getFormulas();
    sheet.getRange(2, 3, lastRowWithoutTitle, wishHistorySourceNumberOfColumnWithFormulas).setValue(formulaCells);

    // Get title columns and set current sheet
    var titleCells = wishHistorySource.getRange(1, 3, 1, wishHistorySourceNumberOfColumnWithFormulas).getFormulas();
    sheet.getRange(1, 3, 1, wishHistorySourceNumberOfColumnWithFormulas).setValues(titleCells);

    for (var i = 3; i <= wishHistorySourceNumberOfColumn; i++) {
      // Apply formatting for cells
      var numberFormatCell = wishHistorySource.getRange(2, i).getNumberFormat();
      sheet.getRange(2, i, lastRowWithoutTitle, 1).setNumberFormat(numberFormatCell);
      // Set column width from source
      sheet.setColumnWidth(i, wishHistorySource.getColumnWidth(i));
    }

    // Ensure new row is not the same height as first, if row 2 did not exist
    sheet.autoResizeRows(2, 1);
  } else {
    var message = 'Unable to connect to source';
    var title = 'Error';
    SpreadsheetApp.getActiveSpreadsheet().toast(message, title);
  }
}

/**
* Check is sheet exist in active spreadsheet, otherwise pull sheet from source
*/
function findWishHistoryByName(name, sheetSource) {
  var wishHistorySheet = SpreadsheetApp.getActive().getSheetByName(name);
  if (wishHistorySheet == null) {
    if (sheetSource == null) {
      sheetSource = SpreadsheetApp.openById(sheetSourceId);
    }
    if (sheetSource) {
      var sheetCopySource = sheetSource.getSheetByName("Wish History");
      sheetCopySource.copyTo(SpreadsheetApp.getActiveSpreadsheet()).setName(name);
      wishHistorySheet = SpreadsheetApp.getActive().getSheetByName(name);
      wishHistorySheet.showSheet();
    }
  }
  return wishHistorySheet;
}

/**
* Add sort for selected Wish History sheet
*/
function sortWishHistory() {
  var sheetActive = SpreadsheetApp.getActiveSpreadsheet();
  var wishHistoryName = sheetActive.getSheetName();
  if (nameOfWishHistorys.indexOf(wishHistoryName) != -1) {
    sortWishHistoryByName(wishHistoryName);
  } else {
    var message = 'Sheet must be called "Character Event Wish History" or "Permanent Wish History" or "Weapon Event Wish History" or "Novice Wish History"';
    var title = 'Invalid Sheet Name';
    SpreadsheetApp.getActiveSpreadsheet().toast(message, title);
  }
}

/**
* Sort Character Event Wish History
*/
function sortCharacterEventWishHistory() {
  sortWishHistoryByName('Character Event Wish History');
}

/**
* Sort Permanent Wish History
*/
function sortPermanentWishHistory() {
  sortWishHistoryByName('Permanent Wish History');
}

/**
* Sort Weapon Event Wish History
*/
function sortWeaponEventWishHistory() {
  sortWishHistoryByName('Weapon Event Wish History');
}

/**
* Sort Novice Wish History
*/
function sortNoviceWishHistory() {
  sortWishHistoryByName('Novice Wish History');
}

function sortWishHistoryByName(sheetName) {
  var sheet = findWishHistoryByName(sheetName, null);
  if (sheet) {
    if (sheet.getLastColumn() > 6) {
      var range = sheet.getRange(2, 1, sheet.getMaxRows()-1, sheet.getLastColumn());
      range.sort([{column: 5, ascending: true}, {column: 2, ascending: true}, {column: 7, ascending: true}]);
    } else {
      var message = 'Invalid number of columns to sort, run "Refresh Formula" or "Update Items"';
      var title = 'Error';
      SpreadsheetApp.getActiveSpreadsheet().toast(message, title);
    }
  } else {
    var message = 'Unable to connect to source';
    var title = 'Error';
    SpreadsheetApp.getActiveSpreadsheet().toast(message, title);
  }
}

/**
* Update Item List
*/
function updateItemsList() {
  var sheetSource = SpreadsheetApp.openById(sheetSourceId);
  // Check source is available
  if (sheetSource) {
    // Avoid Exception: You can't remove all the sheets in a document.Details
    var placeHolderSheet = null;
    if (SpreadsheetApp.getActive().getSheets().length == 1) {
      placeHolderSheet = SpreadsheetApp.getActive().insertSheet();
    }

    // Remove sheets
    var listOfSheetsToRemove = ["Items","Pity Checker","Results","All Wish History"];

    var sheetAvailableSource = sheetSource.getSheetByName("Available");
    var availableRanges = sheetAvailableSource.getRange(2,1, sheetAvailableSource.getMaxRows()-1,1).getValues();
    availableRanges = String(availableRanges).split(",");
    
    // Go through the available sheet list
    for (var i = 0; i < availableRanges.length; i++) {
      listOfSheetsToRemove.push(availableRanges[i]);
    }
 
    var listOfSheetsToRemoveLength = listOfSheetsToRemove.length;

    for (var i = 0; i < listOfSheetsToRemoveLength; i++) {
      var sheetToRemove = SpreadsheetApp.getActive().getSheetByName(listOfSheetsToRemove[i]);
      if(sheetToRemove) {
        // If exist remove from spreadsheet
        SpreadsheetApp.getActiveSpreadsheet().deleteSheet(sheetToRemove);
      }
    }

    var listOfSheets = ["Character Event Wish History","Permanent Wish History","Weapon Event Wish History","Novice Wish History"];
    var listOfSheetsLength = listOfSheets.length;
    // Check if sheet exist
    for (var i = 0; i < listOfSheetsLength; i++) {
      findWishHistoryByName(listOfSheets[i], sheetSource);
    }

    
    // Add Language
    var sheetItemSource;
    var settingsSheet = SpreadsheetApp.getActive().getSheetByName("Settings");
    if (settingsSheet) {
      var languageFound = settingsSheet.getRange(2, 2).getValue();
      sheetItemSource = sheetSource.getSheetByName("Items"+"-"+languageFound);
    }
    if (sheetItemSource) {
      // Found language
    } else {
      // Default
      sheetItemSource = sheetSource.getSheetByName("Items");
    }
    sheetItemSource.copyTo(SpreadsheetApp.getActiveSpreadsheet()).setName('Items');

    // Refresh spreadsheet
    for (var i = 0; i < listOfSheetsLength; i++) {
      addFormulaByWishHistoryName(listOfSheets[i]);
      /*
      var sheetOld = SpreadsheetApp.getActive().getSheetByName(listOfSheets[i]);
      var sheetCopySource = sheetSource.getSheetByName(listOfSheets[i]);
      sheetCopySource.copyTo(SpreadsheetApp.getActiveSpreadsheet()).setName(listOfSheets[i] + " copy");
      var sheetNew = SpreadsheetApp.getActive().getSheetByName(listOfSheets[i] + " copy");
      var sourceRange = sheetNew.getRange("B:F");
      var targetRange = sheetOld.getRange("B:F");
      sourceRange.copyTo(targetRange);
      SpreadsheetApp.getActiveSpreadsheet().deleteSheet(sheetNew);*/
    }
    SpreadsheetApp.flush();
    Utilities.sleep(100);
    var sheetPityCheckerSource = sheetSource.getSheetByName('Pity Checker');
    sheetPityCheckerSource.copyTo(SpreadsheetApp.getActiveSpreadsheet()).setName('Pity Checker');
    var sheetAllWishHistorySource = sheetSource.getSheetByName('All Wish History');
    var sheetAllWishHistory = sheetAllWishHistorySource.copyTo(SpreadsheetApp.getActiveSpreadsheet());
    sheetAllWishHistory.setName('All Wish History');
    sheetAllWishHistory.hideSheet();
    
    
    // Add Language
    var sheetResultsSource;
    if (settingsSheet) {
      var languageFound = settingsSheet.getRange(2, 2).getValue();
      sheetResultsSource = sheetSource.getSheetByName("Results"+"-"+languageFound);
    }
    if (sheetResultsSource) {
      // Found language
    } else {
      // Default
      sheetResultsSource = sheetSource.getSheetByName("Results");
    }
    sheetResultsSource.copyTo(SpreadsheetApp.getActiveSpreadsheet()).setName('Results');

    // Put available sheet into current
    var skipRanges = sheetAvailableSource.getRange(2,2, sheetAvailableSource.getMaxRows()-1,1).getValues();
    skipRanges = String(skipRanges).split(",");
    var hiddenRanges = sheetAvailableSource.getRange(2,3, sheetAvailableSource.getMaxRows()-1,1).getValues();
    hiddenRanges = String(hiddenRanges).split(",");
    var settingsOptionRanges = sheetAvailableSource.getRange(2,4, sheetAvailableSource.getMaxRows()-1,1).getValues();
    settingsOptionRanges = String(settingsOptionRanges).split(",");

    for (var i = 0; i < availableRanges.length; i++) {
      var nameOfBanner = availableRanges[i];
      var isSkipString = skipRanges[i];
      var isHiddenString = hiddenRanges[i];
      var settingOptionString = settingsOptionRanges[i];

      var sheetAvailableSelectionSource = sheetSource.getSheetByName(nameOfBanner);
      var storedSheet;
      if (isSkipString == "YES") {
        // skip - disabled by source
      } else {
        if (sheetAvailableSelectionSource) {
          if (settingOptionString == "" || settingOptionString == 0) {
            //Enable without settings
            storedSheet = sheetAvailableSelectionSource.copyTo(SpreadsheetApp.getActiveSpreadsheet()).setName(nameOfBanner);
          } else {
            // Check current setting has row
            if (settingOptionString <= settingsSheet.getMaxRows()) {
              var checkEnabledRanges = settingsSheet.getRange(settingOptionString, 2).getValue();
              if (checkEnabledRanges == "YES") {
                storedSheet = sheetAvailableSelectionSource.copyTo(SpreadsheetApp.getActiveSpreadsheet()).setName(nameOfBanner);
              } else {
                storedSheet = null;
              }
            } else {
              // Sheet does not have this settings available
              storedSheet = null;
            }
          }
          if (storedSheet) {
            if (isHiddenString == "YES") {
              storedSheet.hideSheet();
            } else {
              storedSheet.showSheet();
            }
          }
        }
      }
    }

    // Remove placeholder if available
    if(placeHolderSheet) {
      // If exist remove from spreadsheet
      SpreadsheetApp.getActiveSpreadsheet().deleteSheet(placeHolderSheet);
    }
    // Bring Pity Checker into view
    var sheetPityChecker = SpreadsheetApp.getActive().getSheetByName('Pity Checker');
    SpreadsheetApp.getActive().setActiveSheet(sheetPityChecker);
  } else {
    var message = 'Unable to connect to source';
    var title = 'Error';
    SpreadsheetApp.getActiveSpreadsheet().toast(message, title);
  }
}

function clearAHK() {
  var autoHotkeySheet = SpreadsheetApp.getActive().getSheetByName("AutoHotkey");
  if (autoHotkeySheet) {
    // Clear Select Banner and date and time
    autoHotkeySheet.getRange(1, 2, 1, 2).clearContent();
    var deleteRows = autoHotkeySheet.getMaxRows()-6;
    if (deleteRows > 0) {
      autoHotkeySheet.deleteRows(6,deleteRows); 
    }
    // Clear all rows
    autoHotkeySheet.getRange(4, 1, autoHotkeySheet.getMaxRows()-3, autoHotkeySheet.getMaxColumns()).clearContent();
  } else {
    var message = 'Enable AutoHotkey in settings, and run "Update Items"';
    var title = 'Error AHK Disabled';
    SpreadsheetApp.getActiveSpreadsheet().toast(message, title);
  }
}

function clearOverrideAHK() {
  var autoHotkeySheet = SpreadsheetApp.getActive().getSheetByName("AutoHotkey");
  if (autoHotkeySheet) {
    var clearRows = autoHotkeySheet.getMaxRows()-3;
    if (clearRows > 0) {
      autoHotkeySheet.getRange(4, 2, clearRows, 3).clearContent();
    }
  } else {
    var message = 'Enable AutoHotkey in settings, and run "Update Items"';
    var title = 'Error AHK Disabled';
    SpreadsheetApp.getActiveSpreadsheet().toast(message, title);
  }
}

function convertAHK() {
  var autoHotkeySheet = SpreadsheetApp.getActive().getSheetByName("AutoHotkey");
  if (autoHotkeySheet) {
    clearOverrideAHK();
    var banner = autoHotkeySheet.getRange(1, 2).getValue();
    var iLastRow = null;
    var lastWishDateAndTimeString = null;
    var lastWishDateAndTime = null;
    
    var bannerSheet = SpreadsheetApp.getActive().getSheetByName(banner);
    if (bannerSheet) {
      var iLastRow = bannerSheet.getRange(2, 5, bannerSheet.getLastRow(), 1).getValues().filter(String).length;
      if (iLastRow && iLastRow != 0 ) {
        iLastRow++;
        lastWishDateAndTimeString = bannerSheet.getRange("E" + iLastRow).getValue();
        if (lastWishDateAndTimeString) {
          autoHotkeySheet.getRange(1,3).setValue("Last wish: "+lastWishDateAndTimeString);
          lastWishDateAndTimeString = lastWishDateAndTimeString.split(" ").join("T");
          lastWishDateAndTime = new Date(lastWishDateAndTimeString+".000Z");
        } else {
          autoHotkeySheet.getRange(1,3).setValue("No previous wishes");
        }
      } else {
        autoHotkeySheet.getRange(1,3).setValue("");
      }
      
      // Ensure all the cells are text format
      autoHotkeySheet.getRange(4,1, autoHotkeySheet.getMaxRows()-3,1).setNumberFormat("@");
      var autoHotkeyRanges = autoHotkeySheet.getRange(4,1, autoHotkeySheet.getMaxRows()-3,1).getValues();
      autoHotkeyRanges = String(autoHotkeyRanges).split(",");
      
      var itemType;
      var itemName;
      var dateAndTime;
      var dateAndTimeString;
      var dateAndTimeStringMod;
      var nextDateAndTime;
      var nextDateAndTimeString;
      var nextDateAndTimeStringMod;
      var overrideCounter = 10;
      var groupIndex;
      var nextGroupIndex;
      var autoHotkeyRangesLength = autoHotkeyRanges.length/3;
      var isMulti = false;
      for(var i = 0; i < autoHotkeyRangesLength; i++) {
        groupIndex = i * 3;
        itemType = autoHotkeyRanges[groupIndex];
        itemName = autoHotkeyRanges[groupIndex+1];
        dateAndTimeString = autoHotkeyRanges[groupIndex+2];
        if (dateAndTimeString) {
          dateAndTimeStringMod = dateAndTimeString.split(" ").join("T");
          dateAndTime = new Date(dateAndTimeStringMod+".000Z");
        } else {
          dateAndTime = null;
        }
        if (overrideCounter == 1) {
          // Check previous
          nextGroupIndex = (i - 1) * 3;
        } else {
          // Check next
          nextGroupIndex = (i + 1) * 3;
        }
        if (nextGroupIndex < autoHotkeyRanges.length) {
          nextDateAndTimeString = autoHotkeyRanges[nextGroupIndex+2];
          if (nextDateAndTimeString) {
            nextDateAndTimeStringMod = nextDateAndTimeString.split(" ").join("T");
            nextDateAndTime = new Date(nextDateAndTimeStringMod+".000Z");
            
            if (nextDateAndTime.getTime() == dateAndTime.getTime()) {
              if (isMulti) {
                //Resume counting
              } else {
                isMulti = true;
                overrideCounter = 10;
              }
            } else {
              isMulti = false;
              // autoHotkeySheet.getRange(2 +i,3).setValue("nothing");
            }
          } else {
            isMulti = false;
          }
        } else {
          //autoHotkeySheet.getRange(2 +i,3).setValue(nextDateAndTime + ":"+ dateAndTime);
        }
        if (isMulti) {
          autoHotkeySheet.getRange(4 +i,4).setValue(overrideCounter);
          overrideCounter--;
          if (overrideCounter == 0) {
            // Switch off multi
            isMulti = false;
          }
        } else {
          autoHotkeySheet.getRange(4 +i,4).setValue("");
        }
        if (itemType && itemName && dateAndTime) {
          autoHotkeySheet.getRange(4 + groupIndex,2,3,1).mergeVertically();
          if (dateAndTime <= lastWishDateAndTime) {
            autoHotkeySheet.getRange(4 + groupIndex,2).setFormula('=CONCATENATE(CHAR(128503)," STOPPED date and time is older than banner")');
            break;
          } else {
            autoHotkeySheet.getRange(4 + i,3).setValue(itemType+itemName+dateAndTimeString);
            autoHotkeySheet.getRange(4 + groupIndex,2).setFormula('=CONCATENATE(CHAR(128505)," Row: '+ (4 + i) + '")');
          }
        } else {
          autoHotkeySheet.getRange(4 + groupIndex,2,3,1).mergeVertically();
          autoHotkeySheet.getRange(4 + groupIndex,2).setFormula('=CONCATENATE(CHAR(128503)," ")');
        }
      }
    } else {
      autoHotkeySheet.getRange(1,3).setValue("Select a valid banner");
    }
  } else {
    var message = 'Enable AutoHotkey in settings, and run "Update Items"';
    var title = 'Error AHK Disabled';
    SpreadsheetApp.getActiveSpreadsheet().toast(message, title);
  }
}

function importAHK() {
  var autoHotkeySheet = SpreadsheetApp.getActive().getSheetByName("AutoHotkey");
  if (autoHotkeySheet) {
    var banner = autoHotkeySheet.getRange(1, 2).getValue();
    var bannerSheet = SpreadsheetApp.getActive().getSheetByName(banner);
    if (bannerSheet) {
      var iLastRow = bannerSheet.getRange(2, 1, bannerSheet.getLastRow(), 1).getValues().filter(String).length;
      if (iLastRow != 0) {
        iLastRow = iLastRow + 1;
      } else {
        iLastRow = 2;
      }

      var iAHKLastRow = autoHotkeySheet.getRange(4, 3, autoHotkeySheet.getLastRow(), 1).getValues().filter(String).length;
      if (iAHKLastRow != 0) {
        //iAHKLastRow++;

        // Used to prevent lag when applying numberformat, must be done before entering data
        var wishHistoryNumberOfColumn = bannerSheet.getLastColumn();
        // Reduce two column due to paste and override
        var wishHistoryNumberOfColumnWithFormulas = wishHistoryNumberOfColumn - 2;

        var lastRowWithoutTitle = bannerSheet.getMaxRows() + iAHKLastRow;
        for (var i = 3; i <= wishHistoryNumberOfColumn; i++) {
          // Apply formatting for cells
          var numberFormatCell = bannerSheet.getRange(2, i).getNumberFormat();
          bannerSheet.getRange(2, i, lastRowWithoutTitle, 1).setNumberFormat(numberFormatCell);
        }

        // pasteValue to banner
        var pasteValue = autoHotkeySheet.getRange(4,3,iAHKLastRow, 2).getValues();
        bannerSheet.getRange(iLastRow,1,iAHKLastRow, 2).setValues(pasteValue);
        //bannerSheet.insertRowAfter(1);
        clearOverrideAHK();
        
       // addFormulaByWishHistoryName(banner); // lags the sheet
        sortWishHistoryByName(banner);
        var message = 'Imported to '+banner;
        var title = 'Complete';
        SpreadsheetApp.getActiveSpreadsheet().toast(message, title);
      } else {
        var message = 'Nothing to import';
        var title = 'Error';
        SpreadsheetApp.getActiveSpreadsheet().toast(message, title);
      }
    } else {
      var message = 'Select banner and run convert again';
      var title = 'Error';
      SpreadsheetApp.getActiveSpreadsheet().toast(message, title);
    }
  } else {
    var message = 'Enable AutoHotkey in settings, and run "Update Items"';
    var title = 'Error AHK Disabled';
    SpreadsheetApp.getActiveSpreadsheet().toast(message, title);
  }
}
function generateAHK() {
  var autoHotkeyScriptSheet = SpreadsheetApp.getActive().getSheetByName("AutoHotkey-Script");
  if (autoHotkeyScriptSheet) {
    var autoHotkeyScriptRanges = autoHotkeyScriptSheet.getRange(7,2, autoHotkeyScriptSheet.getMaxRows()-6,1).getValues();
    autoHotkeyScriptRanges = String(autoHotkeyScriptRanges).split(",");
    
    var selectionString = autoHotkeyScriptSheet.getRange(4,1).getValue();
    if (selectionString) {
      var isFound = false;
      
      var scriptType;
      var SCRIPT_URL;
      
      for(var i = 0; i < autoHotkeyScriptRanges.length; i++) {
        scriptType = autoHotkeyScriptRanges[i];
        if (scriptType == selectionString) {
          SCRIPT_URL = autoHotkeyScriptSheet.getRange(7+i,3).getValue();
          isFound = true;
          break;
        }
      }
      if (isFound) {
        const richText = SpreadsheetApp.newRichTextValue()
          .setText(scriptType+" Link")
          .setLinkUrl([SCRIPT_URL])
          .build();
        autoHotkeyScriptSheet.getRange(7, 1).setRichTextValue(richText);
        var message = 'Script is ready';
        var title = 'Complete';
        SpreadsheetApp.getActiveSpreadsheet().toast(message, title);
      } else {
        var message = 'Script Type selection not valid';
        var title = 'Error';
        SpreadsheetApp.getActiveSpreadsheet().toast(message, title);
        autoHotkeyScriptSheet.getRange(7,1).setValue("ERROR");
      }
    } else {
      var message = 'Script Type selection is empty, check A4';
      var title = 'Error';
      SpreadsheetApp.getActiveSpreadsheet().toast(message, title);
      autoHotkeyScriptSheet.getRange(7,1).setValue("ERROR");
    }
  } else {
    var message = 'Enable AutoHotkey in settings, and run "Update Items"';
    var title = 'Error AHK Disabled';
    SpreadsheetApp.getActiveSpreadsheet().toast(message, title);
    autoHotkeyScriptSheet.getRange(7,1).setValue("ERROR");
  }
}