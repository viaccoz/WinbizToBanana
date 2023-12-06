// @id = ch.viaccoz.winbiztobanana.import.winbiz.accounts
// @api = 1.0
// @pubdate = 2023-12-06
// @publisher = Thierry Viaccoz
// @description = Winbiz - Import accounts (*.csv plan.dbf)
// @description.fr = Winbiz - Importer plan comptable (*.csv plan.dbf)
// @doctype = *
// @docproperties =
// @task = import.accounts
// @inputdatasource = openfiledialog
// @inputencoding = latin1
// @inputfilefilter = Comma separated files (*.csv);;Winbiz database files (plan.dbf);;All files (*.*)
// @inputfilefilter.fr = Fichiers délimités par des virgules (*.csv);;Fichiers base de données Winbiz (plan.dbf);;Tous les fichiers (*.*)

const MAXIMUM_GROUPING_ACCOUNT_LEVEL = 3;
const FIELDS = new Map([
		['CLASSE'        ,{id: 0, length:   4}],
		['NUMERO'        ,{id: 1, length:  12}],
		['COMPTE'        ,{id: 2, length: 118}],
		['MISCELLANEOUS' ,{id: 3, length: 600}],
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

function arrayToSortedAccountsArray(array) {
	const accountsArray = [];
	for (const row of array) {
		// Account sorting number corresponds to the account number on 12 characters
		const accountNumber = getValue(row, 'NUMERO');
		const sortingNumber = accountNumber + ('0'.repeat(FIELDS.get('NUMERO').length - accountNumber.length));

		// Fill structure
		accountsArray.push({
			class:         getValue(row, 'CLASSE'),
			number:        accountNumber,
			description:   getValue(row, 'COMPTE'),
			sortingNumber: sortingNumber,
			level:         accountNumber.length,
		});
	}

	// Sort it according to the sorting number
	return accountsArray.sort((a, b) => (10 * a.sortingNumber + a.level) - (10 * b.sortingNumber + b.level))
}

function getEmptyLine() {
	return { Section: '*'.repeat(MAXIMUM_GROUPING_ACCOUNT_LEVEL + 1), Description: '!_Delete_me_' + Math.random() };
}

function exec(inputText) {
	const inputArray = parseWinbizInput(inputText).array;
	const outputArray = [];
	const activeGroups = {};
	let emptyLineToAddForPreviousGroup = false;

	const sortedAccountsArray = arrayToSortedAccountsArray(inputArray);
	for (const account of sortedAccountsArray) {
		const currentLevel = account.number.toString().length;

		let group = '';
		for (let i = currentLevel - 1; i > 0; i--) {
			if (activeGroups.hasOwnProperty(i)) {
				group = activeGroups[i].Group;
				break
			}
		}

		if (currentLevel <= MAXIMUM_GROUPING_ACCOUNT_LEVEL) {
			// Grouping account
			if (emptyLineToAddForPreviousGroup) {
				outputArray.push(getEmptyLine());
			}

			// Close previous groups
			for (let i = MAXIMUM_GROUPING_ACCOUNT_LEVEL; i >= currentLevel; i--) {
				if (activeGroups.hasOwnProperty(i)) {
					outputArray.push(activeGroups[i]);
					outputArray.push(getEmptyLine());
					delete activeGroups[i];
				}
			}

			// Write group heading now
			if (currentLevel === 1) {
				outputArray.push({ Section: account.number, Description: account.description });
			} else {
				outputArray.push({ Section: '*'.repeat(currentLevel), Description: account.description });
			}
			emptyLineToAddForPreviousGroup = true;

			// Store group total for later
			activeGroups[currentLevel] = { Section: '*'.repeat(currentLevel), Group: account.number, Description: 'Total ' + account.description, Gr: group };
		} else {
			// Standard account
			outputArray.push({ Account: account.number, Description: account.description, BClass: account.class, Gr: group });
			emptyLineToAddForPreviousGroup = false;
		}
	}

	const outputTsv = Banana.Converter.objectArrayToCsv(['Section', 'Group', 'Account', 'Description', 'BClass', 'Gr'], outputArray, '\t');
	return outputTsv;
}
