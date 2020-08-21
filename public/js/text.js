
demo_mode = true;     // only for tool demo
// Fn_word_highlighting     control opacity of heatmap  

False_Color = "salmon";
True_Color = "lightgreen";
highlight_labels = false;
labels_no = 3
labels_color = ['white', 'yellow','orange','lightseagreen']
label_name = ['not-labeled', 'class_1','class_2','class_3' ]
// more colors here: https://bl.ocks.org/enjalot/7c0fe907ba2010fed420


neutral_score = 0.05; 
function Fn_word_highlighting(score){
	return (0.1 + 2*Math.abs(score));
}

function gauge_score(predictionScore){
	return (predictionScore) * 3000
}


var div = d3.select("body").append("div")	
    .attr("class", "tooltip")
    .style("opacity", 0);


   var output;
   // var height = 500;
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



//  https://bernii.github.io/gauge.js/
var opts = {
  angle: 0.08, // The span of the gauge arc
  lineWidth: 0.35, // The line thickness
  radiusScale: 1, // Relative radius
  pointer: {
    length: 0.6, // // Relative to gauge radius
    strokeWidth: 0.035, // The thickness
    color: '#000000' // Fill color
  },
  limitMax: false,     // If false, max value increases automatically if value > maxValue
  limitMin: false,     // If true, the min value of the gauge will be fixed
  colorStart: '#00b33c',   // Colors
  colorStop: '#ff4d4d',    // just experiment with them
  strokeColor: '#E0E0E0',  // to see which ones work best for you
  percentColors: [[0.0, "#00b33c" ], [0.50, "#cccc00"], [1.0, "#ff4d4d"]],
  generateGradient: true,
  highDpiSupport: true,     // High resolution support
    // renderTicks is Optional
  renderTicks: {
    divisions: 2,
    divWidth: 1.3,
    divLength: 0.65,
    divColor: '#333333',
    subDivisions: 4,
    subLength: 0.29,
    subWidth: 1,
    subColor: '#666666'
  }
  
};
var target = document.getElementById('the_gauge'); // your canvas element
gauge = new Gauge(target).setOptions(opts); 


gauge.maxValue = 3000; // set max gauge value
gauge.setMinValue(0);  // Prefer setter over gauge.minValue = 0
gauge.animationSpeed = 10; // set animation speed (32 is default value)
// gauge.set(Math.random()*3000); // set actual value


var txtfiles = []
var textFileContents = []
var readfiles = []
var articleTitles = [];
var fileName;
let cntrl


// 'http://www.puzzlers.org/pub/wordlists/pocket.txt'
function getText(txt_adrs){
    // read text from URL location
    var request = new XMLHttpRequest();
    var this_txt;
    request.open('GET', txt_adrs, true);
    request.send(null);
    request.onreadystatechange = function () {
        if (request.readyState === 4 && request.status === 200) {
            var type = request.getResponseHeader('Content-Type');
            if (type.indexOf("text") !== 1) {
            	this_txt = request.responseText.replace(/´/g, "'"); //.replace("´","'")
            	textFileContents.push(this_txt)
            	if (textFileContents.length == main_docs+training_docs) start_page();
            	// console.log(request.responseText)
                return request.responseText;
            }
        }
    }
}


// For demo 
function readjsonfile(){
	 // category = [categories_txt[0]];  // ,categories_txt[1]
	textFileContents = all_tweets;
	for (var i =0; i<all_tweets.length; i++){
		
		// tweet label: true? or false? 
		if (all_tweets[i].label == 0) articleTitles.push(["False Information", all_tweets[i].prediction_score,all_tweets[i].label])
		else articleTitles.push(["True Information", all_tweets[i].prediction_score,all_tweets[i].label])

		// tweet id: first three words
		txtfiles.push(all_tweets[i].tweet[0][0] +"-"+ all_tweets[i].tweet[1][0] +"-"+ all_tweets[i].tweet[2][0])
		
	}

	start_page();


}


function start_page(){

	// cntrl = new Pages(textFileContents)  // old text docs
	cntrl = new Pages(all_tweets)  // new json tweets
	article_title();
	showText(results_json[cntrl.i]);
	showArticle(results_json[cntrl.i]);
	updateWindow();
	if (demo_mode) resolveProgressButtonsDemo();
	else resolveProgressButtonsStudy();
	console.log('Starting the task')

}


function showOne(){
	

		cntrl.i++;
		showArticle(results_json[cntrl.i]);

}


function showTwo(){
		cntrl.i++;
		showArticle(results_json[cntrl.i]);
}


function showThree(){
		cntrl.i++;
		showArticle(results_json[cntrl.i]);
}


function start_over(){

    if (confirm("Are you sure you want to start over?") == true) {
	    results_json  = []
		exp_data = []
		txtfiles = []
		saved = 1;
		readfiles = []
		// txtfilename();
		jsonfile();
		location.href="../expevl.html"
	}
}






function WriteFile(tot_time){
	   
	let toSave = [];     //final output array to be built now and saved
        
	let task_key_id = getCookie("task_key_id") //get user data from cookie storage.
	let tutorial_time = parseInt(getCookie("tutorial_time")) //get the lenght of Time they spent in the totorial from the cookies
	let dataset_key = task_key_id.split(",")[1]; //separate out the dataset key so we know what they observed
	let mturk_id = task_key_id.split(",")[2];   //separate their MTurk ID so we know who they are.
	
	//Calculate the Total Time the Task took to complete
	let task_end_time = Math.floor(Date.now() / 1000);
	let task_total_time = task_end_time - cntrl.progress_start_time;

	//first entry contrins all this information
	toSave.push({i: mturk_id, r:dataset_key, t:2, d:0,d1:tutorial_time,d2:task_total_time});

	for (let index = 0; index < cntrl.total; index++) {
		results_json[index].pageTime = cntrl.timeOnPage[index];
		// console.log(results_json[index])
		// toSave.push(this.userData[index]);
	}
	
	//push the remainder of the user data to this file.
	toSave.push(results_json);

	HIT_id = 'txt_an_'+generateUID();
	setCookie('hit_end_code', HIT_id)
		
	axios.post('/logAnnotation/', {
        hit_id: HIT_id, 
        log: {
            mturk_id: mturk_id, // results_json[0].i,
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


function nextArticle() {

	//todo decide if we need the saved variable or can just overwrite the json on every page turn
	if (saved == 0) save_json();
	exp_data = [];	// 		});
	word_idx = [];
	cntrl.i++;
	if(cntrl.i == cntrl.total){
		cntrl.i--;
		WriteFile();
	} else{
		//	 just for demo
		gauge.set(Math.random()*3000); // set actual value
		showText(results_json[cntrl.i]);
		//todo getHighlightsFromMem();
		article_title();
		if (demo_mode) resolveProgressButtonsDemo();
		else resolveProgressButtonsStudy();
	}

}

function lastArticle() {
			//todo decide if we need the saved variable or can just overwrite thejson on every page turn
			if (saved == 0) save_json();
			exp_data = [];
			word_idx = [];

			cntrl.i--;
			showText(results_json[cntrl.i]);
			//todo getHighlightsFromMem();
			article_title();
			if (demo_mode) resolveProgressButtonsDemo();
			else resolveProgressButtonsStudy();
}

var words_hash = []; 
var words_array = [];
var results_json = [];
var exp_data = []
var word_idx =[];
var saved = 1;

function save_json(){//shouldOverwrite){  
	// console.log(txtfiles[1])
	// console.log(word_idx)
	let wordsTuple = [];
	for (let index = 0; index < exp_data.length; index++) {
		wordsTuple.push([word_idx[index],exp_data[index]]);	
	}
	let updatedObj = {i: txtfiles[cntrl.i], p: wordsTuple}
	// console.log(updatedObj)
	let current_time_s = Math.floor(Date.now() / 1000);
        let tot_time = current_time_s - cntrl.last_time_s;
        cntrl.last_time_s = current_time_s;
        // console.log("time on page: ", tot_time, "(s), currently stored:", updatedObj["secSinceLast"]);
        updatedObj["secSinceLast"]=tot_time;
        cntrl.timeOnPage[cntrl.i] += tot_time;
		// if(shouldOverwrite){ //overwrite the data
		results_json.splice(cntrl.i,1,updatedObj);

	saved = 1;
}



function WriteFile_old(){

	// if (saved == 0) save_json()

	// var jsonContent = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(results_json));
	// var a = document.createElement('a');
	// a.href = 'data:' + jsonContent;
	// a.download = 'results.json';
	// a.innerHTML = 'End Study';
	// a.click();
	let toSave = []; //final output array to be built now and saved
        
	
	let tutorial_time = parseInt(getCookie("tutorial_time")) //get the lenght of Time they spent in the totorial from the cookies
	let mturk_id = task_key_id.split(",")[2]; //separate their MTurk ID so we know who they are.
	
	//Calculate the Total Time the Task took to complete
	let task_end_time = Math.floor(Date.now() / 1000);
	let task_total_time = task_end_time - cntrl.progress_start_time;

	//first entry contrins all this information
	toSave.push({i: mturk_id, r:dataset_key, t:2, d:0,d1:tutorial_time,d2:task_total_time});

	for (let index = 0; index < cntrl.total; index++) {
		results_json[index].pageTime = cntrl.timeOnPage[index];
		// console.log(results_json[index])
		// toSave.push(this.userData[index]);
	}
	
	//push the remainder of the user data to this file.
	toSave.push(results_json);
	//now Save the file as json to the server with a POST request.
	$.ajax({
		type : "POST",
		url : "./json.php",
		data : {
			json : JSON.stringify(toSave)
		}
		});
		//Call the Callback function final page after being written.
		window.location.replace('./finish.html');
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


function article_title(){

	articleName = articleTitles[cntrl.i][0];
	predictionScore = articleTitles[cntrl.i][1];
	the_prediction = articleTitles[cntrl.i][2];
	
	if (demo_mode) {
		// Demo 
		$("#explaination_title").text("Please review the following Tweet: ( "+ (cntrl.i+1)+" / "+cntrl.total+ " )")
	
	}else{
		// Evaluation User Study 
		$("#explaination_title").text("Please highlight any words related to \""+articleName+"\" news in this Tweet: ( "+ (cntrl.i+1)+" / "+cntrl.total+ " )")
	
		var src_str = $("#explaination_title").html();
		var term = articleName; 
		term = term.replace(/(\s+)/,"(<[^>]+>)*$1(<[^>]+>)*");
		var pattern = new RegExp("("+term+")", "gi");
	
		if (articleName == "True Information"){
			src_str = src_str.replace(pattern, "<mark_pos>$1</mark_pos>");
			src_str = src_str.replace(/(<mark_pos>[^<>]*)((<[^>]+>)+)([^<>]*<\/mark_pos>)/,"$1</mark_pos>$2<mark_pos>$4");
		}else{
			src_str = src_str.replace(pattern, "<mark_neg>$1</mark_neg>");
			src_str = src_str.replace(/(<mark_neg>[^<>]*)((<[^>]+>)+)([^<>]*<\/mark_neg>)/,"$1</mark_neg>$2<mark_neg>$4");	
		}
		
		$("#explaination_title").html(src_str);
	}

	// update the gauge 
	console.log("Prediction Score: ", predictionScore)
	gauge.set(gauge_score(predictionScore));  // set actual value
	document.getElementById('gauge_note').innerHTML = "Truth Meter: " + Math.round(predictionScore*100) + "% False";
	
	if (the_prediction == 0){
		document.getElementById('gauge_top_note').innerHTML = "Misinformation!";
	}else{
		document.getElementById('gauge_top_note').innerHTML = "It's True!";
	}
}


function showText(highlightsFromMem) {
	
	var myElement = document.createElement('chartDiv');
	myElement.style.userSelect = 'none';
	
	d3.dragDisable(window)

	for (var i = 0; i < 500; i++) {
	    svg.selectAll(".explanation-"+i.toString()).remove(); 
	    svg.selectAll(".boxes-"+i.toString()).remove(); 
    }
	svg.selectAll(".words").remove(); 
    // var output = document.getElementById("TextArea").value;
    // var output = sample_txt;
	
	words_hash = []; 
	words_array = [];

	// new json tweet
	the_tweet = all_tweets[cntrl.i].tweet;
	
	if(highlightsFromMem == undefined || highlightsFromMem.p == undefined){ //new article. has not been seen yet
		
			words_hash.push({word : "nextline",
							idx: i,
							highlight: 0,
							score: 0,
							x : 0,
							y : 0,
							w : 0})

		for (var i = 0; i < the_tweet.length; i++){

			// TODO: add a nextline to break the tweet into two line

			words_hash.push({word : the_tweet[i][0],
							idx: i,
							highlight: 0,
							score: the_tweet[i][1],
							x : 0,
							y : 0,
							w : 0})
		}
	} else {
		wordsTuple = highlightsFromMem.p;
		// console.log("words in memory:", wordsTuple)
		for (let index = 0; index < wordsTuple.length; index++) {
			word_idx.push(wordsTuple[index][0]);
			exp_data.push(wordsTuple[index][1]);	
		}

			words_hash.push({word : "nextline",
							idx: i,
							highlight: 0,
							score: 0,
							x : 0,
							y : 0,
							w : 0})

		for (let i = 0; i < the_tweet.length; i++) {
			words_hash.push({word : the_tweet[i][0],
				idx: i,
				highlight: checkInx(i),
				score: the_tweet[i][1],
				x : 0,
				y : 0,
				w : 0})
				// console.log(words_hash)
		}

		words_hash.push({word : "lastline",
							idx: i,
							highlight: 0,
							score: 0,
							x : 0,
							y : 0,
							w : 0})
		

		function checkInx(i){
			if (word_idx.includes(i)){ return 1} else{ return 0}
		}

	}


	var letter_length = getWidthOfText(" ", "sans-serif", "16px"); 
	var box_height = 20;
	var x_pos = explanation_x; //  + clearance;
	var y_pos = explanation_y;  // + box_height + clearance/3;
	var next_line = 25;
	var line_counter = 0;
	var box_words_alignment = 11;
	var exp_margin = 40;

	words_box = svg.selectAll(".boxes")
						.data(words_hash).enter().append("g").attr("class", "words");		

	words_box.append("rect")
		.attr("class",function(d,i){return "boxes-"+i.toString()})
		.each(function (d,i) {
			letters = d.word.split("")

			// Go to next line 
			if (d.word == "nextline") {
				line_counter += 1;
				x_pos = explanation_x + clearance;
				y_pos = explanation_y + box_height + line_counter*next_line;
				d.x = x_pos;
				d.y = y_pos;
				d.w = getWidthOfText("", "sans-serif", "16px")
				x_pos = x_pos + d.w + letter_length;

			// Go to next line 
			}else if ((x_pos + (letters.length * letter_length)) > (explanation_x + explanation_width - exp_margin)){
				line_counter += 1;
				x_pos = explanation_x + 2*clearance/3;
				y_pos = explanation_y + box_height + line_counter*next_line;

				d.x = x_pos;
				d.y = y_pos;
				d.w = getWidthOfText(d.word, "sans-serif", "16px")
				x_pos = x_pos + d.w + letter_length;
			}else if (d.word == "lastline") {
				
				line_counter += 1;
				x_pos = explanation_x + clearance;
				y_pos = explanation_y + box_height + line_counter*next_line;
				d.x = x_pos;
				d.y = y_pos;
				d.w = getWidthOfText("", "sans-serif", "16px")
				x_pos = x_pos + d.w + letter_length;
			// Continue in the same line 
			}else{

				d.x = x_pos;
				d.y = y_pos;
				d.w = getWidthOfText(d.word, "sans-serif", "16px")
				x_pos = x_pos + d.w + letter_length;
			}

		})
		.attr("x", function(d,i){
			return d.x;})  
		.attr("y", function(d,i){
			return d.y - box_words_alignment;})  // + d.count*clearance + clearance })
		.attr("width", function(d){
			return d.w;})
		.attr("height", box_height)
		.attr("fill", function(d,i){ 
       		// if (d.highlight == 1) return "yellow"; 
       		if ((d.highlight > 0) & (highlight_labels==true)) {
       		  return labels_color[d.highlight]; 	
       	    } else if (d.score > neutral_score) {
       			return False_Color;
       		}else if (d.score < -1*neutral_score) {
       			return True_Color;
       		}else{
       			return "white";
       		}
			// return "white";
		})
		.attr("stroke", function(d,i){ 
       		if ((d.highlight > 0) &(highlight_labels == false)) return labels_color[d.highlight]; 
       		else{
       			return "white";
       		}
		})
		.attr("opacity", function(d,i) { 
			if (d.highlight > 0){
				return 1;	
			}
			else{
       			return Fn_word_highlighting(d.score); ;
			}
		});
   


	var dragall = 0;
	var last_sample = 0;
	
	svg.on("mouseup", function(d){ dragall = 0})

	words_box.append("text")
		.attr("class","explanation")
		.attr("class",function(d,i){return "explanation-"+ i.toString()})
		.style("font-size", "16px")
	    .attr("x", function(d,i){
					return d.x})  
	    .attr("y", function(d,i){
					return d.y;})  // + d.count*clearance + clearance })
	    .attr("dy", ".35em")
	    .text(function(d) {
	    	if (d.word == "nextline") {
	    	return "";	
	    	}else{
	    	return d.word; 	
	    	}
	    	
	    })
	    .on("mouseover", function(d){
			var this_sample = d3.select(this).attr('class').split("-")[1]
			if (d.highlight == 0){
				if (highlight_labels) {
				  svg.selectAll(".boxes-" + this_sample.toString())
					.attr("fill","yellow")
					.attr("opacity", 0.3);

				}else{
					svg.selectAll(".boxes-" + this_sample.toString())
						.attr("stroke",labels_color[1])
						.attr("stroke-width",3)
						.attr("opacity", 1);
				}

			}else{

			 div.transition()		
                .duration(100)		
                .style("opacity", .9);	
                	
          	  div.html(label_name[d.highlight])  // formatTime(d.date) + "<br/>"  + d.close	
                .style("left", (d3.event.pageX) + "px")		
                .style("top", (d3.event.pageY - 48) + "px");

			}
			svg.selectAll(".boxes-" + this_sample.toString()).moveToBack();
			
		}).style('cursor','pointer')
		.on("mousemove", function(d){
			var this_sample = d3.select(this).attr('class').split("-")[1]
			if ((dragall == 1) & (this_sample != last_sample)){							

				// if (d.highlight > 0){

		            if (d.highlight == labels_no){
						

						// --------------- Erase ---------------------
						if (highlight_labels==true) {
						svg.selectAll(".boxes-" + this_sample.toString())
						   		    .attr("opacity", 0);
						}else{
							svg.selectAll(".boxes-" + this_sample.toString())
						   		    .attr("stroke-width", 0);
						}	
							d.highlight = 0;
							// dragall = 0;
							
							index = exp_data.indexOf(d.word);
							if (index > -1) {
								exp_data.splice(index, 1);
							}
							index = word_idx.indexOf(d.idx);
							// console.log(d,index)
							if(index > -1 ){
								word_idx.splice(index, 1);
							}
							if(word_idx.length == 0){
								cntrl.unsaw();
							}
							saved = 0

		            }else{
		            	d.highlight += 1;	
		            	if (highlight_labels==true) {
       		  				svg.selectAll(".boxes-" + this_sample.toString())
								.attr("fill",labels_color[d.highlight])
								.attr("opacity", 1);
								cntrl.saw();
								word_idx.push(d.idx)
								exp_data.push(d.word)
								saved = 0
	       		  		}else{
							svg.selectAll(".boxes-" + this_sample.toString())
								.attr("stroke",labels_color[d.highlight])
								.attr("stroke-width", 3)
								.attr("opacity", 1);
								cntrl.saw();
								word_idx.push(d.idx)
								exp_data.push(d.word)
								saved = 0
	       		  		}
		            }
		            

				 window.getSelection().removeAllRanges();
				 last_sample = this_sample;
			}
		})
		.on("mousedown", function(d){ 
			dragall = 1;
			var this_sample = d3.select(this).attr('class').split("-")[1]
			last_sample = this_sample;

				if (d.highlight == labels_no){
		
					svg.selectAll(".boxes-" + this_sample.toString())
						.attr("opacity", 0);
					d.highlight = 0;
					// dragall = 0;
					
					index = exp_data.indexOf(d.word);
					if (index > -1) {
						exp_data.splice(index, 1);
					}
					index = word_idx.indexOf(d.idx);
					// console.log(d,index)
					if(index > -1 ){
						word_idx.splice(index, 1);
					}
					if(word_idx.length == 0){
						cntrl.unsaw();
					}
					saved = 0
		
				}else{
					d.highlight += 1;
					if (highlight_labels==true) {
						svg.selectAll(".boxes-" + this_sample.toString())
							.attr("fill",labels_color[d.highlight])
							.attr("opacity", 1);
					}else{
						svg.selectAll(".boxes-" + this_sample.toString())
							.attr("stroke",labels_color[d.highlight])
							.attr("stroke-width", 3)
							.attr("opacity", 1);
					}
						cntrl.saw();
						word_idx.push(d.idx)
						exp_data.push(d.word)
						saved = 0
				}
					window.getSelection().removeAllRanges();//updateHighlights(this,d)

			
		})
		.on("mouseup", function(d){ dragall = 0})
		.on("mouseout", function(d){
			var this_sample = d3.select(this).attr('class').split("-")[1]
			if (d.highlight > 0){
				svg.selectAll(".boxes-" + this_sample.toString())
			}else{
				// svg.selectAll(".boxes-" + this_sample.toString()).attr("opacity", 0);
				svg.selectAll(".boxes-" + this_sample.toString()).attr("opacity", Fn_word_highlighting(d.score));
				svg.selectAll(".boxes-" + this_sample.toString()).attr("stroke-width", 0);

				
				if (d.score > neutral_score) {
					svg.selectAll(".boxes-" + this_sample.toString()).attr("fill", False_Color);				
	       		}else if (d.score < -1*neutral_score) {
	       			svg.selectAll(".boxes-" + this_sample.toString()).attr("fill", True_Color);		
	       		}else{
	       			svg.selectAll(".boxes-" + this_sample.toString()).attr("fill", "white");
	       		}
			}
			div.transition()		
                .duration(500)		
                .style("opacity", 0);	
		});

	// Here we set the bottom margin for text box
	if (line_counter < 4) {
		
		height = 7*next_line;  // explanation_y + explanation_y + box_height 
		svg.selectAll(".explanation_frame").attr("height", height); 
		svg.attr("height", height+ 20); 

	}else{
		height = y_pos + next_line; 
		svg.selectAll(".explanation_frame").attr("height", height); 
		svg.attr("height", height + 20); 
	}
}



function showArticle(highlightsFromMem) {
	
	var myElement = document.createElement('chartDiv');
	myElement.style.userSelect = 'none';
	
	d3.dragDisable(window)

	for (var i = 0; i < 500; i++) {
	    svg_article.selectAll(".explanation-"+i.toString()).remove(); 
	    svg_article.selectAll(".boxes-"+i.toString()).remove(); 
    }
	svg_article.selectAll(".words").remove(); 
    // var output = document.getElementById("TextArea").value;
    // var output = sample_txt;
	
	words_hash = []; 
	words_array = [];

	// new json tweet
	the_tweet = all_tweets[cntrl.i].tweet;
	
	if(highlightsFromMem == undefined || highlightsFromMem.p == undefined){ //new article. has not been seen yet
		
			words_hash.push({word : "nextline",
							idx: i,
							highlight: 0,
							score: 0,
							x : 0,
							y : 0,
							w : 0})

		for (var i = 0; i < the_tweet.length; i++){

			// TODO: add a nextline to break the tweet into two line

			words_hash.push({word : the_tweet[i][0],
							idx: i,
							highlight: 0,
							score: the_tweet[i][1],
							x : 0,
							y : 0,
							w : 0})
		}
	} else {
		wordsTuple = highlightsFromMem.p;
		// console.log("words in memory:", wordsTuple)
		for (let index = 0; index < wordsTuple.length; index++) {
			word_idx.push(wordsTuple[index][0]);
			exp_data.push(wordsTuple[index][1]);	
		}

			words_hash.push({word : "nextline",
							idx: i,
							highlight: 0,
							score: 0,
							x : 0,
							y : 0,
							w : 0})

		for (let i = 0; i < the_tweet.length; i++) {
			words_hash.push({word : the_tweet[i][0],
				idx: i,
				highlight: checkInx(i),
				score: the_tweet[i][1],
				x : 0,
				y : 0,
				w : 0})
				// console.log(words_hash)
		}

		words_hash.push({word : "lastline",
							idx: i,
							highlight: 0,
							score: 0,
							x : 0,
							y : 0,
							w : 0})
		

		function checkInx(i){
			if (word_idx.includes(i)){ return 1} else{ return 0}
		}

	}


	var letter_length = getWidthOfText(" ", "sans-serif", "16px"); 
	var box_height = 20;
	var x_pos = explanation_x; //  + clearance;
	var y_pos = explanation_y;  // + box_height + clearance/3;
	var next_line = 25;
	var line_counter = 0;
	var box_words_alignment = 11;
	var exp_margin = 40;

	words_box = svg_article.selectAll(".boxes")
						.data(words_hash).enter().append("g").attr("class", "words");		


	words_box.append("rect")
		.attr("class",function(d,i){return "boxes-"+i.toString()})
		.each(function (d,i) {
			letters = d.word.split("")

			// Go to next line 
			if (d.word == "nextline") {
				line_counter += 1;
				x_pos = explanation_x + clearance;
				y_pos = explanation_y + box_height + line_counter*next_line;
				d.x = x_pos;
				d.y = y_pos;
				d.w = getWidthOfText("", "sans-serif", "16px")
				x_pos = x_pos + d.w + letter_length;

			// Go to next line 
			}else if ((x_pos + (letters.length * letter_length)) > (explanation_x + article_width - exp_margin)){
				line_counter += 1; 
				x_pos = explanation_x + 2*clearance/3;
				y_pos = explanation_y + box_height + line_counter*next_line;

				d.x = x_pos;
				d.y = y_pos;
				d.w = getWidthOfText(d.word, "sans-serif", "16px")
				x_pos = x_pos + d.w + letter_length;
			}else if (d.word == "lastline") {
				
				line_counter += 1;
				x_pos = explanation_x + clearance;
				y_pos = explanation_y + box_height + line_counter*next_line;
				d.x = x_pos;
				d.y = y_pos;
				d.w = getWidthOfText("", "sans-serif", "16px")
				x_pos = x_pos + d.w + letter_length;
			// Continue in the same line 
			}else{

				d.x = x_pos;
				d.y = y_pos;
				d.w = getWidthOfText(d.word, "sans-serif", "16px")
				x_pos = x_pos + d.w + letter_length;
			}

		})
		.attr("x", function(d,i){
			return d.x;})  
		.attr("y", function(d,i){
			return d.y - box_words_alignment;})  // + d.count*clearance + clearance })
		.attr("width", function(d){
			return d.w;})
		.attr("height", box_height)
		.attr("fill", function(d,i){ 
       		if ((d.highlight > 0) &(highlight_labels == true)) return labels_color[d.highlight]; 
       		else if (d.score > neutral_score) {
       			return False_Color;
       		}else if (d.score < -1*neutral_score) {
       			return True_Color;
       		}else{
       			return "white";
       		}
			// return "white";
		})
		.attr("stroke", function(d,i){ 
       		if ((d.highlight > 0) &(highlight_labels == false)) return labels_color[d.highlight]; 
       		else{
       			return "white";
       		}
		})
		.attr("opacity", function(d,i) { 
			if (d.highlight > 0){
				return 1;	
			}
			else{
       			return Fn_word_highlighting(d.score); ;
			}
		});
   


	var dragall = 0;
	var last_sample = 0;
	
	svg_article.on("mouseup", function(d){ dragall = 0})

	words_box.append("text")
		.attr("class","explanation")
		.attr("class",function(d,i){return "explanation-"+ i.toString()})
		.style("font-size", "16px")
	    .attr("x", function(d,i){
					return d.x})  
	    .attr("y", function(d,i){
					return d.y;})  // + d.count*clearance + clearance })
	    .attr("dy", ".35em")
	    .text(function(d) {
	    	if (d.word == "nextline") {
	    	return "";	
	    	}else{
	    	return d.word; 	
	    	}
	    	
	    })
	    .on("mouseover", function(d){
			var this_sample = d3.select(this).attr('class').split("-")[1]
			if (d.highlight == 0){
				if (highlight_labels) {
				  svg.selectAll(".boxes-" + this_sample.toString())
					.attr("fill","yellow")
					.attr("opacity", 0.3);

				}else{
					svg.selectAll(".boxes-" + this_sample.toString())
						.attr("stroke",labels_color[1])
						.attr("stroke-width",3)
						.attr("opacity", 1);
				}
			}
			svg_article.selectAll(".boxes-" + this_sample.toString()).moveToBack();
			
		}).style('cursor','pointer')
		.on("mousemove", function(d){
			var this_sample = d3.select(this).attr('class').split("-")[1]
			if ((dragall == 1) & (this_sample != last_sample)){							

				// if (d.highlight == 1){
                //  	}else if (d.highlight == 2){
				// 	// svg.selectAll(".boxes-" + this_sample.toString())
				// 	// 	.attr("opacity", 0);
				// 	// d.highlight = 0;
				// }else{

				if (d.highlight == 0){
					d.highlight = 1;
					
					if (highlight_labels == true){
					svg_article.selectAll(".boxes-" + this_sample.toString())
						.attr("fill",labels_color[d.highlight])
						.attr("opacity", 1);

					}else{
						svg_article.selectAll(".boxes-" + this_sample.toString())
						.attr("stroke",labels_color[d.highlight])
						.attr("opacity", 1);
					}

					saved = 0;
					word_idx.push(d.idx)
					exp_data.push(d.word)
				}
				 window.getSelection().removeAllRanges();
				 last_sample = this_sample 
			}
		})
		.on("mouseout", function(d){
			var this_sample = d3.select(this).attr('class').split("-")[1]
			if (d.highlight > 0){
				svg_article.selectAll(".boxes-" + this_sample.toString())
			}else{
				// svg.selectAll(".boxes-" + this_sample.toString()).attr("opacity", 0);
				svg_article.selectAll(".boxes-" + this_sample.toString()).attr("opacity", Fn_word_highlighting(d.score));
				svg.selectAll(".boxes-" + this_sample.toString()).attr("stroke-width", 0);
				
				if (d.score > neutral_score) {
					svg_article.selectAll(".boxes-" + this_sample.toString()).attr("fill", False_Color);				
	       		}else if (d.score < -1*neutral_score) {
	       			svg_article.selectAll(".boxes-" + this_sample.toString()).attr("fill", True_Color);		
	       		}else{
	       			svg_article.selectAll(".boxes-" + this_sample.toString()).attr("fill", "white");
	       		}
			}
		});

	// Here we set the bottom margin for text box
	if (line_counter < 4) {
		
		height = 7*next_line;  // explanation_y + explanation_y + box_height 
		svg_article.selectAll(".explanation_frame").attr("height", height); 
		svg_article.attr("height", height+ 20); 

	}else{
		height = y_pos + next_line; 
		svg_article.selectAll(".explanation_frame").attr("height", height); 
		svg_article.attr("height", height + 20); 
	}
}


function updateHighlights(event, d){
	// console.log("called")

}

function getWidthOfText(txt, fontname, fontsize){
    if(getWidthOfText.c === undefined){
        getWidthOfText.c=document.createElement('canvas');
        getWidthOfText.ctx=getWidthOfText.c.getContext('2d');
    }
    getWidthOfText.ctx.font = fontsize + ' ' + fontname;
    return getWidthOfText.ctx.measureText(txt).width;
}


	
	// if (d3.event.pageY < 200){
	// div1.style("left", (d3.event.pageX - 120) + "px")
	// 	.style("top", ((d3.event.pageY + 128 + (arr.length*20)) + "px"));
	// }else{
	// div1.style("left", (d3.event.pageX - 120) + "px")
	// 	.style("top", ( d3.event.pageY - 128 - (arr.length*20) ) + "px");



function clearText() {
    document.getElementById("TextArea").value = ""
    for (var i = 0; i < 300; i++) {
	    svg.selectAll(".explanation-"+i.toString()).remove(); 
	    svg.selectAll(".boxes-"+i.toString()).remove(); 
    }
    // svg.selectAll(".words").remove(); 
    svg.selectAll(".result_bar").remove(); 
	svg.selectAll(".result_frame").remove(); 
	svg.selectAll(".class_label").remove(); 
		
}

function removeHighlights(){
	// button#clear2(onclick='removeHighlights()' style='background-color: #00b33c') True News
	word_idx = [];
	exp_data = [];
	save_json();
	showText(word_idx);
	cntrl.unsaw()
	if (demo_mode) resolveProgressButtonsDemo();
	else resolveProgressButtonsStudy();

}

var hidRect;
var time_weight = 100, topic_weight = 0, action_weight = 400, cluster_weight = 20;
var max_y = 100;
var each_time_sec;
// var topic_distance;
var colors = d3.scaleOrdinal(d3.schemeCategory10); 

var w_size = window,
    d_size = document,
    e_size = d_size.documentElement,
    g_size = d_size.getElementsByTagName('body')[0];
	
	d3.select(window).on('resize.updatesvg', updateWindow);
		var chart_x = w_size.innerWidth || e_size.clientWidth || g_size.clientWidth;  
		var chart_y = w_size.innerHeight || e_size.clientHeight || g_size.clientHeight; //

var svg = d3.select("#annotation_area").append("svg"),
    margin = {top: 5, right: 5, bottom: 5, left: 5};

var svg_article = d3.select("#article_area").append("svg"),
    margin = {top: 5, right: 5, bottom: 5, left: 5};


	svg.attr("width", (0.6*chart_x - margin.right - margin.left));
	svg.attr("height", 500)

	svg_article.attr("width", (0.6*chart_x - margin.right - margin.left));
	svg_article.attr("height", 500)

 var width = svg.attr("width");
 var height = 500; //svg.attr("height");   

var points_size = 10;
var Axis_room = 50;


var dataXRange = {min: 0, max: 6000};
var dataYRange = {min: 0, max: max_y};


var x_scale = d3.scaleLinear()
    .domain([dataXRange.min, dataXRange.max])
    .range([margin.left + points_size, width - points_size]);

var y_scale = d3.scaleLinear()
	.domain([dataYRange.min, dataYRange.max])
    .range([height - dataYRange.max, 0 + points_size]);



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
  



	var list_x = 50
	var list_y = 100
	var	list_width = 230
	var	list_height = 600
	var clearance = 20
	var explanation_x = 10
	var explanation_y = 10
	var explanation_height = 600
	var explanation_width = 580
	var article_width = 580
	var frame_height = height - 100
	var result_height = 100
	

	var explanation_frame = svg.append("g").append("rect").attr("class","explanation_frame")
					.attr("x", explanation_x)
					.attr("y", explanation_y)
					.attr("rx", 5)
					.attr("ry", 5)
					.attr("width", explanation_width)
					.attr("height", explanation_height)
					.attr("fill", "white")
					.style("fill-opacity",1)
					.style("stroke","gray")
					.style("stroke-opacity",0.5);


	var article_frame = svg_article.append("g").append("rect").attr("class","article_frame")
					.attr("x", explanation_x)
					.attr("y", explanation_y)
					.attr("rx", 5)
					.attr("ry", 5)
					.attr("width", explanation_width)
					.attr("height", explanation_height)
					.attr("fill", "white")
					.style("fill-opacity",1)
					.style("stroke","gray")
					.style("stroke-opacity",0.5);

// txtfilename();
readjsonfile();
// console.log(all_tweets)
// nextArticle();

function Pages(files){
	this.progress_start_time = Math.floor(Date.now() / 1000);
    this.last_time_s = this.progress_start_time;
	this.i = 0 // Current page to resolve/look at
	this.d = files; //List of file names
    this.total = files.length //Total number of pages
    this.hasSeen = new Array(this.total) //list of booleans if they have been seen.
    this.timeOnPage = new Array(this.total) //How long have they been looking at this trial/page
    for (let index = 0; index < this.total; index++) { //filling in the list of seen as false at first.
        this.hasSeen[index] = false;
        this.timeOnPage[index] = 0;
        // console.log("filling array's with default values")
    }
    this.saw = function (index){
        if(typeof index == "undefined"){index = this.i} //use index provided or just mark the current index as seen
        this.hasSeen[index]=true;
        // console.log("called Saw for index #",index, "on this index now:", this.i,this.total,this.hasSeen))
        if (demo_mode) resolveProgressButtonsDemo();
		else resolveProgressButtonsStudy();
        return true;//unnecessary but just in case.
    }
    this.unsaw = function(index){
        if(typeof index == "undefined"){index = this.i} //use index provided or just mark the current index as seen
        this.hasSeen[index]=false;
        if (demo_mode) resolveProgressButtonsDemo();
		else resolveProgressButtonsStudy();
        return false;//unnecessary but just in case.       
	}

	
}


function updateWindow(){
							 
		chart_x = w_size.innerWidth || e_size.clientWidth || g_size.clientWidth; 
		chart_y = w_size.innerHeight || e_size.clientHeight || g_size.clientHeight; 
		
		
		width = chart_x * 0.45;


		height = chart_y * 0.2;

		explanation_width = width * 0.995;
		article_width = width * 0.8 ;
		explanation_height = height;
		explanation_x = width * 0.001;
	
		svg.attr("width", width);
		svg.attr("height", height).attr("x", explanation_x);


		explanation_frame.attr("width", explanation_width)
						.attr("height", explanation_height)
						.attr("x", explanation_x)
						.attr("y", explanation_y);

		
		svg_article.attr("width", article_width*1.01);
		svg_article.attr("height", height).attr("x", explanation_x);
		
		article_frame.attr("width", article_width)
						.attr("height", explanation_height*0.95)
						.attr("x", explanation_x)
						.attr("y", explanation_y);

		// explanation_title.attr("x", explanation_x)
		// 				.attr("y", explanation_y - 20);
		
		// svg.selectAll(".explanation_frame").attr("height", height); //(3*next_line + line_counter * next_line));
		showText(1);
	}
	
// for demo

function resolveProgressButtonsDemo(){
	// console.log(cntrl);
	if(!cntrl.hasSeen[cntrl.i]){//turn off next button
		// document.getElementById("nextbutton-1").disabled = false;
		// document.getElementById("nextbutton-2").disabled = false;
	} else { //turn on next button
		// document.getElementById("nextbutton-1").disabled = false;
		// document.getElementById("nextbutton-2").disabled = false;
	}
	if(cntrl.i == cntrl.total-1){
		// document.getElementById("nextbutton-1").innerHTML = "Submit Results";
		// document.getElementById("nextbutton-2").innerHTML = "Submit Results";
	}

	//if first image, don't let them go backward.
	if(cntrl.i == 0){ //turn off previous button
		// document.getElementById("backbutton-1").disabled = false;
		// document.getElementById("backbutton-2").disabled = false;
	} else{ // Turn on Previous button
		// document.getElementById("backbutton-1").disabled = false;
		// document.getElementById("backbutton-2").disabled = false;
	}
}

// for evaluation study
function resolveProgressButtonsStudy(){
	// console.log(cntrl);
	if(!cntrl.hasSeen[cntrl.i]){//turn off next button
		// document.getElementById("nextbutton-1").disabled = true;
		document.getElementById("nextbutton-2").disabled = true;
	} else { //turn on next button
		// document.getElementById("nextbutton-1").disabled = false;
		document.getElementById("nextbutton-2").disabled = false;
	}
	if(cntrl.i == cntrl.total-1){
		// document.getElementById("nextbutton-1").innerHTML = "Submit Results";
		document.getElementById("nextbutton-2").innerHTML = "Submit Results";
	}

	//if first image, don't let them go backward.
	if(cntrl.i == 0){ //turn off previous button
		// document.getElementById("backbutton-1").disabled = true;
		document.getElementById("backbutton-2").disabled = true;
	} else{ // Turn on Previous button
		// document.getElementById("backbutton-1").disabled = false;
		document.getElementById("backbutton-2").disabled = false;
	}
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

