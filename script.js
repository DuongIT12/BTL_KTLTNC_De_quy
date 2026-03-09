/**
 * ĐỀ TÀI: MÔ PHỎNG THÁP HÀ NỘI
 * SINH VIÊN: NGUYỄN THẾ DƯƠNG - LỚP K58KTP 
 * GVHD: THS. NGHIÊM VĂN TÍNH 
 */

let isRunning = false;
let isPaused = false;
let moveCount = 0;
let resolveStep; // Hàm để "mở khóa" đệ quy khi bấm Next

const sleep = (ms) => new Promise(res => setTimeout(res, ms));

// 1. Hàm điều khiển tiến trình: Tạm dừng và Xem từng bước
async function waitIfPaused() {
    if (isPaused) {
        // Trả về một Promise chỉ resolve khi bấm nút Next hoặc Resume
        return new Promise(res => { resolveStep = res; });
    }
}

// 2. Hàm di chuyển đĩa trên giao diện (UI)
async function moveDiskUI(from, to) {
    await waitIfPaused(); // Kiểm tra xem người dùng có đang nhấn Pause không
    if (!isRunning) return;

    const fromPeg = document.getElementById(from);
    const toPeg = document.getElementById(to);
    const disk = fromPeg.lastElementChild;
    
    if (disk && disk.classList.contains('disk')) {
        toPeg.appendChild(disk);
        moveCount++;
        
        // Cập nhật Dashboard [cite: 19]
        document.getElementById('currentSteps').innerText = moveCount;
        const total = parseInt(document.getElementById('expectedSteps').innerText);
        const percent = (moveCount / total) * 100;
        document.getElementById('progressBar').style.width = `${percent}%`;
        
        // Cập nhật Nhật ký di chuyển
        const log = document.getElementById('moveLog');
        const entry = document.createElement('div');
        entry.style.padding = "5px";
        entry.style.borderBottom = "1px solid #eee";
        entry.innerHTML = `<strong>B${moveCount}:</strong> Cột ${from} ➔ ${to}`;
        log.prepend(entry);
        
        await sleep(document.getElementById('speed').value);
    }
}

// 3. Thuật toán đệ quy cốt lõi
async function hanoi(n, a, c, b) {
    if (!isRunning) return;
    if (n === 1) {
        await moveDiskUI(a, c); // Chuyển 1 đĩa trực tiếp [cite: 66]
        return;
    }
    await hanoi(n - 1, a, b, c); // Bước 1: Chuyển n-1 đĩa A -> B [cite: 59, 68]
    await moveDiskUI(a, c);      // Bước 2: Chuyển đĩa lớn nhất A -> C [cite: 61, 69]
    await hanoi(n - 1, b, c, a); // Bước 3: Chuyển n-1 đĩa B -> C [cite: 62, 70]
}

// 4. Các hàm điều khiển (Event Handlers)
function togglePause() {
    isPaused = !isPaused;
    const btn = document.getElementById('pauseBtn');
    btn.innerText = isPaused ? "TIẾP TỤC" : "TẠM DỪNG";
    document.getElementById('nextBtn').disabled = !isPaused;
    
    if (!isPaused && resolveStep) {
        resolveStep(); // Chạy tiếp nếu đang tạm dừng
    }
}

function nextStep() {
    if (resolveStep) {
        resolveStep(); // Chỉ thực hiện đúng 1 bước tiếp theo
    }
}

function initSimulation() {
    if (isRunning) return;
    const n = parseInt(document.getElementById('diskCount').value);
    
    // Kiểm tra quy tắc đĩa [cite: 52-54]
    if (n < 1 || n > 8) return alert("Số đĩa từ 1-8 để đảm bảo hiệu suất!");

    resetTowers();
    const towerA = document.getElementById('A');
    const colors = ['#ff7675', '#74b9ff', '#55efc4', '#fab1a0', '#a29bfe', '#fdcb6e', '#81ecec', '#ffeaa7'];
    
    for(let i=n; i>=1; i--) {
        const d = document.createElement('div');
        d.className = 'disk';
        d.style.width = `${60 + i*22}px`;
        d.style.background = colors[(i-1) % colors.length];
        towerA.appendChild(d);
    }
    
    document.getElementById('expectedSteps').innerText = Math.pow(2, n) - 1; // Công thức T(n) = 2^n - 1 [cite: 86]
    
    isRunning = true;
    document.getElementById('pauseBtn').disabled = false;
    document.getElementById('startBtn').disabled = true;

    hanoi(n, 'A', 'C', 'B').then(() => {
        isRunning = false;
        document.getElementById('pauseBtn').disabled = true;
        document.getElementById('startBtn').disabled = false;
        if(moveCount > 0) alert("Thuật toán đã hoàn thành mô phỏng!");
    });
}

function resetTowers() {
    isRunning = false;
    isPaused = false;
    moveCount = 0;
    if (resolveStep) resolveStep();
    
    document.querySelectorAll('.disk').forEach(d => d.remove());
    document.getElementById('moveLog').innerHTML = '';
    document.getElementById('progressBar').style.width = '0%';
    document.getElementById('currentSteps').innerText = '0';
    document.getElementById('pauseBtn').innerText = "TẠM DỪNG";
    document.getElementById('pauseBtn').disabled = true;
    document.getElementById('nextBtn').disabled = true;
    document.getElementById('startBtn').disabled = false;
}