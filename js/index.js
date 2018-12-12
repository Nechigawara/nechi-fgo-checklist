// Config
var icontype = ".png";
var icondefault = "default.png";
var icondefault_external_source = false;
var datapath = "data/servants.json";
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

// Confirm
var member_uncheck_conf = "Are you sure you want to uncheck this servant?";
var member_clear_conf = "Are you sure you want to clear all checked servants?";

// Share
var share_text = "This is your current shortend URL. Can't gurantee how long the shortend URL will last (Use free data storage service 😜).<br/>So please keep Full URL in a safe place (Bookmark, ETC.)."

// Statistic
var statistic_area = "statisticBox";

// Parameters
var raw_input_parameter = "raw";
var compress_input_parameter = "pak";
var short_input_parameter = "ss";
var fastmode_checkbox = "fastmode";
var fastmode_parameter = "fast";

// URL Shortend
var endpoint = "https://www.jsonstore.io/670d4eb30d66f9c2e775017731c9822f49adf477ac6571edb7185d174c8219e4";

// Global Variables
var servants_data = null;
var user_data = {};
var rarity_count_data = {
	"allcount": {
		"max": 0,
		"have": 0
	},
	"noteventcount": {
		"max": 0,
		"have": 0
	}
};
var raw_user_input = "";
var current_edit = "";

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

// Click Div
function memBerClick(id, name, s_element) {
	// Fast Mode, Change Value Directly
	if (IsFastmode()) {
		// Change Value
		userDataUpdateFast(id, 1, s_element);
		// Stop
		return;
	}
	// Mark current_edit
	current_edit = id;
    var current_user_data = getUserData(id);
	var current_edit_max = parseInt($(s_element).data("maxcopy"));
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
function memBerRightClick(id, name, s_element) {
	// Fast Mode, Change Value Directly
	if (!IsFastmode()) {
		return;
	}
	// Mark current_edit
	userDataUpdateFast(id, -1, s_element);
}

function userDataRemove() {
	// Prevent Blank Key
	if (current_edit == "") {
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
				// Update Member Element
				$('#' + current_edit).removeClass(member_class_checked);
				// Update Value on List
				UpdateCopyVal(current_edit, 0);
				// Hide Update Check Modal
				$('#updateModal').modal('hide');
				// Update Raw Input & URL
				UpdateURL();
				// clear current_edit
				current_edit = "";
			}
        }
    });
}

function userDataUpdateFast(id, val, s_element) {
	// Mark current_edit
    var current_user_data = getUserData(id);
	var current_edit_max = parseInt($(s_element).data("maxcopy"));
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
			$('#' + id).removeClass(member_class_checked);
			// Update Value on List
			UpdateCopyVal(id, 0);
			delete user_data[id];
		}
		else {
			// Update user data
			user_data[id] = new_val;
			// Update Value on List
			UpdateCopyVal(id, new_val);
		}
	}
	else {
		if (val <= 0) {
			// Add user data
			user_data[id] = current_edit_max;
			// Update Member Element
			$('#' + id).addClass(member_class_checked);
			// Update Value on List
			UpdateCopyVal(id, user_data[id]);
		}
		else {
			// Add user data
			user_data[id] = 1;
			// Update Member Element
			$('#' + id).addClass(member_class_checked);
		}
	}
	// Update Raw Input & URL
	UpdateURL();
}

function userDataUpdate() {
	// Prevent Blank Key
	if (current_edit == "") {
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
		UpdateCopyVal(current_edit, new_val);
		// Hide Update Check Modal
		$('#updateModal').modal('hide');
	}
	else {
		// Get New Value
		var new_val = parseInt($('#npAdd').val());
		// Add user data
		user_data[current_edit] = new_val;
		// Update Member Element
		$('#' + current_edit).addClass(member_class_checked);
		// Update Value on List
		UpdateCopyVal(current_edit, new_val);
		// Hide New Check Modal
		$('#addModal').modal('hide');
	}
	// Update Raw Input & URL
	UpdateURL();
	// clear current_edit
	current_edit = "";
}

function UpdateCopyVal(id, new_val) {
	// Prevent Blank Key
	if (id == "") {
		return;
	}
	// Update Value on List
	if (new_val > 1) {
		$('#' + morecopy_prefix + id).html(morecopy_text + new_val.toString());
	}
	else {
		$('#' + morecopy_prefix + id).html("");
	}
}

function getFastModeURLstring() {
	if (IsFastmode()) {
		return fastmode_parameter + "=1";
	}
	return "";
}

function UpdateURL() {
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
		var compress_input = LZString.compressToEncodedURIComponent(raw_user_input);
		// Debug : Compressed Size Reduce //
		var decraese_len = raw_user_input.length - compress_input.length;
		console.log("Raw Size: " + raw_user_input.length);
		console.log("Compressed Size: " + compress_input.length);
		console.log("Compressed Size Reduce: " + decraese_len);
		// Put Param
		new_parameter += compress_input_parameter + "=" + compress_input;
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

function UpdateURLFastModeOnly() {
	// Get Search
	var url_part = window.location.search;
	var urlParams = null;
	// Fast Mode
	var fastmode_str = getFastModeURLstring();
	var fastmode_input = "";
	if (fastmode_str != "") {
		if (url_part != "") {
			urlParams = new URLSearchParams(url_part);
			fastmode_input = urlParams.get(fastmode_parameter);
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
		url_part += fastmode_str;
	}
	else if (url_part != "") {
		urlParams = new URLSearchParams(url_part);
		fastmode_input = urlParams.get(fastmode_parameter);
		if (fastmode_input != null) {
			url_part = url_part.replace("&" + fastmode_parameter + "=" + fastmode_input,'');
			url_part = url_part.replace(fastmode_parameter + "=" + fastmode_input,'');
		}
		// if ? left, clean Up
		if (url_part == "?") {
			url_part = "";
		}
	}
	// Push URL
	var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + url_part;
    window.history.pushState({path:newurl},'',newurl);
}

// Make Data
function MakeData() {
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
		// Skip if Disable
		if (current_rarity.disable) {
			continue;
		}
		// Prepare
        var current_list = current_rarity.list;
        var current_element = "#" + current_rarity.list_element;
        var current_path = current_rarity.list_iconpath;
        var current_html = "";
        list_box.push(current_element);
        // Loop List
        for (var i = 0, l = current_list.length; i < l; i++) {
            // Prepare
            var current_servant = current_list[i];
			var current_user_data = getUserData(current_servant.id);
            var current_servant_html = '<div class="' + member_class_grid + '"><div';
            var current_servant_class = ' class="' + member_class;
            var current_servant_img = '';
			// Count Data: All
			rarity_count_data.allcount += 1;
			if (current_user_data != null) {
				rarity_count_data.have += 1;
			}
			// Count Data: Exclude Event Prize
			
            // Create Servant Element
            current_servant_html += ' id="' + current_servant.id + '" title="' + current_servant.name + '"';
			current_servant_html += ' data-toggle="tooltip-member" data-placement="bottom"';
			current_servant_html += ' data-list_id="' + current_list.list_id + '" data-maxcopy="' + current_servant.maxcopy + '"';
			current_servant_html += ' data-eventonly="' + current_servant.eventonly + '"';
            // Class
			if (current_user_data != null) {
				current_servant_class += ' ' + member_class_checked;
			}
            current_servant_html += current_servant_class + '"'
            // On Click Function
			var escape_input_name = (current_servant.name.replace(/'/g, "\\'"));
            var current_onclick = ' onclick="memBerClick(' + "'" + current_servant.id + "', '" + escape_input_name + "', this)" + '"';
            current_servant_html += current_onclick;
			// On Context Function
			var current_oncontext = ' oncontextmenu="memBerRightClick(' + "'" + current_servant.id + "', '" + escape_input_name + "', this);return false;" + '"';
            current_servant_html += current_oncontext;
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
            // Multiple Copy Text
            current_servant_html += '<div id="' + morecopy_prefix + current_servant.id + '" class="' + morecopy_class + '">';
			if (current_user_data != null) {
				if (current_user_data > 1) {
					current_servant_html += morecopy_text + current_user_data.toString();
				}
			}
            current_servant_html += '</div>';
            // Close Element
            current_servant_html += '</div></div>';
            // Add to main list
            current_html += current_servant_html;
        }
        // Update List Div
        $(current_element).html(current_html);
    }
    // Refresh, Close Loading Modal
    $.when.apply(null, list_img).done(function() {
        for (var aa = 0, ll = list_box.length; aa < ll; aa++) {
            var current_box = list_box[aa];
            $(current_box + box_fake_subfix).hide();
            $(current_box).show();
        }
		$('[data-toggle="tooltip-member"]').tooltip();
        $('#loadingModal').modal('hide');
    });
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

// Share
function shareURL(site) {
	// Get URL
	var currentURL = window.location.href;
	if (site == "facebook") {
		window.open("https://www.facebook.com/sharer.php?&u=" + currentURL,"","menubar=0");
	}
	else if (site == "tumblr") {
		// Shortend URL
		var short_url = shorturl(currentURL);
		// Share; Show Short URL
		showShortURL(short_url);
		// Share
		window.open("https://www.tumblr.com/share?posttype=link&url=" + short_url + "&tags=" + share_tags + "&Title=" + share_title,"","menubar=0");
	}
	else if (site == "twitter") {
		// Shortend URL
		var short_url = shorturl(currentURL);
		// Share; Show Short URL
		showShortURL(short_url);
		// Share
		var short_url = shorturl(currentURL);
		window.open("https://twitter.com/intent/tweet?url=" + short_url + "&text=" + share_title + "&hashtags=" + share_tags,"","menubar=0");
	}
	else {
		// Shortend URL
		var short_url = shorturl(currentURL);
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

// Onload
$(document).ready(function() {
	// Show Loading Modal
    $('#loadingModal').modal('show');
	// URL Params
	var urlParams = new URLSearchParams(window.location.search);
	// URL Redirect
	var hashh = urlParams.get(short_input_parameter);
	if (hashh != null) {
		$.getJSON(endpoint + "/" + hashh, function (data) {
			data = data["result"];
			if (data != null) {
				window.location.href = data; //Redirect
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
	// FastMode
	var fastmode_input = urlParams.get(fastmode_parameter);
	if (fastmode_input != null) {
		var fastmode_enable = (parseInt(fastmode_input) > 0);
		$('#' + fastmode_checkbox).prop('checked', fastmode_enable);
	}
	// Set Checkbox Event
	$('#' + fastmode_checkbox).change(function () {
		UpdateURLFastModeOnly();
	});
    // URL Reader
	var compress_input = urlParams.get(compress_input_parameter);
	if (compress_input != null) {
		raw_user_input = LZString.decompressFromEncodedURIComponent(compress_input);
	}
	else {
		raw_user_input = urlParams.get(raw_input_parameter);
		if (raw_user_input == null) {
			raw_user_input = "";
		}
	}
	// Convert User Data from Input
    var array_input = raw_user_input.split(",");
    for (var ii = 0, li = array_input.length; ii < li; ii++) {
        var current_split = array_input[ii].split(">");
		if (current_split[0] != "" && current_split[1] != "") {
			user_data[current_split[0]] = parseInt(current_split[1]);
		}
    }
    // Ajax
    $.ajax({
        url: datapath,
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
            servants_data = result;
            MakeData();
        },
        error: function(result) {
            // Alert
            alert("Not working!!");
            // Close Loading Modal
            $('#loadingModal').modal('hide')
        }
    });
});

//=============================================================================================================================
// Short URL
//=============================================================================================================================
function getrandom_hash() {
	if (exisiting_hash != null) {
		return exisiting_hash;
	}
    exisiting_hash = Math.random().toString(32).substring(2, 5) + Math.random().toString(32).substring(2, 5);
	exisiting_hash += Math.random().toString(32).substring(2, 5) + Math.random().toString(32).substring(2, 5);
    return exisiting_hash;
}

function shorturl(longurl){
    var key = getrandom_hash();
    send_request(longurl, key);
	return window.location.protocol + "//" + window.location.host + window.location.pathname + "?" + short_input_parameter + "=" + key;
}

function send_request(url, key) {
    this.url_forshort = url;
	this.key_forshort = key;
    $.ajax({
        'url': endpoint + "/" + this.key_forshort,
        'type': 'POST',
        'data': JSON.stringify(this.url_forshort),
        'dataType': 'json',
        'contentType': 'application/json; charset=utf-8'
	});
}
