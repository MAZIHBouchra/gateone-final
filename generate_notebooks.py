import json
import os

def create_notebook(property_type, transaction_type='vente'):
    filename = f"{property_type}_{transaction_type}.csv"
    p_type_clean = property_type.replace("'", "_")
    notebook_name = f"{p_type_clean}_{transaction_type}_cleaning.ipynb"
    
    # Subdirectory based on transaction type
    subdir = 'ventes' if transaction_type == 'vente' else 'locations'
    dest_dir = os.path.join('notebooks', subdir)
    
    if not os.path.exists(dest_dir):
        os.makedirs(dest_dir)
    
    title = f"Data Cleaning - {property_type.capitalize()} {transaction_type.capitalize()} Marrakech"
    # Use ../../ because notebooks are now two levels deep (notebooks/ventes/...)
    # EXTRACTED PATH - NO SPACES
    source_file = f"../../data/marrakech_immo_{transaction_type}_features/{filename}".strip()
    output_file = f"{p_type_clean}_{transaction_type}_cleaned.csv"
    
    if property_type == 'riad':
        load_source = [
            "import pandas as pd\n",
            "import numpy as np\n",
            "import matplotlib.pyplot as plt\n",
            "import seaborn as sns\n",
            "import os\n",
            "\n",
            "# Load multiple files to concatenate\n",
            f"file_paths = [\n",
            f"    '../../data/marrakech_immo_{transaction_type}_features/riad_{transaction_type}.csv',\n",
            f"    '../../data/marrakech_immo_{transaction_type}_features/riad_rénové_{transaction_type}.csv'\n",
            "]\n",
            "dfs = []\n",
            "for fp in file_paths:\n",
            "    if os.path.exists(fp):\n",
            "        dfs.append(pd.read_csv(fp))\n",
            "        print(f\"Successfully loaded {fp}\")\n",
            "    else:\n",
            "        print(f\"WARNING: File not found at {fp}\")\n",
            "\n",
            "if dfs:\n",
            "    df = pd.concat(dfs, ignore_index=True)\n",
            "    print(f\"Merged DataFrame shape: {df.shape}\")\n",
            "    display(df.head())\n",
            "else:\n",
            "    print(\"ERROR: No files were found to load.\")\n"
        ]
    else:
        load_source = [
            "import pandas as pd\n",
            "import numpy as np\n",
            "import matplotlib.pyplot as plt\n",
            "import seaborn as sns\n",
            "import os\n",
            "\n",
            "# File path\n",
            f"file_path = '{source_file}'\n",
            "\n",
            "# Load data\n",
            "if os.path.exists(file_path):\n",
            "    df = pd.read_csv(file_path)\n",
            "    print(f\"Successfully loaded {file_path}\")\n",
            "    display(df.head())\n",
            "else:\n",
            "    print(f\"ERROR: File not found at {file_path}\")\n",
            "    print(f\"Current working directory: {os.getcwd()}\")"
        ]
    
    notebook = {
        "cells": [
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    f"# {title}\n",
                    f"This notebook focuses on cleaning the {property_type} {transaction_type} data for Marrakech."
                ]
            },
            {
                "cell_type": "code",
                "execution_count": None,
                "metadata": {},
                "outputs": [],
                "source": load_source
            },
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    "## 1. Initial Data Overview"
                ]
            },
            {
                "cell_type": "code",
                "execution_count": None,
                "metadata": {},
                "outputs": [],
                "source": [
                    "if 'df' in locals():\n",
                    "    print(\"Shape:\", df.shape)\n",
                    "    df.info()\n",
                    "else:\n",
                    "    print(\"DataFrame 'df' not loaded. Please fix the file path above.\")"
                ]
            },
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    "## 2. Handling Missing Values"
                ]
            },
            {
                "cell_type": "code",
                "execution_count": None,
                "metadata": {},
                "outputs": [],
                "source": [
                    "if 'df' in locals():\n",
                    "    # Checking for null values\n",
                    "    null_counts = df.isnull().sum()\n",
                    "    print(\"Columns with null values before cleaning:\")\n",
                    "    print(null_counts[null_counts > 0])\n",
                    "    \n",
                    "    # 1. Variables numériques : imputation par la médiane\n",
                    "    num_cols_to_fill = ['prix_num', 'surface_num', 'prix_m2', 'prix_m2_median_quartier']\n",
                    "    for col in num_cols_to_fill:\n",
                    "        if col in df.columns:\n",
                    "            df[col] = df[col].fillna(df[col].median())\n",
                    "            \n",
                    "    # 2. Variables catégorielles : imputation par le mode (valeur la plus fréquente)\n",
                    "    cat_cols_mode = ['agence', 'type_bien', 'localisation']\n",
                    "    for col in cat_cols_mode:\n",
                    "        if col in df.columns:\n",
                    "            mode_val = df[col].mode()\n",
                    "            if not mode_val.empty:\n",
                    "                df[col] = df[col].fillna(mode_val[0])\n",
                    "            \n",
                    "    # 3. Champs texte : on met 'Non spécifié'\n",
                    "    text_cols = ['titre', 'description', 'prix', 'surface', 'url']\n",
                    "    for col in text_cols:\n",
                    "        if col in df.columns:\n",
                    "            df[col] = df[col].fillna('Non spécifié')\n",
                    "    \n",
                    f"    if '{property_type}' == 'terrain':\n",
                    "        # 4. Spécifique aux terrains : pas de chambres/sdb\n",
                    "        if 'chambres' in df.columns:\n",
                    "            df['chambres'] = df['chambres'].fillna('0')\n",
                    "        if 'salles_bain' in df.columns:\n",
                    "            df['salles_bain'] = df['salles_bain'].fillna(0.0)\n",
                    "        if 'surface_terrain' in df.columns and 'surface_num' in df.columns:\n",
                    "            df['surface_terrain'] = df['surface_terrain'].fillna(df['surface_num'])\n",
                    "    \n",
                    "    # id: on supprime les lignes sans ID car c'est crucial\n",
                    "    if 'id' in df.columns:\n",
                    "        df.dropna(subset=['id'], inplace=True)\n",
                    "        \n",
                    "    print(\"\\nColumns with null values after cleaning:\")\n",
                    "    print(df.isnull().sum()[df.isnull().sum() > 0])"
                ]
            },
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    "## 3. Removing Duplicates"
                ]
            },
            {
                "cell_type": "code",
                "execution_count": None,
                "metadata": {},
                "outputs": [],
                "source": [
                    "if 'df' in locals():\n",
                    "    initial_size = len(df)\n",
                    "    df = df.drop_duplicates()\n",
                    "    print(f\"Removed {initial_size - len(df)} duplicate rows.\")"
                ]
            },
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    "## 4. Cleaning Numerical Columns\n",
                    "Handling outliers for price and surface."
                ]
            },
            {
                "cell_type": "code",
                "execution_count": None,
                "metadata": {},
                "outputs": [],
                "source": [
                    "if 'df' in locals():\n",
                    "    if 'prix_num' in df.columns:\n",
                    "        q_low = df['prix_num'].quantile(0.01)\n",
                    "        q_hi  = df['prix_num'].quantile(0.99)\n",
                    "        df = df[(df['prix_num'] <= q_hi) & (df['prix_num'] >= q_low)]\n",
                    "        print(f\"Data points after price outlier removal: {len(df)}\")\n",
                    "    \n",
                    "    if 'surface_num' in df.columns:\n",
                    "        q_low_surf = df['surface_num'].quantile(0.01)\n",
                    "        q_hi_surf  = df['surface_num'].quantile(0.99)\n",
                    "        df = df[(df['surface_num'] <= q_hi_surf) & (df['surface_num'] >= q_low_surf)]\n",
                    "        print(f\"Data points after surface outlier removal: {len(df)}\")"
                ]
            },
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    "## 5. Saving Cleaned Data"
                ]
            },
            {
                "cell_type": "code",
                "execution_count": None,
                "metadata": {},
                "outputs": [],
                "source": [
                    "if 'df' in locals():\n",
                    "    output_dir = '../../data/cleaned_data/'\n",
                    "    if not os.path.exists(output_dir):\n",
                    "        os.makedirs(output_dir)\n",
                    "    \n",
                    "    output_file = '" + output_file + "'\n",
                    "    output_path = os.path.join(output_dir, output_file)\n",
                    "    df.to_csv(output_path, index=False)\n",
                    "    print(f\"Cleaned data saved to {output_path}\")"
                ]
            }
        ],
        "metadata": {
            "kernelspec": {
                "display_name": "Python 3",
                "language": "python",
                "name": "python3"
            },
            "language_info": {
                "codemirror_mode": {
                    "name": "ipython",
                    "version": 3
                },
                "file_extension": ".py",
                "mimetype": "text/x-python",
                "name": "python",
                "nbconvert_exporter": "python",
                "pygments_lexer": "ipython3",
                "version": "3.8.10"
            }
        },
        "nbformat": 4,
        "nbformat_minor": 4
    }
    
    with open(os.path.join(dest_dir, notebook_name), 'w', encoding='utf-8') as f:
        json.dump(notebook, f, indent=1, ensure_ascii=False)
    print(f"Created {os.path.join(subdir, notebook_name)}")

# List of property types from the data directories
vente_types = [
    'appartement', 'bureaux', 'commercial', 'duplex', 
    'ferme', 'locaux', "maison_d'hôte", 'maison', 
    'riad', 'studio', 'terrain', 'villa'
]

location_types = [
    'appartement', 'bureaux', 'duplex', 'locations_saisonnière',
    'locaux', 'maison', 'riad', 'studio', 'terrain', 'villa'
]

if not os.path.exists('notebooks'):
    os.makedirs('notebooks')

for p in vente_types:
    create_notebook(p, 'vente')

for p in location_types:
    create_notebook(p, 'location')
