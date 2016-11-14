var express = require('express');
var jade = require('jade');
// var mongoose = require('mongoose');
var superagent = require('superagent');
var _ = require('underscore');

// 静态资源请求路径
var path = require('path');
var bodyParser= require('body-parser');
var Promise = require('bluebird');

var app = express();
var port = process.env.PORT || 3000;
app.locals.moment = require('moment');


app.set('views', './');
app.set('view engine', 'jade');
// 静态资源请求路径
app.use(express.static(path.join(__dirname, './')));

// 表单数据格式化
app.use(bodyParser());

// 解析链接https://www.jisilu.cn/data/qdii/qdii_list/获取的数据。
function getUrl1(sres){
	var jsonDatas = (JSON.parse(sres.text))["rows"];
	var movies = [];
	for( var i = 0; i < jsonDatas.length; i++){
		var jsonData = jsonDatas[i];
		var id = jsonData['id'];
		if (id == '513100'){
			var etfData = jsonData['cell'];				
			movies.push({
				id: etfData["fund_id"],
				nm: etfData['fund_nm'],
				price: etfData["price"] + '(' + etfData["increase_rt"] + ')',
				estimate_value: etfData["estimate_value"] + '(' + etfData["est_val_increase_rt"] + ')' ,
				discount_rt: etfData["discount_rt"],
				ref_increase_rt: etfData["ref_increase_rt"]			
			});
		}
	}
	return movies;
}

// 解析链接https://www.jisilu.cn/jisiludata/etf.php?获取的数据。
function getUrl2(sres){        
	var jsonDatas = (JSON.parse(sres.text))["rows"];
	var movies = [];
	for( var i = 0; i < jsonDatas.length; i++){
		var jsonData = jsonDatas[i]
		var id = jsonData['id'];
		if (id == '510050' || id == '159920'){
			var etfData = jsonData['cell'];	
			movies.push({
				id: etfData["fund_id"],
				nm: etfData['fund_nm'],
				price: etfData["price"] + '(' + etfData["increase_rt"] + ')',
				estimate_value: etfData["estimate_value"] + '(' + etfData["index_increase_rt"] + ')' ,
				discount_rt: etfData["discount_rt"],
				ref_increase_rt: etfData["index_increase_rt"]	
			});
		}
	}	
	return movies;
}

// 解析链接https://www.jisilu.cn/jisiludata/etf.php?qtype=pmetf获取的数据。
function getUrl3(sres){        
	var jsonDatas = (JSON.parse(sres.text))["rows"];
	var movies = [];
	for( var i = 0; i < jsonDatas.length; i++){
		var jsonData = jsonDatas[i]
		var id = jsonData['id'];
		if (id == '518880'){
			var etfData = jsonData['cell'];	
			movies.push({
				id: etfData["fund_id"],
				nm: etfData['fund_nm'],
				price: etfData["price"] + '(' + etfData["increase_rt"] + ')',
				estimate_value: etfData["estimate_value"] + '(' + etfData["index_increase_rt"] + ')' ,
				discount_rt: etfData["discount_rt"],
				ref_increase_rt: etfData["index_increase_rt"]	
			});
		}
	}	
	return movies;
}

// 根据链接不同调用不同的解析方法。
function parseData(url, sres){
    if(url == "https://www.jisilu.cn/data/qdii/qdii_list/"){
        return getUrl1(sres);
    } else if(url == "https://www.jisilu.cn/jisiludata/etf.php?"){
        return getUrl2(sres);
    } else if(url == "https://www.jisilu.cn/jisiludata/etf.php?qtype=pmetf"){
        return getUrl3(sres);
    }

};

// 获取数据用的URL数组。
var fetchCourseArray =["https://www.jisilu.cn/data/qdii/qdii_list/", 
"https://www.jisilu.cn/jisiludata/etf.php?","https://www.jisilu.cn/jisiludata/etf.php?qtype=pmetf"];

app.get("/", function(req, res){
    var movies = [];	
    Promise.all(fetchCourseArray).then(function(pages){
        pages.forEach(function(url){
            superagent.get(url).then(function (sres) {				
              if (sres == null) {				
                return next(err);
              }
              var temp = parseData(url, sres);              
              temp.forEach(function(movie){
                movies.push(movie);
              });  
			  dataShow(movies, res);
            });
        });        
    });    
});

// 根据获得的数据进行页面渲染。数据没获取完整则不进行展示。
function dataShow(movies, res){
	if(movies == null || movies.length != 4){
		return ;
	}
	res.render('list',{
		title:'场内基金折溢价',
		movies:movies
	});
}

// 监听端口
app.listen(port);
console.log('server started on port: ' + port);