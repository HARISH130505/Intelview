/**
 * Intelview — Prisma Database Seed
 * 27 tech companies, 18 topics, 60 questions
 */
import { PrismaClient, CompanyTier, Difficulty, QuestionType } from "@prisma/client";
const prisma = new PrismaClient();

const COMPANIES = [
  { name: "Google", slug: "google", tier: "FAANG" as CompanyTier, industry: "Technology", size: "100000+", headquarter: "Mountain View, CA", founded: 1998, description: "Global leader in internet search, cloud computing, and AI. Known for rigorous multi-round technical interviews." },
  { name: "Amazon", slug: "amazon", tier: "FAANG" as CompanyTier, industry: "E-Commerce & Cloud", size: "100000+", headquarter: "Seattle, WA", founded: 1994, description: "Global e-commerce and cloud giant (AWS). Interviews heavily test Leadership Principles alongside coding." },
  { name: "Meta", slug: "meta", tier: "FAANG" as CompanyTier, industry: "Social Media", size: "50000+", headquarter: "Menlo Park, CA", founded: 2004, description: "Creator of Facebook, Instagram, and WhatsApp. Interviews emphasize speed, optimal algorithms, and large-scale systems." },
  { name: "Apple", slug: "apple", tier: "FAANG" as CompanyTier, industry: "Consumer Technology", size: "100000+", headquarter: "Cupertino, CA", founded: 1976, description: "Design-focused tech giant. Interviews are team-specific and mix low-level system knowledge with product thinking." },
  { name: "Netflix", slug: "netflix", tier: "FAANG" as CompanyTier, industry: "Streaming", size: "10000+", headquarter: "Los Gatos, CA", founded: 1997, description: "Global streaming leader. Interviews test senior-level depth and systems thinking. Freedom and Responsibility culture." },
  { name: "Microsoft", slug: "microsoft", tier: "FAANG" as CompanyTier, industry: "Technology", size: "100000+", headquarter: "Redmond, WA", founded: 1975, description: "Productivity software and cloud (Azure) giant. Growth mindset and collaboration are key themes in interviews." },
  { name: "Uber", slug: "uber", tier: "TIER1" as CompanyTier, industry: "Mobility & Logistics", size: "20000+", headquarter: "San Francisco, CA", founded: 2009, description: "Global ride-sharing and delivery platform. Interviews test graph algorithms, distributed systems, and real-time data." },
  { name: "Atlassian", slug: "atlassian", tier: "TIER1" as CompanyTier, industry: "Developer Tools", size: "10000+", headquarter: "Sydney, Australia", founded: 2002, description: "Builds Jira and Confluence. Interviews balance coding with behavioral values-alignment and product thinking." },
  { name: "Airbnb", slug: "airbnb", tier: "TIER1" as CompanyTier, industry: "Travel & Hospitality", size: "6000+", headquarter: "San Francisco, CA", founded: 2008, description: "Global home-sharing marketplace. Interviews focus on distributed systems, data modeling, and cultural fit." },
  { name: "Stripe", slug: "stripe", tier: "TIER1" as CompanyTier, industry: "Fintech", size: "7000+", headquarter: "San Francisco, CA", founded: 2010, description: "Powers internet commerce. Known for highly technical interviews with emphasis on clean API design and systems thinking." },
  { name: "LinkedIn", slug: "linkedin", tier: "TIER1" as CompanyTier, industry: "Professional Networking", size: "20000+", headquarter: "Sunnyvale, CA", founded: 2003, description: "World's largest professional network. Graph algorithms and social network scaling are common interview themes." },
  { name: "Twitter", slug: "twitter", tier: "TIER1" as CompanyTier, industry: "Social Media", size: "5000+", headquarter: "San Francisco, CA", founded: 2006, description: "Real-time social platform. Interviews test distributed systems, feed ranking, and high-throughput data pipelines." },
  { name: "Coinbase", slug: "coinbase", tier: "TIER1" as CompanyTier, industry: "Crypto & Fintech", size: "3000+", headquarter: "San Francisco, CA", founded: 2012, description: "Leading crypto exchange. Interviews focus on backend reliability, blockchain concepts, and financial data accuracy." },
  { name: "Snowflake", slug: "snowflake", tier: "TIER1" as CompanyTier, industry: "Cloud Data Platform", size: "5000+", headquarter: "Bozeman, MT", founded: 2012, description: "Cloud-native data warehousing. Deeply technical interviews on distributed query processing and SQL internals." },
  { name: "Databricks", slug: "databricks", tier: "TIER1" as CompanyTier, industry: "Data & AI", size: "5000+", headquarter: "San Francisco, CA", founded: 2013, description: "Lakehouse data platform based on Apache Spark. Strong emphasis on distributed computing, data engineering, and ML systems." },
  { name: "Flipkart", slug: "flipkart", tier: "TIER1" as CompanyTier, industry: "E-Commerce", size: "30000+", headquarter: "Bengaluru, India", founded: 2007, description: "India's largest e-commerce marketplace. Interviews focus on system design at Indian scale and algorithm optimization." },
  { name: "Razorpay", slug: "razorpay", tier: "STARTUP" as CompanyTier, industry: "Fintech", size: "3000+", headquarter: "Bengaluru, India", founded: 2014, description: "India's leading payment gateway. Practical, product-focused interviews emphasizing financial transaction systems." },
  { name: "Swiggy", slug: "swiggy", tier: "STARTUP" as CompanyTier, industry: "Food Delivery", size: "5000+", headquarter: "Bengaluru, India", founded: 2014, description: "India's leading food delivery platform. Interviews test real-time logistics systems and delivery routing." },
  { name: "Zomato", slug: "zomato", tier: "STARTUP" as CompanyTier, industry: "Food Delivery", size: "5000+", headquarter: "Gurugram, India", founded: 2008, description: "Global restaurant discovery and food delivery platform. Interviews include DSA, system design, and product thinking." },
  { name: "Zepto", slug: "zepto", tier: "STARTUP" as CompanyTier, industry: "Quick Commerce", size: "2000+", headquarter: "Mumbai, India", founded: 2021, description: "10-minute grocery delivery startup. High-growth company focused on backend systems and distributed tracking." },
  { name: "Zoho", slug: "zoho", tier: "TIER2" as CompanyTier, industry: "SaaS", size: "10000+", headquarter: "Chennai, India", founded: 1996, description: "Comprehensive SaaS product suite. Known for training engineers from first principles. Hands-on coding interviews." },
  { name: "Infosys", slug: "infosys", tier: "MNC" as CompanyTier, industry: "IT Services", size: "300000+", headquarter: "Bengaluru, India", founded: 1981, description: "Global IT consulting giant. Graduate interviews test CS fundamentals, verbal reasoning, and coding aptitude." },
  { name: "TCS", slug: "tcs", tier: "MNC" as CompanyTier, industry: "IT Services", size: "600000+", headquarter: "Mumbai, India", founded: 1968, description: "Largest Indian IT company. Campus hiring uses TCS NQT aptitude test and technical interviews on CS basics." },
  { name: "Wipro", slug: "wipro", tier: "MNC" as CompanyTier, industry: "IT Services", size: "200000+", headquarter: "Bengaluru, India", founded: 1945, description: "Leading IT and consulting company. Hiring involves aptitude tests and interviews focusing on C/Java basics." },
  { name: "Walmart Global Tech", slug: "walmart", tier: "TIER1" as CompanyTier, industry: "Retail Tech", size: "15000+", headquarter: "Bengaluru, India", founded: 2019, description: "Powers e-commerce and supply chain for the world's largest retailer. Interviews cover DSA, distributed systems, and warehousing." },
  { name: "PayPal", slug: "paypal", tier: "TIER1" as CompanyTier, industry: "Fintech", size: "25000+", headquarter: "San Jose, CA", founded: 1998, description: "Global digital payments leader. Interviews emphasize financial data processing, fraud detection, and scalable backend design." },
  { name: "Salesforce", slug: "salesforce", tier: "TIER1" as CompanyTier, industry: "CRM & SaaS", size: "70000+", headquarter: "San Francisco, CA", founded: 1999, description: "Global CRM platform leader. Interviews cover multitenant SaaS architecture and Ohana-values behavioral questions." },
];

const TOPICS = [
  { name: "Arrays & Strings", slug: "arrays-strings", category: "DSA", color: "#f59e0b" },
  { name: "Linked Lists", slug: "linked-lists", category: "DSA", color: "#8b5cf6" },
  { name: "Trees & Graphs", slug: "trees-graphs", category: "DSA", color: "#10b981" },
  { name: "Dynamic Programming", slug: "dynamic-programming", category: "DSA", color: "#2563eb" },
  { name: "Backtracking", slug: "backtracking", category: "DSA", color: "#f43f5e" },
  { name: "Sliding Window & Two Pointers", slug: "sliding-window", category: "DSA", color: "#06b6d4" },
  { name: "Heaps & Priority Queues", slug: "heaps", category: "DSA", color: "#d97706" },
  { name: "Binary Search", slug: "binary-search", category: "DSA", color: "#7c3aed" },
  { name: "Tries & Hashing", slug: "tries-hashing", category: "DSA", color: "#059669" },
  { name: "Sorting & Searching", slug: "sorting-searching", category: "DSA", color: "#dc2626" },
  { name: "System Design", slug: "system-design", category: "System Design", color: "#1d4ed8" },
  { name: "Low Level Design", slug: "low-level-design", category: "System Design", color: "#6d28d9" },
  { name: "Distributed Systems", slug: "distributed-systems", category: "System Design", color: "#0e7490" },
  { name: "Behavioral & STAR", slug: "behavioral", category: "Behavioral", color: "#be185d" },
  { name: "OS & Concurrency", slug: "os-concurrency", category: "Core CS", color: "#065f46" },
  { name: "Databases & SQL", slug: "databases-sql", category: "Core CS", color: "#92400e" },
  { name: "Networking & HTTP", slug: "networking", category: "Core CS", color: "#1e3a5f" },
  { name: "Object-Oriented Design", slug: "ood", category: "Core CS", color: "#5b21b6" },
];

interface QuestionSeed {
  text: string; difficulty: Difficulty; type: QuestionType;
  frequency: number; hints: string[]; topics: string[]; companies: string[];
}

const QUESTIONS: QuestionSeed[] = [
  { text: "Two Sum — find indices of two numbers that add up to a target.", difficulty: "EASY", type: "CODING", frequency: 412, hints: ["Use a hash map for O(n) solution", "Store complement->index pairs"], topics: ["arrays-strings", "tries-hashing"], companies: ["google", "amazon", "microsoft", "uber"] },
  { text: "LRU Cache — implement a Least Recently Used cache with O(1) get and put.", difficulty: "MEDIUM", type: "CODING", frequency: 387, hints: ["Combine doubly linked list with a hash map", "Head = MRU, Tail = LRU"], topics: ["tries-hashing", "linked-lists"], companies: ["google", "amazon", "meta", "microsoft"] },
  { text: "Merge K Sorted Lists — merge K sorted linked lists into one sorted list.", difficulty: "HARD", type: "CODING", frequency: 321, hints: ["Use a min-heap of size K", "Time: O(N log K)"], topics: ["linked-lists", "heaps"], companies: ["amazon", "microsoft", "uber", "google"] },
  { text: "Binary Tree Maximum Path Sum — find the maximum path sum through any node.", difficulty: "HARD", type: "CODING", frequency: 298, hints: ["Compute max gain from left and right at each node", "Track global max separately"], topics: ["trees-graphs", "dynamic-programming"], companies: ["meta", "amazon", "google"] },
  { text: "Longest Substring Without Repeating Characters.", difficulty: "MEDIUM", type: "CODING", frequency: 356, hints: ["Sliding window + hash set", "Shrink window on repeat"], topics: ["sliding-window", "arrays-strings"], companies: ["google", "amazon", "atlassian", "linkedin"] },
  { text: "Trapping Rain Water — compute water trapped between elevation bars.", difficulty: "HARD", type: "CODING", frequency: 276, hints: ["Water = min(maxLeft, maxRight) - height", "Two-pointer for O(1) space"], topics: ["arrays-strings", "sliding-window"], companies: ["amazon", "google", "meta", "apple"] },
  { text: "Word Break — determine if a string can be segmented using a dictionary.", difficulty: "MEDIUM", type: "CODING", frequency: 241, hints: ["DP: dp[i] = true if s[0..i] can be segmented", "Use a set for O(1) lookups"], topics: ["dynamic-programming", "tries-hashing"], companies: ["google", "amazon"] },
  { text: "Number of Islands — count islands in a 2D grid of 1s and 0s.", difficulty: "MEDIUM", type: "CODING", frequency: 334, hints: ["DFS/BFS flood fill from each unvisited 1", "Increment counter per new island"], topics: ["trees-graphs"], companies: ["amazon", "google", "meta", "microsoft", "linkedin"] },
  { text: "Coin Change — minimum coins to make a given amount.", difficulty: "MEDIUM", type: "CODING", frequency: 289, hints: ["Classic unbounded knapsack DP", "dp[amount] = min coins for each sub-amount"], topics: ["dynamic-programming"], companies: ["amazon", "google", "atlassian"] },
  { text: "Serialize and Deserialize Binary Tree.", difficulty: "HARD", type: "CODING", frequency: 178, hints: ["BFS level-order is cleanest", "Use null markers for empty children"], topics: ["trees-graphs"], companies: ["meta", "linkedin", "google"] },
  { text: "Find Median from Data Stream — support addNum and findMedian in O(log n) and O(1).", difficulty: "HARD", type: "CODING", frequency: 213, hints: ["Two heaps: max-heap lower half, min-heap upper half", "Balance sizes to keep median in O(1)"], topics: ["heaps"], companies: ["google", "amazon", "apple"] },
  { text: "Course Schedule — detect cycle in prerequisite graph (topological sort).", difficulty: "MEDIUM", type: "CODING", frequency: 267, hints: ["Model as directed graph; cycle means not all courses finishable", "Kahn's BFS or DFS coloring"], topics: ["trees-graphs"], companies: ["google", "microsoft", "uber"] },
  { text: "Longest Increasing Subsequence (LIS).", difficulty: "MEDIUM", type: "CODING", frequency: 231, hints: ["O(n^2) DP or O(n log n) with patience sort", "Binary search on a tails array"], topics: ["dynamic-programming", "binary-search"], companies: ["amazon", "google", "microsoft"] },
  { text: "Clone Graph — return a deep copy of a connected undirected graph.", difficulty: "MEDIUM", type: "CODING", frequency: 198, hints: ["DFS/BFS with a hash map original->clone", "Check visited to avoid cycles"], topics: ["trees-graphs", "tries-hashing"], companies: ["meta", "google", "amazon"] },
  { text: "Sliding Window Maximum — max value in each window of size k.", difficulty: "HARD", type: "CODING", frequency: 189, hints: ["Monotonic deque tracking indices", "Pop front when out of window"], topics: ["sliding-window", "heaps"], companies: ["google", "amazon", "meta"] },
  { text: "Implement Trie (Prefix Tree) with insert, search, and startsWith.", difficulty: "MEDIUM", type: "CODING", frequency: 241, hints: ["TrieNode: children map + isEnd flag", "Each method O(len) time"], topics: ["tries-hashing"], companies: ["google", "amazon", "atlassian", "microsoft"] },
  { text: "Minimum Window Substring — smallest window in s containing all chars of t.", difficulty: "HARD", type: "CODING", frequency: 223, hints: ["Sliding window with frequency maps", "Expand right until valid, shrink left"], topics: ["sliding-window", "arrays-strings"], companies: ["google", "meta", "linkedin", "amazon"] },
  { text: "K Closest Points to Origin.", difficulty: "MEDIUM", type: "CODING", frequency: 189, hints: ["Max-heap of size K on squared distance", "Or QuickSelect for O(n) average"], topics: ["heaps", "sorting-searching"], companies: ["amazon", "google", "meta", "uber"] },
  { text: "Top K Frequent Elements.", difficulty: "MEDIUM", type: "CODING", frequency: 212, hints: ["Hash map frequency + min-heap of size K", "Or bucket sort for O(n)"], topics: ["heaps", "tries-hashing"], companies: ["google", "amazon", "linkedin"] },
  { text: "Search in Rotated Sorted Array.", difficulty: "MEDIUM", type: "CODING", frequency: 267, hints: ["Modified binary search: determine which half is sorted", "Check if target is in the sorted half"], topics: ["binary-search", "arrays-strings"], companies: ["amazon", "google", "microsoft", "linkedin"] },
  { text: "Alien Dictionary — determine letter order from sorted alien language dictionary.", difficulty: "HARD", type: "CODING", frequency: 134, hints: ["Build directed graph from ordering constraints", "Topological sort + cycle detection"], topics: ["trees-graphs", "sorting-searching"], companies: ["google", "meta", "airbnb"] },
  { text: "Jump Game II — minimum number of jumps to reach the last index.", difficulty: "MEDIUM", type: "CODING", frequency: 178, hints: ["Greedy: track farthest reachable at each step", "Increment jumps when current window exhausted"], topics: ["arrays-strings", "dynamic-programming"], companies: ["amazon", "google", "microsoft"] },
  { text: "Edit Distance (Levenshtein) — minimum operations to convert word1 to word2.", difficulty: "HARD", type: "CODING", frequency: 198, hints: ["2D DP: dp[i][j] = edit distance of prefixes", "Ops: insert, delete, replace"], topics: ["dynamic-programming"], companies: ["google", "microsoft", "atlassian"] },
  { text: "Regular Expression Matching — implement .* pattern matching.", difficulty: "HARD", type: "CODING", frequency: 143, hints: ["2D DP: dp[i][j] = s[0..i-1] matches p[0..j-1]", "Handle * as zero or more of previous char"], topics: ["dynamic-programming"], companies: ["google", "apple"] },
  { text: "Find All Subsets of a set (Power Set).", difficulty: "MEDIUM", type: "CODING", frequency: 198, hints: ["Backtracking or bitmask enumeration", "2^n subsets for n elements"], topics: ["backtracking"], companies: ["amazon", "google", "microsoft"] },
  { text: "Generate All Permutations of a string or array.", difficulty: "MEDIUM", type: "CODING", frequency: 212, hints: ["Backtracking with swap at each position", "Mark visited for distinct elements"], topics: ["backtracking"], companies: ["microsoft", "google", "meta"] },
  { text: "Word Search — find if a word exists in a 2D board of characters.", difficulty: "MEDIUM", type: "CODING", frequency: 234, hints: ["DFS backtracking on 4 directions", "Mark cell visited during recursion, restore on backtrack"], topics: ["backtracking", "trees-graphs"], companies: ["amazon", "google", "atlassian"] },
  { text: "Max Profit from Stock with Cooldown (State Machine DP).", difficulty: "MEDIUM", type: "CODING", frequency: 167, hints: ["States: held, sold, rest", "Recurrences between state transitions"], topics: ["dynamic-programming"], companies: ["amazon", "google", "flipkart"] },
  { text: "Decode Ways — count ways to decode a numeric string to letters.", difficulty: "MEDIUM", type: "CODING", frequency: 189, hints: ["1D DP: dp[i] = number of ways to decode s[0..i-1]", "Check 1-digit and 2-digit decodings"], topics: ["dynamic-programming"], companies: ["meta", "amazon", "google"] },
  { text: "Pacific Atlantic Water Flow — cells where water can reach both oceans.", difficulty: "MEDIUM", type: "CODING", frequency: 156, hints: ["Reverse-BFS from both oceans", "Answer = intersection of reachable cells"], topics: ["trees-graphs"], companies: ["google", "amazon"] },
  // System Design
  { text: "Design a URL Shortener like bit.ly at scale (100M URLs/day).", difficulty: "HARD", type: "SYSTEM_DESIGN", frequency: 356, hints: ["Base62 encoding for short codes", "Consistent hashing + Cassandra for storage", "Cache hot URLs in Redis"], topics: ["system-design", "distributed-systems", "databases-sql"], companies: ["google", "amazon", "meta", "uber", "atlassian"] },
  { text: "Design Twitter/X — social feed with 300M users and timeline generation.", difficulty: "HARD", type: "SYSTEM_DESIGN", frequency: 312, hints: ["Fan-out on write vs read (hybrid for celebrities)", "Redis sorted sets for feed storage", "Kafka for async streaming"], topics: ["system-design", "distributed-systems"], companies: ["twitter", "meta", "linkedin", "google"] },
  { text: "Design Uber — real-time ride matching and dispatch system.", difficulty: "HARD", type: "SYSTEM_DESIGN", frequency: 289, hints: ["Geospatial indexing with S2 or geohash", "WebSockets for real-time driver tracking", "Consistent hashing for city sharding"], topics: ["system-design", "distributed-systems"], companies: ["uber", "swiggy", "zomato", "google", "amazon"] },
  { text: "Design WhatsApp — real-time messaging system for 2 billion users.", difficulty: "HARD", type: "SYSTEM_DESIGN", frequency: 267, hints: ["WebSockets for real-time delivery", "End-to-end encryption key exchange", "Message queues per user for offline delivery"], topics: ["system-design", "distributed-systems", "networking"], companies: ["meta", "google", "amazon", "microsoft"] },
  { text: "Design a Rate Limiter for an API gateway.", difficulty: "MEDIUM", type: "SYSTEM_DESIGN", frequency: 278, hints: ["Token bucket or sliding window algorithm", "Redis counters with TTL for distributed enforcement", "Config per user tier"], topics: ["system-design", "distributed-systems"], companies: ["stripe", "amazon", "netflix", "atlassian", "google"] },
  { text: "Design a Distributed Cache like Redis.", difficulty: "HARD", type: "SYSTEM_DESIGN", frequency: 234, hints: ["Consistent hashing for shard distribution", "LRU eviction policy", "Replication for high availability"], topics: ["system-design", "distributed-systems"], companies: ["amazon", "google", "meta", "snowflake"] },
  { text: "Design Netflix — global video streaming platform.", difficulty: "HARD", type: "SYSTEM_DESIGN", frequency: 245, hints: ["CDN edge caching is critical", "Adaptive bitrate streaming (DASH/HLS)", "Open Connect for ISP peering"], topics: ["system-design", "distributed-systems", "networking"], companies: ["netflix", "amazon", "google", "apple"] },
  { text: "Design a Notification System (push, email, SMS) for 100M users.", difficulty: "HARD", type: "SYSTEM_DESIGN", frequency: 223, hints: ["Kafka for decoupled event ingestion", "Fan-out workers per channel type", "Idempotency keys to prevent duplicates"], topics: ["system-design", "distributed-systems"], companies: ["google", "amazon", "meta", "razorpay"] },
  { text: "Design a Search Autocomplete / Typeahead System.", difficulty: "MEDIUM", type: "SYSTEM_DESIGN", frequency: 198, hints: ["Trie with popularity scores at each prefix node", "Top-K results stored at each node", "Redis/Elasticsearch as distributed trie"], topics: ["system-design", "tries-hashing"], companies: ["google", "amazon", "linkedin", "atlassian"] },
  { text: "Design a Distributed Job Scheduler (like AWS Lambda / cron at scale).", difficulty: "HARD", type: "SYSTEM_DESIGN", frequency: 167, hints: ["ZooKeeper for leader election", "Priority queue for job ordering", "Dead letter queue for failures"], topics: ["system-design", "distributed-systems"], companies: ["amazon", "google", "databricks", "snowflake"] },
  // Behavioral
  { text: "Tell me about a time you disagreed with your manager or tech lead.", difficulty: "MEDIUM", type: "BEHAVIORAL", frequency: 312, hints: ["Use STAR method", "Show respectful communication and intellectual courage", "Demonstrate you can disagree and commit"], topics: ["behavioral"], companies: ["amazon", "google", "microsoft", "atlassian"] },
  { text: "Describe a situation where you had to meet a tight deadline under pressure.", difficulty: "MEDIUM", type: "BEHAVIORAL", frequency: 289, hints: ["Show prioritization and communication", "Include concrete outcome", "Mention lessons learned"], topics: ["behavioral"], companies: ["amazon", "google", "meta", "uber", "stripe"] },
  { text: "Tell me about a time you failed and what you learned from it.", difficulty: "MEDIUM", type: "BEHAVIORAL", frequency: 267, hints: ["Own the failure fully", "Focus more on the learning than the failure", "Show how you applied the lesson"], topics: ["behavioral"], companies: ["amazon", "google", "airbnb", "netflix"] },
  { text: "Tell me about a time you had to influence someone without formal authority.", difficulty: "MEDIUM", type: "BEHAVIORAL", frequency: 234, hints: ["Show data-driven persuasion or relationship-building", "Relate to cross-functional collaboration"], topics: ["behavioral"], companies: ["amazon", "google", "atlassian", "salesforce"] },
  { text: "Describe a project where you made a key decision with incomplete information.", difficulty: "HARD", type: "BEHAVIORAL", frequency: 198, hints: ["Show structured thinking under ambiguity", "Discuss risk mitigation and reversibility"], topics: ["behavioral"], companies: ["amazon", "meta", "stripe", "netflix"] },
  // Core CS
  { text: "Explain the CAP Theorem with a practical example for each trade-off.", difficulty: "MEDIUM", type: "CORE_CS", frequency: 245, hints: ["CA: RDBMS, CP: HBase/ZooKeeper, AP: DynamoDB/Cassandra", "Partition tolerance is unavoidable in distributed systems"], topics: ["distributed-systems", "databases-sql"], companies: ["google", "amazon", "snowflake", "databricks"] },
  { text: "What is the difference between a process and a thread? How does the Python GIL affect multithreading?", difficulty: "MEDIUM", type: "CORE_CS", frequency: 198, hints: ["Processes: separate memory; threads: shared heap", "GIL: one thread runs Python bytecode at a time", "Use multiprocessing or asyncio to bypass GIL"], topics: ["os-concurrency"], companies: ["google", "amazon", "atlassian", "razorpay"] },
  { text: "Explain B+ Trees — how they differ from B-Trees and why databases use them.", difficulty: "HARD", type: "CORE_CS", frequency: 156, hints: ["All data in leaf nodes; internal nodes are routing only", "Leaf nodes are linked for efficient range scans", "Better cache performance"], topics: ["databases-sql"], companies: ["google", "snowflake", "databricks", "amazon"] },
  { text: "What is consistent hashing and why is it used in distributed systems?", difficulty: "MEDIUM", type: "CORE_CS", frequency: 212, hints: ["Maps servers and keys to a ring; only K/N keys remapped on change", "Virtual nodes improve load balance", "Used in DynamoDB, Cassandra, CDNs"], topics: ["distributed-systems"], companies: ["amazon", "google", "meta", "stripe"] },
  { text: "Explain database indexing — how indexes improve performance and their trade-offs.", difficulty: "MEDIUM", type: "CORE_CS", frequency: 234, hints: ["B+ tree index for range queries, hash index for equality", "Faster reads but slower writes and more storage", "Covering vs partial vs composite index"], topics: ["databases-sql"], companies: ["amazon", "google", "atlassian", "stripe"] },
  { text: "What happens when you type a URL in your browser and press Enter? (Full networking stack)", difficulty: "MEDIUM", type: "CORE_CS", frequency: 267, hints: ["DNS resolution -> TCP 3-way handshake -> TLS -> HTTP request -> render", "Mention: DNS cache, ARP, TCP/IP layers, CDN"], topics: ["networking", "distributed-systems"], companies: ["google", "amazon", "meta", "atlassian", "flipkart"] },
  { text: "Explain SOLID principles with a real-world code example.", difficulty: "MEDIUM", type: "CORE_CS", frequency: 198, hints: ["Single Responsibility, Open/Closed, Liskov, Interface Segregation, Dependency Inversion", "Give a concrete OOP example for each"], topics: ["ood"], companies: ["microsoft", "atlassian", "amazon", "salesforce"] },
  { text: "What is a deadlock? How would you prevent and detect it in a multithreaded system?", difficulty: "MEDIUM", type: "CORE_CS", frequency: 189, hints: ["Conditions: mutual exclusion, hold-and-wait, no preemption, circular wait", "Prevention: lock ordering, timeout, resource allocation graph"], topics: ["os-concurrency"], companies: ["google", "microsoft", "amazon"] },
  // Low Level Design
  { text: "Design a Parking Lot System using OOP — multiple floors, vehicle types, real-time availability.", difficulty: "MEDIUM", type: "CORE_CS", frequency: 267, hints: ["Classes: ParkingLot, Floor, Spot, Vehicle, Ticket", "Strategy pattern for allocation, Observer for availability"], topics: ["low-level-design", "ood"], companies: ["amazon", "google", "flipkart", "uber", "walmart"] },
  { text: "Design a Splitwise-style Expense Sharing App — track debts and simplify balances.", difficulty: "MEDIUM", type: "SYSTEM_DESIGN", frequency: 189, hints: ["Model users, expenses, and individual shares", "Graph-based debt simplification algorithm", "Support equal, exact, percentage splits"], topics: ["low-level-design", "ood", "system-design"], companies: ["amazon", "flipkart", "google", "razorpay"] },
  { text: "Design a Library Management System — books, members, borrowing and return tracking.", difficulty: "EASY", type: "CORE_CS", frequency: 145, hints: ["Classes: Library, Book, Member, Borrow, Catalog", "Observer for overdue notifications", "Search by author, ISBN, title"], topics: ["low-level-design", "ood"], companies: ["zoho", "infosys", "tcs", "wipro"] },
  { text: "Design a Food Delivery App backend — restaurants, orders, delivery assignment.", difficulty: "HARD", type: "SYSTEM_DESIGN", frequency: 234, hints: ["Order state machine: placed -> confirmed -> picked -> delivered", "Nearest driver assignment with geospatial query", "Payment gateway integration"], topics: ["system-design", "distributed-systems", "low-level-design"], companies: ["swiggy", "zomato", "zepto", "uber", "amazon"] },
  { text: "Design a Payment Processing System — idempotency, retries, and refunds.", difficulty: "HARD", type: "SYSTEM_DESIGN", frequency: 212, hints: ["Idempotency keys prevent double charges", "Two-phase commit for atomic cross-system updates", "Retry with exponential backoff + dead letter queue"], topics: ["system-design", "distributed-systems", "databases-sql"], companies: ["razorpay", "stripe", "paypal", "amazon", "flipkart"] },
  { text: "Design a Flash Sale / Inventory Reservation system for high-concurrency e-commerce.", difficulty: "HARD", type: "SYSTEM_DESIGN", frequency: 189, hints: ["Optimistic locking vs Redis atomic DECR for inventory", "Rate limiter to protect downstream", "Queue overflow requests with a virtual waiting room"], topics: ["system-design", "distributed-systems"], companies: ["flipkart", "amazon", "walmart", "swiggy", "zepto"] },
];

async function main() {
  console.log("Seeding Intelview database...\n");

  // Clear data in dependency order
  await prisma.companyQuestion.deleteMany();
  await prisma.questionTopic.deleteMany();
  await prisma.companyResearch.deleteMany();
  await prisma.companyAnalytics.deleteMany();
  await prisma.question.deleteMany();
  await prisma.topic.deleteMany();
  await prisma.company.deleteMany();
  console.log("Cleared existing data.");

  // Seed companies
  const companyMap = new Map<string, string>();
  for (const c of COMPANIES) {
    const r = await prisma.company.create({
      data: { name: c.name, slug: c.slug, tier: c.tier, industry: c.industry, size: c.size, headquarter: c.headquarter, founded: c.founded, description: c.description, isActive: true },
    });
    companyMap.set(c.slug, r.id);
  }
  console.log(`Created ${companyMap.size} companies.`);

  // Seed topics
  const topicMap = new Map<string, string>();
  for (const t of TOPICS) {
    const r = await prisma.topic.create({ data: { name: t.name, slug: t.slug, category: t.category, color: t.color } });
    topicMap.set(t.slug, r.id);
  }
  console.log(`Created ${topicMap.size} topics.`);

  // Seed questions + links
  let qCount = 0;
  for (const q of QUESTIONS) {
    const r = await prisma.question.create({
      data: { text: q.text, difficulty: q.difficulty, type: q.type, frequency: q.frequency, hints: q.hints, isVerified: true, source: "seed" },
    });
    qCount++;
    for (const topicSlug of q.topics) {
      const topicId = topicMap.get(topicSlug);
      if (topicId) await prisma.questionTopic.create({ data: { questionId: r.id, topicId } });
    }
    for (const companySlug of q.companies) {
      const companyId = companyMap.get(companySlug);
      if (companyId) {
        await prisma.companyQuestion.upsert({
          where: { companyId_questionId: { companyId, questionId: r.id } },
          create: { companyId, questionId: r.id, frequency: q.frequency, isRecent: true, lastSeen: new Date() },
          update: { frequency: q.frequency },
        });
      }
    }
  }
  console.log(`Created ${qCount} questions with topic and company links.`);

  const [co, to, qu, cq] = await Promise.all([
    prisma.company.count(), prisma.topic.count(), prisma.question.count(), prisma.companyQuestion.count(),
  ]);
  console.log(`\nDone! DB: ${co} companies | ${to} topics | ${qu} questions | ${cq} company-question links`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
