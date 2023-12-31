// @id = ch.viaccoz.winbiztobanana.command.autofill
// @api = 1.0
// @pubdate = 2023-12-31
// @publisher = Thierry Viaccoz
// @description = Autofill from the description
// @description.fr = Remplissage automatique depuis la description
// @doctype = *
// @docproperties =
// @task = app.command
// @timeout = 5000

const MAXIMUM_NUMBER_OF_ROWS = 20;

function removeEnd(input) {
	return input.substr(0, input.lastIndexOf(' ')).trim();
}

function exec() {
	// Check that current row is in transactions table
	const transactionsTable = Banana.document.table('Transactions');
	const currentTableName = Banana.document.cursor.tableName;
	if (currentTableName !== transactionsTable.name) {
		return null;
	}

	// Prepare start and stop
	let start = Banana.document.cursor.selectionTop;
	let stop = Banana.document.cursor.selectionBottom;
	if (stop - start + 1 > MAXIMUM_NUMBER_OF_ROWS) {
		start = Banana.document.cursor.rowNr;
		stop = Banana.document.cursor.rowNr;
	}

	// Iterate over all selected rows
	let rowChange = '';
	for (let i = start; i <= stop; i++) {
		let currentRowDescription = transactionsTable.value(i, 'Description');
		const similarRows = transactionsTable.findRows(function(rowObj, rowNr, table) {
			let rowObjDescription = rowObj.value('Description');
			do {
				if (rowObjDescription.startsWith(currentRowDescription) && rowNr !== i) {
					return true;
				}
				rowObjDescription = removeEnd(rowObjDescription);
				currentRowDescription = removeEnd(currentRowDescription);
			} while (rowObjDescription.length > 0 && currentRowDescription.length > 0);
			return false;
		});

		if (similarRows.length > 0) {
			let longestSimilarRowLength = -1;
			let longestSimilarRowIndex = -1;
			for (let j = 0; j < similarRows.length; j++) {
				const currentSimilarRowLength = similarRows[j].value('Description').length;
				if (currentSimilarRowLength > longestSimilarRowLength) {
					longestSimilarRowLength = currentSimilarRowLength;
					longestSimilarRowIndex = j;
				}
			}
			const similarRow = similarRows[longestSimilarRowIndex];
			rowChange += `{
				"fields": {
					"AccountDebit": "` + similarRow.value('AccountDebit') + `",
					"AccountCredit": "` + similarRow.value('AccountCredit') + `",
					"Amount": "` + similarRow.value('Amount') + `"
				},
				"operation": {
					"name": "modify",
					"sequence": "` + i + `"
				}
			},`;
		}
	}

	const strChange = `{
		"format": "documentChange",
		"error": "",
		"data": [ {
			"document": {
				"dataUnits": [ {
					"nameXml": "Transactions",
					"data": {
						"rowLists": [ {
							"rows": [` + rowChange.slice(0, -1) + `]
						} ]
					}
				} ]
			}
		} ]
	}`;
	const jsonChange = JSON.parse(strChange);
	return jsonChange;
}
