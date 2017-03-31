$( function() {
    $( "#tabs" ).tabs();
  
    $("#controls-toggle").click(function() {
        $("#tabs").toggle();
    });
  } );
