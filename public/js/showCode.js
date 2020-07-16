



var placeholder = d3.select("#panel").append("g").append("text").attr("class","placeholder")
              .style("font-weight", "bold")
              .style("font-size", "20px")
              .text("35zWpbanMdZeD")
              .attr('dy','0.35em');
              // .attr("x", 300)
              // .attr("y", 300);

hit_end_code = '35zWpbanMdZeD'
hit_end_code = getCookie("hit_end_code")


placeholder.text(hit_end_code)  // .append("mark").text(hit_end_code);

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}
