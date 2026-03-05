from pyvi import ViUtils

def restore_accent(text):
    try:
        return ViUtils.add_accents(text)
    except:
        return text