import pandas as pd
import numpy as np
import os
import glob

def clean_dataset(file_path, output_dir):
    try:
        df = pd.read_csv(file_path)
        filename = os.path.basename(file_path)
        property_type = filename.split('_')[0]
        transaction_type = filename.split('_')[1].split('.')[0]
        
        print(f"Cleaning {filename}...")
        
        # 1. Removing Duplicates
        initial_size = len(df)
        df = df.drop_duplicates()
        if len(df) < initial_size:
            print(f"  Removed {initial_size - len(df)} duplicate rows.")
            
        # 2. Handling Numerical Columns (Outliers)
        # Using 1st and 99th percentiles for price and surface
        if 'prix_num' in df.columns:
            q_low = df['prix_num'].quantile(0.01)
            q_hi  = df['prix_num'].quantile(0.99)
            df = df[(df['prix_num'] <= q_hi) & (df['prix_num'] >= q_low)]
            
        if 'surface_num' in df.columns:
            q_low_surf = df['surface_num'].quantile(0.01)
            q_hi_surf  = df['surface_num'].quantile(0.99)
            df = df[(df['surface_num'] <= q_hi_surf) & (df['surface_num'] >= q_low_surf)]
            
        # 3. Traitement des valeurs manquantes (NaN)
        # Variables numériques : médiane
        num_cols_to_fill = ['prix_num', 'surface_num', 'prix_m2', 'prix_m2_median_quartier']
        for col in num_cols_to_fill:
            if col in df.columns:
                df[col] = df[col].fillna(df[col].median())
                
        # Variables catégorielles : mode
        cat_cols_mode = ['agence', 'type_bien', 'localisation']
        for col in cat_cols_mode:
            if col in df.columns:
                mode_val = df[col].mode()
                if not mode_val.empty:
                    df[col] = df[col].fillna(mode_val[0])
                    
        # Champs texte
        text_cols = ['titre', 'description', 'prix', 'surface', 'url']
        for col in text_cols:
            if col in df.columns:
                df[col] = df[col].fillna('Non spécifié')
                
        # Traitement des chambres et salles de bain
        non_residential = ['terrain', 'locaux', 'commercial', 'bureaux']
        if property_type in non_residential:
            if 'chambres_num' in df.columns: df['chambres_num'] = df['chambres_num'].fillna(0.0)
            if 'chambres' in df.columns: df['chambres'] = df['chambres'].fillna('0')
            if 'salles_bain_num' in df.columns: df['salles_bain_num'] = df['salles_bain_num'].fillna(0.0)
            if 'salles_bain' in df.columns: df['salles_bain'] = df['salles_bain'].fillna('0')
        else:
            if 'chambres_num' in df.columns and not df['chambres_num'].isnull().all():
                mean_ch = round(df['chambres_num'].mean())
                df['chambres_num'] = df['chambres_num'].fillna(mean_ch)
                if 'chambres' in df.columns: df['chambres'] = df['chambres'].fillna(str(int(mean_ch)))
            if 'salles_bain_num' in df.columns and not df['salles_bain_num'].isnull().all():
                mean_sb = round(df['salles_bain_num'].mean())
                df['salles_bain_num'] = df['salles_bain_num'].fillna(mean_sb)
                if 'salles_bain' in df.columns: df['salles_bain'] = df['salles_bain'].fillna(str(int(mean_sb)))
        
        if property_type in ['appartement', 'studio', 'duplex']:
            if 'surface_terrain' in df.columns:
                df['surface_terrain'] = df['surface_terrain'].fillna(0.0)
        else:
            if 'surface_terrain' in df.columns and 'surface_num' in df.columns:
                df['surface_terrain'] = df['surface_terrain'].fillna(df['surface_num'])
                
        # Suppression des lignes sans ID
        if 'id' in df.columns:
            df.dropna(subset=['id'], inplace=True)
        
        # 4. Save cleaned data
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)
            
        output_filename = filename.replace('.csv', '_cleaned.csv')
        output_path = os.path.join(output_dir, output_filename)
        df.to_csv(output_path, index=False)
        print(f"  Saved to {output_path} ({len(df)} rows)")
        
    except Exception as e:
        print(f"  Error cleaning {file_path}: {e}")

def main():
    base_dir = './data'
    out_dir = './data/cleaned_data'
    
    # Clean vente data
    vente_files = glob.glob(os.path.join(base_dir, 'marrakech_immo_vente_features/*.csv'))
    print(f"Found {len(vente_files)} vente files.")
    for f in vente_files:
        if 'array_vente' in f: continue # Skip junk
        clean_dataset(f, out_dir)
        
    # Clean location data
    location_files = glob.glob(os.path.join(base_dir, 'marrakech_immo_location_features/*.csv'))
    print(f"\nFound {len(location_files)} location files.")
    for f in location_files:
        clean_dataset(f, out_dir)

if __name__ == "__main__":
    main()
