import json

path = 'notebooks/ventes/villa_vente_cleaning.ipynb'
with open(path, 'r') as f:
    nb = json.load(f)

for cell in nb['cells']:
    if 'source' in cell:
        src = cell['source']
        for i, line in enumerate(src):
            if 'OneHotEncoder(handle_unknown="ignore", sparse_output=False)' in line:
                src[i] = line.replace('OneHotEncoder(handle_unknown="ignore", sparse_output=False)', 'ce.TargetEncoder()')
            if 'preprocessor.fit(X_train_enc[ALL_FEATURES])' in line:
                src[i] = line.replace('preprocessor.fit(X_train_enc[ALL_FEATURES])', 'preprocessor.fit(X_train_enc[ALL_FEATURES], y_train)')
            if 'n_trials=150' in line:
                src[i] = line.replace('n_trials=150', 'n_trials=300')
            if 'def objective(trial):' in line:
                # Need to inject import category_encoders as ce if not already there
                pass

        # check if 'ce.TargetEncoder()' was added but import is missing
        # We can add the import to the same cell
        content = "".join(src)
        if 'ce.TargetEncoder()' in content and 'import category_encoders as ce' not in content:
            src.insert(0, 'import category_encoders as ce\n')

with open(path, 'w') as f:
    json.dump(nb, f, indent=1)

print("Notebook updated successfully.")
