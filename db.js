var sql=require('mssql');
var dbconfig = require('./dbconfig');


function DB() {

};
module.exports = DB;


DB.prototype.connect = function(resultFun){
    sql.close();
    sql.connect(dbconfig.SQL_DB.AWINDDB,resultFun);
};


DB.prototype.getSNRegistrationInfo = function(sn,resultFun){

    var sqlStr = "select HostID, SN, RegisterTime, IP, Deactivate as Activate, Email from RegisterInformation where SN=\'" + sn + "\' order by RegisterTime desc";

    console.log("sninfo sql = " + sqlStr);
    try{
        var request = new sql.Request();
        request.query(sqlStr ,resultFun);
    }catch(err){
        console.log(err);
    }
};
DB.prototype.getTotalActivations = function(sn,resultFun){
    var sqlStr = "select count(SN) as count from RegisterInformation where SN=\'"+sn+"\' and Deactivate = 'T'";
    try{
        var request = new sql.Request();
        request.query(sqlStr ,resultFun);
        return request;
    }catch(err){
        console.log(err);
    }
}
DB.prototype.getActivationNumber = function (sn,resultFun) {
    var sqlStr = 'select ActivateCount from SNMappingLanguage where SN = \''+sn+'\'';
    console.log("updateActivateQty sql = " + sqlStr);
    try{
        var request = new sql.Request();
        request.query(sqlStr ,resultFun);
    }catch(err){
        console.log(err);
    }
}
DB.prototype.updateActivateQty = function(sn,times,resultFun){

    var sqlStr = 'update SNMappingLanguage set ActivateCount = \''+times+'\' where SN = \''+sn+'\'';
    console.log("updateActivateQty sql = " + sqlStr);
    try{
        var request = new sql.Request();
        request.query(sqlStr ,resultFun);
    }catch(err){
        console.log(err);
    }
};
DB.prototype.getSNInfo = function(sn,times,resultFun){

    var sqlStr = 'select * from SNMappingLanguage where SN = \''+sn+'\'';
    console.log("getSNInfo sql = " + sqlStr);
    try{
        var request = new sql.Request();
        request.query(sqlStr ,resultFun);
    }catch(err){
        console.log(err);
    }
}
DB.prototype.getSNByEmail = function (mail,resultFun) {
    var sqlStr = "Select SN,STORE From (Select SN,STORE, ROW_NUMBER() Over (Partition By SN Order By OUT_TRADE_NO Desc) As Sort From ALIPAYDETAIL where EMAIL='" + sEMail + "' and SN IS NOT NULL) TMP_S WHERE TMP_S.Sort=1";

    console.log("getSNByEmail mail = " + mail);

    try{
        var request = new sql.Request();
        request.query(sqlStr ,resultFun);
    }catch(err){
        console.log(err);
    }
}

DB.prototype.deRegisterByHostID = function (sn,hostID,resultFun) {

    var sqlStr = "update RegisterInformation Set Deactivate='F' where HostID='" + hostID + "' and SN = '"+sn+"'" ;
    console.log("deRegisterByHostID sql = " + sqlStr);

    try{
        var request = new sql.Request();
        request.query(sqlStr ,resultFun);
    }catch(err){
        console.log(err);
    }
}