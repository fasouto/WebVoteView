  $(document).ready(
    function(){


        // function triggerDownload(){
        //   // $("#download-rollcalls-form").submit();
        //   console.log($('#download-rollcalls-form').serialize());

        //   $.post('download/');
        // }
            // function(retData) {
            //  $("body").append("<iframe src='" + retData.url+ "' style='display: none;' ></iframe>");
            // }); 

            //   $.ajax({
            //       url: "download/",
            //       data: $('#download-rollcalls-form').serialize(),
            //       function(retData) {
            //         var iframe = document.createElement("iframe");
            //         iframe.setAttribute("src", retData.url);
            //         iframe.setAttribute("style", "display: none");
            //         document.body.appendChild(iframe);
            //       }); 
            //     });
          // }


        // $("#download-btn").click(function(){
          // console.log("as");
          // triggerDownload();
             // $.ajax({
             //    type: "GET",
             //    url: "download",
             //  });
        // });


      function getRollcalls(){
        $.ajax({
          // type: "POST",
          url: "/api/search/",
          data: $('#faceted-search-form').serialize(),
          beforeSend:function(){
            $('#results-list').html('<div class="loading"><h2>Loading...</h2><img src="{{ STATIC_URL }}img/loading.gif" alt="Loading..." /></div>');
          },
          success: function(msg) {
            $("#results-list").html(msg);
           }
          });
          $("#download-btn").hide();
        }

        getRollcalls();

        $("#faceted-search-form input:not(#searchTextInput), #sorting-select").change(function() {
            getRollcalls();
        });

        // Prevent to do a AJAX call everytime we update the search bar
        $("#faceted-search-form").submit(function(event) {
          console.log(event);
          event.preventDefault();
          getRollcalls();
        });

        // Display the download excel button
        $(document.body).on("change", "#download-rollcalls-form :input", function() {
          showDownload();
        });

        function showDownload () {
          if ($("#download-rollcalls-form input:checkbox:checked").length > 0) {
              $("#download-btn").show();
          }
          else {
            console.log("pirate");
              $("#download-btn").hide();
          }
        }



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
