const areaWidth = 900,
      areaHeight = 550,
      areaMargin = { top: 20, right: 50, bottom: 50, left: 80 };

const areaSvg = d3.select("#area-chart")
  .append("g")
  .attr("transform", `translate(${areaMargin.left},${areaMargin.top})`);

// Replace with your dataset link
const areaDatasetUrl = "https://gist.githubusercontent.com/mas5021/c556004ae018d839bd2c6795ab6d624d/raw/06a25453f364af0081807aa5ce006a8287d49c37/world_population.csv";

// Years we want to visualize
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
  // 1) Identify unique continents
  const continents = Array.from(new Set(rawData.map(d => d.Continent.trim())));

  // 2) Create data structure for stacked area
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

  // 3) X scale from 1970 to 2022
  const x = d3.scaleLinear()
    .domain([1970, 2022])
    .range([0, areaWidth - areaMargin.left - areaMargin.right]);

  // 4) Y scale from 0 to max sum of all continents
  const y = d3.scaleLinear()
    .domain([
      0,
      d3.max(finalData, d => d3.sum(continents, c => d[c]))
    ])
    .range([areaHeight - areaMargin.top - areaMargin.bottom, 0]);

  // 5) Stack the data
  const stack = d3.stack().keys(continents);
  const stackedData = stack(finalData);

  // 6) Area generator
  const area = d3.area()
    .x(d => x(d.data.Year))
    .y0(d => y(d[0]))
    .y1(d => y(d[1]));

  // 7) Different color scheme
  const color = d3.scaleOrdinal()
    .domain(continents)
    .range(d3.schemeSet3);

  // 8) Shared tooltip
  const tooltip = d3.select("#tooltip");

  // Clear old elements
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
    // Hover
    .on("mouseover", (event, d) => {
      d3.select(event.currentTarget).transition().duration(200)
        .attr("opacity", 1);

      // Additional info: total population from 1970–2022 for this continent
      const totalPop = d3.sum(finalData, row => row[d.key]);

      tooltip.transition().duration(200).style("opacity", 0.9);
      tooltip.html(`
        <strong>Continent:</strong> ${d.key}<br/>
        <strong>Population (1970–2022):</strong> ${totalPop.toLocaleString()}
      `)
      .style("left", (event.pageX + 10) + "px")
      .style("top", (event.pageY - 28) + "px");
    })
    .on("mousemove", (event) => {
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
    .attr("transform", `translate(0, ${areaHeight - areaMargin.top - areaMargin.bottom})`)
    .call(d3.axisBottom(x).tickFormat(d3.format("d")));

  // Y Axis
  areaSvg.append("g")
    .call(d3.axisLeft(y));

  // 9) Legend bounding box
  const legendData = continents;
  const legendX = areaWidth - areaMargin.right - 200;
  const legendY = 0;
  const legendSpacing = 20;
  const legendRectSize = 18;
  const legendBoxWidth = 180;
  const legendBoxHeight = legendData.length * legendSpacing + 20;

  // Group for the legend
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
