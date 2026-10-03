Get-Process electron | Where-Object { $_.MainWindowTitle -ne '' } | ForEach-Object { "$($_.Id) | $($_.MainWindowTitle)" }
