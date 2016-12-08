'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', ['ngMaterial'])
//    https://data.sfgov.org/resource/yitu-d5am.json
.controller('myCtrl', ['$scope', 'dataLoad', '$timeout', '$http','$log',function($scope,dataLoad, $timeout, $http, $log){
    //use dataload service to load json data
    $scope.selected = 0;
    $scope.currentYear = 1900+(new Date().getYear());
    $scope.theaterSelected = false;

    $scope.select = function(index){
        $scope.selected = index;
    }
    var request = dataLoad.get().then(function(response){
        $scope.mydata = response.data;
        console.log($scope.mydata);
        return response.data;
    })

    // request.then(function(data){
    //     console.log(data);
    // })

    request.then(function(data){

        $scope.states = data;
        $scope.querySearch = querySearch;
        $scope.searchTextChange = searchTextChange;
        $scope.selectedItemChange = selectedItemChange;

        function querySearch(query){
            var results = query?$scope.states.filter(createFilterFor(query)):$scope.states, deferred;
            return results;
        }

        function searchTextChange(text) {
            $log.info('Text changed to ' + text);
        }
        function selectedItemChange(item) {
            $log.info('Item changed to ' + JSON.stringify(item));
            if(item!=undefined){
                $scope.locate(item.locations);
            }
        }

        function createFilterFor(query){
            query = query.charAt(0).toUpperCase() + query.slice(1);
            return function filterFn(state){
                if(state.locations != undefined){
                    return (state.locations.indexOf(query) === 0);
                }else{
                    return false;
                }
            };
        }

    })

    $scope.geocoder;
    $scope.map;
    $scope.marker;
    $scope.initMap = function(){
        $scope.geocoder = new google.maps.Geocoder();
        var latlng = new google.maps.LatLng(37.773972, -122.431297);
        var mapOptions = {
            zoom: 12,
            center: latlng
        }
        $scope.map = new google.maps.Map(document.getElementById('map'), mapOptions);
        $scope.marker = new google.maps.Marker();

    }

    $scope.locate = function(location){
        if(location == null || location == undefined){
            console.log("empty location");
            return ;
        }
        $scope.theaterSelected = true;
        var address =location;
        showedFilmDisplay(address);
        var addressSF = address + ', San Francisco';
        $scope.marker.setMap(null);
        $scope.geocoder.geocode({'address':addressSF}, function(results, status){
            if(status=='OK'){
                $scope.map.setCenter(results[0].geometry.location);
                var infowindow = new google.maps.InfoWindow({
                    content: '<b>'+address+'</b>',
                    size: new google.maps.Size(150, 50)
                });

                $scope.marker = new google.maps.Marker({
                    map: $scope.map,
                    position: results[0].geometry.location,
                    title: address
                });

                google.maps.event.addListener($scope.marker, 'click', function(){
                    infowindow.open(map, $scope.marker);
                })

            }else{
                console.log('Geocode was not successful for the following reason: ' + status);
            }
        });
    }

    function showedFilmDisplay(address){
        // console.log(address);
        $scope.films = [];
        request.then(function(data){
            for(var i=0;i<data.length;i++){
                if(parseInt(data[i]["release_year"]) <= $scope.currentYear && data[i]["locations"]== address){
                    $scope.films.push(data[i]);
                }
            }
        })
    }

}])

.factory('dataLoad', function($http){
    return {
        get: function(){
            return $http.get('https://data.sfgov.org/resource/yitu-d5am.json');
        }
    };
})

.filter('unique', function(){
    return function(collection, keyname){
        var output=[], keys=[];
        angular.forEach(collection, function(item){
            var key = item[keyname];
            if(keys.indexOf(key) === -1) {
                keys.push(key);
                output.push(item);
            }
        });
        return output;
    };
})

;

