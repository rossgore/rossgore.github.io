---
title: "Statistical debugging with elastic predicates"
collection: publications
category: conferences
permalink: /publication/2011-elastic-predicates
excerpt: 'This paper is about statistical debugging with elastic predicates. These predicates adapt to interesting value ranges of numeric variables in scientific software to help automatically find the location of bugs.'
date: 2011-01-01
venue: '2011 26th IEEE/ACM International Conference on Automated Software Engineering (ASE 2011)'
paperurl: 'http://rossgore.github.io/files/elastic_predicates.pdf'
citation: 'Gore, Ross, Reynolds, Paul F, Kamensky, David. (2011). "Statistical debugging with elastic predicates." <i>2011 26th IEEE/ACM International Conference on Automated Software Engineering (ASE 2011)</i>. 492-495.'
---
Traditional debugging and fault localization methods have addressed localization of sources of software failures. While these methods are effective in general, they are not tailored to an important class of software, including simulations and computational models, which employ floating-point computations and continuous stochastic distributions to represent, or support evaluation of, an underlying model. To address this shortcoming, we introduce elastic predicates, a novel approach to predicate-based statistical debugging. Elastic predicates introduce profiling of values assigned to variables within a failing program. These elastic predicates are better predictors of software failure than the static and uniform predicates used in existing techniques such as Cooperative Bug Isolation (CBI). 