const areaWidth = 800,
      areaHeight = 500,
      areaMargin = { top: 20, right: 50, bottom: 50, left: 80 };

const areaSvg = d3.select("#area-chart")
  .append("g")
  .attr("transform", `translate(${areaMargin.left},${areaMargin.top})`);

// Use a unique dataset variable name for the area chart
const areaDatasetUrl = "https://gist.githubusercontent.com/mas5021/YOUR_GIST_ID/raw/YOUR_COMMIT_ID/world_population_extended.csv";

d3.csv(areaDatasetUrl).then(data => {
  console.log("✅ Area Chart Data Loaded:", data);

  // Format data: convert Year and Population to numbers
  data.forEach(d => {
    d.Year = +d.Year.trim();
    d.Population = +d.Population;
  });

  // Group data by Year
  const nestedData = d3.groups(data, d => d.Year)
    .map(([year, values]) => {
      let entry = { Year: +year };
      values.forEach(d => {
        if (d.Region && d.Population) {
          entry[d.Region] = d.Population;
        }
      });
      return entry;
    });
  console.log("✅ Nested Data:", nestedData);

  // Extract unique regions (keys) except Year
  const keys = Object.keys(nestedData[0]).filter(k => k !== "Year");

  // X scale: for years
  const x = d3.scaleLinear()
    .domain(d3.extent(nestedData, d => d.Year))
    .range([0, areaWidth - areaMargin.left - areaMargin.right]);

  // Y scale: for total population
  const y = d3.scaleLinear()
    .domain([0, d3.max(nestedData, d => d3.sum(keys, key => d[key]))])
    .range([areaHeight - areaMargin.top - areaMargin.bottom, 0]);

  // Stack the data by region
  const stack = d3.stack().keys(keys);
  const stackedData = stack(nestedData);
  console.log("✅ Stacked Data:", stackedData);

  // Area generator for the stacked chart
  const area = d3.area()
    .x(d => x(d.data.Year))
    .y0(d => y(d[0]))
    .y1(d => y(d[1]));

  // Color scale for regions
  const color = d3.scaleOrdinal(d3.schemeCategory10).domain(keys);

  // Create tooltip for the area chart
  const tooltip = d3.select("#tooltip");

  // Clear previous elements
  areaSvg.selectAll("*").remove();

  // Draw each stacked area with interaction
  areaSvg.selectAll(".area")
    .data(stackedData)
    .enter()
    .append("path")
    .attr("class", "area")
    .attr("fill", d => color(d.key))
    .attr("opacity", 0.8)
    .attr("stroke", "#000")
    .attr("stroke-width", 1)
    .attr("d", area)
    .on("mouseover", (event, d) => {
      d3.select(event.currentTarget).transition().duration(200)
        .attr("opacity", 1);
      tooltip.transition().duration(200).style("opacity", 0.9);
      tooltip.html(`<strong>Region:</strong> ${d.key}`)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 28) + "px");
    })
    .on("mousemove", (event) => {
      tooltip.style("left", (event.pageX + 10) + "px")
             .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", (event, d) => {
      d3.select(event.currentTarget).transition().duration(200)
        .attr("opacity", 0.8);
      tooltip.transition().duration(200).style("opacity", 0);
    });

  // X Axis
  areaSvg.append("g")
    .attr("transform", `translate(0, ${areaHeight - areaMargin.top - areaMargin.bottom})`)
    .call(d3.axisBottom(x).tickFormat(d3.format("d")));

  // Y Axis
  areaSvg.append("g")
    .call(d3.axisLeft(y));

  // Legend for the area chart
  const legend = areaSvg.selectAll(".legend")
    .data(keys)
    .enter()
    .append("g")
    .attr("class", "legend")
    .attr("transform", (d, i) => `translate(${areaWidth - 200}, ${i * 20})`);

  legend.append("rect")
    .attr("width", 18)
    .attr("height", 18)
    .attr("fill", d => color(d));

  legend.append("text")
    .attr("x", 24)
    .attr("y", 14)
    .style("font-size", "14px")
    .text(d => d);
});
