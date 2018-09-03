//
// TODO: Google web API deploy
// TODO: tool to generate embed code including resize script
// TODO: see if courseinfosizer.js can be loaded from GitHub
//
const app = function () {
	const PAGE_TITLE = 'Course info'
		
	const API_BASE = 'https://script.google.com/macros/s/AKfycbwuO-prQVmE_8HetNfg67dqK4Jie7eetp_8j4Bo5HcHGASf_5GN/exec';
	const API_KEY = 'MVwelcomemessageAPI';
	
	const NO_COURSE = 'NO_COURSE';
	const USE_DEFAULT = 'USE_DEFAULT';
	
	const page = {};
	const settings = {
		"include": "./include/",
	};

	const layoutElementId = {
		"generalfaq": "inc_generalfaq",
		"specificfaq": "inc_specificfaq"
	};

	const defaultIncludeFile = {
		"generalfaq": "generalfaq.html",
		"specificfaq": "specificfaq_none.html"
	};
	
	//---------------------------------------
	// get things going
	//----------------------------------------
	function init () {
		page.header = document.getElementById('header');
		page.header.toolname = document.getElementById('toolname');
		page.header.courses = document.getElementById('courses');
		page.header.controls = document.getElementById('controls');
		page.header.style.display = 'none'; 
		page.header.style.visibility = 'hidden';

		page.notice = document.getElementById('notice');
		page.notice.classList.add('wl-notice');
		
		page.title = document.getElementById('title');
		page.title.style.display = 'none';
		page.contents = document.getElementById('contents');
				
		if (!_initializeSettings()) {
			_setNotice('Failed to generate course info - invalid parameters');
		} else {
			if (settings.navmode) {
				_getCourseList(_initHeader);
				
			} else {
				_generateCourseInfo();
			}
		}
	}
	
	//-------------------------------------------------------------------------------------
	// query params:
	//		navmode: displays drop-down list for all courses (optional)
	//		coursekey: course for which to display info (required if not navmode)
	//-------------------------------------------------------------------------------------
	function _initializeSettings() {
		var result = false;
		var params = {};

		var urlParams = new URLSearchParams(window.location.search);
		params.navmode = urlParams.has('navmode');
		params.coursekey = urlParams.has('coursekey') ? urlParams.get('coursekey') : null;

		settings.navmode = params.navmode;
		settings.coursekey = params.coursekey;
		
		if (params.navmode || params.coursekey != null) {
			result = true;
		}
		
		return result;
	}
	
	//------------------------------------------------------------------------------
	// initialization of output page including optional controls section for navmode
	//------------------------------------------------------------------------------
	function _initHeader() {
		page.header.classList.add('wl-header');
				
		page.header.toolname.innerHTML = PAGE_TITLE;
		
		var elemCourseSelect = _createCourseSelect();
		
		page.header.courses.appendChild(elemCourseSelect);
		
		page.header.style.display = 'block';
		page.header.style.visibility = 'visible';
	}
	
	function _createCourseSelect() {
		var elemCourseSelect = document.createElement('select');
		elemCourseSelect.id = 'selectCourse';
		elemCourseSelect.classList.add('wl-control');
		elemCourseSelect.addEventListener('change',  _courseSelectChanged, false);
		
		var elemNoCourseOption = document.createElement('option');
		elemNoCourseOption.value = NO_COURSE;
		elemNoCourseOption.text = '<select a course>';
		elemCourseSelect.appendChild(elemNoCourseOption);
		
		var courseList = settings.courseList;
		for (var i = 0; i <  courseList.length; i++) {
			var elemOption = document.createElement('option');
			elemOption.value = courseList[i].coursekey;
			elemOption.text = courseList[i].fullname;
			elemCourseSelect.appendChild(elemOption);
		}

		page.courseselect = elemCourseSelect;
		
		return elemCourseSelect;
	}
				
	function _makeButton(id, className, label, title, listener) {
		var btn = document.createElement('button');
		btn.id = id;
		btn.classList.add(className);
		btn.innerHTML = label;
		btn.title = title;
		btn.addEventListener('click', listener, false);
		return btn;
	}
	
	//---------------------------------------------------------
	// gather config information and call to start rendering
	//--------------------------------------------------------
	function _generateCourseInfo() {
		_getCourseInfoLayout(_renderCourseInfoMain);
	}

	function _clearCourseInfo() {
		var elemContents = page.contents;
		while (elemContents.firstChild) {
			elemContents.removeChild(elemContents.firstChild);
		}
	}	
	
	//---------------------------------------------------------------------------------
	// use settings.config to load HTML include files
	//--------------------------------------------------------------------------------
	function _renderCourseInfoMain() {
		page.title.innerHTML = 'Expectations and FAQs for ' + settings.fulllayout.fullname;
		page.title.style.display = 'block';

		_renderCourseInfoSubsections(page.contents);
	}
	
	function _renderCourseInfoSubsections(elemParent) {
		var fulllayout = settings.fulllayout;
		var layout = fulllayout.layout;
		var layoutelement = layoutElementId;
		var defaultinclude = defaultIncludeFile;

		for (var key in layout) {
			var elementId = layoutelement[key];
			var elemSubsection = document.createElement('span');
			elemSubsection.id = elementId;
			elemParent.appendChild(elemSubsection);
			
			var filename = layout[key];
			var defaultfilename = defaultinclude[key];
			if (filename == USE_DEFAULT) filename = defaultfilename;
			_includeHTML(elementId, settings.include + filename, addAccordionHandlers);
		}
	}
	
	function _includeHTML(elemId, url, callback) {
//		console.log('_includeHTML: elemId=' + elemId + ' url=' + url); //+ ' cb=' + callback);
		$("#" + elemId).load(url, function(response, status, xhr) {
			if (status == "success") {
				callback(elemId);
			} else {
				var msg = 'failed to load ' + elemId + ' from ' + url;
				console.log(msg);
				_setNotice(msg);
			}
		});	
	}
	
	function addAccordionHandlers() {
		var acc = document.getElementsByClassName("ci-accordion");
		var i;

		for (i = 0; i < acc.length; i++) {
			if (acc[i].id != 'has_handler') {
				acc[i].id = 'has_handler';  // avoid duplicate handlers

				acc[i].addEventListener("click", function(evt) {
					// toggle active state for this panel and set display accordingly
					this.classList.toggle("ci-active");
					
					panel = this.nextElementSibling;
					if (panel.style.display === "block") {
						panel.style.display = "none";
					} else {
						panel.style.display = "block";
					}

					// hide contents of any other open panels
					var activePanels = document.getElementsByClassName("ci-active");
					for (var j = 0; j < activePanels.length; j++) {
						var activePanel = activePanels[j];
						if (activePanel != this) {
							activePanel.classList.remove("ci-active");
							activePanel.nextElementSibling.style.display = "none";
						}
					}
					
					_postHeightChangeMessage();
				});
			}
		}
		
		_postHeightChangeMessage();		
	}
		
	//---------------------------------------
	// utility functions
	//----------------------------------------
	function _setNotice (label) {
		page.notice.innerHTML = label;

		if (label == '') {
			page.notice.style.display = 'none'; 
			page.notice.style.visibility = 'hidden';
		} else {
			page.notice.style.display = 'block';
			page.notice.style.visibility = 'visible';
		}
	}
		
	function _courseSelectChanged(evt) {
		settings.coursekey = evt.target.value;

		if (page.courseselect.value == NO_COURSE) return;
		_clearCourseInfo();
		_generateCourseInfo();
	}
	
	//--------------------------------------------------------------
	// build URL for use with Google sheet web API
	//--------------------------------------------------------------
		function _buildApiUrl (datasetname, coursekey, layouttype) {
		let url = API_BASE;
		url += '?key=' + API_KEY;
		url += datasetname && datasetname !== null ? '&dataset=' + datasetname : '';
		url += coursekey && coursekey !== null ? '&coursekey=' + coursekey : '';
		url += layouttype && layouttype !== null ? '&layouttype=' + layouttype : '';
		//console.log('buildApiUrl: url=' + url);
		
		return url;
	}
	
	//--------------------------------------------------------------
	// use Google Sheet web API to get course list
	//--------------------------------------------------------------
	function _getCourseList (callback) {
		_setNotice('loading course list...');

		fetch(_buildApiUrl('courselist'))
			.then((response) => response.json())
			.then((json) => {
				//console.log('json.status=' + json.status);
				if (json.status !== 'success') {
					_setNotice(json.message);
				}
				//console.log('json.data: ' + JSON.stringify(json.data));
				settings.courseList = json.data.courselist;
				_setNotice('');
				callback();
			})
			.catch((error) => {
				_setNotice('Unexpected error loading course list');
				console.log(error);
			})
	}
	
	//--------------------------------------------------------------
	// use Google Sheet web API to get layout for course
	//--------------------------------------------------------------
	function _getCourseInfoLayout (callback) {
		_setNotice('loading layout for course...');
		/*
		fetch(_buildApiUrl('layout', settings.coursekey, settings.layouttype))
			.then((response) => response.json())
			.then((json) => {
				//console.log('json.status=' + json.status);
				if (json.status !== 'success') {
					_setNotice(json.message);
				}
				//console.log('json.data: ' + JSON.stringify(json.data));
				settings.fulllayout = json.data;
				_setNotice('');
				callback();
			})
			.catch((error) => {
				_setNotice('Unexpected error loading layout');
				console.log(error);
			})
			*/
			
		_setNotice('');
		var fakesettings = {
			"game_design": {
				"coursekey": "game_design",
				"fullname": "Advanced Programming: Game Design & Animation",
				"layout": {
					"generalfaq": "USE_DEFAULT",
					"specificfaq": "USE_DEFAULT"
				}
			},
			"javascript": {
				"coursekey": "javascript",
				"fullname": "Advanced Web Design: JavaScript",
				"layout": {
					"generalfaq": "USE_DEFAULT",
					"specificfaq": "specificfaq_javascript.html"
				}
			},
			"apcsp1": {
				"coursekey": "apcsp1",
				"fullname": "AP Computer Science Principles (semester 1)",
				"layout": {
					"generalfaq": "USE_DEFAULT",
					"specificfaq": "specificfaq_apcsp1.html"
				}
			},
			"html_css": {
				"coursekey": "html_css",
				"fullname": "Basic Web Design: HTML & CSS",
				"layout": {
					"generalfaq": "USE_DEFAULT",
					"specificfaq": "specificfaq_html_css.html"
				}
			},
			"digital_literacy": {
				"coursekey": "digital_literacy",
				"fullname": "Digital Literacy & Programming",
				"layout": {
					"generalfaq": "USE_DEFAULT",
					"specificfaq": "specificfaq_digital_literacy.html"
				}
			},
			"fpa": {
				"coursekey": "fpa",
				"fullname": "Foundations of Programming A",
				"layout": {
					"generalfaq": "USE_DEFAULT",
					"specificfaq": "specificfaq_fpa.html"
				}
			}
		};
		
		settings.fulllayout = fakesettings[settings.coursekey];

		callback();
	}
	
	//-----------------------------------------------------------------------------------
	// iframe responsive height - post message to parent (if in an iframe) to resizeBy
	//-----------------------------------------------------------------------------------
	function _postHeightChangeMessage() {
		var msg = document.body.scrollHeight + '-' + 'CourseInfoGenerator';
		//console.log('posting to parent: ' + msg);
		window.parent.postMessage(msg, "*");
	}
	/*------------------------------------------------------------
	 * sample embed code for parent iframe
	 *------------------------------------------------------------*/
	 /*

<script type="text/javascript" src="https://drive.google.com/uc?id=1lE_MPv0lYEX6mFaTPFmJ7S83YRRbLSQo"></script>
<iframe id="iframe-coursegenerator" width="100%" height="100" src="https://ktsanter.github.io/courseinfo/?coursekey=digital_literacy"></iframe>

** Note this script is stored in Google Drive as 'courseinfosizer.js' and should be:

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
*/
	
//--------------------------------------------------------------------------------

	return {
		init: init
 	};
}();