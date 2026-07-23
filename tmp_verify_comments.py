from pathlib import Path
import json

root = Path(r'C:\Users\anika_tywp\OneDrive\Desktop\Anika_Teja_Reddy_Work\Vpe\ViralPe_epics_n_stories')
ignore_dirs = {'.git', '.venv', 'node_modules', 'target', 'build', 'dist', 'out', '__pycache__', '.idea', '.vscode', 'tmp_docx_extract'}
text_extensions = {
    '.java', '.kt', '.scala', '.groovy', '.js', '.jsx', '.ts', '.tsx', '.c', '.cpp', '.h', '.hpp', '.cs', '.php', '.go', '.rs', '.swift', '.sql', '.ps1', '.sh', '.bat', '.cmd', '.py', '.rb', '.gradle', '.toml', '.cfg', '.conf', '.ini', '.env', '.gitignore', '.dockerignore', '.mvnw', '.editorconfig', '.props', '.targets', '.sln', '.csproj', '.fsproj', '.vbproj', '.xaml', '.puml', '.html', '.xml', '.md', '.css', '.scss', '.less', '.vue', '.yml', '.yaml', '.properties', '.txt', '.csv', '.log', '.json'
}
comment_text = ''
files = []
for path in root.rglob('*'):
    if not path.is_file():
        continue
    if any(part in ignore_dirs for part in path.parts):
        continue
    if path.suffix.lower() not in text_extensions and path.name not in {'Dockerfile', 'Makefile', 'Procfile', 'README', 'LICENSE'}:
        continue
    try:
        with path.open('rb') as fh:
            chunk = fh.read(4096)
        if b'\x00' in chunk:
            continue
    except Exception:
        continue
    files.append(path)

with_comment = []
missing = []
for path in files:
    try:
        txt = path.read_text(encoding='utf-8')
    except Exception:
        try:
            txt = path.read_text(encoding='latin-1')
        except Exception:
            continue
    if comment_text in txt:
        with_comment.append(path)
    else:
        missing.append(path)

print('files_scanned', len(files))
print('with_comment', len(with_comment))
print('missing', len(missing))
for path in missing[:200]:
    print(path)
