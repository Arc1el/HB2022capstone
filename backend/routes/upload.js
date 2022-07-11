var express = require('express');
var router = express.Router();
var multer = require('multer');
var fs = require('fs');

// 업로드한 파일의 이름을 유지
var storage  = multer.diskStorage({
    destination(req, file, cb) {
      cb(null, 'uploadedFiles/');
    },
    filename(req, file, cb) {
      cb(null, `${Date.now()}__${file.originalname}`);
    },
  });

var upload = multer({ dest: 'uploadedFiles/' });
var uploadWithOriginalFilename = multer({ storage: storage });

router.get('/', function(req,res){
    res.render('upload');
  });
  
  router.post('/uploadFile', upload.single('attachment'), function(req,res){
    res.render('upload_success', { file:req.file, files:null });
  });
  
  router.post('/uploadFileWithOriginalFilename', uploadWithOriginalFilename.single('attachment'), function(req,res){
    res.render('upload_success', { file:req.file, files:null });
  });
  
  router.post('/uploadFiles', upload.array('attachments'), function(req,res){
    res.render('upload_success', { file: null, files:req.files} );
  });
  
  router.post('/uploadFilesWithOriginalFilename', uploadWithOriginalFilename.array('attachments'), function(req,res){
    res.render('upload_success', { file:null, files:req.files });
  });
  
module.exports = router;