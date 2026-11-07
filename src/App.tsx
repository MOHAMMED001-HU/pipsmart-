import { useEffect, useMemo, useState, useRef } from 'react';
import DemoTrading from './DemoTrading';
import MarketEngine from './MarketEngine';
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BookOpen,
  Calculator,
  ChartNoAxesCombined,
  CircleDollarSign,
  Clock3,
  GraduationCap,
  CheckCircle2,
  Circle,
  Plus,
  ShieldCheck,
  Target,
  Trash2,
  Wallet,
} from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import {
  AdMob,
  AdmobConsentStatus,
    BannerAdPosition,
  BannerAdSize,
  BannerAdPluginEvents,
} from '@capacitor-community/admob';
type Trade = {
  id: number;
  pair: string;
  side: 'Buy' | 'Sell';
  entry: number;
  stop: number;
  target: number;
  pnl: number;
  date: string;
};
type Tab = 'Overview' | 'Market' | 'Demo trading' | 'Trade journal' | 'Risk calculator' | 'Learn' | 'Academy';

const seedTrades: Trade[] = [];

const academyLessons = [
  {
    "id": "01",
    "title": "Forex market basics",
    "summary": "What forex is, who participates and why currency values change.",
    "points": [
      "Forex means exchanging one currency for another.",
      "Pairs show one currency priced against another.",
      "The market is active across global sessions on weekdays.",
      "Prices move as supply, demand and expectations change."
    ],
    "task": "In EUR/USD, identify the base currency and the quote currency."
  },
  {
    "id": "02",
    "title": "Currency pairs and quotes",
    "summary": "Read major, minor and exotic pairs, plus bid, ask and spread.",
    "points": [
      "The first currency is the base; the second is the quote.",
      "Major pairs include the US dollar.",
      "Bid is the sell price; ask is the buy price.",
      "The spread is the difference between ask and bid."
    ],
    "task": "Identify the base currency in GBP/JPY."
  },
  {
    "id": "03",
    "title": "Pips and price movement",
    "summary": "Understand how traders measure currency price changes.",
    "points": [
      "Most non-JPY pairs quote a pip at the fourth decimal place.",
      "JPY pairs commonly quote a pip at the second decimal place.",
      "Some platforms show fractional pips, often called points.",
      "Pip value depends on pair, size and account currency."
    ],
    "task": "How many pips is the move from 1.1000 to 1.1025 on EUR/USD?"
  },
  {
    "id": "04",
    "title": "Lots and position size",
    "summary": "Learn standard, mini and micro lots and why size matters.",
    "points": [
      "A standard lot is 100,000 units of base currency.",
      "A mini lot is 10,000 units; a micro lot is 1,000.",
      "Position size affects money gained or lost per pip.",
      "Choose size from your risk limit and stop distance."
    ],
    "task": "Why does a smaller lot usually mean lower pip exposure?"
  },
  {
    "id": "05",
    "title": "Leverage and margin",
    "summary": "Understand exposure, required margin and amplified losses.",
    "points": [
      "Leverage lets you control a larger position with less capital.",
      "Margin is collateral needed to maintain an open position.",
      "Leverage magnifies losses as well as gains.",
      "A margin close-out can happen quickly in volatile markets."
    ],
    "task": "Explain why high leverage does not make a trade safer."
  },
  {
    "id": "06",
    "title": "Stop-loss and take-profit",
    "summary": "Plan where a trade idea is invalidated and where you may exit.",
    "points": [
      "An entry is the price where you open a position.",
      "A stop-loss is intended to limit loss but can slip.",
      "A take-profit is a planned exit, not a guaranteed result.",
      "Set the stop from the trade idea, then adjust size."
    ],
    "task": "Give one reason a trader might exit before the target."
  },
  {
    "id": "07",
    "title": "Risk and reward",
    "summary": "Compare potential loss with potential gain and protect capital.",
    "points": [
      "Define the amount at risk before entering.",
      "Risk-to-reward compares planned loss with planned gain.",
      "A favourable ratio does not guarantee a winning strategy.",
      "Never risk money needed for essentials or borrowed funds."
    ],
    "task": "If risk is $10 and planned reward is $20, what is the ratio?"
  },
  {
    "id": "08",
    "title": "Candlesticks and charts",
    "summary": "Read open, high, low and close on a basic chart.",
    "points": [
      "Each candle shows open, high, low and close.",
      "The body shows the distance between open and close.",
      "Wicks show the high and low reached in that period.",
      "One candle alone is not a reliable trading signal."
    ],
    "task": "Find the body and wicks on three demo-chart candles."
  },
  {
    "id": "09",
    "title": "Sessions and volatility",
    "summary": "Understand major sessions and changing market activity.",
    "points": [
      "Sessions are commonly described as Sydney, Tokyo, London and New York.",
      "Activity can increase when sessions overlap.",
      "More volatility can mean greater risk.",
      "News can change spreads and prices quickly."
    ],
    "task": "Record one session time in your local time zone."
  },
  {
    "id": "10",
    "title": "Build a trading plan",
    "summary": "Turn an idea into written rules you can test on demo.",
    "points": [
      "Choose which pairs and timeframes you will study.",
      "Write objective entry and invalidation conditions.",
      "Set a maximum risk limit and daily stop rule.",
      "Test your rules on demo and record every outcome."
    ],
    "task": "Write three rules for a demo trading plan."
  },
  {
    "id": "11",
    "title": "Psychology and discipline",
    "summary": "Recognise fear, greed, revenge trading and overtrading.",
    "points": [
      "Emotions can push traders to abandon their plan.",
      "A loss is a possible outcome, not a reason to chase.",
      "Take a break when you feel pressured or angry.",
      "Judge your process over a series, not one result."
    ],
    "task": "Write one rule to help you avoid revenge trading."
  },
  {
    "id": "12",
    "title": "Review and improve",
    "summary": "Use journal records to learn from decisions, not chase profits.",
    "points": [
      "Record entry reasons, risk, exit and emotions.",
      "Review whether you followed your plan, not only whether you won.",
      "Look for repeated mistakes across a meaningful sample.",
      "Change one testable part of your process at a time."
    ],
    "task": "Review a demo trade: note one strength and one improvement."
  }
];

function readTrades(): Trade[] {
  try {
    const raw = localStorage.getItem('pipsmart-trades');
    return raw ? (JSON.parse(raw) as Trade[]) : seedTrades;
  } catch {
    return seedTrades;
  }
}
function App() {
  
      const admobStarted = useRef(false);

  
useEffect(() =>
  alert('PipSmart AdMob diagnostic started');
  if (!Capacitor.isNativePlatform() || admobStarted.current) return;

  const timer = window.setTimeout(async () => {
    if (admobStarted.current) return;
    admobStarted.current = true;

    try {
      console.log('PipSmart: Starting AdMob');

      let consentInfo = await AdMob.requestConsentInfo();

      alert('PipSmart consent: ' + JSON.stringify(consentInfo));

      if (
        consentInfo.isConsentFormAvailable &&
        consentInfo.status === AdmobConsentStatus.REQUIRED
      ) {
        consentInfo = await AdMob.showConsentForm();
      }

      if (!consentInfo.canRequestAds) {
        console.log('PipSmart: Consent prevents ad requests');
        return;
      }

      await AdMob.initialize();

      await AdMob.addListener(
        BannerAdPluginEvents.Loaded,
        () => console.log('PipSmart: Banner loaded successfully')
      );

      await AdMob.addListener(
        BannerAdPluginEvents.FailedToLoad,
        (error) => console.error('PipSmart: Banner failed:', error)
      );

      await AdMob.showBanner({
        adId: 'ca-app-pub-3940256099942544/6300978111',
        adSize: BannerAdSize.ADAPTIVE_BANNER,
        position: BannerAdPosition.BOTTOM_CENTER,
        margin: 0,
        isTesting: true,
      });

      console.log('PipSmart: Banner request sent');
    } catch (error) {
      console.error('PipSmart AdMob error:', error);
    }
  }, 1500);

  return () => window.clearTimeout(timer);
}, []);

  const [tab, setTab] = useState<Tab>('Overview');

  const [trades, setTrades] = useState<Trade[]>(readTrades);
  const [showForm, setShowForm] = useState(false);
  const [pair, setPair] = useState('EUR/USD');
  const [side, setSide] = useState<'Buy' | 'Sell'>('Buy');
  const [entry, setEntry] = useState('1.0850');
  const [stop, setStop] = useState('1.0820');
  const [target, setTarget] = useState('1.0910');
  const [pnl, setPnl] = useState('25');
  const [error, setError] = useState('');
  const [balance, setBalance] = useState('10000');
  const [demoStartingBalance, setDemoStartingBalance] = useState(() => {
    try { return localStorage.getItem('pipsmart-demo-starting-balance') || ''; } catch { return ''; }
  });
  const [demoSetupAmount, setDemoSetupAmount] = useState('10000');
  const [showDemoReset, setShowDemoReset] = useState(false);

  useEffect(() => {
    if (demoStartingBalance) localStorage.setItem('pipsmart-demo-starting-balance', demoStartingBalance);
  }, [demoStartingBalance]);
  const [riskPct, setRiskPct] = useState('1');
  const [stopPips, setStopPips] = useState('20');
  const [completedLessons, setCompletedLessons] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('pipsmart-academy-progress') || '[]') as string[]; } catch { return []; }
  });
  const [activeLesson, setActiveLesson] = useState('01');

  useEffect(() => {
    localStorage.setItem('pipsmart-trades', JSON.stringify(trades));
  }, [trades]);

  useEffect(() => {
    localStorage.setItem('pipsmart-academy-progress', JSON.stringify(completedLessons));
  }, [completedLessons]);

  const totalPnl = useMemo(
    () => trades.reduce((sum, trade) => sum + trade.pnl, 0),
    [trades]
  );
  const wins = trades.filter(t => t.pnl > 0).length;
  const winRate = trades.length ? Math.round((wins / trades.length) * 100) : 0;
  const riskAmount =
    (Math.max(0, Number(balance) || 0) * Math.max(0, Number(riskPct) || 0)) /
    100;
  const lotSize = riskAmount / (Math.max(0.1, Number(stopPips) || 0) * 10);

  function addTrade(e: React.FormEvent) {
    e.preventDefault();
    const values = [Number(entry), Number(stop), Number(target), Number(pnl)];
    if (
      !pair.trim() ||
      values.some(v => !Number.isFinite(v)) ||
      values.slice(0, 3).some(v => v <= 0)
    ) {
      setError('Enter a pair and valid positive prices and P/L.');
      return;
    }
    setTrades([
      {
        id: Date.now(),
        pair: pair.toUpperCase(),
        side,
        entry: values[0],
        stop: values[1],
        target: values[2],
        pnl: values[3],
        date: 'Just now',
      },
      ...trades,
    ]);
    setShowForm(false);
    setError('');
  }

  const nav: { label: Tab; icon: typeof Activity }[] = [
    { label: 'Overview', icon: ChartNoAxesCombined },
    { label: 'Market', icon: Activity },
    { label: 'Demo trading', icon: ChartNoAxesCombined },
    { label: 'Trade journal', icon: BookOpen },
    { label: 'Risk calculator', icon: Calculator },
    { label: 'Learn', icon: BookOpen },
    { label: 'Academy', icon: GraduationCap },
  ];

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">
            <Activity size={21} />
          </div>
          <span>
            pip<span className="brand-accent">smart</span>
          </span>
        </div>
        <div className="side-label">WORKSPACE</div>
        <nav>
          {nav.map(item => (
            <button
              key={item.label}
              className={tab === item.label ? 'nav-item active' : 'nav-item'}
              onClick={() => setTab(item.label)}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="safe-icon">
            <ShieldCheck size={18} />
          </div>
          <div>
            <strong>Practice mode</strong>
            <small>No real money involved</small>
          </div>
        </div>
      </aside>
      <main className="main">
        <header className="topbar">
          <div>
            <div className="eyebrow">YOUR TRADING WORKSPACE</div>
            <h1>{tab === 'Overview' ? 'Good morning, trader.' : tab}</h1>
          </div>
          <div className="top-actions">
            <span className="demo-pill">
              <span /> DEMO ACCOUNT
            </span>
            <div className="avatar">A</div>
          </div>
        </header>
        <div className="content">
          {tab === 'Market' && <MarketStudio />}
          {tab === 'Demo trading' && <DemoTrading initialBalance={Number(demoStartingBalance) || 10000} />}
          {tab === 'Overview' && (
            <>
              {!demoStartingBalance ? (
                <section className="panel demo-setup-panel">
                  <div className="panel-head"><div><span className="eyebrow">FIRST STEP · DEMO ACCOUNT</span><h3>Create your practice account</h3><p>Choose the virtual balance you want to practise with. No real money is involved.</p></div></div>
                  <label className="demo-balance-label">Choose starting balance (USD)
                    <select value={demoSetupAmount} onChange={e => setDemoSetupAmount(e.target.value)}>
                      <option value="1000">$1,000</option><option value="5000">$5,000</option><option value="10000">$10,000</option><option value="25000">$25,000</option><option value="50000">$50,000</option><option value="100000">$100,000</option>
                    </select>
                  </label>
                  <button className="primary-btn" onClick={() => setDemoStartingBalance(demoSetupAmount)}>Create demo account</button>
                  <p className="demo-safety-note">Virtual funds have no cash value and cannot be deposited or withdrawn. This is an educational simulator.</p>
                </section>
              ) : (
                <section className="demo-account-strip"><div><span className="eyebrow">YOUR VIRTUAL ACCOUNT</span><strong>${Number(demoStartingBalance).toLocaleString('en-US')} USD</strong><small>Practice funds · stored on this device</small></div><button className="outline-btn" onClick={() => setShowDemoReset(!showDemoReset)}>Reset account</button>{showDemoReset && <div className="demo-reset-confirm"><span>Reset your practice account? This only changes the saved starting balance.</span><button className="text-btn" onClick={() => { setDemoStartingBalance(''); setShowDemoReset(false); }}>Confirm reset</button><button className="text-btn" onClick={() => setShowDemoReset(false)}>Cancel</button></div>}</section>
              )}
              <section className="welcome-row">
                <div>
                  <h2>Build discipline, one trade at a time.</h2>
                  <p>Track your decisions, manage risk and keep learning.</p>
                </div>
                <button
                  className="primary-btn"
                  onClick={() => {
                    setTab('Trade journal');
                    setShowForm(true);
                  }}
                >
                  <Plus size={17} /> Log a trade
                </button>
              </section>
              <section className="global-note">
                <div className="global-note-icon">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <strong>Made for learners everywhere</strong>
                  <p>Learn forex concepts, practise with a demo journal and build a repeatable process. Start with the basics — never risk money you cannot afford to lose.</p>
                </div>
                <span className="global-note-tag">ENGLISH EDITION</span>
              </section>
              <section className="stats-grid">                  <Stat
                  icon={Wallet}
                  label="Demo starting balance"
                  value={demoStartingBalance ? `$${Number(demoStartingBalance).toLocaleString('en-US')}` : 'Not set'}
                  note="Your chosen virtual funds"
                />
                <Stat
                  icon={CircleDollarSign}
                  label="Total recorded P/L"
                  value={`${totalPnl >= 0 ? '+' : '-'}$${Math.abs(totalPnl).toFixed(2)}`}
                  note="From your journal entries"
                  positive={totalPnl >= 0}
                />
                <Stat
                  icon={Target}
                  label="Win rate"
                  value={`${winRate}%`}
                  note={`${wins} winning trades out of ${trades.length}`}
                />
                <Stat
                  icon={Activity}
                  label="Trades logged"
                  value={String(trades.length)}
                  note="Keep your journal updated"
                />
              </section>
              <section className="panel">
                <div className="panel-head">
                  <div>
                    <h3>Recent trades</h3>
                    <p>Your latest practice activity</p>
                  </div>
                  <button
                    className="text-btn"
                    onClick={() => setTab('Trade journal')}
                  >
                    View journal <ArrowUpRight size={15} />
                  </button>
                </div>
                <TradeTable
                  trades={trades.slice(0, 5)}
                  onDelete={id => setTrades(trades.filter(t => t.id !== id))}
                />
              </section>
              <section className="bottom-grid">
                <div className="tip-card">
                  <div className="tip-icon">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <span className="eyebrow">TRADER'S REMINDER</span>
                    <h3>Protect your capital first.</h3>
                    <p>
                      Decide your risk before you enter a trade. A good process
                      matters more than one winning result.
                    </p>
                  </div>
                </div>
                <div className="quick-card">
                  <span className="eyebrow">QUICK TOOL</span>
                  <h3>Plan your position size</h3>
                  <p>
                    Calculate an approximate lot size from your balance and
                    stop-loss.
                  </p>
                  <button
                    className="outline-btn"
                    onClick={() => setTab('Risk calculator')}
                  >
                    Open calculator <ArrowUpRight size={15} />
                  </button>
                </div>
              </section>
            </>
          )}
          {tab === 'Trade journal' && (
            <section className="panel journal-panel">
              <div className="panel-head">
                <div>
                  <h3>Trade journal</h3>
                  <p>Record the setup and outcome of every practice trade.</p>
                </div>
                <button
                  className="primary-btn"
                  onClick={() => setShowForm(!showForm)}
                >
                  <Plus size={17} /> Add trade
                </button>
              </div>
              {showForm && (
                <form className="trade-form" onSubmit={addTrade}>
                  <div className="form-title">New trade entry</div>
                  <div className="form-grid">
                    <label>
                      Currency pair
                      <input
                        value={pair}
                        onChange={e => setPair(e.target.value)}
                        required
                      />
                    </label>
                    <label>
                      Direction
                      <select
                        value={side}
                        onChange={e =>
                          setSide(e.target.value as 'Buy' | 'Sell')
                        }
                      >
                        <option>Buy</option>
                        <option>Sell</option>
                      </select>
                    </label>
                    <label>
                      Entry price
                      <input
                        type="number"
                        step="any"
                        value={entry}
                        onChange={e => setEntry(e.target.value)}
                        required
                      />
                    </label>
                    <label>
                      Stop-loss
                      <input
                        type="number"
                        step="any"
                        value={stop}
                        onChange={e => setStop(e.target.value)}
                        required
                      />
                    </label>
                    <label>
                      Take-profit
                      <input
                        type="number"
                        step="any"
                        value={target}
                        onChange={e => setTarget(e.target.value)}
                        required
                      />
                    </label>
                    <label>
                      Result (USD)
                      <input
                        type="number"
                        step="any"
                        value={pnl}
                        onChange={e => setPnl(e.target.value)}
                        required
                      />
                    </label>
                  </div>
                  {error && <p className="error">{error}</p>}
                  <div className="form-actions">
                    <button
                      type="button"
                      className="outline-btn"
                      onClick={() => setShowForm(false)}
                    >
                      Cancel
                    </button>
                    <button className="primary-btn" type="submit">
                      Save trade
                    </button>
                  </div>
                </form>
              )}
              <TradeTable
                trades={trades}
                onDelete={id => setTrades(trades.filter(t => t.id !== id))}
              />
              {trades.length === 0 && (
                <div className="empty-state">
                  No trades yet. Add your first practice trade to start building
                  your journal.
                </div>
              )}
            </section>
          )}
          {tab === 'Risk calculator' && (
            <section className="calculator-layout">
              <div className="panel calc-panel">
                <div className="panel-head">
                  <div>
                    <h3>Position size calculator</h3>
                    <p>Know your risk before entering a practice trade.</p>
                  </div>
                  <div className="calc-icon">
                    <Calculator size={20} />
                  </div>
                </div>
                <div className="calc-fields">
                  <label>
                    Account balance (USD)
                    <input
                      type="number"
                      min="0"
                      value={balance}
                      onChange={e => setBalance(e.target.value)}
                    />
                  </label>
                  <label>
                    Risk per trade (%)
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={riskPct}
                      onChange={e => setRiskPct(e.target.value)}
                    />
                  </label>
                  <label>
                    Stop-loss distance (pips)
                    <input
                      type="number"
                      min="0.1"
                      step="0.1"
                      value={stopPips}
                      onChange={e => setStopPips(e.target.value)}
                    />
                  </label>
                </div>
                <div className="result-box">
                  <span>Suggested position size</span>
                  <strong>
                    {Number.isFinite(lotSize) ? lotSize.toFixed(2) : '0.00'}{' '}
                    <small>lots</small>
                  </strong>
                  <div className="result-divider" />
                  <div className="result-line">
                    <span>Cash risk</span>
                    <b>${riskAmount.toFixed(2)}</b>
                  </div>
                  <div className="result-line">
                    <span>Risk percentage</span>
                    <b>{(Number(riskPct) || 0).toFixed(1)}%</b>
                  </div>
                </div>
                <p className="fine-print">
                  Estimate assumes a pip value of about $10 per pip for one
                  standard lot on many USD-quoted major pairs. Actual pip value
                  varies by pair, account currency and broker. Verify before
                  trading.
                </p>
              </div>
              <div className="side-note">
                <div className="tip-icon">
                  <ShieldCheck size={20} />
                </div>
                <h3>Keep risk small.</h3>
                <p>
                  Many traders choose to risk only a small fraction of their
                  account on a single trade. This calculator is an educational
                  estimate, not a trading instruction.
                </p>
              </div>
            </section>
          )}
          {tab === 'Academy' && <AcademyExperience completedLessons={completedLessons} setCompletedLessons={setCompletedLessons} activeLesson={activeLesson} setActiveLesson={setActiveLesson} />}
          {false && tab === 'Academy' && (
            <section className="academy-page">
              <div className="academy-hero">
                <div><span className="eyebrow">PIPSMART ACADEMY · BEGINNER PATH</span><h2>Learn forex from the ground up.</h2><p>Short, practical lessons designed to build understanding before you risk real money.</p></div>
                <div className="academy-progress"><strong>{completedLessons.length}/{academyLessons.length}</strong><span>lessons completed</span><div className="progress-track"><span style={{ width: `${completedLessons.length / academyLessons.length * 100}%` }} /></div></div>
              </div>
              <div className="academy-layout">
                <div className="academy-list"><div className="academy-list-head"><h3>Your learning path</h3><span>{Math.round(completedLessons.length / academyLessons.length * 100)}% complete</span></div>
                  {academyLessons.map(lesson => <button key={lesson.id} className={`academy-lesson ${activeLesson === lesson.id ? 'selected' : ''}`} onClick={() => setActiveLesson(lesson.id)}>{completedLessons.includes(lesson.id) ? <CheckCircle2 size={18} className="lesson-check done" /> : <Circle size={18} className="lesson-check" />}<span className="lesson-number">{lesson.id}</span><span className="lesson-copy"><strong>{lesson.title}</strong><small>BEGINNER · 8–12 MIN</small></span></button>)}
                </div>
                {(() => { const lesson = academyLessons.find(item => item.id === activeLesson) || academyLessons[0]; const done = completedLessons.includes(lesson.id); return <article className="academy-detail"><span className="eyebrow">LESSON {lesson.id} · BEGINNER</span><h3>{lesson.title}</h3><p className="academy-summary">{lesson.summary}</p><h4>What you will learn</h4><ul>{lesson.points.map(point => <li key={point}>{point}</li>)}</ul><div className="lesson-task"><strong>Practice task</strong><p>{lesson.task}</p></div><button className={done ? 'outline-btn completed-btn' : 'primary-btn'} onClick={() => setCompletedLessons(current => done ? current.filter(id => id !== lesson.id) : [...current, lesson.id])}>{done ? '✓ Completed · Mark incomplete' : 'Mark lesson complete'}</button><div className="lesson-navigation"><button className="text-btn" disabled={lesson.id === '01'} onClick={() => setActiveLesson(String(Number(lesson.id) - 1).padStart(2, '0'))}>Previous lesson</button><button className="text-btn" disabled={lesson.id === '12'} onClick={() => setActiveLesson(String(Number(lesson.id) + 1).padStart(2, '0'))}>Next lesson →</button></div></article>; })()}
              </div>
              <div className="academy-disclaimer"><ShieldCheck size={18} /><span>Education only. Lessons do not provide signals or guarantee results. Practise on demo and understand the risks before considering live trading.</span></div>
            </section>
          )}
          {tab === 'Learn' && (
            <section className="learn-grid">
              <LearnCard
                n="01"
                title="What is a currency pair?"
                text="Forex trading involves exchanging one currency against another. EUR/USD shows how many US dollars one euro is worth."
              />
              <LearnCard
                n="02"
                title="Entry, stop-loss and take-profit"
                text="Entry is your planned trade price. A stop-loss helps define where you exit if the market moves against you. Take-profit marks a planned exit in profit."
              />
              <LearnCard
                n="03"
                title="Understand risk-to-reward"
                text="Compare the amount you could lose if your stop is hit with the amount you aim to make if your target is reached."
              />
              <LearnCard
                n="04"
                title="Keep a trading journal"
                text="Record why you entered, how you managed the trade and what you learned. Review patterns instead of judging yourself by one result."
              />
              <LearnCard
                n="05"
                title="Pips, points and lot sizes"
                text="A pip is a standardised price movement for a currency pair. Lot size describes the amount traded; pip value changes with the pair, size and account currency."
              />
              <LearnCard
                n="06"
                title="Leverage and margin"
                text="Leverage lets a trader control a larger position with less deposited capital. It magnifies losses as well as gains, and a margin close-out can happen quickly."
              />
              <LearnCard
                n="07"
                title="Build a trading plan"
                text="Write down the markets you study, entry conditions, invalidation level, risk limit and review routine before practising a setup."
              />
              <LearnCard
                n="08"
                title="Review without chasing losses"
                text="Use your journal to find repeatable mistakes. Avoid revenge trading, overtrading and increasing risk to recover a loss."
              />
              <div className="learn-footer">
                <BookOpen size={19} />
                <span>
                  Learn the basics first. Practice on a demo account before
                  considering any real-money trading.
                </span>
              </div>
            </section>
          )}
          <footer>
            pipSmart is an educational practice tool, not a broker or investment adviser. Market charts are embedded from TradingView; quote availability and delays depend on its data providers. pipSmart provides no trade execution or broker connection. Journal entries are stored in this browser on this device; there is no account or cloud backup yet. Forex and leveraged products carry substantial risk.
            {' '}<a href="./privacy.html">Privacy & data</a>
          </footer>
        </div>
      </main>
    </div>
  );
}


const marketGroups = [
  { name: 'Major pairs', symbols: ['FX:EURUSD','FX:GBPUSD','FX:USDJPY','FX:USDCHF','FX:AUDUSD','FX:USDCAD','FX:NZDUSD'] },
  { name: 'Minor pairs', symbols: ['FX:EURGBP','FX:EURJPY','FX:GBPJPY','FX:EURCHF','FX:GBPAUD','FX:AUDJPY'] },
  { name: 'Exotic pairs', symbols: ['FX:USDMXN','FX:USDZAR','FX:USDTRY','FX:USDNOK','FX:USDSGD'] },
  { name: 'Metals', symbols: ['OANDA:XAUUSD','OANDA:XAGUSD'] },
];
const marketNames: Record<string,string> = {
  'FX:EURUSD':'EUR/USD','FX:GBPUSD':'GBP/USD','FX:USDJPY':'USD/JPY','FX:USDCHF':'USD/CHF',
  'FX:AUDUSD':'AUD/USD','FX:USDCAD':'USD/CAD','FX:NZDUSD':'NZD/USD','FX:EURGBP':'EUR/GBP',
  'FX:EURJPY':'EUR/JPY','FX:GBPJPY':'GBP/JPY','FX:EURCHF':'EUR/CHF','FX:GBPAUD':'GBP/AUD',
  'FX:AUDJPY':'AUD/JPY','FX:USDMXN':'USD/MXN','FX:USDZAR':'USD/ZAR','FX:USDTRY':'USD/TRY',
  'FX:USDNOK':'USD/NOK','FX:USDSGD':'USD/SGD','OANDA:XAUUSD':'XAU/USD','OANDA:XAGUSD':'XAG/USD'
};

const academyCourses = [
  {id:'foundations',number:'01',title:'Forex Foundations',level:'Beginner',description:'Learn what the Forex market is, how currencies are quoted and what moves prices.',lessonIds:['01','02','03']},
  {id:'charts',number:'02',title:'Understanding Charts',level:'Beginner',description:'Read price charts, candles, sessions and the basic structure of market movement.',lessonIds:['08','09']},
  {id:'technical',number:'03',title:'Technical Analysis',level:'Beginner to intermediate',description:'Build a structured way to read trends, levels and chart context before forming an idea.',lessonIds:['10']},
  {id:'risk',number:'04',title:'Risk Management',level:'Essential skills',description:'Understand position size, leverage, stops and the relationship between risk and reward.',lessonIds:['04','05','06','07']},
  {id:'mastery',number:'05',title:'Trading Mastery',level:'Ongoing practice',description:'Develop discipline, review decisions and improve a tested trading process.',lessonIds:['11','12']}
];
const lessonTeaching: Record<string,{reading:string[];example:string;checkpoint:string;answer:string}> = {
 '01':{reading:['Forex (foreign exchange) is the global market where one currency is exchanged for another. A trader studies how the value of one currency changes relative to another.','Currencies are quoted in pairs because every exchange has two sides. If EUR/USD is 1.0800, one euro is being quoted at 1.08 US dollars.','Banks, companies, governments, funds and individual traders participate for different reasons. Prices respond to buying and selling, economic data, interest-rate expectations and world events. Forex is risky; understanding the market does not make outcomes predictable.'],example:'If EUR/USD moves from 1.0800 to 1.0850, the euro has strengthened against the US dollar over that quoted move.',checkpoint:'What does the Forex market allow people to exchange?',answer:'One currency for another currency.'},
 '02':{reading:['A currency pair has a base currency (the first one) and a quote currency (the second one). The price tells you how much of the quote currency is needed for one unit of the base currency.','Major pairs include the US dollar and are commonly traded. Minor pairs do not include USD. Exotic pairs combine a major currency with a currency from a smaller or emerging market; their spreads can be wider and liquidity lower.','The bid is the price at which you can sell to the market, while the ask is the price at which you can buy. The spread is the difference between them and is one of the costs of trading.'],example:'In GBP/JPY, GBP is the base currency and JPY is the quote currency. A quote of 190.00 means one pound is priced at 190 yen.',checkpoint:'In EUR/USD, which currency is the base currency?',answer:'EUR, the euro, because it appears first in the pair.'},
 '03':{reading:['A pip is a standard unit used to describe price movement. For most major pairs, one pip is 0.0001. For many JPY pairs, one pip is 0.01. Some platforms display an extra fractional pip digit.','Pips help traders describe a move and calculate the distance between entry and stop-loss. The money value of a pip is not the same for every trade: it depends on the pair, position size and account currency.','Do not confuse a platform point with a pip. Check the symbol specification and your broker’s contract details before calculating risk.'],example:'EUR/USD moving from 1.1000 to 1.1025 is a 25-pip rise (25 × 0.0001).',checkpoint:'How many pips is EUR/USD moving from 1.1000 to 1.1025?',answer:'25 pips.'},
 '04':{reading:['A lot describes the size of a Forex position. A standard lot is usually 100,000 units of the base currency; a mini lot is 10,000 and a micro lot is 1,000. Broker contract specifications can differ.','The larger the position, the more money each pip movement can represent. That means position size should be calculated from the amount you can afford to risk and the distance to the stop-loss—not chosen because you want a bigger profit.','A position-size calculator gives an estimate. Pip value varies by pair and account currency, so verify the result with your broker’s specifications.'],example:'A 0.10-lot position is one tenth of a standard lot. On the same pair, its pip exposure is generally about one tenth of a 1.00-lot position.',checkpoint:'What should determine your position size?',answer:'Your planned cash risk, stop distance, pip value and account currency.'},
 '05':{reading:['Leverage lets a trader control a position larger than the cash margin set aside for it. It is expressed as a ratio, such as 1:30 or 1:100, depending on the broker and regulation.','Margin is collateral required to open and maintain a leveraged position. It is not a fee and it is not the maximum you can lose. A sharp move can create losses beyond expectations, and brokers may close positions when margin requirements are breached.','Higher leverage does not improve a trading strategy or make a trade safer. It can make it easier to take an oversized position. Understand the broker’s margin rules before trading.'],example:'With 1: leverage, a $1,000 margin amount may control a larger notional position, but losses are still calculated on the full exposure.',checkpoint:'Does leverage magnify losses as well as gains?',answer:'Yes. Leverage magnifies both gains and losses.'},
 '06':{reading:['An entry is the price at which a position is opened. A stop-loss is a pre-planned exit level intended to limit loss if the market moves against the idea. A take-profit is a planned level to close a trade if price reaches a chosen objective.','A stop-loss does not guarantee the exact exit price. Gaps, fast markets and slippage can cause a fill at a worse price. A take-profit is also not guaranteed to be reached.','First decide where the trade idea would no longer make sense. Then calculate position size from the stop distance and cash risk. Do not move a stop farther away simply to avoid accepting a loss.'],example:'If a planned buy entry is 1.0800 and the setup is invalid below 1.0770, the stop distance is 30 pips on EUR/USD.',checkpoint:'What is the main purpose of a stop-loss?',answer:'To define an exit if the trade idea is invalidated and help limit planned risk.'},
 '07':{reading:['Risk is the amount you could lose if the stop is reached, while reward is the potential gain if the target is reached. Risk-to-reward compares these two amounts. A 1:2 ratio means risking $1 for a possible $2—not a promise that the trade will win.','A high reward-to-risk ratio alone does not make a strategy profitable. Win rate, costs, execution and consistency matter. Test a clear method over a meaningful sample of demo trades.','Never risk money needed for rent, food, school fees or other essentials. Avoid borrowed money and do not increase risk to recover a loss.'],example:'If the planned loss is $10 and the planned gain is $20, the risk-to-reward ratio is 1:2 before costs and slippage.',checkpoint:'If you risk $10 to target $20, what is the planned ratio?',answer:'1:2.'},
 '08':{reading:['A candlestick summarises price movement during one selected period. The open is where the period began, the close is where it ended, and the high and low are the extremes reached.','The candle body shows the distance between open and close. The wicks (or shadows) show prices reached beyond the body. A bullish candle closes above its open; a bearish candle closes below its open. Chart colours can be customised, so check the chart legend.','One candle by itself is not a reliable signal. Traders consider the surrounding trend, important price areas, timeframe and risk before forming a plan.'],example:'On a 1-hour chart, each candle represents one hour of price data. A long upper wick means price traded higher during that hour but retreated before the close.',checkpoint:'What four prices does a standard candle represent?',answer:'Open, high, low and close.'},
 '09':{reading:['The Forex week is commonly described through the Sydney, Tokyo, London and New York trading sessions. These are broad market activity windows, not separate exchanges that switch the entire market on and off.','Activity and liquidity often change as sessions overlap. London and New York overlap is watched by many traders, but greater activity can also mean faster moves and wider risk around news.','Session times shift with daylight-saving changes in some countries. Use a reliable economic calendar and your platform’s clock rather than memorising one fixed local time.'],example:'A major US economic release during the New York session can cause rapid movement in USD pairs and spreads may widen.',checkpoint:'Why should a trader pay attention to session overlaps and news?',answer:'They can change liquidity, volatility, spreads and execution risk.'},
 '10':{reading:['Technical analysis is the study of historical price behaviour and chart structure to organise a trading idea. It does not predict the future with certainty. Start with a clean chart and identify whether price is making higher highs and higher lows, lower highs and lower lows, or moving sideways.','Support and resistance are areas where price has previously reacted; they are zones, not guaranteed barriers. A trendline is a visual guide, not proof that price must continue in one direction. Indicators are calculations based on price or volume and can lag.','Use more than one piece of context. Define the setup, the price level that would invalidate it, and the risk before entering. Practise marking charts and review whether your rules were objective.'],example:'On EUR/USD, you might mark a prior swing high as a resistance area, then wait to see how price behaves there instead of automatically selling at the line.',checkpoint:'Does a support or resistance area guarantee that price will reverse?',answer:'No. It is an area to observe; price can break through it.'},
 '11':{reading:['Trading psychology is how thoughts and emotions influence decisions. Fear can cause early exits; greed can encourage oversized positions; frustration can lead to revenge trading.','A written plan helps create space between an emotion and an action. Use a maximum daily loss rule, take breaks after stressful trades and avoid trading when tired or distracted.','Discipline does not mean winning every trade. It means following a sensible process, accepting uncertainty and recording mistakes honestly.'],example:'After two losses, a trader who increases lot size to win the money back is revenge trading. A planned break is a safer response.',checkpoint:'What should you do when you feel pressured to recover a loss immediately?',answer:'Stop, take a break and return only when calm and able to follow the plan.'},
 '12':{reading:['A trading journal records the reason for a trade, the entry, stop, target, position size, result and your emotional state. Screenshots of the chart before and after can help you review what happened.','Review a group of trades rather than drawing conclusions from one win or loss. Ask whether you followed your rules, whether the setup was clear and whether costs or execution changed the result.','Change one part of a strategy at a time and test the change on demo. Keep records honest; do not hide losses or judge your skill only by profit.'],example:'At the end of 20 demo trades, you might notice that most rule-breaking happened after a losing trade. Your next experiment could be a mandatory 15-minute break after any loss.',checkpoint:'What should a useful journal review measure besides profit or loss?',answer:'Whether you followed your plan and what repeatable patterns or mistakes appeared.'}
};
function AcademyExperience({completedLessons,setCompletedLessons,activeLesson,setActiveLesson}:{completedLessons:string[];setCompletedLessons:React.Dispatch<React.SetStateAction<string[]>>;activeLesson:string;setActiveLesson:(id:string)=>void}) {
 const [expandedCourse,setExpandedCourse] = useState('foundations');
 const [showAnswer,setShowAnswer] = useState(false);
 const lesson = academyLessons.find(item=>item.id===activeLesson) || academyLessons[0];
 const course = academyCourses.find(item=>item.lessonIds.includes(lesson.id)) || academyCourses[0];
 const teaching = lessonTeaching[lesson.id];
 const completed = completedLessons.length;
 const courseDone = course.lessonIds.filter(id=>completedLessons.includes(id)).length;
 const selectLesson = (id:string) => {setActiveLesson(id);setShowAnswer(false);};
 return <section className="academy-page">
  <div className="academy-hero"><div><span className="eyebrow">PIPSMART SCHOOL OF FOREX</span><h2>Learn Forex step by step.</h2><p>A structured learning path: start with the foundations, study each lesson, practise with examples and check your understanding before moving on.</p></div><div className="academy-progress"><strong>{completed}/12</strong><span>lessons completed · {Math.round(completed/12*100)}%</span><div className="progress-track"><span style={{width:`${completed/12*100}%`}}/></div></div></div>
  <div className="academy-layout">
   <div className="academy-list"><div className="academy-list-head"><h3>Course curriculum</h3><span>5 courses</span></div>
    {academyCourses.map(item=>{const done=item.lessonIds.filter(id=>completedLessons.includes(id)).length;const isOpen=expandedCourse===item.id;return <div className="academy-course" key={item.id}>
      <button className="academy-course-toggle" onClick={()=>setExpandedCourse(isOpen?'':item.id)}><span className="course-number">{item.number}</span><span className="course-title"><strong>{item.title}</strong><small>{item.level} · {done}/{item.lessonIds.length} lessons</small></span><span className="course-chevron">{isOpen?'−':'+'}</span></button>
      {isOpen&&<div className="academy-course-body"><p>{item.description}</p>{item.lessonIds.map(id=>{const l=academyLessons.find(x=>x.id===id)!;return <button key={id} className={activeLesson===id?'academy-lesson selected':'academy-lesson'} onClick={()=>selectLesson(id)}>{completedLessons.includes(id)?<CheckCircle2 size={17} className="lesson-check done"/>:<Circle size={17} className="lesson-check"/>}<span className="lesson-number">{id}</span><span className="lesson-copy"><strong>{l.title}</strong><small>LESSON · 8–12 MIN</small></span></button>})}</div>}
    </div>})}
   </div>
   <article className="academy-detail"><span className="eyebrow">COURSE {course.number} · LESSON {lesson.id}</span><h3>{lesson.title}</h3><p className="academy-summary">{lesson.summary}</p>
    <div className="lesson-reading">{teaching.reading.map((paragraph,i)=><p key={i}>{paragraph}</p>)}</div>
    <div className="lesson-example"><strong>Practical example</strong><p>{teaching.example}</p></div>
    <h4>Key points to remember</h4><ul>{lesson.points.map(point=><li key={point}>{point}</li>)}</ul>
    <div className="lesson-task"><strong>Check your understanding</strong><p>{teaching.checkpoint}</p><button className="text-btn" onClick={()=>setShowAnswer(!showAnswer)}>{showAnswer?'Hide answer':'Reveal answer'}</button>{showAnswer&&<p className="lesson-answer">{teaching.answer}</p>}</div>
    <div className="lesson-task"><strong>Put it into practice</strong><p>{lesson.task}</p><p className="lesson-hint">Try this on a demo chart or write your answer in your trading notes. Do not place a live trade to complete a lesson.</p></div>
    <button className={completedLessons.includes(lesson.id)?'outline-btn completed-btn':'primary-btn'} onClick={()=>setCompletedLessons(current=>current.includes(lesson.id)?current.filter(id=>id!==lesson.id):[...current,lesson.id])}>{completedLessons.includes(lesson.id)?'✓ Completed · Mark incomplete':'Mark lesson complete'}</button>
    <div className="lesson-navigation"><button className="text-btn" disabled={lesson.id==='01'} onClick={()=>selectLesson(String(Number(lesson.id)-1).padStart(2,'0'))}>← Previous lesson</button><button className="text-btn" disabled={lesson.id==='12'} onClick={()=>selectLesson(String(Number(lesson.id)+1).padStart(2,'0'))}>Next lesson →</button></div>
   </article>
  </div>
  <div className="academy-disclaimer"><ShieldCheck size={18}/><span>Educational content only. It is not financial advice, a signal service or a promise of results. Trading involves substantial risk. Practise on demo and verify broker-specific contract details.</span></div>
 </section>;
}

function MarketStudio() {
  const [selected,setSelected] = useState('FX:EURUSD');
  const [timeframe,setTimeframe] = useState('60');
  const [search,setSearch] = useState('');
  const [favourites,setFavourites] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('pipsmart-market-favourites') || '["FX:EURUSD","FX:GBPUSD","FX:USDJPY"]') as string[]; }
    catch { return ['FX:EURUSD','FX:GBPUSD','FX:USDJPY']; }
  });
  useEffect(() => { localStorage.setItem('pipsmart-market-favourites',JSON.stringify(favourites)); },[favourites]);
  const visibleGroups = marketGroups.map(group => ({...group,symbols:group.symbols.filter(symbol => (marketNames[symbol] || symbol).toLowerCase().includes(search.toLowerCase()))})).filter(group => group.symbols.length);
  const params = new URLSearchParams({symbol:selected,interval:timeframe,timezone:'Etc/UTC',theme:'dark',style:'1',locale:'en',enable_publishing:'false',allow_symbol_change:'true',calendar:'false',hide_top_toolbar:'false',hide_legend:'false',save_image:'false',support_host:'https://www.tradingview.com'});
  const toggleFavourite = (symbol:string) => setFavourites(current => current.includes(symbol) ? current.filter(item => item !== symbol) : [...current,symbol]);
  return <section className="market-studio">
    <MarketEngine />
    <div className="market-intro"><div><span className="eyebrow">PIPSMART MARKET WATCH</span><h2>Analyse the market.</h2><p>Choose a market, study price action and practise your technical analysis.</p></div><span className="market-provider">Powered by TradingView</span></div>
    <div className="market-workspace">
      <aside className="market-watch"><div className="watch-heading"><h3>Market watch</h3><span>{favourites.length} saved</span></div>
        <input className="market-search" aria-label="Search markets" placeholder="Search currency pairs..." value={search} onChange={event => setSearch(event.target.value)} />
        {favourites.length > 0 && <div className="watch-group"><h4>Favourites</h4>{favourites.filter(symbol => (marketNames[symbol] || symbol).toLowerCase().includes(search.toLowerCase())).map(symbol => <button key={symbol} className={selected===symbol?'market-symbol selected':'market-symbol'} onClick={()=>setSelected(symbol)}><span>{marketNames[symbol] || symbol}</span><span className="favourite-star" onClick={event=>{event.stopPropagation();toggleFavourite(symbol)}}>★</span></button>)}</div>}
        {visibleGroups.map(group=><div className="watch-group" key={group.name}><h4>{group.name}</h4>{group.symbols.map(symbol=><button key={symbol} className={selected===symbol?'market-symbol selected':'market-symbol'} onClick={()=>setSelected(symbol)}><span>{marketNames[symbol] || symbol}</span><span className="favourite-star" onClick={event=>{event.stopPropagation();toggleFavourite(symbol)}}>{favourites.includes(symbol)?'★':'☆'}</span></button>)}</div>)}
        {visibleGroups.length===0 && <p className="market-empty">No matching pairs found.</p>}
      </aside>
      <div className="market-chart-panel"><div className="market-chart-head"><div><strong>{marketNames[selected] || selected}</strong><small>Interactive chart · market data by TradingView</small></div><button className="market-fav-btn" onClick={()=>toggleFavourite(selected)}>{favourites.includes(selected)?'★ Saved':'☆ Add to favourites'}</button></div>
        <div className="timeframe-bar">{[['1','1m'],['5','5m'],['15','15m'],['30','30m'],['60','1H'],['240','4H'],['D','1D'],['W','1W'],['M','1M']].map(([value,label])=><button key={value} className={timeframe===value?'timeframe active':'timeframe'} onClick={()=>setTimeframe(value)}>{label}</button>)}</div>
        <iframe title={`TradingView chart for ${marketNames[selected] || selected}`} className="tradingview-frame" src={`https://www.tradingview.com/widgetembed/?${params.toString()}`} loading="lazy" allowFullScreen />
        <p className="market-disclaimer">Chart, symbol availability and quote delays are controlled by TradingView and its data providers. pipSmart does not independently provide or verify real-time prices and does not execute trades. Educational use only.</p>
      </div>
    </div>
  </section>;
}


function Stat({
  icon: Icon,
  label,
  value,
  note,
  positive,
}: {
  icon: typeof Wallet;
  label: string;
  value: string;
  note: string;
  positive?: boolean;
}) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <span>{label}</span>
        <div className="stat-icon">
          <Icon size={18} />
        </div>
      </div>
      <strong
        className={positive === undefined ? '' : positive ? 'green' : 'red'}
      >
        {value}
      </strong>
      <small>{note}</small>
    </div>
  );
}

function TradeTable({
  trades,
  onDelete,
}: {
  trades: Trade[];
  onDelete: (id: number) => void;
}) {
  if (!trades.length)
    return <div className="empty-state">No trades recorded yet.</div>;
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>PAIR</th>
            <th>TYPE</th>
            <th>ENTRY</th>
            <th>STOP / TARGET</th>
            <th>DATE</th>
            <th>RESULT</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {trades.map(t => (
            <tr key={t.id}>
              <td>
                <strong>{t.pair}</strong>
              </td>
              <td>
                <span className={t.side === 'Buy' ? 'type-buy' : 'type-sell'}>
                  {t.side}
                </span>
              </td>
              <td>{t.entry}</td>
              <td>
                {t.stop} / {t.target}
              </td>
              <td>{t.date}</td>
              <td className={t.pnl >= 0 ? 'green' : 'red'}>
                {t.pnl >= 0 ? '+' : '-'}${Math.abs(t.pnl).toFixed(2)}
              </td>
              <td>
                <button
                  className="delete-btn"
                  aria-label={`Delete ${t.pair} trade`}
                  onClick={() => onDelete(t.id)}
                >
                  <Trash2 size={15} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LearnCard({
  n,
  title,
  text,
}: {
  n: string;
  title: string;
  text: string;
}) {
  return (
    <article className="learn-card">
      <span>{n}</span>
      <h3>{title}</h3>
      <p>{text}</p>
    </article>
  );
}

export default App;
