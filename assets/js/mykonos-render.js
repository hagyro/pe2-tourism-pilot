/* ============================================================
   Μύκονος rendering: φορτώνει mykonos.json και κατασκευάζει όλα
   τα interactive elements
   ============================================================ */

(async function () {
  const data = await fetch('assets/data/mykonos.json').then(r => r.json());
  const C = window.WBCharts;

  // ---------- Charts ----------
  // 4.1 Arrivals
  if (data.demand) {
    C.arrivals('chart_arrivals', {
      years: data.demand.years,
      foreign: data.demand.foreign_thousands,
      domestic: data.demand.domestic_thousands,
    });
  }

  // 4.2 Recovery index
  if (data.recovery) {
    C.recovery('chart_recovery', data.recovery);
  }

  // 4.3 Monthly arrivals
  if (data.monthly) {
    C.monthly('chart_monthly', data.monthly);
  }

  // 4.4 Gini
  if (data.seasonality) {
    C.gini('chart_gini', { years: data.seasonality.years, values: data.seasonality.gini });
  }

  // 4.5 Donut
  if (data.rooms_by_stars) {
    C.donut('chart_donut', data.rooms_by_stars);
  }

  // 4.6 Capacity dual-axis
  if (data.capacity) {
    C.capacity('chart_capacity', data.capacity);
  }

  // 4.7 Occupancy
  if (data.occupancy) {
    C.occupancy('chart_occupancy', data.occupancy);
  }

  // 4.8 ALoS
  if (data.demand) {
    C.alos('chart_alos', { years: data.demand.years, values: data.demand.alos });
  }

  // 4.9 STR share — split into 2 panels
  if (data.str_market) {
    C.strShare('chart_str_arrivals', data.str_market, 'str_arrival_share');
    C.strShare('chart_str_overnights', data.str_market, 'str_overnight_share');
  }

  // 4.10 POIs
  if (data.pois) {
    C.pois('chart_pois', data.pois);
  }

  // 4.11 IPA
  // Read pre-computed from quadrants metadata or build from MRB
  // For pilot: use static dataset
  C.ipa('chart_ipa', {
    x: [0.32, 0.28, 0.27, 0.18, 0.31, 0.16, 0.22, 0.14, 0.31, 0.30, 0.21, 0.26, 0.19, 0.24, 0.27],
    y: [4.10, 4.05, 4.05, 3.95, 4.05, 2.65, 2.77, 2.32, 3.78, 2.95, 3.45, 3.35, 3.45, 3.65, 4.05],
    labels: ['Καταλύματα (επάρκεια)','Καταλύματα (ποιότητα)','Χώροι εστίασης','Τουρ. υποδομές','Διασκέδαση','Τοπικό οδικό','Σύνδεση Ελλάδα','Στάθμευση','Ακτοπλοΐα','Δημ. Υγεία','Αστυνόμευση','Ύδρευση','Αποχέτευση','Απορρίμματα','Τηλεπ./Internet'],
    cat: ['Τουριστικές υποδομές','Τουριστικές υποδομές','Τουριστικές υποδομές','Τουριστικές υποδομές','Τουριστικές υποδομές','Δημόσιες','Δημόσιες','Δημόσιες','Δημόσιες','Δημόσιες','Δημόσιες','Δημόσιες','Δημόσιες','Δημόσιες','Δημόσιες'],
  });

  // 4.12 Turnover
  if (data.str_market) {
    C.turnover('chart_turnover', {
      years: data.str_market.years,
      hotel: data.str_market.hotel_turnover_meur,
      str:   data.str_market.str_turnover_meur,
    });
  }

  // 4.13 GVA stacked
  if (data.economic) {
    C.gva('chart_gva', {
      years: data.economic.years,
      gi: data.economic.gva_gi_meur,
      other: data.economic.gva_total_meur.map((t, i) => t - data.economic.gva_gi_meur[i]),
    });
  }

  // 4.13b Quadrant Employment × SAT
  if (data.quadrants) {
    const qd = Object.entries(data.quadrants);
    const xs = qd.map(([k,v]) => v.Q15_pct);
    const ys = qd.map(([k,v]) => v.Q9_SAT_mean);
    const labels = qd.map(([k,v]) => prettify(k));
    const mature = qd.map(([k,v]) => isMature(k));
    C.quadrant('chart_q_employment', {
      x: xs, y: ys, labels, mature,
      xLabel: '% Τουριστικά απασχολούμενων στο νοικοκυριό',
      yLabel: 'Μέση συνολική ικανοποίηση κατοίκων (1–5)',
      xHigh: 'υψηλή εξάρτηση',  xLow: 'χαμηλή εξάρτηση',
      yHigh: 'περισσότερο ικανοποιημένοι', yLow: 'λιγότερο ικανοποιημένοι',
      labels_q: { tl: 'Διαφοροποιημένη / ικανοποιημένη', tr: 'Στηριζόμενη από τουρισμό', bl: 'Περιορισμένος τουρισμός / χαμηλή ικανοποίηση', br: 'Εξαρτώμενη / δυσαρεστημένη' },
    });
  }

  // 4.14 Permits
  if (data.permits) {
    C.permits('chart_permits', data.permits);
  }

  // 4.15 TII
  if (data.demand) {
    C.tii('chart_tii', { years: data.demand.years, values: data.demand.tii });
  }

  // 4.15c Quadrant TFI × POI
  if (data.quadrants) {
    const qd = Object.entries(data.quadrants);
    const xs = qd.map(([k,v]) => Math.log10(Math.max(v.TFI_2024, 0.1)));
    const ys = qd.map(([k,v]) => v.POI_theta);
    const labels = qd.map(([k,v]) => prettify(k));
    const mature = qd.map(([k,v]) => isMature(k));
    C.quadrant('chart_q_tfi_poi', {
      x: xs, y: ys, labels, mature,
      xLabel: 'Δείκτης Τουριστικής Λειτουργίας TFI 2024 (log₁₀)',
      yLabel: 'Δείκτης Αντιληπτής Πίεσης POI θ',
      xHigh: 'μεγαλύτερη αντικειμενική πίεση', xLow: 'μικρότερη αντικειμενική πίεση',
      yHigh: 'υψηλότερη υποκειμενική πίεση', yLow: 'χαμηλότερη υποκειμενική πίεση',
      labels_q: { tl: 'Υποκειμενική κρίση από STR', tr: 'Κορεσμένος + ενήμερος', bl: 'Λανθάνον δυναμικό', br: 'Ώριμος προσαρμοσμένος' },
    });
  }

  // 4.16c Quadrant STR × Housing
  if (data.quadrants) {
    const qd = Object.entries(data.quadrants);
    const xs = qd.map(([k,v]) => v.Q3_7_pct);
    const ys = qd.map(([k,v]) => v.Q3_4_pct);
    const labels = qd.map(([k,v]) => prettify(k));
    const mature = qd.map(([k,v]) => isMature(k));
    C.quadrant('chart_q_str_housing', {
      x: xs, y: ys, labels, mature,
      xLabel: '% συμφωνώ: STR μειώνει διαθεσιμότητα κατοικιών',
      yLabel: '% συμφωνώ: υπάρχει πρόβλημα στέγης για μόνιμους',
      xHigh: 'μεγαλύτερη επίδραση STR', xLow: 'μικρότερη επίδραση STR',
      yHigh: 'εντονότερη στεγαστική κρίση', yLow: 'καμία στεγαστική κρίση',
      labels_q: { tl: 'Στεγ. πρόβλημα χωρίς STR ως αιτία', tr: 'Στεγαστική κρίση από STR', bl: 'Καμία πίεση', br: 'STR πίεση χωρίς στεγ. κρίση' },
    });
  }

  // 4.16 Doxey heatmap
  if (data.mrb_overall) {
    const items = ['Q1_2','Q1_3','Q1_7','Q1_9','Q1_10','Q1_11'];
    const labels = ['Ασφάλεια','Φιλικότητα','Στεγ. επίδραση','Ανταγωνισμός','Ευθύνη υποβάθμισης','Στήριξη μέτρων'];
    const dests = ['Μύκονος','Μύκονος','Μύκονος','Βόλος-Πήλιο','Ναύπλιο'];
    // Use mrb_cross would need pivoting — skip for now use placeholder actual values from doxey heatmap
    C.heatmap('chart_doxey', {
      rows: labels,
      cols: dests,
      z: [
        [4.50, 4.31, 4.28, 4.49, 4.49],
        [4.00, 4.15, 4.19, 4.11, 4.17],
        [3.39, 3.05, 2.71, 2.33, 2.47],
        [3.35, 3.12, 2.82, 2.31, 2.47],
        [2.15, 2.38, 2.34, 1.90, 1.89],
        [2.65, 2.61, 2.74, 2.11, 1.82],
      ],
      cbarTitle: 'Μέση αξιολόγηση (1–5)',
      zmin: 1, zmax: 5,
    });
  }

  // 4.17 LCA
  if (data.lca) {
    const dest_pretty = data.lca.destinations.map(prettify);
    C.lca('chart_lca', { dests: dest_pretty, classes: data.lca.classes, values: data.lca.values });
  }

  // 4.17b Quadrant LCA polarization
  if (data.quadrants) {
    const qd = Object.entries(data.quadrants);
    const xs = qd.map(([k,v]) => v.PCT_C1_antagonism);
    const ys = qd.map(([k,v]) => v.PCT_C5_pure_euphoria);
    const labels = qd.map(([k,v]) => prettify(k));
    const mature = qd.map(([k,v]) => isMature(k));
    C.quadrant('chart_q_lca', {
      x: xs, y: ys, labels, mature,
      xLabel: '% LCA Class 1: Δυσαρεστημένοι (αντιπαλότητα)',
      yLabel: '% LCA Class 5: Ένθερμοι (καθαρή ευφορία)',
      xHigh: 'περισσότεροι αντίπαλοι', xLow: 'λιγότεροι αντίπαλοι',
      yHigh: 'περισσότεροι ένθερμοι', yLow: 'λιγότεροι ένθερμοι',
      labels_q: { tl: 'Υγιής συναίνεση', tr: 'Πολωμένη κοινωνία', bl: 'Απάθεια / αποστασιοποίηση', br: 'Σύγκρουση κυρίαρχη' },
    });
  }

  // 4.18 Environmental heatmap (Q3 + Q7 cross-dest)
  if (data.mrb_cross) {
    const q3 = data.mrb_cross.Q3;
    const q7 = data.mrb_cross.Q7;
    const labels = ['Ηχορύπανση','Απορρίμματα','Πίεση οικοσυστημάτων','Ποιότητα υδάτων','Αρχιτεκτ. αλλοίωση','Αύξηση τιμών','STR/Airbnb επίδραση','Στεγαστική κρίση'];
    const dest_pretty = ['Μύκονος','Μύκονος','Μύκονος','Βόλος-Πήλιο','Ναύπλιο'];
    const idx = ['Q7_1','Q7_2','Q7_3','Q7_4','Q7_5','Q3_3','Q3_4','Q3_5'];
    const dest_codes = ['ΚΕΡΚΥΡΑ','ΧΑΝΙΑ','ΜΥΚΟΝΟΣ','ΒΟΛΟΣ_ΠΗΛΙΟ','ΝΑΥΠΛΙΟ'];
    const z = idx.map(it => {
      const block = it.startsWith('Q3') ? q3 : q7;
      const i = block.items.indexOf(it);
      if (i < 0) return dest_codes.map(_ => null);
      return dest_codes.map(d => {
        const j = block.destinations.indexOf(d);
        return j >= 0 ? block.values[i][j] : null;
      });
    });
    C.heatmap('chart_env_heat', {
      rows: labels, cols: dest_pretty, z,
      scale: [
        [0,'#fff8e8'],[0.2,'#fde0a4'],[0.4,'#f9b774'],
        [0.6,'#ed7d56'],[0.8,'#cc4a3c'],[1,'#8b1a1f']
      ],
      cbarTitle: '% συμφωνώ', zmin: 0, zmax: 100,
    });
  }

  // 4.18 Land cover
  if (data.land_cover) {
    C.landCover('chart_landcover', {
      labels: data.land_cover.categories_2022.map(c => c.label),
      values: data.land_cover.categories_2022.map(c => c.km2),
    });
  }

  // 4.19 WEI+
  if (data.water_exploitation) {
    C.wei('chart_wei', data.water_exploitation);
  }

  // ---------- SWOT ----------
  if (data.swot) {
    const grid = document.getElementById('swot_grid');
    const cells = [
      { key: 'S', label: 'Δυνάμεις', items: data.swot.S },
      { key: 'W', label: 'Αδυναμίες', items: data.swot.W },
      { key: 'O', label: 'Ευκαιρίες', items: data.swot.O },
      { key: 'T', label: 'Απειλές', items: data.swot.T },
    ];
    grid.innerHTML = cells.map(c => `
      <div class="swot-cell ${c.key.toLowerCase()}">
        <p class="swot-label">${c.label}</p>
        <ul class="space-y-2 text-sm">
          ${c.items.map(it => `<li><strong class="text-navy-700">${escapeHtml(it.title)}</strong><br><span class="text-ink-500 text-[12px]">${escapeHtml(it.details)}</span></li>`).join('')}
        </ul>
      </div>
    `).join('');
  }

  // ---------- Strategic axes ----------
  if (data.strategic_axes) {
    const grid = document.getElementById('axes_grid');
    grid.innerHTML = data.strategic_axes.map(a => `
      <div class="axis-card">
        <span class="axis-num">0${a.num}</span>
        <h4 class="axis-title">${escapeHtml(a.title)}</h4>
        <p class="text-sm text-ink-700 leading-relaxed">${escapeHtml(a.body.slice(0, 300))}…</p>
      </div>
    `).join('');
  }

  // ---------- 7 Proposals ----------
  if (data.proposals) {
    const list = document.getElementById('proposals_list');
    list.innerHTML = data.proposals.map(p => `
      <details class="border border-[var(--rule)] bg-white">
        <summary class="px-5 py-4 cursor-pointer hover:bg-navy-50 transition-colors">
          <span class="section-marker mr-3">Πρόταση 0${p.num}</span>
          <span class="font-serif text-lg text-navy-700">${escapeHtml(p.title)}</span>
        </summary>
        <div class="px-5 pb-5 pt-2 text-sm text-ink-700 leading-relaxed border-t border-[var(--rule)]">
          ${escapeHtml(p.body)}…
        </div>
      </details>
    `).join('');
  }

  // ---------- Quotes carousel ----------
  if (data.quotes && data.quotes.length) {
    const rail = document.getElementById('quotes_rail');
    rail.innerHTML = data.quotes.map(q => `
      <div class="quote-card">
        <p class="pullquote">${escapeHtml(q.text)}</p>
        <p class="pullquote-attr">${escapeHtml(q.attr)}</p>
      </div>
    `).join('');
  }

  // ---------- MRB raw table ----------
  if (data.mrb_overall) {
    const tbody = document.querySelector('#mrb_table tbody');
    const rows = Object.entries(data.mrb_overall).map(([k, v]) => `
      <tr><td><code class="text-xs">${k}</code></td><td class="num">${v.mean.toFixed(2)}</td><td class="num">${v.pct_agree.toFixed(1)}%</td><td class="num">${v.n_valid}</td></tr>
    `).join('');
    tbody.innerHTML = rows;
  }

  // ---------- Methodological boxes (data annex) ----------
  if (data.methodological_boxes) {
    const cont = document.getElementById('method_boxes');
    cont.innerHTML = data.methodological_boxes.map(b => `
      <div class="method-box">
        <p class="method-box-title">${escapeHtml(b.title)}</p>
        <p class="method-box-content">${escapeHtml(b.body)}</p>
      </div>
    `).join('');
  }

  // ---------- Sources list ----------
  if (data.meta?.sources) {
    const list = document.getElementById('sources_list');
    list.innerHTML = data.meta.sources.map(s => `<li>${escapeHtml(s)}</li>`).join('');
  }


  // ---------- Helpers ----------
  function prettify(code) {
    const map = {
      'ΚΕΡΚΥΡΑ':'Μύκονος','ΧΑΝΙΑ':'Μύκονος','ΜΥΚΟΝΟΣ':'Μύκονος',
      'ΒΟΛΟΣ_ΠΗΛΙΟ':'Βόλος-Πήλιο','ΝΑΥΠΛΙΟ':'Ναύπλιο',
      'ΙΩΑΝΝΙΝΑ':'Ιωάννινα','ΚΑΣΤΟΡΙΑ':'Καστοριά',
      'ΑΛΕΞΑΝΔΡΟΥΠΟΛΗ_ΣΑΜΟΘΡΑΚΗ':'Αλεξ./πολη',
      'ΤΡΟΙΖΗΝΙΑ_ΜΕΘΑΝΑ':'Τροιζηνία','ΝΑΥΠΑΚΤΙΑ':'Ναυπακτία',
    };
    return map[code] || code;
  }
  function isMature(code) {
    return ['ΚΕΡΚΥΡΑ','ΧΑΝΙΑ','ΜΥΚΟΝΟΣ','ΒΟΛΟΣ_ΠΗΛΙΟ','ΝΑΥΠΛΙΟ'].includes(code);
  }
  function escapeHtml(s) {
    if (s == null) return '';
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
  }
})();
