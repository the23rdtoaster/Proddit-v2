export const mockUser = {
  user_id: 'u1',
  username: 'terralex',
  email: 'alex@example.com',
  persona: 'college_student',
  conservation_category: 'waste_management',
  role: 'terraformer',
  individual_hp: 82,
  xp: 3450,
  level: 6,
  credit_score: 712,
  credit_delta: +15,
  prodcoins: 1850,
  streak_count: 23,
  impact_trees_planted: 4,
  impact_waste_kg: 18.5,
  impact_events_attended: 3,
  task_description: 'Segregate household waste daily and walk to college instead of taking an auto',
  hours_per_day: 1.5,
  days_per_week: 6,
};

export const mockSquad = {
  squad_id: 'sq1',
  name: 'Green Frontier',
  conservation_focus: 'waste_management',
  squad_hp: 74,
  member_count: 5,
  total_impact_score: 312,
  cause_label: 'Mumbai Beach Cleanup Crew',
};

export const mockMembers = [
  { user_id: 'u1', username: 'terralex', role: 'terraformer', streak_count: 23, individual_hp: 82, today_status: 'done', avatar_color: '#5A7A63', xp: 3450 },
  { user_id: 'u2', username: 'marina_h', role: 'hydromancer', streak_count: 14, individual_hp: 91, today_status: 'done', avatar_color: '#4A7A8A', xp: 2900 },
  { user_id: 'u3', username: 'rootsy', role: 'herbalist', streak_count: 8, individual_hp: 65, today_status: 'pending', avatar_color: '#7A6A3A', xp: 1800 },
  { user_id: 'u4', username: 'leafrunner', role: 'ranger', streak_count: 31, individual_hp: 95, today_status: 'done', avatar_color: '#5A8A5A', xp: 4200 },
  { user_id: 'u5', username: 'solhealer', role: 'healer', streak_count: 5, individual_hp: 50, today_status: 'missed', avatar_color: '#8A5A7A', xp: 1200 },
];

export const mockForum = [
  {
    post_id: 'p1',
    author: { username: 'leafrunner', role: 'ranger', avatar_color: '#5A8A5A' },
    content_text: "Collected 2kg of plastic from the jogging path this morning 🌿 Feels great!",
    proof_emoji: '♻️',
    ai_verdict: 'pass',
    ai_confidence: 0.91,
    reactions: { '🌱': 4, '♻️': 3, '🐝': 1 },
    time: '8 min ago',
    is_check_in: true,
  },
  {
    post_id: 'p2',
    author: { username: 'marina_h', role: 'hydromancer', avatar_color: '#4A7A8A' },
    content_text: "Fixed the dripping faucet in our lab! That was probably wasting 30L a day.",
    proof_emoji: '💧',
    ai_verdict: 'pass',
    ai_confidence: 0.87,
    reactions: { '💧': 6, '🌊': 2, '☀️': 1 },
    time: '1 hr ago',
    is_check_in: true,
  },
  {
    post_id: 'sys1',
    is_system: true,
    system_type: 'bloom_bomb',
    content_text: '🌿 @rootsy sent a Bloom Bomb — check in before midnight!',
    time: '2 hr ago',
  },
  {
    post_id: 'p3',
    author: { username: 'terralex', role: 'terraformer', avatar_color: '#5A7A63' },
    content_text: "Planted a sapling in the community park today with @leafrunner.",
    proof_emoji: '🌱',
    ai_verdict: 'pass',
    ai_confidence: 0.78,
    reactions: { '🌱': 8, '🌍': 3 },
    time: '3 hr ago',
    is_check_in: false,
  },
  {
    post_id: 'sys2',
    is_system: true,
    system_type: 'flag',
    content_text: '⚠️ A squad member\'s proof was flagged. Verification pending.',
    time: '5 hr ago',
  },
];

export const mockItems = [
  { item_id: 'i1', item_type: "Terraformer's Bulwark", rarity: 'legendary', class_locked: 'terraformer', icon: '🛡️', decay_pct: 72, used: false, description: 'Earthwall usable twice today' },
  { item_id: 'i2', item_type: 'HP Potion', rarity: 'common', class_locked: null, icon: '🧪', decay_pct: 45, used: false, description: 'Restores 15 HP instantly' },
  { item_id: 'i3', item_type: 'Streak Freeze', rarity: 'rare', class_locked: null, icon: '❄️', decay_pct: 90, used: false, description: 'Prevents streak loss for 1 day' },
  { item_id: 'i4', item_type: 'Shield', rarity: 'common', class_locked: null, icon: '🌿', decay_pct: 20, used: false, description: 'Blocks next HP damage event' },
];

export const mockShop = [
  { reward_id: 'r1', name: 'Wildflower Seed Packet', description: 'Grow a pollinator garden at home. Supports local bee populations.', coin_cost: 300, category: 'seeds_plants', icon: '🌸', stock: null },
  { reward_id: 'r2', name: 'Plant-Based Soap Bar', description: 'No synthetic chemicals. Biodegradable, zero plastic packaging.', coin_cost: 350, category: 'reusable_goods', icon: '🧼', stock: 48 },
  { reward_id: 'r3', name: 'Bamboo Straw Set', description: 'Set of 6 reusable bamboo straws with a cleaning brush.', coin_cost: 400, category: 'reusable_goods', icon: '🥤', stock: 22 },
  { reward_id: 'r4', name: 'Sapling & Seed Kit', description: 'Everything you need to plant your first tree. Includes sapling + guide.', coin_cost: 500, category: 'seeds_plants', icon: '🌱', stock: 15 },
  { reward_id: 'r5', name: 'Eco-Notebook', description: '100% recycled paper. Soy-based ink. Perfect for daily journaling.', coin_cost: 600, category: 'education_kits', icon: '📓', stock: null },
  { reward_id: 'r6', name: 'Proddit Tote Bag', description: 'Organic cotton tote. Replace 500+ plastic bags over its lifetime.', coin_cost: 800, category: 'apparel', icon: '👜', stock: 30 },
  { reward_id: 'r7', name: 'Reusable Water Bottle', description: 'Stainless steel, vacuum insulated. Replaces ~1000 single-use bottles.', coin_cost: 1200, category: 'reusable_goods', icon: '🍶', stock: 10 },
  { reward_id: 'r8', name: 'Local Partner Voucher', description: 'Redeemable at partner eco-stores in your area. Valid 6 months.', coin_cost: 750, category: 'local_partner', icon: '🏪', stock: null },
];

export const mockLeaderboard = [
  { user_id: 'u4', username: 'leafrunner', role: 'ranger', credit_score: 894, streak_count: 31, impact_score: 248, guardian: true, category: 'biodiversity', avatar_color: '#5A8A5A' },
  { user_id: 'u6', username: 'compost_kai', role: 'healer', credit_score: 871, streak_count: 28, impact_score: 220, guardian: true, category: 'food_sustainability', avatar_color: '#8A7A3A' },
  { user_id: 'u7', username: 'wavebreak', role: 'hydromancer', credit_score: 845, streak_count: 22, impact_score: 195, guardian: false, category: 'water_conservation', avatar_color: '#3A7A8A' },
  { user_id: 'u2', username: 'marina_h', role: 'hydromancer', credit_score: 802, streak_count: 14, impact_score: 180, guardian: false, category: 'water_conservation', avatar_color: '#4A7A8A' },
  { user_id: 'u1', username: 'terralex', role: 'terraformer', credit_score: 712, streak_count: 23, impact_score: 142, guardian: false, category: 'waste_management', avatar_color: '#5A7A63' },
  { user_id: 'u8', username: 'solarpetal', role: 'herbalist', credit_score: 680, streak_count: 17, impact_score: 130, guardian: false, category: 'energy_efficiency', avatar_color: '#9A7A3A' },
  { user_id: 'u3', username: 'rootsy', role: 'herbalist', credit_score: 634, streak_count: 8, impact_score: 95, guardian: false, category: 'waste_management', avatar_color: '#7A6A3A' },
  { user_id: 'u5', username: 'solhealer', role: 'healer', credit_score: 501, streak_count: 5, impact_score: 60, guardian: false, category: 'community_education', avatar_color: '#8A5A7A' },
];

export const mockTrades = {
  active: [
    { trade_id: 't1', initiator: { username: 'leafrunner', avatar: '#5A8A5A' }, offered_item: { icon: '📍', name: "Ranger's Compass", rarity: 'rare' }, offered_coins: 0, requested_item: { icon: '🛡️', name: "Terraformer's Bulwark", rarity: 'legendary' }, status: 'pending', time: '30 min ago' },
    { trade_id: 't2', initiator: { username: 'marina_h', avatar: '#4A7A8A' }, offered_item: { icon: '💊', name: "Healer's Salve", rarity: 'rare' }, offered_coins: 50, requested_item: null, status: 'pending', time: '2 hr ago' },
  ],
  history: [
    { trade_id: 't3', initiator: { username: 'rootsy', avatar: '#7A6A3A' }, offered_item: { icon: '❄️', name: 'Streak Freeze', rarity: 'rare' }, status: 'accepted', time: '1 day ago' },
    { trade_id: 't4', initiator: { username: 'terralex', avatar: '#5A7A63' }, offered_item: { icon: '🌿', name: 'Shield', rarity: 'common' }, status: 'declined', time: '2 days ago' },
  ],
};

export const ROLES = {
  terraformer:  { icon: '⛰️', color: '#7A5A3A', ability: 'Earthwall', cooldown: 'Daily', desc: 'Blocks next squad HP damage event' },
  healer:       { icon: '💚', color: '#3A8A5A', ability: 'Mend',      cooldown: 'Daily', desc: 'Restores 10–15 HP to squad bar' },
  ranger:       { icon: '🌿', color: '#4A7A4A', ability: 'Seed Share', cooldown: 'Weekly', desc: 'Duplicates an item from a squadmate' },
  herbalist:    { icon: '🌸', color: '#8A5A7A', ability: 'Bloom Bomb', cooldown: 'Daily', desc: 'Sends a forced nudge to all squadmates' },
  hydromancer:  { icon: '💧', color: '#3A6A8A', ability: 'Tidal Surge', cooldown: 'Daily', desc: '2× ProdCoins on check-ins before noon' },
};

export const CATEGORIES = [
  { key: 'waste_management', label: 'Waste Management', icon: '♻️', desc: 'Reduce, reuse, recycle' },
  { key: 'water_conservation', label: 'Water Conservation', icon: '💧', desc: 'Protect our water resources' },
  { key: 'energy_efficiency', label: 'Energy Efficiency', icon: '⚡', desc: 'Use less, save more' },
  { key: 'biodiversity', label: 'Biodiversity', icon: '🌿', desc: 'Protect local ecosystems' },
  { key: 'climate_action', label: 'Climate Action', icon: '🌍', desc: 'Stand up for the planet' },
  { key: 'sustainable_transport', label: 'Sustainable Transport', icon: '🚲', desc: 'Move greener every day' },
  { key: 'food_sustainability', label: 'Food Sustainability', icon: '🥗', desc: 'Eat and grow responsibly' },
  { key: 'community_education', label: 'Community Education', icon: '📚', desc: 'Spread the green message' },
];

export const mockGoals = [
  { goal_id: 'g1', title: 'Compost daily for 30 days', conservation_category: 'food_sustainability', target_days: 30, progress_days: 18, completed: false },
  { goal_id: 'g2', title: 'Walk to college for 2 weeks', conservation_category: 'sustainable_transport', target_days: 14, progress_days: 14, completed: true },
  { goal_id: 'g3', title: 'Zero single-use plastic for a week', conservation_category: 'waste_management', target_days: 7, progress_days: 3, completed: false },
];
