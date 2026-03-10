const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

const initialGroups = [
    { id: 1, name: "1조", members: ["손준하 (경영학부)", "백태우 (프랑스언어문화학과)", "경규빈 (경영정보학과)", "황채연 (천문우주학과)", "소효민 (경영학부)", "배준오 (국제경영학과)", "김종우 (경영정보학과)"] },
    { id: 2, name: "2조", members: ["박채민 (경영정보학과)", "진형준 (경영정보학과)", "정세한 (경영정보학과)", "이도훈 (경영정보학과)", "이상준 (경영정보학과)"] },
    { id: 3, name: "3조", members: ["이정재 (경영정보학과)", "전형서 (경영정보학과)", "김동휘 (경영정보학과)", "황준규 (경영정보학과)", "고경택 (경영정보학과)", "오성민 (경영정보학과)", "김영미 (경영정보학과)"] },
    { id: 4, name: "4조", members: ["김성진 (경영정보학과)", "박주승 (경영정보학과)", "오승주 (경영정보학과)", "박준 (경영정보학과)", "김유나 (지리교육과)", "정승현 (경영정보학과)"] },
    { id: 5, name: "5조", members: ["박민진 (경영정보학과)", "안지온 (경영정보학과)", "김연수 (경영정보학과)", "김예빈 (경영정보학과)", "윤채원 (경영정보학과)", "이지원 (경영정보학과)", "임혜원 (경영정보학과)"] },
    { id: 6, name: "6조", members: ["김혜미 (경영정보학과)", "박지민 (경영정보학과)", "윤나영 (경영정보학과)", "강다은 (경영정보학과)", "심이정 (경영정보학과)"] },
    { id: 7, name: "7조", members: ["김시연 (경영정보학과)", "연수진 (경영정보학과)", "이자원 (경영정보학과)", "권보정 (경영정보학과)", "정수지 (경영정보학과)", "임지혁 (경영정보학과)", "김민규 (경영정보학과)"] }
];

let groups = [];
try {
    const saved = localStorage.getItem('randomizer_groups');
    if (saved) {
        groups = JSON.parse(saved);
    } else {
        groups = JSON.parse(JSON.stringify(initialGroups));
    }
} catch (e) {
    groups = JSON.parse(JSON.stringify(initialGroups));
}
let state = {
    isDrawing: false,
    selectedGroups: []
};

// Audio Functions
function playTick() {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.05);
    
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05);
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.05);
}

function playDing() {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, audioCtx.currentTime);
    
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1);
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 1);
}

function playTada() {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc1 = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc1.type = 'sine';
    osc2.type = 'triangle';
    
    const now = audioCtx.currentTime;
    osc1.frequency.setValueAtTime(523.25, now);
    osc1.frequency.setValueAtTime(659.25, now + 0.15);
    osc1.frequency.setValueAtTime(783.99, now + 0.3);
    osc1.frequency.setValueAtTime(1046.50, now + 0.45);
    
    osc2.frequency.setValueAtTime(261.63, now);
    osc2.frequency.setValueAtTime(329.63, now + 0.15);
    osc2.frequency.setValueAtTime(392.00, now + 0.3);
    osc2.frequency.setValueAtTime(523.25, now + 0.45);

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.3, now + 0.05);
    gainNode.gain.setValueAtTime(0.3, now + 0.45);
    gainNode.gain.linearRampToValueAtTime(0, now + 1.5);
    
    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc1.start();
    osc2.start();
    osc1.stop(now + 1.5);
    osc2.stop(now + 1.5);
}

const drawBtn = document.getElementById('drawBtn');
const resetBtn = document.getElementById('resetBtn');
const statusBadge = document.getElementById('statusBadge');
const mainText = document.getElementById('mainText');
const subText = document.getElementById('subText');
const displayBoard = document.getElementById('displayBoard');
const resultsGrid = document.getElementById('resultsGrid');

// Settings Elements
const settingsBtn = document.getElementById('settingsBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const saveGroupsBtn = document.getElementById('saveGroupsBtn');
const settingsModal = document.getElementById('settingsModal');
const groupsInput = document.getElementById('groupsInput');

function init() {
    renderResultsGrid();
    drawBtn.addEventListener('click', startSequence);
    resetBtn.addEventListener('click', resetApp);
    
    settingsBtn.addEventListener('click', openSettings);
    closeModalBtn.addEventListener('click', closeSettings);
    saveGroupsBtn.addEventListener('click', saveSettings);
    
    // Close modal when clicking outside
    settingsModal.addEventListener('click', (e) => {
        if (e.target === settingsModal) closeSettings();
    });
}

function renderResultsGrid() {
    resultsGrid.innerHTML = '';
    groups.forEach(g => {
        const pickedData = state.selectedGroups.find(s => s.groupId === g.id);
        const isCompleted = !!pickedData;
        
        const card = document.createElement('div');
        card.className = `result-card ${isCompleted ? 'completed' : ''}`;
        card.id = `card-group-${g.id}`;
        
        card.innerHTML = `
            <div class="card-group">${g.name}</div>
            <div class="card-member">${isCompleted ? pickedData.memberName : '대기중...'}</div>
        `;
        resultsGrid.appendChild(card);
    });
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function startSequence() {
    if (state.isDrawing) return;
    
    // Resume audio context on first user interaction if suspended
    if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
    }
    
    const unpickedGroups = groups.filter(g => !state.selectedGroups.find(s => s.groupId === g.id));
    if (unpickedGroups.length === 0) {
        alert("모든 조의 뽑기가 완료되었습니다!");
        return;
    }

    state.isDrawing = true;
    drawBtn.disabled = true;
    drawBtn.textContent = '추첨 중...';
    
    statusBadge.textContent = 'DRAWING';
    statusBadge.classList.add('active');
    displayBoard.classList.add('picking');
    displayBoard.classList.remove('picked');
    subText.textContent = '';
    
    try {
        // Step 1: Roulete for grouping
        const targetGroup = await rouletteEffect(unpickedGroups.map(g => g.name), 2000, 50, playTick);
        playDing(); // Short ding when group is chosen
        
        const matchingGroupList = unpickedGroups.filter(g => g.name === targetGroup);
        const groupObj = matchingGroupList[0];
        
        mainText.textContent = targetGroup;
        mainText.style.color = 'var(--secondary-color)';
        
        await sleep(1000); // Wait 1 sec to build tension
        
        // Step 2: Roulete for picking member within group
        subText.textContent = '발표자 선정 중...';
        mainText.style.color = '#f8fafc';
        
        const membersList = groupObj.members;
        const targetMember = await rouletteEffect(membersList, 3000, 60, playTick);
        
        // Selection complete
        playTada();
        displayBoard.classList.remove('picking');
        displayBoard.classList.add('picked');
        statusBadge.textContent = 'SELECTED';
        statusBadge.classList.remove('active');
        
        mainText.innerHTML = `${targetGroup}<br><span style="color: var(--primary-color)">${targetMember}</span>`;
        subText.textContent = '발표자로 선정되었습니다!';
        
        // Save and update UI
        state.selectedGroups.push({ groupId: groupObj.id, memberName: targetMember });
        updateResultCard(groupObj.id, targetMember);
        
    } catch (e) {
        console.error(e);
    } finally {
        state.isDrawing = false;
        drawBtn.disabled = false;
        
        if (state.selectedGroups.length === groups.length) {
            drawBtn.textContent = '추첨 완료';
            drawBtn.disabled = true;
            statusBadge.textContent = 'FINISHED';
        } else {
            drawBtn.textContent = '다음 추첨';
        }
    }
}

function rouletteEffect(items, duration, initialDelay, tickCb) {
    return new Promise(resolve => {
        let currentItem = '';
        let elapsed = 0;
        let delay = initialDelay;
        
        const tick = () => {
            const tempItems = items.filter(i => i !== currentItem);
            const randomItem = tempItems.length > 0 ? tempItems[Math.floor(Math.random() * tempItems.length)] : items[0];
            mainText.textContent = randomItem;
            currentItem = randomItem;
            
            if (tickCb) tickCb();
            
            elapsed += delay;
            
            if (elapsed > duration * 0.6) {
                delay += 15;
            }
            
            if (elapsed < duration) {
                setTimeout(tick, delay);
            } else {
                resolve(currentItem);
            }
        };
        tick();
    });
}

function updateResultCard(groupId, memberName) {
    const card = document.getElementById(`card-group-${groupId}`);
    if (card) {
        card.classList.add('completed');
        card.querySelector('.card-member').textContent = memberName;
    }
}

function resetAppWithoutConfirm() {
    state.selectedGroups = [];
    state.isDrawing = false;
    drawBtn.disabled = false;
    
    if (groups.length === 0) {
        drawBtn.disabled = true;
    }
    
    drawBtn.textContent = '추첨 시작!';
    
    displayBoard.classList.remove('picked', 'picking');
    statusBadge.textContent = 'READY';
    statusBadge.classList.remove('active');
    mainText.innerHTML = '버튼을 눌러<br>추첨을 시작하세요!';
    mainText.style.color = '#f8fafc';
    subText.textContent = '';
    
    renderResultsGrid();
}

function resetApp() {
    if (state.selectedGroups.length === 0) return;
    if (confirm('모든 추첨 결과를 초기화하시겠습니까?')) {
        resetAppWithoutConfirm();
    }
}

// Settings Functions
function openSettings() {
    const text = groups.map(g => `${g.name}: ${g.members.join(', ')}`).join('\n');
    groupsInput.value = text;
    settingsModal.classList.remove('hidden');
}

function closeSettings() {
    settingsModal.classList.add('hidden');
}

function saveSettings() {
    const text = groupsInput.value.trim();
    if (!text) {
        alert("팀 정보를 입력해주세요.");
        return;
    }
    
    const lines = text.split('\n');
    const newGroups = [];
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const separatorIdx = line.indexOf(':');
        
        if (separatorIdx === -1) {
            alert(`"${line}" 줄의 형식이 올바르지 않습니다. (콜론(:)으로 조 이름과 멤버를 구분해주세요)`);
            return;
        } else {
            const name = line.substring(0, separatorIdx).trim();
            const membersStr = line.substring(separatorIdx + 1).trim();
            const members = membersStr.split(',').map(m => m.trim()).filter(m => m);
            
            if (!name || members.length === 0) {
                alert(`"${line}" 줄의 형식이 올바르지 않습니다. 멤버를 1명 이상 입력해주세요.`);
                return;
            }
            newGroups.push({ id: i + 1, name: name, members: members });
        }
    }
    
    if (newGroups.length === 0) {
        alert("유효한 팀 정보가 없습니다.");
        return;
    }
    
    if (state.selectedGroups.length > 0) {
        if (!confirm("팀 정보를 변경하면 현재 진행 중인 추첨 결과가 모두 초기화됩니다. 계속하시겠습니까?")) {
            return;
        }
    }
    
    groups = newGroups;
    localStorage.setItem('randomizer_groups', JSON.stringify(groups));
    
    closeSettings();
    resetAppWithoutConfirm();
}

init();
