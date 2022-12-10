#!/bin/bash

# ABOUT: Builds for uploading to web store. Ignores certain files

TEMP_DEST='../build' # temporary destination (has to be outside of this folder because otherwise copying will cause recursive duplicates in build)
FINAL_DEST='./build' #destination folder (inside this folder)

cd "./alter page/"
gulp prod
cd ..


#* || Empty Build Folder (clear or create)
if [[ $(ls -d "$TEMP_DEST") == "$TEMP_DEST" ]]; then #if exists, delete
    # There is a build folder
    echo There is a build folder
    read -rp "Erase it? (y/n) " confirmation

    if [[ "$confirmation" != "y" ]]
    then
        echo "Will not erase, exiting."
        exit 0
    fi
    
    echo Removing previous build folder
    rm -rf "$TEMP_DEST" #deletes everything
    rm -rf "$FINAL_DEST"
fi

mkdir $TEMP_DEST #fresh empty outer directory


#* || Copying Files
for file in $(ls -p | grep -v /) #list only files in this directory
do
    echo "Copying file: $file"
    cp "$file" "$TEMP_DEST/$file"
done

#* || Copying Folders
for folder in */ #folders in this directory
do
    if [[ "$folder" == "private/" || "$folder" == "branding/" ]] #ignored folders
    then
        echo "Ignoring $folder"
    else
        echo "Copying folder: $folder"
        cp -R "$folder" "$TEMP_DEST/$folder"
    fi
done


# Delete unnecessary files & folders
rm -rf "$TEMP_DEST/alter page/node_modules" "$TEMP_DEST/build"
rm "$TEMP_DEST/alter page/gulpfile.js" "$TEMP_DEST/alter page/package-lock.json" "$TEMP_DEST/alter page/package.json" "$TEMP_DEST/alter page/tsconfig.json" "$TEMP_DEST/alter page/webpack.config.js"

mv "$TEMP_DEST" "$FINAL_DEST"

echo "✅ Build Complete"
# echo "Compressing..."
# tar -czf "$TEMP_DEST/$name.tar.gz" "$TEMP_DEST"
# echo "✅ Compressing complete"

open "$FINAL_DEST"

echo 'display notification "Ready to upload zipped extension to web store" with title "Build.sh"' | osascript