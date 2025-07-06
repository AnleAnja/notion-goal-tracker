const express = require("express");
const cors = require("cors");
const { fetchAllData } = require("./index.js");

const app = express();
const PORT = 3000;

app.use(cors());

app.get("/api/goals", async (req, res) => {
    try {
        console.log("Received request for /api/goals");
        const data = await fetchAllData();
        res.json(data);
    } catch (error) {
        console.error("API Error:", error);
        res.status(500).json({ message: "Failed to fetch data from Notion" });
    }
});

app.listen(PORT, () => {
    console.log(`Backend server is running at http://localhost:${PORT}`);
});