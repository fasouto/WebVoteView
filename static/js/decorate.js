/*
    Draws the background circles, labels and text for the scatter chart
*/
function decorateNominate(oc,data) {
	var width = oc.width();
        var height = oc.height();

	var margin = 50;
	var marginCircle = 25; // Distance of the main circle to the axis
        var nomDWeight = 0.4156;
	var tickLength = 15;
	var scale = 1.0; // sets radius of the outer circle in nominate units

	// Calculate circle attrs
	var radiusX = (width - margin)/2 - marginCircle;
        var radiusY = (nomDWeight*width - margin)/2 - marginCircle;
	var circleCenter = { "x": (width + margin)/2, "y": (height - margin)/2 };

	// Select the base SVG
	var ocSVG = d3.select(oc.g()[0][0]);

	// Remove everything that's an axis.
	ocSVG.selectAll(".axis").remove();

	// Place bg stuff in SVG tree in front of .chart-body scatter points
	var svgbg = ocSVG.insert("g",".chart-body");
		    
	svgbg
		.append("clipPath")
			.attr("id", "scatterclip")
		.append("ellipse")
			.attr("rx", radiusX)
                        .attr("ry", radiusY)
			.attr("cx", circleCenter.x)
		        .attr("cy", circleCenter.y);

	var gg = svgbg.append("g").attr("id","scatter-background");

	d3.select("clipPath#scatterclip")
		.append("ellipse")
		.attr("cx", circleCenter.x)
		.attr("cy", circleCenter.y)
		.attr("rx", radiusX)
                .attr("ry", radiusY);
     
	gg
		.append("ellipse")
		.attr("cx", circleCenter.x)
		.attr("cy", circleCenter.y)
		.attr("rx", radiusX)
		.attr("ry", radiusY)
		.attr("id","outer-circle");
	gg
		.append("ellipse")
		.attr("cx", circleCenter.x)
		.attr("cy", circleCenter.y)
		.attr("rx", radiusX)
		.attr("ry", radiusY)
		.attr("id","dashed-circle");

	// Hacky way to shade region where yea vote is expected...
	var plotCut=1;
	if(data.rollcalls==undefined || data.rollcalls[0].nominate==undefined || data.rollcalls[0].nominate.x==undefined)
	{
		plotCut=0;
	}
	else
	{
		var vn = data.rollcalls[0].nominate;
	}

	// Hack to gracefully fail when we don't have nominate data. AR
	if(plotCut)
	{

		var angle = vn.slope == null ? NaN : vn.slope;
		var cs = (angle>0?1:0) + 2*(vn.spread[0]>0?1:0);
		switch( cs ) {
			case 0:
				var polyData = [ [ circleCenter.x+radiusX*vn.x[0]/scale,
						 circleCenter.y-radiusY*vn.y[0]/scale*1.2 ],
						 [ circleCenter.x+radiusX*(vn.x[0])/scale,
						 circleCenter.y-radiusY*(vn.y[0]+10)/scale*1.2 ], 
						 [ circleCenter.x+radiusX*(vn.x[1]+10)/scale,  
						 circleCenter.y-radiusY*(vn.y[1]+10)/scale*1.2  ], 
						 [ circleCenter.x+radiusX*(vn.x[1]+10)/scale,
						 circleCenter.y-radiusY*(vn.y[1])/scale*1.2 ], 
						 [ circleCenter.x+radiusX*vn.x[1]/scale,
						 circleCenter.y-radiusY*vn.y[1]/scale*1.2  ] ];
				break;
			case 1:
        			var polyData = [ [ circleCenter.x+radiusX*vn.x[0]/scale,
						circleCenter.y-radiusY*vn.y[0]/scale*1.2],
                        	 [ circleCenter.x+radiusX*(vn.x[0])/scale,
                        	   circleCenter.y-radiusY*(vn.y[1]-10)/scale*1.2 ], 
                        	 [ circleCenter.x+radiusX*(vn.x[1]-10)/scale,
                        	   circleCenter.y-radiusY*(vn.y[1]-10)/scale*1.2 ], 
                        	 [ circleCenter.x+radiusX*(vn.x[1]-10)/scale ,
                        	   circleCenter.y-radiusY*(vn.y[1])/scale*1.2 ], 
                        	 [ circleCenter.x+radiusX*vn.x[1]/scale,
                        	   circleCenter.y-radiusY*vn.y[1]/scale*1.2 ] ]; 
			        break;
			case 2:
			        var polyData = [ [ circleCenter.x+radiusX*vn.x[0]/scale,
	                           circleCenter.y-radiusY*(vn.y[0])/scale*1.2 ],
	                        [  circleCenter.x+radiusX*(vn.x[0])/scale,
	                           circleCenter.y-radiusY*(vn.y[0]-10)/scale*1.2 ], 
        	                [ circleCenter.x+radiusX*(vn.x[1]-10)/scale,
				  circleCenter.y-radiusY*(vn.y[0]-10)/scale*1.2 ],
      	                   	[ circleCenter.x+radiusX*(vn.x[1]-10)/scale,
                           	  circleCenter.y-radiusY*(vn.y[1])/scale*1.2 ],
                         	[ circleCenter.x+radiusX*vn.x[1]/scale,
                           	  circleCenter.y-radiusY*vn.y[1]/scale*1.2 ] ]; 
				break;
			case 3:
        			var polyData = [ [ circleCenter.x+radiusX*vn.x[0]/scale,
                        	   circleCenter.y-radiusY*vn.y[0]/scale*1.2 ],
                        	 [ circleCenter.x+radiusX*(vn.x[0])/scale,
                        	   circleCenter.y-radiusY*(vn.y[0]+10)/scale*1.2 ], 
                        	 [ circleCenter.x+radiusX*(vn.x[1]-10)/scale,
                        	   circleCenter.y-radiusY*(vn.y[1]-10)/scale*1.2 ], 
                        	 [ circleCenter.x+radiusX*(vn.x[1]-10)/scale,
                        	   circleCenter.y-radiusY*(vn.y[1])/scale*1.2 ], 
                        	 [ circleCenter.x+radiusX*vn.x[1]/scale,
                        	   circleCenter.y-radiusY*vn.y[1]/scale*1.2 ] ]; 
				break;
		}
		if (isNaN(angle)) { polyData = [[0,0 ], [0, width],[width, width],[width, 0]] };

		gg.selectAll("polygon")
			.data([polyData])
			.enter()
			.append("polygon")
			.attr("points",function(d) {
				return d.map( function(d) {
					return [d[0], d[1]].join(",");
				}).join(" ");
			})
			.attr("id","yea-semi")
			.attr("style","stroke:none;fill:#FFFFED;clip-path:url(#scatterclip)");

		gg
		.append("ellipse")
			.attr("cx", circleCenter.x)
			.attr("cy", circleCenter.y)
			.attr("rx", radiusX/scale)
			.attr("ry", radiusY/scale)
			.attr("id", "dashed-circle");

	        gg
		.append("line")
			.attr("x1", radiusX/scale*vn.x[0] + circleCenter.x)
			.attr("x2", radiusX/scale*vn.x[1] + circleCenter.x)
			.attr("y1", circleCenter.y - radiusY/scale*vn.y[0])
			.attr("y2", circleCenter.y - radiusY/scale*vn.y[1])
			.attr("id","cutline")
			.attr("style","stroke:#000;stroke-width:2; clip-path:url(#scatterclip)");
	}
	else
	{
		gg
		.append("circle")
			.attr("cx", circleCenter.x)
			.attr("cy", circleCenter.y)
			.attr("rx", radiusX/scale)
	                .attr("ry", radiusY/scale)
			.attr("id", "dashed-circle");		
	}

	// X-axis
        var xAxisMin = circleCenter.x - radiusX;
        var xAxisMax = circleCenter.x + radiusX;
        var xAxisLen = xAxisMax - xAxisMin;
        var yDimPos = circleCenter.y + radiusY + 10;

	gg.append('polyline')
		.attr("class", "scatter-axis")
		.attr("points", sprintf("%d,%d %d,%d %d,%d %d,%d", 
				xAxisMin, yDimPos + tickLength,
				xAxisMin, yDimPos, 
				xAxisMax, yDimPos, 
				xAxisMax, yDimPos + tickLength));

	gg.append('text')
            .text("Liberal")
	    .attr("x", xAxisMin + 0.2*xAxisLen)
            .attr("y", yDimPos + 20)
	    .attr("style","text-anchor:middle");
	gg.append('text')
            .text("Conservative")
            .attr("x", xAxisMin + 0.8*xAxisLen)
            .attr("y", yDimPos + 20)
            .attr("style","text-anchor:middle");
	gg.append('text')
	     .text("DW-Nominate Dimension 1: Economic/Redistributive")
             .attr("x", xAxisMin + xAxisLen/2).attr("y", yDimPos + 40)
	     .attr("style","text-anchor:middle");
	// End X axis.

	// Y-axis
        var yAxisMin = circleCenter.y - radiusY;
        var yAxisMax = circleCenter.y + radiusY;
        var yAxisLen = yAxisMax - yAxisMin;

	gg.append('polyline')
	     .attr("class","scatter-axis")
	     .attr("points", sprintf("%d,%d  %d,%d  %d,%d  %d,%d", 
	   			     margin, yAxisMin, 
				     margin + tickLength, yAxisMin, 
				     margin + tickLength, yAxisMax, 
				     margin, yAxisMax));
	gg.append('text')
	     .text("Conservative")
	     .attr("x", 40)
             .attr("y", yAxisMin + 0.2*yAxisLen)
             .attr("style","text-anchor:middle")
             .attr("transform", sprintf("rotate(-90 40 %d)", yAxisMin + 0.2*yAxisLen));
	gg.append('text')
             .text("Liberal")
	     .attr("x", 40)
             .attr("y", yAxisMin + 0.8*yAxisLen)
             .attr("style","text-anchor:middle")
             .attr("transform", sprintf("rotate(-90 40 %d)", yAxisMin + 0.8*yAxisLen));
	gg.append('text')
             .text("DW-Nominate Dimension 2: Social/Racial")
             .attr("x",20)
             .attr("y", yAxisMin + yAxisLen/2)
             .attr("style","text-anchor:middle")
             .attr("transform", sprintf("rotate(-90 20 %d)", yAxisMin + yAxisLen/2));
	// End Y axis


	// Add yea and nay locations to the plot on top of the dots
	  
	// Problem is that with Y/N on top we can't select point under/near the Y/N
	// Need a way to insert after the dots but before the brush. Putting the Y/N group right
	// before the brush group does it. --JBL	  
	var ggg = ocSVG.insert("g",".brush");
	if (plotCut && vn.mid[0] * vn.mid[0] != 0) { // Only drawn if there is a cutline!
		var ynpts =    [circleCenter.x + radiusX/scale*(vn.mid[0]+vn.spread[0]),
				circleCenter.y - radiusY/scale*(vn.mid[1]+vn.spread[1]),
				circleCenter.x + radiusX/scale*(vn.mid[0]-vn.spread[0]),
				circleCenter.y - radiusY/scale*(vn.mid[1]-vn.spread[1])];
		var angle = 57.29578*Math.atan((vn.spread[1]*nomDWeight)/(vn.spread[0]));
		var cs = (angle>0?1:0) + 2*(vn.spread[0]>0?1:0);
		switch( cs ) 
		{
			case 0: angle = 90-angle; break;
			case 1: angle = 90-angle; break;
			case 2: angle = 270-angle; break;
			case 3: angle = -90-angle; break;
		}

		console.log(ynpts);
		console.log(circleCenter);
		console.log(vn);
		console.log(radiusX);
		console.log(radiusY);
      
		ggg.append('polyline')
			.attr("class", "yeanay-line")
			.attr("points", ynpts.join(" "));

		ggg.append('text').text('Y')
			.attr("class","yeanay")
			.attr("x", ynpts[2])
			.attr("y", ynpts[3])
			.attr("transform",sprintf("rotate(%d %d %d)", angle, ynpts[2], ynpts[3]));

		ggg.append('text').text('N')
			.attr("class","yeanay")
			.attr("x", ynpts[0])
			.attr("y", ynpts[1])
			.attr("transform",sprintf("rotate(%d %d %d)", 180+angle, ynpts[0], ynpts[1]));

		// Fit box (only if cutline is displayed
		ggg.append('text').text(sprintf("PRE: %4.2f", vn.pre == null ? 0 : vn.pre))
			.attr("class", "fitbox")
			.attr("x", xAxisMax - 75)
			.attr("y", yAxisMax - 5);
   
		ggg.append('text').text(sprintf("Classified: %4.2f",vn.classified == null ? 0 : vn.classified ))
			.attr("class", "fitbox")
			.attr("x", xAxisMax - 75)
			.attr("y", yAxisMax - 25);
	}
}
