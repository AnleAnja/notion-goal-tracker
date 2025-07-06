const { Client } = require("@notionhq/client");
require("dotenv").config();

const notion = new Client({ auth: process.env.NOTION_TOKEN });

const GOAL_ID = process.env.GOAL_ID;
const SUBGOAL_ID = process.env.SUBGOAL_ID;
const TASK_ID = process.env.TASK_ID;

function getTitle(property) {
    return property?.title?.[0]?.plain_text || "";
}

function getDate(property) {
    return property?.date?.start || null;
}

function getCheckbox(property) {
    return property?.checkbox || false;
}

function getProgress(property) {
    return property?.number || 0;
}

function getParentId(property) {
    return property?.relation[0]?.id || "NEIN";
}

async function fetchAllData() {
    try {
        console.log("Fetching data from Notion...");
        const [goalsResponse, subgoalsResponse, tasksResponse] = await Promise.all([
            notion.databases.query({ database_id: GOAL_ID }),
            notion.databases.query({ database_id: SUBGOAL_ID }),
            notion.databases.query({ database_id: TASK_ID }),
        ]);

        console.log("Success! Data received.");

        const goals = new Map()
        const subgoals = new Map()
        const tasks = new Map()

        goalsResponse.results.forEach(page => {
            const goal = {
                id: page.id,
                name: getTitle(page.properties.Name),
                progress: 0.0,
                subgoals: []
            }
            goals.set(goal.id, goal)
        })

        subgoalsResponse.results.forEach(page => {
            const subgoal = {
                id: page.id,
                name: getTitle(page.properties.Name),
                progress: 0.0,
                due: getDate(page.properties.Due),
                tasks: []
            }
            const parentId = getParentId(page.properties["Main Goal"])
            if(goals.get(parentId)) goals.get(parentId).subgoals.push(subgoal)
            subgoals.set(subgoal.id, subgoal)
        })

        tasksResponse.results.forEach(page => {
            const task = {
                id: page.id,
                name: getTitle(page.properties.Name),
                done: getCheckbox(page.properties.Done),
                due: getDate(page.properties.Due),
            };
            const parentId = getParentId(page.properties["Subgoal"])
            if(subgoals.get(parentId)) subgoals.get(parentId).tasks.push(task)
            tasks.set(task.id, task)
        })

        goals.forEach(goal => {
            let sum = 0
            goal.subgoals.forEach(subgoal => {
                let count = 0
                subgoal.tasks.forEach(task => {
                    if(task.done) count++
                })
                subgoal.progress = (count / subgoal.tasks.length) * 100
                sum += subgoal.progress
            })
            goal.progress = sum / goal.subgoals.length
        })
        const data = Array.from(goals.values());
        const jsonString = JSON.stringify(data, null, 2);
        console.log(jsonString);
        return Array.from(goals.values());

    } catch (error) {
        console.error("Error fetching data from Notion:");
        console.error("Full error:", error);
        console.error("Error message:", error.message);
        console.error("Error body:", error.body);
    }
}

module.exports = {fetchAllData};