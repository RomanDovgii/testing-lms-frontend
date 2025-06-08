const fs = require('fs');
const path = require('path');

let totalLines = 0;

const INCLUDE_DIRS = ['public', 'src', 'components'];
const TEXT_EXTENSIONS = [
  '.js', '.ts', '.jsx', '.tsx', '.json', '.md',
  '.html', '.css', '.scss', '.yml', '.yaml', '.txt',
];

function isTextFile(filePath) {
  return TEXT_EXTENSIONS.includes(path.extname(filePath).toLowerCase());
}

function countLinesInFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return content.split('\n').length;
  } catch (e) {
    console.warn(`Не удалось прочитать файл ${filePath}:`, e.message);
    return 0;
  }
}

function walkDir(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      walkDir(fullPath);
    } else if (entry.isFile() && isTextFile(fullPath)) {
      const lines = countLinesInFile(fullPath);
      console.log(`Файл: ${fullPath} — ${lines} строк`);
      totalLines += lines;
    }
  }
}

for (const dirName of INCLUDE_DIRS) {
  const fullPath = path.resolve(__dirname, dirName);
  if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
    console.log(`\nОбход папки: ${dirName}`);
    walkDir(fullPath);
  } else {
    console.warn(`Папка ${dirName} не найдена, пропускаем`);
  }
}

console.log(`\n🔢 Общее количество строк кода: ${totalLines}`);
