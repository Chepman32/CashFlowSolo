import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: { translation: {
    common: { cancel: 'Cancel', back: 'Back', save: 'Save', add: 'Add' },
    settings: { title: 'Settings', base_currency: 'Base currency', theme: 'Theme', language: 'Language', pro: 'Pro', enabled: 'Enabled', free: 'Free', passcode: 'Passcode', upgrade: 'Upgrade to Pro' },
    theme: { system: 'System', light: 'Light', dark: 'Dark' },
    picker: { categoryPicker: 'Category Picker', type: 'Type', search: 'Search categories...', addNew: 'Add New Category' },
    addTx: { title: 'Add Transaction', amount: 'Amount', note: 'Note', attachments: 'Attachments' },
    attachments: { add: 'Add', mediaLibrary: 'Media Library', files: 'Files' },
  }},
  ru: { translation: {
    common: { cancel: 'Отмена', back: 'Назад', save: 'Сохранить', add: 'Добавить' },
    settings: { title: 'Настройки', base_currency: 'Базовая валюта', theme: 'Тема', language: 'Язык', pro: 'Про', enabled: 'Включено', free: 'Бесплатно', passcode: 'Код-пароль', upgrade: 'Перейти на Про' },
    theme: { system: 'Система', light: 'Светлая', dark: 'Темная' },
    picker: { categoryPicker: 'Выбор категории', type: 'Тип', search: 'Поиск категорий...', addNew: 'Новая категория' },
    addTx: { title: 'Добавить транзакцию', amount: 'Сумма', note: 'Заметка', attachments: 'Вложения' },
    attachments: { add: 'Добавить', mediaLibrary: 'Медиатека', files: 'Файлы' },
  }},
  es: { translation: {
    common: { cancel: 'Cancelar', back: 'Atrás', save: 'Guardar', add: 'Añadir' },
    settings: { title: 'Ajustes', base_currency: 'Moneda base', theme: 'Tema', language: 'Idioma', pro: 'Pro', enabled: 'Activado', free: 'Gratis', passcode: 'Código', upgrade: 'Mejorar a Pro' },
    theme: { system: 'Sistema', light: 'Claro', dark: 'Oscuro' },
    picker: { categoryPicker: 'Selector de categoría', type: 'Tipo', search: 'Buscar categorías...', addNew: 'Nueva categoría' },
    addTx: { title: 'Añadir transacción', amount: 'Cantidad', note: 'Nota', attachments: 'Adjuntos' },
    attachments: { add: 'Añadir', mediaLibrary: 'Fotos', files: 'Archivos' },
  }},
  fr: { translation: {
    common: { cancel: 'Annuler', back: 'Retour', save: 'Enregistrer', add: 'Ajouter' },
    settings: { title: 'Paramètres', base_currency: 'Devise de base', theme: 'Thème', language: 'Langue', pro: 'Pro', enabled: 'Activé', free: 'Gratuit', passcode: 'Code secret', upgrade: 'Passer en Pro' },
    theme: { system: 'Système', light: 'Clair', dark: 'Sombre' },
    picker: { categoryPicker: 'Sélecteur de catégorie', type: 'Type', search: 'Rechercher des catégories...', addNew: 'Nouvelle catégorie' },
    addTx: { title: 'Ajouter une transaction', amount: 'Montant', note: 'Note', attachments: 'Pièces jointes' },
    attachments: { add: 'Ajouter', mediaLibrary: 'Photos', files: 'Fichiers' },
  }},
  de: { translation: {
    common: { cancel: 'Abbrechen', back: 'Zurück', save: 'Speichern', add: 'Hinzufügen' },
    settings: { title: 'Einstellungen', base_currency: 'Basiswährung', theme: 'Thema', language: 'Sprache', pro: 'Pro', enabled: 'Aktiviert', free: 'Kostenlos', passcode: 'Passcode', upgrade: 'Auf Pro upgraden' },
    theme: { system: 'System', light: 'Hell', dark: 'Dunkel' },
    picker: { categoryPicker: 'Kategorieauswahl', type: 'Typ', search: 'Kategorien suchen...', addNew: 'Neue Kategorie' },
    addTx: { title: 'Transaktion hinzufügen', amount: 'Betrag', note: 'Notiz', attachments: 'Anhänge' },
    attachments: { add: 'Hinzufügen', mediaLibrary: 'Fotos', files: 'Dateien' },
  }},
  zh: { translation: {
    common: { cancel: '取消', back: '返回', save: '保存', add: '添加' },
    settings: { title: '设置', base_currency: '基础货币', theme: '主题', language: '语言', pro: '专业版', enabled: '已启用', free: '免费', passcode: '密码', upgrade: '升级到专业版' },
    theme: { system: '系统', light: '浅色', dark: '深色' },
    picker: { categoryPicker: '类别选择', type: '类型', search: '搜索类别...', addNew: '新类别' },
    addTx: { title: '添加交易', amount: '金额', note: '备注', attachments: '附件' },
    attachments: { add: '添加', mediaLibrary: '照片', files: '文件' },
  }},
  ja: { translation: {
    common: { cancel: 'キャンセル', back: '戻る', save: '保存', add: '追加' },
    settings: { title: '設定', base_currency: '基本通貨', theme: 'テーマ', language: '言語', pro: 'プロ', enabled: '有効', free: '無料', passcode: 'パスコード', upgrade: 'プロにアップグレード' },
    theme: { system: 'システム', light: 'ライト', dark: 'ダーク' },
    picker: { categoryPicker: 'カテゴリ選択', type: '種類', search: 'カテゴリを検索...', addNew: '新しいカテゴリ' },
    addTx: { title: '取引を追加', amount: '金額', note: 'メモ', attachments: '添付' },
    attachments: { add: '追加', mediaLibrary: '写真', files: 'ファイル' },
  }},
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  compatibilityJSON: 'v4',
  interpolation: { escapeValue: false },
});

export default i18n;
