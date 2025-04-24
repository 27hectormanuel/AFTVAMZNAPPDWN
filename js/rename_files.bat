@echo off
setlocal enabledelayedexpansion

:: Debugging messages
echo Starting batch script...

:: Set the folder where the files are located
set "folder=C:\Users\RIZALINA\Documents\AFTVAMZNAPPDWN\js"

:: Check if the folder exists
if not exist "%folder%" (
    echo ERROR: Folder "%folder%" does not exist.
    pause
    exit /b
)

:: Navigate to the folder
cd /d "%folder%" || (
    echo ERROR: Failed to navigate to "%folder%".
    pause
    exit /b
)

:: Loop through all JavaScript files and clean or prefix their names
for %%f in (*.js) do (
    echo Processing file: %%f
    set "filename=%%~nf"
    set "extension=%%~xf"

    :: Remove redundant "firetv-" prefixes
    set "cleaned_filename=!filename:firetv-=!

    :: Add "firetv-" prefix if not already present
    if /i not "!cleaned_filename!"=="firetv-!cleaned_filename!" (
        ren "%%f" "firetv-!cleaned_filename!!extension!" || (
            echo ERROR: Could not rename "%%f".
        )
    ) else (
        echo Skipping "%%f" - already prefixed correctly.
    )
)

echo Batch script completed successfully.
pause
