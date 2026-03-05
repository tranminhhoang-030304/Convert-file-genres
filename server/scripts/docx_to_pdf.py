import sys
import subprocess
import os

input_path = sys.argv[1]
output_path = sys.argv[2]

try:
    # Dùng LibreOffice để convert
    subprocess.run([
        "soffice",
        "--headless",
        "--convert-to",
        "pdf",
        input_path,
        "--outdir",
        os.path.dirname(output_path)
    ], check=True)

    print("DOCX_TO_PDF_SUCCESS")

except Exception as e:
    print("ERROR:", str(e))