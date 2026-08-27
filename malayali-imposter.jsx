import { useState } from "react";

// ---------- Design tokens ----------
const COLORS = {
  bg: "#0F2A1F",
  bgSoft: "#173627",
  card: "#1D4632",
  cardEdge: "#2E5C42",
  gold: "#E3B23C",
  goldDim: "#B9862A",
  red: "#C4432B",
  cream: "#F5EEDC",
  creamDim: "#B9C9BB",
  ink: "#0B1F16",
};

const FONT_IMPORT =
  "@import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;700;800&family=Poppins:wght@400;500;600&family=JetBrains+Mono:wght@500&display=swap');";

const WORD_BANK = {
  "Onam & Pooram": [
    "Onam", "Vishu", "Thrissur Pooram", "Vallam Kali", "Pulikali",
    "Sadya", "Pookalam", "Uriyadi", "Onathappan", "Thumbi Thullal",
    "Onavillu", "Athachamayam", "Thiruvathira", "Kudamattam",
  ],
  "Food & Sadya": [
    "Puttu", "Appam", "Meen Curry", "Parippu Curry", "Sambar",
    "Payasam", "Kappa", "Beef Fry", "Idiyappam", "Avial",
    "Erissery", "Thoran", "Pazham Pori", "Kozhi Curry", "Malabar Biriyani",
    "Fish Molee", "Chatti Pathiri", "Banana Chips", "Chaya", "Kallappam",
  ],
  "Nadu (Places)": [
    "Kochi", "Munnar", "Alappuzha", "Wayanad", "Guruvayoor",
    "Fort Kochi", "Athirappilly", "Varkala", "Thekkady", "Kumarakom",
    "Kozhikode", "Thrissur", "Kollam", "Kannur", "Bekal Fort",
    "Vagamon", "Marine Drive Kochi", "Kovalam", "Idukki", "Nilambur",
  ],
  "Cinema & Actors": [
    "Mohanlal", "Mammootty", "Fahadh Faasil", "Dulquer Salmaan",
    "Manjummel Boys", "Drishyam", "Premam", "Bangalore Days", "Lucifer", "2018 Movie",
    "Nivin Pauly", "Tovino Thomas", "Prithviraj", "Parvathy Thiruvothu",
    "Manju Warrier", "Suraj Venjaramoodu", "Kumbalangi Nights", "Ustad Hotel",
    "Vadakkunokkiyantram", "Aavesham",
  ],
  "Veedu Vibe": [
    "Umbrella", "Chetta", "Chechi", "Autorickshaw", "Toddy Shop",
    "Bus Conductor", "Ammachi", "Nadumuttam", "Kasavu Mundu", "Filter Coffee",
    "Naadan Kozhi", "Verandah", "Coconut Tree", "Umbrella Stand", "Power Cut",
  ],
  "Slang & Mood": [
    "Adipoli", "Poli", "Kidu", "Kalippu", "Scene Aanu",
    "Vere Level", "Pwoli", "Ayyo", "Machane", "Freak Aavan",
    "Kidilan", "Mass", "Loham", "Chethi", "Onnum Parayanda",
  ],
};

const CATEGORY_NAMES = Object.keys(WORD_BANK);
const CONFETTI_EMOJI = ["⭐", "🎬", "🎉", "🥥", "🔥", "🌟", "🍿"];

function pickWord(category) {
  const cat = category === "Random Mix"
    ? CATEGORY_NAMES[Math.floor(Math.random() * CATEGORY_NAMES.length)]
    : category;
  const words = WORD_BANK[cat];
  return { category: cat, word: words[Math.floor(Math.random() * words.length)] };
}

function shuffledIndices(n) {
  const arr = Array.from({ length: n }, (_, i) => i);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function App() {
  const [phase, setPhase] = useState("home"); // home | setup | reveal | discuss | ended
  const [players, setPlayers] = useState([]); // {id, name, role} — persists across games
  const [nameInput, setNameInput] = useState("");
  const [category, setCategory] = useState("Random Mix");
  const [imposterCount, setImposterCount] = useState(1);
  const [secret, setSecret] = useState({ category: "", word: "" });
  const [revealIndex, setRevealIndex] = useState(0);
  const [cardOpen, setCardOpen] = useState(false);

  const maxImposters = players.length >= 6 ? 2 : 1;

  function addPlayer() {
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    setPlayers((p) => [...p, { id: Date.now() + Math.random(), name: trimmed, role: "crew" }]);
    setNameInput("");
  }

  function removePlayer(id) {
    setPlayers((p) => p.filter((pl) => pl.id !== id));
  }

  function startGame() {
    if (players.length < 3) return;
    const { category: cat, word } = pickWord(category);
    const order = shuffledIndices(players.length);
    const impSet = new Set(order.slice(0, Math.min(imposterCount, maxImposters)));
    const withRoles = players.map((pl, i) => ({
      ...pl,
      role: impSet.has(i) ? "imposter" : "crew",
    }));
    setPlayers(withRoles);
    setSecret({ category: cat, word });
    setRevealIndex(0);
    setCardOpen(false);
    setPhase("reveal");
  }

  function nextReveal() {
    setCardOpen(false);
    if (revealIndex + 1 >= players.length) {
      setPhase("discuss");
    } else {
      setRevealIndex((i) => i + 1);
    }
  }

  function revealImposter() {
    setPhase("ended");
  }

  function playAgain() {
    // players list carries over automatically — only roles get reshuffled on next startGame
    setPhase("setup");
  }

  function clearPlayers() {
    setPlayers([]);
    setPhase("setup");
  }

  return (
    <div style={styles.page}>
      <style>{`${FONT_IMPORT}
        * { box-sizing: border-box; }
        .flip-outer { perspective: 1200px; }
        .flip-inner {
          position: relative; width: 100%; height: 100%;
          transform-style: preserve-3d; transition: transform 0.6s cubic-bezier(.4,.2,.2,1);
        }
        .flip-inner.open { transform: rotateY(180deg); }
        .flip-face { position: absolute; inset: 0; backface-visibility: hidden; border-radius: 20px; }
        .flip-back { transform: rotateY(180deg); }
        button { font-family: inherit; cursor: pointer; }
        input { font-family: inherit; }
        ::selection { background: ${COLORS.gold}; color: ${COLORS.ink}; }

        @keyframes popIn {
          0% { transform: scale(0.5) rotate(-4deg); opacity: 0; }
          70% { transform: scale(1.08) rotate(2deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes spinSlow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes wiggle {
          0%, 100% { transform: rotate(-2.5deg); }
          50% { transform: rotate(2.5deg); }
        }
        @keyframes fall {
          0% { transform: translateY(-40px) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          100% { transform: translateY(420px) rotate(340deg); opacity: 0; }
        }
        @keyframes floatBadge {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        .pop-in { animation: popIn 0.45s cubic-bezier(.3,1.4,.4,1) both; }
        .wiggle { animation: wiggle 2.4s ease-in-out infinite; display: inline-block; }
        .spin-slow { animation: spinSlow 9s linear infinite; }
        .float-badge { animation: floatBadge 2.6s ease-in-out infinite; }
      `}</style>

      <div style={styles.shell}>
        <Header />

        {phase === "home" && <HomeScreen goToSetup={() => setPhase("setup")} />}

        {phase === "setup" && (
          <SetupScreen
            players={players}
            nameInput={nameInput}
            setNameInput={setNameInput}
            addPlayer={addPlayer}
            removePlayer={removePlayer}
            category={category}
            setCategory={setCategory}
            imposterCount={imposterCount}
            setImposterCount={setImposterCount}
            maxImposters={maxImposters}
            startGame={startGame}
            clearPlayers={clearPlayers}
          />
        )}

        {phase === "reveal" && (
          <RevealScreen
            player={players[revealIndex]}
            index={revealIndex}
            total={players.length}
            cardOpen={cardOpen}
            setCardOpen={setCardOpen}
            secret={secret}
            nextReveal={nextReveal}
          />
        )}

        {phase === "discuss" && (
          <DiscussScreen players={players} revealImposter={revealImposter} />
        )}

        {phase === "ended" && (
          <EndScreen players={players} secret={secret} playAgain={playAgain} clearPlayers={clearPlayers} />
        )}
      </div>
    </div>
  );
}

function Header() {
  return (
    <div style={{ textAlign: "center", marginBottom: 20, position: "relative" }}>
      <div style={styles.filmStrip} />
      <div style={{ fontSize: 12.5, letterSpacing: 3, color: COLORS.gold, fontFamily: "'JetBrains Mono', monospace", marginBottom: 4 }}>
        🎬 MALAYALI PARTY GAME 🎬
      </div>
      <h1 style={{ fontFamily: "'Baloo 2', cursive", fontWeight: 800, fontSize: 32, color: COLORS.cream, margin: 0, letterSpacing: 0.5 }}>
        Aarada Imposter? <span className="wiggle">🥥</span>
      </h1>
      <div style={styles.filmStrip} />
    </div>
  );
}

function SetupScreen({ players, nameInput, setNameInput, addPlayer, removePlayer, category, setCategory, imposterCount, setImposterCount, maxImposters, startGame, clearPlayers }) {
  return (
    <div>
      <Section title="Kളിക്കാർ (Players)">
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <input
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addPlayer()}
            placeholder="Peru ezhuthu (type a name)"
            style={styles.input}
          />
          <button onClick={addPlayer} style={styles.goldBtn}>Add +</button>
        </div>

        {players.length === 0 && (
          <div style={{ color: COLORS.creamDim, fontSize: 14, fontStyle: "italic", padding: "8px 2px" }}>
            Minimum 3 per venam. Add cheyyu, kali thudangam.
          </div>
        )}

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {players.map((p) => (
            <div key={p.id} style={styles.chip}>
              <span>{p.name}</span>
              <button onClick={() => removePlayer(p.id)} style={styles.chipX} aria-label={`Remove ${p.name}`}>×</button>
            </div>
          ))}
        </div>

        {players.length > 0 && (
          <button onClick={clearPlayers} style={{ ...styles.tinyGhost, marginTop: 10 }}>Clear all players</button>
        )}
      </Section>

      <Section title="Category">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {["Random Mix", ...CATEGORY_NAMES].map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              style={{ ...styles.pill, ...(category === c ? styles.pillActive : {}) }}
            >
              {c}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Imposters">
        <div style={{ display: "flex", gap: 8 }}>
          {[1, 2].map((n) => (
            <button
              key={n}
              disabled={n > maxImposters}
              onClick={() => setImposterCount(n)}
              style={{
                ...styles.pill,
                ...(imposterCount === n ? styles.pillActive : {}),
                opacity: n > maxImposters ? 0.35 : 1,
                cursor: n > maxImposters ? "not-allowed" : "pointer",
              }}
            >
              {n} {n === 1 ? "imposter" : "imposters"}
            </button>
          ))}
        </div>
        {maxImposters === 1 && (
          <div style={{ color: COLORS.creamDim, fontSize: 12.5, marginTop: 8 }}>
            6+ players venam 2 imposters aakan.
          </div>
        )}
      </Section>

      <button
        onClick={startGame}
        disabled={players.length < 3}
        style={{
          ...styles.primaryBtn,
          opacity: players.length < 3 ? 0.4 : 1,
          cursor: players.length < 3 ? "not-allowed" : "pointer",
        }}
      >
        Kalikkam! Start Game →
      </button>
    </div>
  );
}

function RevealScreen({ player, index, total, cardOpen, setCardOpen, secret, nextReveal }) {
  if (!player) return null;
  const isImposter = player.role === "imposter";

  return (
    <div>
      <div style={styles.progressRow}>
        {Array.from({ length: total }, (_, i) => (
          <div key={i} style={{ ...styles.dot, background: i < index ? COLORS.gold : i === index ? COLORS.cream : COLORS.cardEdge }} />
        ))}
      </div>

      {!cardOpen && (
        <div style={{ textAlign: "center", marginBottom: 18 }}>
          <div style={{ color: COLORS.creamDim, fontSize: 14, marginBottom: 6 }}>Phone pass cheyyu</div>
          <div style={{ fontFamily: "'Baloo 2', cursive", fontWeight: 800, fontSize: 30, color: COLORS.gold }}>
            {player.name}
          </div>
          <div style={{ color: COLORS.creamDim, fontSize: 13.5, marginTop: 4 }}>ninte turn aanu 👀</div>
        </div>
      )}

      <div style={{ position: "relative", maxWidth: 340, margin: "0 auto 22px" }}>
        {cardOpen && (
          <div className="spin-slow" style={{ ...styles.starburst, background: isImposter ? COLORS.red : COLORS.gold, opacity: 0.35 }} />
        )}
        <div className="flip-outer" style={{ height: 260, position: "relative" }}>
          <div className={`flip-inner ${cardOpen ? "open" : ""}`}>
            <div className="flip-face" style={styles.cardFront}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>🪔</div>
              <div style={{ color: COLORS.creamDim, fontSize: 14, textAlign: "center", padding: "0 20px" }}>
                Njan {player.name} aanu.<br />Tap cheythu kaanuka
              </div>
            </div>
            <div
              className="flip-face flip-back"
              style={{ ...styles.cardBack, ...(isImposter ? styles.cardBackImposter : styles.cardBackCrew) }}
            >
              {isImposter ? (
                <div className="pop-in" style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 40, marginBottom: 8 }}>🤫</div>
                  <div style={{ fontFamily: "'Baloo 2', cursive", fontWeight: 800, fontSize: 22, color: COLORS.cream, textAlign: "center" }}>
                    Nee aanu IMPOSTER!
                  </div>
                  <div style={{ color: "#F3D6CC", fontSize: 13, textAlign: "center", marginTop: 8, padding: "0 24px" }}>
                    Word onnum ariyilla. Others parayunnath kettu, guess cheyyu — aarum sansayikkaruth!
                  </div>
                </div>
              ) : (
                <div className="pop-in" style={{ textAlign: "center" }}>
                  <div style={{ color: COLORS.creamDim, fontSize: 12.5, letterSpacing: 2, marginBottom: 6 }}>
                    {secret.category.toUpperCase()}
                  </div>
                  <div style={{ fontFamily: "'Baloo 2', cursive", fontWeight: 800, fontSize: 30, color: COLORS.ink, textAlign: "center" }}>
                    {secret.word}
                  </div>
                  <div style={{ color: "#3E6B52", fontSize: 12.5, marginTop: 10, textAlign: "center", padding: "0 20px" }}>
                    Ithu maranu poakaruth. Imposter kandupidikkanam!
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {!cardOpen ? (
        <button onClick={() => setCardOpen(true)} style={styles.primaryBtn}>Tap to Reveal 🔓</button>
      ) : (
        <button onClick={nextReveal} style={styles.goldBtnWide}>
          {index + 1 >= total ? "Ellavarum kandu · Continue →" : "Adutha ആൾക്ക് Pass →"}
        </button>
      )}
    </div>
  );
}

function DiscussScreen({ players, revealImposter }) {
  return (
    <div>
      <div className="wiggle" style={{ fontSize: 44, textAlign: "center", marginBottom: 8 }}>🗣️</div>
      <Section title="Charcha Samayam (Discuss)">
        <div style={styles.speechBubble}>
          Ellavarum word/place/actor onnum peraadu paranju, oru clue vecho vibe vecho charcha cheyyu.
          Aaranu imposter ennu ellarum oru guess parayu — pinne button aduthu reveal cheyyu.
        </div>
      </Section>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 22 }}>
        {players.map((p) => (
          <div key={p.id} style={styles.chip}><span>{p.name}</span></div>
        ))}
      </div>

      <button onClick={revealImposter} style={styles.primaryBtn}>Imposter-ne Reveal Cheyyu 🔎</button>
    </div>
  );
}

function EndScreen({ players, secret, playAgain, clearPlayers }) {
  const imposters = players.filter((p) => p.role === "imposter").map((p) => p.name);

  return (
    <div style={{ position: "relative" }}>
      <Confetti />
      <div className="pop-in" style={{ textAlign: "center", marginBottom: 20, position: "relative" }}>
        <div className="spin-slow" style={{ ...styles.starburst, top: -30, left: "50%", marginLeft: -90, background: COLORS.gold, opacity: 0.3 }} />
        <div style={{ fontSize: 44, marginBottom: 6, position: "relative" }}>🕵️</div>
        <div style={{ fontFamily: "'Baloo 2', cursive", fontWeight: 800, fontSize: 24, color: COLORS.gold, lineHeight: 1.35, position: "relative" }}>
          {imposters.length > 1 ? "Imposters ivar aayirunnu:" : "Imposter ivar aayirunnu:"}
        </div>
        <div style={{ fontFamily: "'Baloo 2', cursive", fontWeight: 800, fontSize: 28, color: COLORS.cream, marginTop: 4, position: "relative" }}>
          {imposters.join(" & ")}
        </div>
        <div style={{ color: COLORS.creamDim, fontSize: 14, marginTop: 10, position: "relative" }}>
          Word aayirunnu: <b style={{ color: COLORS.cream }}>{secret.word}</b> <span style={{ opacity: 0.7 }}>({secret.category})</span>
        </div>
      </div>

      <Section title="Ellavarudeyum Roles">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {players.map((p) => (
            <div key={p.id} style={styles.roleRow}>
              <span style={{ color: COLORS.cream, fontWeight: 500 }}>{p.name}</span>
              <span style={{
                color: p.role === "imposter" ? COLORS.gold : "#9FD8B5",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 12.5,
                letterSpacing: 1,
              }}>
                {p.role === "imposter" ? "IMPOSTER" : "CREW"}
              </span>
            </div>
          ))}
        </div>
      </Section>

      <button onClick={playAgain} style={styles.primaryBtn}>Kalikkam Veendum · Same Players 🎬</button>
      <button onClick={clearPlayers} style={styles.ghostBtn}>Puthiya Kali · Clear Players</button>
    </div>
  );
}

function Confetti() {
  const pieces = Array.from({ length: 14 }, (_, i) => i);
  return (
    <div style={{ position: "absolute", top: -20, left: 0, right: 0, height: 0, overflow: "visible", pointerEvents: "none" }}>
      {pieces.map((i) => {
        const left = (i * 137) % 100;
        const delay = (i % 7) * 0.25;
        const duration = 2.4 + (i % 5) * 0.3;
        const emoji = CONFETTI_EMOJI[i % CONFETTI_EMOJI.length];
        return (
          <span
            key={i}
            style={{
              position: "absolute",
              left: `${left}%`,
              top: 0,
              fontSize: 18 + (i % 3) * 4,
              animation: `fall ${duration}s ease-in ${delay}s infinite`,
            }}
          >
            {emoji}
          </span>
        );
      })}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, letterSpacing: 2, color: COLORS.goldDim, marginBottom: 10 }}>
        {title.toUpperCase()}
      </div>
      {children}
    </div>
  );
}

function HomeScreen({ goToSetup }) {
  return (
    <div>
      <div className="pop-in" style={styles.footer}>
        <div className="float-badge" style={styles.footerBadge}>
          🎬 CREATED BY <b>UTTERFLOPERS</b> · 📍 KADALUNDI
        </div>
        <div style={styles.speechBubble}>
          Namukk oru chaya vaanghi theroo, illelum koyapalaa — ninghal free aai kalicholi 🍵<br />
          Vaanghi tharuvanell…. Oraayiram aa, enthaann parayande areelaa 😄<br />
          Nannai varattee!
        </div>
        <a href="https://buymeacoffee.com/utterflopers" target="_blank" rel="noreferrer" style={styles.coffeeBtn}>
          ☕ Buy us a chaya — buymeacoffee.com/utterflopers
        </a>
      </div>

      <button onClick={goToSetup} style={{ ...styles.primaryBtn, marginTop: 30 }}>
        Kalikkam! Let's Play →
      </button>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: `radial-gradient(circle at 50% -10%, ${COLORS.bgSoft} 0%, ${COLORS.bg} 55%)`,
    padding: "28px 16px 40px",
    fontFamily: "'Poppins', sans-serif",
  },
  shell: { maxWidth: 420, margin: "0 auto" },
  filmStrip: {
    height: 8,
    margin: "10px auto",
    maxWidth: 220,
    backgroundImage: `repeating-linear-gradient(90deg, ${COLORS.gold} 0 6px, transparent 6px 14px)`,
    opacity: 0.5,
    borderRadius: 4,
  },
  input: {
    flex: 1,
    padding: "12px 14px",
    borderRadius: 12,
    border: `1.5px solid ${COLORS.cardEdge}`,
    background: COLORS.bgSoft,
    color: COLORS.cream,
    fontSize: 15,
    outline: "none",
  },
  goldBtn: {
    padding: "12px 16px",
    borderRadius: 12,
    border: "none",
    background: COLORS.gold,
    color: COLORS.ink,
    fontWeight: 700,
    fontSize: 14,
  },
  goldBtnWide: {
    width: "100%",
    padding: "15px 16px",
    borderRadius: 14,
    border: "none",
    background: COLORS.gold,
    color: COLORS.ink,
    fontWeight: 700,
    fontSize: 15.5,
  },
  primaryBtn: {
    width: "100%",
    padding: "16px 16px",
    borderRadius: 16,
    border: "none",
    background: `linear-gradient(135deg, ${COLORS.gold}, ${COLORS.goldDim})`,
    color: COLORS.ink,
    fontWeight: 700,
    fontSize: 16,
    marginTop: 6,
    marginBottom: 10,
    boxShadow: "0 8px 20px rgba(227,178,60,0.25)",
  },
  ghostBtn: {
    width: "100%",
    padding: "13px 16px",
    borderRadius: 14,
    border: `1.5px solid ${COLORS.cardEdge}`,
    background: "transparent",
    color: COLORS.creamDim,
    fontWeight: 500,
    fontSize: 14,
  },
  tinyGhost: {
    padding: "6px 12px",
    borderRadius: 999,
    border: `1px solid ${COLORS.cardEdge}`,
    background: "transparent",
    color: COLORS.creamDim,
    fontSize: 12,
  },
  chip: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    background: COLORS.card,
    border: `1px solid ${COLORS.cardEdge}`,
    borderRadius: 999,
    padding: "7px 8px 7px 14px",
    color: COLORS.cream,
    fontSize: 14,
  },
  chipX: {
    background: "none",
    border: "none",
    color: COLORS.creamDim,
    fontSize: 17,
    lineHeight: 1,
    padding: "0 4px",
  },
  pill: {
    padding: "9px 14px",
    borderRadius: 999,
    border: `1.5px solid ${COLORS.cardEdge}`,
    background: "transparent",
    color: COLORS.creamDim,
    fontSize: 13,
  },
  pillActive: {
    background: COLORS.gold,
    borderColor: COLORS.gold,
    color: COLORS.ink,
    fontWeight: 600,
  },
  progressRow: { display: "flex", justifyContent: "center", gap: 6, marginBottom: 18 },
  dot: { width: 8, height: 8, borderRadius: 999 },
  starburst: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: 190,
    height: 190,
    marginTop: -95,
    marginLeft: -95,
    clipPath: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
    zIndex: 0,
  },
  cardFront: {
    background: COLORS.card,
    border: `1.5px solid ${COLORS.cardEdge}`,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  cardBack: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  cardBackCrew: {
    background: `linear-gradient(160deg, ${COLORS.cream}, #E8E0C6)`,
    border: `1.5px solid ${COLORS.gold}`,
  },
  cardBackImposter: {
    background: `linear-gradient(160deg, ${COLORS.red}, #8E2E1D)`,
    border: `1.5px solid ${COLORS.red}`,
  },
  roleRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 14px",
    background: COLORS.bgSoft,
    borderRadius: 10,
    border: `1px solid ${COLORS.cardEdge}`,
  },
  speechBubble: {
    background: COLORS.bgSoft,
    border: `1.5px solid ${COLORS.cardEdge}`,
    borderRadius: 16,
    padding: "14px 16px",
    color: COLORS.creamDim,
    fontSize: 13.5,
    lineHeight: 1.7,
  },
  footer: {
    marginTop: 34,
    paddingTop: 22,
    borderTop: `1.5px dashed ${COLORS.cardEdge}`,
    display: "flex",
    flexDirection: "column",
    gap: 12,
    alignItems: "center",
    textAlign: "center",
  },
  footerBadge: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 11.5,
    letterSpacing: 1.2,
    color: COLORS.gold,
    background: COLORS.card,
    border: `1px solid ${COLORS.cardEdge}`,
    borderRadius: 999,
    padding: "7px 14px",
  },
  coffeeBtn: {
    display: "inline-block",
    padding: "12px 18px",
    borderRadius: 14,
    background: `linear-gradient(135deg, ${COLORS.gold}, ${COLORS.goldDim})`,
    color: COLORS.ink,
    fontWeight: 700,
    fontSize: 13.5,
    textDecoration: "none",
  },
};
