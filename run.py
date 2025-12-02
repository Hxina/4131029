import subprocess
import sys
import os
import time


def run():
    print("正在启动 4131029...")

    backend_process = subprocess.Popen(
        [
            sys.executable,
            "-m",
            "uvicorn",
            "backend.main:app",
            "--reload",
            "--port",
            "8000",
        ],
        cwd=os.getcwd(),
    )
    print("后端已启动于 http://localhost:8000")

    frontend_process = subprocess.Popen(
        ["npm", "run", "dev"], cwd=os.path.join(os.getcwd(), "frontend"), shell=True
    )
    print("前端已启动于 http://localhost:5173")

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("正在关闭 4131029...")
        backend_process.terminate()
        frontend_process.terminate()


if __name__ == "__main__":
    run()
