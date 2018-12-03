// Config
var icontype = ".png";
var icondefault = "default.png";
var datapath = "data/servants.json";
var imgpath = "img/servants/";
// Variables
var servants_data = null;
var user_data = {};
// Set Up
$.ajaxSetup(
{
	beforeSend: function(xhr){
		if (xhr.overrideMimeType)
		{
			xhr.overrideMimeType("application/json");
		}
	}
});

// Onload
$(document).ready(function(){
	// Show Loading Modal
	$('#loadingModal').modal('show')
	// URL Reader
	
	// Ajax
	$.ajax({
		url: datapath, 
		contentType: "application/json",
		dataType: "json",
		cache : false,
		beforeSend: function(xhr){
			if (xhr.overrideMimeType)
			{
				xhr.overrideMimeType("application/json");
			}
		},
		success: function(result) {
			// Load Data to Variable
			servants_data = result;
			// Loop Draw Button & Create User Data
			var current_list = null;
			// SSR
			current_list = servants_data.ssr;
			for (var i = 0, l = current_list.length; i < l; i++) {
				var current_servant = current_list[i];
				//console.log(current_servant);
			}
			// Close Loading Modal
			$('#loadingModal').modal('hide')
		},
		error: function(result) {
			// Alert
			alert("Not working!!");
			// Close Loading Modal
			$('#loadingModal').modal('hide')
		}
	});
});