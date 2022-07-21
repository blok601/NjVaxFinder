var cache = {}
var vdata = {}
var markers = {}
var zipCodeLL = {}
var zipCodeMarkers = {};
var map;
var circle = null;

function fetch() {
    $.get('http://www.njvaxfinder.com:80/data', {}, function (data) {
        // console.log("Printing data from get:")
        // console.log("Type: "+ (typeof data))
        for (var k in data) {
            cache[k] = data[k]
        }
        // console.log(cache)
    });
    console.log("Done! " + cache)

    $.get('http://www.njvaxfinder.com:80/zips', {}, function (data) {
        //list of dictionaries
        console.log(data)
        for (var dict in data) {
            //each is a dict
            var item = data[dict]
            var zip = item["zip"]
            var lat = item["lat"];
            var long = item["lng"];
            zipCodeLL[zip] = [lat, long];
        }
    });
}

function getVaccineData() {
    $.get('http://www.njvaxfinder.com/vdata', {}, function (data) {
        // console.log(data)
        vdata = data
        for (var k in data) {
            // console.log("Loop: " + k)
        }

        vdata = {}
        var extra = data[0];
        for (var b in extra) {
            vdata[b] = data[0][b]
        }


        // console.log(vdata)
        document.getElementById('DosesD').innerHTML = numberWithCommas(vdata["Doses_Distributed"]);
        document.getElementById('DosesA').innerHTML = numberWithCommas(vdata["Doses_Administered"]);
        document.getElementById('FDR').innerHTML = numberWithCommas(vdata["Administered_Dose1_Recip"]);
        document.getElementById('SDR').innerHTML = numberWithCommas(vdata["Administered_Dose2_Recip"]);
        // document.getElementById('LUD').innerHTML = "Last Updated: " + vdata["Last_Updated"]
    });
}

function loadTable() {
    var zip = document.getElementById('searchForm').value;
    if (zip === undefined || zip === "") {
        //console.log("Broke")
        // clearTable()
        return;
    }
    clearTable();
    console.log(zip)
    var ids = findByZip(zip);
    console.log(ids)

    var table = document.getElementById('myTable');
    var phoneTag = "<td class=\"align-middle\"><span class=\"badge badge-success badge-pill\">";
    var closePhoneTag = "</span>"
    var webStart = "<div><span><a href=\"http://"
    var webEnd = "\" target=\"_blank\"><span class=\"badge badge-info badge-pill\" style=\"font-size: small\">Website <i class=\"fa fa-external-link\"></i></span></a></span></div>"


    var CVSRow = table.insertRow(1);
    var CVSName = CVSRow.insertCell(0);
    var CVSPhone = CVSRow.insertCell(1);
    var CVSWebsite = CVSRow.insertCell(2);
    CVSName.innerHTML = "<strong>CVS Pharmacy<strong>";
    CVSPhone.innerHTML = phoneTag + "1-800-552-8159" + closePhoneTag
    CVSWebsite.innerHTML = webStart + "www.cvs.com/immunizations/covid-19-vaccine" + webEnd

    var ShopRiteRow = table.insertRow(2);
    var ShopRiteName = ShopRiteRow.insertCell(0);
    var ShopRitePhone = ShopRiteRow.insertCell(1);
    var ShopRiteWebsite = ShopRiteRow.insertCell(2);
    ShopRiteName.innerHTML = "<strong>ShopRite<strong>";
    ShopRitePhone.innerHTML = phoneTag + "1-800-746-7748" + closePhoneTag
    ShopRiteWebsite.innerHTML = webStart + "vaccines.shoprite.com" + webEnd

    var RiteAidRow = table.insertRow(3);
    var RiteAidName = RiteAidRow.insertCell(0);
    var RiteAidPhone = RiteAidRow.insertCell(1);
    var RiteAidWebsite = RiteAidRow.insertCell(2);
    RiteAidName.innerHTML = "<strong>RiteAid<strong>";
    RiteAidPhone.innerHTML = phoneTag + "1-800-748-3242" + closePhoneTag
    RiteAidWebsite.innerHTML = webStart + "www.riteaid.com" + webEnd

    var ACMRow = table.insertRow(4);
    var ACMName = ACMRow.insertCell(0);
    var ACMPhone = ACMRow.insertCell(1);
    var ACMWebsite = ACMRow.insertCell(2);
    ACMName.innerHTML = "<strong>Atlantic County Megasite<strong>";
    // ACMPhone.innerHTML = phoneTag + "" + closePhoneTag
    ACMWebsite.innerHTML = webStart + "vaccination.atlanticare.org/default.aspx" + webEnd

    var BCMRow = table.insertRow(5);
    var BCMName = BCMRow.insertCell(0);
    var BCMPhone = BCMRow.insertCell(1);
    var BCMWebsite = BCMRow.insertCell(2);
    BCMName.innerHTML = "<strong>Bergen County Megasite<strong>";
    // BCMPhone.innerHTML = phoneTag + "X" + closePhoneTag
    BCMWebsite.innerHTML = webStart + "www.hackensackmeridianhealth.org/covid19/" + webEnd

    var BurlRow = table.insertRow(6);
    var BurlName = BurlRow.insertCell(0);
    var BurlPhone = BurlRow.insertCell(1);
    var BurlWebsite = BurlRow.insertCell(2);
    BurlName.innerHTML = "<strong>Burlington County Megasite<strong>";
    // BurlPhone.innerHTML = phoneTag + "(855) 568-0545" + closePhoneTag
    BurlWebsite.innerHTML = webStart + "www.virtua.org/vaccine" + webEnd

    var GCMRow = table.insertRow(7);
    var GCMName = GCMRow.insertCell(0);
    var GCMPhone = GCMRow.insertCell(1);
    var GCMWebsite = GCMRow.insertCell(2);
    GCMName.innerHTML = "<strong>Gloucester County Megasite<strong>";
    // GCMPhone.innerHTML = phoneTag + "X" + closePhoneTag
    GCMWebsite.innerHTML = webStart + "covidvaccine.nj.gov" + webEnd

    var MCMRow = table.insertRow(8);
    var MCMName = MCMRow.insertCell(0);
    var MCMPhone = MCMRow.insertCell(1);
    var MCMWebsite = MCMRow.insertCell(2);
    MCMName.innerHTML = "<strong>Middlesex County Megasite<strong>";
    // MCMPhone.innerHTML = phoneTag + "(732) 745-3100" + closePhoneTag
    MCMWebsite.innerHTML = webStart + "www.rwjbh.org/patients-visitors/what-you-need-to-know-about-covid-19/schedule-a-vaccine/covid-19-vaccine-appointment-request-form/" + webEnd

    var MorrisRow = table.insertRow(9);
    var MorrisName = MorrisRow.insertCell(0);
    var MorrisPhone = MorrisRow.insertCell(1);
    var MorrisWebsite = MorrisRow.insertCell(2);
    MorrisName.innerHTML = "<strong>Morris County Megasite<strong>";
    // MorrisPhone.innerHTML = phoneTag + "X" + closePhoneTag
    MorrisWebsite.innerHTML = webStart + "www.atlantichealth.org/conditions-treatments/coronavirus-covid-19/covid-vaccine.html?utm_source=multiple&utm_medium=multiple&utm_campaign=vaccine" + webEnd

    for (var i = 0; i < ids.length; i++) {
        var row = table.insertRow(i + 1);
        // Insert new cells (<td> elements) at the 1st and 2nd position of the "new" <tr> element:
        var nameCell = row.insertCell(0);
        var phoneCell = row.insertCell(1);
        var websiteCell = row.insertCell(2);
        var zipCell = row.insertCell(3);
        // var list =
        // for (const mapID in list){
        //     console.log("This is: " + list[mapID]);
        //     ids.push(list[mapID]);
        // }

        // Add some text to the new cells:
        var temp = ids[i]
        console.log(temp)
        websiteCell.innerHTML = cache[temp][3];
        zipCell.innerHTML = cache[temp][4]
        var ahref = "<a href=\"http://"
        var link = cache[temp][3]
        var g = "\" target=\"_blank\""
        var end = ">" + link
        var close = "</a>"
        if (link.startsWith("http://")) {
            link = link.replace("http://", "");
        }

        if (link.startsWith("https://")) {
            link = link.replace("https://", "")
        }

        var webStart = "<div><span><a href=\"http://" + link + "\" target=\"_blank\"><span class=\"badge badge-info badge-pill\" style=\"font-size: small\">Website <i class=\"fa fa-external-link\"></i></span></a></span></div>"
        websiteCell.innerHTML = webStart;

        var tdTag = "<td class=\"align-middle\"><span class=\"badge badge-success badge-pill\">";
        var num = cache[temp][2]
        var closeSpan = "</span>"
        phoneCell.innerHTML = tdTag + num + closeSpan;

        var nameDiv = "<div><strong>" + cache[temp][0] + "</strong>"
        var smallDiv = "<div class=\"small mb-2\">" + cache[temp][1] + "</div></div>"
        nameCell.innerHTML = nameDiv + smallDiv

    }
    var firstList = ids;
    var firstAmount = ids.length;
    var extra = alterMap(zip, ids)
    ids = []
    for (const index in extra) {
        if (firstList.includes(extra[index])) {
            continue;
        }
        ids.push(extra[index]);
        console.log("Adding " + extra[index]);
    }
    for (var i = 0; i < ids.length; i++) {
        var row = table.insertRow(i + 1);
        // Insert new cells (<td> elements) at the 1st and 2nd position of the "new" <tr> element:
        var nameCell = row.insertCell(0);
        var phoneCell = row.insertCell(1);
        var websiteCell = row.insertCell(2);
        var zipCell = row.insertCell(3);
        // var list =
        // for (const mapID in list){
        //     console.log("This is: " + list[mapID]);
        //     ids.push(list[mapID]);
        // }

        // Add some text to the new cells:
        var temp = ids[i]
        console.log(temp)
        websiteCell.innerHTML = cache[temp][3];
        zipCell.innerHTML = cache[temp][4]
        var ahref = "<a href=\"http://"
        var link = cache[temp][3]
        var g = "\" target=\"_blank\""
        var end = ">" + link
        var close = "</a>"
        if (link.startsWith("http://")) {
            link = link.replace("http://", "");
        }

        if (link.startsWith("https://")) {
            link = link.replace("https://", "")
        }

        var webStart = "<div><span><a href=\"http://" + link + "\" target=\"_blank\"><span class=\"badge badge-info badge-pill\" style=\"font-size: small\">Website <i class=\"fa fa-external-link\"></i></span></a></span></div>"
        websiteCell.innerHTML = webStart;

        var tdTag = "<td class=\"align-middle\"><span class=\"badge badge-success badge-pill\">";
        var num = cache[temp][2]
        var closeSpan = "</span>"
        phoneCell.innerHTML = tdTag + num + closeSpan;

        var nameDiv = "<div><strong>" + cache[temp][0] + "</strong>"
        var smallDiv = "<div class=\"small mb-2\">" + cache[temp][1] + "</div></div>"
        nameCell.innerHTML = nameDiv + smallDiv
    }

    document.getElementById('resultAmount').innerHTML = ids.length + firstAmount + 3 + "";
}

function findByZip(zip) {
    var ids = [];
    for (var k in cache) {
        if (cache[k].includes(zip)) {
            // console.log("Adding " + k)
            ids.push(k);
        }
    }
    return ids;
}

function alterMap(zip, extra) {
    var radius = parseInt(document.getElementById('dropdown').value * 1000);
    if (radius === undefined || radius === "") {
        return;
    }

    clearMarkers()
    if (circle != null) {
        circle.setMap(null)
    }
    //have radius, get center
    var zipCenterMarker = zipCodeMarkers[zip];
    map.setCenter(zipCenterMarker.getPosition())
    zipCenterMarker.setMap(map)
    // search in a radius
    // create the circle area
    circle = new google.maps.Circle({
        center: zipCenterMarker.getPosition(),
        radius: radius,
        fillOpacity: 0.35,
        fillColor: "#FF0000",
        map: map
    });
    var bounds = new google.maps.LatLngBounds();
    var toReturnIds = []
    for (const mid in markers) {
        var mark = markers[mid];
        if (google.maps.geometry.spherical.computeDistanceBetween(zipCenterMarker.getPosition(), mark.getPosition()) <= radius) {
            bounds.extend(mark.getPosition())
            toReturnIds.push(mid);
            mark.setMap(map);
        }
    }
    for (const extrMarkerID in extra){
        var thePlaceID = extra[extrMarkerID];
        var m = markers[thePlaceID];
        bounds.extend(m.getPosition());
        m.setMap(map);
    }
    map.fitBounds(bounds)
    return toReturnIds;
}

function clearTable() {
    var table = document.getElementById('myTable');
    try {
        for (var i = table.rows.length - 1; i > 0; i--) {
            table.deleteRow(i);
        }
    } catch (error) {
        alert(error)
    }

    clearMarkers()
}

function clearMarkers() {
    for (const [key, value] of Object.entries(markers)) {
        value.setMap(null)
    }
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function initMap() {
    console.log("initializing map!")
    // The location of Uluru
    const lville = {lat: 38.9639, lng: 74.9092};
    // The map, centered at Uluru
    map = new google.maps.Map(document.getElementById("mapDiv"), {
        center: lville,
        zoom: 11,
    });
    // The marker, positioned at Uluru
    setTimeout(loadMarkers, 200)
}

function loadMarkers() {
    for (const [key, value] of Object.entries(cache)) {
        //lat is 5, lng is 6
        //console.log("Creating marker for " + key)
        var row = cache[key];
        var latitude = row[5];
        var longitude = row[6];
        const LL = {lat: parseFloat(latitude), lng: parseFloat(longitude)}
        console.log("Creating marker at: " + latitude + ", " + longitude + " for zip " + row[1]);
        var marker = new google.maps.Marker({
            position: LL,
            title: row[1],
        });
        addInfoWindow(marker, row[0], row[1]);
        markers[key] = marker;
        if (!(row[4] in zipCodeMarkers)) {
            var zipCode = row[4].toString();
            var zipLL = zipCodeLL[zipCode]; // gives a [lat, lng]
            console.log("Attempting zip marker for " + zipCode);
            if(zipLL == undefined || zipLL.length != 2) {
                console.log("Unsuccessful")
                continue
            }
            const ZLL = {lat: parseFloat(zipLL[0]), lng: parseFloat(zipLL[1])};
            var zipMarker = new google.maps.Marker({
                position: ZLL
            });
            zipCodeMarkers[zipCode] = zipMarker;
            console.log("Created zip marker for zip " + zipCode);
        }
    }
}

function addInfoWindow(marker, name, address){
    var c = "<div><strong>" + name + "</strong></div><p>"+address + "</p>"
    var infoWindow = new google.maps.InfoWindow({
        content: c
    });

    google.maps.event.addListener(marker, 'mouseover', function () {
        infoWindow.open(map, marker);
    });
}
