# 搜索当前文件夹里所有文本文件
# 将"123.249.70.216"替换为"localhost"

#!/bin/bash

# 搜索当前文件夹里的所有.vue、.ts和.js文件
files=$(find . -type f \( -name "*.vue" -o -name "*.ts" -o -name "*.js" \))

# 遍历每个文件并进行替换
for file in $files; do
    # 替换文件中的文本内容
    sed -i 's/123\.249\.70\.216/localhost/g' $file
done
