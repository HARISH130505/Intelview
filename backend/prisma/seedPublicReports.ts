/**
 * Intelview - Public Interview Experience Seed
 * source = "public_web" | userId = null | status = APPROVED
 * Deduplication: skips if sourceUrl already exists.
 */
import { PrismaClient } from "@prisma/client";
import { aiService } from "../src/services/AIService";

const prisma = new PrismaClient();


interface PublicExperience {
  companySlug: string;
  role: string;
  sourceUrl: string;
  sourceName: string;
  interviewDate?: string;
  rawText: string;
  offerStatus?: "ACCEPTED" | "REJECTED" | "PENDING" | "UNKNOWN";
}

const PUBLIC_EXPERIENCES: PublicExperience[] = [
  {
    companySlug: "google", role: "Software Engineer",
    sourceUrl: "https://www.geeksforgeeks.org/google-interview-experience-set-1-campus/",
    sourceName: "GeeksForGeeks", offerStatus: "ACCEPTED",
    rawText: "Google Software Engineer Interview - Campus Recruitment.\nRound 1 Online Assessment: Two coding problems - a graph shortest-path problem and a dynamic programming problem. 90 minutes.\nRound 2 Technical Phone Screen: Serialize and deserialize binary tree. Approach, edge cases, time/space complexity.\nRound 3 Technical Onsite 1: Top K most frequent elements from a stream using hash map and min-heap.\nRound 4 Technical Onsite 2: All connected components in undirected graph, cycle detection. BFS vs DFS discussion.\nRound 5 Behavioral: Challenging project, team conflict, decision with incomplete information.\nReceived offer.",
  },
  {
    companySlug: "google", role: "Software Engineer",
    sourceUrl: "https://www.geeksforgeeks.org/google-interview-experience-set-2-campus/",
    sourceName: "GeeksForGeeks", offerStatus: "ACCEPTED",
    rawText: "Google Software Engineer Interview - SWE campus hire.\nRound 1 Coding: Maximum subarray sum with constraint, longest palindromic substring.\nRound 2 Technical Interview 1: LRU cache O(1) get and put using doubly linked list and hash map.\nRound 3 Technical Interview 2: Staircase DP problem (1/2/3 steps), coin change minimum coins. Bottom-up vs top-down.\nRound 4 System Design: URL shortener like bit.ly - base62 encoding, Redis caching, load balancing at 100M URLs per day.\nRound 5 Behavioral: Teamwork, past projects, technical leadership.\nReceived offer.",
  },
  {
    companySlug: "google", role: "Software Engineer",
    sourceUrl: "https://www.geeksforgeeks.org/google-interview-experience-set-3/",
    sourceName: "GeeksForGeeks", offerStatus: "ACCEPTED", interviewDate: "2024-03-15",
    rawText: "Google Interview Experience - Software Engineer L4. 5 rounds: 1 phone screen + 4 onsites.\nPhone Screen: Number of distinct islands in 2D matrix using DFS.\nOnsite Round 1: Implement trie with insert/search/startsWith. Return all words matching a prefix.\nOnsite Round 2: Running median using max-heap for lower half and min-heap for upper half.\nOnsite Round 3 System Design: Design Google Drive - chunked upload, metadata DB, CDN, versioning, conflict resolution, device sync.\nOnsite Round 4 Behavioral: Deliver under tight deadline, time disagreeing with manager.\nProcess took 4 weeks. Difficulty HARD.",
  },
  {
    companySlug: "amazon", role: "Software Development Engineer",
    sourceUrl: "https://www.geeksforgeeks.org/amazon-interview-experience-set-1-campus/",
    sourceName: "GeeksForGeeks", offerStatus: "ACCEPTED",
    rawText: "Amazon SDE Campus Recruitment Interview.\nOnline Assessment HackerRank: Rotate matrix 90 degrees, anagram check with limited replacements. 90 minutes.\nRound 1 DSA: K-th largest element using quickselect and heap O(n log k). Follow-up: k-th largest from a stream.\nRound 2 DSA + Leadership Principles: Dijkstra shortest path. Behavioral - Earn Trust LP difficult team member.\nRound 3 System Design: Amazon order management - placement, inventory, payment, fulfillment, partial failure handling.\nRound 4 Bar Raiser: Leadership Principles - Ownership, Dive Deep, Bias for Action, Deliver Results.\nReceived offer. Prepare STAR stories for Amazon Leadership Principles.",
  },
  {
    companySlug: "amazon", role: "Software Development Engineer",
    sourceUrl: "https://www.geeksforgeeks.org/amazon-interview-experience-set-2/",
    sourceName: "GeeksForGeeks", offerStatus: "ACCEPTED",
    rawText: "Amazon SDE-1 Interview.\nRound 1 Online Assessment: Merge K sorted linked lists, count ways to climb n stairs.\nRound 2 Technical Phone Screen: Lowest common ancestor in binary tree - naive and optimized approaches.\nRound 3 Technical Onsite 1: Two-sum with duplicates, validate binary search tree.\nRound 4 Technical Onsite 2: Sliding window maximum sum subarray of size k. Behavioral Ownership LP.\nRound 5 System Design: Notification system for 100M users - Kafka, fan-out workers, idempotency keys.\nRound 6 Bar Raiser: Dive Deep, Customer Obsession, Disagree and Commit LPs.\nReceived offer. Process 3 weeks.",
  },
  {
    companySlug: "amazon", role: "SDE-1",
    sourceUrl: "https://www.geeksforgeeks.org/amazon-interview-experience-set-3/",
    sourceName: "GeeksForGeeks", offerStatus: "REJECTED",
    rawText: "Amazon SDE-1 Off Campus Interview.\nOnline Test: String reversal (easy), minimum cost to connect ropes (medium), longest common subsequence (hard).\nTechnical Round 1: Reverse linked list in groups of K, detect loop using Floyd cycle detection.\nTechnical Round 2: LIS and coin change - recursive and iterative approaches.\nTechnical Round 3 System Design: Amazon shopping cart - data model, concurrent updates, checkout, inventory reservation.\nHR Round: Why Amazon, career goals, conflict resolution.\nDid not receive offer. Feedback: system design lacked scalability depth.",
  },
  {
    companySlug: "microsoft", role: "Software Engineer",
    sourceUrl: "https://www.geeksforgeeks.org/microsoft-interview-experience-set-1/",
    sourceName: "GeeksForGeeks", offerStatus: "ACCEPTED",
    rawText: "Microsoft SDE Interview. 4 technical rounds + 1 hiring manager.\nRound 1 Online Assessment: Longest substring without repeating characters, binary search on rotated sorted array. 75 minutes.\nRound 2 Technical 1: Parking lot OOP design - ParkingLot, Level, ParkingSpot, Vehicle subclasses, Ticket. Strategy and Observer patterns.\nRound 3 Technical 2: Maximum width of binary tree using BFS. Serialize and deserialize binary tree.\nRound 4 Technical 3 System Design: Collaborative code editor - WebSockets, OT or CRDTs, session management.\nRound 5 Hiring Manager: Growth mindset, technical challenge, why Microsoft.\nReceived offer.",
  },
  {
    companySlug: "microsoft", role: "SDE-1",
    sourceUrl: "https://www.geeksforgeeks.org/microsoft-interview-experience-set-2/",
    sourceName: "GeeksForGeeks", offerStatus: "ACCEPTED",
    rawText: "Microsoft SDE-1 Campus Interview.\nOnline Coding: Clone graph using DFS with visited map, edit distance Levenshtein DP.\nRound 1 Technical: First and last position of target in sorted array using binary search. Square root via binary search.\nRound 2 Technical: Stack with push/pop/top/getMin in O(1) using two stacks.\nRound 3 Technical: Word search in 2D grid - backtracking DFS 4 directions. Complexity and pruning.\nRound 4 Behavioral + Technical: Failure handling, cross-team collaboration. BST to doubly linked list in-place.\nReceived offer.",
  },
  {
    companySlug: "meta", role: "Software Engineer",
    sourceUrl: "https://www.geeksforgeeks.org/meta-facebook-interview-experience-set-1/",
    sourceName: "GeeksForGeeks", offerStatus: "ACCEPTED",
    rawText: "Meta Facebook Software Engineer Interview. 1 recruiter screen, 2 phone screens, 4 onsites.\nPhone Screen 1: Root-to-leaf paths summing to target - DFS with backtracking.\nPhone Screen 2: Merge overlapping intervals - sort by start time O(n log n).\nOnsite Round 1: Number of islands. Follow-up dynamic grid - Union-Find for connectivity.\nOnsite Round 2: Course schedule cycle detection - Kahn topological sort and DFS coloring.\nOnsite Round 3 System Design: Facebook News Feed for 2B users - fan-out on write vs read, Kafka, Redis.\nOnsite Round 4 Behavioral: Collaboration, impact, ambiguity.\nReceived offer. Speed matters - finish each problem in 20-25 minutes.",
  },
  {
    companySlug: "meta", role: "SDE-2",
    sourceUrl: "https://www.geeksforgeeks.org/meta-facebook-interview-experience-set-2/",
    sourceName: "GeeksForGeeks", offerStatus: "ACCEPTED",
    rawText: "Meta SDE-2 Interview - 3 years experience.\nRecruiter Screen: Experience, Meta culture, timeline.\nTechnical Screen: Clone graph DFS with hash map. Disconnected graphs and self-loops.\nOnsite Round 1: Minimum window substring - sliding window two frequency maps.\nOnsite Round 2: Serialize and deserialize binary tree - BFS with null markers.\nOnsite Round 3 System Design: Instagram Stories - ephemeral 24h content, CDN, TTL expiry, notification fanout.\nOnsite Round 4 Behavioral: Coworker conflict, ambiguity, feature impact.\nReceived SDE-2 offer. Higher bar - proactively identify edge cases.",
  },
  {
    companySlug: "atlassian", role: "Software Engineer",
    sourceUrl: "https://www.geeksforgeeks.org/atlassian-interview-experience-set-1/",
    sourceName: "GeeksForGeeks", offerStatus: "ACCEPTED",
    rawText: "Atlassian Software Engineer Interview.\nRound 1 Online Assessment HackerRank: Tree level with maximum sum, longest substring with at most k distinct characters. 60 minutes.\nRound 2 Technical: Connected components in undirected graph - DFS and Union-Find comparison.\nRound 3 Values Interview: Team direction disagreement handling, going above and beyond for customer.\nRound 4 System Design: Design Jira - data model, Elasticsearch for JQL, notification system, multi-tenant SaaS permissions.\nRound 5 Technical Final: Rate limiter using token bucket - Redis DECR + TTL, concurrent requests.\nReceived offer. Communication and collaboration key at Atlassian.",
  },
  {
    companySlug: "atlassian", role: "Senior Software Engineer",
    sourceUrl: "https://www.geeksforgeeks.org/atlassian-interview-experience-set-2/",
    sourceName: "GeeksForGeeks", offerStatus: "UNKNOWN",
    rawText: "Atlassian Senior Software Engineer Interview. Applied via LinkedIn. 4 weeks.\nRound 1 Recruiter Screen: Experience, compensation, culture.\nRound 2 Technical Phone Screen: Minimum meeting rooms needed - min-heap sorted by end times O(n log n).\nRound 3 Technical Deep Dive: Thread-safe LRU cache using LinkedHashMap synchronized. Distributed LRU follow-up.\nRound 4 System Design: Design Confluence - WebSockets OT/CRDTs, page versioning, Elasticsearch, CDN attachments.\nRound 5 Values Interview: Examples from past experience aligning with Atlassian values.\nDid not progress. Feedback: collaborative editing design needed more depth on CRDTs.",
  },
  {
    companySlug: "adobe", role: "Software Engineer",
    sourceUrl: "https://www.geeksforgeeks.org/adobe-interview-experience-set-1/",
    sourceName: "GeeksForGeeks", offerStatus: "ACCEPTED",
    rawText: "Adobe Software Engineer Interview. 4 rounds.\nRound 1 Online Assessment: Stack using queues, all permutations of string, k-th largest element using heap. 90 minutes.\nRound 2 Technical 1: Undo/Redo system for text editor using Command pattern - two stacks for undo and redo history.\nRound 3 Technical 2: Longest common subsequence, longest palindromic subsequence DP. Minimum edits to palindrome.\nRound 4 Technical 3 + Behavioral: Flatten binary tree to linked list in-place preorder. Proud project, technical disagreement, why Adobe.\nReceived offer. Practice OOP design patterns - Factory, Observer, Command, Strategy.",
  },
  {
    companySlug: "adobe", role: "MTS-1",
    sourceUrl: "https://www.geeksforgeeks.org/adobe-interview-experience-set-2/",
    sourceName: "GeeksForGeeks", offerStatus: "ACCEPTED",
    rawText: "Adobe MTS-1 Campus Interview. Online test + 3 interviews.\nOnline Test: Rotate matrix 90 degrees in-place. Leaderboard with addScore and getTop(K) using hash map and max-heap.\nInterview 1: Symmetric binary tree check, diameter of binary tree using DFS.\nInterview 2 OOP Design: File system with directories, files, symbolic links. Circular symlink detection.\nInterview 3 Technical + Behavioral: Generate all valid parentheses combinations using backtracking. Challenging bug story.\nReceived offer. Write clean maintainable code and explain design decisions.",
  },
  {
    companySlug: "flipkart", role: "SDE-1",
    sourceUrl: "https://www.geeksforgeeks.org/flipkart-interview-experience-set-1/",
    sourceName: "GeeksForGeeks", offerStatus: "ACCEPTED",
    rawText: "Flipkart SDE-1 Campus Interview. Online test, machine coding, 3 technical rounds, HR.\nOnline Test HackerEarth: Minimum cost to connect N cities MST Prim, count distinct subsequences, stack with getMin O(1). 90 minutes.\nMachine Coding 2 hours: Parking lot system - multiple levels, vehicle types car/bike/truck, real-time slot availability, ticket generation. SOLID OOP principles.\nTechnical Round 1: All strongly connected components - Kosaraju and Tarjan algorithms comparison.\nTechnical Round 2 System Design: Flipkart search and recommendation - Elasticsearch, collaborative filtering, 100K QPS peak.\nTechnical Round 3: Jump game minimum jumps, behavioral questions.\nReceived offer. Machine coding round is biggest filter.",
  },
  {
    companySlug: "flipkart", role: "SDE-2",
    sourceUrl: "https://www.geeksforgeeks.org/flipkart-interview-experience-set-2/",
    sourceName: "GeeksForGeeks", offerStatus: "ACCEPTED",
    rawText: "Flipkart SDE-2 Off Campus Interview - 3 years experience. 5 weeks.\nRound 1 Online Assessment: Edit distance DP, longest common subsequence with modifications.\nRound 2 Machine Coding: E-commerce shopping cart - add/remove items, coupons, discounts, checkout. Service Layer, Repository pattern. 2 hours.\nRound 3 Low Level Design: Notification system - push/SMS/email with priority queues, retry logic, rate limiting.\nRound 4 System Design: Flash sale - 50K concurrent users, 100 stock items. Redis atomic DECR, virtual queue, idempotency.\nRound 5 Technical + Behavioral: Merge K sorted arrays, ownership and collaboration behavioral.\nReceived offer.",
  },
  {
    companySlug: "razorpay", role: "Software Development Engineer",
    sourceUrl: "https://www.geeksforgeeks.org/razorpay-interview-experience-set-1/",
    sourceName: "GeeksForGeeks", offerStatus: "ACCEPTED",
    rawText: "Razorpay SDE Interview via referral. 3 rounds.\nRound 1 Technical 1: Insert/delete/getRandom in O(1) using hash map with array. Find all anagrams using sliding window.\nRound 2 Technical 2: Payment gateway end-to-end - authorization, 3DS, capture, settlement. Design Razorpay payment processing - idempotency, exponential backoff retry, partial failure handling.\nRound 3 Technical 3 + Behavioral: Binary tree balanced check, AVL trees follow-up. System reliability improvement story.\nReceived offer. Deep understanding of financial systems expected.",
  },
  {
    companySlug: "razorpay", role: "Backend Engineer",
    sourceUrl: "https://www.geeksforgeeks.org/razorpay-interview-experience-set-2/",
    sourceName: "GeeksForGeeks", offerStatus: "REJECTED",
    rawText: "Razorpay Backend Engineer Interview via LinkedIn. Online test + 3 rounds.\nOnline Test: Fraudulent transaction detection using sliding window. Rate limiter N requests per second per API key.\nRound 1 DSA: Process vs thread differences, thread-safe singleton, median from stream using two heaps.\nRound 2 System Design: UPI payment system - VPA resolution, NPCI integration, distributed transactions, fraud detection pipeline.\nRound 3 Behavioral + Technical: Maximum profit from stock with K transactions DP. Production incident communication.\nDid not receive offer. Feedback: distributed transaction patterns needed stronger depth.",
  },
  {
    companySlug: "uber", role: "Software Engineer",
    sourceUrl: "https://www.geeksforgeeks.org/uber-interview-experience-set-1/",
    sourceName: "GeeksForGeeks", offerStatus: "ACCEPTED",
    rawText: "Uber Software Engineer Interview. 4 rounds: 1 phone screen + 3 onsites.\nPhone Screen: Shortest path in grid avoiding obstacles using BFS.\nOnsite Round 1 Coding: K closest points to target using max-heap size K. Geospatial indexing with geohash for nearest driver.\nOnsite Round 2 System Design: Uber surge pricing - GPS pings every 4 seconds, demand heatmap, price multiplier, near-real-time computation per city cell.\nOnsite Round 3 Behavioral: Decision with incomplete data, influencing team decision.\nReceived offer. Focus on geospatial and real-time systems.",
  },
  {
    companySlug: "uber", role: "SDE-2",
    sourceUrl: "https://www.geeksforgeeks.org/uber-interview-experience-set-2/",
    sourceName: "GeeksForGeeks", offerStatus: "ACCEPTED",
    rawText: "Uber SDE-2 Interview - 3.5 years experience.\nRound 1 Technical Phone Screen: Minimum time to reach all cities - Dijkstra. Bellman-Ford for negative weights.\nRound 2 Onsite Coding 1: Fleet driver data structure - addDriver, removeDriver, getNearestDriver using k-d tree. Quadtrees alternative.\nRound 3 Onsite Coding 2: Driver earning most from day trips. Detect scheduling conflicts with overlapping trips.\nRound 4 System Design: Uber Eats - restaurant menu, order placement, real-time driver assignment, optimal dispatch algorithm.\nRound 5 Behavioral: Ownership, impact, changing direction mid-project based on new data.\nReceived offer.",
  },
  {
    companySlug: "salesforce", role: "Software Engineer",
    sourceUrl: "https://www.geeksforgeeks.org/salesforce-interview-experience-set-1/",
    sourceName: "GeeksForGeeks", offerStatus: "ACCEPTED",
    rawText: "Salesforce Software Engineer Interview. Online test + 3 technical rounds + HR.\nOnline Test: Group customer records by department sorted alphabetically. In-memory key-value store with TTL.\nTechnical Round 1: K-th smallest in BST - inorder and Morris traversal. BST vs AVL trees.\nTechnical Round 2 System Design: Salesforce CRM contact management - Accounts/Contacts/Leads/Opportunities data model, multi-tenant shared schema, Elasticsearch, RBAC.\nTechnical Round 3: All unique triplets summing to zero - sorting + two pointers O(n^2).\nHR Round: Ohana culture, 5-year plan, compensation.\nReceived offer.",
  },
  {
    companySlug: "salesforce", role: "MTS",
    sourceUrl: "https://www.geeksforgeeks.org/salesforce-interview-experience-set-2/",
    sourceName: "GeeksForGeeks", offerStatus: "ACCEPTED",
    rawText: "Salesforce MTS Interview - 2 years experience.\nRound 1 Phone Screen: LRU Cache O(1) using doubly linked list and hash map. Distributed LRU extension.\nRound 2 Technical Onsite 1: Evaluate arithmetic expression with nested parentheses using stack. Operator precedence.\nRound 3 Technical Onsite 2 System Design: Salesforce sharing model for CRM records - sharing rules, role hierarchy, sharing table design, 10M records bulk query performance.\nRound 4 Behavioral: Ohana culture - helping teammate, critical feedback, mentoring juniors.\nRound 5 Technical Onsite 3: File system with mkdir/ls/addContent/readContent using trie data structure.\nReceived offer at MTS level.",
  },
];

async function seedPublicReports() {
  console.log("\n Seeding public interview experiences...\n");
  let created = 0, skipped = 0, failed = 0;

  for (const exp of PUBLIC_EXPERIENCES) {
    const label = `${exp.companySlug}/${exp.role}`;
    try {
      const existing = await prisma.interviewReport.findFirst({ where: { sourceUrl: exp.sourceUrl } });
      if (existing) { console.log(`  SKIP (dupe): ${label}`); skipped++; continue; }

      const company = await prisma.company.findFirst({ where: { slug: exp.companySlug } });
      if (!company) { console.warn(`  SKIP (no company): ${label}`); skipped++; continue; }

      console.log(`  Extracting: ${label}...`);
      const extracted = await aiService.extractInterview(exp.rawText);
      if (!extracted || ((!extracted.rounds || !extracted.rounds.length) && (!extracted.questions || !extracted.questions.length))) {
        console.warn(`  SKIP (empty extraction): ${label}`); skipped++; continue;
      }

      const report = await prisma.interviewReport.create({
        data: {
          companyId: company.id, userId: null, role: exp.role,
          interviewDate: exp.interviewDate ? new Date(exp.interviewDate) : undefined,
          difficulty: (extracted.difficulty as any) || "MEDIUM",
          offerStatus: exp.offerStatus ? (exp.offerStatus as any) : (extracted.offerStatus !== "UNKNOWN" ? (extracted.offerStatus as any) : "UNKNOWN"),
          rawText: exp.rawText, experience: extracted.summary || exp.rawText.slice(0, 500),
          isAnonymous: true, source: "public_web", sourceUrl: exp.sourceUrl,
          status: "APPROVED", processedAt: new Date(),
        },
      });

      for (let i = 0; i < (extracted.rounds || []).length; i++) {
        const r = extracted.rounds[i];
        await prisma.round.create({ data: { reportId: report.id, roundNumber: r.roundNumber || i + 1, type: (r.type as any) || "TECHNICAL", description: r.description || `Round ${i+1}`, duration: r.duration || undefined, difficulty: (r.difficulty as any) || undefined } });
      }

      for (const q of (extracted.questions || [])) {
        if (!q.text?.trim()) continue;
        let question = await prisma.question.findFirst({ where: { text: { equals: q.text.trim(), mode: "insensitive" } } });
        if (!question) {
          question = await prisma.question.create({ data: { text: q.text.trim(), type: (q.type as any) || "CODING", difficulty: (q.difficulty as any) || "MEDIUM", frequency: 1, source: `Public Interview Experience (${exp.sourceName})` } });
        } else {
          await prisma.question.update({ where: { id: question.id }, data: { frequency: { increment: 1 } } });
        }
        await prisma.reportQuestion.create({ data: { reportId: report.id, questionId: question.id, rawText: q.text.trim() } });
        await prisma.companyQuestion.upsert({ where: { companyId_questionId: { companyId: company.id, questionId: question.id } }, update: { frequency: { increment: 1 }, lastSeen: new Date() }, create: { companyId: company.id, questionId: question.id, frequency: 1, lastSeen: new Date() } });
        for (const topicName of (q.topics || [])) {
          const cleanName = topicName.trim(); if (!cleanName) continue;
          const slug = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""); if (!slug) continue;
          const topic = await prisma.topic.upsert({ where: { slug }, update: {}, create: { name: cleanName, slug, category: "General" } });
          await prisma.questionTopic.upsert({ where: { questionId_topicId: { questionId: question.id, topicId: topic.id } }, update: {}, create: { questionId: question.id, topicId: topic.id } });
        }
      }
      console.log(`  Created: ${label} - ${extracted.rounds?.length || 0} rounds, ${extracted.questions?.length || 0} questions`);
      created++;
      await new Promise(r => setTimeout(r, 1500));
    } catch (err: any) {
      console.error(`  FAILED: ${label} - ${err.message}`); failed++;
    }
  }

  const publicCount = await prisma.interviewReport.count({ where: { source: "public_web" } });
  const communityCount = await prisma.interviewReport.count({ where: { source: "community" } });
  console.log(`\nSeed complete: created=${created} skipped=${skipped} failed=${failed}`);
  console.log(`DB: public_web=${publicCount} community=${communityCount}`);
}

seedPublicReports()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
