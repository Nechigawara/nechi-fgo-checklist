// Config
var icontype = ".png";
var icondefault = "default.png";
var icondefault_external_source = false;

var datapath = "data/servants.json";
var datapath_alternate = "data/servants.alternate.json";
var dataclasspath = "data/servantsclass.json";

var img_path = "img/servants/";
var img_class = "img-fluid";
var image_host = "https://i.imgur.com/";
var member_class_grid = "col-1 member-outer";
var member_class = "member-container";
var member_class_checked = "member-checked";
var capture_area = "capturearea";
var box_fake_subfix = "Fake";

var morecopy_text = "NP";
var morecopy_class = "member-np";
var morecopy_prefix = "np_";
var copy_choice_allow = [
	{ "id": 1, "text": "NP1" },
	{ "id": 2, "text": "NP2" },
	{ "id": 3, "text": "NP3" },
	{ "id": 4, "text": "NP4" },
	{ "id": 5, "text": "NP5" }
];
var copy_choice_default = 1;
var copy_choice_max = 5;
var share_tags = "FGO,FateGrandOrder";
var share_title = "See My Servants Here!!";

// Class Config
var class_divide_class = "ByClass";
var class_div_icon_class = "col-1";
var class_div_list_class = "col";
var class_img_path = "img/classes/";

// Servant Type
var servant_type_box_class = "member-type";
var sevent_typelist = [
	{ "id": 0, "show": false, "eventonly": false, "ctext": null, "class": null }, // Default
	{ "id": 1, "show": true, "eventonly": false, "ctext": '<i class="fas fa-lock"></i>', "class": "member-locked" }, // Story Locked
	{ "id": 2, "show": true, "eventonly": false, "ctext": '<i class="fas fa-star"></i>', "class": "member-limited" }, // Limited
	{ "id": 3, "show": true, "eventonly": true, "ctext": '<i class="fas fa-gift"></i>', "class": "member-eventonly" } // Event Prizes
];

// Confirm
var member_uncheck_conf = "Are you sure you want to uncheck this servant?";
var member_clear_conf = "Are you sure you want to clear all checked servants?";

// Share
var share_text = "This is your current shorted URL. Can't guarantee how long the shorted URL will last (Use free data storage service 😜).<br/>So please keep Full URL in a safe place (Bookmark, ETC.)."

// Statistic
var statistic_area = "statisticBox";

// Parameters
var raw_input_parameter = "raw";
var compress_input_parameter = "pak";
var short_input_parameter = "skey";
var fastmode_checkbox = "fastmode";
var fastmode_parameter = "fast";

var classmode_checkbox = "classmode";
var classmode_parameter = "classlist";

var mashuSR_checkbox = "mashuSR";
var mashuSR_parameter = "mashu";

// URL Shortend
var endpoint = "https://www.jsonstore.io/b79c0c8ea773aa05abd64a356b925c88703d6cbb40679791533b716810e77dc9";
var url_checkback_part = "/checkback/";
var url_data_part = "/data/";

var shortenLink_api = "http://tinyurl.com/api-create.php"

// Save & Load
var fast_mode_local = "fgo_fastmode";
var class_mode_local = "fgo_classmode";
var mashuSR_local = "fgo_mashu";

var list_local = "fgo_list";

var load_text = "List Data found on your current browser. Would you like to load it?";
var save_text = "Would you like to save current list data? This will overwrite the old data if exist.";

var load_fin_text = "List Loaded";
var save_fin_text = "List Saved";

var load_btn = "loadbutton";
var save_btn = "savebutton";

// Global Variables
var servants_data_list = {};
var class_data_list = {};
var user_data = {};
var rarity_count_data = {
	"allcount": {
		"max": 0,
		"have": 0,
		"list": {}
	},
	"noteventcount": {
		"max": 0,
		"have": 0,
		"list": {}
	}
};
var raw_user_input = "";
var compress_input = "";

var current_edit = "";
var current_edit_ele = null;

// Global Objects
var customAdapter = null;
var list_new = null;
var list_update = null;
var exisiting_hash = null;

// Set Up
$.ajaxSetup({
    beforeSend: function(xhr) {
        if (xhr.overrideMimeType) {
            xhr.overrideMimeType("application/json");
        }
    }
});

$.fn.select2.amd.define('select2/data/customAdapter', ['select2/data/array', 'select2/utils'],
    function (ArrayAdapter, Utils) {
        function CustomDataAdapter ($element, options) {
 	        CustomDataAdapter.__super__.constructor.call(this, $element, options);
        }
        Utils.Extend(CustomDataAdapter, ArrayAdapter);
		CustomDataAdapter.prototype.updateOptions = function (data) {
            this.$element.find('option').remove();
            this.addOptions(this.convertToOptions(data));
        }        
        return CustomDataAdapter;
    }
);

function orderKeys(not_sorted) {

  var sorted = Object.keys(not_sorted)
    .sort()
    .reduce(function (acc, key) { 
        acc[key] = not_sorted[key];
        return acc;
    }, {});
	return sorted;
}

// For Image Load
function loadSprite(src) {
    var deferred = $.Deferred();
    var sprite = new Image();
    sprite.onload = function() {
        deferred.resolve();
    };
    sprite.src = src;
    return deferred.promise();
}

// Select2 Source for lower
function getNewCopySource(current_max, s_list) {
	if (current_max < copy_choice_max && current_max > 0) {
		var new_choice_allow = [];
		for (var i = 0; i < copy_choice_allow.length; i++) {
			if (copy_choice_allow[i].id <= current_max) {
				new_choice_allow.push(copy_choice_allow[i]);
			}
			else {
				break;
			}
		}
		s_list.data('select2').dataAdapter.updateOptions(new_choice_allow);
	}
	else {
		s_list.data('select2').dataAdapter.updateOptions(copy_choice_allow);
	}
}

// For Image Part
function getImagePath(path, external_source) {
    if (external_source) {
        return path;
    } else {
        var urlBase = location.href.substring(0, location.href.lastIndexOf("/") + 1);
        return urlBase + img_path + path;
    }
}

function getImageClassPath(path) {
    var urlBase = location.href.substring(0, location.href.lastIndexOf("/") + 1);
    return urlBase + class_img_path + path;
}

// User Data Check
function getUserData(id) {
	if (typeof user_data[id] === "undefined") {
		return null;
	}
	return user_data[id];
}

// Convert Data
function ConvertUserDataToRawInput(input_data)
{
	var new_raw_input = "";
	for (var key in input_data) {
		if (input_data.hasOwnProperty(key)) {
			var current_user_data = input_data[key];
			new_raw_input += key + ">" + current_user_data + ",";
		}
	}
	new_raw_input = new_raw_input.slice(0, -1);
	return new_raw_input;
}

// FastMode Check
function IsFastmode() {
	var fastmode_enable = $('#' + fastmode_checkbox).is(':checked');
	return fastmode_enable;
}

// ClassMode Check
function IsClassmode() {
	var classmode_enable = $('#' + classmode_checkbox).is(':checked');
	return classmode_enable;
}

// ClassMode Check
function IsMashuSR() {
	var MashuIsSR = $('#' + mashuSR_checkbox).is(':checked');
	return MashuIsSR;
}

// Click Div
function memBerClick(s_element) {
	// Variable
	var id = $(s_element).attr("id");
	var name = $(s_element).data("original-title");
	// Fast Mode, Change Value Directly
	if (IsFastmode()) {
		// Change Value
		userDataUpdateFast(id, 1, s_element);
		// Stop
		return;
	}
	// Mark current_edit
	current_edit = id;
	current_edit_ele = s_element;
    var current_user_data = getUserData(id);
	var current_edit_max = servants_data_list[id].maxcopy;
	// New Check or Update
	if (current_user_data != null) {
		// Select 2
		getNewCopySource(current_edit_max, list_update);
		// Update Modal String
		$('#nameUpdate').html(name);
		// Reset Modal Choice to Current
		$('#npUpdate').val(current_user_data).trigger('change');
		// Show Update Check Modal
		$('#updateModal').modal('show');
	}
	else {
		// Select 2
		getNewCopySource(current_edit_max, list_new);
		// Update Modal String
		$('#nameAdd').html(name);
		// Reset Modal Choice to Default
		$('#npAdd').val(copy_choice_default).trigger('change');
		// Show New Check Modal
		$('#addModal').modal('show');
	}
}

// Click Div
function memBerRightClick(s_element) {
	// Fast Mode, Change Value Directly
	if (!IsFastmode()) {
		return;
	}
	// Variable
	var id = $(s_element).attr("id");
	var name = $(s_element).data("original-title");
	// Mark current_edit
	userDataUpdateFast(id, -1, s_element);
}

function userDataRemove() {
	// Prevent Blank Key
	if (current_edit == "" || current_edit_ele == null) {
		return;
	}
	// Confirm
	bootbox.confirm({
        message: member_uncheck_conf,
        buttons: {
            cancel: {
                label: '<i class="fa fa-times"></i> Cancel'
            },
            confirm: {
                label: '<i class="fa fa-check"></i> Confirm'
            }
        },
        callback: function (result) {
            if (result) {
				// Get UserData
				var current_user_data = getUserData(current_edit);
				// Delete User Data
				if (current_user_data != null) {
					delete user_data[current_edit];
				}
				// Update Count
				count_update(current_edit, -1);
				// Update Member Element
				$('#' + current_edit).removeClass(member_class_checked);
				// Update Value on List
				UpdateCopyVal(current_edit, 0, current_edit_ele);
				// Update Count
				// Hide Update Check Modal
				$('#updateModal').modal('hide');
				// Update Raw Input & URL
				updateCountHTML();
				UpdateURL();
				// clear current_edit
				current_edit = "";
			}
        }
    });
}

function count_update(id, val) {
	var current_edit_eventonly = servants_data_list[id].eventonly;
	var current_key = servants_data_list[id].key;
	// Update Count
	rarity_count_data.allcount.have += val;
	rarity_count_data.allcount.list[current_key].have += val;
	if (!current_edit_eventonly) {
		rarity_count_data.noteventcount.have += val;
		rarity_count_data.noteventcount.list[current_key].have += val;
	}
}

function userDataUpdateFast(id, val, s_element) {
	// Mark current_edit
    var current_user_data = getUserData(id);
	var current_edit_max = servants_data_list[id].maxcopy;
	// Prevent Over Data
	if (current_edit_max > copy_choice_max) {
		current_edit_max = copy_choice_max;
	}
	// New Check or Update
	if (current_user_data != null) {
		// Get New Value
		var new_val = current_user_data + val;
		if (new_val <= 0 || new_val > current_edit_max) {
			// Remove Instead
			// Update Member Element
			$(s_element).removeClass(member_class_checked);
			// Update Value on List
			UpdateCopyVal(id, 0, s_element);
			// Update Count
			count_update(id, -1);
			// Clear Number
			delete user_data[id];
		}
		else {
			// Update user data
			user_data[id] = new_val;
			// Update Value on List
			UpdateCopyVal(id, new_val, s_element);
		}
	}
	else {
		if (val <= 0) {
			// Add user data
			user_data[id] = current_edit_max;
			// Update Member Element
			$(s_element).addClass(member_class_checked);
			// Update Value on List
			UpdateCopyVal(id, user_data[id], s_element);
		}
		else {
			// Add user data
			user_data[id] = 1;
			// Update Count
			count_update(id, 1);
			// Update Member Element
			$(s_element).addClass(member_class_checked);
		}
	}
	// Update Raw Input & URL
	updateCountHTML();
	UpdateURL();
}

function userDataUpdate() {
	// Prevent Blank Key
	if (current_edit == "" || current_edit_ele == null) {
		return;
	}
	// Get UserData
	var current_user_data = getUserData(current_edit);
	// New Check or Update
	if (current_user_data != null) {
		// Get New Value
		var new_val = parseInt($('#npUpdate').val());
		// Update user data
		user_data[current_edit] = new_val;
		// Update Value on List
		UpdateCopyVal(current_edit, new_val, current_edit_ele);
		// Hide Update Check Modal
		$('#updateModal').modal('hide');
	}
	else {
		// Get Event
		var current_edit_eventonly = servants_data_list[current_edit].eventonly;
		// Get New Value
		var new_val = parseInt($('#npAdd').val());
		// Add user data
		user_data[current_edit] = new_val;
		// Update Count
		count_update(current_edit, 1);
		// Update Member Element
		$('#' + current_edit).addClass(member_class_checked);
		// Update Value on List
		UpdateCopyVal(current_edit, new_val, current_edit_ele);
		// Hide New Check Modal
		$('#addModal').modal('hide');
	}
	// Update Raw Input & URL
	updateCountHTML();
	UpdateURL();
	// clear current_edit
	current_edit = "";
}

function UpdateCopyVal(id, new_val, s_element) {
	// Prevent Blank Key
	if (id == "") {
		return;
	}
	// Update Value on List
	if (new_val > 1) {
		$(s_element).find('#' + morecopy_prefix + id).html(morecopy_text + new_val.toString());
	}
	else {
		$(s_element).find('#' + morecopy_prefix + id).html("");
	}
}

function getFastModeURLstring() {
	if (IsFastmode()) {
		return fastmode_parameter + "=1";
	}
	return "";
}

function getClassModeURLstring() {
	if (IsClassmode()) {
		return classmode_parameter + "=1";
	}
	return "";
}

function getMashuSRURLstring() {
	if (IsMashuSR()) {
		return mashuSR_parameter + "=1";
	}
	return "";
}


function UpdateURL() {
	// Sort Key First
	user_data = orderKeys(user_data);
	// Update Raw Input & URL
	raw_user_input = ConvertUserDataToRawInput(user_data);
	var new_parameter = "";
	// User Data
	if (raw_user_input != "") {
		if (!new_parameter.startsWith("?")) {
			new_parameter = "?";
		}
		else {
			new_parameter += "&";
		}
		// Compress
		compress_input = LZString.compressToEncodedURIComponent(raw_user_input);
		// Debug : Compressed Size Reduce //
		var decraese_len = raw_user_input.length - compress_input.length;
		console.log("Raw Size: " + raw_user_input.length);
		console.log("Compressed Size: " + compress_input.length);
		console.log("Compressed Size Reduce: " + decraese_len);
		// Put Param
		new_parameter += compress_input_parameter + "=" + compress_input;
		// Button
		$('#' + save_btn).prop('disabled', false);
	}
	else {
		compress_input = null;
		$('#' + save_btn).prop('disabled', true);
	}
	
	// Mashu is SR
	var mashuSR_str = getMashuSRURLstring();
	if (mashuSR_str != "") {
		if (!new_parameter.startsWith("?")) {
			new_parameter = "?";
		}
		else {
			new_parameter += "&";
		}
		new_parameter += mashuSR_str;
	}
	
	// Class Mode
	var classmode_str = getClassModeURLstring();
	if (classmode_str != "") {
		if (!new_parameter.startsWith("?")) {
			new_parameter = "?";
		}
		else {
			new_parameter += "&";
		}
		new_parameter += classmode_str;
	}
	
	// Fast Mode
	var fastmode_str = getFastModeURLstring();
	if (fastmode_str != "") {
		if (!new_parameter.startsWith("?")) {
			new_parameter = "?";
		}
		else {
			new_parameter += "&";
		}
		new_parameter += fastmode_str;
	}
	
	// Push URL
	var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + new_parameter;
    window.history.pushState({path:newurl},'',newurl);
	// Remove exisiting hash
	exisiting_hash = null;	
	// Return
	return true;
}

function UpdateURLOptionModeOnly() {
	// Get Search
	var url_part = window.location.search;
	var urlParams = null;
	
	// Option Check
	var mashuSR_str = getMashuSRURLstring();
	var mashuSR_input = "";
	
	var classmode_str = getClassModeURLstring();
	var classmode_input = "";
	
	var fastmode_str = getFastModeURLstring();
	var fastmode_input = "";
	
	// Mode String Founded
	if (mashuSR_str != "" || classmode_str != "" || fastmode_str != "") {
		if (url_part != "") {
			urlParams = new URLSearchParams(url_part);
			mashuSR_input = urlParams.get(mashuSR_parameter);
			classmode_input = urlParams.get(classmode_parameter);
			fastmode_input = urlParams.get(fastmode_parameter);
			if (mashuSR_input != null) {
				url_part = url_part.replace("&" + mashuSR_parameter + "=" + mashuSR_input,'');
				url_part = url_part.replace(mashuSR_parameter + "=" + mashuSR_input,'');
			}
			if (classmode_input != null) {
				url_part = url_part.replace("&" + classmode_parameter + "=" + classmode_input,'');
				url_part = url_part.replace(classmode_parameter + "=" + classmode_input,'');
			}
			if (fastmode_input != null) {
				url_part = url_part.replace("&" + fastmode_parameter + "=" + fastmode_input,'');
				url_part = url_part.replace(fastmode_parameter + "=" + fastmode_input,'');
			}
			// If not Blank, added &
			if (url_part != "?") {
				url_part += "&";
			}
		}
		else {
			url_part = "?";
		}
		
		// Finish Input
		var last_str = "";
		
		// Data Checked; mashu is SR
		if (mashuSR_str != "")
		{
			last_str += mashuSR_str;
			localStorage[mashuSR_local] = 1;
		}
		else
		{
			localStorage[mashuSR_local] = 0;
		}
		
		// Option Checked; Class Mode
		if (classmode_str != "")
		{
			if (last_str != "")
			{
				last_str += "&" + classmode_str;
			}
			else
			{
				last_str += classmode_str;
			}
			localStorage[class_mode_local] = 1;
		}
		else
		{
			localStorage[class_mode_local] = 0;
		}
		
		// Option Checked; Fast Mode
		if (fastmode_str != "")
		{
			if (last_str != "")
			{
				last_str += "&" + fastmode_str;
			}
			else
			{
				last_str += fastmode_str;
			}
			localStorage[fast_mode_local] = 1;
		}
		else
		{
			localStorage[fast_mode_local] = 0;
		}
		
		// Finish
		url_part += last_str;
	}
	else if (url_part != "") {
		urlParams = new URLSearchParams(url_part);
		mashuSR_input = urlParams.get(mashuSR_parameter);
		classmode_input = urlParams.get(classmode_parameter);
		fastmode_input = urlParams.get(fastmode_parameter);
		if (mashuSR_input != null) {
			url_part = url_part.replace("&" + mashuSR_parameter + "=" + mashuSR_input,'');
			url_part = url_part.replace(mashuSR_parameter + "=" + mashuSR_input,'');
		}
		if (classmode_input != null) {
			url_part = url_part.replace("&" + classmode_parameter + "=" + classmode_input,'');
			url_part = url_part.replace(classmode_parameter + "=" + classmode_input,'');
		}
		if (fastmode_input != null) {
			url_part = url_part.replace("&" + fastmode_parameter + "=" + fastmode_input,'');
			url_part = url_part.replace(fastmode_parameter + "=" + fastmode_input,'');
		}
		// Local Storage Option
		localStorage[mashuSR_local] = 0;
		localStorage[class_mode_local] = 0;
		localStorage[fast_mode_local] = 0;
	}
	else {
		// Local Storage Option
		localStorage[mashuSR_local] = 0;
		localStorage[class_mode_local] = 0;
		localStorage[fast_mode_local] = 0;
	}
	
	// if ? left, clean Up
	if (url_part == "?") {
		url_part = "";
	}
	
	// Push URL
	var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + url_part;
    window.history.pushState({path:newurl},'',newurl);
}

// Class Mode Change
function UpdateClassMode() {
	UpdateURLOptionModeOnly();
	finish_loading();
}

// Get compress_input
function get_compress_input()
{
	var MashuIsSR = getMashuSRURLstring();
	if (MashuIsSR)
	{
		return compress_input + "&" + MashuIsSR;
	}
	else
	{
		return compress_input;
	}
}

// Make Data
function MakeData(servants_data) {
	// Clear Tooltip
	$('[data-toggle="tooltip-member"]').tooltip('dispose');
	
	// Clear Contents
	$( ".listbox" ).html("");
	$( ".listbox_class" ).html("");
	//$( "." + morecopy_class).html("");
	morecopy_class
	rarity_count_data.allcount.max = 0;
	rarity_count_data.noteventcount.max = 0;
	rarity_count_data.allcount.have = 0;
	rarity_count_data.noteventcount.have = 0;
	
    // Draw Button & Create User Data
    var list_box = [];
    var list_img = [];
	
    // Add Default Photo
    var img_default = getImagePath(icondefault, icondefault_external_source);
    list_img.push(loadSprite(img_default));
	
    // Loop
    for (var aa = 0, ll = servants_data.length; aa < ll; aa++) {
        // list get
        var current_rarity = servants_data[aa];
		var current_key = current_rarity.list_id;
		// Skip if Disable
		if (current_rarity.disable) {
			continue;
		}
		// Count Data Prepare
		rarity_count_data.allcount.list[current_key] = {
			"list_element": current_rarity.list_element,
			"max": 0,
			"have": 0
		};
		rarity_count_data.noteventcount.list[current_key] = {
			"list_element": current_rarity.list_element,
			"max": 0,
			"have": 0
		};
		
		// Prepare Var for Member Loop
        var current_list = current_rarity.list;
        var current_element = "#" + current_rarity.list_element;
        var current_path = current_rarity.list_iconpath;
        //var current_html = "";
        list_box.push(current_element);
		
		// Class Mode; Prepare Element
		if (IsClassmode())
		{
			var list_class_available = current_rarity.class_available;
			var current_class_html = "";
			for (var bb = 0, bb_s = list_class_available.length; bb < bb_s; bb++) {
				// Class Var
				var current_class = list_class_available[bb];
				// Prepare Div
				current_class_html += '<div class="row">';
				current_class_html += '<div class="' + class_div_icon_class + '">';
				
				// Class Icon
				var current_class_data = class_data_list[current_class];
				var current_class_data_icn = getImageClassPath(current_class_data.iconlist[current_rarity.list_id]);
				list_img.push(loadSprite(current_class_data_icn));
				
				var current_class_data_icn_ele = '<img src="' + current_class_data_icn + '" class="' + img_class + '" title="' + current_class_data.name + '" data-toggle="tooltip-member" data-placement="bottom"/>';
				current_class_html += current_class_data_icn_ele;
				
				//current_class_html += current_class;  //Test
				current_class_html += "</div>";
				current_class_html += '<div class="row ' + class_div_list_class + '" id="' + current_rarity.list_element + '_' + current_class + '">';
				//current_class_html += current_class; //Test
				current_class_html += "</div>";
				current_class_html += "</div>";
				current_class_html += "<hr />";
				
			}
			// Update List Div
			$(current_element + "-" + class_divide_class).html(current_class_html);
		}

        // Loop List
        for (var i = 0, l = current_list.length; i < l; i++) {
            // Get Data
            var current_servant = current_list[i];
			var current_type = sevent_typelist[current_servant.stype];
			servants_data_list[current_servant.id] = current_list[i];
			servants_data_list[current_servant.id].key = current_key;
			servants_data_list[current_servant.id].eventonly = current_type.eventonly; 
			// Prepare
			var current_user_data = getUserData(current_servant.id);
            var current_servant_html = '<div class="' + member_class_grid + '"><div';
            var current_servant_class = ' class="' + member_class;
            var current_servant_img = '';
			// Count Data: All
			rarity_count_data.allcount.max += 1;
			rarity_count_data.allcount.list[current_key].max += 1;
			if (current_user_data != null) {
				rarity_count_data.allcount.have += 1;
				rarity_count_data.allcount.list[current_key].have += 1;
			}
			// Count Data: Exclude Event Prize
			if (!current_servant.eventonly) {
				rarity_count_data.noteventcount.max += 1;
				rarity_count_data.noteventcount.list[current_key].max += 1;
				if (current_user_data != null) {
					rarity_count_data.noteventcount.have += 1;
					rarity_count_data.noteventcount.list[current_key].have += 1;
				}
			}
            // Create Servant Element
            current_servant_html += ' id="' + current_servant.id + '" title="' + current_servant.name + '"';
			current_servant_html += ' data-toggle="tooltip-member" data-placement="bottom"';
			//current_servant_html += ' data-list_id="' + current_list.list_id + '" data-maxcopy="' + current_servant.maxcopy + '"';
			//current_servant_html += ' data-eventonly="' + current_servant.eventonly + '"';
            // Class
			if (current_user_data != null) {
				current_servant_class += ' ' + member_class_checked;
			}
            current_servant_html += current_servant_class + '"'
            // On Click Function
			//var escape_input_name = (current_servant.name.replace(/'/g, "\\'"));
            //var current_onclick = ' onclick="memBerClick(' + "'" + current_servant.id + "', '" + escape_input_name + "', this)" + '"';
            //current_servant_html += current_onclick;
			// On Context Function
			//var current_oncontext = ' oncontextmenu="memBerRightClick(' + "'" + current_servant.id + "', '" + escape_input_name + "', this);return false;" + '"';
            //current_servant_html += current_oncontext;
            // Close div open tags
            current_servant_html += '>';
            // Image
            if (current_servant.img == false) {
                current_servant_img = img_default;
            } else if (current_servant.imgpath == null) {
                current_servant_img = getImagePath(current_path + '/' + current_servant.id + icontype, false);
                list_img.push(loadSprite(current_servant_img));
            } else {
                current_servant_img = getImagePath(current_servant.imgpath, true);
                list_img.push(loadSprite(current_servant_img));
            }
            current_servant_html += '<img src="' + current_servant_img + '" class="' + img_class + '"/>';
            // Multiple Copy + Event Only Tag
            current_servant_html += '<div id="' + morecopy_prefix + current_servant.id + '" class="' + morecopy_class + '">';
			if (current_user_data != null) {
				if (current_user_data > 1) {
					current_servant_html += morecopy_text + current_user_data.toString();
				}
			}
            current_servant_html += '</div>';
			if (current_type.show) {
				current_servant_html += '<div class="' + servant_type_box_class + ' ' + current_type.class + '">'
				current_servant_html += current_type.ctext + '</div>';
			}
            // Close Element
            current_servant_html += '</div></div>';
            // Add to main list
			var item = $(current_servant_html);
			if (!IsClassmode())
			{
				$(current_element).append(item);
				//current_html += current_servant_html;
				// Bind Element 
				$(current_element).on("click", "#" + current_servant.id , function() {
					memBerClick(this);
				});	
				$(current_element).on("contextmenu", "#" + current_servant.id , function() {
					memBerRightClick(this);
					return false;
				});	
			}
			else
			{
				$(current_element + '_' + current_servant.class).append(item);
				// Bind Element 
				$(current_element + '_' + current_servant.class).on("click", "#" + current_servant.id , function() {
					memBerClick(this);
				});	
				$(current_element + '_' + current_servant.class).on("contextmenu", "#" + current_servant.id , function() {
					memBerRightClick(this);
					return false;
				});	
			}
			
        }
        // Update List Div
		//if (!IsClassmode())
		//{
		//	$(current_element).html(current_html);
		//}
    }
    // Refresh, Close Loading Modal
    $.when.apply(null, list_img).done(function() {
        for (var aa = 0, ll = list_box.length; aa < ll; aa++) {
            var current_box = list_box[aa];
            $(current_box + box_fake_subfix).hide();
			if (!IsClassmode())
			{
				$(current_box).show();
				$(current_box + "-" + class_divide_class).hide();
			}
			else
			{
				$(current_box + "-" + class_divide_class).show();
				$(current_box).hide();
			}
        }
		// Count
		updateCountHTML();
		//$("#" + statistic_area + box_fake_subfix).hide();
		$("#" + statistic_area).show();
		// ToolTip + Box
		$('[data-toggle="tooltip-member"]').tooltip();
        $('#loadingModal').modal('hide');
    });
}

// Update Count HTML
function updateCountHTML() {
	// All Rarity
	var AllPercent = Number(rarity_count_data.allcount.have / rarity_count_data.allcount.max * 100);
	$("#" + statistic_area + "AllMax").html(rarity_count_data.allcount.max);
	$("#" + statistic_area + "AllHave").html(rarity_count_data.allcount.have);
	$("#" + statistic_area + "AllPercent").html(parseFloat(Math.round(AllPercent * 100) / 100).toFixed(2));
	var NotEventPercent = Number(rarity_count_data.noteventcount.have / rarity_count_data.noteventcount.max * 100);
	$("#" + statistic_area + "NotEventMax").html(rarity_count_data.noteventcount.max);
	$("#" + statistic_area + "NotEventHave").html(rarity_count_data.noteventcount.have);
	$("#" + statistic_area + "NotEventPercent").html(parseFloat(Math.round(NotEventPercent * 100) / 100).toFixed(2));
	// Each Rarity
	for (var prop in rarity_count_data.allcount.list) {
        // skip loop if the property is from prototype
        if(!rarity_count_data.allcount.list.hasOwnProperty(prop)) continue;
		// all & notevent
		var r_allcount = rarity_count_data.allcount.list[prop];
		var r_AllPercent = Number(r_allcount.have / r_allcount.max * 100);
		$("#" + r_allcount.list_element + "AllMax").html(r_allcount.max);
		$("#" + r_allcount.list_element + "AllHave").html(r_allcount.have);
		$("#" + r_allcount.list_element + "AllPercent").html(parseFloat(Math.round(r_AllPercent * 100) / 100).toFixed(2));
		var r_noteventcount = rarity_count_data.noteventcount.list[prop];
		var r_NotEventPercent = Number(r_noteventcount.have / r_noteventcount.max * 100);
		$("#" + r_noteventcount.list_element + "NotEventMax").html(r_noteventcount.max);
		$("#" + r_noteventcount.list_element + "NotEventHave").html(r_noteventcount.have);
		$("#" + r_noteventcount.list_element + "NotEventPercent").html(parseFloat(Math.round(r_NotEventPercent * 100) / 100).toFixed(2));
    }
}

// Clear
function ClearAllData() {
	// Confirm
	bootbox.confirm({
        message: member_clear_conf,
        buttons: {
            cancel: {
                label: '<i class="fa fa-times"></i> Cancel'
            },
            confirm: {
                label: '<i class="fa fa-check"></i> Confirm'
            }
        },
        callback: function (result) {
            if (result) {
				// Remove all checked Element
				$('div.' + member_class_checked +' > div.' + morecopy_class).html('');
				$('div.' + member_class_checked).removeClass(member_class_checked);
				// Clear User Data
				user_data = {};
				// Update Raw Input & URL
				UpdateURL();
			}
        }
    });
}

// Export Canvas
function ExportCanvas() {
	// Confirm
	bootbox.confirm({
        message: "Warning, Image result will not look exact like in the page. Capture Library problems.<br/>I recommend sharing the link or use external capture tool intead.<br/>Continue?",
        buttons: {
            cancel: {
                label: '<i class="fa fa-times"></i> Cancel'
            },
            confirm: {
                label: '<i class="fa fa-check"></i> Confirm'
            }
        },
        callback: function (result) {
            if (result) {
				// Show Loading Modal
				$('#loadingModal').modal('show');
				html2canvas($('#' + capture_area)[0], { useCORS: true }).then(function(canvas) {
					// canvas is the final rendered <canvas> element
					var alink = document.createElement('a');
					// toDataURL defaults to png, so we need to request a jpeg, then convert for file download.
					alink.href = canvas.toDataURL("image/jpeg").replace("image/jpeg", "image/octet-stream");
					alink.download = 'fgo-checklist.jpg';
					//Firefox requires the link to be in the body
					document.body.appendChild(alink);
					alink.click();
					//remove the link when done
					document.body.removeChild(alink);
					// Close Loading Modal
					$('#loadingModal').modal('hide')
				});
			}
        }
    });
}

// Load
function loadLocalData() {
	// Confirm
	bootbox.confirm({
        message: load_text,
        buttons: {
            cancel: {
                label: '<i class="fa fa-times"></i> Cancel'
            },
            confirm: {
                label: '<i class="fa fa-check"></i> Confirm'
            }
        },
        callback: function (result) {
            if (result) {
				// Show Loading Modal
				$('#loadingModal').modal('show');
				// Load List
				compress_input = localStorage[list_local];
				raw_user_input = LZString.decompressFromEncodedURIComponent(compress_input);
				// Update HTML
				finish_loading();
				// Alert
				bootbox.alert(load_fin_text, null);
			}
			else {
				if (raw_user_input == null)
				{
					// Blank Raw
					raw_user_input = "";
					// Finish Loading
					finish_loading();
				}
			}
        }
    });
}

function saveLocalData() {
	// Update URL First
	UpdateURL();
	// Confirm if compress_input not null
	if (compress_input == null) return;
	// Confirm 
	bootbox.confirm({
        message: save_text,
        buttons: {
            cancel: {
                label: '<i class="fa fa-times"></i> Cancel'
            },
            confirm: {
                label: '<i class="fa fa-check"></i> Confirm'
            }
        },
        callback: function (result) {
            if (result) {
				localStorage[list_local] = compress_input;
				$('#' + load_btn).prop('disabled', false);
				bootbox.alert(save_fin_text, null);
			}
        }
    });
}

// Onload
$(document).ready(function() {
	// Show Loading Modal
    $('#loadingModal').modal('show');
	// URL Params
	var urlParams = new URLSearchParams(window.location.search);
	// URL Redirect; New
	var hashh = urlParams.get(short_input_parameter);
	if (hashh != null) {
		// New End Point
		$.getJSON(endpoint + url_data_part + hashh, function (data) {
			data = data["result"];
			if (data != null) {
				var new_url = window.location.protocol + "//" + window.location.host + window.location.pathname + "?" + compress_input_parameter + "=" + data;
				window.location.href = new_url; //Redirect
			}
			else {
				var new_url = window.location.protocol + "//" + window.location.host + window.location.pathname;
				window.location.href = new_url; //Redirect
			}
		});
		return;
	}
	// Prepare
	customAdapter = $.fn.select2.amd.require('select2/data/customAdapter');
	$('[data-toggle="tooltip"]').tooltip();
	// Select2
	list_new = $( "#npAdd" ).select2({
		theme: "bootstrap",
		dataAdapter: customAdapter,
		data: copy_choice_allow
	});
	list_update = $( "#npUpdate" ).select2({
		theme: "bootstrap",
		dataAdapter: customAdapter,
		data: copy_choice_allow
	});
	var MashuSR_input = urlParams.get(mashuSR_parameter);
	var fastmode_input = urlParams.get(fastmode_parameter);
	var classmode_input = urlParams.get(classmode_parameter);
	compress_input = urlParams.get(compress_input_parameter);
	
	// Mashu is SR
	if (MashuSR_input != null) {
		var Mashu_IS_SR = (parseInt(MashuSR_input) > 0);
		$('#' + mashuSR_checkbox).prop('checked', Mashu_IS_SR);
	}
	else {
		// ClassMode
		if (localStorage[mashuSR_local]) {
			var Mashu_IS_SR = (parseInt(localStorage[mashuSR_local]) > 0);
			$('#' + mashuSR_checkbox).prop('checked', Mashu_IS_SR);
		}
	}
	
	// ClassMode
	if (classmode_input != null) {
		var classmode_enable = (parseInt(classmode_input) > 0);
		$('#' + classmode_checkbox).prop('checked', classmode_enable);
	}
	else {
		// ClassMode
		if (localStorage[class_mode_local]) {
			var classmode_enable = (parseInt(localStorage[class_mode_local]) > 0);
			$('#' + classmode_checkbox).prop('checked', classmode_enable);
		}
	}
	
	// FastMode
	if (fastmode_input != null) {
		var fastmode_enable = (parseInt(fastmode_input) > 0);
		$('#' + fastmode_checkbox).prop('checked', fastmode_enable);
	}
	else {
		// FastMode
		if (localStorage[fast_mode_local]) {
			var fastmode_enable = (parseInt(localStorage[fast_mode_local]) > 0);
			$('#' + fastmode_checkbox).prop('checked', fastmode_enable);
		}
	}
	
	// Load From URL
	if (compress_input != null) {
		// List Reader
		raw_user_input = LZString.decompressFromEncodedURIComponent(compress_input);
		// Finish Loading
		finish_loading();
	}
	else {
		raw_user_input = urlParams.get(raw_input_parameter);
		if (raw_user_input != null) {
			// Finish Loading
			finish_loading();
		}
		else 
		{
			// List Reader
			if (localStorage[list_local]) {
				loadLocalData();
			}
			else {
				// Blank Raw
				raw_user_input = "";
				// Finish Loading
				finish_loading();
			}
		}
	}
	// Set Load Button Status
	if (localStorage[list_local]) {
		$('#' + load_btn).prop('disabled', false);
	}
	// Set Checkbox Event
	$('#' + fastmode_checkbox).change(function () {
		UpdateURLOptionModeOnly();
	});
	$('#' + classmode_checkbox).change(function () {
		UpdateClassMode();
	});
	$('#' + mashuSR_checkbox).change(function () {
		UpdateClassMode();
	});
	
	// Set Modal Closing Event
	$("#addModal").on("hidden.bs.modal", function () {
		current_edit = "";
		current_edit_ele = null;
	});
	$("#updateModal").on("hidden.bs.modal", function () {
		current_edit = "";
		current_edit_ele = null;
	});
});

function finish_loading() {
	// Clear Contents
	$( ".listbox" ).hide();
	$( ".listbox_class" ).hide();
	$( ".listbox_fake" ).show();
	// Convert User Data from Input
    var array_input = raw_user_input.split(",");
    for (var ii = 0, li = array_input.length; ii < li; ii++) {
        var current_split = array_input[ii].split(">");
		if (current_split[0] != "" && current_split[1] != "") {
			user_data[current_split[0]] = parseInt(current_split[1]);
		}
    }
	// Update URL
	UpdateURL();
    // Ajax; Class Data
	$.ajax({
        url: dataclasspath,
        contentType: "application/json",
        dataType: "json",
        cache: false,
        beforeSend: function(xhr) {
            if (xhr.overrideMimeType) {
                xhr.overrideMimeType("application/json");
            }
        },
        success: function(outer_result) {
			// Inject Class Data
			class_data_list = outer_result;
			// Ajax; Servant Data
            $.ajax({
				url: IsMashuSR()? datapath_alternate : datapath,
				contentType: "application/json",
				dataType: "json",
				cache: false,
				beforeSend: function(xhr) {
					if (xhr.overrideMimeType) {
						xhr.overrideMimeType("application/json");
					}
				},
				success: function(result) {
					// Load Data to Variable
					MakeData(result);
				},
				error: function(result) {
					// Alert
					alert("Not working!!");
					// Close Loading Modal
					$('#loadingModal').modal('hide')
				}
			});
        },
        error: function(result) {
            // Alert
            alert("Not working!!");
            // Close Loading Modal
            $('#loadingModal').modal('hide')
        }
    });
}

function ToggleEventIcon() {
	$("." + servant_type_box_class).toggle();
}

//=============================================================================================================================
// Short URL
//=============================================================================================================================
function shareURL(site) {
	$.get(
        shortenLink_api,
        {	url: window.location.href	},
        function(data){
            shareURL_Do(site, data);
        }
    );
	return false;
};


function shareURL_old(site) {
	var current_compress_input = get_compress_input();
	// Check for Existing Key
	$.getJSON(endpoint + "/checkback/" + current_compress_input, function (get_data) {
		exisiting_data = get_data["result"];
		if (exisiting_data != null) {
			var new_url = window.location.protocol + "//" + window.location.host + window.location.pathname + "?" + short_input_parameter + "=" + exisiting_data;
			shareURL_Do(site, new_url);
		}
		else {
			var key = getrandom_hash();
			$.ajax({
				'url': endpoint + url_data_part + key,
				'type': 'POST',
				'data': JSON.stringify(current_compress_input),
				'dataType': 'json',
				'contentType': 'application/json; charset=utf-8',
				'success': function(data){
					$.ajax({
						'url': endpoint + url_checkback_part + current_compress_input,
						'type': 'POST',
						'data': JSON.stringify(key),
						'dataType': 'json',
						'contentType': 'application/json; charset=utf-8',
						'success': function(data){
							var new_url = window.location.protocol + "//" + window.location.host + window.location.pathname + "?" + short_input_parameter + "=" + key;
							shareURL_Do(site, new_url);
						}
					});
				}
			});
		}
	});
	return false;
};

function shareURL_Do(site, short_url) {
	// Show
	if (site == "facebook") {
		// Share; Show Short URL
		showShortURL(short_url);
		// Share
		window.open("https://www.facebook.com/sharer.php?&u=" + short_url,"","menubar=0");
	}
	else if (site == "tumblr") {
		// Share; Show Short URL
		showShortURL(short_url);
		// Share
		window.open("https://www.tumblr.com/share?posttype=link&url=" + short_url + "&tags=" + share_tags + "&Title=" + share_title,"","menubar=0");
	}
	else if (site == "twitter") {
		// Share; Show Short URL
		showShortURL(short_url);
		// Share
		window.open("https://twitter.com/intent/tweet?url=" + short_url + "&text=" + share_title + "&hashtags=" + share_tags,"","menubar=0");
	}
	else {
		// Share; Show Short URL
		showShortURL(short_url);
	}
	return false;
};

// Share; Show Short URL
function showShortURL(url) {
	var msg = share_text + '<hr/><form><div class="form-group"><div class="input-group mb-3">';
	msg += '<input type="text" id="link-copy" class="form-control" value="' + url + '" readonly/>';
	msg += '<div class="input-group-append">'
	msg += '<button class="btn btn-outline-secondary" type="button" onclick="CopyToClipboard(' + "'link-copy'" +  ')">Copy</button>';
	msg += '</div></div></div></form>';
	var url_dialog = bootbox.dialog({
		message: msg
	});
	url_dialog.init(function(){});
}

function CopyToClipboard(s_element) {
	var copyText = document.querySelector("#" + s_element);
	copyText.select();
	document.execCommand("copy");
}

function getrandom_hash() {
	if (exisiting_hash != null) {
		return exisiting_hash;
	}
    exisiting_hash = Math.random().toString(32).substring(2, 5) + Math.random().toString(32).substring(2, 5);
	exisiting_hash += Math.random().toString(32).substring(2, 5) + Math.random().toString(32).substring(2, 5);
    return exisiting_hash;
}

function shorturl(val){
    var key = getrandom_hash();
    send_request(val, key);
	return window.location.protocol + "//" + window.location.host + window.location.pathname + "?" + short_input_parameter + "=" + key;
}

function send_request(val, key) {
    this.val_forshort = val;
	this.key_forshort = key;
    $.ajax({
        'url': endpoint + "/" + this.val_forshort,
        'type': 'POST',
        'data': JSON.stringify(this.url_forshort),
        'dataType': 'json',
        'contentType': 'application/json; charset=utf-8'
	});
}
