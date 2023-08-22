## Attack Ladder User Guide
Attack Ladders are graphical models for reasoning about the uncertainty related to multistage cyber attacks. Attack ladders are directed acyclic graphs (DAGs). Attack ladders designed by the user should not contain cycles. Attack Ladders are represented by rungs and arcs, where the rungs are random variables and an arc shows a direct causal connections between a parent rung and a child rung. Each rung will have 2 values. The default values for each rung are 1 and 0 (True and False). However, for all sampling analysis to work users should change the value from '1' to 'yes' and '0' to 'no'.

Users interact with the canvas to add and delete attack ladder rungs and arcs. Users can click on the created elements to edit their properties.

## Installation

**Run attack ladders locally**
From within the attack ladders folder

- first install http-server globally
```
npm install -g http-server
```

- then run http-server from attack ladders folder
```
http-server
```

- this will start the webserver pointing to the index.html file in attack ladders defaults to localhost:3000


## Attack Ladder Rung Manipulation

**Add a Rung**
Double-click on the canvas. Each rung will have 2 values. The default values for each rung are 1 and 0 (True and False). However, for all sampling analysis to work users should change the value from '1' to 'yes' and '0' to 'no'. Each rung that is generated will have a 
Conditional Probability Table that must be filled in with probabilities. The Conditional Probability Table (CPT) is a set of yes/no dependencies of directly incoming attack ladder rungs and to specify the conditional probabilities of an attack ladder rung with respect to the others (i.e., the probability of each possible yes/no of one attack ladder rung if we know the values taken on by the other directly incoming rungs).

**Calculate Rung Probability**
Select 'Calculate Rung Probability' option from the 'Attack Ladder' menu. A pop-up window will open up that will guide users through describing the Attack Ladder Rung with using the CVSS exploit scoring. Once a description is provided the window will generate a histogram of probabilities for the rung and provide users with the mean probability for the rung.

**Edit a Rung**
Click on the rung and edit its name, Conditional Probability Value (CPT) or values it can take from the menu on the right.

**Delete Rung**
Right-click on the node and select 'Remove Node'.

## Attack Ladder Arc Manipulation

**Add Arc:** 
Select a rung and click on it simultaneously dragging to the rung you want to connect it to.

**Delete Arc:** 
Right-click on the link and select 'Remove Connection'.

## Attack Ladder Sampling
Select 'Sample Attack Ladder' option from the 'Attack Ladder' menu. In the settings menu that will appear on the right side of the screen identify the number of samples you would like to generate and select any values that you want to be fixed and the number of samples and click 'Run'. 

**Exploring Sampling Results:**
In the sample results display that will appear on the right side of the screen  users can see the summary statistics resulting from sampling the attack ladder. Below the summary statistics the first 10 samples of the attack ladder are also shown. These can be useful in understanding in debugging any errors made while the user was specifyng the attack ladder. In addition, users can choose among the following:

*Resample:*
Generate another set of samples from the attack ladder.

*Reset:*
Go back to the settings menu that will appear on the right side of the screen identify the number of samples you would like to generate and select any values that you want to be fixed and the number of samples and click 'Run'. 

*Summary:*
Download the summary statistics resulting from sampling the attack ladder as a .csv file.

*Samples:*
Download the samples generated for the attack ladder as a .csv file.

## Load/Export Attack Ladders

**Load an Attack Ladder:** 
From the 'Load\Save' menu option - select 'Import JSON' option to import a .json file representing an attack ladder.

**Export an Attack Ladder:**  
From the 'Load\Save' menu option - select 'Export JSON' option to export a .json file representing an attack ladder. From the 'Load\Save' menu option - select 'Export PNG' option to export a .png image representing an attack ladder. 

## Zoom(ing) Scale
The zooming scale indicator shows if the user has zoomed in or out on the canvas. The zoom in/out limits are 0.5 - 2.0.
