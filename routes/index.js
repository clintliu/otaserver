var config = require('../config');
var express = require('express');
var router = express.Router();
var path = require('path');
var fs = require('fs');
var multer = require('multer');
var mime = require('mime');
var jPath = require('json-path');
var cors = require('cors');
var uuid = require('node-uuid');
var request = require('request');
var btoa = require('btoa');
var db = require('../db');
var json2xls = require('json2xls');
var os = require( 'os' );
var filePath = __dirname +'/../binary/';
var moment = require('moment');
var myip = require('quick-local-ip');//https://stackoverflow.com/questions/10750303/how-can-i-get-the-local-ip-address-in-node-js


/* ============================================================================
 * Key server APIs
 * ===========================================================================*/

/* GET home page. */
global.appRoot = path.resolve(__dirname);

router.get('/',cors(), function(req, res, next) {
  // res.render('index', { title: 'Express', });
  //   res.status(config.status.OK).send('AWIND Key Server: ');

    //res.render('../views/index',{title:'AWIND Key Management System Test'});
    res.send('OTA Server');
});

router.post('/api/req_version/',cors(),function (req, res, next) {

    var response = {status:"ok",version:"003",url:"https://xxx.xxx.xxx"};

    res.send(response);

});





router.get('/gettotalactivation/:sn',cors(), function(req, res, next) {
    var sn = req.params.sn;
    console.log("post testq " + sn);
    res.status(config.status.OK);
    //res.render('../views/ajaxSnippets/test',{name:'clint',age:'12',gender:'M'});
    db.prototype.getTotalActivations(sn,function (err,result) {

        res.status(config.status.OK);
        if(err){
            res.send(err);
        }else{
            console.log("gettotalactivation: %j", result);
            console.log("count = " + result.recordset[0].count);
            var response = {status:200,count:result.recordset[0].count};
            res.send(response);
        }

    });


});
router.get('/test',cors(), function(req, res, next) {
    console.log("post test");
    res.status(config.status.OK);
    //res.render('../views/ajaxSnippets/test',{name:'clint',age:'12',gender:'M'});
    res.send({name:'clint',age:'12',gender:'M'});
    res.end();
});
router.get(config.API.CONNECT_DB,function (req,res,next) {

    db.prototype.connect(function (err) {
        if(err){
            console.log(err);
            res.status(config.status.NOT_FOUND).send("connect_db query fail " + err);
        }else{
            console.log("Connect DB success!");
            res.status(config.status.OK).send("Connect DB success");
        }
    });
});

router.get(config.API.GET_REG_INFO+'/:sn',cors(), function(req, res, next) {
    // res.render('index', { title: 'Express', });
    //create Request object
    var sn = req.params.sn;
    var snPOD = sn.substr(5,14);

    var report = {
        datas:'',
        activationNumber:'',
        totalactivations:'',
        activationRemaining:'',
        downloadReport:''
    }
    db.prototype.getSNRegistrationInfo(sn,function(err,recordset){
        if(err) {
            console.log(err);
            res.status(config.status.NOT_FOUND).send("query fail " + err);
        }else{
            if(recordset.recordsets[0].length > 0){

                var now = moment().format('YYYY_MM_DD_HH_mm_ss');
                console.log("now = " + now);
                var fileName ='Report'+'_'+now+'.xlsx';
                var xls = json2xls(recordset.recordsets[0]);
                fs.writeFileSync(filePath+fileName, xls, 'binary');
                // var networkInterfaces = os.networkInterfaces( );
                // console.log( networkInterfaces );
                //var ip = networkInterfaces['eth0'][0]['address'];
                var ip = myip.getLocalIP4();
                console.log("ip = " + ip);
                var downloadLink = "http://"+ip+":"+config.port+config.API.GET_REG_INFO_JSON+"/"+fileName;
                console.log("link = " + downloadLink);

                report.datas=recordset.recordsets[0];
                report.downloadReport=downloadLink;


                db.prototype.getTotalActivations(sn,function (err,result) {
                    console.log('getSNRegistrationInfo getActivationNumber %j',result);
                    console.log("getSNRegistrationInfo getActivationNumber = " + result.recordset[0].count);
                    report.totalactivations = result.recordset[0].count;


                    db.prototype.getActivationNumber(snPOD,function (err,result) {
                        console.log('getSNRegistrationInfo getTotalActivations %j',result);
                        console.log("getSNRegistrationInfo TotalActivations = " + result.recordset[0].ActivateCount);
                        report.activationNumber = result.recordset[0].ActivateCount;
                        // var a = parseInt(report.totalactivations);
                        // var b = parseInt(report.activationNumber);
                        // report.activationRemaining =  a+b ;


                        res.render('../views/ajaxSnippets/regInfoSnippet',{datas:report.datas,downloadReport:report.downloadReport,ActivationNumber:report.activationNumber,TotalActivations:report.totalactivations});
                        res.status(config.status.OK);
                        console.log("get reg info success" );

                        res.end();


                    });

                });
            }else{
                //res.status(config.status.NOT_FOUND);
                res.render('../views/ajaxSnippets/notfound',{sn:sn});
                res.end();
            }
        }
    });
});
router.get(config.API.GET_REG_INFO_JSON+'/:fileName',cors(), function(req, res, next) {

    var fileName = req.params.fileName;
    res.setHeader('Content-disposition', 'attachment; filename='+fileName);
    res.setHeader('Content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.download(filePath+fileName,function(err){
        if (err) {
            console.log(err);
        } else {
            // decrement a download credit, etc.
        }
    });
});


router.get(config.API.DEREGISTER_KEY+'/:sn'+'/:host',cors(),function (req,res,next) {
    var sn = req.params.sn;
    var snPOD = sn.substr(5,14);
    var host_id = req.params.host;
    db.prototype.deRegisterByHostID(sn,host_id,function (err,recordset) {


        if(err){
            console.log(err);
            res.json({result:0});
        }else{
            var affectedRows = recordset.rowsAffected;
            console.log("deRegisterByHostID affectedRows = " + affectedRows);

            console.log("Deregister key success!");
            //res.status(config.status.OK).send("Connect DB success");

            res.json({result:1,rowsAffected:affectedRows});

        }
    });




});

router.get('/getSNInfo/:sn',cors(), function(req, res, next) {
    //there is some problem for this api, need more time to figure it out.
    var sn = req.params.sn;
    var snPOD = sn.substr(5,14);
    db.prototype.getSNInfo(snPOD,function(err,recordset){
        if(err) {
            console.log(err);
            res.status(config.status.NOT_FOUND).send("query fail " + err);
        }
        //send records as a response
        res.send(recordset.recordsets);
    });

});

router.post('/updateActivateQty', cors(), function(req, res, next){
    console.log("updateActivateQty: " + JSON.stringify(req.body));

    if(!req.body.sn || !req.body.qty) {
        console.log("Update Activate Qty Request: Missing one or more required params: " + JSON.stringify(req.body));
        var err = new Error("Update Activate Qty Request: Missing one or more required params: " + JSON.stringify(req.body));
        res.status(config.status.NOT_FOUND).send(err.message);
    }
    else {
        // do the registration
        var snPOD = req.body.sn.substr(5,14);
        db.prototype.updateActivateQty(snPOD,req.body.qty,function(err,recordset){
            if(err) {
                console.log(err);
                res.status(config.status.NOT_FOUND).send("query updateActivateQty fail " + err);
            }
            //send records as a response
            res.send(recordset);
        });
    }
});


module.exports = router;
