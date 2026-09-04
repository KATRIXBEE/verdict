import subprocess

val = ""
with open('.env.local', 'r', encoding='utf-8') as f:
    for line in f:
        if line.startswith('NEXT_PUBLIC_SUPABASE_ANON_KEY='):
            val = line.split('=', 1)[1].strip().strip('"').strip("'")
            break

if not val:
    print("Error: Could not find NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local")
    exit(1)

print(f"Adding NEXT_PUBLIC_SUPABASE_ANON_KEY (length {len(val)})...")
cmd1 = ['vercel.cmd', 'env', 'add', 'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'production', '--value', val, '--type', 'config', '--force', '--yes']
r1 = subprocess.run(cmd1, capture_output=True, text=True, input="")
print('Prod return code:', r1.returncode)
print('Prod stdout:', r1.stdout.strip())
if r1.stderr:
    print('Prod stderr:', r1.stderr.strip())

cmd2 = ['vercel.cmd', 'env', 'add', 'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'preview', '--value', val, '--type', 'config', '--force', '--yes']
r2 = subprocess.run(cmd2, capture_output=True, text=True, input="")
print('Preview return code:', r2.returncode)
print('Preview stdout:', r2.stdout.strip())
