// ==========================================
// STUDYIQ
// Main JavaScript
// ==========================================


// ==========================================
// 1. LOAD SAVED STUDY SESSIONS
// ==========================================

let studySessions =
    JSON.parse(localStorage.getItem("studySessions")) || [];

let editingIndex = null;

const studyForm =
    document.getElementById("study-form");


// ==========================================
// 2. SAVE DATA
// ==========================================

function saveSessions() {

    localStorage.setItem(
        "studySessions",
        JSON.stringify(studySessions)
    );

}


// ==========================================
// 3. DISPLAY STUDY SESSIONS
// ==========================================

function displaySessions() {

    const sessionsContainer =
        document.getElementById(
            "sessions-container"
        );


    sessionsContainer.innerHTML = "";


    studySessions.forEach(function(session, index) {

        const sessionCard =
            document.createElement("div");


        sessionCard.classList.add(
            "session-card"
        );


        sessionCard.dataset.index = index;


        sessionCard.innerHTML = `

            <h3>
                ${session.subject}
            </h3>


            <p>
                ${session.topic}
            </p>


            <div class="session-details">

                <span>
                    ⏱ ${session.studyTime} minutes
                </span>

                <span>
                    Score: ${session.score}%
                </span>

                <span>
                    Difficulty: ${session.difficulty}
                </span>

                <span>
                    Confidence: ${session.confidence}
                </span>

            </div>


            <div class="session-actions">

                <button
                    class="edit-button"
                    type="button"
                >
                    Edit
                </button>


                <button
                    class="delete-button"
                    type="button"
                >
                    Delete
                </button>

            </div>

        `;


        sessionsContainer.appendChild(
            sessionCard
        );


        // ==========================================
        // EDIT BUTTON
        // ==========================================

        const editButton =
            sessionCard.querySelector(
                ".edit-button"
            );


        editButton.addEventListener(
            "click",
            function() {

                editingIndex = index;


                const sessionToEdit =
                    studySessions[index];


                document.getElementById(
                    "subject"
                ).value =
                    sessionToEdit.subject;


                document.getElementById(
                    "topic"
                ).value =
                    sessionToEdit.topic;


                document.getElementById(
                    "study-time"
                ).value =
                    sessionToEdit.studyTime;


                document.getElementById(
                    "score"
                ).value =
                    sessionToEdit.score;


                document.getElementById(
                    "difficulty"
                ).value =
                    sessionToEdit.difficulty;


                document.getElementById(
                    "confidence"
                ).value =
                    sessionToEdit.confidence;


                // Change button text while editing

                document.getElementById(
                    "save-session"
                ).textContent =
                    "Update Study Session";


                studyForm.scrollIntoView({
                    behavior: "smooth"
                });

            }
        );


        // ==========================================
        // DELETE BUTTON
        // ==========================================

        const deleteButton =
            sessionCard.querySelector(
                ".delete-button"
            );


        deleteButton.addEventListener(
            "click",
            function() {

                const confirmed =
                    confirm(
                        "Are you sure you want to delete this study session?"
                    );


                if (!confirmed) {

                    return;

                }


                studySessions.splice(
                    index,
                    1
                );


                saveSessions();


                // If the deleted session was
                // being edited, cancel editing.

                if (
                    editingIndex === index
                ) {

                    editingIndex = null;

                    studyForm.reset();


                    document.getElementById(
                        "save-session"
                    ).textContent =
                        "Save Study Session";

                }


                // If the deleted item was before
                // the item currently being edited,
                // adjust the index.

                else if (
                    editingIndex !== null &&
                    index < editingIndex
                ) {

                    editingIndex--;

                }


                updateDashboard();

            }
        );

    });

}


// ==========================================
// 4. CALCULATE GENERAL STATISTICS
// ==========================================

function calculateStatistics() {

    let totalMinutes = 0;

    let totalScore = 0;


    studySessions.forEach(function(session) {

        totalMinutes +=
            Number(session.studyTime);


        totalScore +=
            Number(session.score);

    });


    const totalHours =
        totalMinutes / 60;


    let averageScore = 0;


    if (
        studySessions.length > 0
    ) {

        averageScore =
            totalScore /
            studySessions.length;

    }


    document.getElementById(
        "total-hours"
    ).textContent =
        totalHours.toFixed(1);


    document.getElementById(
        "average-score"
    ).textContent =
        averageScore.toFixed(1) + "%";

}


// ==========================================
// 5. CALCULATE SUBJECT PERFORMANCE
// ==========================================

function calculateSubjectPerformance() {

    const subjectScores = {};


    studySessions.forEach(function(session) {

        if (
            !subjectScores[session.subject]
        ) {

            subjectScores[session.subject] = [];

        }


        subjectScores[
            session.subject
        ].push(
            Number(session.score)
        );

    });


    const performanceContainer =
        document.getElementById(
            "subject-performance"
        );


    performanceContainer.innerHTML = "";


    for (
        const subject in subjectScores
    ) {

        const scores =
            subjectScores[subject];


        const total =
            scores.reduce(
                function(sum, score) {

                    return sum + score;

                },
                0
            );


        const average =
            total / scores.length;


        const subjectRow =
            document.createElement("div");


        subjectRow.classList.add(
            "subject"
        );


        subjectRow.innerHTML = `

            <span>
                ${subject}
            </span>


            <strong>
                ${average.toFixed(1)}%
            </strong>

        `;


        performanceContainer.appendChild(
            subjectRow
        );

    }


    // Empty state

    if (
        studySessions.length === 0
    ) {

        performanceContainer.innerHTML =
            "<p>No study data yet.</p>";

    }

}


// ==========================================
// 6. CREATE PERFORMANCE CHART
// ==========================================

function createPerformanceChart() {

    const subjectScores = {};


    studySessions.forEach(function(session) {

        if (
            !subjectScores[session.subject]
        ) {

            subjectScores[session.subject] = [];

        }


        subjectScores[
            session.subject
        ].push(
            Number(session.score)
        );

    });


    const subjects = [];

    const averages = [];


    for (
        const subject in subjectScores
    ) {

        const scores =
            subjectScores[subject];


        const total =
            scores.reduce(
                function(sum, score) {

                    return sum + score;

                },
                0
            );


        const average =
            total / scores.length;


        subjects.push(subject);


        averages.push(
            Number(
                average.toFixed(1)
            )
        );

    }


    const chartCanvas =
        document.getElementById(
            "performance-chart"
        );


    if (!chartCanvas) {

        return;

    }


    const existingChart =
        Chart.getChart(
            chartCanvas
        );


    if (existingChart) {

        existingChart.destroy();

    }


    new Chart(
        chartCanvas,
        {

            type: "bar",


            data: {

                labels: subjects,


                datasets: [

                    {

                        label:
                            "Average Score (%)",

                        data:
                            averages

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

        }
    );

}


// ==========================================
// 7. CREATE STUDY TIME CHART
// ==========================================

function createStudyTimeChart() {

    const subjectStudyTime = {};


    studySessions.forEach(function(session) {

        if (
            !subjectStudyTime[
                session.subject
            ]
        ) {

            subjectStudyTime[
                session.subject
            ] = 0;

        }


        subjectStudyTime[
            session.subject
        ] +=
            Number(session.studyTime);

    });


    const subjects = [];

    const studyTimes = [];


    for (
        const subject in subjectStudyTime
    ) {

        subjects.push(subject);


        studyTimes.push(
            subjectStudyTime[subject]
        );

    }


    const chartCanvas =
        document.getElementById(
            "study-time-chart"
        );


    if (!chartCanvas) {

        return;

    }


    const existingChart =
        Chart.getChart(
            chartCanvas
        );


    if (existingChart) {

        existingChart.destroy();

    }


    new Chart(
        chartCanvas,
        {

            type: "bar",


            data: {

                labels: subjects,


                datasets: [

                    {

                        label:
                            "Study Time (minutes)",

                        data:
                            studyTimes

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

        }
    );

}


// ==========================================
// 8. DETECT WEAK TOPICS
// ==========================================

function detectWeakTopics() {

    const weakScoreThreshold = 75;

    const topicScores = {};


    studySessions.forEach(function(session) {

        if (
            !topicScores[session.topic]
        ) {

            topicScores[
                session.topic
            ] = [];

        }


        topicScores[
            session.topic
        ].push(
            Number(session.score)
        );

    });


    const weakTopics = [];


    for (
        const topic in topicScores
    ) {

        const scores =
            topicScores[topic];


        const total =
            scores.reduce(
                function(sum, score) {

                    return sum + score;

                },
                0
            );


        const average =
            total / scores.length;


        if (
            average <
            weakScoreThreshold
        ) {

            weakTopics.push({

                topic: topic,

                score: average

            });

        }

    }


    // Sort weakest topics first

    weakTopics.sort(
        function(a, b) {

            return a.score - b.score;

        }
    );


    const weakTopicsContainer =
        document.getElementById(
            "weak-topics"
        );


    weakTopicsContainer.innerHTML = "";


    if (
        weakTopics.length === 0
    ) {

        weakTopicsContainer.innerHTML =
            "<p>No weak topics detected yet. Keep going! 🎉</p>";

        return;

    }


    weakTopics.forEach(function(item) {

        const topicElement =
            document.createElement("div");


        topicElement.classList.add(
            "weak-topic-item"
        );


        topicElement.innerHTML = `

            <strong>
                ${item.topic}
            </strong>


            <span>
                ${item.score.toFixed(1)}%
            </span>

        `;


        weakTopicsContainer.appendChild(
            topicElement
        );

    });

}


// ==========================================
// 9. ANALYZE TOPICS
// ==========================================
//
// This function is shared by both:
// - Recommendation
// - Revision Queue
//
// This prevents the two systems from
// calculating completely different priorities.
// ==========================================

function analyzeTopics() {

    const topicData = {};


    studySessions.forEach(function(session) {

        if (
            !topicData[session.topic]
        ) {

            topicData[session.topic] = {

                scores: [],

                confidence: [],

                difficulty: [],

                studyTime: 0,

                lastStudied:
                    session.date

            };

        }


        topicData[
            session.topic
        ].scores.push(
            Number(session.score)
        );


        topicData[
            session.topic
        ].confidence.push(
            session.confidence
        );


        topicData[
            session.topic
        ].difficulty.push(
            session.difficulty
        );


        topicData[
            session.topic
        ].studyTime +=
            Number(session.studyTime);


        // Keep the most recent date

        if (
            new Date(session.date) >
            new Date(
                topicData[
                    session.topic
                ].lastStudied
            )
        ) {

            topicData[
                session.topic
            ].lastStudied =
                session.date;

        }

    });


    const topics = [];


    for (
        const topic in topicData
    ) {

        const data =
            topicData[topic];


        // ==========================================
        // AVERAGE SCORE
        // ==========================================

        const totalScore =
            data.scores.reduce(
                function(sum, score) {

                    return sum + score;

                },
                0
            );


        const averageScore =
            totalScore /
            data.scores.length;


        // ==========================================
        // LATEST CONFIDENCE
        // ==========================================

        const latestConfidence =
            data.confidence[
                data.confidence.length - 1
            ];


        let confidenceFactor = 0;


        if (
            latestConfidence === "Low"
        ) {

            confidenceFactor = 15;

        }

        else if (
            latestConfidence === "Medium"
        ) {

            confidenceFactor = 7;

        }


        // ==========================================
        // LATEST DIFFICULTY
        // ==========================================

        const latestDifficulty =
            data.difficulty[
                data.difficulty.length - 1
            ];


        let difficultyFactor = 0;


        if (
            latestDifficulty === "Hard"
        ) {

            difficultyFactor = 10;

        }

        else if (
            latestDifficulty === "Medium"
        ) {

            difficultyFactor = 5;

        }


        // ==========================================
        // STUDY TIME FACTOR
        // ==========================================

        let studyTimeFactor = 0;


        if (
            data.studyTime < 60
        ) {

            studyTimeFactor = 10;

        }

        else if (
            data.studyTime < 120
        ) {

            studyTimeFactor = 5;

        }


        // ==========================================
        // RECENCY
        // ==========================================

        const today =
            new Date();


        const lastStudied =
            new Date(
                data.lastStudied
            );


        const daysSinceStudied =
            Math.max(
                0,
                Math.floor(
                    (
                        today -
                        lastStudied
                    ) /
                    (
                        1000 *
                        60 *
                        60 *
                        24
                    )
                )
            );


        let recencyFactor = 0;


        if (
            daysSinceStudied >= 7
        ) {

            recencyFactor = 15;

        }

        else if (
            daysSinceStudied >= 4
        ) {

            recencyFactor = 10;

        }

        else if (
            daysSinceStudied >= 2
        ) {

            recencyFactor = 5;

        }


        // ==========================================
        // PRIORITY SCORE
        // ==========================================
        //
        // Score:
        // Maximum 50 points
        //
        // Confidence:
        // Maximum 15 points
        //
        // Difficulty:
        // Maximum 10 points
        //
        // Study time:
        // Maximum 10 points
        //
        // Recency:
        // Maximum 15 points
        //
        // Total maximum = 100
        // ==========================================

        const scoreFactor =
            (100 - averageScore) *
            0.5;


        const priority =
            scoreFactor +
            confidenceFactor +
            difficultyFactor +
            studyTimeFactor +
            recencyFactor;


        // ==========================================
        // RECOMMENDED REVISION TIME
        // ==========================================

        let revisionTime = 30;


        if (
            priority >= 70
        ) {

            revisionTime = 60;

        }

        else if (
            priority >= 50
        ) {

            revisionTime = 45;

        }


        topics.push({

            topic: topic,

            score: averageScore,

            confidence:
                latestConfidence,

            difficulty:
                latestDifficulty,

            studyTime:
                data.studyTime,

            lastStudied:
                data.lastStudied,

            daysSinceStudied:
                days