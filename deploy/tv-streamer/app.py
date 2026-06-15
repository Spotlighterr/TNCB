import os
import subprocess
import time
from flask import Flask, render_template, jsonify, request

app = Flask(__name__)

STREAM_DIR = "/stream"
FFMPEG_PROCESS = None

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/stream/start', methods=['POST'])
def start_stream():
    global FFMPEG_PROCESS
    if FFMPEG_PROCESS and FFMPEG_PROCESS.poll() is None:
        return jsonify({'status': 'running', 'message': 'Stream is already running!'})

    # Ensure stream directory exists and is clean
    os.makedirs(STREAM_DIR, exist_ok=True)
    for f in os.listdir(STREAM_DIR):
        if f.endswith('.m3u8') or f.endswith('.ts'):
            try:
                os.remove(os.path.join(STREAM_DIR, f))
            except:
                pass

    # Command: capture X11 screen + PulseAudio, encode with libx264 (software)
    # Note: VAAPI scale_vaapi requires specific VA profiles not available in this container.
    # libx264 at crf=28 preset=veryfast is still lightweight for 1024x768 screen capture.
    cmd = [
        "ffmpeg", "-y",
        "-f", "x11grab", "-framerate", "24", "-video_size", "1024x768", "-i", ":1",
        "-f", "pulse", "-i", "default",
        "-c:v", "libx264", "-preset", "veryfast", "-crf", "28",
        "-pix_fmt", "yuv420p",
        "-c:a", "aac", "-b:a", "128k",
        "-f", "hls",
        "-hls_time", "2",
        "-hls_list_size", "5",
        "-hls_flags", "delete_segments",
        os.path.join(STREAM_DIR, "live.m3u8")
    ]
    
    try:
        # Redirect stderr to a log file so we can debug errors
        log_file = open(os.path.join(STREAM_DIR, "ffmpeg.log"), "w")
        FFMPEG_PROCESS = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=log_file)
        return jsonify({'status': 'success', 'message': 'Stream started successfully!'})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/stream/stop', methods=['POST'])
def stop_stream():
    global FFMPEG_PROCESS
    if FFMPEG_PROCESS:
        try:
            FFMPEG_PROCESS.terminate()
            FFMPEG_PROCESS.wait(timeout=3)
        except Exception:
            try:
                FFMPEG_PROCESS.kill()
            except:
                pass
        FFMPEG_PROCESS = None
        return jsonify({'status': 'success', 'message': 'Stream stopped.'})
    return jsonify({'status': 'idle', 'message': 'Stream is not running.'})

@app.route('/api/stream/status', methods=['GET'])
def get_status():
    global FFMPEG_PROCESS
    is_running = FFMPEG_PROCESS is not None and FFMPEG_PROCESS.poll() is None
    
    # Read last 10 lines of ffmpeg log if exists
    log_snippet = ""
    log_path = os.path.join(STREAM_DIR, "ffmpeg.log")
    if os.path.exists(log_path):
        try:
            with open(log_path, "r") as f:
                log_snippet = "".join(f.readlines()[-15:])
        except:
            pass
            
    return jsonify({
        'is_running': is_running,
        'log': log_snippet
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3080)
