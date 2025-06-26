document.addEventListener('DOMContentLoaded', () => {
    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Form validation
    const forms = document.querySelectorAll('.needs-validation');
    Array.from(forms).forEach(form => {
        form.addEventListener('submit', event => {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            form.classList.add('was-validated');
        }, false);
    });

    // Case type selection
    const caseTypeSelect = document.getElementById('case_type');
    const additionalFields = document.getElementById('additional-fields');
    
    if (caseTypeSelect && additionalFields) {
        caseTypeSelect.addEventListener('change', function() {
            const caseType = this.value;
            updateAdditionalFields(caseType);
        });
        
        // Initialize fields based on default selection
        if (caseTypeSelect.value) {
            updateAdditionalFields(caseTypeSelect.value);
        }
    }

    // Toggle user type view
    const userTypeToggle = document.querySelectorAll('input[name="user_type"]');
    const citizenFields = document.getElementById('citizen-fields');
    const lawyerFields = document.getElementById('lawyer-fields');
    
    if (userTypeToggle.length && citizenFields && lawyerFields) {
        userTypeToggle.forEach(radio => {
            radio.addEventListener('change', function() {
                if (this.value === 'citizen') {
                    citizenFields.classList.remove('d-none');
                    lawyerFields.classList.add('d-none');
                } else {
                    citizenFields.classList.add('d-none');
                    lawyerFields.classList.remove('d-none');
                }
            });
        });
    }

    // Copy citation to clipboard
    const citationButtons = document.querySelectorAll('.copy-citation');
    if (citationButtons.length) {
        citationButtons.forEach(button => {
            button.addEventListener('click', function() {
                const citation = this.getAttribute('data-citation');
                navigator.clipboard.writeText(citation).then(() => {
                    // Change button text temporarily
                    const originalText = this.innerHTML;
                    this.innerHTML = 'Copied!';
                    setTimeout(() => {
                        this.innerHTML = originalText;
                    }, 2000);
                });
            });
        });
    }

    // Word counter for text areas
    const textAreas = document.querySelectorAll('textarea[data-word-count]');
    if (textAreas.length) {
        textAreas.forEach(textarea => {
            const counterId = textarea.getAttribute('data-word-count');
            const counter = document.getElementById(counterId);
            
            if (counter) {
                textarea.addEventListener('input', function() {
                    const words = this.value.match(/\S+/g) || [];
                    counter.textContent = words.length;
                });
                
                // Initialize count
                const words = textarea.value.match(/\S+/g) || [];
                counter.textContent = words.length;
            }
        });
    }
});

function updateAdditionalFields(caseType) {
    const additionalFields = document.getElementById('additional-fields');
    
    // Clear previous fields
    additionalFields.innerHTML = '';
    
    // Define fields based on case type
    let fields = [];
    
    switch (caseType) {
        case 'civil':
            fields = [
                { id: 'civil_relief', label: 'Relief Sought', type: 'text' },
                { id: 'damage_amount', label: 'Damage Amount (in ₹)', type: 'number' }
            ];
            break;
            
        case 'criminal':
            fields = [
                { id: 'charges', label: 'Criminal Charges', type: 'text' },
                { id: 'previous_convictions', label: 'Previous Convictions (if any)', type: 'text' }
            ];
            break;
            
        case 'family':
            fields = [
                { id: 'relationship', label: 'Relationship Status', type: 'select', 
                  options: ['Married', 'Divorced', 'Separated', 'Other'] },
                { id: 'marriage_duration', label: 'Duration of Marriage (in years)', type: 'number' }
            ];
            break;
            
        case 'property':
            fields = [
                { id: 'property_type', label: 'Property Type', type: 'select',
                  options: ['Residential', 'Commercial', 'Agricultural', 'Industrial'] },
                { id: 'property_value', label: 'Approximate Value (in ₹)', type: 'number' }
            ];
            break;
            
        case 'tax':
            fields = [
                { id: 'tax_year', label: 'Assessment Year', type: 'number' },
                { id: 'tax_amount', label: 'Disputed Amount (in ₹)', type: 'number' }
            ];
            break;
    }
    
    // Create and append fields
    fields.forEach(field => {
        const div = document.createElement('div');
        div.className = 'mb-3';
        
        const label = document.createElement('label');
        label.setAttribute('for', field.id);
        label.className = 'form-label';
        label.textContent = field.label;
        
        let input;
        
        if (field.type === 'select') {
            input = document.createElement('select');
            input.className = 'form-select';
            
            // Add options
            field.options.forEach(option => {
                const optionElement = document.createElement('option');
                optionElement.value = option.toLowerCase();
                optionElement.textContent = option;
                input.appendChild(optionElement);
            });
        } else {
            input = document.createElement('input');
            input.setAttribute('type', field.type);
            input.className = 'form-control';
        }
        
        input.setAttribute('id', field.id);
        input.setAttribute('name', field.id);
        
        div.appendChild(label);
        div.appendChild(input);
        additionalFields.appendChild(div);
    });
}
