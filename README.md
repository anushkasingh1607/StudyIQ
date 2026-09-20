# StudyIQ 📚

StudyIQ is an adaptive study and performance analytics web app designed to help students understand their study habits, identify weak topics, and prioritize revision.

The application combines study-session tracking with performance analysis to generate personalized revision recommendations.

## ✨ Features

- 📊 **Study Dashboard**
  - Total study hours
  - Average test score
  - Study streak

- 📝 **Study Session Tracking**
  - Record subject and topic
  - Track study time
  - Add test or quiz scores
  - Record topic difficulty
  - Record confidence level

- 📈 **Performance Analytics**
  - Average score by subject
  - Study time by subject
  - Interactive charts using Chart.js

- 🎯 **Weak Topic Detection**
  - Identifies topics with lower performance
  - Sorts weak topics by average score

- 🧠 **Adaptive Revision Queue**
  - Prioritizes topics using:
    - Performance
    - Confidence
    - Difficulty
    - Study time
    - Recency of study

- 💡 **Personalized Recommendations**
  - Suggests which topic to focus on based on the calculated priority score

- ✏️ **Session Management**
  - Edit existing study sessions
  - Delete study sessions

- 💾 **Local Data Storage**
  - Study sessions are saved using the browser's localStorage
  - Data remains available when the application is reopened in the same browser

- 📱 **Responsive Design**
  - Designed to work across desktop and mobile screen sizes

## 🛠️ Technologies Used

- HTML5
- CSS3
- JavaScript
- Chart.js
- Browser localStorage

## 🧩 How It Works

StudyIQ calculates a priority score for each studied topic using several factors.

The system considers:

- Average performance
- Confidence level
- Topic difficulty
- Total study time
- Time since the topic was last studied

Topics with higher priority scores are placed higher in the adaptive revision queue.

## 🚀 Running the Project

No installation or build tools are required.

1. Download or clone this repository.
2. Open `index.html` in a web browser.
3. Add your study sessions.
4. Explore your performance analytics and revision recommendations.

## 📁 Project Structure

```text
StudyIQ/
├── index.html
├── style.css
└── script.js
