import networkx as nx
import matplotlib.pyplot as plt
import random
import json
import subprocess
import itertools
import numpy as np
import os
from os import listdir
from os.path import isfile, join
import argparse
import sys

### ---------------------------------------------------------------------------------------
### Generates attack ladder based on a directed graph structured by rungs nodes and edges
### randomly generates based on specified number of rungs, the max nodes (maxN) and the max edges (maxE)
### maxN and maxE are the maximum number of nodes and edges that can be connected to the prior rung
### ---------------------------------------------------------------------------------------
def a_ladder_graph(rungs=5, maxN=2, maxE=2):
    #initialize directed graph
    G = nx.DiGraph()
    
    #for each rung, add random number of nodes between 1 and maxN and connect them to prior rung
    priorRung = []
    nodeCount = 1
    for i in range(rungs):
        n_ran = random.randint(1,maxN)
        currentRung = []
        for j in range(n_ran):
            G.add_node(nodeCount)
            currentRung.append(nodeCount)
            nodeCount += 1
            if len(priorRung) > 0:                
                for k in priorRung:
                    e_ran = random.randint(0,maxE)
                    for e in range(e_ran):
                        chosenDest = random.choice(currentRung)
                        if not G.has_edge(k,chosenDest):
                            G.add_edge(k,chosenDest)                                                            
                            
        priorRung = currentRung.copy()

    return G

### ---------------------------------------------------------------------------------------
### Generates the table structure for the attack ladder
### recursively dives through the dictionary of dictionaries to get to the bottom
### sets the values for the bottom nodes based on random value rounded to 2 decimal
### ---------------------------------------------------------------------------------------
def create_table(depth, keys, values):
    if depth == len(keys) - 1:
        randomVal = round(random.random(), 2)        
        return {f'{keys[-1]}yes': randomVal, f'{keys[-1]}no': round((1 - randomVal), 2)}
    else:
        key = keys[depth]
        return {key + 'yes': create_table(depth + 1, keys, values),
                key + 'no': create_table(depth + 1, keys, values)}

### ---------------------------------------------------------------------------------------
### Test function to try out defined values with create_table function
### ---------------------------------------------------------------------------------------
def runTableTest():
    # Example usage with four sets of values
    ids  = ['1', '2']
    values_list = []
    #dimensions = 2**len(ids)
    dimensions = len(ids)

    for d in range(dimensions):
        randomVal = round(random.random(), 2)
        values_list.append(randomVal)
        values_list.append(round((1 - randomVal), 2))

    print("Dimensions = ", dimensions)
    print("Values = ", values_list)
    json_object = {"tbl": create_table(0, ids, values_list)}
    print(json_object)

### ---------------------------------------------------------------------------------------
### function to interact with create table and return the complete json structure for attack ladders
### ---------------------------------------------------------------------------------------
def runTable(selfid, ids):
    values_list = []
    dimensions = 2**len(ids)    
        
    # create a list of random values of count dimensions
    for d in range(dimensions):
        randomVal = round(random.random(), 2)
        values_list.append(randomVal)
        values_list.append(round((1 - randomVal), 2))

    ids.sort()
    ids.append(selfid)
        
    json_object = {"tbl": create_table(0, ids, values_list)}
    
    return json_object

### ---------------------------------------------------------------------------------------
### function to create and write json file from networkx graph
### ---------------------------------------------------------------------------------------
def createJson(jsonFile, G):
    nodes = []
    for i in G.nodes:
        nodes.append(G.nodes[i])
    # convert G.edges into an array
    edges = []
    for i in G.edges:
        edges.append({"source": G.nodes[i[0]], "target": G.nodes[i[1]]})

    # create a dictionary of nodes and edges
    data = {"nodes": nodes, "edges": edges}

    # create a json file of the dictionary
    with open(jsonFile, 'w') as outfile:
        json.dump(data, outfile)

def writeJson(jsonFile, data):
    with open(jsonFile, 'w') as outfile:
        json.dump(data, outfile)

### READ in data.json and save as a graph and dictionary of json file
# read in data.json
def readJson(attackLadderFile):
    with open(attackLadderFile) as json_file:
        data = json.load(json_file)
        #print(data)
        #print(data['nodes'])

        # create a graph
        G = nx.DiGraph()
        # add nodes
        for n in data['nodes']:
            G.add_node(n['id'])
            G.nodes[n['id']]['title'] = n['title']
            G.nodes[n['id']]['functionalities'] = n['functionalities']
            G.nodes[n['id']]['vulnerabilities'] = n['vulnerabilities']
            G.nodes[n['id']]['attack_techniques'] = n['attack_techniques']
            G.nodes[n['id']]['x'] = n['x']
            G.nodes[n['id']]['y'] = n['y']
            G.nodes[n['id']]['values'] = n['values']
            G.nodes[n['id']]['tbl'] = n['tbl']
            #G.nodes[n['id']]['sampled'] = n['sampled']
            G.nodes[n['id']]['id'] = n['id']
            G.nodes[n['id']]['orderId'] = n['orderId']

        # add edges
        for e in data['edges']:
            G.add_edge(e['source']['id'], e['target']['id'])

        # display randGraph
        print(G.nodes)
        print(G.edges)
    return data, G


def createRandAG(r=5, n=10, e=5):
    # Create a random directional graph with 10 nodes and 20 edges
    #G = nx.gnm_random_graph(5, 8, directed=True)
    G = a_ladder_graph(rungs=5, maxN=10, maxE=5)#nx.ladder_graph(5)

    # Create positions for the nodes in a tree layout
    pos = nx.random_layout(G)

    # for each node in G assign a string title
    for i in G.nodes:
        G.nodes[i]['title'] = 'node ' + str(i)
        G.nodes[i]['functionalities'] = []
        G.nodes[i]['vulnerabilities'] = []
        G.nodes[i]['attack_techniques'] = []  

        G.nodes[i]['x'] = round(float(pos[i][0]), 2)
        G.nodes[i]['y'] = round(float(pos[i][1]), 2)
        G.nodes[i]['values'] = ["yes", "no"]
        
        ids = []
        for e in G.in_edges(i):
            ids.append(str(e[0]))

        G.nodes[i]['tbl'] = runTable(str(i), ids)['tbl']


        G.nodes[i]['sampled'] = "false"
        G.nodes[i]['id'] = i
        G.nodes[i]['orderId'] = i

    # draw the graph with labels
    #nx.draw(G, pos, with_labels=True)
    #plt.show()
    return G

### Recursive function to go to the end of the tbl datastructure used by attack ladder
### This can be used to traverse the dictionary of dictionaries to get to the final key value pairs in order to update them

def deepdiveDict(d, depth=0, focusedKey={}):    
    for k in d.copy():
        if isinstance(d[k], dict):
            if 'yes' in k:
                deepdiveDict(d[k], depth+1, focusedKey)
        else:
            if len(focusedKey.keys()) == 0:
                if focusedKey[k] == 0:
                    d[k] = round(random.random(), 2)                                        
                id_val = 0
                if 'yes' in k:
                    id_val = int(k.split('yes')[0])
                    updateKey = str(id_val)+'no'
                    d[updateKey] = round((1 - d[k]), 2)
                else:
                    id_val = int(k.split('no')[0])
                    updateKey = str(id_val)+'yes'
                    d[updateKey] = round((1 - d[k]), 2)            
            else:
                if k in focusedKey.keys():                                                            
                    if focusedKey[k] == -1:
                        d[k] = round(random.random(), 2)                    
                    else:
                        d[k] = focusedKey[k]
                    if 'yes' in k:
                        id_val = int(k.split('yes')[0])                         
                        updateKey = str(id_val)+'no'
                        d[updateKey] = round((1 - d[k]), 2)
                    else:
                        id_val = int(k.split('no')[0])                        
                        updateKey = str(id_val)+'yes'
                        d[updateKey] = round((1 - d[k]), 2)


### Read in flags and check if --function = 'test'
### If so, run the test function
### ---------------------------------------------------------------------------------------
def main():
    parser = argparse.ArgumentParser(description='Generate json structure for attack ladders')
    parser.add_argument('--function', type=str, help='function to run: test, createRandAG, modify')
    parser.add_argument('--inputs', type=str, help='inputs to function: createRandAG - rungs,maxN,maxE : modify - config file')
    parser.add_argument('--filename', type=str, help='filename')
    
    args = parser.parse_args() 
    if args.function == 'test':
        test()
    elif args.function == 'createRandAG':
        G = createRandAG()
        if args.filename:
            createJson(args.filename, G)
        else:
            print("No filename to write to")
            createJson('createdJson.json', G)
    elif args.function == 'modify':
        ### read the input csv file and create dictioniary where keys are the first row and values are the second row
        if 'csv' in args.inputs:
            with open(args.inputs) as f:
                lines = f.readlines()
                
                line_keys = lines[0].split('=')[1]
                line_values = lines[1].split('=')[1]
                keys = line_keys.split(',')
                values = line_values.split(',')
                focusedKey = {}
                for i in range(len(keys)):
                    ### If keys has endline remove it
                    keys[i] = keys[i]+'yes'
                    if '\n' in keys[i]:
                        keys[i] = keys[i].replace('\n', '')

                    focusedKey[keys[i]] = float(values[i])
            print(focusedKey)
        else:
            focusedKey = {}
            
        if args.filename: 
            print("filename = ", args.filename)                   
            data, G = readJson(args.filename)
            for n in range(len(data['nodes'])):
                deepdiveDict(data['nodes'][n]['tbl'], focusedKey=focusedKey)            
            writeJson("output.json", data)
        else:
            print("No filename to modify")
            sys.exit(1)
    else:
        print("No function to run")
        sys.exit(1)

### ---------------------------------------------------------------------------------------
### Test function to run
### ---------------------------------------------------------------------------------------
def test():
    print("successful test")


if __name__ == "__main__":
    main()
    
            