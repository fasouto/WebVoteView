'use strict';

/* jshint globalstrict: true */
/* global dc,d3,crossfilter,colorbrewer */

// This is a hack to match colours to votes.
var partyColors = {
    "YeaFederalist": "#0000FF",
    "NayFederalist": "#AAAAFF",
    "AbsFederalist": "#DDD",
    "YeaDemocrat": "#0000FF",
    "NayDemocrat": "#AAAAFF",
    "AbsDemocrat": "#EEE",
    "YeaFarmer-Labor": "#0000FF",
    "NayFarmer-Labor": "#AAAAFF",
    "AbsFarmer-Labor": "#DDD",
    "YeaProgressive": "#0000FF",
    "NayProgressive": "#AAAAFF",
    "AbsProgressive": "#DDD",
    "YeaRepublican": "#FF0000",
    "NayRepublican": "#FFAAAA",
    "AbsRepublican": "#EEE",
    "YeaIndependent": "#FFDD00",
    "NayIndependent": "#FFDDAA",
    "AbsIndependent": "#DDD",
    "YeaJackson": "#024959",
    "NayJackson": "#F24C27",
    "AbsJackson": "#5F5448",
    "YeaAnti-Jackson": "#5F5448",
    "NayAnti-Jackson": "#0092B2",
    "AbsAnti-Jackson": "#A8C545",
    "YeaConservative": "#5F5448",
    "NayConservative": "#0092B2",
    "AbsConservative": "#A8C545",
    "YeaAmerican": "#0092B2",
    "NayAmerican": "#B6E548",
    "AbsAmerican": "#FF530D",
    "YeaPopulist": "#D93D4A",
    "NayPopulist": "#0367A6",
    "AbsPopulist": "#F2CB05",
    "YeaUnionist": "#01A55B",
    "NayUnionist": "#F4A104",
    "AbsUnionist": "#A62F01"
};

// All of our charts are now accessible globally.
var votePartyChart = dc.rowChart("#party-chart");
var mapChart = dc.geoChoroplethChart("#map-chart");
var nominateScatterChart = dc.scatterPlot("#scatter-chart");
var globalPartyDimension = null;
var globalData;
var zoomLevel = 1;

// Makes the bootstrap tooltip run for votes from before states were contiguous.
$(document).ready(function(){$('[data-toggle="tooltip"]').tooltip();});

// Initial asynchronous load
(function loadData(){
    if (chamber == "House") {
        queue()
          .defer(d3.json, "/static/json/districts"+congressNum+".json")
          .defer(d3.json, "/api/download/"+rcID)
          .await(drawWidgets);
    } else if (chamber == "Senate") {
        queue()
          .defer(d3.json, "/static/json/states"+congressNum+".json")
          .defer(d3.json, "/api/download/"+rcID)
          .await(drawWidgets);
    }
})();

function drawWidgets(error, geodata, data)
{
	$("#loadBar").slideToggle();
	if(data==undefined || geodata==undefined)
	{
		var errorMessage = "Unknown error loading vote data.";
		if(error.status==404 && error.responseURL.indexOf(".json")!=-1)
		{
			errorMessage = "Unable to download geographic data for this session.";
		}
		$("#errorContent > div > div.errorMessage").html(errorMessage);
		$("#errorContent").animate({"height": "toggle", "opacity": "toggle"},"slow");
		return(0);
	}
	globalData = data;
	$("#loadedContent").animate({"height": "toggle", "opacity": "toggle"},"slow");

	var ndx = crossfilter(data.rollcalls[0].votes);
	var all = ndx.groupAll();

	// Test points for figure calibration, JBL
	if (false) 
	{
		data.rollcalls[0].votes[0].x = 0;
		data.rollcalls[0].votes[0].y = 1;
		data.rollcalls[0].votes[1].x = 0;
		data.rollcalls[0].votes[1].y = -1;
		data.rollcalls[0].votes[2].x = 1;
		data.rollcalls[0].votes[2].y = 0;
		data.rollcalls[0].votes[3].x = -1;
		data.rollcalls[0].votes[3].y = 0;
		for (var i=4;i< data.rollcalls[0].votes.length;i++)
		{
			data.rollcalls[0].votes[i].x=0;
			data.rollcalls[0].votes[i].y=0;
		}
	}

	// Dimension 1: What type of vote you cast
	var voteDimension = ndx.dimension(function(d) { return d.vote; });
	var voteGroup = voteDimension.group(); // Grouping is exact

	// Dimension 2: What party you are in
	var partyDimension = ndx.dimension(function(d) { return d.party; });
	var partyGroup = partyDimension.group(); // Grouping is exact
	globalPartyDimension = partyDimension;

	// Dimension 3: What type of vote you cast and what party you are in.
	var votePartyDimension = ndx.dimension(function(d) { return d.vote + d.party; });
	var votePartyGroup = votePartyDimension.group(); // Grouping is exact

	// Dimension 4: Coordinates of vote
	var xDimension = ndx.dimension(
		//Project outlying ideal points onto the outer circle (Radius=1.2)... 		    
		function(d) {
			var x = d.x;  var y = d.y;
			var R = Math.sqrt(x*x + y*y);
			if (R>1.2) 
			{
				x = x*1.2/R;
				y = y*1.2/R;
			}
			return [x, y];
		}
	);
	var xGroup = xDimension.group().reduce(
		function (p, d) 
		{
			p.members.push(d);
			return p;
		},

		function (p, d) 
		{
			var index = p.members.indexOf(d);
			if (index > -1) 
			{
				p.members.splice(index, 1);
			}
			return p;
		},

		function ()
		{
			return {members: []} ;
		}); // This is not super clear to me.

	// Dimension 5: What state you're from.
	var stateDimension = ndx.dimension(function(d) { return d.state; });
	var stateGroup = stateDimension.group().reduce(
		function (p, d)
		{
			p.members.push(d);
			return p;
		},

		function (p, d) 
		{
			var index = p.members.indexOf(d);
			if (index > -1) {
				p.members.splice(index, 1);
			}
			return p;
		},

		function ()
		{
			return {members: []} ;
		});

	// Dimension 6: Which district you are from
	var districtDimension = ndx.dimension(function(d) { 
		return d.district; 
	});


	var districtGroup = districtDimension.group().reduce(
		function (p, d) 
		{
			// Add at large members
			var atlargecode = d.state + "00";
			var atlarge = $.grep(data.rollcalls[0].votes, function(e)
			{
				return e.district==atlargecode;
			});
			$.each(atlarge, function(member) {
				p.members.push(atlarge[member]);
			});
			p.members.push(d);
			return p;
		},

        function (p, d) {
		//console.log('huh');
            // Remove at large members
            var atlargecode = d.state + "00";
            var atlarge = $.grep(data.rollcalls[0].votes, function(e){return e.district == atlargecode; });
            $.each(atlarge, function(member) {
                p.members.splice( $.inArray(atlarge[member], p.members), 1);
            });

            var index = p.members.indexOf(d);
            if (index > -1) {
              p.members.splice(index, 1);
            }
            return p;
        },

        function () {
            return {members: []} ;
        });

	// DIMENSIONS HAVE BEEN DEFINED =========

	// NOW BEGIN CHART SPECIFICATIONS =======
	votePartyChart
		.width(320).height(320)
		.dimension(votePartyDimension).group(votePartyGroup)
		.elasticX(true)
		.colorCalculator(function (d) {
			return partyColors[d.key];
		})
		.fixedBarHeight(24).gap(10)
		.labelOffsetX(40)
		.label(function(d)
		{
			var textLabel = d.key.substr(3,d.key.length)+": "+d.key.substr(0,3)
			return textLabel
		})
		.ordering(function(d){ // Sort Yea-to-Nay, Alphabetically, set independents separately.
			var score = 0
			switch(d.key.substr(0,3))
			{
				case "Yea": score = 9; break;
				case "Nay": score = 6; break;
				case "Abs": score = 3; break
			}
			switch(d.key.substr(3,d.key.length))
			{
				case "Democrat": score=score+2; break;
				case "Republican": score=score+1; break;
				default: score=score+0; break;
			}
			return -score;
		})
		.transitionDuration(200)
        	.xAxis().ticks(4);

	nominateScatterChart
		.width(600)
		.height(600)
		.margins({top:25,right:25,bottom:75,left:75})
		.dimension(xDimension)
		.mouseZoomable(false)
		.group(xGroup)
		.symbolSize(7)
		.colorCalculator(function (d) { 
			var color = "#CCC";
			try {
				if(d.value.members.length > 0){   
				color = blendColors(d.value.members);
				}
			}catch(e){
			}
			return color; 
		})
		.highlightedSize(10)
		.x(d3.scale.linear().domain([-1.2, 1.2])) 
		.y(d3.scale.linear().domain([-1.2, 1.2]));
    
    dc.dataCount("#data-count")
        .dimension(ndx)
        .group(all);

	if (chamber == "House")
	{
		/* Initialize tooltip */
		var houseMapTip = d3.tip().attr('class', 'd3-tip').html(function(p, d) {
			var result = "<p>" + d.key + "</p>";
			for (var i = 0; i < d.value.members.length; i++) 
			{
				var colorVote = partyColors[d.value.members[i].vote + d.value.members[i].party];
				// Tooltip data display:
				result += "<p>" + d.value.members[i].name + "  -  <span style='color:" + "white" + "'> " + d.value.members[i].vote +"</span></p>";				  
			}
			return result;
		});

		var mapTopo = topojson.feature(geodata, geodata.objects.districts).features;
		mapChart
			.width(890).height(500)
			.dimension(districtDimension)
			.group(districtGroup)
			.colorCalculator(function (d) { 
				var color = "#CCC";
				try {
					if(d.members.length > 0){
						color = blendColors(d.members);
					}
				}catch(e){
					//console.log("MC: " + e);
				}
				return color; 
			})
			.overlayGeoJson(mapTopo, "district", function (d) {
				return d.id;
			})
			.on("postRender", function(c){
				c.svg()
					.selectAll("path")
					.call(houseMapTip)
					.on('mouseover',function(d, i){
						var districtSet = c.data();
						var result = $.grep(c.data(), function(e){
							return e.key == d.id; 
						});

						houseMapTip.attr('class','d3-tip animate')
						.show(d, result[0]);
					})
					.on('mouseout',function(d, i){
						var result = $.grep(c.data(), function(e){ return e.key == d.id; });
						houseMapTip.attr('class','d3-tip').show(d, result[0])
						houseMapTip.hide();
					})
			});
	} 
	else if (chamber == "Senate") 
	{

            /* Initialize tooltip */
            var senateMapTip = d3.tip().attr('class', 'd3-tip').html(function(p, d) {
              var result = "<p>" + d.key + "</p>";
              for (var i = 0; i < d.value.members.length; i++) {
                 var colorVote = partyColors[d.value.members[i].vote + d.value.members[i].party];
                  result += "<p>" + d.value.members[i].name + "  -  <span style='color:" + colorVote + "'> " + d.value.members[i].vote + " / " + d.value.members[i].party +"</span></p>";
              }
              return result;
            });

            var mapTopo = topojson.feature(geodata, geodata.objects.states).features;
            mapChart.width(890)
                    .height(500)
                    .dimension(stateDimension)
                    .group(stateGroup)
                    .colorCalculator(function (d) { 
                        var color = "#CCC";
                        try {
                            if(d.members.length > 0){   
                                color = blendColors(d.members);
                            }
                        }catch(e){
                       }
                        return color;
                    })
                    .overlayGeoJson(mapTopo, "state", function (d) {
                        return d.id;
                    })
	           .on("postRender", function(c){
                        c.svg()
                          .selectAll("path")
                          .call(senateMapTip)
                          .on('mouseover',function(d, i){
                            var result = $.grep(c.data(), function(e){ return e.key == d.id; });

                            senateMapTip.attr('class','d3-tip animate')
                            .show(d, result[0])}
                            )
                          .on('mouseout',function(d, i){
                            var result = $.grep(c.data(), function(e){ return e.key == d.id; });
                            senateMapTip.attr('class','d3-tip').show(d, result[0])
                            senateMapTip.hide()
                          })
                    });
        }

	// We are done defining everything, now let's just run our ancillary functions.
	dc.renderAll();

	//var gtest = d3.select("#map-chart svg g")
	//		.call(d3.behavior.zoom()
	//		.scaleExtent([1, 10]));
	//		.on("zoom", zoom));

	/*function zoom()
	{
			gtest.attr("transform", "translate("
				+ d3.event.translate
				+ ")scale(" + d3.event.scale + ")");
			gtest.style("stroke-width", 1.2 / d3.event.scale + "px");
	}*/

	decorateNominate(nominateScatterChart,data);
	mapChart.on("filtered", pollFilters);
	votePartyChart.on("filtered", pollFilters);
	nominateScatterChart.on("filtered", pollFilters);
	outVotes();

	d3.selectAll('button').on('click',doZoom);
	var zoom = d3.behavior.zoom().scaleExtent([1, 8]);
}

// Blend an array of colors
function blendColors(members)
{
	var r = 0, g = 0 , b = 0, i, rgbColor;
	for (i = 0; i < members.length; i++) 
	{
		rgbColor = d3.rgb(partyColors[members[i].vote + members[i].party]);
		r = r + rgbColor.r;
		g = g + rgbColor.g;
		b = b + rgbColor.b; 
	}
	r = r / members.length;
	g = g / members.length;
	b = b / members.length;
	return d3.rgb(r,g,b).toString();
}

// Easier to update steps to take on a full filter reset by running this.
function doFullFilterReset()
{
	$("#selectionFilterBar").slideUp();
	dc.filterAll();
	dc.redrawAll();
	decorateNominate(nominateScatterChart, globalData);
	//updateVoteChart();
}