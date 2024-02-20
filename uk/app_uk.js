function checkImage(url) {
    return fetch(url, { method: 'HEAD' })
        .then(res => {
            if (res.ok) {
                return url; // Image exists
            } else {
                throw new Error('Image not found');
            }
        }).catch(error => {
            console.log(error.message);
            return null; // Handle the error or return a fallback image URL
        });
}
async function getPicsList() {
    let response = await fetch('./pics')
    let html = await response.text()

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const links = Array.from(doc.querySelectorAll('a[href$=".webp"]')); // Select all <a> tags with href ending in ".webp"
    let fileLinks = links.map(link => decodeURI(link.href).split('/'));
    fileLinks = fileLinks.map(link => link[link.length - 1].split(".")[0]);
    return fileLinks;
}

let hoveredElement = null;

const nicename = (name) => removeDiacritics(name).toLowerCase().replace(/\s+|'/g, "-")
async function init() {
    let picsList = await getPicsList()
    console.log(picsList);
    // Define map dimensions
    const width = 400, height = 600;

    // Create a projection
    const projection = d3.geoMercator()
        .center([1, 55.4])
        .rotate([4.4, 0])
        .scale(1600)
        .translate([width / 2, height / 2]);

    // Create a path generator
    // const pathGenerator = d3.geoPath().projection(projection);

    // Create SVG element
    const svg = d3.select("#map").append("svg")
        .attr("width", width)
        .attr("height", height);


    // Add a blue rectangle to act as the background
    svg.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "#d6deff");
    // console.log(svg)
    // Assuming the rest of your setup is defined above this point
    d3.json("uk_counties.json").then(function (data) {
        const { feature } = topojson; // Ensure topojson is loaded and accessible


        // Example row:
        // { "type": "Feature", "properties": { "featurecla": "Admin-1 states provinces", "scalerank": 8, "adm1_code": "GBR-2751", "diss_me": 2751, "iso_3166_2": "GB-OXF", "wikipedia": null, "iso_a2": "GB", "adm0_sr": 1, "name": "Oxfordshire", "name_alt": null, "name_local": null, "type": "Administrative County", "type_en": "Administrative County", "code_local": null, "code_hasc": "GB.OX", "note": null, "hasc_maybe": null, "region": "South East", "region_cod": null, "provnum_ne": 20026, "gadm_level": 2, "check_me": 20, "datarank": 5, "abbrev": null, "postal": "OX", "area_sqkm": 0, "sameascity": 9, "labelrank": 9, "name_len": 11, "mapcolor9": 6, "mapcolor13": 3, "fips": "UKK2", "fips_alt": "UKK2", "woe_id": 12602175, "woe_label": null, "woe_name": "Oxfordshire", "latitude": 51.7912, "longitude": -1.29123, "sov_a3": "GB1", "adm0_a3": "GBR", "adm0_label": 7, "admin": "United Kingdom", "geonunit": "England", "gu_a3": "ENG", "gn_id": 2640726, "gn_name": "Oxfordshire", "gns_id": -2604914, "gns_name": "Oxfordshire, County of", "gn_level": 2, "gn_region": null, "gn_a1_code": "GB.K2", "region_sub": "Oxfordshire", "sub_code": null, "gns_level": 1, "gns_lang": "eng", "gns_adm1": null, "gns_region": "UK01", "min_label": 10.0, "max_label": 11.0, "min_zoom": 10.0, "wikidataid": "Q23169", "name_ar": "أكسفوردشير", "name_bn": "অক্সফোর্ডশায়ার", "name_de": "Oxfordshire", "name_en": "Oxfordshire", "name_es": "Oxfordshire", "name_fr": "Oxfordshire", "name_el": "Όξφορντσιρ", "name_hi": "ऑक्सफ़र्डशायर", "name_hu": "Oxfordshire", "name_id": "Oxfordshire", "name_it": "Oxfordshire", "name_ja": "オックスフォードシャー", "name_ko": "옥스퍼드셔", "name_nl": "Oxfordshire", "name_pl": "Oxfordshire", "name_pt": "Oxfordshire", "name_ru": "Оксфордшир", "name_sv": "Oxfordshire", "name_tr": "Oxfordshire", "name_vi": "Oxfordshire", "name_zh": "牛津郡", "ne_id": 1159314751, "name_he": "אוקספורדשייר", "name_uk": "Оксфордшир", "name_ur": "اوکسفرڈشائر", "name_fa": "آکسفوردشایر", "name_zht": "牛津郡", "FCLASS_ISO": null, "FCLASS_US": null, "FCLASS_FR": null, "FCLASS_RU": null, "FCLASS_ES": null, "FCLASS_CN": null, "FCLASS_TW": null, "FCLASS_IN": null, "FCLASS_NP": null, "FCLASS_PK": null, "FCLASS_DE": null, "FCLASS_GB": null, "FCLASS_BR": null, "FCLASS_IL": null, "FCLASS_PS": null, "FCLASS_SA": null, "FCLASS_EG": null, "FCLASS_MA": null, "FCLASS_PT": null, "FCLASS_AR": null, "FCLASS_JP": null, "FCLASS_KO": null, "FCLASS_VN": null, "FCLASS_TR": null, "FCLASS_ID": null, "FCLASS_PL": null, "FCLASS_GR": null, "FCLASS_IT": null, "FCLASS_NL": null, "FCLASS_SE": null, "FCLASS_BD": null, "FCLASS_UA": null, "FCLASS_TLC": null }, "geometry": { "type": "Polygon", "coordinates": [ [ [ -1.649273646561539, 
        // Extract counties names
        const counties = data.features.map(feature => feature.properties.name)


        console.log("counties")
        console.log(counties.length)
        // console.log(JSON.stringify(counties))
        console.log(JSON.stringify(counties.slice(0, 6)))
        // Define patterns for flags
        const patterns = svg.append("defs").selectAll("pattern")
            // .data(data.features)
            .data(picsList)
            .enter().append("pattern")
            .attr("id", d => `flag-${nicename(d)}`) // Valid ID
            .attr("patternUnits", "objectBoundingBox")
            .attr("width", 1) // This scales the pattern to the bounding box of the element it fills
            .attr("height", 1)
            .attr("viewBox", "0 0 1 1") // Ensure the viewBox matches the pattern's aspect ratio
            .attr("preserveAspectRatio", "xMidYMid slice"); // Adjust this to control the image scaling/fitting

        console.log(patterns)
        patterns.append("image")
            .attr("xlink:href", d => getFlagUrl(d))
            .attr("width", 1)
            .attr("height", 1)
            .attr("preserveAspectRatio", "xMidYMid meet")

        // Define a path generator
        var path = d3.geoPath()
            .projection(projection);
        // Draw the map
        svg.selectAll("path")
            .data(data.features)
            .enter()
            .append("path")
            .attr("d", path)
            .attr("id", d => nicename(d.properties.name))
            .attr("fill", d => {
                if (picsList.includes(d.properties.name)) {
                    // console.log(`url(#flag-${nicename(d.properties.name)})`)
                    return `url(#flag-${nicename(d.properties.name)})`
                }
                return 'lightblue'
            })
            .attr('class', d => 'county ' + d.properties.name)
            .attr("stroke", "white")
            .attr("stroke-width", 0.5);

        // Function to get flag URL by county name
        function getFlagUrl(name) {
            // return "./pics/" + name.toLowerCase().replace(/[\s,']/g, '-') + ".webp";
            return "./pics/" + name + ".webp"
        }

        moveStuff(svg)
        zoomStuff(svg)

    });

}

function moveStuff(svg) {
    const moveLevels = JSON.parse(localStorage.getItem('moveLevels')) || {};

    // Define a drag behavior
    const dragHandler = d3.drag()
        .on("start", function (event, d) {
            // Prevent any further propagation of the current event
            event.sourceEvent.stopPropagation();
        })
        .on("drag", function (event, d) {
            // Calculate new offset based on drag movement
            // Get the pattern for the current county
            const patternId = `${nicename(d.properties.name)}`;
            console.log(patternId)
            const pattern = svg.select(`#flag-${patternId}`);

            // Adjust the pattern's image offset using event.dx and event.dy
            // Note: This simple example moves the image 1:1 with mouse movement; you might want to scale this
            let currentX = parseFloat(pattern.select("image").attr("x") || 0);
            let currentY = parseFloat(pattern.select("image").attr("y") || 0);
            pattern.select("image")
                .attr("x", currentX + event.dx / 100) // Adjust scaling factor as needed
                .attr("y", currentY + event.dy / 100);
            
            // Store the updated move level
            moveLevels[patternId] = [currentX + event.dx / 100, currentY + event.dy / 100];
            localStorage.setItem('moveLevels', JSON.stringify(moveLevels));
            console.log(moveLevels)
        });

    // Apply the drag behavior to each county path
    svg.selectAll('path.county').call(dragHandler);

    // Draw each county using the pattern as fill
    svg.selectAll('path.county')
        .on("mouseover", function (event, d) {
            hoveredElement = this;
            d3.select(this)
                .raise() // Brings the element to the top, making sure the stroke is visible
                //   .transition() // Smooth transition for the stroke appearance
                //   .duration(150)
                .style("stroke", "black") // Set the stroke color
                .style("stroke-width", 2); // Set the stroke width
            console.log(d.properties.name)
        })
        .on("mouseout", function (event, d) {
            d3.select(this)
                //   .transition() // Smooth transition for the stroke disappearance
                //   .duration(150)
                .style("stroke", null) // Remove the stroke color
                .style("stroke-width", null); // Remove the stroke width
        });

        // load the move levels from localStorage
        // Apply the stored move levels to the images
        for (const [patternId, move] of Object.entries(moveLevels)) {
            const pattern = svg.select(`#flag-${patternId}`);
            console.log("patternId", `#flag-${patternId}`, document.querySelector(`#flag-${patternId}`), move)

            const image = pattern.select("image");
            image.attr("x", move[0])
                .attr("y", move[1]);
        }


}
function zoomStuff(svg) {
    // This will store the zoom levels for each pattern
    const zoomLevels = JSON.parse(localStorage.getItem('zoomLevels')) || {};

    // Attach the keydown event listener to the document
    d3.select(document).on("keydown", function (event) {
        // const hoveredElement = d3.select(':hover');
        if (!hoveredElement) return;
        let hoveredEl = d3.select(hoveredElement);
        // console.log(event.key)
        if (hoveredEl.node().tagName === 'path') {
            // Extract the pattern ID from the hovered county
            const patternId = hoveredElement.getAttribute("id")
            const pattern = svg.select(`#flag-${patternId}`);
            // console.log(document.querySelector(`#${patternId}`))
            const image = pattern.select("image");
            console.log(image)
            // Retrieve the current zoom level from the stored levels or default to 1
            let currentZoom = zoomLevels[patternId] || 1;

            // Update the zoom level based on the key pressed
            if (event.key === '+' || event.key === '=') {
                currentZoom *= 1.1; // Increase the zoom level by 10%
            } else if (event.key === '-' || event.key === '_') {
                currentZoom /= 1.1; // Decrease the zoom level by 10%
            }
            console.log(currentZoom)
            // Apply the new zoom level to the image
            image.attr("width", currentZoom)
                .attr("height", currentZoom);

            // Store the updated zoom level
            zoomLevels[patternId] = currentZoom;

            // Save the zoom levels to localStorage
            localStorage.setItem('zoomLevels', JSON.stringify(zoomLevels));
        }
    });

    // Apply the stored zoom levels on load

    // console.log(zoomLevels)
    // console.log(document.querySelectorAll("defs"))
    // Apply the stored zoom levels to the images
    for (const [patternId, zoom] of Object.entries(zoomLevels)) {
        const pattern = svg.select(`#flag-${patternId}`);
        // console.log("patternId", `#flag-${patternId}`, document.querySelector(`#flag-${patternId}`), zoom)

        const image = pattern.select("image");
        image.attr("width", zoom)
            .attr("height", zoom);
    }


}


init()

