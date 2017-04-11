$( function() {
    $( "#tabs" ).tabs();

    $( "canvas" ).fadeIn( 1000, function() {});
    
    $("#controls-toggle").click(function() {
        $("#tabs").slideToggle( "slow", function() {});
    });

    $("#info-box").hide();

    $("#info-toggle").click(function() {
      $("#info-box").slideToggle( "slow", function() {});
    });

  } );
