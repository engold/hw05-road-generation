import {vec2, vec3} from 'gl-matrix';


class Point {
	position: vec3 = vec3.create();

	constructor(position: vec3) {
		this.position = position;
	}
    // method for finding proximity to nearby points
	inRange(pos: vec3, r: number) {
		return vec3.distance(pos, this.position) < r;
	}
};
export default Point;