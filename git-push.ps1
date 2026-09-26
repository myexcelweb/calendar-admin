# Commits and pushes this folder, wherever it is on disk
Set-Location $PSScriptRoot

git add .

git commit -m "Update admin website"

git push

Read-Host "Press Enter to close"
