
// set svg dimensional params
var svgWidth = 960;
var svgHeight = 500;

var margin = {
    top: 20,
    right: 40,
    bottom: 100,
    left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight)
    .style("background-color", "#bdc3c7")
    .style("opacity", 0.8);

// Append an SVG group
var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`)
    .classed('iframeContainer', true);

// Initial Params
var chosenXAxis = "poverty";

var chosenYAxis = "healthcare";

// function used for updating x-scale var upon click on axis label
function xScale(data, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(data, d => d[chosenXAxis]) * 0.8,
        d3.max(data, d => d[chosenXAxis]) * 1.2
        ])
        .range([0, width]);

    return xLinearScale;

}

// function used for updating xAxis var upon click on axis label
function renderXAxes(xScale, xAxis) {
    var bottomAxis = d3.axisBottom(xScale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);

    return xAxis;
}

// function used for updating y-scale var upon click on axis label
function yScale(data, chosenYAxis) {
    // create scales
    var yLinearScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d[chosenYAxis])])
        .range([height, 0]);

    return yLinearScale;

}

// function used for updating yAxis var upon click on axis label
function renderYAxes(yScale, yAxis) {
    var leftAxis = d3.axisLeft(yScale);

    yAxis.transition()
        .duration(1000)
        .call(leftAxis);

    return yAxis;
};

// function used for updating circles group with a transition to
// new circles
function renderXCircles(circlesGroup, textGroup, xScale, chosenXAxis) {

    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => xScale(d[chosenXAxis]));

    textGroup.transition()
        .duration(1000)
        .attr("x", d => xScale(d[chosenXAxis]));


    return circlesGroup;
};

// function used for updating circles group with a transition to
// new circles
function renderYCircles(circlesGroup, textGroup, yScale, chosenYAxis) {

    circlesGroup.transition()
        .duration(1000)
        .attr("cy", d => yScale(d[chosenYAxis]));

    textGroup.transition()
        .duration(1000)
        .attr("y", d => yScale(d[chosenYAxis]));

    return circlesGroup;
};

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

    var labelx;
    var labely;

    if (chosenXAxis === "poverty") {
        labelx = "Poverty Rate: ";
    }
    else if (chosenXAxis === 'age') {
        labelx = "Median Age: ";
    }
    else {
        labelx = "Household Income: "
    }

    if (chosenYAxis === "healthcare") {
        labely = "Lack of Healthcare Rate: ";
    }
    else if (chosenYAxis === 'smokes') {
        labely = "Smoking Rate: ";
    }
    else {
        chosenYAxis = 'Obesity Rate: '
    }

    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([10, -10])
        .html(function (d) {
            return (`<strong>${d['state']}<strong><br>${labelx} ${d[chosenXAxis]} <br>${labely} ${d[chosenYAxis]} `);
        });

    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", function (data) {
        toolTip.show(data);
    })
        // onmouseout event
        .on("mouseout", function (data, index) {
            toolTip.hide(data);
        });

    return circlesGroup;
};

// Retrieve data from the CSV file and execute everything below
d3.csv("assets/data/data.csv").then(function (data, err) {
    if (err) throw err;

    // parse data
    data.forEach(function (data) {
        data['poverty'] = +data['poverty'];
        data['healthcare'] = +data['healthcare'];
        data['age'] = +data['age'];
        data['income'] = +data['income'];
        data['obesity'] = +data['obesity'];
        data['smokes'] = +data['smokes'];
    });

    // xLinearScale function above csv import
    var xLinearScale = xScale(data, chosenXAxis);

    // yLinearScale function above csv import
    var yLinearScale = yScale(data, chosenYAxis);

    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // append x axis
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    // append y axis
    var yAxis = chartGroup.append("g")
        .classed("y-axis", true)
        .call(leftAxis);

    // append initial circles
    var circlesGroup = chartGroup.append('g')
        .selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", 15)
        .attr("fill", "#9b59b6")
        .attr("opacity", ".75")
        .style("stroke", "#3498db")
        .style("stroke-width", 1);

    //Add state abbr labels    
    var textGroup = chartGroup.append('g')
        .selectAll("panda")
        .data(data)
        .enter()
        .append("text")
        .text(d => d['abbr'])
        .attr("x", (d) => xLinearScale(d[chosenXAxis]))
        .attr("y", (d) => yLinearScale(d[chosenYAxis]))
        .attr('font-size', '10px')
        .style('font', 'bold Verdana, Helvetica, Arial, sans-serif')
        .attr('text-anchor', 'middle')
        .style("opacity", 1)
        .style('fill', 'black');

    // Create group for two x-axis labels
    var xlabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var povertyLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty") // value to grab for event listener
        .classed("active", true)
        .classed("aText", true)
        .text("Poverty Rate (%)");

    var ageLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 45)
        .attr("value", "age") // value to grab for event listener
        .classed("inactive", true)
        .classed("aText", true)
        .text("Age (Median)");

    var incomeLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 70)
        .attr("value", "income") // value to grab for event listener
        .classed("inactive", true)
        .classed("aText", true)
        .text("Household Income (Median $USD)");

    // Create group for two y-axis labels
    var ylabelsGroup = chartGroup.append("g")
        .attr("transform", "rotate(-90)");

    var healthcareLabel = ylabelsGroup.append("text")
        .attr("y", 55 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("value", "healthcare") // value to grab for event listener
        .classed("active", true)
        .attr("dy", "1em")
        .classed("aText", true)
        .text("Lack of Healthcare (%)");

    var smokesLabel = ylabelsGroup.append("text")
        .attr("y", 45 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("value", "smokes") // value to grab for event listener
        .classed("inactive", true)
        .classed("aText", true)
        .text("Smokes (%)");

    var obeseLabel = ylabelsGroup.append("text")
        .attr("y", 20 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("value", "obesity") // value to grab for event listener
        .classed("inactive", true)
        .classed("aText", true)
        .text("Obesity (%)");

    // updateToolTip function above csv import
    circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    // x axis labels event listener
    xlabelsGroup.selectAll("text")
        .on("click", function () {
            // get value of selection
            var xValue = d3.select(this).attr("value");
            if (xValue !== chosenXAxis) {

                // replaces chosenXAxis with value
                chosenXAxis = xValue;

                // console.log(chosenXAxis)

                // functions here found above csv import
                // updates x scale for new data
                xLinearScale = xScale(data, chosenXAxis);

                // updates x axis with transition
                xAxis = renderXAxes(xLinearScale, xAxis);

                // updates circles with new x values
                circlesGroup = renderXCircles(circlesGroup, textGroup, xLinearScale, chosenXAxis);

                // updates tooltips with new info
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

                // changes classes to change bold text
                if (chosenXAxis === "poverty") {
                    povertyLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else if (chosenXAxis === "age") {
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    ageLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else {
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", true)
                        .classed("inactive", false);
                }
            }
        });

    // y axis labels event listener
    ylabelsGroup.selectAll("text")
        .on("click", function () {
            // get value of selection
            var yValue = d3.select(this).attr("value");
            if (yValue !== chosenYAxis) {

                // replaces chosenYAxis with value
                chosenYAxis = yValue;

                // console.log(chosenXAxis)

                // functions here found above csv import
                // updates y scale for new data
                yLinearScale = yScale(data, chosenYAxis);

                // updates y axis with transition
                yAxis = renderYAxes(yLinearScale, yAxis);

                // updates circles with new y values
                circlesGroup = renderYCircles(circlesGroup, textGroup, yLinearScale, chosenYAxis);

                // updates tooltips with new info
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

                // changes classes to change bold text
                if (chosenYAxis === "healthcare") {
                    healthcareLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    smokesLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    obeseLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else if (chosenYAxis === "smokes") {
                    healthcareLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    smokesLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    obeseLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else {
                    healthcareLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    smokesLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    obeseLabel
                        .classed("active", true)
                        .classed("inactive", false);
                }
            }
        });
}).catch(function (error) {
    console.log(error);
});