import json
import os
import subprocess
from pathlib import Path

root = Path(r'C:\Users\anika_tywp\OneDrive\Desktop\Anika_Teja_Reddy_Work\Vpe\ViralPe_epics_n_stories')
comment_text = ''
ignore_dirs = {'.git', '.venv', 'node_modules', 'target', 'build', 'dist', 'out', '__pycache__', '.idea', '.vscode', 'tmp_docx_extract'}
text_extensions = {
    '.java', '.kt', '.scala', '.groovy', '.js', '.jsx', '.ts', '.tsx', '.c', '.cpp', '.h', '.hpp', '.cs', '.php', '.go', '.rs', '.swift', '.sql', '.ps1', '.sh', '.bat', '.cmd', '.py', '.rb', '.gradle', '.toml', '.cfg', '.conf', '.ini', '.env', '.gitignore', '.dockerignore', '.mvnw', '.editorconfig', '.props', '.targets', '.sln', '.csproj', '.fsproj', '.vbproj', '.xaml', '.puml', '.html', '.xml', '.md', '.css', '.scss', '.less', '.vue', '.yml', '.yaml', '.properties', '.txt', '.csv', '.log', '.json', ''
}


def get_comment(path: Path) -> str | None:
    ext = path.suffix.lower()
    if ext in {'.java', '.kt', '.scala', '.groovy', '.js', '.jsx', '.ts', '.tsx', '.c', '.cpp', '.h', '.hpp', '.cs', '.php', '.go', '.rs', '.swift', '.sql'}:
        return '// ' + comment_text
    if ext in {'.ps1', '.sh', '.py', '.rb', '.bat', '.cmd', '.toml', '.cfg', '.conf', '.ini', '.env', '.gitignore', '.dockerignore', '.mvnw', '.editorconfig', '.props', '.targets'}:
        return '# ' + comment_text
    if ext in {'.html', '.xml', '.md', '.css', '.scss', '.less', '.vue'}:
        return '<!-- ' + comment_text + ' -->'
    if ext in {'.yml', '.yaml', '.properties', '.txt', '.csv', '.log'}:
        return '# ' + comment_text
    return None


def is_text(path: Path) -> bool:
    try:
        with path.open('rb') as fh:
            chunk = fh.read(4096)
        return b'\x00' not in chunk
    except Exception:
        return False


files = subprocess.check_output(['git', '-C', str(root), 'ls-files'], text=True).splitlines()
updated = []
for rel in files:
    path = (root / rel).resolve()
    if not path.exists() or not path.is_file():
        continue
    if any(part in ignore_dirs for part in path.parts):
        continue
    if path.suffix.lower() not in text_extensions and path.name not in {'Dockerfile', 'Makefile', 'Procfile', 'README', 'LICENSE'}:
        continue
    if not is_text(path):
        continue

    try:
        with path.open('r', encoding='utf-8') as fh:
            content = fh.read()
    except UnicodeDecodeError:
        with path.open('r', encoding='latin-1') as fh:
            content = fh.read()
    except Exception:
        continue

    if comment_text in content:
        continue

    if path.suffix.lower() == '.json':
        try:
            obj = json.loads(content)
            if isinstance(obj, dict):
                if any(k in {'developedBy', 'comment'} for k in obj.keys()):
                    continue
                items = list(obj.items())
                insert_at = max(1, len(items) // 2)
                ordered_items = list(items[:insert_at]) + [('developedBy', 'anika teja reddy')] + list(items[insert_at:])
                new_obj = dict(ordered_items)
                with path.open('w', encoding='utf-8') as fh:
                    fh.write(json.dumps(new_obj, indent=2) + '\n')
                updated.append(str(path))
        except Exception:
            pass
        continue

    comment = get_comment(path)
    if comment is None:
        continue

    lines = content.splitlines()
    if not lines:
        new_content = comment + '\n'
    else:
        insert_at = max(1, len(lines) // 2)
        lines = lines[:insert_at] + [comment] + lines[insert_at:]
        newline = '\r\n' if '\r\n' in content else '\n'
        new_content = newline.join(lines)
        if content.endswith(('\n', '\r')):
            new_content += newline
    with path.open('w', encoding='utf-8') as fh:
        fh.write(new_content)
    updated.append(str(path))

print(f'updated={len(updated)}')
for p in updated[:100]:
    print(p)
