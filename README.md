# HTML Companion · Λευκή Βίβλος Τουριστικού Μετασχηματισμού 2030–2035

Διαδραστική ηλεκτρονική παρουσίαση **ΠΕ2** — συμπληρωματική του παραδοτέου `.docx`.

## Δομή φακέλου

```
html_companion/
├── index.html                  # Landing — 10 destinations grid
├── chania.html                 # Πιλότος Χανίων — 8 ενότητες
├── extract_chania_data.py      # Re-runnable data extraction
├── assets/
│   ├── css/custom.css          # Editorial palette + components
│   ├── js/
│   │   ├── app.js              # Theme, scrollspy, glossary, carousel
│   │   ├── charts.js           # Plotly factory (16 chart types)
│   │   └── chania-render.js    # JSON → DOM
│   ├── data/
│   │   └── chania.json         # 84 KB — όλα τα δεδομένα Χανίων
│   ├── images/                 # (επερχόμενες hero photos)
│   └── icons/                  # SVG inline (Phosphor-inspired)
└── README.md                   # Αυτό το αρχείο
```

## Τοπική προβολή

```bash
cd working_folder/output/html_companion
uv run python -m http.server 8765
# άνοιξε http://localhost:8765 στον browser
```

Όχι build step. Όχι Node. Όχι backend. Ένα plain HTTP server αρκεί.

## Ενημέρωση δεδομένων Χανίων

```bash
uv run python working_folder/output/html_companion/extract_chania_data.py
```

Αυτό ξαναδιαβάζει:
- `chapters_v2/04_ΧΑΝΙΑ_v2.md` (κείμενα, quotes, SWOT, axes, proposals, μεθοδολογικά)
- `data_v2/analysis/*.csv` (όλοι οι ποσοτικοί δείκτες)
- `mrb_integration/02_DESCRIPTIVES/wp_b_overall.parquet` (πρωτογενής έρευνα 64 items)
- `mrb_integration/06_LCA/wp_z_class_shares_per_destination.parquet` (LCA)
- `working_folder/output/charts_v2/quadrant_metrics.json` (10 destinations × 13 metrics)
- `data_v2/eurostat/*.csv` (περιβαλλοντικοί δείκτες)

και αναπαράγει το `assets/data/chania.json`.

## Visual style

| Χρώμα | Hex | Χρήση |
|---|---|---|
| navy-700 | `#1f4e79` | Πρωτεύον (τίτλοι, κύρια στοιχεία) |
| navy-50 | `#eef2f8` | Tint surface (μεθοδολογικά κουτιά) |
| accent-500 | `#e07b00` | Accent (highlights, CTAs) |
| ink-700 | `#2d3441` | Body text |
| ink-500 | `#5b6473` | Δευτερεύον / muted |

Typography:
- **Inter** για UI και body text
- **Fraunces** (serif optical) για display titles και KPI numbers

Κανένα emoji. Όλα τα icons είναι inline SVG (stroke 1.5pt) — δεν φαίνονται ως LLM-generated.

## Ενότητες σελίδας προορισμού (chania.html)

1. **Επισκόπηση** — 12 KPI cards + στρατηγική σύνοψη + Butler/Doxey τοποθέτηση
2. **Ζήτηση & Προσφορά** — 9 διαδραστικά γραφήματα (Σχ. 4.1-4.9)
3. **Τουριστικό προϊόν** — POIs bar + IPA quadrant + Gap Analysis infographic
4. **Οικονομία** — Τζίρος, ΑΠΑ stacked, Quadrant Employment×SAT, οικοδομικές άδειες
5. **Κοινωνία** — TII evolution, 3 strategic quadrants, Doxey heatmap, LCA stacked, **23 ποιοτικά αποσπάσματα carousel**
6. **Περιβάλλον** — Land cover Crete, Greek WEI+, environmental heatmap
7. **Στρατηγική** — SWOT 2×2, 5 άξονες cards, 7 προτάσεις accordion
8. **Δεδομένα** — Πλήρης πίνακας 64 MRB items, 4 μεθοδολογικά κουτιά, πηγές

## Χαρακτηριστικά

- **Dark mode**: Auto από system preference, manual toggle
- **Glossary tooltips**: Hover σε όρους όπως TFI, POI, LCA, Doxey, IRT-GRM δίνει inline ορισμό
- **Animated KPI numbers**: Count-up animation στην εμφάνιση
- **Smooth scrollspy**: Active tab highlighting στο sticky nav
- **Quote carousel**: 23 αυτούσια αποσπάσματα ποιοτικής έρευνας με keyboard nav
- **Print mode**: Καθαρή εκτύπωση χωρίς nav/toggles
- **Responsive**: Mobile / tablet / desktop

## Επόμενα βήματα

Το pattern αυτό αναπαράγεται για τα υπόλοιπα 9 destinations:
1. Νέο `extract_<dest>_data.py` (ίδια λογική, διαφορετικός κωδικός προορισμού)
2. Νέο `<dest>.html` (clone του chania.html, όνομα/data path αλλαγή)
3. `<dest>-render.js` (clone του chania-render.js)

Estimated 4-6 ώρες ανά extra προορισμό.

## Deployment

### GitHub Pages
Push σε branch `gh-pages` του repo `PE2-White-Bible` και ενεργοποίηση Pages από Settings.

### Local share
ZIP ολόκληρο τον φάκελο `html_companion/` και στείλε. Ο παραλήπτης ανοίγει `index.html` σε browser (απαιτείται local server για να φορτώσει το JSON — η οδηγία πάνω).

### Static hosting
Drag-drop σε Netlify, Vercel, ή Cloudflare Pages. Working out of the box.

## Έκδοση

v1.0 · Πιλοτικό τεύχος Χανίων · 2026-05-09
