// new function to open and close side menu
var rotated = false
function close(){
  var mapsBarContainer = document.getElementById('maps_bar_container')
  var windowWidth = screen.width
  var mapContainer = document.getElementsByClassName('maps_map_container')
  console.log(mapsBarContainer.offsetWidth)
  console.log(windowWidth)
  if(mapsBarContainer.offsetWidth==408){
    mapContainer[0].style.width='100%'
    mapContainer[0].style.left = '0'
    mapsBarContainer.style.width = '0'

  } else if(mapsBarContainer.offsetWidth==0){
      mapContainer[0].style.width='calc(100% - 408px)'
      mapContainer[0].style.left='408px'
      mapsBarContainer.style.width = '408px'
  }
  var triBullet = document.getElementById('triangle_bullet')
  var deg = rotated?0:180;
  triBullet.style.webkitTransform = 'rotate('+deg+'deg)'; 
  triBullet.style.mozTransform    = 'rotate('+deg+'deg)'; 
  triBullet.style.msTransform     = 'rotate('+deg+'deg)'; 
  triBullet.style.oTransform      = 'rotate('+deg+'deg)'; 
  triBullet.style.transform       = 'rotate('+deg+'deg)'; 

  rotated = !rotated;
  
}