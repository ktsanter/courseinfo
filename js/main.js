//
// TODO: change student/mentor to layoutType
//
const app = function () {
	const PAGE_TITLE = 'Course info'
	const PAGE_VERSION = 'v0.1';
		
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
		"specificfaq": "specificfaq.html"
	};
	
	//---------------------------------------
	// get things going
	//----------------------------------------
	function init () {
		page.notice = document.getElementById('notice');
		page.notice.classList.add('wl-notice');
		
		page.contents = document.getElementById('contents');
				
		if (!_initializeSettings()) {
			_setNotice('Failed to generate course info - invalid parameters');
		} else {
			_generateCourseInfo();
		}
	}
	
	//-------------------------------------------------------------------------------------
	// query params:
	//-------------------------------------------------------------------------------------
	function _initializeSettings() {
		var result = false;

		var params = {};

		settings.coursekey = 'javascript';
			
		var urlParams = new URLSearchParams(window.location.search);
//		params.navmode = urlParams.has('navmode');
//		params.coursekey = urlParams.has('coursekey') ? urlParams.get('coursekey') : null;

		result = true;
		
		return result;
	}
	
	//------------------------------------------------------------------------------
	// initialization of output page including optional controls section for navmode
	//------------------------------------------------------------------------------
	function _initHeader() {
		page.header.classList.add('wl-header');
				
		page.header.toolname.innerHTML = PAGE_TITLE;
		
		var elemCourseSelect = _createCourseSelect();
		var elemLayout = _createLayoutChoice();
		var elemTerm = _createTermChoice();
			
		page.header.courses.appendChild(elemCourseSelect);
		page.header.controls.appendChild(elemLayout);
		page.header.controls.appendChild(elemTerm);
		
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
		
	function _createLayoutChoice() {
		var layoutChoices = ['student', 'mentor'];
		var elementName = 'student_mentor';
		var handler = _studentMentorChange;
		var className = 'wl-radio';
		
		var elemWrapper = document.createElement('span');
		elemWrapper.classList.add('container');
		
		for (var i = 0; i < layoutChoices.length; i++) {
			var choice = layoutChoices[i];
			
			var elemChoice = document.createElement('input');
			elemChoice.id = choice;
			elemChoice.type = 'radio';
			elemChoice.name = elementName;
			if (i == 0) elemChoice.checked = true;
			elemChoice.addEventListener('change', handler, false);
			
			var elemLabel = document.createElement('label');
			elemLabel.htmlFor = choice;
			elemLabel.innerHTML = choice;
			elemLabel.classList.add(className);
			
			elemWrapper.appendChild(elemChoice);
			elemWrapper.appendChild(elemLabel);
		}
		
		return elemWrapper;
	}
	
		
	function _createTermChoice() {
		var layoutChoices = ['s1', 's2', 't1', 't2', 't3', 'summer', 'essentials', 'open'];
		var elementName = 'term';
		var handler = _termChange;
		var className = 'wl-radio';
		
		var elemWrapper = document.createElement('span');
		elemWrapper.classList.add('container');
		
		for (var i = 0; i < layoutChoices.length; i++) {
			var choice = layoutChoices[i];
			
			var elemChoice = document.createElement('input');
			elemChoice.id = choice;
			elemChoice.type = 'radio';
			elemChoice.name = elementName;
			if (i == 0) elemChoice.checked = true;
			elemChoice.addEventListener('change', handler, false);
			
			var elemLabel = document.createElement('label');
			elemLabel.htmlFor = choice;
			elemLabel.innerHTML = choice;
			elemLabel.classList.add(className);
			
			elemWrapper.appendChild(elemChoice);
			elemWrapper.appendChild(elemLabel);
		}
		
		return elemWrapper;
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
		_renderCourseInfoSubsections(page.contents);
	}
	
	function _renderCourseInfoSubsections(elemParent) {
		var fulllayout = settings.fulllayout;
		var fullname = fulllayout.fullname;
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
		var acc = document.getElementsByClassName("accordion");
		var i;

		for (i = 0; i < acc.length; i++) {
			if (acc[i].id != 'has_handler') {
				acc[i].id = 'has_handler';  // avoid duplicate handlers

				acc[i].addEventListener("click", function(evt) {
					// toggle active state for this panel and set display accordingly
					this.classList.toggle("active");
					
					panel = this.nextElementSibling;
					if (panel.style.display === "block") {
						panel.style.display = "none";
					} else {
						panel.style.display = "block";
					}

					// hide contents of any other open panels
					var activePanels = document.getElementsByClassName("active");
					for (var j = 0; j < activePanels.length; j++) {
						var activePanel = activePanels[j];
						if (activePanel != this) {
							activePanel.classList.remove("active");
							activePanel.nextElementSibling.style.display = "none";
						}
					}
				});
			}
		}		
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
		_clearWelcomeLetter();
		_generateWelcomeLetter();
	}
	
	function _studentMentorChange(evt) {
		settings.layouttype = evt.target.id

		if (page.courseselect.value == NO_COURSE) return;
		_clearWelcomeLetter();
		_generateWelcomeLetter();
	}
	
	function _termChange(evt) {
		settings.term = evt.target.id

		if (page.courseselect.value == NO_COURSE) return;
		_clearWelcomeLetter();
		_generateWelcomeLetter();
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
		settings.fulllayout = {
			"coursekey": "javascript",
			"fullname": "Advanced Web Design: JavaScript",
			"layout": {
				"generalfaq": "USE_DEFAULT",
				"specificfaq": "specificfaq_javascript.html"
			}
		};
		callback();
	}
	
	return {
		init: init
 	};
}();