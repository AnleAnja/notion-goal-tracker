<script lang="ts">
    import {onMount} from 'svelte';
    import {Card, CardContent, CardHeader, CardTitle} from "$lib/components/ui/card/index.js";
    import {Progress} from "$lib/components/ui/progress/index.js";
    import {Badge} from "$lib/components/ui/badge/index.js";

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
    let progress = 0;
    let completed = 0;
    let tasks = 0;
    let expandedGoalId: string | null = null;

    function toggleGoal(goalId: string) {
        if (expandedGoalId === goalId) {
            expandedGoalId = null;
        } else {
            expandedGoalId = goalId;
        }
    }


    onMount(async () => {
        try {
            const response = await fetch('http://localhost:3000/api/goals');

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            goals = await response.json() as Goal[];
            const totalProgress = goals.reduce((sum, goal) => sum + goal.progress, 0);
            progress = goals.length > 0 ? totalProgress / goals.length : 0;
            tasks = goals.reduce((sum, goal) => sum + goal.subgoals.reduce((sum, subgoal) => sum + subgoal.tasks.length, 0), 0);
            completed = goals.reduce((sum, goal) => sum + goal.subgoals.reduce((sum, subgoal) => sum + subgoal.tasks.filter(task => task.done).length, 0), 0);
            console.log(goals)
        } catch (e: any) {
            console.error('Failed to fetch goals:', e);
            error = e.message;
        } finally {
            isLoading = false;
        }
    });

    $: cardData = [
        {
            title: 'Total Goals',
            value: goals.length,
        },
        {
            title: 'Overall Progress',
            value: progress.toFixed(0) + '%',
            chart: true
        },
        {
            title: 'Tasks Completed',
            value: completed.toFixed(0),
            description: 'out of ' + tasks.toFixed(0) + ' total'
        }
    ]
</script>

<main>
    <div class="flex-1 overflow-auto">
        <div class="p-6">
            <div class="mb-6">
                <h1 class="text-3xl font-bold tracking-tight pb-8">Overview</h1>
                {#if isLoading}
                    <p>Loading your goals from Notion...</p>
                {:else if error}
                    <p style="color: red;">Error: {error}</p>
                {:else}
                    <div class="md:grid-cols-2 xl:grid-cols-3 grid grid-cols-1 gap-6">
                        {#each cardData as card}
                            <Card>
                                <CardHeader>
                                    <CardTitle class="text-sm font-medium text-muted-foreground">
                                        {card.title}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div class="text-2xl font-bold">
                                        {card.value}
                                    </div>
                                    <p class="text-xs text-muted-foreground mt-1">
                                        {#if card.chart}
                                            <Progress value={progress}/>
                                        {/if}
                                        {card.description}
                                    </p>
                                </CardContent>
                            </Card>
                        {/each}
                    </div>
                    <div class="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle class="text-2xl font-bold">Goals</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {#each goals as goal}
                                    <div
                                            class="flex cursor-pointer items-center justify-between"
                                            on:click={() => toggleGoal(goal.id)}
                                            on:keydown={(e) => e.key === 'Enter' && toggleGoal(goal.id)}
                                            role="button"
                                            tabindex="0"
                                    >
                                        <div class="flex items-center gap-2">
                                            <p class="text-lg font-medium text-card-foreground">{goal.name}</p>
                                        </div>
                                        <Badge
                                                class="h-5 min-w-5 rounded-full px-1.5 font-mono text-xs tabular-nums"
                                                variant="secondary"
                                        >
                                            {goal.progress.toFixed(0)}%
                                        </Badge>
                                    </div>

                                    <div class="my-4">
                                        <Progress value={goal.progress}/>
                                    </div>

                                    <p class="text-xs text-muted-foreground mt-1">{goal.subgoals.length} Subgoals</p>

                                    {#if expandedGoalId === goal.id}
                                        <div class="subgoals-container mt-4 pl-16">
                                            {#each goal.subgoals as subgoal}
                                                <div class="mb-3">
                                                    <div class="flex items-center justify-between mb-1.5">
                                                        <p class="text-md font-medium text-muted-foreground">
                                                            {subgoal.name}
                                                        </p>
                                                        <Badge
                                                                class="h-5 min-w-5 rounded-full px-1.5 font-mono text-xs tabular-nums"
                                                                variant="outline"
                                                        >
                                                            {subgoal.progress.toFixed(0)}%
                                                        </Badge>
                                                    </div>
                                                    <Progress value={subgoal.progress}/>
                                                </div>
                                            {/each}
                                        </div>
                                    {/if}
                                {/each}
                            </CardContent>
                        </Card>
                    </div>
                    <!--Badge
                            class="h-5 min-w-5 rounded-full px-1.5 font-mono text-xs tabular-nums"
                            variant="secondary"
                    >
                        {goal.progress.toFixed(0)}%
                    </Badge>
                </div>
                <Progress value={goal.progress}/>
            </div>
        {/each}
    </CardContent>
</Card>
</div-->
                {/if}
            </div>
        </div>
    </div>
</main>