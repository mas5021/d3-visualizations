const pieWidth = 500,
      pieHeight = 500,
      pieRadius = Math.min(pieWidth, pieHeight) / 2,
      innerRadius = pieRadius * 0.5; // For donut effect

// Append group to the SVG
const pieSvg = d3.select("#pie-chart")
  .append("g")
  .attr("transform", `translate(${pieWidth / 2}, ${pieHeight / 2})`);

// Use a unique dataset variable name for the pie chart
const pieDatasetUrl = "https://gist.githubusercontent.com/mas5021/YOUR_GIST_ID/raw/YOUR_COMMIT_ID/world_population_extended.csv";

d3.csv(pieDatasetUrl).then(data => {
  console.log("✅ Pie Chart Data Loaded:", data);

  // Clean and format data
  data.forEach(d => {
    d.Year = d.Year.trim();
    d.Population = +d.Population;
  });
  
  // Filter for 2030 data
  const population2030 = data.filter(d => d.Year === "2030");

  if (population2030.length === 0) {
    console.error("❌ No data found for 2030.");
    return;
  }

  // Create Pie Layout
  const pie = d3.pie().value(d => d.Population);
  const pieData = pie(population2030);
  console.log("✅ Pie Data Processed:", pieData);

  // Define Arc Generator for donut chart
  const arc = d3.arc()
    .innerRadius(innerRadius)
    .outerRadius(pieRadius);

  // Define Color Scale
  const color = d3.scaleOrdinal(d3.schemeCategory10);

  // Clear previous elements
  pieSvg.selectAll("*").remove();

  // Create tooltip selection
  const tooltip = d3.select("#tooltip");

  // Draw pie slices with interactions
  pieSvg.selectAll("path")
    .data(pieData)
    .enter()
    .append("path")
    .attr("d", arc)
    .attr("fill", d => color(d.data.Region))
    .attr("stroke", "#fff")
    .style("stroke-width", "2px")
    .on("mouseover", (event, d) => {
      d3.select(event.currentTarget).transition().duration(200)
        .attr("transform", "scale(1.05)");
      tooltip.transition().duration(200).style("opacity", 0.9);
      tooltip.html(`<strong>Region:</strong> ${d.data.Region}<br><strong>Population:</strong> ${d.data.Population}`)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 28) + "px");
    })
    .on("mousemove", (event) => {
      tooltip.style("left", (event.pageX + 10) + "px")
             .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", (event) => {
      d3.select(event.currentTarget).transition().duration(200)
        .attr("transform", "scale(1)");
      tooltip.transition().duration(200).style("opacity", 0);
    });

  // Add labels on each slice
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

  // Add legend
  const legend = pieSvg.selectAll(".legend")
    .data(population2030)
    .enter()
    .append("g")
    .attr("class", "legend")
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
