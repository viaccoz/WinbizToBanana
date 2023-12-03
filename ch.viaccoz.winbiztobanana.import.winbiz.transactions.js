// @id = ch.viaccoz.winbiztobanana.import.winbiz.transactions
// @api = 1.0
// @pubdate = 2023-12-03
// @publisher = Thierry Viaccoz
// @description = Winbiz - Import transactions (*.csv *.dbf)
// @description.fr = Winbiz - Importer écritures comptables (*.csv *.dbf)
// @doctype = *
// @docproperties =
// @task = import.transactions
// @inputdatasource = openfiledialog
// @inputencoding = latin1
// @inputfilefilter = Comma separated files (*.csv);;Winbiz database files (*.dbf);;All files (*.*)
// @inputfilefilter.fr = Fichiers délimités par des virgules (*.csv);;Fichiers base de données Winbiz (*.dbf);;Tous les fichiers (*.*)

function exec(inputText) {
	let dateFormat = '';
	let inputArray = '';
	const outputArray = [];
	const multiple = 'multiple'.toLowerCase();

	if (inputText.startsWith(String.fromCharCode(3))) {
		dateFormat = 'yyyymmdd';
		const inputTextData = inputText.substring(inputText.indexOf('\r') + 1);
		const inputTextDataByLine = inputTextData.replace(/.{415}/g, '$&\n');
		inputArray = Banana.Converter.flvToArray(inputTextDataByLine, [
				2,   // MULTIPLE
				10,  // ECR_NUMERO
				10,  // NUMÉRO     -> Doc
				4,   // ECR_NOLINE
				8,   // DATE       -> Date
				20,  // PIÈCE
				100, // LIBELLÉ    -> Description
				12,  // CPT_DÉBIT  -> AccountDebit
				12,  // CPT_CRÉDIT -> AccountCredit
				15,  // MONTANT    -> Amount
				1,   // JOURNAL
				10,  // ECR_MONNAI
				16,  // ECR_COURS
				15,  // ECR_MONMNT
				6,   // ECR_MONQTE
				174
			]);
	} else {
		dateFormat = 'dd.mm.yyyy';
		inputArray = Banana.Converter.csvToArray(inputText, ';', '"');
	}

	for (const inputRow of inputArray) {
		const date = Banana.Converter.toInternalDateFormat(inputRow[4].trim(), dateFormat);
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
