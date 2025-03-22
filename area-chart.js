const areaWidth = 900,
      areaHeight = 550,
// Increase right margin to 180 so the legend has space
      areaMargin = { top: 20, right: 180, bottom: 50, left: 80 };

const areaSvg = d3.select("#area-chart")
  .append("g")
  .attr("transform", `translate(${areaMargin.left},${areaMargin.top})`);

// Replace with your dataset link
const areaDatasetUrl = "https://gist.githubusercontent.com/mas5021/c556004ae018d839bd2c6795ab6d624d/raw/06a25453f364af0081807aa5ce006a8287d49c37/world_population.csv";

// Years to visualize
const years = [
  "1970 Population",
  "1980 Population",
  "1990 Population",
  "2000 Population",
  "2010 Population",
  "2015 Population",
  "2020 Population",
  "2022 Population"
];

d3.csv(areaDatasetUrl).then(rawData => {
  const continents = Array.from(new Set(rawData.map(d => d.Continent.trim())));

  // Build yearMap structure
  const yearMap = {};
  years.forEach(y => {
    const yearKey = y.replace(" Population", "");
    yearMap[yearKey] = {};
    continents.forEach(cont => {
      yearMap[yearKey][cont] = 0;
    });
  });

  rawData.forEach(d => {
    const c = d.Continent.trim();
    years.forEach(y => {
      const yearKey = y.replace(" Population", "");
      const val = +d[y];
      if (!isNaN(val)) {
        yearMap[yearKey][c] += val;
      }
    });
  });

  const finalData = [];
  Object.keys(yearMap).forEach(yearStr => {
    const rowObj = { Year: +yearStr };
    continents.forEach(cont => {
      rowObj[cont] = yearMap[yearStr][cont];
    });
    finalData.push(rowObj);
  });
  finalData.sort((a, b) => a.Year - b.Year);

  // Effective chart width/height inside margins
  const innerWidth = areaWidth - areaMargin.left - areaMargin.right;
  const innerHeight = areaHeight - areaMargin.top - areaMargin.bottom;

  // X scale from 1970 to 2022
  const x = d3.scaleLinear()
    .domain([1970, 2022])
    .range([0, innerWidth]);

  // Y scale from 0 to max sum
  const y = d3.scaleLinear()
    .domain([0, d3.max(finalData, d => d3.sum(continents, c => d[c]))])
    .range([innerHeight, 0]);

  // Stacking
  const stack = d3.stack().keys(continents);
  const stackedData = stack(finalData);

  // Area generator
  const area = d3.area()
    .x(d => x(d.data.Year))
    .y0(d => y(d[0]))
    .y1(d => y(d[1]));

  // Different color scheme
  const color = d3.scaleOrdinal()
    .domain(continents)
    .range(d3.schemeSet3);

  const tooltip = d3.select("#tooltip");
  areaSvg.selectAll("*").remove();

  // Draw stacked areas
  areaSvg.selectAll(".layer")
    .data(stackedData)
    .enter()
    .append("path")
    .attr("class", "layer")
    .attr("fill", d => color(d.key))
    .attr("opacity", 0.8)
    .attr("stroke", "#000")
    .attr("stroke-width", 1)
    .attr("d", area)
    .on("mouseover", (event, d) => {
      d3.select(event.currentTarget).transition().duration(200)
        .attr("opacity", 1);
      const totalPop = d3.sum(finalData, row => row[d.key]);
      tooltip.transition().duration(200).style("opacity", 0.9);
      tooltip.html(`
        <strong>Continent:</strong> ${d.key}<br/>
        <strong>Total (1970–2022):</strong> ${totalPop.toLocaleString()}
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
        .attr("opacity", 0.8);
      tooltip.transition().duration(200).style("opacity", 0);
    });

  // X Axis
  areaSvg.append("g")
    .attr("transform", `translate(0,${innerHeight})`)
    .call(d3.axisBottom(x).tickFormat(d3.format("d")));

  // Y Axis
  areaSvg.append("g")
    .call(d3.axisLeft(y));

  // Legend on the right (in extra margin)
  // We'll place the legend around x = innerWidth + 20
  const legendData = continents;
  const legendX = innerWidth + 20; // so it doesn't overlap
  const legendY = 10;
  const legendSpacing = 20;
  const legendRectSize = 18;
  const legendBoxWidth = 140;
  const legendBoxHeight = legendData.length * legendSpacing + 20;

  const legendGroup = areaSvg.append("g")
    .attr("class", "legend-group")
    .attr("transform", `translate(${legendX}, ${legendY})`);

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
    .attr("fill", d => color(d));

  legendItems.append("text")
    .attr("x", legendRectSize + 8)
    .attr("y", legendRectSize - 4)
    .style("font-size", "14px")
    .text(d => d);
});
