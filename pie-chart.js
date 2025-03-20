const pieWidth = 500, pieHeight = 500, pieRadius = Math.min(pieWidth, pieHeight) / 2;

// Append SVG element
const pieSvg = d3.select("#pie-chart")
    .append("g")
    .attr("transform", `translate(${pieWidth / 2}, ${pieHeight / 2})`);

// GitHub Gist dataset URL
const datasetUrl = "https://gist.githubusercontent.com/mas5021/c556004ae018d839bd2c6795ab6d624d/raw/026c349c96a9cdc0c9542ff31643432a119b2bbd/world_population.csv";

d3.csv(datasetUrl).then(data => {
    console.log("✅ Pie Chart Data Loaded:", data); // Debugging Step 1

    // Ensure data is formatted correctly
    data.forEach(d => {
        d.Year = d.Year.trim(); // Ensure no extra spaces
        d.Population = +d.Population;
    });

    // Filter for 2020 data
    const population2020 = data.filter(d => d.Year === "2020");
    console.log("✅ Filtered Data (2020):", population2020); // Debugging Step 2

    if (population2020.length === 0) {
        console.error("❌ No data found for 2020. Check dataset format.");
        return;
    }

    // Create Pie Data
    const pie = d3.pie().value(d => d.Population);
    const pieData = pie(population2020);
    console.log("✅ Pie Data Processed:", pieData); // Debugging Step 3

    // Define Arc Generator
    const arc = d3.arc().innerRadius(0).outerRadius(pieRadius);
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    // Clear previous elements before appending new ones
    pieSvg.selectAll("*").remove();

    // Append Pie Chart Paths
    pieSvg.selectAll("path")
        .data(pieData)
        .enter()
        .append("path")
        .attr("d", arc)
        .attr("fill", d => color(d.data.Region))
        .attr("stroke", "white")
        .style("stroke-width", "2px");

    // Add legend
    const legend = pieSvg.selectAll(".legend")
        .data(population2020)
        .enter().append("g")
        .attr("transform", (d, i) => `translate(-50, ${i * 20 - 100})`);

    legend.append("rect")
        .attr("width", 18)
        .attr("height", 18)
        .attr("fill", d => color(d.Region));

    legend.append("text")
        .attr("x", 24)
        .attr("y", 14)
        .text(d => d.Region);
});
