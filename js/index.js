// Config
var icontype = ".png";
var icondefault = "default.png";
var icondefault_external_source = false;
var datapath = "data/servants.json";
var img_path = "img/servants/";
var img_class = "img-responsive";
var member_class = "col-sm-1 member-container";
var member_class_checked = "member-checked";
var member_uncheck_conf = "Are you sure you want to uncheck this servant?";
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
var raw_input_parameter = "raw";

// Global Variables
var servants_data = null;
var user_data = {};
var raw_user_input = "";
var current_edit = "";

// Set Up
$.ajaxSetup({
    beforeSend: function(xhr) {
        if (xhr.overrideMimeType) {
            xhr.overrideMimeType("application/json");
        }
    }
});

// URL Parameter
function getUrlParameter(sParam) {
    var sPageURL = window.location.search.substring(1),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
        }
    }
	return "";
};

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

// Click Div
function memBerClick(id, name) {
	// Mark current_edit
	current_edit = id;
    var current_user_data = getUserData(id);
	// New Check or Update
	if (current_user_data != null) {
		// Update Modal String
		$('#nameUpdate').html(name);
		// Reset Modal Choice to Current
		$('#npUpdate').val(current_user_data).trigger('change');
		// Show Update Check Modal
		$('#updateModal').modal('show');
	}
	else {
		// Update Modal String
		$('#nameAdd').html(name);
		// Reset Modal Choice to Default
		$('#npAdd').val(copy_choice_default).trigger('change');
		// Show New Check Modal
		$('#addModal').modal('show');
	}
}

function userDataRemove() {
	// Prevent Blank Key
	if (current_edit == "") {
		return;
	}
	// Confirm
	if (window.confirm(member_uncheck_conf + ": " + $('#nameUpdate').html())) {
		// Do Nothing
    } else {
        return;
    }
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

function UpdateURL() {
	// Update Raw Input & URL
	raw_user_input = ConvertUserDataToRawInput(user_data);
	var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + "?" + raw_input_parameter + "=" + raw_user_input;
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
            var current_servant_html = '<div ';
            var current_servant_class = ' class="' + member_class;
            var current_servant_img = '';
            // Create Servant Element
            current_servant_html += ' id="' + current_servant.id + '" title="' + current_servant.name + '"';
            // Class
			if (current_user_data != null) {
				current_servant_class += ' ' + member_class_checked;
			}
            current_servant_html += current_servant_class + '"'
            // On Click Function
			var escape_input_name = (current_servant.name.replace(/'/g, "\\'"));
            var current_onclick = ' onclick="memBerClick(' + "'" + current_servant.id + "', '" + escape_input_name + "')" + '"';
            current_servant_html += current_onclick;
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
            current_servant_html += '</div>';
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
        $('#loadingModal').modal('hide');
    });
}

// Onload
$(document).ready(function() {
    // Show Loading Modal
    $('#loadingModal').modal('show');
	// Select2
	$( "#npAdd" ).select2({
		theme: "bootstrap",
		data: copy_choice_allow
	});
	$( "#npUpdate" ).select2({
		theme: "bootstrap",
		data: copy_choice_allow
	});
    // URL Reader
    raw_user_input = getUrlParameter(raw_input_parameter);
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