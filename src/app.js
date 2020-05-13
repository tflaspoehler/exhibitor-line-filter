exhibitorMatchApp = angular.module("exhibitorMatchApp", ['ngRoute'])

//-----------------------------------------------------------------------//
// change scope templating string to insert angular stuff from ${} to    //
//       without this hubspot will not play nice with angular            //
//-----------------------------------------------------------------------//
.config(['$interpolateProvider', function($interpolateProvider) {
	$interpolateProvider.startSymbol('//');
	$interpolateProvider.endSymbol('//');
}])
//-------------------------------------------------------------------//

//----------------------------------//
//  service to get http requests    //
//----------------------------------//
.service('getRequest', ['$http', function($http) {
	var getData = function(request, parms={}) {
		return $http.get(request, {params: parms, cache: 'true' }).then(function(response) {
			return response.data;
		});
	};
	return {
		getData: getData
	};
}])
//----------------------------------//

//----------------------------------//
//  filter by checked exhibitors    //
//----------------------------------//
.filter('linesFilter', function() {
    return function(lines, exhibitors) {
    	console.log('----------------');
    	console.log('. running the filter .');
    	console.log(lines);
    	console.log(exhibitors);
    	var lines = [];
    	lines.forEach(function(line) {
    		exhibitors.forEach(function(exhibitor) {
    			if (exhibitor == line.id) {
    				lines.push(line);
    			}
    		});
    	});
    	return lines;
    };
})
//----------------------------------//

//-----------------------------------------------------------------------//
//      controller to sends AJAX request and returns it to the view      //
//-----------------------------------------------------------------------//
.controller("exhibitorMatchController", ['$scope', 'getRequest', function directoryController($scope, getRequest) {

	var vm = this;

	vm.updateLines = function(exhibitors) {
		var lines = [];
		exhibitors.forEach(function(exhibitor) {
			if (exhibitor.selected) {
				exhibitor.productLines.forEach(function(line) {
					lines.push({
						line: line.description, 
						id: exhibitor.exhibitorID});
				});
			}
		});
		vm.lines = lines;
		console.log(lines.length+ ' lines');
	};

	// get exhibitor information for this market from WEM
	getRequest.getData("https://dev.americasmart.com/api/v1.2/Search/LinesAndPhotosByMarket?status=ACTIVE_AND_UPCOMING&marketID=26").then(function(exhibitors) {
		var lines = [];
		vm.exhibitors = exhibitors.map(function(exhibitor) {
			exhibitor.selected = false;
			return exhibitor;
		});
		vm.exhibitors.forEach(function(exhibitor) {
			exhibitor.productLines.forEach(function(line) {
				lines.push({
					line: line.description, 
					id: exhibitor.exhibitorID});
			});
		});
		vm.lines = [];
	});
}]);
//-----------------------------------------------------------------------//
