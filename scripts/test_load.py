import sys
import os
import copy
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN

template_path = r"C:\Users\ASUS\Downloads\SIH2026-IDEA-Presentation-Format.pptx"
prs = Presentation(template_path)
print("Loaded template with", len(prs.slides), "slides")
