import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

function ProblemDetail() {
    const { id } = useParams();
    const [problem, setProblem] = useState(null);
    const [cppCode, setCppCode] = useState('');
    const [executionResult, setExecutionResult] = useState(null);  
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [testCases, setTestCases] = useState([]);
    const [threeExecutionResult, setThreeExecutionResult] = useState(Array(3).fill(null));
    const [threeTestCases, setThreeTestCases] = useState([]);

    const handleCodeChange = (event) => {
        setCppCode(event.target.value);
    };

    const handleSubmitAllCases = async () => {
        setError('');
        setLoading(true);
        try {
            const response = await fetch('https://localhost:7011/cppCompiler', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ CppCode: cppCode })
            });
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            setExecutionResult(data);
        } catch (error) {
            setError(`Error executing C++ code: ${error.message}`);
            setExecutionResult(null); // Clear execution result on error
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetch(`https://localhost:7011/items/${id}`)
            .then(res => res.json())
            .then(data => {
                setProblem(data);
                setTestCases(data.testCases); // Get the first three test cases
                setThreeTestCases(data.testCases.slice(0, 3)); // Get the first three test cases
            })
            .catch(error => console.error("Error fetching problem details:", error));
    }, [id]);

    const handleRunFirstThreeCases = async () => {
        setLoading(true);
        try {
            const res = [];
            for (const testCase of threeTestCases) {
                try {
                    let modifiedCode = cppCode.replace(/inputParameter/g, testCase.input);
                    const response = await fetch('https://localhost:7011/cppCompiler', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ CppCode: modifiedCode })
                    });
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    const data = await response.json();
                    
                    // Compare return value with expected output
                    const isAccepted = data.returnValue === testCase.expectedReturnValue;
                    res.push({ standardOutput: data.standardOutput, returnValue: data.returnValue, isAccepted: isAccepted }); // Store result along with acceptance status
                } catch (error) {
                    if (error.message === 'Execution timed out.') {
                        // Handle timeout error here
                        res.push({ error: 'Execution timed out', isAccepted: false });
                    } else {
                        res.push({ error: error.message, isAccepted: false });
                    }
                }
            }
            setThreeExecutionResult(res);
            //console.log(threeExecutionResult);
        } catch (error) {
            console.error('Error executing test cases:', error);
        } finally {
            setLoading(false);
        }
    };




    const handleTestCaseExecution = async (testCase) => {
        try {
            const response = await fetch('https://localhost:7011/cppCompiler', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ CppCode: cppCode, Input: testCase.input })
            });
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            
            // Check if the execution result matches the expected output
            const isAccepted = data.standardOutput.trim() === testCase.expectedOutput.trim();
            if (!isAccepted) {
                console.error('Test case failed:', testCase);
            }
            return isAccepted;
        } catch (error) {
            console.error('Error executing test case:', error);
            return false;
        }
    };

    return (
        <div style={{ display: 'flex' }}>
            <div style={{ flex: 1, marginRight: '20px' }}>
                <h2>{problem && problem.name}</h2>
                <p>{problem && problem.description}</p>
                {/* Render other details of the problem */}
            </div>
            <div style={{ flex: 2 }}>
                <textarea
                    value={cppCode}
                    onChange={handleCodeChange}
                    style={{ width: '90vw', height: '400px', maxWidth: '800px' }}
                />
                <button onClick={handleRunFirstThreeCases}>Run First Three Cases</button>
                <button onClick={handleSubmitAllCases}>Submit for All Test Cases</button>
                {loading && <p>Loading...</p>}
                {error && !executionResult && <p>{error}</p>}
                <div style={{ marginTop: '20px' }}>
                    {threeTestCases.map((testCase, index) => (
                        <div key={index} style={{ marginBottom: '20px' }}>
                            <h4>Test Case {index + 1}</h4>
                            <p><strong>Input:</strong> {testCase.input}</p>
                            <p><strong>Expected Output:</strong> {testCase.expectedOutput}</p>
                            {threeExecutionResult[index] && (
                                <div>
                                    <h5>Execution Result:</h5>
                                    {threeExecutionResult[index].error ? (
                                        <p>Error: {threeExecutionResult[index].error}</p>
                                    ) : (
                                        <div>
                                            <p>Standard Output: {threeExecutionResult[index].standardOutput}</p>
                                            <p>Return Value: {threeExecutionResult[index].returnValue}</p>
                                            <p>Result: {threeExecutionResult[index].isAccepted ? "Accepted" : "Wrong Answer"}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default ProblemDetail;
