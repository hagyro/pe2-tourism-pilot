"""Συγκέντρωση όλων των δεδομένων Χανίων → assets/data/kerkyra.json

Πηγές που ενοποιούνται:
- ELSTAT STO12: αφίξεις, διανυκτερεύσεις, πληρότητα, ALoS
- ELSTAT SBR01: επιχειρηματικότητα NACE
- ELSTAT SOP03: οικοδομικές άδειες
- BoG: τουριστικά έσοδα NUTS2
- INSETE: regional reports
- Eurostat: lan_lcv (land cover Crete), env_wasmun (waste), sdg_06_60 (WEI+)
- MRB: pivoted parquet (wp_b_overall, wp_z LCA)
- quadrant_metrics.json: 13 metrics × 10 destinations
- Markdown source: text excerpts, qualitative quotes
- OSM: 3.137 POIs ΠΕ Χανίων
"""

from __future__ import annotations
import json
import re
from pathlib import Path

import pandas as pd
import numpy as np

ROOT = Path("/Users/charalamposagiropoulos/Documents/Consulting_Work/White_Bible")
OUT  = ROOT / "working_folder/output/html_companion/assets/data/kerkyra.json"
OUT.parent.mkdir(parents=True, exist_ok=True)


def safe(fn, default=None):
    try:
        return fn()
    except Exception as e:
        print(f"  ! {fn.__name__ if hasattr(fn, '__name__') else 'lambda'}: {e}")
        return default


# ---------------------------------------------------------------------------
# 1. Demand / supply / capacity / occupancy / ALoS
# ---------------------------------------------------------------------------

def load_arrivals():
    df = pd.read_csv(ROOT / "data_v2/analysis/indicators_carrying_capacity.csv", encoding="utf-8-sig")
    chania = df[df["destination_gr"] == "Κέρκυρα"].sort_values("year").reset_index(drop=True)
    dem = pd.read_csv(ROOT / "data_v2/analysis/indicators_demand.csv", encoding="utf-8-sig")
    dem_c = dem[dem["destination_gr"] == "Κέρκυρα"]
    f = dem_c[dem_c["metric"] == "arrivals_foreign"].iloc[0]
    d = dem_c[dem_c["metric"] == "arrivals_domestic"].iloc[0]
    fshare = {
        2015: f["val_2015"] / (f["val_2015"] + d["val_2015"]),
        2019: f["val_2019"] / (f["val_2019"] + d["val_2019"]),
        2024: f["val_2024"] / (f["val_2024"] + d["val_2024"]),
    }
    years = chania["year"].tolist()
    totals = chania["arrivals_total"].tolist()
    fs = np.interp(years, list(fshare.keys()), list(fshare.values()))
    foreign = [round(t * s / 1000) for t, s in zip(totals, fs)]
    domestic = [round(t * (1-s) / 1000) for t, s in zip(totals, fs)]
    return {
        "years": years,
        "total": totals,
        "foreign_thousands": foreign,
        "domestic_thousands": domestic,
        "alos": chania["alos"].tolist(),
        "tfi": chania["tfi_defert"].tolist(),
        "tii": chania["tii"].tolist(),
        "overnights": chania["overnights_total"].tolist(),
    }


def load_recovery():
    dem = pd.read_csv(ROOT / "data_v2/analysis/indicators_demand.csv", encoding="utf-8-sig")
    rec = dem[dem["metric"] == "arrivals_foreign"][["destination_gr", "recovery_ratio_2024_vs_2019"]].dropna()
    return [{"dest": r.destination_gr, "value": float(r.recovery_ratio_2024_vs_2019)} for _, r in rec.iterrows()]


def load_monthly():
    df = pd.read_csv(ROOT / "data_v2/elstat/T13_monthly_nuts2.csv", encoding="utf-8-sig")
    sub = df[(df["nuts_code"] == "EL62") & (df["year"] == 2024) &
             (df["metric"] == "arrivals") & (df["segment"] == "total")].sort_values("month")
    months = ["Ιαν","Φεβ","Μαρ","Απρ","Μαϊ","Ιουν","Ιουλ","Αυγ","Σεπ","Οκτ","Νοε","Δεκ"]
    return {"months": months, "values": [int(v) for v in sub["value"].tolist()]}


def load_seasonality():
    df = pd.read_csv(ROOT / "data_v2/analysis/indicators_seasonality.csv", encoding="utf-8-sig")
    chania = df[df["destination_gr"] == "Κέρκυρα"].sort_values("year")
    return {
        "years": chania["year"].tolist(),
        "gini": chania["gini"].tolist(),
        "hhi":  chania["hhi"].tolist() if "hhi" in chania.columns else [],
    }


def load_capacity():
    df = pd.read_csv(ROOT / "data_v2/analysis/indicators_capacity.csv", encoding="utf-8-sig")
    chania = df[df["destination_gr"] == "Κέρκυρα"].sort_values("year")
    return {
        "years": chania["year"].tolist(),
        "units": chania["units"].tolist(),
        "beds":  chania["beds"].tolist(),
    }


def load_rooms_by_stars():
    df = pd.read_csv(ROOT / "data_v2/elstat_sto12/sto12_t01_capacity.csv", encoding="utf-8-sig")
    sub = df[(df["destination_gr"] == "Κέρκυρα") & (df["year"] == 2024) & (df["star_category"] != "Total")]
    return {
        "labels": [f"{int(c.replace('star',''))}*" if "star" in c else c for c in sub["star_category"].astype(str)],
        "values": [int(v) for v in sub["rooms"].tolist()],
    }


def load_occupancy():
    df = pd.read_csv(ROOT / "data_v2/analysis/indicators_occupancy_monthly.csv", encoding="utf-8-sig")
    sub = df[(df["nuts2"] == "Kriti") & (df["year"] == 2024)].sort_values("month")
    months = ["Ιαν","Φεβ","Μαρ","Απρ","Μαϊ","Ιουν","Ιουλ","Αυγ","Σεπ","Οκτ","Νοε","Δεκ"]
    return {"months": months, "values": [round(v, 1) for v in sub["occupancy_rate"].tolist()]}


def load_str():
    df = pd.read_csv(ROOT / "data_v2/analysis/indicators_str_market.csv", encoding="utf-8-sig")
    chania = df[df["destination_gr"] == "Κέρκυρα"].sort_values("year").reset_index(drop=True)
    return {
        "years": chania["year"].astype(str).tolist(),
        "str_arrival_share":   [round(v*100, 1) for v in chania["str_arrival_share"].tolist()],
        "str_overnight_share": [round(v*100, 1) for v in chania["str_overnight_share"].tolist()],
        "hotel_overnights":    chania["hotel_overnights"].tolist(),
        "str_overnights":      chania["str_overnights"].tolist(),
        "hotel_turnover_meur": [round(v * 85.0 / 1e6, 1) for v in chania["hotel_overnights"].tolist()],
        "str_turnover_meur":   [round(v * 110.0 / 1e6, 1) for v in chania["str_overnights"].tolist()],
    }


def load_pois():
    df = pd.read_csv(ROOT / "data_v2/analysis/indicators_pois.csv", encoding="utf-8-sig")
    return [{"dest": r.destination_gr, "value": int(r.osm_pois)} for _, r in df.iterrows()]


def load_economic():
    df = pd.read_csv(ROOT / "data_v2/analysis/indicators_economic.csv", encoding="utf-8-sig")
    chania = df[df["destination_gr"] == "Κέρκυρα"].sort_values("year")
    return {
        "years": chania["year"].tolist(),
        "gva_gi_meur":    chania["gva_gi_meur"].tolist(),
        "gva_total_meur": chania["gva_total_meur"].tolist(),
        "gi_share":       [round(g/t*100, 1) for g, t in zip(chania["gva_gi_meur"], chania["gva_total_meur"])],
    }


def load_permits():
    years, permits, dwellings = [], [], []
    for y in range(2015, 2026):
        try:
            df = pd.read_excel(ROOT / f"data_v2/elstat_sop03/new_built_{y}.xls", engine="xlrd", header=None)
            row = df[df[0].astype(str).str.contains("ΧΑΝΙΩΝ", na=False)].iloc[0]
            years.append(y); permits.append(int(row[1])); dwellings.append(int(row[2]))
        except Exception as e:
            print(f"  ! permits {y}: {e}")
    return {"years": years, "permits": permits, "dwellings": dwellings}


# ---------------------------------------------------------------------------
# 2. MRB primary research
# ---------------------------------------------------------------------------

def load_mrb_overall():
    """Pivot wp_b_overall για Χανιά: όλες οι Q1-Q12 ερωτήσεις."""
    df = pd.read_parquet(ROOT / "mrb_integration/02_DESCRIPTIVES/wp_b_overall.parquet")
    chania = df[df["destination"] == "ΚΕΡΚΥΡΑ"].copy()
    out = {}
    for _, r in chania.iterrows():
        out[r["item"]] = {
            "mean": round(float(r["mean"]), 2),
            "pct_agree": round(float(r["pct_agree"]), 1),
            "n_valid": int(r["n_valid"]),
        }
    return out


def load_mrb_cross():
    """Cross-destination για heatmaps και quadrants."""
    df = pd.read_parquet(ROOT / "mrb_integration/02_DESCRIPTIVES/wp_b_overall.parquet")
    out = {}
    for q_block, items in [
        ("Q3", [f"Q3_{i}" for i in range(1, 8)]),
        ("Q4", [f"Q4_{i}" for i in range(1, 6)]),
        ("Q5", [f"Q5_{i}" for i in range(1, 11)]),
        ("Q7", [f"Q7_{i}" for i in range(1, 8)]),
    ]:
        sub = df[df["item"].isin(items)]
        pivot = sub.pivot_table(index="item", columns="destination", values="pct_agree")
        pivot = pivot.reindex(items)
        out[q_block] = {
            "items": items,
            "destinations": pivot.columns.tolist(),
            "values": pivot.values.tolist(),
        }
    return out


def load_lca():
    df = pd.read_parquet(ROOT / "mrb_integration/06_LCA/wp_z_class_shares_per_destination.parquet")
    pivot = df.pivot_table(index="destination", columns="assigned_class", values="weighted_pct")
    return {
        "destinations": pivot.index.tolist(),
        "classes": ["Δυσαρεστημένοι (1)", "Επιφυλακτικοί (2)", "Πραγματιστές (3)", "Υποστηρικτές (4)", "Ένθερμοι (5)"],
        "values": [pivot[c].fillna(0).tolist() for c in sorted(pivot.columns)],
    }


def load_quadrants():
    qm = json.loads((ROOT / "working_folder/output/charts_v2/quadrant_metrics.json").read_text(encoding="utf-8"))
    return qm


# ---------------------------------------------------------------------------
# 3. Eurostat environmental
# ---------------------------------------------------------------------------

def load_land_cover():
    df = pd.read_csv(ROOT / "data_v2/eurostat/lan_lcv_ovw_EL43.csv")
    df22 = df[df["time"] == 2022]
    total = df22[df22["landcover"] == "TOTAL"]["value"].iloc[0]
    cats = {"A00":"Τεχνητή γη", "B00":"Καλλιεργήσιμη", "C00":"Δάση",
            "D00":"Θαμνώδης", "E00":"Λιβάδια", "F00":"Γυμνή γη",
            "G00":"Νερό", "H00":"Υγρότοποι"}
    items = []
    for code, label in cats.items():
        v = df22[df22["landcover"] == code]["value"]
        if len(v): items.append({"code": code, "label": label, "km2": float(v.iloc[0]), "pct": round(float(v.iloc[0])/total*100, 2)})
    # Trend artificial land
    art = df[df["landcover"] == "A00"].sort_values("time")
    trend = [{"year": int(r.time), "km2": float(r.value), "pct": round(float(r.value)/total*100, 2)}
             for _, r in art.iterrows()]
    return {"total_km2": float(total), "categories_2022": items, "artificial_trend": trend}


def load_water_exploitation():
    df = pd.read_csv(ROOT / "data_v2/eurostat/water_exploitation_EL.csv")
    sub = df[df["statinfo"] == "AVG_4Y"].sort_values("time")
    return {"years": [int(y) for y in sub["time"].tolist()],
            "values": [float(v) for v in sub["value"].tolist()]}


def load_municipal_waste():
    df = pd.read_csv(ROOT / "data_v2/eurostat/env_wasmun_EL.csv")
    sub = df[(df["wst_oper"] == "GEN") & (df["unit"] == "KG_HAB")].sort_values("time")
    return {"years": [int(y) for y in sub["time"].tolist()],
            "kg_per_capita": [int(v) for v in sub["value"].tolist()]}


# ---------------------------------------------------------------------------
# 4. Qualitative quotes (extracted from markdown)
# ---------------------------------------------------------------------------

def load_quotes():
    md = (ROOT / "working_folder/output/chapters_v2/05_ΚΕΡΚΥΡΑ_v2.md").read_text(encoding="utf-8")
    quotes = []
    # Find blockquote lines (excluding methodological boxes which have ##### prefix)
    for m in re.finditer(r'^>\s+«([^»]+)»', md, flags=re.M):
        text = m.group(1).strip()
        if len(text) > 30 and "#####" not in text:
            quotes.append({"text": text, "attr": "Στέλεχος προορισμού Χανίων"})
    return quotes


# ---------------------------------------------------------------------------
# 5. SWOT (parsed from §4.7.1)
# ---------------------------------------------------------------------------

def load_swot():
    md = (ROOT / "working_folder/output/chapters_v2/05_ΚΕΡΚΥΡΑ_v2.md").read_text(encoding="utf-8")
    sections = {"S": [], "W": [], "O": [], "T": []}
    cur = None
    for line in md.splitlines():
        if "Δυνάμεις (Strengths)" in line: cur = "S"; continue
        elif "Αδυναμίες (Weaknesses)" in line: cur = "W"; continue
        elif "Ευκαιρίες (Opportunities)" in line: cur = "O"; continue
        elif "Απειλές (Threats)" in line: cur = "T"; continue
        elif line.startswith("### ") or line.startswith("## "): cur = None
        if cur and line.startswith("|") and not line.startswith("|---"):
            cells = [c.strip() for c in line.split("|") if c.strip()]
            if len(cells) >= 3 and re.match(r'^[SWOT]\d+', cells[0]):
                sections[cur].append({"id": cells[0], "title": cells[1], "details": cells[2] if len(cells) > 2 else ""})
    return sections


# ---------------------------------------------------------------------------
# 6. Strategic axes & 7 proposals (parsed)
# ---------------------------------------------------------------------------

def load_strategic_axes():
    md = (ROOT / "working_folder/output/chapters_v2/05_ΚΕΡΚΥΡΑ_v2.md").read_text(encoding="utf-8")
    axes = []
    for m in re.finditer(r'^####\s+Άξονας\s+(\d+):\s+(.+?)$\n\n(.+?)(?=\n####|\n###|\Z)', md, flags=re.M | re.S):
        num = int(m.group(1))
        title = m.group(2).strip()
        body = re.sub(r'\n+', ' ', m.group(3).strip())[:1500]
        axes.append({"num": num, "title": title, "body": body})
    return axes


def load_proposals():
    md = (ROOT / "working_folder/output/chapters_v2/05_ΚΕΡΚΥΡΑ_v2.md").read_text(encoding="utf-8")
    props = []
    for m in re.finditer(r'^####\s+Πρόταση\s+(\d+):\s+(.+?)$\n\n(.+?)(?=\n####|\n###|\Z)', md, flags=re.M | re.S):
        num = int(m.group(1))
        title = m.group(2).strip()
        body = re.sub(r'\n+', ' ', m.group(3).strip())[:2500]
        props.append({"num": num, "title": title, "body": body})
    return props


def load_methodological_boxes():
    md = (ROOT / "working_folder/output/chapters_v2/05_ΚΕΡΚΥΡΑ_v2.md").read_text(encoding="utf-8")
    boxes = []
    for m in re.finditer(r'^>\s+#####\s+(.+?)$\n((?:^>\s*.+?\n)+)', md, flags=re.M):
        title = m.group(1).strip()
        body_raw = m.group(2)
        body = re.sub(r'^>\s?', '', body_raw, flags=re.M).strip()
        body = re.sub(r'\n+', ' ', body)
        boxes.append({"title": title, "body": body})
    return boxes


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    print(f"Συλλογή δεδομένων Κέρκυρας → {OUT}")
    bundle = {
        "destination": {
            "code": "ΚΕΡΚΥΡΑ", "display": "Κέρκυρα",
            "nuts3": "EL621", "nuts2": "EL62",
            "region": "Ιόνια Νησιά",
            "subtitle": "Δήμος Κεντρικής Κέρκυρας — Τουριστικό Προφίλ 2030–2035",
            "population_2021": 101600,
            "population_municipality": 67112,
        },
        "kpis": {
            "arrivals_2024": 2674773,
            "tfi_2024": 38.6,
            "tii_2024": 26.3,
            "poi_theta": 0.68,
            "q9_sat_mean": 3.54,
            "alos_2024": 5.36,
            "beds_2024": 50713,
            "str_overnight_share_2024": 16.1,
            "blue_flag_2024": 16,
            "permits_2024": 375,
            "tourism_employment_pct": 61.6,
            "natura_areas_count": 9,
            "gva_gi_share_2023": 54.6,
        },
        "demand":     safe(load_arrivals),
        "recovery":   safe(load_recovery),
        "monthly":    safe(load_monthly),
        "seasonality": safe(load_seasonality),
        "capacity":   safe(load_capacity),
        "rooms_by_stars": safe(load_rooms_by_stars),
        "occupancy":  safe(load_occupancy),
        "str_market": safe(load_str),
        "pois":       safe(load_pois),
        "economic":   safe(load_economic),
        "permits":    safe(load_permits),
        "mrb_overall": safe(load_mrb_overall),
        "mrb_cross":   safe(load_mrb_cross),
        "lca":         safe(load_lca),
        "quadrants":   safe(load_quadrants),
        "land_cover":  safe(load_land_cover),
        "water_exploitation": safe(load_water_exploitation),
        "municipal_waste":    safe(load_municipal_waste),
        "quotes":     safe(load_quotes, []),
        "swot":       safe(load_swot, {"S":[],"W":[],"O":[],"T":[]}),
        "strategic_axes": safe(load_strategic_axes, []),
        "proposals":  safe(load_proposals, []),
        "methodological_boxes": safe(load_methodological_boxes, []),
        "meta": {
            "version": "1.0",
            "generated_at": "2026-05-09",
            "sources": [
                "ΕΛΣΤΑΤ STO12 / SBR01 / SOP03 / Census 2021",
                "Eurostat lan_lcv_ovw / env_wasmun / sdg_06_60 / env_air_gge",
                "Πρωτογενής έρευνα κατοίκων (n=300, σταθμισμένο)",
                "Ποιοτικές συνεντεύξεις στελεχών",
                "OpenStreetMap Overpass POIs",
                "Τράπεζα της Ελλάδος, INSETE",
            ],
        },
    }
    # Clean NaN/Inf → None (JSON-safe). JS JSON.parse fails on NaN.
    def clean(o):
        if isinstance(o, dict): return {k: clean(v) for k, v in o.items()}
        if isinstance(o, list): return [clean(v) for v in o]
        if isinstance(o, float) and (np.isnan(o) or np.isinf(o)): return None
        return o
    bundle = clean(bundle)
    OUT.write_text(json.dumps(bundle, ensure_ascii=False, indent=2, allow_nan=False), encoding="utf-8")
    size_kb = OUT.stat().st_size / 1024
    print(f"  ✓ {OUT.name}  ({size_kb:.1f} KB)")


if __name__ == "__main__":
    main()
