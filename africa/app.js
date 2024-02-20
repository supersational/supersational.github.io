
const nicename = (name) => removeDiacritics(name).toLowerCase().replace(/\s+|'/g, "-") + '.webp';
function init(files) {
    console.log("init")
    // Define map dimensions
    const width = 500, height = 600;

    // Create a projection
    const projection = d3.geoMercator()
        .center([20, 0]) // Roughly center the map over Africa
        .scale(350)
        .translate([width / 2, height / 2]);

    // Create a path generator
    const pathGenerator = d3.geoPath().projection(projection);

    // Create SVG element
    const svg = d3.select("#africa-map").append("svg")
        .attr("width", width)
        .attr("height", height);


    // Add a blue rectangle to act as the background
    svg.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "#d6deff");
    // console.log(svg)
    // Assuming the rest of your setup is defined above this point
    d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json').then(data => {
        const { feature } = topojson; // Ensure topojson is loaded and accessible
        const countries = feature(data, data.objects.countries).features;
        console.log("countries.json")
        console.log(JSON.stringify(countries.map(country => nicename(country.properties.name))))
        // Filter for African countries by their IDs or any other property you have
        const africanCountries = countries.filter(country => files.includes(nicename(country.properties.name)));
        console.log("africanCountries")
        console.log(JSON.stringify(africanCountries.map(country => nicename(country.properties.name))))
        console.log('missing countries')
        console.log(files.filter(file => !africanCountries.map(country => nicename(country.properties.name)).includes(file)))
        // Define patterns for flags
        const patterns = svg.append("defs").selectAll("pattern")
            .data(africanCountries)
            .enter().append("pattern")
            .attr("id", d => `flag-${nicename(d.properties.name).split(".")[0]}`) // Valid ID
            .attr("patternUnits", "objectBoundingBox")
            .attr("width", 1) // This scales the pattern to the bounding box of the element it fills
            .attr("height", 1)
            .attr("viewBox", "0 0 1 1") // Ensure the viewBox matches the pattern's aspect ratio
            .attr("preserveAspectRatio", "xMidYMid slice"); // Adjust this to control the image scaling/fitting

        patterns.append("image")
            .attr("xlink:href", d => getFlagUrl(d.properties.name))
            .attr("width", 1)
            .attr("height", 1)
            .attr("preserveAspectRatio", "xMidYMid meet");

        // Draw each country using the pattern as fill
        svg.selectAll('path')
            .data(africanCountries)
            .enter().append('path')
            .attr('class', 'country')
            .attr('d', pathGenerator)
            .attr("fill", d => `url(#flag-${nicename(d.properties.name).split(".")[0]})`);

        // Function to get flag URL by country name
        function getFlagUrl(name) {
            // return "./pics/" + name.toLowerCase().replace(/[\s,']/g, '-') + ".webp";
            return "./pics/" + nicename(name)
        }

        // Define a drag behavior
        const dragHandler = d3.drag()
            .on("start", function (event, d) {
                // Prevent any further propagation of the current event
                event.sourceEvent.stopPropagation();
            })
            .on("drag", function (event, d) {
                // Calculate new offset based on drag movement
                // Get the pattern for the current country
                const patternId = `flag-${nicename(d.properties.name).split(".")[0]}`;
                const pattern = svg.select(`#${patternId}`);

                // Adjust the pattern's image offset using event.dx and event.dy
                // Note: This simple example moves the image 1:1 with mouse movement; you might want to scale this
                let currentX = parseFloat(pattern.select("image").attr("x") || 0);
                let currentY = parseFloat(pattern.select("image").attr("y") || 0);
                pattern.select("image")
                    .attr("x", currentX + event.dx / 100) // Adjust scaling factor as needed
                    .attr("y", currentY + event.dy / 100);
            });

        // Apply the drag behavior to each country path
        svg.selectAll('path.country').call(dragHandler);

        // Draw each country using the pattern as fill
        svg.selectAll('path.country')
            .on("mouseover", function (event, d) {
                d3.select(this)
                    .raise() // Brings the element to the top, making sure the stroke is visible
                    //   .transition() // Smooth transition for the stroke appearance
                    //   .duration(150)
                    .style("stroke", "black") // Set the stroke color
                    .style("stroke-width", 2); // Set the stroke width
            })
            .on("mouseout", function (event, d) {
                d3.select(this)
                    //   .transition() // Smooth transition for the stroke disappearance
                    //   .duration(150)
                    .style("stroke", null) // Remove the stroke color
                    .style("stroke-width", null); // Remove the stroke width
            });
    });

}
fetch('./filelist.json').then(response => response.json()).then(files => {
    files = files.map(file => nicename(file).replace(".webp", ""))
    // console.log(files)
    init(files)
})