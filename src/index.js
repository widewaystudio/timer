import $ from "./jquery";
import "less";
import "./main.less";

let realTime = '';
let tempstr = ["秒杀已结束","正在秒杀","即将开始"],
    timerSign = 0;
const objs = {};

function seckill(Times,status,inter){
    if(!inspect(Times,"isA")) throw Error("请输入正确的秒杀参数，比如[0,'3:30','6:12',8,20]!")
     $.ajax({
        type:"GET",
        dataType:"jsonp",
        url:"https://bjtime.cn/nt4.php",
        jsonp:"cb",
        jsonpCallback:"ts",
        async:false,
        success:function(e){
              init(e,Times,status,inter);
        }
    });
}

function inspect(target,type){
    let obj = {
        isA: ({}).toString.call(target) === "[object Array]" && target.length > 0 
    }
    return obj[type];
}

function Format(e){
    let reg = /(\d\.\d+) (\d+)/g;
    let t = e.replace(reg,function($,$1,$2){
         return Math.floor((+$2 + +$1)*1000);
    });
    return +t;
}

function initialFormat(e){
    e = typeof e === "string" ? e : "" + e;
    let reg =/\w{3} (\w{3}) (\d{2}) (\d{4}) (\d{2}):(\d{2}):(\d{2}) (\w|\W)*/g;
    let D = {
        Jan:1,
        Feb:2,
        Mar:3,
        Apr:4,
        May:5,
        Jun:6,
        Jul:7,
        Aug:8,
        Sep:9,
        Oct:10,
        Nov:11,
        Dec:12,
    }
   
   let t = e.replace(reg,function($,$1,$2,$3,$4,$5,$6){
        return $3 + "-" + stringFormat(D[$1]) + "-" + stringFormat($2) + " " + $4 + ":" + $5 + ":" + $6;
    });
    return t;
}

function stringFormat(s,n){
    n = typeof n === "number" ? n === 1 ? n : 2 : 2;
    return n === 1 ? s : ("0" + s).slice(-2);
}


function init(e,Times,status,inter){
    let nowT = new Date(Format(e));
    let initial = timing(nowT);    
    realTime = Format(e);
    timeHandle(Times,inter,status)   
    renderDom(objs);
    eventHandle();
    Time(initial);
}

function timing(start){
    start = typeof start === "number" ? start : start.getTime();
    let n = new Date();
    return function(){
        let e = new Date();
        let diff = e - n;
        // console.log(diff);
        // diff = diff > 1900 ? 1000 : diff;
        start += diff;
        n = e;
        // console.log(new Date(start));
        return start;
    }

}
function Time(t){

   timerSign = setInterval(function(){
        // console.log(typeof t());
        render(t());
    },1000);

}

function compare(T1,T2){
    return T1 >= T2 ? true : false;
}
function renderDom(data){    
    let datas = data.group,
        l = datas.length,
        temps = '';
    for(let i = 0; i < l; i++){
        let cla = i === 0 ? "selected" : "";
        temps += '<li class="timeline_item '+ cla +'"> \
        <a class="link" href="javascript:void(0)" data-gid="' + datas[i]["grid"] +'" hidefocus="true">\
        <div class="link_skew">\
            <div class="link_skew_timewrap"> <i class="link_skew_time">'+ datas[i]["displayTime"]+'</i>\
            </div>\
            <div class="processwrap"><i class="processwraps">' + datas[i]["subName"] +'</i> </div>\
            <div class="timecount"> <b class="txt">' + datas[i]["subsbr"] +'</b> \
                <b class="time">' + datas[i]["timeSbr"] +'\
                     <i class="hour">0</i>:<i class="minutes">0</i>:<i\
                        class="seconds">0</i></b> </div>\
        </div>\
    </a> </li>';
    }

    $(".timeline_list").html(temps);

}

function render(t){
//   console.log(t);


 let target = $(".mask");
 let datas = objs.group;
 let dhandle = document;
 let H = dhandle.getElementsByClassName("hour"),
     M = dhandle.getElementsByClassName("minutes"),
     S = dhandle.getElementsByClassName("seconds");
    for(let i = 0; i < datas.length; i++){
        let start = 0,
            end = 0,
            timeO = null;
        start = datas[i]["state"] === 2 ? datas[i]["startTime"] : datas[i]["endTime"];
        timeO = timeDiff(t,start);
       
        if(timeO){
            H[i].innerHTML = stringFormat(timeO[0]);
            M[i].innerHTML = stringFormat(timeO[1]);
            S[i].innerHTML = stringFormat(timeO[2]);
        }else{
            clearInterval(timerSign);
            target.css("display","");
        } 

    }
}

function timeDiff(begin,end){
    let d = Math.floor((new Date(end) - begin) / 1000),
       tempA = [];
       tempA.push(Math.floor(d / 3600));
       tempA.push(Math.floor(d / 60) % 60);
       tempA.push(d % 60);
       return d < 0 ? false : tempA;
}

function timeHandle(Times,inter,status){
   if(inter == undefined || inter.length == 0){
     return generate(Times,status);
   }

}

function stringFillter(n){
    let reg = /[^0-9:]*/g;
        let temp = '';
     return n.replace(reg,"");
}

function chuliTime(n,types){
    n = typeof n === "string" ? n : "" + n;
    if(n.split(":").length > 1){
       n = stringFillter(n);
    }    
    
    let p = n.split(":");

    let h = p[0] ? +p[0] : 0,
        m = p[1] ? +p[1] : 0,
        s = p[2] ? +p[2] : 0;    
    let T = new Date(realTime);
    T.setHours(h);
    T.setMinutes(m);
    T.setSeconds(s);
    
    return types === "num" ? T :initialFormat(T);
}

function process(t,i,l){
    return t[i % l] + Math.floor(i / l) * 24;
}


function generate(T,status){
   if(T.length < 5) return ;
   let count = 0;
   let i = 0,
       l = T.length;
   let group = [];
   let hour = new Date(realTime);
   while(count <5){
    if(compare(hour,chuliTime(process(T,i,l),"num")) && compare(chuliTime(process(T,i+1,l),"num"),hour)){
         let obj = {},
             index = (i + count),
             temps = index >= l ? "明日" : "";
         obj.grid = process(T,index,l);
         obj.startTime = chuliTime(process(T,index,l));
         obj.state = count == 0 ? 1 : 2;
         obj.subName = status[obj.state];
         obj.subsbr = tempstr[obj.state];
         obj.timeSbr = "距" + status[0].slice(-2);
         obj.displayTime = temps + (obj.startTime).replace(/.* (\d+:\d+).*/g,($,$1) => $1);
         obj.endTime = chuliTime(process(T,index + 1,l))
        group.push(obj);
        count ++;
    }else{
        i++
    }
      
   if(i > 30){
       break;
   }
   
   }
  objs.group = group;
}

function eventHandle(){
    $(".timeline_item").click(function(){
        $(this).siblings().removeClass("selected");
        $(this).addClass("selected");
      });
}

seckill([0,6,8,10,12,14,16,21,22],["秒杀结束","进行中","即将开始"]);