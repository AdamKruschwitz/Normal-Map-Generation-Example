// converts an array of vector3's into RBG format
function vectorsToRBG( vectorArray ) {
    let out = [];

    for(let i=0; i<vectorArray.length; i++) {
        // Convert -1 - 1 bound vector to 0 - 255 bound color value

        let r = (vectorArray[i].x + 1) /2;      // Converts to 0-1
        r *= 255;                               // Converts to 0-255
        let g = (vectorArray[i].y + 1) /2;
        g *= 255; 
        let b = (vectorArray[i].z + 1) /2;
        b *= 255; 

        out.push(r);
        out.push(g);
        out.push(b);
    }

    return out;
}
