import * as THREE from '../node_modules/three/build/three.module.js';

import Stats from '../node_modules/three/examples/jsm/libs/stats.module.js';
import { GUI } from '../node_modules/three/examples/jsm/libs/dat.gui.module.js';

import { OrbitControls } from '../node_modules/three/examples/jsm/controls/OrbitControls.js';

var renderer, scene, camera;

var param = {};
var stats;

init();
animate();

function init() {

  scene = new THREE.Scene();


  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputEncoding = THREE.sRGBEncoding;
  document.body.appendChild( renderer.domElement );

  // Check for float-RT support
  // TODO (abelnation): figure out fall-back for float textures

  if ( ! renderer.extensions.get( 'OES_texture_float' ) ) {

    alert( 'OES_texture_float not supported' );
    throw 'missing webgl extension';

  }

  if ( ! renderer.extensions.get( 'OES_texture_float_linear' ) ) {

    alert( 'OES_texture_float_linear not supported' );
    throw 'missing webgl extension';

  }

  camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 1000 );
  camera.position.set( 0, 20, 35 );

  var controls = new OrbitControls( camera, renderer.domElement );
  controls.minDistance = 20;
  controls.maxDistance = 50;
  controls.maxPolarAngle = Math.PI / 2;

  scene.add( new THREE.AmbientLight( 0x222222 ) );

  var axesHelper = new THREE.AxesHelper( 100 );
  scene.add( axesHelper );

  var geometry = new THREE.PlaneBufferGeometry( 20, 20);
  var material = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide} );
  var plane = new THREE.Mesh( geometry, material );
  scene.add( plane );
}

function animate(){
  requestAnimationFrame( animate );
  renderer.render( scene, camera );
}
