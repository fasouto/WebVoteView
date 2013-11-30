function webVoteMap(element, data, options) {

  // Configurable variables
  var width = 860,  // default width
      height = 500, // default height
      centered;
  var aspect = width / height;

  var staticUrl = "http://leela.sscnet.ucla.edu/voteview_static/";  // URL where the static content is stored(images...)

  // Get some D3 DOM objects and create others
  var projection = d3.geo.albersUsa();
  var path = d3.geo.path()
      .projection(projection);
  var svgmap, g, sb;
  var tooltip = d3.select("body").append("div") .attr("class", "wvv-tooltip");

  // Map vote choices
  var voteChoices = {'1':'Yea', '2':'Yea', '3':'Yea', '4':'Nay', '5':'Nay',
                     '6':'Nay', '7':'Abs', '8':'Abs', '9':'Abs'};

  var themembers = {};  // Dictionary of members

  // Initialise
  chart(element, data, options);

  // Set the member dictionary
  function mapMembersVotes(members, votation) {
    members.forEach( function(d, i) { // d es el dato, i la iteracion
        if (d.id in votation.votes) {
           var dist = parseInt(d.districtCode) > 70 ? 0 : parseInt(d.districtCode); // ?
           d["vote"] = votation.votes[d.id]; // Add the vote to the member
           if (themembers[sprintf("%s%02d", d.stateAbbr, dist)] != undefined) {
            themembers[sprintf("%s%02d", d.stateAbbr, dist)].push(d);
           }
           else {
            themembers[sprintf("%s%02d", d.stateAbbr, dist)] = [d];
           }
        }
     })
  }

  // Render the tooltip
  function tooltipHTML(members) {
    var tooltipContent="";
     for (var index in members) {
       tooltipContent += sprintf("<img src=\"%simg/img%06ds.png\" onerror=\"null;this.src='img/no_image.png';\"/><p><strong>%s</strong></p><p>%s %s</p><p>Vote:%s</p>", staticUrl, parseInt(members[index]['icpsr']), members[index]['fname'], members[index]['partyname'], members[index]['cqlabel'], members[index]['vote']);
     }
     return tooltipContent;
  }

  // Function to shade the districts
  function shadeDistricts(votation) {
     g.selectAll(".district")
       .attr('class',function(d, i) {
         if (d.id in themembers) {
           // If we are in a district with several members
           if (themembers[d.id].length > 1) {
            return 'district AtLarge'; // #FIXME We have to figure out how to color the at large districts
           }
           var m = themembers[d.id][0];
           if (m.id in votation.votes) {
              return 'district ' + voteChoices[votation.votes[m.id]] + ' '+  m.partyname;
           }
           return 'district ' + m.partyname; 
         }
         return 'district';
      })
  }

  // Zoom on click
  function clicked(d) {
    var x, y, k;

    if (d && centered !== d) {
      var centroid = path.centroid(d);
      x = centroid[0];
      y = centroid[1];
      k = 10;
      centered = d;
    } else {
      x = width / 2;
      y = height / 2;
      k = 1;
      centered = null;
    }

    g.selectAll("path")
        .classed("active", centered && function(d) { return d === centered; });

    g.transition()
        .duration(750)
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
        .style("stroke-width", 1.5 / k + "px");

    sb.selectAll("path")
        .classed("active", centered && function(d) { return d === centered; });

    sb.transition()
        .duration(750)
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
        .style("stroke-width", 1.5 / k + "px");
  }

  // Resize function to make the map smaller, combined with onresize event can make responsive charts
  function resizeMap() {
      var targetWidth = svgmap.node().parentNode.offsetWidth;
      svgmap.attr("width", targetWidth);
      svgmap.attr("height", targetWidth / aspect);
  };

  // Main function to draw the map after data load
  function chart(element, data, options) {

    svgmap = d3.select(element)
      .attr("xmlns", "http://www.w3.org/2000/svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", "0 0 860 500")
      .attr("preserveAspectRatio", "xMidYMid");

    g = svgmap.append("g").attr("id","map-group");
    sb = svgmap.append("g");

    mapMembersVotes(data.members, data.votation);

    g.selectAll(".district")
        .data(topojson.feature(data.districts, data.districts.objects.districts).features).enter().append("path")
        .attr("id", function(d) {  return d.id; } )
        .attr("class","district")
        .attr("d", path)
        .on("click", clicked)
        .on("mousemove", function(d) {
          tooltip
            .classed("hidden", false)
            .style("left", d3.event.pageX + 10 + "px")
            .style("top", d3.event.pageY + 5 + "px")
            .html(tooltipHTML(themembers[d.id]));
        })
        .on("mouseout",  function(d) {
          tooltip.classed("hidden", true);
        });

    // Add state boundaries
    sb.append("path")
         .datum(topojson.mesh(data.states, data.states.objects.states, 
             function(a, b) { return a.id != "AK" & a.id != "HI"}))
         .attr("d", path)
         .attr("class", "state-boundary");
    
    // Color the districts
    shadeDistricts(data.votation);
    resizeMap();
  };

}

