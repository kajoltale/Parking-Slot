var http = require('http');
var fs = require('fs');
var mysql = require('mysql');

//Connecting to mysql database.
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "parkinglot"
});

//To check available parking slot
function checkAvaibleParkingSlot(req, res) {
        var sql = "select indexNum, parkingSlot from info where parkingSlot = 0";
        con.query(sql, function (err, result,fields) {
            if (err) {
                throw err;
            }
            console.log(result);
            res.writeHead(200, {'Content-Type': 'application/json'});
            var jsonObj = {
                result : result
            }
            console.log(jsonObj);
            var temp = JSON.stringify(jsonObj);
            console.log(temp);
            res.write(temp);
            res.end();
            
        });
}


//Creating a server.
http.createServer(function (req, res) {
    var urlCalled = req.url;
    console.log(urlCalled);
    if(req.url.indexOf('?') != -1) {
        urlCalled = req.url.substring(0, req.url.indexOf('?'));
    }
    console.log("Path: ", urlCalled);

    var responseData = null;
    switch(urlCalled) {
        //Register vehicle number.
        case "/vehicleNum":
            //park(req, res);
            con.connect(function(err) {
                if (err) throw err;
                console.log("Connected!");
                var paramsString = req.url.substring(req.url.indexOf('?')+1, req.url.length);
                var splitArr  = paramsString.split('&');
                var vehicleNum = splitArr[0].substring(splitArr[0].indexOf('=')+1, splitArr[0].length);
                var vehicleNo = parseInt(vehicleNum);
                var sql = "insert into vehicle values ?";
                var values = [[vehicleNo,0]];
                con.query(sql, [values], function (err, result) {
                    if (err) {
                        throw err;
                    }
                    console.log(result);
                });
            });
            
        break;
        case "/availableSlot":
            checkAvaibleParkingSlot(req, res);
        break;
        //Choose slot and park vehicle.
        case "/chooseSlot":
            var paramsString = req.url.substring(req.url.indexOf('?')+1, req.url.length);
            var splitArr  = paramsString.split('&');
            var slotNum = splitArr[0].substring(splitArr[0].indexOf('=')+1, splitArr[0].length);
            var slotNo = parseInt(slotNum);
            var vehicleNum = splitArr[1].substring(splitArr[1].indexOf('=')+1, splitArr[1].length);
            var vehicleNo = parseInt(vehicleNum);
            var sql = "update info set regNo = ?, parkingSlot = ? where indexNum = ?";
            var values = [[vehicleNo, vehicleNo, slotNo]];
            con.query(sql, [values], function (err, result) {
                if (err) {
                    throw err;
                }
                else {
                    var sql = "update vehicle set status = 1 where regNo = ?";
                    con.query(sql,vehicleNo, function (err, result) {
                    if (err) {
                        throw err;
                    }
                    else {
                        console.log("Vehicle parked successfully");
                    }
            });
            
            // park(req, res);
        break;
        //Checkout.
        case "/removeVehicle":
            var paramsString = req.url.substring(req.url.indexOf('?')+1, req.url.length);
            var splitArr  = paramsString.split('&');
            var vehicleNum = splitArr[0].substring(splitArr[0].indexOf('=')+1, splitArr[0].length);
            var vehicleNo = parseInt(vehicleNum);
            var sql = "delete from vehicle where regNo = ?";
            con.query(sql, vehicleNo, function (err, result) {
                if (err) {
                    throw err;
                }
                else {
                    //Set interval
                    var count = 0; 
                    var intervalObject = setInterval(function () { 
                        count++; 
                        console.log(count, 'seconds passed'); 
                        if (count == 5) { 
                            console.log('exiting'); 
                            clearInterval(intervalObject); 
                        } 
                    }, 1000); 
                }
                
            });
                }
            });
            
    break;   
        default: loadHome(req, res);
    }
}).listen(8000); 

//Loading html file.
function loadHome(req, res) {
    fs.readFile('../client/park.html', function (err, html) {
        if (err) {
            throw err;
        } else {
            res.writeHeader(200, {"Content-Type": "text/html"});  
            res.write(html);
            res.end();
        }
    });
}

/*function park(req, res) {
    fs.readFile('../client/park.html', function (err, html) {
        if (err) {
            throw err;
        } else {
            res.writeHeader(200, {"Content-Type": "text/html"});  
            res.write(html);
            res.end();
        }
    });
}*/
