const pieWidth = 550,
      pieHeight = 550,
      pieRadius = Math.min(pieWidth, pieHeight) / 2,
      innerRadius = pieRadius * 0.5; // Donut hole size

const pieSvg = d3.select("#pie-chart")
  .append("g")
  .attr("transform", `translate(${pieWidth / 2}, ${pieHeight / 2})`);

// Replace with your dataset link (GitHub Gist raw or local path)
const pieDatasetUrl = "https://gist.githubusercontent.com/mas5021/c556004ae018d839bd2c6795ab6d624d/raw/06a25453f364af0081807aa5ce006a8287d49c37/world_population.csv";

d3.csv(pieDatasetUrl).then(data => {
  // Sum 2022 Population by Continent
  const continentPop2022 = d3.rollup(
    data,
    v => d3.sum(v, d => +d["2022 Population"]),
    d => d.Continent.trim()
  );

  const pieDataArray = Array.from(continentPop2022, ([Continent, Population]) => ({ Continent, Population }));
  
  // Create pie layout
  const pie = d3.pie().value(d => d.Population);
  const arcs = pie(pieDataArray);

  // Arc generator
  const arc = d3.arc().innerRadius(innerRadius).outerRadius(pieRadius);

  // Use a different color scheme for more variety
  const color = d3.scaleOrdinal()
    .domain(pieDataArray.map(d => d.Continent))
    .range(d3.schemeSet3);

  // Shared tooltip
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
    // Hover
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

  // Slice labels
  pieSvg.selectAll(".arc-label")
    .data(arcs)
    .enter()
    .append("text")
    .attr("class", "arc-label")
    .attr("transform", d => `translate(${arc.centroid(d)})`)
    .text(d => d.data.Continent);

  // Create a bounding box for the legend
  const legendOffsetX = pieRadius + 20;
  const legendOffsetY = -pieRadius + 20;
  const legendSpacing = 20;
  const legendRectSize = 18;

  const legendData = pieDataArray;
  const legendBoxWidth = 160;
  const legendBoxHeight = legendData.length * legendSpacing + 20;

  const legendGroup = pieSvg.append("g")
    .attr("class", "legend-group")
    .attr("transform", `translate(${legendOffsetX}, ${legendOffsetY})`);

  // Legend background
  legendGroup.append("rect")
    .attr("class", "legend-bg")
    .attr("width", legendBoxWidth)
    .attr("height", legendBoxHeight);

  // Legend items
  const legendItems = legendGroup.selectAll(".legend-item")
    .data(legendData)
    .enter()
    .append("g")
    .attr("class", "legend-item")
    .attr("transform", (d, i) => `translate(10, ${i * legendSpacing + 10})`);

  legendItems.append("rect")
    .attr("width", legendRectSize)
    .attr("height", legendRectSize)
    .attr("fill", d => color(d.Continent));

  legendItems.append("text")
    .attr("x", legendRectSize + 8)
    .attr("y", legendRectSize - 4)
    .style("font-size", "14px")
    .text(d => d.Continent);
});
