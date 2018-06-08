// When the browser window is resized, makeResponsive() is called.
d3.select(window).on("resize", makeResponsive);

// When the browser loads, makeResponsive() is called.
makeResponsive();

// The code for the chart is wrapped inside a function that
// automatically resizes the chart
function makeResponsive() {

  // if the SVG area isn't empty when the browser loads,
  // remove it and replace it with a resized version of the chart
  var svgArea = d3.select("#plot").select("svg");

  // clear svg is not empty
  if (!svgArea.empty()) {
    svgArea.remove();
  }

  // SVG wrapper dimensions are determined by the current width and
  // height of the browser window.
  var svgWidth = window.innerWidth;
  var svgHeight = window.innerHeight;

  margin = {
    top: 50,
    bottom: 50,
    right: 50,
    left: 50
  };

  var height = svgHeight - margin.top - margin.bottom;
  var width = svgWidth - margin.left - margin.right;

  // Append SVG element
  var svg = d3
    .select(".chart")
    .append("svg")
    .attr("height", svgHeight)
    .attr("width", svgWidth);

  // Append group element
  var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // Read CSV
  d3.csv("resources/datasetOccu1.csv", function (err, occuData) {
    var corr = +occuData[0].correlation;
    console.log(corr);

    // parse data
    occuData.forEach(function (data) {
      data.healthcare = +data.healthcare;
      data.occupation1 = +data.occupation1;
      data.state = data.state;
    });

    // create scales
    var xScale = d3.scaleLinear()
      .domain([16, d3.max(occuData, d => d.occupation1)+2])
      .range([0, width]);

    var yScale = d3.scaleLinear()
      .domain([0, d3.max(occuData, d => d.healthcare)])
      .range([height, 0]);

    // create axes
    var xAxis = d3.axisBottom(xScale);
    var yAxis = d3.axisLeft(yScale).ticks(6);

    // append axes
    chartGroup.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(xAxis);

    chartGroup.append("g")
      .call(yAxis);

    // line generator
    var line = d3.line()
      .x(d => xScale(d.occupation1))
      .y(d => yScale(d.healthcare));

    // append line
    chartGroup.append("path")
      .data([occuData])
      .attr("d", line)
      .attr("fill", "none")
      .attr("stroke", "none")

    // Create correlation legend labels
    chartGroup.append("text")
    .attr("transform", `translate(${width/1.25}, ${height + margin.top  -90})`)
    .attr("class", "axisText")
    .text(`Correlation: ${corr}`);
    // .text("Correlation: 0.574");

    // append circles
    var circlesGroup = chartGroup.selectAll("circle")
      .data(occuData)
      .enter()
      .append("circle")
      .attr("cx", d => xScale(d.occupation1))
      .attr("cy", d => yScale(d.healthcare))
      .attr("r", "7")
      .attr("fill", "red")
      .attr("stroke-width", "1")
      .attr("stroke", "black")
      .attr("opacity", "0.6");

    var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([40, -50])
    .html(function(d){
      return (`<strong>${d.state}<strong><hr>${d.occupation1}, ${d.healthcare}`)
    });

    // Step 2: Create the tooltip in chartGroup.
    chartGroup.call(toolTip);

    circlesGroup.on("mouseover", function(d){
      toolTip.show(d);
    })

    // Step 3: Create "mouseout" event listener to hide tooltip
    .on("mouseout", function (d) {
      toolTip.hide(d)
    });

    // Create axes labels
    chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left + 5)
    .attr("x", 0 - (height / 1.2))
    .attr("dy", "1em")
    .attr("class", "axisText")
    .text("Lack of Healthcare for monetary reasons");

    chartGroup.append("text")
    .attr("transform", `translate(${width/2.8}, ${height + margin.top  -10})`)
    .attr("class", "axisText")
    .text("Occupation category %");
  });
};
