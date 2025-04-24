@echo off
setlocal enabledelayedexpansion

:: Set the main folder and subfolder
set "mainFolder=C:\Users\RIZALINA\Documents\appstore-apk-downloader-0.2.0"
set "subfolder=js\cs"

:: Step 1: Navigate to subfolder
echo ==============================
echo Step 1: Navigating to subfolder "%subfolder%"...
cd /d "%mainFolder%\%subfolder%" || (
    echo ERROR: Could not navigate to subfolder "%subfolder%". Please verify the path is correct.
    echo Script terminated early.
    pause
    exit /b
)
echo Successfully navigated to "%subfolder%".
pause

:: Step 2: Check for .js files
echo ==============================
echo Step 2: Checking for JavaScript files in "%subfolder%"...
set "jsFilesFound=false"
for %%f in (*.js) do (
    set "jsFilesFound=true"
)

if "!jsFilesFound!"=="false" (
    echo ERROR: No .js files found in subfolder "%subfolder%". Cannot proceed with renaming.
    echo Script terminated early.
    pause
    exit /b
)
echo JavaScript files found. Proceeding to renaming step.
pause

:: Step 3: Renaming files
echo ==============================
echo Step 3: Renaming files...
set "renamedFiles="
set "renameErrors="

for %%f in (*.js) do (
    set "