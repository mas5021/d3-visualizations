const pieWidth = 500,
      pieHeight = 500,
      pieRadius = Math.min(pieWidth, pieHeight) / 2,
      innerRadius = pieRadius * 0.5; // Donut hole size

// Append group to the SVG
const pieSvg = d3.select("#pie-chart")
  .append("g")
  .attr("transform", `translate(${pieWidth / 2}, ${pieHeight / 2})`);

// Replace with your raw GitHub Gist link or local file path
const pieDatasetUrl = "https://gist.githubusercontent.com/mas5021/c556004ae018d839bd2c6795ab6d624d/raw/06a25453f364af0081807aa5ce006a8287d49c37/world_population.csv";

d3.csv(pieDatasetUrl).then(data => {
  // 1) Sum 2022 Population by Continent
  const continentPop2022 = d3.rollup(
    data,
    v => d3.sum(v, d => +d["2022 Population"]),
    d => d.Continent.trim()
  );

  // Convert rollup to array of objects
  const pieDataArray = Array.from(continentPop2022, ([Continent, Population]) => ({ Continent, Population }));

  // 2) Create a pie layout
  const pie = d3.pie().value(d => d.Population);
  const arcs = pie(pieDataArray);

  // 3) Define arc generator
  const arc = d3.arc()
    .innerRadius(innerRadius)
    .outerRadius(pieRadius);

  // 4) More attractive color palette (Tableau10)
  const color = d3.scaleOrdinal()
    .domain(pieDataArray.map(d => d.Continent))
    .range(d3.schemeTableau10);

  // 5) Shared tooltip
  const tooltip = d3.select("#tooltip");

  // Clear old elements
  pieSvg.selectAll("*").remove();

  // Draw donut slices
  pieSvg.selectAll("path")
    .data(arcs)
    .enter()
    .append("path")
    .attr("d", arc)
    .attr("fill", d => color(d.data.Continent))
    .attr("stroke", "#fff")
    .style("stroke-width", "2px")
    // Hover interaction
    .on("mouseover", (event, d) => {
      d3.select(event.currentTarget).transition().duration(200)
        .attr("transform", "scale(1.05)");
      tooltip.transition().duration(200).style("opacity", 0.9);
      tooltip.html(`
        <strong>Continent:</strong> ${d.data.Continent}<br/>
        <strong>Population (2022):</strong> ${d.data.Population.toLocaleString()}
      `)
      .style("left", (event.pageX + 10) + "px")
      .style("top", (event.pageY - 28) + "px");
    })
    .on("mousemove", event => {
      tooltip.style("left", (event.pageX + 10) + "px")
             .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", (event) => {
      d3.select(event.currentTarget).transition().duration(200)
        .attr("transform", "scale(1)");
      tooltip.transition().duration(200).style("opacity", 0);
    });

  // Add slice labels
  pieSvg.selectAll(".arc-label")
    .data(arcs)
    .enter()
    .append("text")
    .attr("class", "arc-label")
    .attr("transform", d => `translate(${arc.centroid(d)})`)
    .text(d => d.data.Continent);

  // 6) Legend: position to the right of the donut
  const legendOffsetX = pieRadius + 30;   // Adjust as needed
  const legendOffsetY = -pieRadius + 20;  // Adjust as needed

  const legend = pieSvg.selectAll(".legend")
    .data(pieDataArray)
    .enter()
    .append("g")
    .attr("class", "legend")
    .attr("transform", (d, i) => `translate(${legendOffsetX}, ${legendOffsetY + i * 20})`);

  legend.append("rect")
    .attr("width", 18)
    .attr("height", 18)
    .attr("fill", d => color(d.Continent));

  legend.append("text")
    .attr("x", 24)
    .attr("y", 14)
    .style("font-size", "14px")
    .text(d => d.Continent);
});
