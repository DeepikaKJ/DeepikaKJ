const sheetName = 'contact';
const scriptProp = PropertiesService.getScriptProperties();

function intialSetup() {
    const activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    scriptProp.setProperty('key', activeSpreadsheet.getId());
}

function doPost(e) {
    const lock = LockService.getScriptLock();
    lock.tryLock(10000);

    try {
        const doc = SpreadsheetApp.openById(scriptProp.getProperty('key'));
        const sheet = doc.getSheetByName(sheetName);

        const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
        const nextRow = sheet.getLastRow() + 1;

        const newRow = headers.map(function (header) {
            return header === 'Date' ? new Date() : e.parameter[header];
        });

        sheet.getRange(nextRow, 1, 1, newRow.length).setValues([newRow]);

        // Send email notification
        const recipient = 'deepikajayanna16@gmail.com';
        const subject = 'New Contact Response Received';
        const body = `
A new response has been added to the Google Sheet "${sheetName}":

----------------------------------------
${headers
    .map((header, i) => `${header}: ${newRow[i]}`)
    .join('\n')}
----------------------------------------

Thank you,
Anbu's Automation Mail
`;

        // Send the email
        GmailApp.sendEmail(recipient, subject, body);

        return ContentService
            .createTextOutput(JSON.stringify({ result: 'success', row: nextRow }))
            .setMimeType(ContentService.MimeType.JSON);

    } catch (e) {
        return ContentService
            .createTextOutput(JSON.stringify({ result: 'error', error: e }))
            .setMimeType(ContentService.MimeType.JSON);

    } finally {
        lock.releaseLock();
    }
}