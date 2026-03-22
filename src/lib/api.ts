const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

/** Set a token directly (used by demo login) */
export function setAuthToken(token: string) {
  if (typeof window !== "undefined") {
    sessionStorage.setItem("stride_demo_token", token);
  }
}

/** Clear cached token (used by logout) */
export function clearAuthToken() {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem("stride_demo_token");
  }
}

export async function getAuthToken(): Promise<string | null> {
  // Check sessionStorage for demo token first (most up to date for this window)
  if (typeof window !== "undefined") {
    const stored = sessionStorage.getItem("stride_demo_token");
    if (stored) return stored;
  }

  // ONLY try Better Auth if we are NOT in a demo flow
  // (In this project, we prefer demo tokens if they exist)
  try {
    const res = await fetch("/api/auth/token", {
      credentials: "include",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { token?: string };
    if (data.token) {
      return data.token;
    }
  } catch {
    // Fall through — token unavailable
  }
  return null;
}

async function fetchAPI<T>(path: string, options?: RequestInit): Promise<T> {
  const token = await getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string>),
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({ detail: res.statusText }))) as { detail?: string };
    throw new Error(err.detail ?? res.statusText);
  }
  return res.json() as Promise<T>;
}

// ─── Auth ───
export const auth = {
  me: () => fetchAPI<AuthUser>("/auth/me"),
  sync: () => fetchAPI<AuthUser>("/auth/sync", { method: "POST" }),
};

// ─── Onboarding ───
export const onboarding = {
  status: () => fetchAPI<OnboardingStatus>("/onboarding/status"),
  profile: () => fetchAPI<OnboardingProfile>("/onboarding/financial-profile"),
  updateStep: (step: number, data: Record<string, unknown>) =>
    fetchAPI<OnboardingProfile>(`/onboarding/step/${step}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  generateMock: () =>
    fetchAPI<{ message: string; count: number }>("/onboarding/generate-mock", {
      method: "POST",
    }),
};

// ─── Cards (Swipe) ───
export const cards = {
  today: () => fetchAPI<CardDeck>("/cards/today"),
  swipe: (cardId: string, direction: "right" | "left") =>
    fetchAPI<Card>(`/cards/${cardId}/swipe`, {
      method: "POST",
      body: JSON.stringify({ direction }),
    }),
  dismiss: (cardId: string) =>
    fetchAPI<{ message: string }>(`/cards/${cardId}/dismiss`, { method: "POST" }),
  answer: (cardId: string, data: { selected_index?: number; choice?: string }) =>
    fetchAPI<{ correct: boolean; explanation: string; xp_awarded: number }>(
      `/cards/${cardId}/answer`, { method: "POST", body: JSON.stringify(data) },
    ),
  history: (days = 30) => fetchAPI<Card[]>(`/cards/history?days=${days}`),
  stats: () => fetchAPI<CardStats>("/cards/stats"),
};

// ─── Intents (Spend Check) ───
export const intents = {
  evaluate: (merchant: string, amount: number, category?: string) =>
    fetchAPI<IntentEvaluation>("/intents/evaluate", {
      method: "POST",
      body: JSON.stringify({ merchant, amount, category }),
    }),
  action: (intentId: string, action: "accept" | "override" | "cancel") =>
    fetchAPI<IntentActionResult>(`/intents/${intentId}/action`, {
      method: "POST",
      body: JSON.stringify({ action }),
    }),
  history: (limit = 20) => fetchAPI<IntentHistoryItem[]>(`/intents/history?limit=${limit}`),
  stats: () => fetchAPI<IntentStats>("/intents/stats"),
};

// ─── Decisions ───
export const decisions = {
  streamEvaluate: async (type: string, title: string, customPrompt?: string, parameters?: Record<string, unknown>) => {
    const token = await getAuthToken();
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;
    return fetch(`${API_BASE}/decisions/evaluate/stream`, {
      method: "POST",
      headers,
      credentials: "include",
      body: JSON.stringify({ decision_type: type, title, custom_prompt: customPrompt, parameters }),
    });
  },
  list: () => fetchAPI<DecisionSummary[]>("/decisions/"),
  templates: () => fetchAPI<DecisionTemplate[]>("/decisions/templates"),
  get: (id: string) => fetchAPI<DecisionDetail>(`/decisions/${id}`),
};

// ─── Goals ───
export const goals = {
  list: () => fetchAPI<SavingsGoal[]>("/goals/"),
  create: (name: string, targetAmount: number, targetDate?: string) =>
    fetchAPI<SavingsGoal>("/goals/", {
      method: "POST",
      body: JSON.stringify({ name, target_amount: targetAmount, target_date: targetDate }),
    }),
  update: (id: string, data: Partial<{ name: string; target_amount: number; target_date: string; is_active: boolean }>) =>
    fetchAPI<SavingsGoal>(`/goals/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: string) => fetchAPI<{ message: string }>(`/goals/${id}`, { method: "DELETE" }),
  deposit: (id: string, amount: number) =>
    fetchAPI<SavingsGoal>(`/goals/${id}/deposit`, {
      method: "POST",
      body: JSON.stringify({ amount }),
    }),
};

// ─── Transactions ───
export const transactions = {
  list: (params?: { page?: number; page_size?: number; category?: string; date_from?: string; date_to?: string }) => {
    const q = new URLSearchParams();
    if (params?.page) q.set("page", String(params.page));
    if (params?.page_size) q.set("page_size", String(params.page_size));
    if (params?.category) q.set("category", params.category);
    if (params?.date_from) q.set("date_from", params.date_from);
    if (params?.date_to) q.set("date_to", params.date_to);
    return fetchAPI<TransactionList>(`/transactions/?${q}`);
  },
  summary: (dateFrom?: string, dateTo?: string) => {
    const q = new URLSearchParams();
    if (dateFrom) q.set("date_from", dateFrom);
    if (dateTo) q.set("date_to", dateTo);
    return fetchAPI<CategorySummary[]>(`/transactions/summary?${q}`);
  },
  recurring: () => fetchAPI<RecurringTransaction[]>("/transactions/recurring"),
  categories: () => fetchAPI<CategorySummary[]>("/transactions/categories"),
  updateCategory: (id: string, category: string, createRule = false) =>
    fetchAPI<{ message: string }>(`/transactions/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ category, create_rule: createRule }),
    }),
};

// ─── Ghost Spend ───
export const ghostSpend = {
  list: () => fetchAPI<RecurringTransaction[]>("/ghost-spend/"),
  flag: (id: string) => fetchAPI<{ message: string }>(`/ghost-spend/${id}/flag`, { method: "POST" }),
  keep: (id: string) => fetchAPI<{ message: string }>(`/ghost-spend/${id}/keep`, { method: "POST" }),
  savingsPotential: () => fetchAPI<GhostSavingsPotential>("/ghost-spend/savings-potential"),
};

// ─── Projections ───
export const projections = {
  wealthPath: (years = 20) => fetchAPI<WealthPath>(`/projections/wealth-path?years=${years}`),
  whatIf: (amount: number, isRecurring = false) =>
    fetchAPI<WhatIfProjection>(`/projections/what-if?amount=${amount}&is_recurring=${isRecurring}`),
  cardImpact: (cardId: string) => fetchAPI<WhatIfProjection>(`/projections/card/${cardId}/impact`),
  summary: () => fetchAPI<ProjectionSummary>("/projections/summary"),
  wealthCompare: (years = 20) => fetchAPI<WealthCompareResponse>(`/projections/wealth-compare?years=${years}`),
};

export type ReactionUpdateResponse = {
  message?: string;
  reactions?: FeedReaction[];
  data?: { reactions?: FeedReaction[] };
  items?: FeedReaction[];
};

// ─── Social ───
export const social = {
  friends: () => fetchAPI<Friend[]>("/social/friends"),
  feed: (limit = 20) => fetchAPI<FeedItem[]>(`/social/feed?limit=${limit}`),
  searchUsers: (query: string) => fetchAPI<Friend[]>(`/social/users/search?q=${encodeURIComponent(query)}`),
  listRequests: (direction: "received" | "sent") =>
    fetchAPI<FriendRequest[]>(`/social/friends/requests?direction=${direction}`),
  sendRequest: (toUserId: string) =>
    fetchAPI<FriendRequest>("/social/friends/request", {
      method: "POST",
      body: JSON.stringify({ to_user_id: toUserId }),
    }),
  acceptRequest: (requestId: string) =>
    fetchAPI<{ message: string }>(`/social/friends/request/${requestId}/accept`, { method: "POST" }),
  rejectRequest: (requestId: string) =>
    fetchAPI<{ message: string }>(`/social/friends/request/${requestId}/reject`, { method: "POST" }),
  toggleReaction: (itemId: string, emoji: string) =>
    fetchAPI<ReactionUpdateResponse | FeedReaction[]>(`/social/feed/${itemId}/react?emoji=${encodeURIComponent(emoji)}`, { method: "POST" }),
  unfriend: (userId: string) =>
    fetchAPI<{ message: string }>(`/social/friends/${userId}`, { method: "DELETE" }),
};

// ─── Squads ───
export const squads = {
  list: () => fetchAPI<Squad[]>("/squads/"),
  create: (name: string) =>
    fetchAPI<Squad>("/squads/", { method: "POST", body: JSON.stringify({ name }) }),
  join: (inviteCode: string) =>
    fetchAPI<Squad>("/squads/join", {
      method: "POST",
      body: JSON.stringify({ invite_code: inviteCode }),
    }),
  get: (id: string) => fetchAPI<SquadDetail>(`/squads/${id}`),
  leave: (id: string) => fetchAPI<{ message: string }>(`/squads/${id}/leave`, { method: "POST" }),
  delete: (id: string) => fetchAPI<{ message: string }>(`/squads/${id}`, { method: "DELETE" }),
  getMessages: (id: string) => fetchAPI<SquadMessageResponse[]>(`/squads/${id}/messages`),
};

// ─── Challenges ───
export const challenges = {
  list: () => fetchAPI<Challenge[]>("/challenges/"),
  active: () => fetchAPI<Challenge[]>("/challenges/active"),
  create: (data: { title: string; challenge_type: string; start_date: string; end_date: string; description?: string; squad_id?: string }) =>
    fetchAPI<Challenge>("/challenges/", { method: "POST", body: JSON.stringify(data) }),
  join: (id: string) => fetchAPI<{ message: string }>(`/challenges/${id}/join`, { method: "POST" }),
  get: (id: string) => fetchAPI<ChallengeDetail>(`/challenges/${id}`),
  progress: (id: string) => fetchAPI<ChallengeProgress>(`/challenges/${id}/progress`),
};

// ─── Gamification ───
export const gamification = {
  streaks: () => fetchAPI<Streak[]>("/gamification/streaks"),
  milestones: () => fetchAPI<Milestone[]>("/gamification/milestones"),
  xp: () => fetchAPI<XPInfo>("/gamification/xp"),
  leaderboard: () => fetchAPI<Leaderboard>("/gamification/leaderboard"),
};

// ─── Benchmarks ───
export const benchmarks = {
  spending: () => fetchAPI<SpendingBenchmark[]>("/benchmarks/spending"),
  ranking: () => fetchAPI<RankingBenchmark[]>("/benchmarks/ranking"),
  insight: (data: { category: string; your_spend: number; peer_avg: number; peer_median: number; peer_p25: number; peer_p75: number; diff_pct: number; status: string }) =>
    fetchAPI<{ insight: string; category: string }>("/benchmarks/insight", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// ─── Learning ───
export const learning = {
  modules: (topic?: string) => {
    const q = topic ? `?topic=${topic}` : "";
    return fetchAPI<LearningModule[]>(`/learning/modules${q}`);
  },
  get: (id: string) => fetchAPI<LearningModuleDetail>(`/learning/modules/${id}`),
  complete: (id: string) =>
    fetchAPI<{ message: string; xp_awarded: number }>(`/learning/modules/${id}/complete`, { method: "POST" }),
  progress: () => fetchAPI<LearningProgress>("/learning/progress"),
};

// ─── Debrief ───
export const debrief = {
  generate: () => fetchAPI<Debrief>("/debrief/generate", { method: "POST" }),
  latest: () => fetchAPI<Debrief | null>("/debrief/latest"),
  history: () => fetchAPI<Debrief[]>("/debrief/history"),
};

// ─── Ingestion ───
export const ingestion = {
  upload: async (files: File[]) => {
    const token = await getAuthToken();
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}/ingestion/upload`, {
      method: "POST",
      body: formData,
      headers,
      credentials: "include",
    });

    if (!res.ok) {
      const err = (await res.json().catch(() => ({ detail: res.statusText }))) as { detail?: string };
      throw new Error(err.detail ?? res.statusText);
    }

    return res.json() as Promise<IngestionResponse>;
  },
};

// ─── Habit Exchange ───
export const habitExchange = {
  portfolio: () => fetchAPI<HabitPortfolio>("/habit-exchange/portfolio"),
  prices: () => fetchAPI<HabitPrices>("/habit-exchange/prices"),
  trade: (fromToken: string, toToken: string, amount: number) =>
    fetchAPI<HabitTradeResult>("/habit-exchange/trade", {
      method: "POST",
      body: JSON.stringify({ from_token: fromToken, to_token: toToken, amount }),
    }),
  convert: (tokenType: string, amount: number) =>
    fetchAPI<{ success: boolean; xp_awarded: number; message: string }>("/habit-exchange/convert", {
      method: "POST",
      body: JSON.stringify({ token_type: tokenType, amount }),
    }),
  spendItems: () => fetchAPI<HabitSpendItem[]>("/habit-exchange/spend-items"),
  spend: (itemId: string) =>
    fetchAPI<{ success: boolean; message: string }>("/habit-exchange/spend", {
      method: "POST",
      body: JSON.stringify({ item_id: itemId }),
    }),
  ledger: () => fetchAPI<HabitLedgerEntry[]>("/habit-exchange/ledger"),
  scenario: () => fetchAPI<HabitScenario>("/habit-exchange/scenario"),
  odds: () => fetchAPI<HabitOdds>("/habit-exchange/odds"),
};

// ─── Replays ───
export const replays = {
  latest: () => fetchAPI<WeeklyReplay>("/replays/latest"),
  history: () => fetchAPI<WeeklyReplay[]>("/replays/history"),
};

// ─── Types ───
export type IngestionResponse = {
  success: boolean;
  added_transactions_count: number;
  new_balance: number;
  message: string;
};
export type AuthUser = {
  id: string;
  clerk_id: string;
  email: string;
  display_name: string;
  age: number | null;
  income_bracket: string | null;
  risk_tolerance: string | null;
  region: string | null;
  onboarding_complete: boolean;
  balance: number;
  total_xp: number;
  current_streak_days: number;
  longest_streak_days: number;
  created_at: string;
};

export type OnboardingStatus = {
  onboarding_complete: boolean;
  has_profile: boolean;
  has_transactions: boolean;
  transaction_count: number;
  deep_onboarding_steps: Record<string, boolean>;
  deep_onboarding_complete: boolean;
};

export type OnboardingProfile = Record<string, unknown>;

export type Card = {
  id: string;
  user_id: string;
  card_type: string;
  title: string;
  body: string;
  detail_json: Record<string, unknown>;
  priority_score: number;
  potential_savings: number | null;
  action_type: string | null;
  action_payload: Record<string, unknown> | null;
  status: string;
  generated_date: string;
  swiped_at: string | null;
  created_at: string;
};

export type CardDeck = {
  cards: Card[];
  generated_date: string;
};

export type CardStats = {
  total_shown: number;
  total_swiped_right: number;
  total_swiped_left: number;
  acceptance_rate: number;
  by_type: Record<string, { shown: number; right: number; left: number }>;
};

export type IntentEvaluation = {
  id: string;
  decision: {
    status: "allow" | "reduce" | "block";
    approved_amount: number;
    original_amount: number;
    message: string;
  };
  agents: {
    name: string;
    vote: "allow" | "reduce" | "block";
    confidence: number;
    reason: string;
    suggested_amount: number | null;
    icon: string | null;
  }[];
  impact: {
    balance_after: number;
    goal_delay_days: number | null;
    weekly_budget_remaining: number | null;
    streak_status: string;
    opportunity_cost_5yr: number | null;
  };
  actions: string[];
};

export type IntentActionResult = {
  action: string;
  xp_awarded: number;
  money_saved: number;
  message: string;
};

export type IntentHistoryItem = {
  id: string;
  merchant: string;
  amount: number;
  resolved_status: string;
  approved_amount: number;
  user_action: string;
  money_saved: number;
  created_at: string;
};

export type IntentStats = {
  total_intents: number;
  accepted: number;
  overridden: number;
  cancelled: number;
  total_money_saved: number;
  acceptance_rate: number;
  cancel_rate: number;
};

export type DecisionSummary = {
  id: string;
  decision_type: string;
  title: string;
  status: string;
  created_at: string;
  completed_at: string | null;
};

export type DecisionTemplate = {
  decision_type: string;
  title: string;
  description: string;
  example_parameters: Record<string, unknown>;
};

export type DecisionDetail = {
  id: string;
  decision_type: string;
  title: string;
  status: string;
  agent_responses: {
    agent_role: string;
    response: Record<string, unknown>;
    model_used: string;
    processing_time_ms: number;
  }[];
  final_recommendation: {
    verdict: string;
    summary: string;
    action_items: string[];
  };
  total_processing_time_ms: number;
  created_at: string;
  completed_at: string | null;
};

export type SavingsGoal = {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date: string | null;
  is_active: boolean;
  created_at: string;
};

export type TransactionList = {
  transactions: Transaction[];
  total: number;
  page: number;
  page_size: number;
};

export type Transaction = {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  merchant_name: string | null;
  category: string;
  subcategory: string | null;
  date: string;
  description: string | null;
  is_recurring: boolean;
  source: string;
  created_at: string;
};

export type CategorySummary = {
  category: string;
  total: number;
  count: number;
  avg_per_transaction?: number;
};

export type RecurringTransaction = {
  id: string;
  merchant_name: string;
  typical_amount: number;
  last_amount: number;
  frequency: string;
  last_charged_date: string | null;
  next_expected_date: string | null;
  category: string | null;
  is_active: boolean;
  flagged_ghost: boolean;
  price_hike_detected: boolean;
  previous_amount: number | null;
};

export type GhostSavingsPotential = {
  ghost_count: number;
  monthly_savings: number;
  annual_savings: number;
};

export type WealthPath = {
  path: { month: number; year: number; balance: number; total_contributed: number; interest_earned: number }[];
  monthly_contribution: number;
  annual_rate: number;
  current_savings: number;
};

export type ScenarioProjection = {
  key: string;
  label: string;
  annual_rate: number;
  description: string;
  path: { month: number; year: number; balance: number; total_contributed: number; interest_earned: number }[];
};

export type WealthCompareResponse = {
  monthly_contribution: number;
  current_savings: number;
  scenarios: ScenarioProjection[];
};

export type WhatIfProjection = {
  projection_1yr: number;
  projection_5yr: number;
  projection_10yr: number;
  projection_20yr: number;
  is_recurring: boolean;
};

export type ProjectionSummary = {
  total_saved: number;
  total_potential: number;
  projected_1yr: number;
  projected_5yr: number;
  projected_10yr: number;
  monthly_savings_rate: number;
};

export type Friend = {
  id: string;
  display_name: string;
  current_streak_days: number;
  total_xp: number;
};

export type FriendRequest = {
  id: string;
  from_user_id: string;
  to_user_id: string;
  status: string;
  created_at: string;
  display_name?: string;
};

export type FeedReaction = {
  feed_item_id: string;
  user_id: string;
  emoji: string;
};

export type FeedItem = {
  id: string;
  user_id: string;
  display_name: string | null;
  event_type: string;
  message: string;
  detail_json: Record<string, unknown>;
  reactions: FeedReaction[];
  visibility: string;
  created_at: string;
};

export type Squad = {
  id: string;
  name: string;
  created_by: string;
  invite_code: string;
  member_count: number;
  created_at: string;
};

export type SquadDetail = Squad & {
  members: Friend[];
};

export type SquadMessageReaction = {
  message_id: string;
  user_id: string;
  display_name: string;
  emoji: string;
};

export type SquadMessageResponse = {
  id: string;
  squad_id: string;
  user_id: string;
  display_name: string;
  content: string;
  reactions: SquadMessageReaction[];
  created_at: string;
};

export type Challenge = {
  id: string;
  squad_id: string | null;
  title: string;
  description: string;
  challenge_type: string;
  rules_json: Record<string, unknown>;
  start_date: string;
  end_date: string;
  created_by: string;
  is_global: boolean;
  participant_count: number;
  created_at: string;
};

export type ChallengeDetail = Challenge & {
  participants: { user_id: string; display_name: string; status: string; progress: Record<string, unknown> }[];
};

export type ChallengeProgress = {
  challenge_id: string;
  user_id: string;
  status: string;
  progress_json: Record<string, unknown>;
  joined_at: string;
  completed_at: string | null;
};

export type Streak = {
  streak_type: string;
  current_count: number;
  longest_count: number;
  last_activity_date: string | null;
};

export type Milestone = {
  id: string;
  milestone_type: string;
  achieved_at: string;
  xp_awarded: number;
};

export type XPInfo = {
  total_xp: number;
  level: number;
  xp_to_next_level: number;
};

export type Leaderboard = {
  entries: { user_id: string; display_name: string; total_xp: number; current_streak_days: number }[];
  my_rank: number;
};

export type SpendingBenchmark = {
  category: string;
  your_spend: number;
  peer_avg: number;
  peer_p25: number;
  peer_p75: number;
  peer_median: number;
  sample_size: number;
  diff_pct: number;
  status: string;
};

export type RankingBenchmark = {
  category: string;
  your_spend: number;
  percentile: number;
  interpretation: string;
};

export type LearningModule = {
  id: string;
  slug: string;
  title: string;
  topic: string;
  difficulty: number;
  xp_reward: number;
  completed: boolean;
};

export type LearningModuleDetail = LearningModule & {
  content: string;
};

export type LearningProgress = {
  completed: number;
  total: number;
  completion_pct: number;
};

export type Debrief = {
  id: string;
  week_start: string;
  week_end: string;
  analyst_summary: {
    total_spent: number;
    top_categories: string[];
    trend: string;
    insight: string;
  };
  behaviorist_insights: {
    patterns: string[];
    triggers: string[];
    suggestion: string;
  };
  mentor_goals: {
    weekly_target: number;
    achieved: number;
    next_week_plan: string;
    encouragement: string;
  };
  created_at: string;
};

export type HabitSpendItem = {
  id: string;
  name: string;
  icon: string;
  cost_token: string;
  cost_amount: number;
  description: string;
  can_afford: boolean;
};

export type HabitLedgerEntry = {
  message: string;
  icon: string;
  time_ago: string;
};

export type HabitScenario = {
  scenario: string;
  insight?: string;
  category?: string;
  tokens_needed?: number;
  token_type?: string;
  real_cost?: number;
};

export type HabitOdds = {
  fortune_score: number;
  budget_odds: number;
  impulse_odds: number;
  savings_odds: number;
  risk_level: "low" | "medium" | "high";
};

export type HabitTokenBalance = {
  token_type: string;
  emoji: string;
  amount: number;
  price: number;
  value: number;
  change_pct: number;
};

export type HabitPortfolio = {
  balances: HabitTokenBalance[];
  total_value: number;
};

export type HabitPrices = {
  prices: Record<string, number>;
  changes: Record<string, number>;
  explanation: string;
};

export type HabitTradeResult = {
  success: boolean;
  from_amount: number;
  to_amount: number;
  message: string;
};

export type WeeklyReplay = {
  id?: string;
  week_start: string;
  week_end: string;
  total_cards?: number;
  cards_swiped_right: number;
  cards_swiped_left: number;
  actual?: number;
  missed?: number;
  actual_savings?: number;
  potential_savings?: number;
  projection_5yr?: number;
  projection_10yr?: number;
};
