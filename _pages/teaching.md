---
layout: archive
title: "Teaching"
permalink: /teaching/
author_profile: true
---

While teaching is not part of my duties as a research faculty, I engage in teaching at as often as I can. As part of two research grants I am co-principle investigator on, I teach data analytics courses on data science and predictive analytics at the Navy’s four different publicly owned shipyards. These courses are designed specifically for the shipyards and their requirements enabling them to explore data, look for patterns, identify efficiencies and improvements that can be made. I have had a lead role in developing the curriculum for the courses and traveling on site to teach the courses. In particular I have focused on determining the most effective way to teach complex topics like artificial intelligence and deep learning in a way so that students can understand when and how to effectively use these analytic methods in their day to day workflow but also understand the assumptions and pitfalls that can be associated with them.

{% include base_path %}

{% for post in site.teaching reversed %}
  {% include archive-single.html %}
{% endfor %}
