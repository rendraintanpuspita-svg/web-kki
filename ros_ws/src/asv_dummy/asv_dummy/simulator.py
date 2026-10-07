import math
import random
from datetime import datetime

# Titik START tiap lintasan (cm), sama dengan startX/startY di TrajectoryA/B.jsx
START = {
    "A": (2550, 225),
    "B": (440, 225),
}

# Waypoint ABSOLUT (cm) kira-kira lewat tengah bola hijau-merah. Ini jalur DUMMY.
WAYPOINTS = {
    "A": [
        (2550, 225),
        (2540, 600),
        (2530, 970), (2430, 1300), (2570, 1570),
        (2300, 2100),
        (1800, 2300), (1630, 2300), (1460, 2300), (1290, 2300),
        (800, 2100),
        (470, 1800), (330, 1500), (300, 1200),
        (530, 620), (830, 320),
        (2550, 225),
    ],
    "B": [
        (440, 225),
        (450, 600),
        (470, 975), (570, 1300), (440, 1570),
        (700, 2100),
        (1180, 2300), (1350, 2300), (1525, 2300), (1700, 2300),
        (2200, 2100),
        (2520, 1800), (2680, 1500), (2690, 1200),
        (2475, 630), (2175, 320),
        (440, 225),
    ],
}

MISSIONS = ["Start", "Floating Ball", "Mission Surface", "Mission Underwater", "Docking"]

BASE_LAT = 1.1186
BASE_LON = 104.0485
M_PER_DEG_LAT = 111320.0
MS_TO_KNOT = 1.94384
MS_TO_KMH = 3.6
BATTERY_DRAIN_PER_LAP = 15.0   # persen yang habis per satu putaran


class PathSimulator:
    def __init__(self, lintasan="A", speed_m_s=0.5, seed=None):
        lintasan = str(lintasan).upper()
        if lintasan not in WAYPOINTS:
            raise ValueError("lintasan harus 'A' atau 'B'")
        self.lintasan = lintasan
        self.speed_cm_s = speed_m_s * 100.0
        self.rng = random.Random(seed)

        self.start = START[lintasan]
        self.points = WAYPOINTS[lintasan]
        self.seg_len = [
            math.dist(self.points[i], self.points[i + 1])
            for i in range(len(self.points) - 1)
        ]
        self.total_len = sum(self.seg_len)
        self.battery_pct = 100.0
        self.reset()

    def reset(self):
        self.seq = 0
        self.dist = 0.0

    @property
    def progress(self):
        return min(self.dist / self.total_len, 1.0)

    @property
    def finished(self):
        return self.dist >= self.total_len

    def _locate(self):
        """Posisi absolut (cm) + arah gerak (derajat, 0 = utara, searah jarum jam)."""
        d = min(self.dist, self.total_len)
        last = len(self.seg_len) - 1
        for i, length in enumerate(self.seg_len):
            if d <= length or i == last:
                t = 0.0 if length == 0 else min(d / length, 1.0)
                (x0, y0), (x1, y1) = self.points[i], self.points[i + 1]
                x = x0 + (x1 - x0) * t
                y = y0 + (y1 - y0) * t
                bearing = math.degrees(math.atan2(x1 - x0, y1 - y0)) % 360
                return x, y, bearing
            d -= length

    def step(self, dt):
        """Majukan simulasi dt detik, kembalikan dict telemetry."""
        if self.finished:
            self.reset()

        speed = max(self.speed_cm_s * (1 + self.rng.uniform(-0.05, 0.05)), 0.0)
        advance = speed * dt
        self.dist += advance
        self.battery_pct = max(
            self.battery_pct - BATTERY_DRAIN_PER_LAP * advance / self.total_len, 0.0
        )
        if self.battery_pct <= 0.0:
            self.battery_pct = 100.0

        ax, ay, bearing = self._locate()
        x = ax - self.start[0] + self.rng.gauss(0, 1.5)   # relatif terhadap START
        y = ay - self.start[1] + self.rng.gauss(0, 1.5)

        sog_ms = speed / 100.0
        cog = (bearing + self.rng.gauss(0, 1.0)) % 360
        heading = (bearing + self.rng.gauss(0, 3.0)) % 360

        lat = BASE_LAT + (y / 100.0) / M_PER_DEG_LAT
        lon = BASE_LON + (x / 100.0) / (M_PER_DEG_LAT * math.cos(math.radians(BASE_LAT)))

        now = datetime.now()
        msg = {
            "seq": self.seq,
            "lintasan": self.lintasan,
            "date": now.strftime("%d/%m/%Y"),
            "time": now.strftime("%H:%M:%S"),
            "x": round(x, 1),
            "y": round(y, 1),
            "lat": round(lat, 6),
            "lon": round(lon, 6),
            "sog_knot": round(sog_ms * MS_TO_KNOT, 2),
            "sog_kmh": round(sog_ms * MS_TO_KMH, 2),
            "cog": round(cog, 1),
            "heading": round(heading, 1),
        }
        self.seq += 1
        return msg

    def battery(self):
        volt = 14.0 + (16.8 - 14.0) * (self.battery_pct / 100.0)
        return {"percent": round(self.battery_pct, 1), "voltage": round(volt, 2)}

    def mission(self):
        step = min(int(self.progress * len(MISSIONS)), len(MISSIONS) - 1)
        return {"step": step, "name": MISSIONS[step]}


if __name__ == "__main__":
    sim = PathSimulator("A", speed_m_s=2.0, seed=1)
    for _ in range(10):
        print(sim.step(0.5), sim.battery(), sim.mission())