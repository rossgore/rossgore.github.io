// raw text from the csv
var rawTxt,
    csvData,
    fData;

// table for the dataset name and number of rows , columns
var tableDataCharacteristics = function(filename) {
	var html = '<div class="form-group"><table class="table table-dialog">';
	// header
	html += '<thead><tr><th>Dataset:</th><th>#Rows:</th><th>#Columns:</th></tr></thead>'
	//values
	//subtract 1 because the last row is "
	var rows = rawTxt.split('\n').length - 1;
	var columns = rawTxt.split("\n")[0].split(",").length;
	html += '<tbody><tr><td class="csv-settings-text">'+filename+'</td><td class="csv-settings-text">'+rows+'</td><td class="csv-settings-text">'+columns+'</td></tr></tbody>'
	html += '</table></div>';
	return html;
}
//format the first 3 rows of the csv data to display in the dialog window
var tableCsv = function(rows) {
	var htmlString ='<div class="form-group"><table class="table table-dialog"><tbody>';

	for (var row in rows) {
		htmlString += '<tr>';
		for (var item in rows[row]) {
			htmlString += '<td>' + rows[row][item] + '</td>'
		}
		htmlString += '</tr>';
	}

	htmlString += '</tbody></table></div>';
	return htmlString;
};

//add a table with names for the columns to the dialog box
var columnNames = function(id, firstLine) {	
	// clear the contents
	d3.select("#column-names").html("");
	//label
	d3.select("#column-names")
	  .append("label")
	  .attr("class", "col-md-3 control-label")
	  .attr("for", "table-node-titles")
	  .html("Nodes' Titles");
	// new table 
	var tblBody = d3.select("#column-names")
					.append("table")
					.attr("id", "table-node-titles")
					.classed("table table-dialog", true)
					.append("tbody");

	if (id == "yes-header") {
		for(var name in firstLine) {
			var row = tblBody.append("tr");
			var i = parseInt(name) + 1;
			row.append("td")
			   .html("Node " + i);
			row.append("td")
			   .append("input")
			   .attr("type", "text")
			   .attr("class", "csv-header")
			   .attr("value", firstLine[name]);
		}
	}
	else if (id == "no-header") {
		for(var i=1; i<=firstLine.length; i++) {
			var row = tblBody.append("tr");
			//append the node title
			row.append("td")
			   .html("Node " + i);
			//append the node name cell
			row.append("td")
			   .append("input")
			   .attr("type", "text")
			   .attr("class", "csv-header")	
			   .attr("value", "X"+i);
		}
	}
}

//dialog window setting when a csv data file is uploaded
var datasetDialogSettings = function(filename, table, firstLine) {
	var statsTbl = tableDataCharacteristics(filename);

	bootbox.dialog({
        title: "CSV Dataset Settings",
        message: '<div class="row">  ' +
            '<div class="col-md-12"> ' +
            '<form class="form-horizontal"> ' +
			statsTbl+            
            // '<div class="form-group"> ' +
            // '<label class="col-md-3 control-label" for="datasetName">Dataset: </label> ' +
            // '<div id="datasetName" class="col-md-6 csv-settings-text"> ' + filename + '</div> ' +
            // '</div>' + 
            table +
            '<div class="form-group">' +                    
            '<label class="col-md-4 control-label" for="header">Does the uploaded CSV file have a header?</label> ' +
            '<div class="col-md-4">' + 
            '<div class="radio"> <label for="yes-header"> ' +
            '<input type="radio" name="header" id="yes-header" value="Yes" checked="checked">Yes</label></div>' +
            '<div class="radio"> <label for="no-header"> ' +
            '<input type="radio" name="header" id="no-header" value="No">No</label></div>' +
            '</div></div>' +
            
            '<div id="column-names" class="form-group"></div>' +
            '</form></div></div>',
        buttons: {
            success: {
                label: "Process Data",
                className: "btn-bayes",
                callback: function () {
                	// get the value for the radio button
                    var headerRadioValue = d3.select("input[name='header']:checked").attr("value")
                    //get the nodes' names
                    headers = [];
                    // flag to check whether to continue or not
                    var flag = true;
                    d3.selectAll("input.csv-header")[0].forEach(function(header) {
                		//check for empty values 
                    	if(isEmptyString(header.value)) {
							bootbox.dialog({
							  message: "Empty node names are not allowed.",
							  buttons: {
							    main: {
							      label: "OK",
							      className: "btn-bayes-short",
							    },
							  }
							});
							flag=false;
                    	}
                    	headers.push(header.value.charAt(0).toUpperCase() + header.value.slice(1));
                    });

                    // check for duplicate values
                    if(_.uniq(headers).length !== headers.length) {
						bootbox.dialog({
						  message: "Duplicate node names are not allowed.",
						  buttons: {
						    main: {
						      label: "OK",
						      className: "btn-bayes-short",
						    },
						  }
						});
						flag=false;                    	
                    }

                    if(flag) {
                		processCsvData(headerRadioValue, headers, firstLine);
                	}
               }
            }
        }
    });
	d3.select("#yes-header")
	  .on("click", function() {
	  	columnNames(this.id, firstLine);
	  });
	d3.select("#no-header")
	  .on("click", function() {
	  	columnNames(this.id, firstLine);
	  })
	document.getElementById("yes-header").click();  
}

//create nodes based on the dataset
//node values are the unique values in the dataset for each node  
var createNodes = function(fdata) {
	//delete the current network
	deleteNetwork(false);

	//create nodes - get the name and the possible values for each node from the fData
	var colNames = d3.keys(fdata);
	colNames.forEach(function(name){
		// find the values that these node can take from the data
		var nodeValues = _.uniq(fdata[name]);
		// get the data for this node
		var data = fdata[name];
		var name = name.charAt(0).toUpperCase() + name.slice(1);
		//create new node with the column name as title and the possible values it can take
		addFileNode(name, nodeValues);
		// TODO map the data to each node
		// addCsvNode(name, nodeValues, data);
	});

	// add to force layout
	forceLayout(nodes, edges);
	refresh();

	//warn the user that learning structure might take long time
	var warningDiv = d3.select("#outer-control").insert("div", "#control")
							.attr("class", "alert-text alert alert-warning")
	warningDiv.append("span")
			  .attr("class", "glyphicon glyphicon-info-sign")
			  .attr("aria-hidden", "true");
	var text = warningDiv.html() + " Learning the structure of a network is an NP algorithm. An attempt to learn the structure of a network bigger than 10 nodes might crash your browser."				  		  
	warningDiv.html(text);
	//remove after 3 seconds
	setTimeout(removeSuccessMsg, 5000);	
}

var formatUploadSample = function(data) {
	var formattedData = {};
	data.forEach(function(row) {
		for(var cName in row) {
			if(cName in formattedData) {
				formattedData[cName].push(row[cName]);
			}
			else {
				formattedData[cName] = [];
				formattedData[cName].push(row[cName]);
			}
		}
	})

	return formattedData;
}

// check for missing values
var checkMissingData = function() {
	var flag = true;
	csvData.forEach(function(row) {
		var keys = Object.keys(row);
		keys.forEach(function(key){
			if(row[key] === undefined || isEmptyString(row[key])) {
				flag = false;
			}
		});
	});

	if (!flag) {
		bootbox.dialog({
		  message: "Missing values in the dataset are not allowed.",
		  buttons: {
		    main: {
		      label: "OK",
		      className: "btn-bayes-short",
		    },
		  }
		});
	}

	return flag;
}

// check if all the nodes have at least 2 observed values in the dataset
var checkNoObservedValues = function() {
	var flag = true;
	Object.keys(fData).forEach(function(name){
		if(_.uniq(fData[name]) < 2) {
			flag = false;
		} 
	});

	if(!flag) {
		bootbox.dialog({
		  message:"Less than 2 observed values for a node are not allowed.",
		  buttons: {
		    main: {
		      label: "OK",
		      className: "btn-bayes-short",
		    },
		  }
		});		
	}
	return flag;

};

// validate the csv data
// 1. check for missing values
// 2. check if all vars have at least two observed values
var validateCsvData = function() {
	var flag1 = checkMissingData();
	var flag2 = checkNoObservedValues();
	// if it fails set the csvData and fData and rawTxt to null
	// dataset name & learning controls - handle
	if(!(flag1 && flag2)) {
		rawTxt = null;
		csvData = null;
		fData = null;
		//update the dataset name
		d3.select("#dataset-name")
		  .html("Dataset: (none)")
		  .classed("notice-text", false);
		// disable learning controls
		d3.select("#learnStruct")
		  .classed("disabled", true);
		d3.select("#learnParams")
		  .classed("disabled", true);		  	
	}

	return flag1 && flag2;
}

// process csv data based on the dialog box settings 
var processCsvData = function(radioVal, headers, firstLine) {
	if (radioVal == "Yes") {
		// compare the headers to the first line of the rawTxt
		if (headers !== firstLine) {
			//if different -> replace the first line with the headers
			rawTxt = rawTxt.replace(firstLine, headers);			 
		}
	}
	else if(radioVal == "No") {
		rawTxt = headers + '\n' + rawTxt;
	}

	// parse the updated raw text
	csvData = d3.csv.parse(rawTxt);
	//reformat the data
	fData = formatUploadSample(csvData);
	// validate csv
	var valid = validateCsvData();
	if(!valid) {
		return;
	}
	//get the variables names and create nodes
	createNodes(fData);
	//enable learning controls
	d3.select("#learnStruct")
	  .classed("disabled", false);
	d3.select("#learnParams")
	  .classed("disabled", false);
};

var learnCPTSingleNode = function(level, parents, csv, cpt) {	
	if (level === parents.length-1) {
		var leafId = parents[level];

		var leaf = nodes.filter(function(node) {
			return node.id === leafId;
		})[0];
		var values = leaf.values;

		values.forEach(function(value) {
			// count number of occurrences
			var occurrences = _.filter(csv, function(row) {
				return row[leaf.title] === value;
			});
			var entry = leafId + value;
			// cpt[entry] = numOccurrences / leaf.csvData.length
			// pseudo counts
			var Cij = 1;
			var Cj = leaf.values.length;
			cpt[entry] = (occurrences.length + Cij) / (csv.length + Cj);
		});
	}
	else if(level < parents.length-1) {
		//get the current parent 
		var parentId = parents[level];
		level++;

		//get this node
		var parent = nodes.filter(function(node) {
			return node.id === parentId;
		})[0];
		var values = parent.values;

		//go through each value
		values.forEach(function(value){
			// send as arguments the rows in csv data which match the condition for this level
			var occurrences = _.filter(csv, function(row){
				return row[parent.title] === value;
			});
			var entry = parentId + value;
			learnCPTSingleNode(level, parents, occurrences, cpt[entry]);
		});
	}
	else {
		bootbox.dialog({
		  message: "Something unexpected has happened!",
		  buttons: {
		    main: {
		      label: "OK",
		      className: "btn-bayes-short",
		    },
		  }
		});			
	}
}

// learn the CPT values for a node based on the data and the current structure 
var learnCPTValues = function() {
	for(var key in fData) {
		var node = nodes.filter(function(n){
			return n.title === key;
		})[0];
		if(node) {
			var parents = getNodeParents(node);
			parents.push(node.id);
			learnCPTSingleNode(0, parents, csvData, node.tbl);
		}
	}
}

//remove the alert message
// function used as an argument for the setTimeout
var removeAlertMsg = function() {
	d3.select("#control").select("div.alert-text").remove();
}

var learnParameters = function() {
	// if data has not been uploaded, warn the user 
	if (!csvData || !fData) {
		bootbox.dialog({
			message: "Import a CSV dataset before trying to learn the parameters.",
			buttons: {
				main: {
				label: "OK",
				className: "btn-bayes-short",
				},
			}
		});	
	}
	else {
		//learn the cpt values from the sample data
		learnCPTValues();

		// if node table is displayed -> redisplay the updated table
		var flag = null;
		if (d3.select("#control").select("h3.node-label")[0][0] !== null) {
			flag = parseInt(d3.select("#control").select("h3.node-label")[0][0].id);
		}
		// else {
		// 	// clear the display field
		// 	// only clear the display field if it is different from displaying node info
		// 	clearDisplayField();			
		// }

		// update glyphicon for parameters
		d3.select("#glyphicon-params").remove();
		d3.select("#p-params").append("span")
							  .attr("id", "glyphicon-params")
							  .attr("class", "glyphicon glyphicon-ok-circle glyphicon-navbar-ok")
							  .attr("aria-hidden", "true");

		//success message
		// var successDiv = control.insert("div", "h3.node-label")
		var successDiv = d3.select("#outer-control").insert("div", "#control")
								.attr("class", "alert-text alert alert-success");
		successDiv.append("span")
				 	.attr("class", "glyphicon glyphicon-ok")
					.attr("aria-hidden", "true");
		successDiv.append("span")
					.attr("class", "sr-only")
					.text("Success");
		var text = successDiv.html() + " CPT values have been successfully updated.";
		successDiv.html(text);

		//remove after 3 seconds
		setTimeout(removeSuccessMsg, 3000);

		//redisplay the table
		if (flag !== null) {
			var nodeSelected = nodes.filter(function(node) {
				return node.id === flag;
			})[0];
			displayCPT(nodeSelected);
			flag=null;
		}									
	}
}

// upload csv dataset
var uploadSample = function(){
	if(window.File && window.FileReader && window.FileList && window.Blob) {
		var fileReader = new FileReader();
		var uploadFile = d3.select("#hidden-upload-2").node().files[0];
		//check if it is csv
		if(!checkUploadFileExtension(uploadFile.type, "text/csv")) {
			bootbox.dialog({
			  message: "The uploaded file needs to be .csv",
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
			rawTxt = fileReader.result;		

			//rows of the csv - no header assumed
			var rows = d3.csv.parseRows(rawTxt);
			var tblString = tableCsv(rows.slice(0,3));

			//get settings from the user for the dataset
			//parameters needed: 
			// 1)filename
			// 2)table string of the first 3 rows of the csv
			// 3)header line
			var firstLine = rows.slice(0,1)[0];
			datasetDialogSettings(uploadFile.name, tblString, firstLine);
		
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
		document.getElementById("hidden-upload-2").value = "";
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
