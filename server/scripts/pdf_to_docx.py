import sys
import os
import fitz
from pdf2docx import Converter
from docx import Document
from docx.shared import Pt
from docx.enum.text import WD_ALIGN_PARAGRAPH
import numpy as np
import cv2
import io
from PIL import Image
from paddleocr import PaddleOCR
import re
import unicodedata
from accent_restore import restore_accent
from underthesea import sent_tokenize

print("USING PYTHON:", sys.executable)
print("VERSION:", sys.version)

# INIT OCR (VIETNAMESE MODEL)
ocr = PaddleOCR(
    use_angle_cls=True,
    lang='vi',   
    use_gpu=False,
    show_log=False,
    rec_batch_num=10
)

# Detect PDF type
def detect_pdf_type(file_path):
    doc = fitz.open(file_path)
    total_chars = sum(len(page.get_text("text").strip()) for page in doc)
    doc.close()
    return "scan" if total_chars < 50 else "text"

# TEXT PDF
def convert_text_pdf(input_path, output_path):
    cv = Converter(input_path)
    cv.convert(output_path, start=0, end=None)
    cv.close()

# CLEAN ENGINE 
def clean_text(text):

    text = ''.join(ch for ch in text if unicodedata.category(ch)[0] != 'C')
    text = text.replace('\u200b', '')
    text = unicodedata.normalize("NFKC", text)
    text = unicodedata.normalize("NFC", text)

    text = re.sub(r'\s+', ' ', text)
    text = re.sub(r'\s+([.,:;])', r'\1', text)
    text = re.sub(r'([.,:;])\1+', r'\1', text)

    return text.strip()

# VIETNAMESE REBUILD ENGINE
VIET_FIX_DICT = {
    "Ha Noi": "Hà Nội",
    "Lao dong": "Lao động",
    "Quy dinh": "Quy định",
    "Nghi le": "Nghỉ lễ",
    "Nghi phep": "Nghỉ phép",
    "Cong ty": "Công ty",
    "Nhan vien": "Nhân viên",
    "Chu nghia": "Chủ nghĩa",
    "Viet Nam": "Việt Nam",
    "Dieu": "Điều",
    "Khoan": "Khoản"
}

# LEVEL 10 SPELL CORRECTION ENGINE
VIET_WORDS = set([
    "điều", "khoản", "người", "lao", "động", "công", "ty",
    "quy", "định", "nghỉ", "phép", "việc", "làm", "thời",
    "gian", "quản", "lý", "nhân", "viên", "chính", "sách",
    "hà", "nội", "việt", "nam", "trách", "nhiệm",
    "giám", "đốc", "ban", "bộ", "phận", "trong",
    "theo", "các", "và", "của", "được", "có"
])

def levenshtein(a, b):
    if abs(len(a) - len(b)) > 1:
        return 2
    if a == b:
        return 0

    dp = list(range(len(b) + 1))
    for i in range(1, len(a) + 1):
        prev = dp[0]
        dp[0] = i
        for j in range(1, len(b) + 1):
            temp = dp[j]
            if a[i - 1] == b[j - 1]:
                dp[j] = prev
            else:
                dp[j] = 1 + min(prev, dp[j], dp[j - 1])
            prev = temp
    return dp[-1]

def correct_word(word):

    w = word.lower()

    if w in VIET_WORDS:
        return word

    if not w.isalpha():
        return word

    best = word
    min_dist = 2

    for dict_word in VIET_WORDS:
        dist = levenshtein(w, dict_word)
        if dist < min_dist:
            min_dist = dist
            best = dict_word

    if min_dist <= 1:
        if word[0].isupper():
            return best.capitalize()
        return best

    return word

def spell_correction(text):

    words = text.split()
    corrected = []

    for w in words:
        if w.isupper() and len(w) > 2:
            corrected.append(w)
        else:
            corrected.append(correct_word(w))

    return " ".join(corrected)

def rebuild_vietnamese(text):
    for wrong, correct in VIET_FIX_DICT.items():
        text = re.sub(r'\b' + wrong + r'\b', correct, text, flags=re.IGNORECASE)
    return text

def normalize_vietnamese(text):
    text = clean_text(text)
    text = re.sub(r'([A-Z]+)(\d+)', r'\1 \2', text)
    text = rebuild_vietnamese(text)
    text = spell_correction(text)  
    text = unicodedata.normalize("NFC", text)
    return text.strip()

# SMART CASE RESTORE
def smart_case_restore(text):
    if text.isupper() and len(text) < 150:
        return text.upper()
    return text

def refine_content(text):

    # 1. Chuẩn hóa viết hoa đầu câu
    text = re.sub(r'(^|\.\s+)([a-zà-ỹ])',
                  lambda m: m.group(1) + m.group(2).upper(),
                  text)

    # 2. Thêm dấu chấm nếu câu dài mà không có dấu kết thúc
    if len(text) > 40 and not re.search(r'[.!?]$', text):
        if not re.match(r'^(CHƯƠNG|Điều|\d+\.)', text):
            text += '.'

    # 3. Sửa lỗi OCR phổ biến
    common_ocr_errors = {
        " l ": " 1 ",
        " I ": " 1 ",
        "0ng": "ông",
        "la0": "lao",
        "nghi": "nghỉ",
        "phep": "phép"
    }

    for wrong, correct in common_ocr_errors.items():
        text = text.replace(wrong, correct)

    # 4. Chuẩn hóa khoảng trắng lần cuối
    text = re.sub(r'\s+', ' ', text)

    return text.strip()

# SMART MERGE IMPROVED
def smart_merge_lines(blocks):

    merged = []
    buffer = ""
    last_y = None
    last_h = None

    for b in blocks:

        text = b["text"]
        y = b["y"]
        h = b["h"]

        if not buffer:
            buffer = text
            last_y = y
            last_h = h
            continue

        vertical_gap = abs(y - last_y)

        if vertical_gap < last_h * 0.8:
            buffer += " " + text

        elif not buffer.endswith(('.', ':', ';')) and text[0].islower():
            buffer += " " + text

        else:
            merged.append(buffer)
            buffer = text

        last_y = y
        last_h = h

    if buffer:
        merged.append(buffer)

    return merged

# OCR BLOCK PROCESSING
def process_ocr_blocks(result):
    blocks = []
    for line in result:
        box = line[0]
        text = line[1][0].strip()
        conf = line[1][1]
        if not text or conf < 0.7:
            continue
        x_min = min(p[0] for p in box)
        y_min = min(p[1] for p in box)
        height = max(p[1] for p in box) - y_min
        blocks.append({
            "x": x_min,
            "y": y_min,
            "h": height,
            "text": text
        })
    blocks.sort(key=lambda b: (b["y"], b["x"]))
    return smart_merge_lines(blocks)

# HEADER FILTER
def is_header_or_footer(text):

    if re.search(r'Trang\s*\d+', text):
        return True

    if re.search(r'Page\s*\d+', text, re.IGNORECASE):
        return True

    if len(text) < 5 and text.isdigit():
        return True

    return False

# APPLY STYLING
def apply_styling(p, text):

    run = p.runs[0]
    run.font.name = "Times New Roman"

    p.paragraph_format.first_line_indent = Pt(28)
    p.paragraph_format.space_after = Pt(4)

    if re.match(r'^CHƯƠNG', text, re.IGNORECASE):
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        run.bold = True
        p.paragraph_format.first_line_indent = Pt(0)

    elif re.match(r'^Điều\s+\d+', text, re.IGNORECASE):
        run.bold = True
        p.paragraph_format.first_line_indent = Pt(0)
        p.paragraph_format.space_before = Pt(8)

    elif text.isupper() and len(text) < 120:
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        run.bold = True
        p.paragraph_format.first_line_indent = Pt(0)

# SCAN PDF CONVERSION
def convert_scan_pdf(input_path, output_path):

    doc = fitz.open(input_path)
    document = Document()

    style = document.styles['Normal']
    style.font.name = 'Times New Roman'
    style.font.size = Pt(14)

    previous_line = None

    for page in doc:

        mat = fitz.Matrix(4, 4)   # tăng DPI từ 3x lên 4x
        pix = page.get_pixmap(matrix=mat)

        img = Image.open(io.BytesIO(pix.tobytes("png")))
        img = np.array(img)

        if img.shape[2] == 4:
            img = cv2.cvtColor(img, cv2.COLOR_BGRA2BGR)

        # ===== PREPROCESS IMAGE =====
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        blur = cv2.GaussianBlur(gray, (5, 5), 0)
        _, thresh = cv2.threshold(
            blur, 0, 255,
            cv2.THRESH_BINARY + cv2.THRESH_OTSU
        )

        # OCR trên ảnh đã xử lý
        result = ocr.ocr(thresh, cls=True)

        if not result or not result[0]:
            continue

        paragraphs = process_ocr_blocks(result[0])

        for text in paragraphs:
            text = clean_text(text)

            original_text = text   # lưu lại bản gốc

            text = restore_accent(text)
            text = rebuild_vietnamese(text)
            text = refine_content(text)

            # khôi phục HOA nếu ban đầu là HOA
            if original_text.isupper():
                text = text.upper()
            if is_header_or_footer(text):
                continue
            if text == previous_line:
                continue
            previous_line = text
            p = document.add_paragraph(text)
            apply_styling(p, text)

    doc.close()
    document.save(output_path)

# MAIN
if __name__ == "__main__":

    if len(sys.argv) < 3:
        print("INVALID_ARGUMENTS")
        sys.exit(1)

    input_path = sys.argv[1]
    output_path = sys.argv[2]
    force_ocr = sys.argv[3].lower() if len(sys.argv) > 3 else "false"

    if not os.path.exists(input_path):
        print("INPUT_FILE_NOT_FOUND")
        sys.exit(1)

    pdf_type = detect_pdf_type(input_path)

    if pdf_type == "scan" and force_ocr == "false":
        print("SCAN_PDF_DETECTED")
        sys.exit(0)

    if pdf_type == "text":
        convert_text_pdf(input_path, output_path)
        print("TEXT_CONVERT_SUCCESS")
    else:
        convert_scan_pdf(input_path, output_path)
        print("OCR_CONVERT_SUCCESS")