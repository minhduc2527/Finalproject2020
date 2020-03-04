/*
 "properties": { "Code": "AD01", "Name": "Bac Giang", "Population": 1691.8,
    "Area": 3895.5,
    "Density": 434.3,
    "Image": 
    [
        "https://storage.cloud.google.com/map_population/Images/BacGiang/ThoHa.jpg",
        "https://storage.cloud.google.com/map_population/Images/BacGiang/DongCao.jpg",
        "https://storage.cloud.google.com/map_population/Images/BacGiang/VinhNghiem.jpg"
    ],
    "Img_Description": 
    [
        "Tho Ha Village, Viet Yen District, Bac Giang",
        "Dong Cao Plateau, Son Dong District, Bac Giang",
        "Vinh Nghiem Pagoda, Yen Dung District, Bac Giang"
    ]
 */
let maxPopulation = 0
let minPopulation = 0
var currentmap_level
var map
let nameSearch = 'null'
let nameSearch2 = 'null'
var geocoder;
var marker;
var data_layer;
var infowindow;
var heatmap;
var trafficLayer;
var transitLayer;
var bikeLayer;
var visible = 'on'
var bounds
//bỏ dấu tiếng việt
function getFixedName(str) {
    if (str == undefined) {
        return undefined
    }
    else {
        str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
        str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
        str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
        str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
        str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
        str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
        str = str.replace(/đ/g, "d");
        str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
        str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
        str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
        str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
        str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
        str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
        str = str.replace(/Đ/g, "D");
        str = str.replace('Tp. ', '')
        str = str.replace('Tx. ', '')
        str = str.replace('TP. ', '')
        str = str.replace('TX. ', '')
        str = str.replace(/\s+/g, '')
        str = str.replace('tinh', '')
        return str;
    }
}
function storeCoordinate(xVal, yVal, array) {
    array.push({ lng: xVal, lat: yVal })
}
function getWardArray(url) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", url, false); // false for synchronous request
    xmlHttp.send(null);
    var arr = xmlHttp.responseText;
    var jsonarr = JSON.parse(arr)
    return jsonarr
}
// lấy coordinate HN
function getCoordinate(str) {
    var arr = str.split(/,| /)
    for (var i = 0; i < arr.length; i++) {
        arr[i] = arr[i] * 1
    }
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] === 0) {
            arr.splice(i, 1);
        }
    }
    var Coordinate = []
    for (var i = 0; i < arr.length;) {
        storeCoordinate(arr[i], arr[i + 1], Coordinate);
        i = i + 2
    }
    return Coordinate
}
// draw layer from search result
function drawSearch(arrString) {
    var message = []
    var n1, n2
    arrString.forEach(element => {
        switch (element.types[0]) {
            case "administrative_area_level_1":
                message.push({ types: "ad1", name: getFixedName(element.short_name) })
                n1 = getFixedName(element.short_name)
                break;
            case "locality":
                message.push({ types: "locality", name: getFixedName(element.short_name) })
                n2 = getFixedName(element.short_name)
                break;
            case "administrative_area_level_2":
                message.push({ types: "ad2", name: getFixedName(element.short_name) })
                n2 = getFixedName(element.short_name)
                break;
        }
    }
    )
    console.log(message[0].types + " found!")
    switch (message[0].types) {
        case "ad1":
            nameSearch = n1
            DistrictLevelMap(nameSearch)
            break;
        case "ad2":
            nameSearch = n1
            nameSearch2 = n2
            WardLevelMap(nameSearch, nameSearch2)
            break;
        case "locality":
            if (n2 == "HoChiMinh") {
                nameSearch = n2
                DistrictLevelMap(nameSearch)
            }
            else if (message[1].types == "ad1") {
                nameSearch = n1
                nameSearch2 = n2
                WardLevelMap(nameSearch, nameSearch2)
            }
            else if (message[1].types == "ad2") {
                nameSearch = n1
                DistrictLevelMap(nameSearch)
            }
    }
}
//lấy population từ database
function getPopulation(P) {
    if (isNaN(P)) {
        var a = P.replace(/\,/g, '')
        a = parseInt(a)
        return a
    }
    else {
        return P
    }
}
function colorOverlay(population) {
    var heso = (population - minPopulation) / (maxPopulation - minPopulation)//dân số tăng hệ số tăng
    var colorchange = heso * 510 //dân số tăng colorchange tăng
    var red = green = blue = 0
    // if(currentmap_level != 'Province'){
    if (colorchange < 255) {
        blue = 30
        red = colorchange * (225 / 255) + 30
        green = 255
    }
    else {
        blue = 30
        red = 255
        green = (-45 / 51) * colorchange + 480
    }
    if (population == 0) {
        green = 255
        red = blue = 30
    }
    return ["rgb(", red, ",", green, ",", blue, ")"].join("")
}
// Data Layer with current level : Ward
function WardLevelMap(name1, name2) {
    if (visible == 'on') {
        currentmap_level = 'Ward'

        infowindow.close()
        data_layer.forEach(function (feature) {
            data_layer.remove(feature);
        });

        maxPopulation = 0
        minPopulation = 81690

        var link = 'https://storage.googleapis.com/map_population/' + name1.replace(/\s+/g, '') + '/' + name2.replace(/\s+/g, '') + '.json'
        console.log(link)
        var WardData = getWardArray(link)
        maxPopulation = WardData[0].Population
        minPopulation = WardData[0].Population
        for (var j = 0; j < WardData.length; j++) {
            if (WardData[j].Population > maxPopulation) {
                maxPopulation = WardData[j].Population
            }
            if (WardData[j].Population < minPopulation) {
                minPopulation = WardData[j].Population
            }
        }

        var delta = maxPopulation - minPopulation
        $("div.cm").each(function (i) {
            switch (i) {
                case 0:
                    $(this).text(minPopulation)
                    break;
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                case 6:
                    $(this).text(Math.round((minPopulation + delta * i * 1 / 7) / 1000) * 1000)
                    break;
                case 7:
                    $(this).text(maxPopulation)
                    break;
            }
        });

        console.log('Ward  level drawn, current map level is: ' + currentmap_level + ' of district: ' + nameSearch2 + ' city: ' + nameSearch)
        for (var i = 0; i < WardData.length; i++) {
            if (getFixedName(WardData[i].District) == name2) {
                var color = colorOverlay(getPopulation(WardData[i].Population))
                data_layer.add(
                    {
                        geometry: new google.maps.Data.Polygon([getCoordinate(WardData[i].WardCoordinates)]),
                        properties: {
                            color: color,
                            id: i,
                            Province: WardData[i].Province,
                            District: WardData[i].District,
                            Ward: WardData[i].Ward,
                            Population: WardData[i].Population,
                            Density: Math.round(WardData[i].Density)
                        }
                    })
                data_layer.setStyle(function (feature) {
                    var color = feature.getProperty('color');
                    return ({
                        strokeColor: 'purple',
                        strokeOpacity: 1,
                        strokeWeight: 0.2,
                        fillColor: color,
                        fillOpacity: 1
                    });
                });
            }
        }
    }
}

//Data Layer with current level : District
function DistrictLevelMap(name) {
    name = name.replace(/\s+/g, '');
    infowindow.close()
    if (visible == 'on' && name != 'null') {
        currentmap_level = 'District'

        data_layer.forEach(function (feature) {
            data_layer.remove(feature);
        });
            console.log('District level drawn, current map level is: ' + currentmap_level + ' of ' + nameSearch)
            for (var i = 0; i < MaxMinPopulation.length; i++) {
                if (name == getFixedName(MaxMinPopulation[i].Province)) {
                    maxPopulation = MaxMinPopulation[i].Max
                    minPopulation = MaxMinPopulation[i].Min
                }
            }
            console.log(minPopulation, maxPopulation)
            var delta = maxPopulation - minPopulation
            $("div.cm").each(function (i) {
                switch (i) {
                    case 0:
                        $(this).text(minPopulation)
                        break;
                    case 1:
                    case 2:
                    case 3:
                    case 4:
                    case 5:
                    case 6:
                        $(this).text(Math.round((minPopulation + delta * i * 1 / 7) / 1000) * 1000)
                        break;
                    case 7:
                        $(this).text(maxPopulation)
                        break;
                }
            });
            var link = 'https://storage.googleapis.com/map_population/' + name + '.json'
            console.log(link)
            data_layer.loadGeoJson(link)
            data_layer.setStyle(function (feature) {

                var P = feature.getProperty('Dan_So')
                var color = colorOverlay(P)
                return {
                    strokeColor: 'purple',
                    strokeOpacity: 1,
                    strokeWeight: 0.2,
                    fillColor: color,
                    fillOpacity: 1
                }
            })
    }
    else if(name == 'null')
        alert('No city or province selected')
    

}
//initialize gg map on the website
function ProvinceLevelMap() {
    infowindow.close()
    if (visible == 'on') {
        
        currentmap_level = 'Province'

        geocoder.geocode({ address: "Viet Nam" }, function (results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                map.setCenter(results[0].geometry.location);
                map.fitBounds(results[0].geometry.viewport);
            }
        });

        data_layer.forEach(function (feature) {
            data_layer.remove(feature);
        });
        maxPopulation = 8598700
        minPopulation = 327900

        var delta = maxPopulation - minPopulation
        console.log(delta * 0.1 + minPopulation)
        $("div.cm").each(function (i) {
            switch (i) {
                case 0:
                    $(this).text(minPopulation)
                    break;
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                case 6:
                    $(this).text(Math.round((minPopulation + delta * i * 1 / 7) / 1000) * 1000)
                    break;
                case 7:
                    $(this).text(maxPopulation)
                    break;
            }
        });

        data_layer.loadGeoJson(
            'https://storage.googleapis.com/map_population/citylevelBoundary.json'
        )
        console.log('Province level drawn, current map level is: ' + currentmap_level)

        data_layer.setStyle(function (feature) {
            var color = colorOverlay(feature.getProperty("Population") * 1000) 
            return {
                strokeColor: 'purple',
                strokeOpacity: 1,
                strokeWeight: 0.4,
                fillColor: color,
                fillOpacity: 1
            }
        })
    }
}
