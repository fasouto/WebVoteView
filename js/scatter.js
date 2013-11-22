
var width = 650,
    height = 650;

var margin = 50;
var radius = (width - 2 * margin) / 2;

var svgscatter = d3.select("svg#scatter")
    .attr("width", width)
    .attr("height", height);

var gg = svgscatter.append("g").attr("id","scatter-group");

var membersByID = {};

// Create an array with all the members indexed by id
function setMembers(members, votation) {
  members.forEach( function(d,i) {
      if (d.id in votation.votes) {
         d["vote"] = votation.votes[d.id];
         membersByID[d.id] = d;
      }
   })
}

// Main function to draw the scatter plot after data load
function drawScatter(error, districts, states, votation, members) {
   var vn = votation['nominate'];

   setMembers(members, votation);

   var scatterdata = [];
   var scale = 0.0;
   for (k in votation.votes) {
      var dt = membersByID[k];
      dt['vote'] = voteChoices[ votation.votes[dt['id']]];
      dt['namecqlabel'] = sprintf("%s %s",dt['fname'],dt['cqlabel']);
      if (dt['nominate']['oneDimNominate'] != null) {
         var distance = Math.sqrt( Math.pow(dt['nominate']['oneDimNominate'],2) + 
                               Math.pow(dt['nominate']['twoDimNominate'],2) );
         scale = scale > distance ? scale : distance;
      }
      scatterdata.push(dt);
   } 
   scale = scale < 1 ? 1.01 : scale;

   d3.select("clipPath#scatterclip")
      .append("circle")
      .attr("cx", 350)
      .attr("cy", 300)
      .attr("r", radius)
     
   gg
      .append("circle")
      .attr("cx", 350)
      .attr("cy", 300)
      .attr("r", radius)
      .attr("style","stroke:#333;stroke-width:1;fill:#FFF");

     // Hacky way to shade region where yea vote is expected...
     var angle = -vn['zml'][1]/vn['zml'][0];
     var cs = (angle>0?1:0) + 2*(vn['zml'][0]>0?1:0);
     switch( cs ) {
       case 0:
          var polyData = [ [ 350+radius*vn['x'][0]/scale,
                             300-radius*vn['y'][0]/scale ],
                           [ 350+radius*(vn['x'][0])/scale,
                             300-radius*(vn['y'][0]+10)/scale ], 
                           [ 350+radius*(vn['x'][1]+10)/scale,  
                             300-radius*(vn['y'][1]+10)/scale ], 
                           [ 350+radius*(vn['x'][1]+10)/scale,
                             300-radius*(vn['y'][1])/scale ], 
                           [ 350+radius*vn['x'][1]/scale,
                             300-radius*vn['y'][1]/scale ] ]; 
          break;
       case 1:
          var polyData = [ [ 350+radius*vn['x'][0]/scale,
                             300-radius*vn['y'][0]/scale ],
                           [ 350+radius*(vn['x'][0])/scale,
                             300-radius*(vn['y'][1]-10)/scale ], 
                           [ 350+radius*(vn['x'][1]-10)/scale,
                             300-radius*(vn['y'][1]-10)/scale ], 
                           [ 350+radius*(vn['x'][1]-10)/scale,
                             300-radius*(vn['y'][1])/scale ], 
                           [ 350+radius*vn['x'][1]/scale,
                             300-radius*vn['y'][1]/scale ] ]; 
          break;
       case 2:
          var polyData = [ [ 350+radius*vn['x'][0]/scale,
                             300-radius*(vn['y'][0])/scale ],
                           [ 350+radius*(vn['x'][0])/scale,
                             300-radius*(vn['y'][0]-10)/scale ], 
                           [ 350+radius*(vn['x'][1]-10)/scale,
                             300-radius*(vn['y'][0]-10)/scale ],
                           [ 350+radius*(vn['x'][1]-10)/scale,
                             300-radius*(vn['y'][1])/scale ],
                           [ 350+radius*vn['x'][1]/scale,
                             300-radius*vn['y'][1]/scale ] ]; 
          break;
  
       case 3:
          var polyData = [ [ 350+radius*vn['x'][0]/scale,
                             300-radius*vn['y'][0]/scale ],
                           [ 350+radius*(vn['x'][0])/scale,
                             300-radius*(vn['y'][0]+10)/scale ], 
                           [ 350+radius*(vn['x'][1]-10)/scale,
                             300-radius*(vn['y'][1]-10)/scale ], 
                           [ 350+radius*(vn['x'][1]-10)/scale,
                             300-radius*(vn['y'][1])/scale ], 
                           [ 350+radius*vn['x'][1]/scale,
                             300-radius*vn['y'][1]/scale ] ]; 
          break;
     }
     if (isNaN(angle)) { polyData = [[0,0],[0,height],[width,height],[width,0]] };

   gg.selectAll("polygon")
      .data([polyData])
      .enter()
       .append('polygon')
         .attr("points",function(d) {
               return d.map( function(d) {
                   return [d[0], d[1]].join(",")
               }).join(" ");
          })
       .attr("style","stroke:none; fill:#FFFFED;clip-path:url(#scatterclip)");

   gg
      .append("circle")
      .attr("cx", 350)
      .attr("cy", 300)
      .attr("r", radius/scale)
      .attr("style","stroke:#333;stroke-dasharray:3 4;stroke-width:0.5;fill:none");

   gg
     .append("line")
     .attr("x1",radius/scale*vn['x'][0]+350)
     .attr("x2",radius/scale*vn['x'][1]+350)
     .attr("y1",300 - radius/scale*vn['y'][0])
     .attr("y2",300 - radius/scale*vn['y'][1])
     .attr("id","cutline")
     .attr("style","stroke:#000; stroke-width:2; clip-path:url(#scatterclip)");

   // Add yea and nay locations to the plot
   if (vn["dl"][0] * vn['dl'][0] != 0) { // Only drawn if there is a cutline!
     var ynpts =  [350 + radius/scale*(vn["dl"][0]+vn["zml"][0]/2),
                   300 - radius/scale*(vn["dl"][1]+vn["zml"][1]/2),
                   350 + radius/scale*(vn["dl"][0]-vn["zml"][0]/2),
                   300 - radius/scale*(vn["dl"][1]-vn["zml"][1]/2)];
     var angle =   57.295*Math.atan((vn["zml"][1])/(vn["zml"][0]));
     var cs = (angle>0?1:0) + 2*(vn['zml'][0]>0?1:0);
     switch( cs ) {
       case 0:
         angle = 90-angle;
         break;
       case 1:
         angle = 90-angle;
         break;
       case 2:
         angle = 270 - angle;
         break;
       case 3:
         angle = -90 - angle;
         break;
     }
    
     gg.append('polyline')
      .attr("class","yeanay")
      .attr("points", ynpts.join(" "))
      .attr("style","stroke:#999; stroke-dasharray:4 2;stroke-width:2; fill:none");

     gg.append('text').text('Y')
      .attr("class","yeanay")
      .attr("x",ynpts[2])
      .attr("y",ynpts[3])
      .attr("transform",sprintf("rotate(%d %d %d)",angle,ynpts[2],ynpts[3]))
      .attr("style","text-anchor:middle;font-size: 5em; fill:#999; font-family:verdana");

     gg.append('text').text('N')
      .attr("class","yeanay")
      .attr("x",ynpts[0])
      .attr("y",ynpts[1])
      .attr("transform",sprintf("rotate(%d %d %d)", 180+angle,ynpts[0],ynpts[1]))
      .attr("style","text-anchor:middle; font-size: 5em; fill:#999; font-family:verdana")

     // Fit box (only if cutline is displayed)
     gg.append('text').text(sprintf("PRE: %4.2f",vn['pre']))
       .attr("id","fitbox")
       .attr("x", 550)
       .attr("y", 580)
       .attr("style","text-anchor:bottom;font-family:verdana;font-size:9pt")
 
     gg.append('text').text(sprintf("Classified: %4.2f",vn['classified']))
       .attr("id","fitbox")
       .attr("x", 550)
       .attr("y", 560)
       .attr("style","text-anchor:bottom;font-family:verdana;font-size:9pt")
   }
   
   // Main scatter plot
   gg.selectAll(".scatter")
   .data(scatterdata)
   .enter()
   .append("circle")
      .attr("id",dt['id'])
      .attr("cx", function(d) {
        return 350+d['nominate']['oneDimNominate']*275/scale })
      .attr("cy", function(d) {
        return 300-d['nominate']['twoDimNominate']*275/scale })
      .attr("r", 5)
      .attr('class',function(d,i) {
              return d['vote'] + ' ' + d['partyname']; 
       })
      .on("mousemove", function(d) {
        tooltip
          .classed("hidden", false)
          .style("left", d3.event.pageX + 10 + "px")
          .style("top", d3.event.pageY + 5 + "px")
          .html(tooltipHTML([d]));
      })
      .on("mouseout",  function() {
          tooltip.classed("hidden", true)
       });

    // X-axis
    gg.append('polyline')
      .attr("class","axis")
      .attr("points", "50 600  50 590  625 590  625 600")
      .attr("style","stroke:#000; stroke-width:1; fill:none");
    gg.append('text').text("Liberal")
      .attr("x",175)
      .attr("y",610)
      .attr("style","text-anchor:middle")
    gg.append('text').text("Conservative")
      .attr("x",525)
      .attr("y",610)
      .attr("style","text-anchor:middle")
    gg.append('text').text("DWNom 1: Economic/Redistribution")      
      .attr("x",350)
      .attr("y",630)
      .attr("style","text-anchor:middle")

    // Y-axis
    gg.append('polyline')
      .attr("class","axis")
      .attr("points", "40 25  50 25  50 575  40 575")
      .attr("style","stroke:#000; stroke-width:1; fill:none");
    gg.append('text').text("DWNom 2: Social/Race")
      .attr("x",20)
      .attr("y",300)
      .attr("style","text-anchor:middle")
      .attr("transform","rotate(-90 20 300)")
    gg.append('text').text("Liberal")
      .attr("x",40)
      .attr("y",450)
      .attr("style","text-anchor:middle")
      .attr("transform","rotate(-90 40 450)")
    gg.append('text').text("Conservative")
      .attr("x",40)
      .attr("y",125)
      .attr("style","text-anchor:middle")
      .attr("transform","rotate(-90 40 125)")
} 