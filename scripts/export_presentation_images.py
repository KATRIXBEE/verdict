import os
import win32com.client

pptx_path = os.path.abspath(r"VERDICT_SIH2026_Official.pptx")
pdf_path = os.path.abspath(r"VERDICT_SIH2026_Official.pdf")
output_dir = os.path.abspath(r"reports\sih_slides")

os.makedirs(output_dir, exist_ok=True)

print(f"Opening PowerPoint to export: {pptx_path}")
ppt_app = win32com.client.Dispatch("PowerPoint.Application")

try:
    pres = ppt_app.Presentations.Open(pptx_path, WithWindow=False)
    print(f"Opened presentation with {pres.Slides.Count} slides.")
    
    # Save as PDF (Format type 32 = ppSaveAsPDF)
    pres.SaveAs(pdf_path, 32)
    print(f"Saved PDF to: {pdf_path}")
    
    # Export each slide as PNG image
    for i, slide in enumerate(pres.Slides):
        img_path = os.path.join(output_dir, f"slide_{i+1}.png")
        # Export(Path, FilterName, ScaleWidth, ScaleHeight)
        slide.Export(img_path, "PNG", 1920, 1080)
        print(f"Exported Slide {i+1} to: {img_path}")
        
    pres.Close()
finally:
    ppt_app.Quit()

print("All slide images exported successfully!")
