class TextHelperFuncs {
	info: Uint8Array;

	constructor(data: Uint8Array) {
		this.info = data;
	}

	// gets a value (0-1) to determine if in water or not
	getWaterfromTexture(xVal: number, yVal: number): number {
		let x = Math.floor(xVal);
    let y = Math.floor(yVal);
    return this.info[(y * 2000 * 4) + (x * 4)] / 255;
	}

	// gets a 0-1 value representing population density read from the texture
	getPopDenFromTexture(xVal: number, yVal: number): number {
		let x = Math.floor(xVal);
		let y = Math.floor(yVal);
		return this.info[(y * 2000 * 4) + (x * 4) + 2] / 255; //add 2 as an offset, since its stored in rbga, g
	}


};
export default TextHelperFuncs;