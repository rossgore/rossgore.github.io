//variables
var width,
	height,
	radius,
	pressedKey,
	constants;

var	svg,
	control,
	force;

var nodes,
	edges,
	hidden_edges,
	lastID;

var graph,
	paths,
	circles,
	dragline;

var selectedNode,
	selectedPath,
	mousedownNode;

//TODO dragged and focused not needed anymore - remove?
var dragged,
	zoomed,
	connecting,
	focused,
	uploaded;

var defaultMode;
// sampleMode;

var vulnerability_vector;
var associated_vulnerability_techniques_vector;

var functionality_vector;
var associated_functionality_techniques_vector;

var attack_group_techniques;


var orderIdNames;
var orderIndexMapping;

var setDefaultMode = function(){
	//clear the display field
	clearDisplayField();

	defaultMode = true;
};
var multipleLinesText = function(text, d3elem) {
	//remove the text in the circle first
	d3elem.select("text")
		  .remove();

	var wordsLines = text.split(/\s+/g);
	var txtElem = d3elem.append("text")
						.attr("class", "node-title")
						.attr("text-anchor", "middle")
			            .attr("dy", "-" + (wordsLines.length-1)*7.5);

	for (var i=0; i<wordsLines.length; i++) {
		var tspanElem = txtElem.append("tspan")
							   .text(wordsLines[i]);
		if (i > 0) {
			tspanElem.attr("x", 0).attr("dy", 15);
		}
	}
}
//handle drag behaviour
var dragmove = function(d) {
	//handle when a line is being dragged to connect 2 nodes
	// if(connMode) {
	if(selectedNode === d && connecting) {
		// connecting = true;
		//display the dragline
		dragline.attr("d", "M" + d.x + "," + d.y + "L" + d3.mouse(graph.node())[0] + "," + d3.mouse(graph.node())[1]);
	}
	// //handle node dragging
	else {
		//set the state to being dragged
		dragged = true;
		//move the node
		d.x += d3.event.dx;
		d.y += d3.event.dy;
		//disable dragging out of boundaries
		// d.x = Math.min(width-radius, Math.max(d.x, radius));
		// d.y = Math.min(height-radius, Math.max(d.y, radius));
		refresh();
	}
};

var drag = d3.behavior.drag()
			 .origin(function(d){
			 	return {x: d.x, y:d.y};
			 })
			 .on("dragstart", function(){
			 	force.stop();
			 	d3.event.sourceEvent.stopPropagation();
			 	svg.style("cursor", "pointer");
			 })
			 .on("drag", dragmove)
			 .on("dragend", function(){
			 	svg.style("cursor", "default");
			 });

//handle zoom behaviour
var zoomBehavior = function(d){
	// zoomed = true;

	graph.attr("transform", "translate(" + d3.event.translate + ") scale (" + d3.event.scale + ")");
};

var zoom = d3.behavior.zoom()
			 .scaleExtent([0.5, 2])
			 .on("zoomstart", function(){
			 	svg.style("cursor", "move");
			 })
			 .on("zoom", function() {
			 	// if(!editNodeTextMode) {
				 	zoomBehavior();
			 	// }
			 })
			 .on("zoomend", function(){
			 	svg.style("cursor", "default");
			 	//recalculate the zoom scale
				d3.select("#zoom-scale")
				  .text("Zoom Scale: " + zoom.scale().toFixed(2));
			 });

var clearDisplayField = function() {
	control.html("");
}

var isEmptyString = function(text) {
	return text.length === 0 || /^\s*$/.test(text);
}

var displayHelp = function() {
	clearDisplayField();

	// Append the slider
	var slider = control.append("div")
		   				.classed("da-slider my-slider", true)
		   				.attr("id", "help-slider");

	// Append frames for the slideshow
	slider.append("div")
		  .classed("da-slide", true)
		  .append("p")
		  .attr("class", "instructions-text text-justified")
		  .html("<span class='instructions-text-title'> Add a Rung: </span> Double-click on the canvas.");
	slider.append("div")
		  .classed("da-slide", true)
		  .append("p")
		  .attr("class", "instructions-text text-justified")
		  .html("<span class='instructions-text-title'> Edit Rung: </span> Click on the rung and edit its name and/ or CPT.");
	slider.append("div")
		  .classed("da-slide", true)
		  .append("p")
		  .attr("class", "instructions-text text-justified")
		  .html("<span class='instructions-text-title'> Delete Rung: </span> Right-click on the rung and select <span class='instructions-text-control'>\'Remove Rung\'</span>.");
	slider.append("div")
		  .classed("da-slide", true)
		  .append("p")
		  .attr("class", "instructions-text text-justified")
		  .html("<span class='instructions-text-title'> Add Link: </span> Select a rung and click on it simulataneously dragging to the rung you want to connect it to.");
	slider.append("div")
		  .classed("da-slide", true)
		  .append("p")
		  .attr("class", "instructions-text text-justified")
		  .html("<span class='instructions-text-title'> Delete Link: </span> Right-click on the link and select <span class='instructions-text-control'>\'Remove Link\'</span>.");


	// Append the arrows
	var arrowsNav = slider.append("nav")
						  .attr("class", "da-arrows");
	arrowsNav.append("span")
			 .attr("class", "da-arrows-prev");
	arrowsNav.append("span")
			 .attr("class", "da-arrows-next");

	// Start the slider
	$('#help-slider').cslider({
		// index of current slide
		// current		: 0,
		// increment the background position
		// (parallax effect) when sliding
		bgincrement	: 50,
		// slideshow on / off
		autoplay	: true,
		// time between transitions
		// interval	: 3000
	});

}

var displayInfo = function() {
	clearDisplayField();

	// Append the slider
	var slider = control.append("div")
		   				.classed("da-slider my-slider", true)
		   				.attr("id", "info-slider");
	// Append frames for the slideshow
	slider.append("div")
		  .classed("da-slide", true)
		  .append("p")
		  .attr("class", "instructions-text text-justified")
		  .html("Bayesian Networks are graphical models for reasoning under uncertainty.");
	slider.append("div")
		  .classed("da-slide", true)
		  .append("p")
		  .attr("class", "instructions-text text-justified")
		  .html("Bayesian Networks are directed acyclic graphs(DAGs). Networks designed by the user should not contain cycles.");
	slider.append("div")
		  .classed("da-slide", true)
		  .append("p")
		  .attr("class", "instructions-text text-justified")
		  .html("Attack Ladders are represented by rungs and links, where the rungs are stages in a cyber attack and a link shows a direct connection between a parent rung and a child rung.");
	slider.append("div")
		  .classed("da-slide", true)
		  .append("p")
		  .attr("class", "instructions-text text-justified")
		  .html("Each rung has two values. The default values for each rung are yes and no.")
	slider.append("div")
		  .classed("da-slide", true)
		  .append("p")
		  .attr("class", "instructions-text text-justified")
		  .html("Ancestral(Direct) Sampling algorithm is used to generate sample data from an attack ladder. The user can fix the values for any of the rungs.")
	slider.append("div")
		  .classed("da-slide", true)
		  .append("p")
		  .attr("class", "instructions-text text-justified")
		  .html("The structure and the parameters of an attack ladder can be learnt from sample data. The algorithm used for learning a structure is called the PC Algorithm.")
	slider.append("div")
		  .classed("da-slide", true)
		  .append("p")
		  .attr("class", "instructions-text text-justified")
		  .html("If there is an attack ladder with known structure but not known probabilities for the rungs, sample data can be used to learn the probabilities for the network.")

	// Append the arrows
	var arrowsNav = slider.append("nav")
						  .attr("class", "da-arrows");
	arrowsNav.append("span")
			 .attr("class", "da-arrows-prev");
	arrowsNav.append("span")
			 .attr("class", "da-arrows-next");

	// Start the slider
	$('#info-slider').cslider({
		// index of current slide
		current		: 0,
		// increment the background position
		// (parallax effect) when sliding
		bgincrement	: 50,
		// slideshow on / off
		autoplay	: true,
		// time between transitions
		interval	: 3000
	});
}

var displayAbout = function() {
	clearDisplayField();
	var tool_version = "1.4.2024.01.31";
	var message = "Version: " + tool_version;
	
	// Append the slider
	var slider = control.append("div")
		   				.classed("da-slider my-slider", true)
		   				.attr("id", "about-slider");
	// Append frames for the slideshow
	slider.append("div")
		  .classed("da-slide", true)
		  .append("p")
		  .attr("class", "instructions-text text-justified")
		  .html("WindCRAFT has been developer for the Cybersecurity Center for Offshore Wind Energy.");
	slider.append("div")
		  .classed("da-slide", true)
		  .append("p")
		  .attr("class", "instructions-text text-justified")
		  .html("The aim of this application is to calculate probabilities of successful attacks on a wind energy system and to provide a formal measure of resilience.");
	slider.append("div")
		 .classed("da-slide", true)
		 .append("p")
		 .attr("class", "instructions-text text-justified")
		 .html(message);
	// Append the arrows
	var arrowsNav = slider.append("nav")
						  .attr("class", "da-arrows");
	arrowsNav.append("span")
			 .attr("class", "da-arrows-prev");
	arrowsNav.append("span")
			 .attr("class", "da-arrows-next");

	// Start the slider
	$('#about-slider').cslider({
		// index of current slide
		current		: 0,
		// increment the background position
		// (parallax effect) when sliding
		bgincrement	: 50,
		// slideshow on / off
		autoplay	: true,
		// time between transitions
		interval	: 3000
	});
};

var displayResources = function(){

	clearDisplayField();

	// Append the slider
	var slider = control.append("div")
		   				.classed("da-slider my-slider", true)
		   				.attr("id", "resources-slider");

	// Append the arrows
	var arrowsNav = slider.append("nav")
						  .attr("class", "da-arrows");
	arrowsNav.append("span")
			 .attr("class", "da-arrows-prev");
	arrowsNav.append("span")
			 .attr("class", "da-arrows-next");

	// Start the slider
	$('#resouces-slider').cslider({
		// index of current slide
		current		: 0,
		// increment the background position
		// (parallax effect) when sliding
		bgincrement	: 50,
		// slideshow on / off
		autoplay	: true,
		// time between transitions
		interval	: 3000
	});
};

var refresh = function(){
	
	var visible_edges = [];
	
	for (var i=0; i<edges.length; i++){
		var is_hidden = false;
		for (var j=0; j<hidden_edges.length; j++)
		{
			if (i == hidden_edges[j])
			{
				is_hidden = true;
			}
		}
		if (is_hidden == false)
		{
			visible_edges.push(edges[i]);
		}
	}

	//data for the paths
	paths = paths.data(visible_edges);
	
	
	
	//update existing edges
	paths.classed("selected", function(d){
		    return d === selectedPath;
		 })
		//If a node has been dragged, update the associated paths' coordinates
		 .attr("d", function(d){
		 	return "M" + d.source.x + "," + d.source.y + "L" + d.target.x + "," + d.target.y;
		 })

	//add new edges
	paths.enter()
		 .append("path")
		 .attr("class", "conn")
		 .classed("selected", function(d) {
		 	return d === selectedPath;
		 })
		 .style("marker-end", "url(#arrow)")
		 .attr("d", function(d) {
		 	return "M" + d.source.x + "," + d.source.y + "L" + d.target.x + "," + d.target.y;
		 })
		 .on("mousedown", function(d){
		 	d3.event.stopPropagation();

		    //select/deselect the path
		 	if(d === selectedPath) {
		 		selectedPath = null;
		 	}
		 	else {
		 		selectedPath = d;
		 	}

		 	selectedNode = null;
		 	refresh();
		 })
		 .on("contextmenu", d3.contextMenu(edgeMenu));
	
    //remove old paths
    paths.exit().remove();

    //data for the circles
    circles = circles.data(nodes, function(d) {
    	return d.id;
    });

    //update nodes
    circles.classed("selected", function(d){
    	   	 return d === selectedNode;
    	   })
    	   .attr("transform", function(d){
    	   	 return "translate(" + d.x + "," + d.y + ")";
    	   })

    //new nodes
    var circleGroup = circles.enter().append("g");

    circleGroup.attr("class", "node")
    		   .attr("transform", function(d){
    			  return "translate(" + d.x + "," + d.y + ")";
    		   })
    		//    .on("mouseover", function(d){
    		//    	//enlarge the circle
    		//    	 d3.select(this)
    		//    	   .select("circle")
    		//    	   .attr("r", radius + 2);
    		//    })
    		//    .on("mouseout", function(d){
    		//    	//shrink the circle
    		//    	 d3.select(this)
    		//    	   .select("circle")
    		//    	   .attr("r", radius- 2);
    		//    })
			   .on("mousedown", function(d){
    		      d3.event.stopPropagation();
    		      nodeMouseDown(d, d3.event.which);
    		   })
			   .on("mouseup", function(d){
			   	  //need to have propagation for dragging
			   	  nodeMouseUp(d, d3.select(this));
    		   })
    		   .on("dblclick", function(d){
    		   	  d3.event.stopPropagation();
    		   	  displayNodeInfo(d);
    		   })
    		   .on("contextmenu", d3.contextMenu(nodeMenu))
    		   .call(drag);

    //add circle for each group
    circleGroup.append("circle")
    		   .attr("r", radius)
    		   .call(function(d) {
    		   	  d.each(function(e) {
    		   	  	createCPT(e);
    		   	  })
    		   	  uploaded = false;
    		   });

    //add titles
    circleGroup.each(function(c) {
    	multipleLinesText(c.title, d3.select(this));
    });

    //remove old circles
    circles.exit().remove();
};

//on double click on the canvas, create a new node
var svgDblClick = function(){
	addNewNode();
	//when a new node is added, display its info
	displayNodeInfo(selectedNode);
}

var svgMouseDown = function(){
	// deselect a selected node
	if(selectedNode) {
		selectedNode = null;
		refresh();
		clearDisplayField();
	}
	// deselect a selected link
	else if(selectedPath) {
		selectedPath = null;
		refresh();
	}
};

var svgMouseUp = function(){

	//if in conn mode, discard the dragline
	if(connecting) {
		dragline.classed("hidden", true);
		connecting=false;
	}
};

var deleteData = function(){
	rawTxt = null;
	csvData = null;
	fData = null;

	// change the dataset label
	d3.select("#dataset-name")
	.html("Dataset: (none)")
	.classed("notice-text", false);
	
	// change the dataset label
	d3.select("#attackgroup-name")
	.html("ATT&CK Group: (none)")
	.classed("notice-text", false);

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
}
var deleteMitreAttackGroup = function()
{
	bootbox.confirm("Are you sure you want to delete the loaded MITRE ATT&CK Group?", function(result) {
  		if(result) {
			attack_group_techniques = new Array();
			// change the dataset label
			d3.select("#attackgroup-name")
			.html("ATT&CK Group: (none)")
			.classed("notice-text", false);

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
				var originalTitle = d.title.split(" ")
				var textContent = nodeTitle.text();
				if (textContent.startsWith("+")) {
					var circleElem = d3.selectAll(".node")
									.filter(function(n) { 
										return (n.id === d.id)
									});
						//remove + from fixed nodes
						multipleLinesText(d.title, circleElem);
				}
			});
			fixedSamples = {}
			mitreAttackGroupFilename = 'None'
			// var attackGroupEvent = new CustomEvent("attackGroupEvent", { detail: { mitreAttackGroupFilename } });
			// document.dispatchEvent(attackGroupEvent);
		}
	});
}
var deleteNetwork = function(isConfirm, all) {
	if(isConfirm) {
		bootbox.confirm("Are you sure you want to delete the network?", function(result) {
	  		if(result) {
				nodes = [];
				edges = [];
				hidden_edges = [];
				lastID = 0;
				refresh();
				setDefaultMode();
				if(all) {
					deleteData();
				}
	  		}
		});
	}
	else {
		nodes = [];
		edges = [];
		hidden_edges = [];
		lastID = 0;
		refresh();
		setDefaultMode();
		if(all) {
			deleteData();
		}
	}
}

var forceLayout = function(nodes, links) {
	// var force = d3.layout.force()
	// 			  .size([width, height])
	// 			  .nodes(nodes)
	// 			  .links(links)
	// 			  // TODO change
	// 			  .linkDistance(30)
	// 			  .charge(-120);
	// // console.log("force");

	// force.on("end", function(){
	// 	// update positions of nodes
 //        circles.attr("transform", function(d){
 //        	console.log("translate(" + d.x + "," + d.y + ")");
 //        	return "translate(" + d.x + "," + d.y + ")";
 //        });

	// 	// update positions of links
	// 	paths.attr("d", function(d){
	// 	 	return "M" + d.source.x + "," + d.source.y + "L" + d.target.x + "," + d.target.y;
	// 	})
	// });
	// force.start();
	force.nodes(nodes)
		 .links(links)
		 .start();
}

var maxNodeId = function(){
	return Math.max.apply(Math, nodes.map(function(n) {return n.id}));
}

window.onbeforeunload = function() {
	// TODO uncomment
	// return "Any progress you have made is not going to be saved.";
}

window.onresize = function() {
	var updatedWidth = document.getElementById("workspace").offsetWidth - 20;
	var updatedHeight = 0.76 * window.innerHeight;
	svg.attr("width", updatedWidth);
	svg.attr("height", updatedHeight);
}

var init = function() {
	//svg width & height
	width = document.getElementById("workspace").offsetWidth -20;
	height = 0.76 * window.innerHeight;
	radius=25;
	pressedKey = -1;

	//TODO remove?
	constants = {
		BACKSPACE: 8,
		ENTER: 13,
		DELETE:46
	};
	
	orderIdNames = new Array();
	orderIndexMapping = new Array();
	
	attack_group_techniques = new Array();
	
	// vulnerability and funcitonality vector loading
	var vulnerability_str = 'Authentication Bypass by Capture-replay, Improper Restriction of Excessive Authentication Attempts, Overly Restrictive Account Lockout Mechanism, Use of Password Hash Instead of Password for Authentication, General Credential Management Errors, Cleartext Transmission of Sensitive Information, Hard-coded Credentials, Weak Password/Hashing, General Cryptographic Issues, XML External Entity (XXE), XML Entity Expansion (XEE), URL Redirection to Untrusted Site (Open Redirect), Cross-site Scripting (XSS), OS Command Injection, SQL Injection, Code Injection, Directory Traversal (Relative and Absolute), Symlink Attacks, Untrusted/Uncontrolled/Unquoted Search Path, Unrestricted File Upload, Deserialization of Untrusted Data, Infinite Loop, Cross-site Request Forgery (CSRF), Session Fixation, Uncontrolled Resource Consumption, Server-Side Request Forgery (SSRF)';
	var functionality_str = 'Modify Configuration, Create Account,  Disable protections, Restart/Reboot, Read from Memory, Obtain sensitive information: Credentials, Obtain sensitive information: Other data  Password Reset, Read files, Delete files, Create/Upload file, Write to existing file, Change ownership or permissions, Memory Modification, Memory Read';
	
	var associated_functionality_techniques_str = 'T1632, T1136 | T1078, T1562, T1529, T1005, T1552, T1005, T1098, T1005 | T1003.008 | T1552.001, T1485 | T1499.004, T1505.003 | T1059, T1565.001 | T1059 | T1574 | T1554 T1222, T1574 | T1499.004, T1005 | T1499.004 | T1211 | T1212';
	var assocaited_vulnerability_techniques_str = 'T1190 | T1040, T1078 | T1110.001, T1446 | T1531 | T1110, T1550.002, T1552 | T1078, T1552 | T1078 | T1040, T1078.001, T1078 | T1110, T1078 | T1557 | T1040 | T1110, T1059 | T1005 | T1046, T1499.004, T1036 | T1566.002, T1059.007 | T1557 | T1189 | T1204.001, T1059 | T1133 | T1059.004, T1059 | T1005 | T1505.003 | T1136 | T1190 | T1565.001, T1059, T1202, T1202, T1574, T1505.003 | T1059, T1059, T1499.004, T1068 | T1204.001, T1563, T1499, T1090 | T1135 | T1005 | T1133';
	
	vulnerability_vector = new Array();
	functionality_vector = new Array();
	
	associated_vulnerability_techniques_vector = new Array();
	associated_functionality_techniques_vector = new Array();
	
	vulnerability_vector = vulnerability_str.split(",");
	functionality_vector = functionality_str.split(",");
	
	associated_vulnerability_techniques_vector = assocaited_vulnerability_techniques_str.split(",");
	associated_functionality_techniques_vector = associated_functionality_techniques_str.split(",");
	
	//mouse event variables
	selectedNode = null;
	selectedPath = null;
	mousedownNode = null;

	//status states
	dragged = false;
	zoomed = false;
	connecting = false;
	focused = false;
	uploaded = false;

	//work mode
	defaultMode = true;

	nodes = [];
	edges = [];
	hidden_edges = [];
	lastID=1;

	// initialise force layout
	force = d3.layout.force()
				  .size([width, height])
				  // TODO change
				  .linkDistance(150)
				  .charge(-250);

	force.on("tick", function(){
		// update positions of nodes
        circles.attr("transform", function(d){
        	// console.log("translate(" + d.x + "," + d.y + ")");
        	return "translate(" + d.x + "," + d.y + ")";
        });

		// update positions of links
		paths.attr("d", function(d){
		 	return "M" + d.source.x + "," + d.source.y + "L" + d.target.x + "," + d.target.y;
		})
	});
	// end

	control = d3.select("#control");

	svg = d3.select("#workspace")
				.append("svg")
				.attr("width", width)
				.attr("height", height)
				.attr("id", "svg")
				.attr("class", "tour-step tour-step-six")
				.attr("version", 1.1)
				.attr("xmlns", "http://www.w3.org/2000/svg");

	//arrow markers
	//parts of the code used from these examples http://tutorials.jenkov.com/svg/marker-element.html
	svg.append("defs")
	   .append("marker")
	   .attr("id", "arrow")
	   .attr("viewBox", "0 -5 10 10")
	   .attr("refX", 24.5)
	   .attr("markerWidth", 3)
	   .attr("markerHeight", 3)
	   .attr("orient", "auto")
	   .append("path")
	   .attr("d", "M0,-5L10,0L0,5")
	   .attr("class", "arrow")

	svg.append("defs")
	   .append("marker")
	   .attr("id", "dragline-arrow")
	   .attr("viewBox", "0 -5 10 10")
	   .attr("refX", 6)
	   .attr("markerWidth", 3)
	   .attr("markerHeight", 3)
	   .attr("orient", "auto")
	   .append("path")
	   .attr("d", "M0,-5L10,0L0,5")
	   .attr("class", "arrow");

	//graph group, paths, circles
	graph = svg.append("g").attr("id", "graph");
	paths = graph.append("g").selectAll("path");
    circles = graph.append("g").selectAll("g");

	//dragline
	dragline = graph.append("path")
					.attr("class", "conn hidden dragline")
				 	.attr("d", "M0,0L0,0")
				 	.style("marker-end", "url(#dragline-arrow)");

	// svg.on("mousedown", svgMouseDown)
	svg.on("dblclick", svgDblClick)
	   .on("mousedown", svgMouseDown)
	   .on("mouseup", svgMouseUp)
	   .on("mouseover", function() {
		   focused = true;
	   })
	   .on("mouseout", function() {
	   	   focused = false;
	   })
	   .call(zoom);
	svg.on("dblclick.zoom", null);

	d3.select("#downloadNet")
	  .on("click", function() {
	  	specifyDownloadName(1, ".json");
	  	// downloadNetwork();
	  });
	d3.select("#downloadDocx")
	  .on("click", function() {
	  	specifyDownloadName(5, ".docx");
	  });

	document.addEventListener("attackGroupAdded", function(e) {
		mitreAttackGroupFilename = e.detail.attackGroupFilename
		console.log(mitreAttackGroupFilename)
	});
	document.addEventListener("fixedSamplesAdded", function(e) {
		fixedSamples = e.detail.fixedSamples
		let nodeDict = {};

	    // Loop through nodes and construct the dictionary
		for (let i = 0; i < nodes.length; i++) {
			let node = nodes[i];
			nodeDict[node.title] = node.id;
		}
		d3.selectAll('.node-title')
		.filter(function(d) {
			return fixedSamples[d.id] === 'yes' && nodeDict.hasOwnProperty(d.title);
		})
		.each(function(d) {
			var circleElem = d3.selectAll(".node")
									.filter(function(n) { 
										return (n.id === d.id)
									});
			//update the circle title with + for fixed nodes
			multipleLinesText('+'+d.title, circleElem);
		});

		attackTechniqueNodes = [];
		nodes.forEach(node => {
			if (fixedSamples[node.id] === 'yes') {
				attackTechniqueNodes.push({
					title: node.title,
					attack_techniques: node.attack_techniques
				});
			}
		});
	});
	document.addEventListener("docCompleted", function(e) {
		docReport = e.detail.docInitial
	});

	document.addEventListener("docAppendCompleted", function(e) {
		docReport = e.detail.docReport
		appendNum = e.detail.appendNum
	});

	document.addEventListener("numOfSamples", function(e) {
		noOfSamples = e.detail.noOfSamples
	});
	document.addEventListener("previousResilience", function(e) {
		previousSystemResilienceComputation = e.detail.systemResilienceComputation
	});

	document.addEventListener("appendTriggered", function(e) {
		specifyDownloadName(6, ".docx");
	});

	document.addEventListener("filenameUploaded", function(e) {
		docxFilename = e.detail.filename+'.docx';
		docInitial = e.detail.docInitial
		var link = document.getElementById('downloadDocx');
		link.classList.remove('disabled');
	});
	document.addEventListener("samplingTriggered", function(e) {
		reportDict = e.detail.reportDictArray
		systemResilienceComputation = e.detail.systemResilienceComputation
		samplingDict = e.detail.samplingDict
		var link = document.getElementById('downloadDocx');
		link.classList.remove('disabled');
	});
	  d3.select("#deleteAttackGroup")
	  .on("click", function(){
	  	deleteMitreAttackGroup();
	  });
	d3.select("#deleteNet")
	  .on("click", function(){
	  	deleteNetwork(true, true);
	  	// deleteData();
	  });
	d3.select("#uploadNet")
	  .on("click", function(){
	  	document.getElementById("hidden-upload").click();
	  });
	d3.select("#hidden-upload")
	  .on("change", uploadNetwork);
	document.addEventListener("uploadCompletedNet", function(e) {
		detectionScoreDict = undefined;
		visibilityScoreDict = undefined;
	});

	d3.select("#uploadMitre")
	  .on("click", function(){
	  	document.getElementById("hidden-upload-mitre").click();
	  });
	d3.select("#hidden-upload-mitre")
	  .on("change", uploadMitre);

	d3.select("#uploadMiMir")
	  .on("click", function(){
	  	document.getElementById("hidden-upload-4").click();
	  });
	d3.select("#hidden-upload-4")
	  .on("change", uploadMiMir);
	document.addEventListener("uploadCompleted", function(e) {
		detectionScoreDict = e.detail.detectionScoreDict;
		visibilityScoreDict = e.detail.visibilityScoreDict;
		techniqueIdDict = e.detail.techniqueIdDict
		uploadFileMimir = e.detail.uploadFileName
	});

	d3.select("#sample-net")
	  .on("click", function() {
	  	// setMode("sample");
	  	samplingSettings();
	  }); // compromiseRungSettings
	d3.select("#sim-compromised-net")
	  .on("click", function() {
	  	compromiseRungSettings();
	  });
	d3.select("#uploadSample")
	  .on("click", function(){
	  	document.getElementById("hidden-upload-2").click();
	  });
	d3.select("#hidden-upload-2")
	  .on("change", function() {
	  	uploadSample();
	  });

	//upload .bif
	d3.select("#uploadBif")
	  .on("click", function(){
	  	document.getElementById("hidden-upload-3").click();
	  })
	d3.select("#hidden-upload-3")
	  .on("change", uploadBif);

	//help info about the tool controls
	d3.select("#help")
	  .on("click", function(){
	  	//display instructions
	  	displayHelp();
	  });
	// about the tool
	d3.select("#about")
	  .on("click", function(){
	  	//display info
	  	displayAbout();
	  });
	// about BNs
	d3.select("#info")
	  .on("click", function(){
	  	// TODO links to helpful websites
	  	displayInfo();
	  });
	// resources for BNS
	d3.select("#resources")
	  .on("click", function(){
	  	// TODO
	  	// displayResources();
	  })

	// example networks
	d3.select("#loadNet")
	  .on("click", loadExampleNetworks);
	// example datasets
	d3.select("#loadData")
	  .on("click", loadExampleData);
	//download a png image of the current state of the svg
	d3.select("#downloadImg")
	  .on("click", function() {
	  	specifyDownloadName(3, ".png");
	  });

	// learn the parameters
	d3.select("#learnParams")
	  .on("click", function(){
	  	learnParameters();
	  });

	// learn the structure
	d3.select("#learnStruct")
	  .on("click", function(){
	  	learnStructure();
	  })
	//display zoom scale
	d3.select("#workspace")
	  .append("p")
	  .attr("id", "zoom-scale")
	  .attr("class", "pull-right zoom-text")
	  .text("Zoom Scale: " + zoom.scale().toFixed(2));
    d3.select("#workspace")
	  .append("img")
	  .attr("id", "zoom-scale")
	  .attr("class", "pull-left responsive-img")
	  .attr("src", "../img/legend.png");
}();

//Initialise
loadDefaultNetwork("files/nets/Turbine-Compromise.json", true);
