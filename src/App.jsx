import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import QRCode from "qrcode";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  ChevronRight,
  Clock,
  Compass,
  KeyRound,
  Lock,
  Mail,
  MapPin,
  Play,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
} from "lucide-react";

const countries = [
  {
    name: "Croatia",
    flag: "/countries/croatia.svg",
    status: "Live",
    cities: [
      {
        name: "Split",
        hunts: [
          {
            id: "emperors-secret",
            title: "The Emperor's Secret",
            image: "/hunts/emperors-secret.svg",
            description:
              "A premium self-guided clue hunt through Split inspired by Diocletian, hidden symbols, and a real souvenir treasure at the end.",
            duration: "1.5-2.5 hrs",
            location: "Split, Croatia",
            startLocation: "Old Town / Golden Gate area",
            price: 39,
            players: "1-6 players",
            live: true,
          },
        ],
      },
    ],
  },
  {
    name: "Greece",
    flag: "/countries/greece.svg",
    status: "Coming Soon",
    cities: [{ name: "Athens" }, { name: "Santorini" }],
  },
  {
    name: "Italy",
    flag: "/countries/italy.svg",
    status: "Coming Soon",
    cities: [{ name: "Rome" }, { name: "Florence" }],
  },
  {
    name: "Spain",
    flag: "/countries/spain.svg",
    status: "Coming Soon",
    cities: [{ name: "Barcelona" }, { name: "Seville" }],
  },
];

const demoSteps = [
  {
    title: "The Stone Giant",
    story:
      "Your hunt begins beneath the watch of a towering guardian. Legends say the Emperor left the first sign where hands have polished bronze for luck.",
    clue:
      "Find the great statue at the edge of the old city. What is the first name of the bishop this giant represents?",
    answer: ["grgur", "gregory"],
    hint: "Tourists rub the big toe for good fortune.",
  },
  {
    title: "The Northern Gate",
    story:
      "The trail turns toward the grand northern entrance, where stone once separated imperial order from the restless world outside.",
    clue:
      "Stand before the Golden Gate. What metal is named in the gate's title?",
    answer: ["gold", "golden"],
    hint: "It shines in the name, even if not in the stone.",
  },
  {
    title: "The Emperor's Path",
    story:
      "Within the palace walls, a straight Roman line cuts through the city like memory carved into stone.",
    clue:
      "Walk the main north-south street. What ancient urban route are you following?",
    answer: ["cardo", "cardo street"],
    hint: "Roman cities often had a cardo and a decumanus.",
  },
  {
    title: "Court of Echoes",
    story:
      "At the ceremonial heart of the palace, columns rise and voices bounce from stone. One silent witness stands far older than Rome itself.",
    clue: "What ancient creature guards the Peristyle near the steps?",
    answer: ["sphinx", "egyptian sphinx"],
    hint: "It came from Egypt long before tourists came to Split.",
  },
  {
    title: "Beneath the Palace",
    story:
      "Below the imperial chambers lie vaulted cellars where secrets were hidden from the sun and from men who asked too many questions.",
    clue: "What lies beneath the palace halls where the hunt now leads you?",
    answer: ["cellars", "basement", "underground cellars"],
    hint: "Think stone halls under the emperor's apartments.",
  },
  {
    title: "Toward the Sea",
    story:
      "The final clues drift toward salt air. The Emperor built for power, but the city survived by turning toward the water.",
    clue:
      "What waterfront promenade in Split marks the final stretch of the hunt?",
    answer: ["riva", "the riva"],
    hint: "Palms, cafes, and open sea define this place.",
  },
  {
    title: "The Hidden Reward",
    story:
      "At the edge of the hunt stands a map in metal and memory. Here, your path ends and the Emperor's secret becomes something you can hold.",
    clue:
      "Enter the code word you receive when you collect the souvenir treasure.",
    answer: ["souvenir", "treasure"],
    hint: "This final answer is confirmed when the reward is in your hands.",
  },
];

const artists = [
  {
    name: "Local Game Makers",
    text: "Story builders who turn city streets into playable adventures.",
  },
  {
    name: "Independent Artists",
    text: "Creators crafting souvenirs that feel personal, local, and worth keeping.",
  },
  {
    name: "City Collaborators",
    text: "Partners helping each route feel rooted in place rather than generic tourism.",
  },
];

const reviews = [
  {
    name: "Mia & Luka",
    role: "Weekend travelers",
    quote:
      "It felt like exploring Split inside a mystery novel. Clean, easy, and actually memorable.",
  },
  {
    name: "Sophie",
    role: "Solo traveler",
    quote:
      "Way better than a normal walking tour. The souvenir at the end made it feel earned.",
  },
  {
    name: "Daniel + friends",
    role: "Group of 4",
    quote:
      "Simple on mobile, fun to solve, and polished enough to feel premium.",
  },
];

const sectionFade = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.6 },
};

const FRONTEND_ROUTES = new Set([
  "/",
  "/hunts",
  "/hunt-details",
  "/checkout",
  "/your-hunt",
  "/play",
  "/contact",
]);

function getInitialPage() {
  if (typeof window === "undefined") return "home";

  switch (window.location.pathname) {
    case "/hunts":
      return "hunts";
    case "/hunt-details":
      return "hunt-details";
    case "/checkout":
      return "checkout";
    case "/your-hunt":
      return "your-hunt";
    case "/play":
      return "play";
    case "/contact":
      return "contact";
    default:
      return "home";
  }
}

function getRedeemBaseUrl() {
  if (typeof window === "undefined") {
    return "https://souvenir-hunt-production-6a0e.up.railway.app";
  }

  return (
    import.meta.env.VITE_REDEEM_BASE_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    "https://souvenir-hunt-production-6a0e.up.railway.app"
  );
}

function getApiBaseUrl() {
  return getRedeemBaseUrl();
}

function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    if (typeof window === "undefined") return initialValue;
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      return;
    }
  }, [key, value]);

  return [value, setValue];
}

function generateCode() {
  return `SH-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Math.random()
    .toString(36)
    .slice(2, 6)
    .toUpperCase()}`;
}

function formatTimeLeft(expiry) {
  const diff = new Date(expiry).getTime() - Date.now();
  if (diff <= 0) return "Expired";
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  return `${hours}h ${minutes}m left`;
}

async function createPickupAssets(pickupCode) {
  const redeemUrl = `${getRedeemBaseUrl()}/redeem?code=${pickupCode}`;
  const qrCodeDataUrl = await QRCode.toDataURL(redeemUrl, {
    margin: 1,
    width: 240,
    color: {
      dark: "#0f172a",
      light: "#ffffff",
    },
  });

  return {
    redeemUrl,
    qrCodeDataUrl,
  };
}

function Logo() {
  return (
    <div className="flex items-center gap-3 font-semibold tracking-tight text-slate-950">
      <img
        src="/souvenir-hunt-logo.svg"
        alt="Souvenir Hunt logo"
        className="h-11 w-11 shrink-0 rounded-2xl object-contain"
      />
      <span
        className="text-lg font-bold tracking-tight text-brand-700 sm:text-[1.35rem]"
        style={{ fontFamily: '"Poppins", sans-serif' }}
      >
        Souvenir Hunt
      </span>
    </div>
  );
}

function HuntCard({ hunt, onView }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="overflow-hidden rounded-[28px] border border-brand-100/80 bg-white/95 shadow-card"
    >
      <div className="relative h-52 overflow-hidden">
        <img src={hunt.image} alt={hunt.title} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/30 via-slate-900/5 to-transparent" />
        <div className="absolute bottom-4 left-4 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-slate-700 backdrop-blur">
          {hunt.location}
        </div>
      </div>
      <div className="space-y-4 p-5">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-700">
            Live Hunt
          </div>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
            {hunt.title}
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">{hunt.description}</p>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm text-slate-600">
          <div className="rounded-2xl bg-brand-50/70 p-3"><Clock className="mb-2 h-4 w-4 text-brand-700" />{hunt.duration}</div>
          <div className="rounded-2xl bg-brand-50/70 p-3"><Users className="mb-2 h-4 w-4 text-brand-700" />{hunt.players}</div>
          <div className="rounded-2xl bg-brand-50/70 p-3"><MapPin className="mb-2 h-4 w-4 text-brand-700" />{hunt.startLocation}</div>
          <div className="rounded-2xl bg-brand-50/70 p-3"><Sparkles className="mb-2 h-4 w-4 text-brand-700" />EUR {hunt.price}</div>
        </div>
        <button
          onClick={() => onView(hunt)}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-brand-700"
        >
          View Hunt
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
}

export default function SouvenirHuntWebsite() {
  const aboutRef = useRef(null);
  const artistsRef = useRef(null);
  const reviewsRef = useRef(null);
  const contactPreviewRef = useRef(null);

  const [page, setPage] = useState(getInitialPage);
  const [selectedHunt, setSelectedHunt] = useState(countries[0].cities[0].hunts[0]);
  const [purchase, setPurchase] = useLocalStorage("souvenir-hunt-purchase", null);
  const [resumeCode, setResumeCode] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [answers, setAnswers] = useLocalStorage("souvenir-hunt-answers", {});
  const [unlockedStep, setUnlockedStep] = useLocalStorage("souvenir-hunt-unlocked", 0);
  const [activeStep, setActiveStep] = useLocalStorage("souvenir-hunt-active-step", 0);
  const [huntSearch, setHuntSearch] = useState("");
  const [huntSort, setHuntSort] = useState("featured");
  const [feedback, setFeedback] = useState("");
  const [openHint, setOpenHint] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [clockTick, setClockTick] = useState(Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setClockTick(Date.now()), 60000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const syncPageWithLocation = () => {
      setPage(getInitialPage());
    };

    window.addEventListener("popstate", syncPageWithLocation);
    return () => window.removeEventListener("popstate", syncPageWithLocation);
  }, []);

  const isPurchaseExpired = useMemo(() => {
    if (!purchase?.expiresAt) return true;
    return new Date(purchase.expiresAt).getTime() <= clockTick;
  }, [clockTick, purchase]);

  const isPurchaseActive = useMemo(() => {
    if (!purchase?.expiresAt) return false;
    if (purchase.collected) return false;
    return !isPurchaseExpired;
  }, [isPurchaseExpired, purchase]);

  const visibleCountries = useMemo(() => {
    const query = huntSearch.trim().toLowerCase();

    const filtered = countries
      .map((country, index) => {
        const countryMatch = country.name.toLowerCase().includes(query);

        let filteredCities = country.cities;

        if (query && !countryMatch) {
          filteredCities = country.cities
            .map((city) => {
              const cityMatch = city.name.toLowerCase().includes(query);

              if (country.status === "Live") {
                const hunts = city.hunts || [];
                const filteredHunts = cityMatch
                  ? hunts
                  : hunts.filter((hunt) =>
                      [
                        hunt.title,
                        hunt.description,
                        hunt.location,
                        hunt.startLocation,
                      ].some((value) => value.toLowerCase().includes(query)),
                    );

                if (!cityMatch && filteredHunts.length === 0) {
                  return null;
                }

                return {
                  ...city,
                  hunts: filteredHunts,
                };
              }

              return cityMatch ? city : null;
            })
            .filter(Boolean);
        }

        if (query && filteredCities.length === 0) {
          return null;
        }

        return {
          ...country,
          cities: filteredCities,
          originalIndex: index,
        };
      })
      .filter(Boolean);

    const sorted = [...filtered];
    switch (huntSort) {
      case "alphabetical":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "availability":
        sorted.sort((a, b) => {
          if (a.status === b.status) return a.name.localeCompare(b.name);
          return a.status === "Live" ? -1 : 1;
        });
        break;
      default:
        sorted.sort((a, b) => {
          if (a.status !== b.status) return a.status === "Live" ? -1 : 1;
          return a.originalIndex - b.originalIndex;
        });
        break;
    }

    return sorted;
  }, [huntSearch, huntSort]);

  const huntResults = useMemo(() => {
    return visibleCountries.reduce(
      (summary, country) => {
        summary.countries += 1;
        summary.cities += country.cities.length;
        summary.hunts += country.cities.reduce(
          (count, city) => count + (city.hunts ? city.hunts.length : 0),
          0,
        );
        return summary;
      },
      { countries: 0, cities: 0, hunts: 0 },
    );
  }, [visibleCountries]);

  useEffect(() => {
    if (purchase?.expiresAt && isPurchaseExpired && !purchase.collected) {
      setPurchase(null);
    }
  }, [isPurchaseExpired, purchase, setPurchase]);

  useEffect(() => {
    let cancelled = false;

    if (!purchase?.collected || !purchase?.pickup_code || purchase?.pickup_qr_data_url) {
      return undefined;
    }

    (async () => {
      try {
        const pickupAssets = await createPickupAssets(purchase.pickup_code);

        if (!cancelled) {
          setPurchase((prev) =>
            prev
              ? {
                  ...prev,
                  redeem_url: pickupAssets.redeemUrl,
                  pickup_qr_data_url: pickupAssets.qrCodeDataUrl,
                }
              : prev,
          );
        }
      } catch (error) {
        console.error("Unable to generate demo pickup QR code:", error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [purchase, setPurchase]);

  const startCheckout = () => {
    setPage("checkout");
  };

  const completePurchase = () => {
    setCheckoutLoading(true);
    window.setTimeout(() => {
      const code = generateCode();
      const startedAt = new Date().toISOString();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

      setPurchase({
        code,
        huntId: selectedHunt.id,
        huntTitle: selectedHunt.title,
        startedAt,
        expiresAt,
        collected: false,
      });
      setUnlockedStep(0);
      setActiveStep(0);
      setAnswers({});
      setFeedback("");
      setOpenHint(null);
      setCheckoutLoading(false);
      setPage("play");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 900);
  };

  const tryResume = () => {
    if (
      purchase?.code?.toLowerCase() === resumeCode.trim().toLowerCase() &&
      isPurchaseActive
    ) {
      setPage("play");
      setFeedback("");
      return;
    }
    setFeedback("That code is invalid, expired, or the hunt has already been completed.");
  };

  const submitAnswer = async () => {
    const current = demoSteps[activeStep];
    const raw = String(answers[activeStep] || "").trim().toLowerCase();
    const ok = current.answer.some((answer) => answer.toLowerCase() === raw);

    if (!ok) {
      setFeedback("Not correct yet. Check the location again or use the hint.");
      return;
    }

    const next = Math.min(activeStep + 1, demoSteps.length - 1);
    if (activeStep === demoSteps.length - 1) {
      try {
        const response = await fetch(
          `${getApiBaseUrl()}/demo/create-completed-session`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: purchase?.email || "demo@souvenirhunt.com",
            }),
          },
        );

        if (!response.ok) {
          throw new Error("Unable to create redeemable pickup session.");
        }

        const data = await response.json();

        setPurchase((prev) =>
          prev
            ? {
                ...prev,
                collected: true,
                pickup_code: data.session?.pickup_code || null,
                redeem_url: data.redeemUrl || null,
                pickup_qr_data_url: data.session?.qr_code_data_url || null,
                pickup_used: data.session?.pickup_used || false,
              }
            : prev,
        );
        setFeedback("Treasure claimed. Hunt complete.");
        return;
      } catch (error) {
        console.error("Unable to create backend pickup session:", error);
        const pickupCode = `PK-DEMO-${generateCode().replace("SH-", "")}`;
        const pickupAssets = await createPickupAssets(pickupCode);

        setPurchase((prev) =>
          prev
            ? {
                ...prev,
                collected: true,
                pickup_code: pickupCode,
                redeem_url: pickupAssets.redeemUrl,
                pickup_qr_data_url: pickupAssets.qrCodeDataUrl,
                pickup_used: false,
              }
            : prev,
        );
        setFeedback("Treasure claimed. Hunt complete.");
        return;
      }
    }

    setUnlockedStep(Math.max(unlockedStep, next));
    setActiveStep(next);
    setOpenHint(null);
    setFeedback("Correct. Next clue unlocked.");
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const navigate = (nextPage) => {
    setPage(nextPage);
    setMobileMenuOpen(false);
    if (typeof window !== "undefined") {
      const nextPath = nextPage === "home" ? "/" : `/${nextPage}`;
      if (FRONTEND_ROUTES.has(nextPath) && window.location.pathname !== nextPath) {
        window.history.pushState({}, "", nextPath);
      }
    }
    scrollToTop();
  };

  const scrollToSection = (ref) => {
    setMobileMenuOpen(false);
    if (page !== "home") {
      setPage("home");
      window.setTimeout(() => {
        ref?.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 120);
      return;
    }
    ref?.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const renderHome = () => (
    <>
      <section className="relative overflow-hidden px-4 pb-6 pt-8 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(10,108,255,0.12),transparent_34%),radial-gradient(circle_at_85%_20%,rgba(108,181,255,0.16),transparent_22%),linear-gradient(180deg,rgba(255,255,255,0.4),rgba(255,255,255,0))]" />
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="relative overflow-hidden rounded-[42px] bg-white/58 px-6 pb-8 pt-8 shadow-[0_28px_80px_rgba(15,23,42,0.06)] ring-1 ring-white/75 backdrop-blur-2xl sm:px-10 sm:pb-10 sm:pt-10 lg:px-14 lg:pb-14 lg:pt-14"
          >
            <div className="absolute -left-12 top-0 h-44 w-44 rounded-full bg-brand-200/35 blur-3xl" />
            <div className="absolute right-0 top-12 h-56 w-56 rounded-full bg-sky-200/35 blur-3xl" />
            <div className="absolute bottom-0 left-1/3 h-44 w-44 rounded-full bg-brand-100/40 blur-3xl" />

            <div className="relative mx-auto max-w-5xl">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-600 shadow-[0_10px_30px_rgba(10,108,255,0.08)] ring-1 ring-brand-100/70">
                  <Sparkles className="h-3.5 w-3.5" />
                  Made by local artists
                </div>

                <h1 className="mt-8 text-[3.35rem] font-extrabold leading-[0.95] tracking-[-0.07em] text-brand-600 sm:text-[4.7rem] lg:text-[5.9rem]">
                  Explore the City.
                  <br />
                  Solve Clues.
                  <br />
                  Get Souvenir.
                </h1>

                <p className="mt-6 max-w-2xl text-base leading-8 text-slate-500 sm:text-lg">
                  A clean self-guided city hunt with hidden stories, playful clues, and a keepsake at the end.
                </p>

                <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                  <button
                    onClick={() => navigate("hunts")}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-600 px-7 py-3.5 text-sm font-semibold text-white shadow-[0_20px_40px_rgba(10,108,255,0.2)] transition hover:-translate-y-0.5 hover:bg-brand-700"
                  >
                    Start a Hunt
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => navigate("your-hunt")}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-white/82 px-7 py-3.5 text-sm font-semibold text-brand-700 shadow-[0_14px_35px_rgba(15,23,42,0.06)] ring-1 ring-brand-100/80 transition hover:-translate-y-0.5 hover:bg-white"
                  >
                    Continue Your Hunt
                    <Play className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.98, y: 14 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.12 }}
                className="mt-10 overflow-hidden rounded-[34px] bg-gradient-to-br from-[#a9ccff] via-[#dcecff] to-[#f7fbff] p-4 shadow-[0_24px_60px_rgba(110,167,255,0.22)] ring-1 ring-white/70 sm:p-6"
              >
                <svg
                  viewBox="0 0 360 240"
                  className="h-auto w-full"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path d="M42 176L94 180L146 168L202 176L298 146" stroke="white" strokeWidth="4" strokeLinecap="round" />
                  <path d="M60 138L170 144L308 94" stroke="white" strokeWidth="4" strokeLinecap="round" />
                  <path d="M88 76L86 178" stroke="white" strokeWidth="4" strokeLinecap="round" />
                  <path d="M126 66L124 170" stroke="white" strokeWidth="4" strokeLinecap="round" />
                  <path d="M188 50L184 176" stroke="white" strokeWidth="4" strokeLinecap="round" />
                  <path d="M246 42L298 44L312 94L322 150L266 162L244 96L246 42Z" stroke="white" strokeWidth="4" strokeLinejoin="round" />
                  <path d="M126 66L188 70L246 42" stroke="white" strokeWidth="4" strokeLinejoin="round" />
                  <path d="M52 94L86 96L88 76L126 66" stroke="white" strokeWidth="4" strokeLinejoin="round" />
                  <path d="M42 132L60 138L52 94" stroke="white" strokeWidth="4" strokeLinejoin="round" />
                  <motion.path
                    d="M92 122H126V170H92"
                    stroke="#0A51D8"
                    strokeWidth="3"
                    strokeDasharray="4 5"
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.1, ease: "easeInOut" }}
                  />
                  <motion.path
                    d="M68 122H92"
                    stroke="#0A51D8"
                    strokeWidth="3"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.55, delay: 0.1 }}
                  />
                  <motion.path
                    d="M80 116L92 122L80 128"
                    stroke="#0A51D8"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.45, delay: 0.15 }}
                  />
                  <motion.path
                    d="M126 170H168"
                    stroke="#0A51D8"
                    strokeWidth="3"
                    strokeDasharray="4 5"
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.65, delay: 0.35 }}
                  />
                  <motion.path
                    d="M168 170L176 178L184 170"
                    stroke="#0A51D8"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.8 }}
                  />
                </svg>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <motion.section ref={aboutRef} {...sectionFade} className="scroll-mt-28 px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div>
            <div className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-600">About</div>
            <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl lg:text-[3.2rem] lg:leading-[1.02]">
              Sightseeing made worth remembering.
            </h2>
            <div className="mt-6 max-w-2xl space-y-5 text-base leading-8 text-slate-600 sm:text-lg">
              <p>Souvenir Hunt turns real streets into story-led city experiences.</p>
              <p>
                We guide you through meaningful locations, hidden details, and memorable clues so the city feels discovered rather than consumed.
              </p>
              <p>
                At the end, you leave with something physical and worth keeping.
              </p>
            </div>
          </div>

          <div className="space-y-8 pt-2">
            {[
              [
                MapPin,
                "Real places, not generic routes",
                "Walk somewhere that matters instead of following another standard tour path.",
              ],
              [
                Search,
                "A calmer kind of puzzle",
                "The challenge is designed to feel elegant and rewarding, never noisy or random.",
              ],
              [
                Sparkles,
                "A souvenir tied to the journey",
                "The final reward feels connected to the route you just completed.",
              ],
            ].map(([Icon, title, text]) => (
              <div key={title} className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/90 text-brand-600 shadow-[0_14px_35px_rgba(10,108,255,0.08)] ring-1 ring-brand-100/70">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold tracking-tight text-slate-950">{title}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-500 sm:text-base">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section ref={artistsRef} {...sectionFade} className="scroll-mt-28 px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl rounded-[42px] bg-[radial-gradient(circle_at_top_left,rgba(10,108,255,0.12),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.72),rgba(255,255,255,0.48))] p-8 shadow-[0_28px_80px_rgba(15,23,42,0.05)] ring-1 ring-white/75 backdrop-blur-2xl sm:p-10 lg:p-14">
          <div className="max-w-3xl">
            <div className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-600">Artists & Makers</div>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl lg:text-[3rem] lg:leading-[1.04]">
              Built with local artists, storytellers, and game makers.
            </h2>
            <p className="mt-6 text-base leading-8 text-slate-600 sm:text-lg">
              Each hunt is shaped by people who know how to turn a city into something cultural, playful, and worth remembering.
            </p>
          </div>

          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {[
              [Compass, "Storytelling", "Narratives that feel rooted in place rather than copied from a template."],
              [Search, "Puzzle Design", "Clues paced to feel polished, intuitive, and satisfying to solve."],
              [Sparkles, "Souvenir Craft", "A physical ending that feels local, memorable, and earned."],
            ].map(([Icon, title, text]) => (
              <div key={title} className="rounded-[30px] bg-white/55 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.04)] ring-1 ring-white/70 backdrop-blur">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-xl font-semibold tracking-tight text-slate-950">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-500">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section ref={reviewsRef} {...sectionFade} className="scroll-mt-28 px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <div className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-700">Reviews</div>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              People remember the story, not just the route.
            </h2>
          </div>
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {reviews.map((review) => (
              <motion.div
                key={review.name}
                whileHover={{ y: -4 }}
                className="rounded-[32px] bg-white/72 p-8 shadow-[0_20px_50px_rgba(15,23,42,0.05)] ring-1 ring-white/75 backdrop-blur-xl transition-shadow hover:shadow-[0_28px_60px_rgba(15,23,42,0.08)]"
              >
                <div className="flex items-center gap-1 text-brand-600">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} className="h-3.5 w-3.5 fill-current" />
                  ))}
                </div>
                <p className="mt-6 text-lg leading-8 text-slate-700">&ldquo;{review.quote}&rdquo;</p>
                <div className="mt-8">
                  <div className="font-semibold text-slate-950">{review.name}</div>
                  <div className="text-sm text-slate-500">{review.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section ref={contactPreviewRef} {...sectionFade} className="scroll-mt-28 px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-[42px] bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_24%),linear-gradient(135deg,#1f6dff_0%,#0c57e8_55%,#5aa5ff_100%)] p-8 text-white shadow-[0_34px_100px_rgba(10,108,255,0.22)] sm:p-10 lg:p-14">
          <div className="grid gap-8 lg:grid-cols-[1fr_280px] lg:items-center">
            <div className="max-w-2xl">
              <div className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-100/85">Contact</div>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl lg:text-[3rem]">
                Create Something Worth Discovering
              </h2>
              <p className="mt-4 text-lg font-medium text-white/95">
                Want to partner, create, or launch a hunt?
              </p>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-blue-50/90 sm:text-base">
                Bring your city, your artwork, or your venue into the experience. We are building premium clue hunts shaped by local people.
              </p>
              <p className="mt-6 text-sm font-medium text-blue-100">
                Let&apos;s build something people will remember.
              </p>
            </div>
            <div className="rounded-[32px] bg-white/12 p-5 shadow-[0_22px_55px_rgba(15,23,42,0.18)] ring-1 ring-white/20 backdrop-blur-xl">
              <button onClick={() => navigate("contact")} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-brand-700 transition hover:bg-blue-50">
                Contact Us
                <Mail className="h-4 w-4" />
              </button>
              <p className="mt-4 text-center text-sm text-blue-100">
                Let&apos;s build something people will remember.
              </p>
            </div>
          </div>
        </div>
      </motion.section>
    </>
  );

  const renderHunts = () => (
    <section className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <div className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-700">Our Hunts</div>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">Explore our community.</h1>
        </div>
        <div className="mt-8 rounded-[32px] border border-brand-100/80 bg-white/95 p-4 shadow-sm sm:p-5">
          <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-500" />
              <input
                value={huntSearch}
                onChange={(event) => setHuntSearch(event.target.value)}
                placeholder="Search countries, cities, or hunts"
                className="w-full rounded-[22px] border border-brand-100 bg-brand-50/60 py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-brand-300 focus:bg-white"
              />
            </label>
            <label className="relative block">
              <select
                value={huntSort}
                onChange={(event) => setHuntSort(event.target.value)}
                className="w-full appearance-none rounded-[22px] border border-brand-100 bg-brand-50/60 px-4 py-3 pr-10 text-sm font-medium text-slate-700 outline-none transition focus:border-brand-300 focus:bg-white"
              >
                <option value="featured">Featured order</option>
                <option value="availability">Live first</option>
                <option value="alphabetical">Country A-Z</option>
              </select>
              <ChevronRight className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-brand-500" />
            </label>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <span className="rounded-full bg-brand-50 px-3 py-1.5 font-medium text-brand-700">
              {huntResults.countries} countries
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1.5">
              {huntResults.cities} cities
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1.5">
              {huntResults.hunts} live hunt{huntResults.hunts === 1 ? "" : "s"}
            </span>
          </div>
        </div>
        <div className="mt-10 space-y-10">
          {visibleCountries.length === 0 ? (
            <div className="rounded-[34px] border border-brand-100/80 bg-white/95 p-8 text-center shadow-sm">
              <div className="text-lg font-semibold text-slate-950">No matches found.</div>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                Try a different country, city, or hunt name.
              </p>
            </div>
          ) : visibleCountries.map((country) => (
            <div key={country.name} className="rounded-[34px] border border-brand-100/80 bg-white/95 p-6 shadow-sm sm:p-8">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="flex items-center gap-3 text-2xl font-semibold tracking-tight text-slate-950">
                    <img
                      src={country.flag}
                      alt={`${country.name} icon`}
                      className="h-8 w-8 rounded-full object-cover ring-1 ring-brand-100"
                    />
                    <span>{country.name}</span>
                  </h2>
                  <p className="mt-2 text-sm text-slate-500">
                    {country.status === "Live" ? "Currently available to book." : "Coming soon."}
                  </p>
                </div>
                <div className={`inline-flex w-fit rounded-full px-4 py-2 text-xs font-semibold ${
                  country.status === "Live" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                }`}>
                  {country.status}
                </div>
              </div>
              {country.status === "Live" ? (
                <div className="mt-8 space-y-8">
                  {country.cities.map((city) => (
                    <div key={city.name}>
                      <div className="mb-5 flex items-center gap-2 text-sm font-medium text-slate-500">
                        <ChevronRight className="h-4 w-4" />
                        {city.name}
                      </div>
                      <div className="grid gap-6 lg:grid-cols-2">
                        {city.hunts.map((hunt) => (
                          <HuntCard
                            key={hunt.id}
                            hunt={hunt}
                            onView={(huntItem) => {
                              setSelectedHunt(huntItem);
                              navigate("hunt-details");
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {country.cities.map((city) => (
                    <div key={city.name} className="rounded-[28px] border border-dashed border-brand-100 bg-brand-50/40 p-5">
                      <div className="font-medium text-slate-900">{city.name}</div>
                      <div className="mt-2 text-sm text-slate-500">New hunts coming soon.</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  const renderHuntDetails = () => (
    <section className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div>
            <div className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-700">Split, Croatia</div>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">{selectedHunt.title}</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">{selectedHunt.description}</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                [Clock, selectedHunt.duration],
                [MapPin, selectedHunt.startLocation],
                [Users, selectedHunt.players],
                [ShieldCheck, "24-hour resume code included"],
              ].map(([Icon, value]) => (
                <div key={value} className="rounded-[24px] border border-brand-100/80 bg-white/95 p-5 shadow-sm">
                  <Icon className="mb-3 h-5 w-5 text-brand-700" />
                  <div className="text-sm leading-6 text-slate-700">{value}</div>
                </div>
              ))}
            </div>
            <div className="mt-8 rounded-[30px] border border-brand-100/80 bg-brand-50/50 p-6">
              <div className="text-lg font-semibold text-slate-950">What this hunt is</div>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                A self-guided mobile clue hunt through Split with short story chapters, location-based answers, and a physical souvenir reward at the finish.
              </p>
            </div>
          </div>
          <div className="overflow-hidden rounded-[34px] border border-brand-100/80 bg-white/95 shadow-glass">
            <div className="h-72 overflow-hidden">
              <img src={selectedHunt.image} alt={selectedHunt.title} className="h-full w-full object-cover" />
            </div>
            <div className="space-y-5 p-6">
              <div className="rounded-[28px] bg-brand-50/60 p-5">
                <div className="text-sm text-slate-500">Price</div>
                <div className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">EUR {selectedHunt.price}</div>
                <div className="mt-2 text-sm text-slate-500">One booking covers 1-6 players.</div>
              </div>
              <button onClick={startCheckout} className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-600 px-6 py-3.5 text-sm font-medium text-white transition hover:bg-brand-700">
                Pay & Start Hunt
                <ArrowRight className="h-4 w-4" />
              </button>
              <button onClick={() => navigate("your-hunt")} className="flex w-full items-center justify-center gap-2 rounded-full border border-brand-100 bg-white px-6 py-3.5 text-sm font-medium text-slate-700 transition hover:border-brand-200 hover:text-brand-700">
                Resume Existing Hunt
                <KeyRound className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  const renderCheckout = () => (
    <section className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[34px] border border-brand-100/80 bg-white/95 p-6 shadow-sm sm:p-8">
          <div className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-700">Checkout</div>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">Start instantly after purchase.</h1>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            This is a demo checkout flow. In production, connect it to Stripe or another real payment provider.
          </p>
          <div className="mt-8 space-y-4">
            <input className="w-full rounded-2xl border border-brand-100 px-4 py-3 outline-none placeholder:text-slate-400 focus:border-brand-300" placeholder="Email address" />
            <input className="w-full rounded-2xl border border-brand-100 px-4 py-3 outline-none placeholder:text-slate-400 focus:border-brand-300" placeholder="Full name" />
            <div className="rounded-2xl border border-brand-100 bg-brand-50/70 p-4 text-sm leading-6 text-brand-800">
              After payment, a code is generated automatically, activated immediately, and valid for 24 hours or until the souvenir is collected.
            </div>
          </div>
        </div>
        <div className="rounded-[34px] border border-brand-100/80 bg-white/95 p-6 shadow-glass sm:p-8">
          <div className="text-lg font-semibold text-slate-950">Order Summary</div>
          <div className="mt-6 rounded-[28px] bg-brand-50/60 p-5">
            <div className="text-xl font-semibold text-slate-950">{selectedHunt.title}</div>
            <div className="mt-3 space-y-2 text-sm text-slate-600">
              <div>{selectedHunt.location}</div>
              <div>{selectedHunt.duration}</div>
              <div>{selectedHunt.players}</div>
            </div>
          </div>
          <div className="mt-6 flex items-center justify-between text-sm text-slate-600">
            <span>Hunt price</span>
            <span>EUR {selectedHunt.price}</span>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-brand-100 pt-4 text-lg font-semibold text-slate-950">
            <span>Total</span>
            <span>EUR {selectedHunt.price}</span>
          </div>
          <button
            onClick={completePurchase}
            disabled={checkoutLoading}
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-brand-600 px-6 py-3.5 text-sm font-medium text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {checkoutLoading ? "Processing..." : "Complete Payment"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );

  const renderYourHunt = () => (
    <section className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="max-w-2xl">
          <div className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-700">Your Hunt</div>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">Resume with your access code.</h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            If the hunt is still active, users can return with the code and continue from where they stopped.
          </p>
        </div>
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[34px] border border-brand-100/80 bg-white/95 p-6 shadow-sm sm:p-8">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-brand-50 p-3 text-brand-700">
                <Search className="h-5 w-5" />
              </div>
              <div className="text-xl font-semibold text-slate-950">Resume a hunt</div>
            </div>
            <div className="mt-6 space-y-4">
              <input
                value={resumeCode}
                onChange={(event) => setResumeCode(event.target.value)}
                className="w-full rounded-2xl border border-brand-100 px-4 py-3 uppercase outline-none focus:border-brand-300"
                placeholder="Enter your code"
              />
              <button onClick={tryResume} className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-brand-700">
                Resume Hunt
                <ArrowRight className="h-4 w-4" />
              </button>
              {feedback ? <div className="text-sm text-slate-500">{feedback}</div> : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  const renderPlay = () => {
    if (!purchase || isPurchaseExpired) {
      return (
        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl rounded-[34px] border border-brand-100/80 bg-white/95 p-8 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
              <Lock className="h-6 w-6" />
            </div>
            <h1 className="mt-5 text-3xl font-semibold tracking-tight text-slate-950">No active hunt available.</h1>
            <p className="mt-4 text-base leading-7 text-slate-600">Purchase the hunt or resume it with a valid code first.</p>
            <button onClick={() => navigate("hunts")} className="mt-8 rounded-full bg-brand-600 px-6 py-3 text-sm font-medium text-white">
              Go to Hunts
            </button>
          </div>
        </section>
      );
    }

    if (purchase.collected) {
      return (
        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl rounded-[34px] border border-brand-100/80 bg-white/95 p-8 shadow-glass sm:p-10">
            <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
              <div className="text-center lg:text-left">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-700 lg:mx-0">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h1 className="mt-5 text-3xl font-semibold tracking-tight text-slate-950">Treasure claimed.</h1>
                <p className="mt-4 text-base leading-7 text-slate-600">
                  The Emperor&apos;s Secret is complete. Show this pickup QR to staff to confirm the
                  souvenir handoff.
                </p>
                <div className="mt-6 rounded-[28px] border border-brand-100 bg-brand-50/60 p-5">
                  <div className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-700">
                    Pickup code
                  </div>
                  <div className="mt-2 text-2xl font-semibold tracking-[0.18em] text-slate-950">
                    {purchase.pickup_code || "Generating..."}
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-500">
                    If scanning fails, staff can open the redeem page and type this code manually.
                  </p>
                </div>
                {purchase.redeem_url ? (
                  <a
                    href={purchase.redeem_url}
                    className="mt-6 inline-flex items-center gap-2 rounded-full border border-brand-100 bg-white px-5 py-3 text-sm font-semibold text-brand-700 transition hover:border-brand-200"
                  >
                    Open redeem link
                    <ArrowRight className="h-4 w-4" />
                  </a>
                ) : null}
                <button onClick={() => navigate("your-hunt")} className="mt-6 block w-full rounded-full bg-brand-600 px-6 py-3 text-sm font-medium text-white lg:inline-flex lg:w-auto lg:items-center lg:justify-center">
                  Back to Your Hunt
                </button>
              </div>

              <div className="rounded-[32px] border border-brand-100 bg-white p-6 shadow-sm">
                <div className="text-center">
                  <div className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-700">
                    Staff scan
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-500">
                    Scan with a phone camera or open the redeem link on the staff device.
                  </p>
                </div>
                <div className="mt-6 flex justify-center">
                  {purchase.pickup_qr_data_url ? (
                    <img
                      src={purchase.pickup_qr_data_url}
                      alt="Pickup QR code"
                      className="h-64 w-64 rounded-[28px] border border-brand-100 bg-white p-3 shadow-sm"
                    />
                  ) : (
                    <div className="flex h-64 w-64 items-center justify-center rounded-[28px] border border-dashed border-brand-200 bg-brand-50/40 text-sm text-slate-500">
                      Generating QR...
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      );
    }

    const current = demoSteps[activeStep];
    const progress = ((activeStep + 1) / demoSteps.length) * 100;

    return (
      <section className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-[34px] border border-brand-100/80 bg-white/95 p-5 shadow-sm sm:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-700">Live Hunt</div>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">The Emperor&apos;s Secret</h1>
                <div className="mt-2 text-sm text-slate-500">Code {purchase.code} | {formatTimeLeft(purchase.expiresAt)}</div>
              </div>
              <div className="min-w-[180px]">
                <div className="mb-2 flex items-center justify-between text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                  <span>Progress</span>
                  <span>{activeStep + 1}/{demoSteps.length}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div className="h-2 rounded-full bg-brand-600 transition-all" style={{ width: `${progress}%` }} />
                </div>
              </div>
            </div>
            <div className="mt-8 flex gap-2 overflow-x-auto pb-2">
              {demoSteps.map((step, index) => {
                const unlocked = index <= unlockedStep;
                const isActive = index === activeStep;
                return (
                  <button
                    key={step.title}
                    disabled={!unlocked}
                    onClick={() => unlocked && setActiveStep(index)}
                    className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${
                      isActive
                        ? "bg-brand-600 text-white"
                        : unlocked
                        ? "bg-brand-50 text-slate-700 hover:bg-brand-100 hover:text-brand-700"
                        : "cursor-not-allowed bg-slate-50 text-slate-300"
                    }`}
                  >
                    Step {index + 1}
                  </button>
                );
              })}
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]"
              >
                <div className="rounded-[30px] bg-brand-50/60 p-6">
                  <div className="text-sm font-semibold uppercase tracking-[0.22em] text-brand-700">Step {activeStep + 1}</div>
                  <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">{current.title}</h2>
                  <p className="mt-4 text-sm leading-7 text-slate-600">{current.story}</p>
                </div>
                <div className="rounded-[30px] border border-brand-100/80 p-6">
                  <div className="text-sm font-semibold uppercase tracking-[0.22em] text-brand-700">Clue</div>
                  <p className="mt-3 text-base leading-7 text-slate-700">{current.clue}</p>
                  <input
                    value={answers[activeStep] || ""}
                    onChange={(event) => setAnswers({ ...answers, [activeStep]: event.target.value })}
                    placeholder="Type your answer"
                    className="mt-6 w-full rounded-2xl border border-brand-100 px-4 py-3 outline-none focus:border-brand-300"
                  />
                  <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                    <button onClick={submitAnswer} className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-brand-700">
                      Submit
                      <CheckCircle2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setOpenHint(openHint === activeStep ? null : activeStep)}
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-brand-100 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-brand-200 hover:text-brand-700"
                    >
                      Hint
                      <Sparkles className="h-4 w-4" />
                    </button>
                  </div>
                  {openHint === activeStep ? (
                    <div className="mt-4 rounded-2xl bg-brand-50 p-4 text-sm leading-6 text-brand-800">{current.hint}</div>
                  ) : null}
                  {feedback ? <div className="mt-4 text-sm text-slate-500">{feedback}</div> : null}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>
    );
  };

  const renderContact = () => (
    <section className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <div className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-700">Contact</div>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">Let&apos;s build hunts worth talking about.</h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-slate-600">
            Artists, game makers, venues, tourism partners, and sponsors all belong here. Keep it local, elegant, and specific.
          </p>
        </div>
        <div className="rounded-[34px] border border-brand-100/80 bg-white/95 p-6 shadow-sm sm:p-8">
          <div className="grid gap-4">
            <input className="w-full rounded-2xl border border-brand-100 px-4 py-3 outline-none focus:border-brand-300" placeholder="Name" />
            <input className="w-full rounded-2xl border border-brand-100 px-4 py-3 outline-none focus:border-brand-300" placeholder="Email" />
            <input className="w-full rounded-2xl border border-brand-100 px-4 py-3 outline-none focus:border-brand-300" placeholder="Subject" />
            <textarea rows={5} className="w-full rounded-2xl border border-brand-100 px-4 py-3 outline-none focus:border-brand-300" placeholder="Tell us what you want to build or ask." />
            <button className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-brand-700">
              Send Message
              <Mail className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );

  return (
    <div className="min-h-screen bg-transparent text-slate-900">
      <header className="sticky top-0 z-50 py-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between rounded-full border border-brand-100 bg-white px-4 py-3 shadow-sm sm:px-6">
            <button onClick={() => navigate("home")} className="min-w-0 text-left">
              <Logo />
            </button>

            <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 xl:gap-8 lg:flex">
              <button onClick={() => navigate("hunts")} className="transition hover:text-slate-900">Hunts</button>
              <button onClick={() => navigate("your-hunt")} className="transition hover:text-slate-900">Your Hunt</button>
              <button onClick={() => scrollToSection(aboutRef)} className="transition hover:text-slate-900">About</button>
              <button onClick={() => scrollToSection(artistsRef)} className="transition hover:text-slate-900">Artists</button>
              <button onClick={() => scrollToSection(reviewsRef)} className="transition hover:text-slate-900">Reviews</button>
              <button onClick={() => scrollToSection(contactPreviewRef)} className="transition hover:text-slate-900">Contact</button>
            </nav>

            <div className="hidden lg:block">
              <button onClick={() => navigate("hunts")} className="rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700">
                Play Hunt Now
              </button>
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/60 bg-white/85 text-slate-900 shadow-[0_16px_45px_rgba(10,108,255,0.12)] backdrop-blur-xl transition hover:border-brand-200 hover:bg-white lg:hidden"
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-b from-brand-500 via-brand-600 to-brand-700 text-white shadow-[0_10px_24px_rgba(10,108,255,0.28)]">
                <motion.span
                  animate={mobileMenuOpen ? { rotate: 45, y: 0 } : { rotate: 0, y: -5 }}
                  transition={{ duration: 0.2 }}
                  className="absolute h-[2px] w-4 rounded-full bg-white"
                />
                <motion.span
                  animate={mobileMenuOpen ? { opacity: 0, scaleX: 0.2 } : { opacity: 1, scaleX: 1 }}
                  transition={{ duration: 0.18 }}
                  className="absolute h-[2px] w-4 rounded-full bg-white"
                />
                <motion.span
                  animate={mobileMenuOpen ? { rotate: -45, y: 0 } : { rotate: 0, y: 5 }}
                  transition={{ duration: 0.2 }}
                  className="absolute h-[2px] w-4 rounded-full bg-white"
                />
              </span>
            </motion.button>
          </div>

          <AnimatePresence>
            {mobileMenuOpen ? (
              <motion.div
                initial={{ opacity: 0, y: -12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12, scale: 0.98 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="relative mt-3 overflow-hidden rounded-[30px] border border-white/60 bg-white/85 p-3 shadow-[0_24px_70px_rgba(15,23,42,0.12)] backdrop-blur-2xl lg:hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-brand-50/60 to-white/95" />
                <div className="relative space-y-3">
                  <div className="grid gap-2">
                    <button onClick={() => navigate("hunts")} className="flex items-center justify-between rounded-2xl border border-transparent bg-white/70 px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:border-brand-100 hover:bg-white hover:text-slate-950">
                      <span>Our Hunts</span>
                      <ChevronRight className="h-4 w-4 text-brand-600" />
                    </button>
                    <button onClick={() => navigate("your-hunt")} className="flex items-center justify-between rounded-2xl border border-transparent bg-white/70 px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:border-brand-100 hover:bg-white hover:text-slate-950">
                      <span>Your Hunt</span>
                      <ChevronRight className="h-4 w-4 text-brand-600" />
                    </button>
                    <button onClick={() => scrollToSection(aboutRef)} className="flex items-center justify-between rounded-2xl border border-transparent bg-white/70 px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:border-brand-100 hover:bg-white hover:text-slate-950">
                      <span>About</span>
                      <ChevronRight className="h-4 w-4 text-brand-600" />
                    </button>
                    <button onClick={() => scrollToSection(artistsRef)} className="flex items-center justify-between rounded-2xl border border-transparent bg-white/70 px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:border-brand-100 hover:bg-white hover:text-slate-950">
                      <span>Artists</span>
                      <ChevronRight className="h-4 w-4 text-brand-600" />
                    </button>
                    <button onClick={() => scrollToSection(reviewsRef)} className="flex items-center justify-between rounded-2xl border border-transparent bg-white/70 px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:border-brand-100 hover:bg-white hover:text-slate-950">
                      <span>Reviews</span>
                      <ChevronRight className="h-4 w-4 text-brand-600" />
                    </button>
                    <button onClick={() => scrollToSection(contactPreviewRef)} className="flex items-center justify-between rounded-2xl border border-transparent bg-white/70 px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:border-brand-100 hover:bg-white hover:text-slate-950">
                      <span>Contact</span>
                      <ChevronRight className="h-4 w-4 text-brand-600" />
                    </button>
                  </div>

                  <button
                    onClick={() => navigate("hunts")}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-600 px-5 py-3.5 text-sm font-semibold text-white shadow-[0_16px_30px_rgba(10,108,255,0.25)] transition hover:bg-brand-700"
                  >
                    Play Hunt Now
                    <Play className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </header>

      <main>
        {page === "home" && renderHome()}
        {page === "hunts" && renderHunts()}
        {page === "hunt-details" && renderHuntDetails()}
        {page === "checkout" && renderCheckout()}
        {page === "your-hunt" && renderYourHunt()}
        {page === "play" && renderPlay()}
        {page === "contact" && renderContact()}
      </main>

      <footer className="border-t border-brand-100 bg-white/70 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 rounded-[36px] border border-brand-100/80 bg-white/95 p-8 shadow-sm sm:p-10 lg:grid-cols-[1.2fr_0.7fr_0.9fr_1fr] lg:gap-8 lg:p-12">
            <div className="max-w-sm">
              <div className="font-semibold text-slate-950">Souvenir Hunt</div>
              <p className="mt-4 text-sm leading-7 text-slate-500">
                Sightseeing clue hunts with a real reward at the end.
              </p>
            </div>

            <div>
              <div className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-700">Explore</div>
              <div className="mt-4 grid gap-3 text-sm text-slate-600">
                <button onClick={() => navigate("home")} className="text-left transition hover:text-brand-700">
                  Home
                </button>
                <button onClick={() => navigate("hunts")} className="text-left transition hover:text-brand-700">
                  Hunts
                </button>
                <button onClick={() => navigate("your-hunt")} className="text-left transition hover:text-brand-700">
                  Your Hunt
                </button>
                <button onClick={() => navigate("contact")} className="text-left transition hover:text-brand-700">
                  Contact
                </button>
              </div>
            </div>

            <div>
              <div className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-700">Collaborate</div>
              <p className="mt-4 text-sm leading-7 text-slate-500">
                Want to create, host, or launch a hunt with us?
              </p>
              <button
                onClick={() => navigate("contact")}
                className="mt-5 inline-flex items-center gap-2 rounded-full border border-brand-100 bg-brand-50 px-5 py-3 text-sm font-semibold text-brand-700 transition hover:border-brand-200 hover:bg-white"
              >
                Contact Us
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 border-t border-brand-100/80 pt-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <div>Copyright 2026 Souvenir Hunt</div>
            <div>Croatia live | Greece, Italy, Spain coming soon</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
