import pandas as pd
import joblib
import os
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OrdinalEncoder, LabelEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import HistGradientBoostingClassifier

# Load cattle dataset from root
df = pd.read_csv('../cattle_dataset.csv')

# 1. FEATURES & TARGET
feature_cols = [
    'body_temperature','breed_type','milk_production','respiratory_rate',
    'walking_capacity','sleeping_duration','body_condition_score',
    'heart_rate','eating_duration','lying_down_duration','ruminating',
    'rumen_fill','faecal_consistency'
]

target_col = 'health_status'

X = df[feature_cols].copy()
y = df[target_col].copy()

# ENCODE TARGET
le = LabelEncoder()
y = le.fit_transform(y)

# COLUMN TYPES
categorical_cols = X.select_dtypes(include=['object']).columns
numeric_cols = X.select_dtypes(exclude=['object']).columns

# PREPROCESSING
preprocessor = ColumnTransformer(
    transformers=[
        ('num', StandardScaler(), numeric_cols),
        ('cat', OrdinalEncoder(handle_unknown='use_encoded_value', unknown_value=-1), categorical_cols)
    ]
)

# MODEL
model = HistGradientBoostingClassifier(
    random_state=42,
    max_iter=200,
    max_depth=10,
    learning_rate=0.1
)

# PIPELINE
pipeline = Pipeline([
    ('preprocessor', preprocessor),
    ('model', model)
])

# TRAIN MODEL
pipeline.fit(X, y)

# SAVE MODEL ARTIFACTS
os.makedirs('ml', exist_ok=True)
joblib.dump(pipeline, 'ml/model.pkl')
joblib.dump(le, 'ml/labelencoder.pkl')
joblib.dump(feature_cols, 'ml/featurecols.pkl')
print("✅ Cattle Health ML model retrained and artifacts saved successfully!")
