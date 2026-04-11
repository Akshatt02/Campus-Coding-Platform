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
  const { token, user } = useContext(AuthContext);
  const [code, setCode] = useState(DEFAULT_CODE.javascript);
  const [language, setLanguage] = useState('javascript');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [status, setStatus] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('input');
  const [testResults, setTestResults] = useState([]);
  const [testCases, setTestCases] = useState([]);
  const [finalMessage, setFinalMessage] = useState('');

  const isAdminOrFaculty = user?.role === 'admin' || user?.role === 'faculty';

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
    setIsRunning(true);
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
      setIsRunning(false);
    }
  };

  const runTestCases = async () => {
    setIsSubmitting(true);
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
    setStatus(allPassed ? 'Accepted' : (verdictStatus || 'Wrong Answer'));
    
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
        setFinalMessage('Successfully Executed');
        if (onSubmit) onSubmit();
      } catch (error) {
        console.error('Failed to save submission:', error);
        setFinalMessage('Successfully Executed (submission error)');
      }
    } else {
      setFinalMessage('Successfully Executed');
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="flex flex-col h-full min-h-[400px] bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden shadow-sm">
      {/* Top Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[var(--surface-2)] border-b border-[var(--border)]">
        <div className="flex items-center gap-2 overflow-hidden mr-4">
          <div className="w-2 h-2 rounded-full bg-[var(--emerald)]" />
          <h3 className="text-sm font-bold truncate">
            {problemTitle || 'Code Editor'}
          </h3>
          {contextLabel && (
            <span className="badge badge-cyan !text-[10px] !py-0.5 ml-2 whitespace-nowrap">
              {contextLabel}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="text-[12px] font-semibold bg-transparent border-none focus:ring-0 cursor-pointer text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            {Object.entries(LANGUAGES).map(([key, lang]) => (
              <option key={key} value={key}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Editor Main Area */}
      <div className="flex-grow relative editor-shell !border-none !rounded-none !shadow-none">
        <Editor
          height="100%"
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
            padding: { top: 16, bottom: 16 },
            contextmenu: false,
            scrollbar: {
              verticalScrollbarSize: 10,
              horizontalScrollbarSize: 10,
            }
          }}
        />
      </div>

      {/* Bottom Interface */}
      <div className="flex flex-col border-t border-[var(--border)] bg-[var(--surface)]">
        {/* Tabs System */}
        <div className="flex border-b border-[var(--border)] px-4 bg-[var(--surface-2)]">
          {[
            { id: 'input', label: 'Custom Input' },
            { id: 'output', label: 'Output' },
            { id: 'tests', label: `Tests ${testResults.length > 0 ? `(${testResults.filter(r => r.passed).length}/${testResults.length})` : ''}`, hidden: isAdminOrFaculty }
          ].filter(tab => !tab.hidden).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider border-b-2 transition-all ${
                activeTab === tab.id 
                  ? 'border-[var(--cyan)] text-[var(--cyan)] bg-[var(--surface)]' 
                  : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="h-48 overflow-auto bg-[var(--bg)] p-4">
          {activeTab === 'input' && (
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full h-full p-3 bg-[var(--surface)] border border-[var(--border)] rounded-lg font-mono text-[13px] text-[var(--text-primary)] focus:ring-1 focus:ring-[var(--cyan)] outline-none resize-none"
              placeholder="Enter custom input..."
            />
          )}

          {activeTab === 'output' && (
            <div className="font-mono text-[13px] leading-relaxed">
              {output ? (
                <div className="space-y-4">
                  <div className="p-3 bg-[var(--editor-terminal-bg)] text-[var(--editor-terminal-fg)] rounded-lg border border-[var(--border)] whitespace-pre-wrap min-h-[4rem]">
                    {output}
                  </div>
                  {status && (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Status:</span>
                      <span className={`text-[11px] font-bold ${
                        status === 'Accepted' ? 'text-[var(--emerald)]' : 'text-[var(--red)]'
                      }`}>
                        {status}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-[var(--text-muted)] italic">
                  Run your code to see results
                </div>
              )}
            </div>
          )}

          {activeTab === 'tests' && (
            <div className="space-y-3">
              {testResults.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-[var(--text-muted)] italic">
                  {isAdminOrFaculty ? "Run results will appear here" : "Submit your code to see test case results"}
                </div>
              ) : (
                <div className="grid gap-2">
                  {testResults.map((result, idx) => (
                    <div key={idx} className={`p-3 border rounded-lg ${
                      result.passed ? 'bg-[var(--emerald-dim)] border-[rgba(21,128,61,0.15)]' : 'bg-[rgba(220,38,38,0.05)] border-[rgba(220,38,38,0.15)]'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] font-bold">Case {result.index}</span>
                        <span className={`text-[10px] font-bold uppercase ${result.passed ? 'text-[var(--emerald)]' : 'text-[var(--red)]'}`}>
                          {result.passed ? 'Passed' : 'Failed'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-[var(--surface-2)] border-t border-[var(--border)]">
          <div className="flex items-center gap-3 anim-fade-in">
            {finalMessage && (
              <div className="flex items-center gap-2 px-3 py-1 bg-[var(--emerald-dim)] border border-[rgba(21,128,61,0.2)] rounded-full animate-in fade-in zoom-in duration-300">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--emerald)] animate-pulse" />
                <span className="text-[11px] font-bold text-[var(--emerald)] uppercase tracking-wide">
                  {finalMessage}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={runCode}
              disabled={isRunning || isSubmitting}
              className="flex items-center justify-center min-w-[110px] h-9 px-4 text-[12px] font-bold bg-[#f3f4f6] text-[#374151] hover:bg-[#e5e7eb] rounded-lg transition-all active:scale-95 disabled:opacity-50 disabled:scale-100"
            >
              {isRunning ? (
                <div className="w-3.5 h-3.5 border-2 border-[#374151] border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <svg className="w-3.5 h-3.5 mr-1.5 opacity-80" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                  Run Code
                </>
              )}
            </button>
            
            {!isAdminOrFaculty && (
              <button
                onClick={runTestCases}
                disabled={isRunning || isSubmitting}
                className="flex items-center justify-center min-w-[110px] h-9 px-4 text-[12px] font-bold bg-[#15803d] text-white hover:bg-[#166534] hover:shadow-lg hover:shadow-emerald-900/20 rounded-lg transition-all active:scale-95 disabled:opacity-50 disabled:scale-100"
              >
                {isSubmitting ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5 mr-1.5 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Submit
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}