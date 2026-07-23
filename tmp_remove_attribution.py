from pathlib import Path

files = [
    'answer.md', 'apply_attribution.py', 'ARCHITECTURE.md', 'backend_steps.md',
    'Epics_And_Stories_paragraphs.txt', 'Epics_And_Stories.docx', 'Epics_And_Stories.txt',
    'IMPLEMENTATION_STEPS.md', 'requirements.md', 'summary.md',
    'tmp_add_comment.py', 'tmp_add_comment2.py', 'tmp_extract.ps1', 'tmp_fix_json.py',
    'tmp_parse_docx.ps1', 'tmp_verify_comments.py'
]
removed = []
skipped = []
for rel in files:
    path = Path(rel)
    if not path.exists():
        skipped.append((rel, 'missing'))
        continue
    if path.suffix.lower() == '.docx':
        skipped.append((rel, 'binary/docx'))
        continue
    try:
        text = path.read_text(encoding='utf-8')
    except UnicodeDecodeError:
        text = path.read_text(encoding='latin-1')
    orig = text
    text = text.replace('developed by anika teja reddy', '')
    text = text.replace('"developedBy":"anika teja reddy"', '"developedBy":""')
    text = text.replace('"comment":"developed by anika teja reddy"', '"comment":""')
    lines = [
        line for line in text.splitlines()
        if line.strip() not in {
            '//', '#', '<!--', '-->', '<!-- developed by anika teja reddy -->', 'developed by anika teja reddy'
        }
    ]
    new_text = '\n'.join(lines)
    if text.endswith('\n') and not new_text.endswith('\n'):
        new_text += '\n'
    if new_text != orig:
        path.write_text(new_text, encoding='utf-8')
        removed.append(rel)

print('removed', len(removed))
for r in removed:
    print(r)
print('skipped', len(skipped))
for rel, reason in skipped:
    print(rel, reason)
