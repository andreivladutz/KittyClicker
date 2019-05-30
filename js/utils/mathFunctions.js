function euclideanDistance(pt1, pt2) {
	return Math.sqrt(Math.pow(pt1.x - pt2.x, 2) + Math.pow(pt1.y - pt2.y, 2));
}

function manhattanDistance(pt1, pt2) {
	return Math.abs(pt1.x - pt2.x) + Math.abs(pt1.y - pt2.y);
}

function rectIntersection(rectA, rectB) {
	// condition:
	if (rectA.left <= rectB.right && rectA.right >= rectB.left &&
		rectA.top <= rectB.bottom && rectA.bottom >= rectB.top ) {

		return true;
	}
	return false;
}