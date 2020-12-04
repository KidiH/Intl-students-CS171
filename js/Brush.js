/* * * * * * * * * * * * * *
*     class TotalNum      *
* * * * * * * * * * * * * */

class Brush {

    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;

        this.parseDate = d3.timeParse("%Y");

        // call method initVis
        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.margin = {top: 5, right: 50, bottom: 30, left: 80};
        vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
        vis.height = $("#" + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;

        // SVG drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        // add notes
        vis.svg.append('g')
            .attr('class', 'notes')
            .append('text')
            .text('Brush over the area to filter by years')
            .attr('transform', `translate(${vis.width / 2}, 20)`)
            .attr('fill', "grey")
            .attr('text-anchor', 'middle');

        // init scales
        vis.x = d3.scaleTime().range([0, vis.width]);
        vis.y = d3.scaleLinear().range([vis.height, 0]);

        // init x & y axis
        vis.xAxis = vis.svg.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + vis.height + ")");

        vis.yAxis = vis.svg.append("g")
            .attr("class", "axis axis--y");

        // add labels
        vis.svg.append("text")
            .attr('class', 'axisLabel')
            .attr("transform",
                "translate(" + (vis.width/2) + " ," +
                (vis.height + 50) + ")")
            .style("text-anchor", "middle")
            .text("Year");

        vis.svg.append("text")
            .attr('class', 'axisLabel')
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - vis.margin.left)
            .attr("x",0 - (vis.height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("# of Students");

        // init pathGroup
        vis.pathGroup = vis.svg.append('g').attr('class','pathGroup2');

        // init path one (average)
        vis.pathOne = vis.pathGroup
            .append('path')
            .attr("class", "pathOne");

        // init path two (single state)
        vis.pathTwo = vis.pathGroup
            .append('path')
            .attr("class", "pathTwo");

        // init path generator
        vis.area = d3.area()
            .curve(d3.curveMonotoneX)
            .x(function(d) {return vis.x(d.year); })
            .y0(vis.y(0))
            .y1(function(d) { return vis.y(d.total); });

        // init brushGroup:
        vis.brushGroup = vis.svg.append("g")
            .attr("class", "brush");

        // init brush
        vis.brush = d3.brushX()
            .extent([[0, 0], [vis.width, vis.height]])
            .on("brush end", function(event){
                let lower = vis.x.invert(event.selection[0]);
                let upper = vis.x.invert(event.selection[1])
                if (lower.getFullYear() + 5 >= upper.getFullYear()) {
                    upper.setDate(upper.getDate() + 366*5);
                }
                selectedTimeRange = [lower, upper];
                myMap.wrangleData();
            });

        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;

        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        // update domains
        vis.x.domain( d3.extent(vis.data, function(d) { return d.year }) );
        vis.y.domain( d3.extent(vis.data, function(d) { return d.total }) );

        // draw x & y axis
        vis.xAxis.transition().duration(400).call(d3.axisBottom(vis.x));
        vis.yAxis.transition().duration(400).call(d3.axisLeft(vis.y).ticks(4).tickFormat(d3.format(".0s")));

        // draw pathOne
        vis.pathOne
            .datum(vis.data)
            .transition()
            .duration(400)
            .attr("d", vis.area)
            .attr("fill", "steelblue");

        // draw pathOne
        vis.pathTwo.datum(vis.data)
            .transition().duration(400)
            .attr("d", vis.area)
            .attr('opacity', 0.8)
            .attr("fill", "steelblue")
            .attr('opacity', 0.8);

        vis.brushGroup
            .call(vis.brush);


    }

}