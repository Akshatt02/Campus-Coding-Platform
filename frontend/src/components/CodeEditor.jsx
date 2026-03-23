import React, { useState, useEffect, useContext } from 'react';
import Editor from '@monaco-editor/react';
import api from '../api';
import AuthContext from '../context/AuthContext';

const LANGUAGES = {
  javascript: { id: 63, name: 'JavaScript' },
  python: { id: 71, name: 'Python' },
  cpp: { id: 54, name: 'C++' }
};

const DEFAULT_CODE = {
  javascript: `function add(a, b) {
  return a + b;
}

console.log(add(2, 3));`,
  python: `def add(a, b):
    return a + b

print(add(2, 3))`,
  cpp: `#include <iostream>
using namespace std;

int add(int a, int b) {
    return a + b;
}

int main() {
    cout << add(2, 3) << endl;
    return 0;
}`
};

const TEST_CASES = [
  { input: "2 3", expected: "5" },
  { input: "10 20", expected: "30" }
];

const VERDICT_MAP = {
  'Accepted': 'AC',
  'Wrong Answer': 'WA',
  'Time Limit Exceeded': 'TLE',
  'Runtime Error': 'RE',
  'Compilation Error': 'CE'
};

const getVerdict = (status) => {
  return VERDICT_MAP[status] || status;
};

export default function CodeEditor({ problemId, contestId, onSubmit }) {
  const { token } = useContext(AuthContext);
  const [code, setCode] = useState(DEFAULT_CODE.javascript);
  const [language, setLanguage] = useState('javascript');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('input');
  const [testResults, setTestResults] = useState([]);
  const [testCases, setTestCases] = useState([]);
  const [finalMessage, setFinalMessage] = useState('');

  useEffect(() => {
    const loadTestCases = async () => {
      if (problemId) {
        try {
          const data = await api.fetchTestcases(problemId, token);
          
          setTestCases(data);;
        } catch (error) {
          console.error('Failed to load testcases:', error);
          // Fallback to hardcoded
          setTestCases([
            { input: "2 3", expected: "5" },
            { input: "10 20", expected: "30" }
          ]);
        }
      } else {
        // Fallback
        setTestCases([
          { input: "2 3", expected: "5" },
          { input: "10 20", expected: "30" }
        ]);
      }
    };
    loadTestCases();
  }, [problemId]);

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    setCode(DEFAULT_CODE[newLang]);
  };

  const runCode = async () => {
    setIsLoading(true);
    setStatus('Running...');
    setFinalMessage('');
    try {
      const response = await api.submitCode(code, LANGUAGES[language].id, input);
      const result = await api.getResult(response.token);
      setOutput(result.output || result.error || 'No output');
      setStatus(result.status);
      setFinalMessage('✅ Successfully Executed');
    } catch (error) {
      setOutput('Error: ' + error.message);
      setStatus('Error');
    } finally {
      setIsLoading(false);
    }
  };

  const runTestCases = async () => {
    setIsLoading(true);
    setStatus('Running tests...');
    setTestResults([]);
    setFinalMessage('');

    const results = [];
    let allPassed = true;
    let verdictStatus = 'Accepted';

    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      try {
        const response = await api.submitCode(code, LANGUAGES[language].id, testCase.input);
        const result = await api.getResult(response.token);

        const actualOutput = (result.output || '').trim().replace(/\s+/g, ' ');
        const expectedOutput = testCase.expected.trim().replace(/\s+/g, ' ');

        const passed = actualOutput === expectedOutput;
        const testStatus = result.status || (passed ? 'Accepted' : 'Wrong Answer');
        
        results.push({
          index: i + 1,
          input: testCase.input,
          expected: testCase.expected,
          actual: result.output || '',
          passed,
          status: testStatus,
          error: result.error || ''
        });

        if (!passed) {
          allPassed = false;
          verdictStatus = testStatus !== 'Accepted' ? testStatus : 'Wrong Answer';
        }
      } catch (error) {
        results.push({
          index: i + 1,
          input: testCase.input,
          expected: testCase.expected,
          actual: '',
          passed: false,
          status: 'Runtime Error',
          error: error.message
        });
        allPassed = false;
        verdictStatus = 'Runtime Error';
      }
    }

    setTestResults(results);
    setStatus(verdictStatus);
    
    // Store submission in database
    if (problemId && token) {
      try {
        const submissionData = {
          problem_id: problemId,
          verdict: getVerdict(verdictStatus)
        };
        if (contestId) {
          submissionData.contest_id = contestId;
        }
        await api.createSubmission(token, submissionData);
        setFinalMessage(`Verdict: ${getVerdict(verdictStatus)}`);
        if (onSubmit) onSubmit();
      } catch (error) {
        console.error('Failed to save submission:', error);
        setFinalMessage(`⚠ Results: ${getVerdict(verdictStatus)} (submission not saved)`);
      }
    }
    
    setIsLoading(false);
  };

  return (
    <div className="card p-6 space-y-4">
      <h3 className="text-xl font-semibold">Code Editor</h3>

      {/* Language Selector */}
      <div>
        <label className="block text-sm font-medium mb-2">Language:</label>
        <select
          value={language}
          onChange={(e) => handleLanguageChange(e.target.value)}
          className="form-select"
        >
          {Object.entries(LANGUAGES).map(([key, lang]) => (
            <option key={key} value={key}>
              {lang.name}
            </option>
          ))}
        </select>
      </div>

      {/* Monaco Editor */}
      <div className="border rounded-lg overflow-hidden">
        <Editor
          height="400px"
          language={language}
          value={code}
          onChange={setCode}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            automaticLayout: true,
          }}
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-2">
        <button
          onClick={runCode}
          disabled={isLoading}
          className="btn btn-secondary"
        >
          {isLoading ? 'Running...' : 'Run Code'}
        </button>
        <button
          onClick={runTestCases}
          disabled={isLoading}
          className="btn btn-primary"
        >
          {isLoading ? 'Running...' : 'Submit'}
        </button>
      </div>

      {/* Final Message */}
      {finalMessage && (
        <div className={`p-2 rounded text-sm ${
          finalMessage.includes('Successfully') || finalMessage.includes('Saved')
            ? 'bg-green-100 text-green-700'
            : 'bg-yellow-100 text-yellow-700'
        }`}>
          {finalMessage}
        </div>
      )}

      {/* Status */}
      {status && (
        <div className={`p-2 rounded text-sm ${
          status === 'Accepted' ? 'bg-green-100 text-green-700' :
          status === 'Wrong Answer' ? 'bg-red-100 text-red-700' :
          status === 'Runtime Error' ? 'bg-orange-100 text-orange-700' :
          status === 'Compilation Error' ? 'bg-purple-100 text-purple-700' :
          status === 'Time Limit Exceeded' ? 'bg-indigo-100 text-indigo-700' :
          'bg-yellow-100 text-yellow-700'
        }`}>
          {status === 'Accepted' ? '✔ ' : 
           status === 'Wrong Answer' ? '❌ ' : 
           status === 'Runtime Error' ? '⚠ ' :
           status === 'Compilation Error' ? '🔴 ' :
           status === 'Time Limit Exceeded' ? '⏱ ' :
           '⚠ '}
          {status}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b">
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab('input')}
            className={`py-2 px-4 ${activeTab === 'input' ? 'border-b-2 border-blue-500' : ''}`}
          >
            Input
          </button>
          <button
            onClick={() => setActiveTab('output')}
            className={`py-2 px-4 ${activeTab === 'output' ? 'border-b-2 border-blue-500' : ''}`}
          >
            Output
          </button>
          <button
            onClick={() => setActiveTab('tests')}
            className={`py-2 px-4 ${activeTab === 'tests' ? 'border-b-2 border-blue-500' : ''}`}
          >
            Test Results
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-4">
        {activeTab === 'input' && (
          <div>
            <label className="block text-sm font-medium mb-2">Custom Input:</label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full h-32 p-2 border rounded font-mono text-sm"
              placeholder="Enter input for Run Code..."
            />
          </div>
        )}

        {activeTab === 'output' && (
          <div>
            <label className="block text-sm font-medium mb-2">Output:</label>
            <pre className="w-full h-32 p-2 bg-gray-100 border rounded font-mono text-sm overflow-auto">
              {output}
            </pre>
          </div>
        )}

        {activeTab === 'tests' && (
          <div>
            <h4 className="text-lg font-medium mb-2">Test Cases</h4>
            <div className="space-y-2">
              {testCases.map((test, index) => (
                <div key={index} className="border rounded p-2">
                  <div className="text-sm">
                    <strong>Input:</strong> {test.input}
                  </div>
                  <div className="text-sm">
                    <strong>Expected:</strong> {test.expected}
                  </div>
                </div>
              ))}
            </div>
            {testResults.length > 0 && (
              <div className="mt-4">
                <h4 className="text-lg font-medium mb-2">Results</h4>
                <div className="space-y-2">
                  {testResults.map((result, index) => (
                    <div key={index} className={`border rounded p-2 ${
                      result.passed ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'
                    }`}>
                      <div className="text-sm">
                        <strong>Test {result.index}:</strong> {result.passed ? '✔ Passed' : '❌ Failed'}
                      </div>
                      <div className="text-sm">
                        <strong>Status:</strong> {result.status || (result.passed ? 'Accepted' : 'Wrong Answer')}
                      </div>
                      <div className="text-sm">
                        <strong>Verdict:</strong> {getVerdict(result.status || (result.passed ? 'Accepted' : 'Wrong Answer'))}
                      </div>
                      <div className="text-sm">
                        <strong>Input:</strong> {result.input}
                      </div>
                      <div className="text-sm">
                        <strong>Expected:</strong> {result.expected}
                      </div>
                      <div className="text-sm">
                        <strong>Actual:</strong> {result.actual}
                      </div>
                      {result.error && (
                        <div className="text-sm text-red-600">
                          <strong>Error:</strong> {result.error}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}