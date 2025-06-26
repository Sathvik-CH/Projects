import random
import json
import base64

def generate_explanation(case_text, outcome):
    """
    Generates a human-readable explanation for the prediction
    
    Args:
        case_text (str): The case text used for prediction
        outcome (str): The predicted outcome (win/lose)
        
    Returns:
        str: Human-readable explanation
    """
    # In a real implementation, this would use SHAP or LIME to extract key factors
    # Here we'll generate a template-based explanation
    
    # Extract key phrases (simulated)
    key_phrases = extract_key_phrases(case_text)
    
    # Generate explanation based on outcome
    if outcome == 'win':
        explanation = f"Based on our analysis, your case has a favorable chance of success. "
        explanation += f"Key factors supporting this prediction include: "
        
        # Add positive factors
        positive_factors = [
            "The legal precedents that favor your position",
            "Strong evidence supporting your claims",
            "Clear statutory provisions in your favor",
            f"The {key_phrases[0]} mentioned in your case"
        ]
        explanation += ", ".join(positive_factors) + ". "
        
        # Add caution
        explanation += "However, legal outcomes can vary based on specific court interpretations and judicial discretion."
        
    else:  # lose
        explanation = f"Based on our analysis, your case may face significant challenges. "
        explanation += f"Key factors leading to this prediction include: "
        
        # Add negative factors
        negative_factors = [
            "Limited supporting evidence for key claims",
            "Precedents that may not favor your position",
            "Potential statutory interpretations that could be challenging",
            f"The {key_phrases[1]} mentioned in your case"
        ]
        explanation += ", ".join(negative_factors) + ". "
        
        # Add constructive advice
        explanation += "Consider strengthening these aspects or consulting with a legal professional for strategies to address these challenges."
    
    return explanation

def extract_key_phrases(text, num_phrases=3):
    """
    Extracts key phrases from text (simulated function)
    
    Args:
        text (str): The input text
        num_phrases (int): Number of phrases to extract
        
    Returns:
        list: List of key phrases
    """
    # In a real implementation, this would use NLP techniques like TF-IDF or keywords extraction
    # Here we'll simulate the extraction with common legal phrases
    
    legal_phrases = [
        "prima facie evidence",
        "burden of proof",
        "reasonable doubt",
        "statutory interpretation",
        "legal precedent",
        "jurisprudence",
        "legal doctrine",
        "material facts",
        "judicial discretion",
        "substantive law",
        "procedural compliance",
        "legal standing",
        "factual allegations",
        "statutory provisions",
        "legal liability"
    ]
    
    # Randomly select phrases (in a real implementation, we'd select based on relevance)
    selected_phrases = random.sample(legal_phrases, min(num_phrases, len(legal_phrases)))
    
    return selected_phrases

def generate_shap_visualization(case_text):
    """
    Generates SHAP visualization data for the prediction
    
    Args:
        case_text (str): The case text used for prediction
        
    Returns:
        dict: SHAP visualization data for the frontend
    """
    # In a real implementation, this would use SHAP to generate feature importance
    # Here we'll generate mock SHAP data for visualization
    
    # Extract features (simulated)
    features = [
        "Legal Arguments Strength",
        "Evidence Quality",
        "Precedent Relevance",
        "Statutory Support",
        "Procedural Compliance",
        "Constitutional Validity",
        "Factual Clarity"
    ]
    
    # Generate random SHAP values between -1 and 1
    # Positive values push prediction toward favorable outcome
    # Negative values push prediction toward unfavorable outcome
    shap_values = []
    for _ in features:
        shap_values.append(random.uniform(-1, 1))
    
    # Sort features by importance (absolute SHAP value)
    feature_importance = [(features[i], shap_values[i]) for i in range(len(features))]
    feature_importance.sort(key=lambda x: abs(x[1]), reverse=True)
    
    # Format data for visualization
    visualization_data = {
        'features': [item[0] for item in feature_importance],
        'values': [item[1] for item in feature_importance],
        'colors': ['#2ecc71' if val > 0 else '#e74c3c' for val in [item[1] for item in feature_importance]]
    }
    
    return visualization_data

def generate_lime_explanation(case_text):
    """
    Generates LIME explanation data for the prediction
    
    Args:
        case_text (str): The case text used for prediction
        
    Returns:
        dict: LIME explanation data
    """
    # In a real implementation, this would use LIME to explain the prediction
    # Here we'll generate mock LIME data
    
    # Extract sentences from case text (simulated)
    sentences = [s for s in case_text.split('.') if s.strip()]
    if len(sentences) > 10:
        sentences = sentences[:10]  # Limit number of sentences for visualization
    
    # Generate random importance scores for each sentence
    importance_scores = []
    for _ in sentences:
        importance_scores.append(random.uniform(-1, 1))
    
    # Format data for visualization
    explanation_data = []
    for i, sentence in enumerate(sentences):
        if len(sentence) > 100:
            sentence = sentence[:97] + "..."
        
        explanation_data.append({
            'text': sentence.strip(),
            'importance': importance_scores[i],
            'is_positive': importance_scores[i] > 0
        })
    
    # Sort by absolute importance
    explanation_data.sort(key=lambda x: abs(x['importance']), reverse=True)
    
    return explanation_data
