const DashboardApp = {
    // 1. 상태 관리 (실행 취소/다시 실행 및 자동 저장 지원)
    state: { data: null },
    history: [],
    historyStep: -1,
    charts: {}, // ECharts 인스턴스 보관

    init() {
        this.loadSampleData();
        this.initSortable();
        
        // 반응형 리사이즈 이벤트
        window.addEventListener('resize', () => {
            Object.values(this.charts).forEach(chart => chart.resize());
        });
    },

    // 2. Undo/Redo 상태 저장 로직
    saveState(newData) {
        this.state.data = JSON.parse(JSON.stringify(newData));
        this.historyStep++;
        this.history = this.history.slice(0, this.historyStep);
        this.history.push(JSON.parse(JSON.stringify(this.state.data)));
        localStorage.setItem('stepUpAutoSave', JSON.stringify(this.state.data)); // 자동 저장
        this.renderAll();
    },

    undo() {
        if (this.historyStep > 0) {
            this.historyStep--;
            this.state.data = JSON.parse(JSON.stringify(this.history[this.historyStep]));
            this.renderAll();
        } else { alert("더 이상 되돌릴 수 없습니다."); }
    },

    redo() {
        if (this.historyStep < this.history.length - 1) {
            this.historyStep++;
            this.state.data = JSON.parse(JSON.stringify(this.history[this.historyStep]));
            this.renderAll();
        }
    },

    // 3. ECharts 20종 지원 렌더링 (대표적인 것들 설정)
    renderAll() {
        if(!this.state.data) return;
        
        // 통계 카드 업데이트
        document.getElementById('total-responses').innerText = "152명 (예시)";
        
        // 차트 1: 레이더 차트 (Q1~Q9 전체 비교)
        if(!this.charts['q1_q9']) this.charts['q1_q9'] = echarts.init(document.getElementById('q1_q9_chart'));
        const radarOption = {
            tooltip: {},
            radar: { indicator: [
                { name: '시력(Q1)', max: 5 }, { name: '청력(Q2)', max: 5 },
                { name: '인지(Q3)', max: 5 }, { name: '조작(Q4)', max: 5 },
                { name: '보안(Q5)', max: 5 }
            ]},
            series: [{ type: 'radar', data: [{ value: [4.2, 3.8, 4.5, 4.0, 4.8], name: '평균 어려움' }] }]
        };
        this.charts['q1_q9'].setOption(radarOption);

        // 차트 2: 도넛 파이 차트 (Q10 가장 필요한 도움)
        if(!this.charts['q10']) this.charts['q10'] = echarts.init(document.getElementById('q10_chart'));
        const pieOption = {
            tooltip: { trigger: 'item' },
            series: [{
                type: 'pie', radius: ['40%', '70%'],
                data: [
                    { value: 45, name: '화면 읽어주기' }, { value: 30, name: '글씨 크게' },
                    { value: 50, name: '사기 앱 알림' }, { value: 27, name: '음성 도움' }
                ]
            }]
        };
        this.charts['q10'].setOption(pieOption);

        // 차트 3: 워드클라우드 (WordCloud2.js 사용)
        const canvas = document.getElementById('wordcloud_canvas');
        canvas.width = canvas.parentElement.offsetWidth;
        WordCloud(canvas, { 
            list: [['보이스피싱', 50], ['글씨', 40], ['복잡함', 30], ['비밀번호', 25], ['유튜브', 20]],
            weightFactor: 2, fontFamily: 'Pretendard', color: 'random-dark'
        });
    },

    // 4. 드래그 앤 드롭 순서 변경 (SortableJS)
    initSortable() {
        const el = document.getElementById('sortable-charts');
        new Sortable(el, { animation: 150, handle: '.chart-card' });
    },

    // 5. 내보내기 기능 총괄 (Excel, PDF, PNG, JSON 등)
    exportData(type) {
        if(!type) return;
        const data = this.state.data;
        
        if(type === 'json') {
            const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob); link.download = 'survey_data.json'; link.click();
        } 
        else if(type === 'excel' || type === 'csv') {
            // SheetJS를 이용한 Excel/CSV 내보내기
            const ws = XLSX.utils.json_to_sheet([{ "응답자수": 152, "Q1평균": 4.2, "Q2평균": 3.8 }]);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Survey Results");
            XLSX.writeFile(wb, type === 'excel' ? 'survey_results.xlsx' : 'survey_results.csv');
        }
        else if(type === 'pdf') {
            // html2pdf를 이용한 PDF 캡처
            const element = document.getElementById('dashboard-content');
            html2pdf().set({ margin: 10, filename: 'dashboard.pdf', image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2 }, jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' } }).from(element).save();
        }
        else if(type === 'png') {
            html2canvas(document.getElementById('dashboard-content')).then(canvas => {
                const link = document.createElement('a');
                link.download = 'dashboard.png'; link.href = canvas.toDataURL(); link.click();
            });
        }
        document.getElementById('exportSelect').value = ""; // select 초기화
    },

    // 6. UI 기능 (다크모드, 전체화면)
    toggleTheme() {
        const body = document.body;
        body.setAttribute('data-theme', body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
    },
    toggleFullScreen() {
        if (!document.fullscreenElement) { document.documentElement.requestFullscreen(); } 
        else { if (document.exitFullscreen) { document.exitFullscreen(); } }
    },

    // 샘플 데이터 로드 (실제로는 fetch로 data/survey.json 호출)
    loadSampleData() {
        const sampleData = { title: "STEP-UP 연구", questions: [] }; // PDF 기반 파싱 구조
        this.saveState(sampleData);
    }
};

// 앱 초기화 실행
window.onload = () => DashboardApp.init();
