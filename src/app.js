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
//-----------------------------------------------------------------------//
//      controller to sends AJAX request and returns it to the view      //
//-----------------------------------------------------------------------//
.controller("exhibitorMatchController", ['$scope', 'getRequest', function directoryController($scope, getRequest) {

	var vm = this;

	var outputExhibitor = function(exhibitor, link=true) {
		if (link) {
			return '<li><a href="' + exhibitor.link + '"><p>' + exhibitor.showroomName + '</p></a></li>\\n';
		}
		else {
			return '<li><p>' + exhibitor.showroomName + '</p></li>\\n';
		}
	}

	vm.matchExhibitors = function(keywords) {
		console.log(vm.exhibitors);
		vm.matchedExhibitors = [];
		vm.unmatchedExhibitors = [];
		vm.allExhibitors = [];
		vm.outputText = '';
		vm.noLinkOutputText = '';

		keywords = keywords.split('\n').map(function(keyword) {
			keyword = keyword.replace('Blus ', 'Blush ')
							 .replace('APlus', 'A Plus')
							 .replace(/[\u2018\u2019]/g, "'")
							 .replace(/[\u201C\u201D]/g, '"')
							 .replace('Desing', 'Design')
							 .replace(' by Alexia','')
							 .trim();
			return keyword;
		}).join('\n');

		keywords.split('\n').forEach(function(keyword) {
			var original_keyword = keyword;
			var guess = vm.exhibitors.find(x => x.showroomName.replace('and', '&').toLowerCase() == keyword.trim().toLowerCase());

			if (!guess) {
				guess = vm.exhibitors.find(x => x.showroomName.trim().toLowerCase().replace('and', '&').includes(keyword.trim().toLowerCase()));
			}

			if (!guess) {
				var possibilities = []
				var found = false;
				vm.exhibitors.forEach(function(exhibitor) {
					if (exhibitor.showroomName.toLowerCase()
											  .replace(/[\u2018\u2019]/g, "'")
  											  .replace(/[\u201C\u201D]/g, '"').includes(keyword.trim()
  											  												   .split()[0]
  											  												   .toLowerCase()
  											  												   .replace(/[\u2018\u2019]/g, "'")
  											  												   .replace(/[\u201C\u201D]/g, '"'))) {
						possibilities.push(exhibitor);
						found = true;
					}
				});
				if (!found) {
					console.log('>>>>> did not find ' + keyword);
					vm.unmatchedExhibitors.push({keyword: keyword});
					vm.outputText += outputExhibitor({showroomName: 'FIX: ' + keyword, exhibitorID: 0});
					vm.allExhibitors.push({keyword: original_keyword, showroomName: keyword, link: "https://www.americasmart.com/browse/#/search?q=" + keyword.trim().toLowerCase()});
				}
				else {
					if (possibilities.length > 1) {
						console.log('positibilities for ' + showroomName + ' ' + possibilities);
					}
					else {
						guess = possibilities[0];
						possibilities[0].showroomName = original_keyword;
						possibilities[0].keyword = keyword;
						possibilities[0].link = 'https://www.americasmart.com/browse/#/exhibitor/' + possibilities[0].exhibitorID;
						vm.outputText += outputExhibitor(possibilities[0]);
						vm.allExhibitors.push(possibilities[0]);
					}
				}
			}
			else {
				guess.keyword = keyword;
				guess.link = 'https://www.americasmart.com/browse/#/exhibitor/' + guess.exhibitorID;
				vm.matchedExhibitors.push(guess);
				guess.showroomName = original_keyword;
				vm.allExhibitors.push(guess);
				vm.outputText += outputExhibitor(guess);
			}
		});
		vm.outputText = vm.allExhibitors.sort(function(a, b) {
			if (a.showroomName > b.showroomName) { return 1; }
			if (a.showroomName < b.showroomName) { return -1; }
			return 0;
		}).map(function(exhibitor) {
			return outputExhibitor(exhibitor);
		}).join('');
		vm.noLinkOutputText = vm.allExhibitors.sort(function(a, b) {
			if (a.showroomName > b.showroomName) { return 1; }
			if (a.showroomName < b.showroomName) { return -1; }
			return 0;
		}).map(function(exhibitor) {
			return outputExhibitor(exhibitor, false);
		}).join('');
	}

	var list = ""

	// get employee information from WEM database
	getRequest.getData("https://wem.americasmart.com/api/search/exhibitor").then(function(exhibitors) {
		vm.exhibitors = exhibitors;
	});
}]);
//-----------------------------------------------------------------------//
