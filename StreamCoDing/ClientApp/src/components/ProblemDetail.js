import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

function ProblemDetail() {
    const { id } = useParams();
    const [problem, setProblem] = useState(null);

    useEffect(() => {
        fetch(`https://localhost:7011/items/${id}`)
            .then(res => res.json())
            .then(data => {
                setProblem(data);
            })
            .catch(error => console.error("Error fetching problem details:", error));
    }, [id]);

    if (!problem) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h2>{problem.name}</h2>
            <p>{problem.description}</p>
            {/* Render other details of the problem */}
        </div>
    );
}

export default ProblemDetail;
