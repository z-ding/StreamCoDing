import React, { useState } from 'react';

const Counter = () => {
    const initialFormData = {
        name: '',
        type: '',
        description: '',
        number: 0,
        testCases: []
    };

    const [formData, setFormData] = useState(initialFormData);
    const [submissionStatus, setSubmissionStatus] = useState(null);
    const [testCaseErrors, setTestCaseErrors] = useState([]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAddTestCase = () => {
        const newTestCase = { input: '', expectedOutput: '' };
        setFormData({ ...formData, testCases: [...formData.testCases, newTestCase] });
    };

    const handleTestCaseChange = (index, e) => {
        const updatedTestCases = [...formData.testCases];
        updatedTestCases[index][e.target.name] = e.target.value;
        setFormData({ ...formData, testCases: updatedTestCases });
    };

    const validateTestCase = (input) => {
        const regex = /^[a-zA-Z0-9,]+$/; // Allow letters, numbers, and commas
        if (!regex.test(input)) {
            return 'Invalid characters detected. Only letters, numbers, and commas are allowed.';
        }
        if (/,{2,}/.test(input)) {
            return 'Invalid input: Multiple consecutive commas are not allowed.';
        }
        if (/,$|^,/.test(input) || /,$|^,/.test(input)) {
            return 'Invalid input: Comma should not be at the beginning or end of input.';
        }
        return null;
    };

    const validateInputConsistency = (input) => {
        const types = new Set();
        input.split(',').forEach(value => {
            if (!isNaN(value)) {
                types.add('number');
            } else {
                types.add('string');
            }
        });
        return types.size === 1 ? null : 'Invalid input: Different data types cannot be separated in the same input.';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const testCaseErrors = formData.testCases.map(testCase => {
            const inputError = validateTestCase(testCase.input);
            const outputError = validateTestCase(testCase.expectedOutput);
            const consistencyError = validateInputConsistency(testCase.input);
            return inputError || outputError || consistencyError;
        });
        if (testCaseErrors.some(error => error !== null)) {
            setTestCaseErrors(testCaseErrors);
            return;
        }
        try {
            const response = await fetch('https://localhost:7011/items/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            setSubmissionStatus('success');
            console.log('Data sent successfully!');
            setFormData(initialFormData); // Clear form fields and test cases
            setTestCaseErrors([]); // Clear test case errors
        } catch (error) {
            console.error('Error sending data:', error);
            setSubmissionStatus('error');
            setFormData(initialFormData); // Clear form fields and test cases
            setTestCaseErrors([]); // Clear test case errors
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="XYZ"
                />
                <input
                    type="text"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    placeholder="DP"
                />
                <input
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="blablabla"
                />
                <input
                    type="number"
                    name="number"
                    value={formData.number}
                    onChange={handleChange}
                    placeholder="999"
                />
                <button type="button" onClick={handleAddTestCase}>Add Test Case</button>
                {formData.testCases.map((testCase, index) => (
                    <div key={index}>
                        <input
                            type="text"
                            name="input"
                            value={testCase.input}
                            onChange={(e) => handleTestCaseChange(index, e)}
                            placeholder="Input"
                        />
                        <input
                            type="text"
                            name="expectedOutput"
                            value={testCase.expectedOutput}
                            onChange={(e) => handleTestCaseChange(index, e)}
                            placeholder="Expected Output"
                        />
                        {testCaseErrors[index] && <p>{testCaseErrors[index]}</p>}
                    </div>
                ))}
                <button type="submit">Submit</button>
            </form>
            {submissionStatus === 'success' && <p>Submission successful!</p>}
            {submissionStatus === 'error' && <p>Submission failed. Please try again.</p>}
        </div>
    );
};

export default Counter;
