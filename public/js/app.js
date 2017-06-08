$(document).on("click", "#saveListing", function() {
	var thisId = $(this).attr('data-id');
	// $("#buttons" + thisId).html("<span class='glyphicon glyphicon-ok'/>");
	$.ajax({
		method: 'POST',
		url: '/saves/' + thisId
	}).then(function() {
		// window.location='/';
	});
	window.location='/';
});

$(document).on("click", "#deleteListing", function() {
	var thisId = $(this).attr('data-id');
	// $("#buttons" + thisId).html("<span class='glyphicon glyphicon-ok'/>");
	$.ajax({
		method: 'GET',
		url: '/delete/' + thisId
	}).then(function() {
		// window.location='/saves';
	});
	window.location='/saves';
});

$('#myModal').on('show.bs.modal', function (event) {
  var button = $(event.relatedTarget); // Button that triggered the modal
  var recipient = button.data('whatever'); // Extract info from data-* attributes
  // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
  var modal = $(this);
  modal.find('.modal-title').text('Notes for Listing ' + recipient);
  // modal.find('.modal-body input').val(recipient)
  // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
});