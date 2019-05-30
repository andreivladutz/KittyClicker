/*
	a few promises utilities
*/


/*
	a function that promisifies a function of the form func(resolve, reject) {...}
	and adds a isResolved function on the promise to know if the promise was resolved yet or not
*/
function promisify(func) {
	var isResolved = false,
		
		p = new Promise(func).then(
			function(response) {
				isResolved = true;
				return response;
			},
			function(err) {
				isResolved = true;
				throw err;
			});
	
	p.isResolved = function() {
		return isResolved;
	};
	
	return p;
}

/*
	a function for waiting on an array of promises that we keep adding to
	
	promises added to the array should be created with promisify
*/
function waitOnAllPromises(promisesArr) {
	return Promise.all(promisesArr).then(function(response) {
		
		//if there was added a promise to the array that hasn't finished
		//we return another promise that waits on the new promises array
		for (let promise of promisesArr) {
			if (!promise.isResolved()) {
				return waitOnAllPromises(promisesArr);
			}
		}
		
		return response;
	});
}