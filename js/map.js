/*jslint white: true */
function webVoteMap(element, data, options) {

  // Configurable variables
  var defaults_map = {
    width: 860,
    height: 500,
    transitionDuration: 750,
    zoomLevel: 10,
    staticUrl: "http://leela.sscnet.ucla.edu/voteview_static/" // URL where the static content is stored(images...)
  };

  // Compose Settings Object
  var settings = $.extend(defaults_map, options);

  var aspect = settings.width / settings.height;

  // Get some D3 DOM objects and create others
  var projection = d3.geo.albersUsa();
  var path = d3.geo.path().projection(projection);
  var svgmap, g, sb;
  var tooltip = d3.select("body").append("div").attr("class", "wvv-tooltip");

  // Map vote choices
  var voteChoices = {
    "1": 'Yea', "2": "Yea", "3": "Yea", 
    "4": "Nay", "5": "Nay", "6": "Nay", 
    "7": "Abs", "8": "Abs", "9": "Abs"
  };

  // Dictionaries of members
  var congressMembers = {};
  var senateMembers = {};

  // Define the colors of the political parties and votes
  var partyColors = {
    "YeaFederalist": "#0000FF",
    "NayFederalist": "#AAAAFF",
    "AbsFederalist": "#DDD",
    "YeaDemocrat": "#0000FF",
    "NayDemocrat": "#AAAAFF",
    "AbsDemocrat": "#DDD",
    "YeaFarmer-Labor": "#0000FF",
    "NayFarmer-Labor": "#AAAAFF",
    "AbsFarmer-Labor": "#DDD",
    "YeaProgressive": "#0000FF",
    "NayProgressive": "#AAAAFF",
    "AbsProgressive": "#DDD",
    "YeaRepublican": "#FF0000",
    "NayRepublican": "#FFAAAA",
    "AbsRepublican": "#DDD",
    "YeaIndependent": "#FFDD00",
    "NayIndependent": "#FFDDAA",
    "AbsIndependent": "#DDD"
  };


  // Initialise
  chart(element, data);

  // Set the member dictionary
  function mapCongressMembersVotes(members, votation) {
    members.forEach(function(d) {
      if (d.id in votation.votes) { // If the member had voted
        var dist = parseInt(d.districtCode, 10) > 70 ? 0 : parseInt(d.districtCode, 10);  // 00 = At large
        d.vote = votation.votes[d.id]; // Add the vote to the member
        if (congressMembers[sprintf("%s%02d", d.stateAbbr, dist)] !== undefined) {
          congressMembers[sprintf("%s%02d", d.stateAbbr, dist)].push(d);
        }
        else {
          congressMembers[sprintf("%s%02d", d.stateAbbr, dist)] = [d];
        }
      }
     });
  }

  function mapSenateMembersVotes(members, votation) {
    members.forEach(function(d) {
        if (d.id in votation.votes) { // If the member had voted
           d.vote = votation.votes[d.id]; // Add the vote to the member
           if (senateMembers[d.stateAbbr] != undefined) {
            senateMembers[d.stateAbbr].push(d);
           }
           else {
            senateMembers[d.stateAbbr] = [d];
           }
        }
     });
  }

  // Render the tooltip
  function tooltipHTML(members, id) {
    var tooltipContent = "";
    var index;
    var allMembers = members[id];
    var atLargeMembers = members[members[id][0].stateAbbr + "00"];
    if (atLargeMembers !== undefined) {
      allMembers = $.unique(members[id].concat(atLargeMembers));
    }
    for (index in allMembers) {
      tooltipContent += sprintf("<img src=\"%simg/img%06ds.png\" onerror=\"null;this.src='img/no_image.png';\"/><p><strong>%s</strong></p><p>%s %s</p><p>Vote:%s</p>", settings.staticUrl, parseInt(allMembers[index].icpsr), allMembers[index].fname, allMembers[index].partyname, allMembers[index].cqlabel, allMembers[index].vote);
    }
    return tooltipContent;
  }

  // Function to shade the districts
  function shadeDistricts(votation) {
     g.selectAll(".district")
       .style('fill',function(d, i) {
         if (d.id in congressMembers) {
           if (congressMembers[d.id].length > 1) {  // If we are in a district with several members
            var atlargeColors = []; // Array with all the colors for this district
            for (member in congressMembers[d.id]) {
              atlargeColors.push(partyColors[voteChoices[congressMembers[d.id][member].vote] + congressMembers[d.id][member].partyname]);
            }
            return blendColors(atlargeColors);
           }
           var m = congressMembers[d.id][0];
           if (m.id in votation.votes) {
              return partyColors[voteChoices[votation.votes[m.id]] + m.partyname];
           }
           // return 'district ' + m.partyname; 
           return "red";
         }
         // return 'district';
         return "beige";
      });
  }

  function shadeStates(votation) {
    sb.selectAll(".state")
      .style('fill',function(d, i) {
        if (d.id in senateMembers) {
          if (senateMembers[d.id].length > 1) {  // If we are in a state with several members
            var atlargeColors = []; // Array with all the colors for this state
            for (member in senateMembers[d.id]) {
              atlargeColors.push(partyColors[voteChoices[senateMembers[d.id][member].vote] + senateMembers[d.id][member].partyname]);
            }
            return blendColors(atlargeColors);
           }
            var m = senateMembers[d.id][0];
            if (m.id in votation.votes) {
              return partyColors[voteChoices[votation.votes[m.id]] + m.partyname];
            }
            return "red";
          }
        return "beige";
      });
  }

  // Zoom on click
  function clicked(d) {
    var x, y, zoomLevel, stroke;
    if (d && centered !== d) {
      var centroid = path.centroid(d);
      x = centroid[0];
      y = centroid[1];
      zoomLevel = settings.zoomLevel;
      centered = d;
      stroke = 0.15;
    } else {
      x = settings.width / 2;
      y = settings.height / 2;
      zoomLevel = 1;
      centered = null;
      stroke = 1;
    }

    g.selectAll("path")
        .classed("active", centered && function(d) { return d === centered; });

    g.transition()
        .duration(settings.transitionDuration)
        .attr("transform", "translate(" + settings.width / 2 + "," + settings.height / 2 + ")scale(" + zoomLevel + ")translate(" + -x + "," + -y + ")")
        .style("stroke-width", stroke + "px");

    sb.selectAll("path")
        .classed("active", centered && function(d) { return d === centered; });

    sb.transition()
        .duration(settings.transitionDuration)
        .attr("transform", "translate(" + settings.width / 2 + "," + settings.height / 2 + ")scale(" + zoomLevel + ")translate(" + -x + "," + -y + ")")
        .style("stroke-width", stroke + "px");
  }

  // Blend an array of colors
  function blendColors(colors) {
    var r = 0, g = 0 , b = 0, i, rgbColor;
    for (i=0; i<colors.length; i++) {
      rgbColor = d3.rgb(colors[i]);
      r = r + rgbColor.r;
      g = g + rgbColor.g;
      b = b + rgbColor.b; 
    }
    r = r / colors.length;
    g = g / colors.length;
    b = b / colors.length;
    return d3.rgb(r,g,b).toString();
  }

  // Resize function to make the map smaller, combined with onresize event can make responsive charts
  function resizeMap() {
      var targetWidth = svgmap.node().parentNode.offsetWidth;
      svgmap.attr("width", targetWidth);
      svgmap.attr("height", targetWidth / aspect);
  }

  // Main function to draw the map after data load
  function chart(element, data) {
    var centered;
    svgmap = d3.select(element)
      .attr("xmlns", "http://www.w3.org/2000/svg")
      .attr("width", settings.width)
      .attr("height", settings.height)
      .attr("viewBox", "0 0 860 500")
      .attr("preserveAspectRatio", "xMidYMid");

    sb = svgmap.append("g");

    mapSenateMembersVotes(data.members, data.votation);
    mapCongressMembersVotes(data.members, data.votation);

    if (data.votation.chamber === "Senate") {
      // Color the states
      sb.selectAll(".state")
        .data(topojson.feature(data.states, data.states.objects.states).features).enter().append("path")
        .attr("id", function(d) { return d.id; } )
        .attr("class", "state")
        .attr("d", path)        
        .on("mousemove", function(d) {
          tooltip
            .classed("hidden", false)
            .style("left", d3.event.pageX + 10 + "px")
            .style("top", d3.event.pageY + 5 + "px")
            .html(tooltipHTML(senateMembers, d.id));
        })
        .on("mouseout",  function(d) {
          tooltip.classed("hidden", true);
        });

      shadeStates(data.votation);
    }
    else if (data.votation.chamber === "House") {
      g = svgmap.append("g").attr("id","map-group");
      // Color the districts
      g.selectAll(".district")
        .data(topojson.feature(data.districts, data.districts.objects.districts).features).enter().append("path")
        .attr("id", function(d) { return d.id; } )
        .attr("class", "district")
        .attr("d", path)
        .on("click", clicked)
        .on("mousemove", function(d) {
          tooltip
            .classed("hidden", false)
            .style("left", d3.event.pageX + 10 + "px")
            .style("top", d3.event.pageY + 5 + "px")
            .html(tooltipHTML(congressMembers, d.id));
        })
        .on("mouseout",  function(d) {
          tooltip.classed("hidden", true);
        });

      // // Add state boundaries
      sb.append("path")
        .datum(topojson.mesh(data.states, data.states.objects.states, 
             function(a, b) { return a.id !== "AK" && a.id !== "HI"; }))
        .attr("d", path)
        .attr("class", "state-boundary");

      shadeDistricts(data.votation);
    }

    resizeMap();
  }
}

