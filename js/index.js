function average_2d(arr){
  var result = [];
  for (var i in arr[0]){
    var sum = 0;
    for (var j in arr){
      sum += parseFloat(arr[j][i]);
    }
    result.push(sum/arr.length);
  }
  return result;
}

function findx1index(x, array){
	var result = [];
	array.reverse();
	//var rindex = array.findIndex(function(a) {return lessthanequal(a, x);});
	var rindex = -1;
	for(var i = 0;i < array.length;i++){
		if(array[i] <= x){
			rindex = i;
			break;
		}
	}
	result = array.length - (rindex + 1);
	array.reverse();
	return result;
}

function lerp(x, x1, x2, y1, y2){
	var result = [];
	result = y1 + (y2 - y1) * (x - x1) / (x2 - x1);
	return result;
}

function linearInterp(xarray, yarray, x, value){
	var result;
	var xmax = Math.max.apply(null, xarray);
	var xmin = Math.min.apply(null, xarray);
	if(x < xmin){
		result = value;
	}else if(x > xmax){
		result = value;
	}else if(x == xmax){
		var yendindex = (yarray.length) - 1;
		result = yarray[yendindex];
	}else{
		var x1index = findx1index(x, xarray);
		var x1 = xarray[x1index];
		var x2 = xarray[x1index + 1];
		var y1 = yarray[x1index];
		var y2 = yarray[x1index + 1];

		result = lerp(x, x1, x2, y1, y2);
	}
	return result;
}

function interp1(xarray, yarray, array, value){
	var result = [];
	if(Array.isArray(array)){
		for(var i = 0;i < array.length;i++){
			var x = array[i];
			result[i] = linearInterp(xarray, yarray, x, value);
		}
	}else{
		var x = array;
		return linearInterp(xarray, yarray, x, value);
	}
	return result;
}


var length = 6.60, width = 4.84, height = 2.795;
var reflectance = {
  walls: 0.50,
  ceiling: 0.80,
  floor: 0.20
};
var fixtureEfficiency = 1.0;

var ies = {
  keys: {},
  intensities: []
};

var spd = {
  wavelengths: [],
  powers: []
};

function buildContent(){
  calculateCU();
  createSPD();
  createCandela();
}

function buildHTML(){
  $('body').html('');
  var str = '';
  str += '<div class="container-fluid">';
  str += '  <div class="row mt-4">';
  str += '    <div class="col">';
  str += '      <h1 class="text-center">CS Engine</h1>';
  str += '        <div class="mx-auto text-center canvas-container">';
  str += '          <canvas id="spd"></canvas>';
  str += '          <canvas id="candela"></canvas>';
  str += '        </div>';
  str += '    </div>';
  str += '  </div>';
  str += '</div>';
  $('body').html(str).promise().done(buildContent());
}

function calculateCU(){

  function findUpIndeces(arr){
    var result = [];
    for(var i in arr){
      if (arr[i] > 90 && arr[i] < 180){
        result.push(i);
      }
    }
    return result;
  }

  function findDownIndeces(arr){
    var result = [];
    for(var i in arr){
      if (arr[i] > 0 && arr[i] < 90){
        result.push(i);
      }
    }
    return result;
  }

  function multiplyArrays(arr1, arr2){
    var result = [];
    if (arr1.length != arr2.length){
      console.log('Error. Arrays are not same size.');
    }
    for (var i in arr1){
      result[i] = arr1[i]*arr2[i];
    }
    return result;
  }

  function specificIndeces(arr,indeces){
    var result = [];
    for (var i in indeces){
      result.push(arr[indeces[i]]);
    }
    return result;
  }

  function sumArray(arr){
    var sum = 0;
    for (var i in arr){
      sum += arr[i];
    }
    return sum;
  }

  function negateArray(arr){
    for (var i in arr){
      arr[i] = -arr[i];
    }
    return arr;
  }

  function FloatToPowerOfArray(float, arr){
    var result = [];
    for (var i in arr){
      result.push(Math.pow(float,arr[i]));
    }
    return result;
  }

  function arrayExp(arr){
    var result = [];
    for (var i in arr){
      result.push(Math.exp(arr[i]));
    }
    return result;
  }

  var area = {
    walls : 2*height*(length+width),
    ceiling : length*width,
    floor : length*width
  };
  var cr = 5*height*(length+width)/(length*width); // cavity ratio
  var crTable = [0,1,2,3,4,5,6,7,8,9,10];
  var f23Table = [1.0,0.827,0.689,0.579,0.489,0.415,0.355,0.306,0.265,0.231,0.202];
  var f23 = interp1(crTable,f23Table,cr,0);

  var i_avg = average_2d(ies.intensities);
  var zoneAngles;
  if (parseFloat(ies.verticalAngles[0]) == 0){
    if (parseFloat(ies.verticalAngles[ies.verticalAngles.length-1]) == 180){
      zoneAngles = [5,15,25,35,45,55,65,75,85,95,105,115,125,135,145,155,165,175,185];
    }else{ //90
      zoneAngles = [5,15,25,35,45,55,65,75,85];
    }
  }else{ //90
    zoneAngles = [95,105,115,125,135,145,155,165,175,185];
  }

  var i_z = interp1(ies.verticalAngles, i_avg, zoneAngles, 0);

  var zc = [];
  var halfZone = (zoneAngles[1]-zoneAngles[0])/2;
  for (i in zoneAngles){
    zc[i] = 2*Math.PI*(Math.cos((zoneAngles[i]-halfZone) * Math.PI/180)-Math.cos((zoneAngles[i]+halfZone) * Math.PI/180));
  }

  var qup = findUpIndeces(zoneAngles);
  var qdn = findDownIndeces(zoneAngles);
  var totalFlux = sumArray(multiplyArrays(zc,i_z))/fixtureEfficiency;
  var etaU = sumArray(multiplyArrays(specificIndeces(zc,qup),specificIndeces(i_z,qup)))/totalFlux;
  var etaD = sumArray(multiplyArrays(specificIndeces(zc,qdn),specificIndeces(i_z,qdn)))/totalFlux;
  var kA = [0,0.041,0.070,0.100,0.136,0.190,0.315,0.640,2.10];
  var kB = [0,0.98,1.05,1.12,1.16,1.25,1.25,1.25,0.80];
  var km = arrayExp(multiplyArrays(negateArray(kA),FloatToPowerOfArray(cr,kB)));
  var dm = sumArray(multiplyArrays(multiplyArrays(km,specificIndeces(zc,qdn)),specificIndeces(i_z,qdn)))/(etaD*totalFlux);

  var c1 = (1-reflectance.walls) * (1-f23**2)/(2.5/cr*reflectance.walls*(1-f23**2)+f23*(1-reflectance.walls));
  var c2 = (1-reflectance.ceiling) * (1+f23)/(1+reflectance.ceiling*f23);
  var c3 = (1-reflectance.floor) * (1+f23)/(1+reflectance.floor*f23);
  var c0 = c1 + c2 + c3;

  var cu = (2.5*reflectance.walls*etaD*(1-dm)*c1*c3)/(cr*(1-reflectance.walls)*(1-reflectance.floor)*c0) + (reflectance.ceiling*etaU*c2*c3)/((1-reflectance.ceiling)*(1-reflectance.floor)*c0) + dm*etaD/(1-reflectance.floor)*(1-(reflectance.floor*c3*(c1+c2))/(c0*(1-reflectance.floor)));
  var wec = 2.5/cr*(reflectance.walls*(1-dm)*etaD/(1-reflectance.walls)*(1-(2.5*reflectance.walls*c1*(c2+c3)/(cr*(1-reflectance.walls)*c0))) + reflectance.walls*reflectance.ceiling*etaU*c1*c2/((1-reflectance.walls)*(1-reflectance.ceiling)*c0) + reflectance.walls*reflectance.floor*dm*etaD*c1*c3/((1-reflectance.walls)*(1-reflectance.floor)*c0));
  var cec = 2.5*reflectance.walls*reflectance.ceiling*(1-dm)*etaD*c1*c2/(cr*(1-reflectance.walls)*(1-reflectance.ceiling)*c0) + reflectance.ceiling*etaU/(1-reflectance.ceiling)*(1-reflectance.ceiling*c2*(c1+c3)/((1-reflectance.ceiling)*c0)) + reflectance.ceiling*reflectance.floor*dm*etaD*c2*c3/((1-reflectance.ceiling)*(1-reflectance.floor)*c0);
}

function createSPD(){
  var ctx = document.getElementById("spd").getContext('2d');
  var data = {
    labels: [],
    datasets: [{
      label: 'Normalized SPD',
      borderColor: '#000',
      pointBorderColor: '#000',
      pointBackgroundColor: '#000',
      pointHoverBackgroundColor: '#000',
      pointHoverBorderColor: '#000',
      fill: false,
      borderWidth: 4,
      showLine: true,
      data: []
    }]
  };
  var options = {
  		responsive: true,
  		spanGaps: true,
  		legend: {
  			display: false,
  		},
  		scales: {
  			yAxes: [{
  				ticks: {
  					min: 0,
  					max: 1
  				},
  				scaleLabel: {
  					display: true,
  					labelString: 'Relative Spectral Power (%)',
  					padding: 0,
  				}
  			}],
  			xAxes: [{
  				ticks: {
  					min: 350,
  					max: 750,
  				},
  				scaleLabel: {
  					display: true,
  					labelString: 'Wavelength (nm)',
  					padding: 0,
  				}
  			}]
  		},
  		elements: {
  			point: {
  				radius: 0,
  				hitRadius: 10,
  			}
  		}
  	};
  for (var i = 0; i < spd.wavelengths.length; i++){
    var point = {
      x: spd.wavelengths[i],
      y: spd.powers[i]
    };
    data.datasets[0].data.push(point);
  }
  var spdChart = new Chart(ctx, {
    type: 'scatter',
    data: data,
    options: options
  });
}

function createCandela(){
  function getVAIndex(){
    var angles = ies.intensities[0];
    var max = parseFloat(angles[0]);
    var maxIndex = 0;

    for (var i = 1; i < angles.length; i++) {
      if (parseFloat(angles[i]) > max) {
        maxIndex = i;
        max = angles[i];
      }
    }

    return maxIndex;
  }

  function findIndexOf(angle){
    var ten, tenIndexes = [], diff, indexDiff;
    ten =  Math.round(angle / 10) * 10;
    tenIndexes[0] = (data.labels).indexOf(ten.toString());
    if (ten != 0 && ten != 180){
      tenIndexes[1] = (data.labels).indexOf(ten.toString(),tenIndexes[0] + 1);
    }else{
      return tenIndexes;
    }
    var indexes = tenIndexes;
    if (angle < ten){
      diff = ten - angle;
      indexDiff = diff/stepSize;
      indexes[0] = indexes[0] + indexDiff;
      indexes[1] = indexes[1] - indexDiff;
    }else if (angle > ten){
      diff = angle - ten;
      indexDiff = diff/stepSize;
      indexes[0] = indexes[0] - indexDiff;
      indexes[1] = indexes[1] + indexDiff;
    }else{
      return tenIndexes;
    }
    return indexes;
  }

  function addPoint(angle,index,set,i){
    if (angle % 10 == 0){
      data.labels.push(va[i]);
      data.datasets[0].data[index] = (ies.intensities[set][i]).toFixed(2);
    }else{
      data.labels.push('');
      data.datasets[0].data[index] = (ies.intensities[set][i]).toFixed(2);
    }
  }

  function addBlank(label,index){
    if (label % 10 == 0){
      data.labels.push(label.toString());
      data.datasets[0].data[index] = 0;
    }else{
      data.labels.push('');
      data.datasets[0].data[index] = 0;
    }
  }

  var ctx = document.getElementById("candela").getContext('2d');
  var data = {
    labels: [],
    datasets: [{
      borderColor: "rgb(0,0,255,1)",
      backgroundColor: "rgb(0,0,255,0)",
      data: []
    },{
      borderColor: "rgb(255,0,0,1)",
      backgroundColor: "rgb(255,0,0,0)",
      data: []
    }]
  };
  var options = {
    responsive: true,
    spanGaps: true,
    scale: {
      gridLines: {
        circular: true
      },
      angleLines: {
        display: false
      }
    },
    legend: {
      display: false
    },
    elements: {
      point: {
        radius: 0,
        hitRadius: 10
      }
    }
  };

  var ha = ies.horizontalAngles;
  var firstHA = ha[0];
  var lastHA = ha[ha.length-1];

  var va = ies.verticalAngles;
  var firstVA = va[0];
  var lastVA = va[va.length-1];

  var stepSize = lastVA - va[va.length-2];
  var index, i, label, set, vaIndex;
  if (firstVA == 0){

    // VA: 0 -> 90
    if (lastVA == 90){

      index = 0;
      set = 0;
      for (label = 180; label > lastVA; label=label-stepSize){
        addBlank(label,index);
        index++;
      }
      for (i = va.length-1; i > 0; i--){
        addPoint(va[i],index,set,i);
        index++;
      }
      if (lastHA == 360){
        set = (ha.length + 1)/2;
      }
      for (i = 0; i < va.length; i++){
        addPoint(va[i],index,set,i);
        index++;
      }
      for (label = Number(lastVA) + stepSize; label < 180; label=label+stepSize){
        addBlank(label,index);
        index++;
      }

    // VA: 0 -> 180
    }else if (lastVA == 180){
      index = 0;
      set = 0;
      for (i = va.length-1; i > 0; i--){
        addPoint(va[i],index,set,i);
        index++;
      }
      if (lastHA == 360){
        set = (ha.length + 1)/2;
      }
      for (i = 0; i < va.length-1; i++){
        addPoint(va[i],index,set,i);
        index++;
      }
    }

  // VA: 90 -> 180
  }else if (firstVA == 90){
    index = 0;
    set = 0;
    for(i = va.length-1; i > 0; i--){
      addPoint(va[i],index,set,i);
      index++;
    }
    for (label = 90; label > 0; label = label - stepSize){
      addBlank(label,index);
      index++;
    }
    for (label = 0; label < 90; label = label + stepSize){
      addBlank(label,index);
      index++;
    }
    if (lastHA == 360){
      set = (ha.length + 1)/2;
    }
    for(i = 0; i < va.length-1; i++){
      addPoint(va[i],index,set,i);
      index++;
    }
  }

  if (firstHA == 0){

    // HA: 0 -> 0
    if (lastHA == 0){
      vaIndex = 0;
      index = 0;
      set = 0;
      for (i = 0; i < data.labels.length; i++){
        data.datasets[1].data[index] = va[set][vaIndex];
        index++;
      }
      alert('im not sure this is correct');

    // HA: 0 -> 90
    }else if (lastHA == 90){
      vaIndex = getVAIndex();
      set = 0;
      for (i = 0; i < ha.length; i++){
        indexes = findIndexOf(ha[i]);
        data.datasets[1].data[indexes[0]] = ((ies.intensities[set][vaIndex])).toFixed(2);
        if(indexes.length > 1){
          data.datasets[1].data[indexes[1]] = ((ies.intensities[set][vaIndex])).toFixed(2);
        }
        set++;
      }
      set = 0;
      for (i = 0; i < ha.length; i++){
        indexes = findIndexOf(parseFloat(ha[i]) + 90);
        data.datasets[1].data[indexes[0]] = ((ies.intensities[set][vaIndex])).toFixed(2);
        if(indexes.length > 1){
          data.datasets[1].data[indexes[1]] = ((ies.intensities[set][vaIndex])).toFixed(2);
        }
        set++;
      }

    // HA: 0 -> 180
    }else if (lastHA == 180){
      alert('I have not coded this yet');
    // HA: 0-> 360
    }else if (lastHA == 360){
      var first90 = []
      vaIndex = getVAIndex();
      set = 0;
      for (i = 0; i < ha.length; i++){
        var adjustedHA;
        if (parseFloat(ha[i]) > 180){
          if (ha[i] < 270){
            adjustedHA = parseFloat(ha[i]) - 90;
            index = findIndexOf(adjustedHA)[1];
          }else{
            adjustedHA = 450 - parseFloat(ha[i]);
            index = findIndexOf(adjustedHA)[0];
          }
          data.datasets[1].data[index] = ((ies.intensities[set][vaIndex])).toFixed(2);
          set++;
        }
        else{
          if (ha[i] < 90){
            adjustedHA = 90 - parseFloat(ha[i]);
            index = findIndexOf(adjustedHA)[0];
          }else{
            adjustedHA = parseFloat(ha[i]) - 90;
            index = findIndexOf(adjustedHA)[1];
            if (ha[i] == 90){
              index = findIndexOf(adjustedHA)[0];

            }
          }
          data.datasets[1].data[index] = ((ies.intensities[set][vaIndex])).toFixed(2);
          set++;
        }
      }
      alert('I have not coded this yet');
    }

  // HA: 90 -> 270
  }else if (firstHA == 90){
    alert('I have not coded this yet');
  }


  var candelaChart = new Chart(ctx,{
    type: 'radar',
    data: data,
    options: options
  });
}

function removeLine(raw){
  return raw.substring(raw.indexOf('\r\n') + 2);
}

function iesParse(){
  var raw = ies.raw;
  raw = raw.replace(/ +(?= )/g,'');
  if (raw.substring(0,16) != 'IESNA:LM-63-2002'){
    alert('IESNA:LM-63-2002 required as first line of file');
    return;
  }else{
    raw = raw.substring(18);
  }
  keyvalues = (raw.slice(0,raw.indexOf('TILT='))).split('\r\n');
  raw = raw.slice(raw.indexOf('TILT='));

  for (var i = 0; i < keyvalues.length - 1; i++){
    var key = keyvalues[i].substring(keyvalues[i].lastIndexOf("[") + 1, keyvalues[i].lastIndexOf("]"));
    var value = keyvalues[i].slice(keyvalues[i].indexOf(' '));
    ies.keys[key] = value.substring(1);
  }
  ies.tilt = raw.substring(5,raw.indexOf('\r\n'));
  raw = removeLine(raw);
  if (ies.tilt != 'NONE'){

  }
  var line = raw.substring(0,raw.indexOf('\r\n'));
  raw = removeLine(raw);
  line = line.split(' ');
  ies.numLamps = line[0];
  ies.lumens = line[1];
  ies.multiplier = line[2];
  ies.numVerticalAngles = line[3];
  ies.numHorizontalAngles = line[4];
  ies.photometricType = line[5];
  ies.unitsType = line[6];
  ies.width = line[7];
  ies.length = line[8];
  ies.height = line[9];
  line = raw.substring(0,raw.indexOf('\r\n'));
  raw = removeLine(raw);
  line = line.split(' ');
  ies.ballastFactor = line[0];
  ies.futureUse = line[1];
  ies.inputWatts = line[2];
  raw = raw.replace(/\r\n/g,' ');
  raw = raw.replace(/  +/g, ' ');
  raw = raw.split(' ');
  ies.verticalAngles = raw.slice(0,ies.numVerticalAngles);
  raw = raw.slice(ies.numVerticalAngles);
  ies.horizontalAngles = raw.slice(0,ies.numHorizontalAngles);
  raw = raw.slice(ies.numHorizontalAngles);
  for (i = 0; i < ies.numHorizontalAngles; i++){
    ies.intensities[i] = raw.slice(0,ies.numVerticalAngles);
    raw = raw.slice(ies.numVerticalAngles);
  }
  delete ies.raw;

  // Make sure photometric type C
  if (ies.photometricType != 1){
    if(ies.photometricType == 2){
      alert('Your fixture is photometric type B. You must use type C.');
    }
    if (ies.photometricType == 3){
      alert('Your fixture is photometric type A. You must use type C.');
    }
    return;
  }

  for (var i in ies.intensities){
    for (var j in ies.intensities[i]){
      // ies.intensities[i][j] = ies.intensities[i][j] * ies.multiplier;
      ies.intensities[i][j] = ies.intensities[i][j] * 1;
    }
  }

  console.log(ies);
  spdParse();
}

function spdParse(){
  var raw = spd.raw;
  raw = raw.replace(/ +?/g, '').replace(/\t/g,'').replace(/\r/g,'');
  raw = raw.split('\n');
  for(var i = 0; i < raw.length; i++){
    var split = raw[i].split(',');
    if (split[0] >= 380 && split[0] <= 730){
      spd.wavelengths.push(split[0]);
      spd.powers.push(split[1]);
    }
  }
  buildHTML();
}

function readFile(event) {
  var fileList = event.target.files;
  loadAsText(fileList[0],event.target.id);
}

function loadAsText(theFile,whichFile) {
  var reader = new FileReader();
  reader.onload = function(loadedEvent) {
    if (whichFile == 'iesInput'){
      ies.raw = loadedEvent.target.result;
    }else{
      spd.raw = loadedEvent.target.result;
    }
  };
  reader.readAsText(theFile);
}

function handleFileInput(){
  $('.custom-file-input').on('change', function() {
    if($('#iesInput').val() && $('#spdInput').val()){
      $('#submit').removeClass('disabled');
    }else{
      $('#submit').addClass('disabled');
    }

     var fileName = $(this).val().split('\\').pop();
     $(this).next('.custom-file-label').addClass("selected").html(fileName);
  });

  $('#submit').on('click',function(){
    if(!$('#submit').hasClass('disabled')){
      iesParse();
    }
  });
}

$(document).ready(function(){
  handleFileInput();
});
