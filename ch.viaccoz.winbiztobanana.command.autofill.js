// @id = ch.viaccoz.winbiztobanana.command.autofill
// @api = 1.0
// @pubdate = 2023-12-31
// @publisher = Thierry Viaccoz
// @description = Autofill from the description
// @description.fr = Remplissage automatique depuis la description
// @doctype = *
// @docproperties =
// @task = app.command

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
	if (start === 0 && stop > Math.pow(2, 31) - 2) {
		start = Banana.document.cursor.rowNr;
		stop = Banana.document.cursor.rowNr;
	}

	// Iterate over all selected rows
	let rowChange = '';
	for (let i = start; i <= stop; i++) {
		const currentRowDescription = transactionsTable.value(i, 'Description');
		const similarRows = transactionsTable.findRows(function(rowObj, rowNr, table) {
			return rowObj.value('Description').includes(currentRowDescription);
		});

		if (similarRows.length > 0) {
			const firstSimilarRow = similarRows[0];
			rowChange += `{
				"fields": {
					"Date": "` + firstSimilarRow.value('Date') + `",
					"AccountDebit": "` + firstSimilarRow.value('AccountDebit') + `",
					"AccountCredit": "` + firstSimilarRow.value('AccountCredit') + `",
					"Amount": "` + firstSimilarRow.value('Amount') + `"
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
