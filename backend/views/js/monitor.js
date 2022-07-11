const jsonData= require('../../savedat.json'); 
var dat = JSON.parse('{ "이름":"김지훈", "나이":26, "지역":"서울" }')
document.getElementById("demo").innerHTML = dat.이름