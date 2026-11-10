"use client";
import { authFetch as fetch } from "@/lib/auth-fetch";
import { HenryChat } from "./henry-chat";
import { SiteTools } from "./site-tools";
import { preferredMealGroup,resolveMealGroups } from "@/lib/meal-groups";
import { FoodTaskCard } from "./food-task-card";
import { foodDraftKey } from "@/lib/food-drafts";
import { MealGroupEditor } from "./meal-group-editor";
import { mergeDiaryMeal } from "@/lib/diary-state";
import { TrackingEditor } from "./tracking-editor";
import { MacroTargets } from "./macro-targets";
import "./barcode-camera.css";
import "./clean-mobile.css";
import "./design-system.css";
import "./workout-reference.css";
import "./professional.css";
import React, { useState, useEffect, useMemo, useRef } from "react";
import { startBarcodeScanner } from "@/lib/browser-barcode-scanner";
import {
  Activity,
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Bell,
  BookOpen,
  CalendarDays,
  Calculator,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Clock,
  Copy,
  Dumbbell,
  Flame,
  Footprints,
  Heart,
  HeartPulse,
  Home as HomeIcon,
  LayoutDashboard,
  Link2,
  LogOut,
  Menu,
  MessageSquare,
  MoreHorizontal,
  Plus,
  Search,
  Settings2,
  SlidersHorizontal,
  TrendingUp,
  Users,
  Watch,
  X,
  Download,
  Camera,
  FileText,
  Trash2,
  WifiOff,
  Play,
  PieChart,
  Save,
  Target,
  RefreshCw,
  Apple,
  Utensils,
  Moon,
  Loader2,
  Upload,
  Video,
  BrainCircuit,
  ScanLine,
  Milestone as MilestoneIcon,
  Trophy,
  Sprout,
  Sparkles,
} from "lucide-react";
import {
  Client,
  Log,
  LogData,
  Workout,
  Plan,
  Exercise,
  Targets,
  samplePlan,
  defaultTargets,
  emptyPlan,
  muscles,
  dayKey,
  shiftDate,
  averageWeight,
  mean,
  volume,
  progression,
  calculateFFMI,
  projectBodyComposition,
  estimateMaintenance,
} from "@/lib/domain";
import anatomy from "@/lib/anatomy.json";
import { ImportPresetGuide } from "./import-preset-guide";
import { parsePresetHistory } from "@/lib/import-presets";
import { parseHistoryFile } from "@/lib/history-import";
import { HomeDashboard } from "./home-dashboard";
import {ExerciseMuscles} from "@/components/exercise-muscles";
import {MuscleExposure} from "@/components/muscle-exposure";
import "@/components/exercise-muscles.css";
import { ResponsiveTable } from "@/components/responsive-table";
import { FlexibleTrainingDetails } from "./flexible-training-details";
import { WebConnections } from "./web-connections";
import { parseAppleHealth, parseHealthCSV } from "@/lib/health-import";
import { WorkoutBuilder } from "./workout-builder";
import { PastWorkoutTemplates } from "./past-workout-templates";
import { WorkoutTemplateReview } from "./workout-template-review";
import { SavedWorkouts } from "./saved-workouts";
import {SessionGate} from './session-gate';
import { WorkoutLogger } from "./workout-logger";
import {
  availableWorkouts,
  sessionSets,
  type WorkoutTemplate,
} from "@/lib/workout-templates";
import { workoutSchema } from "@/lib/domain";
import { FeaturePages } from "./feature-pages";
import { SleepRecovery } from "./sleep-recovery";
import { SocialPage } from "./social-page";
import {ClientBrief} from './client-brief';
import {ReviewReminders} from './review-reminders';
import {BulkProgramme} from './bulk-programme';
import {CoachingWorkspace} from './coaching-workspace';
import {PhotoAlignment} from './photo-alignment';
import {AchievementBadges} from './personal-milestones';
import {FirstWeek} from './first-week';
import {BackupReview} from './backup-review';
import { ExerciseProfileContext,GymEquipmentContext } from "@/lib/exercise-preferences";
import {preferredHealthReading,logsWithSourcePriority} from "@/lib/health-sources";
import {progressionRule,recipeLogSnapshot} from "@/lib/feature-completion";
import {IPhoneConnection} from './iphone-connection';
import {useAppNavigation} from "./use-app-navigation";
import {HealthImportReview} from "./health-import-review";
import { UtilityHub } from "./utility-hub";
import {toolPages,destinationLabels} from "@/lib/app-navigation";
import "./workspace-polish.css";
import "./topcoat-ui.css";
import { QuickNavigation } from "./quick-navigation";
import { AppUpdate } from "./app-update";
import { DiaryTools } from "./diary-tools";
import {
  devicePut,
  deviceGet,
  deviceDelete,
  enqueue,
} from "@/lib/device-store";
import { SyncStatus } from "./sync-status";
import { AppearanceSettings, usePreferences } from "./appearance";
import { applyMicronutrientEstimate, estimateMissingMicronutrients, prepareMeal, editorPortion, nutrientGroups } from "@/lib/food-nutrition";
import { summarizeMealNutrition } from "@/lib/meal-summary";
import {
  MealPlanner,
  VideoWorkoutBuilder,
  WeeklyRecap,
  CardioTracker,
  StrengthContext,
  MealSuggestion,
} from "./new-features";
import { CalorieMacroCalculator } from "./calorie-calculator";
import { HealthScreenshotPanel } from "./health-screenshot-panel";
import { TouchGrass } from "./touch-grass";
import { NutritionCarousel } from "./nutrition-carousel";
import { DailyNutrients } from "./daily-nutrients";
import { adaptiveCalorieTarget, calculateEnergyExpenditure } from "@/lib/energy-expenditure";
import { CASUAL_FEATURE_TABS } from "@/lib/experience-mode";
import { WaterTracker } from "./water-tracker";
const FoodSearch = React.lazy(()=>import("./food-search").then(module=>({default:module.FoodSearch})));
const FastFoodPicker = React.lazy(()=>import("./fast-food").then(module=>({default:module.FastFoodPicker})));
const SupermarketFinder = React.lazy(()=>import("./supermarket-finder").then(module=>({default:module.SupermarketFinder})));
const FoodEstimator = React.lazy(()=>import("./food-estimator").then(module=>({default:module.FoodEstimator})));
const FoodBuilder = React.lazy(()=>import("./food-builder").then(module=>({default:module.FoodBuilder})));
const ReleaseCentre = React.lazy(() =>
  import("./release-centre").then((m) => ({ default: m.ReleaseCentre })),
);
const FoodNutritionEditor = React.lazy(() =>
  import("./food-nutrition-editor").then((m) => ({
    default: m.FoodNutritionEditor,
  })),
);
const HabitBoard = React.lazy(() =>
  import("./habit-board").then((m) => ({ default: m.HabitBoard })),
);
const EntryHistory = React.lazy(() =>
  import("./entry-history").then((m) => ({ default: m.EntryHistory })),
);
const BodyInsights = React.lazy(() =>
  import("./body-insights").then((m) => ({ default: m.BodyInsights })),
);
const RecipeTools = React.lazy(() =>
  import("./recipe-tools").then((m) => ({ default: m.RecipeTools })),
);
const ImportMapping = React.lazy(() =>
  import("./import-mapping").then((m) => ({ default: m.ImportMapping })),
);
const WalkRunPlan = React.lazy(() => import('./walk-run-plan').then(m=>({default:m.WalkRunPlan})));
const CardioTools = React.lazy(() =>
  import("./cardio-tools").then((m) => ({ default: m.CardioTools })),
);
const VideoComparison = React.lazy(() =>
  import("./video-comparison").then((m) => ({ default: m.VideoComparison })),
);
const PrivacyTools = React.lazy(() =>
  import("./privacy-tools").then((m) => ({ default: m.PrivacyTools })),
);
const RecoveryInsights = React.lazy(() =>
  import("./recovery-insights").then((m) => ({ default: m.RecoveryInsights })),
);
const TrainingInsights = React.lazy(() =>
  import("./training-insights").then((m) => ({ default: m.TrainingInsights })),
);
const WorkspaceTools = React.lazy(() =>
  import("./workspace-tools").then((m) => ({ default: m.WorkspaceTools })),
);
const uidDemo = "preview";
const demoClient: Client = {
  id: "preview-jamie",
  name: "Jamie",
  email: "",
  owner: uidDemo,
  member: null,
  demo: 1,
  personal: 0,
  targets: {
    ...defaultTargets,
    height: 182,
    startWeight: 74,
    maintenance: 2800,
    bodyFat: 20,
    scheduleMode: "fixed",
    goal: "Visible abs by summer",
    goalDate: "2026-12-01",
  },
  plan: samplePlan,
  created: "2026-10-01",
  version: 1,
};
const initialLogs: Log[] = Array.from({ length: 28 }, (_, i) => ({
  id: "demo" + i,
  client: demoClient.id,
  date: shiftDate(dayKey(), i - 27),
  updated: "",
  data: {
    weight: Number(
      (74 + (27 - i) * 0.057 + [0, 0.1, -0.1, 0.15][i % 4]).toFixed(1),
    ),
    calories: 2150 + (i % 4) * 35,
    protein: 100 + (i % 3) * 6,
    fat: 50,
    carbs: 338,
    steps: 14000 + (i % 4) * 750,
    cardio: 30,
    sleep: 7 + (i % 3) * 0.5,
    water: 2.5,
    energy: 4,
    notes: i === 27 ? "Training feels good. Ready for next week." : "",
    checkin: i === 27,
    reviewed: false,
  },
}));
const sampleMeals = [
  {
    id: "demo-breakfast",
    client: demoClient.id,
    date: dayKey(),
    data: {
      id: "demo-breakfast",
      date: dayKey(),
      category: "Breakfast",
      name: "Skyr, oats & berries",
      calories: 465,
      protein: 31,
      carbs: 67,
      fat: 8,
      notes: "Example meal",
    },
  },
  {
    id: "demo-lunch",
    client: demoClient.id,
    date: dayKey(),
    data: {
      id: "demo-lunch",
      date: dayKey(),
      category: "Lunch",
      name: "Chicken rice bowl",
      calories: 650,
      protein: 38,
      carbs: 91,
      fat: 12,
      notes: "Example meal",
    },
  },
  {
    id: "demo-dinner",
    client: demoClient.id,
    date: dayKey(),
    data: {
      id: "demo-dinner",
      date: dayKey(),
      category: "Dinner",
      name: "Salmon, potatoes & greens",
      calories: 790,
      protein: 31,
      carbs: 105,
      fat: 28,
      notes: "Example meal",
    },
  },
  {
    id: "demo-snack",
    client: demoClient.id,
    date: dayKey(),
    data: {
      id: "demo-snack",
      date: dayKey(),
      category: "Snacks",
      name: "Protein shake & banana",
      calories: 280,
      protein: 25,
      carbs: 38,
      fat: 3,
      notes: "Example meal",
    },
  },
];
type HealthMetric = {
  id: string;
  client: string;
  date: string;
  metric: string;
  value: number;
  unit: string;
  source: string;
  created?: string;
};
type State = {
  workspaceRecords?: any[];
  workoutTemplates: WorkoutTemplate[];
  coachNote?: string;
  progressionTargets?: any[];
  uid: string;
  email: string;
  clients: Client[];
  logs: Log[];
  workouts: Workout[];
  messages: any[];
  photos: any[];
  audit: any[];
  templates: any[];
  savedMeals: any[];
  savedFoods: any[];
  meals: any[];
  healthMetrics: HealthMetric[];
  wearableConnections: any[];
  exerciseVideos: any[];
  aiMessages: any[];
  bodyComposition: any[];
  progressPlan: any;
  progressMilestones: any[];
};
const sampleHealthMetrics: HealthMetric[] = Array.from(
  { length: 14 },
  (_, i) => {
    const date = shiftDate(dayKey(), i - 13),
      active = 420 + (i % 4) * 35;
    return [
      {
        id: `demo:total:${date}`,
        client: demoClient.id,
        date,
        metric: "total_calories",
        value: 2620 + (i % 5) * 42,
        unit: "kcal",
        source: "Example wearable data",
      },
      {
        id: `demo:active:${date}`,
        client: demoClient.id,
        date,
        metric: "active_calories",
        value: active,
        unit: "kcal",
        source: "Example wearable data",
      },
      {
        id: `demo:hrv:${date}`,
        client: demoClient.id,
        date,
        metric: "hrv",
        value: 54 + (i % 5),
        unit: "ms",
        source: "Example wearable data",
      },
      {
        id: `demo:rhr:${date}`,
        client: demoClient.id,
        date,
        metric: "rhr",
        value: 57 + (i % 3),
        unit: "bpm",
        source: "Example wearable data",
      },
      ...(
        [
          ["sleep_score", 82 + (i % 4) * 3, "/100"],
          ["readiness_score", 68 + (i % 5) * 5, "/100"],
          ["sleep_deep", 1.3, "hours"],
          ["sleep_rem", 1.6, "hours"],
          ["sleep_light", 4.2 + (i % 4) * 0.25, "hours"],
          ["sleep_awake", 0.35, "hours"],
        ] as [string, number, string][]
      ).map(([metric, value, unit]) => ({
        id: `demo:${metric}:${date}`,
        client: demoClient.id,
        date,
        metric,
        value,
        unit,
        source: "Example wearable data",
      })),
      {
        id: `demo:sleep:${date}`,
        client: demoClient.id,
        date,
        metric: "sleep_duration",
        value: 7.1 + (i % 4) * 0.25,
        unit: "hours",
        source: "Example wearable data",
      },
    ];
  },
).flat();
const demoBase: State = {
  coachNote: "",
  workoutTemplates: [],
  progressionTargets: [],
  uid: uidDemo,
  email: "",
  clients: [demoClient],
  logs: initialLogs,
  workouts: [],
  messages: [],
  photos: [],
  audit: [],
  templates: [],
  savedMeals: [],
  savedFoods: [],
  meals: sampleMeals,
  healthMetrics: sampleHealthMetrics,
  wearableConnections: [],
  exerciseVideos: [],
  aiMessages: [
    {
      id: "demo-ai-1",
      role: "user",
      content: "How should I adjust training if I slept badly?",
      created: dayKey() + "T09:00:00Z",
    },
    {
      id: "demo-ai-2",
      role: "assistant",
      content:
        "Treat one poor night as a signal, not a diagnosis. Keep the session manageable, use your warm-ups to judge how you feel, and avoid forcing a personal best if performance or coordination is off.",
      created: dayKey() + "T09:00:02Z",
    },
  ],
  bodyComposition: [
    {
      id: "demo-bc-1",
      client: demoClient.id,
      date: shiftDate(dayKey(), -14),
      weight: 74.8,
      height: 182,
      body_fat: 20.5,
      source: "Example manual entry",
    },
    {
      id: "demo-bc-2",
      client: demoClient.id,
      date: dayKey(),
      weight: 74,
      height: 182,
      body_fat: 20,
      source: "Example manual entry",
    },
  ],
  progressPlan: {
    start_date: dayKey(),
    weight: 74,
    height: 182,
    body_fat: 20,
    daily_deficit: 600,
  },
  progressMilestones: [],
};
const base: State = {
  coachNote: "",
  workoutTemplates: [],
  progressionTargets: [],
  uid: "",
  email: "",
  clients: [],
  logs: [],
  workouts: [],
  messages: [],
  photos: [],
  audit: [],
  templates: [],
  savedMeals: [],
  savedFoods: [],
  meals: [],
  healthMetrics: [],
  wearableConnections: [],
  exerciseVideos: [],
  aiMessages: [],
  bodyComposition: [],
  progressPlan: null,
  progressMilestones: [],
};
const navGroups: { name: string; emoji: string; items: [string, any][] }[] = [
  {
    name: "Home",
    emoji: "🏠",
    items: [
      ["Home", LayoutDashboard],
      ["Clients", Users],
    ],
  },
  { name: "Social", emoji: "👥", items: [["Social", Users]] },
  { name: "Touch grass", emoji: "🌱", items: [["Touch grass", Sprout]] },
  { name: "Sleep + cardio", emoji: "🌙", items: [["Sleep + cardio", Moon]] },
  {
    name: "Training & nutrition",
    emoji: "🏋️",
    items: [
      ["Training", Dumbbell],
      ["Cardio", Activity],
      ["Create workout", Plus],
      ["Workout from video", Video],
      ["Exercise library", BookOpen],
      ["Training tools", SlidersHorizontal],
      ["Calories", Utensils],
      ["Calorie calculator", Calculator],
      ["Recipes & meals", Apple],
      ["Strain", Activity],
      ["Import", Upload],
      ["Check-ins", ClipboardCheck],
    ],
  },
  {
    name: "Progress & health",
    emoji: "📈",
    items: [
      ["Progress", TrendingUp],
      ["Body comp", ScanLine],
      ["Sleep & recovery", Moon],
      ["Metrics", HeartPulse],
    ],
  },
  {
    name: "Coaching & learn",
    emoji: "🧠",
    items: [
      ["Beginner guide", BookOpen],
      ["AI coach", BrainCircuit],
      ["Messages", MessageSquare],
    ],
  },
  { name: "Connections", emoji: "🔗", items: [["Connections", Link2]] },
];
const casualNavigation: Record<
  (typeof CASUAL_FEATURE_TABS)[number],
  { icon: any; label: string }
> = {
  Home: { icon: LayoutDashboard, label: "Home" },
  Social: { icon: Users, label: "Social" },
  "Touch grass": { icon: Sprout, label: "Touch grass" },
  Training: { icon: Dumbbell, label: "Workout" },
  Calories: { icon: Utensils, label: "Food" },
  "Sleep + cardio": { icon: Moon, label: "Sleep + cardio" },
  "Calorie calculator": { icon: Calculator, label: "Targets" },
  Progress: { icon: TrendingUp, label: "Progress" },
  "AI coach": { icon: BrainCircuit, label: "Henry" },
  "Workout from video": { icon: Video, label: "Workout from video" },
  "Body comp": { icon: ScanLine, label: "Body composition" },
};
const tabs = navGroups.flatMap((group) => group.items);
const beginnerMuscles = [
  {
    id: "mid-chest",
    name: "Mid chest",
    region: "Chest",
    action:
      "The sternal fibres of the pectoralis major bring the upper arm across the body (horizontal adduction).",
    exercises: [
      "Machine or dumbbell chest press",
      "Pec deck or cable chest fly",
    ],
    tip: "Keep the shoulders comfortable and let the chest do the work; use a controlled range.",
  },
  {
    id: "upper-chest",
    name: "Upper chest",
    region: "Chest",
    action:
      "The clavicular fibres help bring the arm forward and across the body.",
    exercises: ["Low-incline dumbbell press", "Low-to-high cable fly"],
    tip: "Use a modest incline so the movement stays comfortable and controlled.",
  },
  {
    id: "lats",
    name: "Lats",
    region: "Back",
    action:
      "Move the upper arm down and back toward the torso (shoulder adduction and extension).",
    exercises: ["Lat pulldown", "Assisted pull-up"],
    tip: "Drive the elbows down; avoid turning every rep into a body swing.",
  },
  {
    id: "upper-back",
    name: "Upper back",
    region: "Back",
    action:
      "Retract and control the shoulder blades while helping move the upper arm.",
    exercises: ["Chest-supported row", "Seated cable row"],
    tip: "Pause briefly with the shoulder blades moving naturally; do not shrug every rep.",
  },
  {
    id: "side-delts",
    name: "Side delts",
    region: "Shoulders",
    action: "Raise the arm out to the side (shoulder abduction).",
    exercises: ["Cable lateral raise", "Light dumbbell lateral raise"],
    tip: "Use a load you can control without swinging your torso.",
  },
  {
    id: "front-delts",
    name: "Front delts",
    region: "Shoulders",
    action: "Help lift the arm forward and assist pressing movements.",
    exercises: ["Machine shoulder press", "Dumbbell front raise"],
    tip: "Pressing already trains the front delts; add isolation only if it fits your plan.",
  },
  {
    id: "rear-delts",
    name: "Rear delts",
    region: "Shoulders",
    action: "Move the upper arm back and out (horizontal abduction).",
    exercises: ["Reverse pec deck", "Cable rear-delt fly"],
    tip: "Keep the motion smooth and avoid using momentum.",
  },
  {
    id: "biceps",
    name: "Biceps",
    region: "Arms",
    action: "Bend the elbow and help turn the palm upward (supination).",
    exercises: ["Cable biceps curl", "Dumbbell curl"],
    tip: "Keep the upper arm mostly still and use a comfortable full range.",
  },
  {
    id: "triceps",
    name: "Triceps",
    region: "Arms",
    action:
      "Straighten the elbow; the long head also assists shoulder extension.",
    exercises: ["Cable triceps pushdown", "Overhead cable extension"],
    tip: "Move at the elbow and keep the shoulders comfortable.",
  },
  {
    id: "forearms",
    name: "Forearms",
    region: "Arms",
    action: "Support wrist and finger movement and help grip objects.",
    exercises: ["Reverse curl", "Light wrist curl"],
    tip: "Start light; forearms also work during most pulling and carrying exercises.",
  },
  {
    id: "quads",
    name: "Quadriceps",
    region: "Legs",
    action: "Straighten the knee; the rectus femoris also assists hip flexion.",
    exercises: ["Leg extension", "Leg press or goblet squat"],
    tip: "Choose a stable range that feels good at the knees.",
  },
  {
    id: "hamstrings",
    name: "Hamstrings",
    region: "Legs",
    action: "Bend the knee and help extend the hip.",
    exercises: ["Seated hamstring curl", "Light Romanian deadlift"],
    tip: "Learn the hip hinge with a light load before progressing.",
  },
  {
    id: "glutes",
    name: "Glutes",
    region: "Legs",
    action: "Extend the hip and help control the pelvis and thigh.",
    exercises: ["Hip thrust", "Supported split squat"],
    tip: "Use a stable setup and finish the hip movement without over-arching your back.",
  },
  {
    id: "calves",
    name: "Calves",
    region: "Legs",
    action:
      "Point the foot downward (plantar flexion) and help control the ankle.",
    exercises: ["Standing calf raise", "Seated calf raise"],
    tip: "Use a comfortable stretch and pause rather than bouncing.",
  },
  {
    id: "abs",
    name: "Abdominals",
    region: "Core",
    action:
      "Brace the trunk and help flex the spine and resist unwanted movement.",
    exercises: ["Cable crunch", "Dead bug"],
    tip: "Breathe steadily and keep the movement controlled; core work is not spot fat loss.",
  },
  {
    id: "obliques",
    name: "Obliques",
    region: "Core",
    action: "Help rotate and side-bend the trunk and resist rotation.",
    exercises: ["Cable wood-chop", "Side plank"],
    tip: "Move within a pain-free range and keep the hips and ribs controlled.",
  },
] as const;
const fmt = (n: number | null | undefined, d = 0) =>
  n == null
    ? "—"
    : n.toLocaleString(undefined, {
        maximumFractionDigits: d,
        minimumFractionDigits: d,
      });
const initials = (name: string) =>
  name
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
function Button({
  children,
  onClick,
  kind = "",
  type = "button",
  disabled = false,
  ...rest
}: any) {
  return (
    <button
      type={type}
      className={"btn " + kind}
      onClick={onClick}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  );
}
function Tag({ children, kind = "" }: any) {
  return <span className={"tag " + kind}>{children}</span>;
}
function Modal({ title, subtitle, children, close, foodDetail = false, foodSearch = false }: any) {
  const root = useRef<HTMLElement>(null),
    opener = useRef<HTMLElement|null>(typeof document === "undefined" ? null : document.activeElement as HTMLElement),
    closeRef = useRef(close);
  closeRef.current = close;
  useEffect(() => {
    const previous = opener.current,
      overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focus = () =>
      root.current
        ?.querySelector<HTMLElement>("button,input,select,textarea,a[href]")
        ?.focus();
    focus();
    const key = (e: KeyboardEvent) => {
      const dialogs = document.querySelectorAll('[role="dialog"]');
      if (dialogs[dialogs.length - 1] !== root.current) return;
      if (e.key === "Escape") {
        e.preventDefault();
        closeRef.current();
        return;
      }
      if (e.key !== "Tab") return;
      const nodes = Array.from(
          root.current?.querySelectorAll<HTMLElement>(
            "button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),a[href]",
          ) || [],
        ).filter((n) => n.getClientRects().length > 0),
        first = nodes[0],
        last = nodes.at(-1);
      if (!first) return;
      if (
        e.shiftKey &&
        (document.activeElement === first ||
          !root.current?.contains(document.activeElement))
      ) {
        e.preventDefault();
        last?.focus();
      } else if (
        !e.shiftKey &&
        (document.activeElement === last ||
          !root.current?.contains(document.activeElement))
      ) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("keydown", key);
      document.body.style.overflow = overflow;
      if(previous?.isConnected&&previous.getClientRects().length)previous.focus();else document.querySelector<HTMLElement>('.topbar button[aria-label="Menu"]')?.focus();
    };
  }, []);
  return (
    <div className="overlay" onClick={close}>
      <section
        ref={root}
        className={
          "modal" +
          (foodDetail ? " food-detail-modal" : "") +
          (foodSearch ? " food-search-modal" : "") +
          (title === "Daily check-in" || title === "Personal targets"
            ? " tracking-modal"
            : "")
        }
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-head">
          <div>
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button className="icon" aria-label="Close" onClick={close}>
            <X size={20} />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
  step,
  placeholder,
  min,
  max,
}: any) {
  const numeric = type === "number",
    match = numeric ? String(label).match(/^(.*?)\\s*\\(([^)]+)\\)$/) : null;
  return (
    <label className={"field" + (numeric ? " tracking-numeric-field" : "")}>
      <span>{match ? match[1] : label}</span>
      <span
        className={numeric ? "tracking-field-control" : "plain-field-control"}
      >
        <input
          aria-label={label}
          inputMode={numeric ? "decimal" : undefined}
          name={name}
          value={value ?? ""}
          type={type}
          required={required}
          step={step}
          min={min}
          max={max}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
        {match && <small>{match[2]}</small>}
      </span>
    </label>
  );
}
function Empty({ title, text, children }: any) {
  return (
    <div className="empty">
      <div className="empty-mark">
        <Activity size={26} />
      </div>
      <h3>{title}</h3>
      <p>{text}</p>
      {children}
    </div>
  );
}
function WeightChart({ logs, height = 170 }: any) {
  const points = logs.filter((l: Log) => l.data.weight != null).slice(-28);
  if (!points.length)
    return (
      <Empty
        title="Your progress starts here"
        text="Log a morning weigh-in to see the trend."
      />
    );
  const vals = points.map((p: Log) => p.data.weight as number);
  const min = Math.min(...vals) - 0.3,
    max = Math.max(...vals) + 0.3;
  const x = (i: number) => 42 + i * (648 / Math.max(1, points.length - 1));
  const y = (v: number) => 20 + ((max - v) / (max - min)) * (height - 48);
  const line = points
    .map((p: Log, i: number) => `${x(i)},${y(p.data.weight as number)}`)
    .join(" ");
  const rolling = points
    .map(
      (p: Log, i: number) =>
        `${x(i)},${y(averageWeight(logs, p.date) ?? p.data.weight!)}`,
    )
    .join(" ");
  return (
    <svg
      viewBox={`0 0 720 ${height + 25}`}
      className="weight-chart"
      role="img"
      aria-label="Daily weight and seven-day average in kilograms"
    >
      <defs>
        <linearGradient id="chartfade" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="var(--green)" stopOpacity=".18" />
          <stop offset="1" stopColor="var(--green)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <line
            x1="42"
            x2="700"
            y1={20 + (i * (height - 48)) / 3}
            y2={20 + (i * (height - 48)) / 3}
            stroke="var(--line)"
            strokeDasharray="3 5"
          />
          <text
            x="0"
            y={24 + (i * (height - 48)) / 3}
            fill="var(--muted)"
            fontSize="10"
          >
            {(max - (i * (max - min)) / 3).toFixed(1)}
          </text>
        </g>
      ))}
      <polygon
        points={`42,${height - 20} ${rolling} ${x(points.length - 1)},${height - 20}`}
        fill="url(#chartfade)"
      />
      <polyline points={line} fill="none" stroke="var(--chart-secondary,var(--muted))" strokeWidth="1.5" />
      <polyline
        points={rolling}
        fill="none"
        stroke="var(--green)"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {points.map((p: Log, i: number) => (
        <circle
          key={p.date}
          cx={x(i)}
          cy={y(p.data.weight!)}
          r="3"
          fill="var(--chart-secondary,var(--green))"
        >
          <title>{`${p.date}: ${p.data.weight} kg`}</title>
        </circle>
      ))}
      {[0, Math.floor((points.length - 1) / 2), points.length - 1]
        .filter((v, i, a) => a.indexOf(v) === i)
        .map((i) => (
          <text
            key={i}
            x={x(i)}
            y={height + 8}
            textAnchor="middle"
            fill="var(--muted)"
            fontSize="10"
          >
            {new Date(points[i].date + "T12:00").toLocaleDateString("en-AU", {
              day: "numeric",
              month: "short",
            })}
          </text>
        ))}
    </svg>
  );
}
function Anatomy({ values, selected, onSelect, unit="weighted points" }: any) {
  const palette = Array.from({length:9},(_,i)=>`color-mix(in srgb,var(--green) ${28+i*8}%,var(--panel2))`);  return (
    <div className="anatomy-pair">
      {(["front", "back"] as const).map((view) => (
        <svg
          viewBox="-205 -8 410 815"
          key={view}
          role="img"
          aria-label={view + " muscle map"}
        >
          {anatomy[view].map((p, i) => {
            const n = values[p.muscle] || 0;
            const fill = !p.n
              ? "var(--bg)"
              : !p.muscle
                ? "var(--panel2)"
                : n
                  ? palette[Math.min(8, Math.ceil(n / 1.5) - 1)]
                  : "var(--panel2)";
            return (
              <path
                key={i}
                d={p.d}
                transform={`scale(${p.sx} 1)`}
                fill={selected === p.muscle ? "var(--green)" : fill}
                stroke={selected === p.muscle ? "var(--green)" : "var(--line)"}
                strokeWidth="1.8"
                className={p.muscle ? "muscle" : ""}
                role={p.muscle?"button":undefined}
                tabIndex={p.muscle?0:undefined}
                aria-label={p.muscle?`${p.muscle}: ${n} ${unit}`:undefined}
                onKeyDown={event=>{if(p.muscle&&(event.key==="Enter"||event.key===" ")){event.preventDefault();onSelect(p.muscle)}}}
                onClick={() => p.muscle && onSelect(p.muscle)}
              >
                <title>
                  {p.muscle
                    ? `${p.muscle}: ${n} ${unit}`
                    : "Anatomical outline"}
                </title>
              </path>
            );
          })}
        </svg>
      ))}
    </div>
  );
}

export default function App() {
  const {preferences,setPreferences}=usePreferences();
  const [demoMode, setDemoMode] = useState(
    () => (globalThis as any).__FORM_DEMO_ONLY__ === true,
  );
  const [online, setOnline] = useState(true);
  const finishWorkoutLock=useRef<string|null>(null);
  const [saveConflict, setSaveConflict] = useState<any>(null);
  const [lastRemovedMeal, setLastRemovedMeal] = useState<any>(null);
  const [data, setData] = useState<State>(
      (globalThis as any).__FORM_DEMO_ONLY__ === true ? demoBase : base,
    ),
    [clientId, setClientId] = useState(""),
    navigation = useAppNavigation(data.uid+":"+clientId,[...tabs.map(([name])=>name),...CASUAL_FEATURE_TABS,"Workspace tools"],()=>setModal(null)),
    tab=navigation.tab,setTab=navigation.setTab,
    [selectedToolPage,setSelectedToolPage]=useState("Calories"),
    [navOpen, setNavOpen] = useState<Record<string, boolean>>({ Home: true }),
    [calorieDate, setCalorieDate] = useState(""),
    [builderDay, setBuilderDay] = useState(0),
    [mealSections, setMealSections] = useState<Record<string, boolean>>({
      Breakfast: true,
    }),
    [mealSummaryGroup, setMealSummaryGroup] = useState(""),
    [mode, setMode] = useState<"coach" | "client">("coach"),
    [experienceMode, setExperienceMode] = useState<"casual" | "science">(
      "science",
    ),
    [status, setStatus] = useState("Connecting…"),
    [busy, setBusy] = useState(false),
    [toast, setToast] = useState(""),
    [modal, setModal] = useState<string | null>(null),
    [search, setSearch] = useState(""),
    [mobile, setMobile] = useState(false),
    [day, setDay] = useState(0),
    [selectedMuscle, setSelectedMuscle] = useState("Side delts"),
    [volumeMode, setVolumeMode] = useState<"planned" | "completed">(
      "completed",
    ),
    [volumeDays,setVolumeDays]=useState(7),
    [volumeContribution,setVolumeContribution]=useState<"weighted"|"direct"|"indirect">("weighted"),
    [session, setSession] = useState<any>(null),
    sessionLeaseToken = useRef<string|null>(null),
    foodLogLock = useRef(false),
    [siteFeatures,setSiteFeatures] = useState<Record<string,boolean>>({}),
    [timer, setTimer] = useState(0),
    [draft, setDraft] = useState<any>({}),
    [invite, setInvite] = useState(""),
    [message, setMessage] = useState(""),
    [join, setJoin] = useState(""),
    [consent, setConsent] = useState(false),
    [photoFile, setPhotoFile] = useState<File | null>(null),
    [queueCount, setQueueCount] = useState(0),
    [historyKind, setHistoryKind] = useState<"workouts" | "nutrition">(
      "workouts",
    ),
    [historyPreset, setHistoryPreset] = useState(""),
    [workoutSource, setWorkoutSource] = useState("Heavy"),
    [foodSource, setFoodSource] = useState("Cronometer"),
    [workoutFile, setWorkoutFile] = useState<File | null>(null),
    [foodFile, setFoodFile] = useState<File | null>(null),
    [historyPreview, setHistoryPreview] = useState<any>(null),
    [historyParsing, setHistoryParsing] = useState(false),
    [historyError, setHistoryError] = useState(""),
    [historySuccess, setHistorySuccess] = useState(""),
    [metricSearch, setMetricSearch] = useState(""),
    [metricProfile, setMetricProfile] = useState({ age: "30", sex: "male" }),
    [metricFile, setMetricFile] = useState<File | null>(null),
    [aiPrompt, setAiPrompt] = useState(""),
    [guideSearch, setGuideSearch] = useState(""),
    [videoExercise, setVideoExercise] = useState<any>(null),
    [videoDate, setVideoDate] = useState(""),
    [videoFile, setVideoFile] = useState<File | null>(null),
    [bodyPhoto, setBodyPhoto] = useState<File | null>(null),
    [bodyConsent, setBodyConsent] = useState(false),
    [bodyEstimate, setBodyEstimate] = useState<any>(null),
    [foodBarcode, setFoodBarcode] = useState(""),
    [foodLookupStatus, setFoodLookupStatus] = useState(""),
    [foodQuery, setFoodQuery] = useState(""),
    [foodResults, setFoodResults] = useState<any[]>([]),
    [scannerOn, setScannerOn] = useState(false),
    [torchOn, setTorchOn] = useState(false),
    [torchSupported, setTorchSupported] = useState(false),
    [quickMenuOpen, setQuickMenuOpen] = useState(false),
    [manualFoodEntry, setManualFoodEntry] = useState(false),
    [foodLabelFile, setFoodLabelFile] = useState<File | null>(null),
    [foodFrontFile, setFoodFrontFile] = useState<File | null>(null),
    [foodConsent, setFoodConsent] = useState(false);
  const scannerVideo = useRef<HTMLVideoElement | null>(null);
  const scannerTrack = useRef<MediaStreamTrack | null>(null);
  const refreshSequence = useRef(0);
  const [editingWorkout, setEditingWorkout] = useState<WorkoutTemplate | null>(
    null,
  );
  const [approvedProgressions, setApprovedProgressions] = useState<
    Record<string, { weight: number; reps: number }>
  >({});
  const savedTemplates = availableWorkouts(
    data.clients.find((x) => x.id === clientId)?.plan ||
      data.clients[0]?.plan ||
      emptyPlan,
    data.workoutTemplates || [],
  );
  const c = data.clients.find((x) => x.id === clientId) || data.clients[0],
    scheduleMode = c?.targets.scheduleMode || "flexible",
    today = dayKey(c?.targets.timezone),
    selectedDate=calorieDate||today,
    isPreview = demoMode,
    isCoach = !!c && c.owner === data.uid,
    isSelfProfile = !!c && !!c.personal,
    canPairOwnProfile = isSelfProfile || (!isCoach && c?.member === data.uid),
    canEdit = isCoach && (isSelfProfile || mode === "coach");
  const clientMeals = useMemo(()=>data.meals.filter(meal=>meal.client===c?.id),[data.meals,c?.id]);
  const searchSavedFoods = useMemo(()=>[...data.savedFoods,...data.savedMeals.map(meal=>({...meal,custom:true}))],[data.savedFoods,data.savedMeals]);
  const logs = useMemo(
      () => logsWithSourcePriority(data.logs.filter((l) => l.client === c?.id),data.healthMetrics.filter(row=>row.client===c?.id),data.workspaceRecords||[]),
      [data.logs,data.healthMetrics,data.workspaceRecords,c?.id],
    ),
    workouts = useMemo(
      () => data.workouts.filter((w) => w.client === c?.id),
      [data.workouts, c?.id],
    ),
    latest = logs.find((l) => l.date === selectedDate),
    weights = logs.filter((l) => l.data.weight != null),
    avg = averageWeight(logs, selectedDate),
    prev = averageWeight(logs, shiftDate(selectedDate, -7)),
    delta = avg != null && prev != null ? avg - prev : null,
    maintenanceTrend = useMemo(
      () =>
        estimateMaintenance(
          logs,
          data.meals.filter((m) => m.client === c?.id),
          today,
          28,
        ),
      [logs, data.meals, c?.id, today],
    );
  const featureRecords = data.workspaceRecords || [];
  const foodGroups = useMemo(()=>resolveMealGroups(featureRecords,clientMeals),[featureRecords,clientMeals]);
  const calorieDay = selectedDate,
    selectedLog = logs.find((l) => l.date === calorieDay),
    calorieLog = selectedLog,
    todayMeals = useMemo(()=>clientMeals.filter(meal=>meal.date===calorieDay),[clientMeals,calorieDay]),
    recentMeal = useMemo(()=>clientMeals.reduce<typeof clientMeals[number]|undefined>((latest,meal)=>meal.date>calorieDay?latest:!latest||meal.date>latest.date||meal.date===latest.date&&String(meal.created||'')>String(latest.created||'')?meal:latest,undefined),[clientMeals,calorieDay]);
  const mealTotals = todayMeals.reduce(
      (a, m) => ({
        calories: a.calories + m.data.calories,
        protein: a.protein + m.data.protein,
        carbs: a.carbs + m.data.carbs,
        fat: a.fat + m.data.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 },
    ),
    calorieTotals = todayMeals.length
      ? mealTotals
      : {
          calories: calorieLog?.data.calories || 0,
          protein: calorieLog?.data.protein || 0,
          carbs: calorieLog?.data.carbs || 0,
          fat: calorieLog?.data.fat || 0,
        };
  const selectedMealEntries=mealSummaryGroup?todayMeals.filter(m=>(foodGroups.includes(m.data.category)?m.data.category:"Uncategorized")===mealSummaryGroup):[],selectedMealNutrition=summarizeMealNutrition(selectedMealEntries.map(m=>m.data));
  const healthFor=(date:string,metric:string)=>preferredHealthReading(data.healthMetrics.filter(row=>row.client===c?.id),date,metric,featureRecords);
  const expenditureReading = healthFor(calorieDay, "total_calories"),
    activeBurnReading = healthFor(calorieDay, "active_calories"),
    latestWeightForEnergy = [...weights].filter(x=>x.date<=calorieDay&&typeof x.data.weight==='number').sort((a,b)=>b.date.localeCompare(a.date))[0]?.data.weight || c?.targets.startWeight || null,
    latestBodyFatForEnergy = [...logs].filter(x=>x.date<=calorieDay&&typeof x.data.bodyFat==='number').sort((a,b)=>b.date.localeCompare(a.date))[0]?.data.bodyFat || c?.targets.bodyFat || null,
    energyModel = calculateEnergyExpenditure({
      calories:calorieTotals.calories,protein:calorieTotals.protein,carbs:calorieTotals.carbs,fat:calorieTotals.fat,
      activeCalories:activeBurnReading?.value,totalCalories:expenditureReading?.value,
      observedMaintenance:maintenanceTrend.maintenance,profileMaintenance:c?.targets.maintenance,
      weightKg:latestWeightForEnergy,bodyFatPercent:latestBodyFatForEnergy,
    }),
    calorieExpenditure = energyModel.tdee;
  const displaySteps =
      healthFor(calorieDay, "steps")?.value ?? selectedLog?.data.steps,
    displaySleep =
      healthFor(calorieDay, "sleep_duration")?.value ?? selectedLog?.data.sleep;
  const dayWorkouts = workouts.filter((w) => w.date === calorieDay),
    completedSets = dayWorkouts
      .flatMap((w) => w.sets || [])
      .filter((s: any) => s.completed && !s.warmup),
    hardSetCount = completedSets.length,
    activityBurn = activeBurnReading?.value || 0,
    strainIndex = Math.min(
      21,
      Math.round(activityBurn / 80 + hardSetCount * 0.6),
    );
  const featureEnabled = (name: string) =>
    siteFeatures[name] !== false && featureRecords.find(
      (r) => r.kind === "feature-flag" && r.data.name === name,
    )?.data.enabled !== false;
  const targetForDay = featureRecords.find(
    (r) => r.kind === "day-target" && r.data.date === calorieDay,
  )?.data;
  const calorieTargets = {
    ...c?.targets,
    ...Object.fromEntries(
      ["calories", "protein", "carbs", "fat"]
        .filter((k) => typeof targetForDay?.[k] === "number")
        .map((k) => [k, targetForDay[k]]),
    ),
  };
  calorieTargets.calories=adaptiveCalorieTarget(calorieTargets.calories||0,energyModel,maintenanceTrend.maintenance||c?.targets.maintenance);
  const newestWorkouts = useMemo(
    () =>
      [...workouts].sort(
        (a, b) =>
          b.date.localeCompare(a.date) ||
          (b.created || "").localeCompare(a.created || ""),
      ),
    [workouts],
  );
  const vols = useMemo(
    () =>
      volume(
        c?.plan || emptyPlan,
        session&&!workouts.some(w=>w.id===session.id)?[...workouts,session]:workouts,
        volumeMode,
        shiftDate(calorieDay,1-volumeDays),
        calorieDay,
        volumeContribution,
      ),
    [c?.plan, workouts, session, volumeMode, calorieDay, volumeDays, volumeContribution],
  );
  const healthCaptureSaved = (date: string, rows: HealthMetric[]) => {
    const ids = new Set(rows.map(row => row.id));
    setCalorieDate(date);
    setData(current => ({...current, healthMetrics: [...current.healthMetrics.filter(row => !ids.has(row.id)), ...rows.map(row => ({...row, created: new Date().toISOString()}))]}));
    void refresh(c.id);
    notify("Health readings saved");
  };
  const notify = (s: string) => {
    setToast(s);
    setTimeout(() => setToast(""), 4500);
  };
  useEffect(()=>{if(isPreview||!c)return;const url=new URL(location.href);if(url.searchParams.get('native')==='pair'){url.searchParams.delete('native');history.replaceState(history.state,'',url.pathname+url.search+url.hash);setTab('Connections');}},[data.uid,c?.id,isPreview]);
  async function refresh(id?: string) {
    const sequence = ++refreshSequence.current;
    const res = await fetch(
      "/api/data" + (id ? "?client=" + encodeURIComponent(id) : ""),
    );
    const next = (await res.json()) as any;
    if (!res.ok) {
      const error = new Error(next.error || "Connection failed") as Error & {
        status?: number;
      };
      error.status = res.status;
      throw error;
    }
    if (sequence !== refreshSequence.current) return next;
    setApprovedProgressions(
      Object.fromEntries(
        (next.progressionTargets || []).map((x: any) => [
          (id || next.selectedClient || next.clients[0]?.id) +
            ":" +
            x.exercise_id,
          { weight: x.weight, reps: x.reps },
        ]),
      ),
    );
    setDemoMode(false);
    setData({
      ...base,
      ...next,
      workoutTemplates: next.workoutTemplates || [],
      logs: next.logs || [],
      workouts: next.workouts || [],
      messages: next.messages || [],
      photos: next.photos || [],
      audit: next.audit || [],
      savedFoods: next.savedFoods || [],
      meals: next.meals || [],
      healthMetrics: next.healthMetrics || [],
      wearableConnections: next.wearableConnections || [],
      exerciseVideos: next.exerciseVideos || [],
      aiMessages: next.aiMessages || [],
      bodyComposition: next.bodyComposition || [],
      progressPlan: next.progressPlan || null,
      progressMilestones: next.progressMilestones || [],
    });
    try {
      localStorage.setItem(
        "form-offline-" + next.uid,
        JSON.stringify({ ...base, ...next }),
      );
    } catch {}
    const selected =
      id ||
      next.selectedClient ||
      next.clients.find((x: Client) => x.personal && x.owner === next.uid)
        ?.id ||
      next.clients[0]?.id;
    if (selected) {
      setClientId(selected);
      const selectedClient = next.clients.find(
        (x: Client) => x.id === selected,
      );
      setMode(
        selectedClient?.personal || selectedClient?.member === next.uid
          ? "client"
          : "coach",
      );
      if (!id && !next.selectedClient) return refresh(selected);
    }
    setStatus("Cloud connected");
    return next;
  }
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);
  useEffect(() => {
    if(location.hash.startsWith("#owner-setup="))setTab("Connections");
    const stored = localStorage.getItem("form-experience-mode");
    if (stored === "casual" || stored === "science") setExperienceMode(stored);
    if ("serviceWorker" in navigator)
      navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);
  useEffect(() => {
    const group = navGroups.find((g) => g.items.some(([name]) => name === tab));
    if (group) setNavOpen({ [group.name]: true });
  }, [tab]);
  useEffect(() => {
    if ((window as any).__FORM_DEMO_ONLY__) {
      setDemoMode(true);
      setStatus("Read-only interactive demo");
      setTab("Home");
      return;
    }
    refresh().catch((error: Error & { status?: number }) => {
      const cached = localStorage.getItem("form-offline-" + data.uid);
      if (cached && error.status !== 401 && error.status !== 403) {
        try {
          setData(JSON.parse(cached));
          setStatus("Cloud connected");
        } catch {
          setStatus("Connection error");
        }
      } else if (error.status === 401 || error.status === 403) {
        setData(base);
        setClientId("");
        setDemoMode(false);
        setStatus("Sign in required");
      } else setStatus("Connection error");
    });
    const token = new URLSearchParams(location.search).get("join");
    if (token) {
      setJoin(token);
      setModal("join");
    }
  }, []);
  useEffect(() => {
    const reload = () => {
      if (c?.id) void refresh(c.id);
    };
    window.addEventListener("form-records-change", reload);
    return () => window.removeEventListener("form-records-change", reload);
  }, [c?.id]);
  useEffect(() => {
    const params = new URLSearchParams(location.search),
      result = params.get("wearable");
    if (!result) return;
    setTab("Connections");
    notify(
      result === "connected"
        ? "Oura connected. Use Sync latest to import sleep and daily summaries."
        : "Oura connection was cancelled.",
    );
    params.delete("wearable");
    history.replaceState(
      {},
      "",
      location.pathname +
        (params.size ? "?" + params.toString() : "") +
        location.hash,
    );
  }, []);
  useEffect(() => {
    if (c) {
      setDay((new Date(today + "T12:00:00Z").getUTCDay() + 6) % 7);
      setCalorieDate("");
      setDraft({});
      setBodyEstimate(null);
      if (!isPreview) {
        try {
          const raw = JSON.parse(
            localStorage.getItem("form-draft-" + data.uid + "-" + c.id) ||
              "null",
          );
          if (raw && workoutSchema.safeParse(raw).success) setSession({...raw,sets:workoutSchema.parse(raw).sets});
        } catch {}
      }
    }
  }, [c?.id]);
  useEffect(() => {
    if (!timer) return;
    const t = setTimeout(() => setTimer(timer - 1), 1000);
    return () => clearTimeout(t);
  }, [timer]);
  useEffect(() => {
    if (!mobile) return;
    const drawer = document.getElementById("workspace-navigation"), previous = document.activeElement as HTMLElement | null;
    const controls = () => Array.from(drawer?.querySelectorAll<HTMLElement>("button:not(:disabled),a[href]") || []).filter((node) => node.getClientRects().length);
    controls()[0]?.focus();
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); setMobile(false); }
      if (event.key !== "Tab") return;
      const items = controls(), first = items[0], last = items.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener("keydown", key);
    return () => { document.removeEventListener("keydown", key); previous?.focus(); };
  }, [mobile]);

  useEffect(() => {
    if (modal !== "meal") setManualFoodEntry(false);
  }, [modal]);
  useEffect(() => {
    if (modal !== "foodScan" || !scannerOn) return;
    const video = scannerVideo.current;
    if (!video) return;
    setTorchOn(false);
    setTorchSupported(false);
    const stop = startBarcodeScanner({
      video,
      onReady(track) {
        scannerTrack.current = track;
        setTorchSupported(!!(track.getCapabilities?.() as any)?.torch);
        setFoodLookupStatus("Scanning… Hold the whole barcode in view, keep it steady and avoid glare.");
      },
      onCode(code) {
        setScannerOn(false);
        void findFood(code);
      },
      onError(message) {
        setFoodLookupStatus(message);
        setScannerOn(false);
      },
    });
    return () => {
      stop();
      scannerTrack.current = null;
      setTorchOn(false);
      setTorchSupported(false);
    };
  }, [modal, scannerOn]);
  useEffect(() => {
    if (session && !isPreview) {
      void devicePut("draft:" + data.uid + ":" + c?.id, session).catch(() =>
        notify(
          "IndexedDB draft storage unavailable; using the local fallback.",
        ),
      );
      try {
        localStorage.setItem(
          "form-draft-" + data.uid + "-" + c?.id,
          JSON.stringify(session),
        );
      } catch {
        notify(
          "This browser could not keep a local workout draft. Save before closing.",
        );
      }
    }
  }, [session]);
  useEffect(() => {
    if (isPreview) return;
    const sync = async () => {
      const key = "form-queue-" + data.uid;
      let items = JSON.parse(localStorage.getItem(key) || "[]");
      setQueueCount(items.length);
      if (!navigator.onLine) return;
      for (const item of [...items]) {
        try {
          const res = await fetch("/api/data", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(item),
          });
          if (!res.ok) break;
          items = items.filter((x: any) => x.value.id !== item.value.id);
          localStorage.setItem(key, JSON.stringify(items));
          setQueueCount(items.length);
        } catch {
          break;
        }
      }
    };
    sync();
    window.addEventListener("online", sync);
    return () => window.removeEventListener("online", sync);
  }, [data.uid]);
  useEffect(()=>{if(isPreview||!data.uid){setSiteFeatures({});return;}let active=true;const load=()=>{void fetch('/api/site-tools?features=1').then(async response=>{if(response.ok){const result=await response.json() as any;if(active)setSiteFeatures(result.features||{});}}).catch(()=>{});};load();window.addEventListener('focus',load);return()=>{active=false;window.removeEventListener('focus',load);};},[data.uid,isPreview]);
  useEffect(()=>{if(isPreview||!data.uid)return;const timeout=setTimeout(()=>{try{localStorage.setItem("form-offline-"+data.uid,JSON.stringify(data));}catch{}},400);return()=>clearTimeout(timeout);},[data,isPreview]);
  async function mutate(action: string, payload: any = {}, keep = false) {
    if (action === "meal" && payload.value) {
      const existing = data.meals.find(
        (m) => m.data.id === payload.value.id && m.client === c?.id,
      );
      if (existing && payload.expectedRevision === undefined)
        payload = { ...payload, expectedRevision: existing.data.revision || 0 };
    }
    if (isPreview && action === "scheduleMode") {
      setData((d) => ({
        ...d,
        clients: d.clients.map((x) =>
          x.id === c.id
            ? {
                ...x,
                targets: { ...x.targets, scheduleMode: payload.mode },
                version: x.version + 1,
              }
            : x,
        ),
      }));
      notify("Demo schedule preference updated.");
      return true;
    }
    if (isPreview) {
      notify(
        "This demo is read-only. You can browse every section without changing its sample data.",
      );
      return false;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, client: c?.id, ...payload,...(action==='workout'&&sessionLeaseToken.current?{leaseToken:sessionLeaseToken.current}:{}) }),
      });
      const result = (await res.json()) as any;
      if (res.status === 409 && ["meal", "log"].includes(action)) {
        setSaveConflict({ ...result, action, payload });
        throw new Error(result.error);
      }
      if (!res.ok) throw new Error(result.error || "Could not save");
      if (action === "invite") {
        setInvite(location.origin + "/?join=" + result.token);
        return true;
      }
      if (action === "deleteMeal")
        setLastRemovedMeal(data.meals.find((m) => m.id === payload.id) || null);
      if (action === "meal") {
        const value = result.meal || {...payload.value, revision: (payload.expectedRevision || 0) + 1};
        setData(current => ({...current, meals: mergeDiaryMeal(current.meals,c.id,value,result.created)}));
        if (!keep) setModal(null);
        notify("Saved to your workspace");
        return true;
      }
      if (action === "deleteMeal") {
        setData(current=>({...current,meals:current.meals.filter(meal=>meal.id!==payload.id)}));
        if (!keep) setModal(null);
        notify("Removed from your diary");
        return true;
      }
      try { await refresh(
        action === "create" || action === "join" || action === "personal"
          ? result.id
          : action === "delete"
            ? undefined
            : c?.id,
      );
      } catch (refreshError) {
        // The write already succeeded. Never queue/repeat it because its read-back failed.
        if (!keep) setModal(null);
        notify("Saved to your workspace. The connection interrupted reloading; your saved entry is safe.");
        return true;
      }
      if (!keep) setModal(null);
      notify("Saved to your workspace");
      return true;
    } catch (e: any) {
      if (
        ["workout", "meal", "log", "workoutTemplate"].includes(action) &&
        (!navigator.onLine || e.name === "TypeError") &&
        !isPreview
      ) {
        try {
          await enqueue(data.uid, { action, client: c.id, ...payload });
        } catch {
          notify(
            "Device storage is unavailable. Keep this form open and retry.",
          );
          return false;
        }
        notify(
          "Saved to this device’s pending queue. It will sync when you reconnect.",
        );
        if (!keep) setModal(null);
        return true;
      }
      notify(e.message);
      return false;
    } finally {
      setBusy(false);
    }
  }
  async function parseHistoryUpload(
    file: File,
    kind: "workouts" | "nutrition",
    source: string,
    presetId = "",
  ) {
    setHistoryParsing(true);
    if (kind === "workouts") setWorkoutFile(file);
    else setFoodFile(file);
    setHistoryPreview(null);
    setHistoryError("");
    setHistorySuccess("");
    if (file.size > 15 * 1024 * 1024) {
      setHistoryError("Choose a file smaller than 15 MB.");
      setHistoryParsing(false);
      return;
    }
    try {
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => resolve()),
      );
      const text = await file.text();
      const parsed = presetId ? parsePresetHistory(text, presetId) : parseHistoryFile(text, kind, source);
      setHistoryPreview({ kind, source, ...parsed });
    } catch (e: any) {
      setHistoryError(e.message || "Could not read this export.");
    } finally {
      setHistoryParsing(false);
    }
  }
  async function importHistory() {
    if (!historyPreview || isPreview) return;
    setBusy(true);
    setHistoryError("");
    try {
      const importedCount =
        historyPreview.kind === "workouts"
          ? historyPreview.workouts.length
          : historyPreview.meals.length + historyPreview.daily.length;
      const batches = [
        {
          action:
            historyPreview.kind === "workouts"
              ? "importWorkouts"
              : "importMeals",
          rows:
            historyPreview.kind === "workouts"
              ? historyPreview.workouts
              : historyPreview.meals,
        },
      ];
      if (historyPreview.kind === "nutrition")
        batches.push({
          action: "importNutritionDays",
          rows: historyPreview.daily,
        });
      let templatesCreated = 0,
        templatesUpdated = 0,
        approximateMatches = 0;
      for (const batch of batches)
        for (let i = 0; i < batch.rows.length; i += 20) {
          const r = await fetch("/api/data", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: batch.action,
              client: c.id,
              value: batch.rows.slice(i, i + 20),
            }),
          });
          const d = (await r.json()) as any;
          if (!r.ok) throw new Error(d.error || "Import failed.");
          templatesCreated += Number(d.templatesCreated || 0);
          templatesUpdated += Number(d.templatesUpdated || 0);
          approximateMatches += Number(d.approximateMatches || 0);
        }
      await refresh(c.id);
      setHistoryPreview(null);
      setWorkoutFile(null);
      setFoodFile(null);
      const label = historyPreview.kind === "workouts" ? `workout session${importedCount === 1 ? "" : "s"}` : `nutrition record${importedCount === 1 ? "" : "s"}`;
      setHistorySuccess(
        historyPreview.kind === "workouts"
          ? `${importedCount} ${label} imported. ${templatesCreated} workout template${templatesCreated === 1 ? "" : "s"} created${templatesUpdated ? ` and ${templatesUpdated} updated` : ""}. ${approximateMatches ? `${approximateMatches} exercise name${approximateMatches === 1 ? " was" : "s were"} matched to the closest library exercise.` : "All exercises matched exactly."}`
          : `${importedCount} ${label} imported into ${c.name}.`,
      );
      notify("History imported successfully.");
    } catch (e: any) {
      setHistoryError(
        e.message + " Reimporting is safe for entries already imported.",
      );
    } finally {
      setBusy(false);
    }
  }
  function openFoodScan(startCamera = false) {
    setFoodBarcode("");
    setFoodLookupStatus(
      startCamera
        ? "Opening camera…"
        : isPreview
          ? "Enter any barcode to load a sample food."
          : "Scan the product code or enter it manually.",
    );
    setFoodLabelFile(null);
    setFoodFrontFile(null);
    setFoodConsent(false);
    setDraft({
      food: {
        name: "",
        barcode: "",
        servingSize: "1 serving",
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        nutrients: {},
        saveToFoods: false,
      },
      foodServings: 1,
      id: crypto.randomUUID(),
      category: preferredMealGroup(foodGroups,draft.category),
    });
    setScannerOn(startCamera && !isPreview);
    setModal("foodScan");
  }
  function chooseFood(food: any) {
    setFoodBarcode(food.barcode || "");
    setDraft({
      returnToFoodSearch:true,
      food: { nutrients: {}, ...food, saveToFoods: false },
      foodServings: 1,
      id: crypto.randomUUID(),
      category: preferredMealGroup(foodGroups,draft.category),
    });
    setFoodLookupStatus(
      `${food.name} loaded. Check the serving amount, then log it.`,
    );
    setModal("foodScan");
  }
  async function findFood(code = foodBarcode) {
    const raw = code.trim(),
      numeric =
        raw.match(/(?:^|\D)(\d{8,14})(?:\D|$)/)?.[1] || raw.replace(/\D/g, "");
    if (numeric.length < 8 || numeric.length > 14) {
      setFoodLookupStatus("Enter a valid product barcode (8–14 digits).");
      return;
    }
    setFoodBarcode(numeric);
    if (isPreview) {
      setDraft((v: any) => ({
        ...v,
        nutrition: undefined,
        food: {
          ...v.food,
          name: "Demo oat bar",
          barcode: numeric,
          servingSize: "1 bar (45 g)",
          calories: 178,
          protein: 6,
          carbs: 26,
          fat: 5,
          saveToFoods: false,
        },
      }));
      setFoodLookupStatus(
        "Demo product found. Example values only; the live app checks the public food database.",
      );
      return;
    }
    const known = data.savedFoods.find((f: any) => f.barcode === numeric);
    if (known) {
      setDraft((v: any) => ({
        ...v,
        nutrition: undefined,
        food: {
          nutrients: {},
          servingGrams: null,
          ...known,
          ...(known.nutrition?.reference || {}),
          servingSize: known.serving_size || known.servingSize,
          saveToFoods: false,
        },
      }));
      setFoodLookupStatus(`Found ${known.name} in your saved foods.`);
      return;
    }
    setFoodLookupStatus("Looking up product…");
    try {
      const r = await fetch(
          "/api/food-lookup?code=" + encodeURIComponent(numeric),
        ),
        d = (await r.json()) as any;
      if (!r.ok) throw new Error(d.error || "Food lookup failed.");
      if (d.found) {
        const f = d.food;
        setDraft((v: any) => ({
          ...v,
          nutrition: undefined,
          food: {
            nutrients: {},
            servingGrams: null,
            ...f,
            barcode: numeric,
            saveToFoods: false,
          },
        }));
        setFoodLookupStatus(
          `Found ${f.name}${f.brand ? " · " + f.brand : ""}. Check the serving and label before logging.`,
        );
        void fetch("/api/food-search?q="+encodeURIComponent(String(f.name).slice(0,80))).then(r=>r.json()).then((body:any)=>{if(Array.isArray(body.foods))setFoodResults(body.foods)}).catch(()=>{});
      } else {
        setDraft((v: any) => ({
          ...v,
          nutrition: undefined,
          food: {
            name: "",
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
            nutrients: {},
            servingSize: "1 serving",
            barcode: numeric,
            saveToFoods: true,
          },
        }));
        setFoodLookupStatus(
          "No match found. Add the product name and nutrition label, then save it to your foods with this code.",
        );
      }
    } catch (e: any) {
      setFoodLookupStatus(
        e.message ||
          "Could not look up that code. You can enter the food manually.",
      );
    }
  }
  async function extractFoodLabel() {
    if (!foodLabelFile) {
      setFoodLookupStatus("Choose a clear nutrition-label photo first.");
      return;
    }
    if (!foodConsent) {
      setFoodLookupStatus(
        "Confirm consent before sending label photos for extraction.",
      );
      return;
    }
    const form = new FormData();
    form.set("client", c.id);
    form.set("consent", "true");
    form.set("label", foodLabelFile);
    if (foodFrontFile) form.set("front", foodFrontFile);
    setBusy(true);
    setFoodLookupStatus("Reading the nutrition label…");
    try {
      const r = await fetch("/api/food-label", { method: "POST", body: form });
      const d = (await r.json()) as any;
      if (!r.ok) throw new Error(d.error || "Could not read label.");
      setDraft((v: any) => ({
        ...v,
        nutrition: undefined,
        food: {
          nutrients: {},
          servingGrams: null,
          ...d,
          barcode: foodBarcode || v.food?.barcode || "",
          saveToFoods: !!(foodBarcode || v.food?.saveToFoods),
        },
      }));
      setFoodLookupStatus(
        "Values extracted. Check the serving size and macros against the package before saving.",
      );
    } catch (e: any) {
      setFoodLookupStatus(
        e.message || "Could not read label. Enter the values manually.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function logScannedFood(e: React.FormEvent) {
    e.preventDefault();
    if (foodLogLock.current) return;
    foodLogLock.current = true;
    try {
      const f = draft.food || {},
        prepared = prepareMeal(draft, true),
        value = {
          ...prepared,
          id: draft.id || crypto.randomUUID(),
          date: calorieDay,
          notes: `${prepared.nutrition.amount} ${prepared.nutrition.unit} · ${f.servingSize || f.serving_size || "serving"}`,
        };
      if (!value.name) {
        setFoodLookupStatus("Enter a food name first.");
        return;
      }
      if (!isPreview && f.saveToFoods) {
        const saved = await mutate(
          "saveFood",
          {
            value: {
              barcode: f.barcode || null,
              name: value.name,
              servingSize: prepared.nutrition.reference.servingSize,
              calories: Number(f.calories || 0),
              protein: Number(f.protein || 0),
              carbs: Number(f.carbs || 0),
              fat: Number(f.fat || 0),
              notes: "",
              nutrition: {
                ...prepared.nutrition,
                amount: 1,
                unit: "serving",
                reference: prepared.nutrition.reference,
              },
            },
          },
          true,
        );
        if (!saved) return;
      }
      if (await mutate("meal", { value }, true)) {
        setMealSections((s) => ({
          ...s,
          [preferredMealGroup(foodGroups,value.category)]: true,
        }));
        setModal(null);
        setScannerOn(false);
      }
    } catch (error: any) {
      setFoodLookupStatus(
        error.message || "Check the serving and label values before saving.",
      );
    } finally { foodLogLock.current = false; }
  }
  function addSavedFood(food: any) {
    setFoodBarcode(food.barcode || "");
    setDraft({
      food: {
        ...food,
        ...(food.nutrition?.reference || {}),
        servingSize: food.serving_size || food.servingSize,
        saveToFoods: false,
      },
      foodServings: 1,
      id: crypto.randomUUID(),
      category: "Snacks",
    });
    setFoodLookupStatus("Saved food loaded. Choose how many servings to log.");
    setModal("foodScan");
  }
  async function connectOura() {
    if (isPreview) {
      notify("Sign in as the client to connect a real Oura account.");
      return;
    }
    try {
      const r = await fetch("/api/oura?client=" + encodeURIComponent(c.id));
      const d = (await r.json()) as any;
      if (!r.ok) throw new Error(d.error || "Could not check Oura setup.");
      if (!d.configured) {
        notify(
          "Oura OAuth credentials need to be configured by the site owner.",
        );
        return;
      }
      if (!d.canConnect) {
        notify("The client needs to sign in to connect their own wearable.");
        return;
      }
      location.assign("/api/oura/authorize?client=" + encodeURIComponent(c.id));
    } catch (e: any) {
      notify(e.message);
    }
  }
  async function syncOura(action: "sync" | "disconnect" = "sync") {
    if (isPreview) {
      notify("Wearable syncing is unavailable in the demo.");
      return;
    }
    setBusy(true);
    try {
      const r = await fetch("/api/oura", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client: c.id, action }),
      });
      const d = (await r.json()) as any;
      if (!r.ok) throw new Error(d.error || "Oura request failed.");
      await refresh(c.id);
      notify(
        action === "sync"
          ? `Updated ${d.count} Oura readings.`
          : "Oura disconnected and its local tokens were removed.",
      );
    } catch (e: any) {
      notify(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function demoMutation(action: string, p: any) {
    if (action === "invite" || action === "join")
      throw new Error("Sign in to create a real client invitation.");
    if (action === "create") {
      const nc = {
        ...demoClient,
        id: crypto.randomUUID(),
        name: p.name,
        email: p.email,
        demo: 1,
        personal: 0,
        targets: { ...defaultTargets },
        plan: structuredClone(p.sample ? samplePlan : emptyPlan),
      };
      setData((d) => ({ ...d, clients: [...d.clients, nc] }));
      setClientId(nc.id);
      return;
    }
    if (action === "healthMetrics")
      setData((d) => ({
        ...d,
        healthMetrics: [
          ...d.healthMetrics.filter(
            (x) => !p.value.some((n: HealthMetric) => n.id === x.id),
          ),
          ...p.value,
        ],
      }));
    if (action === "meal") {
      const meal = {
        id: c.id + ":" + p.value.id,
        client: c.id,
        date: p.value.date,
        data: p.value,
      };
      setData((d) => ({
        ...d,
        meals: [...d.meals.filter((x) => x.id !== meal.id), meal],
      }));
    }
    if (action === "deleteMeal")
      setData((d) => ({ ...d, meals: d.meals.filter((x) => x.id !== p.id) }));
    if (action === "targets" || action === "plan") {
      setData((d) => ({
        ...d,
        clients: d.clients.map((x) =>
          x.id === c.id
            ? { ...x, [action]: p.value, version: x.version + 1 }
            : x,
        ),
      }));
    }
    if (action === "log") {
      const log = {
        id: c.id + ":" + p.date,
        client: c.id,
        date: p.date,
        updated: new Date().toISOString(),
        data: p.value,
      };
      setData((d) => ({
        ...d,
        logs: [
          ...d.logs.filter(
            (x) => x.id !== log.id && !(x.client === c.id && x.date === p.date),
          ),
          log,
        ].sort((a, b) => a.date.localeCompare(b.date)),
      }));
    }
    if (action === "workout")
      setData((d) => ({
        ...d,
        workouts: [
          ...d.workouts,
          { ...p.value, client: c.id, created: new Date().toISOString() },
        ],
      }));
    if (action === "message")
      setData((d) => ({
        ...d,
        messages: [
          ...d.messages,
          {
            id: crypto.randomUUID(),
            role: mode === "coach" ? "Coach" : "Client",
            body: p.body,
            created: new Date().toISOString(),
          },
        ],
      }));
    if (action === "review")
      setData((d) => ({
        ...d,
        logs: d.logs.map((x) =>
          x.client === c.id && x.date === p.date
            ? { ...x, data: { ...x.data, reviewed: true } }
            : x,
        ),
      }));
    if (action === "template")
      setData((d) => ({
        ...d,
        templates: [
          ...d.templates,
          {
            id: crypto.randomUUID(),
            name: p.name,
            plan: structuredClone(p.plan),
          },
        ],
      }));
    if (action === "delete") {
      setData((d) => ({
        ...d,
        clients: d.clients.filter((x) => x.id !== c.id),
      }));
      setClientId(data.clients.find((x) => x.id !== c.id)?.id || "");
    }
  }
  function switchClient(id: string) {
    const nextClient = data.clients.find((x) => x.id === id);
    setMode(
      nextClient?.personal || nextClient?.member === data.uid
        ? "client"
        : "coach",
    );
    setEditingWorkout(null);
    setClientId(id);
    setData((d) => ({
      ...d,
      workoutTemplates: [],
      progressPlan: null,
      progressMilestones: [],
      coachNote: "",
    }));
    setSession(null);
    if (!isPreview) refresh(id).catch((e) => notify(e.message));
  }
  function openLog(date = calorieDay) {
    const l = data.logs.find((l) => l.client === c?.id && l.date === date);
    setDraft({
      date,
      _updated: l?.updated || null,
      ...(l?.data || { notes: "", checkin: false }),
    });
    setModal("log");
  }
  async function launchWorkout(
    template: WorkoutTemplate,
    sessionDate = calorieDay,
  ) {
    if (isPreview) {
      notify(
        "The standalone preview is read-only. Start a workout in your signed-in app to save it.",
      );
    }
    const key = "form-draft-" + data.uid + "-" + c.id;
    let cached = session;
    if (!cached && !isPreview) {
      try {
        const saved = await deviceGet("draft:" + data.uid + ":" + c.id);
        if (saved?.version === 1 && workoutSchema.safeParse(saved.data).success)
          cached = saved.data;
      } catch {}
    }
    if (!cached && !isPreview) {
      try {
        const raw = JSON.parse(localStorage.getItem(key) || "null");
        if (raw && workoutSchema.safeParse(raw).success) cached = raw;
      } catch {}
    }
    if (cached) {
      if (
        confirm(
          "You have an unfinished workout. Resume it? Cancel keeps it saved.",
        )
      ) {
        setSession({...cached,sets:workoutSchema.parse(cached).sets});
        setModal("session");
        notify("Recovered your saved workout draft.");
      }
      return;
    }
    setSession({
      id: crypto.randomUUID(),
      templateId: template.id,
      templateVersion: template.id.startsWith("plan:")?c.version:template.version||data.workoutTemplates.find(row=>row.id===template.id)?.version||1,
      restPresets: Object.fromEntries(
        template.exercises.map((e) => [
          e.id,
          e.restSeconds ??
            [...workouts].reverse().find((w) => w.restPresets?.[e.id] != null)
              ?.restPresets?.[e.id] ??
            90,
        ]),
      ),
      date: sessionDate,
      name: template.name,
      startedAt: new Date().toISOString(),
      optionalExercises: structuredClone(
        template.exercises.filter((e) => e.optional),
      ),
      notes: "",
      exerciseNotes: {},
      sets: sessionSets(
        template.exercises,
        workouts,
        Object.fromEntries(
          Object.entries(approvedProgressions)
            .filter(([key]) => key.startsWith(c.id + ":"))
            .map(([key, value]) => [key.slice(c.id.length + 1), value]),
        ),
      ).map((s) => ({
        ...s,
        weight: Number((s.weight * (template.loadScale || 1)).toFixed(2)),
      })),
    });
    setModal("session");
  }
  function startSession(dayIndex = day, sessionDate = calorieDay) {
    const d = c.plan[dayIndex];
    if (!d) return;
    setDay(dayIndex);
    launchWorkout(
      { id: "plan:" + d.day, name: d.name, exercises: d.exercises },
      sessionDate,
    );
  }
  function discardSession() {
    void deviceDelete("draft:" + data.uid + ":" + c.id);
    try {
      localStorage.removeItem("form-draft-" + data.uid + "-" + c.id);
    } catch {}
    setSession(null);
    setModal(null);
    setTimer(0);
  }
  async function askAI(e: React.FormEvent) {
    e.preventDefault();
    const question = aiPrompt.trim();
    if (!question || busy) return;
    if (isPreview) {
      const now = new Date().toISOString();
      setData((d) => ({
        ...d,
        aiMessages: [
          ...d.aiMessages,
          {
            id: crypto.randomUUID(),
            role: "user",
            content: question,
            created: now,
          },
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content:
              "This is a sample reply in the demo. In the connected app, the AI coach uses this profile’s training plan and recent check-ins to tailor its answer.",
            created: new Date(Date.now() + 1).toISOString(),
          },
        ],
      }));
      setAiPrompt("");
      return;
    }
    setBusy(true);
    try {
      const r = await fetch("/api/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ client: c.id, message: question }),
        }),
        d = (await r.json()) as any;
      if (!r.ok) throw new Error(d.error || "AI could not reply.");
      setAiPrompt("");
      await refresh(c.id);
    } catch (err: any) {
      notify(err.message);
    } finally {
      setBusy(false);
    }
  }
  async function uploadExerciseVideo() {
    if (!videoExercise || !videoFile) return;
    if (isPreview) {
      notify("Video upload needs a signed-in workspace.");
      return;
    }
    setBusy(true);
    try {
      const f = new FormData();
      f.append("client", c.id);
      f.append("exerciseId", videoExercise.id);
      f.append("exerciseName", videoExercise.name);
      f.append("date", videoDate || today);
      f.append("file", videoFile);
      const r = await fetch("/api/exercise-video", { method: "POST", body: f }),
        d = (await r.json()) as any;
      if (!r.ok) throw new Error(d.error || "Video could not be uploaded.");
      setVideoFile(null);
      await refresh(c.id);
      notify("Form video saved to this exercise.");
    } catch (err: any) {
      notify(err.message);
    } finally {
      setBusy(false);
    }
  }
  async function requestBodyEstimate() {
    if (!bodyPhoto || !bodyConsent) {
      notify(
        "Choose a photo and confirm consent before requesting an estimate.",
      );
      return;
    }
    setBusy(true);
    try {
      const f = new FormData();
      f.append("client", c.id);
      f.append("file", bodyPhoto);
      f.append("weight", String(draft.bodyWeight ?? bodyWeight));
      f.append("height", String(draft.bodyHeight ?? bodyHeight));
      f.append("consent", "true");
      const r = await fetch("/api/body-estimate", { method: "POST", body: f }),
        d = (await r.json()) as any;
      if (!r.ok) throw new Error(d.error || "Could not estimate body fat.");
      setBodyEstimate(d);
    } catch (err: any) {
      notify(err.message);
    } finally {
      setBusy(false);
    }
  }
  const activeBodyPlan = data.progressPlan || {
    start_date: today,
    weight: c?.targets.startWeight || 0,
    height: c?.targets.height || 0,
    body_fat: c?.targets.bodyFat || 0,
    daily_deficit: Math.max(
      0,
      (c?.targets.maintenance || 2800) - (c?.targets.calories || 2200),
    ),
  };
  const latestBody = [
    ...data.bodyComposition.filter((x) => x.client === c?.id),
  ].sort((a, b) => b.date.localeCompare(a.date))[0];
  const bodyWeight = latestBody?.weight || activeBodyPlan.weight,
    bodyHeight = latestBody?.height || activeBodyPlan.height,
    bodyFat = latestBody?.body_fat || activeBodyPlan.body_fat,
    ffmi = calculateFFMI(bodyWeight, bodyHeight, bodyFat) || 0;
  const goalEnd =
    c?.targets.goalDate && c.targets.goalDate > today
      ? c.targets.goalDate
      : shiftDate(today, 84);
  const timelineWeeks = Math.max(
    12,
    Math.min(
      52,
      Math.ceil(
        (Date.parse(goalEnd + "T12:00:00") -
          Date.parse((activeBodyPlan.start_date || today) + "T12:00:00")) /
          604800000,
      ),
    ),
  );
  const weeklyForecast = Array.from(
    { length: timelineWeeks + 1 },
    (_, week) => {
      const projection = projectBodyComposition(
        activeBodyPlan.weight,
        activeBodyPlan.height,
        activeBodyPlan.body_fat,
        activeBodyPlan.daily_deficit || 0,
        week * 7,
        0.9,
      );
      return {
        week,
        date: shiftDate(activeBodyPlan.start_date || today, week * 7),
        weight: projection?.weight || activeBodyPlan.weight,
        bf: projection?.bodyFat || activeBodyPlan.body_fat,
      };
    },
  );
  async function exportProfile() {
    if (isPreview) {
      download(
        "Form-example.json",
        JSON.stringify(data, null, 2),
        "application/json",
      );
      return;
    }
    try {
      const r = await fetch("/api/export?client=" + encodeURIComponent(c.id)),
        d: any = await r.json();
      if (!r.ok) throw new Error(d.error || "Export failed.");
      download(
        "Form-" + c.name.replace(/[^a-z0-9]/gi, "-") + "-export.json",
        JSON.stringify(d, null, 2),
        "application/json",
      );
    } catch (e: any) {
      notify(e.message);
    }
  }
  function download(name: string, content: string, type = "text/plain") {
    const url = URL.createObjectURL(new Blob([content], { type }));
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  }
  const metricCatalog = [
    {
      id: "vo2",
      name: "VO₂ max",
      aliases: "vo2 max aerobic fitness cardio respiratory",
      unit: "mL/kg/min",
      health: "HKQuantityTypeIdentifierVO2Max",
      about:
        "VO₂ max estimates the maximum oxygen your body can use during intense exercise. Higher values generally reflect stronger cardiorespiratory fitness and are associated with better health outcomes, but one score is not a diagnosis or a guarantee of health.",
      improve:
        "Build a consistent aerobic base with gradually increasing moderate-intensity work. Add one or two appropriately scaled interval sessions per week only if recovery and health allow. Increase training gradually, allow recovery, and use the same measurement method when comparing trends.",
      high: "Higher cardiorespiratory fitness is generally linked with better endurance and lower cardiovascular and all-cause health risk in population studies. Fitness tracker estimates vary and very high values are not automatically better for every goal.",
      low: "Lower-than-peer-range fitness can be a useful prompt to build aerobic capacity. It does not diagnose disease; consider clinical advice before vigorous training if you have symptoms or relevant health conditions.",
    },
    {
      id: "hrv",
      name: "Heart rate variability",
      aliases: "hrv recovery",
      unit: "ms",
      health: "HKQuantityTypeIdentifierHeartRateVariabilitySDNN",
      about:
        "Variation in time between heartbeats. It changes with sleep, stress, illness, training, alcohol, and measurement method; compare personal trends from the same device.",
      improve:
        "Prioritize sleep, sensible training load, hydration, and stress management. There is no universal target score.",
      high: "A higher personal baseline can coincide with good recovery, but population comparisons are unreliable.",
      low: "A short-term dip can reflect normal stress or hard training. Look at multi-day trends and how you feel.",
    },
    {
      id: "rhr",
      name: "Resting heart rate",
      aliases: "resting heart rate pulse",
      unit: "bpm",
      health: "HKQuantityTypeIdentifierRestingHeartRate",
      about:
        "Heartbeats per minute at rest. Interpret against a consistent personal baseline.",
      improve:
        "Regular aerobic exercise, sleep, and avoiding nicotine can support cardiovascular fitness.",
      high: "A lower resting rate often accompanies aerobic conditioning; unusually low values with symptoms need medical attention.",
      low: "A sustained increase from baseline can follow stress, illness, dehydration, or training load. Seek care for concerning symptoms.",
    },
    {
      id: "steps",
      name: "Steps",
      aliases: "steps activity walking",
      unit: "steps",
      health: "HKQuantityTypeIdentifierStepCount",
      about:
        "Daily movement estimate. Trends and consistency are more useful than one universal target.",
      improve: "Add short walks and build your daily average gradually.",
      high: "More movement can support health and energy expenditure; allow recovery if activity causes pain.",
      low: "Low activity can be improved with small, sustainable walking breaks.",
    },
    {
      id: "weight",
      name: "Body weight",
      aliases: "weight body mass",
      unit: "kg",
      health: "HKQuantityTypeIdentifierBodyMass",
      about:
        "Scale weight varies with fluids, food, and timing. Use consistent morning readings and a rolling average.",
      improve:
        "Use a consistent routine and review weekly averages alongside other progress measures.",
      high: "Weight alone does not describe health or body composition.",
      low: "Weight alone does not describe health or body composition.",
    },
    {
      id: "sleep_duration",
      name: "Sleep duration",
      aliases: "sleep hours bedtime",
      unit: "hours",
      health: "",
      about:
        "Oura’s main sleep-period duration, shown in hours. It is a device estimate; compare consistent trends and how rested you feel.",
      improve:
        "Keep a regular sleep and wake time, leave enough time for sleep, and reduce late caffeine and disruptive light/noise.",
      high: "Adequate, consistent sleep supports recovery, mood and attention. More is not always better if sleep is unrefreshing or symptoms persist.",
      low: "Repeated short sleep may impair mood, attention and recovery. Review routines and discuss persistent sleep problems with a health professional.",
    },
    {
      id: "sleep_score",
      name: "Sleep score",
      aliases: "sleep quality score oura",
      unit: "/100",
      health: "",
      about:
        "Oura’s daily sleep summary score, not a clinical sleep assessment.",
      improve:
        "Use it as a trend prompt alongside sleep duration and how you feel.",
      high: "A high score can reflect favorable sleep measures in Oura’s model, but it does not rule out a sleep disorder.",
      low: "A low score may reflect short or disrupted sleep. Look at repeated trends rather than a single night.",
    },
    {
      id: "readiness_score",
      name: "Readiness score",
      aliases: "readiness recovery oura",
      unit: "/100",
      health: "",
      about:
        "Oura’s daily readiness summary score, not a diagnosis or a direct measure of whether training is safe.",
      improve:
        "Balance training load with recovery, sleep, nutrition and subjective wellbeing.",
      high: "A higher score can indicate favorable signals in Oura’s model, but it is only one input.",
      low: "A lower score can follow poor sleep, stress, illness or hard training. Consider symptoms and trends before changing training.",
    },
    {
      id: "activity_score",
      name: "Activity score",
      aliases: "activity score oura",
      unit: "/100",
      health: "",
      about:
        "Oura’s daily activity summary score. It reflects the provider’s model and should not be equated with exact calories burned.",
      improve:
        "Build sustainable movement habits and avoid chasing a score through excessive exercise.",
      high: "A higher score reflects activity in the device model; it does not prove that recovery or nutrition needs are met.",
      low: "A lower score may be a reminder to add manageable movement, if appropriate.",
    },
    {
      id: "exercise_minutes",
      name: "Exercise ring",
      aliases: "apple fitness exercise ring active minutes",
      unit: "minutes",
      health: "",
      about: "Exercise minutes read from a reviewed activity screenshot or entered manually.",
      improve: "Build activity gradually and choose movement that suits your ability and recovery.",
      high: "More minutes are not automatically better; consider effort, recovery and symptoms.",
      low: "A low day can be a rest day. Longer-term consistency is more useful than one reading.",
    },
    {
      id: "stand_hours",
      name: "Stand ring",
      aliases: "apple fitness stand ring standing hours",
      unit: "hours",
      health: "",
      about: "Standing hours read from a reviewed activity screenshot or entered manually.",
      improve: "Short, regular movement breaks can reduce long periods of sitting.",
      high: "This is a movement reminder, not a complete measure of fitness or health.",
      low: "Try a manageable standing or walking break when it fits your day.",
    },
  ];
  function vo2Band(value: number, age: number, sex: string) {
    const tables: any = {
      male: [
        [29, 32.1, 40.1, 48, 55.2, 61.8, 66.3],
        [27.2, 30.2, 35.9, 42.4, 49.2, 56.5, 59.8],
        [24.2, 26.8, 31.9, 37.8, 45, 52.1, 55.6],
        [20.9, 22.8, 27.1, 32.6, 39.7, 45.6, 50.7],
        [17.4, 19.8, 23.7, 28.2, 34.5, 40.3, 43],
        [16.3, 17.1, 20.4, 24.4, 30.4, 36.6, 39.7],
      ],
      female: [
        [21.7, 23.9, 30.5, 37.6, 44.7, 51.3, 56],
        [19, 20.9, 25.3, 30.2, 36.1, 41.4, 45.8],
        [17, 18.8, 22.1, 26.7, 32.4, 38.4, 41.7],
        [16, 17.3, 19.9, 23.4, 27.6, 32, 35.9],
        [13.4, 14.6, 17.2, 20, 23.8, 27, 29.4],
        [13.1, 13.6, 15.6, 18.3, 20.8, 23.1, 24.1],
      ],
    };
    if (age < 20 || age > 79) return null;
    const cut =
      age < 30
        ? 0
        : age < 40
          ? 1
          : age < 50
            ? 2
            : age < 60
              ? 3
              : age < 70
                ? 4
                : 5;
    const p = tables[sex]?.[cut];
    if (!p) return null;
    return value < p[0]
      ? "Below 5th percentile"
      : value < p[2]
        ? "Below average (5th–25th)"
        : value < p[3]
          ? "Average (25th–50th)"
          : value < p[4]
            ? "Above average (50th–75th)"
            : value < p[5]
              ? "High (75th–90th)"
              : value < p[6]
                ? "Very high (90th–95th)"
                : "Above 95th percentile";
  }
  async function importHealthExport() {
    if (!metricFile || busy || isPreview) return;
    setBusy(true);
    let saved = 0;
    try {
      if (metricFile.size > 250000000)
        throw new Error(
          "Choose an export under 250 MB, or use a smaller health CSV.",
        );
      const values = metricFile.name.toLowerCase().endsWith(".csv")
        ? await parseHealthCSV(await metricFile.text(), c.id)
        : await parseAppleHealth(metricFile, c.id, today);
      if (!values.length)
        throw new Error(
          "No supported health readings found in this file. Apple Health imports include the most recent 90 days.",
        );
      for (let i = 0; i < values.length; i += 250) {
        const r = await fetch("/api/data", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "healthMetrics",
            client: c.id,
            value: values.slice(i, i + 250),
          }),
        });
        const result = (await r.json()) as any;
        if (!r.ok)
          throw new Error(result.error || "Could not save health readings");
        saved += values.slice(i, i + 250).length;
      }
      await refresh(c.id);
      setMetricFile(null);
      notify(
        "Imported " +
          saved +
          " health readings. Reimporting updates the same entries rather than duplicating them.",
      );
    } catch (e: any) {
      notify(
        (saved
          ? saved +
            " readings saved before an error. Reimport safely to finish. "
          : "") + (e.message || "Health import failed."),
      );
    } finally {
      setBusy(false);
    }
  }
  function exportCSV() {
    const fields = [
      "weight",
      "calories",
      "protein",
      "fat",
      "carbs",
      "steps",
      "cardio",
      "sleep",
      "water",
      "waist",
      "bodyFat",
    ] as const;
    download(
      (c?.name || "client") + "-daily-logs.csv",
      [
        "date," + fields.join(","),
        ...logs.map((l) =>
          [l.date, ...fields.map((f) => l.data[f] ?? "")].join(","),
        ),
      ].join("\n"),
      "text/csv",
    );
  }
  const escapeHTML = (v: string) =>
    v.replace(
      /[&<>"']/g,
      (ch) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[ch] || ch,
    );
  function shareProgress() {
    const w = window.open("", "_blank");
    if (!w) {
      notify("Allow pop-ups to create a printable summary.");
      return;
    }
    w.document.write(
      `<html><head><title>${escapeHTML(c.name)} progress summary</title><style>body{font:16px Arial;padding:40px;color:#152b38}h1{color:#12607a}li{margin:10px 0}</style></head><body><h1>${escapeHTML(c.name)} · Progress summary</h1><p>Prepared ${new Date().toLocaleDateString()}</p><ul><li>Latest weight: ${fmt(weights.at(-1)?.data.weight, 1)} kg</li><li>7-day average: ${fmt(avg, 1)} kg</li><li>Logged workouts: ${workouts.length}</li><li>Current goal: ${escapeHTML(c.targets.goal || "Not set")}</li></ul><p>For personal review with your coach.</p><script>window.print()<\/script></body></html>`,
    );
    w.document.close();
  }

  const toolContext=tab==="Workspace tools"?selectedToolPage:"";
  function openTools(context=tab){if(context==="Sleep + cardio")context="Sleep & recovery";setSelectedToolPage((toolPages as readonly string[]).includes(context)?context:"Training");setTab("Workspace tools");setMobile(false);}
  function savePlan(plan: Plan) {
    if (!canEdit) {
      notify(
        "Your coach manages this assigned plan. Use a personal profile to build a plan independently.",
      );
      return Promise.resolve(false);
    }
    return mutate("plan", { value: plan, version: c.version }, true);
  }
  function heading(title: string, sub: string, actions?: React.ReactNode) {
    return (
      <div className="page-heading">
        <div>
          <div className="eyebrow">YOUR COACHING WORKSPACE</div>
          <h1>{title}</h1>
          <p>{sub}</p>
        </div>
        <div className="heading-actions">{actions}</div>
      </div>
    );
  }
  const dateLabel = new Date().toLocaleDateString("en-AU", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: c?.targets.timezone || "Australia/Perth",
  });
  if (!isPreview && status !== "Cloud connected")
    return (
      <div className="app">
        <main className="connection-state panel" role="status">
          <div className="brand">
            <span className="brand-icon">f</span>form
            <span className="brand-dot">.</span>
          </div>
          {status === "Sign in required" ? <><h1>Open your own Form account</h1><p>Sign in to load your personal workouts, food diary and profile. Jamie is an example profile, not your account.</p><a className="btn primary" href="/signin" target="_top">Sign in to my account</a><button type="button" className="text-btn" onClick={()=>{setData(demoBase);setClientId(demoClient.id);setMode("client");setDemoMode(true);setStatus("Read-only interactive demo");}}>Explore Jamie’s example instead</button></> : status === "Connection error" ? (
            <>
              <h1>Your workspace couldn’t connect</h1>
              <p>
                We couldn’t load your saved client data. Your workspace hasn’t
                been replaced with sample data.
              </p>
              <div className="row wrap">
                <Button
                  kind="primary"
                  onClick={() => {
                    setStatus("Connecting…");
                    refresh().catch(() => setStatus("Connection error"));
                  }}
                >
                  <RefreshCw size={16} />
                  Try again
                </Button>
                <a className="btn" href="/signin" target="_top">
                  Sign in
                </a>
              </div>
            </>
          ) : (
            <>
              <h1>Loading your workspace…</h1>
              <p>Connecting to your private training data.</p>
              <Loader2 className="loading-spinner" size={24} />
            </>
          )}
        </main>
      </div>
    );
  if (!c)
    return (
      <main
        className="connection-state panel"
        style={{ maxWidth: 580, margin: "8vh auto" }}
      >
        <div className="brand">
          <span className="brand-icon">f</span>form.
        </div>
        <h1>Make room for your training.</h1>
        <p>
          Start with your own profile to log workouts, meals and progress. No
          coach is required. Coaching clients can be added later.
        </p>
        <Field
          label="Name"
          value={draft.name || ""}
          onChange={(v: string) => setDraft({ ...draft, name: v })}
        />
        <div className="row wrap">
          <Button
            kind="primary"
            disabled={busy || !draft.name?.trim()}
            onClick={() => mutate("personal", { name: draft.name })}
          >
            Create my training profile
          </Button>
          <Button
            disabled={busy || !draft.name?.trim()}
            onClick={() =>
              mutate("create", { name: draft.name, email: "", sample: false })
            }
          >
            Create a client
          </Button>
        </div>
        {join && (
          <section className="panel">
            <h2>Join your coach</h2>
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
              />
              I agree to share this profile’s training, nutrition and health
              records with my coach.
            </label>
            <Button
              disabled={!consent || busy}
              onClick={() => mutate("join", { token: join, consent: true })}
            >
              Accept invitation
            </Button>
          </section>
        )}
        {toast && <p role="status">{toast}</p>}
        <a className="text-btn" href="/signout">
          Sign out
        </a>
      </main>
    );
  return (
    <GymEquipmentContext.Provider value={featureRecords.filter(record=>record.kind==='gym'&&!record.deleted).map(record=>({id:record.id,name:record.data.name,equipment:String(record.data.equipment||'').split(/[\n,]/).map(value=>value.trim()).filter(Boolean)}))}><ExerciseProfileContext.Provider
      value={featureRecords
        .filter((r) => r.kind === "exercise-profile")
        .map((r) => r.data)}
    >
      <div className="app">
        <a className="skip-link" href="#main-content">Skip to content</a>
        <aside id="workspace-navigation" aria-label="Workspace navigation" className={"sidebar " + (mobile ? "open" : "")}>
          <a className="brand" href="/" aria-label="Form home">
            <span className="brand-icon">f</span>form
            <span className="brand-dot">.</span>
          </a>
          <button
            className="icon mobile-only sidebar-close"
            aria-label="Close menu"
            onClick={() => setMobile(false)}
          >
            <X size={22} />
          </button>
          <div className="workspace">
            <div className="avatar small">{initials(data.email || "Form")}</div>
            <div>
              <b>{mode === "coach" ? "Coaching workspace" : "My workspace"}</b>
              <small>Personal workspace</small>
            </div>
          </div>
          <span className="nav-label">
            {experienceMode === "casual"
              ? "CASUAL LIFTER MODE"
              : "SCIENCE-BASED LIFTER MODE"}
          </span>
          <nav className="workspace-nav">
            <button onClick={()=>{setMobile(false);setModal("navigation");}}><Search size={17}/><span>Search Form</span></button>
            <button className={tab==="Workspace tools"?"active":""} onClick={()=>openTools()}><SlidersHorizontal size={17}/><span>Workspace tools</span></button>
            {experienceMode === "casual"
              ? CASUAL_FEATURE_TABS.map((name) => {
                  const { icon: Icon, label } = casualNavigation[name];
                  return (
                  <button
                    key={name}
                    className={tab === name ? "active" : ""}
                    aria-current={tab === name ? "page" : undefined}
                    onClick={() => {
                      setTab(name);
                      setMobile(false);
                    }}
                  >
                    <Icon size={17} aria-hidden="true"/>
                    <span>{label}</span>
                  </button>
                  );
                })
              : navGroups.map((group) => {
                  const visible = group.items.filter(
                      ([name]) => mode === "coach" || name !== "Clients",
                    ),
                    opened = !!navOpen[group.name];
                  const GroupIcon = group.items[0][1] as any;
                  if (visible.length === 1 && group.name !== "Home") {
                    const [destination, DirectIcon] = visible[0];
                    return <div className="nav-folder" key={group.name}><button
                      className={"nav-folder-toggle social-nav-link " + (tab === destination ? "active" : "")}
                      aria-current={tab === destination ? "page" : undefined}
                      onClick={() => { setTab(destination); setMobile(false); }}
                    ><span className="nav-folder-emoji" aria-hidden="true"><DirectIcon size={17}/></span><span>{destination}</span></button></div>;
                  }
                  return (
                    <div className="nav-folder" key={group.name}>
                      <button
                        className={
                          "nav-folder-toggle " + (opened ? "opened" : "")
                        }
                        aria-expanded={opened}
                        onClick={() =>
                          setNavOpen(opened ? {} : { [group.name]: true })
                        }
                      >
                        <span className="nav-folder-emoji" aria-hidden="true">
                          <GroupIcon size={17}/>
                        </span>
                        <span>{group.name}</span>
                        <ChevronDown size={15} />
                      </button>
                      {opened && (
                        <div className="nav-folder-items">
                          {visible.map(([name, Icon]) => (
                            <button
                              key={name}
                              className={tab === name ? "active" : ""}
                              aria-current={tab === name ? "page" : undefined}
                              onClick={() => {
                                setTab(name);
                                setNavOpen({ [group.name]: true });
                                setMobile(false);
                              }}
                            >
                              <Icon size={17} />
                              <span>{name === "AI coach" ? "Henry" : name}</span>
                              {name === "Check-ins" &&
                                logs.some(
                                  (l) => l.data.checkin && !l.data.reviewed,
                                ) && <i />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
          </nav>
          <div className="sidebar-bottom">
            <button className="profile" onClick={() => {setMobile(false);setModal("workspace")}}>
              <div className="avatar small">
                {initials(data.email || "My account")}
              </div>
              <div>
                <b>{isPreview ? "Explore Form" : "Your account"}</b>
                <small>
                  {experienceMode === "casual"
                    ? "Casual Lifter Mode"
                    : "Science-Based Lifter Mode"}
                </small>
              </div>
              <Settings2 size={17} />
            </button>
          </div>
        </aside>
        {mobile && (
          <button
            className="sidebar-scrim"
            aria-label="Close navigation"
            onClick={() => setMobile(false)}
          />
        )}
        <div className="main-shell" data-current-tab={tab}>
          <header className="topbar">
            <div className="crumb">
              {tab!=="Home"&&<button className="icon" aria-label="Back" onClick={navigation.back}><ArrowLeft size={18}/></button>}
              <button
                className="icon mobile-only"
                onClick={() => setMobile(!mobile)}
                aria-label="Menu"
                aria-expanded={mobile}
                aria-controls="workspace-navigation"
              >
                <Menu size={20} />
              </button>
              <span>Form</span>
              <ChevronRight size={13} />
              <b>{tab === "Calories" ? "Food diary" : tab === "Training" ? "Workouts" : tab}</b>
            </div>
            <div className="top-actions">
              <span className="connection">
                <i className={isPreview ? "amber" : ""} />
                {isPreview
                  ? "Demo workspace"
                  : online
                    ? "Cloud connected"
                    : "Offline · device saves only"}
              </span>
              <button className="icon" aria-label="Search Form" onClick={()=>setModal("navigation")}><Search size={19}/></button>
              <button
                className="icon"
                aria-label="Reminders"
                onClick={() => {
                  setDraft({ time: "07:00" });
                  setModal("reminders");
                }}
              >
                <Bell size={18} />
              </button>
              <button
                className="icon"
                aria-label="Messages"
                onClick={() => setTab("Messages")}
              >
                <MessageSquare size={19} />
              </button>
            </div>
          </header>
          <main id="main-content" tabIndex={-1}>
            {modal==="navigation"&&<Modal title="Search Form & quick actions" close={()=>setModal(null)}>            <QuickNavigation
              tab={tab}
              tabs={navGroups.flatMap((g) => g.items.map(([name]) => name))}
              date={calorieDay}
              today={today}
              onDate={setCalorieDate}
              onNavigate={name=>{setModal(null);setTab(name)}}
              onAppearance={() => setModal("workspace")}
              onAction={(name) => {
                setModal(null);
                if (name === "Start workout") setTab("Training");
                else if (name === "Add food") {
                  setDraft({
                    id: crypto.randomUUID(),
                    date: calorieDay,
                    name: "",
                    category: preferredMealGroup(foodGroups),
                    calories: NaN,
                    protein: NaN,
                    carbs: NaN,
                    fat: NaN,
                    notes: "",
                  });
                  setModal("meal");
                } else if (name === "Log weight") openLog(calorieDay);
                else if (name === "Add cardio") setTab("Cardio");
                else if (name === "Import") setTab("Import");
                else {
                  openTools("Home");
                  setTimeout(() => {
                    const details =
                      document.querySelector<HTMLDetailsElement>(
                        ".roadmap-tools",
                      );
                    if (details) {
                      details.open = true;
                      details.scrollIntoView({ behavior: "smooth" });
                    }
                  }, 100);
                }
              }}
            /></Modal>}
            {c&&tab!=="Home"&&tab!=="Calories"&&tab!=="AI coach"&&<div className="workspace-context-bar"><label><span className="sr-only">Selected date across Form</span><input type="date" aria-label="Selected date across Form" value={calorieDay} max={today} onChange={event=>setCalorieDate(event.target.value)}/></label>{calorieDay!==today&&<button className="text-btn" onClick={()=>setCalorieDate(today)}>Today</button>}{tab!=="Workspace tools"&&<button className="text-btn" onClick={()=>openTools(tab)}><SlidersHorizontal size={15}/>Tools</button>}</div>}
            {c&&tab==="Workspace tools"&&<UtilityHub context={selectedToolPage} onContext={setSelectedToolPage} onBack={()=>setTab(selectedToolPage)}/>}{c&&["Metrics","Import"].includes(toolContext)&&<HealthImportReview key={data.uid+c.id} client={c.id} uid={data.uid} today={today} preview={isPreview} onChanged={()=>refresh(c.id)}/>}

            {isPreview && (
              <div className="demo-banner">
                <span>
                  <span className="live-dot" />
                  Preview mode · Example data
                </span>
              </div>
            )}
            {!isPreview &&
              !data.clients.some((x) => x.personal && x.owner === data.uid) && (
                <section className="panel slim">
                  <div>
                    <h3>Make Form yours</h3>
                    <p>
                      You’re viewing {c.demo ? "an example" : "a client"}{" "}
                      profile. Set up your own space for your workouts, meals
                      and progress.
                    </p>
                  </div>
                  <Button
                    kind="primary"
                    onClick={() => {
                      setDraft({ name: "" });
                      setModal("personalProfile");
                    }}
                  >
                    Set up my profile
                  </Button>
                </section>
              )}
            {session && modal !== "session" && (
              <section className="panel slim">
                <div>
                  <h3>Workout in progress · {session.name}</h3>
                  <p>Your draft stays separate from saved workout history.</p>
                </div>
                <Button kind="primary" onClick={() => setModal("session")}>
                  <Play size={16} />
                  Resume workout
                </Button>
              </section>
            )}
            {queueCount > 0 && (
              <div className="demo-banner">
                <span>
                  <WifiOff size={15} /> {queueCount} workout(s) waiting to sync
                  from this device.
                </span>
              </div>
            )}
            {data.clients.length === 0 ? (
              <>
                {heading(
                  "A fresh start.",
                  "A clear picture of every client, from day one.",
                )}
                <Empty
                  title="Meet your new coaching workspace"
                  text="Create your first client with a blank plan, or explore Jamie’s example program."
                >
                  <div className="row center">
                    <Button
                      kind="primary"
                      onClick={() => {
                        setDraft({ name: "", email: "", sample: false });
                        setModal("client");
                      }}
                    >
                      <Plus size={16} />
                      Add a client
                    </Button>
                    <Button
                      onClick={() => {
                        setDraft({
                          name:
                            (data.email || "").split("@")[0] ||
                            "My training profile",
                        });
                        setModal("personalProfile");
                      }}
                    >
                      <Plus size={16} />
                      Set up my profile
                    </Button>
                    <Button
                      onClick={() =>
                        mutate("create", {
                          name: "Jamie · Example",
                          email: "",
                          demo: true,
                          sample: true,
                        })
                      }
                    >
                      Load Jamie example
                    </Button>
                  </div>
                </Empty>
              </>
            ) : (
              <>
                {tab === "Home" && !isPreview && <FoodTaskCard key={data.uid+":"+c.id} uid={data.uid} client={c.id} onResume={task=>{setCalorieDate(task.date);setDraft({kind:task.kind,initial:task.initialId?data.savedMeals.find(meal=>meal.id===task.initialId):undefined,resumeInitialId:task.initialId});setModal("foodBuilder");}}/>}
                {toolContext === "Home" && !isPreview && <AchievementBadges key={"milestones:"+c.id} workouts={workouts} logs={logs} records={featureRecords} date={calorieDay}/>}
                {toolContext === "Home" && !isPreview && <FirstWeek key={"first-week:"+c.id} uid={data.uid} client={c.id} records={featureRecords} hasTemplate={data.workoutTemplates.some(template=>template.client===c.id)||c.plan.some(day=>day.exercises.length>0)} hasWorkout={workouts.some(workout=>workout.sets.some(set=>set.completed&&!set.warmup))} hasCheckin={logs.some(log=>log.data.checkin)} onNavigate={name=>{if(name==='Create workout')setEditingWorkout(null);setTab(name)}}/>}
                {tab === "Home" && (
                  <HomeDashboard
                    onTargets={!isPreview&&isSelfProfile?()=>{setDraft({...c.targets});setModal("targets")}:undefined}
                    key={c.id}
                    client={c}
                    uid={data.uid}
                    casual={experienceMode === "casual"}
                    date={calorieDay}
                    today={today}
                    logs={logs}
                    workouts={workouts}
                    totals={calorieTotals}
                    steps={displaySteps}
                    sleep={displaySleep}
                    bodyFat={bodyFat}
                    ffmi={ffmi}
                    volume={vols}
                    grassRecords={featureRecords as any}
                    onDate={setCalorieDate}
                    onNavigate={(name) => {
                      if (name === "Create workout") setEditingWorkout(null);
                      setTab(name);
                    }}
                    onStart={(i) => startSession(i, calorieDay)}
                    onLog={openLog}
                    renderChart={(ls) => <WeightChart logs={ls} />}
                    profileBar={
                      <div className="client-bar">
                        <div className="row">
                          <div className="avatar">{initials(c.name)}</div>
                          <div>
                            <select
                              className="client-select"
                              value={c.id}
                              onChange={(e) => switchClient(e.target.value)}
                            >
                              {data.clients.map((x) => (
                                <option key={x.id} value={x.id}>
                                  {x.name}
                                </option>
                              ))}
                            </select>
                            <div className="tiny muted">
                              {c.targets.goal}
                              {c.demo ? " · Example client" : ""}
                            </div>
                          </div>
                        </div>
                        <div className="row">
                          <Tag kind="green">
                            {isSelfProfile
                              ? "Your personal profile"
                              : c.member
                                ? "Client connected"
                                : "Coach managed"}
                          </Tag>
                          {isCoach && (
                            <div className="segmented">
                              <button
                                className={mode === "coach" ? "selected" : ""}
                                onClick={() => setMode("coach")}
                              >
                                Coach view
                              </button>
                              <button
                                className={mode === "client" ? "selected" : ""}
                                onClick={() => setMode("client")}
                              >
                                Client preview
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    }
                    extras={{
                      maintenance: (
                        <section className="panel maintenance-panel">
                          <div className="maintenance-copy">
                            <div className="maintenance-title">
                              <span className="maintenance-icon">
                                <Flame size={17} />
                              </span>
                              <div>
                                <h3>Estimated maintenance calories</h3>
                                <p>
                                  Personal estimate from your logged intake and
                                  body-weight trend
                                </p>
                              </div>
                            </div>
                            <div className="maintenance-value">
                              {maintenanceTrend.maintenance == null ? (
                                "Building your trend"
                              ) : (
                                <>
                                  {fmt(maintenanceTrend.maintenance)}{" "}
                                  <small>kcal/day</small>
                                </>
                              )}
                            </div>
                            <div
                              className="maintenance-meter"
                              aria-label={`${Math.min(100, (maintenanceTrend.daysBetween / 21) * 100)} percent of 21-day calibration period`}
                            >
                              <i
                                style={{
                                  width:
                                    Math.min(
                                      100,
                                      (maintenanceTrend.daysBetween / 21) * 100,
                                    ) + "%",
                                }}
                              />
                            </div>
                            <p className="maintenance-note">
                              {maintenanceTrend.maintenance == null
                                ? `Keep logging calories and morning weight. You have ${maintenanceTrend.daysBetween} days of weight trend so far; a first estimate needs at least 21 days of weight trend and 14 calorie logs.`
                                : `${maintenanceTrend.confidence === "steady" ? "21+ days of consistent data" : maintenanceTrend.confidence === "building" ? "More consistent data will improve this" : "Early estimate"} · Based on ${maintenanceTrend.calorieDays} calorie days and ${maintenanceTrend.weighIns} weigh-ins over ${maintenanceTrend.daysBetween} days. It updates from the recent trend; water changes and incomplete food logs can affect it. Keep logging consistently.`}
                            </p>
                          </div>
                          <div className="maintenance-stats">
                            <div>
                              <span>Average logged intake</span>
                              <b>
                                {maintenanceTrend.averageIntake == null
                                  ? "—"
                                  : `${fmt(maintenanceTrend.averageIntake)} kcal`}
                              </b>
                            </div>
                            <div>
                              <span>Weight trend</span>
                              <b>
                                {maintenanceTrend.weightChangePerWeek == null
                                  ? "—"
                                  : `${maintenanceTrend.weightChangePerWeek > 0 ? "+" : ""}${maintenanceTrend.weightChangePerWeek.toFixed(2)} kg/week`}
                              </b>
                            </div>
                            <span
                              className={
                                "tag " +
                                (maintenanceTrend.confidence === "steady"
                                  ? "green"
                                  : "")
                              }
                            >
                              {maintenanceTrend.confidence}
                            </span>
                          </div>
                        </section>
                      ),
                      volume: (
                        <section className="panel muscle-panel">
                          <PanelHead
                            title="Training, mapped"
                            sub={
                              volumeMode === "planned"
                                ? "Planned weekly exposure"
                                : `Completed exposure · ${volumeDays} days`
                            }
                            right={
                              <button
                                className="text-btn"
                                onClick={() => setTab("Progress")}
                              >
                                Explore <ArrowUpRight size={14} />
                              </button>
                            }
                          />
                          <div className="muscle-content">
                            <Anatomy
                              values={vols}
                              selected={selectedMuscle}
                              onSelect={setSelectedMuscle}
                              unit={volumeContribution==="weighted"?"weighted points":volumeContribution+" sets"}
                            />
                            <div className="muscle-list">
                              <span className="eyebrow">WEEKLY EMPHASIS</span>
                              {Object.entries(vols)
                                .filter(([, n]) => n > 0)
                                .sort((a, b) => b[1] - a[1])
                                .slice(0, 5)
                                .map(([m, n]) => (
                                  <button
                                    key={m}
                                    className={
                                      selectedMuscle === m ? "chosen" : ""
                                    }
                                    onClick={() => setSelectedMuscle(m)}
                                  >
                                    <div>
                                      <span>{m}</span>
                                      <b>
                                        {n}
                                        <small>{volumeContribution==="weighted"?" points":" sets"}</small>
                                      </b>
                                    </div>
                                    <div className="bar">
                                      <i
                                        style={{
                                          width:
                                            Math.min(100, (n / 16) * 100) + "%",
                                        }}
                                      />
                                    </div>
                                  </button>
                                ))}
                              <p className="tiny muted">
                                1 point direct · 0.5 indirect. Completed working sets include the current workout. Planned view excludes optional work.
                              </p>
                            </div>
                          </div>
                        </section>
                      ),
                      checkin: (
                        <section className="panel">
                          <PanelHead
                            title="Small actions. Real progress."
                            sub="Selected day’s check-in"
                          />
                          <div className="checklist">
                            {[
                              [
                                "Morning weigh-in",
                                selectedLog?.data.weight != null,
                                "After the bathroom, before breakfast",
                              ],
                              [
                                "Nutrition logged",
                                selectedLog?.data.calories != null,
                                "Food, macros and water",
                              ],
                              [
                                "Movement recorded",
                                selectedLog?.data.steps != null,
                                "Steps and incline cardio",
                              ],
                              [
                                "Recovery check",
                                selectedLog?.data.energy != null,
                                "Sleep, energy and how you feel",
                              ],
                            ].map(([label, done, sub]) => (
                              <button
                                key={String(label)}
                                onClick={() => openLog(calorieDay)}
                              >
                                <span
                                  className={
                                    "check-circle " + (done ? "done" : "")
                                  }
                                >
                                  {done && <Check size={12} />}
                                </span>
                                <span>
                                  <b>{label}</b>
                                  <small>{sub}</small>
                                </span>
                                <ChevronRight size={14} />
                              </button>
                            ))}
                          </div>
                        </section>
                      ),
                      recap: (
                        <WeeklyRecap
                          client={c}
                          logs={logs}
                          workouts={workouts}
                          today={today}
                          onReminders={() => {
                            setDraft({ time: "08:00" });
                            setModal("reminders");
                          }}
                        />
                      ),
                      history: (
                        <section className="panel selected-day-overview">
                          <PanelHead
                            title={
                              new Date(
                                calorieDay + "T12:00:00",
                              ).toLocaleDateString("en-AU", {
                                weekday: "long",
                                day: "numeric",
                                month: "long",
                              }) + " · daily history"
                            }
                            sub="Food, training and check-in for the selected date"
                            right={
                              <Button onClick={() => openLog(calorieDay)}>
                                View check-in
                              </Button>
                            }
                          />
                          <div className="two-col">
                            <div>
                              <h3>Food · {fmt(calorieTotals.calories)} kcal</h3>
                              {todayMeals.length ? (
                                todayMeals.map((m) => (
                                  <div className="history-row" key={m.id}>
                                    <Utensils size={15} />
                                    <b>{m.data.name}</b>
                                    <span>{fmt(m.data.calories)} kcal</span>
                                  </div>
                                ))
                              ) : (
                                <p className="muted tiny">
                                  No individual foods logged for this date.
                                </p>
                              )}
                            </div>
                            <div>
                              <h3>Training</h3>
                              {dayWorkouts.length ? (
                                dayWorkouts.map((w) => (
                                  <div className="history-row" key={w.id}>
                                    <Dumbbell size={15} />
                                    <b>{w.name}</b>
                                    <span>
                                      {
                                        w.sets.filter((x: any) => x.completed)
                                          .length
                                      }{" "}
                                      sets
                                    </span>
                                  </div>
                                ))
                              ) : (
                                <p className="muted tiny">
                                  No completed workout logged on this date.
                                </p>
                              )}
                            </div>
                          </div>
                        </section>
                      ),
                    }}
                  />
                )}
                {tab === "Clients" && (
                  <>
                    {heading(
                      "Your people.",
                      "Individual goals. Independent programs. One place to coach.",
                      <div className="row wrap">
                        <Button
                          onClick={() => {
                            const mine = data.clients.find((x) => x.personal);
                            if (mine) {
                              switchClient(mine.id);
                              setTab("Home");
                            } else {
                              setDraft({
                                name:
                                  (data.email || "").split("@")[0] ||
                                  "My training profile",
                              });
                              setModal("personalProfile");
                            }
                          }}
                        >
                          {data.clients.some((x) => x.personal)
                            ? "Open my training profile"
                            : "Set up my training profile"}
                        </Button>
                        <Button
                          kind="primary"
                          onClick={() => {
                            setDraft({ name: "", email: "", sample: false });
                            setModal("client");
                          }}
                        >
                          <Plus size={16} />
                          Add client
                        </Button>
                      </div>,
                    )}
                    <section className="panel">
                      <PanelHead
                        title="Coach dashboard"
                        sub="Missed sessions, overdue check-ins, stalled trends and milestones"
                      />
                      <ResponsiveTable>
                        <table>
                          <thead>
                            <tr>
                              <th>CLIENT</th>
                              <th>LAST LOG</th>
                              <th>CHECK-IN</th>
                              <th>STATUS</th>
                            </tr>
                          </thead>
                          <tbody>
                            {data.clients
                              .filter((x) => !x.personal)
                              .map((x) => {
                                const clientLogs = data.logs
                                  .filter((l) => l.client === x.id)
                                  .sort((a, b) => a.date.localeCompare(b.date));
                                const clientWorkouts = data.workouts.filter(
                                  (w) =>
                                    w.client === x.id &&
                                    w.date >= shiftDate(today, -6),
                                );
                                const last = clientLogs.at(-1);
                                const checkin = clientLogs
                                  .filter((l) => l.data.checkin)
                                  .at(-1);
                                const expected = Math.min(
                                  7,
                                  x.plan.filter((d) => d.exercises.length > 0)
                                    .length,
                                );
                                const missed = Math.max(
                                  0,
                                  expected - clientWorkouts.length,
                                );
                                const recentWeights = clientLogs.filter(
                                  (l) =>
                                    l.date >= shiftDate(today, -20) &&
                                    l.data.weight != null,
                                );
                                const stalled =
                                  recentWeights.length >= 4 &&
                                  Math.abs(
                                    Number(recentWeights.at(-1)?.data.weight) -
                                      Number(recentWeights[0]?.data.weight),
                                  ) < 0.15;
                                const flags: string[] = [];
                                if (!last || last.date < shiftDate(today, -6))
                                  flags.push("No recent log");
                                if (expected > 0 && missed >= 1)
                                  flags.push(
                                    `${missed} workout${missed === 1 ? "" : "s"} missed`,
                                  );
                                if (
                                  !checkin ||
                                  checkin.date < shiftDate(today, -7)
                                )
                                  flags.push("Check-in due");
                                if (stalled) flags.push("Weight trend stalled");
                                const hasMilestone =
                                  data.progressMilestones.some(
                                    (m: any) => m.client === x.id,
                                  );
                                return (
                                  <tr key={x.id}>
                                    <td>
                                      <button
                                        className="text-btn"
                                        onClick={() => {
                                          switchClient(x.id);
                                          setTab("Home");
                                        }}
                                      >
                                        {x.name}
                                      </button>
                                    </td>
                                    <td>{last?.date || "No logs yet"}</td>
                                    <td>{checkin?.date || "Due"}</td>
                                    <td>
                                      {flags.length ? (
                                        flags.map((f) => <Tag key={f}>{f}</Tag>)
                                      ) : (
                                        <Tag kind="green">On track</Tag>
                                      )}
                                      {hasMilestone && (
                                        <Tag kind="green">Milestone</Tag>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                          </tbody>
                        </table>
                      </ResponsiveTable>
                      <div className="row wrap">
                        <Button
                          onClick={async () => {
                            const t = data.templates.at(-1);
                            if (!t) {
                              notify("Save a program template first.");
                              return;
                            }
                            if (
                              !confirm(
                                `Assign “${t.name}” to all clients? This replaces their current plans.`,
                              )
                            )
                              return;
                            for (const x of data.clients.filter(
                              (x) => !x.personal,
                            )) {
                              const r = await fetch("/api/data", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  action: "plan",
                                  client: x.id,
                                  value: structuredClone(t.plan),
                                  version: x.version,
                                }),
                              });
                              if (!r.ok) {
                                notify(`Could not assign to ${x.name}.`);
                                return;
                              }
                            }
                            await refresh(c.id);
                            notify(
                              `Template assigned to ${data.clients.filter((x) => !x.personal).length} clients.`,
                            );
                          }}
                        >
                          <Copy size={15} />
                          Bulk assign latest template
                        </Button>
                        <Button onClick={shareProgress}>
                          <Download size={15} />
                          Share progress PDF
                        </Button>
                      </div>
                    </section>
                    <HealthScreenshotPanel key={c.id} clientId={c.id} date={calorieDay} preview={isPreview} onSaved={healthCaptureSaved} />
                    <div className="toolbar">
                      <label className="search">
                        <Search size={17} />
                        <input
                          placeholder="Search your clients…"
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                        />
                      </label>
                      <span className="muted tiny">
                        {data.clients.filter((x) => !x.personal).length} clients
                        ·{" "}
                        {data.clients.some((x) => x.personal)
                          ? "personal profile set up"
                          : "personal profile optional"}
                      </span>
                    </div>
                    <div className="client-grid">
                      {data.clients
                        .filter((x) =>
                          x.name.toLowerCase().includes(search.toLowerCase()),
                        )
                        .map((x, i) => (
                          <button
                            className={
                              "client-card " + (x.id === c.id ? "selected" : "")
                            }
                            key={x.id}
                            onClick={() => {
                              switchClient(x.id);
                              setTab("Home");
                            }}
                          >
                            <div className="row between">
                              <div className={"avatar large tone" + (i % 3)}>
                                {initials(x.name)}
                              </div>
                              <Tag kind={x.demo ? "" : "green"}>
                                {x.personal
                                  ? "Your profile"
                                  : x.demo
                                    ? "Example"
                                    : x.member
                                      ? "Connected"
                                      : "Awaiting connection"}
                              </Tag>
                            </div>
                            <h2>{x.name}</h2>
                            <p>{x.targets.goal || "Set a first goal"}</p>
                            <div className="client-card-stats">
                              <span>
                                <b>{fmt(x.targets.calories)}</b>kcal target
                              </span>
                              <span>
                                <b>
                                  {
                                    x.plan.filter((d) => d.exercises.length)
                                      .length
                                  }
                                </b>
                                training days
                              </span>
                            </div>
                            <div className="card-bottom">
                              Open client workspace <ArrowUpRight size={18} />
                            </div>
                          </button>
                        ))}
                    </div>
                    <section className="panel">
                      <PanelHead
                        title={"Private coach note · " + c.name}
                        sub="Private to you; synced across your devices."
                      />
                      <textarea
                        className="field"
                        rows={3}
                        key={c.id + ":" + (data.coachNote || "")}
                        defaultValue={data.coachNote || ""}
                        placeholder="Check-in context, preferences, or reminders"
                        onBlur={(e) => {
                          if (e.target.value !== (data.coachNote || ""))
                            mutate("coachNote", { note: e.target.value }, true);
                        }}
                      />
                    </section>
                    <section className="panel slim">
                      <div>
                        <h3>Use Form for your own training too.</h3>
                        <p>
                          Create a private personal profile to use the same
                          Training, Calories, Strain, Progress, Metrics, and
                          Connections features as a client. You do not need to
                          add a coach.
                        </p>
                      </div>
                      {!data.clients.some((x) => x.personal) && (
                        <Button
                          onClick={() => {
                            setDraft({
                              name:
                                (data.email || "").split("@")[0] ||
                                "My training profile",
                            });
                            setModal("personalProfile");
                          }}
                        >
                          <Plus size={15} />
                          Create my profile
                        </Button>
                      )}
                    </section>
                    <section className="panel slim">
                      <div>
                        <h3>Built for more than one approach.</h3>
                        <p>
                          Start from scratch or duplicate a program. Every
                          client’s copy stays independent.
                        </p>
                      </div>
                      <Button
                        onClick={() => {
                          setDraft({ name: "", email: "", sample: true });
                          setModal("client");
                        }}
                      >
                        Use a program template <ArrowRight size={15} />
                      </Button>
                    </section>
                  </>
                )}
                {tab === "Create workout" && (
                  <WorkoutBuilder
                    key={c.id + ":" + (editingWorkout?.id || "new")}
                    profileKey={data.uid + ":" + c.id}
                    clientId={isPreview?undefined:c.id}
                    initial={
                      editingWorkout && !editingWorkout.legacy
                        ? data.workoutTemplates.find(
                            (t) => t.id === editingWorkout.id,
                          ) || editingWorkout
                        : editingWorkout
                    }
                    customExercises={savedTemplates.flatMap((t) => t.exercises)}
                    onSave={async (value) =>
                      mutate(
                        "workoutTemplate",
                        { value, version: value.version },
                        true,
                      )
                    }
                    onStart={launchWorkout}
                  />
                )}
                {["Exercise library", "Training tools"].includes(tab) && (
                  <FeaturePages
                    key={c.id}
                    tab={tab}
                    client={c}
                    plan={c.plan}
                    workouts={workouts}
                    onSavePlan={savePlan}
                    onStart={(i: number) => {
                      setDay(i);
                      startSession(i);
                    }}
                    notify={notify}
                  />
                )}
                {tab === "Training" && scheduleMode === "fixed" && (
                  <SavedWorkouts
                    rotation={false}
                    onRotationChange={(enabled) =>
                      mutate(
                        "scheduleMode",
                        {
                          mode: enabled ? "rolling" : "flexible",
                          version: c.version,
                        },
                        true,
                      )
                    }
                    history={workouts}
                    templates={data.workoutTemplates}
                    preview={isPreview}
                    viewKey={data.uid+":"+c.id+":workouts"}
                    onStart={launchWorkout}
                    onCreate={() => {
                      setEditingWorkout(null);
                      setTab("Create workout");
                    }}
                    onEdit={(t) => {
                      setEditingWorkout(t);
                      setTab("Create workout");
                    }}
                    onDelete={(id) =>
                      mutate("deleteWorkoutTemplate", { id }, true)
                    }
                  />
                )}
                {tab === "Cardio" && (
                  <CardioTracker selectedDate={calorieDay} onDateChange={setCalorieDate}
                    key={c.id}
                    client={c}
                    preview={isPreview}
                    notify={notify}
                  />
                )}
                {tab === "Recipes & meals" && (
                  <MealPlanner
                    key={c.id}
                    client={c}
                    date={calorieDay}
                    preview={isPreview}
                    notify={notify}
                    onLog={async (r: any, n: number) =>
                      mutate(
                        "meal",
                        {
                          value: {
                            id: crypto.randomUUID(),
                            date: calorieDay,
                            name: r.name,
                            category: "Uncategorized",
                            calories: Math.round(r.calories * n),
                            protein: Number((r.protein * n).toFixed(1)),
                            carbs: Number((r.carbs * n).toFixed(1)),
                            fat: Number((r.fat * n).toFixed(1)),
                            notes: `${n} serving${n === 1 ? "" : "s"}`,
                            recipeSnapshot:recipeLogSnapshot(r),
                          },
                        },
                        true,
                      )
                    }
                  />
                )}
                {tab === "Workout from video" && (
                  <VideoWorkoutBuilder
                    onSaveWorkout={async (value) =>
                      mutate("workoutTemplate", { value }, true)
                    }
                    key={c.id}
                    client={c}
                    plan={c.plan}
                    onSavePlan={savePlan}
                    notify={notify}
                    preview={isPreview}
                  />
                )}
                {tab === "Training" && (
                  <details className="panel schedule-mode-panel compact-settings">
                    <summary>
                      <span>
                        <b>Workout schedule</b>
                        <small>
                          {scheduleMode === "fixed"
                            ? "Fixed weekly routine"
                            : scheduleMode === "rolling"
                              ? "Rolling workout rotation"
                              : "Flexible · choose when ready"}
                        </small>
                      </span>
                      <ChevronDown size={18} />
                    </summary>
                    <div className="compact-settings-body">
                      <p className="muted tiny">
                        Flexible lets you choose any saved workout when you’re
                        ready. Fixed assigns workouts to weekdays.
                      </p>
                      <label className="field">
                        <span>Schedule style</span>
                        <select
                          value={scheduleMode}
                          onChange={(e) =>
                            mutate(
                              "scheduleMode",
                              { mode: e.target.value, version: c.version },
                              true,
                            )
                          }
                        >
                          <option value="flexible">
                            Flexible · choose when ready
                          </option>
                          <option value="fixed">Fixed weekly routine</option>
                          <option value="rolling">
                            Rolling workout rotation
                          </option>
                        </select>
                      </label>
                    </div>
                  </details>
                )}
                {tab === "Training" && scheduleMode !== "fixed" ? (
                  <>
                    <details className="panel">
                      <summary>Existing weekly program templates</summary>
                      <p>
                        Old program templates are preserved. Applying one fills
                        the program’s saved workouts; it does not require you to
                        train on those weekdays in flexible mode.
                      </p>
                      <Button onClick={() => setModal("applyTemplate")}>
                        Browse program templates
                      </Button>
                    </details>
                    <SavedWorkouts
                      rotation={scheduleMode === "rolling"}
                      onRotationChange={(enabled) =>
                        mutate(
                          "scheduleMode",
                          {
                            mode: enabled ? "rolling" : "flexible",
                            version: c.version,
                          },
                          true,
                        )
                      }
                      history={workouts}
                      templates={savedTemplates}
                      preview={isPreview}
                      viewKey={data.uid+":"+c.id+":workouts"}
                      onStart={launchWorkout}
                      onCreate={() => {
                        setEditingWorkout(null);
                        setTab("Create workout");
                      }}
                      onEdit={(t) => {
                        setEditingWorkout(t);
                        setTab("Create workout");
                      }}
                      onDelete={(id) =>
                        mutate("deleteWorkoutTemplate", { id }, true)
                      }
                    />
                  </>
                ) : tab === "Training" && experienceMode === "casual" ? (
                  <>
                    {heading(
                      "Your workout.",
                      `${c.name} · ${c.plan[day].day}`,
                      <Button
                        kind="primary"
                        disabled={!c.plan[day].exercises.length}
                        onClick={() => startSession()}
                      >
                        <Play size={15} />
                        Start today's workout
                      </Button>,
                    )}
                    <section className="panel casual-training-plan">
                      <PanelHead
                        title={c.plan[day].name}
                        sub={
                          c.plan[day].exercises.filter((e) => !e.optional)
                            .length + " exercises planned"
                        }
                      />
                      {c.plan[day].exercises.filter((e) => !e.optional)
                        .length ? (
                        <div className="casual-exercises">
                          {c.plan[day].exercises
                            .filter((e) => !e.optional)
                            .map((e, i) => (
                              <div key={e.id + i}>
                                <span>{String(i + 1).padStart(2, "0")}</span>
                                <b>{e.name}</b>
                                <small>
                                  {e.sets} × {e.min}–{e.max}
                                </small>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <div className="casual-rest">
                          <Moon size={22} />
                          <b>Rest day</b>
                          <p>
                            Take it easy and come back fresh for your next
                            session.
                          </p>
                        </div>
                      )}
                      <Button
                        kind="primary full"
                        disabled={!c.plan[day].exercises.length}
                        onClick={() => startSession()}
                      >
                        <Play size={15} />
                        Start workout
                      </Button>
                    </section>
                  </>
                ) : (
                  tab === "Training" && (
                    <>
                      {heading(
                        "Weekly plan",
                        `${c.name} · ${c.plan.filter((d) => d.exercises.length).length} training days per week`,
                        <>
                          {canEdit && (
                            <Button
                              onClick={() => {
                                setDraft({
                                  name: c.plan[day].name + " program",
                                });
                                setModal("template");
                              }}
                            >
                              <BookOpen size={16} />
                              Save template
                            </Button>
                          )}
                          <Button
                            kind="primary"
                            disabled={!c.plan[day].exercises.length}
                            onClick={() => startSession()}
                          >
                            <Play size={15} />
                            Start session
                          </Button>
                        </>,
                      )}
                      <div className="week-strip">
                        {c.plan.map((d, i) => (
                          <button
                            key={d.day}
                            className={day === i ? "selected" : ""}
                            onClick={() => setDay(i)}
                          >
                            <span>{d.day.slice(0, 3)}</span>
                            <b>{d.name}</b>
                            <small>
                              {d.exercises.length
                                ? d.exercises.filter((e) => !e.optional)
                                    .length + " exercises"
                                : "Recovery day"}
                            </small>
                          </button>
                        ))}
                      </div>
                      <div className="panel">
                        <PanelHead
                          title={c.plan[day].name}
                          sub="Working sets · progression tracked separately for each exercise"
                          right={
                            canEdit && (
                              <Button
                                onClick={() => {
                                  setDraft({ day, name: c.plan[day].name });
                                  setModal("day");
                                }}
                              >
                                <Settings2 size={15} />
                                Edit day
                              </Button>
                            )
                          }
                        />
                        {!c.plan[day].exercises.length ? (
                          <Empty
                            title="Space to recover"
                            text="Rest is part of the plan. Add exercises if this is a training day."
                          />
                        ) : (
                          <ResponsiveTable>
                            <table>
                              <thead>
                                <tr>
                                  <th>EXERCISE</th>
                                  <th>MUSCLE</th>
                                  <th>SETS × REPS</th>
                                  <th>PROGRESSION</th>
                                  <th>FORM VIDEO</th>
                                  <th />
                                </tr>
                              </thead>
                              <tbody>
                                {c.plan[day].exercises.map((e, i) => {
                                  const p = progression(
                                    workouts,
                                    e.id,
                                    e.max,
                                    e.sets,
                                    e.unilateral,
                                    progressionRule(featureRecords,e),
                                  );
                                  const latest = newestWorkouts.find((w) =>
                                    w.sets?.some(
                                      (x: any) =>
                                        x.exerciseId === e.id &&
                                        (e.unilateral === undefined || !!x.unilateral === e.unilateral) &&
                                        x.completed &&
                                        !x.warmup,
                                    ),
                                  );
                                  const recentSets = (
                                    latest?.sets || []
                                  ).filter(
                                    (x: any) =>
                                      x.exerciseId === e.id &&
                                      (e.unilateral === undefined || !!x.unilateral === e.unilateral) &&
                                      x.completed &&
                                      !x.warmup,
                                  );
                                  const lastLoad = Number(
                                    recentSets[0]?.weight || 0,
                                  );
                                  const bestReps = recentSets.length
                                    ? Math.max(
                                        ...recentSets.map((x: any) =>
                                          Number(x.reps || 0),
                                        ),
                                      )
                                    : 0;
                                  const increaseLoad =
                                    p.ready &&
                                    lastLoad > 0 &&
                                    e.equipment !== "banded";
                                  const proposed = {
                                    weight: increaseLoad
                                      ? Number(
                                          (
                                            lastLoad +
                                            (progressionRule(featureRecords,e)?.loadJump??Math.max(0.5, lastLoad * 0.025))
                                          ).toFixed(1),
                                        )
                                      : lastLoad,
                                    reps: increaseLoad
                                      ? e.min
                                      : Math.min(
                                          e.max,
                                          Math.max(e.min, bestReps + 1),
                                        ),
                                  };
                                  const approved =
                                    approvedProgressions[c.id + ":" + e.id];
                                  return (
                                    <tr key={e.id + i}>
                                      <td>
                                        <div className="exercise-cell">
                                          <span className="exercise-number">
                                            {String(i + 1).padStart(2, "0")}
                                          </span>
                                          <div>
                                            <b>{e.name}</b>
                                            <small>
                                              {e.note ||
                                                "Controlled reps. Consistent technique."}
                                              {e.optional ? " · Optional" : ""}
                                            </small>
                                          </div>
                                        </div>
                                      </td>
                                      <td>
                                        <Tag>{e.muscle}</Tag>
                                      </td>
                                      <td>
                                        {e.sets} × {e.min}–{e.max}
                                      </td>
                                      <td>
                                        {recentSets.length ? (
                                          <>
                                            <span
                                              className={
                                                p.ready ? "green-text" : "muted"
                                              }
                                            >
                                              {approved
                                                ? "Coach approved"
                                                : increaseLoad
                                                  ? "Suggested next load"
                                                  : "Suggested next reps"}
                                              :{" "}
                                              {approved
                                                ? `${approved.weight} kg × ${approved.reps}`
                                                : `${proposed.weight} kg × ${proposed.reps}`}{" "}
                                              · {p.count}/{progressionRule(featureRecords,e)?.repeatSessions??3} top-rep sessions
                                            </span>
                                            {canEdit && !approved && (
                                              <button
                                                className="text-btn"
                                                onClick={() =>
                                                  mutate(
                                                    "approveProgression",
                                                    {
                                                      exerciseId: e.id,
                                                      ...proposed,
                                                    },
                                                    true,
                                                  )
                                                }
                                              >
                                                Approve for next session
                                              </button>
                                            )}
                                            {canEdit && approved && (
                                              <button
                                                className="text-btn"
                                                onClick={() =>
                                                  mutate(
                                                    "clearProgression",
                                                    { exerciseId: e.id },
                                                    true,
                                                  )
                                                }
                                              >
                                                Clear approval
                                              </button>
                                            )}
                                          </>
                                        ) : (
                                          <span className="muted">
                                            Log a session to get a suggestion
                                          </span>
                                        )}
                                      </td>
                                      <td>
                                        <button
                                          className="text-btn"
                                          onClick={() => {
                                            setVideoExercise(e);
                                            setVideoDate(calorieDay);
                                            setVideoFile(null);
                                            setModal("exerciseVideos");
                                          }}
                                        >
                                          <Video size={14} />
                                          {data.exerciseVideos.filter(
                                            (v) =>
                                              v.client === c.id &&
                                              v.exercise_id === e.id,
                                          ).length
                                            ? data.exerciseVideos.filter(
                                                (v) =>
                                                  v.client === c.id &&
                                                  v.exercise_id === e.id,
                                              ).length + " clips"
                                            : "Add / compare"}
                                        </button>
                                      </td>
                                      <td>
                                        {canEdit && (
                                          <button
                                            className="icon"
                                            aria-label={"Edit " + e.name}
                                            onClick={() => {
                                              setDraft({ ...e, index: i });
                                              setModal("exercise");
                                            }}
                                          >
                                            <SlidersHorizontal size={16} />
                                          </button>
                                        )}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </ResponsiveTable>
                        )}
                        {canEdit && (
                          <div className="panel-footer row">
                            <Button
                              onClick={() => {
                                setDraft({
                                  id: crypto.randomUUID(),
                                  name: "",
                                  muscle: "Quads",
                                  sets: 2,
                                  min: 6,
                                  max: 12,
                                  note: "",
                                  optional: false,
                                  equipment: "free-weight",
                                  gymPin: false,
                                  index: -1,
                                });
                                setModal("exercise");
                              }}
                            >
                              <Plus size={16} />
                              Add exercise
                            </Button>
                            <Button onClick={() => setModal("applyTemplate")}>
                              Apply a template
                            </Button>
                          </div>
                        )}
                      </div>
                      <StrengthContext
                        key={c.id}
                        workouts={workouts}
                        clientWeight={c.targets.startWeight || 75}
                      />
                      <div className="two-col">
                        <section className="panel">
                          <PanelHead title="Progression, without the guesswork" />
                          <div className="progression-steps">
                            {[
                              "Start near 6 reps",
                              "Build to 12",
                              "Repeat 12 twice",
                              "Increase the load",
                            ].map((t, i) => (
                              <div key={t}>
                                <span>{i + 1}</span>
                                <b>{t}</b>
                              </div>
                            ))}
                          </div>
                          <p className="muted">
                            A load increase is suggested after all prescribed
                            sets qualify in three successive logged sessions at
                            the same weight. Rep caps and technical failure are
                            recorded separately.
                          </p>
                        </section>
                        <section className="panel">
                          <PanelHead
                            title="Completed sessions"
                            sub="Saved snapshots stay unchanged when you edit the plan"
                          />
                          {workouts.length ? (
                            workouts
                              .slice(-5)
                              .reverse()
                              .map((w) => (
                                <div className="history-row" key={w.id}>
                                  <Dumbbell size={17} />
                                  <div>
                                    <b>{w.name}</b>
                                    <small>
                                      {w.date} ·{" "}
                                      {w.sets.filter((s) => s.completed).length}{" "}
                                      sets
                                    </small>
                                  </div>
                                  <Tag kind="green">Logged</Tag>
                                </div>
                              ))
                          ) : (
                            <p className="muted">
                              Finish your first workout to start building a
                              history.
                            </p>
                          )}
                        </section>
                      </div>
                    </>
                  )
                )}
                {tab === "Calorie calculator" && (
                  <>
                    {heading(
                      "Plan your calorie target.",
                      "Estimate a daily calorie and macro target from the amount to lose and the date you want to reach it.",
                    )}
                    <CalorieMacroCalculator
                      key={c.id + ":" + c.version}
                      initialTargets={c.targets}
                      clientName={c.name}
                      startWeight={
                        weights.at(-1)?.data.weight ||
                        c.targets.startWeight ||
                        0
                      }
                      maintenance={
                        maintenanceTrend.maintenance ||
                        c.targets.maintenance ||
                        2800
                      }
                      today={today}
                      goalDate={c.targets.goalDate}
                      readOnly={isPreview}
                      onApply={(values) =>
                        mutate("targets", {
                          value: { ...c.targets, ...values },
                          version: c.version,
                        })
                      }
                    />
                  </>
                )}
                {tab === "Calories" && (
                  <>
                    {heading(
                      "Food diary",
                      `${c.name} · ${new Date(calorieDay + "T12:00:00").toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long" })}`,
                      <div className="diary-date-nav">
                        <button
                          className="icon"
                          aria-label="Previous day"
                          onClick={() =>
                            setCalorieDate(shiftDate(calorieDay, -1))
                          }
                        >
                          <ChevronLeft size={19} />
                        </button>
                        <label className="diary-date-picker"><CalendarDays size={15}/><span>
                          {calorieDay === today
                            ? "Today"
                            : new Date(
                                calorieDay + "T12:00:00",
                              ).toLocaleDateString("en-AU", {
                                day: "numeric",
                                month: "short",
                              })}
                        </span><input type="date" aria-label="Food diary date" value={calorieDay} max={today} onChange={(event) => { if (event.target.value) setCalorieDate(event.target.value); }}/></label>
                        <button
                          className="icon"
                          aria-label="Next day"
                          disabled={calorieDay >= today}
                          onClick={() =>
                            setCalorieDate(
                              calorieDay < today
                                ? shiftDate(calorieDay, 1)
                                : today,
                            )
                          }
                        >
                          <ChevronRight size={19} />
                        </button>
                      </div>,
                    )}
                    <section className="diary-actions" aria-label="Quick food diary actions">
                      <div className="diary-primary-actions">
                        <button className="btn primary" type="button" onClick={() => { setFoodQuery(""); setFoodResults([]); setModal("foodSearch"); }}><Plus size={19}/>Add food</button>
                        <button className="btn" type="button" onClick={() => openFoodScan(true)}><ScanLine size={19}/>Scan barcode</button>
                      </div><details className="food-tools-disclosure"><summary>Meals, recipes & more food tools</summary><div className="diary-primary-actions">
                        <button className="btn" type="button" onClick={()=>{setDraft({kind:"meal"});setModal("foodBuilder");}}><Plus size={17}/>Create meal</button>
                        <button className="btn" type="button" onClick={()=>{setDraft({kind:"recipe"});setModal("foodBuilder");}}><Plus size={17}/>Create recipe</button>
                      </div>
                      <div className="diary-secondary-actions">
                        <button type="button" className="text-btn" onClick={() => setModal("supermarket")}><Utensils size={16}/>Supermarket budget meals</button>
                        <button type="button" className="text-btn" onClick={() => setModal("fastFood")}><Utensils size={16}/>I want fast food</button>
                        <button type="button" className="text-btn" onClick={() => setModal("foodEstimate")}><Sparkles size={16}/>Describe food · AI</button>
                        <button type="button" className="text-btn" onClick={() => setModal("dailyNutrients")}><PieChart size={16}/>Daily nutrients</button>
                        <button type="button" className="text-btn" onClick={()=>setModal("mealGroups")}>Manage meal groups</button>
                        <button type="button" className="text-btn" onClick={()=>openTools("Calories")}>All nutrition tools</button>
                        <button type="button" className="text-btn" aria-expanded={quickMenuOpen} aria-controls="diary-logging-tools" onClick={() => setQuickMenuOpen(value => !value)}><MoreHorizontal size={17}/>Diary tools</button>
                      </div>
                      </details>
                    </section>
                    {quickMenuOpen && <section className="panel food-log-hub" id="diary-logging-tools" aria-label="Logging tools"><div className="row between"><div><h2>What do you want to log?</h2><p className="tiny muted">All logging tools now live with your food diary.</p></div><button className="icon" aria-label="Close logging tools" onClick={()=>setQuickMenuOpen(false)}><X size={18}/></button></div><div className="food-log-grid"><button disabled={!recentMeal || isPreview} onClick={() => { if (recentMeal) void mutate("meal", {value: {...recentMeal.data, id: crypto.randomUUID(), date: calorieDay}}, true); }}><RefreshCw size={18}/><span><b>Repeat last food</b><small>{recentMeal?.data.name || "No recent food"}</small></span></button><button onClick={() => { setQuickMenuOpen(false);openTools("Calories");setTimeout(()=>{const tool=document.querySelector<HTMLDetailsElement>(".food-reuse-tools");if(tool){tool.open=true;tool.scrollIntoView({behavior:"auto",block:"start"})}},100) }}><Copy size={18}/><span><b>Copy a day</b><small>Reuse logged meals</small></span></button><button onClick={() => { setDraft({...c.targets});setModal("targets"); }}><Target size={18}/><span><b>Edit targets</b><small>Calories, macros & water</small></span></button><button onClick={() => { setQuickMenuOpen(false); setModal("foodSearch"); }}><Apple size={18}/><span><b>Add food</b><small>Search the database</small></span></button><button onClick={() => { setQuickMenuOpen(false); setTab("Training"); }}><Dumbbell size={18}/><span><b>Add exercise</b><small>Open training</small></span></button><button onClick={() => { setQuickMenuOpen(false); openLog(calorieDay); }}><HeartPulse size={18}/><span><b>Add biometric</b><small>Weight, steps and more</small></span></button><button onClick={() => { setQuickMenuOpen(false); setDraft({notes: calorieLog?.data.notes || ""}); setModal("diaryNote"); }}><FileText size={18}/><span><b>Add note</b><small>Save a diary note</small></span></button><button onClick={() => { setQuickMenuOpen(false); openFoodScan(true); }}><ScanLine size={18}/><span><b>Scan barcode</b><small>Use the camera</small></span></button><button onClick={() => { setQuickMenuOpen(false); setModal("photo"); }}><Camera size={18}/><span><b>Progress photo</b><small>Save a progress picture</small></span></button></div></section>}
                    <NutritionCarousel
                      totals={calorieTotals}
                      targets={calorieTargets}
                      expenditure={calorieExpenditure}
                      energySource={energyModel.source === "device" ? `Source: ${expenditureReading?.source} · reviewed daily burn` : energyModel.source === "observed" ? "Source: recent intake and weight trend" : energyModel.source === "profile" ? "Source: profile maintenance setting" : energyModel.source === "formula" ? "Source: body-composition formula plus logged activity" : "No expenditure data"}
                      nutrients={summarizeMealNutrition(todayMeals.map((meal) => meal.data)).nutrients}
                      onTargets={() => { setDraft({...c.targets}); setModal("targets"); }}
                      onNutrients={() => setModal("dailyNutrients")}
                    />
                    <WaterTracker
                      clientId={c.id}
                      date={calorieDay}
                      log={calorieLog}
                      goalLitres={c.targets.water ?? 2.5}
                      disabled={isPreview}
                      onSaved={(log) => {
                        if (log) setData((current) => ({...current, logs: [...current.logs.filter((entry) => entry.id !== log.id), log].sort((a, b) => a.date.localeCompare(b.date))}));
                        else void refresh(c.id).catch((error) => notify(error.message));
                      }}
                      onEditGoal={() => { setDraft({...c.targets}); setModal("targets"); }}
                    />
                    {!!calorieLog?.data.notes && <section className="panel diary-note-card">
                      <div className="row between"><h3><FileText size={17}/>Diary note</h3><button type="button" className="text-btn" onClick={() => { setDraft({notes: calorieLog.data.notes}); setModal("diaryNote"); }}>Edit note</button></div>
                      <p>{calorieLog.data.notes}</p>
                    </section>}
                    {lastRemovedMeal && <div className="notice diary-undo" role="status"><span>Removed {lastRemovedMeal.data.name}</span><Button onClick={async () => {if(await mutate("meal", {value:lastRemovedMeal.data}, true))setLastRemovedMeal(null);}}>Undo</Button></div>}
                    <div className="meal-sections">
                      {foodGroups.map((category) => {
                        const meals = data.meals.filter(
                          (m) =>
                            m.client === c?.id &&
                            m.date === calorieDay &&
                            (foodGroups.includes(m.data.category)
                              ? m.data.category
                              : "Uncategorized") === category,
                        );
                        const opened = !!mealSections[category];
                        const groupNutrition = summarizeMealNutrition(meals.map((m) => m.data));
                        return (
                          <section
                            className={"meal-section " + (opened ? "open" : "")}
                            key={category}
                          >
                            <div className="meal-section-head">
                              <button
                                className="meal-section-toggle"
                                aria-expanded={opened}
                                aria-controls={"meal-group-" + foodGroups.indexOf(category)}
                                onClick={() =>
                                  setMealSections((v) => ({
                                    ...v,
                                    [category]: !v[category],
                                  }))
                                }
                              >
                                <ChevronDown
                                  size={18}
                                  className="meal-chevron"
                                />
                                <span className="meal-section-title">
                                  <b>{category}</b>
                                  <small>{meals.length ? `${fmt(groupNutrition.calories)} kcal · ${fmt(groupNutrition.protein)}P · ${fmt(groupNutrition.carbs)}C · ${fmt(groupNutrition.fat)}F` : "No food logged"}</small>
                                </span>
                              </button>
                              {!isPreview && (
                                <button
                                  className="icon"
                                  aria-label={"Add " + category}
                                  onClick={() => {
                                    setDraft({
                                      id: crypto.randomUUID(),
                                      date: calorieDay,
                                      name: "",
                                      category,
                                      calories: 0,
                                      protein: 0,
                                      carbs: 0,
                                      fat: 0,
                                      notes: "",
                                    });
                                    setFoodQuery("");
                                    setModal("foodSearch");
                                  }}
                                >
                                  <Plus size={18} />
                                </button>
                              )}
                              <button className="icon meal-nutrition-button" aria-label={`View ${category} nutrition`} disabled={!meals.length} onClick={()=>{setMealSummaryGroup(category);setModal("mealSummary")}}><PieChart size={18}/></button>
                            </div>
                            <div id={"meal-group-" + foodGroups.indexOf(category)} className={"meal-content-motion " + (opened ? "expanded" : "")} aria-hidden={!opened} inert={!opened}>
                              <div className="meal-section-content">
                                {meals.length ? (
                                  meals.map((m) => (
                                    <div className="meal-item" key={m.id}>
                                      <span className="meal-dot">
                                        <Utensils size={16} />
                                      </span>
                                      <button type="button" className="meal-item-main" aria-label={"Edit " + m.data.name} onClick={() => {setDraft({...m.data});setModal("meal");}}>
                                        <h4>{m.data.name}</h4>
                                        <p>
                                          {m.data.time && <small>{m.data.time} · </small>}
                                          {m.data.nutrition && (
                                            <>
                                              {m.data.nutrition.amount}{" "}
                                              {m.data.nutrition.unit}
                                            </>
                                          )}
                                          {m.data.nutrition?.reference
                                            ?.source && (
                                            <small>
                                              {" "}
                                              ·{" "}
                                              {
                                                m.data.nutrition.reference
                                                  .source
                                              }
                                            </small>
                                          )}
                                        </p>
                                      </button>
                                      <div className="meal-item-energy"><b>{fmt(m.data.calories)}</b><small>kcal</small></div>
                                      {!isPreview && (
                                        <div className="actions">
                                          <button
                                            className="icon"
                                            aria-label="Delete meal"
                                            onClick={() => {
                                              if (confirm("Remove this meal?"))
                                                mutate(
                                                  "deleteMeal",
                                                  { id: m.id },
                                                  true,
                                                );
                                            }}
                                          >
                                            <Trash2 size={15} />
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  ))
                                ) : (
                                  <p className="meal-empty">
                                    No food logged in this section.
                                  </p>
                                )}
                              </div>
                            </div>
                          </section>
                        );
                      })}
                    </div>
                    <details className="optional-tool saved-meals-disclosure"><summary><span><b>Saved meals & recipes</b><small>Reuse a favourite meal</small></span><ChevronDown size={18}/></summary>
                    <section className="panel saved-meals">
                      <div className="row between wrap">
                        <div>
                          <PanelHead
                            title="Saved meals & recipes"
                            sub="Reuse a meal without re-entering its macros"
                          />
                        </div>
                        {!isPreview && (
                          <Button
                            onClick={() => {
                              setDraft({
                                id: crypto.randomUUID(),
                                date: calorieDay,
                                name: "",
                                category: preferredMealGroup(foodGroups),
                                calories: 0,
                                protein: 0,
                                carbs: 0,
                                fat: 0,
                                notes: "",
                                saveForLater: true,
                              });
                              setModal("meal");
                            }}
                          >
                            <Plus size={15} />
                            Save a meal
                          </Button>
                        )}
                      </div>
                      {data.savedMeals.length ? (
                        <div className="saved-meal-list">
                          {data.savedMeals.map((m: any) => (
                            <div className="saved-meal" key={m.id}>
                              <div>
                                <b>{m.name}</b>
                                {m.nutrition?.composition&&<small>{m.nutrition.composition.kind} · {m.nutrition.composition.servings} servings</small>}
                                <small>
                                  {fmt(m.calories)} kcal · P {fmt(m.protein)} /
                                  C {fmt(m.carbs)} / F {fmt(m.fat)} g
                                </small>
                              </div>
                              <div className="row">
                                {m.nutrition?.composition&&<Button onClick={()=>{setDraft({kind:m.nutrition.composition.kind,initial:m});setModal("foodBuilder");}}>Edit</Button>}
                                <Button
                                  onClick={() =>
                                    mutate("meal", {
                                      value: {
                                        id: crypto.randomUUID(),
                                        date: calorieDay,
                                        name: m.name,
                                        category: preferredMealGroup(foodGroups,m.category),
                                        calories: m.calories,
                                        protein: m.protein,
                                        carbs: m.carbs,
                                        fat: m.fat,
                                        notes: m.notes || "",
                                        nutrition: m.nutrition || undefined,
                                      },
                                    })
                                  }
                                >
                                  Add today
                                </Button>
                                {!isPreview && (
                                  <button
                                    className="icon"
                                    aria-label="Delete saved meal"
                                    onClick={() =>
                                      mutate(
                                        "deleteSavedMeal",
                                        { id: m.id },
                                        true,
                                      )
                                    }
                                  >
                                    <Trash2 size={15} />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="muted tiny">
                          Save a meal from the form below to build your personal
                          reusable list.
                        </p>
                      )}
                    </section>
                    </details>
                  </>
                )}
                {tab === "Import" && (
                  <>
                    {heading(
                      "Bring your history with you.",
                      "Choose what you are importing, select the app, then choose its export file.",
                      <></>,
                    )}
                    <section className="panel simple-history-import">
                      <div className="import-kind" aria-label="Import type">
                        {(["workouts", "nutrition"] as const).map((kind) => (
                          <button
                            key={kind}
                            className={historyKind === kind ? "selected" : ""}
                            onClick={() => {
                              setHistoryKind(kind);
                              setHistoryPreset("");
                              setHistoryPreview(null);
                              setHistoryError("");
                              setHistorySuccess("");
                            }}
                          >
                            {kind === "workouts" ? (
                              <><Dumbbell size={18} /> Workouts</>
                            ) : (
                              <><Utensils size={18} /> Food & nutrition</>
                            )}
                          </button>
                        ))}
                      </div>
                      <div className="simple-import-steps">
                        <label className="field">
                          <span>1. Which app is the file from?</span>
                          <select
                            value={historyKind === "workouts" ? workoutSource : foodSource}
                            onChange={(e) => {
                              setHistoryPreset("");
                              if (historyKind === "workouts") setWorkoutSource(e.target.value);
                              else setFoodSource(e.target.value);
                              setHistoryPreview(null);
                              setHistoryError("");
                            }}
                          >
                            {(historyKind === "workouts"
                              ? ["Hevy", "Heavy", "Strong", "Lift Off", "Other workout app"]
                              : ["MyFitnessPal", "Cronometer", "MacroFactor", "Other nutrition app"]
                            ).map((x) => <option key={x}>{x}</option>)}
                          </select>
                        </label>
                        <ImportPresetGuide kind={historyKind} source={historyKind === "workouts" ? workoutSource : foodSource} value={historyPreset} disabled={historyParsing||busy} onChange={id=>{setHistoryPreset(id);setHistoryPreview(null);setHistoryError("");setHistorySuccess("");}}/>
                        <label className="upload simple-import-upload">
                          <Upload size={26} />
                          <b>
                            {(historyKind === "workouts" ? workoutFile : foodFile)?.name ||
                              `2. Choose your ${historyKind === "workouts" ? "workout" : "food"} export file`}
                          </b>
                          <small>CSV, TSV, JSON or text · up to 15 MB</small>
                          <input
                            type="file"
                            accept=".csv,.tsv,.json,.txt,text/csv,text/tab-separated-values,application/json,text/plain"
                            disabled={isPreview || historyParsing || busy}
                            onClick={(e) => {
                              e.currentTarget.value = "";
                            }}
                            onChange={async (e) => {
                              const input = e.currentTarget;
                              const file = input.files?.[0];
                              input.value = "";
                              if (file) await parseHistoryUpload(
                                  file,
                                  historyKind,
                                  historyKind === "workouts" ? workoutSource : foodSource,
                                  historyPreset,
                                );
                            }}
                          />
                        </label>
                      </div>
                      {historyParsing && (
                        <div className="simple-import-status" role="status">
                          <Loader2 className="loading-spinner" size={19} /> Reading your file…
                        </div>
                      )}
                      {!historyParsing && historyPreview && (
                        <div className="simple-import-status ready" role="status">
                          <CheckCircle2 size={19} />
                          <span>
                            <b>
                              {historyPreview.kind === "workouts"
                                ? `${historyPreview.workouts.length} workout session${historyPreview.workouts.length === 1 ? "" : "s"} found`
                                : `${historyPreview.meals.length + historyPreview.daily.length} nutrition record${historyPreview.meals.length + historyPreview.daily.length === 1 ? "" : "s"} found`}
                            </b>
                            <small>Nothing is saved until you press Import.</small>
                          </span>
                        </div>
                      )}
                      {historyError && (
                        <div className="simple-import-error" role="alert">
                          <b>We could not read this file</b>
                          <span>{historyError}</span>
                          <small>Try the original export without opening or editing it first.</small>
                        </div>
                      )}
                      {historySuccess && (
                        <div className="simple-import-status ready" role="status">
                          <CheckCircle2 size={19} /> <b>{historySuccess}</b>
                        </div>
                      )}
                      <Button
                        kind="primary"
                        disabled={!historyPreview || historyParsing || busy || isPreview}
                        onClick={importHistory}
                      >
                        <Upload size={17} />
                        {busy
                          ? "Importing…"
                          : historyPreview
                            ? `Import ${historyPreview.kind === "workouts" ? historyPreview.workouts.length : historyPreview.meals.length + historyPreview.daily.length} ${historyPreview.kind === "workouts" ? "workout session" + (historyPreview.workouts.length === 1 ? "" : "s") : "nutrition record" + (historyPreview.meals.length + historyPreview.daily.length === 1 ? "" : "s")}`
                            : "Choose a file to continue"}
                      </Button>
                    </section>
                    <details className="legacy-import-options">
                      <summary>Separate workout and food upload cards</summary>
                    <div className="import-grid">
                      <section className="panel">
                        <PanelHead
                          title="Workout history"
                          sub="Heavy, Lift Off, or another workout tracker"
                        />
                        <label className="field">
                          <span>Export source</span>
                          <select
                            value={workoutSource}
                            onChange={(e) => setWorkoutSource(e.target.value)}
                          >
                            {[
                              "Heavy",
                              "Lift Off",
                              "Strong",
                              "Hevy",
                              "Other workout app",
                            ].map((x) => (
                              <option key={x}>{x}</option>
                            ))}
                          </select>
                        </label>
                        <label className="upload history-upload">
                          <Upload size={24} />
                          <b>
                            {workoutFile?.name ||
                              "Choose a workout CSV or JSON"}
                          </b>
                          <small>
                            Looks for dates, workout names, exercises, reps,
                            sets, and weights.
                          </small>
                          <input
                            type="file"
                            accept=".csv,.json,text/csv,application/json"
                            disabled={isPreview}
                            onClick={(e) => {
                              e.currentTarget.value = "";
                            }}
                            onChange={(e) => {
                              setHistoryKind("workouts");
                              const f = e.target.files?.[0];
                              e.currentTarget.value = "";
                              if (f)
                                parseHistoryUpload(
                                  f,
                                  "workouts",
                                  workoutSource,
                                );
                            }}
                          />
                        </label>
                        {historyPreview?.kind === "workouts" && (
                          <div className="import-ready" role="status">
                            <div>
                              <CheckCircle2 size={18} />
                              <span>
                                <b>{historyPreview.workouts.length} sessions ready</b>
                                <small>Review below or import them now.</small>
                              </span>
                            </div>
                            <Button
                              kind="primary"
                              disabled={busy || isPreview}
                              onClick={importHistory}
                            >
                              <Upload size={16} />
                              {busy ? "Importing…" : "Import workout history"}
                            </Button>
                          </div>
                        )}
                      </section>
                      <section className="panel">
                        <PanelHead
                          title="Food and nutrition history"
                          sub="Cronometer, MacroFactor, or another nutrition tracker"
                        />
                        <label className="field">
                          <span>Export source</span>
                          <select
                            value={foodSource}
                            onChange={(e) => setFoodSource(e.target.value)}
                          >
                            {[
                              "Cronometer",
                              "MacroFactor",
                              "MyFitnessPal",
                              "Other nutrition app",
                            ].map((x) => (
                              <option key={x}>{x}</option>
                            ))}
                          </select>
                        </label>
                        <label className="upload history-upload">
                          <Upload size={24} />
                          <b>{foodFile?.name || "Choose a food CSV or JSON"}</b>
                          <small>
                            Looks for dates, food or meal names, calories,
                            protein, carbs, and fat.
                          </small>
                          <input
                            type="file"
                            accept=".csv,.json,text/csv,application/json"
                            disabled={isPreview}
                            onClick={(e) => {
                              e.currentTarget.value = "";
                            }}
                            onChange={(e) => {
                              setHistoryKind("nutrition");
                              const f = e.target.files?.[0];
                              e.currentTarget.value = "";
                              if (f)
                                parseHistoryUpload(f, "nutrition", foodSource);
                            }}
                          />
                        </label>
                        {historyPreview?.kind === "nutrition" && (
                          <div className="import-ready" role="status">
                            <div>
                              <CheckCircle2 size={18} />
                              <span>
                                <b>
                                  {historyPreview.meals.length +
                                    historyPreview.daily.length}{" "}
                                  records ready
                                </b>
                                <small>Review below or import them now.</small>
                              </span>
                            </div>
                            <Button
                              kind="primary"
                              disabled={busy || isPreview}
                              onClick={importHistory}
                            >
                              <Upload size={16} />
                              {busy ? "Importing…" : "Import food history"}
                            </Button>
                          </div>
                        )}
                      </section>
                    </div>
                    </details>
                    {historyPreview && (
                      <section className="panel import-preview">
                        <PanelHead
                          title="Import preview"
                          sub={`${historyPreview.source} · ${historyPreview.kind === "workouts" ? historyPreview.workouts.length + " sessions" : historyPreview.meals.length + " food entries, " + historyPreview.daily.length + " daily summaries"}`}
                        />
                        {historyPreview.kind === "workouts" ? (
                          <ResponsiveTable>
                            <table>
                              <thead>
                                <tr>
                                  <th>DATE</th>
                                  <th>WORKOUT</th>
                                  <th>SETS</th>
                                </tr>
                              </thead>
                              <tbody>
                                {historyPreview.workouts
                                  .slice(0, 8)
                                  .map((w: any) => (
                                    <tr key={w.id}>
                                      <td>{w.date}</td>
                                      <td>
                                        {w.name}
                                        <small className="import-exercises">
                                          {[
                                            ...new Set(
                                              w.sets.map((s: any) => s.name),
                                            ),
                                          ].join(", ")}
                                        </small>
                                      </td>
                                      <td>{w.sets.length}</td>
                                    </tr>
                                  ))}
                              </tbody>
                            </table>
                          </ResponsiveTable>
                        ) : (
                          <ResponsiveTable>
                            <table>
                              <thead>
                                <tr>
                                  <th>DATE</th>
                                  <th>FOOD / SUMMARY</th>
                                  <th>ENERGY</th>
                                  <th>PROTEIN</th>
                                </tr>
                              </thead>
                              <tbody>
                                {[
                                  ...historyPreview.meals
                                    .slice(0, 6)
                                    .map((m: any) => ({
                                      date: m.date,
                                      name: m.name,
                                      calories: m.calories,
                                      protein: m.protein,
                                    })),
                                  ...historyPreview.daily
                                    .slice(0, 6)
                                    .map((m: any) => ({
                                      date: m.date,
                                      name: "Daily summary",
                                      calories: m.calories,
                                      protein: m.protein,
                                    })),
                                ]
                                  .slice(0, 10)
                                  .map((m: any, i: number) => (
                                    <tr key={m.date + i}>
                                      <td>{m.date}</td>
                                      <td>{m.name}</td>
                                      <td>{fmt(m.calories)} kcal</td>
                                      <td>{fmt(m.protein)} g</td>
                                    </tr>
                                  ))}
                              </tbody>
                            </table>
                          </ResponsiveTable>
                        )}
                        <p className="tiny muted">
                          Imported rows are added to this profile. Re-importing
                          the same file avoids duplicate entries. Check the
                          preview before you import.
                        </p>
                        <Button
                          kind="primary"
                          disabled={busy || isPreview}
                          onClick={importHistory}
                        >
                          <Upload size={15} />
                          {busy ? "Importing…" : "Import into " + c.name}
                        </Button>
                      </section>
                    )}
                    <section className="panel slim">
                      <div>
                        <h3>Export format compatibility</h3>
                        <p>
                          Use CSV or JSON exports with recognizable date,
                          exercise, reps, weight, food, calorie, and macro
                          columns. Export layouts differ by app;
                          password-protected files, spreadsheets, and provider
                          sign-ins aren’t imported here. The original file stays
                          on your device.
                        </p>
                      </div>
                    </section>
                  </>
                )}
                {tab === "Strain" && (
                  <>
                    {heading(
                      "Daily strain & recovery.",
                      `${c.name} · device activity and logged training`,
                      <div className="diary-date-nav">
                        <button
                          className="icon"
                          aria-label="Previous day"
                          onClick={() =>
                            setCalorieDate(shiftDate(calorieDay, -1))
                          }
                        >
                          <ChevronLeft size={19} />
                        </button>
                        <span>
                          {calorieDay === today
                            ? "Today"
                            : new Date(
                                calorieDay + "T12:00:00",
                              ).toLocaleDateString("en-AU", {
                                day: "numeric",
                                month: "short",
                              })}
                        </span>
                        <button
                          className="icon"
                          aria-label="Next day"
                          onClick={() =>
                            setCalorieDate(shiftDate(calorieDay, 1))
                          }
                        >
                          <ChevronRight size={19} />
                        </button>
                      </div>,
                    )}
                    <div className="strain-hero panel">
                      <div>
                        <div className="eyebrow">FORM DAILY LOAD INDEX</div>
                        <h2>
                          {strainIndex}
                          <small> / 21</small>
                        </h2>
                        <p>
                          Built from tracker-recorded active calories and
                          completed hard sets logged in Form.
                        </p>
                      </div>
                      <div
                        className="strain-ring"
                        style={
                          {
                            "--strain": `${(strainIndex / 21) * 100}%`,
                          } as React.CSSProperties
                        }
                      >
                        <span>{strainIndex}</span>
                      </div>
                    </div>
                    <div className="stats three">
                      <Stat
                        label="Active energy"
                        value={
                          activeBurnReading ? fmt(activeBurnReading.value) : "—"
                        }
                        unit="kcal"
                        icon={<Flame size={18} />}
                        foot={
                          activeBurnReading?.source || "Sync a health source"
                        }
                      />
                      <Stat
                        label="Hard sets logged"
                        value={hardSetCount}
                        icon={<Dumbbell size={18} />}
                        foot={`${dayWorkouts.length} Form workout${dayWorkouts.length === 1 ? "" : "s"}`}
                      />
                      <Stat
                        label="Total energy burned"
                        value={
                          expenditureReading
                            ? fmt(expenditureReading.value)
                            : "—"
                        }
                        unit="kcal"
                        icon={<Activity size={18} />}
                        foot={
                          expenditureReading?.source ||
                          "No synced total-burn reading"
                        }
                      />
                    </div>
                    <section className="panel">
                      <PanelHead
                        title="Recovery signals"
                        sub="Latest readings from linked health sources"
                      />
                      <div className="recovery-grid">
                        {[
                          {
                            label: "Sleep",
                            metric: "sleep_duration",
                            unit: "h",
                            digits: 1,
                          },
                          {
                            label: "HRV",
                            metric: "hrv",
                            unit: "ms",
                            digits: 0,
                          },
                          {
                            label: "Resting heart rate",
                            metric: "rhr",
                            unit: "bpm",
                            digits: 0,
                          },
                          {
                            label: "Readiness",
                            metric: "readiness_score",
                            unit: "/100",
                            digits: 0,
                          },
                        ].map((item) => {
                          const r = healthFor(calorieDay, item.metric);
                          return (
                            <div className="recovery-item" key={item.metric}>
                              <span>{item.label}</span>
                              <b>
                                {r ? fmt(r.value, item.digits) : "—"}
                                <small> {r?.unit || item.unit}</small>
                              </b>
                              <small>{r?.source || "Not synced"}</small>
                            </div>
                          );
                        })}
                      </div>
                    </section>
                    <section className="panel">
                      <PanelHead
                        title="Your weekly load"
                        sub="Daily Form index from activity and logged training"
                      />
                      <div className="strain-week">
                        {Array.from({ length: 7 }, (_, i) => {
                          const date = shiftDate(calorieDay, i - 6),
                            energy =
                              healthFor(date, "active_calories")?.value || 0,
                            sets = workouts
                              .filter((w) => w.date === date)
                              .flatMap((w) => w.sets || [])
                              .filter(
                                (x: any) => x.completed && !x.warmup,
                              ).length,
                            score = Math.min(
                              21,
                              Math.round(energy / 80 + sets * 0.6),
                            );
                          return (
                            <div className="strain-day" key={date}>
                              <div className="strain-bar">
                                <i
                                  style={{
                                    height: `${Math.max(score ? 8 : 2, (score / 21) * 100)}%`,
                                  }}
                                />
                              </div>
                              <b>{score || "—"}</b>
                              <small>
                                {new Date(
                                  date + "T12:00:00",
                                ).toLocaleDateString("en-AU", {
                                  weekday: "short",
                                })}
                              </small>
                            </div>
                          );
                        })}
                      </div>
                      <p className="tiny muted strain-note">
                        This is Form’s own activity index, not a WHOOP score or
                        a medical recovery measure. It is a simple
                        training/activity summary and may not reflect how
                        recovered you feel.
                      </p>
                    </section>
                  </>
                )}
                {tab === "Training" && scheduleMode !== "fixed" && (
                  <>
                    <FlexibleTrainingDetails
                      records={featureRecords}
                      templates={savedTemplates}
                      workouts={workouts}
                      canApprove={isCoach}
                      approved={Object.fromEntries(
                        Object.entries(approvedProgressions)
                          .filter(([key]) => key.startsWith(c.id + ":"))
                          .map(([key, value]) => [
                            key.slice(c.id.length + 1),
                            value,
                          ]),
                      )}
                      onApprove={(exerciseId, target) =>
                        mutate(
                          "approveProgression",
                          { exerciseId, ...target },
                          true,
                        )
                      }
                      onClear={(exerciseId) =>
                        mutate("clearProgression", { exerciseId }, true)
                      }
                      onVideo={(exercise) => {
                        setVideoExercise(exercise);
                        setVideoDate(calorieDay);
                        setVideoFile(null);
                        setModal("exerciseVideos");
                      }}
                    />
                    <StrengthContext
                      key={c.id}
                      workouts={workouts}
                      clientWeight={c.targets.startWeight || 75}
                    />
                  </>
                )}
                {tab === "Progress" && (
                  <>
                    {heading(
                      "See the whole picture.",
                      `${c.name} · measured progress over time`,
                      <>
                        <Button
                          onClick={() => {
                            setDraft({
                              weight: c.targets.startWeight || 74,
                              bf: c.targets.bodyFat || 20,
                              maintenance: c.targets.maintenance || 2800,
                              intake: c.targets.calories,
                              start: today,
                              end:
                                c.targets.goalDate && c.targets.goalDate > today
                                  ? c.targets.goalDate
                                  : shiftDate(today, 42),
                            });
                            setModal("forecast");
                          }}
                        >
                          <Target size={16} />
                          Projection
                        </Button>
                        <Button onClick={exportCSV}>
                          <Download size={16} />
                          Export logs
                        </Button>
                        <Button onClick={shareProgress}>
                          <Download size={16} />
                          Share summary
                        </Button>
                        <Button
                          kind="primary"
                          onClick={() => {
                            setDraft({ date: calorieDay, view: "Front" });
                            setPhotoFile(null);
                            setModal("photo");
                          }}
                        >
                          <Camera size={16} />
                          Add photo
                        </Button>
                      </>,
                    )}
                    <div className="two-col progress-layout">
                      <section className="panel">
                        <PanelHead
                          title="Weight trend"
                          sub="Daily measurements and seven-day average"
                        />
                        <WeightChart logs={logs} height={220} />
                        <div className="stats-inline">
                          <span>
                            Latest
                            <b>{fmt(weights.at(-1)?.data.weight, 1)} kg</b>
                          </span>
                          <span>
                            7-day average<b>{fmt(avg, 1)} kg</b>
                          </span>
                          <span>
                            Waist
                            <b>
                              {fmt(
                                [...logs].reverse().find((l) => l.data.waist)
                                  ?.data.waist,
                                1,
                              )}{" "}
                              cm
                            </b>
                          </span>
                        </div>
                      </section>
                      <section className="panel goal-panel">
                        <Target size={27} />
                        <span className="eyebrow">THE DIRECTION</span>
                        <h2>{c.targets.goal || "Set your next goal"}</h2>
                        <p>
                          {c.targets.goalDate
                            ? "Review on " + c.targets.goalDate
                            : "Choose a review date together."}
                        </p>
                        <div className="row between">
                          <span>Target weight</span>
                          <b>
                            {c.targets.goalWeight
                              ? c.targets.goalWeight + " kg"
                              : "Not set"}
                          </b>
                        </div>
                        <p className="tiny muted">
                          Body-fat entries are estimates. Progress photos,
                          strength and waist trends add context.
                        </p>
                        {canEdit && (
                          <Button
                            onClick={() => {
                              setDraft({ ...c.targets });
                              setModal("targets");
                            }}
                          >
                            Adjust goals <ArrowRight size={15} />
                          </Button>
                        )}
                      </section>
                    </div>
                    <section className="panel">
                      <PanelHead
                        title="Anatomy of your training"
                        sub="Select a muscle to inspect contributing working sets"
                        right={
                          <div className="segmented">
                            <button
                              className={
                                volumeMode === "planned" ? "selected" : ""
                              }
                              onClick={() => setVolumeMode("planned")}
                            >
                              Planned week
                            </button>
                            <button
                              className={
                                volumeMode === "completed" ? "selected" : ""
                              }
                              onClick={() => setVolumeMode("completed")}
                            >
                              Completed
                            </button>
                          </div>
                        }
                      />
                      <div className="form-grid"><label className="field"><span>Muscle contribution view</span><select aria-label="Muscle contribution view" value={volumeContribution} onChange={event=>setVolumeContribution(event.target.value as typeof volumeContribution)}><option value="weighted">Weighted</option><option value="direct">Direct only</option><option value="indirect">Indirect only</option></select></label>{volumeMode==='completed'&&<><label className="field"><span>Muscle map date window</span><select aria-label="Muscle map date window" value={volumeDays} onChange={event=>setVolumeDays(Number(event.target.value))}>{[7,14,28,56,90].map(n=><option key={n} value={n}>{n} days</option>)}</select></label><label className="field"><span>Muscle map end date</span><input type="date" max={today} value={calorieDay} onChange={event=>{if(event.target.value)setCalorieDate(event.target.value)}}/></label></>}</div><p className="muscle-heat-legend">0 · no recorded exposure <i aria-hidden="true"/>{volumeContribution==='weighted'?'Weighted points · 1 direct / 0.5 indirect':volumeContribution+' sets · raw counts'}</p><div className="full-muscle">
                        <Anatomy
                          values={vols}
                          selected={selectedMuscle}
                          onSelect={setSelectedMuscle}
                              unit={volumeContribution==="weighted"?"weighted points":volumeContribution+" sets"}
                        />
                        <div>
                          <span className="eyebrow">SELECTED MUSCLE</span>
                          <h2>{selectedMuscle}</h2>
                          <div className="big-number">
                            {vols[selectedMuscle] || 0}
                            <small>{volumeContribution==="weighted"?" weighted points":` ${volumeContribution} sets`}</small>
                          </div>
                          <p className="muted">
                            {volumeMode === "planned"
                              ? "Required working sets in this weekly template."
                              : `Completed working sets from ${shiftDate(calorieDay,1-volumeDays)} to ${calorieDay}.`}{" "}
                            Direct muscles receive 1 point per set; indirect muscles receive 0.5. This is a tracking estimate, not a physiological measurement.
                          </p>
                          <select aria-label="Selected muscle"
                            value={selectedMuscle}
                            onChange={(e) => setSelectedMuscle(e.target.value)}
                          >
                            {muscles.map((m) => (
                              <option key={m}>{m}</option>
                            ))}
                          </select>
                          <MuscleExposure plan={c?.plan||emptyPlan} workouts={session&&!workouts.some(w=>w.id===session.id)?[...workouts,session]:workouts} mode={volumeMode} start={shiftDate(calorieDay,1-volumeDays)} end={calorieDay} selected={selectedMuscle} view={volumeContribution}/><div className="muscle-breakdown">
                            {Object.entries(vols)
                              .filter(([, n]) => n > 0)
                              .sort((a, b) => b[1] - a[1])
                              .map(([m, n]) => (
                                <button
                                  key={m}
                                  onClick={() => setSelectedMuscle(m)}
                                >
                                  <span>{m}</span>
                                  <b>{n}</b>
                                  <div className="bar">
                                    <i
                                      style={{
                                        width:
                                          Math.min(100, (n / 16) * 100) + "%",
                                      }}
                                    />
                                  </div>
                                </button>
                              ))}
                          </div>
                        </div>
                      </div>
                    </section>
                    <section className="panel">
                      <PanelHead
                        title="Progress photos"
                        sub="Private photos · consistent lighting and angles"
                      />
                      {data.photos.length ? (
                        <div className="photo-grid">
                          {data.photos.map((p) => (
                            <div key={p.id}>
                              <img
                                src={"/api/photo?id=" + p.id}
                                alt={p.view + " progress on " + p.date}
                              />
                              <div className="row between">
                                <small>
                                  {p.date} · {p.view}
                                </small>
                                <button
                                  aria-label="Delete photo"
                                  className="icon"
                                  onClick={async () => {
                                    if (
                                      !confirm("Delete this photo permanently?")
                                    )
                                      return;
                                    const r = await fetch("/api/photo", {
                                      method: "DELETE",
                                      headers: {
                                        "Content-Type": "application/json",
                                      },
                                      body: JSON.stringify({ id: p.id }),
                                    });
                                    if (r.ok) refresh(c.id);
                                    else notify("Could not delete photo");
                                  }}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <Empty
                          title="A consistent point of view"
                          text="Add front, side and back photos to compare your progress."
                        />
                      )}
                    </section>
                  </>
                )}
                {tab === "Check-ins" && (
                  <>
                    {heading(
                      "Listen to the whole story.",
                      "Daily signals and weekly conversations.",
                      <Button kind="primary" onClick={() => openLog()}>
                        <Plus size={16} />
                        New check-in
                      </Button>,
                    )}
                    <div className="two-col">
                      <section className="panel">
                        <PanelHead
                          title="Check-in journal"
                          sub={`${c.name} · latest first`}
                        />
                        {logs.length ? (
                          logs
                            .slice()
                            .reverse()
                            .map((l) => (
                              <div className="checkin-card" key={l.id}>
                                <div className="row between">
                                  <b>
                                    {new Date(
                                      l.date + "T12:00",
                                    ).toLocaleDateString("en-AU", {
                                      weekday: "short",
                                      day: "numeric",
                                      month: "short",
                                    })}
                                  </b>
                                  <Tag kind={l.data.reviewed ? "green" : ""}>
                                    {l.data.reviewed
                                      ? "Reviewed"
                                      : l.data.checkin
                                        ? "Weekly check-in"
                                        : "Daily log"}
                                  </Tag>
                                </div>
                                <div className="checkin-metrics">
                                  <span>{fmt(l.data.weight, 1)} kg</span>
                                  <span>{fmt(l.data.sleep, 1)} h sleep</span>
                                  <span>Energy {fmt(l.data.energy)}/5</span>
                                </div>
                                {l.data.notes && <p>{l.data.notes}</p>}
                                <div className="row">
                                  <button
                                    className="text-btn"
                                    onClick={() => openLog(l.date)}
                                  >
                                    View / edit
                                  </button>
                                  {canEdit &&
                                    l.data.checkin &&
                                    !l.data.reviewed && (
                                      <button
                                        className="text-btn green-text"
                                        onClick={() =>
                                          mutate(
                                            "review",
                                            { date: l.date },
                                            true,
                                          )
                                        }
                                      >
                                        Mark reviewed <Check size={13} />
                                      </button>
                                    )}
                                </div>
                              </div>
                            ))
                        ) : (
                          <Empty
                            title="Start a conversation"
                            text="A short daily log makes weekly reviews more useful."
                          />
                        )}
                      </section>
                      <div>
                        <section className="panel">
                          <PanelHead title="Your weekly review" />
                          <ol className="review-list">
                            <li>Compare seven-day average body weight.</li>
                            <li>Check waist and consistent progress photos.</li>
                            <li>Review strength, recovery and appetite.</li>
                            <li>Discuss barriers before changing targets.</li>
                            <li>Adjust the plan together.</li>
                          </ol>
                          <Button
                            kind="full"
                            onClick={() => {
                              setDraft({ time: "07:00" });
                              setModal("reminders");
                            }}
                          >
                            <Bell size={16} />
                            Create calendar reminders
                          </Button>
                        </section>
                        <section className="panel">
                          <PanelHead
                            title="Plan history"
                            sub="Updates are recorded without changing past workouts"
                          />
                          {data.audit.length ? (
                            data.audit.map((a) => (
                              <div className="history-row" key={a.id}>
                                <Clock size={15} />
                                <div>
                                  <b>{a.action}</b>
                                  <small>
                                    {new Date(a.created).toLocaleDateString()}
                                  </small>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="muted">
                              Program and target updates will appear here.
                            </p>
                          )}
                        </section>
                      </div>
                    </div>
                  </>
                )}
                {tab === "Social" && (
                  <SocialPage
                    workouts={canPairOwnProfile ? workouts : []}
                    templates={canPairOwnProfile ? data.workoutTemplates : []}
                    displayName={c?.name || "Form member"}
                    isPreview={isPreview}
                    notify={notify}
                  />
                )}
                {tab === "Touch grass" && (
                  <TouchGrass
                    clientId={c.id}
                    records={featureRecords}
                    preview={isPreview}
                    notify={notify}
                    onChanged={() => refresh(c.id)}
                  />
                )}
                {tab === "Messages" && (
                  <>
                    {heading(
                      "Keep the conversation going.",
                      `Private messages with ${c.name}.`,
                    )}
                    <section className="panel messages">
                      <PanelHead
                        title={c.name}
                        sub={
                          c.member
                            ? "Connected client"
                            : "Client must connect before they can reply"
                        }
                      />
                      <div className="message-list">
                        {data.messages.length ? (
                          data.messages.map((m) => (
                            <div
                              key={m.id}
                              className={
                                "message " + (m.role === "Coach" ? "mine" : "")
                              }
                            >
                              <small>
                                {m.role} ·{" "}
                                {new Date(m.created).toLocaleString("en-AU", {
                                  day: "numeric",
                                  month: "short",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </small>
                              <p>{m.body}</p>
                            </div>
                          ))
                        ) : (
                          <Empty
                            title="A little feedback goes a long way"
                            text="Send a note about progress, technique or the next week’s focus."
                          />
                        )}
                      </div>
                      <form
                        className="message-compose"
                        onSubmit={async (e) => {
                          e.preventDefault();
                          if (await mutate("message", { body: message }, true))
                            setMessage("");
                        }}
                      >
                        <input
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder="Write a message…"
                          maxLength={3000}
                          required
                        />
                        <Button kind="primary" type="submit" disabled={busy}>
                          Send <ArrowUpRight size={16} />
                        </Button>
                      </form>
                    </section>
                  </>
                )}
                {tab === "Body comp" && (
                  <>
                    {heading(
                      "Track the trend, not a guess.",
                      "Log body composition, calculate FFMI, and build a week-by-week projection.",
                      <Tag>Private profile data</Tag>,
                    )}
                    <div className="bodycomp-sections">
                      <details className="panel bodycomp-section" open>
                        <summary>
                          <span>
                            <b>Measurements &amp; FFMI</b>
                            <small>
                              Log weight and body fat, review FFMI, or request a
                              visual estimate.
                            </small>
                          </span>
                          <ChevronDown size={18} />
                        </summary>
                        <div className="bodycomp-section-content">
                          <div className="stats three">
                            <Stat
                              label="Latest weight"
                              value={fmt(bodyWeight, 1)}
                              unit="kg"
                              icon={<TrendingUp size={17} />}
                              foot="Most recent saved check-in"
                            />
                            <Stat
                              label="Body-fat entry"
                              value={fmt(bodyFat, 1)}
                              unit="%"
                              icon={<ScanLine size={17} />}
                              foot={
                                latestBody?.source || "Plan starting estimate"
                              }
                            />
                            <Stat
                              label="FFMI"
                              value={fmt(ffmi, 1)}
                              unit="kg/m²"
                              icon={<Activity size={17} />}
                              foot="Calculated from weight, height and body-fat entry"
                            />
                          </div>
                          <div className="two-col">
                            <section className="panel">
                              <PanelHead
                                title="Body composition check-in"
                                sub="Use consistent conditions; body-fat values are estimates."
                              />
                              <div className="form-grid three">
                                <Field
                                  label="Date"
                                  type="date"
                                  value={draft.bm?.date || calorieDay}
                                  onChange={(v: string) =>
                                    setDraft({
                                      ...draft,
                                      bm: { ...draft.bm, date: v },
                                    })
                                  }
                                />
                                <Field
                                  label="Weight (kg)"
                                  type="number"
                                  min="25"
                                  max="400"
                                  step="any"
                                  value={draft.bm?.weight ?? bodyWeight}
                                  onChange={(v: string) =>
                                    setDraft({
                                      ...draft,
                                      bm: { ...draft.bm, weight: Number(v) },
                                    })
                                  }
                                />
                                <Field
                                  label="Height (cm)"
                                  type="number"
                                  min="100"
                                  max="250"
                                  step="any"
                                  value={draft.bm?.height ?? bodyHeight}
                                  onChange={(v: string) =>
                                    setDraft({
                                      ...draft,
                                      bm: { ...draft.bm, height: Number(v) },
                                    })
                                  }
                                />
                                <Field
                                  label="Body fat (%)"
                                  type="number"
                                  min="2"
                                  max="70"
                                  step="any"
                                  value={draft.bm?.bodyFat ?? bodyFat}
                                  onChange={(v: string) =>
                                    setDraft({
                                      ...draft,
                                      bm: { ...draft.bm, bodyFat: Number(v) },
                                    })
                                  }
                                />
                              </div>
                              <Button
                                kind="primary"
                                disabled={busy || isPreview}
                                onClick={() =>
                                  mutate(
                                    "bodyComposition",
                                    {
                                      value: {
                                        id: crypto.randomUUID(),
                                        date: draft.bm?.date || calorieDay,
                                        weight: Number(
                                          draft.bm?.weight ?? bodyWeight,
                                        ),
                                        height: Number(
                                          draft.bm?.height ?? bodyHeight,
                                        ),
                                        bodyFat: Number(
                                          draft.bm?.bodyFat ?? bodyFat,
                                        ),
                                        source: "Manual entry",
                                      },
                                    },
                                    true,
                                  )
                                }
                              >
                                <Save size={15} />
                                Save body check-in
                              </Button>
                            </section>
                            <section className="panel">
                              <PanelHead
                                title="AI photo estimate"
                                sub="Optional visual estimate; not a measurement."
                              />
                              <p className="muted">
                                The photo is sent to the app’s AI provider for
                                this estimate and is not added to your photo
                                gallery. Use a neutral, well-lit full-body
                                image; avoid faces and identifying details.
                              </p>
                              <div className="form-grid">
                                <Field
                                  label="Weight for FFMI (kg)"
                                  type="number"
                                  min="25"
                                  max="400"
                                  step="any"
                                  value={draft.bodyWeight ?? bodyWeight}
                                  onChange={(v: string) =>
                                    setDraft({
                                      ...draft,
                                      bodyWeight: Number(v),
                                    })
                                  }
                                />
                                <Field
                                  label="Height for FFMI (cm)"
                                  type="number"
                                  min="100"
                                  max="250"
                                  step="any"
                                  value={draft.bodyHeight ?? bodyHeight}
                                  onChange={(v: string) =>
                                    setDraft({
                                      ...draft,
                                      bodyHeight: Number(v),
                                    })
                                  }
                                />
                              </div>
                              <label className="upload body-upload">
                                <ScanLine size={23} />
                                <b>
                                  {bodyPhoto?.name || "Choose a physique photo"}
                                </b>
                                <small>JPEG, PNG or WebP · up to 5 MB</small>
                                <input
                                  type="file"
                                  accept="image/jpeg,image/png,image/webp"
                                  onChange={(e) => {
                                    setBodyPhoto(e.target.files?.[0] || null);
                                    setBodyEstimate(null);
                                  }}
                                />
                              </label>
                              <label className="toggle-label">
                                <input
                                  type="checkbox"
                                  checked={bodyConsent}
                                  onChange={(e) =>
                                    setBodyConsent(e.target.checked)
                                  }
                                />
                                I consent to sending this photo to the
                                configured AI provider for a rough body-fat
                                estimate.
                              </label>
                              <Button
                                kind="primary"
                                disabled={
                                  busy ||
                                  isPreview ||
                                  !bodyPhoto ||
                                  !bodyConsent
                                }
                                onClick={requestBodyEstimate}
                              >
                                <BrainCircuit size={15} />
                                {busy ? "Estimating…" : "Estimate body fat"}
                              </Button>
                              {bodyEstimate && (
                                <div className="notice estimate-result">
                                  <b>
                                    Visual estimate:{" "}
                                    {fmt(bodyEstimate.estimate, 1)}% (
                                    {fmt(bodyEstimate.low, 1)}–
                                    {fmt(bodyEstimate.high, 1)}%)
                                  </b>
                                  <p>{bodyEstimate.notes}</p>
                                  <p>
                                    FFMI at{" "}
                                    {fmt(draft.bodyWeight || bodyWeight, 1)} kg
                                    / {fmt(draft.bodyHeight || bodyHeight, 0)}{" "}
                                    cm: {fmt(bodyEstimate.ffmi, 1)}
                                  </p>
                                  <Button
                                    disabled={busy || isPreview}
                                    onClick={() =>
                                      mutate(
                                        "bodyComposition",
                                        {
                                          value: {
                                            id: crypto.randomUUID(),
                                            date: today,
                                            weight: Number(
                                              draft.bodyWeight || bodyWeight,
                                            ),
                                            height: Number(
                                              draft.bodyHeight || bodyHeight,
                                            ),
                                            bodyFat: bodyEstimate.estimate,
                                            estimateLow: bodyEstimate.low,
                                            estimateHigh: bodyEstimate.high,
                                            source: "AI photo estimate",
                                          },
                                        },
                                        true,
                                      )
                                    }
                                  >
                                    Save this estimate
                                  </Button>
                                </div>
                              )}
                              {isPreview && (
                                <p className="tiny muted">
                                  The read-only demo shows the workflow. Live
                                  estimates need a configured AI key.
                                </p>
                              )}
                            </section>
                          </div>
                        </div>
                      </details>
                      <details className="panel bodycomp-section">
                        <summary>
                          <span>
                            <b>Measurement history</b>
                            <small>
                              Review saved check-ins and FFMI values over time.
                            </small>
                          </span>
                          <ChevronDown size={18} />
                        </summary>
                        <div className="bodycomp-section-content">
                          <section className="panel">
                            <PanelHead
                              title="Measurement history"
                              sub="FFMI = fat-free mass ÷ height². It is a tracking measure, not a health grade."
                            />
                            {data.bodyComposition.filter(
                              (x) => x.client === c.id,
                            ).length ? (
                              <ResponsiveTable>
                                <table>
                                  <thead>
                                    <tr>
                                      <th>DATE</th>
                                      <th>WEIGHT</th>
                                      <th>BODY FAT</th>
                                      <th>ESTIMATE RANGE</th>
                                      <th>FFMI</th>
                                      <th>SOURCE</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {[
                                      ...data.bodyComposition.filter(
                                        (x) => x.client === c.id,
                                      ),
                                    ]
                                      .sort((a, b) =>
                                        b.date.localeCompare(a.date),
                                      )
                                      .map((row) => (
                                        <tr key={row.id}>
                                          <td>{row.date}</td>
                                          <td>{fmt(row.weight, 1)} kg</td>
                                          <td>{fmt(row.body_fat, 1)}%</td>
                                          <td>
                                            {row.estimate_low != null
                                              ? `${fmt(row.estimate_low, 1)}–${fmt(row.estimate_high, 1)}%`
                                              : "—"}
                                          </td>
                                          <td>
                                            {fmt(
                                              (row.weight *
                                                (1 - row.body_fat / 100)) /
                                                (row.height / 100) ** 2,
                                              1,
                                            )}
                                          </td>
                                          <td>{row.source}</td>
                                        </tr>
                                      ))}
                                  </tbody>
                                </table>
                              </ResponsiveTable>
                            ) : (
                              <Empty
                                title="Your measurements will show here"
                                text="Add a manual check-in or save an AI visual estimate."
                              />
                            )}
                          </section>
                        </div>
                      </details>
                      <details className="panel bodycomp-section">
                        <summary>
                          <span>
                            <b>Timeline projection</b>
                            <small>
                              Set assumptions and review the week-by-week
                              estimate.
                            </small>
                          </span>
                          <ChevronDown size={18} />
                        </summary>
                        <div className="bodycomp-section-content">
                          <section className="panel">
                            <PanelHead
                              title="Weekly timeline"
                              sub="A scenario from your starting measurements and planned calorie deficit."
                            />
                            <div className="form-grid three">
                              <Field
                                label="Starting date"
                                type="date"
                                value={
                                  draft.bp?.startDate ||
                                  activeBodyPlan.start_date
                                }
                                onChange={(v: string) =>
                                  setDraft({
                                    ...draft,
                                    bp: { ...draft.bp, startDate: v },
                                  })
                                }
                              />
                              <Field
                                label="Starting weight (kg)"
                                type="number"
                                min="25"
                                max="400"
                                step="any"
                                value={
                                  draft.bp?.weight ?? activeBodyPlan.weight
                                }
                                onChange={(v: string) =>
                                  setDraft({
                                    ...draft,
                                    bp: { ...draft.bp, weight: Number(v) },
                                  })
                                }
                              />
                              <Field
                                label="Height (cm)"
                                type="number"
                                min="100"
                                max="250"
                                step="any"
                                value={
                                  draft.bp?.height ?? activeBodyPlan.height
                                }
                                onChange={(v: string) =>
                                  setDraft({
                                    ...draft,
                                    bp: { ...draft.bp, height: Number(v) },
                                  })
                                }
                              />
                              <Field
                                label="Starting body fat (%)"
                                type="number"
                                min="2"
                                max="70"
                                step="any"
                                value={
                                  draft.bp?.bodyFat ?? activeBodyPlan.body_fat
                                }
                                onChange={(v: string) =>
                                  setDraft({
                                    ...draft,
                                    bp: { ...draft.bp, bodyFat: Number(v) },
                                  })
                                }
                              />
                              <Field
                                label="Daily calorie deficit"
                                type="number"
                                min="0"
                                max="2500"
                                step="50"
                                value={
                                  draft.bp?.dailyDeficit ??
                                  activeBodyPlan.daily_deficit
                                }
                                onChange={(v: string) =>
                                  setDraft({
                                    ...draft,
                                    bp: {
                                      ...draft.bp,
                                      dailyDeficit: Number(v),
                                    },
                                  })
                                }
                              />
                              <p className="tiny muted">
                                A 600 kcal/day scenario predicts about 0.55
                                kg/week using a rough 7,700 kcal/kg calculation.
                              </p>
                            </div>
                            <Button
                              kind="primary"
                              disabled={busy || isPreview}
                              onClick={() =>
                                mutate(
                                  "bodyPlan",
                                  {
                                    value: {
                                      startDate:
                                        draft.bp?.startDate ||
                                        activeBodyPlan.start_date,
                                      weight: Number(
                                        draft.bp?.weight ??
                                          activeBodyPlan.weight,
                                      ),
                                      height: Number(
                                        draft.bp?.height ??
                                          activeBodyPlan.height,
                                      ),
                                      bodyFat: Number(
                                        draft.bp?.bodyFat ??
                                          activeBodyPlan.body_fat,
                                      ),
                                      dailyDeficit: Number(
                                        draft.bp?.dailyDeficit ??
                                          activeBodyPlan.daily_deficit,
                                      ),
                                    },
                                  },
                                  true,
                                )
                              }
                            >
                              <Save size={15} />
                              Save projection assumptions
                            </Button>
                            <p className="tiny muted timeline-caveat">
                              Projection assumes a fixed deficit, roughly 90% of
                              weight lost from fat, and unchanged height. Real
                              weight and body-fat changes vary with water,
                              adherence, adaptation, training and measurement
                              error. Review against observed trends.
                            </p>
                            <ResponsiveTable className="timeline-table">
                              <table>
                                <thead>
                                  <tr>
                                    <th>WEEK</th>
                                    <th>DATE</th>
                                    <th>PROJECTED WEIGHT</th>
                                    <th>PROJECTED BODY FAT</th>
                                    <th>MILESTONE</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {weeklyForecast.map((row) => {
                                    const mark = data.progressMilestones.find(
                                      (m) =>
                                        m.client === c.id &&
                                        m.date >= row.date &&
                                        m.date < shiftDate(row.date, 7),
                                    );
                                    const label = mark
                                      ? [
                                          mark.title,
                                          mark.target_weight
                                            ? fmt(mark.target_weight, 1) + " kg"
                                            : "",
                                          mark.target_body_fat
                                            ? fmt(mark.target_body_fat, 1) + "%"
                                            : "",
                                        ]
                                          .filter(Boolean)
                                          .join(" · ")
                                      : "";
                                    return (
                                      <tr key={row.week}>
                                        <td>
                                          {row.week === 0
                                            ? "Start"
                                            : `Week ${row.week}`}
                                        </td>
                                        <td>{row.date}</td>
                                        <td>{row.weight.toFixed(1)} kg</td>
                                        <td>{row.bf.toFixed(1)}%</td>
                                        <td>{label}</td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </ResponsiveTable>
                          </section>
                        </div>
                      </details>
                      <details className="panel bodycomp-section">
                        <summary>
                          <span>
                            <b>Milestones</b>
                            <small>
                              Add dated targets for weight and body-fat
                              progress.
                            </small>
                          </span>
                          <ChevronDown size={18} />
                        </summary>
                        <div className="bodycomp-section-content">
                          <section className="panel">
                            <PanelHead
                              title="Milestones"
                              sub="Add dated targets to make the projection personal."
                            />
                            <form
                              className="milestone-form"
                              onSubmit={async (e) => {
                                e.preventDefault();
                                const m = draft.ms || {};
                                if (
                                  await mutate(
                                    "milestone",
                                    {
                                      value: {
                                        date: m.date || goalEnd,
                                        title: m.title || "Progress check",
                                        targetWeight:
                                          m.targetWeight == null ||
                                          m.targetWeight === ""
                                            ? null
                                            : Number(m.targetWeight),
                                        targetBodyFat:
                                          m.targetBodyFat == null ||
                                          m.targetBodyFat === ""
                                            ? null
                                            : Number(m.targetBodyFat),
                                      },
                                    },
                                    true,
                                  )
                                )
                                  setDraft({ ...draft, ms: {} });
                              }}
                            >
                              <Field
                                label="Milestone date"
                                type="date"
                                value={draft.ms?.date || goalEnd}
                                onChange={(v: string) =>
                                  setDraft({
                                    ...draft,
                                    ms: { ...draft.ms, date: v },
                                  })
                                }
                              />
                              <Field
                                label="Milestone name"
                                value={draft.ms?.title || ""}
                                required
                                placeholder="Summer check-in"
                                onChange={(v: string) =>
                                  setDraft({
                                    ...draft,
                                    ms: { ...draft.ms, title: v },
                                  })
                                }
                              />
                              <Field
                                label="Target weight (kg), optional"
                                type="number"
                                min="25"
                                max="400"
                                step="any"
                                value={draft.ms?.targetWeight ?? ""}
                                onChange={(v: string) =>
                                  setDraft({
                                    ...draft,
                                    ms: {
                                      ...draft.ms,
                                      targetWeight: v === "" ? null : Number(v),
                                    },
                                  })
                                }
                              />
                              <Field
                                label="Target body fat (%), optional"
                                type="number"
                                min="2"
                                max="70"
                                step="any"
                                value={draft.ms?.targetBodyFat ?? ""}
                                onChange={(v: string) =>
                                  setDraft({
                                    ...draft,
                                    ms: {
                                      ...draft.ms,
                                      targetBodyFat:
                                        v === "" ? null : Number(v),
                                    },
                                  })
                                }
                              />
                              <Button
                                kind="primary"
                                type="submit"
                                disabled={busy || isPreview}
                              >
                                <MilestoneIcon size={15} />
                                Add milestone
                              </Button>
                            </form>
                            {data.progressMilestones.filter(
                              (m) => m.client === c.id,
                            ).length ? (
                              <div className="milestone-list">
                                {data.progressMilestones
                                  .filter((m) => m.client === c.id)
                                  .map((m) => (
                                    <div className="history-row" key={m.id}>
                                      <MilestoneIcon size={15} />
                                      <div>
                                        <b>{m.title}</b>
                                        <small>
                                          {[
                                            m.date,
                                            m.target_weight
                                              ? fmt(m.target_weight, 1) + " kg"
                                              : "",
                                            m.target_body_fat
                                              ? fmt(m.target_body_fat, 1) + "%"
                                              : "",
                                          ]
                                            .filter(Boolean)
                                            .join(" · ")}
                                        </small>
                                      </div>
                                      <button
                                        className="icon"
                                        aria-label={"Delete " + m.title}
                                        onClick={() =>
                                          mutate(
                                            "deleteMilestone",
                                            { id: m.id },
                                            true,
                                          )
                                        }
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </div>
                                  ))}
                              </div>
                            ) : (
                              <p className="tiny muted">No milestones yet.</p>
                            )}
                          </section>
                        </div>
                      </details>
                    </div>
                  </>
                )}
                {tab === "Sleep + cardio" && (
                  <>
                    {heading("Sleep + cardio","Log sleep, activity rings and cardio in one place. Reviewed total burn adapts your daily energy target without double counting active calories.",<div className="diary-date-nav"><button className="icon" aria-label="Previous day" onClick={()=>setCalorieDate(shiftDate(calorieDay,-1))}><ChevronLeft size={19}/></button><span>{calorieDay===today?"Today":new Date(calorieDay+"T12:00:00").toLocaleDateString("en-AU",{day:"numeric",month:"short"})}</span><button className="icon" aria-label="Next day" disabled={calorieDay>=today} onClick={()=>setCalorieDate(shiftDate(calorieDay,1))}><ChevronRight size={19}/></button></div>)}
                    <HealthScreenshotPanel key={c.id} clientId={c.id} date={calorieDay} preview={isPreview} onSaved={healthCaptureSaved} />
                    <section className="panel energy-model-card">
                      <div className="panel-head"><div><h2>Maintenance energy</h2><p>TEE and TDEE are two names for your total daily energy expenditure.</p></div><Tag kind="green">{energyModel.source==='device'?'Device reading':energyModel.source==='observed'?'Adaptive trend':energyModel.source==='profile'?'Profile target':energyModel.source==='formula'?'Formula estimate':'Needs data'}</Tag></div>
                      <div className="energy-model-total"><span>TEE / TDEE</span><b>{energyModel.tdee?`${fmt(energyModel.tdee)} kcal`:'No data'}</b><small>Your estimated maintenance for {calorieDay===today?'today':calorieDay}</small></div>
                      <div className="energy-breakdown-grid">
                        <div><small>BMR</small><b>{energyModel.bmr?`${fmt(energyModel.bmr)} kcal`:'No data'}</b><span>{energyModel.bmr?'Katch–McArdle estimate':'Add weight and body-fat to estimate'}</span></div>
                        <div><small>Daily movement</small><b>{fmt(energyModel.dailyMovement)} kcal</b><span>Remainder after known components</span></div>
                        <div><small>Active energy</small><b>{fmt(energyModel.activeCalories)} kcal</b><span>Move or activity-ring reading</span></div>
                        <div><small>TEF</small><b>{fmt(energyModel.tef)} kcal</b><span>Protein 25% · carbs 7.5% · fat 2.5%</span></div>
                      </div>
                      <div className="adaptive-target-row"><div><small>Adaptive food target</small><b>{fmt(calorieTargets.calories)} kcal</b></div><p>{energyModel.source==='device'?'Adjusted from your configured calorie target using today’s reviewed total burn (limited to ±750 kcal).':'Your configured target stays fixed until a reviewed total-energy reading is available.'}</p></div>
                      <p className="tiny muted">A total-energy reading already includes resting and active energy, so the app does not add activity or TEF to it again. BMR and TEF are estimates, not measurements.</p>
                    </section>

                    <SleepRecovery records={featureRecords} readings={data.healthMetrics} client={c.id} selectedDate={calorieDay} onDateChange={setCalorieDate} demo={data.uid===uidDemo} onConnect={()=>setTab("Connections")}/>
                    <CardioTracker selectedDate={calorieDay} onDateChange={setCalorieDate} key={c.id+":sleep-cardio"} client={c} preview={isPreview} notify={notify}/>
                  </>
                )}
                {tab === "Sleep & recovery" && (
                  <SleepRecovery
                    records={featureRecords}
                    readings={data.healthMetrics}
                    client={c.id}
                    demo={data.uid === uidDemo}
                    onConnect={() => setTab("Connections")}
                  />
                )}
                {tab === "Beginner guide" && (
                  <>
                    {heading(
                      "Beginner muscle guide",
                      "Learn the main action of each muscle group and choose a few stable, easy-to-learn exercises.",
                    )}
                    <div className="beginner-intro panel">
                      <BookOpen size={21} />
                      <p>
                        Muscle actions below are simplified. Start with a
                        comfortable range of motion, controlled reps and a load
                        you can manage. You do not need to train every listed
                        exercise.
                      </p>
                    </div>
                    <div className="toolbar">
                      <label className="search">
                        <Search size={17} />
                        <input
                          placeholder="Search muscles, regions or exercises…"
                          value={guideSearch}
                          onChange={(e) => setGuideSearch(e.target.value)}
                        />
                      </label>
                      <span className="muted tiny">
                        {
                          beginnerMuscles.filter((m) =>
                            (
                              m.name +
                              " " +
                              m.region +
                              " " +
                              m.action +
                              " " +
                              m.exercises.join(" ")
                            )
                              .toLowerCase()
                              .includes(guideSearch.toLowerCase()),
                          ).length
                        }{" "}
                        muscle groups
                      </span>
                    </div>
                    <div className="beginner-grid">
                      {beginnerMuscles
                        .filter((m) =>
                          (
                            m.name +
                            " " +
                            m.region +
                            " " +
                            m.action +
                            " " +
                            m.exercises.join(" ")
                          )
                            .toLowerCase()
                            .includes(guideSearch.toLowerCase()),
                        )
                        .map((m) => (
                          <article className="beginner-card" key={m.id}>
                            <div className="row between">
                              <span className="eyebrow">{m.region}</span>
                              <Tag>{m.name}</Tag>
                            </div>
                            <h2>{m.name}</h2>
                            <div className="beginner-action">
                              <small>MAIN FUNCTION</small>
                              <p>{m.action}</p>
                            </div>
                            <div className="beginner-exercises">
                              <small>BEGINNER EXERCISES</small>
                              {m.exercises.map((ex) => (
                                <span key={ex}>
                                  <Check size={14} />
                                  {ex}
                                </span>
                              ))}
                            </div>
                            <p className="beginner-tip">{m.tip}</p>
                          </article>
                        ))}
                    </div>
                    {!beginnerMuscles.some((m) =>
                      (
                        m.name +
                        " " +
                        m.region +
                        " " +
                        m.action +
                        " " +
                        m.exercises.join(" ")
                      )
                        .toLowerCase()
                        .includes(guideSearch.toLowerCase()),
                    ) && (
                      <Empty
                        title="No matching muscle group"
                        text="Try a muscle name, body region or exercise."
                      />
                    )}
                    <p className="tiny muted beginner-disclaimer">
                      This is general exercise education. Choose pain-free
                      variations and ask a qualified professional for help if
                      you have an injury or medical concern.
                    </p>
                  </>
                )}
                {tab === "AI coach" && <HenryChat key={data.uid+":"+c.id} clientId={c.id} preview={isPreview} onBack={()=>setTab("Home")} />}
                {tab === "Metrics" && (
                  <>
                    {heading(
                      "Health metrics, with context.",
                      "Search a metric, see the latest reading, and understand what it can and cannot tell you.",
                      <Button
                        kind="primary"
                        onClick={() => setTab("Connections")}
                      >
                        <Link2 size={15} />
                        Data connections
                      </Button>,
                    )}
                    <HealthScreenshotPanel key={c.id} clientId={c.id} date={calorieDay} preview={isPreview} onSaved={healthCaptureSaved} />
                    <button className="btn" onClick={()=>openTools("Metrics")}>Review health-file imports & Undo</button>
                    <div className="toolbar">
                      <label className="search">
                        <Search size={17} />
                        <input
                          placeholder="Search metrics… try VO₂ max"
                          value={metricSearch}
                          onChange={(e) => setMetricSearch(e.target.value)}
                        />
                      </label>
                      <span className="muted tiny">
                        {
                          data.healthMetrics.filter((x) => x.client === c.id)
                            .length
                        }{" "}
                        readings for {c.name}
                      </span>
                    </div>
                    {metricCatalog
                      .filter((m) =>
                        (m.name + " " + m.aliases)
                          .toLowerCase()
                          .includes(metricSearch.toLowerCase()),
                      )
                      .map((m) => {
                        const history = data.healthMetrics
                          .filter((x) => x.client === c.id && x.metric === m.id)
                          .sort((a, b) => b.date.localeCompare(a.date));
                        const latestMetric = history[0];
                        return (
                          <section className="panel metric-card" key={m.id}>
                            <div className="row between wrap">
                              <div>
                                <div className="eyebrow">
                                  {m.id === "vo2"
                                    ? "CARDIORESPIRATORY FITNESS"
                                    : "HEALTH METRIC"}
                                </div>
                                <h2>{m.name}</h2>
                              </div>
                              <div className="metric-value">
                                {latestMetric
                                  ? fmt(latestMetric.value, 1)
                                  : "—"}{" "}
                                <small>{latestMetric?.unit || m.unit}</small>
                              </div>
                            </div>
                            {m.id === "vo2" && (
                              <div className="metric-profile">
                                <Field
                                  label="Age"
                                  type="number"
                                  min="20"
                                  max="79"
                                  value={metricProfile.age}
                                  onChange={(v: string) =>
                                    setMetricProfile({
                                      ...metricProfile,
                                      age: v,
                                    })
                                  }
                                />
                                <label className="field">
                                  <span>Reference group</span>
                                  <select
                                    value={metricProfile.sex}
                                    onChange={(e) =>
                                      setMetricProfile({
                                        ...metricProfile,
                                        sex: e.target.value,
                                      })
                                    }
                                  >
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                  </select>
                                </label>
                                <Tag kind={latestMetric ? "green" : ""}>
                                  {latestMetric
                                    ? vo2Band(
                                        latestMetric.value,
                                        Number(metricProfile.age),
                                        metricProfile.sex,
                                      ) || "Outside reference ages"
                                    : "No reading yet"}
                                </Tag>
                              </div>
                            )}
                            <p className="metric-about">{m.about}</p>
                            {m.id === "vo2" && (
                              <div className="metric-guidance">
                                <div>
                                  <b>If your result is low</b>
                                  <p>{m.improve}</p>
                                </div>
                                <div>
                                  <b>Higher and lower readings</b>
                                  <p>
                                    <strong>Higher:</strong> {m.high}
                                  </p>
                                  <p>
                                    <strong>Lower:</strong> {m.low}
                                  </p>
                                </div>
                              </div>
                            )}
                            {latestMetric ? (
                              <div className="metric-source">
                                <span>
                                  Latest:{" "}
                                  {new Date(
                                    latestMetric.date + "T12:00:00",
                                  ).toLocaleDateString("en-AU", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  })}
                                </span>
                                <span>Source: {latestMetric.source}</span>
                                <span>
                                  {history.length} reading
                                  {history.length === 1 ? "" : "s"}
                                </span>
                              </div>
                            ) : (
                              <p className="tiny muted">
                                Connect Oura or import an Apple Health export to
                                show readings.
                              </p>
                            )}
                            {m.id === "vo2" && (
                              <p className="tiny muted metric-citation">
                                Reference: FRIEND registry treadmill test
                                percentiles, ages 20–79. The study used measured
                                exercise-test VO₂ max; wearable estimates can
                                differ. Categories are broad population
                                percentiles, not medical labels.{" "}
                                <a
                                  href="https://www.mayoclinicproceedings.org/article/S0025-6196(15)00642-4/pdf"
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  Read the study <ArrowUpRight size={12} />
                                </a>
                              </p>
                            )}
                          </section>
                        );
                      })}
                    {!metricCatalog.some((m) =>
                      (m.name + " " + m.aliases)
                        .toLowerCase()
                        .includes(metricSearch.toLowerCase()),
                    ) && (
                      <Empty
                        title="No matching metric"
                        text="Try searching VO₂ max, HRV, resting heart rate, sleep, activity or body weight."
                      />
                    )}
                    <section className="panel">
                      <PanelHead title="Interpret readings with care" />
                      <p className="muted">
                        Wearable readings are estimates and can vary by device,
                        algorithm, activity, and timing. This page provides
                        general education and trend tracking, not diagnosis. For
                        VO₂ max, select the client’s age and the matching
                        reference group before interpreting the percentile band.
                      </p>
                    </section>
                  </>
                )}
                {tab === "Connections" && (
                  <>
                    <IPhoneConnection client={c.id} canPair={!!canPairOwnProfile} preview={isPreview}/>
                    {heading(
                      "Connect your health data.",
                      "Browser-compatible connections and private file imports.",
                    )}
                    <WebConnections
                      clientId={c.id}
                      canConnect={canPairOwnProfile}
                      connection={data.wearableConnections.find(
                        (x) => x.provider === "oura",
                      )}
                      onConnect={connectOura}
                      onSync={() => syncOura("sync")}
                      onDisconnect={() => {
                        if (
                          confirm(
                            "Disconnect Oura and remove its stored access tokens?",
                          )
                        )
                          syncOura("disconnect");
                      }}
                      onMetrics={() => setTab("Metrics")}
                      preview={isPreview}
                    />
                    <section className="panel">
                      <PanelHead
                        title="Client access & sharing"
                        sub="Clients see only their own plan and records"
                      />
                      <p className="muted">
                        {isSelfProfile
                          ? "This is your own private training profile. You can use the app without a coach; if you later accept another coach’s invitation, that coached profile will appear separately."
                          : c.member
                            ? "This profile is connected to a client account."
                            : "Create a one-use invitation for this client. The link expires in seven days."}{" "}
                        Site audience settings must also allow the client to
                        visit; an invitation does not change site access.
                      </p>
                      <div className="row">
                        {canEdit && !c.member && !isSelfProfile && (
                          <Button
                            onClick={() => {
                              setInvite("");
                              setModal("invite");
                              mutate("invite", {}, true);
                            }}
                          >
                            <Link2 size={16} />
                            Create client invitation
                          </Button>
                        )}
                        {canEdit && c.member && (
                          <Button
                            onClick={() => {
                              if (
                                confirm(
                                  "Disconnect client access? Existing coaching records remain.",
                                )
                              )
                                mutate("revoke", {}, true);
                            }}
                          >
                            Disconnect client
                          </Button>
                        )}
                        {!isCoach && (
                          <Button
                            onClick={() => {
                              if (
                                confirm(
                                  "Disconnect this coach relationship? Existing records remain with the coach.",
                                )
                              )
                                mutate("disconnect", {}, true);
                            }}
                          >
                            Disconnect sharing
                          </Button>
                        )}
                        <Button onClick={exportProfile}>
                          <Download size={16} />
                          Export client data
                        </Button>
                      </div>
                    </section>
                  </>
                )}
              </>
            )}
            {c && tab === "Training" && <PastWorkoutTemplates workouts={workouts} onCopy={workout=>{setDraft({workout:structuredClone(workout),finished:false});setModal("workoutTemplateReview");}}/>}
            {c && tab === "Connections" && (
              <React.Suspense
                fallback={<p className="tiny muted">Loading tool…</p>}
              >
                {!isPreview&&<SiteTools uid={data.uid} onFeatures={setSiteFeatures}/>}
                <ReleaseCentre />
              </React.Suspense>
            )}
            {c && ["Calories", "Check-ins", "Progress"].includes(toolContext) && (
              <React.Suspense
                fallback={<p className="tiny muted">Loading tool…</p>}
              >
                <EntryHistory
                  clientId={c.id}
                  logs={logs}
                  meals={data.meals.filter((m) => m.client === c.id)}
                  onRestore={(action, payload) => mutate(action, payload, true)}
                />
              </React.Suspense>
            )}
            {c && toolContext === "Home" && (
              <React.Suspense
                fallback={<p className="tiny muted">Loading tool…</p>}
              >
                <HabitBoard
                  uid={data.uid}
                  records={featureRecords}
                  clientId={c.id}
                  date={calorieDay}
                  onSaved={() => void refresh(c.id)}
                  onFallback={(name) => {
                    const template = savedTemplates.find(
                      (t) => t.name === name,
                    );
                    if (template)
                      void launchWorkout({
                        ...template,
                        name: (template.name + " · minimum session").slice(
                          0,
                          80,
                        ),
                      });
                    else
                      notify(
                        "No saved workout has that name. Create or choose a fallback template in Training.",
                      );
                  }}
                />
              </React.Suspense>
            )}
            {c &&
              ["Progress", "Body comp"].includes(toolContext) &&
              featureEnabled("Body insights") && (
                <React.Suspense
                  fallback={<p className="tiny muted">Loading tool…</p>}
                >
                  <ReviewReminders key={"reviews:"+c.id} records={featureRecords} milestones={data.progressMilestones.filter(row=>row.client===c.id)} client={c.id} uid={data.uid} date={calorieDay} preview={isPreview}/>
                  <PhotoAlignment key={c.id} photos={data.photos.filter(photo=>photo.client===c.id)} records={featureRecords} client={c.id} preview={isPreview}/>
                  <BodyInsights
                    milestones={data.progressMilestones.filter(milestone=>milestone.client===c.id)}
                    logs={logs}
                    meals={data.meals.filter((m) => m.client === c.id)}
                    plan={data.progressPlan}
                    body={data.bodyComposition.filter((b) => b.client === c.id)}
                    records={featureRecords}
                    date={calorieDay}
                  />
                </React.Suspense>
              )}
            {c &&
              toolContext === "Recipes & meals" &&
              featureEnabled("Recipe utilities") && (
                <React.Suspense
                  fallback={<p className="tiny muted">Loading tool…</p>}
                >
                  <RecipeTools
                    date={calorieDay}
                    records={featureRecords}
                    onLog={(v) => mutate("meal", { value: v }, true)}
                  />
                </React.Suspense>
              )}
            {c && toolContext === "Calories" && <React.Suspense fallback={<p>Loading food tools…</p>}>
                    <details className="optional-tool meal-suggestion-tool">
                      <summary>
                        <span>
                          <b>Meal ideas</b>
                          <small>Get a suggestion from your remaining targets</small>
                        </span>
                        <ChevronDown size={18} />
                      </summary>
                      <MealSuggestion
                        key={c.id}
                        client={c}
                        date={calorieDay}
                        targets={calorieTargets}
                        consumed={calorieTotals}
                        preview={isPreview}
                        onLog={async (v: any) =>
                          mutate("meal", { value: v }, true)
                        }
                      />
                    </details>
                    <DiaryTools
                      profiles={featureRecords
                        .filter((r) => r.kind === "food-profile")
                        .map((r) => r.data)}
                      meals={data.meals}
                      savedFoods={data.savedFoods}
                      date={calorieDay}
                      clientId={c.id}
                      targets={calorieTargets}
                      totals={calorieTotals}
                      onSave={(v) => mutate("meal", { value: v }, true)}
                      onFood={addSavedFood}
                      lastRemoved={lastRemovedMeal}
                      onUndo={async () => {
                        if (
                          lastRemovedMeal &&
                          (await mutate(
                            "meal",
                            { value: lastRemovedMeal.data },
                            true,
                          ))
                        )
                          setLastRemovedMeal(null);
                      }}
                    />
                    <details className="panel saved-meals saved-foods">
                      <summary>
                        <span>
                          <b>My saved foods</b>
                          <small>
                            Products you scanned or added with a nutrition label
                            · {data.savedFoods.length} foods
                          </small>
                        </span>
                        <ChevronDown size={17} />
                      </summary>
                      <div className="saved-meal-list">
                        {data.savedFoods.length ? (
                          data.savedFoods.map((f: any) => (
                            <div className="saved-meal" key={f.id}>
                              <div>
                                <b>{f.name}</b>
                                <small>
                                  {f.barcode ? "Code " + f.barcode + " · " : ""}
                                  {fmt(f.calories)} kcal per {f.serving_size} ·
                                  P {fmt(f.protein)} / C {fmt(f.carbs)} / F{" "}
                                  {fmt(f.fat)} g
                                </small>
                              </div>
                              <div className="row">
                                <Button onClick={() => addSavedFood(f)}>
                                  Log food
                                </Button>
                                {!isPreview && (
                                  <button
                                    className="icon"
                                    aria-label={"Delete " + f.name}
                                    onClick={() =>
                                      mutate("deleteFood", { id: f.id }, true)
                                    }
                                  >
                                    <Trash2 size={15} />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="muted tiny">
                            Scan a package or add nutrition-label photos to
                            build your food list.
                          </p>
                        )}
                      </div>
                    </details>
                    <section className="panel">
                      <PanelHead
                        title={
                          "Training on " +
                          new Date(calorieDay + "T12:00:00").toLocaleDateString(
                            "en-AU",
                            { weekday: "long", day: "numeric", month: "long" },
                          )
                        }
                        sub="Workout sessions logged for this date"
                      />
                      {dayWorkouts.length ? (
                        dayWorkouts.map((w) => (
                          <div className="history-row" key={w.id}>
                            <Dumbbell size={17} />
                            <div>
                              <b>{w.name}</b>
                              <small>
                                {w.sets.filter((x: any) => x.completed).length}{" "}
                                completed sets
                              </small>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="muted">No workout logged on this date.</p>
                      )}
                    </section>
                    <section className="panel diary-history">
                      <PanelHead
                        title="Daily nutrition history"
                        sub="Review recent calorie and protein logs"
                      />
                      <ResponsiveTable>
                        <table>
                          <thead>
                            <tr>
                              <th>DATE</th>
                              <th>ENERGY</th>
                              <th>PROTEIN</th>
                              <th />
                            </tr>
                          </thead>
                          <tbody>
                            {logs
                              .slice(-7)
                              .reverse()
                              .map((l) => (
                                <tr key={l.id}>
                                  <td>{l.date}</td>
                                  <td>{fmt(l.data.calories)} kcal</td>
                                  <td>{fmt(l.data.protein)} g</td>
                                  <td>
                                    <button
                                      className="text-btn"
                                      onClick={() => {
                                        setCalorieDate(l.date);
                                        openLog(l.date);
                                      }}
                                    >
                                      View
                                    </button>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </ResponsiveTable>
                    </section>
            </React.Suspense>}
            {c && toolContext === "Import" && (
              <React.Suspense
                fallback={<p className="tiny muted">Loading tool…</p>}
              >
                <ImportMapping
                  clientId={c.id}
                  uid={data.uid}
                  onImported={() => void refresh(c.id)}
                />
              </React.Suspense>
            )}
            {c && ["Cardio","Sleep + cardio"].includes(toolContext) && featureEnabled("Cardio route tools") && (
              <React.Suspense
                fallback={<p className="tiny muted">Loading tool…</p>}
              >
                <><WalkRunPlan client={c.id} date={calorieDay} preview={isPreview}/><CardioTools clientId={c.id} date={calorieDay} /></>
              </React.Suspense>
            )}
            {c && ["Clients","Check-ins"].includes(toolContext) && c.owner===data.uid && !isPreview && <BulkProgramme clients={data.clients} templates={data.templates} uid={data.uid} onChanged={()=>void refresh(c.id)}/>}
            {c && ["Check-ins","Progress"].includes(toolContext) && !isPreview && <ClientBrief key={"brief:"+c.id} client={c} logs={logs} workouts={workouts} meals={clientMeals} date={calorieDay}/>}
            {c && toolContext === "Check-ins" && !isPreview && <CoachingWorkspace key={c.id} client={c} uid={data.uid} templates={data.templates} videos={data.exerciseVideos.filter(video=>video.client===c.id)} onChanged={()=>void refresh(c.id)}/>}
            {c && toolContext === "Training" && (
              <React.Suspense
                fallback={<p className="tiny muted">Loading tool…</p>}
              >
                <VideoComparison
                  videos={data.exerciseVideos.filter((v) => v.client === c.id)}
                />
              </React.Suspense>
            )}
            {c && toolContext === "Connections" && (
              <React.Suspense
                fallback={<p className="tiny muted">Loading tool…</p>}
              >
                <BackupReview client={c.id} uid={data.uid} records={featureRecords} onExport={exportProfile}/>
                <PrivacyTools
                  client={c}
                  clients={data.clients}
                  uid={data.uid}
                  audit={data.audit}
                  onExport={exportProfile}
                  onDisconnect={() => {
                    if (
                      confirm(
                        "Disconnect this coaching relationship? Existing shared records remain with the coach.",
                      )
                    )
                      void mutate(
                        c.owner === data.uid ? "revoke" : "disconnect",
                        {},
                        true,
                      );
                  }}
                />
              </React.Suspense>
            )}
            {c &&
              ["Metrics", "Sleep & recovery", "Sleep + cardio"].includes(toolContext) &&
              featureEnabled("Recovery insights") && (
                <React.Suspense
                  fallback={<p className="tiny muted">Loading tool…</p>}
                >
                  <RecoveryInsights
                    workouts={workouts}
                    readings={data.healthMetrics.filter(
                      (r) => r.client === c.id,
                    )}
                    journals={featureRecords}
                    logs={logs}
                    date={calorieDay}
                  />
                </React.Suspense>
              )}
            <AppUpdate activeWorkout={!!session} />
            {c && toolContext === "Home" && (
              <SyncStatus uid={data.uid} onSync={() => void refresh(c.id)} />
            )}
            {c &&
              ["Training", "Progress", "Training tools"].includes(toolContext) &&
              featureEnabled("Training insights") && (
                <React.Suspense
                  fallback={<p className="tiny muted">Loading tool…</p>}
                >
                  <TrainingInsights
                    annotations={featureRecords}
                    workouts={workouts}
                    logs={logs}
                    date={calorieDay}
                  />
                </React.Suspense>
              )}
            {c && toolContext && (
              <React.Suspense
                fallback={<p className="tiny muted">Loading tool…</p>}
              >
                <WorkspaceTools
                  tab={toolContext}
                  clientId={c.id}
                  isCoach={isCoach}
                  selectedDate={calorieDay}
                  preview={isPreview}
                />
              </React.Suspense>
            )}
            <footer className="app-footer">
              <span>
                form. <span className="muted">Built around your people.</span>
              </span>
              <span>
                {isPreview
                  ? "Example data · no live health connection"
                  : "Secure workspace · health integrations not connected"}
              </span>
            </footer>
          </main>
        </div>
        <nav className="phone-bottom-nav" aria-label="Main navigation" style={{gridTemplateColumns:`repeat(${preferences.hotbarPages.length+1},minmax(0,1fr))`}}>
          {preferences.hotbarPages.map(name=>{const icons:Record<string,any>={Home:HomeIcon,Calories:Apple,Training:Dumbbell,Social:Users,"Touch grass":Sprout,"Sleep + cardio":Moon,"AI coach":BrainCircuit};return [name,icons[name],destinationLabels[name]];}).map(([name, Icon, label]) => {
            const NavIcon = Icon as any;
            return (
              <button
                type="button"
                key={String(name)}
                className={tab === name ? "active" : ""}
                aria-label={String(label)}
                aria-current={tab === name ? "page" : undefined}
                onClick={() => {
                  setQuickMenuOpen(false);
                  setModal(null);
                  if (name === "Training") setEditingWorkout(null);
                  setTab(String(name));
                  setMobile(false);

                }}
              >
                <NavIcon size={22} aria-hidden="true"/>
                <span className="phone-nav-label" aria-hidden="true">{String(label).split(" + ").length > 1 ? <><span>Sleep +</span><span>cardio</span></> : String(label)==="Touch grass" ? <><span>Touch</span><span>grass</span></> : <span>{String(label)}</span>}</span>
              </button>
            );
          })}
          <button type="button" aria-label="More" className={mobile?"active":""} aria-controls="workspace-navigation" aria-expanded={mobile} onClick={()=>setMobile(value=>!value)}><Menu size={22}/><span className="phone-nav-label">More</span></button>
        </nav>
        {toast && (
          <div className="toast" role="status">
            <CheckCircle2 size={18} />
            {toast}
          </div>
        )}
        {saveConflict && (
          <Modal
            title="Review conflicting changes"
            close={() => setSaveConflict(null)}
          >
            <p className="notice">{saveConflict.error}</p>
            <div className="form-grid">
              <div>
                <h3>Your draft</h3>
                <pre>{JSON.stringify(saveConflict.local, null, 2)}</pre>
              </div>
              <div>
                <h3>Current saved entry</h3>
                <pre>{JSON.stringify(saveConflict.server, null, 2)}</pre>
              </div>
            </div>
            <Button
              onClick={() => {
                setSaveConflict(null);
                void refresh(c.id);
              }}
            >
              Reload saved records (keep draft open)
            </Button>
            <Button
              onClick={() => {
                download(
                  "Form-conflicting-draft.json",
                  JSON.stringify(saveConflict, null, 2),
                  "application/json",
                );
              }}
            >
              Export both versions
            </Button>
            <p className="tiny muted">
              Compare the exported draft with the latest saved entry and reopen
              it to apply reviewed changes. No automatic overwrite.
            </p>
          </Modal>
        )}
        {session && (<SessionGate key={c.id+session.id} uid={data.uid} client={c.id} session={session.id} preview={isPreview} visible={modal==="session"} onLease={token=>{sessionLeaseToken.current=token}} onClose={()=>setModal(null)}>{modal === "session" && (
          <WorkoutLogger
            session={session}
            setSession={setSession}
            timer={timer}
            setTimer={setTimer}
            busy={busy}
            history={workouts}
            onSkipLegs={async () => {
              if(isPreview){notify("Sign in to save Gym Cell points.");return false;}
              const recordId=`leg-skip:${c.id}:${session.date}`,old=featureRecords.find(r=>r.id===recordId);
              const response=await fetch("/api/records",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"save",id:recordId,client:c.id,kind:"leg-skip",version:old?.version||0,data:{date:session.date,name:"Leg skip bonus"}})});
              if(!response.ok)return false;await refresh(c.id);return true;
            }}
            onDiscard={discardSession}
            onVideo={(exercise) => {
              setVideoExercise(exercise);
              setVideoDate(session.date);
              setVideoFile(null);
              setModal("exerciseVideos");
            }}
            onClose={() => setModal(null)}
            onFinish={async () => {
              if(finishWorkoutLock.current===session.id)return;
              finishWorkoutLock.current=session.id;
              try {
              const pr = session.sets.some(
                (s: any) =>
                  s.completed &&
                  !s.warmup &&
                  Number(s.weight || 0) > 0 &&
                  !workouts
                    .flatMap((w) => w.sets || [])
                    .some(
                      (old: any) =>
                        old.exerciseId === s.exerciseId &&
                        Number(old.weight || 0) >= Number(s.weight || 0),
                    ),
              );
              if (await mutate("workout", { value: session })) {
                try{localStorage.removeItem("form-draft-" + data.uid + "-" + c.id);}catch{}
                void deviceDelete("draft:" + data.uid + ":" + c.id).catch(()=>{});
                setSession(null);
                setTimer(0);
                setDraft({workout:structuredClone(session),finished:true});
                setModal("workoutTemplateReview");
                if (pr)
                  notify("Personal record! You set a new best logged load.");
                try {
                  const sr = await fetch("/api/social"),
                    sd = (await sr.json()) as any;
                  if (canPairOwnProfile && sd.profile?.auto_share_workouts) {
                    const shared = {
                      name: session.name,
                      date: session.date,
                      sets: [],
                    };
                    await fetch("/api/social", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        action: "post",
                        audience: "friends",
                        kind: "workout",
                        body: `Completed ${session.name} · ${session.sets.filter((x: any) => x.completed && !x.warmup).length} working sets`,
                        workout: shared,
                      }),
                    });
                    notify("Workout saved and shared with your friends.");
                  }
                } catch {}
              }
              } finally {if(finishWorkoutLock.current===session.id)finishWorkoutLock.current=null;}
            }}
          />
        )}</SessionGate>)}
        {modal && modal !== "session" && modal !== "navigation" && (
          <Modal
            foodSearch={modal === "foodSearch"}
            foodDetail={modal === "meal" || modal === "foodScan" || modal === "dailyNutrients"}
            title={
              {
                foodScan: draft.food?.name || "Scan or add food",
                meal: draft.name || "Log a meal",
                mealSummary: mealSummaryGroup + " nutrition",
                mealGroups: "Manage meal groups",
                workoutTemplateReview: draft.finished?"Workout saved · template options":"Copy workout to template",
                dailyNutrients: "Daily nutrients",
                foodEstimate: "Describe your food",
                foodBuilder: (draft.initial?"Edit ":"Create ")+(draft.kind||"meal"),
                fastFood: "I want fast food",
                supermarket: "Supermarket budget meals",
                diaryNote: "Diary note",
                forecast: "Progress projection",
                client: "Add a client",
                renameProfile: "Your profile name",
                log: "Daily check-in",
                targets: "Personal targets",
                exercise: "Edit exercise",
                day: "Edit training day",
                session: session?.name || "Workout",
                template: "Save program template",
                applyTemplate: "Choose a starting point",
                invite: "Connect your client",
                join: "Join your coach",
                photo: "Add progress photo",
                exerciseVideos:
                  "Form video history · " + (videoExercise?.name || "Exercise"),
                reminders: "Daily reminders",
                workspace: "Your workspace",
                integration: draft.name + " connection",
                import: "Import history",
              }[modal] || ""
            }
            close={() =>
              setModal(modal === "exerciseVideos" && session ? "session" : null)
            }
          >
            <React.Suspense fallback={<p className="tiny muted" role="status">Opening food tools…</p>}>
            {modal === "diaryNote" && <form onSubmit={async (event) => {
              event.preventDefault();
              await mutate("log", {date: calorieDay, expectedUpdated: calorieLog?.updated || null, value: {...calorieLog?.data, notes: draft.notes || ""}});
            }}>
              <p className="tiny muted">{calorieDay} · Saved with your daily check-in.</p>
              <label className="field"><span>Note</span><textarea aria-label="Daily diary note" maxLength={2000} rows={6} value={draft.notes || ""} placeholder="Hunger, energy, meal notes or anything to remember…" onChange={(event) => setDraft({...draft, notes: event.target.value})}/></label>
              <Button type="submit" kind="primary" disabled={busy || isPreview}>{busy ? "Saving…" : "Save note"}</Button>
            </form>}
            {modal === "workoutTemplateReview" && draft.workout && (()=>{
              const workout=draft.workout as Workout;
              const planIndex=c.plan.findIndex(day=>'plan:'+day.day===workout.templateId);
              const source=data.workoutTemplates.find(template=>template.id===workout.templateId)||(planIndex>=0&&canEdit?{id:workout.templateId!,name:c.plan[planIndex].name,exercises:c.plan[planIndex].exercises,version:c.version,legacy:true}:undefined);
              return <WorkoutTemplateReview key={workout.id} workout={workout} source={source} sourceVersion={workout.templateVersion} finished={!!draft.finished} preview={isPreview} onClose={()=>setModal(null)} onView={()=>{setModal(null);setTab("Training");}} onSave={async(value,action)=>{
                if(action==='update'&&source?.legacy){if(!canEdit)return false;return mutate("plan",{value:c.plan.map((day,index)=>index===planIndex?{...day,name:value.name,exercises:value.exercises}:day),version:workout.templateVersion},true);}
                return mutate("workoutTemplate",{value,version:value.version},true);
              }}/>;
            })()}
            {modal === "mealGroups" && <MealGroupEditor client={c.id} groups={foodGroups} version={featureRecords.find(row=>row.kind==='meal-group-settings')?.version||0} preview={isPreview} onApplied={async()=>{await refresh(c.id);setModal(null);}}/>}
            {modal === "foodBuilder" && <FoodBuilder key={foodDraftKey(data.uid,c.id,draft.kind||"meal",draft.initial?.id||draft.resumeInitialId)} draftKey={foodDraftKey(data.uid,c.id,draft.kind||"meal",draft.initial?.id||draft.resumeInitialId)} kind={draft.kind||"meal"} initial={draft.initial} savedFoods={data.savedFoods} meals={clientMeals} date={calorieDay} groups={foodGroups} preview={isPreview} onSave={value=>mutate("saveMeal",{value},true)} onLog={async value=>{const result=await mutate("meal",{value},true);if(result)setMealSections(sections=>({...sections,[value.category]:true}));return !!result;}}/>}
            {modal === "supermarket" && <SupermarketFinder key={c.id+calorieDay} client={c.id} date={calorieDay} groups={foodGroups} targets={calorieTargets} consumed={calorieTotals} records={featureRecords} preview={isPreview} onSave={async value=>{const saved=await mutate("meal",{value},true);if(saved)setMealSections(sections=>({...sections,[value.category]:true}));return !!saved;}}/>}
            {modal === "fastFood" && <FastFoodPicker key={c.id+calorieDay} date={calorieDay} groups={foodGroups} targets={calorieTargets} consumed={calorieTotals} preview={isPreview} onSave={async value=>{const saved=await mutate("meal",{value},true);if(saved)setMealSections(sections=>({...sections,[value.category]:true}));return !!saved;}}/>}
            {modal === "foodEstimate" && <FoodEstimator key={c.id + calorieDay} client={c.id} date={calorieDay} groups={foodGroups} preview={isPreview} onSave={async (value) => {const saved = await mutate("meal", {value}, true); if(saved)setMealSections(sections => ({...sections,[value.category]:true})); return !!saved;}}/>}
            {modal === "dailyNutrients" && <DailyNutrients date={calorieDay} meals={todayMeals} targets={calorieTargets}/>}
            {modal === "mealSummary" && (
              <div className="meal-summary-modal">
                <div className="meal-summary-hero">
                  <span>{selectedMealEntries.length} food{selectedMealEntries.length===1?"":"s"}</span>
                  <b>{fmt(selectedMealNutrition.calories)} <small>kcal</small></b>
                  <p>{fmt(selectedMealNutrition.protein,1)} g protein · {fmt(selectedMealNutrition.carbs,1)} g carbs · {fmt(selectedMealNutrition.fat,1)} g fat</p>
                </div>
                <div className="meal-summary-macros">
                  {[['Protein',selectedMealNutrition.protein,'macro-protein'],['Carbs',selectedMealNutrition.carbs,'macro-carbs'],['Fat',selectedMealNutrition.fat,'macro-fat']].map(([label,value,tone])=><div key={String(label)}><span>{label}</span><b>{fmt(Number(value),1)} g</b><i className={String(tone)}><em style={{width:Math.min(100,Number(value)/(Math.max(selectedMealNutrition.protein,selectedMealNutrition.carbs,selectedMealNutrition.fat,1))*100)+'%'}}/></i></div>)}
                </div>
                <div className="meal-summary-foods">{selectedMealEntries.map(m=><div key={m.id}><span>{m.data.name}</span><b>{fmt(m.data.calories)} kcal</b></div>)}</div>
                <div className="meal-micro-heading"><div><h3>Micronutrients</h3><p>{selectedMealNutrition.knownMicros} nutrients have data for this meal{selectedMealNutrition.estimatedNutrients.length?` · ${selectedMealNutrition.estimatedNutrients.length} include estimates`:''}.</p></div></div>
                <div className="meal-micro-groups">{Object.entries(nutrientGroups).map(([group,nutrients])=><details key={group} open={group==='General'||group==='Vitamins'||group==='Minerals'}><summary>{group}</summary><div>{nutrients.map(([key,label,unit])=>{const value=selectedMealNutrition.nutrients[key],estimated=selectedMealNutrition.estimatedNutrients.includes(key);return <p key={key} className={(typeof value==='number'?'':'unknown')+(estimated?' estimated':'')}><span>{label}{estimated&&<small className="estimated-badge"> · includes estimate</small>}</span><b>{typeof value==='number'?`${fmt(value,value<10?2:1)} ${unit}`:'No data'}</b></p>})}</div></details>)}</div>
                <p className="tiny muted">Totals use values stored with each logged food. Estimates come from the similar source food named in that entry. “No data” is not counted as zero.</p>
              </div>
            )}
            {modal === "forecast" && (
              <Forecast draft={draft} setDraft={setDraft} />
            )}
            {modal === "meal" && !draft.name && !draft.saveForLater && !manualFoodEntry && (
              <section
                className="food-add-chooser"
                aria-label="Ways to add food"
              >
                <p className="muted">
                  Choose the quickest way to find your food.
                </p>
                <div className="food-add-options">
                  <button
                    type="button"
                    className="food-add-option"
                    onClick={() => openFoodScan(true)}
                  >
                    <Camera size={26} />
                    <b>Take a picture of barcode</b>
                    <span>Open the rear camera and scan the package</span>
                  </button>
                  <button
                    type="button"
                    className="food-add-option"
                    onClick={() => openFoodScan(false)}
                  >
                    <ScanLine size={26} />
                    <b>Type a barcode</b>
                    <span>Enter the 8–14 digit number from the package</span>
                  </button>
                  <button
                    type="button"
                    className="food-add-option"
                    onClick={() => {
                      setFoodQuery("");
                      setFoodResults([]);
                      setFoodLookupStatus("Search by food, product or brand.");
                      setModal("foodSearch");
                    }}
                  >
                    <Search size={26} />
                    <b>Search food</b>
                    <span>Search your foods and the public food database</span>
                  </button>
                  <button
                    type="button"
                    className="food-add-option"
                    onClick={() => setManualFoodEntry(true)}
                  >
                    <FileText size={26} />
                    <b>Enter manually</b>
                    <span>Add nutrition from a food label</span>
                  </button>
                </div>
              </section>
            )}
            {modal === "foodSearch" && <FoodSearch
              viewKey={data.uid+":"+c.id+":food-search"}
              savedFoods={searchSavedFoods}
              meals={clientMeals}
              date={calorieDay}
              groups={foodGroups}
              initialQuery={foodQuery}
              initialGroup={preferredMealGroup(foodGroups,draft.category)}
              preview={isPreview}
              onChoose={chooseFood}
              onScan={() => openFoodScan(true)}
              onClose={() => setModal(null)}
              onResults={setFoodResults}
              onManual={(name) => {
                setDraft({id: crypto.randomUUID(), date: calorieDay, name, category: preferredMealGroup(foodGroups,draft.category), calories: NaN, protein: NaN, carbs: NaN, fat: NaN, notes: ""});
                setManualFoodEntry(true);
                setModal("meal");
              }}
              onSave={async (value) => {
                const saved = await mutate("meal", {value}, true);
                if (saved) setMealSections((sections) => ({...sections, [value.category]: true}));
                return !!saved;
              }}
            />}
            {modal === "exerciseVideos" && videoExercise && (
              <div>
                <p className="muted">
                  Upload one clip after each session. Clips stay grouped by
                  exercise so you can compare technique over time.
                </p>
                <label className="upload video-upload">
                  <Video size={24} />
                  <b>{videoFile?.name || "Choose a set video"}</b>
                  <small>MP4, MOV or WebM · maximum 25 MB</small>
                  <input
                    type="file"
                    accept="video/mp4,video/quicktime,video/webm"
                    onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                  />
                </label>
                <div className="row between video-upload-actions">
                  <Field
                    label="Session date"
                    type="date"
                    value={videoDate || today}
                    onChange={(v: string) => setVideoDate(v)}
                  />
                  <Button
                    kind="primary"
                    disabled={!videoFile || busy || isPreview}
                    onClick={uploadExerciseVideo}
                  >
                    <Upload size={14} />
                    {busy ? "Uploading…" : "Upload video"}
                  </Button>
                </div>
                <h3 className="form-section">Previous sessions</h3>
                {data.exerciseVideos.filter(
                  (v) =>
                    v.client === c.id && v.exercise_id === videoExercise.id,
                ).length ? (
                  <div className="video-history">
                    {data.exerciseVideos
                      .filter(
                        (v) =>
                          v.client === c.id &&
                          v.exercise_id === videoExercise.id,
                      )
                      .map((v) => (
                        <article className="video-card" key={v.id}>
                          <video
                            controls
                            preload="metadata"
                            src={
                              "/api/exercise-video?id=" +
                              encodeURIComponent(v.id)
                            }
                            aria-label={
                              videoExercise.name + " set recorded " + v.date
                            }
                          />
                          <div className="row between">
                            <div>
                              <b>{v.exercise_name}</b>
                              <small>
                                {v.date} ·{" "}
                                {new Date(v.created).toLocaleDateString()}
                              </small>
                            </div>
                            <button
                              className="icon"
                              aria-label="Delete video"
                              onClick={async () => {
                                if (!confirm("Delete this form video?")) return;
                                const r = await fetch("/api/exercise-video", {
                                  method: "DELETE",
                                  headers: {
                                    "Content-Type": "application/json",
                                  },
                                  body: JSON.stringify({ id: v.id }),
                                });
                                if (r.ok) refresh(c.id);
                                else notify("Could not delete video");
                              }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </article>
                      ))}
                  </div>
                ) : (
                  <Empty
                    title="No clips for this exercise yet"
                    text="Record a set in a similar position and compare it with later sessions."
                  />
                )}
                {isPreview && (
                  <p className="tiny muted">
                    Uploads are disabled in this read-only demo.
                  </p>
                )}
              </div>
            )}
            {modal === "foodScan" && (
              <form className="food-scan-form" onSubmit={logScannedFood}>
                <p className="muted">
                  Scan a product barcode, or enter its number. If it is not in
                  the lookup, add a label photo and save the nutrition to your
                  own food list.
                </p>
                <div className={`food-camera${scannerOn ? " scanning" : ""}`}>
                  <div className="food-camera-preview">
                    <video
                      ref={scannerVideo}
                      playsInline
                      muted
                      aria-label="Food code camera preview"
                    />
                    {scannerOn && (
                      <div className="barcode-scan-guide" aria-hidden="true">
                        <span />
                      </div>
                    )}
                  </div>
                  <div className="row wrap">
                    <Button
                      type="button"
                      onClick={() => {
                        if (isPreview) {
                          setFoodBarcode("9300000000000");
                          void findFood("9300000000000");
                        } else {
                          setFoodLookupStatus("Opening camera…");
                          setScannerOn(true);
                        }
                      }}
                      disabled={scannerOn}
                    >
                      <ScanLine size={15} />
                      {scannerOn
                        ? "Scanning…"
                        : isPreview
                          ? "Load demo product"
                          : "Scan with camera"}
                    </Button>
                    {scannerOn && (
                      <Button type="button" onClick={() => setScannerOn(false)}>
                        Stop camera
                      </Button>
                    )}
                    {scannerOn && torchSupported && (
                      <Button type="button" onClick={async () => {
                        const track = scannerTrack.current;
                        if (!track || track.readyState !== "live") return;
                        try {
                          const next = !torchOn;
                          await track.applyConstraints({ advanced: [{ torch: next } as MediaTrackConstraintSet] });
                          if (scannerTrack.current === track) setTorchOn(next);
                        } catch {
                          setFoodLookupStatus("This camera could not switch the torch. Try brighter lighting; scanning is still active.");
                        }
                      }}>
                        {torchOn ? "Turn torch off" : "Turn torch on"}
                      </Button>
                    )}
                  </div>
                </div>
                <div className="form-grid food-code-row">
                  <Field
                    label="Barcode number"
                    value={foodBarcode}
                    placeholder="Scan or type 8–14 digits"
                    onChange={(v: string) => {
                      setFoodBarcode(v);
                      setDraft((d: any) => ({
                        ...d,
                        food: { ...d.food, barcode: v },
                      }));
                    }}
                  />
                  <Button type="button" onClick={() => findFood()}>
                    <Search size={15} />
                    Look up food
                  </Button>
                </div>
                <p className="tiny food-lookup-status" role="status">
                  {foodLookupStatus}
                </p>
                {draft.returnToFoodSearch&&<button className="text-btn" type="button" onClick={()=>setModal("foodSearch")}><ArrowLeft size={16}/>Back to food search</button>}
                <Field
                  label="Food name"
                  value={draft.food?.name || ""}
                  required
                  onChange={(v: string) =>
                    setDraft({ ...draft, food: { ...draft.food, name: v } })
                  }
                />
                <React.Suspense
                  fallback={<p className="tiny muted">Loading tool…</p>}
                >
                  <FoodNutritionEditor
                    value={draft}
                    onChange={setDraft}
                    targets={calorieTargets}
                    scanned
                    groups={foodGroups}
                    similarFoods={[...foodResults,...data.savedFoods.map((food:any)=>({...food,...(food.nutrition?.reference||{}),servingSize:food.serving_size||food.servingSize,source:food.nutrition?.reference?.source||"My saved foods"}))]}
                  />
                </React.Suspense>
                <div className="food-photo-grid">
                  <label className="upload">
                    <Camera size={18} />
                    <b>
                      {foodFrontFile?.name || "Front of package (optional)"}
                    </b>
                    <small>
                      Helps identify the product · photo is not stored
                    </small>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={(e) =>
                        setFoodFrontFile(e.target.files?.[0] || null)
                      }
                    />
                  </label>
                  <label className="upload">
                    <ScanLine size={18} />
                    <b>{foodLabelFile?.name || "Nutrition label photo"}</b>
                    <small>
                      Read serving size and calories/macros · photo is not
                      stored
                    </small>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={(e) =>
                        setFoodLabelFile(e.target.files?.[0] || null)
                      }
                    />
                  </label>
                </div>
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    checked={foodConsent}
                    onChange={(e) => setFoodConsent(e.target.checked)}
                  />
                  I agree to send selected food-label photos to the configured
                  AI service to read the printed nutrition. Photos are not saved
                  by Form.
                </label>
                <Button
                  type="button"
                  disabled={busy || !foodLabelFile || !foodConsent || isPreview}
                  onClick={extractFoodLabel}
                >
                  <BrainCircuit size={15} />
                  {busy ? "Reading label…" : "Read nutrition label"}
                </Button>
                {!isPreview && (
                  <label className="toggle-label">
                    <input
                      type="checkbox"
                      checked={!!draft.food?.saveToFoods}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          food: {
                            ...draft.food,
                            saveToFoods: e.target.checked,
                          },
                        })
                      }
                    />
                    Save this food in my food list
                    {foodBarcode ? " and link its barcode" : ""}
                  </label>
                )}
                <div className="modal-actions">
                  <Button
                    kind="primary"
                    type="submit"
                    disabled={busy || !draft.food?.name || isPreview}
                  >
                    <Utensils size={15} />
                    Log food
                  </Button>
                </div>
              </form>
            )}
            {modal === "meal" && (manualFoodEntry || !!draft.name || !!draft.saveForLater) && (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    const value = prepareMeal(draft);
                    if (await mutate("meal", { value }, true)) {
                      if (draft.saveForLater)
                        await mutate("saveMeal", { value }, true);
                      setMealSections((s) => ({
                        ...s,
                        [preferredMealGroup(foodGroups,value.category)]: true,
                      }));
                      setModal(null);
                    }
                  } catch (error: any) {
                    notify(
                      error.message || "Check food amounts before saving.",
                    );
                  }
                }}
              >
                <div className="form-grid">
                  <Field
                    label="Meal / food name"
                    value={draft.name}
                    required
                    onChange={(v: string) => setDraft({ ...draft, name: v })}
                  />
                  <Field
                    label="Date"
                    type="date"
                    required
                    value={draft.date}
                    onChange={(v: string) => setDraft({ ...draft, date: v })}
                  />
                </div>
                <React.Suspense
                  fallback={<p className="tiny muted">Loading tool…</p>}
                >
                  <FoodNutritionEditor
                    value={draft}
                    onChange={setDraft}
                    targets={calorieTargets}
                    groups={foodGroups}
                    similarFoods={[...foodResults,...data.savedFoods.map((food:any)=>({...food,...(food.nutrition?.reference||{}),servingSize:food.serving_size||food.servingSize,source:food.nutrition?.reference?.source||"My saved foods"}))]}
                  />
                </React.Suspense>
                <Field
                  label="Portions / ingredients / notes"
                  value={draft.notes}
                  onChange={(v: string) => setDraft({ ...draft, notes: v })}
                />
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    checked={!!draft.saveForLater}
                    onChange={(e) =>
                      setDraft({ ...draft, saveForLater: e.target.checked })
                    }
                  />
                  Also save this meal for reuse
                </label>
                <div className="modal-actions">
                  <Button
                    kind="primary"
                    type="submit"
                    disabled={busy || isPreview}
                  >
                    Save meal
                  </Button>
                </div>
              </form>
            )}
            {modal === "renameProfile" && <form onSubmit={async event=>{event.preventDefault();await mutate("renamePersonal",{name:draft.name,version:c.version});}}><p className="muted">Change your personal profile name. Your saved workouts, meals and progress stay with this profile.</p><Field label="Your name" value={draft.name||""} required onChange={(value:string)=>setDraft({...draft,name:value})}/><Button type="submit" kind="primary" disabled={busy||!draft.name?.trim()}>Save profile name</Button></form>}
            {modal === "personalProfile" && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  mutate("personal", { name: draft.name }, false);
                }}
              >
                <p className="muted">
                  This profile belongs to you. Use it for your own workouts,
                  nutrition, health data, and progress. A coach is optional.
                </p>
                <Field
                  label="Profile name"
                  value={draft.name}
                  required
                  onChange={(v: string) => setDraft({ ...draft, name: v })}
                />
                <div className="modal-actions">
                  <Button type="submit" kind="primary" disabled={busy}>
                    <Plus size={15} />
                    Create personal profile
                  </Button>
                </div>
              </form>
            )}
            {modal === "client" && (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  await mutate("create", draft);
                }}
              >
                <div className="form-grid">
                  <Field
                    label="Client name"
                    value={draft.name}
                    onChange={(v: string) => setDraft({ ...draft, name: v })}
                    required
                  />
                  <Field
                    label="Client email (optional)"
                    type="email"
                    value={draft.email}
                    onChange={(v: string) => setDraft({ ...draft, email: v })}
                  />
                </div>
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    checked={draft.sample}
                    onChange={(e) =>
                      setDraft({ ...draft, sample: e.target.checked })
                    }
                  />
                  Start with a copy of Jamie’s program
                </label>
                <p className="muted tiny">
                  This creates an independent plan. You can change everything
                  later. No email is sent automatically.
                </p>
                <div className="modal-actions">
                  <Button type="submit" kind="primary" disabled={busy}>
                    Create client <ArrowRight size={16} />
                  </Button>
                </div>
              </form>
            )}
            {modal === "log" && (
              <form
                className="tracking-surface daily-tracking-form"
                onSubmit={async (e) => {
                  e.preventDefault();
                  const { date, _updated, ...value } = draft;
                  await mutate("log", {
                    date,
                    value,
                    expectedUpdated: _updated ?? null,
                  });
                }}
              >
                <Field
                  label="Log date"
                  type="date"
                  value={draft.date}
                  onChange={(v: string) => {
                    const found = data.logs.find((l) => l.client === c?.id && l.date === v);
                    setDraft({
                      date: v,
                      _updated: found?.updated || null,
                      ...(found?.data || { notes: "", checkin: false }),
                    });
                  }}
                  required
                />
                <TrackingEditor value={draft} onChange={setDraft} />
                <label className="field">
                  <span>How are things feeling?</span>
                  <textarea
                    value={draft.notes || ""}
                    onChange={(e) =>
                      setDraft({ ...draft, notes: e.target.value })
                    }
                    maxLength={2000}
                    placeholder="Wins, challenges, recovery or anything your coach should know…"
                  />
                </label>
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    checked={!!draft.checkin}
                    onChange={(e) =>
                      setDraft({ ...draft, checkin: e.target.checked })
                    }
                  />
                  Submit as a weekly check-in for review
                </label>
                <div className="modal-actions">
                  <Button type="submit" kind="primary" disabled={busy}>
                    <Save size={16} />
                    Save check-in
                  </Button>
                </div>
              </form>
            )}
            {modal === "targets" && (
              <form
                className="tracking-surface targets-tracking-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  mutate("targets", { value: draft, version: c.version });
                }}
              >
                <MacroTargets
                  value={draft}
                  onChange={(v) => setDraft({ ...draft, ...v })}
                />
                <Field
                  label="Goal"
                  value={draft.goal}
                  onChange={(v: string) => setDraft({ ...draft, goal: v })}
                />
                <div className="form-grid three">
                  {Object.entries({
                    steps: "Steps",
                    cardio: "Incline minutes",
                    sleep: "Sleep (hours)",
                    water: "Water (L)",
                    height: "Height (cm)",
                    startWeight: "Start weight (kg)",
                    bodyFat: "Body fat estimate (%)",
                    maintenance: "Maintenance estimate",
                    goalWeight: "Goal weight (0 = unset)",
                  }).map(([key, label]) => (
                    <Field
                      key={key}
                      label={label}
                      type="number"
                      min="0"
                      step="any"
                      required
                      value={draft[key]}
                      onChange={(v: string) =>
                        setDraft({ ...draft, [key]: Number(v) })
                      }
                    />
                  ))}
                </div>
                <p className="tiny muted">
                  Macro energy:{" "}
                  {Math.round(
                    draft.protein * 4 + draft.carbs * 4 + draft.fat * 9,
                  )}{" "}
                  kcal. Set each target intentionally.
                </p>
                <div className="form-grid">
                  <Field
                    label="Review date"
                    type="date"
                    value={draft.goalDate}
                    onChange={(v: string) =>
                      setDraft({ ...draft, goalDate: v })
                    }
                  />
                  <Field
                    label="Time zone"
                    value={draft.timezone}
                    onChange={(v: string) =>
                      setDraft({ ...draft, timezone: v })
                    }
                  />
                </div>
                <div className="modal-actions">
                  <Button kind="primary" type="submit" disabled={busy}>
                    Save personal targets
                  </Button>
                </div>
              </form>
            )}
            {modal === "exercise" && (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const p = structuredClone(c.plan);
                  const { index, ...exercise } = draft;
                  if (index < 0) p[day].exercises.push(exercise);
                  else p[day].exercises[index] = exercise;
                  if (await savePlan(p)) setModal(null);
                }}
              >
                <Field
                  label="Exercise name"
                  value={draft.name}
                  required
                  onChange={(v: string) => setDraft({ ...draft, name: v })}
                />
                <label className="field">
                  <span>Primary muscle for tracking</span>
                  <select
                    value={draft.muscle}
                    onChange={(e) =>
                      setDraft({ ...draft, muscle: e.target.value,primaryMuscles:[e.target.value],secondaryMuscles:[],muscleOverride:true })
                    }
                  >
                    {muscles.map((m) => (
                      <option key={m}>{m}</option>
                    ))}
                  </select>
                </label>
                <ExerciseMuscles exercise={draft} onChange={patch=>setDraft({...draft,...patch})}/><div className="form-grid">
                  <label className="field">
                    <span>Equipment</span>
                    <select
                      value={draft.equipment || "free-weight"}
                      onChange={(e) =>
                        setDraft({ ...draft, equipment: e.target.value })
                      }
                    >
                      {[
                        ["free-weight", "Free weight"],
                        ["machine", "Machine"],
                        ["cable", "Cable"],
                        ["bodyweight", "Body weight"],
                        ["banded", "Banded"],
                        ["other", "Other"],
                      ].map(([v, label]) => (
                        <option key={v} value={v}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="toggle-label">
                    <input
                      type="checkbox"
                      checked={!!draft.gymPin}
                      onChange={(e) =>
                        setDraft({ ...draft, gymPin: e.target.checked })
                      }
                    />
                    Track a gym pin by default
                  </label>
                </div>
                <div className="form-grid three">
                  {[
                    ["sets", "Working sets"],
                    ["min", "Minimum reps"],
                    ["max", "Maximum reps"],
                  ].map(([key, label]) => (
                    <Field
                      key={key}
                      label={label}
                      value={draft[key]}
                      type="number"
                      min="1"
                      max={key === "sets" ? 12 : 100}
                      required
                      onChange={(v: string) =>
                        setDraft({ ...draft, [key]: Number(v) })
                      }
                    />
                  ))}
                </div>
                <Field
                  label="Coaching notes / alternatives"
                  value={draft.note}
                  onChange={(v: string) => setDraft({ ...draft, note: v })}
                />
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    checked={draft.optional}
                    onChange={(e) =>
                      setDraft({ ...draft, optional: e.target.checked })
                    }
                  />
                  Optional exercise
                </label>
                {draft.index >= 0 && (
                  <div className="row">
                    <Button
                      disabled={draft.index === 0 || busy}
                      onClick={async () => {
                        const p = structuredClone(c.plan),
                          i = draft.index;
                        [p[day].exercises[i - 1], p[day].exercises[i]] = [
                          p[day].exercises[i],
                          p[day].exercises[i - 1],
                        ];
                        if (await savePlan(p))
                          setDraft({ ...draft, index: i - 1 });
                      }}
                    >
                      <ChevronLeft size={14} />
                      Move earlier
                    </Button>
                    <Button
                      disabled={
                        draft.index === c.plan[day].exercises.length - 1 || busy
                      }
                      onClick={async () => {
                        const p = structuredClone(c.plan),
                          i = draft.index;
                        [p[day].exercises[i + 1], p[day].exercises[i]] = [
                          p[day].exercises[i],
                          p[day].exercises[i + 1],
                        ];
                        if (await savePlan(p))
                          setDraft({ ...draft, index: i + 1 });
                      }}
                    >
                      Move later
                      <ChevronRight size={14} />
                    </Button>
                  </div>
                )}
                <div className="modal-actions">
                  {draft.index >= 0 && (
                    <Button
                      kind="danger"
                      onClick={async () => {
                        const p = structuredClone(c.plan);
                        p[day].exercises.splice(draft.index, 1);
                        if (await savePlan(p)) setModal(null);
                      }}
                    >
                      <Trash2 size={15} />
                      Remove
                    </Button>
                  )}
                  <Button kind="primary" type="submit" disabled={busy}>
                    Save exercise
                  </Button>
                </div>
              </form>
            )}
            {modal === "day" && (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const p = structuredClone(c.plan);
                  p[day].name = draft.name;
                  if (await savePlan(p)) setModal(null);
                }}
              >
                <Field
                  label="Session name"
                  value={draft.name}
                  required
                  onChange={(v: string) => setDraft({ ...draft, name: v })}
                />
                <div className="modal-actions">
                  <Button kind="primary" type="submit">
                    Save day
                  </Button>
                </div>
              </form>
            )}

            {modal === "template" && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  mutate("template", { name: draft.name, plan: c.plan });
                }}
              >
                <Field
                  label="Template name"
                  value={draft.name}
                  required
                  onChange={(v: string) => setDraft({ ...draft, name: v })}
                />
                <p className="muted">
                  Saves an independent reusable copy of this full week. Create
                  as many workout templates as you need; future edits won’t
                  change assigned clients.
                </p>
                <div className="modal-actions">
                  <Button type="submit" kind="primary">
                    Save template
                  </Button>
                </div>
              </form>
            )}
            {modal === "applyTemplate" && (
              <div>
                {[
                  {
                    id: "jamie",
                    name: "Jamie’s example · Lower / Upper / Weak point",
                    plan: samplePlan,
                  },
                  ...data.templates,
                ].map((t) => (
                  <button
                    className="template-option"
                    key={t.id}
                    onClick={async () => {
                      if (
                        confirm(
                          "Replace this client’s current weekly plan? Completed workouts are preserved.",
                        ) &&
                        (await savePlan(structuredClone(t.plan)))
                      )
                        setModal(null);
                    }}
                  >
                    <BookOpen size={18} />
                    {t.name}
                    <ArrowRight size={17} />
                  </button>
                ))}
              </div>
            )}
            {modal === "invite" && (
              <div>
                <p className="muted">
                  This link connects one signed-in account to {c.name} with
                  explicit consent. It expires in seven days. Client email
                  restrictions apply when an email is set.
                </p>
                {invite ? (
                  <>
                    <input className="invite-input" readOnly value={invite} />
                    <Button
                      kind="primary"
                      onClick={() =>
                        navigator.clipboard
                          .writeText(invite)
                          .then(() => notify("Invitation copied"))
                          .catch(() =>
                            notify("Select and copy the link above."),
                          )
                      }
                    >
                      <Copy size={16} />
                      Copy invitation
                    </Button>
                  </>
                ) : (
                  <p>
                    {busy
                      ? "Creating secure invitation…"
                      : "Sign in to generate an invitation."}
                  </p>
                )}
                <p className="notice">
                  The workspace is private until site access is configured for
                  your clients. This link alone does not grant access to a
                  private site.
                </p>
              </div>
            )}
            {modal === "join" && (
              <div>
                <p className="muted">
                  Connect with your coach to view your program and share your
                  logged training, nutrition, measurements and progress photos.
                </p>
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                  />
                  I agree to share the records I log in this profile with my
                  coach.
                </label>
                <p className="tiny muted">
                  You can disconnect in Connections. Previously shared coaching
                  records remain until deleted by the coach.
                </p>
                {isPreview ? (
                  <a
                    className="btn primary"
                    href={
                      "/signin?return_to=" +
                      encodeURIComponent("/?join=" + join)
                    }
                    target="_top"
                  >
                    Sign in to join
                  </a>
                ) : (
                  <Button
                    kind="primary"
                    disabled={!consent || busy}
                    onClick={() =>
                      mutate("join", { token: join, consent: true })
                    }
                  >
                    Accept invitation
                  </Button>
                )}
              </div>
            )}
            {modal === "photo" && (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (isPreview) {
                    notify("Photo uploads need a signed-in workspace");
                    return;
                  }
                  if (!photoFile) return;
                  setBusy(true);
                  try {
                    const f = new FormData();
                    f.append("client", c.id);
                    f.append("date", draft.date);
                    f.append("view", draft.view);
                    f.append("file", photoFile);
                    const r = await fetch("/api/photo", {
                      method: "POST",
                      body: f,
                    });
                    const d = (await r.json()) as any;
                    if (!r.ok) throw new Error(d.error);
                    await refresh(c.id);
                    setModal(null);
                    notify("Photo saved privately");
                  } catch (e: any) {
                    notify(e.message);
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                <div className="form-grid">
                  <Field
                    label="Photo date"
                    type="date"
                    value={draft.date}
                    required
                    onChange={(v: string) => setDraft({ ...draft, date: v })}
                  />
                  <label className="field">
                    <span>Angle</span>
                    <select
                      value={draft.view}
                      onChange={(e) =>
                        setDraft({ ...draft, view: e.target.value })
                      }
                    >
                      {["Front", "Side", "Back"].map((v) => (
                        <option key={v}>{v}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <label className="upload">
                  <Camera size={28} />
                  <b>{photoFile?.name || "Choose a progress photo"}</b>
                  <small>JPEG, PNG or WebP · maximum 5 MB</small>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                    required
                  />
                </label>
                <div className="modal-actions">
                  <Button type="submit" kind="primary" disabled={busy}>
                    Save private photo
                  </Button>
                </div>
              </form>
            )}
            {modal === "reminders" && (
              <div>
                <p className="muted">
                  Add a repeating morning weigh-in and daily-log reminder to
                  your calendar. Calendar alerts are controlled by your device;
                  web push is not enabled in this build.
                </p>
                <Field
                  label="Daily reminder time"
                  type="time"
                  value={draft.time}
                  onChange={(v: string) => setDraft({ ...draft, time: v })}
                />
                <div className="modal-actions">
                  <Button
                    kind="primary"
                    onClick={() => {
                      const start =
                        today.replaceAll("-", "") +
                        "T" +
                        draft.time.replace(":", "") +
                        "00";
                      download(
                        "form-daily-reminder.ics",
                        [
                          "BEGIN:VCALENDAR",
                          "VERSION:2.0",
                          "PRODID:-//Form Coaching//Reminders//EN",
                          "BEGIN:VEVENT",
                          "UID:" + crypto.randomUUID() + "@form",
                          "DTSTAMP:" +
                            new Date()
                              .toISOString()
                              .replaceAll("-", "")
                              .replaceAll(":", "")
                              .replace(/\.\d{3}/, ""),
                          "DTSTART:" + start,
                          "RRULE:FREQ=DAILY",
                          "SUMMARY:Form - weigh in and track your day",
                          "DESCRIPTION:Record morning weight. Review nutrition steps sleep and training in Form.",
                          "BEGIN:VALARM",
                          "TRIGGER:PT0M",
                          "ACTION:DISPLAY",
                          "DESCRIPTION:Your daily Form check-in",
                          "END:VALARM",
                          "END:VEVENT",
                          "END:VCALENDAR",
                        ].join("\r\n"),
                        "text/calendar",
                      );
                      notify(
                        "Calendar reminder downloaded; import it into your calendar.",
                      );
                    }}
                  >
                    <Download size={16} />
                    Download daily reminder
                  </Button>
                </div>
              </div>
            )}
            {modal === "workspace" && (
              <div>
                <AppearanceSettings />
                <p className="muted">
                  {isPreview
                    ? "You are exploring sample data. Sign in to use persistent client records."
                    : data.email}
                </p>
                <section className="experience-setting">
                  <div>
                    <b>Experience mode</b>
                    <small>Choose how much of Form you want on screen.</small>
                  </div>
                  <div className="experience-options">
                    <button
                      className={experienceMode === "casual" ? "selected" : ""}
                      aria-pressed={experienceMode === "casual"}
                      onClick={() => {
                        setExperienceMode("casual");
                        setTab("Home");
                        localStorage.setItem("form-experience-mode", "casual");
                      }}
                    >
                      Casual Lifter Mode
                    </button>
                    <button
                      className={experienceMode === "science" ? "selected" : ""}
                      aria-pressed={experienceMode === "science"}
                      onClick={() => {
                        setExperienceMode("science");
                        setTab("Home");
                        localStorage.setItem("form-experience-mode", "science");
                      }}
                    >
                      Science-Based Lifter Mode
                    </button>
                  </div>
                </section>
                <div className="settings-options">
                  {!isPreview && isSelfProfile && isCoach && <Button onClick={()=>{setDraft({name:c.name});setModal("renameProfile");}}>Edit my profile name</Button>}
                  <Button
                    onClick={() => {
                      const light = !document.body.classList.contains("light-theme");
                      setPreferences({...preferences,theme:light?"light":"dark"});
                      notify(
                        light ? "Light theme enabled" : "Dark theme enabled",
                      );
                    }}
                  >
                    {preferences.theme === "light" || preferences.theme === "system" && typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: light)").matches
                      ? "Use dark theme"
                      : "Use light theme"}
                  </Button>
                  <Button
                    onClick={() => {
                      setMode(mode === "coach" ? "client" : "coach");
                      setTab("Home");
                      setModal(null);
                    }}
                  >
                    Switch to{" "}
                    {mode === "coach" ? "client preview" : "coach view"}
                  </Button>
                  {isPreview ? (
                    <a className="btn primary" href="/signin" target="_top">
                      Sign in
                    </a>
                  ) : (
                    <a className="btn" href="/signout" target="_top">
                      Sign out <LogOut size={16} />
                    </a>
                  )}
                  {canEdit && (
                    <Button
                      kind="danger"
                      onClick={() => {
                        if (
                          confirm(
                            "Permanently delete this client and their logs? Export first if needed.",
                          )
                        )
                          mutate("delete");
                      }}
                    >
                      <Trash2 size={15} />
                      Delete selected client
                    </Button>
                  )}
                </div>
              </div>
            )}
            {modal === "integration" && (
              <div>
                <div className="notice">
                  {draft.name === "Apple Watch"
                    ? "Apple Watch → Apple Health → iPhone companion"
                    : draft.name === "Samsung Health"
                      ? "Galaxy Watch → Samsung Health → Health Connect → Android companion"
                      : draft.name === "Fitbit / Google Health"
                        ? "Fitbit / Google Health → supported Health Connect or OAuth route → phone companion"
                        : draft.name === "Xiaomi / Mi Fitness"
                          ? "Xiaomi wearable → Mi Fitness → supported health platform → phone companion"
                          : "Apple Health export → Metrics page"}
                </div>
                <p className="muted">
                  {draft.name === "Apple Watch"
                    ? "This web app cannot read HealthKit directly. Live syncing needs a native iPhone app with the Apple Health capability and client-granted permissions; Apple Health export import works on Metrics."
                    : draft.name === "Samsung Health"
                      ? "The web app cannot read Android Health Connect directly. Samsung Health must be enabled to share selected data with Health Connect, and a native Android companion must request permission and send approved records to this account."
                      : draft.name === "Fitbit / Google Health"
                        ? "Fitbit and Google Health data need the provider-approved OAuth setup or a native Android companion that reads the client’s permitted Health Connect records. Neither connection is active in this demo."
                        : draft.name === "Xiaomi / Mi Fitness"
                          ? "Enable a supported third-party sync option in Mi Fitness, then let the native phone companion read the selected data after permission is granted. Compatibility and available data vary by device and app version."
                          : "Use the client’s Apple Health export to import supported readings on the Metrics page."}
                </p>
                <p className="muted">
                  Connection status stays off until the native bridge or
                  registered provider connection is configured and the client
                  approves access.
                </p>
              </div>
            )}
            </React.Suspense>
          </Modal>
        )}
      </div>
    </ExerciseProfileContext.Provider></GymEquipmentContext.Provider>
  );
}
function PanelHead({ title, sub, right }: any) {
  return (
    <div className="panel-head">
      <div>
        <h3>{title}</h3>
        {sub && <p>{sub}</p>}
      </div>
      {right}
    </div>
  );
}
function Stat({ label, value, unit, icon, foot, accent, progress }: any) {
  return (
    <section className={"stat " + (accent ? "accent" : "")}>
      <div className="stat-top">
        <span>{label}</span>
        {icon}
      </div>
      <div className="stat-value">
        {value}
        <small>{unit}</small>
      </div>
      <div className="stat-foot">
        {accent ? <ArrowDownRight size={14} /> : null}
        {foot}
      </div>
      {progress != null && (
        <div className="bar">
          <i
            style={{ width: Math.min(100, Math.max(0, progress * 100)) + "%" }}
          />
        </div>
      )}
    </section>
  );
}
function Forecast({ draft, setDraft }: any) {
  const days = Math.max(
      0,
      Math.round((Date.parse(draft.end) - Date.parse(draft.start)) / 86400000),
    ),
    deficit = draft.maintenance - draft.intake,
    loss = (days * deficit) / 7700,
    endWeight = draft.weight - loss,
    fat = (draft.weight * draft.bf) / 100;
  const valid =
    Number.isFinite(days) &&
    days > 0 &&
    days <= 365 &&
    draft.weight > 0 &&
    draft.bf > 0 &&
    draft.bf < 75 &&
    deficit > 0 &&
    endWeight > 0 &&
    fat > loss;
  const bf = (fraction: number, l: number) =>
    (100 * (fat - l * fraction)) / (draft.weight - l);
  const marks = Array.from(
    new Set([0, Math.min(14, days), Math.min(28, days), days]),
  ).sort((a, b) => a - b);
  return (
    <div>
      <p className="muted">
        An editable arithmetic scenario, not a guaranteed outcome. Enter a
        weight and body-fat estimate from the same starting date.
      </p>
      <div className="form-grid">
        {[
          ["weight", "Starting weight (kg)"],
          ["bf", "Starting body fat (%)"],
          ["maintenance", "Estimated maintenance (kcal)"],
          ["intake", "Daily intake (kcal)"],
        ].map(([key, label]) => (
          <Field
            key={key}
            label={label}
            type="number"
            min="0"
            step="any"
            value={draft[key]}
            onChange={(v: string) => setDraft({ ...draft, [key]: Number(v) })}
          />
        ))}
        <Field
          label="Starting date"
          type="date"
          value={draft.start}
          onChange={(v: string) => setDraft({ ...draft, start: v })}
        />
        <Field
          label="Review date"
          type="date"
          value={draft.end}
          onChange={(v: string) => setDraft({ ...draft, end: v })}
        />
      </div>
      {valid ? (
        <>
          <div className="forecast-summary">
            <div>
              <span>Projected weight</span>
              <b>{endWeight.toFixed(1)} kg</b>
            </div>
            <div>
              <span>Body fat if 90–100% of loss is fat</span>
              <b>
                {bf(1, loss).toFixed(1)}–{bf(0.9, loss).toFixed(1)}%
              </b>
            </div>
          </div>
          <ResponsiveTable>
            <table>
              <thead>
                <tr>
                  <th>DATE</th>
                  <th>WEIGHT</th>
                  <th>BODY FAT SCENARIO</th>
                </tr>
              </thead>
              <tbody>
                {marks.map((n) => {
                  const l = (n * deficit) / 7700;
                  return (
                    <tr key={n}>
                      <td>{shiftDate(draft.start, n)}</td>
                      <td>{(draft.weight - l).toFixed(1)} kg</td>
                      <td>
                        {bf(1, l).toFixed(1)}–{bf(0.9, l).toFixed(1)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </ResponsiveTable>
          <p className="tiny muted" style={{ marginTop: 17 }}>
            Uses a fixed {Math.round(deficit)} kcal daily deficit and a rough
            7,700 kcal/kg shortcut. Maintenance already includes activity. The
            range only reflects the selected fat-loss split, not prediction
            confidence. Water, glycogen and changing energy expenditure are not
            modeled; no muscle-loss guarantee is implied. Reassess using
            observed trends.
          </p>
        </>
      ) : (
        <div className="notice">
          Enter a valid future review date within one year, a positive deficit
          and a scenario that leaves positive fat mass. This calculator models
          fat-loss scenarios only.
        </div>
      )}
    </div>
  );
}
