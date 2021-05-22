# Selected Research Projects

### COVID-19 Case and Vaccine Forecasting at the County-Level for Virginia

Developed a model at the city and county level of Virginia that gives a short-term forecast for the total number of COVID-19 cases, COVID-19 vaccines administered and supplied. Available at: https://vmasc.shinyapps.io/va-county-covid-forecast/. 
* Provides a 7-day forecast for the number of COVID-19 cases and a 21-day forecast for the COVID-19 vaccines administered and supplied.
* Case forecast for the city/county estimates the age range of individuals with COVID-19 and what their case outcomes are expected to be. 
* Attempts to identify tweets from individuals within the city/county that are reporting having COVID-19. 
* Designed to be as transparent as possible: for each forecast or piece of insight it provides it tries to describe the methodology behind how it came to that prediction in a straightforward way. 
* Has used by the Virginia Department of Health, the Virginia Department of Emergency Management and has over 1,000 different unique users from the public across 75 different cities or counties within Virginia.

#### Related Publications

* Lynch, C. J., & Gore, R. (2021). [Short-Range Forecasting of COVID-19 During Early Onset at County, Health District, and State Geographic Levels Using Seven Methods: Comparative Forecasting Study.](https://www.jmir.org/2021/3/e24925/) *Journal of medical Internet research*, *23*(3), e24925.
* Lynch, C. J., & Gore, R. (2021). [Application of one-, three-, and seven-day forecasts during early onset on the COVID-19 epidemic dataset using moving average, autoregressive, autoregressive moving average, autoregressive integrated moving average, and naïve forecasting methods](https://doi.org/10.1016/j.dib.2021.106759). *Data in Brief*, *35*, 106759.

#### Selected Media Coverage

* April 8, 2021. [ODU Research Helping Virginia Plot COVID-19 Vaccine Strategy](https://www.odu.edu/about/odu-publications/insideodu/2021/04/08/feature1)

* March 28, 2021. [How best to predict where coronavirus strikes? ODU forecasters have spent the past year trying.](https://www.pilotonline.com/news/health/vp-nw-covid-odu-forecast-model-20210328-2ycjrnlnrzdpxivc2gnalorjty-story.html)

* April 30, 2020. [Medium: With data-driven models, every day of COVID-19 can tell us more about what happens next.](https://medium.com/@ODUVMASC/with-data-driven-models-every-day-of-covid-19-can-tell-us-more-about-what-happens-next-3527a99549de?sk=2f13445bfb119503ef7b1c8aa2662708)

* April 23, 2020. [Norfolk 10 News (WAVY.com): ODU creates daily COVID-19 forecast model to predict future cases in your area](https://www.wavy.com/news/health/coronavirus/odu-creates-daily-covid-19-forecast-model-to-predict-future-cases-in-your-area/)

  

## Leveraging Data Artifacts to better understand human behavior 

A major focus of my research is leveraging data that is an artifact of the way we live to better understand human behavior. Typically, this data takes the form of social media data, anomyized GPS mobility data, and anomyized SMS messages and cell phone records. My aim is to novel insight about human behavior by quantifying and anlayzing these data sources.

### You Are What You Tweet
We studied the relationship among the obesity rate of urban areas and expressions of happiness, diet and physical activity on social media. We showed that areas with lower obesity rates: (1) have happier tweets and frequently discuss (2) food, particularly fruits and vegetables, and (3) physical activities of any intensity.

#### Related Publications

* Gore, R. J., Diallo, S., & Padilla, J. (2015). [You are what you tweet: connecting the geographic variation in america’s obesity rate to Twitter content](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0133505). *PloS one*, *10*(9), e0133505.

#### Selected Media Coverage

* January 14, 2016. [ODU Modeling & Simulation Researcher Looks for Clues in Big Data](https://www.odu.edu/news/2016/1/vmasc_big_data#.YKkNykhKheu)

### Understanding how the locals and tourists react differently to city attractions

We studied how the time of day and if individuals were locals or tourists can affect the sentiment individuals express towards attractions. We showed that: (1) tourists express more positive sentiment towards attractions than locals and (2) more positive sentiment is expressed about attractions in the morning vs. the afternoon / evening.

#### Related Publications

* Padilla, J. J., Kavak, H., Lynch, C. J., Gore, R. J., & Diallo, S. Y. (2018). [Temporal and spatiotemporal investigation of tourist attraction visit sentiment on Twitter](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0198857). *PloS one*, *13*(6), e0198857.

### Characterizing the Mobile Phone Use Patterns of Refugee-Hosting Provinces in Turkey

We used an anomyized mobile phone data set to understand the experience of refugees throughout Turkey based on their proximity to refugee targeted violent incidents and refugee camps. We showed that: (1) there is more negative sentiment targeted expressed towards refugees in those areas close to refugee camps and (2) the mobile phone behavior (i.e. number of calls made and text messages sent) in the wake of a violent incident for refugees and non-refugees is more similar the close the individuals are to the location of the incident. The research won the "Safety and Security Prize" in the Data For Refugees (D4R) challenge sponsored by Turk Telecom.

#### Related Publications

* Frydenlund, E., Şener, M. Y., Gore, R., Boshuijzen-van Burken, C., Bozdag, E., & de Kock, C. (2019). [Characterizing the Mobile Phone Use Patterns of Refugee-Hosting Provinces in Turkey.](/turkey-refugee-analysis-paper.pdf) In *Guide to Mobile Data Analytics in Refugee Scenarios* (pp. 417-431). Springer, Cham.



## Simulation Debugging, Verification Validation

 The process of developing, verifying and validating models and simulations should be straightforward. Unfortunately, following conventional development approaches can render a model design that appeared complete and robust into an incomplete, incoherent and invalid simulation during implementation. An alternative approach is for subject matter experts (SMEs) to employ formal methods to describe their models. However, formal methods are rarely used in practice due to their intimidating syntax and semantics rooted in mathematics.

To address this problem I have developed an approach to gaining insight about unexpected outputs, in some cases bugs, centered around the practice of predicate-based statistical debugging used in software engineering. This approach is realized in a standalone tool published on my [Github](https://github.com/rossgore/IVandVLevelChecker) and in an [online web application](https://vmasc.shinyapps.io/VandVCalculator/). We have a small but regular user base (~25-50 users) and we are always looking to grow it.

#### Related Publications and Slides

* Gore, R., Reynolds Jr, P. F., Kamensky, D., Diallo, S., & Padilla, J. (2015). [Statistical debugging for simulations.](/tomacs-statistical-debugging.pdf) *ACM Transactions on Modeling and Computer Simulation (TOMACS)*, *25*(3), 1-26.
* Diallo, S. Y., Gore, R., Lynch, C. J., & Padilla, J. J. (2016). [Formal methods, statistical debugging and exploratory analysis in support of system development: Towards a verification and validation calculator tool.](/towards-a-v-and-v-calculator.pdf) *International Journal of Modeling, Simulation, and Scientific Computing*, *7*(01), 1641001.
* Gore, R. J., Lynch, C. J., & Kavak, H. (2017). [Applying statistical debugging for enhanced trace validation of agent-based models.](/Applying_statistical_debugging_for_enhanced_trace_.pdf) *Simulation*, *93*(4), 273-284.





