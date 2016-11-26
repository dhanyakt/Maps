$('.button-collapse').sideNav({
    menuWidth: 300, // Default is 240
    edge: 'left', // Choose the horizontal origin
    closeOnClick: true, // Closes side-nav on <a> clicks, useful for Angular/Meteor
    draggable: true // Choose whether you can drag to open on touch screens
});



var map;
var largeInfowindow;
var markers = [];
// These are the real estate listings that will be shown to the user.
var locationList = [{
    title: "Biltmore Estate",
    address: "1 Lodge St, Asheville, NC 28803",
    yelpID: "biltmore-estate-asheville",
    location: {
        lat: 35.567032,
        lng: -82.544252
    }
}, {
    title: "Carowinds",
    address: "14523 Carowinds Blvd, Charlotte, NC 28273",
    yelpID: "carowinds-charlotte-2",
    location: {
        lat: 35.103236,
        lng: -80.943737
    }
}, {
    title: "Nascar Hall Of Fame",
    address: "400 E.M.L.K. Jr Blvd, Charlotte, NC 28202",
    yelpID: "nascar-hall-of-fame-charlotte",
    location: {
        lat: 35.221191,
        lng: -80.843953
    }
}, {
    title: "Clingmans Dome",
    address: "Great Smoky Mountains National Park, Bryson City, NC 28713",
    yelpID: "clingmans-dome-uninc-sevier",
    location: {
        lat: 35.525521,
        lng: -83.526306
    }
}, {
    title: "Tweetsie Railroad",
    address: "300 Tweetsie Railroad Ln, Blowing Rock, NC 28605",
    yelpID: "tweetsie-railroad-blowing-rock",
    location: {
        lat: 36.170687,
        lng: -81.648566
    }
}, {
    title: "Chimney Rock",
    address: "431 Main St, Chimney Rock, NC 28720",
    yelpID: "chimney-rock-state-park-chimney-rock",
    location: {
        lat: 35.43984,
        lng: -82.249053
    }
}];

/**
 * @description Represents a Location
 * @constructor
 * @param {string} title - The title of the location
 * @param {string} address - The address of the location
 */
var Locations = function (data) {
    var self = this;
    this.title = data.title;
    this.address = data.address;
    this.location = data.location;
}

var ViewModel = function () {
        var self = this;

        // Create an observable array for passing locations
        self.locationList = ko.observableArray([]);
        self.markers = ko.observableArray([]);

        locationList.forEach(function (locations) {
            self.locationList.push(new Locations(locations));
        });

        self.filter = ko.observable('');

        // Filtering -testing
        self.filteredLocations = ko.computed(function () {
            var filter = self.filter().toLowerCase();
            if (!filter) {
                ko.utils.arrayFilter(locationList, function (location) {
                    if (location.marker)
                        location.marker.setVisible(true);
                });
                return self.locationList();
            } else {
                var filtered_list = ko.utils.arrayFilter(locationList, function (location) {
                    if (location.title.toLowerCase().indexOf(filter) >= 0) {
                        location.marker.setVisible(true);
                        return location;
                    } else {
                        location.marker.setVisible(false);
                    }
                });
                return filtered_list; // return the new filtered array list
            }
        });


        // function to populate the infowindow of the clicked list items
        this.displayMarker = function (clickedLocation) {
            var location_title = clickedLocation.title;
            var total_locations = locationList.length;
            var clicked_marker = null;
            for (var i = 0; i < total_locations; i++) {
                if (locationList[i].title == location_title) {
                    clicked_marker = locationList[i].marker;
                    break;
                }
            }
            if (clicked_marker != null) {
                populateInfoWindow(clicked_marker, largeInfowindow, true);
            }
        }

        function initMap() {
            map = new google.maps.Map(document.getElementById('map'), {
                center: {
                    lat: 35.759573,
                    lng: -79.0193
                },
                zoom: 8
            });

            var bounds = new google.maps.LatLngBounds();
            largeInfowindow = new google.maps.InfoWindow({
                contentString: null
            });

            for (var i = 0; i < this.locationList.length; i++) {
                // Get the position from the location array.
                var position = this.locationList[i].location;
                var title = this.locationList[i].title;
                var address = this.locationList[i].address;
                var id = this.locationList[i].yelpID;
                // Create a marker per location, and put into markers array.
                this.marker = new google.maps.Marker({
                    map: map,
                    position: position,
                    title: title,
                    address: address,
                    animation: google.maps.Animation.DROP,
                    id: id
                });
                this.locationList[i].marker = this.marker; // adding marker as a property in locationList array

                marker.addListener('click', function () {
                    populateInfoWindow(this, largeInfowindow, true);
                });
                markers.push(marker);
                bounds.extend(markers[i].position);
            }

            map.fitBounds(bounds);

            // function to display markers on window resizing
            window.onresize = function() {
                map.fitBounds(bounds);
            }
        } // end of initMap

        // This function populates the infowindow when the marker is clicked. We'll only allow
        // one infowindow which will open at the marker that is clicked, and populate based
        // on that markers position.
        /**
         * @description Represents populateInfoWindow
         * @param {boolean} animate
         * @param marker
         * @param infowindow
         */

        function populateInfoWindow(marker, infowindow, animate) {
                infowindow.marker = marker;

                if (animate) {
                    marker.setAnimation(google.maps.Animation.BOUNCE);
                    stopAnimation(marker);
                }
                // function to stop bouncing animation after 3s
                function stopAnimation(marker) {
                    setTimeout(function () {
                        marker.setAnimation(null);
                    }, 3000);
                }
                // Ajax Request of Yelp
                /**
                 * Generates a random number and returns it as a string for OAuthentication
                 * @return {string}
                 */
                function nonce_generate() {
                    return (Math.floor(Math.random() * 1e12).toString());
                }

                const YELP_KEY = 'jWmZkyFrOCA2QNJMoOpNYg';
                const YELP_TOKEN = 'WlVkulucchfYwOw-8kHqDStncgDQew0T';
                const YELP_KEY_SECRET = '12Ay90fFF1Z_kRlSaDrIZQC-ypo';
                const YELP_TOKEN_SECRET = 'kOePxoen2dhPK26lMFgtO15hmno';

                var yelpUrl = 'https://api.yelp.com/v2/business/' + marker.id;
                var parameters = {
                    oauth_consumer_key: YELP_KEY,
                    oauth_token: YELP_TOKEN,
                    oauth_nonce: nonce_generate(),
                    oauth_timestamp: Math.floor(Date.now() / 1000),
                    oauth_signature_method: 'HMAC-SHA1',
                    oauth_version: '1.0',
                    term: marker.title,
                    location: marker.address,
                    id: marker.id,
                    callback: 'cb' // This is crucial to include for jsonp implementation in AJAX or else the oauth-signature will be wrong.
                };

                var encodedSignature = oauthSignature.generate('GET', yelpUrl, parameters, YELP_KEY_SECRET, YELP_TOKEN_SECRET);
                parameters.oauth_signature = encodedSignature;

                var settings = {
                    url: yelpUrl,
                    data: parameters,
                    cache: true, // This is crucial to include as well to prevent jQuery from adding on a cache-buster parameter "_=23489489749837", invalidating our oauth-signature
                    dataType: 'jsonp',
                    success: function (response) {
                        // Do stuff with results
                        //console.log(response);
                        var rating = response.rating;
                        var rating_url = response.rating_img_url;
                        var image_url = response.image_url;
                        var contentString = '<div class="col s12"> ' +
                            '<h6 class="header">' + marker.title + '</h6>' +
                            '<img src="' + image_url + '" alt="destination-image">' +
                            '<p class="rtng">' + rating + 'stars</p> ' +
                            '<img src="' + rating_url + '" alt="destination-image">' +
                            '</div>';
                        infowindow.setContent(contentString);
                    },
                    error: function () {
                        // Do stuff on fail
                        alert("Try again after some time");
                    }
                };
                infowindow.open(map, marker);
                // Make sure the marker property is cleared if the infowindow is closed.
                infowindow.addListener('closeclick', function () {
                    infowindow.marker = null;
                    if (marker.getAnimation() !== null) {
                        marker.setAnimation(null);
                    }
                });

                // Send AJAX query via jQuery library.
                $.ajax(settings);
        } // end of populateInfoWindow function
        self.init = initMap();
    } // end of ViewModel

function initApp() {
    ko.applyBindings(new ViewModel());
}

function mapError() {
    alert("Try again after sometime");
}