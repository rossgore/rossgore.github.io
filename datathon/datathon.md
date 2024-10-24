# Hampton Roads Hurricane Evacuation Route Resilience Analysis

**Authors:** Virginia Zamponi, Kevin O'Brien, Jessica O'Brien, Erik Jensen, Christopher Lynch, and Ross Gore | OERI / VMASC @ ODU

## Background

Resilient hurricane evacuation routes are crucial for protecting lives and ensuring public safety. They must withstand challenges such as flooding from fast-moving storms, cyber-attacks that could compromise bridge accessibility, and traffic disruptions due to collisions. We offer an interactive online platform for decision-makers to evaluate the resilience of the Hampton Roads Hurricane Evacuation Routes against these scenarios.

Our project utilizes local data on FEMA evacuation zones, potential cyber threats to bridges, and traffic patterns from accidents to create a Bayesian network representation of the evacuation routes. This allows us to simulate and quantify how well the routes can remain operational under different hazards.

The insights gained from this analysis are actionable; they enable emergency responders to strategically position resources based on identified vulnerabilities and direct funding towards strengthening critical infrastructure, ultimately enhancing the overall evacuation strategy.

## Data and Definitions

The evacuation route system's resilience is defined as the percentage of simulations where all four Hampton Roads areas maintain at least one completely unobstructed evacuation route.

**Key data sources include:**
- Hampton Roads Evacuation [Zones](https://vdemgis.maps.arcgis.com/apps/instant/lookup/index.html?appid=98abdbb77b3843dea8f1e7d101771e01) and [Routes](https://va-know-your-zone-vdemgis.hub.arcgis.com/datasets/c4190a6ab7bd4b0587465c8bf999499e_0/explore) ARCGIS data from VDEM
- [CVE](https://nvd.nist.gov/vuln/detail/CVE-2022-1161) and [CVSS](https://www.first.org/cvss/v3.1/specification-document) data on cyber exploit probabilities
- [MITRE ATT&CK data](https://attack.mitre.org/groups/G0034/) on known threat group capabilities
- [GPT4o-generated conditional probabilities](https://rossgore.github.io/hr-datathon-2024/img/road_closure_probabilities_gpt.xlsx) of traffic disruptions within the route system

This method enables comparison of three hurricane evacuation scenarios against a baseline, quantifying changes in route resilience.

## Methods

1. Using the [VDEM Hampton Roads Hurricane Evacuation Route Map](https://va-know-your-zone-vdemgis.hub.arcgis.com/datasets/c4190a6ab7bd4b0587465c8bf999499e_0/explore), we constructed a Bayesian Network.
2. The network is built on a [web-accessible platform](https://rossgore.github.io/hr-datathon-2024/index.html) we created to enable decision-makers in the area to rapidly modify and review changes to the evacuation routes.
3. We simulated a baseline scenario for the resilience of the routes.
4. Using the collected data, we simulated three different scenarios:
   - Possible flooding based on [VDEM Hurricane Evacuation Zones Data](https://vdemgis.maps.arcgis.com/apps/instant/lookup/index.html?appid=98abdbb77b3843dea8f1e7d101771e01). We assume the probability a location floods can be predicted by its evacuation zone. Specificaly we assume areas in Zone A have a 5% chance of flooding, areas in Zone B have a 2.5% chance of flooding, areas in Zone C have a 1% chance of flooding, and areas in Zone D have a 0.5% chance of flooding.
   - A cyber-attack, from threat group [Sandword](https://attack.mitre.org/groups/G0034/), on the vulnerability [CVE-2022-1161](https://nvd.nist.gov/vuln/detail/CVE-2022-1161) in the controller of draw, swing, and lift bridges. Based on the techniques of Sandworm and the exploitability of CVE-2022-1161 we assume each bridge has an 83% chance of being compromised.
   - Possible traffic break during the evacuation due to automobile collisions. For this scenario we asked GPT4o for the [conditional probabilities](https://rossgore.github.io/hr-datathon-2024/img/road_closure_probabilities_gpt.xlsx) of automobile collisions that would cause a traffic break along a route for all roads in the evacuation route system.


## Example Results
![This figure shows the transition from the Hampton Roads Evacuation Route (left), to our Bayesian Network with a 'Blue Sky' scenario simulated (center), to a simulation of a potential cyber attack from a known threat group targeting the draw, swing, and lift bridges along the evacuation routes](datathon-cyber-overview.png)
The figure demonstrates how evacuation route resilience can be drastically reduced when considering cyber threats, particularly those targeting draw, swing, and lift bridges. Our model examines a potential attack by Russian state-sponsored Sandworm exploiting CVE-2022-1161, a vulnerability in bridge control system PLCs. An ARC GIS Map highlighting the evacuation zones, routes, and location of some of the bridges that we created can be found [here](https://odu-gis.maps.arcgis.com/apps/Embed/index.html?webmap=d1607cbdcb8b4d2a803d77a763411729&extent=-78.0079,36.3444,-74.4208,38.1653&zoom=true&previewImage=false&scale=true&search=true&searchextent=true&legend=true&disable_scroll=true&theme=light).

This scenario is plausible given Sandworm's history of targeting industrial control systems and the overlap between their techniques and the technical expertise required to exploit CVE-2022-1161. Combining the cyber data sources, we estimate an 83% chance of success on a given bridge.

The figure shows the attack decreases evacuation system resilience from 100 (extremely resilient) to 30.30 (significantly compromised resilience) due to increased likelihood of impassable bridges in Norfolk/VA Beach and Peninsula routes. To mitigate risks, alternative routes or nearby shelters should be identified and publicized.

## ARCGIS Map of Data Sources
Below is an ARCGIS map showing the evacuation routes, the zones used to generate the flooding probabilities, and the location of two drawbridges along the routes.
<style>.embed-container {position: relative; padding-bottom: 80%; height: 0; max-width: 100%;} .embed-container iframe, .embed-container object, .embed-container iframe{position: absolute; top: 0; left: 0; width: 100%; height: 100%;} small{position: absolute; z-index: 40; bottom: 0; margin-bottom: -15px;}</style><div class="embed-container"><iframe width="500" height="400" frameborder="0" scrolling="no" marginheight="0" marginwidth="0" title="Hurricane Evac with Draw Bridges" src="//odu-gis.maps.arcgis.com/apps/Embed/index.html?webmap=d1607cbdcb8b4d2a803d77a763411729&extent=-78.0079,36.3444,-74.4208,38.1653&zoom=true&previewImage=false&scale=true&search=true&searchextent=true&legend=true&disable_scroll=true&theme=light"></iframe></div>