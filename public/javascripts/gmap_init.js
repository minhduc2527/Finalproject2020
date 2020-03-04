function initMap() {
    // initialize the center
    var initialLat = $('.search_latitude').val();
    var initialLong = $('.search_longitude').val();
    //Thua thien hue lat lng
    initialLat = initialLat ? initialLat : 16.467397;
    initialLong = initialLong ? initialLong : 107.59053259999996;
    var LatLng = new google.maps.LatLng(initialLat, initialLong);

    // create options for the map
    var options = {
        zoom: 6,
        gestureHandling: 'cooperative',
        center: LatLng,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
            position: google.maps.ControlPosition.RIGHT_TOP
        },
        zoomControl: true,
        streetViewControl: false,
    };
    //create map
    map = new google.maps.Map(document.getElementById("map"), options);

    //create geocoding map
    geocoder = new google.maps.Geocoder();
    //create data layer and infowindow
    infowindow = new google.maps.InfoWindow()
    data_layer = new google.maps.Data({ map: map });
    // heatmap = new google.maps.visualization.HeatmapLayer();
    // trafficLayer = new google.maps.TrafficLayer();
    // transitLayer = new google.maps.TransitLayer();
    // transitLayer = new google.maps.BicyclingLayer();
    ProvinceLevelMap()
    // BDSBadinh()

    //create marker
    marker = new google.maps.Marker({
        position: LatLng
    });
    data_layer.addListener('mouseover', function(event){
        data_layer.overrideStyle(event.feature, {strokeColor: "bluepurple",strokeWeight: 2,zIndex: 10});
        var name
        var delta = maxPopulation-minPopulation
        var population, percentage
        if (currentmap_level == 'Province') {
            name = event.feature.getProperty("Name")
            population = event.feature.getProperty("Population")*1000
        }
        else if (currentmap_level == 'District') {
            name = event.feature.getProperty("Ten_Huyen")
            population = event.feature.getProperty("Dan_So")
        }
        else if (currentmap_level == 'Ward') {
            name = event.feature.getProperty('Ward')
            population = event.feature.getProperty("Population")
        }
        percentage = (population - minPopulation)/delta*100
        $("#data-caret").css("left", percentage - 1.5 + "%")
        document.getElementById('PolygonName').innerHTML = name
    })

    data_layer.addListener('mouseout', function(event){
        data_layer.revertStyle(event.feature);
    })

    data_layer.addListener('click', function (event) {
        var feat = event.feature;
        let html = "";
        var polygonInfo;
        var bounds = new google.maps.LatLngBounds();
        data_layer.forEach(function (feature) {
            feat.getGeometry().forEachLatLng(function (latlng) {
                bounds.extend(latlng);
            });
        });
        map.fitBounds(bounds);

        if (currentmap_level == 'Province') {
            html = "<b>" + feat.getProperty("Name") + "</b><br>" + feat.getProperty("Population")*1000+ "</b><br>";
            polygonInfo = {Name: feat.getProperty("Name"), Population: feat.getProperty("Population")*1000, Area: feat.getProperty("Area"), Density: feat.getProperty('Density'), Image: feat.getProperty("Image"), Img_Des: feat.getProperty("Img_Description")  }
        }
        else if (currentmap_level == 'District') {
            html = "<b>" + feat.getProperty("Ten_Tinh") + "</b><br>" + feat.getProperty("Ten_Huyen") + "</b><br>" + feat.getProperty("Dan_So");
            polygonInfo = {Name: feat.getProperty("Ten_Tinh")+", "+ feat.getProperty("Ten_Huyen"), Population: feat.getProperty("Dan_So"), Area: feat.getProperty("Area"), Density: feat.getProperty('Density'), Image: feat.getProperty("Image"), Img_Des: feat.getProperty("Img_Description")  }
        }
        else if (currentmap_level == 'Ward') {
            html = "<b>" + feat.getProperty('Province') + "</b><br>" + feat.getProperty('District') + "</b><br>" + feat.getProperty('Ward') + "</b><br>" + feat.getProperty('Population');
            polygonInfo = {Name: feat.getProperty('Province') + ", " + feat.getProperty('District') + ", " + feat.getProperty('Ward'), Population: feat.getProperty("Population"), Area: feat.getProperty("Area"), Density: feat.getProperty('Density'), Image: feat.getProperty("Image"), Img_Des: feat.getProperty("Img_Description")  }
        }
        infowindow.setContent(html);
        infowindow.setPosition(bounds.getCenter());
        infowindow.open(map);
        detailInfo(polygonInfo.Name, polygonInfo.Population, polygonInfo.Area, polygonInfo.Density)
        if(polygonInfo.Image != undefined && polygonInfo.Img_Des != undefined)
        showDetailsInfor(polygonInfo.Image,polygonInfo.Img_Des)
        map.setCenter(bounds.getCenter());
    })

    data_layer.addListener('dblclick', function (event) {
        var feat = event.feature;
        infowindow.close()
        if (currentmap_level == 'Province') {
            nameSearch = getFixedName(feat.getProperty("Name"))
            DistrictLevelMap(nameSearch)
        }
        else if (currentmap_level == 'District') {
            nameSearch2 = getFixedName(feat.getProperty("Ten_Huyen"))
            WardLevelMap(nameSearch, nameSearch2)
        }
        else if (currentmap_level == 'Ward') {
            alert("No lower level administration found!")
        }
        event.stop()
    })

    //dropdown menu as a custom control in map
    createDropdown();
    var searchControlDiv = document.createElement('div');
    searchControlDiv.index = 1;
    map.controls[google.maps.ControlPosition.TOP_RIGHT].push(searchControlDiv);
    // marker.setMap(map);
}

function detailInfo(address, population, area, density){
    var densityExpo, areaExpo
    if(density == undefined && area == undefined){
        densityExpo = areaExpo = ""
    }
    else if( area == undefined && density != undefined){
        area = population / density
        area = Math.round(area * 100) / 100
        densityExpo = "Density: "+density + "/km"+"<sup>" + 2 + "</sup>"
        areaExpo = "Area: " + area +" km"+"<sup>" + 2 + "</sup>"
    }
    else{
        densityExpo = "Density: "+density + "/km"+"<sup>" + 2 + "</sup>"
        areaExpo = "Area: " + area +" km"+"<sup>" + 2 + "</sup>"    
    }
    $('#info_address').text("Address: "+ address)
    $('#info_population').text("Population: " + population)
    $('#info_area').html(densityExpo)
    $('#info_density').html(areaExpo)
}
function showDetailsInfor(polygonImage, polygonDescription){
    // multiple images and desdcription
    var imgLinkList = polygonImage
    var imgDesList = polygonDescription
    // console.log("Description list: "+imgDesList)
    for(var i=0; i<4; i++){
        $('#info_image'+i).removeAttr('src')
        $('#image_description'+i).text(' ')
    }
    if(imgLinkList.length>4){
        var imgArr = new Array()
        imgArr = imgLinkList.split(",")
        var desArr = new Array()
        desArr = imgDesList.split(",")
        console.log("Des array: "+ desArr)
        var index = 0
        for(var i=0; i<imgArr.length; i++){
            if(imgArr[i]!==null){
                $('#info_image'+i).attr('src', imgArr[i])
                $('#image_description'+i).text(desArr[index]+", "+desArr[index+1]+", "+desArr[index+2])
                index+=3
            }    
        }
    } else{
        for(var i=0; i<imgLinkList.length; i++){
            if(imgLinkList[i]!==null){
                $('#info_image'+i).attr('src', imgLinkList[i])
                $('#image_description'+i).text(imgDesList[i])
            } 
        }
    }
}
//get latlng when searching
$(document).ready(function () {
    //autocomplete search
    var PostCodeid = '#search_location';
    $('.get_map').click(function (e) {
        for(var i=0; i<4; i++){
            $('#info_image'+i).removeAttr('src')
            $('#image_description'+i).text(' ')
        }
        var address = $(PostCodeid).val();
        geocoder.geocode({ 'address': address }, function (results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                marker.setPosition(results[0].geometry.location)
                map.setCenter(results[0].geometry.location);
                map.fitBounds(results[0].geometry.viewport);
                $('#info_title').text("Search result: ")
                $('#info_address').text("Address: "+results[0].formatted_address);
                $('#info_population').text("")
                $('#info_area').text("")
                $('#info_density').text("")
                $('#maps_bar_list_item_info').css("color", "black")
                var search_addr = '<b>' + results[0].formatted_address + '</b>'
                infowindow.setContent(search_addr)
                infowindow.setPosition(results[0].geometry.location)
                drawSearch(results[0].address_components)

            } else {
                alert("Geocode was not successful for the following reason: " + status);
            }
        });
        marker.setMap(map)
        e.preventDefault();
    })
})

