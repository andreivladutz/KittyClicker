class EventEmiter extends EventTarget {
	constructor() {
		super();
	}
}

_p = EventEmiter.prototype;

/*
*	a simpler interface to dispatchEvent 
*	it can be called with the eventName and object to be sent
*/
_p.emit = function(eventName, detail) {
	this.dispatchEvent(new CustomEvent(eventName, {detail}));
};


//alias for addEventListener
_p.on = _p.addEventListener = function(eventName, handler) {
	EventTarget.prototype.addEventListener.call(this, eventName, handler);
};
