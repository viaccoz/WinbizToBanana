// @id = ch.viaccoz.winbiztobanana.import.winbiz.transactionsdbf
// @api = 1.0
// @pubdate = 2023-12-03
// @publisher = Thierry Viaccoz
// @description = Winbiz - Import transactions from DBF (*.dbf)
// @description.fr = Winbiz - Importer écritures comptables depuis DBF (*.dbf)
// @doctype = *
// @docproperties =
// @task = import.transactions
// @inputdatasource = openfiledialog
// @inputencoding = latin1
// @inputfilefilter = Winbiz files (*.dbf);;All files (*.*)
// @inputfilefilter.fr = Fichiers Winbiz (*.dbf);;Tous les fichiers (*.*)

function exec(inputText, options) {
	const inputTextData = inputText.substring(inputText.indexOf('\r') + 1);
	const inputTextDataByLine = inputTextData.replace(/.{415}/g, '$&\n');
	const inputArray = Banana.Converter.flvToArray(inputTextDataByLine, [
			12,  // Miscellaneous
			10,  // Document
			4,   // Miscellaneous
			8,   // Date
			20,  // Miscellaneous
			92,  // Description
			12,  // Account debit
			12,  // Account credit
			23,  // Amount
			222, // Miscellaneous
		]);
	const outputArray = [];
	const multiple = 'multiple'.toLowerCase();

	for (let i = 0; i < inputArray.length; i++) {
		const date = Banana.Converter.toInternalDateFormat(inputArray[i][3].trim(), 'yyyymmdd');
		const doc = inputArray[i][1].trim();
		const description = inputArray[i][5].trim();
		const accountDebit = inputArray[i][6].trim();
		const accountCredit = inputArray[i][7].trim();
		const amount = inputArray[i][8].trim();

		// Delete grouped transactions
		if (accountDebit.toLowerCase() === multiple || accountCredit.toLowerCase() === multiple) {
			continue;
		}

		outputArray.push({ Date: date, Doc: doc, Description: description, AccountDebit: accountDebit, AccountCredit: accountCredit, Amount: amount });
	}

	const outputTsv = Banana.Converter.objectArrayToCsv(['Date', 'Doc', 'Description', 'AccountDebit', 'AccountCredit', 'Amount'], outputArray, '\t');
	return outputTsv;
}
