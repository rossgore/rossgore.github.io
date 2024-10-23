var isCheckboxChecked = false;
var doSampling = function(node, parents, sample){
	var randVal = Math.random();
	// console.log(randVal);
	//get the cpt of the node
	var cpt = node.tbl;
	//get the probability distribution
	var probabValues = [];

	if(parents.length > 0) {
		//node that has parents
		for (var p in parents) {
			// get parents id + parents sampled value
			var sampledVal = parents[p] + sample[parents[p]]
			//get the next level in the cpt
			cpt = cpt[sampledVal];
		}
	}

	//reached the deepest level in the cpt
	//go through the possible values and get the corresponding probabilities
	//go through the probability ranges for each possible value
	//and check if the random number is in one of this ranges
	//return the value associated with this range
	var sum = 0.0;
	for(var val in cpt) {
		var currProb = parseFloat(cpt[val]);
		var lowerBound = sum;
		sum+= currProb;
		var upperBound = sum;
		if (lowerBound <= randVal && randVal < upperBound) {
			return val.replace(node.id.toString(), "");
		}
	}
}

var getEntryNodeIds = function()
{
	var sourceNodes = [];
	var targetNodes = [];
	for(var e in edges) {
		var tempSource = edges[e].source.id;
		var tempTarget = edges[e].target.id;
		if (sourceNodes.includes(tempSource) == false)
		{
					sourceNodes.push(tempSource);
		}
		if (targetNodes.includes(tempTarget) == false)
		{
					targetNodes.push(tempTarget);
		}

	}
	var entryNodeIds = sourceNodes.filter(function(x) {
  	  return targetNodes.indexOf(x) < 0;
	});
	
	return entryNodeIds;

}

var getExitNodeIds = function()
{
	var sourceNodes = [];
	var targetNodes = [];
	for(var e in edges) {
		var tempSource = edges[e].source.id;
		var tempTarget = edges[e].target.id;
		if (sourceNodes.includes(tempSource) == false)
		{
					sourceNodes.push(tempSource);
		}
		if (targetNodes.includes(tempTarget) == false)
		{
					targetNodes.push(tempTarget);
		}
	}
	var exitNodeIds = targetNodes.filter(function(x) {
  	  return sourceNodes.indexOf(x) < 0;
	});
	return exitNodeIds;
}

var setDisplayOrderAndMapping = function()
{
	var nodeOrderIDs = [];
	orderIdNames = new Array();
	orderIndexMapping = new Array();
	for(var n in nodes) {
		nodeOrderIDs.push(Number(nodes[n].orderId));
	}
	nodeOrderIDs = nodeOrderIDs.sort(function(a,b){return a-b});
	
	for (var orderIdIndex=0; orderIdIndex<nodeOrderIDs.length; orderIdIndex++) {
		for(var nodeIndex=0; nodeIndex<nodes.length; nodeIndex++) {
			var currentNode = nodes[nodeIndex];
			if (nodeOrderIDs[orderIdIndex] == currentNode.orderId)
			{
				//console.log("adding "+currentNode.title+" with display order id "+nodeOrderIDs[orderIdIndex]+" at rank "+orderIdIndex);
				if (orderIdNames.includes(currentNode.title) == false)
				{
					orderIdNames.push(currentNode.title);
					orderIndexMapping.push(nodeIndex);
				}

			}

		}
	}
	/**
	console.log("nodeOrderIDs");
	console.log(nodeOrderIDs)
	console.log("Sorted by orderId Names");
	console.log(orderIdNames);
	console.log("orderIndexMapping");
	console.log(orderIndexMapping);
	**/
}

var readjustSamples = function(theSamples)
{
	var reorderedSamples = new Array();
	
	//console.log("Index Mapping");
	//console.log(orderIndexMapping);
    for (var s in theSamples.slice(0,theSamples.length)) {
		 var cleanArrayRow = new Array();
		 var thisRowOfReorderedSamples = new Array();
   		 for (var val in theSamples[s]) {
			 cleanArrayRow.push(theSamples[s][val]);
		 }
		 
		 for (var arrayIndex = 0; arrayIndex<cleanArrayRow.length; arrayIndex++)
		 {
			 /**
			 console.log("clean array row");
			 console.log(cleanArrayRow);
			 console.log("order index mapping");
			 console.log(orderIndexMapping);
			 
			 console.log("original index");
			 console.log(arrayIndex);
			 console.log("original value");
			 console.log(cleanArrayRow[arrayIndex]);
			 
			 console.log("adjusted index");
			 **/
			 var adjustmentIndex = orderIndexMapping[arrayIndex];
			 //console.log(adjustmentIndex);
			 //console.log("adjusted value");
			 //console.log(cleanArrayRow[adjustmentIndex]);

 			thisRowOfReorderedSamples.push(cleanArrayRow[adjustmentIndex]);
		 }
		 reorderedSamples.push(thisRowOfReorderedSamples);
	}
	
	/**
	console.log("Original Samples");
	console.log(theSamples);
	console.log("Adjusted Samples");
	console.log(reorderedSamples);
	**/
	return reorderedSamples;
}

var orderDiffersById = function(listOfNodes)
{
	for (var index=0; index < listOfNodes.length; index++)
	{
		var currentNode = listOfNodes[index];
		var currentNodeId = currentNode.id;
		var currentNodeOrderId = currentNode.orderId;
		
		if (currentNodeId != currentNodeOrderId)
		{
			//console.log("orderDiffersById");
			//console.log("true");
			return true;
		}
	}
	//console.log("orderDiffersById");
	//console.log("false");
	return false;
}

var sampleNode = function(node, sample) {
	var parents = getNodeParents(node);
	// console.log("Parents " + parents);
	if(parents.length > 0) {
		parents.forEach(function(p) {
			var currParent = nodes.filter(function(n) { return n.id === p})[0];
			if(currParent.sampled === false) {
				sampleNode(currParent, sample);
			}
			else if(!currParent.sampled){
				console.log("currParent is undefined");
			}
		})
	}
	var value = doSampling(node, parents, sample);
	// console.log(value);
	var nodeId = node.id;
	sample[nodeId] = value;
	node.sampled = true;
}

var setSamplingStatus = function(fixed) {
	//set all nodes state to not sampled
	for (var n in nodes) {
		nodes[n].sampled = false;
	}
	// console.log(fixed);
	for(var id in fixed) {
		var fixedNode = nodes.filter(function(node){
			return node.id === parseInt(id);
		})[0];
		fixedNode.sampled = true;
		// nodes[id].sampled = true;
	}
	return true;
}

var singleSample = function(fixed) {
	
	var currSample = {};
	//fix any values if any have been chosen
	for (var id in fixed) {
		if(fixed[id] !== "none") {
			currSample[id] = fixed[id];
		}
	}
	// console.log(currSample);

	//set nodes status to not sampled if not fixed
	setSamplingStatus(currSample);
	
	//sample each node that has not been sampled
	nodes.forEach(function(n) {
		if(!n.sampled) {
			sampleNode(n, currSample);
		}
	})
	return currSample;
}

var resample = function(numSamples, fSample) {
	var samples = [];
	for (var i=0; i< numSamples; i++) {
		// console.log(fSample);
		var sample = singleSample(fSample);
		samples.push(sample);
	}
	
	//get nodes status back to false
	setSamplingStatus();
	//display the samples
	displaySamples(samples, numSamples, fSample);
}

var getSampleIndiciesFromNodeIds = function(nodeIdList)
{
	var indicies = [];

	if (orderDiffersById(nodes)==false)
	{
		
		var sampleIndex = 0;
		for(var n in nodes) {
			if(nodeIdList.includes(nodes[n].id))
			{
				indicies.push(sampleIndex);
			}
			sampleIndex = sampleIndex + 1;
		}

	}
	else
	{
		for(var n in nodes) {
			if(nodeIdList.includes(nodes[n].id))
			{
				var indexToAdd = orderIdNames.findIndex(nodes[n].title);
				indicies.push(indexToAdd);
			}
		}
	}
	return indicies;
	
}

var sampleTblColumnNames = function(){
	// set order id variables
	setDisplayOrderAndMapping();
	
	var names = [];
	var columns = "";

	if (orderDiffersById(nodes)==false)
	{
		for(var n in nodes) {
			names.push(nodes[n].title);
		}
	}
	else
	{
		names = orderIdNames;
	}
	// console.log("sampleTblColumnNames - names");
	// console.log(names);
	
	for (var name in names) {
		columns += '<th>' + names[name] + '</th>';
	}

	d3.select(".sample-tbl")
	  .append("thead")
	  .append("tr")
	  //.html(columns);
	return names;
}

var summaryTblColumnNames = function(){
	// set order id variables
	setDisplayOrderAndMapping();
	
	var names = [];
	var columns = ""
	
	if (orderDiffersById(nodes)==false)
	{
		for(var n in nodes) {
			names.push(nodes[n].title);
		}
	}
	else
	{
		names = orderIdNames;
	}
	//console.log("summaryTblColumnNames - names");
	//console.log(names);
	
	for (var name in names) {
		columns += '<th>' + names[name] + " Experienced Issue" + '</th>';
	}
	d3.select(".sample-tbl")
	  .append("thead")
	  .append("tr")
	  .html(columns);
}

var formatSamplesDownload = function(samples) {
	var sampleArray = [];
	setDisplayOrderAndMapping();
	
	
	//first row is the titles
	var titles = [];


	if (orderDiffersById(nodes)==false)
	{
		nodes.forEach(function(node) {
			titles.push(node.title + " Experienced Issue");
		})
	}
	else
	{
		for (var index = 0; index<orderIdNames.length; index++)
		{
			titles.push(orderIdNames[index] + " Rung Achieved");
		}
	}
	titles.push("Overall System Resilience");
	
	
	sampleArray.push(titles);
	var len = titles.length;
	var nodesToExitLadder = getExitNodeIds();
	var sampleIndicies = getSampleIndiciesFromNodeIds(nodesToExitLadder);
	// get percentage of samples in columns sampleIndicies that have a yes
	var totalExitNodesCompromised = 0;
		for (var s in samples) {
			var numberOfYes = 0;
			for (var val in sampleIndicies) {
				var dict = samples[s];
				var dictVal = new Array(); 

				for (var key in dict) {
				  var buffer_var = dict[key];
				  dictVal.push(buffer_var);
				}
				
	 			if (dictVal[sampleIndicies[val]] == 'yes')
	 			{
					numberOfYes = numberOfYes + 1;
				}
			}
			if (numberOfYes > 0)
			{
				totalExitNodesCompromised = totalExitNodesCompromised + 1;
			}
		}
	
	var systemResilienceComputation = (totalExitNodesCompromised / samples.length);
	systemResilienceComputation = systemResilienceComputation * 100;
	systemResilienceComputation = 100.00 - systemResilienceComputation;
	systemResilienceComputation = systemResilienceComputation.toFixed(2);

	//the actual samples
	var newSum = new Array(len).fill(0);
	samples.forEach(function(sample) {
	var sampleIndex = 0;
		for (var val in sample) {
			// console.log(sample[val]);
			if (sample[val] == 'yes')
			{
				newSum[sampleIndex] = newSum[sampleIndex] + 1;
			}
			sampleIndex = sampleIndex + 1;
		}
	})
	for (var i = 0; i < newSum.length-1; i++) {
		newSum[i] = (newSum[i] / samples.length);
		newSum[i] = (newSum[i]*100).toFixed(2);
		newSum[i] = (newSum[i]) + "% of samples";
	}
	newSum[newSum.length-1] = systemResilienceComputation;
	sampleArray.push(newSum);
	//example used from http://stackoverflow.com/questions/14964035/how-to-export-javascript-array-info-to-csv-on-client-side
	var csvData = "";
	sampleArray.forEach(function(singleRow, index){
		var currRow = singleRow.join(",");
		csvData += index < sampleArray.length ? currRow + '\n' : currRow;
	})

	return csvData;

}

var formatSamplesDownloadRaw = function(samples) {
	setDisplayOrderAndMapping();
	var sampleArray = [];

		//first row is the titles
		var titles = [];
		
		if (orderDiffersById(nodes)==false)
		{
			nodes.forEach(function(node) {
				titles.push(node.title);
			})
		}
		else
		{
			for (var index = 0; index<orderIdNames.length; index++)
			{
				titles.push(orderIdNames[index]);
			}
		}

		sampleArray.push(titles);

		//the actual samples
		samples.forEach(function(sample) {
			var newRow = [];
			for (var val in sample) {
				// console.log(sample[val]);
				newRow.push(sample[val]);
			}
			sampleArray.push(newRow);
		})

		//example used from http://stackoverflow.com/questions/14964035/how-to-export-javascript-array-info-to-csv-on-client-side
		var csvData = "";
		sampleArray.forEach(function(singleRow, index){
			var currRow = singleRow.join(",");
			csvData += index < sampleArray.length ? currRow + '\n' : currRow;
		})

		return csvData;
}

var downloadSamplesRaw = function(filename, samples) {
	//format the data to be downloaded
	var sampleData = formatSamplesDownloadRaw(samples);

	var blob = new Blob([sampleData], {type:"text/csv;charset=utf-8"});

	//on empty input - give an alert message
	if (!isEmptyString(filename)) {
		filename = filename + ".csv";
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

var downloadSamples = function(filename, samples) {
	//format the data to be downloaded
	var sampleData = formatSamplesDownload(samples);

	var blob = new Blob([sampleData], {type:"text/csv;charset=utf-8"});

	//on empty input - give an alert message
	if (!isEmptyString(filename)) {
		filename = filename + ".csv";
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

var displayCompromisedSimResults = function(samples, noSample, fSample) {
	//clear the display space
	clearDisplayField();

	var btnGroup = control.append("div")
		   				  .attr("class", "btn-group")
						  .attr("role", "group");
	//sample again btn
	btnGroup.append("button")
		   .attr("class", "btn btn-default btn-bayes-grp")
		   .attr("id", "resample")
		   .html("Rerun Sim")
		   .on("click", function(){
		   	resample(noSample, fSample);
		   });

	//download summary button
	btnGroup.append("button")
		   .attr("class", "btn btn-default btn-bayes-grp")
		   .attr("id", "sampleDownloadBtn")
		   .html("Results")
		   .on("click", function() {
		   	specifyDownloadName(2, ".csv", samples);
		   	// downloadSamples(samples);
		   });
	//reset btn
	btnGroup.append("button")
		   .attr("class", "btn btn-default btn-bayes-grp")
		   .attr("id", "reset")
		   .html("Clear")
		   .on("click", function(){
		   	compromiseRungSettings();
		   });

	control.append("hr");

		//warning message
		var warningDiv = control.append("div")
								.attr("class", "alert-text alert alert-warning")
		warningDiv.append("span")
				  .attr("class", "glyphicon glyphicon-info-sign")
				  .attr("aria-hidden", "true");
		warningDiv.append("span")
				  .attr("class", "sr-only")
				  .text("Warning");
		var text = warningDiv.html() + "Simulation information given the parts of the evacuation routes that experienced issues are shown below. If you wish to download the simulation results, download by clicking the \'Results\' button."
		warningDiv.html(text);

	// append table for the results
	var sampleTbl;
	sampleTbl = control.append("div")
						   .attr("class", "table-responsive sample-table")
						   .append("table")
	  	   				   .attr("class", "table table-bayes sample-tbl");
						   
	// count the cols.
	 var colCount = 0;
     for (var s in samples.slice(0,1)) {
		 colCount = 0;
		 for (var val in samples[s]) {
			 colCount = colCount + 1;
		 }
	 }
	 
 	// prep for summary data
 	var newSum = new Array(colCount).fill(0);
	
 	var samplesCount = 0;
 	for (var s in samples) {
 		var newSumIndex = 0;
 		for (var val in samples[s]) {
 			if (samples[s][val] == 'yes')
 			{
 				newSum[newSumIndex] = newSum[newSumIndex] + 1;
 			}
 			newSumIndex = newSumIndex + 1;
 		}
 		samplesCount = samplesCount + 1;
 	}
	
	// compute summary data
	for (var i = 0; i < newSum.length; i++) {

		newSum[i] = (newSum[i] / samplesCount);
		newSum[i] = (newSum[i]*100).toFixed(2);
		newSum[i] = (newSum[i]) + "% of sims";
	}
	 
    //append the summary columns names
	summaryTblColumnNames();
	
	var sampleTblBody = sampleTbl.append("tbody");
	var accumulator = "";
	for (var i = 0; i < newSum.length; i++) {
		accumulator += '<td>' + newSum[i] + '</td>';
	}
	sampleTblBody.append("tr").html(accumulator);

}

var displaySamples = function(samples, noSample, fSample) {
	//clear the display space
	clearDisplayField();
	
	setDisplayOrderAndMapping();
	if (orderDiffersById(nodes)==true)
	{ 
		samples = readjustSamples(samples);
	}

	var btnGroup = control.append("div")
		   				  .attr("class", "btn-group")
						  .attr("role", "group");
	//sample again btn
	btnGroup.append("button")
		   .attr("class", "btn btn-default btn-bayes-grp")
		   .attr("id", "resample")
		   .html("Resample")
		   .on("click", function(){
		   	resample(noSample, fSample);
			resetNodeTitles();
		   });

	//download summary button
	btnGroup.append("button")
		   .attr("class", "btn btn-default btn-bayes-grp")
		   .attr("id", "sampleDownloadBtn")
		   .html("Summary")
		   .on("click", function() {
		   	specifyDownloadName(2, ".csv", samples);
		   	// downloadSamples(samples);
		   });
	//download button
	btnGroup.append("button")
	 		.attr("class", "btn btn-default btn-bayes-grp")
	 		.attr("id", "sampleDownloadRawBtn")
	 		.html("Samples")
	 		.on("click", function() {
	 		 specifyDownloadName(4, ".csv", samples);
	 		// downloadSamplesRaw(samples);
	 	 });
	//reset btn
	btnGroup.append("button")
		   .attr("class", "btn btn-default btn-bayes-grp")
		   .attr("id", "reset")
		   .html("Reset")
		   .on("click", function(){
			resetNodeTitles();
		   	samplingSettings();
		   });
	//remove node labels btn
	btnGroup.append("button")
		   .attr("class", "btn btn-default btn-bayes-grp")
		   .attr("id", "reset")
		   .html("Node Labels")
		   .on("click", function(){
		   	toggleNodeLabels();
		   });
				
	var fileHeader = control.append("div");
	
	if (typeof docxFilename !== 'undefined' && docxFilename !== null && docxFilename !== "none") {
		var btnGroup2 = control.append("div")
		   				  .attr("class", "btn-group")
						  .attr("role", "group");
		btnGroup2.append("button")
		   .attr("class", "btn btn-default btn-bayes-grp2")
		   .attr("id", "reset")
		   .html("")
		   .on("click", function(){
			appendReport();
		   });
 	    control.append("hr");
	}
	else {
		docxFilename ='none';
	}
	var filenameText = fileHeader.html() + "" + "<hr>"
	fileHeader.html(filenameText);


	//display the first 10 samples only
	//if more than that -> warn the users to download the rest
	if(noSample > 10) {
		//warning message
		var warningDiv = control.append("div")
								.attr("class", "alert-text alert alert-warning")
		warningDiv.append("span")
				  .attr("class", "glyphicon glyphicon-info-sign")
				  .attr("aria-hidden", "true");
		warningDiv.append("span")
				  .attr("class", "sr-only")
				  .text("Warning");
		var text = warningDiv.html() + " Summary information for each location in the evacuation route is shown below. Then the first 10 samples are displayed. If you wish to view all the samples, download them by clicking the \'Samples\' button. If you wish to download the summary data, download by clicking the \'Summary\' button."
		warningDiv.html(text);
	}
	var nodesToExitLadder = getExitNodeIds();
	var sampleIndicies = getSampleIndiciesFromNodeIds(nodesToExitLadder);
	// get percentage of samples in columns sampleIndicies that have a yes
	var totalExitNodesCompromised = 0;
		for (var s in samples) {
			var numberOfYes = 0;
			for (var val in sampleIndicies) {
				var dict = samples[s];
				var dictVal = new Array(); 

				for (var key in dict) {
				  var buffer_var = dict[key];
				  dictVal.push(buffer_var);
				}
				
	 			if (dictVal[sampleIndicies[val]] == 'yes')
	 			{
					numberOfYes = numberOfYes + 1;
				}
			}
			if (numberOfYes > 0)
			{
				totalExitNodesCompromised = totalExitNodesCompromised + 1;
			}
		}

	var systemResilienceComputation = (totalExitNodesCompromised / samples.length);
	systemResilienceComputation = systemResilienceComputation * 100;
	systemResilienceComputation = 100.00 - systemResilienceComputation;
	systemResilienceComputation = systemResilienceComputation.toFixed(2);
	
	var resilienceHeader = control.append("div");
	if (typeof previousSystemResilienceComputation === 'undefined' || previousSystemResilienceComputation === null) {
		resilienceText = resilienceHeader.html() + 
			"<h4>Overall System Resilience: " + systemResilienceComputation + " </h4><hr>" +
			"<p>System Resilience is measured on a 0 (not resilient) - 100 (extremely resilient) scale. " + 
			"It reflects the percentage of samples where the final location of any evacuation route could not be reached.</p><hr>";
	} else {
		resilienceText = resilienceHeader.html() + 
			"<h4>Overall System Resilience: " + systemResilienceComputation + " </h4><hr>" +
			"<h5>Previous Overall System Resilience: " + previousSystemResilienceComputation + " </h5><hr>" +
			"<p>System Resilience is measured on a 0 (not resilient) - 100 (extremely resilient) scale. " + 
			"It reflects the percentage of samples where the final location of any evacuation route could not be reached.</p><hr>";
	}
	var resilienceEvent = new CustomEvent("previousResilience", { detail: {systemResilienceComputation} });
	document.dispatchEvent(resilienceEvent);
	//var resilienceText = resilienceHeader.html() + "<h4>Overall System Resilience: "+ systemResilienceComputation + " </h4><hr><p>System Resilience is measured on a 0 (not resilient) - 100 (extremely resilient) scale. It reflects the percentage of samples where any end rung of the attack ladder is compromised.</p><hr>";
	resilienceHeader.html(resilienceText);


	
						   
	// count the cols.
	 var colCount = 0;
     for (var s in samples.slice(0,1)) {
		 colCount = 0;
		 for (var val in samples[s]) {
			 colCount = colCount + 1;
		 }
	 }
	 
 	// prep for summary data
 	var newSum = new Array(colCount).fill(0);
	
 	var samplesCount = 0;
 	for (var s in samples) {
 		var newSumIndex = 0;
 		for (var val in samples[s]) {
 			if (samples[s][val] == 'yes')
 			{
 				newSum[newSumIndex] = newSum[newSumIndex] + 1;
 			}
 			newSumIndex = newSumIndex + 1;
 		}
 		samplesCount = samplesCount + 1;
 	}
	
	// compute summary data
	for (var i = 0; i < newSum.length; i++) {

		newSum[i] = (newSum[i] / samplesCount);
		newSum[i] = (newSum[i]*100).toFixed(2);
		newSum[i] = (newSum[i]) + "% of samples";
	}

	// append table for the results
	var sampleTbl;
	sampleTbl = control.append("div")
						   .attr("class", "table-responsive sample-table")
						   .append("table")
	  	   				   .attr("class", "table table-bayes sample-tbl");
	 
    //append the summary columns names
	summaryTblColumnNames();
	
	// console.log(detectionScoreDict)
	// console.log(visibilityScoreDict)
	var sampleTblBody = sampleTbl.append("tbody");
	var accumulator = "";
	var names = sampleTblColumnNames();
	var nameColor = ""
	var colorDict = {}
	var mimirDictDet = {}
	var mimirDictVis = {}
	var mimirColor = {1: '#FF0000', 2: '#FFA500', 3: '#FFFF00', 4: '#9BE52A', 5: '#008000'};

	function colorGradient(percentage) {
		const componentToHex = c => {
			const hex = c.toString(16);
			return hex.length === 1 ? "0" + hex : hex;
		};
	
		const gradient = (start, end, factor) => start + (end - start) * factor;	
		const green = { r: 0, g: 255, b: 0 };
		const yellow = { r: 255, g: 255, b: 0 };
		const red = { r: 255, g: 0, b: 0 };
	
		let start, end;
		if (percentage <= 50) {
			start = green;
			end = yellow;
			percentage *= 2;
		} else {
			start = yellow;
			end = red;
			percentage = (percentage - 50) * 2; 
		}
	
		const r = Math.round(gradient(start.r, end.r, percentage / 100));
		const g = Math.round(gradient(start.g, end.g, percentage / 100));
		const b = Math.round(gradient(start.b, end.b, percentage / 100));
	
		return `#${componentToHex(r)}${componentToHex(g)}${componentToHex(b)}`;
	}

	let samplingDict = {}
	for (var i = 0; i < newSum.length; i++) {
		var percentage = parseFloat(newSum[i].replace("% of samples", "").trim()); 
		
		var nodeTitle = names[i]
		samplingDict[nodeTitle] = percentage
		color = colorGradient(percentage)	
		
		colorDict[nodeTitle] = color 

		if (typeof detectionScoreDict !== 'undefined') {
			// detectionScoreDict is pulled from app.js using event listener linked to mimir upload
			mimirNodeColor = detectionScoreDict[nodeTitle]
			mimirDictDet[nodeTitle] = mimirColor[mimirNodeColor]
		  }
		if (typeof visibilityScoreDict !== 'undefined') {
			// detectionScoreDict is pulled from app.js using event listener linked to mimir upload
			mimirNodeColor = visibilityScoreDict[nodeTitle]
			mimirDictVis[nodeTitle] = mimirColor[mimirNodeColor]
		  }
		
		textColor = "black"
		
		accumulator += '<td style="color:' + textColor + '">' + newSum[i] + '</td>';
		nameColor += '<td style="color:' + textColor + '"><strong>' + names[i] + '</strong></td>';
	}		
	
	//d3.selectAll("*") is used to select all elements and then filter them based on their bound data
	if (isCheckboxChecked) {
		d3.selectAll('*').filter(function(d) {
		return d && colorDict.hasOwnProperty(d.title);
	}).style('fill', function(d) {
		return colorDict[d.title];
	}).style("stroke","black").style("stroke-width", 1.5);
	if (typeof detectionScoreDict !== 'undefined') {
		//Check if event listener was trigger in app.js
		btnGroup.append("button")
			.attr("class", "btn btn-default btn-bayes-grp")
			.attr("id", "halos")
			.html("Detection") // Initial label
			.on("click", function() {
				mimirHalos(); // Function that toggles the visibility of the node labels
			});

		d3.selectAll('*').filter(function(d) {
			return d && mimirDictDet.hasOwnProperty(d.title);
		}).each(function(d) {
			// Append a new circle for the border with a slightly larger radius
			d3.select(this).insert("circle", ":first-child") // This ensures the border circle is behind the original circle
				.attr("r",27)
				.style("fill", "none") 
				.style("stroke",mimirDictDet[d.title])
				.style("stroke-width", 12); 
		});
	}}
	else {
		d3.selectAll('*').filter(function(d) {
			return d && colorDict.hasOwnProperty(d.title);
		}).style('fill','white').style("stroke","black").style("stroke-width", 1.5);
	}
	// Toggle node title display
	var toggleNodeLabels = function() {
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
			var nodeTitle = d3.select(this);
			var isOriginalTitle = nodeTitle.attr('data-original-title') !== 'true';
			nodeTitle.selectAll("*").remove(); 
	
			if (isOriginalTitle) {
				if (samplingDict.hasOwnProperty(d.title)) {
					var titleText = String(samplingDict[d.title]);
					var lines = titleText.split(" ");
					lines.forEach(function(line, i) {
						nodeTitle.append('tspan')
						//Adjust values for sampling % positioning 
						.attr('x', 0)
						.attr('dy', i ? '1em' : 0)
						.text(line);
					});
					nodeTitle.attr('data-original-title', 'true');
				}
			} else {
					var circleElem = d3.selectAll(".node")
									.filter(function(n) { 
										return (n.id === d.id)
									});
					//update the circle title
					multipleLinesText(d.title, circleElem);
					//Retain the adjusted fixed node titles
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

				nodeTitle.attr('data-original-title', 'false');
			}
		});
	}

	var resetNodeTitles = function() {

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
				//nodeTitle.attr('data-original-title', 'false');
			//}
		});
	}
	let mimirScore = true;
	function mimirHalos() {	
		// Toggle the halo state variable
		mimirScore = !mimirScore;

		if (mimirScore === true) {
			d3.selectAll('*').filter(function(d) {
				return d && mimirDictDet.hasOwnProperty(d.title);
			}).each(function(d) {
				// Within each matching element, select the inserted circle by its unique attributes
				d3.select(this).selectAll("circle")
					.filter(function() {
						let r = d3.select(this).attr("r");
						let strokeWidth = d3.select(this).style("stroke-width");
						return r == 27 && strokeWidth == "12px"; 
					})
					.remove();
				});

			d3.selectAll('*').filter(function(d) {
				return d && mimirDictDet.hasOwnProperty(d.title);
			}).each(function(d) {
				// Append a new circle for the border with a slightly larger radius
				d3.select(this).insert("circle", ":first-child") // This ensures the border circle is behind the original circle
					.attr("r",27)
					.style("fill", "none") 
					.style("stroke",mimirDictDet[d.title])
					.style("stroke-width", 12);
		})}
		else{
			d3.selectAll('*').filter(function(d) {
				return d && mimirDictVis.hasOwnProperty(d.title);
			}).each(function(d) {
				// Within each matching element, select the inserted circle by its unique attributes
				d3.select(this).selectAll("circle")
					.filter(function() {
						let r = d3.select(this).attr("r");
						let strokeWidth = d3.select(this).style("stroke-width");
						return r == 27 && strokeWidth == "12px"; 
					})
					.remove();
				});

			d3.selectAll('*').filter(function(d) {
				return d && mimirDictVis.hasOwnProperty(d.title);
			}).each(function(d) {
				// Append a new circle for the border with a slightly larger radius
				d3.select(this).insert("circle", ":first-child") // This ensures the border circle is behind the original circle
					.attr("r",27)
					.style("fill", "none") 
					.style("stroke",mimirDictVis[d.title])
					.style("stroke-width", 12);
		
		})};
		// Update the button's label based on the current state
		d3.select("#halos").html(mimirScore ? "Detection" : "Visibility");
	};
	

	sampleTblBody.append("tr").html(accumulator);
	sampleTblBody.append("tr").html(nameColor);

    //append the columns names
    //sampleTblColumnNames();

    // print out first 10 cols
	var sampleTblBody = sampleTbl.append("tbody");
	var accumulator = "";
	for (var s in samples.slice(0,10)) {
		for (var val in samples[s]) {
			accumulator += '<td>' + samples[s][val] + '</td>';
			colCount = colCount + 1;
		}
		sampleTblBody.append("tr").html(accumulator);
		accumulator = "";
	}
	var appendReport = function() {
		var appendEvent = new CustomEvent("appendTriggered", { detail: { } });
		document.dispatchEvent(appendEvent);
	};
	reportDictArray=[mimirDictDet,mimirDictVis,systemResilienceComputation]
	var samplingEvent = new CustomEvent("samplingTriggered", { detail: { reportDictArray, systemResilienceComputation, samplingDict} });
	document.dispatchEvent(samplingEvent);

}

var checkExistingCpts = function() {
	//check for all nodes that their cpt have been initialised
	var titles = [];
	for (var n in nodes) {
		if (!nodes[n].tbl)
			titles.push(nodes[n].title);
	}
	if(titles.length !== 0) {
		// alert("Rungs \"" + titles + "\" need their CPTs initialised.");
		bootbox.dialog({
		  message: "Rungs \"" + titles + "\" need their CPTs initialised.",
		  buttons: {
		    main: {
		      label: "OK",
		      className: "btn-bayes-short",
		    },
		  }
		});
		return false;
	}
	return true;
}

// calculate in advance the time needed for 100 samples to inform the user
var estimatedSampling = function() {
	var estimatedSamples = 100;
	var start = new Date().getTime();
	// console.log(start);
	for(var i=0; i<estimatedSamples; i++) {
		singleSample();
	}
	var stop = new Date().getTime();
	// console.log(stop);
	var time = (stop - start)/1000;
	// console.log(time);

	//info message
	var infoDiv = control.append("div")
						.attr("class", "alert-text alert alert-info")
	infoDiv.append("span")
			  .attr("class", "glyphicon glyphicon-cog")
			  .attr("aria-hidden", "true");
	infoDiv.append("span")
			  .attr("class", "sr-only")
			  .text("Info");
	var text = infoDiv.html() + " Estimated time for sampling 100 samples is " + time + " seconds.";
	infoDiv.html(text);
}

var ancestralSamplingForCompromise = function(fSample) {
	//remove previous error messages
	d3.selectAll(".alert-text").remove();

	//get the number of samples to be made
	var noOfSamples = 1000;

	var success = checkExistingCpts();
	if (!success) {
		return;
	}

	var samples = [];
	for (var i=0; i< noOfSamples; i++) {
		// console.log(fSample);
		var sample = singleSample(fSample);
		samples.push(sample);
	}

	//get nodes status back to false
	setSamplingStatus();
	//display the samples
	displayCompromisedSimResults(samples, noOfSamples, fSample);
}

var ancestralSampling = function(fSample) {
	//remove previous error messages
	d3.selectAll(".alert-text").remove();

	//get the number of samples to be made
	var noOfSamples = parseInt(d3.select("#num-samples-input").node().value);
	if(isNaN(noOfSamples) || noOfSamples <= 0) {
		//error message
		var errorDiv = control.insert("div", "#num-samples-input")
							   .attr("class", "alert-text alert alert-danger");
		errorDiv.append("span")
				.attr("class", "glyphicon glyphicon-exclamation-sign")
				.attr("aria-hidden", "true");
		errorDiv.append("span")
				.attr("class", "sr-only")
				.text("Error");
		var text = errorDiv.html() + " Enter a positive integer for a number of samples.";
		errorDiv.html(text);
		return;
	}

	var success = checkExistingCpts();
	if (!success) {
		return;
	}

	console.time("mytimer");
	var samples = [];
	for (var i=0; i< noOfSamples; i++) {
		var sample = singleSample(fSample);
		samples.push(sample);
	}
	console.timeEnd("mytimer");

	//get nodes status back to false
	setSamplingStatus();
	//display the samples
	displaySamples(samples, noOfSamples, fSample);
	var filenameEvent = new CustomEvent("numOfSamples", { detail: { noOfSamples } });	
	document.dispatchEvent(filenameEvent);
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
	});
}

var compromiseRungSettings = function(){
	// clear the display field
	clearDisplayField();
	// deselect if there is a selected node
	selectedNode = null;
	refresh();

	control.append("hr");
	//mitre attack message
    var desiredLink = 'https://attack.mitre.org/groups/';
	var desiredText = 'MITRE ATT&CK Groups Data';
	
	var mitreAttack = control.append("div")
							.attr("class", "alert-text alert alert-warning")
	mitreAttack.append("span")
			  .attr("class", "glyphicon glyphicon-info-sign")
			  .attr("aria-hidden", "true");
	mitreAttack.append("span")
			  .attr("class", "sr-only")
			  .text("");
	var text = mitreAttack.html() + "Exploring "+  "<a href="+desiredLink+" target=_blank>"+desiredText+"</a>"+ 
			  " may be useful in setting compromised rungs."
	//mitreAttack.html(text);
	
	//keep the fixed values here
	var fixedSamples = {};
	nodes.forEach(function(node){
		fixedSamples[node.id] = "none";
	})

	//number of samples
	control.append("button")
		   .attr("class", "btn btn-default btn-bayes-short margin-btn")
		   .attr("id", "runSamplingBtn")
		   .html("Run")
		   .on("click", function(){
				ancestralSamplingForCompromise(fixedSamples);
		   });

	//fixed ancestral sampling
	control.append("hr");
	control.append("label")
		   .attr("for", "fixed-sampling-div")
		   .attr("class", "label-text")
		   .text("Specify any compromised rungs:");
	var fixedTbl = control.append("div")
		   .attr("class", "table-responsive sample-table")
		   .attr("id", "fixed-sampling-div")
		   .append("table")
		   .attr("class", "table table-bayes");
	nodes.forEach(function(node) {
		var row = fixedTbl.append("tr");

		//append node titles
		row.append("td").text(node.title);
		//append selects with values
		var select = row.append("td")
							 .append("select")
							 .attr("id", node.id)
							 .attr("class", "form-control")
							 .on("change", function(){
							 	fixedSamples[this.id] = this.options[this.selectedIndex].value;
							 	// console.log(fixedSamples);
							 });

		//default option
		select.append("option")
			  .attr("value", "none")
			  .attr("selected", true)
			  .text("Experienced Issue?")//?
		//all possible nodes
		node.values.forEach(function(value) {
			if (value == "yes")
			{
		select.append("option")
		      .attr("value", "yes")
		      .text("yes");
			}
		});
	})
}

var samplingSettings = function(){
	var titles = nodes.map(function(node) {
		return node.title;
	});
	d3.selectAll('*').filter(function(d) {
		return d && titles.includes(d.title);
	}).style('fill', 'white').style("stroke","black").style("stroke-width", 1.5);

	// Reset node titles to their original text and ensure visibility
	d3.selectAll('*').filter(function(d) {
		return d && titles.includes(d.title);
	}).selectAll('.node-title')
	.each(function(d) {
		var circleElem = d3.selectAll(".node")
						.filter(function(n) { 
							return (n.id === d.id)
						});
		//update the circle title
		multipleLinesText(d.title, circleElem);
	});
		
	// clear the display field
	clearDisplayField();
	// deselect if there is a selected node
	selectedNode = null;
	refresh();

	//keep the fixed values here
	var fixedSamples = {};
	nodes.forEach(function(node){
		fixedSamples[node.id] = "none";
	})
	
	var total_techniques = 0;
	nodes.forEach(function(node){
		for (var i=0; i<node.vulnerabilities.length; i++)
		{
			var label_for_this_vulnerability = node.vulnerabilities[i];
			var index_in_large_vulnerability_array = vulnerability_vector.indexOf(node.vulnerabilities[i]);
			var techinques_for_this_vulnerability =  associated_vulnerability_techniques_vector[i].split("|");
			total_techniques = total_techniques + techinques_for_this_vulnerability.length;
		}
		for (var i=0; i<node.functionalities.length; i++)
		{
			var label_for_this_functionality = node.functionalities[i];
			var index_in_large_functionality_array = functionality_vector.indexOf(node.functionalities[i]);
			var techinques_for_this_functionality =  associated_functionality_techniques_vector[i].split("|");
			total_techniques = total_techniques + techinques_for_this_functionality.length;
		}
		total_techniques = total_techniques + node.attack_techniques.length;
	})
	
	
	var node_sampling_values = new Array();

	nodes.forEach(function(node){
		var value_to_push = "none";
		for (var i=0; i<node.vulnerabilities.length; i++)
		{
			var label_for_this_vulnerability = node.vulnerabilities[i];
			var index_in_large_vulnerability_array = vulnerability_vector.indexOf(node.vulnerabilities[i]);
			var techinques_for_this_vulnerability =  associated_vulnerability_techniques_vector[index_in_large_vulnerability_array].split("|");
			for (j=0; j<techinques_for_this_vulnerability.length; j++)
			{
				var current_technique = techinques_for_this_vulnerability[j].trim();
				if (attack_group_techniques.indexOf(current_technique) != -1)
				{
					value_to_push = "yes"
				}
			}
		}
		for (var i=0; i<node.functionalities.length; i++)
		{
			var label_for_this_functionality = node.functionalities[i];
			var index_in_large_functionality_array = functionality_vector.indexOf(node.functionalities[i]);
			var techinques_for_this_functionality =  associated_functionality_techniques_vector[index_in_large_functionality_array].split("|");
			for (j=0; j<techinques_for_this_functionality.length; j++)
			{
				var current_technique = techinques_for_this_functionality[j].trim();
				if (attack_group_techniques.indexOf(current_technique) != -1)
				{
					value_to_push = "yes"
				}
			}
		}
		for (var i=0; i<node.attack_techniques.length; i++)
		{
			var current_technique = node.attack_techniques[i].trim();
			if (attack_group_techniques.indexOf(current_technique) != -1)
			{
				value_to_push = "yes"
			}
		}
		
		node_sampling_values.push(value_to_push);
	})

	if (attack_group_techniques.length > 0 && total_techniques > 0)
	{
		var loop_index =0;
		nodes.forEach(function(node){
			fixedSamples[node.id] = node_sampling_values[loop_index];
			loop_index = loop_index + 1;
		})
	}

	// estimated time for sampling
	estimatedSampling();
	control.append("hr");
	//mitre attack message
    var desiredLink = 'https://attack.mitre.org/groups/';
	var desiredText = 'MITRE ATT&CK Group Data';
	
	var mitreAttack = control.append("div")
							.attr("class", "alert-text alert alert-warning")
	mitreAttack.append("span")
			  .attr("class", "glyphicon glyphicon-info-sign")
			  .attr("aria-hidden", "true");
	mitreAttack.append("span")
			  .attr("class", "sr-only")
			  .text("");
	var text = mitreAttack.html() + "Sampling more than 10,000 times may require more than 10 seconds of compute time."
	
	mitreAttack.html(text);
   
	control.append("label")
		.attr("for", "num-samples-input")
		.attr("class", "label-text")
		.text("Choose number of samples:")
	control.append("input")
	  	   .attr("id", "num-samples-input")
		   .attr("type", "number")
		   .attr("min", "1");
	control.append("button")
		   .attr("class", "btn btn-default btn-bayes-short margin-btn")
		   .attr("id", "runSamplingBtn")
		   .html("Run")
		   .on("click", function(){
				ancestralSampling(fixedSamples);
		   });
	var checkboxContainer = control.append("div");

	checkboxContainer.append("label")
		   .attr("for", "myCheckbox")
		   .attr("class", "checkbox-text")
		   .text("Check to apply colors to nodes:  ");
	checkboxContainer.append("input")
		   .attr("type", "checkbox")
		   .attr("id", "myCheckbox")
		   .attr("class", "your-checkbox-class") 
		   .property("checked", isCheckboxChecked) 
		   .on("change", function() {
				isCheckboxChecked = d3.select(this).property("checked");
		   });
		   
	//fixed ancestral sampling
	control.append("hr");
	control.append("label")
		   .attr("for", "fixed-sampling-div")
		   .attr("class", "label-text")
		   .text("Fix the values of any of the rungs:");
	var fixedTbl = control.append("div")
		   .attr("class", "table-responsive sample-table")
		   .attr("id", "fixed-sampling-div")
		   .append("table")
		   .attr("class", "table table-bayes");
	
	var node_sampling_values_index=0;
	var attackGroupEvent = new CustomEvent("fixedSamplesAdded", { detail: { fixedSamples } });
	document.dispatchEvent(attackGroupEvent);
		   
	nodes.forEach(function(node) {
		var row = fixedTbl.append("tr");
		var current_node_sample_value = node_sampling_values[node_sampling_values_index];
		node_sampling_values_index = node_sampling_values_index + 1;
		//append node titles
		row.append("td").text(node.title);
		//append selects with values
		var select = row.append("td")
							 .append("select")
							 .attr("id", node.id)
							 .attr("class", "form-control")
							 .on("change", function(){
							 	fixedSamples[this.id] = this.options[this.selectedIndex].value;
							 });
		
		// if attack group not loaded.
		if (attack_group_techniques.length == 0 || total_techniques == 0)
		{
			//default option
			select.append("option")
				  .attr("value", "none")
				  //.attr("selected", true)
				  .text("Not fixed")//?
			//all possible values for this node
			node.values.forEach(function(value) {
				select.append("option")
				      .attr("value", value)
				      .text(value);
			});
		}
		else
		{
			// if attack group is loaded: no default just set based on attack group
			//default option
			
			if (current_node_sample_value == "yes")
			{
				select.append("option")
				  .attr("value", "none")
				  .text("Not Fixed")
		  	 	select.append("option")
	      		 .attr("value", "yes")
				 .attr("selected", true)
	      		 .text("yes");		  	 	
				select.append("option")
	      		 .attr("value", "no")
	      		 .text("no");
			}
			else
			{
				select.append("option")
			  		.attr("value", "none")
			  		.attr("selected", true)
			  		.text("Not Fixed")
	  	 		select.append("option")
      		 		.attr("value", "yes")
      		 		.text("yes");		  	 	
				select.append("option")
      		 	   .attr("value", "no")
      		 	   .text("no");
			}
			
		}
		
	})
}
