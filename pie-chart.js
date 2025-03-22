const pieWidth = 600,
      pieHeight = 600,
// Use a smaller radius so there's space at the bottom
      pieRadius = Math.min(pieWidth, pieHeight) / 2.8,
      innerRadius = pieRadius * 0.5;

// Shift the donut upward to leave room for the legend below
const pieSvg = d3.select("#pie-chart")
  .append("g")
  .attr("transform", `translate(${pieWidth / 2}, ${pieHeight / 2 - 60})`);

// Replace this URL with your own CSV link or local path
const pieDatasetUrl = "https://gist.githubusercontent.com/mas5021/c556004ae018d839bd2c6795ab6d624d/raw/06a25453f364af0081807aa5ce006a8287d49c37/world_population.csv";

d3.csv(pieDatasetUrl).then(data => {
  // 1) Sum the 2022 Population by Continent
  const continentPop2022 = d3.rollup(
    data,
    v => d3.sum(v, d => +d["2022 Population"]),
    d => d.Continent.trim()
  );

  // Convert rollup map to an array
  const pieDataArray = Array.from(continentPop2022, ([Continent, Population]) => ({
    Continent,
    Population
  }));

  // 2) Create the Pie Layout
  const pie = d3.pie().value(d => d.Population);
  const arcs = pie(pieDataArray);

  // 3) Arc Generator (Donut)
  const arc = d3.arc()
    .innerRadius(innerRadius)
    .outerRadius(pieRadius);

  // 4) Color Scale (schemeSet3 for variety)
  const color = d3.scaleOrdinal()
    .domain(pieDataArray.map(d => d.Continent))
    .range(d3.schemeSet3);

  // Tooltip (shared by slices)
  const tooltip = d3.select("#tooltip");

  // Clear old elements
  pieSvg.selectAll("*").remove();

  // 5) Draw Donut Slices
  pieSvg.selectAll("path")
    .data(arcs)
    .enter()
    .append("path")
    .attr("d", arc)
    .attr("fill", d => color(d.data.Continent))
    .attr("stroke", "#fff")
    .style("stroke-width", 2)
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

  // 6) Slice Labels (Continent Names)
  pieSvg.selectAll(".arc-label")
    .data(arcs)
    .enter()
    .append("text")
    .attr("class", "arc-label")
    .attr("transform", d => `translate(${arc.centroid(d)})`)
    .text(d => d.data.Continent);

  // 7) Legend (Reduced Size & Tighter Spacing)
  const legendData = pieDataArray;
  const legendSpacing = 16;    // Less spacing between legend rows
  const legendRectSize = 14;   // Smaller color squares
  const legendBoxWidth = 100;  // Narrow bounding box
  const legendBoxHeight = legendData.length * legendSpacing + 16;

  // Place the legend below the donut
  // top-left corner at (-pieRadius, pieRadius+30)
  const legendGroup = pieSvg.append("g")
    .attr("transform", `translate(${-pieRadius}, ${pieRadius + 30})`);

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
    .attr("transform", (d, i) => `translate(8, ${i * legendSpacing + 8})`);

  legendItems.append("rect")
    .attr("width", legendRectSize)
    .attr("height", legendRectSize)
    .attr("fill", d => color(d.Continent));

  legendItems.append("text")
    .attr("x", legendRectSize + 6)
    .attr("y", legendRectSize - 3)
    .style("font-size", "12px")  // Smaller font
    .text(d => d.Continent);
});
