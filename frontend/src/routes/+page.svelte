<script lang="ts">
    import { onMount } from 'svelte';
    import { Button } from '$lib/components/ui/button/index.js';

    interface Task {
        id: string;
        name: string;
        done: boolean;
        due: string | null;
    }

    interface Subgoal {
        id: string;
        name: string;
        progress: number;
        due: string | null;
        tasks: Task[];
    }

    interface Goal {
        id: string;
        name: string;
        progress: number;
        subgoals: Subgoal[];
    }

    let goals: Goal[] = [];
    let isLoading = true;
    let error: string | null = null;

    onMount(async () => {
        try {
            const response = await fetch('http://localhost:3000/api/goals');

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            goals = await response.json() as Goal[];
            console.log(goals)
        } catch (e: any) {
            console.error('Failed to fetch goals:', e);
            error = e.message;
        } finally {
            isLoading = false;
        }
    });
</script>

<main>
    <h1>Goals</h1>
    <Button>Click me</Button>

    {#if isLoading}
        <p>Loading your goals from Notion...</p>
    {:else if error}
        <p style="color: red;">Error: {error}</p>
    {:else}
        {#each goals as goal}
            <div class="goal">
                <h2>{goal.name} ({goal.progress.toFixed(0)}%)</h2>
                {#each goal.subgoals as subgoal}
                    <h3>{subgoal.name} ({subgoal.progress.toFixed(0)}%)</h3>
                    {#each subgoal.tasks as task}
                        <p>{task.name}</p>
                    {/each}
                {/each}
            </div>
        {/each}
    {/if}
</main>

