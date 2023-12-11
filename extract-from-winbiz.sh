#!/bin/bash
winbiz_dat_directory='./WinBiz/DAT'
export_directory='./Export'
one_zip=0 # Folder names are kept as is with the one_zip option
zip_file="$export_directory/winzip_extract.zip"
if [ -f "$zip_file" -a $one_zip -eq 1 ]; then
    echo "File exists: $zip_file"
    exit
fi
for folder in "$winbiz_dat_directory"/*; do
    if [ -d "$folder" ]; then
        folder_name=$(basename "$folder")'_'$(cat "$folder/dos_info.dbf" | iconv -c --from-code=MS-ANSI --to-code=UTF-8 | sed -n 's/^[^\r]*\r.\{10\}\(.\{100\}\).*/\1/p' | tr --delete '/' | awk '{$1=$1;print}')
        if [ ! $one_zip -eq 1 ]; then
            zip_file="$export_directory/$folder_name.zip"
            if [ -f "$zip_file" ]; then
                echo "File exists: $zip_file"
                continue
            fi
        fi
        zip --quiet --recurse-paths "$zip_file" "$folder/dos_info.dbf" "$folder/"*/ecriture.dbf "$folder/"*/plan.dbf
        echo "Handled: $folder"
    fi
done
