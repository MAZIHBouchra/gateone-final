import json

path = '/home/nouhayla/Desktop/stage/gateone-deploy/notebooks/ventes/appartement_vente_cleaning.ipynb'
with open(path, 'r', encoding='utf-8') as f:
    nb = json.load(f)

for cell in nb.get('cells', []):
    if cell['cell_type'] == 'code':
        source = "".join(cell.get('source', []))
        if 'OneHotEncoder(handle_unknown="ignore"' in source:
            new_source = source.replace('OneHotEncoder(handle_unknown="ignore", sparse_output=False)', 'ce.TargetEncoder()')
            new_source = new_source.replace('preprocessor.fit(X_train)', 'preprocessor.fit(X_train, y_train)')
            new_source = 'import category_encoders as ce\n' + new_source
            cell['source'] = [line + '\n' for line in new_source.split('\n')[:-1]]
        elif 'study.optimize(objective, n_trials=100' in source:
            new_source = source.replace('n_trials=100', 'n_trials=300')
            cell['source'] = [line + '\n' for line in new_source.split('\n')[:-1]]
    elif cell['cell_type'] == 'markdown':
        source = "".join(cell.get('source', []))
        if '~3 minutes pour 100 trials' in source:
            new_source = source.replace('~3 minutes pour 100 trials', '~10 minutes pour 300 trials')
            cell['source'] = [line + '\n' for line in new_source.split('\n')[:-1]]

with open(path, 'w', encoding='utf-8') as f:
    json.dump(nb, f, indent=1)

print("Notebook modified successfully.")
