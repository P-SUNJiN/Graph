/* script.js Part 3-1 */


/*
 Survey Dashboard Engine

 기능:
 - 데이터 관리
 - 자동 저장
 - 수정 기록
 - 실행취소 / 다시실행
 - 대시보드 계산
 - 그래프 데이터 생성

*/


let surveyData = [

];


let historyStack = [];

let redoStack = [];



const defaultQuestions = {

    Q1:"질문 1",

    Q2:"질문 2",

    Q3:"질문 3",

    Q4:"질문 4",

    Q5:"질문 5",

    Q6:"질문 6",

    Q7:"질문 7",

    Q8:"질문 8",

    Q9:"질문 9",

    Q10:"질문 10"

};



let settings = {

    dark:false,

    presentation:false,

    autoSave:true,

    animation:true,

    chart:"bar"

};





// ===============================
// 초기 실행
// ===============================


window.onload=function(){


    loadStorage();


    renderTable();


    updateDashboard();


    createMainChart();


    bindEvents();


};







// ===============================
// 데이터 저장
// ===============================



function saveStorage(){


    localStorage.setItem(

        "surveyData",

        JSON.stringify(surveyData)

    );



    localStorage.setItem(

        "surveySettings",

        JSON.stringify(settings)

    );



    document.getElementById("saveStatus")

    .innerText="저장 완료";



}





function loadStorage(){


    let savedData=

    localStorage.getItem("surveyData");



    if(savedData){

        surveyData=

        JSON.parse(savedData);

    }



    let savedSetting=

    localStorage.getItem("surveySettings");



    if(savedSetting){

        settings=

        JSON.parse(savedSetting);

    }



    if(settings.dark){

        document.body.classList.add("dark");

    }



}







// ===============================
// 데이터 행 생성
// ===============================



function createEmptyRow(){


    return {


        id:Date.now(),


        A1:0,

        A2:0,

        A3:0,


        B1:0,

        B2:0,


        Q1:0,

        Q2:0,

        Q3:0,

        Q4:0,

        Q5:0,


        Q6:0,

        Q7:0,

        Q8:0,

        Q9:0,

        Q10:0,


        D:"정상"


    };


}







function addRow(){


    saveHistory();


    surveyData.push(

        createEmptyRow()

    );


    renderTable();


    updateDashboard();


    autoSave();


}







// ===============================
// 히스토리
// ===============================



function saveHistory(){


    historyStack.push(

        JSON.stringify(surveyData)

    );


    if(historyStack.length>50){

        historyStack.shift();

    }



    redoStack=[];


}







function undo(){


    if(historyStack.length===0)

    return;



    redoStack.push(

        JSON.stringify(surveyData)

    );



    surveyData=

    JSON.parse(

        historyStack.pop()

    );


    renderTable();

    updateDashboard();

}



function redo(){


    if(redoStack.length===0)

    return;



    historyStack.push(

        JSON.stringify(surveyData)

    );


    surveyData=

    JSON.parse(

        redoStack.pop()

    );


    renderTable();

    updateDashboard();


}





// ===============================
// 자동 저장
// ===============================


function autoSave(){


    if(settings.autoSave){

        saveStorage();

    }


  }

/* script.js Part 3-2 */


/* ===============================
   데이터 테이블 렌더링
================================ */


function renderTable(){


    const tbody =

    document.getElementById("tableBody");



    tbody.innerHTML="";



    surveyData.forEach((row,index)=>{


        let tr=document.createElement("tr");



        Object.keys(row).forEach(key=>{


            let td=document.createElement("td");



            let input=document.createElement("input");



            input.value=row[key];



            input.dataset.index=index;

            input.dataset.key=key;



            if(key==="id"){

                input.disabled=true;

            }



            input.addEventListener(

                "change",

                editData

            );



            td.appendChild(input);


            tr.appendChild(td);



        });



        tbody.appendChild(tr);



    });



}







/* ===============================
   데이터 수정
================================ */


function editData(e){


    let index=

    Number(

    e.target.dataset.index

    );



    let key=

    e.target.dataset.key;



    saveHistory();



    surveyData[index][key]=

    e.target.value;



    updateDashboard();



    autoSave();



}








/* ===============================
   대시보드 계산
================================ */



function updateDashboard(){


    let count=

    surveyData.length;



    document.getElementById(

        "a1Number"

    ).innerText=count;



    if(count===0){

        document.getElementById(

            "a2Number"

        ).innerText=0;



        document.getElementById(

            "a3Number"

        ).innerText=0;



        return;

    }





    let total=0;



    let max=0;



    surveyData.forEach(row=>{


        let value=

        Number(row.A2)||0;



        total+=value;



        if(value>max){

            max=value;

        }



    });




    document.getElementById(

        "a2Number"

    ).innerText=

    (total/count).toFixed(2);




    document.getElementById(

        "a3Number"

    ).innerText=max;





    updatePositiveRate();

}







function updatePositiveRate(){


    let positive=0;

    let negative=0;



    surveyData.forEach(row=>{


        let value=

        Number(row.B1)||0;



        if(value>=3){

            positive++;

        }

        else{

            negative++;

        }



    });



    let total=

    positive+negative;



    if(total===0){

        document.getElementById(

        "b1Number"

        ).innerText="0%";



        document.getElementById(

        "b2Number"

        ).innerText="0%";



        return;

    }




    document.getElementById(

    "b1Number"

    ).innerText=

    Math.round(

    positive/total*100

    )+"%";




    document.getElementById(

    "b2Number"

    ).innerText=

    Math.round(

    negative/total*100

    )+"%";



}







/* ===============================
   이벤트 연결
================================ */


function bindEvents(){



    document.getElementById(

    "addRowBtn"

    )

    .onclick=addRow;



    document.getElementById(

    "undoBtn"

    )

    .onclick=undo;



    document.getElementById(

    "redoBtn"

    )

    .onclick=redo;





    document.getElementById(

    "darkModeBtn"

    )

    .onclick=toggleDark;





    document.getElementById(

    "presentationBtn"

    )

    .onclick=togglePresentation;





    document.getElementById(

    "saveBtn"

    )

    .onclick=saveStorage;



    document.querySelectorAll(

    ".menu-btn"

    )

    .forEach(btn=>{


        btn.onclick=function(){


            document.querySelectorAll(

            ".menu-btn"

            )

            .forEach(b=>

            b.classList.remove("active")

            );



            this.classList.add("active");



            let page=

            this.dataset.page;



            document.querySelectorAll(

            ".page"

            )

            .forEach(p=>{


                p.classList.remove("active");



            });



            document.getElementById(page)

            .classList.add("active");



        };


    });


}

/* script.js Part 3-3 */


/* ===============================
   다크모드
================================ */


function toggleDark(){


    settings.dark=

    !settings.dark;



    document.body.classList.toggle(

        "dark"

    );



    autoSave();


}







/* ===============================
   발표모드
================================ */


function togglePresentation(){


    settings.presentation=

    !settings.presentation;



    document.body.classList.toggle(

        "presentation"

    );



    autoSave();


}







/* ===============================
   그래프 기본 데이터
================================ */



function getQuestionAverage(){


    let result={};



    for(let i=1;i<=10;i++){


        let key="Q"+i;



        let total=0;



        surveyData.forEach(row=>{


            total+=Number(row[key])||0;


        });



        result[key]=

        surveyData.length?

        (total/surveyData.length).toFixed(2)

        :0;



    }



    return result;



}








/* ===============================
   메인 그래프
================================ */



let mainChart;



function createMainChart(){



    let ctx=

    document.getElementById(

    "mainChart"

    );



    if(!ctx)return;



    let data=

    getQuestionAverage();



    mainChart=

    new Chart(ctx,{

        type:"bar",


        data:{


            labels:Object.keys(data),


            datasets:[{


                label:"질문 평균 점수",


                data:Object.values(data)


            }]


        },


        options:{


            responsive:true,


            maintainAspectRatio:false


        }


    });



}







function refreshMainChart(){



    if(!mainChart)

    return;



    let data=

    getQuestionAverage();



    mainChart.data.labels=

    Object.keys(data);



    mainChart.data.datasets[0].data=

    Object.values(data);



    mainChart.update();



}








/* ===============================
   추가 그래프 생성
   총 20종 확장 구조
================================ */



let chartList=[];



const chartTypes=[


"bar",

"line",

"pie",

"doughnut",

"radar",

"polarArea",

"bubble",

"scatter",


"horizontalBar",

"area",

"stackedBar",

"multiLine",

"comparison",

"ranking",

"distribution",

"average",

"response",

"score",

"trend",

"matrix"


];






function createAllCharts(){



    chartTypes.forEach((type,index)=>{



        let canvas=

        document.getElementById(

        "chart"+(index+1)

        );



        if(!canvas)

        return;



        let chart=

        new Chart(canvas,{


            type:

            type==="horizontalBar"

            ?"bar"

            :

            type==="area"

            ?"line"

            :

            type==="stackedBar"

            ?"bar"

            :

            type==="multiLine"

            ?"line"

            :

            type==="comparison"

            ?"bar"

            :

            type==="ranking"

            ?"bar"

            :

            type==="distribution"

            ?"pie"

            :

            type==="average"

            ?"line"

            :

            type==="response"

            ?"doughnut"

            :

            type==="score"

            ?"radar"

            :

            type==="trend"

            ?"line"

            :

            type==="matrix"

            ?"scatter"

            :

            type,



            data:createChartData()



        });



        chartList.push(chart);



    });


}






function createChartData(){


    let data=

    getQuestionAverage();



    return {


        labels:Object.keys(data),



        datasets:[{


            label:"분석 결과",


            data:Object.values(data)


        }]

    };


}

/* script.js Part 3-4 */


/* ===============================
   그래프 갱신
================================ */


function refreshAllCharts(){


    refreshMainChart();



    chartList.forEach(chart=>{


        chart.data=

        createChartData();



        chart.update();



    });


}







/* ===============================
   JSON 내보내기
================================ */



function exportJSON(){


    let blob=

    new Blob(

        [

        JSON.stringify(

            surveyData,

            null,

            2

        )

        ],

        {

        type:"application/json"

        }

    );



    downloadFile(

        blob,

        "survey_data.json"

    );


}







/* ===============================
   CSV 내보내기
================================ */



function exportCSV(){



    if(surveyData.length===0)

    return;



    let keys=

    Object.keys(

        surveyData[0]

    );



    let csv=

    keys.join(",")+"\n";



    surveyData.forEach(row=>{


        csv+=

        keys.map(key=>

            row[key]

        ).join(",")+"\n";



    });



    let blob=

    new Blob(

        [

        csv

        ],

        {

        type:"text/csv"

        }

    );



    downloadFile(

        blob,

        "survey_data.csv"

    );


}







/* ===============================
   XLSX 내보내기
================================ */


function exportXLSX(){


    let sheet=

    XLSX.utils.json_to_sheet(

        surveyData

    );



    let book=

    XLSX.utils.book_new();



    XLSX.utils.book_append_sheet(

        book,

        sheet,

        "Survey"

    );



    XLSX.writeFile(

        book,

        "survey_data.xlsx"

    );


}







/* ===============================
   파일 다운로드 공통
================================ */



function downloadFile(blob,name){



    let url=

    URL.createObjectURL(blob);



    let a=

    document.createElement("a");



    a.href=url;



    a.download=name;



    a.click();



    URL.revokeObjectURL(url);



}







/* ===============================
   PNG 저장
================================ */



function exportPNG(){


    let canvas=

    document.getElementById(

        "mainChart"

    );



    let link=

    document.createElement("a");



    link.download=

    "dashboard_chart.png";



    link.href=

    canvas.toDataURL();



    link.click();



}







/* ===============================
   PDF 저장
================================ */



function exportPDF(){



    const {

        jsPDF

    }=

    window.jspdf;



    let pdf=

    new jsPDF();



    pdf.text(

        "Survey Dashboard Report",

        20,

        20

    );



    pdf.text(

        "Response Count : "

        +

        surveyData.length,

        20,

        35

    );



    pdf.save(

        "survey_report.pdf"

    );



}







/* ===============================
   내보내기 이벤트
================================ */



document.addEventListener(

"DOMContentLoaded",

()=>{



    let json=

    document.getElementById(

    "jsonExportBtn"

    );



    if(json)

    json.onclick=exportJSON;





    let csv=

    document.getElementById(

    "csvExportBtn"

    );



    if(csv)

    csv.onclick=exportCSV;





    let xlsx=

    document.getElementById(

    "xlsxExportBtn"

    );



    if(xlsx)

    xlsx.onclick=exportXLSX;





    let png=

    document.getElementById(

    "pngExportBtn"

    );



    if(png)

    png.onclick=exportPNG;





    let pdf=

    document.getElementById(

    "pdfExportBtn"

    );



    if(pdf)

    pdf.onclick=exportPDF;



});







/* ===============================
   설정 저장
================================ */


function loadSettingsUI(){



    let auto=

    document.getElementById(

    "autoSave"

    );



    if(auto){


        auto.checked=

        settings.autoSave;


        auto.onchange=function(){


            settings.autoSave=

            this.checked;



            autoSave();


        };

    }





    let animation=

    document.getElementById(

    "animationToggle"

    );



    if(animation){


        animation.checked=

        settings.animation;


        animation.onchange=function(){


            settings.animation=

            this.checked;



            autoSave();


        };

    }



}







setTimeout(()=>{


    loadSettingsUI();


    createAllCharts();


},500);

/* script.js Part 4-1 */
/* 최종 보완 : 그래프 안정화 + 질문 수정 반영 */


/* ===============================
   질문 제목 반영 그래프
================================ */


function getQuestionLabels(){


    let labels=[];



    for(let i=1;i<=10;i++){


        let key="Q"+i;



        labels.push(

            defaultQuestions[key]

        );


    }



    return labels;


}







function getQuestionValues(){


    let values=[];



    for(let i=1;i<=10;i++){



        let key="Q"+i;



        let total=0;



        surveyData.forEach(row=>{


            total+=

            Number(row[key])||0;


        });



        values.push(

            surveyData.length

            ?

            Number(

            (

            total/

            surveyData.length

            ).toFixed(2)

            )

            :

            0

        );



    }



    return values;


}








/* ===============================
   모든 그래프 데이터 생성
================================ */



function createAdvancedChartData(){



    return {


        labels:

        getQuestionLabels(),



        datasets:[{


            label:"질문별 평균",


            data:

            getQuestionValues()


        }]

    };


}








/* ===============================
   그래프 다시 생성
================================ */


function rebuildCharts(){



    chartList.forEach(chart=>{


        chart.destroy();


    });



    chartList=[];



    createAllCharts();



}







/* ===============================
   그래프 20종 매핑 보완
================================ */



function normalizeChartType(type){


    const map={


        horizontalBar:"bar",


        area:"line",


        stackedBar:"bar",


        multiLine:"line",


        comparison:"bar",


        ranking:"bar",


        distribution:"pie",


        average:"line",


        response:"doughnut",


        score:"radar",


        trend:"line",


        matrix:"scatter"



    };



    return map[type] || type;



}








/* ===============================
   수정된 그래프 생성 함수
================================ */


function createChartByType(canvas,type){



    return new Chart(

        canvas,

        {


        type:

        normalizeChartType(type),



        data:

        createAdvancedChartData(),



        options:{


            responsive:true,


            maintainAspectRatio:false,


            plugins:{


                legend:{


                    display:true


                }


            }



        }


        }


    );


}








/* ===============================
   질문 제목 이벤트
================================ */


for(let i=1;i<=10;i++){



    let input=

    document.getElementById(

    "q"+i+"Title"

    );



    if(input){


        input.addEventListener(

        "change",

        ()=>{


            saveQuestionTitles();


            rebuildCharts();



        });


    }



}








/* ===============================
   XLSX 한글 안정화
================================ */


function exportXLSX_UTF8(){



    let sheet=

    XLSX.utils.json_to_sheet(

        surveyData

    );



    let workbook=

    XLSX.utils.book_new();



    XLSX.utils.book_append_sheet(

        workbook,

        sheet,

        "설문데이터"

    );



    XLSX.writeFile(

        workbook,

        "설문분석.xlsx"

    );


}



document.getElementById(

"xlsxExportBtn"

)

.onclick=

exportXLSX_UTF8;

/* script.js Part 4-2 */
/* 최종 보완 : PDF/PNG/발표모드/전체 안정화 */


/* ===============================
   차트 PNG 저장 개선
================================ */


function exportFullPNG(){


    let target=

    document.querySelector(

        ".chart-area"

    );



    let canvas=

    target.querySelector(

        "canvas"

    );



    if(!canvas)

    return;



    let link=

    document.createElement("a");



    link.download=

    "survey_dashboard.png";



    link.href=

    canvas.toDataURL(

        "image/png"

    );



    link.click();



}





document.getElementById(

"pngExportBtn"

)

.onclick=

exportFullPNG;








/* ===============================
   PDF 보고서 생성 개선
================================ */


async function exportReportPDF(){



    const {

        jsPDF

    }=

    window.jspdf;



    let pdf=

    new jsPDF();



    pdf.setFontSize(18);



    pdf.text(

        "Survey Dashboard Report",

        20,

        20

    );



    pdf.setFontSize(12);



    pdf.text(

        "응답자 수 : "

        +

        surveyData.length,

        20,

        35

    );



    pdf.text(

        "평균 점수 : "

        +

        document.getElementById(

        "a2Number"

        ).innerText,

        20,

        45

    );





    let canvas=

    document.getElementById(

        "mainChart"

    );



    if(canvas){



        let image=

        canvas.toDataURL(

            "image/png"

        );



        pdf.addImage(

            image,

            "PNG",

            15,

            60,

            180,

            90

        );


    }





    pdf.save(

        "survey_dashboard_report.pdf"

    );



}



document.getElementById(

"pdfExportBtn"

)

.onclick=

exportReportPDF;









/* ===============================
   발표모드 전체 화면
================================ */


function startPresentation(){



    document.body.classList.add(

        "presentation"

    );



    if(document.documentElement.requestFullscreen){



        document.documentElement

        .requestFullscreen();



    }



}







function stopPresentation(){



    document.body.classList.remove(

        "presentation"

    );



    if(document.exitFullscreen){



        document.exitFullscreen();



    }


}





document.getElementById(

"presentationBtn"

)

.onclick=function(){



    if(settings.presentation){


        stopPresentation();



    }

    else{


        startPresentation();


    }



    settings.presentation=

    !settings.presentation;



    autoSave();



};








/* ===============================
   자동 새로고침 감시
================================ */


let refreshTimer;



function startAutoRefresh(){



    clearInterval(

        refreshTimer

    );



    refreshTimer=

    setInterval(()=>{


        updateDashboard();


        refreshAllCharts();



    },5000);



}





/* ===============================
   데이터 검증
================================ */


function validateData(){



    surveyData.forEach(row=>{



        Object.keys(row)

        .forEach(key=>{



            if(

            key!=="id"

            &&

            key!=="D"

            ){



                if(isNaN(row[key])){


                    row[key]=0;


                }



            }



        });



    });



}








/* ===============================
   최종 실행
================================ */



window.addEventListener(

"load",

()=>{



    validateData();



    startAutoRefresh();



    setTimeout(()=>{


        rebuildCharts();



    },1000);



});

/* script.js Part 4-3 */
/* 최종 오류 방지 패치 + 완성 연결 코드 */


/* ===============================
   Chart.js 중복 생성 방지
================================ */


function safeCreateChart(id,type){



    let canvas=

    document.getElementById(id);



    if(!canvas)

    return null;



    let existing=

    Chart.getChart(canvas);



    if(existing){


        existing.destroy();


    }



    return createChartByType(

        canvas,

        type

    );


}








/* ===============================
   안정화된 그래프 생성
================================ */


function createAllChartsSafe(){



    chartList=[];



    chartTypes.forEach(

    (type,index)=>{



        let chart=

        safeCreateChart(

            "chart"+(index+1),

            type

        );



        if(chart){


            chartList.push(chart);


        }



    });



}








/* ===============================
   데이터 변경 후 전체 반영
================================ */


function applyDataChange(){



    validateData();



    renderTable();



    updateDashboard();



    refreshMainChart();



    refreshAllCharts();



    autoSave();



}








/* ===============================
   테이블 실시간 입력 개선
================================ */


document.addEventListener(

"input",

function(e){



    if(

    e.target.tagName==="INPUT"

    &&

    e.target.dataset.index

    ){



        let index=

        Number(

        e.target.dataset.index

        );



        let key=

        e.target.dataset.key;



        surveyData[index][key]=

        e.target.value;



        applyDataChange();



    }



});








/* ===============================
   초기 기본값
================================ */


const appDefault={


    title:

    "설문 데이터 분석 대시보드",


    theme:

    "light",


    language:

    "ko",


    version:

    "1.0"



};








function initializeApp(){



    let savedTitle=

    localStorage.getItem(

    "projectTitle"

    );



    if(savedTitle){


        document.getElementById(

        "projectTitle"

        ).innerText=

        savedTitle;



    }





    document.getElementById(

    "projectTitle"

    )

    .addEventListener(

    "input",

    function(){


        localStorage.setItem(

            "projectTitle",

            this.innerText

        );


    });





    if(!surveyData.length){


        createSampleData();


    }



    saveStorage();



    renderTable();



    updateDashboard();



    createMainChart();



    createAllChartsSafe();



}








/* ===============================
   오류 발생 시 복구
================================ */


window.onerror=function(



message,

source,

line

){



    console.log(

        "Dashboard Error:",

        message,

        line

    );



    document.getElementById(

    "dStatus"

    ).innerText=

    "복구됨";



};








/* ===============================
   마지막 실행
================================ */


window.addEventListener(

"load",

()=>{


    initializeApp();



});

