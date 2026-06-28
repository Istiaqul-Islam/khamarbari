---
title: Cattle Disease Predictor
emoji: 🐄
colorFrom: green
colorTo: blue
sdk: docker
app_port: 7860
pinned: false
---

# Cattle Disease Predictor ML Service

This is a specialized Machine Learning service for the KhamarBari platform. It uses a **Random Forest / Gradient Boosting** model trained on a cattle health dataset to predict livestock disease risk from clinical cattle metrics and symptoms.

## 🚀 Features

- **Cattle-specific inference**: Built for cattle and livestock health prediction.
- **Robust preprocessing**: Automatically handles units like `°C`, `days`, `weeks`, and missing values.
- **Docker Ready**: Ready for deployment on Hugging Face Spaces or any container platform.

## 🛠️ Tech Stack

- **Python 3.11**
- **Flask** & **Flask-CORS**
- **Scikit-Learn**
- **Pandas** & **NumPy**
- **Joblib** (Model Serialization)

## 📁 Directory Structure

- `app.py`: Flask API server.
- `ml/train_model.py`: Training pipeline and data cleaning logic.
- `ml/model.pkl`: Serialized inference pipeline.
- `ml/labelencoder.pkl`: Target encoder for disease labels.
- `ml/featurecols.pkl`: Expected model input feature list.
- `dataset/`: Cattle training data (CSV).
- `Dockerfile`: Container configuration.

## 🌐 API Usage

### Predict Cattle Disease

- **Endpoint**: `POST /predict`
- **Payload**:

```json
{
  "Animal_Type": "Cattle",
  "Breed": "Cross Breed",
  "Age": "4",
  "Gender": "Female",
  "Weight": "420.0",
  "Symptom_1": "Diarrhea",
  "Symptom_2": "Coughing",
  "Symptom_3": "No",
  "Symptom_4": "No",
  "Duration": "3 days",
  "Diarrhea": "Yes",
  "Coughing": "No",
  "Labored_Breathing": "No",
  "Lameness": "No",
  "Skin_Lesions": "No",
  "Nasal_Discharge": "No",
  "Eye_Discharge": "No",
  "Body_Temperature": "39.5°C",
  "Heart_Rate": "72"
}
```

The model expects the feature set defined in `ml/featurecols.pkl` and will return a JSON response with `prediction`, `confidence`, and `status`.

## 🚢 Deployment to Hugging Face Spaces

1. Create a new **Docker Space** on Hugging Face: https://huggingface.co/spaces
2. Choose **Docker** as the SDK.
3. Connect the repository folder or upload the contents of the `Pet/` folder.
4. Make sure the space is configured to expose port `7860`.
5. Deploy the space and wait for the build to finish.

### Example Space URL

Once deployed, your Space will be available at a URL like:

`https://huggingface.co/spaces/<your-username>/cattle-disease-predictor`

Replace `<your-username>` and the space name with your actual account details.

## 🔗 Disease Predictor Link

After deployment, update this README with the actual Space link so your team can access the predictor directly.

Example:

`https://huggingface.co/spaces/your-username/cattle-disease-predictor`

## 🔧 Connect the Space to the KhamarBari Site

The site communicates with the Hugging Face Space via the internal API route at:

`src/app/api/predict/route.ts`

In that file, set the public Space endpoint URL in the `HFS_API_URL` constant:

```ts
const HFS_API_URL = "https://<your-username>.hf.space/predict";
```

Then the dashboard predictor page calls your Next.js API route (`/api/predict`), and that route forwards the request to the Hugging Face Space. This avoids CORS issues and keeps the web app integration clean.

If you prefer, you can also replace the hard-coded URL with an environment variable and read it from `process.env.HFS_API_URL`.

## 🧪 Notes

- The training dataset is located in `dataset/cleaned_animal_disease_prediction.csv`, now used as cattle health data.
- The API automatically converts units and missing values for numeric fields.
- If the model file is missing, run `python ml/train_model.py` to generate `ml/model.pkl`.

---

_Note: This model is for educational and diagnostic support purposes. Always consult a certified veterinarian for official medical advice._
