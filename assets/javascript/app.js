$(document).ready(function () {
  //Global Variables...there's so many!
  var apiKey = 'AIzaSyB7BePjH92WwSeZl2wQPVJQ8ZDeoFtbeYs';

  var googleMaps = `<iframe width="700" height="550" src="https://www.google.com/maps/embed/v1/place?key=AIzaSyBCEE2nzor1sZUz0mC6-wKUXjQEEdEORbU&q=Movie+theaters+near+me" allowfullscreen></iframe>`;

  var uTellyKey = "QnaLbSwHjRmsh0e5QANPxCLNN3wPp16dkM2jsnqXMkveQwmkxF";

  var tmdbApiKey = 'api_key=0c9ebd7d6e76fc10f179166f9acd0665';

  var tmdbImgUrl = 'https://image.tmdb.org/t/p/w185';

  var topTvURL = "https://api.themoviedb.org/3/tv/popular?api_key=0c9ebd7d6e76fc10f179166f9acd0665&language=en-US&page=";

  var moviesURL = "https://api.themoviedb.org/3/movie/now_playing?api_key=0c9ebd7d6e76fc10f179166f9acd0665&language=en-US&page=";

  var topMoviesUrl = "https://api.themoviedb.org/3/discover/movie?api_key=0c9ebd7d6e76fc10f179166f9acd0665&language=en-US&region=us&vote_count.gte=5000&sort_by=vote_average.desc&include_adult=false&include_video=false&page=";

  var uTellyURL = "https://utelly-tv-shows-and-movies-availability-v1.p.mashape.com/lookup?&country=us&term=";

  var searchMovieUrl = "https://api.themoviedb.org/3/search/movie?api_key=0c9ebd7d6e76fc10f179166f9acd0665&language=en-US&page=1&include_adult=false&region=US&query=";

  var searchTvUrl = "https://api.themoviedb.org/3/search/tv?api_key=0c9ebd7d6e76fc10f179166f9acd0665&language=en-US&page=1&include_adult=false&region=US&query=";

  var pageInteger = 1;

  var pageNumber = pageInteger.toString();


  var onScreen = "now playing";

  //on page load:
  nowPlaying(pageNumber, moviesURL);
  scrollPop();

  //In Theaters Now
  $("#test1").on("click", function (event) {
    event.preventDefault();
    onScreen = "now playing"
    pageNumber = "1";
    $("#videos-display").empty();
    var tmdbApiKey = 'api_key=0c9ebd7d6e76fc10f179166f9acd0665';
    var tmdbImgUrl = 'https://image.tmdb.org/t/p/w185';
    nowPlaying(pageNumber, moviesURL);

    $("#videos-display").append(posterImg);

  });

  $(document).on("click", "#maps", function () {
    $("#modal1").empty();
    $("#modal1").html(googleMaps);
  });

  //Top Movies
  $("#test2").on("click", function (event) {
    event.preventDefault();
    onScreen = "top movies"
    $("#videos-display").empty();
    pageNumber = "1";
    var tmdbApiKey = 'api_key=0c9ebd7d6e76fc10f179166f9acd0665';
    var tmdbImgUrl = 'https://image.tmdb.org/t/p/w185';
    topMovies(pageNumber, topMoviesUrl);
  });

  //Popular on TV
  $("#test3").on("click", function (event) {
    event.preventDefault();
    $("#videos-display").empty();
    onScreen = "tv";
    pageNumber = "1";
    topTv(pageNumber, topTvURL);
  });

  //Click a poster, get the trailers in a modal!
  $(document).on("click", '.movie-poster', function () {
    $("#modal1").empty();
    var movieTitle = $(this).data('title');
    var parsedTitle = movieTitle.replace(/\s/g, "+");
    var queryTitle = parsedTitle.toLowerCase();
    $.ajax({
      url: `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${queryTitle}+official+trailer&maxResults=3&key=${apiKey}`,
      type: "GET",
    }).then(function (response) {
      for (i = 0; i < response.items.length; i++) {
        var videoId = response.items[i].id.videoId;
        var baseUrl = 'https://www.youtube.com/embed/';
        var embedVideo = `<iframe id="ytplayer" type="text/html" width="640" height="360"src="${baseUrl + videoId}"></iframe>`;
        $("#modal1").append(embedVideo);
      }
    });
  });

  //Click 'can I stream this?'
  $(document).on("click", '.streamable', function () {
    var unparsedTitle = $(this).data('title');
    var parsedShowTitle = unparsedTitle.replace(/\s/g, "+");
    var queryShowTitle = parsedShowTitle.toLowerCase();
    var divId = document.getElementById('streaming-services-' + unparsedTitle);
    $(divId).empty();
    $(divId).append('<p>Loading...<p>');
    $.ajax({
      url: uTellyURL + queryShowTitle,
      method: "GET",
      headers: {
        'X-Mashape-Key': uTellyKey,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    }).then(function (response) {
      $(divId).empty();
      if (response.results.length > 0) {
        $(divId).append("<p>Available on: </p>");
        for (var i = 0; i < response.results[0].locations.length; i++) {
          var streamIcon = `
          <img class = "responsive-img stream-icon" src="${response.results[0].locations[i].icon}">`;
          $(divId).append(streamIcon);
        }
        $('.card-reveal').animate({ scrollTop: $('.card-reveal').height() + $('.card-reveal').height() }, 500);
      }
      if (response.results.length === 0) {
        $(divId).html("<p>Unfortunately, this isn't available on any streaming platforms at this time. </p>");
        $('.card-reveal').animate({ scrollTop: $('.card-reveal').height() + $('.card-reveal').height() }, 500);
      }
    });
  });

  //Search button 
  $('#search-btn').on("click", function (event) {
    event.preventDefault();
    onScreen = "nope"
    var userSearch = $('#search').val();
    var parsedSearch = userSearch.replace(/\s/g, "+");
    var querySearch = parsedSearch.toLowerCase();
    var searchMovie = searchMovieUrl + querySearch;
    var region = "&region=us"
    $("#search").val('');
    $("#videos-display").empty();
    topMovies(region, searchMovie)
    topTv(region, searchTvUrl)
  });

//Functions
  function nowPlaying(page, apiUrl) {
        //Populates what's in theaters
        $.ajax({
          url: apiUrl + page,
          method: "GET"
        }).then(function (response) {
          for (var i = 0; i < response.results.length; i++) {
            var title = response.results[i].title;
            var posterPath = tmdbImgUrl + response.results[i].poster_path;
            if (posterPath.includes('null') === true){
              posterPath = "assets/images/placeholder.jpg";
            }
            var posterImg = `
            <div class="poster-container">
              <div class="card">
                <div class="card-image waves-effect waves-block waves-light">
                  <img class="modal-trigger movie-poster" data-title = "${title}" src="${posterPath}" href="#modal1">
                  <a href="http://www.google.com" style="position:absolute;right:5px;bottom:5px" class="star-btn btn-floating yellow darken-1"><i class="material-icons">star_border</i></a>
                </div>
                <div class="card-content">
                  <span class="card-title activator grey-text text-darken-4">
                    <div id="modal-btn-container">
                    <a id="modal-btn" class="waves-effect waves-light btn modal-trigger" href="#modal1">${title}</a>
                    <i id="more-vert-btn" class="material-icons right">more_vert</i>
                    </div>
                  </span>
                </div>
                <div id = "${title}" class="card-reveal">
                  <span class="card-title grey-text text-darken-4">${title}<i class="material-icons right">close</i></span>
                  <p>${response.results[i].overview}</p>
                  <br>
                  <a id="maps" class="btn modal-trigger waves-effect waves-light" href="#modal1">Theaters Nearby</a>
                </div>
              </div>
            </div>`;
    
            $("#maps").on("click", function () {
              $("#modal1").empty();
              $("#modal1").html(googleMaps);
            });
    
            $("#videos-display").append(posterImg);         
          }
        });
  };

  function topMovies(page, apiUrl) {
    //Populates top movies
    $.ajax({
      url: apiUrl + page,
      method: "GET"
    }).then(function (response) {
      console.log(response);
      console.log(response.results[0].poster_path);
      for (var i = 0; i < response.results.length; i++) {
        console.log(response.results[i].title);
        var posterPath = tmdbImgUrl + response.results[i].poster_path;
        if (posterPath.includes('null') === true){
          posterPath = "assets/images/placeholder.jpg";
        }
        var posterImg = `
          <div class="poster-container">
            <div class="card">
              <div class="card-image waves-effect waves-block waves-light">
                <img class="modal-trigger movie-poster" data-title = "${response.results[i].title}" src="${posterPath}" href="#modal1">
                <a href="http://www.google.com" style="position:absolute;right:5px;bottom:5px" class="star-btn btn-floating yellow darken-1"><i class="material-icons">star_border</i></a>
              </div>
              <div class="card-content">
                <span class="card-title activator grey-text text-darken-4">
                  <div id="modal-btn-container">
                  <a id="modal-btn" class="waves-effect waves-light btn modal-trigger" href="#modal1">${response.results[i].title}</a>
                  <i id="more-vert-btn" class="material-icons right">more_vert</i>
                  </div>
                </span>
              </div>
              <div id = "${response.results[i].title}" class="card-reveal">
                <span class="card-title grey-text text-darken-4">${response.results[i].title}<i class="material-icons right">close</i></span>
                <p>${response.results[i].overview}</p>
                <br>
                <a data-title = "${response.results[i].title}" class="btn waves-effect waves-light streamable">Can I stream this?</a>
                <div id = "streaming-services-${response.results[i].title}"></div>
              </div>
            </div>
          </div>`;

        $("#videos-display").append(posterImg);
      }
    });


};

  function topTv(page, apiUrl) {
        //Populates TV shows on screen
        $.ajax({
          url: apiUrl + page,
          method: "GET"
        }).then(function (response) {
          for (var i = 0; i < response.results.length; i++) {
            title = response.results[i].name
            var posterPath = tmdbImgUrl + response.results[i].poster_path;
            if (posterPath.includes('null') === true){
              posterPath = "assets/images/placeholder.jpg";
            }
            var posterImg = `
              <div class="poster-container">
                <div class="card">
                  <div class="card-image waves-effect waves-block waves-light">
                    <img class="modal-trigger movie-poster" data-title = "${title}" src="${posterPath}" href="#modal1">
                    <a href="http://www.google.com" style="position:absolute;right:5px;bottom:5px" class="star-btn btn-floating yellow darken-1"><i class="material-icons">star_border</i></a>
                  </div>
                  <div class="card-content">
                    <span class="card-title activator grey-text text-darken-4">
                      <div id="modal-btn-container">
                      <a id="modal-btn" class="waves-effect waves-light btn modal-trigger" href="#modal1">${title}</a>
                      <i id="more-vert-btn" class="material-icons right">more_vert</i>
                    </div>
                  </span>
                </div>
                <div id = "${title}" class="card-reveal">
                  <span class="card-title grey-text text-darken-4">${title}<i class="material-icons right">close</i></span>
                  <p>${response.results[i].overview}</p>
                  <br>
                  <a data-title = "${title}" class="btn waves-effect waves-light streamable">Can I stream this?</a>
                  <div id = "streaming-services-${title}"></div>
                </div>
              </div>
            </div>`;
    
            $("#videos-display").append(posterImg);
          }
        });
  }

  function scrollPop() {
    $(window).scroll(function() {
      if($(window).scrollTop() + $(window).height() == $(document).height()) {
          pageInteger++;
          pageNumber = pageInteger.toString();
          if (onScreen === "now playing") {nowPlaying(pageNumber, moviesURL)}
          if (onScreen === "top movies") {topMovies(pageNumber, topMoviesUrl)}
          if (onScreen === "tv") {topTv(pageNumber, topTvURL)}  
      }
   });
  }

});
