import axios from 'axios';

const JUDGE0_URL = 'http://localhost:2358/submissions';
const AUTHN_TOKEN = process.env.AUTHN_TOKEN || '';

export const runCode = async (req, res) => {
  try {
    const { source_code, language_id, input } = req.body;

    const headers = {
      'Content-Type': 'application/json',
    };

    if (AUTHN_TOKEN) {
      headers['X-Auth-Token'] = AUTHN_TOKEN;
    }

    const response = await axios.post(
      `${JUDGE0_URL}?base64_encoded=false&wait=false`,
      {
        source_code,
        language_id,
        stdin: input,
      },
      {
        headers,
      }
    );

    res.json({ token: response.data.token });
  } catch (error) {
    console.error('Judge0 API error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to submit code' });
  }
};

export const getCodeResult = async (req, res) => {
  try {
    const { token } = req.params;

    let result;
    let retries = 0;
    const maxRetries = 10;

    const resultHeaders = {};
    if (AUTHN_TOKEN) {
      resultHeaders['X-Auth-Token'] = AUTHN_TOKEN;
    }

    while (retries < maxRetries) {
      const response = await axios.get(`${JUDGE0_URL}/${token}`, {
        headers: resultHeaders,
      });

      result = response.data;

      // Status 1: In Queue, 2: Processing
      if (result.status.id === 1 || result.status.id === 2) {
        retries++;
        await new Promise(resolve => setTimeout(resolve, 1500)); // Wait 1.5 seconds
        continue;
      }

      break;
    }

    if (!result) {
      return res.status(500).json({ message: 'Failed to get result' });
    }

    res.json({
      output: result.stdout,
      error: result.stderr || result.compile_output,
      status: result.status.description,
    });
  } catch (error) {
    console.error('Judge0 result error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to get result' });
  }
};