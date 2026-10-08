const API_BASE = "http://127.0.0.1:8000/api";
let currentUserId = null; // Enforced security
let chartInstance = null;

// Login Integration
async function handleLogin() {
    const userField = document.getElementById('login-username').value.trim();
    const passField = document.getElementById('login-password').value.trim();
    const errorEl = document.getElementById('login-error');
    
    errorEl.classList.add('hidden');
    if (!userField || !passField) return;

    try {
        const response = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: userField, password: passField })
        });
        
        if (!response.ok) {
            errorEl.classList.remove('hidden');
            return;
        }
        
        const data = await response.json();
        currentUserId = data.user_id;

        // Switch out of login wrapper
        document.getElementById('login-wrapper').classList.remove('active-wrapper');
        document.getElementById('app-wrapper').classList.remove('hidden');
        
        // Load default context
        document.querySelector('.bot-message .bubble').innerText = `Welcome back, ${data.username}. How are you feeling today?`;
        
    } catch (error) {
        console.error("Login failed", error);
        errorEl.classList.remove('hidden');
    }
}

// UI Switch
function switchView(view) {
    if (!currentUserId) return; // Prevent navigation if not logged in
    
    document.querySelector('.active-view')?.classList.remove('active-view');
    document.querySelector('.active-view')?.classList.add('hidden');
    
    document.querySelectorAll('.view').forEach(el => el.classList.add('hidden'));
    document.getElementById(`${view}-view`).classList.remove('hidden');
    document.getElementById(`${view}-view`).classList.add('active-view');

    document.querySelectorAll('.nav-links li').forEach(el => el.classList.remove('active'));
    event.currentTarget.classList.add('active');

    if (view === 'dashboard') {
        loadUsers();
    }
}

// Chat Functionality
function handleKeyPress(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
}

async function sendMessage() {
    const inputField = document.getElementById('user-input');
    const text = inputField.value.trim();
    if (!text) return;

    // Output User Message
    appendMessage(text, 'user');
    inputField.value = '';

    // Show Typing Indicator
    document.getElementById('typing-indicator').classList.remove('hidden');

    try {
        const response = await fetch(`${API_BASE}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: currentUserId, text: text })
        });
        
        if (!response.ok) throw new Error('API Error');
        const data = await response.json();
        
        setTimeout(() => {
            document.getElementById('typing-indicator').classList.add('hidden');
            appendMessage(data.bot_response, 'bot', data.actions, data.suggestion_data);
            scrollToBottom();
        }, 1200); // Simulate natural typing delay

    } catch (error) {
        console.error("Error sending message:", error);
        document.getElementById('typing-indicator').classList.add('hidden');
        appendMessage("I'm sorry, I'm having trouble connecting to my server right now.", 'bot');
    }
}

function appendMessage(text, sender, actions = [], suggestionData = null) {
    const container = document.getElementById('chat-messages');
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${sender}-message`;
    
    // Construct action buttons HTML
    let buttonsHtml = '';
    if (actions && actions.length > 0) {
        buttonsHtml = '<div class="bubble-actions">';
        actions.forEach(action => {
            let label = "Activity";
            if(action === "start_breathing") label = "Begin Breathing Exercise";
            else if(action === "show_tips") label = "Show Relaxation Tip";
            else if(action === "daily_activity") label = "View Daily Activity";
            
            // Serialize data for onClick and ensure single quotes are escaped so they don't break the HTML attribute
            const dataStr = suggestionData ? encodeURIComponent(JSON.stringify(suggestionData)).replace(/'/g, "%27") : '';
            buttonsHtml += `<button class="action-btn" onclick="triggerAction('${action}', '${dataStr}')">${label}</button>`;
        });
        buttonsHtml += '</div>';
    }

    // Add affirmation block text if present
    let finalText = text;
    if (sender === 'bot' && suggestionData && suggestionData.affirmation) {
        finalText += `<br><br><i>"${suggestionData.affirmation}"</i>`;
    }

    msgDiv.innerHTML = `
        <div class="avatar">${sender === 'user' ? '👤' : '🌿'}</div>
        <div class="bubble">
            ${finalText}
            ${buttonsHtml}
        </div>
    `;
    
    container.appendChild(msgDiv);
    scrollToBottom();
}

function scrollToBottom() {
    const container = document.getElementById('chat-messages');
    container.scrollTop = container.scrollHeight;
}

// Dashboard Functionality
async function loadUsers() {
    try {
        const response = await fetch(`${API_BASE}/users`);
        const users = await response.json();
        const list = document.getElementById('user-list');
        list.innerHTML = '';
        
        document.getElementById('stat-total-users').innerText = users.length;
        
        if (users.length === 0) {
            list.innerHTML = '<li>No users found.</li>';
            document.getElementById('stat-avg-mood').innerText = 'N/A';
            return;
        }

        let totalScore = 0;
        let logCount = 0;
        let alerts = 0;

        for (const u of users) {
            const li = document.createElement('li');
            li.innerHTML = `User #${u.id} - ${u.username}`;
            li.onclick = () => loadUserTrends(u.id);
            list.appendChild(li);
            
            // Gather stats
            try {
                const trRes = await fetch(`${API_BASE}/users/${u.id}/trends`);
                const trData = await trRes.json();
                trData.mood_logs.forEach(log => {
                    totalScore += log.score;
                    logCount++;
                    if (log.score >= 0.7) alerts++;
                });
            } catch(e) {}
        }
        
        // Update Stats UI
        if (logCount > 0) {
            const avg = totalScore / logCount;
            document.getElementById('stat-avg-mood').innerText = avg.toFixed(2);
        } else {
            document.getElementById('stat-avg-mood').innerText = '--';
        }
        document.getElementById('stat-alerts').innerText = alerts;
        
        // Auto load first user if no selection
        if(users.length > 0) loadUserTrends(users[0].id);

    } catch (error) {
        console.error("Failed to load users", error);
    }
}

async function loadUserTrends(userId) {
    // style active
    const listItems = document.querySelectorAll('#user-list li');
    listItems.forEach(el => el.classList.remove('active-user'));
    event?.currentTarget?.classList.add('active-user');
    
    document.getElementById('current-user-display').innerText = `#${userId}`;

    try {
        const response = await fetch(`${API_BASE}/users/${userId}/trends`);
        const data = await response.json();
        
        renderChart(data.mood_logs);
        checkRisk(data.mood_logs);
        
    } catch (error) {
        console.error("Failed to load trends", error);
    }
}

function renderChart(logs) {
    const ctx = document.getElementById('moodChart').getContext('2d');
    
    const labels = logs.map(l => {
        const d = new Date(l.timestamp);
        return `${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}`;
    });
    
    const scores = logs.map(l => l.score); // 0.0 to 1.0
    
    // Create a beautiful gradient fill for the chart
    let gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(255, 123, 156, 0.4)');   // Severe top
    gradient.addColorStop(0.5, 'rgba(245, 158, 11, 0.2)');  // Moderate middle
    gradient.addColorStop(1, 'rgba(16, 185, 129, 0.1)');    // Normal bottom

    if (chartInstance) {
        chartInstance.destroy();
    }
    
    Chart.defaults.color = '#9ba1b0';
    Chart.defaults.font.family = 'Inter';

    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Depression Severity Score (0-1)',
                data: scores,
                borderColor: '#ff7b9c',
                backgroundColor: gradient,
                borderWidth: 4,
                tension: 0.5, // Smoother curve
                fill: true,
                pointBackgroundColor: '#5c6ac4',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 1.0,
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    title: { display: true, text: 'Severity (0 = Normal, 1 = Severe)' },
                    ticks: {
                        callback: function(value) {
                            if(value === 1.0) return 'Severe (1.0)';
                            if(value === 0.7) return 'Mod-Sev (0.7)';
                            if(value === 0.4) return 'Mild (0.4)';
                            if(value === 0) return 'Normal (0)';
                            return value;
                        }
                    }
                },
                x: {
                    grid: { display: true, color: 'rgba(255,255,255,0.02)' }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        afterLabel: function(context) {
                            const index = context.dataIndex;
                            return `Emotion: ${logs[index].emotion}`;
                        }
                    }
                }
            }
        }
    });
}

function checkRisk(logs) {
    if(!logs || logs.length === 0) return;
    const lastLog = logs[logs.length - 1];
    
    const riskAlert = document.getElementById('risk-alert');
    if(lastLog.score >= 0.7) {
        riskAlert.classList.remove('hidden');
    } else {
        riskAlert.classList.add('hidden');
    }
}

// Actions & Interactivity
function triggerAction(action, dataStr) {
    let data = null;
    if (dataStr) {
        try { data = JSON.parse(decodeURIComponent(dataStr)); } catch(e){}
    }
    
    if(action === "start_breathing") {
        startBreathingExercise();
    } else if (action === "show_tips" && data) {
        showModal(data.relaxation_title || 'Relaxation Tip', data.relaxation_desc || 'Take a moment to center yourself.');
    } else if (action === "daily_activity" && data) {
        showModal(data.exercise_title || 'Activity', data.exercise_desc || 'Try engaging in a light activity.');
    }
}

// Modal
function showModal(title, desc) {
    document.getElementById('modal-title').innerText = title;
    document.getElementById('modal-desc').innerText = desc;
    document.getElementById('generic-modal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('generic-modal').classList.add('hidden');
}

// Breathing Exercise Flow
let breathingInterval = null;
let currentPhase = 'inhale'; // inhale, hold, exhale
let timeLeft = 0;

function startBreathingExercise() {
    document.getElementById('breathing-overlay').classList.remove('hidden');
    const circle = document.querySelector('.breathing-circle');
    const bInstruction = document.getElementById('b-instruction');
    const bTimer = document.getElementById('b-timer');
    
    // Clear previous state
    clearInterval(breathingInterval);
    circle.className = 'breathing-circle';
    
    bInstruction.innerText = "Get Ready";
    bTimer.innerText = "3";
    
    let countdown = 3;
    let prepInterval = setInterval(() => {
        countdown--;
        if(countdown > 0){
            bTimer.innerText = countdown;
        } else {
            clearInterval(prepInterval);
            runBreathingCycle(); // start real cycle
        }
    }, 1000);
}

function runBreathingCycle() {
    const circle = document.querySelector('.breathing-circle');
    const bInstruction = document.getElementById('b-instruction');
    const bTimer = document.getElementById('b-timer');
    
    // 4-7-8 Breathing logic
    circle.className = 'breathing-circle inhale';
    bInstruction.innerText = "Inhale...";
    timeLeft = 4;
    bTimer.innerText = timeLeft;
    currentPhase = 'inhale';
    
    breathingInterval = setInterval(() => {
        timeLeft--;
        if(timeLeft > 0) {
            bTimer.innerText = timeLeft;
        } else {
            // Switch phase
            if (currentPhase === 'inhale') {
                currentPhase = 'hold';
                timeLeft = 7;
                circle.className = 'breathing-circle hold';
                bInstruction.innerText = "Hold...";
                bTimer.innerText = timeLeft;
            } else if (currentPhase === 'hold') {
                currentPhase = 'exhale';
                timeLeft = 8;
                circle.className = 'breathing-circle exhale';
                bInstruction.innerText = "Exhale...";
                bTimer.innerText = timeLeft;
            } else if (currentPhase === 'exhale') {
                currentPhase = 'inhale';
                timeLeft = 4;
                circle.className = 'breathing-circle inhale';
                bInstruction.innerText = "Inhale...";
                bTimer.innerText = timeLeft;
            }
        }
    }, 1000);
}

function stopBreathing() {
    clearInterval(breathingInterval);
    document.getElementById('breathing-overlay').classList.add('hidden');
    
    // Auto send positive feedback to bot to keep flow moving
    setTimeout(() => {
        const inputField = document.getElementById('user-input');
        inputField.value = "I finished the breathing exercise.";
        sendMessage();
    }, 500);
}
