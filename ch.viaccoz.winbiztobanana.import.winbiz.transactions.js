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

const fields = new Map([
		['MULTIPLE'      ,{id:  0, length:   2}],
		['ECR_NUMERO'    ,{id:  1, length:  10}],
		['NUMERO'        ,{id:  2, length:  10}],
		['ECR_NOLINE'    ,{id:  3, length:   4}],
		['DATE'          ,{id:  4, length:   8}],
		['PIECE'         ,{id:  5, length:  20}],
		['LIBELLE'       ,{id:  6, length: 100}],
		['CPT_DEBIT'     ,{id:  7, length:  12}],
		['CPT_CREDIT'    ,{id:  8, length:  12}],
		['MONTANT'       ,{id:  9, length:  15}],
		['JOURNAL'       ,{id: 10, length:   1}],
		['ECR_MONNAI'    ,{id: 11, length:  10}],
		['ECR_COURS'     ,{id: 12, length:  16}],
		['ECR_MONMNT'    ,{id: 13, length:  15}],
		['ECR_MONQTE'    ,{id: 14, length:   6}],
		['MISCELLANEOUS' ,{id: 15, length: 174}],
]);

function getValue(array, fieldName) {
	return array[fields.get(fieldName).id].trim();
}

function exec(inputText) {
	let dateFormat = '';
	let inputArray = '';
	const outputArray = [];
	const multiple = 'multiple'.toLowerCase();

	const fieldLengths = [];
	for (const field of fields.values()) {
		fieldLengths.push(field.length);
	}

	if (inputText.startsWith(String.fromCharCode(3) + String.fromCharCode(23))) {
		// Winbiz database files (*.dbf)
		dateFormat = 'yyyymmdd';
		const inputTextData = inputText.substring(inputText.indexOf('\r') + 1);
		const inputTextDataByLine = inputTextData.replace(/.{415}/g, '$&\n');
		inputArray = Banana.Converter.flvToArray(inputTextDataByLine, fieldLengths);
	} else {
		// Comma separated files (*.csv)
		dateFormat = 'dd.mm.yyyy';
		inputArray = Banana.Converter.csvToArray(inputText, ';', '"');
	}

	for (const inputRow of inputArray) {
		const date = Banana.Converter.toInternalDateFormat(getValue(inputRow, 'DATE'), dateFormat);
		const doc =           getValue(inputRow, 'NUMERO');
		const description =   getValue(inputRow, 'LIBELLE');
		const accountDebit =  getValue(inputRow, 'CPT_DEBIT');
		const accountCredit = getValue(inputRow, 'CPT_CREDIT');
		const amount =        getValue(inputRow, 'MONTANT');

		// Delete grouped transactions
		if (accountDebit.toLowerCase() === multiple || accountCredit.toLowerCase() === multiple) {
			continue;
		}

		outputArray.push({ Date: date, Doc: doc, Description: description, AccountDebit: accountDebit, AccountCredit: accountCredit, Amount: amount });
	}

	const outputTsv = Banana.Converter.objectArrayToCsv(['Date', 'Doc', 'Description', 'AccountDebit', 'AccountCredit', 'Amount'], outputArray, '\t');
	return outputTsv;
}
