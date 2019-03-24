import {vec2, vec3, mat4, quat} from 'gl-matrix';
import Point from '../LSystem/Point';
import Edge from '../LSystem/Edge';
import TextHelperFuncs from '../LSystem/TextHelperFuncs';
//import Turtle from '../lsystem/Turtle';
import HTurtle from '../LSystem/HTurtle';


 class LSystemHighway {
	pointsList: Point[];
    edgesList: Edge[];
    textureHelper: TextHelperFuncs;

	constructor(data: Uint8Array) {
		this.pointsList = [];
        this.edgesList = [];
        this.textureHelper = new TextHelperFuncs(data);
	}

	createLSysHighway(inAngle:number) {
		this.pointsList = [];
		this.edgesList = [];
		let turtleStack: any[] = [];

		let startP: Point = new Point(vec3.fromValues(1000, 0, 1300));
		let f: vec3 = vec3.fromValues(0, 0, 1); // forward in Z direction
		let r: vec3 = vec3.fromValues(1, 0, 0); // right in X dir
		let u: vec3 = vec3.fromValues(0, 1, 0); // up in Y dir
		let q: quat = quat.fromValues(0, 0, 0, 1); // empty quat

        // set up a highway line
		let temp: Point = new Point(vec3.fromValues(0, 0, 950));
        let HTurtle1: HTurtle = new HTurtle(startP, f, u, r, q,	temp, this.textureHelper, this.pointsList, this.edgesList);
		HTurtle1.rotate(-56.0 - (inAngle* 2.0));	

		let temp2: Point = new Point(vec3.fromValues(850, 0, 2000));
        let HTurtle2: HTurtle = new HTurtle(startP, f, u, r, q, temp2, this.textureHelper, this.pointsList, this.edgesList);
        HTurtle2.rotate(-186.0 + (inAngle* 2.0));

		turtleStack.push(HTurtle1);
		turtleStack.push(HTurtle2);

        // traverse turtle
		while (turtleStack.length != 0.0) {
			let currTurtle = turtleStack.pop();
			let expTurtlesList = currTurtle.runExpansion();
			for (let i = 0.0; i < expTurtlesList.length; i++) {
				turtleStack.push(expTurtlesList[i]);
			}
		}
	}

	getVBOs() {
  	let c1Array: number[] = [];
  	let c2Array: number[] = [];
  	let c3Array: number[] = [];
  	let c4Array: number[] = [];
  	let colsArray: number[] = [];

        for (let i: number = 0; i < this.edgesList.length; i++) {
		    	let e: Edge = this.edgesList[i];
			    let transMat: mat4 = e.getTransMat();

	            c1Array.push(transMat[0]);
                c1Array.push(transMat[1]);
                c1Array.push(transMat[2]);
                c1Array.push(transMat[3]);

                c2Array.push(transMat[4]);
                c2Array.push(transMat[5]);
                c2Array.push(transMat[6]);
                c2Array.push(transMat[7]);

                c3Array.push(transMat[8]);
                c3Array.push(transMat[9]);
                c3Array.push(transMat[10]);
                c3Array.push(transMat[11]);

                c4Array.push(transMat[12]);
                c4Array.push(transMat[13]);
                c4Array.push(transMat[14]);
                c4Array.push(transMat[15]);

                 // color: yellow
                colsArray.push(1.0);
                colsArray.push(1.0);
                colsArray.push(0.0);
                colsArray.push(1.0);
	 }

	let c1: Float32Array = new Float32Array(c1Array);
  	let c2: Float32Array = new Float32Array(c2Array);
  	let c3: Float32Array = new Float32Array(c3Array);
  	let c4: Float32Array = new Float32Array(c4Array);
  	let cols: Float32Array = new Float32Array(colsArray);

  	let data: any = {};
  	data.c1 = c1;
  	data.c2 = c2;
  	data.c3 = c3;
  	data.c4 = c4;
  	data.cols = cols;

  	return data;
	}

};
export default LSystemHighway;