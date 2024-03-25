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
    const [runMode, setRunMode] = useState('all'); // 'all' or 'firstThree'

    const handleCodeChange = (event) => {
        setCppCode(event.target.value);
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
        setRunMode('firstThree');
        try {
            const res = [];
            for (const [index, testCase] of threeTestCases.entries()) {
                try {
                    let modifiedCode = cppCode.replace(/inputParameter/g, testCase.input);
                    const response = await fetch('https://localhost:7011/cppCompiler', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ CppCode: modifiedCode, ProblemID: id, testCaseIdx: index })
                    });
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    const data = await response.json();
                    res.push({ ...data }); // Store result along with acceptance status
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
        } catch (error) {
            console.error('Error executing test cases:', error);
        } finally {
            setLoading(false);
        }
    };




    const handleSubmitAllCases = async (testCase) => {
        setRunMode('all');
        setLoading(true);
        try {
            for (const [index, testCase] of testCases.entries()) {
                try {
                    let modifiedCode = cppCode.replace(/inputParameter/g, testCase.input);
                    const response = await fetch('https://localhost:7011/cppCompiler', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ CppCode: modifiedCode, ProblemID: id, testCaseIdx: index })
                    });
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    const data = await response.json();
                    if (data.isAccepted === false) {
                        setExecutionResult({ Result: "Wrong Answer", isAccepted: false, lastExecutedTestcase: testCase.input, executionResult: data.codeOutput, expectedOutput: data.expectedOutput, firstDiff: data.firstDiff });
                        /*for debugging
                         for (var i = 0; i < data.codeOutput.size(); i++) {
                            if (data.codeOutput[i] !== testCase.expectedOutput[i]) {
                                console.log(data.codeOutput[i]);
                            }
                        }                       
                        */

                        return;
                    }
                } catch (error) {
                    if (error.message === 'Execution timed out.') {
                        // Handle timeout error here
                        setExecutionResult({ error: 'Execution timed out', isAccepted: false });
                    } else {
                        setExecutionResult({ error: error.message, isAccepted: false });
                    }
                }
            }
            setExecutionResult({ Result: "Accepted", isAccepted: true });
        } catch (error) {
            console.error('Error executing test cases:', error);
        } finally {
            setLoading(false);
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
                {runMode === 'all' && executionResult && (
                    <div>
                        <h4>Submission Result</h4>
                        {executionResult.isAccepted === true ? (
                            <p>Accepted</p>
                        ) : (
                            <div>
                                <p>Wrong Answer</p>
                                    <p>Last Executed Testcase: {executionResult.lastExecutedTestcase}</p>
                                    <p>Executed Result: {executionResult.executionResult}</p>
                                    <p>Expected Output: {executionResult.expectedOutput}</p>
                                    <p>First Variance: {executionResult.firstDiff}</p>
                            </div>
                        )}
                    </div>
                )}
                {runMode === 'firstThree' && (
                    <div style={{ marginTop: '20px', display: 'flex' }}>
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
                                                <p>Executed result: {threeExecutionResult[index].codeOutput}</p>
                                                <p>Result: {threeExecutionResult[index].isAccepted ? "Accepted" : "Wrong Answer"}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default ProblemDetail;
/*
front end code to test
#include <iostream>
#include <vector>

int main() {
    int n = inputParameter;
    std::vector<bool> isPrime(n + 1, true); // Initialize all numbers as prime
    std::vector<int> res;
    isPrime[0] = isPrime[1] = false; // 0 and 1 are not prime

    for (int i = 2; i * i <= n; ++i) {
        if (isPrime[i]) { // If i is prime
            for (int j = i * i; j <= n; j += i) {
                isPrime[j] = false; // Mark multiples of i as not prime
            }
        }
    }

    for (int i = 2; i <= n; ++i) {
        if (isPrime[i]) {
            res.push_back(i); // Store prime numbers in the vector
        }
    }
    
    // Print the res vector elements separated by commas
    for (int i = 0; i < res.size(); ++i) {
        std::cout << res[i];
        if (i < res.size() - 1) {
            std::cout << ",";
        }
    }
    std::cout << std::endl;
    
    return 0;
}
*/ 
