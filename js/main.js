/* Declare all the global things */
var maxArtboardPosX = 800;
var maxArtboardPosY = 600;
var paper, preferences, globalAngle;

$(document).ready(function(){

	//create paper
	paper = Raphael("art-board", maxArtboardPosX,maxArtboardPosY);

	$("#generate").on("click", function () {
		preferences = getPreferences();
		resizeArtboard (preferences.maxWidth, preferences.maxHeight);
		generateShapes( preferences.numberShapes );
		return false;
	});

	$("#save").on("click", function (){
		var svgString = document.getElementById('art-board').innerHTML;
		a = document.createElement('a');
		a.download = 'mySvg.svg';
		a.type = 'image/svg+xml';
		blob = new Blob([svgString], {"type": "image/svg+xml"});
		a.href = (window.URL || webkitURL).createObjectURL(blob);
		a.click();
	});
});

function resizeArtboard ( width, height ){
	maxArtboardPosX = width*1.5;
	maxArtboardPosY = height*1.5
	paper.setSize(width, height);
}

function drawBackground (){
	var opacity = 1;
	if(preferences.allowTransparency)
		opacity = getRandomArbitrary(0.1, 1);
	var background = paper.rect(0,0,preferences.maxWidth,preferences.maxHeight).attr({
		fill: getColor(),
		'stroke-width': 0,
		'fill-opacity': opacity
	});

}

function getPreferences () {
	var preferences = {};
	preferences.maxWidth = $("#maxWidth").val();
	preferences.maxHeight = $("#maxHeight").val();
	preferences.numberShapes = $("#numberShapes").val();
	preferences.numberColors = $("#numberColors").val();
	preferences.allowRotation = $("#allowRotation").prop('checked');
	preferences.persistentAngle = $("#persistentAngle").prop('checked');
	preferences.allowPerpendicular = $("#allowPerpendicular").prop('checked');
	preferences.allowTransparency = $("#allowTransparency").prop('checked');
	preferences.allowRoundCorners = $("#allowRoundCorners").prop('checked');
	preferences.objectSize = $("#objectSize").val();

	switch (preferences.objectSize) {
		case "xl":
			preferences.objectSize = 1;
			break;
		case "l":
			preferences.objectSize = 0.5;
			break;
		case "m":
			preferences.objectSize = 0.25;
			break;
		case "s":
			preferences.objectSize = 0.1;
			break;
		case "xs":
			preferences.objectSize = 0.05; // not the same ratio, but it looks better smaller
			break;
	}
	preferences.allowedShapes  = $("#allowedShapes:checked").map(function(){
        return $(this).val();
			}).toArray();

	preferences.allowedColors = generateColorArray ( preferences.numberColors );
	return preferences;
}

/*
 * Generates a number of shapes
 */
function generateShapes( numberShapes ){
	paper.clear();
	drawBackground ();
	var shapeType = "rectangle";
	//determine a global angle
	globalAngle = parseInt( getRandomArbitrary(0, 360) );

	for (i = 1; i <= numberShapes; i++) {

		//determine shape to generate
		shapeType = preferences.allowedShapes[Math.floor(Math.random()*preferences.allowedShapes.length)];
		if( shapeType == 'circle') drawCircle ();
		else if( shapeType == 'triangle') drawTriangle ();
		else if( shapeType == 'polygon') drawPolygon ();
		else if( shapeType == 'line') drawLine ();
		else {
			drawRectangle ();
		}
	}
}

/**
 * Generates random HEX color
 * http://www.paulirish.com/2009/random-hex-color-code-snippets/
 */
function getRandomColor (){
	return '#'+Math.floor(Math.random()*16777215).toString(16);
}

/**
 * Returns a random number between min (inclusive) and max (exclusive)
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
 */
function getRandomArbitrary(min, max, allowNegative) {
	var randomArbitrary = Math.random() * (max - min) + min;
	if ( allowNegative != null ){
		randomArbitrary = randomArbitrary * (Math.random() < 0.5 ? -1 : 1);
	}
	//console.log(randomArbitrary);
	return randomArbitrary;

}

function drawRectangle () {
	var x = getRandomArbitrary(-0.5*maxArtboardPosX,maxArtboardPosX+10);
	var y= getRandomArbitrary(-0.5*maxArtboardPosY,maxArtboardPosY+10);
	var width = getRandomArbitrary(0,preferences.maxWidth);
	var height = getRandomArbitrary(0,preferences.maxHeight);
	var angle = 0, radius = 0, opacity = 1;

	if(preferences.allowRoundCorners)
		radius = getRandomArbitrary(0, ( width > height ? width : height ));

	if(preferences.allowTransparency)
		opacity = getRandomArbitrary(0.1, 1);

	var rectangle = paper.rect(x,y,width,height).attr({
		fill: getColor(),
		'stroke-width': 0,
		'fill-opacity': opacity,
		'radius': radius
	});

	if( preferences.allowRotation && randomAllow ){
		if ( preferences.persistentAngle )
			angle = globalAngle;
		else{
			angle = getRandomArbitrary( 0, 360 );
		}
		rectangle = rectangle.transform( "r"+angle + " s" + preferences.objectSize );
	}
	else{
		//scale
		rectangle.transform( "s" + preferences.objectSize );
	}
}

function drawCircle () {
	var x = getRandomArbitrary(0,maxArtboardPosX,true);
	var y= getRandomArbitrary(0,maxArtboardPosY,true);
	var radius = getRandomArbitrary(0,preferences.maxWidth);

	if(preferences.allowTransparency)
		opacity = getRandomArbitrary(0, 1);

	var circle = paper.circle(x,y,radius).attr({
		fill: getColor(),
		'stroke-width': 0,
		'fill-opacity': opacity
	});

	circle.transform("s" + preferences.objectSize);
}

function drawPolygon (verticesNumber) {

	var x,y,point,polygonString;
	var opacity = 1;

	if (verticesNumber == null)
		verticesNumber = parseInt(getRandomArbitrary(3,9));

	for (j = 0; j < verticesNumber; j++) {
		x = getRandomArbitrary(-0.5*maxArtboardPosX,maxArtboardPosX*3,true);
		y= getRandomArbitrary(-0.5*maxArtboardPosX,maxArtboardPosY*3,true);
		point = parseInt(x) + "," + parseInt(y);

		if(polygonString != null)
				polygonString += " L " + point;

		else{
			polygonString = "M " + point;
		}
	}

	if(preferences.allowTransparency)
		var opacity = getRandomArbitrary(0, 1);

	var polygon = paper.path(polygonString).attr({
		fill: getColor(),
		'stroke-width': 0,
		'fill-opacity': opacity
	});

	polygon.transform( "s" + preferences.objectSize );
}

function drawTriangle() {
	var x1,x2,y1,y2,side,triangle, width, height;

	width = getRandomArbitrary(0,preferences.maxWidth) * preferences.objectSize;
	height = getRandomArbitrary(0,preferences.maxHeight) * preferences.objectSize;
	x1 = getRandomArbitrary(0,maxArtboardPosX);
	y1 = getRandomArbitrary(0,maxArtboardPosY);
	side = getRandomArbitrary(10, ( width > height ? width : height ));
	x2 = x1 + side;
	triangleString ="M " + parseInt(x1) + "," + parseInt(y1) +
						"L " + parseInt(x2) + "," + parseInt(y1) +
						"L " + parseInt(x1 + side/2) + "," + parseInt(y1 + side/1.5);

	if(preferences.allowTransparency)
		var opacity = getRandomArbitrary(0, 1);

	console.log ("triangle: " + triangleString);

	var polygon = paper.path(triangleString).attr({
		fill: getColor(),
		'stroke-width': 0,
		'fill-opacity': opacity
	});

	//always rotate unless persiste angle
	if ( preferences.persistentAngle ){
		polygon.transform( "r"+globalAngle );
	}
	else if ( preferences.allowRotation ){
		polygon.transform ( "r"+ parseInt( getRandomArbitrary(0, 360) ) );

	}
	else{
		//rotate it orderly
		angle = 45 * parseInt( getRandomArbitrary(0, 6) );
		polygon.transform( "r"+angle );
	}
}

function drawLine (){
	var x,y,point1,point2,lineString,stroke,angle;
	var opacity = 1, angle = 0;

	if ( preferences.persistentAngle && globalAngle != 0 )
		angle = globalAngle;
	else{
		angle = parseInt( getRandomArbitrary(0, 360) );
	}

	if( maxArtboardPosX > maxArtboardPosY ){
		x = maxArtboardPosX;
	}
	else{
		x = maxArtboardPosY;
	}


	y = getRandomArbitrary(0, maxArtboardPosY);
	point1 = parseInt(0) + "," + parseInt(y);
	point2 = parseInt(x) + "," + parseInt(y);

	if ( preferences.allowPerpendicular && randomAllow () ){
		x = getRandomArbitrary(0, maxArtboardPosX);
		point1 = parseInt(x) + "," + parseInt(0);
		point2 = parseInt(x) + "," + parseInt(maxArtboardPosY);
	}


	lineString = "M " + point1;
	lineString = lineString + " L " + point2;

	if(preferences.allowTransparency)
		var opacity = getRandomArbitrary(0, 1);

	var stroke_width = getRandomArbitrary(1, 3);

	var line = paper.path(lineString).attr({
		'stroke': getColor(),
		'stroke-width': stroke_width,
		'fill-opacity': opacity
	});

	if( preferences.allowRotation ){
		line = line.transform("r"+ angle  + " s2");
	}
}

function randomAllow (){
	var randomAllow = (Math.random() < 0.5 ? 0 : 1);
	return randomAllow == 1;
}

function generateColorArray ( numberColors ) {
	var colors = [];
	for (k = 0; k < numberColors; k++) {
		colors[k] = getRandomColor ();
	}
	console.log(colors);
	return colors;
}

function getColor () {
	var color = preferences.allowedColors[Math.floor(Math.random() * preferences.allowedColors.length)];
	return color;
}