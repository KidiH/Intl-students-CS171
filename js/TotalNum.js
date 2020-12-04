/* * * * * * * * * * * * * *
*     class TotalNum      *
* * * * * * * * * * * * * */

class TotalNum {

    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;

        this.parseDate = d3.timeParse("%Y");

        // call method initVis
        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.margin = {top: 100, right: 120, bottom: 100, left: 120};
        vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
        vis.height = $("#" + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;

        // SVG drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        // add title
        vis.svg.append('g')
            .attr('class', 'map-title')
            .append('text')
            .text('Total Number of International Students in the U.S. from 1949 - 2018')
            .attr('transform', `translate(${vis.width / 2}, -15)`)
            .attr('text-anchor', 'middle');

        // add notes
        vis.svg.append('g')
            .attr('class', 'notes')
            .append('text')
            .text('Hover over the line for more details')
            .attr('transform', `translate(${vis.width / 2}, 5)`)
            .attr('text-anchor', 'middle');

        // clip path
        vis.svg.append("defs")
            .append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("width", vis.width)
            .attr("height", vis.height);

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

        // Add a clipPath: everything out of this area won't be drawn.
        let clip = vis.svg.append("defs").append("svg:clipPath")
            .attr("id", "clip")
            .append("svg:rect")
            .attr("width", vis.width )
            .attr("height", vis.height )
            .attr("x", 0)
            .attr("y", 0);

        // init pathGroup
        vis.pathGroup = vis.svg.append('g')
                            .attr('class','pathGroup')
                            .attr("clip-path", "url(#clip)");

        // init path
        vis.path = vis.pathGroup
                    .append('path')
                    .attr("class", "path");

        vis.line = d3.line()
                    .x(function(d) {return vis.x(d.year); })
                    .y(function(d) { return vis.y(d.total); });

        // append tooltip
        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")

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
        vis.yAxis.transition().duration(400).call(d3.axisLeft(vis.y));

        vis.path
            .datum(vis.data)
            .attr('d', vis.line)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 1.5)
            .transition()
            .duration(3000)
            .ease(d3.easeLinear)
            .attrTween("stroke-dasharray", function() {
                const length = this.getTotalLength();
                return d3.interpolate(`0,${length}`, `${length},${length}`);
            });

        // highlighting circle
        let dot = vis.svg.selectAll('circle')
                    .data(vis.data);

        // Enter
        dot.enter().append("circle")
            .attr("class", "dot")
            .merge(dot)
            .attr("cx", d=> {return vis.x(d.year)})
            .attr("cy", d=> vis.y(d.total))
            .attr("r", 6)
            .attr('fill', 'steelblue')
            .attr('opacity', 0)
            .on("mouseover", function(event, d) {
                d3.select(this)
                    .attr('opacity', 1)
                vis.tooltip
                    .style("opacity", 1)
                    .style("left", event.pageX + 20 + "px")
                    .style("top", event.pageY + "px")
                    .html(`
                     <div>
                         <p> <b>${d.year.getFullYear()}</b> : ${+d.total}</p>
                     </div>`);
            })
            .on("mouseleave", function(event, d) {
                console.log('here')
                d3.select(this)
                    .attr('opacity', 0)
                vis.tooltip
                    .style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);
            });

        // Exit
        dot.exit().remove();

        // replay animation
        $(function() {
            $("#replay").on('click', function() {
                vis.path
                    .transition()
                    .duration(3000)
                    .ease(d3.easeLinear)
                    .attrTween("stroke-dasharray", function() {
                        const length = this.getTotalLength();
                        return d3.interpolate(`0,${length}`, `${length},${length}`);
                    });
            })
        })

    }

}