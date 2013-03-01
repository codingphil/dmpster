var holder = document.getElementById('holder'); 
var	support = {
	filereader : document.getElementById('filereader'),
	formdata : document.getElementById('formdata'),
	progress : document.getElementById('progress')
};
var acceptedTypes = {
	'image/png' : true,
	'image/jpeg' : true,
	'image/gif' : true
};
var progress = document.getElementById('uploadprogress');
var fileupload = document.getElementById('upload');

function readfiles(files) {
	var formData = new FormData();
	for ( var i = 0; i < files.length; i++) {
		formData.append('file', files[i]);
		var file = files[i];
		//holder.innerHTML = 'Uploading ' + file.name + ' ('
		//	+ (file.size ? (file.size / (1024 * 1024) | 0) + 'MB' : '') + ')...';
		console.log(file);
	}

	// now post a new XHR request
	var xhr = new XMLHttpRequest();
	xhr.open('POST', '/upload');
	xhr.onload = function() {

	};

	xhr.send(formData);

}

holder.ondragover = function() {
	this.className = 'dragging';
	return false;
};
holder.ondragend = function() {
	this.className = '';
	return false;
};
holder.ondrop = function(e) {
	this.className = '';
	e.preventDefault();
	readfiles(e.dataTransfer.files);
}
