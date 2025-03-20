const pieWidth = 500,
      pieHeight = 500,
      pieRadius = Math.min(pieWidth, pieHeight) / 2,
      innerRadius = pieRadius * 0.5; // Inner radius for donut effect

// Append group to the SVG
const pieSvg = d3.select("#pie-chart")
  .append("g")
  .attr("transform", `translate(${pieWidth / 2}, ${pieHeight / 2})`);

// ✅ Change dataset variable name to avoid conflicts
const pieDatasetUrl = "https://gist.githubusercontent.com/mas5021/c556004ae018d839bd2c6795ab6d624d/raw/026c349c96a9cdc0c9542ff31643432a119b2bbd/world_population.csv";

d3.csv(pieDatasetUrl).then(data => {
  console.log("✅ Pie Chart Data Loaded:", data);

  // ✅ Ensure data is formatted correctly
  data.forEach(d => {
    d.Year = d.Year.trim();
    d.Population = +d.Population;
  });

  // ✅ Filter for 2020
  const population2020 = data.filter(d => d.Year === "2020");

  // ✅ Check if data exists
  if (population2020.length === 0) {
    console.error("❌ No 2020 data found in the CSV.");
    return;
  }

  // ✅ Create Pie Layout
  const pie = d3.pie().value(d => d.Population);
  const pieData = pie(population2020);
  console.log("✅ Pie Data Processed:", pieData); // Debugging

  // ✅ Define Arc Generator (Donut)
  const arc = d3.arc()
    .innerRadius(innerRadius) // Donut hole size
    .outerRadius(pieRadius);

  // ✅ Define Color Scale
  const color = d3.scaleOrdinal(d3.schemeCategory10);

  // ✅ Clear old elements before rendering
  pieSvg.selectAll("*").remove();

  // ✅ Draw the arcs (Pie Slices)
  pieSvg.selectAll("path")
    .data(pieData)
    .enter()
    .append("path")
    .attr("d", arc)
    .attr("fill", d => color(d.data.Region))
    .attr("stroke", "#fff")
    .style("stroke-width", "2px");

  // ✅ Add labels on each slice
  pieSvg.selectAll(".arc-label")
    .data(pieData)
    .enter()
    .append("text")
    .attr("class", "arc-label")
    .attr("transform", d => `translate(${arc.centroid(d)})`)
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "middle")
    .style("fill", "#fff")
    .style("font-size", "12px")
    .text(d => d.data.Region);

  // ✅ Add a Legend
  const legend = pieSvg.selectAll(".legend")
    .data(population2020)
    .enter()
    .append("g")
    .attr("transform", (d, i) => `translate(-120, ${i * 20 - 100})`);

  legend.append("rect")
    .attr("width", 18)
    .attr("height", 18)
    .attr("fill", d => color(d.Region));

  legend.append("text")
    .attr("x", 24)
    .attr("y", 14)
    .style("font-size", "14px")
    .text(d => d.Region);
});
