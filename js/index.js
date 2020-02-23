var ies = {
  keys: {},
  angles: []
};

var spd = {
  wavelengths: [],
  powers: []
};

function buildContent(){
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
  str += '  <div class="row">';
  str += '    <div class="col-md-3">';
  str += '      <h2 class="text-center">Inputs</h2>';
  str += '    </div>';
  str += '    <div class="col-md-9">';
  str += '    </div>';
  str += '  </div>';
  str += '</div>';
  $('body').html(str).promise().done(buildContent());
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
  	}
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
  var ctx = document.getElementById("candela").getContext('2d');
  var data = {
    labels: [],
    datasets: [{
      borderColor: "rgb(0,0,255,1)",
      backgroundColor: "rgb(0,0,255,0.5)",
      data: []
    },{
      data: []
    }]
  };
  var options = {
    responsive: true,
    spanGaps: true,
    scale: {
      gridLines: {
        circular: true,
      },
    },
    legend: {
      display: false,
    },
    elements: {
      point: {
        radius: 0,
        hitRadius: 10,
      }
    }
  };

  var va = ies.verticalAngles;
  var lastVA = va[va.length-1];

  if (lastVA == 90){

    var index = 0;
    var stepSize = lastVA - va[va.length-2];
    for (var label = 180; label > lastVA; label=label-stepSize){
      console.log(label);
      if (label % 10 == 0){
        data.labels.push(label);
        data.datasets[0].data[index] = 0;
      }else{
        data.labels.push('');
        data.datasets[0].data[index] = 0;
      }
      index++
    }
    for (var i = va.length-1; i > 0; i--){
      console.log(va[i]);
      if (va[i] % 10 == 0){
        data.labels.push(va[i]);
        data.datasets[0].data[index] = ies.angles[0][i];
      }else{
        data.labels.push('');
        data.datasets[0].data[index] = ies.angles[0][i];
      }
      index++
    }
    for (i = 0; i < va.length; i++){
      console.log(va[i]);
      if (va[i] % 10 == 0){
        data.labels.push(va[i]);
        data.datasets[0].data[index] = ies.angles[0][i];
      }else{
        data.labels.push('');
        data.datasets[0].data[index] = ies.angles[0][i];
      }
      index++;
    }
    for (label = Number(lastVA) + stepSize; label < 180; label=label+stepSize){
      console.log(label);
      if (label % 10 == 0){
        data.labels.push(label);
        data.datasets[0].data[index] = 0;
      }else{
        data.labels.push('');
        data.datasets[0].data[index] = 0;
      }
      index++;
    }

  }else if (lastVA == 180){

    var index = 0;
    for (var i = va.length-1; i > 0; i--){
      if (va[i] % 10 == 0){
        data.labels.push(va[i]);
        data.datasets[0].data[index] = ies.angles[0][i];
      }else{
        data.labels.push('');
        data.datasets[0].data[index] = ies.angles[0][i];
      }
      index++;
    }
    for (i = 0; i < va.length-1; i++){
      if (va[i] % 10 == 0){
        data.labels.push(va[i]);
        data.datasets[0].data[index] = ies.angles[0][i];
      }else{
        data.labels.push('');
        data.datasets[0].data[index] = ies.angles[0][i];
      }
      index++;
    }

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
    ies.angles[i] = raw.slice(0,ies.numVerticalAngles);
    raw = raw.slice(ies.numVerticalAngles);
  }
  delete ies.raw;
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
