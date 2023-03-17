const audioExtensions = [
  '.mp3',
  '.wav',
  '.ogg',
  '.m4a',
  '.flac',
  '.aac',
  '.wma',
  '.alac',
  '.aiff',
  '.dsd',
  '.dsf',
  '.dff',
  '.ape',
  '.mpc',
  '.opus',
  '.webm',
  '.amr',
  '.3gp',
  '.midi',
  '.kar',
  '.wv',
  '.mka',
  '.spx',
  '.tta',
  '.ra',
  '.dts',
  '.ac3',
  '.ec3',
  '.mlp',
  '.m2ts',
  '.mts',
];

const videoExtensions = [
  '.mp4',
  '.avi',
  '.mkv',
  '.mov',
  '.wmv',
  '.flv',
  '.webm',
  '.m4v',
  '.mpeg',
  '.mpg',
  '.3gp',
  '.f4v',
  '.m2v',
  '.m2ts',
  '.mts',
  '.ts',
  '.vob',
];

const documentExtensions = [
  '.pdf',
  '.doc',
  '.docx',
  '.xls',
  '.xlsx',
  '.ppt',
  '.pptx',
  '.txt',
  '.rtf',
  '.csv',
  '.xml',
  '.json',
  '.html',
  '.htm',
  '.md',
];

const imageExtensions = [
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.bmp',
  '.svg',
  '.tif',
  '.tiff',
  '.ico',
];

export type category = 'image' | 'docs' | 'vid' | 'audio';

export interface CategoryExtensions {
  category: category;
  extensions: string[];
}

const categoryExts: CategoryExtensions[] = [
  { category: 'image', extensions: imageExtensions },
  { category: 'docs', extensions: documentExtensions },
  { category: 'vid', extensions: videoExtensions },
  { category: 'audio', extensions: audioExtensions },
];

export default categoryExts;
