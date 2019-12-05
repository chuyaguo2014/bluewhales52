/**
 * This is the main/entry point of the script. 
 * We take a spreadsheet containing a sheet of form responses and a sheet of student names, 
 * calculates for each student, how many other students have chosen him/her/them in their responses
 * and saves the report in the sheet called "Result"
 */
function processFormResponses() {
    try {
        var spreadsheet = getSpreadsheet("1d-ti3j4MfBt9MmhI_zRLob9wMokfCuIRs2HMcmuSkVY");
        var responseSheet = getSheet(spreadsheet, "Form Response");
        var resultSheet = getSheet(spreadsheet, "Result");

        var studentList = getStudentList(spreadsheet);

        var votingResults = {
            'lunch': calculateVotes(studentList, responseSheet, 'lunch'),
            'citizen': calculateVotes(studentList, responseSheet, 'citizen')
        }

        saveVotingResults(resultSheet, studentList, votingResults);
    }
    catch (e) {
        log("error occurred: ", e);
    }
    finally {
        log("end of script. Good bye!");
    }
}
/**
 * calculate how many votes each student has in the given category
 * @param  {array} studentList - an array of strings containing the student names
 * @param  {object} responseSheet - the sheet containing all the survey responses
 * @param  {string} category - the voting category - currently only 'lunch' and 'citizen' are supported
 * @returns {object} - a dictionary whose keys are student names and whose values are the number of votes each student got 
 */
function calculateVotes(studentList, responseSheet, category) {
    var targetColumn = '';
    switch (category) {
        case 'lunch':
            targetColumn = 'B';
            break;
        case 'citizen':
            targetColumn = 'C';
            break;
        default:
            throw 'invalid vote type detected: ' + category;
    }
    var votingResult = initializeResult(studentList);
    var numResponse = getNumberOfResponses(responseSheet);
    for (var i = 0; i < numResponse; i++) {
        var response = getIndividualResponse(responseSheet, targetColumn + (2 + i), 0);
        var votes = response.split(",");
        votes.forEach(function (vote) {
            var name = vote.trim();
            votingResult[name] = votingResult[name] + 1;
        });
    }
    return votingResult;
}
/**
 * saves the voting results to the given sheet
 * @param  {object} resultSheet - the sheet to store the results
 * @param  {array} studentList - the array of strings containing student names
 * @param  {object} votingResults - the dictionary where keys are voting categories and values are the voting results of that category
 * Right now, only `lunch` and `citizen` are the valid keys
 * 
 * Sample votingResults: 
 * {
 *  'lunch': {
 *      'Jane Doe': 123, 
 *      'John Doe': 456
 *   }, 
 *  'citizen': {
 *      'Jane Doe': 456,
 *      'John Doe': 123
 *   }
 * }
 */
function saveVotingResults(resultSheet, studentList, votingResults){ 
    if (isValideVotingResult(votingResults)){
        deleteExistingRows(resultSheet);
        resultSheet.appendRow(['Student Name', 'Lunch Votes', 'Exceptional Citizen Votes', 'Run at ' + new Date()]);
        for each(var student in studentList) {
            var lunchVote = votingResults['lunch'][student];
            var citizenVote = votingResults['citizen'][student];
            resultSheet.appendRow([student, lunchVote, citizenVote]);
        }
    }
}

/**
 * @param  {string} string - the string to describe what you are about to log
 * @param  {object} obj - the actual object to log
 */
function log(string, obj) {
    if (obj == undefined) {
        Logger.log(string);
    }
    else {
        Logger.log(string);
        Logger.log(obj);
    }
}

/**
 * @param  {string} spreadsheetID - the id of the spreadsheet
 * @returns the google spreadsheet 
 */
function getSpreadsheet(spreadsheetID) {
    return SpreadsheetApp.openById(spreadsheetID);
}

/**
 * @param  {object} spreadsheet - the google spreadsheet
 * @param  {string} sheetName - the name of the sheet within the spreadsheet
 */
function getSheet(spreadsheet, sheetName) {
    return spreadsheet.getSheetByName(sheetName);
}

/**
 * @param  {obj} spreadsheet - the google spreadsheet containing a sheet named "Names"; 
 * inside the sheet, the A1 cell has value "Full Name"; the subsequent cells in column A has the student names
 * @returns {array} an array of strings containing student names
 */
function getStudentList(spreadsheet) {
    var sheet = getSheet(spreadsheet, "Names");
    var values = sheet.getRange("A2:A").getValues(); // since A1 is literally "Full Name"
    var numberOfStudents = getNumberOfNonEmptyCells(values);
    var rawList = sheet.getRange("A2:A" + (numberOfStudents + 1)).getValues();
    return cleanArray(rawList);
}

/**
 * @param  {array} values - the input array
 * @returns the number of meaningful/non-empty elements in the array
 */
function getNumberOfNonEmptyCells(values) {
    var total = 0;
    for (var i = 0; i < values.length; i++) {
        if (values[i][0].length > 0) {
            total++;
        }
    }
    return total;
}

/**
 * Cleans the input and bring all the nested array elements out
 * @param  {array} rawList - an array returned by getValues() method, whose elements are also single-element arrays
 * Example: [['coffee'], ['cupcakes']]
 * @returns an array of the same order but without the nested elements;
 * using the example above the result will be ['coffee', 'cupcakes']
 */
function cleanArray(rawList) {
    var result = [];
    for (var i = 0; i < rawList.length; i++) {
        result.push(rawList[i][0]);
    }
    return result;
}

/**
 * deletes all existing rows in the given sheet
 * @param  {object} sheet - the sheet we are trying to clean up
 */
function deleteExistingRows(sheet) {
    if(sheet.getLastRow() > 0){
        sheet.deleteRows(1, sheet.getLastRow());
    }
}

/**
 * @param  {} sheet - the sheet (not the whole spreadsheet) containing the form responses
 * @returns {number} the number of responses that have been submitted
 * @todo parameterize the timestamp
 */
function getNumberOfResponses(sheet) {
    var values = sheet.getRange("B2:B").getValues(); // since B1 is the question itself
    return getNumberOfNonEmptyCells(values);
}

function getIndividualResponse(sheet, columnName, rowIndex) {
    return sheet.getRange(columnName).getValues()[0][rowIndex];
}

/**
 * Initializes an array to store all the student names and how many votes they each got (initially 0 for all)
 * @param  {Array} studentList - an array of strings of student names
 * @returns {object} - an object where student name (string) is the key and the value is 0
 */
function initializeResult(studentList) {
    var result = {};
    for (var i = 0; i < studentList.length; i++) {
        result[studentList[i]] = 0;
    }
    return result;
}

/**
 * validate the votingResults
 * @param  {object} votingResults - an object containing voting results of various categories
 * @returns {boolean} true if both lunch category and citizen category are well-defined. False otherwise
 */
function isValideVotingResult(votingResults){
    return votingResults !== undefined && votingResults['lunch'] !== undefined && votingResults['citizen'] !== undefined
}

