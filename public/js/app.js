$(document).on("click", "#saveListing", function() {
    var thisId = $(this).attr('data-id');
    var link = $(this).attr('link');
    // $("#buttons" + thisId).html("<span class='glyphicon glyphicon-ok'/>");
    $.ajax({
        method: 'GET',
        url: '/saved'
    }).then(function(data) {
        var linksArray = [];
        for (var i = 0, n = data.length; i < n; i++) {
            linksArray.push(data[i].link);
        }
        if (linksArray.indexOf(link) == -1) {
            $.ajax({
                method: 'POST',
                url: '/saves/' + thisId
            }).then(function() {
                // window.location='/';
            });
            window.location = '/';
        } else {
            $('#duplicationForm').attr('action', '/remove/' + thisId);
            $('#duplicationModal').modal('show');
        }
    });
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
    window.location = '/saves';
});

$('#notesModal').on('show.bs.modal', function(event) {
    var button = $(event.relatedTarget); // Button that triggered the modal
    var recipient = button.data('whatever'); // Extract info from data-* attributes
    // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
    var modal = $(this);
    modal.find('.modal-title').text('Notes for Listing ' + recipient);
    modal.find('#noteForm').attr('action', '/notes/' + recipient);
    // modal.find('#noteSubmit').attr('data-id', recipient);
    // modal.find('.modal-body input').val(recipient)

    // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
    $.getJSON('/saved/' + recipient, function(data) {
        $('#notes').empty();
        // $('#notes').html('<br>');
        for (var i = 0, n = data.note.length; i < n; i++) {
            $('#notes').append(`
  				<p id="individualNote">${data.note[i].body}<button type="button" id="noteDelete" class="btn btn-danger" data-id=${data.note[i]._id}>Delete</button></p>
  			`);
        }
    });
});

$(document).on("click", "#noteDelete", function() {
    var thisId = $(this).attr('data-id');
    // $("#buttons" + thisId).html("<span class='glyphicon glyphicon-ok'/>");
    $.ajax({
        method: 'GET',
        url: '/erase/' + thisId
    }).then(function() {
        // window.location='/saves';
    });
    window.location = '/saves';
});
