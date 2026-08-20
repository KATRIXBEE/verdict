"""
ECI Affidavit (Form 26) PDF Parser
Extracts candidate assets, liabilities, education, criminal cases, and PAN declaration status.
"""

import re
import os
import tempfile
from pathlib import Path
from typing import Dict, Any, Optional, List
import httpx
import pdfplumber
from utils.logger import log_event
from .ipc_translator import translate_ipc_section


def clean_currency_str(val_str: str) -> Optional[int]:
    """
    Cleans raw currency string like 'Rs. 1,45,00,000 /-', '14500000', 'Nil', 'None' to integer.
    """
    if not val_str:
        return None
    val_clean = val_str.upper().strip()
    if "NIL" in val_clean or "NONE" in val_clean or "ZERO" in val_clean or val_clean == "-":
        return 0
    # Remove Rs, INR, commas, whitespace, trailing /-
    cleaned = re.sub(r"[^\d]", "", val_str)
    if cleaned:
        try:
            return int(cleaned)
        except ValueError:
            return None
    return None


class ECIAffidavitParser:
    """
    Parses Election Commission of India (ECI) Form 26 candidate affidavit PDFs.
    """

    def __init__(self, timeout_seconds: int = 30):
        self.timeout_seconds = timeout_seconds

    async def download_pdf(self, url: str) -> Optional[str]:
        """
        Downloads a remote PDF file to a temporary location.
        """
        try:
            async with httpx.AsyncClient(timeout=self.timeout_seconds, follow_redirects=True) as client:
                resp = await client.get(url)
                if resp.status_code == 200 and len(resp.content) > 1000:
                    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
                        tmp.write(resp.content)
                        return tmp.name
        except Exception as e:
            log_event("eci_pdf_parser", f"Failed to download PDF from {url}", level="ERROR", error=str(e), url=url)
        return None

    def parse_pdf(self, pdf_path_or_url: str) -> Dict[str, Any]:
        """
        Parses an ECI Form 26 PDF document.
        """
        is_temp = False
        target_path = pdf_path_or_url

        # Check if local or needs download
        if pdf_path_or_url.startswith("http://") or pdf_path_or_url.startswith("https://"):
            import asyncio
            downloaded = asyncio.run(self.download_pdf(pdf_path_or_url))
            if not downloaded:
                return {"success": False, "error": "Download failed", "requires_ocr": False}
            target_path = downloaded
            is_temp = True

        result: Dict[str, Any] = {
            "success": True,
            "education": None,
            "profession": None,
            "movable_assets": None,
            "immovable_assets": None,
            "total_assets": None,
            "total_liabilities": None,
            "pan_number_declared": False,
            "criminal_cases": [],
            "requires_ocr": False,
            "pages_parsed": 0,
        }

        try:
            full_text = ""
            with pdfplumber.open(target_path) as pdf:
                result["pages_parsed"] = len(pdf.pages)
                for page in pdf.pages:
                    text = page.extract_text()
                    if text:
                        full_text += "\n" + text

            if len(full_text.strip()) < 100:
                # Scanned image document requiring OCR
                result["requires_ocr"] = True
                log_event("eci_pdf_parser", f"PDF at {pdf_path_or_url} contains no selectable text (requires OCR)", level="WARNING")
                return result

            # 1. Extract Education
            edu_match = re.search(
                r"(?:Highest Educational Qualification|Educational Qualification|Education)[:\s\-]+([^\n\r]+)",
                full_text,
                re.IGNORECASE,
            )
            if edu_match:
                result["education"] = edu_match.group(1).strip()

            # 2. Extract Profession / Occupation
            prof_match = re.search(
                r"(?:Profession|Occupation|Source of Income)[:\s\-]+([^\n\r]+)",
                full_text,
                re.IGNORECASE,
            )
            if prof_match:
                result["profession"] = prof_match.group(1).strip()

            # 3. Extract Movable Assets
            mov_match = re.search(
                r"(?:Total\s*\(A\)|Gross Total Value of Movable Assets|Total Movable)[:\s\-RsINR\.]*([\d,]+(?:\s*/-)?)",
                full_text,
                re.IGNORECASE,
            )
            if mov_match:
                result["movable_assets"] = clean_currency_str(mov_match.group(1))

            # 4. Extract Immovable Assets
            immov_match = re.search(
                r"(?:Total\s*\(B\)|Total Current Market Value of Immovable Assets|Total Immovable)[:\s\-RsINR\.]*([\d,]+(?:\s*/-)?)",
                full_text,
                re.IGNORECASE,
            )
            if immov_match:
                result["immovable_assets"] = clean_currency_str(immov_match.group(1))

            # 5. Extract Grand Total Assets
            tot_match = re.search(
                r"(?:Grand Total\s*\(A\+B\)|Grand Total Value|Total Assets)[:\s\-RsINR\.]*([\d,]+(?:\s*/-)?)",
                full_text,
                re.IGNORECASE,
            )
            if tot_match:
                result["total_assets"] = clean_currency_str(tot_match.group(1))
            elif result["movable_assets"] is not None and result["immovable_assets"] is not None:
                result["total_assets"] = result["movable_assets"] + result["immovable_assets"]

            # 6. Extract Liabilities
            liab_match = re.search(
                r"(?:Grand Total of all Government Dues|Total Liabilities|Grand Total of Liabilities)[:\s\-RsINR\.]*([\d,]+(?:\s*/-)?)",
                full_text,
                re.IGNORECASE,
            )
            if liab_match:
                result["total_liabilities"] = clean_currency_str(liab_match.group(1))

            # 7. Extract PAN declared
            pan_match = re.search(r"\bPAN\b|\bPermanent Account Number\b", full_text, re.IGNORECASE)
            if pan_match:
                # Check if marked as Yes / Valid or contains standard pattern
                has_pan = bool(re.search(r"[A-Z]{5}[0-9]{4}[A-Z]", full_text)) or "PAN DECLARED" in full_text.upper() or "YES" in full_text.upper()
                result["pan_number_declared"] = has_pan

            # 8. Extract Criminal Cases
            case_blocks = re.findall(
                r"(?:Case No\.|FIR No\.|Crime No\.)[:\s\-]+([^\n\r]+).*?(?:Section|IPC)[:\s\-]+([^\n\r]+)",
                full_text,
                re.DOTALL | re.IGNORECASE,
            )
            for case_no, raw_sec in case_blocks[:10]:
                trans = translate_ipc_section(raw_sec)
                result["criminal_cases"].append({
                    "case_number": case_no.strip(),
                    "ipc_sections": [trans["section"]],
                    "ipc_plain_english": [trans["plain_english"]],
                    "severity": trans["severity"],
                    "category": trans["category"],
                })

            log_event(
                "eci_pdf_parser",
                f"Parsed ECI affidavit: {result['pages_parsed']} pages, Assets: {result['total_assets']}, Cases: {len(result['criminal_cases'])}",
                level="INFO",
            )
            return result

        except Exception as e:
            log_event("eci_pdf_parser", f"Error parsing PDF {pdf_path_or_url}", level="ERROR", error=str(e))
            result["success"] = False
            result["error"] = str(e)
            return result
        finally:
            if is_temp and os.path.exists(target_path):
                try:
                    os.unlink(target_path)
                except Exception:
                    pass
