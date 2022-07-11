
var service_main = require("../services/manage_service");

exports.memList = async function(req){

    const pageNum = Number(req.query.pageNum) || 1; 
    const contentSize = 10; 
    const pnSize = 10; 
    const skipSize = (pageNum - 1) * contentSize; 

    const resultRow = service_main.memList(skipSize, contentSize);

    const totalCount = (await resultRow).totalCount; 
    const pnTotal = Math.ceil(totalCount / contentSize); 
    const pnStart = ((Math.ceil(pageNum / pnSize) - 1) * pnSize) + 1; 
    let pnEnd = (pnStart + pnSize) - 1; 

    var contentQueryResult = (await resultRow).contentQueryResult;
    if (pnEnd > pnTotal) pnEnd = pnTotal; 
            const result = {
                pageNum,
                pnStart,
                pnEnd,
                pnTotal,
                contents: contentQueryResult,
            };

    return result;
};

