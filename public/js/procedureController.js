function Progress(main_element,data,callBackMethod, condition){
    this.progress_start_time = Math.floor(Date.now() / 1000);
    this.last_time_s = this.progress_start_time;
    this.i = 0 // Current page to resolve/look at
    this.total = data.length //Total number of pages
    this.main_element = main_element //What element needs to change on each page.
    this.d = data; //The content to be displayed on screen
    this.callBackMethod = callBackMethod //Where to go after the sequence of progress.
    this.conditionNum = condition //a number 0-3 describing the kind of dataset the users is seeing.
    this.userData = new Array(this.total)// not sure if I need this saved here yet...
    this.hasSeen = new Array(this.total) //list of booleans if they have been seen.
    this.timeOnPage = new Array(this.total) //How long have they been looking at this trial/page
    for (let index = 0; index < this.total; index++) { //filling in the list of seen as false at first.
        this.hasSeen[index] = false;
        this.userData[index] = new Array();
        this.timeOnPage[index] = 0;
        console.log("filling array's with default values")
    }
    this.saw = function (index){
        if(typeof index == "undefined"){index = this.i} //use index provided or just mark the current index as seen
        this.hasSeen[index]=true;
        // console.log("called Saw for index #",index, "on this index now:", this.i,this.total,this.hasSeen))
        resolveProgressButtons();
        return true;//unnecessary but just in case.
    }
    this.unsaw = function(index){
        if(typeof index == "undefined"){index = this.i} //use index provided or just mark the current index as seen
        this.hasSeen[index]=false;
        resolveProgressButtons();
        return false;//unnecessary but just in case.       
    }
    // overwrites data stored in an index
    this.saveData = function(updatedObj,shouldOverwrite){
        let current_time_s = Math.floor(Date.now() / 1000);
        let tot_time = current_time_s - this.last_time_s;
        this.last_time_s = current_time_s;
        // console.log("time on page: ", tot_time, "(s), currently stored:", updatedObj["secSinceLast"]);
        updatedObj["secSinceLast"]=tot_time;
        this.timeOnPage[this.i] += tot_time;
        // if (this.userData[this.i].tot_time == undefined){
        //     updatedObj["tot_time"] = tot_time
        // } else {
        //     updatedObj["tot_time"] = this.userData[this.i].tot_time +tot_time
        // }
        this.saw(this.i)
        // console.log("you want to add:", updatedObj, "to", this.userData);
        //todo When clearing an object, it doesn't clear away the "secSinceLast" property of the empty array...

        if(shouldOverwrite){ //overwrite the data
            this.userData.splice(this.i,1,updatedObj);
        } else{ //append to the data in this index
            this.userData[this.i].push(updatedObj)
        }
            //    console.log(this.userData[this.i]);
 console.log("Did that work? Here's the Data I have now",this.userData);
    }
    this.writeToFile = function(taskNum){
        let toSave = []; //final output array to be built now and saved
        
        let task_key_id = getCookie("task_key_id") //get user data from cookie storage.
        let tutorial_time = parseInt(getCookie("tutorial_time")) //get the lenght of Time they spent in the totorial from the cookies
        let dataset_key = task_key_id.split(",")[1]; //separate out the dataset key so we know what they observed
        let mturk_id = task_key_id.split(",")[2]; //separate their MTurk ID so we know who they are.
        
        //Calculate the Total Time the Task took to complete
        let task_end_time = Math.floor(Date.now() / 1000);
        let task_total_time = task_end_time - this.progress_start_time;

        //first entry contrins all this information
        toSave.push({i: mturk_id, r:dataset_key, t:taskNum, d:0,d1:tutorial_time,d2:task_total_time});

        for (let index = 0; index < this.total; index++) {
            this.userData[index].pageTime = this.timeOnPage[index]
            console.log(this.userData[index])
            // toSave.push(this.userData[index]);
        }
        //push the remainder of the user data to this file.
        toSave.push(this.userData);
        //now Save the file as json to the server with a POST request.
        let isSuccess = false;
        let req = $.ajax({
            type : "POST",
            url : "./json.php",
            async: false,
            data : {
                json : JSON.stringify(toSave)
            },
            success: () => {
                console.log("Connected to json.php, SUCSSESS");
                isSuccess = true;
                // return isSuccess;
            },
            error: (e) => {
                console.error("Incomplete Transfer. Cannpt connect to JSON.php",e);
                isSuccess = false;
                // return isSuccess;
            }
        });
        return isSuccess;
    }
    this.back = function (){
        // console.log("called Back to page #", this.i, "out of", this.total, "user has seen:",this.hasSeen)
        if (this.i > 0){
            this.i--;
            this.updatePage();
        }
    }
    this.next = function(){
        // console.log("called Next", this.i,this.total,this.hasSeen)
        if(this.i < this.total-1){
            this.i++;
            this.updatePage();
        //todo change the button text on the next to last page so it's clear that they are finishing
        // }else if(this.i == this.total-2){
        //     document.getElementById("nextbutton-1").innerHTML = "Start Task"
        }else{
            // this.writeToFile(this.conditionNum);
            this.callBackMethod()
        }
    }
    this.updatePage = function(){
        newPage = this.d[this.i]+'<h3 class="progress">Page '+(this.i+1)+'/'+this.total+'</h3>';
        // console.log(data[this.i],newPage);
        document.getElementById(this.main_element).innerHTML = newPage;
        if(this.hasSeen[this.i]){
            resolveDataFromStorage(this.userData[this.i])
        }else{
            freshPage(); //may not need to make or use this function but I was getting some left over from previous annotations
        }
        resolveProgressButtons();
    }
    //todo define this more clearly if we need it
    this.toString = function(){
        // let str='';
        // this.userData.forEach(element => {
        //     str += element
        // });
        return this.userData.toString();
    }
}

function resolveProgressButtons(){
    // console.log(cntrl)
	if(!cntrl.hasSeen[cntrl.i]){//turn off next button
		document.getElementById("nextbutton-1").disabled = true;
		document.getElementById("nextbutton-2").disabled = true;
	} else { //turn on next button
		document.getElementById("nextbutton-1").disabled = false;
		document.getElementById("nextbutton-2").disabled = false;
	}

	//if first image, don't let them go backward.
	if(cntrl.i == 0){ //turn off previous button
		document.getElementById("backbutton-1").disabled = true;
		document.getElementById("backbutton-2").disabled = true;
	} else{ // Turn on Previous button
		document.getElementById("backbutton-1").disabled = false;
		document.getElementById("backbutton-2").disabled = false;
	}
}

//Adding generic Getters and Setters for Cookies so the don't need to be added to every html document in addition ot this object.
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

  function setCookie(cname, cvalue) {
    document.cookie = cname + "=" + cvalue + ";path=/";
  }


    const urlParams = new URLSearchParams(window.location.search);  
    const key = checkKey(urlParams.get('key'));
    var user_task  = checkKey(urlParams.get('task'));
    // var user_task = "ImageRating";

    var mturk_ID = "";
    var position = $(window).scrollTop();

    console.log(user_task, key) 
    // mturk_ID = prompt("Please enter your AMT ID for screening:", "");
    // screening_id('stay');

    let tutorial_start_time = Math.floor(Date.now() / 1000);
    let slides;
    // ImageRating
    // ImageAnnotation
    // TextAnnotation
    // TextRating


    // -----------------Task 1---------------------
    if (user_task == "TextRating"){
        slides = [
        '<h1>Misinformation Detection AI</h1>\
        <p>Welcome, please read the instructions in this slideshow.</p>\
        <br><br>\
        <h2>Background</h2>\
        <p> We are building an AI system that learns to classify emails.</p>\
        <p> Our AI is trained to detect <mark><u>medicine</u></mark> and <mark><u>electronics</u></mark> topics in emails.</p>\
        <p> We need your help to <mark><u>evaluate the "goodness" of our AI</u></mark> by reviewing it\'s output for 14 emails. </p>\
        <p> Our AI <mark><u>explains which words</u> it used to classify the emails</mark> by highlighting them yellow. </p>',
        '<h1>Your Task</h1>\
        <h2>Review AI Explanations:</h2> \
        <p>Your main task is to <mark><u> review and rate the AI explanations (higlighted words)</u></mark> which describe why the AI made it\'s email classification. </p>\
        <p>The words with the <mark>most opaque yellow</mark> were the most important for classifying the message to a topic whereas the areas left white have little significance.</p>\
        <img  class="slide-img" src="http://people.tamu.edu/~sina.mohseni/data/instructions/t-interface-1.png" width="200">',
        '<h1>Tour Task</h1>\
        <h2>Rate AI explanations for each email:</h2>\
        <p>Consider: \
          <ul>\
            <li>Are the correct words selected?</li>\
            <li>Does it match your expectations?</li>\
            <li>Would you use the same words to make your desicion?</li>\
          </ul>\
        </p>\
        <h2>Click [Next Article] to navigate:</h2>\
        <img  class="slide-img" src="http://people.tamu.edu/~sina.mohseni/data/instructions/t-interface-2.png" >',
        '<h1>Finishing</h1>\
        <p>After rating all <mark>14</mark> articles, your data will be <mark>stored automatically</mark>.</p>\
        <p>Copy the <mark>HIT Completion Code</mark> and go back to the Mechanical Turk page to finish your HIT.</p>\
        <img  class="slide-img" src="http://people.tamu.edu/~sina.mohseni/data/instructions/t-interface-3.png" >'
      ]
    
    // -----------------Task 2---------------------
    }else if (user_task == "ImageRating"){
        
        // for LIME method
        slides = ['<h1> Pet Recognition AI </h1><p>Welcome, please read the instructions in this slideshow.</p><h2> Background: </h2><p> We are building an AI system to recognize <u> pets in images from social media </u> to esmitate pet populations in cities </p><p> Our AI system is trained to <u> detect cats and dogs</u> in images. </p><p><mark>We need your help to <u>evaluate the "goodness" of our AI</u></mark> by reviewing it\'s output for 15 images. </p><p> Our <u>AI describes where it found a pet</u> by highlighting areas of the image. </p>',
        '<h1> Task </h1><h3>Review our AI\'s Explanations:</3><p>Your main task is to <mark><u> review and rate the heatmaps</u></mark> which explain what parts the AI used to make it\'s decision: </p><p>The areas in red were the most important for identifying the pet whereas the areas in blue have little significance.</p><img  class="slide-img" src="http://people.tamu.edu/~sina.mohseni/data/instructions/heatmap.PNG">',
        '<h1> Instructions </h1><p>On a scale from 1-10, Rate the AI explanations for each image.</p><strong><p>Consider:<ul><li>Is the correct area selected?</li><li>Does it match your expectations?</li><li>Would you use the same areas to make your desicion?</li> <!-- todo: this is similar to the one above...--></ul></p></strong><img  class="slide-img" src="http://people.tamu.edu/~sina.mohseni/data/instructions/lime-interface-1.PNG" >',
        '<h1> Interface </h1><h3>Click [Next Image] to Contiune: </h3><img  class="slide-img" src="http://people.tamu.edu/~sina.mohseni/data/instructions/lime-interface-2.PNG" >',
        '<h1> Finishing </h1><h3>After reviewing the images, your HIT code is displayed, you must <mark>copy and paste</mark> this in the mechanical turk page for credit: </h3><img  class="slide-img" src="http://people.tamu.edu/~sina.mohseni/data/instructions/interface-3.PNG" >']
    
        // for Grad-cam method
        // slides = ['<h1> Pet Recognition AI </h1><p>Welcome, please read the instructions in this slideshow.</p><h2> Background: </h2><p> We are building an AI system to recognize <u> pets in images from social media </u> to esmitate pet populations in cities </p><p> Our AI system is trained to <u> detect cats and dogs</u> in images. </p><p><mark>We need your help to <u>evaluate the "goodness" of our AI</u></mark> by reviewing it\'s output for 15 images. </p><p> Our <u>AI describes where it found a pet</u> by highlighting areas of the image. </p>',
        // '<h1> Task </h1><h3>Review our AI\'s Explanations:</3><p>Your main task is to <mark><u> review and rate the heatmaps</u></mark> which explain what parts the AI used to make it\'s decision: </p><p>The areas in red were the most important for identifying the pet whereas the areas in blue have little significance.</p><img  class="slide-img" src="http://people.tamu.edu/~sina.mohseni/data/instructions/heatmap.PNG">',
        // '<h1> Instructions </h1><p>On a scale from 1-10, Rate the AI explanations for each image.</p><strong><p>Consider:<ul><li>Is the correct area selected?</li><li>Does it match your expectations?</li><li>Would you use the same areas to make your desicion?</li> <!-- todo: this is similar to the one above...--></ul></p></strong><img  class="slide-img" src="http://people.tamu.edu/~sina.mohseni/data/instructions/interface-1.PNG" >',
        // '<h1> Interface </h1><h3>Click [Next Image] to Contiune: </h3><img  class="slide-img" src="http://people.tamu.edu/~sina.mohseni/data/instructions/interface-2.PNG" >',
        // '<h1> Finishing </h1><h3>After reviewing the images, your HIT code is displayed, you must <mark>copy and paste</mark> this in the mechanical turk page for credit: </h3><img  class="slide-img" src="http://people.tamu.edu/~sina.mohseni/data/instructions/interface-3.PNG" >']
    
    // -----------------Task 3---------------------
    }else if (user_task == "ImageAnnotation"){
        slides = ['<h1> Object Features in Images </h1><p>\
                Welcome, please read the instructions in this slideshow.</p>\
                <br><br>\
                <h2> Background: </h2><p> We are building an AI system to <mark><u>recognize different objects in images from social media</u></mark>.</p><!-- todo: is "pixels" too specific? Is there a more general word? --><p> We need your help to <mark><u> select image areas that best represent objects</u></mark> in order to train our AI. </p><!-- <p> You <u> do not necessarily need to select the entire pet body </u> but the salient area that is most representative of pets. </p> --></br>',
            '<h1> Instructions </h1><p>Select Features in Images: Your main task is to <mark> hightlight the areas in the image that best describe that object.</mark></p><p> For example, in the image below, this could be a paw, a nose, the whole body etc. Your goal is to <mark>select the areas</mark> of the image  that <mark><u> help you recognize</u></mark> the object. <br><br>You do not need to select the entire pet in every image, only the most recognizable areas!</p></br></br><img  class="slide-img" src="http://people.tamu.edu/~sina.mohseni/data/instructions/annotation-1.PNG">',
            '<h1> Controls </h1><p>Use your mouse to draw around pets:</p><img  class="slide-img" src="http://people.tamu.edu/~sina.mohseni/data/instructions/annotation-2.png">',
            '<h1> Finishing </h1><h3>After 15 images, your HIT code is displayed, you must <mark>copy and paste</mark> this in the mechanical turk page for credit: </h3></br><img  class="slide-img" src="http://people.tamu.edu/~sina.mohseni/data/instructions/annotation-4.PNG">']

    // -----------------Task 4---------------------
    }else if (user_task == "TextAnnotation"){

        slides = [
        '<h1>Misinformation Detection AI</h1>\
        <p>Welcome, please read the instructions in this slideshow.</p>\
        <br><br>\
        <h2>Background</h2>\
        <p> We are building an AI system that learns to learn movie reviews.</p>\
        <p> Our AI is trained to detect <mark_pos><u>positive</u></mark_pos> and <mark_neg><u>negative</u></mark_neg> movie reviews.</p>\
        <p> We need your help to <mark><u>choose the "most descriptive" words, phrases, or sentences </u></mark> in movie reviews to train our AI. </p>',
        '<h1>Your Task</h1>\
        <br>\
        <h2>Explain Descriptive Words and Phrases to AI:</h2> \
        <p>Your main task is to <mark><u>select words and phrases</u></mark> which explain a <mark_pos><u>positive</u></mark_pos> or <mark_neg><u>negative</u></mark_neg> movie review. </p>\
        <p>Use your best judgement to select words (by mouse click) that you feel are the <mark><u>most important</u></mark> for identifying the review.</p>\
        <br>\
        <p> Consider:\
          <ul>\
            <li>What words describe a <mark_pos><u>positive</u></mark_pos> or <mark_neg><u>negative</u></mark_neg> movie review?</li>\
            <li>What about phrases?</li>\
          </ul>\
        </p>\
        <img  class="slide-img" src="http://people.tamu.edu/~sina.mohseni/data/instructions/t-interface-4.png" width="200">',
        '<h1>Instructions</h1>\
        <h2>In each movie review, click words (drag for multiple words) to <mark>mark them as important</mark>.</h2>\
        <h2>Click [Next Article] to navigate your <mark>11</mark> articles.</h2>\
        <img  class="slide-img" src="http://people.tamu.edu/~sina.mohseni/data/instructions/t-interface-4.png" >',
        '<h1>Finishing</h1>\
        <p>After highlighting key words in all movie reviews, your data will be <mark>stored automatically</mark>.</p>\
        <p>Copy the <mark>HIT Completion Code</mark> and go back to the Mechanical Turk page to finish your HIT.</p>\
        <img  class="slide-img" src="http://people.tamu.edu/~sina.mohseni/data/instructions/t-interface-3.png" >'
      ]

      
      //   slides = [
      //   '<h1>Topic Recognition AI</h1>\
      //   <p>Welcome, please read the instructions in this slideshow.</p>\
      //   <br><br>\
      //   <h2>Background</h2>\
      //   <p> We are building an AI system that learns to identify emails.</p>\
      //   <p> Our AI is trained to detect <mark><u>medicine</u></mark> and <mark><u>electronics</u></mark> topics in emails.</p>\
      //   <p> We need your help to <mark><u>choose the "most descriptive" words</u></mark> to train our AI. </p>',
      //   '<h1>Your Task</h1>\
      //   <br>\
      //   <h2>Explain Descriptive Words to AI:</h2> \
      //   <p>Your main task is to <mark><u>select words</u></mark> which explain the given topic. </p>\
      //   <p>Use your best judgement to select words (by mouse click) that you feel are the <mark><u>most important</u></mark> for classifying the message.</p>\
      //   <br>\
      //   <p> Consider:\
      //     <ul>\
      //       <li>What words describe the topic?</li>\
      //       <li>Are there words that are specific to this topic?</li>\
      //     </ul>\
      //   </p>\
      //   <img  class="slide-img" src="http://people.tamu.edu/~sina.mohseni/data/instructions/t-annotation-1.png" width="200">',
      //   '<h1>Instructions</h1>\
      //   <h2>In each email, click words to <mark>mark them as importatnt</mark>.</h2>\
      //   <h2>Click [Next Article] to navigate your <mark>14</mark> articles.</h2>\
      //   <img  class="slide-img" src="http://people.tamu.edu/~sina.mohseni/data/instructions/t-annotation-2.png" >',
      //   '<h1>Finishing</h1>\
      //   <p>After highlighting key words in all emails, your data will be <mark>stored automatically</mark>.</p>\
      //   <p>Copy the <mark>HIT Completion Code</mark> and go back to the Mechanical Turk page to finish your HIT.</p>\
      //   <img  class="slide-img" src="http://people.tamu.edu/~sina.mohseni/data/instructions/t-interface-3.png" >'
      // ]
    }else{
        console.log("undefined user task")
    }

  
    cntrl = new Progress("cnsnttextbox",slides,read_radio);
    cntrl.updatePage(); // clear the page and load from object
    function nextSlide(){screening_id('stay');cntrl.next();waitNSee()}
    function backSlide(){cntrl.back()}
    //This is not a perfect system, but it does slow them down some. 
    function waitNSee(){
      setTimeout(function(){cntrl.saw()},500) // 2000
      //bypass Timer: Toggle on the line below
      // cntrl.saw()
    }
    //call to resolve the first page.
    waitNSee();



//If a key is not entered in the URL, then generate a random key 0-4 inclusive
function checkKey(k){
  if (k === null){
    return Math.floor(Math.random()*4)
  } else{
    return k
  }
}


// request mturk id with mouse scroll event 
$(window).scroll(function() {
    var scroll = $(window).scrollTop();
    if (scroll > position) {
      if (mturk_ID == null || mturk_ID == "") {
        screening_id('stay');
        mturk_ID = prompt("Please enter your Amazon Mechanical Turk ID for screening:", "");
      }
    } else {
      if (mturk_ID == null || mturk_ID == "") {
        mturk_ID = prompt("Please enter your Amazon Mechanical Turk ID for screening:", "");
        screening_id('stay');
      }
    }
    position = scroll;
  });




function getParameterByName(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
      results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function read_radio(){
   

  // user_task = "ImageRating";

  if (mturk_ID == null || mturk_ID == "") {
   
    mturk_ID = prompt("Please enter your Amazon Mechanical Turk ID for screening:", "");
    if (mturk_ID != null & mturk_ID != "") {
      result = screening_id('stay');
      if (result == 'passed') alert("Be sure you fully understand the instructions on this page, you will not be able to see them during the task!\n\nClick [Continue] to begin")
    }

  }else{
    screening_id('proceed');
  }
}


function freshPage (){ return null}


function resolveDataFromStorage(history){return null}

function screening_id(action){

    if (mturk_ID == null || mturk_ID == "") {
      mturk_ID = prompt("Please enter your Amazon Mechanical Turk ID for screening:", "");
    } 
    

    output = 'passed'
    $.getJSON("./js/workers/workers.json", function(workers) {
        
        // console.log(workers, mturk_ID,key,workers[mturk_ID])

        if (mturk_ID in workers) {
            // if (workers[mturk_ID].includes(parseInt(key))){
                alert("You have done this HIT before; Sorry can't do it again!")
                document.getElementById("nextbutton-1").innerHTML = "You Can't Continue"
                document.getElementById("nextbutton-2").innerHTML = "You Can't Continue"
                document.getElementById('nextbutton-1').disabled = true;  // disable this button
                document.getElementById("nextbutton-2").disabled = true;  // disable this button
                // window.close();
                // var ww = window.open(window.location, '_self');
                // ww.close();
                output = 'failed';
            // }

            // }else{
            //   let tutorial_end_time = Math.floor(Date.now() / 1000);
            //   let total_tutorial_time = tutorial_end_time-tutorial_start_time
            //   setCookie("user_selection", [user_task,key,mturk_ID])
            //   setCookie("tutorial_time", total_tutorial_time)
            //   location.href='/cnsnt'
            // }

        } else if (action == 'proceed'){
          let tutorial_end_time = Math.floor(Date.now() / 1000);
          let total_tutorial_time = tutorial_end_time-tutorial_start_time
          setCookie("user_selection", [user_task,key,mturk_ID])
          setCookie("tutorial_time", total_tutorial_time)
          location.href='/cnsnt'
        }

    });

    return output
}
