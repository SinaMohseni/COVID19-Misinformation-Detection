highlight_data = []


var inkColor = "red" // "#1f77b4"
var imgIndex = '';
var fill_checkbox = 1

  fill_area = d3.selectAll("input[name=fillarea]")          // Check box for cutting the tails
      .style("margin", "0px 10px 0px 10px")
      .style("padding", "0px 0px")
      .attr("position", "relative")
      .attr("checked", true)
      .on("change", function() {
                        if (this.checked) {
                          fill_checkbox = 1;
                        }else{
                          fill_checkbox = 0;
                        }
          });


var path;
var color = "lightblue";
x_old = 0;
y_old = 0;


var div1 = d3.select("body").append("talkbubble")   // Tooltip
		.attr("class", "tooltip")
		.style("opacity", 1)
		.style("position", "absolute")
		.style("text-align", "center")
		.style("width", 100)          
		.style("height", 48)
		.style("border-radius", "8px")   // "10% / 10%")
		.style("padding", 2)
		.style("font-size", 12)
		.style("background", "lightblue") // "#1e90ff")
		.style("border", 3)
		.style("pointer-events", "none");



   var output;
    d3.selection.prototype.moveToBack = function() {
        return this.each(function() {
            var firstChild = this.parentNode.firstChild;
            if (firstChild) {
                this.parentNode.insertBefore(this, firstChild);
            }
        });
    };
  
  d3.selection.prototype.moveToFront = function() {
    return this.each(function(){
      this.parentNode.appendChild(this);
    });
  };


const training_imgs = 2;  // Number of images to consider as training images. 
const main_images = 10;    // Number of main images to be annotated.
//Number of images displayed to a user for the study.
const study_length = training_imgs + main_images; 
const time_out = 2000;
let task_start_time = Math.floor(Date.now() / 1000); //set a start time for the task


var txtfiles = [];
var readfiles = [];
var imageName;
var className;
// var folder_name = "VOC/raw_images"
// var folder_name = "org_img"
var folder_name = "VOC_org"
var call_once = 0;
var total_doc = study_length;
var doc_num = 0;
var isDrawnOn = new Array(study_length);
for (let index = 0; index < isDrawnOn.length; index++) {
	isDrawnOn[index] = false;
}
resolveProgressButtons()



const mergeDedupe = (arr) => {
  return [...new Set([].concat(...arr))];
}

function txtfilename(){

	task_key_id = getCookie("task_key_id")
	dataset_key = task_key_id.split(",")[1];

	mturk_id = task_key_id.split(",")[2];
	tutorial_time = parseInt(getCookie("tutorial_time"))

	// mturk_id, dataset_key, tutorial_duration, task_duration 
	results_json.push({i: task_key_id.split(",")[2], r:task_key_id.split(",")[1], t:0, d:0,d1:tutorial_time,d2:-1})

	var folder = "./data/"+ folder_name + "/"; //  +"_exp/";
	var txtdoc = []

	// raw_imgs:       This is the list of main annotation images 
	// raw_check_imgs: This is the list of attention check images for annotation task
	raw_imgs = []

	// batch-2
	// raw_imgs = mergeDedupe([cat,dig])
	// batch-3
	// raw_imgs = mergeDedupe([bottle_class])
	// batch-4
	// raw_imgs = mergeDedupe([bic_class, plane_class, bird_class, boat_class, bus_class, car_class, chair_class, cow_class, table_class, horse_class, motor_class, person_class, plant_class, sheep_class, sofa_class, train_class, monitor_class]);
	// batch-5
	raw_imgs = mergeDedupe([bic_class, plane_class, bird_class, boat_class, bus_class, car_class, chair_class, cow_class, table_class, horse_class, motor_class, person_class, plant_class, sheep_class, sofa_class, train_class, monitor_class]);

	if (raw_imgs.length >= ((parseInt(dataset_key)+1)*main_images)  ){
		for (i=0;i<training_imgs;i++){
			txtfiles.push(raw_check_imgs[i])
		}
		for (i=0;i<main_images;i++){
			txtfiles.push(raw_imgs[i+(dataset_key*main_images)])
		}
	}else{
		alert("Not Enough Images found!")
	}

	last_time_s = Math.floor(Date.now() / 1000);
	nextImage();
}


function nextImage() {

	current_time_s = Math.floor(Date.now() / 1000)
	tot_time = current_time_s - last_time_s;
	last_time_s = current_time_s;
	
	if (doc_num == study_length) {
		
		document.getElementById("nextbutton-1").innerHTML = "Finish and Submit"
		document.getElementById("nextbutton-2").innerHTML = "Finish and Submit"
		
		// alert("You successfully finished this HIT! \n\n A long code (json file) will be printed in your new browser tab. Please copy the code it in the AMT page to submit the HIT! \n\n\n If you don't see the new tab; click on the new Completion Code button")

		WriteFile(tot_time);


	}else{
		if ((ct > 0) & (saved == 0)) save_json();

		for (var i = 0; i < txtfiles.length ; i ++){
		  	if ( $.inArray(txtfiles[i], readfiles) == -1 ){
				
				readfiles.push(txtfiles[i])
				
		  		
				showImage(txtfiles[i], 0);

				imageName = txtfiles[i].split("/").pop();
				className = txtfiles[i].split("/")[2]; // .pop().pop().pop();
				doc_num =i + 1;
				image_title();
				
				d3.selectAll('path.line').remove();
				highlight_data = []
	  			ct =0;

				break;
			}
		}
		drawPathsFromStorage(results_json)
		resolveProgressButtons()

		// for (i=1;i<11;i++){
		// 	freezRating("star-"+i)
		// }
	}
      

}



function freezRating(id){
      document.getElementById(id).disabled = true; // disabled="disabled"
      setTimeout(function(){document.getElementById(id).disabled = false;},time_out);
      // ... dim colors ...
    }



function lastImage() {
			
			if ((ct > 0) & (saved == 0)) save_json();

	  		readfiles.pop()                      //throw away the current image
	  		this_article = readfiles.pop() //get the previous image
	  		readfiles.push(this_article) //put it back

	  		showImage(this_article, 0);
	  		imageName = this_article.split("/").pop();
	  		className = txtfiles[i].split("/")[0].split("/").pop();

	  		d3.selectAll('path.line').remove();
	  		highlight_data = []
  			ct =0;

	 		doc_num -= 1;
			image_title();

			drawPathsFromStorage(results_json)
			resolveProgressButtons();
}


var words_hash = []; 
var words_array = [];
var results_json = [];


function setCookie(cname, cvalue) {
      document.cookie = cname + "=" + cvalue + ";path=/";
    }

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



function image_title(){
	  // obj = imageName.toString().split("-")[0]
	  explanation_title.text("Please select the most important area(s) that represents or explains \"").append("mark").text(className);
	  explanation_title.append("text").text("\" in this image: ( "+ doc_num+" / "+study_length+ " )");
}

function showImage(image_name, update_txt) {

  var this_img = new Image();  

  this_img.src = image_name;
  $(".img_exp").attr("xlink:href",image_name);

  this_img.onload = function(){
	//Double image size
	var img_width = this_img.width*1.5;
	var img_height = this_img.height*1.5;
	
	// scale the actual image size
	$(".img_exp").attr("width", img_width); 
	$(".img_exp").attr("height", img_height);

	//update the box size to fit image
	$(".img_box").attr("width",img_width);
	$(".img_box").attr("height",img_height);
	$(".img_box").attr("margin","0 auto");
	
	}
}



var ct = 0;
var str = "line"
var first_point;
var saved = 1;

var line = d3.line()
    .curve(d3.curveBasis);

var svg = d3.select("#img_box")
    .call(d3.drag()
        .container(function() { return this; })
        .subject(function() { var p = [d3.event.x, d3.event.y]; return [p, p]; })
        .on("start", dragstarted));

function dragstarted() {
	isDrawnOn[doc_num-1] = true;

	saved = 0;
	ct++;
	highlight_data.push([])

	xy0 = d3.mouse(this);                     
    first_point = xy0;

  var d = d3.event.subject,
      active = svg.append("path").datum(d)
      .attr("id", str.concat(ct) )
	  .attr("class","line")
      .style("stroke", inkColor)
      .style("opacity", 1)
      .style("stroke-width", 2 + "px")
      .style("stroke-linejoin", "round")
      .style("fill", function(){if (fill_checkbox == 1) return inkColor; else return "none"; })
      .style("fill-opacity",0.3),
      x0 = d3.event.x,
      y0 = d3.event.y;

  d3.event.on("drag", function() {
    var x1 = d3.event.x,
        y1 = d3.event.y,
        dx = x1 - x0,
        dy = y1 - y0;

    if (dx * dx + dy * dy > 20){
		d.push([x0 = x1, y0 = y1]);
        highlight_data[ct-1].push([x1.toFixed(2),y1.toFixed(2)]);
    } 
    else d[d.length - 1] = [x1, y1];
    active.attr("d", line);
  });

	d3.event.on("end", function(){
		d.push(first_point);
        highlight_data[ct-1].push([first_point[0].toFixed(2),first_point[1].toFixed(2)]);
        active.attr("d", line);
		resolveProgressButtons();
	});

}

function drawPathsFromStorage(memEntries){
	console.log('---draw! ')
	for (var idx = 0; idx < memEntries.length; idx++){
		if(memEntries[idx].i == imageName){

			drawPath(memEntries[idx].p);
		}
	}
}

function drawPath(points){

	var lineGenerator = d3.line().curve(d3.curveBasis);
	points.push(points[0]) // append the first point to the end so it closes the mask

	var pathData = lineGenerator(points);

	var d = d3.select("#img_box")
	  .append("path")
	  .attr('d', pathData)
	  .attr("class","line")
	  .style("stroke", inkColor)
      .style("opacity", 1)
      .style("stroke-width", 2 + "px")
      .style("stroke-linejoin", "round")
      .style("fill", function(){if (fill_checkbox == 1) return inkColor; else return "none"; })
      .style("fill-opacity",0.3);
}
    
// d3.select('#undo').on('click', function(){
//   ct--;
//   d3.select('path#'+str.concat(ct)).remove();
// });

d3.select('#clear1').on('click', function(){

	  d3.selectAll('path.line').remove();
	  console.log('highlight_data', highlight_data)
	  if (highlight_data.length > 0){
	  	 highlight_data.pop();
	  	 ct -=1;
		 for (idx=0; idx < highlight_data.length; idx++){
		 	drawPath(highlight_data[idx])
		 }
		 drawPathsFromStorage(results_json)
	  } else{
		  isDrawnOn[doc_num-1]= false;
	  	  resolveProgressButtons(); 
		  // probably user is in the "previous image" and there is no new path in "highlight_data"
		  // Loop through all the data and remove any paths saved for this image
		  for(idx = 0; idx < results_json.length;idx++){
				if(results_json[idx].i == imageName){
					results_json.splice(idx,1);
					idx--;   //Once the element is removed, stay on this index to make sure you don't miss one since array is now shorter by one,
				}
		  }
	  }

});

d3.select('#clear2').on('click', function(){
  d3.selectAll('path.line').remove();
  console.log('highlight_data', highlight_data)
  if (highlight_data.length > 0){
  	 highlight_data.pop();
  	 ct -=1;
	 for (idx=0; idx < highlight_data.length; idx++){
	 	drawPath(highlight_data[idx])
	 }
	 drawPathsFromStorage(results_json)
  } else{
	  isDrawnOn[doc_num-1]= false;
  	  resolveProgressButtons(); 
	  // probably user is in the "previous image" and there is no new path in "highlight_data"
	  // Loop through all the data and remove any paths saved for this image
	  for(idx = 0; idx < results_json.length;idx++){
			if(results_json[idx].i == imageName){
				results_json.splice(idx,1);
				idx--;   //Once the element is removed, stay on this index to make sure you don't miss one since array is now shorter by one,
			}
	  }
  }
});
    
function resolveProgressButtons(){
	if(!isDrawnOn[doc_num-1]){
		document.getElementById("nextbutton-1").disabled = true;
		document.getElementById("nextbutton-2").disabled = true;
	} else {
		document.getElementById("nextbutton-1").disabled = false;
		document.getElementById("nextbutton-2").disabled = false;
	}

	//if first image, don't let them go backward.
	if(doc_num == 1){
		document.getElementById("backbutton-1").disabled = true;
		document.getElementById("backbutton-2").disabled = true;
	} else{
		document.getElementById("backbutton-1").disabled = false;
		document.getElementById("backbutton-2").disabled = false;
	}
}

var colorScale = d3.schemeCategory10; 
    colorAr = [0,1];

d3.select('#palette')
    .select('g')
  .selectAll('rect')
    .data(colorAr)
  .enter().append('rect')
    .attr('width', 10)
    .attr('height',10)
    .attr('x', function(d,i){
      return 22 * i;
    })
    .attr('fill', function(d){
      return colorScale(d);
    })
    .style('cursor','pointer')
    .on('click',function(d){
      changeColor(colorScale(d));
    });

  function changeColor(c){
    color = c.value;
    inkColor = color
  }





$(document).ready(function() {
	resolveProgressButtons()
});


function save_json(){  

	// if (imageName != null) this_image = imageName.split(".")[0].split("-")[1]
	if (imageName != null){
		this_image = imageName.split(".")[0];
		// this_image = imageName.split(".")[0];
	}
	for (var i=0;i<highlight_data.length;i++){
		results_json.push({i: imageName, class: className,p: highlight_data[i]})
	}
	saved = 1;
	console.log('results_json', results_json)
}


function WriteFile(tot_time){
    
	save_json(tot_time);

	//calculate task end time in seconds
	let task_end_time = Math.floor(Date.now() / 1000);
	let task_total_time = task_end_time - task_start_time;
	results_json[0].d2 = task_total_time;     //update the end time in the json before writing to file.

	HIT_id = 'img_an_'+generateUID();
	setCookie('hit_end_code', HIT_id)
		
	axios.post('/logAnnotation/', {
        hit_id: HIT_id, 
        log: {
            mturk_id: results_json[0].i,
            results: results_json
        }
        }
    )
    .then(function(response) {
	  if (response.data == 'logged_successfully'){
	  	location.href='/finish';
	  }else{
	  	alert("Please hit the 'Finish and Submit' button again!")		  	
	  }

	})
	.catch(function(error) {
	  alert("Please hit the 'Finish and Submit' button again!")
	});
}


function WriteFile_old(){

	if (saved == 0) save_json();

	//calculate task end time in seconds
	let task_end_time = Math.floor(Date.now() / 1000);
	let task_total_time = task_end_time - task_start_time;
	results_json[0].d2 = task_total_time; //update the end time in the json before writing to file.

	// var jsonContent = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(results_json));
	
		$.ajax({
	  type : "POST",
	  url : "json.php",
	  data : {
		  json : JSON.stringify(results_json)
	  }
	});
	location.href='./finish.html';
  
	// var a = document.createElement('a');
	// a.href = 'data:' + jsonContent;
	// a.download = 'results.json';
	// a.innerHTML = 'End Study';
	// a.click();

	// var winPrint = window.open("about:blank", "_blank")//'', '', 'left=0,top=0,width=800,height=600,toolbar=0,scrollbars=0,status=0',"_blank"); 
	// winPrint.document.write(JSON.stringify(results_json)); 
	// winPrint.document.close(); 
}


function getWidthOfText(txt, fontname, fontsize){
    if(getWidthOfText.c === undefined){
        getWidthOfText.c=document.createElement('canvas');
        getWidthOfText.ctx=getWidthOfText.c.getContext('2d');
    }
    getWidthOfText.ctx.font = fontsize + ' ' + fontname;
    return getWidthOfText.ctx.measureText(txt).width;
}

function tooltip(d){
	
	div1.style("background", function(){
			if (d.class == "med"){
				return "#1FC3B7"  // 00b390
			}else{
				return "#cff1c9"
			}
		})
		.transition()
		.duration(200)
		.style("opacity", 0.9)

		
	
	// if (d.class == "symp"){
	// 	classType = "Symptom feature"  
	// }else{
	// 	classType = "Medication feature"
	// }

	// featureType = d.type.toUpperCase().toString() + " type: ''" +  feature_table[d.feature] + "''" // "Feature type: " + d.type.toUpperCase();
	
	arr =  ["a" , "b ", "c"]  //[classType,featureType , "Contribution: "+ d.weight];  // feature_table[d.feature]
	 
	str = "          " +"&nbsp" + "<br/>" // + "Rules: " +  "          " +"&nbsp" + "<br/>""
	for (var j = 0 ; j < arr.length ; j++ ){
		
		str = str + "          " +"&nbsp" + arr[j] + "          " +"&nbsp" + "<br/>" + "          " +"&nbsp" 

	}

	div1.html(str)	
	
	if (d3.event.pageY < 200){
	div1.style("left", (d3.event.pageX - 120) + "px")
		.style("top", ((d3.event.pageY + 128 + (arr.length*20)) + "px"));
	}else{
	div1.style("left", (d3.event.pageX - 120) + "px")
		.style("top", ( d3.event.pageY - 128 - (arr.length*20) ) + "px");
	}

}

var colors = d3.scaleOrdinal(d3.schemeCategory10); 

var w_size = window,
    d_size = document,
    e_size = d_size.documentElement,
    g_size = d_size.getElementsByTagName('body')[0];
	
	d3.select(window).on('resize.updatesvg', updateWindow);
		var width = w_size.innerWidth || e_size.clientWidth || g_size.clientWidth;  
		var height = w_size.innerHeight || e_size.clientHeight || g_size.clientHeight; //

    margin = {top: 20, right: 50, bottom: 20, left: 50};

	var list_x = 50
	var list_y = 100
	var	list_width = 230
	var	list_height = 600
	var clearance = 50
	var explanation_x = 100
	var explanation_y = 60
	var explanation_height = 300
	var explanation_width = 580
	var frame_height = height - 100
	var result_height = 100


	// var highlighter = d3.select("#img_box")
	// 						.append('rect')
	// 					    .attr('x', 0)
	// 					    .attr('y', 0)
	// 					    .attr('width', 224)
	// 					    .attr('height', 224)
	// 					    .style('fill', 'white')
	// 					    .call(draw)   // Line highlighter


	var explanation_title = d3.select("#panel").append("g").append("text").attr("class","explanation_title")
			  .style("font-weight", "bold")
			  .style("font-size", "15px")
			  .text("Please highlight any words related to \""+folder_name.toString()+"\" topic in this Article:")
			  .attr('dy','0.35em')
			  .attr("x", explanation_x)
			  .attr("y", explanation_y);

	// var explanation_frame = svg.append("g").append("rect").attr("class","explanation_frame")
	// 				.attr("x", explanation_x)
	// 				.attr("y", explanation_y)
	// 				.attr("rx", 5)
	// 				.attr("ry", 5)
	// 				.attr("width", explanation_width)
	// 				.attr("height", explanation_height)
	// 				.attr("fill", "white")
	// 				.style("fill-opacity",0.8)
	// 				.style("stroke","gray")
	// 				.style("stroke-opacity",0.5);

// start_over();
txtfilename();
// updateWindow();

function updateWindow(){
							 
		chart_x = w_size.innerWidth || e_size.clientWidth || g_size.clientWidth; 
		chart_y = w_size.innerHeight || e_size.clientHeight || g_size.clientHeight; 
		
		
		width = chart_x * 0.8;

		explanation_width = width * 0.8;
		explanation_x = width * 0.09;
	
		// svg.attr("width", width);
		// svg.attr("height", height).attr("x", explanation_x);

		// explanation_frame.attr("width", explanation_width)
		// 				.attr("x", explanation_x)
		// 				.attr("y", explanation_y);

		// explanation_title.attr("x", explanation_x)
		// 				.attr("y", explanation_y - 20);
		
		// svg.selectAll(".explanation_frame").attr("height", height); //(3*next_line + line_counter * next_line));
		// svg.attr("height", height + 100); //y_pos
		// showText(1);
	}
	
function generateUID() {
    // I generate the UID from two parts here 
    // to ensure the random number provide enough bits.
    var firstPart = (Math.random() * 46656) | 0;
    var secondPart = (Math.random() * 46656) | 0;
    firstPart = ("000" + firstPart.toString(36)).slice(-3);
    secondPart = ("000" + secondPart.toString(36)).slice(-3);
    return firstPart + secondPart;
}