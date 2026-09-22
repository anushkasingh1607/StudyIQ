// ==========================================
// STUDYIQ
// Main JavaScript
// ==========================================

const STORAGE_KEY = "studySessions";

let studySessions = loadSessions();
let editingIndex = null;

const studyForm = document.getElementById("study-form");
const saveButton = document.getElementById("save-session");

// ==========================================
// 1. LOAD / SAVE DATA
// ==========================================

function loadSessions() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        const parsed = saved ? JSON.parse(saved) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.error("Could not load StudyIQ data:", error);
        return [];
    }
}

function saveSessions() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(studySessions));
        return true;
    } catch (error) {
        console.error("Could not save StudyIQ data:", error);
        alert("StudyIQ could not save your session in this browser.");
        return false;
    }
}

// ==========================================
// 2. HELPERS
// ==========================================

function escapeHTML(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function getTodayString() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function daysBetween(dateA, dateB) {
    const a = new Date(`${dateA}T00:00:00`);
    const b = new Date(`${dateB}T00:00:00`);
    const difference = Math.floor((a - b) / 86400000);
    return Math.max(0, difference);
}

function getLatestTopicData(topic) {
    const sessions = studySessions
        .filter(session => session.topic === topic)
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    return sessions[0] || null;
}

// ==========================================
// 3. DISPLAY STUDY SESSIONS
// ==========================================

function displaySessions() {
    const container = document.getElementById("sessions-container");
    container.innerHTML = "";

    if (studySessions.length === 0) {
        container.innerHTML = "<p>No study sessions yet. Add your first session above.</p>";
        return;
    }

    studySessions.forEach((session, index) => {
        const card = document.createElement("div");
        card.className = "session-card";

        card.innerHTML = `
            <h3>${escapeHTML(session.subject)}</h3>
            <p>${escapeHTML(session.topic)}</p>

            <div class="session-details">
                <span>⏱ ${Number(session.studyTime)} minutes</span>
                <span>Score: ${Number(session.score)}%</span>
                <span>Difficulty: ${escapeHTML(session.difficulty)}</span>
                <span>Confidence: ${escapeHTML(session.confidence)}</span>
            </div>

            <div class="session-actions">
                <button class="edit-button" type="button">Edit</button>
                <button class="delete-button" type="button">Delete</button>
            </div>
        `;

        container.appendChild(card);

        card.querySelector(".edit-button").addEventListener("click", () => {
            startEditing(index);
        });

        card.querySelector(".delete-button").addEventListener("click", () => {
            deleteSession(index);
        });
    });
}

// ==========================================
// 4. EDIT / DELETE
// ==========================================

function startEditing(index) {
    const session = studySessions[index];

    if (!session) return;

    editingIndex = index;

    document.getElementById("subject").value = session.subject;
    document.getElementById("topic").value = session.topic;
    document.getElementById("study-time").value = session.studyTime;
    document.getElementById("score").value = session.score;
    document.getElementById("difficulty").value = session.difficulty;
    document.getElementById("confidence").value = session.confidence;

    saveButton.textContent = "Update Study Session";

    studyForm.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
}

function deleteSession(index) {
    if (!confirm("Are you sure you want to delete this study session?")) {
        return;
    }

    studySessions.splice(index, 1);

    if (editingIndex === index) {
        editingIndex = null;
        studyForm.reset();
        saveButton.textContent = "Save Study Session";
    } else if (editingIndex !== null && index < editingIndex) {
        editingIndex--;
    }

    saveSessions();
    updateDashboard();
}

// ==========================================
// 5. GENERAL STATISTICS
// ==========================================

function calculateStatistics() {
    const totalMinutes = studySessions.reduce(
        (sum, session) => sum + Number(session.studyTime || 0),
        0
    );

    const totalScore = studySessions.reduce(
        (sum, session) => sum + Number(session.score || 0),
        0
    );

    const totalHours = totalMinutes / 60;

    const averageScore = studySessions.length
        ? totalScore / studySessions.length
        : 0;

    document.getElementById("total-hours").textContent =
        totalHours.toFixed(1);

    document.getElementById("average-score").textContent =
        `${averageScore.toFixed(1)}%`;
}

// ==========================================
// 6. SUBJECT PERFORMANCE
// ==========================================

function calculateSubjectPerformance() {
    const container = document.getElementById("subject-performance");
    const subjectScores = {};

    studySessions.forEach(session => {
        if (!subjectScores[session.subject]) {
            subjectScores[session.subject] = [];
        }

        subjectScores[session.subject].push(Number(session.score));
    });

    container.innerHTML = "";

    const subjects = Object.keys(subjectScores);

    if (subjects.length === 0) {
        container.innerHTML = "<p>No study data yet.</p>";
        return;
    }

    subjects.forEach(subject => {
        const scores = subjectScores[subject];
        const average =
            scores.reduce((sum, score) => sum + score, 0) / scores.length;

        const row = document.createElement("div");
        row.className = "subject";

        row.innerHTML = `
            <span>${escapeHTML(subject)}</span>
            <strong>${average.toFixed(1)}%</strong>
        `;

        container.appendChild(row);
    });
}

// ==========================================
// 7. CHARTS
// ==========================================

function destroyChart(canvasId) {
    if (typeof Chart === "undefined") {
        return;
    }

    const canvas = document.getElementById(canvasId);

    if (!canvas) return;

    const existing = Chart.getChart(canvas);

    if (existing) {
        existing.destroy();
    }
}

function createPerformanceChart() {
    if (typeof Chart === "undefined") {
        console.warn("Chart.js is not available.");
        return;
    }

    const subjectScores = {};

    studySessions.forEach(session => {
        if (!subjectScores[session.subject]) {
            subjectScores[session.subject] = [];
        }

        subjectScores[session.subject].push(Number(session.score));
    });

    const subjects = Object.keys(subjectScores);

    const averages = subjects.map(subject => {
        const scores = subjectScores[subject];

        return Number(
            (
                scores.reduce((sum, score) => sum + score, 0) /
                scores.length
            ).toFixed(1)
        );
    });

    destroyChart("performance-chart");

    new Chart(document.getElementById("performance-chart"), {
        type: "bar",
        data: {
            labels: subjects,
            datasets: [
                {
                    label: "Average Score (%)",
                    data: averages
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });
}

function createStudyTimeChart() {
    if (typeof Chart === "undefined") {
        console.warn("Chart.js is not available.");
        return;
    }

    const subjectStudyTime = {};

    studySessions.forEach(session => {
        if (!subjectStudyTime[session.subject]) {
            subjectStudyTime[session.subject] = 0;
        }

        subjectStudyTime[session.subject] += Number(session.studyTime);
    });

    const subjects = Object.keys(subjectStudyTime);
    const studyTimes = subjects.map(subject => subjectStudyTime[subject]);

    destroyChart("study-time-chart");

    new Chart(document.getElementById("study-time-chart"), {
        type: "bar",
        data: {
            labels: subjects,
            datasets: [
                {
                    label: "Study Time (minutes)",
                    data: studyTimes
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// ==========================================
// 8. WEAK TOPICS
// ==========================================

function detectWeakTopics() {
    const threshold = 75;
    const topicScores = {};

    studySessions.forEach(session => {
        if (!topicScores[session.topic]) {
            topicScores[session.topic] = [];
        }

        topicScores[session.topic].push(Number(session.score));
    });

    const weakTopics = Object.entries(topicScores)
        .map(([topic, scores]) => ({
            topic,
            score:
                scores.reduce((sum, score) => sum + score, 0) /
                scores.length
        }))
        .filter(item => item.score < threshold)
        .sort((a, b) => a.score - b.score);

    const container = document.getElementById("weak-topics");
    container.innerHTML = "";

    if (weakTopics.length === 0) {
        container.innerHTML =
            "<p>No weak topics detected yet. Keep going! 🎉</p>";
        return;
    }

    weakTopics.forEach(item => {
        const element = document.createElement("div");
        element.className = "weak-topic-item";

        element.innerHTML = `
            <strong>${escapeHTML(item.topic)}</strong>
            <span>${item.score.toFixed(1)}%</span>
        `;

        container.appendChild(element);
    });
}

// ==========================================
// 9. TOPIC ANALYSIS
// ==========================================

function analyzeTopics() {
    const topicData = {};

    studySessions.forEach(session => {
        if (!topicData[session.topic]) {
            topicData[session.topic] = {
                sessions: [],
                studyTime: 0
            };
        }

        topicData[session.topic].sessions.push(session);
        topicData[session.topic].studyTime += Number(session.studyTime);
    });

    return Object.entries(topicData)
        .map(([topic, data]) => {
            const sessions = [...data.sessions].sort(
                (a, b) => new Date(a.date) - new Date(b.date)
            );

            const averageScore =
                sessions.reduce(
                    (sum, session) => sum + Number(session.score),
                    0
                ) / sessions.length;

            const latest = sessions[sessions.length - 1];

            const daysSinceStudied = daysBetween(
                getTodayString(),
                latest.date
            );

            let confidenceFactor = 0;
            if (latest.confidence === "Low") {
                confidenceFactor = 15;
            } else if (latest.confidence === "Medium") {
                confidenceFactor = 7;
            }

            let difficultyFactor = 0;
            if (latest.difficulty === "Hard") {
                difficultyFactor = 10;
            } else if (latest.difficulty === "Medium") {
                difficultyFactor = 5;
            }

            let studyTimeFactor = 0;
            if (data.studyTime < 60) {
                studyTimeFactor = 10;
            } else if (data.studyTime < 120) {
                studyTimeFactor = 5;
            }

            let recencyFactor = 0;
            if (daysSinceStudied >= 7) {
                recencyFactor = 15;
            } else if (daysSinceStudied >= 4) {
                recencyFactor = 10;
            } else if (daysSinceStudied >= 2) {
                recencyFactor = 5;
            }

            const scoreFactor = Math.max(
                0,
                (100 - averageScore) * 0.5
            );

            const priority =
                scoreFactor +
                confidenceFactor +
                difficultyFactor +
                studyTimeFactor +
                recencyFactor;

            let revisionTime = 30;

            if (priority >= 70) {
                revisionTime = 60;
            } else if (priority >= 50) {
                revisionTime = 45;
            }

            return {
                topic,
                score: averageScore,
                confidence: latest.confidence,
                difficulty: latest.difficulty,
                studyTime: data.studyTime,
                lastStudied: latest.date,
                daysSinceStudied,
                priority,
                revisionTime
            };
        })
        .sort((a, b) => b.priority - a.priority);
}

// ==========================================
// 10. RECOMMENDATION
// ==========================================

function generateRecommendation() {
    const element = document.getElementById("recommendation-text");

    if (studySessions.length === 0) {
        element.textContent =
            "Add some study sessions to receive a personalized recommendation.";
        return;
    }

    const topics = analyzeTopics();

    if (!topics.length) {
        element.textContent =
            "Add some study sessions to receive a personalized recommendation.";
        return;
    }

    const top = topics[0];

    element.innerHTML = `
        <strong>Focus on ${escapeHTML(top.topic)}.</strong>
        <br><br>
        Your average score is ${top.score.toFixed(1)}%, with
        ${escapeHTML(top.confidence.toLowerCase())} confidence and
        ${escapeHTML(top.difficulty.toLowerCase())} difficulty.
        <br><br>
        StudyIQ gives this topic a
        <strong>priority score of ${top.priority.toFixed(0)}/100</strong>.
    `;
}

// ==========================================
// 11. ADAPTIVE REVISION QUEUE
// ==========================================

function createRevisionQueue() {
    const container = document.getElementById("revision-queue");
    container.innerHTML = "";

    if (studySessions.length === 0) {
        container.innerHTML =
            "<p>Add some study sessions to build your revision queue.</p>";
        return;
    }

    const topics = analyzeTopics().slice(0, 3);

    topics.forEach((item, index) => {
        const card = document.createElement("div");
        card.className = "revision-card";

        let studiedText = "Studied today";

        if (item.daysSinceStudied === 1) {
            studiedText = "Studied 1 day ago";
        } else if (item.daysSinceStudied > 1) {
            studiedText = `Studied ${item.daysSinceStudied} days ago`;
        }

        card.innerHTML = `
            <div class="revision-header">
                <div>
                    <span class="revision-number">#${index + 1}</span>
                    <strong>${escapeHTML(item.topic)}</strong>
                </div>
                <span class="priority-score">
                    ${item.priority.toFixed(0)}/100
                </span>
            </div>

            <div class="revision-details">
                <span>Score: ${item.score.toFixed(1)}%</span>
                <span>${studiedText}</span>
                <span>Revision: ${item.revisionTime} min</span>
            </div>
        `;

        container.appendChild(card);
    });
}

// ==========================================
// 12. STUDY STREAK
// ==========================================

function calculateStudyStreak() {
    const dates = [
        ...new Set(
            studySessions
                .map(session => session.date)
                .filter(Boolean)
        )
    ].sort((a, b) => new Date(b) - new Date(a));

    const streakElement = document.getElementById("study-streak");

    if (dates.length === 0) {
        streakElement.textContent = "0";
        return;
    }

    // A streak counts consecutive study dates ending on today.
    const today = getTodayString();

    if (dates[0] !== today) {
        streakElement.textContent = "0";
        return;
    }

    let streak = 1;

    for (let i = 0; i < dates.length - 1; i++) {
        const difference = daysBetween(dates[i], dates[i + 1]);

        if (difference === 1) {
            streak++;
        } else {
            break;
        }
    }

    streakElement.textContent = String(streak);
}

// ==========================================
// 13. FORM SUBMISSION
// ==========================================

studyForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const subject = document.getElementById("subject").value;
    const topic = document.getElementById("topic").value.trim();
    const studyTime = Number(document.getElementById("study-time").value);
    const score = Number(document.getElementById("score").value);
    const difficulty = document.getElementById("difficulty").value;
    const confidence = document.getElementById("confidence").value;

    if (!subject || !topic || !difficulty || !confidence) {
        alert("Please complete all fields.");
        return;
    }

    if (!Number.isFinite(studyTime) || studyTime <= 0) {
        alert("Please enter a valid study time.");
        return;
    }

    if (!Number.isFinite(score) || score < 0 || score > 100) {
        alert("Please enter a score between 0 and 100.");
        return;
    }

    const sessionDate =
        editingIndex !== null && studySessions[editingIndex]
            ? studySessions[editingIndex].date
            : getTodayString();

    const session = {
        subject,
        topic,
        studyTime,
        score,
        difficulty,
        confidence,
        date: sessionDate
    };

    if (editingIndex !== null) {
        studySessions[editingIndex] = session;
        editingIndex = null;
    } else {
        studySessions.push(session);
    }

    if (!saveSessions()) {
        return;
    }

    studyForm.reset();
    saveButton.textContent = "Save Study Session";

    updateDashboard();

    document
        .getElementById("sessions-container")
        .lastElementChild
        ?.scrollIntoView({
            behavior: "smooth",
            block: "nearest"
        });
});

// ==========================================
// 14. UPDATE DASHBOARD
// ==========================================

function updateDashboard() {
    displaySessions();
    calculateStatistics();
    calculateSubjectPerformance();
    createPerformanceChart();
    createStudyTimeChart();
    detectWeakTopics();
    generateRecommendation();
    createRevisionQueue();
    calculateStudyStreak();
}

// ==========================================
// 15. INITIALIZE
// ==========================================

updateDashboard();
