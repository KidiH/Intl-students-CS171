/* * * * * * * * * * * * * *
*     class Map            *
* * * * * * * * * * * * * */

class mapIncome {

    constructor(parentElement, geoData, incomeData) {
        this.parentElement = parentElement;
        this.geoData = geoData;
        this.incomeData = incomeData;

        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.margin = {top: 20, right: 0, bottom: 15, left: 10};
        vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
        vis.height = $("#" + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width)
            .attr("height", vis.height)
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        // create a projection
        vis.projection = d3.geoMercator()
            .center([0,20])                // GPS of location to zoom on
            .scale(180)                       // This is like the zoom
            .translate([ vis.width/2, vis.height/2 ]);

        // define a geo generator and pass your projection to it
        vis.path = d3.geoPath()
            .projection(vis.projection);

        // Draw the map
        vis.svg.append("g")
            .selectAll("path")
            .data(vis.geoData.features)
            .enter()
            .append("path")
            .attr('class', 'map')
            .attr("fill", "#b8b8b8")
            .attr("d", vis.path)
            .style("stroke", 'white')
            .style("opacity", .5);

        // append tooltip
        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")

        // add legend
        vis.legend = vis.svg.append("g")
            .attr('class', 'legend')
            .attr('transform', `translate(${vis.width * 1.6 / 4}, ${vis.height - 120})`)

        vis.legendX = d3.scaleLinear()
            .domain([0, 100])
            .range([0, 140])

        vis.xlegend = vis.svg.append("g")
            .attr("class", "x-axis axis")
            .attr('transform', `translate(${vis.width * 1.6 / 4}, ${vis.height - 100})`)

        vis.xAxislegend = d3.axisBottom()
            .scale(vis.legendX)
            .ticks(0)

        vis.svg.select(".x-axis")
            .call(vis.xAxislegend);

        vis.svg.append('text')
            .text('$571')
            .attr('transform', `translate(${vis.width * 1.6 / 4 - 20}, ${vis.height - 80})`)

        vis.svg.append('text')
            .text('$52,493')
            .attr('transform', `translate(${vis.width * 1.6 / 4 + 110}, ${vis.height - 80})`)

        vis.svg.append('text')
            .text('Median Household Income')
            .style('font-weight', 'bolder')
            .attr('transform', `translate(${vis.width * 1.6 / 4 - 30}, ${vis.height - 55})`)

        vis.colors = ['#9ecae1', '#6baed6', '#2171b5', '#08519c'];

        vis.legend.selectAll()
            .data(vis.colors)
            .enter()
            .append("rect")
            .attr('x', (d,i) => i*35)
            .attr('fill', d => d)
            .attr("width", 35)
            .attr('height', 20)


        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;

        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        // Add a scale for bubble size
        let valueExtent = d3.extent(vis.incomeData, function(d) { return +d.total; })
        let size = d3.scaleLinear()
            .domain(valueExtent)  // What's in the data
            .range([ 3, 36])  // Size in pixel

        let colors = d3.scaleQuantize()
            .domain(d3.extent(vis.incomeData, function(d) { return +d.medianHouseholdIncome; }))
            .range(['#9ecae1', '#6baed6', '#2171b5', '#08519c']);

        // Hover over effect
        let mouseOver = function(event, d) {
            // fade other circles and map and focus on the selected bubble
            d3.selectAll(".circles")
                .style("opacity", .3)
            d3.selectAll(".map")
                .style("opacity", .3)
            d3.select(this)
                .style("opacity", 1)
                .style("stroke", "black")

            vis.tooltip
                .style("opacity", 1)
                .style("left", event.pageX + 20 + "px")
                .style("top", event.pageY + "px")
                .html(`
                     <div>
                         <h6><b>${d.country}</b></h6>
                         <p><b>Relative # of students:</b> ${d3.format("(.4f")(d.total)}</p> 
                         <p><b>Median Household Income:</b> ${d3.format("$,")(d.medianHouseholdIncome)}</p>                     
                     </div>`);
        }

        let mouseLeave = function(event, d) {
            d3.selectAll(".circles")
                .style("opacity", .9)
            d3.selectAll(".map")
                .style("opacity", .5)
            d3.select(this)
                .style("stroke", "transparent")
            vis.tooltip
                .style("opacity", 0)
                .style("left", 0)
                .style("top", 0)
                .html(``);
        }

        // Add circles:
        let circles = vis.svg
            .selectAll("circle")
            .data(vis.incomeData);

        circles.enter()
            .append("circle")
            .merge(circles)
            .attr('class', 'circles')
            .attr("cx", function(d){ return vis.projection([d.longitude, d.latitude])[0] })
            .attr("cy", function(d){ return vis.projection([d.longitude, d.latitude])[1] })
            .attr('fill', function(d) {return colors(+d.medianHouseholdIncome)})
            .attr("r", function(d){return size(+d.total) })
            .attr("stroke", 'grey')
            .attr("stroke-width", .5)
            .attr("fill-opacity", .9)
            .on("mouseover", mouseOver )
            .on("mouseleave", mouseLeave );

        circles.exit().remove();

        // Add legend: circles
        let valuesToShow = [0.05, 0.65, 1.37]
        let xCircle = 40
        let xLabel = 110

        vis.circleLegend = vis.svg.append("g")
            .attr('class', 'circleLegend')
            .attr('transform', `translate(${vis.width / 1.55}, -80)`)

        vis.circleLegend.selectAll()
            .data(valuesToShow)
            .enter()
            .append("circle")
            .attr("cx", xCircle)
            .attr("cy", function(d){ return vis.height - size(d) } )
            .attr("r", function(d){ return size(d) })
            .style("fill", "none")
            .attr("stroke", "black")

        // Add legend: segments
        vis.circleLegend.selectAll()
            .data(valuesToShow)
            .enter()
            .append("line")
            .attr('x1', function(d){ return xCircle + size(d) } )
            .attr('x2', xLabel)
            .attr('y1', function(d){ return vis.height - size(d) } )
            .attr('y2', function(d){ return vis.height - size(d) } )
            .attr('stroke', 'black')
            .style('stroke-dasharray', ('2,2'))

        // Add legend: labels
        vis.circleLegend.selectAll()
            .data(valuesToShow)
            .enter()
            .append("text")
            .attr('x', xLabel)
            .attr('y', function(d){ return vis.height - size(d) } )
            .text( function(d){ return d } )
            .style("font-size", 15)
            .attr('alignment-baseline', 'middle')

        vis.svg.append('text')
            .text('Relative # of Intl. Students')
            .style('font-weight', 'bolder')
            .attr('transform', `translate(${vis.width / 1.65}, ${vis.height - 55})`)

        vis.findLowest();
    }

    findLowest() {
        let vis = this;

        vis.incomeData.sort(function(a, b){
                return +a.total - +b.total});

        // Lowest Number
        vis.numLow = vis.incomeData.slice(0,5);

        for (let i = 0; i < vis.numLow.length; i++) {
            document.getElementById("NumTail").innerHTML +=
                '<br><b>' + vis.numLow[i].country;

        }

    }

}





