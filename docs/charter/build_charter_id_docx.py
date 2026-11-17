"""
1:1 Microsoft Word (.docx) generator for the Indonesian 3Dex Project Charter.

Seeds from a fresh Microsoft Word 16.0 (Microsoft 365) COM document to preserve
CompatibilityMode=15 (no Compatibility Mode warning), compiles standalone TikZ
and browser-framed UI graphics from `project_charter_id.tex` at high DPI, builds
all native tables, lists, headings, automatic TOC, headers/footers, and OMML
equations, and validates the compiled document via Word COM PDF export.
"""

from __future__ import annotations

import concurrent.futures
import re
import shutil
import subprocess
import time
from pathlib import Path
from typing import Iterable

import fitz
import win32com.client as win32
from docx import Document
from docx.enum.section import WD_SECTION
from docx.enum.style import WD_STYLE_TYPE
from docx.enum.table import WD_ALIGN_VERTICAL, WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_TAB_ALIGNMENT
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn
from docx.shared import Cm, Pt, RGBColor
from PIL import Image


# ==============================================================================
# GLOBAL PATHS, DIMENSIONS & PALETTE CONSTANTS
# ==============================================================================
CHARTER_DIR = Path(__file__).resolve().parent
DOCS_DIR = CHARTER_DIR.parent
REPO_ROOT = DOCS_DIR.parent
TEX_SOURCE_PATH = CHARTER_DIR / "project_charter_id.tex"
BUILD_DIR = CHARTER_DIR / "build"
ASSET_CACHE_DIR = BUILD_DIR / "docx_assets"
VERIFY_PDF_PATH = BUILD_DIR / "docx_verify_word.pdf"
SEED_DOCX_PATH = BUILD_DIR / "word_native_seed.docx"

OUTPUT_DOCX_PATHS = [
    DOCS_DIR / "output" / "3Dex_Project_Charter_ID.docx",
    CHARTER_DIR / "3Dex_Project_Charter_ID.docx",
]

MEDIA_PATHS = {
    "og_image": REPO_ROOT / "apps" / "frontend" / "public" / "og-image.png",
    "fig_1_pdf": DOCS_DIR / "diagrams" / "exports" / "tex" / "fig_1_four_node_deployment.pdf",
    "cat_models": REPO_ROOT / "apps" / "frontend" / "public" / "category-3d-models.jpg",
    "cat_print": REPO_ROOT / "apps" / "frontend" / "public" / "category-3d-print.jpg",
    "cat_textures": REPO_ROOT / "apps" / "frontend" / "public" / "category-textures.jpg",
    "ui_landing": CHARTER_DIR / "assets" / "ui_landing.png",
    "ui_viewer": CHARTER_DIR / "assets" / "ui_3d_viewer_dexie.png",
    "ui_cart": CHARTER_DIR / "assets" / "ui_cart_midtrans.png",
}

PAGE_WIDTH_CM = 21.0
PAGE_HEIGHT_CM = 29.7
MARGIN_TB_CM = 2.2
MARGIN_LR_CM = 2.3
TEXT_WIDTH_CM = 16.4
TWIPS_PER_CM = 566.929133858

HEX_BLACK = "000000"
HEX_NAVY = "0F172A"
HEX_BLUE = "1640CA"
HEX_MUTED = "555555"
HEX_HEADER_GRAY = "E5E5E5"
HEX_LIGHT_SLATE = "F2F2F2"
HEX_BORDER_GRAY = "CCCCCC"

RGB_BLACK = RGBColor(0x00, 0x00, 0x00)
RGB_NAVY = RGBColor(0x0F, 0x17, 0x2A)
RGB_BLUE = RGBColor(0x16, 0x40, 0xCA)
RGB_MUTED = RGBColor(0x55, 0x55, 0x55)

OMML_EQ_PERT_E = (
    '<m:oMath xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math">'
    "<m:r><m:t>E</m:t></m:r>"
    '<m:r><m:rPr><m:sty m:val="p"/></m:rPr><m:t>=</m:t></m:r>'
    '<m:f><m:fPr><m:type m:val="bar"/></m:fPr>'
    '<m:num><m:r><m:t>O</m:t></m:r><m:r><m:rPr><m:sty m:val="p"/></m:rPr><m:t>+</m:t></m:r>'
    '<m:r><m:t>4</m:t></m:r><m:r><m:t>M</m:t></m:r>'
    '<m:r><m:rPr><m:sty m:val="p"/></m:rPr><m:t>+</m:t></m:r><m:r><m:t>P</m:t></m:r></m:num>'
    "<m:den><m:r><m:t>6</m:t></m:r></m:den></m:f>"
    "</m:oMath>"
)

OMML_EQ_PERT_SIGMA = (
    '<m:oMath xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math">'
    "<m:r><m:t>\u03c3</m:t></m:r>"
    '<m:r><m:rPr><m:sty m:val="p"/></m:rPr><m:t>=</m:t></m:r>'
    '<m:f><m:fPr><m:type m:val="bar"/></m:fPr>'
    '<m:num><m:r><m:t>P</m:t></m:r><m:r><m:rPr><m:sty m:val="p"/></m:rPr><m:t>\u2212</m:t></m:r>'
    "<m:r><m:t>O</m:t></m:r></m:num>"
    "<m:den><m:r><m:t>6</m:t></m:r></m:den></m:f>"
    "</m:oMath>"
)


# ==============================================================================
# STAGE 1: HIGH-DPI VISUAL ASSET COMPILER (XELATEX STANDALONE -> PNG)
# ==============================================================================
class Standalone_Asset_Compiler:
    """Compiles exact TikZ snippets and framed screenshots via XeLaTeX to crisp PNGs."""

    def __init__(self, tex_source: Path, cache_dir: Path) -> None:
        self.tex_mtime = tex_source.stat().st_mtime
        self.tex_text = tex_source.read_text(encoding="utf-8")
        self.cache_dir = cache_dir
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        self.preamble_defs = self._extract_shared_preamble()

    def _extract_shared_preamble(self) -> str:
        colors = "\n".join(re.findall(r"\\definecolor\{[^}]+\}\{HTML\}\{[^}]+\}", self.tex_text))
        logo_match = re.search(
            r"\\newcommand\{\\threedexlogo\}.*?^\}", self.tex_text, re.MULTILINE | re.DOTALL
        )
        badge_match = re.search(
            r"\\newcommand\{\\badge\}.*?^\}", self.tex_text, re.MULTILINE | re.DOTALL
        )
        browser_match = re.search(
            r"\\newcommand\{\\browserframe\}.*?^\}", self.tex_text, re.MULTILINE | re.DOTALL
        )
        macros = "\n".join(
            m.group(0) for m in (logo_match, badge_match, browser_match) if m is not None
        )
        return f"""\\usepackage{{fontspec}}
\\setmainfont{{Times New Roman}}
\\setsansfont{{Arial}}
\\usepackage{{graphicx}}
\\usepackage{{xcolor}}
\\usepackage{{tikz}}
\\usetikzlibrary{{arrows.meta,positioning,shapes.geometric,calc,fit,backgrounds}}
{colors}
{macros}
"""

    def _extract_tikzpicture_before_caption(self, caption_fragment: str) -> str:
        idx = self.tex_text.find(caption_fragment)
        if idx == -1:
            raise RuntimeError(f"Caption fragment not found in TeX source: {caption_fragment}")
        start_idx = self.tex_text.rfind(r"\begin{tikzpicture}", 0, idx)
        end_idx = self.tex_text.rfind(r"\end{tikzpicture}", 0, idx) + len(r"\end{tikzpicture}")
        if start_idx == -1 or end_idx <= start_idx:
            raise RuntimeError(f"TikZ block not found before caption: {caption_fragment}")
        return self.tex_text[start_idx:end_idx]

    def _compile_standalone_png(
        self, name: str, body: str, dpi: int, transparent: bool = False
    ) -> Path:
        out_png = self.cache_dir / f"{name}.png"
        if out_png.exists() and out_png.stat().st_mtime >= self.tex_mtime:
            return out_png
        work_dir = self.cache_dir / f"tmp_{name}"
        work_dir.mkdir(parents=True, exist_ok=True)
        tex_file = work_dir / f"{name}.tex"
        doc_src = (
            "\\documentclass[border=0.5pt]{standalone}\n"
            f"{self.preamble_defs}\n"
            "\\begin{document}\n"
            f"{body}\n"
            "\\end{document}\n"
        )
        tex_file.write_text(doc_src, encoding="utf-8")
        proc = subprocess.run(
            ["xelatex", "-interaction=nonstopmode", f"{name}.tex"],
            cwd=str(work_dir),
            capture_output=True,
            text=True,
            check=False,
        )
        pdf_path = work_dir / f"{name}.pdf"
        if proc.returncode != 0 or not pdf_path.exists():
            raise RuntimeError(
                f"XeLaTeX failed for {name}:\n{proc.stdout[-1200:]}\n{proc.stderr[-600:]}"
            )
        with fitz.open(str(pdf_path)) as doc:
            pix = doc[0].get_pixmap(dpi=dpi, alpha=transparent)
            pix.save(str(out_png))
        shutil.rmtree(work_dir, ignore_errors=True)
        return out_png

    def _rasterize_external_pdf(self, pdf_path: Path, name: str, dpi: int = 400) -> Path:
        out_png = self.cache_dir / f"{name}.png"
        with fitz.open(str(pdf_path)) as doc:
            pix = doc[0].get_pixmap(dpi=dpi, alpha=False)
            pix.save(str(out_png))
        return out_png

    def build_all(self) -> dict[str, Path]:
        """Compile all TikZ and framed image assets in parallel."""
        jobs: list[tuple[str, str, int, bool]] = [
            ("logo_hex", r"\threedexlogo[0.036pt]", 600, True),
            ("badge_tinggi", r"\badge{accentred}{TINGGI}", 600, True),
            ("badge_sedang", r"\badge{accentorange}{SEDANG}", 600, True),
            ("badge_rendah", r"\badge{accentgreen}{RENDAH}", 600, True),
            (
                "fig_3_landing",
                f"\\browserframe[13.4cm]{{https://3dex.studio : Beranda \\& Katalog Unggulan}}{{{MEDIA_PATHS['ui_landing'].as_posix()}}}",
                350,
                False,
            ),
            (
                "fig_4_viewer",
                f"\\browserframe[13.4cm]{{https://3dex.studio/catalog/model : Penampil 3D Interaktif \\& Asisten D\\={{e}}xie}}{{{MEDIA_PATHS['ui_viewer'].as_posix()}}}",
                350,
                False,
            ),
            (
                "fig_5_cart",
                f"\\browserframe[13.4cm]{{https://3dex.studio/cart : Keranjang Belanja \\& Ringkasan Pembayaran Midtrans}}{{{MEDIA_PATHS['ui_cart'].as_posix()}}}",
                350,
                False,
            ),
            (
                "fig_6_wireframe",
                self._extract_tikzpicture_before_caption("Sketsa Rancangan Antarmuka Pemesanan Cetak 3D"),
                400,
                False,
            ),
            (
                "fig_7_power_grid",
                self._extract_tikzpicture_before_caption("Pemetaan Stakeholder pada Power / Interest Grid"),
                400,
                False,
            ),
            (
                "fig_8_gantt",
                self._extract_tikzpicture_before_caption("Bagan Gantt Jadwal Milestone 15 Minggu"),
                400,
                False,
            ),
            (
                "fig_9_budget_bar",
                self._extract_tikzpicture_before_caption("Komposisi Anggaran Proyek Komersial"),
                400,
                False,
            ),
        ]

        results: dict[str, Path] = {}
        with concurrent.futures.ThreadPoolExecutor(max_workers=6) as executor:
            future_map = {
                executor.submit(self._compile_standalone_png, name, body, dpi, transp): name
                for name, body, dpi, transp in jobs
            }
            for future in concurrent.futures.as_completed(future_map):
                name = future_map[future]
                results[name] = future.result()

        results["fig_1_arch"] = self._rasterize_external_pdf(
            MEDIA_PATHS["fig_1_pdf"], "fig_1_arch", dpi=400
        )
        return results


# ==============================================================================
# STAGE 2: OOXML & PYTHON-DOCX FORMATTING PRIMITIVES
# ==============================================================================
class Ooxml_Helper:
    """Low-level OOXML manipulation helpers keeping Word compatibility clean."""

    TOKEN_RE = re.compile(
        r"(<b>|</b>|<i>|</i>|<u>|</u>|<sup>|</sup>|<link\s+url=\"[^\"]+\">|</link>|<omath>.*?</omath>)",
        re.DOTALL,
    )

    @staticmethod
    def cm_to_twips(cm_val: float) -> int:
        return int(round(cm_val * TWIPS_PER_CM))

    @staticmethod
    def strip_theme_fonts(rfonts_el: OxmlElement) -> None:
        for attr in ("w:asciiTheme", "w:hAnsiTheme", "w:eastAsiaTheme", "w:cstheme"):
            key = qn(attr)
            if key in rfonts_el.attrib:
                del rfonts_el.attrib[key]

    @staticmethod
    def set_style_font(style, font_name: str, size_pt: float, color_hex: str = HEX_BLACK, bold: bool = False) -> None:
        style.font.name = font_name
        style.font.size = Pt(size_pt)
        style.font.bold = bold
        style.font.color.rgb = RGBColor.from_string(color_hex)
        rpr = style.element.get_or_add_rPr()
        rfonts = rpr.find(qn("w:rFonts"))
        if rfonts is None:
            rfonts = OxmlElement("w:rFonts")
            rpr.insert(0, rfonts)
        Ooxml_Helper.strip_theme_fonts(rfonts)
        for attr in ("w:ascii", "w:hAnsi", "w:cs", "w:eastAsia"):
            rfonts.set(qn(attr), font_name)

    @staticmethod
    def apply_run_font(run, font_name: str, size_pt: float, color_hex: str = HEX_BLACK) -> None:
        run.font.name = font_name
        run.font.size = Pt(size_pt)
        run.font.color.rgb = RGBColor.from_string(color_hex)
        rpr = run._r.get_or_add_rPr()
        rfonts = rpr.find(qn("w:rFonts"))
        if rfonts is None:
            rfonts = OxmlElement("w:rFonts")
            rpr.insert(0, rfonts)
        Ooxml_Helper.strip_theme_fonts(rfonts)
        for attr in ("w:ascii", "w:hAnsi", "w:cs", "w:eastAsia"):
            rfonts.set(qn(attr), font_name)

    @staticmethod
    def set_paragraph_border(
        paragraph, edge: str, color_hex: str = HEX_BLACK, sz_eighths: int = 4, space_pt: int = 3
    ) -> None:
        ppr = paragraph._p.get_or_add_pPr()
        pbdr = ppr.find(qn("w:pBdr"))
        if pbdr is None:
            pbdr = OxmlElement("w:pBdr")
            ppr.append(pbdr)
        el = pbdr.find(qn(f"w:{edge}"))
        if el is None:
            el = OxmlElement(f"w:{edge}")
            pbdr.append(el)
        el.set(qn("w:val"), "single")
        el.set(qn("w:sz"), str(sz_eighths))
        el.set(qn("w:space"), str(space_pt))
        el.set(qn("w:color"), color_hex)

    @staticmethod
    def append_hyperlink(
        paragraph,
        url: str,
        display_text: str,
        font_name: str,
        size_pt: float,
        color_hex: str,
        underline: bool = True,
    ) -> None:
        part = paragraph.part
        r_id = part.relate_to(
            url,
            "http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink",
            is_external=True,
        )
        hyperlink = OxmlElement("w:hyperlink")
        hyperlink.set(qn("r:id"), r_id)
        run_el = OxmlElement("w:r")
        rpr = OxmlElement("w:rPr")
        rfonts = OxmlElement("w:rFonts")
        for attr in ("w:ascii", "w:hAnsi", "w:cs", "w:eastAsia"):
            rfonts.set(qn(attr), font_name)
        rpr.append(rfonts)
        color_el = OxmlElement("w:color")
        color_el.set(qn("w:val"), color_hex)
        rpr.append(color_el)
        sz_val = str(int(round(size_pt * 2)))
        sz_el = OxmlElement("w:sz")
        sz_el.set(qn("w:val"), sz_val)
        sz_cs = OxmlElement("w:szCs")
        sz_cs.set(qn("w:val"), sz_val)
        rpr.extend([sz_el, sz_cs])
        if underline:
            u_el = OxmlElement("w:u")
            u_el.set(qn("w:val"), "single")
            rpr.append(u_el)
        run_el.append(rpr)
        t_el = OxmlElement("w:t")
        t_el.set(qn("xml:space"), "preserve")
        t_el.text = display_text
        run_el.append(t_el)
        hyperlink.append(run_el)
        paragraph._p.append(hyperlink)

    @classmethod
    def append_rich_text(
        cls,
        paragraph,
        text: str,
        font_name: str = "Times New Roman",
        size_pt: float = 11.0,
        color_hex: str = HEX_BLACK,
        base_bold: bool = False,
        base_italic: bool = False,
        link_color_hex: str = HEX_BLACK,
    ) -> None:
        bold = base_bold
        italic = base_italic
        underline = False
        superscript = False
        active_url: str | None = None

        for part in cls.TOKEN_RE.split(text):
            if not part:
                continue
            if part == "<b>":
                bold = True
                continue
            if part == "</b>":
                bold = base_bold
                continue
            if part == "<i>":
                italic = True
                continue
            if part == "</i>":
                italic = base_italic
                continue
            if part == "<u>":
                underline = True
                continue
            if part == "</u>":
                underline = False
                continue
            if part == "<sup>":
                superscript = True
                continue
            if part == "</sup>":
                superscript = False
                continue
            if part.startswith("<link "):
                match = re.search(r'url="([^"]+)"', part)
                active_url = match.group(1) if match else ""
                continue
            if part == "</link>":
                active_url = None
                continue
            if part.startswith("<omath>") and part.endswith("</omath>"):
                eq_key = part[7:-8].strip()
                omml_str = OMML_EQ_PERT_E if eq_key == "PERT_E" else OMML_EQ_PERT_SIGMA
                paragraph._p.append(parse_xml(omml_str))
                continue
            if active_url is not None:
                cls.append_hyperlink(
                    paragraph,
                    active_url,
                    part,
                    font_name,
                    size_pt,
                    link_color_hex,
                    underline=True,
                )
                continue

            run = paragraph.add_run(part)
            cls.apply_run_font(run, font_name, size_pt, color_hex)
            run.bold = bold
            run.italic = italic
            run.underline = underline
            if superscript:
                run.font.superscript = True

    @staticmethod
    def add_field_runs(paragraph, field_instr: str, font_name: str, size_pt: float, color_hex: str) -> None:
        def _new_run_with_rpr() -> OxmlElement:
            r = OxmlElement("w:r")
            rpr = OxmlElement("w:rPr")
            rf = OxmlElement("w:rFonts")
            for a in ("w:ascii", "w:hAnsi", "w:cs", "w:eastAsia"):
                rf.set(qn(a), font_name)
            rpr.append(rf)
            col = OxmlElement("w:color")
            col.set(qn("w:val"), color_hex)
            rpr.append(col)
            sz_val = str(int(round(size_pt * 2)))
            sz = OxmlElement("w:sz")
            sz.set(qn("w:val"), sz_val)
            sz_cs = OxmlElement("w:szCs")
            sz_cs.set(qn("w:val"), sz_val)
            rpr.extend([sz, sz_cs])
            r.append(rpr)
            return r

        r_begin = _new_run_with_rpr()
        fld_begin = OxmlElement("w:fldChar")
        fld_begin.set(qn("w:fldCharType"), "begin")
        r_begin.append(fld_begin)

        r_instr = _new_run_with_rpr()
        instr = OxmlElement("w:instrText")
        instr.set(qn("xml:space"), "preserve")
        instr.text = f" {field_instr} "
        r_instr.append(instr)

        r_sep = _new_run_with_rpr()
        fld_sep = OxmlElement("w:fldChar")
        fld_sep.set(qn("w:fldCharType"), "separate")
        r_sep.append(fld_sep)

        r_val = _new_run_with_rpr()
        t_el = OxmlElement("w:t")
        t_el.text = "1"
        r_val.append(t_el)

        r_end = _new_run_with_rpr()
        fld_end = OxmlElement("w:fldChar")
        fld_end.set(qn("w:fldCharType"), "end")
        r_end.append(fld_end)

        paragraph._p.extend([r_begin, r_instr, r_sep, r_val, r_end])

    @staticmethod
    def configure_table_borders(table, bordered: bool = True, border_color: str = "444444") -> None:
        tbl_pr = table._tbl.tblPr
        borders = tbl_pr.find(qn("w:tblBorders"))
        if borders is not None:
            tbl_pr.remove(borders)
        val = "single" if bordered else "none"
        sz = "4" if bordered else "0"
        col = border_color if bordered else "auto"
        xml_str = (
            f"<w:tblBorders {nsdecls('w')}>"
            f'<w:top w:val="{val}" w:sz="{sz}" w:space="0" w:color="{col}"/>'
            f'<w:left w:val="{val}" w:sz="{sz}" w:space="0" w:color="{col}"/>'
            f'<w:bottom w:val="{val}" w:sz="{sz}" w:space="0" w:color="{col}"/>'
            f'<w:right w:val="{val}" w:sz="{sz}" w:space="0" w:color="{col}"/>'
            f'<w:insideH w:val="{val}" w:sz="{sz}" w:space="0" w:color="{col}"/>'
            f'<w:insideV w:val="{val}" w:sz="{sz}" w:space="0" w:color="{col}"/>'
            "</w:tblBorders>"
        )
        tbl_pr.append(parse_xml(xml_str))

    @staticmethod
    def set_table_fixed_widths(
        table,
        col_widths_cm: list[float],
        cell_pad_tb_twips: int = 58,
        cell_pad_lr_twips: int = 90,
    ) -> None:
        tbl_pr = table._tbl.tblPr
        for tag in ("w:tblW", "w:tblLayout", "w:tblCellMar"):
            old = tbl_pr.find(qn(tag))
            if old is not None:
                tbl_pr.remove(old)

        total_twips = sum(Ooxml_Helper.cm_to_twips(w) for w in col_widths_cm)
        tbl_w = OxmlElement("w:tblW")
        tbl_w.set(qn("w:w"), str(total_twips))
        tbl_w.set(qn("w:type"), "dxa")
        tbl_pr.append(tbl_w)

        tbl_layout = OxmlElement("w:tblLayout")
        tbl_layout.set(qn("w:type"), "fixed")
        tbl_pr.append(tbl_layout)

        tbl_mar = parse_xml(
            f"<w:tblCellMar {nsdecls('w')}>"
            f'<w:top w:w="{cell_pad_tb_twips}" w:type="dxa"/>'
            f'<w:left w:w="{cell_pad_lr_twips}" w:type="dxa"/>'
            f'<w:bottom w:w="{cell_pad_tb_twips}" w:type="dxa"/>'
            f'<w:right w:w="{cell_pad_lr_twips}" w:type="dxa"/>'
            "</w:tblCellMar>"
        )
        tbl_pr.append(tbl_mar)

        tbl_grid = table._tbl.tblGrid
        for gc in list(tbl_grid):
            tbl_grid.remove(gc)
        col_twips = [Ooxml_Helper.cm_to_twips(w) for w in col_widths_cm]
        for tw in col_twips:
            gc = OxmlElement("w:gridCol")
            gc.set(qn("w:w"), str(tw))
            tbl_grid.append(gc)

        for row in table.rows:
            for idx, cell in enumerate(row.cells):
                tc_pr = cell._tc.get_or_add_tcPr()
                old_w = tc_pr.find(qn("w:tcW"))
                if old_w is not None:
                    tc_pr.remove(old_w)
                tc_w = OxmlElement("w:tcW")
                tc_w.set(qn("w:w"), str(col_twips[idx]))
                tc_w.set(qn("w:type"), "dxa")
                tc_pr.append(tc_w)

    @staticmethod
    def set_cell_shading(cell, fill_hex: str) -> None:
        tc_pr = cell._tc.get_or_add_tcPr()
        old = tc_pr.find(qn("w:shd"))
        if old is not None:
            tc_pr.remove(old)
        shd = parse_xml(f'<w:shd {nsdecls("w")} w:val="clear" w:color="auto" w:fill="{fill_hex}"/>')
        tc_pr.append(shd)

    @staticmethod
    def set_row_flags(row, is_header: bool = False, min_height_cm: float | None = None) -> None:
        tr_pr = row._tr.get_or_add_trPr()
        if tr_pr.find(qn("w:cantSplit")) is None:
            tr_pr.append(OxmlElement("w:cantSplit"))
        if is_header and tr_pr.find(qn("w:tblHeader")) is None:
            tr_pr.append(OxmlElement("w:tblHeader"))
        if min_height_cm is not None:
            old_h = tr_pr.find(qn("w:trHeight"))
            if old_h is not None:
                tr_pr.remove(old_h)
            tr_h = OxmlElement("w:trHeight")
            tr_h.set(qn("w:val"), str(Ooxml_Helper.cm_to_twips(min_height_cm)))
            tr_h.set(qn("w:hRule"), "atLeast")
            tr_pr.append(tr_h)

    @staticmethod
    def apply_paragraph_numbering(paragraph, num_id: int, ilvl: int = 0) -> None:
        ppr = paragraph._p.get_or_add_pPr()
        old = ppr.find(qn("w:numPr"))
        if old is not None:
            ppr.remove(old)
        num_pr = OxmlElement("w:numPr")
        ilvl_el = OxmlElement("w:ilvl")
        ilvl_el.set(qn("w:val"), str(ilvl))
        num_id_el = OxmlElement("w:numId")
        num_id_el.set(qn("w:val"), str(num_id))
        num_pr.extend([ilvl_el, num_id_el])
        ppr.append(num_pr)


# ==============================================================================
# STAGE 3: NUMBERING MANAGER & DOCUMENT BUILDER
# ==============================================================================
class Charter_Docx_Builder:
    """Builds the complete 1:1 Indonesian Project Charter DOCX."""

    def __init__(self, seed_path: Path, assets: dict[str, Path]) -> None:
        self.doc = Document(str(seed_path))
        self.assets = assets
        self.next_num_id = 10
        self.abstract_bullet_id = 101
        self.abstract_decimal_id = 102
        self.bullet_main_num_id = 10
        self.bullet_table_num_id = 11
        self.decimal_sub_num_id = 12
        self._init_styles_and_settings()
        self._init_numbering_definitions()

    def _clear_seed_body(self) -> None:
        body = self.doc._body._body
        for child in list(body):
            if child.tag != qn("w:sectPr"):
                body.remove(child)

    def _init_styles_and_settings(self) -> None:
        self._clear_seed_body()

        # Configure Section 1 (Cover Letter, Pages 1-2, empty header/footer)
        sec1 = self.doc.sections[0]
        sec1.page_width = Cm(PAGE_WIDTH_CM)
        sec1.page_height = Cm(PAGE_HEIGHT_CM)
        sec1.top_margin = Cm(MARGIN_TB_CM)
        sec1.bottom_margin = Cm(MARGIN_TB_CM)
        sec1.left_margin = Cm(MARGIN_LR_CM)
        sec1.right_margin = Cm(MARGIN_LR_CM)
        sec1.header_distance = Cm(1.05)
        sec1.footer_distance = Cm(1.10)
        sec1.header.is_linked_to_previous = False
        sec1.footer.is_linked_to_previous = False
        for hf in (sec1.header, sec1.footer):
            p = hf.paragraphs[0]
            p.text = ""
            p.paragraph_format.space_before = Pt(0)
            p.paragraph_format.space_after = Pt(0)

        # Ensure modern settings + field update on open + CompatibilityMode 15
        settings = self.doc.settings.element
        if settings.find(qn("w:updateFields")) is None:
            uf = OxmlElement("w:updateFields")
            uf.set(qn("w:val"), "true")
            settings.append(uf)
        compat = settings.find(qn("w:compat"))
        if compat is not None:
            for cs in compat.findall(qn("w:compatSetting")):
                if cs.get(qn("w:name")) == "compatibilityMode":
                    cs.set(qn("w:val"), "15")

        # Configure core built-in styles and remove any local Normal.dotm first-line indent
        normal = self.doc.styles["Normal"]
        Ooxml_Helper.set_style_font(normal, "Times New Roman", 11.0, HEX_BLACK, bold=False)
        normal_ppr = normal.element.get_or_add_pPr()
        old_ind = normal_ppr.find(qn("w:ind"))
        if old_ind is not None:
            normal_ppr.remove(old_ind)
        normal.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.LEFT
        normal.paragraph_format.first_line_indent = Pt(0)
        normal.paragraph_format.left_indent = Pt(0)
        normal.paragraph_format.right_indent = Pt(0)
        normal.paragraph_format.space_before = Pt(0)
        normal.paragraph_format.space_after = Pt(4.5)
        normal.paragraph_format.line_spacing = 1.13

        h1 = self.doc.styles["Heading 1"]
        Ooxml_Helper.set_style_font(h1, "Arial", 13.0, HEX_BLACK, bold=True)
        h1_ppr = h1.element.get_or_add_pPr()
        for tag in ("w:ind", "w:jc"):
            old_el = h1_ppr.find(qn(tag))
            if old_el is not None:
                h1_ppr.remove(old_el)
        h1.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.LEFT
        h1.paragraph_format.first_line_indent = Pt(0)
        h1.paragraph_format.left_indent = Pt(0)
        h1.paragraph_format.space_before = Pt(11)
        h1.paragraph_format.space_after = Pt(4)
        h1.paragraph_format.line_spacing = 1.12
        h1.paragraph_format.keep_with_next = True
        if "Heading 1 Char" in self.doc.styles:
            Ooxml_Helper.set_style_font(self.doc.styles["Heading 1 Char"], "Arial", 13.0, HEX_BLACK, bold=True)

        h2 = self.doc.styles["Heading 2"]
        Ooxml_Helper.set_style_font(h2, "Arial", 11.0, HEX_BLACK, bold=True)
        h2_ppr = h2.element.get_or_add_pPr()
        for tag in ("w:ind", "w:jc"):
            old_el = h2_ppr.find(qn(tag))
            if old_el is not None:
                h2_ppr.remove(old_el)
        h2.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.LEFT
        h2.paragraph_format.first_line_indent = Pt(0)
        h2.paragraph_format.left_indent = Pt(0)
        h2.paragraph_format.space_before = Pt(8)
        h2.paragraph_format.space_after = Pt(3)
        h2.paragraph_format.line_spacing = 1.12
        h2.paragraph_format.keep_with_next = True
        if "Heading 2 Char" in self.doc.styles:
            Ooxml_Helper.set_style_font(self.doc.styles["Heading 2 Char"], "Arial", 11.0, HEX_BLACK, bold=True)

        for style_name, font_name, sz, bold, italic, sb, sa, align in [
            ("SubheadingUnlisted", "Arial", 11.0, True, False, 9.0, 3.0, WD_ALIGN_PARAGRAPH.LEFT),
            ("CaptionLabel", "Times New Roman", 10.5, False, False, 3.0, 3.0, WD_ALIGN_PARAGRAPH.CENTER),
        ]:
            if style_name in self.doc.styles:
                st = self.doc.styles[style_name]
            else:
                st = self.doc.styles.add_style(style_name, WD_STYLE_TYPE.PARAGRAPH)
                st.base_style = normal
            Ooxml_Helper.set_style_font(st, font_name, sz, HEX_BLACK, bold=bold)
            st.font.italic = italic
            st.paragraph_format.first_line_indent = Pt(0)
            st.paragraph_format.left_indent = Pt(0)
            st.paragraph_format.space_before = Pt(sb)
            st.paragraph_format.space_after = Pt(sa)
            st.paragraph_format.line_spacing = 1.10
            st.paragraph_format.alignment = align
            if style_name == "SubheadingUnlisted":
                st.paragraph_format.keep_with_next = True

    def _init_numbering_definitions(self) -> None:
        numbering_part = self.doc.part.numbering_part
        root = numbering_part.numbering_definitions._numbering

        # Clear any leftover definitions carefully, or append clean custom IDs >= 100
        bullet_abstract = parse_xml(
            f'<w:abstractNum {nsdecls("w")} w:abstractNumId="{self.abstract_bullet_id}">'
            '<w:multiLevelType w:val="hybridMultilevel"/>'
            '<w:lvl w:ilvl="0">'
            '<w:start w:val="1"/><w:numFmt w:val="bullet"/><w:lvlText w:val="\u2022"/>'
            '<w:lvlJc w:val="left"/>'
            '<w:pPr><w:ind w:left="312" w:hanging="198"/></w:pPr>'
            '<w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:hint="default"/></w:rPr>'
            "</w:lvl>"
            "</w:abstractNum>"
        )
        table_bullet_abstract = parse_xml(
            f'<w:abstractNum {nsdecls("w")} w:abstractNumId="103">'
            '<w:multiLevelType w:val="singleLevel"/>'
            '<w:lvl w:ilvl="0">'
            '<w:start w:val="1"/><w:numFmt w:val="bullet"/><w:lvlText w:val="\u2022"/>'
            '<w:lvlJc w:val="left"/>'
            '<w:pPr><w:ind w:left="215" w:hanging="145"/></w:pPr>'
            '<w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:hint="default"/></w:rPr>'
            "</w:lvl>"
            "</w:abstractNum>"
        )
        decimal_abstract = parse_xml(
            f'<w:abstractNum {nsdecls("w")} w:abstractNumId="{self.abstract_decimal_id}">'
            '<w:multiLevelType w:val="hybridMultilevel"/>'
            '<w:lvl w:ilvl="0">'
            '<w:start w:val="1"/><w:numFmt w:val="decimal"/><w:lvlText w:val="%1."/>'
            '<w:lvlJc w:val="left"/>'
            '<w:pPr><w:ind w:left="312" w:hanging="198"/></w:pPr>'
            "</w:lvl>"
            '<w:lvl w:ilvl="1">'
            '<w:start w:val="1"/><w:numFmt w:val="decimal"/><w:lvlText w:val="%2."/>'
            '<w:lvlJc w:val="left"/>'
            '<w:pPr><w:ind w:left="624" w:hanging="215"/></w:pPr>'
            "</w:lvl>"
            "</w:abstractNum>"
        )
        # Insert abstractNum elements before w:num elements (OOXML schema order constraint!)
        first_num = root.find(qn("w:num"))
        for el in (bullet_abstract, table_bullet_abstract, decimal_abstract):
            if first_num is not None:
                root.insert(root.index(first_num), el)
            else:
                root.append(el)

        # Register bullet numIds + nested decimal numId
        root.append(
            parse_xml(
                f'<w:num {nsdecls("w")} w:numId="{self.bullet_main_num_id}">'
                f'<w:abstractNumId w:val="{self.abstract_bullet_id}"/></w:num>'
            )
        )
        root.append(
            parse_xml(
                f'<w:num {nsdecls("w")} w:numId="{self.bullet_table_num_id}">'
                '<w:abstractNumId w:val="103"/></w:num>'
            )
        )
        self.next_num_id = 20

    def new_restarted_decimal_num_id(self, ilvl: int = 0) -> int:
        """Allocate a fresh Word w:num that restarts numbering at 1."""
        num_id = self.next_num_id
        self.next_num_id += 1
        root = self.doc.part.numbering_part.numbering_definitions._numbering
        root.append(
            parse_xml(
                f'<w:num {nsdecls("w")} w:numId="{num_id}">'
                f'<w:abstractNumId w:val="{self.abstract_decimal_id}"/>'
                f'<w:lvlOverride w:ilvl="{ilvl}"><w:startOverride w:val="1"/></w:lvlOverride>'
                "</w:num>"
            )
        )
        return num_id

    def add_p(
        self,
        text: str = "",
        align: WD_ALIGN_PARAGRAPH = WD_ALIGN_PARAGRAPH.JUSTIFY,
        font_name: str = "Times New Roman",
        size_pt: float = 11.0,
        color_hex: str = HEX_BLACK,
        space_before: float = 0.0,
        space_after: float = 4.5,
        line_spacing: float = 1.13,
        bold: bool = False,
        italic: bool = False,
        keep_with_next: bool = False,
        page_break_before: bool = False,
        link_color_hex: str = HEX_BLACK,
    ):
        p = self.doc.add_paragraph()
        p.alignment = align
        pf = p.paragraph_format
        pf.space_before = Pt(space_before)
        pf.space_after = Pt(space_after)
        pf.line_spacing = line_spacing
        pf.keep_with_next = keep_with_next
        pf.page_break_before = page_break_before
        if text:
            Ooxml_Helper.append_rich_text(
                p,
                text,
                font_name=font_name,
                size_pt=size_pt,
                color_hex=color_hex,
                base_bold=bold,
                base_italic=italic,
                link_color_hex=link_color_hex,
            )
        return p

    def add_h1(self, text: str, page_break_before: bool = False, space_before: float = 11.0):
        p = self.doc.add_paragraph(style="Heading 1")
        p.paragraph_format.page_break_before = page_break_before
        p.paragraph_format.space_before = Pt(space_before)
        p.paragraph_format.space_after = Pt(4.0)
        p.paragraph_format.keep_with_next = True
        Ooxml_Helper.append_rich_text(
            p, text, font_name="Arial", size_pt=13.0, color_hex=HEX_BLACK, base_bold=True
        )
        return p

    def add_h2(self, text: str, space_before: float = 8.0, page_break_before: bool = False):
        p = self.doc.add_paragraph(style="Heading 2")
        p.paragraph_format.space_before = Pt(space_before)
        p.paragraph_format.space_after = Pt(3.0)
        p.paragraph_format.keep_with_next = True
        p.paragraph_format.page_break_before = page_break_before
        Ooxml_Helper.append_rich_text(
            p, text, font_name="Arial", size_pt=11.0, color_hex=HEX_BLACK, base_bold=True
        )
        return p

    def add_unlisted_sub(self, text: str, space_before: float = 8.0):
        p = self.doc.add_paragraph(style="SubheadingUnlisted")
        p.paragraph_format.space_before = Pt(space_before)
        p.paragraph_format.space_after = Pt(3.0)
        Ooxml_Helper.append_rich_text(
            p, text, font_name="Arial", size_pt=11.0, color_hex=HEX_BLACK, base_bold=True
        )
        return p

    def add_bullets(
        self,
        items: Iterable[str],
        size_pt: float = 11.0,
        space_after: float = 2.0,
        container=None,
        num_id: int | None = None,
        keep_with_next: bool = False,
    ) -> None:
        target_num = num_id if num_id is not None else self.bullet_main_num_id
        for idx_item, item in enumerate(items):
            p = container.add_paragraph() if container is not None else self.doc.add_paragraph()
            p.alignment = WD_ALIGN_PARAGRAPH.LEFT if container is not None else WD_ALIGN_PARAGRAPH.JUSTIFY
            pf = p.paragraph_format
            pf.space_before = Pt(0.5)
            pf.space_after = Pt(space_after)
            pf.line_spacing = 1.12
            pf.keep_with_next = keep_with_next
            Ooxml_Helper.apply_paragraph_numbering(p, target_num, ilvl=0)
            Ooxml_Helper.append_rich_text(p, item, font_name="Times New Roman", size_pt=size_pt)

    def add_numbered_list(
        self,
        items: Iterable[str],
        size_pt: float = 11.0,
        space_after: float = 2.0,
        ilvl: int = 0,
        keep_block_together: bool = False,
    ) -> None:
        items_list = list(items)
        num_id = self.new_restarted_decimal_num_id(ilvl=ilvl)
        for idx_i, item in enumerate(items_list):
            p = self.doc.add_paragraph()
            p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
            pf = p.paragraph_format
            pf.space_before = Pt(0.5)
            pf.space_after = Pt(space_after)
            pf.line_spacing = 1.12
            if keep_block_together and idx_i < len(items_list) - 1:
                pf.keep_with_next = True
            Ooxml_Helper.apply_paragraph_numbering(p, num_id, ilvl=ilvl)
            Ooxml_Helper.append_rich_text(p, item, font_name="Times New Roman", size_pt=size_pt)

    def add_caption(
        self,
        label: str,
        keep_with_next: bool = False,
        space_before: float = 3.0,
        space_after: float = 4.0,
        page_break_before: bool = False,
    ):
        p = self.doc.add_paragraph(style="CaptionLabel")
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_before = Pt(space_before)
        p.paragraph_format.space_after = Pt(space_after)
        p.paragraph_format.keep_with_next = keep_with_next
        p.paragraph_format.page_break_before = page_break_before
        Ooxml_Helper.append_rich_text(p, label, font_name="Times New Roman", size_pt=10.5)
        return p

    def add_centered_image(
        self,
        img_path: Path,
        width_cm: float,
        space_before: float = 4.0,
        space_after: float = 2.0,
        keep_with_next: bool = True,
        page_break_before: bool = False,
    ):
        p = self.doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_before = Pt(space_before)
        p.paragraph_format.space_after = Pt(space_after)
        p.paragraph_format.keep_with_next = keep_with_next
        p.paragraph_format.page_break_before = page_break_before
        p.add_run().add_picture(str(img_path), width=Cm(width_cm))
        return p

    def add_styled_table(
        self,
        headers: list[str] | None,
        rows: list[list[dict]],
        col_widths_cm: list[float],
        font_size_pt: float = 10.5,
        pad_tb_twips: int = 55,
        pad_lr_twips: int = 85,
        min_row_height_cm: float | None = None,
        page_break_before: bool = False,
        space_after_pt: float = 6.0,
    ):
        num_rows = len(rows) + (1 if headers is not None else 0)
        num_cols = len(col_widths_cm)
        table = self.doc.add_table(rows=num_rows, cols=num_cols)
        table.alignment = WD_TABLE_ALIGNMENT.CENTER
        table.autofit = False
        Ooxml_Helper.configure_table_borders(table, bordered=True, border_color="333333")
        Ooxml_Helper.set_table_fixed_widths(table, col_widths_cm, pad_tb_twips, pad_lr_twips)

        row_cursor = 0
        if headers is not None:
            hdr_row = table.rows[0]
            Ooxml_Helper.set_row_flags(hdr_row, is_header=True)
            for c_idx, h_text in enumerate(headers):
                cell = hdr_row.cells[c_idx]
                cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
                Ooxml_Helper.set_cell_shading(cell, HEX_HEADER_GRAY)
                p = cell.paragraphs[0]
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
                p.paragraph_format.space_before = Pt(0)
                p.paragraph_format.space_after = Pt(0)
                p.paragraph_format.line_spacing = 1.08
                if page_break_before and c_idx == 0:
                    p.paragraph_format.page_break_before = True
                Ooxml_Helper.append_rich_text(
                    p, h_text, font_name="Times New Roman", size_pt=font_size_pt, base_bold=True
                )
            row_cursor = 1

        for r_idx, row_spec in enumerate(rows):
            row = table.rows[row_cursor]
            row_cursor += 1
            row_bg = row_spec[0].get("row_bg") if row_spec else None
            Ooxml_Helper.set_row_flags(row, is_header=False, min_height_cm=min_row_height_cm)

            c_idx = 0
            for spec in row_spec:
                colspan = spec.get("colspan", 1)
                cell = row.cells[c_idx]
                if colspan > 1:
                    end_cell = row.cells[c_idx + colspan - 1]
                    cell.merge(end_cell)
                    merged_width = sum(
                        Ooxml_Helper.cm_to_twips(col_widths_cm[i])
                        for i in range(c_idx, c_idx + colspan)
                    )
                    tc_pr = cell._tc.get_or_add_tcPr()
                    old_w = tc_pr.find(qn("w:tcW"))
                    if old_w is not None:
                        tc_pr.remove(old_w)
                    tc_w = OxmlElement("w:tcW")
                    tc_w.set(qn("w:w"), str(merged_width))
                    tc_w.set(qn("w:type"), "dxa")
                    tc_pr.append(tc_w)

                c_idx += colspan
                cell.vertical_alignment = spec.get("valign", WD_ALIGN_VERTICAL.CENTER)
                bg = spec.get("bg") or row_bg
                if bg:
                    Ooxml_Helper.set_cell_shading(cell, bg)

                p = cell.paragraphs[0]
                p.alignment = spec.get("align", WD_ALIGN_PARAGRAPH.LEFT)
                p.paragraph_format.space_before = Pt(0)
                p.paragraph_format.space_after = Pt(0)
                p.paragraph_format.line_spacing = 1.10
                if page_break_before and headers is None and r_idx == 0 and c_idx == colspan:
                    p.paragraph_format.page_break_before = True

                badge_key = spec.get("badge")
                if badge_key:
                    p.add_run().add_picture(str(self.assets[badge_key]), width=Cm(1.38))
                else:
                    Ooxml_Helper.append_rich_text(
                        p,
                        spec["text"],
                        font_name=spec.get("font", "Times New Roman"),
                        size_pt=spec.get("size", font_size_pt),
                        base_bold=spec.get("bold", False),
                    )

        if space_after_pt > 0:
            spacer = self.doc.add_paragraph()
            spacer.paragraph_format.space_before = Pt(0)
            spacer.paragraph_format.space_after = Pt(space_after_pt)
            spacer.paragraph_format.line_spacing = Pt(1)
            r = spacer.add_run("")
            r.font.size = Pt(1)
        return table

    # --------------------------------------------------------------------------
    # SECTION BUILDERS (1:1 MIRROR OF project_charter_id.tex)
    # --------------------------------------------------------------------------
    def build_cover_letter(self) -> None:
        """Build Pages 1-2 official cover letter with letterhead and Cc."""
        # Letterhead table
        lh_tbl = self.doc.add_table(rows=1, cols=2)
        lh_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
        lh_tbl.autofit = False
        Ooxml_Helper.configure_table_borders(lh_tbl, bordered=False)
        Ooxml_Helper.set_table_fixed_widths(lh_tbl, [2.05, 14.35], cell_pad_tb_twips=0, cell_pad_lr_twips=40)
        Ooxml_Helper.set_row_flags(lh_tbl.rows[0])

        c_logo, c_txt = lh_tbl.rows[0].cells
        c_logo.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
        p_logo = c_logo.paragraphs[0]
        p_logo.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_logo.paragraph_format.space_before = Pt(0)
        p_logo.paragraph_format.space_after = Pt(0)
        p_logo.add_run().add_picture(str(self.assets["logo_hex"]), width=Cm(1.85))

        c_txt.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
        lines = [
            ("PT SCHRYZON DIGITAL NUSANTARA", "Arial", 14.0, HEX_NAVY, True, 1.5),
            ("3DĒX SOFTWARE & WEB ENGINEERING STUDIO", "Arial", 9.0, HEX_BLUE, True, 1.5),
            ("Pengembangan Perangkat Lunak Komersial, Aplikasi Web Terpadu, dan Layanan Cloud", "Times New Roman", 8.0, HEX_MUTED, False, 1.0),
            ("Jl. Majapahit No. 62, Gedung Cyber Nusantara Lt. 3, Mataram, Nusa Tenggara Barat 83125", "Times New Roman", 8.0, HEX_MUTED, False, 1.0),
            ('Telp: (0370) 641-889 | Email: <link url="mailto:3dexweb@gmail.com">3dexweb@gmail.com</link> | Situs Web: <link url="https://3dex.studio">https://3dex.studio</link>', "Times New Roman", 8.0, HEX_MUTED, False, 0.0),
        ]
        for idx, (txt, fn, sz, col, bld, sa) in enumerate(lines):
            p = c_txt.paragraphs[0] if idx == 0 else c_txt.add_paragraph()
            p.alignment = WD_ALIGN_PARAGRAPH.LEFT
            p.paragraph_format.space_before = Pt(0)
            p.paragraph_format.space_after = Pt(sa)
            p.paragraph_format.line_spacing = 1.05
            Ooxml_Helper.append_rich_text(
                p, txt, font_name=fn, size_pt=sz, color_hex=col, base_bold=bld, link_color_hex=HEX_BLUE
            )

        # Dual corporate horizontal rule under letterhead (Navy thick + Blue thin)
        rule1 = self.add_p("", space_before=2.0, space_after=1.5, line_spacing=Pt(2))
        rule1.add_run().font.size = Pt(1)
        Ooxml_Helper.set_paragraph_border(rule1, "bottom", HEX_NAVY, sz_eighths=18, space_pt=1)

        rule2 = self.add_p("", space_before=0.0, space_after=8.0, line_spacing=Pt(2))
        rule2.add_run().font.size = Pt(1)
        Ooxml_Helper.set_paragraph_border(rule2, "bottom", HEX_BLUE, sz_eighths=6, space_pt=1)

        # Official Letter Metadata Table
        meta_tbl = self.doc.add_table(rows=3, cols=4)
        meta_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
        meta_tbl.autofit = False
        Ooxml_Helper.configure_table_borders(meta_tbl, bordered=False)
        Ooxml_Helper.set_table_fixed_widths(meta_tbl, [2.0, 0.35, 9.35, 4.7], cell_pad_tb_twips=18, cell_pad_lr_twips=20)
        meta_rows = [
            ("Nomor", ":", "009/PC-INIT/SDN-3DEX/I/2026", "Mataram, 5 Januari 2026"),
            ("Lampiran", ":", "1 (Satu) Berkas Dokumen Project Charter v1.0 (Lampiran A s.d. D)", ""),
            ("Perihal", ":", "Penyampaian dan Permohonan Pengesahan Project Charter Pengembangan Platform Marketplace & Ekosistem Cetak 3D Komersial Terpadu \u201c3D\u0113x\u201d", ""),
        ]
        for r_idx, row_vals in enumerate(meta_rows):
            row = meta_tbl.rows[r_idx]
            Ooxml_Helper.set_row_flags(row)
            for c_idx, val in enumerate(row_vals):
                cell = row.cells[c_idx]
                cell.vertical_alignment = WD_ALIGN_VERTICAL.TOP
                p = cell.paragraphs[0]
                p.alignment = WD_ALIGN_PARAGRAPH.RIGHT if c_idx == 3 else WD_ALIGN_PARAGRAPH.LEFT
                p.paragraph_format.space_before = Pt(0)
                p.paragraph_format.space_after = Pt(1)
                p.paragraph_format.line_spacing = 1.12
                if val:
                    Ooxml_Helper.append_rich_text(p, val, font_name="Times New Roman", size_pt=11.0)

        # Recipient block
        recipient_lines = [
            "<b>Kepada Yth.</b>",
            "Ir. Hendra Wijaya, S.T., M.B.A. (Direktur Utama / <i>Executive Project Sponsor</i>)",
            "Rina Kusumawardhani, S.Ds., M.M. (<i>VP Operations</i> & <i>On-Site Customer Representative</i>)",
            "PT Kreasi Tiga Dimensi Indonesia (Krea3D Corp)",
            "Kawasan Industri Terpadu Blok C-14, Jl. Jend. Sudirman Kav. 48",
            "Jakarta Selatan 12930",
        ]
        self.add_p("", space_before=6.0, space_after=2.0, line_spacing=Pt(4))
        for idx, line in enumerate(recipient_lines):
            sa = 12.0 if idx == len(recipient_lines) - 1 else 1.0
            self.add_p(line, align=WD_ALIGN_PARAGRAPH.LEFT, space_after=sa, line_spacing=1.12)

        self.add_p("Dengan hormat,", align=WD_ALIGN_PARAGRAPH.LEFT, space_after=6.0)
        self.add_p(
            "Menindaklanjuti penandatanganan Nota Kesepahaman (<i>Memorandum of Understanding</i>) Nomor MoU/KREA3D-SDN/XII/2025 tertanggal 18 Desember 2025 serta hasil pertemuan penjajakan kebutuhan bersama Bapak dan Ibu Rina Kusumawardhani, bersama surat ini kami menyampaikan dokumen resmi Project Charter v1.0 untuk pengembangan platform komersial tertutup bernama 3D\u0113x.",
            space_after=6.0,
        )
        self.add_p(
            "Sebagai mitra pengembang perangkat lunak profesional, PT Schryzon Digital Nusantara merancang 3D\u0113x sebagai aset intelektual eksklusif milik Krea3D Corp (bukan proyek kode terbuka) yang menyatukan penjualan model 3D digital, pratinjau model interaktif langsung di <i>browser</i>, ruang komunitas kreator, rekomendasi pencarian cerdas berbasis AI (D\u0113xie), serta pemesanan jasa cetak 3D fisik yang aman dalam satu ekosistem terpadu.",
            space_after=6.0,
        )
        self.add_p(
            "Dokumen terlampir memuat tujuan proyek, ruang lingkup, hasil serahan, jadwal pelaksanaan, estimasi anggaran, risiko utama, sketsa awal antarmuka, serta pembagian peran dan wewenang sesuai standar PMBOK<sup>\u00ae</sup> Guide Edisi 6 dengan pendekatan siklus hidup Hybrid. Ringkasan parameter proyek yang dimohonkan pengesahannya adalah sebagai berikut:",
            space_after=6.0,
        )

        # Page 2: Project Summary Parameter Table
        self.add_styled_table(
            headers=["Parameter Proyek", "Ketentuan yang Diusulkan dalam Charter v1.0"],
            rows=[
                [{"text": "Nama Proyek"}, {"text": "Platform Marketplace Aset 3D & Ekosistem Cetak Fisik Terpadu \u201c3D\u0113x\u201d"}],
                [{"text": "Kepemilikan Perangkat Lunak"}, {"text": "Perangkat Lunak Komersial Tertutup; Hak Kekayaan Intelektual penuh milik PT Kreasi Tiga Dimensi Indonesia"}],
                [{"text": "Perusahaan Pelaksana"}, {"text": "PT Schryzon Digital Nusantara (3D\u0113x Studio)"}],
                [{"text": "Project Manager"}, {"text": "I Nyoman Widiyasa Jayananda"}],
                [{"text": "Durasi & Jadwal Pelaksanaan"}, {"text": "106 Hari Kalender / 15 Minggu (5 Januari 2026 s.d. 20 April 2026) dalam 5 Fase Rilis"}],
                [{"text": "Metodologi Pengembangan"}, {"text": "Hybrid (Inisiasi Prediktif + Iterasi <i>Agile Extreme Programming</i> XP / PXP)"}],
                [{"text": "Total Anggaran Disetujui"}, {"text": "Rp 148.500.000 (Termasuk Cadangan Risiko 10% sebesar Rp 13.500.000)"}],
            ],
            col_widths_cm=[4.8, 11.6],
            font_size_pt=10.5,
            pad_tb_twips=65,
            page_break_before=True,
            space_after_pt=6.0,
        )

        self.add_p(
            "Kami mohon Bapak berkenan menelaah dokumen terlampir. Apabila disetujui, kami mohon pengesahan pada bagian akhir dokumen agar tim pengembang dapat memulai pekerjaan sesuai jadwal yang disepakati. Kami juga terbuka untuk mendiskusikan penyesuaian sebelum dokumen disahkan.",
            space_after=6.0,
        )
        self.add_p(
            "Atas perhatian, kepercayaan, serta kerja sama Bapak dan Ibu dalam mewujudkan platform ekosistem 3D nasional ini, kami ucapkan terima kasih.",
            space_after=10.0,
        )

        # Two-Party Signature Block on Letter Page 2
        sig_tbl = self.doc.add_table(rows=4, cols=3)
        sig_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
        sig_tbl.autofit = False
        Ooxml_Helper.configure_table_borders(sig_tbl, bordered=False)
        Ooxml_Helper.set_table_fixed_widths(sig_tbl, [7.8, 0.8, 7.8], cell_pad_tb_twips=14, cell_pad_lr_twips=20)
        sig_data = [
            ["Diajukan oleh,", "", "Disetujui dan Disahkan oleh,"],
            ["PT Schryzon Digital Nusantara", "", "PT Kreasi Tiga Dimensi Indonesia"],
            ["Pelaksana Proyek / <i>Software Engineering Vendor</i>", "", "Pemilik Proyek / <i>Executive Project Sponsor</i>"],
            ["<u>I Nyoman Widiyasa Jayananda</u>\nProject Manager\nTanggal: 5 Januari 2026", "", "<u>Ir. Hendra Wijaya, S.T., M.B.A.</u>\nDirektur Utama / <i>Executive Sponsor</i>\nTanggal Pengesahan: ____________________"],
        ]
        for r_idx, r_vals in enumerate(sig_data):
            row = sig_tbl.rows[r_idx]
            min_h = 1.65 if r_idx == 3 else None
            Ooxml_Helper.set_row_flags(row, min_height_cm=min_h)
            for c_idx, txt in enumerate(r_vals):
                cell = row.cells[c_idx]
                cell.vertical_alignment = WD_ALIGN_VERTICAL.BOTTOM if r_idx == 3 else WD_ALIGN_VERTICAL.TOP
                lines_cell = txt.split("\n")
                for l_idx, l_txt in enumerate(lines_cell):
                    p = cell.paragraphs[0] if l_idx == 0 else cell.add_paragraph()
                    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
                    p.paragraph_format.space_before = Pt(0)
                    p.paragraph_format.space_after = Pt(1.5)
                    p.paragraph_format.line_spacing = 1.15
                    if l_txt:
                        Ooxml_Helper.append_rich_text(p, l_txt, font_name="Times New Roman", size_pt=11.0)

        self.add_p("<b>Tembusan:</b>", align=WD_ALIGN_PARAGRAPH.LEFT, space_before=12.0, space_after=1.5)
        self.add_p("1. Rina Kusumawardhani, S.Ds., M.M., <i>VP Operations</i> PT Kreasi Tiga Dimensi Indonesia", align=WD_ALIGN_PARAGRAPH.LEFT, space_after=1.0)
        self.add_p("2. Dosen Pengampu Mata Kuliah Proyek Perangkat Lunak, Teknik Informatika Universitas Mataram", align=WD_ALIGN_PARAGRAPH.LEFT, space_after=0.0)

    def _configure_section_2_header_footer(self, sec2) -> None:
        sec2.page_width = Cm(PAGE_WIDTH_CM)
        sec2.page_height = Cm(PAGE_HEIGHT_CM)
        sec2.top_margin = Cm(MARGIN_TB_CM)
        sec2.bottom_margin = Cm(MARGIN_TB_CM)
        sec2.left_margin = Cm(MARGIN_LR_CM)
        sec2.right_margin = Cm(MARGIN_LR_CM)
        sec2.header_distance = Cm(1.05)
        sec2.footer_distance = Cm(1.10)
        sec2.header.is_linked_to_previous = False
        sec2.footer.is_linked_to_previous = False

        # Running Header
        hp = sec2.header.paragraphs[0]
        hp.text = ""
        hp.paragraph_format.space_before = Pt(0)
        hp.paragraph_format.space_after = Pt(2)
        hp.paragraph_format.tab_stops.add_tab_stop(Cm(TEXT_WIDTH_CM), WD_TAB_ALIGNMENT.RIGHT)
        Ooxml_Helper.set_paragraph_border(hp, "bottom", HEX_BLACK, sz_eighths=4, space_pt=3)
        Ooxml_Helper.append_rich_text(
            hp,
            "PT SCHRYZON DIGITAL NUSANTARA | 3D\u0113x Commercial Platform\tDokumen: SDN-3DEX-PC-001 (v1.0)",
            font_name="Arial",
            size_pt=8.0,
            color_hex=HEX_MUTED,
        )

        # Running Footer with dynamic PAGE / NUMPAGES
        fp = sec2.footer.paragraphs[0]
        fp.text = ""
        fp.paragraph_format.space_before = Pt(2)
        fp.paragraph_format.space_after = Pt(0)
        fp.paragraph_format.tab_stops.add_tab_stop(Cm(TEXT_WIDTH_CM), WD_TAB_ALIGNMENT.RIGHT)
        Ooxml_Helper.set_paragraph_border(fp, "top", HEX_BLACK, sz_eighths=4, space_pt=3)
        Ooxml_Helper.append_rich_text(
            fp,
            "Rahasia Perusahaan | Kepemilikan Komersial Klien (Krea3D Corp)\tHalaman ",
            font_name="Arial",
            size_pt=8.0,
            color_hex=HEX_MUTED,
        )
        Ooxml_Helper.add_field_runs(fp, "PAGE", "Arial", 8.0, HEX_MUTED)
        Ooxml_Helper.append_rich_text(fp, " dari ", font_name="Arial", size_pt=8.0, color_hex=HEX_MUTED)
        Ooxml_Helper.add_field_runs(fp, "NUMPAGES", "Arial", 8.0, HEX_MUTED)

    def build_document_info_and_toc(self) -> None:
        """Build Section 2 Pages 3-4: Document Information and native Word TOC."""
        sec2 = self.doc.add_section(WD_SECTION.NEW_PAGE)
        self._configure_section_2_header_footer(sec2)

        # Page 3: Informasi Dokumen (Heading 1 -> appears in TOC)
        self.add_h1("Informasi Dokumen", space_before=0.0)
        self.add_styled_table(
            headers=["Atribut Dokumen", "Keterangan"],
            rows=[
                [{"text": "Judul Dokumen"}, {"text": "Project Charter v1.0: Platform Komersial 3D\u0113x"}],
                [{"text": "Nomor Dokumen"}, {"text": "SDN-3DEX-PC-001"}],
                [{"text": "Klien / Sponsor"}, {"text": "PT Kreasi Tiga Dimensi Indonesia (Krea3D Corp), Ir. Hendra Wijaya, S.T., M.B.A."}],
                [{"text": "Penyusun"}, {"text": "PT Schryzon Digital Nusantara (Tim Rekayasa 3D\u0113x)"}],
                [{"text": "Standar Acuan"}, {"text": "PMBOK<sup>\u00ae</sup> Guide Edisi 6, Proses 4.1 <i>Develop Project Charter</i> dan 13.1 <i>Identify Stakeholders</i>"}],
                [{"text": "Tanggal Terbit"}, {"text": "5 Januari 2026 (Versi 1.0)"}],
                [{"text": "Status Dokumen"}, {"text": "Menunggu Persetujuan Sponsor"}],
            ],
            col_widths_cm=[4.6, 11.8],
            font_size_pt=10.5,
            pad_tb_twips=55,
            space_after_pt=4.0,
        )

        self.add_unlisted_sub("Riwayat Revisi", space_before=6.0)
        self.add_styled_table(
            headers=["Versi", "Tanggal", "Keterangan Perubahan", "Penyusun"],
            rows=[
                [{"text": "0.1", "align": WD_ALIGN_PARAGRAPH.CENTER}, {"text": "18 Desember 2025", "align": WD_ALIGN_PARAGRAPH.CENTER}, {"text": "Draf awal setelah wawancara dan penjajakan kebutuhan bersama klien"}, {"text": "Tim 3D\u0113x", "align": WD_ALIGN_PARAGRAPH.CENTER}],
                [{"text": "0.9", "align": WD_ALIGN_PARAGRAPH.CENTER}, {"text": "29 Desember 2025", "align": WD_ALIGN_PARAGRAPH.CENTER}, {"text": "Penyelarasan ruang lingkup, jadwal, estimasi PERT paruh waktu, dan alur <i>escrow</i>"}, {"text": "Project Manager & Analyst", "align": WD_ALIGN_PARAGRAPH.CENTER}],
                [{"text": "1.0", "align": WD_ALIGN_PARAGRAPH.CENTER}, {"text": "5 Januari 2026", "align": WD_ALIGN_PARAGRAPH.CENTER}, {"text": "Versi final untuk persetujuan Sponsor dilengkapi sketsa antarmuka awal"}, {"text": "Project Manager", "align": WD_ALIGN_PARAGRAPH.CENTER}],
            ],
            col_widths_cm=[1.6, 3.1, 8.2, 3.5],
            font_size_pt=10.0,
            pad_tb_twips=55,
            space_after_pt=4.0,
        )

        self.add_unlisted_sub("Daftar Distribusi", space_before=6.0)
        self.add_styled_table(
            headers=["Nama / Pihak", "Peran", "Keperluan"],
            rows=[
                [{"text": "Ir. Hendra Wijaya, S.T., M.B.A."}, {"text": "<i>Executive Sponsor</i> (Krea3D Corp)"}, {"text": "Persetujuan resmi proyek"}],
                [{"text": "Rina Kusumawardhani, S.Ds., M.M."}, {"text": "<i>On-Site Customer</i> / Perwakilan Pengguna"}, {"text": "Telaah fitur dan validasi rilis"}],
                [{"text": "Santi Ika Murpratiwi, S.Kom., M.T."}, {"text": "Dosen Pengampu PPL (UNRAM)"}, {"text": "Evaluasi kaidah manajemen dan informasi"}],
                [{"text": "Tim Pengembang 3D\u0113x (4 Personil)"}, {"text": "Pelaksana Teknis (PT SDN)"}, {"text": "Acuan kerja dan kontrol lingkup"}],
            ],
            col_widths_cm=[4.8, 4.8, 6.8],
            font_size_pt=10.0,
            pad_tb_twips=55,
            space_after_pt=4.0,
        )

        # Page 4: DAFTAR ISI with native Word TOC field
        self.add_p(
            "DAFTAR ISI",
            align=WD_ALIGN_PARAGRAPH.LEFT,
            font_name="Arial",
            size_pt=14.0,
            bold=True,
            space_before=0.0,
            space_after=8.0,
            page_break_before=True,
        )
        p_toc = self.doc.add_paragraph(style="Normal")
        p_toc.paragraph_format.space_before = Pt(0)
        p_toc.paragraph_format.space_after = Pt(0)
        Ooxml_Helper.add_field_runs(p_toc, 'TOC \\o "1-2" \\h \\z \\u', "Times New Roman", 11.0, HEX_BLACK)

    def build_sections_1_to_12(self) -> None:
        """Build Pages 5-14: Banner and main Sections 1-12."""
        # Banner on Page 5
        self.add_centered_image(
            MEDIA_PATHS["og_image"],
            width_cm=16.0,
            space_before=0.0,
            space_after=4.0,
            keep_with_next=True,
            page_break_before=True,
        )
        self.add_p(
            "PROJECT CHARTER V1.0: PLATFORM KOMERSIAL 3D\u0112X",
            align=WD_ALIGN_PARAGRAPH.CENTER,
            font_name="Arial",
            size_pt=13.5,
            bold=True,
            space_before=2.0,
            space_after=1.5,
            keep_with_next=True,
        )
        self.add_p(
            "Dokumen Pengesahan Proyek Berdasarkan PMBOK<sup>\u00ae</sup> Guide Edisi 6 (Proses 4.1 <i>Develop Project Charter</i>)",
            align=WD_ALIGN_PARAGRAPH.CENTER,
            font_name="Times New Roman",
            size_pt=9.5,
            color_hex=HEX_MUTED,
            space_after=6.0,
        )

        # Section 1
        self.add_h1("1. Tujuan dan Justifikasi Bisnis Proyek", space_before=6.0)
        self.add_h2("1.1 Latar Belakang Masalah Bisnis Klien", space_before=6.0)
        self.add_p(
            "PT Kreasi Tiga Dimensi Indonesia (Krea3D Corp), penyedia layanan perdagangan konten kreatif digital dan manufaktur aditif di Indonesia, mengidentifikasi hambatan operasional dalam alur penjualan aset digital hingga pencetakan fisik. Sebelum proyek dimulai, proses bisnis klien menghadapi empat masalah utama:"
        )
        self.add_numbered_list([
            "Saluran Jual dan Cetak Terpisah: Kreator menjual model di situs terpisah, memamerkan portofolio di galeri luar, dan menerima pesanan cetak melalui pesan instan. Akibatnya sekitar 35% pembeli batal melanjutkan pesanan cetak karena kesulitan mencari mitra pencetak yang sesuai.",
            "Penawaran Cetak Lambat dan Manual: Staf operasional dan bengkel mitra mengonfirmasi ukuran model, bahan cetak, dan pengiriman berkas secara manual melalui obrolan dan lembar hitung. Proses ini memakan waktu rata-rata 48 jam sebelum produksi dimulai.",
            "Keraguan Pembeli terhadap Pratinjau 2D: Pembeli sering ragu pada kualitas bentuk model karena katalog lama hanya menampilkan foto statis 2D, sehingga memicu keluhan dan pengembalian dana pasca-cetak.",
            "Pencarian Sulit pada Katalog Besar: Pencarian kata kunci biasa menyulitkan pelanggan menemukan model spesifik dari ribuan aset, yang menghambat konversi penjualan.",
        ])

        self.add_h2("1.2 Justifikasi Bisnis dan Model Komersial Tertutup")
        self.add_p(
            "Untuk mengatasi keempat masalah tersebut, Krea3D Corp menugaskan PT Schryzon Digital Nusantara membangun platform web komersial tertutup bernama 3D\u0113x dengan hak milik penuh di tangan klien. Nilai investasi Rp 148.500.000 dijustifikasi melalui proyeksi manfaat berikut:"
        )
        self.add_bullets([
            "Menyatukan pendapatan komisi aset digital dan biaya layanan cetak 3D dalam satu platform bisnis resmi (https://3dex.studio).",
            "Memangkas waktu administrasi pemesanan cetak hingga 85% melalui formulir standar dan pengiriman berkas model otomatis ke mitra pencetak terverifikasi.",
            "Meningkatkan minat beli melalui pratinjau model 3D interaktif langsung di <i>browser</i> dan asisten rekomendasi cerdas berbasis AI (D\u0113xie).",
        ])

        # Section 2
        self.add_h1("2. Tujuan Terukur (SMART) dan Kriteria Sukses Proyek")
        self.add_p(
            "Sasaran proyek dirumuskan secara terukur agar keberhasilannya dapat diverifikasi secara objektif saat serah terima:",
            keep_with_next=True,
        )
        self.add_caption("Tabel 1: Tujuan Proyek Terukur Berdasarkan Kerangka SMART", keep_with_next=True)
        self.add_styled_table(
            headers=["Kode", "Area Tujuan", "Target Terukur", "Cara Pengukuran & Tenggat"],
            rows=[
                [{"text": "O-1", "align": WD_ALIGN_PARAGRAPH.CENTER}, {"text": "Kecepatan Akses & Pratinjau 3D"}, {"text": "Katalog terbuka \u2264 3 detik; penampil 3D siap \u2264 5 detik"}, {"text": "Diuji menggunakan peramban standar pada model < 50 MB sebelum rilis akhir (Minggu 15)."}],
                [{"text": "O-2", "align": WD_ALIGN_PARAGRAPH.CENTER}, {"text": "Kecepatan Alur Cetak 3D"}, {"text": "Penerusan pesanan cetak turun dari 48 jam menjadi \u2264 5 menit"}, {"text": "Diukur sejak pelanggan memesan hingga mitra cetak menerima berkas dan detail cetak (Minggu 14)."}],
                [{"text": "O-3", "align": WD_ALIGN_PARAGRAPH.CENTER}, {"text": "Keandalan Pembayaran"}, {"text": "Pencatatan transaksi berhasil \u2265 99,5% (nol tagihan ganda)"}, {"text": "Diverifikasi melalui uji coba pembayaran Midtrans dan pencocokan status lunas sejak Rilis 1."}],
                [{"text": "O-4", "align": WD_ALIGN_PARAGRAPH.CENTER}, {"text": "Pencarian Cerdas AI (D\u0113xie)"}, {"text": "Hasil rekomendasi muncul \u2264 0,5 detik; konversi naik \u2265 25%"}, {"text": "Diukur dari waktu respons pencarian cerdas serta pemantauan penjualan 30 hari pasca-rilis."}],
                [{"text": "O-5", "align": WD_ALIGN_PARAGRAPH.CENTER}, {"text": "Pelaporan & Tata Kelola Admin"}, {"text": "Laporan penjualan dan catatan audit tersedia 24 jam penuh"}, {"text": "Diukur dari ketersediaan dasbor seniman dan admin (\u2265 99,5% aktif) pada serah terima Minggu 15."}],
            ],
            col_widths_cm=[1.15, 3.25, 3.60, 8.40],
            font_size_pt=10.0,
            pad_tb_twips=48,
        )
        self.add_p("Kriteria Sukses Proyek (<i>Project Success Criteria</i>):", space_before=2.0, space_after=2.0)
        self.add_p(
            "Proyek dinyatakan berhasil apabila: (1) seluruh fitur pada Rilis 1 hingga Rilis 5 lulus 100% uji penerimaan pengguna (<i>User Acceptance Testing</i> / UAT) oleh perwakilan Krea3D Corp; (2) sistem beroperasi stabil pada domain produksi paling lambat Hari ke-106 (20 April 2026); dan (3) total biaya proyek tidak melampaui anggaran disetujui sebesar Rp 148.500.000."
        )

        # Section 3 (Page 7)
        self.add_h1("3. Kebutuhan Tingkat Tinggi (<i>High-Level Requirements</i>)", page_break_before=True, space_before=0.0)
        self.add_h2("3.1 Kebutuhan Pengguna dan Hak Akses Peran", space_before=4.0)
        self.add_p("Platform memisahkan hak akses ke dalam lima peran utama agar alur bisnis dan pengawasan berjalan tertib:")
        self.add_numbered_list([
            "<i>Guest</i> (Pengunjung): Dapat menelusuri katalog publik, melihat profil kreator, menginspeksi model 3D secara interaktif di <i>browser</i>, serta mendaftar akun (email atau Google).",
            "<i>Customer</i> (Pembeli): Dapat mencari aset dengan kata kunci maupun bantuan AI, mengelola keranjang serta <i>wishlist</i>, membayar melalui Midtrans, mengunduh aset berlisensi secara aman, memesan cetak fisik lengkap dengan pemilihan bengkel mitra serta pelacakan status 5 tahap, memberi ulasan, dan mengikuti kreator.",
            "<i>Artist</i> (Kreator 3D): Memiliki fitur pembeli ditambah kemampuan mengunggah model 3D dengan pilihan lisensi gratis/berbayar (pribadi/komersial), memajang portofolio di lini masa komunitas, memantau statistik penjualan, dan menarik penghasilan.",
            "<i>Print Provider</i> (Mitra Jasa Cetak): Memiliki dasbor antrean cetak untuk menerima atau menolak pesanan masuk, mengunduh berkas 3D resmi pesanan, mengunggah foto hasil cetak, serta memasukkan nomor resi pengiriman.",
            "<i>Admin</i> (Pengelola Platform): Mengakses statistik transaksi menyeluruh, memverifikasi pengajuan akun kreator dan mitra cetak, meninjau model baru sebelum tayang publik, menangani laporan pelanggaran, serta memeriksa catatan audit permanen.",
        ])
        self.add_h2("3.2 Kebutuhan Kualitas Sistem dan Perlindungan Transaksi")
        self.add_bullets([
            "Keamanan Akses & Berkas Digital: Akun dilindungi verifikasi kata sandi terenkripsi, opsi keamanan dua langkah (2FA), serta tautan unduhan berkas berbatas waktu khusus bagi pembeli resmi.",
            "Keandalan Pembayaran & Penahanan Saldo (<i>Escrow</i> Cetak 3D): Setiap transaksi pembayaran tercatat otomatis tanpa risiko penggandaan. Khusus pesanan cetak fisik yang dibayar di muka via Midtrans, sistem menahan sementara pencairan dana mitra (<i>simple ledger/escrow</i>) dan baru melepasnya setelah pesanan berstatus DELIVERED serta dikonfirmasi oleh Customer (atau dikembalikan jika pesanan ditolak).",
            "Pengalaman Pengguna: Antarmuka tema gelap yang responsif di desktop maupun ponsel dengan bantuan asisten AI D\u0113xie yang dapat diaktifkan sesuai kebutuhan.",
        ])
        self.add_p("Sketsa dan gambaran awal antarmuka sistem disajikan pada Lampiran A.")

        # Section 4
        self.add_h1("4. Deskripsi Proyek, Batas Lingkup, dan Deliverable Utama")
        self.add_h2("4.1 Gambaran Platform dan Pilar Layanan")
        self.add_p(
            "Platform 3D\u0113x dibangun sebagai sistem aplikasi terpadu yang memisahkan empat bagian utama agar mudah dikelola dan aman: (1) antarmuka web pengguna di <i>browser</i>; (2) pusat layanan bisnis terintegrasi (akun, katalog, transaksi, komunitas, AI, notifikasi, cetak 3D, dan moderasi admin); (3) basis data terpusat; serta (4) penyimpanan berkas media dan model 3D. Untuk pemesanan cetak fisik, perkiraan biaya cetak dihitung otomatis di sisi halaman web berdasarkan estimasi ukuran dan volume model (<i>bounding-box</i>), sedangkan bagian belakang backend hanya mengelola spesifikasi cetak (<i>Print Spec</i>) dan antrean kerja (<i>Job Queue</i>) tanpa memproses jalur mesin cetak (<i>G-code slicing</i>) di server."
        )
        self.add_centered_image(self.assets["fig_1_arch"], width_cm=0.92 * TEXT_WIDTH_CM, space_before=3.0, space_after=2.0)
        self.add_caption("Gambar 1: Gambaran Arsitektur 4 Komponen Utama Platform 3D\u0113x", space_after=4.0)

        self.add_p("Layanan komersial platform dikelompokkan menjadi tiga pilar produk dan jasa utama sebagai berikut:", keep_with_next=True)

        # 3-pillar image strip (Gambar 2)
        p_tbl = self.doc.add_table(rows=2, cols=3)
        p_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
        p_tbl.autofit = False
        Ooxml_Helper.configure_table_borders(p_tbl, bordered=False)
        Ooxml_Helper.set_table_fixed_widths(p_tbl, [5.46, 5.48, 5.46], cell_pad_tb_twips=20, cell_pad_lr_twips=40)
        Ooxml_Helper.set_row_flags(p_tbl.rows[0])
        Ooxml_Helper.set_row_flags(p_tbl.rows[1])
        pillars = [
            (MEDIA_PATHS["cat_models"], "(a) Model 3D Digital (.glb/.gltf)"),
            (MEDIA_PATHS["cat_print"], "(b) Layanan Cetak 3D Fisik"),
            (MEDIA_PATHS["cat_textures"], "(c) Tekstur & Material"),
        ]
        for idx, (img_p, subcap) in enumerate(pillars):
            c_img = p_tbl.rows[0].cells[idx]
            c_img.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
            pi = c_img.paragraphs[0]
            pi.alignment = WD_ALIGN_PARAGRAPH.CENTER
            pi.paragraph_format.space_after = Pt(2)
            pi.paragraph_format.keep_with_next = True
            with Image.open(img_p) as im:
                ratio = im.width / im.height
            target_h = 2.4
            target_w = min(4.75, target_h * ratio)
            pi.add_run().add_picture(str(img_p), width=Cm(target_w))

            c_cap = p_tbl.rows[1].cells[idx]
            pc = c_cap.paragraphs[0]
            pc.alignment = WD_ALIGN_PARAGRAPH.CENTER
            pc.paragraph_format.space_before = Pt(0)
            pc.paragraph_format.space_after = Pt(0)
            Ooxml_Helper.append_rich_text(pc, subcap, font_name="Times New Roman", size_pt=9.0)
        self.add_caption("Gambar 2: Tiga Pilar Layanan Komersial Platform 3D\u0113x", space_before=2.0, space_after=4.0)

        # Section 4.2 & 4.3 (Page 9-10)
        h42 = self.add_h2("4.2 Batas Lingkup Proyek (<i>In-Scope vs Out-of-Scope</i>)", space_before=0.0)
        h42.paragraph_format.page_break_before = True
        self.add_caption("Tabel 2: Matriks Batas Ruang Lingkup Proyek 3D\u0113x", keep_with_next=True)

        t2 = self.doc.add_table(rows=2, cols=2)
        t2.alignment = WD_TABLE_ALIGNMENT.CENTER
        t2.autofit = False
        Ooxml_Helper.configure_table_borders(t2, bordered=True, border_color="333333")
        Ooxml_Helper.set_table_fixed_widths(t2, [8.2, 8.2], cell_pad_tb_twips=90, cell_pad_lr_twips=95)
        Ooxml_Helper.set_row_flags(t2.rows[0], is_header=True)
        Ooxml_Helper.set_row_flags(t2.rows[1])
        for c_idx, h_txt in enumerate(["Dalam Lingkup (<i>In Scope</i>)", "Di Luar Lingkup (<i>Out of Scope</i>)"]):
            cell = t2.rows[0].cells[c_idx]
            cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
            Ooxml_Helper.set_cell_shading(cell, HEX_HEADER_GRAY)
            p = cell.paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p.paragraph_format.space_after = Pt(0)
            Ooxml_Helper.append_rich_text(p, h_txt, font_name="Times New Roman", size_pt=10.5, base_bold=True)

        in_scope = [
            "Situs web lengkap untuk 5 peran pengguna (Pengunjung, Pembeli, Kreator, Mitra Cetak, Admin).",
            "Penampil 3D interaktif langsung di <i>browser</i> (putar, geser, perbesar model).",
            "Katalog aset, filter pencarian, dan asisten rekomendasi cerdas AI D\u0113xie.",
            "Keranjang, <i>wishlist</i>, lisensi ganda, pembayaran Midtrans otomatis, pembatalan otomatis pesanan kedaluwarsa oleh penjadwal sistem, serta unduhan berkas berbatas waktu.",
            "Pemesanan cetak 3D (skala, bahan, kepadatan, warna, estimasi harga sisi klien), penahanan saldo <i>escrow</i> hingga status DELIVERED, dasbor mitra cetak, pelacakan 5 tahap, foto bukti kerja, dan nomor resi.",
            "Lini masa komunitas, ulasan transaksi, koleksi, notifikasi, dan dasbor moderasi Admin.",
        ]
        out_scope = [
            "Aplikasi seluler asli (Android/iOS) atau fitur <i>Augmented Reality</i> khusus ponsel.",
            "Mesin pemotong lintasan cetak (<i>server-side G-code slicing engine</i>) atau kendali mesin cetak jarak jauh (IoT).",
            "Integrasi sistem akuntansi eksternal perusahaan maupun pelaporan pajak (e-Faktur/ERP).",
            "Pengadaan mesin cetak 3D, bahan baku filamen/resin, maupun armada pengiriman mitra.",
            "Migrasi riwayat transaksi atau data pengguna dari sistem lama sebelum platform diluncurkan.",
            "Integrasi layanan pelacakan otomatis kurir eksternal berbayar tanpa input nomor resi oleh mitra.",
        ]
        for c_idx, bullet_list in enumerate([in_scope, out_scope]):
            cell = t2.rows[1].cells[c_idx]
            cell.vertical_alignment = WD_ALIGN_VERTICAL.TOP
            for b_idx, item in enumerate(bullet_list):
                p = cell.paragraphs[0] if b_idx == 0 else cell.add_paragraph()
                p.alignment = WD_ALIGN_PARAGRAPH.LEFT
                p.paragraph_format.space_before = Pt(1.5)
                p.paragraph_format.space_after = Pt(4.5)
                p.paragraph_format.line_spacing = 1.15
                Ooxml_Helper.apply_paragraph_numbering(p, self.bullet_table_num_id, ilvl=0)
                Ooxml_Helper.append_rich_text(p, item, font_name="Times New Roman", size_pt=10.5)

        self.add_p(
            "Permintaan di luar daftar lingkup di atas ditangani melalui pengajuan perubahan tertulis yang disetujui Sponsor dan Project Manager beserta penyesuaian waktu dan biaya.",
            space_before=6.0,
        )

        self.add_h2("4.3 Deliverable Utama per Fase Rilis", space_before=0.0, page_break_before=True)
        self.add_caption("Tabel 3: Daftar Hasil Serahan Utama Proyek (D1 s.d. D5)", keep_with_next=True)
        self.add_styled_table(
            headers=["Kode", "Deliverable Utama", "Ringkasan Hasil yang Diserahkan", "Target Rilis"],
            rows=[
                [{"text": "D1", "align": WD_ALIGN_PARAGRAPH.CENTER}, {"text": "Fondasi, Sketsa UI & Akses Akun"}, {"text": "Daftar kebutuhan pengguna, sketsa antarmuka tema gelap, sistem login email dan Google, manajemen peran, dan penyimpanan aset 3D."}, {"text": "Minggu ke-3 (Hari 18)", "align": WD_ALIGN_PARAGRAPH.CENTER}],
                [{"text": "D2", "align": WD_ALIGN_PARAGRAPH.CENTER}, {"text": "Rilis 1: Marketplace Inti & Pembayaran"}, {"text": "Katalog publik, penampil 3D interaktif, unggah aset kreator, keranjang, <i>wishlist</i>, checkout Midtrans, dan antrean persetujuan model."}, {"text": "Minggu ke-7 (Hari 48)", "align": WD_ALIGN_PARAGRAPH.CENTER}],
                [{"text": "D3", "align": WD_ALIGN_PARAGRAPH.CENTER}, {"text": "Rilis 2: Komunitas & Interaksi Sosial"}, {"text": "Portofolio kreator di lini masa, fitur ikuti kreator, suka, komentar, ulasan pembeli resmi, koleksi pribadi, notifikasi, dan pelaporan konten."}, {"text": "Minggu ke-10 (Hari 72)", "align": WD_ALIGN_PARAGRAPH.CENTER}],
                [{"text": "D4", "align": WD_ALIGN_PARAGRAPH.CENTER}, {"text": "Rilis 3: Asisten AI & Cetak 3D (<i>Escrow</i>)"}, {"text": "Pencarian cerdas dan rekomendasi D\u0113xie, formulir pemesanan cetak fisik (estimasi dimensi model), jaminan saldo <i>escrow</i>, dasbor mitra, dan pelacakan 5 tahap."}, {"text": "Minggu ke-13 (Hari 94)", "align": WD_ALIGN_PARAGRAPH.CENTER}],
                [{"text": "D5", "align": WD_ALIGN_PARAGRAPH.CENTER}, {"text": "Rilis Final: Moderasi Admin, UAT & Pelatihan"}, {"text": "Statistik penjualan kreator dan admin, verifikasi mitra, catatan audit, hasil uji penerimaan 100% UAT, manual pengguna, dan pelatihan staf klien."}, {"text": "Minggu ke-15 (Hari 106)", "align": WD_ALIGN_PARAGRAPH.CENTER}],
            ],
            col_widths_cm=[1.2, 4.4, 8.3, 2.5],
            font_size_pt=10.5,
            pad_tb_twips=65,
        )

        # Section 5 (Page 11)
        self.add_h1("5. Risiko Proyek dan Assumption Log", page_break_before=True, space_before=0.0)
        self.add_h2("5.1 Register Risiko Tingkat Tinggi", space_before=4.0)
        self.add_caption("Tabel 4: Identifikasi Risiko Utama dan Langkah Mitigasi", keep_with_next=True)
        self.add_styled_table(
            headers=["ID", "Deskripsi Risiko", "Peluang / Dampak", "Tingkat", "Langkah Mitigasi"],
            rows=[
                [{"text": "R-01", "align": WD_ALIGN_PARAGRAPH.CENTER}, {"text": "Perubahan kebijakan atau batas kuota layanan pihak ketiga (Midtrans, Google AI, atau Login Google)"}, {"text": "Sedang / Tinggi", "align": WD_ALIGN_PARAGRAPH.CENTER}, {"badge": "badge_tinggi", "align": WD_ALIGN_PARAGRAPH.CENTER}, {"text": "Memisahkan integrasi eksternal pada lapisan layanan khusus serta menyiapkan pesan cadangan dan percobaan ulang otomatis saat layanan sibuk."}],
                [{"text": "R-02", "align": WD_ALIGN_PARAGRAPH.CENTER}, {"text": "Penambahan permintaan fitur baru di luar batas jadwal 106 hari (<i>scope creep</i>)"}, {"text": "Sedang / Tinggi", "align": WD_ALIGN_PARAGRAPH.CENTER}, {"badge": "badge_tinggi", "align": WD_ALIGN_PARAGRAPH.CENTER}, {"text": "Menerapkan persetujuan perubahan tertulis bersama Sponsor dan mengunci perubahan fitur mulai Hari ke-95 (Fase 5)."}],
                [{"text": "R-03", "align": WD_ALIGN_PARAGRAPH.CENTER}, {"text": "Kendala penggabungan pekerjaan antaranggota tim pengembang"}, {"text": "Tinggi / Sedang", "align": WD_ALIGN_PARAGRAPH.CENTER}, {"badge": "badge_sedang", "align": WD_ALIGN_PARAGRAPH.CENTER}, {"text": "Mewajibkan penggabungan kode setiap hari kerja disertai pemeriksaan otomatis sebelum pembaruan diterima."}],
                [{"text": "R-04", "align": WD_ALIGN_PARAGRAPH.CENTER}, {"text": "Halaman katalog terasa lambat bila pengguna mengunggah berkas model 3D berukuran sangat besar (> 50 MB)"}, {"text": "Sedang / Sedang", "align": WD_ALIGN_PARAGRAPH.CENTER}, {"badge": "badge_sedang", "align": WD_ALIGN_PARAGRAPH.CENTER}, {"text": "Membatasi ukuran berkas unggahan, menampilkan gambar pratinjau ringan pada halaman daftar katalog, dan memuat model 3D hanya saat halaman detail dibuka."}],
                [{"text": "R-05", "align": WD_ALIGN_PARAGRAPH.CENTER}, {"text": "Kesalahan logika program selama percepatan pengembangan"}, {"text": "Sedang / Sedang", "align": WD_ALIGN_PARAGRAPH.CENTER}, {"badge": "badge_sedang", "align": WD_ALIGN_PARAGRAPH.CENTER}, {"text": "Mewajibkan pemeriksaan silang antaranggota tim pada modul penting (pembayaran dan AI) serta uji menyeluruh tiap akhir fase."}],
                [{"text": "R-06", "align": WD_ALIGN_PARAGRAPH.CENTER}, {"text": "Keterlambatan tanggapan klien saat evaluasi rilis berkala"}, {"text": "Rendah / Tinggi", "align": WD_ALIGN_PARAGRAPH.CENTER}, {"badge": "badge_rendah", "align": WD_ALIGN_PARAGRAPH.CENTER}, {"text": "Menjadwalkan sesi demo tetap setiap 2 minggu dengan penunjukan Ibu Rina Kusumawardhani sebagai perwakilan tetap klien."}],
                [{"text": "R-07", "align": WD_ALIGN_PARAGRAPH.CENTER}, {"text": "Sengketa pesanan cetak 3D apabila mitra menolak pesanan atau hasil cetak rusak di perjalanan"}, {"text": "Sedang / Tinggi", "align": WD_ALIGN_PARAGRAPH.CENTER}, {"badge": "badge_tinggi", "align": WD_ALIGN_PARAGRAPH.CENTER}, {"text": "Menerapkan penahanan saldo sementara (<i>simple ledger/escrow</i>) berbasis status pesanan: dana ditahan dari pencairan dan baru diserahkan ke mitra setelah status DELIVERED dikonfirmasi Customer (atau dikembalikan bila ditolak)."}],
            ],
            col_widths_cm=[1.20, 3.85, 1.95, 1.85, 7.55],
            font_size_pt=9.5,
            pad_tb_twips=42,
        )

        self.add_h2("5.2 Asumsi dan Kendala Proyek (Assumption Log)", space_before=6.0)
        self.add_bullets(["Asumsi Proyek (<i>Assumptions</i>):"], space_after=1.0, keep_with_next=True)
        self.add_numbered_list([
            "Krea3D Corp menyediakan kredensial layanan pembayaran (Midtrans), login Google, dan layanan AI Google sebelum Fase 2 dimulai.",
            "Data awal kategori model, jenis bahan cetak standar (PLA, ABS, Resin SLA, TPU, Nylon SLS), serta profil awal mitra cetak tersedia sebelum masa uji penerimaan (UAT).",
            "Pengguna mengakses platform menggunakan <i>browser</i> modern pada perangkat desktop atau ponsel dengan dukungan tampilan 3D aktif.",
            "Basis Kapasitas Usaha Tim Pengembang: Angka 106 <i>person-days</i> merupakan akumulasi estimasi usaha efektif tim pengembang mahasiswa (4 personil) yang bekerja secara terdistribusi dan paruh waktu (<i>part-time</i> sekitar 15 hingga 20 jam per minggu per personil) sepanjang rentang 106 hari kalender proyek (15 minggu), bukan kapasitas kerja penuh waktu (<i>full-time</i>) simultan.",
        ], ilvl=1, space_after=1.5)
        self.add_bullets(["Kendala Proyek (<i>Constraints</i>):"], space_after=1.0, keep_with_next=True)
        self.add_numbered_list([
            "Kendala Waktu: Seluruh pekerjaan hingga peluncuran dan serah terima wajib tuntas dalam batas 106 hari kalender (5 Januari 2026 s.d. 20 April 2026).",
            "Kendala Biaya: Total biaya proyek bersifat kontrak tetap maksimal Rp 148.500.000 termasuk cadangan risiko 10%.",
            "Kendala Kerahasiaan: Seluruh kode sumber dan aset sistem merupakan hak milik tertutup Krea3D Corp dan dilarang dipublikasikan secara terbuka tanpa izin tertulis Sponsor.",
        ], ilvl=1, space_after=2.0, keep_block_together=True)

        # Section 6 (Page 12)
        self.add_h1("6. Ringkasan Jadwal Milestone", space_before=8.0)
        self.add_p(
            "Proyek berjalan selama 15 minggu (106 hari kalender) mulai 5 Januari 2026 hingga 20 April 2026. Bagan Gantt, rencana iterasi mingguan, dan alokasi usaha 106 <i>person-days</i> dijabarkan pada Lampiran C.",
            keep_with_next=True,
        )
        self.add_caption("Tabel 5: Ringkasan Milestone Utama Proyek 3D\u0113x", keep_with_next=True)
        self.add_styled_table(
            headers=["Kode", "Milestone Utama", "Tanggal Target", "Kriteria Pencapaian"],
            rows=[
                [{"text": "M1", "align": WD_ALIGN_PARAGRAPH.CENTER}, {"text": "Charter Disetujui & Fondasi (D1)"}, {"text": "22 Januari 2026 (Minggu 3 / Hari 18)", "align": WD_ALIGN_PARAGRAPH.CENTER}, {"text": "Charter disahkan Sponsor; login pengguna, hak akses peran, dan penyimpanan awal beroperasi."}],
                [{"text": "M2", "align": WD_ALIGN_PARAGRAPH.CENTER}, {"text": "Rilis 1: Marketplace & Pembayaran (D2)"}, {"text": "21 Februari 2026 (Minggu 7 / Hari 48)", "align": WD_ALIGN_PARAGRAPH.CENTER}, {"text": "Katalog publik, penampil 3D, unggah model kreator, keranjang, dan pembayaran Midtrans teruji."}],
                [{"text": "M3", "align": WD_ALIGN_PARAGRAPH.CENTER}, {"text": "Rilis 2: Komunitas & Sosial (D3)"}, {"text": "17 Maret 2026 (Minggu 10 / Hari 72)", "align": WD_ALIGN_PARAGRAPH.CENTER}, {"text": "Lini masa portofolio, fitur ikuti, ulasan transaksi, koleksi, dan pusat notifikasi berfungsi."}],
                [{"text": "M4", "align": WD_ALIGN_PARAGRAPH.CENTER}, {"text": "Rilis 3: Asisten AI & Cetak 3D (D4)"}, {"text": "8 April 2026 (Minggu 13 / Hari 94)", "align": WD_ALIGN_PARAGRAPH.CENTER}, {"text": "Rekomendasi AI D\u0113xie, pemesanan cetak (<i>bounding-box</i>) dengan jaminan <i>escrow</i>, dan dasbor mitra aktif."}],
                [{"text": "M5", "align": WD_ALIGN_PARAGRAPH.CENTER}, {"text": "Rilis Final, Lulus UAT & Serah Terima (D5)"}, {"text": "20 April 2026 (Minggu 15 / Hari 106)", "align": WD_ALIGN_PARAGRAPH.CENTER}, {"text": "Dasbor Admin, pengujian lengkap UAT 100% lulus, pelatihan klien, dan berita acara serah terima disahkan."}],
            ],
            col_widths_cm=[1.20, 4.30, 3.00, 7.90],
            font_size_pt=10.0,
            pad_tb_twips=48,
        )

        # Sections 7, 8, 9 (Page 13)
        self.add_h1("7. Sumber Daya Keuangan yang Disetujui", page_break_before=True, space_before=0.0)
        self.add_p(
            "Plafon anggaran kontrak proyek ditetapkan sebesar Rp 148.500.000 menggunakan teknik estimasi Three-Point (PERT) dan Parametric. Rincian perhitungan matematis PERT serta klarifikasi kapasitas paruh waktu disajikan pada Lampiran C.",
            keep_with_next=True,
        )
        self.add_caption("Tabel 6: Ringkasan Anggaran Proyek yang Disetujui Sponsor", keep_with_next=True)
        self.add_styled_table(
            headers=["Komponen Anggaran", "Basis Perhitungan", "Estimasi Biaya", "Porsi"],
            rows=[
                [{"text": "Tenaga Pengembang Perangkat Lunak"}, {"text": "106 <i>person-days</i> \u00d7 Rp 1.000.000 (Paruh Waktu)"}, {"text": "Rp 106.000.000", "align": WD_ALIGN_PARAGRAPH.RIGHT}, {"text": "71,38%", "align": WD_ALIGN_PARAGRAPH.CENTER}],
                [{"text": "Server, Hosting & Layanan API (12 Bulan)"}, {"text": "Paket Server Produksi, Penyimpanan File & API"}, {"text": "Rp 16.500.000", "align": WD_ALIGN_PARAGRAPH.RIGHT}, {"text": "11,11%", "align": WD_ALIGN_PARAGRAPH.CENTER}],
                [{"text": "Desain Antarmuka, Uji 3D & QA Regresi"}, {"text": "Paket Desain Tema Gelap & Pengujian Mutu"}, {"text": "Rp 7.500.000", "align": WD_ALIGN_PARAGRAPH.RIGHT}, {"text": "5,05%", "align": WD_ALIGN_PARAGRAPH.CENTER}],
                [{"text": "Dokumentasi, Pelatihan & Lokakarya UAT"}, {"text": "Manual Pengguna/Admin & Transfer Ilmu"}, {"text": "Rp 5.000.000", "align": WD_ALIGN_PARAGRAPH.RIGHT}, {"text": "3,37%", "align": WD_ALIGN_PARAGRAPH.CENTER}],
                [{"text": "Subtotal Biaya Dasar Proyek", "bold": True, "row_bg": HEX_LIGHT_SLATE}, {"text": "Total Biaya Langsung", "bold": True}, {"text": "Rp 135.000.000", "align": WD_ALIGN_PARAGRAPH.RIGHT, "bold": True}, {"text": "90,91%", "align": WD_ALIGN_PARAGRAPH.CENTER, "bold": True}],
                [{"text": "Cadangan Risiko (<i>Risk Contingency Reserve</i>)"}, {"text": "10% dari Subtotal Biaya Dasar"}, {"text": "Rp 13.500.000", "align": WD_ALIGN_PARAGRAPH.RIGHT}, {"text": "9,09%", "align": WD_ALIGN_PARAGRAPH.CENTER}],
                [{"text": "TOTAL ANGGARAN DISETUJUI SPONSOR", "bold": True, "row_bg": HEX_LIGHT_SLATE}, {"text": "Plafon Kontrak Maksimal", "bold": True}, {"text": "Rp 148.500.000", "align": WD_ALIGN_PARAGRAPH.RIGHT, "bold": True}, {"text": "100,00%", "align": WD_ALIGN_PARAGRAPH.CENTER, "bold": True}],
            ],
            col_widths_cm=[5.35, 6.15, 3.25, 1.65],
            font_size_pt=9.8,
            pad_tb_twips=42,
        )

        self.add_h1("8. Daftar Stakeholder Kunci", space_before=6.0)
        self.add_p("Identifikasi pemangku kepentingan (Proses 13.1 PMBOK 6) mencakup kelompok utama dari sisi klien, tim pelaksana, pengguna platform, penyedia layanan pihak ketiga, dan penilai mutu akademik:")
        self.add_bullets([
            "Pihak Klien (PT Kreasi Tiga Dimensi Indonesia): Ir. Hendra Wijaya, S.T., M.B.A. (<i>Executive Sponsor</i>) dan Rina Kusumawardhani, S.Ds., M.M. (<i>On-Site Customer</i> / Perwakilan Pengguna).",
            "Pihak Pelaksana (PT Schryzon Digital Nusantara): I Nyoman Widiyasa Jayananda (Project Manager / Backend Lead), I Kadek Mahesa Permana Putra (Frontend / UI-UX / QA Lead), Abdurrahman Karim (Integration Lead), dan Fido Priasa Setyono Putra (Business Analyst).",
            "Pengguna Ekosistem & Pengawas Akademik: Kreator 3D (<i>Artists</i>), Pembeli (<i>End Customers</i>), Mitra Jasa Cetak 3D (<i>Print Providers</i>), Administrator Platform, Vendor Pembayaran/AI (Midtrans, Google Cloud), serta Dosen Pengampu PPL Universitas Mataram (Santi Ika Murpratiwi, S.Kom., M.T.).",
        ], space_after=1.5)
        self.add_p("Detail lengkap <i>Stakeholder Register</i> dan pemetaan <i>Power/Interest Grid</i> dilampirkan pada Lampiran B.")

        self.add_h1("9. Persyaratan Persetujuan Proyek (<i>Project Approval Requirements</i>)", space_before=6.0)
        self.add_p("Setiap keluaran rilis dan produk akhir wajib memenuhi prosedur persetujuan berjenjang berikut:")
        self.add_numbered_list([
            "Kriteria Kelayakan Fitur (<i>Definition of Done</i>): Fitur dinyatakan tuntas apabila seluruh alur berjalan sesuai kebutuhan bisnis, pengendalian hak akses antarperan terverifikasi, antarmuka bebas galat tampilan, dan lolos peninjauan sejawat tim.",
            "Demo Rilis Berkala: Pada pencapaian Milestone M1 s.d. M4, tim pengembang mendemonstrasikan fitur fungsional langsung kepada Ibu Rina Kusumawardhani untuk memperoleh persetujuan inkremental.",
            "Pengujian Akhir (UAT) & BAST: Persetujuan akhir ditandai oleh kelulusan 100% skenario UAT oleh perwakilan pengguna (Pembeli, Kreator, Mitra Cetak, Admin) serta penandatanganan Berita Acara Serah Terima (BAST) oleh Sponsor.",
        ], space_after=2.0)

        # Sections 10, 11, 12 (Page 14)
        self.add_h1("10. Kriteria Keluar (<i>Project Exit Criteria</i>)", page_break_before=True, space_before=0.0)
        self.add_bullets([
            "Penyelesaian Normal (<i>Normal Project Closure</i>): Seluruh serahan D1 s.d. D5 telah diserahkan, 100% uji UAT dinyatakan lulus tanpa cacat kritis, sistem aktif beroperasi pada infrastruktur produksi klien, repositori kode serta manual diserahkan, dan BAST ditandatangani kedua pihak.",
            "Penghentian Dini (<i>Early Termination Criteria</i>): Proyek dapat dihentikan sebelum jadwal apabila: (1) Sponsor menerbitkan pembatalan tertulis akibat perubahan arah bisnis; (2) kondisi kahar (<i>force majeure</i>) berkepanjangan menghalangi pengerjaan; atau (3) proyeksi biaya melebihi Rp 148.500.000 tanpa persetujuan addendum anggaran dari Sponsor.",
        ], space_after=1.5)

        self.add_h1("11. Project Manager: Penunjukan, Tanggung Jawab, dan Wewenang", space_before=5.0)
        self.add_p("Melalui dokumen ini, manajemen kedua pihak secara resmi menunjuk:", space_after=2.0)
        self.add_p("I Nyoman Widiyasa Jayananda (F1D02410053)", align=WD_ALIGN_PARAGRAPH.CENTER, space_after=0.5)
        self.add_p("<i>Project Manager & Lead Architect</i>, PT Schryzon Digital Nusantara", align=WD_ALIGN_PARAGRAPH.CENTER, space_after=3.0)
        self.add_p(
            "Tanggung Jawab Utama: Memimpin perencanaan iterasi XP/PXP, mengoordinasikan pembagian tugas harian tim pengembang, mengawasi kepatuhan arsitektur dan keamanan sistem, memantau risiko maupun jadwal, serta menyampaikan laporan kemajuan berkala kepada Sponsor.",
            space_after=2.5,
        )
        self.add_p("Tingkat Wewenang yang Diberikan:", space_after=1.5)
        self.add_numbered_list([
            "Mengatur penugasan harian, jadwal iterasi 2 mingguan, dan prioritas teknis tim sesuai kebutuhan yang disepakati bersama perwakilan pengguna.",
            "Mengelola anggaran operasional dalam batas Rp 135.000.000 biaya dasar serta mengajukan pencairan cadangan risiko hingga Rp 13.500.000 dengan persetujuan Sponsor untuk mitigasi risiko.",
            "Menetapkan keputusan rancangan sistem, standar mutu pengujian, serta penguncian perubahan fitur (<i>feature freeze</i>) menjelang tenggat Hari ke-106.",
        ], space_after=1.5)

        self.add_h1("12. Nama, Wewenang Sponsor, dan Lembar Pengesahan Resmi", space_before=5.0)
        self.add_p(
            "Sponsor Eksekutif Proyek: Ir. Hendra Wijaya, S.T., M.B.A. (Direktur Utama PT Kreasi Tiga Dimensi Indonesia), didampingi oleh Rina Kusumawardhani, S.Ds., M.M. selaku perwakilan pengguna harian (<i>On-Site Customer</i>).",
            space_after=2.5,
        )
        self.add_p(
            "Wewenang Sponsor: Mengesahkan Project Charter v1.0, menyetujui anggaran kontrak Rp 148.500.000, memutuskan perubahan ruang lingkup (<i>Change Request</i>) atau penghentian proyek, menugaskan perwakilan pengguna dalam UAT, serta menandatangani penerimaan akhir hasil proyek.",
            space_after=4.0,
        )
        self.add_styled_table(
            headers=["Peran Penandatangan", "Nama Lengkap", "Jabatan / Institusi", "Tanda Tangan"],
            rows=[
                [{"text": "Executive Project Sponsor"}, {"text": "Ir. Hendra Wijaya, S.T., M.B.A."}, {"text": "Direktur Utama, PT Kreasi Tiga Dimensi Indonesia"}, {"text": ""}],
                [{"text": "On-Site Customer / PO"}, {"text": "Rina Kusumawardhani, S.Ds., M.M."}, {"text": "<i>VP Operations</i>, PT Kreasi Tiga Dimensi Indonesia"}, {"text": ""}],
                [{"text": "Project Manager"}, {"text": "I Nyoman Widiyasa Jayananda"}, {"text": "Project Manager, PT Schryzon Digital Nusantara"}, {"text": ""}],
            ],
            col_widths_cm=[3.9, 3.8, 6.2, 2.5],
            font_size_pt=9.8,
            pad_tb_twips=36,
            min_row_height_cm=0.95,
            space_after_pt=4.0,
        )

        # Mengetahui lecturer acknowledgement block
        self.add_p("Mengetahui,", align=WD_ALIGN_PARAGRAPH.CENTER, size_pt=10.0, space_before=2.0, space_after=0.5)
        self.add_p("Dosen Pengampu Mata Kuliah Proyek Perangkat Lunak", align=WD_ALIGN_PARAGRAPH.CENTER, size_pt=10.0, space_after=18.0)
        self.add_p("<u>Santi Ika Murpratiwi, S.Kom., M.T.</u>", align=WD_ALIGN_PARAGRAPH.CENTER, size_pt=10.0, space_after=6.0)

        # Catatan Tata Kelola shaded notice box
        self.add_styled_table(
            headers=None,
            rows=[[
                {
                    "text": "<b>Catatan Tata Kelola & Hak Kepemilikan Intelektual:</b> Dokumen ini disahkan sebagai acuan dasar lingkup, jadwal, dan anggaran proyek 3D\u0113x v1.0. Setiap permohonan perubahan cakupan fitur setelah pengesahan wajib melalui mekanisme perubahan tertulis dengan persetujuan Executive Project Sponsor dan Project Manager. Seluruh kode sumber dan aset rekayasa bersifat tertutup milik PT Kreasi Tiga Dimensi Indonesia.",
                    "bg": HEX_LIGHT_SLATE,
                    "size": 8.8,
                }
            ]],
            col_widths_cm=[TEXT_WIDTH_CM],
            pad_tb_twips=52,
            pad_lr_twips=90,
            space_after_pt=0.0,
        )

    def build_appendices(self) -> None:
        """Build Appendices A-D (Pages 15-22)."""
        # Lampiran A (Pages 15-16)
        self.add_h1("A. Sketsa Antarmuka Awal Platform 3D\u0113x", page_break_before=True, space_before=0.0)
        self.add_p(
            "Sketsa dan gambaran awal di bawah ini menunjukkan rencana tampilan utama platform 3D\u0113x yang akan dikembangkan dan divalidasi secara bertahap. Detail tata letak dan fitur antarmuka dapat disesuaikan berdasarkan umpan balik perwakilan pengguna pada setiap sesi demo iterasi."
        )
        self.add_centered_image(self.assets["fig_3_landing"], width_cm=13.5, space_before=2.0, space_after=2.0)
        self.add_caption("Gambar 3: Sketsa Halaman Utama dan Navigasi Pilar Katalog 3D\u0113x", space_after=4.0)

        self.add_centered_image(self.assets["fig_4_viewer"], width_cm=13.5, space_before=2.0, space_after=2.0)
        self.add_caption("Gambar 4: Sketsa Halaman Detail Aset, Penampil Geometri 3D Interaktif, dan Asisten D\u0113xie", space_after=2.0)

        self.add_centered_image(self.assets["fig_5_cart"], width_cm=13.5, space_before=0.0, space_after=2.0, page_break_before=True)
        self.add_caption("Gambar 5: Sketsa Halaman Keranjang Belanja dan Ringkasan Pembayaran Terintegrasi Midtrans", space_after=6.0)

        self.add_centered_image(self.assets["fig_6_wireframe"], width_cm=14.4, space_before=2.0, space_after=2.0)
        self.add_caption("Gambar 6: Sketsa Rancangan Antarmuka Pemesanan Cetak 3D, Estimasi Dimensi, dan Perlindungan Escrow", space_after=2.0)

        # Lampiran B (Pages 17-18)
        self.add_h1("B. Stakeholder Register (Proses 13.1) dan Power/Interest Grid", page_break_before=True, space_before=0.0)
        self.add_h2("B.1 Stakeholder Register", space_before=4.0)
        self.add_p(
            "Berikut pemetaan peran, kepentingan utama, tingkat kekuasaan/ketertarikan (<i>Power/Interest</i>), serta strategi keterlibatan pemangku kepentingan sesuai PMBOK<sup>\u00ae</sup> Guide Edisi 6:",
            keep_with_next=True,
        )
        self.add_caption("Tabel 7: Stakeholder Register Proyek Platform 3D\u0113x", keep_with_next=True)
        self.add_styled_table(
            headers=["Stakeholder", "Peran dalam Proyek", "Kepentingan Utama", "Power / Interest", "Strategi Keterlibatan"],
            rows=[
                [{"text": "Ir. Hendra Wijaya (Krea3D Corp)"}, {"text": "Pemilik Perusahaan & <i>Executive Sponsor</i>"}, {"text": "Pertumbuhan bisnis, ROI komersial, kendali jadwal & biaya"}, {"text": "Tinggi / Tinggi", "align": WD_ALIGN_PARAGRAPH.CENTER}, {"text": "<i>Manage Closely:</i> Libatkan pada pengesahan charter, perubahan lingkup, dan BAST."}],
                [{"text": "Rina Kusumawardhani (Krea3D Corp)"}, {"text": "<i>On-Site Customer</i> & Perwakilan Pengguna"}, {"text": "Alur beli dan cetak 3D lancar, kemudahan operasional harian"}, {"text": "Tinggi / Tinggi", "align": WD_ALIGN_PARAGRAPH.CENTER}, {"text": "<i>Manage Closely:</i> Hadir di setiap sesi perencanaan, demo dua mingguan, dan UAT."}],
                [{"text": "Tim Pengembang 3D\u0113x (PT SDN, 4 Orang)"}, {"text": "Pelaksana Proyek (PM, FE, BE, Integrasi, BA)"}, {"text": "Kebutuhan jelas, pembagian modul teratur, selesai Hari ke-106"}, {"text": "Sedang / Tinggi", "align": WD_ALIGN_PARAGRAPH.CENTER}, {"text": "<i>Keep Informed</i> / Kolaborasi Inti: Sinkronisasi rutin, telaah silang, dan uji berkala."}],
                [{"text": "Dosen Pengampu PPL (Santi Ika Murpratiwi)"}, {"text": "Pembimbing & Penilai Kaidah Manajemen"}, {"text": "Kepatuhan proses PMBOK 6, iterasi XP/PXP, kelengkapan charter"}, {"text": "Tinggi / Sedang", "align": WD_ALIGN_PARAGRAPH.CENTER}, {"text": "<i>Keep Satisfied:</i> Penyampaian draf charter dan laporan kemajuan milestone berkala."}],
                [{"text": "3D Digital Artists"}, {"text": "Kreator Pemasok Aset Digital"}, {"text": "Pembagian komisi adil, perlindungan lisensi, laporan penjualan jelas"}, {"text": "Rendah / Tinggi", "align": WD_ALIGN_PARAGRAPH.CENTER}, {"text": "<i>Keep Informed:</i> Libatkan pada uji coba UAT fitur unggah aset dan dasbor kreator."}],
                [{"text": "3D Print Providers"}, {"text": "Mitra Penyedia Jasa Cetak Fisik"}, {"text": "Detail ukuran akurat, antrean order tertata, jaminan <i>escrow</i>"}, {"text": "Rendah / Tinggi", "align": WD_ALIGN_PARAGRAPH.CENTER}, {"text": "<i>Keep Informed:</i> Libatkan pada uji coba dasbor mitra cetak dan input resi."}],
                [{"text": "End Customers"}, {"text": "Pembeli Aset & Pemesan Cetak Fisik"}, {"text": "Inspeksi 3D mulus, transaksi aman (<i>escrow</i>), pencarian akurat"}, {"text": "Rendah / Sedang", "align": WD_ALIGN_PARAGRAPH.CENTER}, {"text": "<i>Monitor:</i> Pemantauan umpan balik uji beta dan kecepatan muat katalog."}],
                [{"text": "Administrator Platform"}, {"text": "Pengelola Moderasi & Keamanan"}, {"text": "Alat peninjauan konten proaktif dan catatan audit lengkap"}, {"text": "Sedang / Sedang", "align": WD_ALIGN_PARAGRAPH.CENTER}, {"text": "<i>Keep Informed:</i> Pelatihan khusus moderasi dan penanganan laporan sebelum rilis."}],
                [{"text": "Vendor Pihak Ketiga (Midtrans, Google)"}, {"text": "Penyedia Pembayaran, AI & Infrastruktur"}, {"text": "Kestabilan layanan, keamanan transaksi, ketersediaan kuota"}, {"text": "Tinggi / Rendah", "align": WD_ALIGN_PARAGRAPH.CENTER}, {"text": "<i>Keep Satisfied / Monitor:</i> Pemantauan status layanan dan kepatuhan SLA vendor."}],
            ],
            col_widths_cm=[2.7, 2.7, 3.6, 1.9, 5.5],
            font_size_pt=8.8,
            pad_tb_twips=36,
        )

        # Page 18: Power / Interest Grid & Tabel 8
        h_b2 = self.add_h2("B.2 Power / Interest Grid dan Strategi Komunikasi", space_before=0.0)
        h_b2.paragraph_format.page_break_before = True
        self.add_centered_image(self.assets["fig_7_power_grid"], width_cm=14.8, space_before=2.0, space_after=2.0)
        self.add_caption("Gambar 7: Pemetaan Stakeholder pada Power / Interest Grid", space_after=6.0)
        self.add_caption("Tabel 8: Ringkasan Frekuensi dan Kanal Komunikasi Pemangku Kepentingan", keep_with_next=True)
        self.add_styled_table(
            headers=["Kuadran Strategis", "Frekuensi", "Kanal & Artefak Komunikasi Utama"],
            rows=[
                [{"text": "Manage Closely"}, {"text": "Mingguan / Per Fase"}, {"text": "Rapat perencanaan, demo rilis dua mingguan, persetujuan perubahan, dan BAST."}],
                [{"text": "Keep Satisfied"}, {"text": "Per Milestone (M1 s.d. M5)"}, {"text": "Penyampaian Project Charter, laporan kemajuan fase, pemantauan kuota vendor."}],
                [{"text": "Keep Informed"}, {"text": "Rutin / Pra-Rilis"}, {"text": "Sinkronisasi harian tim pengembang dan undangan uji coba UAT mitra sebelum rilis."}],
                [{"text": "Monitor"}, {"text": "Berkala / Pasca-Rilis"}, {"text": "Survei umpan balik uji beta, peninjauan laporan penyalahgunaan, catatan audit sistem."}],
            ],
            col_widths_cm=[3.6, 3.0, 9.8],
            font_size_pt=9.8,
            pad_tb_twips=48,
        )

        # Lampiran C (Pages 19-20)
        self.add_h1("C. Jadwal Milestone, Rencana Iterasi, dan Estimasi Anggaran PERT", page_break_before=True, space_before=0.0)
        self.add_h2("C.1 Siklus Hidup Hybrid (XP / PXP) dan Bagan Gantt 15 Minggu", space_before=4.0)
        self.add_p(
            "Proyek menerapkan pendekatan Hybrid: inisiasi kontrak, batas lingkup, risiko, dan plafon biaya Rp 148.500.000 dikunci secara formal pada awal proyek, sedangkan eksekusi fitur berjalan menggunakan iterasi <i>Agile Extreme Programming (XP)</i> dan siklus mandiri <i>Personal Extreme Programming (PXP)</i> dalam lima fase rilis (106 hari kalender)."
        )
        self.add_centered_image(self.assets["fig_8_gantt"], width_cm=15.8, space_before=2.0, space_after=2.0)
        self.add_caption("Gambar 8: Bagan Gantt Jadwal Milestone 15 Minggu (106 Hari Kalender)", space_after=4.0)

        self.add_h2("C.2 Rencana Iterasi Mingguan dan Alokasi Usaha Epik Utama (106 Person-Days)")
        self.add_caption("Tabel 9: Rencana Iterasi XP dan Ringkasan Kebutuhan Pengguna per Fase", keep_with_next=True)
        self.add_styled_table(
            headers=["Minggu", "Fase / Iterasi", "Fokus Epik & Kebutuhan Pengguna", "Peran Terkait", "Est. (Pd)"],
            rows=[
                [{"text": "1 s.d. 3", "align": WD_ALIGN_PARAGRAPH.CENTER}, {"text": "Fase 1: Inisiasi & Fondasi"}, {"text": "Pengesahan charter, sketsa antarmuka, registrasi, login, dan pengaturan peran akses"}, {"text": "Seluruh Aktor"}, {"text": "11", "align": WD_ALIGN_PARAGRAPH.CENTER}],
                [{"text": "4 s.d. 7", "align": WD_ALIGN_PARAGRAPH.CENTER}, {"text": "Fase 2: Rilis 1 (<i>Marketplace</i>)"}, {"text": "Katalog publik, penampil 3D interaktif, unggah aset kreator, keranjang, checkout Midtrans, unduhan aman"}, {"text": "Guest, Customer, Artist, Admin"}, {"text": "35", "align": WD_ALIGN_PARAGRAPH.CENTER}],
                [{"text": "8 s.d. 10", "align": WD_ALIGN_PARAGRAPH.CENTER}, {"text": "Fase 3: Rilis 2 (Komunitas)"}, {"text": "Lini masa portofolio kreator, fitur ikuti, ulasan pembeli terverifikasi, koleksi, notifikasi"}, {"text": "Customer, Artist"}, {"text": "21", "align": WD_ALIGN_PARAGRAPH.CENTER}],
                [{"text": "11 s.d. 13", "align": WD_ALIGN_PARAGRAPH.CENTER}, {"text": "Fase 4: Rilis 3 (AI & Cetak 3D)"}, {"text": "Pencarian dan rekomendasi cerdas AI D\u0113xie, pesan cetak 3D (<i>bounding-box</i>), <i>escrow</i> saldo, dasbor mitra"}, {"text": "Customer, Print Provider"}, {"text": "27", "align": WD_ALIGN_PARAGRAPH.CENTER}],
                [{"text": "14 s.d. 15", "align": WD_ALIGN_PARAGRAPH.CENTER}, {"text": "Fase 5: Pengujian Final & Rilis"}, {"text": "Dasbor analitik admin, verifikasi mitra, catatan audit, uji UAT 100%, manual, pelatihan, serah terima"}, {"text": "Admin, Tim Sistem, Klien"}, {"text": "12", "align": WD_ALIGN_PARAGRAPH.CENTER}],
                [{"text": "Total Akumulasi Usaha Pengembangan Efektif (5 Fase, Tim Paruh Waktu)", "align": WD_ALIGN_PARAGRAPH.RIGHT, "bold": True, "colspan": 4, "bg": HEX_LIGHT_SLATE}, {"text": "106", "align": WD_ALIGN_PARAGRAPH.CENTER, "bold": True, "bg": HEX_LIGHT_SLATE}],
            ],
            col_widths_cm=[1.85, 3.25, 6.05, 3.65, 1.60],
            font_size_pt=9.6,
            pad_tb_twips=42,
        )

        # Page 20: C.3 PERT & Budget Composition
        h_c3 = self.add_h2("C.3 Perhitungan Metode Three-Point (PERT), Parametric, dan Komposisi Biaya", space_before=0.0)
        h_c3.paragraph_format.page_break_before = True
        self.add_p(
            "Estimasi biaya tenaga rekayasa dihitung secara objektif menggunakan metode <i>Three-Point Estimation (PERT)</i> (<omath>PERT_E</omath> dan simpangan baku <omath>PERT_SIGMA</omath>) yang dikalikan dengan tarif rekayasa komersial Rp 1.000.000 per <i>person-day</i>.",
            space_after=4.0,
        )
        self.add_p(
            "Klarifikasi Basis Kapasitas Usaha (106 <i>Person-Days</i> vs. 106 Hari Kalender): Angka 106 <i>person-days</i> merupakan akumulasi estimasi usaha efektif tim pengembang mahasiswa (4 personil) yang bekerja secara terdistribusi dan paruh waktu (<i>part-time</i> sekitar 15 hingga 20 jam per minggu per personil) sepanjang rentang 106 hari kalender proyek (15 minggu), bukan proyeksi kapasitas kerja penuh waktu (<i>full-time</i>) 4 orang secara simultan.",
            space_after=4.0,
        )
        self.add_caption("Tabel 10: Perhitungan Usaha dan Biaya Pengembangan Menggunakan Metode PERT", keep_with_next=True)
        self.add_styled_table(
            headers=["Fase / Modul Pengembangan", "<i>O</i>", "<i>M</i>", "<i>P</i>", "<i>E</i> (Pd)", "<i>\u03c3</i>", "Biaya (Parametric)"],
            rows=[
                [{"text": "Fase 1: Fondasi, Akun & Akses"}, {"text": "8", "align": WD_ALIGN_PARAGRAPH.CENTER}, {"text": "11", "align": WD_ALIGN_PARAGRAPH.CENTER}, {"text": "14", "align": WD_ALIGN_PARAGRAPH.CENTER}, {"text": "11,0", "align": WD_ALIGN_PARAGRAPH.CENTER}, {"text": "1,00", "align": WD_ALIGN_PARAGRAPH.CENTER}, {"text": "Rp 11.000.000", "align": WD_ALIGN_PARAGRAPH.RIGHT}],
                [{"text": "Fase 2: Katalog 3D & Pembayaran"}, {"text": "28", "align": WD_ALIGN_PARAGRAPH.CENTER}, {"text": "35", "align": WD_ALIGN_PARAGRAPH.CENTER}, {"text": "42", "align": WD_ALIGN_PARAGRAPH.CENTER}, {"text": "35,0", "align": WD_ALIGN_PARAGRAPH.CENTER}, {"text": "2,33", "align": WD_ALIGN_PARAGRAPH.CENTER}, {"text": "Rp 35.000.000", "align": WD_ALIGN_PARAGRAPH.RIGHT}],
                [{"text": "Fase 3: Komunitas & Fitur Sosial"}, {"text": "16", "align": WD_ALIGN_PARAGRAPH.CENTER}, {"text": "21", "align": WD_ALIGN_PARAGRAPH.CENTER}, {"text": "26", "align": WD_ALIGN_PARAGRAPH.CENTER}, {"text": "21,0", "align": WD_ALIGN_PARAGRAPH.CENTER}, {"text": "1,67", "align": WD_ALIGN_PARAGRAPH.CENTER}, {"text": "Rp 21.000.000", "align": WD_ALIGN_PARAGRAPH.RIGHT}],
                [{"text": "Fase 4: Asisten AI & Cetak 3D"}, {"text": "20", "align": WD_ALIGN_PARAGRAPH.CENTER}, {"text": "27", "align": WD_ALIGN_PARAGRAPH.CENTER}, {"text": "34", "align": WD_ALIGN_PARAGRAPH.CENTER}, {"text": "27,0", "align": WD_ALIGN_PARAGRAPH.CENTER}, {"text": "2,33", "align": WD_ALIGN_PARAGRAPH.CENTER}, {"text": "Rp 27.000.000", "align": WD_ALIGN_PARAGRAPH.RIGHT}],
                [{"text": "Fase 5: Admin, Uji UAT & Serah Terima"}, {"text": "9", "align": WD_ALIGN_PARAGRAPH.CENTER}, {"text": "12", "align": WD_ALIGN_PARAGRAPH.CENTER}, {"text": "15", "align": WD_ALIGN_PARAGRAPH.CENTER}, {"text": "12,0", "align": WD_ALIGN_PARAGRAPH.CENTER}, {"text": "1,00", "align": WD_ALIGN_PARAGRAPH.CENTER}, {"text": "Rp 12.000.000", "align": WD_ALIGN_PARAGRAPH.RIGHT}],
                [{"text": "Total Usaha Rekayasa (PERT)", "bold": True, "row_bg": HEX_LIGHT_SLATE}, {"text": "81", "align": WD_ALIGN_PARAGRAPH.CENTER, "bold": True}, {"text": "106", "align": WD_ALIGN_PARAGRAPH.CENTER, "bold": True}, {"text": "131", "align": WD_ALIGN_PARAGRAPH.CENTER, "bold": True}, {"text": "106,0", "align": WD_ALIGN_PARAGRAPH.CENTER, "bold": True}, {"text": "8,33", "align": WD_ALIGN_PARAGRAPH.CENTER, "bold": True}, {"text": "Rp 106.000.000", "align": WD_ALIGN_PARAGRAPH.RIGHT, "bold": True}],
            ],
            col_widths_cm=[7.9, 0.9, 0.9, 0.9, 1.6, 1.1, 3.1],
            font_size_pt=9.3,
            pad_tb_twips=32,
            space_after_pt=4.0,
        )

        self.add_caption("Tabel 11: Rincian Komponen Anggaran Proyek 3D\u0113x (Disetujui Sponsor)", keep_with_next=True)
        self.add_styled_table(
            headers=["Komponen Biaya", "Keterangan Rincian", "Nilai (IDR)", "Porsi"],
            rows=[
                [{"text": "1. Tenaga Pengembang Perangkat Lunak"}, {"text": "106 <i>person-days</i> \u00d7 Rp 1.000.000 (4 Personil Paruh Waktu)"}, {"text": "Rp 106.000.000", "align": WD_ALIGN_PARAGRAPH.RIGHT}, {"text": "71,38%", "align": WD_ALIGN_PARAGRAPH.CENTER}],
                [{"text": "2. Infrastruktur Cloud & Layanan API"}, {"text": "Hosting Server, Penyimpanan Aset 12 Bulan, SSL, Kuota AI & Midtrans"}, {"text": "Rp 16.500.000", "align": WD_ALIGN_PARAGRAPH.RIGHT}, {"text": "11,11%", "align": WD_ALIGN_PARAGRAPH.CENTER}],
                [{"text": "3. Desain Antarmuka, 3D & Uji Mutu"}, {"text": "Paket Desain Tema Gelap, Uji Penampil 3D & Uji Regresi"}, {"text": "Rp 7.500.000", "align": WD_ALIGN_PARAGRAPH.RIGHT}, {"text": "5,05%", "align": WD_ALIGN_PARAGRAPH.CENTER}],
                [{"text": "4. Dokumentasi, Pelatihan & UAT"}, {"text": "Manual Pengguna/Admin, BAST, dan Sesi Pelatihan Staf Krea3D"}, {"text": "Rp 5.000.000", "align": WD_ALIGN_PARAGRAPH.RIGHT}, {"text": "3,37%", "align": WD_ALIGN_PARAGRAPH.CENTER}],
                [{"text": "Subtotal Biaya Dasar", "bold": True, "row_bg": HEX_LIGHT_SLATE}, {"text": "Total Pengeluaran Terencana", "bold": True}, {"text": "Rp 135.000.000", "align": WD_ALIGN_PARAGRAPH.RIGHT, "bold": True}, {"text": "90,91%", "align": WD_ALIGN_PARAGRAPH.CENTER, "bold": True}],
                [{"text": "5. Cadangan Risiko (<i>Risk Contingency</i>)"}, {"text": "10% dari Subtotal untuk Mitigasi Risiko R-01 s.d. R-07"}, {"text": "Rp 13.500.000", "align": WD_ALIGN_PARAGRAPH.RIGHT}, {"text": "9,09%", "align": WD_ALIGN_PARAGRAPH.CENTER}],
                [{"text": "TOTAL ANGGARAN DISETUJUI", "bold": True, "row_bg": HEX_LIGHT_SLATE}, {"text": "Kontrak Tetap PT Kreasi Tiga Dimensi Indonesia", "bold": True}, {"text": "Rp 148.500.000", "align": WD_ALIGN_PARAGRAPH.RIGHT, "bold": True}, {"text": "100,00%", "align": WD_ALIGN_PARAGRAPH.CENTER, "bold": True}],
            ],
            col_widths_cm=[5.1, 6.6, 3.1, 1.6],
            font_size_pt=9.3,
            pad_tb_twips=32,
            space_after_pt=4.0,
        )

        self.add_centered_image(self.assets["fig_9_budget_bar"], width_cm=14.5, space_before=1.0, space_after=1.5)
        self.add_caption("Gambar 9: Komposisi Anggaran Proyek Komersial 3D\u0113x", space_after=0.0)

        # Lampiran D (Pages 21-22)
        self.add_h1("D. Daftar Resource (Tim, Peran XP & Sarana) serta Matriks RACI", page_break_before=True, space_before=0.0)
        self.add_h2("D.1 Tim Proyek dan Pemetaan Peran Extreme Programming (XP)", space_before=4.0)
        self.add_caption("Tabel 12: Daftar Personil Tim Inti, Peran XP, dan Tanggung Jawab", keep_with_next=True)
        self.add_styled_table(
            headers=["Nama Personil", "NIM / ID", "Peran XP", "Domain Tanggung Jawab Utama"],
            rows=[
                [{"text": "I Nyoman Widiyasa Jayananda"}, {"text": "F1D02410053", "align": WD_ALIGN_PARAGRAPH.CENTER}, {"text": "PM / Tracker & Programmer"}, {"text": "Koordinasi iterasi, layanan backend, basis data terpusat, penyimpanan aset 3D, asisten AI D\u0113xie, dan tata kelola rilis."}],
                [{"text": "I Kadek Mahesa Permana Putra"}, {"text": "F1D02410052", "align": WD_ALIGN_PARAGRAPH.CENTER}, {"text": "Programmer & Tester (QA Lead)"}, {"text": "Antarmuka halaman web, sistem tema gelap, penampil model 3D interaktif, dan pengujian kualitas UAT/performa."}],
                [{"text": "Abdurrahman Karim"}, {"text": "F1D02410031", "align": WD_ALIGN_PARAGRAPH.CENTER}, {"text": "Programmer"}, {"text": "Integrasi data antarmuka ke backend, alur login Google, pembayaran Midtrans, layanan cetak 3D (<i>escrow</i>), dan notifikasi."}],
                [{"text": "Fido Priasa Setyono Putra"}, {"text": "F1D02410048", "align": WD_ALIGN_PARAGRAPH.CENTER}, {"text": "Customer Liaison / Analyst"}, {"text": "Analisis kebutuhan bisnis klien, penyusunan dokumentasi Charter/UML, koordinasi uji coba pengguna, dan pelatihan klien."}],
                [{"text": "Rina Kusumawardhani (Krea3D Corp)"}, {"text": "KREA3D-PO", "align": WD_ALIGN_PARAGRAPH.CENTER}, {"text": "On-Site Customer"}, {"text": "Penentuan prioritas fitur tiap rilis, peninjauan demo dua mingguan, dan persetujuan akhir UAT."}],
            ],
            col_widths_cm=[4.25, 2.50, 3.20, 6.45],
            font_size_pt=10.0,
            pad_tb_twips=45,
        )

        self.add_h2("D.2 Daftar Sarana Perangkat Keras, Perangkat Lunak, dan Infrastruktur")
        self.add_bullets([
            "Perangkat Keras Tim Pengembang: 4 unit laptop/workstation pengembangan berprosesor multi-core (RAM 16 hingga 32 GB, dukungan grafis 3D WebGL) untuk pengerjaan dan uji tampilan model.",
            "Perangkat Lunak & Alat Kolaborasi: Editor pengkodean terpadu, repositori Git bersama untuk pengendalian versi kode, lingkungan runtime web dan basis data lokal, serta alat penyusunan dokumen resmi.",
            "Infrastruktur Pengujian & Produksi: Server cloud produksi untuk layanan web, penyimpanan berkas 3D, serta akun uji dan produksi untuk gerbang pembayaran Midtrans dan layanan AI Google.",
        ])

        self.add_h2("D.3 Matriks Tanggung Jawab (RACI Matrix)")
        self.add_p(
            "Keterangan peran RACI: <b>R</b> = <i>Responsible</i> (Pelaksana), <b>A</b> = <i>Accountable</i> (Pemegang Akuntabilitas Tunggal per Aktivitas), <b>C</b> = <i>Consulted</i> (Dimintai Masukan), <b>I</b> = <i>Informed</i> (Diinformasikan). Setiap baris aktivitas menetapkan tepat satu pemegang <b>A</b> murni tanpa pencampuran <i>A/R</i>."
        )

        self.add_caption("Tabel 13: Matriks RACI untuk Aktivitas Utama Proyek 3D\u0113x", keep_with_next=True, page_break_before=True)
        # Note: put page_break_before on caption above Tabel 13 cleanly!
        raci_data = [
            ("1. Penyusunan Project Charter v1.0", "<b>A</b>", "C", "C", "R", "C"),
            ("2. Penulisan & Prioritas Kebutuhan Fitur", "R", "C", "C", "R", "<b>A</b>"),
            ("3. Perancangan Basis Data & Struktur Sistem", "<b>A</b>", "I", "R", "C", "I"),
            ("4. Pengembangan Layanan Backend Inti", "<b>A</b>", "C", "R", "I", "I"),
            ("5. Desain Antarmuka & Penampil 3D Web", "C", "<b>A</b>", "R", "I", "C"),
            ("6. Pengelolaan Akun, Login Google & Akses Peran", "<b>A</b>", "I", "R", "I", "I"),
            ("7. Integrasi Pembayaran Midtrans", "<b>A</b>", "I", "R", "I", "C"),
            ("8. Penyimpanan & Pengunduhan Berkas 3D", "<b>A</b>", "I", "R", "I", "I"),
            ("9. Pencarian Cerdas & Asisten AI D\u0113xie", "<b>A</b>", "R", "I", "I", "C"),
            ("10. Alur Cetak 3D (<i>Escrow</i>) & Dasbor Mitra", "<b>A</b>", "C", "R", "C", "C"),
            ("11. Lini Masa Komunitas, Ulasan & Notifikasi", "<b>A</b>", "C", "R", "I", "I"),
            ("12. Dasbor Admin, Moderasi & Catatan Audit", "<b>A</b>", "C", "R", "C", "I"),
            ("13. Pengujian Regresi, Performa & UAT", "C", "<b>A</b>", "R", "R", "C"),
            ("14. Demo Rilis, Pelatihan & Serah Terima Akhir", "<b>A</b>", "R", "R", "R", "C / Approver"),
        ]
        raci_rows = []
        for act, j, m, k, f, r in raci_data:
            raci_rows.append([
                {"text": act},
                {"text": j, "align": WD_ALIGN_PARAGRAPH.CENTER},
                {"text": m, "align": WD_ALIGN_PARAGRAPH.CENTER},
                {"text": k, "align": WD_ALIGN_PARAGRAPH.CENTER},
                {"text": f, "align": WD_ALIGN_PARAGRAPH.CENTER},
                {"text": r, "align": WD_ALIGN_PARAGRAPH.CENTER},
            ])
        self.add_styled_table(
            headers=["Aktivitas / Domain Proyek", "Jay\n(PM/BE)", "Mahesa\n(FE/QA)", "Karim\n(Integ.)", "Fido\n(BA/Doc)", "Rina (Cust.)"],
            rows=raci_rows,
            col_widths_cm=[7.55, 1.60, 1.65, 1.60, 1.65, 2.35],
            font_size_pt=9.2,
            pad_tb_twips=42,
            space_after_pt=0.0,
        )

    def save(self, out_path: Path) -> None:
        out_path.parent.mkdir(parents=True, exist_ok=True)
        self.doc.save(str(out_path))


# ==============================================================================
# WORD COM SEEDING & FINALIZATION PIPELINE
# ==============================================================================
def create_word_native_seed(seed_path: Path) -> None:
    """Create a fresh Word 16.0 native blank seed with CompatibilityMode=15 and numbering.xml."""
    seed_path.parent.mkdir(parents=True, exist_ok=True)
    word = win32.Dispatch("Word.Application")
    word.Visible = False
    word.DisplayAlerts = 0
    try:
        doc = word.Documents.Add()
        # Trigger Word to emit native numbering.xml & List Paragraph structures cleanly
        doc.Content.Text = "seed"
        doc.Content.ListFormat.ApplyBulletDefault()
        doc.SaveAs2(str(seed_path.resolve()), FileFormat=16)
        doc.Close(False)
    finally:
        word.Quit()
    time.sleep(0.2)


def finalize_with_word_com(primary_docx: Path, verify_pdf: Path) -> int:
    """Update all TOC/PAGE fields via Word COM, verify CompatibilityMode, and export PDF."""
    word = win32.Dispatch("Word.Application")
    word.Visible = False
    word.DisplayAlerts = 0
    try:
        doc = word.Documents.Open(str(primary_docx.resolve()))
        compat_mode = int(doc.CompatibilityMode)
        if compat_mode < 15:
            doc.Convert()
            compat_mode = int(doc.CompatibilityMode)

        doc.Repaginate()
        for toc in doc.TablesOfContents:
            toc.Update()

        # Apply exact TOC 1 / TOC 2 native styling via Word built-in style IDs (-20, -21)
        toc1 = doc.Styles(-20)
        toc1.Font.Name = "Times New Roman"
        toc1.Font.Size = 11
        toc1.Font.Bold = True
        toc1.ParagraphFormat.FirstLineIndent = 0
        toc1.ParagraphFormat.LeftIndent = 0
        toc1.ParagraphFormat.SpaceBefore = 3.5
        toc1.ParagraphFormat.SpaceAfter = 1.0

        toc2 = doc.Styles(-21)
        toc2.Font.Name = "Times New Roman"
        toc2.Font.Size = 11
        toc2.Font.Bold = False
        toc2.ParagraphFormat.FirstLineIndent = 0
        toc2.ParagraphFormat.LeftIndent = 16  # ~0.56 cm indent
        toc2.ParagraphFormat.SpaceBefore = 0.5
        toc2.ParagraphFormat.SpaceAfter = 0.5

        for toc in doc.TablesOfContents:
            toc.Update()
        doc.Fields.Update()
        for sec in doc.Sections:
            for hdr in sec.Headers:
                hdr.Range.Fields.Update()
            for ftr in sec.Footers:
                ftr.Range.Fields.Update()
        doc.Repaginate()
        doc.SaveAs2(str(primary_docx.resolve()), FileFormat=16)
        doc.ExportAsFixedFormat(
            OutputFileName=str(verify_pdf.resolve()),
            ExportFormat=17,  # wdExportFormatPDF
            OpenAfterExport=False,
            OptimizeFor=0,
        )
        doc.Close(False)
    finally:
        word.Quit()
    return compat_mode


def main() -> None:
    print("[*] Stage 1: Compiling standalone TikZ & UI browser assets via XeLaTeX...")
    compiler = Standalone_Asset_Compiler(TEX_SOURCE_PATH, ASSET_CACHE_DIR)
    assets = compiler.build_all()
    print(f"    Compiled {len(assets)} visual assets cleanly.")

    print("[*] Stage 2: Creating native Microsoft Word 16.0 seed (CompatibilityMode=15)...")
    create_word_native_seed(SEED_DOCX_PATH)

    print("[*] Stage 3: Building 1:1 Project Charter DOCX...")
    builder = Charter_Docx_Builder(SEED_DOCX_PATH, assets)
    builder.build_cover_letter()
    builder.build_document_info_and_toc()
    builder.build_sections_1_to_12()
    builder.build_appendices()

    primary_docx = OUTPUT_DOCX_PATHS[0]
    builder.save(primary_docx)

    print("[*] Stage 4: Finalizing TOC, Page Fields, and PDF Verification via Word COM...")
    compat_mode = finalize_with_word_com(primary_docx, VERIFY_PDF_PATH)
    shutil.copy2(primary_docx, OUTPUT_DOCX_PATHS[1])

    print(f"[+] Done! CompatibilityMode={compat_mode}")
    for out_p in OUTPUT_DOCX_PATHS:
        print(f"    Exported: {out_p}")
    print(f"    Word verify PDF: {VERIFY_PDF_PATH}")


if __name__ == "__main__":
    main()
