/*jslint white: true */
function WebVoteMap(element, data, options) {

  // Configurable variables
  var defaults_map = {
    width: 860,
    height: 500,
    transitionDuration: 750,
    zoomLevel: 20,
    staticUrl: "/vv/static/img/bios/" // URL where the static content is stored(images...)
  };

  // Compose Settings Object
  var settings = $.extend(defaults_map, options);

  var aspect = settings.width / settings.height;

  // Get some D3 DOM objects and create others
  var projection = d3.geo.albersUsa();
  var path = d3.geo.path().projection(projection);
  var svgmap, g, sb, buttonUnzoom;
  var centered;
  var tooltip = d3.select("body").append("div").attr("class", "wvv-tooltip");

  // Map vote choices
  var voteChoices = {
    "1": "Yea", "2": "Yea", "3": "Yea", 
    "4": "Nay", "5": "Nay", "6": "Nay", 
    "7": "Abs", "8": "Abs", "9": "Abs"
  };
        

  // Dictionaries of members
  var congressMembers = {};
  var senateMembers = {};

  // map.js
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
    // Add the at large members to each district
    for (var district in congressMembers) {
      if (district.substr(2,4) !== "00") {
        var atlargeindex = district.substr(0,2) + "00";
        for (member in congressMembers[atlargeindex]) {
          congressMembers[district].push(congressMembers[atlargeindex][member]);
        }
      }
    };
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
    var tooltipContent = "No info for this region";
    var allMembers = members[id];
    if (allMembers) tooltipContent = "";
    for (var index in allMembers) {
      tooltipContent += sprintf("<img src=\"%simg/img%06ds.png\" onerror=\"null;this.src='vv/static/img/no_image.png';\"/><p><strong>%s</strong></p><p>%s %s</p><p>Vote:%s</p>", settings.staticUrl, parseInt(allMembers[index].icpsr), allMembers[index].fname, allMembers[index].partyname, allMembers[index].cqlabel, allMembers[index].vote);
    }
    return tooltipContent;
  }

  // Function to shade the districts
  function shadeDistricts(votation) {
     g.selectAll(".district")
       .style('fill',function(d, i) {
         if (congressMembers.hasOwnProperty(d.id)) {
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
         }
         return 'white';
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
    var x, y, zoomLevel;
    if (d && centered !== d) {
      var centroid = path.centroid(d);
      x = centroid[0];
      y = centroid[1];
      zoomLevel = settings.zoomLevel;
      centered = d;
      buttonUnzoom.style("display", "block");
    } else {
      x = settings.width / 2;
      y = settings.height / 2;
      zoomLevel = 1;
      centered = null;
      buttonUnzoom.style("display", "none");
    }

    g.selectAll("path")
        .classed("active", centered && function(d) { return d === centered; });

    g.transition()
        .duration(settings.transitionDuration)
        .attr("transform", "translate(" + settings.width / 2 + "," + settings.height / 2 + ")scale(" + zoomLevel + ")translate(" + -x + "," + -y + ")")
        .style("stroke-width", 1.2/zoomLevel + "px");

    sb.selectAll("path")
        .classed("active", centered && function(d) { return d === centered; });

    sb.transition()
        .duration(settings.transitionDuration)
        .attr("transform", "translate(" + settings.width / 2 + "," + settings.height / 2 + ")scale(" + zoomLevel + ")translate(" + -x + "," + -y + ")")
        .style("stroke-width", 1.2/zoomLevel + "px");
  }

  // Blend an array of colors
  function blendColors(colors) {
    var r = 0, g = 0 , b = 0, i, rgbColor;
    for (i = 0; i < colors.length; i++) {
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

      var mapTopo = topojson.feature(data.districts, data.districts.objects.districts).features;
      console.log(data);
      var atLarge = mapTopo.filter(function(d) {return d.id.substr(2,4) === "00";});
      var districts = mapTopo.filter(function(d) {return d.id.substr(2,4) !== "00";});

      g = svgmap.append("g").attr("id","map-group");

      // This is a little hack, since sometimes at large states are drawn on top of the districts
      // we filter the atlarge and draw them first and of top of them we draw the normal districts
      g.selectAll(".district .atLarge")
        .data(atLarge).enter().append("path")
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

       g.selectAll(".district .notatLarge")
        .data(districts).enter().append("path")
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

      // Add state boundaries
      sb.append("path")
        .datum(topojson.mesh(data.states, data.states.objects.states, 
             function(a, b) { return a.id !== "AK" && a.id !== "HI"; }))
        .attr("d", path)
        .attr("class", "state-boundary");

      shadeDistricts(data.votation);
    }

    resizeMap();

    buttonUnzoom = svgmap.append("foreignObject")
        .attr("x", 50)
        .attr("y", 20)
        .attr("width", 70)
        .attr("height", 30)
      .append("xhtml:body")
        .style("display", "none")
        .html('<button>Unzoom</button>')
        .on("click", clicked);

  }
}
