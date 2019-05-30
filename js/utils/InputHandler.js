class InputHandlerBase extends EventEmiter {
	constructor(DOMEl) {
		super();
		this._element = DOMEl;
		this._preventDOMDefault = true;
		this._propagateDOM = false;
		
		this._addDOMListeners();
		
		this._moveThreshold = 5;
		this._moving = false;
		
		this._lastCoords = null;
	}
}

_p = InputHandlerBase.prototype;

_p.requestDefault = function() {
	this._preventDOMDefault = false;
};

_p.requestPropagation = function() {
	this._propagateDOM = true;
};

/*
	primeste un array de selectori pentru a gasi copiii 
	pe care se doreste comportament default
*/
_p.allowDomDefaultOnChildern = function(querySelectors) {
	var children = [], 
		events = (isTouchDevice())? ["touchstart", "touchmove"] : ["mousedown", "mousemove"];
	
	for (var selector of querySelectors) {
		var results = Array.from(this._element.querySelectorAll(selector));
		
		children = children.concat(results);
	}
	
	function propagationStopper(e) {
		e.stopPropagation();
	}
	
	for (var child of children)
		for (var event of events)
			child.addEventListener(event, propagationStopper);
}

_p.preventDOMActions = function(e) {
	if (this._preventDOMDefault)
		e.preventDefault();
	
	if (!this._propagateDOM)
		e.stopPropagation();
}

//daca am touchEvent iau in considerare un singur deget pe ecran
_p.getCoords = function(e) {
	if (typeof TouchEvent !== "undefined" && e instanceof TouchEvent)
		e = e.targetTouches[0];
	
	return {
		x : e.clientX,
		y : e.clientY
	};
};

_p._handleUp = function(e) {
	this._lastCoords = this.getCoords(e);
	
	this._moving = false;
	
	this.emit("up", {
		originalEvent : e,
		x : this._lastCoords.x,
		y : this._lastCoords.y
	});
	
	this.preventDOMActions(e);
};

_p._handleDown = function(e) {
	this._lastCoords = this.getCoords(e);
	
	this.emit("down", {
		originalEvent : e,
		x : this._lastCoords.x,
		y : this._lastCoords.y
	});
	
	this.preventDOMActions(e);
};

/*
	miscarea este mai degraba un drag
	deoarece pe mobil orice miscare este in esenta drag
	vrem o uniformitate intre controalele de telefon si mouse
*/
_p._handleMove = function(e) {
	var newCoords = this.getCoords(e),
		deltaX = newCoords.x - this._lastCoords.x,
		deltaY = newCoords.y - this._lastCoords.y;
	
	
	this._lastCoords = newCoords;
	
	//ignor miscarile ce nu depasesc raza de 10 pixeli (maini tremurande, etc)
	if (!this._moving && Math.sqrt(deltaX * deltaX + deltaY * deltaY) > this._moveThreshold)
		this._moving = true;
	
	if (this._moving)
		this.emit("move", {
			originalEvent : e,
			x : newCoords.x,
			y : newCoords.y,
			deltaX,
			deltaY
		});
	
	this.preventDOMActions(e);
};

class MouseHandler extends InputHandlerBase {
	constructor(DOMEl) {
		super(DOMEl);
		
		this._mouseDown = false;
		this._pointerLeftElement = false;
		
		//default este sa continui miscarea cand pointerul iese din element
		//si sa "ascult" mouseup pe body pentru a opri miscarea
		this._stopMovingOnLeave = false;
	}
	
	_handleUp(e) {
		this._mouseDown = false;
		super._handleUp(e);
	};

	_handleDown(e) {
		this._mouseDown = true;
		super._handleDown(e);
	};

	/*
		miscarea este mai degraba un drag
		deoarece pe mobil orice miscare este in esenta drag
		vrem o uniformitate intre controalele de telefon si mouse
	*/
	_handleMove(e) {
		if (this._mouseDown)
			super._handleMove(e);
	}
}

_p = MouseHandler.prototype;

//cer sa opresc miscarea cand pointerul iese din element
_p.requestMovementStopOnMouseLeave = function() {
	this._stopMovingOnLeave = true;
}
 
_p._handleMouseLeave = function(e) {
	//ne intereseaza doar daca inca este apasat butonul de mouse
	if (!this._mouseDown) return;
	
	if (this._stopMovingOnLeave) {
		this._mouseDown = false;
		return;
	}
	
	this._pointerLeftElement = true;
}

_p._handleMouseEnter = function(e) {
	if (this._mouseDown && this._pointerLeftElement)
		this._pointerLeftElement = false;
}

_p._handleMouseUpOnBody = function(e) {
	//daca vreau sa opresc miscarea cand iese pointerul nu mai execut
	//la fel daca pointerul nu a iesit de pe element
	if (this._stopMovingOnLeave || !this._pointerLeftElement) return;
	
	//miscarea se va opri(drag-ul)
	this._handleUp(e);
	
	this._pointerLeftElement = false;
};

_p._handleMouseMoveOnBody = function (e) {
	//daca vreau sa opresc miscarea cand iese pointerul nu mai execut
	//la fel daca pointerul nu a iesit de pe element
	if (this._stopMovingOnLeave || !this._pointerLeftElement) return;
	
	this._handleMove(e);
}

_p._addDOMListeners = function() {
	this._element.addEventListener("mouseup", this._handleUp.bind(this));
	this._element.addEventListener("mousedown", this._handleDown.bind(this));
	this._element.addEventListener("mousemove", this._handleMove.bind(this));
	
	/*
		daca ies din element ori :
		- nu mai vreau sa "arunc" event-uri de movement
		- vreau sa continui movement-ul tinand cont de evenimentele aruncate pe body
	*/
	this._element.addEventListener("mouseleave", this._handleMouseLeave.bind(this));
	this._element.addEventListener("mouseenter", this._handleMouseEnter.bind(this));
	
	//body trebuie sa captureze mouseup pentru a fi siguri ca evenimentul ajunge la el
	document.body.addEventListener("mouseup", this._handleMouseUpOnBody.bind(this), true);
	
	/*
		avem optiunea de a continua movement-ul pe body
	*/
	document.body.addEventListener("mousemove", this._handleMouseMoveOnBody.bind(this), true);
}

class TouchHandler extends InputHandlerBase {
	constructor(DOMEl) {
		super(DOMEl);
		
		this._lastEvent = null;
	}
	
	_handleUp(e) {
		super._handleUp(this._lastEvent);
		
		this._lastEvent = null;
	};

	_handleDown(e) {
		this._lastEvent = e;
		super._handleDown(e);
	};

	_handleMove(e) {
		this._lastEvent = e;
		super._handleMove(e);
	}
	
	//for some reason daca am listener de touchstart,end,move pe parinte DOM
	//copiii nu mai primes eventul de pseudo click
	allowClickEventsOnChildren() {
		var children = this._element.children;
		
		for (var child of children) {
			child.addEventListener("touchend", function(e) {
				var clickEvent = new MouseEvent("click");
				e.target.dispatchEvent(clickEvent);
			});
		}
	}
}

_p = TouchHandler.prototype;

_p._addDOMListeners = function() {
	this._element.addEventListener("touchstart", this._handleDown.bind(this));
	this._element.addEventListener("touchend", this._handleUp.bind(this));
	this._element.addEventListener("touchmove", this._handleMove.bind(this));
}

var InputHandler = isTouchDevice()? TouchHandler : MouseHandler;