

/* Declare all the global things */
var maxArtboardPosX = 800;
var maxArtboardPosY = 600;
var maxStrokeWidth = 10;
var paper, preferences, globalAngle, retina = 1, strokeWidth = 1;
var shapeProperties = {};
shapeProperties.strokeWidth = 0;
shapeProperties.strokeOpacity = 1;
shapeProperties.strokeColor = "";
shapeProperties.fillOpacity = 1;
shapeProperties.fillColor = "";

$( document ).ready( function(){

	//create paper
	paper = Raphael( "art-board", maxArtboardPosX,maxArtboardPosY );

	$( "#generate" ).on( "click", function () {
		preferences = getPreferences();
		resizeArtboard (preferences.maxWidth, preferences.maxHeight);
		generateShapes( preferences.numberShapes );
		return false;
	});

	$( "#save" ).on( "click", function (){
		saveSVG();
	});

	$( "#download" ).on( "click", function (){
		downloadJPG();
	});

	$( "#addColor" ).on( "click", function (){
		var selectedColors = $( "#colorSet" ).val();
		if ( selectedColors != '' )
			$( "#colorSet" ).val( selectedColors + "," + $( "#colorChooser" ).val() );
		else{
			$( "#colorSet" ).val( $( "#colorChooser" ).val() );
		}
	});

	$( "#useColorSet, #useBackgroundColor" ).on( "change", function (){
		showHideNextElement(this);
	});

	$( "#deviceType" ).on("change", function(){
		updateCanvasDimention();
	});

});

function getPreferences () {
	var preferences = {};
	preferences.retina = $("#retinaValue").val();
	preferences.maxWidth = $("#maxWidth").val() * preferences.retina;
	preferences.maxHeight = $("#maxHeight").val() * preferences.retina;
	preferences.numberShapes = $("#numberShapes").val();
	preferences.numberColors = $("#numberColors").val();
	preferences.allowRotation = $("#allowRotation").prop('checked');
	preferences.persistentAngle = $("#persistentAngle").prop('checked');
	preferences.allowPerpendicular = $("#allowPerpendicular").prop('checked');
	preferences.allowTransparency = $("#allowTransparency").prop('checked');
	preferences.allowRoundCorners = $("#allowRoundCorners").prop('checked');
	preferences.objectSize = $("#objectSize").val();
	preferences.useBackgroundColor = $("#useBackgroundColor").prop('checked');
	preferences.backgroundColor = $("#backgroundColor").val();
	preferences.useColorSet = $("#useColorSet").prop('checked');
	preferences.colorSet = $("#colorSet").val();
	preferences.fillingtype = $("#fillingtype").val();
	preferences.allowDistictColors = $("#allowDistict").val();
	preferences.strokeWidth = $("#strokeWidth").val();

	switch (preferences.objectSize) {
		case "xl":
			preferences.objectSize = 0.75;
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

	if ( preferences.useColorSet ){
		preferences.allowedColors = preferences.colorSet.split(",");
	}
	else{
		preferences.allowedColors = generateColorArray ( preferences.numberColors );
	}

	return preferences;
}

function resizeArtboard ( width, height ){
	maxArtboardPosX = width;
	maxArtboardPosY = height;
	paper.setSize(maxArtboardPosX, maxArtboardPosY);
}

function drawBackground (){
	var opacity = 1;
	var color = ( preferences.useBackgroundColor ? preferences.backgroundColor : getColor());
	var background = paper.rect(0,0,preferences.maxWidth,preferences.maxHeight).attr({
		fill: color,
		'strokeWidth': 0
	});
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

		//set the shape properties
		shapeProperties = setShapeProperties() ;

		if( shapeProperties.shapeType == 'circle') drawCircle ();
		else if( shapeProperties.shapeType == 'triangle') drawTriangle ();
		else if( shapeProperties.shapeType == 'polygon') drawPolygon ();
		else if( shapeProperties.shapeType == 'line') drawLine ();
		else {
			drawRectangle ();
		}
	}
}

function setShapeProperties () {
	shapeProperties.fillColor = getColor();

	shapeProperties.strokeOpacity = getRandomArbitrary(0.25, 1);
	shapeProperties.fillOpacity = getRandomArbitrary(0.25, 1);

	if (preferences.allowDistictColors)
		shapeProperties.strokeColor = getColor();
	else{
		shapeProperties.strokeColor = shapeProperties.fillColor;
	}

	if(preferences.allowTransparency)
		shapeProperties.fillOpacity = getRandomArbitrary(0.25, 1);

	if ( preferences.strokeWidth == 'random' )
		shapeProperties.strokeWidth = getRandomArbitrary(1, maxStrokeWidth);
	else{
		shapeProperties.strokeWidth = preferences.strokeWidth;
	}

	if(preferences.fillingtype == 'border'){
		shapeProperties.fillOpacity = 0;
	}
	else if(preferences.fillingtype == 'filling'){
		shapeProperties.strokeWidth = 0;
	}

	//determine shape to generate
	shapeProperties.shapeType = preferences.allowedShapes[Math.floor(Math.random()*preferences.allowedShapes.length)];

	console.log("shapeProperties.strokeWidth " + shapeProperties.strokeWidth);

	return shapeProperties;
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
	var angle = 0, radius = 0;

	if(preferences.allowRoundCorners)
		radius = getRandomArbitrary(0, ( width > height ? width : height ));

	var rectangle = paper.rect(x,y,width,height).attr({
		'stroke-width': shapeProperties.strokeWidth,
		'stroke': shapeProperties.strokeColor,
		'stroke-opacity': shapeProperties.strokeOpacity,
		'fill': shapeProperties.fillColor,
		'fill-opacity': shapeProperties.fillOpacity,
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

	var circle = paper.circle(x,y,radius).attr({
		'stroke-width': shapeProperties.strokeWidth,
		'stroke': shapeProperties.strokeColor,
		'stroke-opacity': shapeProperties.strokeOpacity,
		'fill': shapeProperties.fillColor,
		'fill-opacity': shapeProperties.fillOpacity
	});

	circle.transform("s" + preferences.objectSize);
}

function drawPolygon (verticesNumber) {

	var x,y,point,polygonString;

	if (verticesNumber == null)
		verticesNumber = parseInt(getRandomArbitrary(3,5));


	//define first and last point

	x1 = getRandomArbitrary(-0.5*maxArtboardPosX,maxArtboardPosX*3,true);
	y1= getRandomArbitrary(-0.5*maxArtboardPosX,maxArtboardPosY*3,true);
	firstPoint = parseInt(x1) + "," + parseInt(y1);

	polygonString = "M " + firstPoint;

	for (j = 0; j < verticesNumber; j++) {
		x = getRandomArbitrary(-0.5*maxArtboardPosX,maxArtboardPosX*3,true);
		y= getRandomArbitrary(-0.5*maxArtboardPosX,maxArtboardPosY*3,true);
		point = parseInt(x) + "," + parseInt(y);
		polygonString += " L " + point;
	}

	//add last point
	polygonString += " L " + firstPoint;

	var polygon = paper.path(polygonString).attr({
		'stroke-width': shapeProperties.strokeWidth,
		'stroke': shapeProperties.strokeColor,
		'stroke-opacity': shapeProperties.strokeOpacity,
		'fill': shapeProperties.fillColor,
		'fill-opacity': shapeProperties.fillOpacity
	});

	polygon.transform( "s" + preferences.objectSize/2 );
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
						"L " + parseInt(x1 + side/2) + "," + parseInt(y1 + side/1.5) +
						"L " + parseInt(x1) + "," + parseInt(y1);


	var polygon = paper.path(triangleString).attr({
		'stroke-width': shapeProperties.strokeWidth,
		'stroke': shapeProperties.strokeColor,
		'stroke-opacity': shapeProperties.strokeOpacity,
		'fill': shapeProperties.fillColor,
		'fill-opacity': shapeProperties.fillOpacity
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
		var opacity = getRandomArbitrary(0.25, 1);

	var strokeWidth = getRandomArbitrary(1, 3);

	var line = paper.path(lineString).attr({
		'stroke-width': shapeProperties.strokeWidth,
		'stroke': shapeProperties.strokeColor,
		'fill-opacity': shapeProperties.fillOpacity
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
	var colorsString = "";
	for (k = 0; k < numberColors; k++) {
		colors[k] = getRandomColor ();
		colorsString += " " + colors[k];
	}
	console.log ( "Colors used: " + colorsString);
	return colors;
}

function getColor () {
	var color = preferences.allowedColors[Math.floor(Math.random() * preferences.allowedColors.length)];
	return color;
}

function saveSVG () {
	var svgString = document.getElementById('art-board').innerHTML;
	a = document.createElement('a');
	a.download = 'artsyfartsiness.svg';
	a.type = 'image/svg+xml';
	blob = new Blob([svgString], {"type": "image/svg+xml"});
	a.href = (window.URL || webkitURL).createObjectURL(blob);
	a.click();
}

function downloadJPG () {
	var svgNode = document.getElementById("art-board").childNodes[0];
  saveSvgAsPng(svgNode, "diagram.png");
}


function showHideNextElement ( culprid ) {
	$( "#" + ($( culprid ).attr("data-toggles") ) ) .toggleClass('actionable');
}

function updateCanvasDimention () {
	var selectedCanvas = $( "#deviceType" ).val();

	switch (selectedCanvas) {
		case 'iphone5':
			setCanvasUI (320,568,2);
			break;

		case 'iphone6':
			setCanvasUI (375,627,2);
			break;

		case 'iphone6p':
			setCanvasUI (414,736,2);
			break;

		case 'nexus5':
			setCanvasUI (360,567,3);
			break;
		case 'nexus6':
			setCanvasUI (412,659,3.5);
			break;
		case 'nexus7':
			setCanvasUI (600,950,2);
			break;
		case 'ipad':
			setCanvasUI (768,1024,2);
			break;
		case 'macbook':
			setCanvasUI (1440,900,2);
			break;
		case 'thunder':
			setCanvasUI (2560,1440,1);
			break;
		case 'generic':
			setCanvasUI (1440,900,1);
			break;
		default:
			setCanvasUI (600,600,1);
			break;
	}
}

function setCanvasUI (width,height,retinaValue) {
	$( "#maxWidth").val(width);
	$( "#maxHeight").val(height);
	$( "#retinaValue").val(retinaValue);
}
