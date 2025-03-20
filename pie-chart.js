const pieWidth = 500,
      pieHeight = 500,
      pieRadius = Math.min(pieWidth, pieHeight) / 2,
      innerRadius = pieRadius * 0.5; // Inner radius for donut effect

// Append group to the SVG
const pieSvg = d3.select("#pie-chart")
  .append("g")
  .attr("transform", `translate(${pieWidth / 2}, ${pieHeight / 2})`);

// GitHub Gist dataset URL (use your own if different)
const datasetUrl = "https://gist.githubusercontent.com/mas5021/c556004ae018d839bd2c6795ab6d624d/raw/026c349c96a9cdc0c9542ff31643432a119b2bbd/world_population.csv";

d3.csv(datasetUrl).then(data => {
  console.log("Pie Chart Data Loaded:", data);

  // Clean and filter data
  data.forEach(d => {
    d.Year = d.Year.trim();
    d.Population = +d.Population;
  });
  const population2020 = data.filter(d => d.Year === "2020");

  // If no data found for 2020, exit
  if (population2020.length === 0) {
    console.error("No 2020 data found in the CSV.");
    return;
  }

  // Create Pie Layout
  const pie = d3.pie().value(d => d.Population);
  const pieData = pie(population2020);

  // Define Arc Generator (Donut)
  const arc = d3.arc()
    .innerRadius(innerRadius)
    .outerRadius(pieRadius);

  // Define Color Scale
  const color = d3.scaleOrdinal(d3.schemeCategory10);

  // Clear old elements if any
  pieSvg.selectAll("*").remove();

  // Draw the arcs
  pieSvg.selectAll("path")
    .data(pieData)
    .enter()
    .append("path")
    .attr("d", arc)
    .attr("fill", d => color(d.data.Region))
    .attr("stroke", "#fff")
    .style("stroke-width", "2px");

  // Add labels on each slice
  pieSvg.selectAll(".arc-label")
    .data(pieData)
    .enter()
    .append("text")
    .attr("class", "arc-label")
    .attr("transform", d => `translate(${arc.centroid(d)})`)
    .text(d => d.data.Region);

  // Legend
  const legend = pieSvg.selectAll(".legend")
    .data(population2020)
    .enter()
    .append("g")
    .attr("transform", (d, i) => `translate(-50, ${i * 20 - 100})`);

  legend.append("rect")
    .attr("width", 18)
    .attr("height", 18)
    .attr("fill", d => color(d.Region));

  legend.append("text")
    .attr("x", 24)
    .attr("y", 14)
    .text(d => d.Region)
    .attr("class", "legend");
});
