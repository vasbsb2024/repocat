/**
 * RepoCat Engine - Core Service
 * Real-time GitHub Repository Metrics & Automation
 */

const axios = require('axios');
require('dotenv').config();

const REPO = process.env.GITHUB_REPO || 'facebook/react';
const INTERVAL = 30000; // 30 seconds

async function fetchRepoStats() {
    try {
        console.log(`[RepoCat] Fetching metrics for repository: ${REPO}...`);
        const response = await axios.get(`https://api.github.com/repos/${REPO}`);
        const { stargazers_count, forks_count, open_issues_count } = response.data;
        
        console.log('----------------------------------------');
        console.log(`⭐ Stars: ${stargazers_count}`);
        console.log(`🍴 Forks: ${forks_count}`);
        console.log(`🐛 Open Issues: ${open_issues_count}`);
        console.log('----------------------------------------');
    } catch (error) {
        console.error('[RepoCat Error] Failed to fetch repository stats:', error.message);
    }
}

console.log('🐾 RepoCat Daemon started successfully.');
setInterval(fetchRepoStats, INTERVAL);
fetchRepoStats();
