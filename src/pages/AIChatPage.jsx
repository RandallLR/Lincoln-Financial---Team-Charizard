/**
 * AIChatPage.jsx
 * ─────────────────────────────────────────────────────────
 * AI Dental Coverage Assistant — full-page chat experience.
 *
 * Layout (mirrors the hand-drawn sketch):
 * ┌──────────────────────────────────────────────────────┐
 * │  Page header (title + subtitle)                       │
 * ├──────────────────────────────────────────────────────┤
 * │  Chat window (scrollable message history + input bar) │
 * ├────────────────────────┬─────────────────────────────┤
 * │  Coverage Summary      │  Providers Available         │
 * │  (your plan snapshot)  │  (in/out-of-network list)    │
 * └────────────────────────┴─────────────────────────────┘
 *
 * The chat is restricted to dental topics via the AI service layer.
 * Coverage and provider panels update dynamically based on chat context.
 *
 * To wire up a real LLM:
 *   1. Set VITE_USE_MOCK_AI=false in .env
 *   2. Set VITE_AI_API_URL to your LLM gateway
 *   3. Set VITE_AI_API_KEY to your API key
 *   See src/services/aiChatApi.js for full instructions.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchDentalCoverage, fetchDentalProviders } from '../services/dentalApi';
import { sendChatMessage, detectNetwork } from '../services/aiChatApi';
import styles from './AIChatPage.module.css';

// ── Simple markdown renderer ───────────────────────────────
// Handles bold (**text**), bullet lists, tables, and line breaks.
// No extra library needed — keeps the bundle lean.
function renderMarkdown(text) {
  if (!text) return null;

  const lines = text.split('\n');
  const elements = [];
  let tableBuffer = [];
  let listBuffer = [];
  let key = 0;

  function flushList() {
    if (listBuffer.length === 0) return;
    elements.push(
      <ul key={`ul-${key++}`} className={styles.mdList}>
        {listBuffer.map((item, i) => (
          <li key={i} className={styles.mdListItem}>
            {inlineMarkdown(item)}
          </li>
        ))}
      </ul>
    );
    listBuffer = [];
  }

  function flushTable() {
    if (tableBuffer.length < 2) {
      tableBuffer.forEach((l) =>
        elements.push(<p key={`p-${key++}`}>{inlineMarkdown(l)}</p>)
      );
      tableBuffer = [];
      return;
    }
    const headers = tableBuffer[0].split('|').filter((c) => c.trim());
    const rows = tableBuffer.slice(2).map((r) =>
      r.split('|').filter((c) => c.trim())
    );
    elements.push(
      <div key={`tbl-${key++}`} className={styles.mdTableWrap}>
        <table className={styles.mdTable}>
          <thead>
            <tr>
              {headers.map((h, i) => (
                <th key={i}>{inlineMarkdown(h.trim())}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => (
                  <td key={ci}>{inlineMarkdown(cell.trim())}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
    tableBuffer = [];
  }

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith('|')) {
      if (listBuffer.length) flushList();
      tableBuffer.push(trimmed);
      continue;
    }
    if (tableBuffer.length) flushTable();

    if (trimmed.startsWith('• ') || trimmed.startsWith('- ')) {
      listBuffer.push(trimmed.slice(2));
      continue;
    }
    if (listBuffer.length) flushList();

    if (trimmed === '') {
      elements.push(<span key={`br-${key++}`} className={styles.mdBreak} />);
      continue;
    }

    elements.push(
      <p key={`p-${key++}`} className={styles.mdPara}>
        {inlineMarkdown(trimmed)}
      </p>
    );
  }

  if (listBuffer.length) flushList();
  if (tableBuffer.length) flushTable();

  return elements;
}

function inlineMarkdown(text) {
  // **bold**, _italic_, `code`
  const parts = text.split(/(\*\*[^*]+\*\*|_[^_]+_|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**'))
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    if (part.startsWith('_') && part.endsWith('_'))
      return <em key={i}>{part.slice(1, -1)}</em>;
    if (part.startsWith('`') && part.endsWith('`'))
      return <code key={i} className={styles.mdCode}>{part.slice(1, -1)}</code>;
    return part;
  });
}

// ── Coverage summary panel ─────────────────────────────────
function CoverageSummary({ coverage, estimate, isInNetwork }) {
  if (!coverage) {
    return (
      <div className={styles.coveragePanel}>
        <h2 className={styles.panelHeading}>📋 Your Coverage</h2>
        <div className={styles.loadingShimmer} aria-busy="true" aria-label="Loading coverage data" />
        <div className={styles.loadingShimmer} style={{ width: '70%' }} />
        <div className={styles.loadingShimmer} style={{ width: '85%' }} />
      </div>
    );
  }

  const networkBadge = isInNetwork === true
    ? { label: 'In-Network', cls: styles.badgeGood }
    : isInNetwork === false
      ? { label: 'Out-of-Network', cls: styles.badgeWarn }
      : { label: 'Network TBD', cls: styles.badgeMuted };

  return (
    <section className={styles.coveragePanel} aria-labelledby="coverage-panel-heading">
      <h2 id="coverage-panel-heading" className={styles.panelHeading}>📋 Your Coverage</h2>

      {/* Plan name + network badge */}
      <div className={styles.planRow}>
        <span className={styles.planName}>{coverage.planName}</span>
        <span className={`${styles.badge} ${networkBadge.cls}`}>{networkBadge.label}</span>
      </div>

      {/* Coverage tiers */}
      <ul className={styles.coverageList} role="list">
        <li className={styles.coverageItem}>
          <span className={styles.coverageTier}>Preventive</span>
          <span className={`${styles.coveragePct} ${styles.pctGood}`}>100%</span>
        </li>
        <li className={styles.coverageItem}>
          <span className={styles.coverageTier}>Basic Restorative</span>
          <span className={`${styles.coveragePct} ${styles.pctMid}`}>80%</span>
        </li>
        <li className={styles.coverageItem}>
          <span className={styles.coverageTier}>Major Restorative</span>
          <span className={`${styles.coveragePct} ${styles.pctLow}`}>50%</span>
        </li>
        <li className={styles.coverageItem}>
          <span className={styles.coverageTier}>Orthodontia</span>
          <span className={`${styles.coveragePct} ${styles.pctLow}`}>50%</span>
        </li>
      </ul>

      <hr className={styles.divider} />

      {/* Key figures */}
      <dl className={styles.figureGrid}>
        <div className={styles.figureItem}>
          <dt className={styles.figureLabel}>Annual Max</dt>
          <dd className={styles.figureValue}>${(coverage.annualMaximum ?? 2000).toLocaleString()}</dd>
        </div>
        <div className={styles.figureItem}>
          <dt className={styles.figureLabel}>Deductible</dt>
          <dd className={styles.figureValue}>${coverage.deductible ?? 50}</dd>
        </div>
        <div className={styles.figureItem}>
          <dt className={styles.figureLabel}>Ortho Lifetime Max</dt>
          <dd className={styles.figureValue}>${(coverage.orthodontiaLifetimeMax ?? 1500).toLocaleString()}</dd>
        </div>
        <div className={styles.figureItem}>
          <dt className={styles.figureLabel}>Family Deductible</dt>
          <dd className={styles.figureValue}>${coverage.familyDeductible ?? 150}</dd>
        </div>
      </dl>

      {/* Dynamic estimate card — appears when AI returns cost data */}
      {estimate && (
        <div className={styles.estimateCard} role="status" aria-live="polite">
          <p className={styles.estimateTitle}>💰 Cost Estimate</p>
          <p className={styles.estimateProcedure}>{estimate.procedure}</p>
          <div className={styles.estimateRow}>
            <span>Typical cost</span>
            <span>${estimate.typicalCostRange.low}–${estimate.typicalCostRange.high}</span>
          </div>
          <div className={styles.estimateRow}>
            <span>Plan covers ({estimate.coveragePercent}%)</span>
            <span className={styles.estimateSave}>−${estimate.insurancePays.toLocaleString()}</span>
          </div>
          {estimate.deductibleApplied > 0 && (
            <div className={styles.estimateRow}>
              <span>Deductible remaining</span>
              <span className={styles.estimateWarn}>+${estimate.deductibleApplied}</span>
            </div>
          )}
          <div className={`${styles.estimateRow} ${styles.estimateTotal}`}>
            <span>Your estimated cost</span>
            <span>~${estimate.youPay.toLocaleString()}</span>
          </div>
          <p className={styles.estimateDisclaimer}>
            Estimates only — actual costs vary by provider.
          </p>
        </div>
      )}
    </section>
  );
}

// ── Providers panel ────────────────────────────────────────
function ProvidersPanel({ providers, loading, isInNetwork }) {
  const networkLabel = isInNetwork === false ? 'Out-of-Network' : 'In-Network';

  return (
    <section className={styles.providersPanel} aria-labelledby="providers-panel-heading">
      <h2 id="providers-panel-heading" className={styles.panelHeading}>
        🏥 Providers Available
        <span className={`${styles.badge} ${styles.badgeMuted} ${styles.badgeSm}`}>
          {networkLabel}
        </span>
      </h2>

      {loading && (
        <div aria-busy="true" aria-label="Loading providers">
          {[1, 2, 3].map((i) => (
            <div key={i} className={styles.providerShimmer} />
          ))}
        </div>
      )}

      {!loading && providers.length === 0 && (
        <p className={styles.emptyState}>
          Ask DentalBot about a procedure or location to load available providers.
        </p>
      )}

      {!loading && providers.length > 0 && (
        <ul className={styles.providerList} role="list">
          {providers.map((p) => (
            <li key={p.providerId} className={styles.providerCard}>
              <div className={styles.providerHeader}>
                <span className={styles.providerName}>{p.name}</span>
                <span
                  className={`${styles.badge} ${p.accepting ? styles.badgeGood : styles.badgeError}`}
                  aria-label={p.accepting ? 'Accepting new patients' : 'Not accepting new patients'}
                >
                  {p.accepting ? 'Accepting' : 'Full'}
                </span>
              </div>
              <span className={styles.providerSpecialty}>{p.specialty}</span>
              <address className={styles.providerAddress}>{p.address}</address>
              <a
                href={`tel:${p.phone}`}
                className={styles.providerPhone}
                aria-label={`Call ${p.name} at ${p.phone}`}
              >
                📞 {p.phone}
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

// ── Message bubble ─────────────────────────────────────────
function MessageBubble({ message }) {
  const isUser = message.role === 'user';
  const isError = message.role === 'error';

  return (
    <div
      className={`${styles.messageRow} ${isUser ? styles.messageRowUser : styles.messageRowBot}`}
      role="listitem"
    >
      {!isUser && (
        <div className={styles.botAvatar} aria-hidden="true">🤖</div>
      )}
      <div
        className={`${styles.bubble} ${
          isUser ? styles.bubbleUser : isError ? styles.bubbleError : styles.bubbleBot
        }`}
      >
        {isUser ? (
          <p className={styles.bubbleText}>{message.content}</p>
        ) : (
          <div className={styles.bubbleMarkdown}>
            {renderMarkdown(message.content)}
          </div>
        )}
        <time className={styles.bubbleTime} dateTime={message.timestamp}>
          {message.displayTime}
        </time>
      </div>
      {isUser && (
        <div className={styles.userAvatar} aria-hidden="true">👤</div>
      )}
    </div>
  );
}

// ── Typing indicator ───────────────────────────────────────
function TypingIndicator() {
  return (
    <div className={`${styles.messageRow} ${styles.messageRowBot}`} aria-live="polite" aria-label="DentalBot is typing">
      <div className={styles.botAvatar} aria-hidden="true">🤖</div>
      <div className={`${styles.bubble} ${styles.bubbleBot} ${styles.typingBubble}`}>
        <span className={styles.typingDot} />
        <span className={styles.typingDot} />
        <span className={styles.typingDot} />
      </div>
    </div>
  );
}

// ── Format timestamp ───────────────────────────────────────
function formatTime(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// ── Initial greeting message ───────────────────────────────
const INITIAL_MESSAGE = {
  id: 'init-0',
  role: 'bot',
  content:
    "Hi! I'm **DentalBot**, your AI dental coverage assistant.\n\nI can help you:\n• Estimate costs for any dental procedure\n• Explain what your plan covers\n• Clarify dental terminology (deductibles, copays, CDT codes…)\n• Find available in-network providers\n\nWhat dental service would you like to look into today? And are you looking for **in-network** or **out-of-network** providers?",
  timestamp: new Date().toISOString(),
  displayTime: formatTime(new Date()),
};

const INITIAL_SUGGESTIONS = [
  'How much is a routine cleaning?',
  'What does a crown cost in-network?',
  'Explain my deductible',
  'Show available providers',
  'What is a root canal?',
  'What does my plan cover?',
];

// ── Main page ──────────────────────────────────────────────
export default function AIChatPage() {
  const { user } = useAuth();

  // ── State ────────────────────────────────────────────────
  const [messages, setMessages]           = useState([INITIAL_MESSAGE]);
  const [inputValue, setInputValue]       = useState('');
  const [isTyping, setIsTyping]           = useState(false);
  const [suggestions, setSuggestions]     = useState(INITIAL_SUGGESTIONS);
  const [coverage, setCoverage]           = useState(null);
  const [coverageLoading, setCoverageLoading] = useState(true);
  const [providers, setProviders]         = useState([]);
  const [providersLoading, setProvidersLoading] = useState(false);
  const [isInNetwork, setIsInNetwork]     = useState(null); // null = unknown
  const [latestEstimate, setLatestEstimate] = useState(null);
  const [awaitingNetwork, setAwaitingNetwork] = useState(null); // procedure waiting for network

  // ── Refs ─────────────────────────────────────────────────
  const chatEndRef  = useRef(null);
  const inputRef    = useRef(null);

  // ── Load coverage on mount ───────────────────────────────
  useEffect(() => {
    fetchDentalCoverage()
      .then(setCoverage)
      .catch(() => setCoverage(null))
      .finally(() => setCoverageLoading(false));
  }, []);

  // ── Auto-scroll to latest message ───────────────────────
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // ── Load providers (optionally filtered by specialty keyword) ──
  const loadProviders = useCallback(async (specialtyFilter = null) => {
    setProvidersLoading(true);
    try {
      const zip = user?.address?.match(/\d{5}/)?.[0] ?? '19103';
      const data = await fetchDentalProviders(zip);

      // Filter by specialty if a procedure category was identified
      // so providers shown are actually relevant to the requested service
      if (specialtyFilter) {
        const filter = specialtyFilter.toLowerCase();
        const SPECIALTY_MAP = {
          orthodontia:        'orthodont',
          major_restorative:  null,      // general dentists handle most major work
          basic_restorative:  null,
          preventive:         null,
        };
        const keyword = SPECIALTY_MAP[filter];
        // Only filter when we have a meaningful specialty keyword
        if (keyword) {
          const filtered = data.filter((p) =>
            p.specialty.toLowerCase().includes(keyword)
          );
          setProviders(filtered.length > 0 ? filtered : data);
        } else {
          setProviders(data);
        }
      } else {
        setProviders(data);
      }
    } catch {
      setProviders([]);
    } finally {
      setProvidersLoading(false);
    }
  }, [user]);

  // ── Send a message ───────────────────────────────────────
  const sendMessage = useCallback(
    async (text) => {
      const trimmed = text.trim();
      if (!trimmed || isTyping) return;

      // Clear input + suggestions
      setInputValue('');
      setSuggestions([]);

      // Detect network preference from this message
      const detectedNetwork = detectNetwork(trimmed);
      let effectiveNetwork = isInNetwork;
      if (detectedNetwork === 'in') {
        setIsInNetwork(true);
        effectiveNetwork = true;
      } else if (detectedNetwork === 'out') {
        setIsInNetwork(false);
        effectiveNetwork = false;
      }

      // Handle quick-network-selection responses to awaitingNetwork state
      let resolvedNetwork = effectiveNetwork;
      if (awaitingNetwork) {
        if (trimmed.toLowerCase().includes('in-network') || trimmed.toLowerCase() === 'in-network provider') {
          resolvedNetwork = true;
          setIsInNetwork(true);
          effectiveNetwork = true;
        } else if (trimmed.toLowerCase().includes('out-of-network') || trimmed.toLowerCase() === 'out-of-network provider') {
          resolvedNetwork = false;
          setIsInNetwork(false);
          effectiveNetwork = false;
        } else if (trimmed.toLowerCase().includes('both')) {
          resolvedNetwork = true; // show in-network by default
        }
      }

      // Add user message
      const now = new Date();
      const userMsg = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: trimmed,
        timestamp: now.toISOString(),
        displayTime: formatTime(now),
      };
      setMessages((prev) => [...prev, userMsg]);
      setIsTyping(true);

      // Build conversation history for the AI (exclude initial bot greeting to save tokens)
      const history = messages
        .filter((m) => m.id !== 'init-0')
        .map((m) => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.content }));

      try {
        const aiResponse = await sendChatMessage({
          message: trimmed,
          conversationHistory: history,
          coverage: coverage ?? {},
          isInNetwork: resolvedNetwork,
        });

        const botNow = new Date();
        const botMsg = {
          id: `bot-${Date.now()}`,
          role: 'bot',
          content: aiResponse.text,
          timestamp: botNow.toISOString(),
          displayTime: formatTime(botNow),
        };

        setMessages((prev) => [...prev, botMsg]);

        // Update side panels from AI response
        if (aiResponse.suggestedReplies?.length) {
          setSuggestions(aiResponse.suggestedReplies);
        }
        if (aiResponse.estimate) {
          setLatestEstimate(aiResponse.estimate);
        }
        // Always reload providers when triggered — pass procedure category
        // so the list can be filtered to relevant specialties
        if (aiResponse.providerTrigger) {
          loadProviders(aiResponse.estimate?.category ?? null);
        }
        if (aiResponse.awaitingNetwork) {
          setAwaitingNetwork(aiResponse.awaitingNetwork);
        } else {
          setAwaitingNetwork(null);
        }
      } catch (err) {
        const errNow = new Date();
        // err.message is always a string when thrown from aiChatApi.js
        // but guard against anything unexpected
        const errText = typeof err?.message === 'string' && err.message
          ? err.message
          : 'An unexpected error occurred. Please try again.';
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: 'error',
            content: `Sorry, I ran into an issue: ${errText}`,
            timestamp: errNow.toISOString(),
            displayTime: formatTime(errNow),
          },
        ]);
      } finally {
        setIsTyping(false);
        inputRef.current?.focus();
      }
    },
    [isTyping, isInNetwork, awaitingNetwork, messages, coverage, loadProviders]
  );

  // ── Handle form submit ───────────────────────────────────
  function handleSubmit(e) {
    e.preventDefault();
    sendMessage(inputValue);
  }

  // ── Handle Enter key (Shift+Enter = newline) ─────────────
  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  }

  // ── Clear chat ───────────────────────────────────────────
  function handleClearChat() {
    setMessages([{ ...INITIAL_MESSAGE, timestamp: new Date().toISOString(), displayTime: formatTime(new Date()) }]);
    setSuggestions(INITIAL_SUGGESTIONS);
    setLatestEstimate(null);
    setAwaitingNetwork(null);
    setIsInNetwork(null);
    setProviders([]);
  }

  // ── Render ───────────────────────────────────────────────
  return (
    <div className={styles.page}>

      {/* ── Page header ──────────────────────────────────── */}
      <header className={styles.pageHeader}>
        <div className={styles.pageHeaderLeft}>
          <h1 className={styles.heading}>🤖 AI Dental Coverage Assistant</h1>
          <p className={styles.subheading}>
            Powered by DentalBot — ask about procedures, costs, coverage, or providers.
            Chat is restricted to dental topics.
          </p>
        </div>
        <div className={styles.pageHeaderRight}>
          <span className={styles.aiBadge}>AI-Assisted</span>
          <span className={styles.planBadge}>
            {coverageLoading ? 'Loading plan…' : (coverage?.planName ?? 'Lincoln Dental Premier')}
          </span>
        </div>
      </header>

      {/* ── Chat window ──────────────────────────────────── */}
      <section className={styles.chatSection} aria-label="Chat with DentalBot">

        {/* Message list */}
        <div
          className={styles.messageList}
          role="list"
          aria-live="polite"
          aria-label="Conversation history"
        >
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          {isTyping && <TypingIndicator />}
          <div ref={chatEndRef} aria-hidden="true" />
        </div>

        {/* Suggested quick replies */}
        {suggestions.length > 0 && !isTyping && (
          <div className={styles.suggestionsBar} role="group" aria-label="Suggested questions">
            {suggestions.map((s) => (
              <button
                key={s}
                className={styles.chip}
                onClick={() => sendMessage(s)}
                aria-label={`Ask: ${s}`}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input area */}
        <form
          className={styles.inputBar}
          onSubmit={handleSubmit}
          aria-label="Send a message to DentalBot"
        >
          <div className={styles.networkToggle} role="group" aria-label="Select network type">
            <button
              type="button"
              className={`${styles.networkBtn} ${isInNetwork === true ? styles.networkBtnActive : ''}`}
              onClick={() => setIsInNetwork(true)}
              aria-pressed={isInNetwork === true}
            >
              In-Network
            </button>
            <button
              type="button"
              className={`${styles.networkBtn} ${isInNetwork === false ? styles.networkBtnActiveOut : ''}`}
              onClick={() => setIsInNetwork(false)}
              aria-pressed={isInNetwork === false}
            >
              Out-of-Network
            </button>
          </div>

          <textarea
            ref={inputRef}
            className={styles.input}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about a dental procedure, cost, or coverage…"
            rows={1}
            aria-label="Message input"
            disabled={isTyping}
            maxLength={500}
          />

          <div className={styles.inputActions}>
            <button
              type="submit"
              className={styles.sendBtn}
              disabled={!inputValue.trim() || isTyping}
              aria-label="Send message"
            >
              {isTyping ? (
                <span className={styles.sendSpinner} aria-hidden="true" />
              ) : (
                '➤'
              )}
            </button>
            <button
              type="button"
              className={styles.clearBtn}
              onClick={handleClearChat}
              aria-label="Clear conversation"
              title="Start a new conversation"
            >
              ↺
            </button>
          </div>
        </form>
      </section>

      {/* ── Bottom panels: Coverage + Providers ──────────── */}
      <div className={styles.panelsRow}>
        <CoverageSummary
          coverage={coverage}
          estimate={latestEstimate}
          isInNetwork={isInNetwork}
        />
        <ProvidersPanel
          providers={providers}
          loading={providersLoading}
          isInNetwork={isInNetwork}
        />
      </div>

      {/* ── Disclaimer ───────────────────────────────────── */}
      <footer className={styles.disclaimer} role="contentinfo">
        <p>
          ⚠️ DentalBot provides general information and estimates based on your current plan data.
          It is not a substitute for advice from your insurance administrator or a licensed dental provider.
          Always verify coverage details and cost estimates with your provider before scheduling services.
        </p>
      </footer>
    </div>
  );
}
