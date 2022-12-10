#!/bin/bash

# ABOUT: Builds for uploading to web store. Ignores certain files

TEMP_DEST='../build' # temporary destination (has to be outside of this folder because otherwise copying will cause recursive duplicates in build)
name="Homework Checker (Schoology)"
FINAL_DEST="./build/$name" #destination folder (inside this folder)

cd "./alter page/"
gulp prod
cd ..


#* || Empty Build Folder (clear or create)
echo Removing previous build folder
rm -rf "$TEMP_DEST" #deletes everything
rm -rf "$FINAL_DEST"
rm -rf './build'

mkdir './build'
mkdir $TEMP_DEST #fresh empty outer directory
mkdir "$FINAL_DEST"

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

#* || Delete unnecessary files & folders
rm -rf "$TEMP_DEST/alter page/node_modules" "$TEMP_DEST/build"
rm "$TEMP_DEST/alter page/gulpfile.js" "$TEMP_DEST/alter page/package-lock.json" "$TEMP_DEST/alter page/package.json" "$TEMP_DEST/alter page/tsconfig.json" "$TEMP_DEST/alter page/webpack.config.js"

mv "$TEMP_DEST" "$FINAL_DEST"

echo "✅ Build Complete"
# echo "Compressing..."
# tar -czf "$name.tgz" "$FINAL_DEST"
# echo "✅ Compressing complete"
# mkdir "$FINAL_DEST/Unzipped Form"
# mv "$FINAL_DEST"/* "$FINAL_DEST/Unzipped Form"
# mv "$FINAL_DEST/Unzipped Form/$name.tar.gz" "$FINAL_DEST/"
# mv "$name.tgz" "$FINAL_DEST"
open "$FINAL_DEST/.."

echo 'display notification "Ready to upload zipped extension to web store" with title "Build.sh"' | osascript
