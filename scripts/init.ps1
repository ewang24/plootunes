#Create a symlink to the db file that resides outside the project directory. Electron cannot write to the project directory.
$linkPath = "./plootunes.sqlite"
$targetPath = "C:/Users/User/AppData/Roaming/Electron/plootunes.sqlite"

# Check if the symlink or any file/directory already exists
if ((Test-Path -Path $linkPath -PathType Leaf) -or (Test-Path -Path $linkPath -PathType Container)) {
    Write-Host "Symlink already exists at $linkPath"
} else {
    New-Item -ItemType SymbolicLink -Path $linkPath -Target $targetPath
    Write-Host "Symlink created: $linkPath -> $targetPath"
}