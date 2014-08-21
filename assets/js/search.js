  $(document).ready(
    function(){

      function getRollcalls(){
        $.ajax({
          type: "POST",
          url: "/api/search/",
          data: $('#faceted-search-form').serialize(),
          beforeSend:function(){
            $('#results-list').html('<div class="loading"><h2>Loading...</h2><img src="{{ STATIC_URL }}img/loading.gif" alt="Loading..." /></div>');
          },
          success: function(msg) {
            $("#results-list").html(msg);
           }
          });
        }

        getRollcalls();

        $("#faceted-search-form input:not(#searchTextInput), #sorting-select").change(function() {
          console.log("cacapis");
            getRollcalls();
        });

        // Prevent to do a AJAX call everytime we update the search bar
        $("#faceted-search-form").submit(function(event) {
          event.preventDefault();
          getRollcalls();
        });

        // Toggle panel icons
        function toggleChevron(e) {
            $(e.target)
                .prev('.panel-heading')
                .find('i.indicator')
                .toggleClass('glyphicon-chevron-down glyphicon-chevron-up');
        }
        $('.panel').on('hidden.bs.collapse', toggleChevron);
        $('.panel').on('shown.bs.collapse', toggleChevron);


        // If any panel has data display it
        if($('#facet-chamber input[type=checkbox]:checked').length) {
          $("#facet-chamber").collapse('show');
        }
        if($('#facet-clausen input[type=checkbox]:checked').length) {
          $("#facet-clausen").collapse('show');
        }
        if($('#facet-peltzman input[type=checkbox]:checked').length) {
          $("#facet-peltzman").collapse('show');
        }
        if($('#fromDate').val()  || $("#toDate").val()) {
          $("#facet-date").collapse('show');
        }
        if($('#fromSession').val()  || $("#toSession").val()) {
          $("#facet-session").collapse('show');
        }
  });
