import React, { useState } from 'react';

const Counter = () => {
    const [formData, setFormData] = useState({
        name: '',
        type: '',
        description: '',
        number: 0,
        // Add other form fields as necessary
    });
    const [submissionStatus, setSubmissionStatus] = useState(null); // State to track submission status
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
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
            setSubmissionStatus('success'); // Set submission status to success
            console.log('Data sent successfully!');
            // Optionally, handle success response
        } catch (error) {
            console.error('Error sending data:', error);
            setSubmissionStatus('error'); // Set submission status to error
            // Optionally, handle error response
        }
    };

    return (
        <div>
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                name="name"
                value={formData.Name}
                onChange={handleChange}
                placeholder="XYZ"
            />
            <input
                type="text"
                name="type"
                value={formData.Type}
                onChange={handleChange}
                placeholder="DP"
            />
            <input
                type="text"
                name="description"
                value={formData.Description}
                onChange={handleChange}
                placeholder="blablabla"
            />
            <input
                type="number"
                name="number"
                value={formData.Number}
                onChange={handleChange}
                placeholder="999"
            />
            {/* Add other form fields as necessary */}
            <button type="submit">Submit</button>
        </form>
        { submissionStatus === 'success' && <p>Submission successful!</p> }
        {submissionStatus === 'error' && <p>Submission failed. Please try again.</p>}
        </div>
    );
};

export default Counter;
