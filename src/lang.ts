import { moment } from 'obsidian';

// 1. translation data
const TRANSLATIONS = {
    en: {
        ILLUMINATOR_SETTINGS: "Illuminator Settings",
        THRESHOLD: "Threshold",
        THRESHOLD_DESC: "The brightness level above which pixels are removed, default is 235.",
        AUTO_ILLUMINATE: "Auto-Illumination on Paste",
        AUTO_ILLUMINATE_DESC: "Process images (PNG, JPG, JPEG, WebP) automatically when pasting.",
        DO_TRANSPARENCY: "Remove White Background",
        DO_WEBP: "Convert to WebP",
        DO_BACKUP: "Backup Original File",
        DO_BACKUP_DESC: "Create a copy in the same folder before illumination. Recommended for batch processing.",
        REPORT_TITLE: "✨ Illumination Complete",
        PROCESSED: "images processed",
        ILLUMINATE_ACTION: "Illuminate Image",
        ERROR_SAVE: "Error saving image: ",
        ERROR_UPDATELINS: "Automatic link update failed, check your links manually.",
        ERROR_PROCESS: "Error processing image: ",
        ILLUMINATE_COMMAND: "Illuminate images?",
        WARNING: "Images will be overwritten! To keep the originals, enable 'Backup Original File' in settings.",
        CONFIRM: "Confirm",
        CANCEL: "Cancel",
        ERROR_PROCESS_PASTE: "Error processing pasted image.",
        DO_CHANGE_IMG_NAME: "Rename Pasted Image",
        NAME_IMAGE: "Name your image",
        ENTER_IMAGE_PROMPT: "Enter image name...",
        SAVE_BUTTON: "Save",
        SAME_NAME_NOTICE: "A file with this name already exists.",
        IMAGE_NAME_PATTERN: "Image Name Pattern",
        IMAGE_NAME_PATTERN_DESC: 'Note: Avoid characters like \\ / : * ? " < > |'

    },
    de: {
        ILLUMINATOR_SETTINGS: "Illuminator-Einstellungen",
        THRESHOLD: "  Schwellenwert",
        THRESHOLD_DESC: "Der Helligkeitswert, über dem Pixel entfernt werden. Standard ist 235.",
        AUTO_ILLUMINATE: "Auto-Illumination beim Einfügen",
        AUTO_ILLUMINATE_DESC: "Bilder (PNG, JPG, JPEG, WebP) automatisch beim Einfügen verarbeiten.",
        DO_TRANSPARENCY: "Weißen Hintergrund entfernen",
        DO_WEBP: "In WebP umwandeln",
        DO_BACKUP: "Originaldatei sichern",
        DO_BACKUP_DESC: "Vor der Illumination eine Kopie im selben Ordner anlegen. Für den Batchprozess empfohlen.",
        REPORT_TITLE: "✨ Illumination Complete",
        PROCESSED: "Bilder verarbeitet",
        ILLUMINATE_ACTION: "Bild illuminieren",
        ERROR_SAVE: "Fehler beim Speichern des Bildes: ",
        ERROR_UPDATELINS: "Automatisches Aktualisieren der Links fehlgeschlagen, überprüfen Sie Ihre Links manuell.",
        ERROR_PROCESS: "Fehler beim Verarbeiten des Bildes: ",
        ILLUMINATE_COMMAND: "Bilder illuminieren?",
        WARNING: "Bilder werden überschrieben! Um die Originaldateien zu behalten, aktivieren Sie 'Originaldatei sichern' in den Einstellungen.",
        CONFIRM: "Bestätigen",
        CANCEL: "Abbrechen",
        ERROR_PROCESS_PASTE: "Fehler beim Verarbeiten des eingefügten Bildes.",
        DO_CHANGE_IMG_NAME: "  Bild nach Einfügen umbenennen",
        SAVE_BUTTON: "Speichern",
        SAME_NAME_NOTICE: "Eine Datei mit diesem Namen existiert bereits.",
        IMAGE_NAME_PATTERN: "Namensmuster für Bilder",
        IMAGE_NAME_PATTERN_DESC: 'Hinweis: Vermeiden Sie Zeichen wie \\ / : * ? " < > |'
    },
    zh: {
        ILLUMINATOR_SETTINGS: "Illuminator 设置",
        THRESHOLD: "  阈值",
        THRESHOLD_DESC: "高于该亮度值的像素将被移除，默认值为 235。",
        AUTO_ILLUMINATE: "粘贴时自动处理",
        AUTO_ILLUMINATE_DESC: "粘贴(PNG, JPG, JPEG, WebP)图片时自动处理图像。",
        DO_TRANSPARENCY: "去除白色背景",
        DO_WEBP: "转换为 WebP 格式",
        DO_BACKUP: "备份原始文件",
        DO_BACKUP_DESC: "处理前在同一文件夹中创建副本。推荐用于批量处理。",
        REPORT_TITLE: "✨ 处理完成",
        PROCESSED: "张图片已处理",
        ILLUMINATE_ACTION: "处理图像",
        ERROR_SAVE: "保存图片时出错：",
        ERROR_UPDATELINS: "自动更新链接失败，请手动检查您的链接。",
        ERROR_PROCESS: "处理图片时出错：",
        ILLUMINATE_COMMAND: "处理图像？",
        WARNING: "图片将被覆盖！要保留原始文件，请在设置中启用“备份原始文件”。",
        CONFIRM: "确认",
        CANCEL: "取消",
        ERROR_PROCESS_PASTE: "处理粘贴的图片时出错。",
        DO_CHANGE_IMG_NAME: "  粘贴后重命名图片",
        SAVE_BUTTON: "保存",
        SAME_NAME_NOTICE: "已存在同名文件。",
        IMAGE_NAME_PATTERN: "图片命名模板",
        IMAGE_NAME_PATTERN_DESC: '注意：请避免使用 \\ / : * ? " < > | 等字符'

    }
};

// 2. Logic to decide which language to use
const getLangKey = (): keyof typeof TRANSLATIONS => {
    const locale = (moment.locale() || 'en').toLowerCase();
    // if (locale.startsWith('zh')) return 'zh';
    if (locale === 'zh' || locale.startsWith('zh-cn')) return 'zh';
    if (locale.startsWith('de')) return 'de';
    return 'en';
};

const currentLang = getLangKey();

// 3. Export the STATIC OBJECT
export const t = {
    ...TRANSLATIONS.en,
    ...TRANSLATIONS[currentLang]
};