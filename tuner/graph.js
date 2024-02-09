    // Set the dimensions of the canvas / graph
    const margin = { top: 20, right: 20, bottom: 30, left: 50 },
    width = 300 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;

// Set the ranges
const x = d3.scaleLog().range([0, width]);
const y = d3.scaleLinear().domain([0, 5]).range([height, 0]); // 5 seconds for y-axis

// Define the line
const valueline = d3.line()
    .defined(d => d.frequency !== null) // this will skip over entries in the data array that are null
    .x(function (d) { return x(d.frequency); })
    .y(function (d) { return y(d.time); })

// Adds the svg canvas
const svg = d3.select("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Draw gridlines
function makeXGridlines() {
    return d3.axisBottom(x)
        .ticks(12) // 12 semitones in an octave
        .tickSize(-height);
}

// function makeYGridlines() {   
//     return d3.axisLeft(y)
//         .ticks(60) // one tick per second
//         .tickSize(-width);
// }
// Generate random data
let history = [];
function addData(data) {
    history.push(data);
    // Update the domain of the x scale to the new min/max of the frequency
    // console.log(history.length)
}
function generateData() {
    // Here, we simulate a new frequency reading for the current time
    // const newFrequency = 440 + Math.random() * (1500 - 440);
    const newFrequency = (performance.now()/100 % 1000)+ 440 + Math.random() * 100;

    addData({ frequency: newFrequency, time: 0 })
}

// // Add the gridlines
// svg.append("g")
//     .attr("class", "grid")
//     .attr("transform", "translate(0," + height + ")")
//     .call(makeXGridlines().tickSize(-height).tickFormat(""));

// Add the X gridlines and customize the axis as needed
// svg.append("g")
//     .attr("class", "grid x-grid")
//     .attr("transform", "translate(0," + height + ")")
//     .call(makeXGridlines()
//         .tickSize(-height)
//         .tickFormat("")
//     );


// Add X Axis label
svg.append("text")
    .attr("class", "x label")
    .attr("text-anchor", "end")
    .attr("x", width)
    .attr("y", height - 6)
    .text("Frequency (Hz)");

// Add Y Axis label
svg.append("text")
    .attr("class", "y label")
    .attr("text-anchor", "end")
    .attr("y", 6)
    .attr("dy", ".75em")
    .attr("transform", "rotate(-90)")
    .text("Time (s)");


// Add the valueline path.
const path = svg.append("path")
    .attr("class", "line")



let domains = [440, 1500];
// Function to update the graph
function updateGraph() {
    // Update the time for each data point
    history.forEach(function (d) { d.time += 1 / 5; }); // Increment time by 1/5th of a second
    history = history.filter(d => d.time < 5);
    // if all points are null
    if (history.every(d => d.frequency === null)) {
        return;
    }
    // find most recent non null point
    let mostRecentPoint = history.filter(d => d.frequency !== null).pop();

    const padding = 0.5;

    let minDomain = d3.min(history, d => d.frequency) * (1 - padding);
    let maxDomain = d3.max(history, d => d.frequency) * (1 + padding);
    minDomain = Math.min(minDomain, mostRecentPoint.frequency * 0.95);
    maxDomain = Math.max(maxDomain, mostRecentPoint.frequency * 1.05);
    domains = [minDomain * 0.05 + domains[0] * 0.95, maxDomain * 0.05 + domains[1] * 0.95]
    // x.domain(domains);
    x.domain([50, 5000]);
    // Bind the data to the line
    path
        .datum(history)
        .attr("d", valueline);

    // Call the gridlines function to update the gridlines
    // svg.selectAll(".grid")
    //     .call(makeXGridlines().tickSize(-height).tickFormat(""));
}

// Generate a new point every 200ms
let interval = setInterval(() => {
    generateData();
}, 20);
setInterval(() => {
    updateGraph();
}, 20);

// Initial setup
generateData();
updateGraph();