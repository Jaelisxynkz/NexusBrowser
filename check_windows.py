import subprocess
result = subprocess.run(
    ['powershell', '-Command',
     'Get-Process electron | Where-Object { $_.MainWindowTitle -ne "" } | ForEach-Object { "$($_.Id) | $($_.MainWindowTitle)" }'],
    capture_output=True, text=True)
print(result.stdout)
