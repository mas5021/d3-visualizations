const areaWidth = 800, areaHeight = 500, areaMargin = {top: 20, right: 30, bottom: 50, left: 60};

const areaSvg = d3.select("#area-chart")
    .append("g")
    .attr("transform", `translate(${areaMargin.left},${areaMargin.top})`);

// GitHub Gist dataset URL
const datasetUrl = "https://gist.githubusercontent.com/mas5021/c556004ae018d839bd2c6795ab6d624d/raw/026c349c96a9cdc0c9542ff31643432a119b2bbd/world_population.csv";

d3.csv(datasetUrl).then(data => {
    data.forEach(d => {
        d.Year = +d.Year;
        d.Population = +d.Population;
    });

    const x = d3.scaleLinear()
        .domain(d3.extent(data, d => d.Year))
        .range([0, areaWidth - areaMargin.left - areaMargin.right]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.Population)])
        .range([areaHeight - areaMargin.top - areaMargin.bottom, 0]);

    const area = d3.area()
        .x(d => x(d.Year))
        .y0(areaHeight - areaMargin.top - areaMargin.bottom)
        .y1(d => y(d.Population));

    areaSvg.append("path")
        .datum(data)
        .attr("fill", "steelblue")
        .attr("d", area);

    areaSvg.append("g")
        .call(d3.axisBottom(x))
        .attr("transform", `translate(0,${areaHeight - areaMargin.top - areaMargin.bottom})`);
    
    areaSvg.append("g")
        .call(d3.axisLeft(y));
});
