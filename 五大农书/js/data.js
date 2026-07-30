// 数据可视化页面脚本
document.addEventListener('DOMContentLoaded', function() {
    initCounters();
    initCharts();
});

// 数字计数动画
function initCounters() {
    const counters = document.querySelectorAll('.stat-number');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    counters.forEach(counter => observer.observe(counter));
}

function animateCounter(element) {
    const target = parseInt(element.dataset.target);
    const duration = 2000;
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // 使用 easeOutQuart 缓动函数
        const easeProgress = 1 - Math.pow(1 - progress, 4);
        const current = Math.floor(easeProgress * target);
        
        element.textContent = current.toLocaleString();
        
        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            element.textContent = target.toLocaleString();
        }
    }
    
    requestAnimationFrame(update);
}

// ECharts 配色
const chartColors = ['#d4a76a', '#b8925a', '#8a6d3b', '#c89040', '#6b8e4e'];
const axisColor = '#7a6654';
const splitColor = 'rgba(212, 167, 106, 0.2)';

function initCharts() {
    initRadarChart();
    initBarChart();
    initTimelineChart();
    initPieChart();
    initImpactChart();
    initChapterChart();
    initHeatmapChart();
    
    // 窗口大小变化时重新调整图表
    window.addEventListener('resize', function() {
        document.querySelectorAll('.chart-container').forEach(chartDom => {
            const chart = echarts.getInstanceByDom(chartDom);
            if (chart) chart.resize();
        });
    });
}

// 1. 雷达图 - 综合实力对比
function initRadarChart() {
    const chart = echarts.init(document.getElementById('radarChart'));
    
    const option = {
        tooltip: {
            trigger: 'item',
            backgroundColor: 'rgba(255, 248, 231, 0.95)',
            borderColor: '#d4a76a',
            borderWidth: 1,
            textStyle: { color: '#4a3728' }
        },
        legend: {
            data: ['氾胜之书', '齐民要术', '陈旉农书', '王桢农书', '农政全书'],
            bottom: 0,
            textStyle: { color: axisColor, fontSize: 12 }
        },
        radar: {
            indicator: [
                { name: '技术创新', max: 100 },
                { name: '内容广度', max: 100 },
                { name: '历史影响', max: 100 },
                { name: '实用价值', max: 100 },
                { name: '文献地位', max: 100 },
                { name: '现代意义', max: 100 }
            ],
            radius: '65%',
            center: ['50%', '45%'],
            axisName: {
                color: axisColor,
                fontSize: 13,
                fontWeight: 'bold'
            },
            splitArea: {
                areaStyle: {
                    color: ['rgba(255, 248, 231, 0.3)', 'rgba(245, 230, 200, 0.3)']
                }
            },
            axisLine: { lineStyle: { color: splitColor } },
            splitLine: { lineStyle: { color: splitColor } }
        },
        series: [{
            type: 'radar',
            emphasis: { lineStyle: { width: 4 } },
            data: [
                {
                    value: [85, 60, 95, 80, 90, 75],
                    name: '氾胜之书',
                    itemStyle: { color: chartColors[0] },
                    areaStyle: { opacity: 0.25 }
                },
                {
                    value: [90, 85, 98, 90, 95, 80],
                    name: '齐民要术',
                    itemStyle: { color: chartColors[1] },
                    areaStyle: { opacity: 0.25 }
                },
                {
                    value: [75, 55, 85, 85, 75, 70],
                    name: '陈旉农书',
                    itemStyle: { color: chartColors[2] },
                    areaStyle: { opacity: 0.25 }
                },
                {
                    value: [80, 80, 80, 85, 80, 75],
                    name: '王桢农书',
                    itemStyle: { color: chartColors[3] },
                    areaStyle: { opacity: 0.25 }
                },
                {
                    value: [95, 95, 70, 90, 85, 90],
                    name: '农政全书',
                    itemStyle: { color: chartColors[4] },
                    areaStyle: { opacity: 0.25 }
                }
            ]
        }]
    };
    
    chart.setOption(option);
}

// 2. 柱状图 - 技术数量对比
function initBarChart() {
    const chart = echarts.init(document.getElementById('barChart'));
    
    const option = {
        tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(255, 248, 231, 0.95)',
            borderColor: '#d4a76a',
            borderWidth: 1,
            textStyle: { color: '#4a3728' }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '15%',
            top: '10%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: ['氾胜之书', '齐民要术', '陈旉农书', '王桢农书', '农政全书'],
            axisLine: { lineStyle: { color: splitColor } },
            axisLabel: { 
                color: axisColor, 
                fontSize: 12,
                rotate: 15
            }
        },
        yAxis: {
            type: 'value',
            name: '技术数量',
            nameTextStyle: { color: axisColor },
            axisLine: { lineStyle: { color: splitColor } },
            axisLabel: { color: axisColor },
            splitLine: { lineStyle: { color: splitColor } }
        },
        series: [{
            type: 'bar',
            data: [30, 52, 42, 65, 83],
            barWidth: '50%',
            itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: '#d4a76a' },
                    { offset: 1, color: '#b8925a' }
                ]),
                borderRadius: [8, 8, 0, 0]
            },
            emphasis: {
                itemStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: '#c89040' },
                        { offset: 1, color: '#8a6d3b' }
                    ])
                }
            },
            label: {
                show: true,
                position: 'top',
                color: axisColor,
                fontWeight: 'bold'
            }
        }]
    };
    
    chart.setOption(option);
}

// 3. 时间轴图
function initTimelineChart() {
    const chart = echarts.init(document.getElementById('timelineChart'));
    
    const option = {
        tooltip: {
            trigger: 'item',
            backgroundColor: 'rgba(255, 248, 231, 0.95)',
            borderColor: '#d4a76a',
            borderWidth: 1,
            textStyle: { color: '#4a3728' },
            formatter: function(params) {
                return `<strong>${params.data[1]}</strong><br/>年代：${params.data[0]}<br/>类型：${params.data[3]}`;
            }
        },
        grid: {
            left: '15%',
            right: '10%',
            bottom: '10%',
            top: '15%',
            containLabel: true
        },
        xAxis: {
            type: 'value',
            name: '年份 (公元)',
            nameTextStyle: { color: axisColor },
            min: -200,
            max: 1700,
            axisLine: { lineStyle: { color: splitColor } },
            axisLabel: { 
                color: axisColor,
                formatter: function(value) {
                    return value < 0 ? '前' + Math.abs(value) + '年' : value + '年';
                }
            },
            splitLine: { lineStyle: { color: splitColor } }
        },
        yAxis: {
            type: 'category',
            data: ['农政全书', '王桢农书', '陈旉农书', '齐民要术', '氾胜之书'],
            inverse: true,
            axisLine: { lineStyle: { color: splitColor } },
            axisLabel: { color: axisColor, fontWeight: 'bold', fontSize: 13 },
            splitLine: { lineStyle: { color: splitColor } }
        },
        series: [{
            type: 'scatter',
            symbolSize: 40,
            data: [
                [1639, '农政全书', 5, '集大成著作'],
                [1313, '王桢农书', 4, '南北结合'],
                [1149, '陈旉农书', 3, '南方水稻'],
                [544, '齐民要术', 2, '北方百科'],
                [-50, '氾胜之书', 1, '开山之作']
            ],
            itemStyle: {
                color: function(params) {
                    return chartColors[params.data[2] - 1];
                },
                borderColor: '#fff8e7',
                borderWidth: 3,
                shadowBlur: 10,
                shadowColor: 'rgba(212, 167, 106, 0.5)'
            },
            label: {
                show: true,
                formatter: function(params) {
                    return params.data[0] < 0 ? '前' + Math.abs(params.data[0]) : params.data[0];
                },
                position: 'right',
                color: axisColor,
                fontWeight: 'bold'
            }
        }]
    };
    
    chart.setOption(option);
}

// 4. 饼图 - 作物分布
function initPieChart() {
    const chart = echarts.init(document.getElementById('pieChart'));
    
    const option = {
        tooltip: {
            trigger: 'item',
            backgroundColor: 'rgba(255, 248, 231, 0.95)',
            borderColor: '#d4a76a',
            borderWidth: 1,
            textStyle: { color: '#4a3728' },
            formatter: '{b}: {c}种 ({d}%)'
        },
        legend: {
            orient: 'vertical',
            right: '5%',
            top: 'center',
            textStyle: { color: axisColor, fontSize: 12 }
        },
        series: [{
            type: 'pie',
            radius: ['40%', '70%'],
            center: ['35%', '50%'],
            avoidLabelOverlap: true,
            itemStyle: {
                borderRadius: 8,
                borderColor: '#fff8e7',
                borderWidth: 3
            },
            label: {
                show: false,
                position: 'center'
            },
            emphasis: {
                label: {
                    show: true,
                    fontSize: 18,
                    fontWeight: 'bold',
                    color: '#4a3728'
                }
            },
            labelLine: { show: false },
            data: [
                { value: 28, name: '粮食作物', itemStyle: { color: chartColors[0] } },
                { value: 22, name: '蔬菜瓜果', itemStyle: { color: chartColors[1] } },
                { value: 18, name: '经济作物', itemStyle: { color: chartColors[2] } },
                { value: 15, name: '油料作物', itemStyle: { color: chartColors[3] } },
                { value: 10, name: '药用植物', itemStyle: { color: chartColors[4] } },
                { value: 7, name: '其他作物', itemStyle: { color: '#c5e1b5' } }
            ]
        }]
    };
    
    chart.setOption(option);
}

// 5. 影响时长图
function initImpactChart() {
    const chart = echarts.init(document.getElementById('impactChart'));
    
    const option = {
        tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(255, 248, 231, 0.95)',
            borderColor: '#d4a76a',
            borderWidth: 1,
            textStyle: { color: '#4a3728' },
            formatter: '{b}<br/>影响年限：{c}年'
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '15%',
            top: '10%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: ['氾胜之书', '齐民要术', '陈旉农书', '王桢农书', '农政全书'],
            axisLine: { lineStyle: { color: splitColor } },
            axisLabel: { 
                color: axisColor, 
                fontSize: 12,
                rotate: 15
            }
        },
        yAxis: {
            type: 'value',
            name: '影响年限',
            nameTextStyle: { color: axisColor },
            axisLine: { lineStyle: { color: splitColor } },
            axisLabel: { color: axisColor },
            splitLine: { lineStyle: { color: splitColor } }
        },
        series: [{
            type: 'bar',
            data: [
                { value: 2050, itemStyle: { color: chartColors[0] } },
                { value: 1470, itemStyle: { color: chartColors[1] } },
                { value: 830, itemStyle: { color: chartColors[2] } },
                { value: 720, itemStyle: { color: chartColors[3] } },
                { value: 385, itemStyle: { color: chartColors[4] } }
            ],
            barWidth: '50%',
            borderRadius: [8, 8, 0, 0],
            label: {
                show: true,
                position: 'top',
                color: axisColor,
                fontWeight: 'bold',
                formatter: '{c}年'
            }
        }]
    };
    
    chart.setOption(option);
}

// 6. 章节对比图
function initChapterChart() {
    const chart = echarts.init(document.getElementById('chapterChart'));
    
    const option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
            backgroundColor: 'rgba(255, 248, 231, 0.95)',
            borderColor: '#d4a76a',
            borderWidth: 1,
            textStyle: { color: '#4a3728' }
        },
        legend: {
            data: ['总卷数', '核心章节', '附录/杂记'],
            bottom: 0,
            textStyle: { color: axisColor, fontSize: 12 }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '20%',
            top: '10%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: ['氾胜之书', '齐民要术', '陈旉农书', '王桢农书', '农政全书'],
            axisLine: { lineStyle: { color: splitColor } },
            axisLabel: { 
                color: axisColor, 
                fontSize: 12,
                rotate: 15
            }
        },
        yAxis: {
            type: 'value',
            name: '章节数',
            nameTextStyle: { color: axisColor },
            axisLine: { lineStyle: { color: splitColor } },
            axisLabel: { color: axisColor },
            splitLine: { lineStyle: { color: splitColor } }
        },
        series: [
            {
                name: '总卷数',
                type: 'bar',
                stack: 'total',
                data: [2, 10, 3, 37, 60],
                itemStyle: { color: chartColors[0], borderRadius: [0, 0, 0, 0] },
                label: { show: true, color: '#fff8e7', fontWeight: 'bold' }
            },
            {
                name: '核心章节',
                type: 'bar',
                stack: 'total',
                data: [15, 60, 25, 28, 45],
                itemStyle: { color: chartColors[1] }
            },
            {
                name: '附录/杂记',
                type: 'bar',
                stack: 'total',
                data: [3, 32, 5, 15, 15],
                itemStyle: { color: chartColors[2], borderRadius: [8, 8, 0, 0] }
            }
        ]
    };
    
    chart.setOption(option);
}

// 7. 热力图 - 知识领域覆盖
function initHeatmapChart() {
    const chart = echarts.init(document.getElementById('heatmapChart'));
    
    const books = ['氾胜之书', '齐民要术', '陈旉农书', '王桢农书', '农政全书'];
    const categories = ['耕作技术', '施肥技术', '灌溉技术', '作物栽培', '病虫害防治', '农具使用', '畜牧养殖', '农产品加工', '气象与物候'];
    
    // 数据：各农书在不同领域的覆盖深度 (1-5分)
    const data = [];
    const values = [
        // 氾胜之书
        [5, 4, 3, 4, 3, 3, 2, 1, 3],
        // 齐民要术
        [5, 5, 4, 5, 4, 4, 5, 5, 4],
        // 陈旉农书
        [4, 4, 5, 5, 3, 3, 2, 2, 4],
        // 王桢农书
        [4, 4, 4, 5, 4, 5, 4, 3, 3],
        // 农政全书
        [5, 5, 5, 5, 5, 5, 4, 4, 5]
    ];
    
    for (let i = 0; i < books.length; i++) {
        for (let j = 0; j < categories.length; j++) {
            data.push([j, i, values[i][j]]);
        }
    }
    
    const option = {
        tooltip: {
            position: 'top',
            backgroundColor: 'rgba(255, 248, 231, 0.95)',
            borderColor: '#d4a76a',
            borderWidth: 1,
            textStyle: { color: '#4a3728' },
            formatter: function(params) {
                const level = ['', '基础', '一般', '中等', '深入', '系统'];
                return `<strong>${books[params.data[1]]}</strong><br/>领域：${categories[params.data[0]]}<br/>覆盖深度：${level[params.data[2]]} (${params.data[2]}/5)`;
            }
        },
        grid: {
            left: '10%',
            right: '15%',
            bottom: '15%',
            top: '5%'
        },
        xAxis: {
            type: 'category',
            data: categories,
            splitArea: { show: true },
            axisLabel: { 
                color: axisColor, 
                fontSize: 12,
                rotate: 25
            },
            axisLine: { lineStyle: { color: splitColor } }
        },
        yAxis: {
            type: 'category',
            data: books,
            splitArea: { show: true },
            axisLabel: { color: axisColor, fontSize: 13, fontWeight: 'bold' },
            axisLine: { lineStyle: { color: splitColor } }
        },
        visualMap: {
            min: 0,
            max: 5,
            calculable: true,
            orient: 'vertical',
            right: '2%',
            top: 'center',
            textStyle: { color: axisColor },
            inRange: {
                color: ['#fff8e7', '#f5e6c8', '#e8d5a8', '#d4a76a', '#b8925a', '#8a6d3b']
            },
            text: ['系统', '基础'],
            textStyle: { color: axisColor }
        },
        series: [{
            name: '知识覆盖深度',
            type: 'heatmap',
            data: data,
            label: {
                show: true,
                color: '#4a3728',
                fontSize: 12,
                fontWeight: 'bold'
            },
            emphasis: {
                itemStyle: {
                    shadowBlur: 10,
                    shadowColor: 'rgba(212, 167, 106, 0.5)'
                }
            }
        }]
    };
    
    chart.setOption(option);
}
