import { createRequire } from "module";
const require = createRequire(import.meta.url);

var programArgs = [];
process.argv.forEach(function (val, index, array) {
	programArgs.push(val);
});
const { readFileSync } = require('fs');
const { writeFileSync } = require('fs');

var headlessFilepath = programArgs[2]; // attack ladder json filepath
var headlessNumberOfSamples = programArgs[3];  // number of samples to take
var headlessFixedNodeIdFilePath = programArgs[4];
var mitreAttackGroupFilePath = programArgs[5];
var headlessJSONFilepath = programArgs[6]; // output file path samples provided in json format
var headlessSummaryFilepath = programArgs[7]; // output file path summary provided in json format

var headlessNodes = [];
var headlessEdges = [];

var headlessSamples = [];
var headlessSamplesJSON = '';

var headlessSummary = {};
var headlessSummaryJSON = '';

var fixedfs = require('fs');
var mitreAttackGroupfs = require('fs');
var fs = require('fs');
var obj = '';

var fixedNodeObj = '';
var fixedYes = '';
var fixedNo = '';

var attack_group_techniques = [];
var mitreObj = '';
var attackTechniquesJSON = '';

// vulnerability and funcitonality vector loading
var vulnerability_str = 'Authentication Bypass by Capture-replay, Improper Restriction of Excessive Authentication Attempts, Overly Restrictive Account Lockout Mechanism, Use of Password Hash Instead of Password for Authentication, General Credential Management Errors, Cleartext Transmission of Sensitive Information, Hard-coded Credentials, Weak Password/Hashing, General Cryptographic Issues, XML External Entity (XXE), XML Entity Expansion (XEE), URL Redirection to Untrusted Site (Open Redirect), Cross-site Scripting (XSS), OS Command Injection, SQL Injection, Code Injection, Directory Traversal (Relative and Absolute), Symlink Attacks, Untrusted/Uncontrolled/Unquoted Search Path, Unrestricted File Upload, Deserialization of Untrusted Data, Infinite Loop, Cross-site Request Forgery (CSRF), Session Fixation, Uncontrolled Resource Consumption, Server-Side Request Forgery (SSRF)';
var functionality_str = 'Modify Configuration, Create Account,  Disable protections, Restart/Reboot, Read from Memory, Obtain sensitive information: Credentials, Obtain sensitive information: Other data  Password Reset, Read files, Delete files, Create/Upload file, Write to existing file, Change ownership or permissions, Memory Modification, Memory Read';

var associated_functionality_techniques_str = 'T1632, T1136 | T1078, T1562, T1529, T1005, T1552, T1005, T1098, T1005 | T1003.008 | T1552.001, T1485 | T1499.004, T1505.003 | T1059, T1565.001 | T1059 | T1574 | T1554 T1222, T1574 | T1499.004, T1005 | T1499.004 | T1211 | T1212';
var assocaited_vulnerability_techniques_str = 'T1190 | T1040, T1078 | T1110.001, T1446 | T1531 | T1110, T1550.002, T1552 | T1078, T1552 | T1078 | T1040, T1078.001, T1078 | T1110, T1078 | T1557 | T1040 | T1110, T1059 | T1005 | T1046, T1499.004, T1036 | T1566.002, T1059.007 | T1557 | T1189 | T1204.001, T1059 | T1133 | T1059.004, T1059 | T1005 | T1505.003 | T1136 | T1190 | T1565.001, T1059, T1202, T1202, T1574, T1505.003 | T1059, T1059, T1499.004, T1068 | T1204.001, T1563, T1499, T1090 | T1135 | T1005 | T1133';

var vulnerability_vector = new Array();
var functionality_vector = new Array();

var associated_vulnerability_techniques_vector = new Array();
var associated_functionality_techniques_vector = new Array();

vulnerability_vector = vulnerability_str.split(",");
functionality_vector = functionality_str.split(",");

associated_vulnerability_techniques_vector = assocaited_vulnerability_techniques_str.split(",");
associated_functionality_techniques_vector = associated_functionality_techniques_str.split(",");

var total_techniques = 0;
var node_sampling_values = new Array();	
	
var fixedFileExists = (headlessFixedNodeIdFilePath != "none" && headlessFixedNodeIdFilePath != "NA" && headlessFixedNodeIdFilePath != "na" && 
	headlessFixedNodeIdFilePath != "None" && headlessFixedNodeIdFilePath != "NONE" && headlessFixedNodeIdFilePath != "Na")

var mitreAttackGroupFileExists = (mitreAttackGroupFilePath != "none" && mitreAttackGroupFilePath != "NA" && mitreAttackGroupFilePath != "na" && 
	mitreAttackGroupFilePath != "None" && mitreAttackGroupFilePath != "NONE" && mitreAttackGroupFilePath != "Na")


var isMitreAttackGroupDir = false;
if (mitreAttackGroupFileExists)
{
	isMitreAttackGroupDir = fs.lstatSync(mitreAttackGroupFilePath).isDirectory();
}

if (fixedFileExists)
{
	const fixeddata = readFileSync(headlessFixedNodeIdFilePath);
	fixedNodeObj = JSON.parse(fixeddata);
	fixedYes = fixedNodeObj.yes;
	fixedNo = fixedNodeObj.no;
	for (var i=0; i<fixedYes.length; i++)
	{
		fixedYes[i] = parseInt(fixedYes[i]);
	}
	for (var i=0; i<fixedNo.length; i++)
	{
		fixedNo[i] = parseInt(fixedNo[i]);
	}
}

if (!isMitreAttackGroupDir)
{
	if (mitreAttackGroupFileExists)
	{
		const mitredata = readFileSync(mitreAttackGroupFilePath);
		mitreObj = JSON.parse(mitredata);
		attackTechniquesJSON = mitreObj.techniques;
		attack_group_techniques = attackTechniquesJSON;
		for (var attackIndex=0; attackIndex<attackTechniquesJSON.length;attackIndex++)
		{
			attack_group_techniques[attackIndex] = attackTechniquesJSON[attackIndex].techniqueID;

		}

	}
	
	const data = readFileSync(headlessFilepath);
	obj = JSON.parse(data);
	headlessNodes = obj.nodes;

	headlessEdges = obj.edges;

	var headlessFixedSamples = {};
	// initialize at none
	headlessNodes.forEach(function(node){
		headlessFixedSamples[node.id] = "none";
	})	
		
	// we do attack group first, this reflects users implicit choices
	headlessNodes.forEach(function(node){
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
	})
		
	var node_sampling_values = new Array();

	headlessNodes.forEach(function(node){
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
			for (var j=0; j<techinques_for_this_functionality.length; j++)
			{
				var current_technique = techinques_for_this_functionality[j].trim();
				if (attack_group_techniques.indexOf(current_technique) != -1)
				{
					value_to_push = "yes"
				}
			}
		}
		node_sampling_values.push(value_to_push);
	})
		
	// copy in node_sampling_values as update values for if applicable
	if (attack_group_techniques.length > 0 && total_techniques > 0)
	{
		var loop_index =0;
		headlessNodes.forEach(function(node){
			headlessFixedSamples[node.id] = node_sampling_values[loop_index];
			loop_index = loop_index + 1;
		})
	}

	// we do fixed file second, this reflects users explicit choices
	headlessNodes.forEach(function(node){
		if (fixedYes.includes(node.id))
		{
			headlessFixedSamples[node.id] = "yes";
		}
		if (fixedNo.includes(node.id))
		{
			headlessFixedSamples[node.id] = "no";
		}
	})


	for (var i=0; i< headlessNumberOfSamples; i++) {
		var headlessSample = singleSample(headlessFixedSamples);
		headlessSamples.push(headlessSample);
	}
		
	headlessSamplesJSON = JSON.stringify(headlessSamples);
		
	var outfs = require('fs');
	try {
		outfs.writeFileSync(headlessJSONFilepath, headlessSamplesJSON, 'utf8');
	}
	catch (error) {
	  console.log('An error has occurred writing the samples file ', error);
	}
		
	headlessNodes.forEach(function(node){
		headlessSummary[node.id] = 0;
	})
		
	for (var totalCount = 0; totalCount<headlessSamples.length; totalCount++)
	{
		var currentSample = headlessSamples[totalCount];
		headlessNodes.forEach(function(node){
			if (currentSample[node.id] == "yes")
			{
				headlessSummary[node.id] = headlessSummary[node.id] + 1;
			}
		})
	}

	headlessNodes.forEach(function(node){
		headlessSummary[node.id] = (headlessSummary[node.id] / headlessNumberOfSamples) * 100;
	})
	
	
	var nodesToExitLadder = getExitNodeIds(headlessEdges);
	var sampleIndicies = getSampleIndiciesFromNodeIds(headlessNodes, nodesToExitLadder);
	// get percentage of samples in columns sampleIndicies that have a yes
	var totalExitNodesCompromised = 0;
		for (var s in headlessSamples) {
			var numberOfYes = 0;
			for (var val in sampleIndicies) {
				var dict = headlessSamples[s];
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
	
	var systemResilienceComputation = (totalExitNodesCompromised / headlessSamples.length);
	systemResilienceComputation = systemResilienceComputation * 100;
	systemResilienceComputation = 100.00 - systemResilienceComputation;
	
	headlessSummary["Overall System Resilience"] = systemResilienceComputation;
	headlessSummaryJSON = JSON.stringify(headlessSummary);
	var outfsSummary = require('fs');
	try {
		outfsSummary.writeFileSync(headlessSummaryFilepath, headlessSummaryJSON, 'utf8');
	}
	catch (error) {
	  console.log('An error has occurred writing the summary file ', error);
	}
}

if (isMitreAttackGroupDir)
{
	var files = fs.readdirSync(mitreAttackGroupFilePath);
	for (var filesIndex = 0; filesIndex < files.length; filesIndex ++)
	{
		attack_group_techniques = [];
		var attack_group_id = files[filesIndex].replace("-enterprise-layer.json", "");
		var filename = mitreAttackGroupFilePath + files[filesIndex];
		const mitredata = readFileSync(filename);

		mitreObj = JSON.parse(mitredata);
		attackTechniquesJSON = mitreObj.techniques;
		attack_group_techniques = attackTechniquesJSON;
		for (var attackIndex=0; attackIndex<attackTechniquesJSON.length; attackIndex++)
		{
			attack_group_techniques[attackIndex] = attackTechniquesJSON[attackIndex].techniqueID;
		}
		
		const data = readFileSync(headlessFilepath);
		obj = JSON.parse(data);
		headlessNodes = obj.nodes;

		headlessEdges = obj.edges;
		
		var headlessFixedSamples = {};
		headlessSamples = [];
		headlessSummary = {};
		
		// initialize at none
		headlessNodes.forEach(function(node){
			headlessFixedSamples[node.id] = "none";
		})	
		
		// we do attack group first, this reflects users implicit choices
		headlessNodes.forEach(function(node){
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
		})
		
		var node_sampling_values = new Array();

		headlessNodes.forEach(function(node){
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
				for (var j=0; j<techinques_for_this_functionality.length; j++)
				{
					var current_technique = techinques_for_this_functionality[j].trim();
					if (attack_group_techniques.indexOf(current_technique) != -1)
					{
						value_to_push = "yes"
					}
				}
			}
			node_sampling_values.push(value_to_push);
		})
		
		// copy in node_sampling_values as update values for if applicable
		if (attack_group_techniques.length > 0 && total_techniques > 0)
		{
			var loop_index =0;
			headlessNodes.forEach(function(node){
				headlessFixedSamples[node.id] = node_sampling_values[loop_index];
				loop_index = loop_index + 1;
			})
		}

		// we do fixed file second, this reflects users explicit choices
		headlessNodes.forEach(function(node){
			if (fixedYes.includes(node.id))
			{
				headlessFixedSamples[node.id] = "yes";
			}
			if (fixedNo.includes(node.id))
			{
				headlessFixedSamples[node.id] = "no";
			}
		})


		for (var i=0; i< headlessNumberOfSamples; i++) {
			var headlessSample = singleSample(headlessFixedSamples);
			headlessSamples.push(headlessSample);
		}
		
		headlessSamplesJSON = JSON.stringify({[attack_group_id]: headlessSamples});
		var samplesFilename = headlessJSONFilepath + attack_group_id + "-samples.json"
		var outfs = require('fs');
		try {
			outfs.writeFileSync(samplesFilename, headlessSamplesJSON, 'utf8');
		}
		catch (error) {
		  console.log('An error has occurred writing the samples file ', error);
		}
		
		headlessNodes.forEach(function(node){
			headlessSummary[node.id] = 0;
		})
		
		for (var totalCount = 0; totalCount<headlessSamples.length; totalCount++)
		{
			var currentSample = headlessSamples[totalCount];
			headlessNodes.forEach(function(node){
				if (currentSample[node.id] == "yes")
				{
					headlessSummary[node.id] = headlessSummary[node.id] + 1;
				}
			})
		}

		headlessNodes.forEach(function(node){
			headlessSummary[node.id] = (headlessSummary[node.id] / headlessNumberOfSamples) * 100;
		})
		
		var nodesToExitLadder = getExitNodeIds(headlessEdges);
		var sampleIndicies = getSampleIndiciesFromNodeIds(headlessNodes, nodesToExitLadder);
		// get percentage of samples in columns sampleIndicies that have a yes
		var totalExitNodesCompromised = 0;
			for (var s in headlessSamples) {
				var numberOfYes = 0;
				for (var val in sampleIndicies) {
					var dict = headlessSamples[s];
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
	
		var systemResilienceComputation = (totalExitNodesCompromised / headlessSamples.length);
		systemResilienceComputation = systemResilienceComputation * 100;
		systemResilienceComputation = 100.00 - systemResilienceComputation;
		headlessSummary["Overall System Resilience"] = systemResilienceComputation;
		
		headlessSummaryJSON = JSON.stringify({[attack_group_id]: headlessSummary});
		var outfsSummary = require('fs');
		var summaryFilename = headlessSummaryFilepath + attack_group_id + "-summary.json"
		try {
			outfsSummary.writeFileSync(summaryFilename, headlessSummaryJSON, 'utf8');
		}
		catch (error) {
		  console.log('An error has occurred writing the summary file ', error);
		}
	}



	
}




function singleSample(fixed) {
	
	var currSample = {};
	//fix any values if any have been chosen
	for (var id in fixed) {
		if(fixed[id] !== "none") {
			currSample[id] = fixed[id];
		}
	}

	//set nodes status to not sampled if not fixed
	setSamplingStatus(currSample);
	
	//sample each node that has not been sampled
	headlessNodes.forEach(function(n) {
		if(!n.sampled) {
			sampleNode(n, currSample);
		}
	})
	return currSample;
}

function sampleNode(node, sample) {
	var parents = getNodeParents(node);
	if(parents.length > 0) {
		parents.forEach(function(p) {
			var currParent = headlessNodes.filter(function(n) { return n.id === p})[0];
			if(currParent.sampled === false) {
				sampleNode(currParent, sample);
			}
			else if(!currParent.sampled){
				console.log("currParent is undefined");
			}
		})
	}
	var value = doSampling(node, parents, sample);
	var nodeId = node.id;
	sample[nodeId] = value;
	node.sampled = true;
}

function doSampling(node, parents, sample){
	var randVal = Math.random();
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

function getNodeParents(d){
	var nodeParentsIds = []

	var inConns = headlessEdges.filter(function(e) {
		//return e.target === d;
		return e.target.id === d.id;
	})

	for (var c in inConns) {
		nodeParentsIds.push(inConns[c].source.id);
	}
	nodeParentsIds.sort();
	return nodeParentsIds;
}

function setSamplingStatus(fixed) {
	//set all nodes state to not sampled
	for (var n in headlessNodes) {
		headlessNodes[n].sampled = false;
	}
	for(var id in fixed) {
		var fixedNode = headlessNodes.filter(function(node){
			return node.id === parseInt(id);
		})[0];
		fixedNode.sampled = true;
	}
	return true;
}


function getEntryNodeIds(edges)
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

function getExitNodeIds(edges)
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

function getSampleIndiciesFromNodeIds(nodes, nodeIdList)
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

function orderDiffersById(listOfNodes)
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