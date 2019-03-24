import {vec3, mat4, quat} from 'gl-matrix';
import Point from '../LSystem/Point';
import Edge from '../LSystem/Edge';
import TextHelperFuncs from '../LSystem/TextHelperFuncs';

class HTurtle {
  point: Point;
  forwardDir: vec3 = vec3.create();
  upDir: vec3 = vec3.create();
  rightDir: vec3 = vec3.create();
  quat: quat = quat.create();

  destinationPoint: Point;
  textureHelper: TextHelperFuncs;
  pointsList: Point[];
  edgesList: Edge[];

  constructor(point: Point, f: vec3, up: vec3, r: vec3, q: quat, dest: Point, textureHelper: TextHelperFuncs, 
              arrayOfPoints: Point[], arrayOfEdges: Edge[]) {
    
    this.point = point;
    this.forwardDir = vec3.fromValues(f[0], f[1], f[2]);
    this.upDir = vec3.fromValues(up[0], up[1], up[2]);
    this.rightDir = vec3.fromValues(r[0], r[1], r[2]);
    this.quat = quat.fromValues(q[0], q[1], q[2], q[3]);
    this.destinationPoint = dest;
    this.textureHelper = textureHelper;
    this.pointsList = arrayOfPoints;
    this.edgesList = arrayOfEdges;
  }

// store the rotation in the turtle's quat
  rotate(deg: number) {
    let q: quat = quat.create();
    quat.setAxisAngle(q, this.upDir, deg * Math.PI / 180.0);

    let rotMat: mat4 = mat4.create();
    mat4.fromQuat(rotMat, q);
    vec3.transformMat4(this.forwardDir, this.forwardDir, rotMat);
    vec3.normalize(this.forwardDir, this.forwardDir);
    vec3.transformMat4(this.rightDir, this.rightDir, rotMat);
    vec3.normalize(this.rightDir, this.rightDir);
    quat.rotationTo(this.quat, vec3.fromValues(0, 1, 0), this.forwardDir);
  }
  
  turtleRules(theTurtle: HTurtle) {
    // out of bounds check
    if (this.point.position[0] < 0 || this.point.position[0] > 2000 || this.point.position[2] < 0 || this.point.position[2] > 2000) {
      return null;
    }
    // near desired target check
    if (this.destinationPoint.inRange(theTurtle.point.position, 2.0)) {
      let temp = new Edge(this.point, this.destinationPoint, true);
      this.pointsList.push(this.destinationPoint);
      this.edgesList.push(temp);
      return null;
    }
    return theTurtle;
  }

  // expand- move turtle forard
  expRule() {
    let newTurtles = []; // hold the additional expansions
    let newPoint = new Point(vec3.fromValues(this.point.position[0], this.point.position[1], this.point.position[2]));

    let tempX = newPoint.position[0] + (2.0 * this.forwardDir[0]);
    let tempY = newPoint.position[1] + (2.0 * this.forwardDir[1]);
    let tempZ = newPoint.position[2] + (2.0 * this.forwardDir[2]);
    newPoint.position = vec3.fromValues(tempX, tempY, tempZ);

    newTurtles.push(this.createNewTurtle(newPoint));
    return newTurtles;
  }

  createNewTurtle(newP: Point) {
    let forwardVec: vec3 = vec3.create();
    let upVec: vec3 = vec3.create();
    let rightVec: vec3 = vec3.create();
    let q: quat = quat.create();

    vec3.copy(forwardVec, this.forwardDir);
    vec3.copy(upVec, this.upDir);
    vec3.copy(rightVec, this.rightDir);
    quat.copy(q, this.quat);

    return new HTurtle(newP, forwardVec, upVec, rightVec, q, this.destinationPoint, this.textureHelper, 
                        this.pointsList, this.edgesList);
  }

  runExpansion(): any[] {
    let tempExpanTurtles: any[] = this.expRule();
    let yesTurtles: any[] = [];

    for (let i: number = 0.0; i < tempExpanTurtles.length; i++) {
      let currTurt = this.turtleRules(tempExpanTurtles[i]);

      if (currTurt) {
        let e = new Edge(this.point, currTurt.point, true);
        this.edgesList.push(e);
        this.pointsList.push(currTurt.point);
        yesTurtles.push(currTurt);
      }
    }
    // Return array of turtles expanded from currTurtle
    return yesTurtles;
  }
};
export default HTurtle;