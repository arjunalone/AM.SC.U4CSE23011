import axios from 'axios';

interface Depot {
    ID: number;
    MechanicHours: number;
}

interface Task {
    TaskID: string;
    Duration: number;
    Impact: number;
}

// TODO: Replace with the actual Task API URL from the instructions
const GET_TASKS_API = (depotId: number) => `http://20.207.122.201/evaluation-service/depots/${depotId}/tasks`; // Assuming standard REST pattern

const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJhbmlwZWRkaWFyanVuQGdtYWlsLmNvbSIsImV4cCI6MTc3ODA2MjU2MSwiaWF0IjoxNzc4MDYxNjYxLCJpc3MiOiJBZmZvcmQgTWVkaWNhbCBUZWNobm9sb2dpZXMgUHJpdmF0ZSBMaW1pdGVkIiwianRpIjoiNjM3ODFjZWYtMTY1YS00NWVhLWE3ZmUtNzM4ZDhjNTJkMThkIiwibG9jYWxlIjoiZW4tSU4iLCJuYW1lIjoiYS5hcmp1biIsInN1YiI6ImE1MjkxNDk1LTgwZjItNDRkMy1hMDgxLWJhN2MyODlkMGJkZCJ9LCJlbWFpbCI6ImFuaXBlZGRpYXJqdW5AZ21haWwuY29tIiwibmFtZSI6ImEuYXJqdW4iLCJyb2xsTm8iOiJhbS5zYy51NGNzZTIzMDExIiwiYWNjZXNzQ29kZSI6IlBUQk1tUSIsImNsaWVudElEIjoiYTUyOTE0OTUtODBmMi00NGQzLWEwODEtYmE3YzI4OWQwYmRkIiwiY2xpZW50U2VjcmV0IjoiamV6ZHlIWEJjSEZKRkNKQiJ9.UVS7lwBM4zA6DCDmwysDNJ1IDRJPv1Z8KaQbSclI0JA';

// Fetches the depots
async function getDepots(): Promise<Depot[]> {
    const res = await axios.get('http://20.207.122.201/evaluation-service/depots', {
        headers: { 'Authorization': `Bearer ${AUTH_TOKEN}` }
    });
    return res.data.depots;
}

// Fetches the tasks for a specific depot
async function getTasks(depotId: number): Promise<Task[]> {
    try {
        const res = await axios.get(GET_TASKS_API(depotId), {
            headers: { 'Authorization': `Bearer ${AUTH_TOKEN}` }
        });
        return res.data.tasks || res.data; // Handles both direct array or wrapped in object
    } catch (e: any) {
        console.error(`Error fetching tasks for depot ${depotId}. Is the URL correct?`);
        return [];
    }
}

/**
 * Solves the 0/1 Knapsack problem for a depot
 * @param budget Max MechanicHours available
 * @param tasks Available tasks for the depot
 * @returns Array of selected TaskIDs
 */
function solveKnapsack(budget: number, tasks: Task[]): { maxImpact: number, selectedTasks: string[], durationUsed: number } {
    const n = tasks.length;
    
    // dp[i][w] will store the max impact that can be achieved using first i tasks and weight w
    // Since n can be large, a 1D array is better for memory, but we need to track items.
    
    // To reconstruct the items chosen, we can keep track of choices.
    // Given the real-world scale, we'll use a 2D array if budget is small enough, 
    // or an array of objects to track history.
    
    // DP array to store max impact
    const dp = Array(budget + 1).fill(0);
    // History array to track chosen items. history[w] = set of task IDs
    const history: Set<string>[] = Array(budget + 1).fill(null).map(() => new Set());
    
    for (let i = 0; i < n; i++) {
        const task = tasks[i];
        const duration = task.Duration;
        const impact = task.Impact;
        
        // Traverse backwards to use 1D array correctly for 0/1 Knapsack
        for (let w = budget; w >= duration; w--) {
            if (dp[w - duration] + impact > dp[w]) {
                dp[w] = dp[w - duration] + impact;
                history[w] = new Set(history[w - duration]);
                history[w].add(task.TaskID);
            }
        }
    }
    
    // Find the max impact and its corresponding exact duration used
    let maxImpact = 0;
    let durationUsed = 0;
    let selectedSet = new Set<string>();
    
    for (let w = 0; w <= budget; w++) {
        if (dp[w] > maxImpact) {
            maxImpact = dp[w];
            durationUsed = w;
            selectedSet = history[w];
        }
    }
    
    return {
        maxImpact,
        durationUsed,
        selectedTasks: Array.from(selectedSet)
    };
}

async function run() {
    console.log('Fetching Depots...');
    const depots = await getDepots();
    console.log(`Found ${depots.length} depots.\n`);

    for (const depot of depots) {
        console.log(`--- Processing Depot ${depot.ID} (Budget: ${depot.MechanicHours} hours) ---`);
        const tasks = await getTasks(depot.ID);
        
        if (tasks.length === 0) {
            console.log(`No tasks retrieved for Depot ${depot.ID}. Continuing...`);
            continue;
        }

        console.log(`Fetched ${tasks.length} tasks.`);
        const result = solveKnapsack(depot.MechanicHours, tasks);
        
        console.log(`Optimal Solution:`);
        console.log(`Total Impact Score: ${result.maxImpact}`);
        console.log(`Total Duration Used: ${result.durationUsed} / ${depot.MechanicHours} hours`);
        console.log(`Selected Tasks (${result.selectedTasks.length}):`, result.selectedTasks);
        console.log('--------------------------------------------------\n');
    }
}

run().catch(console.error);
