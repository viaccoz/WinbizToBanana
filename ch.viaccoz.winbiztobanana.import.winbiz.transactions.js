// @id = ch.viaccoz.winbiztobanana.import.winbiz.transactions
// @api = 1.0
// @pubdate = 2023-12-03
// @publisher = Thierry Viaccoz
// @description = Winbiz - Import transactions (*.csv)
// @description.fr = Winbiz - Importer écritures comptables (*.csv)
// @doctype = *
// @docproperties =
// @task = import.transactions
// @inputdatasource = openfiledialog
// @inputencoding = latin1
// @inputfilefilter = Text files (*.txt *.csv);;All files (*.*)
// @inputfilefilter.fr = Fichiers texte (*.txt *.csv);;Tous les fichiers (*.*)

function exec(inputText) {
	const inputArray = Banana.Converter.csvToArray(inputText, ';', '"');
	const outputArray = [];
	const multiple = 'multiple'.toLowerCase();

	for (const inputRow of inputArray) {
		const date = Banana.Converter.toInternalDateFormat(inputRow[4].trim(), 'dd.mm.yyyy');
		const doc = inputRow[2].trim();
		const description = inputRow[6].trim();
		const accountDebit = inputRow[7].trim();
		const accountCredit = inputRow[8].trim();
		const amount = inputRow[9].trim();

		// Delete grouped transactions
		if (accountDebit.toLowerCase() === multiple || accountCredit.toLowerCase() === multiple) {
			continue;
		}

		outputArray.push({ Date: date, Doc: doc, Description: description, AccountDebit: accountDebit, AccountCredit: accountCredit, Amount: amount });
	}

	const outputTsv = Banana.Converter.objectArrayToCsv(['Date', 'Doc', 'Description', 'AccountDebit', 'AccountCredit', 'Amount'], outputArray, '\t');
	return outputTsv;
}
