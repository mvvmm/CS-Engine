var ies = {
  keys: {},
  angles: []
};
var spd = {};

function createCandela(){
  var data, options;
  data = {
    labels: [],
    datasets: [{
      label: 'label',
      fill: false,
      data: []
    }]
  };
  options = {
    scale: {
      gridLines: {
        circular: true
      }
    },
    title: {
      display: true,
      text: 'does this work'
    }
  };
  var ctx = document.getElementById('candela').getContext('2d');
  var candela = new Chart(ctx,{
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
  raw = raw.split(' ');
  ies.verticalAngles = raw.slice(0,ies.numVerticalAngles);
  raw = raw.slice(ies.numVerticalAngles);
  ies.horizontalAngles = raw.slice(0,ies.numHorizontalAngles);
  raw = raw.slice(ies.numHorizontalAngles);
  for (var i = 0; i < ies.numHorizontalAngles; i++){
    ies.angles[i] = raw.slice(0,ies.numVerticalAngles);
    raw = raw.slice(ies.numVerticalAngles);
  }
  createCandela();
  console.log(ies.)
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
      //console.log(spd);
    }
  });
}

$(document).ready(function(){
  handleFileInput();
});
