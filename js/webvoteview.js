// This is the main file
//  - It loads the neccesary data
//  - Calls the widgets
//  - Connect both charts (to be done)


// Main function
function init() {
  var rc =  getUrlVars()['id'];
  loadData(rc[0], parseInt(rc.substr(1,3)), parseInt(rc.substr(4,7)));
};

// AJAX calls to load data
function loadData(chamber, session, rcnum) {
  queue()
    .defer(d3.json, sprintf("json/districts%03d.json", session))
    .defer(d3.json, sprintf("json/states%03d.json", session))
    .defer(d3.json,sprintf("../voteview/getvote?id=%s%03d%04d", chamber, session, rcnum))
    .defer(d3.json,sprintf("../voteview/getmemberslist?session=%d", session))
    .await(drawWidgets);
}

// Call the map and scatterplot widgets
function drawWidgets(error, districts, states, votation, members) {
  if (error) return console.error("Error: ", error);
  setDescription(votation);
  drawMap(error, districts, states, votation, members);
  drawScatter(error, districts, states, votation, members);
}

// Write to the description ids the name, description and date of the votation
function setDescription(vote) {
    d3.select("#wvv-rollcall").html(sprintf("Chamber %s/Congress %d/Rollcall %d", 
                                             vote['chamber'],vote['session'],vote['rollnumber']));
    d3.select("#wvv-description").html(vote['description']);
    d3.select("#wvv-date").html(vote['date']);
}