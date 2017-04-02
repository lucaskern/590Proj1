$( function() {
    $( "#tabs" ).tabs();

    $("#controls-toggle").click(function() {
        $("#tabs").toggle();
    });

    $("#info-box").hide();

    $("#info-toggle").click(function() {
      $("#info-box").toggle();
    });
  } );
