import React, { useState, useEffect } from 'react';
import api from '../api';

export default function RatingManager({
  contest,
  participants,
  token,
  onUpdated,
}) {
  const [local, setLocal] = useState([]);
  const [saving, setSaving] = useState({});
  // Added message state to replace alerts
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    setLocal(
      participants.map((p) => ({
        ...p,
        newRating: p.rating_after ?? p.rating_before,
      }))
    );
  }, [participants]);

  const handleChange = (userId, value) => {
    setLocal((l) =>
      l.map((p) =>
        p.user_id === userId ? { ...p, newRating: Number(value) } : p
      )
    );
  };

  const save = async (userId) => {
    const p = local.find((x) => x.user_id === userId);
    if (!p) return;

    if (p.rating_after !== null && typeof p.rating_after !== 'undefined') {
      // Use styled message instead of alert
      setMessage({
        text: 'Rating already set and cannot be changed',
        type: 'error',
      });
      return;
    }

    setSaving((s) => ({ ...s, [userId]: true }));
    setMessage({ text: '', type: '' }); // Clear message on save
    try {
      await api.updateParticipantRating(token, contest.id, userId, p.newRating);
      setMessage({ text: `Rating for ${p.user_name} saved.`, type: 'success' });
      if (onUpdated) await onUpdated();
    } catch (err) {
      // Use styled message instead of alert
      setMessage({
        text: err?.message || 'Failed to update rating',
        type: 'error',
      });
    } finally {
      setSaving((s) => ({ ...s, [userId]: false }));
    }
  };

  // Helper to render styled messages
  const renderMessage = () => {
    if (!message.text) return null;
    const isSuccess = message.type === 'success';
    return (
      <div
        className={`mb-6 p-4 rounded-xl border ${
          isSuccess
             ? 'bg-[rgba(16,185,129,0.1)] text-[var(--emerald)] border-[rgba(16,185,129,0.2)]'
             : 'bg-[rgba(239,68,68,0.1)] text-[var(--red)] border-[rgba(239,68,68,0.2)]'
        } text-sm flex items-center gap-3 anim-fade-in`}
      >
        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isSuccess ? "M5 13l4 4L19 7" : "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"} /></svg>
        {message.text}
      </div>
    );
  };

  return (
    <div className="card p-8 anim-fade-in">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-2xl font-bold flex items-center gap-3">
            <svg className="w-6 h-6 text-[var(--cyan)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            Rating Manager
        </h3>
        <div className="badge badge-cyan text-[10px] font-bold uppercase tracking-widest">Administrator Tool</div>
      </div>

      {renderMessage()}

      {/* Styled empty state */}
      {!participants || participants.length === 0 ? (
        <div className="p-12 text-center muted italic bg-[var(--surface-2)]/30 border border-dashed border-[var(--border)] rounded-xl">
          No active participants found for this contest.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
          <table className="data-table">
            <thead>
              <tr>
                <th>Participant</th>
                <th className="!text-center">Current</th>
                <th className="!text-center">New Rating</th>
                <th className="!text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {local.map((p) => (
                <tr key={p.user_id}>
                  <td>
                    <div className="font-bold text-[var(--text-primary)]">{p.user_name}</div>
                    <div className="text-[10px] muted uppercase font-mono">{p.user_id}</div>
                  </td>
                  <td className="text-center font-mono muted">
                    {p.rating_before ?? '—'}
                  </td>
                  <td className="text-center">
                    {p.rating_after !== null &&
                    typeof p.rating_after !== 'undefined' ? (
                      <span className="badge badge-emerald font-mono font-bold text-sm">
                        {p.rating_after}
                      </span>
                    ) : (
                      <input
                        type="number"
                        className="form-input !py-1 !px-2 w-24 text-center !bg-[var(--surface-3)] !border-[var(--border)] focus:!border-[var(--cyan)] font-mono text-sm"
                        value={p.newRating}
                        onChange={(e) =>
                          handleChange(p.user_id, e.target.value)
                        }
                      />
                    )}
                  </td>
                  <td className="text-center">
                    {p.rating_after !== null &&
                    typeof p.rating_after !== 'undefined' ? (
                      <div className="flex items-center justify-center gap-1 muted text-xs uppercase font-bold tracking-tighter">
                         <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                         Finalized
                      </div>
                    ) : (
                      <button
                        className={`btn btn-primary !py-1 !px-4 !text-xs ${
                          saving[p.user_id] ? 'opacity-70 cursor-wait' : ''
                        }`}
                        onClick={() => save(p.user_id)}
                        disabled={saving[p.user_id]}
                      >
                        {saving[p.user_id] ? (
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 border-2 border-[var(--bg)] border-t-transparent rounded-full animate-spin" />
                                Saving
                            </div>
                        ) : 'Apply Rating'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}