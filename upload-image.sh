###
 # @Date: 2022-04-13 19:52:43
 # @Author: Kinsiy
 # @LastEditors: Kinsiy
 # @LastEditTime: 2022-04-14 01:05:58
 # @FilePath: \picBed\upload-image.sh
### 
#!/bin/bash

result=()

function upload() {
# 上传文件
    t=$(curl -X POST -s -F "file=@$1"  http://192.168.123.54:7070/upload)
    result=(${result[@]} "${t}")
}
while [ $# -gt 0 ]; do
    upload "$1" $index
    shift
done
# 输出格式
echo "Upload Success:"
for i in ${result[*]}; do
echo $i;
done

