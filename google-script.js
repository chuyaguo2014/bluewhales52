function processFormResponses() {
    try {
        var spreadsheet = getSpreadsheet("1d-ti3j4MfBt9MmhI_zRLob9wMokfCuIRs2HMcmuSkVY");
        var studentList = getStudentList(spreadsheet);
        var responseSheet = getSheet(spreadsheet, "Form Response");
        var numResponse = getNumberOfResponse(responseSheet);

        var lunchDateResult = initializeResult(studentList);

        for (var i = 0; i < numResponse; i++) {
            var response = getIndividualResponse(responseSheet, "B" + (2 + i), 0);
            var votes = response.split(",");
            votes.forEach(function (vote) {
                var name = vote.trim();
                var old = lunchDateResult[name];
                lunchDateResult[name] = lunchDateResult[name] + 1;
            });
        }
        Logger.log("this is my result: \n\n");
        Logger.log(lunchDateResult);
    }
    catch (e) {
        Logger.log("Error occurred!");
        Logger.log(e);
    }
    finally {
        Logger.log("End of script. Bye!");
    }
}

function getSpreadsheet(spreadsheetID) {
    return SpreadsheetApp.openById(spreadsheetID);
}

function getSheet(spreadsheet, sheetName) {
    return spreadsheet.getSheetByName(sheetName);
}

function getStudentList(spreadsheet) {
    var sheet = getSheet(spreadsheet, "Names");
    var values = sheet.getRange("A2:A").getValues(); // since A1 is literally "Full Name"
    var numberOfStudents = getNumberOfNonEmptyCells(values);
    var rawList = sheet.getRange("A2:A" + (numberOfStudents + 1)).getValues();
    return cleanArray(rawList);
}

function getNumberOfNonEmptyCells(values) {
    var total = 0;
    for (var i = 0; i < values.length; i++) {
        if (values[i][0].length > 0) {
            total++;
        }
    }
    return total;
}

function cleanArray(rawList) {
    var result = [];
    for (var i = 0; i < rawList.length; i++) {
        result.push(rawList[i][0]);
    }
    return result;
}

function getNumberOfResponse(sheet) {
    var values = sheet.getRange("B2:B").getValues(); // since B1 is the question itself
    return getNumberOfNonEmptyCells(values);
}

function getIndividualResponse(sheet, columnName, rowIndex) {
    return sheet.getRange(columnName).getValues()[0][rowIndex];
}

function initializeResult(studentList) {
    var result = {};
    for (var i = 0; i < studentList.length; i++) {
        result[studentList[i]] = 0;
    }
    return result;
}

