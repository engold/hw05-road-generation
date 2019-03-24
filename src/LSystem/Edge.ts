import {vec3, mat4, quat} from 'gl-matrix';
import Point from '../LSystem/Point';

class Edge {
	startP: Point;
	endP: Point;
    highwayCheck: boolean;

	constructor(start : Point, end: Point, highway: boolean) {
        // order the given points
		if (vec3.distance(vec3.fromValues(0, 0, 0), start.position) < vec3.distance(vec3.fromValues(0, 0, 0), end.position)) {
			this.startP = start;
			this.endP = end;
		} else {
			this.endP = start;
			this.startP = end;
        }
        // set the flag for if this edge is a highway edge or if its a normal road edge
        // will be used later to determine drawing size
		this.highwayCheck = highway;
	}	
    // line intersection method from 560 slides 
	getIntersection(p1: Point, p2: Point) {
		let oldP1_x: number = this.startP.position[0];
		let oldP1_y: number = this.startP.position[2];
		let oldP2_x: number = this.endP.position[0];
		let oldP2_y: number = this.endP.position[2];

		let p1_x: number = p1.position[0];
		let p1_y: number = p1.position[2];
		let p2_x: number = p2.position[0];
		let p2_y: number = p2.position[2];

		let s1_x: number = p1_x - oldP1_x;
		let s1_y: number = p1_y - oldP1_y;
		let s2_x: number = p2_x - p1_x;
		let s2_y: number = p2_y - p1_y;

		let s: number = (-s1_y * (oldP1_x - p1_x) + s1_x * (oldP1_y - p1_y)) / (-s2_x * s1_y + s1_x * s2_y);
		let t: number = ( s2_x * (oldP1_y - p1_y) - s2_y * (oldP1_x - p1_x)) / (-s2_x * s1_y + s1_x * s2_y);

		if (s >= 0 && s <= 1 && t >= 0 && t <= 1) {
                 let x_result: number = oldP1_x + (t * s1_x);
                 let y_Result: number = oldP1_y + (t * s1_y);
                return new Point(vec3.fromValues(x_result, 0, y_Result));
         }

        return null;
    }
    
	getRotationAngle(start: vec3, end: vec3) {
        // get x values
        let x1: number = start[0];
        let x2: number = end[0];
        // get y vals
		let y1: number = start[2];
		let y2: number = end[2];

		let dot: number = (x1*x2) + (y1*y2);
        let det: number = (x1*y2) - (y1*x2);
        
        // use atan to get the angle between
		return -1.0 * Math.atan2(det, dot);
    }
    
	
	// get transform Matrix for instance rendering
	getTransMat() {
        let dir: vec3 = vec3.fromValues(0, 0, 0);
        let world_Up: vec3 = vec3.fromValues(0, 0, 1);
        vec3.subtract(dir, this.endP.position, this.startP.position);

        // calculate angle
        let x1: number = world_Up[0];
        let x2: number = dir[0];
		let y1: number = world_Up[2];
		let y2: number = dir[2];
		let dot: number = (x1*x2) + (y1*y2);
        let det: number = (x1*y2) - (y1*x2);
        // use atan to get the angle between
		let temp: number =  -1.0 * Math.atan2(det, dot);
        let angle: number = temp;
        
		let rotAxis: vec3 = vec3.fromValues(0, 1, 0); // world y axis
		let rotQuat: quat = quat.create();
		quat.setAxisAngle(rotQuat, rotAxis, angle);

        // get the mid point values
        let midX: number = (this.startP.position[0] + this.endP.position[0]) / 2.0;
        let midY: number = (this.startP.position[1] + this.endP.position[1]) / 2.0;
        let midZ: number = (this.startP.position[2] + this.endP.position[2]) / 2.0; 
		let translate = vec3.fromValues(midX, midY, midZ);

        // scale for drawing the size of the road, bigger for highway
        let width: number;
        if(this.highwayCheck == true){
            width = 25;
        }
        else{
            width = 8.0;
        }
		let scaleVec: vec3 = vec3.fromValues(width, 1.0, vec3.length(dir));

		let overallMatrix: mat4 = mat4.create(); // holder for the transforms when put together as a matrix
	    mat4.fromRotationTranslationScale(overallMatrix, rotQuat, translate, scaleVec);
	  return overallMatrix;
    }

};
export default Edge;