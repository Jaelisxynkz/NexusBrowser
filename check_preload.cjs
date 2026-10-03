import subprocess
result = subprocess.run(['powershell', '-Command', 'Get-Process electron | ForEach-Object { $_.Id.ToString() + " " + $_.MainWindowTitle }'], capture_output=True, text=True)
print(result.stdout)
if result.stderr:
    print("ERR:", result.stderr[:300])
