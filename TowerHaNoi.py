import tkinter as tk
from tkinter import ttk

# ================== HÀM SINH BƯỚC ĐỆ QUY (GENERATOR) ==================
def hanoi_gen(n, a, c, b):
    if n == 1:
        yield (a, c)
    else:
        yield from hanoi_gen(n - 1, a, b, c)
        yield (a, c)
        yield from hanoi_gen(n - 1, b, c, a)

# ================== ỨNG DỤNG GUI ==================
class HanoiApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Tower of Hanoi - Recursive Simulation")

        self.running = False
        self.paused = False
        self.step_count = 0

        self.create_controls()
        self.create_canvas()

    # ------------------ GIAO DIỆN ĐIỀU KHIỂN ------------------
    def create_controls(self):
        frame = tk.Frame(self.root)
        frame.pack(pady=5)

        tk.Label(frame, text="Số đĩa:").grid(row=0, column=0)
        self.disk_var = tk.IntVar(value=3)
        tk.Spinbox(frame, from_=1, to=8, width=5,
                   textvariable=self.disk_var).grid(row=0, column=1)

        tk.Label(frame, text="Tốc độ:").grid(row=0, column=2, padx=5)
        self.speed = tk.DoubleVar(value=300)
        ttk.Scale(frame, from_=50, to=1000,
                  variable=self.speed, orient="horizontal",
                  length=150).grid(row=0, column=3)

        tk.Button(frame, text="Start", command=self.start).grid(row=0, column=4, padx=5)
        tk.Button(frame, text="Pause", command=self.pause).grid(row=0, column=5)
        tk.Button(frame, text="Resume", command=self.resume).grid(row=0, column=6)
        tk.Button(frame, text="Reset", command=self.reset).grid(row=0, column=7)

        self.info = tk.Label(self.root, text="Bước: 0 / 0")
        self.info.pack()

    # ------------------ CANVAS ------------------
    def create_canvas(self):
        self.canvas = tk.Canvas(self.root, width=600, height=350, bg="white")
        self.canvas.pack()

    # ------------------ KHỞI TẠO BÀI TOÁN ------------------
    def init_hanoi(self):
        self.canvas.delete("all")
        self.pegs = [[], [], []]
        self.step_count = 0

        # Vẽ cọc
        for x in [150, 300, 450]:
            self.canvas.create_rectangle(x - 5, 80, x + 5, 300, fill="black")

        # Tạo đĩa
        n = self.disk_var.get()
        colors = ["#4FC3F7", "#81C784", "#FFB74D",  
                  "#E57373", "#BA68C8", "#FFD54F"]
        for i in range(n):
            w = 140 - i * 15
            x = 150
            y = 280 - i * 20
            disk = self.canvas.create_rectangle(
                x - w // 2, y,
                x + w // 2, y + 20,
                fill=colors[i % len(colors)]
            )
            self.pegs[0].append(disk)

        self.total_steps = 2 ** n - 1
        self.info.config(text=f"Bước: 0 / {self.total_steps}")
        self.moves = hanoi_gen(n, 0, 2, 1)

    # ------------------ DI CHUYỂN ĐĨA ------------------
    def move_disk(self, from_peg, to_peg):
        disk = self.pegs[from_peg].pop()
        self.pegs[to_peg].append(disk)

        x_target = [150, 300, 450][to_peg]
        y_target = 280 - (len(self.pegs[to_peg]) - 1) * 20

        x1, y1, x2, y2 = self.canvas.coords(disk)
        self.canvas.move(disk,
                         x_target - (x1 + x2) / 2,
                         y_target - y1)

    # ------------------ CHẠY TỪNG BƯỚC ------------------
    def run_step(self):
        if not self.running or self.paused:
            return

        try:
            a, c = next(self.moves)
            self.move_disk(a, c)
            self.step_count += 1
            self.info.config(
                text=f"Bước: {self.step_count} / {self.total_steps}"
            )
            self.root.after(int(self.speed.get()), self.run_step)
        except StopIteration:
            self.running = False

    # ------------------ NÚT ĐIỀU KHIỂN ------------------
    def start(self):
        if self.running:
            return
        self.init_hanoi()
        self.running = True
        self.paused = False
        self.run_step()

    def pause(self):
        self.paused = True

    def resume(self):
        if self.running:
            self.paused = False
            self.run_step()

    def reset(self):
        self.running = False
        self.paused = False
        self.init_hanoi()

# ================== MAIN ==================
if __name__ == "__main__":
    root = tk.Tk()
    app = HanoiApp(root)
    root.mainloop()
