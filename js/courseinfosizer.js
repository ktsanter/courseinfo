
window.addEventListener('message', function(e) {
	var data = e.data.split('-');
	var scroll_height = data[0];
	var iframe_id = data[1];

	if(iframe_id == 'CourseInfoGenerator') {
		var elem = document.getElementById('iframe-coursegenerator');
		var ht = parseInt(scroll_height);
		elem.style.height = (ht + 10) + 'px'; 
	}

} , false);
