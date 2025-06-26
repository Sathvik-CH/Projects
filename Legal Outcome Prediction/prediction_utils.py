import os
import random
import json

import torch
from transformers import AutoTokenizer, AutoModelForMaskedLM
from transformers import BertForSequenceClassification


model = BertForSequenceClassification.from_pretrained('checkpoint-2070')

# Define Device
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
from transformers import AutoTokenizer, AutoModelForSequenceClassification

tokenizer = AutoTokenizer.from_pretrained("checkpoint-2070")
# model = AutoModelForSequenceClassification.from_pretrained("law-ai/CustomInLawBERT")  # Update this

model.to(device)
model.eval()

# Prediction Function for Legal Outcome
def predict_outcome(case_text):
    # Tokenize input text
    inputs = tokenizer(case_text, return_tensors="pt", truncation=True, padding=True, max_length=512)
    inputs = {k: v.to(device) for k, v in inputs.items()}

    with torch.no_grad():
        # Get the model's output
        outputs = model(**inputs)
        logits = outputs.logits

        # Apply sigmoid for binary classification
        probs = torch.sigmoid(logits)
        print(probs.shape)  # Check the shape of the output tensor

        predicted_class = probs.argmax(dim=-1).item()  # Get the index of the highest probability


        # Get confidence score
        confidence = probs[0][predicted_class].item()

    # Map the predicted class to a label (optional)
    label = "Win" if predicted_class == 1 else "Lose"
    return label, round(confidence, 2)

# Example Usage
case_text = "The defendant has been accused of fraud..."
label, confidence = predict_outcome(case_text)
print(f"Prediction: {label}, Confidence: {confidence}")



import faiss
import numpy as np
from sentence_transformers import SentenceTransformer

# Load FAISS index and saved data
faiss_index = faiss.read_index("precedent_index.faiss")
precedent_summaries = np.load("summary_texts.npy", allow_pickle=True)
precedent_judgments = np.load("judgments.npy", allow_pickle=True)

# Load embedding model (same one used to generate embeddings)
embedding_model = SentenceTransformer("all-MiniLM-L6-v2")

def get_case_precedents(case_text, case_type=None, num_precedents=5):
    """
    Retrieves real case precedents based on semantic similarity using FAISS
    
    Args:
        case_text (str): The combined or summarized case text
        case_type (str): (Unused for now, kept for compatibility)
        num_precedents (int): Number of precedents to return
        
    Returns:
        list: List of dictionaries with precedent summary, judgment, and relevance
    """
    # Embed the input case text
    query_embedding = embedding_model.encode([case_text])

    # Search the FAISS index
    distances, indices = faiss_index.search(query_embedding, num_precedents)

    precedents = []
    for i, dist in zip(indices[0], distances[0]):
        precedents.append({
            "summary": precedent_summaries[i],
            "judgment": precedent_judgments[i],
            "relevance": round(float(1 / (1 + dist)), 4)  # Normalize as relevance score
        })

    return precedents


def predict_numerical_values(case_text, case_type):
    """
    Predicts numerical values like compensation, sentencing, or damages
    
    Args:
        case_text (str): The combined text of the case
        case_type (str): The type of case
        
    Returns:
        dict: Predicted numerical values relevant to the case
    """
    # In a real implementation, we'd use regression models specific to each case type
    # Here we'll simulate predictions based on case type
    
    # Default ranges for different case types
    numerical_ranges = {
        'civil': {
            'compensation': (50000, 2000000),  # In rupees
            'damages': (10000, 500000),  # In rupees
            'legal_costs': (5000, 100000)  # In rupees
        },
        'criminal': {
            'sentencing': (1, 120),  # In months
            'fine': (1000, 100000),  # In rupees
            'probation': (0, 36)  # In months
        },
        'family': {
            'alimony': (5000, 50000),  # Monthly in rupees
            'child_support': (3000, 30000),  # Monthly in rupees
            'property_division': (20, 80)  # Percentage
        },
        'property': {
            'valuation': (500000, 10000000),  # In rupees
            'compensation': (100000, 5000000),  # In rupees
            'interest_rate': (6, 18)  # Percentage
        },
        'tax': {
            'tax_liability': (10000, 1000000),  # In rupees
            'penalty': (1000, 500000),  # In rupees
            'interest': (8, 24)  # Percentage
        }
    }
    
    # Default to civil if case type not in our dictionary
    case_category = case_type.lower() if case_type.lower() in numerical_ranges else 'civil'
    
    # Get relevant ranges for the case type
    ranges = numerical_ranges[case_category]
    
    # Generate predictions within the ranges with some randomness
    predictions = {}
    for key, (min_val, max_val) in ranges.items():
        # Base prediction on length of case text (simulating feature extraction)
        text_length_factor = min(1.0, max(0.1, len(case_text) / 10000))
        
        # Calculate predicted value within range
        range_size = max_val - min_val
        base_value = min_val + (range_size * text_length_factor)
        
        # Add some randomness
        randomness = random.uniform(-0.2, 0.2) * range_size
        predicted_value = base_value + randomness
        
        # Ensure within bounds and round appropriately
        predicted_value = max(min_val, min(max_val, predicted_value))
        
        # Round to appropriate precision
        if 'percentage' in key or 'rate' in key:
            predicted_value = round(predicted_value, 2)
        else:
            predicted_value = int(round(predicted_value))
        
        predictions[key] = predicted_value
    
    return predictions
