function bcBack(){
  var str = '';
  str += '<div class="card-deck">';
  str += '  <div class="card hover">';
  str += '    <a id="opt1">';
  str += '      <img class="card-img-top" src="" alt="SPD data format help option 1 image" />';
  str += '      <div class="card-body">';
  str += '        <h5 class="card-title">Option 1</h5>';
  str += '        <hr />';
  str += '        <p>I have the wavelengths and power values together.</p>';
  str += '      </div>';
  str += '    </a>';
  str += '  </div>';
  str += '  <div class="card hover">';
  str += '    <a id="opt2">';
  str += '      <img class="card-img-top" src="img/opt2.png" alt="SPD data format help option 2 image" />';
  str += '      <div class="card-body">';
  str += '        <h5 class="card-title">Option 2</h5>';
  str += '        <hr />';
  str += '        <p>I have the wavelengths and power values seperately.</p>';
  str += '      </div>';
  str += '    </a>';
  str += '  </div>';
  str += '</div>';
  $('#SPDhelp-modal-body').html(str);
  $('#SPDhelp-modal-breadcrumb').html('');
  $('#opt1').on('click',function(){
    opt1();
  });
  $('#opt2').on('click',function(){
    opt2();
  });
}

function createCSV(wavelengths, powers){
  wavelengths = wavelengths.split('\n');
  powers = powers.split('\n');
  var str = '';
  for (var i = 0; i < wavelengths.length; i++){
    str += wavelengths[i] + ' , ' + powers[i];
    if (i != wavelengths.length - 1) {
      str += '\n';
    }
  }

  $('#csvdownload').attr('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(str));
  $('#csvdownload').attr('download', 'custom.csv');
  $('#csvdownload')[0].click();
}

function opt1(){
  console.log('1');
}

function validateOption2(wavelengths, powers){
  wavelengths = wavelengths.trim();
  powers = powers.trim();
  var wl = wavelengths.split('\n');
  var p = powers.split('\n');
  var alert0 = true, alert1 = true, alert2 = true, alert3 = true, alert4 = true, alert5 = true;

  // alert 0
  if(!$('#opt2-wavelengths').val() || !$('#opt2-powers').val()){
    var str0 = '';
    str0 += '<div id="opt2-alert0" class="alert alert-danger" role="alert">';
    str0 += '  <strong>Error!</strong> It seems you\'ve left one or both of the input fields empty.';
    str0 += '</div>';
    if(!$('#opt2-alert0').length){
      $('#opt2-error').append(str0);
    }
    alert1 = true;
  }else{
    $('#opt2-alert0').remove();
    alert1 = false;
  }

  // alert 1
  if(wl.length !== p.length){
    var str1 = '';
    str1 += '<div id="opt2-alert1" class="alert alert-danger" role="alert">';
    str1 += '  <strong>Error!</strong> There must be the same number of wavelength and power values.';
    str1 += '</div>';
    if(!$('#opt2-alert1').length){
      $('#opt2-error').append(str1);
    }
    alert1 = true;
  }else{
    $('#opt2-alert1').remove();
    alert1 = false;
  }

  // alert 2 and 3
  var checkedwl = [];
  // alert 2
  for (var i = 0; i < wl.length; i++){
    if (wl[i] == '' || wl[i] == undefined || isNaN(wl[i])){
      var str2 = '';
      str2 += '<div id="opt2-alert2" class="alert alert-danger" role="alert">';
      str2 += '  <strong>Error!</strong> Check to make sure all wavelength values are numbers and there are no blank lines';
      str2 += '</div>';
      if(!$('#opt2-alert2').length && !$('#opt2-alert0').length){
        $('#opt2-error').append(str2);
      }
      alert2 = true;
    }else{
      $('#opt2-alert2').remove();
      alert2 = false;
    }

    // alert 3
    if (checkedwl.includes(wl[i])){
      var str3 = '';
      str3 += '<div id="opt2-alert3" class="alert alert-danger" role="alert">';
      str3 += '  <strong>Error!</strong> Wavelength values must not contain duplicates';
      str3 += '</div>';
      if(!$('#opt2-alert3').length){
        $('#opt2-error').append(str3);
      }
      alert3 = true;
    }else{
      checkedwl.push(wl[i]);
      $('#opt2-alert3').remove();
      alert3 = false;
    }
  }

  // alert 4 and 5
  for (i = 0; i < p.length; i++){
    // alert 4
    if(p[i] == '' || p[i] == undefined || isNaN(p[i])){
      var str4 = '';
      str4 += '<div id="opt2-alert4" class="alert alert-danger" role="alert">';
      str4 += '  <strong>Error!</strong> Check to make sure all power values are numbers and there are no blank lines';
      str4 += '</div>';
      if(!$('#opt2-alert4').length && !$('#opt2-alert0').length){
        $('#opt2-error').append(str4);
      }
      alert4 = true;
    }else{
      $('#opt2-alert4').remove();
      alert4 = false;
    }

    // alert 5
    if(parseFloat(p[i]) > 1.00 || parseFloat(p[i]) < 0.00){
      var str5 = '';
      str5 += '<div id="opt2-alert5" class="alert alert-danger" role="alert">';
      str5 += '  <strong>Error!</strong> Power values must be normalized (values between 0.00 and 1.00)';
      str5 += '</div>';
      if(!$('#opt2-alert5').length){
        $('#opt2-error').append(str5);
      }
      alert5 = true;
    }else{
      $('#opt2-alert5').remove();
      alert5 = false;
    }
  }

  if(alert0===true && alert1 === false && alert2 === false && alert3 === false && alert4 === false && alert5 === false){
    return true;
  }else{
    return false;
  }
}

function opt2(){
  var str = '';
  str += '<div class="container">';
  str += '  <div class="row">';
  str += '    <div class="col-md-6">';
  str += '      <form>';
  str += '        <div class="form-group">';
  str += '          <label for="opt2-wavelengths">Wavelengths</label>';
  str += '          <textarea class="form-control opt2-textarea" id="opt2-wavelengths" rows="10" placeholder="450&#13;&#10;452&#13;&#10;454&#13;&#10;456&#13;&#10;458&#13;&#10;460&#13;&#10;462&#13;&#10;464&#13;&#10;466&#13;&#10;468"></textarea>';
  str += '        </div>';
  str += '      </form>';
  str += '    </div>';
  str += '    <div class="col-md-6">';
  str += '      <form>';
  str += '        <div class="form-group">';
  str += '          <label for="opt2-wavelengths">Powers</label>';
  str += '          <textarea class="form-control opt2-textarea" rows="10" id="opt2-powers" placeholder="0.83&#13;&#10;0.96&#13;&#10;1.00&#13;&#10;0.94&#13;&#10;0.81&#13;&#10;0.65&#13;&#10;0.54&#13;&#10;0.47&#13;&#10;0.43&#13;&#10;0.40"></textarea>';
  str += '        </div>';
  str += '      </form>';
  str += '    </div>';
  str += '  </div>';
  str += '  <div class="row">';
  str += '    <div class="col" id="opt2-error">';
  str += '    </div>';
  str += '  </div>';
  str += '  <div class="row">';
  str += '    <div class="col text-center">';
  str += '      <button id="opt2-submit" type="submit" class="btn btn-lrc">Get .csv</button>';
  str += '    </div>';
  str += '  </div>';
  str += '</div>';
  str += '<a id="csvdownload" class="hidden">';
  $('#SPDhelp-modal-body').html(str);
  $('#SPDhelp-modal-breadcrumb').html('<ol class="breadcrumb m-0"><i id="bc-back" class="bc-back fas fa-caret-left fa-2x"><span class="bc-back-text">Back</span></i></ol>');
  $('#opt2-submit').on('click',function(){
    if(validateOption2($('#opt2-wavelengths').val(),$('#opt2-powers').val())){
      createCSV($('#opt2-wavelengths').val(),$('#opt2-powers').val());
    }
  });
  $('#bc-back').on('click',function(){
    bcBack();
  });
}

$(document).ready(function(){
  $('#opt1').on('click',function(){
    opt1();
  });

  $('#opt2').on('click',function(){
    opt2();
  });
});
