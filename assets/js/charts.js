/* ============================================================
   ΛΕΥΚΗ ΒΙΒΛΟΣ — Plotly chart factory
   Όλα τα interactive charts του HTML companion
   ============================================================ */

const PALETTE = {
  navy:   '#1f4e79',
  navyLt: '#7f9bbe',
  orange: '#e07b00',
  orangeLt: '#ffa951',
  ink:    '#2d3441',
  muted:  '#5b6473',
  rule:   'rgba(13,36,64,0.10)',
  red:    '#a52a2a',
  green:  '#2d7a4d',
};

const FONT_BODY = { family: 'Inter, system-ui, sans-serif', size: 12, color: PALETTE.ink };
const FONT_TITLE = { family: 'Fraunces, Playfair Display, serif', size: 16, color: PALETTE.navy };

const BASE_LAYOUT = {
  font: FONT_BODY,
  paper_bgcolor: 'rgba(0,0,0,0)',
  plot_bgcolor:  'rgba(0,0,0,0)',
  margin: { l: 60, r: 30, t: 20, b: 50 },
  xaxis: { gridcolor: PALETTE.rule, zerolinecolor: PALETTE.rule, linecolor: PALETTE.rule, tickcolor: PALETTE.rule },
  yaxis: { gridcolor: PALETTE.rule, zerolinecolor: PALETTE.rule, linecolor: PALETTE.rule, tickcolor: PALETTE.rule },
  hoverlabel: { bgcolor: PALETTE.navy, bordercolor: PALETTE.navy, font: { color: 'white', family: 'Inter, sans-serif', size: 12 } },
  showlegend: false,
};

const CONFIG = {
  responsive: true,
  displaylogo: false,
  modeBarButtonsToRemove: ['lasso2d', 'select2d', 'autoScale2d', 'toggleSpikelines'],
  toImageButtonOptions: { format: 'png', filename: 'chart', height: 600, width: 1200, scale: 2 },
  locale: 'el',
};

function fmtNum(v, decimals = 0) {
  return Number(v).toLocaleString('el-GR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

window.WBCharts = {
  PALETTE, fmtNum,

  // ---------- 4.1 Arrivals foreign vs domestic 2010-2024 ----------
  arrivals(elId, data) {
    const trace1 = {
      x: data.years,
      y: data.foreign,
      name: 'Αλλοδαποί',
      type: 'bar',
      marker: { color: PALETTE.navy },
      hovertemplate: '<b>%{x}</b><br>Αλλοδαποί: %{y:,} χιλ.<extra></extra>',
    };
    const trace2 = {
      x: data.years,
      y: data.domestic,
      name: 'Ημεδαποί',
      type: 'bar',
      marker: { color: PALETTE.navyLt },
      hovertemplate: '<b>%{x}</b><br>Ημεδαποί: %{y:,} χιλ.<extra></extra>',
    };
    Plotly.newPlot(elId, [trace1, trace2], {
      ...BASE_LAYOUT,
      barmode: 'group',
      yaxis: { ...BASE_LAYOUT.yaxis, title: { text: 'Αφίξεις (χιλ.)', font: FONT_BODY } },
      xaxis: { ...BASE_LAYOUT.xaxis, title: { text: 'Έτος', font: FONT_BODY } },
      showlegend: true,
      legend: { x: 0.02, y: 0.98, bgcolor: 'rgba(255,255,255,0.7)', bordercolor: PALETTE.rule, borderwidth: 0 },
    }, CONFIG);
  },

  // ---------- 4.3 Monthly arrivals 2024 ----------
  monthly(elId, data) {
    const colors = data.values.map((_, i) => {
      const m = i + 1;
      if (m >= 6 && m <= 9) return PALETTE.orange;
      if (m === 4 || m === 5 || m === 10) return PALETTE.navy;
      return PALETTE.navyLt;
    });
    const trace = {
      x: data.months,
      y: data.values,
      type: 'bar',
      marker: { color: colors, line: { color: 'white', width: 1 } },
      hovertemplate: '<b>%{x}</b><br>Αφίξεις: %{y:,}<extra></extra>',
    };
    Plotly.newPlot(elId, [trace], {
      ...BASE_LAYOUT,
      yaxis: { ...BASE_LAYOUT.yaxis, title: { text: 'Αφίξεις', font: FONT_BODY }, tickformat: ',d' },
    }, CONFIG);
  },

  // ---------- 4.4 Gini seasonality ----------
  gini(elId, data) {
    const trace = {
      x: data.years,
      y: data.values,
      type: 'scatter',
      mode: 'lines+markers',
      line: { color: PALETTE.navy, width: 3 },
      marker: { color: PALETTE.navy, size: 9, line: { color: 'white', width: 2 } },
      fill: 'tozeroy',
      fillcolor: 'rgba(31,78,121,0.08)',
      hovertemplate: '<b>%{x}</b><br>Gini: %{y:.3f}<extra></extra>',
    };
    Plotly.newPlot(elId, [trace], {
      ...BASE_LAYOUT,
      yaxis: { ...BASE_LAYOUT.yaxis, title: { text: 'Συντελεστής Gini', font: FONT_BODY }, range: [0, 0.55] },
    }, CONFIG);
  },

  // ---------- 4.5 Donut rooms by stars ----------
  donut(elId, data) {
    const colors = ['#7f7f7f', '#a8c9e6', '#3576b8', PALETTE.orange, '#f4c430'];
    const trace = {
      labels: data.labels,
      values: data.values,
      type: 'pie',
      hole: 0.55,
      marker: { colors, line: { color: 'white', width: 2 } },
      textinfo: 'label+percent',
      textfont: { family: 'Fraunces, serif', size: 13, color: PALETTE.navy },
      hovertemplate: '<b>%{label}</b><br>%{value:,} δωμάτια<br>%{percent}<extra></extra>',
    };
    Plotly.newPlot(elId, [trace], {
      ...BASE_LAYOUT,
      margin: { l: 30, r: 30, t: 30, b: 30 },
      showlegend: false,
    }, CONFIG);
  },

  // ---------- 4.6 Capacity dual-axis ----------
  capacity(elId, data) {
    const t1 = {
      x: data.years, y: data.units, name: 'Μονάδες',
      type: 'scatter', mode: 'lines+markers',
      line: { color: PALETTE.navy, width: 2.5 },
      marker: { size: 7 },
      yaxis: 'y',
      hovertemplate: '<b>%{x}</b><br>Μονάδες: %{y:,}<extra></extra>',
    };
    const t2 = {
      x: data.years, y: data.beds, name: 'Κλίνες',
      type: 'scatter', mode: 'lines+markers',
      line: { color: PALETTE.orange, width: 2.5 },
      marker: { size: 7 },
      yaxis: 'y2',
      hovertemplate: '<b>%{x}</b><br>Κλίνες: %{y:,}<extra></extra>',
    };
    Plotly.newPlot(elId, [t1, t2], {
      ...BASE_LAYOUT,
      yaxis:  { ...BASE_LAYOUT.yaxis, title: { text: 'Μονάδες', font: { ...FONT_BODY, color: PALETTE.navy } }, tickfont: { color: PALETTE.navy } },
      yaxis2: { title: { text: 'Κλίνες', font: { ...FONT_BODY, color: PALETTE.orange } }, tickfont: { color: PALETTE.orange }, overlaying: 'y', side: 'right', gridcolor: 'transparent' },
      showlegend: true,
      legend: { x: 0.02, y: 0.98 },
    }, CONFIG);
  },

  // ---------- 4.7 Monthly occupancy ----------
  occupancy(elId, data) {
    const colors = data.values.map(v => v >= 70 ? PALETTE.orange : v >= 40 ? PALETTE.navy : PALETTE.navyLt);
    Plotly.newPlot(elId, [{
      x: data.months, y: data.values,
      type: 'bar',
      marker: { color: colors, line: { color: 'white', width: 1 } },
      text: data.values.map(v => v.toFixed(0) + '%'),
      textposition: 'outside',
      textfont: { color: PALETTE.navy, size: 11, family: 'Inter, sans-serif' },
      hovertemplate: '<b>%{x}</b><br>Πληρότητα: %{y:.0f}%<extra></extra>',
    }], {
      ...BASE_LAYOUT,
      yaxis: { ...BASE_LAYOUT.yaxis, title: { text: 'Πληρότητα (%)', font: FONT_BODY }, range: [0, 100] },
    }, CONFIG);
  },

  // ---------- 4.8 ALoS line + trend ----------
  alos(elId, data) {
    const main = {
      x: data.years, y: data.values,
      type: 'scatter', mode: 'lines+markers',
      line: { color: PALETTE.navy, width: 3 },
      marker: { size: 7 },
      fill: 'tozeroy',
      fillcolor: 'rgba(31,78,121,0.08)',
      hovertemplate: '<b>%{x}</b><br>ALoS: %{y:.2f} ημ.<extra></extra>',
      name: 'ALoS',
    };
    // Linear trend
    const n = data.years.length;
    const xMean = data.years.reduce((a,b)=>a+b,0)/n;
    const yMean = data.values.reduce((a,b)=>a+b,0)/n;
    let num=0, den=0;
    for (let i=0; i<n; i++) { num += (data.years[i]-xMean)*(data.values[i]-yMean); den += (data.years[i]-xMean)**2; }
    const slope = num/den;
    const intercept = yMean - slope*xMean;
    const trend = {
      x: data.years,
      y: data.years.map(x => intercept + slope*x),
      type: 'scatter', mode: 'lines',
      line: { color: PALETTE.muted, width: 1.5, dash: 'dash' },
      name: `Τάση: ${slope >= 0 ? '+' : ''}${slope.toFixed(3)} ημ./έτος`,
      hoverinfo: 'skip',
    };
    Plotly.newPlot(elId, [main, trend], {
      ...BASE_LAYOUT,
      yaxis: { ...BASE_LAYOUT.yaxis, title: { text: 'ALoS (διανυκτ./άφιξη)', font: FONT_BODY }, range: [4, 7] },
      showlegend: true,
      legend: { x: 0.55, y: 0.98 },
    }, CONFIG);
  },

  // ---------- 4.9 STR share stacked ----------
  strShare(elId, data, key) {
    const hot = data[key].map(v => 100 - v);
    Plotly.newPlot(elId, [
      { x: data.years, y: hot, name: 'Ξενοδοχεία', type: 'bar', marker: { color: PALETTE.navy }, text: hot.map(v=>v.toFixed(0)+'%'), textposition: 'inside', textfont: { color: 'white' }, hovertemplate: '<b>%{x}</b><br>Ξενοδοχεία: %{y:.1f}%<extra></extra>' },
      { x: data.years, y: data[key], name: 'STR', type: 'bar', marker: { color: PALETTE.orange }, text: data[key].map(v=>v.toFixed(0)+'%'), textposition: 'inside', textfont: { color: PALETTE.navy }, hovertemplate: '<b>%{x}</b><br>STR: %{y:.1f}%<extra></extra>' },
    ], { ...BASE_LAYOUT, barmode: 'stack', yaxis: { ...BASE_LAYOUT.yaxis, range: [0, 100], title: { text: 'Μερίδιο (%)', font: FONT_BODY } }, showlegend: true, legend: { orientation: 'h', x: 0.5, xanchor: 'center', y: -0.18 } }, CONFIG);
  },

  // ---------- 4.10 POIs bar ----------
  pois(elId, data) {
    const sorted = data.slice().sort((a, b) => a.value - b.value);
    const colors = sorted.map(d => d.dest === 'Χανιά' ? PALETTE.orange : PALETTE.navy);
    Plotly.newPlot(elId, [{
      x: sorted.map(d => d.value),
      y: sorted.map(d => d.dest),
      type: 'bar',
      orientation: 'h',
      marker: { color: colors, line: { color: 'white', width: 1 } },
      text: sorted.map(d => fmtNum(d.value)),
      textposition: 'outside',
      textfont: { color: PALETTE.navy, family: 'Inter, sans-serif', size: 11 },
      hovertemplate: '<b>%{y}</b><br>POIs: %{x:,}<extra></extra>',
    }], { ...BASE_LAYOUT, margin: { l: 160, r: 60, t: 20, b: 50 }, xaxis: { ...BASE_LAYOUT.xaxis, title: { text: 'Αριθμός POIs', font: FONT_BODY } } }, CONFIG);
  },

  // ---------- 4.11 IPA scatter quadrant ----------
  ipa(elId, data) {
    const xMed = data.x.reduce((a,b)=>a+b,0)/data.x.length;
    const yMed = data.y.reduce((a,b)=>a+b,0)/data.y.length;
    Plotly.newPlot(elId, [{
      x: data.x, y: data.y,
      mode: 'markers+text',
      type: 'scatter',
      text: data.labels,
      textposition: 'top center',
      textfont: { size: 11, family: 'Inter, sans-serif', color: PALETTE.ink },
      marker: {
        size: 14,
        color: data.cat.map(c => c === 'Τουριστικές υποδομές' ? PALETTE.orange : PALETTE.navy),
        line: { color: 'white', width: 1.5 },
      },
      hovertemplate: '<b>%{text}</b><br>Σπουδαιότητα: %{x:.3f}<br>Αξιολόγηση: %{y:.2f}<extra></extra>',
    }], {
      ...BASE_LAYOUT,
      shapes: [
        { type: 'line', x0: xMed, x1: xMed, y0: 0, y1: 1, yref: 'paper', line: { color: PALETTE.muted, width: 1, dash: 'dash' } },
        { type: 'line', x0: 0, x1: 1, xref: 'paper', y0: yMed, y1: yMed, line: { color: PALETTE.muted, width: 1, dash: 'dash' } },
      ],
      xaxis: { ...BASE_LAYOUT.xaxis, title: { text: 'Σπουδαιότητα (τυποποιημένη)', font: FONT_BODY } },
      yaxis: { ...BASE_LAYOUT.yaxis, title: { text: 'Αξιολόγηση κατοίκων (1–5)', font: FONT_BODY } },
    }, CONFIG);
  },

  // ---------- 4.12 Turnover hotels vs STR ----------
  turnover(elId, data) {
    Plotly.newPlot(elId, [
      { x: data.years, y: data.hotel, name: 'Ξενοδοχεία', type: 'bar', marker: { color: PALETTE.navy }, hovertemplate: '<b>%{x}</b><br>Ξενοδοχεία: %{y:.0f} εκ. €<extra></extra>' },
      { x: data.years, y: data.str, name: 'STR', type: 'bar', marker: { color: PALETTE.orange }, hovertemplate: '<b>%{x}</b><br>STR: %{y:.0f} εκ. €<extra></extra>' },
    ], { ...BASE_LAYOUT, barmode: 'group', yaxis: { ...BASE_LAYOUT.yaxis, title: { text: 'Τζίρος (εκ. €)', font: FONT_BODY } }, showlegend: true, legend: { x: 0.02, y: 0.98 } }, CONFIG);
  },

  // ---------- 4.13 GVA stacked area ----------
  gva(elId, data) {
    Plotly.newPlot(elId, [
      { x: data.years, y: data.gi, name: 'ΑΠΑ G-I', type: 'scatter', mode: 'lines', stackgroup: 'one', line: { color: PALETTE.navy, width: 0 }, fillcolor: 'rgba(31,78,121,0.85)', hovertemplate: '<b>%{x}</b><br>G-I: %{y:.0f} εκ. €<extra></extra>' },
      { x: data.years, y: data.other, name: 'ΑΠΑ Λοιπών', type: 'scatter', mode: 'lines', stackgroup: 'one', line: { color: PALETTE.navyLt, width: 0 }, fillcolor: 'rgba(127,155,190,0.65)', hovertemplate: '<b>%{x}</b><br>Λοιπά: %{y:.0f} εκ. €<extra></extra>' },
    ], { ...BASE_LAYOUT, yaxis: { ...BASE_LAYOUT.yaxis, title: { text: 'ΑΠΑ (εκ. €)', font: FONT_BODY } }, showlegend: true, legend: { x: 0.02, y: 0.98 } }, CONFIG);
  },

  // ---------- 4.14 Building permits ----------
  permits(elId, data) {
    const colors = data.years.map(y => y === 2025 ? PALETTE.muted : PALETTE.navy);
    Plotly.newPlot(elId, [
      { x: data.years, y: data.permits, name: 'Νέες άδειες', type: 'bar', marker: { color: colors }, yaxis: 'y', hovertemplate: '<b>%{x}</b><br>Άδειες: %{y:,}<extra></extra>' },
      { x: data.years, y: data.dwellings, name: 'Νέες κατοικίες', type: 'scatter', mode: 'lines+markers', line: { color: PALETTE.orange, width: 2.5 }, marker: { size: 7 }, yaxis: 'y2', hovertemplate: '<b>%{x}</b><br>Κατοικίες: %{y:,}<extra></extra>' },
    ], { ...BASE_LAYOUT, yaxis: { ...BASE_LAYOUT.yaxis, title: { text: 'Άδειες', font: { ...FONT_BODY, color: PALETTE.navy } } }, yaxis2: { title: { text: 'Κατοικίες', font: { ...FONT_BODY, color: PALETTE.orange } }, overlaying: 'y', side: 'right', gridcolor: 'transparent' }, showlegend: true, legend: { x: 0.02, y: 0.98 } }, CONFIG);
  },

  // ---------- 4.15 TII Defert ----------
  tii(elId, data) {
    const yMax = Math.max(14, Math.max(...data.values) * 1.25);
    Plotly.newPlot(elId, [{
      x: data.years, y: data.values,
      type: 'scatter', mode: 'lines+markers+text',
      line: { color: PALETTE.red, width: 3 },
      marker: { size: 8, color: PALETTE.red, line: { color: 'white', width: 2 } },
      text: data.values.map(v => v.toFixed(1)),
      textposition: 'top center',
      textfont: { size: 10, color: PALETTE.red, family: 'Inter, sans-serif' },
      fill: 'tozeroy',
      fillcolor: 'rgba(165,42,42,0.08)',
      hovertemplate: '<b>Έτος %{x}</b><br>TII = %{y:.2f}<br>(διανυκτ. ÷ πληθ. × 100)<extra></extra>',
      name: 'TII Χανιά',
    }], {
      ...BASE_LAYOUT,
      shapes: [
        // Threshold ζώνες χρωματιστές
        { type:'rect', xref:'paper', x0:0, x1:1, y0:0,  y1:5,  fillcolor:'rgba(45,122,77,0.05)', line:{width:0}, layer:'below' },
        { type:'rect', xref:'paper', x0:0, x1:1, y0:5,  y1:10, fillcolor:'rgba(244,196,48,0.06)', line:{width:0}, layer:'below' },
        { type:'rect', xref:'paper', x0:0, x1:1, y0:10, y1:15, fillcolor:'rgba(224,123,0,0.08)', line:{width:0}, layer:'below' },
        { type:'rect', xref:'paper', x0:0, x1:1, y0:15, y1:yMax, fillcolor:'rgba(165,42,42,0.10)', line:{width:0}, layer:'below' },
        { type:'line', xref:'paper', x0:0, x1:1, y0:10, y1:10, line:{ color:'#a52a2a', width:1.5, dash:'dash' } },
      ],
      annotations: [
        { xref:'paper', x:0.99, y:2.5, text:'Χαμηλή πίεση', showarrow:false, font:{size:10, color:PALETTE.muted}, xanchor:'right' },
        { xref:'paper', x:0.99, y:7.5, text:'Μέτρια πίεση', showarrow:false, font:{size:10, color:PALETTE.muted}, xanchor:'right' },
        { xref:'paper', x:0.99, y:12.5,text:'Υψηλή πίεση — όριο υπερκορεσμού Defert', showarrow:false, font:{size:10, color:'#a52a2a'}, xanchor:'right' },
      ],
      yaxis: { ...BASE_LAYOUT.yaxis,
               title: { text: 'TII (διανυκτερεύσεις ÷ κάτοικο × 100) ↑ μεγαλύτερη πίεση', font: FONT_BODY },
               range: [0, yMax] },
      xaxis: { ...BASE_LAYOUT.xaxis, title: { text: 'Έτος', font: FONT_BODY } },
      margin: { l: 70, r: 30, t: 20, b: 50 },
    }, CONFIG);
  },

  // ---------- 4.16 / 4.18 Heatmap ----------
  heatmap(elId, data) {
    Plotly.newPlot(elId, [{
      z: data.z,
      x: data.cols,
      y: data.rows,
      type: 'heatmap',
      colorscale: data.scale || [
        [0,    '#a52a2a'], [0.2, '#d97a4f'], [0.4, '#f4c430'],
        [0.6,  '#a8d68f'], [0.8, '#5eb86b'], [1,   '#2d7a4d'],
      ],
      zmin: data.zmin ?? 1, zmax: data.zmax ?? 5,
      colorbar: { title: { text: data.cbarTitle || '', font: FONT_BODY }, tickfont: FONT_BODY, thickness: 14, len: 0.8 },
      hovertemplate: '<b>%{y}</b><br>%{x}: %{z:.2f}<extra></extra>',
    }], {
      ...BASE_LAYOUT,
      xaxis: { ...BASE_LAYOUT.xaxis, side: 'bottom', tickangle: -30 },
      yaxis: { ...BASE_LAYOUT.yaxis, autorange: 'reversed' },
      margin: { l: 200, r: 30, t: 20, b: 80 },
    }, CONFIG);
  },

  // ---------- 4.17 LCA stacked horizontal ----------
  lca(elId, data) {
    const colors = ['#c0392b', '#e07b00', '#f1c40f', '#3576b8', '#27ae60'];
    const txtColors = ['white', 'white', '#1f2937', 'white', 'white'];
    const traces = data.classes.map((cls, i) => ({
      x: data.values[i],
      y: data.dests,
      name: cls,
      orientation: 'h',
      type: 'bar',
      marker: { color: colors[i], line: { color: 'white', width: 1 } },
      text: data.values[i].map(v => v >= 5 ? v.toFixed(0) + '%' : ''),
      textfont: { color: txtColors[i], size: 11, family: 'Inter, sans-serif' },
      textposition: 'inside',
      insidetextanchor: 'middle',
      hovertemplate: `<b>%{y}</b><br>${cls}: %{x:.1f}%<extra></extra>`,
    }));
    Plotly.newPlot(elId, traces, {
      ...BASE_LAYOUT,
      barmode: 'stack',
      xaxis: {
        ...BASE_LAYOUT.xaxis,
        type: 'linear',
        range: [0, 100],
        title: { text: 'Σταθμισμένο % κατοίκων ανά τυπολογία (αθροίζει σε 100% / προορισμό)', font: FONT_BODY },
        tickmode: 'array',
        tickvals: [0, 20, 40, 60, 80, 100],
        ticktext: ['0%', '20%', '40%', '60%', '80%', '100%'],
        tickangle: 0,
      },
      yaxis: { ...BASE_LAYOUT.yaxis, automargin: true },
      margin: { l: 150, r: 40, t: 20, b: 130 },
      showlegend: true,
      legend: {
        orientation: 'h',
        x: 0.5, xanchor: 'center',
        y: -0.30, yanchor: 'top',
        font: { size: 10, family: 'Inter, sans-serif' },
        traceorder: 'normal',
      },
    }, CONFIG);
  },

  // ---------- Strategic Quadrants (generic) ----------
  quadrant(elId, data) {
    const xMed = data.x.reduce((a,b)=>a+b,0)/data.x.length;
    const yMed = data.y.reduce((a,b)=>a+b,0)/data.y.length;
    const xRange = [Math.min(...data.x), Math.max(...data.x)];
    const yRange = [Math.min(...data.y), Math.max(...data.y)];
    const xPad = (xRange[1]-xRange[0])*0.12;
    const yPad = (yRange[1]-yRange[0])*0.18;
    const colors = data.mature.map(m => m ? PALETTE.orange : PALETTE.navy);
    // Build explicit tick arrays (Plotly auto-tick is unreliable with shapes+annotations)
    function ticksFor(min, max, span) {
      const step = span > 30 ? 20 : span > 10 ? 5 : span > 2 ? 1 : 0.25;
      const start = Math.ceil(min / step) * step;
      const out = [];
      for (let v = start; v <= max; v += step) out.push(Number(v.toFixed(2)));
      return { vals: out, step };
    }
    const yLo = yRange[0] - yPad, yHi = yRange[1] + yPad;
    const xLo = xRange[0] - xPad, xHi = xRange[1] + xPad;
    const yT = ticksFor(yLo, yHi, yHi - yLo);
    const xT = ticksFor(xLo, xHi, xHi - xLo);
    // Y-axis title — single line with direction in parentheses
    let yTitle = data.yLabel || '';
    if (data.yHigh) yTitle += `   (↑ ${data.yHigh})`;
    // X-axis title — single line with direction in parentheses
    let xTitle = data.xLabel || '';
    if (data.xHigh) xTitle += `   (→ ${data.xHigh})`;
    Plotly.newPlot(elId, [{
      x: data.x, y: data.y, text: data.labels,
      mode: 'markers+text', type: 'scatter',
      textposition: 'top center',
      textfont: { size: 11, family: 'Inter, sans-serif', color: PALETTE.ink, weight: 600 },
      marker: { size: 16, color: colors, line: { color: 'white', width: 2 } },
      hovertemplate: '<b>%{text}</b><br>' + (data.xLabel || 'x') + ': %{x:.2f}<br>' + (data.yLabel || 'y') + ': %{y:.2f}<extra></extra>',
    }], {
      ...BASE_LAYOUT,
      shapes: [
        { type: 'line', x0: xMed, x1: xMed, y0: 0, y1: 1, yref: 'paper', line: { color: PALETTE.muted, width: 1, dash: 'dash' } },
        { type: 'line', x0: 0, x1: 1, xref: 'paper', y0: yMed, y1: yMed, line: { color: PALETTE.muted, width: 1, dash: 'dash' } },
      ],
      annotations: [
        { xref: 'paper', yref: 'paper', x: 0.02, y: 0.97, text: data.labels_q?.tl || '', showarrow: false, font: { size: 10, color: PALETTE.navy, weight: 600 }, xanchor: 'left',  yanchor: 'top',    bgcolor: 'rgba(255,255,255,0.85)', borderpad: 3 },
        { xref: 'paper', yref: 'paper', x: 0.98, y: 0.97, text: data.labels_q?.tr || '', showarrow: false, font: { size: 10, color: PALETTE.navy, weight: 600 }, xanchor: 'right', yanchor: 'top',    bgcolor: 'rgba(255,255,255,0.85)', borderpad: 3 },
        { xref: 'paper', yref: 'paper', x: 0.02, y: 0.03, text: data.labels_q?.bl || '', showarrow: false, font: { size: 10, color: PALETTE.muted },               xanchor: 'left',  yanchor: 'bottom', bgcolor: 'rgba(255,255,255,0.85)', borderpad: 3 },
        { xref: 'paper', yref: 'paper', x: 0.98, y: 0.03, text: data.labels_q?.br || '', showarrow: false, font: { size: 10, color: PALETTE.muted },               xanchor: 'right', yanchor: 'bottom', bgcolor: 'rgba(255,255,255,0.85)', borderpad: 3 },
      ],
      xaxis: { ...BASE_LAYOUT.xaxis,
               title: { text: xTitle, font: FONT_BODY, standoff: 14 },
               type: data.xLog ? 'log' : 'linear',
               range: [xLo, xHi],
               tickmode: 'array', tickvals: xT.vals, ticktext: xT.vals.map(v => String(v)),
               automargin: true },
      yaxis: { ...BASE_LAYOUT.yaxis,
               title: { text: yTitle, font: FONT_BODY, standoff: 12 },
               range: [yLo, yHi],
               tickmode: 'array', tickvals: yT.vals, ticktext: yT.vals.map(v => String(v)),
               automargin: true },
      margin: { l: 90, r: 50, t: 50, b: 80 },
    }, CONFIG);
  },

  // ---------- Recovery index horizontal bars ----------
  recovery(elId, data) {
    const sorted = data.slice().sort((a, b) => a.value - b.value);
    const colors = sorted.map(d => d.dest === 'Χανιά' ? PALETTE.orange : PALETTE.navy);
    Plotly.newPlot(elId, [{
      x: sorted.map(d => d.value), y: sorted.map(d => d.dest),
      type: 'bar', orientation: 'h',
      marker: { color: colors, line: { color: 'white', width: 1 } },
      text: sorted.map(d => d.value.toFixed(2)),
      textposition: 'outside',
      textfont: { color: PALETTE.navy, family: 'Inter, sans-serif', size: 11 },
      hovertemplate: '<b>%{y}</b><br>Λόγος: %{x:.2f}<extra></extra>',
    }], {
      ...BASE_LAYOUT,
      shapes: [{ type: 'line', x0: 1, x1: 1, y0: -0.5, y1: sorted.length-0.5, line: { color: '#c0392b', width: 1.5, dash: 'dash' } }],
      annotations: [{ x: 1, y: 0.5, text: 'Επίπεδο 2019', showarrow: false, font: { size: 10, color: '#c0392b' }, xanchor: 'left', xshift: 5 }],
      margin: { l: 160, r: 60, t: 20, b: 50 },
      xaxis: { ...BASE_LAYOUT.xaxis, title: { text: 'Λόγος ανάκαμψης 2024 / 2019', font: FONT_BODY } },
    }, CONFIG);
  },

  // ---------- Land cover (Eurostat lan_lcv_ovw) — horizontal bar ----------
  landCover(elId, data) {
    // Sort by value, accent the artificial-land row (πρώτο label)
    const total = data.values.reduce((a,b)=>a+b,0);
    const idx = data.values.map((v,i) => ({ v, label: data.labels[i], i }))
                            .sort((a,b) => a.v - b.v);
    const colorMap = ['#5b6473','#d4b266','#2d7a4d','#88b87a','#ddc88a','#cba07a','#5eaad9','#86c9d6'];
    const colors = idx.map(o => o.label.includes('Τεχνητή') ? PALETTE.orange : colorMap[o.i % colorMap.length]);
    Plotly.newPlot(elId, [{
      x: idx.map(o => o.v),
      y: idx.map(o => o.label),
      type: 'bar',
      orientation: 'h',
      marker: { color: colors, line: { color: 'white', width: 1 } },
      text: idx.map(o => `${fmtNum(o.v, 0)} km² · ${(o.v/total*100).toFixed(1)}%`),
      textposition: 'outside',
      textfont: { color: PALETTE.ink, family: 'Inter, sans-serif', size: 11 },
      hovertemplate: '<b>%{y}</b><br>%{x:,.0f} km²<extra></extra>',
    }], {
      ...BASE_LAYOUT,
      margin: { l: 140, r: 110, t: 20, b: 50 },
      xaxis: { ...BASE_LAYOUT.xaxis,
               title: { text: 'Έκταση (km²) — σύνολο Κρήτης 8.346 km²', font: FONT_BODY },
               tickformat: ',d' },
      yaxis: { ...BASE_LAYOUT.yaxis, automargin: true },
    }, CONFIG);
  },

  // ---------- WEI+ trend ----------
  wei(elId, data) {
    const yMax = 30;
    const xMin = data.years[0], xMax = data.years[data.years.length-1];
    Plotly.newPlot(elId, [{
      x: data.years, y: data.values,
      type: 'scatter', mode: 'lines+markers',
      line: { color: '#3a73a8', width: 3, shape: 'spline', smoothing: 0.5 },
      marker: { size: 7, color: '#1f4e79', line: { color: 'white', width: 1.5 } },
      fill: 'tozeroy',
      fillcolor: 'rgba(58,115,168,0.10)',
      hovertemplate: '<b>%{x}</b><br>WEI+ = %{y:.2f}<extra></extra>',
      name: 'Greek WEI+',
    }], {
      ...BASE_LAYOUT,
      shapes: [
        { type: 'rect', xref:'paper', yref:'y', x0:0, x1:1, y0:0,  y1:10, fillcolor:'rgba(45,122,77,0.05)', line:{width:0}, layer:'below' },
        { type: 'rect', xref:'paper', yref:'y', x0:0, x1:1, y0:10, y1:20, fillcolor:'rgba(244,196,48,0.06)', line:{width:0}, layer:'below' },
        { type: 'rect', xref:'paper', yref:'y', x0:0, x1:1, y0:20, y1:yMax, fillcolor:'rgba(165,42,42,0.08)', line:{width:0}, layer:'below' },
        { type: 'line', xref:'paper', yref:'y', x0:0, x1:1, y0:20, y1:20, line:{ color:'#a52a2a', width:1, dash:'dash' } },
      ],
      annotations: [
        { xref:'paper', yref:'y', x:0.99, y:5,  text:'< 10 χαμηλή πίεση',  showarrow:false, font:{size:10, color: PALETTE.muted}, xanchor:'right' },
        { xref:'paper', yref:'y', x:0.99, y:15, text:'10–20 μέτρια πίεση', showarrow:false, font:{size:10, color: PALETTE.muted}, xanchor:'right' },
        { xref:'paper', yref:'y', x:0.99, y:25, text:'> 20 έντονη πίεση',  showarrow:false, font:{size:10, color:'#a52a2a'},     xanchor:'right' },
      ],
      xaxis: { ...BASE_LAYOUT.xaxis,
               title: { text: 'Έτος', font: FONT_BODY },
               range: [xMin, xMax],
               tickformat: 'd', dtick: 2, type: 'linear' },
      yaxis: { ...BASE_LAYOUT.yaxis,
               title: { text: 'WEI+ (4ετής μέσος όρος) ↑ μεγαλύτερη πίεση', font: FONT_BODY },
               range: [0, yMax], dtick: 5 },
      margin: { l: 70, r: 30, t: 20, b: 50 },
    }, CONFIG);
  },
};
