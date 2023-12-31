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

	// Start change
	let strChange = `{
		"format": "documentChange",
		"error": "",
		"data": [ {
			"document": {
				"dataUnits": [ {
					"nameXml": "Transactions",
					"data": {
						"rowLists": [ {
							"rows": [`;

	// Prepare start and stop
	let start = Banana.document.cursor.selectionTop;
	let stop = Banana.document.cursor.selectionBottom;
	if (start === 0 && stop > Math.pow(2, 31) - 2) {
		start = Banana.document.cursor.rowNr;
		stop = Banana.document.cursor.rowNr;
	}

	// Iterate over all selected rows
	let rowChanged = false;
	for (let i = start; i <= stop; i++) {
		const currentRowDescription = transactionsTable.value(i, 'Description');
		const similarRow = transactionsTable.findRowByValue('Description', currentRowDescription);
		if (similarRow && similarRow.rowNr !== i) {
			Banana.application.addMessage(similarRow.value('Amount'));
			rowChanged = true;
			strChange += `{
				"fields": {
					"Date": "` + similarRow.value('Date') + `",
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

	// Remove last comma if needed
	if (rowChanged) {
		strChange = strChange.slice(0, -1);
	}

	// Finish change
	strChange += `			]
						} ]
					}
				} ]
			}
		} ]
	}`;
	const jsonChange = JSON.parse(strChange);
	return jsonChange;
}
