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

int main() {
  
}`
};

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

export default function CodeEditor({
  problemId,
  contestId,
  onSubmit,
  problemTitle,
  contextLabel,
}) {
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
          
          setTestCases(data);
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
      setFinalMessage('Successfully Executed');
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
        setFinalMessage(`Results: ${getVerdict(verdictStatus)} (submission not saved)`);
      }
    }
    
    setIsLoading(false);
  };

  return (
    <div className="card p-6 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="text-lg font-bold tracking-tight text-[var(--text-primary)] sm:text-xl">
            Code
          </h3>
          {(problemTitle || contextLabel) && (
            <p className="mt-1 truncate text-sm text-[var(--text-secondary)]" title={problemTitle}>
              {contextLabel && (
                <span className="font-semibold text-[var(--cyan)]">{contextLabel}</span>
              )}
              {contextLabel && problemTitle ? ' · ' : null}
              {problemTitle ? (
                <span className="font-medium text-[var(--text-primary)]">{problemTitle}</span>
              ) : null}
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <label className="text-xs font-bold uppercase tracking-widest muted">Language</label>
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="form-select text-sm !py-1.5 !pr-10 !bg-[var(--surface)]"
          >
            {Object.entries(LANGUAGES).map(([key, lang]) => (
              <option key={key} value={key}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Monaco Editor — dark theme on light card (LeetCode-style) */}
      <div className="editor-shell">
        <Editor
          height="450px"
          language={language}
          value={code}
          onChange={setCode}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: 'var(--font-mono), Consolas, monospace',
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 16, bottom: 16 }
          }}
        />
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-3">
          <button
            onClick={runCode}
            disabled={isLoading}
            className="btn btn-secondary px-8"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : 'Run Code'}
          </button>
          <button
            onClick={runTestCases}
            disabled={isLoading}
            className="btn btn-primary px-8"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-[var(--on-accent)] border-t-transparent rounded-full animate-spin" />
            ) : 'Submit'}
          </button>
        </div>

        {/* Status Mini Display */}
        {(status || finalMessage) && (
          <div className="flex items-center gap-3 anim-fade-in">
            {status && (
              <span className={`badge font-bold px-3 py-1 uppercase tracking-widest text-[10px] ${
                status === 'Accepted' ? 'badge-green' :
                status === 'Wrong Answer' ? 'badge-red' :
                status === 'Runtime Error' ? 'badge-violet' :
                status === 'Compilation Error' ? 'badge-amber' :
                status === 'Time Limit Exceeded' ? 'badge-blue' :
                'badge-default'
              }`}>
                {status === 'Accepted' ? '✔ ' : '⚠ '}
                {status}
              </span>
            )}
            {finalMessage && (
              <span className="text-xs font-medium muted italic">
                {finalMessage}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Tabs System */}
      <div className="space-y-4">
        <div className="code-io-tabs">
          {[
            { id: 'input', label: 'Custom Input' },
            { id: 'output', label: 'Terminal Output' },
            { id: 'tests', label: `Test Results ${testResults.length > 0 ? `(${testResults.filter(r => r.passed).length}/${testResults.length})` : ''}` }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`code-io-tab ${activeTab === tab.id ? 'code-io-tab-active' : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="anim-fade-in">
          {activeTab === 'input' && (
            <div className="space-y-3">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full h-32 p-4 bg-[var(--surface)] border border-[var(--border)] rounded-xl font-mono text-sm text-[var(--text-primary)] focus:border-[var(--cyan)] focus:ring-2 focus:ring-[var(--cyan-dim)] transition-colors outline-none"
                placeholder="Enter custom input for 'Run Code'..."
              />
            </div>
          )}

          {activeTab === 'output' && (
            <div className="space-y-3">
              <pre className="editor-output h-32 scroll-smooth">
                {output || (
                  <span style={{ color: 'var(--editor-terminal-muted)' }}>
                    No output to show. Run your code to see results.
                  </span>
                )}
              </pre>
            </div>
          )}

          {activeTab === 'tests' && (
            <div className="space-y-4 max-h-64 overflow-auto pr-1">
              {testResults.length === 0 ? (
                <div className="h-full min-h-[10rem] flex flex-col items-center justify-center border-2 border-dashed border-[var(--border)] rounded-xl bg-[var(--surface-2)]/50 muted italic text-sm px-4 text-center">
                  Run 'Submit' to see test case results
                </div>
              ) : (
                <div className="grid gap-3">
                  {testResults.map((result, index) => (
                    <div key={index} className={`p-4 border rounded-xl transition-all ${
                      result.passed 
                        ? 'bg-[var(--emerald-dim)] border-[rgba(21,128,61,0.22)]' 
                        : 'bg-[rgba(220,38,38,0.06)] border-[rgba(220,38,38,0.2)]'
                    }`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            result.passed ? 'bg-[var(--emerald)] text-[var(--on-accent)]' : 'bg-[var(--red)] text-[var(--on-accent)]'
                          }`}>
                            {result.index}
                          </span>
                          <span className="font-bold text-sm">Test Case {result.index}</span>
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-tighter sm:tracking-widest ${
                          result.passed ? 'text-[var(--emerald)]' : 'text-[var(--red)]'
                        }`}>
                          {result.passed ? '✔ Passed' : '❌ Failed'}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                        <div className="space-y-1">
                          <div className="muted text-[9px] uppercase">Input</div>
                          <div className="bg-[var(--bg-2)] p-2 rounded border border-[var(--border)] truncate">{result.input}</div>
                        </div>
                        <div className="space-y-1">
                          <div className="muted text-[9px] uppercase">Expected</div>
                          <div className="bg-[var(--bg-2)] p-2 rounded border border-[var(--border)] truncate">{result.expected}</div>
                        </div>
                        <div className="col-span-2 space-y-1">
                          <div className="muted text-[9px] uppercase">Actual Output</div>
                          <div className={`p-2 rounded border ${result.passed ? 'bg-[var(--bg-2)] border-[var(--border)] text-[var(--text-primary)]' : 'bg-[rgba(220,38,38,0.08)] border-[rgba(220,38,38,0.22)] text-[var(--red)]'}`}>
                            {result.actual || 'No output'}
                          </div>
                        </div>
                      </div>
                      {result.error && (
                        <div className="mt-3 p-2 bg-[rgba(220,38,38,0.08)] rounded border border-[rgba(220,38,38,0.2)] text-[10px] text-[var(--red)] font-mono">
                          <strong>Error:</strong> {result.error}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}