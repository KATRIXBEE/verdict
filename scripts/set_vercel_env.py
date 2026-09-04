import subprocess
import os

env_path = ".env.local"
if not os.path.exists(env_path):
    print("ERROR: .env.local not found")
    exit(1)

vars_dict = {}
with open(env_path, "r", encoding="utf-8") as f:
    for line in f:
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        if "=" in line:
            k, v = line.split("=", 1)
            k = k.strip()
            v = v.strip().strip('"').strip("'")
            if k and v and v not in ("PASTE_HERE", "your_key_here", "VERCEL_OIDC_TOKEN"):
                vars_dict[k] = v

vars_dict["NEXTAUTH_URL"] = "https://verdict.vercel.app"
vars_dict["NEXT_PUBLIC_APP_URL"] = "https://verdict.vercel.app"
vars_dict["NODE_ENV"] = "production"

print(f"Syncing {len(vars_dict)} environment variables to Vercel production...")

for k, v in vars_dict.items():
    print(f"Setting: {k}")
    # Add to production
    cmd = ["vercel.cmd", "env", "add", k, "production", "--value", v, "--force", "--yes"]
    res = subprocess.run(cmd, capture_output=True, text=True, input="")
    if res.returncode != 0 and "Already exists" not in res.stderr and "Already exists" not in res.stdout:
        print(f"  Prod result: {res.stderr.strip() or res.stdout.strip()}")
    
    # Add to preview
    cmd_prev = ["vercel.cmd", "env", "add", k, "preview", "--value", v, "--force", "--yes"]
    res_prev = subprocess.run(cmd_prev, capture_output=True, text=True, input="")

print("Done syncing environment variables!")
