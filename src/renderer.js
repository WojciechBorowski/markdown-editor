const editor = document.getElementById('editor');
const preview = document.getElementById('preview');

const selectDirectoryButton = document.getElementById('select-directory');
const createNewFileButton = document.getElementById('create-new-file');
const saveFileButton = document.getElementById('save-file');
const editFileButton = document.getElementById('edit-file');

const fileListElement = document.getElementById('file-list');
const fileInfoElement = document.getElementById('file-info');

const currentDirectoryElement = document.getElementById('current-directory');

let currentDirectory = '';
let currentFilePath = '';

function updatePreview() {
  const markdownText = editor.value;
  preview.innerHTML = marked.marked(markdownText); 
}

function updateFileInfo() {
  if (currentFilePath) {
    fileInfoElement.innerText = `Edytujesz: ${currentFilePath}`;
  } else {
    fileInfoElement.innerText = 'Tworzysz nowy plik';
  }
}

editor.addEventListener('input', updatePreview);

const script = document.createElement('script');
script.src = 'https://cdn.jsdelivr.net/npm/marked/marked.min.js';
document.head.appendChild(script);

async function selectDirectory() {
  try {
    const directory = await window.electronAPI.selectDirectory();
    if (directory) {
      currentDirectory = directory;
      currentDirectoryElement.innerText = directory;
      loadFileList(directory);
    }
  } catch (error) {
    console.error('Błąd podczas wyboru katalogu:', error);
  }
}

function createNewFile() {
  editor.value = '';
  preview.innerHTML = '';
  currentFilePath = '';
  updateFileInfo(); 
  saveFileButton.style.display = 'block';
  editFileButton.style.display = 'none';
}

async function saveFile() {
  try {
    if (editor.value.trim() === '') {
      alert('Edytor jest pusty. Wprowadź tekst przed zapisaniem.');
      return;
    }

    let filePath = currentFilePath;
    if (!filePath) {
      filePath = await window.electronAPI.showSaveDialog();
      if (!filePath) {
        alert('Nie wybrano ścieżki do zapisania pliku.');
        return;
      }
    }

    const content = editor.value;
    if (typeof content !== 'string') {
      throw new Error('Content must be a string');
    }

    const saveData = { filePath, content };

    await window.electronAPI.saveFile(saveData);
    alert('Plik zapisany pomyślnie.');
    saveFileButton.style.display = 'none'; 
    editFileButton.style.display = 'block'; 
    loadFileList(currentDirectory);
    updateFileInfo(); 
  } catch (error) {
    console.error('Błąd podczas zapisywania pliku:', error);
    alert('Wystąpił błąd podczas zapisywania pliku.');
  }
}

async function loadFileList(directory) {
  try {
    const files = await window.electronAPI.listFiles(directory);
    fileListElement.innerHTML = '';
    files.forEach(file => {
      const fileElement = document.createElement('div');
      fileElement.className = 'file-item';
      fileElement.innerText = file;
      fileElement.onclick = () => loadFile(`${directory}/${file}`);
      fileListElement.appendChild(fileElement);
    });
  } catch (error) {
    console.error('Błąd podczas ładowania listy plików:', error);
  }
}

async function loadFile(filePath) {
  try {
    const result = await window.electronAPI.readFile(filePath);
    editor.value = result.content;
    updatePreview();
    currentFilePath = filePath;
    updateFileInfo(); 
    saveFileButton.style.display = 'none'; 
    editFileButton.style.display = 'block'; 
    editor.disabled = true; 
  } catch (error) {
    console.error('Błąd podczas ładowania pliku:', error);
  }
}

function enableEditing() {
  editor.disabled = false;
  saveFileButton.style.display = 'block'; 
  editFileButton.style.display = 'none'; 
}

selectDirectoryButton.addEventListener('click', selectDirectory);
saveFileButton.addEventListener('click', saveFile);
editFileButton.addEventListener('click', enableEditing);
createNewFileButton.addEventListener('click', createNewFile);