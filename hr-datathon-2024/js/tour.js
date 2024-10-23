var startTour = function() {

    var tour = new Tour({
        //TODO change to local storage??
        storage : false,
        onStart : function(tour) {
          loadDefaultNetwork("files/nets/burglaryNet.json", true);
        }
    });

    tour.addSteps([
      {
        element: ".tour-step.tour-step-zero",
        placement: "bottom",
        orphan: true,
        backdrop:true ,
        title: "Welcome to the OERI / VMASC 2024 Datathon Submission!",
        content: "Our submission is exploring the resilience of the Hampton Roads Hurricane Evacuation routes under a number of different circumstances."
      }
    ]);

    // Initialize the tour
    tour.init();

    // Start the tour
    tour.start();

};

d3.select("#tutorial")
  .on("click", function() {
    // loadDefaultNetwork();
    startTour();
  });
