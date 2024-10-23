import pandas as pd
import matplotlib.pyplot as plt
import os
import json
import numpy as np 
import matplotlib.pyplot as plt
import matplotlib.colors as mcolors

folder_path = '../summary' 

def read_and_process_json_files(folder_path):
    # Initialize a list to hold each group's data as a dictionary
    group_data = []
    # Dictionary to keep the previous file's scores for comparison
    previous_scores = {}

    for filename in sorted(os.listdir(folder_path)):
        if filename.endswith('.json'):
            file_path = os.path.join(folder_path, filename)
            # Load the JSON file
            with open(file_path) as f:
                data = json.load(f)
                # Iterate over each group in the JSON file
                for group_name, scores in data.items():
                    # Prepare a dictionary for the current group with increment values
                    group_dict = {'Group': group_name}
                    for node, score in scores.items():
                        # Calculate the increment as current score minus previous score, if exists
                        increment = score - previous_scores.get(node, 0)
                        # For the first file, the increment is the score itself
                        if not previous_scores:
                            increment = score
                        group_dict[f'Node_{node}'] = increment
                    # Update the previous scores to current for the next iteration
                    previous_scores = scores
                    # Append the dictionary with increment values to the list
                    group_data.append(group_dict)
    
    # Convert the list of dictionaries to a DataFrame
    df = pd.DataFrame(group_data)
    
    return df
def categorize_node(idx):
    node_num = int(idx.split('_')[1])  # Extract the numeric part of the node index
    if node_num <= 5:
        return 'Entry ' + idx.replace('_', ' ')
    elif 6 <= node_num <= 11:
        return 'Interior ' + idx.replace('_', ' ')
    else:
        return 'End ' + idx.replace('_', ' ')


def plot_data(df):
    
    plot_data = df.iloc[:,1:].transpose()

    # Define a custom color map
    cmap = mcolors.LinearSegmentedColormap.from_list("", ["green", "yellow", "red"])

    # Normalize plot_data to range between 0 and 1 for the custom colormap
    plot_data_normalized = (plot_data - plot_data.min().min()) / (plot_data.max().max() - plot_data.min().min())

    # Plotting using imshow
    fig, ax = plt.subplots(figsize=(30, 12))  # Adjust the figure size as needed
    im = ax.imshow(plot_data_normalized, aspect='auto', cmap=cmap)

    # Add colorbar
    cbar = ax.figure.colorbar(im, ax=ax)
    cbar.ax.set_ylabel("Sampling Score", rotation=-90, va="bottom",fontsize=14)

    # We want to show all ticks...
    ax.set_xticks(np.arange(len(df['Group'])))
    ax.set_yticks(np.arange(len(plot_data.index)))

    # ... and label them with the respective list entries
    ax.set_xticklabels(df['Group'])

    labels = [categorize_node(idx) for idx in plot_data.index]


    yaxis = [idx.replace('_', ' ') for idx in labels]
    ax.set_yticklabels(yaxis)

    # Rotate the tick labels and set their alignment.
    plt.setp(ax.get_xticklabels(), rotation=90, ha="right", rotation_mode="anchor")
    # Adding a more defined grid
    ax.set_xticks(np.arange(plot_data_normalized.shape[1]+1)-.5, minor=True)
    ax.set_yticks(np.arange(plot_data_normalized.shape[0]+1)-.5, minor=True)
    ax.grid(which="minor", color="black", linestyle='-', linewidth=2)
    ax.tick_params(which="minor", size=0)

    # Remove grid from major ticks to clean up the plot
    ax.grid(which="major", color="b", linestyle='', linewidth=0)

    plt.tick_params(axis='x', labelsize=12)
    plt.tick_params(axis='y', labelsize=12)
    plt.xlabel('Attack Group',fontsize=14)
    plt.ylabel('Nodes',fontsize=14)
    plt.title("Heatmap of Mitre Attack Group Batch Sampling Scores by Node",fontsize=16)
    plt.savefig('all_nodes_headless_sampling.png')
    plt.close()

if __name__ == "__main__":
    sorted_df = read_and_process_json_files(folder_path)
    #print(sorted_df)
    plot_data(sorted_df)