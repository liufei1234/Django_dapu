

var provinceArr = ['北京','上海','深圳']

var cityArr = [['东城','西城'],['徐汇','浦东'],['宝安','龙岗']]

var areaArr = [['朝阳', '海淀'],['宝山', '虹口'],['盐田', '罗湖']]

//获取下拉框
var leftSel = document.querySelector('#province');
var middleSel = document.querySelector('#city');
var rightSel = document.querySelector('#area');

//初始化页面(左边的option)
function initView () {
	for (var i = 0;i < provinceArr.length;i++) {
		createOption(leftSel,provinceArr[i]);
	}
}

//创建option的函数(顺便添加到某个下拉框中)
//参数是 下拉框元素 和 要添加option所用的值
function createOption (sel,optionValue) {
	var option = document.createElement('option');
	option.innerText = optionValue;
	sel.appendChild(option);
}

//切换省份
leftSel.onchange = function () {

	//每次切换省份要把之前的城市option清空掉
	middleSel.length = 1;

	//另一种清空方法
	// while (rightSel.length >1) {
	// 	rightSel.removeChild(rightSel.lastElementChild);
	// }

	console.log(this.selectedIndex - 1);
	//找出省份对应的城市数组
	var arr = cityArr[this.selectedIndex - 1];
	console.log(arr);

	if (arr) {
		for (var i = 0;i <arr.length;i++) {
			createOption(middleSel,arr[i]);
		}
	}
}

initView();