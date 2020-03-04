var express = require("express");
var router = express.Router();

router.get('/', function(req, res){
    res.render('index');
})

router.get('/map', function(req, res){
    res.render('map');
})

router.get('/about', function(req, res){
    res.render('about')
})

module.exports = router;