#!/usr/bin/env python3
import os
import sys
import time
import json
from datetime import datetime

# Configurations
RAPL_PATH = "/sys/class/powercap/intel-rapl:0/energy_uj"
DATA_FILE = "/home/spotlighter/tncb/deploy/power_data.json"
HTML_FILE = "/home/spotlighter/tncb/deploy/power_report.html"
SYSTEMD_SERVICE = "/etc/systemd/system/tncb-power-tracker.service"

BASELINE_WATTS = 5.0  # Estimated power of motherboard, disk, RAM, screen closed, etc.
ELECTRICITY_RATE_VND = 2500  # Cost per kWh in VND
INTERVAL_SECONDS = 5

def read_rapl_energy():
    try:
        with open(RAPL_PATH, "r") as f:
            return int(f.read().strip())
    except Exception as e:
        # If not readable, return None
        return None

def load_data():
    if os.path.exists(DATA_FILE):
        try:
            with open(DATA_FILE, "r") as f:
                return json.load(f)
        except Exception:
            pass
    return {
        "cumulative_joules": 0.0,
        "last_energy_uj": 0,
        "history": {}
    }

def save_data(data):
    try:
        with open(DATA_FILE, "w") as f:
            json.dump(data, f, indent=2)
    except Exception as e:
        print(f"Error saving data: {e}", file=sys.stderr)

def generate_html(data, current_watts):
    today_str = datetime.now().strftime("%Y-%m-%d")
    
    # Calculate stats
    today_joules = data["history"].get(today_str, {}).get("joules", 0.0)
    today_kwh = (today_joules / 3600000.0)
    today_cost = today_kwh * ELECTRICITY_RATE_VND
    
    # Monthly stats (current month)
    current_month_str = datetime.now().strftime("%Y-%m")
    monthly_joules = 0.0
    for day, day_data in data["history"].items():
        if day.startswith(current_month_str):
            monthly_joules += day_data.get("joules", 0.0)
            
    monthly_kwh = (monthly_joules / 3600000.0)
    monthly_cost = monthly_kwh * ELECTRICITY_RATE_VND
    
    # Sort history for display (last 7 days)
    sorted_history = sorted(data["history"].items(), key=lambda x: x[0], reverse=True)[:7]
    
    history_rows = ""
    for day, day_data in reversed(sorted_history):
        day_kwh = day_data.get("joules", 0.0) / 3600000.0
        day_cost = day_kwh * ELECTRICITY_RATE_VND
        day_display = datetime.strptime(day, "%Y-%m-%d").strftime("%d/%m (%A)")
        
        # Calculate percentage for progress bar (max 2 kWh for a laptop is plenty)
        percentage = min(100, int((day_kwh / 1.5) * 100))
        
        history_rows += f"""
        <div class="history-item">
            <span class="history-date">{day_display}</span>
            <div class="bar-container">
                <div class="bar" style="width: {percentage}%"></div>
            </div>
            <span class="history-value">{day_kwh:.3f} kWh (~{int(day_cost):,} đ)</span>
        </div>
        """

    html_content = f"""<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Báo cáo Điện Năng Máy Chủ - FindX</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&display=swap" rel="stylesheet">
    <style>
        :root {{
            --bg-color: #0f172a;
            --card-bg: #1e293b;
            --text-main: #f8fafc;
            --text-muted: #94a3b8;
            --accent-green: #10b981;
            --accent-blue: #3b82f6;
            --border-color: #334155;
        }}
        
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Outfit', sans-serif;
        }}
        
        body {{
            background-color: var(--bg-color);
            color: var(--text-main);
            padding: 2rem 1rem;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }}
        
        .container {{
            max-width: 600px;
            width: 100%;
            background: var(--card-bg);
            border-radius: 20px;
            padding: 2rem;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3);
            border: 1px solid var(--border-color);
        }}
        
        header {{
            text-align: center;
            margin-bottom: 2rem;
        }}
        
        header h1 {{
            font-size: 1.8rem;
            font-weight: 700;
            background: linear-gradient(to right, #10b981, #3b82f6);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 0.5rem;
        }}
        
        header p {{
            color: var(--text-muted);
            font-size: 0.9rem;
        }}
        
        .grid {{
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
            margin-bottom: 2rem;
        }}
        
        .card {{
            background: rgba(15, 23, 42, 0.4);
            border-radius: 15px;
            padding: 1.2rem;
            border: 1px solid var(--border-color);
            display: flex;
            flex-direction: column;
            justify-content: space-between;
        }}
        
        .card-full {{
            grid-column: span 2;
        }}
        
        .card-title {{
            font-size: 0.85rem;
            color: var(--text-muted);
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 0.5rem;
        }}
        
        .card-value {{
            font-size: 1.8rem;
            font-weight: 700;
            color: var(--text-main);
        }}
        
        .card-value.green {{
            color: var(--accent-green);
        }}
        
        .card-value.blue {{
            color: var(--accent-blue);
        }}
        
        .card-sub {{
            font-size: 0.8rem;
            color: var(--text-muted);
            margin-top: 0.25rem;
        }}
        
        .section-title {{
            font-size: 1.1rem;
            font-weight: 600;
            margin-bottom: 1rem;
            color: var(--text-main);
            border-left: 4px solid var(--accent-green);
            padding-left: 0.5rem;
        }}
        
        .history-list {{
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }}
        
        .history-item {{
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: 0.9rem;
        }}
        
        .history-date {{
            width: 110px;
            color: var(--text-muted);
        }}
        
        .bar-container {{
            flex-grow: 1;
            height: 8px;
            background: rgba(15, 23, 42, 0.6);
            border-radius: 4px;
            margin: 0 1rem;
            overflow: hidden;
        }}
        
        .bar {{
            height: 100%;
            background: linear-gradient(to right, var(--accent-green), var(--accent-blue));
            border-radius: 4px;
        }}
        
        .history-value {{
            font-weight: 600;
            min-width: 140px;
            text-align: right;
        }}
        
        footer {{
            text-align: center;
            margin-top: 2rem;
            font-size: 0.8rem;
            color: var(--text-muted);
            border-top: 1px solid var(--border-color);
            padding-top: 1rem;
        }}
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>FindX Server Energy Dashboard</h1>
            <p>Tự động cập nhật mỗi 5 giây • Máy chủ laptop Dell/HP Ubuntu</p>
        </header>
        
        <div class="grid">
            <div class="card">
                <span class="card-title">Công suất hiện tại</span>
                <span class="card-value blue">{current_watts:.1f} W</span>
                <span class="card-sub">CPU + {BASELINE_WATTS}W baseline</span>
            </div>
            
            <div class="card">
                <span class="card-title">Hôm nay tiêu thụ</span>
                <span class="card-value green">{today_kwh:.3f} kWh</span>
                <span class="card-sub">Chi phí: ~{int(today_cost):,} VNĐ</span>
            </div>
            
            <div class="card card-full">
                <span class="card-title">Tháng này ({datetime.now().strftime('%B %Y')})</span>
                <span class="card-value">{monthly_kwh:.2f} kWh</span>
                <span class="card-sub">Ước tính tiền điện: <strong>{int(monthly_cost):,} VNĐ</strong></span>
            </div>
        </div>
        
        <div class="history-section">
            <h2 class="section-title">Lịch sử 7 ngày qua</h2>
            <div class="history-list">
                {history_rows if history_rows else '<div style="color: var(--text-muted); text-align: center;">Chưa có dữ liệu lịch sử</div>'}
            </div>
        </div>
        
        <footer>
            Hệ thống giám sát điện năng tự động • TNCB Rent © {datetime.now().year}
        </footer>
    </div>
</body>
</html>
"""
    try:
        with open(HTML_FILE, "w") as f:
            f.write(html_content)
    except Exception as e:
        print(f"Error generating HTML: {e}", file=sys.stderr)

def main():
    print("Starting TNCB Power Tracker daemon...")
    
    # Initialize variables
    data = load_data()
    last_energy_uj = data.get("last_energy_uj", 0)
    
    # If starting fresh, set baseline
    if last_energy_uj == 0:
        initial_energy = read_rapl_energy()
        if initial_energy is not None:
            last_energy_uj = initial_energy
            data["last_energy_uj"] = last_energy_uj
            save_data(data)
            
    last_time = time.time()
    
    while True:
        try:
            time.sleep(INTERVAL_SECONDS)
            now_time = time.time()
            elapsed = now_time - last_time
            last_time = now_time
            
            # Read energy counter
            current_energy_uj = read_rapl_energy()
            if current_energy_uj is None:
                print("Warning: Could not read RAPL energy sensor. Is it configured?", file=sys.stderr)
                # Fallback to pure baseline calculations
                diff_j = BASELINE_WATTS * elapsed
                current_watts = BASELINE_WATTS
            else:
                # Handle wraps or reboots
                if current_energy_uj < last_energy_uj:
                    diff_uj = current_energy_uj  # assume reboot reset to 0
                else:
                    diff_uj = current_energy_uj - last_energy_uj
                
                # Convert microjoules to Joules and add baseline
                cpu_j = diff_uj / 1000000.0
                baseline_j = BASELINE_WATTS * elapsed
                diff_j = cpu_j + baseline_j
                
                # Calculate current active wattage
                current_watts = (diff_uj / (elapsed * 1000000.0)) + BASELINE_WATTS
                last_energy_uj = current_energy_uj
            
            # Update history database
            today_str = datetime.now().strftime("%Y-%m-%d")
            if today_str not in data["history"]:
                data["history"][today_str] = {"joules": 0.0, "seconds": 0.0}
                
            data["history"][today_str]["joules"] += diff_j
            data["history"][today_str]["seconds"] += elapsed
            
            # Maintain persistent data
            data["cumulative_joules"] += diff_j
            data["last_energy_uj"] = last_energy_uj
            
            # Save data and generate HTML report
            save_data(data)
            generate_html(data, current_watts)
            
        except KeyboardInterrupt:
            print("Stopping...")
            break
        except Exception as e:
            print(f"Error in tracking loop: {e}", file=sys.stderr)

if __name__ == "__main__":
    main()
