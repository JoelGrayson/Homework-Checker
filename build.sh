#!/bin/bash

# ABOUT: Builds for uploading to web store. Ignores certain files

#* || Empty Build Folder (clear or create)
if [[ $(ls -d ../build) == "../build" ]]; then #if exists, delete
    # There is a build folder
    echo There is a build folder
    read -rp "Erase it? (y/n) " confirmation

    if [[ "$confirmation" != "y" ]]
    then
        echo "Will not erase, exiting."
        exit 0
    fi
    
    echo Removing previous build folder
    rm -rf ../build #deletes everything
fi

name="Homework Checker (Schoology)"
dest="../build/$name"

mkdir ../build #fresh empty outer directory
mkdir "$dest"


#* || Copying Files
for file in $(ls -p | grep -v /) #list only files in this directory
do
    echo "Copying file: $file"
    cp "$file" "$dest/$file"
done

#* || Copying Folders
for folder in */ #folders in this directory
do
    if [[ "$folder" == "private/" || "$folder" == "branding/" ]] #ignored folders
    then
        echo "Ignoring $folder"
    else
        echo "Copying folder: $folder"
        cp -R "$folder" "$dest/$folder"
    fi
done

echo "✅ Build Complete"
echo "Compressing..."
tar -zcf "../build/$name.tar.gz" "../build/$name"
echo "✅ Compressing complete"

open "../build"

echo 'display notification "Ready to upload zipped extension to web store" with title "Build.sh"' | osascript