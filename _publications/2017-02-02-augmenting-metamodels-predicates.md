---
title: "Augmenting bottom-up metamodels with predicates"
collection: publications
category: manuscripts
permalink: /publication/2017-augmenting-metamodels-predicates
excerpt: 'This paper likely discusses a method for enhancing bottom-up metamodels by incorporating predicates, potentially improving the accuracy or interpretability of these models.'
date: 2017-01-01
venue: 'Journal of Artificial Societies and Social Simulation'
paperurl: 'http://rossgore.github.io/files/augmenting_metamodels_predicates.pdf'
citation: 'Gore, Ross; Diallo, Saikou; Lynch, Christopher; Padilla, Jose. (2017). "Augmenting bottom-up metamodels with predicates." <i>Journal of Artificial Societies and Social Simulation</i>. 20(1).'
---
Metamodeling refers to modeling a model. There are two metamodeling approaches for ABMs:(1) top-down and (2) bottom-up. The top down approach enables users to decompose high-level mental models into behaviors and interactions of agents. In contrast, the bottom-up approach constructs a relatively small, simple model that approximates the structure and outcomes of a dataset gathered from the runs of an ABM. The bottom-up metamodel makes behavior of the ABM comprehensible and exploratory analyses feasible. For most users the construction of a bottom-up metamodel entails:(1) creating an experimental design,(2) running the simulation for all cases specified by the design,(3) collecting the inputs and output in a dataset and (4) applying first-order regression analysis to find a model that effectively estimates the output. Unfortunately, the sums of input variables employed by first-order regression analysis give the impression that one can compensate for one component of the system by improving some other component even if such substitution is inadequate or invalid. As a result the metamodel can be misleading. We address these deficiencies with an approach that:(1) automatically generates Boolean conditions that highlight when substitutions and tradeoffs among variables are valid and (2) augments the bottom-up metamodel with the conditions to improve validity and accuracy. We evaluate our approach using several established agent-based simulations.