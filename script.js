// converts an array of vector3's into RBG format
function vectorsToRBG( vectorArray ) {
    let height = vectorArray.length;
    let width = vectorArray[0].length;
    let out = new Uint8Array(height * width * 4); // Must be Uint8Array to work with three.js
    console.log(out.length);
    for(let i=0; i<height; i++) {
        for(let j=0; j<width; j++ ) {

            // Convert -1 - 1 bound vector to 0 - 255 bound color value
            let r = (vectorArray[i][j].x + 1) /2;      // Converts to 0-1
            r *= 255;                               // Converts to 0-255
            let g = (vectorArray[i][j].y + 1) /2;
            g *= 255; 
            let b = (vectorArray[i][j].z + 1) /2;
            b *= 255; 
            
            out[i*width*4 + j*4] = r;
            out[i*width*4 + j*4 + 1] = g;
            out[i*width*4 + j*4 + 2] = b;
            out[i*width*4 + j*4 + 3] = 255;
        }
    }

    console.log(out);

    return out;
}

// Returns a greyscale clone of the given image to be used as a height map
function getHeightMap( image ) {
    let heightMap = image.clone().greyscale();
    return heightMap;
}

// converts JIMP height map into a 2d list of heights (removes 2 of the duplicate color parameters)
function reduceHeightMap( image, width ) {
    let out = [];
    let row = -1;
    for(let i=0; i<image.bitmap.data.length; i+=4) { // Jimp uses RGBA format, so each pixel is 4 elements in the array
        if(i % width === 0) { // If you've cycled through one row, add the next
            out.push([]);
            row++;
        }
        out[row].push(image.bitmap.data[i]); // grab the first element, which is the Red channel. should be equal to the green and blue channels.
    }

    return out;
}

// Clamps a number between a given min and max value
function clamp(num, min, max) {
    return Math.min(Math.max(num, min), max);
}

function getPartialDerivatives( heightMap ) {
    let height=heightMap.length, width=heightMap[0].length;
    let out = [];
    console.log(width + ", " + height);

    for( let i=0; i<height; i++ ) {       // For each row...
        out.push([]);
        for( let j=0; j<width; j++ ) { // For each pixel...

            // Get the surrounding pixels (accounting for borders)
            let top, topRight, right, bottomRight, bottom, bottomLeft, left, topLeft;
            top = heightMap[clamp(i-1, 0, height-1)][j];
            topRight = heightMap[clamp(i-1, 0, height-1)][clamp(j+1, 0, width-1)];
            right = heightMap[i][clamp(j+1, 0, width-1)];
            bottomRight = heightMap[clamp(i+1, 0, height-1)][clamp(j+1, 0, width-1)];
            bottom = heightMap[clamp(i+1, 0, height-1)][j];
            bottomLeft = heightMap[clamp(i+1, 0, height-1)][clamp(j-1, 0, width-1)];
            left = heightMap[i][clamp(j-1, 0, width-1)];
            topLeft = heightMap[clamp(i-1, 0, height-1)][clamp(j-1, 0, width-1)];

            // Sobel Operator
            let partialDerivativeX = (topRight + 2*right + bottomRight) - (topLeft + 2*left + bottomLeft);
            let partialDerivativeY = (bottomRight + 2*bottom + bottomLeft) - (topRight + 2*top + topLeft);
            partialDerivativeX /= 255;
            partialDerivativeY /= 255;
            out[i].push(new THREE.Vector3(partialDerivativeX, partialDerivativeY, 0)) // Add a new vector3, ignoring the Z component
        }
    }

    return out;
}

const normalStrength = 1;
function generateNormalMap( image ) {
    let heightMap = reduceHeightMap( getHeightMap( image ), image.bitmap.width );
    console.log(heightMap);
    let pd = getPartialDerivatives( heightMap );
    console.log(pd);
    let normalVectors = []; 

    for(let i=0; i<pd.length; i++) {
        normalVectors.push([]); // Add a new row
        for( let j=0; j<pd[i].length; j++) {
            // Flip the sign on the x and y vectors
            let curVector = pd[i][j].clone();
            curVector.x *= -1; 
            curVector.y *= -1;
            curVector.z = 1.0 / normalStrength;

            // Normalize the vector (give it a length of 1)
            curVector.normalize();

            normalVectors[i].push(curVector);
        }
    }
    console.log(normalVectors);
    return vectorsToRBG( normalVectors );
}
