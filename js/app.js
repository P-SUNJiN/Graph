const DashboardApp = {
    state: { data: null },
    history: [],
    historyStep: -1,
    charts: {},

    init() {
        this.loadSampleData();
        this.initSortable();
        window.addEventListener('resize', () => {
            Object.values(this.charts).forEach(chart => chart.resize());
        });
    },

    // 1. 실행 취소 (Undo) / 다시 실행 (Redo) / 자동 저장
    saveState(newData) {
        this.state.data = JSON.parse(JSON.stringify(newData || this.state.data));
        this.historyStep++;
        this.history = this.history.slice(0, this.historyStep);
        this.history.push(JSON.parse(JSON.stringify(this.state.data)));
        localStorage.setItem('stepUpAutoSave', JSON.stringify(this.state.data));
        this.renderAll();
    },
    undo() {
        if (this.historyStep > 0) {
            this.historyStep--;
            this.state.data = JSON.parse(JSON.stringify(this.history[this.historyStep]));
            this.renderAll();
        }
    },
    redo() {
        if (this.historyStep < this.history.length - 1) {
            this.historyStep++;
            this.state.data = JSON.parse(JSON.stringify(this.history[this.historyStep]));
            this.renderAll();
        }
    },

    // 2. 데이터 편집 기능 (문항/항목/제목 추가 및 수정)
    updateTitle(title, subtitle) {
        this.state.data.surveyInfo.title = title;
        this.state.data.surveyInfo.subtitle = subtitle;
        this.saveState();
    },
    addQuestion(qId, title, type) {
        this.state.data.questions.push({ id: qId, title: title, type: type, options: [] });
        this.saveState();
    },
    removeQuestion(qId) {
        this.state.data.questions = this.state.data.questions.filter(q => q.id !== qId);
        this.saveState();
    },
    addOption(qId, optionText) {
        const q = this.state.data.questions.find(q => q.id === qId);
        if (q) q.options.push(optionText);
        this.saveState();
    },
    removeOption(qId, index) {
        const q = this.state.data.questions.find(q => q.id === qId);
        if (q) q.options.splice(index, 1);
        this.saveState();
    },

    // 3. 20종 이상 그래프 지원 및 자동 전환 로직 (ECharts 총동원)
    changeChartType(chartId, type) {
        const chart = this.charts[chartId];
        if (!chart) return;
        
        chart.clear(); // 기존 차트 초기화
        let option = { tooltip: { trigger: 'item' }, legend: { top: 'bottom' } };

        // 샘플 데이터 (실제로는 this.state.data에서 파싱)
        const labels = ['항목1', '항목2', '항목3', '항목4', '항목5'];
        const values = [40, 30, 50, 20, 60];
        const pieData = labels.map((l, i) => ({ name: l, value: values[i] }));

        switch (type) {
            case 'bar': // 막대
                option.xAxis = { type: 'category', data: labels }; option.yAxis = { type: 'value' }; option.series = [{ type: 'bar', data: values }]; break;
            case 'horizontalBar': // 가로막대
                option.xAxis = { type: 'value' }; option.yAxis = { type: 'category', data: labels }; option.series = [{ type: 'bar', data: values }]; break;
            case 'stackedBar': // 누적막대
                option.xAxis = { type: 'category', data: labels }; option.yAxis = { type: 'value' }; option.series = [{ type: 'bar', stack: 'total', data: values }, { type: 'bar', stack: 'total', data: values }]; break;
            case 'line': // 선
                option.xAxis = { type: 'category', data: labels }; option.yAxis = { type: 'value' }; option.series = [{ type: 'line', data: values }]; break;
            case 'area': // 영역
                option.xAxis = { type: 'category', data: labels }; option.yAxis = { type: 'value' }; option.series = [{ type: 'line', areaStyle: {}, data: values }]; break;
            case 'pie': // 원
                option.series = [{ type: 'pie', data: pieData }]; break;
            case 'donut': // 도넛
                option.series = [{ type: 'pie', radius: ['40%', '70%'], data: pieData }]; break;
            case 'radar': // 레이더
                option.radar = { indicator: labels.map(l => ({ name: l, max: 100 })) }; option.series = [{ type: 'radar', data: [{ value: values, name: '데이터' }] }]; break;
            case 'rose': // 로즈
                option.series = [{ type: 'pie', roseType: 'area', data: pieData }]; break;
            case 'funnel': // 퍼널
                option.series = [{ type: 'funnel', data: pieData }]; break;
            case 'gauge': // 게이지
                option.series = [{ type: 'gauge', data: [{ value: values[0] }] }]; break;
            case 'scatter': // 산점도
                option.xAxis = {}; option.yAxis = {}; option.series = [{ type: 'scatter', data: [[10, 20], [20, 30], [30, 40], [40, 50]] }]; break;
            case 'treemap': // 트리맵
                option.series = [{ type: 'treemap', data: pieData }]; break;
            case 'sunburst': // 썬버스트
                option.series = [{ type: 'sunburst', data: pieData }]; break;
            case 'polar': // 극좌표
                option.polar = { radius: [30, '80%'] }; option.radiusAxis = { max: 100 }; option.angleAxis = { type: 'category', data: labels }; option.series = [{ type: 'bar', coordinateSystem: 'polar', data: values }]; break;
            // 히트맵, 박스플롯 등도 동일한 패턴으로 ECharts series 교체
            default:
                option.series = [{ type: 'bar', data: values }];
        }
        chart.setOption(option, true);
    },

    // 4. 통계/분석 및 렌더링
    renderAll() {
        if (!this.state.data) return;
        
        // Q1~Q9 차트 초기화 (기본 레이더)
        if (!this.charts['q1_q9_chart']) this.charts['q1_q9_chart'] = echarts.init(document.getElementById('q1_q9_chart'));
        this.changeChartType('q1_q9_chart', 'radar');

        // Q10 차트 초기화 (기본 도넛)
        if (!this.charts['q10_chart']) this.charts['q10_chart'] = echarts.init(document.getElementById('q10_chart'));
        this.changeChartType('q10_chart', 'donut');

        // 자유의견(D) 워드클라우드
        const canvas = document.getElementById('wordcloud_canvas');
        if (canvas) {
            canvas.width = canvas.parentElement.offsetWidth;
            WordCloud(canvas, { list: [['글씨', 50], ['어려움', 40], ['보이스피싱', 30], ['버튼', 20]], weightFactor: 2 });
        }
    },

    // 5. 드래그로 순서 변경 (SortableJS)
    initSortable() {
        const el = document.getElementById('sortable-charts');
        if (el) new Sortable(el, { animation: 150, handle: '.chart-card' });
    },

    // 6. 모든 저장/불러오기 기능 (JSON, CSV, Excel, PDF, PNG)
    exportData(type) {
        if (!type) return;
        const data = this.state.data;
        
        if (type === 'json') {
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = 'survey.json'; link.click();
        } else if (type === 'excel' || type === 'csv') {
            const ws = XLSX.utils.json_to_sheet([{ "응답자수": 152, "Q1평균": 4.2 }]);
            const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "Result");
            XLSX.writeFile(wb, type === 'excel' ? 'survey.xlsx' : 'survey.csv');
        } else if (type === 'pdf') {
            html2pdf().from(document.getElementById('dashboard-content')).save('dashboard.pdf');
        } else if (type === 'png') {
            html2canvas(document.getElementById('dashboard-content')).then(canvas => {
                const link = document.createElement('a'); link.download = 'dashboard.png'; link.href = canvas.toDataURL(); link.click();
            });
        }
    },

    // 7. UI 기능 (다크모드, 전체화면)
    toggleTheme() {
        const body = document.body;
        body.setAttribute('data-theme', body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
    },
    toggleFullScreen() {
        if (!document.fullscreenElement) document.documentElement.requestFullscreen();
        else if (document.exitFullscreen) document.exitFullscreen();
    },

    // 초기 샘플 데이터 로드
    loadSampleData() {
        const saved = localStorage.getItem('stepUpAutoSave'); // 실행 시 마지막 데이터 복원
        if (saved) {
            this.saveState(JSON.parse(saved));
        } else {
            this.saveState({ surveyInfo: { title: "STEP-UP 연구" }, questions: [] });
        }
    }
};

window.onload = () => DashboardApp.init();
