var Counter = {
	holder: null,
	dayStart: null,
	monthStart: null,
	yearStart: null,
	yearCount: null,
	monthCount: null,
	dayCount: null,
	hourCount: null,
	minCount: null,
	secCount: null,
	initialize: function(holder, day, month, year) {
		this.holder=holder;
		this.dayStart=day;
		this.monthStart=month;
		this.yearStart=year;
	},
	startCounter: function(){
		var today=new Date();
		var a = new Date(this.yearStart, this.monthStart, this.dayStart, 0, 0, 0, 0);
		var c = today.getTime()-a.getTime();
		
		if(today.getDate()>=this.dayStart){
			this.dayCount = today.getDate()-this.dayStart;
			if(today.getMonth()+1>=this.monthStart ){
				this.monthCount = today.getMonth()+1-this.monthStart;
				this.yearCount = today.getFullYear()-this.yearStart;
			}else{
				this.monthCount = today.getMonth()-this.monthStart+13;
				this.yearCount = today.getFullYear()-this.yearStart-1;
			}
		}else{
			var addDay=0;
			switch(today.getMonth()){
				case 10:
				case 8:
				case 7:
				case 5:
				case 3:
				case 1:
				case 0:addDay=(31-this.dayStart>=0)?31-this.dayStart:0; break;
				case 2:addDay=(((today.getFullYear()%4==0)?29:28)-this.dayStart>=0)?31-this.dayStart:0; break;
				case 11:
				case 9:
				case 6:
				case 4:addDay=(30-this.dayStart>=0)?30-this.dayStart:0; break;
			}
			this.dayCount = addDay+today.getDate();
			if(today.getMonth()+1>this.monthStart ){
				this.monthCount = today.getMonth()-this.monthStart;
				this.yearCount = today.getFullYear()-this.yearStart;
			}else{
				this.monthCount = today.getMonth()-this.monthStart+12;
				this.yearCount = today.getFullYear()-this.yearStart-1;
			}
		}
		this.hourCount=Math.floor(c/3600000)%24;
		this.minCount=Math.floor(c/60000)%60;
		this.secCount=Math.floor(c/1000)%60;
		// add a zero in front of numbers<10
		var m=this.checkTime(this.minCount);
		var s=this.checkTime(this.secCount);
		document.getElementById('counterHolder').innerHTML=this.yearCount+"y"+this.monthCount+"m"+this.dayCount+"d "+this.hourCount+":"+m+":"+s;
		t=setTimeout('Counter.startCounter()',500);
	},
	checkTime: function(i){
		if (i<10)
		  {
		  i="0" + i;
		  }
		return i;
	}
};