// JamendoMood functions
// version: 0.1 beta
// date: April 2013
// author: Antonio Nardone
// License: GNU General Public License, version 3 (GPL-3.0)
//
// Feel free to use it
//
//

//global variables
var start = 0;

//moods (tags search definition)
var tags = new Array(1);
tags[0] = 'jazz';
tags[1] = 'blues';
tags[2] = 'rnb';
tags[3] = 'funk';

tags[4] = 'disco';
tags[5] = 'dance';
tags[6] = 'hiphop';
tags[7] = 'techno';

tags[8] = 'rock';
tags[9] = 'metal';
tags[10] = 'punk';
tags[11] = 'ska';

tags[12] = 'easylistening';
tags[13] = 'lounge';
tags[14] = 'folk';
tags[15] = 'latin';

//data arrays  
var tag = 0;
var tracks = new Array(1);
var songs = new Array(1);
var artists = new Array(1);
var covers = new Array(1);
var downloads = new Array(1);
var played = new Array(1);
var licences = new Array(1);
var artists_id = new Array(1);
var locations_lat = new Array(1);
var locations_long = new Array(1);
var current = 0;
var myFix;
var mood;
var moodtags;
var ordine = 'listens_week_desc';
var filter = 'listen';
var a;
var isInfo = false;
var google_key = "AIzaSyCY_wFl0zI5Q35TVJuEtASBgFBMSMp9z7I";

//Audio player settings
$(function(){
		// Setup the player to autoplay the next track
       a = audiojs.createAll({
          trackEnded: function() {
		  	++current;
			if ( current > 49 ){
				current = 10;
			}
			$('.songs').css('background','#000');
			$('#song_' + current).css('background','#555');
			var track = tracks[current];
			var song = "'" + songs[current] + "'" + "<br>" + artists[current];
			$('#currentSong').html(song);
			$('#currentCover').css('background','url(' + covers[current] + ') no-repeat center center');
            audio.load(tracks[current]);
            audio.play();
          }
        });
        
});


//Reset the search filter and reinitialize variables
function resetFilter(filtro){
	filter = filtro;
	moodtags = [];
	tag = 0;
	tracks = [];
	songs = [];
	artists = [];
	covers = [];
	downloads = [];
	played = [];
	artists_id = [];
	locations_lat = [];
	locations_long = [];
	
	current = 0;
	$('#Content_1').hide();
	$('#loading').show();
		for ( var i = 0; i < 4 ; i++ ){
			moodtags[i] = tags[i + ( 4*mood )];
		}
		console.log ( moodtags[moodtags.length-1] );
	document.location = "#page1";
	getTop();
}	

//start searching using jamendo API
function getTop(){
	//setting mood filter 
	var ordine;
	if ( filter == 'listen' ){
		ordine = 'listens_week_desc';
		$('#filtro').html('Top 10 Listened');
	}
	if ( filter == 'popular' ){
		ordine = 'popularity_week_desc';
		$('#filtro').html('Top 10 Popular');
	}
	if ( filter == 'download' ){
		ordine = 'downloads_week_desc';
		$('#filtro').html('Top 10 Downloaded');
	}
	if ( filter == 'new' ){
		ordine = 'releasedate_desc';
		$('#filtro').html('Last 10 New Entry');
	}
	
	//calling tracks api
	var script = document.createElement("script");
       script.src ='http://api.jamendo.com/v3.0/tracks/?client_id=f985bf2a'
		+ '&format=json'
		+ '&offset=' + start
		+ '&limit=10'
		+ '&fuzzytags=' + moodtags[tag]
		+ '&speed=medium+high+veryhigh'
		+ '&imagesize=50'
		+ '&include=licenses+musicinfo+stats'
		+ '&order=' + ordine
		+ '&groupby=&callback=createTop';
        script.type = "text/javascript";
        document.getElementsByTagName("head")[0].appendChild(script);
}

//get the tracks api result and create my content
function createTop(root){
	var entries = root.results.length;
	var testo = '';
	// saving data to arrays
	for ( var i = 0 ; i < entries ; i++ ){
		var n = i+(10*(tag+1));
		console.log ( "indice > " + n ) 
		var artist  = root.results[i].artist_name;
		artists[i+(10*(tag+1))] = artist;
		artists_id[i+(10*(tag+1))] = root.results[i].artist_id;
		var album = root.results[i].album_name;
		var song = root.results[i].name;
		songs[i+(10*(tag+1))] = song;
		var downloaded = root.results[i].stats.downloads;
		downloads[i+(10*(tag+1))] = downloaded;
		var played_this = root.results[i].stats.listens;
		played[i+(10*(tag+1))] = played_this;
		var licence = root.results[i].licence_ccurl;
		licences[i+(10*(tag+1))] = licence;
		tracks[i+(10*(tag+1))] = root.results[i].audio;
		var likes = root.results[i].stats.listens;
		//create html row
		var cover = "<div style='height:50px;margin-bottom:5px;background:#000;padding:3px;cursor:pointer' class='songs' id='song_" + n + "' onclick='playTrack(" + (i+(10*(tag+1))) + ")'><img src='" + root.results[i].album_image + "' style='width:50px;float:left;border-radius:5px;margin-right:5px;cursor:pointer' title='Listen'>";
		covers[i+(10*(tag+1))] = root.results[i].album_image;
		testo = testo + cover + '<strong style="font-size:12px">' + song + '</strong><br>' + artist +'<br><span style="color:#eaeaea">Downloads:[' + downloaded + ']&nbsp;Played: [' + played_this + ']</span></div><div style="clear:both"></div>';
	}
	$('#top_' + tag).html ( testo );
	$('#chart_' + tag).html (tags[tag + ( 4*mood )]);
	if ( tag < (moodtags.length-1) ){
		$('#loaded').html( moodtags[tag] + " charts loaded");
		// load and play first track founded
		if ( tag == 0 ){
			current = 10;
			$('#song_' + current).css('background','#555');
			loadMP3();
		}
		++tag;
		getTop();
	} else {
		$('#banner').html ( "Demo by Swina Allen" );
		$('#loading').hide();
		$('#Content_1').show();
	}
}

//update screen based on selected track
function playTrack(indice){
	current = indice;
	artista = artists_id[indice];
	$('.songs').css('background','#000');
	$('#song_' + indice).css('background','#555');
	
	//play track
	loadMP3();
	
	//load artist info
	getArtistInfo(artista);
}

//play track
function loadMP3(){

	//update bottom player info (album image, track title, artist name)
	var track = tracks[current];
	var song = "'" + songs[current] + "'" + "<br>" + artists[current];
	$('#currentSong').html(song);
	$('#currentCover').css('background','url(' + covers[current] + ') no-repeat center center');

	//load and play track
    var audio = a[0];
    audio.load(track);
	audio.play();
}

//call artist jamendo API 3.0 
function getArtistInfo(id){
	var script = document.createElement("script");
       script.src ='http://api.jamendo.com/v3.0/artists/locations?client_id=f985bf2a'
	    + '&id=' + id
		+ '&format=json&callback=artistLocation';
        script.type = "text/javascript";
        document.getElementsByTagName("head")[0].appendChild(script);
}


//get artist info result for the selected track
function artistLocation(root){
	var longitudine = root.results[0].locations[0].longitude;
	var latitudine = root.results[0].locations[0].latitude;
	var country = root.results[0].locations[0].country;
	var city = root.results[0].locations[0].city;
	var artista = root.results[0].name;
	var image = root.results[0].image;
	
	if ( longitudine != null ){
		//load Google Maps API and render map with location and marker
		mapIt(longitudine,latitudine,artista);
	} else {
		//no location data for the selected artist/track
		alert ( "Location not available for this artist");
	}
}

//create the map 
// parameters:
// 	longit = longitude
// 	latid = latitude
//	artist = artist name
function mapIt(longit,latid,artist){
	
	//map data
	var myLatlng = new google.maps.LatLng(latid,longit);
	var mapProp = {
	  center:myLatlng,
	  zoom:10,
	  mapTypeId:google.maps.MapTypeId.ROADMAP
	  };
	
	//create new map
	var map=new google.maps.Map(document.getElementById("googleMap"),mapProp);
	
	//create marker
	var marker = new google.maps.Marker({
	      position: myLatlng,
	      map: map,
	      title:artist
	});
	
	//show the map
	$('#myMap').show();
}


function geoSearch(){
	var cntry = $('#country').val();
	var citta = $('#city').val();
	var script = document.createElement("script");
	//http://api.jamendo.com/v3.0/artists/locations?client_id=your_client_id&format=jsonpretty&limit=5&haslocation=true&location_country=ITA&location_city=milan
    script.src ='http://api.jamendo.com/v3.0/artists/locations?client_id=f985bf2a'
		+ '&limit=10'
		+ '&haslocation=true'
		+ '&order=popularity_total'
		+ '&location_country=' + cntry
		+ '&location_city=' + citta
		+ '&format=json&callback=geoArtist';
        script.type = "text/javascript";
        document.getElementsByTagName("head")[0].appendChild(script);
	
}

function geoArtist(root){
	var entries = root.results.length;
	filter = filtro;
	moodtags = [];
	tag = 0;
	tracks = [];
	songs = [];
	artists = [];
	covers = [];
	downloads = [];
	played = [];
	artists_id = [];
	locations_lat = [];
	locations_log = [];
	var testo = '';
	// saving data to arrays
	for ( var i = 0 ; i < entries ; i++ ){
		var longitudine = root.results[i].locations[0].longitude;
		var latitudine = root.results[i].locations[0].latitude;
		var country = root.results[i].locations[0].country;
		var city = root.results[i].locations[0].city;
		var artista = root.results[i].name;
		var artista_id = root.results[i].locations[0].id;
		artists[i] = artista + '|' + city + '|' + country;
		locations_long[i] = longitudine;
		locations_lat[i] = latitudine;
		artists_id[i] = artista_id;
		testo = testo +  "<div name='" + artista_id + "' style='text-shadow:0px 0px 0px;color:#fff;font-size:14px'><strong>" + artista + " ( " + city + " )</strong></div>";
	}
	$('#loading').hide();
	$('#search-result').html(testo);
	$('#Content_1').hide();
	$('#search-result').show();
	mapArtist();
}

//create the artist map 
// parameters:
// 	longit = longitude
// 	latid = latitude
//	artist = artist name
function mapArtist(){
	
	//map data
	var myLatlng = new google.maps.LatLng(locations_lat[0],locations_long[0]);
	var mapProp = {
	  center:myLatlng,
	  zoom:4,
	  mapTypeId:google.maps.MapTypeId.ROADMAP
	  };
	
	//create new map
	var map=new google.maps.Map(document.getElementById("googleMapArtist"),mapProp);
	var marker;
	for ( var i=0 ; i < locations_lat.length ; i++ ){
		myLatlng = new google.maps.LatLng(locations_lat[i],locations_long[i]);
		//create marker
		marker = new google.maps.Marker({
	    	  position: myLatlng,
		      map: map,
		      title: artists[i]
		});
	};
	//show the map
	$('#myMap2').show();
}


