//parts of the code are taken from http://stackoverflow.com/questions/19684318/how-to-customize-bootbox-js-prompt-options
//depending on the mode - different download
// mode 1 -> downloadNetwork
// mode 2 -> downloadSamples
// mode 3 -> downloadPNG
var specifyDownloadName = function(mode, ext, samples) {
	var filename = "";
	bootbox.dialog({
	  message: "<input type='text' id='filename' class='alert-input'></input> " + ext,
	  title: "Specify file name:",
	  value: "bayesnet",
	  buttons: {
	    main: {
	      label: "Download",
	      className: "btn-primary btn-bayes",
	      callback: function() {
	        filename = $('#filename').val();
	        if(mode === 1) {
		        downloadNetwork(filename);
	        }
	        else if(mode === 2) {
	        	downloadSamples(filename, samples);
	        }
	        else if(mode === 3) {
	        	downloadPNG(filename);
	        }
					else if(mode === 4) {
						downloadSamplesRaw(filename, samples);
					}
			else if(mode === 5) {
				downloadDocx(filename);
			}
			else if(mode === 6) {
				appendDocx(filename);
			}
	      }
	    },
	    cancel: {
	    	label: "Cancel",
	    	className: "btn-bayes",
	    }
	  }
	});
};

var checkUploadFileExtension = function(filetype, extension) {
	return filetype == extension;
}

var downloadNetwork = function(filename){
	var compactEdges = []
	edges.forEach(function(e) {
		var compactEdge = {source: e.source.id, target:e.target.id};
		compactEdges.push(compactEdge);
	})
	var netObject = JSON.stringify({
		"nodes":nodes,
		"edges":edges
	}, null, 2);

	var blob = new Blob([netObject], {type:"text/plain;charset=utf-8"});

	// console.log(filename);
	if (!isEmptyString(filename)) {
		filename = filename + ".json";
		saveAs(blob, filename);
	}
	else {
		bootbox.dialog({
		  message: "Specify a name for the file.",
		  buttons: {
		    main: {
		      label: "OK",
		      className: "btn-bayes-short",
		    },
		  }
		});
	}
}

function svgToPng(svgElement, callback) {
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = function () {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const pngDataUrl = canvas.toDataURL('image/png');
        callback(pngDataUrl);
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
}

function createDocxMiMirTable(detectionScoreDict, visibilityScoreDict) {
	const keys = Object.keys(detectionScoreDict);
	const {Paragraph, Table, TableCell, TableRow, WidthType} = docx;
	const rows = keys.map(key => {
		return new TableRow({
			children: [
				new TableCell({
					children: [new Paragraph(key)],
				}),
				new TableCell({
					children: [new Paragraph(detectionScoreDict[key].toString())],
				}),
				new TableCell({
					children: [new Paragraph(visibilityScoreDict[key].toString())],
				}),
			],
		});
	});

	const table = new Table({
		width: { size: 400, type: WidthType.PERCENTAGE },
		rows: [
			new TableRow({
				children: [
					new TableCell({
						children: [new Paragraph('Node')],
					}),
					new TableCell({
						children: [new Paragraph('Detection Score')],
					}),
					new TableCell({
						children: [new Paragraph('Visibility Score')],
					}),
				],
			}),
			...rows,
		],
	});
	return table
}

function samplingTable(samplingDict) {
	const keys = Object.keys(samplingDict);
	const {Paragraph, Table, TableCell, TableRow, WidthType} = docx;
	const rows = keys.map(key => {
		return new TableRow({
			children: [
				new TableCell({
					children: [new Paragraph(key)],
				}),
				new TableCell({
					children: [new Paragraph(samplingDict[key].toString())],
				}),
			],
		});
	});

	const table = new Table({
		width: { size: 200, type: WidthType.PERCENTAGE },
		rows: [
			new TableRow({
				children: [
					new TableCell({
						children: [new Paragraph('Node')],
					}),
					new TableCell({
						children: [new Paragraph('Percentage of Samples Score')],
					}),
				]
			}),
			...rows,
		],
	});
	return table
}
function extractProbability(str) {
	const match = str.match(/(\d+(\.\d+)?)$/);
    return match ? match[1] : '';
}
function extractTblValues(obj) {
    const values = [];
    for (const key in obj) {
        if (typeof obj[key] === 'object') {
            const nestedValues = extractTblValues(obj[key]);
            nestedValues.forEach(value => {
                values.push(`${key}${value}`);
            });
        } else {
            values.push(`${key}${obj[key]}`);
        }
    }
    return values;
}

function startRungSamplingTable(title,tbl) {
	const { Paragraph, Table, TableCell, TableRow, WidthType } = docx;
    const yesMatch = tbl[0].match(/yes(\d+\.?\d*)/);  // Assuming the 'yes' value is always first
    const noMatch = tbl[1].match(/no(\d+\.?\d*)/);    // Assuming the 'no' value is always second
    const yesProb = yesMatch ? yesMatch[1] : '';
    const noProb = noMatch ? noMatch[1] : '';

	const table = new Table({
		width: { size: 50, type: WidthType.PERCENTAGE },
		rows: [
			new TableRow({
				children: [
					new TableCell({
						children: [new Paragraph('P('+title+'=yes)')],
					}),
					new TableCell({
						children: [new Paragraph('P('+title+'=no)')],
					}),
                ],
            }),
            new TableRow({
                children: [
                    new TableCell({
                        children: [new Paragraph(yesProb)],
                    }),
                    new TableCell({
                        children: [new Paragraph(noProb)],
                    }),
                ],
            }),
        ],
    });
    return table;
}

function rungSamplingTable(title,previousTitle,tbl) {
	const { Paragraph, Table, TableCell, TableRow, WidthType } = docx;

	const table = new Table({
		width: { size: 50, type: WidthType.PERCENTAGE },
		rows: [
			new TableRow({
				children: [
					new TableCell({
						children: [new Paragraph(previousTitle)],
					}),
					new TableCell({
						children: [new Paragraph('P('+title+'=yes|'+previousTitle+')')],
					}),
					new TableCell({
						children: [new Paragraph('P('+title+'=no|'+previousTitle+')')],
					}),
                ],
            }),
            new TableRow({
                children: [
                    new TableCell({
                        children: [new Paragraph('yes')],
                    }),
                    new TableCell({
                        children: [new Paragraph(extractProbability(tbl[0]))],
                    }),
					new TableCell({
                        children: [new Paragraph(extractProbability(tbl[1]))],
                    }),
                ],
            }),
			new TableRow({
                children: [
                    new TableCell({
                        children: [new Paragraph('no')],
                    }),
                    new TableCell({
                        children: [new Paragraph(extractProbability(tbl[2]))],
                    }),
					new TableCell({
                        children: [new Paragraph(extractProbability(tbl[3]))],
                    }),
                ],
            }),
        ],
    });
    return table;
}

function downloadDocx(filename) {
	const { Document, Packer, Paragraph, Table, TableCell, TableRow, TextRun } = docx;
	const docInitial = new Document({
		sections: [
			{
				properties: {},
				children: [
					new docx.Paragraph({
                        text: uploadFileMimir + " Report",
                        style: "Heading1"
                    }),
					new docx.Paragraph({
                        text: "MiMir Scoring:",
                        style: "Heading2"
                    }),
					new docx.Paragraph({
                        children: [createDocxMiMirTable(detectionScoreDict, visibilityScoreDict)],
                    }),	
				],
			},
		],
	});
	
	var filenameEvent = new CustomEvent("filenameUploaded", { detail: { filename, docInitial } });

	// console.log(JSON.stringify(docInitial.documentWrapper.document.body.sections, null, 2));
	
	document.dispatchEvent(filenameEvent);
	firstAppendDoc(filename)

};
function fetchAndCreateParagraph(techniqueId) {
    return new Promise((resolve, reject) => {
        d3.csv('../files/mitigation/mitigation_strategies.csv', function(data) {
            const filteredData = data.filter(row => row.attack_technique_id === techniqueId);
            resolve(filteredData); 
        });
    });
}
function firstAppendDoc(filename) {
    svgContent = svg[0][0];
	const { Document, Packer, Paragraph, Table, TableCell, TableRow } = docx;
	
	cptDict = {}
	nodes.forEach(item => {
		const tblValues = extractTblValues(item.tbl);
		// console.log(`tbl values for ${item.title}:`, tblValues);
		cptDict[item.title]=tblValues
	});
	const samplingKeys = Object.keys(samplingDict);
	const startNode = samplingKeys[0];
	const startNodeTbl = cptDict[startNode];

	function retrievePrevKey(index) {
		return samplingKeys[index]
	}
	
	//A single line of whitespace must be added before every appendices to offset the top row deletion
	var newParagraph = new docx.Paragraph({
		text: " ", 
		style: "Heading5" 
	});
	docInitial.documentWrapper.document.body.sections.unshift({
		"rootKey": "_attr",
		"root": newParagraph
	});

    svgToPng(svgContent, (pngDataUrl) => {
        const imgRun = new docx.ImageRun({
            data: pngDataUrl,
            transformation: {
                width: 650,
                height: 300
            }
        });

        docInitial.addSection({
                children: [
//					...paragraphs,
					new docx.Paragraph({
                        text: "Attack Ladder analysis with no information about a specific MITRE ATT&CK Group(s):",
                        style: "Heading2"
                    }),
                    new docx.Paragraph({
                        children: [imgRun],
                    }),
					new docx.Paragraph({
                        text: "Overall System Resilience: "+systemResilienceComputation,
                        style: "Heading3"
                    }),
					new docx.Paragraph({
                        text: "Number of samples chosen: "+noOfSamples,
                        style: "Heading3"
                    }),
					new docx.Paragraph({
                        text: "MiMir detection scores are shown as halos in the above diagram.",
                        style: "Heading3"
                    }),
					new docx.Paragraph({
                        text: "Percentage of samples where rung is achieved (i.e. compromised):",
                        style: "Heading3"
                    }),
					new docx.Paragraph({
                        children: [samplingTable(samplingDict)],
                    }),
					new docx.Paragraph({
                        text: "Specific Rung Data",
                        style: "Heading3"
                    }),
					new docx.Paragraph({
                        text: "Start Rung(s):",
                        style: "Heading2"
                    }),
					new docx.Paragraph({
                        text: samplingKeys[0],
                        style: "Heading2"
                    }),
					new docx.Paragraph({
                        text: "Probability Table for Compromising Rung:",
                        style: "Heading3"
                    }),
					new docx.Paragraph({
                        children: [startRungSamplingTable(startNode,startNodeTbl)],
                    }),
					new docx.Paragraph({
                        text: "MITRE ATT&CK Techniques Directly Added: "+techniqueIdDict[samplingKeys[0]],
                        style: "Heading3"
                    }),
					new docx.Paragraph({
                        text: "Intermediate Rung(s):",
                        style: "Heading2"
                    }),
					...samplingKeys.slice(1, samplingKeys.length - 1).map((key, index) => {
						const previousKey = retrievePrevKey(index); 
						return [
							new Paragraph({
								text: key,
								style: "Heading2"
							}),
							new Paragraph({
								text: "Probability Table for Compromising Rung:",
								style: "Heading3"
							}),
							new Paragraph({
								children: [rungSamplingTable(key, previousKey, cptDict[key])], 
							}),
							new Paragraph({
								text: "MITRE ATT&CK Techniques Directly Added: " + techniqueIdDict[key],
								style: "Heading3"
							})
						];
					}).flat(),
					...samplingKeys.slice(samplingKeys.length-1).map((key, index) => {
						const previousKey = retrievePrevKey(samplingKeys.length-2); 
						return [
							new docx.Paragraph({
								text: "End Rung(s):",
								style: "Heading2"
							}),
							new Paragraph({
								text: "Note: The extent to which these rungs are compromised inform the overall system resilience score.",
								style: "Heading3"
							}), 
							new Paragraph({
								text: key,
								style: "Heading2"
							}),
							new Paragraph({
								text: "Probability Table for Compromising Rung:",
								style: "Heading3"
							}),
							new Paragraph({
								children: [rungSamplingTable(key, previousKey, cptDict[key])], 
							}),
							new Paragraph({
								text: "MITRE ATT&CK Techniques Directly Added: " + techniqueIdDict[key],
								style: "Heading3"
							})
						];
					}).flat(),
					
					
                ]
        });	
        docx.Packer.toBlob(docInitial).then(blob => {
            if (filename) {
                filename += ".docx";
				saveAs(blob, filename);
            } else {
                console.error("Filename is empty or invalid");
            }
        }).catch(error => {
            console.error('Error creating DOCX:', error);
            alert("Error while creating the document: " + error.message);
        });
		var docEvent = new CustomEvent("docCompleted", { detail: { docInitial } });
		document.dispatchEvent(docEvent);
	});
}

appendNum=1
async function appendDocx(filename) {
    svgContent = svg[0][0];
	const { Document, Packer, Paragraph, Table, TableCell, TableRow } = docx;
	var filenameEvent = new CustomEvent("filenameUploaded", { detail: { filename } });
	document.dispatchEvent(filenameEvent);

	if (typeof mitreAttackGroupFilename === 'undefined'){
		mitreAttackGroupFilename = "None"
	}
	console.log(mitreAttackGroupFilename)

	//Offset addSection line deletion
	var newParagraph = new docx.Paragraph({
		text: " ", 
		style: "Heading" 
	});
	docReport.documentWrapper.document.body.sections.unshift({
		"rootKey": "_attr",
		"root": newParagraph
	});
    svgToPng(svgContent, (pngDataUrl) => {
        const imgRun = new docx.ImageRun({
            data: pngDataUrl,
            transformation: {
                width: 650,
                height: 300
            }
        });

        docReport.addSection({
			children: [
				new docx.Paragraph({
					text: `Append ${appendNum}:`,
					style: "Heading1"
				}),
				new docx.Paragraph({
					text: `Attack Ladder analysis with MITRE ATT&CK Group(s): ${mitreAttackGroupFilename}`,
					style: "Heading1"
				}),
				new docx.Paragraph({
					children: [imgRun],
				}),
				new docx.Paragraph({
					text: "Overall System Resilience: "+systemResilienceComputation,
					style: "Heading3"
				}),
				new docx.Paragraph({
					text: "MiMir detection scores are shown as halos in the above diagram.",
					style: "Heading3"
				}),
				new docx.Paragraph({
					text: "Number of samples chosen: "+noOfSamples,
					style: "Heading3"
				}),	
				new docx.Paragraph({
					text: "Percentage of samples where rung is achieved (i.e. compromised):",
					style: "Heading3"
				}),
				new docx.Paragraph({
					children: [samplingTable(samplingDict)],
				}),
				new docx.Paragraph({
					text: "Specific Rung(s) Compromised by MITRE ATT&CK Group(s):",
					style: "Heading3"
				}), 
				...(attackTechniqueNodes && attackTechniqueNodes.length > 0
					? attackTechniqueNodes.map(node => {
						return new Paragraph({
							text: `${node.title} from this appendices is compromised with MITRE ATT&CK technique ${node.attack_techniques.join(", ")}.`,
							bullet: {
								level: 0
							}
						});
					})
					: []
				),
				new docx.Paragraph({
					text: "To Mitigate the Technique(s) Used by MITRE ATT&CK Group(s):",
					style: "Heading3"
				}),
				new docx.Paragraph({
					text: ' ',
					style: "Heading3"
				}), 
            ]
            
        });	

	});
	for (const node of attackTechniqueNodes) {
		let techniqueId = node.attack_techniques.join(", ");
		if (techniqueId.indexOf('.') !== -1) {
			techniqueId = techniqueId.substring(0, techniqueId.indexOf('.'));
		}
		console.log(techniqueId);
		const mitdata = await fetchAndCreateParagraph(techniqueId);
		console.log(mitdata);
		const mitigations = mitdata.map(item => `${item.mitigation_id} (${item.mitigation})`).join(", ");
		const textForTechnique = `For attack technique ${techniqueId} the following mitigation strategies exist: ${mitigations}. When applied to focus on common critical assets and to reduce the attack surface these mitigations can expose, impede, limit, preclude, and redirect the ATT&CK Groups.`;
		const mitigationParagraphs = mitdata.map(item => new docx.Paragraph({
			text: `${item.mitigation_id} (${item.mitigation}) - ${item.mitigation_desc} It is implemented via the following NIST controls: ${item.controls}.`,
			bullet: {
				level: 0
			}
		}));

		docReport.addSection({
			children: [
				new docx.Paragraph({
					text: textForTechnique,
					style: "Heading3"
				}),
				new docx.Paragraph({
					text: 'Details about Candidate Mitigations:',
					style: "Heading3"
				}),
				...mitigationParagraphs
			]
		});
	}
	docx.Packer.toBlob(docReport).then(blob => {
            if (filename) {
                filename += ".docx";
                saveAs(blob, filename);
            } else {
                console.error("Filename is empty or invalid");
            }
        }).catch(error => {
            console.error('Error creating DOCX:', error);
            alert("Error while creating the document: " + error.message);
        });
		appendNum += 1
		var docAppendEvent = new CustomEvent("docAppendCompleted", { detail: { docReport, appendNum } });
		document.dispatchEvent(docAppendEvent);

}


function nestPreviousStepsConditions(stepNumber) {
    // Loop backwards through the steps to nest the conditions correctly
	let currentIndex = stepNumber
	let previousIndex = currentIndex - 1;
	let tbl = {};
	
	const prevStepYesKey = `${previousIndex}yes`;
	const prevStepNoKey = `${previousIndex}no`;

	// create tbl entries for the immediate previous step
	tbl[prevStepYesKey] = { [`${currentIndex}yes`]: 0.5, [`${currentIndex}no`]: 0.5 };
	tbl[prevStepNoKey] = { [`${currentIndex}yes`]: 0.5, [`${currentIndex}no`]: 0.5 };
    return tbl;
}

function transformData(stepNumber, tactic, technique, techID) {
	let tbl = {};
	if (stepNumber === 1) { // First step has no dependencies
		tbl = {
			[`${stepNumber}yes`]: 0.5,
			[`${stepNumber}no`]: 0.5
		};
	} else { // Subsequent steps
		let baseConditions = {
			[`${stepNumber}yes`]: 0.5,
			[`${stepNumber}no`]: 0.5
		};

		tbl = nestPreviousStepsConditions(stepNumber);
	}

	return {
		id: stepNumber,
		orderId: stepNumber,
		title: stepNumber+'-'+technique,
		functionalities: [],
		vulnerabilities: [],
		attack_techniques: [techID],
		x: 120*stepNumber, //dynamically calculated
		y: 100, 
		values: ["yes", "no"],
		tbl
	};
  
}


var uploadMiMir = function() {
    if(window.File && window.FileReader && window.FileList && window.Blob) {
        var uploadFile = d3.select("#hidden-upload-4").node().files[0];
		uploadFileName = uploadFile.name

        var fileExtension = uploadFile.name.split('.').pop().toLowerCase();
        if(fileExtension !== "xlsx") {
            alert("The uploaded file needs to be an .xlsx file.");
            return;
        }
		var detectionScoreDict = {};
		var visibilityScoreDict = {};
		var techniqueIdDict = {}
		var pDict = {}
        var reader = new FileReader();
		let nodesJson = [];
		let edgesJson = [];
		//TODO: Include 3 Ps from mimir workbook and use them to calculated node CPT table
        reader.onload = function(e) {
            var data = new Uint8Array(e.target.result);
            var workbook = XLSX.read(data, {type: 'array'});

            if(workbook.SheetNames.includes('Detection')) {
                var detectionWorksheet = workbook.Sheets['Detection'];
                var json = XLSX.utils.sheet_to_json(detectionWorksheet, {header:1});
                // Assuming titles are in the 4th row
                var titlesRow = json[3]; // 0-indexed, 3 corresponds to the 4th row
                var stepIndex = titlesRow.indexOf('Step #')
				var tacticIndex = titlesRow.indexOf('Tactic')
				var tacticIdIndex = titlesRow.indexOf('TacticID')
				var techniqueIndex = titlesRow.indexOf('Technique')
				var subTechniqueIndex = titlesRow.indexOf('Sub-Technique')		
				var descriptionIndex = titlesRow.indexOf('Procedure Description')
				var detectionScoreIndex = titlesRow.indexOf('Detection Score');
				var idIndex = titlesRow.indexOf('ID');

                //console.log('Detection Score and Visibility Score Data:');
                json.slice(4).forEach(row => { // Skipping the first 4 rows (0-indexed, slice starts from 5th row)
                    if(row.length > Math.max(detectionScoreIndex, techniqueIndex, idIndex,stepIndex,tacticIndex,tacticIdIndex,subTechniqueIndex,descriptionIndex)) {
                        var stepNum = row[stepIndex] !== undefined ? row[stepIndex] : 'N/A';
						var tactic = row[tacticIndex] !== undefined ? row[tacticIndex] : 'N/A';
						var tacticId = row[tacticIdIndex] !== undefined ? row[tacticIdIndex] : 'N/A';
						var technique = row[techniqueIndex] !== undefined ? row[techniqueIndex] : 'N/A';
						var subTechnique = row[subTechniqueIndex] !== undefined ? row[subTechniqueIndex] : 'N/A';
						var techniqueID = row[idIndex] !== undefined ? row[idIndex] : 'N/A';
						var description = row[descriptionIndex] !== undefined ? row[descriptionIndex] : 'N/A';
						var detectionScore = row[detectionScoreIndex] !== undefined ? row[detectionScoreIndex] : 'N/A';
						var nodeLabel = stepNum+'-'+technique
						//detectionScoreDict[stepNum] = [tactic, detectionScore]
                        detectionScoreDict[nodeLabel] = detectionScore
						techniqueIdDict[nodeLabel] = techniqueID
						//console.log({StepNum:stepNum,Tactic:tactic,Technique: technique, SubTechniqueID:techniqueID, DetectionScore: detectionScore});
						const transformedData = transformData(stepNum, tactic, technique, techniqueID);
						nodesJson.push(transformedData)
					}
                });
            } 
			if(workbook.SheetNames.includes('Visibility')) {
                var visibilityWorksheet = workbook.Sheets['Visibility'];
                var json = XLSX.utils.sheet_to_json(visibilityWorksheet, {header:1});
                // Assuming titles are in the 4th row
                var titlesRow = json[3]; // 0-indexed, 3 corresponds to the 4th row
                var stepIndex = titlesRow.indexOf('Step #')
				var techniqueIndex = titlesRow.indexOf('Technique')
				var detectionScoreIndex = titlesRow.indexOf('Visibility Score');

				json.slice(4).forEach(row => { // Skipping the first 4 rows (0-indexed, slice starts from 5th row)
                    if(row.length > Math.max(detectionScoreIndex, techniqueIndex, stepIndex)) {
						var stepNum = row[stepIndex] !== undefined ? row[stepIndex] : 'N/A';
						var technique = row[stepIndex] !== undefined ? row[techniqueIndex] : 'N/A';
						var detectionScore = row[stepIndex] !== undefined ? row[detectionScoreIndex] : 'N/A';
						var nodeLabel = stepNum+'-'+technique
                        visibilityScoreDict[nodeLabel] = detectionScore
					}
				});
			}

			if(workbook.SheetNames.includes('CampaignMap')) {
                var visibilityWorksheet = workbook.Sheets['CampaignMap'];
                var json = XLSX.utils.sheet_to_json(visibilityWorksheet, {header:1});
                // Assuming titles are in the 4th row
                var titlesRow = json[3]; // 0-indexed, 3 corresponds to the 4th row
                var stepIndex = titlesRow.indexOf('Step #')
				var techniqueIndex = titlesRow.indexOf('Technique')
				var p1 = titlesRow.indexOf('P1');
				var p2 = titlesRow.indexOf('P2');
				var p3 = titlesRow.indexOf('P3');

				json.slice(4).forEach(row => { // Skipping the first 4 rows (0-indexed, slice starts from 5th row)
                    if(row.length > Math.max(techniqueIndex, stepIndex)) {
						var stepNum = row[stepIndex] !== undefined ? row[stepIndex] : 'N/A';
						var technique = row[stepIndex] !== undefined ? row[techniqueIndex] : 'N/A';
						var P1 = row[stepIndex] !== undefined ? row[p1] : 'N/A';
						var P2 = row[stepIndex] !== undefined ? row[p2] : 'N/A';
						var P3 = row[stepIndex] !== undefined ? row[p3] : 'N/A';
						var nodeLabel = stepNum+'-'+technique
                        pDict[nodeLabel] = [P1,P2,P3]
					}
				});
				//console.log(pDict)
			}
	
			else {
                console.log('Summary sheet not found.');
            }
			for (let i = 0; i < nodesJson.length - 1; i++) {
				// Append nodes to edgeValues
				edgesJson.push({
				  source: nodesJson[i], // Current item as source
				  target: nodesJson[i + 1] // Next item as target
				});
			  }

			const jsonObject = {
				nodes: nodesJson,
				edges: edgesJson
			  };
			
			attackGraphJSON = JSON.stringify(jsonObject, null, 2);
			//console.log(attackGraphJSON)

			var customEvent = new CustomEvent("uploadCompleted", { detail: { uploadFileName, detectionScoreDict, visibilityScoreDict, techniqueIdDict } });
    		document.dispatchEvent(customEvent);
			
			d3.select("#dataset-name")
			.html("Dataset: " + uploadFile.name)
			.classed("notice-text", true);
			// update glyphicons if changes have happened
			d3.select("#glyphicon-struct").remove();
			d3.select("#p-struct").append("span")
								.attr("id", "glyphicon-struct")
								.attr("class", "glyphicon glyphicon-ban-circle glyphicon-navbar-ban")
								.attr("aria-hidden", "true");
			d3.select("#glyphicon-params").remove();
			d3.select("#p-params").append("span")
								.attr("id", "glyphicon-params")
								.attr("class", "glyphicon glyphicon-ban-circle glyphicon-navbar-ban")
								.attr("aria-hidden", "true");

			//var txt =fileReader.result;
			try {
				var netObj = JSON.parse(attackGraphJSON);
				deleteNetwork(false);
	
				//clear the display field
				clearDisplayField();
	
				nodes = netObj.nodes;
				var rawEdges = netObj.edges;
				rawEdges.forEach(function(e, index){
					var src = nodes.filter(function(n) {
						return n.id === e.source.id;
					})[0];
					var tgt = nodes.filter(function(n) {
						return n.id === e.target.id;
					})[0];
					rawEdges[index] = {source: src, target:tgt};
				})
				edges = rawEdges;
				//find the max index in the nodes
				lastID = maxNodeId();
				//set the status to uploaded
				uploaded = true;
				refresh();
				//display instructions
				displayHelp();
	
			}
			catch(err){
				bootbox.dialog({
					message: "Error occured while parsing the file.",
					buttons: {
					main: {
						label: "OK",
						className: "btn-bayes-short",
					},
					}
				});
			}

        };
        reader.readAsArrayBuffer(uploadFile);

        document.getElementById("hidden-upload-4").value = ""; // Reset the input after processing
    }
    else {
        alert("Your browser does not support file reading.");
    }
} 
var uploadMitre = function()
{	
	let nodeDict = {};

	// Loop through nodes and construct the dictionary
	for (let i = 0; i < nodes.length; i++) {
		let node = nodes[i];
		nodeDict[node.title] = node.id;
	}
	d3.selectAll('*').filter(function(d) {
		return d && nodeDict.hasOwnProperty(d.title);
	}).selectAll('.node-title')
	.each(function(d) {
		var circleElem = d3.selectAll(".node")
						.filter(function(n) { 
							return (n.id === d.id)
						});
		//update the circle title
		multipleLinesText(d.title, circleElem);
		//Retain the adjusted fixed node titles
		if (typeof fixedSamples !== 'undefined') {
			d3.selectAll('.node-title')
			.filter(function(d) {
				return fixedSamples[d.id] === 'yes' && nodeDict.hasOwnProperty(d.title);
			})
			.each(function(d) {
				//var nodeTitle = d3.select(this);
				var circleElem = d3.selectAll(".node")
							.filter(function(n) { 
								return (n.id === d.id)
							});
				//update the circle title with + for fixed nodes
				multipleLinesText('+'+d.title, circleElem);
			})
		}
	});

	if(window.File && window.FileReader && window.FileList && window.Blob) {
		var fileReader = new FileReader();
		var uploadFile = d3.select("#hidden-upload-mitre").node().files[0];

		//check if it is the correct file type
		if(!checkUploadFileExtension(uploadFile.type, "application/json")) {
			bootbox.dialog({
			  message: "The uploaded MITRE ATT&CK file needs to be .json",
			  buttons: {
			    main: {
			      label: "OK",
			      className: "btn-bayes-short",
			    },
			  }
			});
			return;
		}
		//update the dataset name
		d3.select("#attackgroup-name")
		.html("ATT&CK Group: " + uploadFile.name)

		attackGroupFilename = uploadFile.name
		var attackGroupEvent = new CustomEvent("attackGroupAdded", { detail: { attackGroupFilename } });
		document.dispatchEvent(attackGroupEvent);
		
		fileReader.onload = function(){
			var txt = fileReader.result;
			try {
				var netObj = JSON.parse(txt);
				var attackTechniquesJSON = netObj.techniques;
				attack_group_techniques = new Array(attackTechniquesJSON.length);
				for (i=0; i<attackTechniquesJSON.length;i++)
				{
					attack_group_techniques[i]=attackTechniquesJSON[i].techniqueID;
				}
			}
			catch(err){
				bootbox.dialog({
				  message: "Error occured while parsing the file.",
				  buttons: {
				    main: {
				      label: "OK",
				      className: "btn-bayes-short",
				    },
				  }
				});
			}
		}
		fileReader.readAsText(uploadFile);
		document.getElementById("hidden-upload-mitre").value = "";
	}
	else {
		bootbox.dialog({
		  message: "Your browser does not support MITRE ATT&CK Group functionality.",
		  buttons: {
		    main: {
		      label: "OK",
		      className: "btn-bayes-short",
		    },
		  }
		});
	}
}

//parts of the code have been taken from http://blog.teamtreehouse.com/reading-files-using-the-html5-filereader-api
var uploadNetwork = function(){
	if(window.File && window.FileReader && window.FileList && window.Blob) {
		var fileReader = new FileReader();
		var uploadFile = d3.select("#hidden-upload").node().files[0];

		//check if it is the correct file type
		if(!checkUploadFileExtension(uploadFile.type, "application/json")) {
			bootbox.dialog({
			  message: "The uploaded file needs to be .json",
			  buttons: {
			    main: {
			      label: "OK",
			      className: "btn-bayes-short",
			    },
			  }
			});
			return;
		}

		//update the dataset name
		d3.select("#dataset-name")
		.html("Dataset: " + uploadFile.name)
		.classed("notice-text", true);
		// update glyphicons if changes have happened
		d3.select("#glyphicon-struct").remove();
		d3.select("#p-struct").append("span")
							  .attr("id", "glyphicon-struct")
							  .attr("class", "glyphicon glyphicon-ban-circle glyphicon-navbar-ban")
							  .attr("aria-hidden", "true");
		d3.select("#glyphicon-params").remove();
		d3.select("#p-params").append("span")
							  .attr("id", "glyphicon-params")
							  .attr("class", "glyphicon glyphicon-ban-circle glyphicon-navbar-ban")
							  .attr("aria-hidden", "true");

		fileReader.onload = function(){
			var txt = fileReader.result;
			try {
				var netObj = JSON.parse(txt);
				deleteNetwork(false);

				//clear the display field
				clearDisplayField();

				nodes = netObj.nodes;
				var rawEdges = netObj.edges;
				rawEdges.forEach(function(e, index){
					var src = nodes.filter(function(n) {
						return n.id === e.source.id;
					})[0];
					var tgt = nodes.filter(function(n) {
						return n.id === e.target.id;
					})[0];
					rawEdges[index] = {source: src, target:tgt};
				})
				edges = rawEdges;
				//find the max index in the nodes
				lastID = maxNodeId();
				//set the status to uploaded
				uploaded = true;
				refresh();
				//set mode to default
				// setDefaultMode();
				//display instructions
				displayHelp();

			}
			catch(err){
				bootbox.dialog({
				  message: "Error occured while parsing the file.",
				  buttons: {
				    main: {
				      label: "OK",
				      className: "btn-bayes-short",
				    },
				  }
				});
			}
		}

		fileReader.readAsText(uploadFile);
		document.getElementById("hidden-upload").value = "";
	}
	else {
		bootbox.dialog({
		  message: "Your browser does not support this functionality.",
		  buttons: {
		    main: {
		      label: "OK",
		      className: "btn-bayes-short",
		    },
		  }
		});
	}
	var customEventNet = new CustomEvent("uploadCompletedNet");
	document.dispatchEvent(customEventNet);
}

//Initialise
var loadDefaultNetwork = function(filepath, isInitial, val) {
	// get file's name
	var fileName = filepath.split("/")[filepath.split("/").length-1];
	// update dataset header
	d3.select("#dataset-name")
		.html("Dataset: " + fileName)
		.classed("notice-text", true);

	// disable learning controls
	d3.select("#learnStruct")
	  .classed("disabled", true);
	d3.select("#learnParams")
	  .classed("disabled", true);

	// update glyphicons if changes have happened
	d3.select("#glyphicon-struct").remove();
	d3.select("#p-struct").append("span")
						  .attr("id", "glyphicon-struct")
						  .attr("class", "glyphicon glyphicon-ban-circle glyphicon-navbar-ban")
						  .attr("aria-hidden", "true");
	d3.select("#glyphicon-params").remove();
	d3.select("#p-params").append("span")
						  .attr("id", "glyphicon-params")
						  .attr("class", "glyphicon glyphicon-ban-circle glyphicon-navbar-ban")
						  .attr("aria-hidden", "true");


	//delete previous network
	deleteNetwork(false);
	d3.json(filepath, function(error, netData) {
	// process the nodes
	  nodes = netData.nodes;
	  // process the edges
	  var rawEdges = netData.edges;
	  rawEdges.forEach(function(e, index){
	  	var src = nodes.filter(function(n) {
	  		return n.id === e.source.id;
	  	})[0];
	  	var tgt = nodes.filter(function(n) {
	  		return n.id === e.target.id;
	  	})[0];
	  	rawEdges[index] = {source: src, target:tgt};
	  })
	  edges = rawEdges;
	  //find the max index in the nodes
	  lastID = maxNodeId();
	  //set the status to uploaded
	  uploaded = true;

	  //render
	  refresh();
	  //set mode to default
	  // setDefaultMode();
	  if (isInitial) {
		//display instructions
		displayHelp();
		// forceLayout(nodes, edges);
	  }
	  else {
	  	loadExampleNetworks(val);
	  };

	  // start the force layout
	  //forceLayout(nodes, edges);
	});
};

// local filepath to example network
var identifyExampleNetFilepath = function(val) {
	if(val === "rain") {
		loadDefaultNetwork("files/nets/wetGrassNet.json", false, val)
	}
	else if(val === "burglary") {
		loadDefaultNetwork("files/nets/burglaryNetFull.json", false, val)
	}
	else if(val === "cancer") {
		loadDefaultNetwork("files/nets/cancerNet.json", false, val)
	}
	else if(val === "bronchitis") {
		loadDefaultNetwork("files/nets/smokerBronchitis.json", false, val)
	}
	else if(val === "asia") {
		loadDefaultNetwork("files/nets/asia.json", false, val);
	}
	else if(val === "alarm") {
		loadDefaultNetwork("files/nets/alarm.json", false, val);
	}
};

// example networks
var loadExampleNetworks = function(selValue) {
	clearDisplayField();
	// deselect the node if such is selected
	selectedNode = null;
	selectedPath = null;
	refresh();

	//append select for different example networks
	var form = control.append("div")
					  .attr("class", "form-group")

	form.append("label")
		.attr("for", "example-net")
		.attr("class", "label-text")
		.text("Select an example network from the menu: ")

	var select = form.append("select")
					 .attr("id", "example-net")
					 .attr("class", "form-control")
					 .on("change", function() {
					 	identifyExampleNetFilepath(this.options[this.selectedIndex].value);
					 });
	select.append("option")
		  .attr("value", "none")
		  .attr("disabled", true)
		  .attr("selected", true)
		  .text("Select Network:")
	select.append("option")
		  .attr("value", "alarm")
		  .text("Alarm");
	select.append("option")
		  .attr("value", "asia")
		  .text("Asia");
	select.append("option")
		  .attr("value", "bronchitis")
		  .text("Basic Bronchitis");
	select.append("option")
		  .attr("value", "burglary")
		  .text("Burglary");
	select.append("option")
		  .attr("value", "cancer")
		  .text("Cancer");
	select.append("option")
		  .attr("value", "rain")
		  .text("Rain");

	// control.append("hr");

	var options = select.selectAll("option")[0];
	options.forEach(function(option) {
		if(option.value === selValue) {
			d3.select(option)
			  .attr("selected", true);
		}
	});
};

// load a dataset
var loadDataset = function(filepath, val) {
	// get file's name
	var fileName = filepath.split("/")[filepath.split("/").length-1];
	// update dataset header
	d3.select("#dataset-name")
		.html("Dataset: " + fileName)
		.classed("notice-text", true);

	// load the data
	d3.csv(filepath, function(data){
		// get the csv data
		csvData = data;
		//reformat the data
		fData = formatUploadSample(csvData);
		//get the variables names and create nodes
		createNodes(fData);
		// keep the select on the right-side menu
		loadExampleData(val);
	})

	// update the controls
	d3.select("#learnStruct")
	  .classed("disabled", false);
	d3.select("#learnParams")
	  .classed("disabled", false);

	// update glyphicons if changes have happened
	d3.select("#glyphicon-struct").remove();
	d3.select("#p-struct").append("span")
						  .attr("id", "glyphicon-struct")
						  .attr("class", "glyphicon glyphicon-ban-circle glyphicon-navbar-ban")
						  .attr("aria-hidden", "true");
	d3.select("#glyphicon-params").remove();
	d3.select("#p-params").append("span")
						  .attr("id", "glyphicon-params")
						  .attr("class", "glyphicon glyphicon-ban-circle glyphicon-navbar-ban")
						  .attr("aria-hidden", "true");
};

// dataset filepath
var identifyExampleDataFilepath = function(val) {
	if (val === "cancer") {
		loadDataset("files/datasets/cancer80000.csv", val);
	}
	// else if (val === "asia") {
	// 	loadDataset("files/datasets/asia50000.csv", val);
	// }
	else if (val === "rain") {
		loadDataset("files/datasets/rain1000.csv", val);
	}
	else if (val === "burglary") {
		loadDataset("files/datasets/burglary20000.csv", val);
	}
};

// example datasets
var loadExampleData = function(selected) {
	clearDisplayField();
	// deselect the node if such is selected
	selectedNode = null;
	selectedPath = null;
	refresh();

	//append select for different example networks
	var form = control.append("div")
					  .attr("class", "form-group")

	form.append("label")
		.attr("for", "example-dataset")
		.attr("class", "label-text")
		.text("Select an example dataset from the menu: ")

	var select = form.append("select")
					 .attr("id", "example-dataset")
					 .attr("class", "form-control")
					 .on("change", function() {
					 	identifyExampleDataFilepath(this.options[this.selectedIndex].value);
					 });
	select.append("option")
		  .attr("value", "none")
		  .attr("disabled", true)
		  .attr("selected", true)
		  .text("Select Dataset:")
	// select.append("option")
	// 	  .attr("value", "asia")
	// 	  .text("Asia")
	select.append("option")
		  .attr("value", "burglary")
		  .text("Burglary");
	select.append("option")
		  .attr("value", "cancer")
		  .text("Cancer");
	select.append("option")
		  .attr("value", "rain")
		  .text("Rain");

	// used when the function is called after a dataset is loaded and we want to keep the select menu
	// sets the select to the correct selected value
	var options = select.selectAll("option")[0];
	options.forEach(function(option) {
		if(option.value === selected) {
			d3.select(option)
			  .attr("selected", true);
		}
	});
};

//download the canvas as png format
var downloadPNG = function(filename) {
	var filePngName = filename + ".png";
	saveSvgAsPng(svg[0][0], filePngName);
};

// parse the bif file text to get the nodes, the connections and the cpt values
var parseBif = function(txtBif){
	// delete displayed network
	deleteNetwork(false);
	// get an array of lines from the txt file
	var lines = txtBif.split("\n");

	//go through each line and parse it according to rules
	for(var i=0; i<lines.length; i++) {
		var res;

		// check if the line starts with variable
		if((res = lines[i].match(/variable (.+) \{/))) {
			var name = res[1];

			// parse next line to get variable type and values
			i++;
			res = lines[i].match(/  type (.+) \[ (\d+) \] \{ (.+) \};/);
			// check if it is discrete
			// don't allow continuous variables
			if(res[1] != "discrete") {
				// alert
				// TODO
				return false;
			}

			// get number of values and values' names
			var values = res[3].split(", ");
			// create a node with this name and these values
			addFileNode(name, values);
			// refresh the display to get the nodes set up with tables
			// TODO find another way
			refresh();
		}
		// check if the line starts with probability
		else if((res = lines[i].match(/probability \( (.+) \) \{/))) {
			// all involved nodes
			var allNodes = res[1].split(" | ");
			// current node
			var currNodeName = allNodes[0];
			var currNode = nodes.filter(function(n){
				return n.title === currNodeName;
			})[0];

			var parents;
			// check for conditional probability => create a link
			if(allNodes[1]) {
				parents = allNodes[1].split(", ");
				for (var p in parents) {
					var parentNode = nodes.filter(function(n) {
						return n.title === parents[p];
					})[0];
					// create a connection from parent to current node
					createNewEdge(parentNode, currNode);
				}
			}

			// console.log("get cpt values");
			// iterate over the probability values
			while(lines[i+1] !== "}") {
 				// Probability values on this row
				var values = lines[i+1].match(/(\d.\d+)/g);
 				var pattern;
 				if(pattern = lines[i+1].match(/  table /)) {
 					// root node
 					for (var key in currNode.tbl) {
 						currNode.tbl[key] = values.splice(0,1);
 					}
 				}
 				else if(pattern = lines[i+1].match(/  \((.+)\) /)){
	 				// child node
 					//find the ids of the parent nodes
 					var parIDs = [];
					parents.forEach(function(p) {
						var id = nodes.filter(function(n) {
							return n.title == p
						})[0].id;
						parIDs.push(id);
					});
					//get the values for parents on this row
					var parentRowVals = pattern[1].split(", ");

					// map index to value
					var pairsIdVal = [];
					for(var pair=0; pair<parIDs.length; pair++) {
						pairsIdVal.push(parIDs[pair] + "" + parentRowVals[pair]);
					}
					// NOTE: JavaScript sorts lexicographically instead of numerically
					// e.g. [8,35] will be sorted as [35, 8]
					// parIDs.sort();
					pairsIdVal.sort();

					var tbl = currNode.tbl;
					//get to the leaf level for these values
					for (var level =0; level<pairsIdVal.length; level++) {
						// tbl = tbl[parIDs[level] + "" + parentRowVals[level]];
						tbl = tbl[pairsIdVal[level]]
					}

					// update the tbl values (one row)
					for(var key in tbl) {
						tbl[key] = values.splice(0,1);
					}
 				}
 				i++
			}
		}

	}

	// display
	refresh();
	// Successful parsing
	return true;
}

// upload Bif network
var uploadBif = function() {
	if(window.File && window.FileReader && window.FileList && window.Blob) {
		var fileReader = new FileReader();
		var uploadFile = d3.select("#hidden-upload-3").node().files[0];

		//check if it is bif
		var extension = uploadFile.name.split(".")[uploadFile.name.split(".").length-1];
		if(!checkUploadFileExtension(extension, "bif")) {
			bootbox.dialog({
			  message: "The uploaded file needs to be .bif",
			  buttons: {
			    main: {
			      label: "OK",
			      className: "btn-bayes-short",
			    },
			  }
			});
			return;
		}

		//update the dataset name
		d3.select("#dataset-name")
		.html("Dataset: " + uploadFile.name)
		.classed("notice-text", true);

		// update glyphicons if changes have happened
		d3.select("#glyphicon-struct").remove();
		d3.select("#p-struct").append("span")
							  .attr("id", "glyphicon-struct")
							  .attr("class", "glyphicon glyphicon-ban-circle glyphicon-navbar-ban")
							  .attr("aria-hidden", "true");
		d3.select("#glyphicon-params").remove();
		d3.select("#p-params").append("span")
							  .attr("id", "glyphicon-params")
							  .attr("class", "glyphicon glyphicon-ban-circle glyphicon-navbar-ban")
							  .attr("aria-hidden", "true");
		fileReader.onload = function(event){
			// TODO make local var
			txtBif = fileReader.result;
			parseBif(txtBif);
			refresh();

			// add to force layout
			// forceLayout(nodes, edges);
		}
		fileReader.onerror = function() {
			bootbox.dialog({
			  message: "Unable to read the file " + uploadFile.fileName,
			  buttons: {
			    main: {
			      label: "OK",
			      className: "btn-bayes-short",
			    },
			  }
			});
		}
		fileReader.readAsText(uploadFile);

		//reset the value
		document.getElementById("hidden-upload-3").value = "";
	}
	else {
		bootbox.dialog({
		  message: "The File APIs are not supported in this browser. Please try again in a different one.",
		  buttons: {
		    main: {
		      label: "OK",
		      className: "btn-bayes-short",
		    },
		  }
		});
	}
}

// loading image when running function
var loader = function() {
  return function() {
    // var radius = 100;
    // var tau = 2 * Math.PI;

    // var arc = d3.svg.arc()
    //         .innerRadius(radius*0.7)
    //         .outerRadius(radius*0.9)
    //         .startAngle(0);

    var loaderG = svg.append("g")
        .attr("id", "imgLoader")
        .attr("transform", "translate(" + (svg.attr("width") / 2 - 240) + "," + (svg.attr("height") / 2 -160) + ")");

    var img = loaderG.append("image")
                 .attr("x", 0)
                 .attr("y", 0)
                 .attr("width", 480)
                 .attr("height", 320)
                 .attr("xlink:href", "img/loading.gif")
    // var text = loaderG.append("text")
				// 	.attr("x", -35)
    //                 .attr("y", 0)
    //                 .text("Loading...")
    //                 .attr("font-family", "sans-serif")
    //                 .attr("font-size", "20px")
    //                 .attr("fill", "#CC0B7C");

    // var background = loaderG.append("path")
    //         .datum({endAngle: 0.33*tau})
    //         .style("fill", "#CC0B7C")
    //         .attr("d", arc)
    //         .call(spin, 1500)

    // function spin(selection, duration) {
    //     selection.transition()
    //         .ease("linear")
    //         .duration(duration)
    //         .attrTween("transform", function() {
    //             return d3.interpolateString("rotate(0)", "rotate(360)");
    //         });

    //     setTimeout(function() { spin(selection, duration); }, duration);
    // }

    // function transitionFunction(path) {
    //     path.transition()
    //         .duration(7500)
    //         .attrTween("stroke-dasharray", tweenDash)
    //         .each("end", function() { d3.select(this).call(transition); });
    // }

  };
}
