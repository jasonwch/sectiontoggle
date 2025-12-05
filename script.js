
//jQuery( document ).ready(function() {
jQuery (function() {

function escapeRegExp (expr) {   
  return expr.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&'); 
}

// Mark headers between stoggle_exclude_start and stoggle_exclude_end as excluded
// Also mark headers outside <!-- wikipage start/stop --> or inside <!-- TOC START/END -->
// Also exclude headers inside comment_wrapper divs
function markExcludedHeaders() {
  var inExcludeZone = false;
  var inWikipage = false;
  var inTOC = false;
  var inCommentWrapper = false;
  
  // Get all elements in document order within the content area
  var contentArea = jQuery('#dokuwiki__content').first();
  if (contentArea.length === 0) {
    contentArea = jQuery('body');
  }
  
  // Walk through all nodes (including comment nodes) to find markers
  function walkNodes(node) {
    var child = node.firstChild;
    while (child) {
      // Check for HTML comments
      if (child.nodeType === 8) { // Node.COMMENT_NODE
        var commentText = child.nodeValue.trim();
        
        // Check for wikipage markers
        if (commentText === 'wikipage start') {
          inWikipage = true;
        } else if (commentText === 'wikipage stop') {
          inWikipage = false;
        }
        // Check for TOC markers
        else if (commentText === 'TOC START') {
          inTOC = true;
        } else if (commentText === 'TOC END') {
          inTOC = false;
        }
      }
      // Check for element nodes
      else if (child.nodeType === 1) { // Node.ELEMENT_NODE
        // Optimization: Use native DOM API instead of jQuery for performance
        
        // Check for stoggle exclude markers
        if (child.classList.contains('stoggle_exclude_start')) {
          inExcludeZone = true;
        } else if (child.classList.contains('stoggle_exclude_end')) {
          inExcludeZone = false;
        }
        
        // Check for comment_wrapper div (track entry and exit)
        if (child.classList.contains('comment_wrapper')) {
          inCommentWrapper = true;
          // Process children of comment_wrapper
          walkNodes(child);
          inCommentWrapper = false;
          // Skip to next sibling without processing children again
          child = child.nextSibling;
          continue;
        }
        
        // Mark headers that should not be collapsed:
        // Check if it is a header (H1-H6)
        if (/^H[1-6]$/.test(child.tagName)) {
          if (inExcludeZone || !inWikipage || inTOC || inCommentWrapper) {
            child.classList.add('stoggle_no_collapse');
          }
        }
        
        // Recursively walk child nodes
        walkNodes(child);
      }
      
      child = child.nextSibling;
    }
  }
  
  // Start walking from the content area
  contentArea.each(function() {
    walkNodes(this);
  });
}

// Run the marking function
markExcludedHeaders();

 if(JSINFO['se_actual_tpl'] == 'icke-template'  && !JSINFO['se_suspend']) {	   
     icke_OnMobileFix();
  }
  if(JSINFO['se_suspend']) {
         if (jQuery('p.sectoggle').length > 0){
          jQuery('p.sectoggle').hide();
       }
        SectionToggle.is_active = false;
    }
    else {
            if(JSINFO['se_device'])  {
                SectionToggle.device_class =  JSINFO['se_device'];
            }
   

            SectionToggle.check_status();

            if(!SectionToggle.is_active) {
                 if (jQuery('p.sectoggle').length > 0){
                      jQuery('p.sectoggle').hide();
                   }                  
            }
          
if(SectionToggle.is_active && !JSINFO['toc_xcl']) {
jQuery("ul.toc li div.li a, ul.toc li a").click(function(){
      // Use the actual href attribute to get the correct header ID
      // This fixes issues where DokuWiki's sectionID() generates IDs differently
      var href = jQuery(this).attr('href');
      var id = href ? href : '';
      
      // Fallback to text-based ID if href is not available
      if (!id || !id.startsWith('#')) {
          var text = jQuery(this).text();
          text = text.toLowerCase();
          text = text.replace(/\s/g, "_");
          id = '#' + text;
      }
      
      var idWithoutHash = id.replace(/^#/, '').toLowerCase();
      if(SectionToggle.toc_xcl.indexOf(idWithoutHash) > -1) return;
      
      jQuery(id).toggleClass('st_closed st_opened');
      jQuery(id).next().toggle()
}); 
}          
         // Optimization: Use native forEach instead of jQuery.each
         // Cache h_ini_open for repeated use
         var hIniOpen = JSINFO['h_ini_open'] || '';
         
         // Safety check: ensure headers is an array before iterating
         if (!Array.isArray(SectionToggle.headers)) return;
         
         SectionToggle.headers.forEach(function(elem, index) {         
               // Optimization: Native check for next element
               if (!elem.nextElementSibling) return;
               
		       // Skip headers marked for no collapse
		       if(elem.classList.contains("stoggle_no_collapse")) return;
		 
		       var skip = false;
               // Optimization: Native textContent is faster than innerHTML for text
               var hash = elem.textContent.replace(/\s/g, "_"); 
               var hashLower = hash.toLowerCase();
               
               // Use header's actual id attribute for comparison with URL hash
               // This fixes redirect after section edit - DokuWiki uses sectionID() which
               // generates IDs differently than simple text replacement
               var headerId = elem.id ? elem.id.toLowerCase() : '';
               
		       if(hashLower == SectionToggle.hash || headerId == SectionToggle.hash || (hIniOpen && RegExp('\\b' + escapeRegExp(hashLower) + '\\b').test(hIniOpen))) {
                   skip = true;
               }
			   else if(SectionToggle.hash && (hashLower.indexOf(SectionToggle.hash) === 0 || (headerId && headerId.indexOf(SectionToggle.hash) === 0))) {
				   skip = true;
		       }
	
               // Optimization: Native check for content
               var nextSib = elem.nextElementSibling;
               if(SectionToggle.is_active && /\w/.test(nextSib.textContent))  {
                   elem.onclick = function() {
                       SectionToggle.checkheader(elem, index);
                   };     
          
                   elem.style.cursor = 'pointer';
                   // Optimization: Native classList
                   elem.classList.add('st_closed', 'header__' + index);
                
                   if(skip) {
                       // Optimization: Native classList
                       elem.classList.remove('st_closed');
                       elem.classList.add('st_opened');
                   }   
               
                   /* add toggle icon and hide data below this header */
				
				   /* correct closing except toggle class headers - Jason */
				   if (elem.className && !elem.className.match(/toggle/)) {
                       // Optimization: Native style toggle
                       nextSib.style.display = 'none';
                       if(skip) nextSib.style.display = '';
                   }
               }
        });
        
        // Optimization: Move open_all call outside the loop - only call once
        if(JSINFO['start_open']) {
            SectionToggle.open_all();
        }
    }
});
var SectionToggle = {
  checkheader: function (el, index) {
    var classes = el.className;
    if (!classes || !classes.match(/(header__\d+)/)) return;

    // Optimization: Native class and style manipulation
    el.classList.toggle("st_closed");
    el.classList.toggle("st_opened");
    
    // Toggle next sibling visibility
    var next = el.nextElementSibling;
    if (next) {
      next.style.display = next.style.display === 'none' ? '' : 'none';
    }
  },

  open_all: function () {
    // Optimization: Use native forEach and style manipulation
    var headers = this.headers;
    for (var i = 0; i < headers.length; i++) {
      var elem = headers[i];
      if (
        elem.className &&
        !elem.className.match(/toggle/) &&
        !elem.classList.contains("stoggle_no_collapse")
      ) {
        elem.classList.remove("st_closed");
        elem.classList.add("st_opened");
        // Optimization: Native style manipulation
        if (elem.nextElementSibling) {
          elem.nextElementSibling.style.display = '';
        }
      }
    }
  },

  close_all: function () {
    // Optimization: Use native for loop and style manipulation
    var headers = this.headers;
    for (var i = 0; i < headers.length; i++) {
      var elem = headers[i];
      /* correct closing except toggle class headers - Jason */
      if (
        elem.className &&
        !elem.className.match(/toggle/) &&
        !elem.classList.contains("stoggle_no_collapse")
      ) {
        elem.classList.remove("st_opened");
        elem.classList.add("st_closed");
        // Optimization: Native style manipulation
        if (elem.nextElementSibling) {
          elem.nextElementSibling.style.display = 'none';
        }
      }
    }
  },
  check_status: function () {
    if (JSINFO.se_platform == "n") return;
    if (JSINFO.se_act != "show") return;
    if (JSINFO.se_platform == "a") {
      this.is_active = true;
    } else if (JSINFO.se_platform == "m" && this.device_class.match(/mobile/)) {
      this.is_active = true;
    }

    if (this.is_active) {
      /*normalize url hash */
      if (window.location.hash) {
        SectionToggle.hash = window.location.hash.toLowerCase();
        SectionToggle.hash = SectionToggle.hash.replace(/#/, "");
        SectionToggle.hash = SectionToggle.hash.replace(/\s/g, "_");
      }
      this.set_headers();
    }
  },

  set_headers: function () {
    var nheaders = parseInt(JSINFO["se_headers"]) + 1;
    var toc_headers_xcl = "";
    var xclheaders = new Array(0, 0, 0, 0, 0, 0, 0);
    if (JSINFO["se_xcl_headers"]) {
      xcl = JSINFO["se_xcl_headers"].split(",");
      for (var i = 0; i < xcl.length; i++) {
        xclheaders[xcl[i]] = 1;
      }
    }

    var which_id = "#dokuwiki__content";
    if (JSINFO["se_name"] != "_empty_" && JSINFO["se_template"] == "other") {
      which_id = JSINFO["se_name"];
    }
    which_id = "div " + which_id;
    var id_string = "";

    if (jQuery(which_id).length == 0) {
      JSINFO["no_ini"] = 1;
    }

    // JSINFO['no_ini'] = 1;
    if (JSINFO["no_ini"]) {
      var headerElements = [];
      // Optimization: Use native querySelectorAll for better performance
      var allHeaders = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      
      for (var i = 0; i < allHeaders.length; i++) {
        var elem = allHeaders[i];
        var tagName = elem.tagName.toLowerCase();
        var level = parseInt(tagName.substring(1));
        
        if (level > JSINFO["se_headers"] || xclheaders[level]) continue;
        // Skip headers marked for exclusion
        if (elem.classList.contains('stoggle_no_collapse')) continue;
        
        if (elem.className) {
           if (elem.className.match(/sr-only|toggle/)) continue;
        }
        
        headerElements.push(elem);
      }
      this.headers = headerElements;
      return;
    }

    for (var i = 1; i < nheaders; i++) {
      if (xclheaders[i]) {
        this.toc_xcl += which_id + " h" + i + ",";
        continue;
      }
      id_string += which_id + " h" + i;
      if (i < nheaders - 1) id_string += ",";
    }
    id_string = id_string.replace(/,+$/, "");
    
    // Optimization: Convert selector string to element array
    if (id_string) {
        this.headers = jQuery(id_string).toArray();
    } else {
        this.headers = [];
    }

    this.toc_xcl = this.toc_xcl.replace(/,+$/, "");
    jQuery(this.toc_xcl).each(function (index, elem) {
      var id = jQuery(this).attr("id");
      if (id) {
        id = id.replace(/\s/g, "_");
        toc_headers_xcl += id + ",";
      }
    });

    this.toc_xcl = ">>" + toc_headers_xcl;
    //console.log(this.toc_xcl);
  },
  updateSections: function () {
    if (this.toggleState === "open") {
      this.close_all();
      this.toggleState = "close";
    } else {
      this.open_all();
      this.toggleState = "open";
    }
  },

  toggleState: "open",
  headers: [],
  toc_xcl: "",
  device_class: "desktop",
  is_active: false,
  hash: "",
};
function icke_OnMobileFix() {
	if(JSINFO['se_platform'] != 'm' && JSINFO['se_platform'] != 'a') return; 
	var MOBILE_WIDTH = 600;
	var SHALLOWST_SECTION_TO_HIDE = 2;
	var DEEPEST_SECTION_TO_HIDE = 6;
	
	if (window.innerWidth <= MOBILE_WIDTH) {
		var page = document.querySelector('div.page');
		if (!page) return;
		
		// Build selector for all levels at once
		var levelSelectors = [];
		var headerSelectors = [];
		for (var i = SHALLOWST_SECTION_TO_HIDE; i < DEEPEST_SECTION_TO_HIDE; i++) {
			levelSelectors.push('div.level' + i);
			headerSelectors.push('h' + i);
		}
		
		// Show all level divs
		var levelDivs = page.querySelectorAll(levelSelectors.join(','));
		for (var j = 0; j < levelDivs.length; j++) {
			levelDivs[j].style.display = '';
		}
		
		// Use event delegation for headers
		var headers = page.querySelectorAll(headerSelectors.join(','));
		for (var k = 0; k < headers.length; k++) {
			headers[k].onclick = function() {
				var nextDiv = this.nextElementSibling;
				if (nextDiv && nextDiv.tagName === 'DIV') {
					nextDiv.style.display = nextDiv.style.display === 'none' ? '' : 'none';
				}
			};
		}
	}
};

