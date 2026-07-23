from pathlib import Path
import json

for rel in ['.github/modernize/java-upgrade/hooks/7400bb7b-c295-445d-a613-8b2e1bdbc476.json', 'frontend/package-lock.json']:
    path = Path(r'C:\Users\anika_tywp\OneDrive\Desktop\Anika_Teja_Reddy_Work\Vpe\ViralPe_epics_n_stories') / rel
    print('processing', path)
    text = path.read_text(encoding='utf-8')
    if '' in text:
        print('already has comment')
        continue
    if path.name.endswith('.json'):
        try:
            obj = json.loads(text)
            if isinstance(obj, dict):
                if 'developedBy' not in obj:
                    obj['developedBy'] = 'anika teja reddy'
                    path.write_text(json.dumps(obj, indent=2) + '\n', encoding='utf-8')
                    print('updated dict json')
                else:
                    print('already has developedBy')
            else:
                print('not object')
        except Exception as e:
            # fallback: append a metadata line at start for non-JSON content
            path.write_text('{"developedBy":""}\n' + text, encoding='utf-8')
            print('appended fallback metadata', e)
