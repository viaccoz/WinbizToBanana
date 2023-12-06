// @id = ch.viaccoz.winbiztobanana.import.winbiz.transactions
// @api = 1.0
// @pubdate = 2023-12-06
// @publisher = Thierry Viaccoz
// @description = Winbiz - Import transactions (*.csv ecriture.dbf)
// @description.fr = Winbiz - Importer écritures comptables (*.csv ecriture.dbf)
// @doctype = *
// @docproperties =
// @task = import.transactions
// @inputdatasource = openfiledialog
// @inputencoding = latin1
// @inputfilefilter = Comma separated files (*.csv);;Winbiz database files (ecriture.dbf);;All files (*.*)
// @inputfilefilter.fr = Fichiers délimités par des virgules (*.csv);;Fichiers base de données Winbiz (ecriture.dbf);;Tous les fichiers (*.*)

const MULTIPLE = 'multiple'.toLowerCase();
const FIELDS = new Map([
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

function parseWinbizInput(input) {
	if (input.startsWith(String.fromCharCode(3) + String.fromCharCode(23))) {
		// Winbiz database (*.dbf) according to file marker

		// Only keep data after the start marker (\r) and before the end marker (0x1A)
		const beginMarker = input.indexOf('\r');
		const endMarker = input.indexOf(String.fromCharCode(26), beginMarker);
		const inputData = input.substring(beginMarker + 1, endMarker);

		// Split in rows
		let rowLength = 0;
		FIELDS.forEach((value, key) => rowLength += value.length);
		const inputDataByRow = inputData.replace(new RegExp(`.{${rowLength}}`, 'g'), '$&\n');

		// Return array
		const fieldLengths = Array.from(FIELDS.values()).map(value => value.length);
		return { array: Banana.Converter.flvToArray(inputDataByRow, fieldLengths), isWinbizDatabase: true };
	} else {
		// Winbiz comma separated file (*.csv)
		return { array: Banana.Converter.csvToArray(input, ';', '"'), isWinbizDatabase: false };
	}
}

function getValue(array, fieldName) {
	return array[FIELDS.get(fieldName).id].trim();
}

function exec(inputText) {
	const parsedWinbizInput = parseWinbizInput(inputText);
	const inputArray = parsedWinbizInput.array;
	const outputArray = [];
	let dateFormat = parsedWinbizInput.isWinbizDatabase ? 'yyyymmdd' : 'dd.mm.yyyy';

	for (const inputRow of inputArray) {
		const date = Banana.Converter.toInternalDateFormat(getValue(inputRow, 'DATE'), dateFormat);
		const doc =           getValue(inputRow, 'NUMERO');
		const description =   getValue(inputRow, 'LIBELLE');
		const accountDebit =  getValue(inputRow, 'CPT_DEBIT');
		const accountCredit = getValue(inputRow, 'CPT_CREDIT');
		const amount =        getValue(inputRow, 'MONTANT');

		// Delete grouped transactions
		if (accountDebit.toLowerCase() === MULTIPLE || accountCredit.toLowerCase() === MULTIPLE) {
			continue;
		}

		outputArray.push({ Date: date, Doc: doc, Description: description, AccountDebit: accountDebit, AccountCredit: accountCredit, Amount: amount });
	}

	const outputTsv = Banana.Converter.objectArrayToCsv(['Date', 'Doc', 'Description', 'AccountDebit', 'AccountCredit', 'Amount'], outputArray, '\t');
	return outputTsv;
}
