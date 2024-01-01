// @id = ch.viaccoz.winbiztobanana.command.autofill
// @api = 1.0
// @pubdate = 2024-01-01
// @publisher = Thierry Viaccoz
// @description = Autofill from the description
// @description.fr = Remplissage automatique depuis la description
// @doctype = *
// @docproperties =
// @task = app.command
// @timeout = 5000

const MAXIMUM_NUMBER_OF_ROWS_SELECTABLE = 20;
const CHARACTERS_CLASS_FOR_REPLACEMENT = 'A-Za-z0-9\\u00C0-\\u024F\\u1E00-\\u1EFF';
const REGULAR_EXPRESSION_FOR_REPLACEMENT = new RegExp('[^' + CHARACTERS_CLASS_FOR_REPLACEMENT + ']*[' + CHARACTERS_CLASS_FOR_REPLACEMENT + ']+[^' + CHARACTERS_CLASS_FOR_REPLACEMENT + ']*$');

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
	if (stop - start + 1 > MAXIMUM_NUMBER_OF_ROWS_SELECTABLE) {
		start = Banana.document.cursor.rowNr;
		stop = Banana.document.cursor.rowNr;
	}

	// Iterate over all selected rows
	let rowChange = '';
	for (let i = start; i <= stop; i++) {
		let description = transactionsTable.value(i, 'Description');
		const descriptionSubstrings = [];
		while (description.length > 0) {
			descriptionSubstrings.push(description);
			description = description.replace(REGULAR_EXPRESSION_FOR_REPLACEMENT, '');
		}
		const similarRows = transactionsTable.findRows(function(rowObj, rowNr, table) {
			const rowObjDescription = rowObj.value('Description');
			for (const descriptionSubstring of descriptionSubstrings) {
				if (rowObjDescription.startsWith(descriptionSubstring) && rowNr !== i) {
					return true;
				}
			}
			return false;
		});

		if (similarRows.length > 0) {
			// Choose similar row with longest matching length
			const similarRow = similarRows.reduce(function (a, b) {
				return a.value('Description').length > b.value('Description').length ? a : b;
			});

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
