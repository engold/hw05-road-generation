import {vec3, vec4, mat4, glMatrix, quat} from 'gl-matrix';

const PI = 3.14159265359;

class Turtle {
  // set up Turtle variables
  pos: vec3 = vec3.create();
  orient: vec3 = vec3.create();
  depth: number = 0.0;
  quat: quat = quat.create();
  rotAmount: number = 0.0; // for gui slider input

  // set up variables to values passed in
  constructor(p: vec3, o: vec3, q: quat, d: number, a: number) {
    this.pos = p;
    this.orient = o;
    this.depth = d;
    this.quat = q;
    this.rotAmount = a;
  }
 
  // "-" char rotation
  rotateLeft(): void {
    // quaternion - axis and angle to rotate
    let q: quat = quat.create();
    let randChance = Math.random(); // random number between 0 and 1
    let rotAxis = vec3.fromValues(0.0, 0.0, 1.0);
    let degree = -this.rotAmount * (PI / 180.0);  
    if(randChance < 0.5){
        rotAxis = vec3.fromValues(0.0, 1.0, 0.0); 
        degree = degree *(Math.random() *10) ; 
    }
   
    // normalize the quaternion
    vec3.normalize(rotAxis, rotAxis);

    quat.setAxisAngle(q, rotAxis, degree);
    quat.normalize(q, q);

    this.orient = vec3.transformQuat(this.orient, this.orient, q); // rotate the turtle by the quaternion
    vec3.normalize(this.orient, this.orient);

    // rotationTo: Sets a quaternion to represent the shortest rotation from one vector to another. Both vectors are assumed to be unit length.
    quat.rotationTo(this.quat, vec3.fromValues(0, 1, 0), this.orient);      
  }

  // "+" char rotation
  rotateRight(): void {
    // quaternion - axis and angle to rotate
    let q: quat = quat.create();
    let randChance = Math.random(); // random number between 0 and 1
    let rotAxis = vec3.fromValues(0.0, 0.0, 1.0);  
    if(randChance < 0.5){
        rotAxis = vec3.fromValues(0.0, 1.0, 0.0);  
    }  
    let degree = this.rotAmount * (PI / 180.0);
    // normalize the quaternion
    vec3.normalize(rotAxis, rotAxis);

    quat.setAxisAngle(q, rotAxis, degree);
    quat.normalize(q, q);

    this.orient = vec3.transformQuat(this.orient, this.orient, q); // rotate the turtle by the quaternion
    vec3.normalize(this.orient, this.orient);

    // rotationTo: Sets a quaternion to represent the shortest rotation from one vector to another. Both vectors are assumed to be unit length.
    quat.rotationTo(this.quat, vec3.fromValues(0, 1, 0), this.orient);    
  }

  moveForward(): mat4 {    
    vec3.add(this.pos, this.pos, this.orient); // update the turtle pos
    let transformMat: mat4 = mat4.create();
    let scaleVec: vec3 = vec3.fromValues(0.15, 1.0, 0.15);
    // Overall Matrix = T*R*S
    mat4.fromRotationTranslationScale(transformMat, this.quat, this.pos, scaleVec);
    return transformMat;
  }

  makeMatrix(scaleVec: vec3): mat4 {
    let transform: mat4 = mat4.create();
    mat4.fromRotationTranslationScale(transform, this.quat, this.pos, scaleVec);
    return transform;
  }
  // copy the current turtle state to add onto the turtle stack
  // "[" char
  copyTurtle(): Turtle {
    let copyPos: vec3 = vec3.create();
    vec3.copy(copyPos, this.pos);

    let copyOrient: vec3 = vec3.create();
    vec3.copy(copyOrient, this.orient);

    let copyQuat: quat = quat.create();
    quat.copy(copyQuat, this.quat);

    let tempTurtle: Turtle = new Turtle(copyPos, copyOrient, copyQuat, this.depth + 1.0, this.rotAmount);  
    return tempTurtle;
  }

  // update the current turtle state to be what was popped off of the turtle stack
  // "]" char
  updateTurtleFromStack(turtle: Turtle): void {
    // restore state of the drawing turtle
    vec3.copy(this.pos, turtle.pos);
    vec3.copy(this.orient, turtle.orient);
    quat.copy(this.quat, turtle.quat);
    this.depth = turtle.depth - 1;
    this.rotAmount = turtle.rotAmount;
  }
 // for the "*" char, which is only places at the end of a branch (i.e. right before a "]" char)
 leaf(): mat4{
  vec3.add(this.pos, this.pos, this.orient);
  return this.makeMatrix(vec3.fromValues(0.2, 0.8, 0.2));
}

// for the "L" char: small berry
otherLeaf(): mat4{
  vec3.add(this.pos, this.pos, this.orient);
  return this.makeMatrix(vec3.fromValues(0.28, 0.28, 0.28));
}
// for the "B" char, smaller berry
otherLeaf2(): mat4{
  vec3.add(this.pos, this.pos, this.orient);
  return this.makeMatrix(vec3.fromValues(0.4, 0.4, 0.4));
}

} ;
export default Turtle;