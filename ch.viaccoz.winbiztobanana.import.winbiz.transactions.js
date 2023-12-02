// @id = ch.viaccoz.winbiztobanana.import.winbiz.transactions
// @api = 1.0
// @pubdate = 2023-12-02
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
	const multiple = 'Multiple';

	for (const inputRow of inputArray) {
		const date = Banana.Converter.toInternalDateFormat(inputRow[4], 'dd.mm.yyyy');
		const doc = inputRow[2];
		const description = inputRow[6];
		const accountDebit = inputRow[7];
		const accountCredit = inputRow[8];
		const amount = inputRow[9];

		// Delete grouped transactions
		if (accountDebit === multiple || accountCredit === multiple) {
			continue;
		}

		outputArray.push({ Date: date, Doc: doc, Description: description, AccountDebit: accountDebit, AccountCredit: accountCredit, Amount: amount });
	}

	const outputTsv = Banana.Converter.objectArrayToCsv(['Date', 'Doc', 'Description', 'AccountDebit', 'AccountCredit', 'Amount'], outputArray, '\t');
	return outputTsv;
}
